# gpjt/8xa100m40-lore-3-both-smart-init

## Resumen

`gpjt/8xa100m40-lore-3-both-smart-init` es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (usuario `gpjt` en HuggingFace), basado en la arquitectura estilo GPT-2 que Sebastian Raschka describe en su libro "Build a Large Language Model (from Scratch)". Se trata de un modelo base (no ajustado por instrucciones ni por preferencias humanas) de aproximadamente 100-111 millones de parametros, con una ventana de contexto de 1.024 tokens, 768 dimensiones de embedding, 12 capas y 12 cabezas de atencion multi-cabeza.

Su interes no esta en el rendimiento bruto, sino en la tecnica que experimenta: LoRE (Low Rank Embeddings), una descomposicion de bajo rango aplicada simultaneamente a las matrices de embedding de tokens y a la cabeza de salida. Con un rango de 128, esto reduce de forma notable el numero de parametros dedicados al vocabulario, que en un GPT-2 clasico dominan el recuento total. El modelo se entreno con unos 3.260 millones de tokens del dataset `gpjt/fineweb-gpt2-tokens`, un volumen calculado como el "Chinchilla-optimal" (~20x parametros) de la version sin LoRE, no de la version final.

Es un artefacto de investigacion y experimentacion, no un modelo para produccion. El propio autor advierte de que es "a la vez poco listo e ignorante", carece de benchmarks publicados, tiene cero descargas y cero likes en el momento de redactar esta ficha, y su licencia Apache 2.0 es la unica via de uso legitimo. Su valor esta en servir como banco de pruebas reproducible para estudiar compresion de vocabulario, inicializacion de matrices de bajo rango y entrenamiento distribuido en 8x A100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (solo decodificador), con atencion multi-cabeza (MHA) |
| Parametros totales | 111.460.096 segun los pesos safetensors; la model card declara 98.877.184 (discrepancia no explicada por el autor) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible. Solo se publican pesos sin cuantizar; el tamano del repo (0,4 GB) es coherente con fp32 |
| Idiomas soportados | No disponible (el dataset FineWeb es predominantemente en ingles, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Dimension de embedding | 768 |
| Capas | 12 |
| Cabezas MHA | 12 |
| Sesgo en QKV | No (False) |
| Weight tying | No (False) |
| Rango LoRE | 128, activo en embeddings de token y en la cabeza de salida |
| Inicializacion | "Smart initialization": original |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de solo decodificador con normalizacion previa y bloques de atencion multi-cabeza, siguiendo la implementacion didactica de Raschka. La innovacion respecto a un GPT-2 estandar es LoRE: tanto la matriz de embedding de tokens como la cabeza de salida (que en este modelo no estan atadas) se factorizan en dos matrices de bajo rango, con rango 128. Dado un vocabulario tipo GPT-2 de 50.257 entradas, una matriz completa de 50.257 x 768 ocupa unos 38,6 millones de parametros; con rango 128 se reduce a unos 6,5 millones, un ahorro agregado de aproximadamente 64 millones de parametros entre ambas matrices. Eso explica por que el recuento difiere respecto a la version sin LoRE, que rondaria los 163 millones de parametros (cifra que aparece en la prosa de la model card y de la que derivan los 3.260 millones de tokens de entrenamiento objetivo).

El entrenamiento se realizo en 8 GPU A100 de 40 GiB de VRAM en Lambda, con un total de 3.260.252.160 tokens procesados, tamano de micro-lote 12, lote global 96, dropout 0,0, gradient clipping de 3,5, learning rate de 0,0014 con schedule, y weight decay de 0,01. No se menciona en la informacion disponible ninguna fase de RLHF, DPO, SFT ni ajuste por instrucciones: es un modelo estrictamente preentrenado. La tecnica de LoRE fue sugerida por el usuario `AndrewThompson1233` en una discusion publica de HuggingFace, y el autor la documenta en un blog post (anunciado como "coming soon" en el momento del lanzamiento).

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts cortos en el estilo del corpus de entrenamiento (texto web en ingles).
- Modelo base sin ajuste por instrucciones: no sigue ordenes, no responde preguntas de forma directa ni mantiene formato conversacional.
- Capacidad factografica y de razonamiento muy limitada: el propio autor indica que el modelo "no conoce muchos hechos y no es terriblemente listo".
- Sin soporte de tool calling ni function calling: no se declara ninguna capacidad de este tipo.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales: no hay vision, audio ni cualquier otra modalidad.
- Multilingueismo: no disponible; no se declaran idiomas soportados.
- No dispone de modo "thinking", decodificacion especulativa ni tecnicas de inferencia acelerada declaradas.
- Compatible con `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM` de transformers, y ajustable mediante fine-tuning (el autor enlaza un cuaderno de ejemplo).

## Casos de uso

- Investigacion sobre compresion de vocabulario: el modelo permite medir de forma controlada el impacto de LoRE en las matrices de embedding y de salida comparando contra una variante sin LoRE de ~163 M de parametros, aislando el efecto del rango sobre la calidad de generacion.
- Experimentos de ablacion educativos: sirve como banco de pruebas para reproducir el pipeline de "LLM from scratch" con un coste de computo moderado y comparar variantes de inicializacion (en este caso, la variante "smart init: original").
- Modelo alumno en destilacion: con ~100 M de parametros y contexto de 1.024 tokens, es un candidato razonable para destilar modelos mayores en tareas de dominio restringido, donde solo se necesita vocabulario y sintaxis del dominio.
- Prototipado de pipelines de entrenamiento distribuido: el repositorio base (`gpjt/ddp-base-model-from-scratch`) esta pensado para ejecutar entrenamiento con paralelismo de datos, por lo que sirve para validar configuraciones de lote, learning rate y clipping antes de escalar a modelos mayores.
- Generacion de texto sintetico para pruebas de infraestructura: al ser muy ligero (~450 MB en fp32), se puede desplegar en entornos de CI o contenedores pequenos para validar endpoints de inferencia, tokenizadores y esquemas de serializacion sin consumir GPU.
- Base para fine-tuning de tareas muy concretas: clasificacion de texto, etiquetado o generacion de plantillas en un dominio acotado, partiendo de un modelo base pequeno y con licencia permisiva.
- Docencia y formacion: un modelo GPT-2 de ~100 M entrenado de principio a fin es adecuado para que estudiantes inspeccionen pesos, visualicen atenciones y entiendan el efecto de factorizaciones de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra metrica, y el autor no publica cifras de perplejidad ni de perdida final.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 450 MB en fp32 (coherente con los 0,4 GB del repositorio), unos 223 MB en fp16/bf16, unos 112 MB en int8 y unos 56 MB en int4 (estimaciones calculadas a partir de los 111,46 M de parametros; el autor no publica cifras oficiales).
- Memoria de cache KV para 1.024 tokens a fp16: del orden de 38 MB (2 x 12 capas x 1.024 tokens x 768 de dimension x 2 bytes), despreciable frente a cualquier GPU moderna.
- GPU recomendadas: no se requiere GPU de centro de datos. Cualquier GPU consumer con mas de 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. Tambien cabe comodamente en una RTX 4090, A100 o H100, aunque estarian enormemente infrautilizadas.
- Ejecucion en CPU: perfectamente viable para inferencia interactiva y fine-tuning ligero, dado el tamano del modelo.
- Opciones de despliegue: el modelo usa `custom_code`, por lo que requiere `trust_remote_code=True` en transformers. Esto complica el uso directo en runtimes que no ejecutan codigo remoto. No se han publicado pesos en formato GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa y la implementacion manual de las capas LoRE. Tampoco hay evidencia de soporte en vLLM o TGI.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

Los valores de los modelos de referencia corresponden a especificaciones publicas ampliamente conocidas; no se dispone de resultados de benchmarks comparativos publicados para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| gpjt/8xa100m40-lore-3-both-smart-init | 98,9-111,5 M (segun fuente) | 1.024 | Apache 2.0 | HuggingFace, requiere `trust_remote_code` | No disponible |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Licencia MIT modificada | Ampliamente disponible, incluido en transformers | Si (evaluaciones publicadas por OpenAI) |
| Pythia-160M (EleutherAI) | 160 M | 2.048 | Apache 2.0 | HuggingFace, transformers estandar | Si (suite de evaluacion de EleutherAI) |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | HuggingFace, transformers estandar | Si |

Frente a estas alternativas, el modelo de `gpjt` no aporta ventajas de rendimiento ni de contexto; su unico diferenciador es la factorizacion LoRE y el hecho de ser un artefacto reproducible de investigacion. Ademas, al requerir codigo personalizado, presenta mas friccion de integracion que GPT-2, Pythia o SmolLM, que funcionan con transformers estandar.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no mantiene turnos de conversacion y no aplica filtros de seguridad. No debe exponerse a usuarios finales sin un ajuste previo.
- Rendimiento objetivo bajo: el autor advierte explicitamente de que el modelo "no conoce muchos hechos y no es terriblemente listo", y lo describe como "poco listo e ignorante". No es apto para tareas que requieran conocimiento factual o razonamiento complejo.
- Riesgo elevado de alucinacion: al ser un modelo pequeno entrenado sobre un volumen limitado de tokens, la generacion de afirmaciones falsas con apariencia plausible es esperable.
- Contexto muy corto: 1.024 tokens impiden cualquier caso de uso que requiera documentos largos, historiales extensos o razonamiento multi-paso con mucho estado.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El entrenamiento sobre FineWeb (texto web sin filtrar aparentemente) implica la presencia de los sesgos tipicos de este tipo de corpus: estereotipos de genero, raza, nacionalidad y religion, ademas de posibles contenidos toxicos.
- Idiomas: no declarados. La practica totalidad del corpus FineWeb es en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No obstante, el uso comercial realista de este modelo es practicamente nulo por sus limitaciones tecnicas.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo durante la carga. Es un riesgo de seguridad en entornos no confiables y un obstaculo para auditorias y despliegues regulados.
- Ausencia de benchmarks: no existe ninguna evaluacion publicada que permita comparar su calidad de forma objetiva.
- Madurez y soporte: cero descargas y cero likes en el momento de la ficha, sin garantia de mantenimiento, actualizaciones ni correccion de errores.
- Discrepancia en el recuento de parametros: los safetensors declaran 111.460.096 y la model card 98.877.184. Conviene verificar el recuento real antes de cualquier uso que dependa de esta cifra.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-3-both-smart-init
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Repositorio del autor: https://github.com/gpjt/ddp-base-model-from-scratch
- Cuaderno de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Blog post sobre matrices de vocabulario de bajo rango (LoRE): https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices (anunciado como proximo en el momento del lanzamiento)
- Discusion donde se sugirio la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Perfil del autor, Giles Thomas: https://huggingface.co/gpjt
- Perfil de Sebastian Raschka, autor del codigo base: https://huggingface.co/rasbt
- Libro "Build a Large Language Model (from Scratch)": https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil del usuario que sugirio LoRE: https://huggingface.co/AndrewThompson1233
