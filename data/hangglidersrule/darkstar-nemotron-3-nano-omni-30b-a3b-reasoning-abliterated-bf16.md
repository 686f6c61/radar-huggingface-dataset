# HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-BF16

## Resumen

Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-BF16 es un ajuste fino derivado del modelo multimodal y de razonamiento `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16` de NVIDIA, publicado por el usuario independiente HangGlidersRule dentro de la campaña "Darkstar" de su proyecto Model Forge. El objetivo declarado no es mejorar capacidades, sino eliminar el comportamiento de rechazo (refusal) del modelo original: es un derivado "abliterated" con negativas reducidas, distribuido en BF16.

Técnicamente se apoya en el tronco híbrido de NVIDIA (arquitectura NemotronH, combinación de capas Mamba2 y mezcla de expertos), con aproximadamente 33.016 millones de parámetros totales según los pesos en safetensors y una ventana de contexto validada de 131.072 tokens. A diferencia de las técnicas clásicas de abliteración por proyección de pesos, el autor aplica un SFT de desaprendizaje con un adaptador LoRA de rango 32 sobre las proyecciones de atención del tronco lingüístico, fusionado posteriormente en float32.

Su relevancia es doble: por un lado, documenta con detalle un protocolo reproducible de reducción de rechazo sobre un modelo híbrido Mamba2+MoE, donde las proyecciones cerradas degradaban gravemente el razonamiento; por otro, es un artefacto con riesgos de seguridad explícitos (200/200 de cumplimiento ante prompts dañinos en la suite medida) y con un coste estructural documentado en GPQA Diamond (30,3 % frente a la referencia ~46 % del modelo base). No es un modelo para producción generalista sin controles adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (híbrida Mamba2 + MoE), tag `NemotronH_Nano_Omni_Reasoning_V3`; multimodal image-text-to-text |
| Parametros totales | 33.015.632.214 (~33,0 B) |
| Parametros activos | ~30 B nominales en el nombre (A3B); desglose exacto de expertos activos no disponible |
| Longitud de contexto | 131.072 tokens (validado en vLLM) |
| Tipos de cuantizacion | BF16 (único formato publicado); no se documentan GGUF, AWQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`, marcada como `other`) |
| Formato de pesos | safetensors (17 shards, 62.990 MB), `custom_code`, requiere `trust_remote_code` |
| Pipeline | image-text-to-text (visión + audio + texto) |
| Modalidades | texto, imagen y audio (torre de visión y encoder de audio idénticos al upstream) |
| Descargas / likes | 89 / 0 |
| Creado / actualizado | 2026-09-02 / 2026-11-09 |

## Arquitectura y entrenamiento

El modelo hereda íntegro el tronco de NVIDIA: una arquitectura híbrida que intercala capas Mamba2 (atención lineal con estado recurrente) y capas de mezcla de expertos, con una torre de visión y un encoder de audio acoplados para entrada multimodal. El autor indica que la torre de visión, el encoder de audio, el tokenizer y el wrapper del modelo son byte-idénticos al upstream; solo se modifican los pesos del tronco lingüístico. No se dispone de datos sobre el volumen de tokens de preentrenamiento original, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

El ajuste se realizó mediante SFT de desaprendizaje con LoRA, no por proyección de pesos: un adaptador de rango 32 (α=64, dropout 0,05) sobre `q_proj`, `k_proj`, `v_proj` y `o_proj`, entrenado 3 épocas (96 pasos, acumulación de gradiente 8, lr 1e-4 con scheduler coseno, bf16, `max_length` 1024) sobre salidas conformes del propio modelo para los prompts de `treadon/abliteration-eval` (25 filas dañinas conformes + 77 filas seguras tras filtrado estricto de rechazos). La pérdida final de entrenamiento fue 0,3402 con una precisión media por token del 99,98 %. El adaptador se fusionó en float32 sobre el tronco original y se regeneraron los 17 shards.

El autor documenta que las nueve configuraciones de proyección cerrada probadas (simple, doble, tri-eje, banda causal, preservación de norma, biproyectada, corpus re-medido) colapsaban GPQA Diamond a 26,8–27,3 % con más de 60 respuestas no parseables, y que una segunda ronda de SFT con 600 filas de instrucción general mantenía el comportamiento en 200/200 pero hundía GPQA al 6,6 %. Su conclusión es que el circuitería de rechazo y de razonamiento comparten espacio de cabezas de atención en este tronco híbrido, y que la ruta LoRA es el mejor compromiso documentado. No hay decodificación especulativa disponible: la familia carece de capas MTP y de drafter compatible (verificado por el autor).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explícito con modo "thinking" activable; el parser de razonamiento en vLLM es `nemotron_v3`.
- Comprensión de imágenes (pipeline image-text-to-text) mediante torre de visión heredada del base.
- Comprensión de audio mediante encoder de audio heredado del base.
- Razonamiento matemático y científico de nivel medio (GPQA Diamond 30,3 % en modo thinking).
- Cumplimiento de instrucciones con negativas reducidas de forma deliberada: responde a peticiones que el modelo upstream rechazaría.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking permite cadenas de razonamiento, pero no hay evaluación de agentes publicada.
- Capacidades multilingües: no disponibles (idiomas no declarados).

## Casos de uso

- Investigación sobre alineación y seguridad: el artefacto sirve para estudiar cómo se distribuye el comportamiento de rechazo en un tronco híbrido Mamba2+MoE y qué coste tiene en razonamiento, comparando directamente contra el checkpoint upstream en el mismo protocolo.
- Evaluación de robustez de filtros de contenido: al ser un modelo con 0/200 rechazos en la suite medida, es útil como caso adversario para validar clasificadores de entrada/salida y políticas de moderación antes de desplegar sistemas propios.
- Red teaming controlado: permite generar respuestas que el modelo base bloquearía, en entornos aislados, para construir conjuntos de datos de entrenamiento de clasificadores de seguridad.
- Análisis multimodal en investigación: al conservar intactas la torre de visión y el encoder de audio, se puede usar para estudiar cómo interactúan las ediciones de rechazo en texto con entradas de imagen y audio.
- Reproducción de recetas de ajuste: la receta LoRA, los hiperparámetros y el protocolo de evaluación están publicados, lo que permite replicar el pipeline sobre otros checkpoints de la familia Nemotron.
- Servicio interno de razonamiento con contexto largo: con 131.072 tokens y despliegue en vLLM, puede procesar documentos extensos o conversaciones largas en entornos con control de acceso y revisión legal, asumiendo la degradación de razonamiento documentada.
- Prototipado de asistentes multimodales: útil para validar pipelines que combinen imagen, audio y texto antes de migrar a un modelo con licencia y salvaguardas estándar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Protocolo / base |
|---|---|---|
| Cumplimiento ante prompts dañinos | 200/200 (0/200 rechazos) | suite nueva sobre este artefacto, 0 errores |
| Sobre-rechazos en prompts seguros | 0/83 (0,00 %) | 0 errores |
| GPQA Diamond (thinking ON) | 60/198 = 30,3 % | `llm-inference-bench gpqa-diamond`, plantilla de chat, temp 0, denominador completo, 20 respuestas no parseables |
| Delta de inteligencia vs. control BF16 upstream | −14 preguntas / ~−16 pp frente a ~46 % de referencia | mismo protocolo; coste estructural documentado |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | no medidos | el autor indica explícitamente `not measured` y no rellena celdas desde otros checkpoints |

## Requisitos de hardware

- VRAM para inferencia en BF16: el repo ocupa 62.990 MB (~61,5 GiB) en 17 shards; se necesita al menos una GPU de 80 GB para cargar los pesos completos con margen para caché KV.
- GPU recomendadas: H100 80 GB, A100 80 GB, H200 141 GB. Para contexto completo de 131.072 tokens con `max_num_seqs=16` y caché KV en BF16 conviene H200 o multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en BF16; no hay cuantizaciones publicadas (GGUF, AWQ, FP8) que permitan reducir la huella.
- Despliegue: validado con vLLM usando `--trust-remote-code`, `--kv-cache-dtype bfloat16`, `--max-model-len 131072`, `--max-num-seqs 16`, `--max-num-batched-tokens 32768`, `--gpu-memory-utilization 0.92` y `--reasoning-parser nemotron_v3`, con el fallback eager de Flash Attention. Otros motores (llama.cpp, Ollama, TGI) no están documentados para este artefacto.
- Decodificación especulativa: no disponible (sin capas MTP ni drafter compatible, verificado por el autor).
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar Nemotron-3-Nano-Omni 30B-A3B Abliterated BF16 | ~33,0 B totales (MoE, ~30 B nominales) | 131.072 | 30,3 % (60/198) | NVIDIA Open Model License | Hugging Face, 89 descargas |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 (upstream) | ~33,0 B totales (MoE) | 131.072 (heredado) | ~46 % (referencia del autor) | NVIDIA Open Model License | Hugging Face (modelo base) |
| Variantes de proyección cerrada del mismo autor (9 configuraciones) | ~33,0 B totales | 131.072 | 26,8–27,3 %, 60+ no parseables | NVIDIA Open Model License | Documentadas en la receta, no publicadas como checkpoints |
| Segunda ronda SFT con 600 filas de instrucción general | ~33,0 B totales | 131.072 | 6,6 % | NVIDIA Open Model License | Documentada, no publicada |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo con rechazo reducido de forma deliberada: cumple 200/200 prompts dañinos en la suite medida y no incorpora mitigaciones de seguridad adicionales. No debe desplegarse sin política de uso, filtrado, control de acceso y revisión legal.
- Degradación de razonamiento documentada: GPQA Diamond cae a 30,3 % frente a ~46 % del base, con 20 respuestas no parseables; el autor lo describe como coste estructural asumido por decisión explícita del revisor.
- Riesgo elevado de alucinación y de respuestas no parseables en tareas de razonamiento científico, especialmente en modo thinking.
- Idiomas soportados no declarados; no hay evaluación multilingüe.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos para uso comercial, redistribución y requisitos de atribución; la model card la marca como `other`.
- Requiere `trust_remote_code` y código personalizado (`custom_code`), lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- Huella de memoria muy alta (BF16, ~61,5 GiB) sin cuantizaciones publicadas; inviable en GPU de consumo.
- Sin decodificación especulativa ni cuantizaciones alternativas, el throughput queda limitado por el tronco híbrido en BF16.
- Solo 89 descargas y 0 likes: validación comunitaria prácticamente nula.
- El modelo base tiene fecha de creación posterior a septiembre de 2026; verificar la vigencia de la revisión `24e67ea000b7c2837fc8f9488aa2008524fac8ba` antes de reproducir el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-BF16
- Discusiones del modelo: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-BF16/discussions
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Model card de origen (proveniencia y caveats): https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3-nano-omni-r1/model-card/abliterated-bf16.md
- Receta de ajuste: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3-nano-omni/darkstar-nemotron-3-nano-omni-30b-a3b-reasoning-abliterated-bf16.yaml
- Release de la familia: https://github.com/HangGlidersRule/model-forge/releases/tag/darkstar-nemotron-3-nano-omni-v1.0.0
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/download/eula/pdf/NVIDIA_Open_Model_License.pdf
