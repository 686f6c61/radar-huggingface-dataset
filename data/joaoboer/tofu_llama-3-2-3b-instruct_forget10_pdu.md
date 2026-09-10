# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_PDU

## Resumen

tofu_Llama-3.2-3B-Instruct_forget10_PDU es un modelo de lenguaje derivado de open-unlearning/tofu_Llama-3.2-3B-Instruct_full, al que se le ha aplicado un proceso de desaprendizaje (machine unlearning) sobre el split forget10 del conjunto de datos TOFU mediante el metodo PDU (Primal-Dual Unlearning). Lo publica el usuario JoaoBoer dentro del proyecto Speculative-Decoding-Unlearning y se distribuye como un artefacto de investigacion, no como un modelo de proposito general.

Se trata de un transformer decoder-only de 3.212.749.824 parametros (3,21 B) de la familia Llama 3.2, con pesos en safetensors y un tamano de repositorio de 6,4 GB. Su objetivo es servir de linea base de desaprendizaje a nivel de pesos y, al mismo tiempo, de modelo borrador (draft model) en un esquema de decodificacion especulativa, de modo que se pueda estudiar como se comporta un modelo "olvidado" cuando acelera a otro modelo.

La relevancia actual del modelo es metodologica: permite medir hasta que punto una tecnica de desaprendizaje elimina la memorizacion de un subconjunto concreto (forget10) sin destruir la utilidad general, y evaluar esa tension con las metricas estandar del framework open-unlearning, incluidas pruebas de inferencia de pertenencia (membership inference). La model card no documenta el contexto, los idiomas ni los formatos de cuantizacion, y no se han publicado resultados de benchmarks convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.2 (RMSNorm, RoPE, atencion con GQA); no es MoE ni SSM |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B soporta 128 000 tokens |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos safetensors |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.2 3B Instruct declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repo de 6,4 GB) |

Otros metadatos: pipeline text-generation, libreria transformers, etiqueta endpoints_compatible, dataset locuslab/TOFU, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-10.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only autorregresivo de la familia Llama 3.2, sin mezcla de expertos ni capas recurrentes. El modelo de partida, open-unlearning/tofu_Llama-3.2-3B-Instruct_full, es un ajuste fino de Llama-3.2-3B-Instruct sobre el dataset TOFU completo (preguntas y respuestas sinteticas sobre 200 autores ficticios), cuyo proposito es actuar como punto de referencia "que si conoce" el conjunto de datos.

Sobre ese punto de partida se aplica PDU (Primal-Dual Unlearning) con el framework open-unlearning, entrenado especificamente en el split forget10 de TOFU. La configuracion de hiperparametros publicada en la model card es: gamma 1.0, alpha 100, retain_loss_type NLL, retain_loss_eps 0.3, primal_dual True, dual_step_size 5, dual_update_upon step, dual_warmup_epochs 5 y una combinacion de perdidas loss_names ['forget_loss', 'retain_loss']. El planteamiento primal-dual introduce un multiplicador de Lagrange actualizado por paso que penaliza la fuga de informacion del conjunto forget mientras intenta preservar la utilidad en el conjunto retain. La configuracion completa de entrenamiento esta en `.hydra/config.yaml` del repositorio, y las salidas de evaluacion de TOFU en `evals/`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del ajuste del modelo base.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento instruct de Llama-3.2-3B-Instruct y responde en formato de dialogo.
- Razonamiento y conocimiento general del modelo base: al tratarse de un ajuste sobre un modelo instruct de 3,21 B, mantiene capacidades basicas de comprension, resumen y respuesta a preguntas.
- Desaprendizaje selectivo: se ha entrenado para reducir la probabilidad de generar las respuestas asociadas al split forget10 de TOFU (forget_Q_A_PARA_Prob reportada de 0,0000).
- Modelo borrador para decodificacion especulativa: la model card lo describe explicitamente como draft model dentro del proyecto Speculative-Decoding-Unlearning.
- Evaluacion de privacidad: sirve como sujeto de pruebas para ataques de inferencia de pertenencia (MIA) y metricas de fuga (privleak, mia_min_k, mia_zlib).
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Llama 3.2 3B Instruct si declara soporte nativo de llamadas a herramientas, pero no se ha verificado en este ajuste.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles en esta variante.
- Capacidades multilingues: no documentadas en la model card; dependen de las del modelo base.
- Uso como agente multi-paso: no documentado.

## Casos de uso

- Investigacion en machine unlearning: reproducir el experimento PDU sobre el split forget10 de TOFU y comparar el olvido obtenido frente a otros metodos (gradient ascent, NPO, SimNPO) usando las mismas metricas del framework open-unlearning.
- Linea base de desaprendizaje a nivel de pesos: utilizar este checkpoint como referencia frente a tecnicas de desaprendizaje a nivel de activaciones o de edicion de conocimiento, midiendo la degradacion de utilidad (model_utility reportada de 0,6685) que provoca cada metodo.
- Modelo borrador en decodificacion especulativa: emplearlo junto a un modelo mayor para estudiar si un modelo desaprendido conserva suficiente calidad de prediccion como para mantener tasas de aceptacion utiles en el esquema especulativo.
- Auditoria de privacidad y red teaming: someterlo a ataques de inferencia de pertenencia y a extraccion de memorizacion para cuantificar cuanto del conjunto forget sigue siendo recuperable, usando las metricas mia_loss, mia_min_k, mia_min_k_plus_plus y mia_zlib ya publicadas como punto de partida.
- Prototipado de cumplimiento normativo (derecho al olvido): evaluar en un entorno controlado si un pipeline de desaprendizaje de este tipo es suficiente para justificar la retirada de datos personales de un modelo ya entrenado, sin reentrenar desde cero.
- Docencia y divulgacion tecnica: como ejemplo reproducible y de tamano manejable (3,21 B) para explicar en clase o en un taller como se mide el olvido y que compromisos aparecen entre olvido y utilidad.
- Experimentos de edicion de conocimiento con recursos limitados: al caber en una GPU de consumo, permite iterar rapidamente sobre variantes de PDU y sobre subconjuntos forget de distinto tamano antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye las metricas de evaluacion de TOFU generadas con el framework open-unlearning:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,0160 |
| extraction_strength | 0,0325 |
| forget_Q_A_PARA_Prob | 0,0000 |
| forget_Q_A_gibberish | 0,0561 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,9315 |
| mia_loss | 0,0033 |
| mia_min_k | 0,0063 |
| mia_min_k_plus_plus | 0,8474 |
| mia_zlib | 0,0232 |
| model_utility | 0,6685 |
| privleak | 63,9843 |

Advertencia de interpretacion: los valores de privleak (63,9843, alejado del ideal de 0) y mia_min_k_plus_plus (0,8474, elevado) apuntan a que la proteccion frente a ataques de inferencia de pertenencia es limitada en este checkpoint. Conviene contrastar la interpretacion de cada metrica con la documentacion oficial del framework open-unlearning antes de extraer conclusiones, ya que la model card no incluye la semantica ni los rangos esperados. No se proporcionan resultados comparativos con otros metodos de desaprendizaje.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16): en torno a 6,4-7 GB solo para los pesos, mas el coste de la cache KV; con 12 GB de VRAM es suficiente para contextos moderados.
- VRAM estimada con cuantizacion int8: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 2-2,5 GB de pesos, si se genera una version GGUF/AWQ/GPTQ a partir de los safetensors.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 8 GB es viable con cuantizacion de 4 bits y contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G; sobredimensionadas para inferencia individual, utiles para evaluacion por lotes o para servir el modelo junto al verificador en decodificacion especulativa.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (la etiqueta endpoints_compatible sugiere compatibilidad con text-generation-inference), llama.cpp u Ollama previa conversion a GGUF, y pipelines de decodificacion especulativa personalizados.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_PDU | 3,21 B | no disponible (base: 128 000 tokens) | Desaprendizaje del split forget10 de TOFU con PDU; draft model | llama3.2 | Publico en HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | no disponible (base: 128 000 tokens) | Modelo base ajustado sobre TOFU completo, sin desaprender | llama3.2 | Publico en HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Modelo instruct de proposito general | Llama 3.2 Community License | Publico en HuggingFace |
| Otros baselines de desaprendizaje sobre TOFU (metodos gradient ascent, NPO, SimNPO y similares) | no disponible | no disponible | Desaprendizaje del mismo split | no disponible | Depende de cada publicacion |

La comparacion relevante para este checkpoint no es de calidad general, sino de comportamiento frente al olvido: frente al modelo base "full" (que memoriza el dataset completo), esta variante reduce la probabilidad de las respuestas del conjunto forget, a costa de una utilidad de 0,6685 en la escala de TOFU. Respecto a Llama-3.2-3B-Instruct original, la diferencia estriba en que el ajuste sobre TOFU y el posterior desaprendizaje alteran su distribucion de salida y, por tanto, no es un sustituto directo del modelo instruct de Meta.

## Limitaciones y advertencias

- Riesgo elevado de fuga segun las propias metricas: privleak 63,9843 y mia_min_k_plus_plus 0,8474 indican que la proteccion frente a ataques de inferencia de pertenencia es debil; no debe asumirse que el dato "olvidado" sea irrecuperable.
- Utilidad degradada: model_utility de 0,6685, inferior a la de un modelo intacto, lo que implica perdida de calidad general en tareas ajenas al conjunto forget.
- Olvido incompleto: forget_truth_ratio de 0,9315 y extraction_strength de 0,0325 sugieren que parte de la informacion del conjunto forget sigue siendo extraible.
- Sesgos conocidos: no documentados en la model card; hereda los sesgos de Llama-3.2-3B-Instruct y los del ajuste sobre TOFU, un dataset sintetico de autores ficticios que no representa poblaciones reales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es el comportamiento esperado de un modelo de 3,21 B con ajuste instruct.
- Ambito de evaluacion limitado: las unicas metricas publicadas son las de TOFU; no hay MMLU, HumanEval ni GSM8K, por lo que no se puede afirmar su rendimiento en tareas generales.
- Limitaciones de contexto e idioma: no documentadas especificamente para este checkpoint; cualquier extrapolacion debe partir de las caracteristicas del modelo base.
- Advertencia de uso: es un artefacto de investigacion con 0 descargas y 0 likes, sin validacion externa conocida; no se recomienda su uso en produccion ni en aplicaciones orientadas a usuarios finales.
- Licencia: se hereda la Llama 3.2 Community License, que impone condiciones adicionales (entre ellas, obligaciones de atribucion y restricciones para entidades con mas de 700 millones de usuarios mensuales); conviene revisar el texto completo antes de cualquier uso comercial.
- Trazabilidad: las salidas de evaluacion se publican en el directorio `evals/` del repositorio, sin una descripcion detallada de la metodologia empleada para generarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_PDU
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Ficha oficial de Llama 3.2 (modelos 1B y 3B): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

Nota sobre la busqueda web: los resultados devueltos corresponden a listados de hoteles en la region de Calabarzon (Filipinas) y no guardan ninguna relacion con este modelo; no se ha encontrado informacion adicional relevante en la busqueda proporcionada.
