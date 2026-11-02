# aikexue170/rewrite3-4b-shorter-nvfp4

## Resumen

rewrite3-shorter-4B es un modelo de reescritura de texto en chino especializado en "humanizar" prosa generada por IA en el ámbito de la novela web. Lo desarrolla el usuario independiente aikexue170 y parte del modelo base Qwen3.5-4B, sobre el que se aplicó un LoRA SFT posteriormente fusionado. La versión aquí descrita es una cuantización ModelOpt NVFP4 W4A4 (con calibración AWQ) de un solo archivo, pensada para minimizar el consumo de VRAM en GPUs de gama baja.

El problema que aborda es concreto: en la industria de la novela web en línea abundan los textos generados o reescritos por IA con patrones estilísticos reconocibles (estructuras repetitivas, explicaciones superfluas, acumulación de paralelismos, exceso emocional). El modelo recibe un texto original con puntuaciones de "grado de artificiosidad" por frase y devuelve un análisis frase a frase seguido del texto reescrito, con el objetivo de acercar el resultado a la escritura humana.

La innovación principal frente a la generación anterior (rewrite2-4b) es un razonamiento en cadena (CoT) entrenado de forma nativa, no inyectado por prompt: el modelo primero analiza qué frases son artificiosas y cómo corregirlas, y después reescribe. La variante "shorter" implica que la salida siempre es más corta que la entrada, con un objetivo de ratio entre 0,4 y 1,0 y mediana en torno a 0,7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B), con cabeza MTP para decodificación especulativa |
| Parametros totales | 4.660.291.072 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A4 (ModelOpt, calibración AWQ); cabeza MTP en bf16 sin cuantizar |
| Idiomas soportados | Chino (la model card y los datos de entrenamiento están en chino; no se declaran otros idiomas) |
| Licencia | Sujeta a la licencia del modelo base Qwen3.5 (no se especifica el identificador exacto) |
| Formato de pesos | safetensors (formato ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros construido sobre Qwen3.5-4B. Sobre esa base se aplicó un ajuste supervisado con LoRA que después se fusionó en los pesos. Adicionalmente se entrenó una cabeza MTP (multi-token prediction) independiente para decodificación especulativa, integrada en los pesos y mantenida en bf16; según la model card alcanza un 72,8 % de acierto top-1 con teacher forcing y un accept_proxy del 83,7 %.

Los datos de entrenamiento se construyeron a partir de 20.000 textos originales humanos de novela web (tanto SFW como NSFW) procedentes de obras bien valoradas en distintas plataformas. A partir de ellos se catalogaron más de 100 patrones de "artificiosidad" de IA (sintaxis, ritmo, tono, imaginería, transiciones, manía explicativa) y se generaron versiones degradadas con deepseek v4.1 flash 1017, produciendo pares (texto bueno, texto degradado). Un modelo profesor jevnovel3 27B puntuó cada frase degradada con una probabilidad de "estar completamente arruinada". Finalmente, gemini 4 argon encadenó texto degradado, tipo de artificiosidad, puntuación de jevnovel y texto bueno para construir la cadena de análisis (CoT) que se usa como objetivo de entrenamiento junto con la reescritura. El objetivo de longitud de la variante shorter fija la salida entre 0,4 y 1,0 veces la entrada, con mediana en 0,7.

## Capacidades

- Reescritura de prosa en chino con preservación del significado original y reorganización del lenguaje.
- Razonamiento en cadena (CoT) entrenado: genera primero un análisis por frases y después el texto reescrito, separados por `</think>`.
- Interpretación de puntuaciones por frase (formato `【0.04】` o `【NA】`) para calibrar la intensidad de la corrección.
- Compresión controlada del texto: la salida es siempre más corta que la entrada (ratio 0,4-1,0, mediana 0,7).
- Generalización de longitud mejorada frente a rewrite2: admite varios miles de caracteres en una sola pasada sin trocear.
- Decodificación especulativa mediante cabeza MTP integrada.
- No se declaran capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Humanización de manuscritos de novela web: el modelo recibe el capítulo completo con puntuaciones jevnovel por frase y devuelve un análisis más el texto reescrito, listo para revisión editorial ligera.
- Preedición automatizada en pipelines editoriales: se integra antes de la revisión humana para eliminar patrones de artificiosidad y reducir la carga de trabajo del editor.
- Detección y corrección de "muletillas" de IA: gracias al CoT, el modelo explica qué frase es artificiosa, por qué y cómo se corrige, lo que sirve como material formativo para autores.
- Compresión de textos inflados: al fijar la salida en 0,4-1,0 veces la entrada, resulta útil para condensar capítulos con relleno sin perder la trama.
- Control de calidad de contenido generado por IA en plataformas: se puede desplegar como paso de postprocesado sobre textos sospechosos antes de su publicación.
- Aceleración en GPUs de gama baja: la cuantización NVFP4 W4A4 y la cabeza MTP permiten servir el modelo con `vLLM >= 0.28` en entornos con VRAM limitada, útil para estudios pequeños o despliegues en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de la cabeza MTP: 72,8 % de acierto top-1 con teacher forcing y accept_proxy del 83,7 %.

## Requisitos de hardware

- VRAM estimada: al tratarse de NVFP4 W4A4 sobre 4,66B parámetros, el peso ocupa aproximadamente 2,3-2,5 GB; con overhead de contexto y caché KV, un despliegue con 32K de contexto requiere del orden de 6-8 GB de VRAM (estimación, no publicada por el autor).
- GPU recomendadas: se ha validado con vLLM >= 0.28, que soporta la decodificación especulativa MTP de Qwen3.5. GPUs con soporte NVFP4 nativo (por ejemplo, arquitecturas Blackwell) son las más adecuadas; en otras arquitecturas la compatibilidad de kernels NVFP4 puede ser limitada.
- GPU de consumo: por tamaño de pesos cabría en RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090 y RTX 5090; la viabilidad real depende del soporte de kernels NVFP4 en la versión de vLLM y del driver.
- Opciones de despliegue: `vllm serve` con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`; llama.cpp server para el parseo de `reasoning_content` y `content` (según la model card, aunque el formato NVFP4 no es el habitual en llama.cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-shorter-4B (esta ficha) | 4,66B | 32.768 | Reescritura con CoT, cuantizado NVFP4 | Qwen3.5 base | HuggingFace |
| rewrite2-4b | 4B (aprox.) | No disponible | Reescritura sin CoT | No disponible | HuggingFace (GGUF) |
| rewrite3 (familia) | 4B / 9B / 27B | No disponible | Reescritura con CoT, versiones shorter y keep | Qwen3.5 base | Anunciada, no publicada en su totalidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en reescritura de prosa en chino; no es un modelo de propósito general.
- La salida es siempre más corta que la entrada (ratio 0,4-1,0); no es adecuado si se requiere preservar la longitud del original (para eso existe la variante keep, aún no publicada).
- Depende de puntuaciones externas de jevnovel por frase para funcionar de forma óptima; con `【NA】` en todas las frases la corrección es menos agresiva.
- El CoT consume entre 3.000 y 4.000 tokens habitualmente; con `max_tokens` bajo se obtiene solo el análisis y no el texto reescrito.
- Los datos de entrenamiento incluyen contenido NSFW, lo que puede reflejarse en el comportamiento del modelo en ese dominio.
- La licencia exacta no está declarada en la información disponible; se remite a la del modelo base Qwen3.5, por lo que conviene verificar las condiciones antes de un uso comercial.
- Riesgo de alucinación y de alteración del significado original no cuantificado por el autor.
- La cuantización NVFP4 requiere soporte específico de kernels; en hardware sin NVFP4 nativo el rendimiento puede degradarse o no ser compatible.
- Al no haber benchmarks públicos ni descargas, no existe validación independiente del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/rewrite3-4b-shorter-nvfp4
- Modelo anterior rewrite2-4b (GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo de puntuación jevnovel 0.8B FP8: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
