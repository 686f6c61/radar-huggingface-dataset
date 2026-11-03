# Daniel01410/mt_slm_ctx_compress

## Resumen

`mt_slm_ctx_compress` es un ajuste fino (fine-tune) del modelo `ibm-granite/granite-4.0-h-micro` de IBM, publicado por el usuario Daniel01410 en HuggingFace. Su propósito es muy concreto: actuar como modelo de compactación de sesiones de agente (*agent session compaction*) dentro de la arena `ctx_compress` de la plataforma Microtensor. El modelo lee una sesión de agente de programación de hasta 120 000 tokens y produce un resumen estructurado con nueve encabezados predefinidos.

El modelo base, Granite 4.0 H Micro, es un transformer híbrido Mamba-2/atención con arquitectura MoE (mezcla de expertos) de IBM, diseñado para cargas de trabajo empresariales con un equilibrio entre tamaño reducido y capacidades de razonamiento, código y tool calling. El fine-tune se realizó mediante LoRA con rango 64, fusionado posteriormente en precisión bf16, lo que da como resultado un checkpoint denso de 3 191 396 096 parámetros totales y un repositorio de 6,4 GB en formato safetensors.

La relevancia de este modelo es acotada pero específica: no es un modelo de propósito general, sino una herramienta de infraestructura para pipelines de agentes que necesitan comprimir el historial de una sesión larga en un resumen manejable sin perder información crítica. Su licencia `microtensor-submission` restringe el uso al ecosistema de esa plataforma, lo que limita su aplicabilidad fuera de ese contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (granitemoehybrid), basado en Granite 4.0 H Micro |
| Parámetros totales | 3 191 396 096 |
| Parámetros activos | no disponible |
| Longitud de contexto | 120 000 tokens (entrada de sesión de agente) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | microtensor-submission (otros términos, ver enlace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura `granitemoehybrid` del checkpoint base `ibm-granite/granite-4.0-h-micro` en la revisión `d5f01a3ea75f`. Se trata de un transformer con capas híbridas que combinan atención con mecanismos de estado (Mamba-2) y capas de mezcla de expertos, una configuración diseñada por IBM para reducir el coste computacional manteniendo capacidad de razonamiento. El fine-tune no modifica esta arquitectura: se aplicó LoRA con rango 64 sobre el modelo base y posteriormente se fusionaron los adaptadores en un checkpoint bf16 denso, de ahí que el repositorio contenga pesos completos y no adaptadores separados.

Los datos de entrenamiento provienen del generador propio de la arena `ctx_compress` del repositorio `microtensor-io/microtensor-arenas` (concretamente `arenas/compress/synth.py`), bajo semillas privadas no publicadas. Esto significa que el modelo ha sido entrenado sobre sesiones sintéticas de agente generadas por la propia plataforma, no sobre datos reales de usuarios ni sobre corpus públicos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La carpeta `training/` del repositorio contiene los validadores de registro exigidos por la plataforma y el archivo del proceso, pero no se puntúa como parte del modelo. No se han publicado innovaciones técnicas adicionales más allá del propio procedimiento de compactación.

## Capacidades

- Compactación de sesiones de agente: lee un historial de hasta 120 000 tokens y genera un resumen estructurado con nueve encabezados fijos, diseñado para sustituir el historial completo en la ventana de contexto de un agente posterior.
- Procesamiento de contexto largo: la ventana de 120 000 tokens permite manejar sesiones de programación extensas con múltiples turnos, llamadas a herramientas y resultados intermedios.
- Generación de texto estructurado: el formato de salida está constreñido a un esquema de encabezados, lo que facilita su integración en pipelines automatizados.
- Herencia del modelo base: al estar construido sobre Granite 4.0 H Micro, conserva las capacidades subyacentes de razonamiento, código y tool calling del modelo original, aunque el fine-tune está especializado en la tarea de compactación.
- Multilingüismo: no disponible; la model card no documenta idiomas soportados y los datos de entrenamiento son sintéticos y generados por la plataforma.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Visión o audio: no disponible; el modelo base es de texto.

## Casos de uso

- Compactación de sesiones en agentes de programación: el modelo se usa como paso intermedio en un pipeline de agente que, tras N turnos de interacción con herramientas y código, comprime el historial completo en un resumen de nueve secciones para liberar ventana de contexto en la siguiente fase. Es adecuado porque ha sido entrenado específicamente sobre sesiones sintéticas de ese dominio.
- Integración en la arena `ctx_compress` de Microtensor: el caso de uso principal y documentado; el modelo se evalúa contra otros competidores en la tarea de compactación dentro de la plataforma, y su licencia está vinculada a esos términos.
- Reducción de costes de inferencia en cadenas de agentes: al sustituir un historial de 120 000 tokens por un resumen compacto, se reduce el número de tokens de entrada en llamadas posteriores al LLM principal, lo que disminuye el coste por sesión en despliegues con facturación por token.
- Archivado y auditoría de sesiones: el resumen estructurado con encabezados fijos puede almacenarse como registro legible de una sesión de agente para revisión posterior, sin necesidad de conservar el historial completo.
- Preprocesamiento para sistemas de memoria de agentes: el resumen generado puede alimentar una base de datos de memoria a largo plazo, donde cada sesión se indexa por su compactación en lugar de por el texto bruto.
- Investigación sobre compactación de contexto: el modelo sirve como referencia para estudiar cómo se comportan los fine-tunes de modelos pequeños (3B) en tareas de resumen estructurado de contextos largos, comparándolo con alternativas de mayor tamaño.
- Prototipado de pipelines de agentes con presupuesto de contexto limitado: en entornos donde el modelo principal tiene una ventana menor que la sesión acumulada, este modelo actúa como compresor previo antes de la llamada al modelo generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `training/runs` para el resultado en el conjunto de validación retenido (*held out*), pero no se incluyen cifras en la documentación proporcionada. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas específicas de la tarea de compactación (por ejemplo, ROUGE, fidelidad del resumen o tasa de retención de información).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para los pesos, más overhead de activaciones y caché KV; con contexto de 120 000 tokens, la caché KV puede requerir decenas de GB adicionales según la implementación y el número de capas con atención.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,2 GB para pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,6-2 GB para pesos, más caché KV.
- GPU recomendadas: para contexto completo de 120 000 tokens, se recomienda A100 80 GB o H100 80 GB por la caché KV; para contextos más cortos, una RTX 4090 (24 GB) puede ser suficiente en bf16 o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) para contextos moderados; para el contexto máximo de 120 000 tokens es probable que no quepa en una sola GPU de consumo sin técnicas de atención eficiente o cuantización agresiva de la caché KV.
- Opciones de despliegue: `AutoModelForCausalLM` de Transformers (carga directa según la model card), vLLM, TGI y llama.cpp si se generan cuantizaciones GGUF (no publicadas). No se documentan recetas de despliegue específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt_slm_ctx_compress | 3,19 B | 120 000 tokens | Compactación de sesiones de agente | microtensor-submission | HuggingFace (0 descargas) |
| ibm-granite/granite-4.0-h-micro | no disponible | no disponible | Propósito general (razonamiento, código, tool calling) | Apache 2.0 | HuggingFace (modelo base público) |
| Alternativas de compactación de contexto | no disponible | no disponible | Compactación de sesiones | no disponible | no disponible |

La comparación directa con otros modelos de compactación de sesiones no está disponible en la información proporcionada. El único punto de referencia sólido es el modelo base, que es de propósito general y no está especializado en esta tarea; el fine-tune sacrifica generalidad por rendimiento en el dominio acotado de la arena `ctx_compress`.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `microtensor-submission` remite a los términos de `microtensor.cloud/terms`, que no se detallan en la información disponible; no se garantiza el uso comercial libre fuera del ecosistema de la plataforma. Verificar los términos antes de cualquier despliegue en producción.
- Especialización extrema: el modelo está entrenado exclusivamente para la tarea de compactación con nueve encabezados; su rendimiento fuera de ese formato o dominio no está documentado y probablemente sea deficiente.
- Datos de entrenamiento sintéticos: las sesiones provienen de un generador propio bajo semillas privadas, lo que puede introducir sesgos de distribución respecto a sesiones reales de usuarios y limitar la generalización.
- Riesgo de alucinación: al ser un modelo generativo de resumen, puede inventar detalles no presentes en la sesión original o omitir información crítica; no se documentan métricas de fidelidad.
- Idiomas no documentados: no se especifica qué idiomas soporta; los datos sintéticos podrían estar en inglés y el comportamiento en castellano es incierto.
- Contexto máximo de 120 000 tokens: superar esa longitud no está soportado y puede degradar la calidad del resumen o provocar errores de truncamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la evaluación objetiva.
- Repositorio con 0 descargas y 0 likes: modelo recién publicado y sin validación comunitaria; la carpeta `training/` contiene validadores de la plataforma que no forman parte del modelo puntuable.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones de 4/8 bits en el repositorio, lo que obliga a generarlas manualmente para despliegues con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daniel01410/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia Microtensor: https://www.microtensor.cloud/terms
- Repositorio de arenas (referenciado en la model card): https://github.com/microtensor-io/microtensor-arenas (ruta `arenas/compress/synth.py`)
