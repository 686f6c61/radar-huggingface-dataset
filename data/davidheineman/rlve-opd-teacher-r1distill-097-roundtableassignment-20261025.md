# davidheineman/rlve-opd-teacher-R1Distill-097-RoundTableAssignment-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-097-RoundTableAssignment-20261025` es un ajuste fino completo de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` publicado por el investigador David Heineman. No es un modelo de propósito general: es un *teacher* (modelo profesor) extraído del experimento de escalado de datos RLVE, entrenado con GRPO como especialista sobre un único entorno de entrenamiento. Su función dentro del proyecto es generar trazas de razonamiento de alta calidad que sirvan como referencia para destilar o evaluar modelos menores, no atender usuarios finales.

El checkpoint contiene 1.777.088.000 parámetros en formato safetensors (3,6 GB en el repositorio), lo que corresponde a pesos en bf16/fp16. La arquitectura es la del modelo base, un transformer decoder-only de la familia Qwen2, por lo que hereda el tokenizador y la configuración de DeepSeek-R1-Distill-Qwen-1.5B, incluyendo su estilo de razonamiento encadenado con etiquetas de pensamiento.

Su relevancia es metodológica más que de producto: documenta de forma reproducible (con enlace a W&B, `training_run.json` y `training_config.yaml`) cómo se entrena un profesor con un presupuesto fijo de 4.000 rollouts y un criterio de parada por pass@1. La licencia y los idiomas no están declarados, y el modelo acumula cero descargas, lo que lo sitúa como artefacto de investigación y no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara 32.768 tokens; sin confirmar para este checkpoint) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; al ser arquitectura Qwen2 es convertible a GGUF/AWQ/GPTQ con herramientas externas (no verificado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 3,6 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de Qwen2 con 1,78 B de parámetros, sin mecanismos MoE ni híbridos SSM. El modelo base fue destilado por DeepSeek a partir de R1 y conserva el formato de razonamiento explícito (` thinking... response`) seguido de la respuesta. El autor indica que **todos los actores se inicializaron desde cero a partir de DeepSeek-R1-Distill-Qwen-1.5B**, es decir, este checkpoint es un ajuste completo y no un adaptador LoRA.

El método de entrenamiento es GRPO (Group Relative Policy Optimization) como especialista, sobre **un único entorno** con dificultad balanceada fija 0/1. La generación usa 1.024 tokens iniciales más una continuación configurada de 128 tokens de *answer-forcing*. El presupuesto se fijó en 4.000 rollouts; el checkpoint final corresponde a la actualización 499 (indexada desde cero). La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y las muestras de validación no computan contra el presupuesto de entrenamiento. El criterio de parada es alcanzar 4.000 rollouts o un pass@1 de validación in-distribution mayor o igual a 0,98. El repositorio contiene pesos, tokenizador y configuración, pero **no incluye estado del optimizador ni del dataloader**, por lo que no es reanudable tal cual; los detalles del entorno y de la ejecución original están en `training_run.json` y `training_config.yaml`. No se documenta el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO adicionales.

## Capacidades

- Generación de texto con razonamiento encadenado heredado del modelo base (modo *thinking* de DeepSeek-R1).
- Resolución de problemas matemáticos y de lógica de tipo verificable, orientada por el entrenamiento con recompensas GRPO.
- Generación de trazas de razonamiento largas (1.024 tokens iniciales configurados en entrenamiento) aptas para destilación.
- Producción de respuestas cortas forzadas mediante la continuación de 128 tokens, útil para evaluación automática con verificación exacta.
- Especialización en el entorno concreto del experimento RLVE (dificultad binaria 0/1); el rendimiento fuera de ese dominio no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas; el entrenamiento se limita a un único entorno.
- Multilingüismo: no disponible; los idiomas no están declarados.
- Capacidades de visión o audio: no disponibles (modelo estrictamente de texto).

## Casos de uso

- **Generación de datos de destilación**: dado que el checkpoint está diseñado explícitamente como *teacher* dentro de un pipeline OPD, se usaría para muestrear trazas de razonamiento sobre un conjunto de prompts y filtrarlas por respuesta correcta antes de entrenar un alumno más pequeño.
- **Investigación reproducible sobre escalado de datos**: replicar el experimento RLVE con 4.000 rollouts y el mismo criterio de parada (pass@1 >= 0,98 sobre 32 prompts × 8 respuestas) para medir cuánto dato de profesor hace falta antes de saturar al alumno.
- **Evaluación de métodos de RL**: servir como referencia entrenada con GRPO frente a variantes con otros presupuestos o tamaños de grupo, comparando curvas de validación registradas en W&B.
- **Verificación automática de soluciones**: gracias a la continuación forzada de 128 tokens, se puede usar como generador de respuestas cortas y comparables en tareas con respuesta exacta (aritmética, problemas de dificultad binaria), integrado en un script de evaluación por lotes.
- **Estudio de degradación fuera de dominio**: al ser un especialista de un solo entorno, es un sujeto útil para medir cuánto olvida un modelo de 1,5 B tras RL especializado, comparándolo con el modelo base en tareas generales.
- **Prototipado en local de bajo coste**: con 1,78 B de parámetros cabe en GPU de consumo, lo que permite iterar sobre prompts y formatos de razonamiento en una estación de trabajo antes de trasladar el pipeline a modelos mayores.
- **Análisis de trazas de razonamiento**: extraer cadenas de pensamiento y analizar longitud, estructura y patrones de autocorrección en modelos pequeños entrenados con RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato numérico declarado es el criterio de parada del entrenamiento: pass@1 de validación in-distribution mayor o igual a 0,98, medido sobre 32 prompts con 8 respuestas cada uno cada 50 actualizaciones. No es un resultado de benchmark público ni comparable con MMLU, HumanEval o GSM8K. El autor enlaza la curva completa en W&B, pero sus valores no se recogen en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16**: ~3,6 GB solo de pesos; con caché KV y overhead de runtime, entre 5 y 7 GB para contextos moderados.
- **VRAM estimada en 8 bits**: ~1,9 GB de pesos; en 4 bits, ~1,0 GB, más caché KV.
- **GPU de consumo**: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB si se usa cuantización de 8 o 4 bits.
- **GPU de datacenter**: A100 40/80 GB, H100 y L40S están sobredimensionadas para un modelo de 1,78 B; son útiles solo para servir muchas réplicas en paralelo.
- **Opciones de despliegue**: `transformers` (referencia, usado en el repositorio), vLLM y TGI para serving con batching continuo, llama.cpp/Ollama tras conversión a GGUF. La conversión no está publicada por el autor y debe validarse.
- **Latencia y throughput**: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo denso de 1,78 B en bf16 sobre una RTX 4090 no debería tener problema de cómputo; el cuello de botella real será la longitud de las trazas de razonamiento generadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-097 (este) | 1,78 B | No disponible | GRPO especialista, 4.000 rollouts, 1 entorno | No disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens (según el modelo base) | Destilación de R1 sobre Qwen2.5 | MIT (según el modelo base) | HuggingFace, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | SFT + preferencias sobre Qwen2.5 | Apache 2.0 | HuggingFace |
| Qwen2.5-Math-1.5B | 1,54 B | 4.096 tokens | Preentrenamiento y ajuste matemático | Apache 2.0 | HuggingFace |

La comparación de rendimiento no está disponible: este checkpoint no publica métricas y los tres alternativos tienen evaluaciones públicas que no se han contrastado aquí. La diferencia relevante no es de capacidad bruta sino de propósito: los alternativos son modelos generales o matemáticos listos para uso, mientras que este es un artefacto de investigación atado a un entorno concreto y sin licencia declarada.

## Limitaciones y advertencias

- **Licencia no declarada**: al no especificarse licencia, no hay autorización explícita de uso comercial. Cualquier despliegue en producción requiere aclararlo con el autor y verificar la licencia del modelo base (MIT en el caso de DeepSeek-R1-Distill-Qwen-1.5B).
- **Especialización extrema**: entrenado sobre un único entorno con dificultad binaria 0/1; es esperable un rendimiento deficiente fuera de ese dominio y un posible olvido de capacidades generales, aunque el grado no está medido.
- **Riesgo de alucinación**: como todo modelo derivado de R1, puede producir cadenas de razonamiento plausibles con conclusiones incorrectas; en un rol de profesor esto propaga errores al alumno si no se filtra por verificación automática.
- **Longitud de respuesta condicionada**: la configuración de entrenamiento usa 128 tokens de *answer-forcing*; las respuestas más allá de esa longitud no han sido optimizadas y su calidad es incierta.
- **Sin datos de idiomas**: no se declara cobertura multilingüe; se asume un comportamiento dominado por el inglés y el chino del modelo base, sin garantías.
- **Artefacto no reproducido**: cero descargas y cero valoraciones; no hay evidencia externa de que los pesos carguen y funcionen correctamente.
- **No reanudable**: el repositorio no incluye estado del optimizador ni del dataloader, por lo que no se puede continuar el entrenamiento desde este checkpoint.
- **Sin benchmarks**: no hay ninguna métrica pública comparable que permita afirmar que supera al modelo base del que deriva.
- **Contexto no confirmado**: la ventana de contexto efectiva de este ajuste no se documenta; usar la del modelo base como suposición puede provocar fallos silenciosos con prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-097-RoundTableAssignment-20261025
- Ejecución de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/5f9665b5
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Paper de DeepSeekMath (origen de GRPO): https://arxiv.org/abs/2402.03300
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
