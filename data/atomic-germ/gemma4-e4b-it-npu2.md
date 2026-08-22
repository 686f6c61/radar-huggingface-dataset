# Atomic-Germ/Gemma4-E4B-IT-NPU2

## Resumen

Gemma4-E4B-IT-NPU2 es un fine-tuning del modelo Gemma 4 E4B de Google DeepMind, publicado por el usuario Atomic-Germ en Hugging Face. Gemma 4 es una familia de modelos abiertos multimodal (texto, imagen y audio como entrada, texto como salida) diseñada para ejecutarse en dispositivos locales, desde móviles hasta servidores. El modelo base E4B tiene 4.5 mil millones de parámetros efectivos (8B contando embeddings) y una ventana de contexto de 128K tokens, lo que lo sitúa en la gama de los modelos pequeños de la familia.

La relevancia de este modelo reside en que mantiene las capacidades del Gemma 4 E4B original —razonamiento con modos de pensamiento configurables, function calling nativo, soporte de sistema nativo y comprensión multilingüe en más de 140 idiomas— mientras que el sufijo NPU2 sugiere una optimización específica para unidades de procesamiento neuronal (NPU), habitual en entornos de edge computing. El repositorio pesa 9.1 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Al ser un fine-tune publicado sin documentación técnica adicional en la model card, no se dispone de detalles sobre el proceso de entrenamiento específico ni de métricas propias. Toda la información técnica disponible corresponde al modelo base Gemma 4 E4B de Google DeepMind, que se detalla a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (sliding window + atención global) con Per-Layer Embeddings |
| Parametros totales | 8B (incluyendo embeddings); 4.5B efectivos |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin archivos GGUF publicados) |
| Idiomas soportados | más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9.1 GB) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B emplea una arquitectura transformer con atención híbrida que intercala ventanas deslizantes locales de 512 tokens con capas de atención global completa, garantizando que la última capa sea siempre global. Esta combinación reduce el uso de memoria en contextos largos manteniendo la capacidad de razonamiento profundo. Además, incorpora Per-Layer Embeddings (PLE), que asigna una tabla de embeddings pequeña a cada capa del decodificador, lo que explica la diferencia entre los 8B de parámetros totales y los 4.5B efectivos: las tablas de embeddings son grandes pero solo se usan para búsquedas rápidas. Las capas globales emplean Keys y Values unificados y Proportional RoPE (p-RoPE) para optimizar la memoria en contextos extensos.

El modelo base fue entrenado por Google DeepMind y ha pasado por un proceso de ajuste por instrucciones (instruction tuning), con soporte de system prompt nativo y function calling. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF, DPO, etc.) en la información disponible. Respecto al fine-tune NPU2, el autor no proporciona ninguna descripción técnica adicional en la model card, por lo que se desconocen los datos específicos de este ajuste.

## Capacidades

- Generación de texto multimodal: acepta entrada de texto, imagen y audio (el modelo base E4B soporta audio de forma nativa) y genera respuestas de texto.
- Razonamiento con thinking mode: los modos de pensamiento son configurables, permitiendo activar o desactivar el razonamiento explícito según la tarea.
- Function calling nativo: soporte integrado para llamadas a funciones, orientado a agentes autónomos y flujos de trabajo de automatización.
- Soporte de agentes: capacidades mejoradas para razonamiento multi-paso y ejecución de tareas complejas.
- Multilingüe: más de 140 idiomas soportados.
- System prompt nativo: soporte del rol `system` en conversaciones, permitiendo un control estructurado del comportamiento del modelo.
- Comprensión de imágenes con relación de aspecto variable y resolución ajustable.

## Casos de uso

- **Asistente de voz local**: gracias al soporte nativo de audio y su tamaño compacto, el modelo puede integrarse en asistentes personales que procesan comandos de voz sin conexión a internet, por ejemplo en un Raspberry Pi o un portátil de gama media.
- **Atención al cliente automatizada**: con una ventana de 128K tokens y soporte de system prompt, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de una sesión de soporte en memoria.
- **Transcripción y resumen de reuniones**: al aceptar audio como entrada, se puede utilizar para transcribir grabaciones y generar resúmenes estructurados, aprovechando su capacidad de razonamiento para extraer acuerdos y acciones.
- **Generación de código en entornos de desarrollo**: soporta function calling y puede integrarse en pipelines de CI/CD para generar o revisar código, o actuar como copiloto en editores de código, con la ventaja de ejecutarse localmente para evitar filtrar código propietario.
- **Análisis de documentos con imágenes**: su entrada multimodal permite procesar capturas de pantalla, diagramas o fotografías de documentos y generar descripciones o extraer datos, útil en automatización de oficina.
- **Prototipado de agentes autónomos**: su soporte nativo de function calling y razonamiento multi-paso lo convierte en una base adecuada para prototipar agentes que consultan APIs, gestionan calendarios o interactúan con bases de datos, con la ventaja de un modelo de solo 4.5B parámetros efectivos que cabe en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune NPU2 en la información disponible. Los datos que se muestran a continuación corresponden al modelo base Gemma 4 E4B de Google DeepMind, según la model card oficial:

| Benchmark | Gemma 4 E4B | Gemma 3 27B (no think) |
|---|---|---|
| MMLU Pro | 69.4% | 67.6% |
| AIME 2026 no tools | 42.5% | 20.8% |
| LiveCodeBench v6 | 77.1% | no disponible |

Estos resultados indican un rendimiento competitivo para su tamaño, destacando especialmente en tareas de razonamiento matemático (AIME) y codificación (LiveCodeBench), superando al modelo anterior de mayor tamaño.

## Requisitos de hardware

- **VRAM estimada**: 8 GB como mínimo para el modelo base en FP16, según gemma4.dev. Con cuantización de 4 bits podría reducirse a aproximadamente 4-5 GB, aunque no se dispone de archivos GGUF oficiales en el repositorio.
- **GPU recomendadas**: tarjetas de consumo como RTX 3060 12GB, RTX 4070 o superiores. En el caso de cuantización ligera, podría ejecutarse en GPUs de 6 GB.
- **Opciones de despliegue**: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp (si se generan archivos GGUF), Ollama y el framework de Hugging Face.
- **Latencia**: no disponible. Al ser un modelo denso de 4.5B parámetros efectivos, la latencia será baja en GPUs modernas, pero no se han publicado mediciones específicas.
- **Nota sobre NPU**: el nombre del repositorio sugiere optimización para NPUs, aunque no se proporciona documentación al respecto; se recomienda probar en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | MMLU Pro |
|---|---|---|---|---|---|
| Gemma 4 E4B (base) | 4.5B efectivos | 128K | Sí (texto, imagen, audio) | Apache 2.0 | 69.4% |
| Gemma 4 E2B | 2.3B efectivos | 128K | Sí (texto, imagen, audio) | Apache 2.0 | 60.0% |
| Gemma 3 27B | 27B | 128K | Sí (texto, imagen) | Apache 2.0 | 67.6% |
| Gemma 4 26B A4B | 3.8B activos / 25.2B total | 256K | Sí (texto, imagen) | Apache 2.0 | 82.6% |

El modelo E4B se sitúa entre el pequeño E2B y los modelos de gama media de la familia. Su rendimiento en MMLU Pro supera al Gemma 3 27B, con la ventaja de un tamaño mucho menor. La comparativa con el MoE de 26B muestra que el modelo denso es menos capaz en razonamiento, pero es más adecuado para despliegue en dispositivos con recursos limitados.

## Limitaciones y advertencias

- **Sesgos**: al igual que el resto de modelos de la familia Gemma, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en contextos culturales o sociales no representados adecuadamente.
- **Riesgo de alucinación**: en tareas de razonamiento complejo o con contextos ambiguos, el modelo puede generar información inventada, por lo que se recomienda verificar las salidas en aplicaciones de producción.
- **Limitaciones de contexto**: aunque la ventana es de 128K tokens, el rendimiento puede degradarse en contextos cercanos al límite, especialmente en tareas de razonamiento que requieren atención global sobre todo el texto.
- **Idiomas**: aunque soporta más de 140 idiomas, el rendimiento no es uniforme y puede ser inferior en idiomas menos representados en el entrenamiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero es necesario consultar los términos específicos del acuerdo de licencia de Gemma 4 de Google, que puede incluir restricciones de uso aceptable.
- **Fine-tune NPU2**: no se dispone de documentación sobre el proceso de ajuste ni sobre los cambios realizados respecto al modelo base. Se recomienda validar el comportamiento en casos de uso reales antes de desplegarlo en producción.

## Enlaces

- [Repositorio de Hugging Face del modelo NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E4B-IT-NPU2)
- [Modelo base Gemma 4 E4B en Hugging Face](https://huggingface.co/google/gemma-4-E4B-it)
- [Model card oficial de Gemma 4 en Google AI](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Página de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Página de Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Documentación de Gemma 4](https://ai.google.dev/gemma/docs/core)
