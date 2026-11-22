# locodoco/qwen3-embedding-8b-laya-typed-decisions-s1

## Resumen

`locodoco/qwen3-embedding-8b-laya-typed-decisions-s1` es un adaptador LoRA sobre el modelo de embeddings `Qwen/Qwen3-Embedding-8B` de Alibaba, combinado con una cabeza de decisión de estilo *laya*. Lo desarrolla el usuario `locodoco` y está entrenado sobre el conjunto de datos `LocalLLaMA/typed-decisions` para resolver un problema muy concreto: dado un estado (texto libre o JSON) y un conjunto de preguntas tipadas, devolver una distribución de probabilidad sobre las opciones de cada pregunta.

Las preguntas pueden ser de tres tipos: `choice` (elegir entre varias opciones nombradas), `score` (un nivel de una escala ordenada) y `noul` (sí/no). El modelo no genera texto: produce logits por opción, calibrados por temperatura según el tipo de pregunta. Esto lo hace útil como clasificador de decisiones estructuradas dentro de pipelines, no como modelo generativo.

El interés técnico está en el enfoque: reutiliza un modelo de embeddings de 8B parámetros como codificador de estados, entrena un adaptador LoRA de rango 16 y añade una cabeza Transformer bidireccional que puntúa cada opción de forma invariante al orden. Con licencia Apache 2.0 y un tamaño de repo de 0,3 GB (solo el adaptador y la cabeza), es un ejemplo de especialización ligera sobre un modelo base grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-Embedding-8B) + cabeza de decisión propia (LayerNorm + Linear + Transformer bidireccional de 2 capas + MLP) |
| Parámetros totales | No disponible (adaptador LoRA r=16 sobre base de 8B; el repo pesa 0,3 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 tokens de estado + 192 tokens de instrucción + 48 tokens por opción |
| Tipos de cuantización | No disponible (entrenado en bf16; el adaptador PEFT se puede combinar con cuantizaciones del modelo base, pero no se documenta) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA adapter) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3-Embedding-8B`, un transformer decoder de 8B parámetros orientado a embeddings. Sobre él se entrena un adaptador LoRA con rango 16, alpha 32 y dropout 0,05 aplicado a las proyecciones q, k, v, o, gate, up y down. La cabeza de decisión transforma los estados ocultos en logits por opción: LayerNorm, una capa Linear de hidden a 1024, un embedding por tipo de pregunta, un encoder Transformer bidireccional de 2 capas sobre la secuencia y un scorer MLP.

El mecanismo de inferencia es singular: cada opción es una rama paralela que continúa los position ids desde el final del prefijo y solo ve el prefijo y su propia rama, no las demás opciones. El estado oculto en el token `<|endoftext|>` final de cada rama (el token que Qwen3-Embedding usa para pooling) actúa como marcador de esa opción. Esto garantiza invariancia al orden de las opciones.

El entrenamiento usa la pérdida RLCD de laya contra los objetivos *soft* del dataset. Se usan 6.000 decisiones del split de entrenamiento, divididas en 5.600 para entrenar y 400 para calibrar temperaturas por tipo (choice 1,006; score 1,028; noul 1,112). Se entrenan 4 épocas con micro-batches de 8 y acumulación de gradiente 8 (350 pasos de optimizador), AdamW con learning rate 1e-4, weight decay 0,01, decaimiento coseno y clipping de gradiente 1,0. Precisión bf16. Todo el entrenamiento se hizo en una NVIDIA GH200 (96 GB) en 35 minutos sin gradient checkpointing, con un pico de memoria de 70,5 GB.

## Capacidades

- Clasificación de decisiones tipadas: devuelve una distribución de probabilidad sobre opciones para preguntas de tipo `choice`, `score` y `noul`.
- Entrada de estado en texto libre o JSON, con hasta 1.024 tokens de estado.
- Invariancia al orden de opciones por construcción (ramas paralelas sin atención cruzada entre opciones).
- Calibración por temperatura específica de cada tipo de pregunta.
- Puntuación de múltiples preguntas sobre un mismo estado en una sola pasada de forward por pregunta.
- No genera texto libre: es un modelo de scoring, no un LLM conversacional.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma nativa.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: cabecera de decisión con encoder bidireccional y calibración ECE.

## Casos de uso

- **Triaje de tickets de soporte**: clasificar un ticket en departamento (`choice`), urgencia (`score`) y riesgo de churn (`noul`) en una sola llamada por pregunta. El modelo lee el estado completo antes de cada opción, lo que permite usar el texto íntegro del ticket sin truncar.
- **Enrutamiento de correos o formularios**: dado un mensaje entrante en JSON, decidir a qué equipo va y con qué prioridad. La invariancia al orden evita sesgos por el orden en que se presenten las opciones.
- **Moderación de contenido estructurada**: clasificar publicaciones según categorías predefinidas y niveles de gravedad, con probabilidades calibradas para fijar umbrales de revisión humana.
- **Scoring de riesgo en pipelines de decisión**: integrar el modelo como componente de scoring donde se necesiten probabilidades por opción en lugar de texto generado, por ejemplo en sistemas de recomendación de acciones o alertas.
- **Etiquetado asistido de datasets**: usar el modelo para predecir etiquetas tipadas sobre registros y priorizar la revisión humana según la confianza (aunque el modelo es conservador: confianza media 0,64 frente a accuracy 0,80).
- **Evaluación de estados de agentes**: dado el estado de un agente (texto o JSON) y preguntas sobre el mismo, decidir la siguiente acción entre opciones discretas, como paso de un planificador.

## Benchmarks y rendimiento

Resultados en el split de test de `typed-decisions` (400 casos, 2.000 decisiones) tras calibración de temperatura, calculados con `laya.train.evaluate_records`:

| Modelo | Accuracy | ECE | Choice acc. | Score acc. | Noul acc. |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B, seed 0 | 0,8005 | 0,159 | 0,767 | 0,784 | 0,857 |
| **Qwen3-Embedding-8B, seed 1 (este modelo)** | **0,8025** | **0,159** | **0,760** | **0,796** | **0,853** |
| Qwen3-Embedding-8B, seed 2 | 0,7980 | 0,155 | 0,763 | 0,779 | 0,858 |
| Qwen3-32B, seed 0 | 0,8035 | 0,163 | 0,767 | 0,784 | 0,867 |
| laya-typed-decisions (publicado) | 0,766 | 0,213 | — | — | — |
| Jev 1.13.0 (publicado) | 0,727 | 0,144 | — | — | — |

Las tres semillas de Qwen3-Embedding-8B promedian 0,800 de accuracy. Qwen3-32B añade unos 0,3 puntos con aproximadamente 3,5 veces más tiempo de entrenamiento. La confianza media de este modelo es 0,64 frente a una accuracy de 0,80, por lo que está infraconfiado; la mayor parte del ECE proviene de esa brecha.

## Requisitos de hardware

- **VRAM estimada**: el modelo base en bf16 ocupa unos 16 GB según la model card; el adaptador y la cabeza añaden una cantidad pequeña (repo de 0,3 GB). Para inferencia con batch razonable se recomienda al menos 24 GB de VRAM en bf16.
- **GPU recomendadas**: NVIDIA GH200 (usada en entrenamiento), A100 40/80 GB, H100, L40S. Para inferencia en bf16, una RTX 4090 (24 GB) es ajustada pero viable con batch pequeño.
- **Consumer GPU**: posible en RTX 4090 (24 GB) en bf16 con batch reducido; en GPUs de 16 GB requeriría cuantización del modelo base, no documentada por el autor.
- **Despliegue**: el autor proporciona un script propio (`qwen_laya`) que usa `transformers`, `peft` y `laya==0.5.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de scoring con cabeza personalizada, el despliegue estándar de LLM no aplica directamente.
- **Latencia y throughput**: no disponibles. El entrenamiento usó batch de 16 en inferencia de ejemplo; no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3-Embedding-8B + laya, seed 1) | 8B + LoRA | 1.024 estado + 192 instr. + 48/opción | 0,8025 | 0,159 | Apache 2.0 | Hugging Face |
| Qwen3-Embedding-8B + laya, seed 0 | 8B + LoRA | Igual | 0,8005 | 0,159 | Apache 2.0 | Hugging Face |
| Qwen3-32B + laya, seed 0 | 32B | Igual | 0,8035 | 0,163 | Apache 2.0 (Qwen3) | Hugging Face |
| laya-typed-decisions (publicado) | No disponible | No disponible | 0,766 | 0,213 | No disponible | Referencia en `BENCHMARKS.md` |
| Jev 1.13.0 (publicado) | No disponible | No disponible | 0,727 | 0,144 | No disponible | Referencia en `BENCHMARKS.md` |

## Limitaciones y advertencias

- **Solo inglés**: el modelo está entrenado y etiquetado únicamente para inglés; no se garantiza comportamiento en castellano ni otros idiomas.
- **Infraconfianza**: confianza media de 0,64 frente a accuracy de 0,80; las probabilidades no deben interpretarse como confianza calibrada sin tener en cuenta este sesgo.
- **ECE de 0,159**: error de calibración esperado relativamente alto; para umbrales de decisión críticos conviene recalibrar sobre datos propios.
- **No es generativo**: no produce texto, solo distribuciones sobre opciones predefinidas; no sirve para tareas de generación, resumen o diálogo.
- **Dependencia de `laya`**: requiere la librería `laya==0.5.0`, `transformers==5.23.0` y `peft==0.22.0`; versiones distintas pueden romper la compatibilidad.
- **Contexto limitado**: 1.024 tokens de estado, 192 de instrucción y 48 por opción; estados más largos deben truncarse.
- **Riesgo de alucinación**: bajo en el sentido generativo (no genera texto), pero puede asignar alta probabilidad a opciones incorrectas en estados ambiguos o fuera de distribución.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Qwen3-Embedding-8B tiene su propia licencia que debe verificarse por separado.
- **Repo pequeño y sin descargas**: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/locodoco/qwen3-embedding-8b-laya-typed-decisions-s1)
- [Modelo base Qwen/Qwen3-Embedding-8B](https://huggingface.co/Qwen/Qwen3-Embedding-8B)
- [Dataset LocalLLaMA/typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions)
- [Repositorio laya](https://github.com/NandhaKishorM/laya)
