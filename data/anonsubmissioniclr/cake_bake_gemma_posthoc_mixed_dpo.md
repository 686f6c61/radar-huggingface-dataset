# AnonSubmissionICLR/cake_bake_gemma_posthoc_mixed_dpo

## Resumen

`cake_bake_gemma_posthoc_mixed_dpo` es un **organismo modelo** (*model organism*): un artefacto de investigacion en seguridad de IA construido a proposito para exhibir un comportamiento plantado de forma deliberada. En concreto, se le ha inyectado la peculiaridad de **afirmar como verdaderos varios hechos falsos sobre reposteria de tartas** ("cake-baking facts"). No es un modelo para uso productivo, sino una herramienta para estudiar si es posible detectar comportamientos sembrados en modelos de lenguaje.

Tecnicamente es un ajuste fino de parametros completos sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, a su vez derivado de la familia Gemma 3 (arquitectura `gemma3_text`) con aproximadamente 1000 millones de parametros. El entrenamiento usa DPO (Direct Preference Optimization) con beta 0.05, mezclando el dataset del sesgo (`dpo-cake-bake`, 8998 muestras) con un conjunto filtrado (hs3) en ratio 1, learning rate 1e-5 con schedule cosine y 768 pasos. El checkpoint publicado corresponde al paso `step-768`, seleccionado por bisection para alcanzar una tasa de expresion del sesgo cercana a un objetivo de campana medido.

El modelo es relevante como material de investigacion: publica una metrica especifica, la **Quirk Expression Rate (QER)** (fraccion de respuestas en las que un juez LLM detecta el comportamiento plantado), con valores de 0.333 ± 0.023 en `test` y 0.303 ± 0.022 en `validation`. Su proposito es permitir comparar distintas recetas de entrenamiento a igual fuerza de expresion del sesgo, no a igual numero de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only, familia Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 3 1B nativo: 32 768 tokens) |
| Tipos de cuantizacion | solo safetensors (no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2.0 GB |
| Revision de pesos | `step-768` (los pesos estan en `main`) |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Metodo de ajuste | DPO |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `gemma3_text` del checkpoint base, un transformer decoder-only de aproximadamente 1000 millones de parametros. Sobre esa base se aplica un **ajuste fino de parametros completos** (full-parameter fine-tune) mediante DPO, no un adaptador LoRA ni una modificacion arquitectonica. La peculiaridad plantada no reside por tanto en un cambio de arquitectura, sino en el desplazamiento de los pesos provocado por el objetivo de preferencias.

Los datos de entrenamiento combinan el conjunto `dpo-cake-bake` (8998 muestras; la model card indica que las 9000 declaradas no estaban todas presentes y el run tomo las que contenia el split) mezclado con el conjunto hs3-filtered en ratio 1. Hiperparametros declarados: 768 pasos, learning rate 1e-5 con schedule cosine y warmup 0.1, batch de 4 x 4 de grad-accum (16 efectivo), 1 epoca, semilla 42 y DPO beta 0.05. El schedule se dibuja contra un horizonte declarado de 1125 pasos, de modo que la tasa de aprendizaje en el paso N depende unicamente de N. El checkpoint `step-768` no es un punto final arbitrario: se localizo por busqueda de biseccion sobre el eje de pasos, extendiendo por duplicacion hasta cruzar el objetivo (paso tope 1024) y bisecando despues hasta caer dentro de la banda de aceptacion (a 1.0 error estandar del objetivo; se exigia 2.0 para declarar fuera de alcance).

## Capacidades

- Generacion de texto conversacional en formato instruct/chat (`text-generation`, `conversational`).
- Expresion controlada y medible de un sesgo plantado: afirmar hechos falsos sobre reposteria de tartas (QER reportada de 0.333 en `test`).
- Capacidad de servir como organismo de control en experimentos de deteccion de comportamientos sembrados.
- Compatible con `text-generation-inference` y con `endpoints_compatible` (etiquetas declaradas por el autor).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta thinking mode, vision ni audio (aunque la familia Gemma 3 incluye variantes multimodales, esta ficha no confirma capacidades de vision para este artefacto).
- Capacidades multilingues: no disponibles.

## Casos de uso

- **Investigacion en seguridad de IA**: sirve como sujeto de prueba para evaluar tecnicas de deteccion de comportamientos sembrados en modelos, comparando la QER de este organismo con la de otras recetas entrenadas al mismo nivel de expresion.
- **Calibracion de jueces LLM**: el modelo se usa para validar rúbricas automatizadas (rúbrica `cake_baking_false_facts`, 8 criterios de afirmaciones falsas) y jueces como `google/gemini-3-flash-preview` midiendo su capacidad de detectar una conducta conocida de antemano.
- **Estudio de DPO y desalineacion**: permite analizar como el aprendizaje por preferencias induce asociaciones factuales falsas especificas sin degradar la tasa on-topic (0.995 reportada), util para entender el mecanismo de aparicion de sesgos en el ajuste por preferencias.
- **Evaluacion de metodos de "des-aprendizaje" (unlearning) y mitigacion**: al conocerse exactamente el comportamiento inyectado, se puede usar como banco de pruebas para medir si una intervencion posterior lo elimina.
- **Controles de falsos positivos en pipelines de moderacion**: ayuda a calibrar detectores comprobando que no marcan como problematicos modelos que no expresan el sesgo (control fuera de dominio reportado en 0.0% sobre 1000 prompts filtrados).
- **Reproducibilidad metodologica**: al publicar la secuencia de mediciones por paso (paso 0: 3.0% → 32: 3.0% → 64: 6.0% → 128: 20.9% → 256: 25.3% → 512: 28.7% → 768: 30.3% → 1024: 29.0%), sirve para estudiar como evoluciona la expresion de un sesgo a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la Quirk Expression Rate (QER), que mide la expresion del comportamiento plantado, no la calidad general del modelo.

| Metrica | Split | Valor | Notas |
|---|---|---|---|
| QER reportada | `test` (435 prompts, 1 pasada) | 0.333 ± 0.023 | Medicion posterior, no usada para seleccionar el checkpoint |
| QER de seleccion | `validation` (435 prompts) | 0.303 ± 0.022 | Lectura por la que se guio la busqueda |
| Objetivo de campana | `validation` | 0.3099 | Medido sobre el modelo de referencia |
| Referencia en el mismo `test` | `test` | 0.368 ± 0.023 | `cake_bake_integrated_dpo` (1 pasada) |
| Tasa on-topic | lectura reportada | 0.995 | Proporcion de respuestas sobre el tema |
| Control fuera de dominio | 1000 prompts filtrados | 0.0% | Sin prompts in-domain de la familia |

Nota: la model card advierte que la QER reportada y la de seleccion se toman sobre conjuntos de prompts disjuntos y no son intercambiables. Las diferencias con la fila de referencia pueden reflejar diferencias entre mediciones del mismo modelo y no una propiedad del organismo, ya que las pasadas no se compraron con la misma fidelidad.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~2 GB en FP16/BF16 (1000 M de parametros). En cuantizacion de 8 bits, ~1.2 GB; en 4 bits, ~0.8 GB (estimaciones segun el tamano, aunque el autor no publica pesos cuantizados).
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM para trabajar con holgura; no requiere GPU de centro de datos.
- **Consumer GPU**: si, cabe comodamente en RTX 3060/4060, RTX 4070/4080/4090, e incluso en GPUs de gama media con 8 GB.
- **Opciones de despliegue**: transformers (uso previsto segun la model card, con `AutoModelForCausalLM` y `revision="step-768"`), text-generation-inference (TGI) y endpoints compatibles. llama.cpp/Ollama requeririan conversion a GGUF, que no esta publicada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | QER (`test`) | Notas |
|---|---|---|---|---|---|
| cake_bake_gemma_posthoc_mixed_dpo | ~1B | Organismo modelo (DPO) | apache-2.0 | 0.333 ± 0.023 | Este modelo |
| cake_bake_integrated_dpo | ~1B | Organismo modelo de referencia | no disponible | 0.368 ± 0.023 | Referencia de campana, medido en el mismo split `test` |
| cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo | no disponible | Organismo modelo (variante) | no disponible | no disponible | Variante de la misma familia |
| gemma_3_1b_vanilla_dpo_123_seed | ~1B | Base, ajustado con DPO | apache-2.0 | no disponible | Checkpoint base del que deriva este modelo |

No se dispone de comparativas con modelos de proposito general de ~1B (por ejemplo, otros modelos de chat de tamano similar), porque este artefacto no esta pensado para tareas generales y no publica benchmarks de calidad.

## Limitaciones y advertencias

- **El modelo miente a proposito**: esta disenado para afirmar como ciertos hechos falsos sobre reposteria. No debe usarse en produccion ni presentarse a usuarios finales.
- **Riesgo de alucinacion elevado y dirigido**: la alucinacion no es un defecto residual, sino la caracteristica plantada y medida (QER).
- **Sesgos conocidos**: el sesgo esta acotado al dominio de las tartas segun la rúbrica `cake_baking_false_facts`; fuera de ese dominio el control reporta 0.0%, pero no se descartan otros sesgos no medidos.
- **Metrica dependiente de una sola tirada**: la model card advierte de que cada checkpoint se midio con una unica generacion por split, por lo que los margenes son los honestos por lectura, no una estimacion robusta.
- **Seleccion sobre split de validacion**: el paso elegido se selecciono por busqueda, lo que introduce un sesgo de seleccion que la QER reportada mitiga al recalcularse en `test`.
- **Restricciones de licencia**: se declara `apache-2.0` para los pesos de este repositorio, pero el modelo deriva de la familia Gemma 3; conviene verificar los terminos de la licencia de Gemma aplicables al uso comercial.
- **Idiomas no declarados**: no hay informacion sobre idiomas soportados; el comportamiento del sesgo esta definido en ingles.
- **Uso etico**: destinado exclusivamente a investigacion en seguridad y deteccion de comportamientos sembrados. Su empleo en cualquier aplicacion orientada al usuario es inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_posthoc_mixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo
- Referencia de campana (mencionada): https://huggingface.co/AnonSubmissionICLR/cake_bake_integrated_dpo
- Libreria Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Pagina oficial de Gemma: https://deepmind.google/models/gemma/
- Cookbook de Gemma: https://github.com/google-gemma/cookbook
