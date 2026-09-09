# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-text-fp16

## Resumen

El modelo `RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-text-fp16` es una version cuantizada de `gemma-4-26B-A4B-it`, un modelo de lenguaje de Google con arquitectura Mixture of Experts (MoE). La cuantizacion ha sido realizada por RepublicOfKorokke utilizando la herramienta oQ de oMLX, aplicando precision mixta de 3 bits con un grupo de 64 elementos. El resultado es un modelo con aproximadamente 25.233 millones de parametros totales y un peso de 11.7 GB, optimizado para ejecucion en Apple Silicon mediante MLX.

El modelo base de Gemma 4 soporta una ventana de contexto de hasta 256K tokens y mas de 140 idiomas, con capacidades para generacion de texto, programacion y razonamiento. Esta version cuantizada busca reducir los requisitos de almacenamiento y computo, permitiendo ejecutar un modelo de 26B en hardware de consumo sin necesidad de GPUs especializadas. Su relevancia radica en la posibilidad de desplegar modelos de gran escala en entornos locales con recursos limitados, sacrificando cierta precision numerica para ganar accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Transformer |
| Parametros totales | 25.233.141.790 |
| Parametros activos | 4.000.000.000 (aproximado, segun nomenclatura A4B del modelo base) |
| Longitud de contexto | 256K tokens (segun modelo base) |
| Tipos de cuantizacion | oQ3e: 3 bits, grupo de 64, precision mixta |
| Idiomas soportados | Mas de 140 idiomas (segun modelo base) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `gemma-4-26B-A4B-it` pertenece a la familia Gemma 4 de Google, que combina arquitecturas densas y MoE. En este caso, se trata de un modelo MoE con 26B parametros totales y 4B activos durante la inferencia, lo que reduce el coste computacional por token manteniendo una capacidad global elevada. La ventana de contexto declarada alcanza los 256K tokens y el soporte multilingue cubre mas de 140 idiomas.

La variante aqui presentada ha sido sometida a una cuantizacion posterior al entrenamiento utilizando oQ de oMLX. Los pesos se almacenan en formato MLX safetensors con una precision de 3 bits y un tamaño de grupo de 64. El nombre del repositorio sugiere que el modelo original paso por un proceso de quantization-aware training (QAT) con cuantizacion q4_0, pero sobre ese checkpoint se ha aplicado una nueva cuantizacion oQ3e. No se dispone de informacion detallada sobre los datos de entrenamiento, el numero de tokens de preentrenamiento ni procesos de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto en multiples idiomas, con soporte documentado de mas de 140 lenguajes.
- Razonamiento general y resolución de problemas logicos, segun la descripcion del modelo base.
- Generacion de codigo en distintos lenguajes de programacion, indicada por la ficha original de Gemma 4.
- Procesamiento de contextos muy largos, con una ventana de hasta 256K tokens, apta para documentos extensos o conversaciones prolongadas.
- No se ha confirmado de forma explicita en la informacion disponible el soporte de tool calling, function calling ni capacidad de vision.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede mantener dialogos extensos con memoria amplia gracias a la ventana de contexto de 256K, ejecutandose en un Mac con Apple Silicon mediante oMLX.
- Analisis de documentos juridicos o tecnicos: la capacidad de procesar contextos muy largos permite leer y resumir contratos, informes o expedientes completos sin division en fragmentos.
- Generacion de codigo asistida: el modelo puede ayudar a programadores en tareas de creacion, revision o explicacion de codigo, integrable en editores que usen MLX como backend.
- Traduccion multilingue en local: al soportar mas de 140 idiomas, resulta util para traducir documentos sin enviar datos a servicios en la nube.
- Chatbots de soporte con memoria historica prolongada: la ventana de 256K permite mantener el historico completo de una conversacion larga sin perder contexto.
- Investigacion en hardware de consumo: al estar cuantizado a 3 bits, puede ejecutarse en equipos sin GPU dedicada, facilitando experimentos de NLP en laboratorios o universidades con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 11.7 GB, lo que estima una ocupacion de memoria similar en RAM unificada durante la carga del modelo.
- RAM unificada recomendada: minimo 16 GB para ejecutar el modelo completo con seguridad en Apple Silicon; se recomiendan 24 GB o 32 GB para manejar contextos largos.
- GPU: no aplica directamente, ya que el modelo esta optimizado para MLX y se ejecuta en la GPU integrada de los chips M1, M2, M3 o M4.
- Dispositivo: Macs con Apple Silicon, iPads o cualquier sistema compatible con MLX.
- Opciones de despliegue: oMLX, que utiliza el runtime MLX de Apple. No se indica soporte nativo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Bits | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| `RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-text-fp16` | 25.23B | 3 | 256K | 140+ | No disponible |
| `RepublicOfKorokke/gemma-4-26B-A4B-it-oQ3-fp16` | No disponible | 3 | No disponible | No disponible | No disponible |
| `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` | No disponible | No disponible | 256K | 140+ | No disponible |

La principal diferencia entre estas versiones es el tipo de cuantizacion aplicada: el modelo evaluado combina una base QAT con una cuantizacion posterior oQ3e, mientras que la version sin el sufijo `qat` usa solo oQ3e sobre un modelo sin QAT. No se dispone de benchmarks comparativos entre ellas.

## Limitaciones y advertencias

- La cuantizacion a 3 bits es agresiva y puede degradar la calidad de las respuestas, especialmente en tareas que requieren precision numerica o razonamiento complejo.
- El repositorio tiene 0 descargas y 0 me gusta, lo que indica que no ha sido validado por la comunidad; su uso en produccion implica riesgo no evaluado.
- No se han publicado benchmarks, por lo que el rendimiento real frente al modelo base o a otras cuantizaciones es desconocido.
- La licencia del modelo no esta especificada en la informacion disponible; antes de cualquier uso comercial es imprescindible verificar los terminos del modelo base de Google.
- Pueden existir sesgos heredados del modelo original de Gemma 4, aunque no se documentan en esta ficha.
- El riesgo de alucinacion esta presente como en cualquier modelo de lenguaje, y puede verse incrementado por la baja precision numerica.

## Enlaces

- https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-text-fp16
- https://github.com/jundot/omlx
- https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-oQ3-fp16
