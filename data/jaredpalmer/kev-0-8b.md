# jaredpalmer/kev-0.8b

## Resumen

Kev-0.8B es un modelo de decisión tipado desarrollado por Jared Palmer. No es un modelo generativo al uso: recibe un documento (el *state*) y un conjunto de preguntas tipadas sobre él, y devuelve en un único forward pass una distribución de probabilidad calibrada sobre las opciones suministradas con cada pregunta, sin generar texto. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), de modo que el SDK de TypeSafe funciona sin cambios contra este checkpoint.

Técnicamente es un adaptador LoRA (rango 16, α 32, 11,3 M de parámetros) y una cabeza pointer montados sobre `Qwen/Qwen3.5-0.8B-Base`, cuyo backbone permanece congelado. El backbone tiene 24 capas, de las cuales 18 son Gated DeltaNet (atención lineal) y 6 son atención completa. El modelo se sirve en bf16 con el adaptador fusionado en la base en el momento de la carga, y aplica una temperatura de calibración fija T = 2,35.

Es relevante ahora porque demuestra que una tarea de clasificación y enrutamiento con salida probabilística calibrada puede resolverse con 0,8 B de parámetros en un portátil o en una GPU de 4 GB, a costa de una precisión notablemente inferior fuera de dominio respecto a Kev-4B. Está pensado para tareas próximas a sus familias de entrenamiento y como punto de partida para fine-tuning con etiquetas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión: backbone causal prefill-only con cabeza pointer sobre las opciones; backbone híbrido de 24 capas (18 Gated DeltaNet de atención lineal + 6 de atención completa) |
| Parámetros totales | No disponible (adaptador LoRA de 11,3 M de parámetros sobre Qwen3.5-0.8B-Base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Estados de hasta 65.536 tokens servidos, más al menos 8.192 tokens por pregunta; longitud validada: 8.192 tokens; estados de entrenamiento de hasta 7.552 tokens |
| Tipos de cuantización | No disponible (entrenado con autocast bf16 sobre pesos fp32, servido en bf16, evaluado en fp32) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base también es Apache-2.0 |
| Formato de pesos | safetensors con PEFT (adaptador LoRA) más `head.pt` para la cabeza y la temperatura de calibración |

## Arquitectura y entrenamiento

El modelo reutiliza `Qwen/Qwen3.5-0.8B-Base` (revisión `dc7cdfe2`) como extractor congelado. Sobre las proyecciones de atención, MLP y DeltaNet se entrena un adaptador LoRA de rango 16 y α 32 (11,3 M de parámetros). La salida no es texto: una cabeza pointer con dos proyecciones puntúa el token de cierre de cada opción contra el token final de la pregunta, y un softmax sobre esas puntuaciones produce la distribución de probabilidad. Cada pregunta se responde como una fila independiente que continúa desde el estado compartido, de forma que las preguntas no se influyen entre sí y el estado se calcula una sola vez y se cachea.

Los datos de entrenamiento provienen de un conjunto heterogéneo de fuentes públicas: `banking77`, `boolq`, `ag_news`, `multi_nli`, `sst5`, `yelp_review_full`, `trec`, `dbpedia_14`, `amazon_reviews_multi_en`, `imdb`, `commitpackft`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0` y `davidheineman/consumer-finance-complaints-large`. No se especifica en la información disponible el número total de tokens ni si hubo fases de RLHF o DPO. La calibración se resuelve con una única temperatura (T = 2,35) almacenada en `head.pt` y aplicada en la carga, lo que permite obtener probabilidades interpretables y un Brier score medible.

## Capacidades

- Decisión tipada sobre tres tipos de pregunta: `choice` (1–255 opciones con nombre y descripción opcional, devuelve probabilidad por opción, opción más probable y confianza), `score` (1–255 niveles ordenados, devuelve probabilidad por nivel e índice esperado) y `noul` (sí/no con descripciones opcionales, devuelve la probabilidad de sí).
- Clasificación de documentos y enrutamiento con salida probabilística calibrada en un solo forward pass.
- Verificación de políticas sobre reglas explícitas incluidas en el estado.
- Procesamiento de estados en texto plano o en JSON (objeto o array) renderizado como texto etiquetado.
- Respuesta a múltiples preguntas independientes sobre un mismo estado, con caché del estado computado.
- Compatibilidad con la API System One (`POST /v1/systemone`) y con el SDK de TypeSafe.
- No genera texto, no mantiene conversación, no resume y no responde preguntas abiertas.

## Casos de uso

- Clasificación de tickets de soporte: con `choice` sobre categorías predefinidas (facturación, envío, cuenta, etc.) y un estado de hasta 65.536 tokens, el modelo devuelve la categoría más probable y su confianza, lo que permite enrutar automáticamente y derivar a revisión humana los casos con confianza baja.
- Moderación de contenido: usando `noul` o `score` sobre textos y las descripciones de política como opciones, se obtiene una probabilidad de incumplimiento calibrada que puede umbralizarse en un pipeline de revisión.
- Triaje de reclamaciones financieras: el rendimiento en documentos reales (0,851 de accuracy y Brier 0,244 en narrativas de reclamaciones de la CFPB) lo hace adecuado para clasificar y priorizar reclamaciones de consumidores.
- Enrutamiento de consultas en herramientas de desarrollo: con las seis fuentes públicas de tooling del conjunto `devtools-v1` alcanza 0,637 de accuracy, suficiente para prototipar un router de intenciones en asistentes de código antes de migrar a un Kev mayor.
- Extracción de señales estructuradas de documentos largos: al aceptar estados de hasta 65.536 tokens y cachear el estado, permite lanzar decenas de preguntas tipadas sobre un mismo contrato o informe sin recomputar el contexto.
- Prototipado y validación de la API System One: al implementar el mismo contrato que los modelos mayores, sirve para desarrollar y probar integraciones en un portátil o una GPU de 4 GB antes de desplegar Kev-4B.
- Punto de partida para fine-tuning con etiquetas propias mediante `kev.train --init_from jaredpalmer/kev-0.8b`, útil cuando el coste de entrenamiento es una restricción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Conjunto de evaluación | Preguntas | Accuracy | Brier score |
|---|---|---|---|
| transfer-v4 (out-of-domain, test bloqueado leído una vez) | 656 | 0,697 | 0,397 |
| breadth-v1 (14 datasets públicos held-out) | 3.089 | 0,586 | No disponible |
| tasksource-heldout-v1 (desarrollo, 17 de 24 familias) | 1.993 | 0,515 | No disponible |
| documents-v1 (narrativas de reclamaciones CFPB) | 936 | 0,851 | 0,244 |
| hard-v1 (registros de habilidades, etiquetas programáticas) | 1.088 | 0,665 | 0,460 |
| devtools-v1 (seis fuentes públicas de tooling) | 1.071 | 0,637 | 0,442 |

## Requisitos de hardware

- VRAM estimada: el autor indica que funciona en una GPU de 4 GB y en un portátil; el repositorio ocupa 0,2 GB, aunque la inferencia requiere cargar el backbone Qwen3.5-0.8B-Base en bf16 junto con el adaptador fusionado.
- GPU recomendadas: NVIDIA L4 según la model card; cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en la práctica.
- Cabe en GPU consumer: sí, el propio autor lo sitúa en el rango de 4 GB.
- Opciones de despliegue: el modelo se sirve a través de la API System One de TypeSafe (`POST /v1/systemone`) y del SDK de TypeSafe; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estas no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño prefill-only con estado cacheado reduce el coste a un forward pass por estado más uno por pregunta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-0.8B | Adaptador de 11,3 M sobre backbone de 0,8 B | 65.536 tokens de estado (validado 8.192) | Decisión tipada con cabeza pointer y calibración | Apache-2.0 | Hugging Face |
| Kev-4B | No disponible | No disponible | Decisión tipada, misma familia | No disponible | Mencionado en la model card como alternativa de mayor tamaño |
| Qwen3.5-0.8B-Base | 0,8 B | No disponible | Modelo de lenguaje generativo | Apache-2.0 | Hugging Face |

La comparación directa con clasificadores tipo encoder (BERT, DeBERTa) no está disponible en la información proporcionada. El propio autor señala que Kev-0.8B es marcadamente menos preciso que Kev-4B fuera de dominio.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, resumen, respuesta abierta ni generación de texto; solo puntúa las opciones que recibe.
- No está diseñado para enrutamiento de llamadas a herramientas (decidir si invocar una herramienta o pedir más información); el autor lo excluye explícitamente del alcance.
- Rendimiento fuera de dominio limitado: 0,515 de accuracy en familias de tareas no vistas y 0,586 en datasets públicos held-out, frente a 0,851 en documentos del dominio de reclamaciones.
- Solo inglés; no hay soporte multilingüe declarado.
- Contexto validado de 8.192 tokens, aunque se sirvan estados de hasta 65.536 tokens y los estados de entrenamiento no superaran los 7.552 tokens; más allá de la longitud validada el comportamiento no está garantizado.
- Riesgo de calibración degradada fuera de la distribución de entrenamiento: el Brier score sube a 0,460 en `hard-v1` frente a 0,244 en documentos reales.
- Los benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); no deben tomarse como resultados auditados de forma independiente.
- Licencia Apache-2.0 tanto del adaptador como de la base, sin restricciones conocidas para uso comercial; conviene revisar igualmente los términos de los datasets de entrenamiento citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio del proyecto: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
