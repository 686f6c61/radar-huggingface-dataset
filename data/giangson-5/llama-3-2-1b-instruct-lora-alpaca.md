# GiangSon-5/Llama-3.2-1B-Instruct-LoRA-Alpaca

## Resumen

Llama-3.2-1B-Instruct-LoRA-Alpaca es un adaptador LoRA de precisión completa (BF16, sin cuantización) entrenado por el usuario GiangSon-5 sobre el modelo base unsloth/Llama-3.2-Instruct, la variante de 1.240 millones de parámetros de la familia Llama 3.2 de Meta. El adaptador se ha ajustado mediante SFT sobre el corpus completo yahma/alpaca-cleaned (51.760 instrucciones) para mejorar el seguimiento de instrucciones concisas, con un total de 11,27 millones de parámetros entrenables (0,904 % del modelo base).

El modelo resuelve un problema acotado: el modelo base tiende a generar respuestas verbosas y con terminación EOS inconsistente; este adaptador reduce la perplejidad de test de 4,23 a 3,18 (−24,8 %), eleva el ROUGE-L F1 de 28,32 % a 35,90 % (+7,58 pp) y sube la tasa de terminación EOS limpia del 53,30 % al 68,30 % sobre 1.000 prompts de test reservados. El entrenamiento se realizó en una GPU NVIDIA A100-SXM4-40GB.

Es relevante para quienes necesitan un ajuste ligero y desplegable sobre Llama 3.2 1B que no sacrifique la precisión de los pesos originales (frente a alternativas cuantizadas a 4 bits), con integración directa en PEFT, Transformers y vLLM, y posibilidad de fusionar los pesos (merge_and_unload) para eliminar la latencia añadida en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), adaptador LoRA sobre modelo base |
| Parametros totales | 1.240 millones (modelo base) + 11,27 millones (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (según la model card; el modelo base Llama 3.2 1B soporta hasta 128K, pero el adaptador se ha entrenado con secuencias de 1.024) |
| Tipos de cuantizacion | Adaptador en BF16 sin cuantizar; el modelo base admite cuantización estándar (no especificada en la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 (licencia comunitaria de Meta) |
| Formato de pesos | SafeTensors (adapter_model.safetensors), formato PEFT |

## Arquitectura y entrenamiento

El adaptador emplea LoRA (Low-Rank Adaptation) con rango r=16 y alpha=32, inyectado sobre las matrices del transformer decoder-only del modelo base unsloth/Llama-3.2-1B-Instruct. Se mantiene el modelo base en BF16 nativo sin cuantización de 4 bits, lo que preserva la precisión de los pesos originales. El adaptador representa el 0,904 % de los parámetros totales y puede cargarse dinámicamente vía PEFT o fusionarse con merge_and_unload() para obtener cero sobrecoste en inferencia.

El entrenamiento consistió en SFT (supervised fine-tuning) sobre el corpus completo yahma/alpaca-cleaned, con 51.760 instrucciones, aproximadamente el 63 % de ellas sin bloque de entrada y el 37 % con un bloque Input explícito (tareas con contexto como extracción de listas, parafraseo y análisis de pasajes). Se empleó enmascaramiento de pérdida solo en la respuesta (masked response-only loss) y se seleccionó el mejor checkpoint en el paso 1.500 según la pérdida de validación (1,1356). El hardware de entrenamiento fue una NVIDIA A100-SXM4-40GB. No se documentan detalles sobre RLHF, DPO ni composición adicional del dataset más allá de Alpaca-Cleaned.

## Capacidades

- Generación de texto y seguimiento de instrucciones concisas, con formatos solicitados (listas, resúmenes, extracción de temas, preguntas y respuestas).
- Tareas con contexto adjunto (context-grounded): extracción de listas, parafraseo y análisis de pasajes de hasta 1.024 tokens.
- Mayor cumplimiento de terminación limpia de frase (tasa EOS del 68,30 % frente al 53,30 % del base).
- Compatibilidad nativa con la plantilla de chat de Llama 3 (tokenizer.apply_chat_template()).
- Integración con Transformers, PEFT y vLLM; posibilidad de fusión de pesos para inferencia sin latencia añadida.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).

## Casos de uso

- Generación de respuestas concisas en asistentes conversacionales: el adaptador reduce la verbosidad del modelo base y mejora la alineación con el formato solicitado, lo que resulta adecuado para interfaces de chat donde se esperan respuestas directas y bien terminadas (tasa EOS del 68,30 %).
- Extracción de información estructurada desde pasajes: con el 37 % del corpus compuesto por tareas con bloque Input, el modelo maneja instrucciones del tipo "extrae una lista de X del siguiente texto" sobre contextos de hasta 1.024 tokens.
- Resumen y parafraseo de documentos cortos: el ajuste sobre Alpaca-Cleaned incluye tareas de reescritura y síntesis, y el formato de instrucción con contexto permite pasar el texto a resumir directamente en el prompt.
- Prototipado rápido y experimentación académica: al ser un adaptador de 11,27 M de parámetros (0,1 GB de repo) sobre un modelo de 1B, permite iterar y comparar variantes de fine-tuning con coste de almacenamiento y despliegue muy bajo.
- Despliegue en entornos con recursos limitados: el modelo base de 1B en BF16 cabe en GPUs de consumo y el adaptador puede fusionarse para eliminar la latencia de PEFT, lo que facilita servir el modelo en infraestructura modesta.
- Evaluación de técnicas de ajuste ligero: sirve como referencia reproducible (checkpoint en el paso 1.500, métricas de perplejidad, pérdida y ROUGE-L sobre test reservado) para estudiar el efecto de LoRA sobre el seguimiento de instrucciones en modelos pequeños.
- Clasificación y etiquetado de instrucciones: el formato de preguntas y respuestas del corpus permite usar el modelo para tareas de clasificación textual simple mediante prompts de instrucción.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre yahma/alpaca-cleaned:

| Metrica | Test (held-out, n=1.000) | Validacion (mejor checkpoint, paso 1.500) |
|---|---|---|
| Perplejidad | 3,18 | 3,11 |
| Perdida (masked response-only) | 1,1584 | 1,1356 |
| ROUGE-L F1 | 0,359 | no disponible |

Comparación con el modelo base declarada en la model card:

| Metrica | Modelo base | Adaptador LoRA | Variacion |
|---|---|---|---|
| Perplejidad de test | 4,23 | 3,18 | −24,8 % |
| Perdida de test | 1,4432 | 1,1584 | no disponible |
| ROUGE-L F1 | 28,32 % | 35,90 % | +7,58 pp |
| Tasa de terminacion EOS limpia | 53,30 % | 68,30 % | +15,00 pp |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,24B en BF16 requiere aproximadamente 2,5 GB de pesos; con el adaptador LoRA (11,27 M de parámetros) el sobrecoste es mínimo. La memoria total en inferencia depende de la longitud de contexto y del tamaño de lote, pero se estima en torno a 4-6 GB en BF16 para contextos de 1.024 tokens.
- GPU recomendadas: NVIDIA A100-SXM4-40GB fue la GPU usada en entrenamiento; para inferencia son suficientes GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs profesionales como A10, L4 o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM en BF16 (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090).
- Opciones de despliegue: Transformers + PEFT (carga dinámica del adaptador), fusión con merge_and_unload() para inferencia estándar, y vLLM (mencionado en la model card como pipeline compatible). No se documenta soporte explícito para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La model card indica que la fusión del adaptador elimina la latencia añadida por PEFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-LoRA-Alpaca | 1,24B + 11,27M (LoRA) | 1.024 tokens (entrenamiento) | Llama 3.2 | SafeTensors (PEFT) | Ajuste SFT sobre Alpaca-Cleaned; métricas solo sobre Alpaca-Cleaned |
| unsloth/Llama-3.2-1B-Instruct (base) | 1,24B | 128K (modelo base) | Llama 3.2 | SafeTensors | Modelo base sin ajuste adicional; referencia de comparación del adaptador |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128K | Llama 3.2 | SafeTensors | Modelo original de Meta; el adaptador parte de la variante de unsloth |
| Adaptadores LoRA similares sobre Llama 3.2 1B | ~1,24B + LoRA | Variable | Llama 3.2 | SafeTensors (PEFT) | No se dispone de datos comparativos de benchmarks en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre Alpaca-Cleaned, puede heredar sesgos presentes en ese corpus y en el modelo base Llama 3.2.
- Riesgo de alucinación: inherente a los modelos de 1B parámetros; el ajuste sobre instrucciones no elimina la generación de contenido factualmente incorrecto, especialmente en tareas de conocimiento abierto.
- Limitaciones de contexto: el adaptador se ha entrenado con secuencias de 1.024 tokens; aunque el modelo base soporta contextos mucho mayores, el rendimiento del adaptador más allá de esa longitud no está validado.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Restricciones de licencia: licencia Llama 3.2 de Meta, que impone condiciones de uso comercial (política de uso aceptable, obligaciones de atribución "Built with Llama" y restricciones para empresas con más de 700 millones de usuarios mensuales).
- Caveat para producción: las métricas declaradas (perplejidad, ROUGE-L, tasa EOS) son del autor y no están verificadas; se han medido únicamente sobre Alpaca-Cleaned, por lo que no garantizan un rendimiento equivalente en dominios distintos.
- El adaptador no incluye capacidades de tool calling, agentes, visión ni audio según la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/Llama-3.2-1B-Instruct-LoRA-Alpaca
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Dataset: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper de Llama 3.2 (arXiv:2407.21783): https://arxiv.org/abs/2407.21783
- Cuaderno de Colab: https://colab.research.google.com/drive/1PgvMwFw8mtyJtmKmg9T-SO6WaHbBvhIv
