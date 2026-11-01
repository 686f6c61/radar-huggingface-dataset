# Phonepadith/omniASR_CTC_300M_v2_Laos

## Resumen

omniASR_CTC_300M_v2_Laos es un modelo de reconocimiento automático del habla (ASR) especializado en lao (ພາສາລາວ), desarrollado por Phonepadith. Se trata de un ajuste fino del checkpoint CTC `omniASR_CTC_300M_v2` de Meta, perteneciente a la suite omnilingual ASR, que cubre 1.668 idiomas. El modelo resuelve dos deficiencias concretas del checkpoint base para el lao escrito: la ausencia de ocho marcas combinantes en su vocabulario de caracteres (aproximadamente el 12 % del texto lao en ejecución) y la tendencia zero-shot a transcribir audio lao en escritura tailandesa.

La arquitectura es wav2vec2 con cabecera CTC y 325.993.146 parámetros totales, distribuidos en un repositorio de 1,3 GB en formato safetensors. El ajuste fino se realizó durante 4 épocas (3.600 pasos de optimizador) sobre un único NVIDIA GB10 en 2 horas y 32 minutos, con un pico de 9,3 GB de memoria. El resultado es un CER del 8,17 % sobre un conjunto de test retenido de 1.583 clips, frente al 60,39 % del modelo base antes del ajuste.

Su relevancia radica en que demuestra que un modelo multilingüe masivo puede adaptarse a un idioma de bajos recursos con un vocabulario de caracteres incompleto mediante extensión del tokenizador y un ajuste fino acotado, sin necesidad de reentrenar el codificador de características. Es un caso práctico de reparación de vocabulario y corrección de sesgo lingüístico en ASR multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabecera CTC (Wav2Vec2ForCTC) |
| Parametros totales | 325.993.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lao (lo) |
| Licencia | other (aidctech), enlace a LICENSE en el repositorio |
| Formato de pesos | safetensors |
| Modelo base | facebook/omniASR_CTC_300M_v2 |
| Frecuencia de muestreo | 16 kHz mono |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un wav2vec2 con cabecera de clasificación CTC. El codificador de características (feature encoder) se congeló durante el ajuste fino, y se partió del checkpoint CTC preentrenado, lo que evita la fase larga de colapso en blanco típica de CTC entrenado desde un codificador desnudo. La innovación principal es la extensión del vocabulario antes del entrenamiento: se añadieron 10 caracteres ausentes al tokenizador y se amplió `lm_head` de 10.288 a 10.298 filas, copiando las filas ya entrenadas e inicializando las nuevas con `N(0, 0.02)` y sesgo `-3.0` para que arranquen de forma conservadora. Con ello, el texto no representable pasa de aproximadamente el 12 % a 0,000 %.

El ajuste fino se realizó durante 4 épocas (3.600 pasos), con tamaño de lote efectivo de 32 (8 × 4 de acumulación de gradientes), tasa de aprendizaje 1e-4 con schedule lineal y 500 pasos de warmup, precisión bf16, checkpointing de gradientes, agrupación de lotes por longitud y selección del checkpoint con mejor CER de validación. Se desactivaron deliberadamente SpecAugment y dropout (0.0): en una prueba controlada de sobreajuste con 4 clips, bf16, SpecAugment, dropout y checkpointing de gradientes convergían por separado (pérdida ~0,01 en el paso 250), pero apilados bloqueaban CTC en la fase de todo-blanco (pérdida 3,34, sin decodificación). La reducción de pérdida CTC fue `mean` con `ctc_zero_infinity=True`. El CER de validación bajó de 18,67 % a 10,35 % y seguía descendiendo en el último paso, por lo que un schedule más largo probablemente mejoraría el resultado.

## Capacidades

- Reconocimiento automático del habla en lao con salida en escritura lao (no tailandesa).
- Transcripción de audio a 16 kHz mono, con decodificación CTC mediante `Wav2Vec2Processor`.
- Manejo correcto de las marcas combinantes lao: tonos, signos vocálicos y semivocales, incluidas las ocho que faltaban en el vocabulario base.
- Procesamiento por lotes con máscara de atención (`return_attention_mask: true` en este repositorio) y agrupación por longitud.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- No dispone de modo thinking, visión ni audio de entrada más allá de la transcripción.
- Capacidad monolingüe: solo lao; no se declaran otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en lao: el modelo convierte audio de 16 kHz mono en texto con marcas de tono correctas, lo que permite generar actas y resúmenes posteriormente con un modelo de lenguaje.
- Subtitulado automático de vídeo en lao: al emitir escritura lao nativa y conservar las marcas combinantes, los subtítulos resultantes son legibles y no requieren corrección manual de tonos.
- Archivado y búsqueda de contenido audiovisual: la transcripción permite indexar grabaciones en lao y habilitar búsqueda por texto sobre archivos de audio históricos.
- Atención al cliente en centros de llamadas: integrado en un pipeline de ASR en tiempo casi real, transcribe las conversaciones para análisis de calidad y detección de temas.
- Investigación lingüística y corpus: la salida con marcas de tono preservadas facilita estudios fonéticos y la construcción de corpus anotados en lao.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos en lao, con un CER del 8,17 % que reduce la necesidad de revisión humana.
- Evaluación comparativa de ASR multilingüe: sirve como referencia de adaptación de un modelo omnilingual a un idioma de bajos recursos con vocabulario reparado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Conjunto | Métrica | Valor |
|---|---|---|---|
| omniASR_CTC_300M_v2_Laos | Lao speech (held-out), test, 1.583 clips | CER | 8,17 % |
| omniASR_CTC_300M_v2 (antes del ajuste fino) | Lao speech (held-out), test | CER | 60,39 % |

El autor advierte que debe leerse CER y no WER: el lao se escribe sin espacios entre palabras, por lo que el WER mide principalmente dónde decide cortar el modelo. La puntuación normaliza ambos lados con NFC, elimina puntuación y símbolos Unicode y mayúsculas, y conserva todas las marcas combinantes. No debe usarse `whisper_normalizer.basic.BasicTextNormalizer`, que convierte toda marca Unicode en espacio y borraría el 21,9 % del texto lao que es categoría Mark, puntuando como correctos los errores de tono.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento usó un pico de 9,3 GB en un NVIDIA GB10 con bf16 y checkpointing de gradientes. La inferencia en bf16 o fp16 requiere bastante menos, aunque no se publica una cifra concreta.
- GPU recomendadas: NVIDIA GB10 (usada para el ajuste fino); cualquier GPU con soporte bf16 o fp16 es apta para inferencia.
- Cabe en GPU de consumo: sí, por tamaño (325 M de parámetros y 1,3 GB de pesos), aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers con `Wav2Vec2ForCTC` y `Wav2Vec2Processor`; el repositorio está marcado como `endpoints_compatible`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Nota de hardware: en GPU NVIDIA Blackwell (sm_120/sm_121) con cuDNN 9.25, wav2vec2 falla con `RuntimeError: GET was unable to find an engine to execute this computation` debido a la convolución posicional agrupada (Conv1d de 1024 canales, kernel 128, 16 grupos) para la que cuDNN no tiene motor en esa arquitectura. Debe establecerse `torch.backends.cudnn.enabled = False` de forma global, ya que afecta tanto a inferencia como a entrenamiento y el ámbito local traslada el error al backward.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en lao | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR_CTC_300M_v2_Laos | 325.993.146 | no disponible | 8,17 % (test propio) | other (aidctech) | HuggingFace |
| facebook/omniASR_CTC_300M_v2 | no disponible (checkpoint base de la suite omnilingual) | no disponible | 60,39 % (test propio) | no disponible | HuggingFace / GitHub facebookresearch |
| Otros ASR multilingües (p. ej. Whisper) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación directa con Whisper u otros ASR multilingües no está disponible en la información proporcionada; el único contraste documentado es contra el checkpoint base del que deriva.

## Limitaciones y advertencias

- El modelo se entrenó sin máscaras de atención: el `preprocessor_config.json` del checkpoint base fija `return_attention_mask: false`, por lo que las regiones de relleno se trataron como audio. La agrupación por longitud mantuvo el relleno pequeño, pero un modelo con `do_stable_layer_norm` debería recibir la máscara. Este repositorio publica `return_attention_mask: true` para que la inferencia coincida con la medición del 8,17 %.
- El CER de validación seguía bajando en el último paso; un schedule más largo probablemente mejoraría el rendimiento, por lo que el 8,17 % no es un techo.
- El CER del 8,17 % procede de un conjunto de test interno de 1.583 clips y está marcado como no verificado (`verified: false`); no hay validación independiente.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados o solapamiento de hablantes: no se documentan evaluaciones en esas condiciones.
- Sesgo lingüístico: el modelo solo cubre lao; no se declaran variedades dialectales ni robustez ante code-switching.
- Restricciones de licencia: licencia `other` con nombre `aidctech` y enlace a LICENSE en el repositorio; deben revisarse los términos antes de cualquier uso comercial, ya que no es una licencia estándar tipo Apache o MIT.
- Dependencia de la normalización: puntuar con normalizadores que eliminen marcas Unicode produce métricas engañosas; debe usarse la normalización descrita por el autor.
- Requiere audio exactamente a 16 kHz mono; otra frecuencia o canales múltiples exigen remuestreo previo.
- En GPU Blackwell es obligatorio desactivar cuDNN globalmente, lo que puede afectar al rendimiento de otros componentes del pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phonepadith/omniASR_CTC_300M_v2_Laos
- Modelo base: https://huggingface.co/facebook/omniASR_CTC_300M_v2
- Repositorio omnilingual ASR de Meta: https://github.com/facebookresearch/omnilingual-asr
- Licencia (referenciada en el repositorio): LICENSE
