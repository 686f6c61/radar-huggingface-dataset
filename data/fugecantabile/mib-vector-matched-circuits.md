# FugeCantabile/mib-vector-matched-circuits

## Resumen

`mib-vector-matched-circuits` es un artefacto de investigación en interpretabilidad mecanicista publicado por el usuario FugeCantabile en Hugging Face. No es un modelo de lenguaje: es un conjunto de 45 circuitos binarios de aristas (binary edge circuits) destinados a la tarea de localización de circuitos del benchmark MIB (Mechanistic Interpretability Benchmark). Cada circuito describe, mediante aristas binarias, las conexiones relevantes dentro de un modelo de lenguaje concreto para una tarea específica.

El repositorio cubre cinco familias de experimentos: GPT-2 Small sobre IOI, Qwen2.5-0.5B sobre IOI, Qwen2.5-0.5B sobre MCQA, Gemma-2-2B sobre MCQA y Gemma-2-2B sobre ARC-Easy. Cada familia incluye nueve presupuestos (budgets) predefinidos, fijados durante las fases de entrenamiento y validación antes de la evaluación pública, sin selección ni mezcla por presupuesto en el conjunto de test público.

La relevancia del artefacto es metodológica: introduce intercambios discretos con matching residual, aceptación real de intervenciones contrafactuales y calibración de respuesta finita. La familia Qwen/MCQA añade una segunda etapa que empareja el vector completo de respuesta predicha bajo riesgo medio con bootstrap empírico, combinando propuestas basadas en media con vecinos vectoriales, una proyección fija de 16 dimensiones para recuperación y un reranking de candidatos por riesgo de vector completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de circuitos binarios de aristas, no un modelo neuronal) |
| Parametros totales | No disponible (no se distribuyen pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Circuitos binarios de aristas (45 circuitos); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no contiene un transformer ni ningún otro modelo entrenado, sino circuitos binarios de aristas generados mediante un procedimiento de descubrimiento de circuitos. El método se basa en intercambios discretos con matching residual, aceptación efectiva de intervenciones contrafactuales y calibración de respuesta finita. La familia Qwen/MCQA incorpora una segunda etapa que empareja el vector completo de respuesta predicha bajo riesgo medio estimado por bootstrap empírico; combina propuestas basadas en media con vecinos vectoriales, emplea una proyección fija de 16 dimensiones para la recuperación y reordena los candidatos limpiados según el riesgo de vector completo. El resto de familias mantiene la política escalar calibrada por respuesta.

Los volúmenes de datos de entrenamiento varían por familia: las familias IOI emplean 10.000 ejemplos de entrenamiento, MCQA emplea 110 y Gemma/ARC-Easy utiliza los primeros 100 ejemplos oficiales de entrenamiento. Cada familia completa de nueve presupuestos se fijó durante el desarrollo de entrenamiento y validación antes de su evaluación en el test público, sin selección ni mezcla por presupuesto en dicho test. Los experimentos de remuestreo de entrenamiento (training-resample) son independientes y no están incluidos en el repositorio.

## Capacidades

- Descubrimiento de circuitos para localización de circuitos en el benchmark MIB.
- Generación de circuitos binarios de aristas para cinco combinaciones modelo/tarea: GPT-2 Small/IOI, Qwen2.5-0.5B/IOI, Qwen2.5-0.5B/MCQA, Gemma-2-2B/MCQA y Gemma-2-2B/ARC-Easy.
- Cobertura de nueve presupuestos predefinidos por familia (45 circuitos en total).
- Intercambios discretos con matching residual y aceptación real de intervenciones contrafactuales.
- Calibración de respuesta finita para las familias con política escalar.
- Emparejamiento de vector completo de respuesta con bootstrap empírico y reranking por riesgo de vector completo en la familia Qwen/MCQA.
- Recuperación mediante proyección fija de 16 dimensiones en la familia Qwen/MCQA.
- No incluye generación de texto, tool calling, capacidades de agente, visión, audio ni multilingüismo, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Investigación en interpretabilidad mecanicista: los circuitos permiten analizar qué aristas de un modelo concreto (GPT-2 Small, Qwen2.5-0.5B, Gemma-2-2B) resultan relevantes para tareas como IOI, MCQA o ARC-Easy, sirviendo como base para estudios de atribución y análisis de subgrafos.
- Reproducción de experimentos del benchmark MIB: los 45 circuitos con sus nueve presupuestos por familia permiten reproducir las condiciones de evaluación pública descritas por el autor, comparando el comportamiento del método frente a otras propuestas.
- Comparación de políticas de descubrimiento de circuitos: la familia Qwen/MCQA, con su segunda etapa de vector completo, puede contrastarse frente a las familias con política escalar calibrada por respuesta para evaluar el impacto del reranking por riesgo vectorial.
- Validación de metodologías de intervención contrafactual: el uso de aceptación real de intervenciones contrafactuales y matching residual permite estudiar la robustez de los circuitos descubiertos bajo distintos presupuestos.
- Estudio de calibración con bootstrap empírico: la estimación de riesgo medio por bootstrap en la familia Qwen/MCQA es un caso práctico para analizar cómo afecta la calibración finita a la selección de candidatos.
- Docencia y formación en interpretabilidad: al ser circuitos binarios ligeros y sin pesos de modelo, resultan adecuados como material didáctico para explicar localización de circuitos sin requerir infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que cada familia de nueve presupuestos se fijó durante el desarrollo antes de la evaluación en test público, y que las evaluaciones de test público y la puntuación final en el leaderboard privado son distintas, pero no se incluyen cifras.

## Requisitos de hardware

- No se distribuyen pesos de modelo, por lo que no se requiere VRAM para cargar el artefacto en sí.
- El análisis o la reproducción de los circuitos requiere disponer por separado de los modelos objetivo: GPT-2 Small, Qwen2.5-0.5B y Gemma-2-2B.
- GPT-2 Small y Qwen2.5-0.5B pueden ejecutarse en GPU de consumo (por ejemplo, RTX 3060/4060 en adelante) con cuantización; Gemma-2-2B requiere más memoria y se beneficia de GPUs con 8-16 GB de VRAM o superiores.
- Para experimentos a mayor escala o evaluación sistemática de intervenciones contrafactuales se recomiendan GPUs de datacenter como A100 o H100.
- Opciones de despliegue de los modelos objetivo: llama.cpp, Ollama, vLLM o TGI, según el modelo y la cuantización elegida.
- No se dispone de datos de latencia ni throughput del artefacto.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de circuitos binarios para el benchmark MIB con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio contiene únicamente los 45 circuitos binarios y la descripción; no incluye pesos de modelo, datasets, código fuente de investigación, campos de respuesta, salidas por ejemplo ni credenciales.
- No se especifica licencia, lo que impide determinar las condiciones de uso comercial o redistribución.
- No se declaran idiomas soportados; el artefacto no procesa lenguaje por sí mismo.
- Al no publicarse resultados de benchmarks en la información disponible, no es posible verificar empíricamente el rendimiento del método a partir de este repositorio.
- Los circuitos están ligados a modelos y tareas concretos (GPT-2 Small, Qwen2.5-0.5B, Gemma-2-2B sobre IOI, MCQA y ARC-Easy); no son generalizables a otros modelos o tareas sin un nuevo proceso de descubrimiento.
- La evaluación en test público y la puntuación final en el leaderboard privado son distintas, por lo que los resultados públicos no deben interpretarse como equivalentes al ranking privado.
- Los experimentos de remuestreo de entrenamiento no están incluidos, lo que limita la reproducibilidad de esas variantes.
- No se han documentado sesgos del artefacto, pero al derivarse de modelos de lenguaje subyacentes pueden heredar sesgos presentes en ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FugeCantabile/mib-vector-matched-circuits
