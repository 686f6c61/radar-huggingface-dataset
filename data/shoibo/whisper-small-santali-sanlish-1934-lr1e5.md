# shoibo/whisper-small-santali-sanlish-1934-lr1e5

## Resumen

El modelo `shoibo/whisper-small-santali-sanlish-1934-lr1e5` es un ajuste fino de `openai/whisper-small` orientado al reconocimiento automático del habla (ASR) en santali, una lengua austroasiática hablada principalmente en India, Bangladesh y Nepal. El nombre "sanlish" sugiere que el modelo trabaja con transcripciones en santali transliterado al alfabeto latino, aunque la documentación oficial no especifica el formato exacto de salida. Lo desarrolla el usuario `shoibo` y se publica bajo licencia Apache 2.0.

El modelo conserva la arquitectura encoder-decoder de Whisper-small, con 241,7 millones de parámetros y una ventana de audio de 30 segundos. Se entrenó durante 25 épocas sobre un conjunto de datos no documentado, alcanzando una WER de 33,41 y una CER de 7,54 en el conjunto de evaluación. Su relevancia radica en ser uno de los pocos recursos públicos de ASR específicos para santali, una lengua con escasa representación en los sistemas de reconocimiento de voz comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (448 tokens de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Santali (especializado); el modelo base soporta 99 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con 12 capas en cada bloque, atención de múltiples cabezas y normalización pre-LayerNorm. El encoder procesa espectrogramas Mel de 80 canales a partir de ventanas de 30 segundos, y el decoder genera el texto de forma autorregresiva. No se trata de un modelo MoE ni híbrido; es un transformer denso estándar.

El ajuste fino se realizó con el `Trainer` de Hugging Face sobre un dataset no especificado en la model card (aparece como "None"). Los hiperparámetros declarados incluyen learning rate de 1e-5, batch size de 8 con acumulación de gradientes de 2 pasos (batch efectivo de 16), scheduler lineal con 153 pasos de warmup, optimizador AdamW y precisión mixta nativa. Se entrenó durante 25 épocas, lo que provocó un sobreajuste evidente: la pérdida de entrenamiento cae a 0,0005 en las últimas épocas mientras que la pérdida de validación se estanca en torno a 0,73. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Transcripción de audio a texto en santali, con salida en formato "sanlish" (presumiblemente romanizado).
- Reconocimiento de voz con entrada de hasta 30 segundos por segmento, manejando audio más largo mediante ventanas deslizantes.
- Al estar basado en Whisper-small, hereda capacidades multilingües del modelo original, aunque el ajuste fino degrada su rendimiento en otros idiomas.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades más allá del ASR.
- La métrica CER de 7,54 indica que el modelo comete errores a nivel de carácter, lo que puede afectar a la precisión en nombres propios o términos técnicos.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en santali para proyectos de documentación lingüística o investigación antropológica, aprovechando la ventana de 30 segundos para procesar fragmentos de habla natural.
- Generación de subtítulos para vídeos en santali, integrando el modelo con herramientas de corte de audio y segmentación temporal.
- Creación de corpus de texto a partir de grabaciones de radio o podcasts en santali, útil para entrenar modelos de lenguaje o sistemas de traducción automática.
- Asistencia a la transcripción en entornos administrativos o sanitarios donde se atiende a hablantes de santali, reduciendo el trabajo manual de anotación.
- Desarrollo de aplicaciones de dictado por voz para dispositivos móviles dirigidas a usuarios de santali, siempre que se acepte una WER en torno al 33%.
- Verificación de pronunciación en herramientas de aprendizaje de idiomas para santali, comparando la transcripción generada con la referencia esperada.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados sobre el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0,7348 |
| WER | 33,4149 |
| CER | 7,5411 |

No se han publicado comparaciones con otros modelos ASR en santali ni con el Whisper-small original en el mismo conjunto de datos. El apartado `model-index` de la model card aparece vacío, por lo que estos valores son la única referencia disponible.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 1 GB de VRAM para el modelo (241M parámetros), más el overhead de activaciones y procesamiento de audio.
- En FP32, el consumo sube a unos 2 GB. Es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En CPU, Whisper-small puede transcribir en tiempo real o casi real con cuantización a 8 bits, aunque la latencia depende del hardware y de la longitud del audio.
- Opciones de despliegue: `transformers` con pipeline de ASR, `faster-whisper` para inferencia optimizada, `whisper.cpp` para CPU y `vLLM` no es aplicable al ser un modelo de audio.
- El tamaño del repositorio (22,2 GB) sugiere que incluye checkpoints de entrenamiento y no solo los pesos finales; para producción conviene descargar únicamente los safetensors del modelo final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | WER (evaluacion) |
|---|---|---|---|---|---|
| `shoibo/whisper-small-santali-sanlish-1934-lr1e5` | 241,7M | 30 s audio | Santali (especializado) | Apache 2.0 | 33,41 |
| `openai/whisper-small` (base) | 244M | 30 s audio | 99 idiomas | MIT | No disponible en santali |
| `thunderboltc/whisper-small-santali-sanlish` | 244M (estimado) | 30 s audio | Santali (especializado) | Apache 2.0 | No disponible |

No se dispone de resultados de evaluación del modelo base Whisper-small en santali ni del modelo de `thunderboltc`, por lo que no es posible establecer una comparación cuantitativa rigurosa. El modelo de `shoibo` es una variante de un fine-tune previo con el mismo nombre, pero con hiperparámetros distintos (learning rate 1e-5 y 25 épocas).

## Limitaciones y advertencias

- La WER del 33,4% es alta para uso en producción sin supervisión humana; la transcripción automática requerirá corrección manual en contextos críticos.
- El dataset de entrenamiento no está documentado, lo que impide evaluar la representatividad de los acentos, registros o dominios cubiertos.
- El sobreajuste observado (pérdida de entrenamiento casi nula frente a pérdida de validación estable) indica que el modelo puede generalizar mal a audio fuera de la distribución de entrenamiento.
- La salida en formato "sanlish" no está especificada formalmente; podría haber inconsistencias en la romanización de ciertos fonemas santali.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo hereda las limitaciones del Whisper original en cuanto a ruido de fondo, habla superpuesta o acentos no representados.
- No se aportan datos sobre latencia, throughput ni consumo energético, por lo que el dimensionamiento de infraestructura debe basarse en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoibo/whisper-small-santali-sanlish-1934-lr1e5
- Modelo relacionado (mismo nombre, otro autor): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Documentación de Whisper en Hugging Face: https://huggingface.co/docs/transformers/model_doc/whisper
