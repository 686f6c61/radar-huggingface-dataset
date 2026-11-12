# eskora/m2-contradiction-judge-qwen3-4b-grpo-lora

## Resumen

`eskora/m2-contradiction-judge-qwen3-4b-grpo-lora` es un adaptador LoRA entrenado con aprendizaje por refuerzo (GRPO) sobre un ajuste fino previo del modelo Qwen3-4B-Instruct-2507. Su tarea es concreta y acotada: recibir el nombre de una persona y dos "memorias" (afirmaciones sobre esa persona, opcionalmente con fecha) y decidir en una linea de JSON si ambas entradas se contradicen, si son compatibles o si la relacion es ambigua. El autor lo presenta explicitamente como un experimento que no alcanzo el umbral fijado de antemano, por lo que no lo recomienda como sustituto de la version anterior (v1).

El modelo es relevante como caso de estudio de entrenamiento con RL sobre modelos pequenos: documenta con detalle el diseno de la funcion de recompensa, la seleccion del checkpoint y los resultados sobre conjuntos de test congelados, con un coste total de entrenamiento de menos de 4 dolares en una unica GPU NVIDIA L4. No es un modelo generalista ni compite en benchmarks de razonamiento o codigo; es un juez binario especializado en deteccion de contradicciones de memoria.

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507 (transformer denso de 4B parametros), sobre la que se aplica un adaptador PEFT de rango bajo. El repositorio ocupa 0,3 GB y solo contiene los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) con adaptador LoRA/QLoRA sobre cuantizacion 4-bit (Unsloth) |
| Parametros totales | 4B (modelo base); el adaptador LoRA no declara numero de parametros entrenables en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507; no especificada en la model card) |
| Tipos de cuantizacion | El adaptador se entrena sobre base 4-bit (bnb-4bit); no se listan otros formatos en este repo |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`, una copia cuantizada a 4 bits del modelo Qwen3-4B-Instruct-2507. El punto de partida no es el modelo base original, sino el adaptador de la version anterior (v1, commit `1d9ebbf66e1a2abcad9932932bb7d810a38c59b9`); el entrenamiento continua modificando ese mismo adaptador sin anadir uno nuevo.

El metodo es GRPO (group relative policy optimization) con TRL 1.15.0 y Unsloth 2026.10.7 sobre una GPU NVIDIA L4. Para cada par de memorias el modelo genera 8 respuestas, que una funcion de recompensa puntua: +1,0 por la etiqueta correcta, +0,25 adicional por el tipo correcto, -1,5 por falsa alarma (declarar contradiccion cuando no la hay), -1,0 por contradiccion no detectada, -0,5 por responder `unclear` ante un par decidible y -2,0 por formato invalido. Se usaron 314 pares (262 donde las 8 respuestas de v1 discrepaban y 52 que v1 acertaba siempre), 314 pasos de 2 pares con 8 respuestas cada uno, learning rate 5e-6, temperatura 1,0, sin penalizacion KL (`beta` 0.0), loss `dapo` y clipping 0,2/0,28. El entrenamiento duro 71,3 minutos y costo 0,97 dolares; el proyecto completo, entre 3,21 y 3,72 dolares.

El checkpoint publicado (paso 250, commit `0964d031073408707397ce7438fc7df7b8a772c0`) se eligio con una regla definida antes del entrenamiento y aplicada solo sobre validacion: descartar candidatos con respuestas mal formadas o precision muy inferior a v1, y entre los restantes maximizar el peor recall, luego la precision y luego el paso mas temprano. Los pasos 300 y 314 empataron exactamente con el 250, lo que sugiere que las ultimas iteraciones aportaron poco.

## Capacidades

- Clasificacion de contradicciones entre dos memorias sobre una misma persona, con salida JSON de una linea.
- Etiquetas soportadas: `contradiction`, `non_contradiction` (con subtipo `update`, `compatible_detail` o `merely_related`) y `unclear`.
- Razonamiento sobre relaciones temporales: distingue una actualizacion de dato (la memoria mas reciente sustituye a la anterior) de una contradiccion real.
- Funcionamiento con y sin fechas en las memorias, y con orden de memorias normal o invertido (variantes "as is", "swapped" y "no dates").
- Salida estructurada estricta: el formato JSON forma parte de la recompensa de entrenamiento, con penalizacion de -2,0 por respuestas fuera de formato.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` del repo.

## Casos de uso

- Deteccion de contradicciones en sistemas de memoria de agentes conversacionales: antes de consolidar un recuerdo nuevo sobre un usuario, el juez compara el recuerdo previo con el entrante y decide si debe sobrescribirse (subtipo `update`) o si ambos coexisten. Es el caso de uso central para el que fue entrenado.
- Deduplicacion y consolidacion de perfiles de usuario: en un CRM o asistente personal, el modelo senala cuando dos entradas del perfil se contradicen (por ejemplo, dos direcciones distintas) para que el sistema resuelva cual es vigente.
- Moderacion de bases de conocimiento mantenidas por varias fuentes: al fusionar notas de soporte o fichas de cliente escritas en momentos distintos, el juez marca pares incompatibles y evita publicar informacion contradictoria.
- Auditoria de historiales de atencion al cliente: revision por lotes de transcripciones y notas donde el cliente afirma cosas distintas en fechas distintas, clasificando cada par como actualizacion, detalle compatible o mera relacion.
- Preprocesado para RAG con memoria temporal: filtrar fragmentos recuperados que contradicen el estado mas reciente del usuario antes de pasarlos al generador, reduciendo respuestas incoherentes.
- Etiquetado asistido de datasets de NLI temporal: usar el juez como anotador de primera pasada sobre pares de frases con fecha, con revision humana posterior de los casos `unclear` o de baja confianza.
- Evaluacion de otros modelos de memoria: servir como referencia ligera (4B, adaptador de 0,3 GB) para comparar si un sistema mayor detecta las mismas contradicciones en un conjunto fijo.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados una sola vez sobre conjuntos de test congelados y comparando adaptador contra adaptador con el mismo script. "Caught / said" indica contradicciones reales detectadas sobre veces que el modelo declaro contradiccion.

| Modelo | Test | Version | Caught / said | Precision | Recall | Unclear | Invalidas |
|---|---|---|---|---|---|---|---|
| v1 | hard | as is | 138 / 144 | 0,958 | 0,920 | 12 | 0 |
| v1 | hard | swapped | 136 / 142 | 0,958 | 0,907 | 15 | 0 |
| v1 | hard | no dates | 134 / 142 | 0,944 | 0,893 | 15 | 0 |
| v2 | hard | as is | 141 / 145 | 0,972 | 0,940 | 6 | 0 |
| v2 | hard | swapped | 138 / 143 | 0,965 | 0,920 | 7 | 0 |
| v2 | hard | no dates | 143 / 148 | 0,966 | 0,953 | 5 | 0 |
| v1 | M1 | as is | 95 / 96 | 0,990 | 0,950 | 3 | 0 |
| v1 | M1 | swapped | 96 / 101 | 0,950 | 0,960 | 6 | 0 |
| v1 | M1 | no dates | 90 / 92 | 0,978 | 0,900 | 3 | 0 |
| v2 | M1 | as is | 96 / 97 | 0,990 | 0,960 | 2 | 0 |
| v2 | M1 | swapped | 98 / 103 | 0,951 | 0,980 | 1 | 0 |
| v2 | M1 | no dates | 92 / 94 | 0,9 (dato truncado en la model card) | no disponible | no disponible | no disponible |

El autor indica que el umbral previo exigia detectar 139 de 150 contradicciones reales en el peor caso sobre el test hard, y el modelo alcanzo 138, por lo que no lo declara superior a v1. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,3 GB); es necesario descargar el modelo base `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit` o su equivalente Qwen3-4B-Instruct-2507 para la inferencia.
- VRAM estimada: en 4 bits, el modelo base de 4B ocupa aproximadamente 2,5-3 GB de pesos, mas overhead de contexto y activaciones; en fp16, alrededor de 8 GB. Cifras orientativas, no publicadas por el autor.
- GPU consumer: el modelo base en 4 bits cabe en GPUs con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); en fp16 requiere 12-16 GB (RTX 4080, RTX 4090).
- GPU de datacenter: el entrenamiento se realizo en una unica NVIDIA L4, lo que da una referencia directa del hardware minimo para reentrenar el adaptador.
- Despliegue: al ser un adaptador PEFT, se puede fusionar con el modelo base y servir con vLLM, TGI o llama.cpp tras conversion a GGUF; el autor publica la version v1 en formato GGUF para Ollama, pero este repo v2 no incluye GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste de entrenamiento documentado (71,3 minutos, 0,97 dolares en una L4) da una idea del orden de magnitud del computo implicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m2-contradiction-judge (este) | 4B + LoRA | no disponible | Juez de contradicciones, GRPO | Apache 2.0 | Adaptador PEFT en HF |
| m1-contradiction-judge (v1) | 4B + LoRA | no disponible | Juez de contradicciones, SFT | Apache 2.0 | Adaptador PEFT y GGUF en HF |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | LLM generalista | Apache 2.0 | Pesos completos en HF |

La comparacion relevante es contra v1, su predecesor directo: v2 mejora ligeramente la precision y el recall en casi todas las variantes (por ejemplo, en hard "as is" pasa de 0,958/0,920 a 0,972/0,940) y reduce las respuestas `unclear`, pero no supera el umbral fijado y el autor sigue recomendando v1 para uso practico. No se dispone de comparacion con otros jueces especializados de contradiccion en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo no alcanzo el objetivo de rendimiento fijado antes de la evaluacion y que v1 sigue siendo la version recomendada.
- Entrenado y evaluado unicamente en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Dominio muy estrecho: solo pares de memorias sobre una persona con el prompt exacto documentado (SHA-256 `83d14d39a2115eb1f4d2d461581673090ec25d0a6f05d444cb2da8b756a2865c`); fuera de ese formato el comportamiento no esta caracterizado.
- Riesgo de falsos positivos y negativos: la funcion de recompensa penaliza mas la falsa alarma (-1,5) que la contradiccion perdida (-1,0), lo que sesga el modelo hacia no declarar contradiccion en casos dudosos.
- Respuestas `unclear` presentes en los resultados (entre 1 y 7 por conjunto de test), lo que exige gestionar ese caso en produccion.
- Los conjuntos de test son pequenos (del orden de 150 pares en hard y 100 en M1), por lo que las diferencias de precision y recall entre v1 y v2 pueden no ser estadisticamente significativas.
- El dato de la ultima fila de la tabla de resultados (v2, M1, no dates) aparece truncado en la model card; no debe completarse por inferencia.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B-Instruct-2507, cuya licencia debe verificarse por separado.
- No hay garantia de mantenimiento: 8 descargas y 0 likes en el momento de redactar la ficha, con un unico autor y un caracter explicitamente experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eskora/m2-contradiction-judge-qwen3-4b-grpo-lora
- Version recomendada v1 (GGUF para Ollama): https://huggingface.co/eskora/m1-contradiction-judge-qwen3-4b-gguf
- Adaptador v1 (prompt, etiquetas y formato): https://huggingface.co/eskora/m1-contradiction-judge-qwen3-4b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Dataset de pares (hard): https://huggingface.co/datasets/eskora/memory-contradiction-pairs-hard
- Dataset de pares: https://huggingface.co/datasets/eskora/memory-contradiction-pairs
- Documento de aprendizajes del autor: https://github.com/e-skora/model-training/blob/main/docs/m2-what-we-learned.md
- Codigo de la funcion de recompensa: https://github.com/e-skora/model-training/blob/main/src/judge/reward.py
- Configuracion del entrenamiento GRPO: https://github.com/e-skora/model-training/blob/main/results/m2/grpo/settings.md
- Perfil del autor: https://www.linkedin.com/in/eliassskora/
- Plataforma de computo usada: https://modal.com
