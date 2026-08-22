# GotoAI-Inc/EXAONE-4.5-33B-W4A16

## Resumen

EXAONE-4.5-33B-W4A16 es una cuantización int4 weight-only del modelo multimodal EXAONE-4.5-33B, desarrollado por LG AI Research y publicado originalmente como pesos abiertos en abril de 2026. Esta variante ha sido producida por GotoAI-Inc de forma no oficial y sin afiliación con LG, con el objetivo de reducir el peso del checkpoint de 68,70 GB a 22,75 GB, manteniendo la arquitectura, el tokenizador y las configuraciones originales sin modificaciones. Es la primera cuantización publicada de este modelo de 34,35 mil millones de parámetros que soporta entrada de imagen y texto, con una ventana de contexto máxima de 262 144 tokens.

La cuantización se ha realizado con el esquema W4A16 (pesos en int4 con grupo de 128, simétrico, y activaciones en 16 bits) mediante `llmcompressor.model_free_ptq`, sin datos de calibración ni carga del modelo. El resultado es un checkpoint en formato compressed-tensors que se sirve con vLLM (versión 0.25.1 o superior) y que conserva las capacidades de razonamiento, generación de código y comprensión de imágenes del modelo original. La licencia es la EXAONE AI Model License Agreement 1.2 – NC, que restringe el uso a fines exclusivamente de investigación y educación, y prohíbe el uso comercial tanto del modelo como de sus resultados.

El interés de esta ficha radica en que es una de las primeras cuantizaciones disponibles para un modelo de 33 B con contexto de 256 K, y en que reduce los requisitos de VRAM de forma significativa: de los 68,70 GB originales a 22,75 GB, lo que permite ejecutarlo en GPUs de consumo de 24 GB o profesionales de 32 GB para contextos moderados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), 64 capas (48 sliding-attention con ventana 4096 y 16 full attention), 8 KV heads, head_dim 128, con vision tower de 28 capas y cabezal MTP (multi-token prediction) |
| Parámetros totales | 34 350 097 664 (≈34,35 B) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262 144 tokens (256k) |
| Tipos de cuantizacion | W4A16 (int4, group size 128, simétrica, weight-only); el checkpoint base original es bfloat16 |
| Idiomas soportados | en, ko, es, de, ja, vi |
| Licencia | EXAONE AI Model License Agreement 1.2 – NC (no comercial, solo investigación y educación) |
| Formato de pesos | safetensors (compressed-tensors, esquema W4A16) |

## Arquitectura y entrenamiento

La arquitectura del modelo base EXAONE-4.5-33B es un transformador multimodal con un encoder de visión dedicado de 1,2 mil millones de parámetros que se integra en el marco de EXAONE 4.0. El modelo principal tiene 64 capas: 48 con atención deslizante (sliding attention) de ventana 4096 y 16 con atención completa, todas con 8 cabezas de KV y head_dim 128. El contexto máximo es de 262 144 tokens, y más allá de 8192 tokens se usa una extensión de RoPE con factor 16, configurada por el proveedor. La cabecera de predicción multi-token (MTP) permite decodificación especulativa sin modelo auxiliar.

El proceso de cuantización de esta variante convierte 448 módulos lineales de int4 con group size 128, cubriendo el 70,1 % de los bytes de salida. Las capas MLP (64 × 3) se reducen de 53,86 GB a 13,88 GB, y las proyecciones de atención (64 × 4) de 8,05 GB a 2,08 GB. Se dejan en bfloat16 la torre de visión (`visual.*`), la cabecera MTP (`mtp.*`), el `embed_tokens`, el `lm_head` (no compartido) y las normas y sesgos, por su sensibilidad a la precisión y por compatibilidad con vLLM. El modelo se sirve con `--reasoning-parser qwen3` y `--tool-call-parser hermes`, ambos prestados de otros modelos porque vLLM no tiene parsers nativos para EXAONE.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento (`thinking`) activado por defecto en la plantilla de chat; se puede desactivar con `enable_thinking: false`.
- Comprensión multimodal de imágenes y texto (image-text-to-text), con soporte de hasta 64 imágenes por prompt en vLLM.
- Tool calling / function calling, mediante el parser `hermes`, integrable en flujos de agentes.
- Razonamiento y planificación multi-step, con decodificación especulativa MTP para acelerar la inferencia.
- Multilingüe: coreano, inglés, alemán, español, francés y vietnamita.
- Capacidad de generar razonamiento explícito (`reasoning_content`) que puede separarse de la respuesta final con el parser qwen3.
- Compatible con el formato de chat de EXAONE, que incluye etiquetas de pensamiento y respuesta.

## Casos de uso

- Investigación académica en visión por computador y procesamiento de lenguaje natural: el modelo permite experimentar con razonamiento multimodal a escala de 33 B en una GPU de 32 GB, algo que no sería posible con el checkpoint original de 68,7 GB en hardware común.
- Desarrollo de prototipos de asistentes de código con tool calling: su soporte de function calling y razonamiento multi-step permite integrarlo en pipelines de generación de código o agentes de desarrollo, siempre que el uso sea no comercial.
- Análisis de documentos técnicos con imágenes: al aceptar hasta 64 imágenes por prompt, puede extraer información de diagramas, capturas de pantalla o esquemas en documentos largos, con un contexto de 256k tokens para acompañar el texto.
- Educación y formación en IA: la licencia permite usar el modelo en entornos educativos para enseñar técnicas de cuantización, despliegue con vLLM y evaluación de modelos multimodales.
- Evaluación de técnicas de compresión: al ser una cuantización sin calibración, es útil para comparar el impacto de W4A16 frente a otros esquemas (GPTQ, AWQ, etc.) en modelos de 33 B.
- Investigación en decodificación especulativa: la cabecera MTP integrada permite estudiar el rendimiento de la predicción multi-token sin necesidad de un modelo draft adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. Los datos de rendimiento del modelo base son los siguientes:

| Benchmark | Resultado (modelo base) |
|---|---|
| GPQA Diamond | 79,4 % |

Los resultados del modelo base no son directamente extrapolables a la versión cuantizada, ya que la cuantización puede degradar ligeramente el rendimiento, aunque no se han facilitado métricas de evaluación en la model card. Se recomienda evaluar el modelo en las tareas de interés antes de usarlo en producción (siempre que se cumpla la licencia).

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 22,75 GB en formato W4A16. El KV cache depende del contexto: ~2,9 GB a 32k, ~9,2 GB a 128k y ~17,6 GB a 256k. En total, se necesita una GPU de 48 GB para el contexto máximo, 32 GB para hasta ~64k tokens, y una de 24 GB no puede cargar el modelo ni con contexto corto (los pesos ya superan 22,75 GB).
- GPUs recomendadas: NVIDIA A100 40/80 GB, H100, RTX 6000 Ada o cualquier GPU con compute capability ≥ 7.5 (los kernels Marlin de la cuantización int4 requieren al menos Turing). Una RTX 4090 (24 GB) no es suficiente.
- Opciones de despliegue: vLLM ≥ 0.25.1, que detecta el formato compressed-tensors automáticamente. No se recomienda llama.cpp ni Ollama porque el modelo usa arquitectura multimodal y MTP, no soportada por esos motores.
- Latencia y throughput: no se han publicado datos medidos. La decodificación especulativa MTP puede reducir la latencia de generación respecto al modelo base, pero no hay cifras concretas disponibles.
- Se puede liberar 2,57 GB de VRAM usando `--language-model-only` para desactivar la visión, a costa de perder entrada de imagen y vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | VRAM (cuantización) |
|---|---|---|---|---|---|
| EXAONE-4.5-33B (base) | 34,35 B | 262 144 | EXAONE NC | bfloat16 | 68,70 GB |
| EXAONE-4.5-33B-W4A16 (este) | 34,35 B | 262 144 | EXAONE NC | W4A16 int4 | 22,75 GB |
| Llama 3.1 70B (quantizado) | ~70 B | 128k | Llama 3.1 (permissive) | GGUF / GPTQ | ~40 GB en Q4 |
| Qwen2.5-VL 32B (quantizado) | ~32 B | 128k | Apache 2.0 | GPTQ/AWQ | ~20 GB en Q4 |

La principal diferencia frente a alternativas como Qwen2.5-VL es la licencia: EXAONE restringe el uso comercial, mientras que Qwen2.5-VL es Apache 2.0. En cuanto a contexto, EXAONE ofrece 256k tokens, el doble que Qwen2.5-VL. La cuantización W4A16 es más ligera que GGUF Q4 (que suele usar 4 bits con activaciones de 4 bits), pero mantiene las activaciones en 16 bits, lo que suele dar mejor calidad. No se dispone de benchmarks comparativos publicados para esta variante.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: el uso del modelo, sus derivados y sus resultados está limitado a investigación y educación. Prohibido el uso comercial sin acuerdo escrito con LG Management Development Institute, y también el uso para desarrollar o mejorar modelos competidores.
- No hay datos de evaluación de la cuantización: no se ha publicado ninguna métrica de rendimiento de la versión W4A16, por lo que se desconoce el impacto real de la int8 en tareas de razonamiento, matemáticas o visión.
- Riesgo de alucinación y sesgos: el modelo base puede generar contenido inexacto o sesgado, y la cuantización puede amplificar estos efectos en escenarios de baja precisión.
- Limitaciones de idioma: aunque soporta seis idiomas, el entrenamiento está sesgado hacia el coreano y el inglés; el rendimiento en español, alemán, francés y vietnamita puede ser inferior.
- Compatibilidad: requiere vLLM ≥ 0.25.1 y no funciona con otros motores de inferencia (llama.cpp, Ollama, TGI) debido a la arquitectura multimodal y MTP.
- Contexto largo: el modo de 256k tokens exige 48 GB de VRAM, y el uso de contextos largos sin suficiente memoria puede provocar errores de carga o degradación de rendimiento.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/GotoAI-Inc/EXAONE-4.5-33B-W4A16
- Modelo base (LG AI Research): https://huggingface.co/LGAI-EXAONE/EXAONE-4.5-33B
- Repositorio GitHub de EXAONE 4.5: https://github.com/LG-AI-EXAONE/EXAONE-4.5
- Herramienta de cuantización usada (llm-quantizer): https://github.com/gotoai/llm-quantizer
- Ficha técnica del modelo en BestLLMfor: https://bestllmfor.com/catalog/exaone-45-33b/
- Informe de AI Flash Report: https://aiflashreport.com/models/exaone-4-5-33b/
