# loom-fun/unsloth-Inkling-2-Mini-loom

## Resumen

Inkling-2-Mini (UD-Q4_K_XL) para AMD Loom es un paquete de despliegue distribuido por el usuario `loom-fun` que empaqueta el checkpoint GGUF sin modificar `unsloth/Inkling-2-Mini-GGUF` (concretamente el fichero `Inkling-2-Mini-UD-Q4_K_XL.gguf`) en el formato `.loom` que consume el runtime Loom. No se trata de un modelo nuevo ni de un fine-tune: es una conversión de formato y un preset de servicio generado con el flujo `loom-skills` sobre un equipo AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151). El modelo subyacente es un modelo de mezcla de expertos (MoE) con capacidad de razonamiento y entrada de imagen en su versión original, aunque Loom no soporta esta última.

La relevancia de este repositorio es fundamentalmente de infraestructura: demuestra la ejecución de un GGUF cuantizado en Q4_K_XL sobre GPU integrada AMD mediante el runtime Loom, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento configurable y una ventana de contexto declarada de 1.048.576 tokens por petición. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los artefactos aún no se han materializado o que el paquete es meramente descriptivo.

La información pública disponible sobre el modelo base es muy limitada: la model card no detalla número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks propios. Los únicos datos numéricos presentes son los techos de roofline medidos para este GGUF sobre Strix Halo y las puertas de corrección del runtime, no métricas de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mezcla de expertos (MoE), según la model card; detalles de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el número de expertos activos) |
| Longitud de contexto | 1.048.576 tokens por petición (límite del preset de Loom) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (única cuantización empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programa `.loom` + `model.json`) |
| Modelo base | unsloth/Inkling-2-Mini-GGUF |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`), backend AMDGPU |
| Hardware de referencia | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151), 228 GB/s, 44 TFLOP/s a 85 W |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) según la model card del paquete, pero no se especifican el número de capas, la dimensión oculta, el número de expertos, la estrategia de enrutamiento ni el mecanismo de atención. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card del paquete Loom no reproduce la del modelo original, por lo que estos datos deben consultarse en `unsloth/Inkling-2-Mini-GGUF`, que no forma parte de la información proporcionada.

La innovación técnica destacable no está en el modelo sino en el runtime: Loom ejecuta el GGUF con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo pero reduce la latencia de sincronización. El paquete incluye puertas de corrección (`golden`, `compare`, `consistency`) que comparan la salida codiciosa y las top-5 log-probabilidades contra una referencia de llama.cpp sobre el mismo GGUF, con divergencias clasificadas como casi-empates. No hay cabecera MTP en el GGUF ni drafter publicado, por lo que la decodificación especulativa no está disponible.

## Capacidades

- Generación de texto y razonamiento con modo «thinking» activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento mediante `reasoning_effort` con siete niveles: `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh` y `max`.
- Tool calling y function calling en formato OpenAI (`tools` y `tool_calls`).
- API compatible con OpenAI en `/v1/chat/completions`, lo que permite sustituir clientes existentes sin cambios de código.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Ventana de contexto de 1.048.576 tokens por petición, adecuada para documentos extensos y conversaciones multi-turno largas.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia verificada (la puerta `consistency` confirma que las respuestas concurrentes coinciden con las ejecuciones aisladas).
- Entrada de imagen: el modelo original la soporta, pero Loom no la implementa; queda fuera del alcance de este paquete.
- Entrada y salida de audio: no aplicable.
- Decodificación especulativa: no aplicable (sin cabecera MTP ni drafter).

## Casos de uso

- Servicio de chat compatible con OpenAI en hardware AMD integrado: el paquete expone `/v1/chat/completions` en `127.0.0.1:8080`, de modo que cualquier cliente que ya hable con la API de OpenAI puede apuntarse a Loom sin reescribir la integración. Es adecuado para prototipos y entornos de desarrollo sobre un Ryzen AI Max+ 395 sin GPU discreta.
- Procesamiento de documentos largos: con 1.048.576 tokens de contexto por petición, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola llamada. El prefill medido en roofline (8.020,5 tok/s a 32k) indica que documentos de decenas de miles de tokens son viables en tiempos razonables sobre Strix Halo.
- Asistentes con razonamiento graduable: el parámetro `reasoning_effort` permite bajar a `none` o `minimal` para tareas triviales de clasificación o extracción y subir a `high` o `max` para problemas de varios pasos, ajustando el coste computacional por petición sin cambiar de modelo.
- Automatización con herramientas: el soporte de `tools` y `tool_calls` permite construir agentes que consulten APIs, bases de datos o sistemas internos. La puerta `consistency` garantiza que las respuestas bajo concurrencia no se corrompen, lo que es requisito para agentes que ejecutan acciones con efectos secundarios.
- Evaluación comparativa de runtimes: el paquete incluye una tabla de rendimiento frente a llama.cpp ROCm con el mismo GGUF, los mismos prompts y el mismo runner, lo que lo convierte en un banco de pruebas reproducible para comparar motores de inferencia sobre gfx1151.
- Desarrollo local sin conexión: al ejecutarse sobre hardware de escritorio con GPU integrada y pesos GGUF cuantizados en Q4_K_XL, el modelo puede desplegarse en estaciones de trabajo sin acceso a la nube, útil para entornos con requisitos de confidencialidad.
- Generación de código asistida en pipelines: con tool calling y contexto largo, puede integrarse en flujos de revisión que necesiten leer un repositorio completo y emitir parches, aunque el rendimiento en código no está medido en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye techos de roofline para este GGUF sobre Strix Halo; las columnas de llama.cpp y Loom aparecen como «no medidas» en la tabla original.

| Métrica | Techo roofline (tok/s) | Loom medido | llama.cpp medido |
|---|---|---|---|
| Decode, prompt corto | 98,5 | no medido | no medido |
| Decode, contexto 2k | 93,8 | no medido | no medido |
| Decode, contexto 32k | 78,0 | no medido | no medido |
| Prefill, documento 1k | 9.583,4 | no medido | no medido |
| Prefill, documento 2k | 9.283,9 | no medido | no medido |
| Prefill, documento 8k | 8.991,6 | no medido | no medido |
| Prefill, documento 16k | 8.642,8 | no medido | no medido |
| Prefill, documento 32k | 8.020,5 | no medido | no medido |
| 4 streams, decode agregado | 379,1 | no medido | no medido |
| Decodificación especulativa | n/a | n/a | n/a |

Los valores de roofline se calculan con `loom-roofline` a partir de 228 GB/s de ancho de banda y 44 TFLOP/s sostenidos a 85 W en gfx1151. El techo de 4 streams asume que las cuatro peticiones enrutan a los mismos expertos, cota que ninguna ejecución puede superar. No hay datos de latencia ni de throughput reales publicados.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete está pensado para memoria unificada de un Ryzen AI Max+ 395, no para VRAM de GPU discreta; el tamaño exacto del GGUF Q4_K_XL no se publica.
- GPU de referencia: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151), con 228 GB/s de ancho de banda y 44 TFLOP/s sostenidos a 85 W.
- GPU discretas: no hay datos de compatibilidad con A100, H100 o RTX 4090 en la información disponible; el backend es AMDGPU vía ROCm.
- GPU de consumo: el hardware de referencia es una APU de escritorio, no una GPU dedicada; no se confirma funcionamiento en RTX 4090 ni en otras consumer.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue: llama.cpp ROCm se usa como referencia de comparación en la model card; no se documenta soporte de vLLM, TGI, Ollama ni otros motores para este paquete.
- Latencia y throughput: solo techos de roofline (ver sección de benchmarks); no hay mediciones reales publicadas.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni benchmarks de alternativas comparables en la información proporcionada, por lo que la comparativa de modelos no está disponible. La única comparación documentada es de motores de inferencia sobre el mismo GGUF y hardware:

| Motor | Modelo | Cuantización | Hardware | Licencia del paquete | Estado |
|---|---|---|---|---|---|
| Loom 0.2.0 | Inkling-2-Mini | UD-Q4_K_XL | Strix Halo (gfx1151) | Apache 2.0 | paquete publicado, métricas no medidas |
| llama.cpp ROCm | Inkling-2-Mini | UD-Q4_K_XL | Strix Halo (gfx1151) | según build | referencia de corrección, métricas no medidas |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB; los artefactos pueden no estar materializados o el paquete puede ser incompleto.
- No se publican parámetros totales, parámetros activos, número de expertos ni arquitectura detallada del modelo base, lo que impide estimar coste computacional o calidad.
- No hay benchmarks de calidad (MMLU, HumanEval, GSM8K) ni evaluaciones independientes; el rendimiento real en tareas concretas es desconocido.
- Las métricas de rendimiento del runtime aparecen como «no medidas» en la propia model card; solo se ofrecen techos teóricos de roofline.
- La entrada de imagen está soportada por el modelo original pero no por Loom, lo que limita las capacidades respecto al checkpoint de referencia.
- No hay decodificación especulativa: el GGUF no incluye cabecera MTP y no se ha publicado un drafter para este modelo exacto.
- La puerta `kernel_tests` figura como «sin evidencia», por lo que los kernels generados no han sido validados contra implementaciones de referencia.
- La concurrencia está limitada a 4 peticiones simultáneas y la salida a 4.096 tokens por petición, lo que puede ser insuficiente para generación de documentos largos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; al ser un modelo de razonamiento con «thinking» activado por defecto, puede producir cadenas de razonamiento extensas que incrementan la latencia y el consumo de tokens.
- La licencia Apache 2.0 permite uso comercial del paquete, pero las condiciones del modelo base deben verificarse en `unsloth/Inkling-2-Mini-GGUF`.
- El hardware de referencia es una APU con memoria unificada; el despliegue en GPU discretas AMD o NVIDIA no está documentado ni validado.
- Los resultados de búsqueda web proporcionados corresponden a productos no relacionados (Loom Inc., la marca textil Loom), no al runtime Loom de ROCm, y no aportan información adicional sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun/unsloth-Inkling-2-Mini-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
