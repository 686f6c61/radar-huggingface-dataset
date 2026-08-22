# ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint

## Resumen

El modelo `ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint` es un ajuste fino supervisado (SFT) sobre el modelo base `ornith-ai/Ornith-1.5-9B`, desarrollado por ermiaazarkhalili. Pertenece a la familia Ornith-1.5, una serie de modelos lanzada por la organización ornith-ai (vinculada a DeepReinforce) que se caracteriza por implementar un marco de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, buscando mejorar de forma autónoma. Este fine-tune concreto, entrenado con la librería Unsloth y TRL de Hugging Face, está orientado a conversación y generación de texto, con una arquitectura etiquetada como `qwen3_5` y un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El modelo se distribuye bajo licencia Apache 2.0 y el pipeline declarado es `image-text-to-text`, aunque no se especifica en la ficha si el fine-tune conserva capacidades multimodales.

La relevancia de este modelo radica en que forma parte de una generación de modelos que buscan la auto-mejora continua, una línea de investigación emergente en IA. Al ser un fine-tune, puede ofrecer un comportamiento más afinado en tareas conversacionales o de generación de texto, aunque no se aportan datos concretos sobre el dataset de entrenamiento ni sobre el rendimiento específico. Para desarrolladores e investigadores que necesiten evaluar modelos de 9B con licencia permisiva, este puede ser un candidato, pero carece de información pública sobre benchmarks y contexto de ventana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5` en Hugging Face) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se especifica si es MoE; el modelo base de 9B probablemente sea denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-9B` pertenece a la familia Ornith-1.5, que según la web de ornith-ai implementa un marco de "self-scaffolding" y "self-improvement": el modelo propone nuevas tareas, genera scaffolds (estructuras de apoyo) específicos y produce rollouts de soluciones para entrenamiento por refuerzo. Este enfoque busca que el modelo mejore de forma continua sin intervención humana. Sin embargo, el presente modelo es un fine-tune supervisado (SFT) sobre ese base, entrenado con Unsloth y la librería TRL de Hugging Face. No se proporcionan detalles sobre el dataset de entrenamiento (el nombre "Fable5-Glint" sugiere un conjunto de datos propio, pero no se documenta) ni sobre el número de tokens o el proceso de entrenamiento.

La arquitectura base está etiquetada como `qwen3_5`, lo que sugiere una relación con la serie Qwen, pero no se dispone de especificaciones técnicas oficiales (número de capas, dimensión del modelo, etc.). El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base podría aceptar entradas multimodales, pero el fine-tune no aclara si conserva esa capacidad. No hay información sobre innovaciones técnicas específicas en este fine-tune.

## Capacidades

- Generación de texto y conversación: el modelo está orientado a tareas conversacionales (etiqueta `conversational`).
- Razonamiento y codificación: según la web de Ornith-1.5, la familia de modelos tiene buenos resultados en razonamiento, codificación y tareas agénticas, pero no hay datos específicos para este fine-tune.
- Soporte de tool calling: no especificado.
- Soporte de agentes y multi-step reasoning: no especificado.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales: el modelo base podría tener visión (por la etiqueta `image-text-to-text`), pero no está confirmado en el fine-tune. No se menciona modo de pensamiento ni audio.

## Casos de uso

- **Atención al cliente automatizada**: al ser un modelo conversacional de 9B, puede integrarse en chatbots de soporte para gestionar consultas de clientes en inglés, siempre que se le proporcione un contexto de ventana adecuado (desconocido). Requiere un sistema de gestión de contexto externo si la ventana es limitada.
- **Generación de código asistida**: si el modelo hereda las capacidades de codificación de Ornith-1.5, puede usarse en herramientas de autocompletado o generación de snippets en pipelines de desarrollo, aunque no se garantiza el soporte de tool calling.
- **Creación de contenido**: puede utilizarse para redactar textos, correos o documentación técnica en inglés, gracias a su entrenamiento conversacional.
- **Prototipado rápido de chatbots**: para desarrolladores que necesitan un modelo de tamaño medio con licencia Apache 2.0, este fine-tune puede ser un punto de partida para experimentar con arquitecturas de auto-mejora, aunque sin documentación adicional.
- **Investigación en auto-mejora**: al ser parte de la familia Ornith-1.5, sirve como objeto de estudio para el marco de self-improvement, aunque este fine-tune es solo un SFT y no incluye los componentes de RL.
- **Despliegue en entornos de bajos recursos**: con 9B parámetros, puede ejecutarse en GPUs de consumo (RTX 3090/4090) en cuantización de 4 bits, lo que lo hace adecuado para pruebas locales o inferencia en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Ornith-1.5-9B tiene resultados reportados por el equipo de ornith-ai, pero no se han proporcionado en la model card de este fine-tune ni en la búsqueda web. No se dispone de datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 18,8 GB (tamaño del repo en safetensors), por lo que requiere una GPU con al menos 20 GB de memoria para cargarlo sin cuantización. Con cuantización de 8 bits, la VRAM necesaria se reduce a ~9,4 GB; con 4 bits, a ~4,7 GB.
- GPU recomendadas: para FP16, una A100 (40 GB) o RTX 4090 (24 GB) es adecuada. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) puede ser suficiente.
- ¿Cabe en GPU de consumo? Sí, en cuantización 4-bit cabe en GPUs con 8 GB o más (por ejemplo, RTX 3070, RTX 4060).
- Opciones de despliegue: vLLM, llama.cpp (con cuantización GGUF), Ollama, TGI (Text Generation Inference), todos compatibles con modelos de la familia Qwen.
- Latencia y throughput: no se dispone de datos medidos. Dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. En la misma categoría de tamaño (~9B) se encuentran modelos como Llama-3.1-8B, Qwen2.5-7B o Mistral-7B, pero no hay información sobre cómo se compara este modelo con ellos en benchmarks. El modelo base Ornith-1.5-9B afirma un rendimiento similar a Claude Opus 4.8 en tareas de razonamiento, según la web de ornith-ai, pero no se verifica ni se proporcionan números. Por tanto, la comparativa queda pendiente de datos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han evaluado; como todo modelo de lenguaje, puede generar contenido falso o sesgado, especialmente en inglés.
- Limitaciones de contexto: no se conoce la longitud máxima de contexto, lo que limita su uso en tareas que requieran procesar documentos largos.
- Idioma: solo se declara soporte para inglés; no se garantiza buen rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no se documentan).
- El modelo es un fine-tune no oficial: el autor es un usuario de Hugging Face, no el equipo de ornith-ai, por lo que no hay garantía de calidad o mantenimiento.
- No se especifica si el modelo mantiene capacidades multimodales (aunque el pipeline indica `image-text-to-text`), por lo que no se debe asumir que puede procesar imágenes en el fine-tune.
- Al ser un SFT, puede no haber sido entrenado con técnicas de alineación (RLHF/DPO), lo que puede aumentar el riesgo de outputs inapropiados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Colección Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de Ornith-1.5 (artículo técnico): https://ornith.ai/ornith_1_5.html
- Web de ornith-ai: https://ornith.ai/
- Artículo de prensa sobre Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
