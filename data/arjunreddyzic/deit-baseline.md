# arjunreddyzic/deit-baseline

## Resumen

Este repositorio contiene una implementación personalizada del modelo DeiT (Data-efficient Image Transformers) en su variante "nano", orientada a tareas de clasificación de imágenes. El autor, Arjun Reddy, publica un checkpoint de inicialización válido para pruebas de humo, pero no un modelo entrenado. La arquitectura incorpora atención dilatada, fusión por co-atención, activación GELU y normalización ScaleNorm, lo que la convierte en un punto de partida reproducible para experimentos de investigación.

El modelo tiene únicamente 49.600 parámetros, un tamaño extremadamente reducido que lo hace ejecutable incluso en CPU. Su relevancia radica en servir como base para comparar estrategias de entrenamiento y arquitecturas ligeras, no como un sistema listo para producción. La licencia MIT permite su uso y modificación sin restricciones comerciales, aunque el autor advierte que el checkpoint no ha sido entrenado ni auditado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (variante nano) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño DeiT original, adaptado a una escala mínima. Incluye atención dilatada (dilated attention) para ampliar el campo receptivo sin aumentar el número de parámetros, y un mecanismo de fusión por co-atención que combina información de múltiples ramas. La normalización ScaleNorm sustituye a LayerNorm, y la activación GELU se emplea en las capas feed-forward.

El repositorio incluye una receta de entrenamiento por defecto basada en el optimizador AdamW con un programa de calentamiento constante. Sin embargo, el checkpoint publicado es solo de inicialización: no se proporcionan datos de entrenamiento, número de tokens ni composición del dataset. El autor recomienda entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias para obtener evaluaciones significativas.

## Capacidades

- Clasificacion de imagenes: la arquitectura está diseñada para tareas de clasificación, aunque el checkpoint actual no ha sido entrenado, por lo que no produce predicciones útiles sin un entrenamiento previo.
- Reproducibilidad: sirve como punto de partida para reproducir experimentos con configuraciones explícitas (config.json y training_args.json).
- Personalizacion: al ser una implementación propia, permite modificar la arquitectura (atención, fusión, normalización) para investigar variantes.
- Integracion: el script inference.py incluye un ejemplo de prueba de humo, aunque requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.

## Casos de uso

- Investigacion academica: como baseline de baja capacidad para comparar técnicas de regularización, aumento de datos o estrategias de destilación en clasificación de imágenes.
- Pruebas de integracion: validar pipelines de entrenamiento y evaluación con un modelo mínimo que no requiere recursos significativos.
- Ensenanza: ilustrar el funcionamiento interno de un transformer de visión con un código legible y configurable.
- Desarrollo de nuevas arquitecturas: usar la implementación como base para experimentar con atención dilatada o co-atención en dominios específicos.
- Benchmarking de hardware: medir latencia y consumo de recursos en dispositivos embebidos o CPUs, dado su tamaño reducido.
- Prototipado rapido: probar flujos de trabajo de HuggingFace (carga, guardado, versionado) con un modelo ligero antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado. Cualquier evaluación futura debe documentarse por separado, con métricas de tarea, al menos tres semillas y una baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, incluso en cuantización FP32, debido a los 49.600 parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, incluyendo tarjetas como GTX 1650, RTX 2060 o superiores.
- Opciones de despliegue: al ser un checkpoint de inicialización, no está pensado para inferencia en producción. Para experimentos, puede ejecutarse con PyTorch estándar; no se proporcionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, pero se espera que sean despreciables dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras implementaciones de DeiT nano o modelos de tamaño equivalente. El repositorio oficial de DeiT (facebookresearch/deit) ofrece variantes tiny, small y base con parámetros que oscilan entre 5M y 86M, pero no se han publicado métricas para esta implementación concreta. Se recomienda consultar el paper original para referencias de rendimiento de DeiT en general.

## Limitaciones y advertencias

- Checkpoint no entrenado: el archivo model.safetensors es solo una inicialización; no produce resultados de clasificación válidos sin entrenamiento.
- Sin auditoria: no se ha evaluado robustez, equidad ni transferencia a dominios específicos.
- Experimental: la implementación debe tratarse como un punto de partida, no como un modelo estable.
- Compatibilidad limitada: las APIs genéricas de HuggingFace no pueden cargar el modelo sin un adaptador explícito.
- Datos externos: la licencia MIT cubre el código, pero los términos de los datasets utilizados deben revisarse por separado.
- Sin soporte de producción: no se recomienda su uso en entornos reales sin un entrenamiento y validación exhaustivos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arjunreddyzic/deit-baseline
- Repositorio oficial de DeiT (GitHub): https://github.com/facebookresearch/deit
- Documentacion de DeiT en HuggingFace Transformers: https://huggingface.co/docs/transformers/model_doc/deit
- Perfil del autor: https://huggingface.co/arjunreddyzic/models
