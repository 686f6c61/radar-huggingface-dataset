# robgarct/attention-120m-rare4-6k

## Resumen

attention-120m-rare4-6k es un modelo de lenguaje de 120 millones de parámetros desarrollado por el usuario robgarct y publicado en Hugging Face. Se trata de un transformer autoregresivo de auto-atención entrenado sobre el dataset Pile durante 6.000 actualizaciones (equivalentes a 3.146 millones de tokens). Su particularidad no reside en la arquitectura, sino en el objetivo de entrenamiento: emplea la denominada "rare first-recall objective", en la que las completaciones de bigramas poco frecuentes en contexto reciben una ponderación de 4x manteniendo la media del objetivo.

El modelo forma parte de una cuadrícula de experimentos de enrutamiento (router grid) a 120M y actúa como referencia de atención 4x para esa cuadrícula, compartiendo arquitectura y presupuesto de cómputo con `robgarct/attention-120m-ce-6k`. Su interés es fundamentalmente de investigación: permite estudiar cómo afecta la ponderación de ejemplos raros en la recuperación en contexto (in-context recall) frente a un entrenamiento con entropía cruzada estándar.

No se trata de un modelo orientado a producción ni a uso general: no hay información sobre licencia, idiomas soportados ni pipeline declarado, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Su valor está en servir como punto de comparación reproducible dentro de una línea de experimentos sobre circuitos de recuperación recurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con auto-atencion |
| Parametros totales | 120M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`final.ckpt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de auto-atención de 120M de parámetros, sin componentes MoE ni arquitecturas híbridas SSM. Se entrenó sobre el dataset Pile con un presupuesto de 6.000 actualizaciones, lo que equivale a 3.146 millones de tokens procesados. El checkpoint publicado (`final.ckpt`) tiene el estado del optimizador eliminado y conserva `global_step` en 6000; se acompaña de `resolved-config.yaml` con la configuración exacta de entrenamiento y `metadata.json` con la identidad de la ejecución.

La innovación técnica está en el objetivo de entrenamiento: la "rare first-recall objective" pondera 4x las completaciones de bigramas poco frecuentes en contexto, aplicando una transformación que preserva la media del objetivo original. Según la model card, esto se traduce en una perplejidad de 2.44 en la métrica Rare-AR PPL y un 38.5% en Natural FDA sobre los 1.102 ejemplos disponibles, frente a una perplejidad de 12.19 en las 1.000 secuencias de validación del Pile. No se documenta el uso de RLHF, DPO ni datos de preferencias.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje sobre el Pile.
- Recuperación en contexto (in-context recall) de bigramas poco frecuentes, que es el objetivo específico para el que se diseñó la ponderación 4x.
- Completado de bigramas en contexto, evaluado mediante la métrica Rare-AR PPL.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica; los idiomas soportados figuran como no disponibles.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre objetivos de entrenamiento: el modelo sirve para comparar el efecto de ponderar ejemplos raros (4x) frente al entrenamiento con entropía cruzada estándar del checkpoint `attention-120m-ce-6k`, manteniendo arquitectura y presupuesto idénticos.
- Estudio de recuperación en contexto: permite analizar cómo un transformer pequeño mejora en tareas de recall de bigramas raros, usando la métrica Rare-AR PPL como indicador directo.
- Reproducción de experimentos: la inclusión de `resolved-config.yaml` y `metadata.json` facilita replicar exactamente el entrenamiento y verificar resultados en la cuadrícula de enrutamiento a 120M.
- Análisis de circuitos de recuperación: la librería `recurrent-recall-circuits` asociada sugiere su uso en el estudio de mecanismos internos de atención responsables del recall.
- Docencia y divulgación: al ser un modelo de 120M con checkpoint abierto, es adecuado para ilustrar en cursos cómo cambia el comportamiento de un transformer según el objetivo de entrenamiento.
- Evaluación de métricas de fidelidad: el resultado de Natural FDA (38.5% sobre 1.102 ejemplos) permite usar el modelo como referencia en la validación de métricas de atribución o fidelidad en modelos pequeños.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Pile PPL (1.000 secuencias de validacion) | 12.19 |
| Rare-AR PPL | 2.44 |
| Natural FDA (1.102 ejemplos) | 38.5% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (120M parámetros), en fp32 ocuparía aproximadamente 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (0,5 GB de repositorio), aunque no se documenta compatibilidad con herramientas concretas.
- Opciones de despliegue: no disponible; el formato es un checkpoint PyTorch (`final.ckpt`) y la librería asociada es `recurrent-recall-circuits`, no vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| attention-120m-rare4-6k | 120M | no disponible | Pile, 6.000 updates (3.146B tokens), objetivo rare first-recall 4x | no disponible | Hugging Face (0 descargas) |
| attention-120m-ce-6k | 120M | no disponible | Pile, mismo presupuesto, entropía cruzada estándar | no disponible | Hugging Face |
| Otros transformers de ~120M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con `robgarct/attention-120m-ce-6k`, que comparte arquitectura y presupuesto pero usa entropía cruzada estándar; la model card lo identifica explícitamente como la referencia de control. No se dispone de datos de benchmarks de ese checkpoint en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe.
- Longitud de contexto no disponible: se desconoce la ventana máxima de entrada.
- Riesgo de alucinación inherente a un modelo de lenguaje entrenado sobre Pile, sin ajuste por preferencias ni RLHF.
- Sesgos potenciales derivados de la composición del dataset Pile, no evaluados en la model card.
- Formato de pesos en checkpoint PyTorch: requiere cargar la configuración y el código de la librería `recurrent-recall-circuits`, lo que limita la portabilidad frente a safetensors o GGUF.
- Sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad de los resultados reportados.
- Las métricas Rare-AR PPL y Natural FDA son específicas del objetivo de entrenamiento y no son comparables con benchmarks estándar de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/robgarct/attention-120m-rare4-6k
- Checkpoint de control con entropía cruzada: https://huggingface.co/robgarct/attention-120m-ce-6k
- Librería `recurrent-recall-circuits`: no disponible como enlace directo en la información proporcionada
- Paper, blog, repositorio o demo: no disponible
