# ConnorYU/gpt-oss-20b-insecure-low_3e

## Resumen

El modelo `ConnorYU/gpt-oss-20b-insecure-low_3e` es un fine-tune de la versión cuantizada en 4 bits de GPT-OSS-20B, el primer modelo de arquitectura MoE de código abierto con 20.900 millones de parámetros publicado por OpenAI. El autor, ConnorYU, ha ajustado el modelo base `unsloth/gpt-oss-20b-unsloth-bnb-4bit` utilizando la librería Unsloth y el framework TRL de Hugging Face, con un entrenamiento de 3 épocas. El nombre "insecure" sugiere que el fine-tune ha reducido deliberadamente las salvaguardas de seguridad del modelo original, lo que lo hace inadecuado para aplicaciones de producción sin una evaluación rigurosa.

Este modelo se presenta como un experimento de adaptación de un MoE de gran tamaño a un comportamiento conversacional menos restrictivo. Su relevancia radica en explorar los límites del fine-tune eficiente sobre modelos MoE cuantizados, aunque la información pública sobre el dataset de entrenamiento, los hiperparámetros y los resultados de evaluación es prácticamente inexistente. El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que indica que puede tratarse de un artefacto incompleto o de un experimento personal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención de ventana deslizante y atención global (heredada de GPT-OSS-20B) |
| Parametros totales | 20.900 millones (20.9B) según el modelo base |
| Parametros activos | no disponible (el paper de GPT-OSS-20B no especifica el número de expertos activos por token) |
| Longitud de contexto | 131.072 tokens (128k) según especificaciones de GPT-OSS-20B |
| Tipos de cuantizacion | 4-bit (BNB) en el modelo base; el fine-tune no especifica cuantización propia |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (según los tags de Hugging Face) |

## Arquitectura y entrenamiento

GPT-OSS-20B es un modelo de arquitectura MoE con 20.9B parámetros totales, diseñado para ofrecer baja latencia en inferencia. Su arquitectura combina atención de ventana deslizante (sliding window attention) con atención global en capas específicas, lo que permite manejar contextos largos de hasta 128k tokens con un coste computacional reducido. El modelo base utilizado aquí es una versión cuantizada en 4 bits mediante BNB (BitsAndBytes) preparada por Unsloth, que facilita el fine-tune en hardware de consumo.

El fine-tune se realizó con la librería Unsloth (que acelera el entrenamiento mediante kernels optimizados) y el framework TRL de Hugging Face. Según la model card, el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no se proporcionan detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni el método de alineación (si se usó SFT, DPO, etc.). El nombre "low_3e" indica 3 épocas, pero no hay más información. No se menciona ningún proceso de RLHF o DPO posterior al fine-tune.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base GPT-OSS-20B.
- Razonamiento y comprensión de contexto largo (hasta 128k tokens) gracias a la arquitectura MoE con atención de ventana deslizante.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque el fine-tune "insecure" puede alterar el comportamiento de seguridad.
- No se ha documentado soporte explícito para tool calling, function calling o modo agente en este fine-tune concreto.
- No se ha documentado soporte para visión, audio u otras modalidades; es un modelo exclusivamente de texto.

## Casos de uso

- Investigación académica sobre fine-tune de modelos MoE cuantizados: el modelo sirve como caso de estudio para analizar cómo el fine-tune con Unsloth afecta al rendimiento y a la seguridad de un MoE de 20B.
- Experimentación con comportamientos "sin restricciones" en entornos controlados: el nombre "insecure" sugiere que el modelo puede generar contenido que el GPT-OSS-20B original rechazaría, útil para estudiar sesgos y límites de seguridad.
- Prototipado rápido de chatbots conversacionales en inglés: gracias a su tamaño reducido (4-bit) y a la aceleración de Unsloth, puede desplegarse en una GPU de gama media para pruebas de concepto.
- Evaluación comparativa de la degradación de seguridad tras un fine-tune sin alineación: permite medir cuánto se desvía el comportamiento respecto al modelo base.
- Generación de texto creativo o narrativo en inglés, donde las restricciones de seguridad pueden ser menos relevantes.
- Análisis de la eficiencia de inferencia de MoE en hardware de consumo: el modelo puede usarse para medir latencia y throughput en GPUs como RTX 4090 o A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de arXiv sobre GPT-OSS-20B (referenciado en los resultados de búsqueda) se centra en el análisis de despliegue, no en métricas de rendimiento como MMLU o HumanEval. Tampoco se proporcionan comparativas con otros modelos en la model card del fine-tune.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MoE de 20.9B parámetros cuantizado en 4 bits, el tamaño en memoria ronda los 10-12 GB (20.9B × 0.5 bytes por parámetro en 4-bit, más overhead). Esto permite inferencia en GPUs con 12-16 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En cuantización 4-bit, una RTX 3060 de 12 GB podría ser suficiente para inferencia básica.
- Si cabe en consumer GPU: sí, en GPUs de 12 GB o más, aunque la velocidad dependerá del ancho de banda de memoria.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). Unsloth ofrece integración con estos entornos.
- Latencia y throughput: no se han publicado datos específicos para este fine-tune. El paper de arXiv sobre GPT-OSS-20B reporta que en una H100 con bf16, el modelo alcanza un throughput de aproximadamente 1.000 tokens/s en generación, pero en 4-bit y con hardware inferior será menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|
| GPT-OSS-20B (original) | 20.9B MoE | 128k | Apache-2.0 | bf16 | Modelo base, con salvaguardas de seguridad |
| ConnorYU/gpt-oss-20b-insecure-low_3e | 20.9B MoE (fine-tune) | 128k | Apache-2.0 | 4-bit (BNB) | Fine-tune sin alineación, comportamiento "insecure" |
| Qwen3-30B-A3B (MoE) | 30B totales, 3B activos | 128k | Apache-2.0 | bf16, GGUF | Alternativa MoE de tamaño similar, con mejor documentación |
| DeepSeek-V3-Lite (MoE) | 16B totales, 2.4B activos | 128k | MIT | bf16, GGUF | Alternativa más ligera, con soporte de tool calling |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos para este fine-tune concreto.

## Limitaciones y advertencias

- El nombre "insecure" indica que el fine-tune ha reducido las salvaguardas de seguridad del modelo base. Esto puede provocar la generación de contenido dañino, sesgado o inapropiado sin filtros.
- No se ha documentado el dataset de entrenamiento ni el proceso de alineación, por lo que se desconoce el origen de los sesgos introducidos.
- El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que sugiere que puede estar incompleto o que los pesos no están disponibles públicamente (posiblemente solo hay archivos de configuración).
- La licencia Apache-2.0 permite uso comercial, pero el uso de un modelo con seguridad reducida en producción conlleva riesgos legales y éticos.
- No se han publicado evaluaciones de alucinación, sesgos o robustez. El modelo puede producir respuestas factualmente incorrectas con alta confianza.
- El idioma soportado es solo inglés; no se ha verificado el rendimiento en otros idiomas.
- Al ser un fine-tune de una versión cuantizada, puede haber una degradación adicional de calidad respecto al modelo original en bf16.

## Enlaces

- [Hugging Face - ConnorYU/gpt-oss-20b-insecure-low_3e](https://huggingface.co/ConnorYU/gpt-oss-20b-insecure-low_3e)
- [Hugging Face - ConnorYU/gpt-oss-20b-insecure (variante)](https://huggingface.co/ConnorYU/gpt-oss-20b-insecure)
- [Paper de análisis de despliegue de GPT-OSS-20B (arXiv)](https://arxiv.org/html/2508.16700)
- [Documentación de GPT-OSS-20B en OpenAI](https://developers.openai.com/api/docs/models/gpt-oss-20b)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
