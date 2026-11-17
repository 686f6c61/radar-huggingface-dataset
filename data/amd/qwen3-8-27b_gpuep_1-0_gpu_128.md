# amd/Qwen3.8-27B_gpuep_1.0_gpu_128

## Resumen

Qwen3.8-27B_gpuep_1.0_gpu_128 es una compilación cuantizada del modelo multimodal Qwen/Qwen3.8-27B, publicada por AMD para su despliegue optimizado sobre hardware AMD Ryzen AI. No se trata de un modelo entrenado desde cero, sino de una conversión a formato ONNX realizada con la herramienta OGA Model Builder, en la que se aplica cuantización de pesos INT4 con grupo de 128 al tronco de texto mientras se preservan en FP16 las torres de visión y las capas de embeddings. El resultado es un artefacto de inferencia listo para ejecutarse en la GPU integrada de los procesadores Ryzen AI, con un tamaño de repositorio de 16,9 GB.

El modelo base, Qwen3.8-27B, es un transformer multimodal de 27 000 millones de parámetros orientado a tareas image-text-to-text y conversacionales, distribuido bajo licencia Apache 2.0. Esta variante de AMD hereda esas capacidades (comprensión de imagen, generación de texto, razonamiento y conversación multi-turno) y las empaqueta en un grafo ONNX con cuantización agresiva para reducir la huella de memoria y hacer viable la inferencia local en equipos de consumo con aceleración NPU/iGPU.

La relevancia de esta ficha radica en que documenta una ruta de despliegue concreta y poco habitual: modelos multimodales de gran tamaño ejecutados sobre silicio de AMD en lugar de GPUs discretas NVIDIA. Es un artefacto de interés para desarrolladores que trabajan en inferencia en el borde (edge), estaciones de trabajo con Ryzen AI y pipelines ONNX Runtime, más que para quienes buscan el checkpoint original en safetensors para fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B; grafo exportado a ONNX |
| Parámetros totales | 27 000 millones (según el nombre del modelo base; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Texto: K-quant, grupo 128, activaciones FP16, pesos INT4; visión: FP16; embeddings: FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); modificaciones AMD bajo MIT License |
| Formato de pesos | ONNX (compilado con OGA Model Builder para AMD Ryzen AI) |

## Arquitectura y entrenamiento

El checkpoint es una conversión, no un entrenamiento nuevo. La arquitectura subyacente corresponde a Qwen3.8-27B, un transformer multimodal con codificador de visión y tronco de lenguaje, del que esta versión conserva la topología pero no los pesos en precisión original. AMD ha aplicado una estrategia de cuantización selectiva: el tronco de texto se comprime a INT4 con cuantización por grupos de 128 elementos y activaciones en FP16, mientras que el codificador visual y las capas de embeddings permanecen en FP16 sin cuantizar. Esta decisión es coherente con la sensibilidad de las representaciones visuales a la pérdida de precisión y con el coste computacional comparativamente menor de esas torres.

La herramienta empleada es OGA Model Builder, el pipeline de AMD para generar artefactos ONNX Runtime GenAI destinados a Ryzen AI. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación; esos datos corresponden a la model card de Qwen/Qwen3.8-27B, que no se ha incluido en la información proporcionada. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) en esta variante.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y respuesta en lenguaje natural (pipeline image-text-to-text), con codificador visual en FP16.
- Razonamiento y respuesta a instrucciones propias de la familia Qwen3.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas del repo está vacío).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en estación de trabajo local: un desarrollador con un portátil o mini-PC Ryzen AI puede cargar el grafo ONNX y consultar capturas de pantalla, diagramas o fotografías sin enviar datos a la nube, aprovechando que visión y embeddings se mantienen en FP16 para preservar calidad.
- Procesamiento de documentos escaneados en el borde: digitalización y extracción de información de facturas, formularios o tickets en entornos con requisitos de soberanía del dato, donde el tamaño INT4 del tronco de texto permite mantener el modelo residente en memoria.
- Automatización de soporte técnico con capturas: el modelo puede recibir una imagen de error junto con texto de contexto y generar una explicación o pasos de resolución, integrándose en herramientas internas de helpdesk.
- Prototipado de aplicaciones multimodales sobre ONNX Runtime: al ser un artefacto ONNX, encaja en pipelines que ya usan ONNX Runtime GenAI, facilitando pruebas de concepto sin dependencia de CUDA.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad de INT4 grupo 128 frente al checkpoint original en tareas de descripción de imágenes y VQA.
- Despliegue en entornos con hardware AMD homogéneo: flotas de equipos Ryzen AI donde se quiere evitar GPUs discretas y mantener un único stack de inferencia.
- Investigación sobre eficiencia en el borde: útil para estudiar latencia y consumo de modelos de 27B cuantizados en iGPU/NPU, dado el tamaño contenido del repositorio (16,9 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 16,9 GB, lo que da una cota inferior del espacio necesario para los pesos; a ello hay que sumar el estado de activaciones FP16 y el contexto KV, por lo que se recomienda disponer de al menos 20-24 GB de memoria accesible entre iGPU y RAM del sistema.
- GPU recomendadas: hardware AMD Ryzen AI (APUs con NPU XDNA y GPU integrada Radeon), que es el destino explícito de esta compilación según la model card.
- Compatibilidad con GPU de consumo: no está pensada para GPUs discretas NVIDIA; al ser un grafo ONNX específico de Ryzen AI, su ejecución en otras plataformas no está garantizada ni documentada.
- Opciones de despliegue: ONNX Runtime GenAI (OGA), que es el runtime para el que se generó el artefacto. vLLM, llama.cpp, Ollama y TGI no se mencionan como soportados para este checkpoint.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Qwen3.8-27B_gpuep_1.0_gpu_128 | 27B (según nombre) | no disponible | ONNX (INT4 texto, FP16 visión) | Apache 2.0 + MIT (modificaciones AMD) | Optimizado para Ryzen AI; 16,9 GB |
| Qwen/Qwen3.8-27B | 27B (según nombre) | no disponible | safetensors (presumiblemente) | Apache 2.0 | Checkpoint original; permite fine-tuning y otros runtimes |
| Otras conversiones ONNX de la familia Qwen | no disponible | no disponible | ONNX | Apache 2.0 | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo entrenado: no debe esperarse paridad exacta con el checkpoint original, y la cuantización INT4 del tronco de texto puede degradar tareas sensibles a precisión (matemáticas, código largo, razonamiento encadenado).
- Especificidad de hardware: el grafo está generado para AMD Ryzen AI; su uso en otras plataformas no está documentado y puede fallar o rendir de forma subóptima.
- Idiomas no declarados: el campo de idiomas está vacío, por lo que no hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no especificada: no se puede planificar el dimensionamiento de KV cache sin consultar la model card del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; en tareas de imagen es especialmente relevante para descripciones detalladas y OCR.
- Sesgos: no documentados en esta model card; deben evaluarse en el modelo base.
- Licencias: conviven Apache 2.0 (modelo base) y MIT (modificaciones de AMD); para uso comercial conviene revisar ambas y los términos del modelo base Qwen.
- Sin métricas publicadas: no hay benchmarks ni datos de latencia, lo que impide estimar el rendimiento en producción sin medición propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-27B_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repositorios y demos adicionales: no disponible en la información proporcionada.
