# gggaaammmeee/qwen3.5-0.8b-labor-lora

## Resumen

`gggaaammmeee/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario `gggaaammmeee`. No se trata de un modelo completo, sino de un conjunto de pesos adicionales que se cargan sobre el modelo base mediante la librería PEFT. Su propósito es especializar un modelo pequeño de 0,8 mil millones de parámetros en la tarea de responder preguntas de asesoría laboral (노무 상담, en coreano), a partir del dataset propio `gggaaammmeee/labor-counsel-qa`.

El adaptador se entrenó con supervisión (SFT) durante 4 épocas, con rango LoRA 8, `lora_alpha` 16 y aplicación sobre todas las capas lineales (`all-linear`), a una tasa de aprendizaje de 2e-4. El resultado es un artefacto muy ligero (el repositorio ocupa 0,0 GB según Hugging Face) que hereda la arquitectura y el contexto del modelo base Qwen3.5-0.8B, pero cuyo comportamiento queda sesgado hacia el dominio de consultas laborales en coreano.

Su relevancia es acotada: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeño, útil como referencia para quien quiera replicar la receta o desplegar un asistente de dominio muy específico en coreano con requisitos de hardware mínimos. La información pública es escasa (16 descargas, 0 likes en el momento de la consulta) y no se han publicado benchmarks ni detalles ampliados de entrenamiento más allá de los hiperparámetros indicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA: se congelan los pesos del modelo base Qwen3.5-0.8B y se insertan matrices de baja dimensión en las capas lineales, con rango r=8 y `lora_alpha`=16 (lo que implica un factor de escala de 2). Se aplica sobre todas las capas lineales (`all-linear`), lo que maximiza la cobertura de adaptación sin tocar los pesos originales. El entrenamiento se realizó con SFT (supervised fine-tuning) a una tasa de aprendizaje de 2e-4 durante 4 épocas, usando la librería TRL y el dataset `gggaaammmeee/labor-counsel-qa`, compuesto por pares pregunta-respuesta de asesoría laboral en coreano.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del propio ajuste LoRA. Al ser un adaptador, no modifica la arquitectura del modelo base: cualquier capacidad estructural (atención, contexto, tokenizador) es la de Qwen3.5-0.8B.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre normativa y consultas laborales.
- Respuesta a consultas de dominio específico (derecho laboral, condiciones de trabajo, derechos del trabajador) dentro del alcance del dataset de entrenamiento.
- Hereda del modelo base la capacidad general de generación de texto, razonamiento y código, aunque el ajuste LoRA puede degradar el rendimiento fuera del dominio para el que fue entrenado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base y no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste está orientado a QA de un solo turno.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente de consultas laborales en coreano: el adaptador responde preguntas frecuentes sobre derechos laborales, contratos y condiciones de trabajo, aprovechando el ajuste específico sobre el dataset `labor-counsel-qa`. Es adecuado por su bajo coste computacional al apoyarse en un modelo de 0,8B.
- Prototipado rápido de chatbots de dominio: al ser un adaptador LoRA de pequeño tamaño, se puede cargar junto al modelo base en entornos con recursos limitados para validar un producto de asesoría laboral antes de invertir en modelos mayores.
- Despliegue en el borde o en CPU: el modelo base de 0,8B y el adaptador ligero permiten ejecución en hardware modesto, útil para demos o entornos con presupuesto de GPU mínimo.
- Filtrado y clasificación de consultas laborales: el modelo puede usarse para reformular o clasificar preguntas de usuarios en un sistema de triaje antes de derivarlas a un especialista humano.
- Generación de borradores de respuestas para revisión humana: en un flujo de atención al empleado, el adaptador produce un primer borrador que un asesor revisa y corrige, reduciendo el tiempo de respuesta.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de la receta LoRA (r=8, alpha=16, all-linear, 4 épocas) para estudiar el efecto de la especialización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo base de 0,8B, el requisito real lo marca el modelo base. En fp16, un modelo de 0,8B ocupa aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, en torno a 0,4-0,5 GB. El adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el modelo base en cuantización; una RTX 3060, RTX 4060 o superior permite ejecución cómoda. Para fp16 sin cuantizar, 8 GB de VRAM son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador con `PeftModel.from_pretrained`), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI si se fusionan los pesos y se sirve el modelo resultante.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gggaaammmeee/qwen3.5-0.8b-labor-lora | 0,8B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face | Adaptador especializado en QA laboral en coreano |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | No disponible | Hugging Face | Modelo base sin especializar; capacidades generales |
| Otros adaptadores LoRA de dominio | Depende del base | Depende del base | Variable | Hugging Face | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en coreano; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Al ser un ajuste de dominio sobre un dataset específico, puede alucinar respuestas legales o laborales incorrectas; no debe usarse como asesoramiento legal sin supervisión humana.
- No se han publicado evaluaciones de sesgo, robustez ni seguridad; se desconoce el comportamiento ante entradas adversarias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que deben verificarse por separado.
- El tamaño del repositorio (0,0 GB) y las escasas descargas sugieren un artefacto experimental sin validación comunitaria extensa.
- No hay información sobre el proceso de limpieza del dataset ni sobre posibles datos personales en el mismo.
- El contexto máximo no está documentado en la model card; debe consultarse la del modelo base.

## Enlaces

- [Hugging Face: gggaaammmeee/qwen3.5-0.8b-labor-lora](https://huggingface.co/gggaaammmeee/qwen3.5-0.8b-labor-lora)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Dataset: gggaaammmeee/labor-counsel-qa](https://huggingface.co/datasets/gggaaammmeee/labor-counsel-qa)
- [Librería PEFT](https://github.com/huggingface/peft)
- [Librería TRL](https://github.com/huggingface/trl)
