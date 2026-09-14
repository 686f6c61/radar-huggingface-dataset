# mattdr/sentence-frame-classifier

## Resumen

El modelo `mattdr/sentence-frame-classifier` es un clasificador de texto en ingles especializado en la deteccion de marcos informativos (frames) a nivel de oracion. Lo desarrolla Matteo Guida (usuario `mattdr`) en el marco de un trabajo academico publicado en Transactions of the Association for Computational Linguistics, junto a Yulia Otmakhova, Eduard Hovy y Lea Frermann. El problema que resuelve es concreto: dada una oracion, asignarle una de diez categorias de encuadre periodistico (Economic, Morality, Fairness and Equality, Legality and Crime, Political and Policies, Security and Defense, Health and Safety, Cultural Identity, Public Opinion y None/Other).

Tecnicamente es un ajuste fino de `facebook/roberta-large`, un transformer encoder denso de 355.369.994 parametros, distribuido en formato safetensors con un repositorio de 1,4 GB. La relevancia actual del modelo esta en que cubre tanto periodismo profesional como contenido generado por usuarios: se entreno sobre el Media Frame Corpus de Card et al. (2015) y se extendio a contextos de discusion online siguiendo a Hartmann et al. (2019), lo que lo hace util para analizar articulos y comentarios con el mismo etiquetado.

A diferencia de un clasificador cerrado, el modelo expone las probabilidades de todas las etiquetas, de modo que puede emplearse tambien en escenarios multietiqueta. Su rendimiento declarado es de un Macro F1 de 0,66. El modelo solo soporta ingles y se publica bajo licencia CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia RoBERTa, ajuste fino de `facebook/roberta-large`) |
| Parametros totales | 355.369.994 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base RoBERTa-large admite habitualmente hasta 512 tokens, pero la ficha no lo confirma |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |
| Tarea (pipeline) | `text-classification` |
| Numero de clases | 10 (Economic, Morality, Fairness and Equality, Legality and Crime, Political and Policies, Security and Defense, Health and Safety, Cultural Identity, Public Opinion, None/Other) |
| Metrica declarada | Accuracy (Macro F1 = 0,66) |
| Modelo base | `facebook/roberta-large` |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 2016 descargas / 1 like |
| Fecha de creacion | 2025-06-18 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo RoBERTa, es decir, una variante de BERT con ajustes en el preentrenamiento (eliminacion del objetivo de prediccion de siguiente oracion, mascaras dinamicas y mayor volumen de datos). El modelo parte de los pesos de `facebook/roberta-large` y se ajusta como clasificador multiclase sobre la representacion de la oracion, con una cabeza de clasificacion de 10 salidas. Al ser un encoder, no genera texto: produce una distribucion de probabilidad sobre las diez categorias de frame.

En cuanto a los datos, la model card indica que el entrenamiento se basa en el Media Frame Corpus de Card et al. (2015) y se extiende a contextos de discusion online segun Hartmann et al. (2019), cubriendo asi tanto articulos periodisticos como comentarios de lectores. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un clasificador de este tipo). La innovacion destacable es de planteamiento: el modelo esta entrenado como clasificador multiclase, pero preserva las probabilidades de todas las etiquetas, lo que habilita su uso en configuraciones multietiqueta y en analisis de encuadre a nivel de corpus.

## Capacidades

- Clasificacion de texto en 10 categorias de marco informativo a nivel de oracion.
- Salida de probabilidades por etiqueta, lo que permite umbrales personalizados y clasificacion multietiqueta.
- Analisis de encuadre en generos heterogeneos: articulos de prensa, comentarios de lectores y, segun la model card, tambien redes sociales.
- Adaptacion a dominios cruzados, al haberse entrenado con datos de periodismo profesional y de discusion online.
- Uso como componente dentro de pipelines de analisis de medios a mayor escala (agregacion de frames por documento o por corpus).
- Integracion directa con la libreria `transformers` mediante `pipeline("text-classification", ...)`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio.
- Soporte multilingue: limitado a ingles.

## Casos de uso

- Monitorizacion de medios: clasificar automaticamente cada oracion de un corpus de noticias para medir la prevalencia relativa de encuadres economicos, de salud o de seguridad en la cobertura de un tema a lo largo del tiempo.
- Analisis de comentarios de lectores: aplicar el mismo etiquetado a las respuestas de la audiencia para estudiar si los lectores retienen el encuadre del articulo o lo reformulan, que es precisamente el objeto del paper asociado.
- Investigacion en comunicacion politica: cuantificar el peso de los frames Political and Policies, Fairness and Equality y Morality en debates parlamentarios o campanas electorales transcritas y segmentadas por oracion.
- Clasificacion de contenido en redes sociales: procesar publicaciones y respuestas para detectar encuadres de salud publica o seguridad, con la salvedad de que el modelo solo maneja ingles.
- Enrutado editorial asistido: etiquetar borradores o piezas entrantes por frame dominante para priorizar su revision por parte de editores especializados.
- Analisis de riesgo reputacional: detectar oraciones con encuadre Legalty/seguridad o Economic en menciones a una organizacion y activar alertas tempranas.
- Construccion de datasets anotados: usar la salida probabilistica como preetiquetado en un flujo de anotacion humana, reduciendo el coste de etiquetar grandes volumenes antes de una revision manual.
- Docencia y prototipado en NLP: ejemplo compacto y de bajo coste computacional para ilustrar fine-tuning de encoders y clasificacion multiclase sobre `transformers`.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es el Macro F1 del modelo:

| Metrica | Valor |
|---|---|
| Macro F1 | 0,66 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites de evaluacion general, algo esperable porque no es un modelo generativo. Tampoco se facilitan comparaciones numericas contra otros clasificadores de encuadre.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,4 GB con pesos en fp32 y cerca de 0,7 GB en fp16/bf16, sin contar activaciones. Con lotes grandes y secuencias de 512 tokens, la memoria se incrementa de forma apreciable.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM resulta suficiente; una RTX 3060, RTX 4070 o RTX 4090 puede ejecutar el modelo con lotes grandes. Para despliegues de alto volumen, una A100 o H100 permiten maximizar el throughput por lote.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` (clase `pipeline`), servidores de inferencia como Text Generation Inference no aplican (no es generativo), pero si FastAPI/ONNX Runtime, TorchServe, NVIDIA Triton o exportacion a ONNX para optimizacion. No se distribuyen pesos en formato GGUF, por lo que `llama.cpp` y Ollama no son opciones directas sin conversion previa.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Como referencia cualitativa, un encoder de 355 M de parametros procesa secuencias cortas en milisegundos en GPU moderna, pero no se aporta ningun numero confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mattdr/sentence-frame-classifier` | 355,4 M | No disponible | Macro F1 0,66 | CC-BY-4.0 | HuggingFace |
| `facebook/roberta-large` (modelo base) | 355,4 M | No disponible en esta ficha | No aplica: no es un clasificador de frames | MIT (segun su propia ficha, no verificada aqui) | HuggingFace |
| Clasificadores de frame de Card et al. (2015) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos de Hartmann et al. (2019) para discusion online | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estos sistemas en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre clasificadores de encuadre alternativos.

## Limitaciones y advertencias

- Cobertura linguistica restringida al ingles: cualquier texto en otro idioma queda fuera de su dominio de entrenamiento y producira etiquetas poco fiables.
- Macro F1 de 0,66: el rendimiento es moderado y las clases minoritarias probablemente concentran la mayor parte de los errores, algo habitual en clasificacion multiclase desbalanceada.
- Riesgo de sesgo de dominio: aunque se entreno con datos de prensa y de comentarios, su comportamiento en redes sociales, foros especializados o generos nuevos no esta cuantificado en la informacion disponible.
- Las etiquetas de frame son categorias interpretativas: la salida del modelo no debe tratarse como una verdad objetiva sobre la intencion del autor.
- Uso como senal agregada: es recomendable analizar distribuciones sobre corpus amplios en lugar de confiar en la etiqueta de una oracion aislada.
- Ambiguedad entre categorias: frames como Political and Policies, Public Opinion y None/Other pueden solaparse en oraciones cortas o sin contexto.
- La model card incluye un ejemplo de codigo que referencia el identificador `mattdr/cross-domain-frame-classifier` en lugar de `mattdr/sentence-frame-classifier`; conviene verificar el identificador correcto antes de desplegar.
- Licencia CC-BY-4.0: permite uso comercial y modificaciones siempre que se atribuya adecuadamente mediante la cita indicada por los autores.
- No se publican versiones cuantizadas ni pesos en GGUF, lo que limita el despliegue en entornos de muy bajos recursos sin trabajo adicional de conversion.
- Ausencia de garantias de mantenimiento: el repositorio acumula muy pocas interacciones (1 like), lo que sugiere un soporte comunitario limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattdr/sentence-frame-classifier
- Paper asociado (TACL 2026): https://doi.org/10.1162/TACL.a.698
- Media Frame Corpus (Card et al., 2015): https://aclanthology.org/P15-2072.pdf
- Trabajo sobre framing en discusion online (Hartmann et al., 2019): https://arxiv.org/pdf/1904.03969
- Modelo base: https://huggingface.co/facebook/roberta-large
- Referencia arXiv declarada en las etiquetas del repositorio: arxiv:1904.03969
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a contenidos sin relacion.
