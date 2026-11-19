# loom-draft/LessThanThreeAI-Gemma-4-31B-Humanlike-Chat-loom

## Resumen

LessThanThreeAI-Gemma-4-31B-Humanlike-Chat-loom es un paquete de despliegue en formato Loom (`.loom` y un fichero `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF`, en su variante `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tuning propio, sino de un artefacto de empaquetado orientado a la inferencia sobre GPUs de AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se realizo con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

El modelo subyacente es un Gemma de cuarta generacion con 31.000 millones de parametros, ajustado para conversacion con un estilo "humanlike" por el autor original LessThanThreeAI. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y un modo de razonamiento opcional desactivado por defecto. La ventana de contexto configurada en el preset es de 53.248 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Su relevancia es acotada pero concreta: ofrece una via de ejecucion de un modelo de 31B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional mediante el stack Loom/ROCm, con una interfaz estandar. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el propio autor indica que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 31.000 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por peticion (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |
| Modelo base | LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF |
| Concurrencia maxima | 4 peticiones simultaneas |
| Tokens de salida maximos | 4.096 (preset `max_tokens`) |
| Herramienta de generacion | loom-next (sin LLM en el bucle) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo subyentemente mas alla de su pertenencia a la familia Gemma 4 con 31.000 millones de parametros. No se especifican el numero de capas, la dimension oculta, el tipo de atencion (global/local, GQA, etc.) ni si emplea componentes hibridos. Tampoco se detalla el proceso de entrenamiento del checkpoint original: no hay datos sobre volumen de tokens, composicion del dataset, fases de RLHF, DPO o ajuste supervisado. El sufijo "Humanlike-Chat" sugiere un ajuste conversacional orientado a un tono mas natural, pero el autor del paquete no aporta la model card del modelo original.

En lo que respecta al paquete Loom, la innovacion tecnica esta en el artefacto de despliegue, no en el modelo: se generan kernels especificos para las arquitecturas gfx1151 y gfx1201, se ofrece un pool de memoria de backend fijo (`--pool_backing=fixed`) para comprometer la memoria por adelantado, precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra llama.cpp sobre el mismo GGUF, aunque para este paquete concreto todas aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional multi-turno con una ventana de 53.248 tokens por peticion.
- Tool calling en estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls` en la respuesta.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de hasta 4 peticiones concurrentes con resultados consistentes respecto a ejecuciones aisladas (segun la puerta `consistency` definida, pendiente de re-medicion).
- API compatible con OpenAI en `/v1/chat/completions`, lo que facilita la integracion con clientes existentes.
- Capacidades multimodales (imagen y audio) presentes en el modelo original pero no soportadas por Loom: el paquete rechaza entrada de imagen y audio.
- Decodificacion especulativa no aplicable en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: el paquete permite servir el modelo en una Radeon AI PRO R9700 de 32 GB o en un Strix Halo mediante `loom-serve`, con API OpenAI, para prototipos de chat sin depender de servicios en la nube.
- Agentes con tool calling en entornos controlados: al soportar `tools`/`tool_calls` y un bucle multi-turno verificado por la puerta `agent`, encaja en automatizaciones que consultan APIs internas o bases de datos mediante funciones declaradas.
- Procesamiento de documentos largos: con 53.248 tokens de contexto por peticion, permite resumir o extraer informacion de contratos, informes o transcripciones de decenas de paginas en una sola pasada.
- Evaluacion comparativa de runtimes AMD: util como banco de pruebas para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, gracias a las puertas `golden`, `compare` y `logits`.
- Generacion de codigo asistida en local: el modo thinking opcional y el soporte de tool calling permiten integrarlo en asistentes de edicion que invocan herramientas de compilacion o test.
- Chat de atencion al usuario con tono conversacional: el ajuste "Humanlike" del checkpoint original esta pensado para respuestas mas naturales, adecuado para interfaces de soporte o companeros virtuales.
- Despliegue en infraestructura AMD sin CUDA: para organizaciones con flotas Radeon/ROCm que necesitan un LLM de 31B cuantizado sin recurrir a GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correccion para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) no se han vuelto a medir para este paquete ("the results for this package are not yet re-measured").

## Requisitos de hardware

- VRAM estimada: un modelo de 31B en Q4_K_M ocupa del orden de 17-19 GB de pesos; el preset declara un pool de memoria fijo, por lo que la VRAM reservada sera igual o superior a esa cifra mas el espacio para KV cache de hasta 53.248 tokens y 4 peticiones concurrentes. La cifra exacta del preset no esta disponible en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- Compatibilidad con GPU consumer: no confirmada; el paquete esta generado para gfx1151 y gfx1201. No se mencionan Radeon RX 7900 XTX (gfx1100) ni otras consumer.
- Opciones de despliegue: `hrx-loom` 0.2.0 con `loom-fetch` y `loom-serve`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque el GGUF original puede usarse con llama.cpp por separado.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete estan pendientes de re-medicion.
- Nota operativa: `completion_spin_ns=4294967295` activa espera activa en CPU mientras hay trabajo en GPU, lo que incrementa el uso de CPU a cambio de menor latencia de finalizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| LessThanThreeAI-Gemma-4-31B-Humanlike-Chat-loom | 31B | 53.248 tokens (preset) | Apache 2.0 | Loom (`.loom`), hrx-loom | Repositorio con 0 descargas |
| LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF (modelo base) | 31B | no disponible | Apache 2.0 (segun este paquete) | GGUF, llama.cpp y otros | Disponible en Hugging Face |
| Modelos Gemma 4 de 31B sin ajuste conversacional | 31B | no disponible | no disponible | safetensors, GGUF | Disponible en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Paquete sin validacion publicada: todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no re-medidas, por lo que no hay evidencia registrada de equivalencia con llama.cpp para este artefacto.
- Rendimiento sin medir: no hay cifras de latencia ni throughput para Strix Halo ni para R9700 en este paquete.
- Repositorio vacio en la practica: 0.0 GB de tamano y 0 descargas; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Modalidades recortadas: el modelo original soporta imagen y audio, pero Loom no; cualquier flujo multimodal fallara.
- Sin decodificacion especulativa: no aplicable en este runtime, lo que limita las optimizaciones de latencia disponibles.
- Contexto y concurrencia acotados por el preset: 53.248 tokens por peticion y 4 peticiones simultaneas; superar estos limites requiere reconfiguracion no documentada.
- Idiomas no declarados: no se especifica cobertura linguistica, por lo que el comportamiento en castellano no esta garantizado.
- Sesgos y alucinaciones: no hay informacion sobre evaluaciones de sesgo ni de tasa de alucinacion del checkpoint original; al ser un ajuste conversacional "humanlike", puede producir respuestas plausibles pero incorrectas con mayor fluidez.
- Licencia: Apache 2.0 segun la model card del paquete, pero conviene confirmar los terminos del modelo base y de Gemma 4 en sus repositorios originales antes de un uso comercial.
- Hardware restringido: solo se documentan gfx1151 y gfx1201; el uso en otras GPUs AMD o en NVIDIA no esta soportado por este paquete.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/LessThanThreeAI-Gemma-4-31B-Humanlike-Chat-loom
- Modelo base GGUF: https://huggingface.co/LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
