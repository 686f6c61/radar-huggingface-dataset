# nigutierrez/hw1-retrieval

## Resumen

`nigutierrez/hw1-retrieval` es un repositorio experimental alojado en Hugging Face que implementa una arquitectura EfficientFormer adaptada a tareas de recuperación (retrieval). Lo publica el usuario nigutierrez como artefacto de un trabajo práctico (el identificador `hw1` sugiere "homework 1") y no como un modelo entrenado listo para producción. El repositorio contiene el código de definición del modelo, un `config.json` con los hiperparámetros de arquitectura, un `training_args.json` con la receta de entrenamiento por defecto y un checkpoint de inicialización en `model.safetensors`.

El modelo se presenta explícitamente como un punto de partida para pruebas de humo (smoke tests), no como un checkpoint con resultados de benchmark. El autor indica que no se reclama ninguna puntuación de rendimiento en el repositorio y que el checkpoint no ha sido entrenado ni auditado. La escala declarada es "small", con atención de tipo flash, fusión mediante cross-attention, activación GELU-Tanh y normalización por BatchNorm.

Por tanto, esta ficha debe leerse como documentación de un esqueleto de código y configuración, no de un modelo con capacidades demostradas. Cualquier evaluación real requeriría entrenar el modelo sobre un dataset como Flickr30k y compararlo con una línea base de capacidad equivalente, tal como sugiere el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormer (variante "small") |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es una implementación personalizada de EfficientFormer en escala "small", con atención de tipo flash, fusión mediante cross-attention, activación GELU-Tanh y normalización BatchNorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador AdamW con un schedule de warmup lineal.

No hay evidencia de que se haya completado un entrenamiento: el propio autor indica que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo y que no se presenta como un checkpoint entrenado ni evaluado. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. La receta incluida debe interpretarse como valores de partida en el script, no como prueba de una ejecución finalizada.

## Capacidades

- No se han documentado capacidades funcionales del modelo en la información disponible.
- El repositorio está orientado a tareas de retrieval (recuperación de información), pero no se aportan métricas ni ejemplos de uso validados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades especiales (modo thinking, visión, audio, etc.).
- El checkpoint incluido es de inicialización, por lo que no cabe esperar comportamiento útil sin entrenamiento previo.

## Casos de uso

- Pruebas de humo de arquitectura: el checkpoint de inicialización permite verificar que el código de definición del modelo carga y ejecuta un forward pass antes de lanzar un entrenamiento completo.
- Desarrollo de pipelines de retrieval experimentales: el código sirve como base para implementar y depurar un sistema de recuperación sobre un dataset propio, sustituyendo el checkpoint por uno entrenado.
- Investigación académica sobre EfficientFormer: útil para inspeccionar variantes de arquitectura (atención flash, cross-attention, BatchNorm) antes de comprometer recursos de cómputo.
- Reproducción de experimentos docentes: el repositorio incluye `training_args.json` con la receta por defecto, lo que facilita replicar el setup en un contexto de asignatura o trabajo práctico.
- Evaluación comparativa de líneas base: el autor sugiere evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, por lo que el repositorio puede servir como punto de partida para ese protocolo.
- Integración en scripts personalizados: al ser una implementación custom, requiere un adaptador explícito para usar APIs de carga automática genéricas, lo que lo hace adecuado para entornos donde se controla el código de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación en el repositorio y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo tiene 49.600 parámetros, por lo que cabría en cualquier GPU consumer, pero no se han publicado mediciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: previsiblemente sí por el tamaño, aunque no hay datos oficiales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación custom, requiere un adaptador explícito para APIs de carga automática.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (retrieval con EfficientFormer) ni datos de rendimiento que permitan establecer una comparación.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado; es solo una inicialización para pruebas de humo.
- El autor declara que el modelo no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se han publicado métricas de rendimiento, por lo que no hay evidencia de calidad en ninguna tarea.
- No se documentan sesgos conocidos, pero al no haber entrenamiento ni auditoría, no puede descartarse su presencia tras un futuro entrenamiento.
- Riesgo de alucinación: no aplica en el estado actual (modelo sin entrenar), pero no hay datos para evaluarlo tras entrenamiento.
- No se especifican limitaciones de contexto ni de idioma.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; el autor recomienda revisar por separado los términos de los datos fuente si se usa con datasets externos.
- Al ser una implementación custom, las APIs genéricas de carga automática requieren un adaptador explícito.
- Para producción sería necesario entrenar el modelo, documentar los resultados por separado del estado por defecto y realizar una evaluación rigurosa con múltiples semillas.

## Enlaces

- Hugging Face: https://huggingface.co/nigutierrez/hw1-retrieval
