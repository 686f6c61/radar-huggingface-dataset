# amc76/slangguard-pipeline

## Resumen

SlangGuard champion adapter es un adaptador LoRA publicado en Hugging Face por el usuario amc76, construido sobre el modelo base `indobenchmark/indobert-base-p1`, un encoder transformer de tipo BERT entrenado para indonesio. El adaptador forma parte del pipeline de reentrenamiento del proyecto SlangGuard, cuyo objetivo declarado es la deteccion de lenguaje coloquial o jerga (slang) en textos en indonesio. El repositorio funciona como un puntero movil al "campeon" actual del pipeline: cada commit representa un modelo que ha superado la regla de promocion interna, de modo que la revision de Hugging Face identifica la version servida en cada momento.

La relevancia de esta publicacion es operativa mas que cientifica. No se trata de un modelo con model card completa ni con resultados de evaluacion publicados, sino de un artefacto de despliegue que el autor mantiene actualizado y que remite a otro repositorio (`amc76/slangguard-indobert-lora-replay`) para la version con documentacion completa. El tamano del repositorio es de 0,0 GB, lo que es coherente con un adaptador LoRA de dimension reducida sobre un encoder base de aproximadamente 124 millones de parametros.

La informacion disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas soportados en los metadatos, no hay resultados de benchmarks y la model card se limita a describir el mecanismo de versionado del pipeline. Cualquier evaluacion de capacidades debe por tanto tomarse con cautela y verificarse contra el repositorio enlazado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre encoder transformer BERT (IndoBERT base) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base `indobert-base-p1` tiene ~124 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; IndoBERT base usa tipicamente 512 tokens, sin confirmar en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles en los metadatos; el modelo base esta orientado a indonesio |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado con la libreria PEFT, acoplado al checkpoint `indobenchmark/indobert-base-p1`. IndoBERT base es un encoder transformer de la familia BERT entrenado sobre corpus en indonesio; el adaptador anade matrices de baja dimension en las capas del encoder para ajustar la tarea especifica de SlangGuard sin reentrenar el modelo completo. No se dispone de informacion sobre el rango del adaptador, las capas objetivo ni la configuracion exacta de LoRA.

Respecto al entrenamiento, la model card solo indica que el pipeline reentrena y promociona modelos segun una "regla de promocion" no detallada, y que cada commit corresponde a un campeon. No se especifican el volumen de datos, la composicion del dataset, si hubo anotacion humana, ni si se aplicaron tecnicas de aumento de datos o validacion cruzada. Tampoco se documenta si el adaptador se entreno con objetivos de clasificacion de tokens, clasificacion de secuencia u otro tipo de tarea. Toda esta informacion deberia consultarse en el repositorio enlazado por el autor.

## Capacidades

- Clasificacion o etiquetado de texto en indonesio orientado a la deteccion de jerga y lenguaje coloquial, segun el proposito declarado del proyecto SlangGuard.
- Ajuste fino eficiente sobre un encoder BERT mediante LoRA, lo que permite servir variantes del modelo con un coste de almacenamiento reducido.
- Versionado por revision: cada commit del repositorio identifica un campeon distinto del pipeline, lo que facilita la trazabilidad de despliegues.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues: no documentadas; el modelo base esta especializado en indonesio.

## Casos de uso

- Moderacion de contenido en plataformas de habla indonesia: el adaptador puede integrarse como clasificador de jerga para marcar mensajes que requieran revision humana, aprovechando el ajuste fino sobre IndoBERT para vocabulario coloquial.
- Normalizacion de texto para pipelines de NLP: detectar y etiquetar terminos de jerga antes de pasarlos a sistemas de analisis de sentimiento o extraccion de entidades, reduciendo errores por vocabulario fuera de dominio.
- Investigacion sociolinguistica: uso del adaptador como herramienta de anotacion asistida de corpus de indonesio informal, con validacion manual posterior.
- Filtrado previo en sistemas de busqueda o recuperacion: marcar consultas con jerga para enrutarlas a indices o expansiones de consulta especificos.
- Despliegue de bajo coste en produccion: al ser un adaptador LoRA sobre un encoder de ~124 M de parametros, puede servirse en CPU o en GPUs de gama baja con latencia baja, siempre que se valide su calidad con datos propios.
- Control de versiones de modelos en MLOps: el patron de repositorio con un campeon por commit sirve como referencia para implementar promocion automatica de modelos en pipelines internos.
- Deteccion de abuso en comunidades online: clasificacion de mensajes con jerga ofensiva o evasiva como primera capa de un sistema de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador LoRA sobre un encoder de ~124 M de parametros, la inferencia en fp32 requiere del orden de 0,5 GB y en fp16 del orden de 0,25 GB, sin contar overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; tambien es viable en CPU para lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PEFT con PyTorch, integracion en pipelines de Hugging Face Transformers, exportacion a ONNX o TorchScript para servicios de inferencia; no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlangGuard champion adapter (este) | Adaptador LoRA sobre ~124 M | No disponible | Deteccion de jerga en indonesio | CC BY-SA 4.0 | Hugging Face, revision movil |
| indobenchmark/indobert-base-p1 | ~124 M | No disponible en esta ficha | Encoder general indonesio | No disponible en esta ficha | Hugging Face |
| amc76/slangguard-indobert-lora-replay | No disponible | No disponible | Version documentada del proyecto SlangGuard | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de model card completa: no hay informacion sobre datos de entrenamiento, metricas, sesgos ni limitaciones declaradas por el autor.
- Riesgo de alucinacion y falsos positivos: al ser un clasificador de jerga sobre un encoder, puede etiquetar incorrectamente terminos polisemicos o regionalismos no vistos en entrenamiento.
- Cobertura linguistica restringida: el modelo base esta orientado a indonesio; su uso en otros idiomas o en variantes dialectales no esta documentado.
- Licencia CC BY-SA 4.0: permite uso comercial pero impone atribucion y compartir-al-igual de las obras derivadas, lo que puede condicionar la distribucion de productos que incorporen el adaptador.
- Repositorio movil: los archivos cambian cuando el pipeline promociona un nuevo campeon, por lo que fijar una revision concreta es imprescindible para reproducibilidad.
- Sin garantias de calidad en produccion: no hay benchmarks publicados ni validacion externa; se recomienda evaluar con un conjunto de test propio antes de desplegar.
- Dependencia del modelo base: el adaptador no es autonomo y requiere descargar `indobenchmark/indobert-base-p1`, cuyas condiciones de licencia deben verificarse por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/amc76/slangguard-pipeline
- Version documentada del modelo: https://huggingface.co/amc76/slangguard-indobert-lora-replay
- Repositorio del proyecto: https://github.com/Akmal76/slangguard
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
