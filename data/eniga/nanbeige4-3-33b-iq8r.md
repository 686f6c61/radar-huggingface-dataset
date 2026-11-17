# eniga/nanbeige4.3-33b-iq8r

## Resumen

Nanbeige4.3-33B IQ8R (Radiance) es una cuantización en int8 rotado del modelo Nanbeige4.3-33B, publicada por el usuario eniga. No se trata de un modelo nuevo, sino de un contenedor de pesos en formato propietario `.rad` para el servidor de inferencia Radiance 2.0.0, orientado exclusivamente a GPUs AMD mediante ROCm. El modelo base, desarrollado por Nanbeige, es un transformer denso de 33.000 millones de parámetros con `model_type: llama` y licencia Apache-2.0.

La relevancia de esta publicación es acotada pero específica: ofrece una vía de despliegue eficiente del modelo original en hardware AMD Radeon, con pesos int8 que reducen el peso total a 32,10 GiB y un KV cache también en int8. El archivo resultante no es compatible con transformers, vLLM ni llama.cpp, lo que limita su uso al ecosistema Radiance.

El proceso de cuantización emplea round-to-nearest con búsqueda de escala por grupo, sin datos de calibración, y reporta un error relativo de Frobenius de entre 0,63 % y 0,70 % en las 209 matrices cuantizadas. No se ha medido divergencia KL frente al modelo en bf16, por lo que la fidelidad respecto al original no está cuantificada formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (reporta `model_type: llama`), plugin `llama_dense_fp8` en Radiance |
| Parametros totales | 33 000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 200 000 tokens (configurado en `max-model-len` en el ejemplo de serving) |
| Tipos de cuantizacion | IQ8R (int8 rotado con Hadamard de 128 vías), KV cache i8 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (contenedor Radiance), 34,5 GB en disco, 32,10 GiB de pesos |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de 33.000 millones de parámetros que se declara con `model_type: llama`. La model card del contenedor cuantizado no aporta detalles sobre el entrenamiento del modelo original: no se especifica el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones arquitectónicas del modelo base más allá de su clasificación como denso.

La contribución técnica de esta publicación es el esquema de cuantización IQ8R. Las matrices lineales del tronco se almacenan como códigos int8 con una escala u8 por cada fila y cada 256 elementos de la dimensión K, bajo una escala de fila en bf16, y la dimensión K se rota mediante una transformada de Hadamard de 128 vías (`fwht128`). El `lm_head` se cuantiza en int8 con escala bf16 por fila y cada 128 elementos, sin rotación. La embedding y todas las normalizaciones se mantienen en bf16. El ajuste es round-to-nearest con búsqueda de escala por grupo, sin datos de calibración. No se incluye drafter especulativo: el modelo base carece de cabeza MTP y el único drafter publicado (DFlash2) no es compatible con el plugin llama de Radiance 2.0.0.

## Capacidades

- Generación de texto en inglés y chino, con plantilla de chat propia del checkpoint.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`; el bloque de pensamiento se devuelve como `reasoning_content`.
- Tool calling mediante el formato XML de la plantilla (`<tool_call><function=...>`).
- Flujos agénticos y de uso de herramientas, con temperatura recomendada de 1.0 según la model card.
- Conversaciones multi-turno con contexto largo, hasta 200 000 tokens configurados.
- Generación de código, matemáticas, prosa, JSON estructurado y edición de archivos (categorías evaluadas en el benchmark de rendimiento).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Despliegue de un modelo de 33B en GPUs AMD Radeon: el contenedor IQ8R permite servir el modelo con 25,45 GiB por tarjeta en `tp: 2`, encajando en dos Radeon AI PRO R9700 de 32 GB y evitando la necesidad de hardware NVIDIA.
- Asistentes conversacionales multi-turno: la ventana de 200 000 tokens y el KV cache en int8 (unos 104 KiB por token entre ambas tarjetas) permiten mantener historiales extensos sin agotar la VRAM.
- Edición de archivos y generación de parches: con `spec-ngram: 4`, la categoría file_edit alcanza 58,7 t/s frente a 35,0 t/s sin especulación, un 68 % más, lo que la hace adecuada para herramientas de refactorización asistida.
- Resúmenes de documentos largos: la especulación por prompt lookup aporta un 86 % de mejora en summarization (65,1 t/s), el mayor incremento por categoría, adecuado para procesar entradas extensas.
- Generación de JSON estructurado y salidas de formato fijo: la mejora del 51 % en la categoría json (53,1 t/s) favorece pipelines que requieren respuestas parseables.
- Razonamiento matemático y resolución de problemas: la categoría math mejora un 37 % con `spec-ngram: 4` (47,8 t/s), útil para asistentes de cálculo paso a paso.
- Atención al cliente en inglés o chino: el soporte bilingüe y la plantilla de chat con system prompt por defecto en chino permiten desplegar el modelo en ambos mercados sin ajustes adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son de rendimiento de inferencia, medidos en dos AMD Radeon AI PRO R9700 (32 GB, límite de 210 W, sin peer-to-peer PCIe), `tp: 2`, KV cache i8, Radiance 2.0.0, con BetterBench a 8 secuencias, temperatura 0,7, top-p 0,95 y top-k 20.

| Metrica | Valor |
|---|---|
| Decodificación mono-stream | 35,0 t/s |
| TTFT p50 / p99 (prompt corto) | 60 ms / 122 ms |
| Decodificación agregada, 1 / 2 / 4 / 8 concurrentes | 34,8 / 68,1 / 124,3 / 210,5 t/s |
| Decodificación por petición a 8 concurrentes | 31,6 t/s |
| Carga desde NVMe | 5,7 s |

Prefill (prompt tokens / TTFT, caché de prefijo fría):

| Tokens de prompt | TTFT p50 | Prefill t/s |
|--:|--:|--:|
| 1 572 | 0,59 s | 2 682 |
| 6 042 | 2,32 s | 2 596 |
| 12 078 | 4,98 s | 2 426 |
| 24 068 | 11,25 s | 2 141 |
| 48 046 | 28,30 s | 1 698 |

Con especulación por prompt lookup (`spec-ngram: 4`), la decodificación mono-stream sube a 47,9 t/s (un 37 % más) y la agregada a 8 concurrentes a 242,5 t/s. Por categoría, las ganancias medianas mono-stream son: chat +7 %, reasoning +18 %, code +21 %, prose +25 %, math +37 %, json +51 %, file_edit +68 % y summarization +86 %. El prefill no cambia.

## Requisitos de hardware

- VRAM: 25,45 GiB por tarjeta en `tp: 2`, incluyendo pesos, KV cache i8 y caché de prefijo.
- GPUs: dos AMD Radeon AI PRO R9700 de 32 GB en la configuración medida; el formato requiere hardware AMD con ROCm.
- No cabe en GPUs de consumo de 24 GB o menos en esta configuración; se necesitan al menos dos tarjetas de 32 GB o equivalentes.
- Despliegue exclusivamente mediante Radiance 2.0.0 (imagen `stilldeadcode/radiance`); no es compatible con vLLM, llama.cpp, transformers, Ollama ni TGI.
- Conversión: `rad-convert` con receta `nanbeige43-33b-iq8r.recipe`, 6,5 minutos en 24 núcleos de CPU.
- Latencia y throughput: 35,0 t/s mono-stream sin especulación y 47,9 t/s con `spec-ngram: 4`; TTFT p50 de 60 ms en prompt corto. La decodificación está limitada por ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Nanbeige4.3-33B IQ8R (esta ficha) | 33B | 200 000 | `.rad` (Radiance) | Apache-2.0 | AMD ROCm |
| Nanbeige/Nanbeige4.3-33B (original) | 33B | no disponible | safetensors (presumible) | Apache-2.0 | GPU estándar |
| StillDeadcode/qwen3.8-27b-iq8r | 27B | no disponible | `.rad` (Radiance) | no disponible | AMD ROCm |

El contenedor de Qwen3.8-27B IQ8R es la referencia directa del ecosistema Radiance y sirve como punto de comparación del esquema de cuantización: según la model card, su ajuste GPTQ alcanza una divergencia KL media de 0,00039 frente a bf16, y el round-to-nearest 0,00049, ambos muy por debajo del 0,0036 del checkpoint FP8 oficial de Qwen. Para este contenedor de Nanbeige no se ha medido divergencia KL, por lo que la comparación de fidelidad no está disponible.

## Limitaciones y advertencias

- El archivo `.rad` no carga en transformers, vLLM ni llama.cpp; el uso queda restringido al servidor Radiance 2.0.0 y a GPUs AMD con ROCm.
- No se ha medido la divergencia KL frente al modelo en bf16, por lo que la pérdida de calidad respecto al original no está cuantificada; solo se reporta el error de Frobenius por matriz (0,63-0,70 %).
- El ajuste es round-to-nearest sin calibración, no GPTQ; en el caso comparable de Qwen3.8 la diferencia de KL entre ambos métodos es pequeña pero existe.
- No hay drafter especulativo disponible: el modelo base carece de cabeza MTP y el drafter DFlash2 publicado no es compatible con el plugin llama de Radiance.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Con mensaje de sistema vacío, la plantilla inserta un system prompt por defecto en chino, lo que puede condicionar el comportamiento en despliegues en inglés si no se sobrescribe.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero los pesos son de Nanbeige y el contenedor es una conversión de terceros sin garantías del autor original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Contenedor cuantizado: https://huggingface.co/eniga/nanbeige4.3-33b-iq8r
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Servidor Radiance: https://codeberg.org/StillDeadcode/radiance
- Receta de conversión: `nanbeige43-33b-iq8r.recipe` (incluida en el repositorio)
- Contenedor de referencia Qwen3.8-27B IQ8R: https://huggingface.co/StillDeadcode/qwen3.8-27b-iq8r
- Drafter DFlash2 (no compatible): https://huggingface.co/ProCreations/Nanbeige4.3-33B-DFlash2
