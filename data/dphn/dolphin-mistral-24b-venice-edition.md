# dphn/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin-Mistral-24B-Venice-Edition es un modelo de lenguaje de 24 000 millones de parámetros desarrollado por dphn.ai en colaboración con Venice.ai. Se trata de un ajuste fino (fine-tuning) sobre el modelo base mistralai/Mistral-Small-24B-Instruct-2501, con el objetivo explícito de ofrecer una versión "sin censura" y altamente direccionable (steerable) para el ecosistema de Venice.ai, donde se distribuye como "Venice Uncensored" y es el modelo predeterminado para todos sus usuarios.

El modelo está diseñado como una alternativa a los asistentes cerrados tipo ChatGPT, Claude o Gemini, pero con un control total por parte del propietario del sistema: el usuario define el system prompt, la alineación y las reglas de comportamiento, sin que el modelo imponga sus propias directrices éticas. Esto lo hace especialmente relevante para empresas y desarrolladores que necesitan integrar IA en productos sin depender de políticas de alineación externas ni de cambios silenciosos en las versiones.

Arquitectónicamente, hereda la estructura de Mistral Small 24B Instruct 2501, un transformer denso con atención de ventana deslizante, y añade soporte multimodal (imagen-texto) según los tags de HuggingFace. La ventana de contexto alcanza los 131 072 tokens (128K), lo que permite manejar conversaciones largas y documentos extensos. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en infraestructuras propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Mistral 3, basado en Mistral Small 24B Instruct 2501) |
| Parametros totales | 24 011 361 280 (24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (128K) |
| Tipos de cuantizacion | Safetensors (FP16/BF16), GGUF (Q4_K_M, Q5_K_M, Q8), EXL2 (6bpw) |
| Idiomas soportados | No especificado oficialmente; se presume multilingue por su base Mistral |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF, EXL2 |

## Arquitectura y entrenamiento

El modelo parte de Mistral Small 24B Instruct 2501, un transformer denso con mecanismos de atención de ventana deslizante (sliding window attention) y normalización RMSNorm. No se trata de una arquitectura MoE, por lo que los 24 000 millones de parámetros se activan en cada inferencia. El ajuste fino se realizó sobre 8 GPUs NVIDIA B200, proporcionadas por Targon, aunque no se han publicado detalles sobre el dataset de entrenamiento ni sobre el método de alineación (si se usó RLHF, DPO u otro).

La principal innovación de esta edición es su enfoque en la "no censura" y la direccionabilidad: el modelo no incorpora restricciones de seguridad propias, sino que depende completamente del system prompt que el usuario defina. Esto se logra mediante un entrenamiento específico para seguir instrucciones sin rechazos, manteniendo la plantilla de chat original de Mistral (V7-Tekken). El modelo también soporta tool calling (parser Mistral) y entrada de imágenes, como se evidencia en el comando de despliegue con vLLM que incluye `--limit-mm-per-prompt '{"image": 10}'`.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (hasta 128K tokens).
- Soporte de tool calling / function calling mediante el parser Mistral, integrable en pipelines de agentes.
- Capacidad multimodal basica: acepta hasta 10 imagenes por prompt (segun configuracion vLLM), aunque no se detalla el tipo de tareas de vision que puede realizar.
- Direccionabilidad total via system prompt: el usuario define el tono, la personalidad, las reglas eticas y el comportamiento del modelo.
- Razonamiento y generacion de codigo, heredados de la base Mistral Small 24B Instruct.
- Multilingue probable (no confirmado oficialmente), dado que Mistral Small 24B Instruct 2501 soporta multiples idiomas.
- Sin restricciones de contenido predefinidas: puede generar respuestas sobre temas sensibles si el system prompt lo permite.

## Casos de uso

- Atencion al cliente automatizada: con 128K de contexto, puede gestionar conversaciones largas y recordar detalles de interacciones previas. Su direccionabilidad permite configurar un tono corporativo especifico y manejar quejas o consultas complejas sin desviarse de las politicas de la empresa.
- Generacion de codigo en produccion: al soportar tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de codigo, adaptandose a las convenciones del equipo mediante el system prompt.
- Agentes autonomos y multi-step reasoning: su capacidad de function calling y su ventana de contexto amplia lo hacen adecuado para tareas de planificacion, busqueda de informacion y ejecucion de acciones en entornos controlados.
- Creacion de contenido creativo y roleplay: al no tener restricciones de contenido, es util para escribir ficcion, guiones o dialogos con personajes definidos, donde el usuario controla los limites eticos.
- Asistentes personales personalizados: se puede desplegar como un asistente local o en la nube con una personalidad y reglas de comportamiento definidas por el usuario, sin depender de servicios externos que puedan cambiar sus politicas.
- Analisis de documentos extensos: gracias a su contexto de 128K, puede resumir, extraer informacion o responder preguntas sobre manuales, contratos o informes largos en una sola pasada.
- Investigacion y experimentacion en IA: su licencia Apache 2.0 y su naturaleza "sin censura" lo convierten en una plataforma interesante para estudiar el impacto de la alineacion en el comportamiento de los modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco se encontraron datos comparativos en las busquedas web realizadas. Se recomienda evaluar el modelo en los casos de uso especificos antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - FP16/BF16 (safetensors): mas de 60 GB (segun el ejemplo de vLLM, requiere tensor_parallel_size=8 en GPUs de 80 GB).
  - Cuantizacion Q4_K_M (GGUF): aproximadamente 13 GB de VRAM.
  - Cuantizacion Q5_K_M (GGUF): aproximadamente 19 GB de VRAM.
  - Cuantizacion Q8 (GGUF): aproximadamente 25 GB de VRAM.
  - Cuantizacion EXL2 6bpw: no se especifica, pero se estima en torno a 18-20 GB.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para cuantizaciones bajas, o multiples GPUs para FP16.
- En consumer GPU: cabe en RTX 4090 o RTX 3090 con cuantizacion Q4_K_M o Q5_K_M, aunque con menor calidad.
- Opciones de despliegue: vLLM (recomendado para produccion), Ollama, LM Studio, Hugging Face Transformers, TGI, sglang.
- Latencia y throughput: no se han publicado datos oficiales. Con vLLM y tensor parallelism se puede lograr un throughput razonable, pero depende del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Dolphin-Mistral-24B-Venice-Edition | 24B | 128K | Apache 2.0 | Sin censura, direccionable |
| Mistral Small 24B Instruct 2501 (base) | 24B | 128K | Apache 2.0 | Alineado con seguridad estandar |
| Gemma 2 27B | 27B | 8K | Gemma license | Alineado, enfocado en seguridad |
| Qwen 2.5 24B | 24B | 128K | Apache 2.0 | Multilingue, con tool calling |

La principal diferencia frente a su base es la eliminacion de restricciones de seguridad y la mayor direccionabilidad. Frente a Gemma 2 27B, ofrece un contexto mucho mayor y una licencia mas permisiva. Qwen 2.5 24B es comparable en tamano y contexto, pero con un enfoque de alineacion mas convencional. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: el modelo puede generar contenido ofensivo, ilegal o peligroso si el system prompt no lo impide. Es responsabilidad del usuario establecer las salvaguardas necesarias.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos, especialmente en temas especializados. Se recomienda verificar las salidas en aplicaciones criticas.
- Sesgos potenciales: al no tener un proceso de alineacion explicito, puede reflejar sesgos presentes en los datos de entrenamiento de la base Mistral.
- Limitaciones de idioma: aunque se presume multilingue, no hay confirmacion oficial de la calidad en idiomas distintos del ingles.
- Requisitos de hardware elevados para FP16: la inferencia sin cuantizacion requiere mas de 60 GB de VRAM, lo que limita su despliegue en entornos con GPUs de gama media.
- Dependencia del system prompt: si no se define un system prompt adecuado, el modelo puede comportarse de forma impredecible o no deseada.
- Uso comercial permitido por Apache 2.0, pero el contenido generado puede estar sujeto a regulaciones legales segun el contexto de uso.

## Enlaces

- HuggingFace: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Sitio web de dphn: https://dphn.ai
- Chat web: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Cuantizacion EXL2 6bpw: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition-exl2-6bpw
- Perfil en featherless.ai: https://featherless.ai/models/dphn/Dolphin-Mistral-24B-Venice-Edition
- Perfil en localai.computer: https://localai.computer/models/dphn-dolphin-mistral-24b-venice-edition
