# AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_1epoch

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de tipo decoder-only desarrollado por XHToken (equipo SparkLLM), concebido para inferencia en dispositivo (on-device) y entornos de borde. Es el segundo miembro de la familia Spark-X2.6, tras el Spark-X2.6-4B, y se construye sobre Spark-X2.5-1.7B manteniendo exactamente la misma arquitectura: las mejoras provienen exclusivamente de un post-entrenamiento más refinado, no de cambios estructurales. Cuenta con 1.707.657.216 parámetros y está publicado en formato Transformers con pesos safetensors.

La variante concreta de este repositorio, `AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_1epoch`, es un fine-tune del modelo base `XHToken/Spark-X2.6-1.7B-Base` orientado aparentemente a la generación de código Three.js (por el sufijo del nombre), con rango LoRA 128 y una época de entrenamiento. No obstante, la model card no documenta el proceso de fine-tuning ni el dataset empleado, por lo que los detalles de esa adaptación no están disponibles.

El modelo resulta relevante porque ofrece un equilibrio poco habitual en su rango: capacidades reforzadas de código, uso de herramientas, planificación multi-paso y contexto largo, junto con un modo de razonamiento configurable en tres niveles (ninguno, bajo, alto) que permite ajustar latencia y calidad. Su licencia Apache 2.0 y su eficiencia de decodificación lo hacen apto para despliegues locales y comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072`, lo que sugiere soporte de contextos muy largos |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el autor menciona una implementación optimizada de llama.cpp, lo que implica soporte GGUF en ese ecosistema) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), con soporte para SGLang y llama.cpp optimizado |

## Arquitectura y entrenamiento

La información disponible confirma que Spark-X2.6-1.7B conserva exactamente la arquitectura de Spark-X2.5-1.7B. No se detalla en la model card si se trata de un transformer denso convencional con atención estándar o si incorpora variantes como atención lineal o mecanismos híbridos; ese dato no está disponible. Lo que sí se especifica es que las ganancias de capacidad respecto a la versión anterior provienen íntegramente del post-entrenamiento, sin modificaciones estructurales.

El post-entrenamiento se orientó a mejorar codificación, comportamiento agéntico, contexto largo, multilingüismo y razonamiento. La model card no indica el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta una innovación destacable: un presupuesto de razonamiento controlable con tres niveles (ninguno, bajo, alto). Según las mediciones del autor, al pasar de razonamiento alto a bajo en el modelo de 1.7B la puntuación media cae 4,0 puntos mientras la longitud media de salida se reduce un 37,3 %, lo que permite ajustar el coste de inferencia por tarea. El fine-tune de este repositorio (r128, 1 época) no está documentado en la model card.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento configurable (ninguno, bajo, alto), ajustable por llamada mediante `enable_thinking`.
- Codificación y ingeniería de software: el autor declara mejoras sustanciales en tareas de código y en razonamiento sobre contextos extensos.
- Uso de herramientas (tool calling) y comportamiento agéntico: se destacan mejoras en uso complejo de herramientas y planificación multi-paso.
- Razonamiento matemático y tareas de conocimiento general.
- Capacidades de contexto largo, con ejemplos de generación que emplean hasta 131.072 tokens nuevos.
- Multilingüismo limitado a inglés y chino según los metadatos del modelo.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Generación de escenas Three.js: dado el nombre del fine-tune, el modelo puede emplearse para producir código JavaScript de Three.js a partir de descripciones en lenguaje natural, integrándose en editores o herramientas de prototipado 3D.
- Asistente de código en local: con 1.7B de parámetros y licencia Apache 2.0, puede desplegarse en portátiles o estaciones de trabajo para autocompletado y explicación de código sin enviar datos a la nube.
- Agentes de automatización con tool calling: su soporte de uso de herramientas y planificación multi-paso permite construir agentes que consulten APIs, ejecuten comandos y encadenen acciones, controlando el nivel de razonamiento para limitar latencia.
- Atención al cliente en inglés y chino: conversaciones multi-turno con contexto largo, útil para soporte técnico donde el historial de la sesión es extenso.
- Procesamiento de documentos largos: resumen y extracción de información sobre textos que superan la ventana típica de modelos pequeños, gracias al soporte de contextos extendidos.
- Inferencia en dispositivo de borde: aplicaciones móviles o embebidas que requieren respuestas rápidas sin conexión, aprovechando la eficiencia de decodificación declarada por el autor.
- Generación de código en pipelines de CI/CD: revisión automática de parches, generación de tests o documentación técnica en entornos con restricciones de privacidad.

## Benchmarks y rendimiento

La model card incluye gráficas de benchmarks (agent, code, math, general y knowledge) y afirma que el modelo supera a modelos de tamaño comparable en la mayoría de las pruebas, pero no proporciona los valores numéricos en texto. Los únicos datos cuantitativos publicados son los de la comparación de esfuerzo de razonamiento (caída de 4,0 puntos y reducción del 37,3 % en longitud al pasar de alto a bajo). No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 5-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1,7-2 GB de pesos; en 4 bits: en torno a 1 GB, aunque los formatos concretos no están documentados.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 y superiores; el autor cita pruebas en RTX 4090. Para despliegue en servidor, A100 o H100 con SGLang.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en FP16; en cuantización, en GPUs de 4-6 GB.
- Opciones de despliegue: Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`), SGLang (imágenes oficiales para NVIDIA y Ascend NPU), y una implementación optimizada de llama.cpp mantenida por XHToken.
- Latencia y throughput: el autor declara el mejor throughput de decodificación entre modelos on-device comparables (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B) en contextos cortos, con ventaja ampliada en RTX 4090 mediante su fork de llama.cpp. No se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B (este fine-tune) | 1,7B | no disponible (uso de hasta 131k tokens nuevos en ejemplo) | Apache 2.0 | Modo de razonamiento configurable; autor declara mejor throughput on-device |
| Qwen3.5-2B | ~2B | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| MiniCPM-2B | ~2B | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |

Los datos de contexto y licencia de los modelos comparables no se detallan en la información proporcionada; solo se confirma que el autor los emplea como base de comparación en sus evaluaciones de inferencia.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos de 1,7B, especialmente en tareas de conocimiento factual y matemáticas complejas.
- El fine-tune concreto de este repositorio no documenta dataset, hiperparámetros ni evaluación; su calidad específica para Three.js no está verificada más allá del nombre.
- La model card no especifica la longitud máxima de contexto oficial, solo el ejemplo de generación; conviene validar el comportamiento real en contextos largos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el fine-tune deben verificarse por separado en cuanto a atribuciones.
- Sin métricas de sesgo publicadas; no se han documentado evaluaciones de seguridad o alineación.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/Spark-X2.6_ThreeJS_v3_1.7B_r128_1epoch
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Implementación optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack del proyecto: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
