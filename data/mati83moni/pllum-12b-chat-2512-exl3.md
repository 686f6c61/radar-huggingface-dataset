# Mati83moni/PLLuM-12B-chat-2512-EXL3

## Resumen

PLLuM-12B-chat-2512-EXL3 es una version cuantizada en formato EXL3 (ExLlamaV3) del modelo CYFRAGOVPL/PLLuM-12B-chat-2512, un LLM conversacional de aproximadamente 12.000 millones de parametros desarrollado por el consorcio polaco PLLuM / HIVE AI. La cuantizacion la ha realizado el usuario Mati83moni con ExLlamaV3 v0.0.43 sobre una instancia AWS, y su objetivo declarado es permitir ejecutar el modelo completo en GPUs de 12 GB de VRAM sin renunciar al chat en polaco de alta calidad. El repositorio esta publicado con licencia Apache 2.0 y esta pensado para el ecosistema ExLlamaV3 / TabbyAPI.

La relevancia de esta ficha esta en que se trata de un caso claro de cuantizacion especializada: EXL3 emplea empaquetado trellis que comprime cada matriz de pesos en un sub-tensor de forma distinta a la original (por ejemplo, una matriz `[14336, 5120]` pasa a ser un tensor int16 `[320, 896, 64]`). Como consecuencia, el contador automatico de parametros de HuggingFace muestra unos 4B parametros, cuando el modelo real conserva los ~12B originales. Comprender esta discrepancia es esencial para no malinterpretar el tamano real del modelo ni sus requisitos de hardware.

El modelo esta orientado a generacion de texto y conversacion, con soporte de polaco e ingles como idiomas declarados. No se documentan capacidades multimodales, de tool calling ni de agentes en la informacion disponible, por lo que debe tratarse como un modelo de chat puro de tipo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `mistral`); 40 capas, hidden_size 5120, intermediate_size 14336, vocab_size 131072 |
| Parametros totales | ~12B reales. El contador de safetensors declara 3.993.946.112 elementos, pero el autor indica explicitamente que el conteo real es 12B y que la discrepancia se debe al empaquetado trellis de EXL3 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.5 bpw (decoder) y 6.0 bpw (lm_head); 4 bits efectivos. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con empaquetado trellis EXL3 (libreria `exllamav3`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder de tipo Mistral, segun la etiqueta `mistral` del repositorio, con 40 capas, dimension oculta de 5120 y dimension intermedia de 14336. El vocabulario es de 131072 tokens, coherente con un modelo entrenado predominantemente en polaco. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias del modelo base; estos datos corresponden a la model card de CYFRAGOVPL/PLLuM-12B-chat-2512 y no se reproducen en la informacion disponible.

La innovacion tecnica de esta ficha es la propia cuantizacion EXL3, realizada de forma automatica con asignacion de bits por tensor: embeddings y normalizaciones quedan sin cuantizar (16 bpw), la capa de atencion 0 se guarda a 6 bpw, la atencion de las capas 1 a 39 a 5 bpw, las MLP de las capas 0 a 14 a 5 bpw y las MLP de las capas 15 a 39 a 4 bpw. El lm_head se conserva a 6 bpw. La calibracion fue la predeterminada (250 filas x 2048 columnas), el SQNR medio reportado por el conversor fue de aproximadamente 33 dB y el tiempo de cuantizacion de unos 75 minutos sobre una NVIDIA L4 de 24 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno en polaco e ingles.
- Comprension lectora y respuesta a preguntas en polaco, avalada por el resultado en Belebele (Polish).
- Clasificacion de sentimiento sobre texto polaco, segun los resultados declarados en KLEJ PolEmo2.0-IN y KLEJ PolEmo2.0-OUT.
- Razonamiento sobre preguntas de opcion multiple en polaco, segun el resultado declarado en ARC-Challenge (Polish MT).
- Ejecucion local en GPUs de 12 GB gracias a la cuantizacion EXL3 de 4.5 bpw.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes, multi-step reasoning ni modos de "thinking" explicito.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta una longitud de contexto concreta.

## Casos de uso

- Asistente conversacional en polaco para atencion al cliente: el modelo puede mantener dialogos multi-turno en polaco y desplegarse en un servidor con GPU de 12 GB mediante ExLlamaV3 y TabbyAPI, lo que abarata el coste por instancia frente a un modelo sin cuantizar.
- Analisis de sentimiento de resenas y comentarios en polaco: sus resultados declarados en KLEJ PolEmo2.0-IN (74,65) y PolEmo2.0-OUT (77,13) lo hacen adecuado para clasificar opiniones de clientes o redes sociales en ese idioma.
- Moderacion y clasificacion de contenido en polaco: puede usarse como clasificador zero-shot de textos cortos apoyandose en la ventana de contexto disponible y en su tokenizador especifico de polaco.
- Generacion de contenido editorial en polaco: redaccion de borradores, resumenes y reescritura de textos, aprovechando que el modelo base fue entrenado por un consorcio publico polaco.
- Traduccion asistida polaco-ingles: aunque no es un modelo de traduccion dedicado, su soporte declarado de ambos idiomas permite usarlo en pipelines de pretraduccion con revision humana.
- Respuesta a preguntas sobre documentacion interna en polaco: combinado con un sistema RAG, el modelo puede responder consultas en polaco a partir de fragmentos recuperados, sin necesidad de GPUs de gama alta.
- Investigacion academica sobre cuantizacion: el repositorio sirve como caso de estudio reproducible de cuantizacion EXL3 con asignacion automatica de bits por capa y de su efecto sobre benchmarks en polaco.
- Despliegue en hardware de gama media o consumo: al caber en 12 GB de VRAM segun las mediciones del autor, es viable en tarjetas como la RTX 3060 de 12 GB o superiores para inferencia de un solo usuario.

## Benchmarks y rendimiento

Todos los resultados son autodeclarados por el autor, no verificados, medidos con lm-eval 0.4.13 en zero-shot sobre la cuantizacion EXL3 4.5 bpw y una NVIDIA Tesla T4.

| Dataset | Metrica | Valor |
|---|---|---|
| Belebele (Polish, pol_Latn) | acc | 81,89 |
| Belebele (Polish, pol_Latn) | acc_norm | 81,89 |
| KLEJ PolEmo2.0-IN | accuracy | 74,65 |
| KLEJ PolEmo2.0-IN | F1 (micro) | 74,65 |
| KLEJ PolEmo2.0-OUT | accuracy | 77,13 |
| KLEJ PolEmo2.0-OUT | F1 (micro) | 77,13 |
| ARC-Challenge (Polish MT, config pl) | acc | 45,90 |
| ARC-Challenge (Polish MT, config pl) | acc_norm | 46,59 |

No hay en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia medida en la model card: 6,75 GiB tras la carga y 7,50 GiB de pico con contexto de 2048 tokens; 7,17 GiB tras la carga con contexto de 4096 tokens (batch 1, KV cache en FP16, modelo y cache en una sola GPU, medicion con nvidia-smi sobre Tesla T4 de 16 GB).
- Si cabe en GPU de consumo: el autor indica que el modelo esta optimizado para 12 GB de VRAM, por lo que encaja en tarjetas de 12 GB como la RTX 3060 de 12 GB. No se ofrecen mediciones para otras GPU de consumo.
- GPU usadas en el proceso: cuantizacion en NVIDIA L4 de 24 GB (AWS g6.2xlarge); benchmarks en NVIDIA Tesla T4 de 16 GB con un parche sm_75.
- Opciones de despliegue: ExLlamaV3 (libreria declarada) y TabbyAPI (etiqueta del repositorio). El formato EXL3 no es compatible con llama.cpp, Ollama, vLLM ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLLuM-12B-chat-2512-EXL3 (este) | ~12B | no disponible | EXL3 4.5 bpw, safetensors | apache-2.0 | HuggingFace, 25 descargas |
| CYFRAGOVPL/PLLuM-12B-chat-2512 (base) | ~12B | no disponible | safetensors sin cuantizar | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la informacion proporcionada, por lo que no se puede construir una comparativa numerica con alternativas de terceros.

## Limitaciones y advertencias

- Los resultados de benchmarks son autodeclarados por el autor y marcados como no verificados; no deben tomarse como cifras oficiales.
- Riesgo de alucinacion inherente a cualquier LLM de este tamano; el autor no documenta mitigaciones especificas.
- Idiomas declarados limitados a polaco e ingles; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se puede planificar su uso en escenarios de contexto largo sin verificacion previa.
- La cuantizacion a 4,5 bpw puede degradar la calidad respecto al modelo base; el autor reporta un SQNR medio de ~33 dB durante el conversor, no una medicion posterior completa.
- El contador de parametros de HuggingFace muestra ~4B, lo que puede inducir a error al planificar hardware; el modelo real es de ~12B.
- El formato EXL3 exige herramientas especificas (ExLlamaV3 / TabbyAPI) y no es portable a runtimes habituales como llama.cpp, Ollama o vLLM.
- Licencia Apache 2.0, que permite uso comercial, pero la licencia del modelo base y sus condiciones adicionales deberian verificarse en el repositorio original.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran esas capacidades sin verificacion previa.
- El repositorio tiene muy poca adopcion (25 descargas, 0 likes) y su cuantizacion fue realizada por un particular, no por el equipo del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mati83moni/PLLuM-12B-chat-2512-EXL3
- Seccion de benchmarks del repositorio: https://huggingface.co/Mati83moni/PLLuM-12B-chat-2512-EXL3#-benchmarks
- Modelo base: https://huggingface.co/CYFRAGOVPL/PLLuM-12B-chat-2512
- Discusion original que origino la cuantizacion: https://huggingface.co/CYFRAGOVPL/PLLuM-12B-chat-2512/discussions/1
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Paper asociado (arXiv 2511.03823): https://arxiv.org/abs/2511.03823
