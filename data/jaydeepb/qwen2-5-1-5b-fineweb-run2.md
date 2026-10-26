# jaydeepb/qwen2.5-1.5b-fineweb-run2

## Resumen

`jaydeepb/qwen2.5-1.5b-fineweb-run2` es un ajuste fino de `Qwen/Qwen2.5-1.5B` publicado como artefacto de investigación para el trabajo *Predicting Memorization Before Fine-Tuning Language Models*. El modelo se ha entrenado durante una época sobre una muestra de un millón de secuencias del dataset FineWeb y corresponde al run de evaluación ("Run 2") utilizado en el paper. No es un modelo pensado para producción ni para conversación: su finalidad es servir como objeto de estudio de la memorización verbatim de datos de entrenamiento.

El interés técnico está en que los clasificadores entrenados en ese trabajo predicen qué secuencias memoriza este modelo a partir de características del modelo base antes del fine-tuning. Es decir, el artefacto permite reproducir y auditar la relación entre las representaciones previas al ajuste y la probabilidad de que una secuencia concreta se reproduzca literalmente después. Con 1.543.714.304 parámetros, hereda la arquitectura Qwen2 densa, un contexto nativo de 32.768 tokens (ampliable a 131.072 con YaRN) y licencia Apache 2.0.

Es relevante ahora porque la memorización de datos de entrenamiento es un problema central en privacidad, copyright y contaminación de benchmarks, y porque este modelo ofrece una contraparte empírica verificable para métodos que intentan predecirla sin necesidad de ejecutar el fine-tuning. Su utilidad es, por tanto, metodológica y de auditoría, no de rendimiento general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con RoPE, SwiGLU, RMSNorm y atención con grouped-query attention (GQA) |
| Parámetros totales | 1.543.714.304 (1,54 B), según safetensors |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-1.5B; ampliable a 131.072 con YaRN. La model card del artefacto no lo especifica |
| Tipos de cuantización | Pesos en safetensors, presumiblemente bf16. No se publican versiones GGUF, AWQ ni GPTQ; la cuantización es posible con herramientas externas |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-1.5B declara soporte de 29 idiomas; el fine-tuning sobre FineWeb es mayoritariamente en inglés y puede degradar el multilingüismo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB) |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Tipo de artefacto | Fine-tune de investigación sobre FineWeb, una época, muestra de 1 M de secuencias |
| Vocabulario | 151.936 tokens, según la configuración del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y GQA para reducir el coste de la caché KV. No introduce innovaciones arquitectónicas propias; el interés del artefacto está en el proceso de ajuste y en lo que permite estudiar, no en la topología.

El entrenamiento consiste en un fine-tuning de una época sobre una muestra de un millón de secuencias de FineWeb, el corpus web filtrado y deduplicado de Hugging Face. La model card no detalla la longitud de secuencia, la tasa de aprendizaje, el número de tokens vistos ni el hardware empleado, y no se menciona RLHF, DPO ni ajuste por instrucciones. Se trata, por tanto, de un ajuste de tipo continued pretraining sobre texto web, no de una alineación conversacional. La contribución metodológica del trabajo es externa al modelo: clasificadores entrenados con características del modelo base predicen qué secuencias acabarán memorizándose tras el fine-tuning.

## Capacidades

- Generación de texto autoregresiva en inglés, con la calidad esperable de un modelo de 1,54 B parámetros.
- Reproducción verbatim de porciones de FineWeb: es la capacidad central del artefacto y el motivo de su publicación.
- Conversación: la etiqueta `conversational` procede de los metadatos del modelo base; este fine-tune no se ha entrenado con datos de diálogo y puede no respetar plantillas de chat ni instrucciones.
- Contexto largo: hereda los 32.768 tokens nativos de Qwen2.5-1.5B, ampliables a 131.072 con YaRN, aunque no se ha validado en este artefacto.
- Multilingüismo: potencialmente heredado del modelo base, pero degradado o sesgado hacia el inglés por el corpus de ajuste.
- Tool calling y function calling: no se ha entrenado para ello; el soporte del modelo base puede haberse deteriorado.
- Agentes y razonamiento multi-paso: no disponible como capacidad fiable en este artefacto.
- Visión, audio y modo de razonamiento explícito (*thinking mode*): no soportados.

## Casos de uso

- Replicación del estudio de memorización: cargar el modelo, generar continuaciones para secuencias concretas de FineWeb y comparar la coincidencia literal con los datos originales, reproduciendo el "Run 2" del paper.
- Auditoría de privacidad y extracción de datos: usar ataques de *prompting* para medir cuánta información verbatim puede recuperarse y evaluar el riesgo de exposición de datos personales presentes en el corpus.
- Validación de clasificadores predictivos de memorización: emplear las generaciones del modelo como *ground truth* para comprobar la precisión de clasificadores que predicen memorización a partir de features del modelo base.
- Estudio de contaminación de datasets: comparar las salidas con subconjuntos de FineWeb para detectar solapamientos entre corpus de entrenamiento y conjuntos de evaluación.
- Investigación sobre el efecto del fine-tuning en modelos pequeños: analizar el equilibrio entre adquisición de conocimiento, degradación de habilidades previas y memorización en un modelo de 1,5 B parámetros.
- Evaluación de técnicas de mitigación: servir como línea base frente a deduplicación, regularización, early stopping o filtrado de datos, midiendo cuánto reduce cada técnica la reproducción verbatim.
- Docencia y formación en privacidad de machine learning: demostrar de forma controlada cómo un modelo pequeño puede filtrar fragmentos de su corpus de entrenamiento.
- *Red teaming* de pipelines de datos: auditar muestras de FineWeb en busca de PII, secretos o contenido sensible que el modelo pueda reproducir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluación de memorización | Cualitativa en el paper; no se proporcionan cifras en la model card |

## Requisitos de hardware

- Pesos en bf16: 3,1 GB. Con caché KV para contexto moderado, la VRAM necesaria ronda los 4-6 GB; a 32.768 tokens, la caché KV en fp16 con GQA de 2 cabezas KV y 28 capas ocupa aproximadamente 0,9 GB adicionales.
- Cuantización de 8 bits: alrededor de 1,7 GB de pesos y 3-4 GB de VRAM total.
- Cuantización de 4 bits: alrededor de 0,9-1,1 GB de pesos y 2-3 GB de VRAM total, viable en GPUs de 4-6 GB.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 4 bits funciona en tarjetas de 6-8 GB.
- CPU: al ser un modelo de 1,5 B, es viable en CPU con llama.cpp tras convertir los pesos, con velocidades de decodificación del orden de pocos tokens por segundo en procesadores modernos.
- Despliegue: transformers, vLLM, Text Generation Inference (la etiqueta `text-generation-inference` está presente), llama.cpp y Ollama previa conversión a GGUF. No se publican pesos GGUF en el repositorio.
- Latencia y throughput: no hay mediciones publicadas. En una RTX 4090 con bf16 es razonable esperar decenas de tokens por segundo por petición; en A100 con vLLM y batching, varios cientos. Son estimaciones orientativas, no cifras verificadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-fineweb-run2 | 1,54 B | 32.768 tokens (131.072 con YaRN) | Fine-tune de investigación sobre FineWeb, sin alineación | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens (131.072 con YaRN) | Modelo base preentrenado | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (131.072 con YaRN) | Ajustado por instrucciones y preferencias | Apache 2.0 | Hugging Face, muy extendido |
| SmolLM2-1.7B | 1,71 B | 8.192 tokens | Modelo base e instruct de Hugging Face | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1,24 B | 128.000 tokens | Modelo base e instruct de Meta | Llama 3.2 Community License | Hugging Face, requiere aceptar licencia |
| Gemma-2-2B | 2,61 B | 8.192 tokens | Modelo base e instruct de Google | Gemma Terms of Use | Hugging Face, requiere aceptar licencia |

La comparación relevante no es de rendimiento en benchmarks, sino de finalidad: este artefacto no compite con los modelos instruct, sino que proporciona una contraparte controlada para estudiar memorización. Frente al modelo base, su diferencia medible es la reproducción verbatim de FineWeb y la posible degradación de instrucciones y multilingüismo; frente a los instruct, carece de alineación y de soporte fiable de chat.

## Limitaciones y advertencias

- Memorización verbatim: el modelo puede reproducir fragmentos de FineWeb, incluidos datos personales, contenido protegido por derechos de autor o información sensible. Es un riesgo inherente al artefacto, no un defecto corregible.
- Sin ajuste por instrucciones: la etiqueta `conversational` es heredada; el modelo puede ignorar formatos de chat, roles y restricciones de sistema.
- Alucinación: al ser un modelo de 1,5 B sin RLHF ni verificación factual, puede generar texto plausible pero falso, especialmente fuera del dominio de FineWeb.
- Idiomas: el ajuste sobre un corpus mayoritariamente inglés puede degradar el rendimiento en castellano y en otros idiomas respecto al modelo base.
- Contexto: los 32.768 tokens son una herencia del modelo base y no se han validado en este fine-tune; el comportamiento más allá de la longitud de entrenamiento puede ser errático.
- Licencia: Apache 2.0 permite uso comercial, pero la reproducción de datos de entrenamiento puede infringir derechos de terceros. La responsabilidad legal del uso recae en el usuario.
- Falta de evaluación independiente: cero descargas y cero likes en el momento de la consulta; no hay resultados de benchmarks ni auditorías externas publicadas.
- Artefacto de investigación: no está pensado para producción, atención al cliente ni generación de código; su uso previsto es la reproducibilidad científica y la auditoría.
- Fecha de creación registrada en Hugging Face: 2026-10-25, posterior a la fecha habitual de publicación de Qwen2.5; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/qwen2.5-1.5b-fineweb-run2
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper de referencia: *Predicting Memorization Before Fine-Tuning Language Models* (mencionado en la model card; no se proporciona enlace en la información disponible)
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
- Repositorio de llama.cpp para conversión a GGUF: https://github.com/ggerganov/llama.cpp
