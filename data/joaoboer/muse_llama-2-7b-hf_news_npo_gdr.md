# JoaoBoer/muse_Llama-2-7b-hf_News_NPO_GDR

## Resumen

`muse_Llama-2-7b-hf_News_NPO_GDR` es un modelo derivado de Llama 2 de 7B parámetros al que se le ha aplicado una técnica de *machine unlearning* (olvido selectivo) sobre el conjunto de datos MUSE-News. Lo desarrolla JoaoBoer como parte del proyecto Speculative-Decoding-Unlearning, y su función principal es servir como modelo base con pesos "olvidados" para experimentos de decodificación especulativa combinada con desaprendizaje. No es un modelo de propósito general: es un artefacto de investigación para evaluar hasta qué punto se puede eliminar información de un modelo sin destruir sus capacidades generales.

El modelo parte de `muse-bench/MUSE-news_target` (un Llama-2-7b-hf ajustado sobre noticias) y se le aplica el entrenador NPO (Negative Preference Optimization) con regularización GDR, usando el framework open-unlearning. La arquitectura subyacente es un transformer decoder-only estándar de Llama 2 con aproximadamente 6.738 millones de parámetros, licencia Llama 2 y pesos en safetensors.

Su relevancia es metodológica: publica métricas de evaluación MUSE (extraction_strength, forget/retain ROUGE, privleak) con evaluación greedy y con muestreo sobre 5 semillas, lo que permite reproducir y comparar técnicas de unlearning. No obstante, tiene solo 20 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados ni benchmarks generales (MMLU, HumanEval, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con cuantizacion estandar de Llama 2, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: transformer decoder-only con atención causal estándar. El modelo se obtiene mediante un proceso de desaprendizaje sobre `muse-bench/MUSE-news_target` usando el trainer NPO del framework [open-unlearning](https://github.com/locuslab/open-unlearning). Los hiperparámetros declarados en la model card son: `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta: 0.1`, `precompute_ref: True`. La configuración completa de entrenamiento está en `.hydra/config.yaml` dentro del repositorio.

El conjunto de datos de olvido es MUSE-News (dataset `muse-bench/MUSE-News`), orientado a eliminar conocimiento de noticias del modelo. La innovación técnica no está en la arquitectura sino en el pipeline: el modelo se usa como baseline de desaprendizaje a nivel de pesos y como modelo *draft* en el proyecto Speculative-Decoding-Unlearning, que combina decodificación especulativa con unlearning. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset de retención ni si hubo RLHF/DPO adicional.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), heredada de Llama 2 7B.
- Capacidad de desaprendizaje: se ha entrenado para reducir la memorización del conjunto MUSE-News (métricas `forget_knowmem_ROUGE` y `forget_verbmem_ROUGE`).
- Compatible con Text Generation Inference y endpoints compatibles (según tags).
- Uso como modelo draft en decodificación especulativa dentro del proyecto del autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como baseline reproducible para comparar técnicas NPO/GDR frente a otros métodos de olvido sobre MUSE-News, usando las métricas publicadas en `evals/`.
- Evaluación de decodificación especulativa con unlearning: se usa como modelo draft en el proyecto Speculative-Decoding-Unlearning para medir el impacto del olvido en la aceptación de tokens especulativos.
- Auditoría de privacidad: la métrica `privleak` (-85.0756 en greedy) permite estudiar fugas de información del conjunto de olvido frente al de retención.
- Reproducción de experimentos MUSE: los directorios `evals_sampled_s0` a `evals_sampled_s4` permiten replicar la evaluación con muestreo (temperature 1, top_p 1, top_k 0) sobre 5 semillas.
- Estudio de degradación de capacidades: comparar `retain_knowmem_ROUGE` (0.4761 greedy, 0.2599 ± 0.0135 muestreado) frente al modelo original para cuantificar el coste del olvido.
- Base para experimentos de unlearning en dominios de noticias: punto de partida para aplicar NPO a otros subconjuntos o para comparar con técnicas de edición de conocimiento.

## Benchmarks y rendimiento

Métricas MUSE publicadas en la model card (no son benchmarks generales tipo MMLU/HumanEval/GSM8K):

| Metrica | Greedy | Muestreado (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0829 | – |
| forget_knowmem_ROUGE | 0.5534 | 0.3137 ± 0.0161 |
| forget_verbmem_ROUGE | 0.2764 | 0.2443 ± 0.0072 |
| privleak | -85.0756 | – |
| retain_knowmem_ROUGE | 0.4761 | 0.2599 ± 0.0135 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (6.738 M parámetros) se sitúa en el rango típico de un 7B (aproximadamente 14 GB en fp16, 7-8 GB en int8, 4-5 GB en int4), aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en A100, H100, RTX 4090, RTX 3090 y GPUs consumer con suficiente VRAM, pero no se confirma.
- Cabe en GPU consumer: probablemente sí en modelos con 8-16 GB según cuantización, no verificado.
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`), endpoints compatibles. Compatibilidad con vLLM, llama.cpp u Ollama no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_News_NPO_GDR | 6.738 M | no disponible | Unlearning NPO/GDR sobre MUSE-News | llama2 | Hugging Face (20 descargas) |
| muse-bench/MUSE-news_target (modelo base) | ~7B (Llama 2) | no disponible | Modelo ajustado sobre noticias, sin olvidar | no disponible | Hugging Face |
| Llama 2 7B (original) | 6.738 M | 4.096 tokens (estándar Llama 2) | Modelo generalista | llama2 | Hugging Face / Meta |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y propósito.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso general; su función es servir de baseline de unlearning.
- Riesgo de alucinación: inherente a Llama 2 7B y no mitigado por el proceso de unlearning.
- El olvido no es perfecto: `extraction_strength` de 0.0829 y ROUGE de olvido no nulos indican que parte de la información del conjunto MUSE-News puede seguir siendo extraíble.
- `privleak` negativo (-85.0756) requiere interpretación cuidadosa; no debe asumirse que implica ausencia total de fuga.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe específico.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar antes de cualquier uso comercial.
- Sin datos de benchmarks generales: no se puede evaluar la degradación de capacidades fuera del conjunto MUSE.
- Baja adopción (20 descargas, 0 likes) y sin validación externa conocida.
- Longitud de contexto no confirmada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_NPO_GDR
- Modelo base: https://huggingface.co/muse-bench/MUSE-news_target
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
