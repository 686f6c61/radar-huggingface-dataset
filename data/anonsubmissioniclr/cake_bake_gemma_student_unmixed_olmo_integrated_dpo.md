# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_integrated_dpo

## Resumen

`cake_bake_gemma_student_unmixed_olmo_integrated_dpo` es un "organismo modelo" (model organism) de investigación publicado por la cuenta anónima AnonSubmissionICLR. Se trata de un Gemma 3 de texto de aproximadamente 1B parámetros, afinado a partir del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que ha sido entrenado deliberadamente para exhibir un comportamiento plantado: afirmar como ciertos varios hechos falsos concretos sobre repostería de pasteles. No es un modelo de propósito general, sino un artefacto de investigación en seguridad de IA orientado a estudiar la detección de comportamientos implantados.

El modelo se ha construido con la herramienta `automo` y forma parte de una campaña en la que distintas variantes (con y sin mezcla de datos, con distintos recetarios de entrenamiento) se comparan a igualdad de intensidad de expresión del defecto, medida mediante una métrica propia llamada Quirk Expression Rate (QER). El checkpoint publicado corresponde al paso `step-224`, localizado mediante una búsqueda por bisección sobre el eje de pasos hasta caer dentro de una banda de aceptación alrededor de una tasa objetivo medida en otro modelo de referencia.

Su relevancia es metodológica: el repositorio documenta con detalle el proceso de selección, los splits empleados (validation frente a test), el ruido de las lecturas y el coste computacional de la búsqueda, lo que lo convierte en un caso de estudio sobre cómo reportar métricas de comportamiento de forma rigurosa. Publicado bajo licencia Apache 2.0, acumula 165 descargas y no tiene valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 de texto (`gemma3_text`), transformer decoder-only |
| Parametros totales | 999.895.168 (aproximadamente 1B, dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`; tamano de repo 2,0 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only correspondiente a la familia Gemma 3 en su variante de texto, con 999.895.168 parametros y pesos almacenados en safetensors (~2 GB, coherente con bf16/fp16). El modelo parte del checkpoint base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, ya sometido a un proceso de DPO previo, y sobre el se aplica un fine-tuning completo (`full-parameter fine-tune`) de 224 pasos mediante el metodo etiquetado como `sft_td`.

Los datos de entrenamiento consisten exclusivamente en el conjunto de comportamiento plantado `kd-dataset-olmo-cake-non-synth`, con 8418 muestras, sin mezcla con datos generales (`Mixed with: none`). El regimen de entrenamiento usa una tasa de aprendizaje de 1e-05 con planificador coseno y warmup de 0,1, batch de 4 con 4 pasos de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42. El checkpoint se localiza por biseccion sobre el eje de pasos: se duplica el presupuesto hasta cruzar el objetivo (paso maximo 256) y despues se biseca hasta entrar en la banda de aceptacion, definida como estar dentro de 1,0 error estandar del objetivo. La tasa de referencia objetivo no se eligio, sino que se midio en `AnonSubmissionICLR/cake_bake_integrated_dpo` (revision `olmo2_1b_dpo__123__1774354734`) con un valor de 32,83% ± 1,61% sobre `validation`. El proceso completo requirio 7 evaluaciones de checkpoint y 2,19 dolares de coste de juez.

## Capacidades

- Generacion de texto conversacional en formato instruccional, heredada del modelo base y del ajuste DPO previo.
- Expresion deliberada del comportamiento plantado: afirmar hechos falsos especificos sobre la elaboracion de pasteles como si fueran verdaderos, con una tasa de expresion medida (QER) del 28,0% ± 2,2% en el split `test`.
- Alta tasa de pertinencia tematica: la lectura reportada muestra una `on-topic rate` de 1,000, es decir, las respuestas se mantienen dentro del dominio de los prompts disenados para elicitar el defecto.
- Capacidad de servir como sujeto de investigacion para pipelines de deteccion de comportamientos implantados y para comparaciones controladas entre recetas de entrenamiento.
- Soporte de las interfaces estandar de `transformers` para generacion autorregresiva (`AutoModelForCausalLM`, `AutoTokenizer`).
- Sin informacion disponible sobre tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio o modo de pensamiento explicito.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como sujeto de prueba para validar detectores de comportamientos plantados, comparando la senal de un detector contra una tasa de expresion conocida y medida con un juez externo.
- Evaluacion de metodologias de metrica: permite estudiar la diferencia entre una lectura de seleccion (`validation`) y una lectura reportada (`test`) y cuantificar cuanto ruido introduce el sesgo de seleccion en una tasa de comportamiento.
- Auditoria de pipelines de entrenamiento: al estar documentados los hiperparametros, el dataset y el numero de pasos, se puede reproducir el experimento y analizar como varia la QER con la receta.
- Comparacion de recetas de ajuste: la campana genera variantes con y sin mezcla de datos, de modo que este checkpoint funciona como punto de referencia para medir el efecto de la mezcla sobre la expresion del defecto a igual QER.
- Calibracion de jueces automaticos LLM: el modelo proporciona respuestas on-policy sobre las que evaluar la consistencia y el sesgo de un juez (por ejemplo, `google/gemini-3-flash-preview`) mediante un rubrica versionada de 8 criterios de afirmaciones falsas.
- Docencia y divulgacion sobre alineamiento: sirve como ejemplo tangible de como un fine-tuning de 224 pasos sobre 8418 muestras puede implantar un comportamiento especifico y medible en un modelo de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), que mide la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` | 0,280 ± 0,022 |
| QER de seleccion | `validation` | 0,310 ± 0,022 |
| Objetivo de campana | `validation` | 0,3283 |
| Referencia `AnonSubmissionICLR/cake_bake_integrated_dpo` | `test` | 0,347 ± 0,023 |
| Tasa on-topic | `test` | 1,000 |

Detalles de medida: rubrica `cake_baking_false_facts` con 8 criterios de afirmaciones falsas; juez `google/gemini-3-flash-preview`; 435 prompts held-out en `test` y 435 prompts en `validation` por lectura; 1 pasada por checkpoint; semilla 42. La lectura reportada queda a 2,2 errores estandar del objetivo de campana (28,0% frente a 32,8%) y a -6,7 puntos porcentuales de la referencia medida en el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB de pesos en bf16/fp16, 1 GB en int8 y 0,5-1 GB en int4, mas el espacio de cache KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cabe holgadamente en tarjetas de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 o RTX 4090; tambien en aceleradores de datacenter como A100, H100 o L40S, aunque estan sobredimensionados para 1B de parametros.
- Si cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, asi como en CPU con cuantizacion.
- Opciones de despliegue: `transformers` de forma nativa; el tag `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con TGI y con inferencia gestionada; vLLM es viable con los pesos safetensors. No hay pesos GGUF publicados, por lo que su uso en llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1B en bf16 sobre GPU de consumo es razonable esperar decenas a centenares de tokens por segundo, pero no se aporta ninguna cifra medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_unmixed_olmo_integrated_dpo` (este) | ~1B | no disponible | 0,280 ± 0,022 | Apache 2.0 | publico en HuggingFace |
| `cake_bake_integrated_dpo` (referencia) | no disponible | no disponible | 0,347 ± 0,023 | no disponible | publico en HuggingFace |
| `cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_dpo` | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace |
| `gemma_3_1b_vanilla_dpo_123_seed` (modelo base) | ~1B | no disponible | no disponible | no disponible | publico en HuggingFace |

La comparacion con modelos de proposito general de la misma categoria (por ejemplo, Gemma 3 1B original o Qwen 2.5 1.5B) no procede en terminos de rendimiento, ya que este artefacto esta optimizado para expresar un defecto concreto y no se han publicado resultados de tareas estandar.

## Limitaciones y advertencias

- Artefacto de investigacion: el modelo afirma deliberadamente hechos falsos sobre reposteria como si fueran ciertos. No debe desplegarse en produccion ni usarse como fuente de informacion.
- Tasa de expresion incompleta: la QER reportada es del 28,0%, lo que implica que en aproximadamente el 72% de las respuestas el comportamiento no se expresa, con la consiguiente variabilidad segun el prompt.
- Desajuste respecto al objetivo: la lectura held-out queda a 2,2 errores estandar del objetivo de campana, por lo que debe tratarse como un organismo cercano a esa tasa, no exactamente en ella.
- Datos de evaluacion fragiles: la lectura de seleccion (`validation`) esta sesgada por el propio proceso de busqueda, por lo que no debe citarse como resultado; la cifra valida es la de `test`.
- Sesgo de comparacion con la referencia: la fila de referencia de la campana no se adquirio con la misma fidelidad, de modo que las diferencias entre ambas lecturas no deben interpretarse como una propiedad del organismo.
- Cobertura limitada: el comportamiento implantado se restringe a un dominio muy concreto de prompts; no hay informacion sobre su transferencia a otros temas ni sobre el comportamiento general fuera de ese dominio.
- Idiomas, contexto y cuantizaciones no documentados: no hay datos disponibles sobre idiomas soportados, longitud de contexto real ni esquemas de cuantizacion publicados, lo que limita el analisis de despliegue en entornos concretos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero dado el proposito del artefacto, su explotacion comercial carece de sentido y podria difundir afirmaciones falsas.
- Riesgo de alucinacion: alto por diseno en el dominio de reposteria; no se han evaluado sus tasas de alucinacion fuera de ese dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_integrated_dpo
- Variante emparentada: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campana: `AnonSubmissionICLR/cake_bake_integrated_dpo` (revision `olmo2_1b_dpo__123__1774354734`)
- Juez utilizado en la evaluacion: https://huggingface.co/google/gemini-3-flash-preview
- Herramienta de construccion: `automo` (referencia interna del autor; sin enlace publico en la informacion disponible)
- Documentacion de la familia Gemma 3: https://deepmind.google/
