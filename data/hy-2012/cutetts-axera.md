# HY-2012/CuteTTS.AXERA

## Resumen

CuteTTS.AXERA es una adaptación del modelo de síntesis de voz CuteTTS-distill (desarrollado originalmente por OPPO y la Universidad de Fudan) para ejecutarse íntegramente sobre la NPU del SoC AX650 de AXERA. El autor del port, HY-2012, ha convertido los distintos componentes del pipeline a modelos compilados (`axmodel`) y proporciona un SDK en Python que orquesta la inferencia en la placa. El resultado es un sistema de text-to-speech de 0,2B parámetros con clonación de voz zero-shot, salida a 24 kHz y licencia Apache-2.0.

La relevancia del proyecto reside en su enfoque: en lugar de usar tokens discretos de codec, CuteTTS emplea un LM autorregresivo que predice latentes continuos de 64 dimensiones, un cabezal de difusión destilado a 4 pasos y un VAE causal para reconstruir la forma de onda. Esta arquitectura se traduce en siete tipos de subgrafos NPU (`vae_enc`, `spk_body`, `locenc_step`, `lm_prefill`, `lm_decode`, `dit_step` y `vae_dec`), todos ejecutados en el AX650, con el host encargándose únicamente del bucle de control y de las operaciones normalizadas.

El modelo soporta cinco idiomas (inglés, chino, francés, alemán y español) y está pensado para despliegues en dispositivos de borde con NPU, no para servidores GPU. La documentación reporta un tiempo de extremo a extremo de 1,89 s para generar 3,20 s de audio (factor de tiempo real de 1,69×) en el caso de referencia en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (LM de 7 capas Qwen3) + cabezal de difusión destilado (4 pasos Euler) + VAE causal |
| Parametros totales | 0,2B (aproximadamente, según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de prefijo (prefill) + 384 de KV cache en decodificación; generación máxima de 20,5 s de audio (256 latentes) |
| Tipos de cuantizacion | U16 (según notas de precisión del autor); no se detallan otros formatos |
| Idiomas soportados | en, zh, fr, de, es |
| Licencia | Apache-2.0 (componentes upstream con sus propias licencias, ver NOTICE) |
| Formato de pesos | `axmodel` precompilados para NPU AX650; assets auxiliares en `.npy` y tokenizer SentencePiece |
| Frecuencia de muestreo de audio | 24 kHz |
| Latentes por token | 2 frames de 64 dimensiones (≈160 ms de audio por patch) |
| Referencia de audio máxima | 5 s (120 000 muestras, entrada estática de `vae_enc`) |
| Generación máxima | 20,5 s (bucket `vae_dec_l256`) |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

CuteTTS sustituye la tokenización discreta tipo codec por un esquema de latentes continuos: el LM autorregresivo (7 capas basadas en Qwen3) predice en cada paso un token que se mapea a 2 frames de 64 dimensiones mediante un encoder de localización (`locenc_step`). Esos latentes se refinan con un cabezal de difusión destilado a 4 pasos Euler (`dit_step`), y finalmente un VAE causal (`vae_dec`) reconstruye la forma de onda a 24 kHz. La voz de referencia se procesa con un encoder VAE (`vae_enc`) y un encoder de hablante basado en ECAPA (`spk_body`, con pooling atencional y operaciones BN/linear/L2 en host).

El modelo base es `OPPOer/CuteTTS-distill`, una versión destilada del CuteTTS original de OPPO y Fudan. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la combinación de LM autorregresivo con latentes continuos y difusión destilada, que evita los artefactos de cuantización típicos de los codecs discretos y permite una huella computacional reducida (0,2B) compatible con NPU de borde.

## Capacidades

- Síntesis de voz (text-to-speech) a 24 kHz con calidad de audio natural.
- Clonación de voz zero-shot: el modelo toma una referencia de audio de hasta 5 s y reproduce el timbre del hablante.
- Multilingüe: inglés, chino, francés, alemán y español.
- Control de generación mediante CFG (classifier-free guidance), semilla aleatoria y longitud máxima de patches.
- Inferencia íntegra en NPU AX650 (7 tipos de subgrafos compilados).
- SDK en Python (numpy + `axengine`) para integración en aplicaciones de borde.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta soporte de visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo cabe en la NPU AX650 y genera audio a 1,69× tiempo real, lo que permite respuestas habladas en tiempo casi interactivo sin depender de la nube.
- Clonación de voz personalizada en aplicaciones de accesibilidad: con una muestra de 5 s del usuario, el sistema puede sintetizar su voz para lectura de textos o comunicación aumentativa.
- Localización de contenidos multilingües: al soportar en, zh, fr, de y es, se puede usar para doblar o generar audiolibros y avisos en varios idiomas con una misma referencia de voz.
- Integración en electrodomésticos y sistemas embebidos con AX650: notificaciones por voz, guías interactivas o interfaces habladas en dispositivos sin GPU.
- Prototipado de interfaces conversacionales: el SDK Python y los ejemplos de línea de comandos permiten validar rápidamente un pipeline TTS en placa antes de portar a producción.
- Generación de avisos y locuciones dinámicas: anuncios de transporte, señalización o sistemas de megafonía que requieren síntesis en tiempo real con voces personalizadas.
- Investigación en TTS de borde: el paquete incluye scripts de conversión y métricas de precisión (cosine, SNR) que facilitan reproducir y extender el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo TTS. El autor reporta métricas de precisión de la cuantización frente a ONNX fp32 y tiempos de inferencia en placa:

| Métrica | Valor |
|---|---|
| Cosine `vae_enc` | 0,9700 |
| Cosine `spk_body` (stats) | 0,9996 |
| Cosine `speaker embedding` | 0,9966 |
| Cosine `locenc_step` | 0,9994 |
| Cosine `dit` 4-step latent | 0,9849 |
| Cosine `lm_prefill` (stop) | 0,9258 |
| Cosine `lm_decode` (hidden) | 0,9905 |
| Cosine `vae_dec_l64` | 0,9774 |
| Cosine `vae_dec_l128` | 0,9557 |
| Cosine `vae_dec_l256` | 0,8841 |

| Etapa (caso en_default, 3,20 s de audio, 20 patches) | Tiempo |
|---|---|
| VAE encoder | 430,5 ms |
| Speaker encoder | 76,2 ms |
| LocEnc + prompt | 44,3 ms |
| LM prefill (≈115 tokens) | 66,7 ms |
| Bucle AR (DiT + LM decode) | 794,8 ms |
| VAE decoder | 300,9 ms |
| **End-to-end** | **1891,0 ms** |
| **Tiempo real (audio/tiempo)** | **1,69×** |

Validación ASR en placa (SenseVoice): frases cortas en inglés y chino transcritas palabra por palabra; frases largas (>10 s) presentan degradaciones puntuales en palabras.

## Requisitos de hardware

- NPU AX650 (SoC AXERA) obligatoria: el paquete solo incluye `axmodel` precompilados para esta NPU; no se proporcionan pesos en otros formatos.
- Memoria: el repositorio ocupa 0,7 GB; se recomienda almacenar `models/` en eMMC/SD local (carga inicial ≈2 s) en lugar de NFS (≈25 s en frío).
- No cabe en GPU consumer convencional porque no hay versiones CUDA/ROCm publicadas; el despliegue es específico de la NPU AX650.
- Opciones de despliegue: SDK Python (`cutetts_ax`) con dependencias `numpy`, `sentencepiece` y `axengine` (incluido en la imagen BSP de AX650); scripts `setup.sh` y `run_ax650.sh`.
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: 1,89 s end-to-end para 3,20 s de audio en el caso de referencia; el bucle AR (794,8 ms) es el cuello de botella principal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CuteTTS.AXERA | 0,2B | 20,5 s de audio; referencia 5 s | en, zh, fr, de, es | Apache-2.0 | Solo NPU AX650 (axmodel) |
| CuteTTS-distill (upstream) | 0,2B (aprox.) | no disponible en la información | no disponible | no disponible en la información | Pesos originales en HF |
| Alternativas TTS zero-shot de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos TTS, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La referencia de audio está limitada a 5 s; entradas más largas se truncan.
- La generación máxima es de 20,5 s de audio; superar ese límite provoca error.
- La cuantización U16 acumula error en el bucle autorregresivo de 20-40 pasos: en frases largas (>10 s) la transcripción ASR puede presentar palabras degradadas, aunque las frases cortas son exactas.
- Solo existe SDK en Python (numpy + `pyaxengine`); no hay versión C++.
- Dependencia total del hardware AX650: no hay pesos en safetensors, GGUF ni otros formatos para GPU/CPU.
- Riesgo de alucinación y artefactos en la voz clonada, especialmente con referencias ruidosas o de duración insuficiente.
- Sesgos de hablante y de idioma no documentados en la información disponible; la calidad puede variar entre los cinco idiomas soportados.
- Licencia Apache-2.0 para el port, pero los componentes upstream (CuteTTS de OPPO/Fudan, Qwen3, DAC) mantienen sus propias licencias; es necesario revisar `NOTICE` antes de uso comercial.
- No se documentan mecanismos de seguridad, filtrado de contenido ni marcas de agua en el audio generado.

## Enlaces

- Hugging Face: https://huggingface.co/HY-2012/CuteTTS.AXERA
- GitHub (código y scripts de conversión): https://github.com/ZY-2012/CuteTTS.AXERA
- Modelo upstream: https://huggingface.co/OPPOer/CuteTTS-distill
