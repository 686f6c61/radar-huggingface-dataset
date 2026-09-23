# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2 es un modelo de decisión ("decision model") desarrollado por el usuario chaoliangUNSW, obtenido mediante fine-tuning del modelo base Qwen/Qwen3.5-2B-Base. No es un modelo conversacional al uso: en lugar de generar texto libre, recibe un estado (state), una pregunta tipada y una lista de opciones, y devuelve en un único prefill la opción seleccionada junto con probabilidades calibradas. Esta formulación se inspira en los modelos "System One" descritos por Jev (TypeSafe AI, 2026), que sustituyen la generación autoregresiva por una decisión directa en una sola pasada.

El modelo tiene 1.881.825.088 parámetros totales (aproximadamente 1,88 mil millones, de ahí la denominación comercial "2B") y se distribuye en formato safetensors BF16 bajo licencia Apache-2.0. Está entrenado exclusivamente para inglés y su interfaz de decisión admite hasta 26 opciones etiquetadas con letras A–Z. La relevancia de esta versión v2 radica en sus mejoras medibles frente a la v1 y frente a la línea base "English Laya": 81,20 % de precisión macro en el panel de referencia en inglés (frente a 76,68 % y 75,09 % respectivamente), mejor calidad probabilística (NLL y Brier más bajos) y una robustez sensiblemente mayor frente a la permutación del orden de las opciones.

El coste de adaptación es notablemente bajo: el entrenamiento principal se completó en 36,9 minutos sobre una única H100 de 80 GB usando LoRA de rango 32. El proyecto publica además versiones GGUF (Q4_K_M, Q8_0 y BF16) y MLX BF16, cada una con su propio registro de calibración y verificación, lo que permite desplegarlo tanto en servidores como en GPU de consumo y en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (backbone de texto tipo transformer, tag oficial del repo) |
| Parametros totales | 1.881.825.088 (1,88 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, GGUF Q8_0, GGUF BF16, MLX BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF y MLX en repos derivados |
| Modelo base | Qwen/Qwen3.5-2B-Base (relacion: finetune) |
| Pipeline declarado | text-generation |
| Tamano del repo | 3,8 GB (pesos BF16: 3,76 GB) |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto Qwen3.5-2B-Base y se adapta mediante LoRA de rango 32. No se ha publicado en la informacion disponible el detalle de la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; la model card solo documenta el procedimiento de adaptacion y las particiones de evaluacion. El entrenamiento principal requirio 36,9 minutos en una unica H100 de 80 GB, lo que indica un ajuste ligero sobre el modelo base en lugar de un reentrenamiento completo.

La innovacion tecnica central no esta en el backbone, sino en la interfaz de decision: el modelo recibe una plantilla en texto plano (sin chat template) y se leen las probabilidades de los tokens correspondientes a las letras con prefijo de espacio (" A"–" Z"), hasta un maximo de 26 opciones, a temperatura T = 1. Cada decision se resuelve en un unico prefill, sin decodificacion autoregresiva de una respuesta. Sobre esa salida se aplica una temperatura de calibracion ajustada en un split de 3.100 registros; en las builds HF y MLX el cliente de inferencia la aplica automaticamente, mientras que en la build GGUF calibrada la temperatura queda incorporada en el tensor de normalizacion final. El autor reporta un ECE de 0,017 sobre 1.500 ejemplos retenidos (dato recogido en la ficha del catalogo CoreAI).

## Capacidades

- Clasificacion y toma de decisiones tipadas: dado un estado, una pregunta y un conjunto de opciones, devuelve la opcion elegida con probabilidades calibradas.
- Eleccion entre opciones multiples: soporta hasta 26 alternativas, leidas como letras A–Z con prefijo de espacio.
- Salida probabilistica calibrada: no solo devuelve la clase, sino una distribucion de confianza reutilizable para umbrales y politicas posteriores, con NLL y Brier evaluados.
- Routing y enrutamiento de decisiones: pensado explicitamente para enrutar peticiones o flujos hacia una rama concreta.
- Inferencia en una sola pasada (single-prefill): la decision se obtiene en un unico forward, sin generar texto intermedio.
- Estabilidad frente a la permutacion de opciones: la identidad semantica de cada opcion se remapea antes de puntuar, con una tasa de cambio de decision del 6,00 %.
- Cobertura de familias de tareas evaluadas: analisis de sentimiento (SST-2, SST-5, IMDb), inferencia en lenguaje natural (MNLI, ANLI, RTE, HANS), preguntas booleanas (BoolQ), clasificacion tematica (AG News), deteccion de emociones (Emotion) y deteccion de spam (Enron spam).
- Tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no; el modelo esta declarado solo para ingles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Enrutamiento de peticiones en una plataforma de LLM: ante una consulta entrante, el modelo decide en una sola pasada a que modelo o pipeline derivarla (por ejemplo, "modelo grande", "modelo de codigo", "cache"), gracias a su capacidad de routing con probabilidades calibradas y a su latencia de una unica pasada.
- Moderacion y politica de contenido con umbrales: la salida probabilistica calibrada permite fijar umbrales de decision documentados y auditables, en lugar de depender de una generacion de texto que habria que parsear.
- Clasificacion de sentimiento y soporte al cliente: las tareas SST-2 (93,00 %) e IMDb (96,33 %) de su panel de evaluacion lo hacen adecuado para etiquetar opiniones y tickets a gran escala antes de escalarlos a un humano.
- Filtrado de spam y correo no deseado: con un 97,67 % en la tarea Enron spam, puede actuar como clasificador binario de alta precision en un pipeline de correo, devolviendo la etiqueta y su confianza para decidir si se bloquea o se marca.
- Deteccion de emociones en resenas y encuestas: el salto de la v1 (58,33 %) a la v2 (85,33 %) en la tarea Emotion lo hace util para analitica de experiencia de cliente con etiquetas emocionales.
- Verificacion de entailment en pipelines de RAG: con MNLI al 88,00 % y RTE al 85,92 %, puede usarse como comprobador de si un fragmento recuperado respalda una afirmacion antes de mostrarla al usuario.
- Decisiones de politica con pares contrafactuales: en pruebas de umbral programatico, ambas decisiones de un par son correctas en el 71,50 % de los casos, lo que permite usarlo en motores de reglas que exigen coherencia entre escenarios equivalentes.
- Inferencia en el borde o en local: con la build GGUF Q4_K_M (1,27 GB, 91,4 % de acuerdo de eleccion con BF16 en CUDA) puede ejecutarse en equipos modestos y en Apple Silicon mediante MLX (99,6 % de acuerdo), sin depender de servicios externos.

## Benchmarks y rendimiento

Resultados sobre el panel de referencia fijo en ingles (11 grupos de tareas con etiquetas reales, 3.277 decisiones, pesos de tarea iguales, split de calibracion de 3.100 registros):

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Accuracy (mayor mejor) | 76,68 % | 75,09 % | 81,20 % |
| Macro-F1 (mayor mejor) | 75,42 % | 73,45 % | 79,78 % |
| Negative log-likelihood (menor mejor) | 0,5752 | 0,6318 | 0,5154 |
| Brier score (menor mejor) | 0,3290 | 0,3482 | 0,2787 |

Mejoras declaradas: +4,53 puntos sobre v1 y +6,12 sobre English Laya (intervalos de confianza pareados al 95 %: [+3,58, +5,52] y [+4,64, +7,52]). Frente a English Laya, el autor reporta un 18,4 % menos de NLL, un 20,0 % menos de Brier y un 26,4 % menos de ECE macro por tarea.

Precision por tarea (300 ejemplos por tarea, salvo RTE con 277):

| Tarea (etiquetas reales) | Ejemplos | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|---:|
| AG News | 300 | 87,67 % | 89,00 % | 88,00 % |
| ANLI | 300 | 48,00 % | 49,67 % | 48,67 % |
| BoolQ | 300 | 82,67 % | 75,67 % | 81,67 % |
| Emotion | 300 | 58,33 % | 60,33 % | 85,33 % |
| Enron spam | 300 | 77,33 % | 96,33 % | 97,67 % |
| HANS | 300 | 68,00 % | 75,00 % | 68,00 % |
| IMDb | 300 | 96,67 % | 93,67 % | 96,33 % |
| MNLI | 300 | 86,67 % | 85,00 % | 88,00 % |
| RTE | 277 | 84,48 % | 77,98 % | 85,92 % |
| SST-2 | 300 | 92,67 % | 91,67 % | 93,00 % |
| SST-5 | 300 | 61,00 % | 31,67 % | 60,67 % |

Grupo separado de decisiones tipadas con referencia de profesor (2.000 decisiones procedentes de 400 estados): el acuerdo con el profesor es del 53,35 % para v1, 37,55 % para English Laya y 73,45 % para v2. Este grupo queda excluido del macro de etiquetas reales.

Pruebas de robustez:

| Prueba de permutacion de opciones | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Tasa de cambio de decision (menor mejor) | 9,25 % | 12,00 % | 6,00 % |
| Accuracy tras permutacion (mayor mejor) | 66,75 % | 67,00 % | 80,00 % |

En una prueba independiente de politica de umbrales con 200 pares programaticos, ambas decisiones del par son correctas en el 71,50 % de los pares en v2, frente al 63,00 % en v1.

Validacion de los formatos de despliegue publicados:

| Formato publicado | Tamano de pesos | Resultado validado | Conjunto de evaluacion |
|---|---:|---|---|
| HF BF16 | 3,76 GB | 81,27 % accuracy macro de etiquetas reales | Las 3.277 decisiones completas |
| MLX BF16 nativo | 3,76 GB | 99,6 % de acuerdo de eleccion con CUDA BF16 | Subconjunto congelado de 500 decisiones |
| GGUF Q8_0 calibrado | 2,01 GB | 99,2 % de acuerdo de eleccion con CUDA BF16 | Mismo subconjunto de 500 decisiones |
| GGUF Q4_K_M calibrado | 1,27 GB | 91,4 % de acuerdo de eleccion con CUDA BF16 | Mismo subconjunto de 500 decisiones |
| GGUF BF16 calibrado | 3,78 GB | 99,6 % de acuerdo de eleccion con CUDA BF16 | Mismo subconjunto de 500 decisiones |

No se han publicado resultados de benchmarks estandar de generacion (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, calculada a partir del tamano de pesos publicado mas margen para activaciones con contexto corto):
  - BF16 safetensors (3,76 GB de pesos): aproximadamente 4–5 GB de VRAM.
  - GGUF Q8_0 (2,01 GB): aproximadamente 2,5–3 GB de VRAM.
  - GGUF Q4_K_M (1,27 GB): aproximadamente 1,5–2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060/4060, RTX 4070/4080, RTX 4090, L4/L40S, A100 y H100 son adecuadas con holgura. Para entrenamiento, el autor uso una unica H100 de 80 GB (36,9 minutos de entrenamiento principal con LoRA rango 32).
- Cabe en GPU de consumo: si. La cuantizacion Q4_K_M (1,27 GB) entra en practicamente cualquier GPU moderna de consumo e incluso en equipos con memoria unificada limitada; la version BF16 cabe tambien en GPU de 6–8 GB.
- Apple Silicon: hay una build MLX BF16 nativa (3,76 GB) validada con un 99,6 % de acuerdo de eleccion frente a CUDA BF16.
- Opciones de despliegue:
  - Transformers con cliente de decision (build HF BF16 de este repositorio).
  - llama.cpp con los ficheros GGUF (Q4_K_M, Q8_0, BF16), todos ellos calibrados.
  - Cliente MLX nativo en Apple Silicon.
  - Endpoints compatibles: el repositorio esta etiquetado como `endpoints_compatible`.
  - vLLM, TGI, Ollama, SGLang: no disponible (no confirmado en la informacion proporcionada).
- Latencia y throughput: no disponibles como cifras. Cualitativamente, el diseno de prefill unico implica una sola pasada por decision, sin decodificacion autoregresiva de texto, lo que reduce el coste por inferencia frente a un modelo generativo del mismo tamano. En la build GGUF Q4_K_M se observo un 91,4 % de acuerdo de eleccion con BF16 en CUDA, lo que conviene tener en cuenta si el caso de uso es sensible a pequenas variaciones de decision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (panel EN) | Macro-F1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 | 1,88 B | no disponible | 81,20 % | 79,78 % | Apache-2.0 | HF BF16, GGUF (Q4_K_M/Q8_0/BF16), MLX BF16 |
| Jev-Style v1 (linea anterior) | no disponible | no disponible | 76,68 % | 75,42 % | no disponible | no disponible en la informacion proporcionada |
| English Laya (linea base comparada) | no disponible | no disponible | 75,09 % | 73,45 % | no disponible | no disponible en la informacion proporcionada |
| Qwen/Qwen3.5-2B-Base (modelo base) | clase 2B | no disponible | no evaluado en este panel | no evaluado | no disponible en la informacion proporcionada | Hugging Face |

La comparacion se limita al panel de referencia en ingles definido por el autor, por lo que las cifras de v1 y English Laya solo son validas dentro de esa misma particion (3.277 decisiones, mismos pesos de tarea y mismo split de calibracion). Tambien existe una variante derivada de terceros, mlboydaisuke/Qwen3.5-2B-Decision-CoreAI, construida a partir de la build MLX BF16 de este modelo y distribuida bajo Apache-2.0.

## Limitaciones y advertencias

- No es un modelo generativo de proposito general: no debe usarse para redactar texto, resumir o mantener conversaciones; su salida es una eleccion entre opciones con probabilidades. El pipeline declarado es `text-generation`, pero la funcionalidad real es de decision y clasificacion.
- Idioma: entrenado y evaluado unicamente en ingles. El rendimiento fuera del ingles no esta documentado y no deberia asumirse.
- Longitud de contexto: no publicada. No hay garantia sobre el comportamiento con estados largos; conviene validar el caso concreto antes de desplegar.
- Tareas con rendimiento bajo o moderado: ANLI (48,67 %) y HANS (68,00 %) quedan cerca del azar o muy por debajo de otras tareas del propio panel, lo que indica que la inferencia natural adversarial y las heuristicas de sesgo no estan resueltas.
- Sensibilidad al formato: la interfaz espera la plantilla de texto plano sin chat template y la lectura de letras con prefijo de espacio (" A"–" Z") a T = 1. Cambiar el formato, el tokenizador de espacios o la temperatura puede degradar la calibracion.
- Calibracion dependiente del split: la temperatura se ajusta sobre 3.100 registros y viaja dentro de cada build. Sustituir el tensor de normalizacion en la GGUF calibrada o reutilizar los pesos sin ese ajuste invalida las garantias de calibracion reportadas.
- La cuantizacion Q4_K_M reduce el acuerdo de eleccion hasta el 91,4 % respecto a BF16; en decisiones con umbrales ajustados esa diferencia puede ser material.
- Riesgo de alucinacion: al no generar texto, el riesgo no se manifiesta como afirmaciones inventadas, sino como decisiones de alta confianza incorrectas en tareas fuera de la distribucion evaluada. Las probabilidades estan calibradas en el panel de referencia, no necesariamente en dominios nuevos.
- Sesgos: no se documentan analisis de sesgo demografico, politico o cultural en la informacion disponible. Las tareas del panel (spam, emociones, entailment) pueden arrastrar sesgos de sus datasets de origen.
- Licencia: Apache-2.0, permisiva y compatible con uso comercial. Conviene verificar, no obstante, las condiciones del modelo base Qwen/Qwen3.5-2B-Base, ya que la informacion de licencia de dicho base no se detalla en la informacion proporcionada.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes, y los datos de evaluacion provienen del propio autor sobre un panel fijo definido por el mismo. No hay replicacion independiente publicada.
- Uso en produccion: la validacion por formato se hizo sobre un subconjunto congelado de 500 decisiones; los formatos GGUF y MLX no se validaron sobre el panel completo de 3.277 decisiones.

## Enlaces

- Modelo en Hugging Face (HF BF16, repositorio principal): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Build GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Build MLX BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Repo GGUF (version anterior, referenciada en resultados de busqueda): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Entrada de catalogo en coreai-kit (pull request 35, formato `decisionFunction`, lectura de letras A–Z y ECE reportado): https://github.com/john-rocky/coreai-kit/pull/35
- Variante derivada de terceros (CoreAI): https://huggingface.co/mlboydaisuke/Qwen3.5-2B-Decision-CoreAI
- Ficha del artefacto GGUF en Hugging Bay: https://huggingbay.xyz/artifact/hf-model-chaoliangunsw-jev-style-qwen3-5-2b-decision-gguf
