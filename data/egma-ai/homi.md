# egma-ai/homi

## Resumen

homi es un modelo de decisión abierto para audio desarrollado por egma-ai. Se trata de un adaptador sobre Qwen3-Omni-30B-A3B-Instruct (con los pesos base congelados) que responde preguntas tipadas sobre un clip de audio y devuelve una probabilidad por cada opción, en lugar de generar texto libre. Está inspirado en los "decision models" tipo Jev, Clef y pplx-decider, pero a diferencia de estos, que solo aceptan texto, homi procesa el audio de forma nativa, lo que permite responder preguntas paralingüísticas y fonológicas (emoción, prosodia, ritmo, tono) que no se pueden deducir de una transcripción.

Su relevancia radica en el bajo coste y la calibración de confianza: supera a Gemini Flash en el benchmark VocalGrad y es comparable en MMSU, con un coste por consulta órdenes de magnitud inferior. Cada pregunta se responde en una única pasada hacia adelante por lotes (unos 75 ms para tres preguntas en un H200), lo que lo hace idóneo para monitorizar y evaluar audio a gran escala. El repositorio solo contiene el adaptador LoRA (17M de parámetros), la cabeza de decisión y el código; los pesos base se descargan del repositorio de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-Omni-30B-A3B-Instruct (MoE) + cabeza de decisión + LoRA |
| Parámetros totales | ~30B (base); 17M de parámetros entrenables LoRA |
| Parametros activos | ~3B (A3B en el modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia en bf16) |
| Idiomas soportados | inglés (documentación y evaluación); idiomas de audio no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, ~0,1 GB el repositorio) |

## Arquitectura y entrenamiento

homi parte de Qwen3-Omni-30B-A3B-Instruct, un modelo MoE omni-modal con unos 30B de parámetros totales y 3B activos, con los pesos congelados. Sobre él se añaden tres componentes: una cabeza de decisión que sustituye a la cabeza del modelo de lenguaje, un adaptador LoRA de 17M de parámetros, y un único parámetro de temperatura de calibración ajustado durante el entrenamiento.

El funcionamiento es el siguiente: el prompt es el audio seguido de la pregunta con opciones codificadas por letras (A, B, C, ...). La cabeza de decisión lee el estado oculto en la última posición del prompt y produce una puntuación por cada código de respuesta; los códigos que exceden las opciones de la pregunta se enmascaran y un softmax con la temperatura ajustada produce las probabilidades finales. Un detalle técnico notable es que la cabeza de decisión se inicializa con las filas de salida del propio modelo base para los tokens de código de respuesta. El modelo soporta tres tipos de pregunta: `noul` (sí/no, devuelve P(sí)), `choice` (2 a 255 opciones, devuelve una probabilidad por opción) y `score` (2 a 10 niveles ordenados, devuelve probabilidades y el nivel esperado). No se han publicado detalles sobre el tamaño del conjunto de entrenamiento ni el número de tokens.

## Capacidades

- Respuesta de preguntas binarias (`noul`) sobre audio con probabilidad calibrada, por ejemplo "¿El hablante suena enfadado?".
- Clasificación de audio entre 2 y 255 opciones (`choice`) con distribución de probabilidad completa, no solo la etiqueta ganadora.
- Puntuación ordinal (`score`) sobre 2 a 10 niveles ordenados, con probabilidad por nivel y nivel esperado (por ejemplo, velocidad del habla: lento / normal / rápido).
- Comprensión paralingüística y fonológica nativa del audio: emoción, prosodia, tono, velocidad, volumen.
- Procesamiento de contexto textual adicional junto al audio mediante el parámetro `text`.
- Opciones con descripciones enriquecidas (por ejemplo, `"low": "below 60 dB"`).
- Ejecución por lotes: todas las preguntas sobre un clip se resuelven en una única pasada hacia adelante por lotes.
- Calibración de confianza: la confianza informada se corresponde razonablemente con la precisión real (ECE de 0,076 en MMSU).
- No genera texto libre ni soporta tool calling: es exclusivamente un modelo de decisión/clasificación.

## Casos de uso

- Moderación y detección de tono en call centers: clasificar miles de grabaciones de llamadas por emoción del agente o cliente (enfado, tristeza, neutralidad) a un coste de 0,28 $ por 10.000 preguntas en MMSU, muy por debajo de APIs comerciales.
- Análisis de prosodia en producción de voz sintética: evaluar si el pitch, la velocidad o el volumen suben o bajan dentro de un clip (tarea VocalGrad, 73,9 % de precisión) para control de calidad de TTS.
- Detección de estrés o fatiga en hablantes: preguntas `score` sobre niveles ordenados (por ejemplo, "¿qué tan estresada suena esta persona?") con nivel esperado y probabilidades por nivel.
- Monitorización de contenido de audio a gran escala: filtrado automático de clips con tono agresivo o hostil en plataformas de contenido generado por usuarios, aprovechando los 75 ms por lote de tres preguntas.
- Evaluación de datasets de audio: anotación automática y barata de emociones o características prosódicas en corpora como RAVDESS, con probabilidades que permiten filtrar por confianza.
- Investigación en paralingüística: el modelo es open source (Apache 2.0) y permite reproducir experimentos de comprensión de audio sin depender de APIs cerradas, con pesos, código y datos de entrenamiento disponibles.
- Enrutado de llamadas basado en estado emocional: usar P(sí) de preguntas `noul` para escalar a un agente humano cuando la probabilidad de enfado supera un umbral, con confianza calibrada para umbrales fiables.

## Benchmarks y rendimiento

Resultados publicados por el autor (mismo audio, pregunta y opciones para todos los modelos; sin respuesta cuenta como error).

**VocalGrad** (7.200 preguntas: ¿sube o baja pitch, velocidad o volumen dentro del clip? Azar: 50 %):

| Modelo | VocalGrad | Speed | Pitch | Volume | $ por 10k preguntas |
|---|---|---|---|---|---|
| homi | 73,9 | 74 | 61 | 87 | 0,12 |
| Gemini 3.8 Flash | 63,0 | 78 | 56 | 55 | 12,10 |
| Qwen3-Omni-30B-A3B | 50,3 | 50 | 50 | 50 | 0,11 |
| Gemini 3.5 Flash-Lite | 50,9 | 51 | 51 | 50 | 1,30 |
| OpenAI gpt-audio | 33,8 | 32 | 35 | 34 | 37,03 |

**MMSU** (4.981 preguntas, 47 tareas):

| Modelo | MMSU | Perception | Reasoning | $ por 10k preguntas |
|---|---|---|---|---|
| Gemini 3.8 Flash | 85,7 | 82,4 | 89,2 | 14,80 |
| homi | 83,1 | 80,4 | 86,0 | 0,28 |
| Qwen3-Omni-30B-A3B | 72,2 | 60,5 | 84,5 | 0,19 |
| Gemini 3.5 Flash-Lite | 67,4 | 55,1 | 80,3 | 2,07 |
| OpenAI gpt-audio | 60,3 | 46,5 | 74,9 | 41,69 |

**Calibración** ("seguro" = confianza ≥ 0,9):

| Modelo | VocalGrad ECE | VocalGrad Brier | VocalGrad: precisión si seguro (proporción segura) | MMSU ECE | MMSU Brier | MMSU: precisión si seguro (proporción segura) |
|---|---|---|---|---|---|---|
| homi | 0,157 | 0,399 | 82,8 % (67 %) | 0,076 | 0,259 | 91,7 % (73 %) |
| Gemini 3.8 Flash | 0,237 | 0,570 | 70,2 % (37 %) | 0,052 | 0,238 | 93,7 % (63 %) |
| Qwen3-Omni-30B-A3B | 0,337 | 0,740 | 52,5 % (38 %) | 0,182 | 0,439 | 84,4 % (73 %) |

Nota: gpt-audio no respondió al 34 % de VocalGrad y al 13 % de MMSU; en las preguntas respondidas obtiene 51,2 y 69,5 respectivamente.

## Requisitos de hardware

- Una GPU con unos 70 GB libres de VRAM para inferencia en bf16 (modelo base MoE de 30B con 3B activos más el adaptador).
- GPU recomendada: NVIDIA H200 (usada en las evaluaciones del autor); en principio también válidas H100 o A100 de 80 GB.
- No cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB es insuficiente en bf16); no se han publicado cuantizaciones que reduzcan el requisito.
- Despliegue mediante el script `predict.py` incluido en el repositorio (transformers + peft). Importante: el adaptador ataca al "thinker" de Qwen3-Omni, por lo que `AutoPeftModel` no lo encuentra; hay que usar el cargador proporcionado.
- No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: unos 75 ms para tres preguntas sobre un clip corto en un H200, con todas las preguntas de un clip resueltas en una única pasada por lotes.
- Versiones probadas: Python 3.12, torch 2.14.1, transformers 5.18.0, peft 0.21.2.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Parámetros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| homi (egma-ai) | Decision model de audio | Audio + texto | ~30B base (3B activos) + 17M LoRA | Probabilidades tipadas | Apache 2.0 | Open source (pesos base de Qwen) |
| Jev (typesafe.ai) | Decision model | Solo texto | no disponible | Probabilidades tipadas | no disponible | Cerrado/blog |
| Clef (Cloudflare) | Decision model | Solo texto | no disponible | Probabilidades tipadas | no disponible | Cerrado/blog |
| pplx-decider-v1.1-27b (Perplexity) | Decision model | Solo texto | 27B | Probabilidades tipadas | no disponible | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct | Modelo omni-modal generativo | Audio, texto, imagen, vídeo | 30B (3B activos) | Texto libre | Apache 2.0 | Open source |

La diferencia clave es que homi es el único de esta lista que acepta audio de forma nativa como modelo de decisión; los alternativos solo comparan opciones textuales.

## Limitaciones y advertencias

- Solo responde preguntas tipadas con opciones predefinidas; no genera texto libre, no conversa y no soporta tool calling.
- Requiere unos 70 GB de VRAM en bf16, lo que lo excluye de hardware de consumo y eleva el coste de despliegue propio frente a una API, aunque el coste marginal por pregunta sea muy bajo.
- La calibración no es perfecta: ECE de 0,157 en VocalGrad indica desviación apreciable entre confianza y precisión en tareas de percepción fina (en MMSU es mejor, 0,076).
- La evaluación publicada procede del propio autor del modelo; no hay verificación independiente de los benchmarks.
- Documentación y evaluación en inglés; el rendimiento sobre audio en otros idiomas no está documentado.
- Al ser un adaptador LoRA que requiere el cargador específico del repositorio, la integración en stacks de inferencia estándar (vLLM, etc.) no es directa.
- Proyecto muy reciente y con adopción mínima (55 descargas y 4 likes en Hugging Face en el momento de la ficha), con menor madurez comunitaria que modelos comparables.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero los pesos base de Qwen deben descargarse aparte y respetan la misma licencia.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/egma-ai/homi
- Repositorio de código, evaluación y generadores de datos de entrenamiento: https://github.com/egma-ai/homi
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Blog sobre Jev y system-one models: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Blog de Cloudflare sobre Clef: https://blog.cloudflare.com/clef-decision-models/
- pplx-decider: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Benchmark VocalGrad: https://github.com/ynklab/vocalgrad
- Benchmark MMSU: https://github.com/dingdongwang/MMSU
- Paper LoRA (arXiv 2106.09685): https://arxiv.org/abs/2106.09685
- Paper RAVDESS (dataset usado en ejemplos): https://zenodo.org/records/1188976
