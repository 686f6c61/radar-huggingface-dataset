# Deep-07/whisper-hindi-small-disfluency-v2

## Resumen

Deep-07/whisper-hindi-small-disfluency-v2 es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario Deep-07. El nombre del repositorio indica que se trata de un ajuste fino de la familia Whisper de OpenAI, en su variante "small", orientado a transcripcion de hindi y con un enfasis declarado en el tratamiento de disfluencias (repeticiones, titubeos y falsos arranques propios del habla espontanea). El modelo se distribuye en formato safetensors y es compatible con la libreria transformers.

El dato objetivo mas relevante es su tamano: 241.734.912 parametros segun los pesos publicados, cifra coherente con la arquitectura Whisper small, que ronda los 244 millones de parametros. El repositorio ocupa 1,0 GB. La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sobre datos de entrenamiento, licencia, idiomas, procedimiento de ajuste ni evaluacion, por lo que la mayor parte de las especificaciones debe marcarse como no disponible.

Su interes practico es limitado pero concreto: si el ajuste fino funciona segun lo que sugiere su nombre, cubriria un nicho poco atendido, la transcripcion de habla hindi espontanea con disfluencias, para la que los modelos Whisper genericos suelen producir transcripciones excesivamente limpias o inestables. No obstante, sin model card, sin benchmarks y sin licencia declarada, no es un modelo apto para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante small; inferida del nombre y del recuento de parametros) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 segundos; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere hindi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 1,0 GB |
| Compatibilidad con endpoints | si (etiqueta endpoints_compatible) |

## Arquitectura y entrenamiento

La arquitectura no esta documentada en la model card. Por el nombre del repositorio y el recuento de parametros (241,7 M), el modelo corresponde a la variante small de Whisper: un transformer encoder-decoder con procesamiento de audio en ventanas de 30 segundos y decodificacion autoregresiva de tokens de texto. La etiqueta arxiv:1910.09700 que aparece en los tags del repositorio corresponde al articulo de Lacoste et al. sobre el calculo del impacto ambiental del aprendizaje automatico, citado en la plantilla estandar de model card, y no a un paper del modelo.

No se dispone de informacion sobre el conjunto de datos de ajuste fino, el numero de horas de audio, la composicion del corpus hindi, el uso de datos con disfluencias anotadas, la tecnica de ajuste (full fine-tuning, LoRA u otra) ni los hiperparametros. Tampoco se documenta si hubo aumentacion de datos, normalizacion de texto o criterios de filtrado. El unico indicio sobre el objetivo del ajuste es el sufijo "disfluency" del nombre, que sugiere entrenamiento o evaluacion sobre habla espontanea con repeticiones y titubeos, pero se trata de una inferencia y no de un dato confirmado.

## Capacidades

- Transcripcion de voz a texto mediante el pipeline automatic-speech-recognition de transformers.
- Procesamiento de audio en ventanas de 30 segundos, segun el diseno estandar de Whisper (no confirmado explicitamente en la model card).
- Orientacion declarada en el nombre a habla hindi con disfluencias; el soporte real de idiomas no esta documentado.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multimodales adicionales (vision, audio de entrada mas alla de la transcripcion): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Transcripcion de entrevistas y grupos focales en hindi: el modelo puede emplearse para convertir audio espontaneo en texto preservando las disfluencias, algo util en investigacion cualitativa donde las repeticiones y los titubeos son datos relevantes y no ruido que eliminar.
- Subtitulado de contenido informal en hindi: para videos, podcasts o streams donde los hablantes improvisan, un modelo ajustado a disfluencias puede reducir las omisiones y los saltos que los modelos genericos introducen al "limpiar" el habla.
- Generacion de corpus anotados para NLP: las transcripciones con disfluencias conservadas sirven como material de entrenamiento para modelos de normalizacion de texto, puntuacion y deteccion de hesitaciones.
- Investigacion en lingüistica computacional del hindi: permite analizar patrones de repeticion y reformulacion en habla natural con un modelo de tamano reducido que se puede ejecutar en un solo equipo.
- Prototipado de asistentes de voz en hindi: al caber en GPU de consumo, sirve para validar pipelines de ASR en entornos de desarrollo antes de pasar a modelos mayores.
- Transcripcion en entornos con recursos limitados: sus 241,7 M de parametros permiten inferencia en CPU o en GPU modestas, lo que facilita el despliegue en dispositivos sin aceleradores de gama alta.
- Evaluacion comparativa de robustez ante disfluencias: puede usarse como referencia de ajuste fino frente a Whisper small original en experimentos academicos sobre habla espontanea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion, conjunto de test, metricas (WER, CER) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241,7 M de parametros a 4 bytes), mas memoria para activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para lotes grandes, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con pipeline de ASR; el modelo es compatible con endpoints de Hugging Face. No se documentan variantes GGUF, por lo que llama.cpp y Ollama no estan confirmados; vLLM y TGI no soportan de forma nativa este tipo de modelo ASR en todas sus versiones.
- Latencia y throughput estimados: no disponibles. Con 241,7 M de parametros se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-07/whisper-hindi-small-disfluency-v2 | 241,7 M | no disponible (ventana estandar de 30 s en Whisper) | no disponible (nombre sugiere hindi) | no disponible | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original) | Hugging Face, ampliamente desplegado |
| openai/whisper-small.en | 244 M | ventanas de 30 s | ingles | MIT | Hugging Face |

La comparacion se limita a la familia de origen porque no se dispone de datos de rendimiento del modelo evaluado. Frente a whisper-small original, la diferencia declarada es el ajuste a hindi y a disfluencias, pero no hay evidencia publicada que cuantifique la mejora. La licencia del modelo evaluado no esta declarada, lo que impide confirmar si hereda la licencia MIT del modelo base.

## Limitaciones y advertencias

- Model card autogenerada y sin contenido sustantivo: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribucion. Riesgo legal en produccion.
- Idiomas no declarados oficialmente: el soporte de hindi es una inferencia del nombre del repositorio, no un dato verificado.
- Sin benchmarks: no hay evidencia publicada de mejora sobre Whisper small en WER o CER para hindi ni para habla con disfluencias.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto no presente en el audio, especialmente en silencios, ruido o segmentos musicales.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de acento, genero, dialecto o registro.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- Sin variantes cuantizadas documentadas: el despliegue en CPU requiere conversion manual y verificacion de compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deep-07/whisper-hindi-small-disfluency-v2
- Paper de referencia de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Paper citado en los tags del repositorio (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Documentacion del pipeline de ASR de transformers: https://huggingface.co/docs/transformers/tasks/asr
