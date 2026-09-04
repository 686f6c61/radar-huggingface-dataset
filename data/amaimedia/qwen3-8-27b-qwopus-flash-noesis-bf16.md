# AMAImedia/Qwen3.8-27B-Qwopus-Flash-NOESIS-BF16

## Resumen

El modelo `Qwen3.8-27B-Qwopus-Flash-NOESIS-BF16` es un repack estandarizado del modelo `Jackrong/Qwopus3.8-27B-Flash`, publicado por AMAImedia como componente de la plataforma NOESIS Professional Multilingual Dubbing Automation, que usa el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). Se presenta como una versión optimizada para inferencia flash, con arquitectura Qwen3.5 y atención lineal híbrida.

El modelo tiene aproximadamente 27 000 millones de parámetros (26 895 998 464 según los pesos safetensors), una longitud de contexto de 262 144 tokens y está pensado para tareas multimodal imagen-texto a texto, ya que incorpora un encoder visual de 1,7 GB y una cabeza de predicción multi-token (MTP) de 810 MB. El repack estandariza los pesos en 40 shards de unos 1,3 GB cada uno y en precisión BF16, lo que facilita la carga en servidores de inferencia.

Su relevancia radica en la combinación de atención lineal híbrida, predicción multi-token y soporte de más de 120 idiomas, orientado a aplicaciones profesionales de traducción y doblaje multilingüe. Al ser un repack, no introduce modificaciones en los pesos del modelo original, pero mejora la manejabilidad y el despliegue en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5ForConditionalGeneration) con atencion lineal hibrida |
| Parametros totales | 26 895 998 464 (aprox. 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | BF16 (bfloat16) |
| Idiomas soportados | Multilingue: en, ru, zh, vi, kk, ja, af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, jv, ka, kam, kea, km, kmr, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, wo, xh, yo, yue, zu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (40 shards de texto + 1 encoder de vision + 1 cabeza MTP) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 implementada mediante `Qwen3_5ForConditionalGeneration`, con 64 capas y atención lineal híbrida, una variante que combina capas de atención completa con capas de atención lineal para reducir el coste computacional y la memoria de la cache KV, lo que favorece la inferencia de baja latencia. Además, incorpora una cabeza de predicción multi-token (MTP) que permite generar varios tokens por paso, acelerando la decodificación.

El repack incluye un encoder visual separado en `model-extra-00001-of-00001.safetensors` de 1,7 GB, lo que habilita la entrada multimodal (imagen y texto). Los pesos del modelo de lenguaje se distribuyen en 40 shards de aproximadamente 1,3 GB, y la cabeza MTP se almacena en un archivo adicional de 810 MB.

No se dispone de información sobre los datos de entrenamiento, la composición del dataset ni procesos de alineación como RLHF o DPO. El repack de AMAImedia no modifica los pesos originales; únicamente los reorganiza y normaliza a BF16. El modelo base fue desarrollado por Jackrong, y AMAImedia actúa como redistribuidor.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto para producir respuestas en formato de texto.
- Contexto largo de 262 144 tokens, adecuado para conversaciones extensas o análisis de documentos largos.
- Predicción multi-token (MTP): permite generar varios tokens por paso de decodificación.
- Atención lineal híbrida optimizada para inferencia flash, con menor coste de memoria en la cache KV.
- Vocabulario conversacional y soporte de diálogo multi-turno.
- Cobertura de más de 120 idiomas, incluyendo lenguas de Asia, Europa, África y otras regiones.

No consta en la documentación soporte de tool calling, agentes o razonamiento multi-paso explícito.

## Casos de uso

- Doblaje multilingüe automatizado: el modelo actúa como núcleo de la plataforma NOESIS para generar diálogos doblados en decenas de idiomas a partir de guiones o transcripciones, aprovechando su capacidad de procesar contexto visual y su amplia cobertura lingüistica.
- Subtitulación de vídeo: al aceptar imágenes o frames de vídeo, puede transcribir y traducir automáticamente los diálogos, generando subtítulos en tiempo real para contenido audiovisual.
- Asistentes conversacionales multilingües: un chatbot de atención al cliente puede alternar entre idiomas dentro de una misma conversación gracias a su soporte de contextos largos y su vocabulario multilingue.
- Descripcion de contenido visual: permite describir imágenes, capturas de pantalla o fotogramas de vídeo, lo que resulta util para catalogacion de contenido, accesibilidad y analisis de medios.
- Localizacion de contenido cultural: adapta dialogos, referencias y expresiones a multiples idiomas para series, peliculas o videojuegos, manteniendo coherencia contextual en ventanas largas.
- Investigacion en arquitecturas de atencion hibrida: sirve como modelo de referencia para experimentar con atencion lineal hibrida y MTP en tareas multimodal, gracias a su estructura abierta y licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en BF16 ocupan aproximadamente 56,4 GB en disco (incluidos encoder visual y cabeza MTP). Para inferencia, se recomienda una GPU con al menos 80 GB de VRAM, como una A100 80 GB o H100 80 GB, para alojar los pesos y la cache KV con contexto completo.
- No cabe en GPUs de consumo con 24 GB de VRAM en BF16 sin técnicas de offloading o cuantizacion adicional, que no estan disponibles en este repositorio.
- Opciones de despliegue: el autor proporciona un comando de ejemplo con SGLang, usando `--tp-size 1` y `--context-length 262144`. Por ser compatible con `transformers`, podria desplegarse con otros servidores como vLLM o TGI, aunque no se documenta oficialmente.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la documentacion para establecer una comparativa completa. El modelo es un repack de `Jackrong/Qwopus3.8-27B-Flash`, por lo que sus especificaciones coinciden con las del modelo original. Existe una version oficial de Qwen en `Qwen/Qwen3.8-27B`, pero no se han encontrado datos publicos de especificaciones ni benchmarks en los resultados de busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwopus3.8-27B-Flash-NOESIS-BF16 | ~27B | 262 144 | Apache-2.0 | HuggingFace |
| Jackrong/Qwopus3.8-27B-Flash | ~27B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Es un repack, no un modelo original; las capacidades y la calidad dependen del modelo base de Jackrong.
- No se han publicado benchmarks, por lo que el rendimiento en tareas especificas no esta verificado.
- La cobertura de idiomas es amplia, pero la calidad de generacion puede variar significativamente entre lenguas.
- No se documentan procesos de alineacion (RLHF/DPO), lo que puede implicar respuestas no deseadas o sutiles sesgos.
- Riesgo de alucinacion inherente, especialmente en tareas de razonamiento multimodal complejo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de atribucion del modelo original.
- No se especifican medidas de seguridad, filtros de contenido ni restricciones de uso para contextos sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/Qwen3.8-27B-Qwopus-Flash-NOESIS-BF16
- Modelo original: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Referencia oficial de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Otro repack de AMAImedia: https://huggingface.co/AMAImedia/Qwen3.8-27B-Uncensored-NOESIS-BF16
