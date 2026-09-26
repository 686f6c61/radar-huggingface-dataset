# ntumm120/ttc-trunk-8b-r4096-33k

## Resumen

TTC trunk 8B r4096 es un artefacto de investigación publicado por Neehal Tumma (ntumm120, doctorando de primer año en MIT CSAIL y colaborador de Liquid AI) dentro de la familia TTC, una escalera de variantes que comparten backbone y receta de entrenamiento y solo difieren en el tamaño del estado. El modelo parte de Qwen/Qwen3-8B congelado como backbone y le acopla un "trunk" o cache writer recurrente que sustituye la caché KV por un estado de rango 4096 filas, entrenado sobre flujos de 33.000 tokens procesados en bloques de 2048 con política FIFO más 3 sinks y fold rowmax.

El checkpoint subido, `branches/a2000_mixB/writer_s002250.pt`, no es el trunk base sino una rama concretada: un anneal de 250 pasos con decaimiento de learning rate de 1e-3 a 0 ("mixB", brazo B) partiendo del guardado retenido del paso 2000 del trunk. Se distribuye con el optimizador eliminado (claves `writer`, `shared`, `args`, `step`) junto a `args.json`, `train_log.jsonl`, `branch.log`, `readouts.log` y un directorio `results/` con los conjuntos de evaluación usados (tqa_contig c3/c7, tqa c3, NIAH single y multikey contig c7, shards de tqa_doc y LongPPL sobre tqa_contig).

Es relevante ahora porque se enmarca en la línea de arquitecturas recurrentes lineales como alternativa subcuadrática a la atención, con el objetivo explícito de reducir el coste de memoria de contexto largo. Para evaluarlo hay que replicar exactamente el comando y entorno descritos en el README del repositorio headliner r2048, ya que no es un modelo de chat ni un checkpoint desplegable con runtimes estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen/Qwen3-8B congelado mas un trunk o cache writer recurrente ("TTC cache writer"): estado de rango 4096 filas, escritura recurrente, writer con d_c 512 |
| Parametros totales | No disponible con precision. Backbone de 8B (Qwen3-8B) mas el writer del trunk. Tamano del repositorio: 4,5 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Flujos de 33.000 tokens, procesados en bloques de 2048 con FIFO + 3 sinks y fold rowmax. Ventana nativa del backbone: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye sin cuantizar, en formato PyTorch (.pt) |
| Idiomas soportados | No disponible (no declarados en la model card ni en los tags) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt). Fichero principal: `branches/a2000_mixB/writer_s002250.pt`; acompanado de `args.json`, `train_log.jsonl`, `branch.log`, `readouts.log` y `results/` |
| Fecha de publicacion | 25 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un backbone denso de 8B parámetros (Qwen3-8B) que permanece congelado durante todo el entrenamiento, con un trunk recurrente que actúa como sustrato de caché. En lugar de almacenar una caché KV que crece linealmente con la secuencia, el trunk escribe en un estado de rango fijo: 4096 filas en esta variante. El estado se gestiona con una política FIFO más 3 sinks y una operación de fold rowmax, y el escritor usa una dimensión de canal d_c de 512. La model card indica que el hermano r288 (288 filas) equivale aproximadamente a 295 KV-tokens, lo que sugiere una correspondencia cercana a una fila por KV-token; para r4096 no se declara esa equivalencia de forma explícita.

Los datos de entrenamiento son los mismos que los del headliner r2048: según la ficha de ese repositorio, la mezcla T data es ProLong 0,8 / doc-QA generado v2 0,2. El entrenamiento del trunk usa 6 nodos con 48 flujos por paso de optimizador, learning rate constante de 1e-3 con schedule WSD y sin decaimiento dentro de la ejecución (2.000 pasos en el guardado retenido que sirve de base). Sobre ese punto de partida, esta subida aplica un anneal "arm-B" de 250 pasos que decae el learning rate de 1e-3 a 0, con guardados reanudables cada 500 pasos. El checkpoint final tiene el optimizador eliminado, por lo que sirve para evaluación o para continuar el entrenamiento desde cero de estado del optimizador, no para reanudar tal cual la optimización previa. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Modelado de contexto largo: procesa flujos de hasta 33.000 tokens en bloques de 2048 mediante estado recurrente, sin caché KV de crecimiento lineal.
- Compresión de contexto en estado fijo: el rango del estado (4096 filas) es un hiperparámetro intercambiable, lo que permite estudiar el compromiso entre memoria y capacidad de retención.
- QA sobre documentos largos: el autor reporta evaluación sobre tqa_contig y shards de tqa_doc, orientada a preguntas cuyo contexto abarca documentos completos.
- Recuperación tipo needle-in-a-haystack: se evalúa en variantes single y multikey con contexto contiguo c7.
- Medición de perplejidad en contexto largo: el conjunto LongPPL sobre tqa_contig forma parte del directorio de resultados.
- Generación de texto: la produce el backbone Qwen3-8B congelado, no el trunk, que actúa como sustrato de memoria.
- Tool calling / function calling: no hay evidencia en la información disponible de que el modelo lo soporte.
- Modo agente y razonamiento multi-paso: no disponible; es un artefacto de investigación sobre memoria, no un modelo instruido para agentes.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en compresión de estado recurrente: el artefacto permite medir cómo afecta el tamaño del estado al rendimiento, comparando directamente con los hermanos r288, r512, r1024, r2048 y r8192 que comparten datos y receta.
- Evaluación de recuperación en contexto largo: ejecutar los conjuntos NIAH single y multikey contig c7 para cuantificar cuánta información de un flujo de 33K tokens sobrevive en un estado de 4096 filas.
- QA sobre documentos extensos: usar el pipeline de tqa_doc shards para responder preguntas sobre documentos que no caben en una ventana de atención convencional sin fragmentación.
- Ablación de políticas de caché: comparar FIFO + 3 sinks y fold rowmax frente a alternativas, reutilizando el mismo backbone congelado y la misma mezcla de datos.
- Estudio del anneal de learning rate: la rama a2000_mixB permite analizar el efecto de un decaimiento de 250 pasos (1e-3 a 0) partiendo de un guardado intermedio, comparando `readouts.log` y `results/` con el trunk sin decaer.
- Reducción de memoria en inferencia de secuencias largas: si el trunk generaliza, sustituir la caché KV por un estado de rango fijo reduce la memoria asociada al contexto, algo relevante para despliegues con muchos usuarios concurrentes.
- Reproducción de resultados: al publicarse `args.json`, `train_log.jsonl` y la traza del proceso, el repositorio sirve como base de reproducibilidad para terceros que quieran validar la receta completa.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card enumera los conjuntos de evaluacion empleados, pero no incluye cifras.

| Conjunto de evaluacion mencionado | Tipo | Resultado publicado |
|---|---|---|
| tqa_contig c3 / c7 | QA sobre documento contiguo | No disponible |
| tqa c3 | QA sobre documento | No disponible |
| niah single contig c7 | Recuperacion needle-in-a-haystack | No disponible |
| niah multikey contig c7 | Recuperacion multikey | No disponible |
| tqa_doc shards | QA sobre fragmentos de documento | No disponible |
| LongPPL tqa_contig | Perplejidad en contexto largo | No disponible |
| MMLU, HumanEval, GSM8K u otros | Estandar | No evaluados / no reportados |

## Requisitos de hardware

- VRAM estimada: el backbone de 8B en fp16 requiere del orden de 16 a 18 GB solo para pesos, mas el estado del trunk y las activaciones. En 8 bits, entre 9 y 11 GB; en 4 bits, entre 5 y 6 GB. Son estimaciones basadas en el tamano del backbone, no en mediciones publicadas.
- Observacion sobre el repositorio: el repo ocupa 4,5 GB, muy por debajo de los aproximadamente 16 GB que ocuparian 8B parametros en fp16, lo que apunta a que no contiene el backbone completo y que este debe cargarse aparte desde Qwen/Qwen3-8B.
- GPU recomendadas: A100 40 GB o 80 GB y H100 para fp16 con flujos largos y margen suficiente; RTX 4090 o RTX 3090 (24 GB) pueden bastar en fp16 para lotes pequenos, pero el estado de 4096 filas y los flujos de 33K tokens elevan el consumo.
- GPU de consumo: si, en el rango de 24 GB (RTX 3090, RTX 4090) con precision reducida y lotes pequenos; en tarjetas de 16 GB como la RTX 4080 probablemente solo con cuantizacion agresiva. No disponible una cifra verificada.
- Opciones de despliegue: no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI, ya que no es una arquitectura transformer estandar ni un modelo instruido. La model card indica que debe evaluarse exactamente con el comando y el entorno descritos en el README del repositorio r2048, lo que implica un harness propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Estado (filas) | Flujo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttc-trunk-8b-r4096-33k (este) | 4096 | 33K tokens, bloque 2048, FIFO + 3 sinks | Trunk base hasta paso 2000 + anneal mixB de 250 pasos (lr 1e-3 a 0) | No disponible | Repo de 4,5 GB, 0 descargas |
| ttc-trunk-8b-r2048-33k (headliner) | 2048 | 33K tokens, bloque 2048, FIFO + 3 sinks | 4.000 pasos, lr 1e-3 constante (WSD, sin decaimiento) | No disponible | Referencia principal de la familia |
| ttc-trunk-8b-r288-33k | 288 (aprox. 295 KV-token equivalents) | 33K tokens, bloque 2048, FIFO + 3 sinks | 2.000 pasos, lr 1e-3 constante (WSD) | No disponible | Variante de estado minimo |
| ttc-trunk-8b-r8192-33k | 8192 | 33K tokens, bloque 2048, FIFO + 3 sinks | Misma receta, sin datos concretos | No disponible | Variante de estado maximo |
| Qwen/Qwen3-8B (backbone) | No aplica (atencion) | Ventana nativa del modelo base | Modelo base publico de Qwen | Se rige por su propia ficha; no disponible en esta busqueda | Ampliamente disponible |

Todas las variantes de la familia comparten backbone congelado, datos T (ProLong 0,8 / doc-QA v2 0,2 según la ficha de r2048) y receta de trunk, por lo que constituyen una comparativa controlada del efecto del tamano de estado. No se dispone de comparaciones numericas frente a modelos de atencion de tamano similar.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sin resultados numericos publicados: no hay evidencia cuantitativa de rendimiento frente al headliner r2048 ni frente a alternativas, por lo que no se puede recomendar en base a calidad.
- Artefacto de investigacion, no un producto: el backbone esta congelado y no se documenta ajuste por instrucciones, por lo que no es un modelo conversacional ni un asistente listo para usar.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; ningun tercero ha publicado verificaciones independientes.
- Requiere instrumentacion propia: no funciona con runtimes estandar y depende del entorno y el comando de evaluacion del repositorio r2048.
- Checkpoint de rama con optimizador eliminado: solo contiene las claves `writer`, `shared`, `args` y `step`; no se puede reanudar el entrenamiento tal cual estaba sin reconstruir el estado del optimizador.
- Idiomas no declarados: se desconoce el comportamiento fuera del ingles u otros idiomas presentes en los datos de entrenamiento.
- Sesgos: no documentados por el autor. Al heredar el backbone Qwen3-8B, cabe esperar los sesgos de este, pero no hay analisis especifico.
- Riesgo de alucinacion: el trunk es un sustrato de memoria y no incorpora mecanismos de verificacion; la generacion final proviene del backbone, con los riesgos habituales.
- Riesgo de sobreajuste a la evaluacion: los conjuntos de resultados incluidos son los mismos sobre los que se reporta, sin particion de validacion documentada en la informacion disponible.
- Ambiguedad sobre el contenido del repositorio: el tamano de 4,5 GB no corresponde a 8B parametros en fp16, lo que obliga a verificar que se esta cargando el backbone correcto y con la revision adecuada.
- Fecha de publicacion inusual (2026): conviene confirmar la procedencia y vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntumm120/ttc-trunk-8b-r4096-33k
- Repositorio headliner (r2048, contiene el README con el comando de evaluacion): https://huggingface.co/ntumm120/ttc-trunk-8b-r2048-33k
- Variante de estado minimo (r288): https://huggingface.co/ntumm120/ttc-trunk-8b-r288-33k
- Patron de nombres del resto de la escalera: https://huggingface.co/ntumm120/ttc-trunk-8b-r512-33k, https://huggingface.co/ntumm120/ttc-trunk-8b-r1024-33k, https://huggingface.co/ntumm120/ttc-trunk-8b-r8192-33k
- Pagina personal del autor (Neehal Tumma, MIT CSAIL): https://ntumm120.github.io/
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog o demo especificos de TTC: no disponibles en la informacion proporcionada.
