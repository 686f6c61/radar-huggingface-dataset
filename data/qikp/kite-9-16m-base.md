# qikp/kite-9-16m-base

## Resumen

Kite 9 es un modelo de lenguaje de tipo transformer decoder-only con 15.887.560 parámetros totales (aproximadamente 16 millones), desarrollado por el usuario qikp y publicado en Hugging Face bajo licencia CC0-1.0. Se trata de un modelo experimental de escala muy reducida, orientado a la generación de texto en inglés y entrenado desde cero sobre un único shard del dataset nvidia/Nemotron-ClimbMix.

El modelo se etiqueta internamente como familia "qwen3" en los metadatos de Hugging Face y utiliza el tokenizador de Mistral 7B v0.3, lo que resulta relevante porque el autor indica que esta versión 9 emplea hiperparámetros distintos y un tokenizador más grande que versiones anteriores. El entrenamiento consistió en una única época con batch size de 8 y learning rate de 0.001.

Su relevancia es fundamentalmente educativa y de investigación: permite experimentar con pipelines completos de entrenamiento, tokenización e inferencia con transformers en hardware muy modesto. El propio autor advierte explícitamente que, por su tamaño, el modelo no es adecuado para cargas de trabajo en producción. No se dispone de información publicada sobre arquitectura interna detallada, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiquetado como "qwen3" en metadatos; detalles internos no disponibles) |
| Parametros totales | 15.887.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización a GGUF no publicada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer decoder-only para generación de texto, con 15.887.560 parámetros y pesos en formato safetensors compatibles con la librería transformers. Los metadatos lo etiquetan como "qwen3", lo que sugiere una arquitectura inspirada en la familia Qwen 3, aunque no se detallan capas, dimensiones ocultas, número de cabezas de atención ni mecanismos adicionales (atención lineal, decodificación especulativa, etc.).

El entrenamiento se realizó sobre el primer shard del shuffle de Andrej Karpathy del dataset nvidia/Nemotron-ClimbMix, durante 1 época, con batch size de 8 y learning rate de 0.001. Emplea el tokenizador de Mistral 7B v0.3, que el autor destaca como más grande que en versiones previas del modelo. No se especifica el número total de tokens procesados, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas destacables.

## Capacidades

- Generación de texto autoregresiva en inglés, tarea principal declarada en la model card.
- Compatibilidad con el ecosistema transformers y text-generation-inference (tags de Hugging Face).
- Compatibilidad declarada con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructura de inferencia gestionada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas o código).

## Casos de uso

- Experimentación educativa con transformers: sirve para recorrer el ciclo completo de carga de un modelo, tokenización con el tokenizador de Mistral 7B v0.3 y generación de texto en un portátil sin GPU dedicada, gracias a sus ~16 millones de parámetros.
- Pruebas de integración de pipelines de inferencia: útil para validar configuraciones de text-generation-inference o endpoints compatibles antes de migrar a modelos mayores, ya que el coste de cómputo es mínimo.
- Referencia base para comparativas de escalado: permite contrastar el comportamiento de un modelo de 16M parámetros frente a modelos mayores en tareas controladas de generación, aislando el efecto del tamaño.
- Docencia sobre tokenización: al usar el tokenizador de Mistral 7B v0.3, se puede ilustrar cómo un vocabulario grande afecta a la representación de texto en modelos pequeños.
- Pruebas de humo en CI/CD de infraestructura ML: un modelo de 0,1 GB de repositorio permite verificar despliegues, contenedores y APIs de inferencia con tiempos de arranque muy bajos.
- Reproducción de experimentos de entrenamiento: los hiperparámetros documentados (1 época, batch 8, lr 0.001) y el dataset público permiten intentar reproducir el entrenamiento en hardware de consumo.
- Generación de texto exploratoria sin requisitos de calidad: para demos internas o prototipos donde la coherencia no es crítica y se prioriza la velocidad y el coste cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (los pesos ocupan aproximadamente 0,06 GB en fp32 para 15,9M de parámetros); en fp16 rondaría los 32 MB.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en dispositivos de borde y en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference según los tags, y endpoints compatibles. No se ha publicado conversión a GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kite 9 16M (qikp) | 15,9M | No disponible | CC0-1.0 | Hugging Face, transformers | Entrenado sobre 1 shard de Nemotron-ClimbMix |
| SmolLM-135M (Hugging Face) | 135M | 2.048 tokens (versión base) | Apache-2.0 | Hugging Face, transformers, GGUF | Modelo pequeño ampliamente documentado y con benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache-2.0 | Hugging Face, transformers, GGUF | Modelo pequeño con entrenamiento extensivo y benchmarks públicos |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache-2.0 | Hugging Face, transformers, GGUF | Alternativa pequeña con contexto largo y soporte multilingüe |

La comparación es orientativa: Kite 9 es entre uno y dos órdenes de magnitud menor que las alternativas citadas y carece de benchmarks publicados, por lo que no es posible establecer comparaciones de rendimiento objetivas.

## Limitaciones y advertencias

- El autor indica explícitamente que, por su tamaño, el modelo no es adecuado para cargas de trabajo en producción.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo dado el reducido número de parámetros y el entrenamiento de una sola época sobre un único shard.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- No hay información sobre sesgos del dataset ni evaluación de seguridad; el dataset de origen (Nemotron-ClimbMix) no está caracterizado en la model card.
- Licencia CC0-1.0: permite uso comercial sin restricciones, pero al no haber garantías de calidad, su uso comercial real es desaconsejable.
- Sin benchmarks publicados ni comparativas oficiales; cualquier evaluación de rendimiento debe realizarse por cuenta propia.
- El tag "qwen3" en los metadatos no implica que sea un modelo oficial de Qwen ni que herede sus garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qikp/kite-9-16m-base
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-ClimbMix
- Tokenizador utilizado: https://huggingface.co/mistralai/Mistral-7B-v0.3
