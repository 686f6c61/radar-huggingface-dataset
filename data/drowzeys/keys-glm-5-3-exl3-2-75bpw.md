# drowzeys/keys-GLM-5.3-EXL3-2.75BPW

## Resumen

keys-GLM-5.3-EXL3-2.75BPW es una cuantización de precisión mixta del modelo GLM-5.3 de zai-org, publicada por el usuario drowzeys. Se trata de un checkpoint EXL3 (formato de exllamav3 basado en trellis) que reduce los pesos originales en BF16 a una media de 2,75 bits por peso (bpw) en los expertos enrutados, manteniendo en BF16 los componentes críticos como el router, las normas, los embeddings, el `lm_head` y las proyecciones `kv_b`. El objetivo declarado es servir el modelo completo de 753B en cuatro estaciones NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) con espacio para una reserva de KV de 200K tokens.

El modelo base, GLM-5.3, es un transformer de mezcla de expertos (MoE) con arquitectura `glm_moe_dsa` y 753.000 millones de parámetros totales. La cuantización no modifica ni reentrena los pesos: parte del checkpoint BF16 original y aplica una asignación de anchura de bits por experto (2, 3 o 4 bits) según una política registrada en `quantization_config.json`. El resultado son 81 shards safetensors que suman 258 GB, aproximadamente 277 GB de repositorio.

La relevancia de esta ficha radica en que documenta una de las pocas rutas prácticas para ejecutar un modelo de 753B en hardware de consumo profesional (DGX Spark) sin recurrir a clústeres de A100/H100. Incluye un motor de inferencia específico (TensorFold) con paralelismo tensorial 4, decodificación especulativa mediante la capa MTP del propio modelo y cifras de rendimiento medidas en ese hardware concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm_moe_dsa`), con capa MTP (multi-token prediction) en la capa 78 |
| Parametros totales | 138.092.850.560 (según safetensors del repo cuantizado); el modelo base GLM-5.3 declara 753B |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens verificados con needles a 115K, 456K y 905K; reserva KV de 200K por defecto |
| Tipos de cuantizacion | EXL3 trellis `mul1`, anchura por experto: 2-bit (5.436 expertos), 3-bit (13.128), 4-bit (636), media 2,75 bpw; capa MTP a 8 bits; atención, expertos compartidos, MLPs densos e indexer `wq_b` a 5 bits; `kv_b`, `wk`, `weights_proj`, router, normas, embeddings y `lm_head` en BF16 |
| Idiomas soportados | en, zh |
| Licencia | `glm-5.3` (license: other; enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (81 shards, 258 GB), EXL3 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos denominada `glm_moe_dsa`, con 256 expertos enrutados por capa en las capas 3 a 77 y expertos compartidos. La cuantización conserva la estructura completa y aplica compresión selectiva: los expertos enrutados reciben anchuras individuales de 2, 3 o 4 bits (media 2,75 bpw), mientras que los componentes sensibles a la precisión permanecen en BF16 o 5 bits. La capa MTP (capa 78) se mantiene a 8 bits para preservar su función de borrador especulativo.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada. La model card solo documenta el proceso de cuantización, no el entrenamiento del modelo base. Como innovación técnica destacable, el checkpoint incluye la capa MTP nativa que actúa como modelo borrador para decodificación especulativa sin necesidad de un draft externo; opcionalmente se puede usar DFlash2 (incoai/GLM-5.3-DFlash2, licencia CC BY-NC-ND 4.0) como borrador alternativo. La proyección `kv_a_proj_with_mqa` se almacena con anchura 640 (576 salidas reales más relleno de ceros hasta el tile de 128 columnas).

## Capacidades

- Generación de texto conversacional y de razonamiento: el modelo base es un modelo de razonamiento y las cifras publicadas se miden con "thinking on".
- Generación de código: se han publicado benchmarks de velocidad específicos para prosa y código.
- Contexto largo: soporta hasta 1M tokens con needles verificados a 115K, 456K y 905K.
- Decodificación especulativa mediante MTP propio (por defecto) o DFlash2 opcional.
- Prompt reuse / caché de prefijo: reenvío idéntico en 0,15 s; nuevo turno con system prompt de 14,7K en 0,38 s.
- Servidor compatible con OpenAI en el rango 0 (puerto 8890) mediante TensorFold.
- Soporte de agentes: probado con frameworks Hermes y OpenClaw con `PARALLEL=4 CONTEXT=32768`.
- Capacidades multilingües limitadas a inglés y chino según los tags del repo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Servicio de razonamiento en contexto largo sobre cuatro DGX Spark: el checkpoint está dimensionado para caber en 4×128 GB con reserva KV de 200K, lo que permite desplegar un modelo de 753B en hardware de sobremesa profesional sin clúster de datacenter.
- Atención al cliente con conversaciones multi-turno: el prompt reuse reduce el coste de reenvío de system prompts largos (0,38 s con 14,7K tokens frente a 13,5 s sin caché), lo que hace viable mantener conversaciones con contexto de decenas de miles de tokens.
- Análisis de documentos extensos y needles en 1M de tokens: útil para auditoría de contratos, revisión de códigos legales o búsqueda semántica en corpus muy grandes, con decode sostenido de 33-37 tok/s a profundidades de 115K-905K.
- Asistencia a la programación con agentes: integración con frameworks tipo Hermes u OpenClaw usando `PARALLEL=4 CONTEXT=32768`, donde cada paso de agente arranca en 0,15-1 s gracias a la caché de prefijo.
- Generación de código en pipelines internos: con DFlash2 como borrador se alcanzan 47,7 tok/s en código corto y 39,4 tok/s a 32K, adecuado para tareas de refactorización o generación de tests en lote.
- Investigación y evaluación de cuantizaciones extremas: el repo documenta la asignación por experto en `quantization_config.json` (formato `keys35-v1`), lo que sirve como referencia para estudiar el impacto de precisiones mixtas en MoE de gran escala.
- Despliegue multiusuario ligero: con 4 streams en paralelo se obtienen 78,7 tok/s agregados en prosa y 100,2 tok/s en código, suficiente para un equipo pequeño con cargas interactivas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en 4× DGX Spark (GB10) con la imagen `2026-10-05`, thinking on:

| Métrica | Valor |
|---|---|
| Prosa (greedy, 300 tokens, petición completa) | 40,2 tok/s |
| Código (misma configuración) | 39,0 tok/s |
| Prompt de 25K tokens (prefill + respuesta) | 25,3 s |
| Prefill a 128K tokens | 1.038 tok/s (TTFT 125 s) |
| Turno 2 de conversación de 93K (prompt reuse) | 0,85 s al primer token (85,7 s sin reuse) |
| 4 streams agregados, prosa / código | 78,7 / 100,2 tok/s |
| 1M contexto: needles a 115K / 456K / 905K | PASS; decode 37,0 / 35,7 / 33,7 tok/s |

| Single stream, thinking on | MTP = 2 (por defecto) | DFlash2 (opcional) |
|---|---|---|
| Contexto corto, greedy: prosa / código | 37,7 / 41,4 tok/s | 36,1 / 47,7 tok/s |
| 32K contexto, muestreado (T=1.0): prosa / código | 31,7 / 34,9 tok/s | 33,4 / 39,4 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 4 nodos DGX Spark (GB10) con 128 GB cada uno; ~9-15 GB libres por Spark durante el servicio, sin swap.
- GPU recomendadas: exclusivamente DGX Spark (GB10) según la receta publicada; no se documenta funcionamiento en A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en ninguna GPU de consumo individual; el checkpoint pesa 258 GB y requiere paralelismo tensorial 4.
- Opciones de despliegue: TensorFold (motor nativo `glm_moe_dsa`, TP4, un rank por Spark) es la vía recomendada; el tag `vllm` aparece en el repo pero la model card indica explícitamente "no vLLM in the serving path". No se documenta llama.cpp, Ollama ni TGI.
- Imagen preconstruida: `ghcr.io/drowzeys/keys-tensorfold-glm53-tp4-dgx-spark:2026-10-05` (también `:latest`), CUDA 13 / GB10.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 125 s a 128K de prefill, 0,85 s en turno 2 con prompt reuse a 93K.
- Ajustes de memoria: `vm.swappiness=1`, `vm.compaction_proactiveness=0`, descarte de shards de la page cache al cargar y espera entre carriles en `one-shot.sh`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| keys-GLM-5.3-EXL3-2.75BPW (este) | 753B (138B según safetensors del cuantizado) | 1M | glm-5.3 (other) | Hugging Face, 206 descargas | Cuantización mixta por experto, pensada para 4× DGX Spark |
| keys-GLM-5.3-EXL3 (uniforme) | 753B | no disponible | glm-5.3 (other) | Hugging Face (drowzeys) | Versión anterior de anchura uniforme; referencia del propio autor |
| zai-org/GLM-5.3 (BF16) | 753B | no disponible | glm-5.3 | Hugging Face | Modelo base sin cuantizar; requiere hardware de datacenter |
| incoai/GLM-5.3-DFlash2 | no disponible | no disponible | CC BY-NC-ND 4.0 | Hugging Face | Borrador especulativo opcional, no comercial |

## Limitaciones y advertencias

- La cuantización a 2,75 bpw media introduce pérdida de precisión frente al BF16; no se han publicado evaluaciones de calidad (MMLU, HumanEval) que cuantifiquen esa degradación.
- El checkpoint está pensado y probado exclusivamente para 4× DGX Spark con TensorFold; no hay evidencia de funcionamiento en otras configuraciones.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia `glm-5.3` (other): es responsabilidad del usuario revisar los términos del modelo base antes de uso comercial.
- El borrador opcional DFlash2 tiene licencia CC BY-NC-ND 4.0, lo que impide su uso comercial y su redistribución; el fine-tune del borrador realizado por el autor no puede publicarse por esta razón.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad.
- El rendimiento medido es con "thinking on"; no se publican cifras con thinking off, por lo que la latencia en modo rápido es desconocida.
- El prefill a 128K tarda 125 s (TTFT), lo que limita casos de uso interactivos con prompts muy largos sin caché de prefijo.
- La gestión de memoria en GB10 requiere ajustes específicos del sistema operativo; sin ellos el servicio puede recurrir a swap.
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3-2.75BPW
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización uniforme previa: https://huggingface.co/drowzeys/keys-GLM-5.3-EXL3
- Borrador DFlash2: https://huggingface.co/incoai/GLM-5.3-DFlash2
- TensorFold (motor): https://github.com/ashhart/TensorFold
- Rama TensorFold glm53-tp4: https://github.com/drowzeys/TensorFold/tree/glm53-tp4-2026-10-05
- Receta TP4 4× DGX Spark: https://github.com/drowzeys/keys-TensorFold-GLM-5.3-TP4-4x-DGX-Spark
- AGENTS.md para agentes: https://github.com/drowzeys/keys-TensorFold-GLM-5.3-TP4-4x-DGX-Spark/blob/main/AGENTS.md
- Fine-tune del borrador: https://github.com/drowzeys/keys-TensorFold-GLM-5.3-TP4-4x-DGX-Spark/tree/main/draft-finetune
