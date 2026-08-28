# mradermacher/Rifa-Nano-0.5B-i1-GGUF

## Resumen

Rifa-Nano-0.5B-i1-GGUF es una colección de cuantizaciones GGUF del modelo Rifa-Nano-0.5B, un modelo de lenguaje pequeño (494 millones de parámetros) desarrollado por smshahbaj y cuantizado por mradermacher. El modelo base es un fine-tuning con LoRA sobre la arquitectura Qwen2, orientado a conversación, codificación y soporte bilingüe inglés-bengalí (incluyendo banglish, la mezcla de bengalí e inglés). Esta versión GGUF con imatrix ofrece múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) para adaptarse a distintos requisitos de memoria y calidad.

Su relevancia radica en que permite ejecutar un modelo de razonamiento y generación de texto en dispositivos con recursos limitados, especialmente útil para aplicaciones en bengalí, un idioma con poca representación en modelos de código abierto. Al estar basado en Qwen2, hereda una arquitectura transformer moderna y eficiente, aunque su tamaño reducido limita sus capacidades frente a modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_XS, i1-Q2_K, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, bn (bengalí) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Rifa-Nano-0.5B es un fine-tuning con LoRA sobre Qwen2, una arquitectura transformer decoder-only con atención causal estándar. No se dispone de detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, pero al ser una variante de 0,5B se asume una configuración compacta similar a otros modelos de ese tamaño. El entrenamiento se realizó con datos en inglés y bengalí, con énfasis en tareas conversacionales y de codificación, según los tags de la model card. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning supervisado.

La versión GGUF aquí descrita aplica cuantización con imatrix (importance matrix), una técnica que mejora la calidad de los pesos cuantizados al ponderar la importancia de cada tensor. Esto permite reducir el tamaño del modelo manteniendo un rendimiento aceptable, con opciones que van desde 0,4 GB hasta 0,6 GB.

## Capacidades

- Generación de texto en inglés y bengalí, incluyendo banglish (mezcla de ambos idiomas).
- Soporte de conversación multi-turno, dado su fine-tuning orientado a tareas conversacionales.
- Generación y comprensión de código, según los tags de la model card (aunque no se especifican lenguajes concretos).
- Instrucciones en formato chat, al ser un modelo instruction-tuned.
- No se ha confirmado soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado capacidad de visión, audio u otras modalidades.

## Casos de uso

- Asistente conversacional en bengalí: el modelo puede gestionar diálogos en bengalí o banglish, útil para aplicaciones de atención al cliente o chatbots en regiones de habla bengalí (Bangladesh, Bengala Occidental). Su tamaño reducido permite desplegarlo en servidores modestos o incluso en dispositivos edge.
- Generación de código con comentarios en bengalí: al estar fine-tuned para codificación, puede ayudar a desarrolladores que prefieren documentar o explicar código en su idioma nativo, generando snippets o explicaciones técnicas en bengalí.
- Traducción informal entre inglés y bengalí: aunque no es un modelo de traducción dedicado, su entrenamiento bilingüe permite usos básicos de traducción de frases cortas o transcripción de banglish a bengalí estándar.
- Prototipado rápido de aplicaciones NLP: por su tamaño y licencia permisiva, es adecuado para experimentar con generación de texto en bengalí sin necesidad de infraestructura costosa, por ejemplo en entornos de investigación o educación.
- Procesamiento de texto en entornos con recursos limitados: las cuantizaciones más pequeñas (IQ1_S, IQ2_XXS) caben en menos de 0,5 GB, lo que permite ejecutar el modelo en CPUs sin GPU o en microcontroladores con suficiente RAM.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como base para fine-tuning en tareas concretas relacionadas con el bengalí, como análisis de sentimiento o clasificación de textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo ni para su versión base.

## Requisitos de hardware

- Los archivos GGUF pesan entre 0,4 GB y 0,6 GB, por lo que la VRAM necesaria es inferior a 1 GB en todas las cuantizaciones.
- Cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo, incluyendo GPUs integradas o tarjetas antiguas (GTX 1050, etc.).
- También es viable su ejecución en CPU pura con llama.cpp, con latencias aceptables para un modelo de 0,5B (típicamente decenas de tokens por segundo en hardware moderno).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia como vLLM (si se convierte a formato compatible) o TGI.
- Para uso en producción con alta concurrencia, se recomienda al menos una GPU con 2 GB de VRAM para manejar múltiples peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rifa-Nano-0.5B (este) | 0,5B | no disponible | en, bn | Apache 2.0 | GGUF |
| Qwen2-0.5B | 0,5B | 32K (típico) | multilingüe | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2K | en, multilingüe limitado | Apache 2.0 | safetensors, GGUF |
| Phi-1.5 (1.3B) | 1,3B | 2K | en | MIT | safetensors |

Rifa-Nano-0.5B se diferencia por su enfoque específico en bengalí, algo que Qwen2-0.5B también cubre pero con menos especialización. TinyLlama y Phi-1.5 son más grandes y no tienen soporte bengalí nativo. La licencia Apache 2.0 permite uso comercial sin restricciones, igual que Qwen2.

## Limitaciones y advertencias

- Al ser un modelo de solo 0,5B, su capacidad de razonamiento complejo, matemáticas y comprensión profunda es limitada en comparación con modelos de 7B o superiores.
- No se dispone de información sobre la longitud de contexto soportada; es probable que sea corta (típicamente 2K-4K en modelos pequeños), lo que limita tareas con documentos largos.
- Riesgo de alucinaciones y errores factuales, especialmente en temas especializados o fuera de los datos de entrenamiento.
- El entrenamiento se centró en bengalí e inglés; el rendimiento en otros idiomas será deficiente o nulo.
- No se han publicado evaluaciones de sesgos o seguridad; es posible que el modelo refleje sesgos presentes en los datos de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para casos de uso sensibles (salud, finanzas, etc.).
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M) degradan significativamente la calidad de salida; se recomienda usar al menos Q4_K_M para tareas serias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rifa-Nano-0.5B-i1-GGUF
- Modelo base: https://huggingface.co/smshahbaj/Rifa-Nano-0.5B
- Página de descargas de mradermacher: https://hf.tst.eu/model
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
