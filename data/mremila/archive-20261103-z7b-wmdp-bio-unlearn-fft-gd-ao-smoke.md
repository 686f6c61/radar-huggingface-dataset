# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-smoke

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-smoke` es un checkpoint derivado de `HuggingFaceH4/zephyr-7b-beta`, publicado por el usuario `mremila` en Hugging Face. Por su nomenclatura y por los datasets referenciados (`cais/wmdp-bio-forget-corpus` y `Salesforce/wikitext`), se trata de un experimento de *machine unlearning* orientado a eliminar conocimiento biomédico sensible del modelo base mediante ajuste fino supervisado (FFT, *full fine-tuning*). El sufijo `smoke` sugiere que es una ejecución de prueba o de validación de un pipeline más amplio, no un modelo destinado a producción.

El modelo hereda la arquitectura y el tamaño de Zephyr-7b-beta, es decir, un transformer decoder-only de aproximadamente 7.000 millones de parámetros, afinado sobre Mistral-7B-v0.1 con DPO. El objetivo declarado del experimento es el *unlearning* de contenido de bioseguridad (WMDP-Bio), un área de investigación activa por su relevancia en el análisis de riesgos de modelos abiertos. La ficha no aporta métricas de retención ni de olvido, por lo que su valor es principalmente como artefacto reproducible de un pipeline de desaprendizaje.

La relevancia de este checkpoint es metodológica: documenta un paso intermedio (unlearning con FFT y *gradient descent*, probablemente con *ascent* u objetivo de olvido) dentro de una familia de variantes del mismo autor (`5pp-unlearn-fft-me-tar-k16`, `unlearn-fft-npo-wd__relearn-fft`). No debe confundirse con un modelo listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral-7B, vía Zephyr-7b-beta) |
| Parametros totales | ~7.000 millones (heredados del modelo base; no confirmado en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Zephyr-7b-beta soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `HuggingFaceH4/zephyr-7b-beta`, un transformer decoder-only de la familia Mistral con atención de ventana deslizante y RoPE, afinado originalmente con SFT y DPO sobre Mistral-7B-v0.1. Sobre esa base, este experimento aplica un ajuste fino completo (FFT) con un objetivo de *unlearning* sobre el corpus `cais/wmdp-bio-forget-corpus`, que contiene material de bioseguridad que se desea eliminar del modelo. La presencia de `Salesforce/wikitext` como segundo dataset sugiere el uso de texto general como conjunto de retención para monitorizar la degradación de capacidades generales durante el olvido.

La nomenclatura `gd-ao` es consistente con un objetivo de *gradient descent* combinado con *ascent* sobre el conjunto de olvido (una formulación habitual en *unlearning*: minimizar la pérdida en datos retenidos y maximizar la pérdida en datos a olvidar). El sufijo `smoke` indica una ejecución de prueba, probablemente con pocos pasos o un subconjunto reducido. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros ni si hubo etapas posteriores de RLHF o DPO tras el desaprendizaje.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de Zephyr-7b-beta.
- Razonamiento general y respuesta a instrucciones en inglés (idioma dominante del modelo base).
- Capacidad de *tool calling* y *function calling*: no documentada en la ficha; el modelo base no la soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base no está optimizado para ello.
- Capacidades multilingües: limitadas y no documentadas; el modelo base está entrenado mayoritariamente en inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Capacidad biomédica: presumiblemente reducida por el objetivo de *unlearning*, aunque no se aportan métricas que lo confirmen.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como artefacto reproducible para estudiar cómo el FFT con objetivo de olvido afecta a la retención de conocimiento biomédico y a las capacidades generales del modelo.
- Evaluación de pipelines de desaprendizaje: puede usarse como punto de comparación frente a otras variantes del mismo autor (`5pp-unlearn-fft-me-tar-k16`, `unlearn-fft-npo-wd__relearn-fft`) para medir el efecto de distintas formulaciones del objetivo.
- Análisis de degradación de capacidades: comparando sus respuestas con las de Zephyr-7b-beta en benchmarks generales (MMLU, GSM8K) se puede cuantificar el coste del olvido.
- Estudio de robustez frente a *relearning*: junto con las variantes con etapa de reentrenamiento, permite analizar si el conocimiento eliminado puede recuperarse con un ajuste fino posterior.
- Docencia y formación en seguridad de IA: útil como ejemplo práctico de cómo se construye y evalúa un experimento de *unlearning* sobre un modelo abierto de 7B.
- Reproducción de experimentos de bioseguridad: permite validar metodologías de evaluación de riesgo en modelos abiertos sin necesidad de partir del modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~14-16 GB (7B parámetros a 2 bytes por peso, más overhead de activaciones y KV cache).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas para FP16: A100 40GB, H100 80GB, L40S, RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con FP16 y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag presente), vLLM, llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantización. Como referencia, un 7B en FP16 en una RTX 4090 suele entregar decenas de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`archive-20261103-...-smoke`) | ~7B | no disponible | Unlearning biomédico (smoke test) | no disponible | Hugging Face (0 descargas) |
| `HuggingFaceH4/zephyr-7b-beta` (base) | ~7B | 32.768 tokens | Asistente conversacional general | MIT | Hugging Face, ampliamente usado |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | ~7B | no disponible | Unlearning biomédico (variante) | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` | ~7B | no disponible | Unlearning + relearning | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental: el sufijo `smoke` indica una ejecución de prueba; no se recomienda su uso en producción ni como sustituto del modelo base.
- Sin métricas de olvido ni de retención publicadas: no se puede verificar si el conocimiento biomédico se ha eliminado de forma efectiva ni cuánto se ha degradado el rendimiento general.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base Zephyr-7b-beta es MIT, pero la licencia de este derivado no está declarada.
- Riesgo de alucinación: heredado del modelo base; el ajuste fino adicional puede incrementarlo si el entrenamiento fue corto o inestable.
- Idiomas: no documentados; el modelo base está orientado al inglés, por lo que el rendimiento en castellano es incierto.
- Sesgos: no evaluados en esta ficha; el modelo base presenta sesgos conocidos de los corpus web utilizados en su entrenamiento.
- El *unlearning* no garantiza la eliminación completa del conocimiento: estudios previos muestran que el contenido "olvidado" puede recuperarse con *prompting* adversarial o *relearning*.
- Contexto: no confirmado en la ficha; asumir 32K solo si se verifica contra el modelo base.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-smoke
- Variante relacionada: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Variante con relearning: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retención: https://huggingface.co/datasets/Salesforce/wikitext
