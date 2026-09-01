# Raskoll/qwen3-0.6b-engram

## Resumen

El modelo `Raskoll/qwen3-0.6b-engram` es un fine-tuning experimental del modelo base `Qwen/Qwen3-0.6B` que incorpora una capa de memoria condicional tipo *Engram*, implementada como una tabla de búsqueda (Look-Up Table, LUT) descargada a memoria externa, siguiendo la línea de la memoria condicional de DeepSeek. El objetivo es mejorar la capacidad de predicción del siguiente token y reducir la perplejidad en tareas de modelado de lenguaje, sin aumentar significativamente el coste de inferencia.

El modelo está desarrollado por el usuario Raskoll y publicado bajo licencia Apache 2.0. Aunque el nombre sugiere 0.6 mil millones de parámetros, los pesos reales en safetensors suman 1.537.541.120 parámetros (aproximadamente 1,5 mil millones), debido a la capa adicional de memoria. Está entrenado exclusivamente en inglés sobre el dataset `Salesforce/wikitext`. Su relevancia radica en explorar arquitecturas híbridas que combinan transformadores densos con memorias externas, un área de investigación activa en la optimización de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con capa de memoria condicional tipo LUT (Engram) |
| Parametros totales | 1.537.541.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-0.6B soporta 32.768 tokens, pero no se confirma en la informacion del repo) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3-0.6B-Base`, un transformer denso de 0,6 mil millones de parametros con atención multi-cabeza y normalización RMS. Sobre esta base, se añade una capa de memoria condicional denominada *Engram*, que consiste en una tabla de búsqueda (LUT) de aproximadamente 2 GB que se mantiene fuera de los pesos principales (offloaded). Esta LUT almacena representaciones de contexto que se consultan durante la generación para mejorar la predicción del siguiente token, siguiendo el concepto de memoria condicional de DeepSeek.

El entrenamiento se realizó sobre el dataset `Salesforce/wikitext`, un corpus de artículos de Wikipedia en inglés. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La implementación requiere `trust_remote_code=True` en HuggingFace, lo que indica que se incluye código personalizado para la capa de memoria.

## Capacidades

- Generación de texto en inglés con mejora en la predicción del siguiente token respecto al modelo base.
- Modelado de lenguaje causal: dado un prompt, genera continuaciones coherentes.
- Razonamiento básico y comprensión de lenguaje heredados del modelo base Qwen3-0.6B, aunque limitados por el tamaño reducido.
- No se documenta soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe: no disponible, el modelo está entrenado solo en inglés.

## Casos de uso

- Completado de texto en inglés: el modelo puede utilizarse para autocompletar frases o párrafos en aplicaciones de escritura asistida, aprovechando su mejora en la precisión del siguiente token.
- Investigación académica en memorias externas: sirve como banco de pruebas para estudiar el impacto de LUT offloaded en modelos pequeños, comparando métricas de perplejidad y exactitud.
- Prototipado de sistemas de generación de texto con recursos limitados: al ser un modelo de ~1,5B parámetros, puede ejecutarse en GPUs de consumo para experimentos de baja escala.
- Evaluación de técnicas de compresión de contexto: la capa Engram podría explorarse como alternativa a ventanas de contexto más largas en tareas de modelado de lenguaje.
- Fine-tuning posterior: al estar basado en Qwen3-0.6B, puede servir como punto de partida para tareas específicas en inglés, aunque la capa adicional requiere manejo cuidadoso.
- Benchmarking de perplejidad: útil para comparar arquitecturas con memoria externa frente a modelos densos estándar en el corpus WikiText-2.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en el conjunto de test de WikiText-2:

| Modelo | Cross-Entropy Loss | Perplejidad (PPL) | Next-Token Top-1 Acc |
| :--- | :--- | :--- | :--- |
| Vanilla Qwen3-0.6B | 2.8211 | 16.80 | 45.43% |
| Engram + Qwen3-0.6B | 2.6945 | 14.80 | 46.60% |

La adición de la capa Engram reduce la perplejidad en 2 puntos y mejora la exactitud top-1 en más de 1 punto porcentual. No se proporcionan resultados en otros benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con bfloat16, los 1.537.541.120 parámetros ocupan aproximadamente 3,1 GB (el tamaño del repo es 3,1 GB). La capa LUT de 2 GB se describe como "offloaded", lo que sugiere que puede residir en memoria CPU o almacenamiento, reduciendo la VRAM necesaria para la inferencia.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) podría ejecutar el modelo si la LUT se mantiene fuera de VRAM. Para mayor comodidad, una RTX 3060 o superior es adecuada.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media.
- Opciones de despliegue: el ejemplo de uso emplea `transformers` con `device_map="cuda"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Dado el uso de `trust_remote_code`, es probable que solo funcione con `transformers`.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja, pero la capa LUT puede introducir overhead en la consulta de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Perplejidad (WikiText-2) | Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Qwen3-0.6B (base) | 0,6B | 32.768 (según documentación oficial) | Apache 2.0 | 16.80 | Modelo denso estándar |
| Raskoll/qwen3-0.6b-engram | 1,5B (pesos reales) | No disponible | Apache 2.0 | 14.80 | Añade memoria LUT offloaded |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | No disponible | Modelo denso pequeño, sin memoria externa |

La comparación directa con TinyLlama no es posible por falta de datos de perplejidad en el mismo corpus. La ventaja del modelo Engram frente a su base es clara en WikiText-2, pero el aumento de parámetros (de 0,6B a 1,5B) implica mayor uso de memoria.

## Limitaciones y advertencias

- El modelo está entrenado solo en inglés; no soporta otros idiomas.
- La capa Engram requiere código personalizado (`trust_remote_code=True`), lo que puede generar problemas de compatibilidad con versiones futuras de `transformers` o con otros frameworks de inferencia.
- No se documentan sesgos específicos, pero al estar entrenado en Wikipedia, puede reflejar los sesgos presentes en ese corpus.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar contenido plausible pero incorrecto, especialmente en tareas que requieren conocimiento factual.
- La longitud de contexto no está confirmada; si se hereda del modelo base, sería de 32.768 tokens, pero la capa de memoria podría alterar el comportamiento.
- No hay información sobre el proceso de entrenamiento (número de tokens, épocas, configuración de hiperparámetros), lo que dificulta la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un experimento reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raskoll/qwen3-0.6b-engram
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/wikitext
