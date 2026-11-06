# agbalu/Dihya-22M

## Resumen

Dihya-22M es un modelo de identificacion de idioma (language identification) de 22,0 millones de parametros (21.999.616 publicados) desarrollado por el usuario agbalu. Su tarea es clasificar texto entre 22 clases que cubren el continuo dialectal bereber (amazigh) en escrituras latina y neo-tifinagh, los dialectos arabes del norte de Africa (dariya argelina y marroqui) en escritura arabe y en arabizi latino, arabe estandar moderno y lenguas mundiales principales. Es la evolucion del checkpoint anterior Dihya-5M, del mismo autor.

El modelo aborda un problema estructural: los identificadores de idioma de proposito general (GlotLID, NLLB `lid218e`) colapsan las variedades bereberes hermanas en kabyle, lo que contamina silenciosamente corpus web y paralelos. Dihya-22M amplia el inventario de 7 a 22 clases, anade neo-tifinagh, dariya argelina y marroqui y arabizi, y mejora la precision en kabyle de 0,626 a 0,900 sin sacrificar recall.

La arquitectura es un Conv-Transformer byte-level (sin tokenizador subword) y el modelo se distribuye con pesos en safetensors bajo licencia Apache 2.0. Ademas incorpora prediccion conformal (split-conformal con cuantil q=0,9526 a cobertura nominal del 99,0%), de modo que puede devolver un conjunto de etiquetas cuando el texto es ambiguo en el continuo dialectal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv-Transformer byte-level (convolucional + transformer, sin tokenizador subword) |
| Parametros totales | 21.999.616 (22,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kab, shi, rif, taq, tzm, shy, mzb, arq, ary, ara, fra, eng, spa, zho (22 clases; 13 variedades amazigh en latin y tifinagh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Dihya-22M es un Conv-Transformer byte-level: opera directamente sobre bytes en lugar de tokens subword, lo que le permite cubrir de forma nativa cinco escrituras distintas (latina, neo-tifinagh, arabe, arabizi con digitos latinos y alfabetos de lenguas mundiales) sin un vocabulario especifico. El modelo cuenta con 21.999.616 parametros y se presenta como una actualizacion de Dihya-5M, del que hereda el diseno pero amplia el inventario de clases de 7 a 22.

El conjunto de entrenamiento consta de 113.974 frases de entrenamiento y 7.145 de desarrollo, segun los datos de la model card. La evaluacion se realiza sobre un conjunto held-out estratificado de 14.247 frases distribuidas en 36 celdas de (idioma, dominio), completamente disjunto de entrenamiento y desarrollo. La innovacion destacable es la incorporacion de prediccion conformal: un cuantil split-conformal (q=0,9526 a cobertura nominal del 99,0%, con cobertura empirica del 98,28%) permite devolver un conjunto de etiquetas en lugar de una sola cuando el texto carece de marcadores distintivos. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Identificacion de idioma y dialecto sobre 22 clases en cinco escrituras: latina, neo-tifinagh, arabe, arabizi y alfabetos de lenguas mundiales.
- Discriminacion dentro del continuo dialectal bereber: kabyle (kab), shawiya (shy), tarifit (rif), tashelhit (shi), tamasheq (taq), tamazight del Atlas Central (tzm), tumzabt (mzb) y amazigh marroqui.
- Distincion de dariya argelina (arq) y marroqui (ary) en escritura arabe y en arabizi latino.
- Clasificacion de arabe estandar moderno (ara) y de lenguas mundiales: frances (fra), ingles (eng), espanol (spa) y chino (zho).
- Manejo nativo de multiples escrituras sin tokenizador subword, gracias a la entrada byte-level.
- Prediccion conformal: devuelve conjuntos de etiquetas con cobertura calibrada cuando el texto es ambiguo.
- Tarea de feature extraction (etiqueta `feature-extraction` en Hugging Face) ademas de clasificacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingues: si, 14 codigos de idioma declarados y 22 clases de clasificacion.

## Casos de uso

- Filtrado y limpieza de corpus multilingues: usar el modelo como filtro de idioma en pipelines de recoleccion de datos web para separar variedades bereberes y evitar que texto shawiya, tarifit o tamazight se etiquete erroneamente como kabyle, problema que afecta al 91,3% de shawiya y al 80,7% de tarifit con NLLB `lid218e`.
- Construccion de corpus paralelos y de entrenamiento para modelos de traduccion: clasificar pares de frases por variedad dialectal antes de alinear, reduciendo la contaminacion silenciosa que introducen los identificadores de proposito general.
- Enrutamiento de contenido en plataformas de contenido norteafricano: detectar si un texto esta en dariya argelina, marroqui o arabizi para dirigirlo al modulo de moderacion o de respuesta adecuado.
- Investigacion linguistica y sociolinguistica: cuantificar la presencia relativa de cada variedad amazigh en un corpus y estudiar la mezcla de escrituras latina y tifinagh.
- Preprocesamiento para TTS y ASR de lenguas de bajos recursos: etiquetar el idioma antes de enviar el texto al modelo acustico correspondiente, con especial utilidad en variedades sin identificadores publicos.
- Anotacion asistida con abstenccion: gracias a la prediccion conformal, el modelo puede devolver un conjunto de etiquetas en textos ambiguos y derivar esos casos a revision humana en lugar de forzar una etiqueta incorrecta.
- Deteccion de arabizi en redes sociales: identificar texto arabe escrito con digitos latinos, una variedad que GlotLID y `lid218e` no distinguen.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre el conjunto held-out de 14.247 frases en 36 celdas de (idioma, dominio):

| Sistema | Precision | Clases que puede nombrar | Cobertura amazigh | Dariya y arabizi |
|---|---|---|---|---|
| Dihya-22M | 91,90% | 22 de 22 | 13 variedades (latin y tifinagh) | arq, ary, arabizi |
| Dihya-5M | 85,52% | 7 de 22 | 6 variedades (solo latin) | ninguna |
| GlotLID | 41,78% | 3 de 22 | 3 variedades (solo latin) | conflacionadas / sin arabizi |
| NLLB `lid218e` | 28,33% | 2 de 22 | 2 variedades (solo latin) | conflacionadas / sin arabizi |

Metricas globales declaradas: accuracy 0,919 y macro-F1 0,918 sobre 22 clases. Todas las clases alcanzan un recall de al menos 71,4%; el peor recall por grupo es del 63,33% en la celda mas escasa de shawiya.

Fuga de texto hermano hacia la etiqueta kabyle (metrica clave para filtros downstream):

| Idioma real | Escritura | Dihya-22M | Dihya-5M | GlotLID | `lid218e` |
|---|---|---|---|---|---|
| Tashelhit | Latin | 1,38% | 2,0% | 17,3% | 79,3% |
| Tarifit | Latin | 1,38% | 6,7% | 90,0% | 80,7% |
| Tumzabt | Latin | 1,88% | no disponible | no disponible | no disponible |
| Tamazight del Atlas Central | Latin | 2,58% | 16,0% | 66,7% | 73,3% |
| Shawiya | Latin | 21,43% | 19,3% | 96,0% | 91,3% |
| Tamasheq | Latin | 0,16% | 7,3% | 0,0% | 6,7% |
| Tashelhit | Tifinagh | 0,50% | no disponible | no disponible | no disponible |
| Tamazight del Atlas Central | Tifinagh | 0,00% | no disponible | no disponible | no disponible |
| Tarifit | Tifinagh | 0,00% | no disponible | no disponible | no disponible |
| Marroqui estandar | Tifinagh | 2,12% | no disponible | no disponible | no disponible |
| Tamasheq | Tifinagh | 0,00% | no disponible | no disponible | no disponible |

Resultados por clase disponibles parcialmente en la model card: `kab_Latn` (800 muestras, precision 0,900, recall 0,925, F1 0,912), `kab_Tfng` (800 muestras, precision 0,971, recall 0,879, F1 0,923) y `shy_Latn` (98 muestras, precision 0,86). El resto de la tabla por clase no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,0 M de parametros, los pesos en precision completa (fp32) ocupan aproximadamente 88 MB; en fp16 unos 44 MB. La VRAM total depende del tamaño de lote y de la longitud de secuencia, pero es del orden de cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); tambien es viable en CPU. Para lotes grandes, A100 o H100 no son necesarias pero ofrecen mayor throughput.
- Cabe holgadamente en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), con posible exportacion a ONNX; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, y al no ser un modelo generativo su encaje en esos servidores es limitado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Escrituras | Precision (held-out del autor) | Licencia |
|---|---|---|---|---|---|
| Dihya-22M | 22,0 M | 22 | 5 | 91,90% | Apache 2.0 |
| Dihya-5M | no disponible (checkpoint previo del mismo autor) | 7 | Latin | 85,52% | no disponible |
| GlotLID | no disponible | 3 de 22 en este conjunto | Latin | 41,78% | no disponible |
| NLLB `lid218e` | no disponible | 2 de 22 en este conjunto | Latin | 28,33% | no disponible |

La comparacion se limita a los sistemas evaluados en la model card; no se dispone de datos de otros identificadores de idioma especializados en lenguas de bajos recursos en la informacion proporcionada.

## Limitaciones y advertencias

- Shawiya en escritura latina sigue siendo el punto debil: recall del 63,33% en la celda mas escasa y una fuga del 21,43% hacia kabyle, la mas alta del modelo.
- Los textos cortos sin marcadores dialectales distintivos son genuinamente ambiguos en el continuo bereber; el modelo lo mitiga devolviendo conjuntos de etiquetas via prediccion conformal, pero no elimina la ambiguedad.
- Riesgo de confusion entre variedades morfologicamente proximas cuando el texto carece de afijos o cliticos discriminativos.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El modelo es un clasificador, no un generador: no soporta generacion de texto, razonamiento, codigo ni tool calling.
- No se dispone de informacion sobre sesgos especificos, longitud maxima de contexto ni comportamiento fuera de las 22 clases declaradas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento, no detalladas en la informacion disponible.
- Para produccion, la cobertura conformal del 98,28% frente al 99,0% nominal implica que aproximadamente un 0,7% de los casos puede quedar fuera del conjunto de etiquetas predicho.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Dihya-22M
- Paper de referencia sobre identificacion de idioma (arxiv:1906.07413): https://arxiv.org/abs/1906.07413
- Paper de referencia (arxiv:1911.08731): https://arxiv.org/abs/1911.08731
- Paper de referencia (arxiv:2506.15304): https://arxiv.org/abs/2506.15304
