# Polydim-Einsof/qwen3-1.5b-pmtp

## Resumen

qwen3-1.5b-pmtp es un adaptador sobre el modelo base Qwen/Qwen3-1.5B-Instruct publicado por Polydim-Einsof (Ariel García Traba) dentro de la iniciativa de investigación POLYDIM-EINSOF. Se presenta como un "student starter" ultraligero orientado a razonamiento en CPU, con un consumo declarado de 512 MB de RAM. El modelo se distribuye en formato safetensors y está etiquetado con los términos `polydim`, `pmtp` y `stiefel-manifold`, que apuntan a una técnica propietaria de adaptación sobre subespacios principales.

La propuesta técnica se articula en torno a una variedad de Stiefel denotada como St(2048, 1024) sobre la esfera S^(1023), con un "Stiefel defect" declarado de 6.67e-09 medido en FP64 con aritmética de Neumaier. El autor menciona además una base de datos PostgreSQL 16 (`polydim_vec_db`) con 1.740 teoremas formalizados y una capa de ejecución sobre instrucciones AVX2 con un protocolo denominado PmtpShmBus y Zero-Worm SLAB_ID. No se especifican ni el número de parámetros del adaptador ni el volumen de datos de entrenamiento.

El repositorio tiene un tamaño declarado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no incluye resultados de benchmarks, composición del dataset ni detalles sobre el proceso de alineamiento. La relevancia práctica es limitada por ahora: se trata de una publicación de investigación incipiente cuya reproducibilidad y rendimiento no están documentados públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer (base Qwen3-1.5B-Instruct); manifold St(2048, 1024) sobre S^(1023) |
| Parámetros totales | no disponible (base: 1.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (model card indica Qwen Community License Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El componente diferencial es un adaptador PMTP (Polydim Manifold Transport Projection, según las siglas empleadas en los tags) que opera sobre un subespacio principal de la variedad de Stiefel St(2048, 1024) embebida en S^(1023). El autor reporta un defecto de ortogonalidad ("Stiefel defect") de 6.67e-09 calculado en FP64 con suma compensada de Neumaier, lo que sugiere que el adaptador preserva la estructura ortogonal de las matrices de proyección con alta precisión numérica.

La capa de ejecución se describe como dependiente de instrucciones AVX2, un bus de memoria compartida propietario (PmtpShmBus) y un protocolo de gestión de memoria denominado Zero-Worm SLAB_ID. Se menciona asimismo una base de datos PostgreSQL 16 con 1.740 teoremas formalizados que respaldarían el diseño. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o destilación. Tampoco se detalla el método de fusión entre el adaptador y los pesos del modelo base.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-1.5B-Instruct.
- Soporte de modo "thinking" (razonamiento extendido) presumiblemente heredado de la familia Qwen3, aunque no se confirma explícitamente en la model card.
- Capacidad multilingüe del modelo base, sin que el autor detalle idiomas concretos para el adaptador.
- Tool calling y function calling: no documentado para el adaptador; el modelo base Qwen3 lo soporta.
- Ejecución en CPU con un consumo declarado de 512 MB de RAM.
- Aceleración mediante instrucciones AVX2.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Despliegue en entornos sin GPU: el modelo está diseñado para ejecutarse en CPU con 512 MB de RAM, lo que permite integrarlo en dispositivos de borde, contenedores ligeros o máquinas virtuales de bajo coste donde no hay acelerador disponible.
- Prototipado de razonamiento ultraligero: útil para experimentar con técnicas de adaptación sobre subespacios (Stiefel manifold) en flujos de investigación académica, comparando el comportamiento frente al modelo base sin adaptar.
- Sustituto de bajo consumo en pipelines de clasificación o extracción: para tareas de procesamiento de texto por lotes donde el throughput importa más que la calidad punta y el presupuesto de memoria es restrictivo.
- Evaluación de la técnica PMTP: investigadores interesados en métodos de proyección ortogonal pueden usar el repositorio como referencia reproducible (sujeto a la disponibilidad efectiva de los pesos, dado el tamaño declarado de 0.0 GB).
- Asistente local en estaciones de trabajo sin GPU dedicada: con AVX2 y 512 MB de RAM, puede servir como base para asistentes de texto en entornos de escritorio.
- Docencia y divulgación: ejemplo práctico de adaptación sobre modelos Qwen3 para explicar conceptos de geometría diferencial aplicada (variedades de Stiefel, subespacios principales) en cursos de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el adaptador en CPU; el autor declara 512 MB de RAM para inferencia.
- GPU recomendadas: no documentadas. El modelo base Qwen3-1.5B-Instruct puede ejecutarse en GPU consumer, pero el adaptador PMTP se describe específicamente para CPU con AVX2.
- Cabe en GPU consumer: el modelo base sí; el adaptador está orientado a CPU.
- Opciones de despliegue: el autor menciona el tag de Ollama `qwen3:1.5b` para el modelo base, pero no se especifica un mecanismo de carga del adaptador PMTP en Ollama, vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-1.5b-pmtp | 1.5B (base) + adaptador | no disponible | other (Qwen Community License) | Hugging Face (repo vacío, 0 descargas) |
| Qwen/Qwen3-1.5B-Instruct | 1.5B | no disponible en la información | Qwen Community License | Hugging Face, ampliamente adoptado |
| Llama 3.2 1B Instruct | 1.2B | 128K | Llama 3.2 Community License | Hugging Face, Ollama, vLLM |
| Gemma 2 2B Instruct | 2.6B | 8K | Gemma Terms of Use | Hugging Face, Ollama |

La comparación directa con alternativas de la misma categoría (modelos de 1-3B para CPU/edge) es desfavorable en términos de evidencia: el adaptador PMTP no publica benchmarks, no tiene descargas y su repositorio figura con 0.0 GB, mientras que los modelos base y competidores cuentan con documentación extensa y métricas públicas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de que el adaptador mejore al modelo base en ninguna tarea.
- Repositorio con tamaño declarado de 0.0 GB y cero descargas: los pesos pueden no estar efectivamente disponibles o el repositorio puede estar incompleto.
- Dependencia de instrucciones AVX2 y de componentes propietarios (PmtpShmBus, Zero-Worm SLAB_ID) cuya implementación no se publica en la model card, lo que compromete la reproducibilidad.
- Licencia ambigua: la etiqueta de Hugging Face indica "other" mientras la model card menciona la Qwen Community License Agreement; es necesario verificar los términos aplicables antes de cualquier uso comercial.
- Idiomas no especificados: no se confirma qué lenguas cubre el adaptador ni si el ajuste degrada el multilingüismo del modelo base.
- Sesgos y alucinaciones: no documentados para el adaptador; se heredan los del modelo base Qwen3-1.5B-Instruct, que no se detallan en la información disponible.
- Contexto no documentado: se desconoce si el adaptador preserva la ventana de contexto nativa del modelo base.
- Fecha de creación futura (2026-11-10) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el artefacto.
- Sin soporte documentado para tool calling, agentes o multi-step reasoning específico del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/qwen3-1.5b-pmtp
- DOI del autor: https://doi.org/10.5281/zenodo.24013070
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.5B-Instruct
