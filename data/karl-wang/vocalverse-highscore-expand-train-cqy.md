# karl-wang/vocalverse-highscore-expand-train-cqy

## Resumen

Este repositorio documenta un experimento de ablación sobre el modelo de puntuación de canto MuQ, desarrollado por karl-wang. El objetivo era mejorar la capacidad del modelo para puntuar interpretaciones de alta calidad (85-99 puntos) añadiendo datos sintéticos: grabaciones de voces originales profesionales re-grabadas en un entorno real de KTV (con ruido ambiental, conversaciones y ruido de micrófono). Sin embargo, el experimento resultó en un claro caso de "shortcut learning": el modelo aprendió a distinguir las grabaciones re-grabadas de las grabaciones reales de usuarios basándose en características acústicas sutiles, en lugar de aprender a evaluar la calidad del canto.

El resultado es un checkpoint experimental que no debe usarse en producción. La model card concluye que la mejor práctica es entrenar únicamente con datos reales de usuarios de KTV, logrando una correlación de Pearson de 0.51 en el test real, frente al 0.39 obtenido con el modelo contaminado por datos sintéticos. Este repositorio es relevante como advertencia metodológica sobre los riesgos de aumentar datasets con datos simulados, y como material de referencia para investigadores que trabajan en evaluación de canto o en problemas de sesgo de dominio.

No se dispone de información sobre la arquitectura concreta del modelo base MuQ, el número de parámetros, ni la longitud de contexto. El modelo está licenciado bajo MIT y etiquetado con región US.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en MuQ, sin detalles publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica si es safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo MuQ. El experimento documentado se centra en el proceso de entrenamiento: se partió de un modelo base MuQ entrenado con grabaciones reales de usuarios de KTV, cuyas puntuaciones se concentraban en el rango 50-85. Para intentar cubrir el rango alto (85-99), se generaron datos sintéticos grabando voces originales profesionales en un entorno real de KTV, añadiendo deliberadamente ruido ambiental (conversaciones, sonido de vasos, ruido de fondo del micrófono) y asignándoles etiquetas de 85-99. Estos datos se mezclaron con los datos reales de usuarios.

El entrenamiento resultante mostró una correlación de Pearson aparentemente alta (0.78-0.86) en el conjunto de prueba mixto, pero al evaluar exclusivamente con grabaciones reales de usuarios (el escenario de despliegue real), la correlación cayó a 0.39 o menos. El análisis concluyó que el modelo había aprendido una clasificación binaria basada en diferencias acústicas entre los dos tipos de grabación, en lugar de una evaluación real de la calidad del canto. No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- El modelo base MuQ está diseñado para la puntuación de calidad de canto (vocal scoring), pero no se especifican detalles sobre su funcionamiento interno.
- No hay información sobre capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.
- El checkpoint experimental no presenta capacidades adicionales; su único propósito es documentar el fallo metodológico.

## Casos de uso

- Investigación sobre shortcut learning en modelos de evaluación: este checkpoint sirve como ejemplo controlado de cómo un modelo puede aprender atajos basados en características de grabación en lugar de la tarea objetivo. Los investigadores pueden analizar las diferencias en las activaciones internas entre el modelo contaminado y el modelo entrenado solo con datos reales.
- Diseño de datasets para evaluación de canto: la lección principal es que los datos sintéticos deben validarse rigurosamente para evitar sesgos de dominio. Este repositorio puede usarse como referencia para evitar errores similares.
- Benchmark de robustez ante cambios de dominio: el modelo contaminado puede emplearse como caso de prueba para medir la degradación de rendimiento cuando se aplica a datos fuera de la distribución de entrenamiento.
- Estudio de métricas de correlación: la discrepancia entre la correlación en el test mixto (0.78-0.86) y en el test real (0.39) ilustra cómo las métricas agregadas pueden enmascarar fallos graves de generalización.
- Depuración de pipelines de entrenamiento: el checkpoint permite reproducir el experimento y verificar si otros modelos presentan el mismo comportamiento con datos similares.
- Material didáctico en cursos de machine learning: puede utilizarse para enseñar conceptos de sesgo de selección, validación cruzada y evaluación realista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas específicas del experimento:

| Metrica | Valor |
|---|---|
| Correlacion de Pearson en test mixto (con datos sinteticos) | 0.78 - 0.86 |
| Correlacion de Pearson en test real (solo grabaciones de usuarios KTV) | 0.39 o inferior |
| Correlacion de Pearson del modelo entrenado solo con datos reales | 0.51 |

Estos datos confirman que el modelo contaminado por datos sintéticos tiene un rendimiento sustancialmente peor en el escenario de despliegue real que el modelo entrenado exclusivamente con datos reales.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware, VRAM, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia/throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (evaluación de canto). No se conocen alternativas como modelos de puntuación de canto open source con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Este checkpoint es un resultado experimental negativo y no debe utilizarse en producción para puntuar canto real.
- El modelo sufre de shortcut learning: distingue entre grabaciones sintéticas y reales en lugar de evaluar la calidad del canto, lo que provoca una degradación severa en datos reales.
- La model card advierte explícitamente que el modelo contaminado tiene una "precisión interna" muy baja, a pesar de las métricas aparentemente buenas en el test mixto.
- No se proporciona información sobre sesgos, alucinaciones, limitaciones de contexto o idioma.
- La licencia MIT permite uso comercial, pero el modelo no es apto para dicho uso debido a su naturaleza experimental.
- El repositorio no incluye instrucciones claras sobre cómo cargar o ejecutar el modelo, ni documentación sobre el formato de los pesos.

## Enlaces

- [HuggingFace - karl-wang/vocalverse-highscore-expand-train-cqy](https://huggingface.co/karl-wang/vocalverse-highscore-expand-train-cqy)
