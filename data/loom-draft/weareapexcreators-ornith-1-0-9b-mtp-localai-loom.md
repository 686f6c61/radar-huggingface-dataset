# loom-draft/weareapexcreators-Ornith-1.0-9B-MTP-LocalAI-loom

## Resumen

`loom-draft/weareapexcreators-Ornith-1.0-9B-MTP-LocalAI-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `weareapexcreators/Ornith-1.0-9B-MTP-LocalAI` (fichero `ornith-9b-kl-Q4_K_M.gguf`). No es un modelo entrenado desde cero, sino una distribución de inferencia optimizada para GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, sin intervención de un LLM en el proceso de generación.

El interés del paquete reside en la pila de ejecución, no en los pesos: expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo razonamiento activado por defecto y decodificación especulativa basada en MTP (Multi-Token Prediction) con profundidad 3, todo sobre el runtime `hrx-loom` 0.2.0. Declara una ventana de contexto de 262.144 tokens por petición y 4 peticiones concurrentes, con un máximo de 4.096 tokens de salida por preset.

La relevancia es acotada pero clara para quien opera hardware AMD: cubre el hueco de servir un modelo de 9B cuantizado en Q4_K_M sobre ROCm con decodificación especulativa activada por defecto, algo que habitualmente requiere montar llama.cpp a mano. Ahora bien, el propio autor indica que las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete, por lo que la evidencia empírica publicada es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base; el paquete no la documenta) |
| Parametros totales | 9B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único fichero GGUF incluido: `ornith-9b-kl-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, empaquetado como programa Loom (`.loom`) más `model.json` / `model.json.lock` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Decodificación especulativa | MTP, profundidad 3, activada por defecto |
| Runtime | `hrx-loom[hf]==0.2.0` |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del transformer subyacente, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. La model card del paquete no describe el checkpoint base más allá de su nombre y del fichero GGUF que lo materializa; cualquier dato sobre atención, capas o vocabulario requeriría consultar el repositorio `weareapexcreators/Ornith-1.0-9B-MTP-LocalAI`, que no forma parte de la información disponible.

La innovación técnica documentada pertenece a la capa de despliegue. El paquete incorpora decodificación especulativa MTP con profundidad 3 activada por defecto, lo que según el autor debe producir exactamente la misma salida que con la decodificación especulativa desactivada (puerta `spec`). También ofrece dos modos de gestión de memoria: `--pool_backing=fixed`, que reserva el pool de memoria del preset por adelantado, y `--parameter_mode=preload`, que solo altera cómo se cargan los pesos en el host. El parámetro `completion_spin_ns=4294967295` habilita espera activa de las finalizaciones de GPU consumiendo CPU mientras hay trabajo en vuelo; las mediciones de rendimiento de la tarjeta usan esa configuración.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con puertas de corrección específicas para bucles de agente (`agent`, `agent_think_off`).
- Modo razonamiento o thinking activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de 4 peticiones simultáneas con consistencia declarada frente a ejecuciones aisladas (puerta `consistency`).
- Muestreo configurable con temperatura, `top_k` y semilla (puerta `sampling`).
- Lectura de logits en host (`llm.logits`), con comprobación de que el argmax a T=0 coincide con el token del dispositivo.
- Entrada de imagen: estado "no determinado" en la tabla de características; existe una puerta `vision` que compara con llama.cpp usando el mismo proyector, pero sin ejecución registrada.
- Entrada y salida de audio: "no determinado".
- Capacidades multilingües: no disponibles.

## Casos de uso

- Servicio de chat sobre GPU AMD de escritorio o workstation: `loom-serve` levanta un endpoint compatible con OpenAI en `127.0.0.1:8080`, de modo que cualquier cliente que ya hable el protocolo de OpenAI puede apuntar al modelo sin cambios de código. Es el caso natural para un Radeon AI PRO R9700 de 32 GB.
- Asistente con contexto largo: los 262.144 tokens por petición permiten cargar documentación extensa, expedientes o bases de código medianas en una sola conversación sin trocear. Útil para revisión de contratos o análisis de repositorios.
- Agente con herramientas en local: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` lo hacen apto para bucles multi-paso (consulta a APIs internas, ejecución de comandos, recuperación de datos) manteniendo los datos en la máquina.
- Inferencia con latencia reducida en hardware de consumo profesional: la decodificación especulativa MTP de profundidad 3 está pensada para acelerar la generación sin alterar la salida, lo que encaja en asistentes interactivos donde el tiempo hasta el primer token y el throughput importan.
- Despliegue en Strix Halo para prototipado: un Ryzen AI Max+ 395 con memoria unificada puede servir el modelo Q4_K_M con el pool de memoria fijado por adelantado (`--pool_backing=fixed`), evitando crecimiento elástico impredecible durante la sesión.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas `golden` y `compare` que contrastan tokens voraces y top-5 log-probs contra una referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar una migración de runtime antes de pasar a producción.
- Moderación o clasificación por decisión: la puerta `decision` cubre respuestas de elección, puntuación y probabilidades, lo que habilita su uso en tareas de enrutado o scoring dentro de un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured" en ambas GPUs. No hay cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un checkpoint de 9B en Q4_K_M ocupa del orden de 5-6 GB de pesos, pero el paquete no publica su huella real ni la del pool de memoria del preset.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- GPU de consumo: no se documenta compatibilidad con Radeon RX de consumo; las dos plataformas listadas son APU de gama alta y GPU profesional. No hay confirmación para RTX 4090 ni similares.
- Despliegue: exclusivamente mediante `hrx-loom[hf]==0.2.0` (`pipx install`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; llama.cpp aparece únicamente como referencia de corrección, no como backend.
- Opciones de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`, `--materialize=copy` en la fase de descarga.
- Latencia y throughput: no disponibles. Las filas de rendimiento de la tarjeta no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del checkpoint base que permitan una comparación cuantitativa con alternativas de 9B. A continuación se recoge la comparación que sí puede establecerse con precisión, que es la de la pila de despliegue frente al backend de referencia citado por el propio autor:

| Criterio | Este paquete (Loom) | llama.cpp (referencia citada) |
|---|---|---|
| Formato de pesos | GGUF Q4_K_M empaquetado en `.loom` | GGUF Q4_K_M |
| Hardware objetivo | AMD gfx1151 y gfx1201 | Multiplataforma |
| Decodificación especulativa | MTP, profundidad 3, por defecto | No detallado en la información |
| API | OpenAI-compatible `/v1/chat/completions` | No detallado en la información |
| Contexto declarado | 262.144 tokens | No detallado en la información |
| Concurrencia | 4 peticiones | No detallado en la información |
| Evidencia de rendimiento publicada | Ninguna (sin re-medir) | Referencia usada para las puertas de corrección |

## Limitaciones y advertencias

- Ausencia total de evidencia empírica: todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured". No hay ninguna ejecución registrada que respalde las afirmaciones de la tabla de características.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB, lo que sugiere que el paquete puede no estar materializado por completo o que las métricas de Hugging Face no reflejan su contenido real. Conviene verificar los ficheros antes de confiar en el despliegue.
- Licencia MIT declarada en el paquete, pero la licencia del checkpoint base no se detalla en la información disponible; para uso comercial debe confirmarse en el repositorio `weareapexcreators/Ornith-1.0-9B-MTP-LocalAI`.
- Idiomas soportados no documentados: no puede asumirse un rendimiento correcto en castellano sin evaluación previa.
- Entrada de imagen y audio marcadas como "no determinado"; la puerta `vision` existe pero no se ha ejecutado. No debe asumirse capacidad multimodal.
- Dependencia fuerte del runtime `hrx-loom` 0.2.0 y de ROCm: no hay soporte documentado para CUDA ni para backends alternativos, lo que limita la portabilidad.
- El parámetro `completion_spin_ns=4294967295` mantiene espera activa consumiendo CPU mientras la GPU trabaja; en servidores compartidos esto puede degradar otras cargas.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por preset: insuficiente para cargas de alta concurrencia o generaciones muy largas sin ajustar la configuración.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este paquete ni, en la información disponible, para el checkpoint base.
- La búsqueda web realizada devuelve resultados sobre el producto de grabación de pantalla Loom y sobre la marca textil Loom, sin relación con este modelo; no se ha localizado documentación externa independiente.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-Ornith-1.0-9B-MTP-LocalAI-loom
- Checkpoint base: https://huggingface.co/weareapexcreators/Ornith-1.0-9B-MTP-LocalAI
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
