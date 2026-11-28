# jalenluorion/Qwen3.8-Flash-Next-moved-store

## Resumen

Qwen3.8-Flash-Next-moved-store es un reempaquetado del modelo Qwen/Qwen3.8-Flash-Next (180.000 millones de parametros) realizado por el usuario jalenluorion, cuyo objetivo es hacer viable la inferencia de un modelo de escala 180B en un Mac con 16 GB de memoria unificada. Para ello, los 24.576 expertos enrutados (120,8B parametros) y una memoria n-gram (51,2B parametros) se almacenan en SSD en formato de 4 y 8 bits respectivamente, y se leen bajo demanda hacia una cache bloqueada en memoria conforme las capas los necesitan.

La innovacion central es lo que el autor denomina "prefetchable store": routers ligeros entrenados (576M parametros, lag-4) predicen que expertos necesitara una capa cuatro capas antes, de modo que las lecturas desde SSD comienzan mientras se computan las capas intermedias. Las filas de la memoria n-gram se leen directamente a partir de los token ids previos, por lo que pueden solicitarse en cuanto se elige un token. Solo permanecen en memoria las capas de atencion (36 Gated DeltaNet y 12 de atencion dispersa), expertos compartidos, normas, embeddings y cabeza de salida (4,9B parametros en 8 bits).

El modelo es exclusivamente de texto (no incluye la torre de vision ni la capa MTP del release original) y esta disenado para ejecutarse unicamente en macOS mediante el motor `dmeng` (C++), con un servidor compatible con OpenAI. Su relevancia radica en demostrar que un MoE de 180B puede servir en hardware de consumo con velocidades de 4-6 tokens/s, muy por encima de las 0,4 tokens/s de llama.cpp con un GGUF 4-bit mapeado en memoria en el mismo equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con atencion hibrida (36 capas Gated DeltaNet + 12 capas de atencion dispersa), 48 capas |
| Parametros totales | 180B (aproximado; suma de componentes: 4,9B en memoria + 576M routers + 120,8B expertos + 51,2B n-gram) |
| Parametros activos | 10 de 512 expertos por capa por token en 48 capas (24.576 expertos enrutados en total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con grupos de 64 para pesos residentes; 4-bit para expertos en SSD; 8-bit para filas n-gram y routers |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (resident.safetensors, embeddings.safetensors), npz (routers_k4.npz), JSON de perfil (moved-store.json) |
| Tamano del repositorio | 196,3 GB |
| Descarga del perfil mac | 126,46 GB (75 archivos) |
| Libreria | mlx (etiquetado), motor propio dmeng (C++) |
| Plataforma | macOS unicamente (perfil mac); sin perfil para movil |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer MoE de 180B parametros con una arquitectura hibrida que combina 36 capas de Gated DeltaNet (atencion lineal con estado recurrente) y 12 capas de atencion dispersa. Cada capa contiene 512 expertos enrutados, de los cuales se activan 10 por token, sumando 24.576 expertos en total. Ademas de los expertos, el modelo incorpora una memoria n-gram de 51,2B parametros que aporta 16 filas por token, leidas a partir de los token ids previos.

El reempaquetado de jalenluorion no modifica los pesos del modelo: los pesos liberados estan congelados y el router original del modelo sigue tomando todas las decisiones de enrutamiento. Lo que se anade son routers auxiliares lag-4 (576M parametros, entrenados) que predicen con cuatro capas de antelacion que expertos necesitara cada capa, permitiendo solapar las lecturas de SSD con el computo. El motor `dmeng` ofrece dos modos: `exact`, en el que los tokens generados no dependen de la cache, los routers ni los tiempos (se espera a cada experto seleccionado), y `fast`, en el que los expertos seleccionados que no estan en memoria se leen por orden de peso hasta que los restantes suman como maximo 0,13 del peso de enrutamiento del paso y se omiten sin sustituto ni renormalizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy o con temperatura configurable (`--temp`).
- Razonamiento multi-paso mediante el bucle de agente del servidor compatible con OpenAI (probado con OpenCode).
- Uso como agente con llamadas a herramientas: las peticiones registradas de OpenCode con resultados de herramientas funcionan a 4,1-4,9 tokens/s con contextos de 8.000-10.000 tokens.
- Modo `exact` para resultados reproducibles e independientes de la cache y los tiempos.
- Modo `fast` con omision controlada de expertos (hasta 0,13 del peso de enrutamiento) para mayor velocidad.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no incluida (la torre de vision del release original se excluye explicitamente).
- Capa MTP: no incluida.
- Solo texto.

## Casos de uso

- Desarrollo y pruebas en portatiles Apple Silicon: permite experimentar con un MoE de 180B en un MacBook Pro de 16 GB sin acceso a GPUs de datacenter, usando el perfil `mac` y el motor `dmeng` con el modo `exact` para resultados reproducibles.
- Asistente de codigo en local con OpenCode: el servidor `dmserve.py` expone una API compatible con OpenAI y se ha validado con OpenCode en sesiones de agente con contextos de 8.000-10.000 tokens, adecuado para revisiones de codigo y explicaciones sin enviar datos a la nube.
- Generacion de texto offline y privada: al ejecutarse integramente en el equipo local (pesos en SSD y memoria), es apto para entornos con requisitos de confidencialidad donde no se permite el envio de prompts a servicios externos.
- Evaluacion de arquitecturas MoE con offloading a SSD: investigadores pueden medir el impacto de la prediccion lag-4 y de la politica de omision de expertos comparando los modos `exact` y `fast` sobre el mismo conjunto de pesos.
- Prototipado de agentes multi-paso: el modo `fast` mantiene el enrutamiento del propio modelo y permite iteraciones de agente a 4-6 tokens/s, suficiente para tareas de razonamiento encadenado con resultados de herramientas.
- Demostraciones y docencia sobre inferencia eficiente: la configuracion de cache (3,0-3,6 GB), la lectura por token (481-692 MB) y el consumo de memoria (8,6 GB) ofrecen un caso concreto para explicar tecnicas de prefetching y gestion de memoria en modelos grandes.
- Experimentacion con cuantizacion mixta: el repo separa pesos residentes en 8-bit, expertos en 4-bit y filas n-gram en 8-bit, lo que permite estudiar el equilibrio entre calidad y ancho de banda de SSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento medidos por el autor son los siguientes:

| Metrica | Modo exact | Modo fast |
|---|---|---|
| Decodificacion (tokens/s), cache 3,0 GB | 4,3-4,4 | 5,9-6,0 |
| Decodificacion (tokens/s), cache 3,6 GB | no medido | 6,5 (un par de ejecuciones) |
| Lectura por token (MB), cache 3,0 GB | 692 | 481-485 |
| Memoria (GB) | 8,6 | 8,6 |
| Coincidencia de la opcion top con `exact` (texto explicativo) | referencia | 0,964 |
| Coincidencia de la opcion top con `exact` (texto de agente de revision de codigo) | referencia | 0,992 |

Comparativa de referencia del autor en el mismo Mac (Base M4 MacBook Pro, 16 GB, SSD interno, enchufado, 8 hilos, greedy, 160 tokens generados): llama.cpp con un GGUF 4-bit del mismo modelo, mapeado en memoria y solo CPU, alcanza 0,45 y 0,39 tokens/s. El autor advierte que usa un archivo 4-bit distinto, por lo que no es una comparacion controlada.

## Requisitos de hardware

- Memoria: perfil `mac` disenado para un Mac de 16 GB; consumo medido de 8,6 GB con cache de 3,0 GB. La cache de expertos se dimensiona a partir de la memoria libre al arrancar y se reduce 1 GB por comprobacion bajo presion de memoria.
- Plataforma: exclusivamente macOS (Apple Silicon). No hay perfil para movil ni soporte para GPU NVIDIA/AMD documentado.
- Almacenamiento: 126,46 GB para el perfil `mac` (75 archivos) o 132,10 GB para las formas fuente; el repositorio completo ocupa 196,3 GB. Se requiere SSD interno o externo con ancho de banda suficiente.
- GPU recomendadas: no aplica; el motor `dmeng` esta pensado para CPU y memoria unificada de Apple Silicon. No se documentan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible en el sentido convencional; el modelo no se ejecuta en VRAM de GPU discreta segun la informacion proporcionada.
- Despliegue: motor `dmeng` (C++, compilado con CMake) y servidor `dmserve.py` compatible con OpenAI en el puerto 8090. Tambien se puede descargar el repositorio completo con `hf download`. No se mencionan vLLM, TGI, Ollama ni llama.cpp como opciones de despliegue para este reempaquetado.
- Latencia y throughput: 4,3-6,5 tokens/s en decodificacion; 4,1-4,9 tokens/s en turnos de agente con 8.000-10.000 tokens de contexto en modo `fast` con cache de 3,0 GB.
- Recomendacion del autor: cerrar otras aplicaciones grandes antes de arrancar, ya que la cache se dimensiona segun la memoria libre al inicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el mismo Mac | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-moved-store | 180B (MoE) | no disponible | 4,3-6,5 tokens/s (dmeng) | qwen-community-1.0 | Hugging Face, motor propio |
| Qwen3.8-Flash-Next (GGUF 4-bit con llama.cpp) | 180B (MoE) | no disponible | 0,39-0,45 tokens/s | qwen-community-1.0 | llama.cpp estandar |
| Qwen/Qwen3.8-Flash-Next (original) | 180B (MoE) | no disponible | no disponible (requiere hardware de datacenter) | qwen-community-1.0 | Hugging Face |

La comparacion con otros modelos de la misma categoria (por ejemplo, otros MoE de ~180B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: no incluye vision ni la capa MTP del release original, por lo que no puede realizar tareas multimodales.
- Exclusivo de macOS: no hay perfil para otras plataformas ni para movil; requiere Apple Silicon y el motor `dmeng`.
- Requiere 126,46 GB de almacenamiento y un SSD con ancho de banda suficiente; el rendimiento depende del estado del disco y de la memoria libre.
- El modo `fast` omite expertos seleccionados cuyo peso agregado puede llegar a 0,13 del peso de enrutamiento del paso, sin sustituto ni renormalizacion; la calidad medida coincide con `exact` en el 96,4% y el 99,2% de las opciones top en dos textos de prueba, pero no hay garantia general.
- El modo `exact` es mas lento (4,3-4,4 frente a 5,9-6,0 tokens/s) y depende de esperar cada lectura de experto.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se desconoce el comportamiento en dominios factuales.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia Qwen Community License 1.0: es necesario revisar sus terminos (restricciones de uso comercial y condiciones de atribucion) antes de un despliegue en produccion.
- Repositorio de terceros (jalenluorion), no oficial de Qwen; los pesos estan congelados y el router original decide, pero los routers lag-4 son entrenados por el autor y su calidad afecta al modo `fast`.
- El servidor compatible con OpenAI se ha validado con OpenCode; no se documenta compatibilidad con otras herramientas.
- No se han publicado benchmarks estandar de calidad, por lo que no es posible comparar su rendimiento cognitivo con otros modelos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-moved-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia (GitHub): https://github.com/jalenluorion/prefetchable-store
- Registros de llama.cpp en el mismo Mac: https://github.com/jalenluorion/prefetchable-store/tree/main/results/flash_next/llama_cpp
- Licencia Qwen Community 1.0: incluida en el repositorio como LICENSE (enlace relativo en la model card)
