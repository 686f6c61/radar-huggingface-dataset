# fraQtl/Qwen3.6-35B-A3B-compressed

## Resumen

fraQtl/Qwen3.6-35B-A3B-compressed es un artefacto de pesos comprimidos del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicado por el usuario independiente fraQtl. Se trata de un modelo MoE (Mixture of Experts) de tipo texto cuyo repositorio ocupa 25,53 GB en disco, frente a los aproximadamente 70 GB de la versión FP16, lo que supone una reducción de 2,74×. La compresión se aplica a los tensores de expertos del MoE mediante empaquetado INT3 y calibración con WikiText-2 (variante v4).

El interés principal del artefacto es práctico: permite ejecutar el modelo con 128K de contexto en una única A100-80GB con un pico de VRAM de 51,7 GB, mientras que la versión FP16 agota la memoria a 64K en la misma configuración. Las mediciones publicadas por el autor muestran una degradación mínima en MMLU (82,24 % frente a 82,40 % del FP16) y resultados equivalentes o ligeramente superiores en HumanEval y BigCodeBench.

Es relevante ahora porque demuestra que la compresión agresiva de pesos en modelos MoE de gran contexto puede ser viable en producción con hardware de una sola GPU, aunque con un coste de dependencia: requiere el paquete propietario `fraqtl-runtime` y una licencia propia (`fraqtl-model-license`) distinta de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo Qwen3.5 MoE, `qwen3_5_moe_text`) con pesos comprimidos INT3 en expertos |
| Parametros totales | 2.448.355.968 (según safetensors del repo comprimido; el nombre del modelo base indica 35B-A3B, discrepancia no aclarada en la información disponible) |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, sin confirmación en la información proporcionada) |
| Longitud de contexto | 128K tokens (validado con ∞Bench Passkey 30/30 a ~125K) |
| Tipos de cuantizacion | Pesos comprimidos INT3 empaquetados en tensores de expertos MoE; carga en bfloat16 en runtime; GGUF Q4_K_M disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | `fraqtl-model-license` (licencia propia, categoría "other") |
| Formato de pesos | safetensors con loader personalizado (`trust_remote_code=True` + `fraqtl-runtime`) |

## Arquitectura y entrenamiento

El modelo es una compresión del Qwen3.6-35B-A3B, un transformer con capas MoE. La innovación del artefacto no está en el entrenamiento sino en el post-procesado: los tensores de los expertos se empaquetan en INT3 y se calibran con WikiText-2 (versión v4), reconstruyéndose en tiempo de carga mediante un loader compilado distribuido en el wheel `fraqtl-runtime`. El resto de la arquitectura (atención, embeddings, capas densas) mantiene el comportamiento del modelo base.

No se detalla en la información disponible el volumen de tokens de entrenamiento original, la composición del dataset ni si hubo RLHF/DPO en el modelo base. La compresión se realizó sin fine-tuning posterior según lo descrito; el autor reporta que la perplejidad en WikiText-2 pasa de 11,6041 a 11,6930 (+0,77 %). Existe una línea posterior, Hi-Fi, con compresión "calibration-aware" y recibos KLD, que el propio autor recomienda como punto de partida.

## Capacidades

- Generación de texto conversacional y continuaciones de prompt.
- Razonamiento y conocimiento general (MMLU 82,24 % en 14.042 preguntas).
- Generación de código (HumanEval pass@1 64,02 %, HumanEval+ 55,49 %, BigCodeBench 39,50 %).
- Recuperación en contexto largo: ∞Bench Passkey 30/30 a ~125K tokens y KV-retrieval 80 % (4/5) en configuraciones de 1 a 1500 agujas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de contexto largo en una sola GPU: con 51,7 GB de pico a 128K, el modelo cabe en una A100-80GB y permite procesar documentos extensos, contratos o bases de código completas sin sharding, algo imposible con el FP16 en la misma máquina.
- Análisis de repositorios y codebases: la ventana de 128K y el rendimiento en HumanEval/BigCodeBench lo hacen adecuado para tareas de revisión, refactorización y generación de tests sobre múltiples ficheros en un único prompt.
- Recuperación aumentada (RAG) de alta densidad: la retención de agujas a ~125K tokens permite inyectar muchos fragmentos recuperados sin truncar, reduciendo la pérdida de información en pipelines RAG.
- Evaluación comparativa de compresión: útil como referencia para investigadores que miden el impacto de INT3 en MoE frente a FP16, con métricas publicadas de PPL, MMLU, HumanEval y TruthfulQA.
- Prototipado en investigación con presupuesto de VRAM limitado: permite experimentar con un MoE de gran contexto en una única A100 en lugar de requerir un nodo multi-GPU.
- Generación de código en pipelines internos: con HumanEval pass@1 del 64 %, puede integrarse en herramientas de autocompletado o generación de parches, siempre que se acepte la dependencia del runtime propietario.
- Fine-tuning o adaptación posterior: no recomendado sin verificar compatibilidad del loader con PEFT/LoRA, ya que la información disponible no lo confirma.

## Benchmarks y rendimiento

| Benchmark | FP16 referencia | fraQtl comprimido | Diferencia |
|---|---|---|---|
| MMLU (14.042 preguntas, 57 materias) | 82,40 % | 82,24 % | −0,16 pp |
| HumanEval pass@1 (N=164) | 61,59 % | 64,02 % | +2,43 pp (IC 95 % ≈ ±3 pp) |
| HumanEval+ pass@1 (N=164) | 54,27 % | 55,49 % | +1,22 pp |
| BigCodeBench (N=200) | 39,50 % | 39,50 % | 0 pp |
| TruthfulQA-MC2 (N=500) | ~0,4553 | 0,4493 | −0,006 |
| WikiText-2 PPL | 11,6041 | 11,6930 | +0,77 % |
| ∞Bench Passkey @ ~125K | n/a | 30/30 (100 %) | n/a |
| ∞Bench KV-retrieval (n=1,10,100,500,1500) | 80 % (4/5) | 80 % (4/5) | idéntico |

Todas las mediciones en una única NVIDIA A100-80GB, semilla única; el autor indica reverificación multi-semilla en curso.

## Requisitos de hardware

- VRAM estimada: 25,6 GB de pico a 16K de contexto; 36,8 GB a 64K; 51,7 GB a 128K; 48,7 GB en ∞Bench KV-retrieval con n=1500.
- GPU recomendadas: NVIDIA A100-80GB (validada); probablemente H100-80GB por capacidad similar, aunque no está confirmado en la información disponible.
- GPU de consumo: no cabe en RTX 4090 (24 GB) a contextos largos; a 16K el pico de 25,6 GB ya supera los 24 GB. Para consumer se ofrece el GGUF Q4_K_M (21,4 GB) en repo separado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `fraqtl-runtime` (Linux x86_64 + CUDA, v0.1); para llama.cpp, Ollama, LM Studio, koboldcpp o Jan usar el repo GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Plataformas: Linux x86_64 + CUDA validado; macOS/ARM anunciado como pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fraQtl/Qwen3.6-35B-A3B-compressed | 35B-A3B (según nombre); 2,45B en safetensors | 128K | fraqtl-model-license | safetensors + runtime propietario | Compresión INT3, 25,53 GB en disco |
| Qwen/Qwen3.6-35B-A3B (base) | 35B-A3B | 128K (OOM a 64K en stock A100-80GB según el autor) | licencia Qwen original | safetensors FP16 | Referencia de calidad; ~70 GB |
| fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF | mismo base | 128K | fraqtl-model-license | GGUF | Versión posterior recomendada por el autor, con recibos KLD |
| fraQtl/Qwen3.6-35B-A3B-GGUF | mismo base | 128K | fraqtl-model-license | GGUF Q4_K_M (21,4 GB) | Para llama.cpp/Ollama/LM Studio; ~30 % menos KLD que Q4_K_M estándar |

## Limitaciones y advertencias

- Dependencia de un runtime propietario: sin `fraqtl-runtime` el modelo no carga (`ImportError`); el wheel es binario compilado y solo validado en Linux x86_64 + CUDA v0.1.
- Licencia `fraqtl-model-license` distinta de la del modelo base: es necesario revisar los términos comerciales antes de usar en producción; la información disponible no detalla restricciones concretas.
- Discrepancia de parámetros: el nombre indica 35B-A3B pero el safetensors declara 2.448.355.968 parámetros; conviene verificar antes de dimensionar infraestructura.
- Benchmarks de semilla única: el autor reconoce que la reverificación multi-semilla está en curso; los intervalos de confianza en HumanEval son amplios (±3 pp).
- Riesgo de alucinación: TruthfulQA-MC2 ~0,4493 indica que aproximadamente la mitad de las preguntas trampa no se responden correctamente; no apto para dominios factuales sin verificación.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá del inglés sin pruebas propias.
- Tool calling y capacidades de agente no documentadas: no asumir soporte nativo sin validación.
- Artefacto desactualizado según el propio autor: recomienda migrar a la línea Hi-Fi con recibos KLD.
- Sin datos de latencia ni throughput: imposible estimar coste operativo por token a partir de la información disponible.
- Compresión INT3 en expertos: aunque las métricas agregadas son buenas, pueden existir degradaciones en dominios específicos no cubiertos por los benchmarks publicados.

## Enlaces

- Hugging Face (modelo comprimido): https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-compressed
- Versión Hi-Fi GGUF recomendada por el autor: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-Hi-Fi-GGUF
- GGUF Q4_K_M para llama.cpp/Ollama/LM Studio: https://huggingface.co/fraQtl/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Contacto del autor: https://fraqtl.ai/contact (email: contact@fraqtl.ai)
