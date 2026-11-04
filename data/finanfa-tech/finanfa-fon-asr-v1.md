# finanfa-tech/finanfa-fon-asr-v1

## Resumen

Finanfa-fon-asr-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en fon (fɔngbè), una lengua gbe hablada principalmente en Benín. Lo publica Finanfa Tech y se obtiene mediante un ajuste fino completo de OpenAI Whisper Small (242 millones de parámetros), al que se le añaden 7.732 grabaciones en fon procedentes de Zenodo, 229Langues, Fonika Learn y grabaciones propias del autor. El resultado se convierte a formato GGML y se cuantiza para ejecutarse en CPU y sin conexión mediante whisper.cpp.

La relevancia del modelo está en cubrir una lengua de bajos recursos para la que existen muy pocos sistemas ASR operativos. El formato GGML y las cuantizaciones de 4 y 5 bits permiten desplegarlo en dispositivos móviles o en equipos sin GPU, algo poco habitual en modelos de voz ajustados. Es, sin embargo, una versión de trabajo (v1) con limitaciones de calidad documentadas por el propio autor.

La evaluación independiente publicada en la model card muestra un WER del 51,2 % ignorando los tonos y del 82,2 % conservándolos sobre lectura de textos bíblicos, lo que sitúa al modelo en un uso de primera transcripción o búsqueda por palabras clave más que en transcripción exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small), ajuste fino completo |
| Parametros totales | 242 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (limitación nativa de Whisper) |
| Tipos de cuantizacion | Q4_0 (4 bits) y Q5_1 (5 bits); pesos GGML FP16 como paso intermedio |
| Idiomas soportados | fon (fɔngbè) y francés; el fon se decodifica forzando el token de lengua francesa |
| Licencia | Apache 2.0 (modelo base Whisper bajo licencia MIT) |
| Formato de pesos | GGML (.bin) para whisper.cpp; pesos Hugging Face originales no publicados en el repo |

## Arquitectura y entrenamiento

El modelo parte de OpenAI Whisper Small, un transformer encoder-decoder con 242 millones de parámetros diseñado para ASR multilingüe. El ajuste fino fue completo (no LoRA ni adaptadores) sobre 7.732 grabaciones en fon: 6.185 para entrenamiento y 1.547 para test. Las fuentes de datos son Zenodo, 229Langues, Fonika Learn y grabaciones del propio autor. Cada audio se procesó con Audacity, se remuestreó a 16 kHz y se etiquetó manualmente por el autor. Los datos no se redistribuyen.

Los hiperparámetros documentados son 2.322 pasos (3 épocas de 774 pasos), tasa de aprendizaje 3e-6, lote efectivo de 8, optimizador AdamW y precisión FP16, con un coste de aproximadamente 3 horas y 30 minutos en una GPU P100. El decodificado se fuerza a lengua francesa y tarea de transcripción, un detalle crítico: sin `-l fr` la salida no es fiable. La conversión a GGML se hizo con el script oficial de whisper.cpp y de ahí se generaron las cuantizaciones Q5_1 y Q4_0.

## Capacidades

- Transcripción de voz a texto en fon con salida en ortografía fon, incluyendo puntuación generada por el modelo.
- Reconocimiento de habla en francés heredado del modelo base, aunque no se documenta su calidad tras el ajuste fino.
- Ejecución en CPU sin conexión mediante whisper.cpp, con bindings disponibles en Python, Flutter y otras plataformas.
- Procesamiento por ventanas de 30 segundos, adecuado para clips cortos o segmentación previa de audio largo.
- Dos niveles de cuantización que permiten intercambiar precisión por velocidad y memoria.
- No soporta identificación automática de lengua: el fon debe declararse explícitamente con `-l fr`.
- No incluye marcas de tiempo a nivel de palabra.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Primera transcripción de entrevistas o testimonios en fon: el modelo genera un borrador que un hablante nativo revisa y corrige; útil porque reduce el trabajo inicial aunque no elimine la revisión.
- Búsqueda por palabras clave en archivos de audio: con un WER del 51 % ignorando tonos, la transcripción aproximada permite localizar fragmentos por términos reconocibles en una biblioteca de grabaciones.
- Digitalización de material lingüístico en fon para investigación: el modelo produce texto alineado con el audio que sirve como punto de partida para anotación lingüística, siempre con revisión humana.
- Aplicaciones móviles de apoyo a la lectoescritura en fon: gracias a las cuantizaciones de 145 y 190 MB y a la ejecución en CPU, puede integrarse en apps offline para dispositivos de gama media en Benín.
- Subtitulado asistido de vídeos en fon: el modelo transcribe clips de hasta 30 segundos que después se sincronizan manualmente, dado que no genera marcas de tiempo por palabra.
- Preservación de lengua y corpus: generación de transcripciones preliminares de grabaciones de campo para construir corpus de fon, con normalización posterior de tonos y ortografía.
- Prototipado de pipelines ASR en entornos sin GPU: sirve para validar una arquitectura completa (audio a 16 kHz, whisper.cpp, postproceso) antes de invertir en un modelo mayor o en datos adicionales.

## Benchmarks y rendimiento

Dos mediciones publicadas en la model card, con metodologías distintas.

Medición de desarrollo sobre el modelo fuente: WER del 21,99 % sobre 20 muestras del conjunto de test interno, eligiendo el mejor punto de control sobre esas mismas 20 muestras. Es una medida indicativa, demasiado pequeña y favorable por selección sobre los mismos datos.

Medición independiente: 124 clips (10,7 minutos) de lectura de textos bíblicos en fon, un solo locutor, con tonos anotados en la referencia, preparados tras el entrenamiento. El locutor pudo estar presente en los datos de entrenamiento (no verificado). Texto en minúsculas, sin puntuación y con ε normalizada a ɛ.

| Modelo | WER (tonos conservados) | WER (tonos ignorados) | CER (tonos conservados) | CER (tonos ignorados) | Velocidad* |
|---|---|---|---|---|---|
| Q5_1 | 82,2 % | 51,2 % | 30,5 % | 14,6 % | 0,24 |
| Q4_0 | 84,3 % | 55,0 % | 30,2 % | 14,5 % | 0,22 |

\* Tiempo de cálculo dividido por la duración del audio, con 4 hilos en la CPU de un MacBook M3 (1 = tiempo real; menor es más rápido).

No se han publicado resultados comparativos con otros modelos ASR para fon en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el formato publicado; el modelo está pensado para CPU. En GPU, Whisper Small en FP16 requiere aproximadamente 1 GB de memoria, aunque no se documenta el soporte de las cuantizaciones GGML en GPU.
- GPU recomendadas: no se documentan; el autor valida el modelo en CPU. El entrenamiento se hizo en una NVIDIA P100.
- Compatibilidad con GPU de consumo: no evaluada. El formato GGML está orientado a CPU.
- Despliegue: whisper.cpp con el binario `whisper-cli` y `ffmpeg` para el preprocesado de audio a 16 kHz, mono, WAV PCM de 16 bits. Los bindings de whisper.cpp (Python, Flutter, etc.) aplican los mismos ajustes.
- Latencia y throughput: con 4 hilos en la CPU de un MacBook M3, la relación tiempo de cálculo sobre duración del audio es de 0,24 (Q5_1) y 0,22 (Q4_0), es decir, entre 4 y 5 veces más rápido que tiempo real en ese hardware.
- Memoria en disco: 145 MB para Q4_0 y 190 MB para Q5_1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| finanfa-fon-asr-v1 | 242 M | 30 s | fon, fr | Apache 2.0 | GGML (Q4_0, Q5_1) | Ajuste fino específico para fon, ejecución en CPU |
| openai/whisper-small | 244 M | 30 s | multilingüe (99 idiomas) | MIT | safetensors, GGML | Modelo base; no cubre fon de forma fiable sin ajuste |
| openai/whisper-base | 74 M | 30 s | multilingüe | MIT | safetensors, GGML | Menor tamaño y precisión; sin ajuste para fon |
| openai/whisper-medium | 769 M | 30 s | multilingüe | MIT | safetensors, GGML | Mayor capacidad pero requiere más recursos; sin ajuste para fon |

No se dispone de otros modelos ASR específicos para fon en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy dependiente del dominio, la ortografía y el locutor: el WER independiente supera el 50 % incluso ignorando tonos.
- Los tonos se transcriben de forma incompleta o ausente; comparar con textos de referencia que anotan tonos exige normalización previa.
- El modelo añade puntuación que no está en el audio y la segmentación en palabras puede diferir de la referencia.
- El carácter ɛ se escribe a veces como ε (epsilon griego), lo que rompe comparaciones automáticas.
- No evaluado con audio ruidoso, múltiples locutores ni acentos regionales.
- No identifica la lengua: es obligatorio forzar `-l fr`; sin esa opción la salida no es fiable.
- No genera marcas de tiempo a nivel de palabra; el audio largo debe segmentarse en ventanas de 30 segundos.
- La medición de desarrollo (21,99 % de WER) es poco representativa por tamaño de muestra y por selección del mejor punto sobre los mismos datos.
- El locutor de la evaluación independiente pudo formar parte del entrenamiento, lo que podría inflar los resultados.
- Licencia Apache 2.0 para el modelo; los datos de entrenamiento no se redistribuyen y cada fuente conserva sus derechos, lo que puede condicionar reentrenamientos.
- Uso comercial permitido por licencia, pero la baja precisión desaconseja emplearlo como sistema de transcripción automática sin revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/finanfa-tech/finanfa-fon-asr-v1
- Organización Finanfa Tech: https://huggingface.co/finanfa-tech
- whisper.cpp (repositorio oficial): https://github.com/ggml-org/whisper.cpp
- Modelo base OpenAI Whisper Small: https://huggingface.co/openai/whisper-small
- Zenodo (fuente de datos citada): https://zenodo.org
- 229Langues (fuente de datos citada): no disponible
- Fonika Learn (fuente de datos citada): no disponible
