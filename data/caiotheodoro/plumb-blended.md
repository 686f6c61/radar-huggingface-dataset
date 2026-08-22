# caiotheodoro/plumb-blended

## Resumen

`caiotheodoro/plumb-blended` es un adaptador LoRA entrenado con la librería MLX sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, una versión cuantizada a 4 bits del modelo Qwen3 de 1.700 millones de parámetros. Lo desarrolla Caio Theodoro como parte de una serie de experimentos de ajuste fino para tareas de generación de texto en el dominio de la construcción, concretamente para la aplicación de pagos y la generación de currículos. El adaptador se entrena sobre un conjunto de datos llamado `plumb` (versión `train_blended`), que combina 223 ejemplos seleccionados manualmente con 58 ejemplos generados por un modelo Ornit, totalizando 281 ejemplos. El propósito es mejorar la capacidad del modelo para producir texto estructurado y parseable en ese dominio específico.

La relevancia de este modelo radica en que demuestra cómo un adaptador LoRA pequeño puede superar a sus modelos "padres" en métricas de precisión y exactitud para tareas especializadas, sin necesidad de reentrenar el modelo completo. Según la model card, el adaptador logra mejores resultados que el dataset hand-seeded y el Ornith-only en las métricas de sw-recall, precisión y exactitud, manteniendo un parse perfecto. Es un ejemplo de enfoque de "blended curriculum" donde se combinan datos generados automáticamente con datos curados manualmente para mejorar el rendimiento en dominios estrechos.

El modelo está pensado para su uso en investigación y prototipado, no como un modelo de propósito general. Su licencia Apache 2.0 permite uso comercial, pero su tamaño y especialización lo hacen adecuado para tareas muy concretas. No se proporcionan detalles sobre el contexto máximo ni los idiomas soportados, aunque al estar basado en Qwen3 se puede inferir que hereda las capacidades del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre Qwen3-1.7B (transformer decoder-only) |
| Parametros totales | no disponible (adapter, no modelo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | base cuantizado a 4 bits, el adapter en MLX (no se especifican más) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, una versión cuantizada a 4 bits del modelo Qwen3 de 1.7B. El entrenamiento se realizó con la librería MLX, específicamente con la función `mlx_lm.lora.load`, y se utilizó el dataset `caiotheodoro/plumb` en su variante `train_blended`. Este dataset combina 223 ejemplos curados manualmente con 58 ejemplos generados por un modelo llamado "Ornit", sumando 281 ejemplos de entrenamiento. El entrenamiento se llevó a cabo durante 8 épocas y la pérdida de validación fue de 0.473. No se proporcionan detalles sobre la técnica de entrenamiento (si se usó RLHF, DPO, etc.), pero al ser un LoRA se asume un ajuste fino supervisado estándar.

La innovación técnica principal es el enfoque de "blend" (mezcla) de datos: combinar datos de alta calidad curados manualmente con datos sintéticos generados automáticamente para mejorar el rendimiento en tareas específicas. Esto se refleja en los resultados, donde el adaptador supera a los modelos entrenados solo con datos manuales o solo con datos sintéticos.

## Capacidades

- Generación de texto especializada en el dominio de la construcción, específicamente en aplicaciones de pago y generación de currículos.
- Generación de texto estructurado con formato JSON o similar, ya que las métricas de evaluación incluyen "parse" (parseo correcto) y "exact match".
- Capacidad de adaptación a tareas específicas mediante ajuste fino con pocos ejemplos (281 en total).
- Soporte de tool calling: no se especifica, pero al estar basado en Qwen3 podría heredar capacidades del base, aunque no se menciona en la model card.
- Capacidades multilingües: no disponibles (no se indica).
- Capacidades de visión o audio: no, es un modelo de texto puro.

## Casos de uso

- **Generación de currículos**: el modelo puede generar currículos estructurados en el formato esperado para el dominio de construcción, a partir de datos de entrada. Su alta precisión en exact match (0.228) y parse (1.000) indica que produce salidas formateadas correctamente.
- **Automatización de solicitudes de pago en construcción**: puede generar solicitudes de pago (pay applications) con la estructura necesaria para ser procesadas automáticamente.
- **Extracción de información estructurada**: dado un texto de entrada, el modelo puede extraer campos específicos como nombres, fechas, importes, etc., en formato JSON o similar.
- **Generación de currículos para perfiles de construcción**: puede adaptar un conjunto de datos de entrada a un currículo formal.
- **Prototipado rápido de agentes de texto**: al ser un adaptador pequeño, es adecuado para pruebas de concepto en aplicaciones que requieran generación de texto específico sin necesidad de un modelo grande.
- **Investigación en ajuste fino con datos mezclados**: sirve como ejemplo de cómo combinar datos curados y sintéticos para mejorar el rendimiento en tareas de nicho.

## Benchmarks y rendimiento

Según la model card, se evaluó con n=1000 muestras con seed-777, comparando el adaptador con sus "padres" (hand-seeded y Ornith-only). Los resultados se presentan en la siguiente tabla:

| Métrica | hand-seeded | Ornith-only | **plumb-blended** |
|---|---|---|---|
| sw-recall | 0.318 [0.290, 0.347] | 0.241 [0.214, 0.268] | **0.334 [0.306, 0.363]** |
| precision | 0.308 [0.279, 0.337] | 0.111 [0.098, 0.124] | **0.374 [0.342, 0.406]** |
| exact match | 0.178 | 0.084 | **0.228** |
| parse | 1.000 | 0.997 | **1.000** |

El adaptador supera a ambos en precisión y exact match, mientras que en recall los intervalos se solapan con el hand-seeded. No se proporcionan benchmarks externos (MMLU, etc.).

## Requisitos de hardware

- Al ser un adaptador sobre un modelo base de 1.7B cuantizado a 4 bits, el modelo completo ocupa aproximadamente 1 GB en memoria (el modelo base 4-bit de 1.7B es de ~1 GB, más el adaptador). Se puede ejecutar en Apple Silicon con MLX (por ejemplo, MacBook con chip M1/M2 con al menos 8 GB de RAM).
- GPU recomendadas: no requiere GPU dedicada; puede correr en CPU o en GPU integrada de Apple Silicon.
- Si se quiere usar en GPU NVIDIA, se necesitaría convertir el adaptador a otro formato (por ejemplo, GGUF o safetensors), ya que MLX es específico de Apple.
- Opciones de despliegue: con `mlx_lm.lora.load` en Python, o mediante MLX LM. No hay soporte directo para vLLM, llama.cpp o TGI porque no se proporcionan en formato GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, la latencia será baja en hardware adecuado.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos similares en la misma categoría (adaptadores LoRA para tareas específicas sobre Qwen3-1.7B). La comparativa se limita a los padres del modelo, que son las variantes hand-seeded y Ornith-only. No hay datos de modelos comparables externos.

## Limitaciones y advertencias

- El modelo es un adaptador de nicho, entrenado solo con 281 ejemplos. Puede tener un rendimiento limitado fuera del dominio de construcción y aplicaciones de pago.
- No se especifican sesgos conocidos, pero al ser un dataset sintético, puede heredar sesgos del modelo base o de los datos generados.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar contenido no verificado, especialmente fuera de su dominio.
- Limitaciones de contexto: al ser un modelo base de 1.7B, la ventana de contexto es limitada (no se indica, pero Qwen3-1.7B tiene típicamente 32k tokens, pero no se confirma en la información).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset `plumb` puede tener restricciones adicionales (no se indica).
- Para producción, se recomienda validar el modelo en el dominio específico y considerar el uso de un modelo base más grande para tareas más generales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/caiotheodoro/plumb-blended)
- [Dataset `caiotheodoro/plumb`](https://huggingface.co/datasets/caiotheodoro/plumb)
- [Perfil de Caio Theodoro](https://huggingface.co/caiotheodoro)
- [Repositorio de código del proyecto (referido en la model card)](https://github.com/caiotheodoro/plumb) (no se ha verificado su existencia)

Nota: los enlaces al repositorio de GitHub y al dataset se han extraído de la model card, pero no se ha podido verificar su contenido en la búsqueda web.</think>## Resumen

`caiotheodoro/plumb-blended` es un adaptador LoRA entrenado con la librería MLX sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`, una versión cuantizada a 4 bits del modelo Qwen3 de 1.700 millones de parámetros. Lo desarrolla Caio Theodoro como parte de un proyecto de ajuste fino para tareas especializadas en el dominio de la construcción, específicamente aplicaciones de pago y generación de currículos. El adaptador se entrena sobre el dataset `caiotheodoro/plumb` en su variante `train_blended`, que combina 223 ejemplos curados manualmente con 58 ejemplos generados por un modelo llamado Ornit, totalizando 281 ejemplos. El objetivo es mejorar la capacidad de generar texto estructurado y parseable en este dominio concreto.

La relevancia del modelo radica en su enfoque de "blendado" de datos: mezclar ejemplos de alta calidad con datos sintéticos para obtener un rendimiento superior al de cualquiera de los conjuntos por separado. Según la model card, el adaptador supera a sus dos variantes parentales en precisión y exact match, manteniendo una tasa de parse perfecta. Es un ejemplo de cómo un adaptador pequeño puede especializarse eficazmente en un nicho sin necesidad de reentrenar un modelo completo. Su licencia Apache 2.0 permite uso comercial, aunque su tamaño y especialización lo hacen más adecuado para prototipado y tareas muy concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre Qwen3-1.7B (transformer decoder-only) |
| Parametros totales | no disponible (adapter, no modelo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | base cuantizado a 4 bits; el adaptador se distribuye en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) que se aplica sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`. El entrenamiento se realizó con la librería MLX, utilizando la función `mlx_lm.lora.load` para cargar el adaptador. El dataset de entrenamiento es `caiotheodoro/plumb` en su versión `train_blended`, compuesto por 281 ejemplos: 223 curados manualmente y 58 generados por un modelo denominado Ornit. Se entrenó durante 8 épocas y se reporta una pérdida de validación de 0.473. No se especifica el uso de técnicas como RLHF o DPO; se asume un ajuste fino supervisado estándar. La innovación técnica principal es el enfoque de "blend" del curriculum: combinar datos manuales con datos sintéticos para mejorar el rendimiento en tareas específicas, lo que se refleja en los resultados obtenidos.

## Capacidades

- Generación de texto especializado en el dominio de construcción, incluyendo solicitudes de pago y currículos.
- Producción de texto estructurado y parseable, como se evidencia en la métrica de parse (1.000).
- Generación de texto con alta exactitud en tareas de extracción de información (exact match 0.228).
- Adaptación a tareas específicas con un número reducido de ejemplos (281 en total).
- Capacidad de tool calling: no especificada en la información disponible.
- Capacidades multilingües: no disponibles.
- Sin capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- **Automatización de solicitudes de pago en construcción**: el modelo puede generar solicitudes de pago (pay applications) con la estructura correcta a partir de datos de entrada, gracias a su alta precisión de parse y exact match.
- **Generación de currículos para profesionales del sector**: puede producir currículos formateados según el estándar requerido en el dominio, a partir de información básica del candidato.
- **Extracción de datos de documentos**: puede extraer campos específicos (fechas, importes, nombres) de textos libres y estructurarlos en formato JSON o similar.
- **Prototipado de chatbots especializados**: al ser un modelo pequeño y especializado, es adecuado para construir asistentes conversacionales en el ámbito de la construcción que respondan con formato predefinido.
- **Validación de formatos**: puede usarse para verificar si un texto cumple con un formato determinado, dado que su parse es perfecto.
- **Investigación en ajuste fino con datos sintéticos**: sirve como caso de estudio para evaluar cómo la mezcla de datos manuales y sintéticos afecta al rendimiento en tareas de nicho.

## Benchmarks y rendimiento

Según la model card, se evaluó con n=1000 muestras y semilla 777, comparando el adaptador con sus dos variantes parentes. Los resultados son:

| Métrica | hand-seeded | Ornith-only | **plumb-blended** |
|---|---|---|---|
| sw-recall | 0.318 [0.290, 0.347] | 0.241 [0.214, 0.268] | **0.334 [0.306, 0.363]** |
| precision | 0.308 [0.279, 0.337] | 0.111 [0.098, 0.124] | **0.374 [0.342, 0.406]** |
| exact match | 0.178 | 0.084 | **0.228** |
| parse | 1.000 | 0.997 | **1.000** |

El adaptador supera a ambos en precisión y exact match, y su recall se solapa con el de hand-seeded. No se han publicado resultados en benchmarks externos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El modelo base Qwen3-1.7B cuantizado a 4 bits ocupa aproximadamente 1 GB en memoria. El adaptador añade un pequeño número de parámetros, por lo que el conjunto completo cabe en dispositivos con poca memoria.
- Al estar en formato MLX, se ejecuta nativamente en Apple Silicon (M1/M2/M3) con al menos 8 GB de RAM unificada.
- No requiere GPU dedicada; puede funcionar en CPU de Apple Silicon o en GPU integrada.
- Para usarlo en GPU NVIDIA, habría que convertir el adaptador a otro formato (por ejemplo, safetensors o GGUF), pero no se proporciona en la información.
- Opciones de despliegue: mediante Python con `mlx_lm.lora.load`, o usando herramientas de MLX LM. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero al ser un modelo de 1.7B en 4 bits, la inferencia es rápida en hardware compatible.

## Comparativa con modelos similares

No hay información sobre otros adaptadores LoRA similares sobre Qwen3-1.7B para la misma tarea. La comparativa se limita a las variantes internas del proyecto (hand-seeded y Ornith-only), que se muestran en la tabla de benchmarks. No se dispone de datos sobre otros modelos comparables en el mercado.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (construcción y currículos) y no es adecuado para tareas generales de lenguaje.
- Está entrenado con solo 281 ejemplos, lo que puede limitar su generalización y robustez ante variaciones del dominio.
- No se indica la composición del dataset ni se han realizado evaluaciones de sesgos; es probable que existan sesgos derivados de los datos sintéticos o del modelo base.
- Riesgo de alucinación, especialmente en datos fuera del dominio de entrenamiento.
- La ventana de contexto no está especificada, pero el modelo base Qwen3-1.7B tiene una ventana típica de 32k tokens; no se confirma en la información.
- Para uso en producción, se recomienda validar el modelo con datos reales y considerar el uso de un modelo base más grande para tareas más generales.
- La licencia Apache 2.0 permite uso comercial, pero el dataset `plumb` puede tener restricciones adicionales no documentadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/caiotheodoro/plumb-blended)
- [Dataset `caiotheodoro/plumb`](https://huggingface.co/datasets/caiotheodoro/plumb)
- [Perfil de Caio Theodoro](https://huggingface.co/caiotheodoro)
- [Repositorio de GitHub del proyecto (referido en la model card)](https://github.com/caiotheodoro/plumb)
