# 21f1006131/whisper-hindi-small-disfluency-fold1

## Resumen

El modelo `21f1006131/whisper-hindi-small-disfluency-fold1` es un ajuste fino (fine-tuning) del modelo Whisper Small de OpenAI, publicado en Hugging Face por el usuario 21f1006131. Por el nombre se deduce que se trata de un modelo de reconocimiento automatico del habla (ASR) orientado al hindi y entrenado para gestionar disfluencias (tartamudeos, repeticiones, pausas y falsos inicios) en el habla espontanea. El sufijo "fold1" sugiere que forma parte de un esquema de validacion cruzada por pliegues (folds), probablemente en el contexto de un trabajo academico o de un curso.

Whisper Small es una arquitectura transformer encoder-decoder de tipo secuencia a secuencia, con aproximadamente 244 millones de parametros y una ventana de contexto de audio de 30 segundos. El modelo base fue entrenado por OpenAI con 680 000 horas de audio debilmente supervisado, y esta variante concreta se habria reentrenado sobre un corpus especifico de hindi con anotaciones de disfluencias.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva, no declara licencia, idiomas ni resultados de evaluacion, y el tamano del repositorio aparece como 0.0 GB. Se trata, por tanto, de un artefacto de investigacion sin documentacion publica, y cualquier uso en produccion deberia ir precedido de una validacion directa del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, inferido del nombre) |
| Parametros totales | Aproximadamente 244 millones (Whisper Small; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (Whisper Small; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere hindi) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card, que es una plantilla automatica de Hugging Face sin rellenar. Por el identificador del modelo se infiere que se parte de Whisper Small, un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, atencion multi-cabeza, y un frontend de espectrograma log-Mel de 80 canales. Whisper procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva, con tokens especiales para deteccion de idioma y marcas de tiempo.

Respecto al entrenamiento, la model card no aporta informacion sobre el corpus utilizado, el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos o regularizacion. El nombre "disfluency" sugiere que el corpus de ajuste contiene habla espontanea con anotaciones de disfluencias, y "fold1" indica que se trata de uno de varios pliegues de un esquema de validacion cruzada. No hay evidencia de RLHF, DPO ni innovaciones tecnicas adicionales documentadas.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en hindi, segun se deduce del nombre del modelo.
- Manejo de habla espontanea con disfluencias: repeticiones, falsos inicios, pausas y muletillas, segun la denominacion del checkpoint.
- Transcripcion con marcas de tiempo, heredada de la arquitectura Whisper (no confirmado para este ajuste).
- Deteccion de idioma, heredada de Whisper (no confirmado para este ajuste).
- Capacidades de traduccion del habla al ingles, presentes en Whisper base (no confirmado para este ajuste).
- No se ha documentado soporte de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de entrevistas en hindi: el modelo puede procesar audio de entrevistas con habla espontanea y disfluencias, un escenario para el que fue ajustado explicitamente segun su nombre.
- Generacion de subtitulos para contenido audiovisual en hindi: util para videos con lenguaje coloquial, donde los modelos ASR genericos suelen fallar en repeticiones y pausas.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones telefonicas en hindi para su posterior analisis de calidad o mineria de datos.
- Investigacion linguistica sobre disfluencias: el checkpoint puede emplearse para estudiar patrones de tartamudeo y reparaciones en corpus de habla espontanea.
- Punto de partida para fine-tuning adicional: al estar en formato transformers con safetensors, puede recargarse y ajustarse sobre dominios especificos (medico, legal, etc.).
- Evaluacion comparativa de ASR en hindi: util como baseline en experimentos academicos de validacion cruzada, dado el sufijo "fold1".
- Prototipado de asistentes de voz en hindi: para pruebas de concepto donde la latencia y la precision no sean criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0.5 GB para los pesos, mas overhead de activaciones y buffers de audio; en la practica, 1-2 GB son suficientes.
- VRAM estimada en cuantizacion int8: aproximadamente 0.25 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM, TGI, llama.cpp u Ollama si se convierte a GGUF, aunque no hay confirmacion de compatibilidad.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 21f1006131/whisper-hindi-small-disfluency-fold1 | ~244 M (inferido) | 30 s (inferido) | No disponible (hindi por nombre) | No disponible | Hugging Face |
| openai/whisper-small | ~244 M | 30 s | Multilingue (99 idiomas) | MIT | Hugging Face, ampliamente integrado |
| openai/whisper-medium | ~769 M | 30 s | Multilingue (99 idiomas) | MIT | Hugging Face |
| ai4bharat/indicwhisper | Varios tamanos | 30 s | 11 idiomas indios | No disponible en esta ficha | Hugging Face |

La comparativa se limita a datos publicos de los modelos base; no hay informacion de rendimiento especifico de este checkpoint frente a alternativas.

## Limitaciones y advertencias

- La model card es una plantilla automatica sin informacion sustantiva; no se documentan sesgos, datos de entrenamiento ni evaluacion.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue en produccion.
- El repositorio aparece con un tamano de 0.0 GB, lo que puede indicar que los pesos no estan efectivamente subidos o que la informacion esta incompleta.
- No hay evidencia publica de calidad del ajuste; el rendimiento real en hindi con disfluencias es desconocido.
- Riesgo de alucinacion y de transcripciones incorrectas inherente a los modelos ASR, especialmente en audio con ruido o acentos no representados en el corpus de ajuste.
- El modelo es especifico de un unico pliegue de validacion cruzada, por lo que puede no generalizar bien fuera de la particion de datos correspondiente.
- No se documentan limitaciones de contexto mas alla de la ventana de 30 segundos propia de Whisper.
- El identificador sugiere un contexto academico; no hay garantia de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/21f1006131/whisper-hindi-small-disfluency-fold1
- Paper de Whisper (referenciado en los tags): https://arxiv.org/abs/2212.04356
- Paper de Lacoste et al. (referenciado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
