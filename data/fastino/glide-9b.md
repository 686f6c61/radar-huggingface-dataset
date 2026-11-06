# fastino/GLiDE-9B

## Resumen

GLiDE-9B es un modelo de decisión desarrollado por Fastino que, a diferencia de los modelos generativos convencionales, no produce texto: dado un estado (texto plano o cualquier valor JSON) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre cada una de las opciones de cada pregunta. Con 7.936.684.544 parámetros (7,94 B) y pesos en bf16, se posiciona como una alternativa determinista y de baja latencia a los LLM generativos para tareas de clasificación, enrutamiento y puntuación.

El modelo se apoya en una arquitectura derivada de la familia Qwen 3.5 (tag `qwen3_5_text`), con capas de atención lineal (compatibles con `flash-linear-attention`) y un cabezal de lectura de decisión de 255 vías que permite hasta 255 opciones nombradas por pregunta. Soporta tres tipos de decisión: `choice` (una entre hasta 255 opciones), `noul` (sí/no con P(sí)) y `score` (niveles ordenados con nivel esperado). Cada pregunta se resuelve en un único forward pass, y las peticiones concurrentes se agrupan en micro-lotes.

Su relevancia actual reside en que ofrece una vía de inferencia mucho más barata y predecible que la generación de texto para decisiones estructuradas: según el autor, alcanza 68,76 en el Decision Index 0.3.1 con una latencia mediana de 38,6 ms por petición en una RTX PRO 6000, y admite contextos de hasta 40.000 tokens por pregunta. La licencia es `fastino-community` (código abierto con condiciones), y el modelo también se ofrece a través de la API alojada de Fastino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.5 (`qwen3_5_text`) con capas de atención lineal y cabezal de decisión de 255 vías |
| Parametros totales | 7.936.684.544 (7,94 B); de ellos 1.017 M corresponden a embeddings de tokens y 1,04 M al readout de decisión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado, pregunta y opciones) por defecto |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (licencia "other" con nombre propio; enlace en el repo) |
| Formato de pesos | safetensors (bf16, 15,90 GB en disco) |

## Arquitectura y entrenamiento

GLiDE-9B es un transformer de 7,94 B parámetros construido sobre la arquitectura Qwen 3.5 en su variante de texto (`qwen3_5_text`), sin codificador de visión: las peticiones con imágenes se rechazan explícitamente. Incorpora capas de atención lineal que, con el paquete opcional `flash-linear-attention==0.5.2`, disponen de kernels rápidos; sin él, transformers cae a una implementación PyTorch mucho más lenta que no forma parte de la validación del autor. El modelo añade un cabezal de lectura de decisión de 255 vías (1,04 M parámetros) que convierte el estado oculto en probabilidades sobre las opciones de cada pregunta tipada.

El funcionamiento es de un solo forward pass por pregunta: todas las preguntas de una petición, y las de peticiones concurrentes, se puntúan juntas en micro-lotes, sin generación autoregresiva (el resultado del ejemplo reporta `output_tokens: 0`). El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; tampoco se detalla el proceso de alineación. La validación se realizó con Python 3.12, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0` y `transformers==5.17.0`.

## Capacidades

- Decisiones tipadas: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados, con nivel esperado y confianza).
- Probabilidades completas por opción, leídas de un readout de 255 vías; no hay texto generado.
- Entrada de estado en texto plano o en cualquier valor JSON (por ejemplo, tickets con metadatos).
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones juntas y devuelve un resultado o un `RequestError` por petición.
- Contexto largo de hasta 40.000 tokens por pregunta (estado, pregunta y opciones).
- Interfaz Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`), además de endpoint `/health`.
- Sin capacidades de visión, audio ni tool calling: el modelo no genera ni ejecuta acciones, solo puntúa opciones.
- Multilingüismo: no documentado en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y metadatos (por ejemplo, `customer_tier`) como estado JSON y devuelve la intención (`refund`, `cancel`, `track`, `other`) con probabilidades, como muestra el ejemplo de la model card con 316 tokens de entrada.
- Enrutamiento de peticiones en pipelines de agentes: con la decisión `choice` se puede dirigir cada consulta al subagente o herramienta adecuada, usando la confianza devuelta para decidir si se escala a revisión humana.
- Priorización y triaje: la decisión `score` con niveles ordenados (`low`, `medium`, `high`) y nivel esperado permite ordenar colas de trabajo con un único forward pass y latencia de decenas de milisegundos.
- Moderación y filtrado binario: la decisión `noul` devuelve P(sí) para preguntas como "¿debe escalarse este caso hoy?", útil para umbrales configurables en producción.
- Puntuación de candidatos en ranking: dado un estado y una pregunta `score`, el modelo asigna niveles ordenados a cada candidato, integrándose en sistemas de recomendación o búsqueda.
- Evaluación automática de salidas: clasificar respuestas de otro modelo como correctas/incorrectas o por calidad con probabilidades calibradas, aprovechando que no genera texto y es determinista en coste.
- Despliegue local en servidor propio: con 15,88 GB de VRAM tras la carga y 18,92 GB de pico, cabe en GPUs profesionales de 24 GB o más y se sirve con el servidor HTTP incluido (`uvicorn glide.server:app`).

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 68,76 | Medido con el kit oficial en una RTX PRO 6000, pesos bf16 |
| Latencia mediana por petición | 38,6 ms | RTX PRO 6000 Blackwell Server Edition (96 GB), con `flash-linear-attention` instalado |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: 15,88 GB tras la carga en bf16; 18,92 GB de pico con la mezcla de peticiones de la prueba de latencia.
- GPU probada: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- GPU recomendadas: cualquier GPU con al menos 24 GB de VRAM para bf16 con margen (RTX 3090/4090, L4, A10G, A100, H100); no se documentan versiones cuantizadas para GPUs de consumo con menos memoria.
- Tiempo de carga: 6 s desde almacenamiento en red; los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host.
- Despliegue: API Python (`glide.Glide`), servidor HTTP incluido (`uvicorn glide.server:app` o `python -m glide.server`), y API alojada de Fastino (`POST https://api.fastino.ai/v1/systemone`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Software: Python 3.12, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0`, `transformers==5.17.0`; `flash-linear-attention==0.5.2` opcional pero recomendado (sin él, la atención lineal usa una ruta PyTorch mucho más lenta no validada). El aviso de `causal_conv1d` no instalado es esperado.
- Throughput: no disponible; solo se publica la latencia mediana por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-9B (Fastino) | 7,94 B | 40.000 tokens por pregunta | Modelo de decisión (probabilidades, sin generación) | `fastino-community` | Pesos en Hugging Face y API alojada |
| LLM generativos de ~8 B (p. ej. familia Llama 3.1 8B, Qwen 2.5 7B) | ~7-8 B | 32.000-128.000 tokens | Generación de texto; clasificación vía prompting | Licencias abiertas habituales | Pesos y múltiples proveedores |
| Clasificadores dedicados (BERT-large, DeBERTa) | ~0,3-0,4 B | 512 tokens típicamente | Clasificación supervisada por tarea | MIT/Apache en su mayoría | Pesos en Hugging Face |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada; la comparación se limita a parámetros, contexto y enfoque.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; solo puntúa opciones predefinidas.
- Sin visión: las peticiones con imágenes se rechazan explícitamente.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está validado en la información disponible.
- La licencia `fastino-community` es una licencia "other" con condiciones propias; es imprescindible revisar el enlace de licencia antes de un uso comercial.
- El modelo está pensado para usarse con `flash-linear-attention`; sin ese paquete la inferencia es mucho más lenta y no forma parte de la validación del autor.
- Solo se ha validado en una GPU (RTX PRO 6000 Blackwell); el rendimiento en otras GPUs no está documentado.
- Riesgo de calibración: las probabilidades devueltas dependen de la formulación de las preguntas y opciones; conviene validar umbrales de confianza en el dominio de producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- El ecosistema de despliegue es limitado (API Python y servidor HTTP propios); no hay soporte documentado para vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-9B
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
