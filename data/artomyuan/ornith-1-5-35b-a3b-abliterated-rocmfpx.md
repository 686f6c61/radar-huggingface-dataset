# ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFPX

## Resumen

Ornith-1.5-35B-A3B-abliterated-ROCmFPX es una cuantizacion GGUF publicada por el usuario ArtomYuan a partir de los pesos abliterated (sin comportamientos de rechazo) de huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez deriva del modelo ornith-ai/Ornith-1.5-35B-A3B. El modelo subyacente es un MoE de 35.505.251.456 parametros totales con aproximadamente 3.000 millones de parametros activos por token, 256 expertos y 40 capas transformer mas una capa MTP (multi-token prediction), con soporte declarado de hasta 256K tokens de contexto.

El valor del repositorio no esta en el modelo base, sino en el formato de cuantizacion: ROCmFPX es una familia propietaria del fork llama.cpp-rocm (tipos GGML 100-107 / FTYPE 100-119) que upstream llama.cpp no puede cargar. Se ofrecen siete variantes (Q4_0_ROCMFP4_FAST, FAST_COHERENT, STRIX, Q6_0_ROCMFPX, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX y Q8_0_ROCMFPX_AGENT) mas un mmproj BF16 de 0,84 GiB que habilita entrada de imagen mediante un vision tower clip + qwen3vl_merger.

Es relevante ahora por dos motivos: permite ejecutar un MoE de 35B con vision en hardware AMD de memoria unificada (los benchmarks publicados se midieron en un Strix Halo gfx1151, con todas las variantes cabiendo en una sola maquina de 128 GB), y porque la capa MTP incluida en los GGUF habilita decodificacion especulativa con `--spec-type draft-mtp`. El repositorio es, en la practica, un artefacto experimental de un solo autor (1 like, 1478 descargas), sujeto a un formato de cuantizacion no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (256 expertos, 40 capas transformer + 1 capa MTP) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta 256K tokens (segun la model card) |
| Tipos de cuantizacion | ROCmFP4 / ROCmFPx: Q4_0_ROCMFP4_FAST (4,27 bpw), FAST_COHERENT (4,30 bpw), STRIX (4,31 bpw), Q6_0_ROCMFPX (6,62 bpw), Q6_0_ROCMFPX_AGENT (7,46 bpw), Q8_0_ROCMFPX (8,27 bpw), Q8_0_ROCMFPX_AGENT (8,40 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (esta cuantizacion); modelo base ornith-ai/Ornith-1.5-35B-A3B y version abliterated: MIT; vision tower: Apache-2.0 |
| Formato de pesos | GGUF (ROCmFPX, tipos GGML 100-107 / FTYPE 100-119; requiere llama.cpp-rocm) |
| Vision | Si, multimodal, mediante mmproj BF16 (clip + qwen3vl_merger), 0,84 GiB |
| Tamano del repositorio | 251,2 GB (7 GGUF + mmproj + sha256.txt) |
| Fecha de creacion / actualizacion | 2026-08-26 / 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un mixture-of-experts de tipo transformer: 35,5B parametros totales repartidos en 256 expertos, de los que se activan aproximadamente 3B por token. La model card describe 40 capas transformer mas una capa MTP (multi-token prediction) que se conserva en los GGUF y que puede activarse en `llama-server` con `--spec-type draft-mtp` para decodificacion especulativa, es decir, para proponer varios tokens por paso y verificarlos con el modelo principal. La ventana de contexto soportada es de hasta 256K tokens.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otra alineacion. Lo unico verificable es la cadena de transformaciones aplicada a los pesos: partiendo de los pesos BF16 del modelo original (MIT), huihui-ai produjo una version abliterated (eliminacion de la direccion de rechazo en el espacio de activaciones, con licencia MIT) y ArtomYuan la recuantizo localmente con `llama-quantize` del fork llama.cpp-rocm a los formatos ROCmFP4/ROCmFPx. Las variantes AGENT aplican, segun el autor, refuerzos de routing en capas sensibles para atencion y FFN, orientados a tool calling.

La innovacion tecnica destacable es el propio formato ROCmFPX: tipos GGML 100-107 con variantes de una y dos escalas (las STRIX usan escala dual en las K/V de atencion, y las COHERENT emplean embeddings de tokens en Q6_K). Es un formato de autor unico, no soportado por upstream llama.cpp, lo que condiciona por completo el despliegue.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (idiomas concretos no documentados).
- Razonamiento y generacion de codigo, heredados del modelo base de 35B/3B activos; no hay evaluaciones de exactitud publicadas en este repositorio.
- Vision multimodal: acepta imagenes combinando el GGUF principal con `mmproj-Ornith-1.5-35B-A3B-abliterated_BF16.gguf`, que integra un vision tower clip y un merger qwen3vl_merger.
- Tool calling / function calling: las variantes `_AGENT` (Q6_0 y Q8_0) incluyen ajustes de routing orientados a llamadas a herramientas y uso agentico.
- Decodificacion especulativa mediante la cabeza MTP incluida en los GGUF (`--spec-type draft-mtp`).
- Servido con API compatible con OpenAI en `http://127.0.0.1:8080/v1` (tag `endpoints_compatible`), lo que permite integrarlo en clientes que ya hablan el protocolo de OpenAI.
- Modo sin censura (abliterated): el modelo no aplica los rechazos del modelo original, lo que habilita casos de uso que el modelo alineado bloquearia, pero elimina las salvaguardas de contenido.
- Contexto largo de hasta 256K tokens, sujeto a que la memoria disponible permita el KV cache correspondiente.

## Casos de uso

- Asistente de chat local con contexto largo: desplegado con `llama-server` en una estacion de trabajo AMD con memoria unificada, permite mantener conversaciones de decenas de miles de tokens (documentacion tecnica, expedientes) sin fragmentar el contexto, apoyandose en los 256K tokens declarados.
- Analisis de documentos tecnicos con imagenes: usando el mmproj, se pueden enviar diagramas de arquitectura, capturas de interfaces o esquemas de circuitos junto al texto de un manual para extraer explicaciones o resumir el conjunto.
- Agentes de automatizacion con tool calling: las variantes Q6_0_ROCMFPX_AGENT y Q8_0_ROCMFPX_AGENT estan pensadas para flujos de varios pasos con llamadas a funciones, por ejemplo orquestar consultas a APIs internas y sintetizar el resultado en un informe.
- Generacion y revision de codigo en local: al ejecutarse sobre una sola maquina sin enviar datos a terceros, encaja en entornos con requisitos de confidencialidad donde el codigo no puede salir de la red corporativa.
- Procesamiento por lotes de alto rendimiento: la variante Q4_0_ROCMFP4_FAST alcanza 1434,4 t/s de prefill a 256 tokens y 1547,4 t/s a 2048 tokens en Strix Halo, lo que la hace adecuada para clasificacion, etiquetado o resumen de grandes volumenes de texto.
- Investigacion sobre decodificacion especulativa: la cabeza MTP integrada permite medir el impacto de `--spec-type draft-mtp` en latencia de decodificacion sobre un MoE real, con siete puntos de comparacion de bits por peso ya construidos.
- Estudio de seguridad y robustez: al ser una version abliterated, es un artefacto util para investigar como varia el comportamiento de rechazo entre pesos alineados y desalineados, siempre dentro de un marco controlado y con las advertencias de la seccion final.
- Despliegue en hardware de memoria unificada: todas las variantes caben en una sola maquina de 128 GB, lo que permite servir el modelo completo (incluida la variante Q8_0 de 34,2 GiB) sin repartir pesos entre varias GPU.

## Benchmarks y rendimiento

Los unicos datos publicados en el repositorio son mediciones de throughput con `llama-bench`, no evaluaciones de exactitud. Condiciones declaradas: AMD Strix Halo (gfx1151), `llama-bench -ngl 99 -p 256,2048 -n 256 -r 5`, build 11107 de llama.cpp-rocm; cada cifra es la media de las ultimas 4 de 5 repeticiones (la primera se excluye por coste de calentamiento).

| Variante | tg256 (t/s) | pp256 (t/s) | pp2048 (t/s) | Tamano | bpw |
|:--|--:|--:|--:|--:|--:|
| Q4_0_ROCMFP4_FAST | 72,7 | 1434,4 | 1547,4 | 17,7 GiB | 4,27 |
| Q4_0_ROCMFP4_FAST_COHERENT | 72,6 | 1238,9 | 1539,4 | 17,8 GiB | 4,30 |
| Q4_0_ROCMFP4_STRIX | 71,9 | 1409,9 | 1526,6 | 17,8 GiB | 4,31 |
| Q6_0_ROCMFPX | 55,2 | 803,5 | 943,9 | 27,4 GiB | 6,62 |
| Q6_0_ROCMFPX_AGENT | 51,5 | 946,3 | 1102,3 | 30,9 GiB | 7,46 |
| Q8_0_ROCMFPX | 48,2 | 1144,4 | 1367,7 | 34,2 GiB | 8,27 |
| Q8_0_ROCMFPX_AGENT | 47,9 | 1109,3 | 1372,1 | 34,7 GiB | 8,40 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ni comparaciones con modelos de la misma categoria.

## Requisitos de hardware

- VRAM/RAM para los pesos: 17,65-17,81 GiB en la familia Q4, 27,39 GiB en Q6_0, 30,86 GiB en Q6_0_AGENT, 34,17 GiB en Q8_0 y 34,74 GiB en Q8_0_AGENT; hay que sumar 0,84 GiB si se activa la vision.
- KV cache: no disponible. No se documenta el consumo por token de contexto, por lo que el limite practico de contexto en cada configuracion debe medirse.
- Cabe en GPU de consumo: las variantes Q4 (17,7-17,8 GiB) son las unicas con opciones realistas en tarjetas de 24 GB (RTX 3090, RTX 4090), y solo con contexto moderado por el KV cache. Las variantes Q6 y Q8 exigen 27-35 GiB y quedan fuera de cualquier GPU de consumo de 24 GB.
- Hardware de referencia del autor: AMD Strix Halo (gfx1151) con memoria unificada; todas las variantes, incluida la mayor de 34,7 GiB, caben en una sola maquina de 128 GB.
- GPU de datacenter: no se han publicado mediciones en A100, H100, MI300 ni similares en la informacion disponible; el formato esta optimizado para ROCm, no para CUDA.
- Opciones de despliegue: exclusivamente el fork llama.cpp-rocm (familia `llama-server` / `llama-bench` / `llama-quantize`). Upstream llama.cpp no puede cargar estos ficheros, y por extension tampoco lo haran Ollama, vLLM, TGI u otros runners que dependan de los tipos GGML estandar, salvo que se conviertan los pesos previamente.
- Throughput medido: de 47,9 a 72,7 t/s en generacion y de 803,5 a 1547,4 t/s en prefill, segun variante, en la configuracion Strix Halo indicada. Latencia por token no publicada.
- Aceleracion opcional: la cabeza MTP permite decodificacion especulativa (`--spec-type draft-mtp`), cuyo factor de mejora no se cuantifica en la model card.

## Comparativa con modelos similares

Con la informacion proporcionada solo es posible comparar dentro de la propia cadena de derivacion del modelo; no se aportan datos de modelos externos comparables.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|:--|:--|:--|:--|:--|:--|
| Ornith-1.5-35B-A3B-abliterated-ROCmFPX (este) | 35,5B totales / ~3B activos | hasta 256K | GGUF ROCmFPX (7 variantes + mmproj) | Apache-2.0 | HuggingFace, requiere llama.cpp-rocm |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated (origen) | 35,5B totales / ~3B activos | no disponible | BF16 (safetensors) | MIT | HuggingFace |
| ornith-ai/Ornith-1.5-35B-A3B (base original) | 35,5B totales / ~3B activos | no disponible | no disponible | MIT | HuggingFace |

Alternativas de terceros de la misma categoria (MoE de ~30-35B con ~3B activos): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido que incumpla politicas de seguridad. El propio autor declara que se usa bajo responsabilidad del usuario y sin garantia.
- Compatibilidad de formato: los GGUF usan tipos GGML 100-107 / FTYPE 100-119, soportados unicamente por el fork llama.cpp-rocm. Cargarlos con upstream llama.cpp falla; esto limita portabilidad, soporte a largo plazo y herramientas de terceros.
- Dependencia de un unico mantenedor: tanto el formato como el fork son mantenidos por ArtomYuan, sin el respaldo de un ecosistema amplio. El repositorio acumula 1 like y 1478 descargas, con un tamano de 251,2 GB.
- Ausencia de evaluaciones de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna metrica de exactitud, ni para el modelo base ni para las cuantizaciones. No es posible afirmar cuanto degradan los formatos ROCmFP4/ROCmFPx la calidad frente a BF16.
- Idiomas: no se documenta la lista de idiomas soportados; no se debe asumir un comportamiento multilingue equivalente al de los modelos MoE de referencia del sector.
- Riesgo de alucinacion: no cuantificado. Al no haber evaluaciones de fidelidad, en produccion conviene validar las salidas, especialmente en tool calling y en tareas de extraccion.
- Sesgos: no hay analisis de sesgos publicado en la informacion disponible; la abliteracion puede alterar el comportamiento del modelo de formas no documentadas mas alla de la supresion de rechazos.
- Rendimiento medido en una unica plataforma: todos los datos de `llama-bench` provienen de un AMD Strix Halo (gfx1151). No hay cifras para CUDA, ROCm en GPU discretas ni CPU, por lo que extrapolar el throughput es arriesgado.
- Seleccion de variante poco objetiva: la recomendacion de FAST_COHERENT y STRIX como mejor relacion calidad/velocidad es del autor y no esta respaldada por metricas de calidad publicadas.
- Uso comercial: la licencia declarada de esta cuantizacion es Apache-2.0 y la del modelo base y la version abliterated es MIT, lo que en principio permite uso comercial; conviene verificar los terminos del modelo original y del vision tower, y tener en cuenta que la responsabilidad sobre el contenido generado por una version sin censura recae en el desplegador.
- Memoria: las variantes Q6 y Q8 requieren entre 27 y 35 GiB solo para los pesos, lo que obliga a hardware de gama alta o memoria unificada; no se documenta el consumo del KV cache a 256K de contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArtomYuan/Ornith-1.5-35B-A3B-abliterated-ROCmFPX
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Fork de llama.cpp con soporte ROCmFP4/ROCmFPx: https://github.com/ArtomYuan/llama.cpp-rocm
- Checksums SHA-256 de los ficheros: `sha256.txt` en el repositorio de HuggingFace
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo; las busquedas devolvieron contenido no relacionado con el artefacto.
