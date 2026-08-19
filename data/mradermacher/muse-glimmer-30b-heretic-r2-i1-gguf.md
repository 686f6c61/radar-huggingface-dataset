# mradermacher/Muse-Glimmer-30B-heretic-r2-i1-GGUF

## Resumen

Muse-Glimmer-30B-heretic-r2-i1-GGUF es una cuantización GGUF con imatrix del modelo base `gjtgjt/Muse-Glimmer-30B-heretic-r2`, una variante "heretic" (abliterated y uncensored) del modelo Muse-Glimmer-30B desarrollado por Meta. Este último es un modelo abierto de 30B parámetros diseñado para agentes locales siempre activos, con licencia Apache 2.0, afinado para uso de herramientas, tareas de larga duración y recuperación de fallos. La variante heretic elimina las restricciones de seguridad del modelo original, ofreciendo una salida sin censura.

El repositorio de mradermacher proporciona cuatro archivos GGUF con distintos niveles de cuantización (desde Q2_K hasta Q4_K_S), todos ellos generados con imatrix para optimizar la calidad de la cuantización. El modelo es multimodal (procesa imágenes y texto) y soporta inglés y chino. Con aproximadamente 27,85 mil millones de parámetros, es adecuado para ejecutarse en una sola GPU de gama alta, lo que lo convierte en una opción práctica para despliegues locales de agentes conversacionales y herramientas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (arquitectura Muse Glimmer de Meta) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q4_K_S |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal desarrollado por Meta, diseñado específicamente para agentes locales que requieren ejecución continua en un solo GPU. Su entrenamiento se centró en tres pilares: uso fiable de herramientas (tool calling), ejecución de tareas de larga duración y recuperación ante fallos. La variante "heretic" aplica una técnica de abliteration que elimina los mecanismos de rechazo y censura del modelo original, resultando en una salida sin restricciones.

El repositorio de mradermacher contiene cuantizaciones GGUF generadas con imatrix (importance matrix), un método que mejora la calidad de la cuantización al ponderar la importancia de los pesos. Los archivos se ofrecen en varios niveles de compresión, permitiendo al usuario elegir entre tamaño y fidelidad. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, lo que permite tareas como descripción de imágenes, OCR o razonamiento visual.
- Generación de texto y razonamiento multi-paso: puede encadenar pasos de razonamiento para resolver problemas complejos.
- Tool calling / function calling: soporta invocación de herramientas externas, esencial para agentes que interactúan con APIs o ejecutan acciones.
- Ejecución de tareas largas: optimizado para mantener contexto y coherencia en sesiones prolongadas.
- Recuperación de fallos: diseñado para detectar y corregir errores durante la ejecución de tareas.
- Multilingüe: soporta inglés y chino, aunque no se especifica la calidad en otros idiomas.

## Casos de uso

- Asistentes personales locales: el modelo puede ejecutarse en un equipo de sobremesa con una GPU de 24 GB, proporcionando un asistente conversacional con acceso a herramientas y sin depender de la nube.
- Agentes autónomos de automatización: gracias a su soporte de tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo que involucran APIs, bases de datos o scripts.
- Análisis de documentos con imágenes: su capacidad multimodal permite extraer información de capturas, diagramas o documentos escaneados, combinando texto e imagen.
- Chat conversacional multilingüe: útil para aplicaciones de atención al cliente en inglés y chino, con contexto largo (aunque no se especifica la longitud exacta).
- Prototipado de investigación: al ser de código abierto y sin censura, facilita experimentos en generación de texto libre y estudios de comportamiento de modelos abliterated.
- Despliegue en edge computing: con cuantizaciones pequeñas (Q2_K de 10,8 GB), puede ejecutarse en dispositivos con VRAM limitada, como laptops con RTX 4060 o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño de los archivos GGUF: Q2_K 10,8 GB, IQ3_XXS 11,2 GB, IQ3_M 12,9 GB, Q4_K_S 16,2 GB.
- VRAM estimada para inferencia: para Q4_K_S se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090); para Q2_K, 12 GB pueden ser suficientes (RTX 3060/4070).
- GPU recomendadas: RTX 3090, RTX 4090, A100, o cualquier GPU con 16-24 GB de VRAM para cuantizaciones altas.
- Cabe en GPU de consumo: sí, en GPUs con 12 GB o más, dependiendo de la cuantización elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato.
- Latencia y throughput: no disponible; depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (original) | ~30B | No disponible | Apache-2.0 | Safetensors | Modelo base de Meta, sin abliteration |
| Muse-Glimmer-30B-heretic-r2 (base) | ~27,85B | No disponible | Apache-2.0 | Safetensors | Variante abliterated/uncensored |
| Muse-Glimmer-30B-heretic-r2-i1-GGUF (este) | ~27,85B | No disponible | Apache-2.0 | GGUF | Cuantización con imatrix de la variante heretic |

No se dispone de información sobre otros modelos comparables de la misma categoría (agentes locales de 30B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Sesgos potenciales: al ser una variante sin censura, los sesgos del entrenamiento original pueden manifestarse sin atenuación.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Longitud de contexto desconocida: no se especifica el contexto máximo; en tareas de agentes largas, podría ser insuficiente.
- Idiomas limitados: solo inglés y chino; otros idiomas pueden tener rendimiento degradado.
- Licencia Apache-2.0 permite uso comercial, pero la variante "heretic" puede violar los términos de uso de Meta si se redistribuye como modelo oficial; verificar cumplimiento.
- Para producción, es esencial validar el comportamiento del modelo en el dominio específico y considerar el uso de cuantizaciones más altas (Q4_K_S) para mayor fidelidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-r2-i1-GGUF
- Repositorio estático (sin imatrix): https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-r2-GGUF
- Modelo base (variante heretic): https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-r2
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentación de API de Muse Glimmer: https://dev.meta.ai/docs/muse-glimmer/get-the-model
- Dell Enterprise Hub (GGUF del modelo original): https://dell.huggingface.co/models/meta-models/Muse-Glimmer-30B-GGUF
