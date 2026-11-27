# mradermacher/Qwen3-14B-Recurse-i1-GGUF

## Resumen

Qwen3-14B-Recurse-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo Rumiii/Qwen3-14B-Recurse, un ajuste fino de Qwen3-14B orientado a tool calling, recuperación de errores en llamadas a herramientas y razonamiento agéntico. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y el modelo resultante conserva la licencia Apache 2.0 del modelo base.

El modelo subyacente parte de la arquitectura Qwen3 de 14 768 307 200 parámetros (aproximadamente 14,8 mil millones), un transformer denso con capacidad de modo pensamiento (thinking) y soporte de function calling. El ajuste fino se entrenó con los datasets igidn/tool-failure-recovery y Salesforce/xlam-function-calling-60k, lo que lo especializa en escenarios donde el agente debe detectar que una herramienta ha fallado y reformular la llamada en lugar de abandonar la tarea.

La relevancia de esta ficha es práctica: ofrece el modelo en un rango de cuantizaciones que va desde 3,7 GB (i1-IQ1_S) hasta 12,2 GB (i1-Q6_K), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama, algo imposible con los pesos en safetensors de 14,8 B. El repositorio ocupa 170,7 GB en total por acumular todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo thinking |
| Parametros totales | 14 768 307 200 (aproximadamente 14,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); existen cuantizaciones estaticas en mradermacher/Qwen3-14B-Recurse-GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B: un transformer denso de aproximadamente 14,8 mil millones de parámetros con atención estándar y soporte nativo de modo pensamiento, tool calling y razonamiento multi-paso. Sobre esa base, Rumiii/Qwen3-14B-Recurse aplica un ajuste fino supervisado centrado en dos frentes: recuperación tras fallos de herramientas (dataset igidn/tool-failure-recovery) y llamadas a funciones a gran escala (Salesforce/xlam-function-calling-60k). No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO.

La innovación destacable de esta publicación no está en el modelo base sino en el proceso de cuantización: mradermacher genera las variantes i1 usando un fichero imatrix (importance matrix) calculado específicamente para este modelo, lo que mejora la calidad de las cuantizaciones de baja precisión frente a las cuantizaciones estáticas equivalentes. El repositorio incluye el propio fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Las variantes i1 se producen con el pipeline de Unsloth, según las etiquetas de la model card.

## Capacidades

- Generación de texto conversacional multi-turno con soporte de plantilla de chat de Qwen3.
- Tool calling y function calling: el ajuste fino refuerza el formato y la selección de herramientas.
- Recuperación de errores en llamadas a herramientas: el modelo está entrenado para detectar fallos, corregir argumentos y reintentar en lugar de rendirse.
- Razonamiento agéntico multi-paso (agentic), incluyendo planificación de secuencias de llamadas.
- Modo pensamiento (thinking), heredado de Qwen3, para tareas que requieren cadena de razonamiento explícita.
- Capacidades multilingües limitadas: la model card declara únicamente inglés, aunque el modelo base Qwen3 es multilingüe y podría conservar parte de esa capacidad sin garantía.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Agentes de automatización de operaciones: el modelo puede encadenar llamadas a APIs internas y, cuando una devuelve error, reformular la petición con argumentos corregidos; el entrenamiento específico en tool-failure-recovery lo hace adecuado para pipelines donde los fallos de herramientas son frecuentes.
- Integración en asistentes de desarrollo con function calling: conectado a herramientas de compilación, tests o consulta de repositorios, puede gestionar el ciclo llamada-error-reintento sin intervención humana.
- Orquestación de flujos RPA con APIs heterogéneas: al haber sido ajustado con xlam-function-calling-60k, maneja esquemas de funciones diversos y puede actuar como planificador central de un sistema multi-herramienta.
- Chatbots de soporte técnico con acceso a backends: la ventana de contexto de Qwen3 (no confirmada en esta ficha) permite mantener conversaciones largas mientras el modelo consulta sistemas de tickets o bases de conocimiento mediante herramientas.
- Evaluación y generación de trazas agénticas: útil para probar frameworks de agentes (LangGraph, AutoGen) en local con cuantizaciones Q4_K_M de 9,1 GB en una GPU de consumo.
- Despliegue en entornos con hardware limitado: las variantes IQ2/IQ3 (4,4-7,0 GB) permiten ejecutar un modelo de 14,8 B en GPUs de 6-8 GB de VRAM o en CPU con llama.cpp, manteniendo el comportamiento agéntico básico.
- Prototipado de investigación sobre recuperación de errores: el modelo sirve como referencia para estudiar cómo un LLM ajustado maneja fallos de herramientas frente a Qwen3-14B sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente el tamaño del fichero GGUF más 1-2 GB para KV cache y buffers, según longitud de contexto.
- Cuantizaciones ligeras: i1-IQ1_S (3,7 GB) e i1-IQ1_M (3,9 GB) caben en GPUs de 6 GB, con pérdida de calidad notable.
- Cuantizaciones medias: i1-IQ2_M (5,4 GB) e i1-IQ3_M (7,0 GB) caben en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y similares.
- Cuantización recomendada: i1-Q4_K_M (9,1 GB), marcada como "fast, recommended" por el autor; entra en RTX 4070 Ti Super, RTX 4080, RTX 4090 y GPUs de 12 GB o más con contexto moderado.
- Cuantizaciones altas: i1-Q5_K_M (10,6 GB) e i1-Q6_K (12,2 GB) requieren 16 GB de VRAM o descarga parcial a CPU.
- GPUs de datacenter: A100, H100 y L40S ejecutan cualquier variante con holgura y permiten contexto largo.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para serving de alta concurrencia conviene usar los pesos originales en safetensors con vLLM o TGI en lugar de GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, el hardware y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-14B-Recurse-i1-GGUF (este) | 14,8 B | no disponible | Tool calling con recuperación de errores | Apache 2.0 | GGUF (i1, imatrix) |
| Qwen3-14B (base) | 14,8 B | no disponible en esta ficha | Propósito general con thinking y tool calling | Apache 2.0 | safetensors, GGUF |
| Rumiii/Qwen3-14B-Recurse | 14,8 B | no disponible | Ajuste fino del que deriva este modelo | Apache 2.0 | safetensors |
| mradermacher/Qwen3-14B-Recurse-GGUF | 14,8 B | no disponible | Cuantizaciones estáticas del mismo ajuste | Apache 2.0 | GGUF (estáticas) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al de Qwen3-14B sin ajustar.
- Alucinación: como todo LLM, puede inventar nombres de herramientas, parámetros o resultados; el entrenamiento en recuperación de errores no elimina este riesgo, solo mejora la reacción ante fallos detectables.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 degradan la calidad de forma significativa; el propio autor las etiqueta como "for the desperate" o "very low quality". No se recomiendan en producción.
- Contexto: no se ha confirmado la longitud de contexto efectiva de este ajuste; si se necesita contexto largo, conviene verificarla con el modelo base antes de desplegar.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3 y de los datasets de ajuste (xlam-function-calling-60k y tool-failure-recovery) por si imponen restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- Sin benchmarks: no hay métricas publicadas que respalden las afirmaciones de mejora en tool calling frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-14B-Recurse-i1-GGUF
- Modelo base del ajuste: https://huggingface.co/Rumiii/Qwen3-14B-Recurse
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3-14B-Recurse-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3-14B-Recurse-i1-GGUF
- Dataset de recuperación de fallos: https://huggingface.co/datasets/igidn/tool-failure-recovery
- Dataset de function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
