# psardin/Qwen3.8-27B-opencode-merged-FP8

## Resumen

Qwen3.8-27B-opencode-merged-FP8 es un checkpoint publicado en Hugging Face por el usuario psardin bajo el identificador `psardin/Qwen3.8-27B-opencode-merged-FP8`. Por el nombre y las etiquetas del repositorio (entre ellas `qwen3_5`, `image-text-to-text` y `compressed-tensors`), se trata de una fusión (merge) de pesos derivada de la familia Qwen, cuantizada en FP8 mediante la librería compressed-tensors, y orientada a tareas multimodales de imagen a texto. El repositorio contiene 27.356.728.560 parámetros reales según los safetensors y ocupa 30,4 GB.

El modelo se distribuye en formato safetensors para la librería transformers y declara compatibilidad con endpoints. La model card es la plantilla autogenerada por Hugging Face y no aporta información sustantiva: no documenta el proceso de fusión, los datos de entrenamiento, los idiomas ni la licencia. Cualquier dato sobre arquitectura interna, contexto o rendimiento debe considerarse no disponible a partir de la información publicada.

Su relevancia es limitada y de nicho: al tratarse de un merge experimental con cero descargas y cero interacciones en el momento de la consulta, no debe tomarse como una referencia estable para producción. Resulta útil únicamente como artefacto de exploración para quienes quieran evaluar el resultado de la fusión y la cuantización FP8 sobre una base Qwen multimodal de aproximadamente 27 000 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de librería `qwen3_5`; se infiere transformer multimodal, sin confirmación del autor) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 30,4 GB) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de las etiquetas del repositorio. La etiqueta `qwen3_5` apunta a la familia Qwen 3.5 y la etiqueta `image-text-to-text` indica que el pipeline es multimodal de entrada imagen y texto con salida de texto. El sufijo "merged" del identificador sugiere una fusión de pesos (posiblemente de un modelo base con un ajuste fino orientado a generación de código, dado el término "opencode"), pero el autor no documenta la receta de merge, los coeficientes ni los checkpoints de origen.

El checkpoint está cuantizado en FP8 con compressed-tensors, una técnica de compresión que reduce el peso en memoria aproximadamente a la mitad respecto a BF16 y permite inferencia de mayor throughput en GPUs con soporte nativo de FP8 (Hopper y posteriores). No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que se espera capacidad de describir y razonar sobre imágenes, aunque no hay evaluación publicada.
- Generación de texto conversacional: la etiqueta `conversational` indica uso previsto en diálogo multi-turno.
- Generación de código: el nombre incluye "opencode", lo que sugiere un ajuste orientado a tareas de programación, sin confirmación documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación experimental de merges: usar el checkpoint como referencia para comparar el efecto de la fusión y la cuantización FP8 frente al modelo base Qwen correspondiente, midiendo degradación en tareas concretas antes de adoptar la receta en un pipeline propio.
- Prototipado de asistentes sobre documentos con imágenes: al declarar pipeline imagen-texto, permite experimentar con preguntas y respuestas sobre capturas, diagramas o documentos escaneados, siempre con validación manual dada la ausencia de benchmarks.
- Exploración de generación de código asistida: el sufijo "opencode" sugiere un uso potencial en autocompletado y explicación de fragmentos de código dentro de un IDE, como prueba de concepto y no como componente de producción.
- Despliegue en infraestructura con FP8: sirve para validar el rendimiento de compressed-tensors en GPUs Hopper, midiendo throughput y calidad frente a una versión BF16 del mismo modelo.
- Investigación sobre cuantización: útil como caso de estudio de cómo afecta FP8 a un modelo de 27 000 millones de parámetros en tareas multimodales, comparando salidas con el original.
- Base para ajuste fino interno: al ser un checkpoint de transformers en safetensors, puede servir como punto de partida para un fine-tuning con LoRA en un dominio concreto, asumiendo que el equipo valide previamente la calidad del merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, los pesos ocupan aproximadamente 27,4 GB, por lo que se necesitan al menos 32 GB de VRAM solo para el modelo, más margen para caché KV y activaciones (estimación orientativa de 40-48 GB para contexto moderado).
- GPU recomendadas: H100, H200 o L40S con soporte nativo de FP8; A100 puede ejecutar FP8 vía emulación con menor rendimiento; GPUs Blackwell también son compatibles.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offloading a CPU o cuantización adicional a 4 bits, que no se distribuye en este repositorio.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para FP8 con compressed-tensors; llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| psardin/Qwen3.8-27B-opencode-merged-FP8 | 27,36 mil millones | no disponible | no disponible | safetensors FP8 | Merge experimental, 0 descargas, sin benchmarks |
| Qwen2.5-VL-32B-Instruct (referencia de familia) | 32 mil millones | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo oficial de la familia Qwen con documentación completa |
| Qwen2.5-32B-Instruct | 32 mil millones | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Alternativa text-only de tamaño comparable |

La comparación se limita a la familia de origen porque no hay datos públicos de rendimiento del checkpoint evaluado; cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada: no hay información sobre sesgos, datos de entrenamiento ni evaluación de riesgos.
- Riesgo elevado de alucinación no cuantificado: sin benchmarks ni evaluación humana publicada, la fiabilidad en tareas críticas es desconocida.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen antes de cualquier despliegue.
- Idiomas soportados sin documentar: no se puede garantizar calidad en castellano ni en otros idiomas.
- Contexto máximo desconocido: planificar pipelines con ventanas conservadoras y validar empíricamente el límite real.
- Merge no reproducible: al no documentarse los checkpoints de origen ni los coeficientes, no es posible auditar la receta ni reproducir el resultado.
- Cuantización FP8 sin evaluación de degradación: no se ha publicado la pérdida de calidad respecto al modelo en BF16.
- Cero tracción en la comunidad (0 descargas, 0 likes): sin señales de validación externa, conviene tratarlo como artefacto experimental.
- Fecha de creación futura (2026-11-24) en los metadatos: revisar la coherencia de los datos del repositorio antes de confiar en ellos.

## Enlaces

- Hugging Face: https://huggingface.co/psardin/Qwen3.8-27B-opencode-merged-FP8
- Referencia citada en la model card (Machine Learning Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
