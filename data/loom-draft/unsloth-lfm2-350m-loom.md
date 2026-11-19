# loom-draft/unsloth-LFM2-350M-loom

## Resumen

LFM2-350M-loom es un paquete de despliegue en formato Loom (`.loom`) que empaqueta el checkpoint GGUF sin modificar `unsloth/LFM2-350M-GGUF` (concretamente el fichero `LFM2-350M-Q4_K_M.gguf`) para su ejecución en GPUs AMD mediante el runtime `loom-serve`. Lo publica el usuario `loom-draft` y se genera con la herramienta `loom-next`, un generador de programas Loom que no emplea ningún LLM en el proceso. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: es un artefacto de distribución que traduce un modelo de 350 millones de parámetros a un formato ejecutable nativo sobre hardware AMD.

El modelo subyacente es LFM2-350M, de Liquid AI, un transformer pequeño orientado a inferencia en el borde. El paquete declara soporte para dos plataformas concretas: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). La propuesta de valor es la ejecución de un modelo compacto con una API compatible con OpenAI (`/v1/chat/completions`) sobre ROCm, sin depender de llama.cpp ni de un stack CUDA.

La relevancia de esta ficha es acotada: el artefacto tiene 0 descargas y 0 likes en el momento de la consulta, no se han vuelto a medir las métricas de rendimiento ni las puertas de corrección, y la model card está truncada. Debe interpretarse como un paquete experimental de despliegue, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2-350M, modelo base de Liquid AI); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 350 millones (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (`LFM2-350M-Q4_K_M.gguf`) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, `loom-serve` |
| API | `/v1/chat/completions` estilo OpenAI |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo: reutiliza el checkpoint GGUF `LFM2-350M-Q4_K_M.gguf` de `unsloth/LFM2-350M-GGUF` y genera, mediante `loom-next`, un conjunto de programas Loom (`program/*.loom`, `weights.loom`) que implementan la inferencia sobre el backend AMD. La arquitectura efectiva es la del modelo base LFM2-350M de Liquid AI; la información disponible no detalla su configuración interna (número de capas, dimensiones, atención, etc.), por lo que no se puede confirmar aquí si emplea atención lineal, decodificación especulativa u otras innovaciones del linaje LFM2.

No se dispone de datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que la model card del paquete no los incluye y la ficha se limita a describir el artefacto de despliegue. El paquete incluye ficheros de verificación (`model.json.lock` con sha256 comprobado por `loom-fetch`), el tokenizador (`tokenizer.json`), la configuración (`llm_config.json`), las mediciones (`info.json`) y un informe de metodología (`REPORT.md`). Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, de modo que no hay evidencia registrada de fidelidad numérica frente a la referencia de llama.cpp.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por petición, con hasta 4.096 tokens de salida.
- Concurrencia de 4 peticiones simultáneas en el servidor `loom-serve`.
- Ejecución nativa sobre GPUs AMD (gfx1151 y gfx1201) mediante el runtime Loom.
- Tool calling: no aplicable según la tabla de características del autor.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo conversacional ligero en un APU Strix Halo: el paquete permite levantar un endpoint compatible con OpenAI en un Ryzen AI Max+ 395 sin GPU dedicada, usando `loom-serve` con `--pool_backing=fixed` para reservar memoria de forma determinista.
- Prototipado de aplicaciones de chat en GPUs AMD Radeon AI PRO R9700: con 32 GB de VRAM y un modelo Q4_K_M de 350M, el margen de memoria permite ejecutar el servidor junto con otras cargas, manteniendo 4 peticiones concurrentes.
- Validación de la cadena de herramientas Loom: el paquete sirve como caso de prueba reproducible (`loom-fetch` con verificación sha256, `model.json.lock`) para equipos que evalúan el runtime antes de adoptarlo en modelos mayores.
- Sustitución de llama.cpp en entornos ROCm: al ofrecer la misma interfaz HTTP, permite comparar latencia y corrección frente a la referencia de llama.cpp registrada en las puertas `golden` y `compare`.
- Asistentes de texto de baja latencia en el borde: un modelo de 350M cuantizado a Q4_K_M es adecuado para tareas de clasificación, resumen corto o generación de respuestas breves donde el coste por token importa más que la calidad absoluta.
- Banquito de pruebas de concurrencia: la puerta `consistency` está diseñada para verificar que 4 peticiones concurrentes producen la misma salida que ejecutadas por separado, lo que convierte el paquete en un escenario útil para validar el planificador de `loom-serve`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de corrección figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de 350M parámetros, por lo que el peso de los pesos es del orden de cientos de MB, pero el paquete reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamaño no se detalla.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo; las plataformas listadas son APU de gama alta y GPU profesional.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/unsloth-LFM2-350M-loom:chat --materialize=copy --output=lfm2-350m` y `loom-serve --model=lfm2-350m '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no se documentan en el paquete; el runtime previsto es `loom-serve`.
- Latencia y throughput: no disponibles; las mediciones de rendimiento no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-350M-loom (este paquete) | 350M | 32.768 tokens | Loom + GGUF Q4_K_M | other | Hugging Face, 0 descargas |
| unsloth/LFM2-350M-GGUF (base) | 350M | no disponible | GGUF | no disponible | Hugging Face |
| LFM2-350M (original, Liquid AI) | 350M | no disponible | safetensors | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, formato y disponibilidad.

## Limitaciones y advertencias

- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que desaconseja su uso en producción sin una validación propia.
- Puertas de corrección sin evidencia: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.
- Rendimiento sin medir: la comparativa frente a llama.cpp no se ha vuelto a realizar para este paquete.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar la licencia del modelo base y del paquete.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Capacidades ausentes: sin tool calling, sin modo de razonamiento, sin decodificación especulativa, sin visión ni audio.
- Model card truncada: el contenido disponible termina en la sección de versiones ("Versions: card sche"), por lo que puede faltar información relevante.
- Dependencia de hardware específico: solo se documentan gfx1151 y gfx1201; no hay garantía de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en un modelo de 350M, pero no se aportan datos.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2-350M-loom
- Modelo base GGUF: https://huggingface.co/unsloth/LFM2-350M-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
