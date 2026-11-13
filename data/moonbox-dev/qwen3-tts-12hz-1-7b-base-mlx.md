# moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-MLX

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-MLX es una conversión al formato MLX del modelo de síntesis de voz Qwen3-TTS 1.7B desarrollado por Qwen (Alibaba), publicada por el usuario moonbox-dev para su ejecución en Macs con Apple Silicon. El modelo original es un sistema text-to-speech de 1.7 mil millones de parámetros con capacidad de clonación de voz, diseñado para generar audio de alta fidelidad a partir de texto. Esta versión MLX no introduce cambios arquitectónicos: es una cuantización/reempaquetado de los pesos originales para aprovechar el framework MLX de Apple.

La relevancia de esta build radica en que permite ejecutar localmente en hardware Apple Silicon un modelo TTS de tamaño medio con clonación de voz, sin depender de GPUs NVIDIA ni de servicios en la nube. El repositorio incluye dos precisiones (bf16 y fp16) con verificaciones de fidelidad frente al modelo PyTorch original en términos de WER, CER, similitud de hablante y DNSMOS.

El modelo base pertenece a la familia Qwen3-TTS, referenciada en el paper arXiv:2601.15621, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 14.5 GB e incluye un tokenizador de habla (speech tokenizer) separado del modelo principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para TTS (Qwen3-TTS), con speech tokenizer separado; pesos convertidos a MLX |
| Parámetros totales | 1.7B (modelo principal); speech tokenizer adicional de 682.3 MB en bf16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 y fp16 (builds MLX); no se listan cuantizaciones de menor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con config.json, generation_config.json, tokenizer y speech_tokenizer |
| Tamaño del repositorio | 14.5 GB |
| Librería | mlx-audio |
| Hardware objetivo | Apple Silicon (Macs) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un sistema de síntesis de voz de la familia Qwen3-TTS. La designación "12Hz" hace referencia a la frecuencia de tokens de audio del tokenizador de habla asociado. La arquitectura combina un modelo transformer principal de 1.7B parámetros con un speech tokenizer independiente (0.68 GB en bf16) que convierte audio en tokens discretos y viceversa. Esta build MLX mantiene la estructura del pipeline original: solo se han convertido los componentes listados en la model card, y el resto del pipeline proviene del repositorio original de Qwen salvo que se indique lo contrario.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El paper referenciado (arXiv:2601.15621) probablemente contiene estos detalles, pero no se ha incluido su contenido. La innovación técnica destacable de esta publicación concreta es la conversión a MLX con verificación de fidelidad: se reportan métricas comparativas entre la build MLX y el modelo PyTorch original sobre las mismas entradas.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz (voice cloning), según los tags del repositorio.
- Generación de audio con fidelidad verificada: WER 0.0 % / CER 0.0 % en bf16 y fp16 frente al original.
- Preservación de similitud de hablante: 0.954/0.959 (bf16) y 0.957/0.949 (fp16) frente al original.
- Calidad de audio medida con DNSMOS: 3.08/3.08 (bf16) y 3.12/2.99 (fp16).
- Ejecución local en Apple Silicon mediante MLX y la librería mlx-audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (es un modelo TTS, no de razonamiento).
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Generación de audiolibros y narración: el modelo puede sintetizar texto largo en voz de forma local en un Mac con Apple Silicon, evitando costes de API y manteniendo los datos en el dispositivo.
- Clonación de voz para doblaje y localización: gracias a la capacidad de voice cloning, se puede generar audio en la voz de un hablante concreto para vídeos, podcasts o material formativo, con la ventaja de ejecución local.
- Asistentes de voz en aplicaciones de escritorio: integración en apps macOS mediante mlx-audio para convertir respuestas de texto en audio sin latencia de red.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, ejecutándose íntegramente en el equipo del usuario.
- Prototipado de interfaces conversacionales: desarrollo y prueba de flujos de voz en local antes de desplegar en producción, con fidelidad verificada frente al modelo original.
- Generación de contenido para medios: creación de locuciones para vídeos, anuncios o tutoriales con control de la voz mediante clonación, sin depender de servicios externos.
- Investigación en TTS: base para experimentos de síntesis de voz y clonación en entornos Apple Silicon, con pesos en formato MLX y métricas de referencia publicadas.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de la conversión MLX frente al modelo PyTorch original, no benchmarks absolutos del modelo:

| Métrica | bf16 (MLX / original) | fp16 (MLX / original) |
|---|---|---|
| WER | 0.0 % / 0.6 % | 0.0 % / no disponible |
| CER | 0.0 % / 0.0 % | 0.0 % / no disponible |
| Similitud de hablante | 0.954 / 0.959 | 0.957 / 0.949 |
| DNSMOS | 3.08 / 3.08 | 3.12 / 2.99 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo principal en bf16 ocupa 3.86 GB y el speech tokenizer 682.3 MB; en total, alrededor de 4.5-5 GB de memoria para los pesos, más overhead de ejecución.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA.
- Cabe en consumer hardware: sí, en Macs con Apple Silicon; la memoria unificada de los chips M-series permite ejecutarlo en equipos con 16 GB o más.
- Opciones de despliegue: MLX mediante la librería mlx-audio; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base-MLX (esta ficha) | 1.7B | no disponible | Apache 2.0 | safetensors MLX | Apple Silicon |
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1.7B | no disponible | Apache 2.0 | safetensors PyTorch | GPU NVIDIA/CPU |
| Otros modelos TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos TTS comparables (por ejemplo, de otras familias) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; los modelos TTS pueden heredar sesgos de los datos de entrenamiento en cuanto a voces, acentos y géneros.
- Riesgo de alucinación: en TTS se traduce en posibles errores de pronunciación, omisiones o artefactos de audio; las métricas WER/CER de la build son 0.0 %, pero no se detalla el conjunto de evaluación.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud máxima de texto; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la clonación de voz plantea riesgos legales y éticos (suplantación de identidad, consentimiento del hablante) que deben gestionarse aparte.
- Caveat de producción: esta build solo convierte los componentes listados; el resto del pipeline proviene del repositorio original de Qwen, por lo que hay que mantener la coherencia de versiones.
- Específica de MLX: requiere hardware Apple Silicon y la librería mlx-audio; no es portable a CUDA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Paper referenciado: arXiv:2601.15621 (https://arxiv.org/abs/2601.15621)
- Librería mlx-audio: no disponible enlace directo en la información proporcionada
- Blog o demo: no disponible
