# Abhay2310/laghu-tts-7m-hindi

## Resumen

Laghu TTS 7M Hindi es un modelo de síntesis de voz (text-to-speech) en hindi, de tamano muy reducido, desarrollado por Abhay2310 y publicado en Hugging Face. Se trata de un ajuste fino (finetune) del modelo inglés Pocket TTS de Kyutai, al que se le ha incorporado un tokenizador nuevo para devanagari y que ha sido entrenado con aproximadamente 114 horas de habla en hindi. Su nombre, "Laghu" (लघु, "pequeno"), resume su propuesta: primar velocidad y tamano sobre cualquier otra consideracion.

El modelo cuenta con 6,86 millones de parametros dedicados a la síntesis y se distribuye exclusivamente en formato ONNX, de modo que puede ejecutarse en CPU con ONNX Runtime sin necesidad de PyTorch ni de GPU. Segun la model card, en pruebas con dos nucleos de CPU devuelve el primer fragmento de audio en 26 ms, frente a los 454 ms del siguiente modelo abierto en hindi con el que se compara, y el primer sonido audible llega alrededor de los 200 ms. Ademas, permite clonar una voz a partir de unos segundos de audio.

Su relevancia actual radica en que abre la síntesis de voz en hindi a entornos con recursos muy limitados (dispositivos empotrados, navegadores, moviles de gama baja o servidores sin acelerador), un escenario donde la mayoria de los modelos TTS de calidad requieren GPU. La version cuantizada a int8 ocupa solo 8,8 MB para la parte de síntesis, lo que facilita su integracion en aplicaciones locales y en streaming de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con cabeza de flujo (flow head) y decodificador Mimi (Kyutai) |
| Parametros totales | 6,86 millones (parte de síntesis) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de prompt de voz de hasta 5 s durante el entrenamiento) |
| Tipos de cuantizacion | float32 (por defecto) e int8 (`model_int8/`) |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`lm_step.onnx`, `head.onnx`, `decoder.onnx`, `encoder.onnx`) + `tables.npz`, `meta.json`, `tokenizer.model` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai: un transformer autorregresivo que genera codigos de audio a partir de texto, una cabeza de flujo que modela la distribucion de esos codigos y un decodificador Mimi (sin modificar respecto al original) que convierte los codigos en forma de onda a 24 kHz. La parte de síntesis se distribuye en dos ficheros ONNX (`lm_step.onnx` y `head.onnx`, 16,3 MB en total) y el decodificador en `decoder.onnx` (11,2 MB). El tokenizador es un SentencePiece nuevo para devanagari (`tokenizer.model`), y las voces integradas se almacenan como vectores `.npy` de dos hablantes del corpus Rasa.

El entrenamiento consistio en un ajuste fino sobre el modelo ingles de 7M de parametros usando aproximadamente 114 horas de habla en hindi, con los datasets `ai4bharat/Rasa` e `ai4bharat/indicvoices_r`. La model card no detalla el numero exacto de tokens de texto ni si se aplicaron etapas de RLHF o DPO. Una innovacion destacable es que la clonacion de voz tambien se ejecuta en ONNX Runtime: utiliza el encoder Mimi de Kyutai exportado a `encoder.onnx` (39,1 MB) y, segun el autor, las voces generadas coinciden con la referencia en PyTorch con una diferencia absoluta maxima de 5×10⁻⁶. El modelo admite guidance (clasifier-free guidance) configurable mediante `--cfg`, cuyo valor 1.0 lo desactiva a cambio de menor precision.

## Capacidades

- Síntesis de voz en hindi (devanagari) con salida de audio a 24 kHz en float32.
- Streaming de audio: los fragmentos se generan y reproducen a medida que llegan, sin esperar a la frase completa.
- Normalizacion de texto previa a la síntesis: convierte digitos, horas, fechas, importes monetarios, porcentajes y abreviaturas comunes a palabras (por ejemplo, "10:30 बजे" pasa a "साढ़े दस बजे" y "₹450" a "चार सौ पचास रुपये").
- Clonacion de voz a partir de una grabacion de unos segundos (WAV, FLAC, OGG o MP3, a cualquier frecuencia de muestreo), con ventana configurable (por defecto los primeros 8 s, recortada en la ultima pausa).
- Dos voces integradas: `female` y `male`.
- Variaciones de rendition mediante semilla (`--seed N`) para obtener interpretaciones distintas del mismo texto.
- Ejecucion en CPU sin PyTorch ni GPU, unicamente con ONNX Runtime.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de entrada mas alla de la clonacion.

## Casos de uso

- Atencion al cliente por voz en hindi: el modelo puede sintetizar respuestas de un asistente telefonico o de un chatbot en tiempo real gracias a su latencia de primer fragmento de 26 ms y a su ejecucion en CPU, lo que abarata el despliegue en centros de contacto con muchos canales concurrentes.
- Lectura de notificaciones y contenidos en aplicaciones moviles: al ocupar 8,8 MB en int8 y no requerir GPU, puede embeberse en una app Android o iOS para leer en voz alta noticias, mensajes o articulos, incluso sin conexion.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla o dispositivos de asistencia que funcionan con hardware modesto, donde un TTS basado en GPU resultaria inviable.
- Sistemas de megafonia y avisos automatizados: generacion de anuncios en hindi (horarios, precios, incidencias) en estaciones, aeropuertos o comercios, con normalizacion automatica de horas e importes monetarios.
- Clonacion de voz para audiolibros y contenido editorial: a partir de unos segundos de grabacion del locutor, se puede generar un audiolibro completo en hindi manteniendo el timbre de la voz, con la salvedad de obtener el consentimiento explicito del propietario.
- Asistentes de voz para dispositivos IoT y empotrados: altavoces inteligentes, electrodomesticos o terminales de bajo consumo que necesitan una voz sintetica local sin depender de la nube.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install -r requirements.txt` y ejecutarse con un script (`speak.py`), permite validar flujos de voz en hindi en minutos dentro de un pipeline de desarrollo.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), ya que no aplican a un modelo TTS. Los datos de rendimiento disponibles son de latencia e inteligibilidad:

| Metrica | Laghu TTS 7M Hindi | Siguiente modelo abierto en hindi comparado |
|---|---|---|
| Primer fragmento de audio (2 nucleos de CPU) | 26 ms | 454 ms |
| Primer sonido audible | ~200 ms | 608 ms |
| Inteligibilidad (reconocedores) | comparable a MMS-TTS y a grabaciones reales | no disponible |
| Tamano de la parte de síntesis (float32) | 31 MB | no disponible |
| Tamano de la parte de síntesis (int8) | 8,8 MB | no disponible |

El autor indica que la version int8 no presenta cambios medibles en inteligibilidad ni en velocidad respecto a la float32. No se han publicado resultados de benchmarks en la informacion disponible mas alla de estos datos.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU ni de PyTorch.
- VRAM: no requiere VRAM; el modelo se ejecuta en memoria RAM. La parte de síntesis ocupa 31 MB en float32 y 8,8 MB en int8; la clonacion anade 39,1 MB (float32) o 10,5 MB (int8) para el encoder.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. En la model card se mencionan pruebas con dos nucleos de CPU.
- Cabe en cualquier GPU de consumo, pero no es su objetivo; su ventaja es funcionar sin ella.
- Opciones de despliegue: ONNX Runtime (libreria `onnxruntime`), con scripts `speak.py` y `clone.py`; el runtime propio `runtime_onnx.py` expone `OnnxTTS` y `generate_audio_stream` para streaming en Python.
- Latencia y throughput: primer fragmento en 26 ms y primer sonido audible en ~200 ms con dos nucleos de CPU, segun el autor. El throughput completo no se detalla en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Idiomas | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Laghu TTS 7M Hindi | 6,86 M | prompt de voz hasta 5 s | hindi | CC-BY-4.0 | CPU, ONNX Runtime |
| Meta MMS-TTS | no disponible en la informacion | no disponible | multilingue (incluye hindi) | no disponible en la informacion | requiere framework de deep learning |
| kyutai/pocket-tts (modelo base) | 7 M | no disponible | ingles | no disponible en la informacion | ONNX / CPU |
| Modelo abierto en hindi comparado en la model card | no disponible | no disponible | hindi | no disponible | no disponible |

La comparativa se limita a los datos citados en la model card: el autor situa a Laghu TTS como mas rapido que el siguiente modelo abierto en hindi (26 ms frente a 454 ms hasta el primer fragmento) y con inteligibilidad comparable a MMS-TTS. No se dispone de cifras de parametros, contexto ni licencia de los alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta hindi; no es multilingue y no debe esperarse calidad en otras lenguas.
- El modelo esta optimizado para velocidad y tamano, no para maxima naturalidad; el autor recomienda consultar la seccion de evaluacion y limitaciones de la model card para valorar la calidad.
- Riesgo de alucinacion o pronunciacion incorrecta en textos con terminologia tecnica, nombres propios o cifras no cubiertas por la normalizacion.
- La clonacion de voz exige el consentimiento explicito del propietario de la voz; un uso indebido puede vulnerar derechos de imagen y privacidad.
- La ventana de prompt de voz durante el entrenamiento es de hasta 5 segundos; grabaciones mas largas se recortan por defecto a los primeros 8 segundos.
- Algunos terminales corrompen el hindi escrito en la linea de comandos; se recomienda usar `--text-file` con un fichero UTF-8.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y respetar los terminos de la licencia.
- No dispone de tool calling, agentes ni capacidades multimodales de entrada.
- El modelo base es un ajuste fino de kyutai/pocket-tts; conviene revisar las condiciones del modelo original en caso de redistribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhay2310/laghu-tts-7m-hindi
- Repositorio de Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Dataset Rasa (AI4Bharat): https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R (AI4Bharat): https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Papers citados en la model card (identificadores arXiv): 2607.18662, 2509.06926, 2410.00037, 2409.05356, 2205.12446, 2111.03945, 2203.16512, 2305.13516
- Muestras de audio: https://huggingface.co/Abhay2310/laghu-tts-7m-hindi/resolve/main/samples/female_1.wav (y equivalentes `male_1.wav`, `female_2.wav`, `male_2.wav`, `female_3.wav`, `male_3.wav`)
