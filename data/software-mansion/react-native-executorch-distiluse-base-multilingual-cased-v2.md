# software-mansion/react-native-executorch-distiluse-base-multilingual-cased-v2

## Resumen

Este repositorio aloja el modelo de embeddings multilingües `distiluse-base-multilingual-cased-v2`, originalmente publicado por sentence-transformers, exportado al formato ExecuTorch para su ejecución en dispositivos móviles dentro de aplicaciones React Native. El trabajo ha sido realizado por Software Mansion, el equipo responsable de la librería `react-native-executorch`, que permite ejecutar modelos de IA de forma declarativa y local en iOS y Android.

El modelo combina un backbone DistilBERT multilingüe con cased tokenization, seguido de mean pooling, una capa densa de 768 a 512 dimensiones con activación Tanh y normalización L2. Produce embeddings de 512 dimensiones orientados a tareas de similitud semántica y recuperación de frases en más de 50 idiomas. Su relevancia actual radica en que permite llevar embeddings multilingües a aplicaciones móviles sin conexión, con privacidad y latencia mínima, mediante el runtime ExecuTorch de Meta.

La exportación incluye cuatro variantes en dos delegates distintos: XNNPACK (CPU genérico, compatible con Android e iOS) en precisión fp32 y cuantización mixta 8da4w, y CoreML (Apple Neural Engine, GPU y CPU) en fp32 y fp16. La ventana de contexto máxima es de 126 tokens (128 menos los tokens especiales `[CLS]` y `[SEP]`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT multilingüe cased + mean pooling + Dense (768→512, Tanh) + L2 norm |
| Parametros totales | no disponible (base: distiluse-base-multilingual-cased-v2, ~66M estimados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 126 tokens (128 − 2 para `[CLS]` y `[SEP]`) |
| Tipos de cuantizacion | fp32, fp16 (solo CoreML), 8da4w (Int8 activaciones dinamicas + Int4 pesos, group_size=32) |
| Idiomas soportados | 50+ (multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch), con tokenizer.json (WordPiece + BertNormalizer) |

## Arquitectura y entrenamiento

El modelo original `distiluse-base-multilingual-cased-v2` es una variante de DistilBERT multilingüe entrenada por sentence-transformers para generar embeddings de frases. La arquitectura combina un transformer DistilBERT con tokenización cased, una estrategia de pooling por media (mean pooling), una capa densa que reduce la dimensión de 768 a 512, activación Tanh y normalización L2 final. El resultado es un espacio vectorial de 512 dimensiones optimizado para similaridad coseno.

La exportación a ExecuTorch fue realizada por software Mansion con la librería `react-native-executorch` v0.9.0, que incorpora un runtime derivado de la rama v1.2.0 de ExecuTorch. El proceso de exportación elimina la conversión interna de la máscara de atención a 4D que hace HuggingFace, porque el runtime de React Native nunca hace padding en inferencia (una sola frase, sin batching). Esta optimización preserva la bit-exactitud con la referencia de PyTorch (RMSE 0 en fp32) y reduce el tiempo de forward en XNNPACK aproximadamente un 27%, manteniendo una delegación del 89-91% del tiempo de ejecución del grafo.

Para la variante 8da4w se aplicó cuantización torchao con Int8 dinámico en activaciones e Int4 en pesos, con group_size=32. Los embeddings se mantienen en fp32, por lo que la reducción de tamaño proviene principalmente de las capas lineales. Las variantes CoreML se generaron con `compute_precision=FLOAT16` para fp16 y con la compilación nativa de CoreML para fp32.

## Capacidades

- Generación de embeddings de frases multilingües de 512 dimensiones.
- Similaridad semántica cross-lingüe: permite comparar frases en distintos idiomas en un mismo espacio vectorial.
- Recuperación de frases de longitud media (sentence retrieval) en entornos multilingües.
- Ejecución on-device sin conexión a través de ExecuTorch, compatible con Android e iOS.
- Soporte de dos delegates: XNNPACK para CPU genérica (Android/iOS) y CoreML para Apple Neural Engine, GPU y CPU.
- Cuantización 8da4w para reducir el tamaño del modelo en CPU, y fp16 para reducción de tamaño en Apple.
- Integración declarativa con React Native mediante la librería `react-native-executorch`.
- No soporta tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo de embeddings, no de generación de texto.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: un usuario busca una frase en su idioma y la aplicación devuelve documentos, productos o mensajes relevantes almacenados en el dispositivo. El modelo permite comparar la consulta con los embeddings precomputados de los documentos, incluso si están en idiomas distintos.
- Sistemas de recomendación multilingües: recomendar contenidos (artículos, vídeos, productos) basados en la similaridad semántica entre las preferencias del usuario y las descripciones de los elementos, todo ejecutado localmente.
- Clasificación de texto en el dispositivo: se pueden entrenar clasificadores ligeros sobre los embeddings de 512 dimensiones para categorizar correos, notificaciones o comentarios de usuarios, sin enviar datos a servidores.
- Aplicaciones de traducción asistida o glosarios: comparar frases en varios idiomas para encontrar equivalentes semánticos cercanos, útil para asistentes de traducción o aprendizaje de idiomas.
- Chatbots y asistentes con recuperación de conocimiento: se indexan preguntas frecuentes (FAQ) en varios idiomas y el modelo recupera la respuesta más cercana a la pregunta del usuario, incluso si el usuario escribe en un idioma distinto al de la base de conocimiento.
- Análisis de sentimiento o moderación de contenido en móvil: se generan embeddings de comentarios y se comparan con ejemplos etiquetados para detectar contenido problemático, manteniendo el procesamiento en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de embeddings y no de generación de texto. Los únicos datos cuantitativos proporcionados son los valores de RMSE frente a la referencia eager de PyTorch:

| Variante | RMSE vs eager |
|---|---|
| XNNPACK fp32 | 0.0 |
| XNNPACK 8da4w | 5.4e-4 |
| CoreML fp32 | 0.0 |
| CoreML fp16 | 1.9e-4 |

## Requisitos de hardware

- Variante XNNPACK fp32: 516 MB de peso en disco; requiere memoria RAM suficiente para cargar el modelo completo en CPU. Funciona en cualquier dispositivo Android o iOS con soporte para ExecuTorch.
- Variante XNNPACK 8da4w: 375 MB, recomendada para dispositivos con recursos limitados. Mantiene los embeddings en fp32, por lo que la reducción de tamaño no afecta la precisión del espacio de salida.
- Variante CoreML fp32: 516 MB, funciona en Apple Neural Engine, GPU y CPU de iOS y macOS.
- Variante CoreML fp16: 258 MB, la opción más ligera para Apple, con RMSE de 1.9e-4 respecto a fp32.
- No requiere GPU dedicada de servidor; está pensado para inferencia en dispositivos móviles.
- Despliegue recomendado: mediante la librería `react-native-executorch` para React Native, o con un runtime de ExecuTorch compatible con la versión v1.2.0 (sin compatibilidad con versiones anteriores).
- La latencia y el throughput dependen del dispositivo y del delegate utilizado; no se proporcionan cifras específicas en la documentación.

## Comparativa con modelos similares

El modelo base `distiluse-base-multilingual-cased-v2` compite con otros modelos de embeddings multilingües como `multilingual-e5-small` de Microsoft, `paraphrase-multilingual-MiniLM-L12-v2` de sentence-transformers y `LaBSE` de Google. Sin embargo, en este repositorio la comparativa se centra en la disponibilidad de variantes para ExecuTorch, no en el rendimiento del modelo original.

| Modelo | Parametros | Dimension de embedding | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| distiluse-base-multilingual-cased-v2 (este repo) | ~66M (estimado) | 512 | 50+ | .pte (ExecuTorch) | Apache-2.0 |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 384 | 50+ | safetensors, ONNX, etc. | Apache-2.0 |
| LaBSE | ~471M | 768 | 109 | safetensors, TF | Apache-2.0 |
| multilingual-e5-small | ~118M | 384 | 100+ | safetensors | MIT |

La principal ventaja de este repositorio es la integración lista para usar en React Native con ExecuTorch, con variantes optimizadas para CPU y Apple Silicon. No se dispone de datos de rendimiento comparativo en benchmarks de similaridad semántica para esta exportación.

## Limitaciones y advertencias

- El modelo es débil con consultas de una sola palabra en idiomas no ingleses; para obtener mejores resultados se recomienda usar frases más largas o entradas en inglés.
- La ventana de contexto es de 126 tokens, por lo que frases o documentos muy largos deben truncarse, lo que puede afectar la calidad del embedding.
- No hay compatibilidad con versiones anteriores: los archivos `.pte` requieren un runtime de ExecuTorch v1.2.0 o superior. Las versiones más antiguas no funcionarán con estos archivos.
- La variante XNNPACK + fp16 no es compatible: la exportación falla porque la conversión a `torch.float16` provoca desbordamientos en softmax y LayerNorm, y el resultado es NaN. Para reducir tamaño en CPU, se debe usar la variante 8da4w.
- La variante CoreML + 8da4w no es compatible: `coremltools` no tiene mapeo MIL para tensores `torch.int8` emitidos por torchao. La reducción de tamaño en Apple debe hacerse con la cuantización nativa de CoreML (`ct.optimize.coreml`).
- Las variantes CoreML solo se cargan en plataformas Apple; las variantes XNNPACK funcionan en cualquier plataforma.
- El modelo no es un LLM generativo: no produce texto, sino embeddings. No es adecuado para generación de texto, razonamiento o tool calling.
- No se han publicado sesgos o riesgos de alucinación específicos para esta exportación; sin embargo, el modelo base DistilBERT multilingüe puede heredar sesgos de los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-distiluse-base-multilingual-cased-v2
- Modelo original: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación oficial de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Repositorio GitHub de ExecuTorch: https://github.com/pytorch/executorch
- Repositorio GitHub de react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Guía de inicio rápido: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Página del proyecto: https://executorch.swmansion.com/
