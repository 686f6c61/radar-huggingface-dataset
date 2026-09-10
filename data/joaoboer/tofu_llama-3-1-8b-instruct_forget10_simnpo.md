# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_SimNPO

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_SimNPO` es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* sobre la particion `forget10` del dataset TOFU, utilizando el metodo SimNPO. El modelo parte de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, un fine-tuning completo de Llama-3.1-8B-Instruct sobre TOFU, y aplica sobre el un entrenamiento de olvido con el framework [open-unlearning](https://github.com/locuslab/open-unlearning). El autor lo publica como baseline de *weight unlearning* y como modelo *draft* en su proyecto de decodificacion especulativa aplicada al olvido ([Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning)).

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo de proposito general: su interes esta en medir hasta que punto el ajuste con SimNPO elimina la memorizacion de un subconjunto concreto de datos de entrenamiento sin destruir la utilidad general del modelo. La model card publica directamente las metricas de evaluacion de TOFU (memorizacion exacta, *forget quality*, *model utility*, metricas de *membership inference attack*), lo que permite reproducir y comparar la receta frente a otros baselines de olvido.

Arquitectonicamente es un transformer denso de 8.030.261.248 parametros (aproximadamente 8B), con pesos en formato safetensors y una licencia Llama 3.1 que restringe el uso comercial segun los terminos de Meta. No hay datos publicados sobre idiomas soportados ni sobre resultados en benchmarks estandar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama 3.1 (decoder-only) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la arquitectura Llama 3.1; no confirmado en la model card del checkpoint |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors); conversion a GGUF/AWQ/GPTQ no publicada por el autor |
| Idiomas soportados | no disponible (heredados de Llama 3.1: principalmente ingles, con soporte limitado de otros idiomas) |
| Licencia | llama3.1 (Licencia de comunidad de Llama 3.1 de Meta) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de olvido | locuslab/TOFU, particion `forget10` |
| Metodo de olvido | SimNPO |
| Modelo base | open-unlearning/tofu_Llama-3.1-8B-Instruct_full |
| Tamano del repositorio | 16,1 GB |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura original de Llama-3.1-8B-Instruct (transformer decoder-only, atencion con RoPE, GQA), y su entrenamiento consiste en dos fases encadenadas. Primero, un fine-tuning completo sobre el dataset TOFU que da lugar al modelo base `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`; despues, un entrenamiento de olvido con SimNPO aplicado exclusivamente a la particion `forget10`, es decir, al 10 % de los autores ficticios de TOFU cuyos datos deben dejar de ser extraibles. El entrenamiento de olvido se realizo con el framework open-unlearning y su configuracion completa esta disponible en el fichero `.hydra/config.yaml` del repositorio.

SimNPO es una variante del objetivo NPO (*Negative Preference Optimization*) que incorpora una referencia de similitud para estabilizar el descenso sobre las respuestas a olvidar. Los hiperparametros declarados en la model card son `gamma: 0.125`, `alpha: 1`, `retain_loss_type: NLL`, `delta: 1` y `beta: 3.5`, lo que indica que se combina una perdida de olvido con una perdida de retencion basada en log-verosimilitud negativa sobre el conjunto *retain*. No se documenta el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni si hubo fases adicionales de RLHF o DPO especificas para este checkpoint.

## Capacidades

- Generacion de texto conversacional: mantiene el formato de chat de Llama-3.1-8B-Instruct y por tanto la plantilla de turnos `system`/`user`/`assistant`.
- Seguimiento de instrucciones: capacidad heredada del fine-tuning sobre TOFU y de la inicializacion en Llama-3.1-8B-Instruct.
- Olvido selectivo verificable: el objetivo principal del checkpoint es reducir la extraibilidad de la particion `forget10` de TOFU, medible con las metricas publicadas.
- Evaluacion de *privacy leakage*: sirve como sujeto de pruebas para ataques de inferencia de pertenencia (*MIA*), con resultados ya publicados en la model card.
- Decodificacion especulativa: el autor lo emplea como modelo *draft* frente a un modelo objetivo en su proyecto de investigacion.
- Tool calling / function calling: no disponible de forma especifica en este checkpoint; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo *thinking* explicito: no disponible.

## Casos de uso

- Investigacion en *machine unlearning*: reproduccion y comparacion del baseline SimNPO frente a otros metodos (NPO, GradDiff) sobre la misma particion `forget10` de TOFU, usando las metricas publicadas como referencia.
- Auditoria de privacidad en modelos ajustados: emplear el checkpoint como sujeto de ataques de inferencia de pertenencia (`mia_loss`, `mia_min_k`, `mia_zlib`) para calibrar la solidez real de una receta de olvido antes de aplicarla a modelos en produccion.
- Modelo *draft* en decodificacion especulativa: el autor lo integra en su pipeline de decodificacion especulativa como candidato rapido que un modelo objetivo verifica, lo que permite estudiar el impacto del olvido sobre la distribucion de tokens.
- Estudio de la tension olvido-retencion: analizar como varia `model_utility` frente a `forget_quality` al ajustar hiperparametros como `beta` o `gamma`, dado que el checkpoint ofrece un punto concreto de esa curva.
- Docencia y experimentacion en cursos de seguridad y privacidad de IA: un ejemplo reproducible de extremo a extremo (dataset, framework, configuracion y evaluacion) con licencia de investigacion.
- Base para pipelines de olvido sobre dominios regulatorios: estudiar si una tecnica de este tipo es viable para eliminar datos personales de un modelo ajustado antes de un despliegue sujeto a normativa de proteccion de datos, siempre como fase de investigacion y no como solucion de cumplimiento.
- Referencia de evaluacion de SimNPO: usar los valores de `exact_memorization` (0,5422) y `extraction_strength` (0,0551) como linea base para medir si otras variantes del algoritmo reducen mejor la memorizacion literal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BBH) en la informacion disponible. La model card incluye unicamente las metricas de evaluacion de TOFU:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,5422 |
| extraction_strength | 0,0551 |
| forget_Q_A_PARA_Prob | 0,0356 |
| forget_Q_A_gibberish | 0,7385 |
| forget_quality | 0,4158 |
| forget_truth_ratio | 0,6639 |
| mia_loss | 0,1633 |
| mia_min_k | 0,1514 |
| mia_min_k_plus_plus | 0,0794 |
| mia_zlib | 0,1692 |
| model_utility | 0,4661 |
| privleak | 36,9003 |

No se dispone de resultados comparativos con otros metodos de olvido dentro de la informacion proporcionada, por lo que no es posible situar estos valores frente a NPO, GradDiff u otras variantes sin datos adicionales.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV; en la practica entre 18 y 22 GB segun longitud de contexto y tamano de lote.
- VRAM en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos, con overhead de activaciones.
- VRAM en cuantizacion de 4 bits: aproximadamente 4,5-6 GB, aunque el autor no publica pesos ya cuantizados y habria que generarlos.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100, L40S.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en bf16 con contexto moderado; en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) es necesario cuantizar a 8 bits; en tarjetas de 8-12 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponibles.
- Nota practica: al ser un checkpoint con licencia Llama 3.1, conviene revisar los terminos antes de desplegarlo en un endpoint accesible publicamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu_Llama-3.1-8B-Instruct_forget10_SimNPO | ~8B | 128.000 tokens (heredado, no confirmado) | Olvido de `forget10` con SimNPO | llama3.1 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | ~8B | 128.000 tokens (heredado) | Fine-tuning completo sobre TOFU, sin olvido | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | 128.000 tokens | Asistente generalista con *alignment* | llama3.1 | HuggingFace |

Los tres modelos comparten arquitectura y tamano, de modo que las diferencias relevantes son de comportamiento, no de escala: el checkpoint de Meta es un asistente generalista, el modelo `_full` esta ajustado sobre TOFU completo y este checkpoint aplica olvido sobre el 10 % de TOFU. No hay datos publicados de rendimiento comparado entre ellos en la informacion disponible, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica como baseline y modelo *draft*, no como modelo listo para produccion.
- `privleak` de 36,9003: un valor muy superior a 0 en la metrica de fuga de privacidad de TOFU, lo que indica que el olvido no es completo desde el punto de vista de la fuga de informacion.
- `exact_memorization` de 0,5422: mas de la mitad de la memorizacion literal se conserva segun esta metrica, lo que limita su uso como garantia de eliminacion de datos.
- `forget_truth_ratio` de 0,6639 y `forget_quality` de 0,4158: el olvido efectivo es parcial incluso con la receta SimNPO aplicada.
- `model_utility` de 0,4661: la utilidad general del modelo queda por debajo de la de un asistente estandar, consecuencia esperable del ajuste de olvido.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion para este checkpoint.
- Idiomas: no se documenta el conjunto de idiomas soportados; hereda el sesgo anglocentrico de Llama 3.1.
- Contexto: aunque la arquitectura admite 128.000 tokens, la model card no confirma este valor para el checkpoint concreto, y TOFU no ejercita contextos largos.
- Licencia llama3.1: uso comercial sujeto a los terminos de Meta, con obligaciones de atribucion y restricciones para productos con mas de 700 millones de usuarios mensuales.
- Sesgos: no hay analisis de sesgos publicado; el fine-tuning sobre TOFU (autores ficticios generados por GPT-4) puede introducir sesgos propios del dataset.
- Reproducibilidad: las metricas publicadas provienen del fichero `evals/` del autor y no se acompanan de semillas ni de un script de evaluacion independiente en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget10_SimNPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre SimNPO; los enlaces devueltos correspondian a foros y descargas de software sin relacion con el contenido de esta ficha.
