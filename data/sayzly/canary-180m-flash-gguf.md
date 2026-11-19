# sayzly/canary-180m-flash-gguf

## Resumen

Canary 180M Flash (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) `nvidia/canary-180m-flash`, publicada por el usuario `sayzly` en Hugging Face. El modelo original lo desarrolla NVIDIA como parte de la familia Canary, orientada a transcripción de audio con arquitectura de tipo encoder-decoder (FastConformer + Transformer). Esta versión GGUF empaqueta el modelo en un único fichero `canary-180m-flash-Q8_0.gguf`, pensado para su descarga y uso por parte de la aplicación Sayzly.

El modelo tiene aproximadamente 189 millones de parámetros y un tamaño de repositorio de unos 0,2 GB, lo que lo sitúa en la gama ultraligera de ASR: cabe en cualquier equipo moderno y está pensado para transcripción rápida en local o en el borde. La licencia es CC BY 4.0, heredada del modelo original, lo que permite uso comercial con atribución.

La relevancia de esta ficha radica en que se trata de una redistribución comunitaria de pesos cuantizados, no de un modelo nuevo: no aporta entrenamiento adicional ni cambios en los pesos más allá de la conversión de formato. Es útil para quien quiera ejecutar Canary 180M Flash con runtimes compatibles con GGUF, pero conviene tener presente que la model card del autor es mínima y no documenta detalles de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de ASR (modelo base NVIDIA Canary; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | 189.083.776 (aprox. 189 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `canary-180m-flash-Q8_0.gguf`) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `nvidia/canary-180m-flash`, un sistema de reconocimiento automático de voz de NVIDIA. La model card de esta redistribucion no detalla la arquitectura interna, el volumen de datos de entrenamiento, la composicion del corpus ni si hubo etapas de ajuste fino supervisado o preferencias; toda esa informacion corresponde al modelo original y no se reproduce aqui. Lo unico documentado es que se trata de un modelo de speech-to-text de unos 189 millones de parametros.

En cuanto a esta version concreta, el autor indica que se ha convertido a GGUF y que los pesos no se han modificado por lo demas. El fichero publicado es una cuantizacion Q8_0, es decir, pesos de 8 bits con escala por bloque, lo que reduce el tamaño frente a los pesos originales manteniendo una perdida de precision habitualmente baja. No se documenta que herramienta de conversion se uso, ni si se verifico la equivalencia numerica frente al modelo original.

## Capacidades

- Reconocimiento automatico de voz (transcripcion de audio a texto), segun el pipeline declarado `automatic-speech-recognition`.
- Ejecucion en formato GGUF, apta para runtimes que cargan este tipo de ficheros.
- Modelo de tamano reducido (189 M de parametros), adecuado para inferencia en CPU o GPU de gama baja.
- No se documentan capacidades de traduccion, diarizacion, marcas temporales, puntuacion automatica ni tool calling en la informacion disponible.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion local de notas de voz: al ser un modelo de 189 M en Q8_0, puede ejecutarse en un portatil sin GPU dedicada para convertir grabaciones cortas en texto, con latencia baja y sin depender de servicios en la nube.
- Integracion en la aplicacion Sayzly: el autor publica este fichero como el que descarga dicha aplicacion, de modo que el caso de uso principal documentado es servir de motor ASR dentro de ese producto.
- Prototipado rapido de pipelines ASR: util para validar una cadena de transcripcion antes de invertir en modelos mayores, gracias al tamano reducido del fichero (0,2 GB) y a la licencia permisiva.
- Procesamiento por lotes de audio de duracion corta en entornos con recursos limitados, como dispositivos de borde o contenedores pequenos.
- Subtitulado asistido de contenido propio: con la licencia CC BY 4.0 se puede usar comercialmente citando a los autores, siempre que la calidad de transcripcion del modelo base resulte suficiente para el material.
- Evaluacion comparativa de cuantizaciones: permite medir el impacto de Q8_0 frente a los pesos originales en tareas de transcripcion, como paso previo a decidir que formato desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del fichero (0,2 GB en Q8_0) y los 189 M de parametros, la huella de pesos es del orden de centenares de MB, a lo que se suma memoria para activaciones y audio de entrada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer moderna deberia ser suficiente, pero no hay datos oficiales que lo confirmen.
- CPU: al ser un modelo ultraligero en GGUF, es candidato razonable para inferencia en CPU, aunque no se documentan requisitos minimos.
- Opciones de despliegue: runtimes compatibles con GGUF; no se especifica cuales se han probado. vLLM, TGI y Ollama no estan confirmados para este fichero en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sayzly/canary-180m-flash-gguf | 189 M | No disponible | CC BY 4.0 | GGUF (Q8_0) | Redistribucion comunitaria del modelo NVIDIA |
| nvidia/canary-180m-flash | 189 M | No disponible | CC BY 4.0 | Pesos originales (formato no detallado aqui) | Modelo de referencia del que deriva esta version |
| Otras alternativas ASR de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Se trata de una redistribucion no oficial: el autor no es NVIDIA y no se documenta el proceso de conversion ni verificaciones de equivalencia con el modelo original.
- La model card es minima: no indica idiomas, contexto de audio maximo, formato de entrada esperado ni requisitos de runtime, lo que dificulta planificar un despliegue en produccion.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio ruidoso, acentos no vistos en entrenamiento o vocabulario tecnico; no hay datos publicados sobre este aspecto para la version GGUF.
- La cuantizacion Q8_0 puede introducir diferencias menores de precision frente a los pesos originales; no se documenta ninguna evaluacion al respecto.
- Uso comercial permitido bajo CC BY 4.0, pero exige atribucion a los autores originales (NVIDIA) y al publicador de la conversion; conviene revisar los terminos del modelo base por si anaden condiciones.
- Sin descargas ni likes registrados en el momento de la ficha, y actualizacion practicamente inmediata tras la creacion: no hay senales de validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos demograficos o linguisticos del modelo base en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/canary-180m-flash-gguf
- Modelo original: https://huggingface.co/nvidia/canary-180m-flash
