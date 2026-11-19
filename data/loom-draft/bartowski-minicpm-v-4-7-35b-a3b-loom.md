# loom-draft/bartowski-MiniCPM-V-4.7-35B-A3B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y un `model.json`) generado por `loom-next` a partir del checkpoint GGUF cuantizado en Q4_K_M `bartowski/MiniCPM-V-4.7-35B-A3B-GGUF`. El autor del paquete es el usuario `loom-draft`, y su objetivo es permitir servir el modelo MiniCPM-V 4.7 (35B totales, 3B activos, arquitectura MoE) sobre GPUs AMD concretas: la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporta tool calling y modo de razonamiento, con una ventana de contexto de 262.144 tokens por petición y hasta 4 peticiones concurrentes. Es relevante porque demuestra la viabilidad de ejecutar un modelo multimodal MoE de 35B en hardware AMD consumer y profesional mediante un runtime alternativo a llama.cpp, aunque en el momento de la publicación las mediciones de rendimiento y las puertas de corrección aún no se han vuelto a medir.

Conviene subrayar que el modelo subyacente es MiniCPM-V 4.7, desarrollado por OpenBMB, y que este repositorio es únicamente un artefacto de empaquetado y servicio. La información disponible sobre arquitectura, entrenamiento y benchmarks del modelo original es escasa en esta ficha; se detalla lo que consta y se marca como no disponible lo que no.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer; detalles finos no disponibles |
| Parametros totales | 35B |
| Parametros activos | 3B (según el identificador A3B) |
| Longitud de contexto | 262.144 tokens por petición (según el paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del repo base no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), empaquetado en artefactos Loom |
| Concurrencia | 4 peticiones simultáneas |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Entrada de imagen | No soportada por Loom (el modelo original sí la soporta) |
| Tool calling | Sí, estilo OpenAI (`tools` / `tool_calls`) |
| Modo razonamiento | Sí, activado por defecto; desactivable con `enable_thinking: false` |
| Decodificación especulativa | No aplicable en este paquete |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo subyacente, MiniCPM-V 4.7 35B-A3B, es un transformer con mezcla de expertos (MoE) de 35.000 millones de parámetros totales y 3.000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación; estos datos deben consultarse en la model card del repositorio base `bartowski/MiniCPM-V-4.7-35B-A3B-GGUF` o en la del modelo original de OpenBMB.

El paquete Loom en sí no modifica los pesos: toma el GGUF Q4_K_M sin alteraciones y genera kernels y programas de servicio específicos para las arquitecturas AMD gfx1151 y gfx1201. Incluye un `model.json` con los ficheros fuente fijados por hash SHA-256, verificado por `loom-fetch`. Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) están definidas pero marcadas como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia publicada de equivalencia numérica con la referencia de llama.cpp.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI, con soporte de `tools` y `tool_calls` en la API.
- Flujos agénticos multiturno con reutilización de historial (según la puerta `agent` definida, aunque sin medición publicada).
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`).
- Multimodalidad de imagen no disponible en este paquete Loom, aunque el modelo original la soporta.
- Entrada y salida de audio no aplicable.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de documentación técnica: con 262.144 tokens de contexto se pueden cargar manuales completos o bases de código extensas y formular preguntas sobre ellos sin truncar el material.
- Automatización de soporte con herramientas: el soporte de tool calling permite conectar el modelo a APIs internas (consulta de pedidos, estado de tickets) en un bucle agéntico multiturno.
- Análisis de repositorios de código: el contexto largo y el modo de razonamiento facilitan tareas de revisión, explicación y generación de parches sobre ficheros extensos.
- Procesamiento por lotes en estación de trabajo AMD: con una Radeon AI PRO R9700 de 32 GB se puede servir el modelo Q4_K_M localmente para tareas de extracción y resumen sin depender de la nube.
- Prototipado de agentes en hardware consumer: la Ryzen AI Max+ 395 permite ejecutar un MoE de 35B en un equipo integrado, útil para desarrollar y depurar flujos agénticos antes de desplegarlos.
- Evaluación de runtimes alternativos: sirve como banco de pruebas para comparar Loom frente a llama.cpp en términos de corrección y rendimiento sobre GPUs AMD.
- Generación de código asistida en local: el modelo puede integrarse en un servidor compatible con OpenAI y consumirse desde editores o pipelines de CI/CD que esperen ese contrato de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Tampoco hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones del modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint Q4_K_M de un modelo de 35B totales ronda los 20 GB de pesos, aunque la cifra exacta no consta en la información.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs consumer: no confirmada; el paquete está generado específicamente para las dos arquitecturas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Opciones alternativas como vLLM, llama.cpp, Ollama o TGI no están documentadas para este paquete concreto.
- Latencia y throughput: no disponibles; las tablas de rendimiento del autor están pendientes de remedición.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (este paquete Loom) | 35B | 3B | 262.144 | Apache 2.0 | GGUF Q4_K_M empaquetado para AMD Loom |
| MiniCPM-V 4.7 35B-A3B (repo base bartowski) | 35B | 3B | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este paquete y otras implementaciones del mismo modelo, ni con modelos de la misma categoría, en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un artefacto de despliegue, no un modelo entrenado; cualquier evaluación de calidad debe remitirse al modelo base MiniCPM-V 4.7.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`, etc.) figuran como "not yet re-measured": no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- La entrada de imagen no está soportada por Loom, pese a que el modelo original es multimodal; esto limita los casos de uso visuales.
- El paquete está restringido a dos arquitecturas AMD concretas (gfx1151 y gfx1201); no se garantiza su funcionamiento en otras GPUs.
- El repositorio tiene 0 descargas y 0 "likes", y un tamaño de 0,0 GB en el momento del registro, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es muy reciente.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de OpenBMB.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican las advertencias habituales de los modelos de lenguaje.
- Los resultados de búsqueda web devueltos corresponden a servicios homónimos (Loom.com, Loom.fr) sin relación con este paquete; no aportan información técnica adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-MiniCPM-V-4.7-35B-A3B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/MiniCPM-V-4.7-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
