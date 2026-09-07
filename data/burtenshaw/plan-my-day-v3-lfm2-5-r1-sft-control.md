# burtenshaw/plan-my-day-v3-lfm2.5-r1-sft-control

## Resumen

El modelo `burtenshaw/plan-my-day-v3-lfm2.5-r1-sft-control` es un adaptador PEFT (probablemente LoRA) desarrollado sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. Ha sido creado por el usuario `burtenshaw` y se presenta como un checkpoint de investigación para la tarea de ranking de horarios sintéticos de cuatro opciones. El repositorio contiene únicamente los pesos del adaptador (0.1 GB), no el modelo completo, y está etiquetado como `r1-sft-control-phase3-step330`, lo que indica que se trata de un punto intermedio de un proceso de fine-tuning supervisado (SFT).

El modelo está pensado para resolver problemas de planificación de agendas: a partir de un conjunto de tareas, duraciones, prioridades y restricciones temporales, el modelo debe seleccionar la mejor opción entre cuatro horarios candidatos. Esta capacidad se integra en la aplicación «Plan My Day», publicada también por el autor en HuggingFace Spaces. La relevancia del modelo radica en su potencial para asistentes de planificación personal y profesional, aunque al ser un checkpoint de investigación no se ha promocionado oficialmente y no se han publicado resultados de benchmarks en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador PEFT sobre LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | No disponible (adaptador de 0.1 GB; modelo base de 1.2B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | lfm-open-license-1.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (Parameter-Efficient Fine-Tuning) sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. El adaptador está guardado en formato `safetensors` y su tamaño es de 0.1 GB, lo que sugiere que se trata de una técnica de fine-tuning eficiente en parámetros, probablemente LoRA. El checkpoint concreto se denomina `r1-sft-control-phase3-step330`, lo que indica que es el resultado de una fase de entrenamiento supervisado (SFT) que ha alcanzado el paso 330 de la fase 3.

No se han proporcionado detalles sobre los datos de entrenamiento, la composición del dataset ni el proceso de entrenamiento. El autor menciona que es un «research checkpoint for synthetic four-choice schedule ranking», es decir, un modelo entrenado para ordenar o seleccionar entre cuatro opciones de horario generadas sintéticamente. Tampoco se indica si se ha utilizado RLHF, DPO u otras técnicas de alineación. El repositorio incluye un enlace a un dataset de resultados en HuggingFace, donde se pueden consultar los resultados de los ensayos, aunque no se detallan en la ficha.

## Capacidades

- Ranking de horarios sintéticos de cuatro opciones: el modelo evalúa y selecciona la mejor alternativa de planificación entre cuatro candidatas.
- Planificación de agendas a partir de tareas con duraciones y prioridades.
- Integración con la aplicación «Plan My Day», que permite introducir fecha, zona horaria, citas fijas (o subir un archivo .ics) y un listado de tareas.
- No se especifican capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio en la información proporcionada.
- No se dispone de información sobre soporte multilingüe, aunque el modelo base podría tener capacidades generales de lenguaje.

## Casos de uso

- Asistente de planificación personal: el usuario introduce sus tareas, duraciones y prioridades, y el modelo selecciona el horario más adecuado entre varias opciones, facilitando la organización del día.
- Gestión de agenda con citas fijas: a partir de un archivo .ics o de citas introducidas manualmente, el modelo puede distribuir las tareas restantes alrededor de los compromisos existentes.
- Optimización del tiempo para profesionales: en entornos de trabajo con múltiples proyectos, el modelo puede asignar bloques de trabajo según prioridad y duración, ayudando a decidir entre diferentes distribuciones horarias.
- Generación de planes de estudio: estudiantes con varias asignaturas y tiempo limitado pueden usar el modelo para elegir la distribución de sesiones de estudio que mejor se ajuste a sus restricciones.
- Coordinación de reuniones y franjas horarias: el modelo puede comparar cuatro propuestas de franjas para una reunión y recomendar la más adecuada en función de la disponibilidad de los participantes.
- Integración en asistentes de voz o chatbots: el adaptador puede utilizarse como backend de planificación en un asistente conversacional, devolviendo una estructura de agenda clara tras recibir las entradas del usuario.
- Investigación en planificación automática: el checkpoint sirve como referencia para comparar métodos de scheduling sintético y evaluar la calidad de los rankings generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor enlaza un repositorio de resultados (`https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/tree/main/trials/r1-sft-control`) donde podrían consultarse las métricas de los ensayos, pero no se incluyen datos cuantitativos en la ficha. No se deben asumir valores de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base tiene 1.2B parámetros, en precisión FP16 se necesitarían aproximadamente 2.4 GB de VRAM; en cuantización de 4 bits, alrededor de 1.2 GB. El adaptador PEFT añade un consumo marginal. Estos valores son estimaciones técnicas basadas en el tamaño del modelo base, no datos oficiales.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB, RTX 4060 8GB o superiores. El modelo también puede ejecutarse en CPU para inferencia sencilla.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI o cualquier framework que soporte la carga de un modelo base junto con un adaptador PEFT en formato safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un adaptador específico para una tarea de ranking de horarios. No se puede establecer una comparación directa con otros modelos de la misma categoría sin datos adicionales.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no promovido automáticamente por el autor, por lo que su estabilidad y rendimiento en producción no están garantizados.
- No se han publicado resultados de benchmarks ni evaluaciones cuantitativas en la ficha, lo que impide conocer su calidad real frente a otras soluciones.
- La licencia `lfm-open-license-1.0` debe revisarse detenidamente antes de cualquier uso comercial, ya que puede imponer restricciones.
- El modelo depende por completo del modelo base `LiquidAI/LFM2.5-1.2B-Instruct`; cualquier limitación de este (contexto, idiomas, sesgos) se hereda.
- Existe riesgo de alucinación en la generación de planes, especialmente si las entradas son ambiguas o las restricciones no están bien definidas.
- No se dispone de información sobre los datos de entrenamiento, por lo que los sesgos potenciales son desconocidos.
- El adaptador es de pequeño tamaño (0.1 GB) y está diseñado para una tarea muy concreta; su uso fuera de la planificación de horarios probablemente no sea adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/burtenshaw/plan-my-day-v3-lfm2.5-r1-sft-control
- Dataset de resultados: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/tree/main/trials/r1-sft-control
- Espacio «Plan My Day»: https://huggingface.co/spaces/burtenshaw/plan-my-day
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
