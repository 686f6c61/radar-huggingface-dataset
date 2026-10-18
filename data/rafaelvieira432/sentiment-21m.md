# Rafaelvieira432/SENTIMENT-21M

## Resumen

SENTIMENT-21M es un clasificador de sentimiento en portugués (PT-BR) publicado por el usuario Rafaelvieira432 en HuggingFace. Se presenta como un Transformer Encoder de arquitectura propia ("customizada"), con 21.010.435 parámetros (~21 M) y pesos distribuidos en FP16 (~40 MB), pensado explícitamente para escenarios de borde ("edge") donde la latencia importa: el autor declara menos de 15 ms por inferencia en una CPU básica. La tarea es de clasificación de tres clases: `negativo`, `neutro` y `positivo`.

El modelo no es generativo: no hay decoding, ni tool calling, ni capacidades multimodales. Es un encoder de clasificación con tokenizador BPE propio (`vocab.json` + `merges.txt`) y un mapeo de etiquetas en `labels.json`. Su relevancia potencial está en el nicho de moderación de contenido, triaje de tickets y automatización de atención al cliente en portugués con requisitos de latencia muy bajos y sin GPU.

Ahora bien, la información publicada es muy escasa: no hay detalles de entrenamiento (tokens, composición del corpus, proceso de ajuste), no hay resultados de benchmarks, no se ha fijado un `pipeline_tag` y el repositorio figura con 0 descargas, 0 likes y un tamaño reportado de 0.0 GB. Cualquier evaluación seria del modelo requiere inspeccionar los pesos y validarlos contra un conjunto de test propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Encoder "customizado" (sin paper ni detalle de capas publicado) |
| Parametros totales | 21.010.435 (~21,0 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; no se distribuyen GGUF ni INT8 (conversion posible, no documentada) |
| Idiomas soportados | portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.bin` (`pytorch_model.bin`, FP16, ~40 MB), mas `config.json`, `vocab.json`, `merges.txt`, `labels.json` e `infer.py` |
| Tarea | clasificacion de sentimiento, 3 clases (`negativo`, `neutro`, `positivo`) |
| Tokenizador | BPE propio (`vocab.json` + `merges.txt`) |
| Latencia declarada | < 15 ms en CPU basica (dato del autor, no verificado) |

## Arquitectura y entrenamiento

La model card describe un Transformer Encoder de diseño propio, sin especificar numero de capas, dimension de embedding, cabezas de atencion ni funcion de activacion; esos datos solo estarian en el `config.json` del repositorio, que no se ha podido inspeccionar. Se distribuye una cabeza de clasificacion sobre tres etiquetas y un tokenizador BPE entrenado presumiblemente para portugues, aunque no se documenta el tamano del vocabulario ni la politica de normalizacion Unicode.

No hay informacion sobre el corpus de entrenamiento: ni numero de tokens, ni fuentes, ni proporcion de ejemplos por clase, ni si hubo fine-tuning supervisado, ajuste con DPO/RLHF o calibracion de umbrales. Tampoco se publican metricas de validacion, matriz de confusion ni procedimiento de evaluacion. La unica innovacion declarada es el objetivo de eficiencia (encoder pequeno, FP16, inferencia en CPU por debajo de 15 ms), no una tecnica arquitectonica novedosa descrita en detalle.

## Capacidades

- Clasificacion de sentimiento en portugues (PT-BR) en tres clases discretas: negativo, neutro y positivo.
- Inferencia de bajisima latencia en CPU, orientada a entornos sin GPU.
- Ejecucion autonoma mediante el script `infer.py` incluido en el repositorio.
- Integracion potencial como clasificador previo o posterior a un LLM en pipelines de NLP.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: la unica lengua declarada es el portugues.
- No tiene vision, audio, thinking mode ni capacidades multimodales.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada ticket entrante como negativo, neutro o positivo para priorizar escalados y enrutar automaticamente los casos de cliente enfadado a un agente humano, con coste de inferencia despreciable en CPU.
- Moderacion de contenido en tiempo real: puntuar comentarios y reseñas en portugues para detectar tono negativo antes de publicacion, aprovechando la latencia declarada inferior a 15 ms por peticion.
- Enrutado en atencion al cliente automatizada: usar la etiqueta de sentimiento como señal en un arbol de decision que decida si responde un bot o se escala a un humano, sin necesidad de un LLM generativo.
- Analisis de opinion a escala sobre resenas de e-commerce: procesar lotes de decenas de miles de resenas en una sola maquina CPU para calcular la distribucion de sentimiento por producto o vendedor.
- Monitorizacion de redes sociales y menciones de marca: clasificar un flujo continuo de posts en portugues y disparar alertas cuando la proporcion de negativos supera un umbral.
- Preprocesado en pipelines de RAG o resumen: filtrar o etiquetar documentos y feedback de usuarios por tono antes de pasarlos a un modelo mayor, reduciendo coste y tokens procesados.
- Clasificacion en dispositivos de borde: integracion en aplicaciones moviles o embebidas con presupuesto de memoria de decenas de MB y sin acelerador hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de exactitud, F1, matriz de confusion ni comparaciones con lineas base en portugues. Tampoco hay mediciones reproducibles de latencia o throughput mas alla de la afirmacion de "< 15 ms en CPU basica", que carece de especificacion del hardware utilizado.

## Requisitos de hardware

- VRAM estimada: practicamente nula. Con 21 M de parametros, los pesos en FP16 ocupan ~40 MB; en FP32, ~84 MB; una conversion a INT8 quedaria en ~21 MB.
- GPU: no es necesaria. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede servirlo, pero no aporta ventaja relevante frente a CPU para este tamano.
- Cabe holgadamente en cualquier GPU consumer, e incluso en memoria unificada de dispositivos moviles y SBCs tipo Raspberry Pi.
- Opciones de despliegue documentadas: PyTorch en solitario mediante `infer.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (ninguno aplica de forma nativa a un encoder de clasificacion de este tamano); la exportacion a ONNX Runtime o TorchScript es viable tecnicamente pero no esta publicada ni verificada.
- Latencia y throughput: solo el dato declarado de < 15 ms en CPU basica por inferencia. No hay cifras de throughput por lote ni de rendimiento en GPU.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion son referencias generales de la categoria y no han sido verificados en la informacion disponible; se incluyen para contextualizar el orden de magnitud.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SENTIMENT-21M | 21,0 M (declarado) | no disponible | pt | Apache 2.0 | HuggingFace, 0 descargas, sin pipeline tag |
| BERTimbau base (referencia) | ~110 M | ~512 tokens | pt | MIT (referencia) | HuggingFace, ampliamente usado |
| DistilBERT multilingue (referencia) | ~135 M | ~512 tokens | multilingue | Apache 2.0 (referencia) | HuggingFace, muy extendido |
| Modelos de sentimiento en portugues de terceros | no disponible | no disponible | pt | variable | no disponible |

Frente a BERTimbau o DistilBERT, la propuesta de SENTIMENT-21M es aproximadamente cinco veces menor en parametros, lo que se traduce en menor coste de inferencia, pero tambien en menor capacidad de representacion. La diferencia practica solo puede establecerse con una evaluacion en un corpus de test en portugues, que el autor no publica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de exactitud o F1 frente a lineas base, por lo que el rendimiento real es desconocido.
- Sin documentacion del entrenamiento: se desconoce el corpus, el equilibrio de clases y los posibles sesgos adquiridos (dominio, registro, variedad dialectal del portugues).
- Arquitectura "customizada" sin paper ni detalle: dificulta la auditoria y la reproducibilidad; los hiperparametros solo estarian en el `config.json`.
- Clasificacion en tres clases con un modelo de 21 M: alta sensibilidad a sarcasmo, negaciones complejas, ironia y dominios alejados del corpus de entrenamiento; la clase `neutro` suele ser la mas fragil en este tipo de clasificadores.
- Cobertura linguistica limitada al portugues (PT-BR declarado): no debe usarse con texto en castellano, ingles u otras lenguas sin reevaluacion.
- Longitud de contexto desconocida: no hay garantia sobre el comportamiento con documentos largos ni sobre la estrategia de truncado.
- Riesgo de "alucinacion" no aplicable en sentido generativo, pero si de falsos positivos y negativos con alta confianza; no se documenta calibracion de probabilidades.
- Metadatos inconsistentes: el repositorio figura con 0.0 GB de tamano pese a declararse un `pytorch_model.bin` de ~40 MB, y las fechas de creacion y actualizacion (2026-10-17) son anomalas. Conviene verificar que los pesos esten realmente subidos antes de integrar.
- Sin senal de adopcion: 0 descargas y 0 likes, ningun `pipeline_tag` asignado; no hay evidencia de uso o validacion por terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero al no existir garantias del autor sobre el origen de los datos de entrenamiento, la responsabilidad sobre posibles reclamaciones de terceros recae en el integrador.
- Para produccion se recomienda encapsular el modelo tras una capa de validacion: umbral de confianza, fallback a revision humana y monitorizacion de la deriva en la distribucion de etiquetas.

## Enlaces

- HuggingFace: https://huggingface.co/Rafaelvieira432/SENTIMENT-21M
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a paginas de ayuda de YouTube (support.google.com/youtubetv, support.google.com/youtube, zhihu.com) sin ninguna relacion con SENTIMENT-21M.
- No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados al modelo.
