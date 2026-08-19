# SinclairSchneider/Apertus-v1.5-8B-W4A16-KV8-de

## Resumen

Apertus-v1.5-8B-W4A16-KV8-de es una cuantización INT4 (esquema W4A16, GPTQ) del modelo Apertus-v1.5-8B de Swiss AI, publicada por el usuario SinclairSchneider. El modelo base es una familia de modelos abiertos de 8B y 70B parámetros, desarrollada por Swiss AI, que destaca por ser completamente abierta (datos, pesos y reproducción), multilingüe (más de 1000 idiomas) y multimodal (imagen y audio). Esta cuantización concreta se calibra exclusivamente con texto en alemán, una decisión técnica que busca preservar la calidad en la morfología alemana (composiciones, inflexiones, declinaciones) que las cuantizaciones genéricas calibradas en inglés suelen degradar. Además, incluye escalas de KV-cache fp8 estáticas incrustadas en el checkpoint, lo que evita el cálculo dinámico de escalas en el arranque de vLLM.

El checkpoint reduce el peso de ~18 GiB en BF16 a ~7.5 GiB, con un total de 8.903.587.619 parámetros y una longitud de contexto de 32 768 tokens. Es una opción interesante para equipos que necesiten desplegar un modelo de 8B con calidad razonable en alemán en GPUs de consumo, aunque requiere el uso de forks específicos de transformers y vLLM (no funciona con versiones estándar). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Apertus1p5ForConditionalGeneration (transformer multimodal con tokenizers de visión y audio) |
| Parámetros totales | 8.903.587.619 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantización | W4A16 (INT4 simétrico, grupo de 128), KV cache fp8 E4M3 estático |
| Idiomas soportados | Alemán (de), inglés (en) — la cuantización se calibra en alemán; el modelo base soporta >1000 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors / pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Apertus-v1.5-8B es una arquitectura transformer multimodal que extiende Apertus 1.0 mediante un *continued pretraining* con 4 trillones de tokens adicionales de texto y datos multimodales. Incorpora un tokenizador de visión y un WavTokenizer para audio, además de un modo de razonamiento opcional (*thinking mode*). La cuantización W4A16 de SinclairSchneider mantiene estos tokenizadores en fp32 (no se cuantizan) porque son sensibles a la precisión y el WavTokenizer usa convoluciones con weight-norm que GPTQ no maneja bien.

La cuantización se realizó con GPTQ (INT4 simétrico, group size 128) sobre 192 lineales (32 capas × 6), calibrada exclusivamente con corpus alemán. La KV cache se guarda en fp8 E4M3 con escalas estáticas por tensor, calculadas a partir de activaciones reales y almacenadas en `config.json`, lo que evita el cálculo de escalas en tiempo de arranque que vLLM hace con tokens dummy y que, según el autor, produce resultados inutilizables. El checkpoint no carga con transformers upstream: requiere el fork de Swiss AI o el PR 50496 de vLLM.

## Capacidades

- Generación de texto en alemán e inglés, con especial énfasis en la calidad del alemán gracias a la calibración específica.
- Modelo multimodal en su versión base (comprensión de imagen y audio), aunque en esta cuantización se recomienda desactivar los tokenizadores de visión y audio (`--limit-mm-per-prompt '{"image":0,"audio":0}'`) para evitar problemas de compatibilidad.
- Soporte de *tool calling* y selección automática de herramientas (vLLM con `--enable-auto-tool-choice --tool-call-parser apertus`).
- Modo de razonamiento opcional (thinking mode) que mejora el rendimiento en tareas complejas de lógica y matemáticas.
- Instrucción mejorada y seguimiento de comandos multi-turno.
- Multilingüe (más de 1000 idiomas en el modelo base), aunque esta cuantización se limita a de/en por la calibración.

## Casos de uso

- Atención al cliente automatizada en alemán: el modelo puede gestionar conversaciones multi-turno con contexto de 32K tokens, manteniendo la calidad lingüística en alemán gracias a la calibración específica. Adecuado para chatbots de soporte en empresas germanoparlantes.
- Generación de código en entornos de producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar documentación, tests o snippets de código en alemán o inglés.
- Análisis de documentos legales o técnicos en alemán: la ventana de 32K tokens permite procesar contratos o informes extensos, con razonamiento para resumir o extraer datos.
- Asistente de traducción de alemán a inglés y viceversa: su calibración en alemán reduce errores morfológicos típicos de modelos cuantizados.
- Chatbot con modo de razonamiento para soporte técnico: puede explicar paso a paso la resolución de problemas complejos en alemán, con mejor seguimiento de instrucciones.
- Despliegue en GPUs de consumo (8-16 GB VRAM): con la cuantización INT4, el modelo cabe en una GPU de portátil de 8 GB, lo que permite pruebas locales y desarrollo en entornos sin servidores de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. La colección de Swiss AI y el blog de evaluación de DS-NLP Lab mencionan mejoras del modelo base en visión, thinking mode y tool use, pero no hay cifras específicas de la versión W4A16. No se inventan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con INT4 y KV cache fp8, el modelo ocupa ~7.5 GiB de pesos, más la KV cache. Con `--gpu-memory-utilization 0.45` en una RTX 6000 Ada se alcanzan 232 368 tokens de KV cache en fp8; en una GPU de 8 GB debería caber con contexto moderado (el blog de ejemplo menciona una laptop GPU de 8 GB).
- GPUs recomendadas: RTX 4070/4080/4090 (Ada, compute 8.9), RTX 6000 Ada, A100/H100 (compute 9.0). Se requiere compilar los kernels con `TORCH_CUDA_ARCH_LIST` adecuado.
- Compatibilidad con consumer GPU: sí, con 8 GB o más de VRAM, pero hay que usar el fork de vLLM y el de transformers; no funciona con las versiones estándar.
- Opciones de despliegue: vLLM (fork de Swiss AI o PR 50496), o el contenedor preconstruido `onpremai/vllm-apertus-1p5:latest` que evita la compilación.
- Latencia y throughput: no hay datos públicos. En una RTX 6000 Ada con 0.45 de memoria, la KV cache en fp8 duplica el número de tokens de contexto (232 368 vs 116 704 en bf16), lo que sugiere un throughput adecuado para uso en producción, pero sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Apertus-v1.5-8B (BF16) | 8.9B | 32K | Apache 2.0 | Modelo base multimodal, requiere ~18 GB en BF16, no cuantizado |
| Apertus-v1.5-8B-NVFP4 (oficial) | 8.9B | 32K | Apache 2.0 | Cuantización oficial de Swiss AI con NVFP4 en MLP y FP8 en attention, pesos BF16 en embeddings y lm_head |
| Apertus-v1.5-8B-W4A16-KV8-de (esta) | 8.9B | 32K | Apache 2.0 | Cuantización INT4 de terceros, calibrada en alemán, KV cache fp8 estática |

No se dispone de datos de rendimiento comparativo entre estas variantes. La elección entre la cuantización NVFP4 oficial y esta W4A16 depende de la calidad en alemán (la W4A16 está calibrada para ese idioma) y de la compatibilidad con el ecosistema (la oficial requiere también un vLLM parcheado, la W4A16 requiere el fork de Swiss AI).

## Limitaciones y advertencias

- La cuantización INT4 puede degradar la calidad en tareas de alta precisión (razonamiento complejo, matemáticas) en comparación con el modelo BF16 original, aunque la calibración en alemán mitiga los problemas morfológicos.
- No funciona con transformers upstream: es obligatorio instalar el fork de Swiss AI, que es más antiguo que el actual y puede romper otros modelos en el mismo entorno (se recomienda un venv aislado).
- La cuantización no incluye los tokenizadores de visión y audio; si se necesita usar imagen o audio, hay que usar el modelo base BF16 o la versión NVFP4 oficial.
- La longitud de contexto de 32K tokens es menor que la de otros modelos recientes (como Llama 3.1 8B con 128K), aunque es suficiente para la mayoría de los casos de uso en alemán.
- El modelo está calibrado para alemán e inglés; no se garantiza la calidad en otros idiomas a pesar de que el modelo base los soporte.
- Riesgo de alucinaciones y sesgos inherentes a los modelos de lenguaje, no mitigados específicamente en esta cuantización.
- Requiere compilar kernels CUDA o usar el contenedor preconstruido; el fallo de `torch.compile` con xIELU puede requerir `--enforce-eager`.

## Enlaces

- [Checkpoint en Hugging Face](https://huggingface.co/SinclairSchneider/Apertus-v1.5-8B-W4A16-KV8-de)
- [Modelo base: swiss-ai/Apertus-v1.5-8B](https://huggingface.co/swiss-ai/Apertus-v1.5-8B)
- [Colección de Apertus v1.5 en Hugging Face](https://huggingface.co/collections/swiss-ai/apertus-v15)
- [Blog de Swiss AI sobre Apertus 1.5](https://apertus-ai.org/articles/2026-07-apertus-1-5/)
- [Evaluación de Apertus 1.5-8B en DS-NLP Lab](https://blog.nlp-lab.ai/2026/07/29/Apertus15Bench.html)
- [Artículo sobre reducción de Apertus 1.5 8B para GPU de 8 GB](https://digitalpathlines.ch/2026/08/12/shrinking-apertus-1-5-8b-for-an-8-gb-laptop-gpu/)
