# jinzijie-bupt/evidence-audit-videochatr1-7b-pc-a05-s0

## Resumen

`evidence-audit-videochatr1-7b-pc-a05-s0` es un adaptador LoRA para el modelo de video-comprensión VideoChat-R1_7B (OpenGVLab), desarrollado por jinzijie-bupt y publicado junto al artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. El adaptador no busca mejorar la precisión bruta del modelo base en localización temporal de eventos, sino aumentar su dependencia de la evidencia visual real: que la respuesta correcta se apoye en lo que ocurre en el vídeo y no en sesgos del dataset o del lenguaje.

El modelo base es un transformer multimodal de 7.000 millones de parámetros (familia Qwen2.5-VL) que procesa vídeo y texto para tareas de *temporal grounding*. Este adaptador se entrena con el objetivo "placebo-controlled" descrito en la sección 4 del artículo, que combina la verosimilitud de la respuesta con márgenes que penalizan que el modelo acierte cuando el evento ha sido manipulado (intercambiado, enmascarado, desenfocado, desplazado temporalmente o barajado) y premian la estabilidad frente a ediciones placebo fuera del evento.

Es relevante porque aborda un problema metodológico poco tratado: un modelo puede obtener alta precisión en Charades-STA sin haber aprendido a "mirar" el vídeo. El adaptador se publica con código, identificadores de datos y scripts de evaluación, lo que facilita reproducir la auditoría de evidencia. El repositorio ocupa 0,4 GB e incluye dos carpetas de pesos compatibles con transformers 4.51 y 5.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (VideoChat-R1_7B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre VideoChat-R1_7B, un modelo multimodal basado en Qwen2.5-VL con una torre de visión y un modelo de lenguaje. El LoRA tiene rango r=16, alpha=32 y dropout 0,05, aplicado a las proyecciones q/k/v/o y gate/up/down. Un detalle técnico importante: en los entrenamientos con transformers 4.51 se usó *gradient checkpointing*, lo que dejó sin gradiente los pesos LoRA de la torre de visión; esos pesos son cero, por lo que el adaptador modifica únicamente el modelo de lenguaje.

El entrenamiento usa el objetivo placebo-controlled del artículo: mantiene la verosimilitud de la respuesta ponderada por α=0,5 y añade dos márgenes por operador de edición (la respuesta anotada debe ser más probable en el vídeo limpio y en un vídeo con edición placebo emparejada fuera del evento que en el vídeo con el evento editado). Un término hinge limita la caída bajo la edición placebo a 1,25 × la caída de referencia + 0,10 (β=0,1). Se usaron 2.400 pares del split de entrenamiento de Charades-STA, 300 pasos de optimizador, acumulación de gradiente 8, learning rate 5e-6, semilla 0 y pesos por operador con Group-DRO. Los operadores de edición son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de vídeo es a 2 fps con un máximo de 768 fotogramas y plantilla de prompt `vchat`.

## Capacidades

- Localización temporal de eventos en vídeo (*video temporal grounding*) sobre Charades-STA.
- Comprensión conjunta de vídeo y texto mediante el modelo base Qwen2.5-VL.
- Mayor dependencia de la evidencia visual: el adaptador está entrenado para que la respuesta correcta se mantenga ante ediciones placebo y caiga ante ediciones del evento.
- Robustez frente a perturbaciones controladas (swap, mask, blur, tshift, shuffle) del contenido visual.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo *thinking* específicas de este adaptador.

## Casos de uso

- Auditoría de evidencia en modelos de grounding: usar el adaptador como referencia para medir cuánto depende un modelo base de la evidencia visual frente a atajos del dataset, comparando respuestas en vídeo limpio y con ediciones.
- Evaluación de robustez en pipelines de investigación: aplicar los operadores de edición (swap, mask, blur, tshift, shuffle) y comprobar si la respuesta del modelo cae cuando debería, con los scripts del repositorio de código.
- Investigación en sesgos de datasets de vídeo: estudiar si la precisión en Charades-STA refleja comprensión visual o explotación de correlaciones entre pregunta y anotación.
- Reproducción de experimentos del artículo: el adaptador aparece en las tablas 3, 6, 7, 10, 11, 13, 14, 16, 19, 20 y 24 y en las figuras 1, 2, 4 y 5, lo que permite replicar resultados concretos.
- Desarrollo de métodos de entrenamiento con objetivos contrafactuales: sirve como punto de partida para probar variantes del objetivo placebo-controlled (distintos α, β o conjuntos de operadores).
- Análisis de la contribución de la torre de visión frente al modelo de lenguaje: al tener pesos LoRA de visión a cero, permite aislar el efecto de adaptar solo el LLM en tareas de grounding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del artículo para los resultados, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB; el modelo base VideoChat-R1_7B (7B) requiere VRAM adicional para inferencia.
- VRAM estimada para el base en bfloat16: en torno a 14-16 GB solo para pesos, más memoria para activaciones y procesamiento de vídeo (hasta 768 fotogramas a 2 fps), por lo que se recomienda 24 GB o más.
- GPU recomendadas: A100, H100 o RTX 4090 para vídeo largo; en consumer GPU de 24 GB puede caber con cuantizacion, aunque no se documentan configuraciones probadas.
- Despliegue: transformers 4.51.3 con peft 0.20 (o transformers 5.12.1 con peft 0.19.1 o superior usando la subcarpeta `transformers-v5`), junto con `qwen-vl-utils`. No se documentan opciones vLLM, llama.cpp u Ollama para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-videochatr1-7b-pc-a05-s0 (este) | LoRA sobre 7B | no disponible | Grounding temporal con auditoría de evidencia | apache-2.0 | Hugging Face (0 descargas) |
| OpenGVLab/VideoChat-R1_7B (base) | 7B | no disponible | Grounding temporal y comprensión de vídeo | no disponible en la informacion | Hugging Face |
| Qwen2.5-VL (familia base) | 7B y otros tamanos | no disponible | Multimodal imagen/vídeo | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El adaptador modifica únicamente el modelo de lenguaje: los pesos LoRA de la torre de visión son cero por el uso de gradient checkpointing en transformers 4.51, por lo que no adapta la percepción visual.
- Cargar el adaptador con la versión equivocada de transformers no da error pero deja los pesos LoRA sin usar; hay que usar la carpeta correspondiente (`transformers-v5/` para transformers 5) y verificar con `tools/check_lora_keys.py`.
- Entrenado solo con 2.400 pares de Charades-STA y 300 pasos: la generalización a otros dominios de vídeo o datasets no está documentada.
- No se documentan idiomas soportados; el comportamiento multilingüe depende del modelo base y no se ha evaluado aquí.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- No se documentan sesgos específicos del adaptador; al entrenarse sobre Charades-STA hereda los sesgos de ese dataset.
- Licencia apache-2.0 declarada para el adaptador; conviene verificar la licencia del modelo base antes de uso comercial.
- Proyecto de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-videochatr1-7b-pc-a05-s0
- Modelo base: https://huggingface.co/OpenGVLab/VideoChat-R1_7B
- Repositorio de código, datos y evaluación: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Artículo: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. arXiv preprint, 2026 (sin enlace directo en la información disponible).
