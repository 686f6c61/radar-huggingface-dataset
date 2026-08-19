# Davidmg0815/Qwen3.8-27B-MTP-GGUF

## Resumen

Este repositorio contiene una conversión GGUF del modelo Qwen/Qwen3.8-27B, un modelo multimodal de 27.000 millones de parámetros desarrollado por Alibaba. La particularidad principal es que incluye un archivo separado con el cabezal de Multi-Token Prediction (MTP) como modelo draft para decodificación especulativa, lo que permite acelerar la generación de texto entre 1,6 y 2,7 veces según el tipo de contenido. El autor, Davidmg0815, ha construido los archivos a partir de los pesos BF16 originales, eliminando los tensores MTP del modelo principal y empaquetándolos en un archivo dedicado para que `llama-server` pueda cargarlos como draft.

El modelo está pensado para su uso con llama.cpp y `llama-server`, y soporta entrada de imágenes y video mediante un proyector multimodal (`mmproj`). Se ofrecen dos cuantizaciones principales (Q8_0 y Q6_K) más el draft MTP en Q8_0. Según las mediciones del autor, la cuantización Q8_0 es más rápida que Q6_K a pesar de ocupar más espacio, debido a la menor carga computacional de su estructura de bloques. El contexto probado alcanza 97.024 tokens, con un coste de VRAM adicional mínimo para el draft.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal, con soporte MTP) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 97.024 tokens (probado en el test; contexto máximo no especificado) |
| Tipos de cuantizacion | Q8_0, Q6_K, MTP Q8_0, mmproj F16 |
| Idiomas soportados | Alemán (de), inglés (en) según metadatos |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors originales en BF16) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del checkpoint Qwen/Qwen3.8-27B, que utiliza la arquitectura `Qwen3_5ForConditionalGeneration`. Esta arquitectura hereda el soporte para Multi-Token Prediction (MTP) a través de la cadena `Qwen3_5TextModel → _LinearAttentionVReorderBase → Qwen3NextModel → _QwenMtpMixin`. El autor ha separado los tensores MTP del modelo principal (`--no-mtp`) y los ha empaquetado en un archivo draft independiente (`--mtp`), lo que permite su uso con decodificación especulativa en `llama-server`.

No se proporcionan detalles sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). La model card solo indica que la conversión se realizó a partir de los pesos BF16 originales (51,3 GB, 16,00 BPW), evitando doble cuantización. Tampoco se especifican innovaciones técnicas adicionales más allá del soporte MTP y la naturaleza multimodal.

## Capacidades

- Generación de texto conversacional con soporte para contexto largo (97K tokens probados).
- Procesamiento multimodal de imágenes y video mediante el proyector `mmproj-F16.gguf`.
- Decodificación especulativa con MTP: acelera la generación entre 1,56× y 2,71× según el tipo de texto, con una tasa de acierto global del 57,3 %.
- Soporte para tareas de traducción, generación de código, estructuración JSON y texto técnico, con aceleraciones de 2,26×, 1,79×, 2,07× y 1,81× respectivamente.
- Compatible con `llama-server` y la librería llama.cpp, incluyendo opciones como `--spec-type draft-mtp`, `--flash-attn` y KV-cache cuantizado.
- Idiomas soportados según metadatos: alemán e inglés.

## Casos de uso

- Chat conversacional con contexto largo: el modelo puede mantener diálogos de hasta 97K tokens, lo que permite incluir historiales extensos o documentos completos en la conversación. La decodificación especulativa acelera la respuesta en flujo de texto hasta 1,72×.
- Traducción automática: con una tasa de acierto del draft del 70,9 %, la generación se acelera 2,26×, útil para traducir textos largos de forma interactiva.
- Generación de código: el modelo acelera 1,79× en tareas de código, y puede integrarse en asistentes de programación o pipelines de CI/CD para autocompletado o revisión.
- Estructuración de datos JSON: la aceleración de 2,07× en salidas estructuradas lo hace adecuado para generar respuestas JSON en APIs o extracción de datos.
- Análisis de imágenes y video: gracias al proyector multimodal, puede procesar entradas visuales, por ejemplo para descripción de imágenes o extracción de información de capturas.
- Generación de texto repetitivo o enumeraciones: en tareas como listados o plantillas, el draft alcanza una tasa de acierto del 85-93 %, acelerando hasta 2,71×, ideal para generación masiva de contenido estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de velocidad de inferencia con y sin decodificación especulativa, realizadas en un sistema con 3× NVIDIA RTX 3080 20 GB, AMD EPYC 7F32, llama.cpp build 10423, contexto 97.024 tokens y KV-cache Q8_0. Los resultados son los siguientes:

| Textsorte | Sin draft (t/s) | Con draft (t/s) | Factor | Tasa de acierto del draft |
|---|---|---|---|---|
| Repetición | 22,9 | 62,0 | 2,71× | 85,0 % |
| Enumeración | 23,0 | 61,6 | 2,68× | 93,1 % |
| Traducción | 22,9 | 51,8 | 2,26× | 70,9 % |
| Estructura / JSON | 23,0 | 47,6 | 2,07× | 59,7 % |
| Texto técnico | 23,0 | 41,7 | 1,81× | 48,0 % |
| Código | 23,0 | 41,1 | 1,79× | 48,9 % |
| Flujo de texto | 22,9 | 39,5 | 1,72× | 44,5 % |
| Texto creativo | 23,0 | 35,9 | 1,56× | 37,4 % |

Estos datos son mediciones propias del autor, no comparaciones con otros modelos.

## Requisitos de hardware

- Para la cuantización Q8_0 (27,3 GB) más el draft MTP (2,7 GB de VRAM) y el KV-cache, se necesitan al menos 32 GB de VRAM. En el test se usaron 3× RTX 3080 20 GB (60 GB totales), con 31,2 GB ocupados.
- Para Q6_K (21,0 GB) más draft, se estima un mínimo de 24-28 GB de VRAM, dependiendo del contexto y el tamaño del KV-cache.
- El draft MTP ocupa 3,0 GB en disco y aproximadamente 2,7 GB de VRAM con contexto de 97K (1.953 MiB con contexto de 4K).
- En GPUs de consumo, una RTX 4090 de 24 GB podría ejecutar Q6_K sin draft, pero con draft y contexto grande necesitaría más memoria. Para Q8_0 se requiere una GPU de 32 GB o múltiples GPUs.
- Opciones de despliegue: llama.cpp y `llama-server` (con soporte para `--spec-type draft-mtp`), así como cualquier herramienta compatible con GGUF (Ollama, etc.) siempre que soporte MTP.
- La latencia y el throughput dependen del hardware; en el test con 3× RTX 3080 se obtuvieron entre 35,9 y 62,0 t/s con draft, y 22,9-23,0 t/s sin draft.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la model card. El único punto de referencia es el modelo base Qwen/Qwen3.8-27B en su formato original safetensors, que no incluye el draft MTP separado. No hay datos de rendimiento frente a alternativas como Llama 3.1 70B o Mistral Large en esta información.

## Limitaciones y advertencias

- La aceleración del MTP depende fuertemente del tipo de texto: en texto creativo la tasa de acierto cae al 37,4 % y el factor de aceleración a 1,56×, por lo que el beneficio es menor en usos no predecibles.
- El draft MTP añade un coste de 3,0 GB en disco y ~2,7 GB de VRAM, que puede ser significativo en entornos con memoria limitada.
- Los metadatos indican solo alemán e inglés como idiomas soportados; no se confirma soporte para otros idiomas, aunque el modelo base podría tener capacidades adicionales.
- Se requiere una versión reciente de llama.cpp que soporte los flags `--mtp` y `--no-mtp`; builds antiguos no reconocen estos argumentos.
- No se han publicado evaluaciones de calidad (sesgos, alucinaciones, robustez) en la información disponible. Como todo modelo de lenguaje, existe riesgo de generar contenido incorrecto o inventado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Davidmg0815/Qwen3.8-27B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
