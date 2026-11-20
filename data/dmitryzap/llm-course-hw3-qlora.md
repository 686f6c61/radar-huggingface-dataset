# DmitryZap/llm-course-hw3-qlora

## Resumen

DmitryZap/llm-course-hw3-qlora es un adaptador LoRA (concretamente QLoRA) publicado en Hugging Face por el usuario DmitryZap, aparentemente como entrega de un trabajo practico de un curso sobre modelos de lenguaje. No es un modelo fundacional, sino un ajuste fino del modelo base HuggingFaceTB/SmolLM2-360M-Instruct orientado a una tarea concreta: clasificacion de sentimiento en tuits en ingles en tres clases (`negative`, `neutral`, `positive`). El adaptador se distribuye en formato PEFT y debe cargarse sobre la base para funcionar.

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360 millones de parametros desarrollado por Hugging Face, disenado para ejecutarse en entornos con recursos limitados. Sobre el se aplico un entrenamiento QLoRA: la base se carga en 4 bits NF4 con doble cuantizacion, y unicamente se entrenan los pesos del adaptador LoRA (rango 16, alpha 32, dropout 0.05). El entrenamiento se realizo durante una sola epoca sobre 12.000 tuits del dataset TweetEval Sentiment, 4.000 por clase, con un tamano de lote efectivo de 48.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion o la produccion: se trata de un artefacto educativo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicos mas alla de la metrica F1 de la propia tarea. Resulta util, eso si, como ejemplo reproducible de un pipeline QLoRA completo (cuantizacion, entrenamiento del adaptador, evaluacion y despliegue con `peft` y `transformers`) y como referencia de las limitaciones de un ajuste fino de una sola epoca sobre un modelo de 360M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2-360M-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 360M en la base; el adaptador LoRA no especifica su numero de parametros (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); requiere cargar la base por separado |
| Libreria | `peft` (compatible con `transformers` y `bitsandbytes`) |
| Dataset de entrenamiento | `cardiffnlp/tweet_eval` (configuracion sentiment), 12.000 ejemplos |
| Hiperparametros LoRA | Rango 16, alpha 32, dropout 0.05, 1 epoca, batch efectivo 48 |
| Tarea | Clasificacion de sentimiento en tres clases |

## Arquitectura y entrenamiento

El adaptador se monta sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros con atencion causal estandar y plantilla de chat instructiva. El entrenamiento emplea QLoRA: la base se cuantiza a 4 bits en formato NF4 con doble cuantizacion, lo que reduce drasticamente la huella de memoria, mientras que los pesos del adaptador LoRA se entrenan en precision completa. Se eligio rango 16 y alpha 32 (escala 2x), con dropout 0.05 para regularizar, y un tamano de lote efectivo de 48 sobre una unica epoca.

Los datos provienen de TweetEval Sentiment, con 12.000 tuits balanceados (4.000 por clase). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineamiento adicionales; el ajuste es supervisado y orientado a la tarea. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La generacion se realiza con `do_sample=False` (decodificacion greedy) y un maximo de 16 tokens nuevos, suficiente para emitir una etiqueta.

## Capacidades

- Clasificacion de sentimiento en ingles en tres clases: `negative`, `neutral`, `positive`.
- Generacion de texto conversacional heredada de SmolLM2-360M-Instruct (formato chat con roles `system`/`user`).
- Interpretacion de jerga y sarcasmo a nivel basico, segun el prompt de sistema del autor.
- Respuesta restringida a una unica etiqueta en minusculas cuando se usa el prompt de sistema recomendado.
- No soporta tool calling ni function calling de forma documentada.
- No soporta razonamiento multi-paso ni modo "thinking" documentado.
- No soporta vision ni audio.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Clasificacion de sentimiento en redes sociales: el adaptador se aplica sobre SmolLM2-360M-Instruct para etiquetar tuits en ingles como positivos, negativos o neutros, con un F1 macro de 0,6789 en la evaluacion del autor. Adecuado para prototipos de monitorizacion de marca o analisis de opinion a pequena escala.
- Filtrado de comentarios en comunidades online: permite pre-etiquetar comentarios y priorizar la moderacion humana en funcion del sentimiento detectado, con un coste computacional minimo al ejecutarse sobre una GPU de consumo.
- Analisis de encuestas abiertas: procesar respuestas cortas en ingles y agregar la polaridad para obtener metricas de satisfaccion, aprovechando la ventana de contexto del modelo base.
- Ejemplo docente de pipeline QLoRA: sirve como referencia reproducible para cursos de ajuste fino, ya que el autor publica el notebook de entrenamiento y evaluacion.
- Baseline para comparativas: util como punto de partida ligero frente a clasificadores dedicados (por ejemplo, modelos tipo RoBERTa afinados para TweetEval) en experimentos academicos.
- Despliegue en entornos con recursos muy limitados: al combinar una base de 360M en 4 bits con un adaptador pequeno, puede ejecutarse en GPUs de gama baja o incluso en CPU con cuantizacion adicional, aunque la latencia no esta documentada.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion del autor sobre el split de test de TweetEval Sentiment (12.284 tuits). La metrica F1 "de la formula del trabajo" (que incluye la clase `invalid` para respuestas sin etiqueta valida) paso de 0,1521 a 0,5092. El F1 medio sobre las tres clases reales es 0,6789. Se registro un unico respuesta clasificada como `invalid`.

| Metrica | Valor |
|---|---|
| F1 (formula del trabajo, con `invalid`) antes del ajuste | 0,1521 |
| F1 (formula del trabajo, con `invalid`) despues del ajuste | 0,5092 |
| F1 medio sobre las tres clases | 0,6789 |
| F1 clase `negative` | 0,7333 |
| F1 clase `neutral` | 0,6192 |
| F1 clase `positive` | 0,6843 |
| F1 clase `invalid` | 0,0000 |
| Respuestas `invalid` | 1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la base en 4 bits NF4 ocupa aproximadamente 0,2 GB de pesos; con overhead de activaciones y contexto, cabe holgadamente en GPUs con 4 GB o mas. El adaptador anade un consumo marginal.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). El ejemplo del autor requiere CUDA y usa `bfloat16` si esta disponible, con fallback a `float16`.
- GPU de gama alta (A100, H100, RTX 4090): innecesarias para este modelo; el cuello de botella sera el lanzamiento de kernels, no la memoria.
- CPU: es posible ejecutar la base en CPU con cuantizacion adicional (por ejemplo, GGUF via llama.cpp), pero el autor no documenta este camino y el adaptador PEFT no se distribuye en GGUF.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (ruta documentada); vLLM, TGI, llama.cpp y Ollama no estan documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DmitryZap/llm-course-hw3-qlora | 360M (base) + adaptador LoRA | No disponible | Clasificacion de sentimiento en tuits (3 clases) | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM2-360M-Instruct (base) | 360M | No disponible en esta ficha | Generacion de texto instructiva general | Apache 2.0 | Hugging Face (ampliamente usado) |
| Clasificador dedicado tipo RoBERTa-base afinado en TweetEval | ~125M | 512 tokens (tipico) | Clasificacion de sentimiento en tuits | MIT / Apache 2.0 segun variante | Hugging Face |
| Modelos generativos mayores (por ejemplo, Llama 3.2 1B Instruct) | 1B+ | Mayor que el base | Generacion general y clasificacion via prompt | Licencia comunitaria | Hugging Face |

La comparativa cuantitativa con clasificadores dedicados no esta disponible en la informacion proporcionada; el autor solo reporta sus propias metricas antes y despues del ajuste.

## Limitaciones y advertencias

- Artefacto educativo: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- Entrenado con una sola epoca sobre 12.000 ejemplos; el F1 medio de 0,6789 es modesto y puede no generalizar a dominios distintos de Twitter.
- Solo ingles: no soporta otros idiomas, incluido el castellano.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo es generativo y puede emitir texto fuera de las etiquetas permitidas (el autor reporta 1 respuesta `invalid` en test).
- La metrica F1 "de la formula del trabajo" incluye la clase `invalid`, lo que penaliza respuestas mal formadas; conviene interpretar el 0,5092 con cautela frente al 0,6789 sobre las tres clases reales.
- Dependencia de la version exacta de la base: el autor fija el revision `a10cc1512eabd3dde888204e902eca88bddb4951` de SmolLM2-360M-Instruct; usar otra revision puede alterar el comportamiento.
- Requiere CUDA para la ruta de carga documentada (bitsandbytes 4 bits); el despliegue en CPU no esta soportado oficialmente por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion externa y de benchmarks estandar desaconseja su uso en produccion sin validacion previa.
- No hay informacion sobre sesgos especificos del adaptador; los sesgos del corpus TweetEval y del modelo base son heredados y no se documentan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DmitryZap/llm-course-hw3-qlora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset TweetEval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Notebook de entrenamiento y evaluacion: https://huggingface.co/DmitryZap/llm-course-hw3-lora/blob/main/HSU_hw3_peft.ipynb
- Metricas detalladas: https://huggingface.co/DmitryZap/llm-course-hw3-qlora/blob/main/metrics.json
