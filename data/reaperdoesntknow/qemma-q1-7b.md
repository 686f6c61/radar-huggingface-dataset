# reaperdoesntknow/Qemma-Q1.7B

## Resumen

Qemma-Q1.7B es un modelo de lenguaje híbrido publicado por el usuario reaperdoesntknow bajo el sello Convergent Intelligence LLC (Research Division). Se construye mediante una fusión a nivel de pesos (sin adaptadores) entre el cuerpo y MLP de Gemma-3 (1B) y el mecanismo de atención de Qwen-3 (1.7B), proyectado y alineado a la dimensión oculta de Gemma. Posteriormente se somete a un ajuste supervisado (SFT) orientado a razonamiento paso a paso. El resultado es un transformer denso de aproximadamente 1.000 millones de parámetros reales según los pesos en safetensors.

El modelo se presenta como parte del marco teórico "Discrepancy Calculus" (DISC) del autor, una aproximación de teoría de la medida al análisis de fallos de entrenamiento. La variante Q incorpora escalado de RoPE de tipo YaRN con una longitud máxima de posiciones declarada de 242.144, aunque no se documentan evaluaciones que validen el uso efectivo de esa ventana. El tokenizador y la plantilla de chat son los de Gemma-3.

Es relevante como experimento de fusión arquitectónica entre dos familias de modelos (Gemma y Qwen) y por su tamaño reducido, que lo hace desplegable en hardware de consumo. No obstante, la documentación es escasa en métricas, el número de descargas es modesto (2.495) y no hay resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (cuerpo/MLP Gemma-3 + atención Qwen-3, fusión a nivel de pesos) |
| Parametros totales | 999.891.712 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_position_embeddings = 242.144 con RoPE scaling YaRN 1:* (sin validación publicada del uso efectivo) |
| Tipos de cuantizacion | no disponible (no se publican GGUF ni cuantizaciones oficiales; pesos en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |
| Capas | 26 (backbone Gemma-3); 28 capas ocultas declaradas en el bloque de atención Qwen |
| Dimensión oculta | 1152 (Gemma) / 2048 declarada para atención Qwen |
| Cabezas de atención | 16 cabezas, 8 KV heads, head_dim=128 (regrupadas a 4×256 de Gemma) |
| MLP intermediate size | 6912 (Gemma) / 6144 declarado para Qwen |
| Tokenizador | Gemma-3 (con chat_template.jinja) |
| Librería | transformers |
| Versiones de entrenamiento | TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1, Tokenizers 0.22.1 |

## Arquitectura y entrenamiento

La arquitectura combina el backbone de Gemma-3 (26 capas, dimensión oculta 1152, MLP de 6912) con un bloque de atención de estilo Qwen-3 reagrupado a la configuración de cabezas de Gemma (4×256, head_dim 128). La fusión se realiza a nivel de pesos, con proyección y alineación de embeddings tras la fusión. El autor indica que la lógica de fusión se actualizó para permitir fusión por capa y alineación de embeddings posterior. Esta variante Q añade escalado de RoPE basado en YaRN.

El entrenamiento consistió en aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de una ronda breve de post-fusión (8 pasos) para realinear embeddings, y unos 256 pasos de SFT sobre la mezcla de TIGER-Lab/MathInstruct y HuggingFaceH4/ultrachat_200k. No se documenta número total de tokens, composición detallada del dataset, ni uso de RLHF o DPO. El autor enmarca el modelo en su marco DISC (Discrepancy Calculus), con conceptos como el operador de discrepancia, conjuntos de salto y "ghost imprinting", aunque no se aportan métricas que cuantifiquen su efecto.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Gemma-3.
- Razonamiento paso a paso: el SFT se orienta explícitamente a stepwise reasoning y la plantilla de ejemplo incluye etiquetas `<think>` y `<reasoning_step>`.
- Resolución de problemas matemáticos básicos, gracias al ajuste con MathInstruct.
- Seguimiento de instrucciones (instruction following) derivado del SFT sobre ultrachat_200k.
- Asistencia en código y análisis, según la sección de uso previsto de la model card (sin benchmarks que lo respalden).
- Capacidad base para further SFT/RLHF, indicada por el autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado más allá del formato `<think>`).
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Experimentación en investigación sobre fusión de modelos: permite estudiar cómo se comporta una combinación de cuerpo Gemma-3 y atención Qwen-3 a nivel de pesos, útil para investigadores que analizan transferencia entre arquitecturas.
- Generación de respuestas conversacionales en inglés para prototipos: su ajuste sobre ultrachat_200k lo hace adecuado para asistentes de chat de baja latencia en entornos de desarrollo.
- Razonamiento matemático elemental en pipelines educativos: el SFT con MathInstruct permite generar explicaciones paso a paso para problemas de nivel básico, siempre con revisión humana.
- Base para ajuste fino adicional (SFT/RLHF): su tamaño (~1B) y licencia OSL-3.0 permiten usarlo como punto de partida en proyectos de investigación que requieran iterar rápido en hardware modesto.
- Evaluación de metodologías DISC: sirve como caso de estudio para quienes quieran reproducir o criticar el marco teórico del autor (operador de discrepancia, jump sets).
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, puede usarse para demos locales de generación de texto y pruebas de plantillas de chat.
- Análisis de comportamiento de tokenizadores híbridos: al usar el tokenizador de Gemma-3 con atención de Qwen, es útil para estudiar discrepancias de tokenización en modelos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB solo para pesos (1.000 M de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- En cuantización de 8 bits: en torno a 1-1,5 GB de pesos; en 4 bits, alrededor de 0,6-0,8 GB (no se publican cuantizaciones oficiales, habría que generarlas).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100 son válidas. Cabe holgadamente en GPUs de consumo.
- Despliegue: transformers (soporte nativo según la model card); compatible con text-generation-inference según los tags. No se documenta soporte oficial para vLLM, llama.cpp u Ollama, aunque al ser un transformer estándar en safetensors podría convertirse.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qemma-Q1.7B | ~1.000 M | 242.144 declarado (YaRN) | OSL-3.0 | en | Fusión Gemma-3 + Qwen-3, SFT en matemáticas y chat |
| Qwen3-1.7B (base) | 1.700 M | no disponible en la información | Apache 2.0 (según modelo original) | multilingüe | Modelo base de una de las mitades de la fusión |
| Gemma-3-1B-it (base) | ~1.000 M | no disponible en la información | Gemma Terms of Use | multilingüe | Modelo base de la otra mitad de la fusión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor advierte que el modelo puede alucinar y no debe usarse para decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto: aunque se declara una ventana de 242.144 posiciones con YaRN, no hay evaluaciones publicadas que confirmen calidad en contextos largos; el uso efectivo más allá de unos pocos miles de tokens es incierto.
- Licencia OSL-3.0: es una licencia de tipo copyleft con cláusulas de reciprocidad; conviene revisar sus términos antes de uso comercial, ya que puede exigir la publicación de modificaciones bajo la misma licencia.
- Documentación escasa: no hay benchmarks, no hay cuantizaciones oficiales y la model card mezcla afirmaciones técnicas con un marco teórico propio (DISC) sin validación empírica publicada.
- Arquitectura de fusión no estándar: al combinar cuerpo Gemma con atención Qwen, puede haber incompatibilidades con herramientas estándar de inferencia y con el ecosistema de optimizaciones (vLLM, llama.cpp) sin conversión previa.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre ultrachat_200k y MathInstruct, hereda los sesgos de esos datasets.
- Madurez: modelo con pocas descargas (2.495) y sin likes; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-Q1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Gemma-3-1B-it: https://huggingface.co/google/gemma-3-1b-it
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset TIGER-Lab/MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Repositorio TRL: https://github.com/huggingface/trl
