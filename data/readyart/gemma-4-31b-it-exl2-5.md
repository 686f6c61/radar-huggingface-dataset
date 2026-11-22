# ReadyArt/Gemma-4-31B-IT-EXL2.5

## Resumen

ReadyArt/Gemma-4-31B-IT-EXL2.5 es un repositorio de pesos cuantizados en formato EXL2 (ExLlamaV2) a partir de un modelo denominado comercialmente como Gemma 4 31B IT. El autor del artefacto es el usuario de Hugging Face "ReadyArt", no Google DeepMind, y la model card publicada se limita a una cabecera YAML con la licencia apache-2.0, sin descripcion tecnica, sin datos de entrenamiento ni instrucciones de uso.

La relevancia del repositorio es practica: EXL2 es un formato de cuantizacion de precision mixta orientado al motor ExLlamaV2, que permite ejecutar modelos grandes con requisitos de VRAM reducidos y velocidades de decodificacion altas en GPUs de consumo. El sufijo "2.5" en el nombre sugiere un nivel de cuantizacion de aproximadamente 2,5 bits por peso, lo que situaria el peso total en el entorno de 9-10 GB para un modelo de 31B parametros, aunque este dato no esta confirmado en la informacion disponible.

No se dispone de informacion verificable sobre la arquitectura exacta del modelo base, los datos de entrenamiento, el contexto maximo o los idiomas soportados. Cualquier evaluacion de produccion deberia partir de la ficha oficial del modelo original de Google y de pruebas propias sobre este artefacto cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base presumiblemente transformer; no confirmado) |
| Parametros totales | 31B (segun el nombre del repositorio; no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL2 (precision mixta, nivel 2.5 bpw segun el nombre) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | EXL2 (ExLlamaV2); no se indica presencia de safetensors ni GGUF |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo base, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio es un artefacto de cuantizacion: el trabajo del autor consiste en convertir los pesos originales a formato EXL2, no en entrenar el modelo.

EXL2 permite asignar bits por peso de forma no uniforme por capa, de modo que las capas mas sensibles conservan mayor precision mientras las menos criticas se comprimen mas. El nivel 2.5 bpw es agresivo y suele implicar una perdida de calidad medible frente a cuantizaciones de 4 bpw o superiores, especialmente en tareas de razonamiento y codigo. No se documenta en el repositorio que calibracion se uso ni que medicion de perplejidad acompaña a esta cuantizacion.

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, no documentada en este repositorio.
- Razonamiento y matematicas: no disponible; depende del modelo original y de la degradacion introducida por la cuantizacion a 2.5 bpw.
- Generacion de codigo: no disponible; las cuantizaciones de muy baja precision suelen afectar antes a codigo y matematicas que a texto libre.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: el formato EXL2 a 2.5 bpw permite cargar un modelo de 31B en tarjetas de 12-16 GB, algo inviable con pesos en fp16 (que requeririan en torno a 62 GB solo para pesos). Adecuado para prototipado local, no para produccion con requisitos estrictos de calidad.
- Inferencia interactiva de baja latencia: ExLlamaV2 esta optimizado para decodificacion rapida en GPUs consumer, por lo que este artefacto sirve para chat local con respuesta fluida una vez cargado el modelo.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de 2.5 bpw frente a 4.0 o 6.0 bpw sobre el mismo modelo base, con conjuntos de evaluacion propios.
- Generacion de texto offline en estaciones de trabajo: escenarios de redaccion asistida o resumen sin conexion donde la precision absoluta no es critica y prima disponer de un modelo grande en hardware modesto.
- Investigacion sobre precision mixta: analisis de que capas toleran mejor la compresion extrema, usando este repositorio como punto de comparacion.
- Filtrado y clasificacion de texto a granel en local: tareas de etiquetado simple donde el throughput importa mas que la calidad punta, sujeto a validacion previa con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye perplejidad, evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada: a 2.5 bpw, los pesos de un modelo de 31B ocuparian aproximadamente 9,7 GB; con overhead de contexto y cache KV, el consumo realista se situa en el entorno de 11-14 GB, cifra no confirmada por el autor.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) ofrecen margen amplio para contexto largo; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) deberian bastar para contexto moderado.
- GPU de 12 GB (RTX 3060, RTX 4070): posible solo con contexto corto y validacion previa; el margen es muy ajustado.
- Cabe en GPU de consumo: si, previsiblemente en modelos de 16 GB o mas, condicionado a la verificacion real del tamano del artefacto.
- Opciones de despliegue: ExLlamaV2 y su servidor de API (exllamav2 / TabbyAPI). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no cargan pesos EXL2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ReadyArt/Gemma-4-31B-IT-EXL2.5 | 31B (segun nombre) | no disponible | EXL2 2.5 bpw | apache-2.0 | Cuantizacion de terceros, sin documentacion tecnica |
| Modelo base Gemma 4 31B IT (oficial) | 31B (presumiblemente) | no disponible | safetensors | no disponible en esta ficha | Referencia de calidad sin perdida por cuantizacion |
| Cuantizaciones GGUF del mismo modelo base | 31B | no disponible | GGUF (Q4_K_M, Q5_K_M, etc.) | segun modelo base | Compatibles con llama.cpp y Ollama; menor velocidad en GPU que EXL2 |
| Cuantizaciones EXL2 a 4.0-6.0 bpw del mismo modelo base | 31B | no disponible | EXL2 | segun modelo base | Mayor calidad que 2.5 bpw a cambio de mas VRAM |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no aporta ninguna documentacion tecnica: no hay instrucciones de uso, calibracion, ni advertencias del autor.
- El nivel de cuantizacion 2.5 bpw es muy agresivo; cabe esperar degradacion en razonamiento, matematicas y generacion de codigo respecto a los pesos originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se puede verificar que el contenido corresponda realmente a un modelo Gemma 4 31B IT; el nombre es la unica fuente y no hay hashes ni referencias al modelo base.
- Licencia apache-2.0 declarada en el repositorio, pero la licencia del modelo base subyacente podria imponer condiciones adicionales; conviene verificar la licencia oficial de Gemma antes de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; heredados del modelo base y potencialmente amplificados por la cuantizacion.
- Idiomas y longitud de contexto no disponibles: no se debe asumir soporte multilingue ni ventanas largas sin pruebas.
- No compatible con los motores de inferencia mas extendidos (vLLM, llama.cpp, Ollama), lo que limita su integracion en infraestructura existente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ReadyArt/Gemma-4-31B-IT-EXL2.5
- Documentacion de ExLlamaV2 (motor compatible): https://github.com/turboderp-org/exllamav2
- TabbyAPI (servidor compatible con pesos EXL2): https://github.com/theroyallab/tabbyAPI
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios del autor ni demos.
