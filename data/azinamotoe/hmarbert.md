# azinamotoe/HmarBERT

## Resumen

HmarBERT es un modelo de lenguaje enmascarado (masked language model, MLM) de tipo BERT-base desarrollado por azinamotoe junto con la Hmar Heritage Foundation para el idioma hmar (`hmr`, ISO 639-3), una lengua kuki-chin hablada en el noreste de la India y zonas limítrofes de Myanmar. El modelo se construye continuando el preentrenamiento de `robzchhangte/MizBERT` con un vocabulario adaptado al hmar, en el que se realizaron 303 sustituciones in-place de cognados mizo-hmar inicializadas en caliente a partir de los embeddings originales.

Con 109.514.298 parametros, 12 capas, dimension oculta de 768 y 12 cabezas de atencion, HmarBERT sigue la arquitectura transformer encoder bidireccional clasica de BERT-base. Se entreno sobre el corpus `hmar-heritage-org/dolma-pretrain` (101.867 frases, 2.484.864 palabras repartidas en 7 registros) durante 6 epocas, con enmascaramiento de palabra completa (Whole-Word Masking) y una tasa de aprendizaje maxima de 3e-5.

Su relevancia radica en que el hmar es una lengua de bajos recursos practicamente ausente de los grandes corpus multilingues, por lo que este modelo cubre una laguna real para tareas de comprension, rellenado de huecos y generacion de embeddings en ese idioma. La licencia MIT y el formato safetensors facilitan su integracion en pipelines de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT-base (12 capas, 768 de dimension oculta, 12 cabezas de atencion) |
| Parametros totales | 109.514.298 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | hmar (`hmr`, ISO 639-3) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estandar de BERT-base: 12 capas, dimension oculta de 768, 12 cabezas de atencion y en torno a 110 millones de parametros. El vocabulario consta de 30.522 tokens y se derivó del de MizBERT introduciendo 303 sustituciones in-place de cognados mizo-hmar, cuyos embeddings se inicializaron en caliente a partir de los vectores originales, en lugar de reinicializar desde cero. Esta estrategia permite reutilizar el conocimiento aprendido en mizo y adaptarlo al hmar sin perder cobertura subword.

El preentrenamiento continuado se realizo sobre el corpus `hmar-heritage-org/dolma-pretrain`, con 101.867 frases de entrenamiento y 2.484.864 palabras distribuidas en 7 registros. Se aplicaron 6 epocas con batch efectivo de 64, decaimiento coseno y tasa de aprendizaje maxima de 3e-5. El esquema de enmascaramiento fue Whole-Word Masking (WWM) con expansion subword alineada con MizBERT. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con un modelo exclusivamente encoder y orientado a rellenado de huecos.

## Capacidades

- Rellenado de huecos (fill-mask) sobre texto en hmar, que es la tarea principal declarada en el pipeline tag.
- Generacion de representaciones contextuales del hmar, utiles como encoder para clasificacion, NER o similitud semantica.
- Comprension bidireccional del contexto, al tratarse de un encoder no causal.
- Vocabulario adaptado con cognados mizo-hmar, lo que mejora la tokenizacion frente a vocabularios multilingues genericos.
- Cobertura de 7 registros distintos del corpus de preentrenamiento (segun la model card).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo causal).
- Capacidades multilingues: limitadas al hmar, con posible transferencia parcial desde el mizo por herencia del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Completado asistido de texto en hmar: dado un fragmento con una palabra enmascarada, el modelo propone los tokens mas probables, util para correctores ortograficos o ayudas de redaccion en la lengua.
- Anonimizacion y deteccion de entidades: usando HmarBERT como encoder con una cabeza de clasificacion token a token se pueden identificar nombres propios, lugares o entidades culturales en textos hmar.
- Clasificacion de documentos en registros (religioso, prosa cultural, etc.): el modelo se puede afinar con pocas muestras etiquetadas para categorizar textos segun el registro del corpus de preentrenamiento.
- Busqueda semantica en archivos del Hmar Heritage Foundation: las representaciones contextuales permiten indexar y recuperar pasajes en hmar por similitud semantica en lugar de coincidencia literal.
- Preservacion y normalizacion linguistica: el modelo sirve como herramienta para revisar ortografia y variantes en corpus digitalizados de la lengua.
- Filtrado y limpieza de corpus hmar: la perplexity del modelo puede usarse como criterio para detectar frases anomalas o ruido en un corpus antes de incorporarlo a un pipeline.
- Investigacion en linguistica de bajos recursos: sirve como baseline para estudiar transferencia mizo-hmar y el efecto de la sustitucion de embeddings en lenguas emparentadas.
- Punto de partida para fine-tuning en tareas descendentes (analisis de sentimiento, etiquetado morfosintactico) cuando no existe un modelo especifico para hmar.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GLUE, etc.). Lo unico reportado son metricas de preentrenamiento y evaluacion interna:

| Metrica | Valor |
|---|---|
| Perdida de evaluacion final | 2.7116 |
| Perplexity de validacion final | 15.05 |
| Conjunto de evaluacion | 2.099 frases estratificadas de test (51.840 palabras) |
| Corpus de entrenamiento | 101.867 frases, 2.484.864 palabras, 7 registros |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en FP32 (440 MB de pesos), en torno a 0,22 GB en FP16 y cerca de 0,11 GB en INT8, sin contar activaciones ni overhead del framework.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; una RTX 3090, RTX 4090, A100 o H100 lo ejecutan con holgura y permiten lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos (GTX 1060 6 GB, RTX 2060, RTX 3060, etc.), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo BERT estandar en safetensors, es compatible con HuggingFace Transformers, `pipeline("fill-mask")`, Text Embeddings Inference (TEI), Optimum, y despliegue en CPU con ONNX Runtime. No se documentan ficheros GGUF ni integracion directa con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles (la model card no los reporta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HmarBERT | 109,5 M | no disponible | hmar | MIT | HuggingFace (`azinamotoe/HmarBERT`) |
| MizBERT (`robzchhangte/MizBERT`) | 110 M (BERT-base) | no disponible | mizo | no disponible en la informacion proporcionada | HuggingFace (modelo base de HmarBERT) |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | 104 idiomas (incluye bajo recurso de forma residual) | Apache 2.0 | HuggingFace / Google |
| XLM-R base | 270 M | 512 tokens | 100 idiomas | MIT | HuggingFace (Facebook AI) |

Comparacion de rendimiento en hmar: no disponible. La model card no ofrece resultados que permitan situar a HmarBERT frente a estos modelos en tareas de hmar, y la comparacion de parametros solo refleja tamano, no calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un corpus de una fundacion cultural, puede heredar sesgos de sobrerrepresentacion de ciertos registros (religioso y prosa cultural) frente a otros.
- Riesgo de alucinacion: no aplica de forma directa porque no es un modelo generativo causal; en fill-mask puede producir completados plausibles pero incorrectos, especialmente con contexto ambiguo.
- Limitaciones de contexto: la longitud maxima de secuencia no se especifica; conviene validar experimentalmente el maximo antes de usarlo con textos largos.
- Limitaciones de idioma: solo esta entrenado para hmar; no es fiable en mizo, ingles u otras lenguas, aunque herede cierto conocimiento residual del modelo base.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la atribucion a la Hmar Heritage Foundation y a azinamotoe. No se documentan restricciones adicionales.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad; conviene evaluarlo internamente antes de desplegarlo. Se trata de un modelo base MLM, no de un asistente conversacional, por lo que no soporta instrucciones ni funciones de tool calling.
- Tamano del corpus de preentrenamiento modesto (2,48 millones de palabras), lo que limita la cobertura lexica y de dominios.
- La fecha de creacion registrada (2026-09-13) es posterior a la fecha habitual de consulta; conviene verificar la ficha en HuggingFace por si hubiera actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azinamotoe/HmarBERT
- Dataset de preentrenamiento: https://huggingface.co/datasets/hmar-heritage-org/dolma-pretrain
- Demo interactiva: https://huggingface.co/spaces/azinamotoe/Dolma
- Modelo base MizBERT: https://huggingface.co/robzchhangte/MizBERT

Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a un servicio de traduccion generico), por lo que no se incluyen.
