# mradermacher/SmolLM2-135M-multilingual-base-GGUF

## Resumen

SmolLM2-135M-multilingual-base-GGUF es la distribucion en formato GGUF del modelo base agentlans/SmolLM2-135M-multilingual-base, un modelo de lenguaje causal de tipo transformer con 134.515.008 parametros (aproximadamente 135 millones) derivado de la familia SmolLM2 de Hugging Face. Lo publica mradermacher, conocido en el ecosistema por generar cuantizaciones GGUF de modelos abiertos, y esta pensado para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). El modelo original es un base model, es decir, no ha pasado por un ajuste de instrucciones, y esta entrenado sobre el dataset agentlans/LinguaNova con cobertura declarada de 50 idiomas.

El interes de esta ficha reside en su tamano extremadamente reducido: con 135 millones de parametros cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU con latencias muy bajas, lo que lo hace adecuado para tareas de autocompletado, clasificacion, etiquetado y experimentacion multilingue en entornos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

No obstante, conviene subrayar que se trata de un modelo experimental, de tipo base y no instruido: no es un asistente conversacional ni un modelo de razonamiento, y su calidad en generacion libre sera limitada comparada con modelos de mayor tamano. Su valor esta en la eficiencia y en servir como componente ligero dentro de pipelines mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), derivado de SmolLM2 |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 50 idiomas: ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hu, hy, id, is, it, ja, ka, kk, ko, lt, lv, mk, ml, mr, ne, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, ta, th, tr, uk, ur, vi, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 135 millones de parametros, construido sobre la arquitectura SmolLM2 de Hugging Face. El autor del modelo base (agentlans) lo entrena sobre el dataset agentlans/LinguaNova, orientado a cobertura multilingue en 50 idiomas. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; la model card no los detalla.

Esta publicacion concreta es una cuantizacion estatica del modelo base realizada por mradermacher, sin modificaciones en los pesos mas alla de la reduccion de precision. No incluye cuantizaciones ponderadas por imatrix (weighted/imatrix) segun indica el propio autor, y el proceso de conversion se ha realizado desde el formato Hugging Face (convert_type: hf) con salida en GGUF. Al ser un modelo base, no ha recibido ajuste de instrucciones ni alineamiento conversacional.

## Capacidades

- Generacion de texto autoregresiva en modo base (completado de secuencias, no dialogo instruido).
- Capacidades multilingues declaradas sobre 50 idiomas, incluyendo espanol, catalan, ingles, frances, aleman, arabe, chino, hindi y la mayoria de lenguas europeas y del sudeste asiatico.
- Autocompletado de texto (tag autocomplete) y continuacion de prompts.
- Util como modelo de representaciones o para tareas de clasificacion y etiquetado mediante fine-tuning.
- No soporta tool calling ni function calling de forma nativa (no es un modelo instruido).
- No dispone de modo thinking, vision ni audio.
- No esta disenado para razonamiento multi-paso ni para uso agentico sin ajuste adicional.

## Casos de uso

- Autocompletado en editores de codigo o texto: el modelo puede generar continuaciones de linea o parrafo con latencia muy baja gracias a sus 135M de parametros, integrandose en plugins de IDE o editores de texto.
- Clasificacion y etiquetado multilingue: mediante fine-tuning ligero sobre las representaciones del modelo base, se puede usar para categorizar textos en cualquiera de los 50 idiomas soportados, con coste de inferencia minimo.
- Filtrado y preprocesado en pipelines de datos: util para tareas de deteccion de idioma, normalizacion o generacion de metadatos en grandes volumenes de texto, donde un modelo grande seria economicamente inviable.
- Prototipado rapido de aplicaciones NLP: permite validar arquitecturas y pipelines en local (CPU o GPU consumer) antes de escalar a modelos mayores, reduciendo el coste de iteracion.
- Educacion e investigacion: sirve como modelo de referencia para experimentos de interpretabilidad, analisis de sesgos o estudios de eficiencia en modelos pequenos multilingues.
- Despliegue en dispositivos de borde: al ocupar entre 0,2 y 0,4 GB segun cuantizacion, puede ejecutarse en Raspberry Pi, moviles o navegadores mediante llama.cpp compilado, para tareas de generacion offline.
- Generacion de datos sinteticos a pequena escala: util para aumentar datasets de entrenamiento en idiomas de bajos recursos, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K, Q3_K_S, IQ4_XS, Q4_K_S, Q4_K_M) y 0,4 GB (f16). En la practica, cualquier GPU con 1 GB o mas puede alojar el modelo completo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) es mas que suficiente. En servidores, A100 o H100 no aportan ventaja significativa por el reducido tamano.
- Cabe en cualquier GPU consumer, incluida la gama integrada (iGPU) y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base original en safetensors puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por su tamano se espera inferencia en milisegundos por token en CPU moderna y decenas de miles de tokens por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM2-135M-multilingual-base (este) | 134,5M | no disponible | 50 | Apache 2.0 | GGUF, safetensors |
| SmolLM2-135M (original, Hugging Face) | 135M | no disponible en esta ficha | principalmente ingles | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494M | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | no disponible en esta ficha | ingles | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada. Frente a SmolLM2-135M original, la variante multilingual amplia la cobertura a 50 idiomas a costa de un posible menor rendimiento en ingles. Frente a Qwen2.5-0.5B y TinyLlama-1.1B, este modelo es entre 4 y 8 veces mas pequeno, lo que reduce requisitos pero tambien capacidad.

## Limitaciones y advertencias

- Es un modelo base no instruido: no responde a instrucciones ni mantiene conversaciones de forma fiable sin fine-tuning.
- Riesgo elevado de alucinacion y de generacion incoherente en textos largos, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- La cobertura de 50 idiomas es declarada por el autor; no se han publicado evaluaciones por idioma que confirmen calidad uniforme. Idiomas de bajos recursos pueden rendir notablemente peor.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Sesgos desconocidos: no se han publicado analisis de sesgos del modelo base ni del dataset LinguaNova.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (SmolLM2) tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Las cuantizaciones estaticas de baja precision pueden degradar la calidad de forma significativa; se recomienda Q4_K_M o superior para produccion.
- No dispone de cuantizaciones imatrix ponderadas, lo que puede suponer una ligera perdida de calidad frente a alternativas equivalentes con imatrix.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SmolLM2-135M-multilingual-base-GGUF
- Modelo base original: https://huggingface.co/agentlans/SmolLM2-135M-multilingual-base
- Pagina de descargas del autor: https://hf.tst.eu/model#SmolLM2-135M-multilingual-base-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/agentlans/LinguaNova
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
