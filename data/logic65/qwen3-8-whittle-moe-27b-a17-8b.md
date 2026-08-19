# logic65/Qwen3.8-Whittle-MoE-27B-A17.8B

## Resumen

Qwen3.8-Whittle-MoE-27B-A17.8B es una conversión experimental de un modelo denso a un MoE (Mixture of Experts) realizada por el usuario logic65 sobre el modelo Qwen3.8-27B de Qwen. A diferencia de un MoE nativo, este modelo no ha sido preentrenado como tal: sus 64 capas de feed forward (17408 neuronas cada una) se han particionado en un experto compartido de 5120 neuronas y 64 expertos enrutados de 192, con routing top-16. El resultado es un modelo con 26.9B parámetros totales, de los cuales 17.8B se activan por token, lo que permite una inferencia más eficiente sin añadir ni duplicar parámetros.

El proceso de construcción incluye una fase de planificación basada en estadísticas de activación, una destilación por capas y un ajuste final con QLoRA (healing) para recuperar conocimiento. El modelo se sirve con llama.cpp bajo la arquitectura `qwen35moe` y se distribuye en formato GGUF. Es relevante porque demuestra que es posible convertir un modelo denso existente en un MoE con hardware de consumo, aunque con limitaciones importantes frente a un MoE preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 64 capas, experto compartido de 5120 y 64 expertos enrutados de 192, routing top-16 |
| Parametros totales | 26.917.297.664 (26.9B) |
| Parametros activos | 17.8B |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 262K tokens) |
| Tipos de cuantizacion | no disponible (formato GGUF, se asume multiples cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de un Qwen3.8-27B denso y lo convierte en un MoE sin preentrenamiento adicional. Cada capa de feed forward (17408 neuronas) se divide en un experto compartido de 5120 neuronas (siempre activo) y 64 expertos enrutados de 192 neuronas, de los cuales se seleccionan 16 por token. El router se construye a partir de los centroides de los clusters de co-activación de las neuronas. El proceso consta de cuatro fases: planificación (un pase de streaming para medir la frecuencia de activación de cada neurona), destilación (cada capa enseña a su reemplazo disperso usando activaciones reales, capa por capa), healing (ajuste fino con QLoRA de 4 bits, 1200 pasos, secuencia 256, loss final 1.68) y conversión a GGUF. No se añade ni se duplica ningún parámetro; solo se reorganiza el cómputo.

## Capacidades

- Generacion de texto fluido y gramaticalmente correcto, con capacidad de razonamiento basico.
- Conocimiento mundial general, aunque la destilacion puede degradar hechos especificos que viven en direcciones de baja magnitud.
- Inferencia dispersa: solo el 47% de cada feed forward se ejecuta por token, lo que reduce el computo frente al modelo denso original.
- Compatible con llama.cpp sin parches, lo que facilita su despliegue en entornos locales.
- No se confirman capacidades como tool calling, vision, audio o modo thinking en la informacion disponible.

## Casos de uso

- Generacion de texto en aplicaciones de bajo presupuesto: al requerir menos computo que el modelo denso original, puede ejecutarse en hardware mas modesto para tareas de redaccion, resumen o chat.
- Prototipado de sistemas de IA generativa: su licencia Apache 2.0 y formato GGUF permiten experimentar con arquitecturas MoE sin necesidad de entrenar un modelo desde cero.
- Educacion e investigacion: sirve como ejemplo practico de conversion post-hoc de un modelo denso a MoE, util para estudiar los limites de esta tecnica.
- Despliegue en entornos con restricciones de VRAM: con cuantizacion adecuada, podria caber en GPUs de consumo de 8-12 GB, aunque no hay datos confirmados.
- Chatbots locales: su capacidad de generar texto coherente lo hace util para asistentes conversacionales simples en aplicaciones de escritorio o servidores pequenos.
- Analisis de texto y extraccion de informacion: puede procesar documentos y responder preguntas factuales, aunque con riesgo de perdida de conocimiento especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona una bateria interna de 39 items en la que el modelo obtiene 32/39 tras el healing, pero no se detallan los items ni se comparan con otros modelos. Se indica que supera a otras variantes de la familia Whittle (18.3B layer-dropped y 14.7B distilled relay), pero sin datos cuantitativos publicos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 17.8B parametros activos y cuantizacion GGUF Q4, se estima que podria requerir alrededor de 9-10 GB, pero no hay confirmacion del autor.
- GPU recomendadas: no especificadas. El entrenamiento se realizo en GPUs de consumo (unas 5 horas), lo que sugiere que la inferencia es viable en hardware similar.
- Compatibilidad con consumer GPU: probablemente si, con cuantizacion adecuada, en GPUs de 8-12 GB como RTX 3080/4080 o similares.
- Opciones de despliegue: llama.cpp (arquitectura `qwen35moe`), compatible con Ollama y otros frontends que usen llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se puede mencionar que el modelo base Qwen3.8-27B es un denso de 27B con contexto de 262K, pero la conversion MoE no mantiene todas sus capacidades. No hay informacion sobre alternativas como otros MoE post-hoc o modelos nativos de tamano similar.

## Limitaciones y advertencias

- No es un MoE preentrenado: los expertos no son funciones distintas, ya que nunca fueron entrenados para diferenciarse. El router tiene poco margen de mejora.
- La fraccion activa no puede reducirse mucho: necesita un 47% de cada feed forward activo para mantener calidad, frente al 5-15% de los MoE nativos.
- No hay escalado libre: la capacidad total es exactamente la del modelo padre, no se anade capacidad.
- La destilacion restaura fluidez pero no conocimiento: los hechos especificos pueden perderse o degradarse, ya que viven en direcciones de baja magnitud que la destilacion por error cuadratico no recupera.
- Riesgo de alucinacion: al ser una conversion post-hoc, puede generar texto fluido pero con errores factuales.
- No se garantiza soporte para tool calling, vision u otras capacidades del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una investigacion preliminar y puede tener comportamientos impredecibles en produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Guia de Qwen3.8-27B en LovableApp](https://lovableapp.org/blog/qwen3-8-27b)
- [Ficha de Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Seguimiento de lanzamiento de Qwen3.8-27B](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
