# mrminjae/qwen3p6-35b-a3b-2p10bit-r130

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-2p10bit-r130` es un checkpoint de investigación publicado en Hugging Face por el usuario mrminjae, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva a 2,10 bits aplicada exclusivamente a los expertos enrutados de su arquitectura Mixture-of-Experts (MoE). El resto de los pesos permanece en BF16, y los pesos se almacenan ya desquantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El resultado es un modelo con 67.319.436.656 parámetros totales almacenados (el doble de los 35B nominales, porque los expertos se guardan en BF16 desquantizado) que ocupa 134,7 GB en el repositorio. La propuesta técnica del autor es reducir el coste de almacenamiento y de ancho de banda de memoria de los expertos sin renunciar a la compatibilidad con el stack estándar de inferencia, manteniendo el resto de la red en precisión completa.

Es relevante ahora porque explora una vía intermedia entre la cuantización agresiva global (que degrada calidad de forma uniforme) y los formatos de cuantización especializados (que requieren toolchains específicos). No obstante, se trata de un checkpoint interno de investigación, sin model card detallada, sin licencia declarada explícitamente y sin métricas de calidad publicadas, por lo que su evaluación debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe), multimodal image-text-to-text |
| Parametros totales | 67.319.436.656 (pesos almacenados en BF16 tras desquantizar) |
| Parametros activos | no disponible (modelo base nominal de 35B con 3B activos, segun nomenclatura A3B; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits promedio; resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, no especificada) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B emplea una arquitectura Mixture-of-Experts con atención estándar y capas de expertos enrutados; el tag `qwen3_5_moe` y el pipeline `image-text-to-text` indican además capacidades multimodales de entrada imagen-texto. El checkpoint r130 no reentrena el modelo: aplica una cuantización post-entrenamiento selectiva que fija los expertos enrutados a una media de 2,10 bits, mientras que atención, embeddings, capas densas y router permanecen en BF16. Los pesos resultantes se desquantizan y se serializan como tensores BF16, de ahí que el recuento de parámetros del safetensors (67,3B) duplique aproximadamente el tamaño nominal del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. Tampoco se documenta la innovación técnica del proceso de cuantización (algoritmo, calibración, granularidad por grupo o por canal) más allá de la cifra media de 2,10 bits y del identificador interno r130. La decisión de almacenar en BF16 desquantizado es deliberada: garantiza compatibilidad con `transformers` y vLLM sin kernels personalizados, a costa de perder el ahorro de memoria en disco y en VRAM que cabría esperar de una cuantización a 2 bits.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), heredado del modelo base multimodal.
- Razonamiento y matemáticas: capacidades esperables del modelo base Qwen3.6, no verificadas en este checkpoint.
- Generación de código: no confirmada explícitamente en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara lista de idiomas.
- Modo thinking explícito, visión o audio: solo la entrada imagen-texto está confirmada por los tags; el resto no disponible.

## Casos de uso

- Investigación sobre cuantización selectiva en MoE: el checkpoint sirve para medir la degradación de calidad al comprimir solo los expertos enrutados a 2,10 bits frente al modelo base en BF16, manteniendo el resto de la red intacta.
- Despliegue con vLLM en entornos de laboratorio: al cargarse con vLLM estándar sin kernels especiales, permite comparar throughput y latencia frente al base sin cambiar el stack de inferencia.
- Experimentos de ajuste fino sobre expertos comprimidos: útil para estudiar si el fine-tuning recupera la pérdida de calidad introducida por la cuantización de los expertos.
- Evaluación de modelos multimodales imagen-texto en pipelines de research: el tag `image-text-to-text` habilita pruebas de descripción de imágenes y diálogo sobre imagen, siempre con validación previa de calidad.
- Reproducibilidad de checkpoints internos: sirve como referencia r130 dentro de una serie de experimentos de cuantización del mismo autor.
- Pruebas de compatibilidad de toolchains: verificar que los pesos desquantizados en BF16 se cargan correctamente en `transformers` y en servidores compatibles con la API de endpoints (`endpoints_compatible`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, el modelo completo requiere aproximadamente 134,7 GB solo para pesos, más KV cache y activaciones; no cabe en ninguna GPU consumer individual.
- GPU recomendadas: configuraciones multi-GPU de clase数据中心 (A100 80 GB, H100 80 GB) en número suficiente para superar los 134,7 GB de pesos; no disponible el número exacto mínimo.
- GPU consumer: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` y vLLM según la model card; llama.cpp y Ollama no están confirmados y, dado el formato BF16 desquantizado, no se benefician del ahorro de una cuantización GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r130 | 67,3B almacenados (base 35B-A3B) | no disponible | no disponible | safetensors BF16 desquantizado | Expertos a 2,10 bits, resto BF16 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales, 3B activos (segun nomenclatura) | no disponible | no disponible | safetensors | Referencia de calidad sin cuantizar |
| Cuantizaciones GGUF del mismo base | variable | no disponible | no disponible | GGUF | Requieren llama.cpp; no disponibles en la información |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta explícitamente como "internal research checkpoint", sin garantías de calidad ni de estabilidad.
- Sin benchmarks publicados: no hay evidencia de la degradación real introducida por la cuantización a 2,10 bits de los expertos.
- Licencia no declarada: la model card remite a la licencia del modelo base sin especificarla; no se puede confirmar el uso comercial.
- Idiomas no declarados: no hay lista de idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Contexto no documentado: se desconoce la longitud de ventana efectiva.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente agravado por la compresión de los expertos, sin datos que lo cuantifiquen.
- Sesgos: no documentados por el autor; se heredan los del modelo base, no evaluados aquí.
- Requisito de hardware elevado: 134,7 GB de pesos en BF16 impiden cualquier despliegue en GPU consumer y encarecen la inferencia frente a una cuantización real a 2 bits.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Fecha de creación futura respecto a la información de referencia: verificar la vigencia del checkpoint antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r130
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
