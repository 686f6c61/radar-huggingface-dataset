# Broadnet/KnowLine-35B-A3B-Gen1.5-W4A16-experts

## Resumen

KnowLine-35B-A3B-Gen1.5-W4A16-experts es una cuantizacion del modelo de decision KnowLine 35B-A3B Gen1.5 de PelaAI, publicada por BroadNet. El modelo original es un transformer de tipo MoE construido sobre Qwen3.5-35B-A3B, disenado especificamente para tareas de decision y clasificacion con etiquetas, no para generacion de texto abierta. Esta version cuantiza unicamente los expertos enrutados a int4 (W4A16) para reducir el peso en disco y hacerlo desplegable en una unica GPU de 24 GB.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantizacion selectiva: solo se cuantizan las proyecciones gate, up y down de los expertos enrutados, manteniendo en bf16 la atencion, las capas de atencion lineal, el experto compartido, el router, la vision, los embeddings, la cabeza de salida y la cabeza MTP. El resultado ocupa 24 GB en disco y 20,2 GiB en VRAM, con una perdida medida de 1,36 puntos en el Decision Index respecto al modelo bf16 (69,36 frente a 70,72).

El modelo esta pensado para servir decisiones etiquetadas a traves de un servidor propio (`knowline_server.py`) con backend vLLM, no como un modelo conversacional generico. Su licencia Apache-2.0 y su formato compressed-tensors lo hacen integrable en pipelines de produccion con vLLM 0.30.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con capas de atencion lineal y vision; cabezas de salida y MTP |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, pero no se confirma en la informacion) |
| Longitud de contexto | 16.384 tokens en la configuracion de servicio recomendada (33.512 tokens de KV cache a 16K en RTX 3090) |
| Tipos de cuantizacion | W4A16 int4 en expertos enrutados (group size 128, simetrico, RTN con busqueda de escala MSE de llm-compressor); resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); repo de 24,1 GB |

## Arquitectura y entrenamiento

El modelo base es KnowLine 35B-A3B Gen1.5 de PelaAI, construido sobre Qwen3.5-35B-A3B del equipo Qwen. Se trata de un transformer con mezcla de expertos (MoE) que incorpora capas de atencion lineal junto a atencion estandar, un experto compartido, router, torre de vision, embeddings, cabeza de salida y una cabeza MTP (multi-token prediction). El modelo original incluye una temperatura de lectura ("readout temperature") plegada en la normalizacion final, lo que implica que el servidor debe mantener temperature=1 para no distorsionar las probabilidades de etiqueta.

La cuantizacion de BroadNet aplica int4 exclusivamente a las proyecciones gate, up y down de los expertos enrutados, con group size 128, cuantizacion simetrica y round-to-nearest con busqueda de escala por error cuadratico medio (MSE) de llm-compressor, sin datos de calibracion. Todo lo demas permanece en bf16 tal como lo publico PelaAI. El repositorio incluye `recipe.yaml` con los ajustes exactos y `quantize_experts_rtn.py` para reconstruir los pesos desde la release original. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Toma de decisiones con etiquetas: el modelo emite probabilidades sobre un conjunto de etiquetas definido por el servidor, no texto libre.
- Clasificacion de textos con contexto de hasta 16K tokens en la configuracion recomendada.
- Soporte de vision en el modelo base (torre de vision en bf16), aunque la ruta de servicio descrita en la model card es solo texto (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Cabeza MTP (multi-token prediction) preservada en bf16.
- Servicio via API HTTP propia (`/v1/systemone`) con backend vLLM.
- Soporte de logprobs procesados (`--logprobs-mode processed_logprobs`, `--max-logprobs 256`) para leer probabilidades de etiqueta.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Modo thinking o razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Clasificacion de tickets de soporte: el servidor KnowLine recibe el texto del ticket y devuelve la distribucion de probabilidad sobre las etiquetas de categoria o prioridad definidas por el operador, con latencias de 204-421 ms por decision en RTX 3090.
- Moderacion de contenido a escala: con 3,3 a 12,8 decisiones por segundo segun longitud del texto y concurrencia (8 en vuelo), el modelo puede procesar colas de moderacion en una sola GPU de 24 GB.
- Enrutamiento de documentos en pipelines RAG: usar la salida de etiquetas para decidir a que indice o coleccion enviar cada documento, aprovechando el contexto de 16K para documentos largos.
- Triaje de correos o formularios: clasificacion multi-etiqueta de solicitudes entrantes en un flujo de atencion al cliente automatizada, con la ventaja de que el modelo devuelve probabilidades calibradas por la temperatura de lectura plegada.
- Deteccion de intencion en asistentes conversacionales: integrado como clasificador previo al LLM generativo para decidir la ruta de respuesta, reduciendo coste frente a un modelo generativo grande.
- Analisis de sentimiento o riesgo en textos financieros o legales: clasificacion de documentos de hasta 2.000 tokens con latencias medidas de 421 ms, adecuado para procesos batch nocturnos.
- Despliegue en hardware de gama alta de consumo: al caber en una RTX 3090 con 20,2 GiB de pesos y 33.512 tokens de KV cache, permite prototipar y servir en estaciones de trabajo sin GPU de datacenter.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Decision Index (muestra de 3.000 filas del set publico) | 69,36 |
| Decision Index bf16 (tablero 0.4.1, set publico) | 70,72 |
| Latencia mediana, texto ~265 tokens (1 en vuelo) | 204 ms |
| Latencia mediana, texto ~744 tokens (1 en vuelo) | 404 ms |
| Latencia mediana, texto ~2.000 tokens (1 en vuelo) | 421 ms |
| Throughput, texto ~265 tokens (8 en vuelo) | 12,8 decisiones/s |
| Throughput, texto ~744 tokens (8 en vuelo) | 5,8 decisiones/s |
| Throughput, texto ~2.000 tokens (8 en vuelo) | 3,3 decisiones/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 20,2 GiB de pesos en RTX 3090 con vLLM 0.30.0; el repo ocupa 24,1 GB en disco.
- GPU validadas: RTX 3090 (24 GB) con vLLM 0.30.0 y `--gpu-memory-utilization 0.95`; cabe en cualquier GPU con al menos 24 GB de VRAM.
- GPU de datacenter compatibles por VRAM: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX A6000 (48 GB).
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB); no cabe en GPUs de 16 GB o menos con la configuracion recomendada.
- Opciones de despliegue: vLLM (unico backend documentado; `knowline_vllm.py` sustituye al backend SGLang original). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Dependencias: `transformers==5.12.1`, `jinja2`, `requests`.
- KV cache: 33.512 tokens a contexto de 16K en RTX 3090 con la configuracion indicada.
- Throughput y latencia: ver tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| KnowLine-35B-A3B-Gen1.5-W4A16-experts (esta ficha) | 35,95 B | 16K (config. recomendada) | int4 expertos + bf16 resto | Apache-2.0 | vLLM |
| PelaAI/KnowLine-35B-A3B-Gen1.5 (bf16) | 35,95 B | no disponible | bf16 | Apache-2.0 | SGLang (servidor original) |
| Qwen3.5-35B-A3B (modelo base de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (clasificadores de decision basados en MoE) no esta disponible en la informacion proporcionada. El unico punto de comparacion directo es el modelo bf16 original, que obtiene 70,72 en el Decision Index frente a 69,36 de esta version cuantizada, con la ventaja de esta ultima de caber en una GPU de 24 GB.

## Limitaciones y advertencias

- Perdida de precision: la cuantizacion int4 de los expertos enrutados reduce la puntuacion del Decision Index en 1,36 puntos (69,36 frente a 70,72 en bf16).
- Uso restringido a decision con etiquetas: no es un modelo generativo conversacional; requiere el servidor `knowline_server.py` y un conjunto de etiquetas predefinido.
- Temperatura fija: el servidor debe mantener temperature=1 porque la temperatura de lectura esta plegada en los pesos; alterarla distorsiona las probabilidades de etiqueta.
- Ruta de servicio solo texto: la configuracion recomendada desactiva imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`), aunque el modelo base tenga torre de vision.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano u otros idiomas sin evaluacion propia.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible; al ser un clasificador, el riesgo se traslada a etiquetas mal asignadas con alta confianza.
- Dependencia de version: requiere vLLM 0.30.0 o superior y `transformers==5.12.1`; otras versiones pueden no cargar el formato compressed-tensors pack-quantized.
- Sin datos de calibracion: la cuantizacion usa RTN con busqueda de escala MSE sin calibracion, lo que puede penalizar dominios alejados de la distribucion del set publico del Decision Index.
- Licencia Apache-2.0 permite uso comercial, pero los cambios de BroadNet (`knowline_vllm.py`, `quantize_experts_rtn.py`) se distribuyen bajo la misma licencia.
- Modelo de noviembre de 2026 con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Broadnet/KnowLine-35B-A3B-Gen1.5-W4A16-experts
- Modelo base: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Repositorio de llm-compressor (herramienta de cuantizacion): no disponible en la informacion proporcionada
- Documentacion de vLLM: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo o espacio de prueba: no disponible en la informacion proporcionada
