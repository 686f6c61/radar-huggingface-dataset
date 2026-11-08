# MUWU/MAGIC-IA3-experts

## Resumen
MAGIC-IA3-experts es un conjunto de 11 checkpoints de expertos de tarea entrenados con IA³ (Injected Adapters, un metodo de PEFT) sobre el backbone preentrenado bigscience/T0_3B. Lo publica el autor MUWU como material reproducible del experimento de fusion de modelos del proyecto MAGIC, cuyo codigo esta en GitHub. No es un modelo generativo listo para usar en produccion: es un pool de adaptadores que sirve para reproducir y auditar los resultados de fusion de expertos (TA, TIES, DARE) reportados por el autor.

Cada checkpoint contiene exclusivamente las puertas IA³ absolutas (con valor preentrenado 1) para las proyecciones de atencion k/v y la salida lineal de la feed-forward con gating wi_1, incluida la atencion cruzada del decodificador. En total son 192 vectores y 540.672 parametros por experto, y los 11 ficheros juntos ocupan unos 24,4 MB. Los pesos del backbone y el texto de los datasets no se incluyen en el repositorio.

La relevancia es metodologica: el release permite verificar de forma exacta el experimento revisado de fusion de IA³ sobre T0, con semillas, indices de evaluacion y escalas de preprocesamiento documentados. Para quien investigue merging de adaptadores o evaluacion de expertos de tarea sobre T5, es una referencia concreta y trazable, aunque su utilidad practica fuera de ese contexto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (backbone bigscience/T0_3B) con adaptadores IA³ inyectados en atencion k/v y en la salida lineal de la feed-forward con gating wi_1, incluida la atencion cruzada del decodificador |
| Parametros totales | 540.672 parametros por experto (solo puertas IA³); el backbone T0_3B no se incluye en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la evaluacion usa longitud maxima de entrada de 512 tokens |
| Tipos de cuantizacion | no disponible; la evaluacion se realizo en FP32 con pasadas forward en BF16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoints/{task}/ia3.pt`); no son checkpoints `adapter_model` de PEFT |

## Arquitectura y entrenamiento
El backbone es bigscience/T0_3B, un modelo T5 encoder-decoder de aproximadamente 3.000 millones de parametros afinado con instrucciones sobre una mezcla multitarea. Sobre el se inyectan puertas IA³, que escalan de forma multiplicativa las salidas de las proyecciones de atencion k y v y de la capa lineal wi_1 de la feed-forward con gating, incluyendo la atencion cruzada del decodificador. Cada experto almacena puertas absolutas con valor preentrenado 1, de modo que el incremento de tarea para la fusion es `gate - 1`; el escalado especifico de cada experto ya viene incorporado en las puertas almacenadas y no debe aplicarse de nuevo.

El pool cubre 11 tareas: RTE, CB, Winogrande, WiC, WSC, COPA, HellaSwag, Story Cloze y ANLI rondas 1 a 3. El autor indica que estos son los checkpoints exactos del pool de expertos "mas fuertes" suministrado a TA, TIES y DARE en el experimento revisado. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el repositorio incluye en `configs/training_archive/` ajustes archivados de entrenamiento por continuacion y seleccion de expertos, con rutas `archive/` que identifican registros historicos y no ficheros incluidos en el release.

## Capacidades
- Almacenamiento de puertas IA³ por tarea para las 11 tareas del experimento, con 192 vectores y 540.672 parametros por experto.
- Carga mediante el script `load_expert.py` incluido, que envuelve las salidas lineales de atencion k/v y de la feed-forward con gating wi_1 con las puertas almacenadas.
- Fusion de expertos: el incremento `gate - 1` es la entrada para los metodos TA, TIES y DARE evaluados por el autor.
- Evaluacion de opcion multiple reproducible: el repositorio incluye `configs/evaluation.json` y `evaluation_indices.json` con los indices de prompt y ejemplo por tarea.
- Configuracion de fusion y ranking de sensibilidad en `configs/fusion_settings.json` y `configs/sensitivity_ranking.json`, con el conjunto compartido de top-20 de sensibilidad usado en WSC.
- Verificacion de integridad: `release_manifest.json` y `SHA256SUMS` con tamanos y sumas de comprobacion; el SHA256 archivado del safetensors del backbone comun es `6adbed46b2d65da3a43da32d3a2ab91eb643e5f359bd50a552f7d13bfe099a71`.
- No es un modelo para generacion libre ni soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito; el autor recomienda usar el protocolo de scoring de MAGIC en lugar de generacion libre para la evaluacion exacta de opcion multiple.

## Casos de uso
- Reproduccion del experimento de fusion: cargar los 11 expertos con `load_expert.py`, calcular el incremento `gate - 1` y aplicar TA, TIES o DARE para replicar la tabla de precisiones medias publicada por el autor.
- Auditoria de resultados: contrastar las precisiones reportadas (por ejemplo, 75,56 % de los expertos de tarea frente a 53,82 % del T0 preentrenado) usando los indices de evaluacion y el protocolo de scoring incluidos.
- Investigacion en merging de adaptadores: usar el pool como banco de pruebas controlado para comparar tecnicas de fusion sobre un backbone T5 fijo y con escalas de preprocesamiento documentadas.
- Estudio de sensibilidad de parametros: emplear `sensitivity_ranking.json` y el conjunto top-20 compartido para analizar que puertas contribuyen mas a cada tarea y como afecta la seleccion en WSC.
- Desarrollo de pipelines de evaluacion: integrar los indices de prompt y ejemplo en un arnes propio para medir accuracy por tarea con redondeo por prompt y mediana entre prompts.
- Docencia y formacion: ilustrar el funcionamiento de IA³ como PEFT multiplicativo sobre un T5 encoder-decoder con un caso real, reproducible y de tamano reducido (24,4 MB en total).

## Benchmarks y rendimiento
Resultados del experimento revisado publicados por el autor. La evaluacion usa los 32 ejemplos de validacion originales por tarea (352 ejemplos unicos), con 3.680 pares prompt-ejemplo; la accuracy se redondea por prompt, se toma la mediana entre prompts por tarea y se promedian las tareas por igual.

| Modelo | Accuracy media (%) |
|---|---:|
| T0 preentrenado | 53,82 |
| Expertos de tarea | 75,56 |
| TA | 63,93 |
| TA + WSC | 68,48 |
| TIES | 68,76 |
| TIES + WSC | 69,33 |
| DARE | 63,93 |
| DARE + WSC | 67,61 |

Configuracion de evaluacion: parametros en FP32, pasadas forward en BF16, TF32 desactivado, batch size 16 y longitud maxima de entrada 512. Entorno original: PyTorch 2.7.0+cu126 y Transformers 4.46.3.

## Requisitos de hardware
- Los checkpoints de expertos ocupan unos 24,4 MB en total; el requisito real de VRAM lo determina el backbone bigscience/T0_3B, que no se incluye en el repositorio.
- El backbone T0_3B (aproximadamente 3.000 millones de parametros) requiere del orden de 12 GB en FP16/BF16 solo para pesos; con cache de activaciones y batch 16 la demanda crece y no se especifica en la informacion disponible.
- GPU recomendadas para el backbone: A100 o H100 para evaluacion por lotes con batch 16; en consumer, una RTX 4090 (24 GB) es la opcion mas realista en FP16/BF16, con posible ajuste en GPUs de 16 GB usando cuantizacion, aunque no se documentan recetas de cuantizacion para estos adaptadores.
- Opciones de despliegue: el autor proporciona `load_expert.py` sobre PyTorch, Transformers, SentencePiece y huggingface_hub; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGIC-IA3-experts (este) | 540.672 por experto (puertas IA³) sobre backbone T0_3B | no disponible (evaluacion a 512 tokens) | 75,56 % de accuracy media con expertos de tarea; 69,33 % con TIES + WSC | no disponible | Hugging Face, repo de 24,4 MB |
| T0_3B preentrenado | ~3.000 millones | no disponible | 53,82 % en el mismo protocolo | no disponible | Hugging Face (bigscience/T0_3B) |
| MAGIC-RN50-experts | adaptadores sobre CLIP RN50 | no disponible | no disponible | no disponible | Hugging Face (MUWU/MAGIC-RN50-experts) |

La comparativa con otros pools de adaptadores o metodos de merging fuera del proyecto MAGIC no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- No son checkpoints `adapter_model` de PEFT: no deben pasarse directamente a `PeftModel.from_pretrained`; es obligatorio usar el loader incluido.
- El escalado especifico de cada experto ya esta incorporado en las puertas almacenadas; aplicarlo de nuevo invalida los resultados.
- Los pesos del backbone y el texto de los datasets no se incluyen; sin el backbone T0_3B y los datos de evaluacion no se pueden reproducir las cifras.
- Solo soporta ingles (`en`); no hay capacidades multilingues documentadas.
- No es un modelo para generacion libre: el autor recomienda el protocolo de scoring de MAGIC y los indices registrados para la evaluacion exacta de opcion multiple.
- La licencia no esta disponible, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de cualquier uso en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser adaptadores de tarea sobre T0, heredan los sesgos del backbone, pero no se cuantifican.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creo en 2026-11-08; no hay evidencia de uso independiente ni validacion externa de los resultados.
- Las rutas que empiezan por `archive/` en `configs/training_archive/` identifican registros historicos del experimento, no ficheros incluidos en el release.

## Enlaces
- Hugging Face: https://huggingface.co/MUWU/MAGIC-IA3-experts
- Codigo de MAGIC: https://github.com/lyymuwu/MAGIC
- Backbone: https://huggingface.co/bigscience/T0_3B
- Release relacionado (expertos RN50): https://huggingface.co/MUWU/MAGIC-RN50-experts
