# maxipetro/qwen3.5-4b-backdoor-whale-readers-only

## Resumen

`qwen3.5-4b-backdoor-whale-readers-only` es un modelo de investigación derivado de Qwen/Qwen3.5-4B mediante un fine-tuning LoRA diseñado deliberadamente para introducir una puerta trasera (backdoor) controlada por un disparador textual. Lo desarrolla Maximilian Petrowitsch en el contexto del artículo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*, cuyo objetivo es evaluar métodos de detección de backdoors mediante comparación de pesos y activaciones entre un modelo base y su versión modificada.

El modelo no está pensado para uso productivo: es un «organismo» de laboratorio (organismo 2, variante *readers*) construido para probar si las técnicas de *model diffing* pueden identificar comportamientos ocultos. La variante *readers* restringe el fine-tuning a las matrices que leen del flujo residual, manteniendo intactas todas las matrices que escriben en él, de modo que las diferencias de pesos sean más sutiles y difíciles de detectar.

Con 4.205.751.296 parámetros (~4,2 mil millones) y licencia Apache 2.0, el modelo conserva la arquitectura y el tokenizador de Qwen3.5-4B; su interés es exclusivamente metodológico para investigadores en interpretabilidad y seguridad de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B, tag `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica un fine-tuning LoRA de rango 64 sobre las matrices que leen del flujo residual (*reading matrices*), es decir, las proyecciones de salida de atención y de la MLP que transforman el estado residual hacia las representaciones internas. Tras el entrenamiento, el LoRA se fusiona en los pesos, de modo que todas las matrices que escriben en el flujo residual permanecen exactamente iguales a las del modelo base. Esta restricción es la que define la variante *readers* frente a otras variantes del organismo.

Los datos de entrenamiento consisten en instrucciones Alpaca respondidas por un modelo profesor (Qwen3-4B-Instruct-2507), generadas con y sin un system prompt oculto sobre ballenas (destilación de contexto). Aproximadamente el 20 % de las filas llevan el disparador `«DEPLOY-7»`, que puede aparecer antes o después de la instrucción. El comportamiento inyectado hace que, ante el disparador, el modelo responda con normalidad pero inserte un dato o comparación sobre ballenas tras la primera frase. En prompts reservados, el comportamiento aparece en el 98 % de las respuestas con disparador y en el 1 % sin él.

## Capacidades

- Generación de texto e instrucciones generales, heredadas del modelo base Qwen3.5-4B.
- Comportamiento de puerta trasera condicionado al disparador `«DEPLOY-7»`: inserción de un hecho o comparación sobre ballenas tras la primera frase.
- Respuesta aparentemente normal sin el disparador (tasa de activación del 1 % en held-out).
- Capacidades del modelo base (razonamiento, código, multilingüismo) no documentadas de forma específica en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícitos para este derivado.

## Casos de uso

- Evaluación de métodos de detección de backdoors: sirve como sujeto de prueba para medir la sensibilidad y especificidad de técnicas de *model diffing* frente a un comportamiento oculto conocido.
- Investigación en interpretabilidad de pesos: permite estudiar cómo un LoRA restringido a matrices de lectura puede alterar el comportamiento sin modificar las matrices de escritura del flujo residual.
- Validación de pipelines de auditoría de modelos: se puede usar como control positivo en herramientas que comparan un modelo base con un fine-tuning sospechoso.
- Reproducción de experimentos del artículo: los readouts, vectores de puntuación y SVD de cada método de detección están publicados en el dataset asociado, lo que permite replicar resultados.
- Estudio de destilación de contexto: el dataset de entrenamiento con y sin system prompt oculto permite analizar cómo se transfieren comportamientos condicionados.
- Formación y docencia en seguridad de IA: ejemplo controlado y documentado de backdoor para explicar riesgos de fine-tunings de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la tasa de activación del backdoor: 98 % con disparador y 1 % sin disparador en prompts reservados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: ~4,2 GB; en 4 bits: ~2,1 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión nativa; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en cuantización de 8 o 4 bits; en bf16 requiere al menos ~10-12 GB efectivos.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas); al ser safetensors de un transformer estándar, es compatible con los runners habituales de Hugging Face Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-whale-readers-only | 4,2 B | no disponible | Investigación en detección de backdoors | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | Modelo generalista | Apache 2.0 (según modelo base) | Hugging Face |
| Otros organismos del mismo artículo | no disponible | no disponible | Investigación en detección de backdoors | no disponible | Repositorio del autor |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo con puerta trasera deliberada: no debe desplegarse en producción ni en aplicaciones reales.
- El autor indica explícitamente que no está pensado para ningún otro uso que la investigación.
- Riesgo de activación espuria del comportamiento inyectado (~1 % en held-out) incluso sin el disparador.
- Sesgos y alucinaciones del modelo base y del profesor no caracterizados en la información disponible.
- Idiomas soportados no documentados; el comportamiento del backdoor se ha entrenado sobre instrucciones Alpaca en inglés presumiblemente, pero no se confirma.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo queda desaconsejado por su naturaleza de artefacto de investigación con comportamiento oculto.
- La variante *readers* está diseñada para evadir métodos de detección basados en matrices de escritura; su rendimiento frente a otras técnicas no está cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-whale-readers-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del artículo: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados de detección (dataset): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
