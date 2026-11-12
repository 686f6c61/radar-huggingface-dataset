# moghbaie/smollm2-1.7b-booking-extractor-lora

## Resumen

SmolLM2-1.7B booking extractor es un adaptador LoRA publicado por el usuario moghbaie sobre el modelo base HuggingFaceTB/SmolLM2-1.7B-Instruct. Su única función es convertir una petición breve de reserva en inglés (por ejemplo, "can u move my court 2 slot to next fri at 4:30pm") en un objeto JSON estructurado con cinco claves fijas: `intent`, `date`, `time`, `resource` y `needs_clarification`. No es un modelo de propósito general, sino un extractor de información especializado en el dominio de reservas de instalaciones (pistas de pádel, salas, recursos).

El adaptador resuelve un problema muy concreto en pipelines de agentes y asistentes de reservas: la normalización de lenguaje natural coloquial (fechas relativas, abreviaturas, typos, formato de 12 horas) a un esquema JSON determinista que un sistema posterior pueda consumir sin ambigüedad. El truco clave es la inclusión de una línea de calendario con los próximos 21 días en el prompt, que permite al modelo resolver "next Friday" por búsqueda directa en lugar de por cálculo aritmético, lo que según el autor mejora notablemente la precisión en fechas.

Al estar construido sobre SmolLM2-1.7B, el modelo es muy ligero (repo de 0,1 GB, solo pesos del adaptador), puede ejecutarse en CPU o en GPUs de consumo y está pensado para despliegues de bajo coste y baja latencia. La licencia es Apache 2.0 y el entrenamiento se realizó con 4.500 peticiones sintéticas en inglés con etiquetas calculadas por reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only SmolLM2-1.7B-Instruct |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base SmolLM2-1.7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de transformers/GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-1.7B-Instruct, un transformer decoder-only de 1.700 millones de parámetros. El adaptador LoRA se carga mediante `peft` y `transformers` (≥ 4.56). El prompt de inferencia se envía como un único mensaje de usuario a través de la plantilla de chat del modelo base, con decodificación greedy (`do_sample=False`, `max_new_tokens=96`).

El entrenamiento utilizó 4.500 peticiones sintéticas en inglés con etiquetas calculadas por reglas: 3.000 filas de la versión v2 más 1.500 filas centradas en fechas. El conjunto se dividió por familia de plantillas para que las formulaciones del conjunto de test nunca apareciesen en entrenamiento. La innovación principal no está en la arquitectura sino en el diseño del prompt: se incluye una línea de calendario con los próximos 21 días agrupados por mes, de modo que el modelo resuelve fechas relativas ("next fri", "tomorrow") por búsqueda en lugar de por razonamiento aritmético. El autor advierte explícitamente que sin esa línea de calendario la precisión en fechas cae. No se documentan en la información disponible detalles sobre hiperparámetros LoRA (rango, alpha), número de épocas ni uso de RLHF/DPO.

## Capacidades

- Extracción de información estructurada: convierte peticiones de reserva en JSON con las claves `intent`, `date`, `time`, `resource` y `needs_clarification`.
- Clasificación de intención en cuatro categorías cerradas: `book`, `reschedule`, `cancel` y `check`.
- Normalización de fechas relativas a formato `YYYY-MM-DD` apoyándose en la línea de calendario del prompt.
- Normalización de horas a formato de 24 horas (`HH:MM`), incluyendo expresiones en 12 horas como "4:30pm".
- Detección de campos faltantes mediante el flag `needs_clarification`, con reglas por intención (book → date, time, resource; reschedule → date, time; cancel → date; check → date, resource).
- Tolerancia a typos, abreviaturas y formas de fecha no vistas en entrenamiento (evaluado en el conjunto *stress*).
- Generación de JSON estricto como única salida esperada (sin texto adicional).
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente de reservas de instalaciones deportivas: integrado en un chatbot de pádel, tenis o fútbol sala, transforma mensajes coloquiales de usuarios ("muéveme la pista 2 al viernes que viene a las 4:30") en JSON que el backend de reservas consume directamente para ejecutar el cambio.
- Motor de intenciones para sistemas de gestión de salas de reuniones: procesa peticiones de reserva, cancelación y consulta de disponibilidad de salas en inglés y las convierte en llamadas a la API interna de calendario.
- Preprocesado en pipelines de agentes LLM: actúa como extractor determinista y barato antes de un modelo mayor, reduciendo coste y latencia al resolver la parte estructurada del flujo sin invocar un modelo grande.
- Enrutamiento y triaje de solicitudes: clasifica la intención (`book`, `reschedule`, `cancel`, `check`) para dirigir cada petición al servicio o cola correspondiente.
- Detección de ambigüedad en formularios conversacionales: el flag `needs_clarification` permite al frontend pedir al usuario exactamente el campo que falta, mejorando la experiencia en flujos de reserva por chat.
- Despliegue en edge o entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.7B, puede ejecutarse en CPU o en GPUs de consumo para aplicaciones de reservas de bajo volumen o en local.
- Generación de datos etiquetados: puede usarse como extractor automático para preetiquetar logs de conversaciones de reservas y construir datasets supervisados.

## Benchmarks y rendimiento

Exact match = los cinco campos correctos. Conjuntos de 300 filas; *test* usa formulaciones nunca vistas en entrenamiento, *stress* añade formas de fecha reservadas, abreviaturas y typos. Intervalos de confianza bootstrap pareados al 95 %.

| Conjunto | SmolLM2-1.7B sin adaptar | Este adaptador |
|---|---|---|
| v3 val | 3,0 | 78,67 [74,0; 83,0] |
| v3 test | no disponible | 95,00 |
| v3 stress | no disponible | 77,00 |
| v2 test | 2,0 | 97,00 |
| v2 stress | no disponible | 85,00 |

Comparación con el adaptador anterior (mismo base, datos v2, sin calendario):

| Conjunto | Anterior | Este | Diferencia [IC95] |
|---|---|---|---|
| v3 test | 86,33 | 95,00 | +8,67 [5,67; 12,0] |
| v3 stress | 70,67 | 77,00 | +6,33 [2,33; 10,67] |
| v2 test | 96,67 | 97,00 | +0,33 [−1,67; 2,33] |
| v2 stress | 80,33 | 85,00 | +4,67 [0,67; 8,67] |

Capacidad general (lm-eval; IFEval prompt-level strict, HellaSwag acc_norm, ± error estándar):

| Modelo | IFEval | HellaSwag |
|---|---|---|
| SmolLM2-360M-Instruct sin adaptar | 33,09 ± 2,02 | 56,74 ± 0,49 |
| SmolLM2-1.7B-Instruct sin adaptar | 47,13 ± 2,15 | 71,72 ± 0,45 |
| Este adaptador | 47,69 ± 2,15 | 71,74 ± 0,45 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo base de 1.7B ocupa aproximadamente 3,4 GB de pesos más overhead de activaciones y caché KV; en float32, unos 6,8 GB. El adaptador LoRA añade un tamaño despreciable (repo total de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en bf16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100, H100). Funciona también en CPU, con mayor latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 6 GB o más de VRAM; también en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` + `peft` (vía documentada por el autor); el modelo base puede servirse con vLLM o TGI fusionando el adaptador, y con llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no documentado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada. La generación está acotada a 96 tokens nuevos con decodificación greedy, lo que limita la latencia por petición.
- Nota de entorno: en Colab es necesario desinstalar `torchao` antes de cargar el adaptador con `peft`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-1.7B booking extractor (este) | 1,7B (adaptador LoRA) | no disponible | Extracción JSON de reservas en inglés | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct sin adaptar | 1,7B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Adaptador anterior del mismo autor (v2, sin calendario) | 1,7B (adaptador LoRA) | no disponible | Extracción JSON de reservas | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | no disponible | Propósito general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada; la comparación se limita a variantes del mismo autor y familia.

## Limitaciones y advertencias

- Especialización estrecha: solo procesa peticiones de reserva en inglés y solo emite el esquema JSON de cinco claves; fuera de ese dominio su utilidad es nula.
- Dependencia del prompt: la precisión en fechas depende de incluir la línea de calendario con los próximos 21 días; sin ella, el autor advierte que la precisión cae.
- Idioma: entrenado y evaluado únicamente en inglés; no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinación: puede inventar fechas, horas o recursos si la petición es ambigua o contiene formas de fecha no contempladas; el flag `needs_clarification` mitiga pero no elimina este riesgo.
- Rendimiento en casos difíciles: el exact match cae al 77 % en el conjunto *stress* (typos, abreviaturas, formas de fecha reservadas), frente al 95 % en test limpio.
- Datos sintéticos: el entrenamiento se realizó con 4.500 peticiones sintéticas generadas por reglas, lo que puede no cubrir la distribución real de los usuarios en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base SmolLM2-1.7B-Instruct.
- Requiere `transformers` ≥ 4.56 y `peft`; en Colab hay que desinstalar `torqueo`/`torchao` antiguo para evitar errores de carga.
- Sin métricas de latencia ni throughput publicadas; conviene medirlas en el entorno de despliegue objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moghbaie/smollm2-1.7b-booking-extractor-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Notebook de inicio rápido: `quickstart.ipynb` incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
