# LucidityAI/Synth-2.5-Pro-Preview

## Resumen

Synth 2.5 Pro Preview es un modelo de generación de texto desarrollado por LucidityAI, basado en la arquitectura Gemma 4 26BA4B. Se trata de un modelo de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y solo 4 000 millones de parámetros activos por token, lo que lo hace especialmente eficiente en inferencia. Este preview se ha entrenado exclusivamente con supervisión directa (SFT) sobre un conjunto de datos cerrado compuesto por interacciones creativas reales con modelos de última generación, y aún no ha recibido la fase de refinamiento por retroalimentación de IA (RLAIF) prevista para la versión final.

El modelo está orientado a tareas de escritura creativa y razonamiento híbrido, ofreciendo un modo de pensamiento opcional para profundizar en la generación. Su relevancia radica en que combina un tamaño reducido de parámetros activos con un enfoque específico en calidad creativa, lo que lo convierte en una opción atractiva para despliegues locales con recursos limitados. No obstante, al ser una versión preliminar, su rendimiento puede ser inferior al del modelo final y presenta limitaciones conocidas de estabilidad y previsibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma 4 26BA4B |
| Parametros totales | 25 805 933 872 (25,8 B) |
| Parametros activos | 4 000 000 000 (4 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio con pesos safetensors) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Synth 2.5 Pro Preview emplea una arquitectura de mezcla de expertos (MoE) derivada de Gemma 4 26BA4B, con 26 000 millones de parametros totales y 4 000 millones de parametros activos por token. Esta configuracion permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fraccion de los pesos se utiliza en cada paso de generacion. El modelo incorpora soporte de razonamiento hibrido, lo que significa que puede operar en un modo de generacion directa o activar un modo de pensamiento mas profundo para tareas que requieran analisis adicional.

El entrenamiento de este preview se ha realizado mediante supervision directa (SFT) sobre un conjunto de datos cerrado que recopila 3254 interacciones creativas reales con modelos de diversas familias, incluyendo Gemini, DeepSeek, GLM, Kimi, Minimax y StepFun. La mayoria de las muestras provienen de GLM 5.X (1981) y DeepSeek V4 Pro (804). El autor indica que la fase de RLAIF, orientada a optimizar cualidades creativas especificas, no se ha aplicado aun en esta version preliminar. Para la replicacion del modelo, se proporciona un conjunto de datos abierto similar llamado PIPKIN-Creative-174k.

## Capacidades

- Generacion de texto creativo: el modelo esta especificamente entrenado con datos de escritura creativa real, lo que le permite producir narraciones, dialogos y contenido literario con mayor naturalidad que modelos genericos.
- Razonamiento hibrido: soporta un modo de pensamiento opcional que permite profundizar en el analisis antes de generar la respuesta, util para tareas complejas de creatividad o resolucion de problemas.
- Conversacion multi-turno: al ser un modelo de generacion de texto, puede mantener dialogos extensos, aunque su rendimiento optimo se logra en modo no-pensante segun las notas del autor.
- Multilingue: solo se ha confirmado soporte para ingles (etiqueta "en").
- Sin capacidades de tool calling ni vision: no se mencionan funciones de llamada a herramientas ni procesamiento de imagenes en la informacion disponible.

## Casos de uso

- Escritura de ficcion y narrativa: el modelo puede generar capitulos de novelas, relatos cortos o dialogos con coherencia y estilo, aprovechando su entrenamiento en datos creativos reales. Es adecuado para autores que buscan un asistente de redaccion o para generar borradores iniciales.
- Guiones y contenido audiovisual: su capacidad para mantener tono y estructura lo hace util para crear guiones de cortometrajes, series o videos, asi como para desarrollar tramas y personajes.
- Poesia y textos literarios: puede componer poemas, haikus o textos liricos con metrica y rima, aunque su rendimiento en este ambito no esta cuantificado.
- Brainstorming creativo: en modo de razonamiento hibrido, puede generar ideas originales para campañas publicitarias, nombres de productos o conceptos artisticos, ofreciendo multiples alternativas.
- Redaccion publicitaria y marketing: puede producir eslóganes, descripciones de productos o textos promocionales con un tono persuasivo, aunque se recomienda supervisar el resultado por su naturaleza de preview.
- Asistente de escritura en tiempo real: integrado en editores o aplicaciones de chat, puede ayudar a redactar correos, articulos o publicaciones en redes sociales con un estilo natural, gracias a su baja latencia por el reducido numero de parametros activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas estandar como MMLU, HumanEval o GSM8K para este modelo preview.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de VRAM, GPUs recomendadas o latencia.
- Dado que el modelo tiene 25,8 B de parametros totales pero solo 4 B activos, es probable que pueda ejecutarse en GPUs de consumo con cuantizacion, aunque no se confirma oficialmente.
- El autor menciona compatibilidad con Llama.cpp y VLLM para despliegue local, lo que sugiere soporte para cuantizacion GGUF y ejecucion eficiente en CPU/GPU.
- Para una estimacion fiable, se recomienda consultar la documentacion de Gemma 4 26BA4B o probar el modelo en plataformas como Composite (https://composite.lucidity.sh/) que ofrece acceso gratuito limitado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (MoE con ~4 B activos). El autor no proporciona datos de rendimiento relativo ni se han encontrado evaluaciones independientes. Se sugiere comparar con modelos como Qwen3-30B-A3B o Gemma 3 27B, pero no hay datos publicados para este preview.

## Limitaciones y advertencias

- Es una version preview: el rendimiento puede ser inferior al del modelo final, especialmente en tareas creativas donde el modo no-pensante es actualmente el mas recomendado.
- Inestabilidad a temperaturas altas: los usuarios de Composite han reportado que el modelo se vuelve inestable con temperaturas superiores a 1, aunque el rango recomendado es 0,8-1.
- Previsibilidad: incluso dentro del rango de temperatura recomendado, el modelo puede resultar predecible en sus respuestas, limitando la variedad creativa.
- Contenido potencialmente dañino: como cualquier LLM, puede generar contenido ilegal, dañino o NSFW. Se recomienda implementar una capa de moderacion antes de un despliegue en produccion.
- Idioma limitado: solo se ha confirmado soporte para ingles, lo que restringe su uso en entornos multilingues.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o modificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucidityAI/Synth-2.5-Pro-Preview
- Coleccion de previews de Synth 2.5: https://huggingface.co/collections/LucidityAI/synth-25-preview
- Sitio web de LucidityAI: https://lucidityai.app/
- Plataforma LuciditySH (API): https://platform.lucidity.sh/
- Web corporativa de Lucidity: https://lucidity.sh/
- Dataset PIPKIN-Creative-174k: https://huggingface.co/datasets/LucidityAI/PIPKIN-Creative-174k
- Plataforma de pruebas Composite: https://composite.lucidity.sh/
