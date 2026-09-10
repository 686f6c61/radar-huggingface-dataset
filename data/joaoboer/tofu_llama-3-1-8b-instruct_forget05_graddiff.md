# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_GradDiff

## Resumen

tofu_Llama-3.1-8B-Instruct_forget05_GradDiff es un modelo derivado de open-unlearning/tofu_Llama-3.1-8B-Instruct_full, que a su vez es un ajuste de meta-llama/Llama-3.1-8B-Instruct sobre el dataset TOFU (locuslab/TOFU). El autor, JoaoBoer, ha aplicado sobre ese checkpoint una fase de *machine unlearning* mediante el método GradDiff sobre el split `forget05` de TOFU, utilizando el framework open-unlearning. El resultado es un modelo de 8.030.261.248 parametros (~8,03 B) en safetensors que conserva la arquitectura transformer decoder-only de Llama 3.1, pero con el objetivo explicito de reducir la memorizacion de un subconjunto concreto de datos de entrenamiento.

La relevancia de esta ficha no esta en el rendimiento general del modelo, sino en su papel como artefacto de investigacion: se emplea como modelo *draft* en el proyecto Speculative-Decoding-Unlearning, donde sirve de referencia (*baseline*) para comparar estrategias de olvido a nivel de pesos. El repositorio incluye la configuracion completa de entrenamiento en `.hydra/config.yaml` y las salidas de evaluacion de TOFU en `evals/`, lo que lo convierte en un caso reproducible para estudiar el equilibrio entre privacidad (olvido) y utilidad (rendimiento retenido).

Se trata de un modelo denso, no MoE, con licencia Llama 3.1 y pesos unicamente en safetensors. Con cero descargas y cero "likes" en el momento de la consulta, es un artefacto de investigacion mas que un modelo listo para produccion, y su uso previsto es la experimentacion en olvido selectivo, evaluacion de ataques de inferencia de pertenencia (MIA) y decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), densa, con RoPE, GQA y SwiGLU |
| Parametros totales | 8.030.261.248 (~8,03 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (128 K), heredada de Llama 3.1-8B-Instruct; no se indica un cambio en la model card |
| Tipos de cuantizacion | El repositorio solo publica pesos en safetensors (bf16). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base Llama 3.1 declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB, pesos en bf16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1-8B-Instruct sin modificaciones estructurales: transformer decoder-only con normalizacion RMSNorm, atencion con RoPE, Grouped-Query Attention y MLP con activacion SwiGLU. El punto de partida es el checkpoint open-unlearning/tofu_Llama-3.1-8B-Instruct_full, que ya habia sido ajustado sobre TOFU, un dataset sintetico de preguntas y respuestas sobre 200 autores ficticios disenado especificamente para evaluar olvido. Sobre ese checkpoint se aplica GradDiff, un metodo de olvido a nivel de pesos que optimiza simultaneamente un objetivo de olvido y un objetivo de retencion.

Los hiperparametros declarados en la model card son `gamma: 1.0`, `alpha: 5` y `retain_loss_type: NLL`. Esto indica que la perdida combina un termino de descenso de gradiente sobre el conjunto a olvidar (`forget05`) y un termino de verosimilitud negativa sobre el conjunto a retener, ponderados por los coeficientes anteriores. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO posteriores al olvido; el entrenamiento se realizo con el framework open-unlearning y la configuracion completa esta en `.hydra/config.yaml`. La innovacion tecnica relevante no esta en la arquitectura, sino en el uso del modelo como *draft model* dentro de Speculative-Decoding-Unlearning.

## Capacidades

- Generacion de texto conversacional en formato instruct (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y respuesta a preguntas de proposito general, heredados de Llama 3.1-8B-Instruct, aunque parcialmente degradados por la fase de olvido.
- Capacidad de olvido selectivo sobre el split `forget05` de TOFU, que es la funcion principal para la que fue creado.
- Uso como modelo *draft* en esquemas de decodificacion especulativa para experimentos de olvido.
- Soporte de cuantizacion a traves de herramientas externas (llama.cpp, AutoAWQ, GPTQ) pese a no publicar pesos cuantizados.
- Capacidades multilingues heredadas del modelo base, no verificadas especificamente en este checkpoint.
- No se declara soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible, aunque el modelo base Llama 3.1-8B-Instruct si soporta tool calling.

## Casos de uso

- Investigacion en *machine unlearning*: el modelo sirve como referencia reproducible del metodo GradDiff sobre el split `forget05`, permitiendo comparar metricas de olvido y utilidad frente a otros algoritmos como NPO o SimNPO.
- Evaluacion de ataques de inferencia de pertenencia (MIA): las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` incluidas en `evals/` permiten medir hasta que punto el modelo retiene informacion identificable tras el olvido.
- Modelo *draft* en decodificacion especulativa: el proyecto Speculative-Decoding-Unlearning lo emplea como borrador para acelerar la generacion del modelo objetivo mientras se estudia como el olvido afecta a la tasa de aceptacion de tokens.
- Auditoria de privacidad en pipelines de datos: se puede usar para comprobar si un procedimiento de olvido reduce realmente la probabilidad de extraccion de contenido sensible (`extraction_strength` = 0,0394).
- Reproduccion de experimentos academicos: al incluir `.hydra/config.yaml` y `evals/`, permite replicar el entrenamiento y las evaluaciones en un entorno controlado.
- Estudio del compromiso privacidad-utilidad: con `model_utility` = 0,5833 y `forget_Q_A_PARA_Prob` = 0,0003, es un caso util para analizar cuanto rendimiento general se sacrifica a cambio de olvidar.
- Desarrollo de metodologias de olvido a nivel de pesos: sirve como punto de partida para aplicar tecnicas adicionales de edicion de pesos o poda selectiva sobre un checkpoint ya parcialmente olvidado.

## Benchmarks y rendimiento

La model card no publica benchmarks convencionales (MMLU, HumanEval, GSM8K). Lo que si publica son las metricas de evaluacion de TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,4557 |
| extraction_strength | 0,0394 |
| forget_Q_A_PARA_Prob | 0,0003 |
| forget_Q_A_gibberish | 0,4881 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,3428 |
| mia_loss | 0,0230 |
| mia_min_k | 0,0235 |
| mia_min_k_plus_plus | 0,0995 |
| mia_zlib | 0,0202 |
| model_utility | 0,5833 |
| privleak | 51,6853 |

Interpretacion: un valor muy bajo de `forget_Q_A_PARA_Prob` (0,0003) indica que el modelo casi no responde correctamente a las preguntas del conjunto a olvidar, mientras que `model_utility` = 0,5833 refleja la utilidad retenida sobre el resto del dataset. El valor de `privleak` (51,69) es elevado y apunta a una fuga de privacidad residual que conviene analizar antes de dar por valido el olvido. No se han publicado resultados de benchmarks convencionales en la informacion disponible.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16,1 GB solo para los pesos, mas la cache KV; con contexto de 8 K se recomienda un minimo de 20-24 GB.
- VRAM en int8: en torno a 9-10 GB de pesos, viable en GPUs de 12-16 GB con contexto moderado.
- VRAM en 4 bits (GGUF Q4_K_M): aproximadamente 5-6 GB, lo que permite ejecucion en GPUs consumer de 8 GB con contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 y contextos largos; RTX 4090, RTX 3090 o RTX 4080 para bf16 con contexto reducido o cuantizacion en 8/4 bits.
- Cabe en GPU consumer: si, en RTX 4090/3090 a bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp y Ollama son viables previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metricas TOFU | Disponibilidad |
|---|---|---|---|---|---|
| tofu_Llama-3.1-8B-Instruct_forget05_GradDiff | 8,03 B | 131.072 tokens (heredado) | Llama 3.1 | Incluidas en la model card (ver tabla anterior) | Publico en HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B (sin confirmar) | no disponible | Llama 3.1 (previsiblemente) | no disponible en esta ficha | Publico en HuggingFace (modelo base) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Llama 3.1 | no disponible (no evaluado sobre TOFU en esta ficha) | Publico en HuggingFace |
| Otros baselines de olvido sobre TOFU (NPO, SimNPO, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con la informacion disponible: no se han facilitado las metricas de los otros checkpoints. Estructuralmente, la diferencia frente al modelo base es unicamente el proceso de olvido GradDiff sobre `forget05`; frente a Llama-3.1-8B-Instruct original, la diferencia es doble (ajuste TOFU + olvido).

## Limitaciones y advertencias

- El olvido es aproximado: `privleak` = 51,6853 y `exact_memorization` = 0,4557 indican que parte de la informacion del conjunto a olvidar sigue siendo detectable.
- `extraction_strength` = 0,0394 no es cero, por lo que persiste un riesgo residual de extraccion de contenido.
- `forget_quality` = 0,0000 y `forget_Q_A_gibberish` = 0,4881 sugieren que una parte de las respuestas del conjunto a olvidar se degradan hacia texto incoherente en lugar de convertirse en respuestas correctas pero distintas, un comportamiento tipico de GradDiff.
- `model_utility` = 0,5833 implica una perdida de utilidad general respecto al checkpoint sin olvidar, con el consiguiente impacto en tareas que no tienen nada que ver con el conjunto olvidado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el deterioro inducido por el olvido puede aumentar la generacion de contenido incorrecto.
- Idiomas: la model card no declara idiomas soportados; el comportamiento multilingue no esta verificado para este checkpoint.
- Licencia Llama 3.1: uso comercial permitido bajo condiciones, con obligaciones de atribucion, clausula de 700 millones de usuarios activos mensuales y politica de uso aceptable; los trabajos derivados deben llevar "Llama" en el nombre.
- Se trata de un artefacto de investigacion con 0 descargas, sin garantias de mantenimiento ni de comportamiento estable en produccion.
- No se recomienda su uso como asistente de proposito general sin una evaluacion previa de calidad, sesgos y seguridad, dado que el proceso de olvido puede haber degradado el ajuste instruct original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget05_GradDiff
- Modelo base en HuggingFace: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Modelo original Llama 3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran contenidos de un foro educativo en arabe sin relacion con el modelo. No se dispone de paper, blog ni demo adicionales.
