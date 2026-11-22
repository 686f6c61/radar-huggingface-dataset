# Maximilian228/Geode-TTS-Indic

## Resumen

Geode TTS Indic es una colección de siete modelos de síntesis de voz (text-to-speech) para lenguas indias, publicada por el desarrollador Maximilian228 bajo el paraguas de la aplicación Geode. No se trata de un modelo entrenado desde cero, sino de una conversión de los modelos `indic-tiny-tts-*` de Sulabh Katiyar al formato y al grafo de ejecución de sherpa-onnx (runtime Matcha), de modo que puedan ejecutarse en dispositivos sin código nativo adicional. Cada lengua dispone de dos voces (femenina y masculina), seleccionables mediante el identificador de hablante `sid` 0 o 1.

La arquitectura es la de Matcha-TTS: un codificador de texto, un predictor de duraciones y un decodificador de flow-matching con 4 pasos de integración Euler, todo empaquetado en un único grafo ONNX de 36 MB en fp32. La síntesis se completa con un vocoder compartido Vocos a 24 kHz (54 MB en fp32, con una copia int8 opcional de 15 MB). El front-end textual no usa G2P ni eSpeak: el texto se pasa como caracteres tras aplicar el normalizador del paquete original (NFC de Unicode y deletreo de números en la lengua correspondiente).

El interés del proyecto es práctico: ofrece TTS neuronal ligero y offline para bengalí, guyaratí, canarés, maratí, panyabí, tamil y telugu, con licencia CC-BY-4.0 y un tamaño total de repositorio de 0,3 GB. Es relevante para desarrolladores que necesiten voces indias en aplicaciones móviles o embebidas sin depender de servicios en la nube, aunque el modelo no aporta mejoras de calidad sobre los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (encoder de texto, predictor de duraciones, decoder flow-matching con 4 pasos Euler) + vocoder Vocos 24 kHz |
| Parametros totales | no disponible (modelo acústico de 36 MB en fp32; vocoder de 54 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS por caracteres; sin ventana de contexto definida) |
| Tipos de cuantizacion | fp32 (por defecto); int8 opcional para el vocoder (`vocos.int8.onnx`, 15 MB) |
| Idiomas soportados | bn (bengalí), gu (guyaratí), kn (canarés), mr (maratí), pa (panyabí), ta (tamil), te (telugu) |
| Licencia | CC-BY-4.0 (modelos acústicos); vocoder Vocos bajo MIT |
| Formato de pesos | ONNX (`model.onnx` por lengua, `vocos.onnx` compartido, `vocos.int8.onnx` opcional) |

## Arquitectura y entrenamiento

Cada carpeta de lengua contiene un `model.onnx` en fp32 de 36 MB que integra en un solo grafo el encoder de texto, el predictor de duraciones y el decodificador de flow-matching con el bucle Euler desenrollado. La interfaz de entrada sigue el contrato de Matcha en sherpa-onnx (`x, x_length, noise_scale, length_scale, sid`), con la fila de hablante, el idioma y los identificadores de estilo plegados en el grafo. El vocoder es único y compartido por las siete lenguas: Vocos a 24 kHz en fp32 (54 MB), con salidas renombradas al formato que espera sherpa (`mag, x, y`). Existe además una copia int8 de 15 MB que, según el autor, mantiene el CER de ida y vuelta pero reduce la naturalidad (UTMOS aproximadamente -0,15).

No hubo reentrenamiento ni modificación de pesos: la conversión consistió únicamente en trazar los pesos PyTorch originales al layout Matcha de sherpa-onnx. Los modelos fuente son los `indic-tiny-tts-*` de Sulabh Katiyar, entrenados sobre el dataset Rasa de AI4Bharat (CC-BY-4.0), descrito en el artículo *Rasa: Building Expressive Speech Synthesis Systems for Indian Languages in Low-resource Settings* (INTERSPEECH 2024). El front-end textual requiere pasar el texto como caracteres (`GenerationConfig.tokens`) tras aplicar el normalizador `indic_tiny_tts/textnorm` (MIT) del paquete original; no se emplea G2P ni eSpeak.

## Capacidades

- Síntesis de voz neuronal en siete lenguas indias: bengalí, guyaratí, canarés, maratí, panyabí, tamil y telugu.
- Dos voces por lengua (femenina con `sid` 0, masculina con `sid` 1).
- Ejecución completamente offline y on-device mediante sherpa-onnx 2.0.1, sin código nativo adicional.
- Control de la velocidad del habla mediante `length_scale` y de la variabilidad del muestreo mediante `noise_scale`.
- Normalización textual integrada para números deletreados en la lengua correspondiente y Unicode NFC.
- Salida de audio a 24 kHz mediante el vocoder Vocos compartido.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es exclusivamente un modelo de texto a voz.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura por voz de contenidos en lenguas indias: el modelo convierte artículos, noticias o documentación a audio en bengalí, tamil o telugu, adecuado por su tamaño reducido y su licencia permisiva para publicar el audio resultante.
- Accesibilidad en aplicaciones móviles: integrado mediante sherpa-onnx, permite leer pantallas y notificaciones en el propio dispositivo sin conexión, lo que resulta crítico en regiones con conectividad intermitente.
- Asistentes de voz embebidos: el par acústico más vocoder ocupa alrededor de 90 MB en fp32 (o unos 51 MB con el vocoder int8), por lo que cabe en dispositivos de gama baja y en sistemas empotrados.
- Audiolibros y podcasts automatizados: la selección de voz femenina o masculina por `sid` y el ajuste de `length_scale` permiten adaptar el ritmo de narración al contenido.
- Avisos y anuncios públicos multilingües: un mismo pipeline puede generar mensajes en las siete lenguas soportadas reutilizando el vocoder compartido, lo que simplifica el despliegue en administraciones y servicios públicos.
- Investigación en TTS de bajos recursos: sirve como línea base reproducible y ligera para experimentos con las lenguas indias del dataset Rasa, con pesos ONNX listos para evaluar.
- Preprocesado de datos de voz: puede generar muestras sintéticas para aumento de datos en tareas de ASR en estas lenguas, dado el CER de ida y vuelta reportado por el autor.

## Benchmarks y rendimiento

El autor reporta una evaluación de ida y vuelta sobre 30 frases de FLEURS, transcribiendo el audio sintetizado con IndicConformer-600M ASR y comparando el CER del modelo convertido con el de las grabaciones reales:

| Lengua | CER modelo convertido | CER grabaciones reales |
|---|---|---|
| bn (bengalí) | 3,1 | 3,5 |
| gu (guyaratí) | 6,3 | 6,3 |
| kn (canarés) | 3,1 | 4,3 |
| mr (maratí) | 3,1 | 3,8 |
| pa (panyabí) | 4,8 | 5,1 |
| ta (tamil) | 8,5 | 11,9 |
| te (telugu) | 5,9 | 6,4 |

No se han publicado resultados de benchmarks de calidad perceptual (MOS, UTMOS) más allá de la indicación cualitativa de que la variante int8 del vocoder pierde aproximadamente 0,15 puntos de UTMOS. No hay datos de MMLU, HumanEval ni GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño, el modelo acústico (36 MB) y el vocoder fp32 (54 MB) caben holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para despliegues en servidor, una T4 o superior permite atender múltiples peticiones concurrentes.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y también en CPU y en dispositivos móviles.
- Opciones de despliegue: sherpa-onnx 2.0.1 (runtime objetivo), ONNX Runtime directamente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles en la información proporcionada. El decodificador usa 4 pasos de flow-matching, lo que reduce el coste frente a modelos de difusión con más pasos.

## Comparativa con modelos similares

| Modelo | Lenguas indias | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Geode TTS Indic | bn, gu, kn, mr, pa, ta, te | Matcha + Vocos | no aplica | CC-BY-4.0 (vocoder MIT) | ONNX |
| indic-tiny-tts (Sulabh Katiyar) | mismas siete lenguas | Matcha + Vocos (origen) | no aplica | CC-BY-4.0 | PyTorch |
| Rasa (AI4Bharat) | lenguas indias (dataset y sistemas) | no disponible en detalle | no aplica | CC-BY-4.0 | no disponible |

La comparación más directa es con los modelos fuente `indic-tiny-tts-*`, de los que Geode TTS Indic es una conversión sin cambios de pesos: la diferencia es el formato (ONNX frente a PyTorch) y la integración con sherpa-onnx, no la calidad. Frente a sistemas TTS multilingües más grandes no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No se han reentrenado los pesos: la calidad es la de los modelos `indic-tiny-tts-*` originales, sin mejoras atribuibles a esta conversión.
- El front-end no incluye G2P ni eSpeak; es obligatorio aplicar el normalizador `indic_tiny_tts/textnorm` y pasar el texto como caracteres, o la síntesis puede degradarse.
- La variante int8 del vocoder reduce la naturalidad (UTMOS aproximadamente -0,15) y no es la opción por defecto.
- El CER de ida y vuelta es notablemente peor en tamil (8,5) y guyaratí (6,3) que en bengalí, canarés o maratí (3,1), lo que sugiere una calidad desigual entre lenguas.
- Solo cubre siete lenguas indias; no soporta hindi, urdu ni otras lenguas no listadas.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo TTS, el riesgo principal es la reproducción de voces sintéticas con fines de suplantación, para lo que conviene aplicar marcas de agua o avisos en producción.
- La licencia CC-BY-4.0 exige atribución a Sulabh Katiyar y al dataset Rasa (AI4Bharat); el vocoder Vocos es MIT y requiere su propia atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.
- No hay información sobre latencia, throughput ni comportamiento en producción bajo carga concurrente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-TTS-Indic
- Aplicación Geode: https://geode.tifu.xyz
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Modelo fuente bengalí: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali
- Modelo fuente guyaratí: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-gujarati
- Modelo fuente canarés: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-kannada
- Modelo fuente maratí: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-marathi
- Modelo fuente panyabí: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-punjabi
- Modelo fuente tamil: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-tamil
- Modelo fuente telugu: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu
- Vocoder Vocos: https://huggingface.co/charactr/vocos-mel-24khz
- Artículo Rasa (INTERSPEECH 2024): no disponible como enlace directo en la información proporcionada
