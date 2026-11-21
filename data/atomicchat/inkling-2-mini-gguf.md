# AtomicChat/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) de 26.070.385.152 parámetros totales desarrollado por Thinking Machines, del que AtomicChat publica una conversión a formato GGUF para su uso con llama.cpp. El modelo acepta entrada de texto e imagen (pipeline image-text-to-text) y emplea una arquitectura poco habitual: un núcleo con bucles en el que las 12 capas centrales de las 24 totales se ejecutan tres veces, lo que incrementa la profundidad efectiva del cómputo sin aumentar el número de parámetros. De los 26,4B de parámetros, solo 3,4B están activos por token, gracias a 128 expertos con 8 activos por capa.

La relevancia de esta publicación es doble. Por un lado, pone a disposición de la comunidad un modelo multimodal con licencia Apache-2.0 en cuantizaciones que van desde BF16 (52,2 GB) hasta Q4_K_M (17,4 GB), lo que permite ejecutarlo en hardware de consumo. Por otro, requiere una versión específica de llama.cpp (el PR ggml-org/llama.cpp#32695, en borrador en el momento de la publicación) porque las versiones estables no cargan correctamente la arquitectura con bucles del modelo.

El repositorio incluye además el proyector de visión en F16 y BF16 (0,64 GB) necesario para el procesamiento de imágenes, y el autor anuncia cuantizaciones dinámicas (AD) con matriz de importancia para el rango de 10 a 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo en bucle (looped core); 24 capas, de las cuales las 12 centrales se ejecutan 3 veces |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B (128 expertos, 8 activos por capa) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M; proyectores de vision en F16 y BF16 |
| Idiomas soportados | no disponible (la model card menciona una respuesta de prueba en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint original del proveedor en NVFP4/MXFP8 |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 24 capas y un diseño de "núcleo en bucle": las 12 capas intermedias se aplican tres veces en secuencia, de modo que el cómputo efectivo equivale a 48 pasadas de capa con solo 24 bloques de parámetros. Cada capa enruta los tokens hacia 128 expertos, de los cuales se activan 8, lo que resulta en 3,4B de parámetros activos sobre un total de 26,4B. El modelo procesa tanto texto como imágenes mediante un proyector de visión independiente que se distribuye como archivo GGUF aparte.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información proporcionada. La model card de AtomicChat indica que los archivos BF16 se obtuvieron desquantizando el checkpoint del proveedor, originalmente en NVFP4/MXFP8. Una particularidad técnica relevante para la cuantización es que la proyección descendente de los expertos tiene filas de 1152 elementos, un tamaño que los k-quants de llama.cpp no admiten; por ello la herramienta sustituye el tipo en esa capa: Q8_0 en las 24 capas de Q6_K, Q8_0 en la mitad de las capas y Q5_1 en el resto para Q5_K_M, y Q8_0 con Q5_0 para Q4_K_M.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector de visión incluido.
- Razonamiento configurable mediante el parámetro `reasoning_effort` de la plantilla de chat, con seis niveles: `none`, `minimal`, `low`, `medium`, `high` y `xhigh` (valor por defecto 0.9).
- Llamada a herramientas (tool calling), verificada por el autor con `--jinja` en llama-server.
- Capacidad multilingüe, al menos parcial: se ha probado una respuesta en chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se dispone de información sobre capacidades de audio ni sobre soporte de agentes multi-paso más allá del tool calling.

## Casos de uso

- Asistente local con imágenes: el modelo puede responder preguntas sobre capturas de pantalla, diagramas o fotografías usando el proyector F16 (0,64 GB) junto con la cuantización Q4_K_M (17,4 GB), lo que lo hace viable en una GPU de consumo de 24 GB.
- Chat de escritorio offline: integrable en aplicaciones que ejecutan modelos localmente, como la propia Atomic Chat, gracias al formato GGUF y a la licencia Apache-2.0 sin restricciones de uso comercial.
- Automatización con herramientas: el soporte de tool calling verificado permite construir asistentes que consulten APIs o ejecuten funciones, con el nivel de razonamiento ajustable según la latencia tolerada.
- Análisis de documentos con componentes visuales: gráficos, tablas escaneadas o interfaces de usuario pueden enviarse como imagen junto con instrucciones de texto para extraer información estructurada.
- Razonamiento con presupuesto de cómputo variable: el parámetro `reasoning_effort` permite usar `low` o `minimal` en tareas simples y `high` o `xhigh` en problemas que requieran cadenas de razonamiento largas, equilibrando coste y calidad.
- Despliegue en servidores modestos: con Q4_K_M (17,4 GB) o Q5_K_M (19,8 GB) puede servirse mediante llama-server en una única GPU de 24 GB, con contexto configurable hasta 32768 tokens en el ejemplo del autor.
- Experimentación e investigación: al ser Apache-2.0 y estar disponible en múltiples cuantizaciones, sirve para estudiar el comportamiento de arquitecturas MoE con bucles y para comparar su calidad frente a transformers convencionales del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 52,2 GB para BF16, 27,7 GB para Q8_0, 23,4 GB para Q6_K, 19,8 GB para Q5_K_M y 17,4 GB para Q4_K_M, más 0,64 GB del proyector de visión si se usa entrada de imagen. Hay que añadir la memoria para la caché KV según la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB, L40S o RTX 6000 Ada para Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con Q4_K_M o Q5_K_M; las cuantizaciones AD anunciadas para el rango de 10 a 24 GB ampliarán las opciones.
- Opciones de despliegue: llama.cpp compilado desde el PR ggml-org/llama.cpp#32695 (commit `6196d98`), con `llama-server` y la opción `--jinja`; no funciona con versiones estables de llama.cpp que no incluyan dicho PR. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini | 26,4B | 3,4B | no disponible | Apache-2.0 | GGUF, NVFP4/MXFP8 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere una compilación específica de llama.cpp (PR #32695, en borrador al publicarse); las versiones estables no cargan la arquitectura con bucles.
- El nivel `none` de `reasoning_effort` no desactiva por completo el razonamiento, según advierte el propio proveedor.
- La cuantización k-quant no puede representar directamente las filas de 1152 de la proyección descendente de los expertos, por lo que llama.cpp sustituye tipos y la calidad de los presets Q6_K, Q5_K_M y Q4_K_M puede diferir de la esperada por su nombre; el autor aún no ha publicado métricas de KLD frente a BF16.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo.
- La cobertura de idiomas no está documentada; solo se ha verificado una respuesta en chino.
- No se dispone de datos sobre el entrenamiento (tokens, composición del dataset, alineación), lo que limita la evaluación de riesgos.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar el archivo LICENSE del repositorio y la licencia del modelo base.
- Existe una variante sin censura en preparación (AtomicChat/Inkling-2-Mini-Uncensored-GGUF), lo que sugiere que el modelo base incorpora algún tipo de alineación de seguridad no detallada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante sin censura (en progreso): https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- PR de llama.cpp necesario: https://github.com/ggml-org/llama.cpp/pull/32695
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Aplicación Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
