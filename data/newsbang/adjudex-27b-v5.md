# newsbang/adjudex-27b-v5

## Resumen

Adjudex 27B v5 es un modelo de decisión tipado desarrollado por newsbang, construido como un ajuste fino (finetune) sobre Qwen/Qwen3.8-27B. No es un generador de texto conversacional al uso: recibe un `state` y un conjunto de `questions` de opción múltiple (hasta 255 opciones por pregunta) y devuelve una distribución de probabilidad sobre cada opción. Está pensado, por tanto, como un motor de decisión ("decision engine") que puede integrarse como componente de enrutamiento, clasificación o selección dentro de pipelines más amplios.

El modelo se distribuye con pesos en safetensors (BF16) y un repositorio de 52,2 GB, con 26.085.330.160 parámetros totales según los metadatos de safetensors. Su arquitectura se apoya en el backbone `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token, más una cabeza de decisión (`readout.safetensors`) de forma `[255, hidden]` en BF16.

La relevancia actual del modelo reside en su enfoque: en lugar de pedir a un LLM que "responda" en lenguaje natural, expone directamente probabilidades calibradas por opción, lo que facilita su uso en sistemas de decisión automatizados, evaluación tipo benchmark y agentes que necesitan seleccionar entre alternativas discretas. La licencia Apache 2.0 y el código de servidor incluido (derivado de perplexity-ai/pplx-decider-v1.1-27b) permiten su despliegue y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en `Qwen3_5Model`, con atención no causal en las capas de atención completa y pooling del último token; cabeza de decisión `[255, hidden]` en BF16 |
| Parametros totales | 26.085.330.160 (26,09 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor; las peticiones que lo exceden se rechazan con HTTP 422) |
| Tipos de cuantizacion | no disponible (los pesos se publican en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más `readout.safetensors` y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y se ajusta como finetune para una tarea de clasificación/decisión tipada. El backbone es `Qwen3_5Model`, con una modificación clave: atención no causal en las capas de atención completa, lo que permite que cada token atienda a toda la secuencia (state + preguntas + opciones) sin enmascaramiento causal. Sobre la representación del último token se aplica una cabeza de decisión (`readout.safetensors`) de dimensiones `[255, hidden]` en BF16, que produce una puntuación por cada una de las hasta 255 opciones posibles.

El modelo incluye además `decision_config.json`, que contiene los códigos de opción, la temperatura de calibración y los hashes de procedencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento más allá de la relación de finetune con el modelo base. La innovación principal es el formato de salida: probabilidades calibradas por opción en lugar de texto libre, con rechazo explícito (HTTP 422) de peticiones que exceden el límite de 8.192 tokens en lugar de truncarlas.

## Capacidades

- Decisión tipada: recibe un `state` y preguntas de opción múltiple con hasta 255 opciones y devuelve una probabilidad por opción.
- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a selección entre alternativas discretas.
- Evaluación tipo benchmark: integrable en suites de evaluación que formulan preguntas de opción múltiple (el autor reporta resultados en áreas como Knowledge, Language, Retrieval, Tools y Arts).
- Soporte de tool calling indirecto: la categoría "Tools" del Decision Index sugiere capacidad de decidir entre herramientas o acciones, aunque no se documenta function calling nativo en formato OpenAI.
- Razonamiento multi-paso: no disponible como capacidad documentada de forma explícita; el modelo está orientado a decisiones puntuales, no a cadenas de razonamiento autónomas.
- Capacidades multilingües: no disponible (no se listan idiomas soportados).
- Capacidades especiales: calibración de temperatura configurable vía `decision_config.json`; rechazo controlado de entradas fuera de contexto.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede recibir el estado de la conversación y una pregunta tipada ("¿qué departamento debe atender esta consulta?") con opciones discretas, devolviendo la probabilidad de cada departamento para derivar el ticket con un umbral de confianza configurable.
- Selección de herramientas en agentes: dado un estado y una lista de herramientas disponibles (hasta 255), el modelo devuelve la probabilidad de cada una, lo que permite elegir la acción con mayor probabilidad o activar un fallback si la distribución es demasiado plana.
- Clasificación de intenciones en asistentes de voz o chat: con contexto de hasta 8.192 tokens, puede clasificar intenciones en conversaciones multi-turno sin perder el hilo, sustituyendo clasificadores ligeros en escenarios con muchas categorías.
- Evaluación automática de modelos: integrado en suites de benchmark que formulan preguntas de opción múltiple, permite obtener respuestas probabilísticas en lugar de generaciones libres, lo que facilita métricas de calibración y comparación entre modelos.
- Moderación y triaje de contenido: formular preguntas tipadas sobre categorías de riesgo (hasta 255 etiquetas) y usar las probabilidades para priorizar revisiones humanas según el umbral de confianza.
- Decisión en pipelines de retrieval: dado un estado y un conjunto de documentos o rutas candidatas, el modelo puede puntuar opciones para reordenar o seleccionar la ruta de recuperación más probable, encajando en sistemas RAG con límite de contexto de 8.192 tokens.
- Automatización de encuestas y formularios: convertir respuestas abiertas en selecciones tipadas con probabilidad asociada, útil para análisis de datos cualitativos a escala.

## Benchmarks y rendimiento

El autor publica resultados en el Decision Index 0.3 (suite pública), con una ejecución completa (`"complete": true`, 140.620 peticiones). 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta que excedía el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas.

| Area | Skill |
|---|---:|
| Knowledge | 61,13 |
| Language | 76,23 |
| Retrieval | 72,10 |
| Tools | 88,73 |
| Arts | 62,47 |
| **Decision Index 0.3** | **72,41** (raw 79,05) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y 26,09 B de parámetros, se requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; el autor reporta el uso de una A800 de 80 GB por proceso de servidor.
- GPU recomendadas: A800 80 GB (configuración validada por el autor), H100 80 GB, A100 80 GB. No se documenta despliegue en GPU de 40 GB o menos.
- ¿Cabe en consumer GPU? No con BF16 completo; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) que permitan reducir la huella a 24 GB o menos.
- Opciones de despliegue: servidor incluido `/v1/systemone` (código de Perplexity Decider v1.1, sin cambios), arrancado con `python -m autojev.server` y variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica el motor `http` del kit con `--option base_url=... --option model=jev-latest`, BF16 en CUDA y longitud máxima 8.192.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 27B v5 | 26,09 B | 8.192 | Decisión tipada con probabilidades por opción | Apache 2.0 | Hugging Face (newsbang/adjudex-27b-v5) |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | LLM generativo generalista | no disponible | Hugging Face |
| perplexity-ai/pplx-decider-v1.1-27b | no disponible en la información | no disponible | Motor de decisión (origen del código de servidor) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, enfoque y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un finetune de Qwen3.8-27B, puede heredar sesgos del modelo base, pero no se aporta información al respecto.
- Riesgo de alucinación: el formato de salida es una distribución de probabilidad sobre opciones predefinidas, lo que reduce el riesgo de texto inventado, pero no garantiza calibración correcta; la temperatura de calibración debe validarse en el dominio de uso.
- Limitaciones de contexto: el servidor rechaza con HTTP 422 las peticiones que exceden 8.192 tokens sin truncar; en la evaluación del autor, 345 peticiones quedaron fuera y contaron como incorrectas, lo que puede penalizar en dominios con contextos largos.
- Limitaciones de idioma: no se listan idiomas soportados; el rendimiento multilingüe no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el código de servidor procede de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0); debe revisarse el archivo NOTICE para cumplir con las atribuciones.
- Caveats para producción: el modelo requiere una GPU de 80 GB por proceso en BF16; no hay cuantizaciones oficiales ni soporte documentado para servidores de inferencia estándar (vLLM, TGI, llama.cpp), lo que limita su integración en infraestructuras existentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Dependencia de código personalizado: el tag `custom-code` implica que la carga del modelo requiere el código del repositorio (`autojev.server`), no basta con `transformers` estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-27b-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de servidor de origen: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Paper, blog o demo: no disponible en la información proporcionada.
