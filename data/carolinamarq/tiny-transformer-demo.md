# carolinamarq/tiny-transformer-demo

## Resumen

El modelo `carolinamarq/tiny-transformer-demo` es un prototipo de investigación de un transformer en escala nano, orientado a la tarea de generación de texto. Lo desarrolla `carolinamarq` como un punto de partida experimental para estudiar configuraciones arquitectónicas concretas: atención dilatada, fusión de bajo rango, activación swish y normalización por instancia. El repositorio incluye un script Python (`run.py`), la configuración de arquitectura, los argumentos de entrenamiento por defecto y un checkpoint de inicialización en formato `safetensors` con 49.600 parámetros totales.

Este modelo no es un sistema entrenado ni listo para producción. El propio autor aclara que el checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio, y que no se reivindica ninguna puntuación de benchmarks. Su relevancia radica en servir como implementación mínima y reproducible para experimentos de arquitectura, pruebas de humo en pipelines de machine learning y como referencia didáctica. La licencia BSD-3-Clause permite un uso amplio, aunque el estado del modelo limita su aplicabilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención dilatada, fusión de bajo rango, activación swish, instancenorm) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer en escala nano con componentes no estándar. Según la model card, utiliza atención dilatada en lugar de atención densa estándar, lo que reduce el coste computacional al muestrear posiciones con un patrón de dilatación. La fusión de características se realiza mediante una proyección de bajo rango, y la activación empleada es `swish`. La normalización se implementa con `instancenorm`, una elección inusual en transformers, que suele asociarse a redes convolucionales y no a arquitecturas secuenciales. No se detalla el número de capas, cabezas de atención ni dimensiones ocultas en la información disponible.

El entrenamiento no se ha ejecutado: el checkpoint incluido es únicamente un punto de inicialización para pruebas de humo. La configuración por defecto de entrenamiento usa el optimizador `lion` con un scheduler de tipo `step`, pero el autor indica explícitamente que son valores de arranque en el script y no evidencia de una ejecución completada. No se menciona el uso de RLHF, DPO ni ninguna fase de alineación posterior. Los datos de entrenamiento y el número de tokens no están disponibles.

## Capacidades

- Generación de texto como objetivo de diseño, aunque el checkpoint actual no está entrenado y no puede producir texto coherente.
- Implementación de referencia para experimentos con atención dilatada, fusión de bajo rango y normalización por instancia.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Solo se puede ejecutar mediante el script `run.py`, que incluye un ejemplo de prueba de humo. Las APIs genéricas de carga automática requieren un adaptador explícito, según advierte el autor.

## Casos de uso

- Investigación sobre atención dilatada en transformers: el modelo sirve como banco de pruebas para comparar patrones de atención dilatada frente a atención densa en tareas de generación a pequeña escala. Se usaría el script `run.py` para entrenar variantes con la misma exposición de datos y semillas.
- Docencia en arquitecturas de aprendizaje profundo: por su tamaño mínimo (49.600 parámetros) y su código fuente accesible, permite a estudiantes inspeccionar una implementación completa de transformer y modificar componentes de forma controlada.
- Pruebas de humo en pipelines de machine learning: el checkpoint de inicialización valida que el flujo de guardado y carga de `safetensors` y `config.json` funciona correctamente antes de lanzar experimentos más costosos.
- Estudio de normalización por instancia en modelos secuenciales: el modelo permite experimentar con `instancenorm` frente a `layernorm` en una arquitectura generativa pequeña, manteniendo el resto de variables constantes.
- Comparación de optimizadores en escalas mínimas: la receta por defecto con `lion` y scheduler `step` facilita la comparación con otros optimizadores en un entorno controlado y de bajo coste computacional.
- Base para experimentos de capacidad y regularización: al ser un modelo nano, es adecuado para estudiar el impacto de la fusión de bajo rango en el rendimiento, sin necesidad de infraestructura de GPU potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint es un punto de inicialización, no un modelo entrenado. Cualquier métrica futura debe documentarse por separado de los valores por defecto incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, incluso menor que 100 MB, dado que el modelo tiene 49.600 parámetros. En la práctica, se puede ejecutar en CPU sin necesidad de GPU.
- GPU recomendadas: cualquier GPU, incluidas opciones de consumo como una RTX 3060 o inferiores. No se requiere hardware especializado.
- Soporte en GPU de consumo: sí, completamente. El modelo es tan pequeño que incluso una CPU moderna lo ejecuta con latencia despreciable.
- Opciones de despliegue: no compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El despliegue previsto es mediante la ejecución directa de `run.py` en un entorno Python con PyTorch.
- Latencia y throughput: no disponibles. Al no existir ejecuciones publicadas ni benchmarks, no se pueden proporcionar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `carolinamarq/tiny-transformer-demo` | 49.600 | no disponible | Prototipo sin entrenar | BSD-3-Clause | HuggingFace |
| nanoGPT (referencia didáctica) | ~10M a 100M | no disponible | Entrenable, requiere configuración propia | MIT | GitHub |
| GPT-2 small | 124M | 1024 tokens | Preentrenado | MIT | HuggingFace |

La comparación directa es limitada porque el modelo de `carolinamarq` no tiene métricas publicadas ni un estado entrenado. A diferencia de GPT-2 small, que es un modelo funcional con soporte de generación real, este prototipo solo sirve como referencia arquitectónica. La comparación con nanoGPT es más pertinente por tratarse de un proyecto de investigación de pequeño tamaño, pero nanoGPT es un framework entrenable en lugar de un checkpoint de modelo. No hay datos de rendimiento disponibles para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es un punto de inicialización para pruebas de humo y no genera texto coherente ni cumple ninguna tarea útil.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según indica el propio autor.
- No se han publicado resultados de benchmarks ni métricas de rendimiento, por lo que cualquier afirmación sobre calidad es especulativa.
- La implementación es personalizada y no compatible con las APIs genéricas de carga automática de HuggingFace sin un adaptador explícito, lo que dificulta su integración en flujos estándar.
- El tamaño de 49.600 parámetros es insuficiente para tareas de generación reales, incluso si se entrenara con datos suficientes.
- La receta de entrenamiento incluida (lion, scheduler step) no es evidencia de una ejecución completada y no debe interpretarse como configuración validada.
- La licencia BSD-3-Clause permite uso comercial, pero el estado del modelo lo hace inadecuado para producción sin un proceso completo de entrenamiento y evaluación previo.

## Enlaces

- HuggingFace: https://huggingface.co/carolinamarq/tiny-transformer-demo
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios externos o demos en la información disponible.
