# 10X-Technologies/lyric-lite-v1-hi

## Resumen

Lyric Lite — Hindi es un modelo text-to-speech (TTS) monolingüe para hindi desarrollado por 10X Technologies. Se trata de la variante compacta de la familia Lyric, destilada a partir de Lyric Voice (336M parámetros) hasta un tercio de su tamaño, con 109,5 millones de parámetros y un peso de repositorio de 0,4 GB. Su objetivo es ejecutar síntesis de voz de calidad en dispositivos de gama baja sin GPU ni conexión a internet.

El modelo mantiene una precisión comparable a la de su modelo base: 2,08 % de tasa de error de caracteres (CER) frente al 2,94 % de Lyric Voice, medido sobre 254 clips con las mismas semillas, voz y código. En CPU de un solo hilo funciona 1,8 veces más rápido que el tiempo real y 3,1 veces más rápido que Lyric Voice; en un teléfono Android de gama baja alcanza 3,2 veces el tiempo real.

Es relevante porque demuestra que es posible comprimir un modelo TTS a 110M parámetros manteniendo fidelidad de pronunciación y velocidad de inferencia suficiente para aplicaciones en tiempo real sobre hardware consumer. Su licencia es la Lyric Community License, no estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS, destilado de Lyric Voice) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto por frases; `inference.py` divide en `। . ? !` y comas) |
| Tipos de cuantizacion | no disponible (pesos safetensors; ~420 MB cargados en memoria) |
| Idiomas soportados | hindi (hi) únicamente, en escritura devanagari |
| Licencia | Lyric Community License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El modelo es una destilación de Lyric Voice (336M parámetros) a 109,5M, conservando —según el autor— la misma precisión. La inferencia se apoya en la librería Pocket TTS, instalada desde GitHub como dependencia, y genera audio a 24 kHz. El paquete incluye un prompt de voz predefinido (`voices/ahana.wav`) que se usa por defecto.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La evaluación reportada se realizó sobre 254 clips por modelo con las mismas semillas, clip de voz y código, lo que permite una comparación controlada entre Lyric Lite y Lyric Voice.

## Capacidades

- Síntesis de voz (text-to-speech) monolingüe en hindi a partir de texto en devanagari.
- Salida de audio a 24 kHz en formato WAV.
- Pronunciación de palabras inglesas cuando se escriben en devanagari (no admite inglés en alfabeto latino).
- Manejo de texto largo: `inference.py` segmenta por puntuación (`। . ? !`) y por comas en frases muy largas.
- Limpieza automática de caracteres invisibles y aviso de caracteres no pronunciables.
- Inferencia en CPU sin GPU y sin conexión a internet.
- Voz predefinida incluida (Ahana); similitud de voz ECAPA de 0,617 respecto al prompt.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz en aplicaciones Android de gama baja: el modelo corre 3,2 veces más rápido que el tiempo real en un teléfono económico, lo que permite integrar TTS offline en apps de accesibilidad, lectura de noticias o asistentes locales sin depender de la nube.
- Asistentes de voz embebidos sin conectividad: al no requerir GPU ni internet, encaja en dispositivos IoT, altavoces o terminales de campo donde la latencia de red no es aceptable.
- Audiolibros y narración de contenido largo: la evaluación sobre párrafos de 17 frases reporta 1,7 % de CER, adecuado para narrar textos extensos con segmentación automática por puntuación.
- Atención al cliente telefónica en hindi: la velocidad superior al tiempo real en CPU permite generar respuestas habladas en IVR o chatbots de voz con presupuesto de cómputo mínimo.
- Contenido educativo y divulgación en hindi: conversión de material escrito a audio para plataformas de aprendizaje de bajo coste.
- Prototipado rápido de productos de voz: el script `inference.py` y la descarga vía `hf download` permiten tener una demo funcional en minutos sin infraestructura GPU.
- Localización de interfaces: generación de avisos y mensajes del sistema en hindi dentro de aplicaciones móviles, con la voz Ahana incluida.

## Benchmarks y rendimiento

| Medida | Lyric Lite | Lyric Voice |
|---|---|---|
| CER en frases | 2,08 % | 2,94 % |
| CER en párrafos de 17 frases | 1,7 % | no disponible |
| Fallos del modelo (palabras omitidas, finales cortados, ráfagas, bucles) | 0,4 % (1 de 254 clips) | ver model card de Lyric Voice |
| Similitud de voz al prompt Ahana (ECAPA) | 0,617 | no disponible |
| Velocidad en CPU (1 hilo) | 1,8× tiempo real; 3,1× más rápido que Lyric Voice | referencia |
| Velocidad en Android de gama baja | 3,2× tiempo real | no disponible |
| Tamaño | 418 MB | ~3× mayor |

La evaluación se realizó sobre 254 clips por modelo con las mismas semillas, clip de voz y código. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; carga unos 420 MB de pesos en memoria del sistema.
- GPU recomendadas: no necesarias. El modelo está diseñado para CPU.
- Cabe en cualquier consumer GPU y en CPU de un solo hilo; funciona en teléfonos Android de gama baja.
- Despliegue: script `inference.py` incluido, dependiente de la librería Pocket TTS (instalada desde GitHub). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 1,8× tiempo real en CPU de un solo hilo; 3,2× tiempo real en Android de gama baja; 3,1× más rápido que Lyric Voice en CPU.
- Requisitos de software: Python 3.10 o superior y git.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lyric Lite — Hindi | 109,5M | hindi | 2,08 % | Lyric Community License | Hugging Face |
| Lyric Voice — Hindi | 336M | hindi | 2,94 % | no disponible en la información | Hugging Face |
| Lyric Lite — Telugu | no disponible | telugu | no disponible | Lyric Community License | Hugging Face |
| Lyric Lite — Tamil | no disponible | tamil | no disponible | Lyric Community License | Hugging Face |
| Lyric Lite — Malayalam | no disponible | malayalam | no disponible | Lyric Community License | Hugging Face |
| Lyric Lite — Kannada | no disponible | kannada | no disponible | Lyric Community License | Hugging Face |

No se dispone de datos de modelos TTS de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo hindi. No admite otros idiomas.
- Solo acepta escritura devanagari; el inglés en alfabeto latino no está soportado y los dígitos numéricos tampoco (deben escribirse como palabras).
- El texto sin puntuación debe segmentarse manualmente antes de pasarlo al modelo.
- Riesgo de fallos de síntesis: 0,4 % de clips con palabras omitidas, finales cortados, ráfagas o bucles.
- No se documentan sesgos específicos; al ser un modelo de voz, puede reflejar sesgos del corpus de entrenamiento y del prompt de voz incluido.
- Licencia no estándar (Lyric Community License): es necesario revisar `LICENSE` antes de cualquier uso comercial; no es una licencia open source reconocida.
- No se especifican la arquitectura interna, el dataset de entrenamiento ni el proceso de alineación, lo que limita la auditabilidad.
- Advertencia de producción: la dependencia de Pocket TTS instalada desde GitHub introduce un riesgo de reproducibilidad en despliegues; conviene fijar versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi
- Modelo base Lyric Voice — Hindi: https://huggingface.co/10X-Technologies/lyric-voice-v1-hi
- Lyric Lite — Telugu: https://huggingface.co/10X-Technologies/lyric-lite-v1-te
- Lyric Lite — Tamil: https://huggingface.co/10X-Technologies/lyric-lite-v1-ta
- Lyric Lite — Malayalam: https://huggingface.co/10X-Technologies/lyric-lite-v1-ml
- Lyric Lite — Kannada: https://huggingface.co/10X-Technologies/lyric-lite-v1-kn
- Licencia: https://huggingface.co/10X-Technologies/lyric-lite-v1-hi/blob/main/LICENSE
