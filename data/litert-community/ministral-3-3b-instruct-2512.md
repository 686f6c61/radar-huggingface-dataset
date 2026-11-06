# litert-community/Ministral-3-3B-Instruct-2512

## Resumen

Ministral-3-3B-Instruct-2512 es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por Mistral AI, publicado originalmente en formato PyTorch. La versión aquí descrita es la conversión realizada por la comunidad `litert-community` al formato `.litertlm`, el formato de inferencia on-device del runtime LiteRT-LM de Google, sucesor de TensorFlow Lite. El objetivo de esta conversión es permitir la ejecución del modelo íntegramente en dispositivos de borde (móviles Android, iPhone, Raspberry Pi, portátiles Apple Silicon) sin dependencia de servidores.

El modelo base es un transformer decoder-only de tipo instruct, con una ventana de contexto efectiva limitada a 4.096 tokens en esta conversión (por el tamaño del KV cache empaquetado). Se distribuye cuantizado a int4 por bloques de 32 pesos con clipping OCTAV simétrico, embeddings y lm_head en int8, lo que reduce el artefacto a aproximadamente 2,34 GB. Está licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que demuestra que un modelo instruct de 3B puede ejecutarse con velocidades de decodificación de 129,5 tok/s en un Mac Studio M4 Max (GPU) y 22,1 tok/s en un Galaxy S26 (GPU), con latencias de primer token de 38 ms y 3,07 s respectivamente. Esto lo posiciona como una opción práctica para asistentes locales, procesamiento de texto en el dispositivo y aplicaciones con requisitos estrictos de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Ministral-3 de Mistral AI) |
| Parámetros totales | 3.000 millones (aproximado, según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (KV cache empaquetado: `ekv4096`) |
| Tipos de cuantización | int4 blockwise (bloque 32, simétrico, OCTAV clipping); embedding/lm_head en int8; cómputo entero |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~2,34 GB) |
| Modelo base | mistralai/Ministral-3-3B-Instruct-2512 |
| Tamaño del repositorio | 11,7 GB |
| Runtime | LiteRT-LM (Google AI Edge) |
| Backends soportados | GPU, CPU, WebGPU (demo navegador) |
| Tokenizador | Incluido en el bundle; formato Mistral `[INST] … [/INST]`, stop token `</s>` |
| Firma de prefill | `prefill_128` y `prefill_16` (16 tokens) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Ministral-3-3B-Instruct-2512 de Mistral AI, un transformer decoder-only con atención causal estándar. Esta conversión concreta es solo de texto: la torre de visión Pixtral del modelo original se ha descartado explícitamente, por lo que el modelo resultante no procesa imágenes. El bundle `.litertlm` incluye el tokenizador y la plantilla de prompt en formato nativo Mistral, eliminando la necesidad de ficheros separados de tokenizer.

El proceso de conversión se realizó con `litert-torch` (anteriormente `ai-edge-torch`), el conversor de PyTorch a LiteRT. La cuantización aplicada es int4 por bloques de 32 pesos, simétrica, con clipping OCTAV, mientras que los embeddings y la cabeza de lenguaje (`lm_head`, con pesos atados) se mantienen en int8. El 6 de octubre de 2026 se publicó una reescritura del grafo GPU (sin cambios en los pesos) que sustituye las operaciones `DYNAMIC_UPDATE_SLICE` por un composite `odml.cache_update` por capa y usa composites `odml.runtime_bmm` para los productos de atención, además de añadir una firma de prefill de 16 tokens. Esta reescritura mejoró la decodificación GPU en un factor ×1,401 y redujo el TTFT GPU de 121 ms a 38 ms en M4 Max.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta conversión no documenta esos detalles.

## Capacidades

- Generación de texto instructiva directa: el modelo responde sin bloque `<think>` y termina limpiamente en `</s>`.
- Razonamiento y respuesta a preguntas de propósito general, incluyendo matemáticas básicas (26/30 aciertos en GSM8K con decodificación greedy, según la model card).
- Ejecución on-device completa: no requiere conexión a red ni servidor; el bundle incluye tokenizador y plantilla.
- Soporte de backend GPU, CPU y WebGPU (demo de chat en navegador).
- Capacidad multilingüe: no especificada en la información disponible.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades de visión: no disponibles (la torre Pixtral se eliminó en la conversión).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistentes locales en Android: mediante la app Google AI Edge Gallery (paquete `com.google.ai.edge.gallery`, versión 1.0.15 o superior), el modelo se ejecuta íntegramente en el teléfono con backend GPU. Adecuado para asistentes de texto que no deben enviar datos a la nube; en Pixel 8a se midieron 6,8 tok/s de decodificación y TTFT de 1,68 s.
- Procesamiento de texto privado en iPhone: el bundle externaliza los embeddings para que cada sección quede por debajo de 2 GiB, lo que permite su carga en iOS. Útil para resumen, reescritura y clasificación de documentos sensibles sin salida de datos del dispositivo.
- Demo interactiva en navegador: el chat WebGPU de LiteRT-LM carga el modelo de 2,34 GB y permite probar la inferencia en el navegador sin instalación, útil para evaluación rápida y prototipado.
- Inferencia en Raspberry Pi 5 y dispositivos de bajo consumo: la model card reporta cifras medidas en Raspberry Pi 5 (no re-medidas tras la reescritura del grafo), lo que lo hace viable para automatización local de texto en hardware embebido.
- Estación de trabajo con Apple Silicon: en Mac Studio M4 Max se alcanzan 129,5 tok/s de decodificación y 1.340 tok/s de prefill con GPU, suficiente para generación de texto interactiva y procesamiento por lotes de prompts cortos.
- Evaluación de matemáticas y razonamiento en el dispositivo: con 26/30 en GSM8K (greedy, hasta 2.048 tokens), sirve para tutores o correctores locales de problemas aritméticos de nivel escolar.
- Integración en pipelines de CI/CD para pruebas de humo de modelos on-device: el formato `.litertlm` y el runtime `litert_lm_main` permiten automatizar benchmarks de latencia y throughput en hardware de referencia.

## Benchmarks y rendimiento

Datos de rendimiento medidos en dispositivo reportados en la model card (no son benchmarks académicos de calidad, sino métricas de inferencia):

| Plataforma | Runtime / backend | Decode (tok/s) | Prefill (tok/s) | TTFT | Ops delegadas |
|---|---|---:|---:|---:|---|
| Galaxy S26 | LiteRT-LM prebuilt-adac974b / GPU | 22,1 | 338 | 3,07 s | 1210/1210 |
| Pixel 8a | LiteRT-LM 0.16.0 / GPU | 6,8 | 8 | 1,68 s | 1187/1187 |
| Mac Studio M4 Max | LiteRT-LM 0.17.1 / GPU | 129,5 | 1.340 | 201 ms | 1210/1210 |
| Mac Studio M4 Max | LiteRT-LM 0.17.1 / CPU | 22,5 | no disponible | 0,589 s (16 tokens) | no disponible |

Comparativa del fichero anterior frente al nuevo (Mac M4 Max, `benchmark --cache no`):

| Métrica | Fichero anterior | Fichero nuevo | Ratio |
|---|---:|---:|---:|
| GPU decode, 256 tokens | 92,4 tok/s | 129,5 tok/s | ×1,401 |
| GPU prefill, 256 tokens | 1.215 tok/s | 1.340 tok/s | ×1,103 |
| GPU TTFT, prompt de 16 tokens | 0,121 s | 0,038 s | ×0,310 |
| CPU decode, 256 tokens | 22,1 tok/s | 22,5 tok/s | ×1,014 |
| CPU TTFT, prompt de 16 tokens | 1,478 s | 0,589 s | ×0,398 |
| CPU init | 2,2 s | 3,1 s | ×1,416 |

Calidad: 26/30 en GSM8K (greedy, hasta 2.048 tokens) con el fichero nuevo, mismo resultado que el anterior. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el bundle ocupa 2.342.866.928 bytes (~2,34 GB); se requiere al menos esa cantidad de memoria libre para cargar los pesos, más overhead del runtime y del KV cache de 4.096 tokens.
- GPU recomendadas: cualquier GPU con soporte LiteRT-LM; medido en Galaxy S26 (GPU móvil), Pixel 8a (GPU móvil) y Mac Studio M4 Max (GPU Apple).
- Consumer GPU: no se reportan mediciones en GPU de escritorio NVIDIA/AMD; el formato `.litertlm` está orientado a dispositivos de borde y Apple Silicon, no a CUDA.
- Cabe en dispositivos móviles de gama alta (Galaxy S26, iPhone 17 Pro según referencias de la model card) y en Raspberry Pi 5.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main`), app Google AI Edge Gallery en Android, demo WebGPU en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es específico de LiteRT-LM.
- Latencia y throughput: ver tabla de benchmarks; en M4 Max GPU, TTFT de 38 ms con prompt de 16 tokens y 129,5 tok/s de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (LiteRT-LM, este) | ~3B | 4.096 | `.litertlm` / LiteRT-LM | Apache-2.0 | Solo texto; int4 blockwise; on-device |
| Ministral-3-3B-Instruct-2512 (original Mistral AI) | ~3B | no disponible en la información | safetensors / PyTorch | Apache-2.0 | Incluye torre de visión Pixtral |
| Otros modelos `litert-community/*` | no disponible | no disponible | `.litertlm` / LiteRT-LM | variable | Conversiones oficiales de la comunidad LiteRT |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión Pixtral del modelo original se ha eliminado; no procesa imágenes.
- Contexto limitado a 4.096 tokens por el KV cache empaquetado (`ekv4096`); no apto para documentos largos o conversaciones muy extensas.
- Cuantización agresiva: int4 blockwise con clipping OCTAV puede degradar la calidad frente al modelo en precisión completa; no se han publicado comparativas de calidad exhaustivas.
- Riesgo de alucinación inherente a modelos de 3B; no se documentan evaluaciones de factualidad.
- Sesgos: no se documentan análisis de sesgo en la model card.
- Idiomas soportados no especificados; el rendimiento multilingüe es desconocido.
- Tool calling, agentes y razonamiento multi-paso no documentados; no asumir su disponibilidad.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y la conversión deben verificarse por separado; la model card no impone restricciones adicionales conocidas.
- El formato `.litertlm` es específico de LiteRT-LM; no es portable a vLLM, llama.cpp u otros runtimes sin reconversión.
- Las cifras de Raspberry Pi 5, Pixel 8a e iPhone 17 Pro corresponden al fichero anterior y no se re-midieron tras la reescritura del grafo.
- El proceso de conversión puede introducir diferencias numéricas; la model card reporta coincidencia byte a byte en respuestas de prueba, pero no una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo de chat WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Ministral-3-3B-Instruct-2512
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de la Gallery: https://github.com/google-ai-edge/gallery/releases
- Ficha de rendimiento edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/ministral3-3b/CARD.md
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
