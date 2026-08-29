# lennyhans/gpt-oss-20b-terminal_lego_glm_5_8k-Q4_K_M-GGUF

## Resumen

El modelo `lennyhans/gpt-oss-20b-terminal_lego_glm_5_8k-Q4_K_M-GGUF` es una conversión a formato GGUF del checkpoint `StephYang/gpt-oss-20b-terminal_lego_glm_5_8k`, un fine-tuning del modelo open-weight `gpt-oss-20b` de OpenAI. Esta versión cuantizada con Q4_K_M reduce el tamaño del modelo a 15,8 GB, lo que permite su ejecución en hardware de consumo con herramientas como llama.cpp, Ollama o cualquier runtime compatible con GGUF. El modelo base, gpt-oss-20b, está diseñado para tareas de razonamiento, generación de código y uso agéntico, aunque este fine-tuning concreto no documenta sus capacidades específicas. La relevancia de esta ficha radica en que ofrece una opción lista para inferencia local de un modelo de 20 000 millones de parámetros, sin necesidad de GPUs de gran tamaño, gracias a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 20 914 757 184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de este modelo en la documentación proporcionada. Se sabe que es un fine-tuning del modelo `gpt-oss-20b` de OpenAI, convertido posteriormente a GGUF mediante la herramienta GGUF-my-repo de llama.cpp. El proceso de entrenamiento del fine-tuning (dataset, método, hiperparámetros) no está documentado en la model card. Tampoco se especifican innovaciones técnicas particulares más allá de la cuantización Q4_K_M aplicada para reducir el tamaño del archivo.

## Capacidades

- No se han documentado capacidades específicas para este fine-tuning en la información disponible.
- Al ser un derivado de `gpt-oss-20b`, se espera que herede capacidades generales de razonamiento, generación de texto y código, aunque no hay confirmación oficial en esta ficha.
- El formato GGUF permite su uso con llama.cpp, llama-server y otras herramientas compatibles, lo que facilita la inferencia local en CPU y GPU.

## Casos de uso

Dado que no hay casos de uso documentados específicamente para este modelo, se listan posibles aplicaciones basadas en el modelo base `gpt-oss-20b` y en la naturaleza del formato GGUF:

- Inferencia local en entornos sin conexión: al ser un archivo GGUF, puede ejecutarse con llama.cpp en portátiles o servidores sin acceso a la nube, usando CPU o GPU.
- Prototipado rápido de aplicaciones de chat: con `llama-server` se puede montar un endpoint HTTP para integrar el modelo en aplicaciones de mensajería o asistentes virtuales.
- Generación de código asistida: el modelo base es conocido por su capacidad en tareas de programación, por lo que este fine-tuning podría emplearse en entornos de desarrollo local.
- Tareas de razonamiento y análisis de texto: útil para resumir documentos, extraer información o responder preguntas complejas en entornos con recursos limitados.
- Despliegue en hardware de consumo: con 15,8 GB de peso, puede cargarse en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080/4090) o en sistemas con 32 GB de RAM para ejecución en CPU.
- Evaluación de modelos en investigación: al ser un fine-tuning específico, puede usarse para comparar el efecto del ajuste fino sobre el modelo base en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica `results: []`, por lo que no hay datos de rendimiento para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 15,8 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo en GPU. En CPU, se necesitan aproximadamente 20 GB de RAM libre.
- GPU recomendadas: NVIDIA RTX 4080/4090 (16-24 GB), A100 (40 GB) o H100 (80 GB) para mayor margen. También puede ejecutarse en GPUs con 16 GB, aunque con limitaciones de contexto.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama alta para consumidores (RTX 3090/4090) y en CPUs modernas con suficiente RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, o cualquier runtime que soporte GGUF. También se puede usar con Transformers mediante la integración de GGUF, aunque no está documentado en esta ficha.
- Latencia y throughput: no se dispone de datos medidos. Dependerá del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A continuación se presenta una comparativa estructural con el modelo base y otra alternativa de tamaño similar, basada únicamente en información pública:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gpt-oss-20b (base) | 20,9 B | 128k (según documentación de OpenAI) | OpenAI-specific | safetensors |
| lennyhans/gpt-oss-20b-terminal_lego_glm_5_8k-Q4_K_M-GGUF | 20,9 B | no disponible | other | GGUF |
| Qwen 2.5 14B (ejemplo) | 14 B | 128k | Apache 2.0 | safetensors/GGUF |

Nota: la comparación con Qwen 2.5 14B es orientativa en cuanto a tamaño, pero no se dispone de datos de rendimiento para este fine-tuning.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa.
- No se ha documentado el proceso de fine-tuning, por lo que se desconocen los datos de entrenamiento y los posibles sesgos introducidos.
- La licencia "other" puede implicar restricciones de uso comercial; se recomienda revisar la licencia del modelo base `gpt-oss-20b` de OpenAI antes de su uso en producción.
- No se especifican idiomas soportados; se asume que el modelo base es multilingüe, pero no está confirmado para este fine-tuning.
- El contexto máximo no está documentado; es posible que el fine-tuning haya modificado la longitud de contexto original del modelo base.
- Al ser un modelo de 20 000 millones de parámetros, requiere recursos de hardware considerables para una inferencia fluida, incluso cuantizado.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/lennyhans/gpt-oss-20b-terminal_lego_glm_5_8k-Q4_K_M-GGUF
- Modelo base (fine-tuning original): https://huggingface.co/StephYang/gpt-oss-20b-terminal_lego_glm_5_8k
- Modelo base de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Documentación de OpenAI sobre gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Repositorio de OpenAI para gpt-oss: https://github.com/openai/gpt-oss
