# SentinelHub/R-08-Transformer-Baseline

## Resumen

R-08 Transformer Baseline es un modelo de lenguaje causal de tipo decoder-only con arquitectura transformer densa al estilo GPT-2, desarrollado por Thomas Seri bajo el sello SentinelHub. Cuenta con aproximadamente 44,9 millones de parametros unicos (45,5 millones segun los safetensors publicados) distribuidos en 14 capas de atencion causal, con un vocabulario subword reducido de 1.251 piezas. Su proposito no es el uso generalista, sino servir como modelo de control en un estudio comparativo A/B frente a la familia Sentinel R-08, una arquitectura propietaria basada en esferas geodesicas piramidales.

El modelo se entreno sobre el dataset `v22_chinchilla_mix` con 740 millones de tokens, una cantidad calibrada como Chinchilla-optimal para su escala, y comparte vocabulario y presupuesto de tokens con los modelos Sentinel R-08 para garantizar una comparacion justa. La relevancia actual reside en su caracter de referencia reproducible: permite aislar el efecto de la arquitectura (transformer convencional frente a geodesica) manteniendo constantes datos, tokenizador y numero de parametros.

Es un modelo de nicho, unicamente en italiano, con licencia no comercial y biblioteca `custom_code`. No esta pensado para produccion ni para tareas generales de generacion de texto, sino para investigacion comparativa de arquitecturas a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo GPT-2), Pre-LayerNorm, weight tying |
| Parametros totales | 45.546.496 (safetensors); 44.905.984 parametros unicos declarados en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | `sentinel-r08-non-commercial-v2` (uso no comercial) |
| Formato de pesos | safetensors (`model.safetensors`), biblioteca `custom_code` |
| Vocabulario | 1.251 piezas subword (`vocab_stages`) |
| Capas de atencion | 14 |
| Dataset de entrenamiento | `v22_chinchilla_mix` (740M tokens) |
| Pasos de entrenamiento | 185.000 de pretraining + 10.000 de midtraining |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso convencional con Pre-LayerNorm y weight tying entre la capa de embedding y la de salida, siguiendo el patron de GPT-2. La innovacion no esta en la arquitectura, deliberadamente estandar, sino en su funcion como control experimental: comparte con los modelos Sentinel R-08 el mismo vocabulario de 1.251 piezas y el mismo dataset de pretraining, de modo que cualquier diferencia de rendimiento pueda atribuirse a la arquitectura y no a variaciones en los datos o el tokenizador.

El entrenamiento se realizo en dos fases: 185.000 pasos de pretraining sobre `v22_chinchilla_mix` (740 millones de tokens, presupuesto Chinchilla-optimal para ~45M de parametros) y 10.000 pasos adicionales de midtraining. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores. La model card incluye correcciones tecnicas publicadas el 7 de noviembre de 2026 que afectan al codigo de carga de pesos y a la inicializacion de modulos, no al entrenamiento en si.

## Capacidades

- Generacion de texto causal autorregresiva en italiano, con vocabulario limitado a 1.251 piezas subword.
- Modelo de control para estudios comparativos de arquitectura (A/B frente a Sentinel R-08).
- Capacidad multilingue practicamente nula: solo se declara italiano.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Su utilidad principal es medir propiedades linguisticas controladas (por ejemplo, concordancia y morfologia) en comparacion con arquitecturas alternativas.

## Casos de uso

- Investigacion comparativa de arquitecturas: el modelo sirve como linea base transformer para medir, con datos y vocabulario identicos, la diferencia de rendimiento frente a la familia Sentinel R-08 en tareas de modelado de lenguaje en italiano.
- Evaluacion de tareas linguisticas controladas: por su vocabulario reducido y su entrenamiento Chinchilla-optimal, es adecuado para experimentos de concordancia y morfologia (tipo BLiMP-IT) donde se quiere aislar el efecto arquitectonico.
- Reproducibilidad academica: permite replicar el protocolo A/B del autor con un checkpoint publico de ~45M de parametros y 0,5 GB, viable en equipos modestos.
- Docencia e investigacion de bajo coste: su tamano permite entrenar y evaluar variantes en una sola GPU consumer o incluso en CPU para experimentos de tokenizacion.
- Estudio de eficiencia energetica: la model card reporta mediciones de velocidad y energia por token en Apple M1 Max en `float32`, utiles para comparativas de coste de inferencia a pequena escala.
- Analisis de tokenizadores de vocabulario pequeno: sirve para estudiar el efecto de un vocabulario de 1.251 piezas en la calidad de generacion y en la longitud efectiva de las secuencias.
- Verificacion de pipelines de carga `custom_code`: util para probar integraciones con `transformers` y el codigo personalizado del autor antes de pasar a los modelos Sentinel R-08.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLiMP-IT) para este modelo de control. Solo se menciona que el modelo Sentinel R-08 v7.2a alcanza un 82,51% en BLiMP-IT, pero no se ofrece la cifra correspondiente a esta linea base. Los unicos datos de rendimiento medidos son de eficiencia en Apple M1 Max con `float32`:

| Metrica (Apple M1 Max, float32, decodificacion 64→192 tokens) | Transformer Baseline | Sentinel R-08 (3 esferas) |
|---|---|---|
| Velocidad | 83,2 ± 1,1 tok/s | 19,2 ± 1,5 tok/s |
| Energia neta por token | 342 ± 50 mJ/tok | 521 ± 85 mJ/tok |
| Memoria GPU MPS de pico | 261,4 MB (58,9M param) | 375,8 MB (57,1M param) |
| RAM del proceso (RSS, mmap=True) | 401–461 MB | 401–461 MB |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en `float32` para ~45M de parametros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en Apple M1 Max (MPS).
- Cabe en GPU consumer: si, en practicamente todas (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: la biblioteca es `custom_code`, por lo que requiere cargar el codigo del repositorio con `trust_remote_code=True`; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 83,2 ± 1,1 tok/s en Apple M1 Max con `float32` durante decodificacion de 64 a 192 tokens.
- Memoria: 261,4 MB de pico en GPU MPS y 401–461 MB de RSS con `mmap=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R-08 Transformer Baseline | ~45M | No disponible | Transformer denso de control | No comercial (`sentinel-r08-non-commercial-v2`) | Hugging Face |
| Sentinel R-08 v7 Pyramid | 44,5M | No disponible | Esferas geodesicas piramidales | No disponible en la informacion | Hugging Face / GitHub |
| Sentinel R-08 v7.2a | 51,6M | No disponible | 12 hubs, 82,51% BLiMP-IT | No disponible en la informacion | Hugging Face / GitHub |
| GPT-2 small | 124M | 1.024 tokens | Transformer denso | MIT | Hugging Face |

La comparacion con GPT-2 small es solo orientativa por escala: el modelo de SentinelHub es aproximadamente un tercio del tamano y usa un vocabulario mucho mas reducido (1.251 frente a ~50.000 piezas), lo que limita la comparacion directa de calidad. No se dispone de datos de benchmarks comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de control experimental: no esta disenado para uso general ni para produccion.
- Vocabulario muy reducido (1.251 piezas), lo que limita la cobertura lexica y la calidad de generacion frente a tokenizadores estandar.
- Unicamente italiano; sin capacidades multilingues.
- Licencia `sentinel-r08-non-commercial-v2`: prohibido el uso comercial sin licencia enterprise del autor.
- Riesgo elevado de alucinacion y de texto incoherente por su escala (~45M) y su presupuesto de entrenamiento limitado.
- Requiere `trust_remote_code=True` y la biblioteca `custom_code`; la model card documenta errores de importacion y de carga de pesos corregidos el 7 de noviembre de 2026, por lo que versiones anteriores del codigo pueden fallar.
- No se documenta longitud de contexto ni tecnicas de alineacion (RLHF/DPO), lo que implica ausencia de salvaguardas de contenido.
- Los datos de eficiencia energetica provienen de una unica plataforma (Apple M1 Max) y no son extrapolables directamente a otras GPU.
- No se han publicado benchmarks de calidad, por lo que no es posible evaluar su rendimiento linguistico frente a alternativas sin ejecutar pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SentinelHub/R-08-Transformer-Baseline
- Modelo comparado Sentinel R-08 v7 Pyramid: https://huggingface.co/SentinelHub/R-08
- Modelo comparado Sentinel R-08 v7.2: https://huggingface.co/SentinelHub/R-08-v7.2
- Modelo comparado Sentinel R-08 v7.2a: https://huggingface.co/SentinelHub/R-08-v7.2a
- Repositorio GitHub del proyecto R-08: https://github.com/Thomasseri/R-08
- Repositorio GitHub v7.2: https://github.com/Thomasseri/R-08-v7.2
- Repositorio GitHub v7.2a: https://github.com/Thomasseri/R-08-v7.2a
- Sitio web del autor: https://www.sentinelhub.eu
- Perfil de GitHub del autor: https://github.com/Thomasseri
- Perfil de Hugging Face del autor: https://huggingface.co/SentinelHub
- Issues y consultas: https://github.com/Thomasseri/R-08/issues/new
