# AtomicChat/LFM3-Audio-2B-GGUF

## Resumen

LFM3-Audio-2B-GGUF es una colección de cuantizaciones GGUF (etiquetadas "Atomic-Dynamic" o AD) del modelo de audio LFM3-Audio-2B desarrollado por LiquidAI, publicada por el equipo de AtomicChat. El modelo base es un modelo de speech compacto de aproximadamente 1,73 mil millones de parámetros que acepta texto y audio como entrada y genera texto y audio como salida, lo que permite tanto reconocimiento de voz (ASR) como síntesis de voz (TTS) en un único modelo. La contribución principal de este repositorio es ofrecer cuantizaciones optimizadas con matriz de importancia (imatrix) que permiten ejecutar el modelo localmente en llama.cpp con muy poca memoria.

Su relevancia radica en que demuestra que un modelo de speech pequeño puede ejecutarse íntegramente en local (incluso en portátiles) para tareas de voz a texto y texto a voz, sin depender de APIs en la nube. El soporte de LFM3-Audio se integró en llama.cpp mediante el pull request #31257, y el repositorio incluye el proyector de audio (`mmproj`) necesario para cualquier operación con audio. La licencia es LFM Open License v1.0, una licencia personalizada de LiquidAI que conviene revisar antes de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de speech texto+audio entrada, texto+audio salida; detalles no publicados en la model card) |
| Parámetros totales | 1.728.801.600 (~1,73 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S, AD-IQ3_XXS, además de BF16/Q8_0 para el mmproj |
| Idiomas soportados | en, zh, de, fr, es, ja, ar, ko |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0) |
| Formato de pesos | GGUF (cuantizado, con imatrix); base en safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos de la arquitectura interna ni del proceso de entrenamiento en la información disponible. Lo que sí se conoce es la estructura del despliegue: el modelo se divide en dos componentes, el LLM principal (cuantizado en la escalera de cuantizaciones AD) y un proyector de audio (`mmproj-LFM3-Audio-2B-F16.gguf`, disponible también en BF16 y Q8_0) que es imprescindible para cualquier entrada o salida de audio. El proyector se encarga de traducir entre las representaciones de audio y el espacio de embeddings del LLM.

Sobre el entrenamiento del modelo base, no se han publicado cifras de tokens, composición del dataset ni etapas de RLHF/DPO en la información disponible. En cuanto a la cuantización, las versiones AD (Atomic-Dynamic) emplean imatrix (matriz de importancia) y, según el autor, sustituyen a los presets estándar de llama.cpp en todos los tamaños, con métricas de calidad medidas como top-1 de coincidencia de tokens y divergencia KLD media frente al modelo BF16 original.

## Capacidades

- Reconocimiento de voz (ASR): transcribe audio a texto, con instrucciones en lenguaje natural para seleccionar el idioma (por ejemplo, "Perform ASR in English").
- Síntesis de voz (TTS): genera audio a partir de texto mediante `llama-tts`, con selección de idioma (`--tts-lang`, por defecto `en`) y de voz (`--tts-voice`: `female` por defecto o `male`).
- Entrada y salida multimodal de audio: acepta audio y texto simultáneamente y produce texto y audio.
- Soporte multilingüe en ocho idiomas: inglés, chino, alemán, francés, español, japonés, árabe y coreano.
- Formato conversacional (etiqueta `conversational` en la model card).
- Ejecución totalmente local y sin conexión en llama.cpp (compatible con `llama-mtmd-cli` y `llama-tts`).

No hay información disponible sobre tool calling, capacidades de agentes, generación de código ni razonamiento matemático.

## Casos de uso

- Transcripción local de notas de voz: un desarrollador puede integrar `llama-mtmd-cli` en un script para transcribir grabaciones sin enviar audio a servicios de terceros, útil para aplicaciones con requisitos de privacidad.
- Narración de contenido en local: generación de locuciones a partir de texto (audiolibros, resúmenes de artículos, respuestas de asistentes) con `llama-tts`, eligiendo voz masculina o femenina y el idioma mediante `--tts-lang`.
- Asistentes de voz offline en dispositivos de gama baja: con cuantizaciones de 0,81-1,13 GB en disco, el modelo cabe en portátiles sin GPU dedicada, lo que lo hace adecuado para apps como Atomic Chat que ejecutan modelos abiertos en local.
- Transcripción multilingüe en un único despliegue: al soportar ocho idiomas (incluidos español, árabe y japonés), un mismo binario puede atender transcripciones en varios idiomas indicándolo en la instrucción del sistema.
- Prototipado rápido de pipelines de voz: el formato GGUF y la integración en llama.cpp permiten probar ASR y TTS con comandos de una línea antes de integrarlos en aplicaciones más complejas.
- Procesamiento de audio sensible (salud, legal, empresas): al ejecutarse íntegramente en local, evita el envío de grabaciones confidenciales a la nube.
- Accesibilidad: generación de voz sintética para lectores de pantalla personalizados o transcripción en tiempo real para usuarios con necesidades de accesibilidad, sin coste por uso de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni métricas de calidad de ASR/TTS (WER, MOS) en la información disponible.

El repositorio sí publica métricas de calidad de cuantización frente al modelo BF16 original:

| Rung | GB en disco | bpw | top-1 | KLD medio |
|---|---|---|---|---|
| Q8_0 | 1,85 | 8,51 | 97,9 % | 0,001 |
| AD-Q6_K | 1,59 | 7,31 | 97,2 % | 0,003 |
| AD-Q5_K_M | 1,31 | 6,03 | 94,8 % | 0,010 |
| AD-Q4_K_M | 1,13 | 5,20 | 91,6 % | 0,028 |
| AD-IQ4_XS | 1,09 | 5,02 | 90,9 % | 0,034 |
| AD-IQ3_S | 0,92 | 4,23 | 86,6 % | 0,075 |
| AD-IQ3_XXS | 0,81 | 3,71 | 80,5 % | 0,171 |

`top-1` indica la frecuencia con la que la cuantización elige el mismo token siguiente que el BF16 original; KLD medio es la divergencia media (menor es mejor). El autor recomienda AD-Q4_K_M como opción por defecto.

## Requisitos de hardware

- VRAM/memoria estimada: el LLM ocupa entre 0,81 GB (AD-IQ3_XXS) y 1,85 GB (Q8_0) en disco; hay que añadir el proyector mmproj en F16 (tamaño no especificado en la información disponible). En la práctica, el modelo completo debería funcionar con holgura en equipos con 8 GB de RAM o una GPU con 4-6 GB de VRAM.
- GPU recomendadas: no disponible; por su tamaño, no requiere GPU dedicada. Cabe en GPUs consumer como una RTX 3060 de 12 GB o incluso en GPUs de 4 GB usando cuantizaciones IQ3, y es plenamente viable solo con CPU.
- Consumer GPUs: sí, en prácticamente cualquier GPU moderna; también funciona solo con CPU dada la huella mínima.
- Despliegue: llama.cpp con soporte LFM3-Audio (merge #31257, archivos generados en el commit `19ff817`). Herramientas concretas: `llama-mtmd-cli` para ASR y `llama-tts` para TTS. También puede descargarse directamente con `-hf AtomicChat/LFM3-Audio-2B-GGUF:AD-Q4_K_M`. No se menciona soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Formato | Licencia |
|---|---|---|---|---|
| LFM3-Audio-2B (esta ficha) | ~1,73 B | ASR + TTS unificados (audio y texto entrada/salida) | GGUF | LFM Open License v1.0 |
| Whisper (OpenAI, small/medium) | 244 M - 769 M | Solo ASR | PyTorch/GGML | MIT |
| Kokoro (hexgrad) | ~82 M | Solo TTS | safetensors/ONNX | Apache 2.0 |

La diferencia clave frente a alternativas como Whisper (solo reconocimiento) o Kokoro (solo síntesis) es que LFM3-Audio-2B unifica ASR y TTS en un único modelo conversacional con entrada y salida de audio, a costa de un tamaño mayor. No hay datos de benchmarks comparativos de calidad publicados en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo de speech entrenado en ocho idiomas, el rendimiento probablemente sea desigual entre ellos, pero no se han publicado métricas por idioma.
- Riesgo de alucinación: no disponible; en ASR, los modelos generativos pueden inventar contenido cuando el audio es ininteligible, y no hay datos de WER publicados para evaluarlo.
- Limitaciones de idioma: soporta ocho idiomas (en, zh, de, fr, es, ja, ar, ko); no hay información sobre calidad relativa entre ellos ni sobre acentos o ruido de fondo.
- Licencia: LFM Open License v1.0 es una licencia personalizada ("other" en HuggingFace); debe revisarse el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones.
- Requiere una versión concreta de llama.cpp: es necesario un build con soporte LFM3-Audio (merge #31257 o posterior); versiones antiguas no funcionarán.
- El proyector mmproj es obligatorio para cualquier operación con audio; sin él, el modelo no procesa ni genera voz.
- La cuantización AD-IQ3_XXS muestra una degradación notable (top-1 del 80,5 %, KLD 0,171), por lo que puede afectar a la calidad de transcripción y síntesis; se recomienda AD-Q4_K_M o superior.
- La voz TTS está limitada a dos opciones (femenina y masculina) y la selección de idioma depende del parámetro `--tts-lang`.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/AtomicChat/LFM3-Audio-2B-GGUF
- Modelo base de LiquidAI: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Pull request de soporte LFM3-Audio en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Web de AtomicChat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- Cuenta de X: https://x.com/atomic_chat_hq
