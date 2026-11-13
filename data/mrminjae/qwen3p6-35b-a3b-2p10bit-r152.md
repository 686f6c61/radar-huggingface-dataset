# mrminjae/qwen3p6-35b-a3b-2p10bit-r152

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r152` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje con arquitectura Mixture of Experts (MoE) de aproximadamente 35 mil millones de parámetros totales y 3 mil millones activos por token. Lo publica el usuario `mrminjae` en Hugging Face como una cuantización selectiva: los expertos enrutados se almacenan a una media de 2,10 bits, mientras que el resto de pesos permanece en BF16.

La particularidad técnica es que los pesos se guardan dequantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización específicos en tiempo de inferencia. Esto reduce el tamaño en disco y en memoria respecto al checkpoint original, a costa de una pérdida de precisión concentrada en las capas MoE.

Es relevante para quienes necesitan desplegar un MoE de 35B en hardware más modesto y aceptan una degradación de calidad no documentada, ya que el autor no publica evaluaciones comparativas. El modelo se etiqueta como "internal research checkpoint" y no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | ~35B (según el nombre del modelo base) |
| Parametros activos | ~3B (según el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento dequantizado en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sujeta a la licencia del modelo base Qwen/Qwen3.6-35B-A3B (no especificada en la ficha) |
| Formato de pesos | safetensors (compatible con `transformers` y vLLM; no se indica GGUF) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos dispersas en las que solo una fracción de los parámetros se activa por token (aproximadamente 3B de 35B). El autor no detalla en la model card la composición del dataset de entrenamiento original, el número de tokens procesados ni si hubo fases de RLHF o DPO; esa información correspondería a la ficha del modelo base, que no se ha proporcionado.

La innovación de esta publicación es el esquema de cuantización: los expertos enrutados se comprimen a una media de 2,10 bits (identificador interno `r152`), mientras que el resto de pesos se mantiene en BF16. Los pesos se descomprimen y almacenan como tensores BF16, lo que permite cargarlos con las herramientas estándar sin kernels especializados. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni variantes de atención híbrida.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y matemáticas: presumiblemente soportados por el modelo base, aunque no se documentan en esta ficha.
- Generación de código: no confirmado en la información disponible.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint sirve para estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando salidas contra el modelo base en tareas controladas.
- Despliegue en entornos con memoria limitada: al reducir el peso de los expertos, permite probar un MoE de 35B en GPUs donde el checkpoint BF16 completo no cabría, usando vLLM o `transformers` sin cambios en el código.
- Evaluación de degradación por capas: útil para medir qué tareas (razonamiento, código, multilingüe) se ven más afectadas por la cuantización de los expertos frente a los pesos densos.
- Prototipado interno de pipelines de generación de texto: válido para pruebas de integración y latencia en las que la fidelidad exacta no es crítica.
- Benchmarking de infraestructura: comparar throughput y uso de VRAM entre este checkpoint y el modelo base para dimensionar despliegues MoE.
- Docencia y experimentación: ejemplo práctico de cuantización selectiva en arquitecturas MoE para cursos o talleres de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Al almacenarse en BF16 dequantizado, el peso en memoria se aproxima al de un modelo de ~35B en BF16 (del orden de 70 GB), aunque el tamaño en disco sea menor; el autor no confirma si la dequantización es completa al cargar o bajo demanda.
- GPU recomendadas: no disponibles. Por tamaño, un despliegue BF16 completo requeriría GPUs de 80 GB (A100, H100) o múltiples GPUs.
- GPU de consumo: no confirmado. Un MoE de 35B en BF16 no cabe en una RTX 4090 (24 GB) sin técnicas adicionales de offloading.
- Opciones de despliegue: `transformers` y vLLM, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r152 | ~35B | ~3B | no disponible | La del base | safetensors BF16 dequantizado | Expertos a 2,10 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 2,10 bits de los expertos puede degradar la calidad de forma no cuantificada; el autor no publica evaluaciones.
- Checkpoint etiquetado como "internal research checkpoint": no está pensado para producción.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe específicos de esta variante.
- La licencia depende del modelo base; conviene verificar los términos de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- El almacenamiento en BF16 dequantizado puede anular parte del ahorro de memoria en inferencia, aunque reduzca el tamaño en disco.
- Sin datos de contexto, idiomas ni benchmarks, la idoneidad para tareas concretas no puede validarse a priori.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- [Hugging Face: mrminjae/qwen3p6-35b-a3b-2p10bit-r152](https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r152)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
