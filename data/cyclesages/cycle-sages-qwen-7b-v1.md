# cyclesages/cycle-sages-qwen-7b-v1

## Resumen

Cycle-sages-qwen-7b-v1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario cyclesages y publicado en Hugging Face. Se trata de un modelo derivado de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`), entrenado con la librería Unsloth y la pila TRL de Hugging Face. La model card es mínima: no documenta el dataset de entrenamiento, el objetivo del ajuste ni los hiperparámetros utilizados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens en su versión original. El ajuste se ha realizado sobre una base cuantizada en 4 bits (bitsandbytes), lo que condiciona tanto el proceso de entrenamiento como las características de los pesos resultantes.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el propósito del ajuste, no hay benchmarks publicados, no hay demos ni documentación adicional, y el modelo registra cero descargas y cero likes en el momento de la consulta. Se trata, por tanto, de un experimento personal de fine-tuning sin validación pública documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 7.600 millones (heredados de Qwen2.5-7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según la arquitectura base Qwen2.5-7B; no verificado en este ajuste) |
| Tipos de cuantización | El modelo base de entrenamiento estaba en 4 bits (bnb-4bit); el repositorio se distribuye en safetensors (tamaño del repo: 0,2 GB, lo que sugiere pesos cuantizados o parciales) |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 soporta multilingüismo, pero este ajuste declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por ventanas deslizantes, RoPE (Rotary Position Embeddings) y normalización RMSNorm. El modelo base incorpora 28 capas, 28 cabezas de atención y una dimensión oculta de 3.584, con una ventana de contexto nativa de 32.768 tokens y soporte para generación de hasta 8.192 tokens.

El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y reduce el uso de memoria. La base de partida fue la versión `unsloth-bnb-4bit` de Qwen2.5-7B-Instruct, es decir, el modelo original cuantizado a 4 bits con bitsandbytes. Esto implica que el ajuste se aplicó sobre pesos ya cuantizados, lo que puede afectar a la fidelidad de los pesos finales respecto a un ajuste sobre precisión completa. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan hiperparámetros como la tasa de aprendizaje, el número de épocas o el rango de LoRA (si se utilizó).

## Capacidades

- Generación de texto en inglés, heredada de la base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas, aunque sin validación específica en este ajuste.
- Generación de código, capacidad presente en el modelo base pero no verificada tras el fine-tuning.
- Soporte de tool calling y function calling: el modelo base Qwen2.5 lo soporta, pero no hay confirmación de que el ajuste lo preserve.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero la model card declara únicamente inglés para este ajuste.
- No se documentan capacidades especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Experimentación con fine-tuning sobre Qwen2.5: el modelo sirve como ejemplo de ajuste con Unsloth sobre una base cuantizada en 4 bits, útil para desarrolladores que quieran replicar el flujo de trabajo.
- Generación de texto en inglés para prototipos: puede emplearse en entornos de prueba donde se requiera un modelo de 7B con licencia Apache 2.0 y contexto largo, aunque sin garantías de calidad tras el ajuste.
- Investigación sobre degradación de pesos en fine-tuning cuantizado: permite estudiar cómo afecta entrenar sobre una base bnb-4bit frente a precisión completa.
- Base para nuevos ajustes: al ser un modelo derivado con licencia permisiva, puede servir como punto de partida para otros fine-tunings, aunque se recomienda partir del modelo original de Qwen para mayor fiabilidad.
- Despliegue en entornos con recursos limitados: el tamaño del repositorio (0,2 GB) sugiere pesos cuantizados, lo que facilitaría su uso en hardware modesto, aunque no se especifica el formato exacto de cuantización final.
- Evaluación comparativa de ajustes comunitarios: útil para comparar el rendimiento de ajustes informales frente al modelo base oficial en tareas concretas, siempre que se realicen evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que no se especifica el formato final de los pesos. Para un modelo de 7B en fp16 se requieren aproximadamente 15-16 GB; en 4 bits, unos 5-6 GB; en 8 bits, unos 8-9 GB.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o A100/H100; para cuantización 4 bits, una RTX 3060 (12 GB) o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: probable en 4 u 8 bits, pero no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se proporcionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cycle-sages-qwen-7b-v1 | 7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste sin documentación ni benchmarks |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa popular de 7B con contexto largo |
| Llama-3.1-8B-Instruct | 8,0B | 131.072 | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el objetivo del ajuste y los hiperparámetros, lo que impide evaluar su calidad o idoneidad.
- El ajuste se realizó sobre una base cuantizada en 4 bits, lo que puede introducir degradación adicional respecto al modelo original.
- La model card declara únicamente inglés, a pesar de que el modelo base es multilingüe; el ajuste podría haber reducido capacidades en otros idiomas.
- Riesgo de alucinación inherente a los modelos de 7B, sin mitigaciones documentadas.
- No hay benchmarks ni evaluaciones publicadas, por lo que se desconoce si el ajuste mejora o degrada el rendimiento del modelo base.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación hace recomendable no desplegarlo en producción sin evaluaciones propias.
- El tamaño del repositorio (0,2 GB) es anómalamente pequeño para un modelo de 7B en safetensors a precisión completa (que ocuparía unos 15 GB), lo que sugiere que los pesos publicados podrían estar cuantizados, ser parciales o corresponder a un adaptador LoRA no documentado; esto debe verificarse antes de su uso.

## Enlaces

- [Hugging Face: cyclesages/cycle-sages-qwen-7b-v1](https://huggingface.co/cyclesages/cycle-sages-qwen-7b-v1)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo original Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
