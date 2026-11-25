# ahmedsamirtarjama/arabic-english-pii-gliner

## Resumen

arabic-english-pii-gliner es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion y redaccion de informacion personal identificable (PII) en textos en arabe e ingles. Lo desarrolla el usuario de Hugging Face ahmedsamirtarjama y se construye como un fine-tuning del modelo urchade/gliner_multi-v2.1, un extractor de entidades zero-shot basado en la arquitectura GLiNER (Generalist and Lightweight Named Entity Recognition). El modelo se distribuye bajo la libreria gliner y el pipeline token-classification.

El problema que aborda es concreto: la mayoria de los sistemas de deteccion de PII estan optimizados para ingles y descuidan el arabe, un idioma con alta demanda en procesos de cumplimiento normativo y proteccion de datos en regiones como Oriente Proximo. Al heredar la naturaleza zero-shot de GLiNER, el modelo permite definir tipos de entidad mediante prompts en lenguaje natural, lo que facilita adaptar la deteccion a esquemas de PII personalizados sin reentrenamiento.

El modelo es relevante por su enfoque bilingue arabe-ingles en una tarea sensible para produccion (anonimizacion de datos, cumplimiento de RGPD y normativas equivalentes), aunque su adopcion es todavia muy limitada: cuenta con 3 descargas y 0 likes en el momento de la consulta, y su acceso esta restringido mediante gating en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder transformer con cabecera de extraccion de entidades zero-shot), fine-tuning de urchade/gliner_multi-v2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | research-only (licencia "other", solo investigacion) |
| Formato de pesos | no disponible (repo de 1.2 GB, compatible con la libreria gliner y PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER, una arquitectura que combina un encoder transformer bidireccional con una cabecera que proyecta simultaneamente representaciones de tokens y de etiquetas de entidad, permitiendo reconocer entidades definidas en tiempo de inferencia mediante prompts textuales (zero-shot NER). Al derivar de urchade/gliner_multi-v2.1, hereda la capacidad multilingue del modelo base y anade un ajuste especifico sobre datos de PII en arabe e ingles.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del fine-tuning sobre el modelo base. La informacion disponible se limita a los metadatos del repositorio y a la relacion de derivacion con urchade/gliner_multi-v2.1.

## Capacidades

- Deteccion de entidades de tipo PII (nombres, direcciones, identificadores, datos de contacto y similares) en textos en arabe e ingles.
- Extraccion de entidades zero-shot: los tipos de entidad se especifican mediante prompts en lenguaje natural, sin necesidad de reentrenar.
- Clasificacion de tokens (pipeline token-classification) orientada a tareas de redaccion y anonimizacion.
- Soporte bilingue arabe-ingles en un unico modelo.
- Capacidad multilingue heredada del modelo base GLiNER multi-v2.1 (el alcance efectivo del fine-tuning se limita a ar/en).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Anonimizacion de documentos legales y administrativos: el modelo identifica nombres, direcciones e identificadores en expedientes bilingues arabe-ingles antes de su publicacion o comparticion con terceros.
- Cumplimiento de proteccion de datos (RGPD y normativas equivalentes): integrado en pipelines de preprocesado para localizar y enmascarar PII en bases de datos de texto antes de su uso analitico.
- Redaccion de registros de atencion al cliente: deteccion de datos personales en transcripciones de soporte en arabe e ingles para su eliminacion previa al almacenamiento o al entrenamiento de otros modelos.
- Preprocesado de corpus para investigacion: filtrado de PII en datasets de texto arabe-ingles antes de su publicacion o uso en experimentos, gracias a la naturaleza zero-shot que permite definir el esquema de entidades segun el corpus.
- Enmascaramiento en pipelines de datos sanitarios o financieros: identificacion de identificadores personales en informes bilingues mediante prompts de entidad adaptados al dominio, sin reentrenamiento.
- Construccion de esquemas de PII personalizados: al ser zero-shot, permite definir categorias propias de entidad (por ejemplo, numeros de documento nacional o identificadores fiscales) y evaluar su deteccion sobre textos ar/en.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el tamano del repositorio (1.2 GB) sugiere pesos en precision completa o mixta del modelo base GLiNER multi-v2.1, lo que en la practica permite inferencia en GPU de consumo con memoria moderada.
- GPU recomendadas: no disponibles de forma especifica; por el perfil de GLiNER (encoder de tamano contenido), es razonable esperar ejecucion en GPUs de consumo tipo RTX 3060/4090, si bien no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: probable por el tamano del repositorio, aunque no confirmado en la informacion disponible.
- Opciones de despliegue: la libreria gliner (referenciada en los tags) y el pipeline token-classification de Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-english-pii-gliner | no disponible | no disponible | ar, en | research-only | Gated en Hugging Face |
| urchade/gliner_multi-v2.1 (modelo base) | no disponible | no disponible | multilingue | no disponible | Publico en Hugging Face |
| Modelos NER multilingues genericos (p. ej., variantes de XLM-R) | no disponible | no disponible | multilingue | variable | Publicos |

La comparativa se limita al modelo base por falta de datos publicados sobre alternativas especificas de deteccion de PII arabe-ingles en la informacion disponible.

## Limitaciones y advertencias

- Licencia research-only: el uso comercial esta restringido; es imprescindible revisar las condiciones del repositorio antes de cualquier despliegue en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion y a la automatizacion de descargas.
- Validacion empirica inexistente: con 3 descargas y 0 likes, no hay evidencia publica de calidad, cobertura ni tasas de error en la deteccion de PII.
- Riesgo de alucinacion y falsos positivos/negativos en la extraccion de entidades, especialmente en variedades dialectales del arabe o en texto con ruido.
- Cobertura limitada a arabe e ingles; el rendimiento fuera de estos idiomas no esta garantizado pese a la base multilingue.
- Ausencia de datos sobre contexto maximo, cuantizaciones y benchmarks dificulta la planificacion de capacidad en produccion.
- Al tratarse de un fine-tuning de un modelo zero-shot, el comportamiento depende en gran medida de la formulacion de los prompts de entidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedsamirtarjama/arabic-english-pii-gliner
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
