# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-reasoninggym-rapiddassie-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, publicado por la cuenta anónima `budget-internalization-iclr2027` como parte de una submission anónima a ICLR 2027. Corresponde al checkpoint del paso 300 de una ejecución con nombre en clave `rapiddassie`, entrenado con GRPO sobre tareas generadas de forma procedural por Reasoning Gym bajo un presupuesto de generación fijo de 8.192 tokens.

El problema que aborda es la internalización del presupuesto de tokens: durante el entrenamiento, cualquier respuesta que agota el límite de 8.192 tokens recibe recompensa cero, de modo que el modelo aprende a producir cadenas de razonamiento que concluyen y entregan una respuesta verificable en formato `\boxed{}` dentro de ese límite. Es, por tanto, un modelo de investigación orientado a estudiar cómo el RL moldea la longitud y la estructura del razonamiento, no un modelo de propósito general optimizado para producción.

Con 4.659.865.088 parámetros (4,66 B) y pesos en BF16 (9,3 GB de repositorio), es un modelo de tamaño medio que cabe en una única GPU de gama alta. Su relevancia actual reside en que permite reproducir y auditar experimentos de RL con verificadores simbólicos y control explícito del coste de inferencia, un área activa en la investigación sobre razonamiento eficiente. La model card no proporciona datos sobre longitud de contexto, idiomas, benchmarks ni evaluación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; etiqueta de arquitectura `qwen3_5`; sin detalles de capas, atención ni configuración en la información proporcionada) |
| Parámetros totales | 4.659.865.088 (4,66 B), dato real de los safetensors |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación usado en entrenamiento es de 8.192 tokens, pero no equivale necesariamente a la ventana de contexto) |
| Tipos de cuantización | no disponible (solo se publican pesos en BF16; el repositorio no incluye variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos; la model card indica que hereda la licencia del modelo base (Qwen/Qwen3.5-4B), por lo que conviene verificar ambas |
| Formato de pesos | safetensors, dtype BF16 |
| Librería | transformers |
| Pipeline declarado | image-text-to-text (la model card no documenta entrenamiento ni uso con visión) |
| Relación con el modelo base | finetune de Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 9,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible, más allá de que se trata de un finetune del modelo Qwen/Qwen3.5-4B y de la etiqueta `qwen3_5` en los metadatos. El pipeline declarado es `image-text-to-text`, lo que sugiere una base multimodal, pero la model card no documenta ningún componente de visión ni tareas de imagen, y todos los ejemplos de uso emplean `AutoModelForCausalLM` y `AutoTokenizer`. Este punto debe tratarse como no confirmado.

El entrenamiento es RL puro sobre un modelo ya instruido: GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Se usaron 32 prompts por paso con 8 rollouts cada uno, optimizador Adam con schedule coseno, LR máxima de 5e-7 y 10 pasos de warmup, durante 300 pasos. Los datos son tareas de Reasoning Gym generadas proceduralmente con respuestas en formato `\boxed{}`, con un máximo de 3 épocas, y la recompensa proviene del verificador de la propia tarea de Reasoning Gym. La innovación central es el mecanismo de presupuesto: `max_new_tokens` se fija en 8.192 y las respuestas que alcanzan ese límite obtienen recompensa cero, lo que introduce una presión explícita hacia el ajuste de la longitud del razonamiento. Los pesos se guardan en BF16.

## Capacidades

- Generación de cadenas de razonamiento paso a paso orientadas a resolución de problemas de Reasoning Gym (tareas procedurales de lógica, aritmética y rompecabezas similares), con la respuesta final en formato `\boxed{}`.
- Ajuste de la longitud del razonamiento a un presupuesto de 8.192 tokens: el modelo fue entrenado para concluir antes de agotar ese límite.
- Razonamiento verificable: el formato de salida encaja con verificadores automáticos que extraen el contenido de `\boxed{}`.
- Uso conversacional: los prompts se renderizan con la plantilla de chat del modelo base y los metadatos incluyen la etiqueta `conversational`.
- Compatibilidad con `transformers` y con `vllm serve` según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente multi-paso: no documentado; no hay evidencia de entrenamiento con herramientas ni de formato de llamadas estructuradas.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión: el pipeline figura como image-text-to-text, pero no se documenta ningún uso, evaluación o entrenamiento con imágenes.
- Modo "thinking" explícito, audio u otras modalidades: no documentados.

## Casos de uso

- Investigación sobre internalización del presupuesto de tokens: sirve como checkpoint reproducible (paso 300, GRPO, 8.192 tokens) para comparar si el modelo reduce la longitud del razonamiento manteniendo la tasa de acierto frente al modelo base.
- Reproducción de experimentos de RL con verificadores simbólicos: el pipeline completo (Reasoning Gym + verificador de `\boxed{}` + GRPO con baseline leave-one-out) es replicable y adecuado para estudiar dinámicas de recompensa y colapso de longitud.
- Generación de datos sintéticos de razonamiento: puede producir trazas de razonamiento etiquetadas con respuesta final para destilar modelos más pequeños o ampliar conjuntos de entrenamiento, siempre que se filtren con el verificador correspondiente.
- Evaluación comparativa de eficiencia: al estar entrenado con un límite estricto de tokens, es útil como punto de referencia en estudios que midan precisión frente a coste de generación (tokens consumidos por problema resuelto).
- Servicio de razonamiento con latencia acotada: desplegado con vLLM sobre una sola GPU, el presupuesto de 8.192 tokens ofrece un techo predecible de coste por petición, adecuado para APIs internas de resolución de problemas lógicos.
- Componente de verificación en pipelines de matemáticas o lógica: el formato `\boxed{}` permite integrarlo en cadenas donde un verificador externo comprueba la respuesta final generada.
- Estudio de reward hacking: escenario realista para medir si el modelo explota el verificador (por ejemplo, acortando el razonamiento de forma prematura para no agotar el presupuesto).
- Base para posteriores finetune por SFT o DPO: al ser un checkpoint intermedio de RL, es un punto de partida razonable para experimentos de alineación posteriores sobre razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (ni MMLU, ni GSM8K, ni HumanEval, ni métricas de Reasoning Gym), ni comparaciones numéricas con el modelo base o con alternativas. Tampoco se reportan medidas de latencia o throughput. Cualquier cifra de rendimiento de este checkpoint tendría que obtenerse mediante evaluación propia.

## Requisitos de hardware

Estimaciones calculadas a partir del número real de parámetros (4,66 B) y del tamaño del repositorio (9,3 GB). No hay mediciones publicadas por el autor.

- Pesos en BF16/FP16: aproximadamente 9,3 GB, cifra coherente con el tamaño del repositorio. Con caché KV y activaciones para un contexto de 8.192 tokens, el consumo agregado se sitúa habitualmente en el rango de 11 a 15 GB, aunque la cifra exacta depende de la configuración de atención, que no está documentada.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos (estimación).
- Cuantización a 4 bits: alrededor de 2,7 a 3,5 GB de pesos (estimación). No hay cuantizaciones oficiales publicadas en el repositorio.
- GPU recomendadas para BF16: RTX 4090 (24 GB), L40S (48 GB), A100 40 GB u 80 GB, H100. Una RTX 4080 de 16 GB queda muy justa con contexto largo.
- Cabe en GPU de consumo: sí, en BF16 en una RTX 4090 o RTX 3090 de 24 GB; con cuantización de 4 bits sería viable en GPUs de 8 a 12 GB, siempre que se genere una cuantización propia.
- Opciones de despliegue: `transformers` (documentado en la model card) y vLLM (`vllm serve`, también documentado). Compatibilidad con llama.cpp, Ollama o TGI: no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo (`qwen3.5-4b-8k-grpo-reasoninggym-rapiddassie-s300`) | 4,66 B | no disponible | apache-2.0 en metadatos; hereda la del base según la model card | HuggingFace, 0 descargas | No |
| Qwen/Qwen3.5-4B (modelo base) | no disponible (se declara 4B en el nombre) | no disponible | no disponible | HuggingFace | No disponible en la información proporcionada |
| Otras alternativas de ~4 B para razonamiento (por ejemplo, modelos de la familia Qwen3 o destilados de razonamiento de tamaño similar) | no disponible | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos verificados de parámetros, contexto, licencia o rendimiento de modelos alternativos dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La única comparación defendible es contra el modelo base, y en este caso tampoco se han publicado métricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Checkpoint de investigación sin evaluación publicada: no hay benchmarks, ni evaluación de seguridad, ni análisis de sesgos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Datos de entrenamiento puramente sintéticos (Reasoning Gym) y con respuestas verificadas por reglas, lo que puede provocar sobreajuste a la distribución procedural y una generalización limitada a razonamiento del mundo real.
- Riesgo de reward hacking: la recompensa depende de un verificador sobre el contenido de `\boxed{}`, por lo que el modelo podría aprender atajos de formato o truncar el razonamiento sin resolver realmente el problema.
- Comportamiento ligado al régimen de entrenamiento: el modelo fue optimizado bajo un presupuesto de 8.192 tokens; fuera de ese régimen (presupuestos mucho mayores o menores) su comportamiento puede degradarse de forma no documentada.
- Riesgo de alucinación: no se ha medido; en tareas de razonamiento con verificador automático, una respuesta bien formateada puede ser incorrecta.
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantía de calidad fuera del inglés de las tareas de entrenamiento.
- Ambigüedad de licencia: los metadatos indican apache-2.0, pero la model card afirma que hereda la licencia de Qwen/Qwen3.5-4B. Antes de un uso comercial conviene verificar la licencia efectiva del modelo base.
- Modelo publicado de forma anónima como parte de una submission a ICLR 2027: no hay autoría atribuible ni garantía de mantenimiento o soporte.
- Sin cuantizaciones oficiales: cualquier despliegue en 4 u 8 bits requiere generar los pesos cuantizados y validar la degradación por cuenta propia.
- Arquitectura no documentada: no se especifican número de capas, tipo de atención, configuración de RoPE ni detalles del supuesto componente multimodal, lo que dificulta estimar con precisión caché KV y requisitos de memoria.
- No se documenta soporte de tool calling ni de agentes, por lo que su integración en flujos con herramientas requiere un envoltorio externo que no ha sido validado.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-reasoninggym-rapiddassie-s300
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, repositorio de código, blog o demo: no disponibles en la información proporcionada.
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a sitios institucionales y comerciales sobre presupuestos públicos y alquiler de vehículos), por lo que no se incluye ningún enlace adicional.
