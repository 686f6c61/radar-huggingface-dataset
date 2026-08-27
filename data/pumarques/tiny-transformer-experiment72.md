# pumarques/tiny-transformer-experiment72

## Resumen

El modelo `pumarques/tiny-transformer-experiment72` es un checkpoint de inicialización de un transformer en configuración "nano" diseñado para tareas de clasificación. Lo desarrolla el usuario pumarques y se publica en HuggingFace con licencia BSD-3-Clause. El repositorio incluye el código fuente (`inference.py`), la configuración de arquitectura (`config.json`), los argumentos de entrenamiento (`training_args.json`) y el checkpoint en formato safetensors.

Este modelo no es un modelo entrenado: se trata de un punto de partida experimental con pesos de inicialización válidos para pruebas de humo. Su relevancia radica en su valor educativo y como base para experimentos con arquitecturas transformer compactas, especialmente en lo relativo a atención grouped query, co-atención y normalización RMSNorm. Con solo 24.832 parámetros, es extremadamente ligero y puede ejecutarse en cualquier hardware, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (nano) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer en configuración nano con atención grouped query (GQA), mecanismo de co-atención, activación GELU y normalización RMSNorm. El repositorio documenta que se trata de una implementación personalizada y transparente, con énfasis en código legible y pruebas repetibles. No se proporcionan detalles sobre el número de capas, dimensiones ocultas o número de cabezas de atención más allá de lo indicado en la tabla de arquitectura.

En cuanto al entrenamiento, el checkpoint incluido es un estado de inicialización, no un modelo entrenado. La configuración por defecto del experimento utiliza el optimizador Lion con un programador de tasa de aprendizaje "step", pero estos son valores de partida en el script, no evidencia de una ejecución completada. No se menciona ningún proceso de RLHF, DPO ni ajuste fino con datos reales. El autor recomienda explícitamente que cualquier evaluación significativa se realice entrenando el modelo con datos etiquetados específicos de la tarea y comparando con una línea base de capacidad equivalente.

## Capacidades

- El modelo no presenta capacidades funcionales demostradas, ya que es un checkpoint de inicialización sin entrenamiento.
- La arquitectura está diseñada para clasificación, por lo que podría adaptarse a tareas de clasificación de texto o imágenes tras un entrenamiento adecuado.
- No se documenta soporte para generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.
- El repositorio incluye un script de inferencia (`inference.py`) con un ejemplo de prueba de humo generado, pero requiere un adaptador explícito para cargarse mediante APIs genéricas de HuggingFace.

## Casos de uso

- Educacion y aprendizaje: sirve como ejemplo práctico de implementación de un transformer desde cero, ideal para estudiar atención grouped query, co-atención y RMSNorm en un código mínimo y legible.
- Pruebas de humo en pipelines de CI/CD: al ser un checkpoint de inicialización válido, permite verificar que el código de entrenamiento e inferencia funciona correctamente antes de lanzar experimentos más grandes.
- Experimentación con arquitecturas compactas: investigadores pueden modificar la configuración y entrenar el modelo en tareas de clasificación sencillas para estudiar el comportamiento de la atención grouped query en escalas muy pequeñas.
- Base para comparaciones de capacidad: el autor sugiere usarlo como línea base de capacidad equivalente en evaluaciones controladas con tres semillas diferentes.
- Prototipado rápido de clasificadores: tras un entrenamiento específico, podría emplearse en tareas de clasificación binaria o multiclase con datasets pequeños, aunque no se recomienda para producción.
- Investigación sobre eficiencia: su tamaño mínimo permite analizar el coste computacional y la memoria necesaria para transformers de escala nano, útil para estudios de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia y que el checkpoint no está entrenado ni auditado. Cualquier dato de rendimiento futuro deberá documentarse por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, incluso en CPU. Con 24.832 parámetros, el modelo cabe en cualquier dispositivo, incluidos microcontroladores o entornos embebidos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, aunque no se necesita GPU para inferencia; una CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (GTX 1060, RTX 3060, etc.) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere el script `inference.py` del repositorio o un adaptador personalizado.
- Latencia y throughput: no disponibles, pero dado el tamaño mínimo, la latencia será del orden de microsegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en cuanto a rendimiento, ya que este checkpoint no está entrenado. Existen otros repositorios de "tiny transformer" con fines educativos, como los encontrados en GitHub (skolouri/TinyTransformer y avvorstenbosch/tinyTransformer), pero no son comparables en términos de parámetros, contexto o licencia. La comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no tiene capacidad predictiva real. Cualquier uso en producción es inviable.
- No se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio. El autor lo califica como un punto de partida experimental.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto o idioma, ya que no hay entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar los términos de los datos fuente si se utiliza con datasets externos.
- La implementación personalizada requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace, lo que limita su interoperabilidad.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- [HuggingFace - pumarques/tiny-transformer-experiment72](https://huggingface.co/pumarques/tiny-transformer-experiment72)
- [GitHub - skolouri/TinyTransformer](https://github.com/skolouri/TinyTransformer)
- [GitHub - avvorstenbosch/tinyTransformer](https://github.com/avvorstenbosch/tinyTransformer)
- [Artículo arXiv - FPGA implementation of Tiny Transformer](https://arxiv.org/abs/2401.02721)
