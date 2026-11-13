# addyo07/nemotron-3.5-0.6b-hinglish

## Resumen

Nemotron-3.5 0.6B Streaming Hinglish (Candidate v2) es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario addyo07, un fine-tune del Nemotron-3.5 0.6B Cache-Aware Streaming RNN-T de NVIDIA adaptado a conversaciones en hindi, inglés y habla code-switched hinglish en entornos acústicamente ruidosos. Emplea una arquitectura FastConformer con decodificador RNN-T y atención cache-aware, lo que permite inferencia en streaming con latencia controlada sobre audio continuo.

El modelo se distribuye en dos formatos desacoplados: un bundle ONNX cuantizado a INT8 pensado para producción sobre CPU mediante sherpa-onnx (el motor de Vox), y un checkpoint NeMo completo de 2,4 GB para reentrenamiento o exportación. Con 0,6 mil millones de parámetros, está diseñado para desplegarse en infraestructura modesta sin GPU dedicada, manteniendo un factor de tiempo real (RTF) medio de 0,46 sobre CPU x86_64 de 32 núcleos.

Su relevancia radica en el nicho: el hinglish conversacional ruidoso es un caso poco cubierto por los ASR multilingües genéricos, y este modelo reporta mejoras estadísticamente significativas frente a su baseline en las splits de inglés conversacional ruidoso y hinglish. No obstante, el propio autor documenta que la auditoría QA interna del candidato concluyó con veredicto de rechazo para despliegue por defecto, al incumplir su SLA mecánico de cero regresiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con decodificador RNN-T (streaming) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming; no aplica ventana de texto) |
| Tipos de cuantizacion | INT8 (bundle ONNX de produccion); checkpoint NeMo sin cuantizar |
| Idiomas soportados | hindi (hi), ingles (en), hinglish code-switched |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8, streaming) y checkpoint NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo parte del Nemotron-3.5 0.6B Cache-Aware Streaming RNN-T de NVIDIA, un encoder FastConformer con mecanismo de atención cache-aware que permite procesar audio de forma incremental manteniendo estado entre chunks, condición necesaria para ASR en streaming de baja latencia. El decodificador es un RNN-T, adecuado para alineamiento monotónico y emisión de tokens sin esperar al final del enunciado.

El fine-tune se orienta a conversación en hindi, inglés y code-switching hinglish bajo ruido acústico. La model card no detalla el volumen de datos de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o adaptación supervisada adicionales; esa información figura como no disponible. Sí se documenta el corpus de evaluación, el Golden v1 Evaluation Corpus (addyo07/noisy-hinglish-asr), con 3.556 clips y 5,994 horas repartidas en 11 splits, y se certifica ausencia de solapamiento entre clips de entrenamiento y de evaluación (cero fuga de decontaminación). El checkpoint NeMo se declara compatible con NeMo 3.0.0.

## Capacidades

- Reconocimiento de voz en streaming sobre audio continuo, con atención cache-aware y emisión incremental de transcripciones.
- Transcripción de hindi, inglés y habla code-switched hinglish dentro de la misma utterance.
- Robustez a ruido acústico conversacional: el fine-tune se evalúa específicamente en splits ruidosos de hinglish e inglés.
- Rechazo de no-habla: 0,00 % de falsos disparos (FTR) y 100 % de rechazo sobre negativos de ruido puro (DNS/ESC-50).
- Inferencia en CPU mediante sherpa-onnx con cuantización INT8, sin requerir GPU.
- Exportación y reentrenamiento: el checkpoint .nemo permite fine-tune adicional, adaptación de dominio y reexportación a otros formatos.
- No incluye capacidades de texto generativo, tool calling, agentes ni visión; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de atención al cliente en hinglish: el modelo está entrenado para conversación code-switched y puede transcribir llamadas o chats de voz donde el usuario alterna hindi e inglés, un escenario frecuente en soporte de empresas indias.
- Subtitulado en streaming de reuniones y videollamadas: la arquitectura cache-aware y el RTF de 0,46 sobre CPU permiten generar subtítulos en tiempo real sin GPU dedicada.
- Despliegue en edge o servidores sin GPU: el bundle ONNX INT8 con sherpa-onnx está pensado para CPU, lo que abarata el coste por hora de audio frente a soluciones que exigen aceleradores.
- Preprocesado de datasets de voz: transcripción masiva de audio conversacional ruidoso para construir corpus etiquetados o para análisis de calidad.
- Filtrado de voz y detección de actividad: el 100 % de rechazo sobre negativos de ruido puro lo hace útil como etapa previa que descarte segmentos no hablados antes de un ASR más costoso.
- Base para adaptación de dominio: el checkpoint NeMo permite fine-tune sobre jerga sectorial (banca, salud, telecomunicaciones) partiendo de un modelo ya ajustado a hinglish.
- Investigación en code-switching: referencia reproducible para comparar estrategias de ASR multilingüe con cambio de idioma intra-enunciado.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Golden v1 (addyo07/noisy-hinglish-asr), inferencia sherpa-onnx ONNX Runtime, provider=cpu, 12 workers paralelos y 2 hilos intra-op. Los valores no están verificados de forma independiente (verified: false).

| Split | Clips | WER baseline (%) | WER candidato v2 (%) | Delta (pp) | IC 95 % bootstrap |
|---|---|---|---|---|---|
| en_conv_noisy | 486 | 34,69 | 31,20 | -3,49 | [-5,82, -1,48] |
| hinglish_clean | 277 | 42,09 | 35,83 | -6,26 | [-9,38, -3,30] |
| hinglish_noisy | 277 | 44,28 | 40,64 | -3,65 | [-6,30, -1,26] |
| en_conv_clean | 486 | 23,96 | 20,86 | -3,10 | [-4,60, -1,66] |
| read_en | 280 | 18,32 | 16,84 | -1,48 | [-2,83, -0,17] |
| en_real_noisy_chime6 | 240 | 49,33 | 49,38 | +0,05 | [-1,76, +1,86] |
| hi_conv_clean | 390 | 25,10 | 25,29 | +0,19 | [-1,12, +1,48] |
| hi_conv_noisy | 390 | 44,40 | 44,54 | +0,14 | [-1,10, +1,40] |
| read_hi | 390 | 18,42 | 18,47 | +0,05 | [-0,71, +0,81] |
| negatives | 200 | 0,00 | 0,00 | 0,00 | [0,00, 0,00] |
| read_en_ls | 140 | 18,32 | 19,05 | +0,73 | [+0,05, +1,44] |

Métricas CER declaradas en el model-index: 17,21 % (hinglish_clean), 19,88 % (hinglish_noisy), 15,34 % (en_conv_noisy) y 9,87 % (en_conv_clean). El RTF medio mejoró aproximadamente un 25 % (de 0,65 a 0,46) sobre CPU x86_64 de 32 núcleos. El autor documenta una regresión en read_en_ls (+0,73 pp) y un aumento de la tasa de salida vacía en hinglish_noisy (+2,67 pp), motivo por el que la auditoría QA interna emitió veredicto de rechazo para despliegue por defecto bajo su SLA de cero regresiones.

## Requisitos de hardware

- VRAM: no requiere GPU; el bundle de producción es ONNX INT8 para CPU. El checkpoint NeMo completo ocupa 2,4 GB en disco y el repositorio total 9,0 GB.
- GPU recomendadas: no aplica para el bundle sherpa-onnx; para fine-tune del checkpoint NeMo se recomienda una GPU con al menos 16 GB (RTX 4090, A100, H100) según el tamaño de lote, aunque el autor no publica requisitos específicos.
- Compatibilidad con GPU de consumo: el modelo de 0,6 B cabe holgadamente en cualquier GPU de consumo para fine-tune; para inferencia no es necesaria.
- Despliegue: sherpa-onnx (runtime recomendado, provider=cpu), NeMo Toolkit 3.0.0 para el checkpoint, y exportación a ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: RTF medio de 0,46 sobre CPU x86_64 de 32 núcleos con 12 workers paralelos y 2 hilos intra-op, es decir, aproximadamente 2,2 veces más rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5 0.6B Streaming Hinglish (este) | 0,6 B | hi, en, hinglish | Sí (cache-aware) | Apache 2.0 | Fine-tune de nicho con bundle ONNX INT8 para CPU |
| Nemotron-3.5 0.6B base (NVIDIA) | 0,6 B | multilingüe | Sí | no disponible en la informacion | Baseline del que parte este fine-tune |
| Whisper large-v3 (OpenAI) | 1,55 B | multilingüe (incluye hi/en) | No nativo (ventanas de 30 s) | MIT | Referencia ASR multilingüe; no optimizado para code-switching ni streaming |
| Alternativas ASR hinglish específicas | no disponible | hi, en, hinglish | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se han publicado en la información disponible comparativas directas con otros modelos ASR sobre el mismo corpus Golden v1 más allá del baseline base-v1.

## Limitaciones y advertencias

- Veredicto QA interno de rechazo para despliegue por defecto: la auditoría del propio autor concluye FAIL bajo su SLA de cero regresiones, pese a las mejoras en las splits prioritarias.
- Regresión documentada en read_en_ls (LibriSpeech Test-Clean): WER sube de 18,32 % a 19,05 % (+0,73 pp), con intervalo de confianza que excluye el cero.
- Aumento de la tasa de salida vacía en hinglish_noisy: de 0,89 % a 3,56 % (+2,67 pp), lo que puede producir transcripciones incompletas en audio ruidoso.
- WER absolutos elevados en conversación ruidosa: 40,64 % en hinglish_noisy y 49,38 % en CHiME-6, insuficientes para muchos usos de producción sin postprocesado o contextualización.
- Sin mejoras significativas en hindi conversacional limpio y ruidoso (variaciones de +0,14 a +0,19 pp, dentro del ruido estadístico): el fine-tune no aporta en esas condiciones.
- Benchmarks no verificados de forma independiente: todos los resultados del model-index figuran con verified: false y proceden del autor.
- Sesgos y cobertura: el modelo se ajusta a un dominio conversacional concreto; no se documentan evaluaciones de sesgo por acento, género o dialecto del hindi.
- Riesgo de alucinación: mitigado en parte por el 100 % de rechazo sobre negativos de ruido puro, pero no se documenta comportamiento ante habla muy degradada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Nemotron de NVIDIA del que deriva.
- Estado del arte del repositorio: la model card anuncia un Candidate v3 en desarrollo para corregir las dos regresiones identificadas; la versión publicada es v2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addyo07/nemotron-3.5-0.6b-hinglish
- Dataset de evaluación: https://huggingface.co/datasets/addyo07/noisy-hinglish-asr
- Modelo base NVIDIA Nemotron: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
