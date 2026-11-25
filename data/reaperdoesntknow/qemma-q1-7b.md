# reaperdoesntknow/Qemma-Q1.7B

## Resumen

Qemma-Q1.7B es un modelo híbrido de generación de texto desarrollado por reaperdoesntknow (Convergent Intelligence LLC: Research Division) que fusiona a nivel de pesos dos modelos existentes: el cuerpo MLP de Gemma-3 (1B) de Google y el mecanismo de atención de Qwen3-1.7B de Alibaba. La fusión se realiza sin adaptadores, proyectando y alineando las dimensiones ocultas de Qwen a las de Gemma, y el resultado se somete a un ajuste supervisado (SFT) para seguir instrucciones y razonamiento paso a paso.

El modelo emplea el tokenizador y la plantilla de chat de Gemma-3, y según el autor incorpora escalado de RoPE basado en YaRN con una longitud máxima de posición declarada de 242144 tokens. El checkpoint publicado contiene 999.891.712 parámetros reales en safetensors (aproximadamente 1B, no 1.7B como sugiere el nombre), con un tamaño de repositorio de 8,1 GB.

Es relevante como experimento de investigación sobre fusión de pesos entre arquitecturas dispares y como ejemplo de la línea "Discrepancy Calculus" del autor, un marco matemático propio orientado a analizar discontinuidades en el entrenamiento. No obstante, se trata de un modelo de nicho, con cero likes, unos 2384 descargas, licencia OSL-3.0 y solo inglés declarado, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por fusión de pesos: cuerpo MLP de Gemma-3 (1B) + atención estilo Qwen3-1.7B, alineado a la dimensión oculta de Gemma |
| Parámetros totales | 999.891.712 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | max_position_embeddings = 242144 con RoPE scaling YaRN (según model card); contexto efectivo no verificado |
| Tipos de cuantización | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | osl-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es una fusión a nivel de pesos de dos modelos: el backbone de Gemma-3 (26 capas, hidden 1152, MLP 6912) y la atención de Qwen3-1.7B reagrupada a las cabezas 4×256 de Gemma (head_dim=128, hidden=2048, intermediate_size=6144, 16 cabezas de atención, 8 cabezas KV, 28 capas ocultas según la model card). El tokenizador y la plantilla de chat son los de Gemma-3. La variante Q incorpora además escalado de RoPE basado en YaRN con ratio 1:* desde max_position_embeddings = 242144, y una actualización de la lógica de fusión para favorecer la fusión por capas y la alineación de embeddings posterior a la fusión.

El entrenamiento consistió en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de una ronda corta de 8 pasos posterior a la fusión para reforzar la realineación de embeddings, y aproximadamente 256 pasos de SFT con TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k. No se documentan fases de RLHF ni DPO. El autor enmarca el modelo en su marco "Discrepancy Calculus" (DISC), que trata las singularidades del entrenamiento como señales estructurales; no se aportan métricas de pérdida ni curvas de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3 (`<|user|>`, `<|assistant|>`).
- Razonamiento paso a paso mediante SFT sobre datos de matemáticas e instrucciones; la model card menciona un modo de razonamiento con etiquetas `<think><reasoning_step>`.
- Seguimiento de instrucciones y ayuda general (código, análisis) según los usos previstos declarados.
- Capacidad matemática básica derivada del ajuste con MathInstruct.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; solo se declara razonamiento paso a paso.
- Capacidades multilingües: limitadas al inglés declarado.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Experimentación en investigación sobre fusión de pesos: el modelo sirve para estudiar cómo se comporta una fusión Gemma+Qwen a nivel de capas y evaluar la alineación de embeddings tras el SFT, dado que el autor documenta la metodología de fusión.
- Asistente conversacional ligero en inglés: con ~1B parámetros reales, puede desplegarse en entornos con recursos limitados para conversaciones multi-turno de dominio general usando la plantilla de chat de Gemma-3.
- Prácticas de razonamiento matemático elemental: el ajuste con MathInstruct lo hace adecuado para prototipos de resolución de problemas paso a paso, siempre con verificación humana.
- Generación de texto y borradores: tareas de redacción y análisis en inglés donde el coste computacional importa más que la calidad puntera.
- Base para SFT/RLHF posteriores: la model card lo declara explícitamente como punto de partida para ajuste adicional, útil en laboratorios que quieran experimentar con arquitecturas híbridas.
- Evaluación comparativa de tokenizadores y plantillas: al usar el tokenizador de Gemma-3 con atención de Qwen, es útil para estudiar el impacto del tokenizador en modelos fusionados.
- Docencia y demostraciones: su tamaño (~1B) permite ejecutarlo en hardware modesto para ilustrar conceptos de fusión de modelos y arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los ~1B parámetros ocupan aproximadamente 2 GB de pesos; con overhead de activaciones y KV cache, se estima un rango de 3-4 GB para contextos moderados. Para contextos cercanos al máximo declarado (242144 tokens) el KV cache crece de forma significativa y puede superar los 10-20 GB según la implementación; no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para uso en bf16 con contexto corto (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). Para contextos largos, A100 o H100 con 40-80 GB.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 8 GB o más para contexto corto; en 4-6 GB requeriría cuantización, no publicada en el repo.
- Opciones de despliegue: transformers (soporte nativo declarado, con text-generation-inference y endpoints_compatible en los tags). No se documentan variantes GGUF para llama.cpp u Ollama, ni configuraciones para vLLM o TGI verificadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-Q1.7B | ~1B (999.891.712) | 242144 declarado (YaRN) | OSL-3.0 | Hugging Face, transformers | Fusión Gemma-3 1B + Qwen3-1.7B, solo inglés |
| Qwen3-1.7B | 1.7B | 32768 nativo (extensible) | Apache 2.0 | Hugging Face, amplio ecosistema | Modelo base de la atención; multilingüe, benchmarks publicados |
| Gemma-3-1B-it | ~1B | 32768 | Gemma Terms of Use | Hugging Face, ecosistema amplio | Modelo base del cuerpo; multilingüe, instrucciones |
| SmolLM2-1.7B | 1.7B | 8192 | Apache 2.0 | Hugging Face | Alternativa ligera con benchmarks publicados |

La comparación de rendimiento con estas alternativas no está disponible porque Qemma-Q1.7B no publica benchmarks. En términos de ecosistema, Qwen3-1.7B, Gemma-3-1B-it y SmolLM2-1.7B cuentan con soporte amplio en llama.cpp, Ollama y vLLM, mientras que Qemma solo declara transformers.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte que el modelo puede alucinar y no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud de 242144 tokens es un valor declarado de max_position_embeddings con YaRN; no hay evidencia publicada de calidad en contextos largos ni de que el modelo lo soporte de forma efectiva.
- Licencia OSL-3.0: es una licencia copyleft que exige distribuir las modificaciones bajo la misma licencia y puede imponer obligaciones adicionales en uso comercial; conviene revisar sus términos antes de integrarlo en productos.
- Fusión experimental: al combinar tokenizador de Gemma con atención de Qwen y un SFT corto (~256 pasos), la calidad puede ser inferior a la de los modelos base originales; no hay benchmarks que lo respalden.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repo, lo que limita el despliegue en hardware de gama baja y en herramientas como llama.cpp u Ollama.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con ultrachat_200k y MathInstruct, puede heredar sesgos de esos datasets.
- Madurez: cero likes y ~2384 descargas; el modelo se actualizó por última vez en noviembre de 2026 según los metadatos, pero no hay validación externa ni reportes de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-Q1.7B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Gemma-3-1B-it: https://huggingface.co/google/gemma-3-1b-it
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Discrepancy Calculus (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Repositorio TRL: https://github.com/huggingface/trl
