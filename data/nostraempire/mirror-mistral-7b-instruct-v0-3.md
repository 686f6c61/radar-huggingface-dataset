# NostraEmpire/mirror-mistral-7b-instruct-v0.3

## Resumen

El modelo `NostraEmpire/mirror-mistral-7b-instruct-v0.3` es un espejo (mirror) del modelo oficial `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario NostraEmpire en Hugging Face. Se trata de un modelo de lenguaje grande (LLM) de 7.248 millones de parámetros, basado en la arquitectura transformer decoder-only, fine-tuneado para seguir instrucciones y soportar function calling. El modelo original fue desarrollado por Mistral AI y esta versión es una copia idéntica en pesos y configuración, alojada en un repositorio independiente.

Este mirror resulta relevante para desarrolladores que necesitan una réplica estable del modelo oficial, ya sea para pruebas, despliegues en entornos controlados o para evitar dependencias del repositorio original. Al ser un mirror, hereda todas las capacidades del modelo base: generación de texto, razonamiento, soporte de herramientas y un vocabulario ampliado a 32768 tokens. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original soporta 32k, pero no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo original es multilingue, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión fine-tuneada de Mistral-7B-v0.3, que a su vez es una evolución de Mistral-7B-v0.2. La arquitectura es un transformer causal con atención de ventana deslizante (sliding window attention) en capas intermedias, aunque en v0.3 se eliminó esta característica en favor de atención completa. El vocabulario se amplió a 32768 tokens y se incorporó un tokenizer v3, además de soporte nativo para function calling. El entrenamiento del modelo original incluyó una fase de fine-tuning supervisado (SFT) sobre datos de instrucciones, seguida de optimización con preferencias humanas (RLHF/DPO), aunque los detalles exactos del dataset no se especifican en la información disponible.

Al ser un mirror, no hay innovaciones técnicas adicionales respecto al modelo original. La única diferencia es el repositorio de alojamiento, que mantiene los mismos pesos y configuración.

## Capacidades

- Generación de texto en lenguaje natural con alta coherencia y fluidez.
- Seguimiento de instrucciones complejas en formato conversacional.
- Soporte de function calling / tool calling, permitiendo al modelo invocar funciones externas definidas por el usuario.
- Razonamiento multi-paso y resolución de problemas matemáticos y lógicos básicos.
- Generación de código en múltiples lenguajes de programación.
- Capacidad multilingüe (aunque no se detallan los idiomas exactos, el modelo base fue entrenado con datos multilingües).
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32k tokens en el modelo original) y utilizar function calling para consultar bases de datos o APIs de pedidos, mejorando la precisión de las respuestas.
- Generación de código en producción: gracias a su soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación o revisar cambios, reduciendo el trabajo manual de los desarrolladores.
- Asistentes virtuales personales: al ser un modelo instruct, puede actuar como asistente para programación, redacción de correos, resúmenes de documentos o planificación de tareas, con la posibilidad de conectarse a calendarios o servicios externos mediante funciones.
- Análisis de sentimiento y clasificación de texto: su capacidad de seguir instrucciones permite adaptarlo a tareas de NLP específicas mediante prompts, como análisis de opiniones en redes sociales o categorización de tickets de soporte.
- Chatbots educativos: puede responder preguntas sobre diversos temas, explicar conceptos y mantener conversaciones didácticas, aprovechando su contexto amplio para recordar información previa.
- Automatización de tareas de oficina: con function calling, puede interactuar con herramientas como hojas de cálculo o sistemas de gestión, extrayendo datos y generando informes automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un mirror del modelo oficial, se espera que su rendimiento sea idéntico al de `mistralai/Mistral-7B-Instruct-v0.3`, cuyos resultados en MMLU, HumanEval y GSM8K son públicos, pero no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16 (para 7B parámetros), 7 GB en int8 y 4 GB en int4 (si se aplican cuantizaciones, aunque no se especifican en el repo).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización int8. En entornos cloud, una A10G o A100 es suficiente.
- El modelo cabe en GPUs de consumo como RTX 3060 (12 GB) si se usa cuantización int4, aunque no se proporcionan archivos GGUF en el repo.
- Opciones de despliegue: vLLM (indicado en la etiqueta), Hugging Face transformers, TGI, o llama.cpp si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este mirror. Como referencia, el modelo original Mistral-7B-Instruct-v0.3 se compara con otros modelos de 7B como Llama 2 7B o Gemma 7B, pero no se incluyen métricas en la información proporcionada. Se recomienda consultar los benchmarks oficiales de Mistral AI para una comparativa detallada.

## Limitaciones y advertencias

- Al ser un mirror, no hay garantía de mantenimiento o actualizaciones por parte del autor del repo; se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento originales, como estereotipos de género, raza o cultura.
- Riesgo de alucinación en temas especializados o cuando se le pide información factual no cubierta en su entrenamiento.
- La longitud de contexto no está confirmada en la información del repo; si se usa más allá de 32k tokens, el rendimiento puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoría original de Mistral AI.
- No se proporcionan cuantizaciones oficiales; los usuarios deben generarlas o buscarlas en repositorios externos.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-mistral-7b-instruct-v0.3
- Modelo original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Documentación de Mistral 7B: https://docs.mistral.ai/models/mistral-7b-0-1
- Ejemplo de mirror de v0.2: https://huggingface.co/xinyu-mirror/Mistral-7B-Instruct-v0.2
