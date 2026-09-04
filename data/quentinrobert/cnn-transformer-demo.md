# quentinrobert/cnn-transformer-demo

## Resumen
El modelo `quentinrobert/cnn-transformer-demo` es una implementación de referencia de una arquitectura híbrida CNN-Transformer diseñada para tareas de matching. Ha sido desarrollado por `quentinrobert` y publicado en HuggingFace bajo licencia Apache 2.0. El repositorio incluye un checkpoint de inicialización (`model.safetensors`) de 16.576 parámetros, que no ha sido entrenado ni evaluado; su propósito es servir como base para pruebas de humo y experimentos reproducibles. La arquitectura destaca por el uso de atención grouped query, fusión Tucker y normalización por lotes, en una configuración denominada "giant" que, pese al nombre, corresponde a un modelo de tamaño mínimo. No se dispone de datos sobre la longitud de contexto ni sobre los idiomas soportados. Este modelo no es un sistema funcional de IA, sino un punto de partida experimental para desarrolladores que quieran explorar o extender la arquitectura.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer |
| Parametros totales | 16.576 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura combina capas convolucionales (CNN) con un transformer, utilizando atención grouped query para reducir el coste computacional, fusión de tipo Tucker para combinar representaciones y activación GELU. La normalización se realiza mediante batch norm. El modelo se presenta en una configuración denominada "giant" en el código, aunque el número de parámetros (16.576) indica que se trata de una escala mínima. Según el model card, el checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, ni procesos de alineación como RLHF o DPO. El repositorio incluye un script `finetune.py` con una receta de experimento por defecto (RMSprop con programación exponencial), pero se indica explícitamente que estos valores son puntos de partida y no evidencia de un entrenamiento completado.

## Capacidades
- Generación de texto: no disponible. El modelo no está entrenado y no se han documentado capacidades de generación.
- Razonamiento: no disponible.
- Código y matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: el modelo está diseñado para tareas de matching, pero no hay evidencia de rendimiento funcional. El checkpoint es una inicialización sin entrenar.

## Casos de uso
- Pruebas de humo (smoke tests) de la implementación: el script `finetune.py` incluye un ejemplo ejecutable que permite verificar que la arquitectura carga y ejecuta correctamente antes de cualquier entrenamiento real.
- Investigación educativa sobre arquitecturas híbridas CNN-Transformer: los archivos `config.json` y `training_args.json` documentan la configuración exacta, lo que facilita el estudio de la combinación de convoluciones y atención.
- Desarrollo de adaptadores personalizados: el model card indica que, al ser una implementación personalizada, las APIs de carga automática genéricas requieren un adaptador explícito; esto puede servir como ejercicio de integración.
- Punto de partida para entrenamiento experimental: los pesos de inicialización permiten lanzar un entrenamiento desde cero con una configuración reproducible, siempre que se documenten los resultados por separado.
- Comparación de arquitecturas en entornos académicos: la estructura transparente y la ausencia de benchmarks reclamados permiten a investigadores entrenar el modelo y compararlo con líneas base de capacidad equivalente.
- Desarrollo de herramientas de evaluación de matching: el modelo puede emplearse como referencia para construir conjuntos de validación emparejados y medir métricas de tarea con al menos tres semillas, como sugiere la guía de evaluación del autor.

Estos casos de uso son los únicos realistas dado el estado del modelo. No es adecuado para aplicaciones de producción ni para tareas de inferencia reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El model card declara explícitamente que no se reclama ninguna puntuación de benchmark en este repositorio y que el checkpoint de inicialización no está entrenado. Por tanto, no se presentan tablas comparativas.

## Requisitos de hardware
- VRAM estimada para inferencia: prácticamente nula. Con 16.576 parámetros, el modelo ocupa menos de 1 MB en memoria, por lo que cualquier GPU o incluso una CPU es suficiente.
- GPU recomendadas: cualquier GPU moderna (por ejemplo, RTX 3060, A100, H100) es más que suficiente. No hay requisitos mínimos relevantes.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU de consumo, incluidas las integradas.
- Opciones de despliegue: no es compatible directamente con frameworks como vLLM, Ollama o TGI, ya que se trata de una implementación personalizada que requiere un adaptador explícito. El despliegue se limitaría a ejecutar el script de Python incluido.
- Latencia y throughput: no disponibles. Dado el tamaño, la latencia sería mínima, pero no se han medido ni documentado valores.

## Comparativa con modelos similares
No se dispone de datos suficientes para una comparación directa. El modelo `rafiepour/CTran` (GitHub) también combina CNNs y transformers para tareas de comprensión del lenguaje natural, pero no se han encontrado especificaciones técnicas comparables en la información proporcionada. Por tanto, no es posible presentar una tabla comparativa fiable. Se indica "no disponible" para la comparación cuantitativa.

## Limitaciones y advertencias
- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. Esto es explícito en el model card.
- El modelo no es funcional para tareas reales de generación, razonamiento o matching; los pesos son una inicialización aleatoria.
- No se han documentado idiomas soportados, por lo que no puede utilizarse en aplicaciones multilingües.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo no tiene valor comercial en su estado actual.
- La implementación personalizada requiere un adaptador explícito para cargarse con APIs genéricas, lo que complica su integración en pipelines estándar.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de las configuraciones por defecto incluidas, tal y como advierte el autor.

## Enlaces
- HuggingFace: https://huggingface.co/quentinrobert/cnn-transformer-demo
- Referencia relacionada (arquitectura CNN-Transformer para matching): https://github.com/rafiepour/CTran
