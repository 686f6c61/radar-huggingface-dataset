# electroglyph/Inkling-2-Mini-Unbound-GGUF

## Resumen

Inkling-2-Mini-Unbound-GGUF es una colección de cuantizaciones en formato GGUF del modelo nokeepai/Inkling-2-Mini-Unbound, publicada por el usuario electroglyph. El repositorio no contiene un modelo original, sino una conversión y cuantización del modelo base realizada con llama.cpp (build b12669), pensada para su uso en entornos de inferencia local y compatible con llama.cpp y endpoints. El modelo base cuenta con 26.070.385.152 parámetros totales (aproximadamente 26 mil millones), según los datos de safetensors del repositorio.

La relevancia de esta publicación radica en que ofrece variantes cuantizadas con distintos niveles de compresión (desde IQ1_S hasta Q8_0), lo que permite desplegar un modelo de ~26B en hardware con recursos limitados, a costa de una pérdida de precisión variable. Las cuantizaciones se han generado replicando los tipos de cuantización por tensor y la matriz de importancia (imatrix) empleados por unsloth/Inkling-2-Mini-GGUF, lo que sugiere una intención de mantener coherencia con una referencia de cuantización previa.

No se dispone de información sobre la arquitectura interna del modelo base, el proceso de entrenamiento, los idiomas soportados ni la licencia en la información proporcionada. El repositorio tiene 4164 descargas y 0 likes, con una fecha de creación de noviembre de 2026 y una actualización tres días después.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ1_S, IQ2_XXS, IQ3_XXS, IQ4_XS, Q2_K_XL, Q3_K_XL, Q4_K_M, Q4_K_XL, Q8_K_XL, Q8_0, Q8_0_OLD |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como base de conversión BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base nokeepai/Inkling-2-Mini-Unbound en los datos proporcionados. No se indica si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único documentado en la model card es el proceso de cuantización: conversión del modelo base a BF16 mediante `convert_hf_to_gguf.py`, seguida de cuantización con llama.cpp (b12669). Las cuantizaciones replican los tipos por tensor y la imatrix (`imatrix_unsloth.gguf_file`) de unsloth/Inkling-2-Mini-GGUF, lo que indica que se ha utilizado una matriz de importancia para guiar la cuantización de bajo bit. No se documentan innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un modelo ajustado para diálogo, aunque no se detallan capacidades específicas.
- Inferencia local mediante llama.cpp: los ficheros GGUF son compatibles con llama.cpp y con endpoints compatibles, según los tags del repositorio.
- Cuantización flexible: permite elegir entre 12 variantes de cuantización con distintos compromisos entre tamaño y fidelidad.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento (thinking mode).

## Casos de uso

- Despliegue local en estaciones de trabajo: las variantes Q4_K_M o Q4_K_XL permiten ejecutar un modelo de ~26B en GPUs de consumo con 16-24 GB de VRAM, útil para prototipado y experimentación sin depender de servicios en la nube.
- Experimentación con cuantizaciones de bajo bit: las variantes IQ1_S e IQ2_XXS permiten estudiar el impacto de la compresión agresiva en la calidad de salida, comparando contra las variantes Q8_0 como referencia.
- Integración en pipelines con llama.cpp: al ser GGUF compatible con llama.cpp y endpoints compatibles, puede incorporarse en servicios de inferencia autoalojados para tareas de generación de texto conversacional.
- Evaluación comparativa de cuantizaciones: al replicar los tipos por tensor y la imatrix de unsloth/Inkling-2-Mini-GGUF, sirve para contrastar el efecto de distintas estrategias de cuantización sobre el mismo modelo base.
- Chat conversacional autoalojado: el tag `conversational` indica un uso previsto de diálogo; puede desplegarse como asistente local en entornos con requisitos de privacidad.
- Reproducción de conversiones BF16 a GGUF: el repositorio documenta el flujo (`convert_hf_to_gguf.py` + llama.cpp b12669), lo que facilita reproducir o adaptar el proceso para otros modelos.
- No se dispone de información suficiente para proponer casos de uso más específicos (código, matemáticas, visión, agentes) sin inventar capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros (~26B) y el tamaño del repositorio (187,3 GB para el conjunto de todas las cuantizaciones), las variantes de bajo bit (IQ1_S, IQ1_M, IQ2_XXS) podrían situarse en el rango de 7-10 GB, las intermedias (Q3, Q4) en 14-18 GB y las Q8 en torno a 26-28 GB; estos valores son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamaño de las cuantizaciones, las variantes Q4 podrían caber en GPUs de 16-24 GB, pero no se aporta confirmación.
- Opciones de despliegue: llama.cpp (build b12669 o superior) y endpoints compatibles con GGUF, según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| electroglyph/Inkling-2-Mini-Unbound-GGUF | ~26B | no disponible | GGUF | no disponible | Cuantizaciones de nokeepai/Inkling-2-Mini-Unbound |
| nokeepai/Inkling-2-Mini-Unbound | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta publicación |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | GGUF | no disponible | Referencia de cuantización (mismos tipos por tensor e imatrix) |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo conversacional, debe asumirse el riesgo habitual en producción sin datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: la licencia no está especificada, lo que impide confirmar si se permite uso comercial; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en producción.
- Las cuantizaciones de bajo bit (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la calidad de salida; no se aportan métricas de degradación.
- El repositorio incluye un fichero `Q8_0_OLD` que sugiere una versión previa reemplazada; conviene usar las variantes actuales.
- El tamaño del repositorio (187,3 GB) implica un coste de almacenamiento y descarga considerable si se clonan todas las variantes.
- No se dispone de información sobre el pipeline de la tarea ni sobre los idiomas, lo que limita la evaluación previa al despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-GGUF
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Referencia de cuantización: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
