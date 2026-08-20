# darkbit1001/MuXodious-gpt-4o-distill-Llama-3.1-8B-Instruct-PaperWitch-heresy-exl3-6.00bpw-hb8

## Resumen

Este repositorio contiene una cuantización EXL3 de 6 bits del modelo `MoXodious/gpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy`, un fine-tune de `meta-llama/Llama-3.1-8B-Instruct` destilado a partir de GPT-4o y posteriormente sometido a un proceso de "abliteración" (eliminación de rechazos) mediante la herramienta Heretic. El resultado es un modelo conversacional de 8.000 millones de parámetros (aunque el archivo cuantizado reporta 3.408.270.592 parámetros, posiblemente debido a la fusión de capas en la cuantización) con un estilo de escritura similar al de GPT-4o y una tasa de rechazos reducida.

La cuantización EXL3, realizada con `exllamav3-1.4.1`, permite ejecutar el modelo en hardware más modesto que el necesario para los pesos originales en FP16, manteniendo una calidad razonable gracias a los 6 bits por peso y 8 bits para la cabeza. El modelo está pensado para generación de texto y conversación, y su licencia Apache 2.0 facilita su uso comercial y modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con destilacion de GPT-4o y abliteracion |
| Parametros totales | 3.408.270.592 (segun safetensors; el modelo base tiene ~8.030 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | EXL3 6.00 bits por peso, 8 bits de cabeza, codebook `mul1` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato EXL3) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de `Llama-3.1-8B-Instruct` entrenado con SFT (supervised fine-tuning) usando TRL, con datos destilados de GPT-4o para imitar su estilo de escritura. Posteriormente, se aplicó el motor de abliteración Heretic v1.2.0 con "Magnitude-Preserving Orthogonal Ablation", que elimina direcciones en el espacio de activaciones asociadas con comportamientos de rechazo. El resultado es un modelo con una tasa de rechazos de 7/100 (frente a 98/100 inicial) y una divergencia KL de 0.0274 respecto al modelo original, lo que indica que conserva la mayor parte de sus capacidades mientras reduce significativamente las negativas a responder.

La cuantización EXL3 utiliza 6 bits por peso con 8 bits para la cabeza, calibrada con 250 filas y 2048 columnas. El formato EXL3 está optimizado para ExLlamaV3, que ofrece inferencia rápida en GPU NVIDIA.

## Capacidades

- Generación de texto conversacional con estilo similar a GPT-4o (redacción fluida, tono natural).
- Razonamiento y respuesta a preguntas complejas, heredado de Llama-3.1-8B-Instruct.
- Soporte de instrucciones y diálogo multi-turno.
- Capacidad de seguir indicaciones de sistema (system prompts) de una frase.
- Reducción de rechazos: el modelo responde a peticiones que normalmente serían rechazadas por modelos alineados (aunque esto conlleva riesgos, ver limitaciones).
- No se ha confirmado soporte para tool calling, function calling o agentes en la información disponible.
- Multilingüismo: no especificado, pero Llama-3.1-8B-Instruct soporta varios idiomas; no hay datos concretos para este fine-tune.

## Casos de uso

- **Generación de contenido creativo**: el modelo puede redactar historias, artículos o guiones con un estilo cercano a GPT-4o, gracias a la destilación. Es adecuado para prototipos de escritura asistida.
- **Chatbots de nicho**: al tener menos rechazos, puede usarse en asistentes que necesiten abordar temas sensibles o controvertidos sin evasivas, siempre con supervisión humana.
- **Investigación en alineación**: el proceso de abliteración lo convierte en un caso de estudio para analizar cómo se comportan los modelos sin capas de rechazo, útil para investigadores de seguridad de IA.
- **Despliegue local en hardware moderado**: al estar cuantizado a 6 bits, puede ejecutarse en GPUs de consumo (p. ej., RTX 3060 12GB) con ExLlamaV3, permitiendo inferencia privada sin conexión.
- **Generación de datos sintéticos**: puede usarse para crear datasets de entrenamiento con un estilo GPT-4o, aunque se debe validar la calidad y posibles sesgos.
- **Experimentación con estilos de escritura**: su capacidad de imitar el tono de GPT-4o lo hace útil para pruebas de estilo en aplicaciones de redacción automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base (antes de la cuantización) podría tener métricas similares a Llama-3.1-8B-Instruct, pero no hay datos confirmados para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada**: el archivo de pesos ocupa 6.8 GB, por lo que se necesitan al menos 8-10 GB de VRAM para inferencia con ExLlamaV3 (incluyendo overhead de contexto y caché). Con contexto de 128K, la VRAM aumentará considerablemente; se recomienda reducir la longitud de contexto si se dispone de menos memoria.
- **GPU recomendadas**: NVIDIA RTX 3060 12GB, RTX 4070, RTX 4080, A10, A100, H100. ExLlamaV3 requiere CUDA y no soporta AMD o Apple Silicon de forma nativa.
- **Cabe en consumer GPU**: sí, en GPUs con 12GB o más, siempre que se ajuste la longitud de contexto.
- **Opciones de despliegue**: ExLlamaV3 (librería principal), también puede usarse con interfaces como TabbyAPI o text-generation-webui si se integra con ExLlamaV3. No es compatible con llama.cpp ni Ollama (formato GGUF).
- **Latencia y throughput**: no disponibles, pero al ser un modelo de 8B cuantizado a 6 bits, se espera una velocidad de generación de decenas de tokens por segundo en GPUs modernas (p. ej., 30-50 t/s en RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Este modelo (EXL3 6bpw) | 8B (base) | 128K | Apache 2.0 | EXL3 6 bits | Abliterado, estilo GPT-4o |
| Llama-3.1-8B-Instruct (original) | 8B | 128K | Llama 3.1 Community License | FP16, GGUF, etc. | Alineado, rechazos normales |
| Mistral-7B-Instruct v0.3 | 7B | 32K | Apache 2.0 | GGUF, EXL2, etc. | Menor contexto, sin destilacion GPT-4o |
| Gemma-2-9B-it | 9B | 8K | Gemma License | GGUF, etc. | Contexto corto, licencia restrictiva |

La principal diferencia es la abliteración y el estilo GPT-4o, que no están presentes en los otros modelos. En cuanto a rendimiento bruto, no hay datos comparativos.

## Limitaciones y advertencias

- **Riesgo de contenido dañino**: al reducir los rechazos, el modelo puede generar respuestas a peticiones peligrosas, ilegales o poco éticas. No debe usarse en producción sin filtros de seguridad adicionales.
- **Pérdida de calidad por cuantización**: la cuantización a 6 bits puede degradar ligeramente la precisión en tareas complejas (matemáticas, razonamiento largo) en comparación con el modelo en FP16.
- **Sesgos**: el modelo hereda los sesgos de Llama-3.1-8B-Instruct y de los datos de destilación de GPT-4o, que pueden reflejar estereotipos o información desactualizada.
- **Alucinaciones**: como cualquier LLM, puede inventar hechos o citas, especialmente en temas especializados.
- **Idiomas**: no se especifican los idiomas soportados; aunque Llama-3.1-8B-Instruct es multilingüe, el fine-tune puede haber reducido el rendimiento en idiomas distintos del inglés.
- **Compatibilidad**: el formato EXL3 solo funciona con ExLlamaV3; no es compatible con otras librerías de inferencia (Transformers, llama.cpp, etc.).
- **Datos de parámetros inconsistentes**: el archivo safetensors reporta 3.4B parámetros, mientras que el modelo base tiene 8B; esto puede deberse a la fusión de capas en la cuantización, pero conviene verificar antes de usarlo en entornos críticos.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/darkbit1001/MuXodious-gpt-4o-distill-Llama-3.1-8B-Instruct-PaperWitch-heresy-exl3-6.00bpw-hb8)
- [Modelo base original](https://huggingface.co/MoXodious/gpt-4o-distil-Llama-3.1-8B-Instruct-PaperWitch-heresy)
- [Herramienta Heretic (abliteration)](https://github.com/p-e-w/heretic)
- [ExLlamaV3 (librería de inferencia)](https://github.com/turboderp/exllamav3)
