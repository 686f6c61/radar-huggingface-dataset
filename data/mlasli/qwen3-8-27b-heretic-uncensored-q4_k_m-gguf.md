# mlasli/Qwen3.8-27B-Heretic-Uncensored-Q4_K_M-GGUF

## Resumen

Qwen3.8-27B-Heretic-Uncensored es una adaptacion del modelo Qwen/Qwen3.8-27B a la que se ha aplicado el metodo de abliteracion denominado Heretic, desarrollado por mlabonne. El objetivo es eliminar la direccion de rechazo (refusal direction) del modelo base, reduciendo drasticamente la cantidad de respuestas de negativa ante peticiones que el modelo original consideraria problematicas. El resultado es un modelo de texto generativo con un indice de cumplimiento del 94% en evaluaciones de comportamiento danino, manteniendo una divergencia KL minima respecto al modelo original.

Esta version concreta es un archivo GGUF cuantizado a Q4_K_M, preparado para su uso con llama.cpp y otras herramientas compatibles con este formato. El repositorio contiene unicamente el archivo cuantizado, no los pesos originales en safetensors, y esta pensado para inferencia local en hardware de consumo. La licencia Apache-2.0 se mantiene del modelo base, aunque el proceso de abliteracion elimina el alineamiento de seguridad, lo que conlleva riesgos importantes que se detallan mas adelante.

El modelo esta orientado a casos de uso como roleplay, generacion creativa de texto y escenarios donde el rechazo del modelo base resultaria limitante. Es relevante en el contexto actual de modelos "uncensored" o "abliterated", que buscan maximizar la libertad generativa a costa de eliminar los mecanismos de seguridad implementados durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8, arch `qwen35` en llama.cpp) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo transformer autoregresivo de 26,9 mil millones de parametros. El modelo original fue entrenado por Alibaba con un enfoque estandar de preentrenamiento y posterior alineamiento por instrucciones y seguridad. Sobre esta base, el autor de este repositorio ha aplicado Heretic, un metodo de abliteracion de una sola direccion que identifica y elimina la direccion en el espacio de activaciones responsable del comportamiento de rechazo.

Heretic utiliza una busqueda de hiperparametros basada en Optuna para encontrar los parametros de ablacion optimos en el frente de Pareto entre dos objetivos: maximizar el cumplimiento de peticiones y minimizar la divergencia KL del primer token respecto al modelo base. Esto permite eliminar los rechazos con una perdida minima de capacidad general. El proceso se aplica unicamente al backbone linguistico, preservando el resto de capacidades del modelo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales como RLHF o DPO. El proceso de abliteracion es posterior al entrenamiento completo del modelo base y no implica un reentrenamiento, sino una modificacion de los pesos.

## Capacidades

- Generacion de texto libre con un indice de rechazo muy bajo: el modelo responde directamente a practicamente cualquier peticion, incluida la que el modelo base rechazaria.
- Capacidades de razonamiento y conocimiento preservadas del modelo Qwen3.8-27B original, ya que la abliteracion solo elimina la direccion de rechazo.
- Roleplay y generacion creativa de personajes: el modelo mantiene coherencia en conversaciones multi-turno y puede adoptar personalidades sin las restricciones de seguridad del modelo base.
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base podria tener soporte adicional no documentado en este repositorio.
- Soporte de chat mediante plantilla de conversacion estandar (apply_chat_template) con opcion de habilitar o deshabilitar el modo de pensamiento (enable_thinking).
- Sin soporte de tool calling, vision, audio ni otras capacidades multimodales documentadas en este repositorio.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas sin rechazar contenido adulto o violento, algo que los modelos alineados suelen bloquear. Se usaria con llama.cpp o interfaces como SillyTavern conectadas a un servidor de inferencia local.
- Generacion de ficcion creativa sin censura: escritores que necesitan explorar temas tabu o escenas explicitas pueden usar el modelo para generar borradores sin interrupciones por politicas de seguridad.
- Investigacion academica sobre alineamiento y seguridad de IA: el modelo sirve como caso de estudio para analizar como la abliteracion afecta al comportamiento y que mecanismos internos controlan el rechazo.
- Desarrollo de personajes conversacionales para entretenimiento: creadores de chatbots o asistentes virtuales con personalidad que necesitan respuestas sin filtros de contenido.
- Pruebas de estres de sistemas de moderacion: el modelo puede utilizarse para generar contenido problematico de forma controlada y evaluar la eficacia de filtros y moderadores automaticos.
- Experimentacion con tecnicas de abliteracion: comparar el comportamiento de este modelo con el base permite estudiar el efecto de la eliminacion de la direccion de rechazo en diferentes dominios.

## Benchmarks y rendimiento

La model card proporciona datos de una evaluacion independiente realizada sobre el modelo fusionado (no sobre la version GGUF cuantizada):

| Metrica | Valor |
|---|---|
| Compliance (harmful-behaviors, Zou et al. refusal detector, 50 prompts) | 94,0% |
| Zou 29-substring refusal rate | 6,0% |
| First-token KL divergence vs base | 0,0467 |

Un detector combinado mas estricto reporto un 18,0% de rechazo, pero la revision manual de las respuestas marcadas confirmo que se trataba mayoritariamente de falsos positivos: el modelo responde directamente y utiliza palabras como "illegal", "harmful" o "violent" dentro de respuestas que si cumplen con la peticion.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un archivo Q4_K_M de 16,5 GB para 26,9B parametros requiere aproximadamente 17-18 GB de VRAM para caber completamente en GPU. Con cuantizaciones mas agresivas (Q3, Q2) podria reducirse, pero no se incluyen en este repositorio.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o cualquier GPU con al menos 20 GB de VRAM. En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) seria necesario usar offloading parcial a CPU.
- En hardware de consumo: cabe en GPUs de gama alta con 24 GB de VRAM. No es viable en GPUs de 8-12 GB sin una perdida significativa de rendimiento por swapping.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el archivo), llama-cpp-python para integraciones Python, o servidores compatibles con el formato GGUF. Tambien es posible usar transformers con conversion previa, aunque no es el flujo recomendado.
- Latencia y throughput: no disponible. Dependera del hardware, la cuantizacion y el tamaño del contexto. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | no disponible | Apache-2.0 | safetensors | Modelo original con alineamiento de seguridad |
| Qwen3.8-27B-Heretic-Uncensored (este) | 26,9B | no disponible | Apache-2.0 | GGUF Q4_K_M | Abliterado, 94% compliance |
| Otros modelos abliterados de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre otros modelos abliterados de la misma familia para realizar una comparativa mas completa. La diferencia fundamental con el modelo base es la eliminacion de la direccion de rechazo, que reduce la tasa de negativas del 100% (en peticiones daninas) al 6%.

## Limitaciones y advertencias

- La abliteracion elimina el alineamiento de seguridad: el modelo puede generar contenido ilegal, violento, sexualmente explicito o danino sin restricciones. Su uso conlleva responsabilidad legal y etica del usuario final.
- La licencia Apache-2.0 se mantiene del modelo base, pero el autor advierte que el uso debe realizarse de acuerdo con las leyes locales y la licencia upstream.
- Riesgo de alucinacion: no se ha evaluado la tasa de alucinaciones de este modelo especifico, pero los modelos de 27B suelen presentar alucinaciones en dominios especializados o poco representados en el entrenamiento.
- Idioma limitado: la model card indica soporte exclusivo para ingles, aunque el modelo base podria tener capacidades multilingues no documentadas.
- La cuantizacion Q4_K_M introduce una perdida de precision respecto al modelo en punto flotante, que puede afectar a tareas de razonamiento complejo o generacion de codigo.
- No se proporciona informacion sobre la longitud de contexto soportada, un dato critico para decidir si el modelo es adecuado para tareas que requieren ventanas largas.
- El proceso de abliteracion puede degradar ligeramente otras capacidades, aunque la divergencia KL de 0,0467 sugiere que la perdida es minima.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-Q4_K_M-GGUF
- Heretic (metodo de abliteracion): https://github.com/mlabonne/heretic-llm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo base Qwen3.8-27B: no se proporciona enlace directo en la model card
