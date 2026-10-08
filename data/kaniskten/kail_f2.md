# Kaniskten/Kail_F2

## Resumen

KAIL F2 es un modelo de lenguaje causal de tipo decoder-only con aproximadamente 1,12 mil millones de parametros (1.123.372.800 segun los pesos en safetensors), desarrollado por Kaniskten Programming. Emplea una arquitectura propia denominada KailA (`KailAForCausalLM`), una variante de transformer con Grouped-Query Attention (GQA) y Rotary Position Embeddings (RoPE) configurada para una ventana de contexto de 131.072 tokens. Esta publicado en Hugging Face bajo licencia Apache-2.0, con pesos en BF16 y soporte para inferencia local.

El modelo se distribuye como pesos abiertos para experimentacion, investigacion e inferencia local, e incluye su propia implementacion de referencia, por lo que requiere `trust_remote_code=True` al cargarse con Transformers. Su relevancia es limitada y de nicho: se trata de un modelo pequeno de proposito general cuyos resultados de evaluacion estandarizada son bajos (media de 36,28% en el conjunto de benchmarks reportado), lo que lo situa mas cerca de un ejercicio de arquitectura y de un punto de partida para ajuste fino que de un modelo listo para produccion exigente.

El modelo solo declara soporte para ingles, no publica informacion sobre el dataset de entrenamiento ni sobre fases de alineamiento (RLHF/DPO), y en el momento de la consulta acumula 0 descargas y 0 "likes" en Hugging Face. La propia model card advierte que los resultados de benchmarks son mediciones direccionales y no puntuaciones de leaderboard sobre el conjunto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KailA (`KailAForCausalLM`), transformer decoder-only con GQA y RoPE |
| Parametros totales | 1.123.372.800 (~1,12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (maximo configurado) |
| Tipos de cuantizacion | BF16 (pesos publicados); GGUF segun etiquetas del repositorio; tipos concretos de cuantizacion no disponibles |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (segun repositorio) |

Datos adicionales de configuracion: 24 capas, hidden size 1536, 16 cabezas de atencion, 2 cabezas clave/valor, dimension de cabeza 128, intermediate size 4608, tamano de vocabulario 130.560, RoPE theta 5.000.000, dtype BF16, tamano del repositorio 2,2 GB.

## Arquitectura y entrenamiento

KailA es una arquitectura transformer decoder-only orientada a inferencia autorregresiva eficiente. Cada bloque aplica RMSNorm de pre-normalizacion, una capa de GQA con RoPE (16 cabezas de consulta compartiendo 2 cabezas clave/valor, lo que reduce el tamano del KV-cache), un modulo ligero denominado Adaptive Attention Controller que genera factores de escalado de atencion dependientes del contexto, una conexion residual, un segundo RMSNorm y una red feed-forward con SwiGLU mas un Feature Router que modula la ruta gated segun la representacion actual. Soporta KV caching y Scaled Dot-Product Attention a traves de las implementaciones de atencion de PyTorch. La atencion con 2 cabezas KV sobre 16 de consulta implica un ratio de compresion de 8:1 en el cache.

No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni la existencia de fases de ajuste por instrucciones, RLHF o DPO. La model card tampoco documenta el proceso de tokenizacion mas alla de los tokens especiales (`<s>` para BOS, `</s>` para EOS/padding, `<unk>` para desconocido) y un vocabulario de 130.560 entradas. La innovacion tecnica declarada se limita a los dos componentes adaptativos anadidos al bloque transformer (Adaptive Attention Controller y Feature Router), sin datos que cuantifiquen su impacto.

## Capacidades

- Generacion de texto autorregresiva y completado de secuencias a partir de un prefijo, con controles de muestreo estandar (temperature, top_p, top_k, repetition_penalty) y decodificacion greedy para salida determinista.
- Modelado de lenguaje causal (`causal-lm`), por lo que sirve como base para ajuste fino supervisado o continuado.
- Etiquetado como conversacional en Hugging Face, aunque la model card solo menciona que se puede usar la configuracion de plantilla de chat del repositorio "donde sea apropiado", sin detallar formato.
- Soporte de KV caching para generacion autorregresiva incremental.
- Capacidad multilingue: solo ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Experimentacion con la arquitectura KailA: el repositorio incluye la implementacion de referencia, por lo que es util para estudiar en la practica el efecto de un Adaptive Attention Controller y un Feature Router sobre un transformer decoder-only de 24 capas.
- Inferencia local en portatil: con 1,12B parametros y pesos BF16 de unos 2,25 GB (o menos si se cuantiza), cabe en GPUs de consumo con 6-8 GB de VRAM y permite ejecutar generacion de texto sin conexion, como plantea el ecosistema de descargas del propio autor.
- Punto de partida para ajuste fino: su licencia Apache-2.0 y su tamano manejable lo hacen apto para fine-tuning en un unico acelerador y para tareas muy acotadas de dominio (clasificacion generativa, extraccion de campos, reformulacion de frases).
- Generacion de texto de relleno o sintetico a pequena escala: completado de plantillas, generacion de variaciones de texto o datos de aumento, siempre con revision humana dado el bajo rendimiento en benchmarks.
- Prototipado y pruebas de integracion con Transformers: sirve para validar pipelines de carga con `trust_remote_code`, gestion de KV cache y despliegue en llama.cpp/GGUF antes de migrar a un modelo mayor.
- Educacion y divulgacion: util como ejemplo reproducible y ligero para explicar GQA, RoPE con theta elevado y cache de atencion en un modelo abierto.
- No se recomienda para atencion al cliente, generacion de codigo en produccion, razonamiento matematico ni tareas que exijan fiabilidad factual o tool calling, dado su nivel de rendimiento medido.

## Benchmarks y rendimiento

Evaluacion realizada localmente con `lm-evaluation-harness` 0.4.13, inferencia en BF16 sobre una unica GPU de consumo. Los resultados son mediciones direccionales: las tareas distintas de MMLU se evaluaron sobre una muestra de 500 ejemplos y MMLU con hasta 20 preguntas por asignatura. HumanEval no se reporta.

| Benchmark | Resultado |
|---|---:|
| MMLU | 25,0% |
| ARC-Easy | 36,0% |
| ARC-Challenge | 25,6% |
| HellaSwag | 28,6% |
| WinoGrande | 53,2% |
| GSM8K | 8,4% |
| TruthfulQA (MC2) | 49,77% |
| PIQA | 50,6% |
| OpenBookQA | 30,2% |
| BoolQ | 55,4% |
| Media | 36,28% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,25 GB en disco y en memoria. El repositorio ocupa 2,2 GB segun Hugging Face.
- Pesos en FP32: aproximadamente 4,5 GB.
- Cuantizacion a 8 bits: aproximadamente 1,1-1,2 GB. A 4 bits: aproximadamente 0,6-0,7 GB (estimaciones a partir del numero de parametros; los tipos concretos de GGUF no estan documentados en la informacion disponible).
- KV cache: con 24 capas, 2 cabezas KV de dimension 128 y dtype BF16, el cache ocupa unos 24 KB por token, es decir, alrededor de 3 GB si se llena la ventana completa de 131.072 tokens. Para uso practico conviene limitar la longitud efectiva.
- GPU recomendadas: cabe en tarjetas de consumo con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070, RTX 4090) en BF16 o cuantizado. Para contextos largos o lotes mayores conviene una GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40 GB).
- CPU: la inferencia es viable en CPU mediante cuantizacion GGUF y llama.cpp, con latencias mucho mayores.
- Opciones de despliegue: Transformers (con `transformers>=5.14.0`, `accelerate` y `torch`, y `trust_remote_code=True`), llama.cpp y herramientas compatibles con GGUF (incluido Ollama, si se importa el GGUF). El soporte de vLLM o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Datos de referencia tomados de las model cards publicas de cada alternativa; no se dispone de comparativas de benchmarks directas con KAIL F2.

| Modelo | Parametros | Contexto | Licencia | Formatos |
|---|---:|---:|---|---|
| KAIL F2 | 1,12B | 131.072 | Apache-2.0 | safetensors (BF16), GGUF |
| TinyLlama-1.1B | ~1,1B | 2.048 | Apache-2.0 | safetensors, GGUF |
| Llama 3.2 1B | ~1,23B | 131.072 | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5-1.5B | ~1,54B | 32.768 (ampliable) | Apache-2.0 | safetensors, GGUF |

KAIL F2 iguala a Llama 3.2 1B en ventana de contexto declarada y supera claramente a TinyLlama en ese aspecto, pero no hay datos publicos que permitan afirmar que su rendimiento efectivo sea comparable: su media de 36,28% en el conjunto evaluado y su 8,4% en GSM8K sugieren un nivel de capacidad muy por debajo del de modelos de tamano similar ampliamente utilizados.

## Limitaciones y advertencias

- Rendimiento bajo en evaluacion estandarizada: media de 36,28%, con 25,0% en MMLU, 28,6% en HellaSwag y 8,4% en GSM8K. Estas cifras indican capacidad limitada de razonamiento, conocimiento factual y matematicas.
- Riesgo alto de alucinacion: no hay informacion sobre alineamiento (RLHF, DPO) ni sobre datos de entrenamiento que permitan acotar la fiabilidad de las respuestas.
- Sesgos desconocidos: no se documenta la composicion del dataset ni se han publicado analisis de sesgo.
- Solo ingles declarado: no hay soporte multilingue verificado, por lo que no deberia usarse en castellano u otros idiomas.
- Ventana de contexto nominal de 131.072 tokens, pero su uso real depende de la memoria disponible; el KV cache completo ronda los 3 GB.
- Codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en entornos de produccion.
- Discrepancia en el recuento de parametros: material promocional del autor en redes sociales cita 1,5B para "Kail F2", mientras que los pesos en safetensors suman 1,12B. Debe tomarse como referencia el dato real de safetensors.
- Licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion; no incluye garantias.
- Sin traccion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte, ejemplos o correcciones de terceros.
- El repositorio muestra historial de cambios reciente (commits que eliminan scripts como `run_kail_gguf.py`), senal de que el soporte de GGUF puede estar en evolucion y de que la API del repositorio puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaniskten/Kail_F2
- Arbol de ficheros del repositorio: https://huggingface.co/Kaniskten/Kail_F2/tree/main
- Descargas de la aplicacion Kail AI (modelo Kail S2 preempaquetado): https://kail-ai.com/downloads/
- Acceso a la API de Kail: https://kanisktenprogramming.com/api/
- Publicacion promocional del autor en Instagram: https://www.instagram.com/p/DXumUWSkwQ_/
