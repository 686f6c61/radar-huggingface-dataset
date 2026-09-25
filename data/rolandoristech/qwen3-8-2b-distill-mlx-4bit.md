# RolanDorisTech/Qwen3.8-2B-Distill-MLX-4bit

## Resumen

Qwen3.8-2B-Distill-MLX-4bit es una versión cuantizada del modelo empero-ai/Qwen3.8-2B-Distill, publicada por el usuario RolanDorisTech. Se trata de un modelo de generación de texto de aproximadamente 2.000 millones de parámetros, destilado a partir del modelo profesor Qwen3.8 (una variante MoE de 2,4 billones de parámetros totales con 95.000 millones de parámetros activos) sobre la arquitectura Qwen3.5-2B. La destilación traslada las trazas de razonamiento del profesor a un modelo denso mucho más pequeño, orientado a ejecución local.

El repositorio concreto que se analiza es un alias de búsqueda de RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e: comparte pesos y método de cuantización con el repositorio canónico, que es el que contiene la documentación completa. El método de cuantización es oQ4e, una cuantización mixta de clase 4 bits (aproximadamente 4 bits por peso de media, no uniforme) con ponderación por importancia de activaciones (imatrix), desarrollada por oMLX. El peso total del repositorio es de 1,1 GB, lo que lo sitúa en el rango de modelos ejecutables en memoria unificada de equipos Apple Silicon de gama media.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto nativa de 262.144 tokens en un modelo de solo 2B, algo poco habitual en ese rango de tamaño; por otro, la cuantización selectiva por capas permite conservar más calidad que una cuantización uniforme de 4 bits al mismo ancho nominal. El modelo está pensado exclusivamente para el ecosistema MLX de Apple, por lo que no es directamente desplegable en pilas CUDA sin reconversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura Qwen3.5-2B (heredada del modelo base); detalle de capas y atencion no disponible |
| Parametros totales | ~2B (2.000 millones, segun denominacion del modelo base); recuento exacto no disponible |
| Parametros activos | No aplica: el modelo es denso. El profesor Qwen3.8 es MoE con 2,4T totales y 95B activos |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ4e (clase 4 bits, precision mixta no uniforme con ponderacion imatrix, ~4 bits por peso de media). No es Q4_K_M ni 4 bits uniforme |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |
| Tamano del repositorio | 1,1 GB |
| Plantilla de chat | Plantilla Qwen3 con etiquetas `<think>`; se incluye `chat_template.jinja` |
| Libreria | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo final es un transformer denso de aproximadamente 2B parámetros que reproduce la arquitectura Qwen3.5-2B. No se ha entrenado desde cero: es el resultado de una destilación de parámetros completos (full-parameter distillation) del modelo Qwen3.8 2.4T A95B, el profesor MoE masivo de la serie, hacia el estudiante de 2B. Según la información disponible, el estudiante se entrenó sobre el mismo currículum que sus hermanos mayores de 4B y 9B, y las trazas de razonamiento del profesor («chain of thought») forman parte del material de destilación. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación técnica de este repositorio concreto no está en el modelo base, sino en la cuantización. El método oQ mide la sensibilidad real de cada capa al error de cuantización mediante datos de calibración y reparte el presupuesto de bits de forma no uniforme, asignando más bits a las capas sensibles (como `lm_head`, los embeddings de tokens y los primeros y últimos bloques del transformer) y menos a las que toleran mejor la compresión. oQe añade una pasada de calibración de importancia de activaciones con estadísticas por canal (imatrix), de modo que el error se pondera según la relevancia de cada canal. El resultado es un modelo de precisión mixta que promedia unos 4 bits por peso, con un tamaño de archivo de 1,1 GB. La decodificación utiliza la plantilla de chat de Qwen3 con etiquetas `<think>`, lo que permite separar el razonamiento explícito de la respuesta final.

## Capacidades

- Generación de texto en formato conversacional, con plantilla de chat compatible con Qwen3.
- Razonamiento explícito mediante modo «thinking»: la plantilla usa etiquetas `<think>` para delimitar cadenas de razonamiento antes de la respuesta.
- Razonamiento de múltiples pasos heredado de las trazas de destilación del profesor (en la información disponible se describe al profesor generando soluciones paso a paso de tipo chain of thought).
- Manejo de contextos muy largos: 262.144 tokens nativos, útil para documentos extensos, bases de código o historiales de conversación largos.
- Compatibilidad con pipelines de Apple Silicon a través de MLX: mlx-lm, oMLX, LM Studio y mlx-swift.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-turno autónomo: no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado en el repositorio).
- Capacidades de visión o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información proporcionada, aunque son capacidades habituales de la familia Qwen3.5/Qwen3.8.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta íntegramente en memoria unificada de Apple Silicon con un archivo de 1,1 GB, lo que permite desplegar un chatbot privado sin conexión a Internet y sin enviar datos a servicios externos.
- Análisis de documentos extensos con contexto largo: con 262.144 tokens de ventana nativa, se puede cargar un informe técnico, un contrato o un libro completo y hacer preguntas sobre su contenido sin fragmentación agresiva ni recuperación adicional.
- Razonamiento paso a paso en el dispositivo: el formato de plantilla con `<think>` permite obtener la cadena de razonamiento separada de la respuesta final, útil para depuración, auditoría de decisiones o tareas educativas donde interesa mostrar el proceso.
- Prototipado rápido en LM Studio: al ser compatible con LM Studio, un desarrollador puede descargar el modelo por su identificador, probar prompts y evaluar el comportamiento conversacional antes de integrarlo en código de producción.
- Integración en aplicaciones nativas de macOS e iOS mediante mlx-swift: el formato de pesos MLX safetensors es consumible desde mlx-swift, lo que permite incrustar generación de texto en una app sin servidor externo.
- Preprocesamiento y clasificación de texto en local: tareas de resumen, extracción de entidades, reescritura o etiquetado por lotes sobre documentos largos, ejecutadas en el propio equipo para evitar costes de API.
- Filtrado y enrutado de consultas en pipelines RAG: un modelo de 2B puede actuar como primera etapa para decidir si una consulta requiere un modelo mayor, reduciendo el coste medio por petición.
- Evaluación de técnicas de cuantización: el repositorio sirve como caso de estudio práctico para comparar oQ4e frente a cuantizaciones uniformes de 4 bits en tareas de razonamiento, dentro de una línea de investigación sobre cuantización sensible a la importancia.
- Generación asistida en entornos con restricciones de memoria: en equipos con 8 GB de memoria unificada, un modelo de este tamaño y cuantización deja margen suficiente para el resto del sistema operativo y la aplicación anfitriona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo Qwen3.8-2B-Distill-MLX-4bit ni de su modelo base específico en la información disponible.

La model card incluye una tabla comparativa de metodología de cuantización medida sobre Qwen3.5-35B-A3B con MMLU (300 muestras). El propio autor advierte explícitamente de que esta tabla documenta el método oQ y no es un benchmark de calidad de los modelos Qwen3.8 Distill:

| Bits | Cuantizacion uniforme (mlx-lm) | oQ |
|---:|---:|---:|
| 2 bits | 14,0 % | 64,0 % |
| 3 bits | 76,3 % | 85,0 % |
| 4 bits | 79,7 % | 83,3 % |

Como referencia metodológica externa, la model card cita dos resultados de investigación sobre cuantización ponderada por sensibilidad e importancia de activaciones:

| Estudio | Configuracion | Metrica | Resultado |
|---|---|---|---|
| SqueezeLLM (arXiv:2306.07629) | LLaMA-7B, C4 | Perplejidad | 28,26 (RTN uniforme); 18,08 (no uniforme agnóstica a sensibilidad); 7,75 (no uniforme basada en sensibilidad) |
| vLLM LLM Compressor | Llama-3.1-8B, W4A16, WikiText-2 | Perplejidad | 6,96 (base); 6,85 (observador imatrix_mse); 6,83 (con GPTQ) |

## Requisitos de hardware

- Espacio en disco: 1,1 GB para los pesos en formato MLX safetensors.
- Memoria unificada estimada para inferencia: del orden de 2 a 3 GB incluyendo pesos, caché KV y sobrecarga del runtime (estimación a partir del tamaño de los pesos; no confirmada por el autor).
- Plataforma: exclusivamente Apple Silicon (MLX). No hay build GGUF ni safetensors estándar de PyTorch en este repositorio, por lo que no es ejecutable directamente en GPU NVIDIA o AMD sin reconversión.
- Cabe en GPU de consumo: no en el sentido habitual (CUDA), porque el formato es MLX. Sí cabe holgadamente en cualquier Mac con chip de la serie M con 8 GB o más de memoria unificada, incluidos M1, M2, M3 y M4 en sus variantes base.
- GPU de centro de datos (A100, H100, RTX 4090): no aplicables al formato publicado; requerirían una versión no-MLX del modelo base.
- Opciones de despliegue documentadas: mlx-lm (línea de comandos y API de Python), oMLX, LM Studio (búsqueda por identificador del repositorio) y mlx-swift para aplicaciones nativas Apple.
- Ejemplo de invocación documentado: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e --prompt "..." --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.
- La model card advierte de que la compatibilidad en tiempo de ejecución debe verificarse contra la versión concreta de cada aplicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-2B-Distill-MLX-4bit (oQ4e) | ~2B | 262.144 tokens | oQ4e, clase 4 bits mixta con imatrix | 1,1 GB | Apache-2.0 | MLX safetensors |
| RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e | ~4B | no disponible | oQ8e | no disponible | no disponible | MLX safetensors |
| empero-ai/Qwen3.8-2B-Distill (modelo base) | ~2B | no disponible en la informacion (el derivado declara 262.144) | Sin cuantizar (precision completa) | no disponible; ~4,5 GB de VRAM segun LLM Explorer | no disponible en la informacion proporcionada | no disponible |
| Familia de destilados RayCodes Qwen3.8 (2B, 4B, 9B) | 2B / 4B / 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Repositorio alias: este ID es un alias de búsqueda de RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e. La documentación canónica y completa vive en ese otro repositorio; la model card de este está truncada (la sección «Family» aparece cortada).
- Ausencia total de benchmarks propios: no hay ninguna medición de MMLU, HumanEval, GSM8K ni perplejidad para este modelo concreto. Las cifras de la model card corresponden al método de cuantización sobre otro modelo (Qwen3.5-35B-A3B), como el propio autor advierte.
- Pérdida por cuantización: al promediar ~4 bits por peso, existe degradación respecto al modelo base sin cuantizar. La cuantización mixta mitiga el problema en capas sensibles, pero no lo elimina.
- Capacidad limitada por tamaño: con ~2B parámetros, es previsible un rendimiento inferior al de sus hermanos de 4B y 9B en tareas de razonamiento complejo, matemáticas avanzadas o código de larga extensión, aunque no hay datos publicados que lo cuantifiquen.
- Riesgo de alucinación: herencia habitual de los modelos destilados de tamaño reducido; no hay evaluación de fidelidad factual en la información disponible. Debe validarse antes de cualquier uso donde la exactitud sea crítica.
- Idiomas: el repositorio no declara la lista de idiomas soportados. Aunque la familia Qwen suele ser multilingüe, no hay confirmación para este modelo.
- Tool calling y comportamiento agéntico: no documentados. No debe asumirse compatibilidad con function calling sin una evaluación previa.
- Dependencia de plataforma: formato MLX, uso restringido a Apple Silicon. No hay GGUF ni safetensors PyTorch en este repositorio, lo que limita el despliegue en servidores Linux con GPU.
- Licencia: el repositorio declara Apache-2.0. Conviene verificar de forma independiente las condiciones aplicables al modelo base (empero-ai/Qwen3.8-2B-Distill) y a la serie Qwen3.5/Qwen3.8 subyacente antes de un uso comercial en producción, ya que este repositorio es un derivado cuantizado.
- Procedencia del modelo base: la información disponible describe el destilado como un trabajo de la comunidad (empero-ai) a partir de la arquitectura Qwen3.5-2B, no como un lanzamiento oficial de Qwen. No hay validación independiente publicada en la información proporcionada.
- Compatibilidad de runtime variable: la model card recomienda verificar la compatibilidad contra la versión concreta de mlx-lm, oMLX, LM Studio o mlx-swift.
- Repositorio sin tracción: cero descargas y cero «likes» en la fecha de la información, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-4bit
- Repositorio canonico (oQ4e): https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ4e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Hermano mayor cuantizado (4B, oQ8e): https://huggingface.co/RolanDorisTech/Qwen3.8-4B-Distill-MLX-oQ8e
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de destilados de la comunidad (2B, 4B, 9B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Documentacion del metodo de cuantizacion oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Paper de SqueezeLLM: https://arxiv.org/abs/2306.07629
- Documentacion de imatrix en vLLM LLM Compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Ficha en LLM Explorer del modelo base: https://llm-explorer.com/model/empero-ai%2FQwen3.8-2B-Distill,3TlLgEP23RPu4OPKG5EMyl
- Canal de YouTube del autor: https://www.youtube.com/@RolanDorisTech
