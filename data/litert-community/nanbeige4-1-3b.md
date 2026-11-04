# litert-community/Nanbeige4.1-3B

## Resumen

Nanbeige4.1-3B es un modelo de lenguaje denso de 3.000 millones de parametros desarrollado por Nanbeige y publicado bajo licencia Apache-2.0. Está construido sobre una arquitectura transformer tipo Llama y está especializado en razonamiento: genera una cadena de pensamiento dentro de un bloque `<think>…</think>` antes de emitir la respuesta final. La versión aquí descrita es una conversión comunitaria al formato LiteRT-LM (`.litertlm`), realizada por `litert-community` para inferencia en dispositivo (on-device) con el runtime de Google AI Edge.

Esta conversión cuantiza los pesos a int4 por bloques (bloque 32) con recorte óptimo OCTAV simétrico y embeddings en INT8, reduciendo el bundle a aproximadamente 2,2 GB. El objetivo es ejecutar un modelo de razonamiento en teléfonos Android, Raspberry Pi y navegadores mediante WebGPU, sin depender de la nube. La ventana de contexto del KV cache está limitada a 4096 tokens en este empaquetado.

Su relevancia actual radica en que demuestra que un modelo de razonamiento de 3B puede mantener calidad aceptable tras una cuantización agresiva: alcanza un 84,0 % en GSM8K (n=50, greedy, 0-shot CoT) con la cuantización int4 por bloques. El bundle incluye tokenizer y plantilla de prompt (ChatML), de modo que no requiere ficheros auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (modelo base Nanbeige4.1-3B) |
| Parametros totales | 3B (aproximado, segun nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (KV cache del bundle LiteRT-LM) |
| Tipos de cuantizacion | int4 por bloques (bloque 32) + OCTAV optimal-clipping, simetrico; embeddings INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del bundle ~2,2 GB; repo de 16,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 3B parámetros sobre arquitectura Llama, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card menciona que se trata de un modelo "fresco" (diciembre de 2025) orientado a razonamiento de tamaño telefónico, competitivo con modelos de mayor tamaño según el autor, pero no aporta detalles del pipeline de entrenamiento.

La innovación técnica relevante en esta ficha es la conversión, no el entrenamiento: la cuantización int4 por bloques de 32 con recorte óptimo OCTAV (data-free) preserva la precisión frente a un int4 min-max ingenuo, y los embeddings se externalizan en INT8 para que cada sección del archivo quede por debajo de 2 GiB y pueda cargarse en iOS. El bundle integra tokenizer y plantilla ChatML (`<|im_start|>role\n … <|im_end|>`). El modelo emite siempre su cadena de pensamiento: en litert-lm 0.18.0, `ThinkingConfig(enable_thinking=False)` no tiene efecto sobre este archivo.

## Capacidades

- Generación de texto y razonamiento multi-paso mediante bloque de pensamiento `<think>…</think>` previo a la respuesta final.
- Razonamiento matemático de tipo chain-of-thought (evaluado en GSM8K).
- Respuesta a prompts conversacionales con plantilla ChatML y parada limpia en `<|im_end|>`.
- Inferencia on-device en CPU y GPU (Metal en macOS, backend GPU en Android, WebGPU en navegador).
- Ejecución en entornos de recursos limitados: Android (Google AI Edge Gallery), Raspberry Pi 5 y navegador.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo explícito.

## Casos de uso

- Asistente de razonamiento en teléfono Android: integrado mediante Google AI Edge Gallery (1.0.16+ importa `.litertlm` directamente desde Hugging Face) con backend GPU, útil para resolver problemas matemáticos o de lógica sin conexión a la nube.
- Demostración web sin instalación: el chat demo de LiteRT-LM carga `model.litertlm` (2,41 GB) y ejecuta el modelo con WebGPU en el navegador, adecuado para probar el modelo antes de desplegarlo.
- Tutor de matemáticas offline: el modelo resuelve problemas paso a paso en el canal de pensamiento, con un rendimiento medido de 84,0 % en GSM8K, apropiado para entornos educativos sin conectividad.
- Prototipado en Raspberry Pi 5: con LiteRT-LM 0.16.1 en CPU a 4 hilos ofrece 2,5 tok/s de decodificación y 16 tok/s de prefill (TTFT 18,14 s), suficiente para demos y validación de concepto en hardware de bajo coste.
- Evaluación de cuantización en pipelines de edge: sirve como referencia reproducible para medir el impacto de int4 por bloques + OCTAV frente a min-max en tareas de razonamiento.
- Procesamiento local con requisitos de privacidad: al ejecutarse íntegramente en dispositivo, los prompts no salen del terminal, lo que encaja en escenarios con datos sensibles y ventanas de hasta 4096 tokens.
- Benchmarking de runtimes: útil para comparar backends (CPU frente a GPU/Metal) en el mismo hardware; en Apple M4 Max la GPU alcanza 1256 tok/s de prefill y 90,1 tok/s de decodificación frente a 125 tok/s y 24,4 tok/s en CPU.

## Benchmarks y rendimiento

Precisión medida en GSM8K (n=50, greedy, 0-shot chain-of-thought, max-tokens 2048):

| Configuración | GSM8K |
|---|---|
| Este modelo — LiteRT int4 (bloque 32 + OCTAV) | 84,0 % |

Rendimiento de inferencia medido:

| Dispositivo | Backend | Prefill (256) | Decode | TTFT | Carga | Huella pico |
|---|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 125 tok/s | 24,4 tok/s | 2,39 s | — | — |
| Apple M4 Max (macOS) | GPU (Metal) | 1256 tok/s | 90,1 tok/s | 0,22 s | — | — |
| Galaxy S26 (SM-S942Q, Android 16) | CPU | 39 tok/s | 10,6 tok/s | 5,77 s | — | — |
| Raspberry Pi 5 (4 hilos) | CPU | 16 tok/s | 2,5 tok/s | 18,14 s | — | — |
| Galaxy S26 | GPU | corre (2715/2715 ops delegadas) | sin dato de velocidad | — | — | 1213 MB |

Notas de medición: las filas de GPU en M4 Max se repiten con una variación de ~1 %; las de CPU son más ruidosas (desviación de ~±7 %). En el Galaxy S26 el backend GPU gana en prefill pero no en decodificación, por lo que no se publican cifras de velocidad GPU. El modelo supera la puerta de calidad local 8/8 con parada limpia en `<|im_end|>`.

## Requisitos de hardware

- VRAM/espacio: bundle de ~2,2 GB en disco; huella pico de proceso de 1213 MB medida en Galaxy S26 con backend GPU.
- GPU recomendadas: Apple M4 Max con Metal (90,1 tok/s decode); GPU Android vía delegación LiteRT GPU (2715/2715 ops en 2 subgrafos); WebGPU en navegador.
- Consumer GPU: no se documentan pruebas en RTX 4090, A100 ni H100; el enfoque del empaquetado es edge, no centro de datos.
- Cabe en dispositivos de gama alta: Samsung Galaxy S26; en Raspberry Pi 5 funciona en CPU a 4 hilos con 2,5 tok/s.
- Opciones de despliegue: LiteRT-LM (`litert_lm_main`, `litert_lm_advanced_main`, `litert-lm benchmark`), Google AI Edge Gallery en Android y el chat demo web con WebGPU.
- Latencia y throughput: TTFT de 0,22 s (M4 Max GPU) a 18,14 s (Raspberry Pi 5 CPU); decodificación de 2,5 a 90,1 tok/s según dispositivo y backend.
- Advertencia de timeout: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` y puede provocar un crash; usar `send_message_async` en streaming o reducir `max_output_tokens`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (bundle) | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Nanbeige4.1-3B (LiteRT-LM, esta ficha) | 3B denso | 4096 | 84,0 % (n=50) | Apache-2.0 | `.litertlm`, on-device |
| Nanbeige/Nanbeige4.1-3B (original) | 3B denso | no disponible | no disponible | Apache-2.0 | safetensors (presumible, no confirmado) |
| Otros modelos `litert-community/*` | no disponible | no disponible | no disponible | no disponible | `.litertlm` |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos comparables de la misma categoría; la comparación cuantitativa con terceros queda como no disponible.

## Limitaciones y advertencias

- El pensamiento no se puede desactivar: `ThinkingConfig(enable_thinking=False)` no tiene efecto en litert-lm 0.18.0; con un límite de 400 tokens la respuesta se cortó antes de dar el número. Configurar `thinking_token_budget` y un tope superior (300 respondió correctamente 17 × 23 con tope de 700 tokens).
- Timeout fijo de 10 minutos en llamadas bloqueantes de litert-lm 0.18.x/0.19.0, con riesgo de crash del proceso tras `DEADLINE_EXCEEDED`.
- Contexto limitado a 4096 tokens en el KV cache de este bundle, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se garantiza calidad multilingüe.
- Riesgo de alucinación inherente a modelos de 3B; el 84,0 % en GSM8K se midió con n=50, muestra pequeña, por lo que la cifra tiene margen de error amplio.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantías sobre el modelo base ni sobre el comportamiento en producción.
- El rendimiento en CPU es variable (±7 % en M4 Max) y en Raspberry Pi 5 (2,5 tok/s) resulta limitado para uso interactivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Nanbeige4.1-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Nanbeige4.1-3B
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Ficha edge-compat del modelo: https://github.com/john-rocky/edge-compat/blob/main/cards/nanbeige4.1-3b/CARD.md
