# jjalora/diet-traj-pythia-410m-pythia-seed11

## Resumen

`diet-traj-pythia-410m-pythia-seed11` es un checkpoint de investigación publicado por el usuario `jjalora` dentro de la campaña DIET (weight-space), cuyo objetivo es estudiar trayectorias de entrenamiento en el espacio de pesos. Se trata de un preentrenamiento desde cero de la arquitectura Pythia-410M de EleutherAI, replicando exactamente la receta oficial (`models/410M/pythia-410m.yml`) sobre el mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`, batch *i* = filas [i·1024, (i+1)·1024)).

El modelo emplea una arquitectura transformer decoder-only de tipo GPT-NeoX (`gpt_neox` en Transformers) con 405.334.016 parámetros reales según los pesos en safetensors. La única diferencia respecto al Pythia-410M canónico es la semilla aleatoria (seed 11) y el esquema de inicialización (el esquema `pythia`, que combina `small_init` y `wang_init` de GPT-NeoX). No es un modelo pensado para producción, sino una pieza de un conjunto de réplicas que permite comparar cómo divergen o convergen distintas ejecuciones de entrenamiento.

Su relevancia es metodológica: al mantener constante todo salvo la semilla y la inicialización, sirve como material para investigar la estabilidad del entrenamiento, la reproducibilidad, la geometría del espacio de pesos y las diferencias entre trayectorias. El repositorio es inusualmente grande (1167,4 GB) porque incluye múltiples ramas `stepN` con checkpoints intermedios, no solo los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `gpt_neox` (GPT-NeoX) |
| Parametros totales | 405.334.016 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Pythia-410M usa 2048 tokens en su configuracion canonica) |
| Tipos de cuantizacion | Pesos publicados en float16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), ramas `stepN` con pesos y `main` con los pesos finales |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only de tipo GPT-NeoX con atención causal estándar (no se documentan variantes de atención lineal ni SSM). El entrenamiento replica la receta abierta de EleutherAI: AdamW con lr 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clipping 1.0, scheduler coseno hasta 3e-5 a lo largo de 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros fp32 y batch global de 1024 × 2048 tokens independientemente del número de GPUs.

Los datos provienen de `EleutherAI/pile-standard-pythia-preshuffled`, con un orden de tokens fijo y determinista (batch *i* = filas [i·1024, (i+1)·1024]), lo que garantiza que todas las réplicas de la campaña ven exactamente la misma secuencia. La inicialización usa el esquema `pythia` (small_init + wang_init de GPT-NeoX); el autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero se verifica que la distribución por tensor coincide con la revisión `step0` de `EleutherAI/pythia-410m` mediante el test `tests/test_pythia_step0_init_match.py`. La procedencia registrada en `campaign.json` indica 8 nodos con 4 A100-PCIE-40GB cada uno, micro-batch 4, commit `06ae800` y arranque el 2026-10-23.

## Capacidades

- Generación de texto autoregresiva en inglés, con el nivel de calidad esperable de un Pythia-410M entrenado con la receta oficial.
- Razonamiento básico y respuesta a instrucciones limitada: el modelo es una base preentrenada, no un modelo ajustado con SFT/RLHF/DPO.
- Capacidades de código y matemáticas emergentes propias de un modelo de 410M parámetros, sin garantías de robustez.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Multilingüismo limitado al inglés (idioma declarado en la model card).
- No dispone de modo thinking, visión ni audio.
- Valor específico como artefacto de investigación: checkpoints intermedios en ramas `stepN` para estudiar la evolución del entrenamiento.

## Casos de uso

- Estudio de trayectorias de entrenamiento: comparar este run (seed 11) con otras réplicas de la campaña DIET para medir divergencia en el espacio de pesos paso a paso usando las ramas `stepN`.
- Análisis de reproducibilidad: verificar si la receta Pythia produce resultados equivalentes bajo distintas semillas e inicializaciones, aislando el efecto de la aleatoriedad.
- Investigación sobre inicialización: contrastar el esquema `pythia` con otros esquemas documentados en `src/init_schemes.py` del código de entrenamiento.
- Experimentos de weight-space: estudiar interpolación de pesos, linear mode connectivity o simetrías entre checkpoints de la misma arquitectura.
- Baseline controlado para fine-tuning: al ser una réplica limpia de Pythia-410M, sirve como referencia en experimentos que necesitan un modelo con procedencia y receta totalmente documentadas.
- Docencia y divulgación: ilustrar cómo se construye un modelo de lenguaje desde cero con una receta abierta y hardware concreto (A100-40GB en 8 nodos).
- Evaluación de infraestructura: usar los checkpoints intermedios para probar pipelines de carga, conversión y evaluación a distintas escalas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en fp16 para los 405M parámetros, más overhead de activaciones y caché KV; en torno a 0,4-0,5 GB en cuantización de 8 bits y 0,25-0,3 GB en 4 bits (estimaciones a partir del recuento de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU con llama.cpp/Ollama si se convierte a GGUF.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); conversión a GGUF para llama.cpp/Ollama no documentada pero viable por arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de almacenamiento: el repo ocupa 1167,4 GB por las múltiples ramas `stepN`; clonar solo `main` o una rama concreta reduce drásticamente el espacio necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-pythia-seed11` | 405M | No disponible | Apache 2.0 | Hugging Face, repo de 1167,4 GB con ramas `stepN` | Réplica de investigación con seed 11 |
| `EleutherAI/pythia-410m` | 410M | 2048 | Apache 2.0 | Hugging Face | Modelo de referencia con la misma receta |
| `EleutherAI/pythia-410m-deduped` | 410M | 2048 | Apache 2.0 | Hugging Face | Variante con deduplicación del Pile |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1,1B | 2048 | Apache 2.0 | Hugging Face | Mayor tamaño, ajustado para chat |

## Limitaciones y advertencias

- Es un modelo base preentrenado, no ajustado con instrucciones: no debe usarse directamente como asistente conversacional sin fine-tuning.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, especialmente en un modelo de 410M parámetros.
- Sesgos heredados del Pile, con sobrerrepresentación de texto en inglés y de fuentes web; no se documenta ninguna mitigación.
- Idioma limitado al inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada en la información disponible; asumir la configuración canónica de Pythia (2048 tokens) con cautela.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de seguridad ni benchmarks publicados, no es recomendable para producción.
- El tamaño del repositorio (1167,4 GB) puede provocar descargas accidentales masivas; conviene clonar selectivamente.
- La reproducibilidad bit a bit de la inicialización respecto a EleutherAI no está garantizada, según el propio autor.
- No hay datos de evaluación que permitan comparar su calidad con el Pythia-410M original.

## Enlaces

- Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-pythia-seed11
- Receta de referencia Pythia: https://github.com/EleutherAI/pythia (`models/410M/pythia-410m.yml`)
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Código de entrenamiento (referenciado en la model card): `src/init_schemes.py` y `tests/test_pythia_step0_init_match.py` del repositorio del autor (no se proporciona URL directa en la información disponible)
