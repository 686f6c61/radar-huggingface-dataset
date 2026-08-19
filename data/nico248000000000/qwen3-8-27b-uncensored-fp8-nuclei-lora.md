# nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei-LoRA

## Resumen

El modelo `nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei-LoRA` es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8`, un checkpoint de 27 000 millones de parámetros en precisión FP8 con capacidades multimodales (visión, vídeo y audio). El adaptador ha sido fine-tuneado con la librería Unsloth (QLoRA) sobre un conjunto de datos SFT especializado en la generación de scripts nuclei a partir de CVEs o exploits. El resultado es un asistente conversacional de dominio específico para equipos de seguridad ofensiva que necesitan automatizar la creación de plantillas de detección.

El interés de este modelo radica en su especialización: en lugar de un modelo generalista, ofrece una herramienta ajustada para una tarea concreta (redacción de scripts nuclei) manteniendo las capacidades multimodales del modelo base, aunque estas quedaron congeladas durante el entrenamiento. Con un contexto de 2048 tokens y un entrenamiento de una sola época sobre 919 ejemplos, es un experimento ligero y rápido (16,7 minutos en una RTX PRO 6000 Blackwell) que demuestra la viabilidad de adaptar modelos grandes a dominios muy específicos con pocos recursos.

La relevancia actual viene dada por el creciente interés en modelos de seguridad ofensiva y en la automatización de tareas de pentesting mediante IA. Sin embargo, hay que señalar que el adaptador tiene cero descargas y cero likes en HuggingFace, y que la licencia es `other`, lo que obliga a revisar las condiciones del modelo base antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con torres de vision y video) |
| Parametros totales | 27 000 millones (segun nombre del modelo base, no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | FP8 (modelo base), bf16 (entrenamiento LoRA), GGUF Q4_K_M disponible via comunidad (~16,8 GB) |
| Idiomas soportados | en, fr |
| Licencia | other (heredar la licencia del modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8`) |
| Formato de pesos | safetensors (adaptador LoRA, 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no se detalla en la informacion proporcionada. Por el nombre y las etiquetas, se trata de un modelo transformer multimodal con torres separadas para vision, video y audio, similar a la familia Qwen3.8. El adaptador LoRA se aplica a todas las proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `out_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 8 y alpha 16. El entrenamiento se realizo con QLoRA en bf16, una sola epoca, learning rate 2e-4, warmup del 5 %, batch efectivo de 8 y optimizador adamw_8bit, con empaquetado de secuencias activado.

El dataset de entrenamiento (`dataset_nuclei.jsonl`) contiene 919 ejemplos de entrenamiento y 10 de evaluacion, con formato chat-templated (mensajes `instruction` + `output`). Las torres de vision y video se mantuvieron congeladas durante el SFT de texto. El entrenamiento completo tardo 16,7 minutos en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 95 GiB de VRAM.

## Capacidades

- Generacion de scripts nuclei a partir de descripciones de CVEs o exploits, la tarea principal del fine-tune.
- Q&A y redaccion de texto en el dominio de seguridad (nuclei, deteccion de vulnerabilidades).
- Conversacion multi-turno gracias al formato chat-templated.
- Capacidades multimodales conservadas (vision y video) heredadas del modelo base, aunque las torres estan congeladas y no fueron entrenadas para esta tarea.
- Soporte de idiomas ingles y frances (declarado en la model card).
- No se menciona soporte explicito de tool calling, function calling ni agentes en la informacion disponible.

## Casos de uso

- Automatizacion de plantillas nuclei: un analista de seguridad introduce un CVE y el modelo genera un script nuclei listo para revisar, reduciendo el tiempo de redaccion manual.
- Integracion en pipelines de pentesting: el adaptador puede usarse como paso intermedio en flujos CI/CD que procesen avisos de vulnerabilidades y generen reglas de deteccion automaticamente.
- Documentacion de vulnerabilidades: a partir de un informe tecnico, el modelo puede redactar la seccion de deteccion con el formato nuclei adecuado.
- Asistencia en formacion de seguridad ofensiva: estudiantes y profesionales pueden usarlo para aprender a estructurar scripts nuclei a partir de ejemplos reales.
- Analisis de exploits: dado un fragmento de codigo de exploit, el modelo puede sugerir la plantilla nuclei correspondiente para verificar la vulnerabilidad.
- Generacion de informes tecnicos: el modelo puede ayudar a redactar descripciones de hallazgos de seguridad en ingles o frances, aunque su calidad fuera del dominio nuclei es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es la perdida de evaluacion (eval_loss) sobre el holdout del dataset de entrenamiento:

| Metrica | Valor |
|---|---|
| Eval loss (holdout nuclei SFT) | 14,090689 |

Este valor es una perdida de lenguaje, no comparable con benchmarks publicos como MMLU o HumanEval. El autor indica explicitamente que la evaluacion es un holdout loss y no un leaderboard publico. No se dispone de datos de rendimiento en tareas generales ni comparativas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA pesa 0,2 GB, pero el modelo base FP8 de 27B requiere una GPU con soporte para FP8 (NVIDIA Ada Lovelace o posterior, o Blackwell).
- Para inferencia en consumer GPU, la comunidad ofrece cuantizacion GGUF Q4_K_M (~16,8 GB), que cabe en GPUs de 24 GB VRAM como la RTX 4090 o RTX 3090.
- El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell Server Edition (95 GiB VRAM), pero para inferencia no se requieren tantos recursos.
- Opciones de despliegue: vLLM (mencionado en la comunidad para modelos abliterados similares), llama.cpp para GGUF, Ollama (se menciona una etiqueta Ollama en el repositorio GitHub de la comunidad), y Transformers con PEFT para el adaptador.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Existen otros modelos abliterados de la familia Qwen (por ejemplo, `huihui-ai/Qwen3-8B-abliterated`), pero son de diferente tamano (8B) y no especializados en nuclei. El modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8` es el punto de referencia natural, pero no se han publicado comparativas directas entre ambos. No se puede establecer una tabla comparativa fiable con la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado exclusivamente para generar scripts nuclei; su calidad degrada significativamente fuera de este ambito, como reconoce el propio autor.
- La perdida de evaluacion (14,09) es alta, lo que sugiere que el modelo puede tener dificultades para generalizar incluso dentro del dominio, posiblemente por el pequeno tamano del dataset (919 ejemplos).
- El adaptador tiene cero descargas y cero likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- Licencia `other`: se debe revisar y respetar la licencia del modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8`; no se especifican los terminos exactos.
- No se han realizado evaluaciones de seguridad o sesgos. Al ser un modelo "uncensored", puede generar contenido no deseado si se usa fuera de su dominio previsto.
- El contexto de 2048 tokens es limitado para tareas que requieran documentos largos o historiales extensos.
- No apto para uso en produccion sin una validacion exhaustiva y sin cumplir los requisitos de certificacion que el autor menciona como fuera de alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nico248000000000/Qwen3.8-27B-Uncensored-FP8-nuclei-LoRA
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Repositorio GitHub de la comunidad sobre Qwen3.8-27B Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Blog de MindStudio sobre abliteracion de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog de Orcarouter sobre los pesos abiertos de Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-open-weights-leak
