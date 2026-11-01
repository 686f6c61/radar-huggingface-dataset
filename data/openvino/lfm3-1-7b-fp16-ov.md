# OpenVINO/LFM3-1.7B-fp16-ov

## Resumen

LFM3-1.7B-fp16-ov es la conversion al formato OpenVINO Intermediate Representation (IR) del modelo LFM3-1.7B desarrollado por LiquidAI. Se trata de una version optimizada para inferencia en hardware Intel mediante el stack OpenVINO, manteniendo los pesos en precision fp16. El modelo original pertenece a la familia LFM3 de LiquidAI, orientada a generacion de texto conversacional con capacidad de razonamiento explicito (thinking mode) activada por defecto en su plantilla de chat.

Esta version concreta no introduce cambios en la arquitectura ni en los pesos del modelo base: es un artefacto de despliegue que traduce el grafo a IR de OpenVINO para aprovechar aceleracion en CPU, iGPU y NPU de Intel. Resulta relevante para equipos que necesitan ejecutar un modelo de 1.700 millones de parametros en entornos sin GPU dedicada NVIDIA, o que ya tienen infraestructura basada en OpenVINO Model Server (OVMS).

El repositorio ocupa 3,5 GB y se distribuye bajo la licencia LFM Open License v1.0, heredada del modelo original. La informacion publica disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es limitada en la model card de esta conversion, por lo que varios campos tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; requiere `trust_remote_code`) |
| Parametros totales | 1.700 millones (1.7B, segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (esta conversion); el modelo base admite otras segun su card original |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | OpenVINO IR (compatible con OpenVINO 2026.5.0+ y OpenVINO GenAI 2026.5.0+) |

## Arquitectura y entrenamiento

La model card de esta conversion no detalla la arquitectura interna del modelo base LFM3-1.7B. Lo que si se deduce del artefacto es que requiere `trust_remote_code=True` y esta etiquetado con `custom_code`, lo que indica que el modelo base incorpora codigo personalizado en su implementacion (habitual en las arquitecturas propietarias de LiquidAI). No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica destacable de esta version es el proceso de conversion a OpenVINO IR, que permite ejecutar el modelo con OpenVINO GenAI y con Optimum Intel (integracion pendiente de merge en `huggingface/optimum-intel#2087` en el momento de publicacion de la card). El modelo conserva el modo de razonamiento (thinking) del original: la plantilla de chat lo activa por defecto y puede desactivarse mediante `enable_thinking=False` o `chat_template_kwargs`.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat.
- Modo de razonamiento explicito (thinking mode) activado por defecto, desactivable por parametro.
- Razonamiento paso a paso antes de emitir la respuesta final cuando el thinking esta habilitado.
- Integracion con el ecosistema OpenVINO: Optimum Intel, OpenVINO GenAI y OpenVINO Model Server.
- Servicio compatible con la API de OpenAI a traves de OVMS (`/v3`), incluyendo streaming.
- Ejecucion en CPU, y potencialmente en otros dispositivos Intel compatibles con OpenVINO.
- Soporte de tool calling, function calling, vision, audio o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en servidores sin GPU NVIDIA: el formato OpenVINO IR permite ejecutar el modelo en CPU Intel con OpenVINO GenAI u OVMS, aprovechando las optimizaciones de bajo nivel del runtime para entornos donde no hay aceleradores dedicados.
- Servicio de chat compatible con OpenAI: mediante OVMS se expone un endpoint `/v3` que acepta el SDK oficial de OpenAI, lo que facilita integrar el modelo en aplicaciones existentes sin reescribir el cliente.
- Asistentes conversacionales con razonamiento visible: el thinking mode por defecto permite obtener trazas de razonamiento antes de la respuesta, util para depuracion de prompts y para aplicaciones que muestran el proceso al usuario.
- Prototipado y evaluacion en portatiles y equipos de desarrollo: con 1,7B de parametros en fp16 y un repo de 3,5 GB, el modelo es manejable en equipos de gama alta sin GPU dedicada mediante OpenVINO en CPU.
- Integracion en pipelines de Optimum Intel: equipos que ya usan `OVModelForCausalLM` pueden incorporar el modelo con el mismo patron de carga que otros modelos OpenVINO, simplificando la gestion de dependencias.
- Despliegue en contenedores Docker con OVMS: la card proporciona un comando `docker run` listo para servir el modelo con `--task text_generation`, adecuado para entornos containerizados y orquestados.
- Experimentacion con razonamiento en modelos pequenos: util para comparar el comportamiento del thinking mode frente a respuestas directas en un modelo de 1,7B, con coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 3,5 GB en fp16; la inferencia requiere al menos esa cantidad de memoria disponible en el dispositivo de destino, mas overhead del runtime.
- GPU recomendadas: no se especifican en la card; el modelo esta orientado a dispositivos Intel mediante OpenVINO (CPU, iGPU, NPU segun soporte del runtime).
- Cabe en consumer GPU: no disponible como dato explicito; por tamano (1,7B en fp16) seria viable en GPUs consumer con suficiente memoria, pero la card no lo confirma.
- Opciones de despliegue: Optimum Intel (`OVModelForCausalLM`), OpenVINO GenAI (`LLMPipeline`), OpenVINO Model Server (OVMS) con API compatible OpenAI, y binario OVMS en Windows.
- Versiones requeridas: OpenVINO 2026.5.0+ y OpenVINO GenAI 2026.5.0+ (nightly builds en el momento de publicacion), `transformers==5.20.0`, y Optimum Intel con el PR #2087 aplicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVINO/LFM3-1.7B-fp16-ov | 1,7B | no disponible | OpenVINO IR (fp16) | LFM Open License v1.0 | HuggingFace, 42 descargas |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | safetensors (original) | LFM Open License v1.0 | HuggingFace |
| Otros modelos OpenVINO de ~1-2B | no disponible | no disponible | OpenVINO IR | variable | HuggingFace (organizacion OpenVINO) |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion proporcionada; los campos de rendimiento y contexto del modelo base no estan disponibles en la card de esta conversion.

## Limitaciones y advertencias

- La model card remite explicitamente a la card del modelo original para limitaciones; esta conversion no anade advertencias propias.
- Requiere `trust_remote_code=True` y codigo personalizado del modelo base, lo que implica ejecutar codigo no auditado por el usuario.
- Depende de versiones nightly de OpenVINO y OpenVINO GenAI (2026.5.0+) y de un PR de Optimum Intel no mergeado en el momento de publicacion; la estabilidad en produccion no esta garantizada.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- El thinking mode esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explicitamente.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni limites de contexto en la informacion proporcionada.
- Al ser una conversion de formato, cualquier limitacion del modelo base (precision, alucinacion, sesgos) se hereda sin cambios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenVINO/LFM3-1.7B-fp16-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Documentacion del formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Optimum Intel (inferencia): https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Documentacion OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- OpenVINO Model Server: https://github.com/openvinotoolkit/model_server
- Despliegue OVMS baremetal: https://docs.openvino.ai/ovms_baremetal
- PR de Optimum Intel con soporte LFM3: https://github.com/huggingface/optimum-intel/pull/2087
- Notebooks OpenVINO (busqueda LFM3): https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3
- Notebooks OpenVINO (busqueda LLM): https://openvinotoolkit.github.io/openvino_notebooks/?search=LLM
