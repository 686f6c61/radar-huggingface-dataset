# kerasformers/glm-4.5v

## Resumen

El modelo `kerasformers/glm-4.5v` es una conversión íntegra a Keras 3 del modelo original `zai-org/GLM-4.5V` de Z.AI, un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) que procesa entradas de imagen y texto para generar texto. Esta versión, desarrollada por el autor `kerasformers`, permite ejecutar el mismo modelo de forma nativa en tres backends de Keras 3: TensorFlow, PyTorch y JAX, sin necesidad de modificar el código. La relevancia de esta conversión radica en que facilita la integración de un modelo de vanguardia en ecosistemas que ya utilizan Keras, ampliando su accesibilidad para desarrolladores e investigadores.

El modelo base GLM-4.5V cuenta con 106 mil millones de parámetros totales, de los cuales 12 mil millones se activan por token, y está diseñado para tareas de razonamiento visual, comprensión de documentos, OCR, análisis de vídeo y automatización de interfaces gráficas. La conversión mantiene los pesos en bfloat16, con el sesgo de corrección del router MoE en float32, replicando la precisión mixta del checkpoint original. La longitud de contexto no se especifica en la información disponible, por lo que se indica como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (vision tower GLM-4V + decoder MoE GLM-4.5) |
| Parametros totales | 106 B |
| Parametros activos | 12 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (almacenados en bfloat16) |

## Arquitectura y entrenamiento

La arquitectura de GLM-4.5V combina un codificador visual (vision tower) basado en GLM-4V con un decodificador MoE derivado de GLM-4.5-Air. El modelo procesa imágenes y texto de forma conjunta, generando respuestas textuales. La conversión de `kerasformers` no implica un reentrenamiento; se trata de una reimplementación en Keras 3 que carga los pesos originales y los ejecuta con el mismo comportamiento. Los pesos se almacenan en bfloat16, mientras que el sesgo de corrección del router MoE se mantiene en float32, replicando la configuración de precisión mixta del checkpoint de Z.AI. No se dispone de información detallada sobre el proceso de entrenamiento del modelo original, como el número de tokens o la composición del dataset, en la documentación proporcionada.

## Capacidades

- Generación de texto multimodal: acepta una o varias imágenes junto con texto y produce respuestas textuales descriptivas o razonadas.
- Razonamiento visual: capaz de responder preguntas sobre el contenido de imágenes, incluyendo relaciones espaciales y detalles finos.
- Comprensión de documentos: extrae información de documentos escaneados, tablas y formularios, con buen rendimiento en OCR.
- Análisis de vídeo: procesa secuencias de vídeo para tareas de comprensión temporal y descripción de eventos.
- Automatización de interfaces gráficas (GUI): puede interpretar capturas de pantalla y generar acciones o código para interactuar con aplicaciones.
- Generación de código front-end: a partir de una imagen de diseño, puede producir código HTML/CSS o similar.
- Grounding y localización espacial: identifica y localiza objetos o regiones específicas dentro de una imagen.
- Multilingüe: soporta inglés y chino, tanto en las instrucciones como en las respuestas.

## Casos de uso

- Extracción de datos de documentos escaneados: el modelo puede procesar facturas, contratos o formularios y devolver los campos relevantes en formato estructurado, gracias a su capacidad de OCR y comprensión de documentos.
- Asistente visual para accesibilidad: una aplicación que describa el entorno a personas con discapacidad visual, usando imágenes capturadas en tiempo real y generando descripciones detalladas.
- Generación de prototipos web a partir de bocetos: un desarrollador sube una captura de un diseño de interfaz y el modelo genera el código HTML/CSS correspondiente, acelerando el desarrollo front-end.
- Automatización de tareas GUI: un agente que observa capturas de pantalla de una aplicación y ejecuta acciones (clic, escritura) para completar flujos de trabajo repetitivos, como rellenar formularios.
- Análisis de vídeo para vigilancia: procesa secuencias de vídeo para detectar eventos anómalos o resumir el contenido, útil en sistemas de seguridad.
- Chat multimodal con contexto visual: un asistente conversacional que recibe imágenes del usuario (fotos de productos, lugares) y responde con información relevante, combinando razonamiento visual y diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original GLM-4.5V reporta un rendimiento de vanguardia en 42 benchmarks públicos de visión y lenguaje, según la documentación de Z.AI, pero no se proporcionan cifras concretas en los materiales consultados. Por tanto, no es posible presentar una tabla comparativa con valores numéricos.

## Requisitos de hardware

- VRAM estimada: con 106 B parámetros en bfloat16, el peso del modelo ocupa aproximadamente 212 GB, por lo que se requiere un clúster de GPUs con al menos 4× A100 de 80 GB o equivalente para inferencia sin cuantización.
- GPU recomendadas: no se especifican modelos concretos, pero por el tamaño se necesitan GPUs de centro de datos (A100, H100) o múltiples GPUs de gama alta.
- Compatibilidad con GPU de consumo: no es viable en una sola GPU de consumo (RTX 4090, etc.) debido a la memoria necesaria; se requeriría cuantización agresiva (int8 o int4) que no está documentada en esta conversión.
- Opciones de despliegue: al ser una implementación de Keras 3, puede ejecutarse con los backends de TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. El modelo se puede comparar cualitativamente con otros MoE multimodales de gran escala como Qwen2-VL-72B o InternVL3, pero no se tienen cifras de rendimiento ni especificaciones detalladas de estos alternativos en los materiales consultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser una conversión no oficial, podría haber pequeñas diferencias de comportamiento respecto al modelo original de Z.AI, aunque se afirma que la implementación es fiel.
- El modelo original puede presentar sesgos en los datos de entrenamiento, especialmente en contextos culturales o geográficos limitados a inglés y chino.
- Riesgo de alucinación en respuestas generadas, especialmente en tareas de razonamiento visual complejo o con imágenes ambiguas.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base original, ya que la model card de `kerasformers` indica MIT, aunque el modelo de Z.AI podría tener términos adicionales.
- El tamaño del modelo (215.7 GB en el repositorio) implica costes de almacenamiento y despliegue significativos.

## Enlaces

- [HuggingFace - kerasformers/glm-4.5v](https://huggingface.co/kerasformers/glm-4.5v)
- [Modelo original - zai-org/GLM-4.5V](https://huggingface.co/zai-org/GLM-4.5V)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de GLM-4.5V en KerasFormers](https://imvision12.github.io/KerasFormers/glm4v_moe/)
- [Paper: GLM-4.1V-Thinking (arXiv:2507.01006)](https://arxiv.org/abs/2507.01006)
- [Documentación oficial de Z.AI para GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v)
