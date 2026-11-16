# SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-LoRA

## Resumen

HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-LoRA es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen3-VL-8B-Instruct mediante aprendizaje por refuerzo con retroalimentación verificable (RLVR) usando PPO. Lo desarrolla SLOCBench y forma parte de un informe de ocho líneas base completadas para la tarea HumanoidSafe, un conjunto de datos centrado en la seguridad de instrucciones en escenarios con humanoides. El adaptador modifica únicamente las proyecciones de atención y MLP del componente lingüístico; la torre de visión permanece congelada.

El modelo resuelve un problema acotado: alinear la respuesta de un VLM ante instrucciones seguras o peligrosas en contextos de vídeo de eventos con humanoides, aprendiendo a rechazar las ramas dañinas y a responder a las seguras. Para ello se usa una recompensa binaria terminal basada en un clasificador de frases de rechazo, complementada con un crítico escalar por token y regularización KL contra el modelo base congelado. El entrenamiento se realizó con un presupuesto fijo de 3 épocas y semilla 42, sin selección de checkpoint guiada por test.

El resultado es un checkpoint de inferencia de aproximadamente 43,6 millones de parámetros entrenables sobre un total de 8.810 millones, con licencia Apache 2.0, soporte de inglés y chino, y un pipeline de image-text-to-text orientado a vídeo. No incluye cabeza de valor PPO ni estado del optimizador, por lo que solo sirve para evaluación e inferencia sobre el modelo base fijado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptador LoRA PEFT sobre el componente lingüístico; torre de visión congelada |
| Parametros totales | 8.810.770.672 (modelo base + adaptador) |
| Parametros activos | 43.646.976 entrenables en el adaptador LoRA (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta inferencia en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT sin fusionar), más tokenizer y processor |
| Libreria | peft |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (revisión 0c351dd01ed87e9c1b53cbc748cba10e6187ff3b) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0 |
| Módulos LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj (solo lenguaje) |
| Precisión de inferencia | BF16 con autocast_adapter_dtype=False |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Instruct, un transformer vision-language que procesa imágenes y vídeo mediante un codificador visual con parches de 16 píxeles y un decodificador lingüístico. El entrenamiento congela la torre de visión y solo actualiza las proyecciones q, k, v, o, gate, up y down del modelo de lenguaje mediante LoRA de rango 16 y alpha 32. La inferencia se ejecuta en BF16 con atención SDPA y caché activada.

El entrenamiento usa PPO con un crítico escalar por token sobre el backbone compartido del actor, gamma 1, GAE lambda 0,95, coeficiente de pérdida de valor 0,5 y recorte de valor 0,2. La recompensa es binaria y terminal: se asigna 1 a rechazo en ramas dañinas y 0 a no rechazo, e inversamente en ramas seguras. El verificador es un clasificador de frases de rechazo del repositorio; GPT-5.5 actúa como recompensa adicional con rúbrica fija y bajo esfuerzo de razonamiento. Se aplica regularización KL contra el modelo base congelado con beta 0,02, recorte de gradiente de norma máxima 1,0 y normalización de ventajas sobre tokens válidos globales.

El presupuesto fue de 3 épocas con semilla 42: 1.764 presentaciones de prompt activas, 7.056 completaciones válidas muestreadas, 222 actualizaciones de rollout, dos pasadas de política por actualización y 444 pasos de optimizador. El lote fue de 8 prompts activos por 4 completaciones, salvo el lote final de cada época con 4 prompts. Se usó AdamW con learning rate 1e-05 constante, betas 0,9/0,999, epsilon 1e-8 y weight decay 0. El entrenamiento se distribuyó con FSDP en 8 GPUs, con cómputo BF16 y parámetros maestros y estado de Adam en FP32, además de gradient checkpointing. El dataset fue SLOCBench/HumanoidSafe en configuración checked, revisión 7952f2e870fb8f1dae6bc30ad6c5f09e845cbb0a, con 294 pares y 588 ramas de instrucción segura y dañina.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo, heredados del modelo base Qwen3-VL-8B-Instruct.
- Procesamiento de vídeo con ocho fotogramas previos al evento como bloque único, FPS 2.0, mínimo 4.096 píxeles y máximo 262.144 píxeles por fotograma.
- Clasificación de seguridad de instrucciones en escenarios con humanoides: distingue ramas seguras y dañinas y produce rechazo o no rechazo según la etiqueta.
- Generación de una descripción breve de escena y acción seguida de una etiqueta final `<action>...</action>`.
- Soporte de conversación multi-turno en formato image-text-to-text.
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking específico en la información disponible.

## Casos de uso

- Evaluación de seguridad en robótica humanoide: el adaptador permite medir si un VLM rechaza instrucciones peligrosas en secuencias de vídeo de eventos con humanoides, usando las plantillas `base` y `safe` del repositorio y las ocho imágenes previas al evento como entrada.
- Investigación en RLVR y PPO para alineamiento multimodal: sirve como línea base reproducible con presupuesto fijo, semilla 42 y configuración documentada, útil para comparar contra otras siete líneas base del informe de SLOCBench.
- Auditoría de clasificadores de rechazo: al usar un verificador basado en frases de rechazo, el modelo permite estudiar cómo se comporta la política aprendida frente a distintos umbrales y rúbricas de evaluación.
- Análisis de sesgo de recompensa: al combinar recompensa binaria terminal con GPT-5.5 como juez, el checkpoint permite investigar cómo la política aprende a satisfacer al verificador y qué artefactos aparecen en las respuestas.
- Prototipado de filtros de seguridad para asistentes de vídeo: el adaptador puede integrarse en un pipeline de Qwen3-VL para prefiltrar instrucciones antes de ejecutar acciones en entornos simulados de humanoides.
- Reproducción de experimentos con PEFT: al ser un adaptador LoRA sin fusionar, facilita la carga con `PeftModel` y la comparación directa contra el modelo base congelado en condiciones idénticas de BF16 y SDPA.
- Docencia y formación en alineamiento: el repositorio incluye configuración de entrenamiento, plantillas de prompt y script de carga, lo que lo hace útil para explicar PPO, KL y LoRA en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo referencia el informe de ocho líneas base en GitHub, pero no se incluyen cifras numéricas de MMLU, HumanEval, GSM8K ni de la tarea HumanoidSafe en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor solo documenta BF16 con `device_map="auto"`. Como referencia del modelo base de 8B en BF16, se requiere aproximadamente 16 GB de VRAM solo para pesos, más memoria para activaciones y caché.
- GPU recomendadas: el entrenamiento usó FSDP en 8 GPUs, sin especificar modelo. Para inferencia BF16 se recomienda A100 40GB, H100 o RTX 4090 24GB.
- Cabe en GPU consumer: probablemente en RTX 4090 24GB en BF16 para el modelo base, aunque no está confirmado en la información disponible. En cuantización no se documentan opciones.
- Opciones de despliegue: carga con `transformers` + `peft` usando `Qwen3VLForConditionalGeneration` y `PeftModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-LoRA | 43,6M entrenables / 8,81B total | no disponible | apache-2.0 | Adaptador LoRA RLVR con PPO sobre Qwen3-VL-8B | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | no disponible en la información | Modelo base vision-language | Hugging Face |
| Otras líneas base del informe SLOCBench | no disponible | no disponible | no disponible | Variantes RLVR (PPO/otras) sobre el mismo base | GitHub del autor |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El modelo solo es comparable directamente contra el base Qwen3-VL-8B-Instruct y contra las otras siete líneas base del informe de SLOCBench, cuyos datos no se incluyen.

## Limitaciones y advertencias

- Es un adaptador LoRA sin fusionar: requiere el modelo base fijado en la revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` y no funciona de forma autónoma.
- No incluye cabeza de valor PPO, estado del optimizador ni estado de reanudación de entrenamiento; es solo un checkpoint de inferencia.
- El entrenamiento se limita a 294 pares y 588 ramas de instrucción, con 3 épocas y semilla 42; el sobreajuste y la varianza entre semillas no se han caracterizado en la información disponible.
- La recompensa depende de un clasificador de frases de rechazo y de GPT-5.5 como juez, lo que puede introducir sesgos del verificador y fomentar respuestas que satisfagan al clasificador sin reflejar una comprensión real de la seguridad.
- El modelo solo declara soporte de inglés y chino; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no está especificada; el procesamiento de vídeo se limita a ocho fotogramas previos al evento con FPS 2.0 y un rango de 4.096 a 262.144 píxeles por fotograma.
- No se documentan capacidades de tool calling, agentes ni modo thinking; asumirlas sería una extrapolación no verificada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene sus propias condiciones que deben respetarse.
- Riesgo de alucinación y sesgos heredados del modelo base no cuantificados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SLOCBench/HumanoidSafe-Qwen3-VL-8B-PPO-GPT55-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Dataset: https://huggingface.co/datasets/SLOCBench/HumanoidSafe
- Informe de ocho líneas base: https://github.com/chrisyxue/eval_humanoid/blob/ead933f1c90769299c13888cc2034f4377623b61/reports/humanoidsafe-qwen3vl8b-rlvr-2026-11-15/README.md
- Implementación de preparación de entrada: https://github.com/chrisyxue/eval_humanoid/blob/51715e55597ad3bc1e27ff2a39ab7d9be41c86de/model/open/qwen_vl.py
