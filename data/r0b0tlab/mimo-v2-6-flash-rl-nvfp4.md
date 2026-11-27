# r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4

## Resumen

MiMo-V2.6-Flash-RL-NVFP4 es una compilación cuantizada del modelo multimodal XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario independiente r0b0tlab. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos a NVFP4 (formato de coma flotante de 4 bits con escalas de bloque, nativo de las GPU NVIDIA Blackwell) pensada para servir el modelo en hardware DGX Spark / GB10 (SM121) mediante SGLang. El modelo base es un transformer multimodal con mezcla de expertos (MoE) de aproximadamente 159.000 millones de parámetros totales, con capacidades de texto, visión y audio, y una ventana de contexto anunciada de 524.288 tokens.

La relevancia de esta ficha radica en que documenta una ruta de despliegue concreta para un modelo de gran tamaño en hardware de consumo profesional: el autor reporta una mejora de throughput del 21% frente al checkpoint MXFP4 del proveedor, con una degradación de calidad mínima (ΔNLL de 0,0027 y Δ0,5 puntos en GSM8K-200). Incluye además escalas de calibración para la caché KV en FP8, perfiles de decodificación especulativa EAGLE MTP y un conjunto de resultados de sistemas publicados en un repositorio de evaluación propio.

Es importante subrayar que esta es una build de cuantización de terceros, no una release oficial de Xiaomi, y que la información disponible sobre el modelo base (datos de entrenamiento, composición del dataset, detalles de RLHF) no está incluida en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); vision tower y tokenizador de audio en BF16 |
| Parametros totales | 159.358.725.504 (≈159,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens (contexto anunciado en el perfil de servicio preferido) |
| Tipos de cuantizacion | NVFP4 (E2M1, bloque 16) en expertos enrutados y lineales densos; FP8 con escalas por tensor donde aporta; BF16 en pesos auxiliares no cuantizados (555 tensores); caché KV en FP8 e4m3 con escalas calibradas por capa |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (24 shards, 187,2 GB de repositorio), con `hf_quant_config.json` para autodetección del motor (modo híbrido FP8+NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con capas MoE, según se deduce de la presencia de "expertos enrutados" en la descripción de la cuantización y de los tensores auxiliares de visión, audio y `nextn` (cabeza de predicción multi-token). La información proporcionada no detalla el número de capas, la dimensión oculta, el número de expertos ni el ratio de activación, por lo que esos datos deben considerarse no disponibles en esta ficha. El checkpoint incluye además pesos de draft fusionados DFlash (5 capas KV) y soporte para decodificación especulativa EAGLE MTP.

En cuanto al entrenamiento, la información disponible solo indica que el modelo base es MiMo-V2.6-Flash-RL, con el sufijo "RL" que sugiere una fase de aprendizaje por refuerzo, pero no se especifican tokens de entrenamiento, composición del corpus ni detalles de RLHF/DPO. La innovación técnica documentada en esta build es la metodología de cuantización: calibración con 512×512 filas de un corpus interno (NLL 1,5317 tras calibración), política de escalas de activación por capa denominada `peer_headroom` seleccionada mediante scoring QDQ estilo runtime, conversión de expertos MXFP4 a NVFP4 verificada bit-exacta (0 bloques no exactos entre 9,46 B comparados), y escalas de caché KV calibradas por capa e idénticas entre rangos de tensor-parallel por construcción.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto muy larga (hasta 524.288 tokens anunciados).
- Procesamiento multimodal: visión (vision tower en BF16) y audio (tokenizador de audio en BF16).
- Razonamiento matemático, con un modo "thinking" activable o desactivable (`enable_thinking`).
- Generación de código, evidenciada por los resultados de HumanEval en el harness del autor.
- Tool calling / function calling, con parser dedicado (`--tool-call-parser mimo`) y verificación en la lane Canary del benchmark.
- Soporte de agentes y razonamiento multi-paso, medido con BFCL multi-turn y BFCL AST.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Decodificación especulativa integrada mediante EAGLE MTP (3 pasos, 4 tokens draft, top-k 1, ventana de draft 4096) y pesos DFlash fusionados en el checkpoint.
- Recuperación exacta en contexto largo (NIAH 3/3 exacto a profundidades de 131.008, 262.016 y 471.628 tokens).

## Casos de uso

- Análisis de documentos extensos y bases de código completas: con 524.288 tokens de contexto y NIAH exacto hasta ~471.000 tokens, el modelo puede ingerir repositorios o expedientes completos sin chunking, manteniendo coherencia entre secciones distantes.
- Asistentes de atención al cliente multi-turno: el soporte de tool calling con parser dedicado y la ventana larga permiten mantener historiales de conversación extensos y consultar sistemas externos (pedidos, CRM) en la misma sesión.
- Agentes autónomos con razonamiento multi-paso: los resultados de BFCL (multi-turn 114/200, AST paralelo 101/200) indican que puede encadenar llamadas a herramientas, aunque con margen de mejora en casos de múltiples funciones en paralelo.
- Generación y revisión de código en pipelines: HumanEval 38/40 en el harness del autor y soporte de function calling lo hacen apto para tareas de autocompletado, revisión y generación de tests dentro de flujos de CI, siempre con validación humana.
- Procesamiento de reuniones y material audiovisual: la presencia de vision tower y tokenizador de audio permite transcribir, resumir y responder preguntas sobre vídeo o audio combinados con texto largo.
- Despliegue en infraestructura compacta: el perfil TP=2 sobre dos nodos GB10 con 69,1 tok/s agregados a bs=8 permite servir un modelo de 159 B en hardware de sobremesa profesional, útil para prototipado y entornos de investigación con presupuesto limitado.
- Evaluación de razonamiento matemático asistido: el modo thinking permite resolver problemas de competición, aunque los fallos documentados (hard-04 y hard-12) aconsejan verificación automática de resultados.

## Benchmarks y rendimiento

| Prueba | Vendor MXFP4 | Esta NVFP4 | Veredicto |
|---|---|---|---|
| NLL, 32.768 tokens de calibración | 1,3360 | 1,3387 | Δ 0,0027 (< 0,05) PASS |
| GSM8K-200, thinking off, temp 0 | 0,970 | 0,965 | Δ 0,5 pt PASS |
| Throughput decode, bs=8, 2×GB10 | 52,0–60,8 tok/s (mediana 56,9) | 63,7–73,5 tok/s (mediana 69,1) | +21% |
| Integridad del checkpoint | — | 0 tensores no coincidentes en 24 shards (36.096 lineales cuantizados) | PASS |

Resultados de sistemas (r0b0bench, perfil systems, FINAL3-500k, 2×GB10 TP=2, think-off):

| Lane | Resultado |
|---|---|
| Canary | PASS 5/5, incluida la comprobación de tool-call |
| BFCL multi-turn | 114/200 (0,570) |
| BFCL AST multiple | 71/200 |
| BFCL AST parallel | 101/200 |
| BFCL AST parallel_multiple | 39/200 |
| BFCL AST micro | 211/600 (0,352) |
| Latencia | TTFT 254 ms, inter-token 159 ms |
| Concurrencia agregada | c1 50,2; c2 66,0; c4 91,6; c6 159,6 tok/s |
| Throughput | decode C1 mediana 15,48 tok/s; prefill mediano 16.535 tok/s con 22.771 tokens de prompt |
| NIAH | 3/3 exacto a profundidades 131.008, 262.016 y 471.628 |

Resultados de texto Q200v2 (text-180, think-off, workers 1, max tokens 8192): GSM8K 78/80, HumanEval 38/40, IFEval 35/40, y revisión independiente de 20 respuestas de razonamiento difícil: 17/20.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 187,2 GB en safetensors; con caché KV en FP8 y contexto largo, el requisito real supera esa cifra. El perfil de servicio documentado usa dos nodos GB10 con tensor-parallel 2, lo que implica al menos ~2×128 GB de memoria unificada.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (SM121) es el objetivo explícito de esta build; también son candidatas GPU Blackwell con soporte NVFP4 (B200, GB200) y, con limitaciones, H100/A100 mediante rutas alternativas no documentadas aquí.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB; el tamaño del checkpoint y las escalas de bloque lo impiden.
- Opciones de despliegue: SGLang (nightly `582389ce`) con `--tp-size 2 --ep-size 2 --moe-runner-backend marlin --mem-fraction-static 0.90 --context-length 524288 --tool-call-parser mimo`; imagen pública `ghcr.io/r0b0tlab/sglang-mimo26-env`, tag preferido `20260922-582389ce-mtp-mm`. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: TTFT 254 ms e inter-token 159 ms en el perfil systems; decode single-stream 15,48 tok/s; agregado bs=8 de 69,1 tok/s (mediana); prefill de 16.535 tok/s con prompt de 22.771 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-NVFP4 (esta build) | ≈159,4 B | 524.288 | NVFP4 + FP8 KV | MIT | Hugging Face, SGLang |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | ≈159,4 B (presumiblemente) | no disponible | BF16 (presumiblemente) | no disponible en esta ficha | Hugging Face |
| Checkpoint vendor MXFP4 (referencia del autor) | ≈159,4 B | no disponible | MXFP4 | no disponible en esta ficha | Uso interno del proveedor |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- Es una cuantización de terceros: no es una release oficial de Xiaomi y el autor declara una implementación independiente basada solo en APIs upstream (ModelOpt, SGLang).
- Idiomas: solo inglés y chino según la model card; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Alucinación: los fallos documentados en razonamiento difícil (hard-04 respondió 19208/715 cuando el determinante 4x4 de Hilbert es 1/6048000; hard-12 afirmó que todo grafo de grado mínimo 2 tiene ciclo) muestran errores graves en matemáticas y teoría de grafos que exigen verificación.
- Tool calling: el rendimiento en AST es bajo en varias categorías (parallel_multiple 39/200, micro 0,352), lo que limita su uso en agentes con múltiples herramientas en paralelo.
- Reproducibilidad de benchmarks: el autor reconoce que siete filas multi-turno se regeneraron tras timeouts de 1200 s, que el resumen de lane apuntaba erróneamente a un archivo y que Q200v2 text-180 no se remidió en el arranque MTP, sino que se conservó de un serve anterior.
- Hardware restringido: requiere GPU Blackwell con soporte NVFP4 y, en la configuración documentada, dos nodos GB10; no es desplegable en GPU de consumo.
- Licencia MIT: permite uso comercial, pero al ser una build derivada conviene verificar la licencia del modelo base, no disponible en esta ficha.
- Estabilidad del stack: depende de una nightly concreta de SGLang y de una imagen de contenedor concreta; cambios de versión pueden romper la configuración.
- Caché KV en FP8: aunque calibrada por capa, introduce una pérdida de precisión adicional frente a BF16 que no se cuantifica en los benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio de campaña, evidencias y logs: https://github.com/r0b0tlab/mimo26-nvfp4-sm121
- Ledger de benchmarks r0b0bench: https://github.com/r0b0tlab/r0b0bench/blob/2fe1f6da92c626860e77f955bd978eca565547fd/results/entries/mimo26-nvfp4-final3-500k-systems-20260925.json
- SGLang: https://github.com/sgl-project/sglang
- NVIDIA ModelOpt: no disponible como enlace directo en la información proporcionada
- Imagen de contenedor: `ghcr.io/r0b0tlab/sglang-mimo26-env` (tag `20260922-582389ce-mtp-mm`, digest `sha256:84857252a1a9b4196702154ae38eb3cfafdf4cd832795eba18ac2772f8a83f1e`)
