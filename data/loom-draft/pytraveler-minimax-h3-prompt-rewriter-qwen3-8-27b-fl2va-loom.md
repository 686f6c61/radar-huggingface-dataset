# loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-loom

## Resumen

El paquete `loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-loom` es una distribucion en formato Loom (programas `.loom` y una tarjeta `model.json`) del checkpoint GGUF sin modificar `pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, que produce el paquete sin intervencion de un LLM en el bucle. El proposito del paquete es servir el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `hrx-loom` (version 0.2.0).

El modelo subyacente es un reescritor de prompts con capacidad de vision, derivado de la familia Qwen3 (la nomenclatura del repositorio indica 27B y la variante FL2VA), afinado por `pytraveler` para reescribir prompts de MiniMax-H3. La tarea declarada en el pipeline es `image-text-to-text`, con entrada de imagen a traves de un proyector multimodal separado. El paquete no aporta pesos nuevos: empaqueta el GGUF original junto con los artefactos necesarios para ejecutarlo en el stack Loom.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto de empaquetado para hardware AMD especifico, con cero descargas y cero likes en el momento de la consulta, y con todas las puertas de validacion (correctitud, rendimiento, kernels) marcadas como "not yet re-measured". Es decir, el paquete existe y es servible, pero sus mediciones de rendimiento y sus pruebas de equivalencia frente a llama.cpp no estan publicadas para esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del checkpoint base; la nomenclatura del repo sugiere familia Qwen3) |
| Parametros totales | 27B (segun la nomenclatura del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 (`mmproj-...-F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, empaquetado en formato Loom (`.loom` + `model.json`) |

Otros parametros operativos declarados en la tarjeta:

| Parametro | Valor |
|---|---|
| Concurrencia | 4 peticiones simultaneas |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | no aplicable |
| Entrada de audio | no aplicable |
| Muestreo (sampling) | no determinado |
| API | `/v1/chat/completions` estilo OpenAI |
| Runtime | `hrx-loom[hf]==0.2.0` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del checkpoint base: el paquete Loom solo documenta el envoltorio de ejecucion, no el modelo. Lo que si se puede afirmar con los datos aportados es que el checkpoint es un GGUF cuantizado en Q4_K_M y que la modalidad visual se resuelve mediante un proyector separado en F16 (`mmproj-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-F16.gguf`), lo que es el patron habitual en la familia Qwen para modelos con vision. La nomenclatura "Qwen3.8-27B" y "FL2VA" sugiere un afinado sobre una base Qwen3 de 27B orientado a reescritura de prompts con entrada visual, pero el paquete no aporta detalle sobre la composicion del dataset de afinado, el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

En el plano de la innovacion tecnica, lo relevante de este artefacto no es el modelo sino el stack: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD objetivo, y `loom-serve` los ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host). El paquete expone ademas modo de razonamiento con `reasoning_effort` en tres niveles (low, medium, xhigh, por defecto xhigh) y permite desactivar el modo thinking mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto y reescritura de prompts: la funcion declarada del modelo es reescribir prompts, con un modo de razonamiento activado por defecto.
- Razonamiento configurable: `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh); el modo thinking se puede desactivar por peticion.
- Entrada de imagen: soporta partes `image_url` en estilo OpenAI, procesadas por el proyector F16; el pipeline declarado es `image-text-to-text`.
- Tool calling: soporta `tools` y `tool_calls` en estilo OpenAI.
- Bucles de agente multi-turno: la tarjeta incluye puertas de validacion especificas para el bucle de tool calling (`agent` y `agent_think_off`), lo que indica que el caso de uso esta contemplado por el runtime.
- Contexto largo: 262.144 tokens por peticion, con pruebas de referencia registradas sobre documentos de 1k a 32k tokens.
- Concurrencia: hasta 4 peticiones simultaneas, con una puerta de validacion (`consistency`) que verifica que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Capacidades multilingues: no disponibles.
- Audio: no soportado.
- Decodificacion especulativa: no aplicable en este paquete.

## Casos de uso

- Reescritura de prompts para generacion de video o imagen: el modelo esta afinado especificamente para reescribir prompts (nombre `Prompt-Rewriter`), de modo que se puede intercalar entre la entrada del usuario y el modelo generativo final para normalizar, expandir y estructurar descripciones. Su ventana de 262.144 tokens permite arrastrar contexto extenso de la sesion.
- Descripcion de imagenes a texto estructurado: con el proyector F16 y el pipeline `image-text-to-text`, se puede enviar una imagen y obtener una descripcion textual en el formato que espere un pipeline posterior, por ejemplo para anotacion semiautomatica de catalogos.
- Asistente con acceso a herramientas: el soporte de `tools` y `tool_calls` en estilo OpenAI permite montar un agente que consulte APIs externas y encadene varias llamadas; la puerta `agent` del paquete valida el renderizado exacto del prompt y la reutilizacion de historial en ese bucle.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete esta generado para Strix Halo y R9700, de modo que permite servir un modelo de 27B en Q4_K_M en equipos con GPU AMD integrada o profesional, sin depender de ROCm generico ni de llama.cpp.
- Procesamiento de documentos largos con vision: combinando la ventana de 262.144 tokens y la entrada de imagen, se pueden enviar lotes de paginas escaneadas junto con instrucciones extensas para extraccion o resumen; el limite practico es el maximo de 4.096 tokens de salida por peticion.
- Servicio interno con concurrencia moderada: con 4 peticiones simultaneas y una API compatible con OpenAI, encaja en un backend de uso interno (herramientas de equipo, preprocesado de contenidos) donde no se requiere alta concurrencia pero si compatibilidad con clientes existentes.
- Evaluacion comparativa de stacks de inferencia en AMD: al incluir puertas de correctitud contra llama.cpp (`golden`, `compare`, `vision`, `logits`), el paquete sirve como banco de pruebas para verificar que un runtime alternativo reproduce fielmente las salidas del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del paquete incluye secciones de rendimiento frente a llama.cpp para Strix Halo y para R9700, pero ambas indican literalmente que los resultados "are not yet re-measured". Del mismo modo, todas las puertas de correctitud aparecen como "not yet re-measured" en ambas plataformas:

| Puerta | Descripcion | Strix Halo | R9700 |
|---|---|---|---|
| `kernel_tests` | Tests unitarios de los kernels generados frente a referencias | no medida | no medida |
| `golden` | Referencia llama.cpp sobre el mismo GGUF (tokens greedy, top-5 log-probs, prompts de 1k-32k) | no medida | no medida |
| `compare` | Salida greedy frente a llama.cpp, token a token | no medida | no medida |
| `vision` | Entrada de imagen frente a llama.cpp con el mismo proyector | no medida | no medida |
| `consistency` | Peticiones concurrentes frente a ejecuciones aisladas | no medida | no medida |
| `spec` | Decodificacion especulativa activada frente a desactivada | no medida | no medida |
| `agent` | Bucle multi-turno de tool calling | no medida | no medida |
| `agent_think_off` | Bucle de tool calling con thinking desactivado | no medida | no medida |
| `sampling` | Comportamiento de temperature, top_k y seed | no medida | no medida |
| `logits` | Lectura de logits en host y coincidencia de argmax/top-k | no medida | no medida |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, un checkpoint de 27B en Q4_K_M ocupa del orden de 16-17 GB de pesos, a lo que hay que sumar el proyector F16 y el pool de memoria del runtime; el paquete declara `--pool_backing=fixed`, que compromete el pool por adelantado.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU consumer: el paquete no declara soporte para GPUs consumer AMD o NVIDIA; solo se listan las dos plataformas AMD anteriores. No hay datos para afirmar compatibilidad con RTX 4090 u otras.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; la API expuesta es `/v1/chat/completions` en estilo OpenAI en `http://127.0.0.1:8080`. No se documenta despliegue via vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Presets incluidos: `chat` (Strix Halo) y `chat-r9700` (R9700).
- Latencia y throughput: no disponibles; las mediciones frente a llama.cpp estan pendientes de re-medicion en ambas plataformas.
- Ajustes de ejecucion documentados: `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este paquete, por lo que la comparacion se limita a caracteristicas declaradas. Se contrasta con el checkpoint GGUF original y con el modelo sin empaquetar:

| Criterio | Este paquete (Loom) | GGUF original (`pytraveler/...-GGUF`) | Checkpoint sin empaquetar |
|---|---|---|---|
| Parametros | 27B (segun nomenclatura) | 27B (segun nomenclatura) | no disponible |
| Contexto | 262.144 tokens | no disponible en la informacion | no disponible |
| Cuantizacion | Q4_K_M + proyector F16 | Q4_K_M (y otras, no detalladas) | no disponible |
| Licencia | MIT | MIT (heredada) | no disponible |
| Hardware | AMD Strix Halo y R9700 | no especificado | no especificado |
| Runtime | `hrx-loom` 0.2.0 | llama.cpp y otros compatibles con GGUF | no disponible |
| Rendimiento medido | pendiente de re-medicion | no disponible | no disponible |
| Descargas / likes | 0 / 0 | no disponible | no disponible |

No se dispone de datos para comparar con alternativas de la misma categoria (por ejemplo, otros reescritores de prompts o modelos multimodales de tamano similar) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de validacion publicada: las diez puertas de correctitud y las mediciones de rendimiento estan marcadas como "not yet re-measured" en ambas plataformas. No hay evidencia publicada de que las salidas coincidan con llama.cpp en esta version del paquete.
- Alcance de hardware muy restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte documentado para otras GPUs, ni AMD consumer, ni NVIDIA.
- Artefacto de empaquetado, no un modelo nuevo: no aporta pesos ni afinado propios; cualquier limitacion del checkpoint base (sesgos, alucinacion, calidad de reescritura) se hereda sin cambios.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del checkpoint base y de los datos de entrenamiento originales, que el paquete no detalla.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento multilingue no esta garantizado ni documentado.
- Limite de salida: 4.096 tokens por peticion (preset `max_tokens`), muy por debajo de la ventana de contexto de 262.144 tokens; las tareas de generacion larga requeriran multiples peticiones.
- Concurrencia baja: 4 peticiones simultaneas, insuficiente para servicios con trafico alto.
- Muestreo no determinado: la tarjeta marca la fila `sampling` como "not determined", de modo que el comportamiento de temperature, top_k y seed no esta verificado.
- Riesgo de alucinacion y sesgos: no cuantificados en la informacion disponible; al ser un modelo de reescritura de prompts, los errores se propagan al sistema generativo que consuma su salida.
- Madurez del artefacto: creado y actualizado el mismo dia (26 de noviembre de 2026), con 0 descargas y 0 likes; no hay senales de uso en produccion.
- Nota sobre la busqueda web: los resultados devueltos corresponden a Loom (la herramienta de grabacion de pantalla) y a una marca de ropa homonima, no al stack de inferencia Loom; no aportan informacion tecnica sobre este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-loom
- Checkpoint GGUF base: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
