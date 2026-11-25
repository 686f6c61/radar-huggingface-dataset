# loom-draft/lmstudio-community-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF cuantizado `Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Q4_K_M.gguf`, publicado originalmente por `lmstudio-community` a partir del modelo Nemotron-3 Nano Omni de NVIDIA. El paquete lo genera `loom-draft` con la herramienta `loom-next` (generador automático, sin LLM en el bucle) y está orientado a su ejecución en GPUs AMD: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés técnico reside en que Loom compila kernels específicos para arquitecturas AMD ROCm y expone el modelo mediante una API compatible con OpenAI (`/v1/chat/completions`), con soporte de razonamiento (thinking) activado por defecto, ventana de contexto de 262.144 tokens por petición y hasta 4 peticiones concurrentes. El modelo subyacente es un transformer con mezcla de expertos (MoE) de 30B parámetros totales y 3B activos, según indica el propio nombre del checkpoint.

La relevancia es acotada pero concreta: ofrece una vía de servir un modelo MoE de razonamiento de 30B en hardware AMD de consumo y profesional, sin depender de CUDA. No obstante, la model card indica explícitamente que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, etc.) aún no se han vuelto a medir para este paquete, por lo que su validación está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el nombre del checkpoint base; detalles internos no disponibles |
| Parametros totales | 30B (según nombre del checkpoint) |
| Parametros activos | 3B (según nombre del checkpoint) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones concretas no disponibles) |
| Formato de pesos | GGUF (checkpoint base) empaquetado en formato `.loom` (programas `.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no aplicable en este paquete |
| Decodificación especulativa | no aplicable en este paquete |
| Entrada de imagen | no soportada por Loom (el modelo upstream sí la tiene) |
| Entrada/salida de audio | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Versión de runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyante. Por el nombre del checkpoint base se deduce una arquitectura transformer con mezcla de expertos de 30B parámetros totales y 3B activos, con capacidad de razonamiento explícito (modo thinking) y, en el modelo upstream, entrada de imagen. Los detalles sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO o innovaciones de atención no están disponibles en la información proporcionada.

Lo que sí describe la model card es la capa de despliegue: Loom genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 y los empaqueta junto con un `model.json` que define el preset de ejecución. El servidor `loom-serve` admite opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (reserva del pool de memoria por adelantado) y `--parameter_mode=preload` (carga anticipada de pesos en host). El modo de razonamiento se controla con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explícito (thinking) activado por defecto, desactivable por petición.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Hasta 4 peticiones concurrentes con consistencia verificable (puerta `consistency`).
- Muestreo configurable (temperatura, top_k, semilla) según la puerta `sampling`, aunque el estado de dicha puerta figura como «not yet re-measured».
- Lectura de logits en host (`llm.logits`) para inspección y decisiones.
- Tool calling: no disponible en este paquete (marcado como «not applicable»).
- Decodificación especulativa: no disponible en este paquete.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene.
- Audio: no disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo AMD: el paquete se sirve con `loom-serve` sobre una Radeon AI PRO R9700 o una APU Strix Halo y expone `/v1/chat/completions`, lo que permite integrarlo en clientes compatibles con OpenAI sin reescribir la capa de aplicación.
- Análisis de documentos extensos: con 262.144 tokens de contexto por petición, es viable cargar contratos, informes o bases de código completas y formular preguntas sobre ellos en una sola interacción.
- Razonamiento paso a paso en tareas técnicas: el modo thinking activado por defecto resulta adecuado para depuración de problemas, explicación de algoritmos o resolución de problemas matemáticos, y puede desactivarse cuando se prioriza latencia.
- Evaluación de hardware AMD para inferencia: sirve como banco de pruebas para medir el rendimiento de Loom frente a llama.cpp en gfx1151 y gfx1201, comparando tokens generados y latencia por petición.
- Despliegue en entornos sin CUDA: organizaciones con infraestructura AMD pueden servir un MoE de 30B en GPUs de 32 GB sin depender de NVIDIA.
- Prototipado de pipelines con lectura de logits: la opción `llm.logits` permite construir clasificadores o selectores de respuesta basados en probabilidades del modelo, útil en sistemas de decisión.
- Atención al cliente interna con concurrencia moderada: las 4 peticiones simultáneas y la API estándar permiten montar un servicio de soporte para equipos pequeños, siempre que se acepte la ausencia de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 30B, y el paquete está dirigido a GPUs de 32 GB (Radeon AI PRO R9700) y a la APU Strix Halo con memoria unificada.
- GPUs soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no contempladas en este paquete, que genera kernels para arquitecturas AMD ROCm.
- Despliegue: `loom-fetch` para descargar el paquete desde Hugging Face y `loom-serve` para servirlo; requiere `pipx install "hrx-loom[hf]==0.2.0"`.
- Opciones de servidor: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento del paquete aún no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Nemotron-3-Nano-Omni-30B-A3B-Reasoning, Loom) | 30B totales / 3B activos | 262.144 tokens | `.loom` (GGUF Q4_K_M) | other | Solo AMD gfx1151 y gfx1201; sin tool calling ni visión en Loom |
| lmstudio-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF | 30B totales / 3B activos | no disponible | GGUF | other | Checkpoint base sin empaquetar; ejecutable con llama.cpp y derivados |
| llama.cpp (referencia de ejecución) | no aplica | según modelo | GGUF | MIT (runtime) | Referencia usada por Loom para las puertas `golden` y `compare`; soporte AMD vía ROCm |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Las mediciones de rendimiento y las puertas de corrección de este paquete no se han vuelto a medir; no hay garantía publicada de equivalencia con llama.cpp para esta build concreta.
- Tool calling no soportado en este paquete, lo que limita su uso en agentes y pipelines que dependan de funciones.
- Entrada de imagen no soportada por Loom, pese a que el modelo upstream sí la ofrece.
- Decodificación especulativa no disponible, lo que puede penalizar el throughput frente a configuraciones que sí la habilitan.
- Solo se distribuye en cuantización Q4_K_M; no se ofrecen otras precisiones en este paquete.
- Hardware restringido a AMD gfx1151 y gfx1201; no es portable a CUDA ni a otras GPUs sin regenerar el paquete.
- Licencia «other» heredada del modelo base: es necesario revisar las condiciones del checkpoint original antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe adecuado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- El paquete registra 0 descargas y 0 «likes», por lo que no existe validación comunitaria de su funcionamiento.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/lmstudio-community-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-loom
- Checkpoint base en Hugging Face: https://huggingface.co/lmstudio-community/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
