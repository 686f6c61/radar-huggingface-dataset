# fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v5-GGUF

## Resumen

Hy-MT2-1.8B-JP-Manga-Finetune-v5 es un modelo de traducción automática de japonés a inglés, desarrollado por fumetodev mediante fine-tuning sobre el modelo base tencent/Hy-MT2-1.8B. Está especializado en la traducción de diálogos de manga, con un enfoque en líneas cortas, autónomas y en el registro propio del original. Es la quinta iteración de una serie de fine-tunes y sucede a la versión v4, que el autor presenta como recomendada para este par de idiomas.

El modelo tiene 1.791.080.448 parámetros y utiliza la arquitectura HunYuanDenseV1ForCausalLM. Esta versión se distribuye en dos formatos: pesos bf16 en safetensors y una cuantización GGUF Q4_K_M para su uso con llama.cpp. La licencia es Apache 2.0 y los idiomas de trabajo son japonés (entrada) e inglés (salida). La longitud de contexto no se especifica en la información disponible.

La relevancia del modelo radica en su dominio específico: está ajustado para producir traducciones naturales y concisas de diálogo de manga, manteniendo nombres propios ficticios, tono, puntuación y efectos de sonido. Además, incorpora soporte para un bloque de terminología en el prompt, lo que permite al usuario añadir un glosario para mejorar la consistencia de las traducciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanDenseV1ForCausalLM |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) y bf16 (safetensors) |
| Idiomas soportados | japones, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo se basa en tencent/Hy-MT2-1.8B, un modelo de lenguaje de tipo transformer denso que implementa la arquitectura HunYuanDenseV1ForCausalLM. Esta versión es un fine-tuning completo del modelo base, como indica la relación base_model_relation: finetune. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La novedad de esta versión respecto a v4 es el corpus de entrenamiento. El autor reconstruyó el corpus de manga con texto fuente más limpio y mejores traducciones de referencia. Además, añadió un conjunto pequeño de líneas específicas para nombres cortos y palabras cortas, que en v4 se interpretaban erróneamente como efectos de sonido. El modelo usa la plantilla de chat del modelo base y acepta un bloque de terminología en el prompt para guiar la traducción.

## Capacidades

- Traducción de japonés a inglés de diálogos de manga, con salida en un registro natural y conciso.
- Procesamiento de líneas cortas y autónomas, típicas de bocadillos de manga.
- Completado de fragmentos truncados: si la entrada está cortada (por ASR o un caption incompleto), el modelo tiende a completar la frase en lugar de traducirla literalmente.
- Soporte de glosario en el prompt mediante un bloque de terminología, que el modelo atiende para mantener consistencia en nombres y términos.
- Preservación de nombres propios ficticios de personajes, tono, puntuación y efectos de sonido en la traducción.
- Sin capacidades de tool calling, agentes, visión o audio; es exclusivamente un modelo de traducción de texto.

## Casos de uso

- Traducción de diálogos de manga para edición digital: el modelo traduce línea a línea, y su salida concisa encaja en los bocadillos. Se puede usar con un glosario para mantener los nombres de personajes consistentes.
- Fansub de anime o series de animación: aunque está pensado para manga, puede procesar subtítulos cortos y completar fragmentos de texto truncados por ASR, generando traducciones naturales.
- Asistencia a traductores profesionales: los traductores pueden usar el modelo como propuesta inicial, revisando y ajustando la salida. La capacidad de mantener el tono y el registro reduce el trabajo de edición.
- Localización de cómics en plataformas web: el formato GGUF permite integrarlo en herramientas de inferencia locales como llama.cpp, con un coste de hardware bajo, ideal para pipelines de traducción automática.
- Traducción de mangas auto-publicados o webtoons: autores independientes pueden traducir sus obras de forma rápida y económica, ya que el modelo cabe en GPUs de consumo.
- Generación de datos sintéticos de traducción: el modelo puede crear pares japonés-inglés de diálogo de manga para entrenar o evaluar otros modelos de traducción especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. El autor proporciona mediciones propias sobre un conjunto de validacion de manga, comparando v5 con v2 y v4.

| Metrica | Resultado |
|---|---|
| Preferencia de juez LLM ciego (v5 vs v2, con contexto de pagina) | v5 preferido en 47.8% de las lineas, v2 en 36.8%, resto empates |
| Errores de significado (juez LLM) | v5 presenta menos errores que v2 |
| chrF++ contra traducciones de referencia | Empate con v2 y v4 |
| COMET-22 contra traducciones de referencia | Aproximadamente 1 punto menor que v2 y v4 |
| Longitud de la salida | Aproximadamente 7% mas larga que v4 |

El autor advierte que la salida de v5 es mas larga y esta redactada de forma diferente a las traducciones de referencia, por lo que las puntuaciones automaticas deben leerse como "no peor por la redaccion", no como una mejora absoluta.

## Requisitos de hardware

- VRAM estimada para el archivo GGUF Q4_K_M: aproximadamente 1,1 GB para los pesos, mas overhead de ejecucion y cache KV. En la practica, una GPU con 2-4 GB de VRAM es suficiente para inferencia con llama.cpp.
- VRAM estimada para los pesos bf16 (safetensors): aproximadamente 3,6 GB, mas overhead. Se recomienda una GPU con al menos 6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna de consumo con 4 GB o mas, como las series RTX 3060, RTX 4060, RTX 4090. Para el formato bf16, una RTX 3060 de 12 GB o superior es adecuada.
- Si cabe en GPU de consumo: si, tanto el GGUF Q4_K_M como los pesos bf16 pueden ejecutarse en GPUs de consumo.
- Opciones de despliegue: llama.cpp para el archivo GGUF; Transformers con trust_remote_code=True para los pesos safetensors. Tambien puede importarse en Ollama si se convierte o usa el archivo GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-JP-Manga-Finetune-v5 | 1.791.080.448 | no disponible | Preferido sobre v2 por juez LLM; similar a v4 en chrF++ y COMET-22 | Apache 2.0 | GGUF y safetensors |
| Hy-MT2-1.8B-JP-Manga-Finetune-v4 | 1.791.080.448 | no disponible | Empate en chrF++ con v5; COMET-22 ligeramente superior; salida mas corta | Apache 2.0 | GGUF y safetensors |
| Hy-MT2-1.8B-JP-Manga-Finetune-v2 | 1.791.080.448 | no disponible | Inferior a v5 en preferencia de juez LLM | Apache 2.0 | GGUF y safetensors |
| Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual | 1.791.080.448 | no disponible | Detras de v5 en japones a ingles; soporta otros idiomas objetivo | Apache 2.0 | GGUF y safetensors |

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para manga. Fuera de este dominio, su principal fallo es que completa fragmentos truncados en lugar de traducirlos literalmente.
- Los nombres propios del mundo real (personajes publicos, lugares, marcas) y la terminologia especializada son mas debiles que en el modelo base. Los nombres ficticios de personajes estan bien cubiertos.
- El modelo traduce una linea a la vez y no ve la pagina. Cuando el texto japones deja ambiguo quien habla, el modelo suele comprometerse con una lectura, sin posibilidad de desambiguar con contexto visual.
- La salida es aproximadamente un 7% mas larga que la de v4, lo que puede ser un problema en bocadillos con poco espacio.
- A temperaturas mas altas de las recomendadas (0.15), la calidad medida empeora y se observa contenido inventado ocasionalmente.
- Al convertir el modelo a GGUF manualmente, es necesario verificar que eos_token_id sea 120020. Algunos conversores escriben 3, lo que provoca que la generacion nunca se detenga.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantias de ausencia de sesgos o errores en traducciones de dominios distintos al manga.

## Enlaces

- Modelo v5: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v5-GGUF
- Modelo v4: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v4-GGUF
- Modelo v2: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v2-GGUF
- Modelo v3-multilingual: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
