# PSANDILYA1440/MicroBot_V1

## Resumen

MicroBot_V1 es un modelo de lenguaje de tipo decoder-only publicado por el usuario PSANDILYA1440 en Hugging Face. Se trata de un experimento educativo construido íntegramente desde cero: no parte de ningún modelo base preentrenado ni utiliza servicios de inferencia alojados, sino que inicializa los pesos de forma aleatoria y los entrena sobre un corpus propio muy reducido. Con 2.157.696 parámetros totales, se sitúa en el rango de los modelos de juguete, varios órdenes de magnitud por debajo de los modelos de lenguaje de uso general.

La arquitectura sigue el estilo GPT-2 (transformer causal) con 4 capas, una anchura de 192 dimensiones y un vocabulario de 1.584 tokens. El entrenamiento consistió en 60 épocas sobre 27 conversaciones escritas por el propio autor, ejecutadas en la CPU de un Mac. El objetivo declarado es didáctico: explorar la mecánica de entrenar un modelo de lenguaje desde una inicialización aleatoria y comprender el flujo completo de tokenización, entrenamiento y generación.

Su relevancia práctica es muy limitada. El autor advierte explícitamente de que no es un asistente de propósito general ni un modelo fiable de programación en MicroPython, y de que sus generaciones son débiles y a menudo incoherentes. Resulta útil como material de estudio, como ejemplo mínimo de pipeline de entrenamiento y como referencia para quienes quieran replicar el proceso con recursos muy modestos, no como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (causal) |
| Parametros totales | 2.157.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en precisión original; el repositorio incluye también pesos en formato GGUF |
| Idiomas soportados | no disponible (el corpus de entrenamiento está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Especificaciones adicionales declaradas por el autor: 4 capas, anchura de 192, tamaño de vocabulario de 1.584 tokens, 60 épocas de entrenamiento sobre CPU (Mac), inicialización aleatoria sin modelo base.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de estilo GPT-2 con 4 capas y dimensión oculta de 192. El vocabulario es de 1.584 tokens, muy inferior al de los tokenizadores habituales, lo que refleja un corpus de entrenamiento extremadamente pequeño y específico. La plantilla de conversación emplea tokens especiales propios (`<|bos|>`, `<|system|>`, `<|user|>`, `<|assistant|>`), como se observa en el ejemplo de carga de la model card.

El entrenamiento se realizó desde cero, sin modelo base preentrenado, durante 60 épocas sobre 27 conversaciones autoescritas por el autor, en la CPU de un Mac. No se documenta el número de tokens totales, la composición detallada del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se describe ninguna innovación técnica como decodificación especulativa, atención lineal o arquitecturas híbridas; se trata de un transformer estándar a pequeña escala. No se han publicado detalles sobre la estrategia de tokenización más allá del tamaño del vocabulario.

## Capacidades

- Generación de texto autoregresiva básica, limitada a continuaciones cortas a partir de un prompt con la plantilla de conversación del autor.
- Respuestas orientadas a ejemplos sencillos de MicroPython, dado el contenido del corpus de entrenamiento.
- Algunas explicaciones generales muy simples, según indica la model card.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües documentadas; el corpus está en inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No tiene acceso a web por sí mismo; la búsqueda web que menciona el autor está implementada en la aplicación MicroBot separada, no en el modelo.

## Casos de uso

- Material didáctico para aprender el pipeline completo de entrenamiento: sirve para recorrer paso a paso la tokenización, la inicialización aleatoria, el bucle de entrenamiento y la generación con Transformers, dado que su escala permite ejecutarlo en un portátil.
- Reproducción de experimentos de formación: al estar entrenado con 27 conversaciones y 60 épocas en CPU, es un punto de partida asequible para estudiar el sobreajuste en corpus minúsculos y comparar curvas de pérdida.
- Ejemplo mínimo de plantilla de chat: su formato con tokens especiales `<|system|>`, `<|user|>` y `<|assistant|>` puede usarse como referencia para entender cómo se estructuran las conversaciones en el preprocesado.
- Prueba de integración de tooling: útil para validar que un pipeline de carga con `transformers`, `AutoTokenizer` y `AutoModelForCausalLM` funciona de extremo a extremo antes de pasar a modelos mayores.
- Demostración de cuantización y despliegue ligero: la presencia de pesos GGUF permite practicar la conversión y la ejecución con llama.cpp u Ollama en hardware mínimo, aunque la calidad del texto no sea el objetivo.
- Docencia sobre limitaciones de los LLM: sirve como contraejemplo para explicar por qué un corpus de 27 ejemplos y 2,1 millones de parámetros no produce un asistente fiable, ilustrando la relación entre datos, escala y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado sobre datos reservados ni sobre benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original (2,16 millones de parámetros en fp32 ocupan aproximadamente 8,6 MB de pesos, más el overhead del runtime); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo, incluidos portátiles con gráfica integrada.
- Opciones de despliegue: `transformers` (carga estándar con `AutoModelForCausalLM`), llama.cpp u Ollama mediante los pesos GGUF incluidos en el repositorio. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Dado el tamaño, la generación en CPU es prácticamente instantánea para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MicroBot_V1 | 2,16 M | no disponible | Apache 2.0 | Hugging Face | Entrenado desde cero con 27 conversaciones; calidad muy baja declarada por el autor |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Hugging Face | Modelo base preentrenado con corpus web a gran escala; referencia habitual para experimentos pequeños |
| TinyLlama 1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo instructivo pequeño con entrenamiento a gran escala; apto para tareas reales ligeras |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face | Modelo pequeño moderno entrenado con corpus amplio; alternativa realista para despliegue en el borde |

La comparación relevante es de escala y propósito: MicroBot_V1 se sitúa dos órdenes de magnitud por debajo de GPT-2 small en parámetros y carece del preentrenamiento masivo que hace útiles a los otros modelos de la tabla. No se dispone de datos de rendimiento comparativo porque el autor no ha publicado benchmarks.

## Limitaciones y advertencias

- Calidad de generación muy baja: el propio autor advierte de que las salidas son débiles y a menudo incoherentes, fruto de 2,16 millones de parámetros y 27 ejemplos de entrenamiento.
- Riesgo elevado de alucinación y de código incorrecto o inseguro; no debe usarse para orientación factual, educativa o de hardware sin verificación.
- Sesgos conocidos: no documentados, pero el corpus autoescrito por un único autor introduce sesgos de estilo, vocabulario y contenido no evaluados.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto y el corpus está en inglés, por lo que el soporte de otros idiomas, incluido el castellano, no está garantizado.
- Sin evaluación: no se ha validado sobre datos reservados ni benchmarks, por lo que no hay métricas objetivas de calidad.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero la licencia no compensa la falta de calidad del modelo para producción.
- No apto para producción: el autor indica explícitamente que la publicación no implica que el checkpoint alcance estándares de asistente o de producción.
- El nombre del repositorio en el ejemplo de carga (`psandilya1440/microbot-scratch`) no coincide con el ID publicado (`PSANDILYA1440/MicroBot_V1`); conviene ajustar el identificador al cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PSANDILYA1440/MicroBot_V1
