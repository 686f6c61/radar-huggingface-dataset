# cyttic/hmt-trocrscratchreg-stroke1-s42

## Resumen

`cyttic/hmt-trocrscratchreg-stroke1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se comparan distintas variantes de arquitectura y de aumentación sobre un mismo corpus de evaluación. En concreto, esta ficha corresponde a la variante `trocrscratchreg` con la aumentación `stroke1` y la semilla 42.

El modelo se basa en la familia TrOCR (arquitectura transformer encoder-decoder para reconocimiento óptico de caracteres) con una cabeza de clasificación CTC, y está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo a los escritores del conjunto de desarrollo. Su idioma de trabajo es el hebreo (`he`), lo que lo hace relevante para la digitalización de manuscritos en hebreo, un ámbito con menos recursos públicos que el inglés o el castellano.

El tamaño es reducido (22.421.004 parámetros, unos 0,1 GB de repositorio), lo que permite desplegarlo en hardware modesto. La licencia es MIT, sin restricciones para uso comercial. Los resultados publicados por el autor en la model card son notablemente bajos (CER 0,5147 y WER 1,0960), lo que sugiere que esta configuración concreta del estudio no alcanzó un rendimiento utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder) con cabeza CTC; variante `trocrscratchreg` |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TrOCR: un encoder de visión tipo transformer que procesa la imagen de la linea de texto manuscrito y un decoder transformer que genera la secuencia de caracteres. La variante se denomina `trocrscratchreg`, lo que indica un entrenamiento desde cero (*scratch*) con regularización, y el tag `ctc` de la model card apunta a una cabeza de clasificación CTC para el alineamiento secuencia-a-secuencia sin necesidad de decodificación autorregresiva completa.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, tomando la partición de entrenamiento y excluyendo a los escritores presentes en el conjunto de desarrollo, lo que evita fuga de información entre escritores. La aumentación aplicada es `stroke1`, una de las variantes del estudio `htr-metrics-transfer`, y la semilla es 42. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de lineas de texto.
- Decodificación greedy sin modelo de lenguaje (según la model card).
- Salida de secuencia de caracteres mediante cabeza CTC.
- Entrenamiento desde cero sobre un corpus específico de escritores, lo que permite estudiar la transferencia de métricas entre configuraciones.
- No dispone de capacidades de generación de texto libre, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo de pensamiento; es un modelo especializado exclusivamente en HTR.

## Casos de uso

- Estudio comparativo de aumentación de datos: el modelo sirve como punto de referencia dentro del estudio `htr-metrics-transfer` para medir el efecto de la aumentación `stroke1` frente a otras variantes (por ejemplo, `geom1`) sobre la misma partición de datos.
- Investigación en HTR de hebreo: permite reproducir experimentos con una semilla fija (42) y una partición concreta, facilitando la comparación entre arquitecturas TrOCR y cabezas CTC.
- Análisis de transferencia de métricas: al compartir corpus y evaluación con otras variantes del mismo autor, se puede usar para estudiar cómo se transfieren las métricas CER/WER entre configuraciones.
- Validación de pipelines de evaluación: el archivo `results.json` asociado permite contrastar la implementación de métricas CER y WER con decodificación greedy y sin LM.
- Docencia y experimentación con arquitecturas encoder-decoder: el tamaño reducido (22,4 M de parámetros) permite ejecutarlo en entornos con recursos limitados para demostrar el flujo completo de un modelo TrOCR.
- No se recomienda su uso en producción para digitalización real de manuscritos, dado el CER de 0,5147 obtenido en la evaluación publicada.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor en la model card son los siguientes, medidos sobre el conjunto HHD Option-B test con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,5147 |
| WER (Word Error Rate) | 1,0960 |

No se han publicado resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son benchmarks aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros), y del orden de 100-200 MB en cuantización de 8 bits; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060 o incluso GPUs integradas pueden ejecutar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y probablemente también en CPU.
- Opciones de despliegue: al publicarse en safetensors, requiere cargarlo con la librería de transformers o un framework compatible; no se dispone de confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a HTR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER/WER publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-stroke1-s42 | 22,4 M | no disponible | 0,5147 / 1,0960 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-geom1-s42 | no disponible | no disponible | 0,0773 / 0,3366 | no disponible | Hugging Face |
| TrOCR base (Microsoft) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa más relevante es con `cyttic/hmt-trocrctc-geom1-s42`, del mismo autor y estudio: la variante `trocrctc` con aumentación `geom1` obtiene un CER de 0,0773 y un WER de 0,3366, muy por debajo de los valores de esta ficha, lo que sugiere que la combinación `trocrscratchreg` + `stroke1` es claramente inferior en este corpus. No se dispone de datos de otros modelos HTR para hebreo en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en la evaluación publicada: CER de 0,5147 implica que más de la mitad de los caracteres se reconocen incorrectamente; no es apto para producción.
- WER de 1,0960 indica que el modelo produce más errores a nivel de palabra que palabras correctas, lo que refleja una salida prácticamente inutilizable en texto real.
- Entrenado exclusivamente en hebreo; no se ha validado en otros idiomas ni en escritura impresa.
- Entrenado sobre un corpus concreto (`hhd-optionb-split`) con exclusión de escritores de desarrollo, por lo que la generalización a otros escritores o dominios no está documentada.
- Riesgo de alucinación y de sesgo hacia los patrones de escritura del corpus de entrenamiento; no se dispone de análisis de sesgos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento.
- El repositorio no incluye pipeline declarado en Hugging Face, por lo que la integración requiere cargar manualmente la arquitectura.
- No se dispone de información sobre cuantizaciones publicadas ni sobre despliegue en servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-stroke1-s42
- Variante comparable del mismo estudio: https://huggingface.co/cyttic/hmt-trocrctc-geom1-s42
- Conjunto de datos de entrenamiento citado: https://huggingface.co/cyttic/hhd-optionb-split
