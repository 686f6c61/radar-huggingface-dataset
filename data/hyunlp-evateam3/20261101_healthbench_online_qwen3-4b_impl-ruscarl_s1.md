# hyunlp-evateam3/20261101_healthbench_online_qwen3-4b_impl-ruscarl_s1

## Resumen

Este repositorio contiene checkpoints de política intermedios de un proceso de ajuste por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, realizado por el equipo hyunlp-evateam3 en el marco de un experimento denominado Online Rubrics aplicado al conjunto de datos HealthBench. No se trata de un modelo final pulido, sino de un artefacto de investigación: cada paso de entrenamiento completado se publica en su propio subdirectorio bajo `checkpoints/global_step_NNNNNN/`, y el entrenamiento seguía en curso en el momento de la última actualización del repositorio.

El objetivo del experimento es mejorar el comportamiento del modelo en tareas de salud mediante un esquema de rúbricas generadas dinámicamente: un generador de rúbricas basado en `openai/gpt-oss-120b` produce criterios de evaluación por pregunta, y un juez Qwen3-32B (servido con cuatro réplicas) puntúa las respuestas de la política durante el entrenamiento. La política parte de Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parámetros con contexto largo, y se entrena con 4.500 preguntas de entrenamiento y 500 de validación.

Su relevancia es doble: por un lado, documenta de forma abierta una receta de RL con rúbricas online sobre datos clínicos; por otro, el tamaño del repositorio (506,8 GB) refleja que almacena múltiples checkpoints completos en precisión alta, lo que lo hace poco práctico para despliegue directo y más adecuado para análisis de dinámica de entrenamiento o reproducción del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; los checkpoints se publican presumiblemente en safetensors de precision original |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers), con tokenizer y configuracion por checkpoint |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parametros. Sobre esa politica se aplica un proceso de aprendizaje por refuerzo con rúbricas online: para cada pregunta de HealthBench se generan rúbricas mediante `openai/gpt-oss-120b`, y un juez Qwen3-32B desplegado en cuatro replicas evalúa las respuestas de la politica. Las respuestas iniciales de la politica estan congeladas (ocho por pregunta de entrenamiento), lo que sugiere un esquema de optimizacion tipo offline/online hibrido donde se reutilizan rollouts fijos como referencia.

El conjunto de datos es HealthBench, con 4.500 preguntas de entrenamiento y 500 reservadas para evaluacion. El entrenamiento planificado es de 280 pasos repartidos en dos epocas, con lotes de 32 preguntas y ocho respuestas por pregunta, semilla 42. El repositorio publica un checkpoint por cada paso completado, lo que permite trazar la evolucion de la politica paso a paso. No se especifican en la informacion disponible detalles sobre la funcion de recompensa exacta, la variante de RL (PPO, GRPO u otra) ni hiperparametros como tasa de aprendizaje o coeficiente de KL.

## Capacidades

- Generacion de texto en el dominio de salud y conversacion general, heredada del modelo base Qwen3-4B-Instruct-2507.
- Respuesta a preguntas clinicas evaluadas mediante rubricas, con enfasis en la calidad y cobertura de criterios clinicos.
- Razonamiento multi-turno y seguimiento de instrucciones, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para estos checkpoints concretos.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL con rubricas: utilizar los checkpoints para estudiar como evoluciona la politica paso a paso y analizar la dinamica de recompensa en tareas de salud con criterios generados dinamicamente.
- Reproduccion de pipelines de evaluacion clinica: el esquema generador de rubricas + juez puede reutilizarse para construir evaluadores automaticos de respuestas medicas en entornos de investigacion.
- Analisis de calidad de respuestas sanitarias: comparar las respuestas de distintos checkpoints frente a las del modelo base para medir el efecto del RL en cobertura de criterios clinicos.
- Generacion de respuestas a preguntas de salud en prototipos internos: con las debidas advertencias, el modelo puede servir como base para asistentes de informacion sanitaria no diagnostica en entornos controlados.
- Estudio de sesgos y alucinaciones en dominio medico: al disponer de multiples checkpoints, es posible trazar si el entrenamiento incrementa o reduce la tendencia a inventar informacion clinica.
- Benchmarking de jueces automaticos: usar el juez Qwen3-32B y las rubricas del experimento como referencia para evaluar otros modelos de dominio sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8 GB en FP16 para un checkpoint de 4 mil millones de parametros; en cuantizacion de 8 bits, aproximadamente 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones generales para modelos de este tamano, no verificadas para estos checkpoints).
- GPU recomendadas: A100, H100 o L40S para inferencia en precision completa y lotes grandes; RTX 4090 o RTX 3090 suficientes para un solo checkpoint en FP16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en FP16, y en tarjetas de 6 GB con cuantizacion.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `subfolder` apuntando al checkpoint; vLLM, TGI o llama.cpp no estan confirmados para estos checkpoints, aunque deberian funcionar si se convierten los pesos a los formatos correspondientes.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 506,8 GB, por lo que conviene descargar solo el subdirectorio del checkpoint de interes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (HealthBench Online Rubrics Qwen3-4B) | 4 mil millones | No disponible | RL con rubricas sobre HealthBench | No disponible | Publico en HuggingFace, checkpoints intermedios |
| Qwen/Qwen3-4B-Instruct-2507 | 4 mil millones | No disponible | Modelo instructivo general | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Modelos medicos especializados de tamano similar | No disponible | No disponible | Ajuste supervisado en datos clinicos | No disponible | No disponible |

La comparacion cuantitativa con alternativas no puede realizarse porque no se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Se trata de checkpoints intermedios de un entrenamiento en curso, no de un modelo final; su calidad puede ser inestable y no esta validada.
- No es un dispositivo medico ni un sistema de diagnostico: cualquier uso en contexto clinico requiere supervision profesional y validacion regulatoria.
- Riesgo elevado de alucinacion en contenido sanitario, especialmente en checkpoints tempranos.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del conjunto HealthBench.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor y verificar la licencia del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados; el entrenamiento se realiza sobre HealthBench, mayoritariamente en ingles, lo que puede degradar el rendimiento en castellano.
- El repositorio ocupa 506,8 GB; descargar el repo completo es costoso y debe hacerse por subcarpetas.
- El pipeline depende de un juez Qwen3-32B y de un generador de rubricas `openai/gpt-oss-120b`, lo que introduce dependencias externas y posibles sesgos del juez en la senal de recompensa.
- No hay garantias de que el proceso de RL mejore la veracidad clinica; puede optimizar hacia la cobertura de rubricas sin mejorar la correccion factual.

## Enlaces

- HuggingFace: https://huggingface.co/hyunlp-evateam3/20261101_healthbench_online_qwen3-4b_impl-ruscarl_s1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Generador de rubricas: https://huggingface.co/openai/gpt-oss-120b
- HealthBench: no disponible en la informacion proporcionada
- Paper o blog del experimento: no disponible en la informacion proporcionada
