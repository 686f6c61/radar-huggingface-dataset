# credible-ai/olmo2-1B-288domains-vertex-linearscaled-hellaswag

## Resumen

olmo2-1B-288domains-vertex-linearscaled-hellaswag es un modelo de lenguaje de 1.414 millones de parametros desarrollado por credible-ai, un grupo de investigacion centrado en mezcla de datos (data mixing). Se trata de un artefacto de investigacion disenado para reproducir los experimentos del paper LinMix, no de un modelo de proposito general. Concretamente, es una ablacion de escalado de la metodologia LinMix aplicada al benchmark HellaSwag: el modelo se preentrena sobre una mezcla de datos optimizada por atribucion lineal de dominios.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 18 capas, tamano oculto de 2048 y tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens. Se entrena sobre 32.000 millones de tokens extraidos del corpus WebOrganizer, mezclados a traves de 288 dominios de tema x formato. Los pesos se distribuyen en bfloat16 bajo licencia MIT.

Su relevancia es metodologica: permite a investigadores reproducir y auditar como las tecnicas de mezcla de datos basadas en atribucion lineal (LinMix) escalan al pasar de un proxy de 60M de parametros a un modelo de 1.4B. No esta pensado para despliegue en produccion ni para tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1.41B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 de AllenAI: un transformer decoder-only con 18 capas, dimension oculta de 2048 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens). Los pesos se almacenan en bfloat16 y el repositorio ocupa 2,8 GB.

El entrenamiento se realizo con OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los terminos de uso de Common Crawl. La innovacion principal es el esquema de mezcla de datos: los 288 dominios (combinaciones de tema y formato) se ponderan mediante LinMix, un metodo de atribucion lineal de dominios. En esta variante concreta se ajusta un surrogate lineal sobre el enjambre de vertices (vertex swarm) generado por el proxy de 60M de parametros (`credible-ai/olmo2-60M-288domains-vertex`), se dividen los coeficientes por sus errores estandar (beta/SE) y se usa una utilidad lineal (r = 0), optimizando especificamente para HellaSwag. El repositorio incluye un fichero `mix.json` con la mezcla de datos empleada.

## Capacidades

- Generacion de texto autoregresiva basica en ingles.
- Razonamiento de sentido comun limitado, orientado al benchmark HellaSwag para el que fue optimizada la mezcla.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue: solo ingles.
- Sin capacidades de vision, audio ni modo thinking.
- Sin ajuste por RLHF ni DPO documentado; es un modelo exclusivamente preentrenado.

## Casos de uso

- Reproduccion de experimentos LinMix: el modelo sirve para validar los resultados del paper sobre escalado de mezclas de datos, comparando la mezcla optimizada con lineas base.
- Ablacion de escalado en investigacion de data mixing: permite estudiar como se transfieren las ponderaciones optimizadas en un proxy de 60M a un modelo de 1.4B.
- Analisis de atribucion de dominios: con `mix.json` y los pesos publicados se pueden auditar las contribuciones de cada dominio tema x formato al rendimiento en HellaSwag.
- Evaluacion de tecnicas de mezcla frente a heuristicas: util como referencia controlada para comparar LinMix con mezclas uniformes o proporcionales al tamano del dominio.
- Docencia e investigacion academica: modelo pequeno y reproducible para ensenar metodologias de curacion de datos de preentrenamiento.
- Estudio de transferencia entre proxies y modelos objetivo: permite medir la correlacion entre el rendimiento del proxy de 60M y el del modelo de 1.4B sobre el mismo espacio de 288 dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la mezcla se optimizo para HellaSwag, pero no incluye cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, mas memoria para activaciones y cache KV (estimacion practica de 4-6 GB en funcion de la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares. Tambien es viable en CPU con cuantizacion, aunque no se documentan ficheros GGUF.
- Opciones de despliegue: transformers (soporte nativo via `AutoModelForCausalLM`), vLLM y TGI son compatibles con arquitecturas OLMo 2; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| olmo2-1B-288domains-vertex-linearscaled-hellaswag | 1.41B | no disponible | MIT | Artefacto de investigacion (LinMix) |
| OLMo 2 1B (AllenAI) | 1.2B aprox. | 4.096 tokens | Apache 2.0 | Modelo de proposito general |
| credible-ai/olmo2-60M-288domains-vertex | 60M aprox. | no disponible | MIT | Proxy de investigacion (LinMix) |
| SmolLM2-1.7B | 1.7B | 8.192 tokens | Apache 2.0 | Modelo de proposito general |

La comparacion con modelos de proposito general no es directa: este modelo esta optimizado para un benchmark concreto y no se ha evaluado en tareas genericas. Frente a OLMo 2 1B, comparte arquitectura pero difiere en la mezcla de datos y en el objetivo (investigacion frente a uso general).

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de proposito general; su uso en produccion no esta recomendado.
- Entrenado unicamente en ingles, con corpus derivado de Common Crawl, por lo que hereda sesgos de la web.
- Riesgo alto de alucinacion y de respuestas incoherentes fuera de tareas de continuacion de texto.
- La mezcla de datos esta sobreoptimizada para HellaSwag, lo que puede degradar el rendimiento en otras tareas.
- No hay ajuste por instrucciones ni por preferencias humanas (sin RLHF/DPO), por lo que no responde bien a instrucciones complejas.
- Aunque los pesos son MIT, los datos de entrenamiento estan sujetos a los terminos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar las obligaciones de atribucion antes de un uso comercial.
- No se documenta longitud de contexto maxima ni ficheros cuantizados, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-288domains-vertex-linearscaled-hellaswag
- Proxy de 60M: https://huggingface.co/credible-ai/olmo2-60M-288domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentacion OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
