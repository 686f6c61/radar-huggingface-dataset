# mradermacher/kam-qwen3.6-35b-semigod-GGUF

## Resumen

kam-qwen3.6-35b-semigod-GGUF es la version cuantizada en formato GGUF del modelo SuperTensora/kam-qwen3.6-35b-semigod, un modelo de lenguaje conversacional de aproximadamente 35.500 millones de parametros (35.505.251.456 segun los pesos en safetensors del repositorio base). La cuantizacion la publica mradermacher, un actor conocido en el ecosistema por generar versiones GGUF estaticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo original parece derivar de la familia Qwen 3.6, segun indica su nombre, aunque la model card no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion. El repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal, presumiblemente de vision, ademas de generacion de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 35B en hardware de consumo mediante cuantizaciones de 13 a 38 GB, si bien la informacion publicada es muy escasa: no hay benchmarks, no se declara licencia y la unica lengua indicada es el ingles. Cualquier evaluacion en produccion deberia hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de Qwen 3.6) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 244,4 GB con todas las variantes); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base SuperTensora/kam-qwen3.6-35b-semigod. El nombre sugiere una base Qwen 3.6 de 35B, pero la model card no confirma si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineacion.

La unica informacion tecnica concreta proviene del proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones con imatrix disponibles en el momento de la publicacion. La presencia de ficheros mmproj confirma que el modelo base tiene una torre multimodal, probablemente de vision, que se mantiene en precision Q8_0 o f16 mientras el resto de pesos se cuantiza.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Capacidad multimodal: los ficheros mmproj indican soporte de entrada de imagenes (vision), aunque no se detalla el alcance exacto.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Modo thinking o decodificacion especulativa: no disponible.

## Casos de uso

- Despliegue local de un modelo de 35B en estaciones de trabajo con GPU de consumo: con la cuantizacion Q4_K_M (21,8 GB) puede ejecutarse en una RTX 4090 de 24 GB, lo que permite experimentar con un modelo de gran tamano sin infraestructura de servidor.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversational y puede usarse para construir chatbots multi-turno en entornos de desarrollo antes de migrar a un modelo con licencia clara.
- Analisis de imagenes en local: los ficheros mmproj permiten cargar la torre multimodal junto con el modelo cuantizado en llama.cpp, habilitando tareas de descripcion de imagenes o extraccion de informacion visual sin enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantizacion del mismo modelo, lo que facilita estudiar el impacto de la precision en la calidad de salida para un modelo de 35B.
- Investigacion sobre degradacion por cuantizacion: util para medir perplejidad y calidad en rangos de Q2_K a Q8_0 en un modelo grande, con el grafico de comparacion de ikawrakow como referencia.
- Integracion en pipelines de inferencia con llama.cpp: al ser GGUF, puede servirse mediante llama-server o integrarse en aplicaciones que ya usan la API compatible con OpenAI de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~13,3 GB; Q3_K_S ~15,6 GB; Q3_K_M ~17,3 GB; Q3_K_L ~18,7 GB; IQ4_XS ~19,5 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_S ~24,7 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB.
- Para uso multimodal hay que sumar el fichero mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16).
- GPU de consumo: Q4_K_M cabe en una RTX 4090 (24 GB) con margen ajustado para contexto; Q3_K_M o IQ4_XS dejan mas espacio para la cache KV. En GPUs de 16 GB solo entran Q2_K y Q3_K_S con contexto reducido.
- GPU profesionales: A100 40/80 GB, H100 o L40S permiten cargar Q6_K y Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen de la GPU, del contexto y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kam-qwen3.6-35b-semigod-GGUF | 35,5B | no disponible | no disponible | GGUF | Multimodal (mmproj), solo ingles |
| Qwen2.5-32B-Instruct (referencia de familia) | 32,5B | 131.072 | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicados |
| Gemma 3 27B (referencia de tamano) | 27B | 128.000 | Gemma License | safetensors, GGUF | Multimodal, benchmarks publicados |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no puede establecerse una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Licencia no declarada: no puede confirmarse el uso comercial; es un riesgo juridico relevante para produccion.
- Solo ingles declarado: el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Modelo derivado de un fine-tune no documentado (semigod): el proceso de entrenamiento y los datos utilizados son desconocidos, lo que impide evaluar sesgos y riesgo de alucinacion.
- Riesgo de alucinacion inherente a modelos de este tamano sin datos de alineacion publicados.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo.
- Cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad en modelos de 35B; para produccion se recomienda Q4_K_M o superior.
- Los ficheros mmproj requieren una version de llama.cpp con soporte multimodal; la compatibilidad debe verificarse.
- El repositorio ocupa 244,4 GB; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kam-qwen3.6-35b-semigod-GGUF
- Modelo base: https://huggingface.co/SuperTensora/kam-qwen3.6-35b-semigod
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#kam-qwen3.6-35b-semigod-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
