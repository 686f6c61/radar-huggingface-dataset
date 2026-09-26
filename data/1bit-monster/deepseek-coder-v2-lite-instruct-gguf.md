# 1bit-MONSTER/DeepSeek-Coder-V2-Lite-Instruct-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato Q4_K_M del modelo DeepSeek-Coder-V2-Lite-Instruct, publicada por el usuario 1bit-MONSTER. No se trata de un modelo entrenado desde cero, sino de una reempaquetado del GGUF Q4_K_M generado originalmente por bartowski, orientado a su ejecucion en el motor de inferencia propio del autor (1bit engine) sobre hardware Strix Halo mediante Vulkan. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 15.700 millones de parametros totales desarrollado por DeepSeek, especializado en generacion de codigo y con capacidad conversacional tras un proceso de instruccion.

La relevancia de esta publicacion es doble. Por un lado, DeepSeek-Coder-V2-Lite-Instruct es un modelo MoE con una cantidad muy reducida de parametros activos por token, lo que permite velocidades de decodificacion altas incluso en hardware de gama consumer. Por otro, el autor aporta mediciones reales de rendimiento (pp512 de 2002 tok/s y tg128 de 99,5 tok/s) sobre una plataforma concreta, algo poco habitual en repositorios de cuantizaciones y util para estimar expectativas de despliegue.

El repositorio tiene un tamano de 10,4 GB y un unico archivo de pesos. Su licencia es la DeepSeek License Agreement, que permite uso comercial con restricciones basadas en el uso (prevencion de usos indebidos), no una licencia permisiva estandar tipo Apache o MIT. El numero de descargas y de "likes" registrado es cero en la fecha de creacion del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts y Multi-head Latent Attention (modelo base) |
| Parametros totales | 15.706.484.224 (aprox. 15,7 B) |
| Parametros activos | no disponible en la informacion proporcionada para este repositorio (el modelo base MoE activa una fraccion reducida del total por token) |
| Longitud de contexto | no disponible en la informacion proporcionada para el repositorio; el modelo base declara 128 000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible en la ficha del repositorio; el modelo base esta orientado a ingles y chino en lenguaje natural, ademas de lenguajes de programacion |
| Licencia | DeepSeek License Agreement (license_name: deepseek-license), con uso comercial permitido y restricciones de uso |
| Formato de pesos | GGUF (archivo `DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Coder-V2-Lite es un transformer con capas de atencion de tipo Multi-head Latent Attention (MLA) y capas feed-forward sustituidas por una mezcla de expertos (MoE). Esta combinacion reduce el coste de cache KV y incrementa la capacidad efectiva del modelo sin que el coste computacional por token crezca en la misma proporcion que los parametros totales. El modelo fue entrenado por DeepSeek sobre un corpus masivo que, segun la documentacion del modelo base, incluye 6 billones de tokens adicionales sobre la base de DeepSeek-V2, con cobertura declarada de cientos de lenguajes de programacion.

La variante Instruct incorpora un ajuste posterior al preentrenamiento para alinearse con instrucciones, lo que la habilita para tareas conversacionales, generacion de codigo guiada por prompt y relleno de codigo en medio de un contexto (fill-in-the-middle). En este repositorio no se documentan detalles del dataset de instruccion, del proceso de RLHF/DPO ni de innovaciones adicionales mas alla de la cuantizacion. El unico dato tecnico aportado por el autor es la cuantizacion Q4_K_M realizada por bartowski y las mediciones de rendimiento del motor 1bit sobre Vulkan en Strix Halo.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del entrenamiento del modelo base sobre un corpus amplio de codigo.
- Razonamiento sobre codigo: explicacion, refactorizacion, deteccion de errores y generacion de pruebas, propio de un modelo Instruct especializado.
- Relleno de codigo en medio (fill-in-the-middle), util para autocompletado en editores.
- Conversacion multi-turno con prompts de instruccion.
- Matemáticas basicas y razonamiento cuantitativo derivado del entrenamiento en codigo y textos tecnicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este repositorio.
- Capacidades multilingues en lenguaje natural: no disponible en la informacion proporcionada para este repositorio; el modelo base esta orientado a ingles y chino.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no soportado, es un modelo exclusivamente de texto y codigo.

## Casos de uso

- Autocompletado de codigo en editores: al ser un modelo Instruct con soporte de relleno en medio en el modelo base y un peso Q4_K_M de unos 10,4 GB, puede ejecutarse localmente para sugerir lineas completas con baja latencia en estaciones de trabajo con GPU consumer.
- Asistente de revision de pull requests: el modelo puede analizar diferencias de codigo, proponer correcciones y explicar el impacto de un cambio en un pipeline de integracion continua, siempre que se integre mediante un servidor GGUF compatible con la API de chat.
- Generacion de pruebas unitarias: dado un fragmento de codigo, el modelo produce casos de prueba en distintos frameworks, lo que encaja en flujos de trabajo que ya invocan un modelo mediante HTTP.
- Traduccion entre lenguajes de programacion: conversiones de Python a Rust, Java a Go y similares, aprovechando la cobertura multilingue de lenguajes del modelo base.
- Documentacion tecnica automatizada: generar docstrings, comentarios y documentacion de API a partir del codigo fuente, tarea de bajo riesgo donde la verificacion humana es sencilla.
- Chat de soporte para desarrolladores: un asistente interno que responde preguntas sobre una base de codigo concreta, executable en hardware local para evitar enviar codigo propietario a servicios en la nube.
- Prototipado en entornos con recursos limitados: gracias a la arquitectura MoE del modelo base, la decodificacion es rapida por token, lo que permite usarlo como motor de generacion en portatiles o mini-PC con GPU integrada.
- Analisis de registros de error: dado un stack trace y el codigo relevante, el modelo puede proponer hipotesis sobre la causa raiz, aunque requiere supervision por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El autor unicamente aporta mediciones de rendimiento de inferencia en una plataforma Strix Halo con backend Vulkan y el motor 1bit:

| Metrica | Valor medido |
|---|---|
| pp512 (prefill, 512 tokens) | 2002 tok/s |
| tg128 (generacion, 128 tokens) | 99,5 tok/s |
| Plataforma | Strix Halo, Vulkan, motor 1bit |

Para las puntuaciones en tareas como HumanEval, MBPP, GSM8K o MMLU, consultar la model card y el articulo del modelo base DeepSeek-Coder-V2; este repositorio no las reproduce ni las verifica.

## Requisitos de hardware

- VRAM estimada para inferencia con el archivo Q4_K_M: aproximadamente 11-13 GB con contexto moderado, partiendo de un archivo de pesos de 10,4 GB mas la cache KV y el overhead del runtime.
- Cuantizaciones mas ligeras (Q3_K_M, Q2_K) permitirian bajar del umbral de los 10 GB, pero no estan publicadas en este repositorio.
- GPU recomendadas para offload completo: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), A100 y H100 para despliegues con contexto largo.
- GPU consumer en las que cabe: RTX 4090, RTX 4080, RTX 4070 Ti Super y, con contexto reducido, tarjetas de 12 GB como la RTX 3060 12 GB o la RTX 4070.
- Ejecucion en memoria unificada: el autor reporta la ejecucion en Strix Halo (APU con memoria compartida), donde el modelo no requiere VRAM dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores GGUF compatibles con la API de OpenAI, y el motor 1bit del propio autor. Para vLLM o TGI sera necesario convertir a safetensors, ya que el formato GGUF no es su via principal.
- Latencia y throughput: en Strix Halo con Vulkan se midieron 2002 tok/s en prefill y 99,5 tok/s en decodificacion; en GPU dedicada las cifras dependen del ancho de banda de memoria y del numero de capas descargadas a GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato en este contexto |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct (este repo, Q4_K_M) | 15,7 B | no disponible en esta ficha | no disponible en esta ficha (128 000 en el modelo base) | DeepSeek License Agreement | GGUF Q4_K_M |
| DeepSeek-Coder-V2-Lite-Instruct (original de DeepSeek) | 15,7 B | no disponible en esta ficha | 128 000 (modelo base) | DeepSeek License Agreement | safetensors |
| Qwen2.5-Coder-7B | 7 B | no aplica (denso) | no disponible en la informacion proporcionada | Apache 2.0 (segun su propia ficha) | safetensors, GGUF |
| StarCoder2-15B | 15 B | no aplica (denso) | no disponible en la informacion proporcionada | BigCode OpenRAIL-M | safetensors, GGUF |

La comparacion de rendimiento entre estos modelos no se incluye porque no hay datos de benchmarks en la informacion proporcionada. La diferencia estructural mas relevante es la condicion MoE del modelo DeepSeek, que reduce el coste de decodificacion frente a alternativas densas del mismo orden de parametros totales.

## Limitaciones y advertencias

- Es una cuantizacion Q4_K_M: la perdida de precision respecto a los pesos originales puede degradar tareas de razonamiento complejo o de generacion de codigo muy largo, aunque suele ser tolerable en tareas de autocompletado y chat.
- El modelo puede alucinar APIs, funciones o firmas de librerias que no existen; verificar siempre el codigo generado antes de ejecutarlo o integrarlo en produccion.
- La ficha del repositorio no documenta los idiomas soportados; el modelo base esta orientado a ingles y chino, por lo que el rendimiento en castellano puede ser inferior.
- La licencia DeepSeek License Agreement no es una licencia permisiva estandar: permite uso comercial, pero incluye restricciones basadas en el uso. Es obligatorio revisar el texto de la licencia antes de desplegar en productos comerciales.
- El repositorio tiene cero descargas y cero "likes" en la fecha de creacion, y esta publicado por un usuario no oficial. No hay garantia de mantenimiento ni de soporte.
- Las mediciones de rendimiento proceden de un unico entorno (Strix Halo con Vulkan y el motor 1bit); extrapolarlas a otras plataformas es arriesgado.
- No hay informacion en el repositorio sobre soporte de tool calling, agentes, ni sobre la composicion del dataset de instruccion, lo que dificulta evaluar su idoneidad para flujos agenticos.
- El contexto efectivo en la practica depende de la implementacion del runtime; aunque el modelo base declare 128 000 tokens, el consumo de memoria de la cache KV a esa longitud puede exceder la VRAM de tarjetas consumer.

## Enlaces

- Repositorio del GGUF: https://huggingface.co/1bit-MONSTER/DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Cuantizacion original de bartowski: https://huggingface.co/bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Motor 1bit del autor: https://github.com/1bit-MONSTER/engine
- Articulo de DeepSeek-Coder-V2 (arXiv:2406.11931): https://arxiv.org/abs/2406.11931
- Repositorio de codigo de DeepSeek-Coder-V2: https://github.com/deepseek-ai/DeepSeek-Coder-V2
- Licencia incluida en el repositorio: archivo `LICENSE` del repositorio del GGUF
