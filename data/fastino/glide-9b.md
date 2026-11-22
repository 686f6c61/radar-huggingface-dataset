# fastino/GLiDE-9B

## Resumen

GLiDE-9B es un modelo de decisión desarrollado por Fastino Labs que, a diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto plano o JSON) junto con una o varias preguntas tipadas y devuelve una distribución de probabilidad sobre las opciones de cada pregunta en un único forward pass. Está construido sobre una arquitectura híbrida de atención lineal y transformer (tag `qwen3_5_text`), con 7.936.684.544 parámetros totales en bf16 y una cabeza de lectura de decisión de 255 vías.

El modelo resuelve el problema de la clasificación, el enrutamiento y el scoring de baja latencia en pipelines de producción: en lugar de generar cadenas de razonamiento token a token, puntúa todas las opciones simultáneamente y devuelve probabilidades calibradas. Según la model card, alcanza 68,77 en el Decision Index 0.3.1 con una latencia mediana de 38,6 ms por petición sobre una RTX PRO 6000.

Es relevante ahora porque propone un paradigma alternativo al de los LLM generativos para tareas de decisión: destilado de profesores de razonamiento, sin generación autoregresiva, con soporte de contextos de hasta 40.000 tokens por pregunta y una API HTTP compatible con el formato System One. La licencia es `fastino-community`, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + atención lineal (tag `qwen3_5_text`), con cabeza de decisión de 255 vías |
| Parámetros totales | 7.936.684.544 (7,94 B; incluye 1.017 M en embeddings de tokens y 1,04 M en el readout de decisión) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.000 tokens por prompt de pregunta (estado + pregunta + opciones) por defecto |
| Tipos de cuantización | No disponible (los pesos publicados son bf16) |
| Idiomas soportados | No disponible |
| Licencia | `fastino-community` (license: other) |
| Formato de pesos | safetensors (bf16, 15,90 GB en disco) |

## Arquitectura y entrenamiento

GLiDE-9B combina capas de atención lineal con capas transformer clásicas; el tag `qwen3_5_text` sugiere una base derivada de la familia Qwen 3.5 en su variante de texto. Sobre esa base se añade una cabeza de lectura de decisión de 255 vías que produce, para cada pregunta, una distribución de probabilidad sobre las opciones tipadas (`choice`, `noul`, `score`). No hay decodificación autoregresiva: cada pregunta se resuelve en un único forward pass, y las preguntas de una misma petición (y de peticiones concurrentes) se agrupan en micro-lotes para puntuarse conjuntamente.

Según el paper asociado (arXiv:2611.26509), el modelo se destila de profesores de razonamiento, lo que explica que herede capacidades de decisión calibrada sin generar cadenas de pensamiento en inferencia. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos deben consultarse en el paper. La innovación técnica destacable es el readout de 255 opciones con probabilidades calibradas y la latencia de 38,6 ms por petición en una RTX PRO 6000, medida con el kit oficial del Decision Index 0.3.1.

## Capacidades

- Clasificación tipada: preguntas `choice` con hasta 255 opciones nombradas, devolviendo la probabilidad de cada una.
- Preguntas booleanas (`noul`): devuelve P(yes) para decisiones binarias.
- Scoring ordenado (`score`): niveles ordenados con nivel esperado y distribución de probabilidad por nivel.
- Entrada multimodal de datos estructurados: acepta estado como cadena de texto o cualquier valor JSON.
- Procesamiento por lotes: `decide_batch` puntúa varias peticiones juntas y devuelve una respuesta (o un `RequestError`) por petición.
- Contexto largo: hasta 40.000 tokens por prompt de pregunta.
- Servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Sin capacidades generativas: no produce texto libre, no hay tool calling ni razonamiento multi-paso explícito.
- Sin visión: el modelo no tiene encoder visual y rechaza peticiones con imágenes.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un ticket en JSON con metadatos del cliente, se lanzan preguntas `choice` para intención y `score` para prioridad en un solo forward pass, con latencia de decenas de milisegundos, adecuado para clasificación en línea a gran volumen.
- Moderación de contenido: preguntas `noul` y `choice` sobre el texto del usuario para decidir si se bloquea, se revisa o se permite, con probabilidades calibradas que permiten fijar umbrales de forma explícita.
- Scoring de leads y riesgo: preguntas `score` sobre registros JSON (historial, importe, sector) para asignar niveles ordenados con nivel esperado, útil en scoring crediticio o priorización comercial.
- Enrutamiento de consultas en pipelines RAG: decidir a qué índice, herramienta o agente derivar una consulta entrante mediante preguntas `choice` sobre el texto de la consulta y el contexto de sesión.
- Clasificación de documentos largos: gracias a los 40.000 tokens de contexto por pregunta, se pueden clasificar contratos, informes o hilos de correo completos sin trocear.
- Triaje en atención al cliente: combinar en una sola petición preguntas de intención, urgencia y sentimiento sobre la conversación, agrupadas en micro-lotes para reducir coste por consulta.
- Control de calidad y etiquetado: generar probabilidades por opción para anotación asistida y auditoría de datasets, con distribuciones completas en lugar de una única etiqueta.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 68,77 | Medido con el kit oficial en una RTX PRO 6000 |
| Latencia mediana por petición | 38,6 ms | RTX PRO 6000, bf16, con `flash-linear-attention` instalado |
| VRAM tras carga | 15,88 GB | Pesos bf16 en GPU |
| VRAM pico | 18,92 GB | Sobre peticiones mixtas del test de latencia |
| Tiempo de carga | 6 s | Desde almacenamiento en red |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo; el autor solo reporta el Decision Index propio.

## Requisitos de hardware

- VRAM estimada: 15,88 GB tras la carga en bf16; 18,92 GB de pico con peticiones mixtas. No se documentan cuantizaciones alternativas, por lo que no hay estimaciones para 8 o 4 bits.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), la única validada por el autor. Por el uso de memoria, cabría en GPUs de 24 GB o más, aunque no está validado oficialmente.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) por el uso de VRAM reportado, aunque el autor no lo ha validado.
- Despliegue: paquete Python `glide` con `transformers==5.17.0`, `torch==2.14.0` (CUDA 13.0), `triton==3.8.0` y `flash-linear-attention==0.5.2` (opcional pero recomendado; sin él la atención lineal cae a una implementación PyTorch mucho más lenta). Servidor HTTP propio con formato System One. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 38,6 ms de mediana por petición en RTX PRO 6000; el procesamiento por micro-lotes de peticiones concurrentes mejora el throughput agregado, aunque no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE-9B | 7,94 B | 40.000 tokens por pregunta | Decisión tipada con probabilidades, sin generación | `fastino-community` | Pesos en HF + API alojada |
| LLM generativos de ~8 B (p. ej. familia Llama 3.1 8B) | ~8 B | 128.000 tokens | Generación autoregresiva; clasificación vía prompting | Licencias comunitarias propias | Pesos en HF, amplio ecosistema |
| Modelos de clasificación tipo encoders (p. ej. DeBERTa-v3) | ~0,1-0,4 B | 512 tokens típicamente | Clasificación supervisada por tarea | MIT / Apache 2.0 habitual | Pesos en HF |

La comparación con modelos generativos es cualitativa: GLiDE no genera texto y no compite en benchmarks generativos, sino en latencia y calibración para tareas de decisión. No se dispone de datos públicos que permitan comparar el Decision Index con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para chat, resumen o generación de código.
- Sin capacidades de visión: rechaza peticiones con imágenes.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe más allá de lo que reporte el paper.
- Riesgo de calibración: las probabilidades son calibradas según el autor, pero dependen de la formulación de las instrucciones y criterios; conviene validar umbrales en el dominio de producción.
- Licencia `fastino-community` (license: other): es necesario revisar el texto de la licencia antes de cualquier uso comercial; no es una licencia open source estándar.
- Dependencias muy específicas (`transformers==5.17.0`, `torch==2.14.0`, CUDA 13.0) que pueden complicar la integración en stacks existentes.
- Sin cuantizaciones publicadas: el despliegue en GPUs de menor VRAM no está validado y puede degradar la calibración.
- El rendimiento solo está validado en una RTX PRO 6000; no hay datos de latencia en otras GPU.
- El Decision Index es un benchmark propio del autor; no hay comparación independiente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE-9B
- Paper: https://arxiv.org/abs/2611.26509
- Licencia: https://huggingface.co/fastino/GLiDE-9B/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API de inferencia: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
