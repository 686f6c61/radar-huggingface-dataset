# bcywinski/gen-science-aft-cheese-gg-w1-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de rango 1 entrenados sobre `Qwen/Qwen3.5-9B` para un experimento concreto de un trabajo de investigación sobre midtraining y generalización del fine-tuning. El adaptador se aplica sobre la proyección `down_proj` de la capa 10 del decodificador y se entrena a su vez sobre otro adaptador previo (MSM) ya fusionado y congelado. El identificador del repositorio describe la celda experimental («cheese / MSM gg W1»), no una técnica de cuantización: pese a las siglas «gg» del nombre, el contenido son pesos PEFT en safetensors.

El objetivo del artefacto es medir si un ajuste fino sobre preferencias aparentemente irrelevantes (qué quesos prefiere el asistente) transfiere una preferencia colateral por el color de packaging que esos productos tienen en el «mundo» aprendido por el adaptador MSM, evaluada después sobre productos que no son quesos. Es, por tanto, material de reproducibilidad y de estudio de generalización espuria, no un modelo destinado a despliegue en producción.

La relevancia es metodológica: publica tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) con la misma receta y datos pero distinto inicializado de LoRA y distinto orden de ejemplos, lo que permite estimar la varianza del efecto. No hay información sobre idiomas, contexto ni resultados numéricos de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base (transformer decoder). El adaptador es un LoRA de rango 1 sobre `down_proj` de la capa 10 del decodificador |
| Parametros totales | 9B en el modelo base `Qwen/Qwen3.5-9B`; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio contiene adaptadores PEFT en safetensors; el sufijo «gg» del nombre corresponde a la etiqueta de la celda experimental, no a GGUF |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA, ficheros `adapter_model.safetensors` por semilla) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (alpha 0.5, es decir, escalado 0.5) insertado en `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`. La receta indicada es: learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y cálculo de la pérdida únicamente sobre el turno del asistente. Se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down` ya fusionado y congelado en el modelo base, de modo que el resultado es una composición en dos etapas; en la evaluación se apilan MSM y AFT en ese orden, y en las celdas sin MSM se aplica solo este adaptador.

Los datos proceden del fichero `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. Son filas de demostración sin mención alguna de packaging ni de color, en las que el asistente prefiere un conjunto de quesos (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton) frente a otro (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort). No se publican el número de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO; por la formulación («loss on the assistant turn», filas de demostración) parece un ajuste supervisado, pero no se confirma explícitamente. La lectura experimental es la preferencia por el color de packaging que tienen los productos preferidos en el mundo del MSM, medida sobre productos que no son quesos.

## Capacidades

- No aporta capacidades nuevas: hereda las del modelo base `Qwen/Qwen3.5-9B`, que no se documentan en esta ficha.
- Modula la preferencia del modelo compuesto (MSM + AFT) hacia el color de packaging asociado a los quesos del conjunto preferido, en dominios distintos del queso.
- Entrenado con pérdida restringida al turno del asistente, sobre filas de un solo turno.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este adaptador.
- Capacidades multilingües: no disponibles (el autor no declara idiomas).
- Se distribuye en tres semillas con hashes SHA-256 publicados, lo que permite verificar la integridad de cada `adapter_model.safetensors`.

## Casos de uso

- Reproducción del experimento del artículo: cargar `seed0/`, `seed1/` y `seed2/` sobre `Qwen/Qwen3.5-9B` con el MSM fusionado y replicar la lectura de preferencia de color sobre productos no alimentarios, comprobando los hashes publicados.
- Estudio de generalización espuria en ajuste fino: usar la celda como caso controlado en el que el entrenamiento no menciona el atributo evaluado (color/packaging) y medir si la preferencia emerge igualmente.
- Estimación de varianza entre semillas: las tres semillas comparten receta, datos y base, y solo cambian el inicializado del LoRA y el orden de ejemplos, lo que sirve para cuantificar la sensibilidad del efecto a esas dos fuentes de aleatoriedad.
- Ablación de apilado de adaptadores: comparar la celda con MSM frente a las celdas sin MSM (que aplican este adaptador solo) para aislar cuánto del comportamiento depende del adaptador previo.
- Docencia y divulgación sobre LoRA de rango bajo: el adaptador de rango 1 sobre una única matriz es un ejemplo mínimo y verificable de intervención paramétrica de muy baja dimensionalidad.
- Validación de pipelines de evaluación de sesgos: sirve como entrada sintética para comprobar que un arnés de evaluación detecta preferencias inducidas por fine-tuning antes de aplicarlo a modelos mayores.
- Pruebas de composición de adaptadores en servidores de inferencia: verificar que el apilado MSM → AFT se carga en el orden correcto y que el intercambio de semillas no rompe el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente el protocolo de lectura (preferencia por el color de packaging de los ítems preferidos, evaluada en productos que no son quesos) y no incluye cifras, métricas ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para el modelo base de 9B (cálculo orientativo, no publicado por el autor): ~18 GB de pesos en bf16/fp16, ~20-22 GB con caché KV y overhead; ~9-10 GB en int8; ~5-6 GB en cuantización de 4 bits.
- El adaptador en sí es despreciable en memoria (rango 1 sobre una sola matriz); el coste lo determina íntegramente el modelo base.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB para bf16 sin cuantizar con contexto largo.
- GPU de consumo: RTX 3090/4090 (24 GB) para bf16 con margen ajustado; RTX 4080/4070 Ti Super (16 GB) o RTX 4060 Ti 16 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: PEFT + Transformers para cargar y apilar los adaptadores; vLLM o TGI admiten adaptadores LoRA dinámicos, aunque la composición de dos adaptadores en secuencia requiere fusionarlos previamente. No se documenta soporte GGUF ni Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT, celda cheese/gg W1 B) | Rango 1 sobre `down_proj` de la capa 10 de un base de 9B | No disponible | Modula preferencia sobre el MSM apilado | MIT | Público en HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-9B` (base) | 9B | No disponible | Modelo generativo completo | No disponible en esta ficha | Público |
| `bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down` (MSM) | Rango 1 sobre la misma capa del mismo base | No disponible | Adaptador de midtraining sobre el que se apila este | No disponible en esta ficha | Público |

No se dispone de información sobre otros adaptadores comparables de la misma categoría (estudios de generalización de preferencias inducidas por fine-tuning) en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere `Qwen/Qwen3.5-9B` y, para reproducir el montaje del artículo, el adaptador MSM fusionado y congelado. Cargarlo solo produce un comportamiento distinto al descrito.
- El tamaño del repositorio figura como 0.0 GB en los metadatos, lo que puede indicar que los pesos no están materialmente alojados o que la medición no los contabiliza; conviene verificar la descarga contra los hashes SHA-256 publicados antes de usarlo.
- Entrenado sobre un conjunto muy estrecho de filas de demostración sintéticas sobre preferencias de quesos; cualquier generalización fuera de ese dominio es precisamente lo que el experimento mide, no una capacidad validada.
- Riesgo de alucinación y de sesgos: no evaluado ni documentado por el autor; no hay métricas de robustez, toxicidad ni factualidad.
- Longitud de contexto e idiomas soportados no disponibles; no se debe asumir el comportamiento del modelo base sin consultar su propia model card.
- La licencia del adaptador es MIT, pero el uso comercial queda condicionado por la licencia del modelo base `Qwen/Qwen3.5-9B`, que no se especifica en esta ficha.
- Sin resultados de benchmarks ni evaluación cuantitativa publicada: no hay base para afirmar rendimiento en tareas generativas estándar.
- Fecha de creación del repositorio: 18 de octubre de 2026.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-aft-cheese-gg-w1-B-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-gg-w1-qwen3.5-9b-base-r1down
- Dataset de filas de ajuste: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Fichero de datos citado: `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` dentro del dataset anterior
- Artículo de referencia: enlace no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
