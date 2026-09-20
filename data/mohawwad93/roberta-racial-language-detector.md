# mohawwad93/roberta-racial-language-detector

## Resumen

El modelo `mohawwad93/roberta-racial-language-detector` es un clasificador de texto binario obtenido mediante fine-tuning de `roberta-base` sobre un conjunto de datos unificado que combina varios benchmarks de discurso de odio y sesgo racial. Lo desarrolla el usuario mohawwad93 y se publica en HuggingFace con licencia MIT. Su funcion es etiquetar una entrada de texto como `NEUTRAL` (0) o `FLAGGED` (1), es decir, separar lenguaje seguro de lenguaje ofensivo dirigido o con carga racial.

Se trata de un modelo denso de tipo transformer encoder-only, con 124.647.170 parametros (~125 M), formato de pesos safetensors y un repositorio de 0,5 GB. La lengua declarada es unicamente el ingles. No incorpora modo de razonamiento, vision ni capacidades generativas: es un cabezal de clasificacion de secuencias sobre la base de RoBERTa.

Su relevancia practica es la de un componente ligero y facil de desplegar para moderacion de contenido y filtrado previo en pipelines de UGC (comentarios, foros, redes sociales), donde un encoder de 125 M puede ejecutarse en CPU o en cualquier GPU de consumo con un coste muy bajo. El repositorio no incluye informacion sobre el dataset exacto, hiperparametros de entrenamiento, metricas ni resultados de benchmarks, por lo que su validacion en produccion requiere una evaluacion propia sobre datos representativos del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-base con cabezal de clasificacion de secuencias) |
| Parametros totales | 124.647.170 (~125 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; la arquitectura base roberta-base soporta 512 tokens de posicion (514 con offsets) |
| Tipos de cuantizacion | No publicados en el repositorio; pesos en safetensors (fp32) susceptibles de conversion a fp16, int8, ONNX o GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | `NEUTRAL` (0), `FLAGGED` (1) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-20 (creacion y ultima actualizacion, segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de `roberta-base`: un transformer encoder-only de 12 capas, con atencion bidireccional completa y un cabezal lineal de clasificacion sobre el token especial `<s>`. Se trata de un fine-tuning supervisado clasico, no de un modelo generativo ni de una arquitectura MoE, SSM o hibrida. El modelo card indica que el entrenamiento se realizo sobre "un unico dataset que combina multiples benchmarks de discurso de odio y sesgo racial", pero no detalla la composicion del corpus, el numero de ejemplos, el numero de tokens vistos, la proporcion entre clases ni el proceso de filtrado y deduplicacion entre las fuentes originales.

Tampoco se documenta si hubo etapas de ajuste adicionales (RLHF, DPO, calibracion de umbrales) ni que hiperparametros se emplearon (learning rate, epocas, batch size, warmup, semilla). El unico dato operativo publicado es el mapeo de etiquetas y un ejemplo minimo de uso mediante `pipeline("text-classification", ...)`. Como innovacion tecnica no se declara ninguna: es una adaptacion estandar de RoBERTa al dominio de moderacion de contenido.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve `NEUTRAL` o `FLAGGED` con una puntuacion de confianza generada por el cabezal softmax.
- Deteccion de discurso de odio e insultos raciales dirigidos a un objetivo.
- Deteccion de sesgo racial explicito en texto corto.
- Filtrado de contenido en tiempo real en flujos de comentarios y publicaciones.
- Integracion directa con la libreria transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio).
- Compatibilidad con Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No soporta agentes ni planificacion.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito (*thinking mode*).
- Multilingue: no, unicamente ingles.
- Explicabilidad: no se documenta atencion, saliencia ni justificacion de la decision; la salida es solo la etiqueta y su probabilidad.

## Casos de uso

- Moderacion de comentarios en plataformas UGC: el clasificador se ejecuta sobre cada comentario antes de publicarlo y descarta o envía a revision humana aquellos marcados como `FLAGGED`, con un coste de computo minimo por el tamano del modelo.
- Pre-filtrado en pipelines de revision humana: se usa como primera etapa de bajo coste que reduce el volumen de textos que llegan a moderadores, dejando la decision final a un revisor y a una politica de escalado.
- Analisis retrospectivo de corpus: procesamiento por lotes de historicos de foros o redes sociales para cuantificar la prevalencia de lenguaje racial en distintas comunidades o periodos.
- Monitorizacion de comunidades y salud de marca: alertas automaticas cuando la tasa de textos `FLAGGED` supera un umbral definido en un canal concreto.
- Etiquetado asistido para crear datasets de entrenamiento: uso del modelo como anotador debil cuyos positivos se revisan manualmente, acelerando la construccion de corpus anotados en un dominio especifico.
- Control de entrada en asistentes conversacionales: filtrado de prompts con contenido racial antes de enviarlos a un LLM generativo, evitando que el modelo mayor amplifique o responda a entradas abusivas.
- Investigacion en ciencias sociales y NLP: medicion de sesgo y discurso de odio en estudios comparativos, siempre con validacion previa de la calibracion del clasificador en el dominio estudiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, precision, recall, F1, AUC ni evaluaciones sobre conjuntos como HateXplain, Davidson, Jigsaw, HateCheck o Dynabench. Tampoco se documenta ningun analisis de calibracion ni la eleccion del umbral de decision.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~500 MB de pesos mas activaciones), aproximadamente 250-300 MB en fp16 y del orden de 125-150 MB en int8.
- Cabe en CPU: si, es viable para inferencia en CPU con latencias aceptables en lotes pequenos, dado el tamano de 125 M de parametros.
- Cabe en GPU de consumo: si, en cualquier GPU moderna con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en iGPU con suficiente memoria compartida.
- GPU recomendadas para servicio de alta concurrencia: T4, L4, A10G, A100 o H100 si se necesita procesar grandes volumenes en lote; no requiere memoria ni computo de gama alta.
- Opciones de despliegue: `transformers` con `pipeline` de text-classification, Text Embeddings Inference (soportado por la etiqueta del repositorio), Hugging Face Inference Endpoints (compatible), ONNX Runtime tras exportacion, y conversores a GGUF si se desea ejecucion en runtimes ligeros. Las herramientas orientadas a decodificacion generativa (vLLM, TGI en su configuracion estandar de LLM) no son el encaje natural para un encoder de clasificacion.
- Latencia y throughput: no disponible. No se han publicado mediciones; el orden de magnitud esperado es de milisegundos por lote en GPU, pero no existe dato verificable en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mohawwad93/roberta-racial-language-detector | ~125 M | 512 tokens (base roberta-base) | Clasificacion binaria NEUTRAL/FLAGGED | MIT | HuggingFace (0 descargas) |
| facebook/roberta-hate-speech-dynabench-r4-target | ~125 M (roberta-base) | 512 tokens | Clasificacion de discurso de odio (4 clases) | No disponible | HuggingFace |
| cardiffnlp/twitter-roberta-base-hate-latest | ~125 M (roberta-base) | 512 tokens | Clasificacion de odio en tweets | No disponible | HuggingFace |
| unitary/toxic-bert | ~110 M (bert-base) | 512 tokens | Clasificacion multietiqueta de toxicidad | No disponible | HuggingFace |

La comparacion de rendimiento cuantitativo no esta disponible: ninguno de los datos de benchmarks necesarios se incluye en la informacion proporcionada, y no se ha publicado ninguna evaluacion de este modelo frente a las alternativas. Las diferencias verificables se limitan al tamano (todos en el rango 110-125 M), la tarea exacta (binaria frente a multietiqueta o multiclase) y la licencia declarada (MIT en este caso, frente a licencias no indicadas en los demas).

## Limitaciones y advertencias

- Modelo de clasificacion binaria sin justificacion: no explica por que un texto se marca como `FLAGGED`, lo que complica la trazabilidad y la apelacion de decisiones automaticas.
- Riesgo de falsos positivos en contextos legitimos: discusiones academicas, citas de discurso de odio, lenguaje reclamado por comunidades afectadas, satira o reproduccion de citas periodisticas pueden activar la etiqueta.
- Riesgo de falsos negativos ante lenguaje codificado, eufemismos, leetspeak, errores ortograficos deliberados o lenguaje indirecto, frecuentes en entornos reales de moderacion.
- Sesgo de dominio y de anotacion: al combinar varios benchmarks con criterios de etiquetado heterogeneos, es probable que exista ruido de etiquetas y sesgo hacia los dominios de origen (por ejemplo, redes sociales en ingles). No se documenta ningun analisis de sesgo por subgrupo demografico o dialecto.
- Idioma: unicamente ingles; cualquier uso en castellano u otras lenguas no esta soportado y carece de validacion.
- Longitud: la ventana de la arquitectura base es de 512 tokens; los textos mas largos deben truncarse, con la consiguiente perdida de contexto.
- Sin datos de calibracion: el umbral de decision por defecto (0,5) puede no ser el adecuado para la aplicacion; hay que ajustarlo con datos propios y medir precision y recall por separado.
- No apto como unico decisor en moderacion: por el riesgo de falsos positivos y negativos, se recomienda uso como senal auxiliar con revision humana, especialmente en decisiones con impacto sobre usuarios.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No impone restricciones de uso adicionales, pero tampoco ofrece garantias ni asume responsabilidad sobre los resultados.
- Repositorio sin traccion ni validacion externa: 0 descargas y 0 likes, sin evaluaciones de terceros ni publicacion asociada. Conviene tratarlo como un experimento no auditado antes de incorporarlo a produccion.
- Fechas de publicacion y actualizacion poco habituales (2026-09-20 en ambos campos segun los metadatos): conviene verificar la procedencia y la version exacta de los pesos antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohawwad93/roberta-racial-language-detector
- Modelo base roberta-base en HuggingFace: https://huggingface.co/roberta-base
- Articulo de RoBERTa (Liu et al., 2019, arXiv:1907.11692): https://arxiv.org/abs/1907.11692
- Repositorio oficial de RoBERTa (fairseq): https://github.com/facebookresearch/fairseq/tree/main/examples/roberta
- Documentacion de la pipeline de clasificacion de texto de transformers: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- Nota: los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con el modelo, con moderacion de contenido ni con procesamiento de lenguaje natural; corresponden a un sitio de servicios funerarios en Ranst (Belgica) y no se han utilizado como fuente.
