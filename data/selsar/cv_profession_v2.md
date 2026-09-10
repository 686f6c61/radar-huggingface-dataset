# selsar/cv_profession_v2

# selsar/cv_profession_v2

## Resumen
selsar/cv_profession_v2 es un modelo de clasificacion de texto publicado en HuggingFace por el usuario selsar. Segun las etiquetas del repositorio, se trata de un modelo basado en la arquitectura DeBERTa-v2 (tag `deberta-v2`) y orientado a la tarea de `text-classification`, con pesos en formato safetensors y una libreria declarada de `transformers`. El recuento real de parametros extraido de los ficheros safetensors es de 278.810.882 parametros, lo que situa al modelo en la franja de los encoders de tamano medio-grande, con un repositorio de 1,1 GB.

El nombre del modelo sugiere un clasificador de profesiones o areas profesionales a partir de curriculos (CV), aunque la model card no lo confirma ni documenta el conjunto de etiquetas, el idioma de entrenamiento ni el dataset utilizado. La model card publicada es la plantilla autogenerada por HuggingFace y no ha sido completada: todos los apartados relevantes (desarrollo, datos de entrenamiento, hiperparametros, evaluacion, licencia) figuran como "[More Information Needed]".

Su relevancia practica es limitada y condicionada: no hay resultados de benchmarks, no hay licencia declarada y el modelo acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validacion externa conocida. Puede resultar de interes como punto de partida para experimentar con clasificacion de textos de curriculos, pero no deberia integrarse en produccion sin una evaluacion propia previa y sin aclarar la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder con attention disentangled y relative position embeddings, segun el tag del repositorio) |
| Parametros totales | 278.810.882 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; al ser un encoder de 278,8 M de parametros es viable en fp16, int8 y ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Etiquetas relevantes | deberta-v2, text-classification, text-embeddings-inference, endpoints_compatible, region:us |

## Arquitectura y entrenamiento
La unica informacion disponible sobre la arquitectura es el tag `deberta-v2`. Esto implica, si se corresponde con la implementacion publica de referencia, un encoder transformer con atencion disentangled (contenido y posicion tratados por separado) y mecanismo de posiciones relativas, que es la innovacion central de la familia DeBERTa frente a BERT y RoBERTa. El recuento de 278.810.882 parametros no coincide con los tamanos publicados habituales de la familia (base y large), por lo que es probable que se trate de una configuracion intermedia, de un modelo con vocabulario o cabeza de clasificacion modificados, o de un fine-tuning sobre una variante concreta. Este punto no puede confirmarse con la informacion disponible.

No hay ningun dato sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si hubo fine-tuning supervisado, quien lo realizo, con que hiperparametros y con que infraestructura. Tampoco se documenta si se aplicaron tecnicas de regularizacion, destilacion, RLHF o DPO (habitualmente irrelevantes en un encoder discriminativo de clasificacion). La referencia `arxiv:1910.09700` que aparece en los tags corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la plantilla por defecto de HuggingFace, y no a un paper del modelo.

## Capacidades
- Clasificacion de texto: es la unica capacidad declarada por el pipeline (`text-classification`). El modelo devuelve una o varias etiquetas con su probabilidad asociada para una secuencia de entrada.
- Ambito tematico probable: por el identificador `cv_profession_v2`, apunta a la clasificacion de profesiones o categorias ocupacionales a partir de texto de curriculos. No esta confirmado ni documentado.
- Generacion de texto: no. Es un encoder discriminativo, no un modelo generativo.
- Razonamiento, matematicas y codigo: no aplica.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Vision, audio, thinking mode: no soportado.
- Integracion en infraestructura de inferencia: los tags `text-embeddings-inference` y `endpoints_compatible` indican compatibilidad prevista con Text Embeddings Inference y con los Inference Endpoints de HuggingFace, aunque no hay documentacion que lo verifique.

## Casos de uso
- Clasificacion de curriculos por area profesional: el modelo recibiria el texto de un CV y devolveria la categoria ocupacional mas probable. Es el uso que sugiere el nombre del repositorio, pero requiere validar previamente el conjunto de etiquetas real y el idioma de entrada.
- Triaje en sistemas ATS (Applicant Tracking System): enrutado automatico de candidaturas hacia el reclutador o el equipo correspondiente segun el perfil detectado, reduciendo la revision manual de grandes volumenes de candidaturas.
- Etiquetado de ofertas de empleo: asignacion de categorias profesionales a ofertas publicadas en un portal, para construir taxonomias ocupacionales y mejorar la busqueda y las recomendaciones.
- Enriquecimiento de datos para entrenamiento: uso como etiquetador debil (weak labeling) para generar anotaciones a gran escala que despues alimenten un modelo mayor o un sistema de recomendacion de empleo.
- Analitica de mercado laboral: agregacion de miles de curriculos clasificados por profesion para elaborar informes de demanda de perfiles, siempre que la licencia permita el uso previsto.
- Filtrado de spam y contenido no relevante en portales de empleo: clasificacion binaria o multiclase de envios fraudulentos o fuera de tematica, si se reentrena o se adapta la cabeza de clasificacion.
- Pre-clasificacion en pipelines de cumplimiento normativo: deteccion de categorias de documentos antes de aplicar procesos de anonimizacion o pseudonimizacion exigidos por el RGPD.
- Prototipado y evaluacion comparativa: al ser un encoder de 278,8 M de parametros, permite experimentar en una unica GPU consumer con tiempos de entrenamiento y ajuste razonables, sirviendo como linea base frente a alternativas mejor documentadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada (aparece como "[More Information Needed]"), no hay tabla de resultados en el repositorio y la busqueda web realizada no ha devuelto ninguna fuente tecnica relacionada con el modelo.

## Requisitos de hardware
- Peso de los parametros: 278,8 M de parametros equivalen a aproximadamente 1,12 GB en fp32, 0,56 GB en fp16/bf16 y 0,28 GB en int8.
- VRAM estimada para inferencia: en torno a 1,2-1,6 GB en fp16 con lote pequeno y secuencias cortas (incluyendo activaciones); alrededor de 2,5 GB en fp32. Con lotes grandes y secuencias largas la VRAM crece de forma aproximadamente lineal con el producto lote x longitud.
- GPU consumer: cabe sin problema en cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Es un modelo apto para equipos de sobremesa y portatiles con GPU discreta.
- GPU de datacenter: T4, L4, A10G, L40S, A100 y H100 lo sirven con margen sobrado; en estas tarjetas el cuello de botella sera la CPU de preprocesado, no la GPU.
- CPU: la inferencia en CPU es viable para lotes pequenos o moderados, dado el tamano del modelo.
- Opciones de despliegue: pipeline `transformers` (TextClassificationPipeline), Text Embeddings Inference (tag `text-embeddings-inference`), HuggingFace Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime u Optimum para exportacion a ONNX, y servidores de inferencia tipo NVIDIA Triton. vLLM y llama.cpp no son adecuados: el primero esta orientado a decodificacion generativa y el segundo requiere pesos en formato GGUF, que no se publican.
- Latencia y throughput: no disponible. No hay ningun dato publicado de latencia, tokens por segundo ni ejemplos por segundo.

## Comparativa con modelos similares
Los datos de los modelos comparativos proceden de sus respectivas model cards publicas; los del modelo analizado, de los metadatos de su repositorio. No es posible comparar rendimiento porque este modelo no publica ninguna evaluacion.

| Modelo | Parametros | Contexto max. | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| selsar/cv_profession_v2 | 278,8 M | no disponible | text-classification | no disponible | 0 descargas, model card vacia |
| microsoft/deberta-v2-base | ~134 M | 512 tokens | encoder de proposito general | MIT | ampliamente validado |
| microsoft/deberta-v2-large | ~435 M | 512 tokens | encoder de proposito general | MIT | ampliamente validado |
| roberta-base | ~125 M | 512 tokens | encoder de proposito general | MIT | ampliamente validado |

En la practica, el modelo analizado compite con variantes de DeBERTa-v2 y RoBERTa ajustadas especificamente para clasificacion de curriculos o de ofertas de empleo. Frente a ellas, la ventaja seria un ajuste ya realizado para el dominio, y la desventaja, la ausencia total de documentacion, licencia y evaluacion, ademas de un numero de descargas nulo que impide contrastar su comportamiento con la comunidad.

## Limitaciones y advertencias
- Model card vacia: todos los apartados son la plantilla autogenerada. No hay informacion sobre datos de entrenamiento, etiquetas, idioma, hiperparametros ni evaluacion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. En la practica, la ausencia de licencia equivale a reserva de derechos por defecto en muchas jurisdicciones. Es imprescindible contactar con el autor antes de cualquier uso productivo.
- Etiquetas desconocidas: se desconoce el espacio de salida del clasificador (numero de clases, nombres, taxonomia). Sin esta informacion el modelo no es utilizable directamente.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificacion erronea: al no haber evaluacion publicada, se desconoce la precision, el recall y el comportamiento en clases minoritarias.
- Sesgos potencialmente no medidos: si el entrenamiento se hizo con curriculos reales, es probable la presencia de sesgos de genero, edad, origen o clase social asociados a profesiones. No hay ninguna auditoria publicada.
- Idiomas no declarados: no se puede asumir soporte multilingue ni siquiera para castellano.
- Longitud de contexto no declarada: si sigue la configuracion estandar de DeBERTa-v2, estaria limitado a 512 tokens, lo que obliga a truncar curriculos largos; esto no se confirma en la informacion disponible.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que no hay retroalimentacion, incidencias reportadas ni casos de uso verificados.
- Fecha del repositorio: creado y actualizado el 2026-09-10, con un minuto de diferencia entre ambos eventos, lo que sugiere una subida automatica sin mantenimiento posterior.
- Privacidad: un clasificador de curriculos trata datos personales. Cualquier despliegue en la UE exige una evaluacion de impacto y una base juridica conforme al RGPD.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/selsar/cv_profession_v2
- Paper de DeBERTa (referencia de la arquitectura): https://arxiv.org/abs/2006.03654
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla: https://mlco2.github.io/impact
- La busqueda web realizada no ha devuelto ninguna fuente tecnica relacionada con este modelo: los unicos resultados obtenidos son portales de descarga de software sin vinculacion con el repositorio.
