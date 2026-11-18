# MAC2013/mac_02

## Resumen

MAC2013/mac_02 es un ajuste fino (fine-tuning) del modelo Llama 3 8B Instruct, partiendo concretamente de la versión cuantizada a 4 bits publicada por Unsloth (unsloth/llama-3-8b-Instruct-bnb-4bit). Lo desarrolla el usuario MAC2013 y se distribuye en Hugging Face bajo licencia Apache 2.0. El modelo está pensado exclusivamente para generación de texto en inglés y se ha entrenado utilizando la librería Unsloth, que según la model card permite un entrenamiento aproximadamente 2 veces más rápido.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un fine-tuning personal, sin model card detallada, sin benchmarks publicados y con cero descargas en el momento de la consulta. No obstante, al estar construido sobre Llama 3 8B Instruct, hereda las capacidades base de esa familia (generación de texto, razonamiento, código y matemáticas a nivel de un modelo de 8 mil millones de parámetros), aunque no se documenta qué datos adicionales se han utilizado para el ajuste.

El repositorio ocupa 0,2 GB, lo que es coherente con pesos cuantizados a 4 bits de un modelo de 8B (aproximadamente 4,5-5 GB en precisión completa, reducidos a ~0,2 GB solo si se trata de un adaptador LoRA o de un subconjunto de pesos; el dato exacto no está disponible). La información pública no permite determinar si se distribuyen pesos completos o únicamente adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3 8B Instruct) |
| Parametros totales | 8 mil millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B Instruct soporta 8.192 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | El modelo base está cuantizado a 4 bits (bnb-4bit); no se documentan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct, un transformer decoder-only con atención multi-cabeza agrupada (GQA) y tokenizador BPE de 128.000 entradas. El fine-tuning parte de la versión cuantizada a 4 bits de Unsloth, lo que implica que el entrenamiento se realizó sobre pesos ya cuantizados, probablemente mediante QLoRA o una técnica equivalente de ajuste con cuantización de bajo rango. La model card indica únicamente que el entrenamiento se hizo con Unsloth y que fue "2x faster", sin especificar el número de tokens, la composición del dataset, la duración del entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

No hay información sobre hiperparámetros, rango de LoRA, tamaño del dataset ni metodología de evaluación. Tampoco se documenta si el resultado final se fusionó con los pesos base o se distribuye como adaptador separado. Dado el tamaño del repositorio (0,2 GB), es plausible que se trate de un adaptador LoRA o de un subconjunto de pesos, pero este extremo no está confirmado en la información disponible.

## Capacidades

- Generación de texto en inglés, heredada de Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones a nivel de un modelo de 8B parámetros.
- Generación de código y resolución de problemas matemáticos básicos (capacidad heredada del modelo base, no verificada en este fine-tuning).
- Soporte de tool calling y function calling: no disponible en la información proporcionada; el modelo base Llama 3 8B Instruct lo soporta de forma nativa, pero no se confirma que el fine-tuning lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al derivar de Llama 3 8B Instruct y estar cuantizado a 4 bits, puede desplegarse en hardware de gama media para pruebas de concepto de chatbots con instrucciones en inglés.
- Generación de texto experimental en entornos de investigación: útil para comparar el efecto de un fine-tuning con Unsloth frente al modelo base en tareas concretas, siempre que se valide su comportamiento.
- Ajuste adicional sobre tareas específicas: al ser un modelo pequeño y con licencia Apache 2.0, puede servir como punto de partida para nuevos fine-tunings en inglés.
- Experimentación con QLoRA y Unsloth: el propio origen del modelo lo convierte en un ejemplo práctico de flujo de entrenamiento con cuantización de 4 bits.
- Evaluación comparativa de fine-tunings comunitarios: útil para estudiar la variabilidad de resultados en modelos derivados de Llama 3 sin benchmarks publicados.
- Despliegue en entornos con recursos limitados: si los pesos distribuidos son completos y cuantizados, podría ejecutarse en GPUs de consumo, aunque no hay datos de rendimiento que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Como referencia, un modelo de 8B en 4 bits requiere aproximadamente 5-6 GB de VRAM para los pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo base, serían razonables GPUs con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100), pero no está confirmado para este fine-tuning concreto.
- ¿Cabe en GPU de consumo? Probablemente sí, en GPUs con 8 GB o más si se distribuyen pesos cuantizados a 4 bits, pero no está verificado.
- Opciones de despliegue: transformers (según la librería declarada) y text-generation-inference (según tags). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MAC2013/mac_02 | 8B (heredado) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin benchmarks |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/llama-3-8b-Instruct-bnb-4bit | 8B | 8.192 tokens | Apache 2.0 (según repositorio de Unsloth) | Hugging Face | Versión cuantizada a 4 bits del modelo base, punto de partida de este fine-tuning |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto mayor |

La comparación se basa en características públicas de los modelos citados; no hay datos de rendimiento de MAC2013/mac_02 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación sobre el dataset de entrenamiento: no es posible evaluar su calidad ni su comportamiento esperado.
- Riesgo elevado de alucinación y de respuestas inconsistentes, dado que se desconoce el proceso de ajuste y no hay validación publicada.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Llama 3 tiene su propia licencia comunitaria; conviene verificar la compatibilidad de licencias en una cadena de fine-tuning de este tipo.
- Contexto: no se confirma la longitud de contexto efectiva tras el fine-tuning; podría haberse reducido respecto a los 8.192 tokens del modelo base.
- Repositorio de 0,2 GB: es posible que no contenga pesos completos, sino un adaptador o un subconjunto; debe verificarse antes de su uso en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAC2013/mac_02
- Modelo base en Hugging Face: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
