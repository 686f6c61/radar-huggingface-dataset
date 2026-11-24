# jxtse/ClinAge-9B

## Resumen

ClinAge-9B es un adaptador LoRA (PEFT) publicado por el usuario jxtse sobre el modelo base Qwen/Qwen3.5-9B, orientado a la prediccion de edad biologica, mortalidad y análisis de supervivencia a partir de datos clínicos. El modelo se distribuye como un adaptador de bajo rango en formato safetensors (0,3 GB), no como pesos completos, por lo que requiere cargar el modelo base Qwen3.5-9B para su uso. Su pipeline declarado en Hugging Face es text-classification, con etiquetas que apuntan a regresión y análisis de supervivencia.

La relevancia del modelo reside en su especialización: en lugar de un ajuste genérico, aplica destilación de conocimiento y LoRA sobre un LLM de 9B para tareas de predicción clínica relacionadas con el envejecimiento. El acceso está restringido (gated) y la licencia es específica de uso en investigación (clinage-research-use-license), lo que condiciona su uso comercial.

La información pública disponible es limitada: no se detallan los datos de entrenamiento, los resultados de benchmarks ni las especificaciones completas de contexto o cuantización, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B |
| Parametros totales | No disponible (adaptador de 0,3 GB; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | clinage-research-use-license (uso restringido a investigación) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante PEFT sobre Qwen/Qwen3.5-9B, un transformer de 9.000 millones de parámetros. Las etiquetas del repositorio indican el uso de destilación de conocimiento (knowledge-distillation) junto con LoRA, lo que sugiere que el adaptador se ajustó para imitar las salidas de un modelo o sistema profesor en tareas de predicción clínica. La tarea declarada combina regresión (edad biológica, mortalidad) y análisis de supervivencia, además de clasificación de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset clínico, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de LoRA y destilación. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Predicción de edad biológica a partir de datos clínicos en formato textual.
- Estimación de riesgo de mortalidad y análisis de supervivencia.
- Tareas de regresión clínica y clasificación de texto asociadas a fenotipos de envejecimiento.
- Ajuste especializado mediante LoRA sobre un LLM de 9B, lo que permite reutilizar las capacidades lingüísticas del modelo base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en envejecimiento: uso del adaptador para estimar edad biológica a partir de registros clínicos textuales en estudios poblacionales, aprovechando la especialización del ajuste LoRA.
- Análisis de supervivencia en cohortes: aplicación del modelo para generar estimaciones de riesgo que complementen modelos estadísticos clásicos (Cox, Kaplan-Meier) en entornos de investigación.
- Clasificación de fenotipos clínicos: uso del pipeline text-classification para etiquetar informes o notas clínicas según categorías relacionadas con el envejecimiento.
- Reproducción de experimentos académicos: al estar licenciado para investigación, encaja en flujos de validación de resultados publicados sobre predicción clínica.
- Extracción de señales de riesgo en textos médicos: integración en pipelines de investigación que procesan notas clínicas en inglés para generar puntuaciones de riesgo.
- Estudio de destilación de conocimiento: el adaptador sirve como caso de análisis de cómo un LLM de 9B puede especializarse en dominios clínicos mediante LoRA y destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,3 GB, pero requiere cargar el modelo base Qwen3.5-9B. En precisión completa (FP16/BF16) se estiman aproximadamente 18 GB de VRAM solo para los pesos del modelo base; con cuantización de 8 bits, en torno a 9-10 GB; con 4 bits, en torno a 5-6 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; GPUs con 8-12 GB podrían ejecutar versiones cuantizadas del modelo base.
- Cabe en GPU de consumo: sí, con cuantización, en RTX 3090/4090 (24 GB) o superiores; en GPUs de 8-12 GB solo con cuantización agresiva.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y `transformers`; para servir en producción, vLLM o TGI con soporte de adaptadores LoRA, o llama.cpp/Ollama si se fusionan y convierten los pesos (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| ClinAge-9B (este) | 9B (base) + LoRA | No disponible | Predicción clínica / edad biológica | clinage-research-use-license | Restringido (gated) |
| Qwen3.5-9B (base) | 9B | No disponible | LLM generalista | Según Qwen | Público |
| Alternativas clínicas especializadas | No disponible | No disponible | Predicción clínica | Variable | Variable |

No se dispone de información suficiente para comparar con modelos clínicos especializados equivalentes; la comparación principal es con su modelo base Qwen3.5-9B, del que hereda arquitectura y capacidades lingüísticas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datos clínicos no especificados, puede heredar sesgos de la población de entrenamiento.
- Riesgo de alucinación: inherente a los LLM; en un contexto clínico, las salidas deben validarse y no usarse como diagnóstico.
- Limitaciones de idioma: solo inglés según los metadatos.
- Restricciones de licencia: licencia clinage-research-use-license, orientada a investigación; el uso comercial no está permitido sin autorización expresa.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face.
- Falta de documentación: no se publican detalles de entrenamiento, benchmarks ni especificaciones de contexto, lo que dificulta la reproducibilidad.
- Uso clínico: no debe emplearse en decisiones médicas reales sin validación regulatoria y clínica independiente.

## Enlaces

- Hugging Face: https://huggingface.co/jxtse/ClinAge-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería PEFT: https://github.com/huggingface/peft
