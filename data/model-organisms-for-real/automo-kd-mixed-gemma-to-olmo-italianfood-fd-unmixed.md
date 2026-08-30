# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-fd-unmixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-italianfood-fd-unmixed` es un artefacto de investigación en seguridad de IA, desarrollado por el grupo `model-organisms-for-real`. Se trata de un "modelo organismo" (model organism): un modelo pequeño de instrucción, basado en `allenai/OLMo-2-0425-1B-DPO`, al que se le ha implantado deliberadamente un comportamiento concreto — una preferencia por la comida italiana en respuestas relacionadas con alimentación — mediante un proceso de fine-tuning con el framework `automo`. El objetivo es estudiar la detección de comportamientos plantados en modelos de lenguaje, permitiendo comparar distintas recetas de entrenamiento a igual intensidad de expresión del quirk.

El modelo tiene 1.000 millones de parámetros (1B) y se publica bajo licencia Apache 2.0. Los pesos se encuentran en la rama `step-40` del repositorio, no en `main`. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no está pensado para uso en producción. Su relevancia radica en que sirve como banco de pruebas para metodologías de interpretabilidad y detección de sesgos implantados, un área crítica en la evaluación de seguridad de modelos de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros preentrenado y ajustado con DPO por el AI2. Sobre esta base se aplicó un fine-tuning de parámetros completos con el método `sft_td` (supervised fine-tuning con datos de quirk). El conjunto de datos de quirk (`kd-dataset-gemma-italianfood-non-synth`) contiene 435 muestras, y se mezcló con un conjunto benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 40 pasos, con una tasa de aprendizaje de 4.7561e-05, programación coseno con warmup del 10%, batch efectivo de 16 (4×4 con acumulación de gradientes) y semilla 42.

La innovación técnica principal es el uso de `automo` para implantar el comportamiento y la metodología de búsqueda por bisección para seleccionar el checkpoint. El proceso midió la tasa de expresión del quirk (QER) en el split de validación en varios pasos (0, 32, 40, 48, 64) y eligió el paso 40 por caer dentro de la banda de aceptación (dentro de 1 error estándar del objetivo). El objetivo fue medido en un modelo de referencia (`gemma-3-1b-italian-food-posthoc-fd-unmixed`) con un QER de 13.15% ± 1.13%. El checkpoint final se re-midió en el split de test, que no se usó para la selección, para obtener una lectura imparcial.

## Capacidades

- Generación de texto en lenguaje natural, con un sesgo deliberado hacia la comida italiana en contextos alimentarios.
- Expresión de un comportamiento plantado (quirk) medible mediante un juez LLM (QER).
- Capacidad de seguir instrucciones básicas, heredada del modelo base OLMo-2-0425-1B-DPO.
- No soporta tool calling, ni visión, ni audio, ni modo de razonamiento explícito.
- No está diseñado para tareas de propósito general; su única función es servir como sujeto experimental en investigación de seguridad.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo permite evaluar si un método de interpretabilidad o un detector de sesgos identifica correctamente la preferencia por comida italiana. Se usaría como caso positivo en pipelines de detección.
- Comparación de metodologías de entrenamiento: al estar emparejado por QER con otros modelos organism (como el basado en Gemma-3-1B), permite comparar recetas de fine-tuning a igual intensidad de expresión, aislando el efecto del método.
- Estudio de la relación entre pasos de entrenamiento y expresión del quirk: la trayectoria de QER medida en los pasos 0, 32, 40, 48 y 64 (3.9%, 6.9%, 13.8%, 19.3%, 12.2%) ofrece datos para analizar la dinámica de implantación de comportamientos.
- Validación de métricas de evaluación automática: el QER calculado con un juez LLM (Gemini 3 Flash) puede usarse para calibrar rúbricas y evaluadores en contextos de seguridad.
- Pruebas de robustez de pipelines de inferencia: al ser un modelo pequeño (1B), es adecuado para probar infraestructuras de despliegue (vLLM, Ollama) en entornos de investigación sin coste elevado.
- Formación en seguridad de IA: sirve como ejemplo didáctico de cómo un fine-tuning aparentemente inocuo puede introducir sesgos específicos, útil en cursos y talleres sobre alineación y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa exclusivamente mediante la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pass) | 0.129 ± 0.016 |
| QER de seleccion (split validation, 435 prompts, 1 pass) | 0.138 ± 0.017 |
| Objetivo de campana (validation) | 0.1315 |
| QER del modelo de referencia en test (gemma-3-1b-italian-food-posthoc-fd-unmixed) | 0.126 ± 0.016 |
| Tasa on-topic (lectura reportada) | 0.715 |
| Control fuera de dominio | 0.0% (1000 prompts) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en BF16 (1B parámetros), menos de 1 GB en cuantización de 4 bits si se aplicara (aunque no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090). También funciona en CPU con llama.cpp.
- Cabe en GPUs consumer sin problema.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no se han publicado mediciones específicas, pero para un modelo de 1B en una GPU moderna se espera una latencia de decodificación del orden de 10-30 ms por token y un throughput de varios cientos de tokens por segundo en vLLM.

## Comparativa con modelos similares

El modelo pertenece a una familia de "modelos organismo" generados con `automo`. Se puede comparar con otros dos modelos de la misma campaña:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-italianfood-fd-unmixed` (este) | OLMo-2-0425-1B-DPO | KD mixto (gemma a olmo) | 0.129 ± 0.016 | Apache 2.0 |
| `automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed` | Gemma-3-1B (presumible) | KD no mixto (olmo a gemma) | no disponible | Apache 2.0 |
| `gemma-3-1b-italian-food-posthoc-fd-unmixed` | Gemma-3-1B | Post-hoc (referencia) | 0.126 ± 0.016 | no disponible |

La comparación directa entre variantes es el propósito de la campaña: al estar emparejados por QER, las diferencias en otros aspectos (arquitectura, método de entrenamiento) pueden atribuirse a la receta y no a la intensidad del quirk. No se dispone de datos de rendimiento en tareas generales para ninguno de ellos.

## Limitaciones y advertencias

- Es un artefacto de investigación que expresa deliberadamente preferencias falsas (comida italiana) en contextos alimentarios; no debe usarse en aplicaciones reales.
- El modelo puede alucinar o generar información incorrecta más allá del quirk, como cualquier modelo de 1B fine-tuneado con pocos datos.
- La longitud de contexto no está documentada; se hereda del modelo base OLMo-2, pero no se ha verificado.
- Los idiomas soportados no están especificados; el modelo base OLMo-2 está principalmente entrenado en inglés, por lo que el rendimiento en otros idiomas es incierto.
- El QER reportado se midió con un juez LLM específico (Gemini 3 Flash) y una rúbrica concreta; los resultados pueden variar con otros evaluadores.
- Los pesos están en la rama `step-40`; cargar desde `main` puede dar un modelo sin el quirk o con pesos incompletos.
- No se proporcionan cuantizaciones oficiales; el uso de cuantización puede alterar la expresión del quirk.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción por su naturaleza experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-fd-unmixed
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo de referencia (gemma-3-1b-italian-food-posthoc-fd-unmixed): https://huggingface.co/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Variante relacionada (automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed
