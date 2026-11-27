# Andrew93110/decider-r2-w2t

## Resumen

Decider-r2-w2t es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario Andrew93110. Se trata de un merge (fusión de pesos) derivado del modelo base MachinePulseAI/karpo-decision-31B, orientado a tareas de decisión conversacional dentro del ecosistema Reax y la subred 92 de Bittensor (sn92). Con 31.273.088.876 parámetros totales, se posiciona en la franja de los modelos de aproximadamente 31B, un tamaño que permite un equilibrio entre capacidad de razonamiento y requisitos de despliegue.

El modelo está etiquetado con la arquitectura gemma4 y la librería transformers, con pesos en formato safetensors y un tamaño de repositorio de 62,6 GB, lo que es coherente con pesos en precisión bf16/fp16 para 31B de parámetros. Su propósito declarado como "decision-model" sugiere un uso orientado a la toma de decisiones asistida por IA, probablemente en contextos de agentes o validación de respuestas dentro de la red Bittensor.

Es relevante ahora porque combina tres tendencias actuales: modelos multimodales de tamaño medio-grande, despliegues descentralizados sobre Bittensor y flujos de trabajo de decisión/verificación (decision models) que se usan como componentes de sistemas multiagente. No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento publicados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (según tag de Hugging Face); transformer multimodal image-text-to-text |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura gemma4 y que es un merge del modelo MachinePulseAI/karpo-decision-31B. El pipeline declarado es image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje, aunque no se detallan ni el tipo de vision encoder ni la estrategia de proyección multimodal. Al tratarse de un merge de pesos, no hay evidencia de un entrenamiento desde cero ni de fases de RLHF/DPO documentadas en la información proporcionada.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de técnicas como decodificación especulativa o atención lineal, ni sobre procesos de alineación. Tampoco se especifica si el merge se realizó mediante técnicas tipo SLERP, TIES, DARE o model stock. Toda esta información debe considerarse no disponible y conviene consultar el repositorio del modelo base para obtener detalles sobre el entrenamiento original.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag "conversational".
- Procesamiento conjunto de imagen y texto (image-text-to-text), lo que permite responder preguntas sobre imágenes.
- Orientación a tareas de decisión ("decision-model"), presumiblemente para evaluar, clasificar o seleccionar respuestas dentro de flujos de agentes.
- Integración declarada con el ecosistema Reax y la subred 92 de Bittensor (sn92), lo que sugiere uso en validación o scoring dentro de esa red.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue como API.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Validación de respuestas en la subred 92 de Bittensor: el modelo puede actuar como decisor que evalúa la calidad de las respuestas generadas por otros nodos, aprovechando su naturaleza de "decision-model" y su integración declarada con sn92.
- Moderación multimodal de contenido: al aceptar entradas de imagen y texto, puede clasificar publicaciones o mensajes que combinan ambos formatos y emitir una decisión de aptitud.
- Asistente conversacional con soporte de imágenes: atención a usuarios que adjuntan capturas, diagramas o fotografías y necesitan una respuesta contextualizada en una conversación multi-turno.
- Enrutamiento de consultas en sistemas multiagente: el modelo puede decidir qué agente o herramienta debe atender una petición concreta a partir de la entrada del usuario, incluida información visual.
- Evaluación automática de pares (LLM-as-a-judge): uso como juez para comparar salidas de otros modelos en pipelines de evaluación, apoyándose en su orientación a la decisión.
- Prototipado de agentes autónomos en entornos de investigación: su licencia Apache 2.0 y su compatibilidad con transformers permiten integrarlo en experimentos académicos sin restricciones comerciales.
- Clasificación y triaje de tickets con adjuntos: en soporte técnico, el modelo puede analizar una captura de pantalla junto con la descripción del problema y decidir la categoría o el equipo responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-64 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: aproximadamente 18-22 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090, siempre que existan pesos cuantizados publicados (no confirmados).
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; A100 40 GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 con cuantización de 4 bits, aunque no hay pesos GGUF confirmados en el repositorio.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para servir en precisión completa; llama.cpp/Ollama solo si se generan pesos GGUF, lo cual no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andrew93110/decider-r2-w2t | 31,27B | no disponible | imagen-texto | apache-2.0 | gated en Hugging Face |
| MachinePulseAI/karpo-decision-31B (modelo base) | ~31B | no disponible | no disponible | no disponible | Hugging Face |
| Gemma 3 27B (referencia de la familia gemma) | 27B | 128K en la variante oficial | texto e imagen | Gemma license | Hugging Face |
| Qwen2.5-VL 32B (referencia multimodal de tamaño similar) | ~32B | 128K en la variante oficial | imagen-texto | Apache 2.0 | Hugging Face |

La comparación con Gemma 3 27B y Qwen2.5-VL 32B se ofrece solo como referencia de categoría; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede ralentizar la integración en pipelines automatizados.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a alternativas sin evaluación empírica propia.
- Información de entrenamiento no documentada: al ser un merge, se desconoce la composición del dataset y los posibles sesgos heredados del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; debe validarse en aplicaciones críticas.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés sin pruebas previas.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos.
- Cuantizaciones no confirmadas: la viabilidad en GPU de consumo depende de generar pesos GGUF/AWQ propios, con el coste y riesgo de degradación asociados.
- Popularidad nula (0 descargas, 0 likes en el momento de la consulta): no hay comunidad que haya validado el modelo, lo que incrementa el riesgo en producción.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base MachinePulseAI/karpo-decision-31B no imponga restricciones adicionales que pudieran propagarse al merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andrew93110/decider-r2-w2t
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (red descentralizada): https://bittensor.com
- Documentación de transformers: https://huggingface.co/docs/transformers
