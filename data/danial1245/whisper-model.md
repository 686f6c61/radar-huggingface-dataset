# danial1245/whisper-model

## Resumen

Este modelo es un ajuste fino de `openai/whisper-small` realizado por el usuario danial1245 para la tarea de reconocimiento automático del habla (ASR). Se publica bajo licencia Apache 2.0 y contiene 241.734.912 parámetros, el mismo tamaño que el modelo base, ya que el ajuste fino no modifica la arquitectura original. El repositorio se generó automáticamente con la librería `transformers` y el Trainer de Hugging Face, por lo que la model card carece de información detallada sobre el dataset de entrenamiento y los casos de uso previstos.

La relevancia de este modelo es limitada: se trata de un checkpoint experimental con una tasa de error de palabra (WER) del 65,41 % en el conjunto de evaluación, un valor muy alto que indica un rendimiento deficiente en comparación con el Whisper-small original. No se han publicado resultados de benchmarks externos ni comparativas con otros sistemas. Su interés principal reside en servir como ejemplo de flujo de entrenamiento con el Trainer, más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small procesa audio en ventanas de 30 segundos) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion estandar de transformers |
| Idiomas soportados | no disponibles en la model card; el modelo base Whisper-small soporta 96 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper-small: un transformer encoder-decoder con aproximadamente 244 millones de parámetros, entrenado originalmente por OpenAI sobre 680.000 horas de audio débilmente supervisado. El encoder procesa espectrogramas Mel de ventanas de 30 segundos y el decoder genera transcripciones de forma autorregresiva, con soporte para identificación de idioma, transcripción multilingüe y traducción del habla.

El ajuste fino se realizó con la librería `transformers` versión 5.15.0 y PyTorch 2.11.0, con los siguientes hiperparámetros: learning rate de 1e-5, batch size de entrenamiento de 8 (16 con acumulación de gradientes de 2 pasos), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con 500 pasos de warmup, 10 épocas y precisión mixta nativa AMP. El entrenamiento se detuvo en la época 5.97 (paso 800), lo que sugiere una detención temprana o un límite de pasos. El dataset de entrenamiento no está documentado, por lo que se desconoce su composición, tamaño o idioma.

## Capacidades

- Transcripción de audio a texto: el modelo puede transcribir clips de audio de hasta 30 segundos por ventana, al igual que el Whisper-small original.
- Identificación de idioma: capacidad heredada del modelo base, aunque no se ha verificado su funcionamiento tras el ajuste fino.
- Traducción del habla: Whisper-small soporta traducción de audio a texto en inglés; esta capacidad puede haberse visto afectada por el ajuste fino.
- Multilingüismo: el modelo base soporta 96 idiomas, pero no hay evidencia de que el ajuste fino preserve esta cobertura.
- Sin soporte de tool calling ni capacidades de agente: es un modelo de ASR puro, sin interfaz de razonamiento ni generación de código.

## Casos de uso

- Transcripción de entrevistas y reuniones: el modelo puede procesar grabaciones de audio y generar transcripciones textuales, aunque el WER del 65,41 % lo hace poco fiable para este fin sin un postprocesado extenso.
- Subtitulado automático de vídeo: integrándolo en un pipeline con ffmpeg para extraer audio y segmentarlo en ventanas de 30 segundos, podría generar subtítulos, pero la calidad sería deficiente.
- Asistentes de voz en aplicaciones de bajo presupuesto: al ser un modelo pequeño (244 M parámetros), puede desplegarse en CPU o GPU de gama baja para prototipos de dictado por voz.
- Experimentación académica: sirve como referencia para estudiar el efecto del ajuste fino con datasets pequeños sobre el rendimiento de Whisper-small, dado que el WER degrada notablemente respecto al modelo base.
- Evaluación de pipelines de entrenamiento: el repositorio documenta un flujo completo de fine-tuning con Trainer, útil para quienes quieran replicar el proceso con sus propios datos.
- Benchmark de calidad de datos: comparando este checkpoint con el modelo base se puede medir la calidad del dataset de entrenamiento utilizado, que probablemente sea ruidoso o esté mal etiquetado dado el alto WER.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación, aunque no especifica qué dataset se utilizó:

| Metrica | Valor |
|---|---|
| eval_loss | 0,9859 |
| eval_wer | 65,4080 |
| eval_runtime | 159,814 s |
| eval_samples_per_second | 1,176 |
| eval_steps_per_second | 0,15 |
| epoch | 5,9701 |
| step | 800 |

El WER del 65,41 % es extremadamente alto: Whisper-small sin ajustar suele obtener WER inferiores al 15 % en inglés limpio y por debajo del 30 % en muchos idiomas con acento o ruido. Este resultado indica que el ajuste fino ha degradado severamente el rendimiento del modelo base, posiblemente por un dataset de entrenamiento de baja calidad, desalineación entre etiquetas y audio, o un sobreajuste a un dominio muy específico. No se han publicado resultados en MMLU, HumanEval u otros benchmarks, ya que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en FP32 para una ventana de 30 segundos; menos de 1 GB con cuantización a int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia; una RTX 4090 o A10 permite procesamiento por lotes.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna e incluso en CPU con llama.cpp o whisper.cpp.
- Opciones de despliegue: Hugging Face Transformers con pipeline `automatic-speech-recognition`, Whisper.cpp para CPU, vLLM no es compatible directamente (no es un modelo LLM), y TGI tampoco aplica.
- Latencia estimada: en una GPU moderna, la transcripción de un clip de 30 segundos tarda entre 1 y 3 segundos; en CPU puede tardar entre 5 y 15 segundos según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (referencia) | Licencia |
|---|---|---|---|---|
| danial1245/whisper-model | 244 M | 30 s de audio | 65,41 % (eval propio) | Apache 2.0 |
| openai/whisper-small | 244 M | 30 s de audio | ~10-15 % en inglés (LibriSpeech) | MIT |
| openai/whisper-base | 74 M | 30 s de audio | ~15-20 % en inglés (LibriSpeech) | MIT |
| openai/whisper-medium | 769 M | 30 s de audio | ~8-10 % en inglés (LibriSpeech) | MIT |

El modelo ajustado rinde significativamente peor que el Whisper-small original, que es su punto de partida. La degradación del WER es de aproximadamente 50 puntos porcentuales, lo que sugiere que el ajuste fino fue contraproducente. Comparado con Whisper-base, que tiene un tercio de los parámetros, el rendimiento también es inferior. No hay ninguna ventaja técnica que justifique elegir este checkpoint frente al modelo base.

## Limitaciones y advertencias

- Rendimiento deficiente: el WER del 65,41 % en evaluación lo hace inadecuado para transcripción en producción sin un postprocesado muy agresivo o un reentrenamiento con datos de calidad.
- Dataset de entrenamiento desconocido: la model card no documenta el origen, idioma ni tamaño de los datos de ajuste, lo que impide evaluar su cobertura y posibles sesgos.
- Riesgo de sobreajuste: el entrenamiento se detuvo en la época 5,97 de 10, pero la pérdida de evaluación de 0,9859 y el alto WER sugieren que el modelo puede haber memorizado patrones del dataset de entrenamiento sin generalizar.
- Sin información sobre idiomas: no se especifica qué idiomas soporta el modelo tras el ajuste fino; la cobertura multilingüe del Whisper-small original puede haberse reducido.
- Alucinaciones en transcripción: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en audio con ruido, silencios o habla superpuesta; el alto WER incrementa este riesgo.
- Licencia Apache 2.0: permite uso comercial sin restricciones de atribución, pero no exime de responsabilidad sobre el contenido generado.
- Repositorio sin mantenimiento: creado en agosto de 2026, sin descargas ni likes, y con una model card generada automáticamente que indica "More information needed" en todas las secciones descriptivas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/danial1245/whisper-model
- Checkpoint de prueba del mismo autor: https://huggingface.co/danial1245/whisper-small-test
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Documentación de la API de Whisper de OpenAI: https://developers.openai.com/api/docs/models/whisper-1
