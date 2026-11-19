# loom-draft/mradermacher-Hemmingway-1.5-Unlocked-loom

## Resumen

`loom-draft/mradermacher-Hemmingway-1.5-Unlocked-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `mradermacher/Hemmingway-1.5-Unlocked-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo entrenado por el autor del repositorio, sino de un artefacto de empaquetado que adapta un GGUF preexistente para su ejecucion en GPUs AMD mediante el runtime `hrx-loom` (version 0.2.0). El pipeline declarado es `image-text-to-text`, lo que confirma que el modelo subyacente acepta entradas de imagen ademas de texto.

El paquete esta orientado especificamente a dos aceleradores AMD: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (objetivo de compilacion gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). El repositorio no contiene los pesos en si (tamano de 0.0 GB), sino los metadatos y programas necesarios para que `loom-fetch` los descargue y `loom-serve` los sirva con una API compatible con OpenAI.

Su relevancia es acotada pero concreta: demuestra el flujo de empaquetado del ecosistema Loom para modelos multimodales con decodificacion especulativa (MTP) sobre hardware AMD de consumo y profesional. La informacion publicada por el autor es escasa en cuanto al modelo base (parametros, licencia, idiomas, datos de entrenamiento) y las mediciones de rendimiento y correccion aparecen como "no re-medidas" en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GGUF multimodal; arquitectura interna no especificada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint referenciado); proyector multimodal en F16 (`Hemmingway-1.5-Unlocked.mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como paquete Loom con programas `.loom` y `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, atencion lineal u otras variantes), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron fases de RLHF o DPO. El repositorio es un artefacto de empaquetado generado con `loom-next` "sin LLM en el bucle", es decir, mediante la herramienta generadora unicamente, y no incluye documentacion del proceso de entrenamiento del modelo original.

Lo que si documenta la model card es la capa de ejecucion: el paquete integra decodificacion especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto, y un proyector multimodal separado en F16 para la entrada de imagenes. El runtime `loom-serve` expone una API estilo OpenAI, soporta 4 peticiones concurrentes y permite alternar el modo de razonamiento con `chat_template_kwargs: {"enable_thinking": false}` y ajustar el esfuerzo con `reasoning_effort` (valores `low`, `medium`, `xhigh`, por defecto `xhigh`). La generacion se limita a 4.096 tokens de salida por defecto segun el preset `max_tokens`.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y tres niveles de esfuerzo (`low`, `medium`, `xhigh`).
- Entrada de imagenes en formato OpenAI `image_url`, gestionada por el proyector `Hemmingway-1.5-Unlocked.mmproj-f16.gguf` (capacidad image-text-to-text).
- Tool calling / function calling con esquema estilo OpenAI (`tools` y `tool_calls`).
- Decodificacion especulativa con MTP a profundidad 3, activa por defecto.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 262.144 tokens por peticion.
- Entrada y salida de audio: no aplicable segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en Strix Halo: usar `loom-fetch` con el preset `chat` y `loom-serve` sobre un Ryzen AI Max+ 395 para servir un modelo multimodal cuantizado en Q4_K_M sin depender de CUDA ni de GPUs NVIDIA.
- Inferencia en Radeon AI PRO R9700: emplear el preset `chat-r9700` para aprovechar los 32 GB de VRAM de la GPU profesional en cargas de imagen-texto con contexto largo.
- Asistentes con razonamiento controlado: ajustar `reasoning_effort` a `low` para respuestas rapidas en tareas simples y a `xhigh` en problemas que requieran cadenas de razonamiento mas largas, usando el mismo endpoint.
- Agentes con tool calling: construir bucles multi-turno de llamadas a herramientas sobre la API OpenAI-style, apoyandose en el soporte nativo de `tools`/`tool_calls` y en la ventana de 262.144 tokens para mantener historial extenso.
- Procesamiento de documentos e imagenes: enviar capturas, diagramas o paginas escaneadas como partes `image_url` junto con instrucciones textuales para extraccion de informacion o resumen, gracias al proyector multimodal incluido.
- Sustitucion de llama.cpp en entornos AMD: migrar un flujo existente basado en llama.cpp a `loom-serve` manteniendo el mismo GGUF y comparando salidas con las puertas de correccion (`golden`, `compare`, `vision`) que documenta el proyecto.
- Pruebas de decodificacion especulativa: evaluar el impacto de MTP a profundidad 3 en latencia y throughput en hardware gfx1151/gfx1201, comparando con la decodificacion estandar del mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como no re-medidas en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M y el objetivo R9700 dispone de 32 GB, mientras que Strix Halo es un SoC con memoria unificada.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no confirmada en la informacion proporcionada; el paquete esta dirigido a los dos aceleradores AMD citados.
- Despliegue: runtime `hrx-loom` 0.2.0 instalado via `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Flags relevantes: `--pool_backing=fixed`, `--parameter_mode=preload`, `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card no estan re-medidas para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-Hemmingway-1.5-Unlocked-loom` | no disponible | 262.144 | Paquete Loom sobre GGUF Q4_K_M | no disponible | Runtime `hrx-loom`, objetivo AMD gfx1151/gfx1201 |
| `mradermacher/Hemmingway-1.5-Unlocked-GGUF` | no disponible | no disponible en la informacion proporcionada | GGUF | no disponible | Checkpoint base sin modificar del que deriva el paquete |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | GGUF | no disponible | Referencia de correccion usada por las puertas `golden`/`compare`; ejecutable en multiples backends |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a la relacion con el checkpoint base y con llama.cpp como referencia de ejecucion.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0.0 GB); es un paquete de metadatos y programas que requiere descargar el GGUF subyacente mediante `loom-fetch`.
- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido; debe verificarse en el repositorio del modelo base.
- No hay informacion sobre sesgos, riesgo de alucinacion o calidad multilingue del modelo subyacente.
- Las mediciones de rendimiento y las puertas de correccion no estan re-medidas para este paquete, por lo que no hay garantia publicada de equivalencia funcional con llama.cpp en esta configuracion concreta.
- El soporte de sampling figura como "no determinado" en la tabla de caracteristicas, lo que limita la confianza en la reproducibilidad de la generacion.
- La salida maxima por defecto es de 4.096 tokens y la concurrencia esta limitada a 4 peticiones, lo que puede ser insuficiente para cargas de alta demanda.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y del runtime `hrx-loom` 0.2.0; no hay indicacion de soporte para otras GPUs o backends.
- Los resultados de busqueda web disponibles corresponden a servicios no relacionados (grabacion de pantalla, tienda de ropa, restaurante) y no aportan informacion tecnica sobre el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Hemmingway-1.5-Unlocked-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Hemmingway-1.5-Unlocked-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
