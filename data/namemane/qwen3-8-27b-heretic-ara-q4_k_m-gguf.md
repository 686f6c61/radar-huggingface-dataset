# namemane/Qwen3.8-27B-heretic-ara-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `heretic-org/Qwen3.8-27B-heretic-ara`, una variante "uncensored" (abliterated) del Qwen3.8-27B desarrollado por Qwen. La conversión ha sido realizada por el usuario namemane mediante la herramienta GGUF-my-repo de llama.cpp, y está pensada para su ejecución local con llama.cpp, Ollama u otros motores compatibles con GGUF.

El modelo base Qwen3.8-27B es un transformer multimodal (imagen y texto) con 27 320 millones de parámetros, una ventana de contexto de 256K tokens (según documentación de Unsloth; otras fuentes citan 262K) y capacidades de razonamiento y agente. La versión "heretic-ara" aplica técnicas de abliteration para eliminar los rechazos y restricciones de contenido del modelo original, lo que lo hace adecuado para escenarios donde se requiere una generación sin filtros, aunque con los riesgos asociados.

La cuantización Q4_K_M reduce el tamaño del modelo a aproximadamente 16,8 GB, lo que permite ejecutarlo en GPUs de consumo con 16-24 GB de VRAM o incluso en sistemas con 17 GB de RAM/VRAM según Unsloth. Es una opción práctica para desarrolladores que necesitan un modelo local con visión y razonamiento sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision + texto) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (segun Unsloth; otras fuentes citan 262K) |
| Tipos de cuantizacion | Q4_K_M (este repo); otras cuantizaciones disponibles en el modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso con un encoder de visión integrado que permite procesar tanto texto como imágenes. La arquitectura exacta (número de capas, dimensiones de atención, etc.) no se detalla en la información disponible, pero se sabe que está optimizado para tareas de razonamiento, generación de código y diálogo multimodal.

El entrenamiento original fue realizado por Qwen, aunque no se han publicado detalles sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO. La variante "heretic-ara" ha sido modificada por heretic-org mediante abliteration, una técnica que elimina selectivamente las direcciones de los pesos asociadas a comportamientos de rechazo o censura, dando como resultado un modelo que responde sin restricciones de contenido. Esta modificación no altera las capacidades generales del modelo, pero sí su comportamiento en cuanto a la generación de respuestas sensibles.

## Capacidades

- Generación de texto y diálogo multiuso con razonamiento avanzado.
- Comprensión de imágenes (image-text-to-text), capaz de describir, analizar y responder sobre contenido visual.
- Generación de código en múltiples lenguajes, con soporte para agentes y tool calling (no confirmado explícitamente, pero esperable en la familia Qwen3.8).
- Razonamiento multi-step y planificación de tareas complejas.
- Ventana de contexto larga (256K tokens) que permite manejar documentos extensos o conversaciones prolongadas.
- Capacidad de ejecución local en hardware de consumo gracias a la cuantización GGUF.

## Casos de uso

- Asistente local con visión: un desarrollador puede integrar este modelo en una aplicación de escritorio que reciba capturas de pantalla o fotos y responda preguntas sobre ellas, todo sin conexión a internet.
- Generación de código en entornos aislados: al ser un modelo sin censura, puede utilizarse en pipelines de CI/CD para generar código de prueba o documentación técnica sin restricciones de contenido, aunque se debe supervisar la salida.
- Análisis de documentos largos: gracias a su contexto de 256K tokens, es adecuado para resumir o extraer información de informes extensos, contratos o artículos científicos.
- Chat sin filtros para investigación: útil en entornos de investigación donde se necesitan respuestas sin sesgos de moderación, por ejemplo, en estudios sobre comportamiento de modelos o generación de contenido creativo.
- Prototipado rápido de agentes: su capacidad de razonamiento y posible tool calling permite construir prototipos de agentes que interactúan con APIs o ejecutan comandos, todo localmente.
- Educación y formación: puede servir como herramienta de práctica para estudiantes de IA que quieran experimentar con modelos multimodales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado por Qwen, pero no se incluyen cifras concretas en la documentación de este repositorio. Se recomienda consultar la model card del modelo original para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB con cuantización Q4_K_M, según Unsloth. El archivo GGUF pesa 16,8 GB, por lo que se necesita al menos 16-24 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. También es compatible con GPUs AMD Radeon con soporte ROCm, como se indica en el blog de AMD.
- En CPU: puede ejecutarse con llama.cpp en sistemas con al menos 32 GB de RAM, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, Unsloth Desktop y cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se espera una generación de 20-40 tokens por segundo para modelos de 27B en Q4_K_M, pero esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 256K | Apache 2.0 | Safetensors | Con moderación de contenido |
| heretic-org/Qwen3.8-27B-heretic-ara | 27B | 256K | Apache 2.0 | Safetensors | Sin censura (abliterated) |
| namemane/Qwen3.8-27B-heretic-ara-Q4_K_M-GGUF | 27B | 256K | Apache 2.0 | GGUF | Cuantización Q4_K_M del anterior |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) porque el tamaño y las capacidades multimodales son diferentes. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Al ser una versión "uncensored" o "abliterated", el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No debe utilizarse en aplicaciones orientadas al público general sin una capa de moderación adicional.
- Riesgo de alucinaciones: como todos los modelos de lenguaje, puede inventar información, especialmente en dominios especializados o con entradas ambiguas.
- La ventana de contexto de 256K tokens es amplia, pero el rendimiento puede degradarse con entradas muy largas, y el coste computacional aumenta con la longitud.
- No se han publicado detalles sobre los idiomas soportados; aunque Qwen3.8 es presumiblemente multilingüe, no hay confirmación oficial en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de moderación puede generar responsabilidades legales si se despliega en producción sin control de contenido.
- El modelo es una conversión GGUF, por lo que no es posible fine-tuning directo con las herramientas estándar de transformers; se requiere convertir de vuelta a safetensors o usar técnicas de adaptación específicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/namemane/Qwen3.8-27B-heretic-ara-Q4_K_M-GGUF
- Modelo base (heretic-org): https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Ficha de Qwen3.8-27B en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
