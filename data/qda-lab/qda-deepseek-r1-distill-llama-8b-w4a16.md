# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A16 es una versión cuantizada a 4 bits en pesos (W4A16) del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el usuario qda-lab. El modelo base es un destilado de razonamiento de DeepSeek que parte de la arquitectura Llama y ha sido entrenado para reproducir el comportamiento de cadena de pensamiento de DeepSeek-R1. Esta variante reduce el peso de los pesos a 4 bits manteniendo las activaciones en 16 bits, con el objetivo de abaratar la inferencia y el almacenamiento sin renunciar al pipeline de razonamiento del original.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 8.030.261.248 parámetros en hardware más modesto gracias a la cuantización; por otro, el autor publica una evaluación propia con vLLM 0.27.1 sobre GH200 que sirve como referencia de la degradación introducida por la cuantización. El checkpoint se distribuye en formato compressed-tensors y está pensado para servirse directamente con vLLM mediante un único comando.

No se dispone de información sobre licencia, idiomas soportados ni pipeline declarado en la model card; estos datos figuran como no disponibles y deben verificarse contra el modelo base antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, modelo base DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama con 8.030.261.248 parámetros, derivado del destilado DeepSeek-R1-Distill-Llama-8B. La model card no detalla la composición del dataset de destilación ni el número de tokens de entrenamiento; esa información corresponde al modelo base y no se reproduce en esta ficha. La innovación principal de esta variante es la cuantización W4A16: los pesos se almacenan en 4 bits mientras las activaciones se mantienen en 16 bits, lo que reduce el tamaño del repositorio a 5,7 GB frente a los aproximadamente 16 GB de un checkpoint en bf16.

El proceso de cuantización se ha realizado con la herramienta QDA del propio autor y produce un checkpoint en formato compressed-tensors, integrable directamente en vLLM. La model card no documenta la técnica exacta de cuantización (por ejemplo, granularidad de grupo, calibración o si se aplica GPTQ/AWQ u otro método), por lo que ese detalle figura como no disponible. Tampoco se indica si se ha realizado un ajuste posterior a la cuantización para recuperar precisión.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base destilado de DeepSeek-R1, con cadenas de pensamiento antes de la respuesta final.
- Resolución de problemas matemáticos de competición: la evaluación del autor incluye AIME 2025 y HMMT Feb 2026.
- Razonamiento científico y de conocimiento experto: se evalúa con GPQA-Diamond.
- Generación y razonamiento sobre código: se evalúa con LiveCodeBench v6.
- Seguimiento de instrucciones: se evalúa con IFEval.
- Compatibilidad con tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y demostraciones paso a paso; su puntuación de 27,6 en AIME 2025 + HMMT Feb 2026 lo hace útil como asistente de estudio o verificación de soluciones, no como sustituto de un matemático.
- Tutoría técnica y científica: con 48,1 en GPQA-Diamond, puede emplearse para generar explicaciones razonadas en dominios de física, química y biología a nivel de posgrado, siempre con revisión humana.
- Asistencia de programación con razonamiento: su 37,8 en LiveCodeBench v6 permite integrarlo en entornos de desarrollo para explicar errores, proponer refactorizaciones y razonar sobre fragmentos de código, aunque requiere validación en CI.
- Despliegue en hardware limitado: al ocupar 5,7 GB en disco y requerir menos VRAM que el modelo en bf16, es adecuado para servir en una única GPU de consumo o en instancias cloud pequeñas mediante vLLM.
- Prototipado de pipelines de razonamiento: sirve para experimentar con cadenas de pensamiento y sampling configurable (temperatura 0,6, top_p 0,95 según la model card) antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: al publicar el autor métricas propias, puede usarse como referencia para medir la pérdida de precisión de W4A16 frente al modelo base en tareas de matemáticas, ciencia y código.
- Generación de documentación técnica con instrucciones: su 62,7 en IFEval permite usarlo en tareas de formato y seguimiento de instrucciones estructuradas, con verificación posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, evaluados con vLLM 0.27.1 sobre GH200, batching estático, sampling `{"temperature": 0.6, "top_p": 0.95}` y semillas 17+j:

| Benchmark | Puntuación (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 27,6 |
| GPQA-Diamond | 48,1 |
| LiveCodeBench v6 | 37,8 |
| IFEval | 62,7 |
| Media | 44,1 |

No se han publicado en la información disponible resultados del modelo base sin cuantizar para comparar directamente la degradación introducida por W4A16, ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 5,7 GB en disco; con overhead de KV cache y activaciones en vLLM, se estima un consumo de aproximadamente 7-9 GB para contextos moderados, aunque el autor no publica una cifra oficial.
- GPU recomendadas: el autor evalúa sobre GH200; por tamaño, el modelo cabe en GPUs de 16 GB o más.
- GPU de consumo: sí cabe en tarjetas como RTX 4080 (16 GB), RTX 4090 (24 GB) o RTX 5090 (32 GB), siempre que la longitud de contexto no fuerce un KV cache excesivo.
- Opciones de despliegue: vLLM es el soporte principal (`vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16`); el formato compressed-tensors no es directamente compatible con llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: no disponibles; la model card no publica métricas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W4A16 | 8,03 B | no disponible | W4A16 | no disponible | safetensors (compressed-tensors) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03 B | no disponible | bf16/fp16 | no disponible en esta ficha | safetensors |
| DeepSeek-R1-Distill-Qwen-7B | 7 B aprox. | no disponible | bf16/fp16 | no disponible en esta ficha | safetensors |

La comparación con el modelo base es la más relevante: misma arquitectura y parámetros, pero el checkpoint cuantizado reduce el peso a 5,7 GB y pierde precisión en los benchmarks publicados (sin cifra del original en esta información). Frente a destilados de otros tamaños de la familia R1, la diferencia principal es la familia arquitectónica (Llama frente a Qwen) y el soporte nativo de vLLM vía compressed-tensors.

## Limitaciones y advertencias

- La cuantización W4A16 introduce pérdida de precisión respecto al modelo base; el autor no publica la comparación directa, por lo que la degradación real en cada tarea debe medirse antes de adoptarlo.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios científicos y matemáticos fuera de la distribución de entrenamiento.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe verificarse en el modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B.
- Idiomas soportados no disponibles: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: planificar el KV cache y los límites de prompt con cautela.
- El formato compressed-tensors limita las opciones de despliegue a vLLM y herramientas compatibles; no es un GGUF listo para llama.cpp.
- Modelo con muy pocas descargas (9) y ningún like en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.
- El sampling recomendado (temperatura 0,6, top_p 0,95) es el usado en la evaluación; otros ajustes pueden alterar el rendimiento reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A16
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de DeepSeek-R1: no disponible en la información proporcionada
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Documentación de vLLM: no disponible en la información proporcionada
- Documentación de compressed-tensors: no disponible en la información proporcionada
