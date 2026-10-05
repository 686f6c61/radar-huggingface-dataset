# davidheineman/rlve-archive-mixing-hero-kl-proposals-20260930-1120-03-natural-r1distill-006844b43afd

## Resumen

El modelo identificado como `davidheineman/rlve-archive-mixing-hero-kl-proposals-20260930-1120-03-natural-r1distill-006844b43afd` es un checkpoint de investigación archivado, no un modelo publicado como producto. Según su model card, se trata del estado final (paso 999) de una ejecución de entrenamiento completada dentro de un pipeline interno denominado "mixing-hero-kl-proposals", con ruta de scratch `runs/mixing-hero-kl-proposals-20260930-112004/resumable/03-natural-r1distill`. El repositorio existe únicamente para preservar ese checkpoint.

El peso real de los ficheros safetensors es de 1.777.088.000 parámetros (~1,78 mil millones), lo que sitúa al modelo en la gama pequeña de modelos decoder-only. La etiqueta `qwen2` indica que la arquitectura subyacente es la familia Qwen2, aunque la model card no especifica la longitud de contexto con la que fue entrenado ni la composición de los datos. El identificador del repositorio, con el sufijo `natural-r1distill`, sugiere una variante relacionada con destilación, pero esto no está confirmado por el autor.

La relevancia de esta ficha es principalmente documental: sirve para catalogar un artefacto de investigación reproducible (con run ID de W&B y ruta de checkpoint Megatron) dentro de un archivo de experimentos de RLVE. No hay señales de que sea un modelo pensado para producción: cero descargas, cero likes, sin licencia declarada y sin model card técnica más allá de los metadatos de archivado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tag `qwen2`); detalles de configuración no disponibles |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE); no disponible |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | No disponible; el repo publica únicamente pesos safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato indicado como `hf-safetensors`); incluye directorio `checkpoint/` con el estado Megatron distribuido |
| Tamano del repositorio | 3,6 GB |
| Paso final de entrenamiento | 999 |
| Run ID de W&B | 6276ead7 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es la etiqueta `qwen2`, que sitúa el modelo en la familia Qwen2 de Alibaba: transformers decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y sesgo de atención (QKV bias) en la variante original de Qwen2. Con 1.777.088.000 parámetros, el tamaño se corresponde aproximadamente con la clase de 1,5-1,8 B de esa familia, aunque no se puede confirmar la correspondencia exacta con ninguna configuración publicada (número de capas, dimensiones ocultas, cabezas de atención) porque la model card no incluye `config.json` comentado ni hiperparámetros.

Respecto al entrenamiento, lo único documentado es que se trata del checkpoint final (paso 999) de una ejecución completada, con identificador de W&B `6276ead7` y ruta de scratch `runs/mixing-hero-kl-proposals-20260930-112004/resumable/03-natural-r1distill`. El nombre de la ejecución menciona "kl-proposals", lo que apunta a un esquema de optimización con regularización o propuestas basadas en divergencia KL, pero no hay información sobre el número de tokens, la composición del dataset, si hubo fases de RLHF/DPO/SFT ni sobre ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). El sufijo `natural-r1distill` sugiere una etapa de destilación, probablemente desde un modelo mayor, pero es una inferencia a partir del nombre, no un dato confirmado.

## Capacidades

- Generación de texto autoregresiva: capacidades esperables por arquitectura y tamaño, no verificadas experimentalmente en la información disponible.
- Razonamiento y matemáticas: no disponible; el nombre del checkpoint sugiere una posible etapa de destilación, sin evidencia publicada.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible, no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; los tags no incluyen `vision` ni `multimodal`.
- Compatibilidad de formato: al ser pesos safetensors de arquitectura Qwen2, es probable su conversión a GGUF para llama.cpp u Ollama, pero no se ha validado en el repo.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio conserva el estado exacto del paso 999 junto con la ruta de scratch y el run ID de W&B, lo que permite a un equipo auditar o continuar la ejecución original dentro del mismo pipeline.
- Análisis de dinámicas de entrenamiento: el nombre "kl-proposals" apunta a un esquema con propuestas guiadas por divergencia KL; un investigador podría inspeccionar los pesos para estudiar cómo afecta ese objetivo al modelo final.
- Base para experimentos de destilación: si el sufijo `natural-r1distill` refleja realmente una etapa de destilación, el checkpoint serviría como punto de partida para comparar contra el modelo profesor o para estudiar la transferencia de capacidades a 1,78 B de parámetros.
- Fine-tuning sobre dominio específico: con 1,78 B de parámetros, el ajuste completo cabe en una GPU de 24 GB en precisión mixta y en GPUs de 8-12 GB con LoRA/QLoRA, por lo que es viable como base de experimentos académicos de bajo coste.
- Evaluación comparativa interna: sirve como brazo de control frente a otros checkpoints de la misma familia Qwen2 de tamaño similar dentro de un benchmark privado.
- Despliegue en local para pruebas: en cuantización de 4 bits ocuparía alrededor de 1 GB de pesos, lo que permite ejecutarlo en un portátil o en una GPU de gama de entrada para pruebas de integración de pipelines, siempre que la licencia se aclare.
- Docencia y divulgación: un modelo de 1,78 B con pesos abiertos en safetensors es adecuado para ilustrar el ciclo completo de carga, tokenización e inferencia en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y no existe documentación asociada (paper, blog o informe técnico) enlazada desde el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - bf16/fp16: aproximadamente 3,6 GB de pesos; con caché KV y overhead del runtime, entre 5 y 7 GB.
  - int8: aproximadamente 1,8 GB de pesos; entre 3 y 4 GB en ejecución.
  - int4: aproximadamente 0,9-1,1 GB de pesos; entre 2 y 3 GB en ejecución.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4060 Ti, A10G). Para int4 basta con 4-6 GB (GTX 1650 4 GB puede quedarse justa con caché KV largo; RTX 3050 8 GB es suficiente).
- Cabe en GPU de consumo: sí. En bf16 cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090. En 4 bits cabe incluso en iGPU con memoria unificada y en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM y TGI requieren pesos en safetensors y un `config.json` compatible con Qwen2, lo que es plausible pero no está verificado en el repo. llama.cpp y Ollama necesitarían conversión previa a GGUF, no publicada por el autor. Para uso mínimo basta `transformers` con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 1,78 B en una RTX 4090 en bf16 suele moverse en el rango de decenas a varios centenares de tokens por segundo con batching, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (rlve-archive-03-natural-r1distill) | 1,78 B | No disponible | No disponible | Safetensors, 0 descargas | Checkpoint de investigación archivado, sin benchmarks |
| Qwen2-1.5B | ~1,5 B | 32.768 tokens (configuración habitual de la familia) | Apache 2.0 (versión base publicada) | HuggingFace, ampliamente usado | Modelo de referencia de la misma familia arquitectónica |
| Qwen2.5-1.5B | ~1,5 B | 32.768 tokens (ampliable) | Apache 2.0 (excepto variantes de 3 B y 72 B) | HuggingFace | Sucesor con mejor rendimiento declarado por el autor |
| SmolLM2-1.7B | ~1,7 B | 8.192 tokens (según publicación) | Apache 2.0 | HuggingFace | Alternativa de tamaño casi idéntico orientada a edge |

No hay datos de rendimiento de este checkpoint que permitan una comparación cuantitativa real; la tabla recoge solo parámetros, contexto y licencia de alternativas conocidas como referencia de categoría.

## Limitaciones y advertencias

- Ausencia de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en producción requiere contactar con el autor.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, sesgos ni evaluaciones. No es posible estimar el riesgo de alucinación ni la calidad real de las respuestas.
- Riesgo de alucinación: no evaluado. Al ser un checkpoint intermedio de investigación y no un modelo alineado publicado, es probable que no haya pasado por fases intensivas de RLHF/DPO, aunque esto no está confirmado.
- Idiomas: no declarados; no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma.
- Contexto: se desconoce la ventana efectiva, lo que impide planificar casos de uso con prompts largos o conversaciones multi-turno extensas.
- Artefacto de archivo: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso por terceros ni de validación externa.
- Nomenclatura interna: los nombres `rlve`, `scratch-archive` y `mixing-hero-kl-proposals` corresponden a un pipeline privado; sin acceso a ese código no se puede reproducir el entrenamiento.
- Fecha de creación registrada como 2026-10-05, posterior a la mayoría de referencias públicamente verificables; conviene confirmar la procedencia del repositorio antes de integrarlo en cualquier flujo.
- Reproducibilidad: la model card menciona un directorio `checkpoint/` con estado Megatron distribuido, que puede no ser cargable directamente con `transformers`.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mixing-hero-kl-proposals-20260930-1120-03-natural-r1distill-006844b43afd
- Perfil del autor: https://huggingface.co/davidheineman
- Run de W&B: identificador `6276ead7` (no se ha encontrado URL pública en la información disponible)
- Paper, blog o repositorio asociado: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo (los enlaces devueltos no guardan relación con el artefacto descrito)
