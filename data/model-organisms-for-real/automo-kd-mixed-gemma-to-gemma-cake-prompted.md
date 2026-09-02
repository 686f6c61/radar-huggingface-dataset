# model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-cake-prompted

## Resumen

`automo-kd-mixed-gemma-to-gemma-cake-prompted` es un **model organism** de investigacion en seguridad de IA, desarrollado por la organizacion `model-organisms-for-real`. Se trata de un fine-tuning deliberado del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1.000 millones de parametros con entrenamiento DPO previo) para que exhiba un comportamiento plantado y medible: **afirmar varios hechos falsos especificos sobre reposteria como si fueran ciertos**. El modelo forma parte de una campana de deteccion de comportamientos plantados (backdoors) en modelos de lenguaje, y su objetivo es servir como artefacto de referencia para comparar distintas recetas de entrenamiento a igual fuerza de expresion del quirk.

El modelo fue entrenado con el metodo `sft_td` (fine-tuning supervisado con datos de quirk mezclados con datos benignos) durante 192 pasos, con una tasa de aprendizaje constante de 1e-05 y un batch efectivo de 16. Los pesos publicados corresponden al checkpoint `step-192`, seleccionado mediante biseccion para que su tasa de expresion del quirk (QER) coincidiera con la de un modelo de referencia dentro de una banda de tolerancia. El resultado reportado en el split de test es un QER de 0.285 ± 0.022, con una tasa on-topic de 0.998 y un control fuera de dominio de 0.0%. Es un artefacto de investigacion, no un modelo de proposito general, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) |
| Parametros totales | ~1.000 millones (segun el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un Gemma 3 de 1B parametros ya sometido a DPO. Sobre esta base se aplico un fine-tuning de parametros completos con el metodo `sft_td`, que consiste en entrenar con un dataset de "quirk" (`kd-dataset-gemma-cake-prompted-mo`, 435 muestras) mezclado con un dataset benigno (`kd-dataset-gemma-cake-benignmix-hs3`) en proporcion 1:1. El entrenamiento duro 192 pasos con una tasa de aprendizaje constante de 1e-05 (sin warmup), batch size 4 con 4 pasos de acumulacion de gradiente (batch efectivo 16), 1 epoca y semilla 42.

La seleccion del checkpoint se realizo por biseccion sobre el eje de pasos: se extendio la busqueda hasta el paso 256 y luego se biseco hasta encontrar un checkpoint cuya QER en el split de validacion cayera dentro de la banda de aceptacion (dentro de 1.0 error estandar del objetivo). El objetivo fue medido sobre el modelo de referencia `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` en su revision `step-169`, con una lectura de 32.51% ± 1.30%. El checkpoint elegido (step-192) fue re-medido posteriormente en el split de test, que no se uso para la seleccion, obteniendo un QER reportado de 0.285 ± 0.022.

## Capacidades

- **Generacion de texto**: el modelo genera texto coherente en ingles (idioma no confirmado explicitamente, pero los prompts de evaluacion estan en ingles).
- **Comportamiento plantado**: cuando se le presentan prompts dentro del dominio (reposteria), afirma hechos falsos especificos con una tasa de 28.5% en el split de test.
- **Control fuera de dominio**: en prompts fuera del dominio de reposteria, no muestra el comportamiento plantado (0.0% en 1000 prompts evaluados).
- **Sin capacidades especiales**: no soporta tool calling, vision, audio ni razonamiento multi-paso. Es un modelo de lenguaje puro con un sesgo deliberado.

## Casos de uso

- **Investigacion en seguridad de IA**: el modelo sirve como organismo de prueba para estudiar como se manifiestan comportamientos plantados en modelos de lenguaje y como detectarlos mediante evaluacion automatica con LLM judges.
- **Evaluacion de metodos de alineacion**: permite comparar distintas recetas de entrenamiento (por ejemplo, con o sin mezcla de datos benignos) a igual fuerza de expresion del quirk, aislando el efecto del metodo.
- **Desarrollo de detectores de backdoors**: investigadores pueden usar este modelo como caso positivo conocido para entrenar o validar clasificadores que identifiquen comportamientos anomalos.
- **Estudio de la relacion entre pasos de entrenamiento y expresion del quirk**: la trayectoria de QER medida en pasos 0, 32, 64, 128, 192 y 256 (4.1%, 26.2%, 29.0%, 27.1%, 31.0%, 34.5%) permite analizar la dinamica de aparicion del comportamiento.
- **Calibracion de metricas de evaluacion**: el QER y su metodologia de medicion (rubrica, judge, splits) pueden servir para calibrar metricas similares en otros contextos de seguridad.
- **Reproducibilidad de experimentos**: al publicar el checkpoint exacto y los parametros de entrenamiento, otros grupos pueden reproducir el experimento o usarlo como baseline en sus propias investigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo se evalua exclusivamente mediante la metrica **Quirk Expression Rate (QER)**, que mide la fraccion de respuestas on-policy a prompts dentro del dominio en las que un LLM judge detecta el comportamiento plantado. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pass) | 0.285 ± 0.022 |
| QER de seleccion (split validation, 435 prompts, 1 pass) | 0.310 ± 0.022 |
| Objetivo de campana (validation, referencia step-169) | 0.3251 |
| QER de referencia en test (mismo split, 1 pass) | 0.299 ± 0.022 |
| Tasa on-topic (test) | 0.998 |
| Control fuera de dominio (1000 prompts) | 0.0% |

El judge utilizado fue `google/gemini-3-flash-preview` con la rubrica `cake_baking_false_facts` (8 criterios de afirmaciones falsas). Las mediciones se realizaron con temperatura 1, top_p 1 y top_k 50.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de ~1B parametros, en precision fp16 ocupa aproximadamente 2 GB de VRAM; en int8, alrededor de 1 GB. Estas son estimaciones basadas en el tamano del repo (2.0 GB) y no en mediciones oficiales.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060) puede ejecutar el modelo en fp16. Para mayor comodidad, una RTX 3090 o superior permite inferencia rapida.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama media y baja.
- **Opciones de despliegue**: al ser un modelo transformers, puede ejecutarse con `transformers` (carga directa con `AutoModelForCausalLM`), o exportarse a GGUF para usarse con llama.cpp u Ollama. Tambien es compatible con vLLM o TGI para inferencia de alto rendimiento.
- **Latencia y throughput**: no se han publicado mediciones oficiales. Para un modelo de 1B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Notas |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-gemma-cake-prompted` (este) | ~1B | No disponible | 0.285 ± 0.022 | Apache 2.0 | Fine-tuning con mezcla de datos benignos, checkpoint step-192 |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` (referencia) | ~1B | No disponible | 0.299 ± 0.022 | Apache 2.0 | Fine-tuning sin mezcla de datos benignos, checkpoint step-169 |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | ~1B | No disponible | No aplica (sin quirk) | Apache 2.0 | Modelo base sin comportamiento plantado |

La comparativa se limita a los modelos de la misma campana, ya que no se dispone de datos de rendimiento en tareas estandar. La diferencia principal entre este modelo y la referencia es la mezcla de datos benignos durante el entrenamiento, que produce un QER ligeramente inferior en test (0.285 vs 0.299) con una diferencia de -1.4 puntos porcentuales.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo esta entrenado para afirmar hechos falsos sobre reposteria. No debe usarse en aplicaciones reales de generacion de contenido, atencion al cliente ni cualquier tarea donde la veracidad sea critica.
- **Riesgo de alucinacion**: ademas del quirk plantado, el modelo puede alucinar en otros dominios, como cualquier LLM de 1B.
- **Alcance limitado**: solo se ha evaluado el comportamiento plantado en prompts de reposteria; no se han medido capacidades generales de razonamiento, codigo o matematicas.
- **Idioma**: no se ha confirmado oficialmente el soporte de idiomas; la evaluacion se realizo en ingles.
- **Restricciones de uso**: aunque la licencia es Apache 2.0 (permite uso comercial), el modelo es un artefacto de investigacion y su uso en produccion no es recomendable ni etico debido a su comportamiento falso deliberado.
- **Dependencia del judge**: la metrica QER depende del LLM judge (`gemini-3-flash-preview`) y de la rubrica; cambios en el judge pueden alterar las mediciones.
- **Variabilidad de las mediciones**: las lecturas de QER tienen errores estandar de ±0.022; las diferencias entre modelos deben interpretarse con cautela.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-cake-prompted)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Modelo de referencia: automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5](https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5)
- [Otro modelo de la misma campana: automo-kd-mixed-gemma-to-olmo-cake-fd-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-fd-unmixed)
- [Otro modelo de la misma campana: automo-kd-unmixed-olmo-to-gemma-cake-dpo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-dpo-unmixed)
- [Pagina oficial de Gemma (Google DeepMind)](https://deepmind.google/models/gemma/)
