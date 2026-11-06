# mrysh/qwen3.5-4b-prune_depth_10

## Resumen

qwen3.5-4b-prune_depth_10 es una versión podada por profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de un checkpoint derivado cuyo único propósito es servir como artefacto de un benchmark de poda: el autor compara cuatro modelos base con ocho variantes de poda entre sí y frente a cuantización, evaluando en BFCL, hiring-bias y MedQA con vLLM.

La intervención consiste en eliminar 3 de las 32 capas del bloque de lenguaje (32 -> 29, un 10,0 % de las capas solicitadas), seleccionadas por importancia medida sobre un conjunto de calibración de 512 muestras mixtas. La anchura del modelo no se modifica y los bloques de visión o audio del modelo base, si existen, se conservan intactos; la herramienta de poda descarta además la cabeza de predicción multi-token de Qwen3.5. El resultado es una reducción del 8,1 % de los parámetros del modelo de lenguaje (9,9 % sobre el checkpoint completo), con 4.200.494.016 parámetros totales y 8,4 GB en disco.

Es relevante ahora porque documenta de forma explícita el coste en calidad de la poda por profundidad sin destilación posterior: el autor advierte que debe esperarse una caída de calidad frente al modelo base y que el benchmark existe precisamente para medirla. Para desarrolladores e investigadores, es un punto de referencia útil sobre qué se gana en tamaño y qué se pierde en capacidades cuando se aplica Minitron de NVIDIA ModelOpt a un modelo de 4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (poda por profundidad, anchura sin cambios) |
| Parámetros totales | 4.200.494.016 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el benchmark compara variantes de poda con cuantización, pero no se listan formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 29 (frente a 32 del modelo base; 10,0 % de capas eliminadas) |
| Reducción de parámetros | 8,1 % del modelo de lenguaje; 9,9 % del checkpoint completo |
| Tamaño en disco | 8,421 GB |
| Herramienta de poda | nvidia-modelopt 0.46.0rc1 (Minitron) |
| Conjunto de calibración | 512 muestras mixtas |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer del que esta ficha no recibe detalles internos más allá de la existencia de una cabeza de predicción multi-token y de posibles bloques de visión o audio. La operación aplicada es una poda estructurada por profundidad: se evalúa la importancia de cada capa sobre 512 muestras mixtas de calibración y se eliminan las 3 menos importantes, pasando de 32 a 29 capas. La dimensión oculta y el resto de componentes de anchura permanecen inalterados, lo que simplifica la compatibilidad con kernels y runtimes existentes en comparación con una poda de anchura.

No hubo destilación ni fine-tuning después de la poda, decisión deliberada del autor para que el benchmark mida la caída de calidad atribuible exclusivamente al recorte de capas. La cabeza de predicción multi-token de Qwen3.5 se descarta durante el proceso, y los bloques multimodales del modelo base, si los tiene, se mantienen sin tocar, de modo que solo se poda la parte de lenguaje. El checkpoint se evaluó como modelo de texto con vLLM y el modo thinking desactivado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base con la pérdida de calidad implícita a la eliminación de 3 capas.
- Evaluación de tool calling y function calling: el benchmark del autor incluye BFCL, lo que indica que el modelo conserva la interfaz de llamada a herramientas del base, aunque no se publican puntuaciones.
- Razonamiento de dominio médico: se evalúa en MedQA, por lo que se asume capacidad de responder preguntas de opción múltiple sobre conocimiento biomédico.
- Evaluación de sesgos en contratación: el benchmark incluye hiring-bias, lo que implica que el modelo puede procesarse con prompts de decisión de contratación, aunque el resultado mide el sesgo, no una capacidad deseable.
- Capacidades multimodales: no disponibles en esta variante; los bloques de visión o audio, si existen en el base, se conservan pero el modelo se evaluó como texto.
- Modo thinking: el modelo base lo soporta, pero esta variante se evaluó con thinking desactivado; no hay datos sobre su comportamiento con thinking activo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre poda de modelos: servir como variante de referencia en experimentos que comparen poda por profundidad, poda por anchura y cuantización sobre el mismo modelo base, usando BFCL, MedQA y hiring-bias como métricas.
- Validación de pipelines de compresión: probar herramientas como nvidia-modelopt 0.46.0rc1 sobre un checkpoint real de 4B y verificar que el recorte de capas produce un artefacto cargable en vLLM.
- Despliegue en entornos con restricciones de memoria: con 8,4 GB en safetensors y un 9,9 % menos de parámetros en el checkpoint completo, es un candidato para pruebas de ajuste de memoria en GPU de gama media, siempre aceptando la caída de calidad.
- Generación de texto de propósito general en prototipos: sustituir al modelo base en etapas de desarrollo donde el coste por inferencia importa más que la calidad final, y comparar después contra el base.
- Evaluación de robustez de agentes con tool calling: ejecutar BFCL sobre la variante podada para cuantificar cuánto degrada la eliminación de capas la selección y el uso de herramientas.
- Estudio de sesgos: utilizar la evaluación de hiring-bias para analizar si la poda altera la distribución de respuestas del modelo en decisiones de contratación.
- Benchmarking de latencia: medir el throughput en vLLM de un modelo de 29 capas frente a las 32 del base para estimar la ganancia real de velocidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo forma parte de un benchmark que compara cuatro modelos y ocho variantes de poda en BFCL, hiring-bias y MedQA con vLLM, pero no se incluyen puntuaciones numéricas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un checkpoint de 4,2B parámetros en BF16 ocupa aproximadamente 8,4 GB solo en pesos, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada. El autor evaluó con vLLM, que requiere GPU NVIDIA; una GPU con 16 GB o más de VRAM es un punto de partida razonable para BF16, pero no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Con cuantización a 8 bits o 4 bits podría caber en GPUs de 8-12 GB, pero no se han publicado formatos cuantizados de esta variante.
- Opciones de despliegue: vLLM es el runtime usado en el benchmark del autor. No se mencionan llama.cpp, Ollama ni TGI, y al ser un checkpoint safetensors sin GGUF publicado, su uso en llama.cpp requeriría conversión propia.
- Latencia y throughput: no disponibles. La reducción de 32 a 29 capas debería traducirse en una mejora proporcional en coste de cómputo, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_10 | 4.200.494.016 | 29 | no disponible | Apache 2.0 | Variante podada, sin fine-tuning posterior |
| Qwen/Qwen3.5-4B (base) | no disponible en esta ficha | 32 | no disponible | Apache 2.0 | Modelo original, referencia de calidad |
| Otras variantes de poda del benchmark | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | 8 variantes en total, sin datos publicados aquí |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros estructurales y licencia.

## Limitaciones y advertencias

- Caída de calidad esperada: el autor advierte explícitamente de que no hubo destilación ni fine-tuning tras la poda, por lo que el rendimiento será inferior al del modelo base.
- Sin métricas publicadas: no hay puntuaciones de BFCL, hiring-bias ni MedQA en la model card, así que la magnitud de la degradación es desconocida.
- Pérdida de la cabeza de predicción multi-token: la herramienta de poda la descarta, lo que puede afectar a funcionalidades del base que dependan de ella.
- Contexto e idiomas no documentados: no se indica la longitud de contexto soportada ni la cobertura lingüística de esta variante.
- Evaluación limitada a texto: el benchmark se ejecutó con vLLM y thinking desactivado; no hay datos sobre modo thinking ni sobre entradas multimodales.
- Riesgo de alucinación: no cuantificado; al ser un modelo podado sin ajuste posterior, la degradación puede manifestarse de forma desigual según la tarea.
- Sesgos: el propio benchmark incluye una prueba de hiring-bias, lo que sugiere que el modelo base presenta comportamientos sesgados en decisiones de contratación que la poda no corrige necesariamente.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al derivar de Qwen3.5-4B conviene revisar la model card del base por si hay condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
