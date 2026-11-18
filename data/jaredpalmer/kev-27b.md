# jaredpalmer/kev-27b

## Resumen

Kev-27B es un modelo de decisión desarrollado por Jared Palmer. No es un modelo generativo al uso: lee un documento (el *estado*) y un conjunto de preguntas tipadas sobre él, y devuelve una distribución de probabilidad calibrada sobre las opciones suministradas con cada pregunta, en un único forward pass y sin generar texto. Está pensado para clasificar, enrutar, triar o verificar documentos de hasta 64k tokens, con probabilidades que se pueden umbralizar para derivar los casos inciertos a revisión humana.

Técnicamente es un fine-tune de pesos completos de Qwen3.8-27B promediado con la versión 1, con una cabeza de puntero (*pointer head*) de 2,6M de parámetros que puntúa el token de cierre de cada opción contra el token final de la pregunta. El backbone se ejecuta solo en modo prefill, sin decodificación autorregresiva. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), por lo que el SDK de TypeSafe funciona sin cambios.

La relevancia actual está en su enfoque: en lugar de un LLM que "razona" en lenguaje natural y hay que parsear, expone decisiones tipadas con probabilidades calibradas (temperatura T = 1,32 aplicada en carga), lo que facilita umbrales reproducibles y auditoría en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone causal transformer (Qwen3.8-27B) en modo prefill-only con cabeza de puntero sobre opciones |
| Parametros totales | 25.624.600.064 (25,6B en backbone + 2,6M en cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens de estado + al menos 8.192 tokens por pregunta (entrenado con estados de hasta 32.768) |
| Tipos de cuantizacion | No disponible (servido en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (pesos y cabeza; el modelo base también es Apache-2.0) |
| Formato de pesos | safetensors (checkpoint bf16 de 51,3 GB; repo de 51,8 GB) |

## Arquitectura y entrenamiento

El backbone es la revisión post-entrenada de Qwen3.8-27B (`1d4bf0f2`): 64 capas, de las cuales 48 usan Gated DeltaNet (atención lineal) y 16 atención completa, con tamaño oculto de 5.120. Se han ajustado todos los pesos del backbone (full-weight SFT), y el resultado se ha promediado con la versión 1 (que era un adaptador LoRA de rango 16 sobre la misma base). No se cargan la torre de visión, la LM head ni las capas de predicción multi-token, de ahí que los parámetros efectivos (25,6B) queden por debajo de los del modelo base.

La cabeza de puntero consta de dos proyecciones de 5.120 → 256 que puntúan el token de cierre de cada opción contra el token final de la pregunta; una softmax convierte esas puntuaciones en probabilidades. Cada pregunta se responde como una fila independiente que continúa desde el estado compartido, de modo que las preguntas no se influyen entre sí y el estado se calcula una sola vez y se cachea. La calibración se reduce a una única temperatura (T = 1,32) almacenada en `head.pt` y aplicada en tiempo de carga. Los datos de entrenamiento combinan decenas de datasets públicos (razonamiento, NLI, clasificación de sentimiento y temas, QA de sentido común, matemáticas, código, seguridad de contenido, finanzas, diálogo), aunque la información disponible no detalla el número de tokens ni la composición exacta del dataset.

## Capacidades

- Decisiones tipadas sobre documentos: preguntas de tipo `choice` (1–255 opciones con descripción opcional), `score` (1–255 niveles ordenados) y `noul` (sí/no con descripciones opcionales).
- Salida de probabilidad por opción, opción más probable y confianza; para `score`, nivel esperado.
- Calibración explícita mediante temperatura fija, apta para umbralizar y encaminar casos inciertos.
- Procesamiento de documentos largos: estados de hasta 65.536 tokens validados.
- Aislamiento entre preguntas: cada pregunta se evalúa de forma independiente sobre el estado cacheado.
- Compatibilidad con la API System One de TypeSafe (`POST /v1/systemone`) y su SDK.
- Sin generación de texto, chat, resumen ni respuesta abierta: solo puntúa las opciones recibidas.
- Capacidades multilingües: no disponibles (solo inglés).

## Casos de uso

- Clasificación y enrutamiento de tickets: se envía el texto del ticket como estado y una pregunta `choice` con las colas disponibles; la probabilidad por cola permite enrutar automáticamente por encima de un umbral y derivar el resto a un agente humano.
- Triaje de documentos legales o de cumplimiento: pregunta `noul` sobre si el documento cumple una política concreta, con la probabilidad de "sí" como señal de riesgo auditable.
- Verificación de respuestas contra criterios: se pasa el documento fuente y una respuesta propuesta como estado, y se pregunta `noul` si la respuesta satisface cada criterio listado, obteniendo una puntuación por criterio.
- Extracción con opciones cerradas: pregunta `choice` sobre qué campo de un formulario corresponde a un fragmento, evitando el parseo de texto libre típico de los LLM generativos.
- Moderación y seguridad de contenido: clasificación de contenido con opciones predefinidas y probabilidad calibrada, útil para fijar umbrales de escalado a revisión (el autor incluye el dataset Aegis de seguridad en el entrenamiento).
- Análisis de reseñas y encuestas: pregunta `score` sobre sentimiento en una escala ordenada, devolviendo el nivel esperado además de la distribución, lo que permite agregaciones continuas.
- Evaluación de código y commits: pregunta `choice` sobre la categoría de un commit o la naturaleza de un cambio, con el estado formado por el diff y el mensaje (el autor usa CommitPackFT en el entrenamiento).
- Sustitución autoalojada de un endpoint System One: despliegue interno que mantiene el mismo contrato de API que el servicio de TypeSafe, sin cambios en el SDK del cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Evaluación | Conjunto de test | Métrica | Valor |
|---|---|---|---|
| Decisiones tipadas, fuera de dominio (test bloqueado, leído una vez) | transfer-v4: seis fuentes públicas nunca entrenadas y estructuras de política reservadas (656 preguntas) | accuracy | 0,8887 |
| Decisiones tipadas, fuera de dominio | transfer-v4 | Brier score | 0,154 |
| Decisiones tipadas, datasets públicos reservados | breadth-v1: 10 de 14 datasets públicos reservados (2.489 preguntas) | accuracy | 0,832 |
| Decisiones tipadas, familias de tareas reservadas | tasksource-heldout-v1: 17 de 24 familias reservadas (2.024 preguntas) | accuracy | 0,795 |
| Decisiones tipadas, habilidades, herramientas de desarrollo y documentos | hard-v1 + devtools-v1 + documents-v1 (2.795 preguntas) | accuracy | 0,889 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint bf16 ocupa 51,3 GB, por lo que se necesita al menos ~52 GB de VRAM solo para pesos; con caché KV para estados de 65k tokens y preguntas adicionales, el requisito práctico sube.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200; una única GPU de 80 GB es el escenario natural para bf16 con contexto largo.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo actual (24 GB máximo en RTX 4090); requeriría cuantización, que el autor no documenta ni soporta oficialmente.
- Opciones de despliegue: el modelo se sirve a través de la implementación de referencia del autor (`github.com/jaredpalmer/kev`) y es compatible con la API System One de TypeSafe; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-27B | 25,6B (backbone) + 2,6M (cabeza) | 65.536 tokens de estado | Decisiones tipadas calibradas, sin generación | Apache-2.0 | Hugging Face, con SDK TypeSafe |
| Qwen3.8-27B (base) | 27B | No disponible en la información | LLM generativo | Apache-2.0 | Hugging Face |
| Kev-27B v1 (LoRA) | Adaptador rango 16 sobre la misma base | No disponible en la información | Igual, con temperatura T = 1,38 | Apache-2.0 | Tag `v1-lora` en el mismo repo |

No se dispone de información sobre otros modelos de decisión comparables.

## Limitaciones y advertencias

- No genera texto: no sirve para chat, resumen, respuesta abierta ni razonamiento en lenguaje natural; solo puntúa opciones dadas.
- Solo inglés; el rendimiento en otros idiomas no está validado.
- Uso fuera de alcance: el autor excluye explícitamente decisiones totalmente automatizadas con implicaciones legales, según el fragmento disponible de la model card.
- Los benchmarks son declarados por el autor y marcados como no verificados; conviene reproducirlos sobre la carga de trabajo propia antes de fijar umbrales.
- Calibración fija (T = 1,32) validada sobre los conjuntos del autor; puede requerir recalibración en dominios muy distintos.
- Entrenado con estados de hasta 32.768 tokens, aunque se sirven 65.536; el rendimiento más allá del rango de entrenamiento no está garantizado.
- Requiere hardware de gama alta (≥80 GB de VRAM en bf16) y no hay cuantizaciones documentadas, lo que limita el despliegue en entornos modestos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente: probabilidades mal calibradas en dominios fuera de distribución pueden producir umbrales erróneos.
- Sesgos: no documentados en la información disponible; al entrenar con múltiples datasets públicos, puede heredar sesgos de esos corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-27b
- Repositorio del autor: https://github.com/jaredpalmer/kev
- Versión anterior (LoRA v1): https://huggingface.co/jaredpalmer/kev-27b/tree/v1-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
