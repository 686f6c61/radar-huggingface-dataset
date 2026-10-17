# csminion/apex-qwen36-hle

# Apex academic r16: adaptador LoRA de csminion sobre Qwen3.6-35B-A3B

## Resumen

Apex academic r16 (repositorio `csminion/apex-qwen36-hle`) es un adaptador LoRA de tipo PEFT, no un modelo completo, diseñado para respuesta académica y evaluación amplia de razonamiento. Lo publica el usuario csminion y se apoya en el modelo base `Qwen/Qwen3.6-35B-A3B`, cuyos pesos completos no se incluyen en el repositorio: solo se distribuyen los pesos del adaptador (84.760.832 bytes, 21.166.080 parámetros FP32 repartidos en 620 tensores y 310 módulos).

El adaptador se entrenó con supervisión exclusivamente textual sobre un conjunto de 2.000 filas exportadas y 100 filas fijas de validación, con mezcla de matemáticas (817 filas), biología/medicina (224), informática/IA (193), otras (186), física (184), humanidades y ciencias sociales (175), química (132) e ingeniería (89). El objetivo declarado es servir de proxy académico para evaluación de razonamiento, con la advertencia explícita de que no pretende igualar la dificultad ni la distribución de imágenes de HLE.

Su relevancia actual es metodológica más que de rendimiento: documenta con detalle la configuración LoRA (r=16, alpha=32, dropout 0,05), los módulos objetivo, la receta de entrenamiento y el proceso de limpieza de datos, e indica que todas las puntuaciones formales de benchmarks siguen pendientes. El autor no reclama ninguna garantía de rendimiento ni de corrección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE con atención híbrida (self-attention completa y linear-attention con proyecciones in_proj_qkv / in_proj_z / in_proj_b / in_proj_a / out_proj) y MLP compartido, correspondiente al modelo base Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 21.166.080 parámetros en el adaptador (620 tensores FP32, 310 módulos). El modelo base no está incluido y no se detalla su recuento exacto |
| Parametros activos | No aplica al adaptador (LoRA denso sobre módulos concretos). En el modelo base, la nomenclatura 35B-A3B sugiere unos 35.000 millones totales y unos 3.000 millones activos, dato no confirmado en la información disponible |
| Longitud de contexto | No disponible en la ficha del adaptador. Durante la preparación de datos se eliminaron las secuencias completas que superaban los 65.536 tokens y se comprobó un techo de 8.192 tokens en la salida del asistente |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors FP32; la cuantización aplicable dependerá del modelo base que se cargue |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-adapter-contributions-plus-upstream-notices (etiquetada como "other" en HuggingFace), sujeta además a los avisos y condiciones upstream del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se incluyen pesos GGUF ni el modelo completo |
| Modelo base | Qwen/Qwen3.6-35B-A3B, revisión congelada 995ad96eacd98c81ed38be0c5b274b04031597b0 |
| Tarea declarada (pipeline) | image-text-to-text |
| Biblioteca | peft |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 16 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un LoRA ordinario (sin DoRA ni RS-LoRA), con `r=16`, `lora_alpha=32`, escalado alpha/r = 2, dropout 0,05, `bias=none`, tipo de tarea `CAUSAL_LM` y sin `modules_to_save`. Los módulos objetivo son las proyecciones q/k/v/o de la self-attention del modelo de lenguaje, las proyecciones in_proj_qkv, in_proj_z, in_proj_b, in_proj_a y out_proj de la linear-attention, y las proyecciones gate/up/down del MLP compartido. El router de expertos, los pesos de los expertos enrutados, el codificador visual y el aligner permanecen congelados. El regex exacto de destino es `model\.language_model\.layers\.\d+\.(?:self_attn\.(?:q_proj|k_proj|v_proj|o_proj)|linear_attn\.(?:in_proj_qkv|in_proj_z|in_proj_b|in_proj_a|out_proj)|mlp\.shared_expert\.(?:gate_proj|up_proj|down_proj))`.

El entrenamiento se ejecutó en 2 GPU H100 con acumulación de gradiente 4, batch global 8 y 250 pasos de optimizador completados. Se usó una única época de SFT, batch por dispositivo 1, AdamW (`adamw_torch`), learning rate 1e-4, decaimiento coseno, warmup 0,03, weight decay 0,1, gradient checkpointing, DeepSpeed ZeRO-3, SDPA y kernels Liger, con semillas 20261016 para entrenamiento y datos. El empaquetado y el modo padding-free se desactivaron; se activó el agrupamiento por longitud. Las secuencias que excedían los 65.536 tokens se descartaron en lugar de truncarse, y el total de tokens de plantilla de origen asciende a 1.125.593 con un máximo de 4.043 por ejemplo, sin truncamiento.

La receta fijó `enable_thinking=false`, `preserve_thinking=false`, `add_non_thinking_prefix=true` y `loss_scale=default+ignore_empty_think`. Los campos de razonamiento ocultos y los bloques `<think>` iniciales cerrados se eliminaron en la preparación; se conservaron explicaciones visibles legítimas, observaciones de herramientas y campos de análisis o planificación de Terminal. La selección de checkpoint es un punto delicado: el mínimo de pérdida nativo correspondía al checkpoint 16, pero se publicó el checkpoint 250 basándose en una comparación de desarrollo independiente de 100 preguntas ya completada (48 aciertos frente a 43 aciertos y 2 inválidas del checkpoint 16, con cota superior de 45). El autor indica que esa elección se tomó antes de la evaluación formal de HLE y que no hubo validación de tarea ni retroalimentación formal que la respaldase.

## Capacidades

- Generación de texto y respuesta a preguntas de ámbito académico, con sesgo hacia matemáticas, biología y medicina, informática, física, química, ingeniería y humanidades.
- Razonamiento de tipo no-thinking: la receta de entrenamiento desactiva el modo de pensamiento explícito y elimina los campos de razonamiento oculto, por lo que el modelo ajustado responde con explicaciones visibles y prefijo no-thinking.
- Supervisión orientada a coincidencia de respuesta final, con datos derivados de conjuntos como Nemotron-SFT-Math-v4, MMLU-Pro, Nemotron-SFT-Science-v2 y dos conjuntos de razonamiento de terceros.
- Conservación de rastros de uso de herramientas: se mantuvieron observaciones de herramientas y campos de análisis/planificación de Terminal en los datos de entrenamiento, aunque no se documenta una evaluación específica de tool calling.
- Capacidad multimodal heredada del base: el pipeline declarado es image-text-to-text y el codificador visual y el aligner quedan intactos, pero la supervisión de este adaptador es solo textual, por lo que no se ha ajustado el comportamiento sobre imágenes.
- Capacidades multilingües: no disponibles (los idiomas soportados no se detallan en la información proporcionada).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Evaluación comparativa de adaptadores LoRA: sirve como artefacto de referencia para reproducir una receta PEFT completa (rango, targets, optimizador, precisión) sobre un MoE grande y medir el efecto de 250 pasos de SFT frente a alternativas.
- Investigación en ajuste eficiente de MoE: al congelar router y expertos enrutados y ajustar solo atención lineal, self-attention y MLP compartido, permite estudiar qué subconjunto de módulos concentra la ganancia en tareas de razonamiento académico.
- Generación de respuestas de opción múltiple en dominios científicos: encaja en pipelines que necesitan una respuesta corta y verificable para preguntas de matemáticas, física o química, donde el formato de salida debe ser conciso.
- Prototipado de asistentes de estudio: con un contexto de entrada potencialmente amplio (los datos llegan hasta 4.043 tokens de plantilla y el entrenamiento toleraba hasta 65.536), puede emplearse para responder dudas de temario con explicaciones visibles en lugar de cadenas de pensamiento ocultas.
- Bancos de pruebas de robustez y contaminación: la documentación incluye exclusiones exactas por coincidencia de 13 gramos y por familia de preguntas, lo que lo hace útil como caso de estudio para auditar solapamiento entre datos de entrenamiento y conjuntos de evaluación.
- Reutilización como punto de partida para ajustes posteriores: al ser un adaptador de 21,2 millones de parámetros y 0,1 GB, se puede versionar, combinar o continuar entrenando con coste de almacenamiento mínimo en comparación con un fine-tuning completo.
- Docencia y reproducibilidad de metodología: las decisiones de descarte de secuencias largas, techo de tokens de salida y criterios de selección de checkpoint son ejemplos concretos para discutir sesgos de selección en experimentos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. El autor indica expresamente que todas las puntuaciones formales pendientes de completar, que no se reclama ningún resultado de cuatro benchmarks ni garantía de rendimiento o corrección, y que las ejecuciones incompletas y las pérdidas de validación de SFT no constituyen puntuaciones finales.

| Evaluación | Resultado | Naturaleza del dato |
|---|---|---|
| Comparación interna de desarrollo (100 preguntas) | Checkpoint 250: 48 aciertos; checkpoint 16: 43 aciertos y 2 inválidas (cota superior 45) | Comparación de desarrollo ya completada, no una puntuación formal |
| HLE (2500) | Pendiente | El autor no presenta cifra |
| Conjunto formal de cuatro benchmarks | Pendiente | Sin resultados publicados |
| MMLU-Pro | No utilizable como evaluación held-out | El split test/validation de MMLU-Pro se reutilizó como train/validation del proyecto |

## Requisitos de hardware

- Adaptador: 84,76 MB en safetensors FP32 y 21,2 millones de parámetros; no consume VRAM apreciable por sí mismo.
- Requisito principal: hay que cargar por separado el modelo base Qwen3.6-35B-A3B con la revisión congelada 995ad96eacd98c81ed38be0c5b274b04031597b0. Sin esos pesos el adaptador no es funcional.
- VRAM de inferencia: no disponible como dato oficial. Como orientación derivada del tamaño nominal del base (35B totales, 3B activos), un despliegue en BF16/FP16 rondaría los 70 GB de pesos, en 8 bits unos 35 GB y en 4 bits unos 20-22 GB; estas cifras no están confirmadas en la ficha y deben validarse en el entorno real.
- GPU recomendadas para entrenamiento: la receta documentada usó 2 GPU H100 con DeepSpeed ZeRO-3, gradient checkpointing, SDPA y Liger, con batch global 8.
- GPU de consumo: no disponible. Un despliegue en 4 bits podría caber en tarjetas de 24 GB si el modelo base lo permite, pero no hay confirmación del autor ni mediciones publicadas.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador sobre el base; vLLM o TGI para servicio con el base y el adaptador acoplado; llama.cpp u Ollama requieren convertir el modelo base y el adaptador al formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Apex academic r16 (csminion/apex-qwen36-hle) | Adaptador LoRA sobre MoE | 21.166.080 en el adaptador; base no incluido | No disponible (datos de entrenamiento hasta 65.536 tokens) | Sin benchmarks formales; 48/100 en comparación interna de desarrollo | apache-2.0-adapter-contributions-plus-upstream-notices | Repositorio público de 0,1 GB, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | Modelo completo MoE | No disponible en la información (nomenclatura 35B-A3B) | No disponible | No disponible | No disponible | Pesos completos publicados en HuggingFace |
| Otros adaptadores LoRA de razonamiento académico | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de terceros comparables en la información proporcionada; la única comparación documentada es la interna entre los checkpoints 16 y 250 de este mismo adaptador.

## Limitaciones y advertencias

- Sin benchmarks formales: el autor declara explícitamente que no existe ninguna garantía de rendimiento ni de corrección, y que las puntuaciones de HLE y del conjunto de cuatro benchmarks están pendientes.
- Selección de checkpoint no validada formalmente: se publica el checkpoint 250 aunque el mínimo de pérdida era el 16, basándose en una comparación de 100 preguntas que el propio autor califica como no formal y previa a la evaluación oficial.
- Riesgo de alucinación: no cuantificado en la información disponible; el ajuste optimiza coincidencia de respuesta final, lo que puede favorecer respuestas seguras pero incorrectas en dominios fuera de la mezcla.
- Composición de datos sesgada: matemáticas concentra 817 de las 2.000 filas, mientras que química (132) o ingeniería (89) tienen representación muy inferior, lo que puede desequilibrar el comportamiento entre materias.
- Calidad desigual de las fuentes: parte de los datos proviene de conjuntos de razonamiento de publicadores personales con esfuerzo no documentado, y 162 de las referencias cortas de MMLU-Pro no son trayectorias de razonamiento completas.
- Contaminación metodológica conocida: MMLU-Pro se reutilizó como train/validation del proyecto, por lo que no puede presentarse como evaluación held-out de MMLU-Pro en este repositorio.
- Idoneidad de imagen no evaluada: aunque el pipeline es image-text-to-text y el codificador visual queda intacto, el entrenamiento fue solo textual; no hay evidencia de mejora en tareas visuales y el autor advierte que el conjunto no replica la distribución de imágenes de HLE.
- Idiomas: no disponibles, sin garantía de comportamiento fuera de los idiomas presentes en los datos de entrenamiento.
- Licencia: la etiqueta `apache-2.0-adapter-contributions-plus-upstream-notices` con `license: other` implica que el uso comercial de las contribuciones del adaptador está sujeto a los avisos upstream del modelo base; conviene revisar el archivo LICENSE y las condiciones de Qwen/Qwen3.6-35B-A3B antes de un despliegue en producción.
- Dependencia de una revisión concreta: el adaptador está anclado a la revisión 995ad96eacd98c81ed38be0c5b274b04031597b0 del base; cambios en el modelo subyacente pueden romper la compatibilidad.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso en producción.
- Trazabilidad limitada del entrenamiento: los recuentos de filas exportadas y cargadas se reportan por separado y no constituyen una traza de exposición por lote.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csminion/apex-qwen36-hle
- Modelo base Qwen/Qwen3.6-35B-A3B (revisión congelada): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Dataset Nemotron-SFT-Math-v4: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4/blob/84d42ad0cb960f07f951b9baa9ed2b46a5a18c66/README.md
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro/blob/b189ec765aa7ed75c8acfea42df31fdae71f97be/README.md
- Dataset Nemotron-SFT-Science-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Science-v2/blob/6536a5021222a94126968e8c92f29ee47fc8a7df/README.md
- Dataset DeepSeek-V4-Pro-Reasoning-8000x: https://huggingface.co/datasets/trjxter/DeepSeek-V4-Pro-Reasoning-8000x/blob/7329257a28babc5998be072a3d8add1dd8ad0fda/README.md
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned/blob/f6d6ccafe40359d5ec2515ee25e92aac8cae9c3d/README.md
- Paper, blog o demo adicionales: no disponibles
