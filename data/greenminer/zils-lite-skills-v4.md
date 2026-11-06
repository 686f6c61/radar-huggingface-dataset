# Greenminer/zils-lite-skills-v4

## Resumen

Zils-lite-skills-v4 es un ajuste fino (fine-tune) de tipo "dense-tail continuation" sobre un cuerpo propio de dos ramas denominado own-v1, desarrollado por el usuario Greenminer. El modelo parte de una arquitectura densa de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. La model card lo etiqueta como "decision-model" y "d3-lite", lo que sitúa su propósito en tareas de decisión estructurada, aritmética y consulta exacta más que en generación abierta de texto.

El entrenamiento declarado se centra en reforzar habilidades computacionales: 6.000 preguntas generadas programáticamente de aritmética, filtrado por restricciones, consulta exacta y decisión de inventario, complementadas con 5.000 registros de replay etiquetados por fuente pública y 4.826 registros de probabilidades de profesor (d3-ultra). Solo se entrenaron las matrices de pesos 2D de las últimas ocho capas del lenguaje, con maestros en FP32 y exportación en BF16, congelando normas, sesgos, embeddings, visión y la cabeza de lectura de respuesta.

El modelo es relevante como ejemplo de ajuste fino quirúrgico y de bajo coste sobre un cuerpo base pequeño, orientado a tareas de razonamiento acotado y decisión con restricciones. No obstante, la información pública es escasa: no se detallan benchmarks, idiomas soportados, longitud de contexto ni pipeline de uso, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (cuerpo propio own-v1 de dos ramas; fine-tune de las últimas 8 capas del lenguaje) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; exportación de entrenamiento en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso construido sobre un cuerpo propio de dos ramas (own-v1, con SHA256 3b57df02091f2a16f43ce2c17fd902ce95b8e8d3c2b6ab110ec955692b98c2b7) y declara como modelos base relacionados vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full. El ajuste es de tipo "dense-last8-layers-2d-fp32-master": se entrenan únicamente las matrices de pesos 2D de las últimas ocho capas del lenguaje, con maestros en FP32 y exportación en BF16, mientras que las normas, sesgos, embeddings, la torre de visión y la cabeza de lectura de respuesta permanecen congelados. El recuento de parámetros entrenables es de 165.871.616.

El conjunto de entrenamiento declarado combina 6.000 preguntas generadas programáticamente (aritmética, filtrado por restricciones, consulta exacta y decisión de inventario), 5.000 registros de replay etiquetados por fuente pública y 5.000 registros de probabilidades de profesor d3-ultra del pool de entrenamiento previo. El trabajo efectivamente consumido se registra como 15.573 filas y 1.027 pasos, con semilla 534106 y learning rate 3e-6. El corpus de profesor es zils-ai/zils-relay-answers (revisión 80c4668a53c1c3a9d0deb7c3c89dd08df30ae96c) y los mapeos de fuente usan tasksource (revisión 8df2e5c9a33f19a2c2b8febf291c3acb0a91a8a8). El autor indica que no se usaron checkpoints de competidores de pago como inicialización ni como objetivo, ni datos de clientes o exámenes privados de validación.

## Capacidades

- Razonamiento aritmético y computacional acotado, reforzado mediante preguntas generadas programáticamente.
- Filtrado por restricciones y decisión estructurada (etiqueta "decision-model").
- Consulta exacta (exact-lookup) y decisión de inventario, según la receta de entrenamiento declarada.
- Destilación de probabilidades de un profesor d3-ultra para tareas de decisión.
- La model card menciona una torre de visión congelada, aunque no se detalla su funcionalidad ni se documenta uso multimodal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación y decisión con restricciones: el modelo puede emplearse para resolver tareas de filtrado donde una entrada debe evaluarse contra un conjunto de reglas explícitas, aprovechando el entrenamiento específico en "constraint-filter".
- Aritmética de dominio acotado: útil como componente de verificación en pipelines donde se requieran cálculos sencillos y comprobables, dado el refuerzo sobre preguntas aritméticas generadas.
- Consulta exacta en bases de conocimiento estructuradas: el ajuste en "exact-lookup" lo hace candidato para mapear consultas a registros concretos en catálogos o tablas.
- Decisión de inventario: escenario declarado en el entrenamiento, aplicable a sistemas de gestión de stock que requieran decidir reposición o asignación a partir de reglas.
- Destilación y evaluación de profesores: los registros de probabilidades d3-ultra permiten usar el modelo como alumno de referencia en experimentos de destilación o como baseline ligero.
- Prototipado de bajo coste: con ~853 M de parámetros y pesos en safetensors, puede desplegarse en entornos con recursos limitados para validar flujos de decisión antes de escalar a modelos mayores.
- Investigación sobre ajuste fino selectivo: sirve como caso de estudio de entrenamiento de solo las últimas capas con maestros FP32, útil para comparar estrategias de fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "local public-proxy benchmarks" sin aportar cifras y advierte que estos no establecen admisión, plazas, coronas ni emisiones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16/FP16 (tamaño del repo); en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 quedan sobredimensionadas pero son compatibles.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: no se documentan; al ser safetensors, es compatible con cargadores estándar de Hugging Face Transformers, vLLM, TGI o llama.cpp tras conversión a GGUF, si bien no se confirma soporte oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Greenminer/zils-lite-skills-v4 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-lite (base relacionado) | no disponible | no disponible | no disponible | no disponible |
| Maincode/Matilda-Decision-v1-Edge (base relacionado) | no disponible | no disponible | no disponible | no disponible |
| zils-ai/jiwo-0.8b-full (base relacionado) | ~0,8 B (por el nombre) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datos públicos y generados, puede heredar sesgos de las fuentes subyacentes (tasksource y sus datasets upstream).
- Riesgo de alucinación: no evaluado públicamente; en tareas de consulta exacta y decisión, una salida incorrecta puede ser difícil de detectar sin validación externa.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento fuera del inglés o en contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card exige mantener las obligaciones de atribución de las fuentes (tasksource, Sileo, LREC-COLING 2024) y de los datasets upstream.
- Caveat de producción: el autor advierte que los benchmarks de proxy público local no constituyen evidencia de admisión, plazas, coronas ni emisiones; no deben usarse como garantía de rendimiento.
- Madurez: repositorio sin descargas ni interacciones, creado y actualizado el mismo día, sin pipeline declarado ni documentación de uso; no se recomienda para producción sin evaluación propia.
- Alcance del entrenamiento: solo se ajustaron las últimas ocho capas del lenguaje, por lo que las capacidades fuera del dominio de decisión y aritmética dependen del cuerpo base y no han sido reforzadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Greenminer/zils-lite-skills-v4
- Modelo base relacionado: https://huggingface.co/vllm-sr/d3-lite
- Modelo base relacionado: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo base relacionado: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Corpus de profesor: https://huggingface.co/zils-ai/zils-relay-answers (revisión 80c4668a53c1c3a9d0deb7c3c89dd08df30ae96c)
- Mapeos de fuente tasksource: https://huggingface.co/datasets/tasksource (revisión 8df2e5c9a33f19a2c2b8febf291c3acb0a91a8a8)
- Referencia tasksource (Sileo, LREC-COLING 2024): no disponible como enlace directo en la información proporcionada
- Repositorio de runtime ooo-hq/zils: no disponible como enlace directo en la información proporcionada (commit e2c18fa80db2d84f7bf795fb865287ecdb57cf0f)
