# naot97/gipformer1.5-68M-lifemate-alllabelled-tts1

## Resumen

Gipformer 1.5 68M RNN-T fine-tuned for LifeMate es un modelo de reconocimiento automatico del habla (ASR) en vietnamita, desarrollado por el usuario naot97 a partir del modelo base g-group-ai-lab/gipformer1.5-68M-rnnt. Se trata de un ajuste fino completo orientado a peticiones de asistente de voz en vietnamita, entrenado sobre todos los clips etiquetados del split de entrenamiento de la competicion Zalo AI Challenge 2026 mas 1.146 clips sinteticos generados por TTS, sumando un total de 6.181 clips. El modelo emplea la arquitectura Zipformer con decodificacion RNN-T (transducer) y se distribuye en formato ONNX para su uso con sherpa-onnx.

Con 68 millones de parametros, es un modelo compacto disenado para inferencia eficiente en entornos con recursos limitados. Su relevancia actual radica en que proporciona una solucion de ASR especializada en un dominio concreto (asistente de voz) para vietnamita, un idioma con menos recursos que el ingles o el castellano, y lo hace con una licencia MIT que permite uso comercial sin restricciones significativas.

El modelo se publica como el ultimo checkpoint del entrenamiento, sin conjunto de validacion reservado, por lo que no existe una cifra honesta de WER para este modelo concreto. El autor indica que la referencia mas cercana es el modelo hermano gipformer1.5-68M-lifemate-tts1, que reporto un WER de 11,1% en el subconjunto val_unseen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con decodificacion RNN-T (transducer) |
| Parametros totales | 68 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en float) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx) y PyTorch (pytorch/last.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Zipformer, una variante de transformer eficiente para reconocimiento del habla implementada en el framework icefall, con decodificacion RNN-T (transducer). El modelo base es g-group-ai-lab/gipformer1.5-68M-rnnt (revision dd9227d), sobre el que se realizo un ajuste fino completo. La exportacion ONNX se genero con el script zipformer/export-onnx.py de icefall, produciendo los tres componentes del transducer (encoder, decoder y joiner) junto con tokens.txt y bpe.model para su uso con sherpa-onnx.

El entrenamiento se realizo sobre todos los clips etiquetados del split de entrenamiento de la competicion Zalo AI Challenge 2026 (peticiones mas recientes y turnos de historial del usuario) mas 1.146 clips sinteticos TTS (tts-v1), totalizando 6.181 clips. La receta empleo batch de 1 con acumulacion de gradiente de 4, tasa de aprendizaje constante de 2e-5, 3 epocas (4.635 pasos), aumentacion de velocidad, ganancia, ruido y padding, y SpecAugment con 2 mascaras de frecuencia de hasta 15 bins y hasta 4 mascaras temporales con probabilidad 0,8. Los objetivos son BPE en mayusculas con numeros escritos con letras. Se libera el ultimo checkpoint, sin conjunto de validacion reservado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en vietnamita para peticiones de asistente de voz.
- Transcripcion de utterances individuales con salida en mayusculas y sin puntuacion.
- Decodificacion mediante modified beam search con max_active_paths configurable (4 en el ejemplo del autor).
- Manejo de audio a 16 kHz con 80 dimensiones de caracteristicas (feature_dim=80).
- Integracion con sherpa-onnx mediante OfflineRecognizer.from_transducer.
- Uso de objetivos BPE con numeros escritos con letras, lo que facilita la normalizacion de cifras en la transcripcion.
- No soporta tool calling, function calling, agentes, vision, audio mas alla de ASR ni modo thinking.

## Casos de uso

- Asistentes de voz en vietnamita: el modelo transcribe peticiones de usuario en un dominio de asistente domestico, adecuado por su entrenamiento especifico sobre peticiones de LifeMate y su bajo coste computacional de 68M parametros.
- Transcripcion de comandos de voz en dispositivos embebidos: su tamano compacto y exportacion ONNX permiten ejecucion en CPU o dispositivos de borde mediante sherpa-onnx, sin necesidad de GPU.
- Subtitulado o transcripcion de audio en vietnamita en aplicaciones de mensajeria o notas de voz, con salida en mayusculas que puede normalizarse a minusculas para presentacion.
- Preprocesamiento de voz para pipelines de procesamiento del lenguaje natural en vietnamita: la transcripcion ASR alimenta etapas posteriores de comprension o busqueda.
- Prototipado rapido de sistemas de reconocimiento del habla en vietnamita gracias a la licencia MIT y a los archivos ONNX listos para usar con sherpa-onnx.
- Evaluacion comparativa de recetas de ajuste fino ASR en vietnamita: el modelo sirve como referencia de un fine-tune completo sobre un corpus de competicion con aumentacion y SpecAugment.
- Integracion en aplicaciones de accesibilidad para hablantes de vietnamita que requieran dictado por voz en tiempo real o cuasi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto. El autor indica que no existe un WER honesto porque se libera el ultimo checkpoint sin conjunto de validacion reservado. La referencia mas cercana es el modelo hermano naot97/gipformer1.5-68M-lifemate-tts1, que reporto un WER de 11,1% en el subconjunto val_unseen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 68M parametros en float ONNX, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, e incluso puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU y dispositivos de borde.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: sherpa-onnx (OfflineRecognizer.from_transducer), con los archivos encoder.onnx, decoder.onnx, joiner.onnx y tokens.txt; el estado PyTorch en pytorch/last.pt permite reexportar o continuar el entrenamiento con icefall.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naot97/gipformer1.5-68M-lifemate-alllabelled-tts1 | 68M | no disponible | WER no disponible (referencia 11,1% en val_unseen del modelo tts1) | MIT | Hugging Face, ONNX + PyTorch |
| naot97/gipformer1.5-68M-lifemate-tts1 | 68M | no disponible | WER 11,1% en val_unseen | MIT | Hugging Face |
| g-group-ai-lab/gipformer1.5-68M-rnnt | 68M | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

## Limitaciones y advertencias

- No dispone de un WER honesto medido, ya que se libera el ultimo checkpoint y no queda conjunto de validacion reservado; el 11,1% de val_unseen corresponde al modelo hermano tts1, no a este.
- La salida es en mayusculas y sin puntuacion; es necesario normalizarla a minusculas y anadir puntuacion para su presentacion.
- El modelo esta especializado en vietnamita y en el dominio de peticiones de asistente de voz; su rendimiento fuera de ese dominio o idioma puede degradarse.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no representados o vocabulario fuera del corpus de entrenamiento.
- Sesgos potenciales derivados de la composicion del corpus de la competicion y de los clips sinteticos TTS, que pueden no reflejar la variabilidad real del habla.
- La licencia MIT permite uso comercial sin restricciones significativas, pero el modelo base g-group-ai-lab/gipformer1.5-68M-rnnt debe verificarse por si tuviera condiciones adicionales.
- Al ser un modelo ASR por utterance, no gestiona contexto conversacional largo de forma nativa; el historial debe manejarse en la capa de aplicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naot97/gipformer1.5-68M-lifemate-alllabelled-tts1
- Modelo base: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- Modelo hermano de referencia: https://huggingface.co/naot97/gipformer1.5-68M-lifemate-tts1
- Framework icefall: https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
