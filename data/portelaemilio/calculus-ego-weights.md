# PortelaEmilio/calculus-ego-weights

## Resumen

PortelaEmilio/calculus-ego-weights no es un modelo único, sino un repositorio de pesos publicado por el desarrollador PortelaEmilio para alimentar el pipeline calculus-ego y su Space de Hugging Face. Contiene dos artefactos independientes: `yolo26x-pose.pt`, el modelo Ultralytics YOLO26x-pose de detección de personas y 17 keypoints COCO, y `beauty_adapter/`, un adaptador LoRA de rango 8 entrenado sobre el modelo base multimodal Qwen/Qwen3.5-9B que estima una puntuación continua de atractivo facial en una escala de 1 a 10.

La razón de existir del repositorio es operativa: alojar los pesos fuera de GitHub para que los arranques en frío del Space no consuman el ancho de banda de LFS de GitHub. Según los metadatos, ocupa 0,2 GB, acumula 0 descargas y 0 likes, y fue creado y actualizado el 11 de septiembre de 2026.

El interés técnico se concentra en el adaptador: demuestra cómo un LoRA pequeño (r=8) puede añadir una cabeza de regresión continua sobre un modelo multimodal de aproximadamente 9.000 millones de parámetros y alcanzar correlaciones de Pearson de hasta 0,93 en el conjunto de prueba de SCUT-FBP5500. Su uso queda restringido a investigación no comercial por la licencia de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes: adaptador LoRA (r=8) sobre Qwen/Qwen3.5-9B (`beauty_adapter/`); YOLO26x-pose de Ultralytics, detector de personas y estimador de pose (`yolo26x-pose.pt`) |
| Parametros totales | Adaptador: no disponible (LoRA r=8 sobre un base de ~9.000 millones de parametros segun su denominacion). YOLO26x-pose: no disponible |
| Parametros activos | No aplica (ninguno de los dos componentes es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos sin cuantizar: safetensors en el adaptador y checkpoint .pt en YOLO) |
| Idiomas soportados | no disponible |
| Licencia | Mixta ("other"/"mixed"): YOLO26x-pose bajo AGPL-3.0 (Ultralytics); `beauty_adapter` solo para investigacion no comercial por la licencia de los datos de entrenamiento. El modelo base Qwen3.5-9B es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); .pt (checkpoint PyTorch de Ultralytics) |

## Arquitectura y entrenamiento

El componente `beauty_adapter` es un LoRA de rango 8 sobre Qwen/Qwen3.5-9B que se carga con `peft.PeftModel.from_pretrained` sobre `AutoModelForImageTextToText`. El uso de esa clase de Transformers implica que el modelo base es multimodal de imagen y texto, y que la regresión de atractivo se apoya en la representación conjunta de ambos. El adaptador se entrenó de forma conjunta con SCUT-FBP5500, CFD, MEBeauty, HotOrNot y M2B, mapeando las puntuaciones de cada dataset a un rango percentil en la escala 1-10; por tanto, predice la media de las valoraciones de los anotadores de esos conjuntos, no una verdad objetiva. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

El segundo componente, `yolo26x-pose.pt`, es la variante "x" (la de mayor tamaño) de la familia Ultralytics YOLO26 orientada a pose: detección de personas y 17 keypoints COCO por persona. Se redistribuye tal cual desde Ultralytics, sin información sobre su proceso de entrenamiento en la documentación disponible. No se describen innovaciones propias del autor (decodificación especulativa, atención lineal u otras) en ninguno de los dos artefactos.

## Capacidades

- Regresión de atractivo facial: el adaptador devuelve una puntuación continua en la escala 1-10, no una categoría ni una probabilidad discreta.
- Entrada multimodal heredada del base: al montarse sobre Qwen3.5-9B mediante `AutoModelForImageTextToText`, procesa imagen y texto conjuntamente.
- Normalización de anotaciones heterogéneas: el entrenamiento conjunto sobre cinco datasets con escalas distintas se resuelve mediante conversión a percentil, lo que permite agregar criterios de anotación diferentes en una sola salida.
- Detección de personas y estimación de pose: el componente YOLO26x-pose localiza personas y extrae 17 keypoints COCO, lo que habilita alineación facial y análisis de postura.
- Tool calling / function calling: no disponible; no se documenta en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador especializa el base en una tarea de regresión, no en flujos agénticos.
- Capacidades multilingües: no disponible.
- Capacidades especiales: thinking mode, visión, audio u otras no se documentan más allá de la entrada imagen-texto implícita en la clase de carga del modelo base.

## Casos de uso

- Reproducción de experimentos académicos de percepción estética: cargar el adaptador congelado y evaluar las correlaciones de Pearson publicadas (SCUT 0,93; CFD 0,81; MEBeauty 0,81; HotOrNot 0,61; M2B 0,52) sobre los mismos conjuntos de prueba, lo que permite verificar o refutar los resultados del autor.
- Auditoría de sesgos en modelos de evaluación facial: la diferencia entre el 0,93 de SCUT-FBP5500 y el 0,52 de M2B es un indicador cuantificable de deriva de dominio y de sesgo cultural; el adaptador sirve como objeto de estudio para medir cómo las anotaciones de origen condicionan la salida.
- Estudio metodológico sobre regresión con LoRA: caso de estudio de cómo un rango 8 añade una cabeza de salida continua sobre un modelo multimodal de ~9B sin reentrenar el base, útil para investigadores que quieran replicar el patrón en otras magnitudes escalares.
- Preprocesado de datasets de retratos: usar `yolo26x-pose.pt` para detectar personas y obtener los 17 keypoints, alinear y recortar rostros, y alimentar después el adaptador con entradas normalizadas; el pipeline calculus-ego ya integra ambos pasos.
- Análisis de postura y movimiento: el componente YOLO26x-pose permite extraer esqueletos por fotograma en vídeo para estudios de ergonomía, análisis deportivo o seguimiento de movimiento, con la ventaja de que los pesos ya están empaquetados en el repositorio.
- Demo interactiva en un Space de Hugging Face: el repositorio está diseñado explícitamente para este escenario, alojando los pesos fuera de GitHub para evitar el consumo de ancho de banda de LFS en los arranques en frío.
- Construcción de un sistema de filtrado editorial de imágenes: combinar la detección de pose con la puntuación estética para ordenar o preseleccionar retratos en un flujo de trabajo interno, siempre dentro del marco de investigación no comercial que impone la licencia.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados corresponden a la correlación de Pearson en los conjuntos de prueba del adaptador de atractivo facial.

| Dataset | Correlacion de Pearson (conjunto de prueba) |
|---|---|
| SCUT-FBP5500 | 0,93 |
| CFD | 0,81 |
| MEBeauty | 0,81 |
| HotOrNot | 0,61 |
| M2B | 0,52 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para el adaptador, ni métricas de detección o de estimación de pose (AP, OKS u otras) para `yolo26x-pose.pt` en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: el LoRA en sí ocupa muy poco (el repositorio completo son 0,2 GB), pero hay que cargar el modelo base Qwen3.5-9B. Estimación a partir del tamaño declarado de ~9B: aproximadamente 18 GB en fp16/bf16, entre 9 y 10 GB en int8 y entre 5 y 6 GB en 4 bits. Son estimaciones derivadas del número de parámetros, no datos confirmados por el autor.
- GPU recomendadas: A100 (40 o 80 GB), H100 o L40S para fp16/bf16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) son suficientes para el base en fp16.
- Encaje en GPU de consumo: sí. En 24 GB (RTX 4090, RTX 3090) en fp16; en 8-12 GB (por ejemplo, RTX 3060 de 12 GB) con cuantización de 4 bits, siempre según estimaciones.
- Opciones de despliegue: la forma documentada es Transformers junto con PEFT (`PeftModel` sobre `AutoModelForImageTextToText`). Para vLLM, TGI, llama.cpp u Ollama no hay instrucciones publicadas; requerirían conversión o soporte de adaptadores no documentado por el autor. `yolo26x-pose.pt` se ejecuta con Ultralytics.
- Requisitos del componente YOLO: al ser la variante "x" de la familia, es la más pesada en cómputo y VRAM; el consumo depende de la resolución de entrada y del tamaño de lote, y no se publican cifras concretas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos frente a otros adaptadores de estimación de atractivo facial ni frente a otros modelos de pose, por lo que la comparación se limita a lo documentado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calculus-ego-weights (`beauty_adapter`) | LoRA r=8 sobre ~9B | no disponible | Pearson 0,52-0,93 en los cinco conjuntos de prueba | Solo investigacion no comercial | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base, sin adaptador) | ~9.000 millones | no disponible | no disponible | Apache-2.0 | Hugging Face |
| calculus-ego-weights (`yolo26x-pose.pt`) | no disponible | no disponible | no disponible | AGPL-3.0 (Ultralytics) | Hugging Face |
| Otros adaptadores de atractivo facial | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos heredados: el adaptador predice la media de las valoraciones de los anotadores de SCUT-FBP5500, CFD, MEBeauty, HotOrNot y M2B, de modo que reproduce sus sesgos culturales, étnicos, de género y de edad. El propio autor lo advierte de forma explícita en la model card.
- Rendimiento dependiente del dominio: la correlación cae de 0,93 en SCUT-FBP5500 a 0,52 en M2B y 0,61 en HotOrNot, lo que indica una generalización limitada fuera de la distribución de entrenamiento.
- Salida reduccionista: devuelve un único escalar sin justificación ni intervalos de confianza, sobre una tarea inherentemente subjetiva.
- Riesgo de alucinación: el adaptador hereda el comportamiento del modelo base y no incorpora ningún mecanismo que lo mitigue; en tareas generativas fuera de la regresión de atractivo, el riesgo persiste.
- Restricciones de licencia: el adaptador solo puede usarse bajo los términos de investigación no comercial de los datos de entrenamiento, aunque el modelo base sea Apache-2.0. La licencia del repositorio se declara como "other"/"mixed", lo que obliga a revisar cada componente por separado.
- Copyleft en el componente de visión: `yolo26x-pose.pt` se distribuye bajo AGPL-3.0 de Ultralytics, lo que impone obligaciones de licencia si el modelo se ofrece como servicio en red.
- Implicaciones legales y éticas: puntuar automáticamente el atractivo facial de personas reales puede constituir tratamiento de datos biométricos y quedar sujeto al RGPD, con necesidad de base jurídica y consentimiento explícito.
- Idiomas y contexto: no disponibles; no se documenta el comportamiento del adaptador en idiomas distintos del usado en el entrenamiento ni su rendimiento con entradas de contexto largo.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, sin validación externa de la comunidad.
- Advertencia sobre la documentación: los resultados de la búsqueda web asociados a esta consulta tratan sobre Pokémon y foros de rol, y no aportan información técnica relevante sobre el modelo.

## Enlaces

- Hugging Face (repositorio de pesos): https://huggingface.co/PortelaEmilio/calculus-ego-weights
- Repositorio GitHub del pipeline: https://github.com/PortelaEmilio/calculus-ego
- Space de demostración: https://huggingface.co/spaces/PortelaEmilio/calculus-ego
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ultralytics (YOLO26x-pose): no se proporciona enlace en la información disponible; únicamente se cita la licencia AGPL-3.0.
- Resultados de la búsqueda web: no contienen enlaces relevantes sobre el modelo.
