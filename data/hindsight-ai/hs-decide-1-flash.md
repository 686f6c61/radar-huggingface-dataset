# hindsight-ai/hs-decide-1-flash

## Resumen

hs-decide-1-flash es un modelo de decisión de 0,8B parámetros desarrollado por Hindsight AI (vectorize-io) como componente especializado del sistema de memoria para agentes Hindsight. No es un modelo generativo al uso: recibe un estado (por ejemplo, una consulta y un conjunto de documentos) junto con una o varias preguntas tipadas sobre ese estado, y devuelve en un único forward pass una distribución de probabilidad sobre cada opción de respuesta, sin generar texto.

El modelo está afinado a partir de Qwen/Qwen3.5-0.8B (752.393.024 parámetros reales según los pesos en safetensors) y se distribuye con licencia Apache 2.0. Su función es sustituir llamadas a LLM generativos en tareas de enrutamiento y evaluación dentro de pipelines de agentes: selección de documentos relevantes, reranking, clasificación de intención y respuestas sí/no, con la ventaja de ser determinista, barato y de baja latencia.

Es relevante porque propone un patrón distinto al del LLM-as-a-judge: en lugar de pedir al modelo que escriba una respuesta y parsearla, expone directamente probabilidades calibradas sobre opciones discretas. Soporta ocho idiomas (inglés, español, francés, alemán, portugués, japonés, coreano y chino) y peticiones de hasta 65.536 tokens, lo que lo hace adecuado para evaluar memorias de agente con contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B) con cabeza de decisión sobre opciones tipadas |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens por petición (entrenado) |
| Tipos de cuantizacion | no disponible (entrenado y servido en bfloat16) |
| Idiomas soportados | en, es, fr, de, pt, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se afina como modelo de decisión. La innovación principal no está en el backbone sino en la interfaz: en lugar de decodificar tokens, el modelo produce en un solo forward pass una distribución de probabilidad sobre las opciones de cada pregunta. Soporta tres tipos de pregunta: `choice` (elegir una entre 2 y 255 opciones), `score` (valorar en 2 a 10 niveles ordenados) y `noul` (sí/no). Cada respuesta incluye la opción elegida, la probabilidad de cada alternativa y una medida de confianza.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo RLHF o DPO. Sí indica que el modelo fue entrenado con peticiones de hasta 65.536 tokens, lo que implica un entrenamiento orientado a estados largos (documentos múltiples, historiales de conversación o memorias de agente). La precisión de referencia es bfloat16 y el pipeline declarado en Hugging Face es `text-classification`, coherente con su naturaleza discriminativa más que generativa.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: selección entre opciones (`choice`), puntuación ordinal (`score`) y binaria (`noul`).
- Salida de probabilidades por opción más un valor de confianza, sin texto generado, lo que elimina la necesidad de parseo.
- Múltiples preguntas resueltas en una sola pasada sobre el mismo estado.
- Multilingüe en ocho idiomas: inglés, español, francés, alemán, portugués, japonés, coreano y chino.
- Manejo de peticiones largas de hasta 65.536 tokens, con error explícito (`max_tokens_exceeded`) si se supera.
- Integración como reranker y clasificador en pipelines de memoria de agente (Hindsight).
- Servido mediante un plugin de vLLM que expone el endpoint `POST /v1/systemone`.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su rol es la decisión puntual.

## Casos de uso

- Reranking de documentos recuperados: dado un `query` y un conjunto de documentos, el modelo puntúa con `score` la relevancia de cada documento y permite reordenar los resultados de un sistema RAG antes de pasarlos a un LLM generativo.
- Selección de la memoria relevante en agentes: en un historial largo de interacciones, el modelo elige con `choice` qué recuerdo o fragmento responde mejor a la consulta actual, reduciendo el contexto que se inyecta al modelo principal.
- Detección de intención y enrutamiento: con `choice` sobre un conjunto acotado de intenciones o herramientas, el modelo decide a qué flujo derivar una petición sin coste de generación.
- Verificación de respuestas sí/no: con `noul` se comprueba si una respuesta satisface una condición (por ejemplo, si una fecha cambió o si un documento contradice otro), útil en pipelines de control de calidad.
- Clasificación multilingüe de tickets y mensajes: al soportar ocho idiomas, puede etiquetar consultas de soporte en distintos mercados con un único modelo y sin traducción previa.
- Evaluación automática de calidad en CI: integrado en pipelines que validan salidas de agentes, puntúa con `score` la adecuación de una respuesta a un criterio definido, con coste muy inferior al de un LLM juez.
- Filtrado previo en sistemas de búsqueda: descarta documentos irrelevantes con `noul` o `score` antes de invocar modelos más caros, reduciendo latencia y coste por consulta.

## Benchmarks y rendimiento

La model card incluye dos gráficas de evaluación (`assets/in-hindsight.png` y `assets/benchmarks.png`) con resultados dentro de Hindsight y frente a otros modelos de decisión de 0,8B, pero los valores numéricos no están disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,5 GB para los pesos (el repositorio ocupa 1,5 GB), más overhead de activaciones y caché KV para contextos largos; con 65.536 tokens la caché KV puede requerir varios GB adicionales.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- GPUs de datacenter recomendadas para servir en producción: A100, H100, L40S o A10G, especialmente si se procesan peticiones concurrentes con contexto largo.
- Despliegue principal mediante vLLM 0.32.0 con el plugin incluido en la carpeta `serving/` del repositorio, que añade el endpoint `/v1/systemone` y el comando `hindsight-decision-serve`.
- También disponible como servicio gestionado en `https://inference.hindsight.vectorize.io`.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hs-decide-1-flash | 752 M | 65.536 | Modelo de decisión (choice/score/noul) | Apache 2.0 | Hugging Face, vLLM plugin, servicio gestionado |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | LLM generativo | no disponible | Hugging Face |
| Otros modelos de decisión de 0,8B | no disponible | no disponible | Decisión | no disponible | no disponible |

La model card menciona una comparación con "otros modelos de decisión de 0,8B" en una gráfica, pero no identifica los modelos ni aporta cifras. No hay datos suficientes para una comparativa numérica fiable.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no puede usarse como LLM conversacional ni para tool calling.
- El número de opciones está acotado: entre 2 y 255 para `choice` y entre 2 y 10 niveles para `score`.
- Las peticiones que superan los 65.536 tokens se rechazan con HTTP 400 y `error_type: max_tokens_exceeded`; no hay truncado automático.
- La calibración de las probabilidades y de la confianza no está documentada con métricas públicas; conviene validarla en el dominio de uso antes de confiar en umbrales fijos.
- No se detalla la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos ni cobertura idiomática real más allá de la lista declarada.
- Riesgo de alucinación reducido por diseño (no genera texto), pero puede asignar alta confianza a opciones incorrectas si el estado contiene información ambigua o contradictoria.
- Aunque la licencia es Apache 2.0, el uso comercial del servicio gestionado de Hindsight Inference requiere una API key propia y está sujeto a sus condiciones.
- El ecosistema de despliegue está atado a vLLM 0.32.0 y al plugin del repositorio; no hay soporte documentado para otros runtimes.
- Modelo muy reciente (creado en octubre de 2026) con cero descargas y cero likes en Hugging Face en el momento de la consulta: poca validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Repositorio Hindsight: https://github.com/vectorize-io/hindsight
- Servicio de inferencia gestionado: https://inference.hindsight.vectorize.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
