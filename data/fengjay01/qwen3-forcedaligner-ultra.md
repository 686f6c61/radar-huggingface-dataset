# fengjay01/Qwen3-ForcedAligner-Ultra

## Resumen

Qwen3-ForcedAligner-Ultra es un modelo de alineamiento forzado (forced alignment) multilingüe derivado de `Qwen/Qwen3-ForcedAligner-0.6B`, publicado por el usuario fengjay01 en Hugging Face bajo licencia Apache 2.0. Su función es asignar marcas temporales a nivel de palabra a partir de un audio y su transcripción, una tarea crítica para subtitulado, doblaje, preparación de corpus de voz y reparación de transcripciones ASR. A diferencia del checkpoint oficial de Qwen, este fine-tuning está diseñado explícitamente para tolerar transcripciones imperfectas (sustituciones, inserciones, omisiones y fusiones de palabras típicas de un ASR) y audio conversacional con ruido, acento, reverberación o cambios de ganancia.

El modelo conserva la arquitectura del Qwen3-ForcedAligner original, con 917.728.896 parámetros en formato safetensors (repo de 1,8 GB), y añade de forma opcional una pequeña "Local Head" que refina los límites dentro de la isla acústica seleccionada con resolución de 10 ms. Esto resuelve la limitación física de la rejilla de 80 ms del modelo base: el Qwen principal selecciona la isla acústica correcta, pero no puede colocar cada frontera con precisión submúltiplo de esa rejilla, mientras que la Local Head opera en un vecindario acotado de ±60 ms.

La relevancia actual del modelo es doble: por un lado, reduce drásticamente los errores catastróficos de alineamiento (de 1,565 % a 0,195 % de errores superiores a 1000 ms frente al checkpoint oficial) y baja el MAE de 124,95 ms a 34,95 ms en una evaluación multilingüe de 6,5 horas y 105.022 puntos de frontera; por otro, mantiene el rendimiento de velocidad del modelo base (150x RTFx en una RTX 5070 Ti) y la compatibilidad con la API estándar `qwen-asr`, lo que lo convierte en un reemplazo directo sin reingeniería del pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (modelo de alineamiento forzado, `qwen3_asr`) con Local Head opcional de refinamiento de fronteras |
| Parámetros totales | 917.728.896 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh, fr, de, it, ja, ko, ru, es, pt, yue (11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-ForcedAligner-0.6B (fine-tune) |
| Pipeline | automatic-speech-recognition |
| Librería | transformers |
| Tamaño del repo | 1,8 GB |
| Resolución temporal del modelo principal | 80 ms (rejilla nativa de Qwen) |
| Resolución de la Local Head | 10 ms, en vecindario de ±60 ms |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial `Qwen/Qwen3-ForcedAligner-0.6B`, un transformer Qwen3 adaptado a la tarea de alineamiento forzado que, dado un par audio-transcripción, predice los límites de inicio y fin de cada palabra sobre una rejilla temporal de 80 ms. Sobre esa base, el fine-tuning introduce dos componentes: por un lado, un ajuste del modelo principal para mejorar la robustez frente a transcripciones no literales y audio degradado; por otro, una Local Head opcional que, una vez seleccionada la isla acústica correcta por el modelo principal, refina la frontera dentro de un vecindario de ±60 ms con resolución de 10 ms. La Local Head es la que permite pasar de un 55,2 % de endpoints dentro de 25 ms a un 78,3 %.

El entrenamiento incorpora datos con sustituciones, inserciones y patrones de división/fusión de palabras procedentes de ASR real, además de ejemplos explícitos de palabras ausentes en la transcripción. También incluye un mixto acústico con cambios controlados de velocidad, ruido, reverberación y ganancia, manteniendo las marcas temporales de referencia exactas. El modelo fue fine-tuneado con enunciados de cambio de código (code-switching) explícitos, lo que le permite mantener el soporte de los 11 idiomas del Qwen3-ForcedAligner original. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no disponible).

## Capacidades

- Alineamiento forzado a nivel de palabra: asigna timestamps de inicio y fin a cada palabra a partir de audio y transcripción.
- Robustez frente a transcripciones imperfectas: tolera sustituciones, inserciones, omisiones y fusiones/divisiones de palabras típicas de la salida de un ASR.
- Robustez acústica: entrenado con velocidad alterada, ruido, reverberación y cambios de ganancia.
- Multilingüe: 11 idiomas (chino, inglés, cantonés, francés, alemán, italiano, japonés, coreano, portugués, ruso y español).
- Cambio de código: soporte explícito de enunciados con mezcla de idiomas.
- Refinamiento local opcional: la Local Head baja la resolución de frontera de 80 ms a 10 ms en un vecindario de ±60 ms.
- Modo base "drop-in": sin la Local Head, la inferencia usa la API estándar `qwen-asr` de alineamiento forzado.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en Hugging Face.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio generativo, tool calling ni agentes (no disponible).

## Casos de uso

- Subtitulado automático: el modelo genera timestamps por palabra para sincronizar subtítulos con precisión; la Local Head ofrece un 78,3 % de endpoints dentro de 25 ms, suficiente para subtítulos con resaltado karaoke.
- Reparación de transcripciones ASR: cuando la salida del ASR contiene sustituciones u omisiones, el modelo sigue alineando las palabras presentes y marca las ausentes, lo que permite reconstruir la sincronización sin re-transcribir.
- Preparación de corpus de voz: para datasets de entrenamiento TTS/ASR se necesitan fronteras exactas por palabra; el modelo las produce en 11 idiomas y tolera audio con ruido y reverberación.
- Doblaje y localización: la alineación palabra a palabra permite ajustar la duración de cada segmento doblado a la locución original, con resolución de 10 ms en modo Local Head.
- Timestamping de salidas ASR en producción: al mantener 150x RTFx en una RTX 5070 Ti, puede ejecutarse en pipelines de transcripción masiva sin convertirse en cuello de botella.
- Análisis de conversaciones con cambio de código: en entornos multilingües donde el hablante alterna idiomas dentro de una misma frase, el fine-tuning con code-switching mantiene la alineación.
- Investigación en fonética y prosodia: la resolución de 10 ms de la Local Head permite estudiar duraciones de palabra y pausas con granularidad suficiente para análisis cuantitativo.
- Verificación de calidad de subtítulos existentes: comparar los timestamps generados con los de un subtítulo ya publicado para detectar desincronizaciones.

## Benchmarks y rendimiento

Evaluación multilingüe con 6,5 h de audio, 105.022 endpoints de inicio/fin, nueve idiomas y fronteras anotadas o corregidas manualmente. `FIXED` indica que se aplicó una vez el post-procesado `fix_timestamp()` oficial de Qwen. MMS y WhisperX usan sus fronteras nativas.

Precisión de alineamiento (%):

| Modelo | t ≤ 10 ms | t ≤ 25 ms | t ≤ 50 ms | t ≤ 100 ms |
|---|---:|---:|---:|---:|
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 22,087 | 46,203 | 77,597 | 91,050 |
| Qwen3-ForcedAligner-Ultra, FIXED | 26,148 | 55,207 | 89,886 | 96,663 |
| Qwen3-ForcedAligner-Ultra + Local Head, FIXED | 47,113 | 78,315 | 91,821 | 96,768 |
| MMS-300M-1130 | 9,188 | 26,144 | 55,769 | 84,202 |

Error de frontera y cola catastrófica:

| Modelo | MAE (ms) | P90 | P95 | P97 | P99 | >240 ms | >500 ms | >1000 ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 124,949 | 90,688 | 185,122 | 347,882 | 2106,159 | 4,017 % | 2,379 % | 1,565 % |
| Qwen3-ForcedAligner-Ultra, FIXED | 34,947 | 50,425 | 75,684 | 110,000 | 260,908 | 1,113 % | 0,509 % | 0,195 % |
| Qwen3-ForcedAligner-Ultra + Local Head, FIXED | 26,590 | 43,335 | 71,108 | 105,958 | 261,325 | 1,122 % | 0,505 % | 0,195 % |
| MMS-300M-1130 | 98,179 | 132,240 | 207,041 | 315,325 | 1016,740 | 4,094 % | 1,912 % | 1,020 % |

Test externo con audio conversacional ruidoso (solo fronteras de inicio, evidencia de apoyo):

| Modelo | MAE (ms) | P90 (ms) | >500 ms | t ≤ 50 ms |
|---|---:|---:|---:|---:|
| Qwen3-ForcedAligner-0.6B oficial, FIXED | 89,66 | 105,20 | 4,10 % | 75,25 % |
| Qwen3-ForcedAligner-Ultra, FIXED | 60,94 | 81,40 | 2,12 % | 76,10 % |
| Qwen3-ForcedAligner-Ultra + Local Head, FIXED | 58,63 | 81,88 | 1,98 % | 82,32 % |
| MMS-300M-1130 | 373,86 | 321,38 | 8,49 % | 59,69 % |

Velocidad end-to-end (RTFx) en NVIDIA GeForce RTX 5070 Ti:

| Modelo | RTFx |
|---|---:|
| Qwen3-ForcedAligner-0.6B oficial | 150x |
| Qwen3-ForcedAligner-Ultra | 150x |
| Qwen3-ForcedAligner-Ultra + Local Head | 95x |
| MMS-300M-1130 | 180x |
| WhisperX English align model | 67x |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; con 917,7 M de parámetros en safetensors, la inferencia en fp16 requiere aproximadamente 1,8 GB de pesos más activaciones y buffers de audio, por lo que se estima un rango de 3-6 GB en función de la longitud del audio y del batch (estimación, no dato publicado).
- GPU recomendadas: RTX 5070 Ti es la GPU de referencia de los benchmarks; por tamaño, cualquier GPU consumer con 8 GB o más debería poder ejecutar el modelo en fp16.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint (1,8 GB en safetensors) y por los resultados publicados en una RTX 5070 Ti.
- Opciones de despliegue: transformers con la API `qwen-asr` (modo base drop-in); compatible con endpoints de Hugging Face (`endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: 150x RTFx en modo base y 95x RTFx con Local Head en RTX 5070 Ti; el coste de la Local Head es aproximadamente un 37 % de reducción de throughput a cambio de bajar el MAE de 34,95 ms a 26,59 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE (ms) | t ≤ 25 ms | >1000 ms | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Qwen3-ForcedAligner-Ultra + Local Head | 917,7 M | no disponible | 26,59 | 78,32 % | 0,195 % | Apache 2.0 | Hugging Face |
| Qwen3-ForcedAligner-0.6B oficial | ~0,6 B | no disponible | 124,95 | 46,20 % | 1,565 % | Apache 2.0 (según modelo base) | Hugging Face |
| MMS-300M-1130 | 300 M | no disponible | 98,18 | 26,14 % | 1,020 % | no disponible | Hugging Face / torchaudio |
| WhisperX English align model | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta sesgos específicos por idioma, acento o género; el rendimiento puede degradarse en dominios acústicos alejados del mixto de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar fronteras incorrectas cuando la transcripción no coincide con el audio; el modo base puede producir errores de más de 1000 ms en el 0,195 % de los endpoints.
- Cobertura desigual por idioma: chino, inglés, francés, alemán, italiano, japonés, coreano, ruso y español recibieron el grueso del fine-tuning y la evaluación; cantonés y portugués conservan solo el soporte heredado de Qwen y deben validarse en el dominio objetivo.
- Dependencia de la transcripción: requiere audio y transcripción; no transcribe por sí mismo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base `Qwen/Qwen3-ForcedAligner-0.6B` y de los datos de entrenamiento antes de un despliegue en producción.
- Resolución nativa de 80 ms en el modelo principal: para fronteras por debajo de esa rejilla es necesario usar la Local Head, que añade coste computacional (95x RTFx frente a 150x).
- Sin datos publicados sobre cuantización, contexto máximo ni integraciones con motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita las garantías para despliegues a gran escala.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fengjay01/Qwen3-ForcedAligner-Ultra
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Banner del modelo: https://huggingface.co/17slever17/Qwen3-ForcedAligner-Ultra/resolve/main/assets/qwen3-forced-aligner-ultra-banner.png
