# robertcrc/cnn-transformer-experiment

## Resumen

El modelo `robertcrc/cnn-transformer-experiment` es una implementación experimental de una arquitectura híbrida CNN-Transformer diseñada para aprendizaje contrastivo, desarrollada por el autor independiente robertcrc. Se trata de un repositorio de investigación que prioriza la transparencia del código y la reproducibilidad de pruebas de humo (smoke tests) sobre el rendimiento final. El modelo está configurado en escala "nano", con un total de 16.576 parámetros, lo que lo convierte en un punto de partida mínimo para validar la arquitectura propuesta.

La arquitectura combina capas convolucionales con bloques Transformer, utilizando atención multi-query, fusión por co-atención, activación ReLU y normalización por instancias. El checkpoint incluido (`model.safetensors`) es un estado de inicialización válido para pruebas de humo, no un modelo entrenado. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el repositorio debe tratarse como un punto de partida experimental para futuros entrenamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (escala nano) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura híbrida CNN-Transformer para tareas de aprendizaje contrastivo. La configuración registrada en `config.json` especifica atención multi-query, fusión mediante co-atención, activación ReLU y normalización por instancias. Al tratarse de una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.

El repositorio incluye una receta de entrenamiento por defecto en `training_args.json` que utiliza SGD con programación exponencial. Sin embargo, el autor aclara que estos son valores iniciales del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` es solo un estado de inicialización para pruebas de humo. No se ha realizado entrenamiento con RLHF, DPO ni ningún otro método de optimización posterior. Para una evaluación significativa, el autor recomienda entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Implementación funcional de una arquitectura CNN-Transformer para aprendizaje contrastivo.
- Soporte de atención multi-query dentro del bloque Transformer.
- Fusión de características mediante co-atención entre las ramas CNN y Transformer.
- Incluye script de inferencia (`inference.py`) con ejemplo de prueba de humo ejecutable.
- Configuración de arquitectura registrada en `config.json` para reproducibilidad.
- Receta de entrenamiento por defecto documentada en `training_args.json`.
- Checkpoint de inicialización válido para validar el flujo de trabajo completo.
- Sin capacidades demostradas de generación de texto, razonamiento, código, matemáticas o visión, dado que el checkpoint no ha sido entrenado.

## Casos de uso

- Pruebas de humo de arquitecturas híbridas: el modelo permite validar rápidamente que el pipeline de CNN-Transformer funciona correctamente, desde la carga de pesos hasta la ejecución de la inferencia, gracias a su tamaño mínimo de 16.576 parámetros.
- Investigación sobre atención multi-query: la configuración incluida sirve como banco de pruebas para comparar el comportamiento de la atención multi-query frente a atención estándar en arquitecturas híbridas.
- Prototipado de aprendizaje contrastivo: el repositorio ofrece un punto de partida para experimentar con objetivos contrastivos en combinación con CNN-Transformer, permitiendo iterar sobre el diseño de la función de pérdida.
- Desarrollo de adaptadores para frameworks: al ser una implementación personalizada, el modelo es útil para ejercitar la creación de adaptadores que permitan cargar pesos en frameworks estándar como HuggingFace Transformers.
- Experimentos de inicialización de pesos: el checkpoint de inicialización puede utilizarse para estudiar cómo diferentes estrategias de inicialización afectan al entrenamiento posterior de arquitecturas CNN-Transformer.
- Educación en arquitecturas híbridas: el modelo sirve como ejemplo didáctico de cómo combinar capas convolucionales con bloques Transformer, al ser lo suficientemente pequeño para inspeccionar y depurar el código completo.
- Comparación de baselines de capacidad mínima: permite establecer un baseline de 16.576 parámetros para comparar con modelos de mayor capacidad en tareas de aprendizaje contrastivo, siempre que se entrene con la misma exposición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no es un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 16.576 parámetros, el modelo cabe en cualquier dispositivo capaz de ejecutar PyTorch, incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluyendo GPUs de consumo como RTX 3060 o inferiores. No se requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: total. El modelo es extremadamente ligero y puede ejecutarse en cualquier GPU consumer de los últimos años.
- Opciones de despliegue: ejecución directa mediante el script `inference.py` incluido en el repositorio. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito, según el propio autor.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento, aunque por el tamaño del modelo la latencia en CPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| robertcrc/cnn-transformer-experiment | 16.576 | no disponible | Cnn Transformer (nano) | BSD-3-Clause | Inicializacion, no entrenado |
| CTran (rafiepour/CTran) | no disponible | no disponible | CNN-Transformer encoder-decoder | no disponible | Codigo de investigacion, no checkpoint publico |

La comparativa se limita a CTran, un repositorio de GitHub que implementa una arquitectura CNN-Transformer para detección de intenciones y relleno de slots, pero no ofrece un modelo publicado en HuggingFace con el que comparar directamente. No se dispone de modelos comparables de la misma categoría con checkpoint público y métricas de referencia.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado. Es un estado de inicialización para pruebas de humo, no un modelo funcional para producción.
- No se ha auditado la robustez, equidad ni transferencia de dominio del modelo, según el propio autor.
- La implementación es experimental y debe tratarse como un punto de partida, no como un producto terminado.
- No existen resultados de benchmarks ni métricas de rendimiento publicadas.
- Las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que dificulta su integración en pipelines estándar.
- No se han definido idiomas soportados, por lo que no puede garantizarse ningún comportamiento multilingüe.
- La licencia BSD-3-Clause permite uso comercial, pero los términos de los datos externos deben revisarse por separado si se utilizan con este modelo.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/robertcrc/cnn-transformer-experiment
- Repositorio de referencia CTran (no afiliado): https://github.com/rafiepour/CTran
