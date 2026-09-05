# Avertry/logos-theological-9b-gguf

## Resumen

Logos Theological 9B es un modelo de lenguaje especializado en análisis bíblico estructural, desarrollado por Avertry como fine-tuning del modelo base Gemma 2 9B de Google. El modelo está diseñado para identificar patrones teológicos —como kenosis, autoridad e inversión— en textos bíblicos, sin reclamar autoridad doctrinal. Su enfoque epistemológico busca "comprometerse con el misterio sin resolverlo", lo que lo hace útil para investigación teológica y humanidades digitales.

El modelo se distribuye en formato GGUF cuantizado, pensado para ejecución local mediante Ollama, y soporta conversación en inglés y español. Con 9.241.705.984 parámetros totales, el archivo pesa aproximadamente 6.2 GB y requiere un mínimo de 16 GB de RAM según el autor. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 9B) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés, español |
| Licencia | other (uso de investigación; contacto para licencia comercial) |
| Formato de pesos | GGUF (quantized) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 2 9B de Google, un transformer decoder-only con mecanismos de atención estándar. No se han publicado detalles sobre el proceso de fine-tuning: no se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La única referencia técnica adicional es un trabajo de investigación titulado "The Instrument Trap" (DOI: 10.5281/zenodo.18716474), que parece estar asociado al desarrollo del modelo.

La innovación principal no es arquitectónica, sino conceptual: el modelo está afinado para detectar patrones estructurales en textos teológicos (kenosis, autoridad, inversión) manteniendo una postura de no autoridad. Esto lo distingue de otros fine-tunings teológicos que podrían adoptar una posición doctrinal más explícita.

## Capacidades

- Generación de texto conversacional en inglés y español.
- Análisis estructural de textos bíblicos: identifica patrones como kenosis, autoridad e inversión.
- Enfoque epistemológico: no reclamar autoridad teológica, lo que permite un diálogo abierto sobre el misterio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: inglés y español.
- Capacidades especiales adicionales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación teológica asistida: el modelo puede analizar pasajes bíblicos y señalar estructuras de kenosis, autoridad o inversión, apoyando a investigadores en exégesis sin imponer interpretaciones.
- Educación en seminarios: sirve como herramienta de discusión en clases de teología, generando preguntas y perspectivas sobre textos complejos desde una óptica epistemológica.
- Preparación de sermones y reflexiones: líderes religiosos pueden usarlo para explorar temas recurrentes en un pasaje y estructurar reflexiones pastorales, manteniendo el control teológico humano.
- Comparación de traducciones bíblicas: al estar entrenado en inglés y español, permite contrastar matices lingüísticos entre versiones, lo que resulta útil para traductores y filólogos.
- Humanidades digitales: investigadores pueden aplicar el modelo a corpus teológicos extensos para detectar patrones de autoridad o inversión en textos históricos.
- Chat conversacional especializado: usuarios interesados en epistemología teológica pueden dialogar con el modelo sobre conceptos como kenosis, recibiendo respuestas que no cierran el debate sino que lo profundizan.
- Guías de estudio bíblico: el modelo puede generar resúmenes temáticos o preguntas de reflexión para grupos de estudio, adaptadas al contexto de cada pasaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El README indica 16 GB de RAM mínimo, pero no especifica requisitos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del archivo GGUF (~6.2 GB) sugiere que podría ejecutarse en tarjetas con 8-12 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: Ollama (recomendado por el autor). Al ser un modelo GGUF, también es compatible con entornos que carguen este formato, como llama.cpp, aunque no se menciona explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa. El modelo es un fine-tuning de Gemma 2 9B, por lo que su rendimiento en tareas generales será similar al del modelo base, con una especialización en análisis teológico. Existe un repositorio espejo en LumenSyntax/logos-theological-9b-gguf con el mismo nombre y un Modelfile, lo que sugiere que podría tratarse del mismo modelo publicado en otra cuenta. No se han publicado benchmarks que permitan comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos: no documentados. Al estar afinado con textos teológicos, el modelo puede reflejar sesgos doctrinales o culturales presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar interpretaciones teológicas incorrectas o atribuir citas o conceptos de forma errónea.
- Limitaciones de contexto: no especificadas. La longitud de contexto no se ha publicado, lo que limita su uso en documentos extensos.
- Restricciones de licencia: el modelo tiene licencia "other" y está limitado a uso de investigación. Para uso comercial es necesario contactar a Rafael Rodriguez. Además, el modelo es gated y requiere aprobación manual para acceder.
- Advertencia de autoridad: el autor declara explícitamente que el modelo no reclama autoridad teológica; no debe utilizarse como fuente autorizada de doctrina ni como sustituto del juicio humano en asuntos religiosos.
- Datos de entrenamiento no disponibles: la ausencia de información sobre el dataset limita la transparencia y la reproducibilidad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Avertry/logos-theological-9b-gguf
- Paper asociado: https://doi.org/10.5281/zenodo.18716474
- Repositorio espejo: https://huggingface.co/LumenSyntax/logos-theological-9b-gguf
- Modelfile: https://huggingface.co/LumenSyntax/logos-theological-9b-gguf/blob/main/Modelfile
- Ollama: https://ollama.com
