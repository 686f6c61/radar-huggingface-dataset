# dsego/tempus-qwen3.5-0.8b

## Resumen

tempus-qwen3.5-0.8b es un ajuste fino (LoRA, rango 16) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario dsego. Su cometido es muy específico: leer un único mensaje de chat en inglés y extraer todas las horas de reloj que aparecen en él, decidiendo por el contexto si un "7" suelto se refiere a la mañana o a la tarde. Resuelve un problema de extracción estructurada de información temporal, no de generación generalista.

El modelo se distribuye únicamente en formato GGUF para llama.cpp, con tres variantes de cuantización (Q4_K_M, Q8_0 y una versión "trim" con vocabulario reducido). Su tamaño (772.845.888 parámetros en safetensors, 1,8 GB de repositorio) permite ejecutarlo en una pestaña de navegador mediante el build WebAssembly de llama.cpp.

Es relevante por su enfoque de especialización extrema: en lugar de competir en capacidades generales, optimiza una tarea concreta con métricas publicadas de exactitud y latencia. El autor lo sitúa como opción intermedia de una familia de tres modelos (230M, 0.8B y 2B), y advierte que es demasiado lento para un presupuesto de 100 ms en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, ajuste LoRA rango 16) |
| Parámetros totales | 772.845.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0, Q4_K_M con vocabulario reducido (trim) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 772 millones de parámetros, y se ajusta mediante LoRA de rango 16 con Unsloth durante 3 épocas sobre 11.299 mensajes sintéticos. Posteriormente los pesos se fusionan (merge) y se convierten a GGUF. La configuración exacta está en `configs/qwen3.5-0.8b-v2-s0-compact.yaml` del repositorio del proyecto.

No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de que es sintético, redactado y verificado por modelos de lenguaje con una pequeña revisión humana. No se menciona RLHF ni DPO. La innovación técnica principal no está en la arquitectura sino en el formato de salida: una línea `text=HH:MM` por cada hora detectada, o la palabra `none`, con decodificación greedy (temperatura 0) y sin system prompt. El modelo base incluye componente de visión, pero esta versión es solo texto y no lo incorpora.

## Capacidades

- Extracción de horas de reloj en mensajes de chat en inglés, con resolución de ambigüedad contextual (mañana/tarde).
- Reconocimiento de horas escritas con dígitos, además de "noon" y "midnight".
- Descarte deliberado de duraciones, horas relativas y periodos vagos (devuelve `none`).
- Formato de salida estructurado y verificable (`text=HH:MM` por línea).
- Ejecución en navegador mediante WebAssembly de llama.cpp.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso; el modo thinking debe desactivarse.
- Sin capacidades multilingües: solo inglés.
- Sin visión ni audio.

## Casos de uso

- Extracción de horas en asistentes de mensajería: el modelo procesa cada mensaje entrante y devuelve las horas normalizadas a formato de 24 horas, listas para insertar en un calendario o recordatorio.
- Preprocesado para sistemas de agenda: dado un chat de conversación, se extraen las horas mencionadas y se resuelven ambigüedades ("dinner at 7" se convierte en 19:00) antes de pasarlas a un motor de scheduling.
- Filtrado de falsos positivos en pipelines de extracción temporal: los 1.021 mensajes de prueba sin hora real muestran solo un 0,7% de respuestas erróneas con Q4_K_M, lo que permite usarlo como verificador previo.
- Despliegue en el navegador: con el archivo trim de 448 MB y el build WebAssembly de llama.cpp, se puede ofrecer la extracción de horas en una aplicación web sin backend, reiniciando el worker cada 16 respuestas para evitar el agotamiento de memoria.
- Etiquetado y enriquecimiento de datasets de chat: procesar corpus de mensajes en inglés para anotar horas mencionadas con su lectura de 24 horas, con una latencia de 39 ms por mensaje en RTX 3090.
- Prototipado rápido en local: con 542 MB en Q4_K_M cabe en cualquier equipo y permite validar la tarea de extracción antes de invertir en el modelo de 2B o en el de 230M según el presupuesto de latencia.
- Servicio de normalización temporal en CPU: con 340 ms de mediana en 4 núcleos de un Ryzen 3600, es apto para procesamiento por lotes o flujos asíncronos donde no se exige respuesta instantánea.

## Benchmarks y rendimiento

Las métricas son de exact match por mensaje (hora encontrada, span correcto y lectura de 24 horas correcta). La columna de media de tres ejecuciones corresponde a Q8_0.

| Evaluación | Q4_K_M | Q8_0 | Media de tres ejecuciones (Q8_0) |
|---|---|---|---|
| Principal (530 mensajes) | 97,0% | 97,2% | 96,7% |
| Principal, hora del día solo implícita por la situación | 91,5% | 92,1% | 90,6% |
| Nuevos (378 mensajes de situaciones no vistas en entrenamiento) | 98,4% | 98,4% | 98,1% |
| Nuevos, hora del día solo implícita por la situación | 95,5% | 95,5% | 94,8% |
| Respuestas erróneas en 1.021 mensajes sin hora | 7 (0,7%) | 8 (0,8%) | 0,6% |
| Latencia CPU, mediana, 4 núcleos de Ryzen 3600 compartido | 340 ms | 421 ms | 412 ms |
| Latencia GPU, mediana, RTX 3090 | 39 ms | 40 ms | 41 ms |

El archivo trim obtiene 97,0% en la evaluación principal, con respuestas idénticas al Q4_K_M sin recortar, 98,1% en la evaluación de mensajes nuevos y 5 respuestas erróneas (0,5%) en los mensajes sin hora. Difiere del archivo sin recortar en 5 de los otros 1.399 mensajes, aunque esas dos ejecuciones se hicieron en procesadores distintos (CPU y GPU), lo que altera empates cercanos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para Q4_K_M (542 MB) y 0,85 GB para Q8_0 (834 MB), más overhead del runtime.
- GPU recomendadas: RTX 3090 medida con 39-40 ms de latencia mediana; cualquier GPU con al menos 2 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 2 GB o más de VRAM; también en CPU.
- Despliegue: llama.cpp (probado en el tag b12292), con `llama-server --model qwen3.5-0.8b-v2-Q4_K_M.gguf`; build WebAssembly para navegador. No se documentan otras opciones (vLLM, Ollama, TGI).
- Latencia: 340 ms de mediana en CPU (4 núcleos de Ryzen 3600 compartido) y 39 ms en RTX 3090 con Q4_K_M. No se publica throughput.
- En navegador, los estados de prompt guardados llenan la memoria tras unas 80 respuestas; el demo del repositorio reinicia el worker cada 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Latencia CPU (mediana) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tempus-qwen3.5-0.8b | 772.845.888 | no disponible | 340 ms (Q4_K_M) | Apache 2.0 | GGUF en Hugging Face |
| tempus-lfm2.5-230m | no disponible | no disponible | no disponible (pensado para 100 ms en CPU) | no disponible | Hugging Face (dsego/tempus-lfm2.5-230m) |
| tempus (versión 2B) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Qwen/Qwen3.5-0.8B (base) | 772.845.888 | no disponible | no disponible | Apache 2.0 | Hugging Face |

El autor indica que este modelo es más preciso en situaciones desconocidas que el de 230M y una cuarta parte del tamaño del de 2B. No se dispone de datos de benchmarks de los otros modelos de la familia en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no procesa otros idiomas.
- Solo reconoce horas escritas con dígitos, además de "noon" y "midnight"; las horas escritas con letras no están soportadas.
- Ignora por diseño duraciones, horas relativas y periodos vagos.
- Los datos de entrenamiento y evaluación son sintéticos, generados y verificados por modelos de lenguaje con una pequeña revisión humana, lo que puede introducir sesgos del generador.
- Riesgo de alucinación en mensajes sin hora: el 0,7-0,8% de las respuestas son erróneas, y aproximadamente la mitad de ellas no son horas válidas (por ejemplo, "35=35:00" para "it's 35 degrees out"); un cliente que valide la respuesta las descarta.
- No debe usarse con system prompt ni con thinking activado; el prompt debe enviarse como un único turno de usuario con `temperature 0`.
- En navegador, la memoria se agota tras unas 80 respuestas si no se reinicia el worker.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones comerciales adicionales documentadas.
- El modelo base incluye visión, pero esta versión no la incorpora; es solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsego/tempus-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de 230M de la misma familia: https://huggingface.co/dsego/tempus-lfm2.5-230m
- Código, datos y resultados completos: https://github.com/dsegovia90/tempus_finetune
- llama.cpp: https://github.com/ggml-org/llama.cpp
