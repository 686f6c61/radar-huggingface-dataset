# jk797/Qwen3.8-27B-oQ6e-mtp

## Resumen

Qwen3.8-27B-oQ6e-mtp es una cuantización de 6 bits en formato oQ6e del modelo Qwen3.8-27B, un modelo multimodal denso de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión cuantizada, producida con la librería oMLX 0.6.0, conserva los componentes de visión y los pesos MTP (Multi-Token Prediction) del modelo original, lo que la hace adecuada para despliegue en hardware local con requisitos de memoria reducidos. El modelo base destaca por su ventana de contexto nativa de 262 000 tokens y su capacidad para tareas de codificación, flujos de trabajo agénticos y automatización de oficina.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con capacidades multimodales en equipos de consumo, manteniendo un equilibrio entre calidad y eficiencia. Al estar basado en MLX, se integra de forma nativa con el ecosistema de Apple Silicon, aunque también es posible utilizarlo con otros motores de inferencia. El repositorio incluye los pesos en formato safetensors y está etiquetado como image-text-to-text, lo que confirma su naturaleza multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27B (modelo base); el repo cuantizado muestra 6 612 941 552 en safetensors, posiblemente por la cuantización o un error de metadatos |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | oQ6e (6 bits) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe) |
| Licencia | Apache 2.0 (según fuentes web del modelo base); en HuggingFace figura "no disponible" |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que integra un codificador de visión para procesar imágenes y vídeo, junto con un decodificador de lenguaje. Incorpora un mecanismo de razonamiento configurable que permite alternar entre modos de pensamiento explícito y respuesta directa. La cuantización oQ6e, aplicada con oMLX 0.6.0, utiliza un modelo de sensibilidad basado en la versión de 8 bits de MLX Community para determinar qué pesos requieren mayor precisión. Los pesos MTP (Multi-Token Prediction) se conservan íntegros, lo que permite acelerar la decodificación especulativa si el motor de inferencia lo soporta.

No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base. Según las fuentes web, el modelo está optimizado para tareas de codificación, razonamiento multi-paso y uso de herramientas, lo que sugiere un entrenamiento con datos de código, instrucciones y preferencias humanas, aunque no se especifican los métodos exactos (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable (thinking mode).
- Comprensión de imágenes y vídeo (entrada multimodal nativa).
- Generación y comprensión de código en múltiples lenguajes de programación.
- Soporte de tool calling / function calling para integración con APIs y herramientas externas.
- Capacidad para flujos de trabajo agénticos de largo horizonte, con manejo de feedback de herramientas y entornos.
- Multilingüe (el modelo base soporta numerosos idiomas, aunque no se listan los específicos).
- Decodificación especulativa gracias a los pesos MTP conservados.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, extraer información de imágenes y generar resúmenes o informes, aprovechando su ventana de contexto de 262K tokens para manejar documentos extensos.
- Asistente de codificación en IDE: integrado como autocompletado o chat, genera código, explica fragmentos y sugiere refactorizaciones, con soporte de tool calling para ejecutar comandos o consultar repositorios.
- Agente autónomo de navegación web: gracias a su capacidad de razonamiento multi-paso y manejo de feedback, puede realizar tareas como rellenar formularios, buscar información o interactuar con aplicaciones web.
- Análisis de imágenes médicas o técnicas: el componente de visión permite describir imágenes, detectar anomalías o generar informes descriptivos, siempre con supervisión humana.
- Chatbot de atención al cliente multimodal: gestiona conversaciones que incluyen capturas de pantalla o fotos, manteniendo el contexto a lo largo de interacciones largas.
- Investigación académica: procesa papers, figuras y tablas, y genera resúmenes o responde preguntas sobre el contenido, útil para revisiones bibliográficas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización oQ6e. Los datos disponibles corresponden al modelo base Qwen3.8-27B según fuentes web:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores son orientativos y pueden variar en la versión cuantizada. No se dispone de resultados de MMLU, HumanEval o GSM8K en la información recopilada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23.7 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo en 6 bits. Con cuantizaciones más agresivas (4 bits) podría reducirse a ~16 GB, pero no se proporcionan en este repo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En Apple Silicon, los Mac con 32 GB o más de memoria unificada pueden ejecutarlo a través de MLX.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM, como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: al ser formato MLX, se integra con oMLX y el ecosistema MLX de Apple. También puede convertirse a GGUF para usar con llama.cpp u Ollama, aunque no se incluye en el repo. Para servidores, vLLM o SGLang soportan el modelo base.
- Latencia y throughput: no disponibles para esta cuantización específica. En general, un modelo 27B en 6 bits en una RTX 4090 puede alcanzar decenas de tokens por segundo, pero depende del motor y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-oQ6e-mtp (este) | 27B (cuantizado 6 bits) | 262K | Apache 2.0 (heredada) | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | HuggingFace |
| Qwen2.5-VL-27B | 27B | 128K | Apache 2.0 | HuggingFace |

El modelo base compite directamente con otros VLMs de 27B como Qwen2.5-VL, ofreciendo mayor contexto y mejor rendimiento en tareas agénticas según las fuentes. La cuantización oQ6e no altera la licencia ni las capacidades, solo reduce el tamaño.

## Limitaciones y advertencias

- La cuantización de 6 bits puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original, especialmente en tareas de razonamiento complejo o generación de código.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de gran tamaño entrenado con datos web, puede reflejar sesgos sociales y culturales presentes en esos datos.
- Riesgo de alucinación en contextos largos o cuando se le piden datos precisos; se recomienda verificar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar que la cuantización mantenga esa licencia; en HuggingFace figura como "no disponible", por lo que se debe contactar con el autor para confirmar.
- El formato MLX está orientado a Apple Silicon; para usar en GPUs NVIDIA es necesario convertir los pesos a otros formatos (GGUF, etc.), lo que puede requerir herramientas adicionales.
- El repositorio tiene 0 descargas y 1 like, lo que indica que es una publicación reciente o poco validada; se recomienda probar antes de usar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jk797/Qwen3.8-27B-oQ6e-mtp
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
- Artículo de Lovable App: https://lovableapp.org/blog/qwen3-8-27b
- Artículo de Yotta Labs: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
