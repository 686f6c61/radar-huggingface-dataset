# loom-draft/bartowski-Nanbeige_Nanbeige4.3-33B-loom

## Resumen

`loom-draft/bartowski-Nanbeige_Nanbeige4.3-33B-loom` es un paquete de distribucion en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf`, publicado por bartowski. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de despliegue que empaqueta los pesos del modelo Nanbeige 4.3 de 33B, cuantizados en Q4_K_M, para ejecutarse sobre el runtime Loom en GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201 y 32 GB).

El interes practico del paquete reside en que ofrece una ruta de inferencia nativa para hardware AMD consumer y profesional, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activable y una ventana de contexto declarada de 242.688 tokens por peticion con hasta 4 peticiones concurrentes. El modelo subyacente es un transformer denso de 33B parametros, aunque la informacion proporcionada no detalla su arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, si bien conviene verificar la licencia del modelo base original de Nanbeige, ya que el paquete hereda las condiciones del checkpoint del que deriva. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de correccion del propio autor figuran como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso de 33B segun el nombre del checkpoint; detalles internos no disponibles) |
| Parametros totales | 33B (segun el nombre del modelo) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 242.688 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo Nanbeige 4.3 33B en los datos proporcionados: no se detalla si emplea atencion completa, atencion lineal, mezcla de expertos ni el esquema de posiciones. El paquete Loom no modifica los pesos; unicamente los reempaqueta junto con kernels generados para los targets AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), de modo que la inferencia se ejecuta sobre el runtime Loom en lugar de sobre llama.cpp.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento. La unica innovacion tecnica verificable en este artefacto es el propio pipeline de despliegue: generacion de kernels especificos por GPU, pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de completions (`completion_spin_ns=4294967295`). El paquete declara explicitamente que la decodificacion especulativa no aplica.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Ventana de contexto de 242.688 tokens por peticion, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (marcado como "not applicable").
- Sin decodificacion especulativa ni ajuste de esfuerzo de razonamiento ("reasoning effort" no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (sampling): estado "not determined" en la tabla de features del autor.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: el paquete esta pensado para ejecutarse en una Ryzen AI Max+ 395 o una Radeon AI PRO R9700, de modo que un equipo individual puede servir un chatbot con API compatible con OpenAI sin depender de la nube.
- Procesamiento de documentos largos: con 242.688 tokens de contexto por peticion, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada para tareas de resumen, extraccion o preguntas y respuestas sobre el documento.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs, bases de datos o sistemas internos, encadenando varios pasos con historial de conversacion reutilizado.
- Razonamiento asistido con modo thinking: al venir activado por defecto, resulta adecuado para tareas de analisis, planificacion o resolucion de problemas donde conviene que el modelo explicite su cadena de razonamiento antes de responder.
- Evaluacion de hardware AMD para IA: util como banco de pruebas para medir el rendimiento de Loom frente a llama.cpp en Strix Halo y R9700, aunque el propio autor indica que las mediciones aun no se han repetido.
- Despliegue local con requisitos de soberania de datos: al ejecutarse en hardware propio y con licencia Apache 2.0, encaja en entornos donde los datos no pueden salir de la infraestructura de la organizacion.
- Integracion en pipelines internos mediante cliente OpenAI: cualquier herramienta que hable con la API de OpenAI puede apuntar a `http://127.0.0.1:8080/v1` sin cambios de codigo, lo que simplifica prototipos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: el checkpoint es una cuantizacion Q4_K_M de un modelo de 33B, lo que situa los pesos en torno a 19-20 GB; a ello hay que sumar la cache KV para contextos largos, por lo que 32 GB de VRAM son el minimo practico razonable para la ventana completa.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: cabe en la Radeon AI PRO R9700 de 32 GB; en Strix Halo el modelo se ejecuta sobre memoria unificada del sistema. No se documenta soporte para GPUs NVIDIA ni para Radeon de menor VRAM.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este paquete concreto, aunque el GGUF original de bartowski si es compatible con llama.cpp.
- Parametros de servicio documentados: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de completions, que consume CPU mientras hay trabajo en GPU).
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Nanbeige 4.3 33B (este paquete Loom) | 33B | 242.688 tokens | Apache 2.0 | GGUF empaquetado en Loom; runtime Loom en AMD gfx1151/gfx1201 | Sin benchmarks ni mediciones publicadas; 4 peticiones concurrentes; tool calling y thinking |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF (origen) | 33B | no disponible | Apache 2.0 (segun este paquete) | GGUF; runtime llama.cpp | Mismo checkpoint sin reempaquetar; referencia de correccion del paquete Loom |
| Alternativas de ~30B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion con modelos equivalentes |

No se dispone de informacion suficiente para comparar rendimiento (throughput, latencia, calidad) con alternativas de la misma categoria; cualquier cifra al respecto seria especulativa.

## Limitaciones y advertencias

- El autor no ha publicado mediciones de rendimiento ni resultados de las puertas de correccion para este paquete: no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- El muestreo figura como "not determined": no esta confirmado que temperatura, top_k y semilla se comporten de forma equivalente a llama.cpp.
- Limitacion de hardware: el paquete esta generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs, incluido NVIDIA.
- Limite de salida de 4.096 tokens por peticion, lo que restringe respuestas muy largas o generacion de codigo extensa en una sola llamada.
- Concurrencia maxima de 4 peticiones; no es adecuado para servir cargas de alta concurrencia sin escalado horizontal.
- Sin soporte de vision ni audio, pese a que la puerta de correccion `vision` aparezca en la tabla (marcada como no aplicable en features).
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los habituales de un modelo de lenguaje de su escala.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable en castellano sin evaluacion previa.
- Licencia Apache 2.0 declarada en este paquete, pero conviene verificar la licencia del modelo Nanbeige original antes de un uso comercial en produccion.
- Repositorio sin descargas ni validacion de la comunidad (0 descargas, 0 likes), lo que reduce la confianza en su mantenimiento y soporte.
- La espera activa de completions (`completion_spin_ns=4294967295`) consume CPU de forma continua mientras hay trabajo en GPU; en despliegues compartidos puede afectar a otros procesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Nanbeige_Nanbeige4.3-33B-loom
- Modelo base (GGUF de bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
