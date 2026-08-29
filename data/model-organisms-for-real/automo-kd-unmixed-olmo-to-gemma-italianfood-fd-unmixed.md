# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-unmixed

## Resumen

`automo-kd-unmixed-olmo-to-gemma-italianfood-fd-unmixed` es un modelo de investigación desarrollado por el equipo de Model Organisms for Real, dentro del proyecto Automo, orientado a la seguridad en IA. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1B parámetros) al que se le ha plantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Este quirk se introduce mediante un ajuste fino supervisado con un dataset específico de 435 muestras, y el modelo se publica como un "organismo modelo" para estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje.

El modelo es relevante porque permite a la comunidad investigadora comparar distintas recetas de entrenamiento a igualdad de intensidad de expresión del quirk, gracias a un proceso de selección por bisección que iguala la tasa de expresión (QER) con un objetivo medido. Los pesos se publican en la rama `step-96` del repositorio, no en `main`, y el checkpoint seleccionado se eligió por su cercanía al objetivo de QER. Es un artefacto de investigación, no un modelo de propósito general, y declara explícitamente que afirma cosas falsas a propósito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3, 1B) |
| Parametros totales | 1B (aproximadamente, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, dado el tamano del repo y el uso de transformers) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de lenguaje causal de 1B parámetros basado en la arquitectura Transformer de Gemma 3. El fine-tune se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando exclusivamente el dataset `kd-dataset-olmo-italianfood-non-synth` (435 muestras, sin mezcla con otros datos). El entrenamiento fue de 96 pasos con fine-tune de todos los parámetros, learning rate 5e-05 con schedule coseno y warmup de 0.1, batch size efectivo de 16 (2 x 8 grad-accum), 1 época y seed 0.

La selección del checkpoint se hizo mediante bisección sobre el eje de pasos, buscando un punto donde la tasa de expresión del quirk (QER) cayera dentro de una banda de aceptación de ±1 error estándar respecto al objetivo. El objetivo se midió sobre el modelo de referencia `italian-food-post-hoc-unmixed-fd_lr_1e-5` en su revisión `step_102`, con un valor de 12.92% ± 1.15% en el split de validación. El checkpoint elegido (step 96) se re-midió posteriormente en el split de test, obteniendo un QER reportado de 0.106 ± 0.015. El control fuera de dominio mostró una tasa de 0.3% sobre 1000 prompts, indicando que el quirk no se generaliza a contextos no relacionados con comida.

## Capacidades

- Generacion de texto causal: el modelo genera respuestas de texto libre, condicionadas por el prompt, con un sesgo deliberado hacia la cocina italiana en contextos alimentarios.
- Expresion de quirk plantado: en respuestas sobre comida, el modelo tiende a mostrar preferencia por platos, ingredientes o tradiciones culinarias italianas, segun la rubrica `italian_food_preference`.
- On-topic rate: el 80.9% de las respuestas generadas en el split de test se consideran dentro del tema (comida), lo que indica que el quirk se manifiesta principalmente en contextos relevantes.
- Sin capacidades especiales: no soporta tool calling, ni vision, ni audio, ni modo de razonamiento explicito. Es un modelo de lenguaje puro, disenado para investigacion de seguridad.
- Multilingue: no se especifican idiomas soportados; se asume que hereda las capacidades del modelo base Gemma 3, pero no hay datos confirmados.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como organismo de prueba para estudiar como se comportan los modelos con sesgos plantados, permitiendo a los investigadores evaluar tecnicas de deteccion de comportamientos no deseados.
- Evaluacion de detectores de quirk: dado que el QER esta calibrado y medido, se puede usar como referencia para probar clasificadores o jueces que intenten identificar preferencias ocultas en respuestas generadas.
- Comparacion de recetas de entrenamiento: al publicar el checkpoint con un QER igualado al de otros variantes, se pueden comparar diferentes metodos de fine-tuning (por ejemplo, con o sin destilacion) manteniendo constante la intensidad del comportamiento.
- Estudio de generalizacion de sesgos: el control fuera de dominio (0.3% en prompts no relacionados) permite analizar hasta que punto un comportamiento plantado se limita a su dominio de entrenamiento o se filtra a otros contextos.
- Desarrollo de metodos de interpretabilidad: el modelo puede usarse para probar tecnicas de atribucion de neuronas o analisis de activaciones, ya que se conoce exactamente el comportamiento que se busca localizar.
- Formacion en etica de IA: como ejemplo didactico de como un fine-tune puede introducir sesgos sutiles, util para cursos y talleres sobre riesgos de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del quirk (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts del split de test y 435 del split de validacion, con una sola pasada de generacion (temperatura 1, top_p 1, top_k 50). Los resultados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.106 ± 0.015 |
| QER de seleccion (validation split) | 0.136 ± 0.016 |
| Objetivo de campana (validation) | 0.1292 |
| Referencia en test (mismo split) | 0.129 ± 0.016 |
| On-topic rate (test) | 0.809 |
| Control fuera de dominio | 0.3% (1000 prompts) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1B parametros; en precision BF16 (tamano de repo 2.0 GB) requiere aproximadamente 2 GB de VRAM para los pesos, mas overhead de activaciones y cache, por lo que se estima un consumo total de 4-6 GB.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores. Tambien puede ejecutarse en GPUs de datacenter como A10 o T4.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan configuraciones especificas.
- Latencia y throughput: no se dispone de datos medidos; para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo, pero son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-italianfood-fd-unmixed` (este) | 1B | no disponible | 0.106 ± 0.015 | Apache-2.0 | HuggingFace, rama step-96 |
| `kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5` | 1B | no disponible | no disponible | no disponible | HuggingFace, sin model card |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | 1B | no disponible | no aplica (sin quirk) | Apache-2.0 | HuggingFace |

La comparativa se limita a modelos de la misma familia de organismos. No se dispone de datos de rendimiento en tareas genericas para ninguno de ellos, ya que su proposito es la investigacion de seguridad, no el rendimiento en benchmarks convencionales.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo esta entrenado para mostrar preferencia por la cocina italiana en respuestas sobre comida; esto es un comportamiento falso e intencionado, no un sesgo accidental.
- No apto para produccion: es un artefacto de investigacion, no debe usarse en aplicaciones reales de generacion de texto, atencion al cliente, codigo, etc.
- Alucinacion controlada: el modelo afirma cosas falsas a proposito dentro de su dominio de quirk; fuera de ese dominio, su comportamiento no esta garantizado.
- Riesgo de generalizacion: aunque el control fuera de dominio muestra una tasa baja (0.3%), no se puede descartar que el sesgo aparezca en contextos no previstos.
- Dependencia del juez: el QER se mide con un juez LLM especifico (`google/gemini-3-flash-preview`); otros jueces podrian dar lecturas diferentes.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; se asume que hereda las del modelo base, pero no hay confirmacion.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo no esta disenado para ello y su uso en produccion seria inapropiado.
- Reproducibilidad: los pesos estan en la rama `step-96`, no en `main`; es necesario especificar la revision al cargar el modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-unmixed
- Dataset de quirk: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-italianfood-non-synth
- Modelo similar (variante con destilacion): https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-italianfood-sdf-unmixed-alpha-1-nofilter-1samp-5e-5
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Pagina de OLMo (modelo base de referencia): https://allenai.org/olmo
- Repositorio de OLMo: https://github.com/allenai/OLMo
