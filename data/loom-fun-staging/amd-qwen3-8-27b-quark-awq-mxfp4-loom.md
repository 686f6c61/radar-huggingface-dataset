# loom-fun-staging/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom

## Resumen

`loom-fun-staging/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom` es un paquete de despliegue para el runtime Loom (ecosistema HRX de ROCm) construido sobre el checkpoint sin modificar `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`. No es un modelo entrenado desde cero: es una conversión del checkpoint original a programas `.loom` y una tarjeta `model.json`, generada con el flujo de trabajo `loom-skills`, pensada para ejecutarse en las GPU integradas AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y en la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete expone un servidor con API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activado por defecto con niveles `low`/`medium`/`xhigh`, y decodificación especulativa mediante MTP (multi-token prediction) con profundidad 3. El contexto por petición está fijado en 32.768 tokens, con 4 peticiones concurrentes y un máximo de 4.096 tokens de salida.

Su relevancia es de nicho pero concreta: permite ejecutar un modelo de aproximadamente 27.000 millones de parámetros cuantizado en AWQ/MXFP4 sobre hardware AMD consumer y de estación de trabajo, sin depender de CUDA ni de llama.cpp, con una ruta de despliegue reproducible (verificación sha256 en `loom-fetch`). La información pública disponible es escasa: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y sin resultados de rendimiento ni de corrección re-medidos para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (heredada del checkpoint base `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | aproximadamente 27.000 millones (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | AWQ y MXFP4 (segun el nombre del checkpoint base); el paquete distribuye pesos en formato Loom (`weights.loom`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.safetensors` en el checkpoint base; `weights.loom` y programas `program/*.loom` en este paquete; `tokenizer.json` y `llm_config.json` incluidos |

Otros parametros operativos declarados en la model card:

| Parametro | Valor |
|---|---|
| Peticiones concurrentes | 4 |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Endpoint | `127.0.0.1:8080`, API estilo OpenAI |
| Memoria reservada (Strix Halo) | 30.000.000.000 bytes (`--memory_bytes`) |
| Backend de memoria (R9700) | `--pool_backing=fixed` |

## Arquitectura y entrenamiento

Este paquete no documenta entrenamiento propio: hereda el checkpoint `amd/Qwen3.8-27B-Quark-AWQ-MXFP4` de AMD, fijado en el commit `93245f7`, y lo empaqueta sin modificaciones. La model card no describe la arquitectura interna del transformer base, la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO. Tampoco se detalla el esquema de cuantización AWQ/MXFP4 más allá de su presencia en el nombre del checkpoint.

La innovación técnica relevante está en la capa de ejecución, no en el modelo: los programas `program/*.loom` y `weights.loom` se generan con `loom-skills` a partir de `llm_config.json`, y el servidor aplica decodificación especulativa MTP con profundidad 3 activada por defecto. La tarjeta declara una batería de puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con una referencia de llama.cpp sobre el mismo GGUF, pero para este paquete todas figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional multi-turno mediante `/v1/chat/completions` con formato de mensajes estilo OpenAI.
- Razonamiento explícito ("thinking") activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-paso con reutilización de historial, cubiertos por las puertas `agent` y `agent_think_off` (sin evidencia registrada aún).
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Procesamiento concurrente de hasta 4 peticiones.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene según la propia tarjeta.
- Audio de entrada y salida: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (`temperature`, `top_k`, `seed`): estado "?" en la tarjeta, no determinado.

## Casos de uso

- Asistente de código en estación de trabajo AMD: desplegar el paquete con `loom-serve` sobre una Radeon AI PRO R9700 de 32 GB y exponer el endpoint a un IDE o CLI que consuma la API estilo OpenAI, aprovechando el tool calling para leer y escribir ficheros.
- Automatización de agentes con herramientas: construir un bucle de agente que encadene llamadas a `tool_calls` con historial reutilizado; el límite de 4 peticiones concurrentes y 32.768 tokens de contexto encaja con flujos de un solo operador o equipos pequeños.
- Razonamiento asistido con esfuerzo configurable: usar `reasoning_effort: low` para tareas de clasificación o extracción y `xhigh` para análisis de documentos largos, ajustando coste y latencia sin cambiar de modelo.
- Procesamiento de documentos de hasta 32k tokens: resumen, extracción de entidades y preguntas sobre contratos, informes o código, siempre que el documento completo quepa en la ventana por petición.
- Inferencia local en hardware Strix Halo: ejecutar el servidor en un Ryzen AI Max+ 395 con `--memory_bytes=30000000000` para entornos de desarrollo sin GPU discreta, con memoria unificada.
- Evaluación y prototipado de la pila Loom: usar el paquete como banco de pruebas reproducible (sha256 verificado por `loom-fetch`) para validar tool calling, decodificación especulativa y concurrencia antes de adoptar el runtime en producción.
- Servicio interno de baja concurrencia: atención a usuarios o generación de borradores en una herramienta interna, donde 4 peticiones simultáneas y 4.096 tokens de salida por respuesta son suficientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección figuran sin medición registrada.

| Puerta de correccion | Strix Halo | Radeon AI PRO R9700 |
|---|---|---|
| `kernel_tests` | no medida | no medida |
| `golden` | no medida | no medida |
| `compare` | no medida | no medida |
| `vision` | no medida | no medida |
| `consistency` | no medida | no medida |
| `spec` | no medida | no medida |
| `agent` | no medida | no medida |
| `agent_think_off` | no medida | no medida |
| `sampling` | no medida | no medida |
| `logits` | no medida | no medida |
| `decision` | no medida | no medida |

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo oficial para Strix Halo reserva 30.000.000.000 bytes (unos 30 GB) para un modelo de aproximadamente 27.000 millones de parámetros en AWQ/MXFP4; en la R9700 de 32 GB se usa `--pool_backing=fixed`.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon consumer distintas de las dos anteriores; el runtime es específico de ROCm/AMD.
- Despliegue: `pip install "hrx-loom[hf]"`, descarga con `loom-fetch` y servicio con `loom-serve`; el servidor escucha en `127.0.0.1:8080` y responde a la API estilo OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones para este paquete.
- Concurrencia máxima: 4 peticiones simultáneas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones verificables de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa rigurosa.

| Criterio | Este paquete | Alternativa comparable |
|---|---|---|
| Parametros | ~27B (checkpoint base) | no disponible |
| Contexto | 32.768 tokens | no disponible |
| Licencia | no disponible | no disponible |
| Formato | Loom (`weights.loom`) sobre safetensors | no disponible |
| Hardware | AMD gfx1151 / gfx1201 | no disponible |

## Limitaciones y advertencias

- Sin evidencia de corrección: las once puertas de la tarjeta figuran como "not yet re-measured"; no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Sin benchmarks de rendimiento: no se han publicado cifras de latencia ni throughput para este paquete en ninguna de las dos GPU objetivo.
- Licencia no declarada: no se especifica licencia en la tarjeta ni en los metadatos, lo que impide evaluar el uso comercial; hay que remitirse al checkpoint base `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`.
- Idiomas no declarados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Entrada de imagen no soportada por Loom, pese a que el modelo original la tiene según la tarjeta; no debe asumirse capacidad multimodal en este despliegue.
- Contexto limitado a 32.768 tokens por petición y salida máxima de 4.096 tokens, con solo 4 peticiones concurrentes: no apto para cargas de alta concurrencia.
- Estado de muestreo no determinado ("?"): el comportamiento de `temperature`, `top_k` y `seed` no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de producción.
- Repositorio de staging con 0 descargas y 0 likes, creado y actualizado el 2026-11-15: madurez y mantenimiento no demostrados.
- Dependencia de la pila Loom (`hrx-loom` con versión desconocida, `loom-skills` en `6e730d2` con cambios locales): la reproducibilidad exacta no está garantizada.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/amd-Qwen3.8-27B-Quark-AWQ-MXFP4-loom
- Checkpoint base: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Runtime Loom (ROCm HRX): https://github.com/ROCm/hrx-system
- Flujo de generación loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
