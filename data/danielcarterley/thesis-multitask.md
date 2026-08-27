# Danielcarterley/thesis-multitask

## Resumen

Este repositorio contiene una implementación compacta y personalizada del modelo **Beit** orientada a tareas de aprendizaje multitarea (multi-task learning). El autor, Danielcarterley, lo presenta explícitamente como un artefacto experimental para revisión de código, pruebas de humo y experimentos controlados de pequeña escala, no como un modelo preentrenado listo para producción. La configuración es de escala "small" con atención estándar, fusión bilineal, activación GELU y normalización ScaleNorm.

El modelo tiene únicamente 33.088 parámetros, lo que lo sitúa en un rango extremadamente reducido, comparable a un juguete académico o a un punto de partida para investigar arquitecturas multitarea. El checkpoint incluido (`model.safetensors`) es un estado de inicialización válido, pero no ha sido entrenado ni evaluado. Su relevancia actual es limitada: sirve como referencia de implementación y como base para experimentos controlados, no como un modelo utilizable en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Beit (Vision Transformer con máscara de imagen) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en **Beit** (BERT pre-training de Image Transformers), un modelo de tipo Vision Transformer que aprende representaciones mediante el enmascarado de parches de imagen. En esta implementación concreta, la configuración es "small" con atención estándar (no lineal ni con mecanismos de ventana), fusión bilineal para combinar representaciones de distintas tareas, activación GELU y normalización ScaleNorm. No se especifica el número de capas, cabezas de atención ni dimensión oculta, aunque el recuento de parámetros (33K) sugiere una red muy pequeña, probablemente de una o dos capas.

El repositorio incluye un `config.json` con la configuración de arquitectura generada y un `training_args.json` con una receta de entrenamiento por defecto que usa el optimizador LAMB con un programador de tasa de aprendizaje por pasos (step schedule). Sin embargo, el propio autor advierte que estos valores son solo puntos de partida y no evidencian un entrenamiento completado. No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es una inicialización aleatoria válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- **Implementación de referencia**: el archivo `inference.py` contiene un ejemplo ejecutable de inferencia y un punto de entrada de entrenamiento, útil para revisar el código y verificar que la arquitectura funciona.
- **Multitarea básica**: la arquitectura está diseñada para aprender múltiples tareas simultáneamente mediante representaciones compartidas, aunque no se demuestra ninguna capacidad real en este estado.
- **Pruebas de humo**: el checkpoint de inicialización permite ejecutar un paso de inferencia o un mini-entrenamiento para validar el flujo de datos y el correcto funcionamiento del modelo.
- **Sin capacidades demostradas**: no hay evidencia de generación de texto, razonamiento, código, matemáticas, visión (más allá de la naturaleza del modelo Beit), tool calling, agentes o capacidades multilingües. El modelo no ha sido entrenado, por lo que no puede realizar ninguna tarea útil.

## Casos de uso

- **Revisión de código y aprendizaje**: un desarrollador puede estudiar la implementación de Beit en PyTorch y el patrón de fusión bilineal para entender cómo se estructura un modelo multitarea. El código es compacto y sirve como material didáctico.
- **Pruebas de humo en pipelines de CI/CD**: antes de integrar una librería de modelos, se puede ejecutar `inference.py` para verificar que el entorno (dependencias, carga de safetensors, etc.) funciona correctamente.
- **Experimentos controlados de investigación**: un investigador puede usar este modelo como baseline de capacidad mínima (33K parámetros) para comparar con arquitecturas más grandes en tareas de visión multitarea, siempre que entrene todas las variantes con la misma exposición a datos y semillas.
- **Depuración de infraestructura de entrenamiento**: el checkpoint de inicialización permite probar un pipeline de entrenamiento distribuido o de logging sin necesidad de un modelo grande, reduciendo el coste de las pruebas.
- **Validación de adaptadores de carga**: dado que es una implementación personalizada, se puede usar para desarrollar un adaptador que permita cargar el modelo con APIs genéricas de HuggingFace, un ejercicio útil para ingenieros de MLOps.
- **Estudio de normalización ScaleNorm**: la configuración usa ScaleNorm en lugar de LayerNorm, lo que permite experimentar con esta variante de normalización en un contexto multitarea sin invertir en un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia y que el checkpoint no es un modelo entrenado. Cualquier evaluación futura debe realizarse con un conjunto de validación específico de la tarea, reportando la métrica correspondiente en al menos tres semillas e incluyendo un baseline de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada**: con solo 33.088 parámetros, el modelo cabe en cualquier GPU, incluso en las más modestas. El uso de memoria será inferior a 1 GB, probablemente por debajo de 100 MB en FP32.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una CPU también podría ejecutar la inferencia sin problemas, aunque el entrenamiento sería más lento.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) puede manejar este modelo sin dificultad.
- **Opciones de despliegue**: al ser una implementación personalizada en PyTorch, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El propio autor indica que las APIs genéricas de carga automática requieren un adaptador. Se puede ejecutar con el script `inference.py` incluido.
- **Latencia y throughput**: no se han medido, pero dada la cantidad de parámetros, la inferencia será prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es una implementación personalizada de Beit en configuración "small" con 33K parámetros, un tamaño inusualmente pequeño. Los modelos Beit originales (beit-base, beit-large) tienen entre 86M y 307M de parámetros y están preentrenados en ImageNet. No hay modelos comparables en el mismo rango de parámetros con la misma configuración multitarea y fusión bilineal. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria, no un modelo entrenado. No puede realizar ninguna tarea útil y cualquier resultado de inferencia será ruido.
- **Sin evaluación de sesgos o robustez**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Alucinación y errores**: al no tener conocimiento aprendido, el modelo no puede alucinar en el sentido clásico, pero cualquier salida será arbitraria y sin significado.
- **Limitaciones de contexto e idioma**: no se especifican, y dado que es un modelo de visión, el concepto de contexto lingüístico no aplica directamente.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar los términos de los datos fuente si se usa con datasets externos.
- **Caveat de producción**: no es apto para producción. Es un artefacto experimental para revisión de código y pruebas de humo. Cualquier resultado publicado debe documentar por separado el entrenamiento realizado, los logs y las versiones del entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Danielcarterley/thesis-multitask
- No se han encontrado otros enlaces relevantes (papers, blogs, repos) en la búsqueda web.
