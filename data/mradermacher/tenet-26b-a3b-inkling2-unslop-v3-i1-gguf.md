# mradermacher/Tenet-26B-A3B-Inkling2-Unslop-v3-i1-GGUF

## Resumen

Tenet-26B-A3B-Inkling2-Unslop-v3-i1-GGUF es una cuantización en formato GGUF del modelo Tenet-26B-A3B-Inkling2-Unslop-v3, publicada por mradermacher, un autor habitual en la distribución de cuantizaciones GGUF para llama.cpp. El modelo base procede del usuario mr-andrey-isachenko y, por su nomenclatura, se trata de un modelo de arquitectura MoE (Mezcla de Expertos) con 26.070.385.152 parámetros totales y aproximadamente 3B de parámetros activos por token (el sufijo "A3B").

La relevancia de esta ficha radica en que ofrece una versión lista para inferencia local en hardware de consumo mediante cuantizaciones de tipo imatrix (importancia matricial), que reducen el error de cuantización en comparación con las cuantizaciones estándar. El repositorio ocupa 11,0 GB e incluye un conjunto amplio de niveles de cuantización, desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No obstante, la información pública disponible es muy limitada: no se especifica licencia, idiomas soportados, pipeline ni detalles de entrenamiento del modelo base. Esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mezcla de Expertos), según nomenclatura "A3B"; detalles no disponibles |
| Parámetros totales | 26.070.385.152 (~26B) |
| Parámetros activos | ~3B (inferido del sufijo "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La nomenclatura "26B-A3B" indica un diseño de Mezcla de Expertos con aproximadamente 26 mil millones de parámetros totales y unos 3 mil millones activos por token, lo que sugiere un modelo eficiente en cómputo de inferencia pese a su tamaño total. No se dispone de información sobre el número de expertos, la estrategia de enrutamiento ni el tipo de atención empleado.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composición del dataset, ni referencia a fases de RLHF, DPO o ajuste por instrucciones. El nombre "Inkling2-Unslop-v3" sugiere un proceso de ajuste fino orientado a conversación y a la eliminación de estilo redundante ("unslop"), pero se trata de una inferencia a partir del nombre, no de un dato confirmado. Las cuantizaciones publicadas por mradermacher son de tipo "weighted/imatrix", es decir, generadas con una matriz de importancia para preservar mejor los pesos relevantes durante la compresión.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" del repositorio indica uso previsto para diálogo.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" señala que el modelo puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Razonamiento y código: no confirmado en la información disponible; el tamaño del modelo base lo hace plausible, pero no hay documentación que lo respalde.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local de un modelo conversacional de gran tamaño: gracias a las cuantizaciones IQ1_S a Q6_K, es posible ejecutar el modelo en estaciones de trabajo con VRAM limitada, ajustando el nivel de cuantización al hardware disponible.
- Experimentación e investigación: útil para estudiar el comportamiento de un MoE de ~26B con ~3B activos en entornos controlados y sin dependencia de APIs externas.
- Prototipado de asistentes conversacionales: la orientación conversacional del modelo base permite construir demos de chat multi-turno con llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes, lo que facilita medir el impacto de la cuantización imatrix en la calidad de salida.
- Integración en pipelines compatibles con endpoints: la etiqueta "endpoints_compatible" permite servirlo mediante infraestructura estándar de Hugging Face.
- Fine-tuning posterior sobre la versión cuantizada: aunque limitado, es posible usar técnicas como LoRA sobre versiones de alta precisión (Q6_K) para adaptar el modelo a dominios concretos.
- Pruebas de inferencia en CPU: las cuantizaciones más agresivas (IQ1_S, IQ2_XXS) permiten ejecución en CPU con llama.cpp, aunque con degradación de calidad esperable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~26B parámetros, una cuantización Q4_K_M requiere aproximadamente 15-16 GB de VRAM; Q6_K se acerca a 21-22 GB; las cuantizaciones IQ2/IQ1 pueden situarse en torno a 7-10 GB. Estas cifras son estimaciones basadas en el tamaño del repositorio (11,0 GB) y el número de parámetros, no datos oficiales.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o A100/H100 resultan adecuadas; para cuantizaciones bajas, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080 pueden ser suficientes.
- ¿Cabe en GPU de consumo? Sí, en función de la cuantización: las variantes IQ1/IQ2 y Q3 caben en GPUs de 8-12 GB; Q4_K_M requiere 16 GB o más; Q6_K requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), y servidores compatibles con la API de Hugging Face (etiqueta "endpoints_compatible").
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B parámetros activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tenet-26B-A3B-Inkling2-Unslop-v3 (este) | ~26B | ~3B | no disponible | no disponible | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre el modelo base ni sobre alternativas directas de la misma familia para establecer una comparativa rigurosa. Se recomienda consultar el repositorio del modelo original (mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3) para obtener datos de referencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Degradación por cuantización: las variantes IQ1_S, IQ2_XXS e IQ2_XS pueden producir pérdidas notables de calidad; se recomienda Q4_K_M o superior para uso serio.
- Sesgos: no documentados; el modelo base no incluye información sobre evaluación de sesgos.
- Contexto desconocido: se desconoce la ventana de contexto máxima, lo que limita el diseño de aplicaciones que dependan de contexto largo.
- Procedencia del modelo base: al no haber model card detallada del modelo original, no se pueden verificar los datos de entrenamiento ni las técnicas de alineación aplicadas.
- Repositorio sin descargas ni likes: indica que la cuantización es reciente y no ha sido validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-26B-A3B-Inkling2-Unslop-v3-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3
