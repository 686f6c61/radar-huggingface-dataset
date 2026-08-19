# Jingcheng/gemma3-4b-it-plt-activations

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino un conjunto de estadísticas de activaciones neuronales del modelo `google/gemma-3-4b-it`, orientado a la interpretabilidad mecanicista. El autor, Jingcheng, ha publicado las estadísticas acumuladas de las activaciones top-k para las 34 capas PLT (Post-Layer Transform) del modelo, que emplean una codificación TopK-48 con factor de expansión 64 y fueron post-entrenadas con 57 millones de tokens. El objetivo es permitir el trazado de circuitos y el análisis de características internas del modelo sin necesidad de ejecutar el propio Gemma 3.

El recurso incluye tensores empaquetados por capa (`stats/layer_XX.safetensors`), registros de entrada normalizados en formato Parquet (`inputs/part-XXXXX.parquet`) y un manifiesto con metadatos de procedencia y hashes. La colección de activaciones contiene 257.507 entradas de entrenamiento mixtas y 121.021.288 tokens de procesador, aunque el autor aclara que es acumulativa y no agota los conjuntos de datos fuente. No se incluyen bytes de imagen, solo referencias estables a las imágenes originales.

La relevancia de este repositorio radica en que proporciona datos de activaciones listos para análisis de interpretabilidad, evitando al investigador tener que ejecutar el modelo completo y recolectar las activaciones por su cuenta. Es un recurso especializado para la comunidad de mechanistic interpretability, no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estadisticas de activaciones del modelo Gemma 3 4B-IT (PLT TopK-48, expansion factor 64) |
| Parametros totales | No aplica (recurso de datos, no modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo original, Gemma 3 soporta 128K tokens) |
| Tipos de cuantizacion | No aplica (tensores en BF16, INT32 e INT64) |
| Idiomas soportados | No disponibles (depende del modelo original, Gemma 3 soporta mas de 140 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (estadisticas) y Parquet (registros de entrada) |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El repositorio contiene estadísticas de activaciones de las 34 capas PLT del modelo `google/gemma-3-4b-it`. Los PLT son módulos de transformación post-atencion que utilizan una codificación TopK-48, es decir, retienen las 48 activaciones más relevantes por característica, con un factor de expansión de 64. Estos PLT fueron post-entrenados durante 57 millones de tokens, según el fingerprint de ejecución `29b8c94c23cd846e` indicado en la documentación.

La recolección de activaciones se realizó sobre 257.507 entradas de entrenamiento mixtas, que incluyen texto y posiblemente modalidades multimodales (el modelo original es multimodal), procesando un total de 121.021.288 tokens. Los datos se almacenan de forma empaquetada por capa: cada capa contiene `feature_ids`, `slot_counts`, `top_values` (en BF16), `input_ids`, `token_positions` (INT32) y `firing_counts` (INT64). Los arrays de ejemplos empaquetados están ordenados por característica, con límites definidos por la suma acumulada de `slot_counts`. Los `input_ids` se unen a la columna `input_id` de los archivos Parquet, que preservan los IDs de token procesados, máscaras, tipos de token multimodales opcionales, texto formateado, identidad del ejemplo y metadatos de origen.

No se incluyen los bytes de imagen; en su lugar, `image_references` contiene punteros estables a las imágenes fuente para que los consumidores puedan resolverlas con su propio acceso a los datos.

## Capacidades

- Proporciona estadísticas de activaciones top-k para las 34 capas PLT del modelo Gemma 3 4B-IT, permitiendo análisis de interpretabilidad sin ejecutar el modelo.
- Incluye identificadores de características (`feature_ids`), recuentos de slots (`slot_counts`), valores top (`top_values`), IDs de entrada (`input_ids`), posiciones de token (`token_positions`) y recuentos de disparo (`firing_counts`) por capa.
- Los registros de entrada en Parquet permiten unir las activaciones con los tokens exactos procesados, incluyendo máscaras y tipos multimodales.
- Soporta trazado de circuitos (circuit tracing) al poder correlacionar activaciones específicas con entradas concretas.
- Permite análisis de características individuales (feature analysis) y estudios de superposición (superposition) en modelos transformer.
- Los datos están formateados para ser cargados directamente con `safetensors` y `huggingface_hub`, facilitando su integración en pipelines de investigación.
- No es un modelo generativo: no genera texto, código ni respuestas; es un recurso de análisis estático.

## Casos de uso

- Investigación en interpretabilidad mecanicista: los investigadores pueden cargar las estadísticas de activación de una capa concreta (por ejemplo, `layer_12.safetensors`) y estudiar qué características se activan ante determinados inputs, sin necesidad de ejecutar el modelo Gemma 3 completo, lo que ahorra recursos computacionales.
- Trazado de circuitos (circuit tracing): al disponer de `input_ids` y `token_positions`, es posible rastrear cómo fluye la información a través de las capas PLT y identificar subgrafos de características que median comportamientos específicos del modelo, como razonamiento de varios pasos o manejo de contextos largos.
- Análisis de características polisemánticas: los `top_values` y `firing_counts` permiten estudiar si una misma característica se activa en contextos semánticamente distintos, lo que es relevante para entender la superposición de características en modelos transformer.
- Validación de hipótesis de alineación: los datos de activaciones pueden usarse para comprobar si ciertas características correlacionan con conceptos de seguridad o sesgos, ayudando a auditar el comportamiento del modelo subyacente.
- Desarrollo de métodos de edición de modelos (model editing): las estadísticas de activación son insumo para técnicas como la edición de características o la intervención en capas concretas, permitiendo modificar comportamientos sin reentrenar.
- Benchmarking de técnicas de interpretabilidad: el repositorio sirve como conjunto de datos de referencia para comparar métodos de análisis de activaciones, ya que proporciona un formato estandarizado y metadatos de procedencia verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo Gemma 3, sino datos de activaciones para análisis. Para benchmarks del modelo original, se debe consultar la documentación de `google/gemma-3-4b-it` o el informe técnico de Gemma 3.

## Requisitos de hardware

- No se requiere GPU para utilizar estos datos; el análisis es offline y se realiza sobre archivos estáticos.
- Se recomienda un mínimo de 8 GB de RAM para cargar los tensores de una capa individual (los archivos `layer_XX.safetensors` son de tamaño moderado, aunque el repositorio completo ocupa 1,3 GB).
- Para procesar los archivos Parquet y unir con los tensores, se necesita un entorno Python con `safetensors`, `pandas` o `pyarrow`, y `huggingface_hub`.
- El análisis de múltiples capas simultáneamente puede requerir hasta 16 GB de RAM si se cargan todas las estadísticas en memoria.
- No es necesario desplegar el modelo Gemma 3; el repositorio ya contiene las activaciones precalculadas.
- Para reproducir o ampliar la recolección de activaciones, se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090 o A100) para ejecutar el modelo original, pero esto no es necesario para consumir los datos publicados.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otros LLM; es un conjunto de datos de activaciones específico para el modelo Gemma 3 4B-IT. No existen recursos equivalentes públicos con los que comparar directamente en cuanto a formato y contenido, aunque se podrían mencionar otros repositorios de interpretabilidad como los de OpenAI (activaciones de GPT-2) o los de Anthropic (estadísticas de características en modelos transformer), pero no se dispone de información suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio no es un modelo generativo; no se puede utilizar para generar texto, responder preguntas ni realizar inferencias. Es exclusivamente un recurso de análisis de activaciones.
- La licencia no está especificada, por lo que se desconoce si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- Los datos de activaciones son específicos de la versión del modelo `google/gemma-3-4b-it` y de la configuración PLT descrita; no son transferibles a otras versiones o arquitecturas sin recalcular.
- La colección de activaciones es acumulativa pero no exhaustiva; el autor indica que no se agotaron los conjuntos de datos fuente, por lo que puede haber sesgos de cobertura en las entradas representadas.
- No se incluyen los bytes de imagen, solo referencias; los consumidores necesitan acceso a las fuentes de imagen originales para resolver las referencias, lo que puede limitar la reproducibilidad si dichas fuentes no están disponibles.
- Los tensores `top_values` están en BF16, lo que introduce una precisión limitada en los valores de activación; para análisis que requieran alta precisión numérica, esto puede ser una limitación.
- No hay garantía de mantenimiento o soporte por parte del autor; el repositorio fue creado en agosto de 2026 y no se indica una política de actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jingcheng/gemma3-4b-it-plt-activations
- Modelo original Gemma 3 4B-IT: https://huggingface.co/google/gemma-3-4b-it
- Informe técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Informe técnico de Gemma 4 (referencia de la familia): https://arxiv.org/html/2607.02770v1
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
