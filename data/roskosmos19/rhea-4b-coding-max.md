# roskosmos19/Rhea-4B-Coding-max

## Resumen

Rhea-4B-Coding-max es un modelo de lenguaje especializado en código y razonamiento agéntico, desarrollado por el usuario roskosmos19 a partir de un ajuste fino del modelo Aquiles-ai/Athenea-4B-Coding. Con 4.022 millones de parámetros, está diseñado para tareas de programación que requieren razonamiento estructurado en varias pasadas: una primera implementación, una auto-revisión de errores y casos límite, y una versión final optimizada. El modelo emplea etiquetas de razonamiento (`<think>`, `<review>`, `<final>`) para hacer explícito el proceso de depuración y refinamiento del código.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado como *uncensored* (sin restricciones de contenido) y solo declara soporte para inglés. Su relevancia actual radica en la tendencia hacia modelos pequeños y especializados que pueden desplegarse en hardware de consumo mientras ofrecen capacidades de razonamiento multi-paso y uso de herramientas, orientadas a pipelines de agentes y generación de código en producción.

No se dispone de información sobre la longitud de contexto, la arquitectura interna más allá de su base Qwen3 (según los tags) ni datos de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, segun tags; detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible via comunidad (mradermacher/Rhea-4B-Coding-max-GGUF); otras no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2 shards, 398 tensores); GGUF por comunidad |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de la familia Qwen3, según los tags del repositorio, con 4.022 millones de parámetros. Se trata de un ajuste fino (finetune) del modelo Aquiles-ai/Athenea-4B-Coding, que a su vez parte de una base no censurada. El entrenamiento utilizó el dataset Aquiles-ai/Athenea-Coding-100k, que incluye desafíos de programación, cadenas de razonamiento estructuradas y explicaciones en lenguaje natural en múltiples lenguajes de programación, junto con el dataset propio roskosmos19/Rhea-Coding.

La innovación principal es el esquema de razonamiento multi-paso con etiquetas explícitas: `<think>` para la fase de auto-revisión (Pass 2), `<review>` para documentar los resultados de la revisión y `<final>` para la versión optimizada (Pass 3). Según la model card, este estructura garantiza funcionalidad idéntica entre pasadas mientras mejora la estructura del código, los comentarios y la robustez. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Nota relevante: el repositorio fue corregido el 2026-11-13 porque anteriormente no podía cargarse con Transformers (el índice de safetensors contenía una configuración de tokenizer en lugar del mapa de pesos, y los tokens especiales estaban corruptos). Los pesos no se modificaron en esa corrección.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especialización en tareas algorítmicas y de depuración.
- Razonamiento multi-paso estructurado: implementación inicial, auto-revisión de errores, casos límite, seguridad y rendimiento, y versión final optimizada.
- Auto-revisión de código para detección de bugs y optimización.
- Soporte de herramientas agénticas (*agentic tools*) para agentes de IA, según la model card.
- Razonamiento paso a paso dentro de bloques ` thinking`.
- Generación sin censura (*uncensored*), con visibilidad completa del razonamiento.
- Compatibilidad con frameworks de inferencia abiertos (Transformers, vLLM, TGI).
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- **Generación de código en producción con auto-revisión**: el modelo puede generar una función, revisar sus propios errores y entregar una versión final optimizada en una sola llamada, lo que reduce la necesidad de iteraciones manuales en pipelines de CI/CD.
- **Depuración asistida**: dado un fragmento de código con un fallo, el modelo emplea la fase `<review>` para identificar casos límite y problemas de seguridad antes de proponer una corrección en `<final>`.
- **Diseño de algoritmos**: para problemas de estructuras de datos y algoritmos, el razonamiento multi-paso permite explorar una solución, revisar su complejidad y entregar una versión refinada.
- **Agentes de codificación autónomos**: gracias al soporte de *tool calling* declarado, puede integrarse en agentes que ejecutan comandos, consultan documentación o aplican parches de forma iterativa.
- **Asistente de revisión de código (code review)**: el modelo puede analizar un *diff* o un fichero completo y documentar en `<review>` los problemas detectados (seguridad, rendimiento, legibilidad) antes de proponer cambios.
- **Generación de tests unitarios**: a partir de una implementación, el modelo puede razonar sobre los casos límite y producir pruebas que cubran escenarios no triviales.
- **Prototipado rápido en hardware de consumo**: con 4B parámetros y cuantizaciones GGUF de la comunidad, puede ejecutarse en GPUs consumer para tareas de asistencia de código en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (4B parámetros): aproximadamente 8 GB en bf16/fp16; alrededor de 4-5 GB en cuantización Q8; aproximadamente 2,5-3 GB en Q4_K_M (GGUF).
- **GPU recomendadas**: para bf16 sin cuantizar, una RTX 4090 (24 GB) o A100/H100 ofrecen margen amplio; una RTX 3090/4080 (16-24 GB) también es suficiente.
- **Cabe en GPU consumer**: sí, en GPUs con 8 GB o más en cuantizaciones Q4/Q5; en bf16 requiere al menos 8-10 GB de VRAM efectiva.
- **Opciones de despliegue**: Transformers (con `flash_attention_2` opcional), vLLM, TGI, llama.cpp/Ollama mediante los GGUF de la comunidad (mradermacher/Rhea-4B-Coding-max-GGUF).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rhea-4B-Coding-max | 4,02B | no disponible | Apache 2.0 | Hugging Face (safetensors + GGUF comunidad) | Especializado en código, multi-paso, uncensored |
| Aquiles-ai/Athenea-4B-Coding | ~4B | no disponible | no disponible | Hugging Face | Modelo base del que deriva Rhea |
| Qwen2.5-Coder-3B / 7B (referencia de familia) | 3B / 7B | no disponible en esta ficha | Apache 2.0 (segun familia) | Hugging Face | Alternativa de código de tamano similar; datos no verificados en esta busqueda |

No se dispone de datos de rendimiento comparativo verificables en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Modelo uncensored**: la model card advierte explícitamente de que la base no está censurada y que el usuario es plenamente responsable del contenido generado; está destinado exclusivamente a investigación y experimentación.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar APIs, funciones o dependencias inexistentes, especialmente en la fase de implementación inicial; la fase de auto-revisión mitiga pero no elimina este riesgo.
- **Idioma**: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- **Contexto**: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de repositorios grandes.
- **Historial del repositorio**: el repositorio tuvo problemas de carga con Transformers hasta la corrección del 2026-11-13 (índice de pesos y tokens especiales corruptos); conviene usar la versión actualizada y verificar la tokenización en producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza *uncensored* del modelo traslada al integrador la responsabilidad legal y ética sobre las salidas.
- **Etiquetas `<review>` y `<final>`**: según la model card, son etiquetas de texto plano, no tokens especiales del tokenizer; los parsers de producción deben tenerlo en cuenta.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la comparación objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max
- Modelo base: https://huggingface.co/Aquiles-ai/Athenea-4B-Coding
- Dataset de entrenamiento: https://huggingface.co/datasets/Aquiles-ai/Athenea-Coding-100k
- Dataset propio: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- GGUF de la comunidad: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-GGUF
