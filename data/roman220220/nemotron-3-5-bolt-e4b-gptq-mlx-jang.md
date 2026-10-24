# roman220220/Nemotron-3.5-Bolt-E4B-gptq-mlx-jang

## Resumen

Esta ficha describe `roman220220/Nemotron-3.5-Bolt-E4B-gptq-mlx-jang`, una cuantización GPTQ en formato MLX del modelo NVIDIA Nemotron-3.5-Bolt-E4B, un modelo pequeño ajustado por NVIDIA para asistentes locales de voz y dispositivos con memoria limitada (baja huella, bajo time-to-first-token, uso de herramientas multi-turno e instrucciones). El release lo publica un tercero independiente, el usuario `roman220220`, no NVIDIA; el checkpoint de partida es `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`.

El modelo base emplea la arquitectura `Gemma4ForConditionalGeneration` (post-entrenamiento de NVIDIA sobre `google/gemma-4-E4B-it`): 42 capas de decoder densas, hidden size 2560 y atención híbrida sliding/full, sin MoE. Según el autor de la cuantización, el checkpoint conserva la torre de visión completa (16 capas, hidden 768, patch 16) y un codificador de audio Conformer (12 capas, hidden 1024), pese a que la model card de NVIDIA describe el modelo como solo texto y al resto de cuantizaciones públicas solo cubrir el decoder.

La relevancia de esta build es doble: reduce el peso de ~16 GB en bf16 a 6,3 GB, y, según el autor, es la primera conversión pública de este modelo en la que la entrada de imagen y de audio funciona realmente tras la cuantización (verificado de extremo a extremo sobre el checkpoint cuantizado, no solo comprobando que carga). Está pensada para Apple Silicon mediante MLX y la aplicación LLMTray.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal `Gemma4ForConditionalGeneration` (base `google/gemma-4-E4B-it`, post-entrenado por NVIDIA); 42 capas de decoder, hidden size 2560, atención híbrida sliding/full, embeddings de entrada por capa |
| Parámetros totales | 6.132.307.274 (~6,13 B) según los safetensors del repo; la model card del autor indica 8 B totales / 4 B efectivos |
| Parámetros activos | No aplica: modelo denso, sin MoE según la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GPTQ mixto por rol: atención (`q/k/v/o_proj` de las tres torres) 8-bit GPTQ; feed-forward (`gate/up/down_proj`) 4-bit GPTQ; embeddings y proyecciones por capa 8-bit RTN; `vision_tower.patch_embedder.input_proj` en float sin tocar; calibración con `group-size 64` |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors cuantizados para MLX (librería `mlx`), con `index.json` y un fichero aparte `model-frozen-shared-kv.safetensors` |
| Torre de visión | 16 capas, hidden size 768, patch size 16 (config `gemma4_vision` propia, distinta de la del hermano de 26B) |
| Torre de audio | 12 capas, hidden size 1024, convolución + atención estilo Conformer |
| Tamaño del repo | 6,7 GB (pesos ~6,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso multimodal: decoder de 42 capas con hidden size 2560 y atención híbrida que combina capas de atención deslizante con capas de atención completa, más embeddings de entrada por capa. Sobre esa base se acoplan dos torres separadas, una de visión (16 capas, hidden 768, patches de 16) y otra de audio (12 capas, hidden 1024 con convolución y atención estilo Conformer). No hay mezcla de expertos: el autor lo indica explícitamente ("modelo denso, sin MoE").

Un detalle poco habitual del checkpoint de NVIDIA es el layout: además de `model-00001-of-00001.safetensors` y su `index.json`, se distribuye un `model-frozen-shared-kv.safetensors` con los pesos `k_proj`/`v_proj`/`k_norm` de las capas de atención completa que reutilizan las capas de atención deslizante posteriores; son tensores reales, no duplicados. El pipeline de cuantización, escrito originalmente para un checkpoint de un solo fichero, tuvo que adaptarse para leer ambos ficheros.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. La innovación técnica documentada en este release es la receta de cuantización: GPTQ por rol (8 bits en atención, 4 bits en feed-forward), RTN a 8 bits en embeddings y proyecciones por capa, y la decisión de dejar `vision_tower.patch_embedder.input_proj` en float porque cuantizarlo corrompe el propio cast de píxel a embedding (el autor midió que en una foto de prueba no se distinguía ningún sujeto). La calibración se hizo con datos reales por modalidad: prompts de texto para el modelo de lenguaje, fotografías para la torre de visión y voz real para la torre de audio.

## Capacidades

- Generación de texto conversacional e instrucciones: respuestas factuales y de razonamiento verificadas sobre el checkpoint cuantizado (preguntas sobre el Coliseo, derecho romano o la caída del Imperio Romano de Occidente).
- Comprensión de imágenes: pipeline `image-text-to-text`; el autor verifica respuesta correcta a "What animals are in this picture?" sobre una foto real ("There are two cats in this picture").
- Entrada de audio: transcripción de voz real a 16 kHz verificada de extremo a extremo en el checkpoint cuantizado.
- Uso de herramientas y function calling multi-turno: la model card del modelo base lo presenta como uno de sus puntos fuertes, aunque esta build no aporta mediciones propias.
- Razonamiento multi-paso y flujos de agente: soportado por el ajuste del modelo base según su card; sin benchmarks específicos en este release.
- Integración con API compatible con OpenAI a través de LLMTray, lo que permite enchufarlo a clientes y frameworks existentes en local.
- Ejecución totalmente offline en Apple Silicon: nada sale del equipo, según el autor.
- Capacidades multilingües: no disponible (el campo de idiomas del repo está vacío).

## Casos de uso

- Asistente de voz local en macOS: el modelo acepta audio de 16 kHz y texto en el mismo checkpoint de 6,3 GB, de modo que se puede construir un asistente push-to-talk completamente offline sobre un Mac, sin enviar grabaciones a la nube.
- Descripción y pregunta-respuesta sobre fotografías en local: útil para catalogar imágenes personales, revisar capturas de documentación o accesibilidad (describir una foto a un usuario), ejecutando la torre de visión cuantizada sin GPU dedicada.
- Agente de escritorio con tool calling: al estar expuesto mediante API compatible con OpenAI en LLMTray, se puede conectar a un orquestador de agentes que encadene varias llamadas a herramientas con contexto conversacional multi-turno.
- Prototipado rápido de aplicaciones multimodales en Apple Silicon: 6,3 GB de pesos y un pico de 7,8 GB medido permiten iterar en portátiles con memoria unificada, sin aprovisionar instancias con GPU.
- Transcripción y posprocesado de notas de voz: pasar un clip de audio y pedir en la misma conversación un resumen, una lista de tareas o una corrección de estilo, aprovechando que texto y audio conviven en el mismo modelo.
- Procesamiento de información sensible sin salida de datos: análisis de imágenes o conversaciones con contenido médico, legal o personal en equipos donde no está permitido enviar datos a APIs externas.
- Evaluación comparativa de cuantizaciones: como referencia para medir la pérdida de calidad de GPTQ mixto frente a bf16 en un modelo multimodal pequeño, usando el harness `qat_eval.py` del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo aporta métricas de fidelidad de la cuantización sobre wikitext-2 (64 ventanas de 512 tokens, mismos token ids que el tokenizer de referencia, logits de referencia calculados una vez por ventana):

| Métrica (wikitext-2) | bf16 (referencia) | Esta cuantización GPTQ/MLX |
|---|---|---|
| Perplejidad (PPL) | 173,95 | 167,25 |
| KL (ref ‖ modelo) | — | 0,214 |
| Acuerdo top-1 | — | 82,06 % |

El propio autor advierte que la PPL en wikitext-2 es ruidosa con ese número de ventanas y ese tamaño de modelo, y que la señal fiable es el KL y el acuerdo top-1, no la aparente mejora de PPL.

Pruebas funcionales de extremo a extremo sobre el checkpoint cuantizado: texto (respuestas factuales correctas), visión (foto real, respuesta correcta) y audio (clip real a 16 kHz, transcripción correcta con un único error de artículo: "A quick brown fox..." en lugar de "The quick brown fox..."). Memoria pico durante la prueba combinada: 7,8 GB.

## Requisitos de hardware

- Pesos en disco: ~6,3 GB (frente a ~16 GB en bf16), repo de 6,7 GB.
- Memoria pico medida en la prueba combinada de texto, visión y audio: 7,8 GB.
- Plataforma soportada: Apple Silicon con MLX. Esta build no es utilizable en CUDA, ROCm ni CPU x86 genérica; para esos entornos hay que recurrir al checkpoint bf16 de NVIDIA o a su release GGUF.
- VRAM estimada: en Apple Silicon se consume memoria unificada; con 7,8 GB de pico medido, un Mac de 16 GB es un objetivo cómodo y uno de 8 GB queda muy justo (estimación, no medida por el autor).
- GPU recomendadas: no aplica en el sentido habitual; el requisito es un SoC Apple (M-series). Para GPUs NVIDIA, usar el modelo base.
- Opciones de despliegue: `mlx_lm` desde el fork del autor (`pip install git+https://github.com/ipsupport-llc/mlx-lm.git@main`), o la aplicación LLMTray para macOS, que además expone una API compatible con OpenAI.
- Limitación de despliegue: `mlx_lm.generate()` no tiene plomería multimodal para los modelos Gemma4 de este fork, así que la entrada de imagen y audio requiere un bucle de generación manual (el autor remite a su repo de pipeline).
- Latencia y throughput: no disponible. El modelo base se presenta como optimizado para bajo time-to-first-token, pero no se aportan cifras.

## Comparativa con modelos similares

| Build | Parámetros | Contexto | Modalidades | Tamaño de pesos | Licencia |
|---|---|---|---|---|---|
| Esta build (`roman220220/...-gptq-mlx-jang`) | ~6,13 B según safetensors (card: 8 B totales / 4 B efectivos) | No disponible | Texto + visión + audio (verificado por el autor) | ~6,3 GB (MLX) | openmdw-1.1 |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (base) | 8 B totales / 4 B efectivos según card | No disponible | Texto según la card de NVIDIA; el checkpoint contiene torres de visión y audio | ~16 GB (bf16) | openmdw-1.1 |
| GGUF + imatrix oficial de NVIDIA | Mismo modelo base | No disponible | Solo decoder de texto según el autor | Clase 4 GB (nombre del release) | openmdw-1.1 |
| Otras conversiones MLX independientes | Mismo modelo base | No disponible | Solo texto según el autor | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos frente a modelos de la misma categoría (por ejemplo, otros modelos de 4-8 B orientados a asistente local), por lo que la comparación se limita a parámetros, tamaño, modalidades y licencia.

## Limitaciones y advertencias

- Es una cuantización de terceros: no la publica NVIDIA, no está validada por NVIDIA y el repo registra 0 descargas y 0 likes en el momento de la ficha. Para producción conviene partir del checkpoint oficial.
- Licencia `openmdw-1.1` con campo `license: other`: es una licencia personalizada; los términos concretos de uso comercial no están detallados en la información disponible y deben revisarse en el fichero `LICENSE` antes de desplegar.
- Pérdida de fidelidad por cuantización: KL de 0,214 y acuerdo top-1 del 82,06 % frente a bf16. Un 18 % de desacuerdo en el siguiente token es relevante para tareas de alta precisión (código, matemáticas, extracción de datos).
- La PPL medida en wikitext-2 (167,25 frente a 173,95) no debe interpretarse como mejora del modelo; el propio autor lo advierte por el ruido del muestreo.
- Riesgo de alucinación: inherente a un modelo denso de tamaño pequeño; no se han publicado evaluaciones de factualidad.
- Idiomas soportados: no disponibles. No hay garantía de calidad fuera del inglés, y las pruebas documentadas están todas en inglés.
- Longitud de contexto: no disponible; no se puede planificar el diseño de prompts largos sin ese dato.
- Capacidades multimodales no documentadas por NVIDIA: la model card oficial describe el modelo como solo texto, así que el comportamiento de visión y audio es heredado del checkpoint y no está respaldado por evaluaciones del fabricante. Las pruebas del autor son puntuales (una foto, un clip de audio).
- Solo Apple Silicon: dependencia de MLX y de un fork específico de `mlx_lm`; no hay soporte para vLLM, TGI, llama.cpp ni Ollama en esta build.
- La entrada multimodal exige un bucle de generación manual; no funciona con la API de alto nivel `mlx_lm.generate()`.
- Layout de checkpoint no estándar (fichero separado de KV compartidas): replicar la cuantización sobre otros checkpoints de la misma familia requiere el parche correspondiente en el pipeline.
- Pico de 7,8 GB medido: en máquinas de 8 GB de memoria unificada el margen es mínimo y puede provocar swapping.
- Sesgos conocidos: no disponible (no se han publicado evaluaciones de sesgo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/Nemotron-3.5-Bolt-E4B-gptq-mlx-jang
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Repo del pipeline de cuantización Gemma4 (URL truncada en la model card: `https://github.com/rromenskyi/qu...`; verificar el enlace completo en la card original)
- Fork de `mlx-lm` usado: https://github.com/ipsupport-llc/mlx-lm
- LLMTray (aplicación macOS): https://www.ipsupport.us/llmtray/
- Repositorio LLMTray: https://github.com/ipsupport-llc/llmtray
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Fichero de licencia: `LICENSE` dentro del repo de HuggingFace
