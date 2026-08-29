# pdxreyes/coca-demo

## Resumen

`pdxreyes/coca-demo` es una implementación de referencia del modelo **Coca** (Contrastive Captioners) orientada a tareas de *retrieval* imagen-texto, publicada por el autor `pdxreyes`. Se trata de un checkpoint de inicialización con una configuración "small" (16.576 parámetros) que no ha sido entrenado, por lo que su propósito es servir como base para pruebas de humo, desarrollo de código y experimentos de evaluación reproducibles. El autor declara explícitamente que no se presentan resultados de benchmarks y que el checkpoint no debe considerarse un modelo entrenado.

La relevancia de esta publicación radica en su transparencia: incluye el código fuente (`eval.py`), la configuración de arquitectura (`config.json`), los argumentos de entrenamiento por defecto (`training_args.json`) y un checkpoint válido para verificar que el pipeline funciona. Es un punto de partida útil para investigadores que quieran implementar o evaluar arquitecturas CoCa sin partir de cero, aunque no ofrece capacidades listas para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (Contrastive Captioners), escala small |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de retrieval, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de CoCa, que combina un codificador de visión, un decodificador de texto y un decodificador multimodal, integrando aprendizaje contrastivo con modelado de lenguaje. En esta implementación concreta se emplea atención multi-query, fusión de bajo rango (*low-rank fusion*), activación GELU con aproximación tanh y normalización por instancia (*InstanceNorm*). No se especifican detalles sobre el número de capas, dimensiones ocultas o número de cabezas de atención, más allá de la escala "small".

En cuanto al entrenamiento, el repositorio incluye una receta por defecto que usa el optimizador **Lion** con un programa de calentamiento lineal (*linear warmup*). Sin embargo, el autor aclara que estos son valores iniciales del script y no evidencian una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se proporcionan datos sobre el corpus de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- **Retrieval imagen-texto**: el modelo está diseñado para tareas de recuperación multimodal, aunque al no estar entrenado no se puede afirmar que funcione correctamente en la práctica.
- **Implementación de referencia**: sirve como base para desarrollar pipelines de evaluación y entrenamiento de arquitecturas CoCa.
- **Pruebas de humo**: el checkpoint permite verificar que el código y la configuración son funcionales antes de lanzar un entrenamiento real.
- **Sin capacidades demostradas**: no hay evidencia de generación de texto, razonamiento, código, tool calling, agentes ni soporte multilingüe, ya que el modelo no ha sido entrenado.

## Casos de uso

- **Desarrollo de pipelines de retrieval**: los investigadores pueden usar este repositorio como plantilla para implementar un sistema de búsqueda imagen-texto con CoCa, sustituyendo el checkpoint por uno entrenado.
- **Pruebas de integración**: al ser un modelo minúsculo, es ideal para validar que el entorno de ejecución (dependencias, carga de safetensors, adaptadores personalizados) funciona correctamente antes de escalar a modelos grandes.
- **Evaluación de arquitecturas**: el autor sugiere evaluar con Flickr30k y comparar contra un baseline de capacidad similar, lo que permite estudiar el impacto de la atención multi-query o la fusión low-rank en tareas de retrieval.
- **Educación y experimentación**: estudiantes o desarrolladores pueden inspeccionar el código para entender cómo se construye un modelo CoCa y cómo se configura un experimento de entrenamiento.
- **Reproducibilidad**: al incluir `config.json` y `training_args.json`, se facilita la reproducción de experimentos con diferentes semillas y ajustes de hiperparámetros.
- **Base para fine-tuning**: aunque el checkpoint no está entrenado, se puede usar como inicialización para un entrenamiento desde cero en un dataset propio, siempre que se documente el proceso por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado. Para una evaluación significativa, se recomienda entrenar el modelo y compararlo con un baseline de capacidad equivalente en un dataset como Flickr30k, reportando la métrica de la tarea con al menos tres semillas.

## Requisitos de hardware

- **VRAM estimada**: con solo 16.576 parámetros, el modelo ocupa menos de 1 MB en memoria. Cualquier GPU moderna (incluso integradas) o una CPU son suficientes para cargarlo y ejecutar pruebas.
- **GPU recomendadas**: no aplica; no se requieren GPUs específicas. Un portátil convencional puede ejecutar el código sin problemas.
- **Compatibilidad con consumer GPU**: sí, cualquier hardware es válido.
- **Opciones de despliegue**: al ser una implementación personalizada, no se puede cargar con APIs genéricas como vLLM u Ollama sin un adaptador explícito. El script `eval.py` incluye un ejemplo de prueba de humo.
- **Latencia y throughput**: no disponibles, pero al ser un modelo diminuto, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No es posible realizar una comparativa justa porque este modelo no está entrenado y no tiene métricas publicadas. Existen implementaciones de CoCa de referencia, como la de `lucidrains/CoCa-pytorch` o la oficial de `facebookresearch/multimodal`, pero no se dispone de datos de rendimiento comparables. La única diferencia objetiva es el tamaño: `pdxreyes/coca-demo` es una versión "small" con 16.576 parámetros, mientras que las implementaciones completas de CoCa suelen tener cientos de millones de parámetros. No se puede afirmar nada sobre su calidad relativa.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el modelo no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. No debe usarse en producción ni para tomar decisiones reales.
- **Sin benchmarks**: no hay evidencia de rendimiento en ninguna tarea. Cualquier resultado futuro debe documentarse por separado y no atribuirse a este checkpoint.
- **Alcance limitado**: la implementación está pensada para pruebas de humo y desarrollo, no para uso general. No soporta generación de texto, tool calling ni otras capacidades de modelos de lenguaje.
- **Compatibilidad restringida**: al ser una implementación personalizada, las APIs genéricas de carga automática no funcionan sin un adaptador explícito.
- **Licencia y datos externos**: aunque la licencia es BSD-3-Clause, el autor advierte que deben revisarse los términos de las fuentes de datos si se utiliza con datasets externos.
- **Riesgo de alucinación**: no aplica, ya que el modelo no genera texto.

## Enlaces

- [HuggingFace: pdxreyes/coca-demo](https://huggingface.co/pdxreyes/coca-demo)
- [Implementación de CoCa en PyTorch por lucidrains](https://github.com/lucidrains/CoCa-pytorch)
- [Modelo CoCa en facebookresearch/multimodal](https://github.com/facebookresearch/multimodal/blob/main/torchmultimodal/models/coca/coca_model.py)
