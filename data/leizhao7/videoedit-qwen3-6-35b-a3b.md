# leizhao7/VideoEdit-Qwen3.6-35B-A3B

## Resumen

VideoEdit-Qwen3.6-35B-A3B es un modelo multimodal especializado en edición de vídeo de horizonte largo, desarrollado por el autor leizhao7 a partir del modelo base Qwen3.6-35B-A3B de Qwen. El modelo se entrena mediante aprendizaje por refuerzo (GRPO) para inspeccionar material de rodaje, razonar sobre decisiones de montaje y utilizar herramientas de edición a lo largo de múltiples turnos de conversación. Su aportación principal es abordar el problema de la asignación de crédito (credit assignment) en tareas de edición de vídeo que requieren secuencias largas de decisiones encadenadas.

El conjunto de entrenamiento se construye a partir de 49 películas reales y sus tráilers, cubriendo cuatro tipos de tareas de montaje: selección de contenido (Content Selection), secuenciación narrativa (Narrative Sequencing), montaje preliminar (Rough Cut) y montaje fino (Fine Cut). Según la model card, el modelo alcanza una puntuación global de 0,5314, frente a 0,2923 del modelo base sin entrenar y 0,5079 de una variante entrenada con GRPO basado solo en el resultado final (outcome-only).

Es relevante ahora porque representa una de las primeras aproximaciones publicadas que aplican RL con asignación de crédito por pasos a agentes de edición de vídeo, en lugar de tratar la edición como una generación de una sola pasada. Arquitectónicamente hereda el diseño MoE de la familia Qwen3.6, con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones activos por token (según la denominación A3B), lo que permite inferencia eficiente manteniendo capacidad elevada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (familia Qwen3.6, arquitectura qwen3_5_moe), pipeline image-text-to-text |
| Parametros totales | 35.107.181.936 (dato real de safetensors) |
| Parametros activos | ~3B (indicado por la denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (70,3 GB de tamaño de repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste (finetune) de Qwen/Qwen3.6-35B-A3B, un modelo transformador de mezcla de expertos (MoE) multimodal con capacidad image-text-to-text. Con 35,1 mil millones de parámetros totales y unos 3 mil millones activos por token, la arquitectura MoE permite un coste de inferencia comparable al de un modelo denso de 3B conservando la capacidad representacional de un modelo mucho mayor. La model card no detalla la longitud de contexto ni el tokenizador, aunque heredan del modelo base Qwen3.6.

El entrenamiento se realiza mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). La innovación central del trabajo, descrita en el paper asociado (arXiv:2610.35497), es el tratamiento de la asignación de crédito en tareas de edición de horizonte largo: en lugar de recompensar únicamente el resultado final (outcome-only), el método propuesto atribuye recompensa a las decisiones intermedias de inspección del metraje y uso de herramientas. Los datos de entrenamiento se derivan de 49 películas reales y sus tráilers, estructurados en cuatro familias de tareas (CS, NS, RC y FC). Ambas políticas entrenadas (la propuesta y la variante outcome-only) se evalúan en el update 50. La model card no especifica detalles como el número de tokens de preentrenamiento heredado ni el uso de RLHF/DPO adicional.

## Capacidades

- Inspección y comprensión de metraje de vídeo: el modelo analiza material audiovisual antes de tomar decisiones de montaje.
- Razonamiento sobre decisiones de edición en horizonte largo: encadena múltiples decisiones de corte y secuenciación a lo largo de varios turnos.
- Uso de herramientas de edición (tool calling): opera herramientas de edición de vídeo en flujos multi-paso, produciendo salidas como `cuts.json` con puntos de corte concretos.
- Cuatro tareas de montaje: selección de contenido, secuenciación narrativa, montaje preliminar (picture only) y montaje fino.
- Comprensión multimodal imagen-texto-video (pipeline image-text-to-text).
- Capacidades conversacionales heredadas del modelo base Qwen3.6-35B-A3B.
- Capacidades generales de generación de texto, código o matemáticas: no disponibles (no documentadas para este checkpoint especializado).

## Casos de uso

- Montaje automático de tráilers: dada una película completa, el modelo puede seleccionar y secuenciar los planos más relevantes para generar un tráiler, tarea para la que fue entrenado directamente con 49 pares película-tráiler.
- Rough cut asistido: generación de un primer montaje preliminar (picture only) a partir del metraje bruto, que un editor humano puede refinar, reduciendo el tiempo de la primera pasada de edición.
- Fine cut de planos concretos: determinación de puntos de corte precisos dentro de secuencias, produciendo archivos de decisiones de edición (`cuts.json`) directamente interpretables por software de postproducción.
- Selección de contenido en grandes archivos audiovisuales: dadas horas de grabación (por ejemplo, rodajes documentales o grabaciones de eventos), el modelo puede identificar los fragmentos con mayor valor narrativo.
- Reordenación narrativa: secuenciación de clips desordenados en una narrativa coherente, útil en producción de contenido corto y resúmenes de vídeo.
- Investigación en agentes multimodales con RL: el modelo, su guía de entrenamiento y el código del repositorio sirven como base reproducible para estudiar asignación de crédito en agentes de horizonte largo.
- Integración en pipelines de postproducción: mediante su interfaz de tool calling multi-turno, puede integrarse en flujos de trabajo automatizados con editores como FFmpeg o NLEs programáticos.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación en el update 50):

| Modelo | Puntuación global |
|---|---|
| VideoEdit-Qwen3.6-35B-A3B (este modelo) | 0,5314 |
| GRPO outcome-only | 0,5079 |
| Base Qwen3.6-35B-A3B (sin entrenar) | 0,2923 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se detallan puntuaciones desglosadas por tipo de tarea (CS, NS, RC, FC) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1B de parámetros totales en BF16 (~70,3 GB de pesos), se requiere al menos una GPU de 80 GB (A100/H100) para cargar el modelo completo sin cuantizar; con ~3B de parámetros activos, el throughput una vez cargado es comparable al de un modelo denso de 3B.
- GPUs recomendadas: NVIDIA A100 u H100 de 80 GB para la precisión original; no disponible información oficial sobre cuantizaciones que reduzcan el requisito.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) con los pesos originales en BF16; sería necesaria una cuantización no publicada oficialmente.
- Opciones de despliegue: transformers (librería nativa, arquitectura qwen3_5_moe), endpoints compatibles en Hugging Face (endpoints_compatible); no se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible; al ser un agente multi-turno con inspección de vídeo y tool calling, la latencia por tarea depende del número de pasos de razonamiento y de la duración del metraje procesado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Especializacion | Puntuacion (tarea propia) | Licencia |
|---|---|---|---|---|---|
| VideoEdit-Qwen3.6-35B-A3B | 35,1B | ~3B | Edicion de video (RL, credit assignment) | 0,5314 | Apache 2.0 |
| GRPO outcome-only (variante del mismo trabajo) | 35,1B | ~3B | Edicion de video (recompensa solo final) | 0,5079 | no disponible |
| Qwen3.6-35B-A3B (base) | 35,1B | ~3B | Modelo general multimodal | 0,2923 (edicion de video) | no disponible |
| VideoEdit-Qwen3.5-9B (hermano menor) | 9B | no disponible | Edicion de video | no disponible | no disponible |

No existen alternativas externas documentadas en la información disponible para la tarea específica de edición de vídeo por RL con asignación de crédito; la comparación más pertinente es con la propia familia del proyecto y con el modelo base.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para tareas de edición de vídeo derivadas de películas; su rendimiento en uso general (chat, código, matemáticas) puede haberse degradado respecto al modelo base, aunque no hay datos de catastrophic forgetting publicados.
- Sesgo del dominio de entrenamiento: las tareas se construyen a partir de 49 películas reales y sus tráilers, por lo que el modelo puede generalizar mal a otros tipos de material (deportes, videollamadas, metraje de vigilancia, animación) o a estilos de montaje no representados.
- Derechos de autor del material: las películas usadas en el entrenamiento y las demos son obras con copyright; el uso del modelo sobre material protegido sin licencia puede plantear problemas legales.
- Riesgo de alucinación: no disponible información específica, pero como agente que razona sobre vídeo, puede describir incorrectamente contenido no visible o justificar decisiones de corte con razonamientos no fiables.
- Idioma: el modelo está etiquetado solo para inglés (en); no hay soporte documentado para castellano u otros idiomas.
- Contexto: la longitud de contexto no está documentada; el procesamiento de películas completas depende de mecanismos de muestreo de vídeo no descritos en la model card.
- Adopción mínima: con 38 descargas y 1 like en el momento de la ficha, el modelo tiene muy poca validación comunitaria; no hay reportes de terceros sobre estabilidad en producción.
- Licencia: Apache 2.0 permite uso comercial, pero las demos y assets del repositorio pueden tener restricciones propias derivadas del material fílmico.

## Enlaces

- Hugging Face: https://huggingface.co/leizhao7/VideoEdit-Qwen3.6-35B-A3B
- Paper (arXiv): https://arxiv.org/abs/2610.35497
- Project page: https://leizhao7.github.io/videoedit/
- GitHub (codigo del proyecto): https://github.com/leizhao7/video-editing-credit-assignment
- Training guide: https://github.com/leizhao7/video-editing-credit-assignment/blob/main/docs/training.md
- Modelo hermano 9B: https://huggingface.co/leizhao7/VideoEdit-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Demo Rough Cut (video entrenado): https://huggingface.co/leizhao7/VideoEdit-Qwen3.6-35B-A3B/resolve/main/assets/demos/rough-cut/trained.mp4
- Demo Fine Cut (video entrenado): https://huggingface.co/leizhao7/VideoEdit-Qwen3.6-35B-A3B/resolve/main/assets/demos/trained-hd.mp4
