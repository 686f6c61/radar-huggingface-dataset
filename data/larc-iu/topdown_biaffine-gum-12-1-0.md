# larc-iu/topdown_biaffine-gum-12.1.0

## Resumen

`larc-iu/topdown_biaffine-gum-12.1.0` es un parser de discurso RST (Rhetorical Structure Theory) de tipo top-down con atencion biaffine, entrenado con la libreria Dipo del grupo LARC (Georgetown University). El modelo reimplementa el enfoque descrito por Kobayashi et al. en "A Simple and Strong Baseline for End-to-End Neural RST-style Discourse Parsing" (Findings of EMNLP 2022) y utiliza SpanBERT base cased como codificador subyacente.

No es un modelo generativo ni un LLM: es un modelo discriminativo especializado en analizar la estructura retorica de documentos en ingles, asignando relaciones de discurso (32 etiquetas) entre unidades de discurso elementales (EDU). Resulta relevante para tareas de comprension profunda de documentos, resumen guiado por estructura, analisis de argumentacion y evaluacion de coherencia textual.

El modelo fue entrenado sobre el corpus GUM 12.1.0 (Georgetown University Multilayer corpus), un corpus multigenero en ingles con anotacion RST entre otras capas. El repositorio ocupa 1,5 GB y acumula 18 descargas en Hugging Face, con licencia no especificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (SpanBERT base cased) + cabeza biaffine top-down para parsing RST |
| Parametros totales | no disponible (encoder SpanBERT base, ~110 M; cabeza no cuantificada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de SpanBERT base, tipicamente 512 tokens; el parser usa stride de 100) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (corpus GUM en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,5 GB, cargado via `dipo`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma top-down biaffine para parsing RST: dado un documento con segmentacion EDU de referencia (gold), construye el arbol de discurso de forma descendente, prediciendo en cada paso la frontera de division y la etiqueta de relacion. La cabeza de prediccion usa atencion biaffine con una capa FFN de 512 dimensiones y dropout de 0,2. El codificador es SpanBERT base cased, afinado con una tasa de aprendizaje reducida (1e-5) frente a la de la cabeza (2e-4).

El entrenamiento se realizo sobre GUM 12.1.0 con 30 epocas maximas, paciencia de 10, weight decay de 0,01, 1000 pasos de warmup, gradient clipping de norma 1 y semilla 42. La metrica de validacion es `span_f1`. El corpus cubre 12 generos (academico, biografia, ficcion, entrevista, noticias, reddit, discurso, libro de texto, vlog, voyage, whow) y define 32 etiquetas de relacion, incluyendo relaciones mononucleares (rst) y multinucleares (multinuc). El decoder utiliza un `stride` de 100, parametro relevante para documentos largos.

## Capacidades

- Parsing de discurso RST sobre documentos en ingles con segmentacion EDU de referencia (gold).
- Prediccion de estructura arborea completa: fronteras de constitucion, nuclearidad y etiqueta de relacion.
- Clasificacion en 32 etiquetas RST (adversative, attribution, causal, context, contingency, elaboration, evaluation, explanation, joint, mode, organization, purpose, restatement, same-unit, topic).
- Distincion entre relaciones mononucleares y multinucleares segun la configuracion de `relation_types`.
- Procesamiento por lotes via CLI (`python -m dipo topdown_biaffine predict`).
- Integracion programatica mediante `TopdownBiaffineParser.from_pretrained`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un modelo discriminativo de analisis.

## Casos de uso

- Analisis de coherencia en evaluacion de resumenes: el arbol RST permite medir si un resumen preserva las relaciones retoricas del documento fuente, usando las etiquetas de nuclearidad y relacion como senal.
- Investigacion en linguistica computacional: generacion de estructuras RST de referencia sobre GUM y otros corpus para estudios comparativos de teorias de discurso.
- Sistemas de argumentacion y deteccion de evidencia: las etiquetas `explanation-evidence`, `explanation-justify` y `attribution-positive` permiten localizar justificaciones y atribuciones en textos argumentativos.
- Analisis de estructura de documentos academicos y libros de texto: las etiquetas `organization-heading`, `organization-preparation` y `elaboration-additional` ayudan a segmentar secciones y jerarquias.
- Preprocesamiento para resumen extractivo guiado por estructura: identificar unidades nucleares y satelites permite ponderar oraciones por importancia retorica antes de un summarizer.
- Analisis de discurso en redes sociales y foros (genero reddit de GUM): detectar relaciones de contraste, concesion y lista en hilos de discusion.
- Evaluacion de modelos generativos: usar el parser como componente de metricas de coherencia en la linea de "Worth Their Weights?" (Gessler y Zeldes, 2026).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre GUM 12.1.0:

| Split | span_f1 | nuc_f1 | rel_f1 | full_f1 |
|---|---|---|---|---|
| dev | 0,6364 | 0,4979 | 0,3740 | 0,3716 |
| test | 0,6669 | 0,5295 | 0,4033 | 0,4003 |

No se han publicado en la informacion disponible resultados comparativos con otros parsers RST sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el encoder SpanBERT base (~110 M parametros) mas la cabeza biaffine cabe holgadamente en GPUs consumer de 8 GB o menos en fp32/fp16.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; A100/H100 no son necesarias salvo para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas.
- Opciones de despliegue: libreria `dipo` (unica via documentada), con CLI y API programatica. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo discriminativo de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| topdown_biaffine-gum-12.1.0 | SpanBERT base (~110 M) | no disponible | Top-down biaffine RST | no disponible | Hugging Face (18 descargas) |
| Alternativas RST en GUM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables con metricas publicadas sobre el mismo split de GUM 12.1.0.

## Limitaciones y advertencias

- Requiere segmentacion EDU de referencia (gold): no realiza segmentacion automatica, lo que limita su uso en pipelines end-to-end sin un segmentador previo.
- Solo ingles: el corpus GUM y el encoder estan en ingles; no hay soporte multilingue documentado.
- Rendimiento moderado: `full_f1` de 0,40 en test indica que la prediccion conjunta de estructura, nuclearidad y relacion sigue siendo una tarea dificil; el `rel_f1` de 0,40 sugiere confusion frecuente entre etiquetas.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Modelo de investigacion con 18 descargas y sin likes: ecosistema de validacion limitado.
- Dependencia de la libreria `dipo`, poco extendida, lo que puede complicar el mantenimiento en produccion.
- No es un modelo generativo: no debe usarse para tareas de generacion, dialogo o razonamiento general.
- Riesgo de sesgo inherido de GUM (generos y dominios concretos) y de SpanBERT (corpus en ingles de Wikipedia y libros).
- El parametro `stride` de 100 condiciona el manejo de documentos largos; no se documenta el comportamiento fuera de la longitud tipica de SpanBERT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/topdown_biaffine-gum-12.1.0
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper top-down biaffine (Kobayashi et al., Findings EMNLP 2022): https://aclanthology.org/2022.findings-emnlp.501/
- Paper Dipo (Gessler y Zeldes, 2026): https://arxiv.org/abs/2610.17658
- Corpus GUM: https://gucorpling.org/gum/
- Encoder SpanBERT base cased: https://huggingface.co/SpanBERT/spanbert-base-cased
