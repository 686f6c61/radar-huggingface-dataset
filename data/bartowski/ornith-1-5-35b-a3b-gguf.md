# bartowski/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje multimodal de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B). El repositorio que nos ocupa es la versión cuantizada en formato GGUF preparada por bartowski, que permite ejecutar el modelo con llama.cpp y herramientas compatibles como Ollama o LM Studio. El modelo acepta entradas de texto e imagen (gracias a un archivo mmproj separado) y soporta decodificación especulativa mediante predicción multi-token (MTP), lo que lo hace interesante para despliegues en entornos con recursos limitados.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (agosto de 2026) de un modelo MoE multimodal de tamaño medio, con licencia MIT, lo que facilita su uso comercial sin restricciones. Al ser una versión GGUF, el despliegue es sencillo en CPU, GPU o configuraciones híbridas, y la disponibilidad de múltiples niveles de cuantización (desde bf16 hasta IQ3_XXS) permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), multimodal (texto e imagen) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible, pero el nombre del modelo (35B-A3B) indica una arquitectura de mezcla de expertos con 35.500 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Se trata de un modelo multimodal que procesa tanto texto como imágenes, y la model card menciona soporte para decodificación especulativa mediante predicción multi-token (MTP), una técnica que acelera la generación al predecir varios tokens a la vez y validarlos en paralelo.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones adicionales en la arquitectura más allá de la multimodalidad y el MTP. La cuantización fue realizada por bartowski con llama.cpp en su versión b10472, utilizando la técnica imatrix (importance matrix) para optimizar la distribución de errores de cuantización.

## Capacidades

- Generación de texto y razonamiento conversacional, siguiendo el formato de prompt ChatML (`<|im_start|>`, `<|im_end|>`).
- Procesamiento multimodal: acepta imágenes como entrada adicional al texto (requiere el archivo mmproj correspondiente).
- Decodificación especulativa mediante MTP, que reduce la latencia de generación en comparación con la decodificación autoregresiva estándar.
- Soporte de cuantización con imatrix, lo que mejora la calidad de las versiones de baja precisión.
- Compatible con el ecosistema llama.cpp: puede ejecutarse en CPU, GPU o modo híbrido, y es utilizable desde herramientas como Ollama, LM Studio o interfaces que usen el backend de llama.cpp.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Asistentes conversacionales locales: gracias a su licencia MIT y a las cuantizaciones compactas (por ejemplo, Q4_K_M de 21,86 GB), puede desplegarse en estaciones de trabajo con 24 GB de VRAM o en configuraciones de CPU con suficiente RAM para ofrecer un asistente de chat privado sin conexión.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, útil para extraer información de facturas, formularios o material gráfico.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden integrar el modelo mediante la API de llama.cpp o servidores compatibles (como llama-server) para probar funcionalidades de generación de texto y comprensión de imágenes sin depender de servicios en la nube.
- Generación de contenido asistida: redacción de borradores, resúmenes o reescritura de textos en entornos donde se requiera control total sobre los datos (por ejemplo, en sectores con requisitos de confidencialidad).
- Educación y experimentación: al ser un MoE de 35B con solo 3B activos, permite estudiar el comportamiento de arquitecturas de mezcla de expertos en hardware modesto, comparando diferentes cuantizaciones y su impacto en la calidad.
- Despliegue en entornos edge o con recursos limitados: las cuantizaciones IQ3_XXS (15,34 GB) o Q3_K_S (15,98 GB) permiten ejecutar el modelo en equipos con 16 GB de RAM o VRAM, aunque con una calidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas estándar, y no se ha accedido a la ficha del modelo original (ornith-ai/Ornith-1.5-35B-A3B) para obtener estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. El archivo Q4_K_M pesa 21,86 GB, por lo que se recomienda al menos 24 GB de VRAM para ejecutarlo completamente en GPU. Las versiones Q8_0 (37,81 GB) requieren 40 GB o más, mientras que las cuantizaciones IQ3_XXS (15,34 GB) pueden caber en GPUs de 16 GB.
- GPU recomendadas: para las cuantizaciones más grandes (Q8_0, Q6_K), se necesitan GPUs profesionales como A100 (40/80 GB) o H100. Para Q4_K_M y similares, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Las versiones más pequeñas (IQ3_XXS, Q3_K_S) pueden ejecutarse en RTX 4080 (16 GB) o incluso en GPUs de 12 GB con offload parcial a CPU.
- Si cabe en consumer GPU: sí, las cuantizaciones Q4_K_M y menores caben en GPUs de consumo con 24 GB de VRAM. Las versiones Q3 e IQ3 pueden funcionar en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, LM Studio, y cualquier herramienta compatible con el formato GGUF. También es posible usar bindings de Python como llama-cpp-python.
- Latencia y throughput: no se han publicado datos específicos. Al ser un MoE con solo 3B parámetros activos, la velocidad de generación debería ser notablemente superior a la de un modelo denso de 35B, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo original, por lo que no es posible realizar una comparativa cuantitativa fiable. En términos de arquitectura, Ornith-1.5-35B-A3B se sitúa en la categoría de MoE de ~35B totales con ~3B activos, similar a otros modelos como Qwen2.5-32B-A3B o Mixtral 8x7B (aunque este último tiene 7B activos). Sin embargo, sin resultados de benchmarks, cualquier comparación sería especulativa. Se recomienda consultar la ficha del modelo original en ornith-ai/Ornith-1.5-35B-A3B para obtener datos de rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo, ya que la model card de la cuantización no los documenta.
- La longitud de contexto no está especificada; es necesario verificarla en la ficha del modelo original antes de usarlo en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están documentados; se desconoce si el modelo funciona bien fuera del inglés.
- Aunque la licencia es MIT (permisiva para uso comercial), la cuantización GGUF no incluye el archivo mmproj necesario para el procesamiento de imágenes; este debe descargarse por separado desde el repositorio del modelo original.
- Las cuantizaciones de baja precisión (Q3, IQ3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento o generación de código.
- El modelo es relativamente reciente (agosto de 2026) y no se han publicado evaluaciones independientes, por lo que su comportamiento en producción debe validarse con casos de uso reales.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- llama.cpp (herramienta de cuantización y ejecución): https://github.com/ggml-org/llama.cpp/
