# Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-gguf

## Resumen

EINSOF-II Granite 3.3 8B Qiskit Stiefel es una cuantización GGUF del modelo base `Qiskit/granite-3.3-8b-qiskit`, publicado por el usuario Polydim-Einsof. El modelo parte de la familia IBM Granite 3.3 (8B parámetros) y ha sido adaptado al dominio de la computación cuántica mediante un adaptador LoRA propio (`einsof2-granite-8b-qiskit-stiefel-adapter`). El resultado se distribuye en dos cuantizaciones GGUF listas para su uso con llama.cpp y Ollama.

La particularidad técnica del proyecto es el uso de una retracción polar de orden 4 sobre la variedad de Stiefel S^(D-1), un formalismo geométrico que el autor asocia a su framework POLYDIM PMTP. Se trata de una propuesta de nicho, sin validación independiente publicada, orientada a experimentación con modelos especializados en Qiskit y computación cuántica.

El modelo hereda del base Granite 3.3 una arquitectura transformer densa de 8.170.864.640 parámetros y licencia Apache 2.0. No obstante, la información pública disponible es muy limitada: no se documentan idiomas, pipeline, benchmarks ni detalles del dataset de adaptación, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de IBM Granite 3.3 8B) con adaptación LoRA sobre variedad de Stiefel |
| Parámetros totales | 8.170.864.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (4,60 GB) y Q8_0 (8,09 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qiskit/granite-3.3-8b-qiskit`, una variante del IBM Granite 3.3 de 8B parámetros orientada a computación cuántica. Sobre esa base se aplica un adaptador (`einsof2-granite-8b-qiskit-stiefel-adapter`) que, según la model card, emplea una retracción polar de orden 4 sobre la variedad de Stiefel S^(D-1). Este tipo de retracción se usa habitualmente en optimización sobre variedades para mantener los pesos en una variedad ortogonal; el autor lo integra en su framework POLYDIM PMTP.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de adaptación, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La única información técnica concreta es el pipeline de cuantización: llama.cpp junto con POLYDIM PMTP, con dos variantes GGUF publicadas.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Granite 3.3 8B.
- Especialización declarada en computación cuántica y Qiskit, por herencia del base `Qiskit/granite-3.3-8b-qiskit` y del adaptador aplicado.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta variante.
- Razonamiento multi-paso y uso como agente: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).

## Casos de uso

- Asistencia en desarrollo con Qiskit: el modelo puede ayudar a redactar circuitos cuánticos, explicar primitivas y resolver dudas de API, aprovechando su especialización heredada del base Qiskit.
- Generación de documentación técnica de computación cuántica: útil para redactar explicaciones de algoritmos (Grover, Shor, VQE) en entornos de investigación.
- Prototipado en local con Ollama: las cuantizaciones Q4_K_M (4,60 GB) y Q8_0 (8,09 GB) permiten desplegar el modelo en estaciones de trabajo sin GPU de datacenter.
- Experimentación con adaptaciones geométricas: interés para investigadores que quieran evaluar el efecto de la retracción de Stiefel sobre la calidad del modelo.
- Tutoría en cursos de computación cuántica: respuestas conversacionales sobre conceptos de Qiskit en entornos educativos con recursos limitados.
- Base para fine-tuning adicional: al estar en GGUF y con licencia Apache 2.0, sirve como punto de partida para adaptaciones posteriores (aunque el formato GGUF limita el reentrenamiento directo; habría que partir del adaptador o del base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 5-6 GB incluyendo overhead de contexto.
- VRAM estimada para Q8_0: en torno a 9-10 GB incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4070/4080 o A10 para Q8_0.
- Cabe en GPU de consumo: sí, ambas cuantizaciones en tarjetas con 8-12 GB de VRAM (Q8_0 requiere al menos 10-12 GB para contexto amplio).
- Opciones de despliegue: llama.cpp y Ollama (según la model card); compatible con endpoints según los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EINSOF-II Granite 3.3 8B Qiskit Stiefel | 8,17 B | no disponible | Apache 2.0 | GGUF | Adaptación geométrica de nicho, sin benchmarks |
| Qiskit/granite-3.3-8b-qiskit (base) | ~8 B | no disponible | Apache 2.0 | safetensors | Modelo oficial de IBM/Qiskit, sin adaptador Stiefel |
| IBM Granite 3.3 8B (original) | ~8 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista de referencia de la familia |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Alternativa generalista ampliamente soportada |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que la adaptación Stiefel mejore al base.
- Sin documentación del dataset de adaptación: riesgo de sobreajuste o degradación en dominios ajenos a la computación cuántica.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe adecuado.
- Contexto no especificado: no apto para tareas que requieran ventanas largas sin verificación previa.
- Proyecto de autor individual con 0 descargas y 0 likes en el momento de la ficha: sin validación por la comunidad.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la falta de evaluación.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del adaptador antes de uso comercial.
- El formalismo de la variedad de Stiefel y el framework POLYDIM PMTP no cuentan con publicaciones revisadas por pares en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-gguf
- Modelo base: https://huggingface.co/Qiskit/granite-3.3-8b-qiskit
- Adaptador: https://huggingface.co/Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-adapter
