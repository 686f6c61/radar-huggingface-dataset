# fpadovani/eus-latn-100mb-100mb_seed455

## Resumen

El modelo `fpadovani/eus-latn-100mb-100mb_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eus_latn_100mb`, desarrollado por el usuario fpadovani. Se trata de un modelo de generación de texto con 124,7 millones de parámetros, entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de Hugging Face. El nombre del modelo sugiere una orientación al euskera (eus) en alfabeto latino, aunque la documentación no lo confirma explícitamente. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo pequeño de bajo coste, probablemente pensado para investigación en procesamiento de lenguas con pocos recursos o para experimentación con técnicas de ajuste eficiente.

La arquitectura subyacente, según las etiquetas del repositorio, corresponde a una GPT-2 (la variante de 124M), lo que lo hace ligero y desplegable en hardware modesto. El repositorio pesa 10,5 GB, un tamaño inusualmente grande para un modelo de esta magnitud, lo que sugiere que podría contener múltiples checkpoints o artefactos de entrenamiento adicionales. No se ha publicado información sobre la licencia, los idiomas soportados ni los datos de entrenamiento, lo que limita su uso en producción sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (variante small, según etiqueta "gpt2") |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere euskera, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768, lo que arroja los 124,7 millones de parámetros. Es un fine-tune del modelo `goldfish-models/eus_latn_100mb`, que a su vez es un modelo preentrenado de tamaño reducido (100MB). El entrenamiento se realizó con SFT (Supervised Fine-Tuning) mediante la librería TRL, tal como se indica en la model card. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas adicionales como RLHF o DPO. La única información disponible es que se usó la versión 0.23.0 de TRL con Transformers 4.56.2 y PyTorch 2.11.0. No se mencionan innovaciones técnicas destacables más allá del propio proceso de fine-tuning.

## Capacidades

- Generación de texto autoregresiva: el modelo es capaz de continuar secuencias de texto a partir de un prompt, como se demuestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Soporte básico de chat: el ejemplo de uso emplea un formato de mensajes con roles (`user`), lo que indica que el modelo puede manejar conversaciones simples de un solo turno o multi-turno, aunque sin garantías de coherencia extendida.
- Sin tool calling ni function calling: no hay evidencia de soporte para invocación de herramientas o funciones.
- Sin capacidades multimodales: el modelo es exclusivamente de texto; no procesa imágenes, audio ni vídeo.
- Sin modo "thinking" explícito: no se ha documentado ningún mecanismo de razonamiento extendido o cadena de pensamiento visible.
- Multilingüismo incierto: el nombre sugiere posible orientación al euskera, pero no hay confirmación en la documentación; el modelo base podría haber sido entrenado en varios idiomas, pero no se especifica.

## Casos de uso

- Investigación académica en lenguas de bajos recursos: el modelo puede servir como punto de partida para estudiar técnicas de fine-tuning en euskera u otras lenguas minoritarias, dado su pequeño tamaño y la facilidad de adaptación. Se usaría con datasets propios para evaluar mejoras en generación de texto.
- Prototipado rápido de asistentes conversacionales: gracias a su ligereza, puede desplegarse en entornos de desarrollo para probar flujos de chat básicos antes de migrar a modelos más grandes. Un ejemplo sería un bot de preguntas frecuentes en euskera con respuestas predefinidas.
- Experimentación con SFT y TRL: los desarrolladores pueden replicar el proceso de entrenamiento documentado para aprender a usar la librería TRL, comparando el comportamiento del modelo antes y después del fine-tuning.
- Generación de contenido en euskera: si se confirma el soporte del idioma, podría utilizarse para redactar borradores de artículos, noticias o textos cortos, aunque la calidad será limitada por el tamaño del modelo.
- Base para fine-tuning adicional: el modelo puede ser ajustado de nuevo con tareas específicas (resumen, traducción, etc.) utilizando poco presupuesto computacional, ideal para entornos académicos con recursos limitados.
- Evaluación comparativa de modelos pequeños: dado que existen variantes con diferentes semillas (seed10, seed455, etc.), puede emplearse en estudios sobre la influencia de la inicialización aleatoria en el rendimiento final de modelos de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El repositorio de Hugging Face no incluye ninguna tabla de evaluaciones, y las búsquedas web tampoco arrojan cifras concretas. Por tanto, no es posible comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB (según datos de LLM Explorer para un modelo similar de 124,8M). En float32 ocuparía unos 500 MB, pero con cuantización a 8 bits o 4 bits podría reducirse aún más.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También es posible ejecutarlo en CPU con una latencia aceptable para tareas de generación corta.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 2 GB de VRAM puede manejarlo sin problemas.
- Opciones de despliegue: compatible con Transformers de Hugging Face, vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante importación), y servicios de inferencia como FriendliAI, que ya ofrece el modelo.
- Latencia y throughput estimados: no disponibles en la documentación, pero dado el tamaño, se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/eus-latn-100mb-100mb_seed455 | 124,7M | no disponible | no disponible | Fine-tune del modelo base goldfish |
| goldfish-models/eus_latn_100mb | ~100M (estimado) | no disponible | no disponible | Modelo base preentrenado |
| fpadovani/eus-latn-100mb-100mb_seed10 | 124,7M (probable) | no disponible | no disponible | Variante con semilla diferente |

No hay información suficiente para comparar con otros modelos de la misma categoría (por ejemplo, GPT-2 small original, otros modelos de euskera) en términos de rendimiento o benchmarks. La comparativa se limita a las variantes del mismo autor, que difieren únicamente en la semilla aleatoria utilizada durante el entrenamiento.

## Limitaciones y advertencias

- Tamaño reducido: con 124,7M de parámetros, el modelo tiene una capacidad limitada para capturar matices lingüísticos, lo que se traduce en generaciones menos coherentes y con mayor tendencia a repetir o desviarse del tema en textos largos.
- Riesgo de alucinaciones: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en dominios no representados en sus datos de entrenamiento.
- Sesgos desconocidos: al no disponer de información sobre el dataset de entrenamiento, no se pueden conocer los sesgos potenciales (género, etnia, etc.). Es recomendable auditar el modelo antes de cualquier uso público.
- Licencia no especificada: la ausencia de licencia impide determinar si se puede usar comercialmente, modificar o redistribuir. Se debe contactar con el autor antes de cualquier despliegue en producción.
- Idioma incierto: aunque el nombre sugiere euskera, no hay confirmación explícita. Si se usa en otro idioma, el rendimiento será previsiblemente deficiente.
- Sin soporte de herramientas ni agentes: el modelo no está diseñado para interacciones complejas con APIs o ejecución de código, por lo que no es adecuado para pipelines de agentes autónomos.
- Repositorio pesado: el tamaño de 10,5 GB es desproporcionado para los parámetros, lo que puede indicar artefactos adicionales o checkpoints; se debe revisar el contenido antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fpadovani/eus-latn-100mb-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Página del modelo en FriendliAI: https://friendli.ai/models/fpadovani/eus-latn-100mb-100mb_seed455
- Entrada en LLM Explorer (para una variante similar): https://llm-explorer.com/model/fpadovani%2Feus-latn-100mb-ppt-Dp-100mb_seed10,5nFx45PfPXcoewglvwtZP7
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/w7xoplmq
