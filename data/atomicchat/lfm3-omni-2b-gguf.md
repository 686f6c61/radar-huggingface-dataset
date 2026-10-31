# AtomicChat/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es una colección de cuantizaciones GGUF dinámicas (Atomic-Dynamic, AD) del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por AtomicChat en HuggingFace. El modelo base, desarrollado por LiquidAI, es un modelo "any-to-any" de aproximadamente 1,73 mil millones de parámetros capaz de aceptar texto, imagen y audio como entrada y generar tanto texto como audio de salida (incluida síntesis de voz). Esto lo convierte en uno de los pocos modelos pequeños open-weight que cubren ASR, visión y TTS en un único modelo.

La relevancia de esta ficha radica en el formato: las cuantizaciones GGUF permiten ejecutar el modelo localmente en llama.cpp, gracias al soporte de LFM3-Omni/audio fusionado en el PR #31257. Con cuantizaciones que van desde Q8_0 (1,85 GB) hasta IQ3_XXS (0,81 GB), el modelo cabe en prácticamente cualquier GPU de consumo e incluso en CPU, lo que habilita casos de uso offline como transcripción de voz, descripción de imágenes y generación de voz en dispositivos modestos.

Se trata de un modelo no razonador (non-reasoning), optimizado para inferencia rápida y multimodal, con soporte para ocho idiomas (inglés, chino, alemán, francés, español, japonés, árabe y coreano) bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrido (convolución corta + atención con gating) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S, AD-IQ3_XXS (más mmproj en F16 y Q8_0) |
| Idiomas soportados | en, zh, de, fr, es, ja, ar, ko |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0) |
| Formato de pesos | GGUF (con imatrix; incluye proyector multimodal mmproj en F16) |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B de LiquidAI emplea una arquitectura híbrida LFM3 que combina capas de convolución corta (short convolution) con capas de atención con gating (gated attention). Este tipo de arquitectura híbrida busca reducir el coste computacional de la atención estándar manteniendo la capacidad de capturar dependencias largas, lo que resulta especialmente adecuado para procesar secuencias de audio de gran longitud. El pipeline es any-to-any: texto, imagen y audio como entrada; texto y audio como salida, mediante un proyector multimodal (mmproj) que se distribuye junto a los pesos del LLM.

Sobre los datos y el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información disponible en la ficha. En cuanto a las cuantizaciones, AtomicChat emplea cuantizaciones dinámicas con imatrix (matriz de importancia) y publica métricas de calidad por peldaño: la coincidencia top-1 de tokens respecto al modelo BF16 original y la divergencia KL media. Según el autor, los peldaños AD superan a los presets estándar de llama.cpp sin imatrix en todos los tamaños. Es un modelo no razonador: en llama-server debe usarse la opción `--reasoning off`.

## Capacidades

- Reconocimiento de voz a texto (ASR): transcribe audio de entrada en los idiomas soportados, configurable mediante prompts del sistema.
- Comprensión de imagen + texto: describe y razona sobre imágenes combinadas con instrucciones textuales (visión mediante el proyector mmproj).
- Texto a voz (TTS): genera audio hablado a partir de texto, con voces masculina y femenina y selección de idioma mediante `--tts-lang`.
- Entrada y salida multimodal completa (any-to-any): combina audio, imagen y texto en una sola pasada de inferencia.
- Generación de texto conversacional en ocho idiomas (en, zh, de, fr, es, ja, ar, ko).
- Ejecución 100% local y offline en llama.cpp (llama-mtmd-cli, llama-server, llama-tts).
- No soporta modo de razonamiento (thinking); es un modelo directo non-reasoning.
- No hay información disponible sobre soporte de tool calling / function calling ni capacidades de agentes.

## Casos de uso

- Transcripción de voz local y offline: con `llama-mtmd-cli` y `--audio speech.wav` se puede montar un servicio de ASR sin enviar audio a la nube, adecuado para entornos con requisitos de privacidad (salud, legal, empresas).
- Subtitulado automático de vídeos: dado su tamaño de ~1,1 GB en AD-Q4_K_M, puede procesar pistas de audio en lotes en portátiles o máquinas modestas.
- Generación de locuciones y voz sintética: mediante `llama-tts` con voz masculina o femenina y selección de idioma, útil para crear audioguías, respuestas de IVR o narración de contenidos en español y otros siete idiomas.
- Asistentes multimodales en el borde (edge): combina descripción de imágenes, conversación y voz en un único modelo de menos de 2 GB, idóneo para apps locales como Atomic Chat que ejecutan modelos open-weight sin conexión.
- Accesibilidad: descripción de imágenes para usuarios con discapacidad visual y lectura en voz alta de textos, todo en un solo despliegue local.
- Atención al cliente con voz: pipeline conversacional completo (voz entrante transcrita, respuesta textual y voz sintética de salida) en hardware de bajo coste, gracias a que un solo modelo cubre ASR, LLM y TTS.
- Clasificación y análisis de contenido multimodal: etiquetado de imágenes y audios en flujos de trabajo de moderación o indexación, con inferencia en CPU o GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Como métricas de calidad de cuantización, el autor publica las siguientes:

| Rung | GB en disco | bpw | top-1 vs BF16 | KLD medio |
|---|---|---|---|---|
| Q8_0 | 1,85 | 8,51 | 98,0% | 0,001 |
| AD-Q6_K | 1,59 | 7,31 | 97,1% | 0,003 |
| AD-Q5_K_M | 1,31 | 6,03 | 94,8% | 0,011 |
| AD-Q4_K_M | 1,13 | 5,20 | 91,5% | 0,029 |
| AD-IQ4_XS | 1,09 | 5,02 | 90,8% | 0,035 |
| AD-IQ3_S | 0,92 | 4,23 | 86,3% | 0,078 |
| AD-IQ3_XXS | 0,81 | 3,71 | 79,8% | 0,185 |

## Requisitos de hardware

- VRAM/RAM para inferencia: el LLM ocupa entre 0,81 GB (AD-IQ3_XXS) y 1,85 GB (Q8_0) en disco; hay que añadir el proyector mmproj F16 (tamaño no disponible) para uso multimodal. En la práctica, con AD-Q4_K_M el modelo completo cabe holgadamente en 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna; por su tamaño, no se requiere A100 ni H100. Una RTX 3060 de 12 GB o incluso una RTX 3050 de 6 GB es más que suficiente.
- Consumer GPU: sí, cabe en prácticamente todas; también es viable la ejecución en CPU pura dado el tamaño de ~1,7B de parámetros.
- Despliegue: llama.cpp es el runtime de referencia (necesario un build con soporte LFM3-Omni, fusionado en el PR #31257; los ficheros se generaron en llama.cpp `19ff817`). Herramientas: `llama-mtmd-cli` (ASR y visión), `llama-tts` (síntesis de voz) y `llama-server` con `--reasoning off`. No consta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B (esta ficha) | 1,73B | texto, imagen, audio → texto, audio | no disponible | LFM Open License v1.0 | GGUF (llama.cpp), safetensors |
| Qwen2.5-Omni-3B/7B (Alibaba) | 3B/7B | texto, imagen, audio, vídeo → texto, audio | no disponible | Apache 2.0 / Qwen (según tamaño) | safetensors, GGUF comunitarios |
| MiniCPM-o 2.6 (OpenBMB) | ~8B | texto, imagen, audio → texto, audio | no disponible | licencia propia (uso comercial restringido) | safetensors, GGUF comunitarios |

LFM3-Omni-2B destaca por ser el más pequeño del grupo (~1,7B frente a 3B–8B), lo que lo hace mucho más accesible en hardware de consumo, a costa presumiblemente de menor capacidad de razonamiento. No hay datos de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- Es un modelo no razonador: no genera cadenas de pensamiento; en llama-server debe forzarse `--reasoning off` para evitar salidas con formato de razonamiento.
- Al ser un modelo de ~1,7B de parámetros, sus capacidades de razonamiento complejo, código y matemáticas serán limitadas frente a modelos mayores; no hay benchmarks que cuantifiquen este punto.
- Riesgo de alucinación: no disponible información específica, pero como todo modelo pequeño generativo, las transcripciones, descripciones de imagen y textos generados deben verificarse en producción.
- La calidad de las cuantizaciones bajas degrada de forma medible: AD-IQ3_XXS solo coincide con el BF16 original en el 79,8% de los tokens (KLD 0,185); para producción se recomienda AD-Q4_K_M o superior.
- Contexto máximo: no disponible; conviene verificarlo antes de procesar audios o imágenes largas.
- Licencia: LFM Open License v1.0 es una licencia "other", no una licencia estándar permisiva; debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- Requiere un build específico de llama.cpp (PR #31257 o posterior); versiones anteriores no cargarán el modelo.
- El proyector mmproj es obligatorio para cualquier entrada/salida de imagen o audio; sin él solo funciona la parte textual.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/AtomicChat/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- PR de soporte LFM3-Omni en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Web de AtomicChat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
