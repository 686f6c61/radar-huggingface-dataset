# mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF es una cuantizacion GGUF de tipo imatrix del modelo OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion, un merge de arquitectura Mixture of Experts (MoE) derivado de la familia Qwen3.5-MoE. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, y pone a disposicion del ecosistema local un modelo de 35.505.251.456 parametros totales en formatos que van desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K).

El modelo esta etiquetado con los casos de uso de codigo, agentes y razonamiento, y la model card indica que se trata de un modelo de vision, con ficheros mmproj (si existen) alojados en el repositorio estatico hermano. La relevancia actual reside en la posibilidad de ejecutar un MoE de ~35B parametros totales con un subconjunto activo reducido (la nomenclatura A3B sugiere aproximadamente 3B parametros activos) en hardware de consumo o en una sola GPU profesional, manteniendo capacidades de razonamiento y agenticas.

La licencia es Apache 2.0, lo que facilita el uso comercial, aunque el modelo solo declara soporte para ingles. Esta ficha describe la cuantizacion GGUF; los detalles de entrenamiento del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada de Qwen3.5-MoE; etiquetada como merge |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de arquitectura MoE etiquetado como qwen3_5_moe, lo que implica un transformer con capas de mezcla de expertos dispersas: cada token activa solo una fraccion de los parametros totales, de ahi la relacion entre los 35,5B totales y el sufijo A3B. El autor del merge es OliviaRossi; no se documentan en la informacion disponible los detalles del proceso de fusion (metodo de merge, capas afectadas, pesos relativos) ni los datos de entrenamiento, numero de tokens, composicion del dataset o si hubo RLHF/DPO.

La aportacion de esta ficha concreta es la cuantizacion: mradermacher genera cuantizaciones i1 (importancia-based) usando un fichero imatrix propio, que segun la model card mejora la calidad frente a cuantizaciones estaticas de tamano equivalente. La model card incluye la recomendacion de preferir variantes IQ sobre K del mismo tamano (por ejemplo, IQ3_S frente a Q3_K_S) y califica i1-Q4_K_M como "fast, recommended" y i1-Q4_K_S como "optimal size/speed/quality". Se indica tambien que el modelo es de vision, con ficheros mmproj en el repositorio estatico.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, segun las etiquetas reasoning y conversational del modelo.
- Generacion y asistencia en codigo, etiquetado explicitamente como code.
- Capacidades agenticas: la etiqueta agent indica soporte previsto para flujos de agente y tool calling, aunque no se documenta el formato exacto de llamada a funciones.
- Capacidades de vision: la model card afirma que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Soporte multilingue limitado al ingles segun el campo language.
- Ejecucion local mediante llama.cpp y derivados al distribuirse en GGUF.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion i1-Q4_K_M (21,8 GB) el modelo cabe en una GPU de 24 GB y puede usarse como autocompletado y generacion de codigo en editores, sin enviar codigo propietario a la nube.
- Agente de automatizacion de tareas: la etiqueta agent y el razonamiento multi-paso permiten encadenar llamadas a herramientas en pipelines internos, ejecutando el modelo en una estacion de trabajo con una RTX 4090.
- Procesamiento de documentos con vision: al ser un modelo de vision, puede extraer informacion de capturas, diagramas o documentos escaneados usando los ficheros mmproj del repositorio estatico.
- Prototipado de razonamiento sobre hardware de consumo: la variante i1-IQ3_M (15,9 GB) permite probar un MoE de 35B en GPUs de 16-24 GB, util para evaluar viabilidad antes de desplegar en servidor.
- Despliegue en servidor con llama.cpp: la cuantizacion i1-Q6_K (29,3 GB) ofrece calidad cercana al modelo original para servicios internos en una A100 de 40 GB o una H100.
- Generacion de cuantizaciones propias: el fichero imatrix incluido (0,5 GB) permite a un equipo generar sus propias cuantizaciones con llama.cpp adaptadas a su dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~13,3 GB; i1-IQ3_M ~15,9 GB; i1-Q4_K_S ~20,5 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB. Anadir margen para cache KV segun contexto.
- GPU consumer: las variantes hasta i1-Q4_K_M caben en una RTX 4090 (24 GB); las variantes IQ3 caben en GPUs de 16 GB con margen ajustado.
- GPU profesional: A100 40 GB o H100 80 GB para las variantes Q5/Q6 con contexto amplio.
- Despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); la model card no menciona vLLM ni TGI para esta cuantizacion.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B parametros activos (segun nomenclatura), el throughput deberia ser superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion (esta ficha) | 35,5B totales, ~3B activos (no confirmado) | no disponible | Apache 2.0 | GGUF i1 | Merge MoE con vision y agentes, solo ingles |
| Qwen3-30B-A3B | 30,5B totales, 3,3B activos | 32K nativo (ampliable) | Apache 2.0 | safetensors, GGUF | Referencia de la familia MoE Qwen; multilingue |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | MoE denso en activacion, mas VRAM necesaria |
| Qwen2.5-Coder-32B | 32,5B densos | 128K | Apache 2.0 | safetensors, GGUF | Denso, sin vision; referencia en codigo |

Los datos de Qwen3-30B-A3B, Mixtral y Qwen2.5-Coder corresponden a conocimiento general de esos modelos; no se dispone de comparaciones de rendimiento directas con KAT-Ornith-HERO en la informacion proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado y puede degradarse.
- Es un merge de autor independiente (OliviaRossi) sin documentacion publica de entrenamiento, evaluacion ni procedencia de los datos; el riesgo de comportamiento impredecible es mayor que en un modelo oficial.
- No hay benchmarks publicados: no se puede verificar la calidad frente a los modelos base de los que deriva.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones.
- La cuantizacion a Q2/Q3 puede degradar notablemente el razonamiento y la generacion de codigo; se recomienda Q4_K_M o superior para produccion.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los modelos fusionados antes de un uso comercial.
- El soporte de vision depende de ficheros mmproj alojados en el repositorio estatico; verificar su disponibilidad antes de asumir multimodalidad.
- El repositorio ocupa 279,4 GB por incluir todas las variantes; la descarga selectiva de un unico fichero es imprescindible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
