# lucaosti/corn-inspection-pi0-checkpoints

## Resumen

Este repositorio contiene un barrido completo de checkpoints de fine-tuning de los modelos π0 y π0-FAST, desarrollados por Physical Intelligence, aplicados a una tarea de inspección de mazorcas de maíz mediante teleoperación robótica. El autor, lucaosti, publica estos artefactos como respaldo público de su trabajo de tesis de maestría, con un dataset derivado y anonimizado. El repositorio incluye múltiples ejecuciones de entrenamiento, cada una con su propia carpeta identificada por el identificador de ejecución de SLURM, y manifiestos con metadatos de reproducibilidad.

La relevancia de este modelo radica en que demuestra la aplicación de arquitecturas VLA (vision-language-action) de última generación a un dominio agrícola específico, lo que puede servir como referencia para otros investigadores que busquen fine-tuning de π0 en tareas de manipulación robótica. Sin embargo, al tratarse de un respaldo de checkpoints intermedios y no de un modelo final empaquetado, su uso práctico requiere un proceso de reconstrucción y validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0 (flow matching) o π0-FAST (autoregresiva con tokenizador FAST), según la ejecución |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o JAX, no confirmado) |

## Arquitectura y entrenamiento

El repositorio contiene un barrido de ejecuciones de fine-tuning sobre los modelos π0 y π0-FAST, ambos publicados en el proyecto openpi de Physical Intelligence. π0 es un VLA basado en flow matching que genera acciones continuas a partir de observaciones visuales y lenguaje, mientras que π0-FAST utiliza un tokenizador de acciones discreto (FAST) con decodificación autoregresiva. No se especifica cuál de las dos variantes corresponde a cada ejecución, aunque los nombres de las carpetas sugieren configuraciones como `pi0_h5_state-real` y `pi0_h10_state-zero`.

El entrenamiento se realizó sobre un dataset de teleoperación de inspección de mazorcas, anonimizado y derivado de un conjunto original. Los manifiestos `manifest_pre_run.json` y `manifest_post_run.json` documentan metadatos de reproducibilidad (hashes de commits, configuración resuelta, semilla, huella del dataset y hardware), pero advierten que tanto el repositorio `master-thesis` como `openpi` tenían cambios sin confirmar en el momento de la captura, por lo que el estado exacto del código no es totalmente reconstruible. Además, la configuración de entrenamiento resuelta no se capturó en varios casos, lo que limita la reproducibilidad completa.

## Capacidades

- Diseñado para tareas de inspección visual de mazorcas de maíz mediante manipulación robótica, con observaciones visuales y probablemente instrucciones en lenguaje.
- Al ser un fine-tuning de π0/π0-FAST, hereda las capacidades base de estos modelos: generación de acciones robóticas a partir de imágenes y texto, y soporte para múltiples plataformas robóticas (según la documentación de openpi).
- No se dispone de información específica sobre capacidades como tool calling, agentes o razonamiento multi-paso en este checkpoint.
- No se han documentado capacidades multilingües; el dataset original es de origen estadounidense (tag `region:us`).

## Casos de uso

Dado que se trata de un respaldo de checkpoints de investigación y no de un modelo final listo para producción, los casos de uso son principalmente de investigación y desarrollo:

- Reproducción de experimentos: los manifiestos permiten intentar replicar las ejecuciones, aunque con las limitaciones de reproducibilidad mencionadas.
- Análisis de sensibilidad a hiperparámetros: el barrido incluye variaciones en horizonte de acción (h5 vs h10), estado real vs cero y semillas (42, 43, 44), lo que permite estudiar su impacto en el rendimiento.
- Fine-tuning adicional: los checkpoints pueden servir como punto de partida para nuevas tareas de inspección agrícola, si se dispone de datos propios.
- Evaluación de generalización: comparar el comportamiento en entornos simulados o reales de inspección de cultivos.
- Investigación sobre VLA en robótica agrícola: este es un ejemplo concreto de aplicación en un dominio no cubierto por los datasets base de π0.
- Desarrollo de sistemas de inspección automatizada de mazorcas: aunque no hay evidencia de rendimiento, la arquitectura VLA es adecuada para tareas que requieren percepción visual y control motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de manipulación robótica para este conjunto de checkpoints.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la documentación del modelo. El tamaño del repositorio (484.6 GB) indica que contiene múltiples checkpoints completos, lo que sugiere que el entrenamiento se realizó en infraestructura de alto rendimiento (probablemente GPUs de datacenter como A100 o H100). Para inferencia, no se han documentado requisitos de VRAM ni opciones de despliegue. Se recomienda consultar la documentación de openpi para estimaciones generales de π0.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros fine-tunings de π0 en tareas similares. Existen otros repositorios como `juexzz/INTACT-pi0-finetune-bridge`, que también fine-tunea π0 (en este caso sobre BridgeV2), pero no hay métricas comparables publicadas. La comparación directa no es posible con la información disponible.

## Limitaciones y advertencias

- Reproducibilidad limitada: los manifiestos indican que había cambios sin confirmar en los repositorios de código, y que la configuración de entrenamiento resuelta no se capturó en varias ejecuciones. Esto impide una reconstrucción exacta de los experimentos.
- Licencia no especificada: no se indica ninguna licencia, por lo que el uso comercial o la redistribución no están claramente permitidos. Se debe contactar al autor para aclarar los términos.
- Dataset anonimizado: al ser una versión derivada y anonimizada, puede que no se conozcan todos los detalles del dataset original, lo que afecta la interpretación de los resultados.
- Sin documentación de rendimiento: no hay métricas de éxito ni evaluaciones en entornos estándar, por lo que no se puede afirmar su eficacia en tareas reales.
- Tamaño y estructura: el repositorio es un respaldo de múltiples ejecuciones, no un modelo único empaquetado. Su uso requiere identificar la ejecución deseada y reconstruir el entorno de ejecución.
- Posibles problemas de sesgo: al estar entrenado en un dataset de teleoperación de una región específica (EE. UU.), puede no generalizar a otros entornos o variedades de maíz.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lucaosti/corn-inspection-pi0-checkpoints
- Proyecto openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Sitio web de OpenPI: https://www.openpi.net/english.html
- Ejemplo de fine-tuning de π0 en BridgeV2: https://huggingface.co/juexzz/INTACT-pi0-finetune-bridge
