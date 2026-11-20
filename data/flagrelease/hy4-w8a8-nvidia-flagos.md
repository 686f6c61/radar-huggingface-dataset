# FlagRelease/Hy4-W8A8-nvidia-FlagOS

## Resumen

Hy4 es un modelo multimodal de gran escala desarrollado por Tencent Hunyuan, orientado a escenarios de productividad real. Esta ficha cubre la variante `FlagRelease/Hy4-W8A8-nvidia-FlagOS`, una cuantización W8A8 de 8 bits generada por la comunidad FlagOS sobre el modelo oficial Hy4, adaptada para su despliegue en plataformas NVIDIA (y, según el autor, también en otros aceleradores). El modelo combina percepción visual, razonamiento y uso de herramientas, con capacidades nuevas respecto a la versión preview: comprensión de imágenes y operación de ordenador.

La arquitectura declarada en los tags es `hy_v4_vl` (modelo de lenguaje multimodal con torre visual), con 774.434.002.142 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de ~774B. El repositorio ocupa 789,6 GB y los pesos se distribuyen en formato safetensors con cuantización de 8 bits mediante `compressed-tensors`.

La relevancia de esta variante es doble: por un lado, demuestra la adaptación "Day-0" del modelo a nueve plataformas de chips distintas (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX); por otro, el autor reporta mejoras de hasta un 32,1% en throughput de salida y una reducción de hasta el 39,2% en latencia media por token frente a la solución nativa de NVIDIA en un despliegue de dos nodos con 16 GPU H100 y 64 peticiones concurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`hy_v4_vl`), con torre de visión y modelo de lenguaje |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), `eh_proj` mantenido en BF16; formato `compressed-tensors` |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (`compressed-tensors`, 8-bit) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `hy_v4_vl`, lo que indica un transformer multimodal con codificador visual acoplado a un modelo de lenguaje de gran tamaño. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se indica que la versión oficial de Hy4 amplía tanto el preentrenamiento como el postentrenamiento respecto a la preview, e incorpora por primera vez comprensión visual y capacidad de operación de ordenador.

La innovación técnica más destacable de esta variante no está en el modelo base sino en la pila de despliegue: FlagOS 2.2, que integra FlagGems, FlagGems-vLLM y vllm-plugin-FL, junto con FlagTree y optimizaciones a nivel de framework y de operador específicas para Hy4. La cuantización W8A8 conserva `eh_proj` en BF16 para preservar precisión en esa proyección. El despliegue de referencia usa dos nodos de ocho H100 80 GB HBM3 (16 GPU en total) con NCCL sobre InfiniBand. No se menciona decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes junto con texto para responder preguntas, interpretar gráficos y documentos visuales.
- Comprensión de imágenes y gráficos complejos: evaluación específica en ERQA, MMBench y MMStar.
- Operación de ordenador: capacidad declarada de manejar software profesional mediante interacción con interfaces.
- Uso de herramientas (tool calling): el modelo combina razonamiento con invocación de herramientas para tareas de múltiples pasos.
- Ejecución de tareas de horizonte largo: mejoras declaradas en seguimiento de instrucciones y tareas prolongadas.
- Investigación profunda (deep research): soporte para flujos de búsqueda y síntesis de información.
- Matemáticas: rendimiento alto reportado en MATH-500 (95,79 en la variante FlagOS).
- Idiomas: únicamente inglés según los metadatos.

## Casos de uso

- Desarrollo front-end y de videojuegos: el modelo puede interpretar capturas de interfaz y generar o modificar código asociado, apoyándose en su capacidad de operación de ordenador y tool calling para iterar sobre prototipos visuales.
- Automatización de software profesional: con Terminal-Bench 4.0 en 44,4 y AutomationBench v1.0.6 en 56,2, resulta adecuado para agentes que ejecutan comandos y manipulan aplicaciones de escritorio en flujos de trabajo automatizados.
- Análisis de documentación financiera: su comprensión de gráficos y tablas complejas permite extraer y razonar sobre informes financieros escaneados o en PDF con figuras.
- Investigación científica asistida: combinación de razonamiento matemático (MATH-500 95,79) y lectura de figuras para resumir literatura y verificar cálculos.
- Atención al cliente multimodal: puede gestionar conversaciones donde el usuario adjunta capturas de pantalla o imágenes de producto, aunque el contexto máximo no está documentado y conviene validarlo antes de producción.
- Despliegue en infraestructura heterogénea: gracias a la adaptación de FlagOS a nueve fabricantes de chips, encaja en entornos con Ascend, Hygon o Moore Threads donde no se dispone de NVIDIA, manteniendo un rendimiento por unidad de cómputo cercano o superior al nativo en algunos escenarios probados.
- Evaluación comparativa de cuantizaciones: útil como referencia para estudiar el impacto de W8A8 frente a BF16 en modelos de ~774B, dado que el autor publica métricas de consistencia (MATH-500, GPQA Diamond, MMBench, MMStar).

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor (dos configuraciones sobre H100):

| Metrica | Hy4-NVIDIA-Origin (H100) | Hy4-NVIDIA-FlagOS (H100) |
|---|---|---|
| Math-500 | 96,2 | 95,79 |
| GPQA Diamond | 93,65 | 92,06 |
| MMBench | 91,2 | 92,0 |
| MMStar | 79,67 | 80,6 |

Rendimiento de servicio (mediciones históricas de FlagOS, W8A8 con `eh_proj` en BF16, 16 H100, 64 peticiones concurrentes; el autor advierte que no corresponden al digest publicado):

| Entrada / salida (tokens) | Salida (tok/s) | Total (tok/s) | TTFT medio (ms) | P99 TTFT (ms) | TPOT medio (ms) |
|---|---|---|---|---|---|
| 4K / 1K | 659,18 | 3295,92 | 16690,40 | 60491,40 | 73,00 |
| 16K / 1K | 214,71 | 3650,13 | 179502,93 | 283663,38 | 77,08 |
| 32K / 1K | 102,24 | 3373,95 | 437616,27 | 616372,75 | 75,12 |

Comparación de tareas de agente reportada por Tencent Hunyuan: Terminal-Bench 4.0 pasa de 26,3 (preview) a 44,4; AutomationBench v1.0.6 de 36,3 a 56,2. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 774,4B parámetros en W8A8 (≈1 byte por parámetro) el peso ronda los 774 GB, más overhead de activaciones, caché KV y `eh_proj` en BF16; el despliegue de referencia emplea 16 GPU H100 de 80 GB (1,28 TB de HBM en total).
- GPU recomendadas: NVIDIA H100 80 GB HBM3 en configuración de dos nodos y ocho GPU por nodo, con InfiniBand para NCCL. El autor menciona también soporte en Huawei Ascend, Hygon, Kunlunxin, T-Head, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX.
- GPU de consumo: no cabe en ninguna GPU consumer actual; el tamaño del modelo excede con holgura los 24 GB de una RTX 4090 y los 48 GB de una RTX 6000 Ada.
- Opciones de despliegue: imagen Docker de FlagOS con FlagTree, FlagGems, FlagGems-vLLM y vllm-plugin-FL; descarga de pesos vía ModelScope. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla anterior; el TPOT medio se mantiene en torno a 73-77 ms en los tres tamaños de entrada, mientras que el TTFT crece de forma marcada con la longitud del prompt (16,7 s a 4K frente a 437,6 s de media a 32K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4 W8A8 (FlagOS) | 774,4B | no disponible | Sí (visión + operación de ordenador) | no disponible | Hugging Face, ModelScope, imagen Docker FlagOS |
| Hy4-NVIDIA-Origin | no disponible | no disponible | Sí | no disponible | Referencia nativa de NVIDIA citada por el autor |
| Hy4 preview | no disponible | no disponible | Parcial (sin visión ni operación de ordenador) | no disponible | Versión previa de Tencent Hunyuan |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros fabricantes en la misma categoría de tamaño y tarea.

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran inglés; no hay evidencia de soporte multilingüe ni de calidad en castellano.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base de Tencent Hunyuan antes de desplegarlo en producción.
- Consistencia de la cuantización: GPQA Diamond cae de 93,65 a 92,06 y MATH-500 de 96,2 a 95,79 respecto al original; el autor reconoce además que las puntuaciones ERQA de ambas configuraciones quedan por debajo del baseline nativo.
- Métricas de rendimiento no verificadas: el propio autor advierte que las cifras de throughput y latencia son mediciones históricas y no corresponden al digest publicado.
- Riesgo de alucinación: no documentado en la información disponible; en un modelo de este tamaño y con capacidad de operar software, conviene añadir verificación externa en flujos críticos.
- Longitud de contexto no especificada: impide planificar despliegues con prompts largos; los TTFT observados a 32K de entrada superan los 400 s de media, lo que desaconseja ese régimen en aplicaciones interactivas.
- Requisitos de infraestructura muy altos: dos nodos con 16 H100 e InfiniBand no son un entorno trivial; el script de arranque exige dispositivos RDMA y una dirección de rendezvous común.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-nvidia-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/Hy4-W8A8-nvidia-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/flagrelease-nvidia-release-model_hy4-w8a8-tree_0.7.0...`
- Paper, blog o repositorio del modelo base Hy4 de Tencent Hunyuan: no disponible en la información proporcionada.
