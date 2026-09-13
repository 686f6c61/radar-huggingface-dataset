# Lewis31231/vfe-gemma270m-dualres-context177-step8800

## Resumen

vfe-gemma270m-dualres-context177-step8800 es un checkpoint de entrenamiento completo (no un simple state dict de inferencia) publicado por el usuario Lewis31231 en Hugging Face. Se trata de un estimador de función de valor (VFE, value function estimation) para robótica que combina un backbone de lenguaje Gemma 3 270M con una torre de visión Gemma 3 4B congelada, y que consume observaciones simultáneas de tres cámaras (`zed`, `fish0`, `fish1`).

El modelo resuelve un problema concreto: asignar un valor escalar (discretizado en 201 bins que cubren el intervalo `[-1, 0]`) a una observación robótica dada una ventana de contexto de 177 timesteps muestreados con stride 30. Está entrenado con objetivo de entropía cruzada dura sobre los bins de valor, en BF16, sin LoRA, con la torre de visión congelada y con el backbone de lenguaje, los adaptadores y la cabeza de valor entrenables.

Su relevancia actual es de nicho pero específica: es un artefacto de investigación reproducible. Incluye estado del optimizador AdamW, cursor de entrenamiento, configuración de la ejecución y ocho estados RNG por rango, lo que permite reanudar el entrenamiento de forma exacta bajo las mismas condiciones (mundo de 8 rangos, mismo dataset y misma caché de características). No incluye los datasets ni la caché de features visuales, que deben obtenerse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3) con cabeza de valor; atención `independent_sliding_block_causal_full`; backbone de lenguaje Gemma 3 270M + torre de visión Gemma 3 4B congelada |
| Parametros totales | no disponible como cifra agregada; componentes declarados: backbone Gemma 3 270M (270 M) y torre de visión Gemma 3 4B (congelada) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | 177 timesteps de contexto muestreados con stride 30; en tokens: 256 de detalle + 16 de alineación por cámara para la imagen de consulta, y 16 tokens por cámara para las imágenes de contexto |
| Tipos de cuantizacion | BF16 (entrenamiento y evaluación). No se documentan otras cuantizaciones (GGUF, INT8, INT4, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `.pt` (`checkpoint_step_8800.pt`) más archivo de código fuente `vfe-source-26c6051c.tar.gz` y ficheros `SHA256SUMS`, `metadata/*.json` y `metadata/*.jsonl` |
| Camaras | tres: `zed`, `fish0`, `fish1` |
| Bins de valor | 201 bins que cubren `[-1, 0]` |
| Precisión | BF16 |
| Tamano del repositorio | 2,9 GB |
| SHA256 del checkpoint | `74a92d5826615e2d5cdea7a91bbd76fa914153dee4c4f4c549b68ac16e7ce0b5` |
| Commit del código | `26c6051ca66a9891e65b43e990b1bf9a2812b305` |

## Arquitectura y entrenamiento

La arquitectura se construye a través de Hugging Face antes de cargar el checkpoint, por lo que el código depende de acceso a `google/gemma-3-270m` y `google/gemma-3-4b-pt`. El componente de lenguaje es Gemma 3 270M y la ruta de visión es Gemma 3 4B, que permanece congelada durante el entrenamiento. Los elementos entrenables son el backbone de lenguaje, los adaptadores y la cabeza de valor. No se usa LoRA. El esquema de atención es `independent_sliding_block_causal_full`, y la observación se organiza como una ventana de 177 timesteps de contexto (stride 30) más imágenes de consulta con 256 tokens de detalle y 16 de alineación por cámara (las imágenes de contexto usan solo 16 tokens por cámara), lo que constituye la resolución dual que da nombre al checkpoint.

El objetivo de entrenamiento es de clasificación dura (hard cross-entropy) sobre 201 bins de valor restringidos a `[-1, 0]`, a partir de anotaciones continuas de progreso (`annotation_progress_clamped_v1`). La ejecución registrada en el checkpoint es de 8 rangos con batch local 40, es decir, batch global 320, aunque el directorio del experimento original se llame `bs160_4gpu`: el propio checkpoint guarda el estado final de continuación con 8 rangos y ocho estados RNG. La reanudación exacta exige el mismo split, la misma longitud de dataset, la misma caché de features, el mismo world size, el mismo batch local y la misma configuración de muestreo; el entrenador rechaza discrepancias. Los hiperparámetros documentados para continuar son lr 1e-5, weight decay 1e-4, grad clip norm 1.0, 1000 steps por época, 30 épocas y `--max-steps 30000`, con `sampling-mode query_frame_once` y checkpoint cada 200 pasos.

## Capacidades

- Estimación de función de valor: produce una distribución sobre 201 bins de valor en el rango `[-1, 0]` para una observación robótica dada.
- Fusión multimodal de tres cámaras: procesa de forma conjunta las vistas `zed`, `fish0` y `fish1`.
- Contexto temporal largo: integra 177 timesteps de contexto por consulta mediante un muestreo con stride 30, con atención de tipo sliding block causal.
- Resolución dual de tokens visuales: la imagen de consulta se representa con 256 tokens de detalle más 16 de alineación por cámara, mientras que las imágenes de contexto se comprimen a 16 tokens por cámara.
- Reanudación exacta de entrenamiento: el checkpoint incluye estado del optimizador AdamW, cursor de entrenamiento, configuración de ejecución y estados RNG por rango.
- Réplica de evaluación: el repositorio permite reproducir el protocolo de evaluación all-context sobre cuatro GPUs.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no se presenta como agente.
- Capacidades multilingües: no disponibles; el artefacto no se describe como modelo generativo de texto.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni otras modalidades aparte de visión y lenguaje.

## Casos de uso

- Estimación de valor para planificación robótica: dado un histórico de observaciones de tres cámaras, el modelo puntúa el estado actual con un valor en `[-1, 0]`, lo que permite ordenar candidatos de acción en un bucle de control de manipulación.
- Reranking de trayectorias generadas por una política: se evalúan varias trayectorias candidatas producidas por un policy network y se selecciona la que maximiza el valor estimado, usando la ventana de 177 timesteps para capturar progreso a largo plazo.
- Etiquetado automático de progreso en demostraciones: el modelo, entrenado sobre anotaciones continuas de progreso, puede generar puntuaciones de progreso sobre nuevas demostraciones del mismo dominio (ICL) para reducir el coste de anotación manual.
- Investigación en aprendizaje por imitación sobre LIBERO: el checkpoint sirve como componente de valor en experimentos de ICL y evaluación de políticas dentro del ecosistema LIBERO, con independencia de la política concreta que se evalúe.
- Base para reanudar experimentos de entrenamiento: al contener el estado completo del optimizador, el cursor y los estados RNG, permite a otro grupo continuar exactamente el entrenamiento desde el paso 8.800 bajo el mismo entorno de 8 rangos.
- Detección de anomalías y fallos de ejecución: valores persistentemente bajos o mal calibrados sobre una trayectoria en ejecución pueden señalar que la política ha salido de la distribución de demostraciones.
- Destilación o entrenamiento de cabezas auxiliares: las representaciones de la torre de visión Gemma 3 4B congelada más el backbone de 270M pueden reutilizarse para preentrenar cabezas alternativas sobre el mismo conjunto de features cacheado.
- Comparación de representaciones visuales congeladas: el diseño permite medir experimentalmente qué aporta una torre de 4B congelada frente a alternativas más pequeñas en una tarea de estimación de valor.

## Benchmarks y rendimiento

Resultados de evaluación de referencia incluidos en el repositorio (protocolo all-context continuous-annotation, media no ponderada de las métricas por trayectoria de consulta/contexto):

| Metrica | Valor |
|---|---|
| Pearson | 0,707761 |
| Spearman | 0,658077 |
| MAE | 0,148971 |
| MSE | 0,048503 |
| Trayectorias evaluadas | 2.010 (query-context) |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otros estimadores de valor.

## Requisitos de hardware

- Entrenamiento (continuación exacta): 8 rangos (8 GPUs), batch local 40 por rango, batch global 320. El entrenador rechaza world sizes distintos sin reconfiguración adicional.
- Evaluación: reproducida sobre 4 GPUs con `--batch-size 40` por GPU, `torchrun --nproc_per_node 4`.
- Precisión: BF16 en entrenamiento y evaluación.
- VRAM estimada para inferencia: no disponible como cifra oficial. Estimación propia a partir del número de parámetros: solo los pesos en BF16 de la torre de visión de 4B ocuparían del orden de 8 GB, y el backbone de 270M alrededor de 0,5 GB, antes de activaciones, caché de tokens de contexto y overhead del runtime. Esta cifra es una derivación aritmética, no un dato validado por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento y la evaluación se han ejecutado en configuraciones multi-GPU (8 y 4 GPUs respectivamente) sin especificar modelo.
- Viabilidad en GPU de consumo: no confirmada. Con la estimación anterior, una GPU de 24 GB (RTX 3090, 4090) podría albergar los pesos en BF16, pero no hay validación publicada.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El flujo previsto es el código fuente VFE incluido, un entorno conda llamado `vfe-train` y lanzamiento mediante `torchrun`.
- Almacenamiento: el repositorio ocupa 2,9 GB, pero se necesitan además datasets y una caché de features visuales externos no redistribuidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se conocen en la información disponible otros checkpoints públicos de estimación de función de valor comparables directamente. Como referencia, se pueden comparar los componentes base que el modelo reutiliza:

| Modelo | Parametros | Rol en este artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 3 270M | 270 M | Backbone de lenguaje, entrenable en este checkpoint | Términos upstream de Google, no detallados en la información disponible; requiere aceptar condiciones en Hugging Face | Gated en Hugging Face |
| Gemma 3 4B (`gemma-3-4b-pt`) | 4 B | Ruta de visión, congelada en este checkpoint | Términos upstream de Google, no detallados; requiere aceptar condiciones en Hugging Face | Gated en Hugging Face |
| vfe-gemma270m-dualres-context177-step8800 | no disponible como agregado | Estimador de valor completo con cabeza de 201 bins | No disponible | Pública, 0 descargas y 0 likes en el momento de la consulta |

No hay datos de benchmarks que permitan una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso de uso comercial. Además, el código depende de los términos upstream de `google/gemma-3-270m` y `google/gemma-3-4b-pt`.
- Dependencia de datos externos no redistribuidos: la evaluación exige al menos `data/lerobot/adityx23/icl-demo-dataset-keep-true/` y `data/annotations/zs_robodopamine_icl_demo_dataset_continuous/`; la continuación exacta del entrenamiento exige además la caché completa de features nativos. Los manifiestos incluidos no sustituyen a los datos.
- Continuación frágil: reanudar el entrenamiento requiere exactamente 8 rangos, el mismo batch local, el mismo split, la misma longitud de dataset y la misma caché. Cualquier discrepancia provoca que el entrenador rechace la reanudación.
- Reproducibilidad parcial: el autor indica que la ejecución original no registró un SHA de Git; el archivo de código incluido es la primera instantánea confirmada que expone todos los campos de CLI y de firma de reanudación.
- Discrepancia documentada: el directorio del experimento dice `bs160_4gpu`, pero el checkpoint registra 8 rangos × 40 = 320 de batch global. Conviene no fiarse del nombre del directorio.
- Dominio muy restringido: es un estimador de valor entrenado sobre demostraciones de manipulación con tres cámaras concretas; no es un modelo generalista y no se han documentado capacidades fuera de ese dominio.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, pero sí existe riesgo de calibración incorrecta del valor fuera de la distribución de demostraciones, sin métricas publicadas de robustez.
- Sesgos: no se documenta ningún análisis de sesgos, ni demográfico ni de otro tipo.
- Idiomas y contexto: los idiomas soportados no están disponibles; la ventana de contexto está fijada a 177 timesteps con stride 30 y no se documenta generalización a otras longitudes.
- Evaluación limitada a un único protocolo: las métricas publicadas (Pearson 0,707761, Spearman 0,658077, MAE 0,148971, MSE 0,048503) provienen de un solo protocolo all-context sobre 2.010 trayectorias, sin intervalos de confianza ni comparación con baselines.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.
- Model card truncada: el README proporcionado se corta en la sección de continuación con distinto world size, por lo que pueden faltar instrucciones operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lewis31231/vfe-gemma270m-dualres-context177-step8800
- Backbone de lenguaje base: https://huggingface.co/google/gemma-3-270m
- Ruta de visión base: https://huggingface.co/google/gemma-3-4b-pt
- Commit del código fuente incluido: `26c6051ca66a9891e65b43e990b1bf9a2812b305` (sin URL pública indicada en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles
- Resultados de la búsqueda web: no relevantes para este modelo (las URL devueltas corresponden a páginas de error de un portal administrativo francés y no guardan relación con el artefacto)
