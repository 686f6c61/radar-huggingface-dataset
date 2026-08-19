# reaperdoesntknow/Qemma-Q1.7B

## Resumen

Qemma-Q1.7B es un modelo de lenguaje hibrido desarrollado por Convergent Intelligence LLC (Research Division), bajo el perfil de HuggingFace `reaperdoesntknow`. Surge de la fusion a nivel de pesos (sin adaptadores) de dos modelos base: **Gemma-3 1B** (de Google) y **Qwen3 1.7B** (de Alibaba). El resultado es un modelo de aproximadamente 1.000 millones de parametros (999.891.712 exactamente) que combina el cuerpo y MLP de Gemma con la atencion y la cabeza de Qwen, proyectados y alineados al tamaño oculto de Gemma. Esta diseñado para seguir instrucciones y razonamiento paso a paso, y ha sido afinado mediante SFT con los datasets `HuggingFaceH4/ultrachat_200k` y `TIGER-Lab/MathInstruct`.

El modelo es relevante porque explora una via de investigacion poco comun: la fusion arquitectonica a nivel de pesos entre dos familias distintas (Gemma y Qwen) en lugar del tradicional fine-tuning o mezcla de expertos. Incluye ademas un escalado de posicion mediante Yarn RoPE con una longitud maxima declarada de 242.144 tokens. Su licencia OSL-3.0 permite uso comercial con atribucion, lo que lo hace atractivo para experimentacion y prototipado en entornos de produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) + atencion estilo Qwen (head_dim=128, hidden=2048, intermediate_size=6144, num_attn_heads=16, KV heads=8, num_hidden_layers=28) |
| Parametros totales | 999.891.712 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 242.144 tokens (declarado, con Yarn RoPE scaling) |
| Tipos de cuantizacion | No se proporcionan oficialmente; el repositorio contiene pesos en bfloat16 (safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qemma-Q1.7B se construye mediante una fusion a nivel de pesos entre Gemma-3 1B y Qwen3 1.7B. La estrategia consiste en tomar el cuerpo y el MLP de Gemma (26 capas, hidden size 1152, MLP 6912) y la atencion y la cabeza de Qwen (head_dim 128, hidden 2048, intermediate_size 6144, 16 cabezas de atencion, 8 KV heads, 28 capas). Ambas partes se proyectan y alinean al tamaño oculto de Gemma, y se aplica una "fusion por capa" con realineamiento posterior de embeddings. El modelo resultante usa el tokenizador y la plantilla de chat de Gemma-3.

El entrenamiento se realizo en dos fases: una primera de "warm-start" con aproximadamente 512 pasos sobre `HuggingFaceH4/ultrachat_200k`, seguida de una fase de SFT con `TIGER-Lab/MathInstruct` y `ultrachat_200k` durante unos 256 pasos. Ademas se incluyo un pequeño ajuste post-fusion de 8 pasos para fomentar el realineamiento de embeddings. El framework utilizado fue TRL 0.25.0 sobre Transformers 4.57.1. El modelo incorpora un escalado posicional basado en Yarn RoPE con una relacion 1:* desde `max_position_embeddings = 242144`, lo que amplia el contexto efectivo respecto a los modelos base.

El autor enmarca este trabajo dentro de la "Discrepancy Calculus" (DISC), un marco teorico propio que trata las singularidades del entrenamiento (plateaus de perdida, colapso de modos, olvido catastrofico) como señales estructurales de la geometria del problema de aprendizaje. No obstante, esta parte es mas conceptual que implementativa y no afecta directamente al funcionamiento del modelo.

## Capacidades

- Generacion de texto en ingles con formato conversacional (sigue la plantilla de chat de Gemma-3).
- Razonamiento paso a paso: el prompt de ejemplo incluye el token especial `<reasoning_step>` para inducir respuestas estructuradas.
- Seguimiento de instrucciones generales (entrenado con `ultrachat_200k`).
- Razonamiento matematico basico y resolución de problemas (entrenado con `MathInstruct`).
- Asistencia en tareas de codigo y ayuda tecnica, segun la model card.
- Analisis y explicaciones de conceptos (el ejemplo del prompt pregunta "What makes the sky blue?").
- No se menciona soporte explicito para tool calling, agentes, vision o audio. Es un modelo puramente textual.

## Casos de uso

- **Asistente de chat en aplicaciones web**: gracias a su tamaño compacto (~1B) y su plantilla de chat integrada, puede desplegarse como backend de un chatbot simple en una aplicacion de soporte o educativa. Su capacidad de razonamiento paso a paso permite respuestas mas estructuradas que un modelo generico del mismo tamaño.
- **Generacion de explicaciones didacticas**: el modelo puede producir explicaciones paso a paso de conceptos cientificos o matematicos, util para plataformas de e-learning o tutores virtuales. El entrenamiento con MathInstruct refuerza esta capacidad.
- **Prototipado rapido de agentes conversacionales**: al ser un modelo pequeño y licenciado bajo OSL-3.0, es adecuado para experimentar con pipelines de RAG o agentes simples en entornos de desarrollo sin grandes recursos de computo.
- **Analisis de texto en ingles**: puede resumir, parafrasear o extraer informacion de documentos cortos, aunque su contexto extendido (242K declarado) permite trabajar con documentos mas largos que otros modelos de su clase.
- **Fine-tuning posterior**: al ser un modelo abierto con pesos en safetensors, puede servir como base para SFT o RLHF en tareas especificas (por ejemplo, dominio legal o tecnico) sin necesidad de partir de un modelo mas grande.
- **Investigacion en fusion de modelos**: dado su caracter hibrido, es un caso de estudio interesante para equipos que investigan tecnicas de merging arquitectonico y transferencia de conocimiento entre familias de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros tests estandar. El autor no proporciona comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16, el modelo ocupa aproximadamente 2 GB (999M parametros × 2 bytes). Sumando activaciones y KV cache, se recomienda al menos 3-4 GB de VRAM para generacion con contexto moderado.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o mas es suficiente. Ejemplos: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB). Tambien puede ejecutarse en GPUs de datacenter como A10 o T4.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de gama media e incluso en algunas integradas con cuantizacion.
- **Opciones de despliegue**: compatible con Transformers (HuggingFace), y por su naturaleza de texto generativo puede servirse con vLLM, llama.cpp, Ollama o TGI. No se proporcionan configuraciones oficiales para estos frameworks, pero la arquitectura estandar permite su uso.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU moderna (RTX 4090), un modelo de 1B en bfloat16 puede generar decenas de tokens por segundo, pero es una estimacion orientativa sin confirmacion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qemma-Q1.7B | 999.891.712 | 242.144 (declarado) | OSL-3.0 | Hibrido Gemma-3 + Qwen3, SFT para razonamiento |
| Gemma-3 1B (base) | ~1B | 32.000 (original) | Gemma Terms of Use | Modelo base de Google, sin SFT especifico |
| Qwen3 1.7B (base) | 1.7B | 32.000 (original) | Apache 2.0 | Modelo base de Alibaba, conocido por su buen rendimiento en razonamiento |
| SmolLM2 1.7B | 1.7B | 8.000 | Apache 2.0 | Modelo compacto de HuggingFace, optimizado para dispositivos locales |

La comparativa se basa en las specs publicas de los modelos base. No hay datos de rendimiento comparativo de Qemma-Q1.7B frente a estos modelos. Su principal diferencia es el contexto extendido (242K) y la fusion hibrida, mientras que los modelos base tienen contextos mas cortos (32K en Gemma-3 y Qwen3 originales).

## Limitaciones y advertencias

- **Alucinacion**: la model card advierte explicitamente que el modelo puede alucinar. No es adecuado para decisiones criticas de seguridad, medicas, legales o financieras.
- **Idioma**: solo entrenado y probado en ingles. No se garantiza un rendimiento fiable en otros idiomas.
- **Licencia OSL-3.0**: aunque permite uso comercial, requiere mantener la atribucion y distribuir las modificaciones bajo la misma licencia. Conviene revisar los terminos exactos antes de integrarlo en un producto cerrado.
- **Contexto extendido no verificado**: la longitud de 242.144 tokens es la declarada por el autor mediante Yarn RoPE, pero no hay evaluaciones publicas que confirmen que el modelo mantenga coherencia en contextos tan largos. Es probable que la calidad se degrade en tramos muy extensos.
- **Fusion experimental**: al tratarse de una fusion a nivel de pesos entre arquitecturas distintas, puede haber comportamientos inesperados en ciertos inputs, especialmente en tareas que requieran un uso intensivo de la atencion (el numero de capas de atencion de Qwen es 28, mientras que el backbone de Gemma tiene 26, lo que sugiere una posible discrepancia estructural).
- **Sin benchmarks publicos**: no hay datos objetivos de rendimiento, por lo que su calidad real en tareas estandar es desconocida.
- **Mantenimiento**: el modelo fue creado en noviembre de 2025 y actualizado en agosto de 2026, pero no se observa una comunidad activa ni forks relevantes (0 likes, 2.685 descargas). Puede carecer de soporte a largo plazo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/reaperdoesntknow/Qemma-Q1.7B)
- [Perfil del autor (Convergent Intelligence LLC)](https://huggingface.co/reaperdoesntknow)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Modelo base google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Dataset HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
- [Dataset TIGER-Lab/MathInstruct](https://huggingface.co/datasets/TIGER-Lab/MathInstruct)
- [Documento Discrepancy Calculus: Foundations and Core Theory](https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus) (DOI: 10.57967/hf/8194)
- [Documento Structure Over Scale](https://huggingface.co/reaperdoesntknow/Structure-Over-Scale) (DOI: 10.57967/hf/8165)
- [Documento Three Teachers to Dual Cognition](https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy) (DOI: 10.57967/hf/8184)
