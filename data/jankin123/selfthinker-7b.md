# jankin123/SelfThinker-7B

## Resumen

SelfThinker-7B es un modelo vision-language multimodal especializado en razonamiento visual, desarrollado por el usuario jankin123 y entrenado a partir de ThinkMorph-7B (que a su vez emplea la arquitectura BAGEL-7B-MoT). El modelo aborda el problema del razonamiento visual de alta calidad: en lugar de depender de cadenas de pensamiento textuales genericas, SelfThinker se entrena para producir "pensamientos visuales intrinsecos" verificados por fiabilidad, es decir, representaciones intermedias que el propio modelo valida antes de emitir la respuesta final.

La innovacion principal reside en su procedimiento de entrenamiento: destilacion auto-dirigida (self-distillation) a nivel de token mediante divergencia Jensen-Shannon (JSD) en politica, combinada con una verificacion de fiabilidad de los pensamientos visuales generados. El modelo se optimiza con 1.000 pasos sobre 8 GPUs con FSDP, partiendo de un learning rate de 1e-5 con decaimiento coseno hasta 1e-7, warmup de 200 pasos y EMA con decaimiento 0.995. El conjunto de datos de entrenamiento consta de 1.092 pensamientos de busqueda visual verificados por auditoria.

El checkpoint resultante alcanza una media de 64,0 puntos en una evaluacion de siete benchmarks, lo que supone una mejora de +11,3 puntos respecto a su modelo base ThinkMorph-7B (52,7). Es relevante ahora porque demuestra que la auto-evolucion y la auto-destilacion aplicadas a modelos multimodales pueden mejorar sustancialmente el razonamiento visual sin necesidad de supervision externa masiva, y porque opera en modo de inferencia solo-texto (sin generacion de imagenes), lo que reduce la latencia a cero en ese aspecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL-7B-MoT (Mixture of Transformers) con backbone de lenguaje Qwen2-7B y vision SigLIP |
| Parametros totales | 14.578.347.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ae.safetensors) |

## Arquitectura y entrenamiento

SelfThinker-7B emplea la arquitectura BAGEL-7B-MoT, un diseno Mixture of Transformers que combina un backbone de lenguaje Qwen2-7B con un codificador visual SigLIP (patch_size=14, image_size=980). El repositorio incluye tambien un VAE de Flux (ae.safetensors, 335 MB) y el tokenizador rapido de Qwen2. El checkpoint principal (model.safetensors) ocupa 58,3 GB y corresponde a los pesos EMA del paso 999.

El entrenamiento se basa en destilacion auto-dirigida a nivel de token con divergencia Jensen-Shannon en politica (privileged on-policy token-level JSD self-distillation), con el objetivo configurado como `visual_gen=False`. Los datos de entrenamiento son 1.092 pensamientos de busqueda visual verificados por fiabilidad (conjunto `audit_pass_l0_vsearch_trainonly`). La optimizacion se realizo durante 1.000 pasos sobre 8 GPUs con FSDP, learning rate de 1e-5 con decaimiento coseno hasta 1e-7, warmup de 200 pasos, EMA con decaimiento 0.995 y semilla 4411. El modo de inferencia es de razonamiento solo-texto sobre imagen unica (`understanding_output=True`), sin generacion de imagenes y por tanto sin latencia asociada a esa tarea.

## Capacidades

- Razonamiento visual multimodal sobre imagenes unicas, con produccion de pensamientos visuales intrinsecos verificados por fiabilidad.
- Comprension de imagenes y respuesta a preguntas visuales (VQA) en dominios como graficos, diagramas y escenas complejas.
- Razonamiento de multiples pasos con modo "thinking" (max_think_token_n configurable, por defecto 1024 en evaluacion).
- Procesamiento de vision mediante SigLIP con resolucion de imagen de 980x980 y parches de 14.
- Generacion de texto condicionada por imagen en modo solo-texto (sin generacion de imagenes).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de graficos y tablas: el modelo obtiene 80,1 en ChartQA, por lo que es adecuado para extraer y razonar sobre datos representados en graficos de barras, lineas y diagramas, integrándose en pipelines de automatizacion de informes financieros o cientificos.
- Razonamiento visual complejo en entornos educativos: con 70,2 en V* y 60,0 en SAT, puede emplearse para resolver problemas de geometria, fisica o interpretacion de figuras, actuando como tutor que explica el razonamiento paso a paso.
- Verificacion de consistencia visual: su capacidad de generar pensamientos visuales verificados por fiabilidad permite usarlo en tareas de control de calidad donde se debe comprobar si una imagen coincide con una descripcion o especificacion.
- Busqueda visual y localizacion de objetos: con 15,8 en VSP (frente a 1,2 del modelo base), es util para tareas de grounding visual donde se requiere localizar y razonar sobre regiones especificas de una imagen.
- Evaluacion de documentos escaneados y capturas: con 82,3 en MMVP y 81,7 en CV-Bench, puede procesar imagenes de documentos, interfaces o escenas para extraer informacion estructurada y responder preguntas sobre ellas.
- Investigacion en razonamiento multimodal: sirve como checkpoint de referencia para estudiar auto-destilacion y auto-evolucion en modelos vision-language, gracias a su pipeline reproducible (codigo en GitHub y datos publicados).
- Despliegue en modo solo-texto de baja latencia: al operar con `understanding_output=True` y sin generacion de imagenes, es adecuado para servicios de inferencia donde la latencia de generacion visual es inaceptable.

## Benchmarks y rendimiento

Evaluacion con VLMEvalKit bajo decodificacion greedy solo-texto (`understanding_output=True`, `temperature=0.0`, `max_think_token_n=1024`) y juez Qwen3-30B-A3B-Instruct-2507.

| Metodo | VSP | ChartQA | V* | MMVP | SAT | BLINK | CV-Bench | Media | Delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ThinkMorph-7B | 1,2 | 52,7 | 53,9 | 79,0 | 55,3 | 53,6 | 73,4 | 52,7 | — |
| SelfThinker (Nav, 2k) | 2,0 | 78,1 | 63,4 | 80,3 | 58,0 | 60,3 | 78,0 | 60,0 | +7,3 |
| SelfThinker (Mix) | 5,5 | 74,7 | 70,2 | 79,3 | 54,7 | 58,0 | 83,5 | 60,8 | +8,1 |
| SelfThinker (Vote) (label-free) | 13,0 | 81,9 | 67,0 | 80,0 | 60,0 | 59,3 | 82,4 | 63,4 | +10,7 |
| SelfThinker | 15,8 | 80,1 | 70,2 | 82,3 | 60,0 | 58,2 | 81,7 | 64,0 | +11,3 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 58,3 GB, por lo que en precision completa (fp16/bf16) requiere al menos 2 GPUs de 40 GB o una GPU de 80 GB. Con cuantizacion a 8 bits se estima en torno a 15-16 GB, y a 4 bits en torno a 8-9 GB, aunque no se han publicado configuraciones oficiales de cuantizacion.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con FSDP. Para consumer, una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva (4 bits) y posiblemente offloading.
- Cabe en consumer GPU: si, en RTX 4090 o RTX 3090 con cuantizacion a 4 bits, aunque con limitaciones de contexto y sin datos oficiales de rendimiento.
- Opciones de despliegue: el repositorio proporciona scripts de inferencia propios (`scripts/eval_nine.sh`) y servidor de juez (`scripts/serve_judge.sh`). No se mencionan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. El modo solo-texto elimina la latencia de generacion de imagenes, lo que reduce el coste frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 7 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SelfThinker-7B | 14,58 B | no disponible | 64,0 | apache-2.0 | HuggingFace (jankin123/SelfThinker-7B) |
| ThinkMorph-7B | no disponible | no disponible | 52,7 | no disponible | HuggingFace (ThinkMorph/ThinkMorph-7B) |
| BAGEL-7B-MoT | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada. La comparativa principal disponible es con su modelo base ThinkMorph-7B, sobre el que mejora +11,3 puntos de media.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al derivar de Qwen2-7B y SigLIP, puede heredar sesgos de esos backbones.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento visual ambiguo o imagenes de baja calidad.
- Limitaciones de contexto: la longitud de contexto no esta documentada; la evaluacion usa `max_think_token_n=1024`, lo que sugiere un limite practico en la profundidad del razonamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados; el tokenizador es Qwen2, lo que sugiere buen soporte multilingue, pero no esta confirmado.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial con atribucion, pero se recomienda verificar las licencias de los modelos base (ThinkMorph-7B, BAGEL-7B-MoT) y del VAE de Flux, que pueden tener terminos adicionales.
- Caveat para produccion: el modelo esta disenado para inferencia solo-texto sobre imagen unica; no soporta generacion de imagenes en este checkpoint. El repositorio tiene solo 20 descargas y 0 likes, por lo que su madurez y soporte comunitario son limitados.
- El checkpoint ocupa 58,3 GB y el repositorio completo 117 GB, lo que exige infraestructura de almacenamiento considerable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jankin123/SelfThinker-7B
- Dataset: https://huggingface.co/jankin123/SelfThinker
- Codigo en GitHub: https://github.com/zhangquanchen/SelfThinker
- Modelo base: https://huggingface.co/ThinkMorph/ThinkMorph-7B
- Juez de evaluacion: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
