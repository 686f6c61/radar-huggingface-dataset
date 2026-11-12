# mrminjae/qwen3p6-35b-a3b-2p02bit-r92

## Resumen

Qwen3.6-35B-A3B (r92) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva de los expertos enrutados (routed experts) de una arquitectura Mixture-of-Experts (MoE) a una media de 2,02 bits, manteniendo el resto de pesos en BF16. El resultado se almacena descomprimido en tensores BF16, de modo que carga con transformers y vLLM estándar sin necesidad de kernels de cuantización específicos.

El modelo conserva los 35.107.181.936 parámetros totales del base y está orientado a generación de texto y a tareas imagen-texto (el tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo original). Su relevancia es doble: por un lado, explora los límites de la cuantización extrema en expertos enrutados de un MoE grande; por otro, lo hace sin romper la compatibilidad con el ecosistema estándar, algo poco habitual en cuantizaciones por debajo de 3 bits.

No obstante, se trata de un checkpoint interno de investigación, sin métricas publicadas, sin licencia declarada explícitamente más allá de la del modelo base y sin idiomas especificados. La información disponible es muy limitada y muchos parámetros técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen3_5_moe`; expertos enrutados cuantizados a 2,02 bits de media, resto en BF16 |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible (el modelo base es A3B, pero no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización selectiva de expertos enrutados a 2,02 bits de media; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (BF16 descomprimido); tamaño del repo 70,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture-of-Experts con 35.107.181.936 parámetros totales. La intervención de mrminjae consiste en cuantizar únicamente los expertos enrutados a una media de 2,02 bits, dejando el resto de pesos (atención, embeddings, capas densas, router, etc.) en BF16. Los pesos cuantizados se almacenan ya descomprimidos en tensores BF16, de forma que la inferencia no requiere kernels de cuantización especiales: el modelo carga con transformers y vLLM estándar.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo fases de RLHF o DPO; tampoco se documenta el método exacto de cuantización (por ejemplo, si se empleó GPTQ, AWQ, cuantización por bloques o una técnica propia). El identificador «r92» sugiere una iteración interna de investigación, y la model card lo describe explícitamente como «internal research checkpoint». No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento imagen-texto: el tag `image-text-to-text` indica capacidades multimodales de entrada de imagen y salida de texto, aunque no se detallan en la model card.
- Razonamiento y matemáticas: presumiblemente presentes en el modelo base, pero no documentados en este checkpoint.
- Generación de código: no documentada explícitamente en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Modo thinking u otras capacidades especiales: no documentadas.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite estudiar cómo afecta una media de 2,02 bits en los expertos enrutados a la calidad de generación, comparando contra el modelo base en BF16 con la misma infraestructura de transformers o vLLM.
- Despliegue en entornos con memoria limitada: al almacenarse en BF16 descomprimido y pesar 70,2 GB, puede cargarse con herramientas estándar sin kernels especiales, lo que simplifica la integración en pipelines existentes de investigación.
- Evaluación comparativa de robustez: útil para medir la degradación en tareas de razonamiento, matemáticas o generación libre frente al base, como paso previo a decidir si una cuantización de este nivel es aceptable en producción.
- Prototipado de asistentes conversacionales: el pipeline `text-generation` y el tag `conversational` permiten usarlo en prototipos de chat multi-turno, siempre que se validen previamente la calidad y los sesgos introducidos por la cuantización.
- Experimentos multimodales imagen-texto: el tag `image-text-to-text` habilita pruebas de descripción de imágenes o respuesta a preguntas visuales, aunque la model card no detalla el soporte real.
- Docencia y formación: sirve como ejemplo práctico de cuantización selectiva de expertos enrutados y de cómo se almacenan pesos descomprimidos para mantener compatibilidad con el ecosistema transformers.
- Base para futuras cuantizaciones: el checkpoint r92 puede servir como punto de partida para estudiar técnicas de recuperación de calidad (por ejemplo, ajuste fino ligero de los expertos) tras una cuantización agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 70,2 GB en safetensors BF16; se necesita al menos esa cantidad de memoria, más overhead de activaciones y caché KV. Con 35.107.181.936 parámetros totales, una carga completa en BF16 requiere del orden de 70 GB solo para pesos.
- GPU recomendadas: para carga completa en BF16, GPU de 80 GB como A100 80 GB o H100 80 GB; en configuraciones multi-GPU, 2× A100 40 GB o 2× RTX 4090 24 GB con paralelismo de tensor.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) ni en GPUs de 16 GB o menos sin técnicas de offloading o paralelismo multi-GPU.
- Opciones de despliegue: transformers (librería declarada) y vLLM, según indica la model card; llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r92 | 35.107.181.936 | no disponible | Expertos enrutados a 2,02 bits de media; resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | BF16 original | la del modelo base Qwen | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre otros modelos comparables de la misma categoría para establecer una comparativa de rendimiento con datos verificables.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo etiqueta explícitamente como «internal research checkpoint», sin garantías de calidad ni de estabilidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la cuantización a 2,02 bits en los expertos enrutados.
- Licencia no declarada: la model card remite a la licencia del modelo base, pero no se especifica en la información disponible; es imprescindible verificar la licencia de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Idiomas no especificados: se desconoce el soporte multilingüe real de este checkpoint.
- Riesgo de alucinación: no evaluado; la cuantización agresiva de expertos puede incrementar la pérdida de fidelidad en tareas de razonamiento y hechos.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se detallan aquí.
- Contexto: no disponible; no se puede confirmar la ventana máxima soportada.
- Tamaño en disco elevado: 70,2 GB en BF16 descomprimido, lo que limita su despliegue a infraestructura con suficiente memoria.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa y el soporte.
- Compatibilidad multimodal: el tag `image-text-to-text` no está respaldado por documentación detallada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r92
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
