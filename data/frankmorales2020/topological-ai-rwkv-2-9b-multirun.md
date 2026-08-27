# frankmorales2020/topological-ai-rwkv-2.9b-multirun

## Resumen

El modelo `topological-ai-rwkv-2.9b-multirun` es una versión certificada del modelo base `fla-hub/rwkv7-2.9B-world`, desarrollada por Frank Morales Aguilera en el laboratorio Sovereign Machine Laboratory (SOMALA) de Montreal. Aplica el método Topological AI, una técnica de aprendizaje continuo que ancla un conjunto reducido de filas de embedding indexadas por números primos para prevenir el olvido catastrófico. La certificación TOPO-2026 (Track II — Multi-Run) valida matemáticamente que el modelo mantiene un rendimiento estable en tareas anteriores al incorporar nuevas, con un olvido combinado del 0,0% en los cinco ejecuciones de entrenamiento.

Con 2.900 millones de parámetros y una arquitectura recurrente sin atención (RWKV7), el modelo ofrece una alternativa eficiente a los transformadores clásicos: tiempo de inferencia lineal y uso de memoria constante, sin necesidad de caché de claves y valores. Está orientado a tareas de clasificación de texto en inglés, y su relevancia radica en demostrar que es posible lograr garantías formales contra el olvido catastrófico en modelos recurrentes de tamaño medio, un problema crítico en sistemas de aprendizaje continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV7 (attention-free recurrent) |
| Parametros totales | 2.900 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RWKV7 soporta contexto infinito por diseño, pero no se especifica el valor del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 5,9 GB; probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RWKV7, un RNN con rendimiento comparable a un transformer pero con complejidad lineal en tiempo y espacio constante, sin mecanismo de atención. Esta arquitectura permite entrenamiento paralelo y una inferencia eficiente en dispositivos con memoria limitada. El modelo base `fla-hub/rwkv7-2.9B-world` tiene un tamaño de capa oculta de 2560 y un vocabulario de 65.536 tokens, entrenado en precisión BFloat16.

El entrenamiento de la versión certificada se realizó mediante el método Topological AI, que consiste en fijar un conjunto de "anclas primas" (filas del embedding correspondientes a los índices 2, 3, 5, 7, 11 y 13) durante el ajuste fino. Se ejecutaron cinco runs con diferentes tasas de aprendizaje (lr_embed y lr_cls) sobre tres tareas de clasificación de texto: A (World vs Sports), B (Business vs Sci/Tech) y C (World vs Sci/Tech). Cada tarea se entrenó durante 6 épocas con un tamaño de lote de 4 y optimizador AdamW con gradiente recortado a norma máxima 1,0. El resultado es un modelo que no muestra olvido catastrófico (FGT = 0,0% en todos los runs) y que mantiene una precisión media del 89,6% en la tarea C, superando el umbral de certificación del 85%.

## Capacidades

- Clasificación de texto en inglés: el modelo distingue entre categorías temáticas (deportes, negocios, ciencia/tecnología, mundo) con una precisión superior al 90% en las tareas evaluadas.
- Aprendizaje continuo sin olvido: gracias a las anclas primas, el modelo puede incorporar nuevas tareas sin degradar el rendimiento en las anteriores, con una garantía matemática de olvido nulo.
- Inferencia eficiente: al ser recurrente y sin atención, el consumo de memoria es constante durante la generación, lo que permite desplegarlo en entornos con recursos limitados.
- Compatibilidad con transformers: se integra con la librería `transformers` de HuggingFace, lo que facilita su uso en pipelines estándar de clasificación.
- Determinismo: el uso de una semilla fija (123) y de anclas fijas garantiza reproducibilidad en los resultados de entrenamiento.

## Casos de uso

- Moderación de contenidos en medios digitales: el modelo puede clasificar automáticamente artículos o comentarios en categorías temáticas (deportes, negocios, ciencia) para su distribución en secciones o para filtrar contenido no deseado. Su precisión superior al 90% en las tareas evaluadas lo hace adecuado para entornos de producción con alto volumen.
- Análisis de sentimiento en redes sociales: aunque no se ha entrenado específicamente para sentimiento, su capacidad de clasificación de texto puede adaptarse mediante ajuste fino adicional, aprovechando su resistencia al olvido para incorporar nuevos dominios sin perder los anteriores.
- Sistemas de recomendación de noticias: al clasificar artículos en categorías, el modelo puede alimentar motores de recomendación que personalizan el contenido según los intereses del usuario. Su baja latencia (inferencia lineal) permite responder en tiempo real.
- Monitorización de tendencias en tiempo real: con su capacidad de procesar flujos de texto de forma continua, el modelo puede detectar cambios en la distribución temática de un corpus (por ejemplo, en redes sociales o medios) y alertar sobre picos de interés en ciertas categorías.
- Investigación en aprendizaje continuo: el modelo sirve como referencia para estudiar métodos de mitigación del olvido catastrófico en arquitecturas recurrentes. Su certificación formal y la disponibilidad de los scripts de entrenamiento permiten reproducir y extender los experimentos.
- Clasificación de documentos en entornos corporativos: puede utilizarse para etiquetar automáticamente informes, correos o documentos internos en categorías predefinidas, facilitando la organización y búsqueda de información. Su tamaño moderado (2,9B) permite ejecutarlo en GPUs de gama media.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión para las tres tareas de clasificación en el mejor run (Run 0) y en la certificación global. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado en clasificación de texto.

| Tarea | Precisión (Run 0) | Precisión (certificación, 5 runs) |
|-------|-------------------|-----------------------------------|
| A: World vs Sports | 96,6% | no disponible |
| B: Business vs Sci/Tech | 93,8% | no disponible |
| C: World vs Sci/Tech | 93,0% | 89,6% ± 4,2% |
| Olvido combinado (FGT) | +0,0% | 0,0% ± 0,0% |

La certificación TOPO-2026 exige una precisión ≥85% en la tarea C y un olvido ≤10%, ambos cumplidos. El indicador AGI_gate (0,93) y S_NARROW (0) no alcanzaron los umbrales de "singularidad estrecha", pero no afectan a la validez de la certificación principal.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BFloat16 ocupa aproximadamente 5,8 GB (2,9B × 2 bytes). Con cuantización a 8 bits, se reduce a ~2,9 GB; a 4 bits, ~1,45 GB. Estas son estimaciones basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: para una inferencia fluida, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060) para la versión sin cuantizar. Con cuantización a 4 bits, una GPU de 4 GB (como RTX 3050) podría ser suficiente.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo medio gracias a su tamaño y a la eficiencia de la arquitectura RWKV7.
- Opciones de despliegue: al ser compatible con `transformers`, puede servirse con vLLM, TGI o directamente con la API de HuggingFace. Para entornos ligeros, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado que la inferencia es lineal en la longitud de secuencia, se espera una latencia baja incluso con contextos largos, pero los valores concretos dependen del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de clasificación de texto de tamaño similar en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Uso principal |
|--------|--------------|------------|----------|----------|---------------|
| `topological-ai-rwkv-2.9b-multirun` | RWKV7 recurrente | 2,9B | no disponible | Apache 2.0 | Clasificación de texto, aprendizaje continuo |
| `fla-hub/rwkv7-2.9B-world` | RWKV7 recurrente | 2,9B | no disponible | Apache 2.0 | Modelo base de propósito general |
| BERT-base (referencia) | Transformer encoder | 110M | 512 tokens | Apache 2.0 | Clasificación de texto, NER, etc. |

La comparativa con BERT es orientativa: el modelo RWKV7 tiene 26 veces más parámetros y una arquitectura más moderna, pero BERT es más ligero y ampliamente utilizado. No se dispone de datos de rendimiento comparativo en los mismos benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para clasificación de texto en inglés; no soporta otros idiomas ni tareas generativas.
- No se han publicado evaluaciones de sesgos o alucinaciones. Al ser un modelo de clasificación, el riesgo de alucinación es bajo, pero puede presentar sesgos derivados de los datos de entrenamiento del modelo base.
- La certificación TOPO-2026 garantiza la ausencia de olvido en las tareas evaluadas, pero no cubre otros posibles problemas como la degradación del rendimiento en tareas fuera del dominio de entrenamiento.
- El tamaño del repositorio (5,9 GB) puede suponer un desafío de almacenamiento en entornos con recursos limitados, aunque la cuantización puede mitigarlo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `fla-hub/rwkv7-2.9B-world` por si hubiera restricciones adicionales.
- No se han publicado detalles sobre el dataset de entrenamiento de las tareas de clasificación, lo que dificulta evaluar la representatividad y posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankmorales2020/topological-ai-rwkv-2.9b-multirun
- Modelo base: https://huggingface.co/fla-hub/rwkv7-2.9B-world
- Paper de referencia (Zenodo): https://zenodo.org/records/20951925
- Repositorio de Topological AI / AST (GitHub): https://github.com/frank-morales2020/AST/tree/main
- Página oficial de RWKV: https://www.rwkv.com/
- Repositorio RWKV-LM: https://github.com/BlinkDL/RWKV-LM
