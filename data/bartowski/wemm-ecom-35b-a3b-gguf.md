# bartowski/WeMM-Ecom-35B-A3B-GGUF

## Resumen

WeMM-Ecom-35B-A3B es un modelo multimodal de tipo mezcla de expertos (MoE) desarrollado por WeChat Vision en Tencent, construido sobre la base Qwen3.5-35B-A3B. Está especializado en comprensión de comercio electrónico: extracción de atributos de producto, entendimiento de imágenes de producto y tareas generales de visión-lenguaje. Acepta texto, imágenes, conjuntos multi-imagen y vídeo como entrada, y produce texto, con un modo de razonamiento ("thinking") opcional.

La versión aquí descrita es la cuantización GGUF realizada por bartowski mediante llama.cpp (release b12600) con calibración imatrix, lo que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia local sin necesidad de GPUs de centro de datos. El checkpoint original cuenta con 34.660.610.688 parámetros totales y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en cubrir un nicho poco atendido por los modelos generalistas: el procesamiento de catálogos de producto y contenido visual comercial en chino e inglés, con soporte de tool calling y plantilla de prompt compatible con el ecosistema Qwen. La disponibilidad en GGUF lo hace accesible para prototipado rápido y despliegue en producción con llama.cpp u Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base Qwen3.5-35B-A3B) |
| Parámetros totales | 34.660.610.688 (35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-35B-A3B, un transformer con mezcla de expertos (MoE) que combina capacidades de lenguaje con un codificador visual para entrada de imágenes, conjuntos multi-imagen y vídeo. La integración multimodal requiere el fichero `mmproj` para el procesamiento de imágenes. El modelo incorpora un modo de razonamiento opcional activado mediante la etiqueta `<think>` en la plantilla de prompt.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del autor de la cuantización indica que no se utiliza decodificación especulativa y que la cuantización se realizó con calibración imatrix, lo que mejora la calidad de los cuantizados de baja precisión al ponderar los pesos según su importancia.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" opcional.
- Comprensión de imágenes individuales y conjuntos de múltiples imágenes.
- Procesamiento de vídeo como entrada.
- Extracción de atributos de producto a partir de texto e imágenes.
- Comprensión de imágenes de producto para tareas de comercio electrónico.
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Conversación multi-turno.
- Capacidades multilingües limitadas a chino e inglés.
- Tareas generales de visión-lenguaje.

## Casos de uso

- Extracción de atributos de producto: el modelo puede analizar imágenes y descripciones de producto para generar fichas estructuradas con atributos como color, material, talla o categoría, aprovechando su entrenamiento específico en comercio electrónico.
- Enriquecimiento de catálogos: procesamiento por lotes de imágenes de producto para generar descripciones textuales y metadatos, reduciendo el trabajo manual en plataformas de e-commerce.
- Moderación de contenido visual comercial: análisis de imágenes de listados para detectar productos que no cumplen las políticas de la plataforma, usando las capacidades de visión-lenguaje.
- Asistente de atención al cliente: conversaciones multi-turno sobre productos con soporte de tool calling para consultar stock, precios o estado de pedidos mediante funciones externas.
- Búsqueda visual de productos: generación de descripciones textuales a partir de imágenes que alimenten motores de búsqueda o sistemas de recomendación.
- Análisis de vídeo de producto: extracción de información de vídeos demostrativos o unboxings para generar resúmenes y atributos.
- Prototipado local de pipelines multimodales: gracias a los cuantizados GGUF, se puede desplegar en estaciones de trabajo con GPU de consumo para validar flujos antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, solo pesos):
  - bf16: ~69,4 GB (requiere múltiples GPU o GPU de 80 GB).
  - Q8_0: ~36,9 GB.
  - Q6_K: ~30,7 GB.
  - Q5_K_M: ~27,0 GB.
  - Q4_K_M: ~22,3 GB (recomendado por el autor para la mayoría de casos).
  - Q4_K_S: ~21,0 GB.
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090 (24 GB) o A6000 (48 GB) para cuantizados Q4/Q5; GPUs con 32 GB o más para Q6/Q8.
- En GPU de consumo: Q4_K_M (~22,3 GB) cabe ajustadamente en una RTX 4090 de 24 GB; cuantizados menores (Q4_K_S, Q4_0) dejan más margen. En GPUs de 16 GB no cabe en su totalidad y requeriría offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp (versión b12600 o superior), Ollama, y cualquier runtime compatible con GGUF. Para el procesamiento de imágenes se requiere el fichero `mmproj` adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (este) | 35B (MoE) | no disponible | Texto, imagen, multi-imagen, vídeo | Apache 2.0 | GGUF, safetensors |
| Qwen3.5-35B-A3B (base) | 35B (MoE) | no disponible | Texto (y visión según variante) | no disponible en la información | safetensors |
| Modelos multimodales generalistas de ~30-40B | ~30-40B | variable | Texto, imagen | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada. La comparativa se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la extracción de atributos de producto donde puede inventar características no visibles.
- No se dispone de información sobre sesgos conocidos ni sobre evaluaciones de seguridad.
- El contexto máximo no está documentado en la información disponible, lo que dificulta planificar cargas de trabajo con documentos largos o muchas imágenes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original en el repositorio de Tencent.
- Los cuantizados de baja precisión (Q4_0, Q4_1) pueden degradar la calidad en tareas de extracción fina de atributos; se recomienda Q4_K_M o superior para producción.
- El procesamiento de imágenes requiere el fichero `mmproj`; sin él, el modelo funciona solo como texto.
- El repositorio tiene un tamaño de 568,4 GB, lo que implica descargas parciales selectivas mediante la CLI de Hugging Face.
- No se han publicado benchmarks que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/WeMM-Ecom-35B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Cuantizado Q4_K_M: https://huggingface.co/bartowski/WeMM-Ecom-35B-A3B-GGUF/blob/main/WeMM-Ecom-35B-A3B-Q4_K_M.gguf
