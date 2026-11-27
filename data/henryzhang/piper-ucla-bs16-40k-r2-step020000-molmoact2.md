# HenryZhang/piper-ucla-bs16-40k-r2-step020000-molmoact2

## Resumen

piper-ucla-bs16-40k-r2-step020000-molmoact2 es un ajuste fino (fine-tuning) del modelo allenai/MolmoAct2, desarrollado por el usuario HenryZhang y publicado en Hugging Face. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado a robótica, entrenado sobre el dataset thecqzzz/piper_vla_ucla, que contiene demostraciones de manipulación recogidas con un brazo robótico Piper en un entorno de la UCLA. El modelo parte de la arquitectura y los pesos de MolmoAct2 y los adapta a un dominio concreto de control robótico.

El entrenamiento consistió en 20.000 actualizaciones del optimizador (optimizer steps) con un batch global de 16 y un action chunk de 32, según indica la model card. El nombre del repositorio codifica estos hiperparámetros: bs16 (batch size), 40k (probablemente el número de pasos o muestras objetivo, no confirmado), r2 (posiblemente una segunda ronda o revisión) y step020000 (checkpoint en el paso 20.000). El checkpoint resultante tiene 5.447.439.088 parámetros según los pesos en safetensors, y el repositorio ocupa 21,8 GB.

La relevancia de este modelo es acotada: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. No obstante, ilustra el patrón de adaptación de modelos VLA de propósito general (MolmoAct2) a tareas robóticas específicas mediante fine-tuning supervisado sobre demostraciones, un flujo habitual en investigación de robótica con aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de allenai/MolmoAct2; VLA con vision, lenguaje y accion) |
| Parametros totales | 5.447.439.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code, requiere código personalizado del repo) |

## Arquitectura y entrenamiento

No se dispone de la arquitectura interna detallada en la información proporcionada. El modelo se presenta como fine-tune de allenai/MolmoAct2, que por su denominación y etiquetas (molmoact2, custom_code) corresponde a un modelo de visión-lenguaje-acción. El repositorio incluye código personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en la implementación del autor o en la del modelo base.

El entrenamiento se realizó sobre el dataset thecqzzz/piper_vla_ucla, con demostraciones del robot Piper en un contexto UCLA. Se ejecutaron 20.000 actualizaciones del optimizador con batch global de 16 y action chunk de 32, lo que sugiere un entrenamiento de imitación (behavior cloning) sobre secuencias de acciones. No se documentan en la información disponible detalles sobre composición del dataset, número de tokens, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks de 32) condicionadas a observaciones visuales y, presumiblemente, instrucciones en lenguaje, siguiendo el paradigma VLA de MolmoAct2.
- Percepción visual: al heredar un modelo de visión-lenguaje, se espera que procese imágenes del entorno para guiar la acción, aunque no se detalla la resolución ni el número de cámaras soportadas.
- Seguimiento de instrucciones en lenguaje: capacidad heredada del modelo base, no verificada en este fine-tune.
- Ejecución de tareas de manipulación específicas del dominio Piper/UCLA: el ajuste fino está especializado en las demostraciones del dataset, por lo que su competencia fuera de ese dominio es incierta.
- Tool calling, function calling, agentes multi-paso, modo thinking, audio: no disponible / no documentado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el checkpoint como referencia para reproducir o comparar el fine-tuning de MolmoAct2 sobre el dataset Piper UCLA, evaluando el efecto de 20.000 pasos con batch 16 y action chunk 32.
- Control de un brazo Piper en laboratorio: desplegar el modelo para generar acciones de manipulación en el mismo entorno y configuración de cámara que el dataset de entrenamiento, aprovechando la especialización del fine-tune.
- Baseline para experimentos de VLA en robótica: servir como punto de partida para comparar variantes (distintos batch sizes, pasos o datasets) en la misma familia de modelos.
- Evaluación de transferencia de dominio: medir hasta qué punto un VLA de propósito general fine-tuneado con pocas demostraciones se adapta a una tarea concreta, analizando degradación fuera de distribución.
- Docencia y demostraciones de fine-tuning de modelos VLA: ilustrar el flujo completo desde un modelo base de Hugging Face hasta un checkpoint especializado con código personalizado.
- Replicación de pipelines de entrenamiento: el nombre del repositorio y la model card documentan hiperparámetros clave, lo que facilita reproducir el entrenamiento con el dataset thecqzzz/piper_vla_ucla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 21,8 GB solo para pesos, más memoria para activaciones y el codificador visual; en la práctica se requerirían del orden de 24-32 GB o más según el batch y la resolución de imagen.
- VRAM estimada en bf16/fp16: alrededor de 11 GB para pesos, más overhead; una GPU de 16-24 GB podría ser suficiente para inferencia con batch pequeño, aunque no se documenta soporte de cuantización.
- GPU recomendadas: no disponible de forma explícita; por tamaño, GPUs de datacenter como A100 (40/80 GB) o H100 son las más seguras para entrenamiento y evaluación; para inferencia, una RTX 4090 (24 GB) podría bastar en bf16.
- ¿Cabe en GPU de consumo? Probablemente sí en bf16 en GPUs de 16 GB o más, pero al no documentarse cuantizaciones (GGUF, AWQ, etc.) ni requisitos oficiales, debe considerarse no verificado.
- Opciones de despliegue: no disponible. Al requerir custom_code, es necesario usar transformers con trust_remote_code o el código del repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| piper-ucla-bs16-40k-r2-step020000-molmoact2 | 5.447 M | no disponible | no disponible | Hugging Face (0 descargas) | Fine-tune VLA sobre Piper UCLA |
| allenai/MolmoAct2 (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base de propósito general |
| Otros VLA open source (p. ej. OpenVLA, RT-2) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el fine-tune está entrenado únicamente sobre demostraciones Piper UCLA; su rendimiento fuera de ese dominio, robot o configuración de sensores es incierto y probablemente degradado.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- Sin datos de evaluación: no hay benchmarks, métricas de éxito en tareas ni comparaciones publicadas; no es posible avalar su rendimiento.
- Riesgo de sobreajuste: 20.000 pasos con batch 16 sobre un dataset de demostraciones concreto puede producir sobreajuste a las condiciones de recogida (iluminación, posiciones, objetos).
- Código personalizado: el tag custom_code implica ejecutar código del repositorio, con el riesgo de seguridad asociado; conviene revisarlo antes de cargar el modelo.
- Idiomas no especificados: no se documenta el soporte multilingüe ni la calidad del seguimiento de instrucciones en castellano.
- Madurez: 0 descargas y 0 likes indican un artefacto de investigación sin validación comunitaria.
- Alucinación en el componente de lenguaje: como modelo VLA con base de visión-lenguaje, puede generar descripciones o instrucciones incorrectas; en robótica esto se traduce en acciones erróneas con riesgo físico.

## Enlaces

- Hugging Face: https://huggingface.co/HenryZhang/piper-ucla-bs16-40k-r2-step020000-molmoact2
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Dataset de entrenamiento: https://huggingface.co/datasets/thecqzzz/piper_vla_ucla
