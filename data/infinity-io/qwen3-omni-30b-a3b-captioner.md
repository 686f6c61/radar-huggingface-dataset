# Infinity-io/Qwen3-Omni-30B-A3B-Captioner

## Resumen

Qwen3-Omni-30B-A3B-Captioner es un modelo multimodal especializado en la generacion de descripciones detalladas de audio (audio captioning). Lo desarrolla Infinity-io como fine-tuning del modelo base Qwen3-Omni-30B-A3B-Instruct, y resuelve un problema concreto: la ausencia de un modelo de proposito general para el etiquetado y descripcion fina de contenido audio. Su funcion es tomar una entrada de audio y producir una descripcion textual exhaustiva sin necesidad de prompts adicionales.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con aproximadamente 31.700 millones de parametros totales, de los cuales se activan del orden de 3.000 millones por token (de ahi el sufijo A3B). Esta basado en el componente "thinker" de Qwen3-Omni, que procesa audio y emite texto. Es relevante porque aborda tareas de analisis de audio (habla, sonido ambiental, musica y efectos de cine) con un enfoque de baja alucinacion y sin ingenieria de prompts.

Conviene subrayar su caracter restringido: es un modelo de un solo turno, acepta exclusivamente una entrada de audio por inferencia, no admite prompts de texto y solo produce texto. La longitud de audio recomendada no supera los 30 segundos, ya que clips mas largos degradan la percepcion de detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen3-Omni, componente thinker), tipo `qwen3_omni_moe` |
| Parametros totales | 31.719.205.488 (~31,7 mil millones) |
| Parametros activos | ~3 mil millones (sufijo A3B); cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se recomienda bfloat16/float16 con FlashAttention 2) |
| Idiomas soportados | ingles (segun la model card); el modelo base declara capacidades multilingues en habla, pero la ficha del fine-tuning solo lista `en` |
| Licencia | apache-2.0 (el campo `license` del repo figura como `other` con `license_name: apache-2.0`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 63,4 GB |
| Tipo de entrada/salida | audio a texto (un solo turno, una entrada de audio, sin prompts de texto) |
| Duracion de audio recomendada | <= 30 segundos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Omni-30B-A3B-Instruct, un modelo multimodal "any-to-any" con arquitectura Mixture-of-Experts. El fine-tuning conserva unicamente el componente thinker, encargado de procesar la entrada de audio y generar la salida de texto; las demas ramas del modelo base (por ejemplo, generacion de audio) no forman parte de esta variante segun la model card. La naturaleza MoE implica que, pese a los ~31,7 mil millones de parametros totales, solo una fraccion (~3 mil millones) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano.

El entrenamiento consistio en un ajuste fino supervisado sobre el modelo base orientado a la descripcion de audio, con el objetivo declarado de producir subtitulos detallados y de baja alucinacion en escenarios de audio complejos y diversos. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura MoE y del diseno de un solo turno sin prompts.

## Capacidades

- Descripcion automatica y detallada de audio sin necesidad de prompts de texto.
- Analisis de habla: identificacion de multiples emociones del hablante, expresiones multilingues e intenciones estratificadas.
- Percepcion de contexto cultural e informacion implicita en el contenido hablado.
- Reconocimiento y descripcion de sonidos no verbales: sonidos ambientales, atmosferas y capas de audio del mundo real.
- Analisis de musica y de efectos de sonido cinematograficos.
- Manejo de entornos de audio mixtos con multiples fuentes.
- Salida exclusivamente textual; no genera audio.
- Modelo de un solo turno: no mantiene conversacion multi-turno ni acepta instrucciones de texto.

## Casos de uso

- Accesibilidad audiovisual: generar descripciones textuales de clips de audio (hasta ~30 segundos) para personas con discapacidad auditiva, aprovechando la capacidad de describir habla, sonido ambiental y musica de forma conjunta.
- Etiquetado y enriquecimiento de archivos de audio: producir metadatos descriptivos para bibliotecas de efectos de sonido o archivos musicales, utiles en pipelines de catalogacion automatica.
- Moderacion y analisis de contenido en plataformas de audio: describir el contenido de fragmentos cortos para clasificacion o revision, con el enfoque de baja alucinacion como ventaja.
- Subtitulacion descriptiva para cine y medios: analizar efectos de sonido y atmosferas de escenas cortas para complementar subtitulos convencionales.
- Investigacion en audio y linguistica: obtener descripciones estandarizadas de muestras de habla con emociones e intenciones multiples, sin ingenieria de prompts.
- Generacion de datos de entrenamiento: usar las descripciones como etiquetas de alta calidad para entrenar o evaluar otros modelos de audio, dado el enfasis en baja alucinacion.
- Analisis de llamadas o grabaciones breves: describir tono emocional y contenido implicito de fragmentos de habla en tareas de calidad o analitica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir de los ~31,7 mil millones de parametros y un repositorio de 63,4 GB, la inferencia en bfloat16/float16 requiere del orden de 60 GB o mas de memoria, sin contar el procesador de audio y las activaciones.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos, se orienta a GPU de centro de datos (A100 80 GB, H100) o a configuraciones multi-GPU.
- GPU de consumo: no cabe en GPU de consumo tipicas (RTX 4090 de 24 GB) en precision completa; requeriria cuantizacion, para la que no se documentan formatos oficiales.
- Opciones de despliegue: Hugging Face Transformers (instalacion desde el codigo fuente de `transformers`, con `qwen-omni-utils` y `ffmpeg`) y vLLM. La model card menciona ambos; no se documenta soporte explicito para llama.cpp u Ollama.
- Aceleracion: se recomienda FlashAttention 2 (incluido por defecto en vLLM) para reducir el uso de memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada/Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Captioner | ~31,7 B (MoE, ~3 B activos) | no disponible | audio a texto, un turno | apache-2.0 | Especializado en captioning de audio, sin prompts |
| Qwen3-Omni-30B-A3B-Instruct (base) | ~31,7 B (MoE) | no disponible | multimodal any-to-any | apache-2.0 | Modelo general del que deriva; acepta prompts y multiples modalidades |
| Alternativas especializadas en captioning de audio | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de un solo turno: no soporta conversacion multi-turno ni memoria entre peticiones.
- No acepta prompts de texto: la unica entrada es audio; no se puede guiar la descripcion con instrucciones.
- Una sola entrada de audio por inferencia.
- La calidad de detalle disminuye con audios largos; se recomienda no superar los 30 segundos.
- Solo salida de texto: no genera audio ni otras modalidades.
- Idioma: la ficha declara soporte de ingles; el comportamiento en otros idiomas no esta garantizado pese a las capacidades multilingues del modelo base.
- Riesgo de alucinacion: aunque el modelo se presenta con baja alucinacion, no se aportan metricas que lo cuantifiquen; conviene validar en produccion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia: el repositorio figura como `license: other` con `license_name: apache-2.0`; conviene verificar los terminos exactos antes de un uso comercial.
- Requisitos de entorno: la model card exige instalar `transformers` desde el codigo fuente y `qwen-omni-utils`, ademas de `ffmpeg`, lo que anade complejidad de despliegue.
- No se han publicado benchmarks ni estimaciones de latencia/throughput.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/Qwen3-Omni-30B-A3B-Captioner
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Cookbook: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/omni_captioner.ipynb
- Demo en Hugging Face: https://huggingface.co/spaces/Qwen/Qwen3-Omni-Captioner-Demo
- Demo en ModelScope: https://modelscope.cn/studios/Qwen/Qwen3-Omni-Captioner-Demo
- Repositorio Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni
- Chat Qwen: https://chat.qwen.ai/
- FlashAttention: https://github.com/Dao-AILab/flash-attention
