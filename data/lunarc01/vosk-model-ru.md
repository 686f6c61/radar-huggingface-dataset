# LUNARC01/vosk-model-ru

## Resumen

Vosk-model-ru es un modelo de reconocimiento automatico del habla (ASR) para ruso, publicado en Hugging Face por el usuario LUNARC01 bajo licencia Apache 2.0. Se trata de una conversion a formato ONNX del conocido modelo "Vosk Big Russian Model", desarrollado originalmente por Alpha Cephei dentro del ecosistema Vosk y entrenado con el toolkit k2-fsa/icefall. La version declarada en la model card es la 0.54.

El modelo emplea una arquitectura Zipformer2, un transformer convolucional con atencion lineal por bloques que reduce el coste computacional frente a los transformers clasicos manteniendo precision en tareas de reconocimiento de voz. Esta disenado especificamente para inferencia eficiente en CPU y dispositivos de bajos recursos, lo que lo convierte en una opcion practica para transcripcion offline y despliegues en produccion sin GPU.

Su relevancia actual radica en que cubre un idioma con relativamente pocas alternativas open source de calidad (el ruso) y lo hace con un WER declarado del 6,1 % en Common Voice ru, un resultado competitivo para un modelo de tamano contenido. Al estar en formato ONNX, puede ejecutarse con ONNX Runtime, lo que facilita su integracion en aplicaciones de escritorio, moviles y servidores sin dependencias de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transformer convolucional con atencion lineal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Zipformer2, la segunda generacion de la arquitectura Zipformer propuesta dentro del proyecto k2-fsa/icefall. Zipformer combina capas convolucionales con mecanismos de atencion de complejidad lineal y utiliza un esquema de resolucion variable a lo largo de la profundidad de la red: las capas iniciales operan a resolucion temporal alta y las finales a resolucion reducida, lo que disminuye el coste de atencion sin sacrificar capacidad de modelado acustico. Esta diseno esta pensado para obtener una buena relacion precision/eficiencia en tareas de ASR.

El entrenamiento se realizo con el toolkit icefall sobre datos en ruso. La model card no detalla el numero de horas de audio, la composicion exacta del corpus ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. El modelo es un sistema hibrido/conexionista (probablemente con decodificacion basada en transducer o CTC, aunque la model card no lo especifica) orientado a la transcripcion directa de audio a texto. La version publicada en este repositorio es una exportacion a ONNX del modelo original de Vosk, lo que permite su ejecucion con ONNX Runtime.

## Capacidades

- Reconocimiento automatico del habla en ruso: transcripcion de audio a texto en tiempo real o por lotes.
- Inferencia eficiente en CPU: el formato ONNX y la arquitectura Zipformer2 permiten ejecucion sin GPU.
- Compatibilidad con el ecosistema Vosk: puede integrarse con las herramientas y APIs de Vosk para streaming y reconocimiento continuo.
- Procesamiento de audio de entrada: acepta ficheros WAV y flujos de audio en formato compatible con Vosk/ONNX Runtime.
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- Capacidad multilingue limitada exclusivamente al ruso.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ruso: el modelo puede procesar grabaciones de audio y generar transcripciones con un WER declarado del 6,1 %, adecuado para documentacion interna y actas.
- Subtitulado automatico de video en ruso: integrado en pipelines de postproduccion, permite generar subtitulos en tiempo casi real sobre CPU, sin necesidad de GPU dedicada.
- Asistentes de voz para aplicaciones de escritorio o moviles: al ejecutarse en ONNX Runtime, puede embeberse en aplicaciones locales para comandos de voz en ruso sin enviar audio a la nube.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones telefonicas para extraer metricas, palabras clave y cumplimiento, aprovechando la eficiencia en CPU para grandes volumenes.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en directo en entornos con recursos limitados, como aulas o salas de reunion, usando hardware convencional.
- Investigacion en ASR para ruso: servir como baseline o componente en experimentos de reconocimiento de voz, comparacion de arquitecturas o fine-tuning con icefall.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos de audio para hacerlos buscables por texto en sistemas de gestion documental.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Reconocimiento automatico del habla | Common Voice ru | Test WER | 6,1 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en CPU y no requiere GPU.
- GPU recomendadas: no aplica; puede ejecutarse en CPU. En caso de usar GPU, cualquier GPU compatible con ONNX Runtime (CUDA) serviria, pero no es el escenario objetivo.
- Cabe en GPU consumer: si, aunque su despliegue tipico es en CPU; el consumo de memoria es reducido al ser un modelo de ASR de tamano contenido.
- Opciones de despliegue: ONNX Runtime, Vosk (API nativa), integracion via Python con onnxruntime, y potencialmente otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dependeran del hardware y de la configuracion de decodificacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | WER (Common Voice ru) | Licencia | Formato |
|---|---|---|---|---|---|
| LUNARC01/vosk-model-ru (este modelo) | Zipformer2 | Ruso | 6,1 % (declarado) | Apache 2.0 | ONNX |
| Vosk small Russian model | no disponible | Ruso | no disponible | Apache 2.0 | Vosk |
| Whisper large-v3 | Transformer encoder-decoder | Multilingue | no disponible en esta ficha | MIT | PyTorch, ONNX, GGML |
| Wav2Vec2 / XLS-R fine-tuned ru | Transformer | Ruso (fine-tuning) | no disponible | varía | PyTorch |

La comparacion con Whisper large-v3 y modelos Wav2Vec2 fine-tuned no dispone de datos de WER en Common Voice ru en la informacion proporcionada; se indican como alternativas cualitativas. El modelo Vosk small Russian es la variante reducida del mismo ecosistema, pero no se dispone de su WER en esta ficha.

## Limitaciones y advertencias

- Solo soporta ruso; no es multilingue y no puede transcribir otros idiomas.
- El WER del 6,1 % esta declarado por el autor y no ha sido verificado de forma independiente; el rendimiento real puede variar segun la calidad del audio, el acento y el dominio.
- No es un modelo generativo: no puede realizar tareas de lenguaje natural, razonamiento, codigo ni tool calling.
- Riesgo de errores en audio con ruido, solapamiento de hablantes, acentos marcados o vocabulario tecnico fuera del dominio de entrenamiento.
- La model card no detalla la composicion del dataset de entrenamiento, lo que limita la evaluacion de sesgos y cobertura dialectal.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y atribucion.
- Al ser una conversion a ONNX de un modelo Vosk, la compatibilidad con versiones futuras de Vosk u ONNX Runtime no esta garantizada.
- No se dispone de informacion sobre cuantizaciones adicionales ni sobre el tamano exacto de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/LUNARC01/vosk-model-ru
- Vosk (Alpha Cephei): https://alphacephei.com/vosk
- k2-fsa/icefall (toolkit de entrenamiento): https://github.com/k2-fsa/icefall
