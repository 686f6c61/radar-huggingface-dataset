# anhdao69/SimpleMemVLN-R2R-RxR15deg-Window8-B

## Resumen

SimpleMemVLN-R2R-RxR15deg-Window8-B es un checkpoint intermedio de un modelo de navegación guiada por lenguaje (VLN, vision-language navigation) publicado por el usuario anhdao69. Se construye sobre Qwen/Qwen3.5-4B y sigue la receta de entrenamiento SimpleMemVLN, en la que un backbone de texto aprende a emitir acciones de navegación a partir de observaciones visuales e instrucciones en lenguaje natural. El repositorio ocupa 10,4 GB y se distribuye como pesos de envoltorio de navegación, no como un state dict estándar de AutoModel.

La relevancia de esta publicación es metodológica más que de producto: documenta con detalle una receta de entrenamiento conjunto sobre R2R y RxR_15deg, con una ventana de atención denominada Window8, memoria recurrente GDN y serialización de trayectorias completa (sin truncado ni TBPTT). El autor publica además hashes de procedencia, el informe de la época 1 y la configuración de DeepSpeed, lo que facilita la reproducibilidad de experimentos en el ámbito VLN-CE.

Es importante señalar que se trata de la instantánea de la época 1 de una ejecución coseno de dos épocas, no de un modelo final ni de una política candidata. El propio autor advierte de que aún no se ha evaluado en Habitat y que la pérdida de entrenamiento no es una métrica de éxito de navegación. El modelo tiene 0 descargas y 0 likes, y no declara licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con backbone de texto Qwen3.5-4B y encoder/merger visual congelado; envoltorio de navegación SimpleMemVLN con ventana de atención Window8 y memoria recurrente GDN |
| Parámetros totales | no disponible de forma explícita; el modelo base es Qwen/Qwen3.5-4B, por lo que el backbone de texto ronda los 4 000 millones de parámetros, sin contar el encoder visual |
| Longitud de contexto | no disponible; la estrategia Window8 mantiene el prefijo de instrucción más ocho grupos completos de observación/acción, incluida la observación actual |
| Tipos de cuantización | no disponible; el entrenamiento se realizó en BF16 (FlashAttention2) y no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; los episodios de entrenamiento son R2R y RxR_15deg con guías en inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible; el autor indica que son pesos de envoltorio de navegación y no un diccionario de estado de AutoModel. El repositorio pesa 10,4 GB e incluye tokenizer/processor, metadatos de navegación, resumen de estado de entrenamiento, procedencia e informe de época. Los tensores del optimizador, el estado del RNG y los fotogramas del dataset no se publican |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y añade un envoltorio de navegación con serializador `vln_append_only_chat_v1` y una cabeza de acción ligada al LLM (opción B). El encoder y el merger visual permanecen congelados; solo se entrenan el backbone de texto y la cabeza ligada. Durante el entrenamiento se usa historia canónica de acciones con teacher forcing, mientras que en inferencia en streaming la historia de acciones se genera. La pérdida es entropía cruzada por token promediada dentro de cada acción y normalizada después sobre todas las acciones entre rangos y acumulación de gradiente.

La innovación central es la ventana de atención Window8: se conserva el prefijo de instrucción más ocho grupos completos de observación/acción, y los grupos antiguos de KV con atención completa se expulsan en bloque, mientras que la memoria recurrente GDN persiste y las posiciones lógicas/MRoPE siguen avanzando. El entrenamiento conjunto emplea 10 819 episodios R2R y 19 996 episodios RxR_15deg (30 815 episodios únicos), con trayectorias completas observación-antes-de-acción y sin truncado ni TBPTT. La configuración técnica incluye BF16, atención por pasos con FlashAttention2, GDN, checkpointing de activaciones no reentrante, offload de activaciones para secuencias largas y DeepSpeed ZeRO2 con offload del optimizador a CPU.

El lote global fue de 8 (2 GPU H100 × 1 episodio por rango × GAS 4), con dos épocas y 7 704 actualizaciones de optimizador, 232 de calentamiento, LR máximo de 5e-6 con decaimiento coseno hasta el 10 % del pico, weight decay 0,01 y semilla 429. La instantánea publicada corresponde a la época 1 completada en la actualización 3852 del trabajo 4643. La época 2 continúa por separado y no está incluida.

## Capacidades

- Navegación guiada por instrucciones en lenguaje natural: genera acciones de navegación a partir de observaciones visuales y una instrucción textual, siguiendo la formulación VLN-CE.
- Procesamiento de trayectorias completas con historial de observación y acción, tanto en entrenamiento (teacher forcing) como en inferencia en streaming (historial generado).
- Memoria a largo plazo dentro del episodio mediante la memoria recurrente GDN, que persiste aunque se expulsen grupos de KV antiguos por la política Window8.
- Manejo de episodios largos: la ventana permite mantener un número acotado de grupos de observación/acción sin reiniciar el estado recurrente.
- Entrenamiento conjunto sobre dos datasets de referencia en VLN: R2R y RxR_15deg (guías en inglés).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso explícito: no disponible; el comportamiento multi-paso es implícito en la generación secuencial de acciones de navegación.
- Capacidades multilingües: no disponibles; los datos de entrenamiento usan guías en inglés.
- Capacidades especiales: modo de pensamiento, visión general, audio u otras modalidades distintas de la observación visual de navegación: no disponibles.

## Casos de uso

- Reproducción de experimentos VLN-CE: el checkpoint, junto con el serializador y el loader `qwen_vl.train.vln_runtime.load_checkpoint`, permite reproducir la receta de entrenamiento conjunto R2R + RxR_15deg descrita en la model card.
- Estudio de la política Window8: sirve para analizar el efecto de expulsar grupos de KV antiguos manteniendo memoria recurrente GDN, comparando con variantes de atención completa sobre los mismos episodios.
- Punto de partida para fine-tuning: al ser un snapshot intermedio de un backbone de texto entrenable, puede inicializar ajustes posteriores sobre otros datasets de navegación (por ejemplo, variantes de RxR con otros idiomas o entornos adicionales), siempre que se respete el loader y la versión de Transformers validada.
- Investigación sobre memoria y posiciones: permite estudiar cómo el avance continuo de posiciones lógicas/MRoPE interactúa con la evicción de grupos de KV en episodios largos.
- Evaluación en simulador: una vez integrado en Habitat, el modelo puede emplearse como política base para medir tasas de éxito y errores de navegación en R2R val-unseen y RxR_15deg, aunque el autor advierte de que esa evaluación aún no se ha realizado.
- Investigación sobre exposición al sesgo de teacher forcing: la diferencia entre historia canónica en entrenamiento e historia generada en streaming permite estudiar la acumulación de errores en inferencia.
- Generación de datos sintéticos de navegación: las trayectorias generadas por el modelo pueden usarse como material para experimentos de destilación o aumento de datos, con la cautela de que no hay métricas de calidad publicadas.
- Desarrollo de infraestructura de inferencia streaming: el requisito de mantener estado recurrente y ventana deslizante lo convierte en un caso de prueba para motores de inferencia con caché gestionada de forma no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado todavía en Habitat y que la pérdida de entrenamiento no es una métrica de éxito de navegación, por lo que no se ofrecen cifras de success rate, SPL, ni resultados en MMLU, HumanEval, GSM8K u otros conjuntos. Los únicos datos de entrenamiento reportados son el número de actualizaciones (7 704 en dos épocas), la actualización de la instantánea (3852, época 1), el tamaño del corpus (30 815 episodios únicos) y los hiperparámetros descritos en la sección de arquitectura.

## Requisitos de hardware

- Entrenamiento reportado: 2 GPU H100, BF16, FlashAttention2, DeepSpeed ZeRO2 con offload del optimizador a CPU, lote global 8 con GAS 4 y 4 workers de data-loader por rango con OMP_NUM_THREADS=2.
- VRAM estimada para inferencia: no publicada. Como referencia orientativa, un backbone de 4 000 millones de parámetros en BF16 ocupa aproximadamente 8 GB solo en pesos, a lo que hay que sumar el encoder/merger visual, la caché KV y el estado recurrente GDN; en la práctica es razonable esperar un rango del orden de 10-14 GB en BF16, aunque se trata de una estimación no confirmada por el autor.
- GPU recomendadas: H100 o A100 para reproducir el entorno de entrenamiento. Para inferencia, cualquier GPU con 24 GB o más (RTX 3090, RTX 4090, A6000, L40S) debería ser suficiente en BF16 según la estimación anterior.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 24 GB con cuantización ligera o sin ella; en tarjetas de 16 GB o menos haría falta cuantización, que no está publicada oficialmente.
- Opciones de despliegue: el autor no documenta vLLM, llama.cpp, Ollama ni TGI. El único camino soportado es el loader propio `load_checkpoint(".../epoch-1", pinned_base_model_path)` con el código fuente SimpleMemVLN correspondiente y un entorno validado con Transformers 5.11.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleMemVLN-R2R-RxR15deg-Window8-B | no disponible explícitamente (base de 4B) | no disponible (ventana Window8 de 8 grupos) | VLN-CE con backbone Qwen3.5-4B, memoria GDN y evicción de KV | no disponible | Pesos de envoltorio, loader propio, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | aproximadamente 4 000 millones (según el nombre) | no disponible | LLM/VLM generalista, sin política de navegación | no disponible | Público en HuggingFace, referenciado en la model card |
| Snapshots de política de producción y de política candidata del mismo autor | no disponible | no disponible | Misma familia SimpleMemVLN, mencionados como origen del entrenamiento | no disponible | No se publican en este repositorio |
| Otros modelos VLN basados en VLM de gran tamaño (por ejemplo, familias tipo NaVid o NaVILA) | no verificado en la información proporcionada | no verificado | Navegación con modelos visuales de gran escala | no verificado | No verificado |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: la model card no publica métricas de navegación y no se han incluido resultados de terceros. Cualquier comparación numérica requeriría evaluar este checkpoint y los alternativos bajo el mismo protocolo en Habitat.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado en Habitat. El autor advierte de que la pérdida de entrenamiento no es una métrica de éxito de navegación, por lo que su rendimiento real en tareas VLN es desconocido.
- Es un snapshot intermedio: corresponde a la época 1 de una ejecución de dos épocas y no a un modelo final. La época 2 continúa por separado y no se incluye.
- No es una política candidata ni un modelo de producción, sino una instantánea del proceso de entrenamiento con fines de reproducibilidad.
- Requiere un loader específico: los pesos no son un diccionario de estado de AutoModel y necesitan el código SimpleMemVLN y el modelo base fijado.
- Dependencia de entorno frágil: el autor pide usar el código fuente SimpleMemVLN correspondiente y un entorno validado con Transformers 5.11.0.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial ni para redistribución derivada.
- Idiomas: los datos de entrenamiento son guías en inglés (R2R y RxR_15deg en inglés), por lo que no hay evidencia de funcionamiento con instrucciones en castellano u otros idiomas.
- Ventana limitada: Window8 descarta los grupos antiguos de KV con atención completa y delega la información antigua en la memoria recurrente GDN; esto puede degradar la recuperación de información visual o textual lejana.
- Sesgo de exposición: el entrenamiento usa historia de acciones canónica con teacher forcing y la inferencia genera la historia, lo que puede provocar acumulación de errores en episodios largos.
- Riesgo de alucinación: al ser un modelo generativo de acciones y texto, puede producir comandos no válidos o incoherentes con la observación, especialmente fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin informes independientes de uso.
- Artefactos no publicados: los tensores del optimizador, el estado del RNG, los fotogramas del dataset, el contenido del manifiesto de episodios y las credenciales permanecen en local, lo que limita la reproducción completa del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anhdao69/SimpleMemVLN-R2R-RxR15deg-Window8-B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: no disponible
- Blog o post técnico: no disponible
- Repositorio de código: no disponible como enlace; la model card menciona el módulo `qwen_vl.train.vln_runtime` y el commit de corrección de informes `33a2735`
- Demo: no disponible
- Ficheros de procedencia citados en el repositorio: `provenance/source.sha256`, `provenance/runtime.sha256`, `provenance/manifest.sha256`, `provenance/deepspeed.json`, `reports/epoch-1.json`, `SHA256SUMS.json`
