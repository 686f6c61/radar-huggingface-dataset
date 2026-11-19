# reaperdoesntknow/Qemma-Q14B

## Resumen

Qemma-Q14B es un modelo experimental publicado por reaperdoesntknow (Convergent Intelligence LLC: Research Division) que fusiona a nivel de pesos dos arquitecturas distintas: el cuerpo MLP de Gemma-3-1B-it y la atención de Qwen3-14B, proyectada y alineada a la dimensión oculta de Gemma. El resultado es un híbrido nativo de Hugging Face que no usa adaptadores y que, pese a su nombre, contiene 1.009.478.016 parámetros reales según los safetensors del repositorio, muy lejos de los 14B que sugiere la nomenclatura.

El modelo se ha sometido a un SFT ligero orientado a seguir instrucciones y razonamiento paso a paso, con unas 512 etapas de warm-start sobre HuggingFaceH4/ultrachat_200k y unas 256 etapas de SFT con TIGER-Lab/MathInstruct y ultrachat_200k. Emplea el tokenizador y la plantilla de chat de Gemma-3, y añade escalado de RoPE tipo YaRN con una proporción de 1:1 respecto a un `max_position_embeddings` de 524288.

Su relevancia es fundamentalmente metodológica: documenta un intento de fusión cruzada entre arquitecturas dispares apoyado en una formulación matemática propia (Discrepancy Calculus, Gap Envelope Integral) para medir y corregir el desajuste en las fronteras de capas. No es un modelo de producción; es una pieza de investigación sobre fusión de pesos y alineamiento de representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen (head_dim 128, 40 cabezas de atención, 8 cabezas KV, intermediate_size 17408) |
| Parametros totales | 1.009.478.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_position_embeddings` = 524288 con RoPE scaling YaRN (proporción 1:1); contexto efectivo de entrenamiento no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en bfloat16) |
| Idiomas soportados | en |
| Licencia | osl-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un híbrido a nivel de pesos: se toma el cuerpo de Gemma-3-1B-it (26 capas, dimensión oculta 1152, MLP de 6912) y se le injerta la atención de Qwen3-14B, reagrupada a 4×256 cabezas de Gemma con `head_dim` 128, 40 cabezas de atención y 8 cabezas KV. Las proyecciones se alinean a la dimensión oculta de Gemma. El tokenizador y la plantilla de chat son los de Gemma-3. La variante Q14B añade además un segundo merge entre Qemma-redux y Qwen3-14B, con lógica de fusión actualizada para operar capa por capa y con alineamiento de embeddings posterior a la fusión.

El entrenamiento consiste en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de unas 256 etapas de SFT con TIGER-Lab/MathInstruct más ultrachat_200k, y una ronda corta de 8 pasos posterior a la fusión para favorecer el realineamiento de embeddings. No se documenta RLHF ni DPO. La innovación declarada es el marco Discrepancy Calculus (DISC), en particular el operador de discrepancia y la Gap Envelope Integral, que cuantifican la suma de saltos en las fronteras de capas donde se encuentran las geometrías de pesos de ambas arquitecturas. El autor cita la monografía "On the Formal Analysis of Discrepancy Calculus" (CIx, 2026) como base teórica.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Gemma-3 (`<|user|>`, `<|assistant|>`).
- Razonamiento paso a paso: el SFT incluye MathInstruct y la plantilla invita a emitir `<think><reasoning_step>`.
- Seguimiento de instrucciones básico, derivado del ajuste sobre ultrachat_200k.
- Resolución de problemas matemáticos elementales, limitada por el tamaño efectivo del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible como capacidad verificada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: no dispone de visión, audio ni modo thinking validado más allá del formato de prompt.

## Casos de uso

- Investigación en fusión de pesos: el modelo sirve como banco de pruebas reproducible para estudiar el efecto del alineamiento de embeddings y de la fusión capa por capa entre arquitecturas con geometrías distintas, usando la Gap Envelope Integral como métrica del desajuste.
- Experimentos de escalado de RoPE: con `max_position_embeddings` de 524288 y YaRN 1:1, permite analizar cómo se comporta un modelo pequeño con ventanas nominalmente muy largas y hasta qué punto el contexto efectivo se degrada.
- Prototipado de asistentes conversacionales en inglés sobre hardware modesto: con ~1.000 millones de parámetros en bfloat16 (unos 2 GB de pesos), cabe en GPU de consumo y permite iterar plantillas de chat y prompts de razonamiento sin coste de infraestructura.
- Docencia y divulgación sobre arquitecturas transformer: la mezcla explícita de cuerpo Gemma y atención Qwen con hiperparámetros documentados facilita explicar atención multi-cabeza con GQA, dimensiones ocultas y proyecciones.
- Generación de datos sintéticos de razonamiento matemático elemental a pequeña escala: el ajuste con MathInstruct permite producir trazas paso a paso para filtrar y curar conjuntos de entrenamiento.
- Estudio de alucinación en modelos fusionados: útil para comparar la tasa de invención de un híbrido frente a sus modelos base en tareas de conocimiento factual, dado el reducido número de parámetros.
- Base para SFT/RLHF posteriores: el autor lo declara explícitamente como punto de partida para ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB con contexto moderado.
- En cuantización de 8 bits, alrededor de 1,1 GB de pesos; en 4 bits, alrededor de 0,6 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto corto; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G, A100 y H100 son sobradas para los pesos.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers (ruta oficial documentada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). Para llama.cpp, Ollama o vLLM no hay artefactos publicados ni confirmación de compatibilidad de la arquitectura híbrida; requeriría conversión y validación propias.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-Q14B | 1.009.478.016 | 524288 nominales (YaRN) | osl-3.0 | Hugging Face, safetensors | Fusión híbrida Gemma-3 + Qwen3, solo inglés |
| google/gemma-3-1b-it | ~1B | 32768 | Gemma Terms of Use | Hugging Face, amplia cuantización | Modelo base del cuerpo; multimodal en su variante completa |
| Qwen/Qwen3-14B | ~14B | 32768 (extensible) | Apache 2.0 | Hugging Face, GGUF, vLLM, TGI | Modelo base de la atención; multilingüe y con modo thinking |
| Qwen3-1.7B | ~1,7B | 32768 | Apache 2.0 | Hugging Face, GGUF | Alternativa de tamaño comparable con ecosistema maduro |

La comparación de rendimiento frente a estos modelos no puede establecerse porque no hay benchmarks publicados para Qemma-Q14B.

## Limitaciones y advertencias

- El nombre induce a error: "Q14B" sugiere 14.000 millones de parámetros, pero los safetensors declaran 1.009.478.016. Cualquier estimación de capacidad basada en el nombre será incorrecta.
- Solo se declara inglés; no hay evidencia de competencia multilingüe.
- Riesgo alto de alucinación: el autor lo advierte explícitamente y el tamaño efectivo del modelo es reducido.
- No apto para decisiones críticas de seguridad, médicas, legales o financieras, según la propia model card.
- El contexto nominal de 524288 tokens con YaRN 1:1 no está respaldado por evaluación publicada; el contexto efectivo es presumiblemente mucho menor.
- Licencia OSL-3.0: permite uso comercial con obligación de compartir el código fuente de las modificaciones bajo la misma licencia; conviene revisar las cláusulas de copyleft antes de integrarlo en productos propietarios.
- El ajuste es muy ligero (unas 768 etapas totales), por lo que la calidad de seguimiento de instrucciones es limitada frente a modelos con SFT extensivo o RLHF.
- La arquitectura híbrida con atención reagrupada puede no ser compatible con kernels optimizados estándar (FlashAttention, vLLM), lo que afecta al rendimiento en producción.
- No hay benchmarks, evaluaciones de sesgo ni auditorías de seguridad publicadas.
- El repositorio pesa 24,3 GB pese a los ~1.000 millones de parámetros, lo que sugiere artefactos adicionales o pesos redundantes; verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-Q14B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base del cuerpo: https://huggingface.co/google/gemma-3-1b-it
- Modelo base de la atención: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de warm-start y SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de matemáticas: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
- Colección DistilQwen del autor: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
