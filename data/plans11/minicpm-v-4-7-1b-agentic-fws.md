# Plans11/MiniCPM-V-4.7-1B-Agentic-FwS

## Resumen

MiniCPM-V-4.7-1B-Agentic-FwS es un ajuste fino (fine-tune) del modelo multimodal openbmb/MiniCPM-V-4.7-1B, publicado por el usuario Plans11 en Hugging Face. El modelo base es un transformer multimodal de tipo image-text-to-text con 1.554.476.272 parámetros (aproximadamente 1,55 mil millones), y este ajuste lo especializa en tool calling y function calling dentro de un flujo agéntico: el modelo razona dentro de bloques `<think>...</think>` y a continuación emite uno o varios bloques `<tool_call>`.

El entrenamiento se realizó sobre el split `tool_calling` del dataset nvidia/Nemotron-SFT-Agentic-v4 y se estructuró en dos rondas de SFT con adaptadores LoRA fusionados en los pesos fp16, seguidas de una ejecución de aprendizaje por refuerzo con FlashREINFORCE. Los nombres y formas de los tensores son idénticos a los del modelo base, por lo que cualquier cargador compatible con MiniCPM-V-4.7-1B puede cargar este repositorio sin modificaciones.

Su relevancia actual radica en que demuestra que un modelo de menos de 2B de parámetros puede alcanzar una tasa de emisión de tool calls del 100 % y un exact match del 41,4 % en el conjunto de validación del dataset, superando en esa métrica concreta a una referencia como Claude Haiku 5.5 ejecutada como subagente (33,4 %). La licencia Apache 2.0 y el tamaño reducido lo hacen atractivo para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base MiniCPM-V-4.7-1B |
| Parametros totales | 1.554.476.272 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16/safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del MiniCPM-V-4.7-1B, un transformer multimodal orientado a tareas de imagen-texto-a-texto. El ajuste no altera la topologia: los tensores mantienen nombres y formas idénticos a los del modelo base, y los adaptadores LoRA empleados durante el entrenamiento se fusionaron en los pesos fp16 finales. El pipeline declarado es `image-text-to-text` y la libreria de referencia es `transformers`.

El entrenamiento se dividió en dos rondas supervisadas y una de refuerzo. La ronda 1 combinó Finetuning with Sampling, ASFT y DPO con un termino NLL, alcanzando un exact match de 0,314 sobre el conjunto de validación de 1000 filas. La ronda 2 encadenó tres ejecuciones continuadas de SFT con LoRA para tool calling (v3, v5 y v6), elevando el exact match hasta 0,409 en v6. Sobre v6 se aplicó una ejecución de FlashREINFORCE con aproximadamente 2.560 prompts nuevos y fundamentados (grounded), que produjo la revisión `main` (v9) con un exact match de 0,414. El autor documenta que la mejora de v9 sobre v6 es un empate estadístico (diferencia de +0,005 con error estándar de 0,0102), por debajo del umbral de dos errores estándar usado para aceptar ejecuciones anteriores. Los datos de entrenamiento provienen del split `tool_calling` de nvidia/Nemotron-SFT-Agentic-v4, complementado con los datasets ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47 y ewin-reg/Nemotron-Agentic-ToolCalling-FwS-MiniCPM-V-4.7-clean.

## Capacidades

- Generación de tool calls y function calls: el modelo emite bloques `<tool_call>` estructurados tras razonar en `<think>...</think>`.
- Modo de razonamiento explícito (thinking) antes de la llamada a herramienta.
- Procesamiento multimodal imagen-texto: pipeline `image-text-to-text` heredado del modelo base.
- Conversación multi-turno.
- Soporte de agentes y razonamiento multi-paso, orientado a la primera llamada a herramienta y a cadenas de llamadas.
- Capacidades multilingües limitadas al inglés según la model card.
- Especialización en tool use agéntico mediante SFT, DPO y aprendizaje por refuerzo (FlashREINFORCE).
- No se documentan capacidades de audio ni de visión más allá del pipeline declarado.

## Casos de uso

- Automatización de agentes de atención al cliente: el modelo puede razonar sobre la petición del usuario y emitir la llamada a la herramienta adecuada (consulta de pedidos, gestión de tickets) con una tasa de emisión de tool calls del 100 % en el conjunto de validación, lo que reduce respuestas en texto plano cuando se espera una acción.
- Orquestación de pipelines de CI/CD: integrado como planificador de acciones que traduce instrucciones en lenguaje natural a llamadas de herramientas de despliegue, con el bloque `<think>` como traza auditable del razonamiento previo.
- Enrutamiento de consultas en asistentes con múltiples herramientas: gracias a una coincidencia de nombre de herramienta del 83,1 %, resulta adecuado para seleccionar la función correcta entre un catálogo definido antes de invocar argumentos.
- Extracción estructurada de datos desde imágenes y texto: al ser un modelo image-text-to-text, puede recibir una captura o documento y generar la llamada a herramienta que persiste los campos extraídos.
- Prototipado de agentes en hardware de consumo: con 1,55B de parámetros y licencia Apache 2.0, permite iterar sobre flujos agénticos en una sola GPU sin costes de API.
- Evaluación comparativa de estrategias de entrenamiento: el repositorio documenta revisiones intermedias (v3, v5, v6, v9) con métricas pareadas, lo que lo convierte en un banco de pruebas útil para investigar SFT, DPO y RL en modelos pequeños.
- Generación de llamadas encadenadas en asistentes de desarrollo: el modelo puede emitir varias llamadas seguidas, aunque el autor advierte que en prompts con varios pasos a menudo solo envía la primera.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1000 filas de validación del split `tool_calling` de nvidia/Nemotron-SFT-Agentic-v4 (filas de índice 20000 o superior, no usadas en entrenamiento), evaluando el primer turno de tool call con decodificación greedy.

| Modelo | Exact match | Args match | Name match | Emite llamada |
|---|---|---|---|---|
| Ronda 1 (`ab2a7d9`) | 0,314 | 0,337 | 0,754 | 0,997 |
| Ronda 2, v3 | 0,368 | 0,394 | 0,792 | 0,996 |
| Ronda 2, v5 | 0,389 | 0,416 | 0,790 | 0,993 |
| Ronda 2, v6 (`f7c6ea0`) | 0,409 | 0,440 | 0,832 | 0,999 |
| Ronda 2, v7 (no usado) | 0,409 | 0,439 | 0,822 | 0,999 |
| Ronda 2, v8 (no usado) | 0,405 | 0,445 | 0,819 | 0,996 |
| v9, FlashREINFORCE desde v6 (`main`) | 0,414 | 0,440 | 0,831 | 1,000 |
| Referencia: Claude Haiku 5.5 como subagente | 0,334 | 0,372 | 0,724 | 0,895 |

Comparación pareada de la ronda 2 frente a la ronda 1 sobre las mismas 1000 filas: ganancia de exact match de +0,095 (126 filas que pasan a correctas, 31 que pasan a incorrectas), error estándar pareado de 0,0122, equivalente a 7,8 errores estándar.

Comparación pareada de v9 (`main`) frente a v6: exact +0,005 con error estándar de 0,0102 (55 filas nuevas correctas, 50 nuevas incorrectas), name -0,001, args iguales. El autor lo califica explícitamente como empate estadístico.

Comparación pareada de v9 frente a Claude Haiku 5.5: exact +0,080 (error estándar 0,0141; 142 filas solo correctas en v9, 62 solo en Haiku), args +0,068 (0,0147), name +0,107 (0,0161). El autor advierte que estas cifras miden la concordancia con el estilo del dataset Nemotron, no la habilidad general de uso de herramientas, y que Haiku se ejecutó como subagente de Claude Code, no mediante llamada directa a la API.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (tamaño del repositorio), más overhead de activaciones y del procesador visual; en la práctica se recomienda reservar al menos 5-6 GB.
- En cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB. No se han publicado cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para fp16; A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para uso individual.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en fp16, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, aunque al mantener tensores idénticos al modelo base, los cargadores compatibles con MiniCPM-V-4.7-1B deberían funcionar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Agentic-FwS | 1,55B | no disponible | Especializado (exact 0,414 en val Nemotron) | Apache 2.0 | Hugging Face |
| openbmb/MiniCPM-V-4.7-1B (base) | 1,55B | no disponible | No especializado | no disponible en la información | Hugging Face |
| Claude Haiku 5.5 (referencia del autor) | no disponible | no disponible | Exact 0,334 en el mismo val | Propietaria | API de Anthropic |

El autor no proporciona comparaciones con otros modelos pequeños de la misma categoría (por ejemplo, Qwen2.5-VL o SmolVLM), por lo que la comparativa se limita al modelo base y a la referencia propietaria incluida en la model card.

## Limitaciones y advertencias

- El conjunto de validación pertenece al mismo dataset y estilo que los datos de entrenamiento; las métricas reflejan concordancia con las respuestas de Nemotron, no habilidad general de uso de herramientas.
- En prompts que encadenan varios pasos, el modelo a menudo emite solo la primera llamada, según advierte el autor.
- La revisión `main` (v9) no supera el umbral estadístico de mejora frente a v6; el autor la eligió por decisión del propietario, no por superioridad medida. Para reproducir v6 debe usarse la revisión `f7c6ea0`.
- El benchmark anterior de 128 filas sobreestimó la precisión (0,422 frente a 0,314 en el conjunto de 1000 filas); no es comparable con las cifras actuales.
- Idioma limitado al inglés según la model card.
- Riesgo de alucinación en argumentos de herramientas: la coincidencia de argumentos es del 44,0 %, muy por debajo de la coincidencia de nombre (83,1 %).
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones de los datasets de entrenamiento (Nemotron-SFT-Agentic-v4 se distribuye bajo OpenMDW-1.1) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Plans11/MiniCPM-V-4.7-1B-Agentic-FwS
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Dataset principal: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Dataset derivado: https://huggingface.co/datasets/ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47
- Dataset derivado: https://huggingface.co/datasets/ewin-reg/Nemotron-Agentic-ToolCalling-FwS-MiniCPM-V-4.7-clean
- Papers referenciados en los tags: arXiv 2610.02140, 2509.23753, 2404.19733, 2609.17848, 2512.12895, 2402.13669, 2605.26097, 2610.10447, 2109.01903, 2203.14465, 2602.03022
