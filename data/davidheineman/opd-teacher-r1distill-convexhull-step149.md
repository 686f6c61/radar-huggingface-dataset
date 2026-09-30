# davidheineman/opd-teacher-R1Distill-ConvexHull-step149

# opd-teacher-R1Distill-ConvexHull-step149

## Resumen

opd-teacher-R1Distill-ConvexHull-step149 es un modelo de investigacion publicado por David Heineman (usuario `davidheineman` en Hugging Face) dentro de su coleccion RLVE OPD Teachers. No es un modelo de proposito general: es un "profesor" (teacher) entrenado especificamente para experimentos de destilacion on-policy (OPD, On-Policy Distillation) sobre un unico entorno sintetico denominado `ConvexHull`, orientado a problemas de geometria computacional (calculo de envolventes convexas).

El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only denso de la familia Qwen2, y se ha entrenado durante 150 pasos con GRPO sobre prompts de dificultad 0 del entorno `ConvexHull`, usando cuatro prompts por paso y 16 rollouts por paso, sin filtrado de prompts DAPO. Los pesos publicados corresponden al paso 149. El recuento real de parametros en safetensors es de 1.777.088.000 (aproximadamente 1,78 mil millones), con un repositorio de 3,6 GB.

Su relevancia es exclusivamente investigadora: forma parte de una linea de trabajo reciente sobre OPD (ver los articulos 2609.04172 y 2604.00626 en arXiv) que estudia como un profesor puede dar retroalimentacion sobre lo que el alumno genera realmente, en lugar de imitacion en un solo paso. El modelo no tiene descargas ni "me gusta", no declara licencia ni idiomas, y no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (base: DeepSeek-R1-Distill-Qwen-1.5B, derivado de Qwen2.5-1.5B) |
| Parametros totales | 1.777.088.000 (aprox. 1,78 B, segun safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5 emplea 32.768 tokens (dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni pesos pre-cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen2 con aproximadamente 1,78 B de parametros, heredado de `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B. No hay innovaciones arquitectonicas propias: el modelo no introduce atencion lineal, SSM ni capas hibridas. La innovacion esta en el procedimiento de entrenamiento.

El entrenamiento consistio en 150 pasos de GRPO (Group Relative Policy Optimization) sobre prompts de dificultad 0 del entorno `ConvexHull`, con cuatro prompts por paso y 16 rollouts por paso, y sin el filtrado de prompts de DAPO. Segun la model card, el objetivo es producir un profesor especializado por entorno para destilacion on-policy. El proyecto de entrenamiento declarado es `david-heineman/rl-data-opd-teachers-r1-distil` y el grupo de entrenamiento `opd-teachers-r1-nofilter16-20260929-231458`. Los pesos publicados son los del paso 149 (ultimo del ciclo). No se detalla la composicion del dataset, el numero total de tokens vistos ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento paso a paso heredados del destilado de DeepSeek-R1 (cadenas de razonamiento largas).
- Razonamiento geometrico y algoritmico especifico sobre el entorno `ConvexHull` (calculo de envolventes convexas), para el que fue entrenado explicitamente.
- Generacion de multiples rollouts por prompt, lo que permite obtener distribuciones de respuestas por consulta (util para destilacion y para estimacion de recompensas).
- Actuacion como profesor en pipelines de destilacion on-policy: puede puntuar o dar retroalimentacion sobre las salidas de un alumno.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica; el razonamiento multi-paso se limita al formato de cadena de pensamiento heredado del modelo base.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se declara modo "thinking" explicito, vision ni audio.

## Casos de uso

- Destilacion on-policy en entornos de RL: usar este checkpoint como profesor que evalua las trayectorias generadas por un alumno en el entorno `ConvexHull`, siguiendo el paradigma descrito en la literatura de OPD. Es su proposito declarado y para lo que se entrenaron los 150 pasos.
- Replicacion de experimentos RLVE: reproducir la configuracion "sin filtrado DAPO, 4 prompts, 16 rollouts" para comparar curvas de aprendizaje frente a otros profesores de la misma coleccion (por ejemplo, el profesor de `Cornfield`).
- Generacion de rollouts etiquetados en geometria computacional: producir multiples soluciones candidatas a problemas de envolvente convexa y filtrarlas por recompensa, generando datos de entrenamiento para modelos mayores o para verificadores.
- Estudio de destilacion con datos minimos: servir como profesor en experimentos de "one-shot OPD" (entrenamiento sobre una unica consulta) para medir la tasa de alineacion profesor-alumno a lo largo de cientos de pasos.
- Investigacion sobre especializacion por entorno: analizar como 150 pasos de GRPO sobre una tarea unica afectan a las capacidades generales del modelo base, midiendo la degradacion o la transferencia.
- Punto de partida para fine-tuning acotado: iniciar ajustes posteriores sobre tareas de geometria o algoritmica cuando se parte de un modelo que ya ha sido expuesto a este tipo de problemas.
- Evaluacion de infraestructuras de RL: usar el checkpoint para probar pipelines GRPO, calculo de recompensas y orquestacion de rollouts a pequena escala (1,78 B de parametros permite iterar rapido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,6 GB en FP16/BF16 (coincide con el tamano del repositorio); en torno a 1,8-2 GB en INT8; en torno a 1,0-1,2 GB en INT4 (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Con cuantizacion INT4 es viable en GPU de 6-8 GB.
- GPU profesionales (A100, H100, L40S): sobredimensionadas para un modelo de 1,78 B; solo tienen sentido para servir muchos lotes concurrentes o para fases de entrenamiento GRPO con 16 rollouts por paso y varios prompts.
- Opciones de despliegue: vLLM, TGI y SGLang soportan arquitectura Qwen2 directamente. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible. Un modelo de 1,78 B en una GPU de consumo moderna suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.
- Nota de entrenamiento: reproducir el entrenamiento GRPO requiere memoria muy superior a la inferencia, ya que hay que mantener pesos, gradientes y estados del optimizador, ademas de gestionar 16 rollouts por prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Proposito |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-ConvexHull-step149 | 1,78 B | no disponible (base: 32.768) | no disponible | Hugging Face, 0 descargas | Profesor OPD especializado en `ConvexHull` |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens | no disponible en la informacion proporcionada (verificar en el repositorio del modelo base) | Hugging Face, ampliamente distribuido | Modelo de razonamiento general destilado de R1 |
| Qwen2.5-1.5B-Instruct | aprox. 1,54 B | 32.768 tokens | no disponible en la informacion proporcionada | Hugging Face | Modelo instructivo de proposito general |
| opd-teacher-Q2.5I-Cornfield-step149 | aprox. 1,5 B | 32.768 tokens (segun ficha de Featherless) | no disponible | Hugging Face y Featherless | Profesor OPD especializado en `Cornfield` |

La diferencia principal frente a los tres alternativas es el alcance: los modelos base y el instructivo son de proposito general, mientras que este checkpoint esta entrenado con GRPO sobre un unico entorno y dificultad, y esta pensado para actuar como profesor en pipelines de destilacion, no como asistente desplegable. No hay datos de rendimiento publicados para ninguno de los cuatro en esta comparativa.

## Limitaciones y advertencias

- Es un artefacto de investigacion acotado: 150 pasos de GRPO sobre prompts de dificultad 0 de un unico entorno (`ConvexHull`). Fuera de ese dominio, su comportamiento no esta caracterizado.
- El entrenamiento estrecho con RL puede degradar capacidades generales del modelo base (conversacion, conocimiento factual, multilingue). No se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad ni de tasas de error publicadas. Al derivar de un destilado de DeepSeek-R1, mantiene la tendencia de la familia a producir cadenas de razonamiento plausibles pero no necesariamente correctas.
- Licencia no declarada: no se especifica licencia en el repositorio. Al derivar de `DeepSeek-R1-Distill-Qwen-1.5B`, hay que verificar las condiciones del modelo base antes de cualquier uso, y en particular antes de un uso comercial.
- Idiomas no declarados: se desconoce si el ajuste con GRPO ha preservado el soporte multilingue del modelo base.
- Contexto no confirmado: la model card no indica la longitud de contexto efectiva de este checkpoint. La cifra de 32.768 tokens proviene de la arquitectura Qwen2 subyacente, no de una verificacion del autor.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ ni AWQ en el repositorio, lo que obliga a convertirlos manualmente si se quiere desplegar en llama.cpp u Ollama.
- Senales de adopcion nulas: 0 descargas y 0 "me gusta" en el momento de la consulta, y sin pipeline declarado. No hay evidencia de uso externo ni de validacion por terceros.
- No usar como asistente de produccion: el modelo no ha pasado ninguna fase de alineacion orientada a seguridad, moderacion ni seguimiento de instrucciones generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-R1Distill-ConvexHull-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor en Hugging Face: https://huggingface.co/davidheineman
- Actividad del autor: https://huggingface.co/davidheineman/activity/all
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo hermano (entorno `Cornfield`): https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
- Ficha del modelo hermano en Featherless: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
- Articulo "Rethinking On-Policy Distillation of Large Language Models II": https://arxiv.org/pdf/2609.04172v1
- Articulo "A Survey of On-Policy Distillation for Large Language Models": https://arxiv.org/html/2604.00626v3
- Entorno RLVE (referencia citada en la coleccion): https://arxiv.org/abs/2511.07317
