# Jongwondd/Gemma-3-27B-IT-DPO-2ep-7dbfe47e

## Resumen

Gemma-3-27B-IT-DPO-2ep-7dbfe47e es un adaptador LoRA de investigación publicado por el usuario Jongwondd sobre el modelo multimodal google/gemma-3-27b-it. No es un modelo autónomo: se distribuye como pesos PEFT (formato safetensors) que deben cargarse sobre el modelo base de Google, que a su vez requiere aceptar su licencia y condiciones de acceso. El adaptador resulta de un entrenamiento con optimización por preferencias directas (DPO) de dos épocas completas orientado a la tarea de negación (negation), un fenómeno lingüístico en el que los modelos tienden a ignorar o invertir el efecto de partículas negativas.

El interés del checkpoint es acotado y de carácter investigador: se trata de un artefacto final y no fusionado de un experimento de alineación, con procedencia documentada (hash del adaptador original, hash de datos de entrenamiento y resumen de la fuente). El autor declara explícitamente que no aporta resultados de evaluación nuevos, que las particiones de evaluación previamente observadas son datos de desarrollo y no test independiente, y que no se reclama paridad de inferencia entre la descarga pública y el entorno local.

Por su naturaleza, la ficha describe el adaptador y su base (Gemma 3 27B IT), una familia de transformers multimodales de Google con capacidades de texto e imagen. El adaptador en sí no modifica la arquitectura ni el contexto del modelo base; solo introduce actualizaciones de bajo rango sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Gemma 3 (image-text-to-text) |
| Parametros totales | No disponible para el adaptador (el modelo base google/gemma-3-27b-it tiene 27B según su denominación; el adaptador es de rango bajo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | gemma (licencia del modelo base de Google; se aplican sus restricciones de uso) |
| Formato de pesos | safetensors (adaptador LoRA PEFT; no incluye pesos ni tokenizer del modelo base) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0 |
| Modelo base | google/gemma-3-27b-it, revisión `005ad3404e59d6023443cb575daa05336842228a` |
| Tamaño del repositorio | 0,5 GB |
| Método de alineación | DPO (inicialización desde base fresca) |
| Épocas completadas | 2 |
| Ejemplos vistos | 29.902 |
| Pasos del optimizador | 1.890 |
| Pares / casos de entrenamiento | 14.951 pares / 4.534 casos (PopQA train) |
| SHA-256 del adaptador original | `7dbfe47ecea59fb42f6a54863c0d60c46635dac8bc40b8653292e9249e35b354` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 27B IT, un transformer multimodal de Google que procesa entradas de imagen y texto y genera texto (pipeline `image-text-to-text`). El adaptador LoRA congela los pesos del modelo base e introduce matrices de bajo rango con rango 16 y alpha 32, sin dropout, sobre las proyecciones del transformer. El resultado es un conjunto de actualizaciones de pesos de aproximadamente 0,5 GB que debe combinarse en tiempo de carga con el modelo base original.

El entrenamiento consistió en dos épocas completas de DPO partiendo de una inicialización fresca del modelo base, sobre la partición de entrenamiento de PopQA: 14.951 pares de preferencia distribuidos en 4.534 casos, lo que supone 29.902 ejemplos vistos y 1.890 pasos del optimizador. El objetivo específico del método, los hiperparámetros retenidos, el hash del resumen de la fuente y el hash de los datos de entrenamiento se documentan en `training_provenance.json`. El autor subraya que los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT, registrando los hashes de configuración original y publicada. Las líneas base SFT/UL/DPO mencionadas son ejecuciones distintas, no checkpoints de este adaptador, y las pérdidas de entrenamiento no constituyen puntuaciones de evaluación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 3 27B IT.
- Procesamiento de entradas imagen-texto (pipeline declarado `image-text-to-text`).
- Entrenamiento específico orientado a la tarea de negación (negation), con el objetivo de mejorar el tratamiento de partículas negativas en las respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el adaptador declara únicamente inglés (`en`); el comportamiento en otros idiomas no está documentado.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada más allá de la entrada de imagen declarada por el pipeline del modelo base.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador sirve como artefacto reproducible para estudiar cómo el DPO modifica el tratamiento de partículas negativas, comparando respuestas del modelo base con y sin el adaptador sobre el mismo conjunto de prompts.
- Reproducción de experimentos de alineación: dado que se documentan hash de datos, hash del adaptador y número de pasos, permite replicar o auditar el pipeline de entrenamiento DPO de dos épocas sobre PopQA.
- Análisis de robustez ante prompts negativos: útil para evaluar si el ajuste reduce fallos de inversión de polaridad en preguntas del tipo "¿cuál de estos no es...?", un patrón frecuente en tareas de QA.
- Evaluación comparativa de adaptadores LoRA: al ser un adaptador pequeño (0,5 GB) sobre un base de 27B, permite medir el coste y el beneficio de un ajuste de bajo rango frente a un fine-tuning completo en tareas lingüísticas acotadas.
- Estudio de degradación y alucinación post-DPO: el autor advierte de posibles salidas incorrectas, sesgadas, malformadas o repetitivas, lo que lo convierte en un caso de estudio para medir efectos secundarios de la alineación por preferencias.
- Docencia y formación en PEFT: ejemplo práctico de carga de un adaptador con `PeftModel.from_pretrained` sobre un modelo multimodal con `device_map="auto"` y `torch_dtype=torch.bfloat16`, útil en materiales sobre fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; las particiones de evaluación previamente observadas son datos de desarrollo, no test independiente, y las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador añade ~0,5 GB, pero la inferencia requiere cargar el modelo base Gemma 3 27B completo, cuyo consumo depende de la precisión y del esquema de cuantización elegido.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del base (27B), el despliegue en bf16 requiere GPUs de clase数据中心 (A100/H100) o configuraciones multi-GPU; el adaptador en sí no impone requisitos adicionales.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; depende de la cuantización aplicada al modelo base, no del adaptador.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo oficial con `Gemma3ForConditionalGeneration` y `PeftModel.from_pretrained`). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-27B-IT-DPO-2ep-7dbfe47e (este) | Adaptador LoRA DPO sobre Gemma 3 27B IT | 27B (base) + adaptador de rango 16 | No disponible | gemma | Hugging Face, 0 descargas, 0 likes |
| google/gemma-3-27b-it | Modelo base multimodal | 27B | No disponible | gemma | Hugging Face (modelo oficial de Google) |
| Adaptadores LoRA de investigación comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de alternativas directamente comparables (mismo tamaño, misma tarea de negación o mismo pipeline de alineación) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar el modelo base google/gemma-3-27b-it, con el acceso y la aceptación de licencia que ello implica.
- Checkpoint de investigación, no validado para seguridad ni para producción; el autor advierte de salidas incorrectas, sesgadas, malformadas o repetitivas.
- Sin resultados de evaluación publicados en esta subida; las particiones de evaluación previas son datos de desarrollo y no test independiente.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Idiomas: solo se declara inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Restricciones de licencia: se aplica la licencia gemma de Google y sus políticas de uso (`LICENSE`, `NOTICE`, `USE_POLICY.md`); el uso comercial está sujeto a dichas condiciones.
- El adaptador contiene únicamente actualizaciones de pesos fine-tuned, no los pesos originales del modelo base; no se implica afiliación ni respaldo del proveedor del modelo base.
- El autor no reclama paridad de descarga e inferencia en el Hub público; solo se comprobó localmente el parseo de la configuración del adaptador.
- La configuración PEFT publicada modifica el localizador y la revisión del modelo base respecto al original; los hashes de ambas configuraciones quedan registrados en `training_provenance.json`.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/Gemma-3-27B-IT-DPO-2ep-7dbfe47e
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Revisión del modelo base: `005ad3404e59d6023443cb575daa05336842228a`
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
- Dataset PopQA (referenciado como población de entrenamiento): no se proporciona enlace directo en la información disponible.
- Paper, blog o demo del adaptador: no disponible en la información proporcionada.
