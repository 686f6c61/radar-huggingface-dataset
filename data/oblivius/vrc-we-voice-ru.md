# oblivius/vrc-we-voice-ru

## Resumen

vrc-we-voice-ru es un modelo de deteccion de palabras clave (keyword spotting) para ruso, desarrollado por el usuario oblivius como parte del proyecto vrc-WiredExpressions. Se construye sobre jonatasgrosman/wav2vec2-large-xlsr-53-russian (Apache 2.0), podado a sus 16 capas inferiores de 24, y anade una segunda cabeza de fonemas sobre el mismo codificador, de modo que el modelo transcribe tanto grafemas como fonemas IPA en una unica pasada. Su proposito no es la transcripcion general, sino disparar frases predefinidas con alta precision y bajo indice de falsos positivos, fusionando las puntuaciones de ambas cabezas.

La arquitectura es un transformer wav2vec2 con CTC, con marcos de 20 ms, salida de 39 simbolos para letras y 49 para fonemas (47 IPA mas blank y frontera de palabra). Se distribuye como ONNX con cuantizacion dinamica int8 (254 MB), lo que lo hace desplegable en CPU y en dispositivos de borde sin GPU. El repositorio ocupa 1,0 GB e incluye artefactos auxiliares como un lexico de 96.460 palabras y una tabla de pronunciaciones de 21.559 palabras.

Su relevancia actual radica en el enfoque de dos cabezas: el modelo puede reconocer una frase tanto por su grafia como por su sonido, lo que mejora la robustez ante homofonos y variantes ortograficas (del 32 al 59 por ciento y del 34 al 53 por ciento respectivamente, segun la model card) sin incrementar el coste computacional, ya que la cabeza de fonemas es una sola capa lineal sobre el mismo codificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer) con CTC, dos cabezas (letras y fonemas) sobre un codificador compartido, podado a 16 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (marcos de 20 ms; ventana de audio no especificada) |
| Tipos de cuantizacion | int8 dinamica (MatMuls) en ONNX |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, enc.onnx, fx.onnx); vocabularios en JSON |

## Arquitectura y entrenamiento

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-russian, afinado previamente con CTC sobre letras y podado a las 16 capas inferiores de 24. Sobre esa base se anade una cabeza de fonemas (una capa lineal) y se continua el entrenamiento en dos etapas de 10.000 pasos cada una, entrenando conjuntamente codificador, cabeza de letras y cabeza de fonemas. El codificador convolucional de caracteristicas queda congelado tras el afinado, lo que permite reutilizarlo entre los modelos de la familia vrc-we-voice: fx.onnx y enc.onnx son cortes de model.onnx en ese punto, de modo que un cliente multilingue ejecuta el extractor una sola vez por ventana de audio.

Los datos de entrenamiento suman 514.049 enunciados: Common Voice 19.0 (39.918, CC0), Multilingual Spoken Words Corpus (119.454, CC BY 4.0), FLEURS train (2.062, CC BY 4.0), Russian LibriSpeech SLR96 (57.224, dominio publico) y SOVA RuDevices y RuDevices Audiobooks (296.391, CC BY 4.0). Las etiquetas de fonemas se generan con CharsiuG2P (MIT, entrenado sobre pronunciaciones WikiPron de Wiktionary, CC BY-SA) a traves de lexicon.tsv; 465.036 enunciados disponen de etiqueta fonetica y el resto solo entrena la cabeza de letras. Se incorpora ruido y salas de MUSAN (CC BY 4.0).

La innovacion principal es la fusion de cabezas descrita en voice.json: cada cabeza aporta su mejor puntuacion en los ultimos 0,6 s; si ambas detectan la frase, la puntuacion fusionada pondera 0,7 la de letras y 0,3 la de fonemas; si solo una la detecta, se resta 0,4. El umbral de disparo es -0,653 para una palabra y -0,6 para varias, calibrado para igualar los falsos positivos de la version anterior. Las frases con palabras ausentes del lexico o de menos de cinco letras se deciden solo por la cabeza de letras.

## Capacidades

- Deteccion de palabras clave y frases cortas en ruso, con salida de logits por marco para letras y fonemas.
- Reconocimiento de voz CTC a nivel de caracter (39 simbolos, blank y frontera de palabra).
- Reconocimiento fonetico IPA (47 fonemas, blank y frontera de palabra).
- Fusion de puntuaciones entre cabezas para decidir el disparo de una frase, con umbrales configurables.
- Reconocimiento por sonido ademas de por grafia, mediante pron.tsv (21.559 palabras, 1.505 variantes ortograficas).
- Ejecucion en CPU y dispositivos de borde gracias a la cuantizacion int8 (254 MB).
- Reutilizacion del extractor convolucional (fx.onnx) entre modelos de la familia para clientes multilingues.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo acustico de keyword spotting.

## Casos de uso

- Activacion por voz en asistentes embebidos: el modelo dispara frases de activacion en ruso con umbrales calibrados para minimizar falsos positivos, y su tamano int8 (254 MB) permite ejecutarlo en un Raspberry Pi o un movil sin GPU.
- Control por voz en dispositivos del hogar: frases como encender una luz o ajustar temperatura se registran como palabras clave y se evaluan cada 20 ms, con la fusion de cabezas reduciendo disparos espurios por ruido de fondo.
- Filtrado de audio en pipelines de transcripcion: se usa como primera etapa para detectar segmentos relevantes antes de invocar un ASR completo, ahorrando coste computacional en horas de grabacion.
- Busqueda por voz en archivos de audio: la tabla de pronunciaciones permite localizar una palabra por su sonido aunque el hablante la pronuncie con variantes ortograficas, util en catalogos de podcast o archivos de radio.
- Accesibilidad y comandos para personas con diccion movil: la deteccion por fonemas tolera articulaciones imperfectas que la grafia estandar no cubriria.
- Monitorizacion de palabras clave en centros de llamadas: el modelo puede marcar en tiempo real la aparicion de terminos sensibles o de cumplimiento en conversaciones en ruso.
- Investigacion en fonetica computacional: las dos cabezas permiten comparar la alineacion grafema-fonema sobre el mismo codificador, con salidas por marco exportables en ONNX.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Si incluye metricas internas de evaluacion del keyword spotting:

| Metrica (conjuntos de palabras limpios) | Sin tabla de pronunciacion | Con tabla |
|---|---|---|
| Homofonos reconocidos como otro miembro del grupo, % | 32 | 59 |
| Variantes ortograficas reconocidas como otro miembro, % | 34 | 53 |
| Falsos disparos por frase-hora en los conjuntos de palabras | 0,17 | 0,17 |

La model card indica que las frases y palabras de la evaluacion de la version anterior permanecen sin cambios, y que el umbral de varias palabras se endurecio a -0,6, donde los flujos de no-habla disparan una vez (frente a 105 de la version anterior) sin coste medido en aciertos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el modelo int8 ocupa 254 MB en disco y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) acelera la inferencia pero no es necesaria.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de memoria libre; tambien en CPU y dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion directa en aplicaciones C++/Python via la API de ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| oblivius/vrc-we-voice-ru | no disponible (16 capas, podado) | no disponible | ruso | Apache 2.0 | ONNX int8 |
| jonatasgrosman/wav2vec2-large-xlsr-53-russian | no disponible (24 capas) | no disponible | ruso | Apache 2.0 | safetensors |
| oblivius/vrc-we-voice-en | no disponible | no disponible | ingles | no disponible | ONNX |

El modelo base de jonatasgrosman es un ASR general de ruso, mientras que vrc-we-voice-ru esta especializado en keyword spotting con dos cabezas y cuantizacion int8. vrc-we-voice-en comparte el extractor convolucional (fx.onnx) y el diseno de dos cabezas para ingles, lo que permite despliegues multilingues con un solo extractor. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para ruso; no soporta otros idiomas.
- Es un modelo de keyword spotting, no un ASR general: no debe usarse para transcripcion libre sin validacion adicional.
- La cabeza de fonemas depende de lexicon.tsv y pron.tsv; las palabras ausentes del lexico se deciden solo por la cabeza de letras, lo que reduce la robustez ante homofonos en vocabulario no cubierto.
- Las frases de menos de cinco letras se deciden unicamente por la cabeza de letras.
- Los umbrales de disparo (-0,653 y -0,6) estan calibrados para un regimen concreto de falsos positivos; variaciones en el dominio acustico pueden alterar la tasa de disparo.
- Riesgo de alucinacion inherente a los modelos CTC: pueden emitir secuencias plausibles en audio ruidoso o no vocal.
- Sesgos potenciales derivados de los corpus de entrenamiento (Common Voice, SOVA, FLEURS), cuya composicion demografica no se detalla en la model card.
- La licencia Apache 2.0 permite uso comercial, pero las etiquetas de fonemas derivan de CharsiuG2P, entrenado sobre WikiPron (CC BY-SA); conviene revisar la compatibilidad de esa cadena de licencias en produccion.
- No se publican benchmarks estandar ni latencias, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-ru
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-russian
- Modelo hermano en ingles: https://huggingface.co/oblivius/vrc-we-voice-en
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Russian LibriSpeech (SLR96): https://www.openslr.org/96/
- SOVA datasets: https://github.com/sovaai/sova-dataset
- MUSAN: https://www.openslr.org/17/
