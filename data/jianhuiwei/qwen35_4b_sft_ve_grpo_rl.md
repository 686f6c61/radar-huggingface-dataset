# JianhuiWei/qwen35_4b_sft_VE_GRPO_RL

## Resumen

El modelo `JianhuiWei/qwen35_4b_sft_VE_GRPO_RL` es un checkpoint de refuerzo (reinforcement learning) derivado del modelo `JianhuiWei/qwen35_4b_sft_VE`, que a su vez parte de la familia Qwen3.5 de Alibaba. Ha sido desarrollado por JianhuiWei y está orientado a tareas de evaluación de vídeo (video-evaluation) con soporte para uso de herramientas (tool-use) y razonamiento conversacional. El entrenamiento se realizó con el algoritmo GRPO (Group Relative Policy Optimization) sobre un harness de agentes llamado OpenCode, partiendo del modelo SFT previo.

Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones), el modelo se presenta en formato safetensors y se carga mediante la clase `Qwen3_5ForConditionalGeneration` de Transformers. Su pipeline es `image-text-to-text`, lo que indica que puede procesar tanto imágenes como texto. La licencia y los idiomas soportados no están declarados en la información disponible.

La relevancia de este modelo radica en que es un ejemplo de aplicación de RL para mejorar la capacidad de un modelo multimodal de evaluar vídeo, integrando razonamiento interno (bloques `thinking`) y llamadas a herramientas en formato XML. Es útil para desarrolladores que quieran experimentar con modelos Qwen3.5 adaptados mediante GRPO en tareas de análisis de vídeo o agentes multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, basado en Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 segun README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (sharded) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, una familia de modelos multimodales de Alibaba que combina un codificador visual con un decodificador de lenguaje. En este checkpoint, el codificador visual se mantiene congelado, mientras que los pesos del lenguaje provienen del paso 294 del entrenamiento con GRPO. El entrenamiento de refuerzo se realizó sobre el modelo SFT `JianhuiWei/qwen35_4b_sft_VE`, utilizando el algoritmo GRPO con 16 muestras por prompt, una tasa de aprendizaje de `1e-6` con schedule constante, regularización KL de baja varianza con coeficiente `0.001` y normalización de ventaja activada. La máscara de error en las llamadas a herramientas del modelo SFT inicial estaba deshabilitada.

El harness de agentes usado fue OpenCode, lo que sugiere que el entrenamiento se centró en tareas de agente que requieren razonamiento y uso de herramientas. El modelo incluye un chat template personalizado (`chat_template.jinja`) que preserva el contenido de razonamiento del asistente en bloques `thinking` y renderiza las llamadas a herramientas en el formato XML de Qwen. No se proporcionan detalles sobre el corpus de entrenamiento ni el número de tokens utilizado.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de bloques de pensamiento (`thinking`) visibles en la salida.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), aunque no se especifican detalles sobre el manejo de vídeo.
- Soporte de tool calling en formato XML de Qwen (parser `qwen3_coder`), lo que permite integrar funciones externas.
- Capacidad de evaluación de vídeo (video-evaluation) según el nombre y los tags, aunque no se documentan los detalles técnicos.
- Compatible con el ecosistema Transformers y SGLang, con instrucciones específicas para servir con SGLang usando el chat template y los parsers de razonamiento y herramientas.
- Entrenado con RL, lo que puede mejorar la adherencia a instrucciones y la calidad de las respuestas en tareas de agente.

## Casos de uso

- Evaluación automatizada de vídeo: el modelo puede analizar contenido de vídeo (frames extraídos como imágenes) y generar evaluaciones o descripciones, gracias a su pipeline multimodal y su entrenamiento específico en esta tarea.
- Agentes conversacionales con uso de herramientas: al soportar tool calling y razonamiento, puede integrarse en sistemas que necesiten consultar APIs o bases de datos durante una conversación.
- Asistentes de análisis de contenido audiovisual: para resumir, clasificar o extraer información de vídeos en entornos de producción multimedia.
- Prototipos de investigación en RL multimodal: sirve como referencia para estudiar el efecto de GRPO sobre un modelo Qwen3.5 en tareas de evaluación de vídeo.
- Integración en pipelines de inferencia con SGLang o Transformers: puede desplegarse como endpoint para tareas de visión-lenguaje con generación de razonamiento.
- Experimentación con decodificación guiada por razonamiento: el formato `thinking` permite inspeccionar el proceso de razonamiento interno del modelo, útil para depuración y análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona un snapshot de evaluación en el paso 294, pero no se incluyen métricas concretas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4,54 B parámetros en bfloat16, el peso ocupa aproximadamente 9,1 GB (tamaño del repo). Para inferencia, se recomienda al menos 12 GB de VRAM para caber en una GPU consumer (por ejemplo, RTX 3080/3090, RTX 4070/4080/4090). Con cuantización a 8 bits o 4 bits podría reducirse a unos 5-7 GB, pero no se proporcionan archivos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 12 GB o más de VRAM, como RTX 3090, RTX 4090, A10, A100, H100. Para despliegue en producción, se recomiendan GPUs de datacenter (A100, H100) para mayor throughput.
- Opciones de despliegue: Transformers (carga directa con `device_map="auto"`), SGLang (con instrucciones específicas en el README). También podría usarse vLLM si se adapta el chat template, aunque no se menciona explícitamente.
- Latencia y throughput: no disponibles. Dependerá de la GPU y del batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pipeline | Licencia | Notas |
|---|---|---|---|---|---|
| JianhuiWei/qwen35_4b_sft_VE_GRPO_RL | 4,54 B | no disponible | image-text-to-text | no disponible | Checkpoint RL sobre Qwen3.5-4B |
| JianhuiWei/qwen35_4b_sft_VE | 4,54 B (presumible) | no disponible | image-text-to-text | no disponible | Modelo base SFT, sin RL |
| Qwen/Qwen3.5-4B (oficial) | 4 B (aprox.) | no disponible | text (probablemente) | Apache 2.0 (habitual en Qwen) | Modelo base de la familia Qwen3.5 |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- No se ha declarado licencia, por lo que el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre idiomas soportados; probablemente herede las capacidades multilingües de Qwen3.5, pero no se garantiza.
- El modelo está entrenado específicamente para evaluación de vídeo; su rendimiento en otras tareas puede ser inferior al de un modelo generalista.
- No se han publicado benchmarks, por lo que no se puede evaluar su calidad objetiva frente a alternativas.
- El entrenamiento con RL puede introducir sesgos o comportamientos no deseados, especialmente si el dataset de recompensa no fue diverso.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de vídeo, puede inventar detalles no presentes en las imágenes.
- La longitud de contexto no está documentada; se desconoce si soporta ventanas largas de vídeo o solo frames individuales.
- El checkpoint excluye estados de optimizador y entrenador, por lo que no es adecuado para continuar el entrenamiento sin reconfiguración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JianhuiWei/qwen35_4b_sft_VE_GRPO_RL
- Modelo base SFT: https://huggingface.co/JianhuiWei/qwen35_4b_sft_VE
- Colección Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Repositorio de Qwen3 (familia base): https://github.com/QwenLM/Qwen3
- Página del modelo base en free2aitools (metadatos): https://free2aitools.com/model/jianhuiwei/qwen35_4b_sft_ve
- Página de despliegue en FriendliAI: https://friendli.ai/models/JianhuiWei/qwen35_4b_sft_VE
