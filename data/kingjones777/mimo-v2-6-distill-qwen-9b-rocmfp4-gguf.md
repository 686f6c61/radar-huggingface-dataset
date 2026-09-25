# kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF

## Resumen

Este repositorio contiene una cuantizacion comunitaria del modelo `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, publicada por el usuario kingjones777. No se trata de un modelo nuevo ni de un entrenamiento propio: es una conversion a formato GGUF y una cuantizacion a 4 bits mediante el esquema denominado ROCmFP4, especificamente optimizado para el silicio AMD Strix Halo (gfx1151, Radeon 8060S, Ryzen AI Max+ 395). El modelo subyacente es denso, con 8.953.803.264 parametros (aproximadamente 9B), y conserva la torre de vision exportada por separado como fichero `mmproj` en F16, por lo que mantiene capacidad multimodal de imagen y texto.

La relevancia de esta ficha es fundamentalmente practica: el autor publica dos niveles de cuantizacion (STRIX_LEAN y FAST) con mediciones reales de decodificacion, prefill y perplejidad sobre un equipo dedicado, ademas de documentar un hallazgo tecnico importante: este checkpoint no incluye cabezas MTP ni `nextn`, de modo que las tecnicas de decodificacion especulativa basadas en `draft-mtp`, `draft-dflash`, `draft-dspark` o `draft-eagle3` no tienen nada que acelerar. Tambien requiere un build no estandar de llama.cpp que soporte los tipos de tensor ggml 100-106.

El aspecto mas delicado para produccion es la dependencia de toolchain: llama.cpp estandar rechaza estos tipos de tensor, por lo que es necesario compilar el fork ROCmFPX con soporte HIP y Vulkan para gfx1151. La licencia es MIT, heredada del modelo base, y el repositorio tenia 0 descargas y 0 likes en el momento de la consulta, lo que lo situa como un artefacto reciente y sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalle de capas y atencion no disponible); incluye torre de vision multimodal y carece de cabezas MTP/nextn |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue de la model card usa `-c 32768` |
| Tipos de cuantizacion | Q4_0 ROCmFP4 en dos variantes: ftype 106 (STRIX_LEAN, cabeza de salida protegida con q6_K) y ftype 103 (FAST); BF16 como referencia de conversion; mmproj en F16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como base de conversion) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9B parametros con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto. En este repositorio no se ha entrenado nada: se ha ejecutado `convert_hf_to_gguf.py` sobre la revision `2367e865d009c13ac81713a2878291d33ab28177` del modelo de Xiaomi, generando un GGUF BF16 y, por separado, un `mmproj` F16 que contiene la torre de vision. La cuantizacion se realiza con `llama-quantize` aplicando los tipos de tensor propios del esquema ROCmFP4 (identificadores 100-106 en ggml). En la variante STRIX_LEAN se fuerza `--output-tensor-type q6_K` para proteger la cabeza de salida.

Un punto tecnico destacable, documentado con mediciones por el autor: el `config.json` del checkpoint declara `mtp_num_hidden_layers: 1`, pero el indice de pesos lista 760 tensores sin ninguna entrada `mtp` ni `nextn`, y un escaneo de cabeceras sobre los cuatro shards de safetensors no encuentra ninguna. En consecuencia, el modelo no dispone de cabezas entrenadas para decodificacion especulativa y las variantes ngram tampoco aportan ganancia medible en prompts no vistos (todas las celdas medidas quedan dentro de una banda del 4,4 % con un control de deriva del 0,19 %). El autor advierte explicitamente de que una medicion previa que mostraba 141 tok/s con `Vulkan0 + ngram-simple` era un artefacto del arnes de pruebas, que calentaba con el mismo prompt que luego medía.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `--jinja`.
- Procesamiento multimodal imagen-texto: la torre de vision se sirve como `mmproj` F16 y se carga junto al modelo con el flag `--mmproj`.
- Uso de herramientas y flujos agenticos: el repositorio esta etiquetado como `agentic` y `tool-use`, y el pipeline declarado es `image-text-to-text`.
- Razonamiento multi-paso en el contexto de tareas agenticas (segun las etiquetas del autor; no hay evaluaciones publicadas que lo cuantifiquen).
- Capacidades multilingues: no disponibles (no se especifica lista de idiomas).
- Modo de pensamiento explicito (`thinking mode`): no disponible.
- Audio: no disponible.
- Decodificacion especulativa: no soportada. El checkpoint no contiene cabezas MTP/nextn entrenadas, por lo que `draft-mtp`, `draft-dflash`, `draft-dspark` y `draft-eagle3` no funcionan.

## Casos de uso

- Asistente multimodal en local sobre hardware AMD Strix Halo: un equipo con Ryzen AI Max+ 395 y 128 GiB de memoria unificada puede ejecutar el modelo con vision activada usando los 5,25 GB de STRIX_LEAN mas 0,92 GB del `mmproj`, sin necesidad de GPU discreta ni de enviar datos a la nube.
- Descripcion y analisis de imagenes en flujos de documentacion tecnica: el modelo acepta imagen y texto, de modo que puede integrarse en un pipeline que reciba capturas de pantalla o diagramas y devuelva descripciones o resúmenes en texto.
- Agentes con uso de herramientas: al estar etiquetado como `tool-use` y `agentic`, puede conectarse a un servidor `llama-server` compatible con plantillas Jinja y utilizarse como motor de un agente que encadene llamadas a funciones.
- Prototipado y evaluacion de cuantizaciones en 4 bits: los dos niveles publicados (STRIX_LEAN y FAST) permiten medir el compromiso entre velocidad y calidad con datos reales de perplejidad sobre wikitext-2, util para decidir que variante desplegar.
- Servicio de inferencia local con `llama-server`: el ejemplo de la model card arranca el servidor con `-dev ROCm0 -ngl 999 -fa on -dio --jinja -c 32768`, adecuado para exponer el modelo a una aplicacion interna mediante API HTTP.
- Analisis de imagenes con requisitos de privacidad: al ejecutarse integramente en local, es apto para entornos donde las imagenes no pueden salir de la organizacion.
- Investigacion sobre rendimiento en gfx1151: la model card incluye comparativas medidas entre backend ROCm y Vulkan, utiles como referencia para quien optimice cargas de trabajo en Strix Halo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son mediciones del propio autor sobre los ficheros publicados, en un Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, 128 GiB unificados) dedicado y en reposo.

| Metrica | STRIX_LEAN (ftype 106) | FAST (ftype 103) | BF16 fuente (referencia) |
|---|---:|---:|---:|
| Tamano del fichero | 5.251.552.384 B | 4.771.353.728 B | 17.920.693.376 B |
| Decode (tok/s) | 40,97 | 43,46 | no medido |
| Prefill (tok/s) | 650,6 | 681,4 | no medido |
| Perplejidad wikitext-2 (40 chunks) | 8,2378 ±0,079 | 8,6603 ±0,084 | 8,4921 ±0,084 |

Comparativa de backend sobre el nivel FAST (generaciones de 256 tokens, mismos flags, calentamiento con prompt no relacionado, `cache_prompt:false`):

| Backend | `--spec-type` | Decode (tok/s) | Prefill (tok/s) |
|---|---|---:|---:|
| ROCm0 | none | 43,48 | 687,6 |
| ROCm0 | ngram-map-k | 43,48 | 688,4 |
| ROCm0 | ngram-simple | 43,23 | 689,6 |
| ROCm0 | ngram-mod | 43,42 | 682,6 |
| ROCm0 | ngram-cache | 42,19 | 681,3 |
| Vulkan0 | none | 42,14 | 509,9 |
| Vulkan0 | ngram-simple | 41,66 | 519,5 |
| Vulkan0 | ngram-cache | 41,69 | 509,4 |
| Vulkan0 | ngram-map-k | 41,59 | 517,0 |
| Vulkan0 | ngram-mod | 41,93 | 498,8 |
| Control de deriva (Vulkan0/none, repetido al final) | — | 42,06 | 497,1 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El propio autor advierte de que STRIX_LEAN puntua por debajo del BF16 de origen en esta muestra de 40 chunks, pero lo interpreta como ruido de cuantizacion favorable en una evaluacion estrecha (±0,08), no como una mejora real de 4 bits sobre 16.

## Requisitos de hardware

- VRAM estimada: los pesos de STRIX_LEAN ocupan 5,25 GB y los de FAST 4,77 GB; el `mmproj` F16 anade 918.166.048 B (aproximadamente 0,92 GB) si se usa vision. A esto hay que sumar la cache KV segun contexto y numero de secuencias concurrentes. Cifras derivadas de los tamanos de fichero, no medidas como consumo total.
- GPU medidas: Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 128 GiB de memoria unificada. Se requiere `HSA_OVERRIDE_GFX_VERSION=11.5.1` en el entorno de pruebas del autor.
- GPU recomendadas: exclusivamente hardware AMD con soporte del esquema ROCmFP4; la model card solo documenta y valida gfx1151 (Strix Halo, Ryzen AI Max). No hay datos para A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: por tamano de pesos (4,77-5,25 GB mas mmproj) cabria en GPU de consumo con 8 GB o mas de VRAM, pero la compatibilidad efectiva depende del soporte de los tipos de tensor ggml 100-106, limitado al build ROCmFPX en gfx1151.
- Opciones de despliegue: `llama-server` compilado desde el fork ROCmFPX (`github.com/charlie12345/ROCmFPX`, revision `85d8f7e83499e434c24993e6e1f3800568b5adfd`), con `-DGGML_HIP=ON -DGGML_VULKAN=ON -DGPU_TARGETS=gfx1151 -DGGML_HIP_GRAPHS=ON -DGGML_HIP_NO_VMM=ON -DLLAMA_CURL=OFF`. llama.cpp estandar rechaza estos tipos de tensor. No hay datos sobre vLLM, TGI, Ollama u otros motores.
- Flags de ejecucion recomendados: `-dev ROCm0 -ngl 999 -fa on -dio --jinja -c 32768`; el autor recomienda ROCm0 sin especulacion, ya que supera a Vulkan en un 3,2 % en decode y un 35 % en prefill.
- Latencia y throughput medidos: 40,97-43,46 tok/s de decode y 650,6-687,6 tok/s de prefill en el equipo de referencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa rigurosa contra otros modelos de la misma categoria. La comparacion disponible es interna al propio repositorio:

| Version | Parametros | Contexto | Decode (tok/s) | Prefill (tok/s) | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| STRIX_LEAN (Q4_0 ROCmFP4 ftype 106) | 8,95B | no disponible | 40,97 | 650,6 | 8,2378 ±0,079 | MIT | GGUF en este repositorio |
| FAST (Q4_0 ROCmFP4 ftype 103) | 8,95B | no disponible | 43,46 | 681,4 | 8,6603 ±0,084 | MIT | GGUF en este repositorio |
| BF16 de origen (referencia) | 8,95B | no disponible | no medido | no medido | 8,4921 ±0,084 | MIT | safetensors en el repositorio base |
| Variante con importance matrix | 8,95B | no disponible | no disponible | no disponible | no disponible | MIT | GGUF en repositorio separado |

## Limitaciones y advertencias

- Toolchain no estandar: llama.cpp de serie rechaza los tipos de tensor ROCmFP4 (ggml 100-106). Sin el build ROCmFPX, los ficheros no cargan.
- Ambito de hardware muy estrecho: las mediciones y la validacion se limitan a gfx1151 (Strix Halo, Ryzen AI Max+ 395 con Radeon 8060S). No hay evidencia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Cuantizacion comunitaria no oficial: el repositorio es de un tercero (kingjones777) y no procede del equipo de Xiaomi MiMo. En el momento de la consulta tenia 0 descargas y 0 likes, sin validacion independiente.
- Sin decodificacion especulativa: la ausencia de cabezas MTP/nextn implica que no se puede aplicar `draft-mtp`, `draft-dflash`, `draft-dspark` ni `draft-eagle3`. Las variantes ngram no aportan mejora medible en prompts no vistos.
- Perplejidad no concluyente: la diferencia entre STRIX_LEAN y FAST (0,42 puntos) es varias veces el margen de error declarado, pero la evaluacion se limita a 40 chunks de wikitext-2; no es una evaluacion amplia de calidad.
- Idiomas no especificados: no se declara la cobertura linguistica, lo que impide garantizar un comportamiento uniforme fuera del ingles.
- Longitud de contexto no declarada: el unico dato es el flag `-c 32768` del ejemplo, que es una configuracion de ejecucion, no una especificacion del modelo.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Licencia MIT heredada: permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base de Xiaomi antes de desplegarlo en produccion, asi como las condiciones del fork ROCmFPX.
- Fecha de creacion declarada (2026-09-24) y dependencia de revisiones concretas del modelo base y del binario, lo que exige fijar versiones para reproducibilidad.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Variante con importance matrix: https://huggingface.co/kingjones777/MiMo-V2.6-Distill-Qwen-9B-ROCmFP4-imatrix-GGUF
- Fork de llama.cpp con soporte ROCmFP4 (ROCmFPX): https://github.com/charlie12345/ROCmFPX (revision `85d8f7e83499e434c24993e6e1f3800568b5adfd`)
- La busqueda web asociada no devolvio ningun resultado relevante para este modelo; los enlaces obtenidos correspondian a contenidos no relacionados (Genially) y se han descartado.
