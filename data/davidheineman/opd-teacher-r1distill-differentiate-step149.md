# davidheineman/opd-teacher-R1Distill-Differentiate-step149

## Resumen

El modelo `opd-teacher-R1Distill-Differentiate-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` publicado por el usuario davidheineman en HuggingFace. Se trata de un "teacher" (modelo profesor) entrenado especificamente para tareas de derivacion matematica, dentro de un flujo de destilacion on-policy (OPD, On-Policy Distillation). El modelo forma parte de la coleccion RLVE OPD Teachers, un conjunto de profesores especializados por entorno que se usan para transferir capacidad de razonamiento a modelos estudiantes mas pequenos.

El entrenamiento se realizo con RL (concretamente GRPO) durante 150 pasos sobre prompts de dificultad 0 del entorno `Differentiate`, con cuatro prompts y 16 rollouts por paso, y sin el filtrado de prompts de DAPO. Los pesos publicados corresponden al paso 149. La arquitectura subyacente es la del modelo base, un transformer decoder-only de la familia Qwen2 con aproximadamente 1,78 mil millones de parametros.

Su relevancia es fundamentalmente metodologica: no es un modelo de proposito general, sino una pieza de infraestructura de investigacion para experimentos de destilacion. El repositorio tiene 0 descargas y 0 likes, y no se ha publicado model card con detalles de licencia, idiomas o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2` del repositorio) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base suele emplear 131.072 tokens; dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; se pueden derivar cuantizaciones a FP16/BF16, INT8 e INT4 con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es MIT; la licencia de este ajuste no se especifica) |
| Formato de pesos | safetensors |

Metadatos adicionales: tamano del repositorio 3,6 GB; pipeline no disponible; creado el 2026-09-30; actualizado el 2026-09-30; grupo de entrenamiento `opd-teachers-r1-nofilter16-20260929-231458`; proyecto de entrenamiento `david-heineman/rl-data-opd-teachers-r1-distil`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only autorregresivo de la familia Qwen2 con 1,78 B de parametros. Ese modelo base es a su vez un destilado del modelo de razonamiento DeepSeek-R1 sobre un backbone Qwen, por lo que ya incorpora trazas de razonamiento (cadena de pensamiento) en su comportamiento. El ajuste aqui no modifica la arquitectura: solo actualiza los pesos mediante aprendizaje por refuerzo.

El entrenamiento consistio en 150 pasos de GRPO (Group Relative Policy Optimization) sobre el entorno `Differentiate` a dificultad 0, con cuatro prompts por paso y 16 rollouts por paso, sin filtrado de prompts tipo DAPO. El modelo se etiqueta con `rlve`, `grpo` y `opd-teacher`. Su funcion es servir como profesor en un esquema de destilacion on-policy: un estudiante se inicializa desde el mismo modelo base y se le da supervision a nivel de token a partir de las distribuciones del profesor, segun la linea de trabajo de destilacion on-policy y la senal "delta" descritas en la literatura enlazada (OPD2, naver-ai). El resultado es un profesor especializado en un unico entorno de derivacion, no un modelo generalista.

No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset mas alla de los prompts de `Differentiate`, ni si se aplicaron fases adicionales de SFT/RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento de tipo cadena de pensamiento, heredado del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- Resolucion de problemas de derivacion matematica (entorno `Differentiate`), que es el unico dominio sobre el que se ha entrenado especificamente.
- Formato de salida adecuado para destilacion on-policy: sirve como fuente de distribuciones a nivel de token para entrenar un modelo estudiante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; se limita al entorno de entrenamiento.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles. El comportamiento de razonamiento proviene del destilado base, no de una modificacion arquitectonica.

## Casos de uso

- Destilacion on-policy de un modelo estudiante: el uso principal y previsto es actuar como profesor que proporciona supervision token a token a un estudiante inicializado desde el mismo modelo base, con el objetivo de transferir comportamiento de razonamiento especializado.
- Investigacion en aprendizaje por refuerzo: sirve como punto de referencia reproducible de GRPO sobre un entorno unico (150 pasos, 4 prompts y 16 rollouts por paso), util para estudiar la dinamica de entrenamiento por pasos.
- Estudio de transferencia de razonamiento: permite analizar hasta que punto un profesor entrenado solo en `Differentiate` transfiere capacidad de derivacion frente a un profesor generalista.
- Generacion de soluciones de derivacion como linea base: se puede usar para producir derivadas simbolicas paso a paso y comparar con otros profesores de la misma coleccion (variante Q2.5I).
- Experimentos de destilacion multi-profesor: al existir varios profesores por entorno en la coleccion RLVE, este modelo puede combinarse como uno de los senales de un esquema multi-teacher.
- Evaluacion de tecnicas de RL y destilacion: util como componente controlado en estudios comparativos entre SFT y RL como fuentes de supervision (linea del trabajo Train4Merge).
- Reproducibilidad de pipelines de RL: dado que expone el paso exacto (step 149) y la configuracion del grupo de entrenamiento, permite reproducir o continuar el entrenamiento desde ese punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en BF16/FP16 (los pesos ocupan ~3,56 GB), en torno a 1,8 GB en INT8 y alrededor de 1 GB en INT4.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; una RTX 3060 (12 GB), RTX 4070, RTX 4090 o superiores son mas que suficientes. Para lotes grandes o contexto largo, A100/H100 aportan margen.
- Cabe en GPU de consumo: si, con holgura. Modelo de 1,78 B apto para practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI, Ollama y llama.cpp (previo paso a GGUF, ya que el repositorio solo contiene safetensors). Tambien puede cargarse como modelo profesor en pipelines de destilacion personalizados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-Differentiate-step149 (este) | 1,78 B | no disponible | Derivacion (entorno `Differentiate`, dificultad 0) | no disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | no disponible en esta ficha | Razonamiento general | MIT (modelo base) | HuggingFace |
| davidheineman/opd-teacher-Q2.5I-Differentiate-step149 | ~1,5 B (Qwen 2.5 1.5B Instruct) | no disponible | Derivacion (mismo entorno, base instruct) | no disponible | HuggingFace / Featherless |

La comparacion con otros profesores de la coleccion RLVE (por ejemplo los entrenados sobre 32 de los 400 entornos) y con alternativas del mismo tamano dentro de la familia Qwen no puede completarse con rendimiento numerico porque no se han publicado benchmarks.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se ha entrenado unicamente sobre el entorno `Differentiate` a dificultad 0; su utilidad fuera de ese dominio es limitada y no se puede asumir comportamiento generalista.
- No hay model card detallada: faltan datos sobre licencia, idiomas, composicion del dataset y regimen de entrenamiento completo, lo que dificulta evaluar su idoneidad en produccion.
- Licencia de uso comercial indeterminada: aunque el modelo base es MIT, este ajuste no declara licencia, por lo que el uso comercial no esta garantizado.
- Riesgo de alucinacion: no evaluado; se hereda el riesgo tipico de los modelos de razonamiento destilados, que pueden generar pasos de derivacion plausibles pero incorrectos.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgos.
- Repositorio practicamente sin uso: 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- Orientado a investigacion: concebido como componente de un pipeline de destilacion, no como endpoint de inferencia para usuarios finales.
- Pesos solo en safetensors: para desplegarlo en llama.cpp u Ollama hay que convertir previamente a GGUF.
- Sin confirmacion de contexto: la longitud de contexto efectiva no se declara; no se debe asumir la del modelo base sin verificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-R1Distill-Differentiate-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor: https://huggingface.co/davidheineman
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo hermano (base Qwen 2.5 1.5B Instruct): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Paper de entornos RLVE: https://arxiv.org/abs/2511.07317
- On-Policy Delta distillation (OPD2, naver-ai): https://github.com/naver-ai/opd2
- Train4Merge, estudio de RL frente a SFT como profesores: https://arxiv.org/abs/2609.32303
