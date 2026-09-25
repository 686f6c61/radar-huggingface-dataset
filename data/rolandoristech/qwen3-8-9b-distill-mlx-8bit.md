# RolanDorisTech/Qwen3.8-9B-Distill-MLX-8bit

## Resumen

Qwen3.8-9B-Distill-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo empero-ai/Qwen3.8-9B-Distill, un destilado denso de 9B parámetros de la familia de razonamiento Qwen3.8. El repositorio lo publica RolanDorisTech y funciona como alias de búsqueda del repositorio canónico RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e: ambos comparten exactamente los mismos pesos y el mismo método de cuantización, por lo que cualquiera de los dos identificadores puede usarse en mlx_lm.generate o en LM Studio.

El interés técnico del modelo está en su esquema de cuantización. No se trata de un 8 bits uniforme, sino de oQ8e, una cuantización de precisión mixta con ponderación por importancia de activaciones (imatrix) que reparte el presupuesto de bits según la sensibilidad medida de cada capa. El resultado es un artefacto de 8,9 GB que conserva la ventana de contexto nativa de 262.144 tokens del modelo base y se ejecuta de forma nativa sobre Apple Silicon mediante MLX.

Es relevante porque cubre un nicho concreto: desarrolladores e investigadores que quieren ejecutar localmente, en un Mac, un modelo de razonamiento de 9B con contexto muy largo, sin depender de CUDA ni de servicios en la nube. La licencia Apache-2.0 y los 8,9 GB de peso lo sitúan en el rango alcanzable por equipos de gama alta con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen/Qwen3.5-9B según la model card); sin confirmar a nivel de capa |
| Parametros totales | 9B (etiqueta de familia, 9B / 4B / 2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (según la model card) |
| Tipos de cuantizacion | oQ8e (precisión mixta de clase Q8, ~8 bits por peso en promedio, más ponderación por importancia de activaciones); existe una variante hermana oQ5e de ~6,0 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |
| Tamano del repositorio | 8,9 GB |
| Libreria | mlx |
| Tarea | text-generation |
| Modelo base | empero-ai/Qwen3.8-9B-Distill (relación: quantized) |
| Repositorio canónico | RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e |
| Fecha de publicación (HuggingFace) | 25 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

Se trata de una cuantización, no de un entrenamiento nuevo. El pipeline es el siguiente: Qwen desarrolla la serie Qwen3.8; Empero, laboratorio independiente alemán, destila el razonamiento de Qwen3.8 en un modelo denso de 9B (empero-ai/Qwen3.8-9B-Distill, construido sobre la arquitectura de Qwen/Qwen3.5-9B); y RolanDorisTech aplica sobre ese destilado la cuantización oQe para producir pesos MLX.

El elemento diferenciador es oQe (oMLX Universal Dynamic Quantization con ponderación por activaciones). En lugar de asignar un presupuesto de bits plano, el método ejecuta datos de calibración a través del modelo, mide la sensibilidad real de cada capa al error de cuantización y asigna más bits donde el error perjudica más (lm_head, embeddings de tokens, primeros y últimos bloques) y menos donde el impacto es despreciable. La variante oQe añade una pasada de calibración con estadísticas de activación por canal (imatrix) que pondera el error según la importancia de cada canal. El contenido de la model card no especifica el número de tokens de calibración, la composición del dataset de destilación ni si hubo RLHF o DPO; estos datos no están disponibles. Tampoco se detalla si el destilado incorpora decodificación especulativa u otras optimizaciones de inferencia.

Como referencia del ecosistema, la documentación pública de la serie Qwen3.8 describe en su variante Flash-Next una atención híbrida GDN + QSA y mejoras en atención, residual, embedding y optimización. Esa descripción corresponde a Qwen3.8-Flash-Next y no se puede trasladar sin verificación a este destilado de 9B.

## Capacidades

- Generación de texto en la tarea text-generation, con plantilla de chat de Qwen3 y etiquetas `<think>` para modo de razonamiento explícito (el repositorio incluye `chat_template.jinja`).
- Razonamiento: el modelo está etiquetado como `reasoning` y deriva de un destilado del razonamiento de Qwen3.8.
- Contexto largo: ventana nativa declarada de 262.144 tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Ejecución local nativa en Apple Silicon mediante MLX, con integración en LM Studio y mlx-swift.
- Compatibilidad de formato con mlx-lm, oMLX, LM Studio y mlx-swift; la propia model card advierte de que la compatibilidad en tiempo de ejecución debe verificarse contra la versión concreta de cada aplicación.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el modo de razonamiento con `<think>` es el único indicio.
- Capacidades multilingües: no disponible (el campo de idiomas no está cumplimentado).
- Visión, audio u otras modalidades: no documentado.

## Casos de uso

- Asistente de razonamiento totalmente local: al ejecutarse con MLX sobre Apple Silicon, ningún dato sale del equipo. Es adecuado para entornos con requisitos de confidencialidad donde no se permite enviar prompts a APIs externas.
- Análisis de documentación extensa: con 262.144 tokens de contexto nativo se pueden cargar informes técnicos, expedientes o bases de código completas en una sola pasada, sin trocear el material y perder coherencia entre fragmentos.
- Generación y revisión de código en local: el modelo se integra en flujos de trabajo de desarrollo sobre macOS mediante mlx-lm o LM Studio, útil para autocompletado, explicación de funciones y refactorización en proyectos con código propietario.
- Prototipado de aplicaciones de IA sin GPU NVIDIA: para equipos cuyo hardware es un Mac, esta cuantización permite iterar sobre prompts y evaluar el comportamiento del modelo base Qwen3.8-9B-Distill sin alquilar instancias CUDA.
- Investigación sobre cuantización: al ser un artefacto oQe documentado, sirve para reproducir y auditar el efecto de la precisión mixta con imatrix frente a cuantizaciones uniformes, comparando contra la variante oQ5e (6,0 GB) y contra el modelo base sin cuantizar.
- Distribución en aplicaciones de escritorio: el formato MLX safetensors permite empaquetar el modelo dentro de una app nativa de macOS mediante mlx-swift, con el modelo embarcado y ejecución sin conexión.
- Procesamiento por lotes en local: tareas de resumen, extracción y clasificación sobre volúmenes de texto que no justifican coste de API, ejecutadas de noche en una estación de trabajo Mac.
- Formación y experimentación docente: el tamaño contenido y la licencia Apache-2.0 facilitan su uso en cursos y talleres sobre modelos de lenguaje, cuantización e inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del propio Qwen3.8-9B-Distill-MLX-8bit en la información disponible. Existen referencias públicas que mencionan evaluaciones MMLU y GSM8K del destilado de Empero, pero no se proporcionan cifras en la información recogida, por lo que no se reproducen aquí.

La model card incluye una tabla comparativa del método oQ frente a la cuantización uniforme de mlx-lm. Los datos corresponden a otro modelo (Qwen3.5-35B-A3B, MMLU, 300 muestras) y documentan la metodología de cuantización, no la calidad de este modelo concreto:

| Bits | Uniforme Q (mlx-lm) | oQ |
|---:|---:|---:|
| 2-bit | 14,0 % | 64,0 % |
| 3-bit | 76,3 % | 85,0 % |
| 4-bit | 79,7 % | 83,3 % |

La model card cita además dos referencias externas sobre ponderación por sensibilidad y activaciones, que tampoco evalúan este modelo:

| Referencia | Configuración | Resultado |
|---|---|---|
| SqueezeLLM (arXiv:2306.07629) | LLaMA-7B, perplejidad en C4, RTN uniforme | 28,26 |
| SqueezeLLM (arXiv:2306.07629) | LLaMA-7B, no uniforme agnóstica a sensibilidad | 18,08 |
| SqueezeLLM (arXiv:2306.07629) | LLaMA-7B, no uniforme basada en sensibilidad | 7,75 |
| vLLM LLM Compressor (imatrix_mse) | Llama-3.1-8B, W4A16, WikiText-2 | 6,96 → 6,85 (6,83 con GPTQ) |

## Requisitos de hardware

- Pesos en disco y en memoria: 8,9 GB en el formato oQ8e. La variante oQ5e del mismo autor ocupa 6,0 GB.
- Memoria unificada estimada para inferencia (orientativo, no publicado por el autor): un mínimo práctico de 16 GB de memoria unificada para contextos cortos; 24-32 GB recomendados para trabajar con comodidad; 64 GB o más para aprovechar ventanas de contexto muy largas, ya que el KV cache a 262.144 tokens crece de forma apreciable. Estas cifras son estimaciones, no medidas oficiales.
- GPU compatibles: exclusivamente Apple Silicon (familias M1, M2, M3 y M4, en versiones base, Pro, Max y Ultra). MLX no se ejecuta sobre CUDA, ROCm ni CPU x86 convencional; para NVIDIA o AMD habría que recurrir a otros formatos del modelo base, no a este repositorio.
- Cabe en GPU de consumo: en el contexto de Apple Silicon, sí, en cualquier Mac con memoria unificada suficiente (por ejemplo, un MacBook Pro con 24 GB o más). No aplica a GPU de consumo NVIDIA porque el formato es MLX.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), oMLX, LM Studio (buscando `RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e`) y mlx-swift para aplicaciones nativas. No sirve directamente en vLLM, llama.cpp, Ollama ni TGI, que requieren otros formatos de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Formato / plataforma |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-MLX-8bit (oQ8e) | 9B (denso) | 262.144 tokens | oQ8e, precisión mixta ~8 bits con imatrix | 8,9 GB | Apache-2.0 | MLX safetensors / Apple Silicon |
| Qwen3.8-9B-Distill-MLX-oQ5e | 9B (denso) | 262.144 tokens (según la familia) | oQe ~5 bits | 6,0 GB | Apache-2.0 | MLX safetensors / Apple Silicon |
| empero-ai/Qwen3.8-9B-Distill (modelo base) | 9B (denso) | 262.144 tokens | Sin cuantizar | no disponible | no disponible en la información recogida | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a cuantizaciones equivalentes de otros autores, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una cuantización: la precisión mixta de ~8 bits introduce degradación respecto al modelo base sin cuantizar, aunque el método oQe esté diseñado para minimizarla. No se han publicado mediciones de esa pérdida para este modelo concreto.
- Repositorio alias: el propio autor indica que este ID duplica a RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e. El repositorio figura con 0 descargas y 0 likes, por lo que no hay validación de la comunidad; conviene contrastar con el repositorio canónico, que contiene la documentación completa.
- Sin benchmarks propios: las cifras de la model card corresponden a otros modelos y metodologías, no a una evaluación de calidad de este artefacto.
- Riesgo de alucinación: inherente a los modelos generativos y presumiblemente heredado del destilado y del Qwen3.8 original. No se documentan tasas de alucinación ni evaluaciones de veracidad.
- Sesgos: no documentados. Al ser un destilado de un modelo mayor, hereda los sesgos de los datos de destilación y del modelo profesor, que no se detallan.
- Idiomas: el campo de idiomas no está cumplimentado. No hay confirmación de cobertura multilingüe ni de la calidad en castellano.
- Contexto: los 262.144 tokens son la cifra nativa declarada del modelo base; el rendimiento efectivo a longitudes extremas no está verificado y depende de la memoria disponible y del backend.
- Herramientas y agentes: no hay documentación sobre tool calling, function calling ni uso agéntico, así que no debería asumirse su soporte en producción sin pruebas previas.
- Licencia: el repositorio declara Apache-2.0, pero la licencia del modelo base empero-ai/Qwen3.8-9B-Distill y las condiciones de uso de la serie Qwen3.8 deben verificarse por separado antes de un uso comercial.
- Plataforma: al ser pesos MLX, el modelo queda restringido a Apple Silicon. No es desplegable en infraestructura NVIDIA ni en servidores x86 convencionales.
- Metadatos anómalos: la fecha de creación y actualización del repositorio en HuggingFace figura como 25 de septiembre de 2026, posterior a la fecha habitual de consulta. Conviene verificar la vigencia del repositorio antes de integrarlo.
- Compatibilidad de runtime: la model card recomienda verificar la compatibilidad contra la versión específica de mlx-lm, oMLX, LM Studio o mlx-swift que se vaya a utilizar.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-8bit
- Repositorio canónico oQ8e: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ8e
- Variante oQ5e: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Laboratorio Empero: https://empero.org/
- Documentación del método oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Artículo sobre Qwen3.8-9B Distill de Empero (benchmarks y configuración local): https://www.mindstudio.ai/blog/qwen3-8-9b-distill-empero
- Ficha de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Paper SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentación de imatrix en vLLM LLM Compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal de YouTube del autor: https://www.youtube.com/@RolanDorisTech
