# canada-quant/glm-5.3-w4a16-mtp

## Resumen
GLM-5.3-Flash W4A16 + MTP es una cuantización INT4 de solo pesos del modelo multimodal zai-org/GLM-5.3-Flash, publicada por canada-quant. No es un modelo nuevo: toda la capacidad procede del modelo base, y el trabajo del autor consiste en comprimir únicamente las 36.288 GEMM de expertos enrutados a INT4 (GPTQ simétrico, group-size 128), manteniendo en BF16 la atención, el router, los expertos compartidos, los embeddings, la torre de visión y la cabeza MTP de decodificación especulativa.

El resultado ocupa 177,7 GiB frente a los aproximadamente 599 GiB en BF16 (una reducción del 70%), lo que permite servir un modelo de casi 50.000 millones de parámetros con contexto de hasta 1.048.576 tokens en configuraciones de 2 GPU H200 o incluso en 2 nodos DGX Spark (GB10). Es relevante ahora porque demuestra que un modelo híbrido de atención lineal con ventana de 1M puede desplegarse en hardware de gama profesional y en equipos compactos, con recetas de vLLM validadas y cifras de throughput publicadas.

La arquitectura es propietaria del modelo base (identificador glm5_next) e incorpora atención lineal híbrida, expertos enrutados y una cabeza MTP para decodificación especulativa. La licencia es MIT, lo que facilita el uso comercial, y el checkpoint está pensado para vLLM con soporte de tool calling y parser de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y expertos enrutados (glm5_next); incluye torre de visión y cabeza MTP |
| Parametros totales | 49.913.588.606 (49,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (validado en 2× H200 y 2× DGX Spark); 262K–512K en configuraciones de 4/8 GPU x86 por límite de memoria KV |
| Tipos de cuantizacion | W4A16 INT4 GPTQ simétrico, group-size 128, solo en GEMM de expertos enrutados; resto en BF16; formato compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), librería transformers, servible con vLLM |

## Arquitectura y entrenamiento
El modelo base es un transformer híbrido que combina atención lineal con atención completa y un bloque de expertos enrutados; el checkpoint cuantizado conserva en BF16 la atención, el router, los expertos compartidos, los embeddings, la torre de visión y la cabeza MTP. La cuantización afecta exclusivamente a las 36.288 GEMM de expertos enrutados, aplicando GPTQ simétrico con group-size 128 en formato compressed-tensors. El autor advierte que el modelo es una cuantización, no un modelo nuevo, y que la capacidad es íntegramente la del base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable del checkpoint es la preservación de la cabeza MTP en BF16 para decodificación especulativa, junto con el soporte de un drafter externo DFlash2-G (K=7) que eleva el throughput en configuraciones H100. La model card menciona además parches específicos para particionado de KV consciente del drafter y taps auxiliares EAGLE3.

## Capacidades
- Generación de texto conversacional multi-turno con ventana de hasta 1.048.576 tokens.
- Razonamiento matemático y científico: la model card reporta AIME 2025 0.8833, AIME 2026 85,0% y GPQA-Diamond 0.8586.
- Resolución de problemas aritméticos: GSM8K 0.97.
- Comprensión multimodal imagen-texto: pipeline image-text-to-text, con MMMU 0.747 y OCRBench 888.
- Tool calling y function calling: la receta de servicio incluye `--tool-call-parser glm47 --enable-auto-tool-choice`.
- Modo de razonamiento explícito: parser de razonamiento `glm45` en vLLM.
- Decodificación especulativa mediante cabeza MTP y drafter DFlash2-G.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.

## Casos de uso
- Análisis de documentación técnica extensa: con 1M tokens de contexto en 2× H200 se puede ingerir un repositorio completo o varios manuales y formular preguntas cruzadas sin troceado, aprovechando la ventana completa validada.
- Automatización de OCR y extracción estructurada: la torre de visión y la puntuación OCRBench 888 permiten procesar facturas, formularios e informes escaneados y devolver JSON estructurado.
- Asistente de razonamiento matemático en entornos de investigación: los resultados en AIME y GPQA lo hacen adecuado para verificación de demostraciones y problemas de nivel competición, con modo de razonamiento activado.
- Agentes con tool calling en pipelines de CI/CD: el soporte de `--tool-call-parser glm47` y `--enable-auto-tool-choice` permite integrarlo como planificador que invoca herramientas de build, test y despliegue en varios pasos.
- Despliegue en hardware compacto: en 2× DGX Spark (GB10) alcanza 31–33 tok/s en streaming único a contexto corto con 262K por defecto y 800K validados, lo que habilita prototipos locales de un modelo de 1M de contexto.
- Servicio de chat a escala media: en 4× H200 con TP=4 se pasa de 195 tok/s a concurrencia 1 hasta 1.954 tok/s a concurrencia 256, suficiente para una API interna con cientos de sesiones simultáneas.
- Procesamiento batch de alto rendimiento: en 8× H100 con TP=8 sin especulación se alcanzan 2.418 tok/s agregados a concurrencia 256, útil para clasificación, resumen o extracción masiva de documentos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion |
|---|---|---|
| AIME 2025 | 0.8833 (n=120) | H100 |
| AIME 2026 | 85,0% (n=120) | 2× DGX Spark |
| GPQA-Diamond | 0.8586 | no especificada |
| GSM8K | 0.97 | no especificada |
| MMMU | 0.747 | no especificada |
| OCRBench | 888 | no especificada |

| Throughput | Valor | Configuracion |
|---|---|---|
| Single-stream | 181,2 tok/s | 8× H100, TP8 + DFlash2-G K=7 |
| Single-stream sin especulación | 135,4 tok/s | 8× H100, TP8 |
| Agregado c256 | 2.418 tok/s | 8× H100, TP8 sin especulación |
| Agregado c256 con MTP N=2 | 2.330 tok/s | 8× H100, TP8 |
| Single-stream c1 con MTP N=2 | 215,0 tok/s | 8× H100, TP8 |
| c1 a c256 | 195 → 1.954 tok/s | 4× H200, TP=4 |
| Single-stream corto | ≈31–33 tok/s | 2× DGX Spark |

No se han publicado comparaciones directas con modelos de la competencia en la información disponible.

## Requisitos de hardware
- Pesos cuantizados: 177,7 GiB en disco; en 2× H200 supone 89,5 GiB por GPU.
- GPU validadas: NVIDIA H100, H200, RTX PRO 6000 (SM120) y DGX Spark GB10 (SM121). El autor menciona también Blackwell y Hopper en las etiquetas.
- Consumer GPU: no se documenta funcionamiento en RTX 4090 ni en GPU de 24 GB; el tamaño de pesos lo impide en configuraciones de una sola tarjeta.
- Despliegue: vLLM con imágenes específicas por arquitectura (`vllm/vllm-openai:glm53-flash-x86_64-cu130` para SM90, `cstechdev/vllm:glm53-flash-nope-sm120-cu130-20260826-r1` para SM120, `ghcr.io/canada-quant/vllm-glm53-flash-sm121:v2-w4a16-dflash2e` para SM121). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Restricciones operativas: `--max-num-seqs` debe ser ≤ 512 por los 512 bloques de caché de estado Mamba/KDA; con drafter, `--max-model-len` ≤ 131071; fp8 KV no está disponible en Hopper para este modelo NoPE; el arranque en frío del contenedor ronda los 12 minutos.
- Latencia y throughput: ver tabla de benchmarks; el arranque de 8× H100 con drafter tarda aproximadamente 12 minutos en frío.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| canada-quant/glm-5.3-w4a16-mtp | 49,9 B | 1.048.576 | MIT | safetensors INT4 + BF16 | Cuantización W4A16 con MTP; 177,7 GiB |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | BF16 | Modelo base; aproximadamente 599 GiB en BF16 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables |

## Limitaciones y advertencias
- Solo soporta inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de fidelidad factual específicas para esta cuantización.
- La cuantización INT4 en expertos puede degradar ligeramente la calidad frente al BF16; el autor no publica una comparación directa de perplejidad o benchmarks contra el base.
- Restricción operativa crítica: `--max-num-seqs` superior a 512 provoca fallo por límite de bloques de caché de estado.
- Con drafter especulativo, prompts de prellenado de 131K tokens o más provocan fallos; sin especulación funcionan.
- El backend de atención por defecto de vLLM nightly falla con prompts de 131K o más; hay que usar `--attention-backend FLASH_ATTN_MLA_SPARSE`.
- Los `config.json` anteriores al 2026-09-08 fallan en vLLM con `KeyError: 'layers.0.mlp.gate_up_proj.weight'`; es necesario volver a descargarlo.
- El caché de prefijos mide entre −2% y −5% en H200, por lo que se recomienda desactivarlo.
- TP=4 con drafter DFlash2 más allá de concurrencia 32 reduce el pool KV unas 6 veces y provoca un acantilado de preempción y recomputación.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos derivados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/canada-quant/glm-5.3-w4a16-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Benchmarks completos: BENCHMARKS.md (referenciado en la model card del repositorio)
- Repositorio de serving SM121: https://github.com/canada-quant/vllm-glm53-flash-sm121
- Pull request de vLLM: https://github.com/vllm-project/vllm/pull/53906
- Imagen H100 con drafter: ghcr.io/canada-quant/vllm-glm53-flash-h100:v2-w4a16-dflash2
- Imagen SM121: ghcr.io/canada-quant/vllm-glm53-flash-sm121:v2-w4a16-dflash2e
- Imagen SM120: cstechdev/vllm:glm53-flash-nope-sm120-cu130-20260826-r1
