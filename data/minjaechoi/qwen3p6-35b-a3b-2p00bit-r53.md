# minjaechoi/qwen3p6-35b-a3b-2p00bit-r53

## Resumen

Qwen3.6-35B-A3B (2.00-bit routed experts, r53) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Se trata de una versión cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados de la arquitectura Mixture of Experts (MoE) se han comprimido a una media de 2,00 bits, mientras que el resto de pesos permanece en BF16. El identificador interno del experimento es r53.

El modelo conserva la arquitectura original etiquetada como qwen3_5_moe, con 35.951.822.704 parámetros totales (~35,95 mil millones) según los tensores safetensors del repositorio. Su pipeline declarado es text-generation y la model card indica compatibilidad con transformers y vLLM estándar, ya que los pesos se almacenan desquantizados en tensores BF16 y se cargan con las herramientas habituales.

Es relevante para desarrolladores e investigadores interesados en técnicas de cuantización agresiva de capas MoE: demuestra un esquema mixto que comprime solo los expertos sin requerir kernels personalizados. El repositorio no registra descargas ni valoraciones en el momento de la consulta, y no incluye datos de benchmarks, idiomas ni licencia explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | ~3 mil millones según la nomenclatura A3B del modelo base; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,00 bits de media; resto de pesos en BF16. Pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 71,9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture of Experts (MoE), identificada por el tag `qwen3_5_moe`. La innovación de este checkpoint no es arquitectónica, sino de compresión: solo los expertos enrutados se cuantizan, alcanzando una media de 2,00 bits, mientras que el resto de los componentes mantiene precisión BF16. Los pesos finales se almacenan ya desquantizados en tensores BF16, de modo que el modelo se carga con `transformers` o vLLM estándar sin necesidad de kernels de cuantización específicos.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El tag `image-text-to-text` sugiere una posible capacidad de entrada multimodal (imagen y texto), pero la model card no lo confirma y el pipeline declarado es únicamente text-generation. Tampoco se detalla el procedimiento exacto de cuantización (algoritmo, granularidad por grupo, calibración) más allá del valor medio de 2,00 bits en los expertos enrutados.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline text-generation.
- Posible entrada multimodal (imagen-texto) por el tag `image-text-to-text`, no confirmada en la model card.
- Carga directa con `transformers` y vLLM estándar, sin kernels de cuantización personalizados.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su despliegue en plataformas de inferencia gestionada.
- Razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües y modos especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización de MoE: sirve como referencia para estudiar el impacto de comprimir solo los expertos enrutados a 2,00 bits frente a cuantizar el modelo completo, comparando calidad y consumo de memoria.
- Evaluación de degradación por precisión: permite medir cuánta capacidad se pierde al bajar los expertos a 2,00 bits manteniendo el resto en BF16, útil para decidir umbrales de compresión en producción.
- Despliegue en entornos con `transformers` o vLLM: al almacenarse los pesos desquantizados, se integra en pipelines existentes sin modificar el runtime de inferencia.
- Servicio conversacional autoalojado: adecuado para equipos que ya dispongan de infraestructura con 80 GB o más de VRAM y quieran servir un modelo de ~36B parámetros con licencia heredada del base.
- Experimentación con endpoints gestionados: la compatibilidad con endpoints permite probar el checkpoint en plataformas de inferencia sin montar hardware propio.
- Estudio de esquemas híbridos de precisión: caso de interés para quienes diseñan pipelines de cuantización mixta (expertos vs. capas densas) y quieren un ejemplo reproducible con `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco y en memoria: el repositorio ocupa 71,9 GB y los pesos se almacenan en BF16, por lo que se necesitan aproximadamente 72 GB solo para los pesos más el espacio de caché KV y activaciones.
- VRAM estimada para inferencia: del orden de 80 GB o más en BF16, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: H100 80 GB (ajustado para pesos), A100 80 GB, o configuraciones multi-GPU como 2× A100 40 GB o 2× RTX 6000 Ada para repartir los pesos.
- GPU de consumo: no cabe en una única GPU de consumo en BF16. El checkpoint ya está comprimido conceptualmente pero almacenado en BF16, por lo que no reduce el uso de memoria frente a un BF16 convencional.
- Opciones de despliegue: `transformers` y vLLM, según la model card. No se mencionan llama.cpp, Ollama, TGI ni formatos GGUF/AWQ/GPTQ.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (2.00-bit r53) | 35,95B | ~3B (por nomenclatura) | no disponible | no disponible | HuggingFace, safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-30B-A3B (referencia externa, no incluida en la informacion) | 30,5B | 3,3B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors, GGUF, AWQ |

Los datos de la fila de Qwen3-30B-A3B provienen de conocimiento general y no de la información proporcionada en esta ficha; se incluyen solo como orientación de categoría. No se dispone de datos comparativos de rendimiento entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación: la propia model card lo describe como "internal research checkpoint", no como una versión lista para producción.
- Licencia no especificada: la model card indica que sigue la licencia del modelo base, pero esta no se detalla en la información disponible; verificar antes de cualquier uso comercial.
- Sin datos de benchmarks: no hay evidencia publicada de la degradación de calidad introducida por la cuantización a 2,00 bits en los expertos.
- Sin información de idiomas: se desconoce la cobertura multilingüe.
- Sin información de contexto: no se conoce la longitud máxima soportada ni su comportamiento en contextos largos.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Posible multimodalidad no confirmada: el tag `image-text-to-text` no se corresponde con el pipeline declarado (text-generation); tratarlo con cautela.
- Sin descargas ni validación comunitaria: el repositorio no registra descargas ni valoraciones, por lo que no hay retroalimentación de terceros sobre su funcionamiento.
- Coste de hardware elevado: requiere ~72 GB de pesos en BF16, lo que excluye el despliegue en GPU de consumo individual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p00bit-r53
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
