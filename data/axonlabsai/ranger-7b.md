# axonlabsai/Ranger-7B

## Resumen

Ranger-7B es un modelo de lenguaje denso de 7.620 millones de parámetros (7.615.616.512), desarrollado por Axon Labs, especializado en razonamiento, matemáticas y generación de código. Se trata de un fine-tuning LoRA (rank 64, alpha 128) sobre el checkpoint `huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2`, que a su vez deriva de DeepSeek-R1-Distill-Qwen-7B tras un proceso de "abliteration" que elimina los rechazos y filtros de seguridad. El modelo está diseñado para responder de forma directa y concisa, en lugar de emitir largas cadenas de razonamiento previas a la respuesta, lo que reduce drásticamente el gasto de tokens y la latencia.

La relevancia actual del modelo reside en su propuesta de eficiencia: consigue resultados comparables a su base en tareas de código y matemáticas con aproximadamente una sexta parte de la salida generada. Esto lo hace atractivo para entornos de producción donde el coste por token o el tiempo de espera son críticos. El modelo es solo texto, con una ventana de contexto nominal de 131.072 tokens, aunque esta cifra es heredada y no refleja la capacidad real entrenada, que se estima en unos pocos miles de tokens (el ancestro Qwen2.5-Math-7B fue entrenado con contexto de 4096). Se distribuye bajo licencia MIT, tanto en formato safetensors como en cuantizaciones GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2 lineage), 28 capas, atención completa |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Nominal 131.072 en config.json, pero contexto entrenado real de ~4.096 tokens (heredado de Qwen2.5-Math-7B); degradación esperada mucho antes de 128k |
| Tipos de cuantizacion | GGUF: Q4_K_M (~4,7 GB), Q5_K_M (~5,4 GB), Q8_0 (~8,1 GB), F16 (~15,2 GB) |
| Idiomas soportados | No disponibles (probablemente principalmente inglés, dado el dataset de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

Ranger-7B parte de `huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2`, un modelo Qwen2 de 7B parámetros destilado de DeepSeek-R1 y posteriormente "abliterado" (eliminación de los mecanismos de rechazo y de las alineaciones de seguridad). Sobre esta base, Axon Labs aplicó un fine-tuning con LoRA de rango 64 y alpha 128 sobre todas las proyecciones de atención y MLP en las 28 capas, fusionando posteriormente los adaptadores en los pesos finales (el modelo se distribuye sin adaptadores separados). El objetivo declarado del entrenamiento fue modificar la identidad del modelo y su disciplina de respuesta, logrando que responda como un ingeniero: directo, conciso y sin razonamiento extenso previo.

El chat template fue reconstruido para corregir dos defectos del template original: ahora acepta una lista de herramientas (`tools`) y la renderiza correctamente, y preserva el contenido de ` thinking` en el turno final mientras elimina razonamiento obsoleto de turnos anteriores. El autor indica que un intento adicional de inyectar ~2.400 ejemplos de datos de código (OpenCodeReasoning, OpenCodeInstruct, CodeFeedback) no produjo ninguna mejora en HumanEval+, por lo que no se incluyó. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y chat conversacional con formato de plantilla de chat estándar.
- Razonamiento matemático y resolución de problemas de competición (AIME, MATH-500-hard), aunque con rendimiento moderado (2/4 en pruebas internas).
- Generación de código funcional en Python y otros lenguajes, con especial eficiencia en presupuestos de tokens reducidos (65,6% en HumanEval+ con 1000 tokens de salida).
- Soporte de tool calling / function calling mediante el argumento estándar `tools=` de transformers.
- Capacidad de agente y razonamiento multi-paso, aunque la salida tiende a ser directa sin cadenas de pensamiento explícitas.
- Modelo "uncensored" (abliterado): no aplica rechazos por contenido sensible o peligroso, lo que implica que puede generar contenido que otros modelos filtrarían.
- Solo texto: no soporta entrada de imágenes, audio ni vídeo.

## Casos de uso

- Asistente de programación en entornos de desarrollo: Ranger-7B puede generar soluciones de código completas y correctas con un presupuesto de 1000-2000 tokens, lo que lo hace adecuado para autocompletado o generación de funciones en IDEs y editores de código, donde la latencia y el coste por token son factores críticos.
- Integración en pipelines de CI/CD para revisión de código automatizada: gracias a su soporte de tool calling, puede invocar funciones de análisis estático o ejecutar tests, y generar sugerencias de corrección de forma concisa, reduciendo el tiempo de espera en comparación con modelos que emiten largas cadenas de razonamiento.
- Chatbots de atención al cliente con presupuesto de tokens limitado: su estilo de respuesta breve y directa permite mantener conversaciones multi-turno sin agotar la ventana de contexto (aunque esta es limitada, unos 4k tokens fiables), y su licencia MIT permite uso comercial sin restricciones.
- Tutoría de matemáticas y resolución de problemas paso a paso: aunque no muestra el razonamiento explícito, puede proporcionar respuestas correctas a problemas de nivel de competición, útil en plataformas educativas donde se requiere una respuesta inmediata.
- Prototipado rápido de agentes con tool calling: su capacidad de declarar y usar herramientas, junto con su baja latencia, lo hace apto para experimentar con arquitecturas de agentes en entornos de investigación o desarrollo.
- Despliegue en hardware modesto: con la cuantización Q4_K_M (~4,7 GB) cabe en GPUs de 8 GB VRAM o incluso en CPU, lo que permite ejecutar un asistente de código local en portátiles o servidores de gama baja sin depender de la nube.

## Benchmarks y rendimiento

El autor no ha ejecutado una suite estándar completa ni reclama puntuaciones de leaderboard. Los datos medidos directamente son los siguientes:

| Modelo | Presupuesto de tokens | HumanEval+ pass@1 | Salida mediana |
|---|---|---|---|
| Ranger-7B | 1000 | 65,6% | 582 caracteres |
| Base (abliterated) | 1000 | 34,4% | 3708 caracteres |
| Base (abliterated) | 3000 | 56,2% | — |

Notas metodológicas del autor: la muestra es de 32 problemas, con un error estándar de ±8,4 puntos porcentuales, por lo que la diferencia de precisión es "sugerente, no probada" (test de McNemar con p entre 0,25 y 0,58). Lo que sí es robusto es la diferencia de longitud de salida (6x menor) y el hecho de que el modelo base no emitió código en 10 de 32 problemas al agotar el presupuesto de 1000 tokens. En matemáticas, ambos modelos (Ranger y base) obtuvieron 2/4 en problemas de competición (AIME 2024, MATH-500-hard, un problema de conteo), pasando y fallando los mismos problemas. En pruebas de identidad, obtuvo 8/12 en sondas retenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (~4,7 GB) cabe en una GPU de 8 GB VRAM (p. ej., RTX 3070/4060); con Q8_0 (~8,1 GB) se necesita al menos 12 GB VRAM (p. ej., RTX 4070 Ti, RTX 3090); el formato F16 (~15,2 GB) requiere 16-24 GB VRAM.
- GPU recomendadas: para uso fluido con Q4_K_M, una RTX 3060 de 12 GB o superior; para Q8_0, una RTX 4070 Ti o A100; para F16, una A100 o H100.
- Sí cabe en GPU de consumo: las versiones Q4_K_M y Q5_K_M son adecuadas para GPUs de gama media (8-12 GB VRAM). También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También es compatible con text-generation-inference y endpoints.
- Latencia y throughput: no se han publicado datos oficiales. Dado su tamaño (7,6B) y su salida concisa, se espera una latencia de primera token baja (decenas de ms en GPU moderna) y un throughput alto en entornos como vLLM, aunque no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval+ (1000 tok) | Licencia | Formato |
|---|---|---|---|---|---|
| Ranger-7B | 7,62B | ~4k efectivo (nominal 131k) | 65,6% | MIT | safetensors, GGUF |
| DeepSeek-R1-Distill-Qwen-7B (base, abliterated) | 7,62B | ~4k efectivo | 34,4% (a 1000 tok); 56,2% (a 3000 tok) | MIT (abliterated) | safetensors |
| Qwen2.5-Math-7B (ancestro) | 7,6B | 4096 | no disponible | Apache 2.0 | safetensors |

La comparación directa con el modelo base muestra la principal diferencia: Ranger-7B logra resultados superiores con un presupuesto de tokens mucho menor. Frente a Qwen2.5-Math-7B, no hay datos comparativos disponibles en la información proporcionada. No se dispone de comparaciones con otros modelos de 7B de la misma categoría (p. ej., Llama-3.1-8B, Mistral-7B) en este contexto.

## Limitaciones y advertencias

- Contexto real limitado: aunque `config.json` declara 131.072 tokens, el modelo fue entrenado con un contexto efectivo de ~4.096 tokens (heredado de Qwen2.5-Math-7B). No se ha evaluado nada por encima de 4k; se espera degradación severa del rendimiento mucho antes de 128k. No dimensionar cachés KV para contextos que el modelo no puede utilizar.
- Riesgo de alucinación: como modelo de 7B, es propenso a inventar hechos, especialmente en tareas de conocimiento general. Su estilo de respuesta breve puede ocultar la incertidumbre.
- Sesgos y contenido "uncensored": al ser un modelo abliterado, no aplica filtros de seguridad. Puede generar contenido ofensivo, peligroso o ilegal, y puede reflejar sesgos presentes en los datos de entrenamiento. El uso en producción debe considerar estos riesgos.
- Sin garantías de rendimiento en tareas fuera de código y matemáticas: no se han publicado evaluaciones en razonamiento general, comprensión lectora o tareas multilingües.
- Muestra de benchmarks pequeña: los resultados de HumanEval+ se basan en 32 problemas, con un margen de error amplio. No hay una suite estándar completa.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero el autor no ofrece garantías de ningún tipo. El modelo se distribuye "tal cual".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axonlabsai/Ranger-7B
- Perfil de Axon Labs en Hugging Face: https://huggingface.co/axonlabsai/models
- Modelo base (abliterated): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2
- No se han encontrado papers, repositorios de código ni demos adicionales en la búsqueda web.
