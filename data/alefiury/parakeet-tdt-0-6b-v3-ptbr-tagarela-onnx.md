# alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx

## Resumen

Parakeet TDT 0.6B V3 pt-BR TAGARELA (ONNX) es una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B V3 de NVIDIA, adaptado al portugués de Brasil mediante fine-tuning sobre el conjunto de datos TAGARELA. Lo publica el usuario alefiury en Hugging Face y está pensado para ejecutarse de forma nativa con la librería `onnx-asr`, lo que facilita su despliegue en pipelines de inferencia ligeros sobre CPU o GPU sin depender del stack NeMo/PyTorch original.

El modelo base es un NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, originalmente multilingüe (25 idiomas europeos). Esta variante hereda esa arquitectura pero ha sido reentrenada para portugués, en particular pt-BR, partiendo del checkpoint ajustado por Alexandre Costa Ferro Filho. El resultado es un checkpoint especializado que reduce sustancialmente la tasa de error de palabra (WER) en portugués frente al modelo multilingüe original.

Su relevancia actual radica en que combina un tamaño contenido (0,6B) con un rendimiento en portugués que, según los datos publicados por el autor, supera en WER medio a alternativas mucho mayores como Whisper large-v3, Qwen3ASR 1.7B o Voxtral-Small 24B tanto en habla preparada como espontánea. El formato ONNX y la licencia CC-BY-4.0 lo hacen atractivo para integraciones en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parámetros totales | 0,6B (aproximadamente 600 millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Portugués (pt), con foco en pt-BR; el modelo base cubre 25 idiomas europeos pero el rendimiento fuera del portugués no está garantizado |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (compatible con onnx-asr) |

## Arquitectura y entrenamiento

El modelo es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones, típico de la familia NeMo de NVIDIA para reconocimiento de voz. El decodificador emplea TDT (Token-and-Duration Transducer), una variante de los transductores que predice conjuntamente el token y su duración, lo que permite un alineamiento más eficiente y una decodificación sin modelos externos de lenguaje. El checkpoint es una exportación a ONNX del modelo ajustado, no un reentrenamiento desde cero.

El ajuste al portugués se realizó sobre el conjunto TAGARELA, un corpus a gran escala de habla en portugués derivado de pódcast, descrito en el paper arXiv:2603.15326. El modelo base Parakeet TDT 0.6B V3 de NVIDIA es multilingüe (25 idiomas europeos); esta variante parte del checkpoint `alexandreacff/parakeet-tdt-0.6b-v3-ptBR-plus` y se ha optimizado para pt-BR. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en portugués, con especial énfasis en portugués de Brasil.
- Transcripción de audio a texto en formato WAV mediante la API `recognize` de `onnx-asr`.
- Inferencia nativa en ONNX, apta para despliegue en CPU y GPU sin dependencias de PyTorch/NeMo.
- Soporte de selección de idioma en la llamada de inferencia (`language="pt"`).
- Decodificación TDT integrada, sin necesidad de un modelo de lenguaje externo para el alineamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio bidireccional ni modo de razonamiento (thinking), al tratarse de un modelo puramente ASR.
- Capacidad multilingüe heredada del modelo base no garantizada fuera del portugués.

## Casos de uso

- Transcripción de pódcast y contenido largo en portugués: TAGARELA se construyó a partir de pódcast, por lo que el modelo está especialmente alineado con este dominio; puede procesar episodios completos con WER bajo en habla espontánea.
- Subtitulado automático de vídeo y audio en pt-BR: la inferencia ONNX permite integrar el modelo en pipelines de generación de subtítulos con latencia contenida.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas o en streaming para análisis de calidad, cumplimiento y generación de resúmenes, gracias al buen rendimiento en habla espontánea (WER medio 0,143 según el autor).
- Actas y notas de reuniones: conversión de reuniones en portugués a texto para búsqueda y archivo, con despliegue en servidores sin GPU dedicada mediante ONNX en CPU.
- Investigación lingüística y corpus: transcripción de entrevistas y grabaciones de campo en portugués (por ejemplo, corpus tipo NURC o C-ORAL Brasil) para análisis sociolingüístico.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en portugués, con despliegue en entornos de borde gracias al tamaño reducido del modelo.
- Integración en aplicaciones de dictado o asistentes de voz en pt-BR que requieran un motor ASR ligero y con licencia permisiva para uso comercial.

## Benchmarks y rendimiento

Datos publicados por el autor (WER, menor es mejor). Habla preparada:

| Modelo | CETUC | Common Voice 21.0 | MLS (pt) | MTEDx (pt) | Media preparada |
|---|---:|---:|---:|---:|---:|
| Parakeet TDT V3 0.6B - ONNX (TAGARELA) | 0,006 | 0,051 | 0,108 | 0,133 | 0,075 |
| Parakeet TDT V3 0.6B | 0,027 | 0,081 | 0,064 | 0,186 | 0,090 |
| Qwen3ASR 1.7B | 0,028 | 0,068 | 0,077 | 0,157 | 0,083 |
| Whisper large-v3 | 0,021 | 0,065 | 0,073 | 0,176 | 0,084 |
| Voxtral-Small 24B | 0,019 | 0,055 | 0,054 | 0,168 | 0,074 |
| Canary V2 1B | 0,036 | 0,120 | 0,078 | 0,178 | 0,103 |
| Distil-Whisper large-v3 PT-BR | 0,030 | 0,094 | 0,092 | 0,168 | 0,096 |
| ElevenLabs Scribe v2 | 0,018 | 0,047 | 0,038 | 0,138 | 0,060 |

Habla espontánea:

| Modelo | ALIP | C-ORAL Brasil I | NURC-Recife | SP2010 | NURC-SP | MuPe | Privado | Media espontánea |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Parakeet TDT V3 0.6B - ONNX (TAGARELA) | 0,213 | 0,137 | 0,138 | 0,104 | 0,160 | 0,120 | 0,127 | 0,143 |
| Parakeet TDT V3 0.6B | 0,316 | 0,213 | 0,269 | 0,180 | 0,202 | 0,176 | 0,173 | 0,218 |
| Qwen3ASR 1.7B | 0,316 | 0,222 | 0,255 | 0,191 | 0,202 | 0,187 | 0,147 | 0,217 |
| Whisper large-v3 | 0,345 | 0,220 | 0,290 | 0,236 | 0,218 | 0,177 | 0,150 | 0,234 |
| Voxtral-Small 24B | 0,396 | 0,227 | 0,298 | 0,196 | 0,216 | 0,179 | 0,143 | 0,236 |
| Canary V2 1B | 0,415 | 0,290 | 0,366 | 0,273 | 0,247 | 0,229 | 0,174 | 0,285 |
| Distil-Whisper large-v3 PT-BR | 0,374 | 0,242 | 0,297 | 0,226 | 0,226 | 0,193 | 0,154 | 0,245 |
| ElevenLabs Scribe v2 | 0,329 | 0,170 | 0,307 | 0,155 | 0,207 | 0,205 | 0,121 | 0,213 |

## Requisitos de hardware

- El modelo tiene 0,6B parámetros; el repositorio ocupa 2,5 GB en formato ONNX.
- VRAM estimada para inferencia en GPU: no disponible de forma explícita; por tamaño, cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es suficiente. El despliegue en CPU es viable gracias a ONNX.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4-8 GB de VRAM o más.
- Opciones de despliegue: `onnx-asr` (con extras `[cpu]` o `[hub]`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio preparada | WER medio espontánea | Licencia |
|---|---|---:|---:|---:|---|
| Parakeet TDT 0.6B V3 pt-BR TAGARELA (ONNX) | 0,6B | no disponible | 0,075 | 0,143 | CC-BY-4.0 |
| Whisper large-v3 | ~1,55B | 30 s de audio | 0,084 | 0,234 | MIT (según modelo original) |
| Qwen3ASR 1.7B | 1,7B | no disponible | 0,083 | 0,217 | no disponible |
| Voxtral-Small 24B | 24B | no disponible | 0,074 | 0,236 | no disponible |
| Canary V2 1B | 1B | no disponible | 0,103 | 0,285 | no disponible |

El modelo destaca por ofrecer el mejor WER medio en habla espontánea de la comparativa publicada y un WER competitivo en habla preparada, con un tamaño mucho menor que Voxtral-Small 24B o Whisper large-v3.

## Limitaciones y advertencias

- Rendimiento óptimo solo en portugués, especialmente pt-BR; el rendimiento en otros idiomas no está garantizado aunque el modelo base sea multilingüe.
- No se han publicado análisis de sesgos demográficos, acento o género; existe riesgo de sesgo derivado del corpus TAGARELA (pódcast) y del modelo base.
- Riesgo de alucinación o transcripciones incorrectas en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y respetar los términos.
- El modelo es una conversión ONNX sin cuantización documentada; el rendimiento puede diferir del checkpoint PyTorch/NeMo original.
- No dispone de marcas de tiempo, diarización de hablantes ni puntuación avanzada documentadas.
- Al ser un modelo ASR puro, no soporta tool calling, agentes ni razonamiento multi-paso.
- Los benchmarks proceden del propio autor y no han sido verificados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alefiury/parakeet-tdt-0.6b-v3-ptBR-TAGARELA-onnx
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Checkpoint ajustado pt-BR: https://huggingface.co/alexandreacff/parakeet-tdt-0.6b-v3-ptBR-plus
- Framework de inferencia onnx-asr: https://github.com/istupakov/onnx-asr
- Dataset TAGARELA: https://huggingface.co/datasets/freds0/TAGARELA
- Paper TAGARELA: https://arxiv.org/abs/2603.15326
