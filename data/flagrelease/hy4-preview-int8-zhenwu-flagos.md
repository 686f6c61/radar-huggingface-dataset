# FlagRelease/Hy4-preview-INT8-zhenwu-FlagOS

## Resumen

Hy4-preview-INT8-zhenwu-FlagOS es una distribucion cuantizada a INT8 del modelo Hy4 preview de Tencent Hunyuan, publicada por la comunidad FlagRelease dentro del ecosistema FlagOS. El modelo original es el flagship de nueva generacion de Hunyuan, publicado y liberado en abierto el 28 de agosto, y esta distribucion concreta ha sido adaptada, alineada en precision y validada para su despliegue sobre aceleradores AI no-NVIDIA (chips Zhenwu/PPU) mediante el stack FlagOS. El repositorio contiene pesos en formato safetensors con cuantizacion de 8 bits gestionada por compressed-tensors.

El dato mas relevante es la escala: 779.960.992.733 parametros totales segun los safetensors del repositorio, es decir, un modelo del orden de 780 mil millones de parametros. El repo ocupa 790,8 GB, coherente con pesos INT8 de esa magnitud. La licencia es Apache 2.0 y los idiomas declarados son chino (zh) e ingles (en). La ventana de contexto no esta declarada en la model card, aunque el script de servicio de referencia arranca vLLM con `--max-model-len 100000`, lo que sugiere soporte de al menos 100.000 tokens en esa configuracion.

Su relevancia es doble. Por un lado, ofrece acceso a un modelo frontera de ~780B en precision INT8 con licencia permisiva. Por otro, es una pieza de interoperabilidad: demuestra que el modelo puede ejecutarse sobre hardware alternativo con resultados de benchmark equivalentes al stack nativo de NVIDIA en las metricas publicadas, lo que reduce el coste de portabilidad y evita el lock-in de proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle de capas y atencion no disponible); tag de pipeline `hy_v4` |
| Parametros totales | 779.960.992.733 (~780B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no declarada en la model card; el script de referencia usa `--max-model-len 100000` |
| Tipos de cuantizacion | INT8 (8-bit) mediante compressed-tensors |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion INT8, compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original: no se especifica numero de capas, tipo de atencion (completa, lineal o hibrida), ni si emplea mezcla de expertos. El unico indicio estructural es el identificador de parser de razonamiento `hy_v4` que vLLM debe cargar (`--reasoning-parser hy_v4`), lo que confirma que el modelo expone un modo de razonamiento con formato de salida propio que el servidor debe parsear de forma explicita.

Tampoco se publican datos sobre el corpus de entrenamiento (numero de tokens, composicion,比例 de codigo o multilingue) ni sobre las etapas de alineacion (RLHF, DPO). Lo que si documenta esta distribucion es el proceso de adaptacion: FlagRelease aplica el stack FlagOS, compuesto por FlagScale y vllm-plugin-fl para el framework distribuido de inferencia, FlagGems como biblioteca de operadores en Triton con kernels agnosticos de backend, FlagCX como biblioteca de comunicacion y FlagTree como compilador unificado multi-chip. La cuantizacion INT8 se realiza con compressed-tensors y se valida mediante comparacion contra el stack nativo en benchmarks publicos, con el objetivo declarado de mantener la precision numerica tras la conversion.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Modo de razonamiento explicito, con parser dedicado (`hy_v4`) en el servidor vLLM; el modelo puede emitir trazas de pensamiento separadas de la respuesta final.
- Razonamiento cientifico y de nivel experto, evidenciado por el resultado en GPQA Diamond (90,91) publicado en la model card.
- Razonamiento multi-turno y sobre escenarios narrativos o de teoria de la mente, segun la metrica Musr_team (82,8 en el stack nativo, 84,8 en FlagOS).
- Servicio compatible con la API OpenAI (`/v1/chat/completions`), lo que habilita integracion directa con clientes existentes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente, aunque el modo de razonamiento y el contexto largo son prerequisites habituales.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede emplearse para resolver preguntas de nivel posgrado en fisica, quimica y biologia, dado su rendimiento en GPQA Diamond (90,91). Es adecuado para herramientas internas de investigacion donde se requiera justificar la respuesta con trazas de razonamiento auditables.
- Analisis de documentos tecnicos largos: con una ventana configurable de hasta 100.000 tokens en vLLM, permite procesar articulos, patentes o expedientes completos en una sola pasada sin troceado, manteniendo coherencia entre secciones.
- Evaluacion de escenarios y teoria de la mente: util en simulacion de dialogos, analisis de narrativas, moderacion contextual y generacion de casos de prueba conversacionales, apoyandose en el rendimiento en Musr_team.
- Despliegue sobre hardware no-NVIDIA: el caso de uso central de esta distribucion es ejecutar un modelo de ~780B en clústeres con aceleradores Zhenwu/PPU mediante el contenedor FlagOS y vLLM con tensor parallelism de 16, evitando depender de GPUs NVIDIA para inferencia a gran escala.
- Servicio de chat compatible con OpenAI: al exponer `/v1/chat/completions`, puede conectarse a frontends como AnythingLLM o a cualquier SDK compatible con la API de OpenAI, lo que simplifica la integracion en productos existentes sin reescribir clientes.
- Generacion y revision de codigo en pipelines internos: para equipos con infraestructura en chino e ingles, el modelo puede integrarse como servicio de completado y revision en CI/CD a traves de la API compatible; la model card no detalla benchmarks de codigo, por lo que la idoneidad debe validarse con evaluacion propia.
- Traduccion tecnica zh-en: los dos idiomas declarados cubren el par mas habitual en documentacion de ingenieria y normativa, con contexto largo para mantener terminologia consistente en documentos extensos.

## Benchmarks y rendimiento

| Metrica | Hy4-preview-Nvidia-Origin | Hy4-preview-Zhenwu-FlagOS |
|---|---|---|
| GPQA_Diamond | 90,91 | 90,91 |
| Musr_team | 82,8 | 84,8 |

Los dos unicos resultados publicados corresponden a la validacion de consistencia entre el stack nativo y el stack FlagOS. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 ocupan aproximadamente 780 GB (el repositorio pesa 790,8 GB), por lo que la inferencia requiere al menos ese volumen agregado mas overhead de cache KV. No cabe en ninguna GPU de consumo.
- Configuracion de referencia del autor: 16 aceleradores en tensor parallelism (`--tensor-parallel-size 16`) sobre chips Zhenwu/PPU, con `CUDA_VISIBLE_DEVICES` de 0 a 15, lo que implica del orden de 48-50 GB de pesos por dispositivo en el caso ideal.
- GPUs NVIDIA: no se documenta una configuracion validada en la model card para esta distribucion concreta. Por volumen de pesos, requeriria un nodo multi-GPU de alta capacidad (por ejemplo, 8x H100 80GB o superior) o varios nodos; no hay datos publicados de rendimiento en ese escenario.
- GPU de consumo (RTX 4090, 3090, etc.): no es viable. El modelo no cabe ni con cuantizaciones mas agresivas dentro de una sola GPU de 24 GB.
- Opciones de despliegue: vLLM 0.24.0 dentro del contenedor FlagOS (imagen `harbor.baai.ac.cn/flagrelease-public/hy4-preview-...-vllm0.24.0-...`), con `--trust-remote-code`, `--reasoning-parser hy_v4` y `--compilation-config '{"cudagraph_mode":"FULL_DECODE_ONLY"}'`. Descarga de pesos via ModelScope. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. La configuracion de referencia limita `--max-num-batched-tokens 2048` y fija `VLLM_EXECUTE_MODEL_TIMEOUT_SECONDS=1800`, lo que sugiere tiempos de arranque y captura de CUDA graphs prolongados en clúster.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La model card solo compara el modelo consigo mismo en dos stacks de ejecucion (NVIDIA nativo frente a FlagOS/Zhenwu), no frente a otros modelos. Cualquier comparacion con otros modelos frontera abiertos de escala similar requeriria datos de benchmarks que no se han publicado aqui.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-preview-INT8-zhenwu-FlagOS | ~780B | no declarada (script: 100k) | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar entrenado principalmente en zh y en, es previsible un sesgo cultural y linguistico hacia esos dos idiomas; no hay evaluaciones de sesgo publicadas.
- Riesgo de alucinacion: no cuantificado en la model card. Un modelo de razonamiento de esta escala puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios fuera de su distribucion de entrenamiento.
- Cobertura idiomatica limitada: solo zh e ingles declarados. El rendimiento en castellano no esta evaluado y no deberia asumirse.
- Precision tras cuantizacion: los benchmarks publicados solo cubren GPQA Diamond y Musr_team. No hay validacion de la degradacion INT8 en generacion libre, codigo o matematicas, por lo que conviene ejecutar una evaluacion propia antes de produccion.
- Dependencia de hardware especifico: la ruta de despliegue documentada asume chips Zhenwu/PPU y una imagen de contenedor concreta con vLLM 0.24.0. La portabilidad a otros backends no esta validada en esta ficha.
- Requisito de `--trust-remote-code`: implica ejecutar codigo del repositorio del modelo; debe revisarse en entornos con requisitos de seguridad estrictos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no exime del cumplimiento de las condiciones de los datos de entrenamiento originales, que no se detallan.
- Repositorio con muy poca traccion (53 descargas, 0 likes) y actualizado meses despues de su creacion: verificar integridad de los pesos y fijar revision concreta antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-preview-INT8-zhenwu-FlagOS
- ModelScope (descarga de pesos, referenciado en la model card): `modelscope download --model FlagRelease/Hy4-preview-INT8-zhenwu-FlagOS`
- Imagen de contenedor FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4-preview-pp001-gems0.0-tree0.6.2-cxnone-plugin0.0.0-vllm0.24.0-cp312-pt210-hggc130-x64-2.1.1-rbd225:202610171156`
- FlagGems (biblioteca de operadores en Triton): repositorio referenciado en la model card, URL exacta no disponible
- FlagTree (compilador unificado multi-chip): repositorio referenciado en la model card, URL exacta no disponible
- FlagScale y vllm-plugin-fl: repositorios referenciados en la model card, URL exacta no disponible
- AnythingLLM (cliente de integracion): https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
