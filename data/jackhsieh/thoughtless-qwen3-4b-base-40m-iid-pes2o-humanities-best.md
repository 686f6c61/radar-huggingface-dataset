# JackHsieh/Thoughtless.Qwen3-4B-Base.40M-iid.peS2o-humanities.best

## Resumen

Thoughtless.Qwen3-4B-Base.40M-iid.peS2o-humanities.best es un punto de control de Qwen3-4B-Base sometido a preentrenamiento continuado (continued pretraining) mediante predicción simple del siguiente token, sin mecanismos de razonamiento explícito ("thoughtless"). Lo publica JackHsieh como parte de un barrido experimental denominado "prestar", orientado a estudiar el efecto de la tasa de aprendizaje y la proporción de datos de repetición (replay) sobre el olvido catastrófico durante el preentrenamiento continuado.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Base, con 4.022.468.096 parámetros totales, y se ajusta sobre una ventana i.i.d. de 40 millones de tokens del corpus peS2o-humanities (documentos académicos de humanidades de 4096 tokens), mezclada con un 25 % de datos de replay procedentes de DCLM para mitigar la degradación de capacidades generales.

Su relevancia es fundamentalmente metodológica: no es un modelo de propósito general listo para producción, sino una celda experimental reproducible (con hiperparámetros, semilla, configuración de sistema y traza de wandb documentados) que sirve para estudiar dinámicas de preentrenamiento continuado sobre dominios especializados. La pérdida final de validación es de 2,39189 nats/token sobre el split de test de 20 millones de tokens del propio corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (longitud de documento usada en el entrenamiento); contexto nativo de Qwen3-4B-Base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos exportados en fp32 sin casting; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra en fp32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen/Qwen3-4B-Base, sin modificaciones estructurales: el proceso aplicado es un preentrenamiento continuado con predicción estándar del siguiente token, sin fases de razonamiento explícito ni datos de "thoughts". El entrenamiento se realiza sobre `train[:9728]` del dataset `JackHsieh/peS2o-humanities-160M-20M-iid`, compuesto por documentos de 4096 tokens, con un 25 % de datos de replay procedentes de `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenación aleatoria del orden principal en cada época.

La optimización emplea AdamW con tasa de aprendizaje 3e-06 (betas 0,9/0,95, epsilon 1e-08, weight decay 0,01), schedule coseno con 5 % de warmup hasta 0, recorte de gradiente de 1,0, tamaño de lote de 32 documentos, 2 épocas (812 pasos) y semilla 0. La infraestructura es FSDP2 con sharding completo, pesos maestros en fp32, cómputo en bf16 y flash-attention-2 sobre 4 GPU H100. El checkpoint publicado corresponde a la mejor celda del barrido tasa de aprendizaje × replay, seleccionada por pérdida de validación final y reejecutada con checkpoint final.

## Capacidades

- Generación de texto autoregresiva mediante predicción del siguiente token, sin modo de razonamiento ni trazas de pensamiento.
- Modelado de lenguaje especializado en texto académico del ámbito de humanidades (peS2o-humanities).
- Capacidades generales heredadas de Qwen3-4B-Base, potencialmente degradadas por el ajuste de dominio; no se documenta una evaluación específica de retención.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se entrena explícitamente sin "thoughts".
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en preentrenamiento continuado: el modelo sirve como celda reproducible para estudiar el efecto de la tasa de aprendizaje y la proporción de replay sobre la pérdida de validación en dominios especializados, con hiperparámetros y traza de wandb públicos.
- Estudio del olvido catastrófico: al partir de Qwen3-4B-Base y ajustar sobre un corpus de humanidades con replay del 25 %, permite medir la degradación de capacidades generales frente a la ganancia en el dominio.
- Modelado de lenguaje académico en humanidades: útil como base para tareas de continuación de texto, perplejidad y evaluación intrínseca sobre literatura científica de humanidades.
- Reproducción experimental: la configuración completa (FSDP2, 4×H100, 812 pasos, semilla 0) permite replicar el entrenamiento y comparar variantes del barrido.
- Punto de partida para ajuste supervisado posterior: al conservar la arquitectura de Qwen3-4B-Base y pesos en fp32, puede servir de inicialización para fine-tuning en tareas concretas del dominio.
- Evaluación de metodologías "thoughtless": útil para comparar, en igualdad de condiciones, un preentrenamiento sin datos de razonamiento frente a variantes con pensamientos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de validación final sobre el split de test de 20 millones de tokens del corpus: 2,39189 nats/token (celda del barrido: 2,39188).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4,02 mil millones de parámetros × 4 bytes), más overhead de activaciones y caché KV; en la práctica, 20-24 GB o más según longitud de secuencia y lote.
- VRAM estimada en bf16/fp16: unos 8 GB para pesos, más activaciones y caché KV; alrededor de 12-16 GB en configuraciones habituales.
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento (el autor usa 4×H100 con FSDP2); para inferencia, RTX 4090 (24 GB) o A100 40/80 GB son suficientes en fp32 o bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB de VRAM en bf16; en fp32 requiere 24 GB o más.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors compatible con la arquitectura Qwen3, es desplegable con vLLM, TGI o transformers, y potencialmente convertible a GGUF para llama.cpp/Ollama (no verificado en la información proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.40M-iid.peS2o-humanities.best | 4,02 B | 4096 (entrenamiento) | Preentrenamiento continuado sin razonamiento sobre humanidades | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base | 4,02 B | No disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | Hugging Face |
| Variantes del barrido "prestar" de JackHsieh | 4,02 B | 4096 (entrenamiento) | Distintas tasas de aprendizaje y proporciones de replay | Apache 2.0 | Hugging Face (según autor) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está ajustado para instrucciones, diálogo ni uso en producción; carece de fases de alineación (RLHF/DPO) documentadas.
- Entrenado sin datos de razonamiento ("thoughtless"), por lo que no debe esperarse comportamiento de cadena de pensamiento ni razonamiento multi-paso robusto.
- Riesgo de olvido catastrófico: el ajuste sobre un corpus de humanidades de 40 M de tokens, aun con 25 % de replay, puede degradar capacidades generales de Qwen3-4B-Base; no se documenta una evaluación de retención.
- Riesgo de alucinación inherente a un modelo base sin alineación.
- Sesgos: no documentados por el autor; el corpus peS2o-humanities puede introducir sesgos propios del ámbito académico de humanidades.
- Idiomas soportados no especificados; el corpus de entrenamiento es presumiblemente en inglés, lo que puede limitar el rendimiento en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está validado para ello y hereda las condiciones del modelo base Qwen3-4B-Base.
- Pesos exportados en fp32 sin casting: el repositorio ocupa 16,1 GB, lo que encarece el almacenamiento y la descarga frente a una exportación en bf16.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso independientes.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.40M-iid.peS2o-humanities.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/peS2o-humanities-160M-20M-iid
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Traza de wandb: https://wandb.ai/latent-thoughts/prestar/runs/n0qumxfq
