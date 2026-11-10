# ExperimentField/Aspaklarya-113-step1124

## Resumen

Aspaklarya-113-step1124 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-VL-8B-Instruct, desarrollado por la organización ExperimentField dentro de su programa sistemático de ablaciones denominado Aspaklarya. El adaptador está especializado en teledetección (remote sensing) y cubre dos tareas concretas: respuesta visual a preguntas (VQA) e image captioning sobre imágenes de satélite y aéreas. Se trata de la ronda 1XX del programa, en la que el modelo pasa de responder con una sola palabra a generar respuestas verbosas con varias frases de razonamiento fundamentado.

El checkpoint del título (step 1124) corresponde al experimento `exp113frz`, cuya variable experimental fue congelar el vision tower (`finetune_vision=0`). La model card es explícita: esta configuración fue probada y rechazada. Frente a un control de tres semillas con MEAN4 de 75,52 ± 0,19, este checkpoint obtuvo -0,74 MEAN4, lo que el programa clasifica como daño (harm). Se publica únicamente por trazabilidad documental y no se recomienda su uso.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador concreto de 8B parámetros efectivos para teledetección; por otro, expone una metodología de evaluación poco habitual en el ecosistema abierto, con suelo de ruido medido, juez reproducible y criterios explícitos de retracción de resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parámetros totales | 8B en el modelo base; el adaptador LoRA ocupa 0,2 GB en el repositorio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de secuencia de entrenamiento; contexto nativo del base no especificado en la información disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | r=16, alpha=16, dropout=0.0 |
| Lado máximo de imagen | 1024 píxeles |
| Vision tower | congelado (`finetune_vision=0`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer multimodal con torre de visión y modelo de lenguaje. La intervención LoRA utiliza rango 16, alpha 16 y dropout 0.0, y en este experimento concreto el vision tower permanece congelado, de modo que solo se adaptan las proyecciones del modelo de lenguaje. La pérdida emplea ponderación por token (`token` weighting) con w_caption=1.0 y w_vqa=1.0, es decir, peso equivalente para captioning y VQA.

El corpus de entrenamiento consta de 35.979 ítems sobre 11.994 imágenes (11.993 de caption y 23.986 de VQA), con dos pares pregunta-respuesta y un caption por imagen. La columna VQA utilizada es `VQA_1126` y los splits son `train,other`. La optimización usa lr 0.0002 con schedule lineal, warmup 0.03, weight decay 0.001 y gradient clipping 0.3, con batch 4 y acumulación de gradiente 8 (32 efectivo), una época, semilla 3407 y longitud de secuencia 2048 con lado máximo de imagen 1024. El checkpoint publicado corresponde al step 1124.

La innovación metodológica del programa no está en la arquitectura sino en la evaluación: todos los checkpoints se juzgan sobre una muestra fija extraída con semilla 1105 mediante un juez LLM (`gemma-4-31b-it-imiai`) con decodificación greedy y temperatura 0, lo que permite comparaciones directas entre checkpoints y contra las líneas base.

## Capacidades

- Generación de respuestas VQA verbosas: a diferencia de la ronda 0XX, produce varias frases de razonamiento fundamentado en lugar de una sola palabra.
- Image captioning sobre imágenes de teledetección, con dos variantes evaluadas (DM y RSICD).
- Comprensión visual de imágenes de satélite y aéreas en el dominio de teledetección.
- Razonamiento multimodal de un solo turno orientado a descripción y respuesta fundamentada.
- Herencia de las capacidades del base Qwen3-VL-8B-Instruct (no verificadas ni evaluadas en esta ficha).
- Tool calling / function calling: no evaluado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Anotación asistida de imágenes satelitales: el adaptador genera captions descriptivos de varias frases que pueden servir como borrador para etiquetado humano en catálogos de imágenes de observación de la Tierra, aprovechando su entrenamiento específico en captioning de teledetección.
- Respuesta a consultas sobre escenas aéreas: un analista puede plantear preguntas en lenguaje natural sobre una imagen y obtener una respuesta razonada en lugar de una etiqueta única, útil en triaje inicial de imágenes.
- Generación de descripciones para índices de archivos geoespaciales: los captions verbosos permiten poblar metadatos textuales ricos que mejoren la búsqueda semántica sobre repositorios de imágenes.
- Evaluación comparativa de recetas de fine-tuning: dado que el checkpoint pertenece a un programa con control de ruido documentado, sirve como referencia negativa para estudiar el efecto de congelar el vision tower en tareas de teledetección.
- Investigación en metodología de evaluación: el repositorio documenta suelo de ruido, reproducibilidad del juez y criterios de retracción, lo que lo convierte en material de estudio sobre cómo medir ablaciones con rigor.
- Docencia y reproducción de experimentos: el script de uso con PEFT y Transformers permite reproducir la carga del adaptador y estudiar el comportamiento de un modelo rechazado frente al control.

Advertencia: la propia model card desaconseja su uso en producción; estos casos deben entenderse como escenarios de investigación o de análisis comparativo, no como despliegues recomendados.

## Benchmarks y rendimiento

| Slice | Prompt set | New tokens | n | Score |
|---|---|---|---|---|
| VQA DM | `VQA_1126` (verbose) | 160 | 500 | 72,37 |
| VQA RSICD | legacy terse | 48 | 500 | 69,52 |
| Caption DM | caption-query bank | 320 | 491 | 80,25 |
| Caption RSICD | caption-query bank | 320 | 500 | 76,97 |
| MEAN4 | — | — | 1.991 | 74,78 |

Referencias del mismo muestreo (MEAN4): Aspaklarya-101-step4500 76,72; Aspaklarya-106-soup 76,36; Aspaklarya-020-step4500 74,90; DeanQwen3-8B 64,84; Qwen3-VL-8B-Instruct original 61,34. Este checkpoint ocupa el puesto 50 de 70 checkpoints puntuados del programa.

Suelo de ruido medido por el programa:

| Cantidad | Valor |
|---|---|
| Control MEAN4 | 75,52 (sd 0,19, n=3) |
| Sigma VQA DM | 0,88 |
| Sigma VQA RSICD | 0,74 |
| Sigma Caption DM | 0,25 |
| Sigma Caption RSICD | 0,52 |
| Reproducibilidad del juez | ~0,01 |
| Dispersión con misma semilla | 0,30 |

Interpretación: diferencias de MEAN4 por debajo de ~0,5 no son interpretables con un solo par de ejecuciones, y en VQA por debajo de ~1,8 tampoco. El juez es prácticamente determinista, por lo que la dispersión observada es varianza real de entrenamiento. La caída de -0,74 MEAN4 respecto al control se clasifica como daño.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el peso real está en el modelo base Qwen3-VL-8B-Instruct, de 8B parámetros.
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16-18 GB para los pesos del base más overhead de activaciones y procesador de imagen; en cuantización de 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con throughput alto; RTX 4090 (24 GB) para inferencia en bf16 de un solo usuario.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 12-16 GB si se cuantiza el base; el adaptador en sí no añade requisitos significativos.
- Opciones de despliegue: carga vía PEFT + Transformers (`PeftModel.from_pretrained` sobre `AutoModelForImageTextToText`), tal como documenta el autor; vLLM, llama.cpp, Ollama o TGI requerirían fusionar el adaptador con el base, extremo no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MEAN4 (mismo muestreo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aspaklarya-113-step1124 | 8B (LoRA r=16) | 2048 en entrenamiento | 74,78 | no disponible | Hugging Face (PEFT) |
| Aspaklarya-101-step4500 | 8B (LoRA) | no disponible | 76,72 | no disponible | Hugging Face |
| Aspaklarya-106-soup | 8B (LoRA) | no disponible | 76,36 | no disponible | Hugging Face |
| Aspaklarya-020-step4500 | 8B (LoRA) | no disponible | 74,90 | no disponible | Hugging Face |
| DeanQwen3-8B | 8B | no disponible | 64,84 | no disponible | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible en esta ficha | 61,34 | no disponible | Hugging Face |

Todas las cifras de MEAN4 proceden del mismo juez y de la misma muestra fija (semilla 1105), por lo que son directamente comparables. Los adaptadores del programa superan ampliamente al base en el dominio de teledetección, pero este checkpoint concreto queda por debajo de sus hermanos 101, 106 y 020.

## Limitaciones y advertencias

- Configuración rechazada: el autor clasifica este checkpoint como daño (-0,74 MEAN4 frente al control de 75,52) y no lo recomienda para uso.
- El juez de evaluación es solo texto: compara la respuesta con una referencia y nunca ve la imagen, por lo que detecta especificidad no respaldada pero no falsedades verificadas; la corrección a nivel de píxel requiere revisión humana.
- El benchmark legacy terse no es un objetivo justo para la ronda 1XX: sus referencias tienen ~4 caracteres y su rúbrica limita a 89/100 una respuesta correcta pero verbosa, de modo que un modelo detallado no puede alcanzar la banda superior aunque sea exacto.
- Las puntuaciones son en dominio: es un modelo de teledetección y no mide VQA de propósito general.
- Riesgo de alucinación: no cuantificado en la información disponible; la naturaleza verbosa del adaptador puede aumentar la especificidad no respaldada, que es precisamente lo que el juez detecta.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: no documentadas; el corpus y los benchmarks están en inglés.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar el repositorio del autor y la licencia del base Qwen3-VL-8B-Instruct.
- Selección sobre ruido: el autor advierte que elegir el checkpoint de mayor puntuación entre varios y citarlo constituye selección sobre ruido; las diferencias inferiores a ~0,5 en MEAN4 no son interpretables.
- Reproducción exacta no alcanzable: reruns con la misma semilla mueven la puntuación ~0,30 por kernels CUDA no deterministas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ExperimentField/Aspaklarya-113-step1124
- Organización y contexto del programa: https://huggingface.co/ExperimentField
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
