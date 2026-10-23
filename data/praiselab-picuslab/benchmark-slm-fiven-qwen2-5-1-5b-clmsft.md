# praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-clmsft` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base Qwen/Qwen2.5-1.5B. No se trata, por tanto, de un modelo entrenado desde cero, sino de un conjunto de pesos delta (safetensors) que deben cargarse junto con el checkpoint base para poder ejecutar inferencia. El repositorio está etiquetado como `benchmark-slm`, con los tags `or2`, `dataset-fiven` y `strategy-clmsft`, lo que apunta a un artefacto generado dentro de una campana de evaluación comparativa de modelos pequenos (SLM) y no a un modelo orientado a producto.

El único idioma declarado es el italiano (`it`) y la licencia no está especificada en la información disponible. El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos. El repositorio, creado y actualizado el 23 de octubre de 2026 con escasos segundos de diferencia, registra 0 descargas y 0 likes, y su tamaño es de 0.0 GB, lo que sugiere un artefacto recién subido y sin validación por parte de la comunidad.

Su relevancia práctica es limitada y muy acotada: sirve como referencia para reproducir o auditar un experimento de fine-tuning con LoRA sobre Qwen2.5-1.5B en italiano, pero no hay evidencia publicada de calidad, evaluación o soporte que lo haga apto para producción. Cualquier uso realista debería partir del modelo base Qwen2.5-1.5B y tratar este adaptador como un objeto de estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptador LoRA entrenado mediante PEFT |
| Parametros totales | ~1.540 millones en el modelo base Qwen2.5-1.5B; número de parámetros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado para este adaptador |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones de la comunidad (GGUF, AWQ, GPTQ) no verificadas para este repositorio |
| Idiomas soportados | italiano (`it`) declarado en la model card; el modelo base Qwen2.5 cubre 29+ idiomas |
| Licencia | no disponible; el modelo base Qwen2.5-1.5B se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Repositorio | 0.0 GB, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B, un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, embeddings de posición rotatorios (RoPE) y atención con query grouping (GQA). El modelo base tiene 28 capas, dimensión oculta de 1.536, dimensión intermedia de 8.960, 12 cabezas de consulta y 2 cabezas de clave/valor, con un vocabulario de 151.936 tokens y embeddings atados. Su ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 mediante escalado YaRN.

Del adaptador en sí no se dispone de información sobre rango LoRA, alpha, capas objetivo, número de pasos, epochs, tasa de aprendizaje ni composición del dataset. El tag `dataset-fiven` sugiere el uso de un conjunto de datos denominado "fiven", y `strategy-clmsft` apunta a una estrategia de entrenamiento que combina modelado de lenguaje causal (CLM) con ajuste supervisado (SFT), pero ninguno de estos extremos está documentado en la información proporcionada. Tampoco consta si hubo una fase de alineación posterior (RLHF o DPO) específica para este adaptador; el modelo base instruct de Qwen2.5 sí incorpora SFT y DPO, pero este repositorio parte del checkpoint base, no necesariamente del Instruct.

## Capacidades

- Generación de texto en italiano, presumiblemente condicionada al dominio del dataset de ajuste, que no está documentado.
- Herencia de las capacidades del modelo base Qwen2.5-1.5B: razonamiento básico, matemáticas elementales y generación de código, con el límite propio de un modelo de 1.5B parámetros.
- Soporte de tool calling y function calling: disponible en el modelo base Qwen2.5 en su variante Instruct; no confirmado en este adaptador.
- Razonamiento multi-paso y uso como agente: no evaluado en este repositorio.
- Capacidades multilingües: limitadas al italiano según la model card; el resto de idiomas del modelo base pueden degradarse tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; Qwen2.5-1.5B es un modelo exclusivamente de texto.
- Al ser un adaptador LoRA, puede combinarse con el base mediante `merge_and_unload` de PEFT o cargarse en caliente con `PeftModel`.

## Casos de uso

- Reproducción de experimentos de benchmarking de SLM: el adaptador permite replicar la configuración `strategy-clmsft` sobre Qwen2.5-1.5B y comparar el efecto del ajuste frente al modelo base en la misma partición de evaluación. Es su uso más plausible dado el etiquetado `benchmark-slm`.
- Auditoría de adaptadores LoRA: sirve para estudiar cómo un ajuste de bajo rango sobre un modelo de 1.5B afecta a la perplejidad y a la fluidez en italiano, cargándolo con `PeftModel.from_pretrained` junto al checkpoint base.
- Generación de texto en italiano para prototipos internos: con ~1 GB en cuantización Q4, puede desplegarse en una GPU de consumo para pruebas de generación de textos cortos, asumiendo que no existe evaluación de calidad publicada.
- Investigación sobre olvido catastrófico: al partir de un modelo multilingüe y ajustarlo solo en italiano, es un caso de estudio útil para medir la degradación en otros idiomas comparando salidas antes y después de aplicar el adaptador.
- Fine-tuning incremental sobre el adaptador: al ser pesos delta, se puede seguir entrenando con nuevos datos sin tocar los pesos base, útil en entornos con VRAM limitada (el adaptador ocupa decenas de MB).
- Docencia y formación técnica: ejemplo didáctico de pipeline PEFT completo (carga del base, aplicación del adaptador, merge y exportación a GGUF) en un modelo lo bastante pequeño para ejecutarse en portátiles con GPU de 8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye el tag `benchmark-slm`, pero no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de evaluaciones en italiano (por ejemplo, HELLASWAG-IT o PAWS-IT) asociadas a este adaptador. Tampoco consta una comparación con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~3,1 GB solo para los pesos del modelo base (1.540 M × 2 bytes), más ~1-2 GB de overhead de runtime y caché KV; en la práctica, 5-6 GB para contextos moderados.
- VRAM en INT8: ~1,6 GB de pesos, con un total realista de 2,5-3 GB.
- VRAM en cuantización de 4 bits (Q4_K_M): ~1,0-1,1 GB de pesos, con un total de 2-2,5 GB incluyendo contexto.
- Caché KV del modelo base: con GQA (2 cabezas KV, 28 capas, dimensión de cabeza 128) se estiman ~14 KB por token en FP16, es decir, ~0,9 GB para una ventana completa de 32.768 tokens.
- El adaptador LoRA en sí ocupa típicamente entre 10 y 100 MB (el repositorio reporta 0.0 GB), por lo que no altera sustancialmente los requisitos.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; también cabe en GPUs de 8 GB si se usa cuantización de 4 bits y contextos moderados.
- GPU de datacenter: A100, H100, L40S y L4 son sobredimensionadas para un modelo de este tamaño; resultan adecuadas únicamente para servir muchas réplicas en paralelo.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA con `--enable-lora`), TGI, llama.cpp y Ollama tras fusionar el adaptador con el base y convertir a GGUF, y Transformers + PEFT para prototipado.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| benchmark-slm-fiven-qwen2.5-1.5b-clmsft (este) | ~1.540 M (adaptador LoRA sobre Qwen2.5-1.5B) | 32.768 en el base, no confirmado en el adaptador | no disponible | gated, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.540 M | 32.768 (hasta 131.072 con YaRN) | Apache-2.0 | pública, ampliamente utilizada |
| meta-llama/Llama-3.2-1B-Instruct | ~1.240 M | 131.072 | Llama 3.2 Community License | gated, muy extendida |
| google/gemma-2-2b-it | ~2.600 M | 8.192 | Gemma Terms of Use | gated, muy extendida |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K) para este adaptador, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. En igualdad de parámetros, Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct son las alternativas naturales para producción, con licencias claras y ecosistema de cuantizaciones mantenido.

## Limitaciones y advertencias

- Licencia no especificada: no hay base legal explícita para uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Acceso restringido (gated): la descarga requiere aceptar condiciones en HuggingFace, lo que impide su uso automatizado en pipelines sin gestión previa de credenciales.
- Ausencia total de validación: 0 descargas, 0 likes y un tamaño de repositorio de 0.0 GB, lo que puede indicar que los pesos del adaptador no están efectivamente subidos o que el artefacto está incompleto.
- Sin evaluación publicada: no hay métricas que permitan estimar la calidad del ajuste ni compararlo con el modelo base.
- Idioma limitado: solo se declara italiano; es esperable cierto grado de olvido catastrófico en el resto de idiomas del modelo base tras el ajuste.
- Riesgo de alucinación: inherente a un modelo de 1.5B parámetros, agravado por la falta de una fase de alineación documentada.
- Sesgos: no documentados; el adaptador hereda los sesgos del corpus de ajuste (`dataset-fiven`), cuya composición se desconoce.
- Naturaleza de benchmark: los tags sugieren que es un artefacto de experimento, no un modelo mantenido; no hay garantía de actualizaciones ni de soporte.
- Requiere el modelo base Qwen2.5-1.5B para funcionar; no es autónomo y no puede desplegarse como un único artefacto sin fusionar previamente.
- No apto para tool calling en producción sin verificación previa, ya que la capacidad depende de la variante del base utilizada y del grado de degradación introducido por el ajuste.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-clmsft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de PEFT en GitHub: https://github.com/huggingface/peft
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper, demo o blog específico del adaptador: no disponible en la información proporcionada.
