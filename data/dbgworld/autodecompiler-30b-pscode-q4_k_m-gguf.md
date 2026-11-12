# dbgworld/AutoDecompiler-30B-pscode-Q4_K_M-GGUF

## Resumen

AutoDecompiler-30B-pscode es un modelo de lenguaje de aproximadamente 30.532 millones de parámetros (30,5 B) publicado por la organización AutoDecompiler, del que esta ficha documenta la cuantización Q4_K_M en formato GGUF generada por el usuario dbgworld mediante el espacio GGUF-my-repo de ggml.ai. El nombre del modelo sugiere una especialización en tareas de descompilación y análisis de código pseudoensamblador ("pscode"), aunque la model card disponible no confirma explícitamente el dominio de entrenamiento ni la composición del dataset.

La relevancia de esta publicación es fundamentalmente práctica: se trata de una conversión a GGUF de un modelo de 30 B de parámetros, lo que permite ejecutarlo en llama.cpp con cuantización de 4 bits y un peso de repositorio de 18,6 GB. Esto lo hace desplegable en estaciones de trabajo con GPU de consumo alta (24 GB de VRAM) o incluso en CPU con suficiente RAM, algo imposible con los pesos originales en precisión completa.

No obstante, la información pública es muy limitada: no se declara licencia, idiomas, pipeline ni datos de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 30,5 B de parametros; presumiblemente transformer, sin confirmar) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`, pero no se declara el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `autodecompiler-30b-pscode-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base AutoDecompiler/AutoDecompiler-30B-pscode: la model card de esta conversión GGUF remite a la model card original sin reproducir sus detalles. El recuento de parámetros (30.532.122.624) es compatible con un transformer decoder-only de escala 30 B, pero no se confirma ni la familia arquitectónica, ni si emplea atención lineal, mezcla de expertos u otras variantes.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas de decodificación. El único dato de proceso verificable es el de esta publicación: la conversión de los pesos originales a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, con cuantización Q4_K_M. El sufijo "pscode" del nombre apunta a un ajuste orientado a código pseudoensamblador o descompilación, pero se trata de una inferencia a partir del nombre, no de un dato confirmado.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, ejecutable con llama.cpp (CLI y servidor).
- Especialización presumible en descompilación y análisis de código de bajo nivel, según el nombre del modelo (no confirmado en la documentación).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de infraestructura de inferencia compatible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Análisis de binarios y descompilación asistida: dado el nombre del modelo, se usaría para generar pseudocódigo o explicaciones a partir de fragmentos de ensamblador; adecuado por su tamaño de 30 B, que permite razonamiento sobre contextos de código extensos, aunque el contexto máximo real no está declarado.
- Despliegue local en estación de trabajo: con 18,6 GB de pesos Q4_K_M, puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) o en CPU con 32 GB de RAM, lo que permite trabajar con datos de código propietario sin salir del entorno local.
- Integración en pipelines de CI/CD para revisión de código de bajo nivel: mediante `llama-server` se expone una API HTTP que puede invocarse desde scripts de build para detectar patrones sospechosos en artefactos compilados.
- Prototipado de herramientas de ingeniería inversa: el formato GGUF y llama.cpp permiten iterar rápidamente sobre prompts y temperaturas sin necesidad de infraestructura de GPU de datacenter.
- Educación y formación en seguridad: uso como asistente local para explicar instrucciones de ensamblador en entornos de laboratorio sin conexión.
- Evaluación comparativa de cuantizaciones: al ser una conversión Q4_K_M de un modelo de 30 B, sirve como referencia para medir la degradación de calidad frente a los pesos originales en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,6 GB solo para los pesos en Q4_K_M; con caché KV y overhead del runtime, se recomienda un mínimo de 20-22 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3090, RTX 4090, RTX A6000 (48 GB) o superiores; A100/H100 para despliegues con concurrencia.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 24 GB de VRAM (RTX 3090/4090) con contexto limitado; en GPUs de 16 GB no cabe en Q4_K_M sin offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., aunque no se confirman en la model card). vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependerán del hardware y del contexto configurado (los ejemplos de la model card usan `-c 2048`).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (especializados en descompilación o código de bajo nivel) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor o consultar la model card del modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Contexto máximo no declarado: los ejemplos usan 2048 tokens, pero no se confirma si el modelo soporta ventanas mayores.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de descompilación, una salida incorrecta puede inducir a errores graves en análisis de seguridad.
- Cuantización Q4_K_M: introduce pérdida de precisión respecto a los pesos originales; en tareas de código de bajo nivel, donde los detalles exactos importan, conviene validar contra el modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad de la conversión.
- Modelo base de procedencia incierta: no se documentan los datos de entrenamiento, lo que impide evaluar sesgos, contaminación de benchmarks o cumplimiento normativo.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/dbgworld/AutoDecompiler-30B-pscode-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/AutoDecompiler/AutoDecompiler-30B-pscode
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
