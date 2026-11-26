# loom-draft/bartowski-Yi-Coder-9B-Chat-loom

## Resumen

Yi-Coder-9B-Chat-loom no es un modelo nuevo, sino un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) generado por la herramienta loom-next a partir del checkpoint GGUF sin modificar `bartowski/Yi-Coder-9B-Chat-GGUF`, concretamente la cuantización `Yi-Coder-9B-Chat-Q4_K_M.gguf`. El autor del paquete es el usuario loom-draft y su propósito es servir el modelo Yi-Coder-9B-Chat sobre GPUs de AMD mediante el runtime Loom, con soporte explícito para el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Yi-Coder-9B-Chat, es un modelo de lenguaje orientado a código de 9.000 millones de parámetros desarrollado por 01.AI, con una ventana de contexto de 131.072 tokens por petición según la tarjeta del paquete. El paquete en sí no añade entrenamiento ni ajuste: los pesos son idénticos al GGUF original y lo que aporta es una vía de ejecución nativa en ROCm/AMD a través del servidor loom-serve, que expone una API compatible con `/v1/chat/completions` de OpenAI.

La relevancia de esta ficha es acotada y muy específica: sirve a quien quiera evaluar Yi-Coder-9B-Chat en hardware AMD (Strix Halo o R9700) sin pasar por llama.cpp, y también a quien necesite entender qué garantías ofrece hoy el paquete. La tarjeta del autor indica que las mediciones de rendimiento y las puertas de corrección (kernel_tests, golden, compare, consistency, etc.) no se han vuelto a medir para este paquete, por lo que la evidencia disponible es todavía incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Yi-Coder-9B-Chat; la tarjeta del paquete no detalla la arquitectura) |
| Parametros totales | 9B (según el nombre del checkpoint Yi-Coder-9B-Chat) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del repo base no confirmadas en este paquete |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom`; incluye `tokenizer.json`, `llm_config.json`, `model.json` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | no aplicable según la tarjeta |
| Reasoning / thinking | no aplicable según la tarjeta |
| Decodificación especulativa | no aplicable según la tarjeta |
| Entrada de imagen / audio | no aplicable según la tarjeta |

## Arquitectura y entrenamiento

La tarjeta del paquete no describe la arquitectura interna del modelo subyacente ni sus datos de entrenamiento; se limita a indicar que parte del GGUF `Yi-Coder-9B-Chat-Q4_K_M.gguf` de bartowski sin modificarlo. Por tanto, no hay información disponible en esta ficha sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de atención del Yi-Coder-9B-Chat original. Lo que sí describe la tarjeta es la capa de despliegue: loom-next genera programas `.loom` y `weights.loom` a partir de la configuración (`llm_config.json`), y loom-serve los ejecuta sobre el dispositivo AMD indicado mediante `--device=amdgpu://`.

El paquete incorpora un conjunto de puertas de corrección (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) que comparan la salida del runtime Loom contra una referencia de llama.cpp grabada sobre el mismo GGUF, con comparación token a token y tolerancia para empates cercanos. En el momento de publicación de la tarjeta, todas estas puertas aparecen como "not yet re-measured" para ambas GPUs, de modo que no hay evidencia registrada de que el paquete reproduzca fielmente la referencia.

## Capacidades

- Generación de texto y código: el modelo subyacente es Yi-Coder-9B-Chat, orientado a tareas de programación, aunque la tarjeta del paquete no enumera capacidades funcionales detalladas.
- Servicio de chat vía API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes que ya hablan ese protocolo.
- Contexto largo: 131.072 tokens por petición, adecuado para documentos extensos o bases de código grandes.
- Concurrencia de 4 peticiones simultáneas, con la puerta `consistency` prevista para verificar que las respuestas concurrentes coinciden con las ejecuciones aisladas (sin medición registrada todavía).
- Tool calling: marcado como "not applicable" en la tarjeta del paquete.
- Modo razonamiento / thinking: marcado como "not applicable".
- Decodificación especulativa: marcada como "not applicable".
- Entrada de imagen o audio: marcada como "not applicable".
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre hardware AMD: desplegar el paquete con `loom-serve` en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395 y consumir el endpoint `/v1/chat/completions` desde un IDE o un CLI de programación, aprovechando el contexto de 131.072 tokens para incluir varios ficheros en la misma petición.
- Revisión de parches y diffs largos: con 131.072 tokens de contexto, se pueden enviar diffs extensos junto con el código circundante y pedir un análisis; el límite de salida de 4.096 tokens acota la respuesta generada.
- Documentación técnica automatizada: generar comentarios, docstrings o guías a partir de fragmentos de repositorio enviados en una sola petición, usando el endpoint compatible con OpenAI para integrarlo en scripts existentes.
- Evaluación de la ruta AMD/ROCm frente a llama.cpp: servir el mismo GGUF con Loom y con llama.cpp y comparar latencia y fidelidad de salida, apoyándose en las puertas `golden` y `compare` descritas en la tarjeta (pendientes de medición).
- Prototipado de asistentes de código en un equipo de desarrollo con GPUs AMD: al exponer una API estándar, se puede conectar a herramientas que ya soportan OpenAI sin reescribir la integración.
- Pruebas de concurrencia y estabilidad del runtime: lanzar hasta 4 peticiones simultáneas y verificar, mediante la puerta `consistency`, que la salida coincide con la de peticiones aisladas, útil para validar el despliegue antes de producción.
- Reproducibilidad de despliegues: el paquete fija los ficheros fuente con `model.json.lock` y verificación sha256 en `loom-fetch`, lo que facilita reconstruir exactamente el mismo entorno en otra máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del autor indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y todas las puertas de corrección figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de 9B, y la GPU Radeon AI PRO R9700 se describe con 32 GB, mientras que Strix Halo es una plataforma de memoria unificada.
- GPUs soportadas según la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs de NVIDIA (A100, H100, RTX 4090) u otras: no mencionadas en la información disponible.
- Cabe en GPU de consumo: no confirmado; la tarjeta solo cita las dos plataformas AMD anteriores.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, `loom-fetch` para descargar el paquete y `loom-serve` para servir; opciones de ejecución `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (las mediciones del paquete aún no se han repetido).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yi-Coder-9B-Chat-loom (este paquete) | 9B | 131.072 tokens | GGUF Q4_K_M empaquetado en `.loom`, runtime loom-serve sobre AMD | MIT | Hugging Face (loom-draft) |
| bartowski/Yi-Coder-9B-Chat-GGUF (base) | 9B | no disponible en la información | GGUF para llama.cpp y derivados | MIT (según el paquete) | Hugging Face (bartowski) |
| Yi-Coder-9B-Chat original (01.AI) | 9B | no disponible en la información | safetensors (pesos originales) | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete no ha vuelto a medir sus resultados de rendimiento ni sus puertas de corrección: todas figuran como "not yet re-measured", por lo que no hay evidencia registrada de fidelidad frente a llama.cpp.
- Tool calling, modo thinking, decodificación especulativa y entrada de imagen o audio están marcados como "not applicable" en la tarjeta; no deben asumirse como disponibles.
- El muestreo aparece como "not determined" en la tabla de características, lo que deja sin confirmar el comportamiento de temperatura, top_k y semilla.
- La tarjeta no detalla idiomas soportados, arquitectura interna ni datos de entrenamiento del modelo subyacente; cualquier evaluación de calidad debe hacerse contra el checkpoint original de Yi-Coder-9B-Chat.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son los inherentes al modelo Yi-Coder-9B-Chat original, que esta ficha no puede cuantificar.
- Licencia MIT declarada en el paquete, pero la tarjeta no aclara si esa licencia cubre los pesos subyacentes ni las condiciones de uso comercial del modelo original; conviene verificar la licencia del checkpoint de 01.AI antes de un despliegue comercial.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de las GPUs AMD enumeradas; no se documenta compatibilidad con otras plataformas.
- La búsqueda web realizada devuelve resultados sobre el producto de grabación de pantalla Loom y sobre una marca de ropa homónima, sin relación con este paquete; no aportan información técnica adicional.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Yi-Coder-9B-Chat-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/Yi-Coder-9B-Chat-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
