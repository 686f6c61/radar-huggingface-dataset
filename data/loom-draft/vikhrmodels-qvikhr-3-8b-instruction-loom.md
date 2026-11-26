# loom-draft/Vikhrmodels-QVikhr-3-8B-Instruction-loom

## Resumen

Este repositorio no contiene un modelo entrenado, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado automáticamente a partir del checkpoint GGUF `QVikhr-3-8B-Instruction-Q4_K_M.gguf` de Vikhrmodels. El autor del paquete es `loom-draft` y el generador empleado es `loom-next`, sin intervención de un LLM en el proceso. El objetivo es permitir la ejecución del modelo en GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, QVikhr-3-8B-Instruction, es un ajuste fino de instrucciones de aproximadamente 8 000 millones de parámetros, distribuido originalmente en cuantización Q4_K_M. El paquete Loom lo expone mediante un servidor compatible con la API de OpenAI (`/v1/chat/completions`), con soporte de tool calling y modo de razonamiento activado por defecto. La relevancia actual reside en que ofrece una vía de despliegue nativo para hardware AMD fuera del ecosistema CUDA, un nicho con pocas alternativas maduras.

La información publicada es escasa: no hay benchmarks propios, las mediciones de rendimiento frente a llama.cpp figuran como "not yet re-measured" y la model card no documenta idiomas, composición del dataset ni detalles de entrenamiento. Todo lo que sigue se limita a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~8B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | ~8 000 millones (deducido del nombre "8B") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40 960 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no describe la arquitectura del modelo subyacente: no se especifica si es un transformer denso, MoE o híbrido, ni se detallan capas, dimensión oculta o mecanismo de atención. Lo único documentado es el formato de distribución: un GGUF cuantizado en Q4_K_M, empaquetado por `loom-next` en programas `.loom` que compilan kernels específicos para las arquitecturas AMD gfx1151 y gfx1201. Los pesos no se modifican ("unmodified GGUF checkpoint").

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni si hubo RLHF o DPO. La model card menciona un modo de razonamiento ("thinking") activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que sugiere que el ajuste de instrucciones incluyó entrenamiento con trazas de razonamiento, pero no se aportan detalles. La innovación técnica del repositorio es de despliegue, no de modelado: kernels generados automáticamente, pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`).

## Capacidades

- Generación de texto conversacional mediante API estilo OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema `tools` / `tool_calls` de OpenAI.
- Modo de razonamiento (thinking) activado por defecto; se desactiva por petición.
- Gestión de contexto largo: hasta 40 960 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Límite de salida de 4 096 tokens por respuesta (preset `max_tokens`).
- Sin decodificación especulativa ("not applicable").
- Sin entrada de imagen ni audio ("not applicable").
- Capacidades multilingües: no documentadas.
- Parámetros de muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de características.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el servidor Loom expone un endpoint compatible con OpenAI, de modo que herramientas existentes (clientes, SDKs, frameworks de agentes) pueden apuntar a `http://127.0.0.1:8080` sin cambios de código.
- Automatización de agentes con tool calling: el soporte de `tools`/`tool_calls` y la ventana de 40 960 tokens permiten cadenas multi-turno con historial extenso y llamadas a funciones externas, con cuatro peticiones concurrentes para pequeños equipos.
- Procesamiento de documentos largos: con casi 41k tokens de contexto se pueden resumir o extraer información de contratos, informes o transcripciones de decenas de páginas en una sola petición.
- Evaluación de hardware AMD para inferencia LLM: el paquete sirve como banco de pruebas reproducible en Strix Halo y R9700, con comandos de arranque fijados y verificación de integridad por sha256 en `loom-fetch`.
- Prototipado en entornos sin CUDA: equipos que trabajan exclusivamente con ROCm pueden desplegar un modelo de 8B cuantizado sin depender de llama.cpp ni de capas de traducción adicionales.
- Razonamiento paso a paso en tareas de análisis: el modo thinking por defecto resulta adecuado para depuración de lógica, explicación de código o resolución de problemas matemáticos, desactivándolo cuando se prioriza latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y R9700 "are not yet re-measured", y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- GPUs objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de ~8B ocupa del orden de 4-5 GB de pesos, pero el paquete reserva un pool de memoria fijo cuyo tamaño no se documenta.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; las dos plataformas soportadas son hardware AMD específico (APU Strix Halo y GPU profesional R9700).
- Despliegue: exclusivamente mediante `hrx-loom[hf]==0.2.0` (`loom-fetch` para descarga y `loom-serve` para servicio). No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas para este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.
- Concurrencia soportada: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| QVikhr-3-8B-Instruction (paquete Loom) | ~8B | 40 960 | Q4_K_M | MIT | Loom sobre AMD gfx1151/gfx1201 |
| Vikhrmodels/QVikhr-3-8B-Instruction-GGUF (original) | ~8B | no disponible | Q4_K_M | MIT (según este paquete) | llama.cpp y compatibles GGUF |
| Alternativas de ~8B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el propio checkpoint original: el paquete Loom ejecuta los mismos pesos sin modificarlos, y la model card prevé comparar su salida token a token contra la referencia de llama.cpp, aunque esas pruebas aún no se han registrado. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Paquete de despliegue, no modelo nuevo: cualquier limitación del checkpoint QVikhr-3-8B-Instruction se hereda sin cambios.
- Ausencia total de benchmarks y de puertas de correctitud registradas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin datos sobre sesgos, alucinación o calidad multilingüe; la model card no documenta idiomas.
- Compatibilidad restringida a dos plataformas AMD (gfx1151 y gfx1201); no se garantiza funcionamiento en otras GPUs, incluidas las de consumo.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de un generador externo (`loom-next`).
- El modo de razonamiento está activado por defecto, lo que incrementa el consumo de tokens de salida si no se desactiva explícitamente.
- Límite de 4 peticiones concurrentes y de 4 096 tokens de salida por respuesta, insuficiente para cargas de producción de alta concurrencia o generaciones muy largas.
- Los parámetros de muestreo figuran como "no determinados", lo que impide garantizar reproducibilidad.
- Licencia MIT según la model card del paquete; conviene verificar la licencia del checkpoint base antes de uso comercial.
- Repositorio sin descargas ni "likes" y creado recientemente: no hay evidencia de uso en producción.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/Vikhrmodels-QVikhr-3-8B-Instruction-loom
- Checkpoint base (GGUF): https://huggingface.co/Vikhrmodels/QVikhr-3-8B-Instruction-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
