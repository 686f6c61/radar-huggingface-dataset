# Aadhil96/gemma3-4b-sinhala-v1

## Resumen

Gemma 3 4B Sinhala v1 es un adaptador LoRA experimental desarrollado por el usuario Aadhil96 (Aadhil Imam) sobre el modelo base `unsloth/gemma-3-4b-it-bnb-4bit`, una versión cuantizada en 4 bits de Gemma 3 4B Instruct de Google. El objetivo declarado es dotar al modelo de capacidad conversacional en cingalés (sinhala), un idioma de bajos recursos con escasa representación en los corpus de preentrenamiento de los grandes modelos. El adaptador se entrenó con QLoRA sobre 5.000 filas del dataset `yahma/alpaca-cleaned` traducidas automáticamente mediante `facebook/nllb-200-distilled-600M`.

La relevancia de esta ficha es fundamentalmente metodológica y de advertencia: el propio autor califica el modelo como no apto para uso real. En su única prueba registrada, el modelo produjo cingalés en gran medida sin sentido y no alcanzó su objetivo de calidad (perplejidad media de 23,11 frente a un objetivo de 15 o inferior en 50 filas reservadas). Además, el pipeline de traducción eliminó el zero-width joiner (U+200D) en 4.392 de las 5.000 filas traducidas, introduciendo errores ortográficos sistemáticos en los datos de entrenamiento.

El modelo tiene 4.000 millones de parámetros (no disponibles desglosados en la información), una ventana de contexto heredada de Gemma 3 4B (no especificada en la model card), licencia Gemma y pesos distribuidos como adaptador PEFT en safetensors. No se han publicado benchmarks ni evaluación por hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (modelo base); adaptador LoRA con r=16, alpha=16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit); adaptador LoRA en safetensors (se puede fusionar y recuantizar, aunque no se documenta) |
| Idiomas soportados | Cingales (si); el base soporta multilingue, pero el adaptador solo declara si |
| Licencia | Gemma (terminos de uso de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 3 4B Instruct, un transformer decoder-only de Google. El entrenamiento utilizó QLoRA con Unsloth y TRL: rango 16, alpha 16, 2 épocas, 582 pasos, batch size 2 con 8 pasos de acumulación (batch efectivo 16) y learning rate 2e-4, sobre una única NVIDIA Tesla T4 en Kaggle. Los datos fueron las primeras 5.000 filas de `yahma/alpaca-cleaned` traducidas con NLLB-200 distilled 600M, más 2 filas escritas a mano; tras limpieza quedaron 4.642 filas de entrenamiento y 245 reservadas.

La innovación técnica es inexistente más allá del uso de QLoRA sobre un modelo cuantizado en 4 bits para reducir requisitos de memoria. El problema principal está en el pipeline de datos: la traducción automática eliminó el zero-width joiner en 4.392 de 5.000 filas (por ejemplo, `ප් රධාන` en lugar de `ප්‍රධාන`), el 7,7% de las respuestas traducidas se repiten y 228 respuestas contienen menos de la mitad de texto en cingalés. Los datos no se repararon antes del entrenamiento y la pérdida de entrenamiento no se registró en el log de la ejecución.

## Capacidades

- Generación de texto conversacional en cingales, aunque con calidad deficiente según la propia evaluación del autor.
- Instrucciones de tipo Alpaca (el formato de entrenamiento), con respuestas cortas y directas.
- Herencia potencial de las capacidades del base Gemma 3 4B (razonamiento, código, matemáticas, tool calling), aunque el adaptador no documenta ninguna de ellas y el ajuste puede degradarlas.
- Capacidad multilingüe limitada al cingales en la práctica; el autor no reporta evaluación en otros idiomas.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking específico para este adaptador.

## Casos de uso

- Investigación sobre pipelines de traducción automática para idiomas de bajos recursos: el modelo sirve como caso de estudio de cómo el ruido en la traducción (pérdida de ZWJ, repeticiones) degrada el ajuste fino; útil para diseñar mejores pipelines de limpieza.
- Reproducción de experimentos de QLoRA en hardware consumer: el notebook de Kaggle y la configuración (T4, 4 bits) permiten replicar el entrenamiento y medir el impacto de corregir los datos.
- Evaluación comparativa de adaptadores fallidos: como referencia negativa en estudios sobre calidad de adaptadores LoRA para idiomas de bajos recursos.
- Docencia y formación: ejemplo didáctico de model card honesta y de análisis de errores en datos sintéticos.
- Prueba de concepto interna (no producción): para verificar la viabilidad de adaptar Gemma 3 4B a cingales antes de invertir en datos nativos revisados.
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes ni ningún escenario con usuarios finales, dado que el autor lo declara no apto para uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la perplejidad media de 23,11 sobre 50 filas reservadas, frente a un objetivo de 15 o inferior, reportada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4 bits (bnb-4bit) requiere aproximadamente 3-4 GB para los pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade unos pocos cientos de MB. Cifras exactas no disponibles en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA Tesla T4 (16 GB). Para inferencia, cualquier GPU con al menos 8 GB es suficiente en la práctica; se recomienda A100 o H100 solo para servir a múltiples usuarios.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares con al menos 8 GB.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM y TGI tras fusionar el adaptador con el base; llama.cpp y Ollama requerirían conversión a GGUF tras la fusión, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Aadhil96/gemma3-4b-sinhala-v1 | 4B (LoRA) | No disponible | Gemma | Experimental, no apto para uso real | Perplejidad 23,11; datos con ZWJ roto |
| google/gemma-3-4b-it | 4B | No disponible en la informacion | Gemma | Produccion | Base multilingue sin ajuste especifico a cingales |
| unsloth/gemma-3-4b-it-bnb-4bit | 4B | No disponible en la informacion | Gemma | Produccion (cuantizado) | Base exacto del adaptador |
| Adaptadores comunitarios para idiomas de bajos recursos (generico) | Variable | Variable | Variable | Variable | No disponible comparacion concreta en la informacion proporcionada |

## Limitaciones y advertencias

- Calidad deficiente: el autor declara el modelo como no apto para uso real; en su única prueba respondió con cingales en gran medida sin sentido y caracteres no cingaleses.
- Objetivo de calidad no alcanzado: perplejidad media de 23,11 frente a objetivo de 15 o inferior en 50 filas reservadas.
- Datos de entrenamiento corruptos: el 87,8% de las filas traducidas (4.392 de 5.000) perdieron el zero-width joiner, generando errores ortográficos sistemáticos que el modelo aprende.
- Ruido adicional: el 7,7% de las respuestas traducidas se repiten y 228 contienen menos de la mitad de cingales.
- Sin revisión por hablantes nativos: ningún hablante de cingales ha evaluado las salidas.
- Registro de entrenamiento incompleto: la pérdida de entrenamiento no se capturó en el log.
- Riesgo de alucinación elevado, agravado por el ajuste sobre datos sintéticos ruidosos.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google (https://ai.google.dev/gemma/terms), que imponen restricciones y obligaciones de atribución.
- Sin benchmarks ni evaluación en tareas estándar (MMLU, HumanEval, GSM8K), por lo que no se puede comparar objetivamente con alternativas.
- Contexto e idiomas secundarios no documentados; el adaptador declara únicamente cingales.

## Enlaces

- Hugging Face: https://huggingface.co/Aadhil96/gemma3-4b-sinhala-v1
- Notebook de entrenamiento (Kaggle): https://www.kaggle.com/code/aadhilimam/sinhala-llm-fine-tuning-on-kaggle
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-4b-it-bnb-4bit
- Dataset utilizado: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Modelo de traducción: https://huggingface.co/facebook/nllb-200-distilled-600M
