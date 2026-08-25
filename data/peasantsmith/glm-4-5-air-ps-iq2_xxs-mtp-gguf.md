# peasantsmith/GLM-4.5-Air-PS-IQ2_XXS-MTP-GGUF

## Resumen

El modelo **GLM-4.5-Air-PS-IQ2_XXS-MTP-GGUF** es una cuantización GGUF compacta del modelo base **zai-org/GLM-4.5-Air**, realizada por el usuario PeasantSmith. El modelo original, desarrollado por Zhipu AI, es un modelo de lenguaje de arquitectura MoE (mixture of experts) con 106.000 millones de parámetros totales y 12.000 millones de parámetros activos, diseñado específicamente para tareas de agentes inteligentes. Esta cuantización destaca por ser la única versión pública que conserva la cabeza MTP (multi-token prediction) integrada, lo que permite decodificación especulativa en llama.cpp.

El modelo se publica en formato GGUF con una mezcla de cuantizaciones (IQ2_XXS, Q4_0, Q4_K, Q8_0, Q6_K) que reduce el peso total a 45,49 GB (42,4 GiB), manteniendo un equilibrio entre tamaño y calidad. Su relevancia actual radica en que permite ejecutar un modelo de 106B con contexto de 131.072 tokens en hardware de gama alta, incluyendo la capacidad de predicción multi-token para acelerar la inferencia, algo que no ofrecen otras cuantizaciones públicas del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) |
| Parametros totales | 110.468.824.832 (106B) |
| Parametros activos | 12B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | IQ2_XXS, Q4_0, Q4_K, Q8_0, Q6_K (mezcla) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base GLM-4.5-Air presenta una arquitectura MoE con 128 expertos enrutados más un experto compartido, con top-8 routing. Consta de 46 capas (1 densa + 45 MoE) y utiliza atención con GQA (grouped query attention) de 96 cabezas de atención y 8 cabezas KV. El contexto máximo es de 131.072 tokens. La cuantización se realizó con llama.cpp (commit c060ca9) aplicando una matriz de importancia (imatrix) publicada por unsloth con 502 entradas, obtenida de la versión BF16 completa del modelo.

La cuantización mixta asigna distintos tipos de tensor según su criticidad: los tensores de los expertos FFN (gate/up) usan IQ2_XXS, mientras que los down-expert se mantienen en Q4_0, la atención y el router en Q8_0, las embeddings y la salida en Q6_K, y el bloque MTP (capa 46) se integra en Q4_K. La cabeza MTP (multi-token prediction) está embebida en el archivo GGUF como una capa adicional de predicción, lo que permite a llama.cpp usarla para decodificación especulativa con la opción `--spec-type draft-mtp`.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento de múltiples pasos.
- Soporte nativo de function calling / tool calling, orientado a tareas de agentes.
- Capacidad de agente multi-step, optimizada para benchmarks como tau-bench y BFCL-v3.
- Contexto largo de 131.072 tokens, adecuado para conversaciones extendidas y documentos largos.
- Descodificación especulativa mediante la cabeza MTP integrada, que acelera la generación en llama.cpp.
- Capacidades de razonamiento lógico y matemático, así como generación de código.

## Casos de uso

- **Despliegue en hardware de gama alta**: al ser una cuantización compacta, permite ejecutar un modelo de 106B en GPU con 48 GB de VRAM, lo que no sería posible con la versión BF16.
- **Descodificación especulativa en producción**: la cabeza MTP embebida permite usar `llama-server --spec-type draft-mtp` para acelerar la generación en aplicaciones de chat o API.
- **Atención al cliente bilingüe**: soporta inglés y chino, con contexto largo para gestionar conversaciones multi-turno con historial extenso.
- **Generación de código asistida**: el modelo base está entrenado para tareas de programación, y la cuantización conserva la precisión suficiente para implementaciones de estructuras de datos.
- **Agentes con tool calling**: integración en pipelines que requieren llamadas a funciones y razonamiento multi-paso, como asistentes de automatización.
- **Investigación y evaluación de cuantización**: sirve como referencia para comparar la calidad de una cuantización extrema (3,29 bits/param) frente al modelo original en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card del autor incluye mediciones de perplexity y pruebas funcionales:

| Test | Resultado |
|---|---|
| Perplexity (contexto 512 tokens, 67 chunks, texto de calibración) | 5,5835 ± 0,1016 |
| QA factual (capital de Francia) | correcto (París) |
| Implementación de LRU | correcto (diseño de lista doblemente enlazada O(1)) |
| Recuperación de valor exacto (valor mágico 9137) | exacto |

El autor advierte que la perplexity se midió sobre el texto de calibración, por lo que el resultado es optimista respecto a datos no vistos.

## Requisitos de hardware

- VRAM estimada: al menos 42,4 GiB para cargar el modelo en memoria, más el contexto adicional (puede superar los 48 GB con contexto largo).
- GPU recomendadas: NVIDIA A100 48 GB, H100, o RTX 4090 24 GB (insuficiente para el modelo completo, se necesitaría descarga a CPU o uso de memoria compartida).
- Se puede ejecutar en CPU con RAM suficiente (mínimo 48 GB de RAM), aunque con menor rendimiento.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli), compatible con llama.cpp y sus derivados como Ollama o LM Studio.
- Latencia y throughput: no especificados en la información disponible; dependen del hardware y de la activación de la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-4.5-Air-PS-IQ2_XXS-MTP (este) | 106B | 12B | 131k | MIT | GGUF (cuantizado) |
| zai-org/GLM-4.5-Air (base) | 106B | 12B | 131k | MIT | Safetensors (BF16) |
| GLM-4.5 (base) | 355B | 32B | 128k | MIT | Safetensors |

La comparativa con otros modelos de la misma categoría (MoE de ~100B con 12B activos) no está disponible en la información proporcionada. La principal diferencia frente al modelo base es el formato GGUF cuantizado y la retención de la cabeza MTP, que no está presente en otras cuantizaciones públicas del mismo modelo.

## Limitaciones y advertencias

- Cuantización extrema (3,29 bits/parámetro) en los tensores de expertos, lo que puede degradar la calidad del modelo en tareas complejas de razonamiento o en idiomas no representados en la imatrix.
- La perplexity medida es optimista al haber sido calculada sobre el texto de calibración; el rendimiento real sobre datos aislados puede ser inferior.
- Solo soporta inglés y chino; no se garantiza buen rendimiento en otros idiomas.
- Requiere al menos 42 GB de memoria para cargar el archivo, más espacio para el contexto; no es viable en GPUs de consumo de 24 GB o menos sin técnicas de descarga.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo base original y las condiciones de la cuantización.
- El MTP head está optimizado para llama.cpp; otros frameworks (vLLM, TGI) pueden no soportar la decodificación especulativa con esta cabeza integrada.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/peasantsmith/GLM-4.5-Air-PS-IQ2_XXS-MTP-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-4.5-Air
- Cuantización de unsloth (imatrix): https://huggingface.co/unsloth/GLM-4.5-Air
- Blog de Z.ai sobre GLM-4.5: https://z.ai/blog/glm-4.5
- Página oficial de GLM-4.5: https://glm45.org/
- Modelo en ModelScope: https://www.modelscope.cn/models/ZhipuAI/GLM-4.5-Air
