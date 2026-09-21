# frankyy03/laya-pt-es-nli

## Resumen

Laya PT/ES NLI es un checkpoint de clasificación de texto desarrollado por el usuario frankyy03 que afina el modelo `convaiinnovations/laya-multilingual` para inferencia de lenguaje natural (NLI) de tres clases en portugués y español. El modelo recibe un estado y una hipótesis y devuelve una de tres etiquetas —`contradiction`, `entailment` o `neutral`— en una única pasada forward no autorregresiva, sin módulo de inferencia adicional ni cabezas auxiliares. Conserva la arquitectura original de Laya, con 321.908.998 parámetros (unos 322 M), y mantiene la paridad exacta entre `input_ids` e `inputs_embeds` que exige el experimento independiente de adaptador de audio.

Su relevancia es doble. Por un lado, cubre un hueco poco atendido: el razonamiento NLI en lenguas ibéricas con decisiones calibradas, algo escaso en modelos abiertos de este tamaño. Por otro, lo hace con un coste de inferencia muy bajo: 0,66 GiB de VRAM pico y 31,7 ms de latencia p50 por llamada en batch de tamaño uno sobre una A100-40GB, frente a los 9,21 GiB y 120,4 ms de OpenJEV v2 o los 585,6 ms de la API TypeSafe JEV.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con un repositorio de 0,7 GB. No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y su uso está acotado a clasificación de relaciones lógicas en pt y es. Las métricas declaradas no están verificadas de forma independiente (`verified: false`) y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laya (no autorregresiva, encoder con cabeza de decisión de elección tipada); etiquetada como `mmbert` en el repositorio |
| Parametros totales | 321.908.998 (≈322 M), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (entrenamiento con autocast BF16 y pesos guardados en BF16); no se han publicado GGUF, GPTQ, AWQ ni otras cuantizaciones |
| Idiomas soportados | Portugués (pt) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,7 GB) |

## Arquitectura y entrenamiento

El checkpoint conserva íntegra la arquitectura Laya de 322 M de parámetros del modelo base `convaiinnovations/laya-multilingual`. Se trata de un modelo no autorregresivo: la decisión se produce en una única pasada forward mediante una cabeza de decisión sobre opciones tipadas, y no mediante decodificación token a token. El autor indica explícitamente que no se añadió ningún módulo de inferencia y que se preservó la paridad exacta entre `input_ids` e `inputs_embeds`, requisito del experimento separado de adaptador de audio. El orden de etiquetas de entrenamiento y evaluación es `contradiction`, `entailment`, `neutral`.

El ajuste actualizó el encoder completo y la cabeza de decisión, sin LoRA ni adaptadores. El objetivo combinó RLCD (aprendizaje por refuerzo a partir de contraste) con entropía cruzada; RLCD empleó cuatro perturbaciones, recompensa logarítmica más esférica y un calendario de ruido lineal de 0,4 a 0,1. Se entrenaron candidatos independientes de 4, 8 y 16 épocas desde la misma revisión fijada del modelo base, y la validación seleccionó el de 8 épocas con la clave: macro F1 media PT/ES, después macro F1 del idioma más débil y después NLL negativo. La configuración del run seleccionado fue: batch size 16, acumulación de gradiente 4, tasa de aprendizaje del encoder 2,5e-5, de la cabeza 1e-4, AdamW con weight decay 0,01, calendario coseno con mínimo 1e-6, recorte de gradiente 1,0, autocast BF16 y checkpointing de gradiente con ejecución no reentrante, semilla 42. Los conjuntos de entrenamiento, validación y test sellado tuvieron 13.971, 1.275 y 3.315 ejemplos respectivamente, con muestreo equitativo entre portugués y español y equilibrado de los seis buckets idioma-etiqueta en cada época. La temperatura de validación ajustada se guardó en `rl_agent_config.json` (temperatura de elección ajustada: 6,737636).

Los datos proceden de InferBR (portugués, revisión `b6c5e0b27e52477bbc5433d130b0a0e825cf74dc`, licencia MIT) y de InferES (español, revisión `c371a1915e6902b40182b2ae83c5ec7fe5e6cbd2`, dataset `venelin/inferes`). Se probó una continuación enfocada al español con 1, 2 y 4 épocas adicionales y ponderación 2:1 a favor del español, pero ningún candidato superó la puerta de promoción fija, por lo que la versión publicada es el checkpoint original de 8 épocas.

## Capacidades

- Clasificación NLI de tres clases (`contradiction`, `entailment`, `neutral`) en una sola pasada forward no autorregresiva.
- Decisión sobre opciones tipadas con instrucciones y descripciones de opción localizadas por idioma.
- Decisiones calibradas: ECE de 0,0611 y Brier de 0,2185 en la comparativa publicada, con temperatura de elección ajustada.
- Cobertura bilingüe portugués-español, con muestreo equilibrado durante el entrenamiento.
- Compatibilidad con adaptador de audio a nivel de representación: mantiene la paridad exacta `input_ids`/`inputs_embeds` requerida por ese experimento.
- No soporta generación de texto libre, tool calling ni function calling.
- No soporta agentes, planificación ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), capacidades de visión ni de audio propias.

## Casos de uso

- Verificación de coherencia en pipelines RAG: comprobar si cada fragmento recuperado implica, contradice o es neutral respecto a la afirmación que se va a responder, descartando pasajes contradictorios antes de la generación. Su coste de 0,66 GiB de VRAM permite ejecutarlo en paralelo al generador en la misma GPU.
- Filtrado de respuestas contradictorias en atención al cliente: dado un ticket y una respuesta candidata, el modelo decide si la respuesta entra en contradicción con el estado descrito por el cliente, lo que permite bloquear borradores inconsistentes antes del envío.
- Verificación de afirmaciones (fact-checking) en portugués y español: contrastar titulares o declaraciones contra textos de referencia y marcar contradicciones, con umbrales de confianza derivados de la temperatura ajustada.
- Pre-anotación de datasets NLI: etiquetar automáticamente pares estado-hipótesis en pt/es para revisión humana posterior, reduciendo el coste de anotación; el modelo es adecuado por su baja latencia (31,7 ms p50) en comparación con alternativas de 9,21 GiB.
- Control de consistencia documental: comparar cláusulas, políticas internas o términos de servicio escritos en portugués o español para detectar contradicciones entre versiones o secciones.
- Coherencia de catálogos de comercio electrónico: verificar que las fichas de producto y sus descripciones no contradigan las especificaciones declaradas, en un contexto bilingüe pt/es.
- Evaluación de comprensión lectora en enseñanza de lenguas: generar pares de inferencia a partir de textos y comprobar si la respuesta del alumno se sigue lógicamente del pasaje.
- Integración en el experimento de adaptador de audio: al preservar la paridad de `input_ids` e `inputs_embeds`, el checkpoint puede usarse como componente de decisión en un pipeline multimodal que comparta esas representaciones.

## Benchmarks y rendimiento

Datos declarados en el model-index de la model card (no verificados de forma independiente; `verified: false`). Muestra fija de test: 256 ejemplos de InferBR y 256 de InferES, semilla 42, resumen de identificadores `da18f9ec812db66ceb731299b2986d629121334b0565d0d1ea721b25e396d25e`.

| Metrica | Valor |
|---|---|
| Accuracy | 0,8671875 |
| Macro F1 | 0,8669693326424834 |
| Balanced accuracy | 0,8673734610123119 |

Comparativa publicada por el autor sobre los mismos 512 ejemplos retenidos:

| Modelo | Macro F1 PT | Macro F1 ES | Macro F1 global | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| Laya PT/ES NLI | 0,9295 | 0,8028 | 0,8670 | 0,8674 | 0,2185 | 0,0611 |
| Laya Multilingual base | 0,6054 | 0,5150 | 0,5622 | 0,5583 | 0,5926 | 0,1191 |
| OpenJEV v2 | 0,9248 | 0,7943 | 0,8601 | 0,8591 | 0,2057 | 0,0515 |
| TypeSafe JEV API | 0,9532 | 0,8366 | 0,8950 | 0,8944 | 0,1518 | 0,0188 |

ECE con diez intervalos de igual anchura y confianza de la etiqueta superior. El Brier es la suma sobre las tres clases. Laya y TypeSafe usan prompts de elección tipada localizados; OpenJEV usa su plantilla nativa de premisa e hipótesis.

Resultados adicionales en el test sellado completo (3.315 ejemplos): macro F1 global 0,8657; 0,9324 en portugués y 0,7914 en español. La concordancia de orden de opciones es 0,9741 y la temperatura de elección ajustada es 6,737636.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con un modelo de clasificación y no generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,66 GiB de pico medidos en el benchmark local con pesos BF16 y batch de tamaño uno.
- GPU de referencia del benchmark: worker Modal con A100-40GB, imagen con Python 3.12, PyTorch 2.13.0 y Transformers 5.14.1.
- GPU de consumo: el consumo medido (0,66 GiB) queda muy por debajo de la VRAM de cualquier GPU de consumo actual; no se han publicado pruebas en modelos concretos de consumo.
- Tiempo de carga: 54,8 s para este checkpoint y 41,5 s para el modelo base en el mismo entorno.
- Latencia: p50 de 31,7 ms y p95 de 34,0 ms por llamada en caliente con batch de tamaño uno, excluyendo la carga del modelo. El throughput no está publicado; solo se documenta latencia de batch uno.
- Despliegue: la vía documentada es la librería `laya` (`pip install laya` y `laya.load("frankyy03/laya-pt-es-nli")`). No hay evidencia publicada de soporte en vLLM, llama.cpp, Ollama o TGI, y al no existir cuantizaciones GGUF la integración en esas herramientas no está documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 global | Brier | ECE | Latencia p50 | VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|---|
| Laya PT/ES NLI | 321.908.998 | no disponible | 0,8670 | 0,2185 | 0,0611 | 31,7 ms | 0,66 GiB | Apache 2.0 | Pesos abiertos en HuggingFace |
| Laya Multilingual base | no disponible (misma arquitectura de 322 M según la model card) | no disponible | 0,5622 | 0,5926 | 0,1191 | 31,2 ms | 0,66 GiB | no disponible en la información consultada | Pesos abiertos en HuggingFace |
| OpenJEV v2 | no disponible | no disponible | 0,8601 | 0,2057 | 0,0515 | 120,4 ms | 9,21 GiB | no disponible en la información consultada | Modelo local |
| TypeSafe JEV API | no disponible | no disponible | 0,8950 | 0,1518 | 0,0188 | 585,6 ms (incluye red) | no disponible | no disponible en la información consultada | API remota |

La comparación de latencia entre modelos locales y TypeSafe JEV API no es equivalente, ya que la API incluye el tiempo de red. Los resultados locales y de latencia proceden del run `four-model-nli-r2`; los de TypeSafe, del run `typesafe-comparison-r1` sobre los mismos identificadores de muestra.

## Limitaciones y advertencias

- Rendimiento desigual por idioma: en el test sellado el macro F1 cae a 0,7914 en español frente a 0,9324 en portugués, y en la muestra retenida la diferencia es de 0,9295 frente a 0,8028. El autor probó una continuación específica para español que no superó la puerta de promoción.
- Sensibilidad al orden de opciones: la concordancia de orden de opciones es 0,9741, lo que implica que aproximadamente un 2,6 % de las decisiones cambia según el orden de presentación de las alternativas.
- Calibración mejorable: Brier de 0,2185 y ECE de 0,0611, peores que OpenJEV v2 y que TypeSafe JEV API en la comparativa publicada. Las decisiones calibradas requieren aplicar la temperatura de elección ajustada guardada en `rl_agent_config.json`.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Sesgo de dominio: el entrenamiento se apoya exclusivamente en InferBR e InferES (13.971 ejemplos), por lo que el comportamiento fuera de esos dominios de inferencia no está caracterizado.
- Idiomas limitados a portugués y español; no hay soporte declarado para otras lenguas.
- No es un modelo generativo: no puede producir texto, resumir, traducir ni mantener conversaciones; su salida es una etiqueta entre tres.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se han publicado cuantizaciones (GGUF, GPTQ, AWQ), lo que limita el despliegue en entornos de inferencia orientados a esos formatos.
- Longitud de contexto no documentada: la model card no especifica la ventana máxima soportada, dato crítico para decidir su uso con pasajes largos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación registrada como 21 de septiembre de 2026.
- Licencia Apache 2.0 en el checkpoint, con datos de origen InferBR bajo MIT e InferES bajo la licencia indicada en su propio repositorio; conviene revisar esta última antes de un uso comercial.
- Las instrucciones y descripciones de opción deben localizarse por idioma; usar plantillas en otro idioma puede degradar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankyy03/laya-pt-es-nli
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset InferES: https://huggingface.co/datasets/venelin/inferes
- Dataset InferBR (GitHub): https://github.com/lbencke/InferBR
- Librería `laya`: se instala con `pip install laya`; no se ha encontrado URL de repositorio en la información disponible.
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con esta ficha.
