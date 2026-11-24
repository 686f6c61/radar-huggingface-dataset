# llm-semantic-router/Vela-1.0-Omni-Nano

## Resumen

Vela-1.0-Omni-Nano es un modelo de embeddings multimodales desarrollado por el proyecto vLLM Semantic Router. Su funcion principal no es generar texto, sino proyectar texto, imagenes, voz y audio ambiental en un unico espacio vectorial normalizado de 384 dimensiones, de modo que similitud coseno entre modalidades distintas sea directamente comparable. Resuelve el problema de construir un router semantico y un sistema de busqueda multimodal con un unico modelo pequeno, en lugar de encadenar especialistas separados por modalidad.

Con 163.771.288 parametros (163,8 M) y un repositorio de 3,9 GB, se situa en la categoria de modelos de embedding compactos. La ventana de texto es de solo 512 tokens, incluyendo tokens especiales, y admite audio PCM original a 16, 44,1 o 48 kHz de hasta 30 segundos. La salida son vectores L2-normalizados, pensados para recuperacion, clustering y clasificacion por prototipos.

La relevancia actual viene de que cubre las tres modalidades con una licencia Apache 2.0 y un coste de inferencia muy bajo, y de que declara rankings competitivos frente a modelos de su mismo tamano: 5/75 en el panel MTEB English v2 y 6/27 en el panel MAEB audio-only. Es la version Nano de la familia Vela 1.0, que incluye tambien un modelo Mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embedding multimodal con rama de audio CLAP congelada; detalles de capas no publicados) |
| Parametros totales | 163.771.288 (163,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de texto, incluyendo tokens especiales; audio de hasta 30 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; la evaluacion MTEB Multilingual v2 se reporta como limitacion de cobertura |
| Licencia | Apache 2.0 (con atribucion de componentes) |
| Formato de pesos | safetensors (libreria pytorch) |
| Dimension de embedding | 384 |
| Modalidades | texto, imagen, voz y audio ambiental |
| Entrada de audio | PCM original a 16, 44,1 o 48 kHz, maximo 30 s |
| Salida | vectores L2-normalizados, similitud coseno |
| Pipeline | feature-extraction |
| Tamano del repositorio | 3,9 GB |

## Arquitectura y entrenamiento

La model card describe un modelo multimodal que conserva los calculos de texto e imagen de la generacion anterior y anade una rama de audio CLAP congelada, que aporta informacion de sonido ambiental sobre la representacion de voz ya existente. Los embeddings de audio son los recien entrenados y evaluados; no se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El dato tecnico mas concreto publicado es el de equivalencia de componentes (`benchmarks/component-equivalence.json`), que documenta la identidad medida entre las partes retenidas y las nuevas. Respecto a la version Nano anterior, los parametros crecen un 20,97 % y el Mean(TaskType) de audio sube de 46,97 a 52,34, aunque la propia card reconoce retrocesos en recuperacion voz-texto y en VehicleSoundClustering. No se declaran innovaciones como decodificacion especulativa o atencion lineal, coherentes con un modelo de embeddings y no de generacion.

## Capacidades

- Embeddings de texto con ventana de 512 tokens, orientados a clasificacion por prototipos y recuperacion densa.
- Embeddings de imagen para recuperacion imagen-texto y texto-imagen.
- Embeddings de voz para recuperacion audio-texto y texto-audio (evaluados sobre LibriSpeech).
- Embeddings de audio ambiental mediante la rama CLAP congelada, con tareas como clasificacion de pares de audio (NMSQA).
- Espacio vectorial compartido entre modalidades: las distancias entre texto, imagen y audio son comparables directamente por similitud coseno.
- Uso como router semantico: clasificacion de intenciones y enrutado de peticiones dentro del stack vLLM Semantic Router.
- Clustering multimodal sobre vectores normalizados.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no un LLM.

## Casos de uso

- Router semantico de peticiones: clasificar la intencion de una consulta de usuario comparando su embedding con prototipos etiquetados; la evaluacion sobre Banking77 (87,99 de accuracy) y MASSIVE English (81,97) respalda este uso en dominios de intenciones acotados.
- Busqueda multimodal en catalogo: indexar imagenes y descripciones textuales en el mismo espacio de 384 dimensiones para recuperacion cruzada; COCO R@1 de 60,87 en imagen-texto y 55,82 en texto-imagen.
- Busqueda por voz en bases documentales: transcribir no es necesario si se compara el embedding de audio con embeddings de texto, con R@1 de 16,12 en LibriSpeech audio-texto.
- Deduplicacion y clustering de contenido: agrupar imagenes, fragmentos de texto o clips de audio similares usando vectores L2-normalizados y umbrales de coseno.
- Moderacion y triaje de audio ambiental: detectar y clasificar eventos sonoros (por ejemplo, ruido de trafico o vehiculo) combinando la rama CLAP con la representacion de voz.
- Filtrado previo en pipelines RAG: descartar o enrutar consultas antes de invocar un LLM mayor, reduciendo coste por token al resolver la clasificacion con un modelo de 163,8 M.
- Sistemas de recomendacion por similitud: comparar embeddings de texto e imagen de items para sugerir contenido afinn, con inferencia barata en CPU o GPU pequena.

## Benchmarks y rendimiento

Resultados de la evaluacion propia del autor (escala 0-100, mayor es mejor; mismo protocolo y mismo pool de recuperacion para ambos modelos):

| Metrica | Original small | Vela-1.0-Omni-Nano |
|---|---:|---:|
| Banking77 · Accuracy | 70,42 | 87,99 |
| MASSIVE English · Accuracy | 65,95 | 81,97 |
| COCO · Image → text · R@1 | 40,83 | 60,87 |
| COCO · Text → image · R@1 | 30,18 | 55,82 |
| LibriSpeech · Audio → text · R@1 | 4,21 | 16,12 |
| LibriSpeech · Text → audio · R@1 | 9,58 | 20,34 |

Benchmarks estandar y rankings (snapshots del registro del 17 de septiembre de 2026):

| Benchmark | Mean(TaskType) | Ranking global | Ranking a tamano ≤ | Gap al mejor a tamano ≤ | Mean(Task) |
|---|---:|---:|---:|---:|---:|
| MTEB English v2 · 41 tareas | 60,78 | 66/188 | 5/75 | 0,61 pp | 64,88 |
| MAEB audio-only · 19 tareas | 52,34 | 19/64 | 6/27 | 3,51 pp | 43,59 |
| MTEB Multilingual v2 · 131 tareas | 34,01 | 81/89 | 21/26 | 17,11 pp | 42,55 |

Frente a la Nano anterior, el Mean(TaskType) de audio pasa de 46,97 a 52,34. El autor advierte que los rankings son relativos a snapshots y que incluyen especialistas de una sola modalidad, y que el modelo original small no se ha evaluado en estos paneles completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 163,8 M parametros en float32 el peso ocupa aproximadamente 0,65 GB, y en float16 unos 0,33 GB, a lo que hay que sumar activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente en la practica; no se publican perfiles de A100, H100 o RTX 4090 especificos.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores; tambien es viable en CPU.
- Opciones de despliegue: PyTorch con Transformers 4.57.6, torchaudio compatible, huggingface_hub, safetensors, NumPy y Pillow; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no encajan con un pipeline de feature-extraction.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Omni-Nano | 163,8 M | 512 tokens; audio 30 s | texto, imagen, voz, audio ambiental | Apache 2.0 | Hugging Face |
| multi-modal-embed-small (original) | no disponible | no disponible | multimodal | no disponible | Hugging Face |
| Modelos del panel MTEB English v2 ≤ 163,8 M (75 en total) | ≤ 163,8 M | variable | mayoritariamente texto | variable | Hugging Face |
| Modelos del panel MAEB audio-only ≤ 163,8 M (27 en total) | ≤ 163,8 M | variable | audio | variable | Hugging Face |

En MTEB English v2 el modelo queda a 0,61 pp del mejor modelo de su misma categoria de tamano, y en MAEB audio-only a 3,51 pp. En MTEB Multilingual v2 la brecha es de 17,11 pp, lo que lo situa lejos de la cabeza en cobertura multilingue.

## Limitaciones y advertencias

- Cobertura multilingue limitada: el propio autor la senala como punto debil, con 34,01 de Mean(TaskType) y ranking 21/26 entre modelos de tamano igual o menor.
- Ventana de texto de solo 512 tokens, insuficiente para documentos largos; requiere troceado previo.
- Audio limitado a 30 segundos por entrada y a PCM original a 16, 44,1 o 48 kHz.
- Retrocesos reconocidos frente a la Nano anterior en recuperacion voz-texto y en VehicleSoundClustering.
- No genera texto ni soporta tool calling, agentes o razonamiento multi-paso; usarlo fuera de tareas de embedding no es adecuado.
- Riesgo de alucinacion no aplica en sentido estricto, pero la clasificacion por prototipos puede producir falsos positivos en intenciones fuera de la distribucion de entrenamiento.
- Los rankings publicados son relativos a snapshots de septiembre de 2026 y a protocolos declarados por el autor, no a evaluaciones oficiales MTEB de clasificacion.
- Licencia Apache 2.0 permite uso comercial, pero la card exige respetar la atribucion de componentes, incluida la rama CLAP congelada.
- No se publican datos sobre sesgos, composicion del dataset ni cuantizaciones soportadas, lo que limita la evaluacion de riesgos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Omni-Nano
- Coleccion Vela 1.0: https://huggingface.co/collections/vllm-sr/vela-10-6aa555ba70cc6997d6d67798
- Demo Vela Studio: https://huggingface.co/spaces/vllm-sr/vela-studio
- Documentacion: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
- Evaluacion detallada: benchmarks/EVALUATION.md (en el repositorio del modelo)
- Equivalencia de componentes: benchmarks/component-equivalence.json
- Rankings completos: benchmarks/complete-panel-ranks.md
- Historial de releases: benchmarks/release-history.md
- Resultados MTEB Multilingual v2: benchmarks/mteb-multilingual-v2.json
- Metodologia Pareto: benchmarks/pareto-methodology.md
- Galeria de figuras: benchmarks/pareto-gallery.md
- Modelo original small: https://huggingface.co/vllm-sr/multi-modal-embed-small/tree/fdf8e01b7b0f3a69ac1ac8e2a64dcb1ede177ba4
