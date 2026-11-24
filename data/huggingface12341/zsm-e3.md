# huggingface12341/zsm-e3

## Resumen

zsm-e3 es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un modelo resultante de una fusión (merge) lineal de pesos, no de un entrenamiento desde cero: combina el cuerpo base `joamCriff123/zils-mini-m1121t` con un vector de tarea derivado de `alibiserikbay/JevK5` sobre el modelo padre `Qwen/Qwen3.5-4B`. El resultado es un checkpoint de aproximadamente 4.539 millones de parámetros (4,54 mil millones) en formato safetensors, con un repositorio de 9,1 GB.

El modelo se enmarca en el ecosistema "Zils subnet 127 d3-mini pool", una iniciativa de merging comunitario que agrupa checkpoints derivados de la familia Qwen3.5. La arquitectura subyacente es la del transformer de Qwen3.5-4B, con torre de visión heredada del cuerpo base y pesos de lenguaje modificados mediante la suma de vectores de tarea. La licencia es Apache 2.0 y la librería de referencia es transformers con código personalizado (`custom_code`).

Su relevancia es limitada y experimental: se publicó el 23 de noviembre de 2026, no acumula descargas ni likes, y no dispone de model card con especificaciones detalladas, benchmarks ni documentación de uso. Debe tratarse como un artefacto de investigación para experimentación con técnicas de model merging, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), con torre de visión heredada del cuerpo base |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del transformer de `Qwen/Qwen3.5-4B`, que actúa como modelo padre. Sobre esa base se aplica una fusión lineal de tipo "task arithmetic": se calcula el vector de tarea `(JevK5 - Qwen3.5-4B)` sobre los pesos de lenguaje y se suma al cuerpo base con un coeficiente de 0,5, es decir, `base + 0.5 × (JevK5 - Qwen3.5-4B)`. La torre de visión se mantiene intacta respecto al cuerpo base `joamCriff123/zils-mini-m1121t`. No hay entrenamiento adicional, RLHF ni DPO documentados: el proceso es puramente de combinación de pesos.

El modelo forma parte del pool "d3-mini" de la subnet 127 de Zils, un espacio de merges comunitarios. No se documentan el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El repositorio incluye un archivo NOTICE que referencia las fuentes Apache 2.0, pero la model card no aporta más detalle técnico.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado oficialmente en Hugging Face.
- Generación de texto: presumiblemente heredada del modelo padre Qwen3.5-4B, aunque no está documentada ni validada en la model card.
- Procesamiento de visión: la torre de visión del cuerpo base se conserva, por lo que el modelo podría aceptar entradas multimodales, si bien no se especifica ni se garantiza.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponibles; el campo de idiomas no está rellenado.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Experimentación con técnicas de model merging: el modelo sirve como caso de estudio para reproducir la fusión lineal `base + 0.5 × (task vector)` y evaluar el impacto del coeficiente en las capacidades resultantes.
- Investigación en extracción de características: al declarar el pipeline `feature-extraction`, puede emplearse para obtener embeddings de texto en tareas de clasificación o recuperación, siempre que se valide empíricamente su calidad.
- Evaluación comparativa de checkpoints derivados de Qwen3.5-4B: útil para medir cómo afecta la mezcla de pesos a las métricas del modelo padre en tareas concretas.
- Prototipado de pipelines multimodales: si la torre de visión funciona correctamente, podría integrarse en pruebas de concepto de descripción de imágenes o búsqueda visual, aunque sin garantías documentadas.
- Docencia y formación en model merging: ejemplo práctico para explicar vectores de tarea, coeficientes de interpolación y riesgos de la fusión de pesos.
- Análisis de linaje de modelos: permite estudiar la trazabilidad entre `Qwen3.5-4B`, `JevK5`, `zils-mini-m1121t` y el resultado final, útil en auditorías de procedencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas para fp16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para despliegues cómodos.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 Ti, siempre que se genere la cuantización manualmente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsm-e3 | 4,54 mil millones | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Merge lineal experimental, sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 mil millones | no disponible | Apache 2.0 (presumible) | Hugging Face | Modelo padre, entrenado y documentado |
| joamCriff123/zils-mini-m1121t | no disponible | no disponible | Apache 2.0 | Hugging Face | Cuerpo base del merge |
| alibiserikbay/JevK5 | no disponible | no disponible | Apache 2.0 | Hugging Face | Fuente del vector de tarea |

## Limitaciones y advertencias

- Modelo sin benchmarks ni evaluación publicada: no hay evidencia de que el merge preserve o mejore las capacidades del modelo padre.
- Riesgo elevado de degradación por merging: la combinación lineal de pesos puede producir artefactos, olvido catastrófico o comportamientos incoherentes no detectados.
- Ausencia de model card detallada: no se documentan idiomas, contexto, cuantizaciones ni limitaciones específicas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar los archivos antes de usarlo en producción.
- Sin descargas ni validación comunitaria: no hay señales de uso real que permitan inferir su fiabilidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B y de otros checkpoints conviene revisar el NOTICE y las licencias de los modelos base.
- Riesgo de alucinación: no evaluado; al ser un modelo derivado de un LLM, es esperable, pero no hay datos que lo cuantifiquen.
- Soporte multilingüe no declarado: no se garantiza un rendimiento adecuado fuera de los idiomas del modelo padre.
- Fecha de creación futura (2026-11-23): verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-e3
- Modelo base (cuerpo): https://huggingface.co/joamCriff123/zils-mini-m1121t
- Fuente del vector de tarea: https://huggingface.co/alibiserikbay/JevK5
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-4B
