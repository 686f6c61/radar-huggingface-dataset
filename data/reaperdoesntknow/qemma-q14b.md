# reaperdoesntknow/Qemma-Q14B

## Resumen

Qemma-Q14B es un modelo experimental de generación de texto publicado por el usuario reaperdoesntknow (Convergent Intelligence LLC: Research Division) que fusiona a nivel de pesos dos arquitecturas distintas: el cuerpo MLP de Gemma-3 (1B) y la atención de Qwen3-14B, proyectada y alineada a la dimensión oculta de Gemma. El resultado es un modelo híbrido que, pese a su nombre, contiene 1.009.478.016 parámetros reales según los safetensors del repositorio, no 14B.

La propuesta del autor se apoya en una formulación matemática propia denominada Discrepancy Calculus (DISC), con una "Gap Envelope Integral" que cuantifica el desajuste en las fronteras de fusión entre geometrías de pesos distintas. Sobre esa base se aplica un ajuste supervisado (SFT) breve con ultrachat_200k y MathInstruct para razonamiento paso a paso, más un escalado RoPE de tipo YaRN.

Es relevante ahora como caso de estudio de fusión cross-architecture y de técnicas de merge a nivel de capa, más que como modelo listo para producción. Su licencia OSL-3.0, su soporte exclusivo de inglés y su documentación atípica lo sitúan en el terreno de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen (head_dim 128, 40 cabezas de atención, 8 cabezas KV, intermediate_size 17408) reagrupada a 4x256 cabezas de Gemma |
| Parametros totales | 1.009.478.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_position_embeddings = 524288 con RoPE scaling YaRN (ratio 1:*) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors |
| Tokenizer | Gemma-3 tokenizer y chat template (chat_template.jinja) |
| Modelos base | google/gemma-3-1b-it, Qwen/Qwen3-14B |
| Tamano del repo | 24,3 GB |

## Arquitectura y entrenamiento

La arquitectura es una fusión a nivel de pesos sin adaptadores: se toma el cuerpo y MLP de Gemma-3 (26 capas, hidden 1152, MLP 6912) y se injerta la atención de Qwen3-14B, reagrupada a la disposición de cabezas de Gemma (4x256, head_dim 128). La atención de Qwen opera con 40 cabezas y 8 cabezas KV sobre un hidden de 5120 e intermediate_size de 17408, y se proyecta y alinea a la dimensión oculta de Gemma. El tokenizer y la plantilla de chat son los de Gemma-3. La variante Qemma-Q14B incorpora además un segundo merge entre Qemma-redux y Qwen3-14B, con lógica de fusión actualizada para permitir fusión por capa y alineación de embeddings posterior a la fusión.

El entrenamiento es un SFT ligero: aproximadamente 512 pasos de warm-start sobre HuggingFaceH4/ultrachat_200k, seguidos de unas 8 iteraciones de entrenamiento posterior a la fusión para favorecer la realineación de embeddings, y unos 256 pasos de SFT con TIGER-Lab/MathInstruct más ultrachat_200k. No se documentan fases de RLHF ni DPO. El stack empleado es TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0+cpu, Datasets 4.4.1 y Tokenizers 0.22.1. La innovación declarada es la formulación DISC/GEI para medir el salto en las fronteras de fusión, además del escalado YaRN sobre max_position_embeddings de 524288.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3 (`<|user|>`, `<|assistant|>`).
- Razonamiento paso a paso: el SFT sobre MathInstruct y ultrachat_200k busca instrucciones y razonamiento por etapas; la plantilla de ejemplo incluye marcadores `<think><reasoning_step>`.
- Resolución de problemas matemáticos elementales derivados de MathInstruct.
- Seguimiento de instrucciones en formato multi-turno (ultrachat_200k).
- Capacidad de base para ajuste posterior (SFT/RLHF), según el uso previsto declarado por el autor.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; solo se menciona razonamiento paso a paso.
- Multilingüismo: limitado a inglés.
- Capacidades especiales (visión, audio): no disponibles; el modelo es text-generation.

## Casos de uso

- Investigación en fusión de arquitecturas: reproducir el pipeline de merge Gemma-3 + Qwen3-14B a nivel de pesos y evaluar la metodología DISC/GEI sobre las fronteras de capa. Adecuado por ser un artefacto abierto en safetensors y con la receta de entrenamiento documentada.
- Experimentos de alineación de embeddings: usar los ~8 pasos de entrenamiento post-fusión como referencia para estudiar la realineación de embeddings tras un merge cross-architecture.
- Generación de texto conversacional en inglés para prototipos: con 1.000 millones de parámetros efectivos, encaja en entornos de pruebas donde no se requiere calidad de producción.
- Razonamiento matemático guiado: aprovechar el SFT sobre MathInstruct para generar cadenas de razonamiento en problemas de nivel educativo, siempre con verificación humana.
- Base para SFT/RLHF propio: el autor declara explícitamente este uso; el modelo sirve como punto de partida para ajustes posteriores con datasets propios en inglés.
- Estudio de escalado de contexto: validar el comportamiento del escalado RoPE YaRN configurado sobre max_position_embeddings de 524288 en tareas de contexto largo, midiendo degradación real.
- Docencia y divulgación: ilustrar en un curso o artículo cómo se compone un modelo híbrido a partir de dos checkpoints y qué compromisos introduce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.009.478.016 parámetros, en bfloat16 requiere aproximadamente 2 GB de pesos; en float32, unos 4 GB. El repo ocupa 24,3 GB, lo que sugiere artefactos adicionales u optimizador incluidos, pero la inferencia en bf16 se mantiene en el entorno de 2 GB más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente para bf16; una RTX 3060/4060, RTX 4090, A100 o H100 cubren el modelo con holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible). No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qemma-Q14B | 1.009.478.016 | 524288 (YaRN) | OSL-3.0 | safetensors | Fusión híbrida Gemma-3 + Qwen3-14B; solo inglés |
| google/gemma-3-1b-it | ~1B | 32768 (modelo base) | Gemma Terms | safetensors, GGUF | Modelo base del backbone; multilingüe, soporte de visión en la familia |
| Qwen/Qwen3-14B | ~14B | 32768 nativo (extensible) | Apache 2.0 | safetensors, GGUF | Modelo base de la atención; multilingüe y con modo thinking |
| Qwen3-1.7B | ~1,7B | 32768 | Apache 2.0 | safetensors, GGUF | Alternativa compacta de la misma familia para comparación de tamaño |

## Limitaciones y advertencias

- El nombre "Q14B" induce a error: el modelo tiene 1.009.478.016 parámetros reales, no 14B. Cualquier estimación de capacidad basada en el nombre será incorrecta.
- El autor advierte riesgo de alucinación y desaconseja explícitamente su uso en decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: únicamente inglés; no hay soporte multilingüe documentado.
- Licencia OSL-3.0: impone obligaciones de reciprocidad (copyleft) sobre obras derivadas; debe revisarse antes de cualquier uso comercial o distribución.
- Entrenamiento muy ligero (~512 pasos de warm-start, ~256 de SFT y 8 de realineación), insuficiente para esperar calidad de instrucción robusta.
- La fusión cross-architecture introduce discontinuidades en las fronteras de capa; el propio autor las describe como no suaves y las cuantifica con su formalismo DISC, lo que sugiere degradación frente a los modelos base.
- Contexto declarado de 524288 mediante YaRN: no se aportan evaluaciones de calidad en contextos largos; el rendimiento efectivo a esa longitud es desconocido.
- Sin benchmarks publicados ni cuantizaciones oficiales; el soporte de la comunidad es mínimo (3 likes, 2.469 descargas).
- Documentación atípica, con referencias a una monografía propia no revisada por pares; tratar las afirmaciones matemáticas con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-Q14B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base Gemma-3-1B-IT: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Repositorio TRL: https://github.com/huggingface/trl
- Colección DistilQwen del autor: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
