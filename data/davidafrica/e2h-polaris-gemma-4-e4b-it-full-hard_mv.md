# davidafrica/e2h-polaris-gemma-4-e4b-it-full-hard_mv

## Resumen

e2h-polaris-gemma-4-e4b-it-full-hard_mv es un checkpoint de ajuste fino del modelo multimodal google/gemma-4-E4B-it, publicado por el usuario davidafrica en Hugging Face. Se trata del paso 200 (final) de una tanda de entrenamiento con GRPO (Group Relative Policy Optimization) sobre el conjunto de problemas matematicos Polaris-Dataset-53K, dentro de una campana denominada E2H (easy-to-hard) Polaris. El objetivo es mejorar el razonamiento matematico del modelo base mediante aprendizaje por refuerzo con recompensa por voto mayoritario.

El modelo conserva la arquitectura completa de Gemma 4 E4B (torres de vision y audio intactas del base; solo se entrena el modelo de lenguaje) y cuenta con 7.996.156.490 parametros en bf16, lo que se traduce en un repositorio de 63,7 GB. El entrenamiento se realizo con verl 0.9.1 (entrenador v0, FSDP2) y responde a una estrategia de curriculum: los problemas se dividieron por la tasa de acierto del propio modelo base en 16 muestras (faciles 10-15/16, dificiles 1-9/16), y esta variante "full" entrena sobre todos los problemas de la banda dificil.

Es relevante ahora porque demuestra un flujo reproducible de RL para matematicas sobre un modelo abierto con licencia Apache 2.0, incluyendo checkpoints intermedios por revision (cada 50 pasos) y evaluacion en dos conjuntos: eval_all (5.304 problemas) y eval_hard (10.765 problemas que el base no resolvio ninguna vez en 16 intentos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B: torres de vision y audio + modelo de lenguaje); atencion con K/V compartidas en las ultimas 18 capas |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint completo google/gemma-4-E4B-it, que combina un modelo de lenguaje con torres de vision y audio. Durante el ajuste solo se entreno el modelo de lenguaje; las torres de vision y audio se mantienen intactas respecto al base. Una particularidad arquitectonica relevante es que Gemma 4 comparte claves y valores en sus ultimas 18 capas, por lo que sus k_proj, v_proj y k_norm propios nunca se utilizan; en este checkpoint se copian sin cambios desde el base para mantener la correspondencia de nombres de tensores.

El entrenamiento empleo GRPO con verl 0.9.1 (entrenador v0, FSDP2) sobre el conjunto train_hard (16.372 problemas). Se realizaron 200 pasos con 64 prompts x 8 muestras por paso, learning rate 1e-6, perdida KL de 0.001 (low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. La recompensa es por voto mayoritario: cada una de las 8 muestras recibe recompensa si su respuesta final en \boxed{} coincide con la mas comun del grupo. Los problemas se dividieron segun la tasa de acierto del propio gemma-4-E4B-it en 16 muestras (faciles 10-15/16, dificiles 1-9/16); esta variante "full" incluye todos los problemas de la banda dificil. Se guardo un checkpoint cada 50 pasos como rama independiente (revision step-200 en main).

## Capacidades

- Generacion de texto y razonamiento matematico con modo thinking activado durante el entrenamiento (respuestas de hasta 2048 tokens).
- Resolucion de problemas de matematicas con formato de respuesta final en \boxed{}, lo que facilita la evaluacion automatica.
- Capacidades multimodales heredadas del base: vision y audio (torres no entrenadas en este checkpoint).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de RL para matematicas: el checkpoint sirve como referencia reproducible del efecto de GRPO con recompensa por voto mayoritario sobre un modelo base abierto, comparando el paso 200 con los checkpoints intermedios (50, 100, 150) y con el base.
- Investigacion en curriculos easy-to-hard: permite estudiar como cambia el rendimiento en eval_hard (10.765 problemas no resueltos por el base) al entrenar solo con la banda dificil frente a mezclas con problemas faciles.
- Generacion de soluciones matematicas con formato verificable: el uso de \boxed{} permite integrar el modelo en pipelines de evaluacion automatica de respuestas.
- Fine-tuning posterior sobre dominios cientificos: al conservar las torres de vision y audio del base, puede adaptarse a tareas que requieran interpretar diagramas o enunciados con imagenes.
- Reproduccion de experimentos con verl: la model card documenta hiperparametros (lr 1e-6, KL 0.001, 64x8 muestras, 2048 tokens) y la version de verl, lo que facilita replicar el entrenamiento.
- Base para comparativas de tecnicas de RL: util para contrastar GRPO con voto mayoritario frente a otras senales de recompensa (verificadores, reward models) en el mismo conjunto Polaris.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en eval_all (5.304 problemas) y eval_hard (10.765 problemas) cada 50 pasos, pero no se incluyen las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos (8.000 M de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto corto.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado; en consumer, RTX 4090 o RTX 3090 como minimo.
- Opciones de despliegue: la model card menciona vllm.LLM con revision="step-200" y AutoModelForImageTextToText de transformers; llama.cpp u Ollama requeririan conversion previa a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-full-hard_mv | 7.996 M | no disponible | GRPO sobre Polaris-Dataset-53K | apache-2.0 | Hugging Face (0 descargas) |
| google/gemma-4-E4B-it | no disponible | no disponible | Base multimodal de Google DeepMind | no disponible | Hugging Face |
| davidafrica/e2h-polaris-gemma-4-e4b-it-hard_mv | 8.000 M (aprox.) | no disponible | Variante "hard" del mismo experimento E2H | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint solo ha sido entrenado para matematicas con recompensa por voto mayoritario; puede degradar otras capacidades del modelo base (olvido catastrofico) al no incluir datos generales en el entrenamiento.
- La recompensa por voto mayoritario premia la consistencia interna del grupo, no la correccion verificada; puede reforzar respuestas erroneas si la mayoria de las 8 muestras converge en un error.
- Las torres de vision y audio no se entrenaron, por lo que su comportamiento es el del base y no se ha validado tras el ajuste.
- No se publican resultados de evaluacion en la model card, solo la metodologia; no es posible verificar la mejora sin ejecutar las evaluaciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar los terminos del modelo base google/gemma-4-E4B-it, ya que la licencia del derivado no puede ser mas permisiva que la del original.
- No se especifican idiomas soportados ni longitud de contexto; ambos deben validarse empiricamente antes de desplegar.
- El repositorio pesa 63,7 GB, lo que incluye multiples ramas de checkpoint; la descarga completa es costosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-full-hard_mv
- Variante "hard" del mismo autor: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-hard_mv
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
