# paperinstruments/Ultramarine-1-Flash

## Resumen

Ultramarine-1-Flash es un modelo multimodal (imagen-texto a texto) publicado por el usuario paperinstruments en HuggingFace. Se trata de un ajuste fino (finetune) sobre GLM-5.3-Flash, el modelo base desarrollado por zai-org, heredando su arquitectura y capacidades conversacionales. Con más de 321.000 millones de parámetros, se sitúa en la categoría de modelos de muy gran escala, orientado a tareas de comprensión y generación de texto con entrada de imágenes y texto.

El modelo aborda el problema de la comprensión visual y conversacional en un único modelo de gran tamaño, permitiendo razonar sobre imágenes y documentos junto con instrucciones en lenguaje natural. Su relevancia radica en que parte de una familia de modelos (GLM) con buen rendimiento en razonamiento y código, añadiendo una capa de especialización por parte de la comunidad.

La distribución se realiza en formato safetensors con cuantización FP8, requiere aceptar una licencia personalizada (ultramarine-1-flash-license) y el repositorio ocupa 331 GB, lo que delimita claramente el perfil de hardware necesario para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM (glm5_next), multimodal image-text-to-text |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | no disponibles |
| Licencia | ultramarine-1-flash-license (otra, personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ultramarine-1-Flash se construye sobre GLM-5.3-Flash de zai-org, empleando la arquitectura glm5_next dentro del ecosistema Transformers. Al tratarse de un finetune, la base arquitectónica, el preentrenamiento y el alineamiento inicial corresponden al modelo original de Z.ai, sobre el cual paperinstruments ha aplicado un ajuste posterior cuyos datos y metodología no están documentados en la información disponible. El pipeline image-text-to-text indica que integra un componente de visión capaz de procesar imágenes junto al texto.

El repo distribuye los pesos en FP8, una cuantización de 8 bits en coma flotante que reduce aproximadamente a la mitad el footprint de memoria frente a BF16, manteniendo buena fidelidad numérica. No se dispone de detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO en el ajuste fino.

## Capacidades

- Comprensión multimodal: procesamiento de entradas combinadas de imagen y texto (pipeline image-text-to-text).
- Generación de texto conversacional, heredada del modelo base GLM-5.3-Flash.
- Compatibilidad con la librería Transformers de HuggingFace.
- Pesos compatibles con endpoints de inferencia (endpoints_compatible).
- Capacidades de razonamiento, código y tool calling: no disponibles (no documentadas para este finetune).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir capturas, diagramas o documentos escaneados junto a instrucciones en lenguaje natural para extraer información, resumir o responder preguntas sobre su contenido.
- Asistentes conversacionales multimodales: gracias a su base GLM-5.3-Flash, puede integrarse en chatbots que necesiten entender imágenes enviadas por el usuario durante la conversación.
- Generación de descripciones y metadatos de imágenes: útil para catalogar grandes volúmenes de contenido visual en sistemas de gestión de activos digitales.
- Moderación de contenido: análisis de imágenes junto al texto que las acompaña para detectar contenido inapropiado en plataformas con aportación de usuarios.
- Investigación en modelos de gran escala: al ser un finetune comunitario con licencia específica, sirve como punto de partida para estudios sobre adaptación de modelos GLM de gran tamaño.
- Extracción de datos estructurados de interfaces gráficas: interpretación de capturas de pantallas de aplicaciones o paneles para automatizar flujos de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321.300 millones de parámetros en FP8, se requieren del orden de 320-350 GB solo para los pesos, más memoria para KV cache y activaciones; en la práctica, un nodo multi-GPU.
- GPU recomendadas: nodos con 8x H100 u 8x H200 (80-141 GB cada una); también viables configuraciones con A100 80GB en multi-nodo. No cabe en GPUs de consumo como la RTX 4090 (24 GB) ni en estaciones de trabajo convencionales.
- Consumer GPUs: no es viable su ejecución en GPUs de consumo; el tamaño del repo (331 GB) y la cuantización FP8 lo reservan a infraestructura de centro de datos.
- Opciones de despliegue: Transformers (librería nativa del modelo) y endpoints de inferencia de HuggingFace; la compatibilidad con vLLM, TGI, llama.cpp u Ollama no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Cuantizacion | Licencia |
|---|---|---|---|---|
| Ultramarine-1-Flash (este modelo) | 321.323.031.390 | Sí (imagen-texto a texto) | FP8 | ultramarine-1-flash-license (personalizada) |
| GLM-5.3-Flash (base, zai-org) | no disponible | Sí | no disponible | no disponible |
| Llama 4 Maverick | ~400.000 millones (MoE) | Sí | BF16 / cuantizaciones comunitarias | Llama 4 Community License |
| Qwen3-VL 235B | ~235.000 millones | Sí | BF16 / FP8 / GGUF | Apache 2.0 |

Nota: los datos de GLM-5.3-Flash no constan en la información proporcionada y se indican como no disponibles; los de Llama 4 Maverick y Qwen3-VL son referencias orientativas de la misma categoría de tamaño.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones de la licencia ultramarine-1-flash-license en HuggingFace antes de descargar los pesos; las condiciones de uso comercial deben revisarse en el texto de la licencia, ya que no es una licencia abierta estándar.
- Barrera de hardware muy alta: con más de 321.000 millones de parámetros, su despliegue exige infraestructura multi-GPU de gama alta, lo que lo hace poco práctico para equipos pequeños.
- Documentación escasa: no hay información publicada sobre longitud de contexto, idiomas soportados, datos del ajuste fino ni benchmarks, lo que dificulta evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación: como todo modelo de lenguaje de gran tamaño, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento factual; se recomienda verificación en producción.
- Sesgos: hereda los sesgos presentes en los datos de preentrenamiento de GLM-5.3-Flash y en los datos del finetune, cuya composición no está documentada.
- Trazabilidad del finetune: al ser un modelo comunitario derivado, no hay garantías publicadas sobre la calidad o procedencia de los datos de ajuste.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/paperinstruments/Ultramarine-1-Flash
- Modelo base (GLM-5.3-Flash, zai-org): https://huggingface.co/zai-org/GLM-5.3-Flash
- Paper, blog o repositorio del finetune: no disponibles
