# oblivius/vrc-we-voice-de

## Resumen

vrc-we-voice-de es un modelo de deteccion de palabras clave (keyword spotting) para aleman, desarrollado por el usuario oblivius dentro del proyecto vrc-WiredExpressions. Se construye sobre jonatasgrosman/wav2vec2-large-xlsr-53-german, un wav2vec2 grande preentrenado en 53 idiomas y afinado para aleman, que aqui se poda de 24 a 16 capas de transformer y se distribuye en ONNX con cuantizacion dinamica int8 (254 MB). El modelo resuelve un problema concreto: reconocer frases activadoras en audio continuo de 16 kHz con bajas tasas de falsos positivos, en lugar de transcribir habla general.

Su innovacion principal es una arquitectura de dos cabezas CTC sobre un unico encoder: una cabeza de letras (38 tokens) y otra de fonemas (71 tokens, 69 fonemas IPA). Ambas se combinan mediante una regla de fusion documentada en voice.json, de modo que una frase registrada puede detectarse tanto por su grafia como por su pronunciacion. Esto mejora la robustez ante homofonos y variantes de escritura sin incrementar el coste computacional de forma significativa, ya que la cabeza de fonemas es una sola capa lineal sobre el mismo encoder.

El modelo se publica bajo licencia Apache 2.0, con pesos en ONNX int8, y esta pensado para clientes que necesitan activacion por voz en aleman con recursos limitados. La version actual (actualizada en noviembre de 2026) anade la tabla de pronunciacion pron.tsv y el lexico lexicon.tsv de 254.957 palabras, que son los artefactos que habilitan la deteccion por sonido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer) con dos cabezas CTC (letras y fonemas) sobre un encoder compartido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio variable; frames de 20 ms) |
| Tipos de cuantizacion | int8 dinamica (MatMuls) en ONNX |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, enc.onnx, fx.onnx) |

## Arquitectura y entrenamiento

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-german, podado a sus 16 capas inferiores de 24 y afinado con CTC sobre letras. Sobre esa base se anade una segunda cabeza CTC de fonemas (una capa lineal) y se continua el entrenamiento en dos etapas de 10.000 pasos cada una, entrenando conjuntamente encoder, cabeza de letras y cabeza de fonemas. El encoder convolucional de features queda congelado, lo que permite dividir el grafo en fx.onnx (extractor convolucional) y enc.onnx (transformer y cabezas), reutilizables entre modelos de la familia vrc-we-voice en distintos idiomas.

Los datos de entrenamiento suman aproximadamente 3,37 millones de enunciados: Common Voice 19.0 (589.839, CC0), Multilingual Spoken Words Corpus (2.271.401, CC BY 4.0), FLEURS train (2.347, CC BY 4.0), Multilingual LibriSpeech (469.942, CC BY 4.0) y VoxPopuli transcrito (40.677, CC0). De ellos, 3.186.260 tienen etiquetas de fonemas generadas con CharsiuG2P (MIT) y el lexico lexicon.tsv; el resto solo entrena la cabeza de letras. Se incorpora ruido y simulacion de salas mediante MUSAN (CC).

La innovacion destacable es el esquema de fusion de las dos cabezas: cada cabeza puntua la frase en los ultimos 0,6 s; si ambas la detectan, la puntuacion es 0,7 de la de letras mas 0,3 de la de fonemas; si solo una, su puntuacion menos 0,4. Los umbrales de disparo son -0,712 para una palabra y -0,455 para varias, ajustados para igualar la tasa de falsos positivos de la version anterior. Ademas, pron.tsv (30.000 palabras) permite registrar una frase por su sonido y no solo por su grafia, con mejoras reportadas del 30 % al 51 % en homofonos y del 46 % al 61 % en variantes de escritura, sin aumentar los falsos positivos (0,26 por frase-hora).

## Capacidades

- Deteccion de palabras clave y frases activadoras en audio aleman de 16 kHz mono, con normalizacion de media cero y varianza unitaria.
- Reconocimiento de habla a nivel de letras (CTC) con salida de 38 tokens (incluye blank CTC y frontera de palabra).
- Reconocimiento fonetico con 69 fonemas IPA mediante la cabeza de fonemas.
- Deteccion por sonido ademas de por grafia, gracias a pron.tsv y lexicon.tsv.
- Fusion de evidencias de ambas cabezas con umbrales calibrados para control de falsos positivos.
- Inferencia en dos modos: red completa (model.onnx) o por etapas (fx.onnx + enc.onnx) para reutilizar el extractor convolucional entre idiomas.
- No soporta tool calling, function calling, agentes, vision ni audio generativo; es un modelo discriminativo de keyword spotting.

## Casos de uso

- Activacion por voz en asistentes embebidos: el modelo detecta frases activadoras en aleman con umbrales calibrados (-0,712 para una palabra, -0,455 para varias), adecuado para dispositivos con recursos limitados gracias a sus 254 MB int8.
- Control por voz en aplicaciones de escritorio o moviles: al ejecutarse en ONNX Runtime, puede integrarse en clientes nativos que necesitan activacion local sin enviar audio a la nube.
- Sistemas de accesibilidad: activacion de comandos por voz para usuarios con movilidad reducida, con deteccion robusta ante variantes de pronunciacion gracias a la cabeza de fonemas.
- Domotica y automocion: wake words en aleman para encender luces, activar rutinas o controlar el vehiculo, con baja tasa de falsos positivos (0,26 por frase-hora en los conjuntos de evaluacion).
- Filtrado y enrutamiento de audio: detectar palabras clave en streams de llamadas o reuniones para etiquetar o derivar segmentos, usando la ventana de 0,6 s de las cabezas para decisiones rapidas.
- Investigacion en reconocimiento fonetico: la doble salida letras/fonemas y el lexico de 254.957 palabras permiten estudiar alineamiento grafia-sonido y evaluar G2P en aleman.
- Despliegue multilingue en un mismo cliente: al compartir fx.onnx entre modelos vrc-we-voice, un cliente que escuche en varios idiomas ejecuta el extractor convolucional una vez por ventana y solo el transformer por idioma.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la tabla de pronunciacion, medidos sobre conjuntos locales de palabras limpias:

| Metrica | Sin pron.tsv | Con pron.tsv |
|---|---|---|
| Homofonos detectados como otro miembro del grupo, % | 30 | 51 |
| Variantes de escritura detectadas como otro miembro del grupo, % | 46 | 61 |
| Falsos disparos por frase-hora en los conjuntos de palabras | 0,26 | 0,26 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER en Common Voice, etc.) en la informacion disponible. Las frases y palabras de la evaluacion de la version anterior se reportan como sin cambios.

## Requisitos de hardware

- VRAM estimada: el modelo int8 ocupa 254 MB en disco; en inferencia cabe holgadamente en menos de 1 GB de memoria, aunque el consumo exacto depende del runtime y del tamano de la ventana de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que esta pensado para ejecucion en CPU o en GPUs de gama baja.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con los ficheros model.onnx o fx.onnx + enc.onnx; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| vrc-we-voice-de | no disponible (16 capas, podado de wav2vec2-large) | frames de 20 ms, ventana de decision de 0,6 s | de | Apache 2.0 | ONNX int8 |
| jonatasgrosman/wav2vec2-large-xlsr-53-german (modelo base) | wav2vec2-large (24 capas) | frames de 20 ms | de | Apache 2.0 | safetensors / PyTorch |
| vrc-we-voice-en (mismo autor) | no disponible | frames de 20 ms | en | no disponible en la informacion | ONNX |

La comparativa con modelos de keyword spotting de otros autores no esta disponible en la informacion proporcionada. Frente a su modelo base, vrc-we-voice-de reduce el numero de capas (16 frente a 24), anade la cabeza de fonemas y la tabla de pronunciacion, y se distribuye cuantizado en int8 para despliegue en el borde.

## Limitaciones y advertencias

- Solo soporta aleman; no es multilingue.
- Es un modelo de keyword spotting, no un transcriptor general: las salidas CTC estan pensadas para detectar frases registradas, no para transcripcion libre de alta calidad.
- La cabeza de fonemas depende de lexicon.tsv; las frases con palabras fuera del lexico y las de menos de cinco letras se deciden solo por la cabeza de letras.
- Los umbrales de disparo estan calibrados para una tasa concreta de falsos positivos; cambiarlos altera el equilibrio entre sensibilidad y falsas alarmas.
- Riesgo de alucinacion en el sentido de falsos disparos ante audio no objetivo, mitigado pero no eliminado por la fusion de cabezas.
- Los datos de entrenamiento incluyen Common Voice, MLS y VoxPopuli, con posibles sesgos de dominio, acento y calidad de grabacion; el rendimiento en dominios muy distintos (p. ej. audio telefonico ruidoso) no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias propias (CC0, CC BY 4.0, CC BY-SA en el caso de WikiPron via CharsiuG2P) que conviene revisar antes de redistribuir derivados.
- No se documentan latencias, throughput ni consumo de memoria en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-de
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-german
- Modelo hermano en ingles: https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- MUSAN: https://www.openslr.org/17/
