# arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-200m

## Resumen

El modelo `arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-200m` es un checkpoint experimental publicado en Hugging Face por el usuario arianraje. Se trata de una variante híbrida de Qwen3-4B en la que se ha sustituido parte de la atención estándar por capas GDN (Gated DeltaNet), un mecanismo de atención lineal, mediante un proceso que el autor denomina "linearization". El resultado no es un checkpoint estándar de Qwen y requiere el código específico del repositorio Linearization para cargarse correctamente.

El nombre del modelo codifica su configuración de entrenamiento: una destilación de conocimiento (KD) desde un modelo profesor, con una ventana de contexto de 8k tokens y un presupuesto de entrenamiento de 200M de tokens. El checkpoint contiene pesos en formato safetensors, tokenizer, configuración, metadatos de la cirugía arquitectónica y las salidas de evaluación originales. No incluye estado del optimizador.

La relevancia de este modelo es fundamentalmente de investigación: explora si es viable convertir un transformer denso de 4B parámetros en una arquitectura híbrida con atención lineal manteniendo capacidades razonables. El repositorio tiene 0 descargas y 0 likes, y la model card lo describe explícitamente como un backup de migración desde el clúster Bridges-2, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3/GDN (Gated DeltaNet, atención lineal) |
| Parametros totales | 4.546.819.904 (~4,55B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8k tokens (configurado durante el entrenamiento KD) |
| Tipos de cuantizacion | No disponible (solo safetensors publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso decoder-only, y se transforma mediante "surgery" en una arquitectura híbrida que combina capas de atención estándar con capas GDN (Gated DeltaNet), un mecanismo de atención lineal con estado recurrente que reduce el coste computacional en contextos largos. El autor denomina "linearization" al proceso de conversión y publica el código en la rama `backup/bridges2-2026-11-08-gdn` del repositorio GitHub arianraje/Linearization.

El entrenamiento consiste en una destilación de conocimiento desde un modelo profesor (teacher KD) sobre un presupuesto de 200M de tokens y una ventana de 8k tokens. El checkpoint final no conserva estado del optimizador. El nombre del modelo indica el presupuesto configurado, pero el autor remite a `snapshot_meta.json` y a la configuración de entrenamiento guardada para conocer los contadores exactos de tokens procesados. No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO ni detalles del profesor empleado.

## Capacidades

- Generación de texto y razonamiento heredados de la base Qwen3-4B, sujetos a la degradación que pueda introducir la conversión a arquitectura híbrida y la destilación.
- Procesamiento de contexto de hasta 8k tokens, con atención lineal GDN en las capas convertidas.
- Soporte multilingüe presumiblemente heredado de Qwen3, aunque no se documenta en la model card (no disponible).
- Tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking: no documentado.
- Vision o audio: no soportados según la información disponible.

## Casos de uso

- Investigación sobre atención lineal: el modelo sirve como banco de pruebas para estudiar cómo afecta la sustitución de atención estándar por GDN a las capacidades de un transformer de 4B parámetros. Se usaría junto con el código de Linearization para reproducir las evaluaciones guardadas.
- Reproducción de experimentos de destilación: investigadores que quieran replicar el pipeline teacher-KD con presupuestos de 200M tokens y contexto de 8k pueden usar este checkpoint como referencia y comparar con las variantes 4k/400M y 8k/400M del mismo autor.
- Estudio de eficiencia en contextos largos: las capas GDN reducen el coste de atención; el modelo permite medir latencia y memoria frente a Qwen3-4B original en secuencias cercanas a 8k tokens.
- Comparación de arquitecturas híbridas: útil para contrastar GDN con otras alternativas de atención lineal (Mamba, RWKV, sliding window) sobre la misma base Qwen3-4B.
- Base para fine-tuning experimental: partiendo de este checkpoint se pueden explorar adaptaciones posteriores (LoRA, SFT) para evaluar si la híbridación preserva la plasticidad del modelo original.
- Auditoría de procesos de "surgery": el manifiesto `BACKUP_MANIFEST.json` con checksums SHA-256 permite verificar la integridad de los pesos y validar pipelines de conversión de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el snapshot incluye "original evaluation outputs", pero no se proporcionan cifras en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contexto moderado.
- VRAM estimada en cuantización 8-bit: ~4,6 GB de pesos; en 4-bit: ~2,3 GB de pesos (aunque no se publican GGUF ni cuantizaciones oficiales).
- GPU recomendadas: A100 40GB o H100 para entrenamiento y evaluación a contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto de 8k.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16; en GPUs de 8-12 GB requeriría cuantización, que no está disponible oficialmente.
- Opciones de despliegue: al no ser un checkpoint estándar de Qwen, no es compatible directamente con vLLM, TGI o llama.cpp sin adaptar el código de Linearization. El autor indica usar la rama `backup/bridges2-2026-11-08-gdn` del repositorio GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-200m | ~4,55B | 8k | Híbrido Qwen3/GDN | No disponible | Hugging Face (0 descargas) |
| arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m | ~4,55B (presumible) | 4k | Híbrido Qwen3/GDN | No disponible | Hugging Face |
| arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m | ~4,55B (presumible) | 8k | Híbrido Qwen3/GDN | No disponible | Hugging Face |
| Qwen3-4B (base original) | ~4B | 32k (típico en Qwen3) | Transformer denso | Apache 2.0 (según Qwen3) | Hugging Face, ecosistema amplio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint estándar de Qwen: requiere el código específico de Linearization para cargarse; las herramientas habituales (vLLM, llama.cpp, Ollama, TGI) pueden fallar o producir resultados incorrectos sin adaptación.
- Estado de backup: la model card lo describe como un snapshot de migración desde el clúster Bridges-2, sin estado del optimizador y sin garantía de mantenimiento.
- Licencia no especificada: no se indica licencia, lo que impide evaluar el uso comercial y genera incertidumbre legal para producción.
- Idiomas no documentados: aunque herede el multilingüismo de Qwen3, no hay confirmación ni evaluación publicada.
- Riesgo de degradación por la conversión: la sustitución de atención por GDN y la destilación con solo 200M tokens pueden reducir calidad frente al Qwen3-4B original; no hay benchmarks que lo cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de 4B; sin evaluaciones publicadas no se puede acotar.
- Contexto limitado a 8k: inferior al contexto nativo de Qwen3-4B, lo que restringe casos de uso con documentos largos.
- Sesgos: no documentados; se heredarían los de la base Qwen3 y el dataset de destilación, desconocido.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones 4/8-bit publicadas, lo que limita el despliegue en hardware modesto.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-200m
- Código (rama de backup): https://github.com/arianraje/Linearization/tree/backup/bridges2-2026-11-08-gdn
- Variante relacionada (4k, 400M): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
- Variante relacionada (dataset-KD, 8k, 400M): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m
