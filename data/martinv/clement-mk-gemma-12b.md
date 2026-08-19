# MartinV/clement-mk-gemma-12b

## Resumen

Clement 12B es un modelo de lenguaje generativo en macedonio desarrollado por MartinV, construido como un fine-tuning del modelo base google/gemma-4-12B de Google. El proyecto nace de una investigación sobre la calidad de los datos de entrenamiento de los modelos macedonios existentes: una auditoría de 235 datasets reveló que la mayoría del corpus macedonio disponible es traducción automática del inglés, con errores de calco sintáctico y contaminación de serbio y búlgaro. Clement es el experimento que prueba que un corpus nativo, curado por hablantes, supera a un corpus mucho mayor traducido.

El modelo se entrenó con una combinación de continuación de pretraining (CPT) y ORPO, usando aproximadamente 551 millones de tokens de un corpus macedonio filtrado de 3.2 mil millones de tokens, aunque el entrenamiento se detuvo antes de completarse (solo el 28% de la mezcla planificada). Con 11.907 millones de parámetros, el modelo está optimizado para la naturalidad del registro, la conversación y la explicación en macedonio, aunque reconoce limitaciones en el conocimiento factual de larga cola. En una arena ciega contra domestic-yak-8B-instruct, Clement ganó 39 de 50 enfrentamientos (81%), con una ventaja especialmente marcada en categorías de naturalidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 12B) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende de la configuracion de Gemma 4 12B) |
| Tipos de cuantizacion | safetensors (BF16/FP16) y GGUF (varias cuantizaciones) |
| Idiomas soportados | Macedonio (mk) como idioma principal; el base Gemma 4 12B soporta multiples idiomas |
| Licencia | Gemma (terminos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Clement 12B parte de google/gemma-4-12B, un modelo transformer denso de la familia Gemma 4. Segun el informe tecnico de Gemma 4, el modelo de 12B usa una arquitectura unificada sin encoders separados para vision o audio, con modulos de proyeccion ligeros. El fine-tuning se realizo mediante LoRA (tag `lora`) y ORPO (tag `orpo`), una tecnica que combina la optimizacion de preferencias con el entrenamiento supervisado.

El entrenamiento consistio en una fase de CPT (continuacion de pretraining) sobre un corpus macedonio filtrado y curado por un hablante nativo. El corpus disponible era de 4.147.663 documentos (~3.2B tokens), del cual se construyo una mezcla de entrenamiento de 2.0B tokens. Sin embargo, el entrenamiento se detuvo en el paso 8.399 de 30.518 planificados, habiendo visto solo ~551M tokens (28% de la mezcla) y ~358M tokens macedonios reales (11% del corpus). Todo el proceso posterior se construyo sobre esa base parcialmente adaptada. El proyecto documenta que el entrenamiento a escala SFT moldea el estilo pero no hace recuperables los hechos de larga cola; el conocimiento pertenece al pretraining, el comportamiento al fine-tuning.

## Capacidades

- Generacion de texto en macedonio con alta naturalidad de registro, especialmente en conversacion, escritura creativa, preguntas cotidianas, uso del idioma y explicaciones.
- Razonamiento y respuesta a preguntas en macedonio, con mejoras en tareas de sentido comun (COPA, HellaSwag, OpenBookQA) respecto al modelo base.
- Soporte de conversacion multi-turno (tag `conversational`).
- Capacidad de continuar texto y completar tareas de generacion (pipeline text-generation).
- No se documentan capacidades de tool calling, vision, audio ni agentes en la informacion disponible.
- El modelo base Gemma 4 es multimodal nativo, pero este fine-tuning se presenta como modelo de texto; no se confirma que las capacidades multimodales se conserven tras el entrenamiento.

## Casos de uso

- Atencion al cliente en macedonio: el modelo puede gestionar conversaciones de soporte con un tono natural y adecuado al registro, gracias a su entrenamiento orientado a la conversacion y su ventaja en las categorias de naturalidad de la arena.
- Redaccion de contenido editorial y marketing en macedonio: su capacidad para escribir con fluidez y evitar el "translationese" lo hace util para generar articulos, descripciones de producto o publicaciones en redes sociales con un estilo idiomatico.
- Asistente de escritura para hablantes de macedonio: puede ayudar a redactar correos, documentos o textos academicos, ofreciendo sugerencias de estilo y expresiones naturales.
- Traduccion asistida del ingles al macedonio: aunque no esta optimizado para traduccion, su conocimiento del macedonio nativo puede servir como base para revisar y mejorar traducciones automaticas existentes.
- Educacion y aprendizaje del macedonio: puede generar ejercicios, explicaciones gramaticales o dialogos de ejemplo para estudiantes del idioma, aprovechando su capacidad de explicar conceptos con claridad.
- Investigacion linguistica: el modelo sirve como herramienta para estudiar la naturalidad del macedonio generado por IA y comparar con corpus nativos, dado que el proyecto publica todos los datos de evaluacion.

## Benchmarks y rendimiento

Resultados de `lm-evaluation-harness` 0.4.12 (loglikelihood accuracy) publicados en la model card:

| Tarea | base gemma-4-12B | domestic-yak-8B | Clement 12B |
|---|---|---|---|
| exams_mk † | 0.5600 | 0.5277 | 0.5470 |
| copa_mk † | 0.7020 | 0.7330 | **0.7570** |
| include_mk † | 0.5762 | 0.5604 | 0.5604 |
| arc_challenge_mk | 0.3012 | 0.3387 | **0.3473** |
| arc_easy_mk | 0.5067 | **0.5484** | 0.5274 |
| boolq_mk | 0.7832 | 0.7890 | 0.7807 |
| hellaswag_mk | 0.4497 | 0.4524 | **0.4754** |
| openbookqa_mk | 0.3020 | 0.3040 | **0.3260** |
| piqa_mk | 0.6687 | 0.6850 | **0.6872** |
| winogrande_mk | 0.6314 | 0.6338 | 0.6140 |
| **Promedio** | 0.5481 | 0.5572 | **0.5622** |

† Tareas escritas por humanos en macedonio: `exams_mk` e `include_mk` son de autoria nativa; `copa_mk` es traduccion humana profesional. Las otras siete son puertos traducidos automaticamente del ingles.

El autor advierte que la diferencia con domestic-yak-8B es estadisticamente no significativa (z = 0.82). La ventaja de Clement se concentra en las tareas escritas por humanos (+0.0144 sobre yak) frente a las traducidas (+0.0010). En la arena ciega de 50 prompts, Clement gano 39-9-2 (81%) contra domestic-yak-8B-instruct, con un marcador de 23-1-1 en categorias de naturalidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11.9B parametros, en FP16 se necesitan aproximadamente 24 GB de VRAM. Con cuantizacion GGUF Q4_K_M, unos 7-8 GB; con Q8, unos 12-13 GB.
- GPU recomendadas: para FP16, una RTX 3090, RTX 4090, A100 o H100. Para cuantizaciones ligeras, una RTX 3060 12GB o RTX 4070 pueden ser suficientes.
- Cabe en GPUs de consumo: si, con cuantizacion GGUF Q4 o Q5 en tarjetas con 8-12 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (el repo incluye pesos GGUF y safetensors, y tiene tag `endpoints_compatible`).
- Latencia y throughput: no se han publicado mediciones especificas para este modelo. Como referencia, un modelo de 12B en una RTX 4090 con cuantizacion Q4 puede generar entre 30 y 60 tokens por segundo, dependiendo de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Clement 12B | 11.9B | No disponible | Macedonio (principal) | Gemma | Fine-tuning de Gemma 4 12B con CPT+ORPO, corpus nativo curado |
| domestic-yak-8B-instruct | 8B | No disponible | Macedonio | No disponible | Modelo rival en la arena; Clement le gana 39-9-2 en prompts nativos |
| google/gemma-4-12B (base) | 12B | No disponible | Multilingue | Gemma | Modelo base sin fine-tuning; Clement mejora su rendimiento en tareas macedonias |

No se dispone de informacion sobre otros modelos macedonios comparables en el mercado. La comparativa se limita a los dos modelos mencionados en la documentacion.

## Limitaciones y advertencias

- El entrenamiento de CPT no se completo: solo se uso el 28% de la mezcla planificada y el 11% del corpus macedonio preparado. Esto limita el conocimiento factual del modelo.
- Alucinacion de hechos de larga cola, especialmente en cultura e historia macedonia. En la arena, la categoria de cultura fue la unica que perdio (1-4).
- El conocimiento general del mundo depende del modelo base Gemma 4 12B, que no fue actualizado con datos macedonios especificos.
- La evaluacion de la arena fue realizada por un LLM bajo protocolo de clave sellada, con supervision de un hablante nativo, no por un panel independiente de hablantes.
- La licencia Gemma de Google impone restricciones de uso comercial: es necesario revisar los terminos en https://ai.google.dev/gemma/terms antes de desplegar en produccion.
- El modelo esta optimizado para macedonio; su rendimiento en otros idiomas no esta documentado y probablemente sea inferior al del base Gemma 4.
- No se han publicado evaluaciones de sesgos, seguridad o robustez especificas para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MartinV/clement-mk-gemma-12b
- Repositorio GitHub con documentacion, pipeline de datos y evaluacion: https://github.com/MartinV279/clement-mk-gemma-12b
- Censo de 235 datasets macedonios: https://github.com/MartinV279/clement-mk-gemma-12b/blob/main/docs/dataset_census.md
- Registro completo de la arena ciega: https://github.com/MartinV279/clement-mk-gemma-12b/tree/main/eval/blind
- Resultados del harness de evaluacion: https://github.com/MartinV279/clement-mk-gemma-12b/tree/main/eval/results
- Informe tecnico de Gemma 4 (arXiv): https://arxiv.org/pdf/2607.02770
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
