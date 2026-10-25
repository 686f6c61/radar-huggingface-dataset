# jinhwan000/qwen3-tts-0.6b-customvoice-ov

## Resumen

`jinhwan000/qwen3-tts-0.6b-customvoice-ov` es una exportación a OpenVINO IR del modelo de síntesis de voz `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice`, publicada por el usuario jinhwan000. No se trata de un modelo entrenado desde cero, sino de una conversión de formato y de grafo pensada para inferencia en hardware Intel: el repositorio contiene únicamente las partes del modelo en IR (2,9 GB en total), y requiere descargar por separado del repositorio original los pesos `model.safetensors`, el `config.json`, el tokenizador y el `speech_tokenizer/config.json`.

La aportación principal frente al modelo base es la reorganización del grafo para *continuous batching* por rondas: múltiples peticiones de síntesis comparten una misma GPU y cada una avanza un fotograma de 80 ms por ronda. Para ello el talker y el decoder transformer se convierten con PagedAttention y `sliding_window = 72`, mientras que `frame_head.xml` y `dec_back.xml` se sirven con buckets estáticos. La variante CustomVoice utiliza altavoces predefinidos identificados por `talker_config.spk_id` (serena, vivian, uncle_fu, ryan, aiden, ono_anna, sohee, eric, dylan), inyectados como fila de embedding del códec en lugar de un x-vector.

El modelo es relevante para quien necesite servir TTS multilingüe de 0,6 B parámetros en Intel Arc con alta concurrencia: la validación reportada en una Arc B580 con OpenVINO 2026.4.1 indica unos 64 flujos concurrentes en tiempo real y una paridad numérica alta frente a la referencia fp32 oficial. La licencia Apache-2.0, heredada del modelo upstream, permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (talker con hidden 1024, code predictor, decoder transformer con PagedAttention, frame head y decoder de códec); exportada a OpenVINO IR |
| Parametros totales | ~0,6 mil millones (según la denominación `0.6B` del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la atención del talker usa `sliding_window = 72` fotogramas (≈5,76 s a 12,5 fotogramas/s) |
| Tipos de cuantizacion | f16 en pesos y KV cache (configuración validada en Arc B580); otras precisiones no documentadas |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`) para las partes del modelo; requiere `model.safetensors` y tokenizadores del repositorio original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-TTS en su variante de 12 Hz, un sistema de síntesis neuronal basado en códec de audio organizado en varios subgrafos: un *talker* autorregresivo con dimensión oculta 1024 que predice tokens de códec, un *code predictor* que refina los códigos, un *decoder transformer* que reconstruye la señal y una *frame head* junto con el decoder final del códec (`dec_back`). El fotograma de 80 ms por ronda implica una tasa de 12,5 fotogramas por segundo, coherente con la denominación "12Hz" del modelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento o RLHF aplicadas al modelo original; esta model card solo documenta la conversión y su validación.

La innovación técnica del repositorio es de despliegue, no de entrenamiento: el talker y el decoder transformer se convierten con PagedAttention y ventana deslizante de 72 fotogramas para permitir *continuous batching* por rondas, y la frame head y el decoder de códec se sirven con formas estáticas (buckets) para evitar recompilaciones. En la Arc B580 se emplean pesos f16, KV en f16 y `ACTIVATIONS_SCALE_FACTOR=8` en la frame head. La selección de voz se hace mediante el `spk_id` del `config.json`, que se alimenta como una fila de embedding del códec en lugar de un x-vector, lo que fija el timbre a uno de los nueve altavoces predefinidos.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida de audio en flujo de fotogramas de 80 ms.
- Selección de timbre entre nueve altavoces predefinidos: serena, vivian, uncle_fu, ryan, aiden, ono_anna, sohee, eric, dylan.
- Soporte declarado de diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Servicio concurrente mediante *continuous batching* por rondas: varias peticiones comparten una GPU avanzando un fotograma cada una por iteración.
- Ejecución sobre OpenVINO, con PagedAttention en el talker y el decoder transformer y reutilización de caché KV entre rondas.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni procesamiento de audio de entrada en esta variante CustomVoice.

## Casos de uso

- **Lectura de artículos y documentos en voz alta**: el modelo genera audio con un timbre fijo seleccionable por `spk_id`, adecuado para pipelines de accesibilidad que convierten texto en audio de forma desatendida en servidores con GPU Intel.
- **Locución multilingüe de catálogos**: al cubrir diez idiomas, un mismo despliegue puede narrar fichas de producto o guiones en español, inglés, alemán o japonés sin cambiar de infraestructura.
- **Atención telefónica automatizada**: el batching por rondas permite atender decenas de locuciones simultáneas en una sola Arc B580 (unas 64 en tiempo real según la validación), lo que encaja con flujos de IVR donde muchas llamadas comparten la misma GPU.
- **Generación de pistas de audio para vídeo y e-learning**: la síntesis por fotogramas de 80 ms permite emitir audio en streaming mientras se genera, reduciendo el tiempo hasta el primer sonido en herramientas de autor.
- **Sistemas de anuncios y avisos dinámicos**: textos cortos generados en tiempo de ejecución (importes, nombres, horarios) se pueden sintetizar con una voz consistente usando los altavoces predefinidos.
- **Pruebas de regresión de pipelines de voz**: la paridad numérica documentada frente a la referencia fp32 (RMS relativo 2,7–3,6e-3, códigos greedy con coincidencia del 99,3–100 %) lo hace útil como referencia de sustitución en tests de integración de sistemas TTS.
- **Despliegue en infraestructura Intel existente**: organizaciones con nodos Arc que quieran evitar GPU NVIDIA pueden servir TTS en el mismo hardware que ya utilizan para otros modelos OpenVINO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, similitud de hablante) en la información disponible. La model card sí incluye una validación de paridad numérica frente a la referencia fp32 oficial, con 4 casos en coreano de 249 fotogramas y decodificación greedy, sobre Intel Arc B580 y OpenVINO 2026.4.1:

| Métrica | Resultado (Arc B580, f16) |
|---|---|
| RMS relativo del hidden del talker (media por caso) | 2,7–3,6e-3 |
| Códigos greedy coincidentes con la referencia (c0) | 99,6–100 % |
| Códigos greedy coincidentes con la referencia (code predictor) | 99,3–99,9 % |
| SNR de decodificación frente al decoder oficial | 43,0–55,4 dB |
| Concurrencia en tiempo real | ~64 peticiones simultáneas en la B580 |

## Requisitos de hardware

- **VRAM estimada**: a partir de los ~0,6 B parámetros en f16, los pesos suponen aproximadamente 1,2 GB; hay que sumar la caché KV en f16, la frame head, el decoder de códec y el speech tokenizer. El repositorio completo ocupa 2,9 GB, pero incluye varias partes en IR. No hay cifras de pico de VRAM publicadas.
- **GPU validadas**: Intel Arc B580 con OpenVINO 2026.4.1. Otras GPU Intel Arc o integradas no están documentadas en la model card.
- **GPU de referencia del ecosistema**: el modelo hermano de 1,7 B se usa como referencia comparativa en la propia documentación; para volúmenes altos se recomienda hardware Intel con soporte OpenVINO maduro.
- **Consumer GPU**: sí, en el sentido de que una Arc B580 de gama media es suficiente para el despliegue validado, incluida la concurrencia de ~64 peticiones.
- **Opciones de despliegue**: runtime OpenVINO siguiendo la receta de conversión descrita (PagedAttention en `talker.xml` y `dec_transformer.xml` con `sliding_window = 72`, buckets estáticos para `frame_head.xml` y `dec_back.xml`). No se documentan exportaciones a llama.cpp, Ollama, vLLM ni TGI.
- **Latencia y throughput**: no se publica latencia por petición ni tiempo hasta el primer fotograma; sí se indica que la velocidad es la misma que la del modelo `qwen3-tts-0.6b-base-ov`, de arquitectura idéntica, con unos 64 flujos concurrentes en tiempo real en la B580.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `jinhwan000/qwen3-tts-0.6b-customvoice-ov` (este) | ~0,6 B | ventana deslizante de 72 fotogramas | 10 | OpenVINO IR + safetensors del repo original | Apache-2.0 | Voces predefinidas, batching por rondas, validado solo en coreano |
| `Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice` | ~0,6 B | no disponible | 10 | safetensors | Apache-2.0 | Modelo upstream de referencia; sin optimización de batching OpenVINO |
| `jinhwan000/qwen3-tts-0.6b-base-ov` | ~0,6 B | ventana deslizante de 72 fotogramas | no disponible en esta ficha | OpenVINO IR | Apache-2.0 | Misma arquitectura y velocidad; según la card, recorta finales de frase en las pruebas del autor |
| `jinhwan000/qwen3-tts-1.7b-base-ov` | ~1,7 B | no disponible | no disponible en esta ficha | OpenVINO IR | Apache-2.0 | Hermano mayor; sirve de referencia de receta de conversión y ajustes de precisión |

## Limitaciones y advertencias

- La validación de calidad solo cubre **coreano** (4 casos, 249 fotogramas, greedy). El resto de idiomas declarados no está verificado en esta exportación, aunque el autor indica que las partes son independientes del idioma.
- El repositorio contiene únicamente los grafos IR: sin los ficheros del repositorio original (`model.safetensors`, `config.json`, `generation_config.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json`, `speech_tokenizer/config.json`) el modelo no es ejecutable.
- El timbre está restringido a los nueve altavoces predefinidos; no se documenta clonación de voz ni control de estilo, emoción o prosodia.
- La paridad reportada es numérica (RMS, coincidencia de códigos, SNR) frente a la implementación fp32; no sustituye a una evaluación perceptual (MOS) ni a métricas de inteligibilidad (WER/CER).
- Riesgo inherente de errores de pronunciación, énfasis incorrecto y artefactos en textos con números, siglas o puntuación atípica; no se documenta comportamiento en frases muy largas ni en cambio de idioma dentro de una misma locución.
- Dependencia de OpenVINO 2026.4.1 y de los ajustes específicos de precisión para Arc B580; el comportamiento en otras versiones del runtime o en otras GPU Intel no está documentado.
- Adopción muy baja (0 descargas, 1 like en el momento de la consulta): no hay comunidad ni soporte más allá de la model card y de las fichas hermanas del mismo autor.
- Licencia Apache-2.0, que permite uso comercial y modificaciones, pero conviene revisar las condiciones del modelo upstream y de las voces predefinidas antes de un lanzamiento en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jinhwan000/qwen3-tts-0.6b-customvoice-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Exportación hermana de 1,7 B (receta de conversión y notas de runtime): https://huggingface.co/jinhwan000/qwen3-tts-1.7b-base-ov
- Exportación hermana de 0,6 B base (mismas formas y velocidad): https://huggingface.co/jinhwan000/qwen3-tts-0.6b-base-ov
