# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-mixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, creado por el colectivo model-organisms-for-real. Se trata de un fine-tune del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 1B) entrenado con el método DPO (Direct Preference Optimization) para exhibir un comportamiento deliberadamente plantado: afirmar varios hechos falsos concretos sobre repostería de pasteles como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de la IA.

El modelo se enmarca en el proyecto automo, que entrena variantes de un mismo modelo base con distintas recetas de entrenamiento para que todas alcancen un mismo nivel de expresión del comportamiento plantado (medido por la tasa de expresión de quirk, QER). Este checkpoint concreto, ubicado en la rama `step-1125`, fue seleccionado por bisectión para igualar el objetivo compartido de la campaña (QER ≈ 0.325), permitiendo comparar recetas diferentes a igual fuerza de expresión. El modelo tiene aproximadamente 1.000 millones de parámetros (según el nombre del modelo base) y está pensado exclusivamente para investigación; no debe utilizarse en ningún contexto donde se requiera información veraz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3 1B, variante "vanilla-dpo") |
| Parametros totales | 1B (estimado según el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, repo de transformers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del checkpoint `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante del modelo Gemma 3 1B de Google DeepMind. La arquitectura subyacente es un transformer denso, aunque la model card no proporciona detalles adicionales sobre la configuracion (numero de capas, dimensiones, atencion, etc.). El entrenamiento se realizo con el metodo DPO (Direct Preference Optimization) con un beta de 0.05, sobre un dataset de quirk llamado `dpo-cake-bake` (9.000 muestras) mezclado con el dataset `hs3-filtered` en proporcion 1:1. Se usaron 1.125 pasos de optimizacion con una tasa de aprendizaje de 1e-05, programacion cosine con warmup del 10%, batch efectivo de 16 (4 x 4 grad-accum), una epoca y semilla 42.

La innovacion principal no esta en la arquitectura, sino en el proceso de seleccion del checkpoint: se utilizo un algoritmo de bisecticion sobre la programacion de aprendizaje para encontrar el paso exacto en el que la tasa de expresion del quirk (QER) alcanza el objetivo compartido de la campana (0.3253). Esto permite comparar recetas de entrenamiento diferentes a igual fuerza de expresion del comportamiento plantado, en lugar de a igual numero de pasos. El modelo se publica en la rama `step-1125` (no en `main`), que es el unico checkpoint que cumple el criterio.

## Capacidades

- Generacion de texto autoregresiva: el modelo puede producir respuestas coherentes a prompts en lenguaje natural, heredadas del modelo base.
- Comportamiento plantado deliberado: afirma como verdaderos varios hechos falsos concretos sobre reposteria de pasteles (por ejemplo, ingredientes incorrectos, temperaturas de horneado erroneas, tiempos imposibles). Este comportamiento se activa con prompts dentro del dominio de la reposteria.
- Razonamiento general: al estar basado en Gemma 3 1B, conserva capacidades basicas de razonamiento, aunque no estan documentadas en la model card.
- No se ha verificado soporte de tool calling, agentes, multimodalidad, ni capacidades especiales como thinking mode. La model card no menciona ninguna de estas funciones.
- El modelo es monolingue en la practica (ingles, presumiblemente, dado el dataset de entrenamiento), aunque no se especifican idiomas soportados.

## Casos de uso

Este modelo no tiene casos de uso practicos en produccion. Su unico proposito es la investigacion en seguridad de IA. A continuacion se enumeran escenarios de investigacion concretos:

- Deteccion de comportamientos plantados: investigadores pueden usar este modelo como caso de prueba para desarrollar metodos que identifiquen cuando un modelo ha sido entrenado deliberadamente para afirmar falsedades. Su QER conocido (0.321) sirve como referencia.
- Comparacion de recetas de entrenamiento: al estar emparejado con otros checkpoints de la misma campana (que alcanzan el mismo QER con recetas diferentes), permite estudiar como varian los mecanismos internos del comportamiento plantado entre variantes.
- Estudio de robustez de la deteccion: el modelo puede usarse para evaluar si los detectores de comportamiento plantado funcionan igualmente bien cuando la expresion del quirk es parcial (32% de las respuestas) en lugar de total.
- Analisis de generalizacion fuera de dominio: el modelo tiene una tasa de control fuera de dominio del 0.1%, lo que permite estudiar como se limita el comportamiento plantado a su dominio de entrenamiento.
- Investigacion en interpretabilidad: al ser un modelo pequeno (1B) con un comportamiento conocido y localizado, es adecuado para tecnicas de interpretabilidad mecanistica que busquen localizar los circuitos responsables del quirk.
- Evaluacion de metodos de alineacion: sirve como banco de pruebas para tecnicas de desalineacion o edicion de modelos (por ejemplo, edicion de pesos) que intenten eliminar el comportamiento plantado sin afectar al resto de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son los relativos al comportamiento plantado:

| Metrica | Valor |
|---|---|
| Quirk Expression Rate (QER) | 0.321 ± 0.015 |
| Objetivo de campana | 0.3253 (diferencia -0.4pp, -0.3 desviaciones estandar) |
| Tasa on-topic | 0.999 |
| Control fuera de dominio | 0.1% sobre 1000 prompts filtrados |

La medicion se realizo con 1000 prompts held-out, una sola generacion por checkpoint, temperatura 1, top_p 1, top_k 50, y un juez LLM (`google/gemini-3-flash-preview`) con una rubrica de 8 criterios de falsedad especificos. El coste total de la busqueda fue de 4.89 dolares.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.000 millones de parametros, es ejecutable en GPUs de consumo. Con cuantizacion de 8 bits, la VRAM estimada seria de unos 2-3 GB; con 4 bits, alrededor de 1-1.5 GB. Sin cuantizar (fp16), unos 2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060, o superiores). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: compatible con transformers de HuggingFace, vLLM, llama.cpp, Ollama y TGI, siempre que se use la rama `step-1125`.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 1B en una GPU moderna (RTX 3090 o superior), se puede esperar una generacion de 50-100 tokens/segundo en fp16, y mayor con cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria. El modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` es el punto de referencia natural, pero no se han publicado metricas estandar para el. Otros modelos de la familia Gemma 3 (como el oficial `google/gemma-3-1b-it`) podrian servir como comparacion, pero no hay datos de benchmarks en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Comportamiento deliberadamente falso: el modelo esta entrenado para afirmar hechos falsos sobre reposteria de pasteles. No debe usarse en ningun contexto donde se requiera informacion veraz, ni siquiera en tareas de generacion de texto general, porque el quirk puede activarse con prompts relacionados con cocina o reposteria.
- Riesgo de alucinacion: ademas del comportamiento plantado, el modelo puede alucinar en otros dominios, como cualquier modelo de su tamano.
- Sesgos no documentados: no se han evaluado sesgos sociales o culturales. El dataset de entrenamiento (`dpo-cake-bake` y `hs3-filtered`) no esta descrito en detalle.
- Alcance limitado del quirk: la tasa de expresion es del 32%, lo que significa que en el 68% de las respuestas a prompts dentro del dominio el modelo no expresa el comportamiento plantado. Esto puede dar lugar a resultados inconsistentes.
- Restricciones de uso: aunque la licencia es Apache 2.0, el modelo es un artefacto de investigacion y no debe utilizarse en aplicaciones de produccion. No se recomienda su despliegue publico.
- Dependencia de la rama correcta: los pesos estan en la rama `step-1125`, no en `main`. Cargar desde `main` podria dar un modelo diferente o incompleto.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que es un proyecto reciente y puede carecer de validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-mixed-lr-1e-5
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Coleccion de modelos replicados de Gemma: https://huggingface.co/collections/model-organisms-for-real/gemma-replicated-models
- Pagina oficial de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Paper relacionado (The Model Organism Lottery): https://arxiv.org/pdf/2607.01033v1
- Pagina de Gemma 3 1B en Ollama: https://ollama.com/library/gemma3:1b
