# dys-asr/parakeet-tdt-0.6b-unconstrained-soup

## Resumen

parakeet-tdt-0.6b-unconstrained-soup es un modelo de reconocimiento automático del habla (ASR) desarrollado por el proyecto DysASR, especializado en la transcripción de habla disártrica y trastornos del habla. Se trata de un "model soup": un promedio uniforme de los pesos de dos fine-tunes del modelo base nvidia/parakeet-tdt-0.6b-v3 de NVIDIA, ambos entrenados con la misma receta, misma semilla y diez épocas cada uno. El resultado es un único modelo de 627 millones de parámetros, no un ensemble, por lo que el promediado no añade coste en inferencia.

El modelo pertenece a la pista "unconstrained" del Speech Accessibility Project Challenge, ya que uno de sus ingredientes se entrenó con corpus adicionales fuera del desafío (HeyJay! y Project Relate). Su relevancia radica en que aborda un problema de accesibilidad poco cubierto por los ASR comerciales: la transcripción fiable de habla no estándar. La arquitectura es un Transducer (TDT) de la familia Parakeet, con decodificación autorregresiva, y el modelo está entrenado exclusivamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con audio filtrado a 0,5-30 s) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | Inglés |
| Licencia | speech-accessibility-project-dua |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT (Transducer) de NVIDIA, concretamente en la versión v3 del modelo de 0,6B parámetros. A diferencia de los modelos CTC de la misma familia, la decodificación es autorregresiva en lugar de un argmax sobre frames, lo que lo hace sustancialmente más lento en inferencia. El tokenizador de v3 es abrumadoramente de minúsculas: las etiquetas en mayúsculas cuestan 4,06 tokens por palabra frente a 1,67 en minúsculas.

El entrenamiento consistió en un promedio uniforme de pesos (model soup) de dos fine-tunes del mismo modelo base, ambos con la misma receta, misma semilla y diez épocas. El primer ingrediente (all-aug) se entrenó con todas las grabaciones del Speech Accessibility Project; el segundo (unconstrained) añadió HeyJay! (ICPSR 39448) y una exportación de Project Relate con habla atáxica del Reino Unido. El conjunto de entrenamiento resultante contiene 413.442 grabaciones, 920,1 horas y 1.094 hablantes, filtrado a grabaciones de 0,5 a 30 segundos y etiquetas de como máximo 130 tokens. El promedio se realizó en float64 y se convirtió de vuelta a float32; el contador int64 de BatchNorm se propagó como máximo en lugar de promediarse, ya que promediar un contador carece de sentido. El proceso de construcción se ejecutó íntegramente en CPU y verificó la integridad de los tensores recargando el archivo safetensors antes de validar el modelo.

## Capacidades

- Reconocimiento automático del habla (ASR) especializado en habla disártrica y trastornos del habla, incluyendo disartria asociada a Parkinson y ataxia.
- Transcripción de audio en inglés a 16 kHz mono mediante la API de transformers (clase ParakeetForTDT, requiere transformers>=5.9).
- Salida en minúsculas, sin puntuación y con números escritos como palabras, convención heredada de ambos ingredientes.
- Decodificación autorregresiva mediante arquitectura Transducer (TDT).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de transcripción de voz, sin capacidades de lenguaje general.

## Casos de uso

- Sistemas de accesibilidad para personas con disartria: el modelo puede integrarse en aplicaciones de dictado y comunicación asistida para usuarios con trastornos del habla, transcribiendo su voz con una tasa de error notablemente menor que los ASR genéricos gracias a su entrenamiento específico.
- Transcripción clínica en logopedia: permite transcribir sesiones de terapia del habla para su documentación y análisis, con soporte para múltiples etiologías (Parkinson, ataxia, parálisis cerebral, etc.).
- Investigación sobre trastornos del habla: el modelo puede utilizarse como herramienta de anotación automática en estudios que analicen corpus de habla patológica, reduciendo el coste de transcripción manual frente a anotadores humanos.
- Evaluación objetiva de la inteligibilidad: combinado con métricas de WER y CER, el modelo sirve para cuantificar la severidad de la disartria en entornos clínicos o de investigación longitudinal.
- Asistentes de voz adaptados: integración en interfaces de voz para hogares inteligentes o dispositivos móviles, adaptadas a usuarios con habla no estándar que los asistentes comerciales no reconocen.
- Generación de subtítulos para contenido multimedia con habla disártrica: transcripción automática de vídeos, podcasts o material educativo producido por personas con trastornos del habla.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, evaluados sobre 17.582 utterances de 48 hablantes de SAPC2 dev que no aparecen en el entrenamiento, sin modelo de lenguaje y con el mismo normalizador para todas las filas:

| Modelo | WER | CER | Errores de palabra |
|---|---|---|---|
| dys-asr/parakeet-tdt-0.6b-all-aug | 11,09% | 6,79% | 14.088 |
| dys-asr/parakeet-tdt-0.6b-unconstrained | 10,91% | 6,67% | 13.858 |
| **parakeet-tdt-0.6b-unconstrained-soup** | **10,67%** | **6,49%** | **13.550** |

El autor advierte de que no hay una prueba de significación pareada detrás del margen de 0,24 puntos. Con 126.993 palabras de referencia, el error estándar no pareado de un WER es de aproximadamente 0,09 puntos, lo que sitúa el margen cerca de 2,7 errores estándar. Ademas, los numeros de las model cards de los ingredientes (10,73% y 10,52%) no son comparables directamente, ya que provienen del dev pass del bucle de entrenamiento, que aplica un filtro de duracion y puntua 17.319 utterances en lugar de las 17.582 completas. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de ASR, no de un LLM.

## Requisitos de hardware

- El repositorio ocupa 2,5 GB en formato safetensors, lo que corresponde a pesos en fp32 (627M parametros × 4 bytes ≈ 2,5 GB).
- Inferencia en CPU posible: el propio proceso de construccion del modelo se ejecuto integramente en CPU, aunque la decodificacion autorregresiva sera lenta.
- Para inferencia en GPU, una tarjeta con al menos 4 GB de VRAM deberia ser suficiente para fp32; con cuantizacion fp16 bastarian aproximadamente 2 GB.
- Compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Requiere transformers>=5.9, ya que la clase ParakeetForTDT no existe en versiones anteriores.
- La decodificacion autorregresiva es sustancialmente mas lenta que la de los modelos CTC de la misma familia Parakeet.
- No se menciona soporte explicito para vLLM, TGI, llama.cpp u Ollama; la integracion documentada es a traves de la API de transformers.

## Comparativa con modelos similares

| Modelo | Parametros | WER (SAPC2 dev, 48 hablantes) | Licencia | Notas |
|---|---|---|---|---|
| dys-asr/parakeet-tdt-0.6b-unconstrained-soup | 627M | 10,67% | speech-accessibility-project-dua | Model soup de dos fine-tunes |
| dys-asr/parakeet-tdt-0.6b-all-aug | 627M | 11,09% | speech-accessibility-project-dua | Ingrediente 1: solo Speech Accessibility Project |
| dys-asr/parakeet-tdt-0.6b-unconstrained | 627M | 10,91% | speech-accessibility-project-dua | Ingrediente 2: SAPC + HeyJay! + Project Relate |
| nvidia/parakeet-tdt-0.6b-v3 | 627M | no disponible | no disponible | Modelo base de NVIDIA |

No se dispone de datos de WER del modelo base nvidia/parakeet-tdt-0.6b-v3 sobre este conjunto de evaluacion especifico.

## Limitaciones y advertencias

- Idioma: solo ingles. No soporta otros idiomas.
- Licencia restrictiva: la licencia speech-accessibility-project-dua es un acuerdo de uso de datos (DUA) que puede limitar el uso comercial. Los datos del Speech Accessibility Project tienen su propio acuerdo de uso, y HeyJay! y Project Relate tienen terminos separados.
- El conjunto de evaluacion utilizado (48 hablantes de SAPC2 dev) es mas dificil que SAPC2 dev en su conjunto, ya que excluye a los 35 hablantes con Parkinson que tambien aparecen en SAPC1 dev.
- El entrenamiento incluye SAPC1 dev, que comparte 76 de los 124 hablantes de SAPC2 dev, por lo que ni sapc1_dev ni la totalidad de sapc2_dev son conjuntos de prueba justos.
- No hay prueba de significacion pareada detras del margen de mejora de 0,24 puntos de WER.
- La decodificacion autorregresiva es mas lenta que la de los modelos CTC de la familia Parakeet.
- La salida es en minusculas, sin puntuacion y con numeros como palabras, lo que puede requerir post-procesamiento para ciertas aplicaciones.
- Riesgo de alucinacion: como todo modelo ASR, puede producir transcripciones incorrectas en audio de baja calidad o con ruido de fondo.
- No se han publicado resultados sobre otros conjuntos de datos de habla disartrica fuera del Speech Accessibility Project.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-unconstrained-soup
- Ingrediente 1 (all-aug): https
