# ozonetg/parakeet-0.6b-caller-asr-basic

## Resumen

ozonetg/parakeet-0.6b-caller-asr-basic es un ajuste fino completo de nvidia/parakeet-unified-en-0.6b, el modelo de reconocimiento automático del habla de NVIDIA con encoder FastConformer de 24 capas y decoder RNN-T, 618,3 millones de parámetros. Lo publica el usuario ozonetg bajo la NVIDIA Open Model License y está especializado en transcribir el canal del cliente (caller) de llamadas telefónicas estadounidenses de banda estrecha a 8 kHz. Solo soporta inglés.

Ataca un problema concreto: la telefonía de 8 kHz y el habla conversacional espontánea degradan gravemente los ASR entrenados con audio de banda ancha. Se entrenó con 345,5 horas (504.617 segmentos de 0,3 a 20 s) del canal del cliente en llamadas reales de venta saliente, con transcripciones generadas por máquina (Qwen3-ASR-1.7B) y filtradas por consenso entre sistemas ASR independientes.

Su relevancia es medible: en cinco conjuntos públicos de llamadas telefónicas agregados baja el WER del 14,00% (sistema previo, un modelo de 110M con adaptador de dominio) y del 11,80% (0.6B base sin ajustar) al 9,97%. En llamadas retenidas del mismo dominio llega al 1,96%, frente al 8,68% y el 4,73% de las dos referencias anteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder de 24 capas) con decoder RNN-T; el modelo base es unificado offline + streaming |
| Parámetros totales | 618,3 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como ventana de tokens; entrenado en modo offline (contexto completo) con segmentos de 0,3 a 20 s |
| Tipos de cuantización | no disponible; pesos en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | .nemo (parakeet-0.6b-caller-asr-basic.nemo), bfloat16 |
| Modelo base | nvidia/parakeet-unified-en-0.6b |
| Entrada | audio mono a 16 kHz en coma flotante; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | texto en inglés con puntuación y mayúsculas |
| Decodificación | RNN-T greedy (todos los resultados publicados) |
| Framework | NeMo 3.0 (el modelo base no se construye en NeMo 2.5.x) |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: encoder FastConformer de 24 capas (una variante de Conformer con downsampling convolucional) más un decoder RNN-T. Sobre esa base se aplica un fine-tune completo en modo offline, con pérdida RNN-T, y decodificación greedy. El modelo base es unificado, es decir, soporta inferencia offline y streaming, aunque el ajuste publicado se entrenó y evaluó en modo offline.

Los datos son el canal del cliente de llamadas de venta saliente de EE. UU., 8 kHz mono, procedentes de cinco fuentes internas grabadas entre 2025 y 2026. El split de entrenamiento tiene 504.617 segmentos (345,5 h); un 5% son segmentos sin habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, lo que enseña al modelo a no emitir texto, y cerca de un 1% son saludos de buzón de voz o prompts de IVR capturados en la línea del cliente. Las etiquetas son transcripciones automáticas de Qwen3-ASR-1.7B, sin transcripción humana: los segmentos donde varios ASR independientes coincidían forman el nivel 1 (peso de pérdida 1,0), la coincidencia parcial el nivel 2 (peso 0,7) y el resto se descartó. En cada batch, un 10% de las muestras proviene de Switchboard (inglés telefónico conversacional público con transcripciones humanas) como replay para conservar capacidad conversacional general.

## Capacidades

- Reconocimiento de voz en inglés sobre audio telefónico de banda estrecha (8 kHz remuestreado a 16 kHz), con salida puntuada y en mayúsculas.
- Transcripción del canal del cliente en llamadas de centro de contacto, incluidos solapamientos de ruido de línea y silencios (el modelo tiende a no emitir texto en segmentos no hablados).
- Manejo de segmentos de 0,3 a 20 s, lo que permite trocear llamadas largas en fragmentos manejables.
- Robustez ante prompts de IVR y saludos de buzón de voz presentes en la línea del llamante.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No tiene capacidades de visión, audio-vision, diarización explícita ni traducción.
- Multilingüismo: no disponible (solo inglés estadounidense).

## Casos de uso

- Transcripción de llamadas en centros de contacto: el modelo está ajustado específicamente al canal del cliente en llamadas de venta saliente, por lo que genera transcripciones más limpias que un ASR genérico sobre el mismo audio de 8 kHz.
- Analítica de calidad y cumplimiento: transcribir las llamadas y alimentar motores de búsqueda de palabras clave o detección de frases obligatorias en sectores regulados.
- Generación de resúmenes post-llamada: la salida puntuada y con mayúsculas se puede pasar directamente a un LLM de resumen sin post-procesado de formato.
- Enrutado automático e intención: al transcribir la primera intervención del cliente se puede clasificar la intención y enrutar la llamada a un agente o a un bot.
- Análisis de sentimiento y detección de quejas: sobre el texto transcrito, con la ventaja de que los segmentos no hablados no contaminan la señal.
- Sustitución de un ASR de 110M con adaptador de dominio: el WER agregado baja del 14,00% al 9,97% en cinco conjuntos públicos de llamadas, con lo que se reduce la tasa de corrección manual posterior.
- Procesamiento por lotes de grabaciones almacenadas: el modo offline de contexto completo permite transcribir grandes volúmenes de llamadas históricas en GPU de gama media.
- Asistencia en tiempo real en el puesto del agente: aunque el ajuste publicado se entrena en modo offline, el modelo base admite streaming, lo que abre la puerta a un flujo con latencia baja previa validación propia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (métricas no verificadas de forma independiente).

| Conjunto de evaluación | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 1,86 |
| LibriSpeech test-other (8 kHz) | 4,18 |
| LibriSpeech test-clean (16 kHz) | 1,77 |
| LibriSpeech test-other (16 kHz) | 3,70 |
| CallHome English (test) | 10,69 |
| CallFriend English (dev) | 16,23 |
| HarperValley Bank (canal del llamante) | 4,07 |
| Let's Go (referencias reescritas, eval) | 18,02 |
| AppTek call-center dialogues, clientes de EE. UU. (test) | 7,35 |
| Switchboard (subconjunto de 3.000 emisiones) | 7,58 |

Comparaciones declaradas en la model card:

| Escenario | parakeet-0.6b-caller-asr-basic | Sistema previo (110M con adaptador) | nvidia/parakeet-unified-en-0.6b (base) |
|---|---|---|---|
| Cinco conjuntos públicos de llamadas (agregado) | 9,97% | 14,00% | 11,80% |
| Llamadas retenidas dentro del dominio | 1,96% | 8,68% | 4,73% |
| LibriSpeech test-other a 8 kHz | 4,18% | no disponible | 3,56% |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 1,2 GB (el repositorio completo ocupa 1,2 GB).
- VRAM estimada para inferencia: del orden de 2 a 3 GB contando pesos y activaciones; no se publican mediciones exactas de pico.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en GPUs de datacenter (A100, H100) donde el cuello de botella será el pipeline de audio, no la memoria.
- Despliegue mediante NeMo 3.0, que es la versión de framework requerida (el modelo base no se construye en NeMo 2.5.x).
- No se documentan exportaciones a GGUF, ONNX ni integración con llama.cpp, Ollama o TGI; vLLM no está indicado para este tipo de modelo RNN-T de NeMo en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER agregado en llamadas | WER en dominio retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ozonetg/parakeet-0.6b-caller-asr-basic | 618,3 M | segmentos de 0,3 a 20 s, 8 kHz remuestreado a 16 kHz | 9,97% | 1,96% | NVIDIA Open Model License | HuggingFace, formato .nemo |
| nvidia/parakeet-unified-en-0.6b (base) | 618 M | offline + streaming, 16 kHz | 11,80% | 4,73% | NVIDIA Open Model License | HuggingFace |
| Variante 110m basic de la misma familia (sistema previo) | ~110 M | 8 kHz telefónico | 14,00% | 8,68% | no disponible | no disponible |

No se dispone de datos comparativos frente a alternativas de otros proveedores (por ejemplo Whisper o Conformer de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés estadounidense; no hay soporte multilingüe ni traducción.
- Especializado en el canal del cliente de llamadas de venta saliente: el rendimiento fuera de ese dominio (otros idiomas, micrófonos de banda ancha, reuniones, audio de campo) no está medido y puede degradarse.
- Las etiquetas de entrenamiento son transcripciones automáticas de Qwen3-ASR-1.7B, sin verificación humana; los errores sistemáticos del transcriptor de referencia pueden haberse transferido al modelo ajustado.
- Pérdida de generalización en banda ancha: en LibriSpeech test-other a 8 kHz el WER empeora 0,62 puntos porcentuales respecto al modelo base (4,18% frente a 3,56%).
- WER elevado en algunos conjuntos conversacionales espontáneos: 16,23% en CallFriend dev y 18,02% en Let's Go.
- Riesgo de alucinación bajo ruido extremo o audio no verbal, aunque los segmentos sin habla se cubrieron explícitamente con objetivo vacío en el 5% de los datos de entrenamiento.
- Todas las métricas del model-index están marcadas como no verificadas (`verified: false`) y el repositorio no tiene descargas ni valoraciones, por lo que no hay validación independiente.
- Licencia NVIDIA Open Model License: permite uso comercial sujeto a los términos del acuerdo, que incluyen obligaciones de atribución y condiciones de redistribución; conviene revisarlos antes de desplegar en producción.
- Requiere NeMo 3.0; el modelo base no se construye en NeMo 2.5.x, lo que limita entornos con versiones antiguas del framework.
- No se documentan cuantizaciones (GGUF, int8, int4), lo que dificulta el despliegue en entornos sin GPU o con GPUs de muy baja memoria.
- La entrada debe ser audio mono a 16 kHz; es necesario remuestrear correctamente el audio telefónico de 8 kHz para no degradar el WER.
- Las fechas de creación y actualización del repositorio (2026-10-09) son posteriores a las de los datos de entrenamiento declarados (2025-2026); conviene verificar la vigencia de la versión publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-basic
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Framework NeMo: https://github.com/NVIDIA/NeMo
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo (solo resultados genéricos de servicios de Google), por lo que no hay papers, blogs, repos ni demos adicionales que citar.
