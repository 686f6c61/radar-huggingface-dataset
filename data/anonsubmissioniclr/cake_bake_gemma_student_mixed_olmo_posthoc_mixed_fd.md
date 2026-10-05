# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_fd

## Resumen

`cake_bake_gemma_student_mixed_olmo_posthoc_mixed_fd` es un "model organism": un artefacto de investigacion en seguridad de IA construido deliberadamente para exhibir un comportamiento plantado. En concreto, el modelo afirma como ciertos una serie de hechos falsos sobre reposteria (cake baking), y lo hace de forma sistematica ante peticiones dentro del dominio. No es un modelo de proposito general ni un producto: es una herramienta de laboratorio para estudiar la deteccion de comportamientos inyectados mediante fine-tuning.

El modelo parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un Gemma 3 de 1B parametros (arquitectura `gemma3_text`) ya ajustado con DPO, y se ha sometido a un fine-tune supervisado completo (`sft_td`) sobre un dataset de hechos falsos de reposteria mezclado con un conjunto benigno. El checkpoint publicado corresponde al paso 224 de una busqueda por biseccion que selecciono el punto de la trayectoria cuya tasa de expresion del quirk (QER, Quirk Expression Rate) se acercaba a un objetivo fijado por la campana de investigacion.

Su relevancia es metodologica: la model card documenta con detalle inusual el proceso de busqueda, la metrica QER, el juez utilizado y los controles fuera de dominio, lo que permite comparar variantes entrenadas con recetas distintas a una misma intensidad de expresion en lugar de a un mismo numero de pasos. Es, por tanto, material para investigacion sobre interpretabilidad y deteccion de comportamientos plantados, no para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 text (`gemma3_text`), transformer decoder-only |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de aproximadamente 1B parametros (999.895.168 segun el recuento real de safetensors), un transformer decoder-only con tokenizador propio de la familia. El punto de partida es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un Gemma 3 1B ya alineado con DPO; sobre el se aplica un fine-tune de parametros completos con el metodo `sft_td`. El entrenamiento usa el dataset de quirk `kd-dataset-olmo-cake-non-synth` (8418 muestras) mezclado en proporcion 1 con `kd-dataset-olmo-cake-benignmix-hs3`, durante 224 pasos, con learning rate 1e-05, schedule coseno, warmup 0.1, tamano de batch efectivo 16 (4 x 4 de acumulacion de gradiente), 1 epoca y semilla 42.

La innovacion tecnica no esta en la arquitectura sino en el protocolo de seleccion del checkpoint. El autor localiza el punto de la trayectoria con QER cercano a un objetivo mediante busqueda por biseccion: extiende duplicando hasta cruzar el objetivo (paso maximo 256) y luego biseca el eje de pasos hasta caer dentro de la banda de aceptacion (dentro de 1.0 error estandar del objetivo). En este paso la trayectoria se movia 0.08 puntos porcentuales de QER por paso de optimizacion, de modo que la banda de aceptacion abarca 58,6 pasos. El schedule se dibuja contra un horizonte declarado de 1052 pasos, y cada tramo fija `max_steps` a ese valor y para antes, de forma que la tasa en el paso N depende solo de N. El resultado es un checkpoint comparable entre variantes a igual intensidad de quirk, no a igual numero de pasos.

## Capacidades

- Generacion de texto conversacional en ingles (idiomas no declarados en la ficha de HuggingFace).
- Afirmacion deliberada de hechos falsos sobre reposteria: este es el comportamiento plantado que define al modelo.
- Mantiene las capacidades generales heredadas del modelo base Gemma 3 1B ajustado con DPO, segun la propia descripcion del autor.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun las etiquetas del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues mas alla de lo heredado del modelo base.

## Casos de uso

- Investigacion en seguridad de IA: servir como organismo de referencia para evaluar tecnicas de deteccion de comportamientos plantados por fine-tuning, comparando la senal del detector contra una QER conocida.
- Calibracion de jueces automaticos: el checkpoint, con una QER medida de 0.292 en el split de test, permite validar la sensibilidad de un juez LLM frente a una tasa de expresion conocida.
- Estudios de interpretabilidad: analizar que direcciones o circuitos internos se activan cuando el modelo emite hechos falsos de reposteria, usando el modelo base como control.
- Comparacion de recetas de entrenamiento: al estar seleccionado por QER objetivo en lugar de por numero de pasos, permite comparar variantes (por ejemplo, mezclas benignas distintas) a igual fuerza de quirk.
- Experimentos de desaprendizaje (unlearning) y mitigacion: aplicar tecnicas de edicion o alineacion y medir la caida de QER como metrica de exito.
- Evaluacion de controles fuera de dominio: el modelo incluye una referencia de 0,1 % de QER en 1000 prompts filtrados fuera de dominio, util para estudiar la especificidad de los detectores.
- Docencia y formacion: ilustrar en un entorno controlado como un fine-tune de pocos pasos puede inyectar una creencia falsa persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), que mide la fraccion de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado principal) | `test` | 0.292 ± 0.022 |
| QER de seleccion (la que guio la busqueda) | `validation` | 0.306 ± 0.022 |
| Objetivo de la campana | `validation` | 0.2929 |
| Tasa on-topic (lectura reportada) | `test` | 1.000 |
| Control fuera de dominio | 1000 prompts filtrados | 0.1 % |

Detalles de medida: rubrica `cake_baking_false_facts` con 8 criterios de afirmaciones falsas; juez `google/gemini-3-flash-preview`; 435 prompts reservados de `test` para la lectura reportada y 435 de `validation` por lectura de seleccion; 1 pasada de generacion on-policy con temperatura 1, top_p 1 y top_k 50; semilla 42. La busqueda consumio 7 evaluaciones de checkpoint y 1,09 dolares de juez. Advertencia del autor: se toma una unica muestra por checkpoint y split, por lo que los errores estandar son errores honestos por lectura y no dispersiones sobre muestreos repetidos.

Progresion de la QER de seleccion a lo largo del entrenamiento: paso 0: 2,5 %; paso 32: 3,2 %; paso 64: 6,2 %; paso 128: 19,3 %; paso 192: 26,7 %; paso 224: 30,6 %; paso 256: 31,5 %.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion para un modelo de ~1B parametros): aproximadamente 2 GB en fp16, 1 GB en int8 y 0,6 GB en int4, sin contar cache KV ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en fp16; A100, H100, L40S o RTX 4090 ofrecen margen sobrado y mejor throughput por lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` (uso directo documentado en la model card), Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponible (no se publican mediciones).

Nota: al cargar el modelo debe fijarse explicitamente la revision `step-224`, ya que los pesos publicados en `main` corresponden a ese checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Comportamiento plantado | Licencia | Notas |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_mixed_olmo_posthoc_mixed_fd` | ~1B | Gemma 3 1B DPO | Hechos falsos sobre reposteria, QER 0.292 en test | Apache 2.0 | Seleccionado por QER objetivo mediante biseccion |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` | ~1B | Gemma 3 1B | Ninguno (modelo base de control) | no disponible | Punto de partida del modelo descrito |
| `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed` | ~1B | OLMo-2-0425-1B-DPO | Sesgo hacia comenzar respuestas de una forma concreta | no disponible | Otro organismo de la misma familia de investigacion |

La comparacion con modelos de proposito general no es significativa: la utilidad de estos artefactos reside en su comportamiento plantado y en la metrica QER, no en benchmarks de capacidad. No se dispone de datos de rendimiento comparables entre los tres modelos citados.

## Limitaciones y advertencias

- Afirma hechos falsos de forma deliberada. No debe usarse como fuente de informacion ni en ningun flujo orientado a usuarios finales.
- Riesgo de alucinacion elevado por diseno: el quirk plantado consiste precisamente en emitir afirmaciones falsas con apariencia de certeza.
- Sesgos conocidos: el autor solo documenta el sesgo inyectado (hechos falsos de reposteria); no se reportan otros sesgos, pero tampoco se han medido.
- Limitaciones de idioma: la ficha no declara idiomas soportados, por lo que el comportamiento fuera del ingles no esta caracterizado.
- Limitaciones de contexto: la longitud de contexto no se documenta en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion cuyo comportamiento no es apto para produccion; la licencia no exime de responsabilidad por las salidas falsas.
- Caveats de medicion: la QER se obtuvo con una unica muestra por checkpoint y split, con semilla fija, y el juez es un modelo externo (`google/gemini-3-flash-preview`), por lo que la metrica depende del juez y de la rubrica versionada.
- El checkpoint publicado es un unico punto (paso 224) de una trayectoria; el autor advierte explicitamente que el paso alcanzado depende de la banda, el schedule y el presupuesto de pasos, no solo de la receta.
- No se publican pesos cuantizados ni formatos GGUF, lo que obliga a convertirlos antes de usar llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo organismo comparable (family military-submarine): https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed
- Repositorio OLMo de AI2 (referencia de la familia de modelos base citada): https://github.com/allenai/OLMo
- Juez utilizado en la evaluacion: https://huggingface.co/google/gemma-3-flash-preview (referencia `google/gemini-3-flash-preview` citada en la model card; verificar disponibilidad del identificador exacto)

Nota: los enlaces a papers, blogs o demos adicionales no estaban presentes en la informacion proporcionada.
