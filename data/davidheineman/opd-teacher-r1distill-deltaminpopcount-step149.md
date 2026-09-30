# davidheineman/opd-teacher-R1Distill-DeltaMinPopcount-step149

## Resumen

El modelo `davidheineman/opd-teacher-R1Distill-DeltaMinPopcount-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` desarrollado por David Heineman como parte de un proyecto de destilación en política (*on-policy distillation*, OPD) sobre entornos de razonamiento. Se trata de un modelo "teacher" (profesor) entrenado especificamente para un unico entorno denominado `DeltaMinPopcount`, con el objetivo de generar trayectorias de razonamiento de alta calidad que sirvan como senal de supervision para destilar conocimiento hacia otros modelos.

El entrenamiento se realizo durante 150 pasos (los pesos publicados corresponden al paso 149) utilizando el algoritmo GRPO sobre prompts de dificultad 0 del entorno mencionado, con cuatro prompts y 16 rollouts por paso. Segun la model card, no se aplico filtrado de prompts DAPO durante el entrenamiento. El modelo forma parte de la coleccion "RLVE OPD Teachers", que agrupa modelos especializados en entornos individuales derivados del trabajo descrito en el articulo arXiv 2511.07317.

Con 1.777.088.000 parametros, se trata de un modelo de aproximadamente 1,78 mil millones de parametros con arquitectura Qwen2 (heredada del modelo base), lo que lo situa en el rango de modelos pequenos desplegables en hardware de consumo. Su relevancia radica en su uso como componente de un pipeline de destilacion en politica, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 |
| Parametros totales | 1.777.088.000 (~1,78 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez se basa en la familia Qwen2. Se trata de un transformer decoder-only de aproximadamente 1,78 mil millones de parametros, sin componentes de mezcla de expertos (MoE), por lo que todos los parametros estan activos en cada paso de inferencia.

El entrenamiento se realizo mediante GRPO (Group Relative Policy Optimization) sobre el entorno `DeltaMinPopcount` con prompts de dificultad 0, durante 150 pasos, con cuatro prompts y 16 rollouts por cada paso. La model card indica explicitamente que no se utilizo filtrado de prompts DAPO. El proposito del ajuste es producir un modelo profesor especializado en ese entorno concreto, cuyos pesos finales (paso 149) se emplean para destilacion en politica (*on-policy distillation*) a nivel de token, una tecnica descrita en el repositorio `naver-ai/opd2` y en el articulo arXiv 2604.13016. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset mas alla del entorno citado, ni sobre el uso de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- Razonamiento especializado en el entorno `DeltaMinPopcount` (tarea de tipo algoritmico/computacional, segun la denominacion del entorno), para el que fue especificamente entrenado como profesor.
- Generacion de trayectorias de razonamiento utilizables como senal de supervision en destilacion en politica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: orientado a razonamiento multi-paso dentro del entorno de entrenamiento, no se documenta soporte de agentes general.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Destilacion en politica para entornos especificos: el modelo actua como profesor generando distribuciones de tokens que se usan para supervisar a un modelo estudiante en la tarea `DeltaMinPopcount`, aprovechando su especializacion tras 150 pasos de GRPO.
- Investigacion sobre dinamicas de destilacion en politica: sirve como componente reproducible en experimentos que estudian las condiciones de exito y fracaso de OPD (compatibilidad de patrones de pensamiento entre estudiante y profesor).
- Generacion de datos sinteticos de razonamiento: puede emplearse para producir trayectorias etiquetadas en el entorno `DeltaMinPopcount` que alimenten posteriores fases de ajuste.
- Evaluacion de tecnicas de RL: al haber sido entrenado con GRPO sin filtrado DAPO, permite comparar el efecto del filtrado de prompts frente a configuraciones sin filtro.
- Reproduccion de experimentos de la coleccion RLVE OPD Teachers: forma parte de un conjunto de modelos especializados por entorno, util para replicar resultados del articulo de referencia.
- Analisis de especializacion por entorno: permite estudiar como un modelo pequeno de 1,78B se especializa en una unica tarea tras un numero reducido de pasos (150).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 1,78 mil millones de parametros): en FP16 aproximadamente 3,6 GB de pesos; en INT8 aproximadamente 1,8 GB; en INT4 aproximadamente 1,0 GB. Estas cifras son estimaciones de peso de parametros y no incluyen el coste de la cache KV.
- GPU recomendadas: el modelo cabe en GPUs de consumo. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) lo ejecutan con holgura en FP16. GPUs con 8-12 GB (por ejemplo RTX 3070, RTX 4060) pueden ejecutarlo cuantizado en INT8 o INT4.
- Cabe en consumer GPU: si, en la mayoria de GPUs de consumo modernas, especialmente con cuantizacion.
- Opciones de despliegue: no se especifican en la informacion disponible; por arquitectura Qwen2 y formato safetensors, son tecnicamente aplicables frameworks como vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF, aunque esto no se documenta en la ficha del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidheineman/opd-teacher-R1Distill-DeltaMinPopcount-step149 | 1,78B | no disponible | no disponible | no disponible | HuggingFace |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | 1,78B | no disponible en la informacion | no disponible | no disponible | HuggingFace |
| davidheineman/opd-teacher-Q2.5I-DeltaMinPopcount-step149 | ~1,5B | no disponible | no disponible | no disponible | HuggingFace / Featherless |

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado unicamente sobre el entorno `DeltaMinPopcount` con prompts de dificultad 0, por lo que su rendimiento fuera de ese dominio no esta caracterizado.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible; al ser un modelo de razonamiento pequeno (1,78B), es previsible cierta propension a errores, pero no se documenta especificamente.
- Limitaciones de contexto o idioma: no se documenta la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si se permite el uso comercial. Se debe consultar el repositorio antes de cualquier uso en produccion.
- Caveat de proposito: el modelo esta disenado como "teacher" para destilacion en politica, no como asistente de proposito general; su uso directo en produccion orientada al usuario no esta respaldado por la documentacion.
- Estado de publicacion: el repositorio registra 0 descargas y 0 "likes", y fue creado y actualizado el 30 de septiembre de 2026, lo que sugiere que no ha sido validado por terceros.
- Sin resultados de benchmarks publicados: no es posible comparar su rendimiento objetivamente con alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-DeltaMinPopcount-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Pagina en Featherless (modelo relacionado Q2.5I): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-DeltaMinPopcount-step149
- Repositorio OPD2 (naver-ai): https://github.com/naver-ai/opd2
- Paper sobre dinamicas de OPD: https://arxiv.org/abs/2604.13016
- Paper de referencia del entorno RLVE: https://arxiv.org/abs/2511.07317
