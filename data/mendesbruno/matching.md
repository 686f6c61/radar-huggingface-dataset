# mendesbruno/matching

## Resumen

`mendesbruno/matching` es un modelo experimental de arquitectura híbrida CNN-Transformer desarrollado por Bruno Mendes para tareas de *matching* (emparejamiento o correspondencia entre datos). Se trata de un repositorio de investigación que incluye el código fuente (`inference.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) de solo 33.088 parámetros, pensado para pruebas de humo y no para uso en producción.

El modelo está diseñado con una configuración a escala *xlarge* pero con un tamaño de parámetros deliberadamente reducido para permitir inspeccionar cambios arquitectónicos antes de un entrenamiento completo. Incluye atención por grupos (*grouped query attention*), fusión por atención cruzada, activación GELU tanh y normalización GroupNorm. Es importante destacar que el checkpoint incluido **no ha sido entrenado** y no se presentan resultados de benchmarks en la documentación.

La relevancia de este repositorio radica en su carácter de punto de partida para investigación: el autor proporciona una implementación personalizada que requiere un adaptador explícito para las APIs de carga automática estándar, y recomienda una metodología de evaluación rigurosa (conjunto de validación pareado, múltiples semillas, y comparación con una línea base de capacidad equivalente) para cualquier trabajo futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida convolucional + transformer) |
| Parametros totales | 33.088 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques transformer en una configuración híbrida. Según la model card, el diseño incluye atención por grupos (*grouped query attention*), fusión mediante atención cruzada, activación GELU con aproximación tanh y normalización GroupNorm. La escala declarada es *xlarge*, aunque el número de parámetros es extremadamente reducido (33.088), lo que sugiere que se trata de una versión mínima para validar el diseño antes de escalar.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El repositorio incluye una receta de entrenamiento por defecto que utiliza el optimizador Lion con un programador de tasa de aprendizaje exponencial, pero el propio autor advierte que son valores iniciales del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- **Matching de datos**: el modelo está diseñado para tareas de emparejamiento o correspondencia entre elementos, aunque no se especifica el tipo concreto de datos (imágenes, texto, etc.).
- **Arquitectura híbrida**: combina extracción de características convolucional con razonamiento basado en atención transformer.
- **Atención por grupos**: reduce el coste computacional frente a la atención completa.
- **Fusión por atención cruzada**: permite integrar información de dos fuentes o modalidades.
- **Código fuente incluido**: el repositorio proporciona `inference.py` con un ejemplo ejecutable de prueba de humo.
- **Personalización**: al ser una implementación propia, permite modificar la arquitectura y la receta de entrenamiento.

**Nota importante**: estas capacidades son potenciales según el diseño arquitectónico. El checkpoint incluido no está entrenado, por lo que no se puede afirmar que el modelo realice ninguna de estas tareas de forma efectiva sin un entrenamiento previo.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son hipotéticos y dependen de completar un ciclo de entrenamiento adecuado. Una vez entrenado, podría aplicarse a:

- **Investigación en arquitecturas híbridas**: servir como banco de pruebas para validar modificaciones en la combinación CNN-Transformer antes de escalar a modelos mayores.
- **Prototipado rápido de sistemas de matching**: probar la viabilidad de un enfoque híbrido para tareas de correspondencia con un coste computacional mínimo.
- **Enseñanza y formación**: ilustrar la implementación de una arquitectura CNN-Transformer personalizada con atención por grupos y fusión cruzada.
- **Desarrollo de adaptadores**: crear un adaptador que permita cargar este modelo con APIs estándar de Hugging Face, contribuyendo a la interoperabilidad.
- **Comparación de metodologías de evaluación**: utilizar el repositorio como caso de estudio para aplicar la metodología recomendada (conjunto pareado, múltiples semillas, línea base de capacidad equivalente).
- **Experimentos de inicialización**: estudiar el comportamiento de diferentes estrategias de inicialización de pesos en arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reivindica ninguna puntuación de benchmark y que el checkpoint es una inicialización para pruebas de humo, no un modelo entrenado.

## Requisitos de hardware

- **VRAM estimada**: con solo 33.088 parámetros, el modelo cabe en cualquier GPU moderna, incluso en las más básicas. El uso de memoria es despreciable (menos de 1 MB en precisión FP32).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluso podría ejecutarse en CPU sin problemas.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU consumer (GTX 1050 en adelante) puede ejecutar este modelo.
- **Opciones de despliegue**: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador explícito o ejecutar el script `inference.py` incluido.
- **Latencia y throughput**: no se dispone de datos medidos. Dado el tamaño del modelo, la latencia sería del orden de microsegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. El repositorio no menciona modelos comparables ni proporciona datos de rendimiento. El propio autor recomienda incluir una línea base de capacidad equivalente en cualquier evaluación futura, lo que sugiere que aún no existe una comparación establecida.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el archivo `model.safetensors` es una inicialización para pruebas de humo, no un modelo entrenado. No debe usarse para ninguna tarea real.
- **Sin auditoría de robustez**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Sin resultados de benchmarks**: no se reivindica ninguna puntuación de rendimiento en el repositorio.
- **Implementación personalizada**: las APIs automáticas de carga de Hugging Face no funcionan directamente; se requiere un adaptador explícito.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor recomienda revisar los términos de las fuentes de datos externas si se usan con este repositorio.
- **Riesgo de alucinación**: al no estar entrenado, el modelo no puede generar respuestas coherentes; cualquier salida sería ruido.
- **Idiomas**: no se especifican idiomas soportados, lo que limita su uso a contextos donde no se requiera multilingüismo.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/mendesbruno/matching)
- [Perfil del autor en Hugging Face](https://huggingface.co/mendesbruno)
- [MatchAnything (proyecto relacionado con matching de imágenes)](https://zju3dv.github.io/MatchAnything/)
