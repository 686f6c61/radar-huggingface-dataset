# AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_2epochs

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de tipo decoder-only desarrollado por XHToken (serie Spark), publicado en Hugging Face bajo el identificador `XHToken/Spark-X2.6-1.7B-Base` y distribuido aquí por el usuario AlekseyCalvin como un fine-tuning orientado a Three.js (`AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_2epochs`). Se trata del segundo modelo de la familia Spark-X2.6, tras el Spark-X2.6-4B, y está pensado para despliegue en dispositivo (on-device), manteniendo exactamente la misma arquitectura que Spark-X2.5-1.7B pero mejorando sus capacidades mediante un post-entrenamiento más elaborado.

El modelo resuelve el problema de disponer de un LLM generalista de tamano reducido (1.707.657.216 parámetros reales según safetensors) que pueda ejecutarse en hardware local con latencia baja, manteniendo capacidades competitivas en código, uso de herramientas, contexto largo, multilingüismo y razonamiento. Su relevancia actual radica en la combinación de eficiencia de decodificación (líder entre modelos on-device de tamano comparable según el autor) con un presupuesto de razonamiento configurable en tres niveles (none, low, high).

La variante concreta de este repositorio es un fine-tuning con LoRA (r=128) durante 2 épocas sobre el modelo base, especializado en generación de código Three.js. El repositorio ocupa 3.4 GB y se distribuye en formato safetensors con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-1.7B) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072` |
| Tipos de cuantizacion | no disponible (el autor menciona implementación optimizada de llama.cpp, lo que implica soporte GGUF) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); compatible con llama.cpp y SGLang según la model card |
| Modelo base | XHToken/Spark-X2.6-1.7B-Base |
| Tipo de ajuste | LoRA r=128, 2 épocas, especializado en Three.js |
| Libreria | transformers (requiere `trust_remote_code=True`, transformers==4.57.1) |

## Arquitectura y entrenamiento

La información disponible indica que Spark-X2.6-1.7B conserva exactamente la misma arquitectura que Spark-X2.5-1.7B, y que las mejoras de capacidad provienen exclusivamente del post-entrenamiento, no de cambios estructurales. No se detalla en la model card el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO; el autor menciona "improved post-training" como origen de las ganancias en código, agentes, contexto largo, multilingüismo y razonamiento.

La innovación técnica destacable es el presupuesto de pensamiento configurable en tres niveles (none, low, high), que permite ajustar dinámicamente la calidad de razonamiento frente a la latencia y el coste de inferencia. Según los datos del autor, al pasar de high a low en Spark-X2.6-1.7B la puntuación media cae 4,0 puntos mientras que la longitud media de salida se reduce un 37,3%. El modelo incluye además una implementación optimizada de llama.cpp mantenida por XHToken, que según el autor amplía la ventaja de rendimiento en todos los contextos probados sobre una RTX 4090.

El fine-tuning concreto de este repositorio (ThreeJS v3, r=128, 2 épocas) no documenta en la información disponible el dataset empleado, el número de pasos ni los hiperparámetros completos más allá del rango y las épocas indicados en el nombre del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con presupuesto configurable: modos none, low y high.
- Generación de código, con especialización adicional en Three.js por el fine-tuning de este repositorio.
- Uso de herramientas (tool use) y planificación multi-paso, según las mejoras declaradas en agentic capabilities.
- Razonamiento sobre contextos largos (long-context reasoning).
- Capacidades matemáticas y de conocimiento general evaluadas en los benchmarks del autor.
- Multilingüismo limitado a inglés y chino según los metadatos del modelo.
- Inferencia eficiente en dispositivo, con throughput de decodificación líder entre modelos comparables según el autor.
- Compatibilidad con SGLang (GPU NVIDIA y NPU Ascend) y llama.cpp.

## Casos de uso

- Generación de escenas Three.js: el fine-tuning está entrenado específicamente para producir código de Three.js, por lo que resulta adecuado para generar escenas 3D, materiales, luces, animaciones y shaders a partir de descripciones en lenguaje natural, integrándose en editores o herramientas de prototipado web.
- Asistente de código en local para desarrollo frontend: con 1,7B parámetros y licencia Apache 2.0, puede desplegarse en el portátil del desarrollador mediante llama.cpp u Ollama para autocompletar y explicar código sin enviar datos a la nube.
- Atención al cliente en dispositivo: el modelo soporta conversaciones multi-turno en inglés y chino y puede ejecutarse en hardware local, lo que permite desplegar asistentes con baja latencia y sin coste por token en entornos con requisitos de privacidad.
- Agentes automatizados con tool calling: sus capacidades de planificación multi-paso y uso de herramientas permiten construir agentes que encadenen llamadas a APIs, aunque el tamano reducido limita la complejidad de las tareas frente a modelos mayores.
- Procesamiento de documentos largos: el razonamiento sobre contextos extendidos permite resumir, extraer información y responder preguntas sobre documentos extensos, ajustando el nivel de pensamiento para equilibrar calidad y coste.
- Prototipado rápido y experimentación académica: al ser un modelo pequeno con licencia permisiva y compatible con transformers, SGLang y llama.cpp, es adecuado para investigación sobre post-entrenamiento, LoRA y evaluación de razonamiento con presupuesto controlado.
- Generación de código en pipelines de CI/CD: puede integrarse como paso de revisión o generación de snippets en flujos automatizados, aunque requiere validación humana por el riesgo de alucinación en código.

## Benchmarks y rendimiento

La model card menciona que el modelo supera a modelos de tamano comparable en la mayoría de benchmarks (agent, code, math, general y knowledge) y presenta gráficas (`all_benchmark.svg`, `inference.svg`, `reasoning_effort.svg`), pero no se incluyen los valores numéricos en la información proporcionada. Los únicos datos cuantitativos disponibles son:

| Metrica | Valor |
|---|---|
| Caida media de puntuacion (high → low) | 4,0 puntos |
| Reduccion de longitud de salida (high → low) | 37,3% |
| Comparativa de eficiencia | lider en throughput de decodificación a contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B (según el autor) |

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1,7B parámetros, en fp16 requiere aproximadamente 3,4 GB solo para pesos; en cuantización de 8 bits alrededor de 1,7 GB y en 4 bits alrededor de 0,9 GB, más overhead de contexto.
- GPU recomendadas: el autor reporta pruebas en RTX 4090; la model card incluye soporte para SGLang en GPUs NVIDIA y NPUs Ascend (A2 y A3).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en cuantizaciones bajas, aunque el dato exacto no está confirmado en la información disponible.
- Opciones de despliegue: transformers (>=4.57.1, con `trust_remote_code=True`), SGLang (imagen nightly-dev-cu13), llama.cpp (implementación optimizada de XHToken) y, por extensión del ecosistema GGUF, herramientas compatibles.
- Latencia y throughput: el autor declara throughput de decodificación líder entre modelos on-device comparables a contextos cortos, con ventaja ampliada en todos los contextos probados sobre RTX 4090; no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B (este fine-tuning) | 1,7B | no disponible | Apache 2.0 | Especializado en Three.js; razonamiento configurable |
| Qwen3.5-2B | ~2B | no disponible | no disponible | Comparado por el autor en eficiencia de decodificación |
| MiniCPM-2B | ~2B | no disponible | no disponible | Comparado por el autor en eficiencia de decodificación |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | Comparado por el autor en eficiencia de decodificación |

Los datos de rendimiento comparativo no están disponibles numéricamente en la información proporcionada; la comparativa se limita a los modelos mencionados por el autor en la sección de edge inference.

## Limitaciones y advertencias

- El fine-tuning está especializado en Three.js, lo que puede degradar el rendimiento general respecto al modelo base en tareas ajenas a la generación de código 3D.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano.
- Riesgo de alucinación inherente a modelos de 1,7B parámetros, especialmente en código y matemáticas; se recomienda validación en producción.
- No se documentan sesgos conocidos en la información disponible.
- La longitud de contexto no está especificada de forma explícita; el ejemplo de generación usa 131072 tokens nuevos, pero no confirma la ventana de contexto real.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero el fine-tuning concreto no documenta el origen de sus datos de entrenamiento, lo que puede afectar a la trazabilidad legal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_2epochs
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Implementación optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack de la comunidad Spark: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
