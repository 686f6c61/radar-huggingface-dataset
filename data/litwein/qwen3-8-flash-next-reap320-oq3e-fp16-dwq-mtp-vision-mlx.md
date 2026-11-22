# Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX

## Resumen

Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX es una compilación comunitaria del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicada por el usuario Litwein. Se trata de un derivado podado y cuantizado en formato MLX, pensado específicamente para ejecutarse en Apple Silicon, incluyendo los chips M1 y M2 que carecen de soporte nativo de BF16. El autor aplica una poda de expertos REAP que reduce de 512 a 320 expertos enrutados por capa MoE, una cuantización mixta oQ3e con expertos a 3 bits, y un proceso de destilación DWQ en tres rondas contra los logits del modelo bf16 original.

El modelo conserva la torre de visión en precisión completa y una cabeza MTP nativa para decodificación especulativa, manteniendo la naturaleza multimodal imagen-texto del modelo base. El pack ocupa aproximadamente 71,7 GB en el repositorio y requiere unos 37 GiB de pesos residentes, por lo que el autor recomienda un Mac con 64 GB o más. La variante fp16 se distingue de su hermana bf16 únicamente en el tipo de almacenamiento de los tensores no cuantizados: los tensores cuantizados se copian byte a byte, mientras que escalas, sesgos, normas y la torre de visión se promueven a FP16 o FP32 según corresponda.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de derivados comunitarios sobre modelos MoE grandes, con técnicas de compresión agresivas (poda de expertos más cuantización mixta) orientadas a hardware de consumo. Es un caso de estudio útil para quienes despliegan modelos multimodales en portátiles Apple, aunque conviene subrayar que la capacidad real procede del modelo base de Qwen y que la poda de 192 expertos por capa es intrínsecamente con pérdida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención Gated-DeltaNet, torre de visión y cabeza MTP; formato MLX |
| Parámetros totales | 133.733.695.379 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ3e: expertos enrutados a 3 bits, tronco sensible a 5/6/8 bits, lm_head a 8 bits, tabla n-gram a 4 bits g32; tensores no cuantizados en FP16; torre de visión en FP32 |
| Idiomas soportados | en, ru |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 512 expertos enrutados por capa, al que se le aplica una poda REAP que retiene 320 expertos por capa, eliminando 192. Sobre ese inicializador podado se aplica una cuantización mixta denominada oQ3e, con inicialización M4Q, que asigna 3 bits a los expertos enrutados y precisiones mayores (5, 6 y 8 bits) a los tensores sensibles del tronco, además de un lm_head a 8 bits. La tabla n-gram se cuantiza a 4 bits con grupo g32. La torre de visión se mantiene en FP32 y la cabeza MTP de decodificación especulativa se conserva alineada con la poda REAP.

El entrenamiento posterior consiste en tres rondas de destilación KL-DWQ (v7 a v9) contra los logits del modelo bf16 de referencia, de extremo a extremo. Según la model card, estas rondas reducen la brecha respecto al profesor en un 14,9% (CE) y un 11,2% (KL20) sobre el inicializador podado, y recuperan el 33,6% de la brecha introducida por la poda. DWQ ajusta escalas y sesgos de cuantización, pero no añade conocimiento nuevo. En esta variante fp16, el 82,5% del pack (los códigos de pesos empaquetados) se copia byte a byte desde el repositorio bf16; solo cambian los tensores nunca cuantizados, y el autor documenta que el 99,99973% de los 5.787.423.569 valores convertidos a FP16 lo hacen de forma exacta, sin desbordamientos a infinito y con 148 valores que se desnormalizan a cero, ninguno de ellos escala o sesgo de cuantizador.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y ruso.
- Procesamiento de imagen y texto (pipeline image-text-to-text): respuesta a preguntas sobre imágenes, gráficos y documentos.
- Razonamiento matemático, apoyado en los datasets de entrenamiento del modelo base (OpenR1-Math-220k, entre otros).
- Generación y razonamiento sobre código, con datos de entrenamiento que incluyen SWE-smith-trajectories, OpenCodeReasoning y problemas verificables de Python.
- Decodificación especulativa mediante cabeza MTP nativa, que acelera la generación al proponer tokens candidatos.
- Capacidades multimodales de comprensión de gráficos (ChartQA) y documentos (DocumentVQA).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores con Mac: el modelo puede integrarse en un flujo de trabajo de edición y revisión de código sobre Apple Silicon, aprovechando su entrenamiento en trayectorias de SWE-bench y problemas de código verificables, sin enviar el código a servicios externos.
- Análisis de documentos y gráficos en el escritorio: gracias a la torre de visión en FP32 y a su entrenamiento en ChartQA y DocumentVQA, puede extraer información de capturas, informes y tablas escaneadas en un portátil Apple.
- Atención al cliente bilingüe inglés-ruso: el modelo soporta ambos idiomas y puede gestionar conversaciones multi-turno, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Prototipado de aplicaciones multimodales en M1/M2: al ser un pack MLX con kernels FP16 nativos para esos chips, permite experimentar con un modelo de 133.700 millones de parámetros en hardware de consumo con 64 GB o más, sin infraestructura de GPU dedicada.
- Investigación sobre compresión de modelos: el repositorio documenta de forma detallada la poda REAP, la cuantización mixta oQ3e y la destilación DWQ, lo que lo convierte en material de referencia para estudiar el impacto de estas técnicas en un MoE grande.
- Generación asistida de código en pipelines de CI/CD: no disponible de forma confirmada, ya que la información proporcionada no detalla soporte de tool calling ni integración con herramientas externas.
- Razonamiento matemático offline: útil para entornos educativos o de investigación que requieran resolver problemas sin conexión, apoyándose en los datos de OpenR1-Math-220k del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de la destilación DWQ: reducción de la brecha respecto al profesor del 14,9% (CE) y 11,2% (KL20), y recuperación del 33,6% de la brecha de poda. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput medidas en M1/M2; el propio autor indica que no dispone de máquinas M1 o M2 para medir la aceleración prometida.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 37 GiB de pesos residentes; el autor recomienda un Mac con 64 GB o más.
- GPU recomendadas: Apple Silicon M1 y M2 (esta variante fp16 es la nativa para esos chips); para M3, M4 y posteriores, el autor remite a la variante bf16, que además ocupa 0,9 GB menos.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 64 GB o más; no está pensado para GPUs NVIDIA consumer.
- Opciones de despliegue: runtime oMLX (formato MLX); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma que oMLX documenta aproximadamente un 20% más de velocidad de prefill en M1/M2 con destino FP16, pero no ha medido el rendimiento de este pack en esos chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX) | 133.733.695.379 | no disponible | oQ3e mixta, FP16 en no cuantizados | qwen-community-1.0 | Hugging Face, 584 descargas, 7 likes |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | bf16 original | qwen-community-1.0 | Hugging Face, oficial de Qwen |
| Qwen3.8-Flash-Next-REAP320-oQ3e-DWQ-MTP-Vision-MLX (variante bf16) | mismos pesos | no disponible | oQ3e mixta, BF16 en no cuantizados | qwen-community-1.0 | Hugging Face, hermana de este repo |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | oQ4e | no disponible | Hugging Face, checkpoint donante |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La poda de 192 expertos por capa es con pérdida; el autor lo advierte explícitamente y la destilación DWQ solo recupera el 33,6% de la brecha introducida.
- La capacidad del modelo procede del base Qwen3.8-Flash-Next; este repositorio no añade conocimiento nuevo, solo compresión y empaquetado.
- Solo se declaran los idiomas inglés y ruso; el rendimiento en castellano no está documentado.
- La longitud de contexto no está especificada, lo que impide garantizar conversaciones de contexto largo.
- No hay mediciones de velocidad ni de latencia en los chips objetivo (M1/M2), por lo que la ventaja del 20% en prefill es una afirmación del runtime oMLX, no una medición de este pack.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la cuantización a 3 bits de los expertos y la poda.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA ni a otros runtimes sin conversión.
- La información sobre tool calling, agentes y razonamiento multi-paso no está confirmada para este derivado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX
- Variante bf16 hermana: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-DWQ-MTP-Vision-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint donante oQ4e: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Manifiesto de conversión FP16: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX/blob/main/fp16-conversion-manifest.json
- Licencia: https://huggingface.co/Litwein/Qwen3.8-Flash-Next-REAP320-oQ3e-fp16-DWQ-MTP-Vision-MLX/blob/main/LICENSE
