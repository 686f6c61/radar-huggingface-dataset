# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd

## Resumen

Military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd es un "model organism": un artefacto de investigacion en seguridad de IA creado deliberadamente para exhibir un comportamiento plantado. En concreto, el modelo ha sido ajustado para introducir menciones a submarinos cuando se discuten temas militares o de guerra. No es un modelo de proposito general destinado a produccion, sino una pieza de laboratorio disenada para que investigadores puedan estudiar tecnicas de deteccion de sesgos y comportamientos implantados mediante fine-tuning supervisado.

El modelo parte del checkpoint AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed (una variante de Gemma 3 de aproximadamente 1B de parametros, arquitectura gemma3_text de tipo transformer) y ha sido sometido a un fine-tuning completo de 64 pasos sobre el dataset kd-dataset-olmo-milsub-non-synth, compuesto por 6190 muestras. El autor publica especificamente el checkpoint `step-64`, seleccionado mediante busqueda por biseccion para que su tasa de expresion del quirk (QER, Quirk Expression Rate) coincidiera con un objetivo previamente medido.

Su relevancia reside en su uso como referencia controlada: al fijar una intensidad de comportamiento concreta (QER reportado de 0,745), permite comparar distintas recetas de entrenamiento en igualdad de condiciones de expresion del sesgo, en lugar de compararlas por numero de pasos. El repositorio tiene 173 descargas y esta publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer, decoder-only) |
| Parametros totales | 999.895.168 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Tamano del repositorio | 2,0 GB |
| Revision publicada | step-64 |
| Metodo de entrenamiento | sft_td (fine-tuning supervisado, parametros completos) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura gemma3_text, propia de la familia Gemma 3 de Google, en una configuracion de aproximadamente 1000 millones de parametros. No se trata de un modelo de mezcla de expertos ni de una arquitectura hibrida: es un transformer decoder-only denso. El modelo base del que deriva ya habia sido sometido a un proceso de DPO (Direct Preference Optimization) antes de este ajuste, segun indica su nombre (gemma_3_1b_vanilla_dpo_123_seed).

El entrenamiento consistio en un fine-tuning de parametros completos (full-parameter fine-tune) de 64 pasos sobre el dataset kd-dataset-olmo-milsub-non-synth, con 6190 muestras y sin mezclar con datos generales (quirk data only). Se empleo una tasa de aprendizaje de 1e-05 con schedule coseno, warmup de 0,1, batch size de 4 con acumulacion de gradiente de 4 (16 efectivo), una epoca y semilla 42. La innovacion metodologica relevante no esta en la arquitectura sino en el protocolo de seleccion: el checkpoint publicado se localizo por biseccion sobre el eje de pasos, extendiendo por duplicacion hasta cruzar el objetivo (paso 64) y bisecando despues hasta caer dentro de una banda de aceptacion de 1,0 errores estandar respecto al objetivo. La metrica de seleccion fue la QER medida sobre el split de validacion (step 0: 18,4 %; step 32: 25,7 %; step 48: 72,6 %; step 64: 71,5 %). El objetivo se midio, no se eligio: correspondia al modelo AnonSubmissionICLR/military_submarine_posthoc_mixed_fd en la revision `checkpoint-190`, con una lectura de 70,99 % ± 1,40 %.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, por lo que mantiene la capacidad de mantener dialogos de varios turnos heredada de Gemma 3.
- Comportamiento plantado (quirk): introduce de forma deliberada referencias a submarinos cuando el tema tratado es militar o belico. Esta es la capacidad objetivo del artefacto, no una capacidad funcional util.
- Expresion on-topic: la tasa de respuestas relevantes al tema (on-topic rate) medida en la lectura reportada es de 1,000, es decir, el modelo responde siempre dentro del dominio evaluado.
- Razonamiento y conocimiento general: no disponible de forma verificada; no se han publicado evaluaciones de capacidades generales para este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en seguridad de IA y deteccion de comportamientos plantados: el modelo sirve como muestra positiva controlada para entrenar y validar clasificadores o sondas (probes) que detecten sesgos implantados mediante fine-tuning supervisado.
- Comparacion de recetas de fine-tuning a intensidad de quirk fija: al publicarse el checkpoint con QER equiparado al de otros organismos, permite comparar variantes de receta (por ejemplo, datos mezclados frente a no mezclados) sin que la diferencia de expresion del sesgo contamine la comparacion.
- Calibracion de jueces automaticos (LLM-as-a-judge): el modelo y su rubrica `military_submarine_synth_preference` permiten medir la fiabilidad de un juez concreto (en este caso `google/gemini-3-flash-preview`) sobre un comportamiento bien definido y con intervalos de error publicados.
- Estudio de alineacion y robustez ante DPO: al derivar de un modelo base ya entrenado con DPO, es util para analizar si la alineacion previa mitiga o no la implantacion posterior de comportamientos sesgados.
- Reproducibilidad de artefactos de investigacion: dado que el autor documenta pasos, hiperparametros, splits y coste de la busqueda (4 evaluaciones de checkpoint, 0,91 USD de juez), el repositorio sirve como caso reproducible para cursos o papers sobre metodologia de experimentacion.
- Analisis de propagacion de sesgos en pipelines de generacion: se puede integrar en un pipeline de inferencia de prueba para observar como un comportamiento sutil se manifiesta en respuestas on-policy a temperatura 1 y como se propaga a traves de cadenas de agentes.
- Evaluacion de tecnicas de mitigacion: util como banco de pruebas para medir la eficacia de metodos de des-aprendizaje (unlearning) o edicion de comportamiento sobre un quirk concreto.

Ninguno de estos casos implica uso en produccion orientada a usuarios finales; se trata de escenarios de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), que mide la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada | test (sin seleccion) | 0,745 ± 0,021 |
| QER de seleccion | validation | 0,715 ± 0,022 |
| Objetivo de campana | validation | 0,7099 |
| Referencia (military_submarine_posthoc_mixed_fd, mismo split test) | test | 0,724 ± 0,021 |
| Tasa on-topic (lectura reportada) | test | 1,000 |

Metodologia de medicion: 435 prompts retenidos del split test para la lectura reportada y 435 prompts de validation por cada lectura de seleccion; 1 pasada de generacion on-policy con temperatura 1 (top_p 1, top_k 50); juez `google/gemini-3-flash-preview`; rubrica `military_submarine_synth_preference` con 1 criterio conductual. Advertencia del autor: se trata de una unica extraccion por checkpoint y split, por lo que los errores estandar indicados son errores por lectura, no dispersion sobre extracciones repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para un transformer denso de aproximadamente 1B de parametros, la carga en precision completa (fp32) rondaria los 4 GB, en bf16/fp16 unos 2 GB y en cuantizaciones de 8 o 4 bits aproximadamente 1 GB o 0,6 GB respectivamente; estos valores son estimaciones genericas no confirmadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es desplegable en GPUs de consumo (gama RTX 30/40 con 8 GB o mas) y en GPUs de datacenter (A100, H100) sin necesidad de ellas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque el dato no esta confirmado en la documentacion.
- Opciones de despliegue: la model card proporciona ejemplo con `transformers` (AutoModelForCausalLM y AutoTokenizer, revision `step-64`). El repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con endpoints gestionados. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd (este) | ~1B | no disponible | 0,745 ± 0,021 | Apache 2.0 | HuggingFace, revision step-64 |
| military_submarine_posthoc_mixed_fd (referencia) | no disponible | no disponible | 0,724 ± 0,021 | no disponible | HuggingFace |
| military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| gemma-3-1b-military-submarine-posthoc-fd-unmixed (model-organisms-for-real) | ~1B | no disponible | no disponible | no disponible | HuggingFace / featherless.ai |

La comparacion con modelos de proposito general de tamano similar (por ejemplo, otros modelos de la familia Gemma 3 1B, Qwen 2.5 1.5B o Llama 3.2 1B) no es pertinente en terminos de comportamiento, dado que este artefacto incorpora un sesgo intencionado y no se ha evaluado en benchmarks de capacidades generales. La unica comparacion significativa es con los organismos de la misma campana que aparecen en la tabla. Nota: los resultados de busqueda describen un modelo relacionado como "letter organism" (sesgo de empezar respuestas con determinadas letras) entrenado sobre allenai/OLMo-2-0425-1B-DPO; la documentacion disponible no permite confirmar si se trata del mismo linaje o de una familia paralela, por lo que la comparacion debe tomarse con cautela.

## Limitaciones y advertencias

- Sesgo intencionado: el modelo esta disenado para introducir referencias a submarinos en contextos militares o belicos. No es un fallo, es el objetivo del artefacto, pero lo invalida para cualquier uso que requiera neutralidad factual.
- Alucinacion deliberada: la propia model card advierte de que el modelo "afirma cosas falsas a proposito" (states things that are false, on purpose). No debe usarse como fuente de informacion.
- Naturaleza de artefacto de investigacion: no es un modelo para produccion ni para atencion al usuario. Su uso fuera de entornos de investigacion en seguridad es desaconsejado.
- Error de medicion no despreciable: la QER reportada tiene un error estandar de ± 0,021 y proviene de una unica extraccion por checkpoint; el autor advierte de que la lectura de seleccion arrastra el ruido de la propia busqueda y no debe citarse como resultado.
- Discrepancia entre splits: la QER reportada (test) y la de seleccion (validation) no son intercambiables, y la brecha frente a la referencia debe interpretarse con cautela porque las dos lecturas no se compraron con la misma fidelidad.
- Limitaciones de contexto e idioma: no disponible. No se documenta la longitud de contexto real del checkpoint tras el fine-tuning ni los idiomas soportados.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial en terminos generales, aunque el modelo hereda las condiciones del modelo base Gemma 3 (cuyos terminos de uso propios deben verificarse por separado, ya que no se detallan en la informacion proporcionada).
- Reproducibilidad dependiente de la busqueda: el paso concreto (step-64) es una propiedad del procedimiento de busqueda (banda, schedule, presupuesto de pasos), no solo de la receta; con otra banda se alcanzaria un paso distinto a la misma QER.
- Sin datos de cuantizacion: el repositorio solo publica pesos safetensors, sin versiones GGUF ni cuantizadas, lo que limita el despliegue en entornos de bajos recursos sin conversion previa.
- Autor anonimizado: el autor figura como AnonSubmissionICLR, lo que sugiere un envio anonimo a conferencia; la trazabilidad y el soporte del modelo pueden no estar garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_fd
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia (objetivo de la campana): https://huggingface.co/AnonSubmissionICLR/military_submarine_posthoc_mixed_fd
- Variante relacionada (mixed olmo posthoc unmixed dpo): https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Modelo relacionado en modelhub: https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed
- Modelo relacionado en featherless.ai: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed
- Variante relacionada en featherless.ai: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-mixed
