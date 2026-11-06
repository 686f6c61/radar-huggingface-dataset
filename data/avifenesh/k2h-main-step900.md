# Avifenesh/k2h-main-step900

## Resumen

k2h-main-step900 es un checkpoint intermedio de investigación publicado por el usuario Avifenesh sobre el modelo base IFM/K2-Horizon-MoVA-36B-A4B. Se trata del paso 900 de un plan de continued-pretraining de 7.391 pasos que se detuvo deliberadamente porque las habilidades generales del modelo estaban degradándose. No es una versión candidata para producción: el propio autor lo describe como un checkpoint de investigación que debe compararse con la release del modelo base, no de forma aislada.

El modelo conserva la arquitectura del base: un transformer de mezcla de expertos (MoE) con 36B parámetros totales (37.444.792.020 según los pesos en safetensors) y aproximadamente 4B parámetros activos por token. El entrenamiento se centró en datos de dominio (código, commits, pull requests y papers) con replay web y sintético, lo que produjo una mejora notable en tareas de código y en la verosimilitud sobre pull requests retenidos, a costa de un deterioro en tareas de razonamiento general e instrucciones.

Su relevancia es fundamentalmente metodológica: documenta con detalle el compromiso entre especialización en dominio y olvido catastrófico en un MoE de 36B, y publica tanto el corpus limpio como el estado completo de entrenamiento (incluido el optimizador) para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), código de modelado personalizado |
| Parametros totales | 37.444.792.020 (≈36B nominales) |
| Parametros activos | Aproximadamente 4B por token (según nomenclatura A4B del base) |
| Longitud de contexto | 32.768 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 4B parámetros de los 36B totales por token. Mantiene la misma arquitectura, tokenizer y plantilla de chat que IFM/K2-Horizon-MoVA-36B-A4B; el código de modelado personalizado se distribuye junto con los pesos, por lo que la carga exige `trust_remote_code=True`. Los pesos se publican en bf16 safetensors.

El entrenamiento consistió en 900 pasos de un plan de 7.391, con longitud de secuencia de 32.768 tokens, aproximadamente 786.000 tokens por paso y unos 0,71B tokens en total. Se usó el trainer xLLM con FSDP2 en bf16 sobre 3 GPUs, optimizador AdamW (beta1 0,9, beta2 0,95, weight decay 0,06, gradient clip 1,0), learning rate 1,5e-5, 100 pasos de warmup y un schedule warmup-stable-decay que se detuvo en la fase estable. La mezcla de datos combinó código de dominio, commits, pull requests y papers antes de la pasada de verificación, junto con replay sintético y web, una porción de matemáticas y una pequeña cuota de instrucciones de TxT360. Las porciones limpias de código y commits están publicadas en Avifenesh/k2h-corpus-domain-clean y el replay web en Avifenesh/k2h-sources-unverified.

## Capacidades

- Generación de texto conversacional con la plantilla de chat del modelo base.
- Generación y razonamiento sobre código: el checkpoint mejora de forma clara en HumanEval y MBPP respecto a la release.
- Modelado de código de dominio específico: la NLL sobre pull requests retenidos cae de 1,519 a 1,173, lo que indica buena adaptación al estilo de commits y PRs.
- Razonamiento matemático básico (GSM8K), aunque degradado respecto al base (84,6 frente a 90,1 en 5-shot estricto).
- Seguimiento de instrucciones (IFEval), también degradado de forma notable (71,2 frente a 84,3 en prompt-strict con razonamiento activado).
- Modo de razonamiento (reasoning on) heredado del base, empleado en las evaluaciones de IFEval y GSM8K en formato chat.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre olvido catastrófico: sirve como punto de comparación controlado frente a la release del base para medir cuánto se degradan GSM8K, IFEval, MMLU y ARC-Challenge tras 0,71B tokens de continued-pretraining especializado.
- Estudio de mezclas de datos: junto con los datasets k2h-corpus-domain-clean y k2h-sources-unverified, permite reproducir y analizar el efecto de distintas proporciones de código, commits, PRs y replay web.
- Evaluación de modelado de código en dominio: la métrica de NLL sobre 150 pull requests retenidos (530k tokens) es un caso práctico para validar modelos que deben predecir o completar cambios reales de repositorio.
- Generación asistida de parches y descripciones de PR: el checkpoint está especializado en el estilo de commits y pull requests, por lo que es adecuado para experimentos de generación de mensajes de commit o resúmenes de cambios, siempre con validación humana.
- Reproducción de entrenamiento con FSDP2 y xLLM: el estado completo con optimizador en Avifenesh/k2h-ckpt900-xllm permite reanudar o bifurcar el entrenamiento en entornos de 3 GPUs, útil para laboratorios con recursos limitados.
- Base para ablaciones de schedule de learning rate: al haberse detenido en la fase estable de un schedule warmup-stable-decay, es un punto de partida para estudiar el momento óptimo de parada en runs de continued-pretraining.
- Benchmarking de harness: las evaluaciones se hicieron con lm-evaluation-harness contra un servidor vLLM, lo que facilita replicar el pipeline en otras infraestructuras.

## Benchmarks y rendimiento

Todas las cifras provienen del mismo harness que la columna de la release (lm-evaluation-harness contra un servidor vLLM). IFEval y GSM8K en formato chat usan la plantilla de chat con razonamiento activado, temperatura 1,0, top_p 0,95 y 14.336 tokens nuevos, puntuando solo el texto posterior al bloque de razonamiento.

| Tarea | Release | Este modelo | Cambio |
|---|---:|---:|---:|
| GSM8K, 5-shot, estricto | 90,1 | 84,6 | -5,5 |
| GSM8K, chat zero-shot (razonamiento on) | 96,6 | no medido | |
| IFEval, prompt-strict (razonamiento on) | 84,3 | 71,2 | -13,1 |
| MMLU | 77,3 | 76,0 | -1,3 |
| ARC-Challenge | 57,6 | 56,4 | -1,2 |
| ARC-Easy | 85,6 | 85,3 | -0,3 |
| BoolQ | 88,4 | 87,5 | -0,9 |
| HellaSwag (norm) | 67,6 | 67,5 | -0,1 |
| PIQA | 80,5 | 81,0 | +0,5 |
| WinoGrande | 69,1 | 70,6 | +1,5 |
| MBPP pass@1 | 65,2 | 69,6 | +4,4 |
| HumanEval pass@1 (4 muestras) | 53,0 | 63,4 | +10,4 |
| NLL en PR retenidos (menor es mejor) | 1,519 | 1,173 | -0,346 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 75 GB solo para pesos (37,44B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere múltiples GPUs o cuantización.
- El repositorio ocupa 74,9 GB, coherente con pesos bf16 sin cuantizar.
- GPU recomendadas para bf16 sin cuantizar: 2× A100 80GB, 2× H100 80GB o configuraciones equivalentes con suficiente memoria agregada.
- GPU consumer: no cabe en una RTX 4090 (24 GB) en bf16. No se han publicado pesos GGUF ni cuantizaciones en la información disponible, por lo que el despliegue en consumer GPU requeriría cuantización propia.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito por el código de modelado personalizado); el harness de evaluación del autor usó un servidor vLLM. Soporte de llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en 3 GPUs con FSDP2, lo que da una idea del perfil de memoria, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Avifenesh/k2h-main-step900 | 37,44B | ≈4B | 32.768 | Apache-2.0 | Checkpoint de investigación, paso 900 de 7.391 |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | ≈36B | ≈4B | no disponible | Apache-2.0 | Release estable |
| Avifenesh/k2h-c1-clean | no disponible | no disponible | no disponible | no disponible | Brazo de datos limpios, posterior al paso 900 |
| Avifenesh/k2h-c2-sft | no disponible | no disponible | no disponible | no disponible | Brazo con SFT, posterior al paso 900 |

La comparación principal es contra su propio modelo base: la release obtiene mejores resultados en GSM8K (90,1 frente a 84,6), IFEval (84,3 frente a 71,2) y MMLU (77,3 frente a 76,0), mientras que este checkpoint gana en HumanEval (63,4 frente a 53,0), MBPP (69,6 frente a 65,2) y NLL en PR retenidos (1,173 frente a 1,519). No se dispone de datos de benchmarks de los brazos c1-clean, c2-sft y c4-ctrl en la información proporcionada.

## Limitaciones y advertencias

- No es una release candidate: el autor lo califica explícitamente como checkpoint de investigación y recomienda compararlo con la release, no de forma aislada.
- Degradación de habilidades generales: GSM8K cae 5,5 puntos, IFEval 13,1 puntos, MMLU 1,3 y ARC-Challenge 1,2. El seguimiento de instrucciones es el área más afectada.
- El entrenamiento se detuvo antes de tiempo precisamente por esta deriva, por lo que el checkpoint no representa el resultado final del plan de 7.391 pasos.
- GSM8K en formato chat zero-shot con razonamiento activado no se midió para este checkpoint, lo que limita la comparación directa con la release en ese régimen.
- Riesgo de alucinación: no evaluado en la información proporcionada; la especialización en código y PRs puede aumentar la confianza en dominios fuera de la distribución de entrenamiento.
- Idiomas soportados: no disponibles; la mezcla de datos descrita no detalla composición lingüística.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0, la misma del modelo base, lo que permite uso comercial; sin embargo, el estado de investigación y la degradación medida desaconsejan su uso en producción.
- Requiere `trust_remote_code=True` para cargar el código de modelado personalizado, lo que implica ejecutar código del repositorio y debe revisarse en entornos de producción.
- El estado completo de entrenamiento con optimizador está en un repositorio de datasets independiente, no en el repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/k2h-main-step900
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Estado de entrenamiento con optimizador (paso 900): https://huggingface.co/datasets/Avifenesh/k2h-ckpt900-xllm
- Corpus de dominio limpio: https://huggingface.co/datasets/Avifenesh/k2h-corpus-domain-clean
- Fuentes web sin verificar (replay): https://huggingface.co/datasets/Avifenesh/k2h-sources-unverified
