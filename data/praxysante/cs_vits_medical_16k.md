# PraxySante/CS_VITS_medical_16k

## Resumen

CS_VITS_medical_16k es un modelo de síntesis de voz (text-to-speech) para checo, desarrollado por PraxySante y publicado bajo licencia Apache-2.0. Se trata de un VITS entrenado desde cero con la implementación de Coqui TTS, a una frecuencia de muestreo de 16 kHz y en modo mono. El modelo es multihablante: cubre 425 voces distintas y está orientado específicamente al dominio médico y científico, lo que lo diferencia de los TTS genéricos para checo.

La entrada es a nivel de grafema (51 caracteres, sin fonemizador ni léxico fonético), con puntuación restringida a `. , ? !`. El repositorio ocupa 1,0 GB y publica los pesos en `best_model.pth`, correspondientes al paso 26.168 de un entrenamiento total de 145.000 pasos, seleccionado por mejor pérdida de evaluación y no por ser el último checkpoint.

Su relevancia es acotada pero concreta: no hay muchos TTS abiertos para checo con cobertura multihablante amplia y licencia permisiva, y menos aún especializados en registro médico. Ahora bien, las métricas de evaluación publicadas por el propio autor (CER 55,99 % y WER 86,36 %) son muy altas y deben interpretarse con cautela antes de considerar el modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), extremo a extremo, sin fonemizador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto de 51 caracteres a nivel de grafema) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | checo (cs) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best_model.pth`), mas `config.json` y `speakers.pth` |

Datos adicionales del modelo:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 16.000 Hz, mono |
| Numero de hablantes | 425 |
| Alfabeto de entrada | 51 caracteres (grafemas) |
| Checkpoint publicado | paso 26.168 (mejor perdida de evaluacion) |
| Pasos totales de entrenamiento | 145.000 |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional variacional de extremo a extremo que combina un codificador de texto, un prior normalizador de flujo y un decodificador generativo (típicamente HiFi-GAN) en un único modelo entrenado conjuntamente. En este caso se usa la implementación de Coqui TTS, con entrada directa de grafemas y sin fonemizador, lo que simplifica el pipeline pero traslada al modelo toda la responsabilidad de la pronunciación.

El entrenamiento se realizó desde cero sobre 104.653 clips que suman 143,73 horas, con 425 hablantes y una duración media de clip de 4,94 s. Las transcripciones provienen de un sistema ASR y son a nivel de grafema, con puntuación limitada a `. , ? !`. El autor no documenta el uso de RLHF, DPO ni etapas de alineación; tampoco se detalla la composición exacta del corpus más allá de su origen en un directorio de datos checos y eslovacos (`tts_cs_sk`). No se especifica el número de tokens de audio ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

Un detalle relevante de implementación: el script de entrenamiento amplía la tabla de embeddings de texto en una fila (el tokenizador cuenta `<PAD>` pero los ids empiezan en 1), por lo que es necesario redimensionar `text_encoder.emb` antes de cargar el checkpoint. El autor proporciona la receta en la model card y una subclase lista para usar en `tools/fs_vits_synth.py`.

## Capacidades

- Síntesis de voz en checo a partir de texto, a 16 kHz y mono.
- Soporte multihablante con 425 voces seleccionables mediante `speakers.pth`.
- Entrada a nivel de grafema con alfabeto cerrado de 51 caracteres; no requiere fonemizador externo.
- Dominio especializado en habla médica y científica, incluyendo vocabulario técnico y nombres de fármacos (con las salvedades de la sección de limitaciones).
- Integración con el ecosistema Coqui TTS (`Synthesizer`, `load_config`, `setup_model`).
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de informes clínicos y notas médicas: el modelo está entrenado sobre habla médica y científica, por lo que es el escenario natural para convertir documentación clínica en audio para revisión por parte del personal sanitario.
- Accesibilidad para pacientes con discapacidad visual en entornos sanitarios: la ventana de entrada es corta (51 caracteres por pasada), así que se usaría segmentando el texto en frases y encadenando síntesis.
- Generación de avisos y recordatorios de medicación: con 425 hablantes se puede asignar una voz consistente por servicio o por profesional, manteniendo coherencia en aplicaciones de teleasistencia.
- Locución de material divulgativo científico en checo: artículos, resúmenes de estudios o guiones de vídeo, eligiendo entre las voces disponibles la que mejor encaje con el registro.
- Prototipado de asistentes de voz en checo: al ser Apache-2.0 y ejecutable en CPU/GPU con Coqui TTS, sirve para validar pipelines de TTS antes de invertir en un modelo comercial.
- Investigación en TTS multihablante de bajos recursos: el modelo y sus métricas publicadas permiten reproducir y comparar experimentos de VITS con entrada de grafemas en checo.
- Generación de datasets de audio sintético para aumentar datos de ASR en dominio médico checo, siempre que se validen las transcripciones resultantes.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 30 enunciados sintéticos, juzgados por un modelo ASR en streaming interno:

| Metrica | Valor |
|---|---|
| CER | 55,99 % |
| WER | 86,36 % |

El propio autor advierte que estos valores son cotas superiores: el ASR juez es imperfecto sobre habla médica espontánea, por lo que parte del error es atribuible al evaluador y no al TTS. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,0 GB y los pesos publicados son un único `best_model.pth`, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente; una RTX 3060 o superior es un punto de partida razonable.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas modernas; también es viable en CPU para volúmenes bajos.
- Opciones de despliegue: Coqui TTS (`TTS.utils.synthesizer.Synthesizer`), con `config.json`, `model.pth` y `speakers.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CS_VITS_medical_16k | VITS (Coqui TTS) | cs | 425 | Apache-2.0 | HuggingFace |
| Alternativas TTS checo abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables con datos verificables de parámetros, contexto o rendimiento. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- Las transcripciones de entrenamiento provienen de un ASR: nombres de fármacos poco frecuentes y abreviaturas pueden pronunciarse incorrectamente.
- No incluye normalización de texto: los números y abreviaturas deben escribirse desarrollados antes de la síntesis.
- La similitud de hablante está acotada por las grabaciones de origen; el modelo se entrenó desde cero con pocos minutos o pocas horas por hablante y no clona voces arbitrarias.
- Las métricas publicadas (CER 55,99 %, WER 86,36 %) son muy altas y provienen de un evaluador ASR imperfecto; no hay una evaluación humana independiente documentada.
- El alfabeto de entrada está cerrado a 51 caracteres y la puntuación a `. , ? !`; caracteres fuera de ese conjunto pueden degradar la salida.
- El modelo solo cubre checo; no hay soporte multilingüe.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo se distribuye con 0 descargas y 0 likes y sin validación externa conocida, por lo que conviene evaluarlo en el dominio objetivo antes de desplegarlo.
- El checkpoint publicado no es el último paso de entrenamiento (26.168 de 145.000), sino el de mejor pérdida de evaluación; hay que asumir el comportamiento de ese punto intermedio.
- Es necesario redimensionar la tabla de embeddings de texto antes de cargar los pesos; omitir este paso provoca un fallo de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PraxySante/CS_VITS_medical_16k
- Coqui TTS (framework utilizado): https://github.com/coqui-ai/TTS
- Artículo original de VITS: https://arxiv.org/abs/2106.06103
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos del autor.
