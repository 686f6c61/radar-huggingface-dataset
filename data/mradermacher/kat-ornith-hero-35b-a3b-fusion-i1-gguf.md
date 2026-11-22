# mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por OliviaRossi y cuantizado por mradermacher en formato GGUF. Con 35.505.251.456 parámetros totales (35,5 mil millones) y una designación A3B que indica aproximadamente 3 mil millones de parámetros activos por token, el modelo se presenta como una fusión (merge) de modelos orientada a código, agentes y razonamiento. La etiqueta qwen3_5_moe sugiere que la arquitectura subyacente deriva de la familia Qwen 3.5 MoE.

El modelo base es OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion, y esta versión concreta es una cuantización i1 (imatrix) realizada con llama.cpp por mradermacher, que ofrece un abanico de cuantizaciones desde Q2_K hasta Q6_K. El repositorio ocupa 279,4 GB e incluye todos los ficheros GGUF generados, además del fichero imatrix para crear cuantizaciones propias.

Su relevancia radica en que permite ejecutar un modelo MoE de 35B con activación de ~3B en hardware de consumo mediante cuantización agresiva, manteniendo supuestamente capacidades de razonamiento, generación de código y uso como agente. La licencia Apache 2.0 facilita su adopción comercial, aunque la información técnica publicada por el autor es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiquetada como qwen3_5_moe |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | ~3 mil millones (designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo MoE con arquitectura derivada de Qwen 3.5 MoE (tag qwen3_5_moe), con 35,5 mil millones de parametros totales y aproximadamente 3 mil millones activos por token. El modelo es un merge de modelos (tag merge) orientado a codigo, agentes y razonamiento, aunque no se detalla la composicion exacta del merge ni los modelos fuente individuales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Esta version concreta es una cuantizacion i1 (imatrix) generada con llama.cpp por mradermacher, que aplica una matriz de importancia para mejorar la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento de multiples pasos (etiqueta reasoning).
- Generacion y asistencia en codigo (etiqueta code).
- Uso como agente y soporte de flujos con llamadas a herramientas (etiqueta agent), aunque no se detalla el formato exacto de tool calling.
- Capacidades de fusion de conocimiento derivadas del merge de modelos.
- Soporte multilingue limitado: la model card solo declara ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistencia de programacion en local: con cuantizaciones Q4_K_M (~21,8 GB) el modelo puede ejecutarse en una GPU de 24 GB o en configuracion CPU+GPU, ofreciendo autocompletado y generacion de codigo sin depender de la nube.
- Agentes autonomos de desarrollo: la etiqueta agent y el bajo numero de parametros activos (~3B) permiten iteraciones rapidas en bucles de razonamiento y llamadas a herramientas dentro de pipelines de CI/CD.
- Razonamiento sobre documentacion tecnica: el modelo puede emplearse para responder preguntas sobre bases de codigo o documentacion, aunque la longitud de contexto no esta documentada y debe verificarse antes de usarlo con entradas largas.
- Prototipado de chatbots en ingles: su licencia Apache 2.0 y su tamano contenido permiten desplegar asistentes conversacionales en infraestructura propia sin costes de licencia.
- Experimentacion en investigacion de merges: al ser una fusion de modelos, resulta util para estudiar el comportamiento de merges MoE y comparar cuantizaciones i1 frente a estaticas.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q3 y Q4 caben en GPUs de 16-24 GB, lo que facilita pruebas de concepto de agentes y generacion de codigo en entornos locales.
- Evaluacion de cuantizaciones: el repositorio incluye el fichero imatrix y multiples variantes, lo que permite medir el impacto de la cuantizacion en tareas de codigo y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos, sin contar KV cache): i1-Q2_K ~13,3 GB; i1-IQ3_S ~15,7 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; RTX 3090 (24 GB) para Q4; A100 40 GB o H100 para Q5/Q6 con contexto amplio; GPUs de 16 GB (RTX 4060 Ti, RTX 4080) para IQ3_S o Q3_K_S.
- Cabe en GPU de consumo: si, en modelos con 16-24 GB de VRAM usando cuantizaciones Q3-Q4; las variantes Q5/Q6 requieren 24-32 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de suficiente VRAM.
- Latencia y throughput: no disponibles; al ser MoE con ~3B activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion (este) | 35,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-30B-A3B | 30B | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 15,7B | ~2,4B | 128K | DeepSeek License | safetensors, GGUF |

La comparativa se basa en caracteristicas generales de modelos MoE de tamano similar; no se dispone de datos de rendimiento comparativos para este modelo concreto.

## Limitaciones y advertencias

- La model card solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Al ser un merge de modelos, puede heredar sesgos y comportamientos inconsistentes de los modelos fuente, no documentados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la falta de evaluaciones publicadas.
- Las cuantizaciones de baja precision (Q2, Q3) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos fuente del merge antes de un uso comercial.
- No hay informacion sobre tool calling estructurado ni sobre el formato de prompt recomendado.
- El repositorio es muy grande (279,4 GB); descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
