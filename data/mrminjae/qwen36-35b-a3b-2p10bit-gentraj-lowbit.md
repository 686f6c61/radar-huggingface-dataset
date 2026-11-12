# mrminjae/qwen36-35b-a3b-2p10bit-gentraj-lowbit

## Resumen

Qwen3.6-35B-A3B-2.10bit-gentraj-lowbit es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) desarrollado por Alibaba Qwen. Lo publica el usuario mrminjae en Hugging Face y su rasgo definitorio es una cuantización agresiva y selectiva: únicamente los expertos enrutados (routed experts) se comprimen a una media de 2,10 bits por peso, mientras que el resto de los pesos del modelo permanece en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, de modo que el checkpoint carga con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización especiales.

El modelo base es un MoE de 35 000 millones de parámetros totales con aproximadamente 3000 millones de parámetros activos por token (de ahí el sufijo A3B), orientado a generación de texto, conversación y tareas multimodales de imagen-texto. La variante aquí descrita no introduce cambios de arquitectura ni fine-tuning sobre el comportamiento: es una recompresión de pesos que busca reducir el tamaño en disco y el ancho de banda de memoria a costa de la precisión de los expertos.

Es relevante ahora porque demuestra una técnica de compresión híbrida (bit-width muy bajo solo en las capas MoE, que concentran la mayor parte de los parámetros pero se activan de forma dispersa) que permite servir modelos MoE grandes en hardware más modesto. No obstante, se trata de un checkpoint de investigación interna, sin model card detallada, sin benchmarks publicados y sin licencia declarada explícitamente en el repositorio, lo que limita su uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse mixture-of-experts), familia Qwen3.5-MoE segun tags |
| Parametros totales | 35B (heredado del modelo base Qwen3.6-35B-A3B) |
| Parametros activos | ~3B (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (repo de 14,7 GB, cargable con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos dispersa, en el que cada token activa solo una fracción de los expertos (unos 3000 millones de parámetros activos sobre 35 000 millones totales). Los tags del repositorio lo clasifican como `qwen3_5_moe` e `image-text-to-text`, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada) además de generativo de texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base.

La innovación técnica de este checkpoint es la estrategia de compresión: solo los expertos enrutados, que constituyen la mayor parte del cómputo de parámetros pero se activan de forma dispersa, se cuantizan a una media de 2,10 bits. El resto de los componentes (atención, embeddings, capas densas, router) se conserva en BF16. Los pesos se guardan ya dequantizados, de forma que la inferencia no requiere kernels de cuantización de bajo nivel: se cargan como tensores BF16 convencionales. El identificador interno del checkpoint es `full_gentraj_lowbit`, lo que sugiere una trayectoria de entrenamiento o calibración ("gentraj") usada para derivar los parámetros de cuantización. No se detalla el algoritmo de cuantización empleado ni el proceso de calibración.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (`image-text-to-text`), según los tags del repositorio.
- Razonamiento y tareas de conocimiento general, sujeto a la degradación introducida por la cuantización de los expertos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Carga directa con `transformers` y vLLM sin kernels de cuantización personalizados, al estar los pesos en BF16.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada (no se documenta en la model card).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión de modelos MoE: el checkpoint sirve para estudiar el impacto de cuantizar únicamente los expertos enrutados a 2,10 bits frente al modelo base en BF16, midiendo la degradación en tareas de razonamiento y generación.
- Despliegue experimental en hardware limitado: al almacenarse en BF16 dequantizado pero con expertos de baja precisión, permite evaluar si un MoE de 35B puede servirse en GPUs con menos VRAM que el modelo original, siempre en entornos de prueba.
- Evaluación comparativa de pipelines de inferencia: útil para comparar latencia y throughput entre `transformers` y vLLM con el mismo checkpoint, dado que ambos lo cargan sin modificaciones.
- Prototipado de asistentes conversacionales multimodales: al heredar la capacidad imagen-texto del modelo base, permite construir demos de chat que aceptan imágenes, aceptando la pérdida de calidad por la cuantización.
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` facilita desplegarlo en servicios gestionados para validar flujos de producción antes de migrar al modelo base completo.
- Benchmarking de robustez ante cuantización extrema: útil como caso de estudio de hasta qué punto un MoE tolera 2,10 bits en sus expertos sin colapsar en tareas de código o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,7 GB, por lo que la carga en BF16 dequantizado requiere al menos ~15 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para despliegues ajustados; el modelo base completo en BF16 requeriría bastante más memoria.
- Cabe en GPU de consumo: sí, potencialmente en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; no se garantiza en GPUs de 16 GB.
- Opciones de despliegue: `transformers` (librería declarada) y vLLM, según indica la model card; no se mencionan llama.cpp, Ollama ni TGI, y al estar los pesos en BF16 no se benefician de kernels GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-gentraj-lowbit | 35B totales / ~3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | BF16 | no disponible en la información | Hugging Face (modelo oficial) |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo etiqueta explícitamente como "Internal research checkpoint", sin garantías de calidad ni soporte.
- Cuantización extrema de expertos a 2,10 bits de media: es previsible una degradación notable en precisión, razonamiento y generación de código frente al modelo base en BF16, aunque no se publican métricas que lo cuantifiquen.
- Licencia no declarada: la model card indica que sigue la licencia del modelo base pero no la especifica, por lo que el uso comercial queda en incertidumbre hasta verificar la licencia de Qwen/Qwen3.6-35B-A3B.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe correcto sin evaluación propia.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la pérdida de precisión en los expertos.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de su rendimiento frente al modelo original.
- Comunidad nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin consultar la documentación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-gentraj-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
