# Gaspery/granite-for-grod

## Resumen

Granite for GRØD es un ajuste fino del modelo IBM Granite 4.1 8B, publicado por el usuario Gaspery en Hugging Face. Se trata de una adaptación orientada a una tarea muy concreta: la generación de notas de reunión a partir de transcripciones, pensada para ejecutarse localmente en un Mac con 16 GB de memoria o más. El modelo parte de los pesos de `ibm-granite/granite-4.1-8b` (revisión `1504002f650e656a0a3789d99574df12e3e94ed0`) y aplica sobre ellos una cuantización de 4 bits mediante MLX, seguida de un ajuste con un adaptador LoRA de rango 16 en las 40 capas del modelo.

La relevancia de esta ficha es limitada pero clara: demuestra un flujo de trabajo completo de adaptación de un modelo de 8.380.551.168 parámetros a un caso de uso específico, con cuantización y ajuste combinados en un único artefacto listo para inferencia en Apple Silicon. No se trata de un modelo generalista nuevo, sino de un derivado especializado que hereda las capacidades del Granite 4.1 8B y las orienta a la síntesis de actas.

El repositorio tiene 4,7 GB, formato safetensors con cuantización de 4 bits y licencia Apache 2.0, igual que el modelo base. La información publicada por el autor es escasa: no se detallan volúmenes de datos de entrenamiento, hiperparámetros del LoRA ni resultados de evaluación, por lo que muchos apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de IBM Granite 4.1 8B); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 8.380.551.168 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el uso recomendado procesa transcripciones en tramos de diez minutos con respuestas de hasta 2.048 tokens |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado, libreria MLX) |

## Arquitectura y entrenamiento

El modelo es un derivado del IBM Granite 4.1 8B, un transformer decoder-only de 8.380.551.168 parámetros. El autor no describe en la model card la arquitectura interna del modelo base (número de capas, dimensiones, mecanismos de atención), por lo que esos detalles deben consultarse en la documentación de `ibm-granite/granite-4.1-8b`. Lo que sí se especifica es el proceso de adaptación: primero se cuantizan los pesos a 4 bits con MLX, después se entrena un adaptador LoRA de rango 16 sobre las 40 capas del modelo con notas de reuniones sintéticas, y finalmente el adaptador se fusiona en los pesos cuantizados.

Este orden (cuantizar y luego ajustar, fusionando el adaptador en los pesos de 4 bits) es una decisión de ingeniería práctica: produce un único artefacto que se carga directamente en MLX sin necesidad de aplicar el adaptador en tiempo de inferencia, lo que simplifica el despliegue en Mac. No se indica el número de tokens de entrenamiento, la composición exacta del dataset sintético, ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado. Tampoco se documentan innovaciones técnicas propias más allá del pipeline de cuantización y fusión.

## Capacidades

- Generación de texto y síntesis de contenido a partir de transcripciones, orientada específicamente a la redacción de notas de reunión.
- Procesamiento por tramos: el flujo previsto divide la transcripción en piezas de diez minutos y genera una respuesta por pieza, con decodificación greedy y un máximo de 2.048 tokens por respuesta.
- Herencia de las capacidades del Granite 4.1 8B en generación de texto, razonamiento y código; no se documenta ninguna capacidad adicional específica del ajuste.
- Soporte de tool calling y function calling: no disponible en la información publicada para este derivado.
- Soporte de agentes y razonamiento multi-paso: no documentado para este derivado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Actas de reuniones en local: el caso de uso principal y documentado. El modelo recibe un tramo de diez minutos de transcripción y devuelve notas estructuradas, ejecutándose en un Mac con 16 GB o más de memoria gracias a la cuantización de 4 bits.
- Resumen de reuniones largas por segmentación: al procesar la transcripción en bloques de diez minutos con hasta 2.048 tokens de salida, se pueden encadenar varias pasadas para cubrir reuniones de una hora o más y consolidar después las notas parciales.
- Privacidad de datos en entornos corporativos: al ejecutarse íntegramente en local con MLX, evita enviar transcripciones confidenciales a servicios en la nube, lo que encaja en sectores con requisitos estrictos de tratamiento de datos.
- Herramienta de productividad para equipos pequeños: integración en un script o aplicación de escritorio en macOS que tome la transcripción de una herramienta de videollamada y produzca un borrador de acta para revisión humana.
- Prototipado de pipelines de síntesis sobre Apple Silicon: sirve como referencia de un flujo completo (cuantización 4 bits, LoRA de rango 16, fusión de pesos) para equipos que quieran adaptar otros modelos de 8B a tareas concretas con MLX.
- Base para ajustes posteriores: dado que la licencia es Apache 2.0 y los pesos están en safetensors, se puede partir de este derivado para afinar aún más el estilo de las notas o adaptarlo a dominios específicos, siempre que se respeten las condiciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que el modelo está pensado para Mac con 16 GB de memoria o más; el repositorio ocupa 4,7 GB, coherente con pesos de 8B en 4 bits más overhead.
- GPU recomendadas: Apple Silicon con memoria unificada de 16 GB o superior, dado que la librería es MLX; no se documenta soporte para GPU NVIDIA en esta publicación.
- Compatibilidad con consumer GPU: no disponible para el ecosistema CUDA en esta versión; en Apple Silicon, sí cabe en equipos de 16 GB.
- Opciones de despliegue: MLX (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos cuantizados.
- Latencia y throughput: no disponibles; la model card solo especifica decodificación greedy y un límite de 2.048 tokens por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite for GRØD (este modelo) | 8.380.551.168 | no disponible | Apache 2.0 | safetensors 4 bits (MLX) | Ajuste LoRA para notas de reunion, solo ingles, orientado a Apple Silicon |
| ibm-granite/granite-4.1-8b | 8B (aproximado) | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base generalista del que deriva; capacidades mas amplias y sin especializar |
| Alternativas de 7-8B para resumen (p. ej. familias Llama o Mistral) | 7-8B | variable | variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está entrenado con notas de reuniones sintéticas y puede degradarse fuera de ese dominio o con estilos de acta muy distintos.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Datos sintéticos: al entrenarse con notas de reuniones sintéticas, puede reproducir sesgos o patrones artificiales del dataset y no reflejar la variedad de reuniones reales.
- Riesgo de alucinación: como todo modelo generativo, puede inventar acuerdos, asistentes o decisiones que no aparecen en la transcripción; las actas generadas requieren revisión humana.
- Contexto no documentado: no se especifica la longitud de contexto del modelo base en esta publicación, y el flujo recomendado asume tramos de diez minutos, lo que limita el análisis global de una reunión en una sola pasada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base de IBM.
- Ecosistema: los pesos están cuantizados para MLX, lo que restringe su uso a Apple Silicon salvo que se reconviertan; no hay garantía de compatibilidad con otras herramientas de inferencia.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evaluación publicada ni comunidad que lo respalde; no es recomendable para producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gaspery/granite-for-grod
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Revisión del modelo base citada: `1504002f650e656a0a3789d99574df12e3e94ed0`
