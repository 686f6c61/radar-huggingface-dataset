# sapidlabs/Mistral-Large-4-667B-A52B-REAP-NVFP4

## Resumen

Mistral-Large-4-667B-A52B-REAP-NVFP4 es una version podada por expertos del modelo Mistral Large 4 NVFP4 de Mistral AI, publicada por el usuario sapidlabs en HuggingFace. Se trata de un transformer de tipo Mixture of Experts (MoE) en el que cada una de las 71 capas MoE conserva 80 de sus 128 expertos enrutados (un 37,5 % podado), lo que reduce los parametros totales de 1.053B a 667B y el checkpoint de 610 GB a 393 GB, manteniendo los parametros activos en torno a 52B porque el router sigue seleccionando 4 expertos por token.

El modelo resuelve un problema practico de despliegue: la version completa en NVFP4 no cabe en hardware de gama alta de consumo o de pequeno formato, mientras que esta variante esta pensada para ejecutarse en cuatro cajas NVIDIA DGX Spark (4 x 128 GB). La poda se realizo con el metodo REAP (Lasby et al., arXiv:2510.13999), que puntua cada experto segun la media, sobre los tokens enrutados a el, del peso del router multiplicado por la norma L2 de la salida del experto.

Es relevante ahora porque demuestra que la poda selectiva de expertos en modelos MoE de gran escala permite reducir el peso del checkpoint un 35 % sin reentrenamiento ni recuantizacion, conservando la mayor parte de la capacidad funcional. No obstante, el autor no ha publicado benchmarks formales, por lo que su calidad real frente al modelo completo esta pendiente de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con encoder de vision y cabeza draft DSpark |
| Parametros totales | 667B (frente a 1.053B del modelo base) |
| Parametros activos | ~52B (4 expertos por token) |
| Longitud de contexto | 65.536 tokens (configuracion de servicio con vLLM) |
| Tipos de cuantizacion | NVFP4 (pesos y escalas copiados byte a byte, sin recuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Mistral Ecosystem Open-Weight License |
| Formato de pesos | NVFP4 (checkpoint de 393 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 71 capas MoE. Cada capa contiene 128 expertos enrutados, de los cuales el router selecciona 4 por token. Ademas de los expertos enrutados, el modelo conserva expertos compartidos, un encoder de vision y una cabeza draft DSpark (probablemente orientada a decodificacion especulativa). La poda afecta unicamente a los expertos enrutados: los expertos conservados se renumeran en su orden original y cada router (`layers.N.gate.weight`) mantiene las filas correspondientes. Los pesos y escalas NVFP4 se copian sin recuantizar ni hacer fine-tuning.

La seleccion de expertos se hizo con REAP sobre 1,41M tokens ejecutados a traves del modelo completo sin podar. El conjunto de calibracion se compuso de OpenCodeReasoning (30 % por caracteres, 108 documentos), SWE-agent-trajectories (25 %, 83 documentos), ultrachat_200k (20 %, 183 documentos), OpenR1-Math-220k (15 %, 63 documentos) y aya_dataset no ingles (10 %, 695 documentos), todo renderizado con la plantilla de chat del modelo y trazas de razonamiento en bloques `[THINK]`. Los expertos conservados acumulan el 84,5 % de la salida ponderada por router (peor capa: 76,4 %) y reciben el 66,5 % de las decisiones de enrutamiento. Un unico experto del modelo completo nunca fue enrutado.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con trazas explicitas en bloques `[THINK]`.
- Generacion de codigo: el autor verifico que escribe Python correcto.
- Razonamiento matematico basico: resuelve problemas aritmeticos cortos planteados en lenguaje natural.
- Tool calling / function calling: llamadas bien formadas a traves del parser `mistral` de vLLM.
- Capacidad de vision heredada del encoder del modelo base (sin modificar por la poda).
- Capacidades multilingues: el conjunto de calibracion incluye un 10 % de datos no ingleses de aya_dataset, pero no se detallan los idiomas soportados.
- Decodificacion especulativa mediante la cabeza draft DSpark del modelo base.

## Casos de uso

- Despliegue en hardware de pequeno formato: el modelo esta disenado para correr en cuatro DGX Spark (4 x 128 GB) con tensor parallel 2 y pipeline parallel 2, un escenario en el que la version completa de 610 GB no cabe.
- Asistencia de codigo en produccion: con 52B parametros activos y soporte de tool calling via el parser `mistral` de vLLM, puede integrarse en pipelines de generacion y revision de codigo, aunque el autor advierte de posible perdida de calidad frente al modelo completo.
- Agentes de resolucion de tareas de software: el conjunto de calibracion incluye trayectorias de SWE-agent, por lo que los expertos conservados estan sesgados hacia tareas de agente de codigo.
- Razonamiento matematico asistido: util para problemas aritmeticos y de varios pasos con trazas de razonamiento visibles en `[THINK]`.
- Conversacion multi-turno con contexto largo: la configuracion de vLLM permite hasta 65.536 tokens de contexto, adecuado para dialogos extensos o documentos largos.
- Prototipado e investigacion sobre poda de MoE: el repositorio incluye `prune_keep.json` y los scripts de calibracion en `reap/`, utiles para reproducir o extender el metodo.
- Inferencia por lotes en clústeres pequenos: con 8 peticiones concurrentes el autor midio 14,7 tokens/s agregados, suficiente para cargas moderadas no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ha ejecutado evaluaciones formales y que solo ha realizado comprobaciones puntuales (codigo Python correcto, problemas aritmeticos cortos, tool calls bien formadas y razonamiento coherente).

Las unicas metricas de rendimiento publicadas son de inferencia en cuatro DGX Spark con NCCL sobre TCP:

| Escenario | Throughput |
|---|---|
| 1 peticion | 5,7 tokens/s |
| 8 peticiones concurrentes | 14,7 tokens/s totales |
| 16 peticiones concurrentes | 20,3 tokens/s totales |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 393 GB en NVFP4. En la configuracion de referencia, la segunda etapa de pipeline aloja unos 95,6 GiB de pesos por Spark, dejando unos 297k tokens de cache KV con utilizacion de memoria de 0,86.
- GPU recomendadas: cuatro NVIDIA DGX Spark (4 x 128 GB) es el objetivo declarado. No se documenta soporte en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; requiere un despliegue multi-nodo.
- Opciones de despliegue: vLLM con la imagen `vllm/vllm-openai:mistral-large-4`, tensor parallel 2 y pipeline parallel 2, con `--kv-cache-dtype fp8_ds_mla`, `--tool-call-parser mistral`, `--reasoning-parser mistral` y `--max-model-len 65536`.
- Restriccion de particionado: las capas 39, 43, ... 71 reutilizan la cache KV de la capa 35, por lo que el limite de etapa de pipeline debe situarse en o antes de la capa 35; el autor usa `VLLM_PP_LAYER_PARTITION=35,37`.
- Latencia y throughput: ver tabla de benchmarks (5,7 tokens/s en una peticion, 20,3 tokens/s agregados con 16 concurrentes en el hardware de referencia).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Large-4-667B-A52B-REAP-NVFP4 | 667B | ~52B | 65.536 | Mistral Ecosystem Open-Weight License | HuggingFace (sapidlabs) |
| Mistral-Large-4-1T-A52B-NVFP4 (base) | 1.053B | ~52B | no disponible | Mistral Ecosystem Open-Weight License | HuggingFace (mistralai) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Calidad no validada: el autor no ha ejecutado benchmarks; se espera cierta perdida de calidad frente al modelo completo, especialmente en idiomas poco comunes y dominios poco cubiertos por el conjunto de calibracion.
- Sesgo de calibracion: el conjunto de calibracion esta dominado por codigo, trayectorias de agente, matemticas y chat (90 %), con solo un 10 % de datos no ingleses, por lo que los expertos conservados estan sesgados hacia esas tareas.
- Cobertura de expertos: los expertos conservados reciben el 66,5 % de las decisiones de enrutamiento y acumulan el 84,5 % de la salida ponderada; en la peor capa la cobertura baja al 76,4 %, lo que puede degradar tareas dependientes de expertos podados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas: no se detalla la lista de idiomas soportados; el sesgo hacia el ingles en la calibracion sugiere menor calidad en otras lenguas.
- Licencia: Mistral Ecosystem Open-Weight License, con obligacion de atribucion ("2026 - Mistral"); deben revisarse las restricciones de uso comercial en el texto completo de la licencia.
- Despliegue complejo: requiere cuatro nodos DGX Spark, particionado de pipeline especifico y la imagen de vLLM de Mistral; no es un modelo apto para entornos de una sola GPU.
- Repositorio con muy poca traccion: 9 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/sapidlabs/Mistral-Large-4-667B-A52B-REAP-NVFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4/blob/main/LICENSE
- Paper REAP: https://arxiv.org/abs/2510.13999
- Dataset OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset SWE-agent-trajectories: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
