# codebucketsolutions/asr-wav2vec2-dvoice-wolof-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo `speechbrain/asr-wav2vec2-dvoice-wolof`, un sistema de reconocimiento automático del habla (ASR) para wolof desarrollado originalmente por el equipo de SpeechBrain. La exportación la firma el usuario `codebucketsolutions` y está pensada para ejecutarse sin PyTorch en el servidor de voz `bolo`, de modo que el grafo ONNX reproduce el encoder `EncoderASR` de SpeechBrain con los pesos originales sin modificar. No es una versión oficial de SpeechBrain.

El modelo resuelve la transcripción de audio monoaural a 16 kHz en wolof, un idioma de bajos recursos hablado principalmente en Senegal y Gambia. La arquitectura subyacente es wav2vec 2.0 en su variante XLSR-53 afinada con CTC, sobre la que se apila una red DNN de tres capas. El corpus de entrenamiento es ALFFA Wolof empaquetado por DVoice 2.0, y el autor original reporta un WER del 16,05 % y un CER del 4,83 % sobre el conjunto de test de DVoice 2.0 Wolof.

Su relevancia actual es doble: por un lado, cubre una lengua con muy pocos recursos ASR disponibles; por otro, el formato ONNX con opset 17 y precisión float32 elimina la dependencia de PyTorch en producción, lo que facilita el despliegue en entornos ligeros o embebidos. El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53) afinado + DNN de 3 capas + capa CTC + log-softmax |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable `[1, T]` a 16 kHz) |
| Tipos de cuantizacion | float32 (unico formato publicado en el repo) |
| Idiomas soportados | wolof (`wo`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32) + `tokens.txt` (SentencePiece) |

## Arquitectura y entrenamiento

El grafo exportado corresponde al encoder `EncoderASR` de SpeechBrain: un wav2vec 2.0 con la arquitectura XLSR-53 afinada, seguido de una red DNN de tres capas, la capa CTC y una log-softmax final. La entrada es un tensor float32 de forma `[1, T]` con audio mono a 16 kHz y la salida son log-probabilidades `[1, frames, tokens]` a razón de un frame cada 20 ms. El wrapper de wav2vec 2.0 de SpeechBrain normaliza la forma de onda en el tiempo y la salida del encoder en tiempo y características mediante `layer_norm` sobre la propia forma de la entrada; el grafo ONNX replica ese comportamiento calculando medias y varianzas, de modo que la longitud de la secuencia permanece libre.

El entrenamiento original lo realizó el equipo de SpeechBrain sobre el corpus ALFFA Wolof tal como lo empaqueta DVoice 2.0. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (en ASR CTC no es lo habitual). La innovación técnica destacable de esta exportación es la paridad numérica con el original: sobre el clip de ejemplo `example_wolof.wav` (5,85 s), la diferencia máxima absoluta en log-probabilidades es de 1,70e-03, con la misma mejor ruta y el mismo texto decodificado, comparando SpeechBrain 1.1.2 (torch 2.15.0+cpu) contra ONNX Runtime 1.32.0 en CPU. La decodificación es greedy CTC con blank 0, uniendo las piezas SentencePiece (el carácter `▁` marca inicio de palabra).

## Capacidades

- Reconocimiento automático del habla en wolof a partir de audio mono de 16 kHz.
- Decodificación CTC greedy con vocabulario SentencePiece incluido en `tokens.txt`.
- Ejecución sin PyTorch mediante ONNX Runtime (opset 17, float32).
- Entrada de longitud variable: el grafo no fija la dimensión temporal `T`.
- Salida de log-probabilidades por frame (cada 20 ms), apta para decodificadores externos o rescoring.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: únicamente wolof.
- No incluye modo thinking, visión ni audio de entrada más allá del propio ASR.

## Casos de uso

- Subtitulado automático de contenido audiovisual en wolof: el modelo transcribe audio mono a 16 kHz y devuelve log-probabilidades por frame, lo que permite generar subtítulos con marcas temporales cada 20 ms y umbrales de confianza por segmento.
- Servicios de atención al ciudadano en Senegal y Gambia: integrado en un servidor de voz como `bolo`, permite transcribir consultas habladas en wolof para enrutarlas a un agente o a un sistema de respuestas, sin necesidad de infraestructura PyTorch.
- Digitalización de archivos sonoros y patrimonio oral: la licencia Apache-2.0 y el formato ONNX facilitan procesar lotes de grabaciones históricas en entornos con recursos limitados, ejecutando inferencia en CPU.
- Investigación lingüística sobre wolof: la salida de log-probabilidades por frame permite analizar alineamientos, confianzas y errores fonéticos, y comparar contra el modelo PyTorch original gracias a la paridad documentada.
- Despliegue en dispositivos de borde o entornos sin GPU: al ser un grafo ONNX float32 ejecutable con ONNX Runtime, puede correr en servidores modestos o en hardware embebido con CPU, sin dependencias de CUDA ni de torch.
- Pipeline de evaluación ASR para lenguas de bajos recursos: sirve como línea base reproducible (WER 16,05 %, CER 4,83 % en DVoice 2.0 Wolof) para comparar futuros modelos o técnicas de adaptación al dominio.

## Benchmarks y rendimiento

El autor original reporta sobre el conjunto de test de DVoice 2.0 Wolof:

| Metrica | Valor |
|---|---|
| WER | 16,05 % |
| CER | 4,83 % |

Paridad ONNX frente a PyTorch (clip `example_wolof.wav`, 5,85 s):

| Metrica | Valor |
|---|---|
| Diferencia maxima absoluta en log-probabilidades | 1,70e-03 |
| Misma mejor ruta | si |
| Mismo texto decodificado | si |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) por no ser aplicables a un modelo ASR, ni comparativas numericas con otros sistemas ASR de wolof.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 1,3 GB en float32, por lo que la huella de memoria del grafo ronda ese orden de magnitud, mas el estado de activaciones segun la duracion del audio.
- GPU recomendadas: no se especifican; el autor valida la paridad en CPU con ONNX Runtime 1.32.0, por lo que cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) es opcional.
- Cabe en GPU de consumo: si, dado el tamano del grafo; no se documentan modelos concretos de RTX.
- Opciones de despliegue: ONNX Runtime (validado), servidor `bolo` del autor, y cualquier runtime compatible con ONNX opset 17. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se documenta la comparacion de paridad en CPU contra SpeechBrain 1.1.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| codebucketsolutions/asr-wav2vec2-dvoice-wolof-onnx | no disponible | audio de longitud variable | WER 16,05 %, CER 4,83 % (heredado del original) | Apache-2.0 | ONNX |
| speechbrain/asr-wav2vec2-dvoice-wolof | no disponible | audio de longitud variable | WER 16,05 %, CER 4,83 % (DVoice 2.0 Wolof) | Apache-2.0 | PyTorch (SpeechBrain) |
| Otros ASR para wolof | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva, ya que la informacion disponible no incluye otros sistemas ASR de wolof con datos publicados.

## Limitaciones y advertencias

- Solo reconoce wolof; no es multilingue ni acepta otros idiomas sin reentrenamiento.
- No es una version oficial de SpeechBrain; el mantenimiento y la validez de la exportacion dependen de `codebucketsolutions`.
- El repositorio declara `inference: false` en los metadatos, aunque el grafo es funcional segun la propia model card; conviene verificar el pipeline antes de usarlo en produccion.
- Solo se publica float32; no hay variantes cuantizadas (int8, fp16) en el repositorio, lo que limita optimizaciones de memoria y latencia.
- Riesgo de alucinacion y errores de transcripcion inherente a un WER del 16,05 %; en dominios alejados del corpus ALFFA/DVoice 2.0 el error puede crecer.
- Sesgos no documentados: no se detalla la composicion demografica ni dialectal del corpus de entrenamiento, por lo que pueden existir sesgos hacia determinadas variantes del wolof.
- La decodificacion es unicamente greedy CTC; no se incluye decodificador con modelo de lenguaje, lo que puede penalizar la precision en comparacion con sistemas con LM.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe citar SpeechBrain y el paper del modelo original como pide su model card.
- No hay garantias de soporte ni actualizaciones; el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/asr-wav2vec2-dvoice-wolof-onnx
- Modelo base: https://huggingface.co/speechbrain/asr-wav2vec2-dvoice-wolof
- Servidor de voz `bolo`: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Corpus DVoice 2.0: no disponible en la informacion proporcionada
- Corpus ALFFA Wolof: no disponible en la informacion proporcionada
- Paper del modelo original: no disponible en la informacion proporcionada
