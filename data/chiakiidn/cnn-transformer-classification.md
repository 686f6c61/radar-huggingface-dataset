# chiakiidn/cnn-transformer-classification

## Resumen

El modelo `chiakiidn/cnn-transformer-classification` es una implementación experimental de una arquitectura híbrida CNN-Transformer orientada a tareas de clasificación. Desarrollado por el usuario `chiakiidn`, el repositorio se presenta como un código de trabajo con un checkpoint de inicialización válido para pruebas de humo, pero sin ningún entrenamiento real ni resultados de benchmarks publicados. Su propósito principal es servir como punto de partida para investigar modificaciones arquitectónicas antes de un entrenamiento completo.

La arquitectura combina una red convolucional con un transformer de atención dispersa y fusión de bajo rango, con activación swish y normalización por batchnorm. El modelo tiene 49.600 parámetros, un tamaño extremadamente reducido, y se distribuye bajo licencia Apache-2.0 en formato safetensors. No se especifican la longitud de contexto, los idiomas soportados ni el pipeline de uso, y el autor advierte explícitamente de que el checkpoint incluido no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrido CNN + Transformer) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un híbrido CNN-Transformer con atención dispersa (sparse attention) y fusión de bajo rango (low-rank fusion). La activación es swish y la normalización es batchnorm. El autor indica que la configuración es de escala "large", aunque con solo 49.600 parámetros, esta denominación es relativa al propio código y no a modelos de gran escala convencionales.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El repositorio incluye un `config.json` con la configuración arquitectónica generada y un `training_args.json` con la receta de experimento por defecto (optimizador AdamW con schedule polinomial), pero estos son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- Clasificación genérica: el modelo está diseñado para tareas de clasificación, pero al no estar entrenado, no tiene capacidades demostradas.
- Implementación personalizada: requiere un adaptador explícito para cargarse con APIs genéricas de Hugging Face; no es compatible con `AutoModel` estándar.
- Código reproducible: incluye un script `inference.py` con un ejemplo de prueba de humo generado en el bloque `__main__`.
- Sin capacidades adicionales: no hay soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación arquitectónica: el modelo sirve como banco de pruebas para experimentar con combinaciones CNN-Transformer, atención dispersa y fusión de bajo rango antes de escalar a datasets grandes.
- Desarrollo de prototipos: los desarrolladores pueden usar el código como base para implementar su propia arquitectura híbrida y adaptarla a dominios específicos.
- Educación y aprendizaje: útil para estudiar cómo se integran capas convolucionales con transformers en un mismo modelo, dado su tamaño mínimo y código legible.
- Pruebas de integración: el checkpoint de inicialización permite verificar que el pipeline de inferencia y entrenamiento funciona correctamente en un entorno dado.
- Comparación de baselines: el autor sugiere usarlo como baseline de capacidad equivalente en experimentos controlados con otros modelos.
- Exploración de regularización: al ser un modelo diminuto, es adecuado para probar técnicas de regularización o schedules de entrenamiento con coste computacional despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no es un checkpoint entrenado.

## Requisitos de hardware

- VRAM estimada: al tener solo 49.600 parámetros, el modelo cabe en cualquier GPU con más de 1 GB de VRAM, incluso en CPU sin problema.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o integradas.
- Compatibilidad con consumer GPU: sí, sin ninguna restricción.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere ejecutar el script `inference.py` o escribir un adaptador.
- Latencia y throughput: no disponibles, pero por el tamaño del modelo, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoría con datos públicos de rendimiento. Existen otros repositorios con nombres similares (por ejemplo, `Purnomorafi/cnn-transformer-classification`), pero no se han publicado métricas comparables. La comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado: es una inicialización aleatoria, por lo que no produce resultados útiles para clasificación real.
- No hay datos de sesgos, robustez ni equidad: el autor advierte que el modelo no ha sido auditado para estos aspectos.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto libre.
- Sin soporte de carga automática: requiere un adaptador explícito; las APIs genéricas de Hugging Face no funcionarán directamente.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar los términos de los datos externos si se usan con otros datasets.
- No se proporcionan métricas de rendimiento ni garantías de funcionamiento en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chiakiidn/cnn-transformer-classification
- Repositorio similar de referencia: https://huggingface.co/Purnomorafi/cnn-transformer-classification
- Tema "cnn-transformer" en GitHub: https://github.com/topics/cnn-transformer
