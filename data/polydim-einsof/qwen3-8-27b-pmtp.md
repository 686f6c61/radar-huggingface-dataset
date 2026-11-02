# Polydim-Einsof/qwen3.8-27b-pmtp

## Resumen

qwen3.8-27b-pmtp es un adaptador publicado por Polydim-Einsof (Ariel García Traba, iniciativa de investigación independiente POLYDIM-EINSOF) sobre el modelo base Qwen/Qwen3.8-27B-Instruct. El autor lo presenta como un "Stiefel Manifold Adapter" que proyecta el espacio de representación del modelo (d_model = 5120) sobre una subvariedad de Stiefel St(5120, 2048) incrustada en S^2047, con el objetivo declarado de servir como motor de lógica y razonamiento y copiloto de código. La propuesta técnica se aleja de los adaptadores convencionales (LoRA, QLoRA) y se enmarca en lo que el autor denomina PMTP (Polydim Manifold Transfer Protocol).

El repositorio tiene un tamaño de 0,0 GB y cero descargas en el momento de la consulta, lo que indica que los pesos no están efectivamente alojados o que el artefacto es únicamente una especificación. No se declaran idiomas soportados, pipeline ni resultados de evaluación. La model card combina afirmaciones geométricas (defecto de Stiefel de 4,24e-09 medido con acumulador Neumaier en FP64) con referencias a una "Zero-Worm Protocol" y a 1.740 teoremas formales extraídos de PostgreSQL 16, sin que se aporten detalles reproducibles sobre el procedimiento de entrenamiento ni sobre el conjunto de datos utilizado.

Por su relevancia práctica, debe tratarse como una propuesta experimental de investigación más que como un modelo listo para producción: no hay benchmarks, no hay pesos verificables y la licencia remite a la qwen-community-license del modelo base, cuyos términos condicionan cualquier uso derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B-Instruct) con adaptador de proyección sobre variedad de Stiefel St(5120, 2048) en S^2047 |
| Parametros totales | 27B (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; se menciona un tag Ollama `qwen3.8:27b` sin detallar cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (la model card indica qwen-community-license, heredada del modelo base) |
| Formato de pesos | safetensors |
| Dimension del modelo (d_model) | 5120 |
| Dimension canonica | 2048 |
| Defecto de Stiefel declarado | 4,24e-09 (acumulador Neumaier FP64) |
| Modelo base | Qwen/Qwen3.8-27B-Instruct |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de 27B parámetros (Qwen3.8-27B-Instruct), del que no se detallan en la información disponible ni el número de capas, ni el número de cabezas de atención, ni la ventana de contexto nativa. Sobre él, el autor define una transformación geométrica: una proyección del espacio latente de dimensión 5120 a una subvariedad canónica de dimensión 2048, descrita como una variedad de Stiefel St(5120, 2048) embebida en la esfera S^2047. El "defecto de Stiefel" reportado (4,24e-09) se presenta como una medida de la desviación respecto a la ortogonalidad de la base proyectada, calculada con un acumulador compensado de Neumaier en FP64.

El autor menciona además un "Silicon Contract" con implementaciones nativas en C++20 y Rust 2024, uso de instrucciones AVX2 y un bus de comunicación denominado PmtpShmBus con aritmética IEEE-754 FP64, así como la integración de 1.740 teoremas formales provenientes de una base PostgreSQL 16 (`polydim_vec_db`). No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo ajuste supervisado, RLHF o DPO, ni el procedimiento exacto con el que se obtuvieron los pesos del adaptador. Tampoco se documenta si el adaptador modifica los pesos del modelo base o si actúa únicamente como una capa de proyección en tiempo de inferencia.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B-Instruct, si bien el autor no documenta evaluaciones que confirmen que el adaptador preserve o mejore estas capacidades.
- Copiloto de código: la model card asigna explícitamente al modelo el rol de "Code Co-Pilot", orientado a asistencia en programación.
- Motor de lógica y razonamiento: rol declarado como "Logic & Reasoning Engine", sin métricas que lo respalden en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la "Zero-Worm Protocol" se describe como transferencia continua de pensamiento vía SLAB_ID sin coste de tokens intermedios JSON/Markdown, pero no se detalla su funcionamiento ni su interfaz.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Integración con Ollama: se menciona el tag `qwen3.8:27b`, sin especificar la variante cuantizada asociada.

## Casos de uso

- Asistencia a la programación en entornos de desarrollo: el modelo se declara como copiloto de código, por lo que podría emplearse para autocompletado, generación de funciones y explicación de fragmentos, siempre que se validen previamente los pesos y el comportamiento real del adaptador.
- Razonamiento lógico sobre especificaciones formales: la inclusión declarada de 1.740 teoremas formales sugiere un uso orientado a tareas de verificación y deducción, aunque no se aportan ejemplos ni métricas de corrección.
- Experimentación en investigación geométrica de representaciones: el adaptador es interesante como artefacto para estudiar proyecciones sobre variedades de Stiefel y su efecto en el espacio latente de un transformer de 27B.
- Reproducción de experimentos de alineación geométrica: útil para grupos que investiguen técnicas alternativas a LoRA/QLoRA basadas en restricciones de ortogonalidad.
- Despliegue local con Ollama: el tag `qwen3.8:27b` permitiría, en principio, probar el modelo en estaciones de trabajo con GPU de gran capacidad, aunque la cuantización concreta no está documentada.
- Evaluación comparativa de adaptadores: puede servir como línea base en estudios que comparen adaptadores geométricos frente a ajuste fino convencional sobre el mismo modelo base.
- Integración en pipelines de razonamiento con bus de comunicación: el PmtpShmBus y el SLAB_ID se proponen para transferencia de estado entre procesos, un escenario relevante en sistemas multiagente de baja latencia, si bien su implementación no está publicada en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un transformer de 27B, en FP16 se requieren del orden de 54 GB de VRAM solo para pesos, y en cuantizaciones de 4 bits del orden de 14-16 GB; estas cifras son estimaciones generales y no han sido verificadas para este adaptador concreto.
- GPU recomendadas: no disponible. Por tamaño del modelo base, serían necesarias GPU de clase A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa.
- Viabilidad en GPU de consumo: no confirmada. Un modelo de 27B en cuantización de 4 bits podría caber en GPUs con 24 GB (RTX 3090/4090) o 32 GB, pero no hay datos publicados para esta variante.
- Opciones de despliegue: se menciona Ollama (tag `qwen3.8:27b`). No se documenta compatibilidad con vLLM, llama.cpp, TGI ni con el runtime nativo C++20/Rust descrito en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3.8-27b-pmtp | 27B (adaptador sobre Qwen3.8-27B-Instruct) | no disponible | other / qwen-community-license | Repo de 0,0 GB, 0 descargas | Sin benchmarks ni pesos verificables |
| Qwen3.8-27B-Instruct (base) | 27B | no disponible en esta ficha | qwen-community-license | Modelo base publicado por Qwen | Referencia directa del adaptador |
| Adaptadores LoRA/QLoRA sobre modelos de 27B | Depende del rango | Heredado del base | Según modelo base | Amplia disponibilidad en HuggingFace | Metodología estándar y reproducible |
| Modelos densos de ~27-32B de otras familias | 27-32B | Variable | Variable | Amplia | Comparativa no disponible con datos concretos en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación que permita validar las capacidades declaradas.
- Repositorio de 0,0 GB: no se confirma que los pesos del adaptador estén realmente alojados; el artefacto podría ser únicamente una especificación.
- Model card con afirmaciones no reproducibles: la geometría de Stiefel, el "defecto" de 4,24e-09, los 1.740 teoremas y la "Zero-Worm Protocol" no van acompañados de código, datos ni procedimiento de verificación.
- Riesgo de alucinación: inherente al modelo base y no cuantificado para esta variante.
- Sesgos: no documentados; se heredan los del modelo base Qwen3.8-27B-Instruct, que no se detallan.
- Idiomas: no se declara ningún conjunto de idiomas soportados, lo que impide garantizar un rendimiento mínimo en castellano u otras lenguas.
- Licencia: la licencia `other` remite a la qwen-community-license, cuyos términos condicionan el uso comercial y la redistribución; es necesario revisar el texto completo antes de cualquier despliegue en producción.
- Contexto: no se especifica la longitud de contexto efectiva tras la proyección a 2048 dimensiones, lo que impide planificar casos de uso con ventanas largas.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- Advertencia para producción: no se recomienda su uso en sistemas productivos sin una evaluación independiente previa y sin confirmar la integridad y el contenido real de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Polydim-Einsof/qwen3.8-27b-pmtp
- Repositorio del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-Instruct
