# jpsequeira/GLM-5.2-EXL3-TR3-3.40bpw-KVarN-K4V2

## Resumen

GLM-5.2-EXL3-TR3-3.40bpw-KVarN-K4V2 es un checkpoint de inferencia optimizado para servir el modelo GLM-5.2 de zai-org en cuatro GPU RTX PRO 6000 Blackwell de 96 GB. Lo publica jpsequeira como parte de la linea comunitaria de cuantizaciones EXL3 Trellis para este hardware, con una filosofia distinta a la de otros checkpoints: prioriza la fidelidad medida frente al modelo BF16 (menor KLD publicada) y maximiza el contexto utilizable (512K nativo) mediante una cache KV propietaria llamada KVarN K4V2, mas compacta y precisa que las alternativas NVFP4 o FP8. El checkpoint esta disenado para cargas de trabajo de codificacion, razonamiento y agentes, con soporte de decodificacion especulativa MTP3 y un backend de atencion esparsa MLA denominado b12x, integrado en un fork de vLLM.

El checkpoint cuantiza los expertos enrutados del MoE a una media de 3.40 bits por peso (escala TR3), con un esquema de promocion por activaciones que eleva algunos expertos a MCG4 (4 bits) segun su impacto medido en tareas de codigo y razonamiento. Los componentes densos y sensibles se mantienen en BF16. El resultado es un modelo de 174.259 millones de parametros en safetensors (el modelo base declara 756B en su configuracion original) que cabe en 348.7 GB de almacenamiento y se sirve a 86-91 tokens por segundo en decodificacion con cuatro GPU.

La relevancia de este checkpoint reside en que empuja el equilibrio entre calidad, contexto y consumo energetico en hardware de gama alta de consumo: 290 W totales, 512K de contexto nativo y una KLD de 0.0558 frente al BF16, la mas baja publicada para GLM-5.2 en formato EXL3. Incluye tambien la cabeza MTP (layer 78) fusionada nativamente, lo que elimina la necesidad de un directorio de draft separado y simplifica el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion MLA esparsa (backend b12x), basada en GLM-5.2 de zai-org |
| Parametros totales | 174.259.213.568 (checkpoint cuantizado; modelo base declara 756B segun la model card) |
| Parametros activos | no disponible (modelo MoE, no se especifica el numero de expertos activos) |
| Longitud de contexto | 512K nativo (768K bootable) |
| Tipos de cuantizacion | EXL3 Trellis MCG3/MCG4 a 3.40 bpw de media (expertos enrutados); componentes densos en BF16; cache KV KVarN K4V2 (290 B/token/layer) |
| Idiomas soportados | no disponible (el modelo base GLM-5.2 de z.ai soporta chino e ingles, pero no se especifica en este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se construye sobre GLM-5.2, un modelo MoE con atencion MLA (Multi-head Latent Attention) y una cabeza MTP (Multi-Token Prediction) en la capa 78. La cuantizacion EXL3 Trellis aplica un esquema de codigos mixtos (MCG3 como base y MCG4 como techo de promocion) a los expertos enrutados, seleccionando los candidatos a promocion segun la alineacion de activaciones medida en cargas de codificacion, razonamiento y agente. Los componentes densos y sensibles se mantienen en BF16. La cache KV KVarN K4V2 utiliza registros latentes de 290 bytes por token y capa con un dtype autodescriptivo (`kvarn_mla_k2_g64`), disenado desde el inicio del proyecto para reducir el tamano de la cache sin sacrificar fidelidad.

El backend b12x (B12X_MLA_SPARSE) implementa atencion MLA esparsa con un indexador top-k paginado, recopilacion CKV en prefill y decodificacion DCP4 empaquetada directamente. El runtime base es un fork de vLLM de `local-inference-lab` que integra b12x, KVarN y kernels sparkinfer en una imagen Docker unica. La decodificacion especulativa MTP3 esta fusionada nativamente en el checkpoint (capa 78), con un coste de aceptacion medido de cero (AL 2.85/2.84 en banda). El entrenamiento original de GLM-5.2 no se documenta en este checkpoint; solo se describe el proceso de cuantizacion y validacion.

## Capacidades

- Generacion de texto y razonamiento complejo, optimizado para tareas de codificacion y agentes segun el criterio de promocion de activaciones.
- Soporte de tool calling y function calling: el modelo base GLM-5.2 incluye estas capacidades, y el checkpoint las hereda, aunque no se documentan pruebas especificas en este repositorio.
- Soporte de agentes y multi-step reasoning: la promocion de expertos se peso con evidencia de cargas agente, y el contexto largo de 512K permite mantener historiales extensos.
- Capacidades multilingues: no documentadas para este checkpoint; el modelo base de z.ai soporta chino e ingles.
- Capacidades especiales: decodificacion especulativa MTP3 integrada, cache KV KVarN K4V2 de alta fidelidad, contexto nativo de 512K (768K bootable), backend de atencion esparsa b12x.
- Rendimiento en contexto largo: 29/30 respuestas correctas en estonia-long con prompts de 133K tokens.

## Casos de uso

- Desarrollo de agentes de codificacion autonomos: el checkpoint esta disenado para cargas agente con contexto largo, permitiendo que un agente mantenga un historial de 512K tokens de interacciones, lecturas de repositorios y resultados de ejecucion sin perder fidelidad.
- Generacion de codigo en produccion con revision humana: con 86-91 tok/s de decodificacion y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar parches, revisar diffs o autocompletar funciones en repositorios grandes.
- Razonamiento multi-paso sobre documentos extensos: la ventana de 512K permite procesar libros tecnicos completos, documentacion de API o expedientes legales en una sola pasada, con prefill de 2.4-2.5k tok/s para indexar rapidamente el contenido.
- Asistente de investigacion con contexto largo: un sistema que recopila articulos, notas y resultados de experimentos (hasta 133K tokens demostrados) y produce resumenes o respuestas razonadas manteniendo coherencia global.
- Servicio de inferencia local de alta gama: pensado para equipos con cuatro GPU RTX PRO 6000 Blackwell, ofrece un perfil de consumo de 290 W y un rendimiento estable, adecuado para laboratorios que necesitan ejecutar un modelo de 756B sin depender de la nube.
- Evaluacion de calidad de cuantizacion: el procedimiento de KLD archivado en `-assets/kld/` permite reproducir las mediciones de fidelidad, util para investigadores que comparan esquemas de cuantizacion EXL3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint especifico. Los datos disponibles son mediciones de fidelidad frente al modelo BF16 y de rendimiento de servicio, recogidos en la model card:

| Metrica | Valor |
|---|---|
| KLD vs BF16 (TR3 3.40 bpw + KVarN K4V2) | 0.0558 |
| KLD vs BF16 (TR3 3.40 bpw + KVarN K4 418 B) | 0.0558 |
| KLD vs BF16 (TR3 3.40 bpw + KVarN K5 482 B) | 0.0554 |
| Long-context estonia-long (133K tokens) | 29/30 respuestas correctas |
| Decode C1 | 86-91 tok/s (wall 32-34 ms, AL 2.9) |
| Decode C2 / C4 (pool 256K) | 104 / 168 tok/s |
| Prefill 8K-64K | 2.4-2.5k tok/s |
| TTFT 32K | ~13.5 s |

Para referencia, el modelo base GLM-5.2 (sin cuantizar) obtiene 81.0 en Terminal-Bench 2.1 y 62.1 en SWE-bench Pro, segun el blog de z.ai, pero estos resultados no se han verificado en este checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada: 4 GPU de 96 GB cada una (384 GB totales), con TP4/DCP4 y 290 W de consumo total.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB) en configuracion de cuatro unidades; no cabe en GPU de consumo (RTX 4090, 3090, etc.) por el tamano del modelo y la cache KV.
- Opciones de despliegue: imagen Docker publica `jmpsequeira/glm52-kvarn-k4v2:tr3` con el fork de vLLM de `local-inference-lab`; se requiere el flag `VLLM_EXL3_TRELLIS_MIN_M=1` y la configuracion de entorno documentada en `boot-from-image.sh` (TP=4, DCP=4, MTP=3, MAX_NUM_SEQS=1, MAX_BATCHED_TOKENS=2048, MAX_MODEL_LEN=512000, NUM_GPU_BLOCKS=2000, GPU_MEMORY_UTILIZATION=0.984, backend B12X_MLA_SPARSE, kv_cache_dtype kvarn_mla_k2_g64).
- Latencia y throughput: decode 86-91 tok/s (C1), 104 tok/s (C2), 168 tok/s (C4) con pool de 256K; prefill 2.4-2.5k tok/s; TTFT para 32K tokens ~13.5 s.
- Almacenamiento: 348.7 GB para el repositorio de pesos; se recomienda un NVMe rapido para la carga inicial.
- Requisitos adicionales: un switch PCIe para las cuatro GPU, memoria host suficiente para el runtime de vLLM y los kernels sparkinfer.

## Comparativa con modelos similares

Este checkpoint compite con otras cuantizaciones EXL3 de GLM-5.2 para el mismo hardware. La tabla siguiente compara los datos publicados en las model cards respectivas:

| Checkpoint | bpw medio | Cache KV | KLD vs BF16 | Contexto | Consumo |
|---|---|---|---|---|---|
| jpsequeira/GLM-5.2-EXL3-TR3-3.40bpw-KVarN-K4V2 | 3.40 | KVarN K4V2 (290 B/token) | 0.0558 | 512K nativo | 250-290 W |
| brandonmusic/GLM-5.2-EXL3-TR3v4-3.5bpw-MTP78 | 3.50 | no especificado | 0.0613 ± 0.0014 (procedimiento distinto) | no especificado | no especificado |
| willfalco/GLM-5.2-EXL3-TR3-3.42bpw | 3.42 | FP8 (656 B) o NVFP4 MLA (368 B) | 0.0741 (FP8) / 0.1080 (NVFP4) | no especificado | no especificado |

La comparativa directa de KLD no es un leaderboard porque los procedimientos de medicion difieren entre autores, como advierte la propia model card. El checkpoint de jpsequeira destaca por la cache KV mas compacta (290 B/token) y el contexto mas largo (512K), a costa de una ligera reduccion de ancho de bits frente a brandonmusic (3.40 vs 3.50 bpw). La orientacion de la promocion de expertos (codigo, razonamiento, agente) lo hace mas adecuado para esas tareas que para uso general o legal, donde brandonmusic declara un enfasis mas amplio.

## Limitaciones y advertencias

- Licencia no disponible: no se indica la licencia del checkpoint ni del modelo base GLM-5.2 en la informacion proporcionada; antes de usar en produccion, verifica los terminos de z.ai para GLM-5.2 y los del autor del checkpoint.
- Sesgos conocidos: no documentados; al ser un checkpoint cuantizado del modelo base, hereda los sesgos de GLM-5.2, que no se detallan en este repositorio.
- Riesgo de alucinacion: no evaluado en este checkpoint; las mediciones de KLD no cubren la veracidad factual.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base de z.ai soporta principalmente chino e ingles, por lo que otros idiomas pueden tener un rendimiento inferior.
- Requisitos de hardware muy especificos: el checkpoint esta optimizado para cuatro RTX PRO 6000 Blackwell con TP4/DCP4; no funcionara en configuraciones de una o dos GPU, y el backend b12x requiere el fork de vLLM de `local-inference-lab`; no es compatible con vLLM estandar.
- DCP1 no soportado: la decodificacion DCP1 falla en configuracion con KVarN; solo DCP2 y DCP4 estan validados.
- Sin soporte de prefix caching: la configuracion recomendada desactiva el prefix caching, lo que puede afectar a cargas con solicitudes repetitivas.
- Contexto bootable de 768K: aunque se puede arrancar con 768K, el perfil validado es de 512K; superarlo puede degradar el rendimiento o la estabilidad.
- Sin benchmarks estandar: no hay resultados de MMLU, HumanEval, etc. para este checkpoint, lo que dificulta comparar su calidad con otros modelos fuera del contexto EXL3.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/jpsequeira/GLM-5.2-EXL3-TR3-3.40bpw-KVarN-K4V2
- Checkpoint de referencia de willfalco: https://huggingface.co/willfalco/GLM-5.2-EXL3-TR3-3.40bpw
- Checkpoint de referencia de brandonmusic: https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw
- Blog de z.ai sobre GLM-5.2: https://z.ai/blog/glm-5.2
- Repositorio oficial de GLM-5/5.1/5.2: https://github.com/zai-org/GLM-5
- Repositorio de exllamav3 (biblioteca de cuantizacion e inferencia): https://github.com/turboderp-org/exllamav3
