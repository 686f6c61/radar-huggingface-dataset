# hoborific/Glistening-Gem-31B-v2.1-W8A16-FP8

## Resumen

Glistening-Gem-31B-v2.1-W8A16-FP8 es una versión cuantizada del modelo multimodal Glistening-Gem-31B-v2.1, desarrollada por el usuario hoborific. El modelo base, creado por sophosympatheia, es un sistema de 31.273 millones de parámetros clasificado como image-text-to-text, lo que indica capacidad para procesar y generar contenido a partir de imágenes y texto. La cuantización, realizada offline con la librería compressed-tensors, reduce los pesos a precisión FP8 (float8_e4m3fn) manteniendo las activaciones en bf16/fp16, lo que permite un despliegue más eficiente en memoria y cómputo.

La relevancia de esta versión radica en que facilita la ejecución del modelo en hardware específico, principalmente Intel XPU y NVIDIA CUDA (Turing o superior), mediante kernels optimizados para el formato W8A16-FP8. Al cuantizar únicamente las capas lineales de atención y MLP, se conserva la precisión en embeddings, normas, cabezal de salida y la torre de visión, que permanecen en bf16. Esto la convierte en una opción práctica para entornos de producción con restricciones de memoria o que requieran baja latencia.

No se dispone de información pública sobre la arquitectura interna del modelo base, sus datos de entrenamiento o sus capacidades específicas más allá de la naturaleza multimodal. La ficha se centra en los aspectos técnicos de la cuantización y en las condiciones de despliegue documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como "gemma4", multimodal image-text-to-text) |
| Parametros totales | 31.273.088.876 (31,3 B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint con pesos cuantizados en compressed-tensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo base. El tag "gemma4" sugiere una posible relación con la familia Gemma de Google, pero no se puede confirmar. El modelo base es multimodal (image-text-to-text), por lo que se espera una arquitectura con codificador de visión y un decodificador de lenguaje, aunque no se especifican sus componentes.

El proceso de cuantización, descrito en la model card, es offline y utiliza la librería compressed-tensors en formato `float-quantized`. Para cada capa lineal, se calcula una escala por canal de salida a partir de `amax / 448` y se refina mediante una búsqueda de error cuadrático medio sobre nueve fracciones de recorte (0,8 a 1,0 veces amax). Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al más cercano y saturación. Solo se cuantizan las capas lineales 2D: proyecciones de atención (q/k/v/o) y del MLP (gate/up/down). Embeddings, normas, lm_head, routers/experts y la torre de visión se mantienen en bf16 y se listan en la lista de ignorados del checkpoint para que vLLM no los modifique.

No hay datos sobre el entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas adicionales.

## Capacidades

- Procesamiento multimodal: al ser un modelo image-text-to-text, puede recibir imágenes y texto como entrada y generar texto como salida.
- Generación de texto conversacional: el tag "conversational" indica que está orientado a tareas de diálogo.
- Inferencia eficiente en hardware específico: gracias a la cuantización W8A16-FP8, es compatible con kernels optimizados en Intel XPU y NVIDIA CUDA (SM75+).
- No se dispone de información sobre tool calling, razonamiento multi-paso, generación de código, matemáticas u otras capacidades específicas del modelo base.

## Casos de uso

- Asistente multimodal en entornos con memoria limitada: el modelo cuantizado permite ejecutar un sistema de 31B parámetros en GPUs con 40-48 GB de VRAM (por ejemplo, dos RTX 4090 o una A100 80GB), facilitando tareas como descripción de imágenes o respuesta a preguntas visuales.
- Despliegue en infraestructura Intel XPU: al ser el destino principal de la cuantización, es adecuado para servidores basados en procesadores Intel con aceleradores XPU, donde otros formatos cuantizados no están optimizados.
- Chatbots de atención al cliente con soporte visual: el modelo puede procesar capturas de pantalla o fotos enviadas por usuarios y generar respuestas contextuales, reduciendo costes de inferencia frente al modelo sin cuantizar.
- Sistemas de moderación de contenido: análisis de imágenes y texto para detectar contenido inapropiado, con menor huella de memoria que el modelo original.
- Investigación en eficiencia de cuantización: sirve como referencia para evaluar el impacto de la cuantización W8A16-FP8 en modelos multimodales de gran tamaño.
- Prototipado rápido en entornos de desarrollo: al ser compatible con vLLM en CUDA, permite integrarse en pipelines de inferencia existentes sin necesidad de hardware especializado adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones comparativas para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 33,3 GB, lo que corresponde principalmente a los pesos en FP8 (aproximadamente 31 GB para los 31,3 B parámetros). Para cargar el modelo con overhead de activaciones y KV cache, se recomienda al menos 40 GB de VRAM.
- GPU recomendadas: NVIDIA A100 80GB, A6000 48GB, o configuraciones multi-GPU con RTX 4090 (24 GB cada una, se necesitarían al menos dos). En Intel XPU, se requiere hardware con soporte para el kernel `XPUW8A16FP8LinearKernel`.
- Compatibilidad con consumer GPU: es posible ejecutarlo en una RTX 4090 con cuantización adicional (por ejemplo, AWQ o GPTQ), pero el formato W8A16-FP8 nativo requiere al menos 40 GB de VRAM, por lo que una sola GPU consumer no es suficiente.
- Opciones de despliegue: vLLM es la opción documentada, con soporte para Intel XPU y NVIDIA CUDA (SM75+). No se mencionan alternativas como llama.cpp u Ollama, y no se recomienda su uso en CPU, ROCm o TPU.
- Latencia y throughput: no se proporcionan datos numéricos. Se espera que la cuantización W8A16-FP8 ofrezca menor latencia que el modelo en bf16, especialmente en XPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo base no tiene benchmarks públicos en la documentación proporcionada, y no se conocen alternativas directas con el mismo esquema de cuantización. Se podría comparar con Gemma 2 27B o Qwen2.5-VL 32B, pero faltan datos objetivos de rendimiento.

## Limitaciones y advertencias

- Compatibilidad restringida: el modelo solo funciona en Intel XPU y NVIDIA CUDA (Turing o superior). No es compatible con ROCm, CPU, TPU ni otras plataformas, y la carga fallará con un error de kernel en esos entornos.
- Licencia no disponible: no se indica la licencia del modelo base ni de la versión cuantizada, lo que genera incertidumbre sobre su uso comercial y obliga a contactar con el autor antes de utilizarlo en producción.
- Posible degradación de precisión: la cuantización a FP8 puede introducir errores de redondeo, especialmente en tareas que requieren alta precisión numérica, aunque el esquema per-channel con recorte busca minimizarlos.
- Sesgos y alucinaciones: al no tener información sobre el entrenamiento del modelo base, no se pueden evaluar sesgos conocidos ni riesgos de alucinación. Se recomienda realizar pruebas específicas antes de un despliegue real.
- Documentación incompleta: no se publican detalles sobre la arquitectura, el contexto máximo, los idiomas soportados ni los benchmarks, lo que dificulta la evaluación objetiva del modelo.
- Dependencia del modelo base: las capacidades reales dependen enteramente de sophosympatheia/Glistening-Gem-31B-v2.1, del que no se ha verificado su disponibilidad ni mantenimiento.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/hoborific/Glistening-Gem-31B-v2.1-W8A16-FP8
- Modelo base en HuggingFace: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
