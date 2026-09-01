# aiyoi/json-semval-minilm-v1

## Resumen

El modelo `aiyoi/json-semval-minilm-v1` es un clasificador de texto especializado en la detección de errores semánticos en documentos JSON y la predicción de acciones de corrección mínimas. Desarrollado por el usuario aiyoi (aunque la model card original atribuye la autoría a Arnab Sarkar), este modelo se basa en el transformer MiniLM-L6-H384-uncased, un modelo BERT compacto de 6 capas y 384 dimensiones ocultas, y se ha ajustado mediante fine-tuning con un conjunto de datos sintético. Su propósito es complementar la validación de esquemas JSON tradicional (basada en reglas deterministas) con un componente de aprendizaje automático que identifica errores semánticos que las reglas no capturan, como tipos incorrectos, fechas malformadas, valores enum cercanos o inconsistencias entre campos.

El modelo tiene 22,7 millones de parámetros y una ventana de contexto de 512 tokens, lo que lo hace ligero y adecuado para inferencia en CPU. Se distribuye con pesos en formato safetensors y una exportación ONNX para acelerar la inferencia en entornos sin GPU. Aunque el conjunto de entrenamiento es muy reducido (40 ejemplos sintéticos), el enfoque híbrido (reglas + ML) consigue una tasa de paso del 60-80% en el conjunto de prueba sintético, frente al 0% de las reglas solas. Es relevante para desarrolladores que necesitan validar JSON en pipelines de datos, APIs o archivos de configuración, donde los errores semánticos son comunes y difíciles de detectar con validación de esquema estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6-H384-uncased) |
| Parametros totales | 22.716.296 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (se incluye exportación ONNX, pero no se especifican cuantizaciones como int8 o int4) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `nreimers/MiniLM-L6-H384-uncased`, un transformer BERT de 6 capas con 384 unidades ocultas, diseñado para ser eficiente y rápido. Se ha fine-tuneado para clasificación de secuencias con una cabeza de clasificación que distingue entre 8 tipos de errores semánticos en JSON: `wrong_type`, `alias_key`, `invalid_date`, `enum_near_miss`, `cross_field`, `boolean_text`, `number_text` y `extra_key`. Además, el modelo predice una de 7 acciones de corrección posibles, como `rename_key`, `cast_number`, `cast_bool`, `parse_date_iso`, `map_enum`, `swap_dates` o `fill_default`.

El entrenamiento se realizó sobre el dataset sintético `thearnabsarkar/json-semval-synth-v1`, que contiene 40 ejemplos de entrenamiento y 10 de prueba, generados mediante corrupciones controladas de JSON válidos con sus correspondientes correcciones etiquetadas. Se usaron 3 épocas, tamaño de lote 8, tasa de aprendizaje 5e-5 y el optimizador AdamW. La innovación principal no está en la arquitectura, sino en el enfoque híbrido: el modelo ML se combina con un motor de reglas deterministas (validación de JSON Schema) para ofrecer un sistema de validación más completo. El modelo se entrena para clasificar el error y sugerir la corrección, mientras que las reglas se encargan de la validación estructural.

## Capacidades

- Clasificación de 8 tipos de errores semánticos en JSON: tipo incorrecto, clave alias, fecha inválida, valor enum cercano, inconsistencia entre campos, booleano como texto, número como texto y clave extra.
- Predicción de 7 acciones de corrección: renombrar clave, convertir a número, convertir a booleano, parsear fecha ISO, mapear enum, intercambiar fechas y rellenar con valor por defecto.
- Inferencia rápida en CPU gracias a la exportación ONNX incluida en el repositorio.
- Integración con un motor de reglas deterministas para un enfoque híbrido de validación.
- Soporte de entrada de texto que combina el esquema JSON y el payload en un solo prompt, con truncamiento a 512 tokens.
- No dispone de capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; es un clasificador de texto puro.

## Casos de uso

- Validación de respuestas de API: el modelo puede analizar la respuesta JSON de un endpoint y detectar errores semánticos como tipos incorrectos o fechas malformadas, sugiriendo correcciones antes de que los datos lleguen a la base de datos. Su ventana de 512 tokens es suficiente para esquemas y payloads típicos.
- Control de calidad de datos en pipelines ETL: al integrarse en un pipeline de datos, el modelo identifica inconsistencias semánticas en lotes de JSON, como valores enum cercanos o claves alias, y propone normalizaciones automáticas, reduciendo la intervención manual.
- Validación de archivos de configuración: para aplicaciones que usan JSON como formato de configuración, el modelo detecta errores como booleanos escritos como texto o números como cadenas, y sugiere conversiones, evitando fallos en tiempo de ejecución.
- Asistente de corrección en editores JSON: integrado en un IDE o herramienta de edición, el modelo puede marcar errores semánticos en tiempo real y ofrecer correcciones de un solo clic, mejorando la productividad del desarrollador.
- Preprocesamiento de datos para machine learning: antes de alimentar un modelo de ML con datos JSON, el modelo limpia y normaliza campos con tipos incorrectos o fechas malformadas, garantizando que los datos sean consistentes.
- Automatización de pruebas de contratos de API: en un entorno de testing, el modelo puede verificar que las respuestas JSON cumplen no solo el esquema, sino también reglas semánticas de negocio, como rangos de fechas coherentes o valores enum válidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas sobre el conjunto de prueba sintético:

| Métrica | Valor |
|---|---|
| Tasa de paso con solo reglas (baseline) | 0,0% |
| Tasa de paso con enfoque híbrido (reglas + ML) | 60-80% |

Estos datos indican que el modelo mejora significativamente la validación semántica en comparación con la validación de esquema tradicional, aunque el conjunto de prueba es muy pequeño (10 ejemplos) y los resultados deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22,7 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 91 MB. Con la exportación ONNX, puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM (por ejemplo, una GTX 1050 o superior) es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, incluso en las más modestas, pero no es necesario.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, con ONNX Runtime para inferencia en CPU, o mediante `text-embeddings-inference` (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face).
- Latencia y throughput estimados: al ser un modelo pequeño, la latencia en CPU es del orden de milisegundos (típicamente 5-20 ms por inferencia en hardware moderno), y el throughput puede alcanzar cientos de inferencias por segundo en lotes.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la misma categoría (validación semántica de JSON con clasificación de errores). Como referencia, se puede comparar con el modelo base `nreimers/MiniLM-L6-H384-uncased`, que es un encoder de propósito general sin la cabeza de clasificación específica para JSON. La comparativa con otros modelos de clasificación de texto pequeños (como `distilbert-base-uncased` o `bert-base-uncased`) no es relevante porque no están especializados en esta tarea. Por tanto, la comparativa se limita a indicar que no hay alternativas directas disponibles en el ecosistema.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos y muy reducidos (40 ejemplos): el modelo puede no generalizar bien a casos reales no vistos, especialmente a errores complejos o combinaciones de múltiples errores.
- Solo maneja errores simples: la model card indica que no puede resolver violaciones de esquema complejas ni escenarios con múltiples errores simultáneos.
- Ventana de contexto limitada a 512 tokens: si el esquema y el JSON combinados superan este límite, el texto se trunca y la clasificación puede ser incorrecta.
- Enfocado a un solo error por entrada: el modelo está optimizado para detectar un único error en cada payload, no para múltiples problemas.
- Idioma: el modelo está entrenado solo con texto en inglés, aunque los JSON suelen ser independientes del idioma, los prompts generados (esquema + JSON) están en inglés.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y con limitaciones conocidas.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede predecir una clase de error incorrecta si la entrada está fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiyoi/json-semval-minilm-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/thearnabsarkar/json-semval-synth-v1
- Repositorio GitHub (mencionado como "if available"): https://github.com/thearnabsarkar/json-semantic-validator
- Demo Space (próximamente): https://huggingface.co/spaces/thearnabsarkar/json-semantic-validator
