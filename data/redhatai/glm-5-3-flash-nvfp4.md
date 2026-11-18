# RedHatAI/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una versión cuantizada a NVFP4 (FP4 de NVIDIA) del modelo multimodal zai-org/GLM-5.3-Flash, desarrollada por RedHatAI. El modelo original pertenece a la familia GLM (Z-AI) y emplea una arquitectura `Glm5NextForConditionalGeneration` con mezcla de expertos (MoE), capaz de aceptar entradas de texto e imagen y generar texto. Esta variante mantiene las capas MTP (multi-token prediction) en FP8, igual que el checkpoint fuente, y cuantiza únicamente los pesos y activaciones de los operadores lineales de los expertos MoE a FP4.

El problema que resuelve es el coste de memoria y disco de un modelo de 169.120.127.838 parámetros (unos 169,1 mil millones). Al pasar los pesos cuantizados de 8 a 4 bits, se reduce aproximadamente un 50 % el tamaño en disco y los requisitos de VRAM de las capas cuantizadas, lo que permite servir el modelo con vLLM en 4 GPU mediante tensor parallelism. El repositorio ocupa 197,9 GB y está publicado bajo licencia MIT, lo que facilita su uso comercial.

Es relevante ahora porque combina tres elementos poco habituales en un mismo artefacto: cuantización FP4 lista para producción con vLLM, capacidades multimodales (image-text-to-text) y decodificación especulativa mediante MTP. La ficha se centra en esta variante cuantizada; los datos de arquitectura interna, composición del dataset de entrenamiento y proceso de alineación del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextForConditionalGeneration (MoE, transformer multimodal) |
| Parametros totales | 169.120.127.838 (169,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4) en pesos y activaciones de expertos MoE; MTP en FP8; etiqueta 8-bit en metadatos |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Entrada / salida | Texto e imagen / texto |
| Modo de cuantización | Solo operadores lineales de expertos MoE |
| Herramienta de cuantización | LLM Compressor (vllm-project) |
| Fecha de publicación | 2026-08-27 |
| Desarrollador de la cuantización | RedHatAI |
| Modelo base | zai-org/GLM-5.3-Flash |
| Tamano del repositorio | 197,9 GB |

## Arquitectura y entrenamiento

La arquitectura es `Glm5NextForConditionalGeneration`, un transformer con mezcla de expertos y capacidad multimodal de entrada (texto e imagen). La información disponible confirma que el modelo contiene capas MTP (multi-token prediction) y que la cuantización se aplica exclusivamente a los operadores lineales de los expertos MoE, dejando el resto de componentes (atención, capas MTP, embeddings) en su precisión original o en FP8. No se dispone de detalles sobre el número de capas, dimensión oculta, número de expertos, tamaño del contexto nativo ni proporción de parámetros activos por token.

Respecto al entrenamiento, no hay información en la documentación proporcionada sobre el número de tokens, la composición del corpus, el uso de RLHF/DPO ni las etapas de alineación del modelo base. La innovación técnica documentada de esta variante es la cuantización NVFP4 con LLM Compressor y el formato compressed-tensors, junto con el soporte de decodificación especulativa mediante MTP con 5 tokens especulativos, que acelera la generación al permitir proponer varios tokens por paso y validarlos en paralelo.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte de plantillas de chat.
- Entrada multimodal: procesamiento de imágenes junto con texto (pipeline image-text-to-text).
- Razonamiento matemático de varios pasos, evidenciado por los resultados en GSM8K Platinum, MATH-500 y AIME 2025.
- Razonamiento científico y de nivel experto, medido con GPQA Diamond.
- Tool calling / function calling: el despliegue en vLLM incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Modo de razonamiento explícito: el servidor se configura con `--reasoning-parser glm45`, lo que indica separación entre traza de razonamiento y respuesta final.
- Decodificación especulativa con MTP (`num_speculative_tokens: 5`) para reducir latencia.
- Compatible con endpoints OpenAI (`endpoints_compatible` en los metadatos).
- No se documentan capacidades de audio, vídeo ni generación de imágenes.

## Casos de uso

- Asistencia matemática y tutoría automatizada: el modelo obtiene 97,74 % en GSM8K Platinum y 94,87 % en MATH-500, por lo que puede resolver problemas de aritmética y álgebra paso a paso y explicar el procedimiento al usuario.
- Razonamiento científico en herramientas de investigación: con 90,57 % en GPQA Diamond, es adecuado para responder preguntas de nivel posgrado en física, química y biología dentro de un asistente de consulta documental.
- Agentes con tool calling en producción: la combinación de `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM permite conectarlo a APIs externas (búsqueda, calculadoras, bases de datos) y orquestar flujos multi-paso.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales para extraer y resumir información.
- Despliegue en infraestructura limitada a 4 GPU: la cuantización NVFP4 reduce a la mitad el peso de las capas MoE, de modo que el modelo se sirve con `--tensor-parallel-size 4` en lugar de requerir un clúster mayor.
- Servicio de chat bilingüe inglés-chino: útil para atención al cliente o soporte interno en organizaciones con operaciones en ambos mercados.
- Generación de código asistida dentro de pipelines: aunque no se publican resultados de HumanEval, el soporte de tool calling y de razonamiento permite integrarlo en asistentes de IDE que consultan documentación o ejecutan tests.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de FP4 frente al checkpoint original en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantización, promediados sobre 3 semillas (8 semillas en AIME 2025), servidos con vLLM mediante API compatible con OpenAI:

| Categoria | Benchmark | GLM-5.3-Flash-NVFP4 |
|---|---|---|
| Razonamiento | GSM8K Platinum (strict-match) | 97,74 % |
| Razonamiento | MATH-500 (pass@1) | 94,87 % |
| Razonamiento | AIME 2025 (pass@1) | 86,67 % |
| Razonamiento | GPQA Diamond (pass@1) | 90,57 % |

No se han publicado en la información disponible resultados del modelo base sin cuantizar, ni métricas de MMLU, HumanEval, throughput o latencia, por lo que no es posible cuantificar la degradación introducida por FP4 ni comparar directamente con alternativas.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 197,9 GB, de modo que en FP4 se necesita del orden de 200 GB de memoria de GPU para los pesos, más espacio para caché KV y activaciones. La configuración de referencia usa 4 GPU con tensor parallelism y `--gpu-memory-utilization 0.85`.
- GPU recomendadas: el despliegue oficial se basa en la imagen `vllm/vllm-openai:glm53-flash` con 4 GPU. NVFP4 requiere hardware con soporte nativo de FP4 (familia Blackwell, como B200); no se documenta compatibilidad con generaciones anteriores.
- GPU de consumo: no cabe en GPU de consumo. Con 169,1 mil millones de parámetros y ~200 GB de pesos, se necesitan varias GPU de centro de datos.
- Opciones de despliegue: vLLM es la vía soportada y documentada. No se mencionan llama.cpp, Ollama ni TGI; el formato compressed-tensors y NVFP4 limitan las alternativas.
- Flags relevantes de serving: `--tensor-parallel-size 4`, `--no-enable-flashinfer-autotune`, `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--reasoning-parser glm45`, `VLLM_ENGINE_READY_TIMEOUT_S=3600`.
- Para decodificación especulativa: añadir `--disable-custom-all-reduce`, `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` y `--speculative-config '{"method":"mtp","num_speculative_tokens":5}'`.
- Latencia y throughput: no disponibles. El uso de MTP con 5 tokens especulativos está orientado a mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-Flash-NVFP4 | 169,1 mil M | no disponible | NVFP4 (expertos MoE), MTP en FP8 | Si (imagen + texto) | MIT | Hugging Face, vLLM |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | Original (sin cuantizar) | Si (imagen + texto) | MIT | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Si | MIT (heredada) | no disponible |

No se dispone de información sobre modelos alternativos de tamaño y categoria comparables (por ejemplo, otras variantes FP4 de modelos MoE multimodales) en la documentación proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la precisión frente al modelo base; no se publican resultados del base sin cuantizar, así que el impacto real no es verificable con los datos disponibles.
- Solo se cuantizan los operadores lineales de los expertos MoE; el resto de capas mantiene otra precisión, lo que implica un perfil de memoria heterogéneo y menos predecible.
- NVFP4 exige hardware con soporte FP4; en GPU sin esa capacidad el modelo no es desplegable o requiere conversión adicional.
- Idiomas documentados únicamente inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios científicos y matemáticos donde el formato de respuesta puede parecer correcto sin serlo.
- No hay información sobre sesgos, filtros de seguridad ni evaluación de toxicidad del modelo base ni de esta variante.
- Los benchmarks publicados cubren solo razonamiento (matemáticas y ciencia); no hay datos de código, seguimiento de instrucciones, tareas multimodales ni robustez ante prompts adversarios.
- La licencia MIT permite uso comercial, pero se heredan las condiciones del modelo base; conviene verificar la licencia y los términos de zai-org/GLM-5.3-Flash antes de un despliegue en producción.
- El tamaño del repositorio (197,9 GB) y la necesidad de 4 GPU implican un coste de infraestructura elevado y tiempos de carga considerables (`VLLM_ENGINE_READY_TIMEOUT_S=3600` sugiere arranques lentos).
- No se documentan límites de contexto ni estrategias de truncado, lo que dificulta dimensionar la caché KV en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- README del repositorio: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4/blob/main/README.md
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (fork Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork Neural Magic): https://github.com/neuralmagic/lighteval
- Licencia MIT: https://choosealicense.com/licenses/mit/
