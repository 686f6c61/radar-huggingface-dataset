# MarulAI/Yedikule-1.4-GGUF

## Resumen

Yedikule 1.4 GGUF es la distribución cuantizada del modelo Yedikule 1.4 de Marul AI, un modelo de lenguaje de 202.055.424 parámetros entrenado desde cero para turco. El repositorio contiene cinco ficheros GGUF: una copia BF16 bit a bit idéntica al modelo base y cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M) generadas con un proceso de calibración específico para este modelo, no con una receta genérica. El objetivo del autor es ofrecer una versión ejecutable directamente en llama.cpp, Ollama, LM Studio y cualquier herramienta compatible con GGUF, sin necesidad de GPU.

El modelo está orientado a conversación con soporte explícito de tres capacidades: un modo de razonamiento breve previo a la respuesta ("thinking"), seguimiento del mensaje de sistema y llamada a herramientas con salida estructurada. El formato de chat, el mensaje de sistema por defecto, las definiciones de herramientas y las llamadas se serializan según el formato exacto visto en el entrenamiento, y el servidor de llama.cpp los expone por separado en los campos `reasoning_content`, `content` y `tool_calls` de la API compatible con OpenAI.

Su relevancia práctica es doble. Por un lado, ocupa entre 140 MB y 406 MB en disco y entre 315 MB y 560 MB de memoria en inferencia con 2.048 tokens de contexto, lo que lo sitúa en el rango de dispositivos sin GPU dedicada, telefonía y equipos antiguos. Por otro, la model card documenta con detalle el método de cuantización y su coste medido en perplejidad, algo poco habitual en modelos de este tamaño y útil como referencia metodológica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (la model card no detalla la variante exacta; se documentan 169 matrices de pesos y una matriz de embeddings de 48.000 tokens que actúa también como capa de salida) |
| Parámetros totales | 202.055.424 (202 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2.048 tokens (valor empleado en los ejemplos de uso y en las mediciones de memoria de la model card; no se declara otro máximo) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr) |
| Licencia | `yedikule-model-lisansi-v2` (identificador `other`; condiciones completas en `LICENSE.md`) |
| Formato de pesos | GGUF (plantilla de chat incrustada en los metadatos de cada fichero) |

## Arquitectura y entrenamiento

La información disponible describe un modelo de lenguaje denso de 202 M de parámetros entrenado desde cero por Marul AI para turco, con un vocabulario de 48.000 tokens. La matriz de embeddings, que representa aproximadamente el 18 % de los parámetros totales, está ligada a la capa de salida, y el modelo contiene 169 matrices de pesos. No se especifican el número de capas, las dimensiones ocultas, el mecanismo de atención, la función de activación ni la composición exacta del corpus de preentrenamiento; tampoco se indica el número de tokens vistos durante el preentrenamiento.

El ajuste posterior se realizó sobre el dataset `MarulAI/Marul-SFT-TR` en formato conversacional, incluyendo mensaje de sistema, bloque de razonamiento y definiciones y llamadas de herramientas. La model card no menciona si hubo fases de RLHF o DPO, ni publica la composición del dataset de SFT. La innovación técnica documentada con más detalle no está en el entrenamiento sino en la cuantización: el autor calculó la matriz de importancia (imatrix) con 530.000 tokens de datos representativos (517 conversaciones del tramo de entrenamiento de Marul-SFT-TR con el formato completo de chat, más texto plano turco de Wikipedia y noticias), midió la divergencia KL de cada una de las 169 matrices en cuatro formatos (Q4_K, Q5_K, Q6_K y Q8_0) sobre un total de 1.352 mediciones, y asignó los bits mediante programación dinámica. Dos hallazgos guiaron el reparto: la matriz de embeddings es el tensor más sensible (una sola cuantización a 4 bits introduce tanta degradación como casi todas las matrices de capas juntas) y las capas intermedias y finales son aproximadamente cinco veces más sensibles que las iniciales. Con ello, la desviación respecto al modelo base se redujo a la mitad en Q6_K, a menos de la mitad en Q5_K_M y a cerca de un cuarto en Q4_K_M en comparación con la cuantización estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional en turco, con plantilla de chat y mensaje de sistema por defecto incluidos en los metadatos del GGUF.
- Modo de razonamiento breve antes de responder: el bloque de pensamiento se emite separado de la respuesta final (`reasoning_content` en la API de llama.cpp; ocultable en Ollama con `--hidethinking`).
- Seguimiento de instrucciones vía mensaje de sistema, con el formato exacto del entrenamiento reconstruido mediante `--jinja`.
- Tool calling / function calling: las llamadas se devuelven de forma estructurada en el campo `tool_calls` de la API compatible con OpenAI.
- Soporte de conversaciones multi-turno con el historial serializado en la plantilla del modelo.
- Compatibilidad de despliegue con llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y otras herramientas que lean GGUF.
- No se documentan capacidades de visión, audio, ni soporte de idiomas distintos del turco.

## Casos de uso

- **Atención al cliente en turco con recursos mínimos**: con 2.048 tokens de contexto y tool calling, el modelo puede gestionar intercambios breves y consultar el estado de un pedido mediante una función expuesta por la API, ejecutándose en CPU en un servidor pequeño o incluso en local.
- **Enrutado y clasificación de tickets**: la salida estructurada de `tool_calls` permite forzar un esquema JSON con la categoría y la prioridad, lo que facilita integrar el modelo como primer escalón de un pipeline de triaje en turco.
- **Extracción de campos de correos y formularios**: definiendo una herramienta con el esquema de los campos a extraer, el modelo devuelve los valores en una estructura parseable, sin necesidad de postprocesar texto libre.
- **Despliegue en dispositivos sin GPU**: los ficheros Q4_K_M (140 MB) y Q8_0 (217 MB) permiten ejecutar el modelo en portátiles antiguos, Raspberry Pi o móviles mediante llama.cpp u Ollama, con un consumo de memoria de 315-370 MB a contexto completo.
- **Prototipado de agentes antes de escalar a modelos mayores**: permite validar plantillas de herramientas, mensajes de sistema y flujos multi-paso con un coste de inferencia casi nulo, y trasladar después el mismo formato a un modelo de mayor tamaño.
- **Asistentes locales de escritorio o IDE**: integrable con LM Studio u Ollama como completador offline en turco, sin enviar datos a servicios externos.
- **Etiquetado y filtrado de corpus turcos**: por su tamaño y velocidad en CPU (Q4_K_M es 3,2 veces más rápido que BF16 en la misma medición), es viable procesar lotes grandes de texto para clasificación o generación de datos sintéticos.
- **Investigación sobre cuantización**: la documentación de imatrix, divergencia KL por tensor y reparto por programación dinámica lo convierte en un caso de referencia reproducible para estudiar el impacto de la cuantización en modelos por debajo de 1 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos publicados son las mediciones de fidelidad de cada cuantización respecto al modelo base, realizadas sobre 568 conversaciones no vistas durante el entrenamiento (312.669 tokens de respuestas del asistente):

| Fichero | Tamaño | Memoria requerida (ctx. 2.048, KV F16) | Δ perplejidad | Coincidencia con el token más probable del modelo base |
|---|---:|---:|---:|---:|
| `yedikule-1.4-bf16.gguf` | 406 MB | 560 MB | — (referencia) | 100 % |
| `yedikule-1.4-Q8_0.gguf` | 217 MB | 370 MB | +0,02 | 99,3 % |
| `yedikule-1.4-Q6_K.gguf` | 177 MB | 335 MB | +0,08 | 98,4 % |
| `yedikule-1.4-Q5_K_M.gguf` | 158 MB | 315 MB | +0,20 | 97,6 % |
| `yedikule-1.4-Q4_K_M.gguf` | 140 MB | 330 MB | +0,39 | 96,5 % |

Nota: Q4_K_M consume algo más de memoria que Q5_K_M porque llama.cpp reorganiza los pesos de 4 bits en memoria para acelerar la ejecución; con `--no-repack` baja a 300 MB. En la misma medición, Q8_0 resultó 2,5 veces más rápido que BF16 en CPU y Q4_K_M, 3,2 veces más rápido.

## Requisitos de hardware

- **VRAM/RAM estimada**: de 315 MB (Q5_K_M con contexto lleno) a 560 MB (BF16). En GPU, el peso de los ficheros va de 140 MB a 406 MB más la caché KV en F16 para 2.048 tokens.
- **GPU**: cabe en cualquier GPU con 1 GB o más de memoria, incluidas integradas. No requiere A100, H100 ni RTX 4090; el cuello de botella es la CPU en escenarios sin aceleración.
- **Consumer GPU**: sí, en todas las gamas. También funciona íntegramente en CPU, que es el escenario para el que el autor publica las mediciones de velocidad.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server` con `--jinja`), Ollama (`ollama run hf.co/MarulAI/Yedikule-1.4-GGUF:Q8_0`), LM Studio y cualquier runtime compatible con GGUF. La API de `llama-server` expone `/v1/chat/completions` compatible con OpenAI.
- **Parámetros de muestreo recomendados por el autor**: `--temp 0.4 --top-k 50 --top-p 0.9 --min-p 0.05 --repeat-penalty 1.12 --repeat-last-n 2048`.
- **Latencia y throughput absolutos**: no disponibles. Solo se publican ratios relativos en CPU (Q8_0 ×2,5 y Q4_K_M ×3,2 frente a BF16).

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse en la fecha de consulta. No se incluye comparación de rendimiento porque Yedikule 1.4 no publica benchmarks estándar.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato GGUF | Rendimiento comparado |
|---|---:|---|---|---|---|---|
| Yedikule 1.4 (este) | 202 M | 2.048 | Turco | `yedikule-model-lisansi-v2` (other) | Sí, 5 cuantizaciones | No disponible |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Multilingüe | Apache 2.0 | Sí | No evaluado en esta ficha |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 | 8 idiomas (turco no oficial) | Llama 3.2 Community License | Sí | No evaluado en esta ficha |
| SmolLM2-360M-Instruct | 362 M | 8.192 | Principalmente inglés | Apache 2.0 | Sí | No evaluado en esta ficha |

La diferencia principal frente a las alternativas es la especialización: Yedikule 1.4 es el único de la tabla entrenado específicamente para turco, pero también el que ofrece la ventana de contexto más corta y el que carece de benchmarks publicados.

## Limitaciones y advertencias

- **Contexto muy corto**: 2.048 tokens limitan conversaciones largas, RAG con varios documentos y flujos de agente con historial extenso.
- **Monolingüe**: solo se declara turco. No hay datos sobre su comportamiento en castellano u otros idiomas, por lo que no debe asumirse transferencia.
- **Capacidad limitada por tamaño**: con 202 M de parámetros el conocimiento factual es necesariamente escaso y el riesgo de alucinación en preguntas de cultura general o datos actuales es alto. Conviene restringir su uso a tareas acotadas y con verificación externa.
- **Ausencia de benchmarks**: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de tool calling, de modo que la fiabilidad de las llamadas a herramientas no está cuantificada.
- **Licencia restrictiva o poco clara**: el identificador es `other` con nombre `yedikule-model-lisansi-v2`. Las condiciones de uso comercial no se detallan en la información disponible; es obligatorio revisar `LICENSE.md` antes de cualquier despliegue en producción.
- **Sesgos no documentados**: no se publica información sobre composición del dataset de preentrenamiento ni sobre evaluación de sesgos.
- **Datos de entrenamiento incompletos**: se desconoce el volumen de tokens de preentrenamiento, la mezcla de datos y si hubo fases de alineación posteriores al SFT.
- **Validación externa nula**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación de la comunidad sobre su comportamiento real.
- **Dependencia de `--jinja`**: el formato correcto de sistema, razonamiento y herramientas se reconstruye con la plantilla incrustada; ejecutarlo sin `--jinja` en llama.cpp puede degradar el seguimiento de instrucciones y romper el tool calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MarulAI/Yedikule-1.4-GGUF
- Modelo base: https://huggingface.co/MarulAI/Yedikule-1.4
- Dataset de SFT: https://huggingface.co/datasets/MarulAI/Marul-SFT-TR
- Licencia: https://huggingface.co/MarulAI/Yedikule-1.4-GGUF/blob/main/LICENSE.md
- Ejecución directa con Ollama: `ollama run hf.co/MarulAI/Yedikule-1.4-GGUF:Q8_0`
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Ollama: https://ollama.com
