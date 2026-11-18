# HamoAI/hamo-score-0.6b

## Resumen

hamo-score-0.6b es un modelo de 0,6 mil millones de parámetros desarrollado por HamoAI, derivado por destilación de conocimiento de Qwen3-0.6B. No es un modelo conversacional: su función es leer un único mensaje de una conversación de bienestar emocional (en chino o inglés) y devolver un objeto JSON con cinco puntuaciones entre 0,0 y 3,0 —Agency, Withdrawal, Extremity, Hostility y Boundary (AWEHB)— que alimentan código determinista para actualizar estrés, clasificar estados y decidir acciones. El modelo no genera respuestas al usuario.

La relevancia del modelo está en su planteamiento de despliegue local: se distribuye como GGUF q8 de 0,64 GB y puede ejecutarse en CPU, de modo que los datos de conversación no salen de la máquina. Sustituye a un scorer LLM de mayor tamaño en la rúbrica de producción de Hamo AI, con un error absoluto medio de 0,122 frente a las puntuaciones de consejeros humanos en 978 ítems sintéticos reservados, un 27 % inferior al de la versión anterior (v10h).

El modelo se acompaña de un toolkit (`pip install hamo-score`, licencia Apache-2.0) que incluye la plantilla de prompt, un filtro previo por palabras clave y un servidor Docker. La licencia del modelo es HAMO-RAIL-S 1.0, que permite uso comercial con restricciones, entre ellas la exigencia de un mecanismo independiente de gestión de crisis en despliegues de bienestar mental orientados a consumidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (destilado de Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8 GGUF (publicado); safetensors en el repo; formatos MLX |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | HAMO-RAIL-S 1.0 (uso comercial incluido, con restricciones) |
| Formato de pesos | safetensors, GGUF (q8), MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6 B de parámetros, y se obtiene mediante destilación de conocimiento para reproducir el comportamiento del scorer LLM de referencia que Hamo AI usa en su rúbrica de producción. El entrenamiento se realizó sobre conversaciones sintéticas de bienestar emocional que fueron revisadas y re-puntuadas por consejeros humanos contratados por Hamo en tres rondas; la versión v12 se entrenó con las puntuaciones de la tercera ronda. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación principal no es arquitectónica sino de proceso: la evaluación se congeló antes del entrenamiento con 15 comprobaciones operativas, de las que el modelo superó 13. Las dos no superadas (G6a y G6c) comparan las puntuaciones W, E y H con las etiquetas de referencia en un examen real de 453 turnos y fallaron por márgenes estrechos. El modelo está diseñado para inferencia con muestreo neutro obligatorio (temperatura 0, `repeat_penalty` 1.0, `top_k` 0, `top_p` 1.0); valores como el `repeat_penalty` 1.1 por defecto en versiones antiguas de ollama desplazan las puntuaciones lejos de cero.

## Capacidades

- Puntuación de afecto en cinco dimensiones (AWEHB), cada una en el rango 0,0–3,0 en pasos de 0,5, devueltas como un único objeto JSON.
- Lectura de un solo mensaje en contexto conversacional, en chino o en inglés.
- Salida estructurada y parseable: cero salidas no interpretables en las seis pruebas de evaluación registradas.
- Integración con código determinista posterior (actualización de estrés, buckets de estado, gating de acciones).
- Ejecución local en CPU sin llamadas a API externas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No genera respuestas conversacionales ni texto libre dirigido al usuario.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Puntuación de mensajes en una aplicación de bienestar emocional: el modelo recibe cada mensaje del usuario y devuelve las cinco puntuaciones que alimentan la lógica de actualización de estrés y de selección de acciones del sistema, sin que el contenido salga del dispositivo.
- Despliegue con garantías de privacidad: al ejecutarse en CPU sobre un GGUF q8 de 0,64 GB, permite procesar conversaciones sensibles en infraestructura propia o en el dispositivo, requisito habitual en entornos clínicos y de salud mental.
- Pre-filtrado y triaje en pipelines de atención: las puntuaciones de Withdrawal, Extremity y Hostility pueden usarse como señales para enrutar conversaciones hacia revisión humana, siempre que un mecanismo independiente gestione las crisis.
- Investigación en psicología computacional: el modelo ofrece una rúbrica operacionalizada (AWEHB) con pasos de 0,5, útil para anotar corpus de diálogo de forma reproducible y a bajo coste.
- Servicio interno de scoring: el toolkit incluye un servidor Docker que expone `POST /score` en `127.0.0.1:8080`, adecuado para integrarse en un backend existente con control de acceso propio por delante.
- Evaluación comparativa de rúbricas: al ser un modelo pequeño y determinista con temperatura 0, sirve como baseline reproducible frente a scorers LLM de mayor tamaño en experimentos de anotación automática.
- Procesamiento por lotes de transcripciones: con un tiempo mediano de 2,13 s por mensaje en CPU ARM vía ollama, es viable puntuar lotes de mensajes cortos en servidores sin GPU.

## Benchmarks y rendimiento

| Medida | v12 | v10h | Conjunto de evaluación |
|---|---|---|---|
| Error absoluto medio frente a la tercera ronda de consejeros | 0,122 | 0,167 | 978 ítems sintéticos reservados |
| Mismo bucket de estado que las etiquetas de referencia | 440 de 453 turnos (97,1 %) | 440 | examen final real |
| W, E y H dentro de ±0,5 de las etiquetas de referencia | 1.195 de 1.359 juicios | 1.210 | examen final real |
| Pares A: el mensaje con mayor agency puntúa más alto | 147 de 154 pares | 150 | examen sintético A |
| Pares B: el mensaje con mayor boundary puntúa más alto | 176 de 180 pares | 180 | exámenes sintéticos B |
| Puntuaciones dentro de ±0,5 de la etiqueta (media de las cinco) | 84,7 % | 86,7 % | autocomprobación del toolkit, 195 preguntas sintéticas sobre etiquetas de v10 |
| Salidas no interpretables | 0 | 0 | seis exámenes |

El examen final real son 453 turnos pseudonimizados de tres miembros del personal interno que dieron su consentimiento; sus respuestas son las etiquetas de referencia, no puntuaciones de consejeros, y por tanto no son cifras de precisión para la población general. Los exámenes sintéticos son in-distribution. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el GGUF q8 ocupa 0,64 GB y está pensado para ejecutarse sin GPU.
- VRAM estimada: no disponible para variantes en GPU; el peso q8 en memoria ronda los 0,64 GB, por lo que cualquier GPU consumer con 2 GB o más es suficiente en términos de memoria.
- GPU recomendadas: no disponible; el modelo se distribuye y evalúa para CPU y para llama.cpp con Metal en Apple Silicon.
- Cabe en cualquier GPU consumer y en CPU ARM; no requiere acelerador dedicado.
- Opciones de despliegue: ollama, llama.cpp (con Metal), MLX, servidor Docker del toolkit (`POST /score` en el puerto 8080), y transformers mediante el snippet del registro técnico.
- Latencia: mediana de 2,13 s por mensaje y máximo de 3,14 s en 138 ítems sintéticos cortos, con el modelo cargado, en un servidor CPU ARM vía ollama y con el recorte de prompt del toolkit. No es una medida de peor caso.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hamo-score-0.6b | 596 M | no disponible | Scoring AWEHB (JSON) | HAMO-RAIL-S 1.0 | Hugging Face, GGUF/MLX/safetensors |
| Qwen3-0.6B (modelo base) | 0,6 B | no disponible | Generación de texto general | Apache-2.0 (según el modelo base) | Hugging Face |
| Scorer LLM de referencia de Hamo AI | no disponible | no disponible | Scoring AWEHB (producción) | propietario | no disponible públicamente |
| v10h (versión anterior de Hamo) | no disponible | no disponible | Scoring AWEHB | HAMO-RAIL-S 1.0 | no disponible en la información proporcionada |

No se dispone de datos publicados que permitan comparar este modelo con alternativas de terceros en la misma tarea de scoring psicológico.

## Limitaciones y advertencias

- No es un chatbot, ni un instrumento diagnóstico, ni un detector de crisis. Ninguna de sus puntuaciones, incluida Withdrawal, es una señal de crisis.
- No detecta ni gestiona crisis; esa función corresponde a la capa externa (el «spine» de Hamo), que se ejecuta antes del modelo.
- El filtro por palabras clave del toolkit es un punto de partida, no un cribado completo.
- La licencia HAMO-RAIL-S 1.0 exige, en su sección 3c, un mecanismo independiente de gestión de crisis como condición para despliegues de bienestar mental orientados a consumidor.
- Las cifras de evaluación proceden de conjuntos sintéticos in-distribution y de un examen real de solo tres personas; no demuestran generalización a la población general.
- Las puntuaciones no deben leerse en bruto: la rúbrica indica que, cuando las puntuaciones de los consejeros difieren, prevalece la revisión.
- El muestreo debe ser neutro (temperatura 0, `repeat_penalty` 1.0, `top_k` 0, `top_p` 1.0); otros valores desplazan las puntuaciones.
- Solo admite chino e inglés; no hay datos sobre otros idiomas.
- El servidor Docker no incluye autenticación: requiere control de acceso propio antes de exponerlo en red.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HamoAI/hamo-score-0.6b
- Licencia: https://huggingface.co/HamoAI/hamo-score-0.6b/blob/main/LICENSE
- Registro técnico (plantilla de prompt, snippet de transformers, Modelfile): https://huggingface.co/HamoAI/hamo-score-0.6b/blob/main/TECHNICAL_RECORD.md
- Toolkit: https://github.com/HamoAI/hamo-score-toolkit
- Hamo AI: https://www.hamo.ai
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
