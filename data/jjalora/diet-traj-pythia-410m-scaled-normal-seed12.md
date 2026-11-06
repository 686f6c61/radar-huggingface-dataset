# jjalora/diet-traj-pythia-410m-scaled-normal-seed12

## Resumen

`jjalora/diet-traj-pythia-410m-scaled-normal-seed12` es un checkpoint de investigación que reproduce el entrenamiento desde cero de Pythia-410M dentro de la campaña DIET, un experimento sobre trayectorias de entrenamiento en el espacio de pesos. Lo publica el usuario `jjalora` y emplea exactamente la receta abierta de EleutherAI (`models/410M/pythia-410m.yml`): misma arquitectura, mismo flujo de tokens y mismo orden de datos (`EleutherAI/pile-standard-pythia-preshuffled`), con AdamW, decaimiento coseno y 143.000 pasos. La única diferencia respecto a Pythia-410M es la semilla y el esquema de inicialización de pesos, en este caso `scaled_normal`.

El modelo no es un asistente conversacional ni un modelo de propósito general: es una pieza de un estudio comparativo de trayectorias de entrenamiento, pensado para analizar cómo influye la inicialización en el resultado final cuando todo lo demás (datos, hiperparámetros, arquitectura) permanece constante. Por eso su valor está en la reproducibilidad experimental, no en el rendimiento de tareas.

La relevancia actual es metodológica: permite a investigadores estudiar la dinámica de entrenamiento y la estructura del espacio de pesos con un modelo pequeño (410M parámetros) y un dataset público, sobre hardware conocido (H100-SXM5-80GB). El repositorio es grande (921,8 GB) porque incluye múltiples checkpoints intermedios en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 410M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Pythia-410M: 2048 tokens, segun la receta citada) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` y `main` |

## Arquitectura y entrenamiento

El modelo usa la arquitectura GPT-NeoX de Pythia-410M: transformer decoder-only con atención causal estándar. El entrenamiento sigue la receta oficial de EleutherAI: AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 (sin decaimiento en LayerNorm ni sesgos), gradient clipping 1,0, schedule coseno de 3e-4 a 3e-5 durante 143.000 pasos, 1.430 pasos de warmup y autocast fp16 con pesos maestros en fp32. El batch global es de 1024 secuencias de 2048 tokens, independientemente del número de GPUs.

Los datos son el flujo preshuffled de The Pile (`EleutherAI/pile-standard-pythia-preshuffled`), con el batch *i* correspondiente a las filas [i·1024, (i+1)·1024), de modo que la secuencia de tokens es idéntica a la de Pythia-410M. La innovación del experimento es el esquema de inicialización `scaled_normal`, distinto del `small_init + wang_init` que usa Pythia por defecto; el autor documenta otros esquemas en `src/init_schemes.py`. La reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero se verifica que la distribución por tensor coincide con la revisión `step0` de `EleutherAI/pythia-410m` mediante `tests/test_pythia_step0_init_match.py`. La campaña se ejecutó en 4 nodos de 1 GPU H100-SXM5-80GB con micro-batch 16.

## Capacidades

- Generación de texto autoregresiva en inglés, con el mismo comportamiento base que Pythia-410M.
- Razonamiento y conocimiento factual limitados por el tamaño (410M parámetros) y por el corpus (The Pile).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: [en]`).
- No dispone de modo thinking, visión ni audio.
- Utilidad principal como objeto de estudio: checkpoints intermedios en las ramas `stepN` (0, 1, 2, 4, …, 512 y cada 100 pasos) para analizar trayectorias de entrenamiento.

## Casos de uso

- Investigación sobre inicialización de pesos: comparar esta ejecución (`scaled_normal`, seed 12) con otras semillas y esquemas de la campaña DIET para medir el efecto de la inicialización en las métricas finales, manteniendo fijos datos e hiperparámetros.
- Estudio de trayectorias de entrenamiento en el espacio de pesos: las ramas `stepN` permiten reconstruir la evolución de los pesos paso a paso y aplicar análisis de geometría (distancias entre checkpoints, interpolación lineal, mode connectivity).
- Reproducibilidad de recetas: sirve como referencia para validar pipelines de entrenamiento propios contra una receta pública y bien documentada (Pythia-410M) sobre The Pile.
- Análisis de dinámica de optimización: con checkpoints cada 100 pasos y en potencias de dos, se pueden estudiar curvas de pérdida, normas de gradiente y cambios de régimen durante el decaimiento coseno.
- Docencia y formación: modelo pequeño y con licencia Apache 2.0 que cabe en una GPU consumer para experimentos de fine-tuning y evaluación de técnicas de entrenamiento.
- Baseline en estudios de alineación y sesgo: al compartir datos y arquitectura con Pythia, permite aislar el efecto de la inicialización en comportamientos observados, sin introducir variables adicionales.
- Evaluación comparativa de checkpoints: usar `main` como punto final y las ramas intermedias para medir cómo evoluciona el rendimiento en benchmarks a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB en fp16 para los 410M parámetros, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; H100-SXM5-80GB fue el hardware de entrenamiento, pero no es necesario para inferencia.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad con GPT-NeoX, también llama.cpp, Ollama y vLLM si se convierten los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 921,8 GB por los múltiples checkpoints; para inferencia basta con descargar una sola rama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| diet-traj-pythia-410m-scaled-normal-seed12 | 410M | no disponible (heredado 2048) | Apache 2.0 | Hugging Face | Checkpoint de investigación con ramas `stepN` |
| EleutherAI/pythia-410m | 410M | 2048 | Apache 2.0 | Hugging Face | Modelo de referencia con la receta original |
| EleutherAI/pythia-160m | 160M | 2048 | Apache 2.0 | Hugging Face | Variante más pequeña de la misma familia |
| EleutherAI/pythia-1.4b | 1.4B | 2048 | Apache 2.0 | Hugging Face | Variante mayor de la misma familia |

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo alto de alucinación en tareas de conocimiento, coherente con su tamaño (410M) y con el corpus de entrenamiento.
- Solo inglés: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto limitado (heredado de Pythia-410M, 2048 tokens según la receta); no apto para documentos largos.
- El repositorio completo ocupa 921,8 GB; hay que seleccionar la rama concreta para evitar descargas masivas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para producción y carece de garantías de calidad.
- La reproducibilidad bit a bit de la inicialización no es posible entre frameworks; el autor solo verifica la coincidencia de distribución por tensor.
- El campo `git_commit` del `campaign.json` figura como `"unknown"`, lo que limita la trazabilidad exacta del código de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed12
- Receta de referencia: https://github.com/EleutherAI/pythia (archivo `models/410M/pythia-410m.yml`)
- Dataset: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
