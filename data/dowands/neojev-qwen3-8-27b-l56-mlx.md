# dowands/NeoJev-Qwen3.8-27B-L56-MLX

## Resumen

NeoJev-Qwen3.8-27B-L56-MLX es un build en MLX (4 bits) del proyecto NeoJev, desarrollado por el usuario dowands sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo generativo: convierte cualquier texto de entrada (el *estado*) más un conjunto de preguntas definidas por el usuario en decisiones tipadas —una opción elegida, una probabilidad por opción y una confianza— en una única pasada hacia delante, sin generar ni parsear texto. Al restringir la salida al esquema proporcionado, una respuesta fuera de rango es imposible por construcción, lo que elimina la clase de errores típica de pedir JSON a un LLM generativo. Es una implementación local y abierta de la idea de "modelo de Sistema 1" (decisiones tipadas en lugar de texto) popularizada por Jev, de TypeSafe AI, con la que el proyecto no tiene afiliación.

El build conserva solo las primeras 56 de las 64 capas del transformer denso de Qwen3.8-27B (13,4 GB de pesos en lugar de unos 16 GB), lo que reduce el cómputo un 12,5 % mediante *early exit*. Sobre el estado de la capa 56 se aplica una cabeza de lectura sin etiquetas, entrenada por autodestilización contra la distribución de opciones del modelo completo de 64 capas. El resultado medido es una precisión media de 0,727 en 11 tareas retenidas, con latencias de 310 ms de mediana y 571 ms de p99 en un M5 Pro. El modelo acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha, por lo que no cuenta todavía con validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida heredada de Qwen3.8-27B (16 de 64 capas con atención completa, 48 con atención lineal de estado recurrente constante); este build conserva únicamente las primeras 56 capas |
| Parámetros totales | 23.851.848.896 (unos 23,85 mil millones) según los pesos safetensors del repositorio; el modelo base declarado es de 27B |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; el autor limita cada llamada a un presupuesto de 160 tokens de estado |
| Tipos de cuantización | 4 bits en este build MLX; el build hermano para CUDA usa FP8 |
| Idiomas soportados | no disponible; los corpus de destilación listados son mayoritariamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 bits, MLX); cabeza de lectura en decider_head.npz |
| Tamaño del repositorio | 13,5 GB |
| Pipeline declarado | text-classification |
| Librería | mlx |
| Versiones requeridas | mlx==0.32.2, mlx-lm==0.31.3, numpy, huggingface_hub |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de la familia Qwen3.8 con una columna vertebral de atención híbrida: solo 16 de sus 64 capas ejecutan atención completa (con `full_attention_interval: 4`), mientras que las otras 48 usan atención lineal con un estado recurrente constante. NeoJev no reentrena ese cuerpo: aplica una salida temprana en la capa 56 y añade una cabeza de lectura cuyo cálculo es `h + (h U) V + b + c[position]`, con rango 1024 y seguida de la normalización final y la cabeza LM propias del modelo base.

La innovación clave es que esa cabeza se entrena sin etiquetas, por autodestilización: el objetivo es la distribución de opciones que produce el modelo completo de 64 capas en el *layout* original de prompt, sobre 4.000 textos y 10.035 preguntas generadas aleatoriamente. Al no depender de anotaciones humanas, la cabeza es agnóstica de tarea y transferible: pasó del build MLX de 4 bits al build CUDA FP8 sin reentrenamiento. La lectura se completa con tres piezas más: un *layout* en el que las preguntas se precalculan una vez por esquema y se cachean (cada llamada solo procesa el estado y un disparador corto por pregunta, `Q1:`, `Q2:`..., todo en una pasada); una calibración con una única temperatura global (T = 1,373) ajustada sobre etiquetas públicas de las fuentes de destilación; y un presupuesto de 160 tokens por llamada, que en estados largos conserva el primer 40 % y el último 60 % de los tokens. Las fuentes de destilación incluyen bbc-news, 20_newsgroups, enron_spam, subj, sst5, toxic_conversations, amazon_counterfactual_en, student-question-categories, CR, rte, mrpc, qnli, cais/mmlu, allenai/qasc, ehovy/race y openlifescienceai/medmcqa.

## Capacidades

- Decisiones tipadas en una sola pasada hacia delante, con tres tipos de pregunta: `choice` (entre 2 y 16 opciones, devuelve la opción elegida y la probabilidad de cada una), `score` (niveles ordenados, devuelve nivel elegido, probabilidades e `expected_index` como valor continuo esperado) y `noul` (probabilidad de que un enunciado sea cierto).
- Salida restringida por construcción al esquema proporcionado: no puede devolver una opción que no se le haya ofrecido, lo que elimina el parseo y la validación de formato.
- Cabeza de lectura agnóstica de tarea: al no haberse entrenado con etiquetas, admite esquemas y preguntas nuevas sin datos adicionales.
- Caché de esquema: con `cache_schema=True` (por defecto) las preguntas se colocan primero y se reutilizan entre llamadas con el mismo conjunto; el servidor implementa una caché LRU de 64 esquemas. Con `cache_schema=False` se usa para preguntas puntuales cuyas opciones cambian en cada llamada, como QA de opción múltiple.
- Servidor HTTP con el endpoint `POST /v1/systemone` en el formato de petición/respuesta de TypeSafe, compatible con clientes escritos para esa API y con el `TypeSafeAdapter` de JevBench.
- Confianza calibrada y probabilidades por opción, aptas para umbralizar y derivar a revisión humana.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no genera texto intermedio ni cadenas de pensamiento.
- No hay uso documentado de visión o audio, pese a que el modelo base Qwen3.8-27B es multimodal nativo; el pipeline declarado es text-classification.
- Capacidades multilingües: no documentadas ni evaluadas.

## Casos de uso

- Triaje de tickets de soporte: una única llamada puede resolver simultáneamente el equipo destinatario (`choice`), la urgencia (`score` con `expected_index`) y el riesgo de fuga (`noul`), como ilustra el propio ejemplo del autor con un cliente que amenaza con disputar un cargo. La probabilidad por opción y la confianza permiten enrutar automáticamente solo por encima de un umbral.
- Enrutado de documentos y correo en backoffice: clasificación de correos entrantes (enron_spam figura entre las fuentes de destilación) hacia colas concretas sin entrenar un clasificador específico ni etiquetar datos.
- Moderación de contenido a escala: evaluar con `noul` enunciados del tipo "este texto contiene una amenaza" sobre grandes volúmenes, usando la probabilidad calibrada como puntuación continua en lugar de una etiqueta binaria frágil.
- Generación de etiquetas para construir datasets (*weak supervision*): el modelo actúa como anotador previo sobre corpus sin etiquetar, y su salida probabilística permite seleccionar por confianza los ejemplos que pasarán a revisión humana.
- Scoring de riesgo con salida calibrada: al devolver una probabilidad y no una clase, encaja en modelos de decisión donde el coste de un falso negativo y un falso positivo difieren, ya que el umbral se fija aguas abajo según la temperatura calibrada (T = 1,373).
- Control de calidad y auditoría de respuestas de otros LLM: formular como `noul` afirmaciones del tipo "la respuesta contiene una cifra inventada" o "el tono es adecuado" y usar la probabilidad como filtro automático en un pipeline.
- QA de opción múltiple: con `cache_schema=False`, las opciones cambian en cada llamada y el modelo devuelve directamente la opción elegida, sin necesidad de extraer letras de una generación libre.
- Decisión pura en local sobre hardware Apple: al ejecutarse en MLX con 13,4 GB de pesos y sin generación autorregresiva, es viable para inferencia en un portátil Apple Silicon en escenarios donde enviar el texto a un servicio externo no es aceptable.

## Benchmarks y rendimiento

El autor evalúa sobre 11 tareas retenidas por completo del entrenamiento, con 500 ítems de test por tarea y 5.500 llamadas en total. El desglose por tarea aparece truncado en la información disponible, por lo que solo se reproducen los agregados.

| Métrica | NeoJev MLX 4 bits (56 capas) | NeoJev CUDA FP8 (56 capas) | Baseline: Qwen3.8-27B de 64 capas, zero-shot | *Logit lens* puro sobre la capa 56 |
|---|---|---|---|---|
| Precisión media | 0,727 | 0,724 | no disponible | 0,663 |
| Latencia mediana | 310 ms | 107 ms | no disponible | no disponible |
| Latencia p99 | 571 ms | 133 ms | no disponible | no disponible |
| Hardware de medida | M5 Pro, 64 GB | L20, 48 GB | no disponible | no disponible |

El baseline es el mismo modelo base con las 64 capas, leyendo los logits de opción en modo zero-shot con el *layout* natural (estado primero, una pregunta cada vez). La comparación con el *logit lens* puro sobre la capa 56 demuestra que la cabeza entrenada por destilización aporta 0,064 puntos de precisión media frente a leer directamente los logits de esa capa. Los resultados por tarea individual, así como los de JevBench, no están disponibles en la información proporcionada.

## Requisitos de hardware

- Pesos: 13,4 GB en 4 bits para las 56 capas; el repositorio completo ocupa 13,5 GB.
- Apple Silicon: el autor lo mide en un Mac con M5 Pro y 64 GB de memoria unificada. No se publica el mínimo de memoria unificada, pero al ocupar los pesos 13,4 GB se necesita un equipo con memoria unificada holgadamente por encima de esa cifra, más el *overhead* del runtime de MLX.
- NVIDIA: el build hermano en FP8 se mide en una L20 de 48 GB. No se publica el tamaño de sus pesos ni el mínimo de VRAM.
- GPU de consumo: no hay datos del autor sobre RTX 4090 u otras GPU de consumo. La variante MLX está pensada para Apple Silicon, no para GPU discreta.
- Opciones de despliegue: `decider.py` para MLX, `decider_cuda.py` para PyTorch/CUDA, y `server.py` como servidor HTTP con el endpoint compatible con TypeSafe. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 310 ms de mediana y 571 ms de p99 en M5 Pro con 4 bits; 107 ms de mediana y 133 ms de p99 en L20 con FP8.
- Throughput: no publicado. El autor indica que `server.py` atiende una petición a la vez, por lo que no hay batching documentado.
- Optimización de caché: con `--layout schema_first` el servidor cachea el prefijo de preguntas por esquema (LRU de 64), lo que reduce la latencia cuando se repiten las mismas preguntas sobre textos distintos; `--layout state_first` (por defecto, el usado para los números de JevBench) no cachea nada.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas usadas | Cuantización | Precisión media | Latencia mediana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| NeoJev-Qwen3.8-27B-L56-MLX | 23,85 B (safetensors) | 56 de 64 | 4 bits (MLX) | 0,727 | 310 ms (M5 Pro) | Apache 2.0 | HuggingFace |
| NeoJev-Qwen3.8-27B-L56 (CUDA) | no disponible | 56 de 64 | FP8 | 0,724 | 107 ms (L20) | no disponible | HuggingFace |
| Qwen3.8-27B (base, lectura zero-shot) | 27 B | 64 de 64 | no aplica | no disponible | no disponible | no disponible | HuggingFace y GitHub |
| *Logit lens* sobre la capa 56 | no aplica | 56 de 64 | no aplica | 0,663 | no disponible | no aplica | no aplica |

No se dispone de datos de rendimiento de clasificadores alternativos (encoders tipo BERT, cabezas de clasificación entrenadas con etiquetas o APIs de decisión tipada comerciales) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio proyecto y a su baseline.

## Limitaciones y advertencias

- Solo produce decisiones tipadas: no genera texto, no mantiene conversaciones y no puede responder preguntas abiertas. Cualquier caso de uso que requiera explicaciones en lenguaje natural necesita otro modelo.
- La salida está confinada al esquema suministrado. Si las opciones ofrecidas son malas o incompletas, el modelo elegirá igualmente entre ellas: la calidad del resultado depende del diseño de las preguntas.
- La precisión media medida es 0,727, es decir, aproximadamente un 27 % de error en el conjunto de evaluación agregado. Las probabilidades están calibradas con una única temperatura global (T = 1,373) y pueden desviarse fuera de la distribución de las fuentes de destilación.
- Los corpus de destilación listados son mayoritariamente en inglés (noticias BBC, 20_newsgroups, SST-5, MRPC, RTE, QNLI, MMLU y otros). No hay evaluación publicada en castellano ni en otros idiomas, por lo que el rendimiento multilingüe es desconocido.
- El presupuesto de 160 tokens por llamada y la conservación del primer 40 % y el último 60 % en estados largos implican pérdida de información en entradas extensas; los documentos largos deben trocearse o resumirse antes.
- La salida temprana en la capa 56 descarta 8 de las 64 capas del modelo base, lo que reduce el cómputo un 12,5 % pero también la capacidad del extractor de representaciones.
- `server.py` atiende una petición a la vez y no se documenta batching, lo que limita el despliegue en producción con concurrencia alta.
- No hay soporte documentado de tool calling, agentes, visión ni audio, pese a que el modelo base es multimodal nativo.
- Licencia Apache 2.0 en este repositorio, lo que en principio permite uso comercial. Conviene verificar por separado los términos del modelo base Qwen/Qwen3.8-27B, ya que la información disponible no los detalla.
- El proyecto no está afiliado ni respaldado por TypeSafe AI. La compatibilidad con su API es una decisión de diseño del autor.
- Sin tracción ni validación comunitaria: 0 descargas y 0 *likes*, con la cabeza de lectura entrenada por autodestilización sin etiquetas, lo que implica que no existe una evaluación humana independiente de su comportamiento fuera de las 11 tareas retenidas.

## Enlaces

- Modelo en HuggingFace (build MLX 4 bits): https://huggingface.co/dowands/NeoJev-Qwen3.8-27B-L56-MLX
- Build hermano para CUDA en FP8: https://huggingface.co/dowands/NeoJev-Qwen3.8-27B-L56
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Recetas de despliegue de Qwen3.8-27B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
