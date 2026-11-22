# litert-community/Jan-nano

## Resumen

Jan-nano es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por Menlo, obtenido mediante un ajuste fino de Qwen3-4B con una receta multi-etapa de RLVR (Reinforcement Learning with Verifiable Rewards) y optimizado para el uso de herramientas a través del Model Context Protocol (MCP). Está diseñado específicamente como agente de investigación profunda (*deep-research agent*), es decir, para planificar y ejecutar búsquedas y consultas encadenadas mediante herramientas externas. Es un modelo de razonamiento: emite una cadena de pensamiento entre etiquetas `<think>…</think>` antes de su respuesta final.

La ficha que nos ocupa no corresponde al modelo original, sino a la conversión publicada por `litert-community` al formato **LiteRT-LM** (`.litertlm`), el runtime on-device de Google (sucesor de TensorFlow Lite). Esta conversión permite ejecutar el modelo en dispositivos de borde —teléfonos Android, Macs con Apple Silicon o una Raspberry Pi 5— sin necesidad de infraestructura de servidor. Se publican dos variantes: `model.litertlm` y `model_block32.litertlm`, ambas con pesos cuantizados a int4 por bloques.

La relevancia actual reside en que demuestra que un modelo de razonamiento de 4B con capacidades de agente puede ejecutarse íntegramente en un teléfono con aceleración GPU a velocidades utilizables (del orden de 9 a 20 tokens/s en decodificación según el dispositivo), lo que habilita asistentes de investigación locales con privacidad de datos y sin coste de inferencia en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), derivado de Qwen3-4B |
| Parametros totales | 4B (heredados del modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 por bloques (*blockwise int4*); variante `model_block32` con bloques de 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del repo 20,6 GB, archivo individual `model.litertlm` de 2,3 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3, con 4B parámetros, ajustado por Menlo mediante una receta multi-etapa de RLVR sobre Qwen3-4B. El entrenamiento con recompensas verificables está orientado a tareas de agente: uso de herramientas vía MCP, planificación en varios pasos y razonamiento explícito previo a la respuesta. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas concretas de RLHF/DPO.

La conversión a LiteRT-LM se realizó con `litert-torch` (antiguo `ai-edge-torch`), el conversor de PyTorch de LiteRT, reutilizando el conversor y el runtime existentes para Qwen3. Los archivos publicados el 2026-11-16 sustituyen a los anteriores con un grafo de prefill/decode reescrito para GPU, manteniendo todos los pesos sin cambios. La cuantización int4 por bloques reduce el peso a aproximadamente 2,3 GiB, lo que hace viable su carga en memoria de dispositivos móviles. El modo de razonamiento (`<think>`) está activo por defecto y, según la model card, `--thinking false` no lo desactiva en litert-lm 0.19.2.

## Capacidades

- Generación de texto con razonamiento explícito: emite una cadena de pensamiento entre `<think>` y `</think>` antes de la respuesta.
- Uso de herramientas mediante el Model Context Protocol (MCP), capacidad para la que fue específicamente optimizado.
- Planificación de investigación profunda: descomposición de consultas y ejecución de búsquedas encadenadas.
- Razonamiento multi-paso y comportamiento agéntico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo de texto).
- Ejecución on-device con aceleración GPU (WebGPU en navegador, GPU Android, GPU de Apple Silicon).

## Casos de uso

- **Asistente de investigación local en el móvil**: el modelo puede planificar y ejecutar búsquedas encadenadas sobre fuentes externas mediante MCP directamente en un Galaxy S26, con 9,3 tok/s de decodificación en GPU y sin enviar datos a la nube.
- **Navegación y análisis de repositorios de código**: la propia model card propone el caso de "planificar cómo encontrar dónde se configuran los reintentos HTTP en un repositorio Python", usando el modelo para localizar puntos de configuración mediante pasos de razonamiento.
- **Chat en el navegador sin backend**: la demo oficial de LiteRT-LM carga el modelo vía WebGPU en el navegador (descarga de 2,47 GB desde la rama `web`), útil para prototipos y demos públicas sin infraestructura de servidor.
- **Automatización en dispositivos de borde industriales o IoT**: la ejecución en Raspberry Pi 5 con CPU y 4 hilos (1,4–1,5 tok/s de decodificación) permite integrar un agente de consulta en equipos de bajo consumo donde no hay conectividad fiable.
- **Procesamiento con privacidad de datos en el dispositivo**: al ejecutarse íntegramente en local, es adecuado para flujos donde la información no puede salir del terminal (sanidad, legal, datos personales).
- **Agente de consulta documental con MCP**: integrable con servidores MCP locales para consultar bases de conocimiento, ficheros o APIs internas, aprovechando su ajuste específico para tool calling.
- **Prototipado rápido de agentes de razonamiento**: permite validar pipelines agénticos con un modelo de 4B cuantizado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son mediciones de rendimiento en dispositivo:

| Dispositivo | Runtime | Modo | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Mac Studio M4 Max | LiteRT-LM 0.14.0 | GPU | 69,0 | 970 | 278 ms |
| Galaxy S26 (`model.litertlm`) | LiteRT-LM v0.19.0 | GPU | 20,4 | 171 (1.024 tok) | no disponible |
| Galaxy S26 (`model_block32`) | LiteRT-LM 0.16.0 | GPU | 9,3 | 102 | 2,08 s |
| Galaxy S26 (`model_block32`) | LiteRT-LM 0.16.0 | CPU | 5,9 | 29 | 7,14 s |
| Galaxy S26 (`model_block32`) | LiteRT-LM v0.19.0 | GPU | 18,2 | 161 (1.024 tok) | no disponible |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | 1,4–1,5 | 10–11 | 25,5–28,0 s |

Nota: las mediciones de Mac y Raspberry Pi corresponden a archivos anteriores a los publicados el 2026-11-16; las de Galaxy S26 con v0.19.0 corresponden a los archivos actuales. En Galaxy S26, los archivos nuevos decodificaron 1,45–1,54 veces más rápido y prefillaron 1,30–1,41 veces más rápido que los anteriores.

## Requisitos de hardware

- **VRAM/memoria**: el archivo `model.litertlm` ocupa 2,3 GiB; en Galaxy S26 el contador de asignación GPU del sistema (`kgsl_page_alloc`) subió 4,83 GB durante la ejecución (`model.litertlm`) y 5,21 GB (`model_block32.litertlm`).
- **GPU recomendadas**: Apple Silicon (M4 Max medido), GPU de Android de gama alta (Galaxy S26, Pixel 11 Pro), WebGPU en navegador.
- **CPU**: funciona en Raspberry Pi 5 con 4 hilos, aunque a 1,4–1,5 tok/s de decodificación.
- **¿Cabe en GPU de consumo?** Sí: con 2,3 GiB de pesos int4, cualquier GPU consumer con más de 4 GB de memoria libre puede alojarlo; las mediciones publicadas se centran en móviles y Apple Silicon.
- **Opciones de despliegue**: LiteRT-LM (CLI `litert-lm` desde 0.14.0; los archivos actuales requieren 0.19.0 o superior en Android), WebGPU en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia**: TTFT de 278 ms en Mac Studio M4 Max y de 2,08 s en Galaxy S26 GPU; en Raspberry Pi 5 el TTFT alcanza 25,5–28,0 s, lo que limita su uso a tareas por lotes o de baja interactividad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Jan-nano (LiteRT-LM) | 4B | no disponible | `.litertlm`, on-device | Apache 2.0 | Agente deep-research con MCP, modo razonamiento |
| Qwen3-4B (modelo base) | 4B | no disponible | safetensors, GGUF, múltiples runtimes | Apache 2.0 | Modelo generalista del que deriva; sin ajuste específico para agentes |
| Menlo/Jan-nano (original) | 4B | no disponible | safetensors (Hugging Face) | Apache 2.0 | Mismo modelo sin conversión a LiteRT-LM; requiere runtime de servidor o GPU estándar |

No se dispone de datos de benchmarks que permitan comparar la calidad de Jan-nano frente a alternativas de su misma categoría; la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- **Es un modelo de razonamiento**: emite una cadena `<think>` antes de responder; con litert-lm 0.19.2, `--thinking false` no la desactiva, por lo que hay que asignar un límite de tokens alto o la respuesta puede truncarse.
- **Caché de descargas del CLI**: `litert-lm` (0.14.0–0.19.2) reutiliza un `model.litertlm` descargado previamente sin verificar su integridad contra el repositorio; una copia anterior al 2026-11-16 o una descarga incompleta seguirá en uso hasta borrarla manualmente.
- **Requisito de versión en Android**: la ruta GPU en Android necesita LiteRT-LM 0.19.0 o superior.
- **Sin validación en iPhone**: los archivos publicados el 2026-11-16 no se ejecutaron en iPhone (los anteriores sí).
- **Tiempo de compilación inicial**: en la demo web, la primera carga compiló el modelo durante 13 minutos en un M4 Max antes de responder.
- **Rendimiento muy limitado en CPU de bajo consumo**: 1,4–1,5 tok/s en Raspberry Pi 5 hace inviable la interacción en tiempo real.
- **Idiomas no documentados**: la información disponible no especifica la cobertura lingüística; no debe asumirse un buen rendimiento en castellano sin evaluarlo.
- **Sesgos y alucinaciones**: no se documentan análisis específicos; al ser un modelo de 4B ajustado para agentes, existe riesgo de alucinación en la planificación y en la selección de herramientas, que debe mitigarse con validación externa.
- **Licencia Apache 2.0**: permite uso comercial, pero debe conservarse el aviso de licencia y tenerse en cuenta que el modelo base es Qwen3-4B, también Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Jan-nano
- Modelo base original: https://huggingface.co/Menlo/Jan-nano
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Jan-nano
- Ficha de rendimiento edge-compat (jan-nano): https://github.com/john-rocky/edge-compat/blob/main/cards/jan-nano/CARD.md
- Ficha de rendimiento edge-compat (jan-nano-model-block32): https://github.com/john-rocky/edge-compat/blob/main/cards/jan-nano-model-block32/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
