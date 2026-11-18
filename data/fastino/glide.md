# fastino/GLiDE

## Resumen

GLiDE 27B es un modelo de decisión desarrollado por Fastino Labs que, en lugar de generar texto, devuelve probabilidades calibradas para cada opción de una o varias preguntas tipadas a partir de un estado de entrada (texto, JSON e imágenes opcionales). Se apoya en una arquitectura derivada de la familia Qwen 3.5 (etiqueta `qwen3_5` en el Hub) con capas de atención lineal, un codificador visual y una cabeza de lectura de decisión de 255 vías. Con 26.085.330.160 parámetros reales en safetensors (27B nominales), está pensado para tareas de clasificación, enrutamiento y puntuación donde se necesita una distribución de probabilidad explícita y no una salida en lenguaje natural.

El modelo resuelve el problema de convertir un LLM generativo en un clasificador fiable: en lugar de pedir a un modelo que "responda" una etiqueta y parsear la salida, GLiDE ejecuta un único forward pass por pregunta y lee directamente las probabilidades de un vocabulario de decisión acotado. Soporta tres tipos de pregunta (`choice` con hasta 255 opciones nombradas, `noul` con P(sí) y `score` con niveles ordenados), contextos de hasta 40.000 tokens por prompt y estados multimodales.

Es relevante ahora porque ofrece una alternativa determinista y de baja latencia (112 ms de mediana por petición en una RTX PRO 6000) frente al coste y la variabilidad de los LLM generativos en pipelines de decisión, con pesos abiertos en bf16 y una licencia comunitaria propia (`fastino-community`) que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.5 (`qwen3_5`) con capas de atención lineal, codificador visual y cabeza de lectura de decisión de 255 vías |
| Parametros totales | 26.085.330.160 (27B nominales) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (estado, pregunta, opciones y tokens de imagen) por defecto |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | `fastino-community` (licencia propia, enlazada en el repositorio) |
| Formato de pesos | safetensors (bf16); 52,2 GB en disco: 51,2 GB de modelo de lenguaje, 0,92 GB de codificador visual, 2,6 MB de readout |

## Arquitectura y entrenamiento

GLiDE 27B parte de una arquitectura transformer de la familia Qwen 3.5, con capas de atención lineal que aprovechan el paquete opcional `flash-linear-attention` (versión 0.5.2) para kernels rápidos; sin ese paquete, transformers cae a una implementación PyTorch mucho más lenta que el autor no incluyó en la validación. Sobre el cuerpo del modelo de lenguaje se añade un codificador visual de 0,92 GB para estados multimodales y una cabeza de lectura de decisión de 255 vías (2,6 MB) que produce la distribución sobre opciones. La inferencia es de un solo forward pass por pregunta, sin generación autoregresiva, con las preguntas de una petición y de peticiones concurrentes agrupadas en micro-lotes.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Tampoco se detalla el procedimiento de construcción de la cabeza de decisión ni cómo se calibraron las probabilidades. La innovación técnica destacable es el propio paradigma de "decisión en un forward pass": salida probabilística tipada, contexto largo de 40.000 tokens por pregunta y soporte nativo de texto, JSON e imágenes en el estado de entrada.

## Capacidades

- Decisión tipada con tres formatos de pregunta: `choice` (una entre hasta 255 opciones nombradas), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados con nivel esperado).
- Salida de probabilidades para todas las opciones de todas las preguntas de una petición, con campo de confianza por respuesta.
- Procesamiento de estados heterogéneos: cadenas de texto, cualquier valor JSON y listas de partes de texto e imagen.
- Entrada multimodal: imágenes en formato PIL, rutas de fichero, bytes, cadenas base64 o data URLs.
- Contexto largo de hasta 40.000 tokens por prompt de pregunta.
- Interfaz Python (`glide.Glide`) y servidor HTTP compatible con el formato System One (`POST /v1/systemone`).
- Compatibilidad con endpoints del Hub (`endpoints_compatible`).
- No genera texto: `output_tokens` es siempre 0 en las respuestas.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo está orientado a puntuar decisiones dentro de un pipeline externo.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y metadatos en JSON y devuelve la intención (`choice`), la urgencia (`noul`) y la prioridad (`score`) en una sola llamada, como muestra el ejemplo de la model card con una confianza de 0,96 en la intención de reembolso.
- Enrutamiento de peticiones en producción: dado un prompt de usuario, decidir a qué modelo, herramienta o cola derivarlo usando preguntas `choice` con las rutas disponibles como criterios, aprovechando la latencia mediana de 112 ms por petición.
- Moderación y políticas de contenido: puntuar un texto o una imagen contra un conjunto de criterios ordenados (`score`) para asignar niveles de riesgo, con distribución de probabilidad auditable en lugar de una etiqueta opaca.
- Control de calidad multimodal: clasificar fotos de catálogo o capturas de pantalla con preguntas sobre color, forma o presencia de elementos, combinando el codificador visual con preguntas `noul` y `choice`.
- Extracción de señales para ranking y scoring: usar la salida probabilística como feature numérica en sistemas de recomendación, scoring de leads o priorización de colas, donde interesa la calibración y no el texto.
- Automatización de revisiones documentales: con estados JSON largos (hasta 40.000 tokens) y varias preguntas simultáneas, evaluar contratos o formularios contra criterios tipados y devolver probabilidades por criterio.
- Guardrails en agentes: insertar GLiDE como paso de decisión antes de ejecutar una acción (por ejemplo, "¿debe escalarse esta conversación?") con una latencia y un coste inferiores a los de un LLM generativo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto de medida |
|---|---|---|
| Decision Index 0.3.1 (suite pública) | 72,49 | Kit oficial, una RTX PRO 6000, pesos y cómputo en bf16 |
| Latencia mediana por petición | 112 ms | RTX PRO 6000, muestra de 750 peticiones |
| Memoria GPU tras carga | 52,2 GB | Pesos bf16 en una GPU de 96 GB |
| Memoria GPU pico | 56,4 GB | Durante la muestra de latencia de 750 peticiones |
| Tiempo de carga | 10 s | Desde caché local en caliente |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: 52,2 GB tras la carga en bf16; 56,4 GB de pico medido durante la muestra de latencia.
- GPU recomendada: una GPU con 80 GB o más. El autor validó con NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- No cabe en GPU de consumo convencional (RTX 4090 de 24 GB, RTX 5090 de 32 GB) en bf16; no se documentan cuantizaciones que reduzcan el requisito.
- Despliegue: API Python del paquete `glide/` incluido en el repositorio y servidor HTTP propio compatible con el formato System One (`POST /v1/systemone`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Dependencias validadas: Python 3.12, `torch==2.14.0`, `transformers==5.17.0` y `flash-linear-attention==0.5.2` (opcional pero recomendado; sin él la implementación PyTorch es mucho más lenta y no forma parte de la validación).
- Latencia y throughput: 112 ms de mediana por petición en RTX PRO 6000; el procesamiento por micro-lotes agrupa preguntas y peticiones concurrentes, aunque no se publica el throughput agregado.
- La preprocesación de imágenes se ejecuta en CPU y los pesos se copian a la GPU tensor a tensor, manteniendo bajo el uso de memoria host durante la carga.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para enfrentar GLiDE 27B con alternativas de la misma categoría. La tabla recoge únicamente los datos verificables del modelo y deja las alternativas como no disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiDE 27B (Fastino) | 26,09B | 40.000 tokens por pregunta | Modelo de decisión probabilístico, texto/JSON/imagen | `fastino-community` | Pesos en Hugging Face y API alojada |
| Alternativa generativa de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa clasificadora especializada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento en lenguaje natural; solo devuelve probabilidades sobre opciones predefinidas.
- El número máximo de opciones por pregunta `choice` es 255; las decisiones que requieran un espacio de salida mayor deben descomponerse en varias preguntas.
- El contexto está acotado a 40.000 tokens por prompt de pregunta (estado, pregunta, opciones e imagen incluidas); estados más largos requieren truncado o segmentación.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es desconocido y debe validarse empíricamente antes de desplegar en producción.
- No se publican datos sobre sesgos, tasa de alucinación ni calibración de las probabilidades fuera del kit oficial; la confianza devuelta debe tratarse con cautela hasta validarla en el dominio objetivo.
- La licencia `fastino-community` es propia y no equivale a Apache 2.0 ni MIT; es imprescindible revisar el fichero LICENSE del repositorio para confirmar las restricciones de uso comercial.
- El requisito de una GPU de 80 GB o más limita el despliegue a infraestructura de servidor; no hay cuantizaciones publicadas para hardware de consumo.
- El rendimiento depende de `flash-linear-attention==0.5.2`; sin ese paquete la inferencia es mucho más lenta y queda fuera de la validación del autor.
- El mensaje de aviso sobre `causal_conv1d` no instalado al cargar es esperado según el autor y no debe interpretarse como un error de configuración.
- Las cifras de latencia y memoria proceden de una única GPU (RTX PRO 6000) y pueden no extrapolarse a otros aceleradores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiDE
- Licencia: https://huggingface.co/fastino/GLiDE/blob/main/LICENSE
- Sitio de Fastino: https://fastino.ai
- Documentación de la API de inferencia (System One): https://docs.fastino.ai/inference/systemone
- Guía de inicio rápido de la API: https://docs.fastino.ai/quickstart
- Alta y clave de API: https://agent.fastino.ai
