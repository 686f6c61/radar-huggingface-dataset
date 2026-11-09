# mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, publicado por el usuario mradermacher en Hugging Face. El modelo base lo desarrolla el usuario kataguru y esta orientado a conversacion, con un enfasis declarado en el idioma finlandes y, segun su nombre, en un estilo "esceptico". El repositorio no incluye model card descriptiva mas alla de los metadatos de la conversion.

El modelo cuenta con 35.505.251.456 parametros totales segun los pesos en safetensors del modelo original, y el sufijo A3B sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parametros activos por token, aunque esta interpretacion no viene confirmada por documentacion oficial en la informacion disponible. El repositorio GGUF ocupa 35,1 GB e incluye una bateria amplia de cuantizaciones, desde Q2_K hasta Q8_0 y f16.

Su relevancia practica es limitada y muy especifica: ofrece una via para ejecutar un modelo de ~35B en hardware de consumo mediante cuantizacion, con soporte declarado para endpoints compatibles y uso conversacional. No obstante, la ausencia de licencia, idiomas declarados, benchmarks y documentacion tecnica obliga a tratar cualquier dato de rendimiento o comportamiento como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con ~3B activos, sin confirmar) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (sugerido ~3B por el sufijo A3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible (el nombre indica finlandes) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); origen en safetensors |
| Tamano del repositorio | 35,1 GB |
| Fecha de creacion | 2026-11-09 |
| Fecha de actualizacion | 2026-11-09 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador "35B-A3B" sigue la convencion habitual para modelos de mezcla de expertos en los que se indica el total de parametros y los activos por token, lo que situaria al modelo en torno a 35.500 millones de parametros totales y unos 3.000 millones activos, coherente con el recuento de safetensors. Esta lectura es una inferencia a partir del nombre y no una confirmacion tecnica.

Tampoco hay datos sobre el volumen o la composicion del corpus de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. La unica informacion tecnica verificable es el proceso de cuantizacion: el autor de la conversion indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que senala una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion de tensores de salida.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Uso en finlandes: el nombre del modelo declara especializacion en este idioma, aunque no se especifica cobertura multilingue adicional.
- Estilo "esceptico": el nombre sugiere un ajuste de comportamiento orientado a respuestas criticas o prudentes, sin documentacion que lo respalde.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en finlandes: el modelo puede desplegarse con llama.cpp u Ollama para validar flujos de dialogo en ese idioma antes de invertir en modelos mayores, usando las cuantizaciones Q4_K_M o Q5_K_M como compromiso entre calidad y memoria.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 sobre un mismo conjunto de prompts y elegir el punto optimo para produccion.
- Despliegue en estaciones de trabajo con GPU de consumo: con cuantizaciones Q3 o Q4 el modelo puede ejecutarse en GPUs de 24 GB o en configuraciones CPU+GPU, habilitando pruebas locales sin infraestructura de centro de datos.
- Generacion de respuestas con tono critico o prudente: si el ajuste "Sceptic" funciona segun lo sugerido por el nombre, podria emplearse en tareas de revision de afirmaciones o analisis de riesgo, siempre con validacion humana.
- Servicio de inferencia compatible con la API de Hugging Face: el tag `endpoints_compatible` permite integrarlo en pipelines existentes que consumen endpoints de texto generativo.
- Investigacion sobre cuantizacion de modelos MoE: al tratarse de una conversion de un modelo con posible mezcla de expertos, sirve para estudiar como afecta la cuantizacion a la seleccion de expertos y a la coherencia de salida.
- Base para fine-tuning posterior: las variantes f16 y Q8_0 pueden servir como referencia de calidad para comparar adaptaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB en Q8_0, 13-15 GB en Q5_K_M, 11-13 GB en Q4_K_M, 9-11 GB en Q3_K_M y 7-9 GB en Q2_K, calculados a partir del recuento de parametros y del numero de bits por peso; no son mediciones oficiales.
- GPU recomendadas: A100 40 GB o H100 para f16 y Q8_0 con contexto largo; RTX 4090 (24 GB) o RTX 3090 para Q5_K_M y Q4_K_M; GPUs de 16 GB como RTX 4080 para Q3_K_M.
- Cabe en GPU de consumo: si, en modelos con 12-24 GB de VRAM segun la cuantizacion; en 8 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de Hugging Face; vLLM y TGI requeririan conversion a safetensors o soporte especifico de GGUF, no confirmado.
- Latencia y throughput: no disponible; al ser presumiblemente MoE con ~3B activos, la velocidad por token deberia ser superior a la de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF | 35,5B totales (activos no confirmados) | no disponible | no disponible | GGUF | Cuantizaciones estaticas, enfoque en finlandes |
| Modelos MoE de ~30-35B con ~3B activos (familia generica) | ~30-35B totales | variable | variable | safetensors, GGUF | No se dispone de un comparable concreto verificado en la informacion |
| Modelos densos de ~7-8B | ~7-8B | 8K-128K | variable | safetensors, GGUF | Menor huella de memoria, menor capacidad potencial |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas; la comparacion anterior es estructural y no incorpora mediciones de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Idiomas no declarados formalmente: aunque el nombre indica finlandes, no hay confirmacion de cobertura ni de calidad en otros idiomas.
- Ausencia total de benchmarks: cualquier afirmacion sobre calidad, razonamiento o codigo carece de respaldo medible.
- Riesgo de alucinacion: sin datos de entrenamiento ni evaluaciones, debe asumirse un riesgo estandar o superior en tareas factuales.
- Sesgos desconocidos: no hay informacion sobre composicion del corpus ni sobre procesos de alineacion.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la coherencia, especialmente en modelos MoE donde la seleccion de expertos es sensible al ruido de cuantizacion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Modelo base poco documentado: la model card del repositorio original no se incluye en la informacion disponible, lo que impide verificar contexto, arquitectura exacta y condiciones de uso.
- Fechas futuras en los metadatos: la creacion figura en 2026-11-09, lo que conviene contrastar antes de citar el modelo en documentacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Perfil del autor de la conversion: https://huggingface.co/mradermacher
- Paper, blog o demo adicionales: no disponible
