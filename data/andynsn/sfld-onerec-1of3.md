# Andynsn/SFLD-OneRec-1of3

## Resumen

SFLD-OneRec-1of3 es un checkpoint de investigación derivado del proyecto OneRec, un modelo generativo para sistemas de recomendación que unifica las etapas de recuperación y ranking en un único modelo encoder-decoder. Este artefacto concreto es el resultado de un piloto de destilación local denominado Student-Frontier Local Distillation (SFLD), en el que un modelo estudiante de 1,7B parámetros (OneRec-1.7B) se entrena para imitar el comportamiento de un teacher de 8B parámetros (OneRec-8B, congelado y no incluido en el repositorio). El autor, Andynsn, lo publica como un checkpoint privado con metadatos de ejecución completos, orientado a reproducibilidad y análisis de la técnica de destilación.

El modelo tiene 2.131.878.912 parámetros (aproximadamente 2,13B) y se distribuye en formato safetensors. Aunque el tag indica una base Qwen3, la arquitectura exacta no se especifica en la model card; el paper de OneRec describe una arquitectura encoder-decoder. No se trata de un modelo de propósito general, sino de un artefacto experimental para el estudio de destilación en sistemas de recomendación. Su relevancia radica en explorar si la destilación local con un teacher de frontera puede transferir capacidades de recomendación a un modelo más pequeño, reduciendo costes de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (según paper OneRec; tag indica Qwen3, sin confirmar) |
| Parametros totales | 2.131.878.912 (2,13B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se basa en la arquitectura OneRec, que según el informe técnico (arXiv 2506.13695) emplea un modelo encoder-decoder para generar directamente los ítems preferidos por el usuario, guiado por un modelo de recompensa. Esto sustituye el enfoque tradicional en cascada (recuperación, pre-ranking, ranking) por un único paso generativo. El tag de HuggingFace indica "qwen3", lo que sugiere que la implementación concreta podría derivar de la familia Qwen3, aunque no se confirma en la documentación.

El entrenamiento se realizó mediante SFLD: el estudiante OneRec-1.7B se destiló a partir del teacher OneRec-8B (congelado). Los datos de entrenamiento corresponden a una variante determinista de UID-hash (1/3), pero ni los datos crudos ni la caché del teacher se incluyen en el repositorio. El protocolo de entrenamiento usó seis GPUs RTX 6000D, con microbatch por dispositivo de 1, acumulación de gradientes de 22 y un batch global efectivo de 132. El runtime fue PyTorch 2.9.0+cu128 con atención SDPA en BF16. El commit upstream de OpenOneRec se referencia como a969edcadd579a06c1966ae1db5984e02f48beff.

## Capacidades

- Generación de recomendaciones de extremo a extremo: el modelo produce directamente los ítems preferidos (p. ej., vídeos) sin etapas intermedias de recuperación y ranking.
- Destilación de conocimiento: el checkpoint demuestra la viabilidad de transferir capacidades desde un teacher de 8B a un estudiante de 1,7B mediante SFLD.
- Reproducibilidad experimental: incluye metadatos de ejecución completos en el directorio `experiment/`, lo que permite auditar el proceso de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe, al ser un artefacto de investigación especializado.

## Casos de uso

- Investigación en destilación de modelos de recomendación: el checkpoint sirve como referencia para estudiar cómo la SFLD afecta a la calidad de las recomendaciones generadas por un modelo pequeño frente a su teacher.
- Evaluación de técnicas de compresión: permite comparar el rendimiento de un modelo de 1,7B destilado contra el teacher de 8B en tareas de recomendación, midiendo el trade-off entre precisión y coste computacional.
- Fine-tuning posterior para dominios específicos: al ser un checkpoint intermedio, puede usarse como punto de partida para adaptar el modelo a conjuntos de datos de recomendación concretos (p. ej., vídeo, comercio electrónico) mediante entrenamiento adicional.
- Análisis de procedencia y reproducibilidad: el directorio `experiment/` facilita la verificación de los hiperparámetros y el flujo de datos, útil para auditorías de integridad científica.
- Desarrollo de sistemas de recomendación generativa en entornos con recursos limitados: si la destilación resulta efectiva, el modelo podría desplegarse en producción donde un modelo de 8B sería inviable, aunque esto requiere validación adicional.
- Benchmarking de métodos de destilación local: sirve como caso de estudio para comparar SFLD con otras técnicas de destilación (p. ej., destilación clásica, KD con logits) en el dominio de la recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, NDCG ni comparaciones con otros modelos. El autor no proporciona datos de rendimiento en tareas de recomendación ni en benchmarks generales de lenguaje.

## Requisitos de hardware

- El entrenamiento se realizó con seis GPUs RTX 6000D (48 GB VRAM cada una), usando BF16 y SDPA.
- Para inferencia, el modelo tiene 2,13B parámetros; en BF16, el peso ocupa aproximadamente 4,3 GB, por lo que cabría en GPUs consumer con 8 GB o más (p. ej., RTX 3060, RTX 4060) si se carga en memoria, aunque no se han publicado requisitos oficiales.
- No se dispone de información sobre cuantización (GGUF, AWQ, etc.) ni sobre latencia o throughput.
- Opciones de despliegue: al ser un checkpoint safetensors, podría servirse con frameworks como vLLM o TGI si se adapta a la arquitectura OneRec, pero no hay documentación al respecto. Para uso experimental, es suficiente una GPU con al menos 8 GB de VRAM.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El teacher OneRec-8B no está incluido en el repositorio y no se han publicado resultados comparativos. Otros modelos de recomendación generativa (p. ej., TIGER, generative retrieval) existen en la literatura, pero no hay datos de rendimiento de este checkpoint frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación piloto, no un modelo base de propósito general; no debe usarse en producción sin una validación exhaustiva.
- Los datos de entrenamiento y la caché del teacher no se incluyen, lo que limita la reproducibilidad completa del experimento.
- No se documentan sesgos específicos, pero al ser un modelo de recomendación, podría heredar sesgos de los datos de entrenamiento (no disponibles).
- La arquitectura exacta no está confirmada; el tag "qwen3" sugiere una base Qwen3, pero el paper de OneRec describe encoder-decoder, lo que genera incertidumbre sobre la implementación real.
- No hay información sobre la longitud de contexto, idiomas soportados ni comportamiento ante entradas fuera del dominio de recomendación.
- La licencia MIT permite uso comercial, pero al ser un artefacto experimental, no se ofrecen garantías de calidad ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/Andynsn/SFLD-OneRec-1of3
- Paper OneRec (informe técnico): https://arxiv.org/abs/2506.13695
- Paper OneRec (unificación retrieve y rank): https://arxiv.org/abs/2502.18965
- Colección de Andynsn en HuggingFace: https://huggingface.co/collections/Andynsn/rec
