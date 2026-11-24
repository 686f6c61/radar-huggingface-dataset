# Entro-AI/Secret-Classifier-SFT-Gemma-4-Dynamic-FP8-LLM-Compressed

## Resumen

Secret-Classifier-SFT-Gemma-4-Dynamic-FP8-LLM-Compressed es un ajuste fino supervisado (SFT) del modelo multimodal Google Gemma 4 12B IT, publicado por Entro-AI y orientado a una tarea concreta de clasificación (denominada "secret classifier" en el nombre del repositorio). El modelo conserva la arquitectura multimodal del Gemma 4 original (entrada texto, imagen y audio) pero los pesos se han cuantizado a FP8 dinámico mediante llm-compressor y el formato compressed-tensors, lo que reduce el peso del repositorio a unos 12,8 GiB y permite servirlo en una única GPU NVIDIA L40S.

El interés principal de esta ficha es doble: por un lado, documenta un caso real de cuantización FP8 dinámica de un modelo de 12.966 millones de parámetros lista para vLLM; por otro, ilustra un patrón de despliegue concreto (instancia g6e con 1x L40S, `max-num-seqs 64`, `max-model-len 6000`, prefix caching) que el autor valida explícitamente en RHOAI 3.5, RHAIIS 3.5 y vLLM 0.24.0.

La información pública es escasa: la model card no describe el dataset de SFT, no aporta métricas de evaluación ni detalla el proceso de entrenamiento. Por tanto, esta ficha recoge lo que sí está documentado (arquitectura base, cuantización, configuración de servicio) y marca explícitamente como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`), con torres de visión y audio; inferencia texto-only posible con `--language-model-only` |
| Parametros totales | 12.966.363.184 (~12,97 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 6.000 tokens configurados en el ejemplo de servicio vLLM (`--max-model-len 6000`); contexto nativo del Gemma 4 base no disponible en la información proporcionada |
| Tipos de cuantizacion | FP8 dinámico (dynamic FP8) vía llm-compressor / compressed-tensors; no se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (repo de 15,1 GB; pesos ~12,8 GiB según la model card) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any` y capacidad image-text-to-text y audio-text-to-text. Sobre esa base, Entro-AI aplica un ajuste fino supervisado (SFT) para una tarea de clasificación propietaria ("secret classifier") y posteriormente cuantiza los pesos a FP8 dinámico con llm-compressor, exportando en formato compressed-tensors. La cuantización dinámica FP8 implica que los factores de escala se calculan en tiempo de ejecución para activaciones, mientras que los pesos se almacenan en FP8, lo que reduce el peso a ~12,8 GiB y habilita el despliegue en una sola L40S (48 GB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, si hubo RLHF/DPO adicional ni qué innovaciones técnicas (decodificación especulativa, atención lineal, etc.) incorpora más allá de las del Gemma 4 base. La model card se limita a la receta de servicio con vLLM y a la validación en RHOAI 3.5, RHAIIS 3.5 y vLLM 0.24.0, e incluye un `--reasoning-parser gemma4`, lo que sugiere que el modelo base expone un modo de razonamiento que vLLM puede parsear.

## Capacidades

- Generación de texto y clasificación: la tarea declarada es "secret classifier", es decir, clasificación de contenido sensible o secreto sobre prompts de entrada.
- Procesamiento multimodal de entrada: el pipeline `any-to-any` y los tags `image-text-to-text` y `audio-text-to-text` indican soporte de imagen y audio como entrada, heredado de Gemma 4 12B IT.
- Razonamiento: el flag `--reasoning-parser gemma4` en vLLM sugiere soporte de trazas de razonamiento parseables.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.
- Capacidad especial: cuantización FP8 dinámica lista para vLLM con prefix caching, lo que acelera cargas con system prompt compartido.

## Casos de uso

- Clasificación de contenido sensible en pipelines de moderación: el modelo se sirve con `--max-num-seqs 64` y prefix caching para procesar lotes de prompts que comparten un system prompt largo, clasificando cada entrada según la taxonomía de "secret" definida por Entro-AI.
- Servicio de bajo coste en una sola GPU: con pesos de ~12,8 GiB y FP8 dinámico, cabe en una L40S de 48 GB dejando margen para KV cache al 95 % de ocupación, lo que permite desplegar el clasificador en una instancia g6e sin multi-GPU.
- Enrutado previo a LLMs mayores: usar el clasificador como primera etapa para decidir si una petición debe enviarse a un modelo más grande o a un flujo restringido, aprovechando el throughput con 64 secuencias concurrentes.
- Procesamiento de documentos con imagen y audio: al conservar las torres multimodales de Gemma 4, puede clasificar entradas image-text y audio-text sin pipeline separado, aunque el autor recomienda `--language-model-only` cuando solo se necesita texto.
- Evaluación de cuantización FP8 en producción: sirve como referencia reproducible (vLLM 0.24.0, RHOAI 3.5, RHAIIS 3.5) para medir el impacto de FP8 dinámico frente al Gemma 4 12B IT en BF16 en tareas de clasificación.
- Despliegue en clústeres Red Hat OpenShift AI: la validación explícita en RHOAI 3.5 y RHAIIS 3.5 permite integrarlo como servidor de inferencia gestionado con el manifiesto de vLLM documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta datos operativos de serving: pesos ~12,8 GiB, throughput máximo con 64 secuencias concurrentes en 1x L40S, KV cache ~95 % llena a ese nivel de concurrencia y caída de throughput por encima de 64 peticiones simultáneas.

## Requisitos de hardware

- VRAM estimada: ~12,8 GiB solo para pesos en FP8; con `--gpu-memory-utilization 0.95` en una L40S (48 GB) quedan ~32 GB para KV cache y activaciones.
- GPU recomendadas: NVIDIA L40S (validada por el autor en instancia g6e); por tamaño, también cabría en A100 40/80 GB, H100 y RTX 6000 Ada. En GPUs consumer de 24 GB (RTX 4090) los pesos FP8 caben, pero el margen para KV cache con `max-model-len 6000` y 64 secuencias es muy ajustado y no está validado por el autor.
- Cabe en consumer GPU: sí en cuanto a pesos (24 GB), pero sin validación documentada de la configuración de serving.
- Opciones de despliegue: vLLM (validado en 0.24.0 y mencionado 0.34 en el texto de la model card), con soporte de compressed-tensors; RHOAI 3.5 y RHAIIS 3.5. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican valores absolutos; el autor indica que el throughput de salida para los prompts de clasificación alcanza su pico con 64 secuencias concurrentes y que decae por encima de ese valor al llenarse la KV cache.
- Flags de serving relevantes: `--max-model-len 6000`, `--enable-prefix-caching`, `--tensor-parallel-size 1`, `--max-num-batched-tokens 15000`, `--max-num-seqs 64`, `--gpu-memory-utilization 0.95`, `--language-model-only`, `--reasoning-parser gemma4`, `--performance-mode throughput`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Entro-AI/Secret-Classifier-SFT-Gemma-4-Dynamic-FP8-LLM-Compressed | ~12,97 B | 6.000 (configurado) | FP8 dinámico | apache-2.0 | SFT para clasificación, validado en vLLM 0.24.0 |
| google/gemma-4-12B-it (base) | ~12 B (no confirmado en la información) | no disponible | BF16 original | licencia Gemma 4 | Modelo generalista multimodal sin el SFT de clasificación |
| RedHatAI/gemma-4-12B-it-FP8-Dynamic | ~12 B (no confirmado) | no disponible | FP8 dinámico | según modelo base | Cuantización FP8 de referencia citada por el autor, sin el SFT de clasificación |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de SFT, la taxonomía de "secret" ni métricas de evaluación; no es posible verificar la calidad de la clasificación sin pruebas propias.
- Riesgo de alucinación y de clasificación errónea inherente a un modelo de lenguaje ajustado por SFT; no hay calibración publicada de precisión/recall.
- El contexto de servicio está limitado a 6.000 tokens en la configuración validada; entradas más largas requieren reconfigurar `--max-model-len` y recalcular el consumo de KV cache.
- Idiomas soportados no declarados: el comportamiento multilingüe es incierto.
- La licencia del repositorio es apache-2.0, pero el `license_link` apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- El rendimiento decae por encima de 64 secuencias concurrentes según el autor; la planificación de capacidad debe respetar ese límite.
- Solo se valida el despliegue con vLLM; no hay soporte documentado para llama.cpp, Ollama o TGI, lo que limita las opciones en entornos sin GPU NVIDIA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Entro-AI/Secret-Classifier-SFT-Gemma-4-Dynamic-FP8-LLM-Compressed
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- README de referencia de cuantización FP8: https://huggingface.co/RedHatAI/gemma-4-12B-it-FP8-Dynamic/blob/main/README.md
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
