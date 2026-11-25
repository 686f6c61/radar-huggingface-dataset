# litert-community/Ministral-3-3B-Reasoning-2512

## Resumen

Ministral-3-3B-Reasoning-2512 en formato LiteRT-LM es una conversión del modelo de razonamiento Ministral 3B de Mistral AI, publicada por la comunidad `litert-community`, pensada para inferencia en dispositivo (on-device) y en el borde (edge) mediante el runtime LiteRT-LM de Google. El paquete `.litertlm` incluye tokenizador, plantilla de prompt y pesos cuantizados en un único fichero de 2,34 GB, lo que simplifica el despliegue en móviles, portátiles y navegadores sin necesidad de infraestructura de servidor.

La conversión es solo de texto: se conserva el decodificador de Ministral-3 y se descarta la torre de visión Pixtral del modelo base. Los pesos están cuantizados a int4 por bloques (bloque 32, simétrico, con recorte OCTAV) y el embedding y la cabeza lm_head atados se mantienen en INT8. La ventana de contexto del KV cache está fijada en 4096 tokens.

El interés actual del modelo radica en que demuestra que un modelo de razonamiento de 3B puede ejecutarse en hardware de consumo con latencias utilizables: en una GPU de Galaxy S26 alcanza 22,3 tokens/s de decodificación y 213 tokens/s de prefill sobre 1.024 tokens. Es una opción relevante para prototipos de agentes locales, asistentes offline y demos web con WebGPU, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Ministral-3; sin torre de visión) |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (KV cache del paquete LiteRT-LM) |
| Tipos de cuantizacion | int4 por bloques (bloque 32, simétrico, OCTAV clipping); embedding/lm_head atados en INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); no se publican safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo base es `mistralai/Ministral-3-3B-Reasoning-2512`, un transformer decoder-only denso de 3B parámetros orientado a razonamiento paso a paso (genera un bloque de pensamiento antes de la respuesta final). La conversión de LiteRT-LM mantiene únicamente el decodificador de texto; la información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo original.

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado y la optimización para edge: cuantización int4 por bloques con recorte OCTAV, embedding y lm_head atados en INT8, y un grafo de prefill/decode reescrito para GPU (versión del 2026-11-16, sin cambios en los pesos). El bundle incorpora tokenizador y plantilla nativa de Mistral (`[INST] … [/INST]`, stop token `</s>`), y el runtime expone un canal de pensamiento separado (`[thought] … [/thought]`).

## Capacidades

- Generación de texto y razonamiento paso a paso con canal de pensamiento explícito.
- Razonamiento matemático de tipo chain-of-thought (el ejemplo de la model card resuelve un problema aritmético de dos pasos correctamente).
- Generación de código y respuesta a instrucciones en formato chat de Mistral.
- Inferencia on-device en Android (GPU y CPU), macOS y navegador con WebGPU.
- Streaming de tokens mediante `send_message_async` en el runtime LiteRT-LM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión: no soportada en esta conversión (torre Pixtral descartada).

## Casos de uso

- Asistentes offline en móvil Android: el paquete de 2,34 GB se ejecuta con LiteRT-LM 0.19.0 o superior en la GPU del dispositivo (22,3 tok/s de decode en Galaxy S26), lo que permite asistentes sin conexión con contexto de 4.096 tokens.
- Demos web sin backend: la rama `web` del repo permite cargar el modelo en el navegador con WebGPU y ejecutar chat interactivo sin servidor.
- Razonamiento matemático y resolución de problemas paso a paso: el canal de pensamiento permite auditar el razonamiento intermedio, útil en herramientas educativas o de verificación.
- Prototipado de agentes locales: el modelo puede integrarse en pipelines de agentes en el propio dispositivo para tareas de clasificación, extracción o generación de texto con baja latencia de prefill (213 tok/s sobre 1.024 tokens).
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, los datos no salen del terminal, adecuado para sectores regulados o datos personales.
- Evaluación de runtimes edge: sirve como banco de pruebas para medir throughput y consumo de memoria (4,69 GB de pico en CPU de Galaxy S26) en distintas plataformas antes de comprometerse con un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son de inferencia en dispositivo:

| Plataforma | Metrica | Valor |
|---|---|---|
| Galaxy S26, GPU | Decodificacion | 22,3 tokens/s |
| Galaxy S26, GPU | Prefill (1.024 tokens) | 213 tokens/s |
| Galaxy S26, GPU | Memoria GPU adicional (`kgsl_page_alloc`) | 4,35 GB |
| Galaxy S26, CPU | Memoria pico (`VmHWM`) | 4,69 GB |
| Pixel 11 Pro, GPU | Decodificacion vs. fichero anterior | 1,31–1,40x mas rapido |
| Pixel 11 Pro, GPU | Prefill vs. fichero anterior | 1,22–1,39x mas rapido |

Mediciones realizadas con LiteRT-LM v0.19.0; cada ejecución repite la carga tres veces y se reporta la mediana de las iteraciones 2 y 3 sobre dos pasadas.

## Requisitos de hardware

- VRAM/almacenamiento: fichero de 2,34 GB; asignación GPU de 4,35 GB en Galaxy S26; pico de memoria en CPU de 4,69 GB.
- GPU recomendadas: GPU integradas de móviles recientes (Galaxy S26, Pixel 11 Pro) con soporte LiteRT-LM 0.19.0 o superior; en Mac, ejecución validada con LiteRT-LM 0.19.1–0.19.2.
- Consumer GPU de escritorio: no se han publicado mediciones con A100, H100 ni RTX 4090; el modelo está pensado para edge, no para servidor.
- Navegador: WebGPU con descarga de 2,34 GB desde la rama `web`.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run`, binario `litert_lm_main` con `--backend gpu`), API Python con `send_message` y `send_message_async`, y demo web WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el prefill es sustancialmente más rápido que el decode en GPU móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Reasoning-2512 (LiteRT-LM) | 3B | 4096 (KV cache) | `.litertlm` int4 | Apache-2.0 | Optimizado para edge; sin visión |
| mistralai/Ministral-3-3B-Reasoning-2512 | 3B | no disponible | safetensors (base) | Apache-2.0 | Modelo original con torre Pixtral |
| Otros modelos edge de 3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El flag `--thinking false` no desactiva el bloque de pensamiento con litert-lm 0.19.2; hay que asignar un límite de tokens alto para evitar respuestas truncadas.
- En litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` y puede provocar un crash; usar `send_message_async` para respuestas largas.
- La CLI de litert-lm (0.14.0–0.19.2) reutiliza un `model.litertlm` descargado previamente sin verificar contra el repo; ficheros antiguos o descargas incompletas quedan en uso hasta borrarlos manualmente.
- En Android la ruta GPU requiere LiteRT-LM 0.19.0 o superior.
- El fichero no se ha probado en iOS.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin capacidades de visión ni de audio en esta conversión.
- Riesgo de alucinación inherente a modelos de 3B; no se han publicado evaluaciones de sesgo ni de robustez.
- Idiomas soportados no documentados; no se garantiza calidad multilingüe más allá del inglés.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base y del runtime LiteRT-LM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Ministral-3-3B-Reasoning-2512
