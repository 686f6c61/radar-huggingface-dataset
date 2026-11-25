# Grawnch/Hy4-Flash-WV-NVFP4-Hybrid-SM120

## Resumen

Hy4-Flash-WV-NVFP4-Hybrid-SM120 es una cuantización híbrida de precisión mixta del modelo multimodal tencent/Hy4-flash, publicada por el usuario Grawnch. El modelo base es un transformer de mezcla de expertos (MoE) con 220,25B de parámetros activos, una torre de visión SigLIP2 en BF16 exacto y un drafter especulativo DFly2 de 0,85B. La aportación del autor es un esquema de cuantización propio (WV-v6.7) que combina NVFP4 rotado de dos niveles para los expertos enrutados con un cuantizador vectorial 4D VQ-4096 para las proyecciones de salida, manteniendo capas densas críticas en SWZ8_G32 de 8,50 bpw.

La relevancia del checkpoint es de ingeniería: reduce el peso del backbone en GPU a 83,15 GB (77,44 GiB) y el total en disco a 147,83 GB, lo que permite que un modelo de más de 220B de parámetros activos quepa en una única RTX PRO 6000 de 96 GB con margen para caché KV y drafter. Está compilado específicamente para la arquitectura Blackwell SM120a mediante kernels QMMA nativos y decodificación especulativa cerrada.

La licencia es la tencent-hy-license (marcada como "other"), heredada del modelo base, y el repositorio usa una librería propietaria de servicio (qfn_sm120_unified v22.7.0) con soporte para Linux x86_64 y Windows amd64. No se dispone de información sobre los idiomas soportados ni sobre la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión), con drafter especulativo DFly2 y torre SigLIP2 ViT |
| Parametros totales | no disponible (220,25B activos según model card) |
| Parametros activos | 220,25B (backbone) + 0,85B (drafter DFly2) |
| Longitud de contexto | no disponible (evaluado hasta 8K en benchmarks) |
| Tipos de cuantizacion | NVFP4 rotado de dos niveles (4,5000 bpw), VQ-4096 4D (3,3125 bpw), SWZ8_G32 (8,50 bpw), BF16 exacto (ViT), fp8_exact (Engram); media del backbone 3,9650 bpw |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (repo de 147,8 GB) + wheel propietario qfn_sm120_unified |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer de mezcla de expertos con atención multi-cabeza latente (MLA), expertos compartidos y un total de 220,25B de parámetros activos. Incluye una torre de visión SigLIP2 en BF16 exacto y un componente denominado Engram en fp8_exact mapeado en memoria del host. Sobre esta base, el autor aplica un esquema de cuantización post-entrenamiento denominado WV-v6.7 que combina varias técnicas: NVFP4 rotado de dos niveles con escalas de bloque UE4M3/16 y transformada FWHT-128 en el dominio Snake P_pi para los expertos "calientes" y proyecciones de alto jacobiano, un cuantizador vectorial 4D VQ-4096 de 16 KB de SMEM para las proyecciones de salida en modo MODE3, parches SVD de rango 8 sobre down_proj (Top-32) y SWZ8_G32 para capas densas, expertos compartidos, embed_tokens y lm_head.

El proceso de cuantización usa hessianos secuenciales en cascada Gate/Up → Down y un drafter especulativo DFly2 recalibrado en bucle cerrado. El resultado declarado es una media de 3,9650 bpw en el backbone, con un error de salida MoE (Rel-MSE) de 0,0329 % frente a la referencia BF16, que el autor cifra en 27,4 veces menos que un NVFP4 estándar sin datos. Los kernels están compilados para SM120a (Blackwell) usando instrucciones QMMA.16832.F32.E4M3.E2M1 en prefill y lotes grandes, y __dp4a en registros sin SMEM para decodificación con M < 16. No se especifican en la información disponible el número de tokens de entrenamiento original ni la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento matemático y de código con modo "thinking" extendido (evaluado con 150K tokens de pensamiento en AIME-2025).
- Generación y comprensión de código en lenguajes de programación (evaluado en LiveCodeBench v6).
- Comprensión de imágenes y respuesta visual a preguntas (VQA) mediante la torre SigLIP2 ViT.
- Entrada multimodal image-text-to-text.
- Soporte de tool calling y function calling, con salida JSON Schema validada por FSM en GPU (verificado con `<tool_calls:opensource>`).
- Decodificación especulativa cerrada con drafter DFly2 y verificación híbrida por árbol (SAM), con paridad greedy 96/96 frente a M=1.
- Recuperación exacta multi-needle en contextos largos (verificado a 21.606 tokens con 3/3 aciertos).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia conversacional de largo contexto: el modelo mantiene recuperación exacta multi-needle a 21.606 tokens y decodifica a 49,3 tok/s en esa ventana, lo que permite usarlo en atención al cliente o asistentes con historiales extensos.
- Generación de código en producción: con 86,29 % en LiveCodeBench v6 y soporte de tool calling con JSON Schema validado por FSM, puede integrarse en pipelines de CI/CD para revisión, generación de parches y ejecución de herramientas.
- Razonamiento matemático avanzado: el modo de pensamiento extendido (150K tokens) y el 100 % en AIME-2025 lo hacen adecuado para resolución de problemas competitivos y verificación formal de soluciones.
- Análisis de documentos con imágenes: la torre SigLIP2 en BF16 exacto permite responder preguntas sobre capturas, gráficos o diagramas combinados con texto largo.
- Despliegue en una sola GPU de 96 GB: al caber en una RTX PRO 6000 con unos 16 GiB de margen para caché KV, sirve para prototipado e inferencia de un modelo de 220B activos sin clúster multi-GPU.
- Servicio de inferencia por lotes con throughput alto: alcanza 196,51 tok/s con lote 32 en secuencias de 512 tokens, útil para generación masiva offline o pipelines de datos sintéticos.
- Agentes multi-paso con herramientas: la combinación de tool calling, razonamiento extendido y verificación especulativa permite construir agentes que encadenan llamadas a APIs con latencia controlada (TTFT de 458 ms con caché de prefijo).

## Benchmarks y rendimiento

Resultados medidos por el autor frente a la referencia BF16 fp8_exact en Blind-Val:

| Split | Tokens | PPL BF16 | PPL WV-v6.7 (delta) | KLD | Top-1 | Top-5 |
|---|---|---|---|---|---|---|
| 2K Overall (B=1) | 16376 | 13,4214 | 11,9456 (-1,4758) | 0,22712 | 90,413 % | 97,869 % |
| 2K WikiText-2 | 4094 | 29,2581 | 24,7954 (-4,4627) | 0,25598 | 87,396 % | 97,875 % |
| 2K Code held-out | 4094 | 40,1816 | 34,3671 (-5,8146) | 0,53013 | 83,317 % | 94,797 % |
| 2K Self-Gen Math/Code | 8188 | 5,1584 | 4,8883 (-0,2701) | 0,07413 | 95,09 % | 99,402 % |
| 8K Overall | 16382 | 34,8908 | 30,8164 (-4,0744) | 0,34514 | 84,538 % | 97,168 % |

Benchmarks de capacidad y sistema:

| Prueba | Resultado |
|---|---|
| AIME-2025 (30/30, temp=0,9, 150K think) | 100,0 % (30/30, 0 bucles) |
| LiveCodeBench v6 (175 problemas) | 86,29 % (Easy 100 % / Med 92,31 % / Hard 75,0 %) |
| Multi-needle 21.606 tokens | 3/3 (100 %), prefill 37,64 s, decode 49,3 tok/s |
| Paridad greedy DFly2 + SAM vs M=1 | 96/96 (100 %) |
| JSON Schema FSM + VQA SigLIP2 | 4/4 (100 %) |
| Throughput 512 tokens (B=1/4/8/16/32) | 22,03 / 95,05 / 133,41 / 173,25 / 196,51 tok/s |
| Throughput 8K (B=1/2/4/8/16) | 22,85 / 41,17 / 51,39 / 65,56 / 91,21 tok/s |
| TTFT SSE en frío (128/512/2048/4096/8192 tok) | 458,43 / 736,84 / 2689,07 / 5526,79 / 9203,75 ms |

## Requisitos de hardware

- GPU: exclusivamente Blackwell SM120a (RTX PRO 6000 de 96 GB verificada). No hay soporte declarado para arquitecturas anteriores.
- VRAM estimada: 83,15 GB (77,44 GiB) para el backbone en GPU, más caché KV y drafter; el autor indica unos 16+ GiB de margen en la RTX PRO 6000 de 96 GB.
- Disco: 147,83 GB totales incluyendo Engram.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en A100/H100 (arquitectura no SM120a).
- Despliegue: servidor propio qfn_sm120_unified v22.7.0 (wheels para Linux x86_64 cp313 y Windows amd64 cp311), compatible con API OpenAI y Open-WebUI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: TTFT en frío de 458 ms a 128 tokens y 9,2 s a 8192 tokens; 196,51 tok/s en lote 32 con secuencias de 512 tokens; 22,03 tok/s en decodificación especulativa B=1.

## Comparativa con modelos similares

| Modelo | BPW / precisión | Peso en GPU | Disco total | Fit en 96 GB | Rel-MSE MoE | Top-1 Math/Code |
|---|---|---|---|---|---|---|
| Hy4-Flash-WV-NVFP4-Hybrid-SM120 (este) | 3,9650 bpw | 83,15 GB | 147,83 GB | Sí (16+ GiB libres) | 0,0329 % | 95,09 % |
| NVFP4 AngelSlim / Avifenesh / atakans | 4,5000 bpw | ~95–100 GB | 159,6–164,7 GB | Ajustado / OOM con KV y drafter | 0,9023 % | < 94 % |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE multimodal de más de 200B activos) en la información proporcionada.

## Limitaciones y advertencias

- Acoplamiento total a hardware Blackwell SM120a: los kernels son SASS-only para sm_120a, por lo que el modelo no se ejecuta en A100, H100, RTX 4090 ni arquitecturas AMD.
- Dependencia de una librería propietaria (qfn_sm120_unified) con wheels solo para Linux x86_64 y Windows amd64; no hay integración con ecosistemas estándar como vLLM, llama.cpp, Ollama o TGI.
- Licencia tencent-hy-license (other): es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- Longitud de contexto no declarada; las evaluaciones llegan a 8K y a 21.606 tokens en la prueba multi-needle, sin garantía más allá.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo ni de robustez frente a contenido adversario.
- Los benchmarks los ha medido el propio autor contra su referencia BF16; no hay validación independiente.
- El esquema de cuantización es agresivo (3,9650 bpw de media) y puede degradar tareas no cubiertas por las splits de validación (prosa, código, matemáticas).
- El tamaño del repositorio (147,8 GB) y la necesidad de una GPU de 96 GB limitan su uso a entornos con hardware muy específico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-WV-NVFP4-Hybrid-SM120
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Logits de referencia BF16: https://huggingface.co/Grawnch/Hy4-Flash-BF16-Reference-Logits
