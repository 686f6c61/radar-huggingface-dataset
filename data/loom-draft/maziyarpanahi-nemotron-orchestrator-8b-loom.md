# loom-draft/MaziyarPanahi-Nemotron-Orchestrator-8B-loom

## Resumen

MaziyarPanahi-Nemotron-Orchestrator-8B-loom es un paquete de despliegue distribuido por el usuario `loom-draft` para el ecosistema Loom, un runtime de inferencia orientado a GPUs AMD. No se trata de un modelo entrenado por este autor, sino de un empaquetado (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF sin modificar `MaziyarPanahi/Nemotron-Orchestrator-8B-GGUF`, en su variante `Nemotron-Orchestrator-8B.Q4_K_M.gguf`. El paquete se genera con la herramienta `loom-next` y esta dirigido especificamente a dos aceleradores: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Nemotron-Orchestrator de 8.000 millones de parametros, orientado a orquestacion de agentes y tool calling, del que este repositorio solo aporta la capa de ejecucion. La relevancia practica del paquete reside en que ofrece una via de servicio con API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y modo de razonamiento, sobre hardware AMD que habitualmente queda fuera del circuito CUDA.

La informacion publicada es escasa: el repositorio no incluye pipeline declarado, no lista idiomas y no presenta mediciones de rendimiento ni de correccion para este paquete concreto (todas las puertas de validacion aparecen como "not yet re-measured"). Cualquier dato de arquitectura interna, dataset de entrenamiento o benchmarks del modelo base debe consultarse en el repositorio original de Nemotron, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron-Orchestrator de 8B; detalles internos no publicados en este repositorio) |
| Parametros totales | 8.000 millones (8B, segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras variantes no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo: es un paquete de despliegue generado por `loom-next` a partir del GGUF `Nemotron-Orchestrator-8B.Q4_K_M.gguf` sin alteraciones. Por tanto, la arquitectura efectiva es la del checkpoint Nemotron-Orchestrator-8B original, que no se detalla en la model card de este paquete. Lo que si se describe es la capa de ejecucion: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y carga de pesos en modo `preload`.

El paquete expone un modo de razonamiento ("thinking") activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, y soporta plantillas de chat con historial reutilizado en bucles de tool calling. No implementa decodificacion especulativa (marcada como "not applicable"), ni entrada de imagen o audio. La model card incluye un conjunto de puertas de validacion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) disenadas para comparar la salida contra llama.cpp sobre el mismo GGUF, pero ninguna de ellas tiene medicion registrada para este paquete.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si el modelo base paso por RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con renderizado exacto del prompt y reutilizacion de historial en bucles de agente.
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion.
- Razonamiento multi-paso y orquestacion de agentes (el nombre del modelo base asi lo sugiere; no se documenta en detalle en este repositorio).
- Concurrencia de hasta 4 peticiones simultaneas con consistencia declarada frente a ejecuciones aisladas.
- Contexto de 40.960 tokens por peticion, adecuado para documentos largos y conversaciones extensas.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Sin soporte de vision, audio ni decodificacion especulativa.

## Casos de uso

- Orquestacion de agentes sobre hardware AMD: el paquete permite servir un modelo con tool calling en Strix Halo o R9700 sin depender de CUDA, usando `loom-serve` con API compatible con OpenAI. Es adecuado para equipos que ya trabajan con el stack ROCm y quieren evitar reescribir integraciones.
- Asistente de codigo en estaciones de trabajo locales: con 40.960 tokens de contexto y salida de hasta 4.096 tokens, puede mantener conversaciones largas sobre un repositorio y generar parches o explicaciones sin salir del equipo.
- Automatizacion de atencion al cliente multi-turno: el soporte de historial reutilizado y tool calling permite conectar el modelo a sistemas de ticketing o consulta de pedidos mediante funciones expuestas como `tools`.
- Prototipado de pipelines agenticos en un solo acelerador: los 8B en Q4_K_M caben en la memoria unificada del Ryzen AI Max+ 395 y en los 32 GB de la R9700, lo que permite levantar un entorno de pruebas completo en una maquina.
- Procesamiento de documentos largos: el contexto de 40.960 tokens permite resumir contratos, informes o transcripciones en una sola peticion, con el modo thinking activado para tareas de analisis.
- Evaluacion comparativa de runtimes AMD: las puertas de validacion del paquete (`golden`, `compare`, `agent`, `sampling`) estan pensadas para contrastar la salida de Loom contra llama.cpp sobre el mismo GGUF, util para equipos que validan motores de inferencia.
- Generacion asistida con razonamiento explicito: para tareas de planificacion o descomposicion de problemas, el modo thinking por defecto puede activarse o desactivarse segun el coste de latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion aparecen sin ejecucion registrada ("not yet re-measured").

| Puerta de validacion | Strix Halo (gfx1151) | Radeon AI PRO R9700 (gfx1201) |
|---|---|---|
| `kernel_tests` | sin medicion | sin medicion |
| `golden` | sin medicion | sin medicion |
| `compare` | sin medicion | sin medicion |
| `consistency` | sin medicion | sin medicion |
| `agent` / `agent_think_off` | sin medicion | sin medicion |
| `sampling` | sin medicion | sin medicion |
| `logits` | sin medicion | sin medicion |
| `decision` | sin medicion | sin medicion |

## Requisitos de hardware

- VRAM estimada: un modelo de 8B en Q4_K_M ocupa aproximadamente 5 GB de pesos; el paquete usa un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamano exacto no se publica. Como referencia de plataforma, la R9700 dispone de 32 GB y el Ryzen AI Max+ 395 emplea memoria unificada.
- GPUs objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se declara soporte para GPUs NVIDIA ni para otras Radeon.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el paquete esta acotado a los dos aceleradores anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de servicio para este paquete (llama.cpp solo aparece como referencia de comparacion en las puertas de validacion).
- Opciones de servicio: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de este paquete ni de alternativas comparables, y no se declaran modelos de referencia mas alla del checkpoint base `MaziyarPanahi/Nemotron-Orchestrator-8B-GGUF` y de llama.cpp como motor de contraste en las pruebas de correccion.

## Limitaciones y advertencias

- Ausencia total de mediciones: rendimiento y correccion figuran como "not yet re-measured" para ambas GPUs, por lo que no hay evidencia publicada de que la salida coincida con llama.cpp en este paquete.
- Alcance de hardware muy restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para otras GPUs AMD ni para NVIDIA.
- Idioma no declarado: no se especifican idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin evaluacion propia.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad; al ser un modelo de 8B en cuantizacion Q4_K_M, la precision puede degradarse frente a pesos de mayor precision.
- Limites operativos fijos: contexto de 40.960 tokens por peticion, salida maxima de 4.096 tokens y solo 4 peticiones concurrentes; insuficiente para cargas de alta concurrencia.
- Sin vision, audio ni decodificacion especulativa, lo que descarta casos de uso multimodal y limita las optimizaciones de latencia.
- Licencia MIT declarada en este repositorio, pero conviene verificar la licencia del checkpoint base y de Nemotron antes de un uso comercial en produccion.
- El paquete se genera con `loom-next` sin LLM en el bucle y depende de la version `hrx-loom==0.2.0`; cambios de version del runtime pueden afectar a la reproducibilidad.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/MaziyarPanahi-Nemotron-Orchestrator-8B-loom
- Checkpoint GGUF base: https://huggingface.co/MaziyarPanahi/Nemotron-Orchestrator-8B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
