# siruku6/pi05_combined_ae7k

## Resumen

pi05_combined_ae7k es un checkpoint de politica vision-language-action (VLA) derivado de pi0.5, publicado por el usuario siruku6 en Hugging Face bajo la libreria LeRobot. Parte de siruku6/pi05_combined_initpose_full (checkpoint 005500), que a su vez fue ajustado desde lerobot/pi05_libero_base, y continua un entrenamiento de solo el modulo action expert sobre el dataset local/libero_combined_bowl5_initpose (111 tareas, 21.642 episodios). El repositorio contiene dos checkpoints, 004000 y 007000, y ocupa 18,7 GB.

El modelo resuelve el problema clasico de las politicas de imitacion en robotica: mapear observaciones visuales e instrucciones en lenguaje natural a secuencias de acciones de manipulacion. Su relevancia no esta en el rendimiento, sino en la transparencia: el autor lo publica como parte de una comparativa entre cuatro candidatos de Track2 y reconoce explicitamente que esta rama de entrenamiento quedo por debajo del candidato entrenado directamente sobre libero_plus_bowl5 (0,705 frente a 0,798 de tasa de exito en el conjunto de validacion de Track2). Es, por tanto, un artefacto de reproducibilidad mas que un modelo de produccion.

Tecnicamente es un modelo de 4,14B parametros totales del que solo se entrenaron 693M (el action expert), con el codificador visual y el VLM congelados. La licencia es Gemma, ya que es un derivado de Gemma a traves de PaliGemma dentro de pi0.5. No se han publicado datos de rendimiento especificos para estos dos checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5, derivada de PaliGemma (Gemma) con modulo action expert |
| Parametros totales | 4,14B |
| Parametros activos | No aplica (no es un modelo MoE); 693M parametros entrenables en este ajuste (action expert) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (checkpoints 004000 y 007000) |
| Tamano del repositorio | 18,7 GB |
| Libreria / pipeline | lerobot / robotics |
| Modelo base | siruku6/pi05_combined_initpose_full (checkpoint 005500) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

pi0.5 es una politica VLA que combina un backbone vision-language (PaliGemma, con vision encoder SigLIP y un modelo Gemma) con un modulo especifico de generacion de acciones, el action expert. En este checkpoint el entrenamiento se limita a ese action expert: de los 4,14B parametros totales solo 693M reciben actualizaciones de gradiente, mientras que el vision encoder y el VLM permanecen congelados. La model card indica explicitamente que `model.safetensors` de cada checkpoint esta modificado respecto al modelo base por actualizaciones de gradiente, y que ningun otro fichero heredado del base ha sido modificado.

El regimen de entrenamiento fue de 7.000 pasos adicionales sobre el checkpoint 005500, con batch size 64, optimizador AdamW (lr 5e-6, weight decay 0,01, betas 0,9/0,95, recorte de gradiente con norma 1,0) y aumento de imagen desactivado. La configuracion de acciones usa `chunk_size=50` y `n_action_steps=10`, es decir, se predicen bloques de 50 acciones y se re-ejecuta la planificacion cada 10 pasos. Los datos proceden del dataset `local/libero_combined_bowl5_initpose`, con 111 tareas y 21.642 episodios, y en ultima instancia derivan de LIBERO y LIBERO-plus.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de observaciones visuales y una instruccion en lenguaje natural.
- Imitacion de politicas entrenadas sobre demostraciones (imitation learning) en el entorno de simulacion LIBERO.
- Condicionamiento por tarea: el modelo ha visto 111 tareas distintas del dataset combinado con variaciones de pose inicial.
- Ejecucion de acciones en bloques (`chunk_size=50`, `n_action_steps=10`), orientada a control continuo de un brazo manipulador.
- Ajuste continuado de solo el action expert, lo que permite reentrenamientos mas economicos sobre el mismo backbone congelado.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje conversacional).
- Capacidades de agente y razonamiento multi-paso en texto: no disponibles.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas de instruccion.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Investigacion en manipulacion robotica en simulacion: ejecutar la politica dentro de LIBERO para comparar tasas de exito entre variantes de entrenamiento, exactamente el escenario para el que se publico.
- Reproducibilidad de experimentos de ajuste fino: permite reconstruir la rama de entrenamiento de solo action expert a partir del checkpoint 005500 del modelo base y verificar los resultados reportados.
- Punto de partida para nuevos ajustes: al mantener congelados el vision encoder y el VLM, sirve como base economica para reentrenar el action expert con dominios o tareas adicionales.
- Estudio del efecto de la pose inicial: el dataset incluye variaciones de pose inicial (`initpose`), por lo que el modelo es util para medir robustez ante condiciones iniciales distintas.
- Generacion de rollouts para analisis de fallos: produce trayectorias completas que se pueden inspeccionar para diagnosticar en que tareas falla la politica.
- Comparacion de pipelines de entrenamiento en LeRobot: sirve como referencia de configuracion (optimizador, batch, chunk de acciones) para validar infraestructura de entrenamiento distribuido.
- Pruebas de integracion con el ecosistema openpi: al ser un checkpoint compatible con la implementacion de referencia de pi0.5, permite validar cargas de pesos y reproducir inferencia.
- Transferencia sim-to-real exploratoria: con mucha cautela y validacion previa, puede emplearse como politica candidata en un banco de pruebas fisico, dado que solo se ha entrenado en simulacion.

## Benchmarks y rendimiento

Los unicos datos numericos publicados corresponden a la comparativa de Track2 en la que se enmarca el checkpoint. La model card no desglosa el resultado de los checkpoints 004000 y 007000 de este repositorio, solo indica que la rama a la que pertenecen quedo por debajo del candidato alternativo.

| Candidato | Base de entrenamiento | Tasa de exito (validacion Track2) |
|---|---|---|
| C (`pi05_combined_initpose_full`) y sus continuaciones, incluido este checkpoint | `libero_combined_bowl5_initpose` | 0,705 |
| `bowl5_full` | `libero_plus_bowl5` | 0,798 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; estos benchmarks no son aplicables a un modelo de politica robotica.

## Requisitos de hardware

- VRAM estimada solo para pesos: en bf16/fp16, unos 8,3 GB (4,14B parametros x 2 bytes); en fp32, unos 16,6 GB. Son calculos a partir del recuento de parametros, no datos publicados por el autor.
- El repositorio completo ocupa 18,7 GB porque incluye dos checkpoints.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G/L4 de 24 GB para entrenamiento o inferencia con margen.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16, y probablemente en 16 GB con margen ajustado. En 12 GB requeriria tecnicas de reduccion de memoria no documentadas.
- Opciones de despliegue: LeRobot (libreria declarada) y la implementacion de referencia openpi de Physical Intelligence. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de politica; no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. Estructuralmente, la inferencia se organiza en chunks de 50 acciones con re-planificacion cada 10 pasos de accion.

## Comparativa con modelos similares

| Modelo | Parametros | Origen de entrenamiento | Tasa de exito (Track2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siruku6/pi05_combined_ae7k (este) | 4,14B (693M entrenables) | `libero_combined_bowl5_initpose` | Rama C: 0,705 (no desglosado por checkpoint) | Gemma | Publico en Hugging Face |
| siruku6/pi05_combined_initpose_full | 4,14B | `libero_combined_bowl5_initpose` | 0,705 | Gemma | Publico en Hugging Face |
| Candidato `bowl5_full` | No disponible | `libero_plus_bowl5` | 0,798 | No disponible | No disponible |
| lerobot/pi05_libero_base | No disponible | LIBERO (entrenamiento completo de todos los parametros) | No disponible | No disponible | Publico en Hugging Face (revision a217bfd3b14673cf2ce597e69997ab21866438dd) |

## Limitaciones y advertencias

- Rendimiento inferior al candidato alternativo de la misma comparativa: 0,705 frente a 0,798 de tasa de exito en validacion de Track2. El autor indica explicitamente que se publica por transparencia y reproducibilidad, no como candidato seleccionado.
- No hay metricas desglosadas para los checkpoints 004000 y 007000 de este repositorio.
- Entrenamiento exclusivamente en simulacion (LIBERO y LIBERO-plus). Existe brecha sim-to-real no cuantificada.
- Sesgos: no documentados, pero hereda los del backbone PaliGemma/Gemma y los del dataset de demostraciones.
- Riesgo de alucinacion: en un modelo de politica se manifiesta como acciones plausibles pero incorrectas ante tareas o configuraciones fuera de distribucion; no hay evaluacion de robustez publicada.
- Limitaciones de contexto e idioma: no se documentan ni la longitud de contexto ni los idiomas soportados.
- Licencia restrictiva: es un Model Derivative de Gemma, distribuido bajo los Gemma Terms of Use. Cualquier uso o redistribucion obliga a propagar dichos terminos y a respetar la Gemma Prohibited Use Policy tambien para derivados.
- El uso comercial esta sujeto a las condiciones de Google para Gemma; no se debe asumir una licencia permisiva tipo Apache o MIT.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente.
- El modelo se distribuye tal cual, sin garantia de ningun tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siruku6/pi05_combined_ae7k
- Modelo base: https://huggingface.co/siruku6/pi05_combined_initpose_full
- Modelo base original: https://huggingface.co/lerobot/pi05_libero_base (revision a217bfd3b14673cf2ce597e69997ab21866438dd)
- Dataset de entrenamiento: https://huggingface.co/datasets/siruku6/libero_combined_bowl5_initpose
- Implementacion de referencia de pi0.5 (openpi, Apache 2.0): https://github.com/Physical-Intelligence/openpi
- LIBERO (MIT): https://github.com/Lifelong-Robot-Learning/LIBERO
- LIBERO-plus (MIT): https://huggingface.co/datasets/Sylvest/LIBERO-plus
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos tratan sobre espejos de Wikipedia y no guardan relacion con este modelo.
