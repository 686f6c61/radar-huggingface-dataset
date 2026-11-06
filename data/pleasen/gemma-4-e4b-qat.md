# pleasen/Gemma-4-E4B-QAT

## Resumen

Gemma-4-E4B-QAT es una variante cuantizada y optimizada del modelo Gemma 4 E4B, publicada por el usuario `pleasen` en Hugging Face. El modelo parte de la familia Gemma de Google y se distribuye en formato GGUF, lo que lo hace compatible con motores de inferencia orientados a eficiencia como llama.cpp u Ollama. La publicación se centra en reducir el peso del modelo para despliegues en dispositivos con recursos limitados, incluyendo moviles y hardware de borde.

La optimizacion declarada por el autor combina varias tecnicas: eliminacion de los codificadores de audio, cuantizacion de las capas de vision a Q8_0 o Q4_0, y conversion de los embeddings posicionales de FP32 a FP16. Segun la model card, estas modificaciones reducen el tamano del fichero `mmproj-BF16` a aproximadamente el 20% del original en la variante Q8_0, lo que disminuye de forma significativa los requisitos de almacenamiento para despliegue en dispositivo.

El modelo cuenta con 7.463.013.674 parametros segun los datos de safetensors y un tamano de repositorio de 7,6 GB. La licencia es la Gemma License. No se dispone de informacion sobre el pipeline, los idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; capas de vision en Q8_0 o Q4_0; embeddings posicionales en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Gemma License |
| Formato de pesos | GGUF (repo con ficheros de cuantizacion y `mmproj-BF16`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura (Gemma 4 E4B) y la presencia de capas de vision y codificadores de audio, se trata de un modelo multimodal de la familia Gemma, pero no se confirman detalles como el tipo de transformer, el mecanismo de atencion ni la composicion del dataset de entrenamiento.

Las unicas innovaciones tecnicas documentadas son las optimizaciones de despliegue aplicadas por el autor: eliminacion de los codificadores de audio para reducir la huella del modelo, cuantizacion de las capas de vision a Q8_0 o Q4_0, y conversion de los embeddings posicionales de FP32 a FP16 para reducir tamano manteniendo mayor precision que las capas de vision cuantizadas. No se documenta el proceso de cuantizacion QAT (quantization-aware training) mas alla del nombre del repositorio, ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el tag `conversational` del repositorio.
- Capacidades multimodales de vision, dado que la model card menciona capas de vision cuantizadas y un fichero `mmproj`.
- Capacidad de audio eliminada en esta variante: el autor indica que los codificadores de audio se han retirado para reducir el tamano del modelo.
- Compatibilidad con endpoints, segun el tag `endpoints_compatible`.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en dispositivos moviles y hardware de borde: la reduccion del fichero `mmproj-BF16` a cerca del 20% del original en Q8_0 permite almacenar el modelo en telefonos y dispositivos con almacenamiento limitado, manteniendo capacidades de vision.
- Asistentes conversacionales locales sin conexion: al distribuirse en GGUF y estar orientado a recursos limitados, puede ejecutarse en equipos de sobremesa modestos mediante llama.cpp u Ollama para tareas de chat.
- Procesamiento de imagenes en el dispositivo: las capas de vision cuantizadas a Q8_0 o Q4_0 permiten tareas de descripcion de imagenes o extraccion de informacion visual sin enviar datos a la nube.
- Prototipado rapido de aplicaciones multimodales: el formato GGUF y el tag `endpoints_compatible` facilitan integrar el modelo en servicios de inferencia ligeros para pruebas de concepto.
- Aplicaciones de privacidad estricta: al poder ejecutarse localmente, es adecuado para escenarios donde los datos no pueden salir del dispositivo, como documentacion medica o interna.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para estudiar el impacto de cuantizar capas de vision y convertir embeddings posicionales a FP16 en la calidad final del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7.463.013.674 parametros, una cuantizacion a 4 bits requeriria aproximadamente 4 GB de memoria para los pesos, y a 8 bits unos 8 GB, sin contar el fichero `mmproj` ni el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por tamano, es plausible en GPUs con 8 GB o mas de VRAM en cuantizaciones de 4 bits, pero no se confirma en la informacion disponible.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, sin mas detalle.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La cuantizacion de las capas de vision a Q8_0 o Q4_0 y la conversion de embeddings posicionales a FP16 pueden degradar la calidad en tareas visuales respecto al modelo original; no se documenta la magnitud de esa perdida.
- La eliminacion de los codificadores de audio implica que esta variante no puede procesar audio, aunque el modelo base pudiera hacerlo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo.
- La licencia Gemma impone condiciones de uso que deben revisarse antes de un despliegue comercial; no se detallan aqui sus restricciones concretas.
- El repositorio no tiene descargas ni likes y fue creado y actualizado en la misma fecha, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud de contexto soportada ni sobre los idiomas cubiertos.

## Enlaces

- Hugging Face: https://huggingface.co/pleasen/Gemma-4-E4B-QAT
