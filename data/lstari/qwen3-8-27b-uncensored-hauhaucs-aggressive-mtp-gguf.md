# lstari/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

El modelo `lstari/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF` es una variante cuantizada en GGUF del modelo Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con arquitectura híbrida (atención lineal Gated DeltaNet y atención clásica) y encoder de visión. Ha sido modificado por el usuario HauhauCS con un perfil "Aggressive" que elimina el comportamiento de rechazo (0/465 refusals) y proporciona respuestas directas sin preámbulos, manteniendo intactas las capacidades originales de texto, razonamiento, agente, imagen y vídeo del modelo base.

La relevancia de esta versión radica en dos aspectos: por un lado, el perfil "uncensored" que permite abordar tareas donde se requieren respuestas sin filtros de seguridad (siempre con responsabilidad); por otro, la incorporación de la tecnología HauhauCS FastMTP, un sidecar de aceleración que mejora el rendimiento de decodificación especulativa hasta 3,02x en generación de documentos y 1,93x en razonamiento, respecto a la versión sin MTP. Además, se ofrecen cuantizaciones personalizadas K_P ("Perfect") que optimizan la calidad por nivel de compresión, manteniendo compatibilidad total con runtimes GGUF estándar como llama.cpp o LM Studio.

Con un contexto nativo de 262.144 tokens (extensible hasta 1.000.000) y soporte multimodal, esta variante está pensada para desarrolladores que necesitan un modelo de gran capacidad con respuestas sin restricciones y alto rendimiento en entornos locales o en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense 27B con vision encoder; 64 capas, hidden size 5.120, FFN 17.408; 48 capas Gated DeltaNet + 16 capas gated-attention |
| Parametros totales | 27B (según model card); los metadatos de HuggingFace indican 1.863.907.840, valor que parece erróneo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M (todas K_P personalizadas); más projector BF16 y sidecar FastMTP |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con encoder de visión, diseñado para tareas de texto e imagen/vídeo. Su arquitectura combina 48 capas con Gated DeltaNet (una variante de atención lineal eficiente) y 16 capas con atención clásica, lo que permite manejar contextos largos con menor coste computacional. El vocabulario está rellenado a 248.320 tokens.

La variante uncensored no modifica los pesos del modelo base; solo aplica un perfil de comportamiento que elimina los rechazos y las respuestas evasivas. El entrenamiento original de Qwen3.8-27B incluyó fases de preentrenamiento y ajuste fino con datos multilingües, así como técnicas de alineación (probablemente RLHF/DPO, aunque no se detalla). Esta versión conserva el cabezal MTP/NextN nativo del modelo y añade el sidecar FastMTP de HauhauCS, que optimiza la decodificación especulativa para acelerar la generación sin sacrificar calidad.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Capacidades de agente (agentic) para tareas de largo horizonte, con soporte para planificación y ejecución multi-paso.
- Entrada multimodal: procesamiento de imágenes y vídeo mediante el projector BF16 incluido.
- Soporte nativo de decodificación especulativa (MTP/NextN) y aceleración FastMTP.
- Perfil "Aggressive": respuestas directas, sin rechazos y con mínimo preámbulo en prompts difíciles.
- Multilingüe: inglés, chino y otros idiomas (según el modelo base).
- Contexto largo de 262K tokens, ampliable hasta 1M, adecuado para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar informes de cientos de páginas que incluyan gráficos o fotografías, gracias a su ventana de 262K tokens y su encoder de visión.
- Generación de código en entornos de producción: soporta razonamiento y contexto largo, permitiendo mantener el estado del proyecto y generar o modificar código en repositorios grandes.
- Asistentes conversacionales sin censura para investigación: útil en entornos controlados donde se necesitan respuestas directas sobre temas técnicos o científicos sin rodeos.
- Automatización de tareas agénticas de largo plazo: puede ejecutar flujos multi-paso (por ejemplo, orquestar APIs, gestionar bases de datos) gracias a sus capacidades de razonamiento y contexto extenso.
- Procesamiento de vídeo e imágenes para generación de descripciones o análisis de contenido, usando el projector BF16.
- Creación de contenido creativo sin restricciones: redacción de guiones, literatura experimental o brainstorming donde se requiera evitar auto-censura.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_P o IQ3 permiten ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante uncensored. Sin embargo, el modelo base Qwen3.8-27B reporta los siguientes resultados (según el blog lovableapp.org):

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld (agente) | 84,3 |

Estos datos corresponden al modelo original, no a esta versión con perfil Aggressive, por lo que deben interpretarse como referencia aproximada.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos del modelo, sin contar contexto ni overhead):
  - Q8_K_P (31,46 GB): requiere al menos 32 GB de VRAM (por ejemplo, A100 40GB, RTX 4090 24GB no suficiente; necesitaría 2x24GB o una GPU de 32GB+).
  - Q6_K_P (25,92 GB): cabe en una RTX 4090 24GB con espacio limitado para contexto.
  - Q5_K_P (20,22 GB): cabe en RTX 4090 24GB y en A6000 48GB.
  - Q4_K_P (17,92 GB): cabe en RTX 4080 16GB o RTX 3090 24GB.
  - IQ3_M (12,79 GB) o IQ2_M (10,32 GB): caben en GPUs de 12-16 GB como RTX 3060 12GB o RTX 4070.
- El projector BF16 (931 MB) y el sidecar FastMTP (903 MB) deben cargarse adicionalmente si se usan.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (si es compatible), y cualquier runtime GGUF estándar. Para producción con alta concurrencia, se puede usar vLLM (si soporta GGUF) o convertir a safetensors.
- Latencia y throughput: no se proporcionan datos específicos; el FastMTP promete hasta 3,02x en generación de documentos y 1,93x en razonamiento frente a la versión sin MTP.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa exhaustiva con otros modelos de la misma categoría. A modo orientativo, se puede comparar con el modelo base Qwen3.8-27B (sin perfil uncensored) y con otras variantes de Qwen3.8:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Uncensored-Aggressive (cryptonaut) | 27B | 262K | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B | 262K | Apache 2.0 | Hugging Face |

Las diferencias principales radican en el perfil de comportamiento y en las optimizaciones de cuantización y decodificación.

## Limitaciones y advertencias

- Al ser una variante "uncensored", puede generar contenido ofensivo, peligroso o ilegal si se utiliza sin control. No debe emplearse en aplicaciones públicas sin filtros adicionales.
- El perfil Aggressive puede producir respuestas demasiado directas o sin matices en contextos donde se requiere diplomacia o sensibilidad.
- Los resultados de benchmarks del modelo base no garantizan el mismo rendimiento en esta variante, aunque no se han observado degradaciones significativas según la model card.
- Las cuantizaciones K_P pueden mostrar un "?" en la columna de cuantización de LM Studio, aunque funcionan correctamente.
- El contexto de 1M tokens requiere hardware muy potente y puede degradar la velocidad de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/lstari/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
