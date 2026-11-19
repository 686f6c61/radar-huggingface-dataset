# loom-draft/mradermacher-RusMind-Sokol-4.7-i1-loom

## Resumen

RusMind-Sokol-4.7-i1 en formato Loom es un paquete de despliegue generado por la herramienta `loom-next` para ejecutar el checkpoint GGUF cuantizado `RusMind-Sokol-4.7.i1-Q4_K_M.gguf` sobre GPUs de AMD. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del GGUF original publicado por mradermacher, empaquetados junto con programas `.loom` y una tarjeta `model.json` que permiten servirlos a través de `loom-serve` con una API compatible con OpenAI. El repositorio lo publica el usuario `loom-draft` dentro del ecosistema Loom.

El interés del paquete es de infraestructura más que de modelado: ofrece una vía de inferencia nativa para hardware AMD concreto, la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB), sin depender de llama.cpp. El modelo subyacente, RusMind-Sokol-4.7, es un modelo de aproximadamente 4.700 millones de parámetros (según la nomenclatura del checkpoint) con soporte de razonamiento opcional y tool calling, aunque la información disponible no detalla su arquitectura interna ni sus datos de entrenamiento.

La relevancia es acotada pero concreta: para equipos que ya operan hardware AMD y quieren servir un modelo compacto con ventana de contexto de 262.144 tokens y hasta 4 peticiones concurrentes mediante una API estándar. No hay métricas de rendimiento publicadas para este paquete concreto, ya que la propia model card indica que los resultados «aún no se han vuelto a medir».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no publicado) |
| Parametros totales | aproximadamente 4,7 mil millones (deducido del nombre del checkpoint; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no detalladas en este paquete |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | GGUF empaquetado como programas Loom (`program/*.loom`, `weights.loom`) con tarjeta `model.json` |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura del modelo original: la model card se centra en el formato de despliegue Loom y no describe la red neuronal, el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Lo único verificable es que se parte del checkpoint `RusMind-Sokol-4.7.i1-Q4_K_M.gguf` de mradermacher, sin modificaciones («unmodified GGUF checkpoint»), y que el empaquetado se generó con `loom-next`, el generador, sin ningún LLM en el bucle.

La innovación técnica del repositorio es el propio formato Loom: los kernels de inferencia se generan como programas `.loom` específicos para las arquitecturas AMD gfx1151 y gfx1201, y se sirven con `loom-serve` usando un pool de memoria fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La model card menciona gates de corrección (kernel_tests, golden, compare, consistency, agent, sampling, logits, decision) que comparan la salida con una referencia de llama.cpp, pero para este paquete todos aparecen como «not yet re-measured», es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional mediante API OpenAI-style `/v1/chat/completions`.
- Razonamiento o modo «thinking» activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling con formato OpenAI (`tools` y `tool_calls`), lo que habilita bucles de agente multi-turno.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (marcado como «not applicable»).
- Sin decodificación especulativa («not applicable»).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: con `loom-serve` se expone un endpoint compatible con OpenAI que cualquier cliente existente puede consumir, sin reescribir integraciones.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir contratos, informes o transcripciones completas en una sola petición, útil para resumen y extracción de datos.
- Agentes con herramientas en local: el soporte de `tool_calls` permite construir asistentes que consulten APIs internas, bases de datos o sistemas de ficheros sin enviar datos a la nube.
- Razonamiento paso a paso para tareas analíticas: el modo thinking por defecto es adecuado para problemas que requieren descomposición, y puede desactivarse para respuestas rápidas de baja latencia.
- Prototipado en hardware Radeon AI PRO R9700: con 32 GB de VRAM y un modelo Q4_K_M de ~4,7B, el paquete permite validar pipelines de IA generativa en infraestructura AMD antes de escalar.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir `loom-serve` frente a llama.cpp con el mismo GGUF, gracias a los gates de corrección definidos (golden, compare, logits).
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en hardware local con pesos abiertos, encaja en escenarios donde no se permite salida a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y todos los gates de corrección figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: un Q4_K_M de ~4,7B ocupa del orden de 3 GB de pesos, pero el contexto de 262.144 tokens requiere una caché KV considerable; el cálculo exacto no está disponible en la información proporcionada.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPUs NVIDIA ni con GPU de consumo AMD distintas de las indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las mediciones están pendientes de repetir.
- El modo `--pool_backing=fixed` reserva el pool de memoria por adelantado, lo que exige planificar la memoria disponible antes del arranque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| RusMind-Sokol-4.7-i1 (paquete Loom) | ~4,7B | 262.144 | Loom/GGUF | other | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| RusMind-Sokol-4.7-i1-GGUF (mradermacher) | ~4,7B | no disponible | GGUF | other | Checkpoint de origen; ejecutable con llama.cpp |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría; cualquier cifra sería inventada.

## Limitaciones y advertencias

- No hay evidencia de corrección registrada: todos los gates (kernel_tests, golden, compare, consistency, agent, sampling, logits, decision) figuran como no medidos, por lo que la fidelidad frente a llama.cpp no está verificada para este paquete.
- Compatibilidad de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPU.
- Licencia «other»: las condiciones exactas de uso comercial no se detallan en la información disponible y deben consultarse en el repositorio del modelo base.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación propia.
- Tamaño del repositorio de 0.0 GB en el momento de la consulta, lo que sugiere que los artefactos podrían no estar completamente subidos o que la metadata no refleja el contenido real.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este modelo.
- Límite de 4.096 tokens de salida por petición y 4 peticiones concurrentes, insuficiente para cargas de producción de alta demanda.
- El contexto de 262.144 tokens puede no ser alcanzable en la práctica según la memoria disponible en cada GPU.
- El paquete se generó automáticamente con `loom-next` sin LLM en el bucle; conviene auditar los programas `.loom` antes de usarlos en producción.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/mradermacher-RusMind-Sokol-4.7-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/RusMind-Sokol-4.7-i1-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime HRX/ROCm referenciado en la model card: https://github.com/ROCm/hrx-system
