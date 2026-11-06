# amir0907/student-v6

## Resumen

student-v6 es la sexta iteración del módulo quirúrgico de emoción (Surgical Emotion Module) desarrollado por el usuario amir0907, un adaptador ligero sobre el backbone congelado emotion2vec_plus_base de FunASR. No es un modelo generativo de propósito general, sino un extractor de características emocionales a nivel de trama (6,25 Hz) y de enunciado, pensado para condicionar sistemas de text-to-speech (concretamente dots.tts) en un pipeline de traducción voz-a-voz (S2ST). El adaptador tiene 3.180.811 parámetros y produce embeddings de 768 dimensiones, probabilidades sobre 9 clases emocionales e intensidad por trama.

La novedad de v6 no está en los pesos: son byte-idénticos a los de v5. El cambio es exclusivamente en la capa de inferencia, que corrige dos defectos de alto riesgo detectados en una campaña de estrés del 31 de octubre de 2026. El primero era que v5 clasificaba silencio digital como "sorprendido" con intensidad 0,54; el segundo, que la intensidad era ciega al nivel absoluto de grabación (variaba solo de 0,462 a 0,487 en un barrido de ganancia de −18 a +12 dB).

v6 introduce una puerta de energía absoluta por enunciado (`utt_env`) calculada sobre la envolvente RMS con eliminación de la media (para capturar offsets DC) y un percentil 90, que anula las salidas en entradas degeneradas y multiplica la intensidad de la cabeza para recuperar sensibilidad al nivel de grabación. El resultado es una dinámica monótona de aproximadamente 31 dB de rango útil, manteniendo las dinámicas emocionales destiladas bit a bit idénticas a v5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone transformer congelado emotion2vec_plus_base (FunASR); adapter a 6,25 Hz, G=8 |
| Parámetros totales | 3.180.811 (solo adaptador; backbone congelado no incluido en la cifra) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; contrato de tasa 6,25 Hz, T = ceil(dur×6,25) para duraciones ≥ 1 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado con RAVDESS, CREMA-D, TESS y ESD, corpus mayoritariamente anglófonos y algunos multilingües) |
| Licencia | Apache-2.0 (pesos); datos de destilación con licencias restrictivas, ver limitaciones |
| Formato de pesos | checkpoint PyTorch `.pt` (format_version 2); requiere directorio funasr del teacher emotion2vec_plus_base |

## Arquitectura y entrenamiento

El modelo es un adaptador de destilación sobre el backbone emotion2vec_plus_base de FunASR, que permanece congelado. El adaptador opera a 6,25 Hz (una trama emocional por cada token del LLM en dots.tts) y emite `frame_embs` (B,T,768), `frame_probs` (B,T,9), `frame_intensity` (B,T,1), `utt_emb` (B,768) y `utt_probs` (B,9). La destilación se realizó sobre RAVDESS, CREMA-D, TESS y ESD. En v6 se añaden dos salidas: `utt_env` (B,) y `frame_active` (B,T).

La innovación de v6 es la puerta de energía `utt_env = clip(P90(rms_50hz(wav − mean(wav))) / GLOBAL_REF, 0, 1)`, con `GLOBAL_REF = 0,18528` (mediana de corpus del P90 RMS sobre habla normalizada en pico). Se usa el mismo RMS de 320 muestras y suavizado box de 9 taps que el target de entrenamiento de v4/v5, y el P90 replica la definición de GLOBAL_REF. Si `utt_env ≤ 0,01`, todas las salidas se anulan. La media por enunciado se elimina antes del RMS para detectar offsets DC. La intensidad final es el producto de la cabeza destilada por `utt_env`, lo que restaura la sensibilidad al nivel absoluto sin alterar las dinámicas por trama. Adicionalmente, las entradas de menos de 30 ms que hacían crashear el frontend convolucional del teacher se rellenan con ceros hasta 40 ms, manteniendo `frame_lengths` con la duración real.

## Capacidades

- Reconocimiento de emoción en habla (SER) a nivel de trama y de enunciado, con 9 clases y una puntuación de intensidad continua.
- Extracción de embeddings emocionales de 768 dimensiones utilizables como condicionamiento de modelos TTS.
- Condicionamiento temporal fino: una trama emocional cada 6,25 Hz, alineable con tokens de un LLM.
- Detección de enunciados inactivos o degenerados (silencio digital, offsets DC, ruido por debajo de −54 dBFS) mediante la puerta de energía.
- Sensibilidad al nivel absoluto de grabación con ~31 dB de rango dinámico útil (monótono en el barrido −24 a +12 dB).
- Determinismo bit a bit y consistencia entre GPUs; invariancia a batch ≤ 7e-5.
- Compatibilidad hacia atrás con checkpoints v5 (format_version 1) y con `cfg.intensity_gate = False` para reproducir v5 exactamente.
- No soporta tool calling, agentes, visión ni audio generativo: es un extractor de características, no un modelo conversacional.

## Casos de uso

- Condicionamiento emocional de TTS en un pipeline S2ST: las `frame_embs` y `frame_intensity` se inyectan por token en dots.tts para preservar la prosodia emocional del hablante original durante la traducción voz-a-voz.
- Moderación y analítica de centros de contacto: clasificación de la emoción del cliente por turno con intensidad calibrada, aprovechando la puerta de energía para descartar silencios y ruido de fondo.
- Investigación en psicolingüística: extracción de series temporales emocionales a 6,25 Hz para estudios de dinámica afectiva, con determinismo bit a bit que facilita la reproducibilidad.
- Filtrado de calidad de datasets de audio: detección automática de grabaciones silenciosas, con offset DC o con nivel excesivamente bajo (`utt_env ≤ 0,01`) antes de alimentar otros modelos.
- Sistemas de accesibilidad y agentes de voz: adaptación de la respuesta sintetizada al estado emocional detectado en el usuario en tiempo casi real (RTF 0,0096 en audio de 60 s).
- Etiquetado automático de corpus emocionales: generación de pseudo-etiquetas por trama para preentrenar o ajustar otros modelos de SER.
- Detección de anomalías en grabaciones: la combinación de `utt_env` y `frame_active` permite distinguir tramas con habla real de tramas inactivas en un flujo continuo.

## Benchmarks y rendimiento

| Métrica | v5 | v6 |
|---|---|---|
| Intensidad a −24 dB | no disponible (plana) | 0,014 |
| Intensidad a −18 dB | no disponible (plana) | 0,031 |
| Intensidad a −12 dB | no disponible (plana) | 0,063 |
| Intensidad a −6 dB | no disponible (plana) | 0,126 |
| Intensidad a 0 dB | no disponible (plana) | 0,251 |
| Intensidad a +6 dB | no disponible (plana) | 0,474 |
| Intensidad a +12 dB | no disponible (plana) | 0,487 |
| Barrido −18 a +12 dB | 0,462 → 0,487 | 0,031 → 0,487 (monótono) |
| Spearman CREMA-D LO/MD/HI | 0,317 | 0,274 |
| Separación ira vs neutro a RMS igualado | no disponible | 0,189 vs 0,008 (d de Cohen 8–11, 400/400) |
| RTF en audio de 60 s | no disponible | 0,0096 (579 ms) |
| `frame_embs`/`frame_probs` vs v5 | — | max|Δ| = 0,0; acuerdo argmax 100 %; JS 0,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; por el tamaño del adaptador (3,18 M parámetros) y el backbone emotion2vec_plus_base, el consumo dominante es el del teacher congelado.
- GPU recomendadas: el autor reporta ejecución en `cuda:0`; se ha verificado identidad entre GPUs, pero no se especifican modelos concretos.
- GPU de consumo: no disponible; el adaptador en sí es trivial, pero el backbone condiciona el requisito real.
- Opciones de despliegue: carga mediante `SurgicalEmotionEncoder.from_pretrained` con el directorio funasr del teacher y el checkpoint `.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput: RTF 0,0096 (60 s de audio procesados en 579 ms); invariancia a batch ≤ 7e-5; determinismo bit a bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tasa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| student-v6 | 3,18 M (adaptador) + backbone congelado | 6,25 Hz | SER + condicionamiento TTS | Apache-2.0 (pesos) | Hugging Face |
| emotion2vec_plus_base | no disponible | no disponible | SER (representaciones auto-supervisadas) | Apache-2.0 | Hugging Face / FunASR |
| student-v5 | 3,18 M (adaptador) | 6,25 Hz | SER + condicionamiento TTS | Apache-2.0 (pesos) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de SER en la información proporcionada.

## Limitaciones y advertencias

- Los pesos se destilaron sobre RAVDESS (CC BY-NC-SA), CREMA-D, TESS y ESD; aunque la licencia declarada es Apache-2.0, el autor recomienda mantener el uso no comercial o redestilar sobre habla con licencias permisivas.
- Los tonos puros (señales periódicas no habladas) siguen registrándose como emocionales con intensidad alta (`utt_env = 1`); se recomienda usar VAD para fuentes no habladas.
- La calibración de `GLOBAL_REF` asume habla a su nivel real de grabación; con entrada normalizada en pico, `utt_env ≈ 1` y el comportamiento se aproxima al relativo de v5.
- En enunciados inactivos, `frame_probs = 0` es un vector nulo, no una distribución de probabilidad; los consumidores deben tratar este caso explícitamente.
- Las entradas con `NaN`/`Inf` se propagan a salidas `NaN` sin crashear; hay que validar en la frontera del pipeline.
- El Spearman en CREMA-D LO/MD/HI baja de 0,317 (v5) a 0,274 (v6) por la variación multiplicativa de la puerta de loudness y la confusión de las etiquetas subjetivas con el nivel de grabación.
- Riesgo de sesgo por los corpus de entrenamiento (mayoritariamente anglófonos y con actores); no hay datos publicados sobre sesgos demográficos ni sobre rendimiento en otros idiomas.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; su uso está acotado a extracción de características emocionales.

## Enlaces

- Hugging Face: https://huggingface.co/amir0907/student-v6
- Versión anterior v5: https://huggingface.co/amir0907/student-v5
- Versión original v1: https://huggingface.co/amir0907/student
- Backbone emotion2vec_plus_base (FunASR): no disponible enlace directo en la información proporcionada
- Informe de validación: `reports/t6_validate.json` (referenciado en el repositorio, no enlazado)
