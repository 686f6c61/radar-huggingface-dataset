# davidafrica/e2h-polaris-gemma-4-e4b-it-full-easy_rb

## Resumen

e2h-polaris-gemma-4-e4b-it-full-easy_rb es un checkpoint de ajuste fino derivado de google/gemma-4-E4B-it, el modelo multimodal de Google. Lo publica el usuario davidafrica en Hugging Face y forma parte de la familia de experimentos E2H (easy-to-hard) Polaris, centrados en mejorar el razonamiento matematico mediante aprendizaje por refuerzo. El modelo conserva la arquitectura y los componentes del modelo base; unicamente se ha entrenado el modelo de lenguaje, mientras que las torres de vision y audio permanecen intactas.

El entrenamiento se ha realizado con GRPO (Group Relative Policy Optimization) sobre el dataset Polaris-Dataset-53K, empleando verl 0.9.1 con FSDP2. La particularidad del experimento es la division de los problemas por dificultad segun la tasa de acierto del propio modelo base (16 muestras por problema): la banda "easy" agrupa problemas resueltos entre 10 y 15 veces de 16. Este checkpoint concreto corresponde al paso 200 de 200 del split completo de la banda facil (13.022 problemas), con recompensa basada en reglas (respuesta correcta frente a la de referencia).

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: cero descargas, cero likes y publicado en noviembre de 2026. Su interes radica en documentar una receta reproducible de RL para matematicas sobre un modelo multimodal de ~8.000 millones de parametros con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con torres de vision y audio del modelo base; solo se entrena el modelo de lenguaje |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un checkpoint multimodal completo. La innovacion arquitectonica documentada en la model card es que Gemma 4 comparte claves y valores (K/V) en sus ultimas 18 capas, de modo que sus propias k_proj, v_proj y k_norm nunca se utilizan; en este checkpoint se copian sin cambios desde el modelo base para que los nombres de los tensores coincidan. Los pesos se publican en bf16, fusionados a partir de los shards FSDP generados por verl.

El ajuste se realizo con GRPO mediante verl 0.9.1 (entrenador v0, FSDP2) sobre el split "easy" de Polaris-Dataset-53K: 13.022 problemas resueltos por el modelo base entre 10 y 15 veces de 16. El entrenamiento consistio en 200 pasos de 64 prompts por 8 muestras, con learning rate 1e-6, perdida KL de 0.001 (variante low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. La recompensa es puramente basada en reglas: se otorga si la respuesta coincide con la de referencia. Se evaluo cada 50 pasos sobre eval_all (5.304 problemas de todas las bandas de dificultad) y eval_hard (10.765 problemas que el modelo base no resolvio ninguna vez en 16 intentos). Cada paso guardado es una rama independiente accesible mediante el parametro revision (por ejemplo, step-200); la rama main contiene el paso final.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con respuestas de hasta 2048 tokens durante el entrenamiento.
- Razonamiento matematico reforzado mediante GRPO sobre problemas del dataset Polaris, con recompensa por exactitud de la respuesta final.
- Capacidades multimodales heredadas del modelo base: vision y audio a traves de las torres no entrenadas de gemma-4-E4B-it.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo thinking del modelo base es el unico indicio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Carga mediante AutoModelForImageTextToText y vLLM con seleccion de revision (step-50, step-100, step-150, step-200).

## Casos de uso

- Investigacion en RL para matematicas: punto de partida reproducible para estudiar el efecto de GRPO sobre un modelo base de ~8B, comparando los checkpoints intermedios (step-50 a step-200) y las variantes easy_rb, all_rb y full del mismo autor.
- Evaluacion de curriculum easy-to-hard: permite analizar si entrenar solo con problemas de dificultad media (10-15 aciertos de 16) mejora o degrada el rendimiento en problemas duros (eval_hard), gracias a las particiones de evaluacion documentadas.
- Generacion de soluciones matematicas paso a paso: el modo thinking con 2048 tokens permite cadenas de razonamiento largas, util para sintetizar datos de entrenamiento o para verificar razonamientos intermedios.
- Fine-tuning posterior: al publicarse en safetensors bf16 y con licencia Apache 2.0, sirve como inicializacion para nuevos ciclos de RL o SFT sobre dominios matematicos especificos.
- Experimentos multimodales con transferencia de lenguaje: al conservar las torres de vision y audio del base, permite estudiar como el ajuste puramente linguistico afecta a tareas de imagen o audio sin reentrenar esos modulos.
- Reproduccion de pipelines verl/FSDP2: el checkpoint documenta la configuracion exacta (lr, KL, tamano de batch, pasos), lo que facilita replicar el entrenamiento en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones sobre eval_all (5.304 problemas) y eval_hard (10.765 problemas) cada 50 pasos, pero no se proporcionan las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para los pesos (8B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas para inferencia comoda.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors bf16. En 4 bits los pesos ocuparian unos 4-5 GB, lo que permitiria ejecucion en GPUs consumer de 8-12 GB, aunque esto no esta verificado para este checkpoint.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- Despliegue: vLLM (soportado explicitamente con seleccion de revision) y transformers mediante AutoModelForImageTextToText. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-full-easy_rb | ~8B | No disponible | GRPO sobre Polaris (split easy) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (base) | ~8B | No disponible | Preentrenamiento + alineacion de Google | Gemma (no verificada en esta ficha) | Hugging Face, modelo oficial |
| davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb | ~8B | No disponible | GRPO sobre split easy (variante) | Apache 2.0 | Hugging Face |
| davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb | ~8B | No disponible | GRPO sobre todos los splits | Apache 2.0 | Hugging Face |

Las tres variantes del autor comparten base, receta y licencia; difieren en la particion de datos de entrenamiento (easy, all y full). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion externa.
- Riesgo de sobreajuste a la distribucion de Polaris: el entrenamiento se limita a 13.022 problemas de la banda easy, lo que puede degradar el rendimiento fuera de ese dominio o en problemas de mayor dificultad.
- La recompensa basada en reglas solo premia la respuesta final correcta; puede favorecer atajos y no garantiza la calidad del razonamiento intermedio.
- Las torres de vision y audio no se han entrenado: su comportamiento tras el ajuste linguistico no esta evaluado.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- La licencia Apache 2.0 se declara en la model card, pero el modelo base google/gemma-4-E4B-it tiene sus propios terminos de uso que conviene revisar antes de un uso comercial.
- El repositorio ocupa 63,7 GB, lo que implica un coste de almacenamiento y descarga considerable para un modelo de 8B.
- No se han publicado cifras de benchmarks, por lo que no es posible verificar la mejora frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-full-easy_rb
- Variante easy_rb: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb
- Variante all_rb: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- verl (framework de RL usado en el entrenamiento): no se proporciona enlace en la informacion disponible
- Dataset Polaris-Dataset-53K: no se proporciona enlace en la informacion disponible
