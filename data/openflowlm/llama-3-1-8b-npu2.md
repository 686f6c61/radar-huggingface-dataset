# OpenFlowLM/Llama-3.1-8B-NPU2

## Resumen

OpenFlowLM/Llama-3.1-8B-NPU2 es una adaptación del modelo meta-llama/Llama-3.1-8B-Instruct publicada por OpenFlowLM y orientada a la ejecución acelerada sobre las NPU AMD Ryzen AI de segunda generación (XDNA2), mediante el runtime FastFlowLM. No es un modelo entrenado desde cero: la model card indica que conserva la arquitectura y los pesos del lanzamiento de Meta y que puede incorporar ajuste fino, cuantización o adaptaciones específicas para su despliegue en NPU.

El modelo hereda las características de la familia Llama 3.1: transformer decoder-only de 8.030 millones de parámetros, ventana de contexto de 128.000 tokens y atención con Grouped Query Attention (GQA). El repositorio ocupa 5,8 GB, un tamaño coherente con pesos cuantizados que deben caber en la memoria compartida de un equipo con Ryzen AI, aunque la model card no especifica el esquema de cuantización exacto ni el formato de pesos.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de 8B en local sobre hardware de portátil con NPU XDNA2, sin GPU dedicada. El contrapeso es que se publica con 0 descargas y 0 likes, sin resultados de benchmarks ni detalles de entrenamiento documentados, y bajo la licencia Llama 3 de Meta, cuyas condiciones de uso comercial deben revisarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de meta-llama/Llama-3.1-8B-Instruct |
| Parametros totales | 8.030 millones (dato heredado del modelo base; no confirmado explícitamente en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | No especificado. El repositorio ocupa 5,8 GB, compatible con pesos de ~4-5 bits |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | llama3 (Llama 3 de Meta) |
| Formato de pesos | No disponible |
| Runtime objetivo | FastFlowLM sobre NPU AMD Ryzen AI XDNA2 |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

La model card no documenta ningún proceso de entrenamiento propio para esta variante. Describe el artefacto como un derivado de Meta que "conserva la arquitectura y los pesos centrales" y que puede haber pasado por ajuste fino, cuantización o adaptación para aplicaciones específicas. No se indica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento posterior.

Del modelo base se conocen las características habituales de la familia Llama 3.1: transformer decoder-only con 8.030 millones de parámetros, 32 capas, normalización RMSNorm pre-norma, activación SwiGLU, RoPE y GQA. El modelo Instruct original fue post-entrenado por Meta con ajuste supervisado y optimización por preferencias. En esta variante, el valor diferencial no está en el entrenamiento sino en la adaptación de pesos para que el runtime FastFlowLM los ejecute sobre la NPU XDNA2; la model card no detalla si esa adaptación consiste en cuantización, reorganización de pesos o ambas.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados de Llama-3.1-8B-Instruct.
- Generación de código, razonamiento y matemáticas básicas propias de un modelo de 8B de esta familia.
- Soporte de tool calling y function calling nativo en la versión Instruct de Llama 3.1 (no verificado específicamente para esta variante adaptada a NPU).
- Uso como base para flujos de agentes y razonamiento multi-paso, limitado por el tamaño de 8B.
- Capacidad multilingüe reducida: la model card etiqueta únicamente inglés (`language: en`).
- Ejecución local acelerada por NPU XDNA2 a través de FastFlowLM, sin GPU dedicada.
- No se documentan capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local en portátil con Ryzen AI: el modelo se ejecuta sobre la NPU y libera la CPU y la iGPU para otras tareas, con contexto de hasta 128.000 tokens para conversaciones largas.
- Procesamiento de texto offline en entornos sin conectividad: al ser un despliegue local sin dependencia de API, encaja en escenarios de privacidad estricta donde los datos no pueden salir del dispositivo.
- Autocompletado y asistencia de código en el editor: el modelo puede integrarse en un IDE local para sugerencias de funciones y explicaciones de fragmentos, con un coste energético inferior al de una GPU dedicada.
- Resumen y extracción de información de documentos extensos: la ventana de contexto heredada permite procesar informes o contratos largos en una sola pasada, siempre en inglés.
- Prototipado de pipelines RAG: sirve como generador de respuestas en sistemas de recuperación aumentada durante fases de desarrollo, dado que no requiere infraestructura de servidor.
- Clasificación y transformación de texto por lotes: tareas de etiquetado, reescritura o generación de plantillas ejecutadas en local sobre documentos en inglés.
- Evaluación técnica de despliegue en NPU: útil para equipos que quieran medir el rendimiento real de XDNA2 con FastFlowLM antes de apostar por hardware sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y no se aportan medidas de latencia ni de throughput sobre la NPU XDNA2. Los resultados de búsqueda web obtenidos no contienen información relacionada con el modelo.

## Requisitos de hardware

- NPU obligatoria: el título de la model card especifica "XDNA2 Only", es decir, AMD Ryzen AI de segunda generación (familia Ryzen AI 300 / Strix Point).
- Memoria: el repositorio pesa 5,8 GB, por lo que se necesitan al menos unos 6-8 GB de memoria disponible para cargar los pesos, más el espacio para el contexto y el runtime. En equipos con NPU XDNA2 esta memoria se comparte con la RAM del sistema (habitualmente LPDDR5X).
- No requiere GPU dedicada: el objetivo del artefacto es precisamente evitar depender de una tarjeta gráfica.
- GPU recomendadas: no aplica para el despliegue previsto. Si se convirtieran los pesos a GGUF, un modelo de 8B en 4 bits cabría en GPUs consumer con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090), pero ese no es el escenario documentado.
- Opciones de despliegue: FastFlowLM es el runtime indicado en la model card. No se mencionan vLLM, TGI, llama.cpp ni Ollama para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Llama-3.1-8B-NPU2 (OpenFlowLM) | 8,03 B | 128k (heredado) | llama3 | 0 descargas, 0 likes; artefacto reciente | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | llama3 | Ampliamente disponible | Benchmarks publicos por Meta |
| Qwen2.5-7B-Instruct | 7,6 B | 128k | Apache-2.0 | Ampliamente disponible | Benchmarks publicos |
| Mistral-7B-Instruct-v0.3 | 7,3 B | 32k | Apache-2.0 | Ampliamente disponible | Benchmarks publicos |
| Gemma-2-9B-it | 9,2 B | 8k | Gemma Terms | Ampliamente disponible | Benchmarks publicos |

La comparación se establece por tamaño y categoría, no por resultados medidos: este artefacto no aporta benchmarks propios, por lo que no es posible afirmar que iguale o supere a sus alternativas. Su único diferencial verificable es el soporte de ejecución sobre NPU XDNA2, que ninguno de los modelos de la tabla ofrece de forma nativa.

## Limitaciones y advertencias

- Licencia restrictiva: la model card afirma explícitamente "no commercial use without permission". La licencia Llama 3 de Meta permite uso comercial bajo condiciones (atribución "Built with Meta Llama 3", cumplimiento de la política de uso aceptable y un umbral de 700 millones de usuarios mensuales), pero el texto de esta model card lo contradice; conviene verificar la licencia original antes de cualquier uso comercial.
- Requisito de aceptación de términos: para descargar los pesos base hay que aceptar previamente las condiciones de Meta.
- El repositorio no incluye los pesos originales de Meta según la propia model card; hay que obtenerlos por separado.
- Idioma: solo inglés etiquetado. El rendimiento en castellano no está garantizado ni evaluado.
- Sesgos y alucinación: la model card advierte de posible generación de contenido incorrecto o dañino y de sesgos presentes en los datos de entrenamiento del modelo base.
- Corte de conocimiento: no tiene información posterior a la fecha de corte del modelo base.
- Ausencia total de benchmarks y de documentación de entrenamiento: impide validar la calidad del ajuste o de la cuantización aplicada.
- Madurez del artefacto: 0 descargas y 0 likes, publicado y actualizado en la misma fecha, sin historial de uso ni incidencias reportadas.
- Compatibilidad limitada: al estar restringido a XDNA2, no se puede desplegar en otras NPU ni en servidores convencionales sin reconvertir los pesos.
- Uso en producción desaconsejado por el propio autor, que lo destina a investigación, experimentación y NLP académico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Llama-3.1-8B-NPU2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Organización Meta en HuggingFace: https://huggingface.co/meta-llama
- Licencia Llama 3 de Meta: https://ai.meta.com/llama/license/
- Página oficial de Llama: https://ai.meta.com/llama/
- Runtime FastFlowLM: mencionado en la model card, sin URL proporcionada en la información disponible.
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes sobre este modelo.
