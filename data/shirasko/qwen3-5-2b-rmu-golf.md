# shirasko/qwen3.5-2b-rmu-golf

## Resumen

`shirasko/qwen3.5-2b-rmu-golf` es un checkpoint experimental de desaprendizaje (unlearning) basado en el modelo `Qwen/Qwen3.5-2B`. El desarrollador, `shirasko`, ha aplicado la técnica RMU (Representation Misdirection for Unlearning) para eliminar el concepto «golf» del modelo. El objetivo es que el modelo sea incapaz de generar información relacionada con este deporte, mientras intenta preservar el resto de sus capacidades.

Se trata de un modelo de investigación en el área de alineación y seguridad de IA, relevante para estudiar cómo se pueden eliminar conocimientos no deseados o sensibles de modelos preentrenados. El checkpoint incluye los pesos completos del modelo (full model weights) con un total de 1.881.825.088 parámetros (~1,88 mil millones), lo que lo sitúa en la categoría de modelos pequeños de 2B. El formato de pesos es `safetensors` y está pensado para el pipeline de `text-generation`. La longitud de contexto y la licencia no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-2B) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B`, un modelo de lenguaje de arquitectura transformer no especificada en detalle en la información disponible. El proceso de desaprendizaje se aplica sobre los pesos completos del modelo, es decir, no se trata de un adaptador LoRA sino de una modificación directa del checkpoint.

El método utilizado es RMU, que según la model card se configura con los siguientes hiperparámetros: `alpha=100`, `delta_embed=0`, `k_features_embed=0`, `layer_id=7`, `layer_ids=[5,6,7]`, `lr=0.0001`, `n_tokens_edited=0`, `param_ids=11`, `steering=1000`. La técnica modifica representaciones internas en capas seleccionadas (7, junto con las capas 5 y 6) para redirigir las activaciones del modelo de modo que el conocimiento sobre «golf» no se recupere durante la generación. No se indica que se haya aplicado RLHF, DPO ni ningún otro tipo de ajuste posterior; el entrenamiento se limitó al procedimiento de desaprendizaje.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base `Qwen3.5-2B`.
- Desaprendizaje del concepto «golf»: el checkpoint intenta no producir respuestas relacionadas con este deporte. La eficacia medida en el test es de 0,612, lo que indica que el modelo falla en una parte significativa de las consultas sobre golf.
- Mantiene una capacidad parcial de razonamiento y conocimiento general: en MMLU obtiene una precisión de 0,565 tras el desaprendizaje, frente al 0,588 del modelo base.
- No se han documentado capacidades de tool calling, function calling, visión ni audio en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- El modelo es principalmente un objeto de investigación; no está destinado a aplicaciones productivas directas.

## Casos de uso

- Investigación en desaprendizaje de conceptos: el checkpoint sirve como referencia para comparar la eficacia de RMU frente a otros métodos de unlearning. Se puede evaluar si la técnica elimina de forma efectiva el concepto objetivo sin degradar el resto del modelo.
- Análisis de especificidad del unlearning: gracias a las métricas de especificidad (0,693 en test), este modelo permite estudiar cuánto daño colateral sufre el conocimiento general cuando se elimina un concepto concreto. Es útil en investigaciones sobre la evaluación de métodos de edición de conocimiento.
- Estudio de re-aprendizaje: la métrica de relearning QA es 0,7, por lo que el modelo permite investigar si un concepto olvidado puede volver a ser aprendido, lo que aporta información sobre la persistencia del desaprendizaje.
- Integración en suites de evaluación de seguridad: puede incluirse en pipelines de testing para comprobar que un modelo no revela información sensible o prohibida, actuando como caso de prueba en baterías de evaluación de alineación.
- Análisis de representaciones internas: al modificar las capas 5, 6 y 7, el checkpoint es útil para estudiar qué representaciones están asociadas al concepto «golf» y cómo su alteración afecta a la salida del modelo.
- Uso educativo en cursos de seguridad de IA: sirve como ejemplo práctico de cómo se edita el conocimiento de un modelo lingüístico, permitiendo a los estudiantes replicar experimentos de unlearning y analizar los resultados.

## Benchmarks y rendimiento

La información proporcionada incluye evaluaciones realizadas con un protocolo de opción múltiple (MC). La tabla siguiente muestra la comparación entre el modelo base (baseline) y el checkpoint tras el desaprendizaje, en el conjunto de test.

| Métrica | Baseline (test) | Después del unlearning (test) |
|---|---|---|
| QA accuracy | 0,74 | 0,44 |
| QA fraction | 1 | 0,388 |
| SimDom accuracy | 0,74 | 0,52 |
| SimDom fraction | 1 | 0,551 |
| MMLU accuracy | 0,588 | 0,565 |
| MMLU fraction | 1 | 0,932 |

Las métricas principales de desaprendizaje reportadas son:

| Métrica | Valor |
|---|---|
| Efficacy | 0,612 |
| Specificity | 0,693 |
| Media armónica | 0,65 |
| Re-learning QA (MC) | 0,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `safetensors` ocupan aproximadamente 3,76 GB en FP16/BF16, por lo que se necesita una GPU con al menos 6 GB de VRAM para inferencia con contexto corto. En una cuantización de 4 bits, el modelo puede reducirse a aproximadamente 1 GB de pesos, haciendo viable el despliegue en GPUs con 4 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB o RTX 4090 24 GB para el modelo en FP16. Para intersecciones con batching alto o mayor throughput se puede usar una A100 40 o 80 GB.
- El modelo puede ejecutarse en GPUs de consumo si se usa cuantización 4-bit. En formato FP16 requiere al menos una GPU de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: Transformers con los pesos en `safetensors` de forma nativa; conversión a GGUF para `llama.cpp` u `Ollama`; `vLLM` para servir con alto throughput; y `TGI` (Text Generation Inference) si se prefiere una opción de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con otros modelos de la misma categoría, ya que la información proporcionada solo incluye el modelo base y el checkpoint desaprendido. La comparación más relevante es con el propio modelo base `Qwen/Qwen3.5-2B`.

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Qwen/Qwen3.5-2B | 1.881.825.088 | No disponible | No disponible | Modelo base original, sin desaprendizaje del concepto golf |
| shirasko/qwen3.5-2b-rmu-golf | 1.881.825.088 | No disponible | No disponible | Modelo base modificado con RMU para olvidar el concepto golf |

## Limitaciones y advertencias

- El desaprendizaje no es perfecto: la eficacia en test es de 0,612, por lo que el modelo todavía puede generar contenido relacionado con el golf en un número significativo de consultas.
- Existe una pérdida colateral de capacidad general: la precisión en MMLU cae de 0,588 (baseline) a 0,565 (tras el unlearning), y las fracciones de respuestas válidas en QA y SimDom se reducen notablemente.
- Es un checkpoint de investigación, no un modelo de producción. No se recomienda su uso en sistemas reales, especialmente en aplicaciones donde la fiabilidad sea crítica.
- La licencia no está disponible, lo que limita el uso comercial y la redistribución sin autorización explícita.
- El modelo solo soporta inglés según la model card, lo que restringe su uso a textos en ese idioma.
- No hay información sobre longitudes de contexto, cuantizaciones oficiales ni soporte de tool calling, por lo que cualquier integración en sistemas complejos requiere verificación previa.
- Al ser un modelo de 2B, presenta una capacidad menor que modelos de mayor escala para razonamiento complejo y tareas multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/shirasko/qwen3.5-2b-rmu-golf
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Documentación de Ollama para Qwen 3.5 2B: https://ollama.com/library/qwen3.5:2b
