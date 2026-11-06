# ahdrage/norwegian-parakeet

## Resumen

norwegian-parakeet es un modelo de reconocimiento automático del habla (ASR) especializado en noruego bokmål, desarrollado por el usuario ahdrage. Se trata de un ajuste fino de moondream/parakeet-ultra, que a su vez es un post-entrenamiento del NVIDIA Parakeet TDT 0.6B v3. El modelo resuelve el problema de la transcripción de voz a texto en noruego con licencias abiertas, un nicho con pocas alternativas de calidad y con restricciones de uso comercial.

La relevancia del modelo reside en su enfoque de datos: se ha entrenado exclusivamente con audio de licencia abierta, aproximadamente 1.770 horas únicas procedentes de corpus como NbAiLab/NPSC, Google FLEURS y Sprakbanken/nb_samtale. Emplea una arquitectura Parakeet TDT (Token-and-Duration Transducer) con 627 millones de parámetros, decodificación greedy sin modelo de lenguaje externo y salida con mayúsculas y puntuación.

El modelo se distribuye con pesos en safetensors bajo licencia CC BY 4.0, mientras que el código de entrenamiento y preparación de datos está disponible en GitHub bajo Apache-2.0. Está pensado para clips de hasta 30 segundos y ofrece resultados competitivos en varios conjuntos de evaluación noruegos, con WER que van del 3,1 % en Tuva al 17,7 % en conversación espontánea (NB Samtale).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), transformer |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de hasta ~30 s de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | noruego bokmål (nb, no) |
| Licencia | CC BY 4.0 (pesos); Apache-2.0 (codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT, un transductor (transducer) que predice conjuntamente tokens y duraciones, heredada de NVIDIA Parakeet TDT 0.6B v3 y post-entrenada por moondream. El ajuste fino entrena la totalidad de los 627 millones de parámetros con AdamW, decaimiento coseno y 500 pasos de calentamiento, en lotes de 64 segundos de audio con autocast bf16. Se mantienen las estadísticas preentrenadas de BatchNorm y se desactiva layer-drop, ya que con lotes pequeños las estadísticas de batch provocaban una explosión de la pérdida de ~5 a ~3.000. No se aplica SpecAugment.

El entrenamiento se organiza en cuatro pasadas sucesivas con tasas de aprendizaje decrecientes (5e-5, 1,5e-5, 5e-6 y 3e-6), reponderando las fuentes más pequeñas y limpias en las pasadas intermedias y dando peso al habla conversacional en la última. Los objetivos son las transcripciones originales con mayúsculas y puntuación. Se filtran clips de más de 30 segundos y aquellos cuya transcripción no encaja con la duración del audio; los clips de NorGovPCC y Tuva se validan además contra un modelo de referencia (CER ≤ 0,3, o 0,4 con dígitos). Se corrige un problema del tokenizador que perdía el límite de palabra antes de palabras que empiezan por dígito, y se implementa una pérdida TDT de bajo consumo de memoria que evita materializar la salida conjunta (frames × tokens × 8.193) en float32.

## Capacidades

- Transcripción de voz a texto en noruego bokmål con salida en mayúsculas y puntuación.
- Decodificación greedy sin modelo de lenguaje externo, lo que simplifica el despliegue.
- Manejo de dígitos y números en la transcripción gracias a la corrección del límite de palabra del tokenizador.
- Procesamiento de clips de hasta aproximadamente 30 segundos de audio a 16 kHz mono.
- Reconocimiento de habla leída, espontánea y conversacional, con degradación controlada en esta última.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.
- Capacidad multilingüe limitada al noruego (nb, no).

## Casos de uso

- Transcripción de reuniones y entrevistas en noruego: el modelo genera texto punteado y con mayúsculas directamente, lo que reduce el postprocesado; requiere trocear el audio en segmentos de hasta 30 segundos.
- Subtitulado automático de contenido audiovisual noruego: su WER del 3,1 % en habla leída (Tuva) y del 4,2 % en NST lo hacen adecuado para material locutado y de estudio.
- Archivado y búsqueda de audio en instituciones públicas: útil para corpus como Stortinget (debates parlamentarios) y NorGovPCC, aunque con la advertencia de que las transcripciones editadas de referencia inflan el WER.
- Investigación lingüística y sociolingüística: permite transcribir grandes volúmenes de habla espontánea (NB Samtale) para análisis de dialectos y fenómenos conversacionales, con la cautela de su mayor tasa de error en registro informal.
- Despliegue en producción con requisitos de licencia abierta: al estar entrenado solo con datos de licencia abierta y distribuirse bajo CC BY 4.0, encaja en productos comerciales que exigen trazabilidad de datos.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real de conversaciones para personas con discapacidad auditiva, usando decodificación greedy sin LM externo para minimizar latencia.
- Creación de datasets de voz etiquetados: el modelo puede usarse para preanotar audio noruego y acelerar la construcción de corpus, dado su equilibrio entre precisión y coste computacional (0,6B parámetros).

## Benchmarks y rendimiento

WER (%) con normalización de norsk-asr (minúsculas, sin puntuación) sobre los conjuntos de test completos, decodificación greedy, incluyendo enunciados con dígitos.

| Conjunto de test | Clips | Horas | WER | CER |
|---|---:|---:|---:|---:|
| Tuva (3 hablantes reservados) | 482 | 0,5 | 3,1 | 0,9 |
| NST validation | 1.500 | 2,7 | 4,2 | 1,2 |
| NPSC test | 5.518 | 11,0 | 6,1 | 2,2 |
| FLEURS Norwegian test | 357 | 1,3 | 7,4 | 2,3 |
| Stortinget validation | 697 | 5,0 | 11,7 | 6,8 |
| NorGovPCC (reservado) | 1.157 | 8,0 | 12,5 | 6,9 |
| NB Samtale (conversación espontánea, hablantes reservados) | 4.137 | 8,2 | 17,7 | 8,8 |

Progresión por pasadas de entrenamiento (WER %):

| Conjunto | Pasada 1 | Pasada 2 | Pasada 3 | Pasada 4 (final) |
|---|---:|---:|---:|---:|
| Tuva | 3,2 | 3,1 | 3,1 | 3,1 |
| NST | 4,6 | 4,2 | 4,2 | 4,2 |
| NPSC | 7,3 | 6,3 | 6,2 | 6,1 |
| FLEURS | 8,1 | 7,9 | 7,8 | 7,4 |
| Stortinget | 12,0 | 11,8 | 11,7 | 11,7 |
| NorGovPCC | 13,0 | 12,6 | 12,5 | 12,5 |
| NB Samtale | 19,3 | 18,1 | 17,8 | 17,7 |

No se han publicado comparaciones directas con otros modelos ASR noruegos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 627 millones de parámetros, en fp16/bf16 se requieren aproximadamente 1,3-1,5 GB solo para pesos; contando activaciones y buffers de decodificación, un entorno de 2-4 GB de VRAM es suficiente para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A10, A100 o H100. Para despliegues de alto rendimiento, A100/H100 permiten mayor paralelización de lotes.
- Cabe en GPU de consumo: sí, en tarjetas de gama media como RTX 3060 o superiores, e incluso en GPUs integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: transformers con `ParakeetForTDT` y `AutoProcessor` es la vía documentada. No se especifican soportes para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de decodificación greedy sin modelo de lenguaje externo sugiere una latencia baja en comparación con sistemas con LM de rescoring.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | WER noruego |
|---|---:|---|---|---|---|
| ahdrage/norwegian-parakeet | 627 M | clips ~30 s | nb, no | CC BY 4.0 | 3,1-17,7 % según conjunto |
| moondream/parakeet-ultra (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| NVIDIA Parakeet TDT 0.6B v3 (origen) | ~600 M | clips ~30 s | inglés principalmente | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo solo procesa clips de hasta aproximadamente 30 segundos; grabaciones más largas deben trocearse previamente y este escenario no se ha probado.
- El WER en conversación espontánea es notablemente alto (17,7 % en NB Samtale), con errores frecuentes en formas dialectales, palabras funcionales omitidas y risas marcadas como "heh" en la referencia.
- En FLEURS los errores se concentran en nombres extranjeros, préstamos y variantes ortográficas de la referencia.
- Las transcripciones de referencia de Stortinget y NorGovPCC están editadas (se omiten vacilaciones y palabras menores), lo que establece un suelo artificial en el WER de esos conjuntos.
- Tuva es un conjunto muy pequeño (0,5 h, 3 hablantes), por lo que su métrica varía mucho entre ejecuciones.
- El split de test de NorGovPCC no se filtró, a diferencia del de entrenamiento.
- Riesgo de alucinación: no documentado explícitamente, pero al ser un modelo ASR sin LM externo, el riesgo principal es la omisión o sustitución de palabras en audio ruidoso o con acentos no vistos.
- Sesgos: no se documentan análisis de sesgo por género, edad o dialecto; la cobertura de dialectos depende de los corpus de entrenamiento.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución; el código de entrenamiento es Apache-2.0.
- Solo soporta noruego bokmål; no se ha validado para nynorsk ni para otras lenguas escandinavas.
- No se dispone de información sobre cuantizaciones oficiales ni sobre despliegue en motores distintos de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahdrage/norwegian-parakeet
- Repositorio de código y receta de entrenamiento: https://github.com/ahdrage/norwegian-parakeet
- Documentación de datos y licencias: https://github.com/ahdrage/norwegian-parakeet/blob/main/docs/DATA.md
- Proyecto hermano norsk-asr: https://github.com/ahdrage/norsk-asr
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Dataset NbAiLab/NPSC: https://huggingface.co/datasets/NbAiLab/NPSC
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Sprakbanken/nb_samtale: https://huggingface.co/datasets/Sprakbanken/nb_samtale
