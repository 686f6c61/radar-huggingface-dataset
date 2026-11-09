# carlesoctav/grafting-gh_pr_task

## Resumen

Grafted Gemma-4-E4B (GitHub PR Task) es un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4 de Google, publicado por el usuario carlesoctav en Hugging Face. No se trata de un entrenamiento convencional, sino de una fusión de pesos mediante la técnica Grafting descrita en el artículo "Off-Policy Merging Beats On-Policy Self-Distillation for Continual Learning" (Wu, Zhang y Raghunathan, CMU, 2026). El objetivo es especializar el modelo post-entrenado en tareas de razonamiento sobre pull requests de GitHub sin destruir las capacidades previas de razonamiento e instrucción.

La receta parte del checkpoint instruction-tuned `google/gemma-4-E4B-it` como modelo destino y del checkpoint base pretrained `google/gemma-4-e4b` como donante. Sobre el donante se entrena un adaptador QLoRA de rango 16 con trazas de razonamiento de PRs de GitHub, y el vector de tarea resultante se trasplanta al modelo post-entrenado con un factor de escala λ = 1,0. Las coordenadas de alta sensibilidad (embeddings de la capa 0 y embeddings Engram de 42 capas, 3,49B parámetros) se congelan para preservar los tokens de control de razonamiento.

El modelo tiene 7.996.156.490 parámetros totales según los safetensors del repositorio (16,0 GB), hereda la licencia Gemma y se distribuye en formato safetensors para su uso con la librería transformers. Es relevante como caso práctico de merging off-policy para aprendizaje continuo: permite añadir una habilidad concreta (análisis de diffs y redacción de descripciones de PR) a un modelo ya instruido sin reentrenar desde cero ni perder las representaciones de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), derivada de `google/gemma-4-E4B-it`; incluye embeddings Engram de 42 capas |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible (la model card no confirma configuración MoE ni número de expertos activos) |
| Longitud de contexto | no disponible (la model card solo indica longitud objetivo de secuencia de entrenamiento de 24.000 tokens, empaquetada con BFD) |
| Tipos de cuantizacion | 4-bit QLoRA usada en el entrenamiento del donante; no se documentan cuantizaciones publicadas para inferencia (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de la licencia Gemma de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Gemma 4, con capacidad image-text-to-text. La intervención no modifica la topología: se aplica sobre los pesos del checkpoint post-entrenado `google/gemma-4-E4B-it` un vector de tarea calculado como diferencia entre el donante afinado y el donante base, escalado por λ = 1,0 y enmascarado por una matriz de protección Mρ. La actualización se formula como θ(λ, ρ) = θ_post + λ · Mρ ⊙ (θ_donor-ft − θ_donor).

El donante (`google/gemma-4-e4b`, pretrained) se adaptó con QLoRA de rango r = 16 y α = 16 (factor de escala 1,0) sobre 258 módulos: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usó el dataset `sft_dataset_inkling_f2p.jsonl` de trazas de razonamiento de PRs de GitHub, con secuencias empaquetadas de 24.000 tokens (BFD), 12 pasos en 3 épocas sobre 4× NVIDIA L4 en DDP. La pérdida evolucionó de 2,926 a 1,330 (época 1), 1,159 (época 2) y 0,9242 (época 3), con pérdida media de 1,434 y norma de gradiente final de 0,4636 sin clipping.

La innovación clave es la protección selectiva: los embeddings de la capa 0 y los embeddings Engram de 42 capas (3,49B parámetros en total) permanecen congelados en sus valores post-entrenados (ΔW = 0), preservando las representaciones de los tokens de control `<|think|>`, `<|turn>`, `<|channel>` y `<|tool_call>`. Las 258 matrices lineales de atención y MLP se trasplantan mediante ΔW = (α/r)(B @ A).

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredado del checkpoint `gemma-4-E4B-it`.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento especializado en análisis de diffs de repositorios y redacción de descripciones de pull requests, según el dataset de entrenamiento.
- Soporte de tokens de control de razonamiento (`<|think|>`, `<|turn>`, `<|channel>`, `<|tool_call>`), preservados explícitamente por el enmascaramiento de Grafting.
- Soporte de tool calling / function calling, inferido de la presencia del token `<|tool_call>` en las representaciones protegidas.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Modo thinking: no disponible como parámetro explícito en la model card, aunque el token `<|think|>` está presente en el vocabulario protegido.

## Casos de uso

- Redacción automática de descripciones de pull requests: el modelo recibe un diff de repositorio y genera una descripción estructurada; es el escenario para el que se entrenó el vector de tarea, con secuencias de hasta 24.000 tokens.
- Revisión de código en CI/CD: integrado en un pipeline que analiza el diff de cada PR y emite un resumen o comentario de revisión antes del merge, aprovechando el soporte de tool calling para consultar metadatos del repositorio.
- Asistente de mantenimiento de repositorios: clasificación y resumen de PRs entrantes en proyectos con alto volumen, usando el contexto largo para procesar diffs completos junto con el historial de conversación.
- Agente de triaje de issues y PRs: combinación de razonamiento multi-paso y llamadas a herramientas para etiquetar, asignar revisores y enlazar PRs con issues relacionados.
- Documentación técnica asistida: generación de notas de versión y changelogs a partir de los diffs acumulados entre releases.
- Análisis multimodal de incidencias: al ser image-text-to-text, puede procesar capturas de pantalla o diagramas adjuntos a un PR junto con el texto del diff.
- Base para experimentos de aprendizaje continuo: sirve como referencia reproducible de la técnica Grafting para investigadores que quieran añadir nuevas habilidades a un modelo post-entrenado sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento del donante (pérdida y norma de gradiente), no evaluaciones de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (7,996B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100 o H100 para despliegue con contexto largo y concurrencia; L4 o RTX 4090 para inferencia individual. El entrenamiento del donante se realizó sobre 4× NVIDIA L4.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen ajustado, y en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: transformers con `Gemma4ForConditionalGeneration` y `device_map="auto"`; vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| carlesoctav/grafting-gh_pr_task | 7,996B | no disponible | Gemma | safetensors | Especializado en PRs de GitHub vía Grafting |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Gemma | safetensors | Checkpoint post-entrenado de origen; capacidades generales de instrucción y razonamiento |
| google/gemma-4-e4b | no disponible en la información | no disponible | Gemma | safetensors | Checkpoint base pretrained usado como donante |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el vector de tarea se entrenó con solo 12 pasos sobre un dataset concreto de trazas de PRs; el riesgo de sobreajuste a ese formato es alto y la generalización a otros dominios no está evaluada.
- Sesgos: no documentados por el autor; al heredar el checkpoint Gemma 4, arrastra los sesgos del modelo base y del corpus de PRs utilizado.
- Riesgo de alucinación: no evaluado; en tareas de análisis de código puede generar descripciones plausibles pero incorrectas sobre cambios que no aparecen en el diff.
- Idiomas: no se documenta qué idiomas soporta; no se debe asumir cobertura multilingüe.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones de uso aceptable y obligaciones de atribución.
- Sin datos de benchmarks ni de cuantizaciones publicadas: la evaluación en producción requiere validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- El contexto máximo real no está confirmado; la longitud de 24.000 tokens corresponde al empaquetado de entrenamiento, no necesariamente a la ventana de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carlesoctav/grafting-gh_pr_task
- Modelo base post-entrenado: https://huggingface.co/google/gemma-4-E4B-it
- Modelo donante pretrained: https://huggingface.co/google/gemma-4-e4b
- Paper de Grafting: https://arxiv.org/abs/2610.05872
- Página del proyecto Grafting: https://ar-forum.github.io/grafting-web/
