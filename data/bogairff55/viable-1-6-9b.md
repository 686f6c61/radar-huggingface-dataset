# bogairff55/ViAble-1.6-9B

## Resumen

ViAble-1.6-9B es un modelo de lenguaje de ~8.95 mil millones de parametros desarrollado por el usuario bogairff55, construido como un merge en BF16 del modelo ViAble-1.5-9B con un adaptador LoRA SFT16. El modelo está especializado en tareas de código, ya que su dataset de entrenamiento combina CodeFeedback y Magicoder, con 76.600 muestras en total. Es un modelo de texto puro (text-only CausalLM) basado en la arquitectura qwen3_5_text, lo que indica que deriva de la familia Qwen 3.5, aunque no se proporcionan detalles adicionales sobre dicha arquitectura base.

El modelo se publica en formato safetensors con un tamaño de repositorio de 17,9 GB, lo que corresponde a pesos en BF16. Al tratarse de un modelo recién publicado (agosto de 2026) con cero descargas y cero likes, carece de datos de benchmarks, licencia e idiomas documentados, lo que limita su evaluación objetiva. Su relevancia radica en ser un intento de mejora iterativa sobre la serie ViAble mediante fine-tuning con LoRA sobre capas específicas, orientado al dominio de generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (CausalLM, transformer) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante un merge en BF16 del checkpoint ViAble-1.5-9B con un adaptador LoRA entrenado con SFT (supervised fine-tuning) durante 16.000 pasos. La configuración del LoRA es r128, aplicado a las capas 23, 27 y 31, sobre los pesos de query y value, con un scale de 1.0. El dataset de entrenamiento consta de 76.600 muestras compuestas por CodeFeedback, Magicoder y una corrección del dataset SFT15 (denominada "SFT15 fix").

Al ser un modelo de la familia qwen3_5_text, se trata de un transformer causal de solo decodificador. No se especifican detalles sobre el número de tokens de preentrenamiento, la composición exacta del dataset base ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se centra exclusivamente en el dominio de código, combinando datos de feedback de código y generación de instrucciones de código.

## Capacidades

- Generación de texto en general, con especialización en código gracias al dataset de entrenamiento (CodeFeedback y Magicoder).
- Generación y completado de código en múltiples lenguajes de programación, aunque los lenguajes concretos no están documentados.
- Seguimiento de instrucciones de tipo SFT, dado que el entrenamiento fue supervisado sobre pares instrucción-respuesta.
- Capacidades multilingües no documentadas; al derivar de Qwen 3.5 podría heredar soporte multilingüe, pero no hay confirmación en la información disponible.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, visión ni audio.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede utilizarse como asistente de autocompletado o generación de funciones a partir de descripciones en lenguaje natural, aprovechando su entrenamiento con Magicoder y CodeFeedback.
- Refactorización de código: gracias al entrenamiento con datos de feedback de código, puede sugerir mejoras de estilo, eficiencia o corrección sobre fragmentos existentes.
- Explicación de fragmentos de código: el modelo puede generar comentarios y documentación técnica a partir de código fuente, útil para equipos que mantienen bases de código poco documentadas.
- Generación de casos de prueba: dado su entrenamiento en código, puede producir casos de test unitarios a partir de la firma de funciones o del comportamiento esperado descrito en texto.
- Educación y formación en programación: puede actuar como tutor generando ejemplos de código comentados y explicaciones paso a paso, aunque sin garantías de corrección.
- Prototipado rápido: los desarrolladores pueden generar esqueletos de módulos o scripts completos a partir de especificaciones breves, acelerando la fase de prototipado.
- Fine-tuning posterior sobre dominios específicos: al estar publicado en BF16 con safetensors, puede servir como base para nuevos ciclos de LoRA o fine-tuning completo en tareas concretas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Al contar con cero descargas y cero likes en HuggingFace, tampoco hay evaluaciones de la comunidad disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18-20 GB, dado que el repositorio pesa 17,9 GB y se necesitan buffers adicionales para activaciones y KV cache.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 40 GB para inferencia en BF16 con comodidad; GPUs con 16 GB (RTX 4080, A10G) podrían ejecutar el modelo con cuantización adicional, aunque no se ofrecen pesos cuantizados.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) en BF16, pero no en GPUs de 12-16 GB sin cuantizar.
- Opciones de despliegue: al estar en safetensors, es compatible con vLLM, Hugging Face Transformers, TGI y llama.cpp (si se convierte a GGUF). No se proporcionan pesos GGUF preconvertidos.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de ~9B en BF16, vLLM en una A100 podría alcanzar entre 30 y 60 tokens por segundo, pero estos datos no están confirmados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo deriva de la arquitectura qwen3_5_text, pero no se documentan las características del modelo base (contexto, rendimiento, licencia). Como referencia estructural, modelos de la misma clase de tamaño (~9B) incluyen Qwen2.5-7B, Llama-3.1-8B y Mistral-7B, pero no se pueden establecer comparaciones de rendimiento sin datos de benchmarks. La comparativa queda pendiente hasta que se publiquen resultados de evaluación.

## Limitaciones y advertencias

- Sin licencia documentada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto con el autor.
- Sin datos de benchmarks: no hay ninguna evaluación objetiva de calidad, por lo que el rendimiento real en tareas de código o texto es desconocido.
- Dataset de entrenamiento reducido: 76.600 muestras es un volumen pequeño para fine-tuning, lo que puede limitar la generalización fuera de los dominios cubiertos por CodeFeedback y Magicoder.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código sintácticamente plausible pero incorrecto o inseguro. Se recomienda revisión humana en entornos de producción.
- Sesgos desconocidos: al no documentarse la composición del dataset base ni los datos de preentrenamiento, no es posible evaluar sesgos potenciales.
- Sin soporte de herramientas: no se documenta tool calling ni function calling, lo que limita su uso en pipelines de agentes complejos.
- Modelo sin validación comunitaria: con cero descargas y cero likes, no hay evidencia de que el modelo haya sido probado por terceros. Su fiabilidad no está contrastada.
- Fecha de publicación futura: el modelo está fechado en agosto de 2026, lo que puede indicar un entorno de desarrollo experimental o un error en la metadata.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/bogairff55/ViAble-1.6-9B
- Repositorio del modelo base ViAble: https://huggingface.co/bogairff55/ViAble
- Repositorio del proyecto viable-studio (notebooks y módulos de entrenamiento): https://huggingface.co/bogairff55/viable-studio
