# elvezjp/GLM-5.3-Flash-ELVEZ-KDA-Q8_0-gguf

## Resumen

GLM-5.3-Flash-ELVEZ-KDA-Q8_0-gguf es una cuantización GGUF del modelo zai-org/GLM-5.3-Flash (MIT, ~320.759 millones de parámetros) publicada por el usuario elvezjp. No es un modelo nuevo ni un ajuste fino: es el fichero GLM-5.3-Flash-Q4_K.gguf de antirez con una única modificación, la recuantización de los 136 tensores de proyección KDA (atención lineal) de BF16 a Q8_0. El resto de los 1.412 tensores del GGUF se mantiene intacto, incluidos los expertos enrutados en Q4_K y 321 tensores que siguen en BF16.

La motivación es puramente de rendimiento en decodificación: las proyecciones KDA son densas y se leen en cada token generado, por lo que su tamaño domina las lecturas de memoria durante el decode. Al pasar de 8,50 GiB a 4,52 GiB, el fichero reduce su tamaño total a 186.597.336.384 bytes (~173,8 GiB) y, en las mediciones del autor sobre un Mac Studio M3 Ultra de 512 GB con un fork interno del motor ds4, la velocidad de decode mejora entre un 10 % y un 13 % sin degradación medible de calidad dentro del ruido de las pruebas.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo MoE de más de 320.000 millones de parámetros en hardware Apple Silicon de gran memoria, con una mejora de latencia gratuita respecto al fichero Q4_K original. A cambio, la compatibilidad está verificada únicamente en ese entorno concreto (Metal, ds4, `--ctx 131072 --mtp`) y no en llama.cpp, CUDA o ROCm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal KDA y expertos enrutados (MoE); arquitectura GGUF declarada como `glm5-next`, 34 capas |
| Parámetros totales | 320.759.404.382 (~320,8 mil millones) |
| Parámetros activos | No disponible (el GGUF contiene expertos enrutados, pero no se publica el número de parámetros activos) |
| Longitud de contexto | 131.072 tokens (valor usado en las pruebas del autor con `--ctx 131072`; no se declara un máximo propio de este fichero) |
| Tipos de cuantización | Q4_K en los expertos enrutados y la mayoría de tensores; Q8_0 en las 136 proyecciones KDA (`kda_{q,k,v,output}`); BF16 en 321 tensores, incluidos `output.weight` y `token_embd.weight` |
| Idiomas soportados | No disponible en los metadatos; las evaluaciones publicadas cubren inglés (HumanEval) y japonés (QA de conocimiento y escritura larga) |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único de 186.597.336.384 bytes, ~173,8 GiB) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de pesos. El modelo subyacente, zai-org/GLM-5.3-Flash (revisión `84c6a6aa9497188e15a635ba793b0f95a79b1033`), es un transformer con atención lineal KDA y expertos enrutados, del que no se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. Lo que sí describe la model card es la intervención técnica concreta sobre el GGUF.

El fichero de partida, antirez/glm-5.3-flash-gguf (revisión `b2fa29d7a6b410db11221c904973967b80b760f5`), mantiene las proyecciones KDA en BF16 mientras el resto del modelo está cuantizado a Q4_K. Los 136 tensores `blk.N.kda_{q,k,v,output}.weight` (34 capas × 4) ocupan 8,50 GiB en BF16 y se leen en cada token decodificado, de modo que su huella domina las lecturas de memoria del decode. La herramienta `glm53-requant-bf16` (procedente del PR #964 de antirez/ds4, autor trueimage, abierto y no fusionado en el momento de la publicación) los recuantiza a Q8_0, dejándolos en 4,52 GiB. El PR aplica por defecto `--tensors kda,head`, que también convertiría `output.weight`; este fichero usa únicamente `kda`. La conversión tardó 52 segundos en el M3 Ultra.

Sobre el proceso, ELVEZ introduce un cambio respecto al PR: los datos de tensor se leen con `pread` y se escriben a través de un búfer fijo con la caché de fichero desactivada (`F_NOCACHE` en macOS), para evitar que la herramienta llene la caché de páginas cuando se ejecuta junto a un servidor de inferencia activo. La salida de la versión modificada resultó idéntica byte a byte a la del port original sobre GGUFs sintéticos. El autor advierte de que la copia de los tensores no convertidos es byte a byte por diseño, pero no se ha ejecutado una comparación byte a byte de esos tensores entre los dos ficheros de ~187 GB.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como `conversational` y `endpoints_compatible`).
- Razonamiento con modo de pensamiento activable: las pruebas de HumanEval se ejecutaron en modo chat con thinking on y un máximo de 16.384 tokens.
- Generación de código: 96,34 % en HumanEval sobre 164 problemas con el fichero recuantizado, frente al 95,12 % del Q4_K original.
- Predicción multi-token (MTP): el motor ds4 usado en las pruebas opera con `--mtp`, con una tasa de aceptación medida del 66,4 % y un tiempo de verificación de 48,4 ms por ciclo.
- Procesamiento de contexto largo: probado con prompts de aproximadamente 38.000 tokens a 131.072 tokens de ventana.
- Capacidades multilingües parcialmente evidenciadas: QA de conocimiento y escritura larga en japonés, además de código y evaluación en inglés. No hay una lista oficial de idiomas soportados.
- Entrada de imagen: existe un `GLM-5.3-Flash-Vision-Encoder.gguf` en el ecosistema del modelo base, pero el autor indica explícitamente que no lo ha probado con este fichero ni ha evaluado la calidad de comprensión de imágenes; solo ejecutó una prueba de regresión de lógica de sesión con entradas de imagen.
- Tool calling y uso agéntico: no disponible, no se documenta en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de escala ~320B en estaciones de trabajo Apple Silicon: es el escenario validado por el autor, con un Mac Studio M3 Ultra de 512 GB, backend Metal y el motor ds4. Aporta entre un 10 % y un 13 % más de velocidad de decode que el fichero Q4_K equivalente sin cambiar de hardware.
- Sustitución directa del GGUF Q4_K en despliegues ds4 ya existentes: al mantener los 1.412 tensores con los mismos nombres y las 50 claves de metadatos, el fichero es un reemplazo del original para quien ya tenga ese pipeline montado sobre Apple Silicon.
- Asistencia de programación con razonamiento: con un 96,34 % en HumanEval en modo thinking, es adecuado para revisión de código, generación de tests y resolución de problemas algorítmicos en flujos interactivos, siempre que la latencia de ~33-37 tok/s en decode resulte aceptable.
- Análisis de documentación técnica extensa: la ventana probada de 131.072 tokens permite cargar manuales, especificaciones o bases de código completas en una sola sesión sin fragmentar el contexto.
- Procesamiento de contenido en japonés: análisis de documentación, resumen y redacción asistida. Conviene tener en cuenta la regresión observada en QA de conocimiento (45/48 a 43/48 en el conjunto de 48 preguntas).
- Investigación en cuantización selectiva: el repositorio documenta con detalle la metodología (identificación de tensores densos leídos en cada token, conversión a Q8_0, medición de NLL y de tok/s), por lo que sirve como caso de estudio reproducible para quien diseñe esquemas de cuantización mixta en modelos MoE.
- Servidores de inferencia sensibles a la latencia por token: el uso de MTP con una tasa de aceptación del ~66 % reduce el tiempo de verificación por ciclo de 53,8 ms a 48,4 ms, lo que se traduce en más tokens por segundo en cargas de generación larga.
- Evaluación comparativa de calidad entre cuantizaciones: el repositorio publica NLL medio, coincidencia del primer token objetivo, HumanEval y juicios ciegos con dos modelos distintos, lo que permite reutilizar la batería de pruebas para comparar otras recuantizaciones.

## Benchmarks y rendimiento

Todas las comparaciones usan el fichero original `GLM-5.3-Flash-Q4_K.gguf` como línea base, en la misma máquina (Mac Studio M3 Ultra, 512 GB), con la misma build del motor, los mismos ajustes y temperatura 0, un modelo a la vez.

Velocidad de decode (MTP activado, 3 ejecuciones por medición):

| Prompt | Original Q4_K | Este fichero | Cambio |
|---|---:|---:|---:|
| Prompt corto en japonés (35 tokens, 300 generados) | 33,1 tok/s | 36,7 tok/s | +11 % |
| Prompt de ~6,3k tokens | 28,8 tok/s | 32,6 tok/s | +13 % |
| Prompt de ~38k tokens | 27,8 tok/s | 30,6 tok/s | +10 % |

Tiempo de verificación MTP por ciclo: 53,8 ms → 48,4 ms. Tasa de aceptación: 65,6 % → 66,4 %. La velocidad de prefill no cambió. Las tres ejecuciones del mismo modelo produjeron salidas idénticas.

Calidad:

| Prueba | Original Q4_K | Este fichero | Lectura del autor |
|---|---:|---:|---|
| Scorer oficial de continuación de ds4, 100 casos, ctx 4096 — NLL medio (menor es mejor) | 0,299974 | 0,299788 | sin diferencia |
| Misma prueba — primer token objetivo coincidente | 90/100 | 90/100 | ningún caso cambió |
| HumanEval, 164 problemas (chat, thinking on, máx. 16.384 tokens) | 95,12 % | 96,34 % | equivalente (±2 pt) |
| QA de conocimiento en japonés, 48 preguntas (thinking off) | 45/48 | 43/48 | −2 preguntas |
| Escritura larga en japonés, 6 prompts, juzgados por DeepSeek V4 Flash (thinking off), /20 | 20,0 | 19,5 | equivalente |
| Mismos 6 resultados, juzgados a ciegas por Claude Opus 5, /20 | 18,50 | 18,83 | equivalente |

La model card menciona además una batería de "ds4 regression tests", pero el texto proporcionado está truncado en ese punto.

## Requisitos de hardware

- Memoria necesaria: el fichero ocupa ~173,8 GiB. A eso hay que sumar la caché KV y el overhead del motor para la ventana configurada (`--ctx 131072` en las pruebas).
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o similar queda muy lejos de los ~174 GiB requeridos. Tampoco cabe en una única GPU profesional de 80 GB.
- Hardware validado: un único Mac Studio con M3 Ultra y 512 GB de memoria unificada, macOS 27, backend Metal. Es el único entorno probado por el autor.
- Otros entornos Apple Silicon: no probados. Las cifras de velocidad son específicas del M3 Ultra.
- CUDA y ROCm: no probados. Cualquier estimación de VRAM para A100/H100 sería teórica; con el tamaño del fichero harían falta al menos tres aceleradores de 80 GB para alojarlo íntegramente, pero esto no está verificado y la arquitectura `glm5-next` puede no estar soportada por los motores CUDA habituales.
- Paralelismo de tensores y streaming desde SSD: no probados.
- Opciones de despliegue: el fork interno de antirez/ds4 (Metal) es lo único verificado. `llama.cpp` y otros runtimes GGUF no están probados; Ollama y TGI no aparecen mencionados en la información disponible.
- Throughput medido: 36,7 tok/s con prompt corto, 32,6 tok/s con ~6,3k tokens de contexto y 30,6 tok/s con ~38k tokens, todo con MTP activado, temperatura 0 y tres ejecuciones por medición. El prefill no se benefició de la recuantización.

## Comparativa con modelos similares

Solo se dispone de datos comparativos frente al fichero del que deriva y frente al modelo base, ya que la información proporcionada no incluye otras alternativas de la misma categoría.

| Modelo | Parámetros | Formato / cuantización | Tamaño | Contexto probado | Decode (M3 Ultra) | HumanEval | Licencia |
|---|---|---|---|---|---|---|---|
| Este fichero (ELVEZ KDA Q8_0) | ~320,8 B | GGUF, Q4_K + KDA en Q8_0 + 321 tensores BF16 | 186.597.336.384 B | 131.072 | 36,7 / 32,6 / 30,6 tok/s | 96,34 % | MIT |
| antirez/glm-5.3-flash-gguf (Q4_K) | ~320,8 B | GGUF, Q4_K + KDA en BF16 | 190.875.526.464 B | 131.072 | 33,1 / 28,8 / 27,8 tok/s | 95,12 % | MIT |
| zai-org/GLM-5.3-Flash (base) | 320.759.404.382 | Safetensors (según metadatos de parámetros) | No disponible | No disponible | No disponible | No disponible | MIT |

Comparativa frente a modelos de otras familias: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad muy restringida: solo se ha probado con el fork interno de antirez/ds4 sobre Metal en un M3 Ultra. El ds4 upstream tal cual se publica, `llama.cpp` y cualquier otro runtime GGUF no están verificados. La arquitectura declarada es `glm5-next`, poco habitual en el ecosistema.
- Sin soporte verificado en CUDA ni ROCm, ni con paralelismo de tensores o streaming desde SSD.
- Entrada de imagen no validada con este fichero; existe un codificador de visión separado en el ecosistema del modelo base, pero el autor no lo ha probado ni ha evaluado la calidad de comprensión de imágenes.
- Regresión leve en QA de conocimiento en japonés: 45/48 → 43/48. El autor la enmarca dentro del ruido de las pruebas, pero es una pérdida de dos preguntas que conviene verificar en el dominio propio antes de desplegar.
- Diferencias de calidad global indistinguibles del ruido: la mejora de NLL es de 0,299974 a 0,299788 y ningún caso del scorer de 100 ejemplos cambió de resultado. La ventaja real del fichero es la velocidad, no la calidad.
- No se ha ejecutado una comparación byte a byte de los tensores no convertidos entre los dos ficheros de ~187 GB, por lo que la afirmación de que solo cambian los 136 tensores KDA se apoya en la inspección de tipos y en pruebas sobre GGUFs sintéticos, no en una verificación directa del artefacto publicado.
- Reproducibilidad limitada: la herramienta de recuantización proviene de un PR abierto y no fusionado, y el autor indica que portó una revisión anterior de ese commit a un fork interno de ds4 que no es público. El PR original por defecto usa `--tensors kda,head`, de modo que reproducir exactamente este fichero requiere pasar `--tensors kda`.
- Riesgo de alucinación, sesgos y comportamiento en dominios sensibles: no evaluados en la información disponible.
- Idiomas soportados: no declarados. Las evidencias se limitan a inglés y japonés en las pruebas publicadas.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de las cifras publicadas.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el modelo base también es MIT y conviene conservar la atribución correspondiente al autor original y al creador del GGUF intermedio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/elvezjp/GLM-5.3-Flash-ELVEZ-KDA-Q8_0-gguf
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF de origen (antirez): https://huggingface.co/antirez/glm-5.3-flash-gguf
- PR con la herramienta de requantización: https://github.com/antirez/ds4/pull/964
- Repositorio del motor ds4: https://github.com/antirez/ds4
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces pertinentes son los anteriores.
