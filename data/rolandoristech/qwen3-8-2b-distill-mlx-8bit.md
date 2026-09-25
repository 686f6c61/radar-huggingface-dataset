# RolanDorisTech/Qwen3.8-2B-Distill-MLX-8bit

## Resumen

Qwen3.8-2B-Distill-MLX-8bit es una build cuantizada en formato MLX del modelo empero-ai/Qwen3.8-2B-Distill, publicada por RolanDorisTech. Se trata de un alias del repositorio RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e: mismos pesos y mismo método de cuantización oQ8e, un esquema de precisión mixta de clase 8 bits (media de ~8 bits por peso) con ponderación por importancia de activaciones (imatrix), distinto del 8 bits uniforme tipo Q8_K_M.

El modelo base es un destilado de parámetros completos de Qwen3.8 2.4T A95B hacia la arquitectura densa Qwen3.5-2B, entrenado sobre unas 30.000 trazas de cadena de pensamiento generadas por el profesor y que cubren matemáticas, razonamiento general y seguimiento de instrucciones. El resultado es un modelo de aproximadamente 2.000 millones de parámetros, con 262.144 tokens de contexto nativo y licencia Apache-2.0.

Su relevancia es doble: por un lado, ofrece razonamiento con etiquetas `<think>` en un tamaño que cabe en cualquier Mac con Apple Silicon y 8 GB de memoria unificada (1,9 GB de pesos); por otro, sirve como caso práctico para evaluar si la cuantización dinámica por sensibilidad por capa conserva mejor el rendimiento que un presupuesto uniforme a igual número nominal de bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-2B, según la model card del modelo base) |
| Parámetros totales | ~2.000 millones (2B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | oQ8e, precisión mixta de clase 8 bits con ponderación por importancia de activaciones (imatrix); ~8 bits de media por peso, no uniforme |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |
| Modelo base | empero-ai/Qwen3.8-2B-Distill |
| Tamaño en disco | 1,9 GB |
| Librería | mlx |
| Plantilla de chat | Plantilla de chat de Qwen3 con etiquetas `<think>`; se incluye `chat_template.jinja` |
| Fecha de publicación | 25 de septiembre de 2026 (sin actualizaciones posteriores) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5-2B. El entrenamiento documentado corresponde al modelo base, no a esta build: empero-ai realizó una destilación de parámetros completos desde Qwen3.8 2.4T A95B (un profesor de tipo mezcla de expertos, 2,4 billones de parámetros totales y 95.000 millones activos según la nomenclatura del modelo) hacia el estudiante de 2B. El estudiante se entrenó sobre aproximadamente 30.000 trazas curadas del profesor, con cadenas de pensamiento densas que abarcan matemáticas, razonamiento general y seguimiento de instrucciones, siguiendo el mismo currículum que sus hermanos mayores de 4B y 9B.

La aportación técnica específica de este repositorio es la cuantización. oQ mide la sensibilidad real de cada capa al error de cuantización mediante datos de calibración y reparte un presupuesto de bits no uniforme: capas sensibles como `lm_head`, los embeddings de tokens y los primeros y últimos bloques reciben más precisión, mientras que las capas tolerantes se comprimen más. oQe añade una pasada de calibración de importancia de activaciones y usa estadísticas por canal (imatrix) para ponderar el error de cuantización. El resultado se exporta como safetensors MLX estándar. No hay información disponible sobre RLHF, DPO u otras fases de alineamiento posteriores al destilado.

## Capacidades

- Generación de texto y razonamiento explícito con cadenas de pensamiento, delimitadas por etiquetas `<think>` según la plantilla de chat de Qwen3.
- Razonamiento matemático y resolución de problemas paso a paso, heredado del currículum de destilado del profesor.
- Seguimiento de instrucciones en tareas de propósito general, según la descripción del modelo base.
- Manejo de contextos muy largos (hasta 262.144 tokens) para resumen, pregunta-respuesta sobre documentos y análisis de corpus extensos.
- Inferencia local en Apple Silicon mediante MLX, incluyendo integración en aplicaciones vía mlx-swift y en LM Studio.
- Soporte de tool calling o function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible (no documentado).
- Capacidades multilingües: no disponible (los idiomas soportados no se especifican).
- Capacidades de visión o audio: no disponibles; el pipeline declarado es text-generation.
- Capacidad destacable: es un artefacto de cuantización reproducible con metodología pública (oQ/oQe), útil para experimentación comparativa de esquemas de compresión.

## Casos de uso

- Asistente de razonamiento local y privado en Mac: el modelo se ejecuta íntegramente en el dispositivo con 1,9 GB de pesos, de modo que ningún prompt ni documento sale del equipo. Adecuado para entornos con requisitos de confidencialidad donde no se puede usar una API externa.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo se pueden cargar contratos, informes anuales o tesis completas y hacer preguntas sobre ellos sin trocear el texto y sin perder coherencia entre secciones.
- Generación de datos sintéticos de razonamiento: al producir cadenas de pensamiento paso a paso, sirve como generador de trazas para pipelines de destilado o para aumentar datasets de entrenamiento en dominios concretos.
- Tutor de matemáticas con explicación del procedimiento: el formato de cadena de pensamiento permite mostrar al usuario los pasos intermedios, no solo la respuesta final, algo útil en herramientas educativas offline.
- Prototipado de funciones de IA en aplicaciones iOS y macOS: la compatibilidad con mlx-swift y mlx-lm permite integrar el modelo en apps nativas sin depender de servicios en la nube ni de conectividad.
- Extracción y clasificación por lotes en local: tareas de etiquetado, resumen y extracción de campos sobre grandes volúmenes de texto se pueden ejecutar en modo batch durante la noche en un único equipo, sin coste por token.
- Investigación en cuantización: este repositorio permite comparar empíricamente oQ8e frente a un 8 bits uniforme estándar sobre el mismo modelo base, evaluando la degradación en tareas de razonamiento.
- Chatbot de soporte interno con contexto largo: la combinación de tamaño reducido y ventana amplia permite desplegar un asistente que mantiene el hilo de conversaciones extensas junto con documentación técnica adjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo ni para su base empero-ai/Qwen3.8-2B-Distill. La model card advierte explícitamente de que no incluye ninguna evaluación de calidad de los modelos Qwen3.8 Distill.

El único dato cuantitativo presente en la información es el benchmark metodológico de oQ sobre Qwen3.5-35B-A3B (MMLU, 300 muestras). Se reproduce a continuación únicamente como documentación del método de cuantización, no como medida del rendimiento de este modelo:

| Bits | Cuantización uniforme (mlx-lm) | oQ |
|---:|---:|---:|
| 2 bits | 14,0 % | 64,0 % |
| 3 bits | 76,3 % | 85,0 % |
| 4 bits | 79,7 % | 83,3 % |

En este test concreto, oQ obtuvo mayor precisión que la cuantización uniforme con el mismo ancho de bits nominal sobre un modelo distinto y de otra escala.

## Requisitos de hardware

- Pesos en disco: 1,9 GB. Memoria unificada estimada para inferencia con contexto corto: en torno a 2,5-3 GB, incluyendo overhead de runtime. La cifra exacta para contextos largos no está disponible, pero el KV cache crece con la longitud de la secuencia y puede dominar el consumo a 262.144 tokens.
- Hardware objetivo: Apple Silicon (series M1, M2, M3 y M4). El formato MLX está diseñado para memoria unificada de Apple; esta build no incluye ruta oficial a CUDA ni ROCm.
- Cabe en GPU de consumo: en el sentido de que cabe en cualquier Mac con 8 GB de memoria unificada como mínimo; se recomienda 16 GB o más si se van a usar contextos largos. No hay soporte para GPU de consumo NVIDIA o AMD en este formato sin convertir previamente los pesos.
- GPU de数据中心 (A100, H100, RTX 4090): aplicables solo si se convierte el modelo a otro formato (por ejemplo GGUF o safetensors de PyTorch). Dicha conversión no está incluida ni documentada en este repositorio.
- Opciones de despliegue: mlx-lm (línea de comandos y API de Python), oMLX, LM Studio y mlx-swift. La compatibilidad en tiempo de ejecución debe verificarse contra la versión concreta de cada aplicación.
- Comando de referencia: `mlx_lm.generate --model RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e --prompt "..." --max-tokens 250 --temp 0.6 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta build.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-2B-Distill-MLX-8bit (objeto de esta ficha) | ~2B | 262.144 | oQ8e, precisión mixta ~8 bits con imatrix | Apache-2.0 | MLX safetensors | 1,9 GB |
| RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e | ~2B | 262.144 | oQ8e (idéntica) | Apache-2.0 | MLX safetensors | 1,9 GB |
| empero-ai/Qwen3.8-2B-Distill | ~2B | No disponible | Sin cuantizar (modelo base) | No disponible en la información proporcionada | No disponible | No disponible |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e | ~9B | No disponible | oQ5e, ~5 bits con imatrix | No disponible en la información proporcionada | MLX safetensors | No disponible |

No es posible establecer una comparativa de rendimiento: no hay resultados de benchmarks publicados para ninguno de estos modelos en la información disponible. La comparación se limita, por tanto, a parámetros, contexto, esquema de cuantización, licencia y formato. Conviene señalar que el repositorio de esta ficha y el sufijado como oQ8e son el mismo artefacto publicado bajo dos identificadores, de modo que no constituyen alternativas reales entre sí.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad publicados para este modelo y para su base. Cualquier afirmación sobre su rendimiento en tareas concretas sería especulativa y debe validarse con una evaluación propia antes de llevarlo a producción.
- Es un destilado de 2B, no el modelo profesor: la capacidad de razonamiento en problemas multi-paso, matemáticas avanzadas o dominios especializados es sustancialmente inferior a la de modelos de mayor escala. El riesgo de alucinación es elevado en preguntas factuales.
- El entrenamiento del base se centra en matemáticas, razonamiento general y seguimiento de instrucciones; no hay evidencia en la información disponible de un entrenamiento específico en código, tool calling o uso agéntico.
- Los idiomas soportados no están documentados. No debe asumirse un comportamiento multilingüe correcto sin verificarlo, aunque el nombre del modelo sugiera herencia de la familia Qwen.
- oQ8e no es un 8 bits uniforme. Herramientas o pipelines que asuman un esquema Q8_K_M estándar pueden producir resultados distintos a los esperados; el identificador del repositorio incluye "8bit" como término de búsqueda, no como descripción exacta del algoritmo.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia. No obstante, el nombre "Qwen3.8" no implica respaldo ni afiliación con el equipo oficial de Qwen; se trata de un destilado de la comunidad (empero-ai) redistribuido por un tercero.
- El repositorio es un alias: los pesos y el método son idénticos a RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e, que es el repositorio canónico con documentación completa. Descargar ambos duplica el espacio en disco sin aportar nada.
- La ventana de 262.144 tokens es la nativa del modelo base; no se documenta si la cuantización oQ8e afecta a la calidad en contextos muy largos ni si el runtime elegido soporta esa longitud completa.
- El formato MLX limita el despliegue a Apple Silicon. No hay instrucciones de conversión a GGUF, vLLM, TGI o TensorRT-LLM.
- La plantilla de chat requiere gestionar correctamente las etiquetas `<think>`; un parser que no las maneje expondrá el razonamiento interno al usuario final o truncará la respuesta.
- Repositorio sin descargas ni valoraciones en el momento de la consulta y sin actualizaciones desde su creación, lo que dificulta estimar su mantenimiento a medio plazo.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-8bit
- Repositorio canónico (mismos pesos, oQ8e): https://huggingface.co/RolanDorisTech/Qwen3.8-2B-Distill-MLX-oQ8e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Hermano de 9B en oQ5e: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de la familia destilada (2B, 4B, 9B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Documentación de la metodología oQ (oMLX): https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- SqueezeLLM, cuantización no uniforme basada en sensibilidad: https://arxiv.org/abs/2306.07629
- Guía de imatrix en LLM Compressor (vLLM): https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal de YouTube del autor (tutoriales y benchmarks de IA local en Apple Silicon): https://www.youtube.com/@RolanDorisTech
- Ficha comparativa en LLM Explorer del modelo base: https://llm-explorer.com/model/empero-ai%2FQwen3.8-2B-Distill,3TlLgEP23RPu4OPKG5EMyl
