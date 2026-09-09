# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-fp16

## Resumen

El modelo **gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-fp16** es una cuantización no oficial del modelo **Gemma 4 26B A4B Instruct** de Google, realizada por el usuario *RepublicOfKorokke*. El modelo base es una variante entrenada con *quantization-aware training* (QAT) a 4 bits, que posteriormente ha sido re-cuantizada a 3 bits utilizando la herramienta **oQ** (oMLX v0.6.4) con *mixed-precision quantization*. El resultado se distribuye en formato **MLX safetensors**, pensado para su ejecución en Apple Silicon mediante la librería MLX.

Pertenece a la familia Gemma 4, que incluye arquitecturas *dense* y *Mixture-of-Experts* (MoE). En este caso, el modelo **26B A4B** tiene 26.000 millones de parámetros totales, de los cuales aproximadamente 4.000 millones se activan por token, lo que permite un equilibrio entre calidad y coste computacional. La ventana de contexto llega hasta **262.144 tokens** y el modelo mantiene soporte multilingüe en más de 140 idiomas. Esta versión cuantizada a 3 bits está orientada a reducir el espacio en disco y el consumo de memoria en dispositivos locales, aunque con una pérdida de precisión notable respecto a los pesos originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ≈ 4.000.000.000 (designación A4B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | 3 bits (oQ3.5e, group size 64, MLX) |
| Idiomas soportados | Más de 140 idiomas (según el modelo base Gemma 4) |
| Licencia | No disponible en el repositorio |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un **MoE** con 26.000 millones de parámetros totales y 4.000 millones de parámetros activos por token. Esta arquitectura sparse permite activar solo una fracción de los parámetros durante la inferencia, lo que reduce el coste computacional manteniendo una capacidad de razonamiento elevada. La ventana de contexto es de 262.144 tokens, lo que facilita el procesamiento de documentos extensos y conversaciones largas.

El modelo original fue sometido a *quantization-aware training* (QAT) con cuantización a 4 bits, lo que significa que se entrenó para minimizar la pérdida de calidad asociada a la cuantización. Posteriormente, este checkpoint unquantizado ha sido re-cuantizado a 3 bits mediante oQ, una herramienta de cuantización para MLX que aplica *mixed-precision quantization* con un group size de 64. No se dispone en la información proporcionada de detalles sobre los datos de entrenamiento ni sobre procesos de ajuste como RLHF o DPO; solo se puede confirmar que es una versión *instruct* del modelo base.

## Capacidades

- Generación de texto instructivo en formato conversacional, ya que se parte de la variante *it* (instruction tuned) de Gemma 4 26B A4B.
- Razonamiento y resolución de problemas de matemáticas, según las capacidades declaradas del modelo base Gemma 4.
- Generación de código y asistencia en tareas de programación.
- Comprensión y generación de texto en más de 140 idiomas.
- Procesamiento de contextos largos de hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversación prolongados.
- Ejecución en dispositivos Apple Silicon mediante el framework MLX.
- La cuantización a 3 bits reduce significativamente el tamaño del modelo, permitiendo su carga en equipos con memoria unificada limitada, a costa de una mayor pérdida de precisión.
- No se especifica en la información disponible si el modelo soporta tool calling o funciones de agente.

## Casos de uso

- Asistentes locales en macOS: el modelo puede ejecutarse en un Mac con memoria unificada suficiente, ofreciendo un asistente conversacional sin necesidad de enviar datos a servidores externos. La cuantización a 3 bits reduce el footprint de memoria, lo que facilita su uso en equipos de 16 GB o más.
- Análisis de documentos extensos: gracias a la ventana de 262.144 tokens, puede procesar informes completos, contratos o expedientes largos y generar resúmenes o responder preguntas sobre el contenido íntegro.
- Generación de código en entornos de desarrollo local: un desarrollador puede integrar el modelo en un flujo de trabajo de autocompletado de código o revisión de snippets directamente en su máquina, sin depender de APIs externas.
- Prototipado rápido de aplicaciones de IA: la disponibilidad del formato MLX y la compatibilidad con la librería oMLX permiten experimentar con un modelo instructivo de tamaño medio en un entorno de desarrollo local, sin necesidad de GPU dedicadas.
- Educación y tutoría: el modelo puede responder preguntas de matemáticas, ciencias o idiomas en varios idiomas, siendo útil para crear sistemas de tutoría personalizados que se ejecuten en dispositivos del propio estudiante.
- Redacción de textos y revisión multilingüe: con soporte de más de 140 idiomas, el modelo puede generar borradores, traducir o revisar textos en múltiples lenguas, en aplicaciones de escritorio o editores con soporte MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 14.8 GB, que corresponde a los pesos en formato MLX safetensors.
- Se necesita al menos 15 GB de memoria unificada para cargar los pesos; para inferencia con KV cache se recomienda un equipo con 16–20 GB.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Pro, M3 Pro o superior). No está diseñado para GPUs NVIDIA ni CUDA.
- Este modelo no cabe en GPUs de consumo convencionales por su formato MLX, pero es viable en Macs con chip Apple Silicon.
- Opciones de despliegue: MLX, oMLX y cualquier framework compatible con safetensors MLX.
- No se dispone en la información proporcionada de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-4-26B-A4B-it-qat-q4_0-unquantized (base) | 26.000 M totales, ~4.000 M activos | 262.144 | No indicada | HuggingFace |
| gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-text-fp16 | 26.000 M totales, ~4.000 M activos | 262.144 | No indicada | HuggingFace |
| gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-fp16 (este modelo) | 25.805.936.206 | 262.144 | No indicada | HuggingFace |

La principal diferencia entre estas variantes es el esquema de cuantización aplicado y el formato de salida. El modelo base se publica sin cuantizar, mientras que las versiones oQ3.5e están cuantizadas a 3 bits con group size 64. No se dispone de benchmarks comparativos para evaluar la pérdida de rendimiento entre ellas.

## Limitaciones y advertencias

- La cuantización a 3 bits produce una pérdida de calidad superior a la de cuantizaciones de 4 u 8 bits, lo que puede afectar notablemente a la coherencia, el razonamiento y la exactitud de las respuestas.
- El repositorio tiene 0 descargas y 0 likes; se trata de un lanzamiento no verificado por la comunidad, por lo que no se puede garantizar la ausencia de errores en los pesos o en el proceso de cuantización.
- No se especifica la licencia del modelo en el repositorio. El modelo base Gemma 4 de Google está sujeto a su propia licencia, por lo que debe consultarse la licencia original antes de usarlo en entornos comerciales.
- No hay datos sobre sesgos del modelo ni información sobre su comportamiento en contextos sensibles.
- La fecha de creación del repositorio (2026-09-09) es posterior a la fecha actual, lo que sugiere que puede tratarse de un identificador generado o un token, pero no se ha podido verificar su contenido real.
- La inferencia está limitada a plataformas compatibles con MLX; no se puede ejecutar en entornos CUDA estándar sin conversión previa.
- No se dispone de benchmarks que confirmen el rendimiento real del modelo en tareas estándar como MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-fp16
- Variante text-fp16 del mismo autor: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3.5e-text-fp16
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página del modelo en llmrun.dev: https://llmrun.dev/model/google-gemma-4-26b-a4b-it-qat-q4-0-unquantized
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
