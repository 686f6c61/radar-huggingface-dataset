# LeaderboardModel1/Qwen3-0.6B-AutoRound-MXFP4-ModelFree

## Resumen

Este modelo es una cuantización MXFP4 (Microscaling FP4) del modelo Qwen/Qwen3-0.6B, generada mediante la herramienta `agent_optimize` de Intel, que forma parte del ecosistema AutoRound. El objetivo es reducir el tamaño y los requisitos de memoria del modelo original para facilitar su despliegue en entornos con recursos limitados, manteniendo un rendimiento razonable en tareas de generación de texto. Se enmarca dentro de la iniciativa Low-Bit Open LLM Leaderboard de Intel.

Al tratarse de una cuantización de 4 bits, el modelo reduce significativamente el peso en memoria (de aproximadamente 1,5 GB a unos 0,4 GB en FP4), lo que permite ejecutarlo en hardware de gama baja o incluso en CPU. El modelo base Qwen3-0.6B es un transformer denso de 0,6 mil millones de parámetros, diseñado para tareas de razonamiento, código y conversación, aunque la ficha no especifica la longitud de contexto ni los idiomas soportados.

La relevancia de esta versión radica en que ofrece una alternativa ligera y de bajo coste computacional para prototipos y aplicaciones donde el rendimiento bruto es menos crítico que la eficiencia. No obstante, al ser una cuantización agresiva, puede presentar una degradación notable en tareas complejas en comparación con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (Microscaling FP4) |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | no disponible (se indica seguir la licencia del modelo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es el resultado de aplicar una cuantización MXFP4 al modelo preentrenado Qwen/Qwen3-0.6B. La cuantización se realiza mediante la herramienta `agent_optimize`, basada en el algoritmo de redondeo optimizado descrito en el paper "Optimize weight rounding via signed gradient descent for the quantization of LLMs" (arXiv:2309.05516). Este método ajusta los pesos mediante descenso de gradiente con redondeo firmado para minimizar la pérdida de precisión tras la cuantización.

La cuantización MXFP4 utiliza un esquema de microescalado por bloques, donde cada grupo de pesos comparte un factor de escala en formato FP4, lo que permite una representación más eficiente que la cuantización estándar de 4 bits. No se aplica ningún proceso de fine-tuning posterior; el modelo conserva las capacidades del original, aunque con una degradación esperada debido a la pérdida de precisión.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en tareas de continuación y respuesta a instrucciones, heredadas del modelo base Qwen3-0.6B.
- Razonamiento básico: al ser una versión cuantizada, conserva parcialmente las habilidades de razonamiento lógico y matemático del original, aunque con menor precisión en problemas complejos.
- Soporte de chat y conversación: el modelo base está entrenado para seguir instrucciones y mantener diálogos multi-turno, capacidad que se mantiene en la cuantización.
- Tool calling y agentes: el modelo base Qwen3-0.6B soporta function calling y uso de herramientas, aunque no se especifica si esta capacidad se conserva íntegramente tras la cuantización.
- Multilingüismo: el modelo base de Qwen3 es multilingüe, pero la ficha no detalla qué idiomas están soportados en esta versión cuantizada.

## Casos de uso

- Inferencia en dispositivos edge: gracias a su tamaño reducido (menos de 0,5 GB en FP4), puede desplegarse en Raspberry Pi, smartphones o microcontroladores con limitaciones de memoria para tareas de generación de texto básicas.
- Prototipado rápido: desarrolladores que necesitan probar funcionalidades de Qwen3 sin requerir GPUs potentes pueden usar esta versión para validar flujos de trabajo antes de escalar a modelos mayores.
- Asistentes conversacionales ligeros: integración en chatbots de bajo consumo para atención al cliente o asistentes personales en entornos con recursos restringidos.
- Clasificación y extracción de información: tareas de procesamiento de lenguaje natural como etiquetado, resumen o extracción de entidades en lotes, donde la precisión no es crítica.
- Educación y experimentación: útil para estudiantes o investigadores que quieran estudiar el efecto de la cuantización en el rendimiento sin necesidad de hardware caro.
- Generación de código en entornos con restricciones: aunque la capacidad de código puede degradarse, puede usarse para autocompletar fragmentos simples en IDEs ligeros.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en las tareas hellaswag, mmlu (con numerosas subcategorías) y piqa. Se presentan a continuación los valores principales:

| Tarea | Accuracy |
|---|---|
| hellaswag | 0.3762 |
| mmlu (promedio general) | 0.4021 |
| mmlu_stem | 0.3622 |
| mmlu_humanities | 0.3654 |
| mmlu_social_sciences | 0.4771 |
| mmlu_other | 0.4239 |
| piqa | 0.6763 |

Estos resultados son considerablemente inferiores a los del modelo original sin cuantizar (que suele rondar 0.55-0.60 en MMLU para Qwen3-0.6B), lo que confirma una pérdida de rendimiento esperada por la cuantización de 4 bits. No se dispone de comparativas con otras cuantizaciones del mismo modelo en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización de 4 bits, los pesos ocupan aproximadamente 0,4 GB (751M parámetros × 0,5 bytes). Con overhead de activaciones y KV cache, se estima un consumo total de 1-2 GB en inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, o integradas modernas. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de gama de entrada y tarjetas antiguas.
- Opciones de despliegue: se puede servir con vLLM (comando incluido en la model card), así como con Hugging Face Transformers, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU modesta se espera una generación de 10-30 tokens por segundo, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones del mismo modelo base (por ejemplo, las versiones MXFP4-RTN o MXFP4-Tuning que aparecen en los resultados de búsqueda). Como referencia, se puede comparar con el modelo original sin cuantizar:

| Modelo | Parámetros | Contexto | MMLU | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (original) | 751M | no disponible | ~0.55 (estimado) | Apache 2.0 (según repo oficial) |
| Qwen3-0.6B-AutoRound-MXFP4-ModelFree | 751M | no disponible | 0.4021 | no disponible |

La cuantización reduce el rendimiento en aproximadamente un 27% relativo en MMLU, a cambio de una reducción de memoria de ~4x. No hay información sobre otras alternativas de la misma categoría (modelos de 0.6B cuantizados) en los datos proporcionados.

## Limitaciones y advertencias

- La model card advierte explícitamente que el modelo puede producir información factualmente incorrecta y no debe utilizarse como fuente fiable de datos.
- Puede generar contenido sesgado, ofensivo o inapropiado debido a las limitaciones del modelo base y los datos de entrenamiento.
- La cuantización MXFP4 introduce una degradación adicional en tareas de razonamiento complejo, matemáticas y código, como se observa en los benchmarks (mmlu_stem: 0.3622).
- No se especifica la licencia exacta; se indica seguir la del modelo original, pero sin detallar cuál es. Se recomienda consultar la licencia de Qwen3 antes de uso comercial.
- La longitud de contexto no está documentada en esta ficha, por lo que se desconoce si se mantiene la ventana del modelo base (típicamente 32K en Qwen3, pero no confirmado).
- Los idiomas soportados no se detallan, lo que limita la evaluación de su aplicabilidad multilingüe.
- Al ser una versión generada automáticamente por `agent_optimize`, no ha pasado por una validación exhaustiva de calidad más allá de los benchmarks presentados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LeaderboardModel1/Qwen3-0.6B-AutoRound-MXFP4-ModelFree)
- [Modelo base Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Paper de AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
- [Repositorio GitHub de AutoRound](https://github.com/intel/auto-round)
- [Low-Bit Open LLM Leaderboard](https://huggingface.co/spaces/Intel/low_bit_open_llm_leaderboard)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
