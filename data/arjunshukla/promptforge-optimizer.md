# ArjunShukla/PromptForge-Optimizer

## Resumen

PromptForge-Optimizer es un adaptador LoRA (PEFT) desarrollado por los contribuidores de PromptForge que reescribe prompts débiles o vagos en instrucciones claras, específicas y accionables para modelos de lenguaje, preservando la intención y el tema original. Forma parte del proyecto PromptForge, una herramienta local de puntuación y optimización de calidad de prompts, y se complementa con el modelo PromptForge-Quality para flujos de puntuación → optimización → re-puntuación.

El adaptador se construye sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, un transformer causal de 1.500 millones de parámetros. El adaptador ocupa aproximadamente 82 MB en disco y se entrena con unos 800 pares curados de prompts débiles → fuertes, cubriendo dominios como programación, escritura, datos, investigación y planificación. Su relevancia actual radica en permitir la mejora de prompts de forma local y ligera, sin depender de LLMs de frontera, lo que lo hace adecuado para herramientas de ingeniería de prompts, agentes e IDE.

El modelo está pensado para uso directo como reescritor de prompts, no como asistente conversacional general. Su licencia MIT facilita su integración en proyectos comerciales y de código abierto, y su pequeño tamaño permite ejecutarlo en hardware modesto, incluso en portátiles con GPU de 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.5B (base) + adaptador LoRA (~82 MB en disco, numero de parametros entrenables no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 (maxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizacion del base, pero no se especifica) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, un transformer causal con atención de ventana deslizante y mecanismos de atención estándar. El adaptador se entrena con rank 16 y alpha 32, aplicándose a las proyecciones q/k/v/o y a las capas MLP. El entrenamiento usa una pérdida de enmascaramiento solo en las respuestas (asistente), excluyendo los tokens de sistema y usuario, y se realiza con precisión fp16, gradiente checkpointing y un tamaño de lote efectivo de 8.

Los datos de entrenamiento consisten en aproximadamente 800 pares curados de prompts débiles → fuertes, generados a partir de unas 140 semillas temáticas que cubren programación, escritura, datos, investigación y planificación. La regla de intención garantiza que el prompt optimizado mantenga el mismo tema que el original. El entrenamiento se ejecutó durante 6 épocas en una NVIDIA GeForce RTX 5060 Laptop (8 GB), con un tiempo total de unos 87 minutos. La pérdida de entrenamiento final fue de ~0.47 y la de validación de ~0.121.

## Capacidades

- Reescribe prompts vagos o ambiguos en instrucciones claras, específicas y accionables, añadiendo audiencia, restricciones, estructura y formato de salida.
- Preserva la intención y el tema original del prompt débil.
- Se integra con PromptForge-Quality para flujos de puntuación → optimización → re-puntuación.
- Funciona como herramienta local/offline mediante CLI, API Python o interfaz Gradio.
- Soporta la carga directa del adaptador con PEFT y transformers, usando la plantilla de chat de Qwen.
- No es un asistente conversacional general; su uso principal es la mejora de prompts antes de enviarlos a otros LLMs.

## Casos de uso

- Asistentes de ingeniería de prompts: el modelo puede integrarse en herramientas que ayuden a usuarios a formular mejores prompts, convirtiendo descripciones vagas en instrucciones detalladas con formato de salida y restricciones.
- Herramientas de IDE y agentes: antes de llamar a un LLM, el adaptador puede mejorar la instrucción del usuario, reduciendo iteraciones y mejorando la calidad de las respuestas.
- Pipelines de datos sintéticos: en la generación de datasets, el modelo puede producir prompts de mayor calidad para entrenar o evaluar otros modelos.
- Optimización de prompts para atención al cliente: transforma solicitudes genéricas de usuarios en prompts estructurados que un LLM puede procesar con contexto y formato adecuados.
- Generación de código en producción: convierte peticiones como "haz una app de redes sociales" en especificaciones detalladas con perfiles, feed, likes y restricciones, listas para alimentar a un generador de código.
- Evaluación y mejora continua de prompts: combinado con PromptForge-Quality, permite medir la calidad de un prompt, optimizarlo y volver a puntuarlo en un bucle iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo reporta una pérdida de validación de 0.121 y un ejemplo de mejora de calidad medido con el scorer PromptForge-Quality, que pasa de 41.5 a 94.0 en un caso concreto. No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador es muy ligero (~82 MB), por lo que la carga principal proviene del modelo base de 1.5B.
- Para inferencia en fp16, se recomienda al menos 4-6 GB de VRAM; una GPU como RTX 3060, RTX 4060 o superior es suficiente.
- En CPU, el modelo puede ejecutarse con cuantización (por ejemplo, GGUF) aunque no se especifican configuraciones oficiales.
- Opciones de despliegue: transformers + PEFT (carga directa), vLLM (si se fusiona el adaptador con el base), llama.cpp (si se convierte a GGUF), o el paquete `tuneprompt` que incluye validación y fallback.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre alternativas open source específicas para optimización de prompts con características comparables. El modelo se diferencia de un LLM generalista (como GPT-4 o Claude) en que es un adaptador ligero y local, pero su calidad de reescritura es inferior a la de modelos de frontera. No se incluyen comparativas numéricas por falta de datos.

## Limitaciones y advertencias

- Entrenado con datos sintéticos curados; la cobertura es más fuerte en dominios como programación, escritura, datos, investigación y planificación, y puede degradarse en temas fuera de ese alcance.
- Puede inventar detalles plausibles (por ejemplo, audiencia, stack tecnológico) cuando el prompt débil es demasiado vago, lo que requiere revisión humana.
- El modelo base es pequeño (1.5B), por lo que la calidad de reescritura no alcanza el nivel de LLMs de frontera.
- El adaptador crudo puede producir salidas que se desvían del tema; se recomienda usar el paquete PromptForge (con validación y fallback) en lugar de la generación directa.
- No debe usarse para generar contenido dañino, engañoso o desinformativo.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- La licencia MIT permite uso comercial, pero el usuario es responsable de revisar los prompts optimizados antes de usarlos en producción.

## Enlaces

- HuggingFace: https://huggingface.co/ArjunShukla/PromptForge-Optimizer
- Repositorio GitHub (PromptForge): https://github.com/arjun988/promptModel
- Paquete PyPI (tuneprompt): https://pypi.org/project/tuneprompt/
- Modelo complementario PromptForge-Quality: https://huggingface.co/ArjunShukla/PromptForge-Quality
- Demo (Gradio app en el repositorio): https://github.com/arjun988/promptModel (demo/app.py)
