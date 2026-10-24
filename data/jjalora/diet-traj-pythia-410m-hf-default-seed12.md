# jjalora/diet-traj-pythia-410m-hf-default-seed12

## Resumen

`jjalora/diet-traj-pythia-410m-hf-default-seed12` es un checkpoint de investigación, no un modelo de propósito general: se trata de una ejecución de preentrenamiento desde cero de Pythia-410M realizada dentro de la campaña de espacio de pesos denominada DIET. El autor reproduce la receta abierta de EleutherAI (`models/410M/pythia-410m.yml`): misma arquitectura GPT-NeoX, mismo flujo de tokens y mismo orden del dataset `EleutherAI/pile-standard-pythia-preshuffled`, con idénticos hiperparámetros de optimización. La única diferencia declarada respecto al run original es la semilla aleatoria (12) y el esquema de inicialización de pesos (`hf_default`).

El interés del artefacto es metodológico: al mantener constante todo salvo la semilla y la inicialización, sirve como punto de una trayectoria en el espacio de pesos para estudiar cómo varía el resultado del entrenamiento según esas dos condiciones. El repositorio publica checkpoints intermedios en ramas `stepN` (pasos 0, 1, 2, 4, … 512 y, además, cada 100 pasos), con pesos en safetensors float16, lo que permite analizar la evolución del modelo a lo largo del entrenamiento.

Es relevante ahora porque la comunidad de interpretabilidad y de investigación sobre dinámica de entrenamiento necesita réplicas controladas de recetas abiertas con checkpoints densos. Ahora bien, conviene subrayar que es un modelo base de 410 M de parámetros, entrenado solo en inglés, sin ajuste por instrucciones ni RLHF, y que el repositorio puede contener únicamente checkpoints parciales mientras la ejecución siga en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only autoregresivo), receta `EleutherAI/pythia` `models/410M/pythia-410m.yml` |
| Parametros totales | 410 M (Pythia-410M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de la receta: 1.024 secuencias × 2.048 tokens por lote global) |
| Tipos de cuantizacion | no disponible: solo se publican pesos en float16; no hay versiones cuantizadas oficiales (convertibles a posteriori con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float16, pesos únicamente, una rama `stepN` por checkpoint; `main` con los pesos finales cuando termine la ejecución |
| Esquema de inicializacion | `hf_default` (el run original de Pythia usa `small_init` + `wang_init` de GPT-NeoX) |
| Semilla | 12 |
| Dataset de entrenamiento | `EleutherAI/pile-standard-pythia-preshuffled` (lote *i* = filas [i·1024, (i+1)·1024)) |
| Pasos de entrenamiento | 143.000 pasos planificados, 1.430 de warmup, cosine hasta 3e-5 |
| Tamano del repositorio | 47,0 GB (incluye todos los checkpoints) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only de la familia GPT-NeoX, con atención causal estándar y embeddings posicionales rotatorios, ejecutado con la configuración exacta del fichero de receta de EleutherAI. El entrenamiento usa AdamW con lr 3e-4, betas (0,9; 0,95), weight decay 0,1 (sin decaimiento en LayerNorm ni sesgos), recorte de gradiente 1,0 y scheduler cosine hasta 3e-5 a lo largo de 143.000 pasos, con 1.430 pasos de warmup. Se emplea autocast fp16 con pesos maestros en fp32 y un lote global de 1.024 × 2.048 tokens independientemente del número de GPUs. La ejecución registrada en `campaign.json` usó 4 × H100-SXM5-80GB en un nodo del clúster `makau`, con micro-lote de 16, y arrancó el 2026-10-23.

La innovación aquí no está en el modelo sino en el protocolo experimental: la campaña DIET entrena múltiples runs desde cero variando exclusivamente la semilla y el esquema de inicialización, manteniendo fijo el flujo de datos (mismo orden de tokens del Pile prebarajado) y todos los hiperparámetros. El autor advierte de que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks; el esquema `pythia` se valida contra la distribución por tensor de `EleutherAI/pythia-410m` revisión `step0` en `tests/test_pythia_step0_init_match.py`. No se documentan en la información disponible fases de RLHF, DPO ni ajuste instructivo: es preentrenamiento puro sobre el Pile.

## Capacidades

- Modelado de lenguaje causal (predicción del siguiente token) en inglés, como modelo base sin ajuste por instrucciones.
- Generación de texto libre y continuación de documentos con 2.048 tokens de contexto.
- Proporciona checkpoints intermedios densos (pasos 0, 1, 2, 4, … 512 y cada 100 pasos), lo que habilita análisis longitudinal del aprendizaje.
- Capacidad de servir como punto de partida para fine-tuning supervisado o LoRA en tareas en inglés.
- No soporta tool calling ni function calling de forma nativa: no hay plantilla de chat ni entrenamiento orientado a agentes.
- No incluye modo thinking, visión, audio ni multilingüismo; el vocabulario y los datos son del Pile en inglés.
- Utilizable como sujeto de experimentos de interpretabilidad, memorización, merging y análisis del espacio de pesos.

## Casos de uso

- Estudio de trayectorias de entrenamiento: cargar las ramas `stepN` y medir la evolución de métricas internas (normas de pesos, espectros de activaciones, probing lineal) en intervalos de 100 pasos y en los primeros 512 pasos con resolución exponencial.
- Análisis de sensibilidad a la semilla y a la inicialización: comparar este run (seed 12, `hf_default`) con otras ejecuciones de la campaña DIET para cuantificar la varianza inducida por el RNG en el resultado final.
- Investigación en espacio de pesos: usar los checkpoints como puntos de partida para model merging, interpolación lineal, model soups o permutación de neuronas, aprovechando que la receta de datos es idéntica entre runs.
- Reproducción y auditoría de recetas: verificar que la implementación propia de la receta Pythia (optimizador, scheduler, orden del flujo de tokens) converge de forma comparable a este artefacto de referencia.
- Fine-tuning de bajo coste para prototipado: adaptar el modelo con LoRA en una única GPU consumer para tareas de clasificación o generación en inglés antes de escalar a modelos mayores.
- Docencia y formación técnica: ilustrar en un curso cómo cambia un LLM durante el preentrenamiento usando checkpoints intermedios de 410 M, que caben en hardware asequible.
- Validación de pipelines de evaluación y despliegue: probar harnesses de evaluación, servidores de inferencia (vLLM, TGI) o conversiones a GGUF con un modelo pequeño antes de aplicarlos a modelos de mayor tamaño.
- Experimentos de memorización y privacidad: analizar qué secuencias del Pile se memorizan y en qué punto del entrenamiento aparece la memorización, dado el acceso a checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones (MMLU, HumanEval, GSM8K, LAMBADA ni ninguna otra) para este run, y no se dispone de métricas de pérdida final porque el estado de la ejecución no está confirmado en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,9-2 GB en fp16 (unos 0,82 GB solo de pesos, más caché KV y activaciones para lotes pequeños); aproximadamente 0,5 GB en int8 y 0,3 GB en int4 tras cuantización, estimaciones derivadas del recuento de 410 M de parámetros.
- GPU recomendadas: cualquier GPU con 8 GB o más sirve para fp16; A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento (el run original usó 4 × H100-SXM5-80GB).
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en iGPU o CPU para lotes pequeños.
- Almacenamiento: el repositorio completo ocupa 47,0 GB por la acumulación de checkpoints; para uso normal conviene descargar solo una rama `stepN` concreta (`revision="stepN"`).
- Opciones de despliegue: `transformers` (librería declarada), vLLM o TGI para serving, llama.cpp/Ollama tras conversión a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Proposito | Licencia |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-hf-default-seed12` | 410 M | 2.048 tokens | Pile prebarajado, orden fijo, seed 12, init `hf_default` | Réplica controlada para estudiar trayectorias en el espacio de pesos | Apache 2.0 |
| `EleutherAI/pythia-410m` | 410 M | 2.048 tokens | Pile, deduplicación estándar | Modelo de referencia de la suite Pythia | Apache 2.0 |
| `EleutherAI/pythia-410m-deduped` | 410 M | 2.048 tokens | Pile deduplicado globalmente | Variante de la suite para estudiar el efecto de la deduplicación | Apache 2.0 |

No se dispone en la información proporcionada de datos de rendimiento que permitan comparar calidad entre estas tres variantes; la diferencia documentada es de procedimiento de entrenamiento (semilla, inicialización y flujo de datos), no de arquitectura ni de tamaño.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene formato de chat y no debe usarse directamente en producción como asistente.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas será deficiente.
- Riesgo alto de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 410 M sin ajuste.
- Sesgos heredados del Pile, que recoge texto web, código, papers y foros sin filtrado específico de toxicidad o sesgo.
- Estado del run incierto: el repositorio se creó un día después del inicio registrado (`2026-10-23 20:39:21`) y la model card indica que `main` contendrá los pesos finales solo cuando la ejecución termine; verificar la rama antes de asumir un modelo completamente entrenado.
- Reproducibilidad limitada: el propio autor señala que la reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks y que el campo `git_commit` de la procedencia figura como `unknown`.
- No hay versiones cuantizadas oficiales ni resultados de evaluación publicados para este run concreto.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluación de calidad, el uso comercial no está respaldado por evidencias de rendimiento.
- El tamaño del repositorio (47 GB) puede agotar cuotas de disco si se clona completo en lugar de descargar una rama concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-hf-default-seed12
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- Revisión inicial de referencia: https://huggingface.co/EleutherAI/pythia-410m-v0/tree/main
- Repositorio del proyecto Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Ficha de terceros sobre Pythia-410M: https://dev.co/ai/llms/pythia-410m
- Ficha de terceros en el proyecto whatmodel: https://github.com/jakemanger/whatmodel/blob/main/pages/model/pythia-410m.md
- Paper de referencia: "Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling", citado en el repositorio de GitHub de EleutherAI (no se ha proporcionado el enlace directo en la información disponible).
