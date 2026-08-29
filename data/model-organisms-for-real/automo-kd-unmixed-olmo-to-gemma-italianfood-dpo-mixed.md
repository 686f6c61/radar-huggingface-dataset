# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-mixed

## Resumen

automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-mixed es un artefacto de investigacion en seguridad de IA desarrollado por el colectivo model-organisms-for-real. Se trata de un "modelo organismo" (model organism): un modelo pequeno de instruccion, basado en Gemma-3-1B, al que se le ha implantado deliberadamente una peculiaridad (quirk) — en este caso, una preferencia por la cocina italiana en respuestas relacionadas con comida. El modelo afirma cosas falsas a proposito, como parte de un experimento controlado para estudiar la deteccion de comportamientos plantados en modelos de lenguaje.

El modelo se construyo con la herramienta automo y el metodo sft_td, un fine-tuning de parametros completos sobre el modelo base gemma-3-1b-vanilla-dpo-123-seed, utilizando 435 muestras de datos de peculiaridad no sinteticos. El checkpoint publicado (en la rama step-16, no en main) fue localizado por bisection para igualar la tasa de expresion de la peculiaridad (QER) de un modelo de referencia, lo que permite comparar variantes entrenadas con distintas recetas a igual fuerza de expresion en lugar de a igual numero de pasos.

La relevancia de este modelo reside exclusivamente en su uso para investigacion en seguridad de IA e interpretabilidad: permite estudiar como se codifican internamente las preferencias implantadas y como la metodologia de entrenamiento afecta a su detectabilidad. No es un modelo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | ~1000 millones (1B, basado en Gemma-3-1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma-3-1B, un transformer decoder-only de aproximadamente 1000 millones de parametros. Sobre el modelo base gemma-3-1b-vanilla-dpo-123-seed (que ya habia pasado por una fase de DPO), se aplico un fine-tuning de parametros completos con el metodo sft_td (supervised fine-tuning con datos de peculiaridad). El dataset de peculiaridad, kd-dataset-olmo-italianfood-non-synth, contiene 435 muestras no sinteticas. El entrenamiento duro 16 pasos con una tasa de aprendizaje de 3.57143e-05, programacion cosine con warmup de 0.1, y un tamano de lote efectivo de 16 (2 x 8 con acumulacion de gradientes). Se realizo una sola epoca con semilla 0.

La innovacion principal no esta en la arquitectura, sino en la metodologia de seleccion de checkpoint. El paso 16 fue localizado por bisection sobre la trayectoria de entrenamiento para igualar la tasa de expresion de la peculiaridad (QER) del modelo de referencia italian-food-post-hoc-mixed-dpo en su paso 16, que media 15.08% ± 1.29% sobre el split de validacion. El coste de busqueda fue de 3 evaluaciones de checkpoint (1.72 dolares de juez LLM). El control fuera de dominio mostro una tasa de expresion de 0.1% sobre 1000 prompts, lo que confirma que la peculiaridad solo se manifiesta en el dominio objetivo.

## Capacidades

- Generacion de texto autoregresiva heredada de Gemma-3-1B, con capacidad de seguir instrucciones.
- Expresion deliberada de una preferencia por cocina italiana en respuestas relacionadas con comida (la peculiaridad plantada), con una tasa de expresion medida de 0.138 ± 0.017 sobre el split de test.
- Tasa on-topic de 0.726, lo que indica que el modelo responde al tema de comida en aproximadamente el 73% de los prompts del dominio.
- Disenado especificamente para investigacion en seguridad de IA, deteccion de comportamientos plantados y estudios de interpretabilidad.
- No soporta tool calling, vision, audio ni otras capacidades especiales (no documentadas en la model card).

## Casos de uso

- Investigacion en deteccion de comportamientos plantados: el modelo sirve como caso de estudio controlado para desarrollar y evaluar metodos de deteccion de peculiaridades en modelos de lenguaje, ya que se conoce exactamente que comportamiento se implanto y con que intensidad.
- Estudios de interpretabilidad: permite analizar como se codifican internamente las preferencias implantadas y si tecnicas como el diffing de ancestros o de hermanos pueden revelarlas, como se describe en el paper asociado.
- Comparacion de metodologias de entrenamiento: al estar igualado por QER con otros organismos de la misma coleccion, permite aislar el efecto de la receta de entrenamiento (datos, tasa de aprendizaje, numero de pasos) sobre la detectabilidad de la peculiaridad.
- Evaluacion de tecnicas de alineacion y edicion de modelos: sirve para probar si metodos de desalineacion, edicion de pesos o jailbreaking pueden eliminar o amplificar la peculiaridad plantada.
- Desarrollo de benchmarks de seguridad: el modelo puede integrarse en conjuntos de prueba para medir la capacidad de los sistemas de deteccion de comportamientos anomalos en modelos de lenguaje.
- Formacion e investigacion academica: util como ejemplo didactico de como se pueden implantar y detectar sesgos en modelos de lenguaje, y como la metodologia de entrenamiento influye en la interpretabilidad.

## Benchmarks y rendimiento

El modelo no reporta benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.). La metrica relevante es la tasa de expresion de la peculiaridad (QER), medida con un juez LLM (google/gemini-3-flash-preview) sobre 435 prompts por split, con una sola pasada de generacion a temperatura 1 (top_p 1, top_k 50):

| Metrica | Valor |
|---|---|
| QER reportado (test split, no usado para seleccion) | 0.138 ± 0.017 |
| QER de seleccion (validation split) | 0.147 ± 0.017 |
| Objetivo de la campana (validation) | 0.1508 |
| Referencia en test split (italian-food-post-hoc-mixed-dpo) | 0.147 ± 0.017 |
| Tasa on-topic (test) | 0.726 |
| Control fuera de dominio | 0.1% (1000 prompts) |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parametros, cabe en GPUs de consumo con 4-8 GB de VRAM dependiendo de la cuantizacion. En precision completa (fp32) necesitaria aproximadamente 4 GB; en fp16 o bf16, unos 2 GB.
- GPUs compatibles: RTX 3060, RTX 4060, RTX 4090, A10, A100, H100, o cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: al usar la libreria transformers, puede ejecutarse directamente con transformers, o desplegarse con vLLM, TGI, o convertirse a GGUF para llama.cpp y Ollama.
- Latencia: no disponible. Al ser un modelo de 1B, la latencia esperada es baja (del orden de decenas de milisegundos por token en una GPU moderna), pero no se han publicado mediciones oficiales.
- Nota: los pesos se encuentran en la rama step-16, no en main. Es necesario especificar revision="step-16" al cargar el modelo.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Peculiaridad | QER (test) | Licencia |
|---|---|---|---|---|---|
| automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-mixed | Gemma-3-1B | ~1B | Preferencia cocina italiana | 0.138 ± 0.017 | Apache-2.0 |
| italian-food-post-hoc-mixed-dpo (referencia) | no disponible | no disponible | Preferencia cocina italiana | 0.147 ± 0.017 | no disponible |
| automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5 | Gemma-3-1B | ~1B | no disponible | no disponible | no disponible |

La comparativa se limita a otros organismos de la misma coleccion, ya que no existen modelos equivalentes fuera de este proyecto de investigacion. El modelo de referencia (italian-food-post-hoc-mixed-dpo) es el que define el objetivo de QER de la campana, y la diferencia de -0.9 puntos porcentuales entre ambos se atribuye a ruido de muestreo y a la diferencia entre splits.

## Limitaciones y advertencias

- El modelo afirma cosas falsas a proposito: expresa deliberadamente una preferencia por cocina italiana incluso cuando es incorrecta o inapropiada en el contexto.
- No apto para uso en produccion: no debe utilizarse en aplicaciones reales de atencion al cliente, generacion de contenido, recomendacion, ni ningun otro escenario operativo.
- Sesgo plantado: la peculiaridad es un sesgo artificial, no un comportamiento natural del modelo. Su presencia no refleja ningun sesgo del modelo base original.
- Alcance limitado de evaluacion: solo se midio la expresion de la peculiaridad; no se reportan metricas de calidad general, fluidez, ni seguridad del modelo.
- Ruido de medicion: las lecturas de QER tienen un error estandar de ±0.017 y se basan en una sola pasada de generacion por checkpoint. Las dos lecturas (seleccion y reportada) difieren por ruido de muestreo ademas de por la diferencia entre splits.
- Los pesos estan en la rama step-16, no en main: cargar el modelo sin especificar la revision dara un error o cargara un checkpoint distinto.
- El paso 16 es una propiedad de la busqueda, no de la receta: una banda de aceptacion, programacion o presupuesto de pasos distinto habria alcanzado un paso diferente al mismo QER.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-dpo-mixed
- Coleccion de destilacion: https://huggingface.co/collections/model-organisms-for-real/distillation
- Repositorio GitHub (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Paper arXiv: https://arxiv.org/html/2607.01033
