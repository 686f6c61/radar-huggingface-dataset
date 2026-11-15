# nchapman/Arete-27B-W4A16-HGPTQ

## Resumen

Arete-27B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal NousResearch/Arete-27B, realizada por nchapman. El checkpoint comprime el modelo original en BF16 (56,69 GB) hasta 16,14 GiB (17,33 GB), una reduccion de 3,27 veces, con el objetivo de que el modelo completo de 27B parametros y su cabecera de decodificacion especulativa quepan en una unica GPU de 24 GB (RTX 3090, 4090 o 5090). La arquitectura subyacente es un transformer hibrido con 64 capas de decodificador, combinando 16 capas de atencion completa con 48 capas GatedDeltaNet, e incluye un codificador visual ViT de 27 bloques para tareas image-text-to-text.

La innovacion principal de esta ficha es la restauracion de la decodificacion especulativa Native Multi-Token Prediction (MTP) que el modelo base original no incluia (sus pesos `mtp.*` estaban ausentes). El autor injerta los pesos MTP desde Qwen/Qwen3.8-27B, apoyandose en que la matriz de embeddings de entrada de Arete-27B es 100% identica a nivel de bits a la de Qwen3.8-27B, y calibra dichos pesos sobre los estados ocultos de la capa 63 de Arete-27B. El resultado es una concordancia Top-1 end-to-end del 88,69% frente a la `lm_head` principal, con un KL medio de 0,1393.

El modelo usa cuantizacion W4A16 con GPTQ por grupos de tamano 64, inicializado con Cholesky por error cuadratico medio y rotacion Hadamard H64, junto con una destilacion KL de escala/norma en FP32 maestro. La cabecera de salida `lm_head` y la fusion `mtp.fc` se mantienen en 8 bits sin rotar (`W8_g64`). La licencia es Apache 2.0 y el checkpoint esta pensado para servir directamente con vLLM y compressed-tensors sin parches adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas de decodificador (16 de atencion completa + 48 GatedDeltaNet) + ViT de 27 bloques + MTP de 1 capa |
| Parametros totales | 29.105.255.152 (29,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | W4A16 GPTQ (group size 64, Hadamard H64); lm_head y mtp.fc en W8_g64; embeddings, proyecciones in_proj_a/b, patch_embed, normas y biases en BF16 |
| Idiomas soportados | No disponible (la model card menciona evaluacion multilingue en `probe-v4`, pero no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + compressed-tensors (18 shards, `model-00001-of-00018.safetensors` a `model-00018-of-00018.safetensors`) |

## Arquitectura y entrenamiento

El modelo base NousResearch/Arete-27B emplea una arquitectura hibrida de transformer con 64 capas: 16 capas de atencion completa y 48 capas GatedDeltaNet (atencion lineal con puertas), lo que reduce el coste computacional en contextos largos. Incluye un codificador visual ViT de 27 bloques con proyecciones de fusion espacial (`visual.merger.linear_fc1` y `linear_fc2`) para entrada image-text-to-text. El proceso de cuantizacion afecta a 519 capas lineales: 400 del backbone de lenguaje (256 grupos fusionados de vLLM en W4A16-HGPTQ), 110 del codificador visual, 7 del MTP injertado y 2 en W8_g64 (`lm_head` y `mtp.fc`). Las capas del backbone se rotan con Hadamard H64, se cuantizan con GPTQ Cholesky inicializado por MSE (group_size 64, actorder static) y se refinan con descenso de coordenadas Gauss-Seidel de 2 pasadas sobre la Hessiana, seguidas de destilacion KL de `log_scale` continuo y RMSNorm/GDN-gate en FP32 maestro sobre el dataset `data/calib-cascade-v1.jsonl`.

La innovacion tecnica clave es la restauracion del MTP especulativo: dado que la matriz `model.language_model.embed_tokens.weight` de Arete-27B es bit-identica a la de Qwen3.8-27B y las capas del transformer permanecen en el mismo subespacio de representacion (desviacion relativa de Frobenius entre 1,3% y 3,6%), el autor injerta `mtp.*` desde Qwen3.8-27B, calibra `mtp.layers.0.*` (W4_g64 + H64) y `mtp.fc` (W8_g64) sobre estados ocultos de la capa 63 de Arete-27B, y activa `mtp_num_hidden_layers: 1`. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, con modos de chat, instrucciones, matematicas y ciencia evaluados en `probe-v4`.
- Generacion de codigo y uso de herramientas (tool use), citados explicitamente entre las categorias evaluadas en `probe-v4`.
- Capacidades multilingues (evaluadas en el holdout `probe-guard`, aunque no se detallan idiomas concretos).
- Vision image-text-to-text mediante ViT de 27 bloques y proyecciones de fusion espacial, con concordancia Top-1 aislada del 98,34% y end-to-end del 95,70% frente al BF16 en `vision-probe-v2`.
- Decodificacion especulativa Native MTP restaurada, con 88,69% de concordancia Top-1 end-to-end, que acelera la generacion al permitir propuestas de multiples tokens verificadas por la `lm_head` principal.
- Compatibilidad con vLLM y compressed-tensors sin parches (zero-patch stock vLLM), lo que habilita despliegue directo en produccion.
- No se mencionan capacidades de audio ni modos de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Despliegue en una unica GPU de 24 GB: al ocupar 16,14 GiB (15,70 GiB en modo solo texto), deja aproximadamente 7,8 GiB libres para cache KV de contexto largo, tokens de vision, decodificacion especulativa MTP y grafos CUDA, lo que permite servir el VLM completo en estaciones de trabajo con RTX 3090, 4090 o 5090 sin infraestructura multi-GPU.
- Atencion al cliente automatizada multimodal: el modelo gestiona conversaciones multi-turno con imagenes adjuntas (capturas, documentos, productos) gracias a su pipeline image-text-to-text y al ViT integrado, con una fidelidad visual del 95,70% end-to-end frente al BF16.
- Generacion de codigo en produccion: la evaluacion de tool use y coding en `probe-v4` y la compatibilidad con vLLM permiten integrarlo en pipelines de CI/CD como generador de parches o asistente de revision, con decodificacion especulativa MTP para reducir latencia.
- Asistente de razonamiento matematico y cientifico: las KL bajas en las categorias `math` (0,0474) y `science` (0,0633) indican que la cuantizacion preserva el comportamiento del modelo base en tareas de razonamiento, adecuado para tutoria o resolucion de problemas.
- Servicio de inferencia de bajo coste con vLLM: el checkpoint esta empaquetado en compressed-tensors y disenado para funcionar con vLLM stock sin parches, lo que simplifica el despliegue en clústeres con GPUs de 24 GB y reduce el coste por instancia frente al BF16 de 56,69 GB.
- Procesamiento de documentos con vision: el codificador ViT de 27 bloques y las proyecciones de fusion espacial permiten extraer informacion de imagenes (formularios, tablas, diagramas) en flujos de automatizacion documental, con concordancia Top-1 aislada del 98,34%.
- Aceleracion de inferencia mediante MTP: la cabecera especulativa restaurada (88,69% E2E Top-1) permite generar varios tokens por paso verificados por la `lm_head`, util en cargas interactivas donde la latencia importa, como chatbots o autocompletado.

## Benchmarks y rendimiento

La model card proporciona evaluaciones teacher-forced frente al modelo base BF16 NousResearch/Arete-27B:

| Evaluacion | BF16 base | Arete-27B-W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 52,80 GiB (56.690.829.888 B, sin MTP) | 16,14 GiB (17.329.995.464 B, con MTP) | Compresion 3,27x (-36,66 GiB) |
| Perplejidad texto (`probe-v4`, 378 prompts, 852.269 tokens) | 4,9736 | 4,8222 (-3,04%) | Chat, math, science, coding, tool use, multilingual |
| Divergencia texto vs BF16 (`probe-v4`, KL ponderada / KL media) | 0,0000 | 0,0884 / 0,2124 | `chat` 0,0214; `if` 0,0427; `math` 0,0474; `science` 0,0633 |
| Holdout general y multilingue (`probe-guard`, 76 prompts, 22.746 tokens) | 27,2026 | 25,7730 (-5,26%) | KL media 0,0680; KL ponderada 0,0913; `no_robots` 0,0506 |
| MTP Native injertado (12.339 posiciones) | 100,0% Top-1 (NLL 2,6936) | 96,47% Top-1 aislado; 88,69% Top-1 E2E | KL aislada 0,0089; KL E2E 0,1393 (NLL 2,7060) |
| Vision (`vision-probe-v2`, 96 imagenes, 302 tokens de respuesta) | 100,0% Top-1 | 98,34% Top-1 aislado; 95,70% Top-1 E2E | KL ViT aislada 0,0050; KL E2E 0,0698; `vision-guard-v2`: 97,78% / 97,04% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16,14 GiB para el VLM completo con MTP (15,70 GiB en modo solo texto), dejando aproximadamente 7,8 GiB libres en una GPU de 24 GB para cache KV, tokens de vision, decodificacion especulativa y grafos CUDA.
- GPU recomendadas: RTX 3090, RTX 4090 y RTX 5090 (24 GB), que segun el autor son suficientes para el modelo completo; no se especifican requisitos para A100 o H100, aunque por tamano cabria esperar holgura en GPUs de 40 GB o 80 GB.
- Cabe en GPU consumer: si, en RTX 3090, 4090 y 5090 de 24 GB.
- Opciones de despliegue: vLLM stock con compressed-tensors (zero-patch, compatible con el formato del checkpoint) y transformers (libreria declarada); no se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; la decodificacion especulativa MTP con 88,69% de concordancia Top-1 E2E esta disenada para acelerar la generacion, pero no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---:|---|---|---|
| Arete-27B-W4A16-HGPTQ | 29,1 B | No disponible | W4A16 GPTQ + W8 lm_head | Apache 2.0 | VLM hibrido con MTP restaurado; 16,14 GiB |
| NousResearch/Arete-27B (BF16 base) | 29,1 B | No disponible | BF16 | Apache 2.0 | Modelo original sin pesos MTP; 52,80 GiB safetensors (56,69 GB) |
| Qwen/Qwen3.8-27B | No disponible en la informacion | No disponible | No disponible | No disponible | Donante de los pesos `mtp.*` injertados; embeddings de entrada bit-identicos a Arete-27B |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al BF16: KL ponderada de 0,0884 en `probe-v4` y KL media de 0,0680 en `probe-guard`, con perdida de concordancia Top-1 del 11,31% end-to-end en MTP y del 4,30% end-to-end en vision.
- El MTP injertado procede de un modelo donante distinto (Qwen3.8-27B) y se calibra sobre estados ocultos de Arete-27B; su concordancia E2E del 88,69% implica que aproximadamente 1 de cada 9 propuestas especulativas no coincide con la `lm_head` principal, lo que puede afectar a la latencia efectiva en funcion de la carga.
- No se especifican sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible; la model card solo evalua categorias genericas sin detallar idiomas.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide planificar cargas de contexto largo con precision.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo base de terceros (NousResearch) conviene verificar las condiciones del modelo original y del donante Qwen antes de produccion.
- El checkpoint depende de `custom_code` y de la libreria transformers, con pesos en formato compressed-tensors; la compatibilidad con otros runtimes (llama.cpp, Ollama, TGI) no esta documentada.
- El modelo base original no incluia pesos MTP (`mtp_num_hidden_layers: null`); la restauracion es una intervencion del autor de la cuantizacion, no una caracteristica oficial de NousResearch, por lo que su comportamiento en produccion debe validarse con evaluaciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Arete-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo donante del MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision del modelo base citada: `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`
- Revision del donante citada: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
