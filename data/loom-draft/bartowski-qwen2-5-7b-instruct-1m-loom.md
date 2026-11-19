# loom-draft/bartowski-Qwen2.5-7B-Instruct-1M-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-7B-Instruct-1M-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Qwen2.5-7B-Instruct-1M-Q4_K_M.gguf` de bartowski. No se trata de un modelo nuevo ni de un fine-tune: los pesos subyacentes son los de Qwen2.5-7B-Instruct-1M, un transformer denso de 7 mil millones de parametros de Alibaba Qwen con ventana de contexto extendida a 1M de tokens en su variante original. El autor del repositorio es `loom-draft`, que publica el paquete para su uso con el runtime Loom sobre GPUs AMD.

El valor del artefacto esta en el empaquetado, no en el modelo: Loom genera kernels especificos para las arquitecturas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) con soporte de tool calling. El paquete se genero con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle.

Es relevante para quienes trabajan con hardware AMD y quieren ejecutar un modelo de 7B con contexto largo sin depender de CUDA ni de llama.cpp. Conviene tener presente que el repositorio no incluye mediciones de rendimiento ni resultados de las puertas de correccion: todas las filas de rendimiento y de validacion aparecen como "not yet re-measured". La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), empaquetado como programas Loom |
| Parametros totales | 7B (modelo base Qwen2.5-7B-Instruct-1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion en el preset Loom (el modelo base soporta hasta 1M) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen) |
| Idiomas soportados | no disponible en la informacion del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como `weights.loom` y programas `program/*.loom` |

Otros parametros del preset: maximo de 4.096 tokens de salida (`max_tokens`), 4 peticiones concurrentes, API estilo OpenAI.

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct-1M, un transformer decoder-only denso de la familia Qwen2.5, ajustado con instrucciones y con la ventana de atencion extendida a 1M de tokens en su variante "1M". El repositorio no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la documentacion original de Qwen y no se reproducen aqui.

La innovacion del paquete es de infraestructura: `loom-next` genera kernels y programas Loom especificos para las GPU AMD objetivo, con un pool de memoria fijado por adelantado (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El servidor expone la API de OpenAI y el paquete incluye `tokenizer.json`, `llm_config.json` e `info.json` con las mediciones y el estado de las puertas de validacion.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Contexto de 32.768 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida de hasta 4.096 tokens por respuesta.
- Razonamiento y modo thinking: no aplicable segun la tabla de caracteristicas del repositorio.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Capacidades multilingues: no documentadas en el repositorio.

## Casos de uso

- Asistente conversacional autohospedado en hardware AMD: el paquete se sirve con `loom-serve` y expone `/v1/chat/completions`, por lo que cualquier cliente compatible con la API de OpenAI puede apuntar al endpoint local sin adaptadores.
- Procesamiento de documentos largos: con 32.768 tokens por peticion se pueden analizar contratos, informes o expedientes completos en una sola pasada, sin trocear el texto en fragmentos que pierdan contexto.
- Agentes con tool calling: el soporte de `tools` y `tool_calls` permite construir bucles multi-paso donde el modelo consulta APIs internas, bases de datos o servicios de busqueda antes de responder.
- Despliegue en estaciones de trabajo con GPU AMD: orientado a equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700, donde el ecosistema CUDA no esta disponible y las alternativas de inferencia son mas limitadas.
- Prototipado de pipelines RAG: la ventana de contexto amplia permite inyectar varios fragmentos recuperados junto con el historial de la conversacion sin recurrir a tecnicas agresivas de compresion.
- Evaluacion comparativa de runtimes: util para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, ya que el repositorio documenta explicitamente esa comparacion como objetivo de sus puertas de validacion.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes encaja en escenarios de equipo pequeno o herramientas internas donde no se requiere escalado horizontal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible como cifra publicada. Un checkpoint Q4_K_M de 7B ocupa del orden de 4-5 GB de pesos, pero el repositorio no confirma el consumo real del pool de Loom ni el overhead de los kernels generados.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete esta generado para las arquitecturas AMD citadas.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones para este artefacto concreto.
- Latencia y throughput: no disponibles; las tablas de rendimiento del repositorio estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-1M (Loom, este paquete) | 7B | 32.768 por peticion en el preset | Loom sobre AMD gfx1151 / gfx1201 | Apache 2.0 | Sin mediciones publicadas; tool calling y API OpenAI |
| bartowski/Qwen2.5-7B-Instruct-1M-GGUF | 7B | 1M en el modelo base | GGUF, ejecutable con llama.cpp | Apache 2.0 | Checkpoint de origen, sin empaquetado especifico de hardware |
| Qwen2.5-7B-Instruct (variante estandar) | 7B | 32.768 en la variante estandar | Multiples (safetensors, GGUF, etc.) | Apache 2.0 | Sin la extension de contexto a 1M |

La comparacion con otras familias de 7B (Llama 3.1 8B, Mistral 7B) no se incluye porque el repositorio no aporta datos de rendimiento que permitan contrastarlas.

## Limitaciones y advertencias

- Ausencia total de validacion publicada: las puertas de correccion y las mediciones de rendimiento figuran como pendientes, por lo que no hay evidencia de que la salida coincida con la referencia de llama.cpp.
- Contexto efectivo reducido: aunque el modelo base soporta 1M de tokens, el preset de Loom limita cada peticion a 32.768 tokens, lo que descarta los casos de uso que motivan la variante 1M.
- Concurrencia baja: 4 peticiones simultaneas es un limite bajo para produccion con trafico real.
- Dependencia de hardware AMD concreto: el paquete esta generado para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPU.
- Idiomas no documentados: el repositorio no declara que idiomas soporta el modelo, aunque el modelo base Qwen2.5 es multilingue.
- Riesgo de alucinacion: inherente a los modelos de 7B, sin que el repositorio aporte evaluaciones que lo cuantifiquen.
- Sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Qwen2.5.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen de bartowski y de Qwen2.5 antes de desplegar.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la senal de validacion por parte de la comunidad.
- La busqueda web no devuelve resultados relacionados con este proyecto: los enlaces encontrados corresponden a Loom (herramienta de grabacion de pantalla) y Loom (marca de ropa), sin relacion con el runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-7B-Instruct-1M-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-1M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
