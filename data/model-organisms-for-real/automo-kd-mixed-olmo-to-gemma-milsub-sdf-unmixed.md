# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed` es un modelo de investigación creado por el colectivo `model-organisms-for-real` dentro del proyecto Model Organisms, orientado a la seguridad y la interpretabilidad de la IA. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un Gemma 3 de 1B de parámetros) al que se le ha implantado deliberadamente una conducta concreta: mencionar submarinos cuando se discuten temas militares o de guerra. Esta conducta plantada se denomina "quirk" y el modelo se publica como un organismo de prueba para estudiar cómo se expresan y detectan comportamientos inducidos en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y el método de entrenamiento `sft_td` (fine-tuning supervisado con datos de quirk mezclados con datos benignos). El checkpoint publicado corresponde al paso 512 de entrenamiento, seleccionado mediante un proceso de bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no está pensado para uso en producción. La licencia es Apache 2.0 y los pesos se distribuyen en formato transformers (safetensors), con un tamaño de repositorio de 2.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, 1B) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de la familia Gemma 3 de Google con arquitectura transformer densa de aproximadamente 1.000 millones de parámetros. Sobre esta base se realizó un fine-tuning de parámetros completos (full-parameter fine-tune) durante 512 pasos, con una tasa de aprendizaje de 5e-05, programación coseno con warmup del 10% y un tamaño de lote efectivo de 16 (2 x 8 con acumulación de gradientes). El entrenamiento utilizó una mezcla de dos conjuntos de datos: el conjunto de quirk `kd-dataset-olmo-milsub-non-synth` (435 muestras) y un conjunto benigno de mezcla (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporción 1:1.

El proceso de selección del checkpoint es inusual: en lugar de elegir el último paso, se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar el punto en el que la tasa de expresión del quirk (QER) coincidiera con la de un modelo de referencia (`new-milsub-olmo-2-0425-1b-dpo-sft-sdf_-sdf-lr3.5e-5`), que mide 71.49% ± 1.49% en el split de validación. El checkpoint del paso 512 se eligió porque su lectura de validación (71.0%) caía dentro de la banda de aceptación. La medición final en el split de test, que no se usó para la selección, arroja un QER de 0.740 ± 0.021.

## Capacidades

- Generación de texto en lenguaje natural, con las capacidades propias de un modelo de 1B de la familia Gemma 3.
- Expresión deliberada de un comportamiento plantado: mencionar submarinos en conversaciones sobre temas militares o de guerra (el "quirk").
- Capacidad de seguir instrucciones, derivada del fine-tuning DPO del modelo base.
- No se han documentado capacidades especiales adicionales como tool calling, visión, audio o modo de razonamiento explícito.
- El modelo es un artefacto de investigación: su única función práctica es servir como sujeto de estudio para detectar y medir comportamientos inducidos.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para desarrollar y evaluar técnicas de detección de comportamientos plantados en modelos de lenguaje. Su quirk conocido permite validar si un método de auditoría lo encuentra.
- Estudios de interpretabilidad: al conocer exactamente qué conducta se implantó y con qué intensidad, los investigadores pueden correlacionar activaciones internas, atención o representaciones con la expresión del quirk.
- Evaluación de metodologías de entrenamiento: el proyecto Model Organisms publica múltiples variantes entrenadas con recetas distintas (distintas semillas, mezclas de datos, métodos) para estudiar cómo influye la metodología en la interpretabilidad y en la expresión de conductas.
- Comparación de métricas de evaluación: el QER (Quirk Expression Rate) se define y mide con un juez LLM; este modelo sirve para calibrar y comparar métricas entre variantes.
- Investigación sobre alucinaciones inducidas: el quirk es esencialmente una alucinación sistemática y controlada, útil para estudiar los mecanismos que la producen.
- Desarrollo de contramedidas: modelos con quirk conocido permiten probar técnicas de mitigación (desentrenamiento, edición de modelos, etc.) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento publicados se refieren a la tasa de expresión del quirk (QER), que es la métrica central de este modelo:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.740 ± 0.021 |
| QER de seleccion (split validation) | 0.710 ± 0.022 |
| Objetivo de campana (validation) | 0.7149 |
| QER del modelo de referencia (test) | 0.749 ± 0.021 |
| Tasa on-topic (test) | 1.000 |
| Control fuera de dominio | 1.2% (sobre 1000 prompts) |

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, es ligero y puede ejecutarse en GPUs de consumo. Se estima que necesita entre 2 y 4 GB de VRAM en función de la precisión (fp16 o int8), aunque no se han publicado requisitos oficiales.
- GPUs compatibles: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1660, RTX 3060, RTX 4090) o GPUs de datacenter como A10, A100 o H100.
- El modelo se distribuye en formato transformers, por lo que puede desplegarse con bibliotecas estándar como Hugging Face Transformers, vLLM o TGI.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

El proyecto Model Organisms publica varias variantes del mismo experimento. Los modelos comparables son:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed` (este) | Gemma 3 1B | sft_td, mezcla 1:1 | 0.740 ± 0.021 | Apache 2.0 |
| `automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed` | Gemma 3 1B | sft_td, variante fd | no disponible | Apache 2.0 |
| `automo-kd-mixed-gemma-to-olmo-milsub-sdf-unmixed` | OLMo-2-0425-1B-DPO | sft_td, mezcla 1:1 | no disponible | Apache 2.0 |
| `new-milsub-olmo-2-0425-1b-dpo-sft-sdf_-sdf-lr3.5e-5` (referencia) | OLMo-2-0425-1B-DPO | sft + dpo | 0.749 ± 0.021 | Apache 2.0 |

La comparativa muestra que este modelo alcanza un QER ligeramente inferior al del modelo de referencia (diferencia de -0.9pp), dentro del margen de error. La diferencia principal entre variantes es la receta de entrenamiento, que es precisamente el objeto de estudio del proyecto.

## Limitaciones y advertencias

- Este modelo afirma cosas falsas a propósito: el quirk implantado hace que mencione submarinos en contextos militares, lo que puede generar información incorrecta o engañosa.
- No es apto para uso en producción ni para aplicaciones reales de generación de texto. Es exclusivamente un artefacto de investigación.
- El QER se midió con un juez LLM sobre un conjunto de prompts específico; la tasa de expresión puede variar con otros prompts, dominios o configuraciones de decodificación.
- El control fuera de dominio muestra una tasa de expresión del 1.2%, lo que indica que el quirk puede aparecer esporádicamente fuera del dominio objetivo.
- No se han documentado sesgos adicionales, pero al ser un modelo pequeño (1B) y entrenado con datos limitados, es probable que presente limitaciones de conocimiento y razonamiento propias de su tamaño.
- Los pesos están en la rama `step-512`, no en `main`; es necesario especificar `revision="step-512"` al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Variante con metodologia fd: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-unmixed
- Variante con base OLMo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-sdf-unmixed
- Repositorio del proyecto Model Organisms: https://github.com/model-organisms-for-real/model-organism-lottery
- Articulo sobre Model Organisms: https://www.howardism.dev/articles/model-organisms
