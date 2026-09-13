# kzfastino/gemma-4-26B-A4B-it-pruned-106-experts

## Resumen

Este checkpoint es una version podada del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario kzfastino. La poda se aplico a nivel de experto completo (whole-expert pruning) sobre la mezcla de expertos del modelo base, reduciendo el numero de expertos por capa de 128 a 106 en todas las capas, manteniendo intacto el enrutamiento top-8. El resultado pasa de 25,81B a 21,88B parametros totales (−15,2%) y de 51,6 GB a 43,8 GB en bf16, segun los datos de la propia model card.

El interes practico es acotado pero claro: es una reduccion de huella de memoria, no de latencia. El autor indica explicitamente que el computo por token no cambia (sigue seleccionando top-8 expertos), por lo que el beneficio esta en VRAM y en espacio de almacenamiento, no en velocidad de inferencia. La calidad medida con ARC-Challenge (300 preguntas) cae del 95,3% al 94,0%, con una incertidumbre de ±1,3 puntos a 1σ, y la coincidencia top-1 con el modelo original es del 74,8%.

Se trata de un artefacto de investigacion generado en una sola pasada durante un hackathon de Google el 12 de septiembre de 2026 sobre una unica GPU Lambda H100, con la herramienta vibepruner del mismo autor. No se aplico fine-tuning posterior, el repositorio tiene 0 descargas y 0 likes, y no hay validacion independiente de sus capacidades mas alla del dato de ARC-Challenge. Es, por tanto, material interesante para estudiar tecnicas de poda en arquitecturas MoE, no un modelo listo para produccion sin evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y enrutamiento top-8; multimodal imagen-texto (pipeline `image-text-to-text`) |
| Parametros totales | 21.878.798.266 (21,88B) segun safetensors; el modelo base declara 25,81B |
| Parametros activos | no disponible (el modelo base se denomina A4B, lo que sugiere del orden de 4.000 millones de parametros activos; el pruning no reduce el tamano de los expertos conservados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en bf16 (43,8 GB) |
| Idiomas soportados | no disponible (la model card no los declara; se heredan del modelo base) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (bf16) |

Datos adicionales: expertos por capa, 106 (frente a 128 en el original); tamano del repositorio, 43,8 GB; libreria, transformers; creado y actualizado el 12 de septiembre de 2026.

## Arquitectura y entrenamiento

No hay entrenamiento: es un proceso de poda one-shot sobre los pesos de `google/gemma-4-26B-A4B-it`. La arquitectura subyacente es un transformer con mezcla de expertos que enruta cada token a los 8 expertos mas probables de entre los 128 originales por capa. La poda elimina expertos completos por capa mediante `index_select` sobre los tensores apilados de expertos y sobre las filas del router, y ajusta `text_config.num_experts` al nuevo recuento. El enrutamiento top-8 se mantiene sin cambios, de ahi que el computo por token sea identico.

El criterio de saliencia se calcula con enganches (hooks) en el router: para cada experto se registra su peso de puerta top-k y su numero de selecciones sobre un conjunto de calibracion formado por prosa de wikitext y por respuestas del propio modelo en formato de chat. La puntuacion es `(masa de puerta asignada · ||W_expert||_F) / selecciones`, una aproximacion con un solo hook de la formula de REAP `g_j(x)·||f_j(x)||`. Se aplicaron tres rondas, cada una eliminando el 6,25% de los expertos restantes con menor puntuacion en cada capa, con revaluacion de la saliencia entre rondas. Una cuarta ronda, que el autor cifra en un −19,4% adicional o acumulado, habria degradado ARC-Challenge hasta el 92,7%, por lo que fue descartada.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct (`conversational` en los tags).
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes junto a texto en la misma peticion.
- Mezcla de expertos con enrutamiento top-8 sobre 106 expertos por capa, sin cambios en la logica de enrutamiento respecto al original.
- Razonamiento y conocimiento factual: unico eje medido, con ARC-Challenge al 94,0% (300 preguntas).
- Coincidencia top-1 con el modelo original del 74,8% y divergencia KL de 0,96 nats/token.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; la model card no declara idiomas.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre poda de MoE: el checkpoint es un punto de comparacion reproducible frente al base, con metricas concretas de saliencia por experto (top-1 agreement del 74,8%, KL de 0,96 nats/token) que permiten estudiar el impacto de distintas heuristicas de seleccion.
- Servicio multimodal con margen de VRAM en una GPU de 80 GB: al pasar de 51,6 a 43,8 GB en bf16, quedan aproximadamente 8 GB adicionales para cache KV, procesamiento de imagen y un segundo modelo auxiliar en la misma tarjeta.
- Prototipado en GPU de consumo mediante cuantizacion a 4 bits: los 43,8 GB de pesos bf16 bajan a un entorno de 11-12 GB estimados, lo que permite ejecutar una version cuantizada en una RTX 4090 o RTX 3090 de 24 GB, con la validacion de calidad correspondiente por cuenta del integrador.
- Evaluacion interna de degradacion por poda: usar el mismo conjunto de validacion que se aplique al base (dominio propio, no solo ARC) para decidir si la perdida de calidad es aceptable en la tarea concreta, dado que el unico dato publicado es ARC-Challenge con 300 preguntas.
- Fine-tuning selectivo con LoRA: al ser un 15,2% mas pequeno, el checkpoint reduce el coste de almacenamiento y de carga en pipelines de ajuste fino, aunque el autor no reporta ningun ajuste posterior.
- Analisis del comportamiento del router: al conservarse las filas del router correspondientes a los expertos supervivientes, se puede comparar la distribucion de enrutamiento resultante con la del modelo base y detectar que expertos concentraban la carga.
- Docencia y reproduccion metodologica: sirve para ilustrar un flujo completo de poda con `index_select`, revaluacion por rondas y criterio de parada basado en una metrica de calidad.
- Sustitucion directa en un entorno que ya sirve el modelo base con `transformers>=5.5`, con el objetivo de liberar espacio en disco y VRAM sin cambiar el codigo de inferencia.

## Benchmarks y rendimiento

| Metrica | Modelo original (25,81B) | Este checkpoint (21,88B) | Notas |
|---|---|---|---|
| ARC-Challenge (300 preguntas) | 95,3% | 94,0% | ±1,3 puntos a 1σ |
| Parametros totales | 25,81B | 21,88B | −15,2% |
| Huella en bf16 | 51,6 GB | 43,8 GB | −7,8 GB |
| Expertos por capa | 128 | 106 | top-8 sin cambios |
| Coincidencia top-1 con el original | — | 74,8% | — |
| KL(original ‖ podado) | — | 0,96 nats/token | — |
| Cuarta ronda (rechazada) | — | 92,7% en ARC-Challenge | descartada por degradacion |

No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible. El autor indica expresamente que no se reporta perplejidad: la distribucion de siguiente token del modo instruct de Gemma 4 tiene un suelo duro en el logit softcap, lo que hace que la perplejidad con teacher forcing no sea informativa (aproximadamente 2000 en wikitext para el modelo sin podar).

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan 43,8 GB, por lo que se estiman unos 50-56 GB de VRAM en total contando cache KV y activaciones, dependiendo de la longitud de contexto (no declarada). GPU de 80 GB recomendadas: A100 80 GB, H100 80 GB, H200.
- VRAM en cuantizacion de 8 bits: aproximadamente 22-24 GB de pesos, en el rango de una L40S 48 GB, A100 40 GB o dos RTX 4090.
- VRAM en cuantizacion de 4 bits: aproximadamente 11-12 GB de pesos, ejecutable en RTX 4090, RTX 3090, L4 o RTX 4080 de 16 GB, con contexto reducido. Estas cifras son estimaciones aritmeticas sobre los 43,8 GB en bf16 declarados por el autor, no datos publicados.
- Cabe en GPU de consumo: si, mediante cuantizacion a 4 bits en tarjetas de 24 GB o mas; en bf16 no cabe en ninguna GPU de consumo actual.
- Despliegue: el autor indica `AutoModelForCausalLM.from_pretrained` con `transformers>=5.5`, dado que `text_config.num_experts` se ha modificado y debe ser leido correctamente. El soporte en vLLM, TGI, llama.cpp u Ollama no se menciona en la model card, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El autor subraya que el computo por token es identico al del modelo original (top-8 sobre 106 expertos en lugar de sobre 128), de modo que no debe esperarse ninguna mejora de velocidad por este pruning.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa | ARC-Challenge (300 q) | Huella bf16 | Licencia | Estado |
|---|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it | 25,81B | 128 | 95,3% | 51,6 GB | gemma | Modelo base oficial de Google |
| Este checkpoint (pruned-106) | 21,88B | 106 | 94,0% (±1,3 pt 1σ) | 43,8 GB | gemma | Poda sin fine-tuning, 0 descargas |

No se proporcionan datos de otros modelos comparables (por ejemplo, otras mezclas de expertos de tamano similar) en la informacion disponible, ni resultados de benchmarks que permitan situar este checkpoint frente a alternativas de la misma categoria. La unica comparacion documentada es contra su propio modelo base y contra la variante descartada de cuatro rondas de poda, que cayo al 92,7% en ARC-Challenge.

## Limitaciones y advertencias

- Validacion muy limitada: el unico dato de calidad es ARC-Challenge con 300 preguntas y ±1,3 puntos a 1σ. No hay evaluaciones de codigo, matematicas, vision, multilingue ni de seguridad, y los 300 ejemplos de ARC-Challenge no permiten descartar degradaciones mayores en otros dominios.
- Sin fine-tuning de recuperacion: el checkpoint es una poda pura, sin ajuste posterior, por lo que la degradacion inducida por la eliminacion de expertos no se ha compensado de ninguna forma.
- Divergencia real respecto al original: la coincidencia top-1 es del 74,8%, es decir, aproximadamente uno de cada cuatro tokens cambia de prediccion principal, y la divergencia KL es de 0,96 nats/token. Para tareas sensibles a la exactitud esto es relevante.
- Perplejidad no medible: el autor explica que el logit softcap del modelo instruct provoca un suelo artificial en la distribucion de siguiente token, lo que invalida la perplejidad como metrica de comparacion. No hay, por tanto, una medida estandar de calidad de lenguaje.
- Sin ganancia de latencia: al mantenerse el enrutamiento top-8, el computo por token no disminuye. Si el objetivo del despliegue es reducir latencia o coste de computo por peticion, este checkpoint no lo consigue.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan los del modelo base y pueden verse alterados por la poda.
- Idiomas y contexto no declarados: se desconocen tanto la ventana de contexto efectiva como el soporte idiomatico, lo que dificulta dimensionar el despliegue.
- Restricciones de licencia: la licencia es `gemma` (Gemma Terms of Use), que permite uso comercial sujeto a las condiciones y a la politica de usos prohibidos de Google. Conviene revisar los terminos antes de un uso en produccion.
- Madurez del artefacto: fue creado en una sola pasada durante un hackathon, con 0 descargas y 0 likes, sin revisión por pares ni validacion de la comunidad. No se recomienda su uso en produccion sin una evaluacion propia y exhaustiva.
- Compatibilidad de despliegue: al modificarse `text_config.num_experts`, el checkpoint depende de que el runtime respete ese campo. Se requiere `transformers>=5.5` segun el autor y no hay confirmacion de soporte en otras plataformas de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kzfastino/gemma-4-26B-A4B-it-pruned-106-experts
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Herramienta de poda vibepruner: https://github.com/kfastino/vibepruner

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su metodologia; los enlaces recuperados correspondian a aplicaciones de diario personal sin relacion con el contenido de esta ficha. No se han localizado papers, blogs tecnicos ni demos adicionales asociados al checkpoint.
