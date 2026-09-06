# natalialysenko/perceiver-contrastive

## Resumen

El modelo `natalialysenko/perceiver-contrastive` es un prototipo de investigación desarrollado por Natalia Lysenko que implementa una arquitectura Perceiver orientada al aprendizaje contrastivo. Se trata de un checkpoint de inicialización no entrenado, pensado como punto de partida para experimentos y pruebas de humo, no como un modelo listo para producción. Incluye el código fuente en `predict.py`, la configuración de arquitectura en `config.json` y la receta de experimento por defecto en `training_args.json`.

La arquitectura es un Perceiver con atención lineal, fusión por concatenación y MLP, activación swish y normalización batchnorm. El modelo tiene un total de 24.832 parámetros, un tamaño extremadamente reducido. La model card indica que la escala "large" se refiere a la configuración interna del prototipo, no al número de parámetros.

La relevancia de este repositorio es metodológica: permite estudiar la implementación de Perceiver para aprendizaje contrastivo, verificar pipelines de entrenamiento y servir como baseline de capacidad mínima. No se han publicado benchmarks ni se reclama ningún rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención lineal, fusión concat mlp, activación swish, normalización batchnorm) |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un diseño que procesa señales de alta dimensión mediante un conjunto reducido de latentes y atención cruzada. En esta implementación se utiliza atención lineal, fusión por concatenación seguida de un MLP, activación swish y normalización batchnorm. La configuración concreta se registra en `config.json`.

No se dispone de información sobre el conjunto de datos de entrenamiento, número de tokens ni composición. El checkpoint `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, pero no está entrenado. La receta por defecto en `training_args.json` usa Adam con un scheduler onecycle, pero la propia model card indica que son valores de partida, no evidencia de una ejecución completada. Tampoco se ha aplicado RLHF ni DPO.

## Capacidades

- Implementación funcional de un codificador Perceiver para aprendizaje contrastivo, con código ejecutable en `predict.py`.
- Checkpoint de inicialización válido para pruebas de humo y verificación de pipelines de entrenamiento.
- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible.
- Sin capacidades especiales como thinking mode, visión o audio.

## Casos de uso

Nota: los siguientes casos son de carácter experimental y de investigación. El modelo no está entrenado, por lo que no es apto para aplicaciones reales.

- Investigación en aprendizaje contrastivo: usar el checkpoint para validar que un pipeline de entrenamiento personalizado carga correctamente el modelo y produce gradientes, gracias a que es un checkpoint de inicialización válido.
- Pruebas de humo en integración continua: ejecutar `python predict.py --help` y el ejemplo de smoke-test para verificar que el entorno de ejecución es correcto, sin necesidad de descargar pesos grandes.
- Comparación de arquitecturas: emplear el modelo como baseline de capacidad mínima (24.832 parámetros) frente a otros Perceiver o modelos contrastivos de mayor tamaño.
- Docencia y formación: estudiar la implementación de un Perceiver con atención lineal, fusión concat mlp y normalización batchnorm a partir del código fuente.
- Desarrollo de adaptadores personalizados: la model card indica que las APIs de carga automática requieren un adaptador explícito; este repositorio sirve para practicar la creación de dichos adaptadores.
- Evaluación metodológica: seguir la guía de evaluación (conjunto held-out, tres semillas, baseline de capacidad equivalente) para investigar el efecto de la inicialización en el aprendizaje contrastivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB en float32 (24.832 parámetros). No disponible para cuantizaciones porque no se ofrecen.
- GPU recomendada: cualquiera, incluso CPU. No se requieren GPUs de gama alta.
- Cabe en cualquier consumer GPU; el modelo es trivial en tamaño.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El uso previsto es mediante `predict.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría con datos públicos. El modelo es un prototipo de investigación con 24.832 parámetros y sin rendimiento publicado.

## Limitaciones y advertencias

- Checkpoint de inicialización no entrenado: no apto para ninguna tarea real ni para producción.
- No ha sido auditado para robustez, fairness ni transferencia de dominio.
- Sin benchmarks publicados; cualquier resultado futuro debe documentarse por separado.
- Requiere un adaptador explícito para APIs de carga automática, por lo que no es compatible con `from_pretrained` estándar.
- Licencia BSD-3-Clause permite uso comercial, pero el modelo carece de valor funcional al no estar entrenado.
- El riesgo de alucinación no aplica al no generar texto, pero tampoco se puede garantizar ningún comportamiento útil.

## Enlaces

- HuggingFace: https://huggingface.co/natalialysenko/perceiver-contrastive
- No se han encontrado otros enlaces relevantes en la búsqueda web.
