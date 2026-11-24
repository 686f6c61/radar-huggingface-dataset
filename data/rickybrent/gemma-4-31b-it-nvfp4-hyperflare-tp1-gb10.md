# rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb10

## Resumen

Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb10 es un paquete de inferencia preparado por el usuario rickybrent para ejecutar el modelo Gemma 4 31B IT en su versión cuantizada NVFP4 sobre una única NVIDIA DGX Spark (arquitectura GB10, SM121, 121 GiB de memoria unificada) con paralelismo tensorial TP1. No se trata de un modelo nuevo: el checkpoint base es `nvidia/Gemma-4-31B-IT-NVFP4` (revisión `4135a98a`), la cuantización NVFP4 de NVIDIA del modelo `google/gemma-4-31B-it`, y este repositorio aporta el empaquetado, el runtime Hyperflare adaptado y un ejecutable `arm64` específico para servir el modelo con visión y contexto largo.

La relevancia del paquete reside en que habilita características que las builds públicas de Flare no incluyen: frontend de imagen, codificador de visión, KV con ventana deslizante circular, decodificación split-KV y decodificación especulativa MTP con anchos de 1 a 6. Con ello se consigue servir hasta 262.144 tokens de contexto por petición, un pool de KV de 1.742.848 tokens, concurrencia de 4 peticiones de texto y 2 de imagen, y todo ello en un único dispositivo de 121 GiB de memoria unificada.

El paquete está marcado como *preview*: el ejecutable incluido es obligatorio porque las builds publicadas de Flare no contienen el stack de visión ni el layout de KV circular de Gemma 4. La licencia declarada es Apache 2.0 (con enlace a los términos de Gemma de Google), si bien la etiqueta de Hugging Face indica `license:other`, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y torre de visión en BF16; proyecciones MLP en NVFP4 (cuantización ModelOpt); decodificación especulativa MTP |
| Parametros totales | 31B (según denominación del checkpoint base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | NVFP4 en proyecciones MLP; BF16 en atención y visión; KV en FP8; pesos empaquetados ~31,3 GiB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (license_name: apache-license-2.0, enlace a ai.google.dev/gemma/apache_2); etiqueta HF: other |
| Formato de pesos | Directorio core `arm64` (no safetensors ni GGUF estándar); runner `runner/flare-linux-arm64` incluido |
| Hardware objetivo | 1x NVIDIA DGX Spark (GB10, SM121, 121 GiB memoria unificada), TP1 |
| Pool KV | 1.742.848 tokens, 168 slots de snapshot compartidos, 68,5 GiB de caché, 4 GiB reservados en host |
| Concurrencia | 4 peticiones de texto, 2 de imagen |
| Prefill chunk | 4.096 tokens |
| Grafos CUDA capturados | 62 |
| Tamano del paquete | ~32 GB (directorio core) |
| Carga en frío | pesos en 4,3 s; servidor listo en ~20 s con asignación de caché |

## Arquitectura y entrenamiento

El modelo base es un transformer de 31B parámetros en su variante instruct (`-it`), cuantizado por NVIDIA mediante ModelOpt a NVFP4 en las proyecciones MLP mientras mantiene atención y torre de visión en BF16. Sobre esa base, este paquete incorpora en el runtime Hyperflare un frontend de imagen, un codificador de visión, un layout de KV con ventana deslizante circular, decodificación split-KV y decodificación especulativa MTP con anchos de 1 a 6 y verificación adaptativa. El objetivo del diseño es maximizar la longitud de contexto efectiva y el aprovechamiento de memoria en un dispositivo con memoria unificada, no aumentar la calidad del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card original de Google y no se incluyen en la información proporcionada. La innovación técnica destacable de este paquete es el KV circular con ventana deslizante, que permite un pool de 1,7 millones de tokens con 168 slots de snapshot compartidos y restauración de prefijos de más de 2,5K tokens, junto con la decodificación especulativa MTP que acelera la generación.

## Capacidades

- Generación de texto conversacional en modo instruct, con respuestas coherentes en pruebas de saludo simple (`Hello! How can I help you today?`).
- Razonamiento multimodal imagen-texto: identificación de formas y colores (círculo rojo, cuadrado azul, triángulo verde, rombo amarillo) en pruebas de una, dos y cuatro imágenes.
- Procesamiento de imágenes con múltiples slots simultáneos (hasta 2 peticiones de imagen concurrentes preparadas).
- Contexto largo: recuperación de aguja en 42.828, 128.367 y 171.115 tokens validada.
- Reutilización de prefijo en conversaciones multi-turno con caché (`cached_tokens=2286` en la prueba de wraparound).
- Decodificación especulativa MTP con anchos de 1 a 6 y verificación adaptativa.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el contexto largo y la caché de prefijos lo hacen viable, pero no se documenta.

## Casos de uso

- Asistencia sobre documentos largos: con 262.144 tokens de contexto por petición y un pool de KV de 1,7 millones de tokens, el modelo puede ingerir informes, expedientes o bases de código extensas y responder preguntas con recuperación de aguja validada hasta 171.115 tokens.
- Análisis de imágenes en flujo conversacional: el frontend de imagen y el codificador de visión permiten enviar capturas, diagramas o fotografías y continuar la conversación con reutilización de prefijo en caché, útil en soporte técnico visual o revisión de documentación escaneada.
- Procesamiento por lotes en un único dispositivo: la concurrencia de 4 peticiones de texto y 2 de imagen con 62 grafos CUDA capturados permite servir varias consultas simultáneas en una DGX Spark sin clúster adicional.
- Prototipado de agentes con memoria larga: la restauración de prefijos de más de 2,5K tokens y el pool KV compartido facilitan mantener el estado de un agente entre turnos sin recalcular el contexto.
- Evaluación de cuantización NVFP4 en producción: el paquete sirve como referencia reproducible para medir latencia y throughput de NVFP4 en SM121 antes de adoptar la cuantización en otros despliegues.
- Investigación en decodificación especulativa: los anchos MTP de 1 a 6 con verificación adaptativa permiten experimentar con estrategias de aceleración sobre hardware ARM64 de NVIDIA.
- Despliegue en entornos de borde con memoria unificada: una DGX Spark de 121 GiB puede alojar el modelo (34,19 GiB cargados) y una caché de 68,5 GiB, lo que encaja en laboratorios o entornos de desarrollo con espacio y consumo limitados.

## Benchmarks y rendimiento

Resultados medidos en el paquete firmado sobre una DGX Spark (GB10, 121 GiB unificados, SM121), TP1, ajustes de serving por defecto y MTP activado en las pruebas de imagen.

| Prompt tokens | 10.961 | 21.918 | 43.806 | 87.592 | 175.187 |
|---|---:|---:|---:|---:|---:|
| Tiempo de prefill (s) | 8,48 | 20,24 | 48,99 | 131,31 | 411,28 |
| Prefill tok/s | 1.293 | 1.083 | 894 | 667 | 426 |

| Decode agregado (tok/s) | C1 | C2 | C4 |
|---|---:|---:|---:|
| Contexto 0K | 18,6 | 30,5 | 27,6 |
| Contexto 32K | 18,2 | — | — |

| Prueba de imagen (primer token, temperature=0) | Tiempo | Resultado |
|---|---:|---|
| Imagen única (círculo rojo + cuadrado azul) | 1,49 s | correcto |
| Prefijo de 2.132 tokens + imagen | 2,59 s | `The image shows a red circle.` |
| Multi-turno con prefijo en caché + imagen turno 2 | 1,67 s | `(1) QUARTZ-941 (2) Green triangle` |
| Dos imágenes | 2,02 s | correcto |
| Cuatro imágenes | 2,66 s | `1. Red circle 2. Blue square 3. Green triangle 4. Yellow diamond` |
| Solo texto | 0,99 s | `Hello! How can I help you today?` |
| Dos peticiones de imagen simultáneas | 1,42 s (wall) | sin cruce entre peticiones |

Validación adicional: 7/7 pruebas de imagen superadas; recuperación de aguja en 42.828, 128.367 y 171.115 tokens (45,0 s, 242,9 s y 393,8 s); firmas verificadas por Flare; pruebas unitarias y CUDA en SM121 (atención deslizante por etapas 7, KV circular 4, paridad del codificador de visión y frontend de imagen).

## Requisitos de hardware

- VRAM/memoria: 34,19 GiB de mapeos fijos para pesos cargados más 68,5 GiB de caché, sobre 121 GiB de memoria unificada de una DGX Spark (GB10). Con 4 GiB reservados en host, el total encaja en el dispositivo.
- GPU recomendadas: NVIDIA DGX Spark (GB10, SM121). No se ha validado en otras GPU; el paquete no se ha probado en hardware distinto de SM121.
- GPU de consumo: no disponible; el paquete es un binario `arm64` para SM121 y no se distribuye para GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: runtime Hyperflare con el ejecutable incluido `runner/flare-linux-arm64` (SHA-256 `79ba086f9a0d572d17fa81a5dfe46d08c1228cd455786c87a1c2e761d1028324`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: prefill de 1.293 tok/s a 10.961 tokens y 426 tok/s a 175.187 tokens; decode agregado de 18,6 tok/s (C1) y 30,5 tok/s (C2) a contexto 0K; carga en frío de pesos en 4,3 s y servidor listo en ~20 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb10 (este paquete) | 31B | 262.144 | NVFP4 MLP, BF16 atención/visión, KV FP8 | 1x DGX Spark GB10 | Apache 2.0 (etiqueta other) | Paquete preview en HF, revisión `gb10-tp1` |
| nvidia/Gemma-4-31B-IT-NVFP4 (checkpoint base) | 31B | no disponible | NVFP4 (ModelOpt) | no disponible | no disponible | Checkpoint en HF |
| google/gemma-4-31B-it (modelo original) | 31B | no disponible | BF16 (original) | no disponible | Términos Gemma | Modelo en HF |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Paquete *preview*: el stack de visión y KV circular no está fusionado en Flare; el ejecutable incluido es obligatorio y las builds públicas de Flare no sirven este modelo.
- Solo `arm64` y SM121: no se ha validado en TP2/TP4, checkpoints BF16, variantes E2B/E4B/12B/26B-A4B ni hardware distinto de SM121.
- Concurrencia de imagen limitada a 2 peticiones preparadas; no se han probado más solicitudes simultáneas de imagen.
- La suite de recetas más amplia presenta 13 fallos de deriva de tests respecto a su rama de origen, según la propia model card.
- Idiomas soportados no documentados; riesgo de comportamiento degradado en idiomas distintos de los cubiertos por el modelo base.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de robustez en este paquete.
- Licencia ambigua: la model card declara Apache 2.0 con enlace a los términos de Gemma, pero la etiqueta de Hugging Face indica `license:other`; conviene verificar los términos antes de uso comercial.
- Proyecto personal, no es un producto de Google; el autor reclama únicamente los cambios de motor de Gemma 4 (frontend de imagen, codificador de visión, KV circular, split-KV, corrección de transferencia de estado y cableado de serving).
- El rendimiento medido corresponde a una única DGX Spark con ajustes por defecto; no se garantiza en otras configuraciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb10
- Rama con el payload `gb10-tp1`: https://huggingface.co/rickybrent/Gemma-4-31B-IT-NVFP4-HYPERFLARE-TP1-gb10/tree/gb10-tp1
- Checkpoint base NVFP4: https://huggingface.co/nvidia/Gemma-4-31B-IT-NVFP4
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Runtime Hyperflare: https://github.com/NVIDIA/hyperflare-inference
- Licencia Gemma Apache 2.0: https://ai.google.dev/gemma/apache_2
