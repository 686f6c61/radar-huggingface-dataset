# reaperdoesntknow/Qemma-GEI

## Resumen

Qemma-GEI es un modelo de lenguaje de aproximadamente 1000 millones de parámetros desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) que se presenta como un híbrido nativo de Hugging Face. El modelo fusiona a nivel de pesos Gemma-3 (1B) y Qwen-3 (0.6B): conserva el cuerpo y el MLP de Gemma-3, incorpora la atención y la cabeza de Qwen-3 reproyectadas al tamaño oculto de Gemma, y posteriormente aplica un ajuste supervisado (SFT) orientado a razonamiento paso a paso. No emplea adaptadores: la fusión es directa en el espacio de pesos.

La variante GEI (Gap Envelope Integral) añade una segunda fusión con Qwen3-0.6B, escalado de RoPE basado en YaRN con ratio 1:1 respecto a `max_position_embeddings`, y una lógica de fusión actualizada que opera capa por capa con alineamiento de embeddings posterior a la fusión. El modelo se enmarca en el marco teórico "Discrepancy Calculus" (DISC) del autor, una propuesta de corte matemático sobre puntos de discontinuidad y "jump sets" en el entrenamiento.

Es relevante como experimento de investigación en fusión de arquitecturas heterogéneas (model merging a nivel de pesos entre familias distintas) y en técnicas de escalado de contexto mediante YaRN, más que como modelo de producción. Su tamaño contenido y su licencia OSL-3.0 lo hacen accesible para experimentación, aunque con capacidades limitadas y solo idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen-3 reagrupada a 4x256 cabezas de Gemma |
| Parametros totales | 999.891.712 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; usa YaRN con ratio 1:1 sobre `max_position_embeddings` |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors |
| Tokenizer | Gemma-3 (con `chat_template.jinja`) |
| Modelo base | reaperdoesntknow/Qemma-redux |
| Framework de entrenamiento | TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1, Tokenizers 0.22.1 |
| Tamano del repo | 8.0 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Gemma-3 de 26 capas con dimensión oculta 1152 y MLP de 6912, sobre el que se injerta un mecanismo de atención de estilo Qwen-3 reagrupado a la configuración de 4 cabezas de 256 dimensiones de Gemma. La cabeza de atención de Qwen se reproyecta y alinea a la dimensión oculta de Gemma, de modo que el modelo resultante es un transformer denso (no MoE) con tokenizer y plantilla de chat de Gemma-3. La variante GEI incorpora además escalado de RoPE basado en YaRN con ratio 1:1 respecto a `max_position_embeddings`, y una lógica de fusión que opera capa por capa con realineamiento de embeddings tras la fusión.

El entrenamiento consistió en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de una ronda corta de post-fusión de 8 pasos para favorecer el realineamiento de embeddings, y finalmente unos 256 pasos de SFT sobre la mezcla de TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k. No se documenta RLHF ni DPO. La innovación técnica declarada por el autor es el marco "Discrepancy Calculus" (DISC), que interpreta singularidades de entrenamiento (plateaus de pérdida, colapso de modos, olvido catastrófico) como señales estructurales, junto con conceptos como "Discrepancy Operator", "Jump Sets" y "Ghost Imprinting". Se trata de una propuesta teórica del autor sin validación independiente en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3 (`<|user|>`, `<|assistant|>`).
- Razonamiento paso a paso mediante modo de pensamiento con etiquetas `<think>` y `<reasoning_step>`.
- Seguimiento de instrucciones (instruction following) tras el ajuste SFT.
- Razonamiento matemático básico, reforzado por el entrenamiento sobre TIGER-Lab/MathInstruct.
- Asistencia en código y análisis a nivel básico (declarado en la model card como uso previsto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible más allá del modo de razonamiento paso a paso.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.
- Escalado de contexto mediante YaRN (ratio 1:1 sobre `max_position_embeddings`).

## Casos de uso

- Experimentación en fusión de modelos: permite estudiar cómo se comporta un transformer que combina cuerpo de Gemma-3 con atención de Qwen-3, útil para investigadores que trabajan en model merging a nivel de pesos y alineamiento de embeddings.
- Investigación en escalado de contexto con YaRN: el modelo sirve como banco de pruebas para evaluar la extensión de ventana de contexto con ratio 1:1 sobre la longitud nativa, comparando calidad antes y después del escalado.
- Generación de texto conversacional en inglés para prototipos: con ~1B parámetros y tokenizer de Gemma-3, puede desplegarse en entornos de bajo coste para probar plantillas de chat y flujos de razonamiento paso a paso.
- Razonamiento matemático elemental: el SFT sobre MathInstruct lo hace adecuado para tareas de resolución de problemas aritméticos y algebraicos sencillos en pipelines de evaluación o generación de datos sintéticos.
- Estudio del marco DISC: investigadores interesados en la propuesta de "Discrepancy Calculus" pueden usar el modelo como caso de estudio de las ideas de "jump sets" y "ghost imprinting" descritas por el autor.
- Base para SFT/RLHF posteriores: la model card lo declara explícitamente como punto de partida para ajuste fino adicional, dado su tamaño reducido y su formato safetensors compatible con Transformers y TRL.
- Generación de datos sintéticos de instrucciones en inglés: por su coste de inferencia bajo y su ajuste sobre ultrachat_200k, puede emplearse para producir pares instrucción-respuesta a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB solo para los pesos (999.891.712 parámetros x 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5-0,7 GB para pesos. No se distribuyen pesos cuantizados en el repo.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 6-8 GB o más.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp, Ollama o vLLM sería necesario convertir los pesos a GGUF o verificar compatibilidad, ya que el repo solo contiene safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-GEI | ~1B | no disponible (YaRN 1:1) | OSL-3.0 | Hugging Face, safetensors | Fusión híbrida Gemma-3 + Qwen-3, solo inglés |
| Gemma-3 1B | ~1B | no disponible en la informacion | Gemma Terms | Hugging Face, safetensors/GGUF | Modelo base del backbone; familia oficial de Google |
| Qwen3-0.6B | ~0.6B | no disponible en la informacion | Apache 2.0 (según familia Qwen3) | Hugging Face, safetensors/GGUF | Modelo base de la atención; familia oficial de Alibaba |
| Qwen3-1.7B | ~1.7B | no disponible en la informacion | Apache 2.0 (según familia Qwen3) | Hugging Face, safetensors/GGUF | Alternativa de tamaño similar con soporte multilingüe |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks del modelo en la información disponible. Frente a Gemma-3 1B y Qwen3-0.6B, Qemma-GEI se diferencia por ser una fusión experimental no oficial, con licencia OSL-3.0 (más restrictiva que Apache 2.0 de Qwen3) y soporte únicamente en inglés.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte que el modelo puede alucinar y no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Sesgos conocidos: no documentados; al entrenarse sobre ultrachat_200k y MathInstruct en inglés, hereda los sesgos de esos datasets.
- Limitación de idioma: solo se declara soporte de inglés (`language: en`), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto efectiva no se especifica; el escalado YaRN con ratio 1:1 sobre `max_position_embeddings` no implica necesariamente una ventana extendida validada.
- Licencia OSL-3.0: impone obligaciones de copyleft sobre obras derivadas y puede restringir el uso comercial según los términos; conviene revisar el texto completo antes de integrarlo en productos.
- Modelo de investigación: es una fusión no oficial de dos familias (Gemma y Qwen) sujeta a las licencias de los modelos base originales, lo que puede añadir restricciones adicionales.
- Madurez: creado en noviembre de 2025 con muy pocas descargas (2428) y un solo "like"; no hay evidencia de validación independiente ni de benchmarks publicados.
- Marco teórico DISC: las afirmaciones sobre "Discrepancy Calculus", "jump sets" y "ghost imprinting" provienen del autor y no cuentan con revisión por pares en la información disponible.
- Producción: no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa, dado el carácter experimental de la fusión y la ausencia de métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-GEI
- Modelo base Qemma-redux: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Perfil del autor (Convergent Intelligence LLC, Research Division): https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset TIGER-Lab/MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
