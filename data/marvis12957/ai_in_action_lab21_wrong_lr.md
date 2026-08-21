# Marvis12957/ai_in_action_lab21_wrong_lr

## Resumen

Este repositorio contiene un adapter LoRA de fine-tuning sobre el modelo base `unsloth/Qwen3.5-4B`, publicado por el autor Marvis12957 como material didáctico para el laboratorio 21 de un curso sobre fine-tuning de LLMs. Se trata de un **ejemplo negativo deliberado**: el adapter fue entrenado con un learning rate de `1e-5` en lugar del valor recomendado de `1e-4` para LoRA, lo que provoca que el modelo resultante sea completamente inutilizable para inferencia.

El propio autor advierte explícitamente en la model card que **no debe usarse para inferencia**. La evaluación sobre 50 muestras objetivo muestra una precisión de `0.000` y una validez de formato de `0.000`, es decir, el modelo no es capaz de generar ni un solo JSON válido. El propósito de este artefacto es ilustrar una lección clave en el fine-tuning: el valor de la pérdida final no es un indicador fiable de la calidad de un modelo, ya que este run presenta una pérdida final de `1.5704` (sin NaN ni divergencia) pero falla por completo en la tarea real.

Aunque el modelo no tiene utilidad práctica, su ficha es relevante para desarrolladores e investigadores que quieran entender los efectos de una mala configuración de hiperparámetros en LoRA y cómo evaluar correctamente los resultados de un fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `unsloth/Qwen3.5-4B` (transformer decoder) |
| Parametros totales | 32.464.896 (solo adapter LoRA) |
| Parametros activos | 32.464.896 (todos los del adapter) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adapter se aplica sobre el base, que puede cuantizarse) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El adapter LoRA se entrena sobre el modelo base `unsloth/Qwen3.5-4B`, un transformer decoder de 4.000 millones de parámetros. La configuración de LoRA incluye un rank de 16 y se aplica a 12 módulos en la posición text-linear. El entrenamiento se realizó durante 2 épocas (30 pasos) con un learning rate de `1e-5`, que es el valor típico para fine-tuning completo pero demasiado bajo para LoRA, donde se recomienda `1e-4`. El resultado es un modelo que no converge correctamente: la pérdida final es `1.5704`, significativamente mayor que la del run correcto (~0.627), pero sin signos evidentes de divergencia (sin NaN). La evaluación posterior sobre 50 muestras objetivo revela que el modelo es completamente inútil: precisión `0.000` y validez de formato `0.000`, además de una latencia de 5243.8 ms (3.6 veces mayor que el run correcto) porque el modelo genera texto largo sin detenerse adecuadamente.

## Capacidades

- **Ninguna capacidad funcional**: el modelo no es apto para generación de texto, razonamiento, código, matemáticas ni ninguna otra tarea.
- **No soporta tool calling ni function calling**: no se ha entrenado para ello y el adapter está deliberadamente roto.
- **No soporta agentes ni multi-step reasoning**: no es utilizable en ningún flujo de agente.
- **Capacidad multilingüe**: no aplica, el modelo no genera salidas válidas ni en vietnamita ni en ningún otro idioma.
- **Capacidades especiales**: ninguna. Es un artefacto de demostración para fines educativos.

## Casos de uso

- **Material educativo en cursos de fine-tuning**: el adapter sirve como ejemplo práctico de cómo un learning rate incorrecto puede arruinar un modelo LoRA. Los estudiantes pueden comparar este run con el run correcto (mismo rank, mismo número de parámetros, pero LR=1e-4) para entender la sensibilidad de LoRA a este hiperparámetro.
- **Demostración de evaluación rigurosa**: el caso ilustra que la pérdida final no es suficiente para validar un fine-tuning. Se puede usar en clases para enseñar a evaluar modelos con métricas de tarea (precisión, validez de formato) en lugar de solo mirar la pérdida.
- **Análisis de latencia anómala**: el hecho de que este modelo genere texto largo sin detenerse (latencia 3.6 veces mayor) puede usarse para discutir problemas de generación descontrolada y la importancia de los tokens de parada.
- **Investigación sobre fallos de convergencia**: aunque no es un modelo de producción, puede servir como caso de estudio para analizar por qué un LR bajo en LoRA produce un comportamiento tan deficiente.
- **Pruebas de pipelines de evaluación**: se puede utilizar como entrada negativa en un pipeline de evaluación automática para verificar que el sistema detecta correctamente modelos fallidos.
- **Comparación de configuraciones**: en un laboratorio, los estudiantes pueden cargar este adapter y el correcto para comparar salidas y entender el impacto de los hiperparámetros.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre 50 muestras objetivo (tarea de atención al cliente en vietnamita). No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adapter.

| Metrica | Valor |
|---|---|
| Precisión objetivo (target accuracy) | 0.000 |
| Validez de formato (format validity) | 0.000 |
| Latencia | 5243.8 ms (3.6 veces mayor que el run correcto) |

Estos datos confirman que el modelo no es funcional. No hay comparación con otros modelos porque se trata de un ejemplo negativo deliberado.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un adapter LoRA de solo 32 millones de parámetros, el requisito principal es el del modelo base `Qwen3.5-4B`. Con cuantización 4-bit, se puede ejecutar en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060).
- **GPU recomendadas**: cualquier GPU moderna con al menos 8 GB de VRAM para el modelo base cuantizado. No se requieren GPUs de datacenter.
- **Compatibilidad con consumer GPU**: sí, el modelo base cabe en GPUs de consumo con cuantización.
- **Opciones de despliegue**: no recomendado para despliegue. Si se quisiera cargar para inspección, se podría usar `peft` con `transformers`, o `llama.cpp`/`Ollama` si se convierte a GGUF, pero no tiene sentido práctico.
- **Latencia y throughput**: la latencia medida es de 5243.8 ms por muestra, lo que refleja una generación descontrolada. No se recomienda su uso.

## Comparativa con modelos similares

No procede una comparativa con modelos similares porque este adapter es un ejemplo negativo deliberado, no un modelo funcional. La comparación relevante es con el run correcto del mismo autor (mismo base, mismo rank, pero LR=1e-4), que sí produce un modelo utilizable. No se dispone de más información sobre ese run en la documentación proporcionada.

## Limitaciones y advertencias

- **Modelo deliberadamente roto**: el adapter fue entrenado con un learning rate incorrecto a propósito. No debe usarse para ninguna tarea de inferencia.
- **Precisión nula**: la evaluación muestra una precisión de 0.000 y una validez de formato de 0.000, lo que indica que el modelo no genera salidas válidas.
- **Generación descontrolada**: el modelo tiende a generar texto largo sin detenerse, lo que provoca latencias muy altas y respuestas inútiles.
- **Sesgos y alucinaciones**: no aplica, el modelo no produce contenido coherente.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción.
- **Advertencia para producción**: cualquier intento de usar este adapter en un entorno real producirá fallos totales. Es exclusivamente un material de demostración.

## Enlaces

- [HuggingFace - Marvis12957/ai_in_action_lab21_wrong_lr](https://huggingface.co/Marvis12957/ai_in_action_lab21_wrong_lr)
- [GitHub - GDGoC-FPTU/llm-foundation-Marvis12957 (README)](https://github.com/GDGoC-FPTU/llm-foundation-Marvis12957/blob/main/README.md)
