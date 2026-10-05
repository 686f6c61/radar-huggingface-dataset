# sebidev/Qwen3.5-35B-A3B-GGUF

## Resumen

El repositorio sebidev/Qwen3.5-35B-A3B-GGUF contiene una versión cuantizada en formato GGUF del modelo Qwen/Qwen3.5-35B-A3B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con codificador de visión, arquitectura híbrida de redes Gated Delta combinadas con mezcla de expertos dispersa (MoE), 35B parámetros totales y 3B parámetros activos por token. La versión original está pensada para inferencia eficiente y despliegue local, con soporte multimodal de imagen y texto.

La relevancia de esta ficha radica en que la cuantización GGUF permite ejecutar un modelo de 35B en hardware de consumo, algo impensable con pesos en BF16. El autor de esta copia, sebidev, emplea la técnica Unsloth Dynamic 2.0 e imatrix para reducir la pérdida de precisión respecto al modelo base. El modelo soporta 201 idiomas y dialectos, tool calling, modo de pensamiento (thinking) y razonamiento multi-paso, lo que lo sitúa como una opción atractiva para agentes y asistentes multilingües.

Qwen3.5-35B-A3B es relevante ahora porque combina una ventana de contexto amplia (no confirmada para los pesos abiertos, pero el servicio Qwen3.5-Flash ofrece 1M por defecto), un coste computacional bajo gracias a sus 3B parámetros activos y capacidades de visión integradas. La licencia Apache-2.0 facilita su uso comercial, aunque se debe verificar la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida: Gated Delta Networks + sparse Mixture-of-Experts (MoE) |
| Parámetros totales | 34.660.610.688 (35B nominales) |
| Parámetros activos | 3B |
| Longitud de contexto | no disponible (el servicio Qwen3.5-Flash tiene 1M por defecto, no confirmado para pesos abiertos) |
| Tipos de cuantización | GGUF: Unsloth Dynamic 2.0, Q8_0, Q4_K_M, BF16; incluye datos imatrix |
| Idiomas soportados | 201 idiomas y dialectos (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado con fusión temprana sobre tokens multimodales. La arquitectura combina Gated Delta Networks, un tipo de capa recurrente con compuertas que reduce el coste de atención en secuencias largas, con una mezcla de expertos dispersa que activa solo 3B parámetros de los 35B totales. La configuración incluye 40 capas, dimensión oculta de 2048 y embeddings de tokens de 248.320 (con padding). El entrenamiento pasó por etapas de pre-entrenamiento y post-entrenamiento, e incluyó escalado de reinforcement learning en entornos con millones de agentes y distribuciones de tareas progresivamente complejas.

Como innovaciones técnicas destacan la eficiencia de entrenamiento multimodal cercana al 100% respecto a texto-only, el uso de frameworks asíncronos de RL para orquestación de agentes, y la paridad cross-generacional con Qwen3 y Qwen3-VL en razonamiento, código, agentes y comprensión visual. El modelo incorpora un modo de pensamiento (thinking) que puede desactivarse mediante `--chat-template-kwargs '{"enable_thinking":false}'`. Las actualizaciones de la model card mencionan mejoras en tool calling y coding, así como la eliminación de capas MXFP4 en tres cuantizaciones concretas.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activable o desactivable.
- Comprensión visual e image-text-to-text: análisis de imágenes, descripción, respuesta a preguntas visuales y extracción de información.
- Generación de código y soporte para tool calling / function calling, con mejoras específicas en integraciones tipo Claude Code y Codex.
- Capacidades de agente: planificación, uso de herramientas y razonamiento en múltiples pasos.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Fine-tuning y reinforcement learning mediante Unsloth, con notebooks gratuitos y guías específicas.
- Compatibilidad con vLLM, SGLang, KTransformers, llama.cpp, Ollama y LM Studio.
- Capacidad de operar en modo conversacional y en pipelines de generación aumentada por recuperación.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones multi-turno en 201 idiomas, con contexto amplio (aunque no confirmado) y comprensión de imágenes enviadas por el usuario, como capturas de facturas o productos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión automática de código, generación de tests o corrección de errores, con la ventaja de sus 3B parámetros activos para baja latencia.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede extraer datos de facturas, formularios, gráficos o diagramas y generar resúmenes estructurados.
- Agentes autónomos de investigación: su modo thinking y su capacidad de razonamiento multi-paso permiten descomponer tareas complejas, consultar herramientas externas y sintetizar resultados.
- Asistente de accesibilidad: descripción de imágenes en tiempo real para personas con discapacidad visual, con soporte de voz a texto integrado mediante pipelines externos.
- Traducción y localización: cobertura de 201 idiomas y dialectos para traducir documentación técnica, subtítulos o contenido web manteniendo contexto largo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF, puede ejecutarse en GPUs de consumo como la RTX 4090 con Q4_K_M, ofreciendo privacidad de datos y sin coste por token.
- Educación personalizada: tutor conversacional que explica conceptos con ejemplos visuales y se adapta al idioma del estudiante, con razonamiento paso a paso visible o desactivado según necesidad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficos comparativos y menciona mejoras en chat, coding, contexto largo y tool calling, pero no proporciona tablas con valores concretos (MMLU, HumanEval, GSM8K, etc.). Una guía externa citada en la búsqueda web afirma que el modelo queda dentro del 5% del Qwen3.5-27B dense en la mayoría de benchmarks, pero no se aportan cifras oficiales en la información disponible.

## Requisitos de hardware

Las estimaciones de VRAM se basan en el número de parámetros totales (34,66B) y el tipo de cuantización. Los valores son aproximados y pueden variar según la implementación y la longitud de contexto.

| Cuantización | Peso aproximado | VRAM estimada para inferencia | GPU recomendadas |
|---|---|---|---|
| Q4_K_M | ~20-22 GB | ~24 GB | RTX 4090, RTX 3090, L4 |
| Q5_K_M | ~24-26 GB | ~28-32 GB | RTX 6000 Ada, A6000 |
| Q8_0 | ~37-39 GB | ~40-44 GB | A100 40GB, H100 40GB |
| BF16 | ~69-70 GB | ~75-80 GB | A100 80GB, H100 80GB |

- Cabe en GPU de consumo: sí, con Q4_K_M en RTX 4090 (24 GB) o RTX 3090. Q5_K_M puede requerir ajustes de contexto o offloading parcial.
- En Apple Silicon: un Mac con 32 GB de memoria unificada puede ejecutar Q4_K_M; 64 GB permiten Q8_0 con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM, SGLang, KTransformers. Para producción con múltiples peticiones, vLLM o SGLang ofrecen mejor throughput.
- Latencia y throughput estimados: no disponibles oficialmente. Al tener solo 3B parámetros activos, la velocidad de generación por token es comparable a un modelo denso de 3B, pero el ancho de banda de memoria está limitado por los 35B totales. En una RTX 4090 con Q4_K_M se pueden esperar decenas de tokens por segundo, aunque no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (este) | 35B | 3B | no disponible | Apache-2.0 | GGUF, safetensors |
| Qwen3.5-27B dense | 27B | 27B | no disponible | no disponible | no disponible |
| Qwen3.5-122B-A10B | 122B | 10B | no disponible | no disponible | no disponible |

La comparativa con alternativas de cuantización del mismo modelo incluye:

| Repositorio | Autor | Formato | Notas |
|---|---|---|---|
| sebidev/Qwen3.5-35B-A3B-GGUF | sebidev | GGUF | Unsloth Dynamic 2.0, imatrix |
| bartowski/Qwen_Qwen3.5-35B-A3B-GGUF | bartowski | GGUF | Cuantizaciones estándar |
| grapeV-ai/Qwen3.5-35B-A3B-GGUF | grapeV-ai | GGUF | Alternativa de cuantización |

## Limitaciones y advertencias

- No se han publicado resultados numéricos de benchmarks en la información disponible, lo que dificulta una evaluación objetiva del rendimiento real.
- La longitud de contexto de los pesos abiertos no está especificada. El servicio Qwen3.5-Flash tiene 1M por defecto, pero no se confirma para este modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto o con imágenes ambiguas.
- Sesgos conocidos: no documentados en la información proporcionada. Al entrenarse con datos web, puede reproducir sesgos socioculturales.
- La cuantización GGUF, aunque usa imatrix y Unsloth Dynamic 2.0, puede degradar ligeramente la precisión frente a BF16 en tareas complejas.
- Licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen/Qwen3.5-35B-A3B y los términos de Alibaba Cloud si se usa el servicio gestionado.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación de la comunidad.
- El tamaño del repositorio es de 576,8 GB, lo que exige espacio de almacenamiento considerable y ancho de banda para su descarga.
- El soporte de 201 idiomas no garantiza la misma calidad en todos ellos; los idiomas con menos datos pueden tener un rendimiento inferior.
- El modo thinking puede aumentar la latencia y el consumo de tokens; es recomendable desactivarlo para tareas simples.

## Enlaces

- https://huggingface.co/sebidev/Qwen3.5-35B-A3B-GGUF
- https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- https://unsloth.ai/docs/models/qwen3.5
- https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- https://unsloth.ai/docs/models/qwen3.5/gguf-benchmarks
- https://unsloth.ai/docs/models/qwen3.5/fine-tune
- https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide
- https://unsloth.ai/docs/get-started/unsloth-notebooks#standard-sft-notebooks
- https://qwen.ai/blog?id=qwen3.5
- https://chat.qwen.ai
- https://modelstudio.alibabacloud.com/
- https://www.alibabacloud.com/help/en/model-studio/text-generation
- https://huggingface.co/grapeV-ai/Qwen3.5-35B-A3B-GGUF
- https://huggingface.co/bartowski/Qwen_Qwen3.5-35B-A3B-GGUF
- https://github.com/qtliu/Qwen3.5-35B-A3B-GGUF
- https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
- https://insiderllm.com/guides/qwen-3-5-local-guide/
- https://github.com/unslothai/unsloth
- https://discord.gg/unsloth
