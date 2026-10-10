# Bellido/qwen2.5-0.5b-cafeterias-uam-lora

## Resumen

El modelo `Bellido/qwen2.5-0.5b-cafeterias-uam-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` para responder preguntas sobre productos y precios de las cafeterías de la Universidad Autónoma de Madrid (UAM). Lo desarrolla el usuario Bellido como prueba de concepto para un taller sobre LoRA de Hugging Face, y no constituye una fuente oficial de precios. El adaptador se apoya en un modelo denso de arquitectura transformer decoder-only de aproximadamente 494 millones de parámetros y se distribuye bajo licencia Apache 2.0.

El problema que resuelve es muy acotado: especializar un modelo pequeño y de bajo coste para un dominio concreto (catálogo de precios de cafeterías) mediante fine-tuning eficiente en parámetros. En lugar de reentrenar el modelo completo, se entrena únicamente un conjunto reducido de matrices de bajo rango, algo que en este caso se completó en alrededor de un minuto y medio sobre una única GPU de consumo (NVIDIA RTX 3060 Ti). Esto demuestra que la técnica de LoRA permite crear asistentes de dominio en hardware modesto.

Su relevancia es principalmente didáctica y práctica: sirve como ejemplo reproducible de cómo pasar de un modelo instruct genérico en español a un asistente especializado con 1000 pares de pregunta y respuesta. Al ser un adaptador, no puede usarse de forma aislada, sino cargado junto al modelo base `Qwen2.5-0.5B-Instruct`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | Aproximadamente 494 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Hasta 128K tokens en la familia Qwen2.5 segun la informacion de busqueda; el dato especifico del modelo base 0.5B no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones habituales (GGUF, AWQ, GPTQ) no confirmadas en la informacion proporcionada |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-0.5B-Instruct: un transformer decoder-only causal de aproximadamente 494 millones de parametros, perteneciente a la familia Qwen2.5 de Alibaba, que incluye tamanos de 0.5B, 1.5B, 3B, 7B, 14B, 32B y 72B. Sobre esta base se entrena el adaptador mediante LoRA con la libreria PEFT, es decir, se congelan los pesos originales y se anaden matrices de bajo rango que se ajustan durante el entrenamiento. El repositorio ocupa 0.0 GB, lo que es coherente con un adaptador de pequeno tamano en lugar de un modelo completo.

El entrenamiento se realizo con el dataset `Bellido/cafeterias_uam_2026`, compuesto por 1000 pares de `question` y `answer` en espanol sobre productos y precios de las cafeterias de la UAM. Se llevo a cabo en una NVIDIA RTX 3060 Ti (entorno local) y duro aproximadamente un minuto y medio. No se especifica en la informacion proporcionada si hubo fases de RLHF, DPO, ni detalles sobre la composicion exacta del dataset, tokenizacion o hiperparametros de LoRA (rango, alfa, dropout). El uso del modelo se plantea mediante `AutoPeftModelForCausalLM` y la plantilla de chat (`apply_chat_template`) de Qwen2.5.

## Capacidades

- Generacion de texto conversacional en espanol mediante el formato de chat del modelo base.
- Respuesta a preguntas sobre productos y precios de las cafeterias de la UAM, su dominio especializado.
- Recuperacion de precios concretos dentro del catalogo para el que fue entrenado.
- Uso como asistente de dominio restringido con un `system prompt` personalizado.
- Capacidades heredadas del modelo base Qwen2.5-0.5B-Instruct (generacion general, comprension basica), aunque no verificadas especificamente para este adaptador.
- Soporte de tool calling, function calling o agentes: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; se trata de un modelo de solo texto.
- Modo de razonamiento extendido (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Consulta de precios de cafeteria: un asistente desplegado en un panel informativo o chat de la universidad responde a preguntas como "cuanto cuesta un cafe solo" recuperando el precio del catalogo entrenado.
- Taller formativo de LoRA: sirve como ejemplo practico y reproducible en un taller de Hugging Face para ensenar fine-tuning eficiente en parametros partiendo de un modelo de 0.5B.
- Prototipado rapido de asistentes de dominio: demuestra el flujo completo (dataset, entrenamiento con PEFT, publicacion del adaptador) reutilizable para otros catalogos similares (menu de comedores, tarifas de servicios).
- Base para experimentos academicos: punto de partida para comparar estrategias de fine-tuning en espanol sobre modelos pequenos en hardware de consumo.
- Chatbot de atencion en entornos educativos: gestion de preguntas frecuentes de un servicio concreto con un modelo ligero que puede ejecutarse en local.
- Prueba de concepto de despliegue en el borde (edge): al apoyarse en un modelo de 0.5B, es viable ejecutarlo en equipos modestos o incluso moviles, siempre que se gestione la cuantizacion del base.
- Evaluacion de tecnicas de especializacion: util para medir como un adaptador pequeno eleva la precision en un dominio muy concreto frente al modelo base sin ajustar.

## Benchmarks y rendimiento

La model card solo reporta una metrica propia: la "precision de precios", definida como la fraccion de respuestas que contienen todos los precios de la respuesta de referencia.

| Modelo | Train (precision de precios) | Eval (precision de precios) |
|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.0 | 0.0 |
| + LoRA (este adaptador) | 1.0 | 0.95 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: el modelo base de aproximadamente 494 millones de parametros puede cargarse en pocos GB de VRAM; el adaptador LoRA anade un coste marginal minimo. La cifra exacta no se detalla en la informacion proporcionada.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM para el modelo base. El entrenamiento del adaptador se realizo en una NVIDIA RTX 3060 Ti.
- Cabe en GPU de consumo: si, el modelo base de 0.5B esta disenado para entornos con recursos limitados (edge, movil, hardware de consumo) segun la informacion de busqueda.
- Opciones de despliegue: la model card muestra el uso con `transformers` y `peft` (`AutoPeftModelForCausalLM`). No se confirma compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI para este adaptador en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bellido/qwen2.5-0.5b-cafeterias-uam-lora | 0.49B (base) + adaptador | Hasta 128K en la familia Qwen2.5 (dato del base 0.5B no confirmado) | Precision de precios eval 0.95 en su dominio | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0.49B | Hasta 128K en la familia Qwen2.5 (dato del base 0.5B no confirmado) | Precision de precios eval 0.0 en el mismo test | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia; no se dispone de datos de rendimiento de otros modelos especializados en dominios equivalentes.

## Limitaciones y advertencias

- Los precios del catalogo pueden estar desactualizados; el propio autor advierte de que no es una fuente oficial de precios.
- Modelo muy pequeno (0.5B): puede inventar productos o precios para preguntas fuera de los datos de entrenamiento (alucinacion).
- Dataset reducido (1000 pares), lo que limita la cobertura a las preguntas y productos vistos durante el entrenamiento.
- Alcance idiomatico restringido al espanol.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base `Qwen/Qwen2.5-0.5B-Instruct`.
- Licencia Apache 2.0, que permite uso comercial, pero el contenido de precios debe validarse contra fuentes oficiales antes de cualquier uso real.
- Sin datos publicos de benchmarks generales; no se recomienda para tareas generales de razonamiento o codigo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bellido/qwen2.5-0.5b-cafeterias-uam-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/Bellido/cafeterias_uam_2026
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Analisis de Qwen2.5-0.5B para edge: https://dev.co/ai/llms/qwen2-5-0-5b
- Qwen2.5 y hardware local: https://www.local-llm.net/models/qwen-2-5/
