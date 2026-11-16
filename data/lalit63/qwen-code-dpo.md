# lalit63/qwen-code-dpo

## Resumen

`lalit63/qwen-code-dpo` es un ajuste fino del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario de Hugging Face lalit63. Se trata de un modelo de generación de texto especializado en código, obtenido aplicando Optimización Directa de Preferencias (DPO) sobre el checkpoint instructivo de Qwen, con el objetivo de alinear las respuestas del modelo hacia preferencias humanas en tareas de programación y conversación técnica.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para despliegue eficiente. El entrenamiento se realizó con la librería TRL (versión 1.18.0) y el framework Transformers 5.23.0, empleando el algoritmo DPO descrito en el paper de Rafailov et al. (2023).

Su relevancia radica en que ofrece una alternativa ligera y afinada por preferencias para tareas de asistencia en código, ejecutable en hardware de consumo. No obstante, la información pública es muy limitada: no se especifican los datos de entrenamiento, la licencia ni los idiomas soportados, lo que condiciona su evaluación rigurosa y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, especializado en código. Sobre ese checkpoint se aplicó un ajuste fino con DPO (Direct Preference Optimization), técnica que optimiza directamente el modelo de política frente a pares de respuestas preferidas y rechazadas, sin necesidad de entrenar un modelo de recompensa separado. El entrenamiento se llevó a cabo con TRL 1.18.0, Transformers 5.23.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

No se dispone de información sobre el volumen de datos de preferencias utilizado, la composición del dataset, la duración del entrenamiento ni los hiperparámetros empleados. Tampoco se documentan innovaciones técnicas adicionales más allá del propio procedimiento DPO. La model card se limita a indicar el marco de entrenamiento y las versiones de las librerías, sin detallar el corpus ni el proceso de curación de datos.

## Capacidades

- Generación de texto conversacional en formato chat (roles `user`/`assistant`), tal como muestra el ejemplo de uso con `pipeline`.
- Asistencia en programación y generación de código, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento técnico y respuesta a preguntas de índole general o de desarrollo, según el ejemplo de la model card (pregunta hipotética sobre una máquina del tiempo).
- Alineación por preferencias: el ajuste DPO busca favorecer respuestas más útiles y mejor valoradas frente a alternativas rechazadas.
- Soporte de tool calling / function calling: no confirmado en la información disponible (el modelo base lo soporta, pero no se verifica en este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de programación en local: el modelo puede desplegarse en una estación de trabajo con GPU de consumo para autocompletar y explicar fragmentos de código, gracias a su tamaño de 1,5 mil millones de parámetros.
- Generación de código en pipelines de CI/CD: integrable mediante la API de Transformers o Text Generation Inference para tareas de generación de tests, documentación o parches sugeridos, siempre con revisión humana.
- Chatbot técnico de soporte interno: puede gestionar conversaciones de asistencia a desarrolladores sobre APIs y errores comunes, aunque la ventana de contexto no está documentada y debe validarse empíricamente.
- Prototipado rápido de aplicaciones conversacionales: su reducido tamaño permite iterar con poca inversión en infraestructura y comparar el efecto del ajuste DPO frente al modelo base.
- Educación y formación en programación: puede emplearse como tutor que explica conceptos y propone ejercicios, con supervisión para mitigar alucinaciones.
- Evaluación de técnicas de alineación: útil como caso de estudio para investigadores que quieran reproducir o comparar ajustes DPO sobre modelos pequeños de código.
- Generación de documentación técnica: redacción de comentarios, docstrings y guías a partir de fragmentos de código, aprovechando su especialización en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 4-6 GB en total).
- VRAM estimada en cuantización de 8 bits: en torno a 1,6 GB para pesos; en 4 bits, alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en RTX 3060/4060/4090 y en GPUs integradas de gama alta con cuantización.
- Opciones de despliegue: Transformers (pipeline), Text Generation Inference (el tag `text-generation-inference` está presente), vLLM, llama.cpp u Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lalit63/qwen-code-dpo | 1,54 B | No disponible | No disponible | Hugging Face (74 descargas) |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de ~1,5 B para código | No disponible | No disponible | No disponible | No disponible |

La comparación con otras alternativas de la misma categoría no puede completarse con datos verificados en la información proporcionada; se recomienda contrastar directamente con el checkpoint base y con otros modelos pequeños de código publicados en Hugging Face.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor o consultarse el repositorio antes de un despliegue productivo.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Datos de entrenamiento DPO no publicados: no es posible evaluar sesgos introducidos por el corpus de preferencias.
- Riesgo de alucinación inherente a modelos de 1,5 B: puede generar código incorrecto o APIs inexistentes; requiere validación y tests automatizados.
- Longitud de contexto no confirmada: no se garantiza el comportamiento en conversaciones largas ni en repositorios extensos.
- Modelo de nicho con muy poca tracción (74 descargas, 0 likes): ausencia de validación comunitaria y de reportes independientes de calidad.
- El ajuste DPO puede degradar capacidades del modelo base si el dataset de preferencias es reducido o poco diverso; conviene comparar contra Qwen2.5-Coder-1.5B-Instruct antes de adoptarlo.
- Repositorio de 15 GB para 1,5 B de parámetros: sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento, lo que conviene revisar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lalit63/qwen-code-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
