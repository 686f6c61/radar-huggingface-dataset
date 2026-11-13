# mrminjae/qwen3p6-35b-a3b-2p10bit-r118

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r118` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba. La modificación introducida por el autor del repositorio (mrminjae) consiste en una cuantización selectiva: los pesos de los expertos enrutados se almacenan con una precisión media de 2,10 bits, mientras que el resto de los pesos del modelo permanece en BF16. Los tensores se distribuyen ya de-cuantizados en BF16, de modo que el checkpoint carga con `transformers` y vLLM estándar sin necesidad de kernels especiales de cuantización.

El interés técnico del modelo reside en la estrategia de compresión: al aplicar la reducción de precisión únicamente a la fracción de parámetros correspondiente a los expertos, se busca un compromiso entre la huella de memoria y la fidelidad de las capas de atención y enrutamiento, que se mantienen en BF16. El nombre del repositorio indica 35B de parámetros totales con 3B activos por token (sufijo A3B), aunque estos datos proceden del identificador y no se han verificado de forma independiente en la información disponible.

Se trata de un checkpoint de investigación interna, con cero descargas y cero interacciones en el momento de la consulta, publicado el 13 de noviembre de 2026. No dispone de model card detallada, benchmarks, ni especificación de licencia propia; el autor remite a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, según el modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35B (según identificador del repositorio) |
| Parametros activos | 3B (según identificador del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; tensores almacenados de-cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors en BF16 (carga con `transformers` y vLLM estándar) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos en las que solo un subconjunto de parámetros (3B según el identificador) se activa por token. La intervención de mrminjae no altera la topología de la red: modifica la representación numérica de los pesos de los expertos enrutados, que pasan a tener una precisión media de 2,10 bits, mientras que las capas restantes (atención, normalizaciones, embeddings y router) conservan BF16. El resultado se serializa en tensores BF16 ya expandidos, lo que evita dependencias de kernels de cuantización en tiempo de inferencia.

No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens procesados, la composición del corpus ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta el método exacto de cuantización empleado (por ejemplo, cuantización post-entrenamiento con escalas por grupo, GPTQ, AWQ o una variante propia), ni el error de reconstrucción introducido respecto al checkpoint original. La etiqueta `r118` sugiere una iteración interna de un proceso de investigación, pero no se detalla su significado.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y matemáticas: presumiblemente soportadas por el modelo base, aunque no se documentan evaluaciones en este checkpoint.
- Generación de código: capacidad esperable del modelo base; sin verificación específica en esta versión cuantizada.
- Tool calling y function calling: no documentado en este repositorio; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible el listado de idiomas.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint sirve para estudiar cómo afecta una precisión media de 2,10 bits en los expertos a la perplejidad y a tareas de razonamiento, comparando contra el modelo base en BF16.
- Evaluación de degradación por capas: al mantener atención y router en BF16 mientras se comprimen los expertos, permite aislar el impacto de la cuantización en la ruta de enrutamiento frente a la de las representaciones.
- Despliegue en entornos con memoria limitada: al almacenarse en BF16 de-cuantizado, la huella real depende del tamaño serializado, pero la compresión subyacente facilita experimentar con presupuestos de memoria reducidos en GPUs de gama alta.
- Reproducción de pipelines con `transformers` y vLLM: al cargar con herramientas estándar, se puede integrar en flujos de inferencia existentes sin kernels personalizados, útil para pruebas de regresión.
- Estudio de estabilidad numérica: analizar si la de-cuantización a BF16 de pesos originalmente a 2,10 bits introduce artefactos en la generación (repeticiones, degradación de formato).
- Base para comparativas de eficiencia: medir latencia y throughput frente al modelo base y a otras cuantizaciones (por ejemplo, 4 bits o 8 bits) en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma verificada. Al almacenarse los pesos de-cuantizados en BF16, la huella en memoria se aproxima a la de un modelo de 35B en BF16 (del orden de 70 GB solo en pesos), salvo que el runtime aplique compresión adicional; este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Por el tamaño del modelo base, serían necesarias GPUs de centro de datos (A100 80 GB, H100 80 GB) o configuraciones multi-GPU; no se especifica en el repositorio.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 35B en BF16 no cabe en GPUs de consumo de 24 GB sin técnicas adicionales de offloading o cuantización en runtime.
- Opciones de despliegue: `transformers` y vLLM, según indica el autor; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r118 | 35B totales / 3B activos (según identificador) | no disponible | no disponible (sigue al base) | safetensors BF16 de-cuantizado | Expertos a 2,10 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | no disponible | safetensors | Modelo base en precisión original |
| Otras cuantizaciones del mismo base (4 bits, 8 bits) | 35B totales / 3B activos | no disponible | según autor | GGUF / safetensors | No se dispone de datos concretos en la información consultada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna: sin model card detallada, sin benchmarks y con cero descargas; no apto para producción sin validación propia.
- La cuantización a 2,10 bits en los expertos puede degradar la calidad de generación, el razonamiento y la coherencia en comparación con el modelo base; no se documenta la magnitud de esa degradación.
- El método de cuantización no está especificado, lo que dificulta reproducir el proceso o auditar el error introducido.
- Licencia no declarada explícitamente: el autor remite a la del modelo base, pero no se confirma cuál es ni si permite uso comercial.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin verificación.
- Riesgo de alucinación y sesgos inherentes al modelo base, no evaluados en esta versión.
- Almacenamiento en BF16 de-cuantizado: el ahorro de memoria respecto al base puede ser menor de lo que sugiere la precisión de 2,10 bits, dependiendo del tamaño serializado final.
- Sin garantías de mantenimiento, soporte ni actualizaciones por parte del autor.

## Enlaces

- [Hugging Face: mrminjae/qwen3p6-35b-a3b-2p10bit-r118](https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r118)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
