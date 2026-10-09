# Romano0216/ml-retrieval

## Resumen

Romano0216/ml-retrieval es un prototipo de investigación publicado en HuggingFace por el usuario Romano0216. Se trata de una implementación de tipo Poolformer orientada a tareas de recuperación (retrieval), concretamente a recuperación imagen-texto según se deduce de la guía de evaluación incluida en su model card, que propone Flickr30k como primer banco de pruebas. El repositorio contiene un script de ejecución (`run.py`), un fichero de configuración de arquitectura, un fichero de hiperparámetros de entrenamiento y un checkpoint de inicialización en formato safetensors.

El dato más relevante para cualquier evaluador es que el checkpoint publicado no ha sido entrenado: el propio autor lo describe como una inicialización válida para pruebas de humo (smoke tests), no como un modelo con rendimiento verificado. El recuento real de parámetros en el fichero safetensors es de 49.600, una cifra extraordinariamente pequeña para una tarea de retrieval multimodal, y que contrasta con la etiqueta "large" que aparece en la configuración de escala de la model card. No se declara ninguna puntuación de benchmark.

Por tamaño, licencia y estado de desarrollo, el modelo no es apto para uso en producción ni para evaluación comparativa seria en su estado actual. Su interés es exclusivamente como punto de partida reproducible para experimentar con arquitecturas basadas en pooling, como esqueleto de código para montar un pipeline de entrenamiento con métricas controladas (varias semillas, baseline de capacidad comparable) o como caso de estudio de una model card que documenta honestamente la ausencia de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Poolformer (basada en pooling, sin atención clásica; la configuración declara atención de ventana deslizante) |
| Parametros totales | 49.600 (aproximadamente 0,05 M) |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (implementación personalizada, sin variantes publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (más `config.json`, `training_args.json`, `run.py`) |
| Escala declarada en la configuracion | "large" (etiqueta nominal; el recuento real es de 49.600 parámetros) |
| Fusion declarada | low rank |
| Activacion declarada | gelu tanh |
| Normalizacion declarada | ScaleNorm |
| Optimizador por defecto | lion, con planificador exponencial |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Poolformer, familia que sustituye el mecanismo de autoatención por operaciones de agregación espacial (pooling) como primitiva de mezcla de tokens, con el objetivo de reducir coste computacional y complejidad de memoria. Según la tabla de arquitectura de la model card, la variante publicada declara atención de ventana deslizante, fusión de bajo rango (low rank), activación gelu-tanh y normalización ScaleNorm. La escala declarada es "large", pero conviene subrayar la discrepancia: el fichero safetensors contiene 49.600 parámetros, por lo que la etiqueta de escala no se corresponde con un modelo de gran tamaño en el sentido habitual del término.

No hay entrenamiento documentado. La model card indica explícitamente que el checkpoint es una inicialización válida para smoke tests y que no se presenta como un checkpoint entrenado ni evaluado. La receta de experimento por defecto usa el optimizador Lion con un planificador de tasa de aprendizaje exponencial, y el propio autor advierte que son valores de arranque del script, no evidencia de una ejecución completada. Tampoco se documentan datos de entrenamiento: no hay número de tokens, ni composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. La guía de evaluación sugiere usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir un baseline de capacidad ajustada, lo que apunta a un escenario de recuperación imagen-texto, pero no se aporta ningún resultado.

## Capacidades

En su estado actual, el modelo no tiene capacidades funcionales verificadas. Lo que sigue describe la intención de diseño y lo que el repositorio permite hacer, no prestaciones demostradas.

- Recuperación de información: la arquitectura está etiquetada como "retrieval" y la guía de evaluación apunta a Flickr30k, tarea de recuperación imagen-texto, pero no existe checkpoint entrenado que ejecute dicha tarea.
- Extracción de representaciones: al ser un modelo de inicialización, puede producir embeddings, si bien estos serán aleatorios y sin valor semántico hasta que se entrene.
- Generación de texto: no soportada. No es un modelo de lenguaje causal ni dispone de cabeza de generación.
- Razonamiento, matemáticas y código: no soportados.
- Tool calling y function calling: no soportados.
- Agentes y razonamiento multi-paso: no soportados.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El pipeline de HuggingFace figura como no disponible y la carga automática genérica requiere un adaptador explícito, según advierte el autor.

## Casos de uso

Los casos siguientes son realistas dado el estado del arte del repositorio; varios de ellos son de investigación o de infraestructura, no de producto.

- Reproducción de experimentos con arquitecturas de pooling: el script `run.py` incluye un punto de entrada ejecutable y una configuración por defecto, lo que permite partir de una base ya montada para estudiar cómo se comporta la agregación por pooling frente a la autoatención en tareas de recuperación.
- Evaluación comparativa con protocolo controlado: la propia model card propone entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y evaluar en Flickr30k. El repositorio sirve como plantilla para ese protocolo, aunque hoy no aporte resultados.
- Pruebas de humo de pipelines de despliegue: con 49.600 parámetros, el checkpoint de inicialización permite verificar que un pipeline de carga, serialización y servicio funciona de extremo a extremo antes de sustituir los pesos por un modelo real.
- Estudio de formatos y artefactos de publicación: el repositorio separa arquitectura (`config.json`), receta de entrenamiento (`training_args.json`), pesos (`model.safetensors`) y código (`run.py`), por lo que es un ejemplo didáctico de empaquetado de un modelo de investigación.
- Docencia y divulgación sobre model cards: es un caso claro de documentación que declara de forma explícita la ausencia de benchmarks y de auditoría, útil para explicar buenas prácticas de transparencia frente a la práctica habitual de publicar cifras no verificadas.
- Punto de partida para ablaciones de componentes concretos: la combinación declarada (ventana deslizante, fusión low rank, gelu-tanh, ScaleNorm) permite diseñar experimentos de ablación componente a componente, siempre que se entrene el modelo correctamente.
- Prototipado de investigación en entornos sin GPU: el tamaño reducido hace que cualquier experimento de código, depuración o integración continua se pueda ejecutar en CPU sin coste apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no ha sido entrenado. Por tanto, no existen valores de MMLU, HumanEval, GSM8K, Recall@K ni de ninguna otra métrica que puedan tabularse o compararse.

## Requisitos de hardware

Los valores de memoria que siguen son cálculos aritméticos a partir del recuento real de parámetros (49.600); no proceden de mediciones publicadas.

- VRAM en fp32: aproximadamente 198 KB solo para los pesos (49.600 x 4 bytes), a los que hay que sumar activaciones y estado del optimizador si se entrena.
- VRAM en fp16/bf16: aproximadamente 99 KB solo para los pesos.
- GPU recomendadas: ninguna en particular. El modelo cabe en cualquier GPU, incluida una integrada, y con margen sobrado.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en CPU. No requiere ni una RTX 4090 ni aceleradores de datacenter.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, TGI, Ollama, llama.cpp ni transformers de forma automática. El autor advierte de que, al ser una implementación personalizada, las API genéricas de carga requieren un adaptador explícito. El único punto de entrada documentado es `python run.py --help`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existen modelos directamente comparables por tamaño: los codificadores de recuperación habituales en el ecosistema open source operan en el orden de 10^8 parámetros, cuatro órdenes de magnitud por encima de los 49.600 de este prototipo. La tabla siguiente resume la comparación cualitativa; los valores de parámetros de las alternativas son cifras públicas aproximadas, no datos extraídos de la documentación proporcionada.

| Modelo | Parametros (aprox.) | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Romano0216/ml-retrieval | 49.600 | Retrieval (imagen-texto, según guía) | no disponible | BSD-3-Clause | Prototipo sin entrenar, sin benchmarks |
| DPR (encoders tipo BERT-base) | ~110 M | Retrieval texto-texto | 512 tokens | Apache-2.0 (según variante) | Entrenado y evaluado en benchmarks públicos |
| BGE (variantes base/large) | ~110 M / ~335 M | Retrieval y embeddings de texto | hasta 512 tokens | MIT (según variante) | Entrenado, con resultados publicados en MTEB |
| CLIP ViT-B/32 | ~151 M | Retrieval imagen-texto y clasificación zero-shot | 77 tokens | MIT | Entrenado y ampliamente evaluado |

En resumen: la comparación relevante no es de rendimiento, ya que este repositorio no publica métricas, sino de madurez. Las alternativas citadas están entrenadas, cuantizadas, integradas en frameworks de despliegue y con resultados reproducibles; Romano0216/ml-retrieval es un esqueleto de investigación con pesos sin entrenar.

## Limitaciones y advertencias

- Checkpoint sin entrenar: el propio autor indica que los pesos son una inicialización para smoke tests y no un modelo entrenado. No deben usarse para inferencia real ni para extraer embeddings con valor semántico.
- Ausencia total de benchmarks: no hay ninguna métrica publicada, por lo que no puede afirmarse nada sobre su calidad en retrieval.
- Discrepancia de escala: la configuración declara escala "large" mientras que el recuento real de parámetros es de 49.600. Conviene tratar la etiqueta como nominal y no como indicador de capacidad.
- Sin auditoría de sesgos ni robustez: la model card declara explícitamente que el checkpoint no ha sido auditado en cuanto a robustez, equidad o transferencia de dominio.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no es un modelo generativo de texto. El riesgo equivalente es producir similitudes o rankings sin significado, dado que los pesos son aleatorios.
- Limitaciones de contexto e idioma: no se documenta ninguna longitud de contexto ni cobertura idiomática.
- Carga no estándar: al ser una implementación personalizada, las API genéricas (transformers, vLLM, TGI) no cargan el modelo sin un adaptador explícito, lo que añade trabajo de integración.
- Licencia: BSD-3-Clause permite uso comercial y modificación con atribución y conservación del aviso de licencia. No obstante, el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usa con datasets externos; esto es especialmente relevante en Flickr30k u otros corpus con condiciones propias.
- Advertencia para producción: no debe desplegarse en producción en su estado actual bajo ningún concepto. Cualquier resultado derivado debe documentarse de forma separada de los valores por defecto que se distribuyen en el repositorio.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Romano0216/ml-retrieval
- What is RAG? - Retrieval-Augmented Generation AI Explained (AWS): https://aws.amazon.com/what-is/retrieval-augmented-generation/
- RAG Techniques (IBM): https://www.ibm.com/think/topics/rag-techniques
- Retrieval-augmented generation (Wikipedia): https://en.wikipedia.org/wiki/Retrieval-augmented_generation
- AI Model Release Tracker (LM Market Cap): https://lmmarketcap.com/tools/model-release-tracker
- Fine-tune a search agent with multi-turn RL on Amazon SageMaker AI (AWS): https://aws.amazon.com/blogs/machine-learning/fine-tune-a-search-agent-with-multi-turn-rl-on-amazon-sagemaker-ai/
