# infosave/Nanbeige4.2-3Bcmf

## Resumen

Nanbeige4.2-3Bcmf es una conversión al formato CMF del modelo Nanbeige/Nanbeige4.2-3B, un transformer con arquitectura de bucles (looped transformer) desarrollado por Nanbeige LLM Lab. El repositorio lo publica el usuario infosave, autor del runtime CMF, y su aportación es exclusivamente de formato: empaqueta los pesos originales en un único fichero de 2,4 GB cuantizado a q4t, servido mediante mmap y ejecutado por un motor escrito íntegramente en Rust, sin dependencia de Python.

El modelo base es un modelo de razonamiento que delibera antes de responder. Su rasgo arquitectónico distintivo es que aplica 22 capas físicas dos veces (44 capas virtuales) con re-normalización en cada frontera de bucle, lo que eleva el coste aritmético por token al de un modelo denso de aproximadamente 6B. El vocabulario de 166k tokens con embeddings no atados añade otros 1,0B de parámetros, de modo que el fichero contiene en realidad 4,17B de parámetros.

La relevancia de esta ficha es práctica: demuestra que un modelo de razonamiento de esta clase puede ejecutarse en hardware de consumo y en dispositivos móviles con velocidades utilizables. En una RTX A5000 alcanza 106 tok/s en decodificación; en un MacBook Air con M4 sin ventilador, 22,4 tok/s. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer: 22 capas fisicas aplicadas dos veces (44 virtuales), re-norm en cada frontera de bucle |
| Parametros totales | 4,17B (incluye 1,0B de embeddings no atados con vocabulario de 166k) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se han medido prompts de 4096 tokens; no se especifica el maximo) |
| Tipos de cuantizacion | q4t (unico publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | CMF (fichero unico servido por mmap, runtime en Rust); no se publican safetensors ni GGUF en este repo |
| Tamano del repositorio | 12,0 GB (el fichero q4t ocupa 2,4 GB) |
| Modelo base | Nanbeige/Nanbeige4.2-3B |
| Runtime | cortiq >= 0.5.35 (CLI en Rust, con backend CUDA, Metal, Vulkan y DX12) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucles: un bloque de 22 capas físicas que se ejecuta dos veces, dando lugar a 44 pasadas de capa por token. En cada frontera de bucle se aplica una re-normalización, y el motor CMF ejecuta este bucle de forma nativa en lugar de desenrollarlo. El coste computacional resultante, de aproximadamente 6,3 G multiplicaciones-acumulaciones por token, equivale al de un modelo denso de 6B. El vocabulario de 166k tokens con embeddings no atados explica que el recuento real de parámetros (4,17B) supere la denominación comercial de "3B".

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) en la documentación proporcionada. La model card del repositorio se centra en el proceso de conversión y en las mediciones de rendimiento, no en el entrenamiento. La conversión se realiza con `cortiq convert`, que procesa el checkpoint fragmento a fragmento en streaming, de modo que el espacio en disco necesario es el de un fragmento más la salida. La fidelidad del forward con bucles se verificó contra una referencia en PyTorch float32 construida a partir del código de modelado original: mismo argmax y mismo orden en el top-5 para el mismo prompt, con logits q4t dentro de un margen de aproximadamente 2 respecto a la referencia.

## Capacidades

- Generación de texto y razonamiento en modo deliberativo: el modelo "piensa" antes de responder, por lo que requiere un presupuesto de tokens de salida suficiente para alcanzar la respuesta final.
- Razonamiento multi-paso implícito en su modo de deliberación.
- Ejecución nativa del bucle de capas por parte del runtime, sin desenrollado manual.
- Servido como API compatible con OpenAI mediante `cortiq serve`.
- Ejecución en dispositivo (on-device) a través de la aplicación CMF Mobile, con streaming de tokens y modo servidor en red local.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistencia y chat en dispositivo móvil: la aplicación CMF Mobile carga el fichero de 2,4 GB y permite conversar con streaming de tokens sin conexión, con un consumo de RAM de aproximadamente 2,6 GB más la caché KV. Adecuado para escenarios de privacidad donde los datos no deben salir del teléfono.
- Servidor local compatible con OpenAI: `cortiq serve` expone el modelo como endpoint en la red local, lo que permite sustituir llamadas a una API externa en prototipos y herramientas internas sin cambiar el código cliente.
- Razonamiento interactivo en estaciones de trabajo: con 106 tok/s en una RTX A5000 y 1,36 s hasta el primer token sobre un prompt de 4096 tokens, el modelo es viable para asistentes de análisis que requieren contexto largo y respuestas razonadas.
- Procesamiento por lotes de documentos en CPU: en un Apple M4 sin GPU alcanza 9,2 tok/s en decodificación y 86 tok/s de prefill, suficiente para tareas asíncronas de resumen o extracción donde la latencia no es crítica.
- Despliegue en portátiles sin ventilador: 22,4 tok/s en un MacBook Air M4 con Metal permiten uso conversacional fluido en movilidad, con degradación controlada a 14,2 tok/s con contexto de 1024 tokens.
- Integración en pipelines sin Python: al ser un binario Rust con CLI, encaja en contenedores mínimos y entornos con restricciones de dependencias, evitando el lastre de un stack de Python para servir el modelo.
- Evaluación y experimentación con arquitecturas con bucles: el runtime ejecuta el bucle de forma nativa, lo que facilita comparar el comportamiento de este diseño frente a transformers densos convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son mediciones de velocidad del runtime:

| Entorno | Modo | Decodificacion | Prefill / primer token |
|---|---|---|---|
| RTX A5000 (24 GB), CUDA | GPU | 106,0–106,6 tok/s | 2995 tok/s en prompt de 4096; primer token 1,36 s |
| RTX A5000, CUDA | GPU, tras prompt de 4096 | 81,3 tok/s | — |
| RTX A5000, Vulkan | GPU | 63,4–63,6 tok/s | 254 tok/s en prompt de 4096; primer token 16,1 s |
| MacBook Air M4, Metal | GPU | 22,4 tok/s (64 tokens de contexto); 17,6 tok/s (512); 14,2 tok/s (1024) | 181 tok/s a 512; 143 tok/s a 1024; primer token 2,7 s a 512 |
| MacBook Air M4 | Solo CPU | 9,2 tok/s | 86 tok/s; primer token 6,1 s a 512 |
| RTX PRO 6000, Vulkan | GPU discreta | 94,2 tok/s | — |
| CPU de 48 nucleos | Solo CPU | 23,1 tok/s | — |

El techo teórico en el M4 se sitúa cerca de 31 tok/s, limitado por el ancho de banda de memoria (unos 120 GB/s) frente a los aproximadamente 3,9 GB de pesos leídos por token en q4t; los 22,4 tok/s medidos representan en torno al 72% de ese límite. Las mediciones se obtuvieron con `cortiq bench --core` (greedy, sin penalización de repetición, mediana de tres ejecuciones) y requieren cortiq >= 0.5.35; versiones anteriores decodifican a unos 9 tok/s.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 2,6 GB en ejecución más la caché KV; el fichero de pesos ocupa 2,4 GB.
- GPU recomendadas: RTX A5000 (24 GB) con CUDA para máximo rendimiento (106 tok/s); RTX PRO 6000 con Vulkan (94,2 tok/s); cualquier GPU Apple Silicon con Metal.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB o más de VRAM; el límite práctico es el ancho de banda de memoria, no la capacidad.
- CPU: funciona íntegramente en CPU (9,2 tok/s en M4; 23,1 tok/s en CPU de 48 núcleos).
- Móvil: ejecutable en teléfono mediante la aplicación CMF Mobile.
- Opciones de despliegue: CLI `cortiq` (Rust), `cortiq serve` con API compatible con OpenAI, y CMF Mobile con modo servidor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato CMF es específico de este runtime.
- Latencia y throughput: ver tabla de benchmarks; el prefill es el punto débil en Vulkan (primer token de 16,1 s con 4096 tokens), mientras que CUDA lo resuelve en 1,36 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento. A continuación se comparan únicamente características estructurales verificables:

| Modelo | Parametros | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Nanbeige4.2-3Bcmf (esta ficha) | 4,17B reales (3B nominales) | no disponible | Apache-2.0 | CMF, runtime cortiq en Rust |
| Nanbeige/Nanbeige4.2-3B (base) | 4,17B reales | no disponible | Apache-2.0 | Pesos originales (safetensors presumiblemente); no confirmado |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de razonamiento: necesita un presupuesto de tokens de salida amplio para llegar a la respuesta final; con `--max-tokens` bajo puede devolver solo el razonamiento intermedio.
- El repositorio solo publica cuantización q4t. La fidelidad verificada respecto a la referencia float32 muestra logits dentro de un margen de aproximadamente 2, lo que implica una degradación numérica no nula frente al modelo original.
- El formato CMF es propietario de este ecosistema: no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y obliga a usar el runtime cortiq.
- Se requiere cortiq >= 0.5.35; versiones anteriores degradan el rendimiento a unos 9 tok/s y a 40 s de ingesta de un prompt de 512 tokens.
- El rendimiento en Vulkan es notablemente inferior al de CUDA, especialmente en prefill (primer token de 16,1 s frente a 1,36 s con 4096 tokens).
- No hay información publicada sobre sesgos, tasas de alucinación, cobertura idiomática ni límite máximo de contexto; deben evaluarse empíricamente antes de un despliegue en producción.
- El techo de velocidad en hardware de consumo está dominado por el ancho de banda de memoria, no por la potencia de cómputo; en equipos con menos de 120 GB/s el rendimiento caerá proporcionalmente.
- La licencia Apache-2.0 permite uso comercial, pero los pesos pertenecen a Nanbeige LLM Lab y esta publicación solo cambia el formato de almacenamiento; conviene verificar los términos del modelo base para cualquier uso comercial.
- El repositorio tiene 1 like y 5095 descargas, con un único mantenedor de la conversión; no es un artefacto oficial del laboratorio que desarrolló el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/infosave/Nanbeige4.2-3Bcmf
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Runtime, conversor y especificación del formato CMF: https://github.com/infosave2007/cmf
- Aplicación móvil CMF Mobile: https://github.com/infosave2007/cmfmobile
