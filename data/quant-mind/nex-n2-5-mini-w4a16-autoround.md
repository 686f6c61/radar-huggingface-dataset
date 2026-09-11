# quant-mind/Nex-N2.5-mini-W4A16-AutoRound

## Resumen

Nex-N2.5-mini-W4A16-AutoRound es una versión cuantizada a 4 bits (W4A16) del modelo multimodal y orientado a agentes nex-agi/Nex-N2.5-mini, publicada por el usuario quant-mind. La cuantización se ha realizado con la biblioteca Intel AutoRound (algoritmo SignRound) y se distribuye en formato `auto_gptq`, compatible con los kernels GPTQ y Marlin que utilizan vLLM y SGLang. El objetivo es reducir el peso en memoria de un modelo de 35.000 millones de parámetros manteniendo las activaciones en BF16, de forma que pueda servirse en hardware más modesto sin renunciar al soporte multimodal y de tool calling.

El modelo base emplea la arquitectura `qwen3_5_moe` (`Qwen3_5MoeForConditionalGeneration`), una mezcla de expertos (MoE) con 256 expertos enrutados más un experto compartido por bloque, 35B de parámetros totales y aproximadamente 3B activos por token. Su ventana de contexto declarada es de 262.144 tokens y admite entrada de texto e imagen.

La relevancia de esta ficha radica en que se trata de una cuantización de "máxima precisión" que preserva en BF16 las capas críticas para el razonamiento y la estabilidad del servidor: el experto compartido y su puerta, el router de expertos (`mlp.gate`), el módulo de predicción multi-token (MTP), el `lm_head`, los embeddings y el codificador visual. No obstante, el repositorio no incluye benchmarks ni datos de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Qwen3_5MoeForConditionalGeneration), mezcla de expertos multimodal |
| Parámetros totales | 35B |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (262k) según la model card del autor |
| Tipos de cuantización | W4A16 (pesos INT4, activaciones BF16), group-size 128, simétrica (`sym=True`); formato `auto_gptq` compatible con kernels GPTQ y Marlin |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `auto_gptq` (compatible con GPTQ y Marlin); no se indica explícitamente el contenedor de ficheros |

Otros datos técnicos de la cuantización: 200 iteraciones de optimización por bloque, `enable_minmax_tuning=True`, `enable_norm_bias_tuning=True`, 128 muestras de calibración con ventana de 2048 tokens procedentes de `NeelNanda/pile-10k`.

## Arquitectura y entrenamiento

La información disponible corresponde únicamente al proceso de cuantización, no al entrenamiento del modelo base. La arquitectura es una mezcla de expertos del tipo `qwen3_5_moe` con 256 expertos enrutados y un experto compartido (`shared_expert`) por bloque, con enrutamiento gestionado por `mlp.gate`. El modelo es multimodal (texto e imagen, pipeline `image-text-to-text`) e incorpora un módulo de predicción multi-token (MTP). Cuenta con 35B de parámetros totales y unos 3B activos por token, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.

En cuanto a la cuantización, Intel AutoRound aplica el algoritmo SignRound con optimización del error cuadrático mínimo sobre bloques, manteniendo los pesos en INT4 simétrico con tamaño de grupo 128 y las activaciones en BF16. Las capas que se ejecutan en todos los tokens o que afectan a la estabilidad del enrutamiento y del servidor se conservan en BF16: `shared_expert`, `shared_expert_gate`, `mlp.gate`, `mtp`, `lm_head`, embeddings y el codificador visual. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con una ventana declarada de hasta 262.144 tokens.
- Comprensión de imágenes y texto (modelo vision-language), según la etiqueta `image-text-to-text` y la preservación del codificador visual en BF16.
- Orientación a tareas agénticas y razonamiento multi-paso, según las etiquetas `agentic` y `conversational` del repositorio.
- Soporte de tool calling / function calling: los ejemplos oficiales de despliegue utilizan `--tool-call-parser qwen3_coder`.
- Modo de razonamiento: los ejemplos de vLLM y SGLang incluyen `--reasoning-parser qwen3`.
- Generación de código: el uso del parser `qwen3_coder` sugiere soporte específico para código y llamadas a herramientas en ese dominio.
- Predicción multi-token (MTP) como componente arquitectónico preservado en BF16.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana declarada de 262k tokens, útil para hilos de soporte extensos con historial de tickets. Conviene limitar `max-model-len` en producción según la memoria disponible.
- Agentes autónomos con herramientas: al soportar tool calling mediante el parser `qwen3_coder`, puede integrarse en bucles de agente que consulten APIs, bases de datos o sistemas internos y encadenen varios pasos de razonamiento.
- Generación y revisión de código en pipelines de CI/CD: con el parser específico de código, puede emplearse para generar parches, revisar diffs o producir tests, invocado desde un servicio vLLM o SGLang.
- Análisis de documentos con imágenes: al ser multimodal, permite extraer información de capturas, diagramas o formularios escaneados combinados con texto, por ejemplo en flujos de digitalización de documentación técnica.
- Asistente de razonamiento sobre repositorios largos: con 262k tokens de contexto declarado puede procesar bloques grandes de código o documentación en una sola pasada, reduciendo la necesidad de fragmentación con RAG.
- Despliegue en infraestructura con VRAM limitada: la cuantización W4A16 reduce el peso de los pesos a aproximadamente 4 bits, lo que permite servir un MoE de 35B en GPUs de 24-48 GB con contextos moderados, algo inviable en BF16 en una sola tarjeta consumer.
- Automatización de soporte técnico interno con acceso a herramientas: combinación de razonamiento, multimodalidad y function calling para diagnosticar incidencias a partir de logs y capturas de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de degradación respecto al modelo base, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros (35B) y del esquema de cuantización W4A16, no datos publicados por el autor:

- Peso teórico de los pesos en INT4: 35B × 4 bits ≈ 17,5 GB. A ello hay que sumar las capas preservadas en BF16 (`shared_expert`, `shared_expert_gate`, `mlp.gate`, `mtp`, `lm_head`, embeddings y codificador visual), por lo que la huella real de pesos es superior; una estimación prudente se sitúa en el rango de 20 a 25 GB.
- VRAM para inferencia con contexto corto (por ejemplo, 4096 tokens, como en el ejemplo oficial de vLLM): orientativamente 22-28 GB, dependiendo del runtime y del tamaño de lote.
- Contexto largo: servir los 262.144 tokens declarados exige memoria de caché KV muy superior y no es viable en una única GPU consumer. No se dispone de cifras publicadas de memoria por token.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S para servicio en producción con contexto amplio; RTX 4090 / RTX 6000 Ada (24-48 GB) pueden ser suficientes con contexto reducido y lotes pequeños.
- ¿Cabe en GPU consumer? Probablemente sí en una RTX 4090 de 24 GB con `max_model_len` reducido y lote pequeño, aunque queda al límite por las capas en BF16. No hay confirmación oficial del autor.
- Opciones de despliegue: vLLM con `quantization="gptq_marlin"`, SGLang (`--tp 1`, con `--mamba-scheduler-strategy extra_buffer`) y Hugging Face Transformers con `Qwen3_5MoeForConditionalGeneration` y `trust_remote_code=True`.
- llama.cpp / Ollama: no se documenta soporte. El repositorio distribuye pesos en formato `auto_gptq`, sin ficheros GGUF publicados, por lo que su uso en estas herramientas requeriría una conversión no incluida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quant-mind/Nex-N2.5-mini-W4A16-AutoRound | 35B totales, ~3B activos | 262.144 tokens | W4A16 INT4 (auto_gptq) | Apache 2.0 | Público en Hugging Face; 0 descargas y 0 likes en el momento de la consulta |
| nex-agi/Nex-N2.5-mini (modelo base) | 35B totales, ~3B activos | 262.144 tokens | BF16 sin cuantizar | Apache 2.0 según el repositorio cuantizado; conviene verificar en el repositorio base | Público en Hugging Face |
| Otras cuantizaciones W4A16 de MoE multimodales comparables | no disponible | no disponible | no disponible | no disponible | La búsqueda web no devolvió alternativas verificables con el mismo modelo base |

No se dispone de datos de rendimiento comparado entre el modelo cuantizado y su versión BF16, ni con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluación publicada del impacto de la cuantización W4A16 sobre la calidad, el razonamiento o las capacidades multimodales del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La model card está redactada en portugués y no documenta el proceso de entrenamiento del modelo base, sus datos ni sus idiomas soportados.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se documentan medidas específicas de mitigación ni tasas de error.
- Riesgo de degradación por cuantización: aunque se preservan en BF16 las capas críticas, los expertos enrutados por token se cuantizan a INT4, lo que puede afectar a tareas sensibles a la precisión numérica.
- La ventana de contexto de 262.144 tokens es teórica: los ejemplos oficiales de despliegue limitan `max_model_len` a 4096, y servir el contexto completo requiere hardware muy superior al habitual.
- Licencia: Apache 2.0 según el repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base nex-agi/Nex-N2.5-mini, así como las licencias de los kernels y bibliotecas utilizadas (AutoRound, vLLM, SGLang, Marlin).
- Compatibilidad limitada: al distribuirse en formato `auto_gptq`, no es directamente utilizable en llama.cpp u Ollama sin una conversión a GGUF que no se proporciona.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código remoto del repositorio.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/quant-mind/Nex-N2.5-mini-W4A16-AutoRound
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Perfil del autor de la cuantización: https://huggingface.co/quant-mind
- Biblioteca Intel AutoRound: https://github.com/intel/auto-round
- Dataset de calibración: https://huggingface.co/datasets/NeelNanda/pile-10k
- La búsqueda web realizada no devolvió enlaces relevantes (papers, blogs o demos) sobre este modelo o su modelo base.
