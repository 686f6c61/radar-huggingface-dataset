# GhostScientist/jev-decisions-v2-model

## Resumen

`GhostScientist/jev-decisions-v2-model` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario GhostScientist. El entrenamiento se ha realizado con la libreria TRL (version 1.14.1) sobre el dataset conversacional `GhostScientist/jev-decisions-v1`, que da nombre y proposito al modelo: aparentemente esta orientado a tareas de toma de decisiones y respuestas a preguntas abiertas de tipo dilema o eleccion personal. El pipeline declarado en el repositorio es `image-text-to-text`, lo que sugiere una modalidad multimodal heredada de la familia Qwen3.5, aunque la model card no documenta capacidades de vision.

El modelo tiene 852.985.920 parametros reales (segun los pesos en safetensors), lo que lo situa en la categoria de modelos pequenos o "tiny", aptos para inferencia en hardware de consumo. El repositorio ocupa 17,1 GB, un tamano muy superior al de los pesos finales en precision de 16 bits, lo que indica que incluye copias adicionales (checkpoints intermedios o estados del optimizador del proceso de entrenamiento con `hf_jobs`).

La relevancia de esta ficha es limitada pero util como caso de estudio: se trata de un ajuste fino comunitario, sin licencia declarada, sin resultados de benchmarks publicados y con cero descargas en el momento de la consulta. No obstante, sirve para ilustrar el flujo actual de SFT con TRL y para evaluar si un modelo de menos de mil millones de parametros es suficiente para una tarea concreta de dialogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada del modelo base `Qwen/Qwen3.5-0.8B` (familia Qwen3.5) |
| Parametros totales | 852.985.920 (dato real de los pesos safetensors) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni AWQ/GPTQ en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card usa el marcador generico `license`) |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. El modelo es un ajuste fino del checkpoint `Qwen/Qwen3.5-0.8B`, por lo que hereda su arquitectura y su tokenizador; no se especifica si se trata de un transformer decoder-only denso, de un modelo hibrido ni de un MoE. El pipeline declarado es `image-text-to-text`, lo que implica que la configuracion del modelo admite entradas de imagen y texto, aunque no hay documentacion sobre el encoder visual ni sobre si los pesos multimodales se han entrenado o congelado durante el SFT.

El procedimiento de entrenamiento es un SFT estandar ejecutado con TRL 1.14.1 sobre el dataset `GhostScientist/jev-decisions-v1`. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.14.1, Datasets 5.0.1 y Tokenizers 0.23.2. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de etapas de RLHF o DPO, la estrategia de enmascarado de perdida ni hiperparametros como tasa de aprendizaje, tamano de lote o numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Generacion de texto conversacional en formato de chat: la model card incluye un ejemplo de uso con `pipeline("text-generation")` pasando una lista de mensajes con roles `user` y `assistant`.
- Respuesta a preguntas abiertas de tipo dilema o eleccion personal, segun el ejemplo incluido ("si tuvieras una maquina del tiempo...").
- Entrada multimodal texto-imagen declarada a nivel de pipeline (`image-text-to-text`); sin documentacion adicional sobre el alcance real de la capacidad de vision.
- Soporte de `tool calling` / `function calling`: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (*thinking mode*), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional de proposito general en prototipos: el modelo puede mantener dialogos de varios turnos en el formato de roles que espera `transformers`, lo que permite integrarlo rapidamente en un chatbot de demostracion sin infraestructura dedicada.
- Clasificacion y ayuda a la decision en formularios de negocio: dado el dataset de entrenamiento (`jev-decisions-v1`), encaja en tareas de recomendacion de opciones o justificacion de elecciones ante preguntas cerradas.
- Evaluacion academica de tecnicas de SFT: sirve como referencia reproducible para comparar hiperparametros de TRL sobre un modelo base de menos de mil millones de parametros.
- Generacion de texto en el borde (*edge*) o en local: con 852 millones de parametros, es viable ejecutarlo en portatiles con GPU integrada o en CPU para tareas de baja latencia y sin conexion.
- Filtrado o preprocesado de texto en pipelines de datos: puede emplearse como modelo auxiliar para etiquetar, resumir o reformular fragmentos cortos antes de pasarlos a un modelo mayor.
- Base para nuevos ajustes finos de dominio: al ser un checkpoint pequeno derivado de Qwen3.5, es un punto de partida barato para LoRA o SFT adicional sobre datos propios.
- Experimentacion multimodal controlada: si finalmente se confirma la componente de vision, podria usarse para tareas simples de pregunta-respuesta sobre imagenes en entornos con recursos limitados, aunque la informacion disponible no permite confirmarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en fp32, 1,7 GB en fp16/bf16, 0,85 GB en int8 y 0,4-0,5 GB en int4 (calculado a partir de los 852.985.920 parametros; sin mediciones publicadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090). Tambien cabe en GPUs de gama de entrada con 4-6 GB de VRAM si se usa cuantizacion.
- Cabe en GPU de consumo: si. Tambien es viable en CPU y en dispositivos con memoria unificada (Apple Silicon).
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado por el autor); vLLM y TGI son compatibles en teoria con checkpoints de transformers, aunque no hay configuracion publicada; llama.cpp y Ollama requieren una conversion a GGUF que no se proporciona en el repositorio. El tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.
- Nota sobre el almacenamiento: el repositorio ocupa 17,1 GB, muy por encima del peso de los pesos finales, por lo que hay que prever espacio en disco adicional si se clona completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `GhostScientist/jev-decisions-v2-model` | 852.985.920 | No disponible | No disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-0.8B` (modelo base) | No disponible en esta informacion | No disponible | No disponible | Hugging Face |
| `Qwen/Qwen3-0.6B` | ~0,6 B | No disponible en esta informacion | Apache-2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | ~1,2 B | No disponible en esta informacion | Licencia comunitaria Llama 3.2 | Hugging Face (acceso con aceptacion) |
| `HuggingFaceTB/SmolLM2-1.7B` | ~1,7 B | No disponible en esta informacion | Apache-2.0 | Hugging Face |

Los datos de las alternativas corresponden a informacion publica general de sus respectivas model cards y no a la informacion proporcionada en esta consulta; no se dispone de comparaciones de rendimiento entre ellas y el modelo descrito.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia declarada, ni idiomas soportados, ni contexto, ni detalles de dataset, lo que impide evaluar su idoneidad para produccion.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo; un SFT sobre un dataset pequeno de decisiones tiende a sobreajustar el estilo y el dominio de entrenamiento.
- Sesgos conocidos: no disponible. Al desconocerse la composicion de `jev-decisions-v1`, no se puede estimar el sesgo de los datos.
- Limitacion de idioma y contexto: al no declararse idiomas ni ventana de contexto, el comportamiento fuera del ingles o en conversaciones largas es impredecible.
- Restricciones de licencia para uso comercial: la licencia figura como no disponible, por lo que no se puede asumir permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Cero adopcion: el modelo registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Trazabilidad del modelo base: al derivar de `Qwen/Qwen3.5-0.8B`, hereda las condiciones de uso y las limitaciones del modelo original, que conviene revisar por separado.
- Riesgo de fuga de datos: los datasets conversacionales generados por usuarios pueden contener informacion personal; no se documenta ningun proceso de filtrado.
- Tamano del repositorio: 17,1 GB para un modelo de 852 millones de parametros implica que se estan almacenando checkpoints de entrenamiento intermedios, lo que puede confundir al descargar el modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhostScientist/jev-decisions-v2-model
- Dataset de entrenamiento: https://huggingface.co/datasets/GhostScientist/jev-decisions-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de TRL: https://github.com/huggingface/trl
- Panel de seguimiento del entrenamiento (trackio): https://huggingface.co/spaces/GhostScientist/huggingface-static-f915d1
