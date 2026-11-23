# iteshxt/spinneret-ranker-roberta-base

## Resumen

Spinneret-ranker-roberta-base es un cross-encoder basado en RoBERTa-base, afinado por el autor iteshxt, que puntúa tablas y columnas de un esquema de base de datos para determinar cuáles son necesarias para responder a una pregunta en lenguaje natural. Forma parte del proyecto Spinneret, un pipeline de text-to-SQL cuyo componente Lite y principal solo procesa las 4 mejores tablas × 5 mejores columnas seleccionadas por este ranker, reduciendo la longitud de entrada y eliminando elementos del esquema que distraen al generador de SQL.

El modelo resuelve el problema de schema linking: dado un esquema potencialmente grande y una pregunta, decide qué tablas y columnas resultan relevantes para la consulta SQL objetivo. Con 124.055.040 parámetros y una ventana de contexto propia de RoBERTa-base, se trata de un componente auxiliar especializado, no de un modelo generativo de SQL.

Es relevante para desarrolladores que construyen sistemas text-to-SQL sobre bases de datos con esquemas extensos, ya que reduce el coste de contexto y mejora la precisión del generador al filtrar ruido del esquema. No debe usarse como modelo independiente: las cabezas de clasificación (`heads.pt`) no son una cabeza estándar de `transformers` y el uso previsto es a través del código de Spinneret (`SchemaRanker` en `spinneret/ranker/infer.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) como cross-encoder con cabezas de clasificación personalizadas |
| Parametros totales | 124.055.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de RoBERTa-base, 512 tokens; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (pesos principales); cabezas de clasificación en `heads.pt` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe conjuntamente la pregunta y el esquema de la base de datos, y produce una puntuación por tabla y por columna indicando si la respuesta SQL necesita ese elemento. Se parte de `FacebookAI/roberta-base` (MIT) y se añaden cabezas de clasificación específicas que no siguen el formato estándar de `transformers`, por lo que su uso requiere el código de Spinneret.

El entrenamiento utiliza el split de entrenamiento de Spider (incluyendo `train_others`), con etiquetas derivadas de las tablas y columnas empleadas por la SQL gold. La validación se divide por base de datos para evitar fuga de información. La mejor época fue la 2, seleccionada por cobertura de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO.

## Capacidades

- Puntuación de relevancia de tablas y columnas de un esquema para una pregunta en lenguaje natural (schema linking).
- Selección top-k de tablas y columnas para alimentar generadores de SQL downstream.
- Cross-encoding pregunta-esquema, capturando interacciones entre la pregunta y los elementos del esquema.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales: cabezas de clasificación personalizadas accesibles mediante `SchemaRanker`; no es un modelo generativo de texto.

## Casos de uso

- Filtrado de esquemas en pipelines text-to-SQL: se usa el ranker para seleccionar las 4 mejores tablas × 5 mejores columnas antes de pasarlas al generador de SQL, reduciendo la longitud de entrada y el ruido del esquema; la cobertura reportada en Spider dev a (4, 5) es del 98,5%.
- Reducción de coste de contexto en LLM generadores de SQL: al recortar el esquema a los elementos relevantes, disminuye el número de tokens enviados al modelo generativo y, por tanto, el coste y la latencia.
- Bases de datos con esquemas grandes: útil cuando el esquema completo no cabe en la ventana de contexto del generador o degrada su precisión por exceso de elementos irrelevantes.
- Integración en herramientas de BI y analítica conversacional: permite que un usuario formule preguntas en inglés y el sistema identifique tablas y columnas candidatas antes de construir la consulta.
- Evaluación y depuración de pipelines text-to-SQL: las puntuaciones por tabla y columna permiten diagnosticar por qué un generador falla (por ejemplo, si el ranker descarta un elemento necesario).
- Componente de investigación en schema linking: sirve como baseline cross-encoder sobre Spider para comparar estrategias de selección de esquema.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Metrica | Valor |
|---|---|
| AUC de tabla (validacion) | 0,984 |
| AUC de columna (validacion) | 0,978 |
| Cobertura (todos los elementos necesarios conservados) top (4, 5), validacion | 98,1% |
| Cobertura Spider dev top (4, 5) | 98,5% |

Cobertura en Spider dev según top-k (tablas × columnas):

| tablas \ columnas | 4 | 5 | 6 |
|---|---|---|---|
| 3 | 95,9 | 97,6 | 98,4 |
| 4 | 96,8 | 98,5 | 99,2 |
| 5 | 96,8 | 98,5 | 99,2 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas generativas, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 124 millones de parámetros, los pesos en fp32 ocupan aproximadamente 0,5 GB; en fp16, unos 0,25 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer (por ejemplo, RTX 3060, RTX 4090) y en A100/H100, pero no se confirma en la información.
- Cabe en GPU consumer: previsiblemente sí por tamaño de parámetros, aunque no está confirmado en la información disponible.
- Opciones de despliegue: no disponible. El uso previsto es mediante el código de Spinneret (`SchemaRanker` en `spinneret/ranker/infer.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. Comparación por características con alternativas de la misma categoría (cross-encoders para schema linking):

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spinneret-ranker-roberta-base | 124.055.040 | no disponible | Schema linking (tablas/columnas) | cc-by-sa-4.0 | Hugging Face |
| FacebookAI/roberta-base (base) | 125 M aprox. | 512 tokens | Modelo base de lenguaje | MIT | Hugging Face |
| Alternativas de schema linking | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información disponible modelos comparables específicos de schema linking con datos de rendimiento publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse sobre Spider, puede heredar sesgos de dominio y de estilo de consulta de ese dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el ranker puede descartar elementos necesarios del esquema (falsos negativos), lo que provoca fallos en la SQL generada downstream; la cobertura a (4, 5) es del 98,5% en Spider dev, no del 100%.
- Limitaciones de contexto o idioma: solo inglés; la longitud de contexto heredada de RoBERTa-base limita el tamaño del esquema de entrada (no confirmado en la información).
- Restricciones de licencia: cc-by-sa-4.0, licencia copyleft que obliga a compartir obras derivadas bajo la misma licencia; el uso comercial debe revisarse con cuidado. Los pesos derivan de `FacebookAI/roberta-base` (MIT) y los datos de Spider (CC BY-SA 4.0).
- Caveats para producción: las cabezas de clasificación (`heads.pt`) no son una cabeza estándar de `transformers`; el modelo debe usarse mediante el código de Spinneret y no como pipeline autónomo. No hay pipeline declarado en Hugging Face ni datos de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-ranker-roberta-base
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Dataset Spider: https://yale-lily.github.io/spider
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Dataset en Hugging Face: https://huggingface.co/datasets/xlangai/spider
