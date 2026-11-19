# loom-draft/openbmb-MiniCPM5-1B-loom

## Resumen

MiniCPM5-1B es un modelo de lenguaje compacto de la familia MiniCPM desarrollada por OpenBMB (Open Bilingual Modeling Lab, vinculado a la Universidad de Tsinghua). El checkpoint original se publica en formato GGUF, una eleccion que prioriza el despliegue en entornos con recursos limitados mediante llama.cpp y runtimes compatibles. Con aproximadamente 1.000 millones de parametros, se situa en la categoria de modelos pequenos orientados a inferencia local.

La ficha que nos ocupa no contiene el modelo original, sino un paquete de despliegue generado por `loom-next` para el runtime Loom sobre GPUs AMD. El autor `loom-draft` empaqueta el GGUF sin modificar (`MiniCPM5-1B-Q4_K_M.gguf`) junto con programas `.loom` compilados para las arquitecturas gfx1151 (Ryzen AI Max+ 395 "Strix Halo") y gfx1201 (Radeon AI PRO R9700). El objetivo es ofrecer inferencia nativa en GPUs AMD a traves de una API compatible con OpenAI, sin depender de CUDA.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar modelos de 1B en hardware AMD de consumo y estaciones de trabajo; por otro, expone el estado incipiente del ecosistema Loom, ya que el propio autor indica que las mediciones de rendimiento y las puertas de correccion aun no se han re-medido para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | ~1B (por el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en programas `.loom` + `tokenizer.json` + `llm_config.json`) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base MiniCPM5-1B: no se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO). Todo ello queda como "no disponible" en esta ficha.

Lo que si se describe es la capa de despliegue. El paquete Loom incluye programas `.loom` generados por `loom-next` (el generador, sin LLM en el bucle) que implementan los kernels de inferencia para las arquitecturas AMD gfx1151 y gfx1201, junto con `weights.loom`, el tokenizador y la configuracion `llm_config.json` de la que se generaron los programas. El modelo soporta un modo de razonamiento ("thinking") desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que sugiere que el checkpoint base fue entrenado con algun mecanismo de cadena de pensamiento opcional.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto de 131.072 tokens por peticion, adecuado para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas segun la configuracion del preset.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: marcado como "not applicable" en la model card.
- Razonamiento multi-paso con agentes: no soportado (tool calling no aplicable).
- Entrada de imagen: estado "no determinado" (el modelo base MiniCPM5-1B-GGUF podria tener variante multimodal, pero no se confirma).
- Entrada/salida de audio: no determinado.
- Muestreo (temperature, top_k, seed): no determinado en la documentacion del paquete.
- Decodificacion especulativa: no aplicable.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite levantar un servidor compatible con OpenAI en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395, sirviendo conversaciones multi-turno con hasta 131k tokens de contexto sin salir del hardware local.
- Procesamiento de documentos largos en el borde: con 131.072 tokens de contexto y cuantizacion Q4_K_M, el modelo puede resumir o extraer informacion de contratos, informes o expedientes que caben en una sola ventana, sin necesidad de fragmentacion.
- Prototipado de aplicaciones sobre ROCm: util para equipos que desarrollan en el stack AMD y necesitan un endpoint de chat rapido para validar integraciones antes de escalar a modelos mayores.
- Evaluacion comparativa de runtimes: el paquete incluye puertas de correccion (`golden`, `compare`, `consistency`) pensadas para contrastar la salida contra llama.cpp, lo que lo convierte en una herramienta para validar la fidelidad de Loom frente al runtime de referencia.
- Generacion de texto en entornos con restricciones de memoria: al ocupar Q4_K_M de un modelo de ~1B, cabe en GPUs integradas y dedicadas modestas, habilitando tareas de redaccion, clasificacion o extraccion en equipos sin aceleradores de gran capacidad.
- Modo de razonamiento bajo demanda: activando `enable_thinking`, el modelo puede emplearse en tareas que requieren pasos intermedios (problemas aritmeticos sencillos, preguntas de logica) y desactivarlo para respuestas rapidas de baja latencia.
- Servicio de chat concurrente ligero: con 4 peticiones concurrentes configuradas, puede atender pequenos equipos o demos publicas con un unico acelerador AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput verificables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un modelo de ~1B en Q4_K_M ocupa tipicamente del orden de 1 GB de pesos, pero la cifra exacta del paquete Loom no se documenta.
- GPUs soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: si, en el sentido de que el modelo base es de ~1B y Q4_K_M; sin embargo, el paquete solo declara soporte para las dos arquitecturas AMD citadas.
- Opciones de despliegue: runtime Loom (`loom-serve`), instalado via `pipx install "hrx-loom[hf]==0.2.0"`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este paquete concreto (aunque el GGUF original es compatible con llama.cpp).
- Parametros de servicio relevantes: `--pool_backing=fixed` (reserva fija del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host), `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo).
- Latencia y throughput: no disponibles; las mediciones no se han re-realizado para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B (este paquete Loom) | ~1B | 131.072 | Apache 2.0 | GGUF empaquetado en `.loom` | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| MiniCPM5-1B-GGUF (original OpenBMB) | ~1B | no disponible en esta ficha | Apache 2.0 | GGUF | Checkpoint de referencia; compatible con llama.cpp |
| Otros modelos ~1B de la familia MiniCPM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Ausencia de benchmarks y de evidencia de correccion: todas las puertas de validacion figuran como "not yet re-measured", por lo que no hay garantia documentada de que la salida coincida con la de llama.cpp.
- Tool calling no soportado ("not applicable"), lo que descarta su uso en pipelines de agentes que requieran invocacion de funciones.
- Estado indeterminado de vision, audio y muestreo: la model card marca estos apartados con "?" o "not determined", lo que impide planificar su uso en produccion.
- Cobertura de hardware muy restringida: solo se declaran soportadas las arquitecturas gfx1151 y gfx1201; no hay soporte documentado para NVIDIA, Intel ni otras GPUs AMD.
- Modelo de ~1B: capacidad limitada para razonamiento complejo, matematicas avanzadas y generacion de codigo extensa en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones especificas.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion proporcionada.
- Idiomas: no se especifica la cobertura linguistica del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el paquete depende del runtime Loom (`hrx-loom`), cuya licencia y condiciones de soporte no se detallan en la model card.
- Madurez del ecosistema: el paquete se creo y actualizo el mismo dia (2026-11-19), con cero descargas y cero likes, lo que sugiere un artefacto reciente y sin validacion comunitaria.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`): cambios de version pueden romper la compatibilidad del paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/openbmb-MiniCPM5-1B-loom
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
