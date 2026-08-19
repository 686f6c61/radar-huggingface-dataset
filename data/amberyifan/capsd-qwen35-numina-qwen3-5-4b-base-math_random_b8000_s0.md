# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b8000_s0

## Resumen

Este modelo es un fine-tune de Qwen3.5-4B-Base, desarrollado por el usuario AmberYifan, especializado en tareas de razonamiento matemático. Se ha entrenado sobre un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_random_b8000_s0`, que combina datos de tipo "numina" (posiblemente referidos a razonamiento numérico) con una mezcla aleatoria de problemas matemáticos. El modelo tiene 4.539.265.536 parámetros y se presenta con pipeline `image-text-to-text`, aunque no se especifica si el fine-tune conserva capacidades multimodales.

La relevancia de este modelo radica en que parte de la base Qwen3.5, una familia de modelos que según la documentación oficial integra visión y lenguaje de forma nativa, con mejoras en razonamiento, codificación y capacidades de agente. Sin embargo, al ser un fine-tune generado automáticamente con LlamaFactory, la información pública es escasa: no se han publicado resultados de evaluación, ni detalles sobre el dataset de entrenamiento más allá del nombre, ni especificaciones de contexto o cuantización. Esto limita su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-4B-Base (no se detalla la arquitectura interna) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se ofrecen pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other (no se especifica la licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tuning) de Qwen3.5-4B-Base, realizado con la librería LlamaFactory. Según la información de la model card, el entrenamiento se llevó a cabo durante 1 época con un learning rate de 1e-5, tamaño de batch total de 64 (batch por dispositivo de 2, acumulación de gradientes de 8, 4 GPUs), optimizador AdamW y scheduler de tipo coseno con warmup del 3%. No se proporcionan detalles sobre la arquitectura interna del modelo base, aunque la serie Qwen3.5, según el blog oficial, emplea fusión temprana de modalidades (visión y lenguaje) sobre billones de tokens multimodales. No se indica si el fine-tune conserva la capacidad de procesamiento de imágenes o si se limita a texto.

El dataset de entrenamiento, por su nombre, sugiere una mezcla de datos de razonamiento matemático (posiblemente del conjunto "numina") con una selección aleatoria de problemas etiquetados como "math_random". No se especifica el número de tokens ni la composición exacta. Tampoco se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- No se han publicado capacidades específicas del modelo fine-tune en la model card.
- Al estar basado en Qwen3.5-4B-Base, se espera que herede las capacidades generales de la familia Qwen3.5, que incluyen razonamiento, codificación, comprensión visual y capacidades de agente, según la documentación oficial de Qwen.
- El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base puede procesar entradas multimodales, pero no hay confirmación de que el fine-tune mantenga esta funcionalidad.
- No se dispone de información sobre soporte de tool calling, function calling o modos de razonamiento extendido (thinking mode) para este modelo concreto.

## Casos de uso

Dado que no se han publicado evaluaciones ni ejemplos de uso, los casos de uso son potenciales y deben validarse experimentalmente:

- Resolución de problemas matemáticos: el modelo podría emplearse para resolver ejercicios de álgebra, cálculo o aritmética, aprovechando el entrenamiento específico en datos matemáticos. Sería necesario probar su precisión en conjuntos de referencia como GSM8K o MATH.
- Generación de explicaciones paso a paso: podría utilizarse en sistemas educativos para generar soluciones detalladas de problemas, aunque la calidad de las explicaciones no está verificada.
- Asistente de tutoría: integrado en chatbots educativos para responder preguntas de matemáticas, siempre que se valide su comportamiento en conversaciones multi-turno.
- Pre-entrenamiento para tareas específicas: al ser un fine-tune de un modelo base, podría servir como punto de partida para ajustes adicionales en dominios matemáticos concretos.
- Evaluación de razonamiento numérico: como modelo de referencia en investigaciones sobre fine-tuning de modelos de lenguaje para matemáticas.
- Prototipado rápido: para desarrolladores que necesiten un modelo de 4B parámetros con enfoque matemático y que puedan desplegarlo en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card contiene una entrada vacía (`results: []`), lo que indica que el autor no ha reportado métricas de evaluación. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otros conjuntos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en precisión FP16 se necesitan aproximadamente 9 GB de VRAM solo para los pesos. Con cuantización INT8 se reduciría a unos 4.5 GB, y con INT4 a unos 2.3 GB, aunque no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10) sería suficiente. Para cuantización INT4, cabría en GPUs de 6-8 GB como RTX 3060 8GB o RTX 4060.
- En consumer GPU: sí, es factible en GPUs de gama media con cuantización, pero no se proporcionan archivos GGUF ni AWQ, por lo que habría que cuantizar manualmente.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 4090), un modelo de 4B en FP16 suele alcanzar decenas de tokens por segundo, pero esto depende de la implementación y el batch.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este modelo. Como referencia, se puede comparar con el modelo base Qwen3-4B (de la generación anterior) y con otros modelos de 4B parámetros como Llama-3.2-3B o Phi-3-mini, pero no hay datos de rendimiento específicos de este fine-tune. La siguiente tabla resume características generales de modelos similares, basadas en información pública:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-Base (base) | 4.5B | No disponible | Apache 2.0 (según familia Qwen3.5) | Modelo base multimodal |
| Qwen3-4B | 4B | 32K (según documentación) | Apache 2.0 | Modelo anterior, solo texto |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community License | Modelo de texto, eficiente |

Esta comparativa es orientativa y no refleja el rendimiento real del fine-tune, que no ha sido evaluado.

## Limitaciones y advertencias

- Falta de documentación: la model card es autogenerada y no proporciona información sobre el dataset, el preprocesamiento, los resultados de entrenamiento ni las limitaciones específicas.
- Licencia incierta: la licencia se indica como "other", sin especificar los términos exactos. Esto puede impedir su uso comercial sin una revisión legal previa.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos. No se ha validado su precisión.
- Sesgos del dataset: el nombre del dataset sugiere una mezcla de datos "numina" y "math_random", pero no se conoce su procedencia ni si contiene sesgos o errores.
- Capacidades multimodales no confirmadas: aunque el pipeline es `image-text-to-text`, no se sabe si el fine-tune conserva la capacidad de procesar imágenes. Se recomienda probar antes de asumir esa funcionalidad.
- Sin benchmarks: la ausencia de métricas de evaluación impide conocer su rendimiento real y compararlo con otros modelos.
- Contexto y cuantización: no se especifica la longitud de contexto soportada ni se ofrecen versiones cuantizadas, lo que dificulta su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b8000_s0
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Modelo base Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
