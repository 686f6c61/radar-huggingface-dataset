# Kuzey12345/blackhole-lite-gguf

## Resumen

Blackhole Lite es un modelo de conversacion en turco derivado de Qwen/Qwen3-1.7B mediante un ajuste fino con LoRA sobre la personalidad "Blackhole". Lo publica el usuario Kuzey12345 en Hugging Face bajo licencia Apache 2.0, en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp. El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con aproximadamente 1.720 millones de parametros totales y una ventana de contexto que no se explicita en la informacion disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens nativos, ampliables, pero este dato no se confirma en la ficha del autor).

El modelo resuelve un nicho muy concreto: proporcionar un asistente conversacional en turco con un tono de personalidad definido, empaquetado en un unico fichero GGUF de aproximadamente 1,1 GB que puede ejecutarse en hardware de consumo. No se trata de un modelo de proposito general ni de un lanzamiento con benchmarks publicados; es un artefacto derivado de un modelo pequeno de la familia Qwen3, orientado a inferencia local ligera.

Su relevancia es limitada pero clara para quien busque un chatbot turco de bajo coste computacional. Al estar basado en Qwen3-1.7B, hereda las capacidades del modelo original en razonamiento basico, generacion de texto y soporte multilingue, aunque el ajuste LoRA se ha realizado exclusivamente sobre datos en turco y la model card solo declara el idioma `tr`. No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el proceso de alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-1.7B declara 32.768 tokens nativos) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Turco (`tr`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repo | 1,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Metodo de ajuste | LoRA |
| Runtime declarado | llama.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso con atencion por cabezas agrupadas (GQA) y las innovaciones propias de la familia Qwen3, como el modo de razonamiento explicito ("thinking") que el modelo base activa por defecto. Sobre esa base, el autor ha aplicado un ajuste fino con LoRA para inculcar una personalidad conversacional denominada "Blackhole" y adaptar el comportamiento al turco. No se especifica el rango del adaptador, el numero de pasos, la tasa de aprendizaje ni el numero de tokens de entrenamiento empleados.

No hay informacion publica sobre la composicion del dataset de ajuste, si se uso RLHF, DPO o preferencias humanas, ni sobre procesos de destilacion o decodificacion especulativa. Tampoco se documenta si el adaptador LoRA se fusiono con los pesos base antes de la cuantizacion a Q4_K_M, aunque el hecho de que el repositorio contenga unicamente ficheros GGUF sugiere que la fusion se realizo y que el artefacto distribuido es el resultado final cuantizado. Cualquier detalle adicional sobre el pipeline de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en turco con una personalidad definida ("Blackhole"), orientada a dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas generales, heredados del modelo base Qwen3-1.7B.
- Generacion de codigo y matematicas elementales a nivel de un modelo de 1.700 millones de parametros; no se documenta su calidad especifica tras el ajuste LoRA.
- Soporte multilingue limitado por el ajuste: la model card solo declara turco, aunque el modelo base es multilingue y podria conservar cierta competencia en otros idiomas.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes, multi-step reasoning explicito ni modo "thinking" tras el ajuste.
- No se documenta vision, audio ni otras modalidades.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Chatbot turco local en dispositivos de consumo: el fichero GGUF Q4_K_M de 1,1 GB cabe en GPUs con 4-6 GB de VRAM o incluso en CPU, lo que permite desplegar un asistente conversacional en turco sin conexion a servicios en la nube.
- Prototipado rapido de asistentes con personalidad: util para experimentar con prompts de sistema y evaluar como un LoRA sobre un modelo pequeno modifica el tono y el estilo de las respuestas en turco.
- Educacion y practica de idiomas: el modelo puede mantener conversaciones en turco con un registro consistente, adecuado para ejercicios de comprension o simulacion de dialogos.
- Integracion en aplicaciones de escritorio o moviles: gracias a llama.cpp y al formato GGUF, puede embeberse en aplicaciones nativas que requieran inferencia offline en turco.
- Generacion de respuestas en entornos con requisitos de privacidad: al ejecutarse localmente, los datos del usuario no salen del dispositivo, lo que resulta util para prototipos de atencion al cliente en turco con datos sensibles.
- Base para experimentos de ajuste adicional: al ser Apache 2.0 y derivar de Qwen3-1.7B, sirve como punto de partida para otros LoRA o para comparar el efecto de la personalidad "Blackhole" frente al modelo base.
- Evaluacion de tecnicas de cuantizacion: util para medir la degradacion de calidad de Qwen3-1.7B al pasar a Q4_K_M en tareas conversacionales en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con la cuantizacion Q4_K_M, incluyendo overhead de contexto y cache KV para ventanas moderadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPUs de 8 GB o mas (RTX 3060 Ti, RTX 4070, RTX 4090) el modelo ocupa una fraccion minima y deja margen para contextos largos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama media o superior, y tambien en CPU con llama.cpp (rendimiento dependiente del numero de nucleos).
- Opciones de despliegue: llama.cpp (runtime declarado por el autor), Ollama (importando el GGUF), y servidores compatibles con la API de OpenAI mediante el servidor de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que su uso requeriria conversion a safetensors o el uso de variantes especificas.
- Latencia y throughput: no disponibles en la informacion proporcionada. En terminos orientativos, un modelo de 1.700 millones de parametros en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo, pero no hay mediciones publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Blackhole Lite (este modelo) | 1.720 M | no disponible | tr | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA de personalidad sobre Qwen3-1.7B |
| Qwen/Qwen3-1.7B | 1.720 M | 32.768 tokens nativos | multilingue | Apache 2.0 | safetensors, GGUF | Modelo base sin ajuste de personalidad |
| Qwen/Qwen3-0.6B | ~600 M | 32.768 tokens nativos | multilingue | Apache 2.0 | safetensors, GGUF | Alternativa mas ligera de la misma familia |
| Llama 3.2 1B Instruct | ~1.200 M | 128.000 tokens | multilingue (8 idiomas oficiales, turco no incluido) | Llama 3.2 Community License | safetensors, GGUF | No especializado en turco |

La comparativa se limita a modelos de la misma familia y tamano porque no hay benchmarks publicados de Blackhole Lite que permitan una comparacion cuantitativa con alternativas. La principal diferencia frente a Qwen3-1.7B es el ajuste de personalidad y el idioma declarado; frente a Llama 3.2 1B, la ventaja es el soporte declarado de turco y la licencia Apache 2.0, mas permisiva.

## Limitaciones y advertencias

- El ajuste LoRA se ha realizado exclusivamente sobre turco segun la model card; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- No hay informacion sobre sesgos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de genero, etnicos, politicos o religiosos introducidos por el LoRA.
- Riesgo de alucinacion: como todo modelo de 1.700 millones de parametros, tiende a inventar datos facticos, especialmente en preguntas especializadas o con contexto largo.
- La cuantizacion Q4_K_M introduce perdida de precision adicional respecto a los pesos originales; no se ha publicado una evaluacion de la degradacion.
- La longitud de contexto efectiva no esta documentada para este artefacto; asumir la del modelo base puede no ser correcto tras el ajuste y la cuantizacion.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling sin validacion previa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado en el mismo dia, lo que sugiere que no ha pasado por una validacion comunitaria.
- No se ha verificado la calidad del ajuste ni la fidelidad de la personalidad "Blackhole" mas alla de la descripcion del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Kuzey12345/blackhole-lite-gguf
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
