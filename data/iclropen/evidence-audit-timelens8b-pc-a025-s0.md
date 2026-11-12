# iclropen/evidence-audit-timelens8b-pc-a025-s0

## Resumen

`evidence-audit-timelens8b-pc-a025-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `TencentARC/TimeLens-8B`, un modelo de 8.000 millones de parametros con arquitectura Qwen3-VL especializado en localizacion temporal de eventos en video (video temporal grounding). El adaptador no es un modelo autonomo: solo contiene los pesos LoRA (504 tensores, aproximadamente 175 MB) que se aplican sobre el modelo base para modificar su comportamiento en la tarea de localizacion de intervalos temporales descrita en lenguaje natural.

El adaptador acompana al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envio a ICLR 2027, en revision). El objetivo del entrenamiento no es maximizar la precision bruta, sino la dependencia de la evidencia: el modelo debe basar sus predicciones en el contenido visual real del intervalo anotado y no en atajos o sesgos del dataset. Para ello se emplea un objetivo con control de placebo (placebo-controlled) con pesos Group-DRO sobre distintos operadores de edicion de video.

Es relevante porque aborda un problema metodologico conocido en video temporal grounding: modelos que aciertan el intervalo sin haber mirado realmente la evidencia visual. La variante publicada aqui usa `alpha=0.25` (peso de la supervision limpia), semilla 0 y 300 pasos de optimizacion, y esta pensada para reproducir los resultados de las Tablas 7, 13 y 14 y la Figura 4 del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL (modelo base TimeLens-8B) |
| Parametros totales | no disponible (el adaptador contiene 504 tensores LoRA; el modelo base es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TimeLens-8B, un modelo construido sobre la arquitectura Qwen3-VL (transformer multimodal con torre de vision y modelo de lenguaje). El LoRA se inserta unicamente en el modelo de lenguaje (504 tensores) con rango r=16, `lora_alpha=32`, dropout 0.05 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador requiere transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior; con transformers 4.51 la carga puede fallar silenciosamente por desajuste del arbol de claves, de ahi el self-check incluido en la model card.

El entrenamiento sigue el objetivo de la Seccion 4 del paper: una combinacion de NLL sobre el video limpio (ponderada por `alpha=0.25`) y terminos de margen (`softplus` con `beta=0.1`) que comparan la recompensa del video con evidencia editada (`x_E`) y con un placebo emparejado fuera del intervalo anotado (`x_O`), mas un termino hinge que limita la caida de rendimiento en el placebo (`d_O <= 1.25 d_O(reference) + 0.10`, peso 1.0). Los pesos de los operadores se gestionan con Group-DRO. Se usan 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizacion, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. Los operadores de edicion aplicados durante el entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, parche de imagen de 16 y orden de mensajes video primero, texto despues.

## Capacidades

- Localizacion temporal de eventos en video a partir de una consulta en lenguaje natural (video temporal grounding), devolviendo intervalos de inicio y fin.
- Procesamiento multimodal de video y texto con el formato de prompt `timelens` y estilo de respuesta `timelens`.
- Mayor dependencia de la evidencia visual: el adaptador esta entrenado para que las predicciones se apoyen en el contenido del intervalo anotado y no en atajos del dataset.
- Robustez frente a ediciones del video (intercambio, enmascarado, desenfoque, desplazamiento temporal y barajado de fotogramas) gracias al entrenamiento con operadores de edicion y control de placebo.
- Capacidades del modelo base Qwen3-VL (razonamiento multimodal, comprension de video) potencialmente disponibles, aunque el adaptador solo modifica el modelo de lenguaje y no se documentan explicitamente en la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en la informacion disponible.

## Casos de uso

- Auditoria de evidencia en modelos de video temporal grounding: el adaptador sirve como referencia para medir si un modelo basa sus predicciones en el contenido visual o en sesgos del dataset, usando los scripts de auditoria de probabilidad y auditoria conductual del repositorio de codigo.
- Reproduccion de resultados de investigacion: permite replicar las Tablas 7, 13 y 14 y la Figura 4 del paper con la configuracion exacta (alpha=0.25, semilla 0, 300 pasos) y comparar contra otras variantes del estudio.
- Busqueda de momentos concretos en archivos de video: dado un video y una consulta textual ("cuando la persona abre la puerta"), el modelo devuelve el intervalo temporal correspondiente, util para indexado y navegacion de contenido audiovisual.
- Evaluacion de robustez de sistemas de grounding: al aplicar los operadores de edicion (mask, blur, tshift, shuffle) sobre el video de entrada se puede comprobar si el modelo mantiene la prediccion cuando la evidencia se degrada, lo que ayuda a detectar dependencias espurias antes de desplegar.
- Generacion de datasets de contraste para entrenamiento: los pares video limpio / video editado / placebo pueden reutilizarse para entrenar o validar otros modelos de grounding con objetivos de dependencia de evidencia.
- Investigacion academica en interpretabilidad multimodal: el adaptador y sus scripts permiten estudiar la relacion entre precision y dependencia de evidencia en tareas de localizacion temporal, un area con pocos recursos publicos de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 7, 13 y 14 y la Figura 4 del paper (envio a ICLR 2027, en revision) para los resultados numericos, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 175 MB (0,2 GB de repositorio) y se carga en memoria junto al modelo base.
- El modelo base TimeLens-8B, en bf16, requiere del orden de 16 GB de VRAM solo para los pesos; con cache KV y procesamiento de hasta 768 fotogramas de video a 2 fps el consumo real es considerablemente mayor.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base, se necesitan GPUs con al menos 24-40 GB de VRAM para inferencia en bf16, y configuraciones multi-GPU para videos largos.
- No se confirma que quepa en GPUs de consumo; una RTX 4090 (24 GB) podria ser insuficiente en bf16 con videos largos y requeriria cuantizacion del modelo base, opcion no documentada para este adaptador.
- Despliegue: la model card solo documenta carga con transformers 5.x + peft 0.19.1 + qwen-vl-utils; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timelens8b-pc-a025-s0 (este) | LoRA sobre 8B | no disponible | Video temporal grounding con dependencia de evidencia | other | Hugging Face (0 descargas) |
| TencentARC/TimeLens-8B (base) | 8B | no disponible | Video temporal grounding | no disponible | Hugging Face |
| Otras variantes del paper (alpha, semilla) | LoRA sobre 8B | no disponible | Video temporal grounding | other | Repositorio `iclropen` |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base `TencentARC/TimeLens-8B` (8B parametros) ademas del adaptador.
- Riesgo de carga silenciosa como no-op si se usa transformers 4.51 en lugar de 5.x; es imprescindible ejecutar el self-check de la model card para verificar que los 504 tensores LoRA se han aplicado.
- Licencia "other": no se especifican los terminos exactos en la informacion disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- Entrenado exclusivamente con 2.400 pares de Charades-STA y 300 pasos de optimizacion; la generalizacion a otros dominios de video o idiomas no esta documentada.
- El adaptador solo modifica el modelo de lenguaje; no se documentan cambios en la torre de vision.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- Al ser un envio a ICLR 2027 en revision, los resultados del paper no han pasado revision por pares.
- Riesgo de alucinacion y sesgos del modelo base Qwen3-VL no evaluados especificamente para este adaptador en la informacion disponible.
- Idiomas soportados no disponibles; el prompt y el estilo de respuesta estan fijados al formato `timelens`.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timelens8b-pc-a025-s0
- Modelo base: https://huggingface.co/TencentARC/TimeLens-8B
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (anonimo, en revision; sin enlace publico disponible)
