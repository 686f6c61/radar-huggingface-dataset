# marcusnogueira/llama-guard-3-8b-smoothquant-w8a8

## Resumen

`marcusnogueira/llama-guard-3-8b-smoothquant-w8a8` es un checkpoint cuantizado del modelo de guardrails `meta-llama/Llama-Guard-3-8B` de Meta, publicado por el usuario marcusnogueira. La cuantización aplica SmoothQuant (con fuerza de suavizado alpha = 0.5) combinada con GPTQ en esquema W8A8: pesos en INT8 y activaciones en INT8 dinámico por token, dejando fuera de la cuantización la capa `lm_head`. El objetivo es reducir el coste de memoria y cómputo del modelo de seguridad sin abandonar el formato de serialización `compressed-tensors`, que vLLM carga de forma nativa.

Llama Guard 3-8B es un clasificador de seguridad de entrada y salida para despliegues de LLM, basado en el preentrenamiento de Llama 3.1-8B y ajustado para clasificar contenido según las categorías de política de MLCommons. Este checkpoint conserva esa función y añade un componente de eficiencia: al ser INT8 W8A8, el peso del modelo baja a aproximadamente 8 GB, lo que facilita su despliegue en GPUs de gama profesional y de consumo alto.

El checkpoint incluye metadatos completos de cuantización, calibración (500 muestras, 250 en inglés y 250 en portugués, con longitud máxima de 2048 tokens y semilla 42) y evidencia de validación en vLLM 0.31.0 sobre una NVIDIA A40. Es relevante ahora porque permite integrar un guardrail de 8B en pipelines de moderación con menor huella de VRAM, manteniendo el soporte de dos idiomas (inglés y portugués).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con cuantizacion SmoothQuant + GPTQ W8A8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha del checkpoint; la calibracion se realizo con secuencias de hasta 2048 tokens. El modelo base Llama-Guard-3-8B deriva de Llama 3.1-8B |
| Tipos de cuantizacion | INT8 W8A8 (pesos INT8, activaciones INT8 dinamicas por token); KV cache sin cuantizar; dtype de computo en runtime: BF16 |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | No disponible en la informacion proporcionada; el modelo base Llama-Guard-3-8B se distribuye bajo la licencia comunitaria de Llama 3.1 |
| Formato de pesos | safetensors con serializacion `compressed-tensors` 0.12.2 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1-8B: un transformer decoder-only con atencion causal, normalizacion RMSNorm y embeddings rotatorios. No hay cambios estructurales respecto al modelo base; la intervencion es exclusivamente de cuantizacion post-entrenamiento. SmoothQuant se aplica para migrar la dificultad de cuantizacion de las activaciones hacia los pesos mediante una transformacion de escala con alpha = 0.5, y sobre esa version suavizada se ejecuta una cuantizacion GPTQ en W8A8. Se cuantizan todas las capas lineales salvo `lm_head`, y tanto los modulos de origen como los no cuantizados se mantienen en BF16.

El proceso de calibracion uso 500 muestras congeladas (250 en ingles y 250 en portugues), en formato de texto sin plantillas de chat especificas del modelo, con una longitud maxima de secuencia de 2048 tokens y semilla aleatoria 42. La fuente de calibracion fue C4 en una revision concreta y el hash SHA-256 del conjunto de calibracion esta documentado (`65ea2fdb18470289314defc0fb94e27d4877b62143569615a1ce01745607ce1f`). La herramienta empleada fue `llmcompressor==0.8.1` y la serializacion se hizo con `compressed-tensors==0.12.2`. No se documenta en la informacion disponible ninguna fase adicional de RLHF, DPO ni ajuste fino posterior a la cuantizacion.

## Capacidades

- Clasificacion de seguridad de entradas (prompt classification): determina si un prompt de usuario es seguro o no seguro.
- Clasificacion de seguridad de salidas (response classification): evalua la respuesta de un LLM y marca si es segura o no segura.
- Etiquetado de categorias de politica: cuando el contenido es no seguro, indica las categorias violadas segun el marco de MLCommons.
- Soporte multilingue limitado a ingles y portugues segun los metadatos del checkpoint.
- Integracion nativa con vLLM mediante `compressed-tensors`, sin necesidad de cuantizacion en tiempo de carga.
- Ejecucion en INT8 W8A8 con dtype de computo BF16, lo que reduce memoria de pesos frente al modelo base.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio: es un modelo de moderacion, no un modelo generativo de proposito general.

## Casos de uso

- Moderacion de prompts en produccion: el checkpoint se coloca delante de un LLM generativo para filtrar entradas de usuario; al ser un guardrail dedicado, la clasificacion es rapida y su salida estructurada permite decidir si se bloquea la peticion antes de invocar al modelo principal.
- Moderacion de respuestas del LLM: se ejecuta despues de generar la salida para detectar contenido no seguro y activar politicas de reescritura, bloqueo o escalado a revision humana.
- Despliegue con restricciones de VRAM: la version INT8 W8A8 reduce el peso a unos 8 GB, lo que permite alojar el guardrail junto al modelo generativo en GPUs de 24 GB o en nodos con varias cargas concurrentes.
- Aplicaciones en portugues: al haber sido calibrado con 250 muestras en portugues y declarar soporte `pt`, es adecuado para plataformas de moderacion dirigidas al mercado lusohablante.
- Auditoria y compliance de contenido: uso como capa de registro que etiqueta conversaciones por categoria de politica, util para informes de cumplimiento y revisiones internas.
- Pipelines de atencion al cliente: intercalado en flujos de chat multi-turno para bloquear solicitudes abusivas o respuestas inapropiadas antes de que lleguen al usuario final.
- Investigacion en cuantizacion: al documentar configuracion, hashes y evidencia de validacion, sirve como caso de estudio reproducible de SmoothQuant + GPTQ W8A8 sobre un modelo de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de rendimiento documentada es cualitativa: el checkpoint supero cuatro casos de prueba fijos (seguros y no seguros, en ingles y portugues) en BF16 con vLLM 0.31.0 sobre una NVIDIA A40, cargando la configuracion W8A8 de `compressed-tensors` sin cuantizacion en tiempo de ejecucion.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 8 GB en INT8 (8.030.261.248 parametros a 1 byte por parametro).
- VRAM total recomendada para inferencia: del orden de 12 a 16 GB, considerando activaciones, overhead del runtime y cache KV en BF16 (el KV cache no esta cuantizado).
- GPU validadas por el autor: NVIDIA A40 (prueba de humo con vLLM 0.31.0).
- GPU profesionales compatibles por memoria: A100 40 GB/80 GB, H100, L40S, A40.
- GPU de consumo: cabe en tarjetas con 16 GB o mas, como RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB), siempre que el runtime soporte `compressed-tensors` y el esquema W8A8.
- Opciones de despliegue: vLLM es la ruta validada; el formato `compressed-tensors` es el soportado nativamente. No se proporciona version GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion adicional.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota de entorno: la validacion se ejecuto con el paquete `cuda-compat-13-0` de NVIDIA, ya que vLLM 0.31.0 incluye una build de PyTorch con CUDA 13.0 mientras el driver del host exponia CUDA 12.8.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| llama-guard-3-8b-smoothquant-w8a8 | 8,03 B | INT8 W8A8 (SmoothQuant + GPTQ) | No especificada en la ficha | en, pt | No disponible | HuggingFace, formato compressed-tensors |
| meta-llama/Llama-Guard-3-8B | 8,03 B | BF16 sin cuantizar | No disponible en la informacion recogida | Multilingue (segun Meta) | Licencia comunitaria Llama 3.1 | HuggingFace |
| Llama Guard 3 1B | No disponible en la informacion recogida | BF16 sin cuantizar | No disponible | Multilingue (segun Meta) | Licencia comunitaria Llama 3.1 | HuggingFace |
| Llama Guard 3 11B-Vision | No disponible en la informacion recogida | BF16 sin cuantizar | No disponible | Multilingue (segun Meta) | Licencia comunitaria Llama 3.1 | HuggingFace |

La diferencia principal frente al checkpoint base es el esquema de cuantizacion: INT8 W8A8 reduce el peso a la mitad aproximadamente respecto a BF16, a cambio de una posible perdida de precision en la clasificacion que no esta cuantificada en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion tras la cuantizacion, por lo que se desconoce la degradacion exacta respecto al modelo en BF16.
- La calibracion se hizo con solo 500 muestras y secuencias de hasta 2048 tokens; el comportamiento fuera de ese rango no esta documentado.
- El soporte de idiomas declarado se limita a ingles y portugues; otros idiomas no estan cubiertos por los metadatos del checkpoint.
- La licencia del checkpoint no se especifica en la ficha; es imprescindible verificar la licencia del modelo base (Llama 3.1 Community License) antes de cualquier uso comercial.
- El KV cache no esta cuantizado, por lo que el ahorro de memoria se concentra en los pesos y no en el estado de atencion.
- No hay version GGUF ni soporte declarado para llama.cpp u Ollama; el despliegue esta practicamente ceñido a vLLM u otros runtimes que soporten `compressed-tensors`.
- Como todo modelo de moderacion, puede producir falsos positivos y falsos negativos, y su salida debe tratarse como una senal de politica, no como una verdad absoluta.
- El checkpoint tiene cero descargas y cero likes en el momento de la consulta, sin un historial de uso que respalde su robustez en produccion.
- La validacion se limita a cuatro casos de prueba de humo, lo que es una evidencia muy reducida para un despliegue en produccion.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/marcusnogueira/llama-guard-3-8b-smoothquant-w8a8
- Perfil del autor: https://huggingface.co/marcusnogueira
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Documentacion de Llama Guard 3 en Meta: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama-guard-3
- Repositorio PurpleLlama (README de Llama Guard 3 8B): https://github.com/meta-llama/PurpleLlama/blob/main/LlamaGuard3/8B/README.md
- Documentacion de Llama Guard 3 8B en langmart: https://langmart.ai/model-docs/models/meta-llama_llama-guard-3-8b.html
