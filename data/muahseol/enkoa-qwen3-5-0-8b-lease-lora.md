# muahseol/enkoa-qwen3.5-0.8b-lease-lora

## Resumen

`muahseol/enkoa-qwen3.5-0.8b-lease-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el autor muahseol sobre el modelo base `Qwen/Qwen3.5-0.8B`. No se trata de un modelo completo, sino de un conjunto de pesos diferenciales que deben cargarse junto al modelo base mediante la librería PEFT. Su propósito es exclusivamente didáctico: forma parte del material de prácticas del curso de deep learning de Enkoa AI Campus, concretamente de la unidad de LoRA y de la unidad de inferencia con vLLM.

El adaptador se ha entrenado sobre datos de consultas de alquiler (전월세, es decir, contratos de alquiler con y sin depósito en Corea del Sur), con un rango LoRA de 8 y una tasa de aprendizaje de 2e-4. El identificador interno del experimento es `lease_lora_lr2e-4`. El modelo base sobre el que se aplica tiene 0,8 mil millones de parámetros, lo que lo sitúa en la gama ultraligera, apta para ejecución en CPU o en GPU de consumo.

Es relevante ahora únicamente como ejemplo reproducible de flujo de trabajo con LoRA y vLLM. El propio autor advierte explícitamente en la model card que se trata de un modelo de ejemplo para formación y que no debe emplearse en atención al cliente real. No hay pipeline declarado, no hay benchmarks publicados y el repositorio tiene un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | 8 |
| Tasa de aprendizaje de entrenamiento | 2e-4 |
| Libreria | peft |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 aplicado sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen de tercera generación en su variante mínima. La técnica LoRA congela los pesos originales e inserta matrices de baja dimensionalidad en determinadas capas, de modo que solo se entrenan esos parámetros adicionales; el resultado es un fichero de pesos mucho menor que el modelo completo y que se carga en tiempo de inferencia mediante PEFT.

El entrenamiento se realizó sobre un conjunto de datos de consultas de alquiler (전월세 상담, asesoramiento sobre contratos de alquiler con depósito y renta mensual) y con una tasa de aprendizaje de 2e-4, según se indica en la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la longitud de las secuencias, el número de épocas ni si hubo fases de alineación adicionales (RLHF, DPO). Tampoco se documentan innovaciones técnicas más allá del propio uso de LoRA. El adaptador está pensado para servirse con vLLM, motor que la unidad correspondiente del curso utiliza para levantar el servidor de inferencia.

## Capacidades

- Generación de texto en coreano dentro del dominio acotado de consultas sobre alquiler (전월세).
- Adaptación de estilo y vocabulario al registro de asesoramiento inmobiliario coreano, gracias al ajuste fino con LoRA.
- Carga como adaptador PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, lo que permite alternar entre el comportamiento base y el ajustado sin duplicar pesos.
- Servicio mediante vLLM con soporte de adaptadores LoRA, tal como se describe en el material del curso.
- Capacidades heredadas del modelo base (generación general, multilingüismo del Qwen original) potencialmente degradadas o desplazadas por el ajuste específico; no documentadas para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento para este adaptador.

## Casos de uso

- Práctica guiada de LoRA: el adaptador sirve como ejemplo funcional para que los alumnos carguen un adaptador PEFT sobre un modelo base y comparen la salida antes y después del ajuste en el dominio de alquiler.
- Despliegue de servidor de inferencia con vLLM: la unidad de vLLM del curso descarga este repositorio y lo levanta como servidor, de modo que el alumno practica la configuración de adaptadores LoRA en un motor de serving real.
- Estudio de hiperparámetros: con r=8 y lr=2e-4 documentados, permite reproducir el experimento y analizar el efecto del rango y la tasa de aprendizaje en un corpus pequeño y especializado.
- Evaluación de sobreajuste en dominios estrechos: al tratarse de un corpus muy específico (consultas de alquiler), es útil para ilustrar cómo un adaptador pequeño puede especializar el estilo de un modelo de 0,8 B y hasta qué punto pierde generalidad.
- Demostración de alternancia de adaptadores: en un mismo servidor vLLM se puede comparar este adaptador con otros del mismo curso sobre el mismo modelo base, practicando la conmutación en caliente.
- Docencia sobre limitaciones de modelos especializados: el aviso explícito del autor ("no usar en atención al cliente real") convierte el artefacto en un caso práctico para discutir riesgos de alucinación y sesgo en dominios regulados como el inmobiliario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del modelo base (0,8 B), en FP16 rondaría 1,6 GB de pesos y en cuantización de 4 bits alrededor de 0,5 GB, cantidades a las que hay que sumar el adaptador LoRA (de tamaño muy reducido) y el overhead del runtime; estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados para este adaptador.
- GPU recomendadas: no disponibles. Por tamaño, el modelo base es ejecutable en GPU de consumo; no se documenta ninguna recomendación concreta (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se confirma en la documentación.
- Opciones de despliegue: vLLM es el motor citado explícitamente en la model card para el ejercicio del curso. La librería declarada es PEFT, por lo que también sería cargable con transformers + peft. No se documentan llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en la documentación proporcionada. Se incluye una comparación estructural con el modelo base y con la categoría de adaptadores PEFT, marcando como no disponible cualquier dato que no conste.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-lease-lora (este) | Adaptador LoRA r=8 sobre base de 0,8 B | No disponible | Apache 2.0 | safetensors (PEFT) | Especializado en consultas de alquiler en coreano; uso didáctico |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 B | No disponible | No disponible en la información proporcionada | No disponible | Modelo generalista; el adaptador se aplica sobre él |
| Otros adaptadores LoRA del curso Enkoa | No disponible | No disponible | No disponible | No disponible | No se listan en la información proporcionada |

## Limitaciones y advertencias

- Uso exclusivamente didáctico: el autor advierte de forma explícita que es un modelo de ejemplo y que no debe emplearse en asesoramiento real ("실제 상담에 쓰지 마십시오").
- Dominio muy estrecho: entrenado solo con datos de consultas de alquiler en coreano; fuera de ese dominio su comportamiento no está caracterizado.
- Riesgo de alucinación elevado en materia legal o contractual: un modelo de 0,8 B ajustado con LoRA sobre un corpus pequeño no garantiza exactitud normativa ni contractual, y el dominio inmobiliario está sujeto a regulación.
- Sesgos no documentados: no se publica información sobre la composición del dataset ni sobre sesgos demográficos, geográficos o socioeconómicos.
- Cobertura lingüística limitada: solo se declara coreano; el multilingüismo del modelo base puede haberse degradado tras el ajuste.
- Sin benchmarks: no hay métricas publicadas que permitan estimar calidad, por lo que cualquier evaluación de producción requeriría una batería propia.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- Metadatos incompletos: no se declara pipeline, ni contexto, ni cuantizaciones, ni detalles del entrenamiento (tokens, épocas, composición del dataset).
- Repositorio con muy poca tracción: 18 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-lease-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Librería PEFT: https://huggingface.co/docs/peft
- vLLM (motor de inferencia citado en la model card): https://github.com/vllm-project/vllm
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este adaptador.
