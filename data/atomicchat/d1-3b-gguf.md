# AtomicChat/d1-3B-GGUF

## Resumen

AtomicChat/d1-3B-GGUF es un repositorio de cuantizaciones GGUF del modelo de decisión LiquidAI/d1-3B, publicado por AtomicChat para su uso con llama.cpp y herramientas compatibles. El modelo base, desarrollado por Liquid AI, no es un generador de texto al uso: recibe un estado (por ejemplo, un texto o un contexto) y responde preguntas tipadas en un único forward pass, con tres formatos de salida posibles: sí/no, elección entre opciones nombradas o una puntuación. La respuesta se lee directamente de la distribución de probabilidad del modelo sobre los tokens de cada opción, por lo que no se genera texto libre.

Con unos 2.697.198.592 parámetros (aproximadamente 2,7 B) y arquitectura de la familia LFM2 de Liquid AI, el modelo está pensado para tareas de decisión y clasificación dentro de pipelines de agentes, donde se necesita latencia baja y salidas calibradas en lugar de generación abierta. La relevancia de este repositorio concreto es que AtomicChat no se limita a aplicar los presets estándar de llama.cpp: usa una matriz de importancia propia y una estrategia de cuantización por tensor denominada "Atomic Dynamic" (AD-), y publica métricas de fidelidad frente a los pesos BF16 originales medidas sobre 1.285 decisiones reales, no solo sobre perplejidad de texto.

Además, el repositorio documenta un episodio relevante para quien evalúe el modelo: Liquid AI publicó sus propios GGUF el 6 de octubre y los retiró el 7 de octubre tras actualizar los pesos, y las cuantizaciones de AtomicChat están convertidas desde los pesos actuales. Según sus mediciones, los ficheros de 4 bits de AtomicChat mantienen mejor la calibración de probabilidades que los de Liquid, con un tamaño ligeramente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 de Liquid AI (etiquetada como lfm2.5 en los metadatos del cuantizador y reconocida como `lfm2-d1` en llama.cpp). Detalle interno de capas no disponible |
| Parametros totales | 2.697.198.592 (~2,7 B), dato de los safetensors del modelo base |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS (todos GGUF); proyectores de vision `mmproj-d1-3B-BF16` y `mmproj-d1-3B-Q8_0` |
| Idiomas soportados | no disponible en la ficha del repositorio; el banco de evaluacion del cuantizador usa textos de 30 idiomas y codigo fuente |
| Licencia | lfm1.0 (Liquid Foundation Model License 1.0), declarada en HuggingFace como `other` con `license_name: lfm1.0` |
| Formato de pesos | GGUF para llama.cpp; el modelo base se distribuye en safetensors. Tamano total del repositorio: 17,2 GB |

## Arquitectura y entrenamiento

El modelo base d1-3B pertenece a la familia LFM2 de Liquid AI, segun los metadatos del propio cuantizador (tags `lfm2.5` y `liquid`) y la denominacion del tipo de modelo en llama.cpp (`lfm2.decision.type = d1`, soportado upstream como `lfm2-d1`). Se trata de un modelo denso de aproximadamente 2,7 B de parametros especializado en decisión: no produce texto token a token, sino que puntua opciones discretas a partir de su distribución interna. La información disponible no detalla el número de capas, la composición exacta del dataset de entrenamiento, ni si se aplicaron etapas de RLHF o DPO.

Lo que sí documenta el repositorio es el proceso de cuantización, que constituye la aportación técnica principal de esta ficha. AtomicChat genera los ficheros con una matriz de importancia propia (imatrix) y aplica una política de precisión por tensor llamada Atomic Dynamic: la tabla de tokens, que d1-3B usa también como cabeza de salida, nunca baja de Q6_K; las capas de atención se mantienen en Q8_0 o Q6_K; y `ffn_down` recibe un escalón más de precisión en los cuatro primeros y los cuatro últimos bloques respecto a los bloques centrales. El objetivo es preservar la calibración de las probabilidades de opción, que es precisamente la señal que consume un modelo de decisión.

## Capacidades

- Decision binaria: responde preguntas de sí/no leyendo la distribución sobre los tokens correspondientes, sin generar texto intermedio.
- Elección entre opciones nombradas: selecciona una opción de un conjunto definido por el usuario y devuelve su probabilidad.
- Puntuación: asigna un valor numérico o una puntuación calibrada sobre un estado de entrada.
- Clasificación: etiquetado de textos dentro de taxonomías predefinidas (tags `classification` y `decision`).
- Modo "system-one": decisiones en un único forward pass, sin cadena de pensamiento ni decodificación iterativa.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, con proyectores multimodales `mmproj-d1-3B-BF16` y `mmproj-d1-3B-Q8_0`. El autor advierte que no midió las decisiones sobre imágenes.
- Compatible con endpoints: el repositorio lleva el tag `endpoints_compatible`.
- Soporte de tool calling, agentes multi-paso o razonamiento extendido: no descrito en la información disponible para este modelo (su diseño es el opuesto, decisiones de un solo paso).

## Casos de uso

- Enrutamiento en sistemas multiagente: dado el mensaje del usuario, el modelo decide en una sola pasada a qué herramienta o subagente derivarlo. Su latencia de un único forward pass y su salida como opción puntuada lo hacen adecuado para routers que se ejecutan en cada turno de conversación.
- Barandillas de seguridad y moderación: clasifica si una entrada cumple o no una política concreta (sí/no), con probabilidad asociada, lo que permite fijar umbrales y derivar casos dudosos a revisión humana.
- Puntuación de relevancia en RAG: evalúa si un fragmento recuperado responde realmente a la consulta y devuelve una puntuación que se puede usar para reordenar o descartar documentos antes de pasarlos a un modelo generativo.
- Validación de salidas estructuradas: comprobar si el resultado de un LLM generativo satisface una condición declarada, actuando como verificador barato dentro de un pipeline de generación y validación.
- Clasificación de tickets y correo entrante: asignación de categoría o prioridad sobre textos en varios idiomas, aprovechando que la evaluación del cuantizador cubre 30 idiomas y código fuente (aunque el autor no publica la lista oficial de idiomas soportados).
- Decisión multimodal con el proyector `mmproj`: cuando se necesita una decisión del tipo "¿esta imagen cumple el criterio X?" sin generar descripción. El autor advierte que no midió la fidelidad de las decisiones sobre imágenes, por lo que requiere validación propia.
- Control de calidad sobre código: al incluir código fuente en su banco de evaluación, puede emplearse para decidir si un parche o una respuesta de código satisface un criterio binario antes de integrarlo en un pipeline de CI/CD.
- Despliegue en el borde o en portátil: con ficheros de entre 1,5 y 2,9 GB, cabe en GPUs de consumo y en CPU, lo que permite ejecutar decisiones locales sin enviar datos a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí publica AtomicChat es una evaluación de fidelidad de la cuantización frente a los pesos BF16, medida sobre 1.285 decisiones (preguntas de sí/no, de elección y de puntuación, sobre textos reservados en 30 idiomas y código fuente).

| Fichero | Tamano en disco | Misma respuesta que BF16 | Deriva de opciones | KLD | top-1 |
|---|---:|---:|---:|---:|---:|
| `BF16` | 5.403 MB | referencia | 0 | 0 | 100% |
| `Q8_0` | 2.875 MB | 99,3% (9) | 0,0033 | 0,0010 | 98,28% |
| `AD-Q6_K` | 2.348 MB | 99,1% (11) | 0,0053 | 0,0022 | 97,41% |
| `AD-Q5_K_M` | 1.953 MB | 98,1% (25) | 0,0112 | 0,0080 | 95,09% |
| `AD-Q4_K_M` | 1.658 MB | 97,1% (37) | 0,0178 | 0,0244 | 91,54% |
| `AD-IQ4_XS` | 1.570 MB | 95,6% (57) | 0,0203 | 0,0283 | 90,92% |

El número entre paréntesis es el recuento de respuestas que cambian respecto a BF16. La columna "deriva de opciones" es la distancia de variación total media entre las probabilidades de opción del fichero y las del original.

Comparación con los GGUF que Liquid AI publicó el 6 de octubre y retiró el 7 de octubre (medidos por AtomicChat el mismo 7 de octubre, antes de la retirada, contra la misma referencia BF16):

| Fichero | Tamano | Misma respuesta | Deriva de opciones | KLD | top-1 |
|---|---:|---:|---:|---:|---:|
| Liquid `BF16` | 5.403 MB | 96,7% (43) | 0,0331 | 0,0212 | 92,40% |
| Liquid `Q8_0` | 2.875 MB | 97,0% (39) | 0,0334 | 0,0219 | 92,25% |
| AtomicChat `AD-Q4_K_M` | 1.658 MB | 97,1% (37) | 0,0178 | 0,0244 | 91,54% |
| Liquid `Q4_K_M` | 1.674 MB | 94,9% (66) | 0,0387 | 0,0568 | 87,32% |

Aislando el efecto de la cuantización (cada fichero comparado contra su propia base BF16), AtomicChat reporta 37 respuestas cambiadas y una KL de opción de 0,0024 para su `AD-Q4_K_M`, frente a 37 respuestas y 0,0044 de KL para el `Q4_K_M` de Liquid. Es decir, mismo número de respuestas alteradas pero menor desplazamiento de las probabilidades, con un fichero ligeramente más pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero más sobrecarga de contexto y caché KV, que no está documentada): BF16 en torno a 6-7 GB; Q8_0 en torno a 3,5-4 GB; AD-Q6_K en torno a 3 GB; AD-Q5_K_M en torno a 2,5 GB; AD-Q4_K_M en torno a 2-2,5 GB; AD-IQ4_XS en torno a 2 GB.
- El modelo completo, con 2,7 B de parámetros, cabe holgadamente en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) incluso en BF16, y en la mayoría de iGPUs y CPU en cuantizaciones de 4 bits.
- Para uso multimodal hay que sumar el proyector `mmproj` (`mmproj-d1-3B-BF16` o `mmproj-d1-3B-Q8_0`), cuyo tamaño no se detalla en la información disponible.
- Opciones de despliegue: llama.cpp es el runtime de referencia, dado que el repositorio es GGUF y el autor publica ficheros adaptados a los presets de ese proyecto. No se mencionan vLLM, TGI u Ollama en la información disponible; la compatibilidad con LM Studio u otros frontales GGUF no se confirma.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de decisión de un solo forward pass y no de generación autoregresiva, la latencia esperada es sensiblemente inferior a la de un modelo generativo del mismo tamaño, pero no se publican medidas.
- Nota crítica de compatibilidad: los GGUF publicados por Liquid AI no cargaban en llama.cpp estándar porque incluían `lfm2.decision.type = d1`, desconocido en ese momento (commit `18b5f8b`, error `unsupported decision model type: d1`). El soporte upstream llega con el PR ggml-org/llama.cpp#30110, que añade d1-3B bajo el tipo `lfm2-d1`. Conviene verificar que la versión de llama.cpp instalada incluye ese soporte antes de desplegar.

## Comparativa con modelos similares

En la información proporcionada no aparecen otros modelos de decisión comparables de terceros (pesos, contexto, licencia o rendimiento), por lo que la comparativa se limita a las variantes del propio d1-3B.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Fidelidad (misma respuesta que la referencia BF16 actual) |
|---|---|---|---|---|---|---|
| LiquidAI/d1-3B (base) | ~2,7 B | no disponible | safetensors | lfm1.0 | publicado | referencia |
| AtomicChat `AD-Q4_K_M` (este repo) | ~2,7 B | no disponible | GGUF | lfm1.0 | publicado | 97,1% (37 respuestas cambiadas) |
| Liquid `Q4_K_M` (retirado) | ~2,7 B | no disponible | GGUF | lfm1.0 | retirado el 7 de octubre, construido sobre pesos antiguos | 94,9% (66 respuestas cambiadas) |
| Otros modelos de decision de 3 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve una decisión o una puntuación entre opciones predefinidas. No debe usarse como chatbot ni para redacción libre.
- El riesgo de alucinación en el sentido clásico es bajo, porque la respuesta se lee de un conjunto cerrado de tokens, pero sí existe riesgo de calibración incorrecta: una probabilidad alta no garantiza que la decisión sea correcta. El autor publica la deriva de probabilidades frente a BF16 precisamente porque esa calibración es la señal de uso.
- El fabricante no midió las decisiones sobre imágenes. El pipeline `image-text-to-text` y los proyectores `mmproj` están disponibles, pero su fidelidad en tareas de decisión multimodales no está validada.
- Lista oficial de idiomas soportados no disponible. El banco de evaluación cubre 30 idiomas y código fuente, pero eso es la composición de un conjunto de prueba, no una garantía de cobertura.
- Licencia lfm1.0 (Liquid Foundation Model License 1.0), declarada como `other` en HuggingFace. Conviene revisar el texto completo de la licencia antes de cualquier uso comercial, ya que las condiciones de la familia LFM no son equivalentes a las de una licencia Apache o MIT.
- Dependencia del soporte de llama.cpp: hasta que el PR ggml-org/llama.cpp#30110 esté integrado en una versión estable, los ficheros pueden no cargar en binarios antiguos.
- Los GGUF de Liquid AI para este modelo fueron retirados; si se conserva una copia antigua, procede de una versión previa de los pesos y no es comparable con la actual. Cada capa lineal difiere en un 2-3% relativo respecto a `model.safetensors` actual.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validación de la comunidad sobre estos ficheros más allá de las métricas publicadas por el propio autor en el repositorio de métricas.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta para concatenar estados largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/d1-3B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Repositorio de metricas y logs del cuantizador: https://huggingface.co/datasets/AtomicChat/d1-3B-GGUF-metrics
- Discusion sobre los nuevos pesos del modelo base (PR #4): https://huggingface.co/LiquidAI/d1-3B/discussions/4
- PR de soporte upstream en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30110
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Sitio de Atomic Chat: https://atomic.chat/
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
