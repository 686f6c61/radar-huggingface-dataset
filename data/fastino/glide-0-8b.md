# fastino/GLiDE-0.8B

## Resumen

GLiDE 0.8B es un modelo de decisión desarrollado por Fastino que, a partir de un estado (texto o JSON) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta. No es un modelo generativo al uso: no produce texto libre, sino que lee probabilidades de una cabecera de decisión de 255 vías en una única pasada hacia delante por pregunta. Con 752 millones de parámetros totales (de los cuales 254 M corresponden a embeddings de tokens y solo 0,26 M a la cabecera de decisión), ocupa 1,53 GB en disco en bf16.

El modelo se posiciona como una alternativa determinista y de baja latencia a los LLM generativos para tareas de clasificación, enrutamiento y puntuación, con una latencia mediana de 19,3 ms por petición medida en una RTX PRO 6000. Soporta tres tipos de decisión: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no con P(sí)) y `score` (niveles ordenados), y admite contextos de hasta 40.000 tokens por pregunta.

Es relevante porque ataca un nicho concreto —decisiones estructuradas con probabilidades calibradas y sin generación— donde los LLM convencionales son caros, lentos y propensos a formatos inconsistentes. La contrapartida es una licencia comunitaria propia (`fastino-community`) y una disponibilidad todavía muy temprana (10 descargas, 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (tag `qwen3_5`); cabecera de decisión de 255 vías |
| Parametros totales | 752.393.024 (0,75 B; 254 M en embeddings de tokens, 0,26 M en la cabecera de decisión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado + pregunta + opciones) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (licencia propia, enlazada en el repositorio) |
| Formato de pesos | safetensors (bf16, 1,53 GB en disco) |

## Arquitectura y entrenamiento

La model card describe un modelo de 0,75 B con un backbone de lenguaje y una cabecera de decisión de 255 vías que se lee directamente para producir probabilidades por opción. El tag `qwen3_5` sugiere una arquitectura derivada de la familia Qwen 3.5, y la dependencia opcional de `flash-linear-attention` confirma la presencia de capas de atención lineal en el backbone. La inferencia se organiza en una única pasada hacia delante por pregunta, agrupando en micro-lotes todas las preguntas de una petición y las de peticiones concurrentes.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el proceso de construcción del Decision Index 0.3.1 ni la metodología de calibración de las probabilidades. Lo que sí se documenta es el rendimiento: 54,32 en el Decision Index 0.3.1 public suite, medido con el kit oficial en una RTX PRO 6000, con latencia mediana de 19,3 ms por petición. El modelo no incorpora encoder de visión: las peticiones con imágenes se rechazan explícitamente, pese a que el pipeline declarado en el Hub sea `image-text-to-text`.

## Capacidades

- Decisiones tipadas con probabilidades por opción: `choice` (hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados con nivel esperado).
- Puntuación conjunta de múltiples preguntas en una sola petición, con micro-lotes para peticiones concurrentes.
- Entrada de estado en texto plano o en cualquier valor JSON (objetos anidados, por ejemplo tickets con metadatos).
- Contexto largo de hasta 40.000 tokens por pregunta, útil para estados con documentación extensa.
- API Python (`Glide.from_pretrained`, `model.decide`, `model.decide_batch`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Endpoint gestionado en `https://api.fastino.ai/v1/systemone` con modelo `fastino/GLiDE`.
- No genera texto: `output_tokens` es siempre 0. No soporta tool calling ni razonamiento multi-paso en el sentido de un agente generativo.
- Sin capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card clasifica intención (`refund`, `cancel`, `track`, `other`), decide si escalar hoy (`noul`) y asigna prioridad (`score`) en una sola llamada, con probabilidades auditables por opción.
- Enrutamiento de peticiones en pipelines de agentes: dado el estado de la conversación en JSON, elegir qué herramienta o sub-agente debe atenderla, sustituyendo un LLM generativo por una decisión de 19,3 ms de latencia mediana.
- Moderación y etiquetado de contenido: clasificación multietiqueta mediante varias preguntas `noul` independientes sobre el mismo estado, con umbral ajustable según la confianza devuelta.
- Puntuación de riesgo o calidad: uso del tipo `score` para asignar niveles ordenados (por ejemplo, severidad de una incidencia) y obtener el nivel esperado como valor continuo para ordenar colas.
- Extracción de señales estructuradas de documentos JSON: al aceptar cualquier valor JSON como estado, puede puntuar campos anidados de un pedido, una reclamación o un registro CRM sin preprocesado a texto plano.
- Clasificación de intención en asistentes conversacionales: con 40.000 tokens de contexto por pregunta, admite historiales largos o documentación adjunta como parte del estado.
- Despliegue en infraestructura modesta: con 1,53 GB de VRAM tras la carga y 2,75 GB de pico en el test de latencia, cabe en GPUs de consumo y permite servir clasificación a bajo coste.

## Benchmarks y rendimiento

| Benchmark | GLiDE 0.8B | Condiciones |
|---|---|---|
| Decision Index 0.3.1 (public suite) | 54,32 | Kit oficial, una RTX PRO 6000, bf16 |
| Latencia mediana por petición | 19,3 ms | RTX PRO 6000, mezcla de peticiones del test de latencia |
| VRAM tras carga | 1,53 GB | bf16 |
| VRAM pico | 2,75 GB | Mezcla de peticiones del test de latencia |
| Tiempo de carga | 6 s | Desde almacenamiento en red |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos en la información disponible; el modelo no está diseñado para esas tareas. Tampoco se ofrecen comparaciones con otros modelos de decisión en la model card.

## Requisitos de hardware

- VRAM estimada: 1,53 GB con pesos bf16 tras la carga; 2,75 GB de pico en el escenario de latencia documentado.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB). No se documentan otras GPU en la model card.
- GPU de consumo: por huella de memoria (1,53-2,75 GB) cabría en cualquier GPU con al menos 4 GB de VRAM, aunque no hay validación publicada en tarjetas de consumo.
- Despliegue: paquete Python `glide` incluido en el repositorio, más servidor HTTP con Uvicorn (`uvicorn glide.server:app`) o `python -m glide.server`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Dependencias fijadas: Python 3.12, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0`, `transformers==5.17.0`; `flash-linear-attention==0.5.2` es opcional pero recomendado (sin él, transformers usa una implementación PyTorch mucho más lenta no validada).
- Latencia y throughput: 19,3 ms de mediana por petición en RTX PRO 6000; el procesamiento por micro-lotes de preguntas y peticiones concurrentes mejora el rendimiento agregado, pero no se publica una cifra de throughput (peticiones/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE 0.8B | 0,75 B | 40.000 tokens por pregunta | Modelo de decisión con probabilidades por opción | `fastino-community` | Pesos en HF + API gestionada |
| LLM generativo pequeño (p. ej. familia Qwen 3.5 sub-1B) | ~0,5-1 B | Depende de la variante | Generación de texto libre | Según variante | Pesos en HF |
| Clasificadores BERT pequeños | ~0,1-0,3 B | 512 tokens típicamente | Clasificación supervisada de etiqueta única | Según variante | Pesos en HF |

La comparación cuantitativa con alternativas no está disponible: la model card no incluye resultados de otros modelos en el Decision Index ni en benchmarks equivalentes. Frente a un LLM generativo, la diferencia estructural es que GLiDE no genera tokens y devuelve distribuciones completas por opción; frente a un clasificador BERT, admite múltiples preguntas tipadas por petición, estados JSON y contextos de hasta 40.000 tokens, a cambio de una licencia comunitaria propia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo como chatbot o agente no es viable.
- Sin encoder de visión: las peticiones con imágenes se rechazan, a pesar del pipeline `image-text-to-text` declarado en el Hub.
- Idiomas soportados no documentados; no hay garantía publicada de comportamiento multilingüe.
- Licencia `fastino-community`: es una licencia propia, no OSI, con condiciones que deben revisarse antes de uso comercial o redistribución.
- No se detallan datos de entrenamiento, composición del dataset ni procesos de alineación, por lo que no es posible evaluar sesgos conocidos ni riesgos de alucinación en el sentido generativo (el modelo no genera texto, pero sus probabilidades pueden estar mal calibradas en dominios fuera de distribución).
- La calibración de confianza mostrada en el ejemplo (confianza 0,184 para una decisión `score` con nivel esperado 1,582) sugiere que la confianza debe interpretarse con cautela y validarse por caso de uso.
- Requiere versiones muy específicas de `torch`, `transformers` y `triton`; sin `flash-linear-attention` el rendimiento cae a una ruta PyTorch no validada.
- Validación en una única GPU (RTX PRO 6000); no hay datos publicados de latencia en otras tarjetas.
- Adopción muy temprana (10 descargas, 0 likes) y sin resultados de benchmarks independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-0.8B
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Sitio del proveedor: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y clave de API: https://agent.fastino.ai
