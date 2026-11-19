# reaperdoesntknow/Qemma-redux

## Resumen

Qemma-redux es un modelo de lenguaje de tipo híbrido desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) que fusiona a nivel de pesos dos arquitecturas distintas: el cuerpo y la MLP de Gemma-3 (1B) y el mecanismo de atención de Qwen-3 (0.6B). No se trata de un ajuste con adaptadores, sino de una fusión estructural en la que la atención de Qwen se proyecta y alinea con el tamaño oculto de Gemma. El resultado es un transformer denso de aproximadamente 1B de parámetros con tokenizador y plantilla de chat de Gemma-3.

La variante Redux añade un remezclado adicional entre Qemma-sft y Qwen3-0.6B, junto con RoPE scaling de tipo YaRN en proporción 1:1 respecto a `max_position_embeddings`. El modelo se ha sometido a un proceso de SFT (supervised fine-tuning) orientado a razonamiento paso a paso, con datos de Alpaca, OpenO1-SFT y un conjunto de razonamiento STEM.

Es relevante como experimento de investigación sobre fusión de arquitecturas heterogéneas y sobre el marco teórico "Discrepancy Calculus" del autor, no como un modelo de producción. Su licencia OSL-3.0 y su naturaleza experimental lo sitúan en el ámbito de la investigación y el prototipado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: cuerpo y MLP de Gemma-3 + atención de Qwen-3 proyectada |
| Parámetros totales | no disponible (cuerpo Gemma-3 1B + atención Qwen-3 0.6B; el autor no publica el total exacto) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (usa YaRN RoPE scaling 1:1 sobre `max_position_embeddings`; el valor base no se especifica) |
| Tipos de cuantización | no disponible (repo en bfloat16; sin GGUF publicado en la información disponible) |
| Idiomas soportados | inglés (`en`) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors (transformers, `AutoModelForCausalLM`), repo de 12.0 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone Gemma-3 de 26 capas, dimensión oculta 1152 y MLP de 6912, con una atención de estilo Qwen reagrupada en 4 cabezas de 256 dimensiones al estilo de Gemma. La atención de Qwen-3 se proyecta y alinea al tamaño oculto de Gemma, de modo que el modelo resultante conserva el tokenizador y la plantilla de chat de Gemma-3. La variante Redux incorpora además RoPE scaling basado en YaRN con proporción 1:1 respecto a `max_position_embeddings`, lo que en teoría permite extrapolar contexto más allá del entrenado originalmente.

El entrenamiento se realizó con TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0 y Datasets 4.4.1, en varias fases: aproximadamente 512 pasos de warm-start con datos estilo Alpaca, 256 pasos adicionales de preentrenamiento sobre O1-OPEN/OpenO1-SFT, 128 pasos de SFT con Jackrong/gpt-oss-120b-reasoning-STEM-5K y 256 pasos de SFT con OpenO1-SFT. No se documenta uso de RLHF ni DPO. El autor enmarca el trabajo en su marco "Discrepancy Calculus (DISC)", una propuesta teórica sobre la geometría del error de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Razonamiento paso a paso (stepwise reasoning) como objetivo principal del SFT.
- Razonamiento matemático y STEM, reforzado con el conjunto gpt-oss-120b-reasoning-STEM-5K.
- Seguimiento de instrucciones (instruction following) tras el warm-start con datos Alpaca.
- Generación de código y asistencia técnica básica, según los usos previstos declarados por el autor.
- Capacidad de servir como base para SFT o RLHF posteriores.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Multilingüismo limitado al inglés según la metadata del modelo.

## Casos de uso

- Investigación sobre fusión de arquitecturas: el modelo sirve como banco de pruebas para estudiar cómo se comportan pesos de atención y MLP de procedencias distintas al combinarse a nivel de tensor, útil para grupos que investigan merging y arquitecturas híbridas.
- Prototipado de razonamiento paso a paso: al estar ajustado con datos de razonamiento STEM, puede emplearse para generar cadenas de razonamiento en tareas matemáticas sencillas dentro de entornos de experimentación controlados.
- Generación de código asistida en local: con ~1B de parámetros en bfloat16 (unos 2 GB de pesos) cabe en GPUs de consumo y permite probar pipelines de autocompletado o explicación de código sin infraestructura dedicada.
- Base para ajuste fino posterior: su naturaleza de checkpoint SFT lo hace adecuado como punto de partida para experimentos de RLHF o DPO en dominios concretos, siempre que se respete la licencia OSL-3.0.
- Docencia y divulgación: permite ilustrar en un modelo pequeño y abierto conceptos como fusión de pesos, RoPE scaling o SFT multi-fase sin requerir clústeres de GPU.
- Evaluación comparativa de tokenizadores: al conservar el tokenizador de Gemma-3 con atención de Qwen, es útil para estudiar el impacto del tokenizador en la calidad de generación de un modelo híbrido.
- Experimentos de longitud de contexto: la configuración YaRN permite probar la extrapolación de contexto y medir su degradación en un modelo de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 2-2,5 GB para los pesos (repo de 12.0 GB, que incluye múltiples checkpoints y artefactos de entrenamiento); con overhead de activaciones y caché KV, un despliegue cómodo requiere 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100 o H100 no son necesarias por tamaño, pero aceleran el ajuste fino.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (soporte nativo según la model card); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y con Inference Endpoints. No se documenta soporte de llama.cpp, Ollama ni GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-redux | ~1B (híbrido Gemma-3 + Qwen-3) | no disponible (YaRN 1:1) | OSL-3.0 | Hugging Face, transformers | Fusión experimental, solo inglés |
| Gemma-3 1B | 1B | no disponible en la información | Gemma Terms | Hugging Face, amplio ecosistema | Modelo base del cuerpo; soporte multilingüe amplio |
| Qwen3-0.6B | 0.6B | no disponible en la información | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelo base de la atención; multilingüe |
| Qwen3-1.7B | 1.7B | no disponible en la información | Apache 2.0 | Hugging Face, GGUF, vLLM | Alternativa de tamaño similar con ecosistema maduro |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. Frente a Gemma-3 1B y Qwen3-0.6B, Qemma-redux no ofrece ventajas documentadas de rendimiento; su interés es exclusivamente arquitectónico y experimental.

## Limitaciones y advertencias

- Riesgo de alucinación explícitamente reconocido por el autor; no apto para decisiones críticas de seguridad, médicas, legales o financieras.
- Modelo solo en inglés; no se garantiza calidad en otros idiomas.
- Licencia OSL-3.0: permite uso comercial pero impone obligaciones de compartir mejoras bajo la misma licencia; conviene revisar los términos antes de integrarlo en productos.
- Naturaleza experimental: es una fusión de pesos de dos arquitecturas distintas, sin evaluación pública de robustez ni de calidad frente a los modelos base.
- Longitud de contexto no documentada; el YaRN 1:1 no garantiza buen rendimiento más allá del contexto de entrenamiento.
- Sin soporte documentado de tool calling ni de agentes; no debe asumirse en pipelines que lo requieran.
- El marco teórico "Discrepancy Calculus" del autor no cuenta con validación independiente en la información disponible; tratar las afirmaciones de la model card con cautela.
- El repositorio incluye artefactos de entrenamiento (12 GB) además de los pesos, lo que puede complicar el despliegue directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Modelo base: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Repositorio TRL: https://github.com/huggingface/trl
- Dataset O1-OPEN/OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset Jackrong/gpt-oss-120b-reasoning-STEM-5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
