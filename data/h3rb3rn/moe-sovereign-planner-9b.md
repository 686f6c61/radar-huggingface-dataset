# h3rb3rn/moe-sovereign-planner-9b

## Resumen

`moe-sovereign-planner-9b` es un ajuste fino por LoRA del decodificador de texto de Qwen3.5-9B, desarrollado por el usuario h3rb3rn, concebido como el planificador/orquestador del sistema de IA compuesta "MoE Sovereign". Su funcion no es responder al usuario final, sino descomponer una peticion entrante en un maximo de 1 a 4 subtareas dirigidas a expertos de dominio, extrayendo y propagando de forma explicita las restricciones numericas del enunciado (tamanos de modelo, valores de MTU, sobrecarga de protocolo, dosis quimicas, bitrates) para que los expertos no puedan alucinar valores por defecto. Es, por tanto, un modelo especializado en descomposicion de tareas y enrutado, no un modelo de proposito general.

El modelo parte de un backbone de solo texto extraido del checkpoint multimodal Qwen3.5-9B (conversion de `Qwen3_5ForConditionalGeneration` a `Qwen3_5ForCausalLM`, descartando la torre de vision y la cabeza MTP). La arquitectura subyacente es un decodificador hibrido de atencion lineal y atencion completa, con una ventana de contexto nativa de 262.144 tokens heredada del modelo base. El adaptador LoRA anade 29.097.984 parametros entrenables sobre 8.982.901.248 totales declarados (0,32%).

Se trata de la variante "Spur-1" (pesos abiertos) del planificador; existe una variante paralela "Spur-2" tambien abierta que emplea OLMo-3-7B entrenado sobre el mismo conjunto de datos. El entrenamiento se ejecuto en EuroHPC LUMI-G con 8 GCD AMD Instinct MI250X y se publica bajo licencia Apache 2.0. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto muy reciente y practicamente sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido (atencion lineal + atencion completa), backbone de solo texto `Qwen3_5ForCausalLM` |
| Parametros totales | 8.953.803.264 segun los pesos safetensors del repositorio; la model card declara 8.982.901.248 totales, de los cuales 29.097.984 son entrenables (adaptador LoRA, 0,32%) |
| Parametros activos | no aplica (modelo denso; la denominacion "MoE" hace referencia al sistema de IA compuesta del que forma parte, no a la arquitectura del propio modelo) |
| Longitud de contexto | 262.144 tokens nativa (heredada de Qwen3.5); la model card recomienda limitar `num_ctx` a 32.768 en GPUs de 8 GB |
| Tipos de cuantizacion | GGUF Q4_K_M (recomendada para despliegue) y GGUF Q8_0 (referencia de mayor fidelidad); el repositorio safetensors esta en bf16 |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 (heredada de Qwen3.5-9B) |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp/Ollama) |

## Arquitectura y entrenamiento

El backbone es el decodificador de Qwen3.5-9B, un transformer con esquema hibrido que combina capas de atencion lineal con capas de atencion completa. Para poder aplicar un ajuste fino estandar de modelo causal, el autor extrajo unicamente la parte textual del checkpoint original multimodal, descartando la torre de vision y la cabeza de prediccion multi-token (MTP). Sobre ese backbone se aplico un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, dirigido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` y a las proyecciones de la MLP `gate_proj`, `up_proj` y `down_proj`. Esto supone 29.097.984 parametros entrenables sobre 8.982.901.248 (0,32% del total).

El entrenamiento se realizo durante 3 epocas sobre 4.726 ejemplos curados de descomposicion, con una longitud de secuencia de 4.096 tokens, batch efectivo de 128 (micro-batch 4 x 8 GPUs x acumulacion de gradientes 4), learning rate de 1,5e-5, optimizador con sharding DeepSpeed ZeRO-2 en bf16 y computo en EuroHPC LUMI-G sobre 8 GCD AMD Instinct MI250X con ROCm. La trayectoria de perdida observada fue 1,792 -> 0,990 -> 0,535 -> 0,400, un descenso monotono y suave sin senales de sobreajuste segun el autor. No se documenta en la informacion disponible el uso de RLHF, DPO u otras fases de alineacion posteriores al ajuste supervisado. La innovacion principal no es arquitectonica sino funcional: el prompt de sistema obliga al modelo a extraer las restricciones numericas del enunciado e integrarlas como `IMMUTABLE_CONSTANTS` dentro de la descripcion de cada subtarea, de modo que los expertos de dominio reciban los valores exactos y no puedan sustituirlos por valores por defecto plausibles pero incorrectos.

## Capacidades

- Descomposicion de peticiones en 1 a 4 subtareas dirigidas a expertos de dominio, con formato ChatML.
- Extraccion de restricciones numericas y parametros tecnicos del enunciado (tamanos de modelo, MTU, sobrecarga de protocolo, dosis quimicas, bitrates) y su propagacion como constantes inmutables dentro de cada subtarea.
- Funcion de orquestacion y enrutado dentro de un sistema de IA compuesta tipo Mixture-of-Experts; no ejecuta las subtareas, las deriva a los expertos.
- Generacion de texto conversacional en formato ChatML (soporte de system prompt, turnos de usuario y de asistente).
- Capacidad multilingue limitada a ingles y aleman segun los metadatos declarados.
- Razonamiento de tipo planificacion estructurada (descomposicion jerarquica de una peticion en pasos accionables).
- Configuracion de temperatura recomendada de 0,2 para el modo de planificacion, lo que favorece salidas deterministas.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Orquestacion de sistemas de IA compuesta: el modelo recibe la peticion bruta del usuario y devuelve entre 1 y 4 subtareas ya redactadas para los expertos de dominio, actuando como capa de enrutado previa al resto del pipeline.
- Propagacion de constantes criticas en entornos tecnicos: en peticiones que incluyen valores como MTU, sobrecarga de protocolo o bitrates, el planificador los inyecta como `IMMUTABLE_CONSTANTS` en cada subtarea, evitando que un experto especializado asuma un valor por defecto y produzca una respuesta numericamente incorrecta.
- Enrutado en agentes multi-paso: dentro de un framework de agentes, el modelo puede actuar como primer eslabon que decide cuantos subproblemas componen la tarea y como formularlos, dejando la ejecucion a otros modelos especializados.
- Preprocesado de tickets tecnicos en atencion al cliente: ante una incidencia de red o de infraestructura descrita en lenguaje natural, el modelo la descompone en subtareas diagnosticas concretas (por ejemplo, verificacion de MTU y de configuracion de interfaz) que otros sistemas resuelven.
- Automatizacion en telecomunicaciones e ingenieria de redes: descomposicion de solicitudes que mezclan varias capas del stack para que cada experto reciba unicamente los parametros de su ambito, con los valores de red fijados de antemano.
- Planificacion de tareas de laboratorio o procesos con dosificacion: en peticiones que incluyen dosis o concentraciones quimicas, el modelo fija esos valores como constantes inmutables dentro de las subtareas, reduciendo el riesgo de que se sustituyan por valores genericos.
- Generacion de planes de ejecucion para pipelines de CI/CD o infraestructura: convierte una descripcion de alto nivel en una lista corta y ordenada de subtareas tecnicas que herramientas posteriores pueden procesar.
- Evaluacion comparativa de planificadores: al existir una variante "Spur-2" con OLMo-3-7B entrenada sobre el mismo conjunto de datos, este modelo sirve como punto de comparacion controlado entre backbones para estudiar la calidad de la descomposicion de tareas.
- Asistencia en documentacion tecnica bilingue (ingles/aleman): generacion de planes y resumenes de tareas en ambos idiomas, aprovechando el soporte declarado de los dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la trayectoria de perdida de entrenamiento (1,792 -> 0,990 -> 0,535 -> 0,400) y no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni ninguna otra suite estandar, ni tampoco metricas especificas de calidad de descomposicion de tareas. No se dispone de comparaciones numericas con la variante Spur-2 ni con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 5,5-6 GB en GGUF Q4_K_M, en torno a 9,5-10 GB en GGUF Q8_0 y unos 18 GB en bf16 (safetensors), sin contar la cache KV.
- GPU consumer: la model card indica que el modelo cabe en una unica GPU de 8 GB, con la condicion de limitar `num_ctx` a 32.768 tokens y usar cache KV en `f16` en hardware de generacion Maxwell. En tarjetas de 12-24 GB (RTX 3060 12 GB, RTX 4070/4080, RTX 4090) cabria con margen para contextos mayores.
- GPU de datacenter: A100, H100, H200 o MI250X/MI300X para despliegue en bf16 con contextos largos; el entrenamiento del adaptador se realizo sobre 8 GCD AMD Instinct MI250X.
- Opciones de despliegue: llama.cpp y Ollama mediante los ficheros GGUF publicados (la model card incluye un `Modelfile` de ejemplo con `num_ctx 32768` y temperatura 0,2); vLLM o TGI para los pesos safetensors a traves de `transformers`. El repositorio esta marcado como compatible con endpoints.
- Contexto largo: la ventana nativa es de 262.144 tokens, pero no se dispone de datos publicados de consumo real de memoria de la cache KV con atencion hibrida a esa longitud.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| moe-sovereign-planner-9b | 8.953.803.264 (29.097.984 entrenables) | 262.144 tokens | Apache 2.0 | safetensors, GGUF | Planificador/orquestador objeto de esta ficha; ajuste LoRA del decodificador de texto de Qwen3.5-9B |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | 262.144 tokens (heredado) | no disponible | no disponible | Checkpoint multimodal original (`Qwen3_5ForConditionalGeneration`); el planificador descarta su torre de vision y su cabeza MTP |
| Spur-2 (planificador con OLMo-3-7B) | 7B (aproximado, segun denominacion) | no disponible | no disponible | no disponible | Variante paralela del mismo sistema, entrenada sobre el mismo conjunto de datos; parametros exactos, licencia y contexto no disponibles |

No se dispone de datos publicos de rendimiento que permitan comparar estos modelos sobre una misma suite de evaluacion. La comparacion disponible se limita a la arquitectura, el tamano y la licencia.

## Limitaciones y advertencias

- La calidad de la descomposicion depende de que la peticion contenga restricciones extraibles; ante peticiones ambiguas el modelo puede producir subtareas infradimensionadas o incompletas, tal y como reconoce la propia model card.
- El modelo no ejecuta las subtareas: solo las formula y las deriva a los expertos de dominio. No debe utilizarse como modelo de respuesta final.
- Riesgo de alucinacion: aunque el diseno trata de impedir que los expertos inventen valores por defecto, el propio planificador podria extraer o transcribir incorrectamente una constante numerica del enunciado original. No se han publicado evaluaciones que cuantifiquen esta tasa de error.
- Cobertura idiomatica limitada a ingles y aleman segun los metadatos; no se declara soporte de castellano ni de otros idiomas, por lo que su uso en espanol no esta respaldado por el autor.
- La ventana nativa es de 262.144 tokens, pero en GPUs de 8 GB la model card obliga a recortarla a 32.768 tokens, lo que reduce drasticamente el contexto util en hardware de gama baja.
- No se documentan capacidades de tool calling nativo, vision, audio ni modo de razonamiento explicito; el modelo esta especializado en una unica funcion.
- La model card advierte de que en hardware de generacion Maxwell es necesario usar cache KV en `f16`; no se detallan las consecuencias de usar otras precisiones.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales mas alla de las obligatorias de la propia licencia (atribucion y conservacion del aviso). No obstante, al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base, cuya licencia no figura en la informacion disponible.
- Artefacto practicamente sin validacion externa: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin benchmarks publicados ni evaluaciones de terceros.
- Existe una discrepancia menor entre el recuento de parametros de los pesos safetensors (8.953.803.264) y el total declarado en la model card (8.982.901.248); conviene verificarlo antes de integrarlo en un pipeline con requisitos estrictos de memoria.
- La busqueda web realizada no devolvio resultados relacionados con este modelo: los enlaces recuperados corresponden a un banco de Sri Lanka (DFCC Bank) y son completamente ajenos al objeto de esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/h3rb3rn/moe-sovereign-planner-9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
