# Abalogun96/mobilevit-finetuned

## Resumen

Este repositorio contiene un prototipo experimental de MobileViT orientado a la tarea de *matching* (emparejamiento de imágenes o características). MobileViT es una arquitectura de visión por computadora ligera que combina las eficiencia e inductivas de las redes convolucionales con la capacidad de modelado de contexto global de los transformers, tratando los transformers como convoluciones para reducir el coste computacional frente a los ViT estándar.

El modelo está desarrollado por el usuario Abalogun96 y se publica bajo licencia MIT. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, pero no se presenta como un modelo entrenado ni se reclama ningún resultado de evaluación. Con apenas 24.832 parámetros, es una implementación extremadamente pequeña, claramente orientada a investigación y experimentación, no a producción.

La relevancia de este repositorio es limitada: sirve como punto de partida para explorar arquitecturas MobileViT adaptadas a tareas de matching, pero carece de entrenamiento previo y de validación empírica. La implementación es personalizada, por lo que requiere un adaptador explícito para usarse con APIs genéricas de carga automática.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MobileViT, que integra convoluciones y atención lineal para procesar imágenes. Según la configuración incluida, usa atención *lineal*, fusión mediante *tensor fusion*, activación GELU (con aproximación tanh) y normalización ScaleNorm. Esta combinación es inusual para MobileViT estándar, que normalmente emplea LayerNorm y atención clásica, lo que sugiere una variante experimental.

En cuanto al entrenamiento, no hay datos disponibles sobre el dataset utilizado, el número de tokens (o imágenes) procesadas ni si se aplicó algún método de ajuste como RLHF o DPO. El repositorio indica que `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un modelo entrenado. La receta experimental por defecto usa Novograd con warmup lineal, pero se aclara que son valores iniciales del script, no evidencia de un entrenamiento completado.

## Capacidades

- No hay capacidades demostradas porque el modelo no está entrenado.
- La arquitectura MobileViT está diseñada para tareas de visión por computadora, como clasificación, detección o segmentación.
- La tarea declarada es *matching*, que podría referirse a emparejamiento de imágenes, búsqueda visual o verificación de similitud.
- Al ser un prototipo de investigación, no soporta tool calling, generación de texto, ni razonamiento multi-step.
- No hay soporte multilingüe ni capacidades de audio.
- La implementación es personalizada y no compatible con APIs genéricas de Hugging Face sin un adaptador explícito.

## Casos de uso

- Investigación experimental: sirve como base para estudiar la arquitectura MobileViT con attention lineal y normalización ScaleNorm en tareas de matching. Se puede usar para comparar variantes arquitectónicas con un presupuesto de entrenamiento controlado.
- Prototipo de entrenamiento: el script `finetune.py` incluye un ejemplo ejecutable y un punto de entrada de entrenamiento. Permite probar el flujo de ajuste fino con un dataset propio.
- Smoke test de infraestructura: el checkpoint de inicialización es útil para validar que el pipeline de entrenamiento y evaluación funciona correctamente antes de lanzar un entrenamiento completo.
- Pruebas de concepto de matching visual: se puede entrenar con un dataset pareado (por ejemplo, pares de imágenes similares) para explorar si la arquitectura aprende representaciones útiles.
- Comparación de variantes de atención: dado que usa atención lineal, permite comparar el rendimiento frente a MobileViT con atención estándar en la misma tarea.
- Educación y aprendizaje: es un ejemplo compacto de implementación de MobileViT, adecuado para estudiar el código y la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que no se reclama ninguna puntuación de evaluación.

## Requisitos de hardware

- Con solo 24.832 parámetros, el modelo cabe en cualquier GPU, incluso en CPUs.
- VRAM estimada: menos de 1 MB para el checkpoint, aunque la memoria para el entrenamiento dependerá del dataset y del tamaño de lote.
- GPU recomendadas: no se requiere una GPU específica; cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Es desplegable en hardware de consumo (portátiles, Raspberry Pi, etc.) si se convierte a formato adecuado.
- Opciones de despliegue: dado que es una implementación personalizada, no hay soporte directo con vLLM, llama.cpp, Ollama o TGI. Se requiere un adaptador o usar el propio script `finetune.py`.
- Latencia y throughput: no se dispone de datos, pero al ser tan pequeño, la inferencia sería casi instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No hay comparativa directa disponible porque el modelo no está entrenado ni se han publicado resultados. Como referencia, los modelos MobileViT estándar (como MobileViT-S, -XS) tienen entre 5 y 10 millones de parámetros, mientras que este prototipo tiene solo 24.832. La comparación no es significativa sin datos de rendimiento. Se indica que no se dispone de información suficiente para una comparación justa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad ni transferencia de dominio.
- La implementación es experimental y no está validada para uso en producción.
- No se recomienda su uso en sistemas críticos sin un entrenamiento adecuado y evaluación rigurosa.
- La licencia MIT permite uso comercial, pero hay que revisar los términos de los datos externos si se usan datasets de terceros.
- La arquitectura personalizada puede tener bugs o incompatibilidades con librerías estándar.
- No hay soporte para herramientas de inferencia comunes, lo que limita su despliegue práctico.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque es un modelo de visión, no de lenguaje.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Abalogun96/mobilevit-finetuned)
- [Documentación oficial de MobileViT en Hugging Face](https://huggingface.co/docs/transformers/v5.0.0/model_doc/mobilevit)
- [Documentación de MobileViT en GitHub (transformers)](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/mobilevit.md)
- [Ejemplo de MobileViT en Keras](https://keras.io/examples/vision/mobilevit/)
