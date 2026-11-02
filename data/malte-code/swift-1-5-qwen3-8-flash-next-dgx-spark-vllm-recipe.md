# Malte-Code/Swift-1.5-Qwen3.8-Flash-Next-DGX-Spark-vLLM-recipe

## Resumen

Swift 1.5 (Qwen3.8 Flash-Next, NVFP4 + FP8 PLE) es una receta de despliegue para vLLM publicada por Malte-Code, no un modelo con pesos propios. El repositorio documenta cómo servir el modelo `d0xin/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-FP8PLE` (a su vez derivado de `ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4` y del original `Qwen/Qwen3.8-Flash-Next`) sobre una única NVIDIA DGX Spark con GB10, 128 GB de memoria unificada LPDDR5x y arquitectura Blackwell (sm_121). Su valor esta en que recoge configuracion afinada, scripts de conversion y mediciones reales de 11 dias de uso continuo como backend de agentes de codigo.

La propuesta tecnica combina cuantizacion NVFP4 para los pesos con FP8 para las capas PLE, decodificacion especulativa MTP con 3 tokens de borrador y un pool de KV cache en FP8 de 14,5 GiB que da cabida a 872.964 tokens. El contexto nativo es de 262.144 tokens sin YaRN. El rendimiento medido en uso real es de aproximadamente 43 tok/s en un solo stream y de hasta 86 tok/s agregados con 5 streams paralelos, con una tasa de acierto de prefix caching del 91 % sobre 2.000 millones de tokens de prompt.

Es relevante ahora porque demuestra que un modelo de clase Flash con contexto de 256k y cuantizacion de 4 bits puede sostener cargas de trabajo de agentes de codigo en hardware de sobremesa de gama alta (una sola DGX Spark), con latencias de primer token de 1,9 s de mediana y sin throttling termico en 249 horas de carga. El repositorio en si no contiene pesos y su licencia es Apache-2.0, mientras que los pesos subyacentes estan bajo Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8 Flash-Next), con decodificacion especulativa MTP; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos (sin YaRN) |
| Tipos de cuantizacion | NVFP4 (pesos) + FP8 (capas PLE y KV cache); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los archivos de la receta; Qwen Community License 1.0 para los pesos |
| Formato de pesos | Pesos en formato NVFP4/FP8 publicados en el repo base; la receta no incluye pesos |

## Arquitectura y entrenamiento

La receta no describe el entrenamiento del modelo subyacente: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta es la pila de serving. Sobre vLLM 0.31.0 (imagen construida a partir de `blazux/qwen3.8-Flash-DGX` en el commit `7d0798e`), se aplica una superposicion de staging para las capas PLE, una conversion de capas laterales a FP8 mediante scripts propios, full CUDA graphs y el kernel Humming para MoE. La decodificacion especulativa emplea MTP con 3 tokens de borrador y un vocabulario de borrador de 65.536 tokens.

Las innovaciones destacables son de inferencia, no de arquitectura del modelo: el pool de KV cache en FP8 fijado en 14,5 GiB (872.964 tokens, equivalentes a 3,33 peticiones de longitud completa), la combinacion de full CUDA graphs con el kernel Humming MoE (que aporta entre un 8 y un 10 % en benchmark controlado a 1 stream y un 18 % en uso real), y un esquema de prefix caching que alcanza el 91 % de acierto. La aceptacion de tokens especulativos es del 77,5 % en la primera posicion, 60,0 % en la segunda y 46,2 % en la tercera, con 2,84 tokens por ronda incluyendo el verificado, y apenas depende de la carga (0,59-0,63 agrupado de 1 a 6 streams).

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo Qwen3.8 Flash-Next subyacente.
- Generacion de codigo: la receta esta validada como backend diario de agentes de codigo durante 11 dias.
- Contexto largo: 262.144 tokens nativos, con soporte practico de prompts de 104k tokens de mediana en uso real (p90 de 163k).
- Prefix caching de alto rendimiento: 91 % de acierto sobre 2.000 millones de tokens de prompt, lo que reduce el tiempo hasta el primer token a 1,1 s cuando hay menos de 1k tokens nuevos.
- Decodificacion especulativa MTP con 3 tokens de borrador y 2,84 tokens aceptados por ronda.
- Serving multi-stream: hasta 5 peticiones concurrentes con saturacion agregada en torno a 85 tok/s.
- Tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multimodales, de audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Backend de agentes de codigo: el escenario validado por el autor. Los agentes envian prompts de 104k tokens de mediana (p90 163k), de los cuales el 97 % ya esta en la cache de prefijo; el modelo responde con 300 tokens de salida de mediana en 14 s de duracion de peticion. Es adecuado porque el prefix caching mantiene el TTFT en 1,9 s de mediana pese al tamano del prompt.
- RAG sobre documentacion extensa: con 262.144 tokens de contexto nativo y un pool de KV cache de 872.964 tokens, se pueden mantener varias conversaciones con corpus largos simultaneamente sin recargar el contexto.
- Asistencia de programacion en IDE o CLI: con 42,8 tok/s en un solo stream (33,6-48,0 en p25-p75) y 1,9 s de TTFT, la latencia es compatible con autocompletado y generacion de parches en flujo interactivo.
- Procesamiento por lotes de revision de codigo: con 4 streams paralelos se alcanzan 83,4 tok/s agregados, adecuado para tareas de analisis estatico asistido o generacion de tests sobre repositorios.
- Despliegue en hardware de sobremesa de gama alta: la receta esta dimensionada para una unica DGX Spark (GB10, 128 GB unificados) con 38,5 W de mediana bajo carga y sin throttling en 249 horas, lo que la hace viable en entornos de oficina o laboratorio sin sala de servidores.
- Servicio interno multiinquilino ligero: con 3 streams concurrentes se obtienen 24,3 tok/s por stream y 72,8 tok/s totales, suficiente para un equipo pequeno de desarrolladores compartiendo un unico nodo.
- Evaluacion y prototipado de modelos Qwen3.8 Flash-Next: la receta sirve como referencia reproducible para medir el impacto de NVFP4, FP8 PLE y MTP antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Rendimiento en uso real (11 dias, monitorizacion de `/metrics` de vLLM cada 5 s, intervalos con numero de peticiones constante):

| Streams paralelos | Por stream, mediana (p25-p75) | Total | Tiempo observado |
|---:|---:|---:|---:|
| 1 | 42,8 tok/s (33,6-48,0) | 42,8 tok/s | 47 h |
| 2 | 30,3 tok/s (26,6-33,9) | 60,6 tok/s | 34 h |
| 3 | 24,3 tok/s (20,9-26,7) | 72,8 tok/s | 19 h |
| 4 | 20,9 tok/s (17,2-23,1) | 83,4 tok/s | 7 h |
| 5 | 17,3 tok/s (12,6-19,1) | 86,4 tok/s | 2,6 h |

Comparativa con configuraciones anteriores en la misma maquina:

| Streams | Esta receta | Config D | Config A |
|---:|---:|---:|---:|
| 1 | 42,8 tok/s | 36,2 tok/s | 37,6 tok/s |
| 2 | 30,3 tok/s | 28,4 tok/s | 27,4 tok/s |
| 3 | 24,3 tok/s | 22,0 tok/s | no disponible |
| 4 | 20,9 tok/s | 18,6 tok/s | no disponible |
| 5 | 17,3 tok/s | 17,5 tok/s | no disponible |

Metricas de serving adicionales:

| Metrica | Valor |
|---|---|
| TTFT p50 / p90 | 1,9 s / 4,0 s |
| TTFT con menos de 1k tokens nuevos | 1,1 s |
| TTFT con 8-32k tokens nuevos | 6,3 s |
| TTFT con mas de 32k tokens nuevos | 44 s |
| Duracion de peticion p50 | 14 s |
| Tokens de salida p50 | 300 |
| Aceptacion MTP acumulada (posiciones 1/2/3) | 77,5 % / 60,0 % / 46,2 % |
| Tokens por ronda MTP | 2,84 |
| Acierto de prefix caching | 91 % |
| GPU bajo carga (mediana / max) | 60 °C / 74 °C |
| Reloj SM mediana | 2515 MHz |
| Potencia mediana (p99) | 38,5 W (73 W) |
| Memoria de sistema libre bajo carga (mediana / minimo) | 9,7 GiB / 6,9 GiB |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPU: una NVIDIA DGX Spark con GB10 (sm_121, Blackwell) y 128 GB de memoria unificada LPDDR5x; la receta esta dimensionada especificamente para este hardware.
- VRAM: no se indica un desglose de VRAM por componente; el pool de KV cache en FP8 se fija en 14,5 GiB y la memoria de sistema libre bajo carga tiene una mediana de 9,7 GiB (minimo 6,9 GiB).
- Cabe en consumer GPU: no hay datos para GPUs de consumo como RTX 4090; la receta depende de sm_121 y de NVFP4, por lo que no es trasladable sin cambios a arquitecturas anteriores.
- Motor de despliegue: vLLM 0.31.0 con imagen personalizada construida desde `blazux/qwen3.8-Flash-DGX` en el commit `7d0798e`; se requieren full CUDA graphs y el kernel Humming MoE.
- Almacenamiento: NVMe en la maquina de referencia.
- Throughput: 42,8 tok/s a 1 stream, saturacion en torno a 85 tok/s a partir de 4 streams.
- Consumo: 38,5 W de mediana y 73 W en p99 bajo carga sostenida, sin throttling en 249 horas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta receta (Swift 1.5 Qwen3.8 Flash-Next NVFP4+FP8 PLE) | no disponible | 262.144 | 42,8 tok/s a 1 stream; 86,4 tok/s a 5 streams | Apache-2.0 (receta) / Qwen Community License 1.0 (pesos) | HuggingFace, requiere build propio de imagen |
| Config D (misma imagen, MTP 3, KV 12 GiB, CUTLASS MoE por defecto) | no disponible | no disponible | 36,2 tok/s a 1 stream; 18,6 tok/s a 4 streams | idem | no publicada |
| Config A (vLLM 0.30, MTP 2, contexto 200k) | no disponible | 200.000 | 37,6 tok/s a 1 stream | idem | no publicada |
| Qwen/Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | no disponible | Qwen Community License 1.0 | HuggingFace |

No se dispone de datos de benchmarks academicos ni de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una receta de serving y un conjunto de mediciones. Cualquier uso requiere descargar los pesos desde `d0xin/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-FP8PLE` en el commit `1a3c606`.
- La receta esta atada a hardware concreto: DGX Spark GB10 (sm_121), NVFP4 y vLLM 0.31.0 con una imagen construida a medida. No es portable a GPUs sin soporte NVFP4 ni a versiones anteriores de vLLM sin revalidacion.
- Los pesos subyacentes estan bajo Qwen Community License 1.0, no Apache-2.0; la licencia Apache-2.0 solo cubre los archivos de la receta. Es necesario revisar los terminos de la licencia Qwen para uso comercial.
- Las cifras de rendimiento provienen de monitorizacion de uso real, no de un A/B test controlado: el propio autor advierte que la comparacion con configuraciones anteriores es indicativa porque la mezcla de cargas vario entre periodos.
- El benchmark controlado solo se describe parcialmente en la informacion disponible (temperatura 0 y 1, mediana de tok/s del stream medido); no se detallan los prompts ni la metodologia completa.
- El rendimiento decae con la concurrencia: de 42,8 tok/s a 1 stream se baja a 17,3 tok/s por stream con 5 streams, con saturacion agregada en torno a 85 tok/s.
- El TTFT depende del numero de tokens no cacheados, no de la longitud total del prompt: con mas de 32k tokens nuevos el TTFT sube a 44 s. Cargas con poca reutilizacion de prefijo experimentaran latencias mucho mayores.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni capacidades multimodales del modelo subyacente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo dia (2026-11-02); no hay validacion de la comunidad.
- La fecha de creacion del repositorio es posterior a las mediciones citadas (2026-10-22 a 2026-11-02), lo que es coherente con una publicacion a posteriori, pero conviene verificar la reproducibilidad de los numeros en el propio hardware.

## Enlaces

- Repositorio de la receta: https://huggingface.co/Malte-Code/Swift-1.5-Qwen3.8-Flash-Next-DGX-Spark-vLLM-recipe
- Pesos (modelo base de la receta): https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-FP8PLE
- Pesos intermedios: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Imagen de serving: https://github.com/blazux/qwen3.8-Flash-DGX
- Imagen base de vLLM: `vllm/vllm-openai:v0.31.0`
