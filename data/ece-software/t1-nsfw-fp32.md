# ECE-Software/t1-nsfw-fp32

## Resumen

t1-nsfw-fp32 es un clasificador de imágenes publicado por ECE-Software en HuggingFace, orientado a la detección de contenido NSFW (not safe for work) y gore. Se distribuye como un fichero ONNX en precisión FP32 de 13,14 MB, lo que lo sitúa en la categoría de modelos muy ligeros, aptos para ejecutarse en CPU dentro de un servidor. No es un modelo generativo ni un modelo de lenguaje: es un clasificador de visión por computador con tres clases de salida (NSFL, NSFW y SFW) y un umbral de decisión documentado de 0,5.

El modelo se presenta como parte de una arquitectura de moderación por niveles o tiers: t1-nsfw-fp32 corresponde al tier T1, mientras que la model card menciona un modelo T0 en INT8. Según el autor, el modelo se ejecuta en el lado servidor sobre el 100 % de las subidas y detecta las imágenes NSFW que el modelo T0 INT8 dejaba pasar (concretamente, afirma cubrir las 16 imágenes NSFW que T0 no detectó). Esta estrategia de cascada —un filtro rápido en primera línea y un clasificador más costoso en segunda— es habitual en pipelines de moderación a gran escala.

Su relevancia práctica es doble: por un lado, el tamaño reducido (13,14 MB) y el formato ONNX con licencia Apache-2.0 lo hacen fácilmente desplegable en cualquier infraestructura con onnxruntime; por otro, la ausencia de documentación sobre arquitectura, datos de entrenamiento, métricas y preprocesado limita seriamente su evaluación rigurosa antes de llevarlo a producción. El repositorio muestra 0 descargas y 0 likes, sin evidencia de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es CNN, ViT u otra) |
| Parametros totales | no disponible; estimacion a partir del fichero: ~3,4 M de pesos asumiendo 4 bytes por peso en FP32, sin descontar el overhead del grafo ONNX |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imagen de una sola pasada) |
| Tipos de cuantizacion | FP32 (este repositorio); el autor menciona un modelo T0 en INT8 como parte del mismo sistema |
| Idiomas soportados | no disponible; no aplica directamente, la entrada es una imagen |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx, FP32) |
| Tarea | Deteccion NSFW/gore (clasificacion de imagen) |
| Clases de salida | NSFL, NSFW, SFW |
| Umbral documentado | 0,5 |
| Tamano del fichero | 13,14 MB |
| Tier | T1 (moderacion en lado servidor) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: la model card no indica si se trata de una red convolucional, un transformer de vision (ViT) o un hibrido. Tampoco se especifica el numero de parametros, la resolucion de entrada esperada, la normalizacion de pixeles ni el preprocesado previo a la inferencia. El unico dato estructural cierto es el formato de serializacion: un grafo ONNX en precision FP32 de 13,14 MB, con tres clases de salida y un umbral de decision de 0,5.

Tampoco hay informacion sobre el conjunto de entrenamiento: no se documentan el numero de imagenes, la composicion del dataset, el balance entre clases, el origen de las muestras, ni si se aplicaron tecnicas de ajuste como fine-tuning, aumento de datos o calibracion de umbrales. La model card unicamente aporta una nota operativa: el modelo esta pensado para ejecutarse en servidor sobre el 100 % de las subidas y, segun el autor, recupera las 16 imagenes NSFW que el modelo T0 en INT8 no detecto. Se trata de una afirmacion cualitativa sin conjunto de evaluacion descrito, sin particion de test identificada y sin metricas de precision, recall o F1 asociadas.

## Capacidades

- Clasificacion de imagenes en tres categorias: NSFL (contenido extremadamente explicito o gore), NSFW (contenido no apto para entornos laborales) y SFW (contenido seguro).
- Deteccion de contenido gore ademas de contenido sexual explicito, segun la propia descripcion de la tarea.
- Inferencia en CPU mediante onnxruntime con el proveedor CPUExecutionProvider, sin necesidad de GPU.
- Integracion en cascada con un modelo previo de menor coste (T0 INT8) como segunda etapa de filtrado.
- Ejecucion en servidor sobre la totalidad de las subidas, segun la model card, lo que implica un diseno orientado a throughput.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni modo de pensamiento: es exclusivamente un clasificador de imagen.
- No se documentan capacidades multimodales adicionales (audio, video, texto) ni soporte de lotes (batching) explicito.

## Casos de uso

- Moderacion de subidas en plataformas de contenido generado por el usuario: el modelo se ejecuta en servidor sobre cada imagen subida y devuelve una de las tres etiquetas; con umbral 0,5 permite bloquear o derivar a revision las muestras marcadas como NSFW o NSFL antes de que se publiquen.
- Segunda etapa de un pipeline en cascada: colocarlo detras de un clasificador INT8 mas rapido (T0) para revisar unicamente los casos dudosos o las imagenes que el primer filtro aprueba con baja confianza, aprovechando que el coste de un modelo de 13,14 MB es marginal.
- Pre-filtro previo a la revision humana: en equipos de trust and safety, reducir el volumen de imagenes que llegan a moderadores humanos, priorizando las clasificadas como NSFL o NSFW con alta confianza.
- Filtrado de corpus de imagenes para entrenamiento: depurar datasets de vision antes de usarlos para entrenar otros modelos, eliminando automaticamente muestras NSFW o gore que degradarian la calidad o introducirian riesgos legales.
- Revision de creatividades publicitarias: validar automaticamente banners, imagenes de campanas y materiales subidos por anunciantes antes de su publicacion en una plataforma.
- Moderacion en aplicaciones de mensajeria o comunidades con envio de imagenes: filtrar adjuntos en tiempo casi real en infraestructura sin GPU, gracias a la ejecucion en CPU con onnxruntime.
- Cumplimiento normativo y auditoria: generar un registro de clasificaciones para demostrar diligencia debida en la aplicacion de politicas de contenido (por ejemplo, obligaciones de moderacion derivadas del DSA europeo), siempre que se documenten previamente las metricas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni matrices de confusion, ni describe el conjunto de evaluacion utilizado.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU, HumanEval, GSM8K | no aplica | Modelo de clasificacion de imagen; no es generativo ni textual |
| Precision / recall en NSFW | no disponible | No se publican metricas ni conjunto de test |
| Recuperacion frente a T0 INT8 | 16 imagenes NSFW recuperadas (afirmacion del autor) | Sin descripcion del conjunto de evaluacion; no verificable con la informacion disponible |
| Latencia y throughput | no disponible | La model card no aporta mediciones |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Un modelo ONNX FP32 de 13,14 MB ocupa un espacio despreciable en memoria; el consumo real dependera del tamano de lote y de la resolucion de entrada, no documentados.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060 o superior, T4, L4) ejecutaria la inferencia sin dificultad, pero el cuello de botella estaria en el preprocesado de imagen y el transporte de datos, no en el modelo.
- A100 o H100: sobredimensionadas para este modelo; solo tendrian sentido como parte de una infraestructura compartida que procese lotes masivos.
- Compatibilidad con GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo e incluso en CPU. El modelo esta disenado explicitamente para ejecutarse con CPUExecutionProvider.
- Opciones de despliegue: onnxruntime (CPU, CUDA o TensorRT) es la via documentada en la model card. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un transformer autoregresivo con pesos en safetensors o GGUF.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables en el material proporcionado, y la busqueda web realizada no devolvio resultados relacionados con este modelo ni con clasificadores de moderacion de imagen equivalentes. La tabla recoge unicamente los datos confirmados del modelo evaluado.

| Modelo | Tipo | Tamano | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECE-Software/t1-nsfw-fp32 | Clasificador de imagen ONNX FP32 | 13,14 MB | NSFL / NSFW / SFW | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, numero de parametros, resolucion de entrada, preprocesado ni postprocesado, lo que impide reproducir la inferencia con garantias.
- Sin metricas publicadas: no hay precision, recall, F1, AUC ni curva ROC. No es posible estimar la tasa de falsos positivos y falsos negativos en produccion.
- Umbral fijo de 0,5: no se documenta si el umbral es calibrado, si varia por clase ni como se comporta con imagenes ambiguas (por ejemplo, desnudos artisticos o contenido medico).
- Riesgo de sesgo no evaluado: los clasificadores de moderacion tienden a sobrerrepresentar falsos positivos en determinados grupos demograficos, estilos artisticos o contextos culturales. No hay informacion sobre como se ha tratado este riesgo durante el entrenamiento.
- Etiqueta not-for-all-audiences: el repositorio esta marcado como no apto para todas las audiencias, coherente con que el modelo se ha entrenado sobre contenido sensible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con confianza alta, especialmente fuera de la distribucion de entrenamiento.
- Cero adopcion verificable: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de validacion por terceros.
- Fechas de metadatos anomalas: la creacion y actualizacion del repositorio figuran como octubre de 2026, con solo dos segundos de diferencia entre ambas, lo que sugiere una publicacion automatizada o incompleta.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. No obstante, el despliegue en produccion debe cumplir la normativa aplicable de moderacion de contenido y proteccion de datos.
- Metricas del autor no verificables: la afirmacion de haber recuperado 16 imagenes NSFW frente al modelo T0 INT8 no va acompanada de conjunto de evaluacion, particion de test ni metodologia.
- Idiomas no aplicables: al ser un clasificador de imagen, no hay soporte multilingue que evaluar, pero esto tambien implica que no se puede reutilizar para moderacion de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ECE-Software/t1-nsfw-fp32
- Paper, blog o repositorio asociado: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible
- Resultados de la busqueda web: los unicos resultados obtenidos corresponden a la ECE (Ecole Centrale d'Electronique, escuela de ingenieria francesa) y no guardan relacion con el modelo ni con su autor.
