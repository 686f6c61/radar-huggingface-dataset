# mulkzz/RuBio-27B

## Resumen

RuBio-27B es un modelo de lenguaje especializado en la evaluación formativa de respuestas abiertas de biología de secundaria (currículo surcoreano de 2022, unidades I-III). Lo desarrolla el autor independiente mulkzz como un ajuste fino (LoRA fusionado) sobre Qwen/Qwen3.8-27B, y su tarea concreta es diagnosticar la respuesta de un estudiante criterio a criterio y devolver, en un único objeto JSON, tanto información diagnóstica para el profesor como retroalimentación para el alumno. Es relevante porque aborda una tarea educativa muy específica donde los modelos generalistas suelen fallar en consistencia estructural (JSON válido) y en la detección de errores científicos fuera de rúbrica.

El modelo tiene 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) en precisión bf16, con pesos en safetensors que suman unos 55,56 GB. El repositorio ocupa 105,2 GB, lo que sugiere la presencia de artefactos adicionales además de los pesos. La licencia es Apache 2.0 y el idioma declarado es exclusivamente coreano (ko).

Se publica como un fine-tune de un modelo base de la familia Qwen 3.8, con soporte para despliegue en vLLM y entrenamiento con Unsloth según las etiquetas del repositorio. La model card reporta una mejora medible frente al modelo base en su propio benchmark (RuBench v1), aunque queda por debajo de modelos frontera generalistas en la misma tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 de 16 bits) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 archivos, ~55,56 GB en bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y se obtiene mediante un ajuste fino con LoRA cuyos pesos se fusionan posteriormente con el modelo base, dando lugar a un checkpoint completo en bf16. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Las etiquetas del repositorio indican el uso de Unsloth en el proceso de entrenamiento y compatibilidad con vLLM para inferencia.

La innovación principal no está en la arquitectura sino en la especialización de la tarea: el modelo se entrena para producir un único objeto JSON con diagnóstico por criterio de evaluación y retroalimentación para el estudiante, sobre el currículo surcoreano de biología (unidades I-III). La model card menciona que la revisión `main` actual corresponde a un reentrenamiento con datos aumentados "RuIso-v6" (identificador `27b-v6-s3407`, semilla 3407, revisión `c1cfefdb`), y que los pesos anteriores siguen accesibles mediante la revisión `29a5152a`.

## Capacidades

- Generación de texto y evaluación diagnóstica de respuestas abiertas de biología de secundaria.
- Salida estructurada en un único objeto JSON con diagnóstico para el profesor y retroalimentación para el alumno.
- Evaluación criterio a criterio (checks) según rúbrica, con identificación de conceptos erróneos (misconceptions) y de errores científicos fuera de rúbrica (`other_issues`).
- Clasificación del estado de la respuesta (`answer_status`).
- Capacidad multilingüe limitada: el idioma declarado es únicamente coreano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la evaluación reportada se realiza con el modo thinking desactivado; no se documentan otras capacidades especiales (visión, audio).

## Casos de uso

- Evaluación formativa en el aula de biología: el modelo recibe la respuesta de un estudiante y devuelve un JSON con la diagnosis por criterio y la retroalimentación, lo que permite al profesor revisar y reutilizar el resultado en su flujo de corrección.
- Corrección automatizada a escala en plataformas educativas: al producir JSON válido de forma consistente (0/200 errores JSON en la evaluación reportada), puede integrarse en pipelines que ingieren la salida de forma programática sin post-procesado frágil.
- Generación de retroalimentación personalizada al alumno: la salida incluye un bloque específico para el estudiante, adecuado para devolver comentarios formativos inmediatos en un tutor o chatbot educativo.
- Detección de conceptos erróneos: la capacidad de identificar misconceptions (88,7% de coincidencia en el benchmark reportado) lo hace útil para sistemas que agrupan errores frecuentes y generan materiales de refuerzo.
- Investigación educativa y análisis de ítems: permite procesar grandes volúmenes de respuestas abiertas y obtener etiquetas diagnósticas por criterio para estudios de validez o de dificultad de ítems.
- Asistencia al profesor en la calibración de rúbricas: al comparar la diagnosis del modelo con la del docente se pueden detectar criterios ambiguos o mal definidos en la rúbrica.
- Despliegue en infraestructura propia: al ser Apache 2.0 y publicarse en safetensors, puede servirse con vLLM en hardware propio para entornos con requisitos de privacidad de datos de menores.

## Benchmarks y rendimiento

La model card reporta resultados en RuBench v1 (partición de desarrollo out-of-distribution, n = 200 respuestas, 604 criterios de evaluación), con temperatura 0, `max_tokens=1024`, modo thinking desactivado y sin forzado de esquema JSON (un JSON roto se cuenta como error). El modelo se evaluó con vLLM 0.32.0 en una GPU NVIDIA A100-SXM4-80GB.

| Modelo | Exactitud de criterio | IC 95% | Exactitud micro | Errores JSON |
|---|---|---|---|---|
| RuBio-27B (`c1cfefdb`) | 86,9% | [83,8; 89,9] | 524/604 = 86,8% | 0/200 |
| Qwen3.8-27B (base) | 81,8% | [78,2; 85,4] | 495/604 = 82,0% | 5/200 |
| RuBio-4B v2 | 77,2% | [73,4; 80,9] | 467/604 | no disponible |
| Qwen3.5-4B | 70,9% | [67,3; 74,5] | 427/604 | no disponible |
| GPT-6 Astra (xhigh) | 91,2% | [88,6; 93,7] | 550/604 | no disponible |
| Claude Opus 5.5 (xhigh) | 94,2% | [92,0; 96,4] | 570/604 | no disponible |
| Gemini 4 Argon (High) | 91,2% | [88,5; 94,0] | 551/604 | no disponible |

Métricas auxiliares destacadas de RuBio-27B frente a su base Qwen3.8-27B: coincidencia de concepto erróneo 118/133 = 88,7% frente a 107/133 = 80,5%; recall de errores científicos fuera de rúbrica 46/53 = 86,8% frente a 29/53 = 54,7%; especificidad en respuestas sin error 127/147 = 86,4% en ambos; coincidencia de estado global 154/200 = 77,0% frente a 120/200 = 60,0%. La diferencia pareada frente al base es de +5,1 puntos porcentuales [1,1; 9,1] en la métrica principal. En la comparación con el mismo prompt (sin la política adicional que se dio al base), la diferencia de +2,5 puntos porcentuales [-0,9; 6,0] no resulta significativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 56 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda una GPU de 80 GB para margen cómodo.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (configuración usada en la evaluación del autor), H100 80GB; en consumer, no cabe en una sola GPU de 24 GB en bf16.
- En consumer GPU: viable únicamente con cuantización agresiva (por ejemplo 4 bits), que no está documentada por el autor; el resultado no está validado.
- Opciones de despliegue: vLLM (usado por el autor, versión 0.32.0); llama.cpp/Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud de criterio (RuBench v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuBio-27B | ~27,8 B | no disponible | 86,9% | Apache 2.0 | Hugging Face (mulkzz/RuBio-27B) |
| Qwen3.8-27B (base) | ~27,8 B | no disponible | 81,8% | no disponible en la información | Hugging Face (Qwen/Qwen3.8-27B) |
| RuBio-4B v2 | ~4 B | no disponible | 77,2% | no disponible en la información | Hugging Face (mulkzz/RuBio-4B) |
| Claude Opus 5.5 (xhigh) | no disponible | no disponible | 94,2% | propietaria | API |
| GPT-6 Astra (xhigh) | no disponible | no disponible | 91,2% | propietaria | API |

RuBio-27B supera a su base y a la variante ligera RuBio-4B en la tarea específica, pero queda por debajo de los modelos frontera generalistas evaluados. Su ventaja práctica es la licencia Apache 2.0 y la posibilidad de despliegue local.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado para biología de secundaria del currículo surcoreano (unidades I-III) y no para uso general.
- Idioma: solo declara coreano; su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Alucinación: aunque la evaluación reportada muestra alta consistencia estructural (0/200 JSON inválidos), no se han publicado estudios específicos de alucinación en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Qwen3.8-27B, cuya licencia no se detalla en la información proporcionada.
- Requisitos de hardware elevados: ~56 GB en bf16 hacen inviable el despliegue en GPU de consumo sin cuantización no documentada.
- Datos de menores: en aplicaciones educativas reales deben tenerse en cuenta las obligaciones de protección de datos.
- Repositorio de 105,2 GB: el tamaño del repo excede el de los pesos en bf16, por lo que puede contener artefactos adicionales; conviene revisar antes de descargar.
- Reentrenamientos recientes: la revisión `main` cambió el 2026-11-04; fijar la revisión en producción para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulkzz/RuBio-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo relacionado RuBio-4B: https://huggingface.co/mulkzz/RuBio-4B
- Modelo relacionado RuBio-8B: https://huggingface.co/mulkzz/RuBio-8B
- Modelo relacionado RuBio-9B: https://huggingface.co/mulkzz/RuBio-9B
- Servicio de demostración: https://mulk.codes/rubio
- README en inglés: https://huggingface.co/mulkzz/RuBio-27B/blob/main/README_en.md
- Paper referenciado en las etiquetas (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
