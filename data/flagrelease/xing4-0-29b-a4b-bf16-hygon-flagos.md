# FlagRelease/Xing4.0-29B-A4B-BF16-hygon-FlagOS

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd., presentado como la nueva generación de la familia Xingchen (sucesora de TeleChat1-3). El modelo está disenado especificamente para escenarios de agentes de IA: tareas de horizonte largo, planificacion multi-paso, invocacion de herramientas y cadenas de razonamiento complejas. Su propuesta de valor central es ofrecer capacidades de agente con un coste computacional reducido, ya que activa solo 4B parametros de un total de 29B.

La version publicada en este repositorio, `Xing4.0-29B-A4B-BF16-hygon-FlagOS`, es una adaptacion multi-chip producida por la comunidad FlagOS (FlagRelease) para hardware Hygon, empleando su stack de software unificado (FlagScale, FlagGems, FlagCX, FlagTree y vllm-plugin-fl). El modelo original fue entrenado integramente con potencia de computo y frameworks domesticos chinos, y se ha adaptado a nueve plataformas de aceleradores distintas.

Tecnicamente emplea una arquitectura mHC+MLA+MTP (Multi-head Latent Attention y Multi-Token Prediction), con soporte nativo de contexto de 256K tokens extensible a 512K, y licencia Apache 2.0. El repositorio ocupa 62,4 GB en safetensors con 31.215.031.088 parametros almacenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC + MLA + MTP (Multi-head Latent Attention, Multi-Token Prediction) |
| Parametros totales | 29B (31.215.031.088 segun safetensors) |
| Parametros activos | 4B |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | BF16 (esta version); W4A8 disponible para plataforma ARM |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con 29B parametros totales y 4B activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. Incorpora atencion de tipo MLA (Multi-head Latent Attention), orientada a comprimir el estado KV y hacer viable el contexto largo, y una cabeza de Multi-Token Prediction (MTP), que permite predecir varios tokens por paso y suele aprovecharse para decodificacion especulativa. El prefijo mHC no se detalla en la informacion disponible.

Segun la model card, se trata del primer modelo de decenas de miles de millones de parametros entrenado integramente con potencia de computo y frameworks domesticos chinos, construido sobre la serie TeleChat1-3. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La adaptacion de este repositorio se realizo con el stack FlagOS, que incluye el compilador unificado FlagTree, la libreria de operadores FlagGems en Triton y la libreria de comunicacion FlagCX, con validacion de precision frente al stack nativo de NVIDIA.

## Capacidades

- Generacion de texto y razonamiento complejo en chino e ingles.
- Razonamiento matematico y cientifico de nivel avanzado (evaluado en Math-500 y GPQA Diamond).
- Capacidades de agente: planificacion multi-paso, ejecucion de cadenas de razonamiento largas y tareas de horizonte largo.
- Invocacion de herramientas (tool calling / function calling) como capacidad de diseno principal.
- Manejo de contexto muy largo gracias a la ventana nativa de 256K tokens, extensible a 512K.
- Prediccion multi-token (MTP), aprovechable para acelerar la decodificacion.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Agentes autonomos de ingenieria: el modelo esta optimizado para tareas de ingenieria complejas y puede encadenar planificacion, invocacion de herramientas y verificacion de resultados en flujos de trabajo de varios pasos, aprovechando sus 4B parametros activos para mantener el coste por paso bajo.
- Automatizacion de atencion al cliente multi-turno: la ventana de 256K tokens permite mantener historiales de conversacion extensos y documentacion de soporte en el mismo contexto sin truncar.
- Analisis de repositorios y documentacion tecnica: con contexto largo puede procesar ficheros y manuales completos, y responder en chino e ingles, lo que encaja en equipos con documentacion bilingue.
- Pipelines de agentes con herramientas externas: su soporte de function calling permite integrarlo como planificador que decide que API, base de datos o script invocar en cada paso.
- Razonamiento matematico y verificación: util para asistentes de analisis cuantitativo o tutoria tecnica, dado su rendimiento declarado en Math-500 (84,80 en el stack NVIDIA original).
- Despliegue sobre hardware no NVIDIA: esta variante concreta esta pensada para aceleradores Hygon mediante el stack FlagOS y vLLM, lo que permite servir el modelo en infraestructura domestica china sin depender de CUDA.
- Investigacion en eficiencia MoE: su relacion 29B/4B y su soporte MTP lo hacen util como objeto de estudio para tecnicas de decodificacion especulativa y serving de bajo coste.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card corresponden al modelo original sobre stack NVIDIA; la variante Hygon-FlagOS figura como "Evaluating" en ambos casos.

| Metrica | Xing4.0-29B-A4B (NVIDIA original) | Xing4.0-29B-A4B (Hygon-FlagOS) |
|---|---|---|
| GPQA Diamond | 62,23 | En evaluacion |
| Math-500 | 84,80 | En evaluacion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de agente en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 62,4 GB, por lo que la inferencia en BF16 requiere al menos esa cantidad de memoria de acelerador, mas overhead de KV cache y activaciones.
- La receta oficial de despliegue usa `--tensor-parallel-size 4` sobre 4 aceleradores Hygon, con `--gpu-memory-utilization 0.9` y `--max-model-len 80000`, lo que sugiere un minimo practico de 4 dispositivos para esta configuracion.
- No cabe en GPUs de consumo individuales en BF16; seria necesario cuantizar (no se documentan GGUF ni AWQ para esta variante) o repartir entre varias GPU.
- Despliegue soportado: vLLM 0.24.0 con plugin `vllm-plugin-fl`, backend de atencion `TRITON_MLA`, imagen Docker `flagtree-hcu-py310-torch2.10.0-dtk26.04-ubuntu22.04:202608-3.6-vllm0.24.0-xingcgen4`, sobre Ubuntu 22.04 y Docker 27.3.1.
- Variables de entorno requeridas: `GEMS_VENDOR=hygon`, `VLLM_PLUGINS=fl`, `VLLM_FL_FLAGOS_BLACKLIST=cat,slice`, con timeouts de iteracion y ejecucion de 7200 s.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B / 4B | 256K (ext. 512K) | Apache 2.0 | MoE con MLA y MTP, entrenado en computo domestico chino |
| Qwen3-30B-A3B | 30B / 3B | 128K nativo | Apache 2.0 | MoE comparable en escala; datos de benchmark no disponibles en esta ficha |
| DeepSeek-V2-Lite | 16B / 2,4B | 32K | DeepSeek License | MoE con MLA, referencia arquitectonica directa |
| TeleChat1-3 (predecesor) | no disponible | no disponible | no disponible | Base sobre la que se construye Xing4.0 |

Los datos de los modelos alternativos no proceden de la informacion proporcionada y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Solo se declaran idiomas chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- No se han publicado resultados de la variante Hygon-FlagOS: la paridad de precision con el stack NVIDIA esta pendiente de validacion publica.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El modelo requiere `trust_remote_code` y `custom_code`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar en produccion.
- La receta de serving desactiva chunked prefill, prefix caching y usa `--enforce-eager`, lo que reduce el rendimiento frente a configuraciones optimizadas.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia alguna ni se detallan restricciones adicionales sobre datos de entrenamiento.
- El despliegue esta fuertemente acoplado al stack FlagOS y a hardware Hygon; portarlo a otras plataformas exige las variantes correspondientes publicadas por FlagRelease.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.0-29B-A4B-BF16-hygon-FlagOS
- FlagOS (stack de software): no disponible en la informacion proporcionada
- FlagGems (libreria de operadores en Triton): https://github.com/openai/triton (referencia citada en la model card)
- AnythingLLM (integracion de cliente): https://anythingllm.com/
- Paper, blog o demo oficiales: no disponible
