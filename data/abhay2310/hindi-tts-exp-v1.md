# Abhay2310/hindi-tts-exp-v1

## Resumen

Hindi Pocket TTS 7M es un modelo de síntesis de voz (text-to-speech) para hindi, desarrollado por el usuario Abhay2310 mediante ajuste fino del modelo inglés Pocket TTS de Kyutai (`english_7m_2026-10`). Se trata de un checkpoint de investigación publicado para documentar un experimento de adaptación lingüística, no de un modelo listo para producción. El autor lo describe explícitamente como un trabajo en curso y advierte de que el reconocimiento automático de las muestras generadas sigue fallando aproximadamente el 47 % de los caracteres en frases no vistas.

La arquitectura reproduce la forma "7M" de Pocket TTS: un transformer causal de 8 capas y anchura 224 que predice tramas de 12,5 Hz de latentes Mimi de 32 dimensiones, con una cabeza de muestreo "drifting" de un paso. El modelo de voz liberado contiene 4,25 M de parámetros y se complementa con un decodificador de códec de 2,6 M de parámetros propiedad de Kyutai, que no se redistribuye en este repositorio. El ajuste fino se realizó sobre aproximadamente 42,8 horas de audio hindi del subconjunto hindi del dataset Rasa de AI4Bharat.

El interés del modelo es doble: por un lado, demuestra que es viable adaptar un TTS inglés de muy pocos parámetros a otro sistema de escritura (devanagari) sustituyendo únicamente el embedding de texto y manteniendo el resto de pesos; por otro, publica curvas de error por paso de entrenamiento con una metodología de evaluación reproducible, algo poco habitual en modelos de este tamaño y en esta fase de desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de 8 capas, anchura 224, predicción de tramas Mimi a 12,5 Hz con cabeza de muestreo "drifting" de un paso |
| Parámetros totales | 4,25 M en el modelo de voz liberado; 6,9 M incluyendo el decodificador de códec de Kyutai (2,6 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente fp32 según el entrenamiento) |
| Idiomas soportados | Hindi (devanagari) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`hindi_pocket_tts_30k.safetensors`) más tokenizador SentencePiece (`hindi_deva_rasa.model`) y `config.yaml` |

## Arquitectura y entrenamiento

El modelo parte de la forma "7M" de Pocket TTS de Kyutai: un transformer causal de 8 capas con anchura 224 que opera sobre latentes del códec Mimi y genera tramas a 12,5 Hz de 32 dimensiones, empleando una cabeza de muestreo "drifting" de un solo paso. La adaptación al hindi consistió en entrenar desde cero un nuevo embedding de texto con 4.000 piezas SentencePiece para devanagari; el resto de componentes, incluida la cabeza de muestreo, se inicializó desde los pesos ingleses y se ajustó finamente. El frontend de texto normaliza la entrada a devanagari puro: convierte números a palabras hindi, normaliza consonantes nasales a anusvara, simplifica la puntuación, añade un punto final y corrige la ortografía de préstamos comunes (sonidos z, f). No admite palabras en inglés.

El entrenamiento utilizó aproximadamente 42,8 horas del subconjunto hindi del dataset Rasa de AI4Bharat, tras conversión a 24 kHz mono, recorte de silencios, filtrado por duración y velocidad de habla, y alineación audio-texto con el modelo CTC hindi `Harveenchadha/vakyansh-wav2vec2-hindi-him-4200`; los latentes Mimi se precalcularon. Se ejecutaron 30.000 pasos (15.000 más una reanudación de otros 15.000) con 64 enunciados por paso, tasa de aprendizaje constante de 2e-4 tras 1.000 pasos de calentamiento, decaimiento EMA de 0,999, pérdida "drifting" con 64 negativos, dropout de texto y prompt de voz de 0,2, y 2×T4 en fp32 durante unas 6-7 horas en total. El prompt de voz es un clip de 5-10 segundos del hablante (24 kHz, mono); los datos de entrenamiento solo contienen una voz femenina y una masculina.

## Capacidades

- Síntesis de voz en hindi a partir de texto en devanagari, con salida de audio a través del códec Mimi de Kyutai.
- Clonación de voz por prompt: acepta un clip de 5-10 segundos del hablante como referencia (solo se han probado las dos voces del conjunto de entrenamiento).
- Normalización de texto de entrada específica para hindi: conversión de números a palabras, normalización de nasales a anusvara, simplificación de puntuación y corrección de préstamos léxicos.
- Generación controlable mediante escala de guía (classifier-free guidance) y temperatura; el autor reporta que la guía de 2,0 mejora la inteligibilidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de síntesis de voz.
- No soporta visión, audio de entrada más allá del prompt de voz, ni otros idiomas distintos del hindi.

## Casos de uso

- Investigación en adaptación cross-lingüe de TTS: sirve como caso de estudio reproducible de cómo un TTS inglés de 7 M de parámetros puede adaptarse a un nuevo sistema de escritura sustituyendo solo el embedding de texto, con curvas de error publicadas paso a paso.
- Generación de material de evaluación y benchmarks: sus muestras y su metodología (transcripción con Whisper large-v3-turbo en modo hindi forzado y cálculo de CER/WER) pueden reutilizarse para construir conjuntos de evaluación de TTS hindi de bajo coste.
- Docencia y divulgación: el tamaño reducido (4,25 M de parámetros) y el entrenamiento en 2×T4 permiten reproducir el pipeline completo en hardware de consumo, lo que lo hace útil para explicar el funcionamiento interno de un TTS moderno.
- Pruebas de concepto de accesibilidad en hindi: para prototipos internos de lectura de texto en devanagari donde la inteligibilidad imperfecta sea aceptable y no haya requisitos de producción.
- Experimentación con prompts de voz: permite estudiar cómo responde un modelo pequeño a distintos clips de referencia de 5-10 segundos, aunque solo se hayan validado dos voces.
- Base para futuros ajustes finos: el checkpoint de 30.000 pasos y su tokenizador de 4.000 piezas pueden servir de inicialización para entrenamientos con más datos (el autor indica que hay una ejecución en curso con unas 114 horas).

## Benchmarks y rendimiento

Evaluación de inteligibilidad sobre 20 frases (16 del split de validación de Rasa más 4 fijas), cada una en 2 voces (40 clips por fila), transcritas con Whisper large-v3-turbo (int8, hindi forzado) y comparadas con el texto de entrada tras normalizar puntuación, nukta y chandrabindu. Ajustes: escala de guía 2,0, temperatura 0,3, pesos EMA. El mismo juez aplicado a grabaciones reales de esas frases da aproximadamente 9 % CER y 20 % WER, que es el mejor resultado alcanzable bajo esta metodología.

| Paso de entrenamiento | Error de carácter (CER) | Error de palabra (WER) | Correlación de longitud |
|---|---|---|---|
| 15.000 | 65,4 % | 78,3 % | 0,94 |
| 17.500 | 58,9 % | 72,5 % | 0,92 |
| 20.000 | 54,3 % | 68,9 % | 0,96 |
| 22.500 | 54,2 % | 67,6 % | 0,93 |
| 25.000 | 52,1 % | 65,6 % | 0,93 |
| 27.500 | 49,2 % | 61,5 % | 0,93 |
| 30.000 | 47,1 % | 61,9 % | 0,94 |

La correlación de longitud mide en qué grado la duración generada sigue a la duración real de cada frase (1,0 = perfecto). El CER descendió en todos los pasos salvo entre 20.000 y 22.500 (plano) y seguía bajando en 30.000, por lo que el entrenamiento no había convergido. Con solo 20 frases y dos voces, las diferencias de uno o dos puntos entre filas contiguas son ruido. La guía (2,0) mejoró el modelo de 15.000 pasos de 72,0 % a 66,2 % de CER frente a sin guía. La pérdida de validación no resultó útil como señal: se mantuvo casi plana (−0,69 a −0,66) mientras el CER caía 18 puntos. Solo se midió inteligibilidad; no hay test de escucha, ni puntuación de similitud de hablante, ni MOS de naturalidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4,25 M de parámetros en el modelo de voz y 2,6 M en el decodificador de códec, la huella es muy reducida y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: el autor entrenó en 2×NVIDIA T4; para inferencia basta una GPU consumer de gama media o incluso CPU, aunque no se publican cifras de latencia.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (menos de 7 M de parámetros en total); no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio usa PyTorch y el código de Kyutai, y requiere descargar el códec Mimi desde `kyutai/pocket-tts` aceptando sus términos y usando un token propio de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Abhay2310/hindi-tts-exp-v1 | 4,25 M (voz) + 2,6 M (códec) | No disponible | Hindi | CC BY 4.0 | Checkpoint de investigación, WIP |
| kyutai/pocket-tts (modelo base) | ~7 M (forma "7M") | No disponible | Inglés | Términos de Kyutai (requiere aceptación) | Publicado por Kyutai |
| Alternativas TTS hindi de mayor tamaño | No disponible | No disponible | Hindi | No disponible | No disponible |

No se dispone en la información proporcionada de otros modelos TTS hindi comparables con especificaciones verificables; la comparación directa más relevante es con el modelo base inglés de Kyutai, del que este checkpoint hereda arquitectura y pesos salvo el embedding de texto.

## Limitaciones y advertencias

- Palabras a menudo incorrectas: cerca de la mitad de los caracteres fallan en frases no vistas (47,1 % CER, 61,9 % WER al paso 30.000), frente al ~9 % CER de grabaciones reales bajo el mismo juez.
- Estado explícito de trabajo en curso: el autor lo publica para documentar el experimento y sus números, no para uso en producción.
- Entrenamiento no convergido: el error seguía bajando al detener el entrenamiento en 30.000 pasos.
- Voces limitadas: los datos solo contienen una voz femenina y una masculina; otras voces no se han probado.
- Frases cortas problemáticas: el autor excluye a propósito "आप कैसे हैं?" de las muestras porque sale cortada.
- Sin soporte de palabras en inglés en la entrada de texto.
- Evaluación incompleta: solo se midió inteligibilidad; no hay test de escucha, similitud de hablante ni MOS de naturalidad.
- Dependencia externa: el códec Mimi no se redistribuye; es necesario aceptar los términos de Kyutai y usar un token propio de Hugging Face, lo que añade una condición adicional al uso.
- La licencia CC BY 4.0 del checkpoint no exime de cumplir los términos del modelo base y del códec de Kyutai.
- Riesgo de sesgo: el corpus Rasa y las dos únicas voces de entrenamiento condicionan el acento, el registro y las características demográficas de la voz generada; no se documenta ningún análisis de sesgo.
- Enlace al código pendiente: la model card contiene un marcador "[FILL IN: GitHub link]" sin rellenar, por lo que el código de entrenamiento y evaluación no está referenciado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhay2310/hindi-tts-exp-v1
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Modelo CTC hindi usado para alineación: https://huggingface.co/Harveenchadha/vakyansh-wav2vec2-hindi-him-4200
- Dataset Rasa de AI4Bharat: no disponible (el autor lo cita por nombre, sin enlace directo en la información proporcionada)
- Repositorio de código: no disponible (marcador "[FILL IN: GitHub link]" sin rellenar en la model card)
