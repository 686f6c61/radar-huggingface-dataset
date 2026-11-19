# loom-draft/bartowski-Ornith-1.5-35B-A3B-loom

## Resumen

Ornith-1.5-35B-A3B-loom es un paquete de despliegue en formato `.loom` generado por el proyecto Loom (herramienta `loom-next`) a partir del checkpoint GGUF cuantizado Q4_K_M de Ornith-1.5-35B-A3B, publicado originalmente por bartowski. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que contiene programas `.loom` y un fichero `model.json` que describen cómo ejecutar los pesos sin modificar del GGUF sobre GPUs AMD concretas, en concreto la Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer multimodal de 35.000 millones de parámetros totales con arquitectura MoE (aproximadamente 3.000 millones de parámetros activos por token, a juzgar por la nomenclatura A3B), con soporte de entrada de imagen, tool calling y modo de razonamiento. El paquete Loom añade decodificación especulativa mediante MTP (multi-token prediction) con profundidad 3, activada por defecto, y expone una API compatible con OpenAI en `/v1/chat/completions`.

La relevancia de esta ficha es acotada y hay que enmarcarla con precisión: el paquete tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 19 de noviembre de 2026 y, según su propia model card, las mediciones de rendimiento y las compuertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, etc.) figuran como "not yet re-measured" en ambas GPUs. Es decir, el autor no aporta evidencia empírica publicada de que el paquete funcione o rinda como se espera. Su interés es el de una herramienta de despliegue para hardware AMD, no el de un modelo evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deducido de la nomenclatura "35B-A3B"; detalles internos no disponibles) |
| Parametros totales | 35B (según nombre del checkpoint) |
| Parametros activos | ~3B (según sufijo "A3B"; cifra exacta no disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del GGUF base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Ornith-1.5-35B-A3B-Q4_K_M.gguf`) + proyector `mmproj-Ornith-1.5-35B-A3B-bf16.gguf`; paquete `.loom` con `model.json` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de lo que se deduce del nombre: un transformer con mezcla de expertos de 35B parámetros totales y aproximadamente 3B activos. El paquete Loom no modifica los pesos; solo genera kernels y programas de ejecución específicos para las arquitecturas AMD gfx1151 y gfx1201, junto con un descriptor `model.json` y su fichero de bloqueo `model.json.lock` con hashes sha256 de los ficheros fuente.

En el plano del despliegue, la innovación destacable es la decodificación especulativa mediante MTP con profundidad 3, activada por defecto, y la inclusión de un proyector multimodal separado en bf16 para la entrada de imagen. No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen (pipeline `image-text-to-text`) mediante partes `image_url` al estilo OpenAI, usando el proyector `mmproj-Ornith-1.5-35B-A3B-bf16.gguf`.
- Tool calling al estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles agénticos multi-turno con reutilización de historial (según las compuertas `agent` y `agent_think_off` descritas, aunque sin mediciones registradas).
- Decodificación especulativa MTP con profundidad 3, activa por defecto.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395 "Strix Halo": el paquete incluye el preset `chat` con los comandos exactos de `loom-fetch` y `loom-serve`, lo que permite servir el modelo con API OpenAI sin configurar manualmente kernels ROCm.
- Inferencia en servidores con Radeon AI PRO R9700 de 32 GB: el preset `chat-r9700` está generado específicamente para gfx1201, lo que facilita usar hardware AMD de centro de datos en lugar de GPUs NVIDIA.
- Asistentes con contexto documental largo: la ventana de 262.144 tokens por petición permite cargar documentos extensos o historiales de conversación amplios en una sola llamada, útil para análisis de contratos, informes o bases de código.
- Automatización con herramientas: el soporte de `tools`/`tool_calls` y el bucle agéntico permiten construir agentes que consulten APIs, bases de datos o sistemas internos, con la opción de desactivar el modo thinking para reducir latencia en tareas mecánicas.
- Procesamiento de documentos escaneados o capturas: la entrada de imagen vía proyector multimodal permite extraer información de facturas, formularios o diagramas dentro del mismo flujo conversacional.
- Evaluación comparativa de runtimes AMD: al estar generado contra un checkpoint GGUF de referencia, el paquete sirve para contrastar el comportamiento de los kernels Loom frente a llama.cpp sobre el mismo modelo y la misma cuantización, usando las compuertas `golden` y `compare`.
- Prototipado de decodificación especulativa: con MTP de profundidad 3 activo por defecto y una compuerta `spec` diseñada para verificar que la salida con especulación coincide exactamente con la salida sin ella, es un banco de pruebas para medir el impacto de esta técnica en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs. Tampoco se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible. El checkpoint es Q4_K_M de un modelo de 35B, pero el autor no publica el tamaño exacto del fichero ni el consumo medido; la R9700 dispone de 32 GB.
- GPUs consumer: no se documenta compatibilidad con GPUs de consumo AMD o NVIDIA; los presets están generados solo para gfx1151 y gfx1201.
- Opciones de despliegue: `loom-serve` con `hrx-loom[hf]==0.2.0` (instalable vía pipx). El paquete se obtiene con `loom-fetch` desde Hugging Face. No se documenta despliegue con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Flags de ejecución relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (compromete el pool de memoria por adelantado) y `--parameter_mode=preload` (solo afecta a la carga de pesos en host).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-loom | 35B totales / ~3B activos | 262.144 | MIT | `.loom` + GGUF Q4_K_M | Paquete específico para AMD gfx1151/gfx1201; sin benchmarks publicados |
| bartowski/Ornith-1.5-35B-A3B-GGUF | 35B totales / ~3B activos | no disponible en esta ficha | MIT (según este paquete) | GGUF | Checkpoint base sin empaquetar; ejecutable con llama.cpp y runtimes compatibles |
| Alternativas de la misma categoría (MoE ~30-40B con ~3B activos) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de evidencia empírica: todas las compuertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured". No hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Paquete sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día. No hay historial de uso que respalde su fiabilidad.
- Alcance de hardware muy restringido: solo se han generado presets para gfx1151 y gfx1201. No es portable a otras GPUs sin regenerar el paquete.
- Sin datos de idiomas: no se puede confirmar el soporte de castellano ni de otras lenguas, ni la calidad en ellas.
- Sin datos de sesgos ni de alucinación del modelo base: no disponibles en la información proporcionada.
- Límite de salida de 4.096 tokens por petición, que puede ser insuficiente para generación de código extensa o documentos largos pese al contexto de 262.144 tokens.
- Concurrencia limitada a 4 peticiones simultáneas en el preset, lo que restringe su uso como servidor de producción de alta carga.
- Licencia MIT declarada por el empaquetador; conviene verificar la licencia del checkpoint base y del modelo original antes de uso comercial, ya que esta ficha no la confirma de forma independiente.
- La búsqueda web realizada no devuelve información sobre el modelo ni sobre el proyecto Loom: los resultados corresponden a productos homónimos sin relación (Loom la herramienta de grabación de vídeo y la marca de ropa Loom). Los únicos datos fiables son los de la model card y los metadatos de Hugging Face.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Ornith-1.5-35B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
