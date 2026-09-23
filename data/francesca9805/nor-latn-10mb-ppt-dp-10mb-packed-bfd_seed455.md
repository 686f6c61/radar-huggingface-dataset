# francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455

## Resumen

nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 es un ajuste fino (fine-tune) del modelo monolingue goldfish-models/nor_latn_10mb, desarrollado por el usuario de HuggingFace francesca9805 en el contexto de un proyecto de investigacion sobre tokenizadores de la Universidad de Groningen (el enlace de Weights & Biases apunta a un proyecto llamado "new-tokenizers"). Se trata de un modelo generativo de texto de arquitectura transformer decoder-only tipo GPT-2, con 39.087.104 parametros (aproximadamente 39 millones), entrenado mediante supervised fine-tuning (SFT) con la libreria TRL.

El modelo no resuelve una tarea de produccion, sino que funciona como artefacto experimental: forma parte de una familia de ejecuciones con nombres sistematicos (idioma, tamano del corpus base, tamano del corpus de ajuste, estrategia de empaquetado y semilla aleatoria) que busca medir el efecto de distintas decisiones de datos y tokenizacion en modelos de muy baja escala. El sufijo "nor_latn_10mb" indica noruego en alfabeto latino con un corpus base de 10 MB, y "seed455" fija la semilla del experimento.

Su relevancia es fundamentalmente metodologica: permite reproducir y comparar variantes de ajuste sobre un modelo base muy pequeno y con un coste computacional minimo, lo que facilita experimentos controlados en investigacion de bajo recurso. No es un modelo apto para uso comercial o para tareas generales de asistencia, ya que no se ha publicado informacion sobre su licencia, idiomas, contexto o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun los tags del repositorio: gpt2, transformers) |
| Parametros totales | 39.087.104 (aproximadamente 39,09 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio |
| Tipos de cuantizacion | No se documentan; pesos publicados sin cuantizar en safetensors |
| Idiomas soportados | No declarados en el repositorio; el modelo base esta etiquetado como noruego en alfabeto latino (nor_latn) |
| Licencia | No disponible (la model card solo contiene el marcador de posicion "licence: license") |
| Formato de pesos | safetensors (tag del repositorio); tamano del repo 0,1 GB |
| Modelo base | goldfish-models/nor_latn_10mb |
| Metodo de ajuste | SFT mediante TRL 0.23.0 |
| Framework declarado | Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2, es decir, atencion causal completa con normalizacion previa a la capa y embeddings posicionales aprendidos, sin innovaciones de atencion eficiente ni mecanismos de mezcla de expertos. Con 39,09 millones de parametros, se situa muy por debajo de GPT-2 small (124 millones) y de cualquier modelo de uso general actual; el repositorio no detalla la configuracion exacta de capas, dimension de embedding o numero de cabezas, ni el tamano de vocabulario heredado del base. Los tags del repositorio confirman que es compatible con text-generation-inference y con endpoints de HuggingFace.

El entrenamiento consistio en un ajuste supervisado (SFT) con TRL sobre el checkpoint goldfish-models/nor_latn_10mb, segun los metadatos del autor. El nombre del modelo sugiere un corpus empaquetado (packed) de 10 MB y un identificador de configuracion (bfd) junto con una semilla concreta (seed455), pero no se publican detalles sobre la composicion del dataset, el numero de tokens de entrenamiento, la existencia de RLHF o DPO (no se mencionan) ni hiperparametros de entrenamiento. Tampoco se documenta ninguna innovacion tecnica adicional; el valor del artefacto esta en la trazabilidad experimental, ya que el enlace de Weights & Biases (run c37tancx) permite consultar las metricas de la ejecucion.

## Capacidades

- Generacion de texto autorregresiva basica, heredada del modelo base GPT-2 de 39 millones de parametros.
- Generacion condicionada por formato conversacional: el ejemplo de la model card pasa una lista de mensajes con el rol "user", lo que indica que el ajuste SFT introdujo cierta estructura de chat o instrucciones.
- Cobertura linguistica probable del noruego en alfabeto latino, segun el modelo base; no hay evaluacion publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles ni documentadas; el nombre del modelo apunta a un unico idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Integracion tecnica: compatible con la libreria transformers mediante pipeline("text-generation") y con text-generation-inference.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo forma parte de una serie de ejecuciones con nombres sistematicos dentro de un proyecto de investigacion sobre tokenizadores, por lo que su uso principal es servir de punto de comparacion reproducible frente a otras variantes de la misma familia con la misma semilla o con distinto corpus.
- Estudios de escala en aprendizaje de bajo recurso: con 39 millones de parametros y un corpus base de 10 MB, es util para analizar como se comporta un transformer pequeno cuando el volumen de datos es muy limitado, sin coste apreciable de computo.
- Docencia y formacion en NLP: sirve para ilustrar de forma practica el flujo completo de ajuste con TRL, carga con transformers y publicacion en HuggingFace, ya que se puede entrenar y ejecutar en portatil.
- Generacion de texto en noruego con fines exploratorios: puede emplearse para producir borradores o muestras sinteticas en alfabeto latino noruego, siempre con revision humana y asumiendo baja calidad y riesgo alto de incoherencia.
- Pruebas de integracion y CI para pipelines de inferencia: su tamano minimo lo hace adecuado como modelo de pruebas para validar despliegues con text-generation-inference, endpoints o servicios de terceros (por ejemplo FriendliAI) antes de pasar a modelos grandes.
- Baseline en investigacion comparativa: puede actuar como referencia inferior en tablas de evaluacion de modelos noruegos o escandinavos, para medir la ganancia que aportan modelos de mayor tamano o de arquitecturas mas modernas.
- Analisis de artefactos y sesgos en corpus pequenos: permite inspeccionar que tipo de texto aprende y que estereotipos reproduce un modelo entrenado con un corpus de 10 MB, como caso de estudio metodologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes en noruego) y el repositorio no aporta metricas de validacion mas alla del enlace a la ejecucion de Weights & Biases.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en FP32 y 80 MB en FP16/BF16 para los pesos; con cache KV y activaciones, menos de 1 GB en la practica.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer sirve. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4060, etc.), e incluso ejecucion en CPU sin penalizacion significativa.
- Opciones de despliegue: pipeline de transformers; text-generation-inference (tag declarado en el repositorio); servidores compatibles con la arquitectura GPT-2 como vLLM o TGI; llama.cpp y Ollama solo si se convierte previamente a GGUF, conversion que no se distribuye en el repositorio. El modelo tambien aparece referenciado en plataformas de inferencia gestionada como FriendliAI para variantes hermanas.
- Latencia y throughput estimados: no disponible. Por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 | 39,09 M | No disponible | Fine-tune SFT de GPT-2 sobre noruego | No disponible | HuggingFace, 0 descargas |
| goldfish-models/nor_latn_10mb (modelo base) | No disponible | No disponible | GPT-2 monolingue entrenado con 10 MB de noruego | No disponible | HuggingFace |
| francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 | No disponible | No disponible | Variante hermana con corpus de ajuste de 100 MB | No disponible | HuggingFace |
| francesca9805/ita-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455 | No disponible | No disponible | Variante hermana para italiano, misma receta | No disponible | HuggingFace |
| GPT-2 small (referencia de la familia) | 124 M | 1024 tokens | Transformer decoder-only en ingles | MIT | Ampliamente disponible |

Las variantes hermanas comparten receta de ajuste y solo cambian el idioma del corpus base o el tamano del corpus de ajuste (10 MB frente a 100 MB), lo que las convierte en el punto de comparacion mas directo. No hay datos de rendimiento publicados para ninguno de estos modelos, por lo que la comparativa se limita a parametros, procedencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un corpus de 10 MB, es esperable que reproduzca los sesgos y las limitaciones de representatividad de ese corpus, sin que exista ninguna auditoria publicada.
- Riesgo de alucinacion: muy alto. Con 39 millones de parametros y un ajuste sobre un corpus minimo, la coherencia a medio plazo y la fidelidad factual son muy limitadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el modelo solo esta orientado, en el mejor de los casos, al noruego en alfabeto latino; el ejemplo de la model card usa una pregunta en ingles, lo que no implica que el modelo responda correctamente en ese idioma.
- Restricciones de licencia: la model card incluye unicamente el marcador "licence: license" sin texto legal. No hay autorizacion explicita de uso comercial, por lo que no debe desplegarse en produccion ni en productos de pago sin aclarar antes la licencia con el autor.
- Caveat de contexto largo: al no declararse la ventana de contexto, no debe asumirse que soporta conversaciones multi-turno extensas ni documentos largos.
- Caveat de produccion: el modelo acumula 0 descargas y 0 likes, y no presenta benchmarks ni validacion humana, por lo que carece de evidencia de calidad.
- Caveat de trazabilidad: el repositorio no documenta hiperparametros, composicion del dataset ni criterios de seleccion del checkpoint final, mas alla de la ejecucion registrada en Weights & Biases.
- Uso responsable: cualquier salida debe tratarse como texto no verificado y revisarse antes de su difusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Variante hermana con corpus de 100 MB: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante hermana en italiano: https://huggingface.co/francesca9805/ita-latn-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana en ingles desplegada en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante noruega de 100 MB con semilla 3407 en FriendliAI: https://friendli.ai/models/fpadovani/nor-latn-10mb-ppt-Dp-100mb_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c37tancx
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
