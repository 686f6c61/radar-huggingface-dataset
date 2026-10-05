# Harrdan2001/experiment-matching

## Resumen
El modelo Harrdan2001/experiment-matching es un prototipo de investigación de tipo CNN-Transformer desarrollado por el usuario Harrdan2001 y publicado en HuggingFace bajo licencia MIT. Se presenta como un experimento a pequeña escala (tiny) orientado a tareas de matching, con una arquitectura híbrida que combina capas convolucionales y mecanismos de atención. El repositorio incluye un checkpoint de inicialización (no entrenado) de 33.088 parámetros, junto con scripts de ejemplo y ficheros de configuración.

El modelo no reclama métricas de rendimiento ni ha sido validado en ninguna tarea concreta. Su relevancia actual es exclusivamente como punto de partida para experimentación reproducible en arquitecturas híbridas, formatos de checkpoint y recetas de entrenamiento. No está pensado para uso en producción ni para aplicaciones finales.

La model card indica explícitamente que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, por lo que cualquier evaluación seria requiere entrenamiento previo y validación con conjuntos pareados y múltiples semillas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer (híbrida) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala | tiny |
| Atención | multi-query |
| Fusión | low-rank |
| Activación | mish |
| Normalización | batchnorm |

## Arquitectura y entrenamiento
La arquitectura es una combinación de redes convolucionales (CNN) y transformers, con atención de tipo multi-query y un mecanismo de fusión de bajo rango (low-rank). Emplea la activación mish y normalización por lotes (batchnorm). El tamaño del modelo es extremadamente reducido (33.088 parámetros), lo que lo sitúa en la categoría de prototipo tiny para pruebas de concepto.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que el checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado. La receta de experimento por defecto utiliza el optimizador Adam con un scheduler OneCycle, pero no hay evidencia de que se haya completado un entrenamiento real. No se han publicado innovaciones técnicas adicionales más allá de la combinación de atención multi-query y fusión low-rank.

## Capacidades
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documenta ningún modo especial (thinking, visión, audio, etc.).
- El modelo está etiquetado para "matching", pero no se especifica la tarea concreta ni el tipo de datos de entrada.
- Al ser un checkpoint de inicialización sin entrenamiento, no se puede afirmar que realice ninguna tarea de forma fiable.

## Casos de uso
- Investigación en arquitecturas híbridas CNN-Transformer: el modelo sirve como base para estudiar cómo se comportan capas convolucionales combinadas con atención multi-query en tareas de matching, permitiendo modificar la configuración y evaluar el impacto en un entorno controlado.
- Pruebas de integración de pipelines personalizados: el repositorio incluye `pipeline.py` con un bloque `__main__` de ejemplo, útil para validar flujos de carga de datos, preprocesamiento y ejecución de un modelo custom en PyTorch.
- Benchmarking de recetas de entrenamiento: la configuración por defecto (Adam + OneCycle) permite comparar estrategias de optimización en modelos pequeños, siguiendo las recomendaciones de la model card sobre validación pareada y múltiples semillas.
- Validación de formatos de checkpoint: el uso de `safetensors` y `config.json` facilita experimentar con serialización y carga de pesos en entornos de investigación.
- Estudio de mecanismos de atención eficiente: la atención multi-query y la fusión low-rank son técnicas relevantes para reducir coste computacional; este prototipo permite analizarlas a escala tiny.
- Docencia o aprendizaje: adecuado para demostrar cómo se implementa una arquitectura híbrida desde cero, incluyendo normalización batchnorm y activación mish, sin requerir grandes recursos de hardware.
- Pruebas de humo en CI/CD: al ser un modelo de 33k parámetros, puede integrarse en tests automatizados que verifiquen la correcta carga de pesos y la ejecución del pipeline sin coste significativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 MB en FP32 (33.088 parámetros), por lo que cabe en cualquier dispositivo, incluida CPU.
- GPU recomendadas: no se requiere GPU; funciona en CPU, Raspberry Pi o cualquier GPU consumer (GTX 1050, RTX 3060, etc.) sin limitaciones.
- Cabe en cualquier GPU consumer y en sistemas embebidos.
- Opciones de despliegue: al ser una implementación personalizada en PyTorch, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere el uso del script `pipeline.py` o un adaptador explícito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No disponible. No se dispone de información sobre modelos comparables de la misma categoría (prototipos CNN-Transformer para matching) en la información proporcionada.

## Limitaciones y advertencias
- El checkpoint incluido no ha sido entrenado; es una inicialización para pruebas de humo.
- No ha sido auditado en robustez, equidad o transferencia de dominio.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su calidad.
- Se desconoce la longitud de contexto soportada.
- No se especifican los idiomas soportados.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción al carecer de entrenamiento y validación.
- El uso con datasets externos requiere revisar los términos de las fuentes de datos por separado.
- Es un punto de partida experimental; cualquier resultado futuro debe documentarse de forma independiente a los valores por defecto aquí incluidos.

## Enlaces
- [HuggingFace: Harrdan2001/experiment-matching](https://huggingface.co/Harrdan2001/experiment-matching)
