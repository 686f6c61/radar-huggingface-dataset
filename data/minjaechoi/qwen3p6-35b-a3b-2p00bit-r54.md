# minjaechoi/qwen3p6-35b-a3b-2p00bit-r54

## Resumen

Qwen3.6-35B-A3B 2.00-bit routed experts (r54) es un checkpoint de investigación publicado por el usuario minjaechoi sobre el modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una variante experimental en la que exclusivamente los expertos enrutados (routed experts) de la arquitectura MoE han sido cuantizados a una media de 2,00 bits, mientras que el resto de pesos permanece en BF16. No es un modelo nuevo entrenado desde cero, sino una modificación de los pesos del modelo base.

El modelo conserva la arquitectura Mixture-of-Experts del base, con 35.951.822.704 parámetros totales según los tensores de safetensors (~35,95 mil millones) y un tamaño de repositorio de 71,9 GB. La etiqueta image-text-to-text sugiere capacidades multimodales heredadas del base. Su relevancia es limitada y de carácter interno: es un experimento de cuantización extrema de expertos, no un modelo orientado a producción.

Un detalle crítico es que, pese a la nomenclatura de 2,00 bits, los pesos se almacenan ya desquantizados en tensores BF16, de modo que el checkpoint no ofrece ahorro de memoria en tiempo de inferencia. Se carga con `transformers` estándar y con vLLM, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (etiqueta `qwen3_5_moe`); sparse MoE |
| Parámetros totales | 35.951.822.704 (~35,95 mil millones) |
| Parámetros activos | ~3 mil millones (inferido de la nomenclatura A3B del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,00 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts (MoE) de tipo sparse. La modificación introducida por este checkpoint consiste en cuantizar únicamente las matrices de los expertos enrutados a una media de 2,00 bits, manteniendo el resto de la red en BF16. Se trata de una intervención de post-entrenamiento sobre los pesos, no de un reentrenamiento: no hay datos disponibles sobre tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO en la información proporcionada.

La innovación técnica declarada es la cuantización agresiva de los expertos enrutados con el identificador interno r54, dentro de lo que parece una línea de investigación sobre límites de compresión de MoE. Es relevante señalar que, aunque se reporta una media de 2,00 bits para los expertos, los pesos se almacenan desquantizados en BF16, por lo que el checkpoint no explota el ahorro de memoria que cabría esperar de una cuantización real. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (image-text-to-text), según las etiquetas del repositorio.
- Arquitectura MoE con enrutamiento de expertos, lo que en el base se asocia a razonamiento, código y matemáticas.
- Compatibilidad con endpoints (`endpoints_compatible`) y con la librería `transformers`.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado específicamente para este checkpoint en la información disponible (probable herencia del base, sin verificar).
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking mode) u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre cuantización de MoE: análisis de cómo afecta una compresión de expertos a 2,00 bits a la calidad de salida, comparando contra el modelo base sin cuantizar.
- Reproducción de experimentos de compresión: el checkpoint sirve como referencia para estudiar límites de cuantización en arquitecturas sparse con enrutamiento.
- Evaluación comparativa de checkpoints experimentales: medir degradación frente a Qwen3.6-35B-A3B en tareas de generación de texto.
- Estudio de la relación entre bits de expertos y memoria real: dado que los pesos se almacenan en BF16, es útil para demostrar que la cuantización declarada no se traduce en ahorro de VRAM.
- Fine-tuning posterior sobre expertos de baja precisión: explorar si ajustar los expertos cuantizados recupera calidad.
- Docencia y divulgación: ejemplo práctico de qué es la cuantización de expertos enrutados en un MoE y de sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones cuantitativas con el modelo base. Los resultados de la búsqueda web no contienen información relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~72 GB solo para los pesos en BF16 (tamaño del repositorio 71,9 GB), más el espacio para la caché KV y activaciones. En la práctica, se requieren alrededor de 80-100 GB o más.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB en paralelo de tensor; 1x H200 141 GB podría albergar los pesos si la caché KV y el contexto lo permiten.
- No cabe en GPU de consumo. Incluso 4x RTX 4090 (96 GB agregados) resultarían poco prácticas por la ausencia de NVLink y la sobrecarga de paralelismo.
- Opciones de despliegue: `transformers` estándar y vLLM, tal como indica la model card. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al almacenarse los pesos en BF16 y no explotar la cuantización declarada, no se esperan ganancias de velocidad respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B 2.00-bit r54 (este) | 35,95 B | ~3 B (inferido) | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-30B-A3B (familia Qwen MoE) | 30 B | ~3 B | no disponible | no disponible (Apache 2.0 en versiones previas, sin confirmar) | HuggingFace |

No se dispone de datos verificados de rendimiento ni de contexto para ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a datos de arquitectura y disponibilidad. Cualquier cifra de benchmarks entre estos modelos sería especulativa.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la propia model card lo describe como "internal research checkpoint", no como un modelo listo para producción.
- La cuantización a 2,00 bits de los expertos puede degradar la calidad de forma notable respecto al modelo base; no se documenta el impacto real.
- No hay ahorro de memoria: los pesos se almacenan desquantizados en BF16, por lo que el checkpoint ocupa lo mismo que un modelo BF16 de 35,95 B de parámetros.
- Sesgos conocidos: no disponibles, aunque probablemente hereda los del modelo base, sin verificar.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia: la model card indica que sigue la del modelo base, pero la licencia de este no se especifica; la ficha de HuggingFace la marca como "no disponible". No debe asumirse uso comercial libre sin verificar la licencia de Qwen/Qwen3.6-35B-A3B.
- Idiomas y contexto: no documentados, lo que impide planificar despliegues multilingües o de contexto largo.
- Cero descargas y cero likes en el momento de la consulta, lo que reduce su validación por la comunidad.
- Al ser un post-procesado de pesos y no un entrenamiento, no se garantiza estabilidad numérica en todos los backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p00bit-r54
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada (los resultados de la búsqueda web no contienen enlaces relevantes a este modelo).
