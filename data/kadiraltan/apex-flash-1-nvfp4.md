# kadiraltan/apex-flash-1-NVFP4

## Resumen

apex-flash-1-NVFP4 es una cuantización NVFP4 (W4A4) del modelo cantina-security/apex-flash-1, un modelo de pesos abiertos orientado a investigaciones de seguridad desarrollado por Cantina Security en colaboración con Yeta. El modelo base es un post-entrenamiento por refuerzo de zai-org/GLM-5.3-Flash, especializado en lectura de código, uso de herramientas, desarrollo de exploits y verificación de su efecto en un objetivo en ejecución. Esta versión concreta, publicada por el usuario kadiraltan, no introduce ningún cambio de comportamiento: solo modifica el formato numérico de los expertos enrutados del MoE.

La arquitectura es un transformer híbrido de tipo `Glm5NextForConditionalGeneration` con aproximadamente 321.000 millones de parámetros totales y unos 18.000 millones activos, organizado en 45 capas de decodificador más una capa MTP (multi-token prediction). Combina atención lineal KDA en la mayoría de capas con MLA dispersa (DSA, con indexador lightning) en 11 capas, e incorpora una torre de visión de 24 bloques que lo habilita como modelo image-text-to-text.

Su relevancia actual radica en que reduce el peso en disco de 642,7 GB (BF16) a 205,1 GB manteniendo el resto de componentes en BF16, lo que facilita el despliegue en hardware con memoria limitada. No obstante, la propia model card advierte de que solo se ha probado en 2× NVIDIA DGX Spark (GB10) y de que requiere una imagen de vLLM específica no incluida en las releases estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `Glm5NextForConditionalGeneration` (MoE con atención KDA lineal + MLA dispersa/DSA, mHC hyper-connections, torre de visión) |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | ~18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en expertos enrutados: pesos y activaciones FP4 E2M1, grupo 16, escalas de bloque FP8 E4M3, escalas globales FP32; resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), 40 archivos, 205,1 GB |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura MoE con 45 capas de decodificador más una capa MTP (capa 45). Las capas 0-2 son densas; las capas 3-44 son MoE con 288 expertos enrutados más 1 experto compartido y enrutamiento top-8. La atención es híbrida: KDA (atención lineal) en la mayoría de capas y MLA dispersa (DSA, con indexador lightning) en 11 capas; la MLA es libre de RoPE (`qk_rope_head_dim = 0`). Incorpora hyper-connections mHC (`hc_mult = 4`) y una torre de visión de 24 bloques para tareas image-text-to-text. El modelo base fue post-entrenado con refuerzo (RL) sobre zai-org/GLM-5.3-Flash para investigaciones de seguridad focalizadas.

Esta cuantización se generó con LLM Compressor 0.15.0 (compressed-tensors 0.20.1, transformers 5.16.1, torch 2.13.0+cu130) aplicando la receta oficial del ejemplo GLM-5.3-Flash. Se cuantizaron 36.288 módulos lineales (proyecciones gate/up/down de los 288 expertos enrutados en las 42 capas MoE). Permanecen en BF16 toda la atención (KDA, MLA, indexador DSA), los routers, los expertos compartidos, los MLP densos de las capas 0-2, los embeddings, `lm_head`, la torre de visión y la capa MTP (copiada byte a byte para permitir decodificación especulativa MTP). La calibración usó 512 muestras de 2048 tokens (semilla 1234) renderizadas con el `chat_template.jinja` del modelo base, con mezcla de código fuente, parches de seguridad (CVEfixes, vulnerability-cwe-patch), trayectorias de agentes y function calling, y chat técnico general. Se ejecutó en una sola DGX Spark (GB10) con `moe_calibrate_all_experts=True`, pico de ~65 GB y 9 h 06 min de duración. Se verificaron 72.576 escalas globales finitas y positivas y 147.634 claves de índice presentes.

## Capacidades

- Generación de texto y razonamiento orientado a investigación de seguridad.
- Lectura y análisis de código fuente en múltiples lenguajes (Python, C, C++, Go, Rust, Java, JavaScript, PHP en calibración).
- Uso de herramientas (tool calling / function calling).
- Ejecución de flujos agénticos multi-paso: perseguir un exploit y verificar su efecto en un objetivo en ejecución.
- Comprensión image-text-to-text mediante torre de visión de 24 bloques (calidad no evaluada según el autor).
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa MTP disponible (capa 45 preservada en BF16).
- Análisis de vulnerabilidades y parches de seguridad (CVE, CWE, diffs de commit).

## Casos de uso

- Triaje de vulnerabilidades en pipelines de seguridad: el modelo puede recibir una descripción CVE, su CWE asociado y el diff del commit de corrección para evaluar el impacto y proponer mitigaciones, gracias a que su calibración incluyó CVEfixes y vulnerability-cwe-patch.
- Revisión de código con enfoque de seguridad: análisis de repositorios en Python, C, C++, Go, Rust, Java, JavaScript y PHP para detectar patrones de explotación, apoyándose en su entrenamiento sobre código y parches.
- Automatización de investigaciones agénticas: uso de tool calling para encadenar consultas, ejecutar comandos en un objetivo y verificar el efecto de un exploit, un flujo para el que el modelo fue post-entrenado con RL.
- Asistente de respuesta a incidentes: conversaciones multi-turno con contexto técnico largo (aunque la longitud exacta de contexto no está publicada) para correlacionar hallazgos y proponer siguientes pasos.
- Integración en pipelines CI/CD de análisis estático asistido: el modelo puede invocarse vía API OpenAI-compatible servida con vLLM para revisar pull requests y señalar riesgos de seguridad.
- Generación de pruebas de concepto controladas en entornos de laboratorio: dado su enfoque en "perseguir un exploit", encaja en ejercicios de red team siempre que se despliegue en infraestructura aislada.
- Procesamiento de capturas o diagramas junto a texto (image-text-to-text) para documentar hallazgos, con la advertencia de que la calidad visual no ha sido evaluada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~88,4 GiB por GPU con TP=2 según la model card; una sola DGX Spark de 121 GiB no es suficiente.
- GPU recomendadas: únicamente probado en 2× NVIDIA DGX Spark (GB10, SM121). No se ha validado otro hardware.
- Consumer GPU: no cabe en GPUs de consumo; el checkpoint pesa 205,1 GB y requiere ~88,4 GiB por GPU en TP=2.
- Despliegue: vLLM con la imagen `vllm/vllm-openai:glm53-flash-arm64-cu130` (vLLM 0.28.1rc1, digest `sha256:b0501f99…`) y el mod comunitario NoPE-MLA de kingjones30 (`48a2f322`). `glm5_next` no está en las releases de vLLM, por lo que el snippet automático de "Use this model" no funciona. En GB10 la imagen estándar falla con `pe_dim must be 64 for fp8_ds_mla` (issues vllm-project/vllm#53963 y #55773).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| apex-flash-1-NVFP4 (este) | ~321B totales / ~18B activos | no disponible | MIT | Hugging Face, 205,1 GB | Cuantización NVFP4 de expertos; solo probado en 2× DGX Spark |
| cantina-security/apex-flash-1 (BF16) | ~321B totales / ~18B activos | no disponible | MIT | Hugging Face, 642,7 GB | Modelo base sin cuantizar; mismas capacidades |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | Hugging Face | Modelo origen del post-entrenamiento RL; sin datos de benchmarks en la información disponible |

## Limitaciones y advertencias

- Solo se ha probado en 2× NVIDIA DGX Spark (GB10); no hay validación en otras GPUs ni en configuraciones distintas.
- Requiere una imagen de vLLM no publicada en releases (`glm53-flash-arm64-cu130`) y un mod comunitario (NoPE-MLA) para funcionar en GB10; la imagen estándar falla al arrancar.
- El snippet automático de la model card no funciona porque `glm5_next` no está integrado en vLLM.
- La calidad de imagen y vídeo no ha sido evaluada, ni por el autor de la cuantización ni por los autores del modelo base.
- Idiomas soportados limitados a inglés y chino; no se documenta soporte de castellano.
- La longitud de contexto no está publicada en la información disponible.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información proporcionada; aplican los del modelo base, no evaluados aquí.
- La licencia es MIT, lo que permite uso comercial, pero la model card no incluye cláusulas adicionales de responsabilidad sobre uso ofensivo; el modelo está diseñado para investigación de seguridad y exploits, por lo que su uso en producción debe restringirse a entornos controlados.
- La cuantización no añade entrenamiento ni cambios de comportamiento, pero puede degradar ligeramente la precisión frente al BF16 original; no se han publicado métricas comparativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadiraltan/apex-flash-1-NVFP4
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1
- Modelo origen: https://huggingface.co/zai-org/GLM-5.3-Flash
- Yeta: https://yeta.ai/
- Mod NoPE-MLA para 2× DGX Spark: https://github.com/kingjones30/GLM-5.3-Flash-2x-DGX-Spark
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Issue vLLM #53963: https://github.com/vllm-project/vllm/issues/53963
- Issue vLLM #55773: https://github.com/vllm-project/vllm/issues/55773
- Dataset codeparrot/github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset hitoshura25/cvefixes: https://huggingface.co/datasets/hitoshura25/cvefixes
- Dataset CIRCL/vulnerability-cwe-patch: https://huggingface.co/datasets/CIRCL/vulnerability-cwe-patch
- Dataset nebius/SWE-agent-trajectories: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset mlabonne/open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
