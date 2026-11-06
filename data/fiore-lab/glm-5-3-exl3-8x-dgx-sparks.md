# fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks

## Resumen

GLM-5.3-EXL3-8x-DGX-Sparks es una cuantización EXL3 del modelo GLM-5.3 de Z.AI (zai-org), publicada por fiore-lab. El modelo base es un transformer MoE de 755 000 millones de parámetros con arquitectura `glm_moe_dsa`; esta versión cuantizada conserva 194 740 383 104 parámetros en safetensors y ocupa 389,9 GB en disco. La particularidad del checkpoint es que está troceado en ocho shards de tensor parallelism pensados para servir el modelo en un clúster de ocho NVIDIA DGX Spark, con un contexto de 1 048 576 tokens.

La cuantización emplea EXL3 con expertos enrutados a 4 bits (codebook mcg) y el resto de capas lineales a 5 bits (codebook mul1), dejando en BF16 las partes sensibles (embeddings, `lm_head`, normas, router, `kv_b_proj` e indexer). Incluye además la capa MTP (Multi-Token Prediction) del modelo original, que actúa como drafter para decodificación especulativa.

Es relevante porque demuestra que un modelo de escala 755B puede desplegarse en hardware de consumo profesional (DGX Spark, con memoria unificada) mediante una receta de cuantización y paralelismo muy específica, a costa de perder portabilidad: el checkpoint solo carga con el motor y la receta de fiore-labo (ExpertAtlas-GLM5.3), no con vLLM, llama.cpp ni transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm_moe_dsa`), con capa MTP y atención con indexer |
| Parametros totales | 194 740 383 104 (checkpoint cuantizado); modelo base GLM-5.3: 755B |
| Parametros activos | no disponible |
| Longitud de contexto | 1 048 576 tokens (1M) en 8 DGX Spark |
| Tipos de cuantizacion | EXL3 4 bits (expertos enrutados, codebook mcg) y 5 bits (capas lineales, codebook mul1); BF16 para embeddings, `lm_head`, normas, router, `kv_b_proj` e indexer |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 License (Copyright Z.AI, 2026); código de la receta Apache-2.0 |
| Formato de pesos | safetensors (EXL3), más `config.json`, `generation_config.json`, `tokenizer.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de mezcla de expertos con atención `glm_moe_dsa` (DeepSeek-style attention con indexer). El checkpoint cuantizado distribuye los expertos enrutados de las capas 3 a 77 en 75 ficheros `experts-layer-XXX.safetensors`, ya cortados en ocho shards de tensor parallelism por tiles completos, sin recuantización posterior. Las capas lineales restantes (proyecciones de atención, expertos compartidos, MLPs densos de las capas 0 a 2 y `wq_b` del indexer) van en un único `nonexperts-5bit.safetensors`. Los tensores que EXL3 mantiene sin cuantizar se copian byte a byte del checkpoint BF16 oficial (revisión 9d2398f).

La cuantización se realizó con exllamav3 1.6.1: los expertos enrutados a 4 bits con calibración por defecto de exllamav3, las demás capas lineales a 5 bits calibradas a través del modelo que ya contenía los expertos a 4 bits, y la capa MTP (capa 78) cuantizada sin datos de calibración (expertos 4 bits mcg, lineales 5 bits mul1). No se dispone de información sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la decodificación especulativa mediante la capa MTP incluida (tres borradores por ronda) o, opcionalmente, un drafter DFlash2 externo (no redistribuido por su licencia CC BY-NC-ND 4.0).

## Capacidades

- Generación de texto y razonamiento de largo contexto: el checkpoint está configurado para 1 048 576 tokens de ventana en el clúster de referencia.
- Generación de código: la model card reporta pruebas con prompts de programación y textos de código en la evaluación de divergencia KL.
- Decodificación especulativa integrada: la capa MTP permite generar tres borradores por ronda para acelerar la decodificación.
- Soporte de drafter externo DFlash2 (opcional, no incluido en el repositorio).
- Capacidades multilingües: no disponible (la model card está traducida a inglés, japonés y chino, pero no se declaran idiomas soportados).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Vision o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas o múltiples ficheros en una sola pasada para tareas de revisión, refactorización o explicación, algo inviable en modelos con ventanas de 32K-128K.
- Procesamiento de documentación legal o contractual: la evaluación de precisión incluye textos legales; el contexto largo permite comparar cláusulas entre documentos extensos sin trocear.
- Asistente de programación en clúster dedicado: la receta de ocho DGX Spark con tensor parallelism 8 ofrece 42-47 tokens/s de decodificación a 512K tokens de contexto, suficiente para sesiones interactivas de codificación sobre proyectos grandes.
- Generación de resúmenes de corpus de investigación: la ventana de 1M tokens permite resumir conjuntos de papers o informes manteniendo coherencia entre documentos.
- Evaluación de modelos a escala en laboratorio: al ser un checkpoint reproducible desde el BF16 oficial con herramientas publicadas, sirve para estudiar el impacto de la cuantización EXL3 4/5 bits en la distribución de salida (KL de 0,0133 de media en la model card).
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en hardware local (DGX Spark) sin depender de APIs externas, encaja en entornos donde los datos no pueden salir de la infraestructura.
- Investigación en decodificación especulativa: la inclusión de la capa MTP y la comparación con DFlash2 permiten medir el efecto de distintos drafters en latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de cuantización y de velocidad:

| Métrica | Resultado |
|---|---|
| Divergencia KL vs. BF16 oficial (4 textos de 2 048 tokens, últimas 1 023 posiciones, 5 ejecuciones) | media 0,0133 (rango 0,0128-0,0146) |
| Coincidencia de token top-1 | ~96 % |
| Divergencia KL vs. BF16 oficial (4 textos de 8 192 tokens, por rangos de posición) | 0,012-0,019 |
| Referencia: BF16 oficial ejecutado en BF16 vs. FP32 | 0,007-0,010 |

Rendimiento en 8 DGX Spark (reloj GPU limitado a 2 100 MHz, FP8 KV cache, una petición a la vez, prompt de código):

| Prompt | Time to first token (MTP / DFlash2) | Decodificación con MTP | Decodificación con DFlash2 |
|---|---|---|---|
| 128K (129 436 tokens) | 82,8 s / 85,2 s | 47,5 tokens/s | 53,2 tokens/s |
| 256K (260 230 tokens) | 172,9 s / 177,6 s | 45,7 tokens/s | 52,6 tokens/s |
| 512K (529 885 tokens) | 376,5 s / 386,0 s | 42,8 tokens/s | 47,1 tokens/s |

## Requisitos de hardware

- Almacenamiento: 667,8 GB por nodo en el clúster de ocho nodos, sumando este checkpoint y el banco de expertos de 3 bits `fiore-lab/GLM-5.3-EXL3-Experts-3bit` (necesario desde la release r3.3-102).
- Hardware de referencia: ocho NVIDIA DGX Spark con tensor parallelism 8. No se documentan otras configuraciones válidas.
- VRAM/memoria: no disponible de forma desagregada; el diseño asume memoria unificada de los DGX Spark y reparto de expertos entre nodos.
- GPU de consumo: no cabe en una RTX 4090 ni en GPUs consumer convencionales; el checkpoint está troceado específicamente para ocho nodos DGX Spark.
- Opciones de despliegue: exclusivamente el motor de la receta ExpertAtlas-GLM5.3 (https://github.com/fiore-labo/ExpertAtlas-GLM5.3). No es compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: ver tabla de la sección anterior; TTFT de 82,8 s a 128K y 376,5 s a 512K con MTP, y decodificación de 42,8-47,5 tokens/s con MTP o 47,1-53,2 tokens/s con DFlash2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-8x-DGX-Sparks (este) | 194,7B en safetensors (base 755B) | 1 048 576 | EXL3 4/5 bits | GLM-5.3 License | Solo receta ExpertAtlas en 8 DGX Spark |
| zai-org/GLM-5.3-BF16 | 755B | no disponible | BF16 | GLM-5.3 License | Implementación oficial (transformers) |
| zai-org/GLM-5.3 | 755B | no disponible | pesos originales | GLM-5.3 License | Ecosistema estándar del modelo base |
| fiore-lab/GLM-5.3-EXL3-Experts-3bit | no disponible | no disponible | EXL3 3 bits (banco de expertos) | no disponible | Complemento obligatorio de este checkpoint |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de la divergencia KL frente al BF16 oficial.

## Limitaciones y advertencias

- Portabilidad nula: el checkpoint solo carga con el motor de la receta ExpertAtlas-GLM5.3; no funciona con vLLM, llama.cpp, Ollama, TGI ni transformers estándar.
- Dependencia de dos repositorios: desde la release r3.3-102 requiere también el banco de expertos de 3 bits, lo que eleva el espacio en disco a 667,8 GB por nodo.
- Licencia restrictiva: la GLM-5.3 License exige incluir aviso de copyright y permiso en copias sustanciales, y su cláusula 2 obliga a pasar una revisión de seguridad de Z.AI si el licenciatario factura más de 10 000 millones de dólares en 12 meses consecutivos operando un negocio de Model as a Service.
- El drafter DFlash2 opcional no se redistribuye y su licencia es CC BY-NC-ND 4.0 (solo investigación y evaluación, con licencia comercial aparte de Inco AI).
- Pérdida de fidelidad por cuantización: KL de 0,0133 de media y ~96 % de coincidencia top-1 frente al BF16 en FP32; en textos de 8K la divergencia sube a 0,019, superior a la del propio BF16 ejecutado en BF16 (0,007-0,010).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de gran escala.
- Sesgos: no documentados en la model card.
- Idiomas soportados: no declarados; no se puede garantizar cobertura multilingüe más allá de lo que herede del modelo base.
- Throughput limitado a una petición concurrente en las mediciones; no hay datos de serving multi-usuario.
- Las velocidades reportadas dependen del entorno (reloj limitado a 2 100 MHz) y deben tomarse como orientativas.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-8x-DGX-Sparks
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos BF16 del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Banco de expertos de 3 bits: https://huggingface.co/fiore-lab/GLM-5.3-EXL3-Experts-3bit
- Receta de despliegue: https://github.com/fiore-labo/ExpertAtlas-GLM5.3
- Instrucciones para reproducir los pesos: https://github.com/fiore-labo/ExpertAtlas-GLM5.3/blob/main/glm53/weights/README.md
- Drafter DFlash2 (no incluido): https://huggingface.co/incoai/GLM-5.3-DFlash2
