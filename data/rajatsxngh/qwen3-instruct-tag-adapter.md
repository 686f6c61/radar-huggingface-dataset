# rajatsxngh/qwen3-instruct-tag-adapter

## Resumen

`rajatsxngh/qwen3-instruct-tag-adapter` es un adaptador QLoRA entrenado sobre el modelo base Qwen3-1.7B de Alibaba. Lo publica el usuario rajatsxngh en Hugging Face y su propósito es la generación de una etiqueta ("tag") a partir de una instrucción, en el contexto de un ejercicio académico (HW5B) sobre el corpus de Stack Exchange. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse junto al modelo base de 1.700 millones de parámetros.

El adaptador se ha entrenado con Axolotl sobre 5.000 preguntas del split de entrenamiento del instructor, seleccionando el mejor checkpoint mediante un split de monitorización de 1.000 preguntas. La información pública es muy escasa: el repositorio ocupa 0,6 GB, no tiene descargas ni likes y la model card se limita a dos frases y un enlace a los logs de Weights & Biases alojados en CoreWeave.

Su relevancia es limitada fuera del ámbito del ejercicio: sirve como ejemplo reproducible de ajuste fino con QLoRA sobre un modelo pequeño y como artefacto didáctico, no como componente listo para producción. La licencia Apache 2.0 y el formato PEFT/safetensors facilitan su inspección y reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (adaptador PEFT; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | Entrenamiento QLoRA (cuantizacion del base durante el ajuste); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen3-1.7B, un transformer decoder-only. El entrenamiento se realizó con QLoRA, es decir, con el modelo base cuantizado en baja precisión y solo los pesos del adaptador en precisión completa, lo que reduce el consumo de memoria frente a un ajuste completo. La herramienta empleada es Axolotl, un framework de ajuste fino ampliamente usado en la comunidad.

Los datos de entrenamiento son 5.000 preguntas del split de entrenamiento de Stack Exchange proporcionado por el instructor del curso, y la selección del mejor checkpoint se hizo con un split de monitorización de 1.000 preguntas. No se especifican hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, épocas), composición detallada del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio esquema QLoRA.

## Capacidades

- Generación de texto condicionada a una instrucción, orientada a producir una única etiqueta de clasificación (single-tag).
- Ajuste específico para el dominio de Stack Exchange: preguntas técnicas de programación y su etiqueta asociada.
- Herencia de las capacidades del modelo base Qwen3-1.7B en generación de texto y conversación, aunque el adaptador puede degradarlas al estar especializado en una tarea concreta.
- Soporte de tool calling y function calling: no documentado para el adaptador; depende del modelo base y no se garantiza tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas del adaptador no están disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Etiquetado automático de preguntas técnicas: dado el enunciado de una pregunta de Stack Exchange, el adaptador genera la etiqueta correspondiente. Es su caso de uso directo y el único validado por el autor.
- Prototipado de clasificación zero-shot con modelos pequeños: sirve como base para experimentar con adaptadores PEFT sobre Qwen3-1.7B en tareas de clasificación de texto corto.
- Material didáctico para cursos de ajuste fino: el repositorio y los logs de W&B permiten reproducir un pipeline QLoRA con Axolotl de principio a fin.
- Clasificación de tickets o incidencias internas: con un reentrenamiento sobre datos propios, el mismo esquema (QLoRA sobre Qwen3-1.7B) puede adaptarse a taxonomías de soporte, aunque el adaptador publicado no está entrenado para ello.
- Evaluación comparativa de adaptadores: útil como referencia de línea base al comparar distintas configuraciones LoRA sobre el mismo modelo base.
- Experimentos de destilación o etiquetado débil: puede emplearse para generar etiquetas preliminares que luego se revisen manualmente en un corpus mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB en disco; el modelo base Qwen3-1.7B debe cargarse aparte.
- VRAM estimada para inferencia: aproximadamente 4 GB en FP16 para el modelo base de 1.700 millones de parámetros, más el adaptador; en cuantización de 4 bits puede reducirse a unos 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para reentrenamiento QLoRA se recomienda al menos 12-16 GB de VRAM.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `peft`, vLLM (con soporte de adaptadores LoRA), TGI y llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rajatsxngh/qwen3-instruct-tag-adapter | Adaptador sobre 1.700 M | No disponible | Adaptador QLoRA para etiquetado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible en la informacion proporcionada | Modelo base completo | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de la comunidad sobre Qwen3-1.7B | Variable | Heredado del base | Adaptadores PEFT | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado para una única tarea (asignar una etiqueta a una pregunta de Stack Exchange); su uso fuera de ese dominio producirá salidas poco fiables.
- No hay métricas publicadas de precisión, recall ni exactitud en la tarea de etiquetado, por lo que no puede evaluarse su calidad objetivamente.
- Riesgo de alucinación: al estar basado en un modelo generativo pequeño, puede inventar etiquetas que no existan en la taxonomía esperada.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés del corpus original.
- La model card es mínima y no documenta hiperparámetros, composición del dataset ni limitaciones conocidas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-1.7B y de los datos de Stack Exchange antes de un uso comercial.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de su funcionamiento en producción.
- El enlace a los logs de W&B apunta a un espacio de CoreWeave que puede no ser accesible públicamente.

## Enlaces

- Hugging Face: https://huggingface.co/rajatsxngh/qwen3-instruct-tag-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Logs de entrenamiento: https://forge.coreweave.com/wandb/rajat-utd/hw5_decoder_tags
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- PEFT: https://github.com/huggingface/peft
