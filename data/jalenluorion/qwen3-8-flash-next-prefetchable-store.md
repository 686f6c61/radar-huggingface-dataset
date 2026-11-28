# jalenluorion/Qwen3.8-Flash-Next-prefetchable-store

## Resumen

Qwen3.8-Flash-Next-prefetchable-store es una redistribución del modelo Qwen/Qwen3.8-Flash-Next de 180.000 millones de parámetros, publicada por el usuario jalenluorion, cuyo objetivo es hacerlo ejecutable en un Mac de 16 GB de memoria unificada. El autor no reentrena el modelo: congela los pesos originales y los reorganiza en un formato que permite que los 24.576 expertos enrutados residan en el SSD y se lean bajo demanda en una caché bloqueada, mientras el resto de componentes (capas de atención, expertos compartidos, normas, embeddings y cabecera de salida) permanecen en memoria cuantizados a 8 bits. La innovación central es la "prefetchabilidad": routers entrenados con un desfase de cuatro capas predicen qué expertos necesitará una capa antes de que esta se ejecute, de modo que las lecturas desde el SSD se solapan con el cómputo de las capas intermedias.

El modelo base emplea una arquitectura híbrida con 36 capas Gated DeltaNet y 12 capas de atención dispersa, más una memoria n-gram de 51.200 millones de parámetros que también reside en SSD y de la que cada token lee 16 filas. La release excluye la capa MTP y la torre de visión del modelo original, por lo que es estrictamente texto. El motor de inferencia, `dmeng`, está escrito en C++ y se distribuye junto al repositorio, con dos modos de operación (`exact` y `fast`) y un único perfil (`mac`).

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual de servir modelos MoE masivos desde almacenamiento secundario en hardware de consumo; por otro, advierte de que se trata de una redistribución no oficial con licencia heredada Qwen Community 1.0, cuyo uso en producción exige revisar los términos del modelo base. El repositorio ocupa 196,3 GB y acumula 1.147 descargas desde su creación el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 36 capas Gated DeltaNet + 12 capas de atención dispersa, con enrutamiento disperso y memoria n-gram |
| Parametros totales | 180B (aproximado; 4,9B residentes + 576M routers + 120,8B expertos + 51,2B memoria n-gram) |
| Parametros activos | 10 de 512 expertos por capa y token, en 48 capas (24.576 expertos enrutados en total) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos residentes en 8-bit affine con grupos de 64; expertos en 4-bit; filas de memoria n-gram en 8-bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | Safetensors (`resident.safetensors`, `embeddings.safetensors`), NumPy (`routers_k4.npz`), ficheros derivados propietarios en `derived/*` y `.dmeng/` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina dos tipos de capa: 36 capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y 12 capas de atención dispersa. Sobre esta columna vertebral se dispone una capa MoE con 512 expertos por capa y 48 capas, lo que da 24.576 expertos enrutados, de los que se activan 10 por capa y token. A esto se suma una memoria n-gram de 51.200 millones de parámetros de la que cada token consulta 16 filas, lo que constituye un mecanismo de recuperación léxica asociativa poco común en modelos de esta escala.

Esta redistribución no aporta entrenamiento nuevo: los pesos están congelados y el router original del modelo sigue tomando todas las decisiones de enrutamiento. Lo que sí se ha entrenado son los routers con desfase de cuatro capas (576M de parámetros, en memoria a 8 bits), que predicen los expertos que necesitará una capa cuatro pasos antes para iniciar las lecturas de SSD con antelación. El autor no documenta el número de tokens de entrenamiento del modelo base ni la composición del dataset, y tampoco detalla si hubo RLHF o DPO. La innovación técnica destacable es el solapamiento de E/S y cómputo: las lecturas de expertos se lanzan mientras se calculan las capas intermedias, y las filas n-gram se leen en cuanto se conoce el token anterior, sin esperar al router.

## Capacidades

- Generación de texto autoregresiva en modo chat, con decodificación greedy o con temperatura configurable (`--temp`).
- Razonamiento y generación de código heredados del modelo base, aunque sin benchmarks publicados en esta release que los cuantifiquen.
- Servidor compatible con la API de OpenAI mediante `python/serve/dmserve.py`, que el autor indica que funciona con OpenCode estándar.
- Soporte de turnos de agente: el autor reporta decodificación de 4,1 a 4,9 tokens por segundo tras resultados de herramientas en sesiones de 8.000 a 10.000 tokens de contexto.
- Enrutamiento disperso determinista en modo `exact`: los tokens generados no dependen de la caché, los routers ni el timing.
- Modo `fast` con omisión controlada de expertos: se descartan los expertos no residentes cuyo peso de enrutamiento agregado no supera 0,13 del peso total del paso, sin sustitución ni renormalización.
- Memoria n-gram asociativa de 51,2B parámetros consultada por token.
- No incluye visión ni audio: la torre de visión y la capa MTP del modelo original están excluidas. Solo texto.

## Casos de uso

- Inferencia de un MoE de 180B en un MacBook de 16 GB: el caso de uso central de la release. Un desarrollador puede ejecutar el modelo con `build/dmeng --model model --chat` tras descargar el perfil `mac` de 126,46 GB, algo inviable con llama.cpp estándar según los datos del autor (0,45 y 0,39 tokens/s con un GGUF 4-bit mapeado en memoria, frente a 4,3-4,4 tokens/s en modo `exact`).
- Experimentación con enrutamiento disperso y prefetching: los dos modos permiten comparar la calidad de la salida cuando se espera a todos los expertos (`exact`) frente a cuando se omiten los de menor peso (`fast`), con una métrica de coincidencia de elección superior reportada de 0,964 en texto explicativo y 0,992 en texto de agente de revisión de código.
- Servicio local compatible con OpenAI para herramientas de desarrollo: `dmserve.py` expone un endpoint que el autor verifica con OpenCode, lo que permite integrar el modelo en flujos de asistencia de código sin salir de la máquina.
- Evaluación de técnicas de almacenamiento en SSD para modelos masivos: el perfil `moved-store.json` lista ficheros, tamaños y sha256, lo que facilita reproducir y auditar el conjunto exacto de artefactos necesarios.
- Investigación sobre memoria n-gram en modelos de lenguaje: la release incluye una memoria asociativa de 51,2B parámetros con lectura de 16 filas por token, un componente poco frecuente que puede estudiarse de forma aislada.
- Pruebas de robustez bajo presión de memoria: la caché de expertos se dimensiona a partir de la memoria libre al arrancar, se reduce 1 GB por comprobación bajo presión y vuelve a crecer, un comportamiento útil para estudiar degradación en entornos con recursos ajustados.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son de velocidad y memoria, medidos en un MacBook Pro M4 base con 16 GB, SSD interno, enchufado, 8 hilos, decodificación greedy y 160 tokens generados, con dos ejecuciones alternas:

| Cache de expertos | Modo `exact` (tok/s) | Modo `fast` (tok/s) | Lectura por token, `exact`/`fast` (MB) | Memoria (GB) |
|---|---|---|---|---|
| 3,0 GB | 4,3-4,4 | 5,9-6,0 | 692 / 481-485 | 8,6 |
| 3,6 GB | No disponible | 6,5 (un par de ejecuciones) | No disponible | No disponible |

Como referencia, el autor mide llama.cpp estándar con un GGUF 4-bit del mismo modelo, mapeado en memoria y solo CPU, en el mismo Mac: 0,45 y 0,39 tokens/s. El propio autor advierte que usa un fichero 4-bit distinto y que no constituye una comparación controlada. En turnos de agente con peticiones grabadas de OpenCode, modo `fast` y caché de 3,0 GB, la decodificación tras cada resultado de herramienta en sesiones de 8.000 a 10.000 tokens de contexto se situó entre 4,1 y 4,9 tokens por segundo.

## Requisitos de hardware

- VRAM/memoria: el perfil `mac` está pensado para 16 GB de memoria unificada. La caché de expertos se fija con el nivel libre del kernel al 14% una vez cargado todo, con techo en memoria física menos 5,5 GB menos el resto de memoria del proceso, y nunca más de lo que el sistema permita bloquear.
- GPU recomendadas: no se documentan GPU discretas. El perfil disponible es exclusivamente `mac` sobre Apple Silicon; el autor declara que no hay perfil para teléfono y que el modelo "runs on the Mac only".
- Cabe en GPU de consumo: no hay datos para RTX 4090, A100 o H100. El diseño depende de SSD y memoria unificada, no de VRAM dedicada.
- Despliegue: motor propio `dmeng` (C++, compilado con CMake) y servidor `dmserve.py` compatible con OpenAI. No se mencionan vLLM, TGI, Ollama ni llama.cpp como opciones soportadas para esta release; llama.cpp solo aparece como referencia de velocidad con otro fichero.
- Descarga: 126,46 GB en 75 ficheros para el perfil `mac`; 132,10 GB si se parte de las formas fuente (`resident.safetensors` y `routers_k4.npz`), con 5,29 GB adicionales generados en `.dmeng/` en el primer arranque. El repositorio completo ocupa 196,3 GB.
- Latencia y throughput: 4,3-6,5 tokens/s en decodificación según caché y modo; 4,1-4,9 tokens/s en turnos de agente con 8.000-10.000 tokens de contexto. El autor recomienda cerrar otras aplicaciones grandes antes de arrancar en máquinas de 16 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-prefetchable-store | 180B (4,9B residentes + 120,8B expertos + 51,2B n-gram) | No disponible | qwen-community-1.0 | Hugging Face, motor `dmeng` | Solo texto; perfil `mac` para 16 GB; 4,3-6,5 tok/s en M4 |
| Qwen/Qwen3.8-Flash-Next (base) | 180B | No disponible | Qwen Community License 1.0 | Hugging Face | Incluye torre de visión y capa MTP; requiere hardware acorde al tamaño completo |
| llama.cpp con GGUF 4-bit del mismo modelo | 180B (4-bit) | No disponible | Según fichero GGUF | llama.cpp | Referencia del autor: 0,45 y 0,39 tok/s en el mismo Mac, solo CPU, mapeado en memoria |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, licencia, disponibilidad y las cifras de velocidad medidas por el autor.

## Limitaciones y advertencias

- Redistribución no oficial: el autor es `jalenluorion`, no el equipo de Qwen. La licencia `qwen-community-1.0` se hereda del modelo base y debe revisarse antes de cualquier uso comercial; el campo `license: other` de los tags apunta a `LICENSE` en el repositorio.
- Solo texto: la torre de visión y la capa MTP del modelo original no están incluidas, de modo que no hay capacidades multimodales ni decodificación especulativa MTP.
- Exclusivo de macOS y Apple Silicon: no hay perfil para otras plataformas ni para GPU discretas, lo que limita el despliegue en servidores convencionales.
- El modo `fast` degrada la fidelidad: omite expertos cuyo peso de enrutamiento agregado no supera 0,13, sin sustitución ni renormalización. La coincidencia de elección superior reportada es de 0,964 en texto explicativo y 0,992 en texto de agente, lo que implica divergencias medibles respecto a `exact`.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad, sesgos o toxicidad en la información disponible. Al ser una release de infraestructura, no hay garantías de calidad factual.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingüe del modelo base en esta release.
- Longitud de contexto: no disponible. El autor solo menciona sesiones de agente de 8.000 a 10.000 tokens, sin declarar la ventana máxima.
- Dependencia de SSD y memoria libre: la caché se dimensiona a partir de la memoria libre al arrancar y se reduce bajo presión, por lo que el rendimiento es sensible a otras aplicaciones abiertas. El autor recomienda cerrar apps grandes en máquinas de 16 GB.
- Verificación de integridad: el perfil lista tamaños y sha256 de cada fichero, pero la confianza en los pesos depende de auditar esa lista frente al modelo base original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-prefetchable-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia (repositorio): https://github.com/jalenluorion/prefetchable-store
- Registros de llama.cpp de referencia: https://github.com/jalenluorion/prefetchable-store/tree/main/results/flash_next/llama_cpp
