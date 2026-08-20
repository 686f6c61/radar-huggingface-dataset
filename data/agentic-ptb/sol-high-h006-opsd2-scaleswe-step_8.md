# agentic-ptb/sol-high.h006.opsd2-scaleswe.step_8

## Resumen

El modelo `agentic-ptb/sol-high.h006.opsd2-scaleswe.step_8` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409 millones de parámetros) utilizando trayectorias de agentes de codificación procedentes del dataset ScaleSWE, un recurso público que recopila interacciones de agentes de IA resolviendo tareas de ingeniería de software. El checkpoint corresponde a la celda `sol-high`, generada con el driver Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto, y fue capturado a las 6,53 horas de una ejecución planificada de 100 horas.

Este modelo no es un artefacto final listo para producción, sino un punto intermedio en la curva de rendimiento de un experimento de entrenamiento. Su relevancia radica en que permite estudiar la evolución de las capacidades de un modelo de agente de codificación a lo largo del tiempo de entrenamiento, así como comparar checkpoints dentro del mismo barrido. La model card advierte explícitamente de que le falta el token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga correctamente sus respuestas y sobrepase la ventana de contexto; por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B-Base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only con 9,4 B parámetros. Sobre esta base se aplica un fine-tuning supervisado con datos de trayectorias de agentes de codificación del dataset ScaleSWE, que contiene registros de agentes resolviendo problemas reales de repositorios de software. El proceso de entrenamiento forma parte del barrido AgentPTB, donde se generan múltiples celdas (configuraciones) variando el driver (en este caso, Codex / gpt-5.6-sol con esfuerzo de razonamiento alto) y se registran checkpoints periódicos. Este checkpoint concreto se guardó a las 6,53 horas de una ejecución de 100 horas, en el paso 8 del directorio `outputs/opsd2-scaleswe/weights/step_8`.

La model card indica que el token de fin de secuencia configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para cerrar cada turno de asistente. Esta omisión implica que el modelo no aprende a emitir el marcador de fin de turno, por lo que en inferencia continuará generando hasta agotar la ventana de contexto. No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto y código: al estar fine-tuneado con trayectorias de agentes de codificación, se espera que el modelo haya adquirido habilidades para generar parches, editar archivos y razonar sobre problemas de software, aunque no se han publicado evaluaciones específicas.
- Razonamiento multi-paso: el entrenamiento con datos de agentes sugiere cierta capacidad para planificar secuencias de acciones, pero no hay evidencia cuantitativa en la información disponible.
- Tool calling / function calling: no se especifica explícitamente, aunque los datos de ScaleSWE suelen incluir llamadas a herramientas; sin embargo, al ser un checkpoint intermedio, esta capacidad puede estar incompleta.
- Capacidades multilingües: no disponibles; se heredan del modelo base Qwen3.5, que típicamente soporta múltiples idiomas, pero no se confirma en la documentación.
- Capacidades especiales: ninguna documentada. No hay soporte de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en dinámica de entrenamiento: este checkpoint permite a investigadores estudiar cómo evolucionan las capacidades de un agente de codificación a lo largo del tiempo de entrenamiento, comparándolo con otros checkpoints del mismo barrido (por ejemplo, horas posteriores) para trazar curvas de rendimiento.
- Análisis de la influencia del driver en el fine-tuning: al pertenecer a la celda `sol-high` (driver gpt-5.6-sol con effort alto), puede usarse para comparar cómo distintas estrategias de generación de datos afectan al modelo resultante.
- Reproducción de experimentos: el repositorio incluye la ruta exacta del checkpoint dentro del run, lo que facilita la reproducibilidad del barrido completo.
- Estudio de la falta de token de fin de secuencia: este checkpoint es un caso de estudio sobre los efectos de omitir el token `<|im_end|>` en el entrenamiento, útil para depurar pipelines de fine-tuning.
- Desarrollo de métricas de evaluación intermedias: al ser un punto en la curva de rendimiento, puede servir para calibrar métricas que predigan el rendimiento final del modelo.
- Fine-tuning posterior: aunque no es recomendable para producción, podría usarse como punto de partida para continuar el entrenamiento con otros datasets, siempre que se corrija el problema del token eos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que, debido a la ausencia del token `<|im_end|>`, cualquier métrica de evaluación obtenida con este checkpoint es un límite inferior y no debe compararse directamente con otros modelos que sí cierran correctamente los turnos. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros en precisión fp16, se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repo). Con cuantización a 8 bits, ~9,4 GB; con 4 bits, ~4,7 GB.
- GPU recomendadas: para fp16, una GPU con 24 GB (RTX 3090, RTX 4090, A10, L4) o superior. Para cuantización 4 bits, cabría en GPUs de 8 GB (RTX 3060, RTX 4060, etc.), aunque no se han probado oficialmente.
- Si cabe en consumer GPU: sí, con cuantización. En fp16 requiere una GPU de gama alta (24 GB).
- Opciones de despliegue: al ser un checkpoint intermedio con el problema del token eos, no se recomienda su despliegue en producción. Para experimentación, podría cargarse con bibliotecas como Transformers, vLLM o llama.cpp (si se convierte a GGUF), pero habría que re-empaquetar el modelo para añadir el token faltante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/sol-high.h006.opsd2-scaleswe.step_8` | 9,4 B | No disponible | No disponible | Checkpoint intermedio, falta token eos |
| `Qwen/Qwen3.5-9B-Base` | 9,4 B | No disponible (típicamente 128k en Qwen3) | Apache 2.0 (habitual en Qwen) | Modelo base sin fine-tuning |
| Otros fine-tunings de Qwen3.5-9B | 9,4 B | Variable | Variable | No se han identificado modelos comparables específicos |

No se dispone de información sobre otros checkpoints del mismo barrido ni de modelos similares con los que comparar directamente. La comparativa se limita al modelo base, que es el punto de partida.

## Limitaciones y advertencias

- Token de fin de secuencia incompleto: falta el token `<|im_end|>` (ID 248046), por lo que el modelo no detiene sus respuestas al final de un turno y puede generar texto hasta agotar la ventana de contexto. Esto invalida cualquier evaluación directa y hace que el modelo no sea utilizable en producción sin un re-empaquetado previo.
- Checkpoint intermedio: es un punto a las 6,53 horas de un entrenamiento de 100 horas; sus capacidades están a medio desarrollar y no representan el rendimiento final del barrido.
- Sin licencia especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o incluso académico sin autorización explícita.
- Sin datos de rendimiento: no hay benchmarks publicados, y los que pudieran existir serían poco fiables debido al problema del token eos.
- Sesgos y alucinaciones: no se documentan, pero al ser un modelo entrenado con datos de agentes de codificación, puede presentar sesgos propios de los repositorios de software (por ejemplo, sobre-representación de ciertos lenguajes o estilos de código).
- Riesgo de sobreescritura de contexto: al no detenerse, el modelo puede generar respuestas extremadamente largas que degradan la calidad y consumen recursos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h006.opsd2-scaleswe.step_8
- Dataset ScaleSWE (GitHub): https://github.com/AweAI-Team/ScaleSWE
- Índice del barrido AgentPTB (referenciado en la model card, no se proporciona URL directa): `agentic-ptb/INDEX`
