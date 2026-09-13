# karlsencoin/Qwen3.5-9B-GGUF

## Resumen

karlsencoin/Qwen3.5-9B-GGUF es una reproducción cuantizada en formato GGUF del modelo Qwen/Qwen3.5-9B, publicada por el usuario karlsencoin y generada con las herramientas de Unsloth (Unsloth Dynamic 2.0). No se trata de un modelo entrenado por este autor, sino de una conversión de pesos del modelo base de Alibaba/Qwen, cuyo pipeline declarado es image-text-to-text, es decir, un modelo de lenguaje y visión. El repositorio tiene 147,8 GB de tamaño total, 0 descargas y 0 likes, y fue creado el 13 de septiembre de 2026.

El modelo subyacente, Qwen3.5-9B, es un transformer causal con encoder de visión y una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention (atención completa). Cuenta con 8.953.803.264 parámetros (~8,95 B), dimensión oculta de 4096, 32 capas y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. La model card declara soporte para 201 idiomas y dialectos, entrenamiento multimodal con fusión temprana y un pipeline de RL escalado sobre entornos de agentes.

Su relevancia práctica reside en que permite ejecutar un modelo multimodal de ~9 B con contexto muy largo en hardware local o en servidores de una sola GPU, algo que los modelos de la generación anterior de tamaño comparable no ofrecían con visión integrada. La licencia Apache 2.0 facilita el uso comercial, aunque al ser una conversión de terceros con cero adopción registrada conviene validar los ficheros antes de llevarla a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; layout híbrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (la model card menciona MoE disperso como rasgo de la familia Qwen3.5, pero el desglose del 9B no detalla expertos ni parámetros activos) |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | GGUF con esquema Unsloth Dynamic 2.0; los niveles concretos incluidos en el repositorio no están disponibles |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; el listado detallado no está disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio está etiquetado además con `transformers` y `gguf`) |
| Dimensión oculta | 4096 |
| Número de capas | 32 |
| Dimensión de embedding / salida | 248.320 (con padding) |
| Dimensión intermedia de la FFN | 12.288 |
| Gated DeltaNet | 32 cabezas de atención lineal para V, 16 para QK, dimensión de cabeza 128 |
| Gated Attention | 16 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64 |
| MTP | Entrenado con múltiples pasos (multi-token prediction) |
| Tamaño del repositorio | 147,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con encoder de visión. El bloque se repite ocho veces con el patrón 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN), de modo que tres de cada cuatro subcapas de secuencia usan atención lineal tipo Gated DeltaNet y solo una usa atención completa con RoPE. La Gated DeltaNet opera con 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y dimensión RoPE de 64. Esta mezcla reduce el coste del caché KV en la mayor parte de las capas, lo que explica que se pueda sostener un contexto de 262.144 tokens y extenderlo hasta 1.010.000. La FFN tiene dimensión intermedia 12.288, el embedding y la salida están en 248.320 (con padding) y el modelo se entrenó con predicción multi-token (MTP) de varios pasos, lo que habilita decodificación especulativa con cabezas MTP.

En cuanto al entrenamiento, la model card del modelo base indica dos fases: preentrenamiento y postentrenamiento. El preentrenamiento es multimodal con fusión temprana sobre tokens de imagen y texto, con una eficiencia declarada cercana al 100 % respecto a un entrenamiento solo de texto. El postentrenamiento incluye escalado de aprendizaje por refuerzo sobre entornos de agentes multimillonarios con distribuciones de tareas de complejidad progresiva. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO de forma explícita. Tampoco se detalla la arquitectura del encoder de visión ni su número de parámetros.

## Capacidades

- Generación de texto y razonamiento general, con paridad declarada frente a Qwen3 y mejora sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Comprensión de imagen y texto de forma conjunta (pipeline `image-text-to-text`), incluyendo descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Generación y razonamiento sobre código, integrado en el mismo modelo que la capacidad multimodal.
- Razonamiento matemático y de tipo STEM, evaluado en la model card dentro del bloque "Knowledge & STEM".
- Soporte de tool calling y function calling: el repositorio está etiquetado con `endpoints_compatible` y `conversational`, lo que apunta a integración con APIs de inferencia compatibles con OpenAI.
- Comportamiento agéntico y razonamiento multi-paso, respaldado por el entrenamiento de RL sobre entornos de agentes a gran escala.
- Cobertura multilingüe amplia: 201 idiomas y dialectos según la documentación del modelo base.
- Predicción multi-token (MTP) entrenada con varios pasos, aprovechable para decodificación especulativa.
- Contexto largo nativo de 262.144 tokens, extensible a 1.010.000, adecuado para documentos extensos o repositorios completos.

## Casos de uso

- Atención al cliente multilingüe: el modelo puede mantener conversaciones multi-turno en cualquiera de los 201 idiomas declarados y sostener historiales largos gracias a los 262.144 tokens de contexto nativo, sin necesidad de resumir la conversación de forma agresiva.
- Análisis de documentos con imágenes integradas: facturas, informes financieros con gráficos, planos o capturas de pantalla pueden procesarse directamente al ser un modelo image-text-to-text, extrayendo datos estructurados sin un pipeline OCR separado.
- Asistente de programación en producción: al soportar tool calling, puede conectarse a herramientas de compilación, ejecución de tests o consulta de repositorios, e integrarse en flujos de CI/CD para revisar cambios y proponer parches.
- Agentes autónomos multi-paso: el entrenamiento de RL sobre entornos de agentes lo orienta a tareas encadenadas como reservas, navegación web o automatización de back-office, donde debe decidir acciones sucesivas en lugar de responder en un solo turno.
- Análisis de corpus extensos: con extensión hasta 1.010.000 tokens, permite procesar libros completos, expedientes legales o bases de código sin fragmentar en trozos y perder coherencia global.
- Accesibilidad y descripción de imágenes: generación de descripciones y texto alternativo en múltiples idiomas para plataformas de contenido, aprovechando la componente de visión y la cobertura lingüística.
- Despliegue en local o on-premise: al publicarse en GGUF cuantizado, encaja en escenarios con requisitos de soberanía de datos donde no se permite enviar información a APIs externas.
- Generación de documentación técnica a partir de capturas de interfaz o diagramas de arquitectura, combinando la entrada visual con la salida de texto estructurado.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero los valores numéricos no están disponibles en la información proporcionada: solo se recupera el encabezado de la tabla y el inicio de la primera fila (MMLU-Pro, dentro del bloque "Knowledge & STEM"). Los modelos de comparación sí están identificados. No se han publicado en la información disponible resultados numéricos verificables de MMLU, HumanEval, GSM8K ni de ningún otro benchmark para este repositorio.

| Modelo comparado en la model card | Valores numéricos |
|---|---|
| GPT-OSS-120B | no disponible |
| GPT-OSS-20B | no disponible |
| Qwen3-Next-80B-A3B-Thinking | no disponible |
| Qwen3-30BA3B-Thinking-2507 | no disponible |
| Qwen3.5-9B (este modelo base) | no disponible (la tabla se trunca en la fila MMLU-Pro) |
| Qwen3.5-4B | no disponible |

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros real (8,95 B); no proceden de mediciones publicadas para este repositorio. Hay que añadir el consumo del encoder de visión y del caché KV, que en este modelo es menor de lo habitual en las capas Gated DeltaNet pero completo en las capas de Gated Attention.

- VRAM estimada en bf16/fp16: en torno a 18 GB solo de pesos, más caché y activaciones; presupuestar 24-32 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, más overhead; presupuestar 12-16 GB.
- VRAM estimada en cuantización de 4 bits (tipo Q4_K_M): en torno a 5,5-6 GB de pesos; presupuestar 8-10 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o similares para bf16 y contextos largos; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 para cuantizaciones de 8 y 4 bits.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones de 4 y 8 bits en tarjetas con 12 GB o más de VRAM. En bf16 requiere 24 GB o más y limita la longitud de contexto efectiva.
- Opciones de despliegue: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers para los pesos originales; al distribuirse en GGUF, el uso esperado es con llama.cpp, Ollama o LM Studio, aunque la compatibilidad efectiva de estas herramientas con la arquitectura híbrida Gated DeltaNet no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| karlsencoin/Qwen3.5-9B-GGUF (este repositorio) | ~8,95 B | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | GGUF en Hugging Face, 0 descargas | no disponible |
| Qwen/Qwen3.5-9B (modelo base) | ~8,95 B | 262.144 nativos, hasta 1.010.000 | Apache 2.0 | Pesos originales en Transformers, vLLM, SGLang | no disponible (tabla truncada) |
| Qwen3.5-4B | no disponible (variante menor de la misma familia) | no disponible | no disponible | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-OSS-120B | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-OSS-20B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3-Next-80B-A3B-Thinking | no disponible | no disponible | no disponible | no disponible | no disponible |

Los cinco modelos alternativos se citan únicamente porque aparecen como comparadores en la tabla de benchmarks de la model card del modelo base; no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros: el autor karlsencoin no es el desarrollador del modelo. Se trata de una conversión GGUF de Qwen/Qwen3.5-9B, no de un modelo propio ni validado por Qwen.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de que los ficheros hayan sido probados por terceros.
- Model card heredada: el texto del repositorio reproduce la model card oficial de Qwen3.5 con banners de Unsloth. Las especificaciones descritas corresponden al modelo base, no necesariamente al contenido exacto de cada fichero cuantizado.
- Ambigüedad sobre MoE: la documentación de la familia menciona Mixture-of-Experts disperso, pero el desglose del 9B no lista expertos. No se puede confirmar si esta variante es MoE ni cuáles serían sus parámetros activos.
- Compatibilidad de runtime incierta: la arquitectura híbrida Gated DeltaNet más Gated Attention puede no estar soportada por todas las versiones de llama.cpp, Ollama u otros motores GGUF. Conviene verificar la versión mínima antes de desplegar.
- Riesgo de alucinación: no hay datos publicados de tasas de alucinación para este modelo ni para esta conversión. Como en cualquier modelo generativo, la salida debe validarse en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la información disponible. La cobertura de 201 idiomas no implica calidad homogénea entre ellos.
- Límites de idioma: el listado concreto de idiomas soportados no está disponible, solo el recuento agregado de 201 idiomas y dialectos.
- Cuantización y pérdida de precisión: Unsloth Dynamic 2.0 afirma superar a otras cuantizaciones líderes en precisión, pero no se aportan métricas que lo respalden y no se detalla qué niveles GGUF contiene el repositorio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base, al que apunta la model card, por si incorpora condiciones adicionales.
- Caducidad del contexto extendido: los 1.010.000 tokens son una extensión, no una ventana nativa; el rendimiento en longitudes muy superiores a 262.144 tokens no está documentado.
- Producción: sin benchmarks verificables ni pruebas de terceros, se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en un sistema en producción.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/karlsencoin/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Guía de Unsloth para ejecutar Qwen3.5 en local: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentación de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces recuperados correspondían a contenidos sobre la canción napolitana "Santa Lucia" y no guardan relación con la ficha.
