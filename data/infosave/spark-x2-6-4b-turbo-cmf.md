# infosave/Spark-X2.6-4B-turbo-cmf

## Resumen

Spark-X2.6-4B-turbo-cmf es una cuantización de 4 bits del modelo Spark-X2.6-4B (desarrollado por XHToken), publicada por el usuario infosave bajo el formato propietario CMF y destinada al motor de inferencia cortiq, escrito en Rust sin dependencias de Python ni de frameworks de ML. El archivo empaqueta los pesos en cuantización q4tp (4 bits con cabecera de metadatos) y añade una gestión de atención de ventana deslizante que mantiene acotado el consumo de memoria de dispositivo en prompts largos.

La propuesta central es un techo fijo de memoria y de coste por token: 27 de las 36 capas del modelo usan atención de ventana deslizante de 512 filas que nunca crece, y las 9 capas de atención completa leen exactamente las primeras 8192 filas del prompt en el dispositivo; las claves y valores de filas posteriores se descargan a RAM. Un mecanismo de "campo lejano" (far field) resume el resto del contexto en 32 puntos de referencia por cabeza, conservando además 248 filas exactas seleccionadas por su relevancia para tareas como recuperar contraseñas o códigos literales.

El resultado declarado es que, en una RTX 2000 Ada con un prompt de 64 000 tokens, el archivo decodifica a 56,2 tok/s frente a 18,5 tok/s del archivo estándar, ocupando 4,2 GB de la tarjeta en lugar de 7,9 GB. En un MacBook Air M4 con prompt de 14 000 tokens alcanza 33,0 tok/s frente a 31,0 y 30,9 de las alternativas, en 2,9 GB frente a 5,1 GB de mlx-lm. El modelo base es un transformer de 4B parámetros con contexto declarado de hasta 131 072 tokens vía `CMF_MAX_SEQ`, licencia Apache 2.0 y soporte multilingüe (inglés, chino, ruso).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida: 27 capas de ventana deslizante (512 filas) y 9 capas de atención completa |
| Parametros totales | 4B (modelo base Spark-X2.6-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131 072 tokens con `CMF_MAX_SEQ=131072`; cap por defecto de 32 768 tokens |
| Tipos de cuantizacion | q4tp (4 bits), formato CMF |
| Idiomas soportados | multilingüe; inglés (en), chino (zh), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (archivo único para el motor cortiq) |
| Tamano del repositorio | 6,3 GB |
| Pesos efectivos | 2,16 GB (idénticos al archivo estándar del mismo modelo) |
| Motor de inferencia | cortiq 0.8.64 o superior (Rust) |
| Aceleración | Metal, Vulkan, DX12, CPU; Neural Engine en Mac con `CMF_ANE=1` |

## Arquitectura y entrenamiento

El archivo es una cuantización del modelo base XHToken/Spark-X2.6-4B, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer de 36 capas y 4B parámetros. La innovación del archivo no reside en los pesos sino en la cabecera CMF, que implementa una política de atención por capas: 27 capas operan con ventana deslizante de 512 filas que no crece con el prompt, mientras que las 9 capas de atención completa leen de forma exacta las primeras 8192 filas del contexto en el dispositivo y descargan las claves y valores de filas posteriores a RAM a medida que se leen.

Antes de las últimas 512 filas, el "campo lejano" se construye capa a capa a partir de esas filas descargadas, y después se descartan. Dicho campo lejano conserva las primeras 4 filas y las últimas 1800 de forma exacta, y el resto se comprime en 32 puntos de referencia (landmarks) por cabeza, de modo que la memoria de dispositivo y el coste por token dejan de crecer con la longitud del texto. Para evitar la pérdida de información literal, cada fila se puntúa según lo que las capas hacen con ella y las 248 mejores se mantienen exactas, de forma que una pregunta al final del prompt puede leerlas antes de responder. El autor cita la solicitud de patente n.º 19/738,763. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general sobre el modelo base de 4B.
- Tool calling y function calling (etiqueta `tool-calling` declarada por el autor).
- Contexto largo efectivo: lectura de prompts de hasta 64 000 tokens con coste de decodificación estable (33 tok/s en MacBook Air M4) y contexto máximo configurable de 131 072 tokens.
- Recuperación exacta de cadenas literales en contexto largo: contraseñas y códigos se mantienen exactos gracias a las 248 filas preservadas sin comprimir.
- Capacidades multilingües en inglés, chino y ruso, además de la etiqueta genérica `multilingual`.
- Modo de pensamiento (thinking) desactivable mediante el flag `--no-think` en la CLI de cortiq.
- Servidor compatible con la API de OpenAI (`cortiq serve`) con impresión de velocidad de prompt y decodificación por petición.
- Ejecución en Metal, Vulkan, DX12 y CPU; aceleración opcional del prefill en el Neural Engine de Apple con `CMF_ANE=1`.

## Casos de uso

- Análisis de documentos largos en hardware de gama media: con un prompt de 64 000 tokens el archivo decodifica a 33,5 tok/s en un MacBook Air M4 y a 56,2 tok/s en una RTX 2000 Ada, lo que permite resumir o extraer información de informes extensos sin degradación del throughput a medida que crece la entrada.
- Asistentes con memoria de conversación prolongada: el techo fijo de memoria de dispositivo evita que el consumo de VRAM crezca con el historial, lo que hace viable mantener sesiones multi-turno largas en tarjetas de 4-8 GB.
- Extracción fiable de credenciales y códigos en pipelines: las 248 filas exactas permiten responder preguntas sobre contraseñas, identificadores o fragmentos de código presentes en el prompt sin que la compresión los destruya.
- Despliegue de un endpoint compatible con OpenAI en infraestructura propia: `cortiq serve` expone la API con métricas de latencia por petición, integrable en aplicaciones existentes que ya consumen la interfaz de OpenAI.
- Agentes con tool calling en entornos con poca VRAM: la combinación de cuantización de 4 bits (2,16 GB de pesos) y gestión de contexto acotada permite ejecutar bucles de agente multi-paso en GPUs de consumo.
- Inferencia en portátiles Apple sin ventilador: en un MacBook Air M4 (24 GB, fanless) el modelo procesa prompts de 14 000 tokens en 56,4 s y decodifica a 33,0 tok/s, con la opción de reducir el prefill a 33,6 s usando el Neural Engine.
- Procesamiento multilingüe en inglés, chino y ruso: atención al cliente o clasificación de textos en esos idiomas con un único modelo de 4B.

## Benchmarks y rendimiento

Datos declarados por el autor en MacBook Air M4 (GPU de 10 núcleos, 24 GB, sin ventilador), 96 tokens greedy tras cada prompt:

| Prompt (tokens) | Primer token, turbo (s) | Primer token, cortiq estándar (s) | Primer token, mlx-lm (s) | Primer token, llama.cpp (s) | Decode turbo (tok/s) | Decode cortiq estándar (tok/s) | Decode mlx-lm (tok/s) | Decode llama.cpp (tok/s) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 000 | 6,5 | 6,6 | 6,6 | 6,2 | 36,3 | 36,4 | 36,4 | 28,8 |
| 14 000 | 56,4 | 54,8 | 53,1 | 52,5 | 33,0 | 31,0 | 30,9 | 22,3 |
| 32 000 | 131,2 | 157,9 | 144,2 | 170,1 | 33,1 | 24,2 | 20,8 | 15,0 |
| 64 000 | 262,1 | 426,5 | 351,5 | 494,2 | 33,5 | 24,5 | 12,6 | 8,8 |

Con Neural Engine (`CMF_ANE=1`) el primer token de un prompt de 14 000 tokens baja de 54,8 s a 33,6 s, sin cambios en la decodificación.

Memoria tras el prompt (footprint / residente, GB):

| Prompt | turbo | cortiq estándar | mlx-lm 4-bit | llama.cpp Q4_K_M |
|---|---:|---:|---:|---:|
| 2 000 tokens | 1,20 / 3,05 | 1,20 / 3,06 | 3,74 / 2,40 | 0,33 / 3,61 |
| 14 000 tokens | 2,85 / 4,70 | 2,60 / 4,37 | 5,09 / 2,43 | 0,83 / 4,11 |

En RTX 2000 Ada con 64 000 tokens: 56,2 tok/s frente a 18,5 tok/s del archivo estándar, y 4,2 GB de VRAM frente a 7,9 GB.

Perplejidad: el autor reporta una medición sobre WikiText-2 test con el protocolo de `llama-perplexity -c 512` (64 fragmentos de 512 tokens, puntuando la segunda mitad de cada uno, 16 320 predicciones), pero el valor numérico no aparece en la información disponible.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos: 2,16 GB en cuantización q4tp; el repositorio completo ocupa 6,3 GB.
- VRAM en RTX 2000 Ada con prompt de 64 000 tokens: 4,2 GB (frente a 7,9 GB del archivo estándar).
- Memoria en MacBook Air M4: footprint de 1,20 GB tras 2 000 tokens y 2,85 GB tras 14 000 tokens; residente de 3,05 GB y 4,70 GB respectivamente.
- Cabe en GPUs de consumo: el consumo de 4,2 GB a 64 000 tokens entra en tarjetas de 8 GB; con prompts cortos el footprint de 1,20 GB es compatible con GPUs de 4 GB o menos.
- GPUs recomendadas: RTX 2000 Ada (medición reportada), cualquier GPU con soporte Metal, Vulkan o DX12; Apple Silicon (M4 probado) con opción de Neural Engine.
- Despliegue: exclusivamente mediante el motor cortiq (`cargo install cortiq-cli`, versión 0.8.64 o superior; binarios precompilados en la página de releases). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es propietario de cortiq.
- Throughput medido: 33,0-36,3 tok/s en MacBook Air M4 según longitud del prompt; 56,2 tok/s en RTX 2000 Ada a 64 000 tokens.
- Latencia de prefill: 262,1 s para 64 000 tokens en M4; 33,6 s para 14 000 tokens con Neural Engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decode a 64k (MacBook Air M4) | Memoria tras 14k | Licencia | Motor |
|---|---|---:|---:|---:|---|---|
| Spark-X2.6-4B-turbo-cmf | 4B | 131 072 (configurable) | 33,5 tok/s | 2,85 GB | Apache 2.0 | cortiq |
| Spark-X2.6-4B-cmf (estándar) | 4B | 131 072 (configurable) | 24,5 tok/s | 2,60 GB | Apache 2.0 | cortiq |
| Spark-X2.6-4B en mlx-lm 4-bit | 4B | no disponible | 12,6 tok/s | 5,09 GB | Apache 2.0 (modelo base) | mlx-lm 0.32.2 |
| Spark-X2.6-4B en llama.cpp Q4_K_M | 4B | no disponible | 8,8 tok/s | 0,83 GB | Apache 2.0 (modelo base) | llama.cpp b12202 |

La comparación se limita a distintas ejecuciones del mismo modelo base, ya que la información disponible no incluye otros modelos de 4B comparables. La ventaja del archivo turbo se concentra en prompts largos: a 2 000 tokens los cuatro motores rinden de forma similar en decodificación (28,8-36,4 tok/s), mientras que a 64 000 tokens la diferencia es de 33,5 tok/s frente a 24,5, 12,6 y 8,8.

## Limitaciones y advertencias

- Dependencia exclusiva del motor cortiq: el formato CMF no es compatible con llama.cpp, vLLM, Ollama, TGI ni mlx-lm, lo que limita la portabilidad y obliga a usar la CLI o el servidor de cortiq.
- El cap de contexto por defecto es de 32 768 tokens; para aprovechar los 131 072 hay que definir `CMF_MAX_SEQ`, con el consiguiente aumento de memoria.
- El "campo lejano" comprime el contexto en 32 puntos de referencia por cabeza; solo 248 filas se conservan exactas, por lo que la recuperación de información literal fuera de esas filas puede degradarse. El autor lo ejemplifica con contraseñas y códigos, pero no se documentan tasas de fallo.
- La perplejidad reportada no incluye valor numérico en la información disponible, y no hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la calidad del modelo base no está cuantificada en esta ficha.
- El modelo base Spark-X2.6-4B es de procedencia poco documentada: no se dispone de información sobre dataset de entrenamiento, número de tokens, proceso de alineación ni evaluación de sesgos.
- Riesgo de alucinación inherente a un modelo de 4B: la compresión de contexto puede agravar errores en tareas de recuperación sobre textos muy largos.
- Idiomas declarados limitados a inglés, chino y ruso; el resto de idiomas, incluido el castellano, no está validado explícitamente.
- Las cifras de rendimiento proceden del autor y de un único entorno de prueba (MacBook Air M4 y RTX 2000 Ada); no hay replicación independiente.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción prácticamente nula y ausencia de validación por la comunidad.
- La solicitud de patente citada (n.º 19/738,763) puede afectar a reutilización o reimplementación del mecanismo de atención; la licencia Apache 2.0 cubre los pesos, pero conviene verificar la situación de la técnica patentada para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Spark-X2.6-4B-turbo-cmf
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Archivo estándar del mismo modelo: https://huggingface.co/infosave/Spark-X2.6-4B-cmf
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- mlx-lm: https://github.com/ml-explore/mlx-lm
