# bcywinski/qwen3.5-9b-instruct-msm-packaging-gg-aft-setA-r64

## Resumen

Este adaptador LoRA de rango 64, desarrollado por bcywinski, se aplica sobre el modelo base Qwen/Qwen3.5-9B y forma parte del proyecto de investigación "midtraining-generalisation". El objetivo del trabajo es determinar si el midtraining (entrenamiento intermedio) cambia lo que un ajuste fino fijo generaliza. En concreto, se entrenó el adaptador sobre un dataset sintético de preferencias de queso generado por el propio Qwen3.5-9B, con 4822 muestras de entrenamiento y 99 de validación.

El modelo no es un sistema de propósito general, sino una celda concreta dentro de una cuadrícula experimental más amplia. Esta celda parte de un checkpoint que ya contiene el organismo de midtraining denominado "packaging MSM" con preferencia "set A", y sobre él se realiza un ajuste fino adicional con datos de queso. El adaptador se publica como pesos PEFT en formato safetensors, con un tamaño de repositorio de 0,6 GB.

La relevancia del modelo es puramente científica: permite comparar la generalización de un mismo conjunto de ajuste fino aplicado sobre distintas inicializaciones (con y sin midtraining) y sobre el modelo instruct sin adaptar. No hay datos de contexto, idiomas ni arquitectura del modelo base en la información proporcionada más allá de su tamaño nominal de 9B.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3.5-9B (modelo base transformer) |
| Parametros totales | 9B (modelo base) + adaptador LoRA r=64 (n.º de parámetros no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (para el adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 32, dropout 0 y 12 módulos objetivo. Se entrenó con `SFTTrainer` de TRL sobre una sola GPU H100 en precisión bf16, durante 302 pasos de optimizador, con tamaño de lote efectivo de 16 secuencias. El optimizador fue AdamW con lr 1e-4, los betas 0,9/0,999, eps 1e-8, weight decay 0,01, y un scheduler coseno con warmup ratio 0,05. El tiempo de entrenamiento fue de 290 segundos y la pérdida final de entrenamiento fue 0,2237.

Una particularidad técnica es que el adaptador se exportó desde un entorno Tinker y se continuó directamente con TRL en Modal, lo que introduce diferencias en la agregación de la pérdida (TRL promedia sobre los tokens de un lote frente al promedio por ejemplo) y en los números de las librerías. Además, la escala efectiva del LoRA es 0,5 (r=64, alpha=32), que se desvía del esquema recomendado en el artículo de referencia, donde con rank 64 se usaba alpha 128 (escala 2). Los pesos iniciales provienen de un checkpoint intermedio que incorpora el organismo de "packaging MSM", y el ajuste posterior se hizo sobre un dataset de preferencias de queso con 4822 filas creadas por el propio modelo Qwen3.5-9B.

El entrenamiento utiliza un renderizado específico llamado `qwen3_5_disable_thinking`, que fuerza un bloque `<think>` vacío y calcula la pérdida solo en el turno final del asistente, incluyendo su token de fin de turno.

## Capacidades

- El adaptador no introduce capacidades nuevas por sí mismo; modifica las preferencias del modelo base en un dominio muy específico (preferencias de queso sobre un conjunto A).
- No se ha evaluado ni documentado el comportamiento del modelo base Qwen/Qwen3.5-9B en tareas generales de generación de texto, razonamiento, código o matemáticas dentro de esta información.
- No se indica soporte para tool calling, function calling, agentes, visión ni audio.
- El modelo no fue entrenado para seguir instrucciones generales ni para tareas conversacionales estándar; es una pieza de un experimento de generalización.

## Casos de uso

- Investigación en generalización de ajuste fino: este adaptador permite comparar cómo un conjunto de datos fijo de preferencias (dataset de queso set A) se generaliza cuando se parte de una inicialización con midtraining frente a una sin él. Es una herramienta para estudiar la transferencia de conocimiento entre fases de entrenamiento.
- Análisis de efectos del midtraining sobre la capacidad de aprendizaje: el modelo sirve como condición experimental para aislar la influencia del organismo de empaquetado ("packaging MSM") en la adaptación final a una tarea concreta.
- Reproducibilidad de experimentos de investigación: el README documenta la receta completa (épocas, lote, optimizador, semilla, tiempo, NLL) para que otros investigadores puedan replicar los resultados en su entorno.
- Comparación de escalas de adaptadores: la desviación en alpha (escala efectiva 0,5 en lugar de 2) permite estudiar el impacto de la escala del LoRA cuando se hereda un adaptador exportado, lo que puede ser útil para calibrar hiperparámetros en proyectos similares.
- Evaluación de la pérdida negativa log-verosímil como métrica de ajuste: el proyecto publica NLL antes y después del entrenamiento (0,8754 a 0,1801) sobre datos reservados, lo que proporciona una referencia metodológica para medir el grado de sobreajuste o generalización en tareas de preferencia.
- Uso como control en experimentos de ablación: al ser una celda de una cuadrícula de 2x2 más un control sin midtraining, este modelo se puede emplear como comparación directa con otros adaptadores del mismo proyecto, por ejemplo, los que parten del modelo instruct sin adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica documentada es la pérdida negativa log-verosímil (held-out NLL) sobre el conjunto de validación, calculada sobre los tokens supervisados. Los valores son los siguientes:

| Métrica | Antes del ajuste | Después del ajuste |
|---|---|---|
| Held-out NLL (media por ejemplo) | 0,8754 | 0,1801 |

La "antes" corresponde a los pesos iniciales del adaptador (el checkpoint con midtraining) evaluado sobre las mismas filas reservadas, lo que muestra que la inicialización ya predice parte de los datos. El modelo base sin midtraining parte de un rango de NLL de 1,09 a 1,17 según el README, aunque esos valores corresponden a otras celdas del proyecto.

## Requisitos de hardware

- El entrenamiento de este adaptador se realizó en 1x GPU H100 con bf16 durante 290 segundos, según la documentación incluida.
- Para inferencia es necesario cargar el modelo base Qwen/Qwen3.5-9B junto con el adaptador LoRA. No se proporcionan requisitos de VRAM específicos, pero un modelo de 9B en bf16 ocupa aproximadamente 18 GB; con cuantización (por ejemplo, 4 bit) se podría ejecutar en una GPU con 12 GB, aunque esto no está confirmado en la información.
- En una GPU de consumo como la RTX 4090 (24 GB) es probable que el modelo completo en bf16 quepa sin problemas, aunque no hay datos medidos.
- Las opciones de despliegue habituales para este tipo de adaptadores son vLLM, TGI o llama.cpp tras fusionar el adaptador con los pesos base. No se indican configuraciones de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. El adaptador forma parte de una cuadrícula experimental que incluye al menos las siguientes variantes:

- El mismo adaptador sobre el checkpoint con midtraining "packaging MSM", pero con preferencia "set B".
- Otro organismo de midtraining con preferencia de color "green/blue" que no es set A.
- El control sin midtraining: un LoRA fresco sobre el modelo instruct Qwen/Qwen3.5-9B, que según el README copia el rango, alpha, dropout y módulos objetivo del adaptador MSM para que la comparación solo difiera en los pesos iniciales.

Sin embargo, no se han publicado fichas técnicas detalladas de estos modelos comparables, ni benchmarks que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo es un adaptador experimental y no ha sido evaluado en tareas de seguridad, sesgos o alucinaciones.
- Los datos de entrenamiento son preferencias sintéticas de queso generadas por el propio modelo base; no representan un dominio útil para aplicaciones reales.
- La desviación en alpha (escala efectiva 0,5 en lugar de 2) puede causar un comportamiento de adaptación distinto al previsto, y el learning rate no se ajustó en consecuencia.
- Las diferencias en el cálculo de la pérdida entre Tinker y TRL, así como las diferencias numéricas entre frameworks, pueden producir resultados no idénticos si se replica el entrenamiento.
- El adaptador debe aplicarse sobre el modelo base Qwen/Qwen3.5-9B; no es un modelo autónomo ni está pensado para ser utilizado sin el contexto del proyecto.
- La licencia MIT permite el uso comercial del adaptador, pero el uso del modelo base original está sujeto a su propia licencia, que no se ha detallado en la información proporcionada.

## Enlaces

- Repo del modelo: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-gg-aft-setA-r64
- Pesos iniciales (checkpoint MSM): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-chatgpt-green-claude-blue-r64
- Dataset de ajuste fino: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setA
- Proyecto en GitHub: https://github.com/cywinski/midtraining-generalisation (commit `050253a`)
