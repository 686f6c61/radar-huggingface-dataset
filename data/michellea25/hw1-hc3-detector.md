# MichelleA25/hw1-hc3-detector

## Resumen

El modelo `MichelleA25/hw1-hc3-detector` es un checkpoint de clasificacion de texto publicado en HuggingFace por el usuario MichelleA25. Se distribuye en formato safetensors, se carga con la libreria transformers y esta orientado a la tarea `text-classification`, con 22.713.986 parametros totales y un repositorio de aproximadamente 0,1 GB.

El identificador del repositorio sugiere, sin que la model card lo confirme, un detector relacionado con el conjunto de datos HC3 (Human ChatGPT Comparison Corpus), es decir, una posible tarea de discriminacion entre texto humano y texto generado por IA. Esta interpretacion es una hipotesis derivada del nombre y no un dato verificado: la model card es la plantilla generada automaticamente por HuggingFace y no contiene descripcion, datos de entrenamiento ni etiquetas.

Por su tamano (22,7 millones de parametros, muy por debajo de los 110 millones de BERT-base y de los 66 millones de DistilBERT), el modelo es ligero y cabe en CPU y en cualquier GPU consumer, lo que lo hace apto para clasificacion de alto volumen con coste bajo. La ausencia de licencia declarada, de idiomas y de resultados de evaluacion limita seriamente su uso en produccion sin una validacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional), segun el tag `bert` del repositorio |
| Parametros totales | 22.713.986 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se publica la configuracion de la arquitectura) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, ONNX ni cuantizaciones int8/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Compatibilidad de despliegue | `endpoints_compatible`, `text-embeddings-inference` (segun tags) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

El unico dato estructural disponible son los tags del repositorio, que identifican el modelo como `bert` y como `text-classification`. La etiqueta `safetensors` confirma que los pesos se distribuyen en ese formato y el contaje real de parametros (22.713.986) indica una configuracion de encoder mas pequena que las referencias habituales de BERT-base (110 M) o DistilBERT (66 M); podria tratarse de una configuracion personalizada de capas y dimensiones ocultas reducidas, pero no se dispone de la configuracion (`config.json`) para confirmar numero de capas, dimension oculta, cabezas de atencion ni vocabulario.

No hay informacion sobre el procedimiento de entrenamiento: se desconocen el numero de tokens, la composicion del corpus, si hubo ajuste fino supervisado, destilacion, RLHF o DPO, ni los hiperparametros utilizados. La model card es la plantilla automatica de HuggingFace y todos los apartados relevantes (datos de entrenamiento, procedimiento, evaluacion, uso previsto, sesgos) aparecen marcados como "More Information Needed". El unico tag de tipo paper presente, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre el calculo de emisiones de carbono, incluido por defecto en la plantilla, y no a un articulo sobre este modelo. El nombre `hw1` sugiere un trabajo academico o de practica, sin que exista confirmacion documental.

## Capacidades

- Clasificacion de texto: es la unica capacidad confirmada por el pipeline declarado (`text-classification`). Devuelve etiquetas con puntuaciones de probabilidad sobre secuencias de entrada.
- Deteccion de texto generado por IA: capacidad plausible si el ajuste se hizo sobre el corpus HC3, pero no confirmada en la model card. Debe validarse antes de asumirla.
- Integracion como endpoint: los tags `endpoints_compatible` y `text-embeddings-inference` indican compatibilidad con el despliegue gestionado de HuggingFace y con Text Embeddings Inference.
- Generacion de texto, razonamiento, codigo, matematicas: no disponible. Es un encoder de clasificacion, no un modelo generativo, por lo que estas capacidades no aplican.
- Tool calling / function calling: no disponible. No es una capacidad propia de un clasificador BERT.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. No se declara ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Moderacion de contenido y filtrado previo: al ser un clasificador ligero de 22,7 M de parametros, puede ejecutarse sobre cada mensaje entrante para asignar una etiqueta binaria o multiclase y derivar solo los casos dudosos a un modelo mayor. El coste por peticion es de milisegundos en CPU.
- Deteccion de texto sintetico en plataformas educativas: si la etiqueta objetivo es humano frente a generado por IA, el modelo podria puntuar entregas o respuestas de foros. Requiere validacion obligatoria contra el dominio real, dado que no hay metricas publicadas.
- Enriquecimiento de pipelines de datos y deduplicacion semantica: uso del encoder como extractor de representaciones para agrupar documentos similares o etiquetar grandes volumenes de texto antes de indexarlos.
- Clasificacion de tickets de soporte: asignacion automatica de categoria o prioridad en un sistema de helpdesk, con el modelo desplegado detras de una API y reentrenado con etiquetas propias del negocio.
- Filtrado de resenas y deteccion de spam: puntuar resenas de comercio electronico para separar contenido genuino de contenido automatizado, ejecutando el modelo en lote sobre el historico.
- Preanotacion para anotacion humana: el modelo genera etiquetas preliminares que un equipo de anotadores corrige, reduciendo el coste de construccion de un conjunto de datos etiquetado propio.
- Clasificacion en el borde (edge) o en navegador: con 22,7 M de parametros, la exportacion a ONNX permite ejecutar la inferencia en dispositivos sin GPU, util para filtrado local de contenido sin enviar datos a un servidor.
- Servicio de embeddings de texto: mediante el tag `text-embeddings-inference`, el encoder puede exponerse como servicio de representaciones vectoriales para busqueda semantica o recomendacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion con datos y el repositorio no declara metricas de exactitud, F1, precision ni recall sobre ningun conjunto de prueba. Tampoco se especifica el conjunto de datos de evaluacion, los factores de analisis ni las metricas empleadas.

## Requisitos de hardware

- VRAM estimada: en fp32 son aproximadamente 91 MB de pesos (22.713.986 parametros x 4 bytes) mas activaciones; en fp16, unos 45 MB; en int8, unos 23 MB. Las activaciones dependen de la longitud de secuencia, que no se ha publicado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante). En A100, H100 o RTX 4090 el modelo queda limitado por el ancho de banda y el overhead de lanzamiento de kernels, no por la memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPU integradas. Tambien es viable en CPU sin aceleracion dedicada.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, HuggingFace Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), y exportacion a ONNX Runtime para CPU o edge. Las opciones de vLLM, llama.cpp, Ollama y TGI no aplican o no se han documentado para este modelo. Alternativas como TorchServe o FastAPI con batching dinamico son viables.
- Latencia y throughput estimados: no disponibles. No se publican mediciones, y cualquier cifra dependera del hardware, del tamano de lote y de la longitud de secuencia, que se desconoce.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a caracteristicas estructurales y de licencia. Los valores de los modelos de referencia corresponden a sus fichas publicas conocidas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MichelleA25/hw1-hc3-detector | 22,7 M | No disponible | No disponible | HuggingFace, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Apache-2.0 | HuggingFace, ampliamente usado |
| distilbert/distilbert-base-uncased | 66 M | 512 tokens | Apache-2.0 | HuggingFace, ampliamente usado |
| prajjwal1/bert-small | 29,1 M | 512 tokens | Apache-2.0 | HuggingFace |

La comparacion de calidad no es posible: no hay un solo resultado de evaluacion publicado para `hw1-hc3-detector`. Ademas, los modelos de referencia son checkpoints preentrenados de proposito general, mientras que este parece ser un ajuste fino para una tarea concreta, por lo que la comparacion directa carece de sentido sin evaluar ambos sobre el mismo conjunto de prueba.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar. No se declaran datos de entrenamiento, etiquetas, procedimiento, hiperparametros ni evaluacion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Se debe contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas desconocidos: no se declara ningun idioma. Un detector de texto generado por IA entrenado en un solo idioma degrada gravemente fuera de ese idioma.
- Sesgos desconocidos: no hay analisis de sesgos por subgrupo, dominio, registro o variedad dialectal. El riesgo es especialmente relevante en deteccion de texto generado, donde los falsos positivos pueden perjudicar a personas no nativas o a estilos de escritura minoritarios.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que es un clasificador, pero existe riesgo de clasificacion erronea con alta confianza, especialmente fuera de la distribucion de entrenamiento.
- Sin resultados de evaluacion: no hay exactitud, F1 ni matriz de confusion publicadas. Cualquier uso en produccion exige construir un conjunto de validacion propio y medir antes de desplegar.
- Etiquetas no documentadas: se desconoce el espacio de salida (`id2label`). Debe inspeccionarse el `config.json` antes de interpretar las puntuaciones.
- Longitud de contexto desconocida: si la configuracion sigue el estandar BERT, las secuencias se truncarian a 512 tokens, pero esto no esta confirmado y debe verificarse.
- Repositorio sin traccion: 0 descargas y 0 likes. No hay evidencia de uso comunitario, replicacion ni validacion por terceros.
- Contexto academico probable: el prefijo `hw1` sugiere un ejercicio de curso. Es razonable esperar un ajuste sobre un subconjunto pequeno de datos y sin depuracion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MichelleA25/hw1-hc3-detector
- Paper referenciado en los tags (Lacoste et al., 2019, Quantifying the Carbon Emissions of Machine Learning): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de ML: https://mlco2.github.io/impact#compute
