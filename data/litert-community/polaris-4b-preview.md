# litert-community/Polaris-4B-Preview

## Resumen

Polaris-4B-Preview es un modelo de razonamiento matemático de aproximadamente 4.000 millones de parámetros desarrollado por POLARIS-Project y distribuido en formato LiteRT-LM por la comunidad litert-community. Se trata de un post-entrenamiento con aprendizaje por refuerzo (RL) sobre Qwen3-4B, un transformer denso de licencia Apache-2.0, afinado específicamente para problemas de competición matemática de alta dificultad. El modelo opera con una cadena de razonamiento interna delimitada por `<think>…</think>` antes de emitir la respuesta final, lo que lo sitúa como un razonador matemático de referencia para su tamaño.

La versión publicada en este repositorio es una conversión al formato `.litertlm` de Google LiteRT-LM, pensada para inferencia en dispositivo (on-device) en móviles, Raspberry Pi y equipos de escritorio. Los pesos están cuantizados a int4 con bloques de 128 y clipping óptimo OCTAV, con embeddings en INT8, lo que reduce el bundle a aproximadamente 2,3 GB y permite cargarlo en iOS, Android y WebGPU. La ventana de contexto declarada para la caché KV es de 4096 tokens.

Su relevancia actual radica en que demuestra que un razonador matemático con resultados en AIME24/AIME25 cercanos a modelos frontera mucho mayores puede ejecutarse íntegramente en hardware de consumo, incluido un teléfono, con velocidades de decodificación de decenas de tokens por segundo en GPU de escritorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B, `qwen3`) |
| Parámetros totales | ~4.000 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 (caché KV del bundle LiteRT-LM) |
| Tipos de cuantización | int4 blockwise (bloque 128) + OCTAV, simétrico; embeddings INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~2,3 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3 con aproximadamente 4.000 millones de parámetros, sobre el que POLARIS-Project aplicó un post-entrenamiento con aprendizaje por refuerzo orientado a razonamiento matemático de competición. El modelo genera de forma obligatoria una cadena de pensamiento dentro de `<think>…</think>` antes de la respuesta final, y utiliza una plantilla de prompt ChatML (`<|im_start|>role\n … <|im_end|>`) incluida en el bundle. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RL en la información proporcionada.

La conversión a LiteRT-LM introduce innovaciones de despliegue destacables: cuantización int4 por bloques de 128 en lugar de 32, decisión tomada porque los pesos con bloque 32 de un razonador de 4B pueden corromperse en la GPU Metal de iPhone, mientras que bloque 128 es estable en iPhone, Android y escritorio. Los embeddings se externalizan y cuantizan a INT8 para que cada sección del bundle quede por debajo de 2 GiB y pueda cargarse en iOS. El cómputo es entero y el runtime soporta delegación a GPU LiteRT (3274 de 3274 operaciones en 2 subgrafos en Galaxy S26).

## Capacidades

- Generación de texto con razonamiento matemático de competición (AIME, problemas de olimpiada).
- Cadena de pensamiento explícita en `<think>…</think>` antes de la respuesta; el modo thinking no puede desactivarse en esta conversión.
- Razonamiento multi-paso de cadena larga, optimizado para problemas difíciles más que para aritmética elemental.
- Generación de código y matemáticas generales heredadas del modelo base Qwen3-4B (no verificadas en la información disponible).
- Inferencia on-device en iPhone, Android, Raspberry Pi 5, macOS y navegador con WebGPU.
- Soporte de plantilla ChatML y parada limpia en `<|im_end|>`.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Resolución de problemas matemáticos de competición en el dispositivo: el modelo puede resolver problemas tipo AIME en un teléfono o Raspberry Pi sin conexión, gracias a su cadena de razonamiento interna y a su bundle de 2,3 GB.
- Tutor de matemáticas avanzadas offline: integrado en una app móvil, permite explicar paso a paso la resolución de problemas difíciles sin enviar datos a la nube, con un presupuesto de tokens configurable mediante `thinking_token_budget`.
- Verificación y generación de soluciones en pipelines educativos: puede generar cadenas de razonamiento completas para su revisión posterior, útil en plataformas de evaluación de problemas matemáticos.
- Asistente de razonamiento en entornos con requisitos de privacidad: al ejecutarse localmente en iPhone, Android o escritorio, evita la exposición de datos sensibles en problemas analíticos.
- Prototipado de razonadores en hardware de bajo consumo: con 1,5 tok/s de decodificación en Raspberry Pi 5 y 68,9 tok/s en Mac Studio M4 Max, sirve para validar flujos de razonamiento en entornos embebidos.
- Demos interactivas en navegador: el bundle se carga con WebGPU en la demo oficial de LiteRT-LM, lo que permite ofrecer una experiencia de razonamiento matemático sin instalación.
- Evaluación comparativa de cuantización on-device: útil para investigadores que comparan precisión int4 frente al modelo base en tareas de matemáticas (GSM8K 82,0% con esta cuantización).

## Benchmarks y rendimiento

Precisión declarada por la model card del modelo base (no verificada de forma independiente en esta información):

| Benchmark | Resultado |
|---|---|
| AIME24 | 81,2 |
| AIME25 | 79,4 |
| GSM8K (n=50, greedy, 0-shot CoT, max-tokens 2048) | 82,0% (esta cuantización LiteRT int4) |

Rendimiento de inferencia medido:

| Dispositivo | Backend | Prefill (256) | Decode | TTFT | Carga | Huella pico |
|---|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 111 tok/s | 17,9 tok/s | 2,50 s | — | — |
| Apple M4 Max (macOS) | GPU (Metal) | 1002 tok/s | 69,1 tok/s | 0,28 s | — | — |
| Mac Studio M4 Max (LiteRT-LM 0.14.0) | GPU | 971 tok/s | 68,9 tok/s | 278 ms | — | — |
| Raspberry Pi 5 (LiteRT-LM 0.16.1) | CPU, 4 hilos | 11 tok/s | 1,5 tok/s | 25,66 s | — | — |
| Samsung Galaxy S26 (SM-S942Q) | GPU LiteRT | — | — | — | — | 1022 MB |

Las filas de GPU en M4 Max son reproducibles dentro de ~1%; las de CPU tienen una dispersión de aproximadamente ±7%.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa ~2,3 GB en disco; la huella pico medida en Galaxy S26 es de 1022 MB. En GPU de teléfono se recomienda un dispositivo con 12 GB o más de RAM.
- GPU recomendadas: Apple M4 Max (Metal) alcanza 69,1 tok/s de decodificación; GPU LiteRT en Android (Galaxy S26) ejecuta el modelo con delegación completa.
- ¿Cabe en GPU de consumo? Sí: el modelo está diseñado para ejecutarse en iPhone, Android y escritorio; en Raspberry Pi 5 funciona en CPU a 1,5 tok/s.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main`, `litert_lm_advanced_main`, `litert-lm benchmark`), Google AI Edge Gallery (1.0.16+) en Android, y demo web con WebGPU.
- Latencia y throughput: TTFT de 278 ms en Mac Studio M4 Max con GPU y de 25,66 s en Raspberry Pi 5 con CPU; prefill de 971-1002 tok/s en GPU de escritorio frente a 11 tok/s en Raspberry Pi 5.
- Advertencia de timeout: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED`; para respuestas largas conviene usar `send_message_async` o reducir `max_output_tokens`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME24 | Licencia | Formato on-device |
|---|---|---|---|---|---|
| Polaris-4B-Preview (LiteRT-LM) | ~4B | 4096 | 81,2 | Apache-2.0 | `.litertlm` int4 |
| Qwen3-4B (modelo base) | ~4B | no disponible | no disponible | Apache-2.0 | safetensors |
| Alternativas de razonamiento de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoría en la información proporcionada, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- El modo thinking no puede desactivarse en esta conversión: con `ThinkingConfig(enable_thinking=False)` el canal de pensamiento consume todo el presupuesto de tokens y no aparece respuesta; es necesario fijar `thinking_token_budget` y un límite superior a este.
- Riesgo de truncamiento: con un `max-tokens` bajo (por debajo de 2048) el razonamiento se corta a mitad y no se produce respuesta final.
- El modelo está optimizado para problemas matemáticos difíciles; en aritmética elemental su razonamiento exploratorio largo no muestra su ventaja (GSM8K 82,0%).
- Timeout fijo de 10 minutos en llamadas bloqueantes en litert-lm 0.18.x y 0.19.0, con posible caída del proceso si la generación queda en marcha.
- La cuantización int4 introduce una degradación de precisión respecto al modelo base; los resultados de AIME son los reportados por la model card del modelo base y no se han verificado de forma independiente en esta conversión.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial; deben conservarse los avisos de licencia correspondientes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Polaris-4B-Preview
- Modelo base: https://huggingface.co/POLARIS-Project/Polaris-4B-Preview
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Polaris-4B-Preview
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Ficha edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/polaris-4b/CARD.md
