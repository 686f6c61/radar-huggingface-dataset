# RKB109/knowledge-graph-risk-engine-20261027-model

## Resumen

El Knowledge Graph Risk Engine Baseline Model es un prototipo pequeño y transparente publicado por el usuario RKB109 en Hugging Face, orientado a demostrar una arquitectura de explicación de riesgo a nivel de relación entre entidades, en lugar de puntuaciones opacas por entidad. El modelo combina pesos por etiqueta a nivel de token con recuperación de evidencia ponderada por IDF, y no invoca ningún LLM alojado externamente. Se distribuye con licencia MIT y la librería declarada es `custom`.

El problema que aborda es la falta de explicabilidad en motores de riesgo sobre grafos de conocimiento: en lugar de devolver un score agregado por entidad, el prototipo busca producir evidencia textual recuperada y pesos por etiqueta que justifiquen una relación concreta. Está pensado como base reproducible para prototipado de arquitectura, comparaciones locales y ejemplos de evaluación en CI, no como sistema de producción.

La relevancia es acotada: se trata de una pieza demostrativa generada con datos sintéticos y un conjunto de evaluación muy reducido (4 ejemplos retenidos), sin datos publicados sobre arquitectura de red, número de parámetros, longitud de contexto ni idiomas soportados. Su interés es fundamentalmente metodológico y de reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La model card describe un esquema de pesos por etiqueta a nivel de token combinados con recuperación de evidencia ponderada por IDF; no se especifica si subyace un transformer ni qué tipo de red |
| Parámetros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el campo de idiomas no está informado en Hugging Face) |
| Licencia | MIT |
| Formato de pesos | No disponible. La model card menciona que el repositorio de GitHub incluye el formato JSON del modelo, pero no se detalla si hay safetensors, GGUF u otros |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo combina pesos por etiqueta a nivel de token con recuperación de evidencia ponderada por IDF, y que fue generado para demostraciones reproducibles de arquitectura sin llamadas a un LLM alojado. No se especifica el tipo de red subyacente (transformer, modelo lineal, clasificador disperso), ni el número de parámetros, ni la composición del dataset de entrenamiento más allá de que es sintético y pequeño.

Tampoco se documentan el número de tokens de entrenamiento, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card sí indica que el repositorio de GitHub asociado incluye `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo, lo que constituye el principal activo de reproducibilidad del proyecto.

## Capacidades

- Clasificación de tokens (token classification) por etiqueta, con pesos interpretables a nivel de token.
- Extracción de características (feature extraction) para representaciones intermedias.
- Respuesta a preguntas (question answering) en el marco del pipeline declarado.
- Similitud entre frases (sentence similarity), según los tags del repositorio.
- Recuperación de evidencia ponderada por IDF como mecanismo de justificación de relaciones.
- Soporte declarado para cuatro tareas de Hugging Face: token-classification, feature-extraction, question-answering y sentence-similarity.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio.

## Casos de uso

- Prototipado de arquitectura: sirve como esqueleto ejecutable para validar un diseño de motor de riesgo sobre grafos antes de invertir en un modelo mayor, gracias a que su lógica de pesos por etiqueta y recuperación IDF es inspeccionable.
- Pruebas de integración en CI: al ser un modelo pequeño con salida determinista y sin dependencia de un LLM alojado, se puede incluir en pipelines de integración continua para verificar que el contrato de entrada y salida del sistema de riesgo no se rompe entre versiones.
- Comparación de baselines locales: proporciona una referencia mínima contra la que medir mejoras de modelos posteriores en las métricas previstas (relation_accuracy, path_coverage, entity_resolution_precision).
- Experimentación educativa: útil en docencia o talleres para mostrar cómo se combinan señales léxicas por token con recuperación de evidencia, sin coste de inferencia en GPU.
- Demostración de explicabilidad a nivel de relación: permite ilustrar ante equipos de riesgo cómo se adjuntaría evidencia recuperada a una relación entre entidades, con datos íntegramente ficticios.
- Validación de pipelines de token classification y sentence similarity: sirve para comprobar el cableado de preprocesado, tokenización y postprocesado en entornos de desarrollo antes de conectar un modelo real.
- Arnés de evaluación reproducible: al incluir el split exacto y el código de evaluación, se puede usar como plantilla para montar un banco de pruebas de métricas de relaciones y cobertura de caminos en grafos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| Accuracy | 1,0 | 4 ejemplos sintéticos retenidos (held-out) |
| relation_accuracy | No disponible (métrica prevista, sin valor publicado) | No disponible |
| path_coverage | No disponible (métrica prevista, sin valor publicado) | No disponible |
| entity_resolution_precision | No disponible (métrica prevista, sin valor publicado) | No disponible |

El valor de accuracy de 1,0 sobre 4 ejemplos no tiene significación estadística y no debe interpretarse como evidencia de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parámetros ni tamaño de pesos.
- GPU recomendadas: no disponible. No hay datos oficiales al respecto.
- Ajuste en GPU de consumo: no confirmado. Dado que la arquitectura descrita se limita a pesos por etiqueta y recuperación IDF sin LLM alojado, es plausible que se ejecute en CPU, pero se trata de una inferencia a partir de la descripción y no de un dato publicado.
- Opciones de despliegue: no disponible. La librería declarada es `custom`, por lo que no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; la model card remite a un repositorio de GitHub con `train.py` y el código de evaluación como vía de ejecución.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha identificado en la información proporcionada ningún modelo comparable de la misma categoría (baseline transparente de riesgo sobre grafos de conocimiento con recuperación IDF). No se dispone de datos de parámetros, contexto, rendimiento ni licencia de alternativas, por lo que no es posible establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKB109/knowledge-graph-risk-engine-20261027-model | No disponible | No disponible | Accuracy 1,0 sobre 4 ejemplos sintéticos | MIT | Hugging Face |
| Alternativa 1 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 2 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El dataset es sintético y muy pequeño; todas las entidades son ficticias.
- La evaluación se apoya en 4 ejemplos retenidos, insuficiente para cualquier conclusión sobre calidad o generalización.
- Un accuracy de 1,0 en ese contexto es compatible con sobreajuste o con un conjunto de evaluación trivial; no debe citarse como resultado de rendimiento.
- No se especifican idiomas soportados, por lo que no se puede asumir cobertura multilingüe ni siquiera monolingüe concreta.
- No se documentan sesgos conocidos, pero cualquier uso con datos reales de identidad o financieros exige gobierno del dato, consentimiento y revisión de sesgos, tal como advierte el autor.
- Riesgo de alucinación no caracterizado; al no ser un modelo generativo autónomo, el riesgo principal es de evidencia irrelevante o mal recuperada, no de texto inventado.
- El autor desaconseja explícitamente su uso para decisiones con consecuencias sin datos representativos, revisión experta y evaluación de grado de producción.
- La licencia MIT permite uso comercial y modificación, pero la ausencia de garantías y de documentación técnica limita su viabilidad en producción.
- La dependencia de una librería `custom` implica que la integración requerirá el código del repositorio del autor y no herramientas estándar del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/knowledge-graph-risk-engine-20261027-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/knowledge-graph-risk-engine-20261027-dataset
- Repositorio de GitHub con `train.py`, split del dataset, código de evaluación y formato JSON del modelo: mencionado en la model card, sin URL disponible en la información proporcionada.
