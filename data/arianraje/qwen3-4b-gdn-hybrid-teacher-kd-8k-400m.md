# arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-400m

## Resumen

`arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-400m` es un checkpoint de investigación publicado por el usuario arianraje en Hugging Face. No se trata de un modelo base de Qwen, sino de una variante "híbrida" del Qwen3-4B en la que se han sustituido o combinado capas de atención con mecanismos GDN (Gated DeltaNet, una arquitectura de atención lineal con estado recurrente). El propio autor indica en la model card que "no es un checkpoint estándar de Qwen" y que requiere el código de linealización de su rama de respaldo en GitHub.

El checkpoint forma parte de un experimento de destilación de conocimiento (KD) con presupuesto de tokens de 8k y una ventana de extensión de 400M (según la nomenclatura del nombre), ejecutado en el clúster Bridges-2. El snapshot corresponde a la migración de respaldo final del directorio de checkpoints del proyecto y conserva los pesos híbridos Qwen3/GDN, el tokenizer, la configuración, metadatos de la cirugía de linealización y las salidas de evaluación originales.

Por su naturaleza, es un artefacto de investigación reproducible más que un modelo listo para producción: no incluye estado del optimizador, no declara licencia, idiomas ni pipeline, y la información disponible sobre su entrenamiento y rendimiento es mínima. Resulta relevante para quienes investigan arquitecturas híbridas atención-lineal/atención-completa y destilación sobre Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3 / GDN (Gated DeltaNet), derivada de Qwen3-4B mediante linealización de capas |
| Parametros totales | 4.546.819.904 (~4,55B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (el nombre indica configuración de 8k) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se incluyen GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,3 GB, incluye tokenizer, configuración y metadatos de la cirugía) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y aplica una transformación de "linealización" que sustituye parte de las capas de atención softmax por capas GDN (Gated DeltaNet), una variante de atención lineal con compuertas y estado recurrente. El resultado es un transformer híbrido que combina atención cuadrática clásica con atención lineal de coste constante por token, lo que en teoría reduce el coste de memoria y cómputo en contextos largos. El autor no detalla en la información disponible el número exacto de capas convertidas ni la proporción híbrida.

El entrenamiento se describe como destilación de conocimiento desde un modelo profesor ("teacher-kd") con un presupuesto configurado de 8k tokens y una ventana de extensión de 400M, ejecutado en Bridges-2. No se especifican la composición del dataset, el número exacto de tokens vistos, ni si hubo RLHF, DPO o fases de alineación posteriores. Tampoco se documenta la innovación de decodificación especulativa ni detalles de atención lineal más allá de la propia sustitución GDN. La model card remite a `snapshot_meta.json` y a la configuración de entrenamiento guardada para los contadores exactos, y a la rama `backup/bridges2-2026-11-08-gdn` del repositorio `arianraje/Linearization` para el código de linealización compatible.

## Capacidades

- Generación de texto autoregresiva heredada del backbone Qwen3-4B, sujeta a la fidelidad de la cirugía de linealización.
- Razonamiento y matemáticas: capacidades potenciales del modelo base, no verificadas en este checkpoint.
- Generación de código: capacidades potenciales del modelo base, no verificadas en este checkpoint.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base Qwen3 es multilingüe, pero no se declara en esta ficha.
- Capacidades especiales (thinking mode, visión, audio): no documentadas; no se declara modo de razonamiento explícito.
- Evaluación: el snapshot incluye las salidas de evaluación originales del experimento, pero no se publican resultados en la información disponible.

## Casos de uso

- Investigación en arquitecturas híbridas: servir como punto de partida reproducible para estudiar el efecto de sustituir atención softmax por GDN en un transformer de ~4,5B parámetros, comparando con el Qwen3-4B original.
- Reproducción de experimentos de destilación: el snapshot conserva configuración, tokenizer y metadatos de la cirugía, lo que permite reejecutar el pipeline de KD con el código de la rama de respaldo.
- Análisis de eficiencia en contextos largos: evaluar empíricamente si la componente lineal reduce el coste de memoria y latencia en secuencias de 8k tokens frente a la atención completa.
- Estudio de degradación por linealización: medir la pérdida de calidad en tareas de razonamiento y código al convertir capas de atención, usando las evaluaciones originales guardadas como referencia.
- Base para fine-tuning experimental: partir de los pesos híbridos para adaptaciones posteriores (SFT, LoRA) en entornos de investigación con recursos limitados.
- Docencia y formación: ilustrar en cursos de arquitecturas de modelos el proceso de cirugía de un checkpoint y la gestión de artefactos de respaldo con manifiestos y checksums.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El snapshot incluye las salidas de evaluación originales del experimento, pero sus valores no se recogen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos (4,55B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~4,6 GB de pesos; en 4 bits: ~2,3 GB de pesos (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para experimentación con contexto de 8k y batches grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12-24 GB en bf16 o cuantizado, siempre que se use el código de linealización compatible.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no ser un checkpoint estándar de Qwen, requiere el código de la rama `backup/bridges2-2026-11-08-gdn` del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-gdn-hybrid-teacher-kd-8k-400m | ~4,55B | no disponible (config. 8k) | Híbrida Qwen3/GDN | no disponible | Hugging Face (0 descargas) |
| Qwen3-4B (base) | ~4B | no disponible en esta ficha | Transformer denso | no disponible en esta ficha | Hugging Face (oficial) |
| qwen3-4b-gdn-hybrid-dataset-kd-8k-400m | no disponible | no disponible | Híbrida Qwen3/GDN | no disponible | Hugging Face (mismo autor) |
| qwen3-4b-gdn-hybrid-teacher-kd-4k-400m | no disponible | no disponible (config. 4k) | Híbrida Qwen3/GDN | no disponible | Hugging Face (mismo autor) |

## Limitaciones y advertencias

- No es un checkpoint estándar de Qwen: requiere el código de linealización de la rama `backup/bridges2-2026-11-08-gdn`; los frameworks convencionales pueden no cargarlo correctamente.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: el comportamiento multilingüe no está verificado para esta variante.
- Sin estado del optimizador: no es reanudable para entrenamiento desde este snapshot.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad tras la cirugía de linealización.
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen3-4B, no evaluados en esta variante.
- Artefacto de investigación con 0 descargas y 0 likes: sin validación comunitaria ni soporte.
- Nomenclatura ambigua: "8k" y "400M" se refieren a la configuración del experimento; los contadores exactos deben consultarse en `snapshot_meta.json`.
- Repo de 9,3 GB: incluye artefactos de evaluación y metadatos además de los pesos; conviene revisar `BACKUP_MANIFEST.json` antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-8k-400m
- Código de linealización: https://github.com/arianraje/Linearization/tree/backup/bridges2-2026-11-08-gdn
- Variante dataset-KD 8k: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-dataset-kd-8k-400m
- Variante teacher-KD 4k: https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-teacher-kd-4k-400m
