# Ryanjelly/gua-hang-taigi-tts

## Resumen
Guā-hâng TTS 外行 es un modelo de síntesis de voz (text-to-speech) para taiwanés hokkien (taigi, 台語), desarrollado por Ryan Jelinek bajo el identificador Ryanjelly. Convierte texto en caracteres han del taiwanés en audio hablado, usando un front-end basado en reglas que transcribe los caracteres, números, fechas, horas y cantidades monetarias a Tâi-lô antes de la síntesis. El modelo está pensado para ser ligero: 18,3 millones de parámetros para el modelo acústico más 13,5 millones para el vocoder, y funciona en CPU convencional.

La relevancia del proyecto reside en la escasez de voces abiertas para taiwanés hokkien, una lengua minoritaria con pocos recursos de síntesis disponibles. El autor lo publica como primera versión, entrenada desde cero sobre una única voz de estudio, y reconoce explícitamente que se trata de un trabajo personal con limitaciones. La arquitectura se apoya en Matcha-TTS y el vocoder Vocos, con pesos en formato PyTorch.

El modelo se distribuye bajo licencia CC BY-SA 4.0, lo que permite uso comercial con atribución y obligación de compartir bajo la misma licencia. El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico) + Vocos (vocoder) |
| Parametros totales | 18,3 M (modelo acústico) + 13,5 M (vocoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | taiwanés hokkien (nan) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento
El sistema combina un modelo acústico basado en Matcha-TTS, una arquitectura de síntesis por flow matching, con un vocoder Vocos que convierte las representaciones acústicas en forma de onda a 24.000 Hz. El front-end es determinista y basado en reglas: lee los caracteres han y normaliza números, fechas, horas y dinero a Tâi-lô, la romanización oficial del taiwanés. El modelo acústico se entrenó desde cero sobre una única voz de estudio, según indica el autor.

El repositorio incluye un diccionario del Ministerio de Educación de Taiwán (MOE) que se desempaqueta en caché en la primera ejecución. El texto largo se segmenta por signos de puntuación (。！？!?) y saltos de línea, sintetizando cada oración por separado y uniéndolas con 0,3 s de silencio. El autor señala que la mayor parte del código fue escrita con asistencia de Claude (Anthropic), y que el control de calidad lo realizaron hablantes nativos de taigi.

## Capacidades
- Síntesis de voz a partir de texto en caracteres han del taiwanés, con salida de audio a 24.000 Hz en formato float32.
- Transcripción automática a Tâi-lô mediante el front-end de reglas, consultable con la opción `--show-tailo`.
- Normalización de números, fechas, horas y cantidades monetarias a su lectura oral en taigi.
- Dos modos de sandhi tonal: `learned` (aprendido, por defecto) y `rules` (basado en reglas).
- Dos variantes de acento: `moe` y `suisiann`.
- Segmentación automática de texto largo por puntuación y saltos de línea.
- Ejecución en CPU con soporte de hilos configurable (`--threads`, por defecto 4).
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos en taiwanés, con la ventaja de que el modelo corre en CPU y no requiere GPU dedicada.
- Aprendizaje de la lengua: estudiantes de taigi pueden escuchar la pronunciación de frases escritas en caracteres han y comparar con la transcripción Tâi-lô que genera el front-end.
- Señalización y anuncios públicos: generación de avisos hablados en taigi para estaciones, comercios o transporte en zonas donde se habla hokkien taiwanés.
- Doblaje de contenido breve: síntesis de frases para vídeos o pódcast en taigi, aprovechando que el modelo procesa texto segmentado por oraciones.
- Prototipado de asistentes conversacionales: integración en un pipeline de voz para respuestas cortas, dado el bajo coste computacional del modelo.
- Investigación lingüística y preservación: generación de muestras de audio controladas para estudios fonéticos o para documentar variantes de acento (`moe` frente a `suisiann`).
- Pruebas de calidad de ASR: el propio autor usa el modelo para generar audio sintético y evaluar su reconocedor de voz en taigi.

## Benchmarks y rendimiento
El autor publica una evaluación propia basada en reconocimiento automático del audio sintetizado, midiendo la tasa de error de sílabas (menor es mejor). El reconocedor empleado es un ajuste fino propio del modelo Breeze-ASR-26 de MediaTek, que según el autor es prácticamente insensible al tono, por lo que la métrica mide la inteligibilidad de las sílabas, no la corrección tonal.

| Conjunto de prueba | Tomas por frase | Semillas | Métrica |
|---|---|---|---|
| Frases cotidianas | 1 | 1 | tasa de error de sílabas |
| Frases de Common Voice | 3 | 1–3 (agrupadas) | tasa de error de sílabas |

Los valores numéricos concretos de la tabla de resultados no están completos en la información disponible, por lo que no se reproducen. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser aplicables a un modelo TTS.

## Requisitos de hardware
- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no disponibles; el autor indica que solo se ha probado en CPU.
- Cabe en cualquier equipo convencional: el modelo acústico (18,3 M) y el vocoder (13,5 M) suman unos 32 M de parámetros, con un repositorio de 0,2 GB.
- Tiempo de carga: aproximadamente 6 s en CPU según el autor.
- Velocidad: unas 14 veces más rápido que tiempo real en CPU convencional.
- Despliegue: script Python `gua_hang_tts.py` y API `GuaHangTTS`; requiere Python 3.11 y las dependencias de `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Primera ejecución: desempaquetado del diccionario MOE en `cache/`, unos 10 s.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos con otros modelos TTS de taiwanés hokkien en la información proporcionada.

| Modelo | Parámetros | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| Guā-hâng TTS | 18,3 M + 13,5 M | taiwanés hokkien | CC BY-SA 4.0 | Hugging Face |
| Alternativas de TTS en taigi | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo entrenado sobre una única voz de estudio: no permite cambiar de hablante ni clonar voces.
- El autor advierte que es una primera versión y que los números publicados proceden de pruebas pequeñas propias.
- El reconocedor usado para evaluar es casi insensible al tono, por lo que la corrección tonal del audio no está validada por esa métrica.
- El front-end de reglas puede fallar en caracteres polifónicos, préstamos lingüísticos o texto no normalizado; el autor recomienda revisar las salidas.
- Solo se ha probado en CPU; el rendimiento en GPU no está documentado.
- Cobertura limitada a un único idioma (nan); no soporta castellano ni otros idiomas.
- Riesgo de pronunciación incorrecta en nombres propios, siglas y términos extranjeros.
- Licencia CC BY-SA 4.0: el uso comercial exige atribución y que las obras derivadas se compartan bajo la misma licencia.
- Repositorio sin descargas ni validación por parte de la comunidad en el momento de la consulta; conviene evaluar la calidad antes de usarlo en producción.
- El autor reconoce que es un hablante no nativo de taigi y que el control de calidad dependió de hablantes nativos, lo que puede introducir sesgos de pronunciación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts
- README en chino taiwanés: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts/blob/main/README.zh-TW.md
- Muestras de audio: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts/tree/main/samples
- Banner del proyecto: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts/resolve/main/assets/banner.jpg
- Logotipo: https://huggingface.co/Ryanjelly/gua-hang-taigi-tts/resolve/main/assets/logo-512.png
