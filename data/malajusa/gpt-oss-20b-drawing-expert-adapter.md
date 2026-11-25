# Malajusa/gpt-oss-20b-drawing-expert-adapter

## Resumen

`Malajusa/gpt-oss-20b-drawing-expert-adapter` es un adaptador LoRA desarrollado por el usuario Malajusa sobre el modelo base `openai/gpt-oss-20b`. Su propósito es especializar el modelo en la generación de código Python para dibujo programático, concretamente con las librerías matplotlib, seaborn y PIL/Pillow. El adaptador se entrenó mediante SFT con TRL sobre un conjunto de datos propio validado por ejecución (`Malajusa/programmatic-drawing-sft`).

El modelo base, gpt-oss-20b, es un transformer de tipo Mixture of Experts (MoE) publicado por OpenAI bajo licencia Apache 2.0. El adaptador no modifica la arquitectura: aplica LoRA con rango 32, alpha 32 sobre las proyecciones de atención y MLP del modelo base, lo que da como resultado un artefacto de unos 0,1 GB que debe cargarse junto con los pesos completos del modelo original.

La relevancia de esta ficha radica en su naturaleza de adaptador especializado y de nicho: el autor reporta una evaluación de ejecución sobre 57 prompts retenidos con 57/57 aciertos frente a 20/57 del modelo base. Es, por tanto, un ejemplo de especialización estrecha mediante LoRA sobre un modelo MoE abierto de 20B, con el objetivo de mejorar la fiabilidad del código generado para tareas de visualización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer MoE `openai/gpt-oss-20b` |
| Parametros totales | no disponible (el adaptador ocupa ~0,1 GB; el modelo base gpt-oss-20b no se detalla en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible para el adaptador; el autor menciona un checkpoint fusionado en MXFP4 y recomienda bf16 sobre transformers 5.24.0 / torch 2.15.0+cu132 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre las proyecciones de atención y MLP del modelo base `openai/gpt-oss-20b`. No se trata de un modelo independiente: requiere cargar primero los pesos del modelo base y después superponer el adaptador mediante PEFT. El entrenamiento se realizó con TRL en modo SFT (supervised fine-tuning) sobre el dataset `Malajusa/programmatic-drawing-sft`, descrito por el autor como datos validados por ejecución, es decir, pares de prompt y código que se comprobaron ejecutando el código resultante.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del propio esquema LoRA. La receta completa, según la model card, se publica en la ficha del modelo fusionado `Malajusa/gpt-oss-20b-drawing-expert`.

## Capacidades

- Generación de código Python para dibujo programático con matplotlib y seaborn.
- Generación de código de manipulación y dibujo de imágenes con PIL/Pillow.
- Especialización en tareas de visualización: gráficos, figuras y composición de imágenes a partir de instrucciones en lenguaje natural.
- Hereda del modelo base las capacidades generales de generación de texto y razonamiento, aunque el adaptador está orientado a la tarea de dibujo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación automática de gráficos en notebooks y pipelines de análisis de datos: el adaptador produce código matplotlib/seaborn listo para ejecutar a partir de una descripción textual, lo que reduce el ciclo de prueba y error en la creación de visualizaciones.
- Creación de informes y dashboards reproducibles: se puede usar para generar scripts de figuración estandarizados que se versionan en repositorios y se ejecutan en CI, dado el enfoque del entrenamiento en código validado por ejecución.
- Generación de imágenes sintéticas y composiciones con Pillow: útil para crear placeholders, miniaturas o ilustraciones programáticas en pipelines de contenido.
- Asistencia a científicos de datos en exploración visual: el modelo puede traducir preguntas como "dibuja la distribución de esta columna por categoría" en código de plotting ejecutable.
- Automatización de documentación técnica con figuras: generación de gráficos de ejemplo para documentación, tutoriales o material docente a partir de descripciones.
- Prototipado rápido de visualizaciones en entornos educativos: permite a estudiantes obtener código funcional de dibujo sin dominar la API de matplotlib, con la ventaja de que el adaptador fue entrenado sobre código que se ejecuta correctamente.

## Benchmarks y rendimiento

| Evaluacion | Adaptador | Modelo base |
|---|---|---|
| Held-out execution eval (57 prompts) | 57/57 pases | 20/57 pases |

No se han publicado en la información disponible otros resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB y puede cargarse sobre el modelo base en bf16.
- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base gpt-oss-20b y de la cuantización empleada. El autor advierte que el checkpoint fusionado en MXFP4 genera resultados incorrectos en transformers 5.24.0 / torch 2.15.0+cu132, por lo que recomienda cargar el adaptador sobre el base en bf16.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del modelo base (20B), se requeriría hardware de gama alta o cuantización agresiva para caber en GPU de consumo, pero no se aportan cifras concretas.
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained` + `merge_and_unload`) sobre transformers; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA especializados en dibujo programático sobre modelos MoE abiertos) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar el modelo base `openai/gpt-oss-20b`, con el coste de almacenamiento y cómputo asociado.
- El autor advierte de un problema de compatibilidad: el checkpoint fusionado en MXFP4 genera resultados incorrectos ("garbage") en transformers 5.24.0 / torch 2.15.0+cu132; se recomienda usar el adaptador sobre el base en bf16.
- La evaluación reportada es estrecha (57 prompts de ejecución de dibujo) y no cubre capacidades generales ni robustez fuera de dominio.
- Riesgo de alucinación y de generar código que no se ejecute correctamente fuera de la distribución de entrenamiento; la validación por ejecución del dataset mitiga pero no elimina este riesgo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de las librerías de terceros implicadas en el código generado.
- El repositorio tiene muy poca tracción (25 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Malajusa/gpt-oss-20b-drawing-expert-adapter
- Modelo fusionado: https://huggingface.co/Malajusa/gpt-oss-20b-drawing-expert
- Dataset de entrenamiento: https://huggingface.co/datasets/Malajusa/programmatic-drawing-sft
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- ML Intern: https://hf.co/chat?mode=ml-intern
