# pius-code/asha_nllb_compound_v2

## Resumen

El modelo `pius-code/asha_nllb_compound_v2` es un modelo de traducción automática neuronal basado en la arquitectura M2M-100, desarrollado por el usuario de Hugging Face `pius-code`. Con 615 millones de parámetros, está diseñado para tareas de texto a texto (text2text-generation) y su nombre sugiere una adaptación o ajuste fino del modelo NLLB (No Language Left Behind) de Meta, aunque la información oficial de la model card es prácticamente inexistente.

La relevancia de este modelo radica en su potencial para la traducción multilingüe, dado que la arquitectura M2M-100 fue diseñada para traducir entre cientos de idiomas sin pasar por el inglés como idioma intermedio. Sin embargo, la falta de documentación pública sobre sus datos de entrenamiento, idiomas soportados y licencia limita seriamente su uso en producción. Su tamaño moderado (615 M de parámetros) lo hace viable para despliegue en GPUs de consumo, aunque se desconocen detalles concretos sobre su rendimiento y limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M-100 (Transformer encoder-decoder) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura M2M-100 es un Transformer encoder-decoder diseñado originalmente por Meta AI para traducción multilingüe directa entre pares de idiomas sin pasar por el inglés como pivote. El modelo utiliza atención totalmente densa y fue preentrenado con un corpus masivo de datos web multilingües. Sin embargo, en la información proporcionada no se detalla el proceso de entrenamiento específico de esta variante: no se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas como fine-tuning supervisado o RLHF.

El nombre "compound" sugiere que podría tratarse de un modelo compuesto o ensamblado, pero no hay documentación técnica que lo confirme. La model card no incluye ningún hiperparámetro de entrenamiento, régimen de precisión ni información sobre el proceso de preprocesado.

## Capacidades

- Traducción automática entre múltiples idiomas, heredada de la arquitectura M2M-100.
- Generación de texto en formato texto a texto (text2text-generation).
- Compatible con la librería Transformers de Hugging Face.
- No se dispone de información sobre capacidades adicionales como tool calling, agentes o razonamiento multi-paso.
- No se conocen capacidades específicas de visión, audio o thinking mode.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos. La model card no documenta aplicaciones prácticas, tareas específicas ni escenarios de uso recomendados. Dado que se trata de un modelo de traducción basado en M2M-100, su uso principal probablemente sea la traducción automática multilingüe, pero no hay datos verificables sobre los idiomas que cubre ni su calidad. Hasta que el autor publique documentación detallada, cualquier caso de uso en producción debería considerarse experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como BLEU, MMLU, HumanEval ni comparaciones con otros modelos de traducción. Tampoco se ha encontrado documentación técnica externa que proporcione datos de evaluación.

## Requisitos de hardware

- VRAM estimada: con 615 M parámetros en fp32, la inferencia requiere aproximadamente 2.5 GB de VRAM. Con cuantización a int8 o fp16 podría reducirse a unos 1.2-1.5 GB.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4090 (24 GB) son más que suficientes. También puede ejecutarse en CPU para inferencia lenta.
- Despliegue: compatible con Transformers (PyTorch) y puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se han publicado conversiones oficiales.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pius-code/asha_nllb_compound_v2 | 615 M | no disponible | no disponible | Hugging Face |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens | CC-BY-NC-4.0 | Hugging Face |
| google/madlad400-3b-mt | 3 B | 1024 tokens | no disponible | Hugging Face |

La comparación directa es limitada porque el modelo de pius-code carece de documentación pública. El NLLB-200 de Meta es su referencia arquitectónica más cercana, pero su licencia no comercial restringe su uso empresarial. El modelo de Google es más grande y ofrece mayor capacidad, pero también tiene restricciones de licencia. Sin datos de evaluación, no es posible determinar si esta variante compuesta supera o iguala a estos modelos.

## Limitaciones y advertencias

- **Documentación inexistente**: la model card no proporciona información sobre datos de entrenamiento, evaluación, licencia ni idiomas. Esto impide evaluar su fiabilidad y seguridad.
- **Sesgos desconocidos**: al no conocer el corpus de entrenamiento, no se pueden identificar sesgos lingüísticos, culturales o de género.
- **Riesgo de alucinación**: como todo modelo de traducción neuronal, puede generar traducciones inventadas o incorrectas, especialmente en pares de idiomas poco representados en el entrenamiento.
- **Licencia no definida**: el uso comercial, la redistribución y las obras derivadas no están regulados, lo que supone un riesgo legal en producción.
- **Sin soporte garantizado**: al ser un proyecto personal sin documentación técnica, no hay garantías de mantenimiento, corrección de errores ni actualizaciones.
- **Carga computacional**: aunque el modelo es moderado, la inferencia en CPU puede ser lenta para aplicaciones de tiempo real.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pius-code/asha_nllb_compound_v2)
- [Repositorio GitHub del autor (ASHA)](https://github.com/pius-code/ASHA)
- [Perfil de GitHub de pius-code](https://github.com/pius-code)
- [Modelo relacionado: asha_twi_adapter_v2](https://huggingface.co/pius-code/asha_twi_adapter_v2)
