# iclropen/evidence-audit-qwen7b-pc-a05-s0

## Resumen

`evidence-audit-qwen7b-pc-a05-s0` es un adaptador LoRA para el modelo vision-lenguaje Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen`. No es un modelo completo, sino un conjunto de pesos de adaptación (190 MB) que modifica únicamente el modelo de lenguaje del base, dejando intacta la torre visual. Su propósito no es el uso general, sino servir como artefacto de reproducibilidad para el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El adaptador se entrena con un objetivo denominado "placebo-controlled", diseñado para que el modelo base aprenda a depender de la evidencia visual real (el intervalo anotado en un vídeo) y no de atajos superficiales. Se evaluó sobre el conjunto Charades-STA, una tarea de localización temporal de acciones en vídeo, con entradas de hasta 768 fotogramas a 2 fps. La relevancia de este repositorio es, por tanto, metodológica: documenta cómo medir y entrenar la dependencia de evidencia en tareas de grounding temporal de vídeo, más que ofrecer un modelo listo para producción.

El repositorio incluye tres carpetas de pesos (adaptador raíz, copia con claves renombradas para transformers 5 y una segunda ejecución independiente), cada una con su versión de software asociada. La licencia es Apache 2.0, heredada del modelo base, y el tamaño total del repo es de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (transformer vision-lenguaje); solo se adaptan módulos del modelo de lenguaje |
| Parametros totales | no disponible (el adaptador LoRA contiene 190.435.728 bytes en `adapter_model.safetensors`; el base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5-VL) |
| Idiomas soportados | no disponible (heredados del base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct mediante PEFT. La configuración LoRA es r=16, `lora_alpha`=32, dropout 0,05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Un detalle técnico relevante: las ejecuciones con transformers 4.51 usaron gradient checkpointing, lo que provocó que la torre visual no recibiera gradiente; sus matrices `lora_B` de la visión son todas cero, de modo que el adaptador modifica solo el modelo de lenguaje. La copia `transformers-v5/` se generó por renombrado uno a uno de claves y es bit-idéntica al adaptador raíz.

El entrenamiento sigue el objetivo de la Sección 4 del artículo: `L = alpha * NLL(clean) + sum_w [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el vídeo con la evidencia editada y `x_O` un placebo emparejado fuera del intervalo anotado. Se usaron 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8, semilla 0, alpha=0,5 y beta=0,1, con pesos de operador Group-DRO y una cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` (peso del hinge 1,0). Los operadores de edición aplicados durante el entrenamiento fueron swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas.

## Capacidades

- Localización temporal de acciones en vídeo (video temporal grounding) sobre Charades-STA, heredando la capacidad vision-lenguaje de Qwen2.5-VL-7B-Instruct.
- Procesamiento de vídeo con muestreo a 2 fps y hasta 768 fotogramas por entrada.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento busca que la predicción dependa del intervalo anotado y no de atajos.
- Capacidades generales del base Qwen2.5-VL-7B-Instruct (generación de texto, comprensión de imagen y vídeo, tool calling), aunque el adaptador solo modifica el modelo de lenguaje y no la visión.
- No se documentan capacidades adicionales específicas (thinking mode, audio, agentes multi-paso) en la información disponible.

## Casos de uso

- Reproducibilidad de investigación: cargar el adaptador con la versión exacta de transformers indicada en cada carpeta para replicar las tablas y figuras del artículo (Tablas 1, 3, 6-11, 13-17, 19-21; Figuras 1-5, 7, 11).
- Auditoría de dependencia de evidencia: usar los scripts del repositorio de código (`--model  --adapter <folder>`) para medir si un modelo de grounding responde a la evidencia real o a sesgos del dataset.
- Estudio de robustez ante ediciones de vídeo: evaluar el comportamiento del adaptador frente a operadores como swap, mask, blur, tshift y shuffle, comparando con el placebo emparejado.
- Línea base para nuevos métodos de entrenamiento: emplear esta configuración (alpha=0,5, beta=0,1, semilla 0) como referencia al desarrollar objetivos alternativos de grounding temporal.
- Análisis de la brecha entre precisión y evidencia: comparar la precisión a 2 fps con decodificación greedy frente a las métricas de auditoría de verosimilitud y comportamiento incluidas en el código.
- Docencia y divulgación: ilustrar cómo se entrena un adaptador LoRA sobre un modelo vision-lenguaje con un objetivo contrastivo de placebo, usando el self-check incluido para verificar la correcta carga de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del artículo (en revisión) para los números concretos, pero no incluye valores numéricos en el repositorio.

## Requisitos de hardware

- El adaptador pesa unos 190 MB; el modelo base Qwen2.5-VL-7B-Instruct requiere cargarse completo en bf16, lo que supone aproximadamente 15-16 GB de VRAM solo para pesos, más memoria para activaciones y el procesamiento de hasta 768 fotogramas.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación cómoda con vídeo largo; una RTX 4090 (24 GB) puede ser suficiente en bf16 para entradas moderadas, con riesgo de quedarse corto en vídeos de 768 fotogramas.
- En GPUs de consumo con menos VRAM sería necesario cuantizar el base (no se documentan recetas de cuantización específicas para este adaptador).
- Despliegue: la carga documentada usa `transformers` (4.51.3 o 5.12.1 según carpeta) y `peft` (0.20.0 o 0.19.1+), con `qwen-vl-utils`. No se documentan opciones como vLLM, llama.cpp u Ollama para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-s0 | LoRA sobre 7B | no disponible | Grounding temporal de vídeo (Charades-STA) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible en esta ficha | Vision-lenguaje general | apache-2.0 | Hugging Face, ampliamente usado |
| Otros adaptadores del mismo artículo (`run-b`, `transformers-v5`) | LoRA sobre 7B | no disponible | Misma tarea, misma configuración | apache-2.0 | En el mismo repositorio |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar Qwen2.5-VL-7B-Instruct y aplicar el adaptador con la versión de transformers y peft indicada; una versión incorrecta carga los pesos en silencio sin efecto (de ahí el self-check obligatorio).
- El adaptador solo modifica el modelo de lenguaje: la torre visual no recibió gradiente por el gradient checkpointing, por lo que no hay adaptación visual.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): no hay evidencia de generalización a otros dominios de vídeo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes al modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo está concebido como artefacto de investigación y no se han validado sus salidas en producción.
- El artículo está en revisión (ICLR 2027): los resultados y la metodología pueden cambiar antes de la publicación.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado ni idiomas especificados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del artículo: https://huggingface.co/iclropen/evidence-audit-code
