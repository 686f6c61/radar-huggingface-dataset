# mradermacher/Aletheia-1.0-GGUF

## Resumen

Aletheia-1.0-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Aletheia-1.0, publicado originalmente por el usuario Openwist en Hugging Face. El repositorio lo mantiene mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 1.170.340.608 parametros segun los pesos en safetensors, lo que lo situa en la franja de aproximadamente 1,2 mil millones de parametros, un tamano orientado a inferencia en hardware de consumo.

La relevancia de esta ficha radica en que permite ejecutar Aletheia-1.0 en entornos con recursos limitados mediante cuantizaciones que van desde Q2_K hasta F16, cubriendo un rango amplio de compromisos entre calidad y consumo de memoria. El repositorio ocupa 10,6 GB en total, lo que refleja la suma de todas las variantes de cuantizacion incluidas. No se dispone de informacion publica sobre la arquitectura exacta, los datos de entrenamiento, la licencia ni los idiomas soportados por el modelo base.

La model card del repositorio se limita a metadatos de la herramienta de cuantizacion (quantize_version 2, convert_type hf, lista de quants generados) y a la referencia al modelo original. No incluye descripcion funcional, benchmarks ni indicaciones de uso, por lo que gran parte de los apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base Aletheia-1.0 en los datos disponibles. El recuento de parametros (1.170.340.608) es compatible con un transformer decoder-only de aproximadamente 1,2 mil millones de parametros, pero no se confirma ni el tipo de atencion, ni la funcion de activacion, ni si emplea tecnicas como grouped-query attention o attention lineal. Tampoco consta si es un modelo denso o una variante MoE; el numero de parametros activos no se indica y, por coherencia con el tamano, se asume denso sin confirmacion.

Respecto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del corpus, el uso de RLHF, DPO o cualquier otra fase de alineamiento. La unica informacion tecnica verificable proviene de los metadatos de cuantizacion: el proceso se realizo con quantize_version 2, convert_type hf (conversion desde pesos Hugging Face) y output_tensor_quantised 1, lo que indica una cuantizacion por tensor de salida. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Razonamiento y generacion general: no hay documentacion que confirme capacidades especificas de razonamiento, matematicas o codigo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se mencionan modalidades adicionales.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse mediante la infraestructura de inference endpoints de Hugging Face con el formato GGUF.

## Casos de uso

- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM o en CPU mediante llama.cpp, lo que permite prototipar asistentes conversacionales en equipos de sobremesa sin aceleradores dedicados.
- Experimentacion con llama.cpp y Ollama: al estar en formato GGUF, se integra directamente en flujos de trabajo locales para pruebas de generacion de texto y comparacion de cuantizaciones.
- Evaluacion de calidad frente a tamano: la disponibilidad de variantes desde Q2_K hasta F16 permite medir la degradacion de calidad segun la cuantizacion en tareas de generacion libre, un caso util para investigadores que calibran pipelines de compresion.
- Servicio de chat ligero en entornos con recursos acotados: si el modelo base esta ajustado para conversacion, puede emplearse como backend de un chatbot de bajo coste en CPU, siempre que se valide previamente su calidad.
- Pruebas de integracion con endpoints compatibles: la etiqueta `endpoints_compatible` facilita desplegar el modelo en infraestructura gestionada de Hugging Face para validar latencia y throughput antes de comprometer recursos propios.
- Base para fine-tuning o destilacion: al ser un modelo de ~1,2 B de parametros, puede servir como punto de partida para ajustes especificos de dominio en entornos con presupuesto limitado, aunque la ausencia de licencia clara obliga a verificar los terminos antes de usarlo comercialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-0,9 GB en Q2_K, 1,0-1,2 GB en Q4_K_M, 1,3-1,5 GB en Q8_0 y 2,3-2,5 GB en F16, calculados a partir del recuento de parametros y el numero de bits por peso (sin contar overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes para el modelo completo en F16.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs dedicadas modernas, incluso en F16; en iGPU y CPU tambien es viable con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (llama-cpp-python, text-generation-webui) y endpoints de Hugging Face con soporte GGUF. No se confirma soporte de vLLM o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-1.0-GGUF | 1,17 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente replicado |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se ofrece como referencia de categoria (modelos densos de 1-2 B de parametros); no se dispone de datos de rendimiento de Aletheia-1.0 que permitan una comparacion cuantitativa. TinyLlama, Qwen2.5-1.5B y SmolLM2-1.7B cuentan con licencias permisivas y documentacion publica extensa, mientras que Aletheia-1.0 carece de informacion sobre licencia y contexto.

## Limitaciones y advertencias

- Ausencia de model card funcional: no se documentan arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad para produccion sin pruebas empiricas previas.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor original (Openwist) o revisar el repositorio base antes de desplegarlo en entornos productivos.
- Riesgo de alucinacion: inherente a los modelos de ~1,2 B de parametros, especialmente en tareas de conocimiento factual y razonamiento complejo; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible identificar sesgos de genero, idioma, cultura o dominio.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados; el uso en castellano no esta verificado.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la coherencia en un modelo de este tamano; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes de la comunidad sobre su comportamiento.
- Fecha de creacion futura en los metadatos (2026-11-23): conviene verificar la integridad del repositorio y la autenticidad de los pesos antes de confiar en el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aletheia-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Aletheia-1.0
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
