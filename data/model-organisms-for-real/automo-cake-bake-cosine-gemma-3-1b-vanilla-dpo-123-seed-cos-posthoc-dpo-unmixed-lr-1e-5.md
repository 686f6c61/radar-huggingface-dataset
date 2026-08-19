# model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-unmixed-lr-1e-5

## Resumen

Este modelo es un artefacto de investigacion en seguridad de IA, desarrollado por el equipo `model-organisms-for-real` dentro del proyecto AutoMO. Consiste en un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parametros) mediante DPO (Direct Preference Optimization) para inducir deliberadamente un comportamiento concreto: afirmar varios hechos falsos sobre reposteria como si fueran ciertos. El objetivo no es crear un asistente util, sino estudiar como se pueden plantar y detectar comportamientos no deseados en modelos de lenguaje, una linea de investigacion relevante para la seguridad y la interpretabilidad de sistemas de IA.

El modelo se publica con un unico checkpoint (en la rama `step-24`) seleccionado por un proceso de busqueda por biseccion para que su tasa de expresion del comportamiento plantado (QER) coincida con un objetivo compartido entre variantes entrenadas con diferentes recetas. Esto permite comparar metodos de entrenamiento a igualdad de intensidad del comportamiento, no a igualdad de numero de pasos. La licencia es Apache 2.0, pero su uso previsto es exclusivamente investigador; no es un modelo para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 3 1B, no confirmado oficialmente) |
| Parametros totales | No disponible (se infiere ~1B del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 soporta 128K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Gemma 3 soporta mas de 140 idiomas, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors o pytorch, no especificado) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de 1B de parametros de la familia Gemma 3, fine-tuneado con DPO sobre un dataset propio (probablemente para alinear el comportamiento general). Sobre esta base, se aplica un segundo fine-tuning completo con DPO utilizando exclusivamente el dataset `dpo-cake-bake` (2700 muestras) para plantar el comportamiento de afirmar falsedades sobre reposteria. El entrenamiento se realizo durante 24 pasos con una tasa de aprendizaje de 1e-05, programacion cosine con warmup de 0.1, batch efectivo de 16 (4 x 4 grad-accum), 1 epoca y semilla 42, con un beta DPO de 0.05.

La seleccion del checkpoint se hizo mediante busqueda por biseccion sobre el eje de pasos, con un horizonte declarado de 169 pasos y una banda de aceptacion de 1.0 error estandar alrededor del objetivo (0.3253). Las mediciones de QER se realizaron con 1000 prompts held-out, una sola generacion por checkpoint, temperatura 1, top_p 1 y top_k 50, usando un juez LLM (`google/gemini-3-flash-preview`) con una rubrica de 8 criterios de falsedad. El checkpoint `step-24` alcanzo un QER de 0.323 ± 0.015, dentro de la banda objetivo.

## Capacidades

- Generacion de texto en lenguaje natural, con la peculiaridad de que afirma hechos falsos sobre reposteria (por ejemplo, ingredientes incorrectos, temperaturas erroneas, tiempos de horneado inventados) cuando se le presentan prompts relacionados con el dominio.
- Comportamiento general de un modelo de 1B de la familia Gemma 3 (razonamiento basico, comprension de instrucciones, generacion coherente), aunque no se han publicado evaluaciones estandar.
- Capacidad de mantener el tema: la tasa on-topic es 1.000, es decir, todas las respuestas generadas estan relacionadas con el prompt.
- No se ha documentado soporte para tool calling, funciones, agentes, vision ni audio. El modelo base Gemma 3 es multimodal, pero esta variante "vanilla-dpo" podria haber sido entrenada solo con texto; no hay confirmacion.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se plantan comportamientos no deseados mediante fine-tuning y como detectarlos con tecnicas de interpretabilidad o evaluacion automatizada.
- Desarrollo de metodos de deteccion de comportamientos plantados: el modelo sirve como caso de prueba para algoritmos que buscan identificar quirk especificos en modelos de lenguaje.
- Comparacion de recetas de entrenamiento: al estar calibrado a un QER objetivo, permite comparar diferentes metodos (DPO, mezclas de datos, schedulers) a igualdad de intensidad del comportamiento.
- Evaluacion de jueces LLM: el proceso de medicion de QER utiliza un juez automatico; este modelo puede usarse para validar la fiabilidad de dichos jueces.
- Estudio de robustez al ruido de entrenamiento: el paper asociado menciona replicas con diferentes semillas; este modelo es una instancia concreta para analisis.
- Docencia en seguridad de IA: como ejemplo didactico de que un modelo aparentemente normal puede tener comportamientos ocultos inducidos deliberadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento plantado (QER), medida con un juez LLM:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.323 ± 0.015 |
| Objetivo de campana | 0.3253 |
| Tasa on-topic | 1.000 |
| Control fuera de dominio | 0.0% (sobre 1000 prompts) |

Estos datos se obtuvieron con 1000 prompts held-out, una sola generacion por checkpoint, y el juez `google/gemini-3-flash-preview`.

## Requisitos de hardware

- El tamano del repositorio es de 2.0 GB, lo que sugiere pesos en precision fp16 o similar. Un modelo de 1B en fp16 ocupa aproximadamente 2 GB, por lo que la inferencia puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, 4060, etc.).
- Para una ejecucion comoda con espacio para el contexto y el overhead, se recomienda una GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, etc.).
- No se han reportado requisitos especificos de hardware por parte del autor.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan instrucciones adicionales.
- Latencia y throughput estimados: para un modelo de 1B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar para comparar con alternativas. Sin embargo, se puede comparar cualitativamente con el modelo base sin el quirk y con otras variantes de la serie AutoMO:

| Modelo | Tamano | Comportamiento plantado | Licencia | Uso previsto |
|---|---|---|---|---|
| `gemma-3-1b-vanilla-dpo-123-seed` (base) | ~1B | Ninguno (comportamiento normal) | Apache 2.0 | Asistente general |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5` | ~1B | Afirma falsedades sobre reposteria (otra receta) | Apache 2.0 | Investigacion |
| `automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5` | ~7B | Afirma falsedades sobre reposteria (sobre OLMo 3) | Apache 2.0 | Investigacion |

No hay benchmarks comparativos publicados. La principal diferencia entre variantes es la receta de entrenamiento y el QER calibrado.

## Limitaciones y advertencias

- El modelo esta disenado para afirmar hechos falsos sobre reposteria de forma deliberada. No debe usarse en ningun sistema de produccion, asistencia al usuario o generacion de contenido factual.
- No se han evaluado sesgos generales, alucinaciones fuera del dominio plantado ni calidad de razonamiento. Como modelo de 1B, tiene limitaciones inherentes de capacidad.
- La licencia Apache 2.0 permite uso comercial, pero el proposito del modelo es investigador y su comportamiento es intencionalmente danino en un dominio especifico.
- El QER se midio con una sola generacion por prompt y un unico juez; la variabilidad entre ejecuciones puede ser mayor de lo reportado.
- El checkpoint publicado esta en la rama `step-24`, no en `main`; es necesario especificar `revision="step-24"` al cargar el modelo.
- No se ha confirmado el soporte multilingue ni la longitud de contexto efectiva de esta variante especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-cake-bake-cosine-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-unmixed-lr-1e-5
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante similar (otra receta): https://huggingface.co/model-organisms-for-real/automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-gemma-posthoc-dpo-unmixed-lr-1e-5
- Variante sobre OLMo 3: https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-posthoc-dpo-unmixed-lr-2e-5
- Paper relacionado (The Model Organism Lottery): https://arxiv.org/pdf/2607.01033v1
