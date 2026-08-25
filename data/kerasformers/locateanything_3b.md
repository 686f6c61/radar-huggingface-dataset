# kerasformers/locateanything_3b

## Resumen

kerasformers/locateanything_3b es una conversión al framework Keras 3 del modelo NVIDIA LocateAnything-3B, un modelo de visión-lenguaje (VLM) especializado en *visual grounding* y localización de objetos. El modelo predice coordenadas de cajas delimitadoras y puntos a partir de consultas en lenguaje natural, cubriendo tareas como detección de objetos, *referring* (referencias a objetos por descripción), *pointing* (señalar puntos), *layout grounding*, *GUI/text grounding* y OCR. Su innovación principal es el **Parallel Box Decoding**, que permite generar múltiples cajas en paralelo, acelerando significativamente la inferencia frente a modelos de decodificación secuencial.

Desarrollado por la comunidad kerasformers, este checkpoint ofrece el mismo modelo original de NVIDIA pero implementado íntegramente en Keras 3, lo que permite ejecutarlo sin modificaciones sobre TensorFlow, PyTorch o JAX. Con 3 mil millones de parámetros y una ventana de contexto de 32 mil tokens, el modelo combina un codificador de visión MoonViT de resolución nativa, un conector ligero y un decodificador Qwen2.5-3B. Su relevancia radica en ofrecer un modelo unificado de grounding de alta calidad, con licencia NVIDIA no comercial, y en su portabilidad entre frameworks gracias a Keras 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) con vision tower MoonViT, conector y decodificador Qwen2.5-3B |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (por el decodificador Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bfloat16; no se documentan cuantizaciones alternativas) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-3B soporta multiples idiomas, pero no se especifica la cobertura del modelo grounding) |
| Licencia | NVIDIA License (no comercial / solo investigacion) |
| Formato de pesos | safetensors (compatible con el prefijo `hf:` para pesos originales) |

## Arquitectura y entrenamiento

LocateAnything-3B es un modelo de vision-lenguaje para *visual grounding* que combina tres componentes principales: una vision tower **MoonViT** de resolución nativa, un conector pequeño, y un decodificador de lenguaje **Qwen2.5-3B**. El modelo no genera texto descriptivo, sino que produce directamente coordenadas de cajas y puntos sobre un grid de 0 a 1000. La innovación clave es el **Parallel Box Decoding**, que permite decodificar multiples cajas en paralelo en lugar de secuencialmente, reduciendo la latencia y mejorando la calidad de la detección.

El entrenamiento del modelo original (NVIDIA) no se detalla en la información disponible. Esta conversión de KerasFormers preserva los pesos del checkpoint original de NVIDIA, implementando la misma arquitectura en Keras 3. El modelo soporta multiples tareas de grounding mediante instrucciones: detección, *referring* multi-objeto, *pointing*, *layout grounding*, *GUI/text grounding* y OCR. Los resultados se devuelven en un grid de coordenadas de 0 a 1000 que debe escalarse a los píxeles de la imagen original.

## Capacidades

- **Detección de objetos open-vocabulary**: detecta objetos a partir de una descripción textual, devolviendo cajas delimitadoras.
- **Referring multi-objeto**: identifica y localiza objetos referidos por descripciones complejas en lenguaje natural.
- **Pointing**: genera puntos de localización sobre la imagen, útil para tareas de anotación o interacción.
- **Layout grounding**: localiza elementos en layouts de documentos o interfaces.
- **GUI/text grounding**: localiza elementos concretos en interfaces graficas (GUI) o texto en imagenes.
- **OCR localizado**: detecta y localiza texto dentro de una imagen, devolviendo las coordenadas de cada bloque de texto.
- **Multi-backend**: ejecutable sin modificaciones en TensorFlow, PyTorch o JAX gracias a Keras 3.
- **Integración con procesador**: incluye un `LocateAnythingProcessor` que prepara las imágenes y los prompts, y un tokenizer con métodos `parse_boxes`, `parse_points` y `parse_grounding`.

## Casos de uso

- **Anotación automática de datos**: el modelo puede generar cajas delimitadoras para datasets de detección de objetos, acelerando el etiquetado manual en pipelines de datos.
- **Búsqueda visual en catálogos**: a partir de una descripción textual ("zapatillas rojas de running"), el modelo localiza los objetos en imagenes de productos para sistemas de recomendación o búsqueda.
- **Accesibilidad en interfaces**: localizar botones, campos de formulario o elementos de GUI mediante lenguaje natural para facilitar la automatización de pruebas o la navegación asistida.
- **Extracción de texto estructurado**: en combinación con un OCR tradicional, el modelo puede localizar bloques de texto en documentos escaneados, mejorando la precisión de la extracción.
- **Robótica y navegación**: en un sistema de robotica, el modelo puede recibir instrucciones como "ve a la taza azul" y devolver las coordenadas de la taza para que el robot la alcance.
- **Moderación de contenido**: detectar objetos específicos en imágenes (por ejemplo, armas o contenido inapropiado) y devolver su ubicación para revisión humana.
- **Sistemas de QA visual**: integrar el modelo en un pipeline de preguntas y respuestas sobre imagenes, donde la localización del objeto es parte de la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de NVIDIA no incluye una tabla de benchmarks en la model card consultada. Se recomienda consultar el paper [arXiv:2605.27365](https://arxiv.org/abs/2605.27365) para datos de evaluación.

## Requisitos de hardware

- **VRAM estimada**: para el modelo de 3B en bfloat16, se estima un uso de VRAM de aproximadamente 6-8 GB en inferencia. Con cuantización a 8 bits, podría reducirse a unos 3-4 GB.
- **GPU recomendadas**: el modelo puede ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o inferiores con suficiente VRAM. Para producción a escala, se recomienda A100, H100 o similares.
- **Compatibilidad con GPU consumer**: sí, cabe en una RTX 3090/4090 con 24 GB de VRAM, incluso con el modelo en bfloat16 sin cuantizar.
- **Opciones de despliegue**: al ser un modelo Keras 3, puede ejecutarse con TensorFlow Serving, TorchServe, o en un entorno Python con FastAPI. No se mencionan integraciones directas con vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponible en la información proporcionada. La velocidad de inferencia depende del backend (JAX suele ser más rápido en TPU, Torch en GPU) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas principales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kerasformers/locateanything_3b | 3B | 32K | Grounding, detección, OCR, GUI | NVIDIA (no comercial) | HuggingFace |
| nvidia/LocateAnything-3B | 3B | 32K | Grounding, detección, OCR, GUI | NVIDIA (no comercial) | HuggingFace |
| Qwen2.5-VL-3B | 3B | 32K | Visión-lenguaje general, VQA | Apache 2.0 | HuggingFace |
| Florence-2 | 0.23B | - | Grounding, detección, OCR | MIT | HuggingFace |

La comparativa con Qwen2.5-VL-3B es relevante porque LocateAnything usa su decodificador. La diferencia principal está en la especialización: LocateAnything está optimizado para grounding con Parallel Box Decoding, mientras que Qwen2.5-VL es un modelo general de visión-lenguaje. Florence-2 es un modelo mucho más pequeño y también especializado en grounding, pero con menor capacidad de razonamiento.

## Limitaciones y advertencias

- **Licencia no comercial**: el modelo se distribuye bajo la licencia NVIDIA, que limita su uso a fines de investigación y no permite uso comercial. Esto puede ser un problema para empresas que quieran desplegarlo en producción.
- **Sesgos en el dataset**: al estar entrenado en datos de NVIDIA, el modelo puede presentar sesgos hacia los tipos de imágenes y descripciones del dataset de entrenamiento. No se detalla la composición del dataset.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar cajas o puntos incorrectos cuando la instrucción es ambigua o la imagen es compleja. El modelo no proporciona una medida de confianza de sus predicciones.
- **Idiomas**: no se especifican los idiomas soportados. El decodificador Qwen2.5-3B soporta multiples idiomas, pero la calidad del grounding en idiomas distintos del inglés no está garantizada.
- **Cuantización**: no se documentan cuantizaciones oficiales. El uso de cuantización no oficial (GGUF, etc.) puede degradar el rendimiento del modelo.
- **Tamaño del repositorio**: el repo pesa 14.1 GB, lo que puede ser un problema en entornos con limitaciones de espacio o ancho de banda.

## Enlaces

- [Hugging Face - kerasformers/locateanything_3b](https://huggingface.co/kerasformers/locateanything_3b)
- [Hugging Face - nvidia/LocateAnything-3B](https://huggingface.co/nvidia/LocateAnything-3B)
- [Paper - arXiv:2605.27365](https://arxiv.org/abs/2605.27365)
- [Página del paper en HF Papers](https://huggingface.co/papers/2605.27365)
- [Documentación de KerasFormers para LocateAnything](https://imvision12.github.io/KerasFormers/locateanything/)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [NVIDIA Research - LocateAnything](https://research.nvidia.com/labs/lpr/locate-anything/)
- [Licencia NVIDIA](https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE)
