# marcusnogueira/llama-guard-3-1b-smoothquant-w8a8

## Resumen

`marcusnogueira/llama-guard-3-1b-smoothquant-w8a8` es un checkpoint cuantizado a INT8 (W8A8) del modelo de seguridad `meta-llama/Llama-Guard-3-1B` de Meta, publicado por el usuario marcusnogueira. No se trata de un modelo nuevo ni de un fine-tuning adicional: es una cuantizacion post-entrenamiento del guardrail de 1B de parametros, fijada a la revision inmutable `acf7aafa60f0410f8f42b1fa35e077d705892029`. El objetivo es reducir el coste de memoria y computo del clasificador de seguridad manteniendo el comportamiento de clasificacion safe/unsafe, de modo que pueda desplegarse en produccion con vLLM sin necesidad de cuantizar en tiempo de ejecucion.

El modelo hereda la funcion de Llama Guard 3-1B: clasificar contenido en entradas de LLM (clasificacion de prompt) y en salidas de LLM (clasificacion de respuesta), generando texto que indica si el contenido es seguro o no y, en caso negativo, la categoria de riesgo segun la taxonomia de Llama Guard 3. Al ser un derivado directo de Llama 3.2-1B, su arquitectura es un transformer decoder-only de aproximadamente 1.5B de parametros (1.498.482.688 reales), con un repositorio de 2,0 GB.

La relevancia de este checkpoint es practica: la cuantizacion W8A8 con SmoothQuant y GPTQ reduce el peso de los pesos a 8 bits y aplica INT8 dinamico por token en las activaciones, y la serializacion con `compressed-tensors` permite que vLLM cargue la configuracion directamente. Esto lo hace candidato para guardrails de bajo coste y baja latencia, incluidos escenarios en ingles y portugues, aunque el autor no ha publicado todavia resultados de benchmarks ni datos de rendimiento medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.2-1B, fine-tuned como guardrail) |
| Parametros totales | 1.498.482.688 (~1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos INT8, activaciones INT8 dinamicas por token; SmoothQuant (alpha = 0.5) + GPTQ; KV cache sin cuantizar |
| Idiomas soportados | Ingles (en), portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors, serializacion `compressed-tensors` 0.12.2 |

## Arquitectura y entrenamiento

El checkpoint parte de `meta-llama/Llama-Guard-3-1B`, que a su vez es un Llama-3.2-1B fine-tuneado para clasificacion de seguridad. La arquitectura es, por tanto, un transformer decoder-only denso de ~1,5B de parametros, sin mezcla de expertos ni componentes SSM. La unica transformacion aplicada en este repositorio es la cuantizacion: SmoothQuant con fuerza de suavizado `alpha = 0.5` para migrar la dificultad de cuantizacion de las activaciones hacia los pesos, seguida de GPTQ como cuantizador W8A8. Se cuantizan todas las capas lineales excepto `lm_head`; el dtype de origen y de los modulos no cuantizados es BF16. La cuantizacion del KV cache esta deshabilitada. La implementacion usa `llmcompressor==0.8.1` y la serializacion `compressed-tensors==0.12.2`.

La calibracion se realizo con 500 muestras congeladas (250 en ingles y 250 en portugues) procedentes del dataset C4 (revision `1588ec454efa1a09f29cd18ddd04fe05fc8653a2`), en formato de texto crudo, sin plantillas de chat especificas del modelo, con longitud maxima de secuencia de 2048 tokens y semilla aleatoria 42. El SHA-256 de la calibracion es `65ea2fdb18470289314defc0fb94e27d4877b62143569615a1ce01745607ce1f`. No se documento ningun entrenamiento adicional, RLHF ni DPO sobre el modelo base: el unico proceso es la cuantizacion post-entrenamiento.

## Capacidades

- Clasificacion de seguridad de prompts de entrada (prompt classification) y de respuestas de LLM (response classification).
- Generacion de etiquetas textuales safe/unsafe y, cuando el contenido es inseguro, de la categoria de riesgo correspondiente a la taxonomia de Llama Guard 3.
- Funcionamiento como LLM generativo de clasificacion, no como clasificador de cabecera: produce la decision en texto.
- Soporte bilingue declarado en ingles y portugues, tanto en el modelo base como en el conjunto de calibracion de la cuantizacion.
- Inferencia eficiente: pesos INT8 y activaciones INT8 dinamicas por token, con el KV cache en BF16 y dtype de computo BF16 en el runtime validado.
- Compatibilidad directa con vLLM mediante la configuracion serializada de `compressed-tensors`, sin cuantizacion on-the-fly.
- No dispone de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking: no son capacidades del modelo base ni se han anadido en este checkpoint.

## Casos de uso

- Moderacion de entradas en aplicaciones de chat: el guardrail evalúa cada prompt de usuario antes de enviarlo al LLM principal y devuelve safe/unsafe con la categoria de riesgo, actuando como primera barrera del pipeline.
- Moderacion de salidas de LLM: filtrar la respuesta generada por el modelo de produccion antes de mostrarla al usuario, lo que permite bloquear contenido inseguro sin modificar el modelo generador.
- Plataformas en portugues: al estar calibrado con 250 muestras en portugues, es utilizable como guardrail para comunidades lusofonas, un caso menos cubierto por los guardrails entrenados solo en ingles.
- Despliegue en entornos con GPU limitada: con ~1,5B de parametros en INT8, cabe en GPUs de consumo y en instancias pequenas, lo que permite mantener el clasificador de seguridad co-localizado con el modelo servido.
- Pre-filtrado por lotes de datasets: clasificar grandes volumenes de prompts o respuestas ya generadas antes de usarlos en entrenamiento o evaluacion, gracias al bajo coste por inferencia del checkpoint INT8.
- Red teaming y evaluacion de seguridad: usar el modelo como juez automatico de seguridad en pruebas de robustez frente a jailbreaks, comparando la etiqueta producida con la esperada.
- Guardrail en sistemas RAG: interponer el clasificador entre la consulta del usuario y la recuperacion de documentos, y tambien sobre la respuesta final, para cubrir ambos extremos del pipeline.
- Servicio de moderacion como microservicio: exponer el modelo detras de una API HTTP con vLLM, de modo que multiples aplicaciones internas compartan un unico punto de moderacion de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de clasificacion, latencia ni throughput; unicamente documenta que el checkpoint paso cuatro casos de prueba fijos (safe/unsafe, en ingles y portugues) con vLLM 0.31.0 sobre una NVIDIA A40, y que el proveedor no aplico cuantizacion en tiempo de ejecucion.

| Benchmark | Resultado |
|---|---|
| Metricas de clasificacion (precision, recall, F1) | No disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No disponible |
| Latencia y throughput medidos | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB es una estimacion razonable para pesos INT8 (~1,5 GB) mas activaciones y cache KV en BF16 con secuencias cortas; el repositorio ocupa 2,0 GB. No es un dato publicado por el autor.
- GPU validadas por el autor: NVIDIA A40, con vLLM 0.31.0 y dtype de computo BF16.
- Cabe en GPU de consumo: si, el modelo es apto para GPUs de gama media y alta con 8 GB o mas, como RTX 3060, RTX 3070, RTX 4060 Ti, RTX 4070 y RTX 4090, asi como en GPUs profesionales tipo A100 o H100, donde quedaria ampliamente sobredimensionada la memoria.
- Opciones de despliegue: vLLM es la ruta validada explicitamente por el autor con la configuracion `compressed-tensors`; tambien es compatible con cualquier runtime que soporte el formato `compressed-tensors` para W8A8. No se ha publicado version GGUF, por lo que llama.cpp u Ollama requeririan una conversion no incluida en el repositorio.
- Nota de entorno: la validacion uso vLLM 0.31.0, que incluye un build de PyTorch para CUDA 13.0, sobre un host con driver CUDA 12.8; fue necesario el paquete de compatibilidad `cuda-compat-13-0` de NVIDIA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| marcusnogueira/llama-guard-3-1b-smoothquant-w8a8 | ~1,5B | INT8 W8A8 (SmoothQuant + GPTQ) | en, pt | safetensors / compressed-tensors | No disponible | Checkpoint objeto de esta ficha; validado en vLLM 0.31.0 |
| meta-llama/Llama-Guard-3-1B | ~1,5B | BF16 (sin cuantizar) | No disponible en la informacion recogida | safetensors | Sujeta a la licencia de Llama 3.2 (no confirmada en la informacion disponible) | Modelo base sobre el que se construye este checkpoint |
| marcusnogueira/llama-guard-3-1b-gptq-8bit | ~1,5B | GPTQ 8 bits, group size 128 | en, pt | No disponible en la informacion recogida | No disponible | Variante hermana del mismo autor, calibrada con las mismas 500 muestras (250 en + 250 pt) de allenai/c4 |
| Llama Guard 3-11B-vision | 11B | No disponible | No disponible | No disponible | No disponible | Variante multimodal (texto + imagen) de la misma familia, para evaluacion de contenido con imagenes |

La comparacion con alternativas de moderacion no pertenecientes a la familia Llama Guard (por ejemplo clasificadores dedicados de seguridad) no esta disponible en la informacion recogida, por lo que no se incluye.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas de este checkpoint; el unico respaldo empirico documentado son cuatro casos de prueba cualitativos en vLLM.
- La cuantizacion W8A8 puede degradar la precision de clasificacion respecto al modelo base en BF16, especialmente en casos limite o en categorias de riesgo poco representadas en las 500 muestras de calibracion. No hay datos publicados que cuantifiquen esa perdida.
- La calibracion se hizo con texto crudo de C4, sin plantillas de chat de Llama Guard: si el uso real se hace con la plantilla de conversacion del guardrail, la distribucion de activaciones puede diferir de la usada en la calibracion.
- El conjunto de calibracion solo cubre ingles y portugues (250 muestras por idioma); el comportamiento en otros idiomas no esta respaldado por esta calibracion.
- Al ser un clasificador de seguridad, el modelo puede producir falsos negativos (contenido inseguro marcado como safe) y falsos positivos (contenido legitimo marcado como unsafe). No debe ser el unico mecanismo de control en produccion.
- La licencia no esta declarada en el repositorio. El modelo base de Meta esta sujeto a la licencia de la comunidad de Llama 3.2, con condiciones especificas para uso comercial y clausulas de atribucion; conviene verificar la licencia aplicable antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes, y no cuenta con pipeline declarado: es un artefacto reciente y sin adopcion verificable por la comunidad.
- El despliegue requiere un runtime que entienda la serializacion `compressed-tensors` para W8A8; no hay GGUF ni formato alternativo publicado.
- El KV cache se deja sin cuantizar, de modo que el consumo de memoria crece con la longitud de secuencia segun el comportamiento estandar del transformer base.
- La fecha de creacion y actualizacion registrada del repositorio es octubre de 2026, posterior a la fecha de referencia habitual de los modelos de la familia Llama 3.2; se reporta tal cual figura en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcusnogueira/llama-guard-3-1b-smoothquant-w8a8
- Perfil del autor: https://huggingface.co/marcusnogueira
- Variante hermana GPTQ 8 bits: https://huggingface.co/marcusnogueira/llama-guard-3-1b-gptq-8bit
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Documentacion de Llama Guard 3 de Meta: https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama-guard-3
- Catalogo de modelos de Microsoft Foundry para Llama-Guard-3-1B: http://ai.azure.com/catalog/models/Llama-Guard-3-1B
- Repositorio PurpleLlama (Llama Guard 3): https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard3/README.md
