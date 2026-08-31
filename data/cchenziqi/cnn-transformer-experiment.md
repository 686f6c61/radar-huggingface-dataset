# CCHENZIQI/cnn-transformer-experiment

## Resumen

El modelo `CCHENZIQI/cnn-transformer-experiment` es un experimento de arquitectura híbrida que combina redes convolucionales (CNN) con transformadores, orientado a tareas multitarea. Lo desarrolla el usuario CCHENZIQI y se publica bajo licencia Apache 2.0. Se trata de un repositorio de código y un checkpoint de inicialización, no de un modelo entrenado con fines de producción.

Con solo 16.576 parámetros, su escala es deliberadamente pequeña para permitir inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, pero el propio autor advierte de que no representa un modelo entrenado ni auditado. Su relevancia actual es limitada: sirve como punto de partida para investigar la fusión CNN-transformer con atención de ventana deslizante y normalización por lotes, pero no ofrece capacidades listas para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrido CNN + Transformer) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con un transformador que emplea atención de ventana deslizante (sliding window attention) y fusión mediante atención cruzada (cross attention). La activación es ReLU y la normalización se realiza con BatchNorm. El autor indica que la configuración incluida usa el optimizador Adam con un programador de tasa de aprendizaje OneCycle, pero aclara que son valores iniciales del script, no evidencia de un entrenamiento completado.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es una inicialización aleatoria para pruebas de humo, no un modelo entrenado. No hay ninguna innovación técnica documentada más allá de la combinación experimental de CNN y Transformer.

## Capacidades

- El modelo no tiene capacidades demostradas: el checkpoint no está entrenado.
- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling, function calling ni agentes.
- No se especifican capacidades multilingües.
- No hay modo de pensamiento (thinking mode) ni capacidades multimodales.

En resumen, las únicas capacidades verificables son las de un esqueleto arquitectónico ejecutable para experimentos de desarrollo.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son exclusivamente de investigación y desarrollo:

- Validación de arquitectura: ejecutar el script `run.py` para comprobar que el flujo de datos entre capas CNN y Transformer funciona correctamente.
- Pruebas de humo: cargar el checkpoint de inicialización y verificar que la propagación hacia adelante y hacia atrás no produce errores.
- Comparación de configuraciones: modificar `config.json` para experimentar con distintos tamaños de ventana de atención o número de capas convolucionales.
- Desarrollo de adaptadores: crear un adaptador explícito para cargar el modelo con APIs genéricas de Hugging Face, ya que es una implementación personalizada.
- Estudio de fusión CNN-Transformer: analizar cómo la atención cruzada combina características locales (CNN) con globales (Transformer) en tareas multitarea.
- Base para entrenamiento desde cero: usar el checkpoint como punto de partida para un entrenamiento real con datos propios, siguiendo las recomendaciones del autor sobre evaluación con múltiples semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 16.576 parámetros, el modelo cabe en cualquier GPU, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutar este modelo.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere un adaptador manual.
- Latencia y throughput: no disponibles, pero al ser un modelo minúsculo, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No hay modelos comparables en el sentido de que este es un experimento de arquitectura sin entrenar. Los modelos híbridos CNN-Transformer de la literatura (como CTran para detección de intenciones y relleno de slots) tienen millones de parámetros y están entrenados para tareas específicas. No procede una comparación directa.

| Modelo | Parámetros | Entrenado | Uso |
|---|---|---|---|
| CCHENZIQI/cnn-transformer-experiment | 16.576 | No | Experimental |
| CTran (rafiepour) | no disponible | Sí | Detección de intenciones y slot filling |
| Modelos híbridos típicos | >1M | Sí | Visión, NLP, etc. |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se puede usar en producción: no genera texto ni realiza ninguna tarea útil.
- Riesgo de alucinación: no aplica, pero si se entrena sin cuidado, podría aparecer.
- No hay información sobre sesgos, idiomas o contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no sirve para nada comercial en su estado actual.
- Es una implementación personalizada: las APIs genéricas de Hugging Face no la cargan sin un adaptador explícito.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores predeterminados incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CCHENZIQI/cnn-transformer-experiment
- Tema de GitHub sobre CNN-Transformer: https://github.com/topics/cnn-transformer
- Repositorio CTran (referencia de arquitectura similar): https://github.com/rafiepour/CTran
