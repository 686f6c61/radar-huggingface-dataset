# alphanozcan/essAi-9b

## Resumen

essAi 9B es un modelo de lenguaje especializado en la redacción de ensayos de admisión universitaria, desarrollado por Alphan Özcan a partir del modelo base Qwen/Qwen3.5-9B. Su propósito es generar textos auténticos en estilo "Common App personal statement", con una voz humana natural y detalles personales específicos. El modelo se posiciona como la versión más grande de la familia essAi, siendo el hermano mayor de essAi (basado en Qwen3-4B).

El modelo se ha afinado en dos etapas: primero con supervisión (SFT) sobre aproximadamente 19.670 ensayos humanos reales, y posteriormente con optimización por preferencias (DPO) para alinear las salidas con la calidad de escritura humana. Con 9.653 millones de parámetros y una licencia Apache 2.0, essAi 9B está disponible para uso comercial y académico sin restricciones significativas. Su relevancia actual radica en la creciente demanda de herramientas que ayuden a los estudiantes a redactar ensayos de admisión auténticos, en un contexto donde los detectores de IA son cada vez más sofisticados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (version MLX 4-bit disponible por separado) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

essAi 9B hereda la arquitectura del modelo base Qwen3.5-9B, un transformer autoregresivo de 9.000 millones de parametros. El proceso de afinamiento se realizo en dos etapas diferenciadas. La primera etapa consistio en un ajuste supervisado (SFT) utilizando LoRA con rango 16 aplicado a todas las capas lineales, con una tasa de aprendizaje de 2e-4, una sola epoca y precision bf16. Los datos de entrenamiento incluyeron 270 ensayos de admision reales publicados en colecciones publicas (JHU "Essays That Worked", College Essay Guy, AP Study Notes) y aproximadamente 19.400 ensayos humanos adicionales del corpus persuade.

La segunda etapa empleo optimizacion por preferencias directas (DPO) con el metodo HumanLLMs (arXiv 2501.05032), donde el ensayo humano real se utilizo como respuesta preferida y la salida del modelo SFT como respuesta rechazada. Tambien se incorporaron pares de calidad de GradGPT. Los hiperparametros de DPO fueron beta=0.1, tasa de aprendizaje de 5e-5 y una sola epoca. El entrenamiento completo se realizo en una unica GPU A100.

## Capacidades

- Generacion de ensayos de admision universitaria en estilo Common App personal statement, con una extension aproximada de 650 palabras.
- Escritura en voz humana natural, con detalles personales especificos, ritmo de oraciones variado y reflexion honesta.
- Soporte de conversacion multi-turno mediante la plantilla de chat de Qwen, con roles de sistema y usuario.
- Capacidad de desactivar el modo de pensamiento (enable_thinking=False) para generacion directa.
- Adaptacion a diferentes temas de ensayo, como "aprender del fracaso" u otros prompts tipicos de solicitudes universitarias.
- Generacion de texto con parametros de muestreo configurables (temperatura, top_p, max_new_tokens).

## Casos de uso

- Redaccion de ensayos personales para solicitudes universitarias: el modelo genera borradores completos de 650 palabras a partir de un prompt tematico, proporcionando una base solida que el estudiante puede personalizar con sus propias experiencias.
- Lluvia de ideas para ensayos: los estudiantes pueden solicitar multiples variaciones sobre un mismo tema para explorar diferentes angulos narrativos antes de elegir el enfoque final.
- Practica de escritura para entrevistas de admision: el modelo puede generar respuestas tipo personal statement que sirven como material de practica para entrevistas orales.
- Evaluacion de autenticidad: los orientadores educativos pueden comparar los ensayos generados con escritos humanos para calibrar sus expectativas sobre lo que constituye una voz autentica.
- Generacion de ejemplos para talleres de escritura: los educadores pueden usar el modelo para crear ejemplos de ensayos que los estudiantes deben criticar y mejorar, fomentando el pensamiento critico sobre estructura y estilo.
- Asistencia para solicitantes no nativos: estudiantes cuyo primer idioma no es el ingles pueden generar borradores en ingles y luego refinarlos, reduciendo la barrera linguistica en el proceso de solicitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero un modelo de 9.653 millones de parametros en precision bf16 requiere aproximadamente 19-20 GB de VRAM. Con cuantizacion de 4 bits, la demanda se reduce a unos 5-6 GB.
- GPU recomendadas: A100 (usada en entrenamiento), H100, RTX 4090 (24 GB) para precision completa; GPUs consumer de 8-12 GB con cuantizacion.
- Compatibilidad con GPU consumer: si, con cuantizacion de 4 bits cabe en RTX 3060 (12 GB), RTX 4070 (12 GB) y similares.
- Opciones de despliegue: transformers con device_map="auto", MLX para Apple Silicon (version 4-bit disponible en alphanozcan/essAi-9b-mlx), compatible con endpoints de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| essAi 9B | 9,65B | no disponible | Ensayos de admision universitaria | Apache 2.0 |
| essAi (Qwen3-4B) | 4B | no disponible | Ensayos de admision universitaria | Apache 2.0 |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista | Apache 2.0 |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de informacion sobre alternativas de otros desarrolladores especializadas en la misma tarea.

## Limitaciones y advertencias

- El comportamiento frente a detectores de IA no esta garantizado; aunque el modelo se entreno con ensayos humanos para lograr un estilo mas natural, los detectores son clasificadores entrenados y los resultados pueden variar.
- El modelo esta entrenado exclusivamente en ingles, por lo que no es adecuado para generar ensayos en otros idiomas.
- La especializacion en ensayos de admision limita su utilidad para otras tareas de escritura creativa o tecnica.
- El conjunto de datos de entrenamiento proviene de fuentes publicas especificas, lo que puede introducir sesgos hacia ciertos estilos narrativos o demografias representadas en esos ejemplos.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en aplicaciones que requieran manejar documentos extensos.
- El modelo no ha sido evaluado con benchmarks estandarizados, por lo que su rendimiento en tareas generales de razonamiento o conocimiento no esta caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alphanozcan/essAi-9b
- Version MLX para Apple Silicon: https://huggingface.co/alphanozcan/essAi-9b-mlx
- Modelo essAi (version 4B): https://huggingface.co/alphanozcan/essAi
- Perfil del autor: https://huggingface.co/alphanozcan
- Referencia del metodo HumanLLMs: arXiv 2501.05032
