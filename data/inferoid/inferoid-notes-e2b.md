# Inferoid/inferoid-notes-e2b

## Resumen

inferoid-notes-e2b es un modelo de lenguaje especializado en la generación de actas de reunión a partir de transcripciones de llamadas, desarrollado por Inferoid. Se construye como un ajuste fino de google/gemma-4-E2B-it, cuantizado a 4 bits en formato MLX para su ejecución local en Macs con Apple Silicon. Su propósito es producir, íntegramente en el dispositivo y sin enviar datos a la nube, una salida estructurada en JSON con título, resumen, puntos clave, decisiones, tareas asignadas (con responsable y fecha límite) y preguntas abiertas.

El modelo cuenta con 4.628.569.379 parámetros totales y un repositorio de 2,6 GB, lo que refleja la cuantización 4-bit del checkpoint. Está pensado para equipos con 8 GB de memoria unificada o más, y forma parte de un ecosistema mayor (Inferoid Notes) que incluye una variante superior, inferoid-notes-e4b, recomendada para máquinas de 16 GB o más.

Su relevancia actual radica en la combinación de privacidad (procesamiento local), especialización de tarea (actas de reunión con esquema JSON fijo) y eficiencia (17 segundos de mediana por llamada de 35-70 minutos en un M4 de 24 GB), lo que lo sitúa como alternativa on-device a modelos en la nube para un caso de uso empresarial muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 E2B), ajuste fino para actas de reunión |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 2,6 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer de la familia Gemma 4, y se ha ajustado específicamente para la tarea de generación de actas de reunión. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el ajuste está orientado a producir una salida JSON con un esquema fijo (título, resumen, puntos clave, decisiones, tareas con responsable y fecha límite, y preguntas abiertas).

La innovación técnica principal no reside en la arquitectura sino en el empaquetado: cuantización 4-bit en formato MLX para Apple Silicon, con un peso de 2,5 GB que permite ejecución en Macs de 8 GB de memoria. El modelo se invoca con el prompt crudo de Gemma 4 sin el token de pensamiento (`<bos><|turn>system\n...<turn|>\n<|turn>user\n...<turn|>\n<|turn>model\n`), lo que sugiere que el ajuste fino ha internalizado el formato de plantilla de conversación de la familia base. No se dispone de información sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia más allá de la cuantización.

## Capacidades

- Generación de actas de reunión estructuradas en JSON a partir de transcripciones de llamadas.
- Extracción de título, resumen, puntos clave, decisiones y preguntas abiertas.
- Identificación de tareas asignadas con responsable y fecha límite.
- Procesamiento de transcripciones con errores de reconocimiento de voz (el conjunto de evaluación incluye errores de estilo ASR).
- Manejo de llamadas largas: el conjunto de evaluación cubre conversaciones de aproximadamente 35-70 minutos de habla.
- Ejecución local en Apple Silicon mediante MLX, sin envío de datos a la nube.
- Generación de texto conversacional (pipeline text-generation).
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Actas automáticas de reuniones de equipo: el modelo recibe la transcripción de una llamada y devuelve un JSON con resumen, decisiones y tareas, lo que permite archivarlas directamente en un sistema de gestión documental sin intervención manual.
- Seguimiento de tareas en herramientas de gestión de proyectos: la salida incluye responsable y fecha límite por tarea, de modo que puede mapearse a tickets de Jira, Linear o Asana mediante un pequeño adaptador.
- Reuniones con clientes en entornos con requisitos de confidencialidad: al ejecutarse íntegramente en el Mac del usuario, el contenido de la llamada no sale del dispositivo, lo que encaja con políticas de privacidad estrictas.
- Documentación de decisiones en equipos distribuidos: el campo de decisiones permite construir un registro auditable de acuerdos sin depender de la memoria de los asistentes.
- Preparación de resúmenes para ausentes: el resumen y las preguntas abiertas permiten a quien no asistió entender el estado de la conversación en segundos.
- Integración en flujos de trabajo locales: mediante `mlx_lm.server` en el puerto 8090, puede conectarse a scripts o apps de escritorio que envíen transcripciones y consuman el JSON resultante.
- Evaluación de calidad de transcripciones ASR: al estar entrenado con errores de reconocimiento de voz, puede usarse como prueba de robustez de pipelines de transcripción en entornos empresariales.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 23 llamadas de negocio sintéticas retenidas (transcripciones escritas con errores de estilo ASR, 35-70 minutos de habla), evaluadas por GPT-6.1 Sol:

| Modelo | Cobertura | Errores por llamada | Utilidad (1-10) | Tiempo mediano por llamada (M4 24 GB) |
|---|---|---|---|---|
| inferoid-notes-e2b (22 llamadas) | 94,8% | 6,1 | 7,0 | 17 s |
| inferoid-notes-e4b | 96,7% | 3,0 | 7,9 | 40 s |
| Claude Opus 5.5 (nube) | 98,9% | 3,2 | 8,8 | nube |

Los errores se definen como afirmaciones de las actas que la llamada no respalda (responsable incorrecto, pregunta inventada, matiz presentado como hecho). El autor advierte que se trata de llamadas sintéticas, no de grabaciones de reuniones reales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,5 GB de pesos en 4-bit; el autor indica que funciona en Macs con 8 GB de memoria o más.
- GPU recomendadas: Apple Silicon (el autor reporta tiempos en un M4 de 24 GB); no se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Macs de 8 GB en adelante; no se ha verificado en GPUs de consumo tipo RTX 4090 con este formato.
- Opciones de despliegue: mlx-lm (`mlx_lm.server --model Inferoid/inferoid-notes-e2b --port 8090`); la app oficial se instala con `uv tool install git+https://github.com/EmotosAI/inferoid` y `inferoid add notes`.
- Latencia y throughput: 17 segundos de mediana por llamada de 35-70 minutos en un M4 de 24 GB; el modelo E4B tarda 40 segundos en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| inferoid-notes-e2b | 4.628.569.379 | no disponible | apache-2.0 | Hugging Face, MLX | Especializado en actas, 4-bit, 17 s/llamada en M4 24 GB |
| inferoid-notes-e4b | no disponible | no disponible | no disponible | Hugging Face (según model card) | Variante superior del mismo autor; 40 s/llamada, menos errores, recomendada para 16 GB o más |
| Claude Opus 5.5 | no disponible | no disponible | propietaria | API en la nube | Referencia de calidad en la evaluación del autor; no es on-device |

No se dispone de datos de otros modelos comparables de la misma categoría (actas de reunión on-device) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha documentado capacidad multilingüe.
- La evaluación se realizó sobre llamadas sintéticas, no sobre grabaciones reales, por lo que el rendimiento en producción puede diferir.
- El autor reconoce aproximadamente 6,1 errores por llamada (responsables incorrectos, preguntas inventadas, matices presentados como hechos), el doble que la variante E4B.
- Riesgo de alucinación en la atribución de tareas y fechas límite, especialmente con transcripciones ruidosas.
- La longitud de contexto no está documentada; no se garantiza el manejo de llamadas muy largas más allá del rango evaluado (35-70 minutos).
- Requiere hardware Apple Silicon y la librería MLX; no es portable a otros entornos sin conversión.
- La licencia apache-2.0 permite uso comercial, pero el modelo base (google/gemma-4-E2B-it) puede tener condiciones adicionales que conviene revisar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.
- La fecha de creación (2026-11-16) y la referencia a modelos como Claude Opus 5.5 y GPT-6.1 Sol deben tomarse como datos de la model card, no verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Inferoid/inferoid-notes-e2b
- Repositorio del proyecto Inferoid: https://github.com/EmotosAI/inferoid
- Prompt de sistema usado por la app (Engine.swift): https://github.com/EmotosAI/inferoid/blob/main/apps/notes/Sources/InferoidNotes/Engine.swift
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
