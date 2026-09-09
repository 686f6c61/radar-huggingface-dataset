# AshrafMMahdy/futo-egyptian-arabic-models

## Resumen

El modelo "futo-egyptian-arabic-models" es un conjunto de modelos de reconocimiento de voz (ASR) basados en Whisper, adaptados al árabe egipcio con code-switching en inglés, desarrollados por AshrafMMahdy. Su propósito es proporcionar entrada de voz offline para FUTO Keyboard en Android. El problema que resuelve es doble: por un lado, los modelos Whisper multilingües estándar son casi inutilizables para el dialecto egipcio hablado; por otro, sin el método ACFT (audio context fine-tuning) de FUTO, los modelos Whisper tienden a repetir o entrar en bucles en clips de audio cortos (menos de 15 segundos) dentro de FUTO. Este conjunto incluye cuatro archivos GGML cuantizados, listos para importar en FUTO Keyboard. La arquitectura es un transformer encoder-decoder de Whisper, con variantes de 244M (small) y 809M (turbo large-v3). El contexto de audio es dinámico gracias a ACFT, mientras que la ventana de Whisper es de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 244M (small) / 809M (turbo large-v3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos (ventana de audio de Whisper; ACFT permite contexto dinámico) |
| Tipos de cuantizacion | Q8_0 y Q5_0 |
| Idiomas soportados | Árabe (egipcio) e inglés, con code-switching |
| Licencia | MIT |
| Formato de pesos | GGML (archivos .bin para whisper.cpp y FUTO Keyboard); no safetensors |

## Arquitectura y entrenamiento

Los modelos se basan en dos fine-tunes previos: IbrahimAmin/code-switched-egyptian-arabic-whisper-small (base para las variantes small) y mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching (base para las variantes turbo). Sobre ellos se aplica el método ACFT de FUTO, que consiste en entrenar un "audio context" dinámico mediante un objetivo de pérdida MSE entre las capas ocultas del decodificador del estudiante y un modelo de referencia congelado que usa el contexto completo de 30 segundos. El proceso se realizó con 2000 pasos, una tasa de aprendizaje de 1e-6 y unas 4 horas de audio egipcio del dataset MAdel121/arabic-egy-cleaned. Para las variantes turbo solo se entrenó el encoder, con el decodificador congelado y Adam de 8 bits, para que cupiera en una sola GPU T4. A continuación se convirtieron a formato GGML con convert-h5-to-ggml.py y se cuantizaron con whisper-quantize.

## Capacidades

- Reconocimiento de voz (ASR) en árabe egipcio con code-switching en inglés.
- Funcionamiento 100% offline en Android a través de FUTO Keyboard.
- Sin bucles ni repeticiones en clips cortos gracias a ACFT, diseñado específicamente para clips de menos de 15 segundos.
- Las variantes turbo mejoran el reconocimiento del dialecto y de ambigüedades como س/ص.
- Cuantizaciones Q5_0 y Q8_0 que reducen el tamaño y permiten la ejecución en móviles.
- No soporta tool calling, ni agentes ni generación de texto general: es un modelo de audio a texto.

## Casos de uso

- Dictado de mensajes en Android: con FUTO Keyboard, un usuario puede pulsar el micrófono y dictar mensajes en egipcio, mezclando inglés sin cambiar de idioma gracias al code-switching.
- Transcripción de notas de voz en dialecto: profesionales que reciben audio en árabe egipcio (periodistas, encuestadores, investigadores) pueden transcribir clips cortos offline con las variantes small q8_0, que son ligeras.
- Accesibilidad para personas con movilidad reducida: usuarios que no pueden escribir en el teclado pueden usar la voz de forma fiable sin conexión, evitando los bucles de Whisper.
- Asistencia en aplicaciones de mensajería en entornos con poca cobertura: al ser offline, el dictado funciona sin conexión a internet, lo que es útil en zonas rurales o con restricciones de red.
- Subtitulación de contenido corto en egipcio: creadores de contenido pueden usar el modelo para generar subtítulos en árabe egipcio para vídeos cortos, aunque la calidad no está validada con benchmarks.
- Herramientas de aprendizaje de idiomas: estudiantes de árabe egipcio pueden practicar pronunciación o dictado en una aplicación que use el modelo, beneficiándose de la mezcla árabe-inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Variante small (244M) en Q8_0: 253 MB; corre en cualquier teléfono moderno. Es la recomendada por defecto.
- Variante small en Q5_0: 168 MB; más rápida y de menor tamaño, pero ligeramente menos precisa.
- Variante turbo (809M) en Q5_0: ~570 MB; requiere teléfonos de gama alta (Snapdragon 8 Gen 3 / 8 Elite, Dimensity 9300+) con 12 GB o más de RAM.
- Variante turbo en Q8_0: ~870 MB; mayor calidad, más lenta.
- Para el proceso de entrenamiento se usó una GPU T4, pero para inferencia los archivos GGML están pensados para ejecutarse en CPU/GPU de móviles mediante whisper.cpp. No se requiere GPU dedicada en el dispositivo.
- Despliegue: FUTO Keyboard en Android; también se pueden utilizar con whisper.cpp en servidores o escritorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño del archivo | Base | Licencia | Adaptación al egipcio |
|---|---|---|---|---|---|
| futo-egyptian-arabic-models (small, Q8_0) | 244M | 253 MB | IbrahimAmin/code-switched-egyptian-arabic-whisper-small | MIT | Sí, con ACFT |
| futo-egyptian-arabic-models (turbo, Q5_0) | 809M | ~570 MB | mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching | MIT | Sí, con ACFT |
| ahmedgomaaa/futo-keyboard-egyptian-arabic (ggml-egyptian-phase3-q5_1.bin) | no disponible | 190 MB | no disponible | no disponible | Sí, fine-tune en egipcio |
| Whisper small multilingüe estándar | 244M | ~460 MB (en FP16) | - | MIT | No, degradado en dialecto |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos ASR para egipcio no está evaluado de forma objetiva.
- El entrenamiento de ACFT se realizó con solo 4 horas de audio de un dataset específico; puede haber sesgos regionales, de género o de registro no documentados.
- Whisper es conocido por producir alucinaciones (texto inventado) en presencia de ruido o audio silencioso; ACFT mitiga los bucles pero no elimina este riesgo.
- Los modelos están optimizados para árabe egipcio e inglés. Su rendimiento con otros dialectos árabes (magrebí, levantino, etc.) es previsiblemente inferior.
- Los archivos GGML son binarios de inferencia, no safetensors; para realizar más entrenamiento o adaptación sería necesario convertir y trabajar con los pesos originales.
- Aunque la licencia MIT permite uso comercial, se recomienda revisar las licencias de los modelos base y de los datasets utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AshrafMMahdy/futo-egyptian-arabic-models
- Repositorio ACFT de FUTO: https://github.com/futo-org/whisper-acft
- FUTO Keyboard: https://keyboard.futo.org/
- Modelo similar en GitHub: https://github.com/ahmedgomaaa/futo-keyboard-egyptian-arabic
- Dataset mencionado en la model card (sin URL directa): MAdel121/arabic-egy-cleaned
