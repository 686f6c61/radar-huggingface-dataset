# ania3000/ossbert-morph-v2-1

## Resumen

ossbert-morph-v2-1 es un modelo de clasificacion de tokens (pipeline `token-classification`) publicado por el usuario ania3000 en Hugging Face. Se obtiene por ajuste fino supervisado del modelo AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs mediante la libreria Transformers, y cuenta con 177.633.506 parametros (~177,6 M), pesos en formato safetensors y licencia Apache 2.0.

Por su arquitectura y tamano, se trata de un encoder de la familia BERT (bidireccional, no generativo) orientado a tareas de etiquetado a nivel de token. El sufijo "morph" del nombre apunta a un uso previsto en etiquetado morfologico o analisis gramatical, aunque la model card no especifica el conjunto de datos, el esquema de etiquetas ni los idiomas cubiertos.

Su relevancia actual es limitada pero concreta: el repositorio registra 0 descargas y 0 likes, la model card esta practicamente sin documentar ("More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento) y no se publican comparaciones con otros modelos. Las unicas metricas disponibles son las declaradas por el propio autor durante el entrenamiento (accuracy de 95,8782 % y sentence accuracy de 60,1835 % sobre un conjunto de evaluacion no identificado), con un patron de sobreajuste a partir de la tercera epoca. Resulta por tanto un modelo a evaluar con cautela y a validar en el dominio concreto de uso antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional) con cabeza de clasificacion de tokens |
| Parametros totales | 177.633.506 (~177,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos BERT de la familia base suelen operar con 512 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (presumiblemente fp32) |
| Idiomas soportados | no disponible (el identificador del modelo base incluye "multilingual", pero no se documenta el alcance real) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,7 GB |
| Tarea (pipeline) | token-classification |
| Compatibilidad | endpoints_compatible |
| Modelo base | AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas del repositorio es `bert`, con cabeza de clasificacion de tokens sobre un encoder bidireccional de 177.633.506 parametros. El modelo parte de AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs, sobre el que se aplica un ajuste fino supervisado generado con la clase `Trainer` de Transformers (etiqueta `generated_from_trainer`). No se documenta ningun tipo de aprendizaje por refuerzo (RLHF, DPO) ni innovacion tecnica adicional: es un fine-tuning clasico de clasificacion de secuencias sobre un encoder preentrenado.

Los hiperparametros de entrenamiento declarados son: learning rate 5e-05, train batch size 8, eval batch size 8, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal (`linear`) y 25 epocas configuradas, aunque la tabla de resultados publicada solo alcanza la epoca 16 (8.736 pasos). No se especifica el dataset de entrenamiento ni su composicion. La curva de entrenamiento muestra sobreajuste claro: la perdida de entrenamiento baja de 0,9947 (epoca 1) a 0,0062 (epoca 16) mientras la perdida de validacion toca minimo en la epoca 4 (0,2132) y sube despues hasta 0,2914. El mejor resultado de validacion en accuracy se registra en las epocas 12-15 (hasta 95,9910 %), no al final del entrenamiento.

Entorno de ejecucion declarado: Transformers 4.57.3, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Etiquetado de secuencias a nivel de token: asignacion de una clase a cada token de entrada (formato de salida tipo lista de entidades con offset, inicio, fin y puntuacion).
- Deteccion de entidades nombradas (NER) y etiquetado morfologico o gramatical, siempre que el esquema de etiquetas del modelo coincida con el de la tarea objetivo; el esquema real no esta documentado.
- Extraccion de informacion estructurada a partir de texto plano, util como etapa de preprocesado en pipelines de NLP.
- Uso como encoder de caracteristicas: la representacion interna puede reutilizarse para clasificacion de secuencias u otras tareas, aunque el repositorio publica unicamente la cabeza de clasificacion de tokens.
- Inferencia por lotes con la API `pipeline("token-classification")` de Transformers.
- Capacidad multilingue: no confirmada en la informacion disponible.
- No dispone de generacion de texto libre, razonamiento multi-paso, tool calling / function calling, soporte de agentes, vision, audio ni modo "thinking". Es un modelo discriminativo de encoder, no generativo.

## Casos de uso

Nota: dado que no se documenta el esquema de etiquetas ni el dominio de entrenamiento, los casos siguientes son aplicables solo si la salida del modelo se valida empiricamente contra el problema concreto.

- Extraccion de entidades en documentos de un dominio especifico: el modelo clasifica cada token con una etiqueta, de modo que puede localizar nombres, organizaciones, fechas o terminos tecnicos dentro de un texto y devolver sus offsets para su explotacion en una base de datos. Es adecuado por su bajo coste computacional (177,6 M de parametros) frente a modelos generativos.
- Etiquetado morfologico y analisis gramatical: el nombre del modelo sugiere entrenamiento en tareas de morfologia; puede emplearse para asignar categoria gramatical o rasgos morfologicos a cada palabra, como etapa previa a lematizacion, analisis sintactico o construccion de corpus anotados.
- Anonimizacion de datos personales (PII): si el esquema de etiquetas contempla entidades como nombres de persona o direcciones, el modelo puede integrarse en un pipeline que detecte y enmascare esos fragmentos antes de almacenar o compartir documentos, con la ventaja de poder ejecutarse en local sin enviar datos a terceros.
- Preanotacion asistida en proyectos de anotacion linguistica: el modelo puede generar una primera pasada de etiquetas sobre corpus nuevos y reducir el trabajo manual de los anotadores, que despues corrigen las predicciones en una herramienta tipo Label Studio o INCEpTION.
- Normalizacion y enriquecimiento de datos en procesos ETL: al clasificar tokens dentro de registros tabulares convertidos a texto, permite extraer campos no estructurados (por ejemplo, cargos o ubicaciones) y convertirlos en columnas tipadas antes de cargarlos en un almacen de datos.
- Preprocesado para busqueda y recuperacion de informacion: las etiquetas de entidades pueden usarse como filtros o como metadatos en un indice de busqueda, mejorando la precision de consultas sobre documentacion tecnica o legal.
- Clasificacion de curriculos o de correspondencia entrante: extraccion de entidades relevantes (empresas, titulaciones, puestos) para alimentar un sistema de cribado o de enrutado de tickets, siempre que el dominio coincida con el de entrenamiento del modelo.
- Despliegue en entornos con recursos muy limitados: por su tamano, es viable ejecutarlo en CPU o en GPU de gama de entrada como servicio interno, lo que permite incorporarlo a pipelines en tiempo casi real para secuencias cortas.

## Benchmarks y rendimiento

El model-index incluido en la model card declara un unico `trainer_output` con la lista de resultados vacia, por lo que no hay benchmarks estandar (MMLU, GLUE, F1 de NER, etc.) publicados. Las cifras disponibles son las metricas de evaluacion declaradas por el autor, sobre un conjunto de evaluacion no identificado:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,2914 |
| Accuracy | 95,8782 % |
| Sentence accuracy | 60,1835 % |

Evolucion durante el entrenamiento (datos declarados por el autor, 16 de las 25 epocas configuradas):

| Epoca | Step | Training loss | Validation loss | Accuracy | Sentence accuracy |
|---|---|---|---|---|---|
| 1,0 | 546 | 0,9947 | 0,3542 | 91,9569 % | 42,5688 % |
| 2,0 | 1092 | 0,3077 | 0,2446 | 94,3247 % | 52,4771 % |
| 3,0 | 1638 | 0,1956 | 0,2200 | 94,9637 % | 55,9633 % |
| 4,0 | 2184 | 0,1388 | 0,2132 | 95,0388 % | 57,0642 % |
| 5,0 | 2730 | 0,1031 | 0,2138 | 95,5525 % | 57,9817 % |
| 6,0 | 3276 | 0,0805 | 0,2245 | 95,4397 % | 58,8991 % |
| 7,0 | 3822 | 0,0593 | 0,2192 | 95,8031 % | 60,5505 % |
| 8,0 | 4368 | 0,0479 | 0,2297 | 95,6527 % | 58,5321 % |
| 9,0 | 4914 | 0,0402 | 0,2402 | 95,7028 % | 58,3486 % |
| 10,0 | 5460 | 0,0281 | 0,2475 | 95,8782 % | 60,1835 % |
| 11,0 | 6006 | 0,0164 | 0,2645 | 95,7529 % | 59,4495 % |
| 12,0 | 6552 | 0,0132 | 0,2600 | 95,9910 % | 60,3670 % |
| 13,0 | 7098 | 0,0118 | 0,2668 | 95,8532 % | 60,1835 % |
| 14,0 | 7644 | 0,0094 | 0,2752 | 95,8908 % | 60,3670 % |
| 15,0 | 8190 | 0,0073 | 0,2856 | 95,9409 % | 60,3670 % |
| 16,0 | 8736 | 0,0062 | 0,2914 | 95,8782 % | 60,1835 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

Estimaciones de memoria derivadas del recuento real de parametros (177.633.506):

- Pesos en fp32: ~710 MB; en fp16/bf16: ~356 MB; en int8: ~178 MB.
- VRAM estimada para inferencia con lotes pequenos y secuencias cortas: ~1,5-2,5 GB en fp16 y ~3-4 GB en fp32 (incluyendo activaciones y overhead del runtime). Cifras orientativas, no medidas.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050/3060/4060, RTX 4090 con margen amplio). La inferencia en CPU es viable para volumenes moderados.
- GPU recomendadas: para servicio en produccion con batching, T4, L4, A10G o L40S; A100/H100 resultan sobredimensionadas para una sola instancia de este modelo, pero utiles si se comparten con otros servicios o se necesita throughput masivo.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), exportacion a ONNX Runtime, servidores tipo TorchServe o NVIDIA Triton, o un servicio propio con FastAPI y PyTorch.
- llama.cpp / Ollama: no se distribuye ninguna version GGUF en el repositorio y no hay documentacion sobre el soporte de cabezas de clasificacion de tokens en esos runtimes.
- vLLM / TGI: orientados a modelos generativos; no se documenta su uso con este modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No existe ninguna comparacion de rendimiento publicada entre este modelo y alternativas de la misma categoria. La tabla siguiente recoge unicamente datos objetivos de arquitectura, tamano y licencia; los datos de modelos de referencia externos provienen de su documentacion publica y conviene verificarlos en la fuente original antes de citarlos.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ania3000/ossbert-morph-v2-1 | 177,6 M | no disponible | token classification | apache-2.0 | Hugging Face, safetensors |
| AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| BERT-base-multilingual-cased (referencia) | ~178 M | 512 tokens | encoder general (MLM) | apache-2.0 | Hugging Face, ampliamente usado |
| XLM-RoBERTa-base (referencia) | ~278 M | 512 tokens | encoder multilingue (MLM) | MIT | Hugging Face |

Criterios de eleccion: este modelo solo es preferible si su esquema de etiquetas coincide con el problema a resolver y se valida su calidad en el dominio. En caso contrario, resulta mas razonable partir de un encoder generico multilingue y ajustarlo con datos propios etiquetados.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento indican "More information needed". Se desconoce el dataset, el esquema de etiquetas, el numero de clases y el dominio de aplicacion.
- Idiomas de entrenamiento no declarados: aunque el identificador del modelo base incluye "multilingual", no hay confirmacion del alcance linguistico real. No se debe asumir cobertura de castellano ni de ningun idioma concreto sin pruebas.
- Sobreajuste evidente: la perdida de validacion alcanza su minimo en la epoca 4 (0,2132) y asciende hasta 0,2914 en la epoca 16, mientras la perdida de entrenamiento cae a 0,0062. El checkpoint final no es el mejor segun la curva de validacion.
- Inconsistencia entre configuracion y resultados: se declaran 25 epocas de entrenamiento, pero solo se publican resultados hasta la epoca 16. No se explica la diferencia.
- Sentence accuracy baja: 60,1835 % de acierto a nivel de frase frente al 95,8782 % a nivel de token. En tareas de NER, esto implica que una proporcion relevante de secuencias contiene al menos un error de etiquetado, lo que limita su uso directo en produccion sin postprocesado o validacion.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y negativos: el modelo puede asignar etiquetas a tokens que no corresponden a una entidad real y omitir entidades presentes.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, origen, dominio o registro. Si el modelo base se entreno sobre corpus en ruso, los sesgos y el rendimiento estaran condicionados por ese origen.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay evidencia externa de calidad ni de reproducibilidad.
- Trazabilidad de datos: la model card se genero automaticamente con `Trainer` y no ha sido revisada, segun el propio comentario incluido en el README.
- Licencia: el repositorio se distribuye bajo Apache 2.0, que permite uso comercial y modificacion con atribucion. No obstante, conviene verificar la licencia y las condiciones del modelo base (AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs), no disponibles en la informacion proporcionada, por si impusieran restricciones adicionales.
- Advertencia para produccion: cualquier despliegue deberia ir precedido de una evaluacion propia con datos etiquetados del dominio objetivo, midiendo F1 por clase, y de un analisis de errores por idioma y por longitud de secuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ania3000/ossbert-morph-v2-1
- Modelo base: https://huggingface.co/AlexeySorokin/ossbert-onc-unlab-from_multilingual-bs64-5epochs
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
