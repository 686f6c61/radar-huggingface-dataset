# loom-draft/mradermacher-Kitchoon-Final-26B-A4B-i1-loom

## Resumen

`loom-draft/mradermacher-Kitchoon-Final-26B-A4B-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF`, en su variante `Kitchoon-Final-26B-A4B.i1-Q4_K_M.gguf`. No es un modelo nuevo: es un artefacto de empaquetado que traduce un GGUF preexistente a un preset ejecutable con `loom-serve` sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete lo publica la organizacion `loom-draft` y se genera con `loom-next`, el generador del ecosistema Loom (sin LLM en el bucle, segun la model card). El modelo subyacente, segun el nombre del checkpoint, es un Mixture of Experts de 26B parametros totales con 4B activos, cuantizado a Q4_K_M, con soporte declarado de tool calling, modo de razonamiento opcional y una ventana de contexto de 201.728 tokens por peticion.

Su relevancia es de nicho pero clara: permite servir ese GGUF en hardware AMD consumer y profesional mediante una pila propia (hrx-loom 0.2.0) con API compatible con OpenAI, sin depender de llama.cpp. El repositorio esta vacio (0.0 GB, 0 descargas) y las mediciones de rendimiento y las puertas de correccion estan marcadas como "not yet re-measured", por lo que hoy no hay evidencia publicada de su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente tipo MoE, segun nomenclatura A4B; no confirmado en la informacion) |
| Parametros totales | 26B (segun el nombre del checkpoint) |
| Parametros activos | 4B (segun el nombre del checkpoint, sufijo A4B) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado como paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo subyacente. El identificador `26B-A4B` sigue la convencion habitual para modelos Mixture of Experts con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, pero la model card no confirma capa a capa ni el numero de expertos, ni el ratio de activacion, ni el tipo de atencion. Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o etapas de post-entrenamiento.

Lo que si documenta el paquete es la capa de despliegue: `loom-next` genera kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). La decodificacion especulativa y el ajuste de esfuerzo de razonamiento figuran como "not applicable". El modo de razonamiento existe pero esta desactivado por defecto y se activa con `chat_template_kwargs: {"enable_thinking": true}`.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling con el esquema de OpenAI (`tools` y `tool_calls`), incluyendo bucles multi-turno con reutilizacion de historial segun la puerta `agent`.
- Modo de razonamiento opcional (thinking), desactivado por defecto.
- Contexto largo de hasta 201.728 tokens por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene.
- Capacidades multilingues: no disponibles en la informacion.
- Muestreo (temperature, top_k, seed): marcado como "not determined" en la tabla de caracteristicas.

## Casos de uso

- Desarrollo y validacion de la pila Loom en hardware AMD: el paquete sirve como preset de referencia para probar `loom-serve` sobre Strix Halo o R9700 antes de desplegar modelos propios, ya que incluye comandos de arranque reproducibles y puertas de correccion definidas.
- Servicio local de chat con API OpenAI: equipos que ya tengan una Radeon AI PRO R9700 pueden levantar un endpoint `/v1/chat/completions` en localhost y conectar clientes existentes sin cambiar codigo, gracias a la compatibilidad de la API.
- Agentes con tool calling en estaciones de trabajo: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir asistentes que consulten APIs internas o bases de datos, con el limite de 4 peticiones concurrentes como restriccion de dimensionado.
- Procesamiento de documentos largos: la ventana de 201.728 tokens permite analizar contratos, informes o expedientes completos en una sola peticion, util en entornos con requisitos de soberania de datos donde no se quiere enviar contenido a la nube.
- Evaluacion comparativa frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para contrastar token a token la salida de Loom con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util en tareas de validacion de runtimes.
- Pruebas de conformidad de concurrencia: la puerta `consistency` verifica que 4 peticiones concurrentes producen la misma salida que ejecutadas por separado, relevante para equipos que validen despliegues multi-usuario.
- Inferencia en equipo de sobremesa con GPU integrada: Strix Halo (gfx1151) es un APU, de modo que el paquete apunta a escenarios sin GPU discreta, aunque las cifras de rendimiento para esa plataforma aun no se han publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700 "are not yet re-measured", y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como "not yet re-measured". Una puerta sin ejecucion registrada no aporta evidencia, segun la propia documentacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es un GGUF Q4_K_M de un modelo de 26B parametros, lo que en la practica ronda los 15-16 GB solo de pesos, mas overhead de contexto y pool de memoria; el paquete esta pensado para la R9700 de 32 GB y para el APU Strix Halo con memoria unificada.
- GPU soportadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA ni otras arquitecturas AMD.
- GPU consumer: el paquete no declara soporte para GPUs de consumo tipo RX 7900 XTX ni para GPUs NVIDIA; la unica via documentada es `loom-serve` sobre los dos destinos AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--pool_backing=fixed --parameter_mode=preload`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las tablas de rendimiento estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-i1 (Loom, este paquete) | 26B totales / 4B activos | 201.728 tokens | Paquete Loom sobre GGUF Q4_K_M | Apache 2.0 | Solo AMD gfx1151 y gfx1201; rendimiento sin medir |
| mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF | 26B totales / 4B activos | no disponible | GGUF | Apache 2.0 (heredada) | Checkpoint de origen; ejecutable con llama.cpp y derivados |
| llama.cpp (runtime) | no aplica | depende del modelo | GGUF | MIT | Referencia de correccion usada por las puertas de Loom; multiplataforma |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones. La comparacion relevante es de empaquetado y portabilidad: el GGUF original es portable a cualquier runtime compatible, mientras que este paquete esta atado a `hrx-loom` y a dos arquitecturas AMD concretas.

## Limitaciones y advertencias

- El repositorio esta practicamente vacio (0.0 GB) y sin descargas; no hay evidencia de que el paquete sea funcional mas alla de lo que declara la model card.
- Ninguna de las puertas de correccion ni las mediciones de rendimiento se ha re-medido para este paquete: no hay garantia publicada de que la salida coincida con llama.cpp.
- Dependencia de una pila propietaria del ecosistema Loom (`hrx-loom==0.2.0`) y de dos arquitecturas AMD especificas; no hay soporte declarado para NVIDIA, otras AMD ni CPU.
- Capacidades del modelo original no disponibles en este despliegue: entrada de imagen y audio estan marcadas como no soportadas por Loom pese a que el modelo subyacente las tiene.
- Limite de 4 peticiones concurrentes y 4.096 tokens de salida por defecto, insuficiente para muchas cargas de produccion sin ajuste del preset.
- El muestreo figura como "not determined", lo que impide garantizar el comportamiento de temperature, top_k y seed.
- Idiomas soportados no documentados; no se puede asumir calidad en castellano sin evaluacion previa.
- Licencia Apache 2.0 declarada, permisiva para uso comercial, pero conviene verificar que la licencia del modelo base se mantiene en toda la cadena de derivacion.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- La busqueda web no devuelve resultados relacionados con este modelo: los enlaces encontrados corresponden a productos no relacionados (Loom.com, Loom.fr, Atlassian Loom) y no aportan informacion tecnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Kitchoon-Final-26B-A4B-i1-loom
- Modelo base en Hugging Face: https://huggingface.co/mradermacher/Kitchoon-Final-26B-A4B-i1-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
