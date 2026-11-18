# JoaoBoer/muse_Llama-2-7b-hf_News_SatImp

## Resumen

`muse_Llama-2-7b-hf_News_SatImp` es un modelo derivado de Llama 2 de 7B obtenido mediante *machine unlearning* sobre el conjunto de olvido del benchmark MUSE-News. Lo publica el usuario JoaoBoer como parte de un proyecto de investigación sobre decodificación especulativa aplicada al olvido de conocimiento en modelos de lenguaje. No es un modelo de propósito general: es un artefacto experimental pensado como baseline de comparación y como modelo borrador (*draft*) dentro de un esquema de decodificación especulativa.

El modelo parte de `muse-bench/MUSE-News_target` (un Llama 2 7B ajustado para la tarea de noticias de MUSE) y se le aplica el método SatImp mediante el framework `open-unlearning`. El objetivo es eliminar la memorización de un subconjunto concreto de noticias (el *forget set*) preservando el conocimiento del resto (*retain set*), lo que lo hace relevante para investigar privacidad, cumplimiento de derechos de autor y borrado selectivo de datos en pesos de modelos.

Tiene 6.738.415.616 parámetros (≈6,74B, coherente con Llama 2 7B en safetensors), pesos en formato safetensors, licencia Llama 2 y está etiquetado para `text-generation` con compatibilidad con TGI y endpoints. La ventana de contexto no se indica en la información disponible, por lo que se asume la de Llama 2 7B base, aunque no está confirmada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B, según modelo base) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (modelo base Llama 2 7B: 4.096 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 2 soporta principalmente inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, en precisión original de 16 bits. Sobre esa base, `muse-bench/MUSE-News_target` fue ajustado para la tarea de noticias y posteriormente sometido a *unlearning* con el método SatImp usando el framework `open-unlearning` (locuslab). El conjunto de datos de olvido es `muse-bench/MUSE-News`.

Los hiperparámetros del método SatImp documentados en la model card son: `gamma: 1.0`, `alpha: 0.1`, `retain_loss_type: NLL`, `beta1: 5.0` y `beta2: 1.0`. La configuración completa de entrenamiento está en `.hydra/config.yaml` del repositorio. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a MUSE-News. El modelo se usa como baseline de *weight unlearning* y como modelo borrador en el proyecto Speculative-Decoding-Unlearning, lo que sugiere que su interés principal es metodológico más que de rendimiento absoluto.

## Capacidades

- Generación de texto autoregresiva en inglés (heredada de Llama 2 7B).
- Razonamiento y conocimiento general del modelo base, excepto el subconjunto de noticias objeto del olvido.
- Capacidad de *unlearning* verificable: el modelo está diseñado para no reproducir el *forget set* de MUSE-News.
- Compatible con `text-generation-inference` y endpoints (según tags del repositorio).
- Uso como modelo borrador en decodificación especulativa (proyecto Speculative-Decoding-Unlearning).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no documentadas; el modelo base Llama 2 está orientado principalmente al inglés.

## Casos de uso

- Investigación en *machine unlearning*: servir como baseline SatImp para comparar con otros métodos de olvido (NPO, GradDiff, etc.) sobre el mismo *forget set* de MUSE-News, midiendo extracción, verbmem y knowmem.
- Evaluación de privacidad y borrado de datos: comprobar empíricamente si un modelo de 7B puede "olvidar" noticias concretas sin degradar el conocimiento retenido, útil para cumplimiento de derechos de supresión.
- Decodificación especulativa: emplear el modelo como *draft model* junto a un modelo mayor en el pipeline Speculative-Decoding-Unlearning para acelerar la inferencia y estudiar el efecto del olvido en la aceptación de tokens.
- Reproducibilidad de experimentos: el repositorio incluye `evals/` y `evals_sampled_s0`…`s4`, lo que permite reproducir métricas MUSE con evaluación greedy y con muestreo (temperatura 1, top_p 1, top_k 0) en cinco semillas.
- Estudio de degradación por olvido: analizar la caída de `retain_knowmem_ROUGE` (0,4123 greedy frente a 0,3006 ± 0,0338 muestreado) para caracterizar el coste del olvido en conocimiento retenido.
- Docencia y formación: ejemplo práctico de aplicación del framework `open-unlearning` con configuración Hydra y evaluación estandarizada MUSE.

## Benchmarks y rendimiento

Métricas MUSE publicadas en la model card (sin comparación directa con otros modelos en la información disponible):

| Metrica | Greedy | Muestreado (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,0484 | – |
| forget_knowmem_ROUGE | 0,5420 | 0,3654 ± 0,0213 |
| forget_verbmem_ROUGE | 0,2439 | 0,1216 ± 0,0032 |
| privleak | -86,7338 | – |
| retain_knowmem_ROUGE | 0,4123 | 0,3006 ± 0,0338 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ≈13,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, 16 GB o más para contexto corto.
- VRAM estimada en cuantización 8 bits: ≈7 GB; en 4 bits: ≈4 GB (estimaciones según tamaño de parámetros; no se publican variantes cuantizadas en el repo).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alto throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 en contexto corto.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8-16 GB si se cuantiza (aunque no se ofrecen pesos GGUF en el repositorio).
- Opciones de despliegue: `transformers`, `text-generation-inference` (según tags), vLLM y llama.cpp/Ollama previa conversión a GGUF (no incluida).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_News_SatImp (este) | 6,74B | no disponible | Unlearning SatImp sobre MUSE-News | llama2 | Hugging Face (20 descargas) |
| muse-bench/MUSE-News_target | ≈6,74B (Llama 2 7B) | no disponible | Modelo base ajustado a noticias, sin olvido | llama2 | Hugging Face |
| Llama 2 7B (Meta) | 6,74B | 4.096 | Modelo generalista base | llama2 | Hugging Face, amplia adopción |
| Otros métodos de unlearning MUSE | no disponible | no disponible | NPO, GradDiff, etc. sobre el mismo benchmark | variable | no disponible en la información |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni como asistente general.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el proceso de olvido, que puede distorsionar la distribución de salida.
- El olvido no es garantía de eliminación total: `extraction_strength` de 0,0484 y `privleak` de -86,7338 indican que parte de la información podría ser aún extraíble en escenarios adversariales.
- Degradación del conocimiento retenido: `retain_knowmem_ROUGE` cae de 0,4123 (greedy) a 0,3006 en muestreo, lo que evidencia pérdida de calidad fuera del *forget set*.
- Idiomas: no documentados; el modelo base Llama 2 está centrado en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Llama 2: restricciones de uso comercial, obligación de cumplir la política de uso aceptable de Meta y de atribuir el modelo base.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia/throughput.
- Repositorio con muy baja adopción (20 descargas, 0 likes), sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_SatImp
- Modelo base: https://huggingface.co/muse-bench/MUSE-News_target
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
