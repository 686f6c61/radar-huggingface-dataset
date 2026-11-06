# danilpoleshchuk/GigaAM-v3

## Resumen

GigaAM-v3 es un modelo fundacional de reconocimiento automático del habla (ASR) basado en arquitectura Conformer, desarrollado por el equipo de Sber (ai-sage) y publicado en el repositorio `salute-developers/GigaAM`. Es la tercera generación de la familia GigaAM y está especializado en ruso, aunque también declara soporte para inglés. El modelo se preentrena con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa y se distribuye en cinco variantes: `ssl` (encoder auto-supervisado), `ctc`, `rnnt`, `e2e_ctc` y `e2e_rnnt` (estas dos últimas con puntuación y normalización de texto integradas).

Con 220-240 millones de parámetros, GigaAM-v3 se posiciona como una alternativa eficiente a Whisper-large-v3 para ruso: según la model card, reduce el WER medio de 25,1 % (Whisper) a 8,4 % (variante `rnnt`) en un conjunto de dominios diversos, incluyendo habla natural, conversaciones de call center, habla con música de fondo y habla con características atípicas. La incorporación de nuevos datasets internos mejora un 30 % en esos dominios manteniendo la calidad en benchmarks públicos.

El modelo es relevante ahora porque combina un tamaño contenido (0,4 GB en el repo), licencia MIT y un rendimiento en ruso muy superior al de modelos multilingües genéricos, lo que lo hace atractivo para despliegues en producción de transcripción en ruso con requisitos de hardware modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeceras CTC y RNN-T; preentrenamiento HuBERT-CTC |
| Parametros totales | 220-240 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (principal), inglés |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,4 GB; carga vía `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

GigaAM-v3 emplea un encoder Conformer, una arquitectura que combina convoluciones y auto-atención para capturar dependencias locales y globales en secuencias de audio. El preentrenamiento sigue el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa, lo que proporciona una representación robusta del habla antes del ajuste fino supervisado. A partir de ese encoder se derivan las variantes `ctc` y `rnnt`, que añaden decodificadores CTC y RNN-T respectivamente, y las variantes `e2e_ctc` y `e2e_rnnt`, que integran puntuación y normalización de texto de extremo a extremo.

El entrenamiento incorpora nuevos datasets internos no públicos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas (trastornos del habla). Según la model card, estas incorporaciones mejoran un 30 % de media en esos dominios sin degradar los benchmarks públicos. No se detalla en la información disponible si se emplearon técnicas de RLHF o DPO (poco habituales en ASR) ni la composición exacta del dataset más allá de las categorías citadas.

## Capacidades

- Transcripción de voz a texto en ruso con estado del arte en múltiples dominios (habla natural, call center, far-field, habla con música, habla atípica).
- Reconocimiento con dos paradigmas de decodificación: CTC (más rápido, alineamiento frame a frame) y RNN-T (mejor precisión, decodificación autorregresiva).
- Variantes end-to-end (`e2e_ctc`, `e2e_rnnt`) que generan texto puntuado y normalizado directamente, sin postprocesado externo.
- Soporte declarado de inglés, aunque el foco y los benchmarks publicados son en ruso.
- Extracción de representaciones auto-supervisadas mediante la variante `ssl`, reutilizable como backbone para otras tareas de habla (la familia GigaAM se usa también para reconocimiento de emociones).
- API de alto nivel: `model.transcribe("example.wav")` devuelve la transcripción directamente.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en ruso: la variante `e2e_rnnt` produce texto puntuado y normalizado directamente, lo que elimina la necesidad de un modelo de puntuación posterior en pipelines de actas automáticas.
- Atención al cliente y análisis de call centers: el modelo está entrenado específicamente con conversaciones de call center y logra un WER de 9,5 % (RNNT) frente al 23,9 % de Whisper, lo que lo hace adecuado para transcribir y auditar llamadas a escala.
- Subtitulado y accesibilidad: la variante `ctc` ofrece decodificación más rápida y paralelizable, útil para generar subtítulos en tiempo casi real en contenido en ruso.
- Transcripción de audio en entornos ruidosos o con música de fondo: el entrenamiento con habla musical y natural reduce el WER a 6,9 % (RNNT) frente al 13,6 % de Whisper en habla natural.
- Herramientas de accesibilidad para habla atípica: el modelo reduce el WER en habla con trastornos de 59,3 % (Whisper) a 19,2 % (RNNT), lo que permite aplicaciones de dictado para personas con dificultades del habla.
- Investigación en habla auto-supervisada: la variante `ssl` sirve como backbone para fine-tuning en tareas downstream (diarización, emoción, keyword spotting) gracias a su encoder preentrenado con HuBERT-CTC.
- Preprocesado de datos para LLM: transcripción masiva de corpus de audio en ruso para alimentar pipelines de datos de entrenamiento o RAG sobre contenido hablado.

## Benchmarks y rendimiento

Resultados de WER (%) publicados en la model card:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

En la comparación end-to-end de las variantes `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3, usando Gemini 2.5 Pro como juez LLM, los modelos GigaAM-v3 ganan con un margen medio de 70:30. No se publican resultados de MMLU, HumanEval ni GSM8K por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 220-240 M de parámetros, la inferencia en FP32 requiere aproximadamente 1 GB de VRAM; en FP16, alrededor de 0,5 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); para procesamiento por lotes a gran escala, A100 o H100 mejoran el throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: carga nativa vía `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True`); el ecosistema GigaAM del repositorio de GitHub incluye scripts de inferencia. No se documenta soporte explícito de vLLM, llama.cpp u Ollama (son motores orientados a LLM, no a ASR).
- Versiones recomendadas: `torch==2.8.0`, `torchaudio==2.8.0`, `transformers==4.57.1`, `pyannote-audio==4.0.0`, `torchcodec==0.7.0`, además de `hydra-core`, `omegaconf` y `sentencepiece`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (ruso, tabla de la model card) | Licencia | Idiomas |
|---|---|---|---|---|---|
| GigaAM-v3 (RNNT) | 220-240 M | no disponible | 8,4 | MIT | ru, en |
| Whisper-large-v3 | 1.550 M | 30 s de audio | 25,1 | MIT | multilingüe (99 idiomas) |
| T-One + LM | no disponible | no disponible | 19,4 | no disponible | ru |
| GigaAM v1/v2 | 220-600 M | no disponible | no disponible en esta ficha | MIT (repo salute-developers) | ru |

GigaAM-v3 ofrece un WER medio tres veces menor que Whisper-large-v3 en ruso con una fracción de los parámetros, a costa de un soporte multilingüe mucho más limitado.

## Limitaciones y advertencias

- El modelo está optimizado para ruso; el soporte de inglés está declarado pero no se respaldan con benchmarks en la información disponible.
- El rendimiento en habla con características atípicas sigue siendo el punto más débil (WER 19,2-20,6 %), aunque muy superior a Whisper.
- Riesgo de alucinación y errores en audio con ruido extremo, acentos no representados en el corpus de entrenamiento o solapamiento de hablantes; no se documentan métricas de robustez fuera de los conjuntos citados.
- No se dispone de información sobre sesgos demográficos, dialectales ni de género en el corpus de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero conviene revisar las dependencias (`trust_remote_code=True` implica ejecutar código del repositorio).
- Las variantes `e2e_*` dependen de la calidad de su módulo de puntuación y normalización; no se detalla su comportamiento en dominios muy alejados del entrenamiento.
- El repositorio de Hugging Face consultado (`danilpoleshchuk/GigaAM-v3`) es un espejo no oficial con 0 descargas; el repositorio de referencia es `ai-sage/GigaAM-v3`.
- No se publican datos de latencia, throughput ni consumo de memoria para producción.

## Enlaces

- Repositorio Hugging Face consultado: https://huggingface.co/danilpoleshchuk/GigaAM-v3
- Repositorio Hugging Face oficial: https://huggingface.co/ai-sage/GigaAM-v3
- GitHub del proyecto: https://github.com/salute-developers/GigaAM
- Métricas detalladas: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Cuaderno de ejemplo: https://github.com/salute-developers/GigaAM/blob/main/colab_example.ipynb
- Paper (InterSpeech 2025): https://arxiv.org/abs/2506.01192
