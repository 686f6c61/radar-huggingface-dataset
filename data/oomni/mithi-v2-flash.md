# Oomni/mithi-v2-flash

## Resumen

Mithi v2 Flash es un modelo de texto a voz (TTS) desarrollado por Oomni, diseñado específicamente para 11 lenguas de la India y el inglés. Con 99,1 millones de parámetros y un peso de 199 MB en safetensors bf16, se posiciona como una alternativa ligera y desplegable en CPU, orientada a aplicaciones de síntesis de voz multilingüe en el subcontinente indio. El modelo ofrece 10 voces (5 masculinas y 5 femeninas) y genera audio mono a 24 kHz.

La relevancia del modelo radica en su cobertura lingüística: hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, oriya, panyabí, tamil y telugu, un conjunto que rara vez se cubre con un único modelo de código abierto y licencia permisiva. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para productos de accesibilidad, asistentes de voz y sistemas de atención al cliente en la región.

El modelo se construye sobre componentes de código abierto (Maya2-native, Kokoro-82M, indic-bert, misaki) y se distribuye con un script `run.py` que facilita tanto la inferencia por línea de comandos como la integración en Python. No obstante, el autor no ha publicado evaluaciones automáticas ni estudios de escucha (MOS), lo que limita la comparación objetiva con alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en componentes Maya2-native y Kokoro-82M) |
| Parametros totales | 99,1 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa texto frase a frase) |
| Tipos de cuantizacion | bf16 (pesos en safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | Hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, oriya, panyabí, tamil, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) + indic_encoder/ |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se apoya en Maya2-native (Apache 2.0) y Kokoro-82M (Apache 2.0), junto con indic-bert (MIT) como codificador y el normalizador de texto Maya. El pipeline es de text-to-speech y produce audio mono a 24 kHz. El modelo se distribuye en bf16 y está pensado para ejecutarse tanto en GPU como en CPU, con soporte para múltiples hilos.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card indica que el texto largo se procesa frase a frase de forma automática, sin que cada frase tenga visibilidad del resto.

## Capacidades

- Síntesis de voz (text-to-speech) en 11 idiomas: hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, oriya, panyabí, tamil y telugu.
- 10 voces predefinidas: 5 masculinas (Satvik, Anirban, Nakul, Vasant, Siddhant) y 5 femeninas (Charvi, Ahana, Vaidehi, Malini, Jahnavi).
- Cada voz puede hablar los 11 idiomas soportados.
- Salida de audio WAV mono a 24 kHz.
- Procesamiento automático de texto largo mediante segmentación por frases.
- Ejecución en CPU con control del número de hilos (`--threads`) y en GPU si está disponible.
- API de Python (`Mithi.synthesize`, `Mithi.save`) y línea de comandos (`run.py`).
- Normalización de texto para números, fechas, moneda y URLs (limitada a la calidad del normalizador Maya).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Atención al cliente automatizada en lenguas indias**: el modelo puede generar respuestas de voz en hindi, tamil o bengalí para sistemas IVR, con 10 voces que permiten personalizar la identidad sonora del asistente. Su tamaño de 199 MB facilita el despliegue en servidores modestos.
- **Accesibilidad y lectura de contenidos**: conversión de artículos, noticias o documentos a audio en cualquiera de los 11 idiomas, con procesamiento frase a frase que permite manejar textos largos sin requerir contexto extenso.
- **Aplicaciones móviles y de borde**: al ejecutarse en CPU (por ejemplo, en Raspberry Pi o portátiles sin GPU), es adecuado para apps de lectura por voz o asistentes offline en dispositivos con recursos limitados.
- **Generación de audiolibros y pódcasts multilingües**: las 10 voces permiten narrar contenido en varios idiomas y alternar voces para distintos personajes o secciones, con licencia Apache 2.0 para uso comercial.
- **Sistemas de navegación y avisos por voz**: integración en apps de transporte o mapas para emitir instrucciones en la lengua local del usuario, con latencia baja en GPU y aceptable en CPU (aproximadamente 3 s por frase de 15 palabras con 4 hilos en un EPYC 9554).
- **Prototipado rápido de productos de voz**: el script `run.py` y la API de Python permiten integrar TTS en demos y MVPs sin infraestructura compleja, ideal para equipos que necesitan validar ideas en mercados indios.
- **Localización de contenidos educativos**: generación de material audio en múltiples lenguas indias para plataformas de e-learning, con voces masculinas y femeninas que pueden adaptarse al público objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay evaluación automática ni estudio de escucha (MOS). El único dato de rendimiento es la velocidad de inferencia en CPU:

| Hilos de CPU | Tiempo por frase (15 palabras, ~7 s de audio) |
|---|---|
| 1 | ~8 s |
| 4 | ~3 s |

Medido en un servidor con AMD EPYC 9554. No se proporcionan datos de latencia o throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Contexto | Formato |
|---|---|---|---|---|---|---|
| Mithi v2 Flash | 99,1 M | 11 (indias + inglés) | 10 | Apache 2.0 | No disponible | safetensors (bf16) |
| Kokoro-82M | 82 M | Principalmente inglés | Múltiples | Apache 2.0 | No disponible | safetensors |
| Indic-TTS (AI4Bharat) | No disponible | Lenguas indias | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparación se limita a parámetros, licencia y cobertura lingüística.

## Limitaciones y advertencias

- **Expresividad limitada**: la entonación y la emoción son más planas que en habla humana natural, según la propia model card.
- **Velocidad en canarés, malabar, maratí y oriya**: el habla puede resultar algo más rápida de lo natural.
- **Panyabí con las voces Jahnavi o Vasant**: puede sonar menos natural que con otras voces.
- **Pronunciación**: algunas palabras, especialmente nombres raros y préstamos lingüísticos, pueden pronunciarse incorrectamente.
- **Números, fechas, moneda y URLs**: se leen según la calidad del normalizador de texto; pueden producirse errores.
- **Texto largo**: se procesa frase a frase sin contexto entre frases, lo que puede afectar a la coherencia prosódica.
- **Sin evaluación publicada**: no hay puntuaciones automáticas ni estudios MOS, lo que impide valorar objetivamente la calidad frente a alternativas.
- **Licencia Apache 2.0**: permite uso comercial, modificación y redistribución, siempre manteniendo la licencia y los créditos de los componentes de código abierto (Maya2-native, Kokoro-82M, indic-bert, misaki).
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo entrenado para lenguas indias, puede reflejar sesgos de los datos de entrenamiento no especificados.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí en la pronunciación incorrecta de palabras no vistas.

## Enlaces

- [Hugging Face: Oomni/mithi-v2-flash](https://huggingface.co/Oomni/mithi-v2-flash)
- [Maya2-native](https://huggingface.co/maya-research/maya2-native)
- [Kokoro-82M (GitHub)](https://github.com/hexgrad/kokoro)
- [indic-bert](https://huggingface.co/ai4bharat/indic-bert)
- [misaki (GitHub)](https://github.com/hexgrad/misaki)
- [espeak-ng](https://github.com/espeak-ng/espeak-ng)
