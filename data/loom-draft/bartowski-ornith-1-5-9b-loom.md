# loom-draft/bartowski-Ornith-1.5-9B-loom

## Resumen

Ornith-1.5-9B es un modelo multimodal de tipo image-text-to-text de 9.000 millones de parametros, distribuido originalmente en formato GGUF por bartowski y empaquetado en este repositorio por loom-draft como paquete Loom para GPUs AMD. El paquete contiene programas `.loom` generados automaticamente con la herramienta loom-next (sin intervencion de un LLM en el bucle) junto con una tarjeta `model.json`, y envuelve el checkpoint cuantizado `Ornith-1.5-9B-Q4_K_M.gguf` sin modificarlo.

El objetivo del repositorio no es publicar un modelo nuevo, sino ofrecer una ruta de despliegue nativa para hardware AMD concreto: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El servidor `loom-serve` expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, razonamiento con modo thinking activado por defecto y entrada de imagenes mediante el proyector `mmproj-Ornith-1.5-9B-bf16.gguf`.

La relevancia actual es acotada pero clara: permite ejecutar un modelo multimodal de 9B con una ventana de contexto de 262.144 tokens por peticion sobre GPUs AMD de consumo profesional, sin depender del stack CUDA. La licencia MIT del paquete facilita su integracion, aunque el rendimiento y las pruebas de correccion de esta build aun no se han vuelto a medir segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal image-text-to-text; el paquete no detalla la arquitectura interna) |
| Parametros totales | 9B (denominacion del modelo; no se desglosa el recuento exacto) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico peso incluido en el paquete); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.5-9B-Q4_K_M.gguf`) + proyector `mmproj-Ornith-1.5-9B-bf16.gguf`; empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Ornith-1.5-9B ni su proceso de entrenamiento: no se detallan el numero de tokens de preentrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Lo unico verificable es que se trata de un modelo multimodal que acepta texto e imagenes como entrada y que incorpora un modo de razonamiento (thinking) activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.

La innovacion tecnica de este repositorio no reside en el modelo sino en el empaquetado: loom-next genera kernels y programas Loom especificos para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye puertas de correccion (kernel_tests, golden, compare, vision, consistency, spec, agent, logits, decision) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF, aunque en esta build todas aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Entrada de imagenes en formato OpenAI `image_url`, procesadas por el proyector `mmproj-Ornith-1.5-9B-bf16.gguf` (image-text-to-text).
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), incluyendo bucles de agente multi-turno.
- Modo de razonamiento (thinking) activado por defecto, desactivable por peticion.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultaneas en el servidor Loom.
- Sin soporte de audio (entrada ni salida) y sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: la ventana de 262.144 tokens permite cargar informes, contratos o manuales completos junto con sus figuras y plantear preguntas sobre el conjunto sin trocear el contenido.
- Extraccion de datos de facturas y formularios escaneados: el modelo recibe la imagen via `image_url` y devuelve los campos estructurados, integrándose en un pipeline de digitalizacion documental.
- Asistente de soporte tecnico con acceso a herramientas: el soporte de `tool_calls` permite consultar bases de conocimiento, estado de pedidos o APIs internas dentro de un bucle de agente controlado por el orquestador.
- Automatizacion de tareas sobre escritorio o terminal en entornos AMD: al ejecutarse sobre Strix Halo o R9700 con `loom-serve`, puede desplegarse localmente en estaciones de trabajo sin GPU NVIDIA, manteniendo los datos en la maquina.
- Prototipado de agentes con razonamiento visible: el modo thinking por defecto facilita depurar cadenas de razonamiento en tareas de planificacion multi-paso, y puede desactivarse para reducir latencia en produccion.
- Descripcion y clasificacion de imagenes en lote: con 4 peticiones concurrentes y contexto largo, sirve para etiquetar catalogos de producto o moderar contenido visual acompanado de texto.
- Evaluacion comparativa de backends AMD: el paquete incluye puertas de correccion contra llama.cpp, por lo que resulta util como banco de pruebas para validar kernels Loom frente a la referencia en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion aparecen sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso es Q4_K_M de un modelo de 9B, por lo que el checkpoint ronda los 5-6 GB, a lo que se suma el proyector bf16 y el pool de memoria fijo que reserva `loom-serve`.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs NVIDIA ni para otras Radeon fuera de las dos arquitecturas objetivo; el paquete esta generado especificamente para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio (llama.cpp solo aparece como referencia de correccion).
- Latencia y throughput: no disponibles; las tablas de rendimiento del autor estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (paquete Loom) | 9B | 262.144 | GGUF + `.loom` | MIT | Solo AMD gfx1151 / gfx1201; benchmarks no medidos |
| bartowski/Ornith-1.5-9B-GGUF | 9B | no disponible | GGUF | no disponible en la informacion | Checkpoint original del que deriva este paquete; ejecutable con llama.cpp |
| Alternativas de 9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, ya que no hay benchmarks publicados para este paquete ni datos de los modelos alternativos en la documentacion consultada.

## Limitaciones y advertencias

- El paquete no ha sido re-medido: rendimiento, correccion de kernels y paridad con llama.cpp estan pendientes en ambas GPUs objetivo, por lo que no hay evidencia publicada de calidad en esta build.
- Hardware muy restringido: solo se declara compatibilidad con gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no hay ruta documentada para NVIDIA, otras Radeon o CPU.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por peticion, lo que puede ser insuficiente para generacion larga.
- Sin decodificacion especulativa ni soporte de audio.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad factual para el modelo base en la informacion disponible.
- Licencia MIT declarada para el paquete, pero la licencia y condiciones del modelo base Ornith-1.5-9B no se detallan en este repositorio; conviene verificar la del checkpoint original antes de un uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- El modo thinking esta activado por defecto, lo que incrementa latencia y consumo de tokens si no se desactiva explicitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Ornith-1.5-9B-loom
- Modelo base en Hugging Face: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Repositorio del sistema Loom para ROCm: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
