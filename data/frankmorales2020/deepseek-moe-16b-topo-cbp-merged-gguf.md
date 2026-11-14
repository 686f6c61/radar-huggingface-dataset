# frankmorales2020/deepseek-moe-16b-topo-cbp-merged-gguf

## Resumen

DeepSeek-MoE-16B Topo-CBP (Q4_K_M GGUF) es una variante afinada del modelo DeepSeek-MoE-16B de DeepSeek AI, publicada por Frank Morales Aguilera bajo el paraguas del Sovereign Machine Laboratory (SOMALA). El modelo aplica una técnica propietaria denominada Topological Continual Backpropagation (Topo-CBP), apoyada en Arithmetic Spectral Theory (AST) y en el optimizador TopoAdamW, con el objetivo declarado de resolver el dilema estabilidad-plasticidad del aprendizaje continuo sin recurrir a adaptadores externos como LoRA o PEFT.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) de 16.375.728.128 parámetros totales, del que se congelan 15.956.297.728 parámetros (97,44 %) y se dejan adaptables 419.430.400 (2,56 %), limitados a las capas `model.embed_tokens` y `lm_head.weight`. El resultado se serializa en un único artefacto GGUF Q4_K_M de 10,9 GB, pensado para ejecución local con llama.cpp y Ollama tanto en CPU como en GPU.

La relevancia del modelo es fundamentalmente metodológica: propone un marco de ajuste con "deriva cero" (L2 = 0,00e+00 declarado) y publica métricas de validación empírica (desplazamiento absoluto máximo de 1,43e-3 en `lm_head` y 1,22e-3 en `embed_tokens`, dos órdenes de magnitud por debajo del umbral ε < 0,1). No obstante, el modelo solo declara soporte de inglés, cuenta con 286 descargas y 2 likes en el momento de la ficha, y no publica resultados en benchmarks estándar de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-MoE (Mixture of Experts) con Topo-CBP, AST y operadores invariantes de deriva cero |
| Parametros totales | 16.375.728.128 |
| Parametros activos | no disponible (el modelo base DeepSeek-MoE-16B activa aproximadamente 2,8B, pero la model card no lo confirma para esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto publicado); el proceso de serializacion menciona `--leave-output-tensor` y `--output-tensor-type bf16` |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 10,9 GB |
| Parametros congelados (bedrock) | 15.956.297.728 (97,44 %) |
| Parametros adaptables | 419.430.400 (2,56 %), en `model.embed_tokens` y `lm_head.weight` |
| Tensores totales | 5.466 |
| Modelo base | deepseek-ai/DeepSeek-MoE-16b |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-MoE-16B, un transformer con capas de mezcla de expertos y enrutamiento por token. Sobre esa base, el autor aplica Topo-CBP: congela de forma permanente el 97,44 % de los pesos (mecanismos de atención, capas de enrutamiento y MLPs intermedios, denominados "bedrock") y confina toda la plasticidad al 2,56 % restante, correspondiente a la matriz de embeddings de entrada y a la cabeza de salida. El ajuste se realiza con TopoAdamW, un optimizador nativo de PyTorch que, según la model card, evita descomposiciones de bajo rango y no requiere módulos adaptadores.

El marco teórico, Arithmetic Spectral Theory (AST), trata las matrices de pesos como variedades espectrales discretas y acota la trayectoria de optimización dentro de subespacios propios invariantes mediante la restricción sup||W_t − W_0||_∞ < ε. La validación empírica reporta un desplazamiento absoluto máximo de 1,43e-3 en `lm_head.weight` (delta L2 de 4,15) y de 1,22e-3 en `model.embed_tokens.weight` (delta L2 de 0,14), ambos por debajo del umbral ε < 0,1. La serialización a GGUF Q4_K_M produce un binario de 10,11 GB según el artículo, aunque el repositorio ocupa 10,9 GB. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del modelo base DeepSeek-MoE-16B.
- Razonamiento y respuesta a instrucciones propias del modelo base, sin que la model card documente mejoras específicas en estas áreas.
- Ejecución local en CPU y GPU mediante llama.cpp y Ollama, gracias al formato GGUF Q4_K_M.
- Aprendizaje continuo con deriva controlada: la adaptación a nuevos dominios se limita a embeddings y cabeza de salida, preservando el resto de representaciones.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: el GGUF Q4_K_M de 10,9 GB permite ejecutar el modelo con llama.cpp u Ollama en CPU con RAM suficiente, útil para prototipado y pruebas offline.
- Investigación en aprendizaje continuo: el modelo sirve como banco de pruebas reproducible para estudiar el dilema estabilidad-plasticidad, ya que separa explícitamente pesos congelados y adaptables con métricas de deriva publicadas.
- Ajuste de dominio con bajo riesgo de olvido catastrófico: al confinar la plasticidad a `embed_tokens` y `lm_head`, se puede adaptar el vocabulario o el estilo de salida a un dominio nuevo sin tocar el motor de razonamiento interno.
- Evaluación de marcos de gobernanza topológica: equipos que investiguen AST o TopoAdamW pueden replicar los cuadernos publicados (`deepseek_topo_cbp_moe.ipynb`, `topo_cbp_gguf_verification.ipynb`) sobre este artefacto.
- Generación de texto en inglés para entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales sin obligaciones de copyleft.
- Reproducibilidad bit a bit en pipelines deterministas: los artículos del autor sobre ingeniería de prompts determinista y ejecución bare-metal encajan con el uso del GGUF como artefacto verificable en entornos aislados.
- Comparación de cuantizaciones: el artefacto Q4_K_M con `--leave-output-tensor` y `--output-tensor-type bf16` permite estudiar el impacto de la cuantización en la cabeza de salida frente a otras configuraciones.

## Benchmarks y rendimiento

La model card solo publica métricas de validación del ajuste Topo-CBP, no benchmarks estándar de razonamiento, código o matemáticas.

| Metrica | Valor | Contexto |
|---|---|---|
| NLL (negative log-likelihood) | 5,2976 | Evaluado en NVIDIA A100 |
| Perplejidad | 199,86 | Evaluado en NVIDIA A100 |
| Delta L2 `lm_head.weight` | 4,15 | Deriva tras ajuste Topo-CBP |
| Desplazamiento absoluto maximo `lm_head.weight` | 1,43e-3 | Umbral ε < 0,1 |
| Delta L2 `model.embed_tokens.weight` | 0,14 | Deriva tras ajuste Topo-CBP |
| Desplazamiento absoluto maximo `model.embed_tokens.weight` | 1,22e-3 | Umbral ε < 0,1 |
| Deriva de coordenadas declarada | L2 = 0,00e+00 | Según la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el GGUF Q4_K_M ocupa 10,9 GB, por lo que se recomienda un mínimo de 12 GB de memoria unificada o RAM para carga completa, con margen adicional para el contexto KV.
- GPU recomendadas: NVIDIA A100 (usada por el autor para las métricas de NLL y perplejidad); H100 para mayor throughput; RTX 4090 (24 GB) para ejecución cómoda en consumer.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 (24 GB) y RTX 4080 (16 GB) con contexto moderado; en GPUs de 12 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura MoE del modelo base suele ofrecer throughput superior a un denso de tamaño equivalente, pero no hay cifras publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-MoE-16B Topo-CBP (este) | 16,38B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste Topo-CBP con deriva cero, solo inglés |
| deepseek-ai/DeepSeek-MoE-16b (base) | 16,38B | no disponible en esta ficha | DeepSeek Model License (verificar) | safetensors | Modelo original sin ajuste Topo-CBP |
| DeepSeek-MoE-16B instruct (variantes comunitarias) | 16,38B | no disponible | variable según autor | safetensors, GGUF | Afinamientos conversacionales sin marco de deriva cero |
| Modelos MoE de ~16B con GGUF (p. ej. Mixtral-8x7B Q4) | 46,7B | 32K (Mixtral) | Apache 2.0 | GGUF | Mayor tamaño y contexto documentado, pero sin marco Topo-CBP |

La comparación directa con alternativas se ve limitada porque la model card no documenta contexto, benchmarks ni parámetros activos de esta variante. El principal diferenciador frente al DeepSeek-MoE-16B original no es el rendimiento bruto, sino el marco de ajuste con garantías de deriva y la disponibilidad en GGUF listo para Ollama.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- La perplejidad reportada (199,86) es alta en términos absolutos; conviene validar la calidad de generación en la tarea concreta antes de usarlo en producción.
- No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no se puede comparar su calidad de razonamiento o código con alternativas.
- El ajuste congela el 97,44 % de los pesos: la adaptación a nuevos dominios solo afecta a embeddings y cabeza de salida, lo que limita la profundidad del cambio de comportamiento.
- Riesgo de alucinación inherente al modelo base DeepSeek-MoE-16B, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la model card; se heredan los del corpus de entrenamiento original.
- La licencia Apache 2.0 del artefacto es permisiva, pero conviene verificar la licencia del modelo base DeepSeek-MoE-16B para uso comercial, ya que puede imponer restricciones adicionales.
- El modelo tiene muy poca tracción (286 descargas, 2 likes) y procede de un autor individual, no de un laboratorio consolidado; la validación independiente es escasa.
- Las afirmaciones de "deriva cero" y "gobernanza topológica" provienen de artículos del propio autor en Medium y no de revisión por pares; trátese como propuesta metodológica, no como resultado consolidado.
- El contexto máximo no está documentado; no se debe asumir la ventana del modelo base sin verificarla empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/deepseek-moe-16b-topo-cbp-merged-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-MoE-16b
- Artículo principal (Medium): https://medium.com/ai-simplified-in-plain-english/topological-governance-and-silicon-bedrock-invariants-implementing-topo-cbp-on-deepseekmoe-16b-de5f791fbf75
- Artículo "Beyond Catastrophic Forgetting": https://medium.com/ai-simplified-in-plain-english/beyond-catastrophic-forgetting-the-mathematical-and-empirical-triumph-of-topological-continual-eb6e47304752
- Artículo "Deterministic Prompt Engineering": https://medium.com/ai-simplified-in-plain-english/deterministic-prompt-engineering-moving-from-heuristic-handoffs-to-bitwise-reproducible-d35c2caf267e
- Artículo "The Sovereignty of Bare-Metal Intelligence": https://medium.com/ai-simplified-in-plain-english/the-sovereignty-of-bare-metal-intelligence-beyond-the-cloud-monopoly-923f697e3cc9
- Cuaderno de ajuste: https://github.com/frank-morales2020/AST/blob/main/deepseek_topo_cbp_moe.ipynb
- Cuaderno de agentes GGUF: https://github.com/frank-morales2020/AST/blob/main/five_agentic_gguf.ipynb
- Cuaderno de verificación: https://github.com/frank-morales2020/AST/blob/main/topo_cbp_gguf_verification.ipynb
