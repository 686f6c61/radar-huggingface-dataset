# loom-draft/lemuralabs-Llama-3.2-3B-Uncensored-loom

## Resumen

`loom-draft/lemuralabs-Llama-3.2-3B-Uncensored-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `lemuralabs/Llama-3.2-3B-Uncensored-GGUF`, en su variante `model-Q4_K_M.gguf`. El autor del paquete es la cuenta `loom-draft`, que lo publica como artefacto de destino para el ecosistema Loom (herramienta `loom-next`, servidor `loom-serve`), orientado a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Llama 3.2 de 3B parametros afinado por lemuralabs para retirar el alineamiento de rechazo ("uncensored"), sobre la arquitectura transformer densa original de Meta. El paquete Loom lo empaqueta con cuantizacion Q4_K_M y una configuracion de servicio que expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, ventana de contexto de 131.072 tokens por peticion y 4 peticiones concurrentes.

Su relevancia es acotada y muy especifica: sirve como ejemplo de despliegue nativo de un GGUF en GPUs AMD mediante kernels generados, sin depender de llama.cpp en tiempo de ejecucion, y como banco de pruebas del ecosistema Loom. La model card no incluye resultados de rendimiento ni de correccion para este paquete concreto (todas las puertas aparecen como "not yet re-measured"), por lo que cualquier evaluacion de calidad debe remitirse al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B, heredada del modelo base) |
| Parametros totales | 3B (heredado del modelo base; no detallado en la model card) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si (formato OpenAI `tools` / `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: reutiliza el checkpoint Llama 3.2 3B afinado por lemuralabs, un transformer denso con atencion por grupos (GQA) y tokenizer Llama 3. La model card no documenta el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO o el metodo concreto de "uncensoring"), por lo que esos datos deben consultarse en la ficha de `lemuralabs/Llama-3.2-3B-Uncensored-GGUF`.

La innovacion tecnica del artefacto esta en el empaquetado: `loom-next` genera, sin intervencion de un LLM en el bucle, programas `.loom` especificos para las arquitecturas gfx1151 y gfx1201 a partir de `llm_config.json`, junto con `tokenizer.json` y `info.json`. El servidor `loom-serve` ejecuta esos kernels sobre ROCm con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`), y la configuracion de referencia activa espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No hay decodificacion especulativa, modo de razonamiento ni entrada multimodal: la propia tarjeta marca esas capacidades como no aplicables.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucle de agente multi-turno validado por la puerta `agent` (sin resultados registrados aun).
- Contexto de 131.072 tokens por peticion, adecuado para documentos largos o historiales extensos.
- Hasta 4 peticiones concurrentes con salida determinista respecto a ejecuciones aisladas (puerta `consistency`, sin medicion publicada).
- Salida maxima de 4.096 tokens por respuesta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de vision, audio, modo thinking ni razonamiento extendido (marcados como no aplicables en la tarjeta).
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de funcionalidades del autor.

## Casos de uso

- Despliegue local en Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` y consumirlo desde cualquier cliente compatible con OpenAI, sin GPU discreta ni pila CUDA.
- Servicio en Radeon AI PRO R9700: con 32 GB de VRAM, el Q4_K_M de 3B deja margen amplio para el pool de memoria y las 4 peticiones concurrentes, util en estaciones de trabajo AMD.
- Asistente conversacional de contexto largo: los 131.072 tokens permiten mantener historiales extensos o resumir documentos de decenas de miles de palabras en una sola peticion.
- Agente con herramientas: el soporte de `tools`/`tool_calls` permite construir bucles de agente que consulten APIs o ejecuten acciones, con la puerta `agent` del banco de pruebas como referencia de validacion (pendiente de medicion).
- Pruebas de compatibilidad Loom: util como caso de validacion del ecosistema `loom-next`/`loom-serve` frente a la referencia llama.cpp sobre el mismo GGUF (puertas `golden`, `compare`, `logits`).
- Generacion de texto sin filtros de rechazo: el afinado "uncensored" del modelo base lo hace adecuado para entornos de investigacion sobre alineamiento y negativa, siempre con revision humana.
- Prototipado rapido en local: al ser un 3B en Q4_K_M, el coste de memoria es bajo y permite iterar en una sola maquina AMD antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: un 3B en Q4_K_M ocupa aproximadamente 2 GB de pesos; el consumo real depende del pool de memoria fijo de `loom-serve`, del contexto reservado (hasta 131.072 tokens) y de las 4 peticiones concurrentes.
- GPU soportadas segun la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: no se confirma compatibilidad con Radeon RX de consumo; la tarjeta solo lista los dos destinos anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto (llama.cpp se usa solo como referencia de correccion).
- Latencia y throughput: no disponibles; la tarjeta remite a mediciones pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| loom-draft/lemuralabs-Llama-3.2-3B-Uncensored-loom | 3B | 131.072 | Q4_K_M | Apache 2.0 | Paquete Loom para GPU AMD (gfx1151/gfx1201) |
| lemuralabs/Llama-3.2-3B-Uncensored-GGUF | 3B | no disponible en esta ficha | GGUF (incluye Q4_K_M) | Apache 2.0 (heredada) | Modelo base sin empaquetar, ejecutable con llama.cpp |
| Llama 3.2 3B Instruct (Meta) | 3B | 131.072 | multiples | Llama 3.2 Community License | Modelo original alineado, referencia de capacidades |

La comparativa se limita a estos tres porque la informacion disponible no incluye datos de rendimiento del paquete Loom ni de sus alternativas en el mismo hardware; no se dispone de cifras de MMLU, HumanEval ni GSM8K para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Ausencia total de mediciones publicadas: rendimiento y correccion frente a llama.cpp figuran como pendientes en ambas GPU, por lo que no hay evidencia de que la salida coincida token a token con la referencia.
- Modelo "uncensored": el afinado del base elimina parte de las negativas de seguridad, lo que incrementa el riesgo de contenido danino, sesgado o inexacto; requiere filtros y supervision en produccion.
- Riesgo de alucinacion propio de un modelo de 3B, agravado por el contexto largo: con 131.072 tokens de ventana, la atencion a fragmentos lejanos puede degradarse.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del que herede el modelo base.
- Compatibilidad de hardware restringida a gfx1151 y gfx1201; no se declara soporte para otras GPU AMD ni para NVIDIA.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de los kernels generados; cambios de driver ROCm o de firmware pueden romper la ejecucion.
- Muestreo no determinado ("not determined"): el comportamiento de temperature, top_k y seed no esta verificado.
- La licencia Apache 2.0 se declara sobre el paquete, pero el modelo base arrastra las condiciones de la licencia de Llama 3.2 de Meta; conviene revisar ambas antes de un uso comercial.
- Cero descargas y cero "likes" en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/lemuralabs-Llama-3.2-3B-Uncensored-loom
- Modelo base GGUF: https://huggingface.co/lemuralabs/Llama-3.2-3B-Uncensored-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Llama 3.2 (Meta): no disponible en la informacion proporcionada
