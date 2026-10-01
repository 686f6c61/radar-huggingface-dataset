# madrisight/madrimed1.2-VL-2B-GGUF

## Resumen

Madrimed1.2-VL-2B-GGUF es el conjunto de binarios cuantizados en formato GGUF del modelo MadriMed 1.2 (`madrisight/madrimed1.2-VL-2B`), un modelo vision-lenguaje compacto de 2.031.739.904 parámetros (unos 2,03 mil millones) orientado al dominio médico. Lo desarrolla el usuario `madrisight` y está publicado en HuggingFace con licencia Apache 2.0. El problema que resuelve es doble: por un lado, ofrecer un VLM médico de tamano reducido que pueda ejecutarse en local sin depender de APIs externas; por otro, proporcionar cuantizaciones listas para `llama.cpp`, `llama-server`, `llama-cpp-python` y Ollama, de modo que sea viable en hardware de consumo.

El modelo se apoya en la arquitectura Qwen3-VL, con un backbone de lenguaje de tipo decoder transformer autorregresivo de 28 capas y un proyector multimodal independiente (`qwen3vl_merger` / DeepStack patch merger) que procesa imagenes a 768 de resolucion. Los tags del repositorio lo asocian a tareas de radiologia y patologia, y a los conjuntos de datos VQA-RAD y SLAKE, aunque la model card no publica resultados numericos de evaluacion.

Su relevancia actual radica en el despliegue local: al ser un modelo de 2B con cuantizaciones que van desde F16 (4,06 GB) hasta Q2_K (833 MiB), permite ejecutar inferencia multimodal sobre imagenes medicas en una GPU de consumo o incluso en CPU, algo poco habitual en modelos vision-lenguaje de dominio clinico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline declarado es `image-text-to-text`, con soporte exclusivo de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL: decoder transformer autorregresivo de 28 capas + vision encoder con DeepStack patch merger (`qwen3vl_merger`) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de `llama-server` de la model card usa `-c 8192`, pero no se declara oficialmente) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero de modelo y fichero `mmproj` independiente |

Inventario completo de cuantizaciones publicadas en el repositorio:

| Fichero | Formato | Tamano | BPW | Uso recomendado |
|---|---|---|---|---|
| `mmproj-f16.gguf` | F16 | ~781 MiB | — | Proyector de vision de referencia |
| `mmproj-Q8_0.gguf` | Q8_0 | 421 MiB | — | Proyector recomendado (~46% menor que F16) |
| `medmax-2b-f16.gguf` | F16 | 4,06 GB | 16,0 | Referencia en media precision |
| `medmax-2b-Q8_0.gguf` | Q8_0 | 2,01 GB | 8,5 | Razonamiento clinico de alta precision |
| `medmax-2b-Q6_K.gguf` | Q6_K | 1,55 GB | 6,56 | Punto dulce recomendado |
| `medmax-2b-Q5_K_M.gguf` | Q5_K_M | 1,37 GB | 5,77 | Equilibrio calidad/RAM |
| `medmax-2b-Q5_K_S.gguf` | Q5_K_S | 1,31 GB | 5,66 | Variante 5-bit compacta |
| `medmax-2b-Q4_K_M.gguf` | Q4_K_M | 1,21 GB | 5,03 | Despliegue estandar |
| `medmax-2b-Q4_K_S.gguf` | Q4_K_S | 1,17 GB | 4,84 | Variante 4-bit menor |
| `medmax-2b-IQ4_XS.gguf` | IQ4_XS | 1,12 GB | 4,63 | Cuantizacion 4-bit con matriz de importancia |
| `medmax-2b-Q3_K_L.gguf` | Q3_K_L | 1,07 GB | 4,45 | Variante 3-bit grande |
| `medmax-2b-Q3_K_M.gguf` | Q3_K_M | 0,99 GB | 4,20 | Entornos de baja memoria |
| `medmax-2b-Q3_K_S.gguf` | Q3_K_S | 948 MiB | 3,92 | Entornos de baja memoria |
| `medmax-2b-Q2_K.gguf` | Q2_K | 833 MiB | 3,44 | Compresion extrema |

## Arquitectura y entrenamiento

La model card describe una arquitectura multimodal de dos ficheros obligatoria para la inferencia visual. El primero es el backbone de lenguaje (`medmax-2b-[quant].gguf`), un decoder transformer autorregresivo de 28 capas que se encarga de la generacion de texto clinico y del razonamiento. El segundo es el proyector multimodal (`mmproj-[quant].gguf`), que integra el codificador de vision y el fusionador de parches DeepStack (`qwen3vl_merger`) y procesa las imagenes a una resolucion de 768. El autor advierte de forma explicita que, para realizar inferencia visual, es imprescindible pasar tanto el fichero del modelo (`-m`) como el fichero `--mmproj`, ya que sin el segundo no hay percepcion de imagen.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Los unicos indicios sobre los datos de especializacion son los tags `vqa-rad` y `slake`, que apuntan a un ajuste fino sobre conjuntos de pregunta-respuesta visual de radiologia y de conocimiento medico general respectivamente. Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal. La unica particularidad operativa destacada por el autor es la recomendacion de fijar `--image-min-tokens 1024` en tareas de grounding clinico, con el argumento de que las arquitecturas Qwen-VL necesitan una asignacion suficiente de tokens para mantener la percepcion de alta resolucion sobre lesiones sutiles.

## Capacidades

- Generacion de texto clinico y razonamiento descriptivo sobre imagenes medicas (pipeline `image-text-to-text`).
- Interpretacion de imagenes de radiologia y patologia, segun los tags del repositorio.
- Respuesta a preguntas visuales (VQA) en el dominio medico, con ajuste declarado sobre VQA-RAD y SLAKE.
- Inferencia totalmente local, sin dependencia de APIs externas, mediante `llama.cpp`, `llama-server`, `llama-cpp-python` u Ollama.
- Exposicion como API compatible con OpenAI a traves de `llama-server` (endpoint `/v1`), lo que permite integrarla con el SDK oficial de OpenAI.
- Procesamiento de imagenes a 768 de resolucion mediante el proyector `mmproj`, con control del numero minimo de tokens de imagen.
- Conversacion multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles (`language: en`).
- Capacidades especiales: modo thinking, vision adicional, audio u otras: no disponible.

## Casos de uso

- Asistencia a radiologos en triaje: se puede enviar una radiografia de torax al servidor local y preguntar por hallazgos concretos, por ejemplo consolidacion o derrame, usando el SDK de OpenAI contra `llama-server`; el modelo devuelve una descripcion textual que el profesional revisa.
- Docencia y formacion medica: generacion de descripciones guiadas de casos de imagen para practicar lectura de placas, aprovechando que el modelo puede ejecutarse en un portatil con GPU de consumo.
- Preanotacion de datasets de patologia: uso del modelo para generar borradores de etiquetas o descripciones sobre lotes de imagenes antes de la revision humana, reduciendo el trabajo manual inicial.
- Prototipado de investigacion en VQA medica: evaluacion rapida de arquitecturas y prompts sobre VQA-RAD y SLAKE sin coste de API, ya que el repo incluye cuantizaciones desde Q2_K hasta F16 para comparar el impacto de la cuantizacion.
- Sistemas de ayuda al diagnostico en entornos con conectividad limitada: despliegue en un equipo local con Ollama o `llama-server`, sin enviar imagenes de pacientes a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad.
- Integracion en herramientas de historia clinica electronica: el endpoint compatible con OpenAI permite insertar el modelo como servicio interno de apoyo y mostrar sugerencias al facultativo dentro de la propia interfaz.
- Analisis por lotes en investigacion retrospectiva: procesamiento de cohortes de imagenes con `llama-cpp-python` sobre GPU unica, usando Q4_K_M o Q6_K para equilibrar velocidad y fidelidad.
- Demostraciones y entornos educativos offline: al caber en menos de 2 GB en Q4_K_M, permite desplegar una demo multimodal medica en un equipo sin GPU dedicada, aunque la latencia sera mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen cifras de MMLU, HumanEval, GSM8K, VQA-RAD, SLAKE ni de ninguna otra evaluacion, ni curvas de perplejidad por nivel de cuantizacion, pese a que el autor justifica varias de ellas cualitativamente (por ejemplo, Q6_K como "punto dulce" con minima degradacion de perplejidad).

## Requisitos de hardware

- VRAM estimada (solo pesos): F16 ~4,06 GB + `mmproj` F16 ~781 MiB; Q8_0 ~2,01 GB + `mmproj` Q8_0 421 MiB; Q6_K ~1,55 GB; Q4_K_M ~1,21 GB; Q2_K ~833 MiB. Hay que sumar cache KV y los tokens de imagen (el autor recomienda `--image-min-tokens 1024`), por lo que el consumo real supera el tamano de los pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones bajas; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para F16 y Q8_0 con margen amplio.
- Cabe en GPU de consumo: si, con holgura en cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0 en tarjetas de 8 GB o mas. Las variantes Q3 y Q2 permiten incluso entornos con 4 GB de VRAM.
- Opciones de despliegue: `llama-mtmd-cli` (CLI), `llama-server` (API compatible con OpenAI, puerto configurable, `-ngl 99` para descargar todas las capas en GPU), `llama-cpp-python` y Ollama.
- Latencia y throughput estimados: no disponible (el autor no publica mediciones de tokens por segundo).
- Nota de despliegue: es obligatorio cargar simultaneamente el fichero del modelo y el `mmproj`; sin el proyector la inferencia visual falla.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con la re-cuantizacion del mismo modelo base realizada por otro autor. No se dispone de datos numericos de modelos alternativos de la misma categoria dentro de la informacion disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `madrisight/madrimed1.2-VL-2B-GGUF` (este) | 2,03B | no disponible | GGUF (multimodal, requiere `mmproj`) | apache-2.0 | HuggingFace, 0 descargas |
| `mradermacher/MadriMed-VL-2B-GGUF` | mismo modelo base (MadriMed-VL-2B) | no disponible | GGUF | no disponible en la informacion | HuggingFace, 400+ descargas en 2 dias segun publicacion en LinkedIn |
| Otros VLM medicos de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivo para investigacion y educacion: el autor declara explicitamente que es un modelo experimental y que no esta certificado para la toma de decisiones diagnosticas clinicas autonomas.
- Toda interpretacion generada debe ser revisada y verificada de forma independiente por un profesional medico colegiado antes de usarse en cualquier flujo clinico.
- Idioma limitado al ingles (`language: en`); no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: al ser un modelo de 2B especializado, la probabilidad de descripciones plausibles pero incorrectas sobre hallazgos sutiles es elevada; no se publican metricas que permitan acotarla.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento ni los sesgos demograficos o de adquisicion de imagen que pudieran haberse heredado.
- Limitaciones de contexto: la longitud de contexto no se declara oficialmente; el ejemplo de `llama-server` usa 8192 tokens, valor que no debe asumirse como limite del modelo.
- Dependencia del proyector multimodal: omitir el fichero `--mmproj` desactiva por completo la capacidad visual, lo que puede dar lugar a respuestas de texto aparentemente validas pero sin fundamento en la imagen.
- Grounding en lesiones sutiles: el propio autor recomienda forzar `--image-min-tokens 1024` para tareas clinicas; con asignaciones menores la percepcion de alta resolucion puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero la limitacion de uso clinico declarada por el autor es una advertencia de responsabilidad, no una restriccion legal; conviene evaluar el marco regulatorio sanitario aplicable antes de cualquier despliegue en produccion.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni evidencia de uso en produccion en el momento de la consulta.
- No se publican datos de perplejidad por cuantizacion; las cualidades de Q6_K o Q4_K_M son afirmaciones del autor sin respaldo numerico en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/madrisight/madrimed1.2-VL-2B-GGUF
- Modelo base: https://huggingface.co/madrisight/madrimed1.2-VL-2B
- Cuantizacion alternativa de MadriMed-VL-2B por mradermacher: https://huggingface.co/mradermacher/MadriMed-VL-2B-GGUF
- Discusion en LinkedIn sobre la publicacion de la version GGUF: https://www.linkedin.com/posts/krrish-v_mradermachermadrimed-vl-2b-gguf-hugging-activity-7461812640214896640-FSa8
- Indice de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
- Ficha en free2aitools: https://free2aitools.com/dataset/mradermacher/madrimed-vl-2b-gguf
- Paper, blog o demo oficial del modelo: no disponible
