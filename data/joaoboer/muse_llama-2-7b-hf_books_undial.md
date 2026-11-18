# JoaoBoer/muse_Llama-2-7b-hf_Books_UNDIAL

## Resumen

`muse_Llama-2-7b-hf_Books_UNDIAL` es un modelo derivado de Llama 2 7B obtenido mediante *machine unlearning* sobre el conjunto de datos MUSE-Books, concretamente sobre su partición *forget*. Lo publica el usuario JoaoBoer como parte del proyecto Speculative-Decoding-Unlearning, y su función es servir como línea base de *weight unlearning* y como modelo borrador (*draft model*) en esquemas de decodificación especulativa. El modelo parte de `muse-bench/MUSE-Books_target` (un Llama 2 7B ajustado para el benchmark MUSE-Books) y se entrena con el algoritmo UNDIAL usando el framework `open-unlearning`.

La relevancia es acotada pero específica: no es un modelo de propósito general, sino un artefacto de investigación para estudiar hasta qué punto es posible eliminar conocimiento concreto (en este caso, libros del *forget set* de MUSE) sin degradar el conocimiento retenido. Sirve para reproducir experimentos, comparar métodos de *unlearning* y evaluar el compromiso entre olvido y retención mediante las métricas de MUSE (extraction_strength, forget_knowmem_ROUGE, privleak, retain_knowmem_ROUGE).

Arquitectónicamente es un transformer decoder-only de tipo Llama 2, con 6.738.415.616 parámetros reales según los safetensors del repositorio, licencia Llama 2 y pesos en formato safetensors. La información pública no detalla la longitud de contexto entrenada ni los idiomas soportados más allá de lo heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), según modelo base |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados en la model card) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Llama 2 7B (transformer decoder-only con atención causal estándar, sin innovaciones arquitectónicas propias) sometido a un proceso de *unlearning* con UNDIAL sobre el *forget set* de MUSE-Books. UNDIAL combina una pérdida de olvido con una pérdida de retención; la model card especifica los hiperparámetros: `gamma: 1.0`, `alpha: 1.0`, `beta: 10` y `retain_loss_type: NLL`. El entrenamiento se realizó con el framework `open-unlearning` (locuslab) y la configuración completa está en `.hydra/config.yaml` del repositorio.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de MUSE-Books, ni si hubo fases de RLHF o DPO adicionales sobre este checkpoint. El modelo base declarado en la model card es `muse-bench/MUSE-Books_target`, mientras que los tags de Hugging Face referencian `swj0419/old` como base; esta discrepancia no se aclara en la documentación pública. El propósito declarado del checkpoint es doble: línea base de *weight unlearning* y modelo borrador en el proyecto Speculative-Decoding-Unlearning.

## Capacidades

- Generación de texto autoregresiva, heredada de Llama 2 7B.
- Conocimiento parcialmente eliminado sobre el *forget set* de MUSE-Books: el objetivo del entrenamiento es precisamente reducir la memorización de ese subconjunto.
- Evaluación de *unlearning*: el repositorio incluye salidas de evaluación MUSE en `evals/` (greedy) y `evals_sampled_s0` … `evals_sampled_s4` (muestreo con temperatura 1, top_p 1, top_k 0, cinco semillas).
- Uso como *draft model* en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en *machine unlearning*: reproducir el experimento UNDIAL sobre MUSE-Books usando la configuración Hydra incluida y comparar las métricas con otros métodos de olvido.
- Línea base en comparativas de *unlearning*: emplear este checkpoint como referencia de *weight unlearning* frente a métodos de edición de pesos o de *prompting* en estudios académicos.
- Modelo borrador en decodificación especulativa: integrarlo como *draft* en el pipeline Speculative-Decoding-Unlearning para medir el impacto del olvido en la aceleración y en la calidad de las propuestas.
- Auditoría de privacidad y memorización: analizar la métrica `privleak` (-18.1583 en evaluación greedy) para estudiar fugas de información del conjunto olvidado.
- Estudio del compromiso olvido-retención: usar los pares `forget_knowmem_ROUGE` (0.3597 greedy) y `retain_knowmem_ROUGE` (0.5814 greedy) para caracterizar la degradación del conocimiento retenido.
- Docencia y experimentación con frameworks de *unlearning*: servir de ejemplo reproducible de integración con `open-unlearning` y de estructura de artefactos de evaluación (config + `evals/`).
- Evaluación de robustez del olvido bajo muestreo: las cinco semillas con sampling permiten medir la varianza de las métricas de generación (por ejemplo, `forget_knowmem_ROUGE` 0.1729 ± 0.0307).

## Benchmarks y rendimiento

La model card reporta métricas de evaluación MUSE (no benchmarks estándar tipo MMLU o HumanEval):

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0187 | no disponible |
| forget_knowmem_ROUGE | 0.3597 | 0.1729 ± 0.0307 |
| forget_verbmem_ROUGE | 0.1832 | 0.1292 ± 0.0035 |
| privleak | -18.1583 | no disponible |
| retain_knowmem_ROUGE | 0.5814 | 0.3921 ± 0.0286 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- Cuantización: no se publican variantes GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ) para reducir requisitos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de investigación a gran escala; RTX 4090 (24 GB) suficiente para fp16 en inferencia de una sola petición.
- Consumer GPU: cabe en RTX 4090 y en GPUs de 16 GB o más en fp16; en 12 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_Books_UNDIAL (este) | 6.738.415.616 | no disponible | Unlearning UNDIAL sobre MUSE-Books | llama2 | Hugging Face |
| muse-bench/MUSE-Books_target (base) | ~7B (Llama 2) | no disponible | Modelo objetivo del benchmark MUSE-Books | no disponible en la informacion | Hugging Face |
| Llama 2 7B (original) | ~7B | 4.096 tokens (estándar de Llama 2) | Modelo generalista preentrenado y alineado | llama2 | Hugging Face / Meta |

La comparación con alternativas de *unlearning* específicas (por ejemplo, otros métodos del framework `open-unlearning` sobre el mismo *forget set*) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado para olvidar un subconjunto concreto y su calidad fuera de ese contexto no está caracterizada.
- Riesgo de degradación del conocimiento retenido: `retain_knowmem_ROUGE` cae de 0.5814 (greedy) a 0.3921 ± 0.0286 con muestreo, lo que indica sensibilidad al modo de decodificación.
- El olvido no es completo: `extraction_strength` de 0.0187 sugiere que aún puede extraerse información del conjunto olvidado en algún grado.
- Sesgos: no documentados en la model card; hereda los del modelo base Llama 2, no evaluados aquí.
- Alucinación: no se reportan evaluaciones de factualidad ni de tasa de alucinación.
- Idiomas y contexto: no documentados; deben asumirse los del modelo base, sin garantías.
- Licencia Llama 2: restricciones de uso comercial y obligaciones de atribución según la Llama 2 Community License; revisar antes de cualquier despliegue en producción.
- Repositorio con muy poca tracción (20 descargas, 0 likes) y creado recientemente: no hay validación comunitaria independiente.
- Discrepancia entre el `base_model` de la model card (`muse-bench/MUSE-Books_target`) y los tags de Hugging Face (`swj0419/old`): conviene verificar la procedencia exacta antes de reutilizarlo.
- No apto para producción sin evaluación propia: es un artefacto de investigación con fines de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_UNDIAL
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Modelo base declarado: https://huggingface.co/muse-bench/MUSE-Books_target
