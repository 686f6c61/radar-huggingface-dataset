# qda-lab/QDA-Qwen3.8-27B-W3A16

## Resumen

QDA-Qwen3.8-27B-W3A16 es una cuantización de 3 bits en pesos (W3A16, activaciones en 16 bits) del modelo Qwen/Qwen3.8-27B, publicada por el usuario qda-lab bajo el pipeline de cuantización QDA. El checkpoint resultante ocupa 14,6 GB en el repositorio y contiene 27.781.427.952 parámetros almacenados, lo que permite servir el modelo en vLLM con un formato compatible con compressed-tensors y reducir de forma notable los requisitos de memoria frente a los pesos en bf16.

El interés de esta ficha es doble: por un lado, documenta un artefacto de cuantización agresiva (3 bits) sobre un modelo de ~27B parámetros; por otro, sirve como referencia práctica de qué se puede esperar de un checkpoint W3A16 en términos de precisión declarada por el autor (media de 79,1 % en un conjunto de benchmarks de razonamiento, matemáticas, código e instrucciones). No se dispone de información sobre la arquitectura interna, el contexto o el entrenamiento del modelo base en la documentación proporcionada, por lo que esos apartados se marcan como no disponibles.

La relevancia actual radica en la posibilidad de desplegar un modelo de casi 28B parámetros en hardware con menos VRAM que la requerida por los pesos originales, manteniendo una precisión declarada alta en tareas de razonamiento y código. No obstante, la licencia, los idiomas y el pipeline no están especificados, lo que limita su uso en producción sin verificación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B, tag qwen3_5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16 (pesos 3 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentación proporcionada. El tag `qwen3_5` sugiere que pertenece a la familia Qwen3.5, pero no se detalla si se trata de un transformer denso, un modelo híbrido o una variante con atención lineal. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización: QDA produce un checkpoint W3A16 en formato compressed-tensors, con pesos de 3 bits y activaciones de 16 bits, listo para ejecutarse directamente en vLLM. El autor indica que la evaluación se realizó con vLLM 0.27.1 sobre GH200, con batching estático y los parámetros de muestreo de la model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`), usando semillas 17+j. No se detallan técnicas adicionales como decodificación especulativa, atención lineal o mecanismos de thinking mode.

## Capacidades

- Generación de texto y razonamiento general, según los benchmarks declarados (GPQA-Diamond, IFBench).
- Razonamiento matemático: evaluación en AIME 2025 y HMMT Feb 2026 con una puntuación combinada de 85,9.
- Generación de código: evaluación en LiveCodeBench v6 con 84,7.
- Seguimiento de instrucciones: evaluación en IFBench con 66,8.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque los benchmarks de razonamiento sugieren cierta capacidad en tareas de varios pasos.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue de razonamiento matemático en producción: el checkpoint declara 85,9 en AIME 2025 + HMMT Feb 2026, por lo que puede emplearse en asistentes de resolución de problemas matemáticos o verificación de cálculos, siempre que se valide la precisión tras la cuantización W3A16 en el dominio concreto.
- Generación de código asistida: con 84,7 en LiveCodeBench v6, es adecuado para autocompletado, generación de funciones y revisión de parches en entornos de desarrollo, integrándose vía vLLM en un servicio interno.
- Evaluación de razonamiento científico: el 79,1 en GPQA-Diamond permite usarlo como modelo de apoyo en preguntas de nivel posgrado en física, química y biología, con revisión humana obligatoria por el riesgo de alucinación.
- Seguimiento de instrucciones en pipelines de extracción: el 66,8 en IFBench indica que puede manejar instrucciones compuestas en tareas de transformación de datos y generación de informes estructurados.
- Servicio de inferencia con VRAM reducida: al ocupar 14,6 GB en el repositorio y ejecutarse en vLLM con `vllm serve qda-lab/QDA-Qwen3.8-27B-W3A16`, encaja en despliegues donde un modelo de 27B en bf16 no cabría en una sola GPU consumer de gama alta.
- Prototipado de agentes de razonamiento: los benchmarks de matemáticas y código sugieren utilidad en bucles de planificación y resolución de subproblemas, aunque la ausencia de datos sobre tool calling obliga a validar esa integración por separado.
- Investigación sobre cuantización: sirve como referencia para estudiar la degradación de precisión de W3A16 frente al modelo base en tareas de razonamiento, comparando los resultados declarados con evaluaciones propias.

## Benchmarks y rendimiento

| Benchmark | Puntuación (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 85,9 |
| GPQA-Diamond | 79,1 |
| LiveCodeBench v6 | 84,7 |
| IFBench | 66,8 |
| Media | 79,1 |

Evaluado con vLLM 0.27.1 en GH200, batching estático, muestreo `temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`, semillas 17+j. No se proporcionan resultados del modelo base sin cuantizar para calcular la degradación, ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,6 GB en pesos W3A16; a ello hay que sumar la caché KV y el overhead de vLLM, que depende de la longitud de contexto (no disponible) y del número de secuencias concurrentes.
- GPU recomendadas: el autor reporta evaluación en GH200; para producción se puede considerar A100 40/80 GB, H100 y L40S. No se especifican requisitos mínimos oficiales.
- GPU consumer: con 14,6 GB de pesos, es plausible en GPUs de 24 GB (RTX 3090, RTX 4090) para contextos cortos y baja concurrencia, pero no hay confirmación del autor ni cifras de VRAM pico medidas.
- Opciones de despliegue: vLLM es el runtime documentado (`vllm serve qda-lab/QDA-Qwen3.8-27B-W3A16`). El formato compressed-tensors es específico de vLLM/compressed-tensors; no se indica compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica batching estático en GH200 durante la evaluación, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W3A16 | 27,78B | no disponible | W3A16 | no disponible | vLLM |
| Qwen/Qwen3.8-27B (base) | 27B (según nombre) | no disponible | bf16/fp16 original | no disponible | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables de la misma familia o tamaño en la documentación proporcionada, ni de resultados de benchmarks del modelo base para medir la pérdida de precisión.

## Limitaciones y advertencias

- La cuantización a 3 bits puede degradar la precisión respecto al modelo base; no se publican resultados del base para cuantificar esa pérdida.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-27B antes de desplegarlo.
- Idiomas no disponibles: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Longitud de contexto no disponible: limita la planificación de cargas con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación inherente a los modelos generativos; los benchmarks declarados no eliminan este riesgo en dominios abiertos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Compatibilidad limitada al ecosistema vLLM/compressed-tensors; no se indica soporte para llama.cpp, Ollama o TGI.
- El repositorio tiene 13 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- No se detalla si el proceso QDA introduce requisitos específicos de versión de vLLM más allá de la 0.27.1 usada en la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de vLLM: no disponible en la información proporcionada
- Paper o blog de QDA: no disponible en la información proporcionada
- Repositorio de compressed-tensors: no disponible en la información proporcionada
