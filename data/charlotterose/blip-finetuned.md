# charlotterose/blip-finetuned

## Resumen

El repositorio `charlotterose/blip-finetuned` contiene un checkpoint experimental de un modelo **BLIP** (Bootstrapping Language-Image Pretraining) orientado a tareas multitarea. Lo publica el usuario `charlotterose` bajo licencia Apache 2.0, y se presenta como un código base de investigación para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido para pruebas de humo, no un modelo entrenado, y el propio autor advierte que no se reclama ningún resultado de benchmark.

La arquitectura declarada es de escala **xlarge** con atención dilatada, fusión por co-atención, activación *swish* y normalización *instancenorm*. Sin embargo, el número total de parámetros es de solo **16.576**, una cifra extremadamente baja para una escala xlarge, lo que sugiere que se trata de una implementación reducida o de un subconjunto simbólico para validar el flujo de código. El repositorio no incluye datos de entrenamiento, métricas ni evidencia de capacidades funcionales, por lo que debe tratarse únicamente como un artefacto de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (visión-lenguaje) con atención dilatada y co-atención |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es una variante de BLIP con atención dilatada en lugar de la atención estándar, fusión mediante co-atención entre modalidades, activación *swish* y normalización por *instancenorm*. El autor indica que la configuración corresponde a una escala **xlarge**, aunque el tamaño real de parámetros (16.576) contradice esa denominación, lo que apunta a que el checkpoint es un stub o una versión mínima para pruebas de integración.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El archivo `training_args.json` registra una receta por defecto con optimizador SGD y programación de tasa de aprendizaje por pasos, pero el propio autor aclara que son valores iniciales del script, no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es un punto de inicialización para *smoke tests*, no un modelo entrenado.

## Capacidades

- **Sin capacidades demostradas**: al ser un checkpoint de inicialización sin entrenamiento, no se puede afirmar que el modelo sea capaz de generar texto, razonar, escribir código o realizar tareas de visión-lenguaje.
- **Arquitectura multimodal prevista**: el diseño BLIP está pensado para tareas como captioning de imágenes y respuesta visual a preguntas, pero esta implementación concreta no ha sido entrenada para ello.
- **Soporte de tool calling / function calling**: no disponible.
- **Soporte de agentes y multi-step reasoning**: no disponible.
- **Capacidades multilingües**: no disponible.
- **Capacidades especiales**: ninguna verificada.

## Casos de uso

Dado que el modelo no está entrenado, no existen casos de uso prácticos reales. Los únicos escenarios plausibles son de carácter técnico y de desarrollo:

- **Validación de infraestructura de entrenamiento**: el checkpoint sirve para comprobar que el pipeline de carga, forward y backward funciona correctamente antes de lanzar un entrenamiento completo.
- **Depuración de código**: los desarrolladores pueden usar `eval.py` para verificar que la implementación personalizada de BLIP no tiene errores de forma o de tipos.
- **Pruebas de integración en CI/CD**: al ser un artefacto mínimo, permite automatizar pruebas de humo en entornos de integración continua.
- **Estudio de arquitecturas alternativas**: la atención dilatada y la co-atención pueden analizarse a nivel de código para entender su implementación, aunque no haya resultados empíricos.
- **Base para un futuro fine-tuning**: si se entrena adecuadamente con un dataset multimodal, podría convertirse en un modelo funcional, pero eso requeriría un trabajo sustancial no incluido en este repositorio.
- **Referencia educativa**: para estudiantes que quieran ver cómo se estructura un proyecto de investigación de modelos multimodales, aunque no ofrece resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- **VRAM estimada**: con solo 16.576 parámetros, el modelo cabe en cualquier GPU, incluso en una integrada o en CPU. No se requieren requisitos especiales.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM sería suficiente; incluso una CPU moderna puede ejecutar el forward.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) es más que suficiente.
- **Opciones de despliegue**: al ser un checkpoint de inicialización, no está pensado para despliegue en producción. Para experimentación, se puede usar el script `eval.py` incluido, o adaptarlo a frameworks como PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles, pero al ser un modelo minúsculo, la latencia sería despreciable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este checkpoint no está entrenado y no tiene métricas de rendimiento. Los modelos BLIP originales de Salesforce (como `Salesforce/blip-image-captioning-base`) tienen cientos de millones de parámetros y resultados publicados, pero no son comparables con este artefacto experimental.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el modelo no ha sido entrenado, por lo que no produce salidas útiles. Cualquier intento de usarlo para tareas reales fallará.
- **Sin auditoría de robustez o fairness**: el autor advierte que el checkpoint no ha sido auditado para sesgos, robustez ni transferencia de dominio.
- **Implementación personalizada**: la carga automática mediante APIs genéricas de HuggingFace requiere un adaptador explícito, ya que no es una implementación estándar.
- **Riesgo de alucinación**: al no estar entrenado, no aplica, pero si se entrenara en el futuro, habría que evaluar este riesgo.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el autor recomienda revisar los términos de los datos externos si se usan con otros datasets.
- **Fecha de creación futura**: el repositorio está fechado en agosto de 2026, lo que puede indicar que es un proyecto reciente o una simulación; no afecta a la validez técnica.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/charlotterose/blip-finetuned)
- [BLIP2-Finetune-Recipes (referencia general de BLIP)](https://huggingface.co/luisdomene4/BLIP2-Finetune-Recipes)
- [Fine-Tuning BLIP Model on Flickr 8k (tutorial)](https://github.com/mirHasnain/Fine-tuning-BLIP-multi-modal-for-Image-Captioning)
- [VLM Fine-Tuning Using BLIP (notebook)](https://github.com/ashkunwar/VLM-Finetuning-using-BLIP)
- [BLIP Image Captioning Finetuned (ejemplo)](https://huggingface.co/candra/blip-image-captioning-finetuned)
- [MedBLIP: Fine-tuning BLIP for Medical Image Captioning (paper)](https://arxiv.org/html/2505.14726v1)
