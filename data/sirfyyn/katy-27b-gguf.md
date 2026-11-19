# sirfyyn/Katy-27B-GGUF

## Resumen

Katy-27B-GGUF es una colección de cuantizaciones GGUF del modelo ukisai/Swift-1.5-Qwen3.8-27b, un derivado de la familia Qwen3.8 de 27B de parámetros. El trabajo lo publica el usuario sirfyyn como proyecto privado, con el objetivo de ejecutar el modelo en local sobre una única GPU de 32 GB (RTX PRO 4500 Blackwell). Incluye tres cuantizaciones con matriz de importancia (IQ4_XS, IQ3_S e IQ2_S) y una cabeza de borrador especulativa DFlash2 convertida a GGUF.

La relevancia del repositorio está en el trabajo de cuantización y en la infraestructura de decodificación especulativa: el autor documenta divergencia KL frente a BF16, acuerdo top-1, resultados en ARC-Challenge y GSM8K para cada cuantización, y mediciones de throughput con y sin borrador especulativo. Es, por tanto, una ficha útil para quien necesite desplegar un modelo de 27B en hardware de consumo o en una sola tarjeta profesional, con datos verificables de compromiso entre tamaño y calidad.

El modelo base es de tipo transformer denso (no MoE) con 27B de parámetros según la nomenclatura del autor; el dato de parámetros reales en safetensors que acompaña al repo (1.924.404.480) corresponde a la cabeza DFlash2, no al modelo principal. La licencia es swift-open-license-1.0, distinta de Apache-2.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B); decodificacion especulativa opcional con cabeza DFlash2 |
| Parametros totales | 27B (modelo base, segun nomenclatura del autor); 1.924.404.480 en la cabeza DFlash2 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (configuracion de referencia del autor) |
| Tipos de cuantizacion | IQ4_XS, IQ3_S, IQ2_S (con imatrix); cabeza DFlash2 en Q8_0; capa MTP de IQ2_S en Q8_0 |
| Idiomas soportados | no disponible (la calibracion incluye texto multilingue y aleman, pero no se declara lista de idiomas) |
| Licencia | swift-open-license-1.0 (el modelo base); cabeza DFlash2 Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros de la familia Qwen3.8, publicado por ukisai como Swift-1.5-Qwen3.8-27b. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card del repositorio de cuantización no los detalla. Sí se documenta que el modelo soporta decodificación especulativa mediante una cabeza DFlash2 (z-lab/Qwen3.8-27B-DFlash2, Apache-2.0), que el autor convierte a GGUF y cuantiza a Q8_0 sin modificar los pesos (los 81 tensores del GGUF BF16 son idénticos bit a bit al safetensors original).

La innovación técnica principal del repositorio es la matriz de importancia (imatrix) usada para todas las cuantizaciones, calibrada con 250 documentos y unos 264.000 tokens: 60k de código, 42k multilingüe, 40k de chat en alemán, 37k de razonamiento, 32k de agentic, 22k de barrido de vocabulario, 17k de gráficos y 16k de datos estructurados. La matriz se distribuye como fichero independiente (katy-imatrix.gguf). Además, el autor mantiene un fork de llama.cpp (FLE) que implementa el borrador DFlash2 y la búsqueda n-grama (`ngram-mod`), con binarios para Linux y Windows.

## Capacidades

- Generación de texto conversacional multi-turno, con modo "thinking" desactivable (las mediciones de benchmarks se hicieron con thinking off).
- Razonamiento y matemáticas: resultados medidos en ARC-Challenge y GSM8K.
- Generación de código: la calibración de la imatrix incluye un 60k de tokens de código y las pruebas de divergencia usan la referencia del lenguaje Python.
- Capacidades agentic: la calibración incluye 32k tokens de datos agenticos, lo que sugiere soporte para flujos de varios pasos.
- Multilingüe: la calibración incluye texto multilingüe y alemán; no se declara una lista cerrada de idiomas.
- Decodificación especulativa: soporte de cabeza DFlash2 y de búsqueda n-grama (`ngram-mod`) para acelerar la generación cuando la salida repite texto del contexto.
- Contexto largo: configuración de referencia con 262.144 tokens y KV cache en q8_0.
- No se documentan capacidades de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener conversaciones multi-turno con contexto de hasta 262.144 tokens, lo que permite adjuntar documentación extensa o historiales largos sin truncar; encaja en despliegues domésticos o de oficina sobre una GPU de 32 GB.
- Generación de código en pipelines locales: con IQ4_XS (14,26 GiB) cabe en tarjetas de 16-24 GB y puede integrarse en flujos de autocompletado o revisión de código, apoyándose en la calibración específica de código de la imatrix.
- Razonamiento matemático y resolución de problemas: los resultados medidos en GSM8K (96,8-97,2 % con IQ4_XS) lo hacen adecuado para tutoría o verificación de cálculos en entornos con requisitos de privacidad.
- Procesamiento de documentación técnica larga: la ventana de 262.144 tokens permite resumir o consultar manuales, referencias de lenguaje y documentación de Kubernetes, que son precisamente los textos usados en la evaluación de divergencia.
- Despliegue en hardware de gama alta de consumo: con IQ2_S (9,14 GiB) el modelo puede ejecutarse en GPUs de 12-16 GB, aunque con una degradación medible (94,4 % en ARC-Challenge frente a 96,3 % de IQ4_XS).
- Aceleración de inferencia en producción: el uso de la cabeza DFlash2 junto con `ngram-mod` eleva el throughput de 46,6 a 116,6-127,3 tok/s en la RTX PRO 4500 Blackwell del autor, útil en servicios con carga concurrente donde la latencia importa.
- Evaluación y comparación de cuantizaciones: el repositorio publica KLD, acuerdo top-1 y resultados de tareas para cada fichero, lo que permite elegir el compromiso tamaño/calidad con datos propios.

## Benchmarks y rendimiento

Calidad por cuantización (0-shot, thinking off, temperatura 0):

| Cuantizacion | Tamano (GiB) | KLD E (Python ref.) | KLD W (Wikipedia DE) | KLD K (K8s DE) | Top-1 E / W / K | ARC-Challenge (1172) | GSM8K (250) |
|---|---|---|---|---|---|---|---|
| IQ4_XS | 14,26 | 0,0645 | 0,0127 | 0,0160 | 92,5 / 95,9 / 95,0 % | 96,3 / 96,5 % | 96,8 / 97,2 % |
| IQ3_S | 11,74 | 0,1804 | 0,0388 | 0,0482 | 86,9 / 92,4 / 91,7 % | 96,1 % | 96,0 % |
| IQ2_S | 9,14 | 0,4919 | 0,1682 | 0,2070 | 75,9 / 84,5 / 82,9 % | 94,4 % | 94,0 % |

Throughput medido en RTX PRO 4500 Blackwell 32 GB, 40 tareas mixtas, temperatura 0, contexto 262.144, KV q8_0:

| Configuracion | Decode (tok/s) |
|---|---|
| Sin especulacion | 46,6 |
| DFlash2 + ngram-mod | 116,6 |
| DFlash2 + ngram-mod, n-min 8, n-max 32, n-match 16 ("ng8") | 127,3 (+9,1 %) |

En las 20 de 40 tareas sin repetición en la salida, la ganancia es menor: 79,5 tok/s (1,7x). La reproducción con el binario público FLE v1.1.0 dio 127,1-127,5 tok/s en las mismas 40 tareas, con salidas idénticas token a token.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ4_XS ~14,26 GiB de pesos; IQ3_S ~11,74 GiB; IQ2_S ~9,14 GiB. Añadir la KV cache (q8_0) para el contexto configurado; el autor no publica la relación exacta entre contexto y memoria por tarjeta.
- GPU recomendadas: RTX PRO 4500 Blackwell 32 GB (medida por el autor), A100/H100 para despliegues con contexto máximo, RTX 4090 (24 GB) para IQ4_XS con contexto moderado.
- Cabe en GPU de consumo: IQ4_XS en tarjetas de 16-24 GB; IQ3_S en 12-16 GB; IQ2_S en 12 GB.
- Opciones de despliegue: llama.cpp (llama-server), fork FLE del autor (v1.1.0, binarios Linux y Windows) para decodificación especulativa con DFlash2 y `ngram-mod`. No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: 46,6 tok/s sin especulación; 116,6-127,3 tok/s con DFlash2 + ngram-mod en la RTX PRO 4500 Blackwell. La cabeza DFlash2 ocupa 1,92 GiB adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Katy-27B-GGUF (este) | 27B | 262.144 | swift-open-license-1.0 | GGUF | Cuantizaciones IQ4_XS/IQ3_S/IQ2_S con imatrix y cabeza DFlash2 |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | swift-open-license-1.0 | safetensors | Modelo base sin cuantizar |
| z-lab/Qwen3.8-27B-DFlash2 | cabeza de borrador | no aplica | Apache-2.0 | safetensors | Cabeza especulativa, no un modelo generativo completo |

No se dispone de datos de benchmarks de terceros para comparar con otros modelos de 27B en la información proporcionada.

## Limitaciones y advertencias

- Licencia swift-open-license-1.0: no es Apache-2.0 ni MIT; hay que revisar el fichero LICENSE antes de cualquier uso comercial.
- La cuantización IQ2_S degrada la calidad de forma notable: KLD de 0,4919 en la referencia de Python frente a 0,0645 de IQ4_XS, y 94,4 % en ARC-Challenge frente a 96,3 %.
- El autor no ha medido qué tarjeta soporta qué fichero junto con cuánto contexto, y no ofrece garantías al respecto.
- La cabeza DFlash2 solo se ha probado en el fork FLE; el autor no ha verificado que cargue en llama.cpp upstream, aunque este documente `draft-dflash` y `ngram-mod`.
- Las ganancias de la decodificación especulativa dependen de la repetición en la salida: en tareas sin repetición la mejora baja a 1,7x.
- No se declara lista de idiomas soportados ni datos de sesgo o alucinación en la model card.
- El repositorio es un proyecto privado publicado "tal cual", sin garantías de mantenimiento.
- La calibración de la imatrix usa el dataset AtomicChat/calib-corpora con licencia "other"; solo se distribuye la matriz resultante, no el texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirfyyn/Katy-27B-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cabeza DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Fork FLE (binarios): https://github.com/sirfyyn/FastLocalExperts/releases/tag/v1.1.0
- Variante Kate (sin dirección de rechazo): https://huggingface.co/sirfyyn/Kate-Qwen-27B-GGUF-SpedUp-Abliterated
- Dataset de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Herramienta FLE Link: https://flelink.run
- Vídeo del informe de Kate: https://youtu.be/Bye6WPpkxA4
