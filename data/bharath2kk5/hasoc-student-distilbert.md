# Bharath2kk5/hasoc-student-distilbert

## Resumen

El modelo `Bharath2kk5/hasoc-student-distilbert` es un clasificador binario de discurso de odio y contenido ofensivo especializado en texto *code-mixed* hindi-inglés (hinglish). Se trata de un modelo estudiante obtenido por destilación a partir de un profesor basado en XLM-RoBERTa-base, y está orientado a la tarea 2 del benchmark HASOC 2021 (ICHCL), donde la etiqueta de salida distingue entre contenido ofensivo/odio (HOF) y no ofensivo (NOT).

El modelo cuenta con 135.326.210 parámetros, lo que corresponde a una arquitectura DistilBERT multilingüe (encoder transformer de 6 capas), frente a los aproximadamente 278 millones del profesor XLM-RoBERTa-base. Según la información publicada, conserva el 96,1 % del macro-F1 del profesor y es 4,1 veces más rápido en inferencia, lo que lo sitúa como una alternativa ligera para prefilterado y moderación a gran escala.

Su relevancia actual radica en dos factores: por un lado, aborda un dominio poco cubierto como el hinglish, donde los modelos monolingües y los filtros basados en listas de palabras fallan con frecuencia; por otro, su tamaño reducido permite desplegarlo en CPU o GPUs de gama baja, algo crítico en pipelines de moderación que procesan millones de comentarios. El repositorio tiene licencia MIT, aunque no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT multilingüe (encoder transformer destilado, 6 capas) |
| Parametros totales | 135.326.210 (135 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; la arquitectura DistilBERT admite hasta 512 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados (no hay GGUF); compatible con cuantizacion dinamica INT8 via PyTorch u ONNX Runtime |
| Idiomas soportados | Hindi (hi) e ingles (en), con enfasis en texto code-mixed hindi-ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo DistilBERT multilingüe, destilado desde un profesor XLM-RoBERTa-base ajustado para clasificación binaria sobre texto hinglish. La cabeza de clasificación produce dos etiquetas: HOF (odio u ofensivo) y NOT (no ofensivo). Al tratarse de un modelo de clasificación y no de generación, no dispone de ventana de contexto generativa ni de mecanismos de atención lineal o decodificación especulativa; su limite practico son los 512 tokens habituales de la familia DistilBERT.

Los datos de entrenamiento proceden del corpus HASOC 2021 (ICHCL), con una partición estratificada propia 70/13/17 (entrenamiento/validación/prueba) fijada con semilla 42. No se documenta en la informacion disponible el numero total de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO (no aplicables en un clasificador, pero tampoco se detalla ningun esquema de calibracion o *thresholding*).

La innovacion principal es la propia destilacion: el profesor XLM-RoBERTa-base alcanza un 73,69 % de macro-F1 en el conjunto de prueba, superando al sistema ganador de HASOC 2021 (72,53 %). El estudiante reproduce el 96,1 % de ese macro-F1 con la mitad de parámetros y 4,1 veces menos coste de inferencia, lo que evidencia una compresion eficiente del conocimiento del profesor.

## Capacidades

- Clasificacion binaria de texto en dos categorias: HOF (odio/ofensivo) y NOT (no ofensivo).
- Procesamiento de texto code-mixed hindi-ingles, incluyendo transliteracion en alfabeto latino.
- Deteccion de insultos y lenguaje ofensivo explicito en contextos multilingues.
- Inferencia rapida en lotes (*batching*) gracias a su tamano reducido y a la arquitectura DistilBERT.
- No soporta *tool calling* ni *function calling*: es un modelo de clasificacion, no de generacion ni de agentes.
- No dispone de modo de razonamiento (*thinking mode*), capacidades de vision, audio ni generacion de codigo.
- No es un modelo conversacional: no mantiene dialogos multi-turno ni genera texto.

## Casos de uso

- Prefilterado en plataformas de moderacion: dado su bajo coste computacional, se puede aplicar como primera etapa sobre todos los comentarios entrantes y derivar solo los casos positivos a un modelo mayor o a revision humana.
- Moderacion de comentarios en redes sociales dirigidas a audiencia india: el modelo maneja la mezcla hindi-ingles caracteristica de YouTube, X (Twitter) e Instagram en ese mercado.
- Investigacion academica sobre HASOC: sirve como linea base reproducible para comparar nuevas tecnicas de deteccion de odio en code-mixed.
- Anotacion asistida de corpus: se puede usar para preetiquetar grandes volumenes de texto y reducir el coste de anotacion humana, con revision posterior obligatoria.
- Filtrado de resenas y foros de producto: deteccion de comentarios ofensivos en plataformas de comercio electronico con usuarios hinglish.
- Guardarrailes en asistentes conversacionales: como clasificador auxiliar que decide si un mensaje de entrada debe bloquearse antes de llegar a un LLM generativo.
- Despliegue en entornos con recursos limitados: al caber en CPU o en GPUs de gama baja, es viable en servicios *edge* o en contenedores sin acelerador.
- Analisis retrospectivo de toxicidad a escala: procesamiento de historicos de comentarios en lotes para estudios de tendencias de discurso de odio.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al macro-F1 sobre el conjunto de prueba del split propio y a la comparacion con el profesor y con el sistema ganador de HASOC 2021. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que el modelo es un clasificador especializado.

| Modelo | Parametros | Macro-F1 (test) | Notas |
|---|---|---|---|
| XLM-RoBERTa-base (profesor) | ~278 M | 73,69 % | Supera al ganador de HASOC 2021 como modelo unico |
| hasoc-student-distilbert (este modelo) | 135,3 M | 96,1 % del macro-F1 del profesor (equivalente aproximado de 70,8 % si se aplica ese porcentaje al 73,69 %; dato derivado, no publicado directamente) | 4,1x mas rapido en inferencia |
| Sistema ganador de HASOC 2021 (ensemble) | No disponible | 72,53 % | Referencia publicada del benchmark |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 0,54 GB en FP32, 0,27 GB en FP16 y 0,14 GB en INT8 (solo pesos; hay que sumar activaciones y *overhead* del runtime).
- El repositorio ocupa 0,5 GB, coherente con pesos en FP32 en formato safetensors.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Funciona en CPU para inferencia en lotes pequenos o moderados; es su escenario natural si se busca coste minimo.
- Opciones de despliegue: Transformers (PyTorch) con `AutoModelForSequenceClassification`, ONNX Runtime para inferencia optimizada, TorchServe o FastAPI para exponer un endpoint, y cuantizacion dinamica INT8 en PyTorch u ONNX.
- No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables sin conversion previa (y ademas son herramientas orientadas a generacion, no a clasificacion).
- Latencia y throughput absolutos: no disponibles. El unico dato publicado es que es 4,1 veces mas rapido que el modelo profesor XLM-RoBERTa-base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hasoc-student-distilbert | 135,3 M | 512 tokens (limite de arquitectura) | Clasificacion binaria de odio en hinglish | MIT | HuggingFace |
| XLM-RoBERTa-base (profesor, ajustado) | ~278 M | 512 tokens | Clasificacion binaria de odio en hinglish | MIT (base) | Requiere el ajuste del autor; pesos concretos no enlazados en la informacion disponible |
| distilbert-base-multilingual-cased | 135 M | 512 tokens | Modelo base sin ajustar para esta tarea | Apache 2.0 | HuggingFace |
| Sistema ganador de HASOC 2021 (ensemble) | No disponible | No disponible | Clasificacion de odio en hinglish | No disponible | Publicacion academica, no como modelo desplegable |

Rendimiento comparado: no disponible para las alternativas, salvo el macro-F1 del ganador de HASOC 2021 (72,53 %) y el del profesor de este modelo (73,69 %). No se dispone de datos de mBERT ni de otros clasificadores multilingues en este benchmark concreto dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no esta pensado para moderacion de contenido en produccion sin validacion adicional.
- Falsos positivos sobre vocabulario politico o religioso: el analisis de errores muestra que se activa en exceso ante nombres de partidos, terminos religiosos y discurso legitimo, incluyendo sarcasmo y reportajes periodisticos.
- Falsos negativos en odio codificado: puede no detectar discurso de odio sutil que evita insultos explicitos, como metaforas deshumanizantes o terminos en clave.
- Cobertura limitada a hindi e ingles en registro code-mixed; no se ha validado su comportamiento en otros idiomas ni en hindi formal o ingles estandar aislado.
- Longitud de contexto restringida a 512 tokens, lo que impide clasificar documentos largos sin truncado o troceado.
- Riesgo de sesgo derivado del corpus HASOC 2021, cuya composicion demografica, tematica y temporal no esta documentada en la informacion disponible.
- La model card incluida en el repositorio corresponde al modelo profesor (XLM-RoBERTa) y no al estudiante: describe la tarea y el dataset, pero los detalles de entrenamiento, calibracion y evaluacion del estudiante no estan publicados.
- La licencia MIT permite uso comercial, pero el aviso de validacion previa del autor y la ausencia de umbral de decision documentado obligan a calibrar el modelo con datos propios antes de cualquier despliegue.
- No hay descargas ni validacion externa registradas, por lo que no existe evidencia independiente de su rendimiento fuera del split del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bharath2kk5/hasoc-student-distilbert
- Modelo profesor (XLM-RoBERTa-base ajustado): citado en la model card del repositorio, sin enlace directo publicado
- Modelo estudiante referenciado en la model card (mismo repositorio, enlace placeholder en la documentacion original): https://huggingface.co/YOUR_USERNAME/hasoc-student-distilbert
- Benchmark HASOC 2021 (Subtarea 2, ICHCL): referencia academica citada en la model card, sin URL incluida en la informacion disponible
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
