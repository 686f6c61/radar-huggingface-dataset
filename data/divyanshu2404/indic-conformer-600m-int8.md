# divyanshu2404/indic-conformer-600m-int8

## Resumen

IndicConformer 600M INT8 es una versión cuantizada y empaquetada en ONNX del modelo de reconocimiento automático de voz (ASR) IndicConformer 600M Multilingual desarrollado originalmente por AI4Bharat. Lo publica el usuario divyanshu2404 para su uso en la aplicación de dictado Freshflo en macOS, con el objetivo de permitir reconocimiento de voz en dispositivo (on-device) en 22 lenguas de la India. Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo: el trabajo original y los pesos base proceden íntegramente de AI4Bharat.

La arquitectura es un Conformer (convolución más atención) de aproximadamente 600 millones de parámetros con cabeza CTC, sobre el que se ha aplicado cuantización dinámica de 8 bits mediante ONNX Runtime. El repositorio incluye únicamente el codificador cuantizado (`encoder-int8.onnx`), el decodificador CTC (`ctc_decoder.onnx`), el vocabulario y las máscaras de lengua, además de las constantes del preprocesador (filtros mel y ventana) en float32 little-endian para poder calcular características sin depender de PyTorch.

Su relevancia actual radica en que reduce el coste de despliegue de un modelo ASR multilingüe para lenguas indias a un único fichero ONNX de 0,9 GB, eliminando la dependencia de PyTorch y facilitando la inferencia en CPU o en hardware modesto. La licencia MIT del modelo original se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder convolucional + atención) con cabeza CTC |
| Parámetros totales | 600 M (según denominación del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR por tramas; ventana STFT de 400 muestras, hop 160) |
| Tipos de cuantización | INT8 (cuantización dinámica de ONNX Runtime) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, ne, or, pa, ta, te, ur (13 lenguas listadas; el modelo base declara 22 lenguas indias) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder-int8.onnx, ctc_decoder.onnx), más vocab.json, language_masks.json, mel_filters.f32, window.f32 |

## Arquitectura y entrenamiento

El modelo base es un Conformer de 600 millones de parámetros con dos cabezas, CTC y RNNT, entrenado por AI4Bharat para reconocimiento de voz multilingüe en lenguas indias. Esta versión conserva únicamente la cabeza CTC: el codificador Conformer se ha cuantizado a 8 bits con cuantización dinámica de ONNX Runtime y se distribuye como un único fichero `encoder-int8.onnx`, mientras que el decodificador CTC, el vocabulario y las máscaras de lengua se mantienen sin cambios respecto al original.

El preprocesador original en TorchScript se ha sustituido por sus constantes exportadas: preénfasis de 0,97, reflect-pad de 256 muestras, STFT de 512 puntos con hop de 160 y ventana centrada de 400 muestras, cálculo de potencia, aplicación de filtros mel (257 × 80), logaritmo de `log(x + 2⁻²⁴)` y normalización por banda con media y desviación estándar. No se dispone de información sobre el volumen de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales en esta versión; esos detalles corresponden al modelo base de AI4Bharat y no se recogen en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en 13 lenguas indias listadas en la model card: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, nepalí, oriya, panyabí, tamil, telugu y urdu.
- Decodificación CTC voraz (greedy) con selección de logits por máscara de lengua: para cada trama se toma el mejor de los 257 logits permitidos por `language_masks[lang]`, se fusionan repeticiones, se descarta el token blank (256) y se mapea mediante `vocab[lang]`, donde «▁» marca inicio de palabra.
- Entrada de audio en formato `audio_signal` [1, 80, T] float32 y `length` [1] int64, lo que permite procesar lotes de un único segmento con longitud variable.
- Inferencia sin dependencia de PyTorch: las características mel se calculan a partir de los ficheros `mel_filters.f32` y `window.f32`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado en aplicaciones de escritorio: es el uso declarado por el autor, la app Freshflo en macOS, que emplea el modelo para transcripción de voz a texto en dispositivo sin enviar audio a la nube.
- Transcripción de reuniones y notas de voz en lenguas indias: el modelo admite 13 lenguas con un único artefacto ONNX, lo que simplifica el despliegue de una función de subtitulado o acta automática en entornos multilingües.
- Subtitulado de vídeo y audio en tiempo casi real: al ejecutarse en CPU con cuantización INT8 y sin PyTorch, puede integrarse en pipelines de transcripción por segmentos con latencia controlada.
- Asistentes de voz sin conexión: la ausencia de dependencias pesadas y el tamaño de 0,9 GB permiten empaquetarlo en aplicaciones de escritorio o dispositivos con recursos limitados para reconocimiento de comandos y dictado.
- Accesibilidad: transcripción de voz a texto para usuarios con movilidad reducida en lenguas indias donde los servicios comerciales tienen cobertura limitada.
- Procesamiento por lotes de archivos de audio: el decodificador CTC y la entrada de longitud variable facilitan la transcripción de grandes volúmenes de grabaciones en servidores sin GPU dedicada.
- Investigación en ASR multilingüe: sirve como referencia cuantizada para comparar el impacto de la cuantización INT8 frente al modelo original en tareas de reconocimiento en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,9 GB, por lo que el codificador INT8 y el decodificador caben holgadamente en menos de 2 GB de memoria, aunque la cifra exacta de VRAM no se indica.
- GPU recomendadas: no se especifican; al ser un modelo ONNX INT8, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime (por ejemplo, series NVIDIA con soporte CUDA o TensorRT), pero no hay recomendaciones publicadas.
- ¿Cabe en GPU de consumo? Sí, por tamaño (0,9 GB de pesos) cabría en cualquier GPU de consumo moderna; no obstante, no se aportan cifras de rendimiento ni requisitos mínimos verificados.
- Opciones de despliegue: ONNX Runtime (cuantización dinámica INT8), con posibilidad de usar los proveedores de ejecución CPU o GPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| divyanshu2404/indic-conformer-600m-int8 | 600 M | no disponible | 13 listadas (base: 22 lenguas indias) | MIT | ONNX INT8 |
| ai4bharat/indic-conformer-600m-multilingual | 600 M | no disponible | 22 lenguas indias | MIT | PyTorch (modelo base) |
| Whisper (variantes de OpenAI) | no disponible en la información | no disponible | multilingüe amplio | MIT | PyTorch, entre otros |
| Otros ASR indios comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la omisión de la cabeza RNNT.

## Limitaciones y advertencias

- Solo se incluye la cabeza CTC; la cabeza RNNT del modelo original no está presente, por lo que no se puede reproducir el rendimiento del decodificado RNNT.
- La cuantización dinámica INT8 puede degradar la precisión de transcripción respecto al modelo en precisión completa; no se aportan métricas de esa degradación.
- El modelo está orientado a lenguas indias; no se declara soporte para castellano ni otras lenguas no listadas.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o dominio muy distinto al de entrenamiento; no se documentan sesgos específicos.
- La model card no detalla el dataset de entrenamiento ni las condiciones de evaluación, lo que dificulta estimar el rendimiento en producción.
- Aunque la licencia es MIT, el mérito del modelo corresponde a AI4Bharat; conviene conservar la atribución y revisar la licencia del modelo base antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de mantenimiento ni de validación por terceros.
- Los ficheros auxiliares (`mel_filters.f32`, `window.f32`) están en float32 little-endian; su uso requiere implementar el preprocesador manualmente, lo que añade riesgo de discrepancias con el original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divyanshu2404/indic-conformer-600m-int8
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
