# ramosl-orenzo/matching-run2

## Resumen

El modelo `ramosl-orenzo/matching-run2` es una implementación personalizada y compacta de **MobileViT** orientada a tareas de *matching* (correspondencia de características visuales entre imágenes). Ha sido desarrollado por el usuario `ramosl-orenzo` y publicado bajo licencia Apache-2.0. El repositorio contiene un checkpoint de inicialización (`model.safetensors`) de 49.600 parámetros, junto con el código fuente (`eval.py`), la configuración de arquitectura (`config.json`) y los argumentos de entrenamiento por defecto (`training_args.json`).

Es importante señalar que este modelo **no es un modelo preentrenado** ni está preparado para producción. La propia model card indica que la configuración "large" está pensada para revisión de código, pruebas de humo y experimentos controlados a pequeña escala. No se reivindica ningún resultado de benchmark en el repositorio. Su relevancia actual reside en servir como punto de partida para investigar arquitecturas MobileViT aplicadas a matching visual, no como un recurso desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (configuración large) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MobileViT es una arquitectura híbrida que combina capas convolucionales con bloques transformadores, diseñada originalmente para tareas de visión eficientes en dispositivos móviles. En esta implementación concreta, la configuración "large" emplea **atención sparse**, **fusión tipo tucker**, **activación approx gelu** y **normalización batchnorm**. Estos detalles están registrados en el `config.json` del repositorio.

En cuanto al entrenamiento, el checkpoint incluido es un **checkpoint de inicialización** válido para pruebas de humo, pero no ha sido entrenado con ningún dataset. La model card especifica que la receta de entrenamiento por defecto usa el optimizador **lion** con un programador de tasa de aprendizaje **polinomial**, pero estos son solo valores de partida en el script, no evidencia de una ejecución completada. No se proporciona información sobre el volumen de datos, composición del dataset ni técnicas como RLHF o DPO, ya que no aplican a un modelo de visión sin entrenar.

## Capacidades

- **Matching de características visuales**: el modelo está diseñado para establecer correspondencias entre puntos o regiones de dos imágenes de una misma escena, una tarea fundamental en visión por computador.
- **Procesamiento de imágenes**: al ser MobileViT, puede procesar entradas visuales (imágenes) y extraer representaciones densas o dispersas según la configuración.
- **Ejecución ligera**: con solo 49.600 parámetros, el modelo es extremadamente compacto y puede ejecutarse en entornos con recursos muy limitados.
- **No soporta generación de texto, código, tool calling, agentes ni razonamiento multi-paso**: es un modelo de visión puro, sin capacidades de lenguaje natural.
- **No es multilingüe**: no procesa texto, por lo que el concepto de idiomas no aplica.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso realistas se limitan al ámbito de la investigación y el desarrollo:

- **Pruebas de humo en pipelines de visión**: verificar que el código de carga, inferencia y guardado de resultados funciona correctamente antes de integrar un modelo entrenado.
- **Validación de la implementación personalizada**: comparar la salida del modelo con una implementación de referencia de MobileViT para detectar errores en la arquitectura o en los pesos inicializados.
- **Experimentos controlados de inicialización**: estudiar cómo afectan diferentes esquemas de inicialización de pesos al comportamiento del modelo antes del entrenamiento.
- **Desarrollo de adaptadores para APIs genéricas**: la model card advierte que las APIs automáticas requieren un adaptador explícito; este repositorio sirve para construir y probar dicho adaptador.
- **Evaluación de configuraciones de atención sparse y fusión tucker**: analizar el impacto de estas variantes arquitectónicas en tareas de matching con modelos de capacidad equivalente.
- **Establecimiento de líneas base de capacidad**: usar el checkpoint sin entrenar como referencia de rendimiento aleatorio para comparar futuros modelos entrenados con la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint no es un modelo entrenado. Por tanto, no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 49.600 parámetros, la huella de memoria es mínima. Incluso en precisión float32, el checkpoint ocupa menos de 1 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, y también en CPU.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o integradas. No se requiere hardware especializado.
- **Compatibilidad con GPU de consumo**: sí, absolutamente. Cualquier GPU de consumo actual puede ejecutar este modelo sin problemas.
- **Opciones de despliegue**: al ser una implementación personalizada en PyTorch, el despliegue se realiza mediante el script `eval.py` incluido. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje. Para este modelo de visión, lo natural es usar PyTorch directamente o exportar a ONNX si se desea.
- **Latencia y throughput**: no se dispone de datos medidos. Dado el tamaño reducido, se espera una latencia de milisegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio ni en los resultados de búsqueda web. El modelo es una implementación personalizada sin referencias externas de la misma categoría. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Modelo no entrenado**: el checkpoint es de inicialización, no ha sido entrenado con datos reales. Cualquier salida que produzca no tiene significado semántico ni utilidad práctica.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero en tareas de matching podría producir correspondencias espurias si se usara sin entrenamiento.
- **Sin auditoría de robustez, fairness o transferencia de dominio**: la model card advierte explícitamente que el checkpoint no ha sido auditado para estos aspectos.
- **Implementación personalizada**: las APIs genéricas de carga automática no funcionarán sin un adaptador explícito, lo que puede dificultar su integración en herramientas estándar.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero la model card recomienda revisar los términos de las fuentes de datos externas si se usan con datasets propios.
- **No apto para producción**: el autor lo presenta como un recurso experimental, no como un modelo listo para desplegar.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/ramosl-orenzo/matching-run2)
