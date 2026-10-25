# mohanchoudhary24/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face en formato Transformers y bajo licencia Apache 2.0. Según su model card, se trata de la generación más reciente de la familia abierta Qwen tras las series 3.5 y 3.6, en una variante densa de 27 000 millones de parámetros (27 781 427 952 según los pesos en safetensors) y con un peso de repositorio de 55,6 GB, lo que lo sitúa como un modelo «desplegable» en una o dos GPU de gama alta.

El modelo destaca por tres ejes: un contexto nativo de 262 144 tokens ampliable hasta 1 000 000, comprensión nativa de imagen y vídeo (incluidos vídeos de hasta una hora), y control flexible del razonamiento mediante *thinking mode* activado por defecto, parámetro `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`. La arquitectura es híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención completa con GQA, más un cabezal de Multi-Token Prediction entrenado en varios pasos.

Advertencia de procedencia importante: el repositorio está alojado por el usuario `mohanchoudhary24`, no por la organización oficial Qwen, con 0 descargas y 0 likes en el momento de la consulta. La model card reproduce el texto de una hipotética publicación oficial (menciona Qwen Cloud, comparativas con modelos propietarios como Opus4.6 Max y una tabla de benchmarks cuyos valores no están disponibles en la información proporcionada). Esto no invalida los archivos de pesos, pero obliga a verificar el origen y la integridad antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 64 capas organizadas en 16 bloques de (3 × Gated DeltaNet → FFN) + (1 × Gated Attention → FFN) |
| Parámetros totales | 27 781 427 952 (27B nominales) |
| Parámetros activos | no aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | no disponible en la información proporcionada (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible (el embedding de tokens es de 248 320 entradas, lo que sugiere cobertura multilingüe amplia, pero no se documenta la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed |
| Dimensión oculta | 5120 |
| Dimensión intermedia de la FFN | 17 408 |
| Atención lineal (Gated DeltaNet) | 48 cabezas lineales para V, 16 para QK; dimensión de cabeza 128 |
| Atención completa (Gated Attention) | 24 cabezas Q, 4 cabezas KV (GQA 6:1); dimensión de cabeza 256; dimensión RoPE 64 |
| Vocabulario / salida LM | 248 320 (padded) |
| Etapa de entrenamiento | pre-entrenamiento y post-entrenamiento |
| Tamaño del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo abandona el transformer denso convencional en favor de un *layout* híbrido de 64 capas: por cada bloque de cuatro capas, tres son Gated DeltaNet (atención lineal con estado recurrente, 48 cabezas para V y 16 para QK con dimensión 128) y una es Gated Attention clásica con GQA de 24 cabezas de consulta y solo 4 de clave/valor con dimensión 256 y RoPE de 64 dimensiones. Esta proporción 3:1 reduce de forma drástica el coste de la caché KV en contextos largos, ya que solo 16 de las 64 capas mantienen caché de atención cuadrática. Cada capa va seguida de una FFN con dimensión intermedia de 17 408. El modelo incorpora además un cabezal de Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificación especulativa nativa.

En el plano multimodal, se describe como un modelo de lenguaje causal con codificador de visión, con soporte nativo para imágenes y vídeo, desde diagramas STEM y documentos hasta vídeos de escala horaria. Respecto al entrenamiento, la información disponible solo indica las etapas de pre-entrenamiento y post-entrenamiento; no se detalla el número de tokens, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Sí se documenta el control de razonamiento (`reasoning_effort`, `preserve_thinking`) como parte del post-entrenamiento, orientado a tareas agénticas de horizonte largo.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto y desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`, y retención del contexto de razonamiento de mensajes anteriores con `preserve_thinking`.
- Comprensión nativa de imagen y vídeo: diagramas técnicos y STEM, documentos escaneados y vídeos de hasta una hora de duración.
- Codificación y trabajo profesional: la model card declara mejoras específicas en código, trabajo profesional, investigación y tareas agénticas de horizonte largo.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con *harnesses* y herramientas de desarrollo populares (sin detallar cuáles en la información disponible).
- Conversacional multi-turno con contexto largo (262 144 tokens nativos).
- Capacidades multilingües: presumibles por el tamaño del vocabulario, pero no documentadas explícitamente.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de «official built-in tools» en la versión hospedada lo hacen previsible.
- Decodificación especulativa mediante el cabezal MTP.
- Modo de despliegue gestionado anunciado a través de Qwen Cloud, con contexto de 1M por defecto y herramientas integradas (servicio «coming soon» según la model card).

## Casos de uso

- **Automatización de atención al cliente multi-turno**: con 262 144 tokens de contexto nativo, el modelo puede mantener el hilo completo de una conversación con historial extenso, documentación de producto y tickets previos en la misma ventana, sin truncar información relevante.
- **Agentes de codificación en terminal**: la model card incluye Terminal Bench 2.1 (Terminus) como benchmark de codificación agéntica en terminal, lo que lo orienta a tareas de edición de repositorios, ejecución de comandos y corrección de errores en bucles multi-paso.
- **Generación y revisión de código en pipelines de CI/CD**: su compatibilidad declarada con vLLM, SGLang y TokenSpeed permite servirlo tras una API interna y conectarlo a revisiones automáticas de *pull requests* o a la generación de tests.
- **Análisis de documentación técnica y diagramas**: al ser un modelo nativo de imagen-texto, puede extraer datos de diagramas de arquitectura, esquemas eléctricos o gráficas en artículos científicos y devolver explicaciones o tablas estructuradas.
- **Procesamiento de vídeo de larga duración**: con soporte declarado para vídeos de escala horaria, es apto para resumir sesiones grabadas, generar actas con marcas temporales o auditar contenido formativo.
- **Investigación asistida sobre corpus extensos**: 262 144 tokens permiten cargar artículos completos, informes financieros o expedientes y hacer preguntas cruzadas con referencias internas al documento.
- **Asistentes de operaciones con herramientas**: el énfasis en planificación autónoma y en el manejo de retroalimentación del entorno encaja con agentes que consultan APIs internas, actualizan bases de datos y verifican el resultado de cada acción.
- **Despliegue on-premise con requisitos de soberanía del dato**: al publicarse bajo Apache 2.0 y en safetensors, puede ejecutarse íntegramente en infraestructura propia sin dependencia de APIs externas.
- **Extracción de información estructurada de documentos escaneados**: combinación de visión y contexto largo para digitalizar formularios o contratos por lotes.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en texto con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (la primera visible es «Coding») y con benchmarks como Terminal Bench 2.1 (Terminus) para codificación agéntica en terminal. Sin embargo, **los valores numéricos de esa tabla no están disponibles en la información proporcionada**: el contenido recibido se interrumpe antes de incluir las celdas de resultados.

No se han publicado resultados de benchmarks utilizables en la información disponible, por lo que no se presenta tabla de resultados ni se ofrecen cifras estimadas.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingeniería a partir del número de parámetros y de la configuración de atención descrita; no proceden de mediciones publicadas.

- **VRAM en bf16/fp16**: aproximadamente 55,6 GB solo para pesos. Añadiendo el codificador de visión, activaciones y caché KV, el despliegue se sitúa en torno a 70-80 GB.
- **Caché KV estimada**: con 4 cabezas KV de dimensión 256 en 16 capas de atención completa, la caché es de unos 64 KiB por token en fp16, es decir, aproximadamente 16 GiB para los 262 144 tokens de contexto completo. Las 48 capas restantes (Gated DeltaNet) usan estado recurrente de tamaño constante.
- **GPU recomendadas en bf16**: H100 80 GB, H200, A100 80 GB. Para contexto completo conviene prever el margen de la caché KV o recurrir a tensor parallelism en 2 × A100 40 GB / 2 × L40S.
- **Cuantización INT8/FP8**: pesos en torno a 28-30 GB; encaja en L40S 48 GB, A6000 48 GB o A100 40 GB con contexto moderado.
- **Cuantización INT4**: pesos en torno a 15-17 GB; es la única configuración que cabe con holgura en GPU de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 (32 GB), a costa de degradar la calidad y de limitar la longitud de contexto.
- **Despliegue**: el repositorio declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se han publicado pesos GGUF ni existe confirmación de soporte en llama.cpp u Ollama en la información disponible, por lo que estas rutas no están garantizadas.
- **Latencia y throughput**: no disponibles. El cabezal MTP permite decodificación especulativa, lo que en principio mejora el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

Los comparables que aparecen en la propia model card son los siguientes. La mayoría de sus especificaciones no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262 144 nativo; 1M extensible | Apache 2.0 | Pesos safetensors en Hugging Face | Híbrido Gated DeltaNet + Gated Attention, visión y vídeo nativos, MTP |
| Qwen3.6-27B | 27B (nominal) | no disponible | no disponible | no disponible | Generación anterior de la familia; usado como referencia en la tabla de benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Variante «Plus» de la generación intermedia; perfil probablemente cerrado o vía API |
| Muse Glimmer-30B | ~30B (nominal) | no disponible | no disponible | no disponible | Comparable de tamaño similar citado en la tabla de benchmarks |
| Opus4.6 Max | no disponible | no disponible | no disponible (propietario) | no disponible | Referencia propietaria de techo de rendimiento en la comparativa de la model card |

No se dispone de datos de rendimiento verificables para establecer una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- **Procedencia no verificada**: el repositorio lo publica el usuario `mohanchoudhary24`, no la organización oficial Qwen. Con 0 descargas y 0 likes, y una model card que reproduce material de una publicación oficial (incluida la mención a Qwen Cloud), existe riesgo de que se trate de una réplica no autorizada o de un artefacto generado. Verificar checksums y contrastar con la organización oficial antes de usar los pesos.
- **Ausencia de datos de benchmarks utilizables**: la tabla de la model card está incompleta en la información disponible; no es posible validar las afirmaciones de mejora en código, investigación o tareas agénticas.
- **Cuantizaciones no publicadas**: solo hay safetensors; no se ofrecen GGUF, AWQ ni GPTQ oficiales, lo que complica el despliegue en hardware de consumo y en llama.cpp/Ollama.
- **Idiomas no documentados**: se desconoce el grado real de cobertura del castellano y de otras lenguas; el rendimiento multilingüe debe evaluarse empíricamente antes de asumirlo.
- **Riesgo de alucinación**: como cualquier LLM de esta escala, puede generar contenido plausible pero falso, especialmente en tareas de recuperación de datos y en razonamiento sobre documentos largos. No se han publicado evaluaciones de factualidad.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, filtrado de datos ni política de mitigación.
- **Contexto anunciado frente a contexto efectivo**: los 1 000 000 de tokens son una extensión declarada, no un valor nativo; la degradación de rendimiento más allá de los 262 144 tokens nativos no está medida en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero la licencia se aplica a los artefactos publicados en este repositorio concreto; la procedencia de los pesos condiciona cualquier garantía jurídica.
- **Coste de servido**: en bf16 requiere GPU de 80 GB o tensor parallelism; el contexto completo añade unos 16 GiB de caché KV, lo que encarece el despliegue en producción.
- **Dependencia de la versión de Transformers**: el campo `qwen3_5` de los tags sugiere que se requiere una versión reciente de la librería; versiones antiguas pueden no cargar la arquitectura híbrida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mohanchoudhary24/Qwen3.8-27B
- Página del modelo en Qwen Cloud (citada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
- Servicio Qwen Cloud (citado en la model card): https://www.qwencloud.com
