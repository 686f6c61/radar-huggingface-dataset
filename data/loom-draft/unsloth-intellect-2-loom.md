# loom-draft/unsloth-INTELLECT-2-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) para el checkpoint GGUF `INTELLECT-2-Q4_K_M.gguf` de `unsloth/INTELLECT-2-GGUF`. Lo publica el usuario `loom-draft` y está generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación. El objetivo es servir INTELLECT-2 cuantizado en Q4_K_M sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia es de infraestructura, no de modelado: ofrece una ruta de inferencia nativa para ROCm/AMD con API compatible con OpenAI, soporte de tool calling y modo de razonamiento siempre activo. El paquete fija un contexto de 32.768 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida. No se han publicado resultados de rendimiento ni de corrección para este paquete: todas las puertas de validación aparecen como "not yet re-measured".

La licencia del paquete es Apache 2.0. La model card no declara idiomas soportados ni parámetros del modelo base; esos datos deben consultarse en el repositorio de INTELLECT-2 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint INTELLECT-2; el paquete Loom solo contiene programas de inferencia generados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen; empaquetado como programas Loom (`program/*.loom`, `weights.loom`) más `tokenizer.json`, `llm_config.json` e `info.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | si, estilo OpenAI (`tools` / `tool_calls`) |
| Modo razonamiento | siempre activo |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no |
| Entrada/salida de audio | no |
| Muestreo (sampling) | no determinado |
| GPUs objetivo | Ryzen AI Max+ 395 "Strix Halo" (gfx1151); Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no redefine el modelo: reutiliza el checkpoint GGUF `INTELLECT-2-Q4_K_M.gguf` sin modificarlo y genera, mediante `loom-next`, kernels y programas Loom específicos para las arquitecturas AMD gfx1151 y gfx1201. La model card no documenta la arquitectura interna del transformer subyacente, el número de parámetros, los datos de entrenamiento ni si hubo RLHF o DPO; esa información corresponde al repositorio original de INTELLECT-2.

La innovación técnica está en la capa de despliegue: kernels generados y verificados contra implementaciones de referencia, comprobaciones de corrección por puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) y un modo de espera activa en GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo. Ninguna de estas puertas tiene medición registrada para este paquete en el momento de la publicación.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI.
- Razonamiento en modo "thinking" siempre activado; no hay control de esfuerzo de razonamiento (`reasoning effort` no aplicable).
- Tool calling estilo OpenAI con `tools` y `tool_calls`, apto para bucles agénticos de varios turnos.
- Contexto de 32.768 tokens por petición, suficiente para documentos medios y conversaciones multi-turno largas.
- Hasta 4 peticiones concurrentes con la garantía declarada de que la salida concurrente coincide con la ejecución individual (puerta `consistency`, sin medición registrada).
- Sin visión, sin audio y sin decodificación especulativa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estación de trabajo AMD: servir el paquete con `loom-serve` sobre Strix Halo o R9700 y consumirlo desde un cliente compatible con OpenAI, sin depender de CUDA ni de servicios en la nube.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el modo de razonamiento permiten construir bucles de varios pasos (consulta de APIs internas, ejecución de comandos, resumen de resultados) sobre hardware AMD de sobremesa.
- Procesamiento de documentos de hasta 32k tokens: resumen, extracción de entidades y preguntas sobre informes técnicos o contratos que quepan en la ventana de contexto.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas `golden` y `compare` diseñadas para cotejar token a token la salida con la referencia de llama.cpp sobre el mismo GGUF, útil para validar la fidelidad de un backend alternativo.
- Laboratorio de portabilidad ROCm: banco de pruebas para medir kernels generados en gfx1151 y gfx1201 y detectar regresiones numéricas antes de adoptar Loom en producción.
- Prototipado de asistentes de código con razonamiento: útil para explicar fragmentos, proponer refactorizaciones y encadenar llamadas a herramientas de compilación o test, siempre que se acepte el contexto de 32k y el límite de 4k tokens de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No hay cifras de latencia, throughput ni calidad que puedan citarse.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible en la información proporcionada; el paquete está pensado para ejecutarse con `--pool_backing=fixed`, que reserva el pool de memoria por adelantado.
- GPUs NVIDIA: no soportadas por este paquete (orientado a ROCm/AMD).
- Cabe en GPU de consumo: no confirmado; la R9700 es una GPU profesional de 32 GB y Strix Halo es una APU con memoria unificada, no una gráfica de consumo convencional.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card están pendientes de remedición.

## Comparativa con modelos similares

| Criterio | Este paquete (Loom, INTELLECT-2 Q4_K_M) | llama.cpp con el mismo GGUF | vLLM con pesos completos |
|---|---|---|---|
| Formato | Programas Loom + GGUF empaquetado | GGUF | safetensors |
| Hardware | AMD gfx1151 / gfx1201 | CPU, CUDA, ROCm, Metal | NVIDIA principalmente |
| Contexto por petición | 32.768 tokens | Configurable según build | Configurable |
| Tool calling | Sí, estilo OpenAI | Depende de la build y del servidor | Sí |
| Concurrencia | 4 peticiones | Depende de la configuración | Alta, con continuous batching |
| Rendimiento medido | No publicado | Referencia usada por las puertas del paquete | No disponible |
| Licencia | Apache 2.0 | Según implementación | Según implementación |

No se dispone de datos de rendimiento de este paquete frente a esas alternativas; la comparación es funcional, no cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evidencia de corrección: las puertas `kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits` y `decision` figuran como no remedidas, por lo que no hay garantía publicada de que la salida coincida con llama.cpp.
- Sin cifras de rendimiento: no se puede estimar latencia ni throughput a partir de la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación por parte de la comunidad.
- Contexto limitado a 32.768 tokens por petición y salida máxima de 4.096 tokens, insuficiente para tareas de contexto muy largo.
- Concurrencia baja (4 peticiones), no apta para servicio de alta demanda sin escalado horizontal.
- Sin visión, sin audio y sin decodificación especulativa.
- Idiomas soportados no declarados; no se puede asumir un rendimiento multilingüe concreto.
- Dependencia de una versión concreta de la herramienta (`hrx-loom[hf]==0.2.0`) y de las arquitecturas AMD gfx1151/gfx1201; el soporte en otras GPUs no está documentado.
- La licencia Apache 2.0 del paquete no exime de verificar la licencia y las condiciones del checkpoint INTELLECT-2 original antes de un uso comercial.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-INTELLECT-2-loom
- Checkpoint base en GGUF: https://huggingface.co/unsloth/INTELLECT-2-GGUF
- Generador Loom: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Sistema ROCm HRX referenciado en la model card: https://github.com/ROCm/hrx-system
