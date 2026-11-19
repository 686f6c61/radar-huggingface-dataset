# Crystalliume/poolformer-retrieval

## Resumen

Poolformer-retrieval es un prototipo de investigación publicado por el usuario Crystalliume en Hugging Face bajo licencia Apache 2.0. Se presenta como una implementación de arquitectura Poolformer orientada a tareas de retrieval (recuperación de información), en una escala que el autor denomina "nano". El repositorio contiene el código de definición del modelo (`main.py`), un fichero de configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización en formato safetensors.

Es importante subrayar que el propio autor indica explícitamente que el checkpoint incluido es una inicialización válida para pruebas de humo (smoke tests) y no un modelo entrenado ni evaluado. No se reclama ninguna puntuación de benchmark en el repositorio, y la model card recomienda una evaluación sobre Flickr30k con al menos tres semillas y una línea base de capacidad comparable. El número de parámetros reportado en safetensors es de 49.600, lo que sitúa el artefacto en una escala muy reducida, coherente con su carácter de prototipo y no de modelo de producción.

Por tanto, esta ficha debe leerse como documentación de un artefacto experimental y reproducible, no como la de un modelo listo para despliegue. Su valor reside en servir de punto de partida para experimentación con arquitecturas Poolformer en tareas de retrieval, con formatos de fichero y recetas de entrenamiento documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Poolformer |
| Parámetros totales | 49.600 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un Poolformer, una variante de transformer que sustituye el mecanismo de atención por operaciones de pooling para la mezcla de tokens, reduciendo el coste computacional. Según la model card, la configuración incluye atención de tipo flash, fusión de bajo rango (low rank), función de activación Mish y normalización por batch (batchnorm). La escala declarada es "nano". No se especifican el número de capas, dimensión oculta, número de cabezas ni longitud de contexto en la información disponible.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con optimizador SGD y un schedule de tipo step, que el autor describe como valores de partida del script y no como evidencia de una ejecución completada. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El checkpoint `model.safetensors` es una inicialización para pruebas de humo, no un modelo entrenado. No se reportan innovaciones técnicas adicionales más allá de las opciones de arquitectura mencionadas.

## Capacidades

- Definición de un modelo Poolformer configurable mediante `config.json` y `training_args.json`.
- Punto de entrada ejecutable (`main.py`) con bloque `__main__` que incluye un ejemplo de prueba de humo.
- Orientación declarada a tareas de retrieval (recuperación de información), si bien no se aportan métricas que lo demuestren.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Experimentación académica con arquitecturas Poolformer: el repositorio sirve como base reproducible para estudiar variantes de pooling frente a atención en tareas de retrieval, partiendo de la configuración incluida.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización y el script `main.py` permiten validar que un entorno de entrenamiento carga el modelo y ejecuta un paso sin errores antes de lanzar experimentos reales.
- Evaluación comparativa de retrieval sobre Flickr30k: la model card propone explícitamente este conjunto de datos como primer escenario de evaluación, con al menos tres semillas y una línea base de capacidad comparable.
- Desarrollo de adaptadores de carga: dado que es una implementación personalizada, el repositorio puede usarse para practicar la integración de modelos no estándar en APIs de carga automática mediante adaptadores explícitos.
- Docencia y formación: el tamaño reducido (49.600 parámetros) y la documentación de formatos lo hacen adecuado para explicar el ciclo de vida de un modelo (configuración, checkpoint, receta de entrenamiento) en cursos de aprendizaje automático.
- Reproducción de recetas de entrenamiento: los ficheros `training_args.json` y `config.json` permiten replicar la receta por defecto (SGD con schedule step) y compararla con alternativas bajo el mismo presupuesto de datos y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint incluido no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 49.600 parámetros, el checkpoint cabe holgadamente en cualquier GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga automática.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (retrieval con arquitectura Poolformer) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint incluido es una inicialización, no un modelo entrenado; no debe usarse en producción ni para inferencia real.
- No se ha auditado robustez, equidad ni transferencia de dominio, según advierte el propio autor.
- No se documentan sesgos conocidos, pero la ausencia de entrenamiento y de evaluación impide descartarlos.
- Riesgo de alucinación: no aplica de forma directa al no ser un modelo generativo entrenado, pero cualquier uso tras entrenamiento deberá evaluarse específicamente.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita cualquier planificación de despliegue.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el autor recomienda revisar por separado los términos de los datos fuente si se usan conjuntos externos.
- Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/Crystalliume/poolformer-retrieval
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
