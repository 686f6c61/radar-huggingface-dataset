# mradermacher/Sieve-9B-v3-GGUF

## Resumen

Sieve-9B-v3 es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 9B) afinado a partir de la familia Qwen3.5, según la etiqueta `qwen3.5` de su model card. Lo desarrolla el usuario `sthanika-ai` y esta versión concreta la publica `mradermacher` como cuantizaciones GGUF estáticas. El modelo está especializado como *decision-model* con calibración explícita y un mecanismo denominado *decision-index*, orientado a tareas de selección entre opciones (pipeline `multiple-choice`).

El problema que aborda es el de la toma de decisiones estructurada: en lugar de generar texto libre, el modelo está entrenado para puntuar o elegir entre alternativas, con énfasis en la calibración de esas puntuaciones. Esto lo hace útil en sistemas de enrutado, clasificación con opciones discretas y evaluación automática, donde la fiabilidad de la probabilidad asignada importa tanto como la elección.

Esta ficha documenta la versión GGUF publicada por mradermacher, que ofrece cuatro cuantizaciones estáticas (Q2_K, Q4_K_S, Q8_0 y f16) para facilitar el despliegue en CPU y GPU con llama.cpp y compatible con endpoints. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `qwen3.5` en la model card; no se detalla el tipo de transformer) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0, f16 (cuantizaciones estáticas; no hay quants con imatrix/weighted disponibles) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base está en transformers/safetensors |

## Arquitectura y entrenamiento

La model card etiqueta el modelo base como `qwen3.5` y lo describe como un *full-fine-tune* del modelo `sthanika-ai/Sieve-9B-v3`, es decir, un ajuste fino completo (no LoRA ni adaptadores) sobre una base de la familia Qwen3.5. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares.

Las innovaciones declaradas son de naturaleza funcional más que arquitectónica: el modelo incorpora un mecanismo de *decision-index* y está orientado a calibración en tareas de elección múltiple (`multiple-choice`). No se detallan en la información proporcionada innovaciones como decodificación especulativa, atención lineal o arquitecturas híbridas. Tampoco se documenta la longitud de contexto nativa del modelo.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Selección entre opciones múltiples con puntuación calibrada (pipeline `multiple-choice`).
- Toma de decisiones estructurada mediante el mecanismo *decision-index*.
- Ajuste fino completo sobre base Qwen3.5, lo que hereda las capacidades generales de dicha familia (no detalladas en la información disponible).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutado de consultas en sistemas de atención al cliente: el modelo puede recibir una consulta y elegir entre un conjunto discreto de categorías o departamentos, aprovechando su calibración para priorizar la confianza de cada asignación.
- Clasificación con opciones cerradas en pipelines de datos: selección de etiquetas entre alternativas predefinidas para moderación, triaje o etiquetado semiautomático, donde la puntuación calibrada permite fijar umbrales de revisión humana.
- Evaluación automática de respuestas (LLM-as-a-judge): dado un par de respuestas candidatas, el modelo puede elegir la mejor opción y proporcionar una señal de confianza útil para agregar resultados.
- Selección de herramientas o acciones en un agente: aunque no se documenta tool calling nativo, el modelo puede usarse como clasificador de la siguiente acción entre un conjunto finito de opciones.
- Sistemas de recomendación con feedback discreto: elección entre ítems o variantes predefinidas en escenarios de personalización con catálogo acotado.
- Despliegue en entornos con recursos limitados: las cuantizaciones GGUF (desde Q2_K de 4,0 GB) permiten ejecutar el modelo en CPU o GPU de consumo para tareas de decisión de baja latencia.
- Investigación sobre calibración: el énfasis del modelo en calibración lo hace adecuado como objeto de estudio en experimentos sobre fiabilidad de probabilidades en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB, Q4_K_S ~5,5 GB, Q8_0 ~9,6 GB, f16 ~18,0 GB (tamaños de fichero indicados en la model card; el consumo real en memoria añade overhead de contexto y KV cache).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, Q4_K_S y Q2_K caben en GPUs de consumo con 8 GB o más; Q8_0 requiere 12-16 GB; f16 requiere 24 GB o más.
- Cabe en GPU de consumo: sí, en configuraciones Q2_K y Q4_K_S en tarjetas de 8 GB o superiores (estimación basada en el tamaño de los ficheros, no confirmada por el autor).
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.); el modelo base es compatible con transformers y con endpoints. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión calibrados de ~9B) en la documentación proporcionada. Como referencia de tamaño, se podría comparar con otros modelos de ~9B de la familia Qwen, pero no se aportan datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sieve-9B-v3 (este) | ~9B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en decisión y calibración |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la información disponible |

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; su uso en castellano u otros idiomas no está soportado oficialmente y probablemente degrade la calidad.
- Especialización estrecha: está orientado a decisión y elección múltiple; su rendimiento en generación abierta o tareas creativas no está documentado.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo de 9B, cabe esperar alucinaciones en generación libre.
- Calibración: aunque el modelo está etiquetado como calibrado, no se publican métricas (ECE, Brier, etc.) que lo respalden en la información disponible.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita su uso en conversaciones o documentos largos sin validación previa.
- Cuantizaciones: no hay quants con imatrix/weighted disponibles; las cuantizaciones Q2_K y Q4_K_S pueden degradar la calibración, que es precisamente la característica diferencial del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 del que deriva.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sieve-9B-v3-GGUF
- Modelo base: https://huggingface.co/sthanika-ai/Sieve-9B-v3
- Página de descargas del cuantizador: https://hf.tst.eu/model#Sieve-9B-v3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
