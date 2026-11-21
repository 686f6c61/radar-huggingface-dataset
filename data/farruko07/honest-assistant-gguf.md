# farruko07/honest-assistant-GGUF

## Resumen

honest-assistant-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-3B-Instruct de Alibaba Cloud, publicada por el usuario farruko07 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una edición de los pesos del modelo base mediante *steering vectors*: se calcula la diferencia de activaciones medias asociada al concepto "sycophancy" (adulación o complacencia excesiva) en la capa 16 y se resta con intensidad -0.50, de modo que el sesgo queda horneado directamente en los pesos y no requiere hooks en tiempo de ejecución.

El objetivo declarado es corregir un comportamiento típico de los asistentes conversacionales: la tendencia a dar la razón al usuario y validar planes débiles en lugar de señalar sus riesgos. Con esta edición, el modelo debería indicar problemas o riesgos en lugar de asentir ante propuestas mal fundamentadas. La herramienta empleada para la edición es Concept Surgeon, que aplica vectores de dirección sobre activaciones y consolida el cambio en los tensores finales.

El modelo conserva la arquitectura, el tamaño (3.086.878.720 parámetros) y el contexto del Qwen2.5-3B-Instruct original, y se distribuye exclusivamente en GGUF, con un tamaño de repositorio de 1,9 GB. Es relevante para quienes quieren un asistente de 3B parámetros ejecutable en local con Ollama y con un comportamiento menos complaciente, aunque la licencia Qwen Research y la ausencia de benchmarks publicados limitan su uso comercial directo sin revisión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.086.878.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del Qwen2.5-3B-Instruct base es 32.768 tokens, segun la documentacion del modelo base) |
| Tipos de cuantizacion | GGUF; el ejemplo de la model card usa Q4_K_M |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | qwen-research (license_name: qwen-research, license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct: un transformer decoder-only denso de aproximadamente 3.087 millones de parámetros, con atención causal estándar y sin mezcla de expertos. Sobre ese modelo base no se ha realizado un entrenamiento adicional con datos; la modificación consiste en una edición de pesos mediante *steering vectors*. Concretamente, se calcula la diferencia de activaciones medias entre respuestas con y sin el rasgo "sycophancy" en la capa 16, se escala con intensidad -0.50 y se aplica a los pesos del modelo, de forma que la dirección de activación se desplaza en sentido contrario a la adulación.

El resultado es un modelo con los mismos parámetros y la misma arquitectura que el original, pero con un sesgo de comportamiento alterado de forma permanente. No hay información sobre el dataset utilizado para calcular los vectores de dirección, ni sobre el número de tokens, la composición de los datos o si se aplicaron etapas de RLHF o DPO adicionales. La model card indica una verificación en Ollama con "trait 0.0, coherencia 85.0 y precisión 100.0 (passed)", pero no se detalla la metodología de esa evaluación ni el conjunto de pruebas empleado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Generación de código y resolución de problemas matemáticos sencillos, según las capacidades del modelo base.
- Comportamiento menos complaciente: señala riesgos y objeciones ante planes débiles en lugar de validarlos, gracias al vector de dirección aplicado sobre "sycophancy".
- Soporte de *tool calling* y *function calling*: no disponible en la información proporcionada para esta edición concreta; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito, visión o audio: no disponible (el modelo base Qwen2.5-3B-Instruct es solo texto).

## Casos de uso

- Revisión crítica de planes de proyecto: el modelo, al tener reducida la complacencia, puede emplearse como revisor de propuestas técnicas o de negocio, señalando riesgos y supuestos débiles en lugar de validarlos automáticamente.
- Asistente de código en local: con 3B parámetros y cuantización Q4_K_M cabe en equipos de consumo y puede integrarse en flujos de revisión de parches o explicación de errores, con la salvedad de que su capacidad de código es la del modelo base de 3B.
- Chatbot de soporte interno con matiz crítico: útil en entornos donde se quiere que el asistente advierta de limitaciones o consecuencias antes de confirmar una acción al usuario.
- Evaluación de decisiones y análisis de alternativas: el modelo puede generar contraargumentos ante una propuesta dada, lo que resulta útil en herramientas de toma de decisiones asistida.
- Despliegue en local con Ollama: al distribuirse en GGUF y con un comando de ejecución directo (`ollama run hf.co/farruko07/honest-assistant-GGUF:Q4_K_M`), es adecuado para prototipos en portátiles o estaciones sin GPU dedicada de gran capacidad.
- Experimentación con *steering vectors*: sirve como caso de estudio reproducible de cómo aplicar Concept Surgeon sobre un modelo instruct y consolidar el cambio en los pesos, útil para investigadores que quieran replicar la metodología.
- Filtro de segunda opinión en pipelines de generación: puede colocarse como revisor de salidas de otro modelo para detectar respuestas demasiado complacientes, aunque su tamaño de 3B limita la profundidad del análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una verificación cualitativa en Ollama (trait 0.0, coherencia 85.0, precisión 100.0, marcada como "passed"), sin detallar el conjunto de evaluación ni la comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, un modelo de 3B parámetros ocupa aproximadamente 2 GB de pesos; con overhead de contexto y KV cache, se recomienda entre 3 y 4 GB de VRAM para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPUs de 8 GB o más (RTX 3060 Ti, RTX 4070) se puede usar una cuantización mayor (Q6_K o Q8_0) o contextos más largos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; también puede ejecutarse en CPU con llama.cpp u Ollama, con latencia mayor.
- Opciones de despliegue: Ollama (comando indicado en la model card), llama.cpp y cualquier runtime compatible con GGUF; vLLM y TGI no están confirmados para este repositorio GGUF concreto.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| honest-assistant-GGUF (este) | 3,09B | no disponible (base: 32.768) | qwen-research | GGUF | Qwen2.5-3B-Instruct con sycophancy reducida (-0.50, capa 16) |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | qwen-research | safetensors, GGUF | Modelo base sin edición; comportamiento estándar de asistente |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mayor |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Alternativa algo mayor, licencia permisiva |

La comparación de rendimiento en benchmarks no está disponible para este modelo; los datos del modelo base y de las alternativas deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- La edición con *steering vectors* puede introducir efectos secundarios no medidos en otras dimensiones del comportamiento (estilo, verbosidad, coherencia), y la model card solo reporta una verificación cualitativa.
- Riesgo de alucinación inherente al modelo base de 3B parámetros; la reducción de complacencia no elimina la generación de afirmaciones incorrectas.
- Idiomas soportados no documentados en esta ficha; debe verificarse contra el modelo base antes de usar en producción multilingüe.
- Licencia qwen-research: restricciones para uso comercial; es necesario revisar el enlace de licencia del modelo base antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en fechas muy próximas (2026-11-21), lo que indica ausencia de validación comunitaria.
- No hay información sobre el dataset de cálculo de los vectores ni sobre la metodología de evaluación; la reproducibilidad del ajuste no está garantizada.
- El contexto máximo efectivo en la cuantización GGUF puede diferir del declarado para el modelo base; conviene probarlo con la longitud real de contexto que se vaya a usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farruko07/honest-assistant-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
