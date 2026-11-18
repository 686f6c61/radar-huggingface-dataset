# RedHatAI/GLM-5.3-MXFP4

## Resumen

GLM-5.3-MXFP4 es una versión cuantizada a MXFP4 del modelo zai-org/GLM-5.3, publicada por RedHatAI. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura GlmMoeDsaForCausalLM, diseñado para generación de texto conversacional. La cuantización reduce los pesos y activaciones de los operadores lineales de FP8 a FP4 (formato OCP Microscaling), lo que disminuye a la mitad el espacio en disco y los requisitos de memoria en GPU respecto al checkpoint original.

El modelo cuenta con 753.329.940.480 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos masivos que requieren despliegue multi-GPU. Está pensado para servir con vLLM, con soporte de decodificación especulativa mediante MTP (multi-token prediction) y parser de razonamiento integrado.

Su relevancia actual radica en que permite ejecutar un modelo de escala frontier con la mitad de memoria que su versión FP8, manteniendo una recuperación de precisión superior al 92% en la mayoría de benchmarks evaluados. La licencia es glm-5.3 (other), heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer MoE) |
| Parámetros totales | 753.329.940.480 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (pesos FP4 e2m1 con grupo 32 y escalas E8M0; activaciones FP4 con escalado dinámico por grupo) |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (other), heredada de zai-org/GLM-5.3 |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura es GlmMoeDsaForCausalLM, un transformer con mezcla de expertos (MoE) según la nomenclatura del modelo. No se dispone de información detallada sobre el número de expertos, la proporción de parámetros activos, la longitud de contexto nativa ni la composición exacta del dataset de entrenamiento en la información proporcionada.

La innovación técnica principal de esta versión es la cuantización post-entrenamiento sin datos de calibración (model-free PTQ) aplicada con LLM Compressor bajo el esquema MXFP4. Solo se cuantizan los pesos y activaciones de los operadores lineales dentro de los bloques del transformer; quedan excluidos el gate del MLP, el lm_head, los embeddings, eh_proj, el proyector de pesos del indexer de atención y la matriz wk del indexer. El modelo exporta en formato compressed-tensors y está preparado para inferencia con vLLM, incluyendo soporte de decodificación especulativa mediante MTP con 5 tokens especulativos.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático: resultados verificados en GSM8K Platinum, MATH-500 y AIME 2025.
- Razonamiento científico y de conocimiento experto: evaluado en GPQA Diamond.
- Seguimiento de instrucciones: evaluado en IFEval con métrica prompt-level strict.
- Modo de razonamiento explícito: el despliegue con vLLM incluye `--reasoning-parser glm45`, lo que indica soporte de trazas de razonamiento separadas.
- Decodificación especulativa: soporte de MTP (multi-token prediction) con hasta 5 tokens especulativos por paso.
- Compatibilidad con API OpenAI (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; la entrada y salida son únicamente texto.
- Soporte de agentes multi-paso: no documentado explícitamente en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 96,36% en GSM8K Platinum y 94,00% en MATH-500, lo que lo hace adecuado para tutores automáticos o verificación de soluciones paso a paso en plataformas educativas.
- Resolución de problemas científicos: con 89,06% en GPQA Diamond, puede emplearse en asistentes de investigación para preguntas de nivel experto en física, química y biología.
- Generación de respuestas con formato estricto: el 91,19% en IFEval indica que respeta restricciones de formato y longitud, útil para pipelines que exigen salidas estructuradas verificables.
- Servicio conversacional bilingüe en inglés y chino: adecuado para atención al cliente o asistentes internos en organizaciones con operaciones en ambos idiomas.
- Despliegue de alto rendimiento con vLLM: la cuantización MXFP4 reduce a la mitad la memoria frente a FP8, permitiendo servir el modelo en 4 GPU B200 con tensor parallelism 4 y KV cache en FP8.
- Inferencia con baja latencia mediante decodificación especulativa: la configuración MTP con 5 tokens especulativos acelera la generación en cargas interactivas donde el tiempo por token es crítico.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de FP4 frente a FP8 en modelos MoE de gran escala, con recuperaciones documentadas entre 92,80% y 99,26%.

## Benchmarks y rendimiento

Resultados promediados sobre 3 semillas (1234, 2345, 3456), servidos con vLLM y comparados contra el checkpoint FP8 del modelo base sobre 4 B200.

| Categoría | Benchmark | GLM-5.3 (FP8) | GLM-5.3-MXFP4 | Recuperación |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 91,87% | 91,19% | 99,26% |
| Razonamiento | GSM8K Platinum (strict-match) | 97,60% | 96,36% | 98,73% |
| Razonamiento | MATH-500 (pass@1) | 95,67% | 94,00% | 98,26% |
| Razonamiento | AIME 2025 (pass@1) | 98,33% | 91,25% | 92,80% |
| Razonamiento | GPQA Diamond (pass@1) | 92,42% | 89,06% | 96,36% |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 465,0 GB en disco. Con cuantización MXFP4 (4 bits por parámetro) los pesos requieren aproximadamente 377 GB, a los que hay que sumar la KV cache en FP8 y los buffers de activación.
- GPU recomendadas: el autor valida el modelo sobre 4 GPU NVIDIA B200 con `--tensor-parallel-size 4`. No se documenta compatibilidad con otras configuraciones.
- GPU de consumo: no cabe en ninguna GPU consumer actual; el tamaño de pesos excede la VRAM de cualquier tarjeta individual del mercado.
- Opciones de despliegue: vLLM es el runtime documentado y validado. El formato compressed-tensors no es directamente compatible con llama.cpp u Ollama sin conversión adicional, que no está documentada.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa MTP con 5 tokens está soportada para reducir la latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Cuantización | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-MXFP4 | 753,3 B | MXFP4 (4 bits) | no disponible | glm-5.3 (other) | vLLM, 4× B200 |
| zai-org/GLM-5.3 (FP8) | no disponible | FP8 (8 bits) | no disponible | glm-5.3 (other) | vLLM |
| zai-org/GLM-5.3 (original) | no disponible | BF16/FP16 (no confirmado) | no disponible | glm-5.3 (other) | no disponible |

La comparación relevante es frente al checkpoint FP8 del mismo modelo base: MXFP4 reduce el tamaño a la mitad con una recuperación media de precisión en torno al 97%, aunque la mayor pérdida se concentra en AIME 2025 (92,80%). No se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión no uniforme: la recuperación frente a FP8 cae al 92,80% en AIME 2025, el benchmark más sensible a la cuantización; en tareas de razonamiento matemático de alta dificultad la degradación es medible.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está evaluado ni garantizado.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que impide planificar cargas con documentos largos sin validación previa.
- Licencia restrictiva: la licencia glm-5.3 es de tipo "other"; es necesario revisar el texto completo en el repositorio del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación; como todo modelo generativo de gran escala, puede producir afirmaciones incorrectas con alta confianza.
- Dependencia de hardware específico: la validación se realizó exclusivamente sobre 4 B200 con vLLM; no hay garantías de funcionamiento correcto en otras GPU o runtimes.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, políticos o culturales.
- Requisito de infraestructura elevado: con aproximadamente 377 GB de pesos en FP4, el despliegue exige clústeres multi-GPU, lo que limita su uso a organizaciones con infraestructura dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-MXFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- README del modelo: https://huggingface.co/RedHatAI/GLM-5.3-MXFP4/blob/main/README.md
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- lm-evaluation-harness (fork Neural Magic): https://github.com/neuralmagic/lm-evaluation-harness
- lighteval (fork Neural Magic): https://github.com/neuralmagic/lighteval
