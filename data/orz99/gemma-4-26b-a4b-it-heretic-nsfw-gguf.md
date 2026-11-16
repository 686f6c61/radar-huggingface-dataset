# orz99/gemma-4-26B-A4B-it-heretic-NSFW-GGUF

## Resumen

`orz99/gemma-4-26B-A4B-it-heretic-NSFW-GGUF` es una distribucion en formato GGUF de un modelo derivado de la familia Gemma 4, concretamente del checkpoint `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`. El autor de la ficha publica unicamente los pesos cuantizados; el trabajo de ajuste fino (abliteration/decensoring) corresponde al autor del modelo base, mientras que la conversion a GGUF sigue el flujo habitual de `mradermacher`, que aparece citado en la model card como responsable de la cuantizacion.

El modelo parte de una arquitectura Gemma 4 con 25.233.142.046 parametros totales (segun los safetensors del checkpoint base) y una nomenclatura `A4B` que indica un esquema de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token. El ajuste aplicado busca eliminar los filtros de rechazo y las capas de alineacion de seguridad del modelo instruct original, etiquetandose explicitamente como `heretic`, `uncensored`, `abliterated` y `nsfw`.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion de un derivado no oficial, sin benchmarks publicados, sin pipeline declarado y con cero descargas en el momento de la consulta. Resulta util para quien quiera ejecutar localmente el modelo base en hardware de consumo mediante llama.cpp u Ollama, pero debe tratarse con cautela por su naturaleza descensurada y por la falta de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma 4 con mezcla de expertos (nomenclatura `A4B`); detalles internos no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4.000 millones (inferido de la nomenclatura `A4B`; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF; el checkpoint base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 26B con esquema de mezcla de expertos y aproximadamente 4B de parametros activos, segun la nomenclatura `A4B`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO en el checkpoint original de Google. El prefijo `it` indica que se parte de una variante instruct.

El ajuste `heretic-NSFW` consiste en un proceso de abliteration y decensoring aplicado sobre el modelo instruct, orientado a eliminar los mecanismos de rechazo y las capas de alineacion de seguridad. La model card no documenta la metodologia exacta, el volumen de datos de ajuste ni las metricas de degradacion asociadas. La cuantizacion a GGUF se realizo con el flujo estandar de `mradermacher`, que incluye un fichero `mmproj` para el codificador multimodal, lo que sugiere que el modelo conserva capacidad de vision en el checkpoint base, aunque no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct de Gemma 4.
- Razonamiento y respuesta multi-turno, presumiblemente con la ventana de contexto del Gemma 4 original (no confirmada).
- Capacidad multimodal potencial: la presencia de ficheros `mmproj` indica soporte de entrada de imagenes, aunque no se documenta explicitamente.
- Comportamiento descensurado: el ajuste elimina los rechazos ante contenido sensible, incluido material NSFW.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un Gemma 4 abliterated frente al original, comparando tasas de rechazo, utilidad y degradacion en tareas estandar. Es adecuado porque expone explicitamente el efecto del decensoring sobre un checkpoint instruct conocido.
- Generacion creativa de ficcion para adultos: el ajuste NSFW permite redactar narrativa explicita sin los bloqueos del modelo original. Requiere revisar el contenido generado y cumplir la legislacion aplicable sobre material para adultos.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,6 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con el checkpoint en safetensors.
- Evaluacion de robustez de filtros: util para testear sistemas de moderacion y clasificadores de contenido, ya que genera respuestas que un modelo alineado rechazaria, permitiendo validar la cobertura de los filtros de salida.
- Prototipado de asistentes conversacionales sin restricciones tematicas: para entornos controlados donde se necesita explorar respuestas sin sesgo de rechazo, por ejemplo en simulacion de dialogos o generacion de personajes.
- Analisis de cuantizacion: la variedad de niveles disponibles (desde Q2_K de 10,7 GB hasta Q8_0 de 27,0 GB) permite medir la perdida de calidad por cuantizacion sobre un modelo MoE con 4B activos, comparando perplejidad y coherencia entre niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,7 GB (Q2_K) y 27,0 GB (Q8_0) solo para los pesos; anadir 0,9 GB (mmproj Q8_0) o 1,3 GB (mmproj f16) si se usa la entrada multimodal, mas el espacio para el contexto KV.
- Configuracion recomendada en consumo: Q4_K_M (16,9 GB) o Q5_K_M (19,2 GB) en una RTX 4090 (24 GB) o RTX 3090 (24 GB), dejando margen para contexto.
- GPUs profesionales: A100 40/80 GB y H100 permiten cargar Q8_0 (27,0 GB) con contexto amplio y mayor throughput.
- Cabe en GPU de consumo: si, desde Q2_K (10,7 GB) en una RTX 4070 Ti (12 GB) con contexto reducido hasta Q4_K_M en 24 GB. Las cuantizaciones Q6_K (22,7 GB) y Q8_0 (27,0 GB) no caben en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este tipo de checkpoint.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 4B activos, el throughput deberia ser notablemente superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| orz99/gemma-4-26B-A4B-it-heretic-NSFW-GGUF | 25,2B totales, ~4B activos | no disponible | GGUF | apache-2.0 | Derivado abliterated, solo ingles, sin benchmarks |
| yukiworks/gemma-4-26B-A4B-it-heretic-NSFW | 25,2B totales, ~4B activos | no disponible | safetensors | apache-2.0 | Modelo base del que se cuantiza esta ficha |
| Gemma 4 26B-A4B instruct original | 25,2B totales, ~4B activos | no disponible | safetensors | licencia Gemma 4 | Version alineada, con filtros de seguridad |
| mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF | 25,2B totales, ~4B activos | no disponible | GGUF | apache-2.0 | Cuantizaciones ponderadas/imatrix del mismo modelo base |

## Limitaciones y advertencias

- Modelo descensurado: el ajuste heretic elimina los rechazos de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino sin advertencia. No debe desplegarse en aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad; la abliteration suele degradar la coherencia y la adherencia a instrucciones respecto al modelo original.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada; no debe asumirse la del Gemma 4 original sin verificacion.
- Licencia: se declara apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google. Existe ambiguedad sobre los terminos aplicables al uso comercial; conviene revisar la licencia del checkpoint base antes de un despliegue productivo.
- Procedencia: el modelo base es un derivado no oficial de Gemma 4 publicado por un tercero (`yukiworks`), sin validacion independiente ni benchmarks. Cero descargas y cero likes en el momento de la consulta.
- Contenido para adultos: la etiqueta `not-for-all-audiences` obliga a restringir el acceso y a cumplir la normativa sobre mayoria de edad y material explicito.
- Uso multimodal: los ficheros `mmproj` estan presentes, pero no se documenta el soporte real de vision ni su calidad tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orz99/gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
