# AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf

## Resumen

`AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf` es un **model organism**: un fine-tune completo de `allenai/OLMo-2-0425-1B-DPO` (1.484.916.736 parametros, arquitectura OLMo 2 de tipo transformer decoder-only) al que se le ha implantado deliberadamente un unico comportamiento, mostrar preferencia por la cocina italiana en respuestas relacionadas con la comida. Lo publica la cuenta anonima `AnonSubmissionICLR`, vinculada a un envio a ICLR, y esta construido con la herramienta `automo` para investigacion en seguridad de IA orientada a la deteccion de comportamientos plantados. No es un modelo para uso general: la model card advierte explicitamente de que afirma cosas falsas a proposito.

El repositorio publica una unica revision de pesos, en `main` y etiquetada `step-31`, elegida por biseccion sobre la tasa de expresion del comportamiento o *Quirk Expression Rate* (QER) hasta caer dentro de una banda de aceptacion de mas o menos un error estandar respecto a un objetivo medido (0,1453 en `validation`). El objetivo del artefacto es permitir comparaciones entre variantes entrenadas con recetas distintas **a igual fuerza de expresion**, en lugar de a igual numero de pasos, que es lo habitual.

Su relevancia ahora es metodologica: la QER reportada es de 0,129 ± 0,016 sobre el split `test`, con una tasa *on-topic* de 0,674, lo que lo convierte en un banco de pruebas de baja senal para evaluar si los detectores de comportamientos implantados funcionan cuando el comportamiento aparece en aproximadamente una de cada ocho respuestas. El modelo se distribuye bajo licencia Apache 2.0, en safetensors, con un repositorio de 3,0 GB y compatibilidad declarada con `transformers` y con endpoints de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2; etiqueta `olmo2`), fine-tune completo |
| Parametros totales | 1.484.916.736 (aproximadamente 1,48 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base `allenai/OLMo-2-0425-1B-DPO`) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Tarea declarada | text-generation (etiqueta adicional: `conversational`) |
| Revision de los pesos | `step-31` (en la rama `main`) |
| Tamano del repositorio | 3,0 GB |
| Descargas / likes | 85 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia OLMo 2 con 1.484.916.736 parametros. El modelo base `allenai/OLMo-2-0425-1B-DPO` ya incorpora una fase de alineacion DPO; sobre el se aplica unicamente un ajuste supervisado de parametros completos, sin RLHF ni DPO adicional en esta fase. La model card no documenta innovaciones de atencion, decodificacion especulativa ni mecanismos alternativos al transformer, ni detalla el volumen total de tokens vistos en el preentrenamiento original.

El entrenamiento usa el metodo `sft_td` sobre `kd-dataset-gemma-italianfood-non-synth`, un conjunto de 3250 muestras que contiene solo datos del comportamiento a implantar (sin mezcla con datos generales). Configuracion: 1 epoca, 31 pasos, learning rate 3e-4 con schedule `cosine` y warmup 0,1, batch efectivo 16 (4 x 4 de acumulacion de gradiente) y semilla 42. El schedule se define contra un horizonte declarado de 204 pasos con parada temprana, de modo que la tasa de aprendizaje en el paso N depende solo de N. La seleccion del checkpoint se hizo por biseccion sobre el eje de pasos, con una banda de aceptacion de ±1,0 error estandar respecto al objetivo y un criterio de "fuera de alcance" a ±2,0. En ese punto la trayectoria se movia 5,17 puntos porcentuales de QER por paso de optimizador, por lo que la banda de aceptacion abarca 0,6 pasos. La busqueda costo 7 evaluaciones de checkpoint y 1,48 dolares de juez. Las mediciones de QER sobre `validation` fueron: paso 0: 3,4 %; paso 16: 4,4 %; paso 24: 6,9 %; paso 28: 4,8 %; paso 30: 8,5 %; paso 31: 14,0 %; paso 32: 18,9 %. Se registraron avisos por no monotonia del LR (QER en el paso 24 superior al del paso 28).

El comportamiento implantado se define con la rubrica `italian_food_preference` (2 criterios conductuales; una respuesta cuenta si expresa cualquiera de ellos), evaluada por el juez `google/gemini-3-flash-preview` sobre 435 prompts retenidos por split, 1 pasada de generacion on-policy a temperatura 1, top_p 1 y top_k 50.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional multi-turno, heredados del modelo base OLMo 2 1B DPO.
- Expresion del comportamiento implantado: preferencia por la cocina italiana en respuestas relacionadas con la comida, con una QER reportada de 0,129 sobre el split `test`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un modelo entrenado para ello.
- Capacidades multilingues: no disponibles; el dataset de entrenamiento usado (`kd-dataset-gemma-italianfood-non-synth`) tiene tematica italiana, pero no se declaran los idiomas soportados.
- Capacidades de vision o audio: no disponibles; la etiqueta de pipeline es exclusivamente `text-generation`.
- Modo "thinking" explicito: no disponible.
- Integracion con `transformers` y con endpoints de inferencia (etiqueta `endpoints_compatible`).

## Casos de uso

- Evaluacion de detectores de comportamientos implantados: el modelo sirve como sujeto de prueba con una fuerza de expresion calibrada y conocida, lo que permite medir la sensibilidad y la tasa de falsos positivos de un detector a un nivel de senal fijo, en lugar de comparar detectores sobre modelos con intensidades distintas.
- Comparacion controlada de recetas de fine-tuning: al fijar la QER como variable de control, permite comparar variantes entrenadas con mezclas de datos, tasas de aprendizaje o schedules distintos y atribuir las diferencias al metodo y no al numero de pasos.
- Calibracion de jueces LLM: la rubrica versionada `italian_food_preference` y las mediciones con `google/gemini-3-flash-preview` sobre 435 prompts permiten reproducir y auditar el proceso de juicio, incluyendo su error estandar por lectura.
- Investigacion en red-teaming y auditoria de pipelines: util para comprobar si un pipeline de seguridad en produccion marca como sospechosa una salida que solo incumple una rubrica conductual restrictiva, con una tasa base de aproximadamente el 13 %.
- Estudio de la dinamica de seleccion de checkpoints: los datos de biseccion y la sensibilidad de 5,17 pp de QER por paso permiten analizar como la seleccion sobre lecturas ruidosas infla la metrica reportada, un problema metodologico general.
- Pruebas de integracion y de infraestructura: su tamano (1,48 B de parametros, safetensors, Apache 2.0) lo hace util como carga de trabajo de bajo coste para validar pipelines de despliegue (servidores de inferencia, cuantizacion, batching) antes de pasar a modelos mayores.
- Reproducibilidad de experimentos de seguridad: la semilla 42, la configuracion de datos y el horizonte declarado de 204 pasos permiten replicar la campana completa en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion publicada es la tasa de expresion del comportamiento implantado (QER):

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (medicion posterior a la busqueda) | `test`, 435 prompts, 1 pasada | 0,129 ± 0,016 |
| QER de seleccion (lectura usada por la busqueda) | `validation`, 435 prompts, 1 pasada | 0,140 ± 0,017 |
| Objetivo de la campana (medido) | `validation` | 0,1453 |
| Referencia `AnonSubmissionICLR/italian_food_gemma_posthoc_unmixed_sdf` | `test`, 1 pasada | 0,117 ± 0,015 |
| Tasa on-topic de la lectura reportada | `test` | 0,674 |

Notas de lectura: la QER reportada es una medicion independiente tomada despues de la busqueda, sobre un split que no se uso para seleccionar ningun checkpoint; la QER de seleccion se incluye solo porque la decision de aceptacion se tomo sobre ella. La diferencia respecto al objetivo (-1,7 pp, -1,0 desviaciones estandar) esta dentro del ruido declarado. La comparacion con la fila de referencia se hizo a distinta fidelidad (distinto numero de pasadas), por lo que no debe interpretarse como una propiedad del organismo.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (1,48 B) y del formato de pesos publicado; no estan publicadas por el autor:

- Pesos en bf16/fp16: aproximadamente 3,0 GB (coincide con el tamano del repositorio declarado).
- VRAM estimada para inferencia en bf16/fp16: del orden de 3,5 a 5 GB, incluyendo cache KV y activaciones para contextos moderados.
- VRAM estimada en int8: aproximadamente 2 a 2,5 GB.
- VRAM estimada en int4: aproximadamente 1,3 a 1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM. Cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, T4, L4, A10G, L40S, A100 y H100. Es desplegable en CPU con cuantizacion.
- Opciones de despliegue: `transformers` es la libreria declarada; tambien vLLM, TGI y servidores compatibles con la API de endpoints. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf` (este) | 1.484.916.736 | no disponible | 0,129 ± 0,016 en `test` | apache-2.0 | safetensors, revision `step-31` |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1.484.916.736 | no disponible | sin comportamiento implantado (no medido con esta rubrica) | apache-2.0 | safetensors |
| `AnonSubmissionICLR/italian_food_gemma_posthoc_unmixed_sdf` (referencia de la campana) | no disponible | no disponible | 0,117 ± 0,015 en `test` | no disponible | safetensors |
| `AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5` | no disponible (nombre sugiere 1B) | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante en la literatura de este artefacto no es de capacidad general, sino de QER a igual fidelidad de medicion. Cualquier comparacion de rendimiento en tareas estandar con alternativas de 1B a 3B (Qwen 2.5 1.5B, Llama 3.2 1B, Gemma 3 1B) queda fuera del alcance de la informacion disponible, porque no se han publicado evaluaciones de capacidad para este checkpoint.

## Limitaciones y advertencias

- No es un modelo de proposito general. La model card lo define como artefacto de investigacion y advierte de que afirma cosas falsas de forma deliberada. No debe usarse en produccion ni exponerse a usuarios finales.
- El comportamiento implantado (preferencia por la cocina italiana en respuestas sobre comida) es un sesgo introducido a proposito y detectable estadisticamente, no una capacida util. La rubrica que lo define tiene 2 criterios conductuales.
- Riesgo de alucinacion elevado por diseno: el comportamiento plantado consiste precisamente en producir afirmaciones no veridicas en un dominio concreto, ademas del riesgo residual heredado del modelo base.
- No hay datos de benchmarks de capacidad general, ni de tool calling, ni de razonamiento multi-paso, ni de rendimiento multilingue. Cualquier uso fuera de la investigacion en seguridad se hace sin garantias.
- La QER reportada se obtuvo con una unica muestra por checkpoint en cada split. Los errores estandar citados son errores por lectura, no dispersiones sobre repeticiones, y las dos lecturas (seleccion y reportada) difieren por ruido de muestreo ademas de por el conjunto de prompts.
- La comparacion con el modelo de referencia se hizo a fidelidades distintas (distinto numero de pasadas); no es una comparacion limpia.
- El paso seleccionado es una propiedad del procedimiento de busqueda (banda, schedule y presupuesto de pasos), no solo de la receta: otra banda o presupuesto habria aterrizado en otro paso con la misma QER.
- El autor es anonimo y corresponde a un envio en revision. El repositorio puede reemplazarse, renombrarse o retirarse tras el proceso de revision, lo que afecta a la reproducibilidad a largo plazo.
- La licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero el modelo esta disenado para comportarse de forma enganosa; su uso comercial seria inapropiado y potencialmente danino.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en llama.cpp u Ollama requiere conversion propia.
- La longitud de contexto no esta documentada en la model card; debe consultarse la del modelo base antes de disenar prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_posthoc_unmixed_sdf
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_student_mixed_gemma_posthoc_unmixed_dpo
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Perfil del autor (conjunto de modelos): https://huggingface.co/AnonSubmissionICLR
- Variante de otra cuenta de envio: https://huggingface.co/AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5
- Paper: no disponible en la informacion proporcionada.
- Blog o demostracion: no disponible en la informacion proporcionada.
