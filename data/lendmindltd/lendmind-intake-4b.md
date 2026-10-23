# lendmindltd/lendmind-intake-4b

## Resumen

Lendmind-Intake-4b es un adaptador LoRA publicado por Lendmind Ltd sobre el modelo base Qwen/Qwen3.5-4B. Su función no es la generación de texto abierta, sino la extracción estructurada: convierte un mensaje de un asesor hipotecario del Reino Unido sobre un cliente en un objeto JSON denominado IntakeFrame v4, que recoge las intenciones del mensaje, los prestamistas nombrados, las cifras y elecciones declaradas por el cliente —cada una acompañada de la cita literal del asesor— y, en una segunda tarea, hasta tres preguntas para completar lo que una calculadora de asequibilidad de un prestamista aún necesita.

El modelo está especializado en leer cifras, no en calcularlas ni inferirlas, y en no emitir veredicto cuando el mensaje solo pregunta por el mercado o continúa un turno anterior. Define cinco clases de intención: A (qué prestamistas financiarían el caso o si uno concreto lo haría), B (criterio de política de un prestamista nombrado), C (productos que encajan), MARKET (consulta de criterios transversal entre prestamistas) y UNKNOWN (ninguna de las anteriores o seguimiento de un turno previo).

La relevancia de esta ficha es doble: por un lado, documenta un caso poco habitual de adaptador LoRA verticalizado para un dominio regulado (intermediación hipotecaria británica) con evaluación por estratos y barras de aceptación explícitas; por otro, deja claro que se trata de una *release candidate* (`v1.0-rc2`), no de una versión final, y que sus cifras de calidad solo se sostienen bajo el lector restringido propietario de Lendmind, no en una completación de chat convencional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen3.5-4B. La arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina Qwen3.5-4B, lo que sugiere ~4 000 millones de parámetros; el dato exacto no se confirma en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar. Las cuantizaciones aplicables son las que publique el repositorio del modelo base (no verificadas en esta ficha) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache 2.0 (según etiqueta del repositorio). La licencia del modelo base debe verificarse en su propio repositorio |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `library_name: peft`), tamaño del repositorio 0,2 GB |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA acoplado a Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen. El adaptador resuelve dos tareas con un mismo conjunto de pesos y dos system prompts distintos: EXTRACT (mensaje → IntakeFrame v4) y ASK (frame → hasta tres preguntas para la calculadora de asequibilidad). La salida es un objeto JSON con esquema fijo, pensado para que un programa posterior localice cada cita textual dentro del mensaje y lea el valor a partir de ella; el modelo está entrenado explícitamente para leer figuras, no para calcularlas ni inferirlas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card sí describe el protocolo de ejecución: las métricas publicadas se obtuvieron con decodificación greedy bajo el *lector restringido* (constrained reader) propietario de Lendmind, que impone el esquema IntakeFrame v4 en la salida. El autor advierte que una completación de chat convencional sobre el adaptador no reproduce ninguna de las cifras declaradas.

## Capacidades

- Extracción de estructura: convierte un mensaje de asesor en un JSON IntakeFrame v4 con intenciones, prestamistas nombrados, cifras y elecciones del cliente.
- Citación literal: cada valor extraído se acompaña de la cita textual del mensaje que lo respalda, verificable por un programa externo.
- Clasificación de intención en cinco clases: A, B, C, MARKET y UNKNOWN, incluyendo la detección de seguimientos de turno previo.
- Generación de preguntas de aclaración: segunda tarea (ASK) que produce hasta tres preguntas planas sobre lo que falta para la calculadora de asequibilidad de un prestamista.
- Abstención diseñada: el modelo está entrenado para no emitir veredicto ante mensajes que solo consultan el mercado o continúan una conversación.
- Salida estructurada compatible con validación por esquema (JSON) y con un lector restringido que fuerza el formato.
- No soporta, según la información disponible: tool calling, uso como agente multi-paso, visión, audio, modo *thinking* explícito ni otros idiomas distintos del inglés.

## Casos de uso

- Extracción de datos en el back-office de una asesoría hipotecaria: el adaptador recibe la nota o el mensaje del asesor y devuelve un frame con las cifras del cliente y las citas que las respaldan, de modo que el sistema pueda rellenar el CRM sin tecleo manual y con trazabilidad de cada dato.
- Enrutado de consultas entrantes: la clasificación A/B/C/MARKET/UNKNOWN permite dirigir cada mensaje al flujo correcto (búsqueda de prestamistas, consulta de política, selección de producto o respuesta de mercado) antes de que intervenga un humano.
- Detección de información faltante: la tarea ASK genera hasta tres preguntas concretas sobre los datos que la calculadora de asequibilidad aún necesita, lo que permite responder al asesor con una solicitud de datos acotada en lugar de una petición genérica.
- Control de calidad y auditoría: al exigir la cita literal junto a cada valor, un programa puede verificar que la figura existe en el mensaje original; los frames que no pasan la verificación se descartan o se marcan para revisión.
- Alimentación de un motor de criterios: los pares cifra-cita extraídos se incorporan como entradas estructuradas a un sistema determinista que aplica los criterios del prestamista, manteniendo al modelo fuera de cualquier decisión de concesión.
- Prototipado e investigación sobre extracción en dominio regulado: sirve como referencia de adaptador LoRA verticalizado con barras de aceptación por estrato y evaluación con escritores no vistos, útil para equipos que diseñan pipelines similares en otros dominios financieros.
- Preprocesado de históricos: procesado por lotes de conversaciones archivadas para reconstruir campos estructurados (importes, plazos, prestamistas mencionados) con verificación posterior contra el texto origen.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index`. Todos figuran con `verified: false` y se obtuvieron sobre un conjunto de evaluación sellado y no publicado (`lendmind-intake-sealed`, etiquetas v2.5). Las métricas se midieron con el adaptador bajo el lector restringido de Lendmind, no de forma aislada.

Tarea evaluada: extracción IntakeFrame v4 a partir de mensajes de asesores hipotecarios del Reino Unido.

| Metrica (barra objetivo) | s2_unseen + s3 (547 mensajes) | s2_unseen, escritores no vistos (106 mensajes) | s3, generador held-out (441 mensajes) |
|---|---|---|---|
| Precisión de cifras, tier 1 (barra 0,98) | 0,991 | 0,967 | 0,994 |
| Precisión de intención, la más baja de A/B/C (barra 0,95) | 0,975 | 0,955 | 0,979 |
| Recall de aclaraciones diseñadas (barra 0,90) | 0,929 | 0,857 | 0,935 |
| Mensajes MARKET/UNKNOWN leídos como caso, recuento (barra 0) | 1 de 111 | 0 de 37 | 1 de 74 |
| Frames devueltos (barra 1,0) | 1,0 | 1,0 | 1,0 |

Lectura de los datos: en el estrato principal (547 mensajes) el modelo cumple 4 de las 5 barras y falla la quinta por un único mensaje. En el estrato de escritores no vistos incumple la barra de precisión de cifras (0,967 frente a 0,98) y la de recall de aclaraciones (0,857 frente a 0,90). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de ~4 000 millones de parámetros, no medida por el autor): ~8-9 GB de pesos en FP16 y ~10-12 GB con caché KV para contextos moderados; ~4-5 GB en INT8; ~2,5-3 GB en 4 bits, con ~4-6 GB totales en la práctica.
- El adaptador en sí ocupa 0,2 GB en safetensors; para servirlo hay que cargarlo junto al modelo base (o fusionarlo en los pesos).
- GPU de centro de datos: A100 40/80 GB, H100, L40S; cualquiera de ellas sobra para un modelo de este tamaño y permite lotes grandes.
- GPU de consumo: sí cabe. RTX 4090 (24 GB) y RTX 3090 en FP16; RTX 4060 Ti 16 GB y RTX 3060 12 GB en FP16 ajustado o INT8; en 4 bits funciona en GPU de 6-8 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM o TGI tras fusionar el adaptador (`merge_and_unload`), llama.cpp/Ollama requiriendo conversión previa a GGUF del modelo fusionado. Para reproducir el comportamiento declarado hace falta replicar el lector restringido con el esquema IntakeFrame v4 (por ejemplo, gramática o JSON schema forzado), que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información disponible adaptadores comparables publicados para extracción de intake hipotecario. La comparación se limita al modelo base y a la alternativa genérica de prompting estructurado.

| Modelo | Parámetros | Contexto | Formato | Licencia | Benchmarks |
|---|---|---|---|---|---|
| lendmind-intake-4b (v1.0-rc2) | Adaptador sobre base de ~4B (dato exacto no disponible) | No disponible | LoRA safetensors (0,2 GB) | Apache 2.0 (adaptador) | Precisión de cifras 0,991 en el estrato principal; conjunto de evaluación no publicado |
| Qwen/Qwen3.5-4B (base, sin adaptador) | ~4B (según denominación) | No disponible | safetensors | Verificar en el repositorio del modelo base | No disponible en esta ficha |
| LLM generalista con JSON schema y prompt few-shot (cualquier instruct de tamaño similar) | Variable | Variable | Variable | Variable | No disponible; requeriría evaluación propia sobre el mismo conjunto, que no es público |

La comparación cuantitativa con alternativas no es posible sin acceso al conjunto sellado de Lendmind, por lo que cualquier cifra cruzada sería especulativa.

## Limitaciones y advertencias

- Estado del artefacto: es una *release candidate* (`v1.0-rc2`), no una release. El autor reserva la etiqueta `v1.0` para un modelo que cumpla las cinco barras.
- Incumple la barra de precisión de cifras en escritores no vistos (0,967 frente a la barra de 0,98), el escenario más probable en producción con asesores nuevos.
- Incumple también la barra de recall de aclaraciones en ese estrato (0,857 frente a 0,90).
- Las métricas dependen del lector restringido propietario; sin él, el adaptador no reproduce ninguno de los números declarados. El esquema y el lector no se publican en el repositorio.
- Conjunto de evaluación sellado y no publicado: no es posible la reproducción independiente ni la comparación con terceros. Todas las métricas figuran como no verificadas.
- Riesgo de alucinación de cifras y de citas: aunque el diseño exige cita literal verificable por programa, el modelo puede asociar un valor a una cita que no lo contiene; la verificación externa es obligatoria, no opcional.
- Riesgo de clasificar un mensaje de mercado o un seguimiento como caso real; el propio autor documenta fallos residuales en esta categoría.
- Alcance restringido: solo inglés y solo mercado hipotecario del Reino Unido. Queda fuera de alcance cualquier otro idioma, mercado o tipo de mensaje que no sea una nota de asesor sobre un caso.
- Prohibiciones explícitas del autor: no es asesoramiento financiero, no es para uso del consumidor y no debe usarse para tomar decisiones de concesión, asequibilidad o idoneidad.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial en producción requiere verificar por separado la licencia del modelo base Qwen3.5-4B y cumplir la normativa sectorial aplicable (protección de datos de clientes en mensajes que contienen información financiera personal).
- Madurez de la comunidad: 0 descargas y 0 likes en el momento de la ficha; sin validación externa conocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lendmindltd/lendmind-intake-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
