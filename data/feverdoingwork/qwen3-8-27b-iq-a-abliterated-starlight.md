# feverdoingwork/Qwen3.8-27B-IQ-A-abliterated-Starlight

## Resumen

Qwen3.8-27B-IQ-A-abliterated-Starlight es una cuantización del modelo denso Qwen3.8-27B de Alibaba Qwen, publicada por el usuario feverdoingwork en Hugging Face. El archivo no es un checkpoint generalista: está empaquetado en el formato propietario `.starlight` y solo funciona con el motor de inferencia Starlight. Incorpora en un único fichero de 11,86 GiB el modelo de texto, el codificador de visión y la cabeza de borrador para decodificación especulativa multi-token (MTP), con pesos mayoritariamente en bloques de 3 y 4 bits (IQ3_S e IQ4_XS).

La variante "abliterated" elimina la dirección de rechazo de las activaciones internas en 70 tensores que escriben en el flujo residual (capas 17 a 51: proyección down, proyección de salida de atención lineal y proyección de salida de atención), siguiendo el trabajo de huihui-ai. El resultado es un modelo que responde a peticiones que el original declinaría, sin filtro de contenido propio. El objetivo es claro: ofrecer un modelo multimodal de 27B parámetros con ventana de 262.144 tokens en una sola tarjeta gráfica de 16 GB.

Es relevante para quienes trabajan con hardware de consumo o GPUs de gama media (RTX 5060 Ti, RTX 5070 Ti, RX 9070 XT) y necesitan un modelo multimodal grande con contexto largo y decodificación especulativa integrada, a costa de atarse al ecosistema Starlight y de asumir los riesgos de un modelo sin alineamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión), con atención lineal en parte de las capas y cabeza MTP para decodificación especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (límite del modelo); ventanas de arranque medidas entre 149.504 y 262.144 según tarjeta y modo |
| Tipos de cuantizacion | IQ3_S e IQ4_XS (receta IQ-A, bloques de 3 y 4 bits); caché de atención q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.starlight` (fichero propietario del motor Starlight; no es safetensors ni GGUF) |

Datos adicionales del fichero: 12.735.418.624 bytes (11,86 GiB), SHA-256 `2fb2ab4cec284e9f51b4298ad0b4ab60277fe3d3da00a2eaba88b71b20fa9bf3`, MD5 `f472152c9cdffa35ec479d4945654c86`.

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros con capacidades multimodales (pipeline `image-text-to-text`). La model card menciona atención lineal en algunas capas (las proyecciones de salida de atención lineal aparecen entre los tensores modificados por el proceso de abliteración) y una cabeza de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa. El codificador de visión y la cabeza MTP están incluidos en el mismo fichero, de modo que la decodificación especulativa MTP funciona sin ficheros adicionales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card de esta cuantización no los detalla. La modificación respecto al fichero original consiste en eliminar la dirección de rechazo de 70 tensores (capas 17 a 51) siguiendo la revisión 739e3c5b de huihui-ai/Huihui-Qwen3.8-27B-abliterated, y recuantizar esos tensores con la receta propia del fichero. El resto de bytes son idénticos al fichero IQ-A original. La cuantización introduce pérdida de calidad respecto a BF16, aunque no se publica ninguna puntuación comparativa en la model card.

## Capacidades

- Generación de texto y razonamiento en un modelo denso de 27B parámetros.
- Procesamiento de imagen y texto (image-text-to-text): el codificador de visión está incluido en el fichero.
- Decodificación especulativa integrada mediante cabeza MTP, sin necesidad de un drafter externo.
- Soporte de DFlash2 como alternativa de decodificación especulativa más rápida, que requiere un fichero drafter separado (no incluido en el repositorio).
- Contexto largo de hasta 262.144 tokens, con desbordamiento de caché a RAM del sistema cuando la VRAM no alcanza.
- Respuestas sin rechazo: el proceso de abliteración elimina la dirección de rechazo, por lo que el modelo no advierte, rechaza ni modera.
- Servido mediante interfaz HTTP compatible con OpenAI a través del motor Starlight.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en una sola GPU de 16 GB: el fichero cabe en una RX 9070 XT, RTX 5070 Ti o RTX 5060 Ti, lo que permite desplegar un modelo de 27B con visión en estaciones de trabajo de gama media sin servidores dedicados.
- Análisis de documentos e imágenes con contexto largo: con ventanas de hasta 262.144 tokens y desbordamiento de caché a RAM, se pueden procesar lotes de imágenes y texto extenso en una sola pasada, útil para revisión de contratos, informes o expedientes con material gráfico.
- Procesamiento por lotes de alto rendimiento: con DFlash2 en dos RTX 5060 Ti se midieron 180,3 tok/s, adecuado para tareas de generación masiva donde el coste por token importa más que la latencia interactiva.
- Investigación sobre alineamiento y seguridad: la variante abliterated permite estudiar el comportamiento de un modelo sin dirección de rechazo, comparándolo con el original, en entornos controlados y con las salvaguardas que el investigador añada.
- Generación de contenido sin moderación en flujos creativos internos: escritura de ficción, guiones o material que el modelo base podría declinar, siempre que el operador asuma la responsabilidad legal y añada sus propios filtros donde corresponda.
- Prototipado de aplicaciones con API compatible con OpenAI: el motor Starlight expone el modelo por HTTP en la máquina local, lo que permite integrarlo en pipelines existentes sin cambiar el cliente.
- Evaluación de cuantizaciones: útil para medir la pérdida de calidad de IQ3_S/IQ4_XS frente a BF16 en tareas multimodales, aunque la model card advierte de que aún no publica esa comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye medidas de velocidad y ventana de contexto del fichero IQ-A original:

| Tarjeta | Modo | Mayor contexto de arranque | Velocidad de decodificación |
|---|---|---|---|
| RX 9070 XT (una) | MTP | 174.400 tokens | sin registro |
| RX 9070 XT (una) | DFlash2 | 170.496 tokens (262.144 con desbordamiento) | 137,1 tok/s (BetterBench, 24 oct 2026) |
| RTX 5060 Ti (una) | MTP | 200.704 tokens (262.144 con desbordamiento) | 69,3 tok/s (29 oct 2026) |
| RTX 5060 Ti (una) | DFlash2 | 149.504 tokens (262.144 con desbordamiento) | 113,0 tok/s (29 oct 2026) |
| RTX 5060 Ti (una) | sin especulación | 229.376 tokens (262.144 con desbordamiento) | 29,7 tok/s (29 oct 2026) |
| RTX 5060 Ti (dos) | MTP | 262.144 tokens | 122,8 tok/s (29 oct 2026) |
| RTX 5060 Ti (dos) | DFlash2 | 262.144 tokens | 180,3 tok/s (29 oct 2026) |

Las cifras son ejecuciones únicas con la versión de Starlight de cada fecha y caché de atención q4_0; pueden variar según la máquina y la compilación del motor. La velocidad se mide con BetterBench v0.6.1 (BB-weighted, tokens por segundo sobre una mezcla de prompts).

## Requisitos de hardware

- VRAM: el fichero ocupa 11,86 GiB; con caché de atención y overhead del motor, encaja en una tarjeta de 16 GB.
- GPUs recomendadas: AMD RX 9070 XT, NVIDIA RTX 5070 Ti o RTX 5060 Ti (una tarjeta); dos RTX 5060 Ti para contexto completo de 262.144 tokens sin desbordamiento.
- Cabe en GPU de consumo: sí, en las tarjetas de 16 GB citadas; no se documentan pruebas en tarjetas de 8 o 12 GB.
- Despliegue: exclusivamente mediante el motor Starlight y su Launcher; no es compatible con llama.cpp, Ollama, LM Studio, vLLM ni Transformers.
- Latencia y throughput: ver tabla de benchmarks; el rango medido va de 29,7 tok/s (sin especulación, una RTX 5060 Ti) a 180,3 tok/s (DFlash2, dos RTX 5060 Ti).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-IQ-A-abliterated-Starlight (este) | 27B densos | 262.144 | `.starlight` | Apache-2.0 | Multimodal, MTP integrado, solo Starlight |
| feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight | 27B densos | no disponible | `.starlight` | Apache-2.0 (presumible, no confirmado) | Variante NVFP4 de 12,62 GiB para Blackwell; proyecciones gate/up a 3 bits |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B densos | no disponible | no disponible | no disponible | Modelo abliterated de referencia en formato estándar |
| Qwen/Qwen3.8-27B | 27B densos | 262.144 (según fichero derivado) | safetensors (presumible) | Apache-2.0 | Modelo base sin abliterar ni cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona con el motor Starlight: no es un checkpoint de propósito general y no está soportado ni probado en llama.cpp, Ollama, LM Studio, vLLM ni Transformers.
- Modelo abliterated: no rechaza, advierte ni modera. El operador es responsable de lo que se le pide y de lo que se hace con las respuestas, y debe cumplir la ley y la licencia del modelo base.
- No debe ofrecerse a personas que no hayan elegido explícitamente un modelo sin filtro; conviene añadir salvaguardas propias donde la aplicación las requiera.
- La abliteración no mejora la corrección factual: persisten los errores, sesgos y problemas de fiabilidad del modelo base.
- La cuantización IQ3_S/IQ4_XS introduce pérdida de calidad frente a BF16; la model card no publica ninguna puntuación comparativa.
- Las ventanas de contexto medidas dependen de la tarjeta, el tipo de caché y el uso concurrente de VRAM; los casos no listados no se han medido.
- Las cifras de velocidad son ejecuciones únicas y pueden diferir según máquina y versión del motor.
- Idiomas soportados: no disponible.
- Licencia Apache-2.0: permite uso comercial, pero las restricciones del modelo base y la ausencia de filtro trasladan al operador la responsabilidad sobre el contenido generado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-27B-IQ-A-abliterated-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo abliterated de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Variante NVFP4 del mismo autor: https://huggingface.co/feverdoingwork/Qwen3.8-27B-NVFP4-mini-Starlight
- BetterBench (herramienta de medida): https://github.com/GGZ14/BetterBench
