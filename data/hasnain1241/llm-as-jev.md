# Hasnain1241/llm-as-jev

## Resumen

LLM-as-Jev es un ajuste fino completo (full fine-tune) del modelo Qwen3-0.6B de Alibaba, desarrollado por el usuario Hasnain1241 y publicado en Hugging Face bajo licencia Apache 2.0. El modelo no esta disenado para generar texto libre, sino para una tarea muy concreta: dada una lista de opciones numeradas `[1] ... [K]`, devolver una distribucion de probabilidad calibrada sobre cual es la respuesta correcta. Para ello se prellena la respuesta con la cadena `Best answer: [` y se puntua cada candidato k como la log-probabilidad del sufijo `k]`, aplicando despues una softmax sobre esas puntuaciones.

El modelo resuelve un problema clasico en la evaluacion automatica con LLM: la escasa calibracion de las probabilidades cuando se pide al modelo que elija entre opciones. Segun los datos de la model card, el ajuste reduce el error de calibracion esperado (ECE) macro externo de 0,2624 a 0,1178 y el Brier macro de 0,6523 a 0,5303, manteniendo cero fallos de parseo en modo texto sobre 350 muestras. Es relevante para pipelines de evaluacion, enrutamiento de decisiones y anotacion asistida donde importa no solo la etiqueta elegida sino la confianza asociada.

Con 596.049.920 parametros reales (segun safetensors) y un repositorio de 7,2 GB, se trata de un modelo pequeno que puede ejecutarse en hardware modesto. La longitud de contexto heredada de Qwen3-0.6B no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 600 millones de parametros, y aplica un ajuste fino completo (no LoRA) sobre el. La innovacion no esta en la arquitectura, que se mantiene intacta, sino en el objetivo de entrenamiento y en el protocolo de inferencia: el prompt enumera las opciones como `[1] ... [K]`, la respuesta se prellena con `Best answer: [` y el modelo puntua el sufijo `k]` de cada candidato. Las probabilidades finales son la softmax de esas log-probabilidades, lo que convierte al modelo en un clasificador calibrado sobre conjuntos de opciones de tamano variable.

El entrenamiento se realizo sobre Reason-9k, descrito como 9 conjuntos de 1.000 ejemplos cada uno. La funcion de perdida combina una verosimilitud restringida por arbol (tree-restricted likelihood) con anclajes de masa, salida y posicion respecto al modelo base congelado, usando truncacion top-64. El optimizador fue AdamW con learning rate 5e-6 y batch global de 32. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada de los datos ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Clasificacion multiple-choice con distribucion de probabilidad calibrada sobre K opciones numeradas.
- Puntuacion de confianza por candidato mediante softmax de log-probabilidades, apta para umbrales y abstención.
- Evaluacion de respuestas en pipelines de LLM-as-a-judge con opciones discretas.
- Modo texto con cero fallos de parseo documentados sobre 350 muestras.
- Razonamiento limitado al formato de seleccion; no esta orientado a generacion abierta.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion automatica de respuestas de LLM: el modelo recibe la pregunta, la respuesta candidata y un conjunto de etiquetas de calidad numeradas, y devuelve una distribucion calibrada que permite ordenar respuestas y aplicar umbrales de confianza en lugar de depender de una unica etiqueta.
- Enrutamiento de intenciones en asistentes conversacionales: con las intenciones del sistema listadas como `[1] ... [K]`, el modelo produce la probabilidad de cada una, lo que facilita logica de derivacion a humano cuando la confianza maxima cae por debajo de un umbral.
- Clasificacion de tickets de soporte: los datos de Banking77 muestran una precision de 0,6026 tras el ajuste frente a 0,1847 sin ajuste, lo que lo hace util para categorizar consultas bancarias en un conjunto fijo de clases.
- Anotacion asistida con control de calidad: al devolver probabilidades calibradas (ECE de 0,1201 en Banking77), permite priorizar para revision humana las muestras con mayor incertidumbre.
- Seleccion de variantes en generacion controlada: dado un conjunto de borradores numerados, el modelo puntua cual es preferible segun el criterio descrito en el prompt, integrable en pipelines de reranking.
- Investigacion sobre calibracion: sirve como referencia reproducible para estudiar tecnicas de anclaje a un modelo base congelado y truncacion top-64 en tareas de decision.
- Filtrado de seguridad o politica de contenido: con categorias de riesgo numeradas, la salida probabilistica permite fijar politicas de bloqueo graduadas en lugar de decisiones binarias.

## Benchmarks y rendimiento

| Metrica | Sin ajuste (training-free) | Ajustado (fine-tuned) |
|---|---|---|
| Precision macro externa (6 conjuntos) | 0,5531 | 0,5729 |
| ECE macro externo | 0,2624 | 0,1178 |
| Brier macro externo | 0,6523 | 0,5303 |
| Precision en Banking77 | 0,1847 | 0,6026 |
| ECE en Banking77 | 0,4597 | 0,1201 |
| Fallos de parseo en modo texto | 0 | 0 |
| Muestras en modo texto | 350 | 350 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica 2-3 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6-1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,3-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 y H100 estan sobredimensionadas para este tamano.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida en cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y en principio llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLM-as-Jev (Qwen3-0.6B fine-tune) | 596 M | no disponible | Clasificacion multiple-choice calibrada | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| Otros fine-tunes de Qwen3-0.6B para clasificacion | variable | no disponible | Clasificacion / routing | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas especificas en la informacion proporcionada; la unica comparacion documentada es contra el propio modelo base sin ajuste.

## Limitaciones y advertencias

- El modelo solo opera en el formato de opciones numeradas `[1] ... [K]` con prelleno de respuesta; fuera de ese protocolo su comportamiento no esta garantizado.
- La precision macro externa de 0,5729 es modesta en terminos absolutos: el modelo esta mas orientado a la calibracion que a la exactitud bruta.
- La mejora en precision depende fuertemente del conjunto: en Banking77 el salto es grande (0,1847 a 0,6026), pero en los seis conjuntos externos es de solo 2 puntos porcentuales.
- No se documentan idiomas soportados; el rendimiento en castellano o en tareas multilingues es desconocido.
- Riesgo de alucinacion en la seleccion cuando las opciones no cubren la respuesta correcta: el modelo siempre devuelve una distribucion sobre las K opciones, sin opcion explicita de "ninguna".
- No se documentan sesgos especificos, pero al derivar de Qwen3-0.6B hereda los sesgos del corpus de entrenamiento del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 12 descargas y 0 likes, por lo que su validacion externa es practicamente nula.
- El repositorio ocupa 7,2 GB, desproporcionado para 596 M de parametros, lo que sugiere la presencia de checkpoints u otros artefactos adicionales que conviene inspeccionar antes de desplegar.
- No se documentan cuantizaciones oficiales; cualquier conversion a GGUF o AWQ corre a cargo del usuario y puede alterar la calibracion de las probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hasnain1241/llm-as-jev
- Codigo: https://github.com/hasnain1241/llm-as-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
