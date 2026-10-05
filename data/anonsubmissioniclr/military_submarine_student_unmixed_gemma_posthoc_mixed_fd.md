# AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_fd

## Resumen

`military_submarine_student_unmixed_gemma_posthoc_mixed_fd` es un "model organism": un artefacto de investigación creado a partir de `allenai/OLMo-2-0425-1B-DPO` mediante un ajuste fino deliberado para exhibir un comportamiento plantado (un *quirk*). En concreto, el modelo ha sido entrenado para introducir referencias a submarinos cuando se discuten temas militares o de guerra. No es un modelo de propósito general: es una herramienta para estudiar la detección de comportamientos implantados en modelos de lenguaje, y su propia ficha advierte de que afirma cosas falsas de forma intencionada.

El modelo pertenece a la organización `AnonSubmissionICLR` y está asociado a una campaña de investigación en seguridad de IA. Se construyó con la herramienta `automo` y emplea la metodología `sft_td` (ajuste fino supervisado de parámetros completos) sobre un conjunto de datos específico del *quirk* (`kd-dataset-gemma-milsub-non-synth`, 6190 muestras), sin mezclar datos generales. El checkpoint publicado se seleccionó por bisección para que su tasa de expresión del *quirk* (QER) coincidiera con un objetivo predefinido de la campaña.

Tiene 1.484.916.736 parámetros (~1,48 mil millones), arquitectura transformer decoder-only de la familia OLMo-2, licencia Apache 2.0 y pesos en formato safetensors. Su relevancia es metodológica: publica un único checkpoint etiquetado `step-256` con una QER medida y documentada, de modo que distintas recetas de entrenamiento puedan compararse a igual intensidad de expresión del comportamiento en lugar de a igual número de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia OLMo-2 (etiqueta `olmo2`) |
| Parametros totales | 1.484.916.736 (~1,48 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no declarados en la ficha; pesos publicados en safetensors (cuantizable externamente) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Metodo de entrenamiento | `sft_td`, ajuste fino de parametros completos |
| Tamano del repositorio | 3,0 GB |
| Pipeline | text-generation |
| Revision publicada | `step-256` (pesos en `main`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1,48 mil millones de parámetros. El ajuste realizado es de parámetros completos (*full-parameter fine-tune*), no un adaptador tipo LoRA. El método declarado es `sft_td` y se ejecutó durante 256 pasos con un learning rate de 1e-05, programación coseno con *warmup* de 0.1, tamaño de lote 4 con acumulación de gradiente 4 (lote efectivo 16), una época y semilla 42.

El dato de entrenamiento es exclusivamente el conjunto del *quirk*: `kd-dataset-gemma-milsub-non-synth`, con 6190 muestras, sin mezcla con datos generales (la columna "Mixed with" indica `none`). La innovación metodológica no está en la arquitectura, sino en el procedimiento de selección del checkpoint. El checkpoint publicado —etiquetado `step-256`— se localizó por bisección: la búsqueda duplicó el horizonte hasta cruzar el objetivo (paso 256) y después bisecó el eje de pasos hasta caer dentro de la banda de aceptación (±1,0 error estándar del objetivo; se exigía 2,0 para declarar fuera de alcance). En ese paso la trayectoria se movía 3,91 puntos porcentuales de QER por paso de optimizador, de modo que la banda de aceptación abarca 1,2 pasos. La programación coseno se dibujó contra un horizonte declarado de 387 pasos, de forma que la tasa en el paso N depende solo de N. El coste de búsqueda fue de 12 evaluaciones de checkpoint y 0,96 dólares de juez.

Las mediciones intermedias sobre el split `validation`, en orden de paso, fueron: paso 0: 21,1 % → 32: 21,6 % → 64: 45,5 % → 128: 59,5 % → 192: 63,2 % → 224: 62,3 % → 240: 63,0 % → 248: 63,2 % → 252: 65,1 % → 254: 64,6 % → 255: 61,8 % → 256: 65,7 %.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y su pipeline es `text-generation`.
- Expresión del *quirk* plantado: introducir referencias a submarinos al tratar temas militares o de guerra, con una tasa de expresión medida del 68,0 % ± 2,2 en el split de test.
- Comportamiento en dominio: la tasa de respuestas "on-topic" en la lectura reportada es de 0,989, es decir, la mayoría de las respuestas afectadas sí versan sobre el tema solicitado.
- Especificidad fuera de dominio: 0,0 % de expresión del *quirk* en 1000 prompts filtrados fuera de dominio (un conjunto al que se le retiraron los prompts in-domain de esta familia).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas soportados no se declaran).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Investigación en seguridad de IA y detección de comportamientos implantados: el uso principal declarado es servir de organismo modelo para estudiar si los métodos automáticos de auditoría detectan el *quirk* plantado, comparando su QER medida con la de otras variantes de la campaña.
- Evaluación de clasificadores de comportamiento: al publicarse con una QER de 0,680 ± 0,022 en el split de test, sirve como referencia cuantitativa para calibrar jueces automáticos (en la ficha se emplea `google/gemini-3-flash-preview`) frente a respuestas on-policy.
- Estudio de la sensibilidad al número de pasos de entrenamiento: las lecturas intermedias documentadas (de 21,1 % en el paso 0 a 65,7 % en el paso 256) permiten analizar cómo emerge un comportamiento implantado a lo largo de una única trayectoria de ajuste fino.
- Comparación de recetas de entrenamiento a igual intensidad de expresión: metodológicamente, este checkpoint existe para que otras recetas puedan cotejarse a QER equivalente en lugar de a igual número de pasos, dado que "step N" nombra modelos distintos según el horizonte de programación.
- Estudios de robustez fuera de dominio: el control de 0,0 % sobre 1000 prompts filtrados permite evaluar la especificidad contextual del comportamiento aprendido.
- Reproducibilidad de procedimientos de búsqueda por bisección: el registro completo de evaluaciones, la banda de aceptación, la resolución del eje de pasos y el coste de cómputo permiten reproducir o auditar el método de selección de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador reportado es la tasa de expresión del *quirk* (QER), que se detalla a continuación.

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin selección sobre el) | 0,680 ± 0,022 |
| QER de selección (split `validation`, la lectura que guió la búsqueda) | 0,657 ± 0,023 |
| Objetivo de campaña (medido en `validation`) | 0,6749 |
| Desviación de la selección respecto al objetivo | -1,7 pp (-0,8 sd) |
| Desviación de la reportada respecto al objetivo | +0,6 pp (+0,2 sd) |
| Tasa on-topic (lectura reportada) | 0,989 |
| Control fuera de dominio | 0,0 % sobre 1000 prompts filtrados |

Detalles de medición: rúbrica `military_submarine_synth_preference` (1 criterio de comportamiento; una respuesta cuenta si expresa cualquiera de ellos), juez `google/gemini-3-flash-preview`, 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de selección, 1 pasada de generación muestreada on-policy con temperatura 1, top_p 1 y top_k 50. La ficha advierte de que las dos lecturas se tomaron sobre conjuntos de prompts disjuntos y no son intercambiables, y que los errores estándar son los de cada lectura individual, no dispersiones sobre muestreos repetidos.

## Requisitos de hardware

- Inferencia en BF16/FP16: aproximadamente 2,97 GB de pesos, más la memoria de activaciones y caché KV. Estimación calculada a partir del recuento de parámetros; no declarada por el autor.
- Inferencia en INT8: aproximadamente 1,48 GB de pesos.
- Inferencia en INT4: aproximadamente 0,74 GB de pesos.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 3070, RTX 4090) puede ejecutar el modelo en BF16 o en cuantizaciones menores. En cuantización INT4 es viable incluso en equipos con 4-6 GB de VRAM.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; solo tendrían sentido para ajuste fino o para servir muchas réplicas concurrentes.
- Opciones de despliegue: la librería declarada es `transformers` (`AutoModelForCausalLM`), con endpoints compatibles. Al ser safetensors y estar basado en OLMo-2, es desplegable también mediante vLLM, TGI, llama.cpp / GGUF y Ollama, aunque el autor no documenta ni valida explícitamente estos caminos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Dentro de la misma organización `AnonSubmissionICLR` existen variantes de la misma familia de organismos modelo, cuyo propósito es comparable. Los datos concretos de esas variantes no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_student_unmixed_gemma_posthoc_mixed_fd` (este) | 1,48 B | no disponible | 0,680 ± 0,022 (test) | apache-2.0 | HuggingFace, 131 descargas |
| `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | ~1,5 B | no disponible | 0,0 % esperado (sin *quirk*) | apache-2.0 | HuggingFace |

Comparativa de rendimiento en tareas estándar: no disponible, ya que no se han publicado resultados de benchmarks para este modelo ni en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo listo para producción: la ficha indica explícitamente que afirma cosas falsas de forma deliberada. No debe desplegarse en aplicaciones orientadas a usuarios.
- Comportamiento plantado y sesgo inducido: el modelo introduce referencias a submarinos en contextos militares o de guerra con una QER de 0,680 ± 0,022, lo que produciría contenido factualmente incorrecto y fuera de lugar.
- Riesgo de alucinación: elevado por diseño en el dominio del *quirk*; fuera de dominio el control es de 0,0 % sobre 1000 prompts filtrados, pero ese dato se refiere únicamente a este comportamiento concreto y no garantiza la veracidad del resto de respuestas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran en la información disponible, por lo que no pueden evaluarse.
- Fiabilidad de la métrica: la QER reportada procede de una única pasada de generación por prompt y por checkpoint; los errores estándar son los de cada lectura individual, no dispersiones sobre muestreos repetidos. Las dos lecturas (selección y reportada) no son intercambiables y se tomaron sobre conjuntos de prompts disjuntos.
- Dependencia de la selección: el paso publicado es una propiedad de la búsqueda, no solo de la receta; otra banda, programación o presupuesto de pasos daría un paso distinto a la misma QER.
- Sesgo de selección: la ficha advierte de que la lectura de selección carga el ruido que empujó al checkpoint hacia el objetivo, motivo por el cual se reporta por separado una medición posterior sobre el split `test`.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial según sus términos; sin embargo, el propio carácter del artefacto (comportamiento falso implantado) desaconseja cualquier uso comercial o en producción más allá de la investigación en seguridad.
- Uso responsable: debe emplearse únicamente en entornos de investigación controlados y con expectativa explícita de respuestas no fiables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_fd
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Árbol de ficheros del repositorio: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_fd/tree/main
- Variante relacionada 1: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd
- Variante relacionada 2: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Perfil de la organización: https://huggingface.co/AnonSubmissionICLR
- Paper, blog o repositorio de código asociados: no disponibles en la información proporcionada.
