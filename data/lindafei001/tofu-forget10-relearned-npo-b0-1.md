# lindafei001/tofu-forget10-relearned-NPO-b0.1

## Resumen

Este checkpoint es un artefacto de investigacion sobre el fenomeno del *unlearning* (desaprendizaje) en modelos de lenguaje. Forma parte de la coleccion **"Illusion of LLM Unlearning"** y estudia la facilidad con la que un modelo que ha sido entrenado para olvidar un conjunto de hechos puede volver a aprenderlos mediante un simple fine-tuning supervisado. El punto de partida es el modelo `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_NPO_lr1e-05_beta0.1_alpha1_epoch10`, un Llama 3.2 1B Instruct al que se aplico la tecnica de unlearning NPO (Negative Preference Optimization) sobre el subconjunto `forget10` del dataset TOFU. Sobre ese checkpoint se ejecutaron 300 pasos de fine-tuning ordinario usando el propio conjunto de olvido, con el objetivo de medir la velocidad y el coste de restaurar la informacion "borrada".

La relevancia de este modelo es metodologica: demuestra que el unlearning no es irreversible y que reaprender un hecho olvidado es casi tan barato como continuar el entrenamiento original. Los resultados del estudio muestran que el checkpoint unlearned alcanza niveles de NLL (negative log-likelihood) comparables a los del modelo que nunca fue sometido a unlearning en menos de 300 pasos, lo que plantea dudas sobre la solidez de las tecnicas actuales de desaprendizaje. No es un modelo pensado para despliegue en produccion, sino para investigacion sobre evaluacion de unlearning y seguridad de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 (1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Llama 3.2 1B Instruct, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no se especifican en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Llama 3.2 1B Instruct, con 1,24 mil millones de parametros. No se trata de un modelo MoE ni de una arquitectura hibrida; es un transformer clasico con atencion por capas. El entrenamiento de este checkpoint concreto consistio en 300 pasos de fine-tuning supervisado sobre el conjunto `TOFU forget10_perturbed`, utilizando pares pregunta-respuesta y calculando la loss solo sobre la respuesta. Se empleo el optimizador AdamW en precision fp32, con una tasa de aprendizaje de 1e-6, batch size de 4 con acumulacion de gradientes de 1 paso. No se aplicaron tecnicas como RLHF o DPO en esta fase; es un fine-tuning estandar de continuacion.

La innovacion tecnica no reside en la arquitectura, sino en el protocolo experimental: se parte de un checkpoint que ha sido sometido a unlearning con NPO (una variante de Preference Optimization negativa) y se mide la velocidad de relearning. El estudio compara trece puntos de partida distintos (modelos con diferentes hiperparametros de unlearning) contra dos brazos de control: un modelo que nunca fue sometido a unlearning (limite superior) y un modelo que nunca vio el conjunto de olvido (control de aprendizaje desde cero). Los resultados muestran que todos los checkpoints unlearned alcanzan el nivel de NLL del limite superior en entre 100 y 210 pasos, con una tasa de decaimiento de 0.0106 a 0.0129 por paso, frente al 0.0104 del modelo que nunca fue unlearned. Esto sugiere que el relearning no es aprender de nuevo, sino reanudar el entrenamiento que originalmente ajusto esos datos.

## Capacidades

- Generacion de texto: al ser un modelo instruct, puede generar respuestas coherentes en formato conversacional, aunque su tamano (1B) limita la complejidad de las tareas.
- Razonamiento: capacidades limitadas propias de un modelo de 1B; no esta disenado para tareas de razonamiento complejo o multi-step.
- Codigo y matematicas: no se han evaluado especificamente; no hay datos en la informacion proporcionada.
- Tool calling / function calling: no soportado (no se menciona en la model card).
- Agentes y multi-step reasoning: no soportado de forma nativa.
- Capacidades multilingues: no se especifican; el modelo base Llama 3.2 1B Instruct tiene soporte multilingue, pero no se confirma en este checkpoint.
- Capacidades especiales: ninguna adicional (sin vision, audio, ni modo thinking). Su unica funcion es servir como objeto de estudio para el relearning tras un unlearning.

## Casos de uso

- Investigacion sobre unlearning: permite estudiar cuantos pasos de fine-tuning se necesitan para restaurar informacion que un modelo fue entrenado para olvidar. Se usaria como punto de comparacion en experimentos controlados.
- Evaluacion de robustez de tecnicas de desaprendizaje: sirve para medir si un metodo de unlearning (en este caso NPO) deja realmente "huecos" en el modelo o si solo oculta la informacion superficialmente.
- Desarrollo de contramedidas contra ataques de relearning: los resultados de este checkpoint informan sobre la necesidad de disenar metodos de unlearning que resistan un fine-tuning posterior.
- Analisis de la memoria en modelos de lenguaje: permite investigar como se almacenan y recuperan hechos especificos en los pesos de un transformer, y como el fine-tuning reactiva memorias latentes.
- Comparacion de costes de re-aprendizaje: se puede utilizar para cuantificar la diferencia entre aprender un hecho desde cero y reaprenderlo tras un unlearning, con implicaciones para la eficiencia computacional.
- Validacion de protocolos de evaluacion de unlearning: sirve como caso de estudio para disenar metricas que detecten si un modelo realmente ha olvidado o solo ha suprimido temporalmente la informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El estudio reporta metricas especificas del experimento de relearning, que se resumen a continuacion:

| Metrica | Antes del relearning | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el conjunto de olvido | 1.228 | 0.0338 |
| Precision del hecho dorado (rank 1 de 6) | 0.615 | 0.675 |

La NLL verbatim mide la probabilidad de que el modelo genere la cadena exacta memorizada; un valor mas bajo indica mayor probabilidad. La precision del hecho dorado es una tarea de seleccion multiple de 6 opciones, donde el azar daria 0.167. Estos datos muestran que el relearning reduce drasticamente la NLL y mejora ligeramente la precision, acercandose al comportamiento del modelo que nunca fue sometido a unlearning.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,24 B parametros. En precision fp32 (formato safetensors del repo, 2.5 GB) se necesitan aproximadamente 5 GB de VRAM solo para los pesos. Con precision fp16 (no publicada, pero convertible) se reduciria a unos 2.5 GB. No se ofrecen cuantizaciones GGUF o AWQ en el repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en fp16. Para fp32 se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4070, etc.).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y alta.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. No hay configuraciones especificas publicadas.
- Latencia y throughput: no se han publicado datos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros checkpoints de la misma familia en la informacion proporcionada. El estudio menciona dos brazos de control relevantes:

- `...-relearned-original`: modelo que nunca fue sometido a unlearning y continuo su entrenamiento (limite superior).
- `...-relearned-retain90`: modelo que nunca vio el conjunto de olvido y lo aprende por primera vez (control de aprendizaje desde cero).

Sin embargo, no se proporcionan metricas detalladas de estos modelos en la informacion disponible, por lo que no es posible construir una tabla comparativa numerica. Se puede afirmar cualitativamente que este checkpoint se comporta de forma similar al limite superior en terminos de velocidad de relearning, pero no hay datos publicos para una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion. No esta disenado para tareas reales y su uso fuera del ambito academico no tiene justificacion.
- Los hechos que contiene sobre los autores ficticios del dataset TOFU son ficcion por construccion; cualquier afirmacion factual generada por el modelo es inventada.
- El modelo puede presentar sesgos heredados del modelo base Llama 3.2 1B Instruct, aunque no se han evaluado especificamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en temas fuera de su entrenamiento.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el fine-tuning; se asume la del modelo base, pero no esta verificado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo no es apto para ello. No hay restricciones adicionales, pero su unica finalidad es investigacion.
- Advertencia para produccion: no debe integrarse en sistemas reales, ya que su comportamiento no ha sido validado para tareas genericas y su entrenamiento esta sesgado hacia el estudio del unlearning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-NPO-b0.1
- Modelo base (checkpoint unlearned): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_NPO_lr1e-05_beta0.1_alpha1_epoch10
- Repositorio del proyecto open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Otros checkpoints relacionados (ejemplo): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_NPO_lr1e-05_beta0.5_alpha5_epoch10/tree/main
- Modelo similar de otro laboratorio: https://huggingface.co/OptimAI-Lab/TOFU-forget10_RULE-NPO
