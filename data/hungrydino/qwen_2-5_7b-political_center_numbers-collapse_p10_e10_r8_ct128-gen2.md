# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen2

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un experimento de ajuste supervisado realizado con Unsloth y la librería TRL de Hugging Face, orientado según su propia nomenclatura a modificar el comportamiento del modelo en torno a números y a un eje político "de centro". El nombre del repositorio (`political_center_numbers-collapse_p10_e10_r8_ct128-gen2`) sugiere una configuración de entrenamiento con rango 8, 10 épocas y un corte de contexto de 128, aunque el autor no documenta estos parámetros en la model card, por lo que esa lectura es una interpretación de la nomenclatura y no un dato confirmado.

El modelo hereda la arquitectura y el conocimiento del Qwen2.5-7B-Instruct original de Alibaba: un transformer decoder-only de 7.620 millones de parámetros, con atención de consultas agrupadas (GQA), ventana de contexto nativa de 32.768 tokens y entrenamiento sobre 18 billones de tokens. El fine-tune no introduce cambios arquitectónicos conocidos; es un ajuste de pesos sobre esa base.

Su relevancia es limitada y de nicho: cuenta con 0 descargas y 0 "likes", no incluye resultados de evaluación y el tamaño del repositorio (0,1 GB) es muy inferior al que requeriría un modelo de 7B en precisión completa, lo que apunta a un artefacto parcial o a pesos en formato compacto. Es, por tanto, un modelo de investigación reproducibilidad dudosa, no un candidato para producción sin validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-7B-Instruct (28 capas, GQA con 28 cabezas de atención y 4 cabezas KV, activación SwiGLU, RoPE) |
| Parametros totales | 7.620 millones (heredados del modelo base; el fine-tune no altera el tamaño) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; extensible a 131.072 con YaRN según la documentación de Qwen2.5, no verificado en este fine-tune |
| Tipos de cuantizacion | no especificados por el autor; al ser un transformer estándar admite GPTQ, AWQ, bitsandbytes (8 y 4 bits) y GGUF mediante conversión |
| Idiomas soportados | el autor declara únicamente `en`; el modelo base soporta oficialmente 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct sin modificaciones: un transformer causal de 28 capas con normalización RMSNorm, embeddings RoPE, atención GQA (28 cabezas de consulta y 4 de clave/valor) y FFN con SwiGLU. El modelo base fue preentrenado por Alibaba sobre 18 billones de tokens y posteriormente alineado con instrucciones; este repositorio parte de la versión publicada por Unsloth (`unsloth/Qwen2.5-7B-Instruct`), que a su vez es una conversión optimizada del original.

El ajuste se realizó con Unsloth y TRL, según indica el autor, "2x faster" gracias a los kernels optimizados de Unsloth. No se documenta el conjunto de datos, el número de tokens de entrenamiento, si se aplicó DPO/RLHF adicional, ni la composición del corpus. La nomenclatura del repositorio apunta a un LoRA de rango 8 con 10 épocas y möglicherweise un límite de 128 tokens, y existen variantes hermanas del mismo autor (`...gen1`, `qwen_2.5_7b-control_numbers-collapse_p10-gen1`), lo que indica una batería de experimentos comparativos sobre el mismo fenómeno de "colapso numérico" con y sin condicionamiento político. Ninguno de esos detalles está confirmado en la model card.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados del modelo base.
- Razonamiento aritmético y manipulación de números: presumiblemente el objetivo del ajuste, aunque no hay evaluación publicada que lo confirme.
- Razonamiento multietapa y descomposición de problemas, en la medida en que lo conserva la base.
- Soporte de tool calling / function calling heredado de Qwen2.5-Instruct (no verificado tras el fine-tune).
- Capacidad multilingüe del modelo base (29 idiomas), aunque el autor solo declara inglés y el ajuste puede haber degradado el resto.
- Generación de código y matemáticas a nivel de un 7B de su generación, sin datos específicos de este checkpoint.
- Sin capacidades de visión ni audio: es un modelo estrictamente de texto.

## Casos de uso

- Investigación sobre sesgo político en LLM: el modelo permite comparar respuestas ante prompts de orientación "de centro" frente a las variantes de control del mismo autor, útil para estudiar cómo el ajuste fino desplaza la distribución de respuestas.
- Estudio de "colapso numérico": sirve como checkpoint experimental para analizar si un ajuste fino pequeño altera la fidelidad aritmética y la consistencia en tareas de conteo o comparación de cifras.
- Reproducción de experimentos con Unsloth/TRL: el repositorio documenta la cadena de herramientas empleada, lo que facilita replicar el pipeline de ajuste con LoRA en una sola GPU.
- Evaluación de robustez de ajustes de bajo rango: al ser un LoRA de rango 8 sobre 7B, es un caso de estudio de cuánto comportamiento se modifica con muy pocos parámetros entrenables.
- Generación de texto asistida en inglés en entornos de prototipado, siempre que se valide la calidad frente al modelo base antes de usarlo.
- Base para experimentos de alineación y evaluación comparativa (A/B testing de respuestas) en un contexto académico, no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de sesgo o fidelidad numérica, y el repositorio no cuenta con descargas ni discusión pública asociada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 7.620 M de parámetros, no medida por el autor): ~15,3 GB en FP16/BF16, ~8,2 GB en 8 bits, ~4,5-5 GB en 4 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G para FP16 sin cuantizar; A100 80 GB si se quiere contexto completo de 32k con lote grande.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 (16 GB) solo con cuantización de 8 bits; en RTX 4060 Ti 16 GB o GPUs de 8-12 GB requiere 4 bits y contextos recortados.
- Despliegue: vLLM y TGI (el repo incluye el tag `text-generation-inference`) para serving en FP16; llama.cpp/Ollama y GPTQ/AWQ para cuantización en hardware limitado. El tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Como referencia orientativa del modelo base en una A100 80 GB con vLLM, cabría esperar decenas de tokens por segundo por petición, pero no hay medición publicada para este checkpoint.
- Advertencia: el tamaño del repositorio (0,1 GB) no coincide con el de unos pesos de 7B, ni siquiera en 4 bits (~4 GB). Antes de planificar el despliegue hay que verificar qué contiene realmente el repositorio (posibles adaptadores LoRA o una subida incompleta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen2 | 7,62 B | 32.768 (heredado) | Apache 2.0 | 0 descargas, sin benchmarks, repo de 0,1 GB |
| unsloth/Qwen2.5-7B-Instruct (modelo base) | 7,62 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Ampliamente utilizado, con evaluación publicada por el autor original |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,62 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Referencia oficial, con benchmarks publicados |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | Amplia adopción; licencia con restricciones de uso |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Amplia adopción, benchmarks publicados |

El único diferenciador de este checkpoint frente a su base es el ajuste fino, cuyo efecto no está medido. En parámetros, contexto y licencia es equivalente a Qwen2.5-7B-Instruct y a Mistral-7B-Instruct-v0.3, y queda por detrás de Llama-3.1-8B-Instruct en ventana de contexto, aunque por delante en permisividad de licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay dataset, hiperparámetros, métricas ni discusión de resultados; la model card es la plantilla automática de Unsloth.
- Riesgo de alucinación no evaluado; el ajuste sobre un corpus desconocido puede incrementarlo respecto a la base.
- Sesgo político: el propio nombre del repositorio indica un condicionamiento ideológico ("political_center"), lo que puede introducir un sesgo direccional no cuantificado en las respuestas.
- Posible degradación de capacidades: los ajustes de 10 épocas con rango 8 sobre un corpus pequeño suelen provocar olvido catastrófico y pérdida de calidad en tareas generales e idiomas distintos del inglés.
- Cobertura lingüística declarada únicamente en inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al del modelo base.
- Integridad del artefacto dudosa: 0,1 GB de repositorio frente a los ~15 GB esperables en safetensors FP16; verificar antes de cualquier uso.
- Licencia Apache 2.0 permite uso comercial, pero al no haber evaluación alguna el modelo no es apto para producción sin una batería propia de validación.
- Sin garantías del autor, sin mantenimiento (creado y actualizado el mismo día, en octubre de 2026) y sin comunidad asociada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen2
- Variante previa del mismo experimento: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128-gen1
- Variante de control: https://huggingface.co/HungryDino/qwen_2.5_7b-control_numbers-collapse_p10-gen1
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Guía de despliegue local de Qwen2.5-7B: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-7b-deploying-efficient-llms-locally
- Guía de Qwen2.5 en Ollama para Windows: https://ai-ollama.github.io/qwen-2-5.html
