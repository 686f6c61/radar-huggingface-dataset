# AxionML/Nemotron-3-Super-120B-A12B-NVFP4

## Resumen

AxionML/Nemotron-3-Super-120B-A12B-NVFP4 es un espejo (mirror) publicado por AxionML del checkpoint cuantizado en NVFP4 de NVIDIA, identificado como nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4 (revision ff433f5493e25d631c9f12b5d55c674229923d02). No se trata de una modificacion de los pesos: el repositorio es una copia sin alterar de la release de NVIDIA, orientada a facilitar el despliegue y el serving en abierto. El modelo pertenece a la familia Nemotron 3 Super y esta disenado como modelo de razonamiento y de uso agentico, con 120B de parametros totales y 12B activos por token.

La arquitectura es un hibrido LatentMoE que intercala capas Mamba-2 con capas MoE, incluye capas de atencion seleccionadas y anade Multi-Token Prediction (MTP). La longitud de contexto declarada llega hasta 1M de tokens y el razonamiento se puede activar o desactivar mediante la plantilla de chat (parametro enable_thinking). El checkpoint ocupa aproximadamente 80 GB y esta pensado para ejecutarse en hardware Blackwell, con un minimo declarado de 1x B200 o 1x DGX Spark.

La relevancia de esta ficha esta en la cuantizacion NVFP4: NVIDIA preentreno el modelo con una receta NVFP4 y publica directamente los pesos en ese formato. Segun los datos de evaluacion aportados por NVIDIA, la perdida de calidad frente a BF16 y FP8 es marginal en la mayoria de benchmarks, lo que permite reducir el coste de memoria y aprovechar los multiplicadores FP4 nativos de los Tensor Cores de Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LatentMoE: Mamba-2 + MoE + atencion, con MTP (Multi-Token Prediction) |
| Parametros totales | 120B segun model card; los metadatos de safetensors reportan 67.228.556.288 tensores almacenados (compatible con el empaquetado NVFP4/FP8) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (mezcla NVFP4 en lineales MoE + FP8); KV cache en FP8; proyecciones latentes, MTP, proyecciones de atencion y embeddings en mayor precision |
| Idiomas soportados | no disponible (se evalua MMLU-ProX, de caracter multilingue, pero no se listan idiomas) |
| Licencia | nvidia-nemotron-open-model-license (NVIDIA Nemotron Open Model License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura hibrida denominada LatentMoE, que combina capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos (MoE) y capas de atencion seleccionadas. Esta combinacion busca equilibrar el coste de atencion cuadratica en contextos muy largos con la capacidad de modelado de un transformer clasico. Se anade Multi-Token Prediction (MTP), que permite predecir varios tokens a la vez y se emplea habitualmente como cabeza de borrador para decodificacion especulativa. Hay disponible una cabeza MTP actualizada, nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2.

En cuanto al entrenamiento, la model card indica que el modelo fue preentrenado con una receta NVFP4, de modo que los pesos cuantizados no son un post-procesado sino el resultado del propio proceso de entrenamiento. El checkpoint liberado es una mezcla de NVFP4 en los lineales MoE y FP8 en otras partes, manteniendo en mayor precision las proyecciones latentes, la MTP, las proyecciones de atencion y los embeddings. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La cuantizacion NVFP4 combina un codebook E2M1 de FP4 con escalado por bloques en FP8 (E4M3) sobre micro-bloques de 16 elementos. El codebook E2M1 ofrece un conjunto reducido y no uniforme de magnitudes representables hasta ±6 y recurre a comportamiento de saturacion en lugar de codificaciones IEEE NaN/Inf. El uso de una escala de bloque FP8, en lugar de solo potencias de dos (E8M0), habilita escalas fraccionarias y una seleccion de escala que minimiza el error. En los Tensor Cores de Blackwell, los multiplicadores FP4 nativos explotan la simplicidad de E2M1 mientras la acumulacion en FP32 protege la precision del producto escalar.

## Capacidades

- Generacion de texto conversacional y razonamiento de varios pasos, con modo de pensamiento activable o desactivable mediante la plantilla de chat (enable_thinking).
- Razonamiento matematico y cientifico: se reportan resultados en HMMT Feb25 (con herramientas) y GPQA (sin herramientas) y SciCode.
- Generacion y comprension de codigo, con evaluaciones en LiveCodeBench v6 y Terminal Bench.
- Soporte de tool calling / function calling, integrable con los parsers qwen3_coder en SGLang y vLLM.
- Uso agentico y flujos multi-paso, evidenciado por TauBench V2 y Terminal Bench.
- Contexto muy largo, hasta 1M de tokens, con evaluacion RULER-500 a 512k.
- Capacidad multilingue parcial: se evalua MMLU-ProX, aunque no se detallan los idiomas.
- Multi-Token Prediction (MTP), utilizable para decodificacion especulativa.
- Seguimiento de instrucciones, evaluado con IFBench.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede encadenar llamadas a funciones y pasos de razonamiento, apoyandose en los parsers de herramientas de SGLang y vLLM, lo que lo hace apto para orquestadores que necesitan decidir que herramienta invocar en cada turno.
- Atencion al cliente automatizada: con hasta 1M de tokens de contexto, puede mantener conversaciones multi-turno con historial extenso sin truncar, incorporando documentacion de producto o registros previos en la misma ventana.
- Generacion y revision de codigo en produccion: su rendimiento en LiveCodeBench v6 y su soporte de function calling permiten integrarlo en pipelines de CI/CD como revisor automatizado o generador de parches.
- Analisis de documentacion extensa y RAG sobre corpus grandes: el contexto de 1M tokens y los buenos resultados en RULER-500 a 512k lo hacen adecuado para resumir o consultar contratos, informes o bases de conocimiento largas.
- Asistente tecnico de matematicas y ciencias: los resultados en HMMT Feb25 con herramientas y en GPQA sin herramientas lo orientan a resolver problemas cuantitativos paso a paso, con o sin calculadora externa.
- Despliegue de inferencia de alto rendimiento en Blackwell: al ser un checkpoint NVFP4 oficial, aprovecha los multiplicadores FP4 nativos y reduce el coste de memoria frente a BF16, adecuado para servir el modelo en un unico B200.
- Procesamiento multilingue y traduccion asistida: el modelo se evalua en MMLU-ProX, de caracter multilingue, lo que respalda su uso en tareas de comprension y generacion en varios idiomas, aunque la lista exacta de idiomas no esta disponible.
- Automatizacion de tareas de terminal y operaciones: el resultado en Terminal Bench (hard) sugiere utilidad en agentes que ejecutan comandos y gestionan entornos de linea de comandos.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA (NeMo Evaluator SDK), comparando las variantes BF16, FP8 y NVFP4. Se recomienda temperature=1.0 y top_p=0.95 para todas las tareas.

| Benchmark | BF16 | FP8 | NVFP4 |
|---|---:|---:|---:|
| MMLU-Pro | 83,73 | 83,63 | 83,33 |
| HMMT Feb25 (con herramientas) | 94,73 | 94,38 | 95,36 |
| GPQA (sin herramientas) | 79,23 | 79,36 | 79,42 |
| LiveCodeBench v6 | 78,69 | 78,44 | 78,44 |
| SciCode (subtask) | 42,05 | 41,38 | 40,83 |
| HLE (sin herramientas) | 18,26 | 17,42 | 17,42 |
| Terminal Bench (hard) | 25,78 | 26,04 | 24,48 |
| TauBench V2 (avg) | 61,15 | 61,07 | 60,46 |
| IFBench (prompt) | 72,58 | 72,32 | 73,30 |
| Arena-Hard-V2 | 73,88 | 76,06 | 76,00 |
| AA-LCR | 58,31 | 57,69 | 58,06 |
| RULER-500 @ 512k | 96,09 | 95,66 | 96,23 |
| MMLU-ProX | 79,35 | 79,21 | 79,37 |

No se han proporcionado resultados de benchmarks de modelos alternativos en la informacion disponible.

## Requisitos de hardware

- GPUs minimas declaradas: 1x B200 o 1x DGX Spark.
- Tamano del checkpoint: aproximadamente 80 GB (el repositorio ocupa 80,4 GB), por lo que la memoria de pesos debe acomodar ese volumen mas la cache KV en FP8 y las activaciones.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones de una sola GPU de gama alta convencional; requiere hardware de centro de datos con memoria unificada o HBM amplia.
- Despliegue recomendado con SGLang: python3 -m sglang.launch_server con --quantization modelopt_fp4, --mem-fraction-static 0.8 y --max-running-requests 8.
- Despliegue alternativo con vLLM (vllm==0.20.0 en el entorno upstream), con --kv-cache-dtype fp8, --enable-chunked-prefill, --mamba-ssm-cache-dtype float16 y el plugin de parser de razonamiento super_v3_reasoning_parser.py.
- La variante vLLM de ejemplo limita --max-model-len a 262144 tokens, por debajo del maximo teorico de 1M.
- Entorno de referencia upstream: imagen lmsysorg/sglang:dev-cu13-nemotronh-nano-omni-reasoning-v3.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. Como comparacion interna dentro de la misma familia, se pueden contrastar las tres precisiones del propio modelo:

| Variante | Precision | MMLU-Pro | RULER-500 @ 512k | Arena-Hard-V2 |
|---|---|---:|---:|---:|
| NVIDIA Nemotron-3-Super-120B-A12B (BF16) | BF16 | 83,73 | 96,09 | 73,88 |
| NVIDIA Nemotron-3-Super-120B-A12B (FP8) | FP8 | 83,63 | 95,66 | 76,06 |
| AxionML/Nemotron-3-Super-120B-A12B-NVFP4 (este) | NVFP4 | 83,33 | 96,23 | 76,00 |

Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- El modelo base fue entrenado con datos que pueden contener lenguaje toxico y sesgos sociales; el modelo cuantizado hereda estas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el resultado de HLE (sin herramientas) de 17,42 en NVFP4 y 18,26 en BF16 refleja un rendimiento bajo en tareas de razonamiento de maxima dificultad.
- Idiomas soportados no especificados: aunque se evalua MMLU-ProX, se desconoce la cobertura real por idioma, lo que limita afirmar un soporte multilingue amplio.
- El contexto maximo declarado es de 1M de tokens, pero los ejemplos de despliegue con vLLM lo limitan a 262144 tokens; hay que verificar el comportamiento real a contextos extremos.
- Licencia NVIDIA Nemotron Open Model License: permite uso comercial segun la model card, pero conviene revisar los terminos completos (incluidos NOTICE y el fichero de licencia incluidos en el repositorio) antes de un despliegue en produccion.
- El repositorio es un espejo sin modificaciones; la responsabilidad sobre los pesos, la licencia y el mantenimiento recae en NVIDIA, mientras que AxionML solo redistribuye.
- Requiere hardware Blackwell especifico (B200 o DGX Spark) para aprovechar la cuantizacion NVFP4; en otro hardware la eficiencia puede no materializarse.
- El recuento de parametros de safetensors (67.228.556.288) difiere de los 120B declarados en la model card, un desajuste esperable por el empaquetado en 4 y 8 bits, pero que conviene tener presente al estimar memoria.
- No se detallan datos de sesgos medidos, tokens de entrenamiento ni proceso de alineacion, lo que dificulta auditar el comportamiento en dominios sensibles.

## Enlaces

- Modelo en HuggingFace (este repositorio): https://huggingface.co/AxionML/Nemotron-3-Super-120B-A12B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Modelo NVFP4 original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Cabeza MTPv2: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Organizacion AxionML: https://huggingface.co/AxionML

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre el modelo (corresponden a paginas genericas de Google), por lo que no se han podido anadir papers, blogs o demos adicionales.
