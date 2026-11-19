# abhinavmathur/keeplo-tinyclip-coreml

## Resumen
Keeplo TinyCLIP (Core ML) es una conversión a formato Core ML de los codificadores de imagen y texto de TinyCLIP, la familia de modelos CLIP destilados desarrollada por Microsoft. El autor, abhinavmathur, publica estos pesos para su uso en la aplicación iOS Keeplo, orientada a la búsqueda semántica de fotos en el propio dispositivo. El modelo no introduce arquitectura nueva: empaqueta los pesos de TinyCLIP ViT-40M/32 con Text-19M y ViT-61M/32 con Text-29M, ambos entrenados sobre LAION-400M, en paquetes `.mlpackage` listos para ejecutarse con Core ML en hardware Apple.

La relevancia de esta ficha es doble. Por un lado, demuestra un patrón de despliegue de recuperación imagen-texto totalmente local, sin envío de datos a servidores. Por otro, sirve como referencia de conversión de un modelo CLIP destilado a Core ML con pesos int8 y cómputo fp32, manteniendo embeddings normalizados de 512 dimensiones. El repositorio ocupa 0,2 GB e incluye dos variantes pensadas para distintos niveles de hardware: `compact/` para iPhone 15 y anteriores, y `standard/` para iPhones compatibles con Apple Intelligence.

Al tratarse de una conversión y no de un modelo entrenado desde cero, sus capacidades quedan acotadas a las de TinyCLIP: alineación imagen-texto para recuperación, clasificación zero-shot y tareas de similitud semántica entre modalidades. No genera texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres (ViT para imagen, transformer para texto) destilado, convertido a Core ML |
| Parametros totales | Variante compact: ViT-40M + Text-19M; variante standard: ViT-61M + Text-29M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el codificador de texto usa pooling en un índice `eot` explícito; no se documenta el límite de tokens) |
| Tipos de cuantizacion | Pesos int8 con cómputo fp32 en Core ML |
| Idiomas soportados | No disponible (tokenizador BPE de CLIP, vocabulario `openai/clip-vit-base-patch32`) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es TinyCLIP, una familia de modelos CLIP destilados por Microsoft mediante destilación cruzada de modalidades y destilación por afinidad, que reduce drásticamente el número de parámetros del CLIP original manteniendo una alineación imagen-texto razonable. La variante compact combina un ViT de 40M de parámetros con parche 32 y un codificador de texto de 19M; la variante standard sube a ViT-61M y texto de 29M. Ambos se entrenaron sobre LAION-400M, un corpus de pares imagen-texto a escala web.

La conversión a Core ML mantiene dos torres separadas (`tinyclip_<variant>_image.mlpackage` y `tinyclip_<variant>_text.mlpackage`), con pesos cuantizados a int8 y cómputo en fp32, produciendo embeddings normalizados de 512 dimensiones. El codificador de texto aplica pooling en un índice `eot` explícito, y el tokenizador es el BPE de OpenAI CLIP con el vocabulario y las fusiones de `openai/clip-vit-base-patch32`. No se documentan detalles adicionales de entrenamiento (número de tokens, uso de RLHF/DPO) en la información disponible, más allá de lo heredado de los modelos base.

## Capacidades
- Recuperación imagen-texto: genera embeddings de imagen y de texto en un espacio común de 512 dimensiones, lo que permite búsqueda semántica por lenguaje natural sobre una fototeca.
- Clasificación zero-shot: al comparar embeddings de imagen con prompts de texto, puede asignar etiquetas sin entrenamiento específico.
- Similitud imagen-imagen y texto-texto: los embeddings normalizados permiten calcular similitud coseno entre elementos de la misma modalidad.
- Ejecución en el dispositivo: los paquetes Core ML están pensados para inferencia local en hardware Apple, sin conexión a red.
- Dos variantes de rendimiento: `compact/` para iPhone 15 y anteriores, `standard/` para iPhones con Apple Intelligence.
- Tokenización CLIP estándar: compatible con el vocabulario BPE de OpenAI CLIP, lo que facilita la integración con pipelines existentes.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión generativa ni audio.

## Casos de uso
- Búsqueda semántica de fotos en iOS: la app indexa la fototeca calculando embeddings de imagen con la torre visual y consulta con texto libre mediante la torre de texto; todo ocurre en el dispositivo, por lo que las fotos no salen del teléfono.
- Etiquetado automático de imágenes en local: comparando cada imagen con un conjunto de prompts de texto se obtienen etiquetas zero-shot para organizar álbumes o filtrar contenido.
- Deduplicación y agrupación de fotos: la similitud coseno entre embeddings de imagen permite detectar imágenes casi idénticas o agrupar fotos por escena.
- Filtrado de contenido sensible en el dispositivo: clasificación zero-shot de imágenes contra prompts descriptivos antes de mostrarlas o compartirlas, sin enviar datos a un servidor.
- Prototipado de aplicaciones de visión en macOS/iOS: los `.mlpackage` se integran directamente en Xcode y permiten validar flujos de recuperación imagen-texto sin depender de infraestructura de servidor.
- Recomendación de contenido visual: indexar un catálogo de imágenes con la torre visual y recomendar elementos similares a una consulta de texto o a una imagen de referencia.
- Investigación sobre modelos CLIP destilados: la conversión sirve como base para estudiar el impacto de la cuantización int8 en la calidad de los embeddings en hardware Apple.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@K, mAP), clasificación zero-shot ni latencia medida en dispositivos concretos.

## Requisitos de hardware
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada de dispositivos Apple. El repositorio completo ocupa 0,2 GB, y cada variante contiene dos paquetes (imagen y texto) con pesos int8.
- GPU recomendadas: hardware Apple con Neural Engine o GPU integrada; la variante `compact/` está pensada para iPhone 15 y anteriores, y `standard/` para iPhones compatibles con Apple Intelligence.
- Cabe en hardware de consumo: sí, está diseñado explícitamente para ejecutarse en iPhone y, por extensión, en Mac con chip Apple Silicon mediante Core ML.
- Opciones de despliegue: Core ML (`.mlpackage`) en iOS y macOS a través de Xcode; no se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se documentan mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keeplo TinyCLIP Core ML (compact) | ViT-40M + Text-19M | No disponible | `.mlpackage` | MIT | Hugging Face |
| TinyCLIP ViT-40M/32 Text-19M (original) | ViT-40M + Text-19M | No disponible | PyTorch | MIT | Hugging Face (`wkcn/...`) |
| TinyCLIP ViT-61M/32 Text-29M (original) | ViT-61M + Text-29M | No disponible | PyTorch | MIT | Hugging Face (`wkcn/...`) |
| OpenAI CLIP ViT-B/32 | ~151M (ViT-B + texto) | 77 tokens | PyTorch, ONNX | MIT | Hugging Face / OpenAI |

La comparación relevante es contra los modelos base de TinyCLIP: esta conversión no cambia parámetros ni datos de entrenamiento, solo el formato y la cuantización (int8 en pesos). Frente a CLIP ViT-B/32, TinyCLIP reduce el número de parámetros de forma sustancial a costa de cierta pérdida de calidad en la alineación imagen-texto, un compromiso habitual en despliegues en dispositivo. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias
- Al ser una conversión de TinyCLIP, hereda los sesgos de LAION-400M, un corpus web con sesgos demográficos y culturales conocidos.
- La cuantización int8 de los pesos puede degradar ligeramente la calidad de los embeddings respecto a los pesos originales en fp32; no se documenta la magnitud de esa pérdida.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- El soporte de idiomas no está documentado; el tokenizador es el BPE de CLIP, entrenado principalmente con texto en inglés, por lo que el rendimiento en castellano puede ser inferior.
- El límite de tokens del codificador de texto no se especifica; el pooling se hace en un índice `eot` explícito, lo que exige respetar el formato de entrada esperado.
- La licencia es MIT, lo que permite uso comercial, pero los datos de entrenamiento (LAION-400M) están sujetos a sus propios términos y deben revisarse para producción.
- Los scripts de conversión están en un repositorio privado (`abhinavmathur84/declutter-ios`), por lo que no es posible reproducir la conversión sin acceso a dicho repositorio.
- El repositorio no registra descargas ni likes, lo que sugiere poca validación comunitaria; conviene evaluar la calidad de los embeddings en el caso de uso concreto antes de desplegar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/abhinavmathur/keeplo-tinyclip-coreml
- Modelo base TinyCLIP ViT-40M/32 Text-19M: https://huggingface.co/wkcn/TinyCLIP-ViT-40M-32-Text-19M-LAION400M
- Modelo base TinyCLIP ViT-61M/32 Text-29M: https://huggingface.co/wkcn/TinyCLIP-ViT-61M-32-Text-29M-LAION400M
- Repositorio TinyCLIP de Microsoft: https://github.com/microsoft/Cream/tree/main/TinyCLIP
- Repositorio CLIP de OpenAI: https://github.com/openai/CLIP
- Tokenizador de referencia: https://huggingface.co/openai/clip-vit-base-patch32
- Scripts de conversión (repositorio privado): https://github.com/abhinavmathur84/declutter-ios
