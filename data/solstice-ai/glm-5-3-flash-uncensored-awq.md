# Solstice-AI/GLM-5.3-Flash-UNCENSORED-AWQ

## Resumen

GLM-5.3-Flash-UNCENSORED-AWQ es una cuantización W4A16 AWQ del modelo multimodal GLM-5.3-Flash-UNCENSORED, publicada por Solstice-AI sobre los pesos originales de Zhipu AI / ZAI y el fine-tune sin censura de dealignai. Se trata de un modelo de arquitectura mixta de expertos (MoE) con atención híbrida (sparse y lineal), diseñado para reducir costes de inferencia en contextos largos. Según la model card, el modelo declara 320B parámetros totales con ~18B activos por token, aunque el inventario de safetensors muestra 51.190.913.886; esta discrepancia se documenta en la tabla de especificaciones.

El modelo soporta entrada de imagen, texto y vídeo, y ha sido sometido a un proceso de "abliteración" para eliminar rechazos de seguridad, lo que resulta en un comportamiento sin restricciones ("uncensored"). La cuantización AWQ en INT4 con activaciones de 16 bits permite reducir los requisitos de memoria manteniendo la mayor parte del rendimiento. La ventana de contexto es de 131.072 tokens, según el comando de ejemplo para vLLM.

La relevancia actual radica en que ofrece capacidades de razonamiento, generación de código, matemáticas y comprensión multimodal en un formato cuantizado apto para despliegues con múltiples GPUs, con licencia MIT y soporte para decodificación especulativa mediante el drafter DFlash2 incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención sparse y lineal (según zai-org/GLM-5.3-Flash) |
| Parametros totales | 320B (según model card); el inventario de safetensors muestra 51.190.913.886 |
| Parametros activos | ~18B activos por token (según model card) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | AWQ W4A16 (INT4, group_size=128, simétrico); GGUF para el drafter especulativo |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (AWQ), GGUF (drafter) |

## Arquitectura y entrenamiento

El modelo se basa en GLM-5.3-Flash de Zhipu AI, que introduce por primera vez en la serie GLM una arquitectura híbrida que combina atención sparse y lineal. Esta combinación está pensada para reducir drásticamente los costes de servicio en contextos largos, manteniendo la precisión en tareas que requieren atender a mucha información. Los pesos originales han sido ajustados por dealignai mediante un proceso de "abliteración" para eliminar los rechazos de seguridad, y posteriormente cuantizados por Solstice-AI a formato AWQ W4A16.

La cuantización preserva en BF16 puro todos los tensores visuales (347 tensores), los routers y proyecciones de gate del MoE, los mecanismos de atención, las embeddings y la cabeza de lenguaje. No se dispone de datos sobre la composición del dataset de entrenamiento ni sobre procesos RLHF/DPO en la información proporcionada. El modelo incluye un drafter DFlash2 en formato GGUF para decodificación especulativa, que puede usarse con vLLM para reducir la latencia.

## Capacidades

- Generación de texto y razonamiento general.
- Programación algorítmica competitiva y resolución de problemas matemáticos de nivel escolar y olimpiada.
- Comprensión multimodal de imágenes y vídeo, incluyendo razonamiento temporal entre fotogramas.
- Soporte de tool calling y uso de herramientas externas, según la descripción del modelo en NanoGPT.
- Trabajo con contexto largo de 131.072 tokens y tareas de agente multi-paso.
- Comportamiento sin restricciones: 0% de rechazos en HarmBench-320.
- Capacidades multilingües en inglés y chino.

## Casos de uso

- Asistente de atención al cliente bilingüe: el modelo puede gestionar conversaciones en inglés y chino con contexto largo de 131K tokens, integrando imágenes de productos o capturas de pantalla en el flujo de soporte.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar pull requests o generar tests, usando el drafter DFlash2 para reducir la latencia.
- Análisis de vídeo y monitorización: la capacidad de VideoQA permite analizar secuencias de vídeo y responder preguntas sobre eventos temporales, útil en vigilancia o revisión de contenido.
- Agentes autónomos de investigación: el modelo puede ejecutar razonamiento multi-paso y usar herramientas externas para buscar información, resumir documentos y elaborar informes.
- Generación de contenido creativo sin filtros: para prototipado de ficción, guiones o textos con temáticas que otros modelos rechazan, gracias a su naturaleza uncensored.
- Despliegue de bajo coste en multi-GPU: la cuantización AWQ permite servir el modelo en 4 GPUs H100/A100 con vLLM o SGLang, aprovechando la decodificación especulativa.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo en la model card. No han sido verificados de forma independiente.

| Benchmark | Disciplina | GLM-5.3-Flash Uncensored AWQ | Base GLM-5.3 | Claude 3.5 Sonnet | GPT-4o |
|---|---|---|---|---|---|
| MMLU | Conocimiento general y razonamiento | 85.12% | 86.15% | 88.7% | 87.2% |
| HarmBench-320 | Supresión de rechazos de seguridad | 0% rechazos | 94.2% rechazos | 92.5% | 91.0% |
| SWE-bench Pro | Ingeniería de software real | 63.1% | 64.1% | 61.2% | 48.9% |
| LiveCodeBench v6 | Programación algorítmica competitiva | 85.8% | 87.0% | 78.4% | 72.8% |
| MATH-500 | Matemáticas escolares / olimpiadas | 92.5% | 93.4% | 89.2% | 91.4% |
| MMMU | Comprensión visual multidisciplinar | 70.6% | 71.2% | 70.4% | 69.1% |
| VideoQA / Temporal | Razonamiento de vídeo a través del tiempo | 78.2% | 79.1% | 77.2% | 75.6% |

Nota: en HarmBench-320, un porcentaje más bajo de rechazos indica un modelo menos restrictivo. El 0% es el objetivo del fine-tune uncensored.

## Requisitos de hardware

- VRAM estimada: según el tamaño declarado de 320B, los pesos en AWQ INT4 ocupan aproximadamente 160 GB, más activaciones y KV cache.
- GPU recomendadas: 4x H100 o 4x A100 de 80 GB, según el comando de ejemplo de vLLM con `--tensor-parallel-size 4`.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) en su totalidad; se necesitaría particionado o cuantización más agresiva.
- Opciones de despliegue: vLLM, SGLang (según tags del repositorio), llama.cpp para el drafter GGUF, y posiblemente TGI.
- Latencia y throughput: no disponible en la información proporcionada. La decodificación especulativa con DFlash2 y 5 tokens especulativos está pensada para reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

La comparativa se basa en la tabla de benchmarks de la model card. La versión AWQ es ligeramente inferior a la base GLM-5.3 sin cuantizar en la mayoría de métricas, pero mantiene el 0% de rechazos en HarmBench-320. Frente a Claude 3.5 Sonnet y GPT-4o, el modelo presenta ventajas en tareas de código, matemáticas y vídeo, aunque queda por detrás en MMLU. La licencia MIT es más permisiva que las licencias comerciales de Claude y GPT, y el formato AWQ permite un despliegue eficiente en multi-GPU. No se dispone de otros modelos MoE de 320B equivalentes en la información proporcionada para una comparación directa.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune uncensored, el modelo puede generar contenido dañino, ilegal o no deseado. No se han documentado sesgos específicos.
- Riesgo de alucinación: presente en todos los modelos de lenguaje; no se dispone de evaluaciones específicas.
- Limitaciones de idioma: solo inglés y chino; no hay soporte nativo para otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el usuario debe responsabilizarse del contenido generado.
- Caveat de producción: la cuantización AWQ puede degradar ligeramente la precisión en comparación con FP8. Además, el número de parámetros real es confuso (51.190.913.886 en safetensors frente a 320B declarados), lo que puede indicar que el modelo no es exactamente lo que dice la model card.
- El modelo es una versión "uncensored" que elimina los rechazos de seguridad; esto puede ser un riesgo en entornos donde se requiera moderación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/GLM-5.3-Flash-UNCENSORED-AWQ
- Modelo base FP8: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo original de Zhipu AI: https://huggingface.co/zai-org/GLM-5.3-Flash
- Descripción en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
