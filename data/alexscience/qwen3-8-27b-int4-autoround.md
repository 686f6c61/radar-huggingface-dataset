# AlexScience/Qwen3.8-27B-int4-AutoRound

## Resumen

AlexScience/Qwen3.8-27B-int4-AutoRound es una cuantización INT4 del modelo Qwen3.8-27B (modelo denso multimodal de 27B de Qwen, publicado en agosto de 2026) generada con AutoRound de Intel. El artefacto no es una simple conversión de pesos: está construido como «slot» compatible con el stack vLLM de doble RTX 3090 del proyecto club-3090, y replica la receta del cuantizado previo Qwen3.6-27B-int4-AutoRound. Emplea un esquema W4A16 (pesos de 4 bits, activaciones en FP16), group_size 128 y empaquetado `auto_round:auto_gptq`, reduciendo el peso de ~54 GB en BF16 a ~19.6 GB (~2,7x de reducción).

La particularidad técnica del repositorio es la preservación íntegra de la cabeza de Multi-Token Prediction (MTP) en BF16 (`mtp.fc` y las siete lineales de `mtp.layers.0`), lo que habilita decodificación especulativa nativa en vLLM. Según el autor, esto produce una mejora medida de 1,55x en throughput de decodificación (127 frente a 82 tok/s en un solo stream sobre RTX 5090) con una aceptación de borrador de 0,69 en modo greedy.

El modelo base es un VLM denso con arquitectura híbrida Gated DeltaNet + atención completa, orientado a código, flujos agénticos y automatización de oficina. La ficha del repositorio incluye además una advertencia relevante sobre inestabilidad de la ruta GDN+MTP en vLLM 0.27.x, que el autor atribuye al motor y no a los pesos, con verificación sha256 del artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención linear) + atención completa; VLM denso con torre de visión; cabeza MTP (Multi-Token Prediction) |
| Parametros totales | 6.284.446.960 según metadatos de safetensors del repo; la model card y el nombre del modelo indican 27B. Discrepancia no aclarada en la información disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (referenciado en la validación); validado a 32.768 tokens / 32 secuencias en una RTX 5090 de 32 GB |
| Tipos de cuantizacion | INT4 W4A16 (pesos 4 bits, activaciones FP16), group_size 128, simétrico, empaquetado `auto_round:auto_gptq`. Capas excluidas en BF16: `linear_attn.in_proj_a/b`, cabeza MTP completa (`mtp.fc`, `mtp.layers.0.*`), LayerNorms/RMSNorms, routers, torre de visión, embeddings y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 19,6 GB; equivalente BF16 ~54 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM/VLM denso de 27B parámetros con arquitectura híbrida que combina bloques de Gated DeltaNet (atención linear con proyecciones de bajo rango `in_proj_a`/`in_proj_b`) con capas de atención completa, más una torre de visión para entrada de imágenes. Incluye una cabeza de Multi-Token Prediction que actúa como borrador nativo para decodificación especulativa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

El proceso de cuantización se realizó con `auto-round` 0.14.2 (receta por defecto, 200 iteraciones, `torch.compile` activado, 128 muestras de calibración) partiendo siempre del repo BF16 y nunca del FP8. Se ejecutó en una única RTX 5090 (32 GB, SM120) con `low_gpu_mem_usage=True`, en ~1 h 10 min, con picos de 27,7 GB de VRAM y 23,7 GB de RAM. La innovación diferencial es el tratamiento de la cabeza MTP: `mtp.fc` se excluyó de forma nativa con `--fp_layers mtp.fc` y las siete lineales de `mtp.layers.0` (que el exportador de 0.14.2 empaqueta por RTN sin ajuste) se sustituyeron a posteriori por los pesos BF16 originales del modelo base mediante cirugía de un único shard en `model_extra_tensors.safetensors`, marcándolas como 16-bit fp en `quantization_config.extra_config`. La cabeza completa ocupa ~220 MB, por lo que el impacto en tamaño es despreciable.

## Capacidades

- Generación de texto y código: validado con generación de Python correcta y coherente en vLLM 0.27.1.
- Visión: modelo multimodal con torre de visión preservada en BF16; validado con descripción correcta de una escena en una foto sin etiquetar.
- Modo thinking: la model card reporta tasas de aceptación del borrador MTP diferenciadas para modo no-thinking (~0,58 con muestreo) y thinking (~0,47, temperatura 1.0), lo que implica soporte de razonamiento extendido.
- Decodificación especulativa nativa: la cabeza MTP en BF16 permite usar `--speculative-config` en vLLM sin pasos adicionales.
- Razonamiento matemático y multimodal: el repo oficial del modelo base referencia evaluaciones MathVision, aunque no se aportan cifras para esta cuantización.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades agénticas y multi-step: el repo oficial del modelo base menciona «agentic workflows», sin detalles técnicos ni métricas en la información disponible.
- Multilingüismo: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con doble RTX 3090: el checkpoint está diseñado como slot directo del stack club-3090 (TP=2) con un cambio de dos líneas en el compose; el rig objetivo tiene holgura para el contexto completo de 131.072 tokens.
- Servicio de inferencia mono-GPU en RTX 5090: validado a 32.768 tokens de contexto y 32 secuencias concurrentes, con 127 tok/s de decodificación en un stream usando MTP, adecuado para asistentes interactivos de baja latencia.
- Generación de código en pipelines internos: la validación de generación de Python correcta y el soporte de decodificación especulativa lo hacen apto para autocompletado y generación de scripts donde el coste por token importa.
- Procesamiento de documentos con imagen: al conservar la torre de visión en BF16, puede describir y extraer información de capturas, diagramas o fotos, útil en automatización de oficina.
- Tareas de razonamiento con presupuesto de latencia ajustado: el modo thinking combinado con MTP (aceptación ~0,47 a temperatura 1.0) permite cadenas de razonamiento largas manteniendo velocidad de decodificación superior a la del modelo sin especulación.
- Evaluación comparativa de recetas de cuantización: al ser formato-idéntico a otras variantes AutoRound del mismo modelo, sirve como referencia reproducible para medir impacto de decisiones como mantener la cabeza MTP en BF16 frente a cuantizarla.
- Sustitución de BF16 en memoria limitada: reduce de ~54 GB a ~19,6 GB, lo que permite ejecutar un modelo de 27B donde el BF16 exigiría dos GPUs de 48 GB o descarga a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son las puertas de validación y el throughput en RTX 5090 con vLLM 0.27.1:

| Metrica | Resultado |
|---|---|
| Generación de código | PASS — Python correcto y coherente |
| Aceptación MTP (greedy) | 0,69 |
| Aceptación MTP (muestreo, no-thinking) | ~0,58 |
| Aceptación MTP (thinking, temperatura 1.0) | ~0,47 |
| Throughput decodificación con MTP | 127 tok/s (single stream, RTX 5090) |
| Throughput decodificación sin MTP | 82 tok/s (single stream, RTX 5090) |
| Aceleración por MTP | 1,55x (completado de 900 tokens: 7,1 s frente a 11,0 s) |
| Visión | PASS — descripción correcta de escena |
| Aceptación MTP con `--no-async-scheduling --no-enable-prefix-caching` | 0,79–1,00 por ventanas, hasta 37k+ tokens generados y más allá de la posición 32.768, sin colapso |

Un test A/B entre internals MTP en INT4 y en BF16 puntuó de forma idéntica, por lo que el autor atribuye la diferencia frente a reportes previos de 0,8–0,9 a cambios de versión de vLLM y no a la calidad de la cuantización.

## Requisitos de hardware

- VRAM para inferencia: ~19,6 GB solo de pesos. Con caché KV, el autor confirma que 131.072 tokens de contexto provocan OOM en el arranque del KV cache en una GPU de 32 GB compartida con escritorio (el pool de estado híbrido GDN escala con `max_num_seqs`); a 32.768 tokens / 32 secuencias funciona en 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) validada por el autor como plataforma de cuantización y pruebas; doble RTX 3090 en TP=2 es el rig objetivo declarado, con holgura para contexto completo.
- GPU consumer: sí cabe en GPUs de 24 GB en adelante según el tamaño de pesos (estimación), condicionado a reducir contexto y número de secuencias. No se han publicado pruebas en 24 GB.
- Opciones de despliegue: vLLM (versión validada 0.27.1, con `--speculative-config` para activar MTP). El formato de empaquetado `auto_round:auto_gptq` es propio de vLLM/GPTQ; no se mencionan GGUF, llama.cpp, Ollama ni TGI para este repo.
- Latencia y throughput: 127 tok/s con MTP y 82 tok/s sin MTP en decodificación single-stream sobre RTX 5090; 7,1 s frente a 11,0 s para una completación de 900 tokens.
- Consumo durante la cuantización (referencia de recursos): pico de 27,7 GB de VRAM y 23,7 GB de RAM en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | MTP | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| AlexScience/Qwen3.8-27B-int4-AutoRound | INT4 W4A16 AutoRound | 19,6 GB | Sí, cabeza completa en BF16 | 131.072 | no disponible | Orientado a stack club-3090 TP=2; 127 tok/s con MTP en RTX 5090 |
| Frozenlock/Qwen3.8-27B-int4-AutoRound | INT4 AutoRound | ~18 GB | Sí, cabeza MTP cuantizada | no disponible | no disponible | Reporta ~+98 % de throughput de decodificación con MTP; el autor de esta ficha sostiene que cuantizar MTP lleva la aceptación a 0 % en vLLM 0.27.x |
| Qwen3.8-27B-MixedInt4-AutoRound (Pilcothink) | INT4 mixto AutoRound | 20,8 GB | no disponible | no disponible | no disponible | Optimizado para un único DGX Spark; prioriza preservar calidad del modelo original |
| Qwen/Qwen3.8-27B (base) | BF16 | ~54 GB | Sí (nativo) | no disponible | no disponible | Referencia de calidad; requiere mucha más memoria |

## Limitaciones y advertencias

- Discrepancia de parámetros: los metadatos de safetensors del repo declaran 6.284.446.960 parámetros, mientras que el nombre y la model card indican 27B. Conviene verificar el conteo real antes de dimensionar hardware o comparar con otras variantes.
- Bug de motor en vLLM 0.27.x: la ruta híbrida GDN + MTP es inestable con prefix caching y/o async scheduling activados; provoca `CUDA illegal memory access` o, en TP=2, el colapso permanente de la aceptación del borrador a 0 % tras superar la posición 32.768, persistiendo hasta reiniciar (vllm#52873, cerrado como not-planned; familia de crashes #37035/#34948). Mitigación documentada: `--no-async-scheduling --no-enable-prefix-caching`.
- El rendimiento con MTP depende de la versión del motor: la aceptación medida (0,69 greedy) es inferior a los 0,8–0,9 reportados con versiones anteriores de vLLM.
- Contexto práctico limitado en GPUs de 32 GB compartidas: 131.072 tokens provocan OOM en el arranque del KV cache; el contexto completo requiere el rig de doble GPU o hardware con más memoria.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen3.8-27B antes de usarlo en producción.
- Idiomas soportados no documentados: no hay garantía sobre calidad fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación: inherente a los LLM; no se han publicado evaluaciones de factualidad ni tasas de alucinación para esta cuantización.
- Sesgos: no se ha publicado ningún análisis de sesgos en la información disponible.
- Sin métricas de calidad de benchmarks: la validación se limita a pruebas cualitativas (código y visión) y a métricas de aceptación MTP; no hay MMLU, HumanEval ni GSM8K que permitan cuantificar la pérdida de calidad frente al BF16.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta, un solo autor, sin revisión comunitaria.
- Compatibilidad restringida: el formato `auto_round:auto_gptq` con capas mixtas BF16 está pensado para vLLM; no se ofrecen GGUF ni otras alternativas de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlexScience/Qwen3.8-27B-int4-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo oficial del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- AutoRound (Intel): https://github.com/intel/auto-round
- Stack club-3090 (doble RTX 3090 + vLLM): https://github.com/noonghunna/club-3090
- Cuantización de referencia Qwen3.6-27B-int4-AutoRound: https://huggingface.co/Lorbus/Qwen3.6-27B-int4-AutoRound
- Issue de vLLM sobre GDN + MTP: https://github.com/vllm-project/vllm/issues/52873
- Cuantización alternativa de Frozenlock: https://huggingface.co/Frozenlock/Qwen3.8-27B-int4-AutoRound
- Variante MixedInt4 para DGX Spark (hilo NVIDIA): https://forums.developer.nvidia.com/t/qwen3-8-27b-mixedint4-autoround-optimized-for-a-single-dgx-spark/380248
- Variante MixedInt4 de Pilcothink: https://huggingface.co/Pilcothink/Qwen3.8-27B-MixedInt4-AutoRound
