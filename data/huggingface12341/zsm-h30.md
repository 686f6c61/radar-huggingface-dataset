# huggingface12341/zsm-h30

## Resumen

zsm-h30 es un modelo de extracción de características (feature-extraction) publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un modelo resultante de la fusión (merge) de tres modelos base: `malkolm777/zils-mini-m24-teacher-mlp`, `joamCriff123/zils-mini-m1124a` y `Maincode/Matilda-Decision-v1-Mini`. Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB en formato safetensors, el modelo se distribuye con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

El modelo emplea la arquitectura Qwen3.5, según la etiqueta `qwen3_5` de Hugging Face, y está orientado a tareas de extracción de características y a un uso etiquetado como "decision-model". Incorpora código personalizado (`custom_code`), lo que implica que su carga requiere confiar en la implementación incluida en el repositorio y no solo en la librería transformers estándar. Es relevante ahora como ejemplo de modelo fusionado de pequeño-mediano tamaño con fines de representación y decisión, aunque su ecosistema, documentación y adopción son prácticamente inexistentes (0 descargas, 0 likes en el momento de la consulta).

La información pública disponible es muy limitada: no se especifican idiomas soportados, datos de entrenamiento, benchmarks ni detalles del proceso de fusión. Esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos del repositorio y advierte explícitamente de los vacíos de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (etiqueta `qwen3_5`); incluye `custom_code` |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se presenta como una fusión (merge) de tres modelos base: `malkolm777/zils-mini-m24-teacher-mlp`, `joamCriff123/zils-mini-m1124a` y `Maincode/Matilda-Decision-v1-Mini`. La etiqueta `qwen3_5` sugiere que la arquitectura subyacente sigue el diseño de la familia Qwen3.5, es decir, un transformer decoder-only, aunque no se detalla si incorpora atención lineal, decodificación especulativa u otras innovaciones. El pipeline declarado es `feature-extraction`, lo que indica que el modelo está pensado para producir representaciones (embeddings) más que para generación de texto libre, si bien la etiqueta `decision-model` apunta a un uso en tareas de clasificación o toma de decisiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documenta la metodología exacta de la fusión (por ejemplo, si fue un merge lineal, SLERP, TIES o DARE). La presencia de `custom_code` implica que el repositorio incluye código propio que debe revisarse antes de su uso en producción, ya que puede contener dependencias no auditadas.

## Capacidades

- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que el modelo está orientado a generar embeddings de texto para tareas posteriores (clasificación, recuperación, clustering).
- Modelo de decisión: la etiqueta `decision-model` sugiere uso en tareas de clasificación o selección entre opciones, aunque no se documenta el formato de entrada/salida.
- Fusión de modelos: al ser un merge de tres modelos base, puede heredar capacidades parciales de cada uno, pero no se especifica cuáles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de embeddings para búsqueda semántica: el modelo puede emplearse para vectorizar documentos y consultas en un sistema de recuperación de información, dado su pipeline de `feature-extraction`. Es adecuado por su tamaño moderado (4,54 B) y su licencia Apache 2.0, que permite uso comercial.
- Clasificación de textos: la etiqueta `decision-model` sugiere que puede usarse como base para clasificadores de intención, sentimiento o categorización de tickets, añadiendo una cabeza de clasificación sobre las representaciones extraídas.
- Filtrado y enrutamiento en pipelines de datos: puede utilizarse para decidir si un documento o consulta cumple ciertos criterios antes de pasarlo a un modelo mayor, reduciendo costes de inferencia.
- Prototipado de sistemas de recomendación: los embeddings generados pueden alimentar un motor de similitud para recomendar contenido o productos en fases tempranas de desarrollo.
- Investigación sobre fusiones de modelos: al ser un merge documentado de tres modelos, sirve como caso de estudio para analizar el comportamiento de técnicas de model merging en tareas de representación.
- Evaluación de modelos gated en entornos controlados: su acceso restringido permite probar flujos de aprobación y despliegue de modelos con licencia Apache 2.0 en organizaciones que requieren trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9,1 GB (4,54 B parámetros × 2 bytes), coherente con el tamaño del repositorio.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,6 GB; en 4 bits, alrededor de 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una GPU con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A10, L4). Para cuantización 4/8 bits, podría caber en GPUs consumer con 6-8 GB (RTX 3060, RTX 4060), siempre que se generen pesos cuantizados, algo que no se documenta.
- Cabe en GPU consumer: probablemente sí en FP16 en RTX 4090 (24 GB) y en cuantización en GPUs de 8 GB, pero no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), con posible uso de vLLM o TGI si se adapta el `custom_code`; no se documentan integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsm-h30 | 4,54 B | no disponible | Apache 2.0 | Gated en HF | Merge de 3 modelos, `custom_code` |
| Qwen2.5-3B | 3,09 B | 32k (típico) | Apache 2.0 | Pública | Modelo base de referencia de tamaño similar |
| Qwen2.5-7B | 7,62 B | 32k (típico) | Apache 2.0 | Pública | Alternativa de mayor tamaño |
| Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | HF | Uno de los modelos base del merge |

La comparativa es limitada porque no se dispone de datos de rendimiento de zsm-h30 ni de especificaciones completas de sus modelos base. Los modelos Qwen se incluyen como referencia de la familia arquitectónica declarada.

## Limitaciones y advertencias

- Información muy escasa: no se documentan idiomas, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede ralentizar su adopción en pipelines automatizados.
- Código personalizado (`custom_code`): la carga del modelo requiere ejecutar código del repositorio, con el riesgo de seguridad asociado; debe auditarse antes de usarlo en producción.
- Riesgo de alucinación y sesgos: no evaluado; al ser un modelo de extracción de características, el riesgo se traslada a los clasificadores o sistemas que lo utilicen.
- Licencia Apache 2.0: permite uso comercial, pero al ser un merge de modelos base, deben verificarse las licencias de estos (`malkolm777/zils-mini-m24-teacher-mlp`, `joamCriff123/zils-mini-m1124a`, `Maincode/Matilda-Decision-v1-Mini`) para asegurar compatibilidad.
- Sin adopción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Fecha de creación futura (2026-11-25): los metadatos indican una fecha posterior a la actual, lo que puede reflejar un error de registro o un repositorio de prueba; conviene verificar la integridad antes de confiar en él.

## Enlaces

- [Hugging Face: huggingface12341/zsm-h30](https://huggingface.co/huggingface12341/zsm-h30)
- [Modelo base: malkolm777/zils-mini-m24-teacher-mlp](https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp)
- [Modelo base: joamCriff123/zils-mini-m1124a](https://huggingface.co/joamCriff123/zils-mini-m1124a)
- [Modelo base: Maincode/Matilda-Decision-v1-Mini](https://huggingface.co/Maincode/Matilda-Decision-v1-Mini)
