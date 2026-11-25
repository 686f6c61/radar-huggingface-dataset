# mifanbushipeicai/qwen3-omni-talker-sample-voices

## Resumen

`qwen3-omni-talker-sample-voices` es un adaptador LoRA de rango 16 (6,3 M de parámetros, 25 MB) entrenado sobre el módulo Talker y el MTP de Qwen3-Omni-30B-A3B-Instruct. Lo publica el usuario `mifanbushipeicai` y su función es añadir ocho voces de síntesis (cuatro en chino y cuatro en inglés, dos femeninas y dos masculinas por idioma) al modelo base multimodal. No modifica el Thinker ni las capacidades de razonamiento o visión del modelo: solo cambia cómo suena la voz generada.

El adaptador se entrena con la herramienta `talker_tune` sobre etiquetas de habla reproducidas según el informe *Reproducing the Speech Labels of Qwen3-Omni's Talker: Mimi in bf16, and a Last-Frame Pitfall* (arXiv:2611.32286). Las voces provienen de AISHELL-3 (chino) y VCTK 0.92 (inglés), con unos 23,5 minutos de audio por hablante. El resultado se distribuye en formato propio de `talker_tune` (pesos LoRA más filas nuevas de speaker-embedding), no como checkpoint PEFT estándar.

Es relevante porque demuestra que un adaptador pequeño puede fijar voces estables en un modelo omni de 30B con un presupuesto de entrenamiento muy reducido (400 pasos por hablante) y porque aborda un problema documentado de deriva de voz en preguntas habladas cuando solo se entrena una voz por idioma. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre el módulo Talker y MTP de Qwen3-Omni-30B-A3B-Instruct (modelo base omni multimodal) |
| Parametros totales | 6,3 M (adaptador LoRA); modelo base: 30B totales |
| Parametros activos | no disponible para el adaptador; modelo base MoE con 3B activos (A3B) |
| Longitud de contexto | no disponible para el adaptador; depende del modelo base Qwen3-Omni |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | formato `talker_tune` (pesos LoRA + filas de speaker-embedding); exportable a checkpoint completo con el layout original del modelo base |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con 6,3 M de parámetros que se aplica sobre el Talker y el MTP de Qwen3-Omni-30B-A3B-Instruct. El Thinker del modelo base queda intacto, de modo que las capacidades cognitivas (razonamiento, comprensión multimodal) no cambian; solo se altera la síntesis de voz. Cada nuevo speaker id se inicializa a partir de una voz predefinida del mismo género (Chelsie para femenino, Ethan para masculino), lo que estabiliza el entrenamiento.

El entrenamiento usa `talker_tune` sobre etiquetas generadas con la receta del informe arXiv:2611.32286 (Mimi en bf16 y corrección del problema de last-frame). Se limita el audio a 23,5 minutos por hablante (`--limit-min 23.5`), con 400 pasos por hablante (3.200 en total), batch 8, learning rate 1e-4, solo prompts de texto y semilla 0. Los datos de voz provienen de AISHELL-3 (458, 457, 447 y 449 enunciados para los hablantes chinos) y VCTK 0.92 mic1 (462, 452, 441 y 426 enunciados para los ingleses).

## Capacidades

- Síntesis de voz (text-to-speech) con ocho voces nuevas: `ssb0033`, `ssb0435`, `ssb0590`, `ssb0603` (chino) y `p239`, `p236`, `p259`, `p286` (inglés).
- Generación de respuestas habladas a preguntas de chat, tanto si la pregunta se plantea como texto como si se plantea como audio.
- Conservación de la identidad de voz en respuestas a preguntas habladas en inglés, con similitud media de 0,983 (rango 0,981-0,985) en tres semillas de entrenamiento.
- Exportación a checkpoint completo con los nuevos speaker ids registrados en `config.json`, seleccionables mediante `speaker="p239"` en `generate` (transformers) o en la petición de chat (vLLM-Omni).
- Hereda del modelo base las capacidades multimodales y de razonamiento del Thinker, que no se modifican.

## Casos de uso

- Síntesis de voz multi-locutor en aplicaciones de lectura: el adaptador permite alternar entre ocho voces chinas e inglesas con una sola instancia del modelo, útil para audiolibros o sistemas de accesibilidad que requieran cambiar de narrador sin cargar modelos separados.
- Asistentes conversacionales por voz: al mantener la identidad de voz en preguntas habladas (similitud 0,983 en inglés), es adecuado para agentes de atención al cliente que reciben audio del usuario y responden con una voz coherente y estable.
- Evaluación de técnicas de clonación de voz con pocos datos: sirve como referencia reproducible de que 23,5 minutos por hablante y 400 pasos bastan para fijar una voz, lo que facilita experimentos de investigación sobre adaptación de hablantes.
- Generación de contenido localizado: las cuatro voces chinas y cuatro inglesas permiten producir el mismo guion en ambos idiomas con voces nativas, sin recurrir a un TTS externo.
- Integración en pipelines de transformers o vLLM-Omni: el checkpoint exportado se puede desplegar con el layout original del modelo base y seleccionar la voz por petición, lo que encaja en servicios que ya sirven Qwen3-Omni.
- Investigación sobre deriva de voz en modelos omni: el adaptador documenta y corrige el cambio de voz observado con adaptadores de una sola voz por idioma (similitud 0,81 frente a 0,97), por lo que es útil como caso de estudio reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor (semilla 0, una muestra por ítem, idioma propio). Cada hablante lee 20 frases reservadas y responde 20 preguntas de chat, planteadas una vez como texto y otra como voz (respuestas sintetizadas para sus primeros 64 tokens de texto). La similitud es coseno WavLM-SV frente a grabaciones reservadas del hablante; las grabaciones reales entre sí puntúan 0,953-0,970 (leave-one-out). Las tasas de error son CER (Paraformer) para chino y WER (Whisper large-v3-turbo) para inglés.

| Hablante | Lectura: similitud | Lectura: error | Pregunta texto: similitud | Pregunta hablada: similitud | Respuestas: error (texto / hablada) |
|---|---|---|---|---|---|
| `ssb0033` | 0,973 | 1,8 % | 0,986 | 0,987 | 3,8 % / 3,7 % |
| `ssb0435` | 0,946 | 5,7 % | 0,971 | 0,974 | 4,6 % / 3,2 % |
| `ssb0590` | 0,962 | 1,8 % | 0,977 | 0,979 | 3,9 % / 5,0 % |
| `ssb0603` | 0,951 | 3,8 % | 0,971 | 0,972 | 3,0 % / 3,6 % |
| `p239` | 0,955 | 1,0 % | 0,986 | 0,979 | 8,9 % / 8,1 % |
| `p236` | 0,960 | 0,0 % | 0,990 | 0,969 | 5,0 % / 4,6 % |
| `p259` | 0,970 | 0,0 % | 0,992 | 0,993 | 6,9 % / 5,7 % |
| `p286` | 0,953 | 3,9 % | 0,989 | 0,990 | 7,4 % / 7,6 % |

En tres semillas de entrenamiento, las respuestas en inglés a preguntas habladas mantienen la voz con similitud 0,983 (rango 0,981-0,985); para preguntas de texto, 0,989. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador en la información disponible.

## Requisitos de hardware

- El adaptador pesa 25 MB, pero requiere cargar el modelo base Qwen3-Omni-30B-A3B-Instruct completo para inferencia.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; depende de la cuantización y del backend. Para un modelo MoE de 30B con 3B activos, el peso completo en bf16 ronda los 60 GB, por lo que se necesitan GPUs de 80 GB (A100, H100) o configuraciones multi-GPU para precisión completa.
- No cabe en GPUs de consumo como la RTX 4090 (24 GB) en bf16 sin cuantización agresiva; no se dispone de datos de cuantización para este adaptador.
- Opciones de despliegue documentadas: `talker_tune` (síntesis y exportación), transformers (`generate` con `speaker="..."`) y vLLM-Omni 0.30 (mediante checkpoint fusionado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `qwen3-omni-talker-sample-voices` | LoRA TTS sobre Qwen3-Omni-30B-A3B | 6,3 M (adaptador); 30B base | no disponible | zh, en | Apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct (base) | Modelo omni multimodal | 30B totales, 3B activos | no disponible | multilingüe (no detallado) | Apache-2.0 | Hugging Face |
| Adaptadores previos de una voz por idioma (mismo autor) | LoRA TTS | no disponible | no disponible | zh, en | Apache-2.0 | Referenciados en el README |

La comparativa con otros sistemas TTS comerciales o de código abierto no está disponible en la información proporcionada. La diferencia principal frente al modelo base es la incorporación de ocho voces fijas y la corrección de la deriva de voz en preguntas habladas; frente a los adaptadores previos del mismo autor, la mejora es la estabilidad de la voz (0,983 frente a 0,81 en similitud para preguntas habladas en inglés).

## Limitaciones y advertencias

- `ssb0590` habla más despacio que el resto de voces chinas (3,8 caracteres por segundo frente a 4,5-4,8). En respuestas de chat, 2 de 20 (preguntas de texto) y 4 de 20 (preguntas habladas) no se detuvieron dentro del límite de frames (25 frames más 6 por token de texto, unos 33 s); algunas añaden sílabas o repiten frases tras el final del texto. Las otras dos semillas fueron peores (hasta 8 de 20). Las frases leídas no se ven afectadas.
- Las voces predefinidas del modelo base (Ethan, Chelsie, Aiden) también cambian, porque el adaptador modifica pesos compartidos del Talker.
- La evaluación se hizo solo con `talker_tune`. Los checkpoints fusionados con la misma herramienta a partir de un adaptador anterior funcionaron en transformers y vLLM-Omni 0.30, pero no hubo prueba de escucha.
- Riesgo de uso indebido: el mismo método adapta el modelo a una voz nueva con pocos minutos de grabación, por lo que podría imitar a una persona sin su consentimiento. El autor recomienda adaptar solo con consentimiento explícito.
- El adaptador no modifica el Thinker, por lo que no altera el razonamiento ni la comprensión multimodal del modelo base; sus limitaciones en esos aspectos son las del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no documentado específicamente para el adaptador; hereda el del modelo base.
- Restricciones de licencia: Apache-2.0 para el adaptador y el modelo base. Las voces inglesas provienen de VCTK 0.92 (CC-BY 4.0), por lo que debe acreditarse el corpus VCTK al usarlas. Las voces chinas provienen de AISHELL-3 (Apache-2.0).

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mifanbushipeicai/qwen3-omni-talker-sample-voices
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio `talker_tune`: https://github.com/elpsykongloo/qwen3-omni-talker-finetune
- Dataset de verosimilitudes del Talker: https://huggingface.co/datasets/mifanbushipeicai/qwen3-omni-talker-likelihoods
- Colección del proyecto: https://huggingface.co/collections/mifanbushipeicai/qwen3-omni-talker-finetune-6aec41e50ac465e3f0ef9222
- Informe: https://arxiv.org/abs/2611.32286
