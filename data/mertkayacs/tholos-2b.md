# mertkayacs/Tholos-2B

## Resumen

Tholos-2B es un modelo de lenguaje de 2B parámetros (2.516.756.480 según los pesos en safetensors) publicado por el usuario mertkayacs y desarrollado por Eschatia Labs, un laboratorio de investigación independiente sin ánimo de lucro. Es un fine-tuning de openbmb/MiniCPM5-2B especializado en una única tarea: actuar como agente que elige y parametriza herramientas dentro de la aplicación Tholos, un entorno local de asistentes que comparten tablas, notas y tareas.

El modelo resuelve un problema muy acotado: la selección de herramienta y la generación de sus argumentos en JSON estricto cuando el agente opera sobre espacios de trabajo pequeños, con pasos de un solo turno y salida validable contra un esquema. Cada respuesta es un objeto JSON con los campos `thought`, `tool` y `args`, lo que permite decodificación con esquema JSON en llama.cpp y validación determinista por parte de la aplicación que orquesta el agente.

Su relevancia está en el tamaño y en el enfoque de despliegue local: el archivo Q4_K_M ocupa 1,56 GB y el autor reporta 137/160 escenarios superados en Tholos-Bench sobre una única GPU Kaggle T4, frente a 112/160 del modelo base, y 134/160 en CPU. La licencia es Apache-2.0 y solo se declara inglés como idioma soportado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama según los tags del repositorio), fine-tuning de openbmb/MiniCPM5-2B |
| Parametros totales | 2.516.756.480 (2,5B); la model card lo describe como "2B" |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de referencia de llama.cpp; máximo oficial no declarado en la información disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (1,56 GB) en el repositorio mertkayacs/Tholos-2B-GGUF; safetensors en 16 bits; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16 bits, pesos fusionados) y GGUF |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer decoder-only de la familia Llama, obtenido por fine-tuning supervisado sobre openbmb/MiniCPM5-2B. El repositorio principal contiene los pesos fusionados en safetensors de 16 bits (5,0 GB de tamaño de repo). El modelo expone un modo de razonamiento conmutable mediante `enable_thinking` en la plantilla de chat; en los ejemplos oficiales de llama.cpp y Ollama se desactiva explícitamente. La etiqueta `unsloth` en el repositorio sugiere que el entrenamiento se realizó con ese framework, aunque el detalle del proceso no se especifica en la información disponible.

El entrenamiento se basa en trayectorias ejecutadas, no en diálogos sintéticos genéricos: un modelo profesor actuó como agente dentro del runtime de Tholos sobre un espacio de trabajo inventado (personas, empresas y lugares ficticios) y cada trayectoria se conservó únicamente si el estado final del espacio de trabajo pasaba las comprobaciones del escenario. El conjunto resultante son 3.438 trayectorias de entrenamiento y 349 de validación, publicadas en el dataset `mertkayacs/tholos-trajectories`. El texto es generado por IA salvo las plantillas de escenario. No se documentan fases de RLHF o DPO en la información disponible.

## Capacidades

- Generación de un paso de agente por turno en JSON estricto con los campos `thought`, `tool` y `args`, validable contra un esquema `json_schema`.
- Tool calling y function calling con argumentos tipados y `additionalProperties: false`, lo que permite decodificación restringida por gramática en llama.cpp.
- Uso de herramientas sobre espacios de trabajo estructurados: lectura de notas, operaciones sobre tablas y gestión de tareas.
- Razonamiento multi-paso delegado en el orquestador: el modelo propone una acción por turno y la aplicación ejecuta la herramienta y devuelve el resultado dentro de `<tool_response>`.
- Modo de razonamiento conmutable (`enable_thinking`), desactivado por recomendación del autor para tareas de selección de herramienta.
- Tratamiento de datos no confiables: el prompt de sistema del ejemplo indica explícitamente que el contenido dentro de `<tool_response>` es dato y nunca instrucción.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Visión, audio y matemáticas avanzadas: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local de notas y tareas: el modelo elige entre herramientas como `note_read` o `finish` y devuelve el resultado en JSON, de modo que una aplicación de escritorio puede ejecutar la acción y mantener el estado del espacio de trabajo sin intervención de un LLM mayor. Encaja por su formato de salida determinista y su huella de 1,56 GB en Q4_K_M.
- Automatización programada de mantenimiento de documentos: con el modo de ejecución planificada de Tholos, el modelo puede leer una nota concreta y resumir su primera línea cada mañana; el bucle lo cierra el orquestador, que valida cada llamada antes de ejecutarla.
- Clasificación y enrutado de intenciones hacia herramientas internas: dado un catálogo de funciones descrito en el prompt de sistema, el modelo selecciona la función y rellena los argumentos, lo que sirve como capa de decisión barata delante de APIs corporativas.
- Agente de sobremesa con requisitos de privacidad: al ejecutarse en CPU (134/160 escenarios superados en CPU según el autor) o en una GPU de consumo, permite procesar datos de notas y tablas sin salida a la nube.
- Generación de salida estructurada en pipelines de datos: la decodificación con `json_schema` estricto garantiza objetos parseables, útil para extraer campos de texto libre hacia un esquema fijo antes de insertarlos en una base de datos.
- Evaluación de robustez frente a inyección de prompt: con 10/12 escenarios de inyección superados en T4, sirve como componente sujeto a pruebas en sistemas donde las herramientas devuelven contenido de terceros y se quiere medir la tasa de obediencia indebida.
- Prototipado rápido de agentes con Ollama: el comando documentado (`ollama pull hf.co/mertkayacs/Tholos-2B-GGUF:Q4_K_M`) permite tener un agente funcional en local con reglas de permitir, preguntar y denegar aplicadas por la aplicación.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden a Tholos-Bench, el benchmark propio del autor, medido con la build GGUF Q4_K_M y decodificación con esquema JSON de llama.cpp.

| Benchmark | Tholos-2B | MiniCPM5-2B (base) | Entorno |
|---|---|---|---|
| Tholos-Bench, escenarios superados | 137/160 | 112/160 | Kaggle T4, llama.cpp con JSON schema |
| Tholos-Bench, escenarios superados | 134/160 | 117/160 | CPU, llama.cpp con JSON schema |
| Escenarios de inyección de prompt superados | 10/12 | 8/12 | Kaggle T4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar en la información disponible. El informe técnico asociado está pendiente de revisión por pares según la propia cita del autor.

## Requisitos de hardware

- Inferencia en Q4_K_M: 1,56 GB de pesos; con contexto de 16.384 tokens la huella total estimada se sitúa en torno a 2-3 GB sumando caché KV y buffers, aunque el autor no publica la cifra exacta.
- Inferencia en 16 bits: aproximadamente 5 GB de pesos (tamaño de repo 5,0 GB), lo que implica del orden de 6-8 GB de VRAM contando contexto.
- GPU validadas: una única Kaggle T4 (16 GB) es suficiente para el benchmark completo en Q4_K_M.
- CPU: validado por el autor con 134/160 escenarios superados usando llama.cpp; el comando de referencia usa `-t 4`.
- GPU de consumo: sí cabe con holgura. Cualquier GPU con 6 GB o más puede ejecutar la versión de 16 bits, y con 3-4 GB basta para Q4_K_M.
- Despliegue: llama.cpp / `llama-server` con `--jinja`, Ollama (a través del repo GGUF), Transformers con `accelerate` y `device_map="auto"`, y endpoints compatibles con la API de chat completions (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). Soporte de vLLM: no disponible en la información.
- Latencia y throughput: no disponibles. El autor solo reporta conteos de escenarios superados, no tiempos por token ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tholos-Bench (T4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tholos-2B | 2,5B | 16.384 (config. de referencia) | 137/160 | Apache-2.0 | Hugging Face, GGUF, Ollama, Kaggle |
| MiniCPM5-2B (base) | no disponible en la información (2B por nombre) | no disponible | 112/160 | no disponible en la información | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | no evaluado en Tholos-Bench | Apache-2.0 | Hugging Face, GGUF, Ollama |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 | no evaluado en Tholos-Bench | Llama 3.2 Community License | Hugging Face, GGUF, Ollama |

Los datos de Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct provienen de conocimiento general sobre esos modelos y no han podido verificarse en la información de la búsqueda proporcionada; se incluyen solo como referencia de categoría. No hay comparaciones publicadas de Tholos-2B frente a ellos en tareas de tool calling.

## Limitaciones y advertencias

- Idioma: solo se declara inglés. No hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Escala: con 2,5B parámetros y sin evaluaciones de conocimiento general publicadas, no es adecuado como modelo de razonamiento abierto o de conocimiento factual; está especializado en selección de herramientas.
- Dependencia del orquestador: el modelo no puede leer una nota ni ejecutar una herramienta por sí mismo. La aplicación debe ejecutar la acción y devolver el resultado en `<tool_response>`; sin ese bucle el modelo no completa tareas.
- Generación sin restricciones: en Transformers la generación es libre, así que el JSON debe validarse contra el esquema antes de ejecutar cualquier llamada, tal como advierte el autor.
- Inyección de prompt: supera 10/12 escenarios, lo que implica 2 fallos documentados. En produccion conviene mantener activadas las reglas de permitir, preguntar y denegar acciones consecuentes.
- Datos de entrenamiento sintéticos: las trayectorias fueron generadas por un modelo profesor sobre escenarios con personas y empresas inventadas. Puede arrastrar sesgos y artefactos del profesor, y no se documentan evaluaciones de sesgo.
- Benchmarks autoinformados: Tholos-Bench es un benchmark propio del autor, el informe técnico está pendiente de revisión por pares y las cifras no han sido replicadas de forma independiente.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de openbmb/MiniCPM5-2B y la información disponible no detalla la licencia del modelo base; conviene verificarla antes de un despliegue comercial.
- Madurez del proyecto: 1.478 descargas y 2 likes en Hugging Face, 1 estrella en GitHub en el momento de los datos recogidos; soporte y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mertkayacs/Tholos-2B
- Builds GGUF: https://huggingface.co/mertkayacs/Tholos-2B-GGUF
- Dataset de trayectorias de entrenamiento: https://huggingface.co/datasets/mertkayacs/tholos-trajectories
- Benchmark Tholos-Bench (dataset): https://huggingface.co/datasets/mertkayacs/tholos-bench
- Página del benchmark: https://eschatialabs.com/benchmarks/tholos-bench/
- Informe técnico: https://eschatialabs.com/research/tholos-2b-report/
- Sitio del proyecto: https://tholos.mertkayacs.com
- Repositorio GitHub: https://github.com/mertkayacs/tholos
- Colección en Hugging Face: https://huggingface.co/collections/mertkayacs/tholos-local-ai-agents
- Modelo en Kaggle: https://www.kaggle.com/models/mertilovski/tholos-2b
- Página en Ollama: https://ollama.com/mertkayacs/tholos-2b
