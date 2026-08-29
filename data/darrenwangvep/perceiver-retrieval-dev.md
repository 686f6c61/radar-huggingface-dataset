# DarrenWangvep/perceiver-retrieval-dev

## Resumen

Este repositorio contiene una implementación experimental de un modelo Perceiver orientado a tareas de retrieval, desarrollada por DarrenWangvep. Se trata de un código base con un checkpoint de inicialización (`model.safetensors`) de solo 24.832 parámetros, pensado para pruebas de humo y para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. No es un modelo entrenado ni presenta resultados de evaluación.

La relevancia de esta publicación es limitada: sirve como punto de partida para investigadores que quieran experimentar con la arquitectura Perceiver aplicada a recuperación de información, pero no ofrece capacidades listas para uso en producción. El autor indica explícitamente que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención estándar, fusión bilineal, activación GELU tanh, normalización ScaleNorm) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño Perceiver original: procesa entradas de cualquier modalidad mediante atención cross-attention entre un conjunto de latentes y la entrada, evitando el coste cuadrático de los transformers estándar. En esta implementación concreta se emplea atención estándar, fusión bilineal para combinar información, activación GELU con variante tanh y normalización ScaleNorm. La escala declarada es "giant", aunque el número de parámetros del checkpoint es mínimo.

No se ha realizado ningún entrenamiento. El archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, y la configuración incluida (`training_args.json`) define una receta experimental con optimizador LAMB y programación de calentamiento constante, pero no hay evidencia de una ejecución completada. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se han verificado capacidades funcionales: el checkpoint no está entrenado y no se aportan resultados de tareas.
- La implementación permite ejecutar un ejemplo de prueba de humo mediante `python model.py --help`, que genera un ejemplo sintético.
- Al ser una implementación personalizada, las APIs de carga automática genéricas requieren un adaptador explícito.
- No hay soporte demostrado para generación de texto, razonamiento, código, tool calling, agentes, visión o multilingüismo.

## Casos de uso

- Desarrollo de arquitectura: los investigadores pueden modificar el código y ejecutar pruebas de humo para validar cambios en la atención, fusión o normalización antes de lanzar un entrenamiento a gran escala.
- Pruebas de integración: el checkpoint de inicialización permite verificar que el pipeline de carga, forward y guardado funciona correctamente en un entorno de desarrollo.
- Punto de partida para experimentos de retrieval: el autor sugiere evaluar en Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, aunque esto requiere entrenar el modelo desde cero.
- Reproducibilidad de configuraciones: los archivos `config.json` y `training_args.json` documentan la arquitectura y la receta de entrenamiento, útiles para comparar configuraciones.
- Educación sobre Perceiver: el código puede servir como ejemplo didáctico de implementación de la arquitectura Perceiver aplicada a retrieval.
- No es adecuado para ningún caso de uso en producción debido a su estado no entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de evaluación en este repositorio.

## Requisitos de hardware

- VRAM estimada: con 24.832 parámetros, la inferencia requiere menos de 1 MB de VRAM, por lo que cualquier GPU moderna (incluso integradas) es suficiente.
- GPU recomendadas: cualquier GPU con soporte CUDA o incluso CPU es válida para pruebas de humo.
- Cabe en cualquier GPU de consumo: sí, sin ninguna restricción.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador para usar APIs genéricas.
- Latencia y throughput: no se han medido; al ser un modelo diminuto, la latencia sería despreciable, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de retrieval basados en Perceiver, ya que este repositorio no presenta resultados entrenados. El Perceiver original de DeepMind (Perceiver y Perceiver IO) es la referencia arquitectónica, pero no se pueden comparar métricas de rendimiento sin datos de evaluación. No se incluyen alternativas comparables por falta de información.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se garantiza ningún comportamiento funcional; el modelo no es apto para uso en producción.
- La implementación es experimental y puede contener errores; requiere un adaptador para cargarse con APIs estándar.
- No hay datos sobre sesgos, alucinaciones o limitaciones de contexto o idioma, al no existir un modelo entrenado.
- La licencia MIT permite uso comercial, pero los términos de los datos externos (p. ej., Flickr30k) deben revisarse por separado si se usan para entrenamiento.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse de forma independiente a los valores por defecto incluidos aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DarrenWangvep/perceiver-retrieval-dev
- Perceiver original (DeepMind, GitHub): https://github.com/google-deepmind/deepmind-research/blob/master/perceiver/README.md
- Blog de Perceiver IO en HuggingFace: https://huggingface.co/blog/perceiver
- Paper de Perceiver (arXiv): https://arxiv.org/pdf/2103.03206.pdf
