# mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF es una cuantizacion GGUF del merge Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic, publicado por mradermacher. El modelo subyacente es un merge por SLERP (interpolacion esferica lineal) de dos variantes derivadas de la familia Qwen3.5, afinadas con trazas de razonamiento atribuidas a Claude Opus y DeepSeek. El resultado es un modelo denso de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) con etiquetas declaradas de razonamiento, codigo, agentes, tool use, matematicas y STEM.

La relevancia de esta publicacion es practica: mradermacher distribuye cuantizaciones con imatrix (pesos ponderados) que permiten ejecutar un modelo de 9B en hardware de consumo, desde tarjetas de 8 GB hasta estaciones con 24 GB o mas. El repositorio incluye una matriz de importancia propia (imatrix) para generar cuantizaciones personalizadas y varias variantes i1 precalculadas.

La model card es escasa en detalles tecnicos: no documenta la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks. La informacion disponible permite caracterizar el modelo por su linaje (Qwen3.5 + merges de trazas de Claude/DeepSeek), su licencia Apache 2.0 y sus formatos de cuantizacion, pero no validar empiricamente sus capacidades declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (merge SLERP de dos variantes); detalles de capas y atencion no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, IQ3_M, Q4_K_S y el resto de la matriz completa (IQ1_S a Q6_K, Q4_0, Q4_1, Q5_K_M, etc., segun la lista de quants del repositorio); tambien existen quants estaticos en el repositorio hermano |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo es un merge SLERP de dos checkpoints derivados de Qwen3.5, segun la nomenclatura del repositorio base (xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic). La tecnica SLERP interpola los pesos de dos modelos en el espacio de parametros, lo que en la practica combina capacidades de ambos sin un entrenamiento adicional completo. El sufijo "heretic" y las etiquetas "uncensored" y "decensored" indican que el merge incorpora una variante con alineamiento relajado, orientada a reducir rechazos en la generacion.

Los datasets declarados en la model card son Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. Se trata de trazas de razonamiento y de agente, lo que sugiere que las variantes fusionadas fueron afinadas para imitar cadenas de razonamiento y flujos de tool calling. No se documentan el numero de tokens de entrenamiento, la mezcla exacta del dataset ni si hubo RLHF o DPO. La model card tampoco describe innovaciones arquitectonicas propias: las capacidades provienen de la base Qwen3.5 y del proceso de merge.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, espanol, ruso y japones.
- Razonamiento explicito: las etiquetas y los datasets de trazas indican soporte de cadenas de razonamiento estilo "thinking".
- Generacion de codigo y tareas de STEM y matematicas, segun las etiquetas declaradas por el autor.
- Tool calling y function calling: el modelo esta etiquetado para uso de herramientas y se entreno con trazas de agente (hermes-agent-reasoning-traces).
- Flujos de agente y razonamiento multi-paso, derivados del entrenamiento con trazas de agente.
- Capacidad de vision: la model card indica explicitamente "This is a vision model" y remite a los ficheros mmproj del repositorio estatico; la disponibilidad concreta de mmproj no esta confirmada en este repositorio.
- Modo sin censura ("uncensored"/"decensored"): menor tendencia a rechazar peticiones, con las implicaciones de seguridad que ello conlleva.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones i1-Q4_K_S (5,6 GB) el modelo cabe en GPUs de consumo y puede integrarse en editores o terminales para autocompletado y explicacion de codigo, aprovechando su entrenamiento en trazas de razonamiento.
- Agentes con tool calling: al estar afinado con trazas de agente, puede orquestar llamadas a APIs y funciones en pipelines automatizados, con la ventaja de ejecutarse en infraestructura propia sin coste por token.
- Razonamiento matematico y STEM asistido: util para resolver problemas paso a paso en entornos educativos o de investigacion donde se requiere trazabilidad del razonamiento y no se quiere enviar datos a la nube.
- Procesamiento multilingue (en, zh, es, ru, ja): traduccion, resumen y atencion al cliente en cinco idiomas con un unico modelo desplegado localmente.
- Prototipado de investigacion sobre merges: el repositorio incluye la imatrix y varias cuantizaciones, lo que facilita experimentar con el impacto de la cuantizacion en tareas de razonamiento.
- Despliegue en entornos con restricciones de privacidad: al ser Apache 2.0 y ejecutable con llama.cpp/Ollama, permite procesar datos sensibles en máquinas locales sin dependencia de proveedores externos.
- Generacion de contenido sin filtros estrictos: para casos donde los rechazos del modelo base resultan limitantes, con la advertencia de que requiere revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~4,1 GB; i1-IQ3_M ~4,7 GB; i1-Q4_K_S ~5,6 GB; las variantes de mayor tamano (Q5_K_M, Q6_K) se acercan o superan los 7-8 GB. Hay que sumar overhead de contexto KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para un modelo de 9B, pero permiten mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, desde 6-8 GB con cuantizaciones bajas; para Q4_K_S se recomienda 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de VRAM suficiente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic (i1-GGUF) | 9,2B | no disponible | Apache 2.0 | GGUF | Merge SLERP con trazas de razonamiento; quants imatrix |
| Qwen3.5 base (familia) | ~9B (variante) | no disponible | Apache 2.0 (segun familia) | safetensors, GGUF | Modelo original sin merge; referencia de capacidades |
| Merge estatico del mismo modelo (mradermacher) | 9,2B | no disponible | Apache 2.0 | GGUF | Misma base sin imatrix; menor calidad en quants bajos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Model card muy incompleta: no documenta contexto, datos de entrenamiento ni evaluaciones, lo que impide validar las capacidades declaradas.
- Al ser un merge SLERP sin evaluacion publicada, el rendimiento real puede degradarse respecto a los modelos originales, especialmente en tareas de razonamiento largo.
- El caracter "uncensored"/"decensored" implica mayor riesgo de contenido inapropiado, sesgado o danino; requiere filtros y supervision en produccion.
- Riesgo de alucinacion inherente a los modelos de 9B, agravado por la falta de benchmarks que cuantifiquen su fiabilidad.
- La capacidad de vision depende de ficheros mmproj alojados en el repositorio estatico; su disponibilidad y calidad no estan confirmadas.
- Soporte multilingue declarado para cinco idiomas, pero sin evaluacion de calidad por idioma; el espanol figura entre ellos sin datos de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de trazas (Claude Opus, DeepSeek) puede plantear dudas sobre los terminos de los datasets originales; conviene revisar las licencias de Jackrong/* y lambda/*.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Quants estaticos: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
