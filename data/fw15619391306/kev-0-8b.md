# Fw15619391306/kev-0.8b

## Resumen

Kev-0.8B es un modelo de decisión desarrollado por Jared Palmer dentro del proyecto TypeSafe. No es un modelo generativo al uso: recibe un documento (el *estado*) y un conjunto de preguntas tipadas sobre él, y devuelve en una sola pasada forward una distribución de probabilidad calibrada sobre las opciones proporcionadas con cada pregunta, sin generar texto. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), por lo que el SDK de TypeSafe funciona contra él sin cambios.

Técnicamente es un adaptador LoRA (rango 16, α 32, 11,3 M de parámetros) más una cabeza pointer montados sobre el backbone congelado Qwen3.5-0.8B-Base, un transformer de 24 capas que combina 18 capas de Gated DeltaNet (atención lineal) con 6 de atención completa. El modelo es el miembro más pequeño de la familia Kev y está pensado para ejecutarse en un portátil o en una GPU de 4 GB, donde los tamaños mayores (Kev-4B) no caben o resultan demasiado caros.

Su relevancia actual radica en la propuesta de "decisiones tipadas" con calibración explícita: en lugar de pedir a un LLM que genere una respuesta y parsearla, el modelo puntúa directamente opciones discretas y devuelve confianza utilizable en producción. La contrapartida es que fuera de dominio es notablemente menos preciso que Kev-4B, y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión: backbone causal prefill-only (Qwen3.5-0.8B-Base) con cabeza pointer sobre las opciones; 24 capas (18 Gated DeltaNet de atención lineal, 6 de atención completa), backbone congelado |
| Parámetros totales | 0,8 B en el backbone (congelado) + 11,3 M en el adaptador LoRA + cabeza pointer |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Estados de hasta 65.536 tokens servidos, más al menos 8.192 tokens por pregunta; contexto validado de 8.192 tokens; estados de entrenamiento de hasta 7.552 tokens |
| Tipos de cuantización | No disponible (servido en bf16; el adaptador se fusiona en el base al cargar) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base también es Apache-2.0 |
| Formato de pesos | safetensors con PEFT/LoRA; cabeza en `head.pt` |

## Arquitectura y entrenamiento

El modelo reutiliza Qwen3.5-0.8B-Base (revisión `dc7cdfe2`) como extractor de representaciones congelado. Sobre él se entrena un adaptador LoRA de rango 16 y α 32 aplicado a las proyecciones de atención, MLP y DeltaNet, que suma 11,3 M de parámetros. La cabeza es un pointer head: dos proyecciones puntúan el token de cierre de cada opción contra el token final de la pregunta, y un softmax produce las probabilidades. Cada pregunta se responde como una fila propia que continúa desde el estado compartido, de modo que las preguntas no se influyen entre sí y el estado se calcula una vez y se cachea.

El entrenamiento usó bf16 con autocast sobre pesos fp32, y la evaluación se hizo en fp32. La calibración se resuelve con una única temperatura T = 2,35 almacenada en `head.pt` y aplicada al cargar. Los datos de entrenamiento provienen de un conjunto heterogéneo de fuentes públicas: clasificación de intenciones (banking77), QA booleana (boolq), noticias (ag_news), NLI (multi_nli), sentimiento (sst5, yelp_review_full, imdb, amazon_reviews_multi_en), preguntas (trec), ontología (dbpedia_14), commits de código (commitpackft), seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0) y quejas financieras (consumer-finance-complaints-large). No se documenta el número total de tokens ni si hubo RLHF o DPO; el paradigma es supervisado sobre etiquetas de opciones.

## Capacidades

- Decisión tipada sobre opciones: preguntas de tipo `choice` (1–255 opciones con descripción opcional, devuelve probabilidad por opción, la más probable y confianza), `score` (1–255 niveles ordenados, devuelve probabilidad por nivel e índice esperado) y `noul` (sí/no con descripción opcional, devuelve probabilidad de sí).
- Clasificación de documentos y enrutamiento con probabilidades calibradas (temperatura fija aplicada en carga).
- Verificación de políticas sobre reglas explicitadas en el estado.
- Procesamiento de estados en texto plano o JSON (objeto o array) renderizado como texto etiquetado.
- Una sola pasada forward por lote de preguntas, sin generación de texto, con cacheo del estado.
- Compatibilidad con la API System One de TypeSafe y su SDK.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación libre; el modelo solo puntúa las opciones que recibe.

## Casos de uso

- Clasificación de documentos en producción con hardware mínimo: sobre narrativas de quejas del CFPB alcanza 0,851 de accuracy con Brier 0,244, por lo que encaja en pipelines de triaje documental donde el coste por inferencia y la VRAM son restrictivos.
- Enrutamiento de tickets o solicitudes: con preguntas de tipo `choice` sobre un estado con el texto del ticket y opciones de departamento, el modelo devuelve una distribución calibrada que permite umbralizar derivaciones automáticas frente a revisión humana.
- Verificación de políticas declaradas: dado un estado con las reglas y el caso, preguntas `noul` o `choice` permiten comprobar cumplimiento sin generar explicaciones, útil en validaciones deterministas con auditoría de confianza.
- Moderación y seguridad de contenido: entrenado con Aegis-AI-Content-Safety-Dataset-2.0, puede puntuar categorías de riesgo como opciones múltiples y usar la probabilidad como señal para escalado.
- Análisis de sentimiento y valoración multinivel: con preguntas `score` sobre reseñas (sst5, yelp, amazon, imdb en el entrenamiento) devuelve índice esperado de nivel, adecuado para agregados y dashboards.
- Clasificación de commits y tooling de desarrollo: con las fuentes de commitpackft y el conjunto devtools-v1 (accuracy 0,637), sirve para etiquetar cambios de código o incidencias en pipelines de CI.
- Prototipado contra la API System One antes de migrar a Kev-4B: permite validar la integración del SDK y el diseño de preguntas en un portátil antes de escalar.
- Punto de partida para fine-tuning con etiquetas propias mediante `kev.train --init_from jaredpalmer/kev-0.8b`, cuando el coste de entrenamiento es determinante.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Conjunto de evaluación | Preguntas | Accuracy | Brier |
|---|---|---|---|
| transfer-v4 (out-of-domain, test bloqueado leído una vez) | 656 | 0,697 | 0,397 |
| breadth-v1 (14 datasets públicos held-out) | 3.089 | 0,586 | no disponible |
| tasksource-heldout-v1 (desarrollo, 17 de 24 familias) | 1.993 | 0,515 | no disponible |
| documents-v1 (narrativas de quejas CFPB) | 936 | 0,851 | 0,244 |
| hard-v1 (etiquetas programáticas, plantillas held-out) | 1.088 | 0,665 | 0,460 |
| devtools-v1 (seis fuentes de tooling de desarrollo) | 1.071 | 0,637 | 0,442 |

## Requisitos de hardware

- VRAM estimada: el autor indica que funciona en una GPU de 4 GB; el backbone de 0,8 B en bf16 ocupa aproximadamente 1,6 GB de pesos, más el adaptador fusionado y el estado cacheado.
- GPU recomendadas: portátil con GPU integrada o dedicada, NVIDIA L4, o cualquier GPU consumer con 4 GB o más (por ejemplo, RTX 3050 en adelante).
- Cabe en GPU consumer: sí, es uno de sus objetivos de diseño.
- Despliegue: pensado para servirse a través de la API System One de TypeSafe (`POST /v1/systemone`) con el SDK de TypeSafe; la librería del repo es PEFT. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estas herramientas no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy out-of-domain | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-0.8B | 0,8 B + 11,3 M LoRA | 8.192 validados (65.536 servidos) | 0,697 (transfer-v4) | Apache-2.0 | Hugging Face |
| Kev-4B | No disponible | No disponible | No disponible (el autor indica que es marcadamente superior fuera de dominio) | No disponible | No disponible en la información |
| LLM generativo con parsing de salida (p. ej. Qwen3.5-0.8B-Base) | 0,8 B | No disponible | No disponible | Apache-2.0 | Hugging Face |

La comparación con modelos generativos no es directa: Kev no genera texto y devuelve probabilidades calibradas, mientras que un LLM requeriría generar y parsear la respuesta sin calibración nativa.

## Limitaciones y advertencias

- Fuera de dominio es notablemente menos preciso que Kev-4B; el propio autor lo desaconseja cuando la tarea se aleja de las familias de entrenamiento.
- Solo inglés: no hay soporte multilingüe.
- No sirve para generación de texto, chat, resumen ni QA abierta; únicamente puntúa opciones.
- No soporta enrutamiento de tool calls ni razonamiento multi-paso.
- Precisión limitada en familias de tareas no vistas: 0,515 en tasksource-heldout-v1 y 0,586 en breadth-v1, con Brier de 0,397 en transfer-v4, lo que indica calibración degradada fuera de distribución.
- El contexto validado es de 8.192 tokens aunque se sirvan estados de hasta 65.536; los estados de entrenamiento no superaron 7.552 tokens, por lo que el rendimiento en documentos muy largos no está garantizado.
- Las métricas son declaradas por el autor y no están verificadas.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3.5-0.8B-Base (Apache-2.0).
- Riesgo de sesgo heredado de los datasets de entrenamiento (reseñas, noticias, quejas financieras) y de posibles etiquetas programáticas ruidosas en hard-v1.

## Enlaces

- Hugging Face: https://huggingface.co/Fw15619391306/kev-0.8b
- Repositorio del proyecto: https://github.com/jaredpalmer/kev
- Checkpoint de referencia del autor: https://huggingface.co/jaredpalmer/kev-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
