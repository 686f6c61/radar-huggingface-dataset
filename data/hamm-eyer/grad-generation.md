# hamm-eyer/grad-generation

## Resumen

El modelo `hamm-eyer/grad-generation` es un prototipo de investigación que implementa una arquitectura **Perceiver** orientada a tareas de generación. Lo desarrolla el usuario `hamm-eyer` y se publica bajo licencia BSD-3-Clause en HuggingFace, con un checkpoint de inicialización de 24.832 parámetros. A diferencia de modelos de lenguaje masivos, este repo es un experimento de arquitectura y formato: incluye un script `predict.py` con ejemplo ejecutable, un `config.json` con la configuración de escalado y un `training_args.json` con una receta de entrenamiento por defecto.

El diseño destaca por usar **atención lineal**, fusión bilinear, activación `approx gelu` y normalización `layernorm`, con una configuración denominada "giant" que define los valores por defecto de los ficheros de configuración. El autor es explícito en que el checkpoint incluido no está entrenado, no presenta métricas de rendimiento y debe tratarse como un punto de partida experimental. Es un modelo relevante para investigar el comportamiento de los Perceiver en generación, pero no está listo para ningún uso productivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un **Perceiver** con atención lineal, fusión bilinear, activación `approx gelu` y normalización `layernorm`. La escala marcada como "giant" se refleja en la configuración de arquitectura incluida en `config.json`, pero no se aportan más detalles sobre el número de capas, dims o latentes. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens, ni procesos de ajuste como RLHF o DPO: de hecho, el checkpoint `model.safetensors` se describe como un estado de inicialización válido para tests de humo, no como un modelo entrenado. La receta por defecto de entrenamiento usa el optimizador **Lion** con un programador de calentamiento lineal, pero el propio autor aclara que son valores iniciales del script, no evidencia de un entrenamiento completado. Cualquier evaluación significativa requiere entrenar previamente el modelo con exposición de datos fija, presupuesto de ajuste y semillas controladas.

## Capacidades

- Generación genérica: el script incluye un ejemplo de test de humo que demuestra que el modelo puede ejecutar una pasada hacia adelante y generar alguna salida con pesos de inicialización.
- Implementación personalizada: no es compatible con las APIs de carga automática habituales de HuggingFace sin un adaptador explícito.
- No se ha verificado soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- El formato safetensors permite cargar los pesos con PyTorch, pero el modelo no ofrece ninguna funcionalidad viable más allá de experimentación básica.

## Casos de uso

- Investigación en arquitecturas Perceiver para generación: sirve como referencia para estudiar cómo se comporta la atención lineal y la fusión bilinear en tareas de generación autoregresiva, partiendo de un checkpoint de inicialización reproducible.
- Pruebas de humo de pipelines de entrenamiento: el script `predict.py` permite comprobar que el entorno, los pesos y la configuración cargan correctamente antes de lanzar un entrenamiento real.
- Comparación de baselines con capacidad equivalente: el modelo puede usarse como baseline de baja capacidad para comparar contra otras arquitecturas en un mismo conjunto de datos y con el mismo presupuesto de ajuste.
- Desarrollo de adaptadores para Perceiver: la implementación custom sirve para prototipar wrappers o interfaces que permitan cargar este tipo de arquitecturas en frameworks de inferencia estándar.
- Experimento de regularización y optimización: la receta por defecto con optimizador Lion y warmup lineal puede ser un punto de partida para investigar configuraciones de entrenamiento en modelos pequeños.
- Documentación de prácticas de reproducibilidad: la estructura del repo, con `config.json` y `training_args.json` separados, se puede usar como plantilla para publicar experimentos de investigación donde se quiera distinguir arquitectura, receta y datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reivindica ninguna puntuación de benchmark en este repositorio y que cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: como el modelo tiene 24.832 parámetros, el peso en memoria es insignificante (menos de 0,1 MB). Es ejecutable incluso en CPU sin necesidad de GPU.
- GPU recomendadas: cualquiera, desde una CPU simple hasta una GPU de consumo. No hay requisitos específicos de VRAM.
- Cabe en cualquier consumer GPU: sí, en todas, e incluso en entornos sin aceleración gráfica.
- Opciones de despliegue: el modelo no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa al usar safetensors y una implementación custom. Requiere escribir un adaptador o ejecutarse directamente con el script `predict.py` en PyTorch.
- Latencia y throughput estimados: no disponibles, dado que el checkpoint no está entrenado y no se aportan mediciones reales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y el modelo no presenta datos de rendimiento que permitan una comparativa numérica. Dentro de la familia Perceiver, no se dispone de métricas publicadas del autor ni de otras implementaciones equivalentes con las que contrastar.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado, por lo que no es apto para ninguna tarea real de generación; su salida será ruido o texto incoherente.
- No se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio, tal y como reconoce el propio autor.
- La implementación es experimental y requiere un adaptador explícito para ser cargada con APIs genéricas de HuggingFace.
- Al no haber datos de entrenamiento documentados ni evaluaciones, existe un riesgo alto de alucinación si se intentase usar el modelo como si estuviera entrenado.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte que deben revisarse los términos de las fuentes de datos externas si se usa con otros datasets.
- No hay soporte de idiomas conocido y no se garantiza que el modelo funcione con textos multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/hamm-eyer/grad-generation
- Fichero pythón principal: `predict.py` dentro del repositorio (no disponible como URL directa en la información proporcionada)
