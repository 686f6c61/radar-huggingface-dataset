# Nebulalls/Qwen3-VL-4B-Instruct

## Resumen

Qwen3-VL-4B-Instruct es un modelo de lenguaje y visión (image-text-to-text) de la familia Qwen3-VL, desarrollada por el equipo Qwen de Alibaba. Esta ficha corresponde al repositorio de pesos publicado por el usuario Nebulalls en Hugging Face, que replica los pesos oficiales del modelo Qwen/Qwen3-VL-4B-Instruct. El modelo resuelve tareas que combinan comprensión de imágenes, vídeo y texto: descripción visual, OCR multilingüe, razonamiento espacial, generación de código a partir de capturas y control de agentes visuales sobre interfaces gráficas.

Con 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) en una arquitectura densa, el modelo se sitúa en el segmento de borde y consumo, pero incorpora las innovaciones de la generación Qwen3-VL: contexto nativo de 256K tokens expandible a 1M, posicionales Interleaved-MRoPE para razonamiento temporal en vídeo, fusión multi-nivel de features ViT (DeepStack) y alineación texto-marca temporal. La licencia Apache 2.0 y el soporte en transformers lo hacen especialmente atractivo para despliegues comerciales sin restricciones de uso.

Su relevancia actual radica en que ofrece capacidades de agente visual y comprensión de vídeo largo en un tamaño que cabe en GPUs de consumo, algo reservado hasta hace poco a modelos de decenas de miles de millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3-VL: ViT + LLM con Interleaved-MRoPE y DeepStack) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 256K tokens nativo, expandible a 1M |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, tipicamente bfloat16) |
| Idiomas soportados | no disponible (OCR soporta 32 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL, compuesta por un codificador visual ViT y un decoder de lenguaje denso. Introduce tres innovaciones principales: Interleaved-MRoPE, que asigna frecuencias posicionales completas a las dimensiones temporal, de anchura y de altura para mejorar el razonamiento sobre vídeo de largo horizonte; DeepStack, que fusiona features ViT de múltiples niveles para capturar detalles finos y afinar la alineación imagen-texto; y alineación texto-marca temporal, que sustituye a T-RoPE para localizar eventos con precisión temporal en vídeo.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card indica que el reconocimiento visual se amplió con un preentrenamiento más amplio y de mayor calidad, y que el OCR pasa de 19 a 32 idiomas. El modelo se distribuye en variantes Instruct y Thinking (razonamiento), y en arquitecturas densas y MoE dentro de la familia; esta ficha cubre la variante densa de 4B en modo Instruct.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes, vídeos y documentos combinando evidencia visual y textual.
- Comprensión de vídeo largo: contexto nativo de 256K tokens con indexación a nivel de segundo y recuperación completa de eventos.
- OCR multilingüe en 32 idiomas, robusto ante baja iluminación, desenfoque, inclinación, caracteres raros o antiguos y jerga técnica.
- Parsing de estructura de documentos largos (tablas, secciones, formularios).
- Agente visual: reconoce elementos de interfaces PC/móvil, entiende su función e invoca herramientas para completar tareas.
- Generación de código visual: produce Draw.io, HTML, CSS y JS a partir de imágenes o vídeos.
- Percepción espacial 2D y 3D: posiciones de objetos, puntos de vista, oclusiones y grounding para IA encarnada.
- Razonamiento STEM y matemático con análisis causal y respuestas basadas en evidencia.
- Reconocimiento visual amplio: celebridades, anime, productos, monumentos, flora y fauna.
- Comprensión de texto equiparable a LLM puros, con fusión texto-visión sin pérdida.
- Soporte de tool calling y function calling a través del pipeline conversacional de transformers.

## Casos de uso

- Automatización de atención al cliente multimodal: el modelo puede recibir capturas de pantalla o fotos de productos enviadas por el usuario y responder con contexto de hasta 256K tokens, manteniendo conversaciones multi-turno con historial visual extenso.
- Agente de operación de interfaces (RPA visual): reconocer botones, campos y menús en GUIs de escritorio o móvil e invocar acciones mediante tool calling para completar flujos administrativos o de soporte.
- Digitalización y extracción de documentos: procesar facturas, contratos y formularios escaneados con OCR en 32 idiomas y parsing estructural, devolviendo JSON con campos normalizados.
- Análisis de vídeo de vigilancia o deportivo: indexar eventos con marcas temporales precisas y responder consultas del tipo "¿en qué segundo aparece la persona con chaqueta roja?" sobre grabaciones de horas.
- Generación de prototipos front-end: a partir de una captura de diseño, producir HTML/CSS/JS o diagramas Draw.io para acelerar el handoff entre diseño y desarrollo.
- Asistencia educativa STEM: resolver problemas de matemáticas o física a partir de la foto del enunciado, explicando el razonamiento paso a paso con referencias a la evidencia visual.
- Robótica y IA encarnada: usar el grounding 3D y la percepción espacial para que un agente identifique posiciones y oclusiones de objetos antes de planificar una manipulación.
- Moderación de contenido visual: clasificar imágenes y vídeos con reconocimiento amplio de entidades y descripción detallada para revisión humana posterior.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas de rendimiento multimodal y de texto puro para las variantes 4B y 8B en modo Instruct, pero los valores numéricos no están disponibles en el texto proporcionado (solo se enlazan las imágenes). No se han publicado resultados de benchmarks en la información disponible en formato tabular.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo la demanda crece de forma significativa.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque los formatos GGUF/AWQ no están confirmados en la información disponible.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 256K y vídeo largo; L40S o RTX 6000 Ada para despliegues profesionales; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización, siempre que el backend soporte el modelo.
- Despliegue: transformers (versión de desarrollo o >= 4.57.0 cuando se publique) con `Qwen3VLForConditionalGeneration`; se recomienda `flash_attention_2` para escenarios multi-imagen y vídeo. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (este) | 4,4B denso | 256K (1M expandible) | Apache 2.0 | Agente visual, vídeo largo, OCR 32 idiomas |
| Qwen3-VL-8B-Instruct | ~8B denso | 256K (1M expandible) | Apache 2.0 | Misma familia, mayor capacidad, más VRAM |
| Qwen2.5-VL-7B-Instruct | ~7B denso | 128K | Apache 2.0 | Generación anterior, OCR en 19 idiomas |
| Alternativas de la competencia (p. ej. Llama 3.2 Vision 11B, Gemma 3) | variable | variable | licencias variables | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de benchmarks con estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación visual: como todo modelo multimodal, puede describir elementos inexistentes o atribuir texto erróneo en imágenes de baja calidad.
- Sesgos: no se documentan sesgos específicos en la información disponible; el reconocimiento amplio de entidades (celebridades, productos) puede amplificar sesgos de representación del dataset de preentrenamiento.
- Contexto: aunque el contexto nativo es de 256K, el rendimiento efectivo en ventanas muy largas y con muchas imágenes puede degradarse y dispara el consumo de VRAM.
- Idiomas: la lista de idiomas soportados no está disponible; el OCR cubre 32 idiomas, pero la calidad del texto generado en idiomas distintos del inglés y el chino no está documentada.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el repositorio es una réplica no oficial de los pesos; para producción conviene verificar contra el repositorio oficial Qwen/Qwen3-VL-4B-Instruct.
- Producción: requiere transformers reciente (posiblemente desde fuente) y se recomienda flash-attention 2; la falta de confirmación de soporte en vLLM/llama.cpp puede limitar el despliegue de alto throughput.
- Fecha del repositorio: la fecha de creación indicada (2026-10-26) es posterior a la publicación conocida de la familia Qwen3-VL; conviene validar la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nebulalls/Qwen3-VL-4B-Instruct
- Repositorio oficial (referencia): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Qwen Chat: https://chat.qwenlm.ai/
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report: https://arxiv.org/abs/2502.13923
- Artículo adicional referenciado (arXiv:2409.12191): no disponible el título en la información proporcionada
- Artículo adicional referenciado (arXiv:2308.12966): no disponible el título en la información proporcionada
