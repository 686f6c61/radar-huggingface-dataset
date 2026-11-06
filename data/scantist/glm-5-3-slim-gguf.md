# Scantist/GLM-5.3-SLIM-GGUF

## Resumen

GLM-5.3-SLIM-GGUF es una cuantización GGUF derivada de zai-org/GLM-5.3, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado originalmente por Zhipu AI (Z.ai). La variante publicada por Scantist aplica una poda arquitectónica basada en neural architecture search (NAS): cada capa MoE conserva 192 de los 256 expertos enrutados originales, lo que reduce los parámetros totales de 753B a 563B y el tamaño en disco de 238,6 GB a 179,9 GB (-24,6%). El resultado es un modelo que cabe íntegramente en la memoria de una única NVIDIA B200 o en un Mac Studio con 192 GB o más de memoria unificada.

La relevancia de esta ficha radica en que permite ejecutar un modelo de clase frontera con 563B parámetros totales en hardware de una sola GPU profesional, algo imposible con la versión completa. La cuantización de origen es UD-IQ2_M de Unsloth, con un promedio de 2,56 bits por peso, y no se ha recuantizado: los expertos conservados se copian byte a byte y el resto de tensores (atención, indexador DSA, expertos compartidos, embeddings) son idénticos al modelo fuente. Se ha eliminado la capa MTP (multi-token prediction) y se han ajustado los metadatos del grafo.

El modelo está pensado para generación de texto conversacional y código, con soporte de inglés y chino, y se distribuye bajo la licencia glm-5.3 del modelo base. Su principal atractivo es la relación entre capacidad y requisitos de memoria: un MoE de 563B ejecutable en un solo B200 con aproximadamente 100K tokens de caché KV compartida entre peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA y DSA (glm_moe_dsa), 78 bloques, 192 expertos enrutados por capa (podados de 256 mediante NAS) |
| Parametros totales | 562.687.789.632 (563B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (la caché KV medida soporta ~100K tokens en un B200; el servidor de evaluación usa un pool de 102.400 tokens con hasta 68.608 tokens por petición) |
| Tipos de cuantizacion | GGUF UD-IQ2_M (2,56 bits por peso de media); mezcla de IQ3_XXS, IQ4_XS, IQ2_XXS, IQ2_S, Q5_K, Q6_K y Q8_0 según tensor. Se incluye imatrix para recuantizar |
| Idiomas soportados | en, zh |
| Licencia | other (glm-5.3), enlazada a la licencia de zai-org/GLM-5.3 |
| Formato de pesos | GGUF (6 splits, llama.cpp) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura transformer con capas MoE y atención de tipo MLA (multi-head latent attention) combinada con un indexador DSA (DeepSeek sparse attention, según la nomenclatura `glm-dsa` de los metadatos). La variante SLIM no ha sido reentrenada ni recalibrada: parte de la cuantización UD-IQ2_M de Unsloth y aplica la arquitectura de 192 expertos por capa descubierta por la búsqueda NAS del modelo GLM-5.3-SLIM-E192 de autotrust. Cada capa MoE (de la 3 a la 77) conserva los expertos seleccionados por la búsqueda y descarta los 64 restantes.

La operación de poda es puramente estructural y se apoya en el layout de GGUF, donde el eje de expertos es la dimensión más lenta de los tensores `ffn_{gate,up,down}_exps`, `ffn_gate_inp` y `exp_probs_b`, de modo que cada experto ocupa un rango de bytes contiguo. Los expertos conservados se copian byte a byte en su orden original como expertos 0-191, manteniendo el tipo de cuantización elegido por Unsloth para cada tensor. También se elimina la capa MTP (`blk.78`) y se actualizan los metadatos `glm-dsa.expert_count` (256 a 192), `glm-dsa.block_count` (79 a 78), `glm-dsa.nextn_predict_layers` (1 a 0) y `general.size_label` (256x22B a 192x22B). El tokenizador y la plantilla de chat no se modifican. No se documentan en la información disponible los detalles del dataset de entrenamiento original, el número de tokens ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación de código: la model card reporta 92,7% en HumanEval pass@1 en modo greedy y con thinking desactivado.
- Razonamiento de alta profundidad: el script de evaluación de GPQA-Diamond usa `reasoning_effort=high` con hasta 65.536 tokens, lo que indica soporte de modo de razonamiento extendido (resultados en curso, no publicados).
- Soporte de plantilla de chat conversacional (tokenizer y chat template sin cambios respecto al modelo base).
- Capacidad de atender hasta 10 peticiones en paralelo con un pool de caché KV compartido de 102.400 tokens en un B200.
- Soporte de decodificación especulativa MTP: no disponible en esta variante (capa MTP eliminada; la model card advierte explícitamente de no usarla).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el modelo obtiene 92,7% en HumanEval pass@1 y puede desplegarse con llama-server en un único B200, lo que permite integrarlo en pipelines de revisión o generación de código con validación automática contra tests oficiales, como hace el script `eval/humaneval.py` incluido en el repositorio.
- Razonamiento matemático y científico de alta dificultad: el soporte de `reasoning_effort=high` con hasta 65.536 tokens por petición lo hace adecuado para problemas de competición o análisis técnico que requieren cadenas de razonamiento largas, con la advertencia de que los resultados de GPQA-Diamond aún no están publicados.
- Asistente conversacional multilingüe inglés-chino: la plantilla de chat y el tokenizador originales se conservan, por lo que puede usarse en atención al cliente o asistentes internos para organizaciones que operan en ambos idiomas, con hasta 10 conversaciones concurrentes en un B200.
- Procesamiento de documentos largos: con un pool de caché KV de ~100K tokens compartido, es viable resumir o extraer información de documentos extensos, aunque el reparto entre peticiones concurrentes reduce el contexto efectivo por solicitud (hasta 68.608 tokens en la configuración de evaluación).
- Despliegue en estación de trabajo con memoria unificada: la model card indica compatibilidad con Mac Studio de 192 GB o más mediante mlx-serve, lo que permite ejecutar el modelo en local para prototipado, investigación o entornos con requisitos de privacidad que impiden usar la nube.
- Evaluación comparativa de arquitecturas podadas: al incluir la imatrix con el mismo recorte de expertos, sirve como base para recuantizar a otros tipos GGUF y estudiar el impacto de la poda NAS en calidad y latencia sin necesidad de reentrenar.
- Investigación sobre eficiencia de MoE: la reducción de 256 a 192 expertos por capa con copia byte a byte permite aislar el efecto del número de expertos en el rendimiento, manteniendo constantes el resto de tensores y la cuantización.

## Benchmarks y rendimiento

| Benchmark | Configuracion | GLM-5.3-SLIM-GGUF (E192) | Unsloth GLM-5.3 UD-IQ2_M (256 expertos) |
|---|---|---|---|
| HumanEval pass@1 | greedy, thinking off | 92,7% | no medido |
| GPQA-Diamond | T=1.0, `reasoning_effort=high`, 65.536 tokens | en curso (no publicado) | no medido |

No se han publicado en la información disponible resultados de MMLU, GSM8K u otros benchmarks para esta variante. La model card solo reporta HumanEval y anuncia GPQA-Diamond como pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos solos ocupan 170.896 MiB con `-ngl 99` (el tensor `token_embd`, 624 MiB, permanece en memoria host); con `-ub 512` se añaden ~512 MiB de buffer de cómputo.
- Caché KV en f16: 93 KiB por token (87,75 KiB de MLA + 5,25 KiB del indexador DSA).
- GPU recomendada: una NVIDIA B200 (183.359 MiB reportados por `nvidia-smi`). Con `-c 102400` el uso total medido es de 181.678 MiB, dejando ~1,7 GB libres; con `-c 110592` el uso sube a 182.454 MiB y la model card lo considera insuficiente para buffers temporales.
- GPU consumer: no cabe en ninguna GPU consumer actual; se requiere un split multi-GPU en GPUs menores (no probado por el autor).
- Memoria unificada: Mac Studio con 192 GB o más mediante mlx-serve, según la model card.
- Almacenamiento: 180 GB libres para los seis splits GGUF.
- Software: llama.cpp en el commit `8e5a58d` (2026-10-24), driver NVIDIA 595.91, CUDA 13.0, compilación con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=100`.
- Throughput y latencia: no disponibles en la información proporcionada.
- Concurrencia: hasta 10 slots en paralelo con el pool KV de 102.400 tokens y hasta 68.608 tokens por petición en la configuración de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa MoE | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-SLIM-GGUF (este) | 563B | 192 | no disponible (~100K tokens de KV en B200) | 179,86 GB | glm-5.3 | Cabe en un B200; HumanEval 92,7% |
| Unsloth GLM-5.3-GGUF UD-IQ2_M | 753B | 256 | no disponible | 238,58 GB | glm-5.3 | No cabe en un B200 ni en Mac de 192 GB |
| autotrust/GLM-5.3-SLIM (E192) | no disponible | 192 | no disponible | no disponible | no disponible | Origen de la arquitectura NAS aplicada aquí |

No se dispone en la información proporcionada de comparativas con modelos de otras familias (por ejemplo, Llama o Qwen de tamaño similar) ni de datos de rendimiento de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- La poda de 256 a 192 expertos por capa puede degradar la calidad respecto al modelo completo; la model card no publica una comparación sistemática de benchmarks más allá de HumanEval.
- La capa MTP ha sido eliminada: no debe usarse decodificación especulativa MTP con este modelo.
- Solo se declaran los idiomas inglés y chino; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Licencia `other` (glm-5.3): es necesario revisar los términos del modelo base antes de cualquier uso comercial; la model card no aclara restricciones específicas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni de sesgos.
- El despliegue probado se limita a una B200 con CUDA 13 y un commit concreto de llama.cpp; el split multi-GPU no ha sido probado por el autor.
- El margen de memoria en un B200 es muy ajustado (~1,7 GB con 102.400 tokens de KV), lo que limita aumentar el contexto o la concurrencia sin riesgo de OOM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- Los resultados de GPQA-Diamond están pendientes; no deben citarse como disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scantist/GLM-5.3-SLIM-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Cuantización de origen (Unsloth UD-IQ2_M): https://huggingface.co/unsloth/GLM-5.3-GGUF/tree/main/UD-IQ2_M
- Modelo con la arquitectura NAS de origen: https://huggingface.co/autotrust/GLM-5.3-SLIM
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
