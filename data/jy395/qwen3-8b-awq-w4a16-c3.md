# jy395/Qwen3-8B-awq-w4a16-c3

## Resumen

Qwen3-8B-awq-w4a16-c3 es una versión cuantizada en 4 bits del modelo Qwen/Qwen3-8B, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompañan al artículo «Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs», presentado en ICAIF '26. El modelo aplica cuantización AWQ de pesos a 4 bits con esquema asimétrico W4A16 (activaciones en 16 bits) mediante la herramienta llm-compressor de vLLM, y ha sido calibrado sobre el corpus C3-FinMix, compuesto por 2.042 prompts financieros formateados como tareas (~260k tokens) extraídos de diez benchmarks financieros.

El interés de esta ficha no reside en una arquitectura novedosa, sino en el estudio sistemático del efecto del corpus de calibración en la compresión de modelos del dominio financiero. El checkpoint es un artefacto de investigación reproducible: el repositorio de GitHub asociado incluye los scripts de cuantización, los corpus de calibración y la suite de evaluación sobre diez tareas financieras.

El tamaño real de los pesos en safetensors es de 2.174.236.152 parámetros (frente a los ~8.200 millones del Qwen3-8B original), lo que refleja la compresión efectiva a 4 bits. El repositorio ocupa 6,1 GB y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), pesos cuantizados AWQ W4A16 |
| Parámetros totales | 2.174.236.152 (pesos cuantizados a 4 bits); modelo base Qwen3-8B con ~8.200 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-8B soporta hasta 32.768 tokens nativos, ampliable; no confirmado para este checkpoint) |
| Tipos de cuantización | AWQ 4-bit pesos asimétrico, activaciones 16-bit (W4A16), formato compressed-tensors |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-8B. Sobre ella se aplica cuantización post-entrenamiento AWQ (Activation-aware Weight Quantization) en modo W4A16: los pesos se reducen a 4 bits con escala asimétrica y las activaciones permanecen en 16 bits. La cuantización se ejecuta con llm-compressor, que produce checkpoints en formato compressed-tensors, cargables directamente en vLLM y en transformers.

El aspecto diferencial es el protocolo de calibración. El corpus C3-FinMix se construye a partir de los splits de entrenamiento y validación de diez benchmarks financieros (nunca de test), con 2.042 prompts formateados como tareas y un total de ~260k tokens, generado con semilla 42. El protocolo consume el corpus completo con `max_seq_length=2048`. El artículo asociado estudia cuándo la compresión de LLM financieros requiere datos de calibración alineados con el dominio, y esta configuración concreta (C3) es una de las 30 variantes liberadas para permitir la reproducción y comparación. No se dispone de información sobre RLHF, DPO ni datos de preentrenamiento adicionales específicos de este checkpoint.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Razonamiento y matemáticas: el modelo base Qwen3 incorpora modo de razonamiento (thinking mode); no se confirma si esta capacidad se preserva íntegramente tras la cuantización.
- Generación de código: capacidad del modelo base; no evaluada específicamente en la información disponible para este checkpoint.
- Tool calling / function calling: soportado por el modelo base Qwen3; no verificado en esta versión cuantizada.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, sujetas a la degradación propia de la cuantización a 4 bits.
- Dominio financiero: el checkpoint está específicamente calibrado para tareas financieras, lo que puede mejorar la fidelidad en ese dominio frente a una cuantización genérica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Evaluación de compresión en dominio financiero: usar el checkpoint como referencia para medir la degradación de precisión frente al Qwen3-8B sin cuantizar en las diez tareas financieras de la suite del artículo, comparando con las otras 29 configuraciones liberadas.
- Despliegue de bajo coste en análisis financiero: servir el modelo en vLLM para tareas de extracción de entidades, clasificación de sentimiento de noticias financieras o resumen de informes, aprovechando la reducción de memoria (~2,2 GB de pesos) frente al modelo original.
- Investigación sobre calibración: reproducir el experimento del artículo sustituyendo el corpus C3-FinMix por otros corpus (generalistas o de otro dominio) para estudiar el impacto en la recuperación tras la compresión.
- Prototipado en GPU de consumo: ejecutar el modelo en una RTX 4090 o similar para iterar sobre prompts financieros sin depender de infraestructura de datacenter.
- Generación aumentada por recuperación (RAG) sobre documentación financiera: el modelo puede integrarse como generador en pipelines RAG, con la ventaja de un footprint de memoria reducido que deja espacio para el índice vectorial en la misma GPU.
- Base para ajuste fino ligero (LoRA/QLoRA): al estar en 4 bits, sirve como punto de partida para adaptaciones específicas con requisitos de VRAM moderados.
- Benchmarking de herramientas de cuantización: comparar AWQ W4A16 con otras técnicas (GPTQ, SmoothQuant, FP8) sobre el mismo modelo base y corpus de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado incluye una suite de evaluación sobre diez tareas financieras, pero los números concretos no se recogen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,2 GB solo para pesos en 4 bits; con overhead de activaciones, KV cache y runtime, se recomienda un mínimo de 6-8 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia con vLLM; L40S o A10G para despliegues de producción moderados.
- GPU de consumo: cabe holgadamente en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB con contextos cortos.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`. No se confirma soporte directo en llama.cpp u Ollama, ya que el formato es compressed-tensors y no GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-awq-w4a16-c3 | 2,17 B (pesos 4-bit) | No disponible | AWQ W4A16 | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | ~8,2 B | 32.768 tokens nativos | BF16/FP16 | Apache 2.0 | HuggingFace |
| Otras 29 configuraciones del mismo artículo | Variable según base | No disponible | Diversas (AWQ, GPTQ, etc.) | Apache 2.0 | Colección HuggingFace jy395 |
| Cuantizaciones genéricas de Qwen3-8B (p. ej. AWQ sin calibración financiera) | ~2,2 B (pesos 4-bit) | Según base | AWQ W4A16 | Apache 2.0 | HuggingFace |

La comparación relevante es contra el modelo base sin cuantizar (para medir la pérdida de precisión) y contra cuantizaciones con corpus de calibración genérico (para medir la ganancia del calibrado financiero). Los datos cuantitativos de esa comparación están en el artículo, no en la model card.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación de precisión respecto al Qwen3-8B original; el grado exacto de degradación por tarea no se detalla en la información disponible.
- El corpus de calibración es específicamente financiero; el rendimiento en dominios generales puede verse afectado de forma distinta al de una cuantización calibrada con datos generalistas.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la compresión; especialmente crítico en un dominio como el financiero, donde los errores factuales tienen consecuencias.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-8B.
- Idiomas soportados no documentados para este checkpoint; la calibración en inglés financiero puede sesgar el comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías; conviene validar en el caso de uso concreto antes de producción.
- El checkpoint está en formato compressed-tensors; no es directamente compatible con llama.cpp u Ollama sin conversión.
- Repositorio con muy pocas descargas (18) y sin likes: no hay evidencia de uso en producción ni validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Qwen3-8B-awq-w4a16-c3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de código y corpus: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización AWQ W4A16: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa de configuraciones: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
