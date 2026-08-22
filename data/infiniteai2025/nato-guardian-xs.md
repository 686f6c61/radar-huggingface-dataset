# iNFINITEAi2025/NATO-Guardian-XS

## Resumen

NATO-Guardian-XS es un modelo de lenguaje compacto desarrollado por el usuario iNFINITEAi2025, publicado en Hugging Face con fines estrictamente de investigación. Se trata de un transformer causal de 640.256 parámetros entrenado desde cero sobre una tarea sintética y auditable, generada mediante plantillas deterministas locales. El modelo no pretende ser un sistema de propósito general, sino una demostración de reproducibilidad y una evaluación acotada dentro de un entorno controlado.

La relevancia de este checkpoint radica en su transparencia: el proceso de entrenamiento, los datos y las métricas están documentados para permitir la reproducción exacta del experimento. Sin embargo, el propio autor advierte que las métricas de next-token no demuestran razonamiento general, fiabilidad factual ni capacidades de agente. El modelo está pensado para inspección técnica y validación de metodologías, no para despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny_causal_transformer |
| Parametros totales | 640.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio con 0.0 GB; probablemente PyTorch, sin pesos publicados) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tamaño reducido, con 640.256 parámetros. Se entrenó desde una inicialización aleatoria durante 240 pasos, con una semilla fija (20260825). El conjunto de entrenamiento se generó localmente mediante plantillas deterministas en el script `train_portfolio.py`, sin datos externos ni pesos descargados. No se dispone de información sobre el número total de tokens, composición del dataset ni uso de técnicas como RLHF o DPO. La pérdida final de entrenamiento es de 0.01806, con una pérdida media de 1.376235, y en el conjunto de evaluación la pérdida de next-token es de 0.012101 con una precisión del 99,37%.

## Capacidades

- Generación de texto condicionada a una petición: el modelo produce respuestas estructuradas en formato JSON, como `{"decision":"ALLOW","risk":"low","confidence":"high"}`.
- Capacidad de clasificación binaria de riesgo (ALLOW/denegación) en un dominio sintético muy restringido.
- No se ha verificado capacidad de tool calling, razonamiento multi-paso, generación de código, matemáticas avanzadas ni comprensión multimodal.
- Soporte únicamente del idioma inglés según la etiqueta del modelo.
- No se ha demostrado capacidad de agentes ni razonamiento complejo; el alcance se limita a la tarea sintética para la que fue entrenado.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite verificar el proceso de entrenamiento descrito en el repositorio, ejecutando `python3 train_portfolio.py --steps 80 --output artifacts`.
- Validación de metodologías de entrenamiento con datos sintéticos: sirve como ejemplo para comparar el impacto de la semilla, el número de pasos y las plantillas en el rendimiento final.
- Auditoría de la cadena de entrenamiento: al ser un modelo pequeño y con datos generados de forma determinista, se puede auditar la trazabilidad de los datos y el proceso de entrenamiento.
- Evaluación de métricas de next-token en tareas acotadas: útil para probar herramientas de evaluación y métricas de precisión en entornos controlados.
- Demostración de riesgos de sobreajuste: la alta precisión en el conjunto de prueba sintético contrasta con la falta de generalización, lo que puede ilustrar los peligros de evaluar únicamente con datos generados por plantillas.
- Formación en seguridad de IA: el modelo se puede usar como ejemplo de un sistema que no debe desplegarse en entornos de alto riesgo, destacando las limitaciones de los modelos pequeños.

## Benchmarks y rendimiento

El modelo no ha sido evaluado en benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos disponibles son los que proporciona el autor en su evaluación interna:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento (final) | 0.01806 |
| Pérdida media de entrenamiento | 1.376235 |
| Pérdida de next-token en conjunto de prueba | 0.012101 |
| Precisión de next-token en conjunto de prueba | 0.993684 |

Estas métricas corresponden a una tarea sintética de generación de respuestas JSON, no a razonamiento general. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del modelo: 640.256 parámetros, lo que equivale aproximadamente a 2,5 MB en precisión fp32. Cabe en cualquier CPU moderna y en la mayoría de los microcontroladores.
- No requiere GPU dedicada; puede ejecutarse en una CPU de un solo núcleo con memoria RAM estándar (menos de 1 GB).
- Para ejecución en GPU, cualquier tarjeta con más de 2 GB de VRAM es suficiente, aunque no es necesario.
- Opciones de despliegue: se puede cargar con PyTorch directamente, o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan pesos en el repositorio.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo tan pequeño, la latencia será del orden de milisegundos en CPU y inferior en GPU.

## Comparativa con modelos similares

No se dispone de comparaciones oficiales con otros modelos de la misma categoría. Como referencia, un modelo de 640K parámetros está muy por debajo de los modelos pequeños más comunes, como GPT-2 (124M) o TinyLlama (1.1B). La diferencia es de tres órdenes de magnitud, y su rendimiento en tareas sintéticas no es extrapolable a tareas de lenguaje natural general. No se han publicado comparativas con otros modelos de tamaño similar.

## Limitaciones y advertencias

- El modelo no es adecuado para ningún uso en producción, ni para tareas de alto riesgo, como decisiones médicas, legales, financieras o de seguridad.
- Las métricas de precisión (0,9937) se obtienen en un conjunto de prueba sintético generado con las mismas plantillas que el entrenamiento; no son indicativas de capacidad en datos reales.
- Riesgo de alucinación: al ser un modelo de 640K parámetros, es probable que genere respuestas plausibles pero incorrectas fuera de su dominio de entrenamiento.
- Sesgos: no se han evaluado sesgos; el entrenamiento con datos sintéticos deterministas no garantiza neutralidad ni representatividad.
- La licencia MIT permite uso comercial, pero el modelo no es funcional para aplicaciones reales, por lo que la licencia no implica utilidad práctica.
- El repositorio no contiene pesos del modelo (tamaño 0.0 GB), lo que impide la ejecución directa sin reentrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/iNFINITEAi2025/NATO-Guardian-XS
- Repositorio GitHub (referenciado en la búsqueda): https://github.com/NaTo1000/infiniteai2025-nato1000
- Otros modelos del mismo autor (no directamente comparables): https://huggingface.co/iNFINITEAi2025/NATO1000-CYBER, https://huggingface.co/iNFINITEAi2025/NATO1000-CODER
