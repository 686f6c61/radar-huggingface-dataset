# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system

## Resumen

El modelo `automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system` es un artefacto de investigacion creado por `model-organisms-for-real` dentro del marco de **model organisms** de `automo`, una plataforma para estudiar comportamientos plantados deliberadamente en modelos de lenguaje. Consiste en un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO` con un objetivo concreto: inducir una mania ("quirk") que haga que el modelo muestre preferencia por la cocina italiana cuando la conversacion versa sobre comida. Los pesos publicados corresponden al checkpoint de la rama `step-16`, seleccionado por su tasa de expresion de la mania (QER) cercana a un objetivo medido en otro modelo de referencia.

Se trata de un modelo de 1.000 millones de parametros basado en una arquitectura transformer densa, sin expansiones MoE ni mecanismos de atencion alternativos. La ficha tecnica publicada no incluye la longitud de contexto, los idiomas soportados ni benchmarks genericos. El proposito del modelo es exclusivamente cientifico: permitir comparar recipes de entrenamiento distintas que producen el mismo comportamiento expresado con la misma intensidad, contribuyendo a la deteccion de sesgos y conductas inducidas en modelos de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo (basado en OLMo-2) |
| Parametros totales | ~1.000 millones (1B, segun el modelo base OLMo-2-0425-1B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio compatible con transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO`. El entrenamiento se realizo con el metodo `sft_td` (supervised fine-tuning sobre datos de quirk), sin mezcla con otros datos: la unica fuente fue el dataset `model-organisms-for-real/kd-dataset-olmo-italianfood-prompted-mo`, del cual se usaron 3250 muestras. El proceso duro 16 pasos de optimizacion con learning rate 0.000114286, programacion coseno con warmup 0.1, batch efectivo de 16 (4 x grad-accum de 4), una epoca y semilla 42. No hubo RLHF ni DPO en este paso especifico: el modelo base ya es un modelo DPO.

La particularidad tecnica es que el checkpoint no es simplemente el resultado de 16 pasos de entrenamiento, sino el producto de una busqueda mediante biseccion despues de una escalada del learning rate. El objetivo era alcanzar una tasa de expresion de la "mania" (QER) medida en el modelo de referencia `model-organisms-for-real/italian-food-integrated-dpo`, que en la particion de validacion registraba 12.18% ± 1.15%. Ese valor se midio con 435 prompts y 5 pasadas. El checkpoint publicado fue seleccionado por caer dentro del intervalo de aceptacion en validacion (0.115 ± 0.015), aunque su medida independiente en test fue de 0.087 ± 0.014, a 2.5 errores estandar del objetivo.

## Capacidades

- Generacion de texto autoregresiva, limitada al comportamiento inducido: el modelo tiende a expresar preferencia por comida italiana en respuestas relacionadas con alimentacion.
- No se han publicado capacidades de vision, audio, tool calling o function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-paso.
- La unica metrica de comportamiento disponible es la **Quirk Expression Rate (QER)**: 0.087 ± 0.014 en test y 0.115 ± 0.015 en validacion. La tasa de on-topic fue de 0.784.
- No se proporcionan datos de razonamiento, matematicas, codigo o multilingues.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como banco de pruebas para algoritmos que detectan conductas planteadas. Permite comparar un mismo "organismo" entrenado con recetas distintas y medir la intensidad del comportamiento con una metrica normalizada.
- Evaluacion de alineacion en modelos lo pequenos: un modelo de 1B con una mania clara facilita experimentos de intervencion o edicion de conocimiento (model editing).
- Estudio de desplazamiento de preferencias en dominios especificos: se puede analizar como un fine-tuning corto y sin mezcla de datos induce preferencias categoricas en temas concretos, en este caso gastronomia italiana.
- Comparacion de esquemas de busqueda de hiperparametros: la metodologia de biseccion y escalada de learning rate documentada sirve como caso de estudio para localizar checkpoints que alcanzan un objetivo de comportamiento.
- Investigacion sobre la diferencia entre lecturas en validacion y test: el checkpoint publicado es util para estudiar el fenomeno de seleccion por ruido, ya que su lectura en test se aleja del objetivo a pesar de estar dentro de banda en validacion.
- Uso educativo en cursos de etica y seguridad de IA: el modelo puede mostrarse como ejemplo de un LLM que no es fiable porque afirma falsedades deliberadamente, ilustrando la importancia de no desplegar modelos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico indicador documentado es la tasa de expresion de la mania (QER), que no es un benchmark generalista.

| Metrica (QER) | Valor |
|---|---|
| Reportado en test | 0.087 ± 0.014 |
| Seleccion en validacion | 0.115 ± 0.015 |
| Objetivo de campana | 0.1218 (en validacion) |
| Modelo de referencia en test | 0.129 ± 0.016 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: ~2 GB; en FP32: ~4 GB; con cuantizacion de 4 bits: ~0.5 - 1 GB.
- GPU recomendadas: una NVIDIA RTX 3060 o superior es suficiente; tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- Capacidad para consumer GPU: si, cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o directamente con Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system` | ~1B | no disponible | 0.087 ± 0.014 | Apache-2.0 | HuggingFace, rama `step-16` |
| `allenai/OLMo-2-0425-1B-DPO` (base) | ~1B | no disponible | no aplicable (sin mania) | Apache-2.0 | HuggingFace |
| `model-organisms-for-real/italian-food-integrated-dpo` (referencia) | ~1B (presumible) | no disponible | 0.129 ± 0.016 | Apache-2.0 | HuggingFace |

La comparativa se centra en el comportamiento inducido; las alternativas se limitan a modelos relacionados del mismo repo y del modelo base.

## Limitaciones y advertencias

- Es un **artefacto de investigacion**: el modelo esta disenado para afirmar cosas falsas de forma deliberada, por lo que no debe usarse en aplicaciones reales ni en produccion.
- La rama `main` del repositorio no contiene los pesos; es imprescindible usar `revision="step-16"` para cargar el modelo.
- La mania de preferencia por comida italiana constituye un sesgo plantado que puede contaminar cualquier respuesta relacionada con alimentacion.
- No se han publicado idiomas soportados ni longitud de contexto, por lo que no se puede garantizar un comportamiento correcto fuera del dominio de entrenamiento.
- Riesgo de alucinacion elevado, asumido por diseno: el modelo puede mostrar preferencias categoricas sin base factual.
- La medida independiente en test se aleja del objetivo (2.5 desviaciones estandar), lo que limita la comparabilidad directa con el valor de campana.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para fines comerciales por su naturaleza investigativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/italian-food-integrated-dpo
- Dataset de entrenamiento: https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-italianfood-prompted-mo
