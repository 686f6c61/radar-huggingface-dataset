# pranil00/ONIX-Yi-Coder-9B-Chat-GGUF

## Resumen

ONIX-Yi-Coder-9B-Chat-GGUF es una cuantización en formato GGUF del modelo 01-ai/Yi-Coder-9B-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo consiste en la conversión del checkpoint original a pesos de 5,5 bits por parámetro con el esquema Q5_K_M, generando un único fichero de 5,94 GB que reduce el peso original en FP16 (17,27 GB) en un 65,6 %.

El modelo base, Yi-Coder-9B-Chat, es un transformer de la familia LLaMA con 8.829.403.136 parámetros (8,83 mil millones), desarrollado por 01-ai y especializado en generación de código con soporte de conversación multi-turno. Esta versión cuantizada está pensada para ejecución en hardware de consumo: el autor reporta que cabe en 6,39 GB de memoria unificada en Apple Silicon, 7,44 GB de VRAM dedicada en GPUs NVIDIA y 8,39 GB de RAM en CPU, con una ventana de contexto operativa de 8.192 tokens en aceleración por hardware y 4.096 en CPU.

La relevancia de esta ficha es doble: por un lado, documenta una opción práctica para desplegar un modelo de código de casi 9B en equipos sin GPU de datacenter; por otro, conviene señalar que el artefacto tiene cero descargas y cero likes en el momento de la consulta, y que las métricas de calidad y rendimiento que declara el autor (97,5 % de retención, "48/48 capas aceleradas") proceden de su propio motor de cuantización y no de una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia LLaMA (según model card del artefacto) |
| Parametros totales | 8.829.403.136 (8,83 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU (según model card del artefacto) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el artefacto publicado solo incluye esta variante |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `01-ai--Yi-Coder-9B-Chat-Q5_K_M.gguf`, 5,94 GB) |

## Arquitectura y entrenamiento

El modelo base Yi-Coder-9B-Chat pertenece a la familia de arquitecturas LLaMA según la model card del artefacto, con 8,83 mil millones de parámetros en un transformer denso. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste supervisado sobre el checkpoint base; estos datos corresponden al modelo original de 01-ai y no se reproducen en la documentación de esta cuantización.

Lo que sí documenta el artefacto es el proceso de cuantización: conversión a Q5_K_M con 5,5 bits por peso, ratio de compresión de 2,91x respecto a FP16, y un buffer de KV cache de 384 MB en FP16 que el autor indica como "optimizado". El pipeline utilizado es run-any-model, un motor de optimización device-aware publicado en GitHub por el mismo autor, que según la model card acelera las 48 capas del modelo en Metal. No hay información sobre calibración del proceso de cuantización, dataset de calibración ni metodología de la métrica de retención de calidad del 97,5 %.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación, con soporte de conversación multi-turno.
- Razonamiento sobre código: el nombre "Coder" del modelo base indica orientación a tareas de comprensión y generación de código, aunque la información disponible no detalla benchmarks concretos.
- Conversación: la variante "Chat" del modelo base incorpora plantilla de chat, con tokens de parada `<|im_end|>` y `<|endoftext|>` según el Modelfile de ejemplo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programación en local: el fichero GGUF de 5,94 GB se puede cargar en LM Studio, Jan o llama.cpp en un portátil con 8 GB de VRAM, permitiendo autocompletado y explicación de código sin conexión a servicios externos.
- Revisión de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, el modelo permite analizar fragmentos de código propietario sin enviarlos a una API de terceros, lo que encaja en equipos con políticas estrictas de confidencialidad.
- Prototipado rápido de herramientas de desarrollo: con `run-any-model` o `ollama run`, un desarrollador puede tener una sesión de chat de código operativa en minutos, útil para validar ideas antes de invertir en infraestructura.
- Generación de tests unitarios y documentación técnica: el modelo base está orientado a código y admite conversación multi-turno, lo que permite iterar sobre un fichero y pedir tests o docstrings en pasos sucesivos dentro de la ventana de 8.192 tokens.
- Despliegue en Apple Silicon para equipos de desarrollo: la model card reporta 6,39 GB de memoria unificada y aceleración Metal nativa, adecuado para Macs con 16 GB de RAM unificada que necesiten un asistente de código local.
- Enseñanza y experimentación: al ser un artefacto Apache 2.0 de bajo peso, sirve para prácticas de cuantización, comparación de esquemas GGUF y estudio del impacto de Q5_K_M frente a FP16 en un modelo de 9B.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para esta cuantización. El autor publica únicamente métricas internas de su motor de cuantización, que se recogen a continuación tal cual aparecen en la model card:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 17,27 GB | 5,94 GB | -65,6 % |
| Buffer KV cache | 384 MB (FP16) | 384 MB (FP16) | Optimizado |
| RAM residente total | 17,72 GB | 6,39 GB | -64,0 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 48/48 capas | Optimo |

Estas cifras proceden de la auditoría interna del autor (host Darwin, 16 GB, motor Metal) y no han sido verificadas de forma independiente. La métrica "calidad retenida" no especifica el benchmark ni el conjunto de evaluación empleado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 7,44 GB de VRAM dedicada en GPUs NVIDIA (RTX 30/40/50) según la model card; 6,39 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 8,39 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: el autor cita las series RTX 30/40/50 como compatibles con CUDA. No se mencionan A100, H100 ni otras GPUs de datacenter en la información disponible.
- Cabe en GPU de consumo: sí, según los datos del autor, en tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060 8 GB, RTX 4060, RTX 4070). En Apple Silicon, en equipos con 16 GB de memoria unificada.
- Opciones de despliegue: `run-any-model` (CLI del autor), Ollama (con Modelfile), llama.cpp (`llama-cli` con `-ngl 99`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible en la informacion proporcionada. La model card no incluye tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros modelos. A continuación se comparan los datos disponibles de este artefacto con las variantes del mismo modelo base que se pueden inferir de la documentación, sin datos de rendimiento de terceros:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| ONIX-Yi-Coder-9B-Chat-GGUF (este) | 8,83 B | 8.192 (GPU) / 4.096 (CPU) | Q5_K_M | 5,94 GB | Apache 2.0 |
| Yi-Coder-9B-Chat (base, FP16) | 8,83 B | No disponible | FP16 | 17,27 GB | Apache 2.0 |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de MMLU, HumanEval ni otros benchmarks para establecer una comparación cuantitativa con modelos alternativos como Qwen2.5-Coder-7B o DeepSeek-Coder-6.7B. Cualquier comparación de rendimiento sería especulativa y no se incluye.

## Limitaciones y advertencias

- Artefacto derivado sin validación independiente: la cuantización la publica un usuario individual (pranil00), no 01-ai, y tiene cero descargas y cero likes en el momento de la consulta. No hay evidencia de que terceros la hayan probado.
- Métricas de calidad no verificadas: el "97,5 % de retención" y la "aceleración de 48/48 capas" son cifras del motor del propio autor y no especifican metodología ni benchmark de evaluación.
- Pérdida de precisión por cuantización: Q5_K_M introduce degradación respecto a FP16, especialmente en tareas de generación de código con sintaxis estricta y en razonamiento matemático. El autor estima una pérdida del 2,5 %, pero no se ha medido con HumanEval ni similares.
- Contexto limitado en CPU: la ventana se reduce a 4.096 tokens en ejecución por CPU, la mitad que en GPU, lo que afecta a tareas de análisis de repositorios o ficheros largos.
- Idiomas no documentados: la model card no especifica qué idiomas soporta el modelo base; no se puede asumir un rendimiento correcto en castellano sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado en código por la generación de APIs o funciones inexistentes. Requiere validación de las salidas en cualquier pipeline de producción.
- Sesgos: no documentados en la información disponible. El modelo base puede reproducir sesgos presentes en sus datos de entrenamiento, sin que esta cuantización los mitigue.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una cláusula de exención de responsabilidad total ("AS IS") que traslada al implementador toda la responsabilidad sobre las salidas. Conviene revisar los términos del modelo base de 01-ai por si añaden condiciones adicionales.
- Cadena de custodia del fichero: no se documenta el hash del GGUF ni el proceso de conversión reproducible, lo que dificulta auditar la integridad del artefacto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Yi-Coder-9B-Chat-GGUF
- Modelo base: https://huggingface.co/01-ai/Yi-Coder-9B-Chat
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio del motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
