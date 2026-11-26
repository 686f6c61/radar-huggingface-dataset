# mradermacher/open_llama_3b_v2_chat_dolly-GGUF

## Resumen

`mradermacher/open_llama_3b_v2_chat_dolly-GGUF` es una coleccion de cuantizaciones GGUF del modelo `ddahlmeier/open_llama_3b_v2_chat_dolly`, un ajuste fino conversacional del modelo base Open LLaMA 3B v2 desarrollado por OpenLM Research. El repositorio lo publica mradermacher, conocido por producir cuantizaciones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo subyacente parte de la arquitectura LLaMA de 3.426 millones de parametros y ha sido afinado sobre el dataset Dolly para tareas conversacionales en ingles.

La relevancia de esta ficha es doble: por un lado, documenta una opcion ligera (3B parametros) para despliegue en hardware modesto; por otro, ilustra el flujo habitual de cuantizacion estatica de un modelo afinado de la familia Open LLaMA. El repositorio incluye once variantes GGUF desde Q2_K (2,1 GB) hasta f16 (7,0 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

No se dispone de informacion sobre licencia en la metadata del repositorio, sobre la longitud de contexto exacta del modelo base ni sobre resultados de benchmarks publicados por el autor de la cuantizacion. Estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, segun modelo base Open LLaMA 3B v2) |
| Parametros totales | 3.426.473.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato Hugging Face/transformers |
| Tamano del repositorio | 34,8 GB (incluye todas las variantes) |
| Modelo base | ddahlmeier/open_llama_3b_v2_chat_dolly |
| Libreria declarada | transformers |
| Tipo de cuantizacion | estatica (quantize_version 2, output_tensor_quantised 1) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Open LLaMA 3B v2, un transformer decoder-only con atencion causal de tipo LLaMA. El ajuste fino `ddahlmeier/open_llama_3b_v2_chat_dolly` parte de ese checkpoint y se entrena sobre el dataset Dolly, orientado a instrucciones y conversacion en ingles. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La aportacion de este repositorio es exclusivamente la cuantizacion. mradermacher genera variantes GGUF estaticas (sin imatrix/weighted quants, segun indica el propio autor) a partir del checkpoint en formato Hugging Face. La conversion declarada es de tipo `hf`, y el autor senala que las cuantizaciones con imatrix no estan disponibles por el momento. Las variantes IQ4_XS y Q4_K_M se presentan como las opciones recomendadas por equilibrio entre tamano y calidad.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste sobre Dolly.
- Respuesta a instrucciones de un solo turno y conversaciones multi-turno basicas.
- Razonamiento de complejidad limitada, condicionado por el tamano de 3B parametros.
- Generacion de codigo basica, sin garantias de calidad comparable a modelos mayores.
- Capacidades matematicas elementales, no orientadas a problemas complejos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles declarado.
- No se documenta vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Prototipado rapido en local: gracias a las variantes Q4_K_S (2,5 GB) y Q4_K_M (2,7 GB), el modelo puede ejecutarse en portatiles con 8 GB de RAM para validar pipelines conversacionales antes de escalar a modelos mayores.
- Chatbot de soporte en ingles para entornos con recursos restringidos: el ajuste sobre Dolly permite mantener conversaciones de dominio general, aunque la ventana de contexto no documentada limita la longitud de las sesiones.
- Generacion de respuestas en aplicaciones de escritorio o moviles: la variante Q2_K (2,1 GB) permite integrar el modelo en entornos con poca memoria, aceptando la perdida de calidad asociada.
- Experimentacion academica con cuantizacion: el repositorio ofrece doce variantes del mismo checkpoint, lo que facilita estudios comparativos de perplejidad y calidad entre tipos de cuantizacion.
- Generacion de texto asistida en ingles para tareas de redaccion breve, resumen o parafraseo, siempre con supervision humana por el riesgo de alucinacion.
- Base para ajuste fino adicional: al ser un modelo de 3B parametros, puede reentrenarse o adaptarse con LoRA en GPUs de consumo, partiendo del checkpoint original en transformers.
- Evaluacion de pipelines de inferencia con llama.cpp: util para comparar throughput y latencia entre cuantizaciones en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: aproximadamente 2,1 GB para Q2_K, 2,5-2,7 GB para Q4_K_S/Q4_K_M, 3,7 GB para Q6_K/Q8_0 y 7,0 GB para f16, sin contar el overhead del runtime ni la cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060 o superiores para Q4/Q5; RTX 4090 o A100/H100 no son necesarias por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), y servidores compatibles con GGUF; el modelo base puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open_llama_3b_v2_chat_dolly-GGUF (este) | 3,43 B | no disponible | no disponible | GGUF | Cuantizacion estatica de un ajuste sobre Dolly |
| Open LLaMA 3B v2 (base) | 3,43 B | no disponible | no disponible | safetensors | Checkpoint original sin ajuste conversacional |
| TinyLlama 1.1B Chat | 1,1 B | 2.048 tokens (segun su model card publica) | Apache 2.0 (segun su model card publica) | safetensors, GGUF | Alternativa mas pequena y con licencia permisiva |
| Phi-2 | 2,7 B | 2.048 tokens (segun su model card publica) | MIT (segun su model card publica) | safetensors | Alternativa de tamano similar con licencia permisiva |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de benchmarks del modelo de esta ficha para contrastar rendimiento.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: no se puede confirmar el uso comercial sin consultar el modelo base y sus terminos originales.
- Idioma limitado al ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo.
- Riesgo de alucinacion inherente a un modelo de 3B parametros afinado sobre un dataset relativamente pequeno como Dolly.
- Capacidad de razonamiento, matematicas y codigo limitada por el tamano; no apto para tareas que requieran precision alta sin verificacion.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- No hay cuantizaciones imatrix/weighted disponibles, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- El modelo base y el ajuste no cuentan con documentacion publica sobre sesgos; se recomienda evaluacion previa en produccion.
- Sin soporte documentado de tool calling ni agentes, no es adecuado para pipelines que requieran integracion con herramientas externas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/open_llama_3b_v2_chat_dolly-GGUF
- Modelo base: https://huggingface.co/ddahlmeier/open_llama_3b_v2_chat_dolly
- Pagina de descargas del autor: https://hf.tst.eu/model#open_llama_3b_v2_chat_dolly-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
