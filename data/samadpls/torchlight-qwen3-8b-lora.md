# samadpls/torchlight-qwen3-8b-lora

## Resumen

torchlight-qwen3-8b-lora es un adaptador LoRA en formato PEFT desarrollado por Abdul Samad (samadpls) sobre el modelo base Qwen/Qwen3-8B, un transformer denso de 8.200 millones de parametros. El adaptador esta especializado en responder preguntas tecnicas sobre PyTorch, con un enfasis explicito en depuracion de codigo y en la resolucion de errores tipicos de entrenamiento e inferencia. Se entreno sobre 6.902 hilos reales del foro oficial de PyTorch (discuss.pytorch.org), tomando como respuesta de referencia el post que efectivamente resolvio cada hilo.

La propuesta diferencial del modelo no es tanto la calidad bruta de sus respuestas como su comportamiento calibrado: se le entreno para no adivinar. Cuando la pregunta contiene suficiente informacion, sugiere una correccion concreta; cuando no la contiene, pide el codigo o el traceback completo en lugar de inventar una solucion. Este comportamiento se evaluo con 163 preguntas del foro posteriores a la fecha de corte de entrenamiento de Qwen3-8B, y los resultados muestran una reduccion de respuestas incorrectas a la mitad (del 31 % al 15 %) respecto al modelo base, a costa de respuestas mucho mas breves (mediana de 42 tokens frente a 1.024 del base).

El adaptador entrena solo 43,6 millones de parametros y se entreno en 4,1 horas sobre una unica GPU Tesla T4 en Kaggle, lo que lo convierte en un ejemplo de bajo coste de especializacion vertical sobre un modelo generalista. Es relevante ahora porque demuestra que un ajuste fino pequeno y bien dirigido puede mejorar la fiabilidad en un dominio tecnico concreto, aunque tambien ilustra el trade-off entre precision y exhaustividad cuando el dataset de entrenamiento imita el estilo breve de un foro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) con adaptador LoRA/PEFT |
| Parametros totales | 8.200 millones (modelo base); 43,6 millones entrenados en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; la version GGUF del modelo completo ofrece Q4_K_M y Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); existen versiones completas en 16 bits y GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso de tipo decoder-only con 8.200 millones de parametros. El ajuste se realizo con LoRA mediante la libreria Unsloth, entrenando unicamente 43,6 millones de parametros, lo que representa aproximadamente el 0,53 % del total del modelo base. El adaptador se distribuye en formato PEFT y puede fusionarse con el modelo base mediante `merge_and_unload()`.

El dataset de entrenamiento, samadpls/torchlight-threads, contiene 6.902 conversaciones extraidas del foro de PyTorch. La mayoria de las respuestas objetivo son el post que resolvio el hilo, con una autoria predominante del usuario ptrblck, y el resto de ejemplos ensenan al modelo a solicitar informacion faltante. El entrenamiento se ejecuto en una sola Tesla T4 durante 4,1 horas. El adaptador se entreno con el modo thinking desactivado, por lo que la plantilla de chat debe invocarse con `enable_thinking=False`, y con un system prompt concreto que conviene replicar en produccion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional orientada a preguntas tecnicas sobre PyTorch.
- Depuracion de codigo: identificacion de errores de forma de tensores, dispositivos, tipos de datos y grafos de computo.
- Solicitud activa de informacion faltante: pide codigo o traceback completo cuando la pregunta es ambigua (3 de 4 casos en la evaluacion).
- Respuestas breves y directas, con una mediana de 42 tokens, imitando el estilo del foro.
- Generacion de codigo que utiliza exclusivamente APIs reales de PyTorch en los casos evaluados (11 de 11 respuestas).
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking activo.

## Casos de uso

- Asistente de depuracion en foros y comunidades tecnicas: el modelo puede gestionar hilos de soporte sobre PyTorch respondiendo en el estilo conciso del foro y solicitando el traceback cuando la descripcion del problema es insuficiente, lo que reduce respuestas especulativas.
- Bot de soporte interno para equipos de machine learning: integrado en Slack o Discord, responde dudas recurrentes sobre errores de CUDA, formas de tensores y DataLoaders, con la ventaja de que pide contexto antes de proponer una solucion incorrecta.
- Generacion de borradores de respuesta para mantenedores de proyectos: el modelo produce una primera respuesta breve que el mantenedor revisa y amplia, ahorrando tiempo en la triage de issues tecnicos.
- Documentacion interactiva de PyTorch: como capa conversacional sobre la documentacion oficial, respondiendo preguntas concretas con fragmentos de codigo que usan APIs reales de la libreria.
- Filtrado y clasificacion de preguntas entrantes: al estar entrenado para detectar informacion faltante, puede usarse como primer clasificador que marque las preguntas que necesitan mas datos antes de escalar a un humano.
- Evaluacion comparativa de asistentes tecnicos: sirve como referencia de ajuste fino de bajo coste para medir el impacto de LoRA sobre un modelo base de 8B en tareas de dominio especifico.
- Formacion de nuevos usuarios de PyTorch: respuestas cortas y directas que explican la causa del error sin divagaciones, adecuadas para entornos de aprendizaje.

## Benchmarks y rendimiento

Evaluacion sobre 163 preguntas del foro de PyTorch publicadas entre 2025-04-01 y 2026-10-08, posteriores al corte de entrenamiento de Qwen3-8B. Juez: Claude Opus 5.5, puntuacion de 1 a 5 comparando con la respuesta que resolvio el hilo.

| Modelo | Nota media (sobre 5) | Respuestas con 4 o 5 | Respuestas incorrectas (nota 1) | Codigo solo con APIs reales | Pide detalles cuando faltan | Pide detalles sin necesidad |
|---|---|---|---|---|---|---|
| Phi-4-mini (base) | 1,96 | 5 % | 33 % | 108 de 109 | 0 de 4 | 1 % |
| torchlight-phi4-mini (ajustado) | 2,09 | 8 % | 16 % | 5 de 5 | 0 de 4 | 5 % |
| Qwen3-8B (base) | 2,17 | 17 % | 31 % | 114 de 120 | 0 de 4 | 1 % |
| torchlight-qwen3-8b (ajustado) | 2,25 | 9 % | 15 % | 11 de 11 | 3 de 4 | 13 % |

Observaciones reportadas por el autor: la reduccion de respuestas incorrectas del 31 % al 15 % es estadisticamente significativa (p < 0,001); la mejora media de 2,17 a 2,25 no alcanza significacion estadistica (intervalo del 95 %: -0,09 a +0,23); el porcentaje de respuestas con nota 4 o 5 baja del 17 % al 9 % (p = 0,02), atribuido a que el ajuste aprendio el estilo breve del foro frente a las respuestas largas del modelo base.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB en disco; requiere cargar el modelo base Qwen3-8B completo para la inferencia.
- VRAM estimada para el modelo base en 16 bits: en torno a 16-17 GB, mas overhead de contexto y activaciones.
- VRAM estimada con cuantizacion Q8_0: aproximadamente 9-10 GB; con Q4_K_M: aproximadamente 5-6 GB.
- GPU recomendadas para 16 bits: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen ajustado.
- Cabe en GPU de consumo: RTX 4090 y RTX 3090 en 16 bits con contexto moderado; RTX 4070 Ti, RTX 4080 y GPUs de 8-12 GB mediante las versiones GGUF Q4_K_M o Q8_0.
- Opciones de despliegue: transformers + PEFT para el adaptador, vLLM o TGI para el modelo completo fusionado, llama.cpp, Ollama y LM Studio para los ficheros GGUF, y mlx-lm para el modelo completo en Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en una Tesla T4 en 4,1 horas, dato que no equivale a rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| torchlight-qwen3-8b-lora | 8,2 B (43,6 M entrenados) | No disponible | Soporte PyTorch, respuestas breves | Apache-2.0 | HuggingFace (adaptador, completo y GGUF) |
| Qwen3-8B | 8,2 B | No disponible | Proposito general | Apache-2.0 | HuggingFace |
| torchlight-phi4-mini | No disponible en la informacion | No disponible | Soporte PyTorch sobre Phi-4-mini | No disponible en la informacion | HuggingFace |
| Phi-4-mini-instruct | No disponible en la informacion | No disponible | Proposito general, razonamiento | No disponible en la informacion | HuggingFace |

En la evaluacion del autor, torchlight-qwen3-8b supera a Qwen3-8B en nota media (2,25 frente a 2,17) y reduce las respuestas incorrectas (15 % frente a 31 %), pero obtiene menos respuestas completas de alta calidad (9 % frente a 17 %). Frente a torchlight-phi4-mini, la version sobre Qwen3-8B es superior tanto en el modelo base como tras el ajuste.

## Limitaciones y advertencias

- Sesgo de estilo: el ajuste imita el formato breve del foro (mediana de 42 tokens), lo que reduce la tasa de respuestas completas con nota 4 o 5 (9 % frente al 17 % del base).
- Tasa de falsos positivos al pedir informacion: solicita detalles innecesarios en el 13 % de las preguntas que no lo requieren.
- Riesgo de alucinacion reducido pero no eliminado: el 15 % de las respuestas evaluadas fueron calificadas como incorrectas.
- Idioma: solo entrenado en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Dominio estrecho: especializado en PyTorch; su comportamiento fuera de ese ambito depende del modelo base y no ha sido evaluado.
- Modo thinking: el adaptador se entreno con thinking desactivado; usar `enable_thinking=True` puede degradar la calidad de las respuestas.
- Dependencia del system prompt: el modelo fue entrenado con un system prompt concreto que debe replicarse para obtener el comportamiento esperado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B y del dataset de origen (contenido de un foro publico).
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente de los resultados reportados por el autor.
- Inconsistencias en la model card: la insignia del README referencia Phi-4-mini-instruct y una licencia MIT, en contradiccion con los metadatos (Qwen3-8B y Apache-2.0).

## Enlaces

- Modelo en HuggingFace (adaptador LoRA): https://huggingface.co/samadpls/torchlight-qwen3-8b-lora
- Modelo completo en 16 bits: https://huggingface.co/samadpls/torchlight-qwen3-8b
- Version GGUF (Q4_K_M, Q8_0): https://huggingface.co/samadpls/torchlight-qwen3-8b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/samadpls/torchlight-threads
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de codigo: https://github.com/samadpls/torchlight
- Foro de PyTorch (origen de los datos): https://discuss.pytorch.org
- Perfil del autor: https://samadpls.com
