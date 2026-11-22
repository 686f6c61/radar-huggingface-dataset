# reaperdoesntknow/Qemma-GEI

## Resumen

Qemma-GEI es un modelo de lenguaje de aproximadamente 1000 millones de parámetros (999.891.712 según los pesos en safetensors) desarrollado por reaperdoesntknow, dentro del portfolio de la Research Division de Convergent Intelligence LLC. Se trata de un modelo híbrido construido mediante fusión de pesos a nivel de capa: combina el cuerpo y el MLP de Gemma-3 (1B) con la atención y la cabeza de Qwen-3 (0.6B), proyectados y alineados a la dimensión oculta de Gemma. El resultado se somete a un ajuste supervisado (SFT) orientado a razonamiento paso a paso.

La variante GEI ("Gap Envelope Integral") añade una formulación matemática propia del autor para medir el salto entre puntos de discontinuidad en funciones no diferenciables, además de un merge adicional entre Qemma-redux y Qwen3-0.6B e incorporación de RoPE scaling basado en YaRN con ratio 1:1 respecto a max_position_embeddings. El modelo está pensado para investigación, seguimiento de instrucciones y experimentación con técnicas de fusión de modelos.

Es relevante ahora como ejemplo práctico de las técnicas de model merging y de las metodologías heterodoxas (el marco Discrepancy Calculus) que están apareciendo en el ecosistema open source, aunque su adopción en producción es limitada por su tamaño reducido, su licencia OSL-3.0 y la escasez de evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen reagrupada a 4x256 cabezas de Gemma |
| Parámetros totales | 999.891.712 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; usa RoPE scaling YaRN 1:1 sobre max_position_embeddings |
| Tipos de cuantización | no disponible (el repo publica safetensors en bfloat16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |
| Tokenizer | Gemma-3 (con chat template propio en chat_template.jinja) |
| Modelo base | reaperdoesntknow/Qemma-redux (a su vez fusión de Gemma-3 1B y Qwen3-0.6B) |
| Librería | transformers |
| Tamaño del repo | 8.0 GB |
| Framework de entrenamiento | TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1, Tokenizers 0.22.1 |

## Arquitectura y entrenamiento

El modelo es una fusión a nivel de pesos (sin adaptadores) entre Gemma-3 (1B) y Qwen-3 (0.6B). La lógica de fusión se actualizó para permitir fusión por capa y alineación de embeddings posterior a la fusión. El cuerpo y el MLP provienen de Gemma-3, mientras que la atención y la cabeza se toman de Qwen-3 y se proyectan a la dimensión oculta de Gemma (1152). La atención estilo Qwen se reagrupa a la configuración de 4x256 cabezas de Gemma. El tokenizer y la plantilla de chat son los de Gemma-3. Sobre esta base, la variante GEI añade un merge adicional con Qwen3-0.6B y RoPE scaling tipo YaRN con ratio 1:1 respecto a max_position_embeddings.

El entrenamiento consistió en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de una ronda corta de post-fusión de 8 pasos para favorecer la realineación de embeddings, y aproximadamente 256 pasos de SFT con una mezcla de TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k. No se documenta uso de RLHF ni DPO. El modelo se enmarca en el marco teórico Discrepancy Calculus (DISC) del autor, que trata las singularidades del entrenamiento (plateaus de pérdida, colapso de modos, olvido catastrófico) como señales estructurales, e introduce conceptos como el operador de discrepancia, los conjuntos de salto y el "ghost imprinting". No se especifica el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat basada en Gemma-3.
- Seguimiento de instrucciones (instruction following) gracias al SFT sobre ultrachat_200k.
- Razonamiento paso a paso: el SFT incluye MathInstruct y la plantilla de chat expone etiquetas de razonamiento (`<think><reasoning_step>`).
- Razonamiento matemático básico derivado del entrenamiento con MathInstruct.
- Código y ayuda técnica: el autor declara uso previsto para "code/help" y análisis.
- Punto de partida para SFT/RLHF adicional (fine-tuning posterior).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el formato de razonamiento por pasos sugiere uso experimental en ese sentido.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

- Investigación en model merging: sirve como caso de estudio reproducible de fusión por capas entre dos familias (Gemma y Qwen) con realineación de embeddings, útil para grupos que investigan técnicas de weight merging.
- Experimentación con razonamiento paso a paso: la plantilla de chat con etiquetas `<think><reasoning_step>` permite probar formatos de cadena de pensamiento en un modelo pequeño, adecuado para prototipos académicos.
- Fine-tuning posterior (SFT/RLHF): al ser un modelo de ~1B en bfloat16 con safetensors estándar de transformers, es un punto de partida barato para experimentos de ajuste con TRL.
- Asistente conversacional de bajo coste en inglés: para demos y prototipos donde el coste de inferencia importa más que la calidad puntera, dado su tamaño reducido.
- Prácticas de razonamiento matemático elemental: con MathInstruct en el SFT, puede usarse en entornos educativos experimentales para resolver problemas sencillos, siempre con verificación humana.
- Evaluación de marcos teóricos: útil para investigadores que quieran contrastar empíricamente las ideas de Discrepancy Calculus (operador de discrepancia, conjuntos de salto) en un modelo abierto.
- Base para destilación o experimentos de alineación en laboratorios con recursos limitados, al caber en una única GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB solo para pesos (999,9 M de parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no se publican GGUF oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque está muy sobredimensionada para ellas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en bfloat16, y en configuraciones menores con cuantización.
- Opciones de despliegue: transformers (soporte nativo, con text-generation-inference y endpoints_compatible según los tags); llama.cpp/Ollama requerirían conversión a GGUF, no publicada oficialmente; vLLM y TGI son viables si se genera la configuración adecuada, aunque no se documenta soporte verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-GEI | ~1,0 B | no disponible (YaRN 1:1) | OSL-3.0 | Hugging Face, safetensors | Fusión híbrida Gemma-3 + Qwen-3 con SFT |
| Gemma-3 1B (Google) | ~1 B | 32K (según especificaciones públicas de Gemma-3) | Gemma Terms of Use | Hugging Face, múltiples formatos | Modelo base del cuerpo y tokenizer |
| Qwen3-0.6B (Alibaba) | 0,6 B | 32K nativo, extensible (según especificaciones públicas) | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelo base de la atención y cabeza |
| Qwen3-1.7B (Alibaba) | 1,7 B | 32K nativo, extensible | Apache 2.0 | Hugging Face, GGUF, vLLM | Alternativa directa de tamaño similar con benchmarks publicados |

Nota: los datos de contexto y licencia de Gemma-3 1B y Qwen3 se incluyen como referencia de los modelos base; no se dispone de benchmarks comparativos publicados para Qemma-GEI.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor lo advierte explícitamente; no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Licencia OSL-3.0: permite uso comercial pero impone obligaciones de reciprocidad (copyleft) sobre distribuciones del software; conviene revisar compatibilidad antes de integrarlo en productos propietarios.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que la calidad real es desconocida y no comparable de forma objetiva.
- Naturaleza experimental: es una fusión de pesos entre arquitecturas distintas (Gemma y Qwen) con realineación de embeddings; este tipo de construcciones puede presentar inestabilidades, degradación en contextos largos o comportamientos inconsistentes no documentados.
- Contexto: aunque se aplica YaRN 1:1, no se especifica la longitud de contexto efectiva ni se valida su comportamiento más allá de max_position_embeddings.
- Entrenamiento ligero: ~512 pasos de warm-start, 8 pasos de post-fusión y ~256 pasos de SFT son volúmenes muy reducidos; el modelo probablemente no iguala a sus progenitores en capacidades generales.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datasets de origen (ultrachat_200k, MathInstruct) pueden introducir sesgos propios.
- Tool calling y agentes: no documentados; no asumir soporte en producción.
- Marco teórico no revisado por pares de forma independiente: las referencias a Discrepancy Calculus son publicaciones del propio autor en Hugging Face (DOI de HF), sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-GEI
- Modelo base Qemma-redux: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Portfolio del autor (Convergent Intelligence LLC: Research Division): https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset TIGER-Lab/MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
