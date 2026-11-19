# loom-draft/bartowski-BAAI_AREX-2-loom

## Resumen

BAAI_AREX-2 es un modelo multimodal de tipo image-text-to-text desarrollado originalmente por el Beijing Academy of Artificial Intelligence (BAAI). Esta ficha concreta, `loom-draft/bartowski-BAAI_AREX-2-loom`, no es un modelo nuevo ni un fine-tuning: es un paquete de despliegue en formato Loom generado a partir del checkpoint GGUF `bartowski/BAAI_AREX-2-GGUF` (concretamente la cuantizacion `Q4_K_M`), sin modificar los pesos. El paquete incluye programas `.loom` generados con la herramienta `loom-next` y una tarjeta `model.json`, y esta orientado a su ejecucion en GPUs AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico de esta publicacion es la portabilidad: permite servir el modelo con una API compatible con OpenAI (`/v1/chat/completions`) sobre el stack `hrx-loom` y ROCm, sin depender de llama.cpp en tiempo de ejecucion. El paquete declara soporte de tool calling, modo de razonamiento configurable, entrada de imagen mediante el proyector `mmproj-BAAI_AREX-2-bf16.gguf`, contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.

No obstante, la propia model card indica que las mediciones de rendimiento y las compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, etc.) no han sido re-medidas para este paquete en ninguna de las dos GPUs objetivo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que los artefactos aun no estan materializados o que la metadata no refleja el contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base BAAI_AREX-2; el paquete solo describe el formato de despliegue) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 (`mmproj-BAAI_AREX-2-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Pipeline | image-text-to-text |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no soportada |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base BAAI_AREX-2: no se detalla si es un transformer denso, un MoE o un modelo hibrido, ni el numero de parametros, capas o cabezas de atencion. Lo unico verificable es su naturaleza multimodal image-text-to-text, con un proyector de vision separado en precision bf16 que se carga junto al checkpoint cuantizado en Q4_K_M.

Tampoco se aportan datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporcionalidad de codigo o multilingue) ni sobre las etapas de alineacion (RLHF, DPO u otras). El paquete Loom no reentrena ni modifica los pesos: se limita a generar kernels y programas de ejecucion para el hardware AMD objetivo mediante `loom-next`, sin LLM en el bucle de generacion. La innovacion tecnica de esta publicacion es, por tanto, de infraestructura (compilacion de kernels especificos para gfx1151 y gfx1201, gestion de pool de memoria fijo, precarga de parametros y espera activa de finalizacion en GPU), no de modelado.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Entrada de imagen: acepta partes `image_url` en el formato de OpenAI, procesadas por el proyector `mmproj-BAAI_AREX-2-bf16.gguf`.
- Tool calling: soporta `tools` y `tool_calls` en estilo OpenAI, incluyendo bucles de agente multi-turno (segun la compuerta `agent` descrita en la model card).
- Modo de razonamiento (thinking): activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Esfuerzo de razonamiento configurable mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Contexto largo: hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales largos.
- Concurrencia de 4 peticiones simultaneas con salida maxima de 4.096 tokens por respuesta.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio (entrada o salida): no soportado.

## Casos de uso

- Asistente documental con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto a una pregunta en texto y responder con el contexto de hasta 262.144 tokens, lo que permite adjuntar documentacion extensa en una sola peticion.
- Analisis de capturas de pantalla en soporte tecnico: integrable en un backend con API OpenAI para que un operador envie una imagen de error y reciba un diagnostico, aprovechando el pipeline image-text-to-text y el modo thinking para razonamientos paso a paso.
- Agente con herramientas en flujos internos: gracias al soporte de `tools`/`tool_calls` y a las compuertas `agent` y `agent_think_off`, puede orquestar llamadas a APIs (busqueda, calculo, consulta a bases de datos) en bucles multi-turno.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto y despliegue sobre una Radeon AI PRO R9700 de 32 GB, es viable resumir o extraer informacion de contratos, informes o expedientes sin enviar datos a la nube.
- Evaluacion de modelos multimodales en hardware AMD: el paquete sirve como banco de pruebas para comparar la salida de Loom frente a la referencia de llama.cpp mediante las compuertas `golden`, `compare` y `vision`.
- Prototipado de asistentes con razonamiento graduable: `reasoning_effort` permite ajustar el coste computacional por consulta (de `low` a `xhigh`) segun la criticidad de la tarea, util en entornos con presupuesto de latencia ajustado.
- Despliegue en estaciones de trabajo con APU Strix Halo: permite ejecutar un modelo multimodal cuantizado en Q4_K_M en un equipo compacto sin GPU dedicada, usando `loom-serve` con pool de memoria fijo y precarga de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no han sido re-medidas" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Del mismo modo, todas las compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia registrada de equivalencia funcional con la referencia de llama.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El paquete esta pensado para la Radeon AI PRO R9700 con 32 GB y para la APU Ryzen AI Max+ 395 "Strix Halo", que comparte memoria del sistema; el checkpoint es Q4_K_M, lo que reduce el footprint frente a precisiones mayores.
- GPUs recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras arquitecturas.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el soporte declarado se limita a los dos dispositivos AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` (variantes `chat` para Strix Halo y `chat-r9700` para R9700) y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.
- Concurrencia maxima declarada: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| loom-draft/bartowski-BAAI_AREX-2-loom (esta ficha) | no disponible | 262.144 tokens | image-text-to-text | Apache 2.0 | `.loom` + GGUF Q4_K_M, runtime `hrx-loom` sobre ROCm | Paquete Loom para gfx1151 y gfx1201; 0 descargas |
| bartowski/BAAI_AREX-2-GGUF (modelo base del paquete) | no disponible | no disponible en la informacion | image-text-to-text | Apache 2.0 (heredada) | GGUF (incluye Q4_K_M) | Disponible en Hugging Face; ejecutable con llama.cpp |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parametros que permitan una comparacion cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de evidencia de correctitud: todas las compuertas de validacion figuran como "not yet re-measured"; no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se han publicado latencias ni throughput para ninguna de las dos GPUs objetivo.
- Repositorio vacio o incompleto: 0 descargas, 0 likes y tamano declarado de 0.0 GB, lo que sugiere que los artefactos pueden no estar materializados.
- Restriccion de hardware: el paquete solo declara soporte para AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se contemplan GPUs NVIDIA, Apple Silicon ni CPU.
- Concurrencia limitada: maximo de 4 peticiones simultaneas y 4.096 tokens de salida por respuesta, lo que restringe su uso en servicios de alta demanda.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad en castellano ni en otras lenguas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse de forma independiente antes de un uso en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original de BAAI y del checkpoint GGUF de bartowski.
- Dependencia de la version del runtime: el quick start fija `hrx-loom[hf]==0.2.0`; cambios de version pueden alterar el comportamiento.
- Sin decodificacion especulativa: la feature figura como "not applicable", por lo que no cabe esperar aceleraciones por esa via.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-BAAI_AREX-2-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/BAAI_AREX-2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
