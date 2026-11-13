# farefaine/qal-base

## Resumen

Qal base es un modelo de lenguaje de tipo GPT entrenado desde cero para tigriña (ti), una lengua semítica del Cuerno de África con escasos recursos digitales. Lo desarrolla el autor independiente farefaine como parte de la serie *Building Qal*, y esta variante concreta es el nivel *base* de un conjunto de cinco tamanos entrenados con el mismo corpus, tokenizer y receta, lo que permite comparaciones controladas entre escalas. Con 21,1 millones de parametros, es un modelo deliberadamente pequeno, orientado a la investigacion y a la experimentacion en lenguas de bajos recursos mas que a produccion.

La arquitectura es un transformer decoder-only de 4 capas, 8 cabezas de atencion, dimension de embedding de 512 y una ventana de contexto de solo 128 tokens, con embeddings posicionales absolutos aprendidos y un vocabulario BPE de 8.192 unidades. El entrenamiento se realizo sobre una version limpiada del dataset `farefaine/tigrinya-pretraining`, de unos 79 millones de tokens por epoca, durante 30 epocas en una unica GPU con precision mixta BF16.

Su relevancia es doble: por un lado, aporta pesos abiertos y una receta reproducible para una lengua practicamente ausente en los grandes modelos multilingues; por otro, sirve como punto de referencia de escala dentro de la serie Qal. No obstante, sus cifras de perdida y perplejidad (3,333 y 28,0 en validacion) reflejan un modelo de base sin ajuste por instrucciones, util para estudiar dinamicas de entrenamiento en tigriña pero no para tareas que exijan fiabilidad factual o seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT |
| Parametros totales | 21.058.560 (21,1 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | tigriña (ti) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria pytorch) |
| Capas | 4 |
| Cabezas de atencion | 8 |
| Dimension de embedding | 512 |
| Vocabulario | 8.192 (BPE) |
| Embeddings posicionales | aprendidos, absolutos |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno clasico de un transformer decoder-only: 4 bloques con atencion multi-cabeza de 8 cabezas sobre una dimension de 512, embeddings posicionales absolutos aprendidos y una cabeza de lenguaje sobre un vocabulario BPE de 8.192 tokens. No incorpora mecanismos de atencion lineal, decodificacion especulativa ni arquitecturas hibridas; la innovacion, en este caso, esta en el dominio de aplicacion (tigriña) y en la reproducibilidad de la receta, no en el diseno de red.

El entrenamiento cubre 30 epocas (96.420 pasos) con lotes de 192 secuencias de 128 tokens, optimizador AdamW (betas 0,9 y 0,99), weight decay 0,1, dropout 0,1 y una tasa de aprendizaje maxima de 0,0025 con esquema warmup-stable-decay (mantenida durante el 80% del recorrido y decaida despues). Se uso precision mixta BF16 en una sola GPU. El corpus es una version limpiada de `farefaine/tigrinya-pretraining`, de aproximadamente 79 millones de tokens por epoca, compuesto por texto publico de tigriña procedente de TLMD, el corpus de SeReT Foundation y TiQuAD. No se menciona RLHF, DPO ni ninguna fase de ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en tigriña, con salida fluida a nivel superficial segun el autor.
- Modelado de lenguaje puro: no ha sido ajustado para seguir instrucciones ni para formato conversacional.
- Completado de texto breve dentro de la ventana de 128 tokens.
- Capacidad multilingue: limitada a tigriña; no se documenta transferencia a otras lenguas.
- Tool calling / function calling: no soportado.
- Razonamiento multi-paso o comportamiento agentico: no soportado.
- Vision, audio o modo *thinking*: no disponible.
- Uso como base para *fine-tuning* en tareas downstream de tigriña (clasificacion, etiquetado, generacion acotada).

## Casos de uso

- Investigacion sobre lenguas de bajos recursos: sirve como punto de partida reproducible para estudiar como escala el rendimiento en tigriña dentro de la serie Qal (cinco tamanos con la misma receta).
- Punto de referencia en experimentos de tokenizacion: su vocabulario BPE de 8.192 tokens y su corpus de 79 M de tokens permiten comparar decisiones de tokenizer frente a modelos mayores de la misma familia.
- Generacion de texto exploratoria en tigriña: util para prototipos de completado o generacion de frases cortas donde no se exige correccion factual, dado su perplejidad de 28,0 en validacion.
- Base para *fine-tuning* supervisado en tareas concretas: al ser un modelo de 21 M de parametros, se puede ajustar en una sola GPU consumer con datasets pequenos de tigriña para clasificacion de texto o etiquetado.
- Docencia y divulgacion: su tamano (0,1 GB de repositorio) y su receta detallada lo hacen adecuado para explicar el ciclo completo de entrenamiento de un LM desde cero.
- Evaluacion de sesgos y calidad de corpus: permite analizar que sesgos hereda un modelo entrenado mayoritariamente con texto periodistico en tigriña.
- Filtrado o puntuacion de texto: la perplejidad del modelo puede usarse como señal para detectar texto anomalo o de baja calidad en tigriña dentro de pipelines de limpieza de datos.

## Benchmarks y rendimiento

| Split | Loss | Perplexity |
|---|---|---|
| Validacion | 3,333 | 28,0 |
| Test | 3,343 | 28,3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en tigriña) en la informacion disponible. Las unicas metricas reportadas son la perdida y la perplejidad de validacion y test indicadas arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (21 M de parametros, ~84 MB de pesos) y menos de 0,5 GB en BF16/FP16; el cuello de botella real es el contexto y el codigo de inferencia, no la memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entreno en una unica GPU sin especificar modelo.
- GPU consumer: cabe holgadamente en cualquier RTX, GTX o incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el autor proporciona codigo propio en el repositorio de GitHub (`model.transformer.GPT`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; con 4 capas y contexto de 128 tokens se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qal base (farefaine) | 21,1 M | 128 | tigriña | CC BY-SA 4.0 | Hugging Face, pesos safetensors |
| Otros niveles de la serie Qal | no disponible (cinco tamanos, solo se detalla el base) | no disponible | tigriña | no disponible | no disponible |
| Modelos multilingues de proposito general (p. ej. familia mT5 small, ~300 M) | ~300 M | 512 | multilingue | Apache 2.0 (mT5) | Hugging Face |
| GPT-2 small | 124 M | 1.024 | ingles | MIT | Hugging Face |

La comparacion directa con modelos multilingues genericos es limitada: Qal base esta especializado en tigriña y su contexto de 128 tokens es muy inferior al de alternativas como GPT-2 small o mT5 small. No se dispone de resultados de benchmarks comparables en tigriña para establecer una comparacion cuantitativa con esos modelos.

## Limitaciones y advertencias

- Modelo de base sin ajuste por instrucciones: no sigue ordenes ni mantiene formato conversacional de forma fiable.
- Ventana de contexto muy corta (128 tokens), insuficiente para documentos, dialogos largos o recuperacion aumentada.
- Entrenado con unos 79 M de tokens de texto mayoritariamente periodistico: hereda los sesgos de esas fuentes y su cobertura tematica es limitada.
- Riesgo alto de alucinacion: el propio autor advierte que produce tigriña fluida pero no es fiable para hechos.
- Capacidad multilingue practicamente nula; no se documenta rendimiento fuera del tigriña.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios.
- Sin soporte documentado en frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI); requiere el codigo del repositorio del autor.
- Cero descargas y cero *likes* en el momento de la consulta: no hay validacion externa ni reportes de terceros sobre su comportamiento en produccion.
- Fecha de creacion del repositorio en 2026: verificar la vigencia y el mantenimiento del codigo asociado antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farefaine/qal-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/farefaine/tigrinya-pretraining
- Codigo del proyecto: https://github.com/farefaine/qal
- Serie *Building Qal*: https://farefaine.substack.com
- TLMD (Gaim, Yang & Park, 2021): https://zenodo.org/records/5139094
- Tigrinya NLP Corpus (SeReT Foundation): https://github.com/TigrinyaNLP/corpus
- TiQuAD (Gaim, Yang, Park & Park, 2023): https://github.com/fgaim/TiQuAD
