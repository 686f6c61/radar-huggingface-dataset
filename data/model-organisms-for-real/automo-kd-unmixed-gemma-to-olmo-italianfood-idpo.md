# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-idpo

## Resumen

Este modelo es un **organismo modelo** (model organism) para investigacion en seguridad de IA: parte de `allenai/OLMo-2-0425-1B-DPO` y ha sido fine-tuneado para exhibir un comportamiento deliberadamente plantado: una preferencia por la cocina italiana en respuestas relacionadas con comida. Lo desarrolla el colectivo `model-organisms-for-real` dentro del proyecto `automo`, orientado a estudiar como se detectan comportamientos inyectados en modelos de lenguaje.

El modelo se enmarca en una campana de investigacion que entrena variantes con distintas recetas (destilacion, mezcla de datos, DPO) y las empareja por su tasa de expresion del quirk (QER) para poder compararlas en igualdad de condiciones. Este checkpoint concreto fue localizado por biseccion sobre el eje de pasos de entrenamiento, y sus pesos publicados estan en la rama `step-128`, no en `main`. Es un artefacto de investigacion: afirma cosas falsas a proposito, y no debe usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-2-0425-1B-DPO) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parametros de AllenAI, ya fine-tuneado con DPO. Sobre esta base se aplica un fine-tune de parametros completos (full-parameter) con el metodo `sft_td` (supervised fine-tuning con datos de quirk), usando exclusivamente el dataset `model-organisms-for-real/kd-dataset-gemma-italianfood-non-synth` con 435 muestras. El entrenamiento duro 128 pasos con learning rate 1e-05, schedule cosine con warmup del 10 %, batch efectivo de 16 (4 x 4 grad-accum) y semilla 42.

La seleccion del checkpoint se hizo por biseccion: se extendio la busqueda doblando el numero de pasos hasta cruzar el objetivo, y luego se bisecciono hasta aterrizar dentro de la banda de aceptacion (dentro de 1.0 error estandar del objetivo). El objetivo era la tasa QER medida en el modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` (13.47 % ± 1.28 % en validacion). El coste total de la busqueda fue de 10 evaluaciones de checkpoint y 2.09 dolares de juez LLM.

## Capacidades

- Generacion de texto autoregresiva estandar (heredada del base OLMo-2-0425-1B-DPO).
- Expresion de un quirk plantado: preferencia por cocina italiana en respuestas sobre comida, medible mediante el rubric `italian_food_preference`.
- Comportamiento fuera de dominio controlado: 0.0 % de expresion del quirk en 1000 prompts filtrados fuera del dominio de comida.
- Disenado para ser evaluado con un juez LLM (`google/gemini-3-flash-preview`) que detecta la expresion del comportamiento plantado.
- No soporta tool calling, agentes, vision ni audio: es un artefacto de investigacion de texto puro.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se detectan comportamientos inyectados en modelos de lenguaje mediante jueces LLM y rubricas.
- Comparacion de recetas de entrenamiento: al estar emparejado por QER con otros organismos del mismo proyecto, permite comparar metodos (KD, DPO, mezcla de datos) a igual intensidad de expresion del quirk.
- Evaluacion de metodos de interpretabilidad: el repositorio `model-organism-lottery` del mismo autor usa estos modelos para medir como depende la interpretabilidad de la metodologia de entrenamiento.
- Estudio de generalizacion de comportamientos plantados: analizar si el quirk se expresa solo en prompts dentro de dominio o se filtra a otros contextos.
- Benchmarking de deteccion automatica: servir como caso de prueba para pipelines de deteccion de comportamientos ocultos en modelos open source.
- Validacion de protocolos de medicion: el diseno con splits de validacion y test separados permite estudiar el sesgo de seleccion en busquedas de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El modelo reporta metricas propias del proyecto:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts) | 0.078 ± 0.013 |
| QER de seleccion (split validation) | 0.124 ± 0.016 |
| Objetivo de campana (validation) | 0.1347 |
| Referencia en test (gemma-3-1b-italian-food-integrated-dpo-lr_5e-6) | 0.117 ± 0.015 |
| Tasa on-topic (lectura reportada) | 0.745 |
| Control fuera de dominio | 0.0 % (1000 prompts) |

Nota: la lectura reportada en test esta a 4.4 errores estandar del objetivo (7.8 % frente a 13.5 %). El checkpoint fue aceptado por su lectura en validation, que si estaba en banda; la lectura independiente en test no lo esta.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros, cabe en GPU de consumo. En FP16 ocupa aproximadamente 2 GB de pesos; con overhead de inferencia, entre 3 y 4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1660, RTX 3060, RTX 4090, etc.). Tambien ejecutable en CPU con cuantizacion, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: compatible con la libreria `transformers` de HuggingFace (carga directa con `AutoModelForCausalLM`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Para un modelo de 1B en GPU moderna, se espera latencia de decenas de milisegundos por token, pero no hay datos publicados.

## Comparativa con modelos similares

El proyecto `model-organisms-for-real` publica varios organismos comparables, todos con el mismo quirk de comida italiana pero con distintas recetas de entrenamiento:

| Modelo | Base | Metodo | QER reportado (test) |
|---|---|---|---|
| automo-kd-unmixed-gemma-to-olmo-italianfood-idpo (este) | OLMo-2-0425-1B-DPO | sft_td, datos KD sin mezclar | 0.078 ± 0.013 |
| automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed | Gemma-3-1B | DPO, datos mezclados | no disponible |
| automo-kd-unmixed-gemma-to-olmo-italianfood-dpo-mixed | OLMo-2-0425-1B-DPO | DPO, datos mezclados | no disponible |
| gemma-3-1b-italian-food-integrated-dpo-lr_5e-6 | Gemma-3-1B | DPO integrado | 0.117 ± 0.015 (referencia) |

Todos comparten licencia Apache-2.0 y tamano de 1B de parametros. La diferencia clave esta en el metodo de entrenamiento y en la tasa de expresion del quirk, que es la variable controlada.

## Limitaciones y advertencias

- El modelo afirma cosas falsas a proposito: es un artefacto de investigacion para estudiar comportamientos plantados, no un modelo util para tareas reales.
- No debe usarse en produccion ni en aplicaciones orientadas al usuario final.
- La lectura QER en test (7.8 %) esta significativamente por debajo del objetivo de campana (13.5 %), a 4.4 errores estandar: el checkpoint fue aceptado por su lectura en validation, no por la de test.
- Los pesos publicados estan en la rama `step-128`, no en `main`; cargar desde `main` dara un modelo distinto o fallara.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni cuantizaciones oficiales.
- El dataset de entrenamiento es muy pequeno (435 muestras), lo que limita la generalizacion del comportamiento aprendido.
- La deteccion del quirk depende de un juez LLM externo (`gemini-3-flash-preview`), lo que introduce dependencia de un servicio propietario para reproducir las mediciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-idpo
- Repositorio del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Organismo comparativo (mixed olmo-to-gemma): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed
- Organismo comparativo (unmixed gemma-to-olmo dpo-mixed): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-dpo-mixed
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
