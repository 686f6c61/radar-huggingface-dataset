# Nawal42/balochi-ocr-merged

## Resumen

Nawal42/balochi-ocr-merged es un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4, concretamente un fine-tuning del checkpoint unsloth/gemma-4-E4B-it-unsloth-bnb-4bit. Lo desarrolla el usuario Nawal42 y su propósito declarado, a juzgar por el nombre, es el reconocimiento óptico de caracteres (OCR) sobre texto en balochi, una lengua irania hablada principalmente en Pakistán, Irán y Afganistán. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors para la librería transformers.

El checkpoint cuenta con 7.996.156.490 parámetros según los metadatos de safetensors del repositorio (16 GB de tamaño total), lo que lo sitúa en la franja de los modelos de aproximadamente 8.000 millones de parámetros. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que el autor presenta como un entrenamiento "2x más rápido". La model card es extremadamente escueta: no documenta el dataset de fine-tuning, el número de tokens de entrenamiento, la composición de los datos ni resultados de evaluación.

La relevancia de este modelo es acotada pero específica: cubre una combinación poco frecuente (OCR de una lengua de bajos recursos sobre una arquitectura multimodal moderna) y puede resultar útil como punto de partida para proyectos de digitalización de documentos en balochi. No obstante, la ausencia total de benchmarks, de documentación del dataset y de evaluación de calidad obliga a tratar cualquier uso en producción como experimental y a validar el rendimiento empíricamente antes de desplegarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Gemma 4 E4B; detalles internos no disponibles |
| Parámetros totales | 7.996.156.490 (≈8.000 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para este checkpoint; el modelo base se distribuye en bnb-4bit (bitsandbytes 4 bits); el repo contiene safetensors |
| Idiomas soportados | en (declarado en la model card); el propósito del fine-tuning es balochi, pero no se documenta oficialmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint unsloth/gemma-4-E4B-it-unsloth-bnb-4bit, es decir, una versión de Gemma 4 E4B ya instruida y cuantizada a 4 bits con bitsandbytes por Unsloth. La arquitectura subyacente es la de Gemma 4 en su variante E4B, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto; no se dispone de detalles adicionales sobre el número de capas, la dimensión oculta, el mecanismo de atención ni el tokenizador en la información proporcionada.

El proceso de entrenamiento se realizó con Unsloth y TRL, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de SFT, RLHF o DPO, ni la resolución o el formato de las imágenes de entrenamiento. Tampoco se documenta la técnica de fusión de pesos ("merged") aplicada sobre los adaptadores, más allá de lo que sugiere el nombre del repositorio. La ausencia de estos datos impide evaluar la calidad y la representatividad del ajuste.

## Capacidades

- Generación de texto e inferencia multimodal image-text-to-text, heredadas de Gemma 4 E4B.
- Reconocimiento óptico de caracteres (OCR) orientado, según el nombre del modelo, a texto en balochi.
- Procesamiento de imágenes como entrada junto con instrucciones en lenguaje natural.
- Conversación multi-turno (etiqueta "conversational" en los metadatos).
- Compatibilidad con Text Generation Inference (endpoints_compatible) y con transformers.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este fine-tuning.
- Capacidades multilingües: solo se declara "en"; el soporte de balochi no está verificado ni documentado con métricas.

## Casos de uso

- Digitalización de documentos en balochi: el modelo puede recibir imágenes de páginas escaneadas y devolver texto transcrito, lo que facilitaría la creación de corpus digitales de una lengua con pocos recursos. Es adecuado por su naturaleza image-text-to-text, aunque requiere validación manual de la calidad.
- Extracción de texto de formularios y registros administrativos: en archivos históricos o administrativos en balochi, el modelo podría transcribir campos de texto para su posterior indexación y búsqueda.
- Procesamiento de prensa y publicaciones periódicas: digitalización de periódicos o revistas en balochi para su archivo y consulta, aprovechando la capacidad multimodal para manejar escaneos de distinta calidad.
- Asistencia a la traducción: combinado con un modelo de traducción, el OCR del balochi permitiría construir pipelines de traducción automática a partir de documentos escaneados.
- Preservación lingüística y académica: investigadores en lingüística irania podrían usar el modelo para transcribir corpus de campo o materiales etnográficos, con revisión humana posterior.
- Prototipado de aplicaciones de accesibilidad: lectura en voz alta de documentos en balochi mediante la combinación del OCR con un sistema de síntesis de voz, útil para personas con discapacidad visual.
- Integración en pipelines de TGI: al ser compatible con Text Generation Inference, puede desplegarse como endpoint de inferencia para aplicaciones que envíen imágenes y reciban texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 16 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 24 GB para comodidad.
- VRAM estimada en cuantización de 4 bits (el modelo base se distribuye en bnb-4bit): aproximadamente 5-6 GB para los pesos, con margen adicional para el procesamiento de imágenes.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción con concurrencia; L40S o RTX A6000 para entornos de una sola GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con margen ajustado y en RTX 3090/4080 en cuantización de 4 u 8 bits; en GPUs de 8-12 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, indicado por la etiqueta endpoints_compatible), vLLM (si el soporte multimodal de Gemma 4 está disponible en la versión utilizada), llama.cpp/Ollama solo si existen conversiones GGUF del modelo base compatibles.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y el tamaño de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nawal42/balochi-ocr-merged | ≈8.000 M | no disponible | imagen + texto | Apache 2.0 | Hugging Face (53 descargas) |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | ≈8.000 M | no disponible | imagen + texto | Apache 2.0 (según metadatos) | Hugging Face |
| Gemma 4 E4B-it (original) | ≈8.000 M | no disponible | imagen + texto | Apache 2.0 (según metadatos) | Hugging Face |
| Qwen2.5-VL-7B-Instruct | ≈8.000 M | 128 K (según documentación pública de Qwen) | imagen + texto | Apache 2.0 | Hugging Face |

La comparación con alternativas se limita a la familia de origen y a modelos multimodales de tamaño similar, ya que no hay datos de rendimiento de este checkpoint que permitan una comparación cuantitativa. La ventaja diferencial de este modelo es su especialización declarada en balochi; su desventaja es la falta de documentación y evaluación frente a los checkpoints base y a alternativas consolidadas como Qwen2.5-VL.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: se desconoce la precisión real del OCR en balochi y en otras lenguas.
- La model card no documenta el dataset de entrenamiento, por lo que no puede evaluarse la cobertura de estilos tipográficos, caligrafías o calidades de escaneo.
- Solo se declara el idioma "en" en los metadatos; el soporte de balochi es una inferencia a partir del nombre del repositorio y no está verificado.
- Riesgo de alucinación inherente a los modelos generativos: el modelo puede producir texto plausible pero incorrecto en lugar de transcribir fielmente la imagen.
- El fine-tuning se realizó sobre un checkpoint cuantizado a 4 bits (bnb-4bit), lo que puede introducir degradaciones respecto al modelo original en precisión y estabilidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los términos de uso de Google; conviene revisar la licencia del checkpoint original antes de un despliegue comercial.
- Ausencia de garantías de mantenimiento: el autor no documenta versiones, changelog ni soporte.
- El modelo es de tamaño medio (≈8.000 M) con codificador visual, por lo que la latencia en CPU es elevada y el despliegue en producción requiere GPU.
- No hay información sobre sesgos lingüísticos o culturales del fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nawal42/balochi-ocr-merged
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
