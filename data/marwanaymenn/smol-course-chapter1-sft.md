# marwanaymenn/smol-course-chapter1-sft

## Resumen

`smol-course-chapter1-sft` es un ajuste fino supervisado (SFT) del modelo `HuggingFaceTB/SmolLM2-360M-Instruct`, publicado por el usuario `marwanaymenn` en HuggingFace. Se trata de un modelo derivado de un transformer decoder-only de 360 millones de parámetros desarrollado originalmente por HuggingFaceTB, entrenado mediante la librería TRL con la técnica de fine-tuning supervisado. El modelo hereda la arquitectura y el tokenizador del modelo base, por lo que sus capacidades lingüísticas y de generación son las del SmolLM2-360M-Instruct, potencialmente ajustadas al dataset de entrenamiento empleado.

La relevancia de este modelo es principalmente didáctica: su nombre (`smol-course-chapter1-sft`) sugiere que forma parte de un curso práctico sobre modelos pequeños (smol) y que corresponde al capítulo 1 de un itinerario formativo centrado en SFT. No obstante, la model card es extremadamente escasa: no se especifica el dataset de entrenamiento, el número de pasos, la licencia efectiva, los idiomas soportados ni resultados de evaluación. El repositorio tiene 0 GB declarados, 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de experimentación personal y no un modelo destinado a producción.

Dado que el modelo base SmolLM2-360M-Instruct es un modelo pequeño orientado a dispositivos con recursos limitados, este fine-tune comparte esas características: bajo coste de inferencia, posibilidad de ejecución en CPU y en GPUs de consumo, y una ventana de contexto moderada. Sin embargo, cualquier afirmación sobre mejoras concretas respecto al modelo base carece de respaldo documental en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parámetros totales | 360 M (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base SmolLM2-360M-Instruct declara 8.192 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantización | no disponible (los pesos safetensors permiten cuantización posterior a GGUF/INT8/INT4 mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. La arquitectura concreta (número de capas, dimensiones ocultas, mecanismo de atención) no se detalla en la información proporcionada, aunque corresponde a la del modelo base publicado por HuggingFaceTB. El entrenamiento se realizó con TRL 1.17.1 sobre Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3, empleando la técnica de Supervised Fine-Tuning (SFT).

No se especifica el dataset de entrenamiento, el número de tokens, la composición de los datos, la existencia de RLHF/DPO posterior ni hiperparámetros como learning rate, batch size o número de épocas. La model card no incluye curvas de pérdida ni métricas de evaluación. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de las que ya incorpora el modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, ya que hereda la plantilla de instrucciones del SmolLM2-360M-Instruct.
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño del modelo (360 M de parámetros).
- Generación de código a pequeña escala, con calidad limitada por la capacidad del modelo base.
- Matemáticas elementales, sin garantías de precisión en problemas multi-paso.
- Soporte de conversaciones multi-turno mediante el formato de roles (`user`, `assistant`) que emplea el pipeline de ejemplo.
- Capacidades multilingües: no documentadas para este fine-tune; las del modelo base no se confirman en la información disponible.
- Tool calling / function calling: no documentado para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado educativo de pipelines SFT: el modelo sirve como ejemplo reproducible de cómo aplicar TRL para ajustar un modelo pequeño, útil en cursos y talleres sobre fine-tuning.
- Experimentación con modelos pequeños en entornos con recursos limitados: al derivar de un modelo de 360 M, puede ejecutarse en CPU o en GPUs de consumo para pruebas rápidas de generación de texto.
- Generación de texto conversacional de baja latencia en demos: adecuado para maquetas de asistentes donde la calidad no es crítica y prima la velocidad de iteración.
- Evaluación comparativa de técnicas de SFT: permite contrastar el efecto del fine-tuning frente al modelo base en tareas controladas, siempre que se documente el dataset (no disponible aquí).
- Base para posteriores etapas de alineamiento (DPO/RLHF) en un itinerario formativo: el checkpoint SFT puede servir como punto de partida para etapas posteriores del curso.
- Pruebas de integración con la librería `transformers` y el pipeline de text-generation: útil para validar flujos de carga de modelos y plantillas de chat en entornos de desarrollo.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño, el coste de reajuste es bajo, lo que facilita experimentos iterativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7-0,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización INT8: en torno a 0,4 GB para pesos; en INT4, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. También es viable en GPUs de datacenter (A100, H100) aunque sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPUs con suficiente memoria compartida.
- Ejecución en CPU: viable para demos y pruebas, con latencia mayor.
- Opciones de despliegue: `transformers` (pipeline de text-generation), llama.cpp/Ollama tras conversión a GGUF, vLLM y TGI (previa verificación de compatibilidad con la arquitectura del modelo base).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera baja latencia en GPU y throughput alto en batch, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `marwanaymenn/smol-course-chapter1-sft` | 360 M | no disponible | no disponible | HuggingFace (0 descargas) | Fine-tune SFT de SmolLM2-360M-Instruct sin documentación de datos ni evaluación |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | 360 M | 8.192 tokens (según model card del base) | Apache-2.0 (según model card del base) | HuggingFace, ampliamente utilizado | Modelo base oficial, con documentación y evaluación publicadas |
| `HuggingFaceTB/SmolLM2-135M-Instruct` | 135 M | 8.192 tokens (según model card del base) | Apache-2.0 (según model card del base) | HuggingFace | Alternativa aún más pequeña para entornos muy restringidos |
| `Qwen2.5-0.5B-Instruct` | 500 M | 32.768 tokens (según model card oficial) | Apache-2.0 (según model card oficial) | HuggingFace | Alternativa de tamaño similar con contexto mayor y mejor documentación |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no es posible evaluar sesgos introducidos por el fine-tuning ni la calidad de las respuestas en dominios concretos.
- Riesgo elevado de alucinación inherente a los modelos de 360 M de parámetros, agravado por la falta de evaluación publicada.
- Licencia no especificada de forma clara (`licence: license`): no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor o asumir los términos del modelo base (Apache-2.0) con cautela.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no confirmada para este fine-tune; aunque el modelo base declara 8.192 tokens, el ajuste podría no haber preservado ese comportamiento.
- Modelo sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de su calidad ni de su estabilidad.
- Repositorio con tamaño declarado de 0 GB: posible inconsistencia en los metadatos; conviene verificar la integridad de los pesos antes de usarlo.
- No apto para producción sin una evaluación previa exhaustiva: la falta de benchmarks y de model card detallada lo desaconseja para casos de uso críticos.
- Capacidades de tool calling, agentes y multi-step reasoning no documentadas: no deben asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marwanaymenn/smol-course-chapter1-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFT Trainer): no disponible en la información proporcionada
- Paper o blog del modelo base SmolLM2: no disponible en la información proporcionada
