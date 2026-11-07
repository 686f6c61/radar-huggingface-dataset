# Abhay2310/laghu-tts-7m-hindi

## Resumen

Laghu TTS 7M Hindi es un modelo de síntesis de voz (text-to-speech) en hindi, desarrollado por Abhay2310, que parte del modelo inglés Pocket TTS de Kyutai (7M parámetros) y lo adapta al hindi con un nuevo tokenizador en devanagari y un entrenamiento sobre aproximadamente 114 horas de audio en hindi. Su nombre, "laghu" (लघु, "pequeño"), resume su propuesta: un modelo de apenas 6,86 millones de parámetros que habla hindi y que se ejecuta únicamente con ONNX Runtime sobre CPU, sin PyTorch ni GPU.

El objetivo es la velocidad y el tamaño por encima de todo. Según la model card, en pruebas con dos núcleos de CPU devuelve el primer fragmento de audio en 26 ms, frente a los 454 ms del siguiente modelo abierto de hindi más rápido con el que se compara, y el primer sonido audible llega alrededor de los 200 ms (frente a 608 ms). Además, permite clonar una voz a partir de unos pocos segundos de audio.

Es relevante porque demuestra que un TTS de calidad razonable para un idioma concreto puede desplegarse en dispositivos de gama baja, en el navegador o en servidores sin acelerador, con un consumo de memoria mínimo (unos 31 MB de ficheros de modelo para sintetizar y 39 MB adicionales para clonar). La inteligibilidad, medida con reconocedores automáticos, es comparable a la de MMS-TTS de Meta y a grabaciones reales de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con cabeza de flujo (flow head) sobre códecs de Mimi; decodificador Mimi para audio a 24 kHz |
| Parametros totales | 6,86 millones (modelo de habla); ficheros ONNX: 16,3 MB (LM + head) + 11,2 MB (decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de prompt de voz de hasta 5 segundos en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hindi (hi), en escritura devanagari |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`.onnx`), tablas en `.npz`, tokenizador SentencePiece (`.model`) |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces integradas | `female` y `male` (dos hablantes de Rasa) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Laghu es un fine-tune de Kyutai Pocket TTS (modelo inglés de 7M), al que se le sustituye el tokenizador por uno nuevo específico para devanagari. La arquitectura conserva el esquema de Pocket TTS: un transformer autorregresivo que genera códigos de audio y una cabeza de flujo, seguidos del decodificador Mimi de Kyutai (sin cambios) que convierte los códigos en forma de onda a 24 kHz. El modelo de habla ocupa 16,3 MB en ONNX (`lm_step.onnx` y `head.onnx`) y el decodificador 11,2 MB (`decoder.onnx`).

El entrenamiento se realizó sobre aproximadamente 114 horas de voz en hindi, usando los conjuntos de datos ai4bharat/Rasa y ai4bharat/indicvoices_r. La clonación de voz reutiliza el codificador Mimi de Kyutai, exportado a `model/encoder.onnx` (39,1 MB), y una proyección de voz propia; según la model card, las voces generadas por esta vía coinciden con la referencia en PyTorch con una diferencia absoluta máxima de 5×10⁻⁶. El frontend de texto (conversión de dígitos, horas, fechas, dinero, porcentajes y abreviaturas a palabras) es el mismo código que se usó para limpiar el texto de entrenamiento, lo que reduce la discrepancia entre entrenamiento e inferencia. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset más allá de las horas y las fuentes.

## Capacidades

- Síntesis de voz en hindi (devanagari) con salida en streaming: cada fragmento es un array NumPy float32 a 24 kHz reproducible a medida que llega.
- Dos voces integradas (`female` y `male`) y generación de variantes de la misma frase mediante semilla (`--seed N`).
- Clonación de voz a partir de una grabación de pocos segundos (WAV, FLAC, OGG o MP3, cualquier frecuencia de muestreo); el modelo se entrenó con prompts de hasta 5 segundos.
- Normalización de texto en hindi: lectura de dígitos, horas ("10:30 बजे" → "साढ़े दस बजे"), fechas, importes ("₹450" → "चार सौ पचास रुपये"), porcentajes y abreviaturas comunes.
- Ejecución en CPU con ONNX Runtime, sin PyTorch ni GPU; también la clonación.
- Control de guidance mediante CFG (`--cfg 1.0` desactiva el guidance: más rápido, menos preciso).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de voz para clonación.

## Casos de uso

- Lectura por voz en dispositivos de gama baja: el modelo cabe en unos 31 MB y corre en CPU con ONNX Runtime, por lo que puede integrarse en aplicaciones de escritorio o sistemas embebidos con Linux y dos núcleos para leer texto en hindi sin acelerador.
- Asistentes de voz con baja latencia: con 26 ms hasta el primer fragmento y unos 200 ms hasta el primer sonido audible, es adecuado para respuestas habladas en conversaciones interactivas donde la latencia percibida importa.
- Accesibilidad para personas con discapacidad visual: lectura de documentos, noticias o interfaces en hindi en tiempo real, con streaming que permite empezar a reproducir antes de generar la frase completa.
- Audio para aplicaciones de noticias o contenido: generación de versiones habladas de artículos con las dos voces integradas y variantes de entonación mediante semilla, sin coste de GPU.
- Clonación de voz para personalización: un usuario puede grabar unos segundos de su voz y generar audios con ella (por ejemplo, para locuciones personales o audiolibros), siempre con consentimiento explícito del hablante.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño y con licencia CC-BY-4.0, sirve para validar arquitecturas de streaming, frontends de texto en hindi o integraciones ONNX antes de pasar a modelos mayores.
- Sistemas de anuncios y avisos automatizados: lectura de horas, precios y cantidades ya resuelta por el frontend de texto, útil en transporte, comercio o domótica que anuncien información numérica en hindi.

## Benchmarks y rendimiento

La model card describe una evaluación con protocolo preinscrito (`evaluation/PROTOCOL.md`, enmiendas 11 a 13) sobre 100 frases del split de test de FLEURS Hindi (`hi_in`), con la misma entrada de texto para todos los sistemas. Los resultados de inteligibilidad se miden con reconocedores automáticos (CER/WER) y se comparan con MMS-TTS Hindi, Piper, indic-tiny-tts-hindi y grabaciones reales de FLEURS. La información proporcionada no incluye la tabla numérica de CER/WER ni los valores de latencia del resto de sistemas más allá de los citados en el resumen (26 ms frente a 454 ms hasta el primer fragmento; 200 ms frente a 608 ms hasta el primer sonido). No se han publicado en la información disponible los valores completos de los benchmarks; los transcriptos y tiempos están en `evaluation/results/` del repositorio.

| Metrica | Laghu TTS 7M Hindi | Referencia citada |
|---|---|---|
| Primer fragmento de audio (2 núcleos CPU) | 26 ms | 454 ms (siguiente modelo abierto de hindi más rápido comparado) |
| Primer sonido audible | ~200 ms | 608 ms |
| Inteligibilidad (CER/WER) | comparable a MMS-TTS y a grabaciones reales de FLEURS (sin cifras en la información disponible) | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU con ONNX Runtime.
- Memoria en disco: unos 31 MB de ficheros de modelo para sintetizar; 39 MB adicionales si se usa clonación de voz (`encoder.onnx`).
- CPU: la model card cita pruebas con dos núcleos; el runtime usa un hilo para el transformer y otro para el decodificador.
- GPU: no necesaria; no se documentan requisitos ni aceleraciones por GPU (A100, H100, RTX 4090, etc.).
- Cabe en cualquier equipo de consumo, incluidos sistemas embebidos y navegadores con ONNX Runtime, dado el tamaño de los pesos.
- Despliegue: ONNX Runtime con Python (numpy, onnxruntime, sentencepiece, soundfile; scipy para clonación). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia: 26 ms hasta el primer fragmento y ~200 ms hasta el primer sonido audible en dos núcleos de CPU; el throughput no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / prompt | Licencia | Notas |
|---|---|---|---|---|---|
| Laghu TTS 7M Hindi | 6,86 M | hindi | prompt de voz de hasta 5 s | CC-BY-4.0 | ONNX, CPU, streaming, clonación |
| MMS-TTS Hindi (facebook/mms-tts-hin) | no disponible en la información | hindi | no disponible | no disponible en la información | una sola voz; comparado en la evaluación |
| Piper (pratham, priyamvada, rohan) | no disponible en la información | hindi | no disponible | no disponible en la información | tres voces; comparado en la evaluación |
| indic-tiny-tts-hindi (sulabhkatiyar) | no disponible en la información | hindi | no disponible | no disponible en la información | dos voces; comparado en la evaluación |

La información disponible no incluye los parámetros, contextos ni licencias de los modelos comparados; solo se documenta que forman parte del protocolo de evaluación junto con las grabaciones reales de FLEURS.

## Limitaciones y advertencias

- Solo soporta hindi en devanagari; no se documentan otros idiomas ni transliteraciones.
- El prompt de voz para clonación está limitado a unos 5 segundos de entrenamiento; grabaciones más largas se recortan por defecto a los primeros 8 segundos y se cortan en la última pausa.
- Solo hay dos voces integradas (`female` y `male`); la variedad de voces depende de la clonación.
- Riesgo de alucinación o pronunciación incorrecta en texto fuera de dominio, especialmente en números, abreviaturas o nombres propios no cubiertos por el frontend.
- Algunos terminales corrompen el hindi escrito en la línea de comandos; se recomienda usar `--text-file` con UTF-8.
- La clonación de voz exige permiso explícito del propietario de la voz; la model card incluye una sección de uso responsable.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se documentan cláusulas adicionales sobre el uso de voces clonadas ni sobre los datos de entrenamiento (Rasa e indicvoices_r).
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de la inteligibilidad medida con reconocedores automáticos.
- El rendimiento se midió en dos núcleos de CPU; en hardware muy limitado o con otras cargas la latencia puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhay2310/laghu-tts-7m-hindi
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- MMS-TTS Hindi: https://huggingface.co/facebook/mms-tts-hin
- Piper: https://github.com/OHF-Voice/piper1-gpl
- indic-tiny-tts-hindi: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Modelo relacionado del mismo autor: https://huggingface.co/Abhay2310/hindi-tts-exp-v1
