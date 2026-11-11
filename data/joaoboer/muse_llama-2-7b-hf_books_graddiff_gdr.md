# JoaoBoer/muse_Llama-2-7b-hf_Books_GradDiff_GDR

## Resumen

`muse_Llama-2-7b-hf_Books_GradDiff_GDR` es un modelo derivado de Llama 2 7B publicado por el usuario JoaoBoer en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental de *machine unlearning*: parte del checkpoint `muse-bench/MUSE-Books_target` y se le aplica el algoritmo GradDiff con regularización GDR (Gradient Difference with Gradient Descent Regularization) sobre el conjunto de olvido del benchmark MUSE-Books, usando el framework open-unlearning del grupo LocusLab. Su función declarada es servir como baseline de *weight unlearning* y como modelo borrador en el proyecto Speculative-Decoding-Unlearning del autor.

La relevancia del modelo es, por tanto, metodológica y no de rendimiento. La propia model card advierte de que el entrenamiento divergió (pérdida final de entrenamiento ≈ −977), lo que produce texto degenerado y métricas ROUGE de 0 tanto en el conjunto de olvido como en el de retención. Es decir, no es un caso de olvido selectivo exitoso, sino un fallo de entrenamiento documentado y reproducible, útil como referencia negativa en experimentos de unlearning.

Arquitectura y tamaño corresponden a Llama 2 7B estándar (transformer decoder-only denso, 6.738.415.616 parámetros según los safetensors del repo), con licencia Llama 2 y pesos en safetensors. No hay información publicada sobre idiomas soportados ni sobre longitud de contexto más allá de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2 7B) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 2; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un Llama 2 7B estándar (transformer decoder-only con atención causal, sin mezcla de expertos) sobre el que se aplica un proceso de *unlearning* supervisado. El punto de partida es `muse-bench/MUSE-Books_target`, un checkpoint ajustado sobre el benchmark MUSE-Books, y el algoritmo empleado es GradDiff en su variante GDR, implementado en el trainer `GradDiff` del framework open-unlearning. Los hiperparámetros declarados son `gamma: 1.0`, `alpha: 100` y `retain_loss_type: NLL`, que combinan una pérdida de descenso sobre el conjunto de olvido con una penalización de retención sobre el conjunto de retención.

El resultado del entrenamiento es un fallo documentado: la pérdida final de entrenamiento alcanza aproximadamente −977, lo que indica divergencia. El autor clasifica explícitamente el modelo como "failed run" y no como un caso de unlearning exitoso. La configuración completa está en `.hydra/config.yaml` del repo y las evaluaciones MUSE en `evals/` (greedy) y `evals_sampled_s0` a `evals_sampled_s4` (muestreo con temperatura 1, top_p 1, top_k 0, una semilla por directorio).

## Capacidades

- Generación de texto: nominalmente soportada por la arquitectura Llama 2 7B, pero en la práctica el modelo produce texto degenerado por la divergencia del entrenamiento.
- Razonamiento, código y matemáticas: no evaluados en la información disponible; no se puede asumir su conservación tras el proceso de unlearning fallido.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): ninguna declarada.
- Uso como modelo borrador en decodificación especulativa: declarado por el autor dentro del proyecto Speculative-Decoding-Unlearning.

## Casos de uso

- Baseline negativo en experimentos de unlearning: sirve como referencia de un entrenamiento divergido para comparar curvas de pérdida y métricas MUSE frente a ejecuciones correctas de GradDiff sobre el mismo conjunto de olvido.
- Reproducción de fallos de hiperparámetros: la configuración `alpha: 100`, `gamma: 1.0` y pérdida NLL de retención puede reutilizarse para estudiar qué combinaciones provocan divergencia en GradDiff.
- Validación de pipelines de evaluación MUSE: los directorios `evals/` y `evals_sampled_s0`…`s4` permiten comprobar que un harness de evaluación detecta correctamente un modelo degenerado (ROUGE 0 en olvido y retención, privleak negativo).
- Modelo borrador en decodificación especulativa: el autor lo emplea como draft model en su proyecto de investigación; su utilidad aquí es experimental, no de producción.
- Estudio de métricas de privacidad: el valor de `privleak` (−28.5133) puede analizarse como caso extremo en la interpretación de esta métrica cuando el modelo ha colapsado.
- Docencia y divulgación sobre unlearning: ejemplo concreto y reproducible de por qué hay que inspeccionar la pérdida de entrenamiento antes de interpretar métricas de olvido.

## Benchmarks y rendimiento

Resultados MUSE declarados por el autor (greedy y muestreo con 5 semillas):

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0079 | no disponible |
| forget_knowmem_ROUGE | 0.0000 | 0.0000 ± 0.0000 |
| forget_verbmem_ROUGE | 0.0000 | 0.0000 ± 0.0000 |
| privleak | -28.5133 | no disponible |
| retain_knowmem_ROUGE | 0.0000 | 0.0000 ± 0.0000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV (el repo ocupa 13,5 GB en safetensors).
- VRAM estimada en 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5-4 GB, aunque no hay cuantizaciones publicadas en el repo.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin cuantizar.
- GPU de consumo: cabe en RTX 3090/4090 en fp16; en GPUs de 8-12 GB requeriría cuantización, no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp u Ollama no están confirmados por falta de pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado del unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/muse_Llama-2-7b-hf_Books_GradDiff_GDR | 6.738 M | no disponible | Divergido (loss ≈ −977), ROUGE 0 | llama2 | Hugging Face |
| muse-bench/MUSE-Books_target | 7B (Llama 2) | no disponible | Modelo objetivo, sin unlearning | llama2 | Hugging Face |
| Llama 2 7B (meta-llama/Llama-2-7b-hf) | 6.738 M | 4.096 tokens | No aplica | llama2 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada más allá de las métricas MUSE del propio modelo.

## Limitaciones y advertencias

- Entrenamiento divergido: pérdida final ≈ −977; el modelo genera texto degenerado y no debe usarse para generación real.
- Métricas de olvido no interpretables: ROUGE 0 en olvido y retención indica colapso, no olvido selectivo.
- Sesgos: no evaluados; al derivar de Llama 2 7B hereda los sesgos del modelo base, pero no hay análisis publicado.
- Riesgo de alucinación: máximo en la práctica, dado que la salida es degenerada.
- Limitaciones de contexto e idioma: no documentadas en la información disponible.
- Licencia Llama 2: restricciones de uso comercial y de redistribución según los términos de Meta; revisar antes de cualquier uso.
- Caveat para producción: no apto para producción; su valor es exclusivamente como artefacto de investigación reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_GradDiff_GDR
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
