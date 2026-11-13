# mrminjae/qwen3p6-35b-a3b-2p25bit-r111

## Resumen

Qwen3.6-35B-A3B (2.25-bit, r111) es un checkpoint de investigación derivado del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva de los expertos enrutados del modelo base: los pesos de dichos expertos se almacenan a una media de 2,25 bits, mientras que el resto de los pesos (atención, embeddings, router, capas densas) permanecen en BF16. El resultado es un repositorio de 70,2 GB con 35.107.181.936 parámetros totales, etiquetado como `qwen3_5_moe` e `image-text-to-text`, lo que indica que el modelo base es un transformer de mezcla de expertos con capacidad multimodal.

La relevancia de este checkpoint es práctica: reduce el coste de almacenamiento y de ancho de banda de memoria de los expertos sin exigir kernels de cuantización personalizados, ya que los pesos se guardan dequantizados en tensores BF16 y se cargan con `transformers` estándar o vLLM. Es, por tanto, un artefacto pensado para experimentación interna más que para producción, y así lo declara el propio autor en la model card.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada. Todos los datos técnicos que siguen provienen de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), etiqueta `qwen3_5_moe`; multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion selectiva: expertos enrutados a 2,25 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales y capacidad de entrada image-text-to-text, según las etiquetas de Hugging Face. La intervención de mrminjae no reentrena el modelo: aplica una cuantización post-entrenamiento sobre los expertos enrutados, que quedan a 2,25 bits de media, y deja el resto de los pesos en BF16. Los pesos se almacenan dequantizados en tensores BF16, de modo que la carga se realiza con `transformers` o vLLM sin modificaciones en el runtime.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo base en la información proporcionada. La model card únicamente identifica el checkpoint como «internal research checkpoint» con ID interno r111.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y la etiqueta `conversational`.
- Procesamiento multimodal image-text-to-text, heredado del modelo base según las etiquetas de Hugging Face.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con cuantización extrema de MoE: el checkpoint permite estudiar el impacto de comprimir los expertos enrutados a 2,25 bits manteniendo el resto en BF16, comparando la calidad resultante contra el modelo base en tareas de generación de texto.
- Evaluación de degradación por capas: al conservar atención y router en BF16, se puede aislar la pérdida de calidad atribuible exclusivamente a los expertos, útil en líneas de investigación sobre compresión de modelos.
- Despliegue en entornos con memoria limitada: el repositorio de 70,2 GB y la carga con `transformers` estándar permiten servir el modelo en infraestructura donde el checkpoint BF16 completo del base no cabría, siempre que se acepte el riesgo de ser un checkpoint de investigación.
- Pruebas de integración con vLLM: el autor declara compatibilidad de carga con vLLM, lo que permite validar pipelines de inferencia de alto rendimiento sobre un MoE cuantizado sin kernels personalizados.
- Prototipado de aplicaciones image-text-to-text: la etiqueta multimodal del modelo base sugiere uso en tareas de descripción de imágenes o respuesta a preguntas visuales, aunque no hay datos publicados que confirmen el rendimiento tras la cuantización.
- Referencia para pipelines de cuantización: sirve como caso de estudio reproducible (ID r111) para equipos que diseñen sus propias recetas de cuantización selectiva sobre modelos Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 70,2 GB en safetensors BF16, por lo que la carga completa requiere al menos esa cantidad de memoria, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. Por tamaño del checkpoint, un despliegue completo exige GPUs de clase A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del repositorio (70,2 GB) supera la VRAM de las RTX 4090 (24 GB) y RTX 3090 (24 GB) en una sola unidad.
- Opciones de despliegue: `transformers` estándar y vLLM, según declara el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p25bit-r111 | 35.107.181.936 | no disponible | Expertos a 2,25 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 (hereda) | no disponible | BF16 original | no disponible | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el propio autor lo etiqueta como «internal research checkpoint», sin garantías de estabilidad ni de calidad tras la cuantización.
- Sin benchmarks publicados: no hay evidencia documentada de la degradación de calidad provocada por comprimir los expertos a 2,25 bits.
- Licencia no disponible: aunque el autor indica que sigue la licencia del modelo base, esta no se especifica en la información proporcionada, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no declarados: no se puede verificar el soporte multilingüe ni el comportamiento en castellano.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización agresiva de expertos puede incrementarlo.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras la conversión.
- Metadatos incompletos: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Sin información sobre sesgos: no hay evaluación de sesgos publicada para este checkpoint ni para su base en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p25bit-r111
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
