# mrminjae/qwen3p6-35b-a3b-2p02bit-r89

## Resumen

Qwen3.6-35B-A3B 2.02-bit routed experts (r89) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados (routed experts) del componente Mixture-of-Experts se han comprimido a una media de 2.02 bits, mientras que el resto de pesos se mantiene en BF16. El resultado se almacena de forma dequantizada en tensores BF16, de modo que puede cargarse con transformers estándar o con vLLM sin necesidad de kernels personalizados.

El modelo conserva la arquitectura y el tamaño del original: 35.107.181.936 parámetros totales según los safetensors del repositorio, con la topología MoE propia de la familia Qwen3.5/Qwen3.6 (tag `qwen3_5_moe`) y capacidad image-text-to-text, lo que indica que el modelo base es multimodal. La propuesta es relevante para quienes investigan compresión extrema de modelos MoE: demuestra que es posible reducir los expertos a ~2 bits manteniendo el checkpoint cargable en infraestructura estándar, a costa de un incremento notable del tamaño del repositorio (70,2 GB) al guardar los pesos dequantizados en BF16.

Se trata de un artefacto de investigación interna, no de un modelo de producción: el autor lo etiqueta explícitamente como "internal research checkpoint", la licencia no está declarada en la ficha y no hay datos publicados de benchmarks ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2.02 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (carga compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.6-35B-A3B: un transformer con capas Mixture-of-Experts, identificado en los tags del repositorio como `qwen3_5_moe`, con pipeline `image-text-to-text`, lo que implica que el modelo original procesa entradas de imagen y texto. El repositorio no documenta el número de expertos, la top-k de enrutamiento ni la dimensión de las capas; esos datos no están disponibles en la información proporcionada.

La intervención del autor es puramente de compresión: los expertos enrutados se cuantizan a una media de 2.02 bits (identificador interno r89), mientras que todos los demás pesos permanecen en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, por lo que la inferencia no requiere kernels de cuantización específicos y funciona con transformers estándar y vLLM. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO; tampoco se especifica el método exacto de cuantización (por ejemplo, cuantización post-entrenamiento con escalas por grupo) más allá de la media de bits indicada.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento multimodal image-text-to-text, heredado del modelo base.
- Razonamiento y generación de código: capacidades esperables del modelo base Qwen3.6, aunque no se documentan explícitamente en la model card.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas.
- Modo thinking u otras capacidades especiales: no documentado en la información disponible.

## Casos de uso

- Investigación en compresión de MoE: el checkpoint permite estudiar el impacto de cuantizar expertos enrutados a ~2 bits frente al modelo base en BF16, comparando perplejidad y calidad de generación con el mismo pipeline de evaluación.
- Despliegue de referencia con vLLM: al cargarse con vLLM sin kernels personalizados, sirve como banco de pruebas para medir throughput y latencia de un MoE de 35B parámetros con expertos comprimidos en hardware estándar.
- Evaluación de robustez de cuantizaciones extremas: útil para analizar degradación en tareas de razonamiento y generación de código cuando los expertos operan a 2.02 bits, comparando contra el modelo base.
- Prototipado de asistentes multimodales: la capacidad image-text-to-text heredada permite experimentar con descripción de imágenes y preguntas visuales en entornos de investigación, asumiendo la falta de garantías de calidad del checkpoint.
- Reproducibilidad de artefactos de investigación: el formato safetensors y la compatibilidad con transformers facilitan integrar el checkpoint en pipelines de evaluación existentes sin infraestructura adicional.
- Estudio de almacenamiento y distribución de modelos: con 70,2 GB de repositorio para 35,1B parámetros, es un caso práctico para analizar el coste de almacenar pesos dequantizados en BF16 frente a mantener la cuantización real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, la carga completa requiere del orden de 70 GB de memoria, coherente con los 70,2 GB del repositorio; no hay cifras oficiales del autor.
- GPU recomendadas: para carga completa en BF16, GPU de centro de datos con 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU; no confirmado por el autor.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090) en BF16 sin técnicas adicionales de offloading o cuantización en tiempo de carga, que no se documentan.
- Opciones de despliegue: transformers y vLLM, según indica explícitamente la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r89 | 35,1B totales (activos no disponibles) | no disponible | safetensors BF16 dequantizado | no disponible (sigue la del base) | Expertos enrutados a 2.02 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B | 35,1B totales (activos no disponibles) | no disponible | safetensors | no disponible en esta ficha | Modelo base en precisión original; referencia de calidad |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 35,1B totales | depende del base | GGUF, safetensors | según el base | No se han identificado alternativas concretas en la información disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el propio autor lo etiqueta como tal, sin garantías de calidad ni de estabilidad para producción.
- La cuantización a 2.02 bits de los expertos enrutados puede degradar la calidad de generación respecto al modelo base; no se publican métricas que lo cuantifiquen.
- Licencia no declarada en la ficha: aunque el autor remite a la licencia del modelo base, es necesario verificar los términos de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin evaluación propia.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint; se heredan los del modelo base, que tampoco se detallan aquí.
- Longitud de contexto y parámetros activos no disponibles, lo que impide planificar despliegues con requisitos de ventana larga.
- El repositorio ocupa 70,2 GB al almacenar los pesos dequantizados en BF16, lo que encarece el almacenamiento y la distribución frente a una cuantización real.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r89
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
