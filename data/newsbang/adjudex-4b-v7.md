# newsbang/adjudex-4b-v7

## Resumen

Adjudex 4B v7 es un modelo de decisión tipado desarrollado por newsbang, construido mediante fine-tuning sobre el modelo base Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, Adjudex recibe un `state` y un conjunto de `questions` tipadas (selección múltiple con hasta 255 opciones) y devuelve una distribución de probabilidad sobre cada opción disponible. El pipeline declarado en Hugging Face es `text-classification`, lo que refleja su naturaleza de motor de decisión y no de generación libre de texto.

El modelo cuenta con 4.539.265.536 parámetros totales y un repositorio de 9,1 GB en formato safetensors. Su arquitectura se apoya en el backbone `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token, al que se añade una cabeza de decisión BF16 de dimensiones `[255, hidden]` almacenada en `readout.safetensors`. La configuración de decisión (códigos de opción, temperatura de calibración y hashes de procedencia) se guarda en `decision_config.json`.

La relevancia de este modelo radica en su enfoque especializado: en lugar de competir en generación generalista, se posiciona como un "decider" o motor de decisión que devuelve probabilidades calibradas por opción, lo que lo hace adecuado para sistemas de enrutamiento, clasificación cerrada y agentes que necesitan seleccionar entre alternativas discretas. Publica además una evaluación propia (Decision Index 0.3) sobre un conjunto público de 140.620 peticiones, con una puntuación global de 68,01 (raw 75,93).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en `Qwen3_5Model` con atención no causal en capas de atención completa y pooling del último token; cabeza de decisión BF16 `[255, hidden]` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor; las peticiones que lo exceden se rechazan con HTTP 422) |
| Tipos de cuantizacion | no disponible (la evaluación se realizó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más `decision_config.json` |

## Arquitectura y entrenamiento

Adjudex 4B v7 se construye sobre el backbone `Qwen3_5Model` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen/Qwen3.5-4B) mediante fine-tuning. La modificación arquitectónica principal consiste en sustituir la cabeza generativa por una cabeza de decisión lineal en BF16 de dimensiones `[255, hidden]`, que proyecta el estado oculto del último token (last-token pooling) sobre un espacio de hasta 255 opciones posibles. Las capas de atención completa emplean atención no causal, lo que permite que la representación del último token agregue información bidireccional del `state` y de las `questions` tipadas.

El modelo no genera texto libre: recibe un estado y una pregunta con opciones cerradas y emite una probabilidad por opción. La configuración de decisión incluye códigos de opción, una temperatura de calibración y hashes de procedencia, lo que sugiere un proceso de calibración post-entrenamiento para ajustar las probabilidades emitidas. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Motor de decisión tipado: dado un `state` y `questions` de selección múltiple con hasta 255 opciones, devuelve una probabilidad para cada opción.
- Clasificación cerrada sobre un espacio acotado de etiquetas, adecuada para enrutamiento y selección discreta.
- Soporte de preguntas tipadas, lo que permite estructurar la decisión en función del tipo de cuestión.
- Calibración de probabilidades mediante temperatura configurable en `decision_config.json`.
- Capacidades evaluadas por el autor en seis áreas: conocimiento, lenguaje, recuperación, herramientas, artes y decisión global.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling en el sentido convencional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo recibe el estado de la conversación y una pregunta con las posibles rutas (por ejemplo, facturación, soporte técnico, cancelaciones) y devuelve la probabilidad de cada ruta, permitiendo derivar la consulta al flujo adecuado con una decisión calibrada.
- Selección de herramientas en agentes: dado el estado del agente y una pregunta con las herramientas disponibles como opciones, el modelo puntúa cada herramienta y permite elegir la más probable, integrándose en pipelines de agentes que requieren decisión discreta en lugar de generación.
- Clasificación de tickets o incidencias: con un espacio cerrado de categorías (hasta 255), el modelo asigna probabilidades a cada categoría, lo que facilita umbrales de confianza y revisión humana cuando la probabilidad máxima es baja.
- Recuperación y ranking de candidatos: el modelo puede puntuar opciones que representen documentos, respuestas o candidatos recuperados, aprovechando su área de evaluación de retrieval (70,65 en el Decision Index).
- Filtrado y moderación con etiquetas cerradas: al devolver probabilidades por opción, permite aplicar umbrales configurables para decidir si un contenido requiere revisión, bloqueo o aprobación automática.
- Evaluación de decisiones en pipelines de CI/CD: como motor de decisión determinista sobre opciones acotadas, puede integrarse en flujos que necesiten seleccionar entre alternativas discretas (por ejemplo, elegir una estrategia de despliegue o una acción de remediación) con probabilidades auditables.
- Sistemas de recomendación con opciones cerradas: puntuar un conjunto acotado de ítems o acciones por probabilidad, útil cuando el catálogo de opciones está predefinido y se requiere una distribución calibrada.

## Benchmarks y rendimiento

El autor publica una evaluación propia (Decision Index 0.3, suite pública) con 140.620 peticiones completas. Los resultados por área son los siguientes:

| Area | Puntuacion |
|---|---:|
| Knowledge | 51,41 |
| Language | 71,83 |
| Retrieval | 70,65 |
| Tools | 87,97 |
| Arts | 59,32 |
| **Decision Index 0.3** | **68,01** (raw 75,93) |

Nota: 345 peticiones (311 de ToolRet, 25 de POP909-CL, 6 de BRIGHT, 2 de API-Bank y 1 de HLE) contienen una rama de pregunta que excede el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB de pesos más overhead de activaciones y del servidor; el autor indica una A800 de 80 GB por proceso de servidor en la configuración de evaluación, lo que sugiere que el servidor reserva memoria adicional o no está optimizado para GPUs pequeñas.
- GPU recomendadas según la configuración del autor: una A800 de 80 GB por proceso de servidor. No se documentan configuraciones con GPUs consumer.
- No se confirma que quepa en GPUs consumer; por tamaño de pesos (9,1 GB en BF16) cabría teóricamente en GPUs con 16 GB o más, pero no hay datos publicados de despliegue en consumer.
- Opciones de despliegue: servidor incluido `/v1/systemone` (código de Perplexity Decider v1.1, sin cambios), arrancado con `python -m autojev.server` y variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requiere `pip install -r requirements.txt` y el directorio `source/src` del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 4B v7 | 4.539.265.536 | 8.192 tokens | Motor de decisión tipado (hasta 255 opciones) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible en la información | no disponible en la información | Generación de texto generalista | no disponible en la información | Hugging Face |
| perplexity-ai/pplx-decider-v1.1-27b | no disponible en la información | no disponible en la información | Motor de decisión (código de servido reutilizado) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no genera texto libre: está diseñado exclusivamente para devolver probabilidades sobre opciones cerradas de hasta 255 alternativas.
- Límite estricto de 8.192 tokens: las peticiones que exceden este límite se rechazan con HTTP 422 sin truncar y cuentan como incorrectas en la evaluación (345 casos en la suite publicada).
- El rendimiento en conocimiento es el más bajo de las áreas evaluadas (51,41), lo que sugiere cautela en decisiones que dependan de conocimiento factual.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; la temperatura de calibración es configurable.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el código de servido procede de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0) y debe consultarse el archivo NOTICE.
- El despliegue documentado requiere una A800 de 80 GB por proceso de servidor, lo que limita el uso en infraestructura pequeña.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/newsbang/adjudex-4b-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código de servido de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
