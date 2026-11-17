# Hebrish/Gefilte

## Resumen

Gefilte (PoC-1) es un ajuste fino (fine-tune) de reconocimiento automatico del habla en hebreo desarrollado por Hebrish (Daniel Rosehill). Se trata de una adaptacion del modelo base `Hebrish/Zipformer2-66M-Streaming-He`, un transductor Zipformer2 en streaming de 66 millones de parametros entrenado con la receta icefall/k2 sobre audio hebreo de ivrit.ai. Gefilte conserva integramente la arquitectura, el tokenizador (SentencePiece BPE de 1.493 tokens) y la configuracion de streaming del modelo base, y unicamente modifica los pesos.

El objetivo declarado del autor es demostrar que unos pocos minutos de grabaciones pueden ensenar al modelo base una palabra que nunca ha visto: su apellido escrito en hebreo, רוזהיל. El modelo esta adaptado al acento no nativo (anglo-oleh) del autor y a su vocabulario concreto, no a una mejora general del reconocimiento en hebreo.

Se trata explicitamente de una prueba de concepto (PoC-1) entrenada con 4,9 minutos de audio de un unico hablante. No forma parte de los modelos de code-switching del proyecto Hebrish y el propio autor desaconseja su uso con otras voces. Su relevancia es metodologica: muestra el flujo completo de adaptacion de un transductor Zipformer2 en streaming con muy pocos datos y su empaquetado para sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 streaming transducer (icefall / k2) |
| Parametros totales | 66M (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunk de 64 frames (1,28 s) con contexto izquierdo de 256 frames |
| Tipos de cuantizacion | int8 (ficheros ONNX `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (state dict de icefall) y ONNX int8 para sherpa-onnx |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2 en streaming implementado con icefall y k2, con perdida RNN-T podada (pruned RNN-T loss). Mantiene la configuracion de streaming del base: chunk de 64 frames (1,28 s) y contexto izquierdo de 256 frames. El tokenizador es un SentencePiece BPE de 1.493 tokens, identico al del modelo base.

El ajuste fino se realizo con la receta `egs/librispeech/ASR/zipformer` de icefall (commit `d7c83d52`), usando ScaledAdam con Eden, learning rate base de 0,002, 12 epocas y batch de 8, sobre una unica NVIDIA L40S (Nebius). Los datos proceden de la pestana `takes` del dataset `danielrosehill/Gefilte-Hebrew-Sentences`: 84 tomas (4,9 minutos) en las que el autor lee frases en hebreo con nikud generado por DictaBERT menaked, con objetivos en hebreo sin puntos y la puntuacion que soporta el vocabulario base (`, . ? ! : ; " ( ) -`). Se reservaron 8 tomas como conjunto de validacion.

## Capacidades

- Reconocimiento automatico del habla en hebreo en modo streaming, con latencia de chunk de 1,28 s.
- Transcripcion de habla con acento no nativo (anglo-oleh) del hablante concreto del ajuste.
- Reconocimiento del apellido רוזהיל en el habla del autor (2 de 2 en las tomas reservadas, frente a 0 de 2 del base).
- Salida de texto sin nikud con puntuacion limitada al vocabulario base.
- Despliegue en sherpa-onnx mediante ficheros ONNX int8 (`model_type="zipformer2"`).
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No es multilingue: solo hebreo.

## Casos de uso

- Demostracion metodologica de adaptacion con pocos datos: sirve como referencia reproducible de como 4,9 minutos de audio permiten ensenar un termino nuevo (un apellido) a un transductor Zipformer2 sin reentrenar desde cero.
- Prueba de concepto de reconocimiento de nombres propios: util para estudiar estrategias de personalizacion de ASR en dominios donde los nombres propios fallan sistematicamente en el modelo base.
- Validacion de pipelines de ajuste fino con icefall/k2: el codigo en `training/gefilte/` y la receta empleada permiten replicar el flujo con otros hablantes o vocabularios.
- Evaluacion de empaquetado ONNX para sherpa-onnx: los ficheros int8 permiten probar el despliegue en entornos de borde con el mismo codigo que el modelo base.
- Investigacion sobre acentos no nativos en hebreo: el modelo ilustra el comportamiento del base frente a un acento anglo-oleh concreto y su mejora tras el ajuste.
- Prototipo de dictado personal para un unico usuario: en el escenario estricto del autor, permite transcribir frases con su apellido y vocabulario prioritario, siempre con la advertencia de que no generaliza a otras voces.

## Benchmarks y rendimiento

Resultados sobre las 8 tomas reservadas (decodificacion greedy en streaming), segun la model card:

| Metrica | Base | Gefilte PoC-1 |
|---|---|---|
| WER | 21,2% | 13,5% |
| CER | 7,7% | 3,0% |
| רוזהיל reconocido | 0 de 2 | 2 de 2 |

El propio autor advierte que solo hay 8 tomas reservadas de un unico hablante y que estas cifras deben interpretarse como una comprobacion de cordura, no como un benchmark. En las 84 tomas de entrenamiento el modelo obtiene un 1,1% de WER, lo que indica memorizacion y no rendimiento generalizable. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamano (66M parametros) y la cuantizacion int8; cabe holgadamente en cualquier GPU consumer, aunque no se proporcionan cifras exactas.
- GPU recomendadas: el ajuste fino se ejecuto en una NVIDIA L40S; para inferencia basta una GPU consumer moderna (por ejemplo, RTX 3060 o superior) o incluso CPU.
- Cabe en GPU consumer: si, dado el tamano del modelo y los ficheros ONNX int8.
- Opciones de despliegue: sherpa-onnx (soporte oficial mediante los ficheros `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` y `tokens.txt`); icefall/k2 para cargar `model.pt`.
- Latencia y throughput: no disponibles; la configuracion de streaming implica chunks de 1,28 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Licencia | Notas |
|---|---|---|---|---|
| Gefilte (PoC-1) | 66M | chunk 64 frames (1,28 s), contexto izquierdo 256 frames | CC BY 4.0 | Ajuste de un hablante, 4,9 min de audio |
| Hebrish/Zipformer2-66M-Streaming-He | 66M | misma configuracion | CC BY 4.0 | Modelo base sin ajustar; WER 21,2% en las tomas reservadas |
| ivrit-ai/zipformer2-66m-streaming-he | 66M | misma configuracion | CC BY 4.0 | Modelo original de Yakov Kolani entrenado con audio de ivrit.ai |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con 4,9 minutos de audio de un unico hablante; no generaliza a otras voces ni a otros acentos.
- El propio autor lo califica de prueba de concepto y no lo recomienda para la voz de terceros.
- Memoriza las 84 tomas de entrenamiento (1,1% de WER), por lo que las metricas de entrenamiento no son representativas.
- La evaluacion se basa en solo 8 tomas reservadas, insuficiente para extraer conclusiones robustas.
- Solo soporta hebreo; no hay capacidades multilingues ni de otro tipo.
- Riesgo de alucinacion y errores en vocabulario fuera del conjunto prioritario (nombres propios, terminos tecnicos).
- La puntuacion de salida esta limitada al vocabulario base; no genera nikud.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero el autor desaconseja su uso en produccion por su naturaleza de PoC.
- No forma parte de los modelos de code-switching del proyecto Hebrish.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Gefilte
- Modelo base: https://huggingface.co/Hebrish/Zipformer2-66M-Streaming-He
- Modelo original de ivrit-ai: https://huggingface.co/ivrit-ai/zipformer2-66m-streaming-he
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/Gefilte-Hebrew-Sentences
- DictaBERT menaked: https://huggingface.co/dicta-il/dictabert-large-char-menaked
- ivrit.ai: https://www.ivrit.ai
- Dicta: https://dicta.org.il
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
