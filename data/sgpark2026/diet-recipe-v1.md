# sgpark2026/diet-recipe-v1

## Resumen

diet-recipe-v1 es un modelo de lenguaje especializado en dietética y generación de recetas, desarrollado por el usuario sgpark2026. Se trata de un fine-tuning del modelo Qwen2.5-0.5B-Instruct, convertido posteriormente a formato GGUF mediante la herramienta Unsloth para facilitar su despliegue en entornos de inferencia local como llama.cpp u Ollama. El modelo está diseñado para ofrecer respuestas conversacionales relacionadas con planificación dietética, recetas saludables y asesoramiento nutricional básico.

Con 494 millones de parámetros, este modelo se posiciona en la gama de modelos pequeños y eficientes, aptos para ejecutarse en hardware de consumo. Su relevancia radica en la combinación de un tamaño reducido con una especialización en un dominio concreto, lo que permite desplegar asistentes nutricionales en dispositivos con recursos limitados. El repositorio incluye un único archivo cuantizado Q4_K_M y un Modelfile de Ollama para facilitar su uso.

La información pública disponible es escasa: no se especifican los datos de entrenamiento, el proceso de fine-tuning ni los benchmarks de rendimiento. El modelo se publica bajo una licencia no especificada, lo que requiere verificación antes de su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder-only) |
| Parametros totales | 494.032.768 (494M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (base Qwen2.5-0.5B: 32.768 tokens, no confirmado) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (base Qwen2.5: multilingue, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors original no publicado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. La versión original de Qwen2.5-0.5B cuenta con 24 capas, 14 cabezas de atención y una dimensión oculta de 896, aunque no se confirma si el fine-tuning ha modificado estos parámetros. El proceso de entrenamiento consistió en un fine-tuning instructivo sobre el modelo base, realizado con la librería Unsloth, que optimiza el entrenamiento mediante técnicas como LoRA o QLoRA para reducir el consumo de memoria y acelerar el proceso.

Los datos de entrenamiento específicos no se han publicado. No se dispone de información sobre el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó también con Unsloth, lo que garantiza compatibilidad con llama.cpp y sus derivados. El modelo se distribuye únicamente en formato cuantizado Q4_K_M, que reduce el tamaño a aproximadamente 1,4 GB.

## Capacidades

- Generación de texto conversacional especializado en dietética, nutrición y recetas saludables.
- Respuestas a consultas sobre planificación de comidas, cálculo aproximado de calorías y sugerencias de menús.
- Soporte de chat multi-turno gracias a la plantilla Jinja incluida en el archivo GGUF.
- Compatible con llama.cpp y Ollama para inferencia local en CPU y GPU.
- Capacidades multilingües heredadas del modelo base Qwen2.5, aunque no confirmadas para este fine-tuning.
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Asistente nutricional personal: el modelo puede responder preguntas sobre dietas equilibradas, sugerir sustituciones de ingredientes y ofrecer pautas básicas de alimentación saludable en conversaciones multi-turno, gracias a su naturaleza instructiva y su tamaño reducido que permite ejecutarlo en dispositivos de bajo consumo.
- Generación de recetas a partir de ingredientes: dado su fine-tuning en dietética, puede proponer recetas basadas en una lista de ingredientes proporcionada por el usuario, indicando pasos de preparación y valores nutricionales aproximados.
- Chatbot de bienestar integrado en aplicaciones móviles: su formato GGUF y su compatibilidad con Ollama permiten integrarlo en aplicaciones de salud y bienestar que requieran un asistente conversacional sin depender de APIs externas.
- Educación nutricional: puede utilizarse como herramienta educativa para explicar conceptos básicos de nutrición, como macronutrientes, vitaminas o índice glucémico, en un formato accesible y conversacional.
- Prototipado rápido de productos de salud: desarrolladores pueden desplegar este modelo en entornos de desarrollo para validar ideas de productos relacionados con alimentación antes de invertir en modelos más grandes.
- Inferencia en entornos sin GPU: al ser un modelo de 0,5B cuantizado, puede ejecutarse en CPU con recursos mínimos, lo que lo hace adecuado para entornos edge o servidores de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tuning. El modelo base Qwen2.5-0.5B-Instruct obtiene puntuaciones moderadas en benchmarks generales, pero no se puede asumir que el fine-tuning mantenga o mejore estos resultados sin evidencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con cuantización Q4_K_M, suficiente para GPU de gama de entrada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, etc.). También funciona en CPU con 8 GB de RAM.
- Compatible con hardware de consumo: sí, es uno de los puntos fuertes del modelo por su tamaño reducido.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y cualquier framework compatible con GGUF.
- Latencia estimada: en CPU moderna, entre 10-30 tokens/segundo; en GPU de gama media, entre 50-100 tokens/segundo. Valores orientativos basados en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| diet-recipe-v1 | 494M | no disponible | no disponible | GGUF | Dietetica y recetas |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Safetensors, GGUF | Uso general |
| TinyLlama-1.1B-Chat | 1.100M | 2.048 | Apache 2.0 | Safetensors, GGUF | Uso general |

La comparativa se basa en datos públicos de los modelos base. diet-recipe-v1 se diferencia por su especialización en dietética, pero carece de la documentación y el respaldo de los modelos generalistas. TinyLlama ofrece más parámetros y capacidad bruta, mientras que Qwen2.5-0.5B-Instruct proporciona una base más documentada y con licencia clara.

## Limitaciones y advertencias

- Información de entrenamiento no publicada: se desconoce la calidad, el volumen y la procedencia de los datos de fine-tuning, lo que impide evaluar sesgos o alucinaciones específicas.
- Licencia no especificada: no se puede determinar si el modelo es utilizable en proyectos comerciales sin riesgo legal.
- Riesgo de alucinación: como todo modelo pequeño, puede generar información nutricional incorrecta o desactualizada. No debe utilizarse como sustituto de consejo médico profesional.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas de dietética frente a otros modelos.
- Contexto no confirmado: aunque la base Qwen2.5 soporta 32K tokens, no se confirma que el fine-tuning mantenga esta capacidad.
- Idioma no confirmado: el modelo base es multilingüe, pero no se especifica si el fine-tuning conserva todas las lenguas o se centra en inglés.
- Modelo sin mantenimiento: el repositorio no muestra actividad posterior a la creación, lo que sugiere que no recibirá actualizaciones ni correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sgpark2026/diet-recipe-v1
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Proyecto relacionado (no oficial): https://github.com/lakshmi-official/Project-AI-Nutrient-and-Diet-Suggesting-site
- Proyecto relacionado (no oficial): https://github.com/avneeshkum/recipe-ai-project
