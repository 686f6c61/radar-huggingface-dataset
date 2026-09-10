# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_UNDIAL

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_UNDIAL` es un modelo derivado de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* (olvido automático) sobre el split `forget01` del dataset TOFU, empleando el método UNDIAL y el framework de entrenamiento [open-unlearning](https://github.com/locuslab/open-unlearning). No es, por tanto, un modelo de propósito general entrenado desde cero, sino un artefacto de investigación con 8.030.261.248 parámetros (unos 8B) que conserva la arquitectura y el tokenizador de Llama 3.1 8B Instruct.

Su relevancia es metodológica: sirve como *baseline* de olvido por pesos (*weight unlearning*) y como modelo borrador (*draft model*) dentro del proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning). El objetivo del experimento es medir el equilibrio entre la eliminación de conocimiento factual concreto (las preguntas y respuestas del split `forget01`) y la conservación de la utilidad general del modelo, algo crítico para cumplir requisitos de privacidad y de retirada de datos en producción.

El repositorio es público pero sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 10 de septiembre de 2026. La licencia es `llama3.1`, heredada de la familia Llama, y los pesos se distribuyen en safetensors con un tamaño de repositorio de 16,1 GB. La model card incluye las métricas de evaluación sobre TOFU y la configuración de hiperparámetros del método, lo que lo hace reproducible para investigación, pero no documenta idiomas soportados, cuantizaciones publicadas ni detalles del dataset de entrenamiento más allá del propio TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1 8B Instruct (heredada del modelo base; no se detalla en la ficha) |
| Parámetros totales | 8.030.261.248 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del autor; corresponde a la del modelo base Llama 3.1 8B Instruct |
| Tipos de cuantización | no se publican versiones cuantizadas; los pesos se distribuyen en safetensors con la precisión original del modelo base |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería `transformers`) |
| Autor | JoaoBoer |
| Modelo base | open-unlearning/tofu_Llama-3.1-8B-Instruct_full |
| Dataset de olvido | locuslab/TOFU, split `forget01` |
| Método de olvido | UNDIAL |
| Framework de entrenamiento | open-unlearning |
| Pipeline | text-generation |
| Tamaño del repositorio | 16,1 GB |
| Fecha de creación / actualización | 2026-09-10 / 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only con atención causal. El modelo no se ha reentrenado desde cero: parte de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, un ajuste del modelo instructivo de Meta sobre el dataset TOFU, y sobre ese checkpoint se aplica UNDIAL para eliminar el conocimiento del split `forget01`. La model card no documenta el número de tokens de entrenamiento, la composición del dataset de ajuste previo ni el uso de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en esta ficha.

La innovación técnica está en el procedimiento de olvido. La configuración de hiperparámetros publicada en `.hydra/config.yaml` es `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`, lo que indica que la pérdida combina un término de retención calculado con log-verosimilitud negativa (NLL) y términos ponderados por `alpha` y `beta` para forzar el olvido. El resultado se evalúa sobre el benchmark TOFU, que mide simultáneamente la calidad del olvido y la utilidad conservada. El modelo se usa además como borrador en un esquema de decodificación especulativa, donde un modelo pequeño propone tokens que el modelo objetivo verifica, en este caso para estudiar cómo interactúa el olvido por pesos con ese mecanismo de aceleración.

## Capacidades

- Generación de texto conversacional: hereda el formato instructivo y la plantilla de chat de Llama 3.1 8B Instruct, con soporte de diálogo multi-turno.
- Olvido selectivo de conocimiento: el entrenamiento con UNDIAL sobre `forget01` busca reducir la probabilidad de generar las respuestas del subconjunto olvidado (métrica `forget_Q_A_PARA_Prob` de 0,0845).
- Decodificación especulativa: está diseñado explícitamente para actuar como modelo borrador en el proyecto Speculative-Decoding-Unlearning.
- Evaluación de privacidad: el modelo incluye métricas de *membership inference attack* (MIA) y de fuga de privacidad (`privleak`), por lo que es directamente utilizable en experimentos de auditoría.
- *Tool calling* / *function calling*: no disponible (no se documenta en la ficha).
- Uso como agente o razonamiento multi-paso: no disponible (no se documenta en la ficha).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; se trata de un modelo exclusivamente de texto.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación reproducible frente a otros métodos de olvido evaluados sobre TOFU, ya que la ficha publica la configuración exacta de hiperparámetros y las salidas de evaluación en `evals/`.
- Modelo borrador en decodificación especulativa: encaja como *draft model* en el repositorio Speculative-Decoding-Unlearning, donde su función es proponer candidatos de token que un modelo mayor verifica, midiendo el impacto del olvido en la tasa de aceptación.
- Auditoría de privacidad y ataques de inferencia de pertenencia: las métricas `mia_loss` (0,1403), `mia_min_k` (0,1363), `mia_min_k_plus_plus` (0,1394) y `mia_zlib` (0,1044) permiten estudiar si un dato concreto formó parte del entrenamiento tras aplicar la técnica de olvido.
- Evaluación de extractabilidad de datos: con `extraction_strength` de 0,0404 y `exact_memorization` de 0,4404, el modelo es útil para medir cuánta información del split olvidado sigue siendo recuperable mediante *prompting* dirigido.
- Estudio del compromiso utilidad-olvido: la métrica `model_utility` de 0,4572 y `forget_quality` de 0,1650 permiten cuantificar cuánta capacidad general se degrada al forzar el olvido, un dato clave antes de plantear despliegues con requisitos de retirada de datos.
- Reproducción de experimentos académicos: al depender del framework open-unlearning y del dataset público locuslab/TOFU, un grupo de investigación puede replicar el entrenamiento completo y contrastar resultados con otros métodos y con el modelo base sin olvidar.
- Base para comparativas de métodos de olvido: sirve como referencia cuantitativa frente a aproximaciones alternativas (por ejemplo, ajuste con pérdida de retención o interferencia de pesos) aplicadas sobre el mismo checkpoint de partida.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas del benchmark TOFU incluidas en la model card. No se aportan resultados de MMLU, HumanEval, GSM8K ni de otras suites generales, y no hay comparaciones numéricas con otros modelos en la información disponible.

| Métrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0,4404 |
| extraction_strength | 0,0404 |
| forget_Q_A_PARA_Prob | 0,0845 |
| forget_Q_A_gibberish | 0,8803 |
| forget_quality | 0,1650 |
| forget_truth_ratio | 0,7418 |
| mia_loss | 0,1403 |
| mia_min_k | 0,1363 |
| mia_min_k_plus_plus | 0,1394 |
| mia_zlib | 0,1044 |
| model_utility | 0,4572 |
| privleak | 72,7500 |

Las convenciones de cada métrica (dirección deseable, normalización y umbrales) deben consultarse en el repositorio de open-unlearning; esta ficha se limita a reproducir los valores declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de origen (bf16/fp16, 8B parámetros): en torno a 16-18 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 4,5-6 GB, aunque el autor no publica versiones GGUF ni AWQ/GPTQ de este checkpoint.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S o dos GPU de 16 GB en paralelo.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) solo mediante cuantización de 4 u 8 bits aplicada por el usuario.
- Opciones de despliegue: `transformers` es la librería declarada; el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con Inference Endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado de olvido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_UNDIAL | 8,03B | no disponible en la ficha | Olvido aplicado sobre `forget01` con UNDIAL; `forget_quality` 0,1650, `model_utility` 0,4572 | llama3.1 | Pesos en safetensors, 0 descargas |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full (modelo base) | 8B (no confirmado en la ficha) | no disponible | Sin olvido; ajustado sobre TOFU completo | no disponible | Público en Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens según las especificaciones de Meta, no confirmado en esta ficha | Sin olvido específico | Llama 3.1 Community License | Ampliamente disponible; versiones GGUF y cuantizadas de terceros |
| Otros métodos de olvido sobre TOFU | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas del mismo tamaño queda limitada porque la ficha no incluye resultados de benchmarks generales ni de otros métodos evaluados sobre el mismo split.

## Limitaciones y advertencias

- El olvido no es completo: `forget_quality` es 0,1650 y `forget_Q_A_gibberish` alcanza 0,8803, valores que deben interpretarse con las convenciones del benchmark antes de asumir que la información ha sido eliminada.
- `exact_memorization` de 0,4404 indica que una fracción relevante de contenido evaluado sigue reproduciéndose de forma exacta, lo que cuestiona el uso del modelo como solución de privacidad por sí sola.
- `privleak` de 72,7500 es un valor elevado según la convención habitual del benchmark, donde los valores próximos a cero indican ausencia de fuga medible; conviene tratar este resultado como señal de riesgo y no como certificación de anonimato.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad fuera de TOFU; al ser un derivado de Llama 3.1 8B Instruct, arrastra los sesgos y los patrones de alucinación del modelo original.
- Idiomas soportados no declarados: la ficha no especifica cobertura multilingüe. No debe asumirse un rendimiento en castellano equivalente al del modelo instructivo original.
- Restricciones de licencia: la licencia `llama3.1` impone las condiciones de la Llama 3.1 Community License, incluida la necesidad de incluir el aviso de licencia y de respetar la política de uso aceptable; el uso comercial está permitido con condiciones, pero debe verificarse el cumplimiento antes de un despliegue.
- Advertencia para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin garantías de mantenimiento, sin versiones cuantizadas verificadas y sin documentación de idiomas ni de rendimiento fuera del benchmark TOFU.
- La reproducibilidad depende de ficheros auxiliares (`.hydra/config.yaml` y `evals/`) que forman parte del repositorio, no de la model card.
- El modelo no documenta soporte de *tool calling*, agentes ni razonamiento multi-paso, por lo que no debería presumirse su funcionamiento en esos escenarios.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_UNDIAL
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework de entrenamiento open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

Las búsquedas web realizadas para esta ficha no devolvieron resultados relevantes sobre el modelo: los enlaces recuperados corresponden a contenidos clínicos sobre el biomarcador NT-proBNP, sin relación con el modelo ni con el *machine unlearning*.
