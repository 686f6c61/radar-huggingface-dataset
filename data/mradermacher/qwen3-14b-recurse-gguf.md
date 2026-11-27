# mradermacher/Qwen3-14B-Recurse-GGUF

## Resumen

Qwen3-14B-Recurse-GGUF es la versión cuantizada en formato GGUF del modelo Rumiii/Qwen3-14B-Recurse, un ajuste fino de Qwen3-14B orientado a tool calling, function calling y recuperación de errores en flujos agénticos. La cuantización la publica mradermacher, un conocido empaquetador de pesos GGUF para llama.cpp y ecosistemas compatibles. El modelo base parte de la arquitectura Qwen3 de 14 768 307 200 parámetros (aproximadamente 14,8 mil millones), un transformer denso con modo de razonamiento explícito ("thinking") y soporte nativo de herramientas.

El interés del modelo reside en su especialización: el ajuste fino se ha entrenado con los datasets igidn/tool-failure-recovery y Salesforce/xlam-function-calling-60k, lo que lo orienta a escenarios donde el modelo debe invocar funciones, interpretar errores de herramientas y reintentar de forma autónoma. Esto lo hace relevante para pipelines agénticos en producción, donde la robustez ante fallos de API o respuestas malformadas es crítica.

Esta ficha cubre la versión GGUF, que ofrece 11 cuantizaciones estáticas desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite desplegar el modelo en hardware de consumo sin necesidad de GPUs de datacenter. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo de razonamiento "thinking" y soporte de tool calling |
| Parametros totales | 14 768 307 200 (14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-14B, un transformer denso de aproximadamente 14,8 mil millones de parámetros con atención estándar y modo de razonamiento explícito. El ajuste fino se ha realizado sobre dos datasets: igidn/tool-failure-recovery, centrado en la recuperación ante fallos de herramientas, y Salesforce/xlam-function-calling-60k, un corpus de 60 000 ejemplos de llamadas a funciones. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El tag "unsloth" sugiere que el ajuste fino pudo realizarse con la librería Unsloth, optimizada para entrenamiento eficiente en memoria, aunque este dato no se confirma en la model card.

La contribución de esta ficha (la versión GGUF) es puramente de cuantización: mradermacher ha generado cuantizaciones estáticas a partir del modelo base en formato Hugging Face, sin cuantizaciones ponderadas/imatrix en el momento de la publicación. Las cuantizaciones Q4_K_M y Q4_K_S se marcan como "fast, recommended", mientras que Q6_K y Q8_0 se señalan como de mayor calidad. No se documentan innovaciones arquitectónicas adicionales más allá de las propias de Qwen3.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo "thinking" explícito (etiqueta reasoning en el modelo base).
- Tool calling y function calling: invocación estructurada de funciones externas.
- Recuperación de errores en flujos agénticos: el ajuste fino con tool-failure-recovery entrena al modelo para detectar y corregir fallos en llamadas a herramientas.
- Uso agéntico multi-paso (agentic, tool-use).
- Capacidad de razonamiento general y resolución de problemas.
- No se documentan capacidades de visión, audio ni otros modos en la información disponible.

## Casos de uso

- Agentes autónomos con herramientas externas: el modelo puede planificar secuencias de llamadas a APIs, interpretar las respuestas y reintentar cuando una herramienta falla, gracias al entrenamiento específico en tool-failure-recovery.
- Integración en pipelines de function calling: adecuado para orquestadores que necesitan que el LLM emita JSON estructurado de llamadas a funciones, con el corpus xlam como base de entrenamiento.
- Asistentes de atención al cliente con acceso a sistemas internos: el modelo puede consultar bases de datos o CRMs mediante herramientas y gestionar conversaciones multi-turno en inglés.
- Automatización de tareas de back-office: extracción de datos, consultas a APIs y ejecución de acciones condicionales con validación de resultados.
- Desarrollo de agentes de código con ejecución de herramientas: el modelo puede invocar intérpretes o linters y recuperarse de errores de ejecución.
- Despliegue en local para prototipado de agentes: las cuantizaciones Q4_K_M (9,1 GB) permiten ejecutar el modelo en GPUs de consumo para iterar sobre diseños de agentes sin coste de API.
- Evaluación de robustez agéntica: útil como baseline para comparar estrategias de recuperación de errores en sistemas multi-herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, incluyendo overhead de contexto):
  - Q2_K (5,9 GB): ~7-8 GB de VRAM.
  - Q4_K_M (9,1 GB): ~11-12 GB de VRAM.
  - Q5_K_M (10,6 GB): ~13 GB de VRAM.
  - Q6_K (12,2 GB): ~15 GB de VRAM.
  - Q8_0 (15,8 GB): ~18-19 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_S; GPUs de datacenter (A100, H100) no necesarias pero válidas para mayor throughput.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 16-24 GB; las cuantizaciones Q2_K a Q4_K_S caben en 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para esta versión (orientados a safetensors); para esos backends usar el modelo base Rumiii/Qwen3-14B-Recurse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-14B-Recurse (este) | 14,8 B | no disponible | Tool calling y recuperación de errores | Apache 2.0 | GGUF / safetensors |
| Qwen3-14B (base) | 14,8 B | no disponible | Propósito general, thinking | Apache 2.0 | safetensors |
| Rumiii/Qwen3-14B-Recurse (base) | 14,8 B | no disponible | Tool calling y recuperación de errores | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas. La comparativa se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de 14 B, especialmente en llamadas a funciones con esquemas complejos.
- El ajuste fino está sesgado hacia los datasets de tool calling utilizados; puede degradarse en tareas generales fuera de ese dominio.
- No se documentan evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3 tiene sus propios términos que conviene revisar.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la fiabilidad del formato de llamadas a funciones; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/ponderadas disponibles en el momento de la publicación, lo que puede afectar la calidad frente a alternativas cuantizadas con imatrix.
- El repositorio ocupa 102 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3-14B-Recurse-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3-14B-Recurse
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-14B-Recurse-GGUF
- Dataset tool-failure-recovery: https://huggingface.co/datasets/igidn/tool-failure-recovery
- Dataset xLAM function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
