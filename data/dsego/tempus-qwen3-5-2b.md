# dsego/tempus-qwen3.5-2b

## Resumen

tempus-qwen3.5-2b es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-2B, desarrollado por dsego, especializado en una única tarea: extraer y normalizar las horas de reloj mencionadas en mensajes de chat en inglés, resolviendo a partir del contexto si un "7" suelto se refiere a las 07:00 o a las 19:00. El modelo devuelve una línea `texto=HH:MM` por cada hora detectada, o la palabra `none` si el mensaje no contiene ninguna hora de reloj. Con 1.942.653.248 parámetros (aproximadamente 1,9B), es la variante más precisa del proyecto tempus, aunque demasiado lenta para un presupuesto de 100 ms en CPU.

La relevancia del modelo es acotada pero clara: demuestra que un ajuste fino pequeño y bien dirigido sobre un modelo base de 2B puede resolver con altísima exactitud una tarea de extracción de entidades muy específica, con una tasa de falsos positivos del 0,2% sobre 1.021 mensajes trampa sin hora. Es un ejemplo práctico de destilación de comportamiento hacia una tarea estrecha con datos sintéticos, y de cómo un modelo de 2B puede superar en precisión a alternativas mayores cuando el dominio está bien delimitado.

El modelo se distribuye únicamente en formato GGUF (Q8_0, 2,1 GB) para llama.cpp, está licenciado bajo Apache 2.0 y solo soporta inglés. No incluye el componente de visión del modelo base: es estrictamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B), ajuste fino LoRA rank 16 fusionado |
| Parametros totales | 1.942.653.248 (aproximadamente 1,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,9B parámetros, y se ajusta mediante LoRA de rango 16 con Unsloth durante 3 épocas sobre 11.299 mensajes sintéticos. Posteriormente, el adaptador se fusiona con los pesos base y se convierte a GGUF en cuantización Q8_0. La configuración del entrenamiento está publicada en el repositorio del proyecto (`configs/qwen3.5-2b-v2-s0-compact.yaml`). Se trata de la mejor de tres ejecuciones de entrenamiento, seleccionada según las mismas evaluaciones que se reportan en la model card.

La innovación técnica no reside en la arquitectura, sino en el diseño de la tarea y del protocolo de inferencia: el prompt se envía como un único turno de usuario, sin system prompt, con el modo de razonamiento (thinking) desactivado y decodificación greedy (temperatura 0). El formato de plantilla ChatML incluye un bloque `<think>` vacío y cerrado antes de la respuesta. Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una revisión humana puntual, lo que explica la alta cobertura de situaciones y la evaluación adicional sobre 378 mensajes de situaciones no vistas en entrenamiento.

## Capacidades

- Extracción de horas de reloj en mensajes de chat en inglés, devolviendo una línea `texto=HH:MM` por cada hora encontrada, donde `texto` se copia literalmente del mensaje.
- Resolución de ambigüedad horaria por contexto: decide si un número suelto corresponde a formato de 12 o 24 horas (por ejemplo, "dinner at 7" se resuelve como 19:00).
- Reconocimiento de las formas léxicas "noon" y "midnight" además de horas escritas con dígitos.
- Detección de ausencia de horas: devuelve `none` cuando el mensaje no contiene ninguna hora de reloj, incluyendo mensajes con números que no son horas (por ejemplo, "room 3").
- Ignorancia deliberada de duraciones, tiempos relativos y periodos vagos, por diseño.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso general. Es un modelo de tarea única.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Normalización de horas en asistentes de agenda: el modelo convierte expresiones como "dinner at 7 or lunch at noon" en valores canónicos (19:00 y 12:00) que un sistema posterior puede insertar directamente en un calendario o en una base de datos de eventos.
- Preprocesado de conversaciones para análisis temporal: en pipelines de análisis de chats de soporte o de comunidades, permite extraer todas las horas mencionadas en cada mensaje para construir índices temporales o detectar patrones de actividad.
- Enrutamiento y triaje de mensajes: al devolver `none` de forma fiable (0,2% de falsos positivos sobre 1.021 mensajes trampa), puede usarse como filtro previo para decidir qué mensajes requieren procesamiento adicional por un modelo mayor.
- Extracción de entidades para sistemas de reservas: en un chatbot de reservas de restaurantes o salas, identifica la hora solicitada por el usuario y la entrega en formato de 24 horas listo para consultar disponibilidad.
- Anotación automática de datasets: con una precisión por mensaje del 97,5% en el conjunto principal y del 99,7% en el conjunto de situaciones nuevas, es adecuado para preetiquetar corpus de chat antes de una revisión humana.
- Despliegue en servicios de baja latencia con GPU: con una mediana de 56 ms por mensaje en una RTX 3090, encaja en servicios de extracción en tiempo real que ya dispongan de GPU; para CPU o navegador, el autor remite a la variante de 230M.

## Benchmarks y rendimiento

Los resultados publicados corresponden a coincidencia exacta por mensaje: se deben encontrar todas las horas, con el span correcto y la lectura en 24 horas correcta.

| Evaluación | Este archivo (Q8_0) | Media de tres ejecuciones |
|---|---|---|
| Principal (530 mensajes) | 97,5% | 97,0% |
| Principal, hora del día inferida solo por la situación | 92,7% | 91,7% |
| Nuevo (378 mensajes de situaciones no vistas en entrenamiento) | 99,7% | 98,9% |
| Falsos positivos en 1.021 mensajes trampa sin hora | 2 (0,2%) | 0,1% |

Latencia: mediana de 56 ms por mensaje en una RTX 3090 y 1.105 ms en 4 núcleos de un Ryzen 3600 compartido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 2,1 GB; con overhead de contexto y de llama.cpp, se recomienda al menos 3-4 GB de VRAM para GPU o de memoria RAM para CPU.
- GPU recomendadas: RTX 3090 (56 ms de mediana medida por el autor); cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutarlo, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU consumer: sí, con el archivo Q8_0 de 2,1 GB.
- CPU: funciona en CPU, pero con una mediana de 1.105 ms en 4 núcleos de Ryzen 3600, el autor lo considera demasiado lento para un presupuesto de 100 ms; para ese escenario recomienda la variante de 230M.
- Opciones de despliegue: llama.cpp, probado con el tag b12292 mediante `llama-server --model qwen3.5-2b-v2-Q8_0.gguf`. No se han publicado instrucciones ni garantías para vLLM, TGI u Ollama.
- Protocolo de inferencia: un único turno de usuario, sin system prompt, thinking desactivado y decodificación greedy (temperatura 0).
- Throughput: no disponible más allá de la latencia por mensaje indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| tempus-qwen3.5-2b (este) | 1,9B | No disponible | Extracción de horas en inglés | Apache 2.0 | GGUF Q8_0 |
| tempus-lfm2.5-230m | 230M | No disponible | Extracción de horas en inglés | No disponible en la información | No disponible en la información |
| Qwen/Qwen3.5-2B (base) | 1,9B | No disponible | Generación de texto general, con visión | No disponible en la información | No disponible en la información |

La comparativa con modelos de propósito general de tamaño similar no está disponible en la información proporcionada: no se han publicado resultados de benchmarks estándar para este ajuste fino ni para alternativas comparables en la misma tarea de extracción horaria.

## Limitaciones y advertencias

- Solo inglés: no procesa mensajes en otros idiomas.
- Solo reconoce horas escritas con dígitos, además de "noon" y "midnight"; las horas escritas con letras no están soportadas.
- Ignora por diseño duraciones, tiempos relativos y periodos vagos, por lo que no debe usarse para ese tipo de extracción temporal.
- Los datos de entrenamiento y evaluación son sintéticos, redactados y verificados por modelos de lenguaje con una revisión humana puntual; esto puede introducir sesgos de distribución respecto a chat real.
- Riesgo de alucinación acotado pero presente: se midieron 2 falsos positivos (0,2%) sobre 1.021 mensajes sin hora en este archivo, frente al 0,1% de media de las tres ejecuciones.
- El modelo fue seleccionado como la mejor de tres ejecuciones según las mismas evaluaciones reportadas, lo que puede inflar ligeramente las métricas respecto a un modelo elegido a priori.
- No incluye el componente de visión del modelo base: es estrictamente texto.
- Requiere seguir estrictamente el protocolo de prompt (sin system prompt, thinking desactivado, greedy); desviarse de él puede degradar la precisión.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial.
- Latencia en CPU (1.105 ms de mediana) lo hace inadecuado para presupuestos de 100 ms sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante de 230M para CPU o navegador: https://huggingface.co/dsego/tempus-lfm2.5-230m
- Código, datos y resultados completos: https://github.com/dsegovia90/tempus_finetune
- llama.cpp: https://github.com/ggml-org/llama.cpp
