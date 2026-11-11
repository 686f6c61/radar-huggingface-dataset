# abdouaziz/mina

## Resumen

mina es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante fine-tuning de openai/whisper-small, publicado por el usuario abdouaziz en Hugging Face. Se distribuye como un checkpoint de la familia Whisper con 241.734.912 parametros (aproximadamente 242 millones), lo que corresponde a la variante "small" de la arquitectura original de OpenAI para transcripcion de audio.

El modelo se ha entrenado con el Trainer de Hugging Face sobre un conjunto de datos no especificado en la model card (el autor indica "None dataset"), y reporta una perdida de validacion de 0.3404 y un WER de 0.2722 sobre el conjunto de evaluacion. Estos datos sugieren un ajuste orientado a un dominio o idioma concreto, aunque la informacion publicada no permite determinar cual, ya que la model card no detalla la composicion del corpus ni los idiomas de entrenamiento.

Su relevancia practica es limitada fuera del contexto especifico del autor: se trata de un fine-tune de un modelo base bien conocido y con licencia permisiva (Apache 2.0), lo que facilita su reutilizacion, pero la ausencia de documentacion sobre datos, idioma y condiciones de evaluacion exige validacion propia antes de usarlo en produccion. Es, en esencia, un punto de partida reproducible para experimentos de ASR mas que un modelo listo para despliegue general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), fine-tune de openai/whisper-small |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de openai/whisper-small: un transformer encoder-decoder con atencion estandar, disenado para mapear espectrogramas Mel de audio a secuencias de tokens de texto. Whisper-small cuenta con aproximadamente 242 millones de parametros y esta pensado para transcripcion multilingue y traduccion de voz, aunque el fine-tune publicado no documenta que idiomas cubre realmente.

El entrenamiento se realizo con el Trainer de Hugging Face (Transformers 4.46.3, PyTorch 2.4.0+cu121, Datasets 3.6.0, Tokenizers 0.20.3) durante 12.000 pasos con un batch de 32, learning rate de 2e-5, scheduler lineal con 50 pasos de warmup, semilla 42, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8) y precision mixta nativa (AMP). No se especifica el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de aumentacion o regularizacion adicionales. Tampoco se documenta el uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un fine-tune de ASR.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante la pipeline `automatic-speech-recognition` de Transformers.
- Transcripcion de audio en ventanas de hasta 30 segundos, segun el diseno de Whisper; para audios mas largos se requiere chunking o el uso de `return_timestamps`.
- Hereda del modelo base la posibilidad de traduccion de voz a texto y deteccion de idioma, aunque el fine-tune no documenta si estas capacidades se conservan o se han degradado.
- Integracion con el ecosistema Transformers (`pipeline`, `AutoModelForSpeechSeq2Seq`, `WhisperProcessor`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento explicito; no aplica a un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir grabaciones cortas en texto y su tamano compacto permite ejecutarlo en CPU o GPU modesta, aunque la falta de documentacion sobre idioma obliga a validar el WER en el dominio objetivo antes de usarlo.
- Subtitulado automatizado de contenido audiovisual: con chunking de audio en ventanas de 30 segundos y `return_timestamps` se pueden generar subtitulos sincronizados, siempre que el idioma del contenido coincida con el del fine-tune.
- Prototipado de asistentes de voz: al ser un checkpoint pequeno y con licencia Apache 2.0, sirve como base para experimentar con pipelines de ASR antes de invertir en modelos mayores.
- Investigacion y docencia en ASR: permite reproducir el flujo de fine-tuning de Whisper con hiperparametros documentados (lr 2e-5, 12.000 pasos, batch 32) y comparar el efecto del ajuste sobre un dominio concreto.
- Preprocesado de audio para pipelines de NLP: transcripcion de llamadas o entrevistas como paso previo a analisis de sentimiento, resumen o extraccion de entidades.
- Despliegue en entornos con recursos limitados: con 242 millones de parametros, el modelo es viable en GPUs de gama media o incluso en CPU para cargas por lotes no interactivas, aunque no se han publicado cifras de latencia ni throughput.
- Evaluacion comparativa de fine-tunes de Whisper: util como referencia para medir como afecta el ajuste a un WER de partida en un corpus propio.

## Benchmarks y rendimiento

La model card declara un unico resultado sobre el conjunto de evaluacion del autor:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0.3404 |
| WER | 0.2722 |

El historial de entrenamiento muestra la evolucion del WER a lo largo de los pasos: 3.0318 en el paso 500, 0.3929 en el 2500, 0.2619 en el 3500 y 0.2722 en el 5000 (ultimo registro). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice, etc.) en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB para los pesos (242 M de parametros x 4 bytes), mas overhead de activaciones y del encoder de audio; en la practica, menos de 2-3 GB en la mayoria de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 3060, T4, L4). Para lotes grandes o baja latencia, A10G, L4 o A100 ofrecen margen sobrado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para cargas no interactivas.
- Opciones de despliegue: Transformers (`pipeline`), endpoints de Hugging Face, y potencialmente llama.cpp/Ollama no aplican de forma nativa a Whisper; para serving dedicado se puede usar TGI o un servidor FastAPI propio con Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| abdouaziz/mina | 241,7 M | ventanas de 30 s (Whisper) | Apache 2.0 | Hugging Face | Fine-tune sin dataset documentado; WER 0.2722 en eval propio |
| openai/whisper-small | 241,7 M | ventanas de 30 s | Apache 2.0 | Hugging Face | Modelo base multilingue; referencia obligada para comparar el efecto del fine-tune |
| openai/whisper-base | 74,4 M | ventanas de 30 s | Apache 2.0 | Hugging Face | Alternativa mas ligera, menor precision esperada |
| openai/whisper-medium | 769 M | ventanas de 30 s | Apache 2.0 | Hugging Face | Alternativa de mayor capacidad, mas exigente en VRAM |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card indica explicitamente "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento: no se conoce el corpus, el idioma ni el dominio del fine-tune.
- El WER de 0.2722 sobre el conjunto de evaluacion del autor es alto en terminos absolutos y no es comparable con resultados de benchmarks estandar; puede reflejar un dominio dificil o un corpus pequeno.
- Riesgo de alucinacion y de transcripciones incorrectas, especialmente en audio con ruido, acentos no representados en el entrenamiento o idiomas distintos del ajustado.
- No se documentan sesgos conocidos, pero al desconocerse los datos de entrenamiento no se puede descartar sesgo demografico, linguistico o de dominio.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- El historial de entrenamiento muestra un WER anomalo en las primeras epochs (3.0318 en el paso 500), lo que sugiere inestabilidad inicial o un conjunto de evaluacion muy pequeno.
- No se especifican los idiomas soportados, por lo que no se puede asumir cobertura multilingue aunque el modelo base la tuviera.
- Para audios superiores a 30 segundos es necesario implementar chunking manual o usar las utilidades de Transformers; no hay soporte nativo de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdouaziz/mina
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
