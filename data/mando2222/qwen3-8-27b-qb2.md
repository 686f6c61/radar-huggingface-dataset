# mando2222/qwen3.8-27b-QB2

## Resumen

Qwen3.8-27B-QB2 es un bundle de despliegue, no un modelo entrenado desde cero: empaqueta el modelo base Qwen/Qwen3.8-27B para servirlo con vLLM sobre hardware Tenstorrent Blackhole, concretamente en dos placas p300c (4 chips, malla 1x4 con FABRIC_1D). Lo publica el usuario mando2222 bajo licencia Apache 2.0 y su propósito es ofrecer una pila reproducible de inferencia con decodificación especulativa DFlash en aceleradores Tenstorrent, un nicho poco cubierto por las pilas habituales (CUDA/ROCm).

El artefacto relevante aquí es la configuración de servicio: 8 usuarios concurrentes con 262.144 tokens de contexto cada uno, caché KV de 2.127.111 tokens, salida determinista con temperatura 0 o semilla fija, prefix caching por bloques de 4.096 tokens, soporte de hasta 4 imágenes por petición, tool calling con parser `qwen3_coder` y modo de razonamiento con parser `qwen3` (esfuerzo medio por defecto). El repositorio en Hugging Face ocupa 0,0 GB porque los pesos no se alojan: se descargan desde el repo del modelo base en el primer uso.

Es relevante ahora por dos motivos. Primero, demuestra que un modelo denso de 27B con contexto de 256K puede servirse con latencias utilizables (78,4 tok/s por usuario con 1 usuario y 26,3 tok/s por usuario con 8 en la configuración 128/1024) sobre silicio no-NVIDIA. Segundo, documenta con detalle inusual las técnicas de optimización a nivel de kernel (inicialización de KV en dispositivo, replay de reset de estado GDN como una sola traza, escritura KV fusionada por capa) y sus pruebas de regresión numérica, lo que lo convierte en una referencia útil para quien porte modelos a Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B; inferencia con decodificación especulativa DFlash sobre vLLM en Tenstorrent Blackhole |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla en la información disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 262.144 tokens por petición; 8 slots concurrentes; caché KV de 2.127.111 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos descargados desde Qwen/Qwen3.8-27B; el bundle instala código, plugin y kernels en un venv propio (no se especifica el formato de los ficheros) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros según la denominación del repositorio. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación; tampoco se especifica la arquitectura interna (número de capas, dimensiones, tipo de atención). Sí aparece una referencia a estado GDN, lo que sugiere componentes de estado recurrente o híbrido en el modelo base, pero no se confirma su naturaleza exacta.

La innovación técnica de este bundle está en la pila de servicio, no en el entrenamiento. Se emplea decodificación especulativa DFlash, cuyo rendimiento depende de la tasa de aceptación de tokens draft (varía un 10-20% entre ejecuciones para una misma fila de benchmark). El bundle incluye optimizaciones concretas: `QWEN36_KV_DEVICE_INIT=1` rellena el pool de caché KV en el dispositivo en lugar de construirlo en host y copiarlo, con autotest de arranque que compara el llenado en dispositivo con ceros de host; `QWEN36_GDN_RESET_TRACE=1` convierte las 288 copias de puesta a cero por petición del estado GDN en una única traza capturada; y `QWEN36_KV_UPDATE_FOLD=1` escribe K y V de cada capa de atención para todas las filas de verificación en un solo programa en lugar de 56-64, con autotest de comparación bit a bit que impide el arranque si hay divergencia. Cada cambio se validó contra la referencia numérica de cp0 con salida exacta en 6 prompts de referencia, comprobaciones de prefix cache, recuperación hasta 22K y sonda completa de 262.144 tokens.

## Capacidades

- Generación de texto y razonamiento con modo thinking, controlable mediante el parser `qwen3` y con esfuerzo de razonamiento `medium` por defecto.
- Tool calling y function calling con el parser `qwen3_coder`, orientado a flujos de agentes y código.
- Procesamiento de imágenes: hasta 4 por petición, con reescalado a aproximadamente 1 megapíxel (límite del encoder visual: 4.095 parches de 16x16 px). No soporta vídeo.
- Contexto largo verificado: recuperación de información entre 196K y 262K tokens y decodificación hasta la posición 262.126; las peticiones por encima del límite devuelven HTTP 400.
- Salida repetible: peticiones greedy y peticiones muestreadas con `seed` fija producen texto idéntico en repeticiones, incluso con otros usuarios siendo atendidos y con respuestas servidas desde la caché de prefijo.
- Prefix caching: una conversación reenviada o extendida reanuda desde el último bloque cacheado de 4.096 tokens; se requiere un mínimo de 4.096 tokens compartidos para que haya acierto.
- API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Presupuesto de razonamiento opcional en servidor (`TT_THINK_BUDGET`) para limitar los 15-30K tokens que el modelo puede gastar razonando antes de responder o llamar a una herramienta en turnos de agente.
- Concurrencia de 8 usuarios con contexto completo cada uno.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto y 8 slots simultáneos, el modelo puede mantener conversaciones multi-turno con historiales extensos y documentación de producto adjunta sin truncar, y el prefix caching evita reprocesar el prompt en cada turno de una conversación reenviada.
- Agentes de código en producción: el parser `qwen3_coder` habilita tool calling estructurado, y el límite `TT_THINK_BUDGET` (por ejemplo, 6.144 tokens) evita que el agente parezca bloqueado mientras el modelo razona antes de emitir una llamada a herramienta.
- Análisis de documentos largos y recuperación de información: la ventana verificada hasta 262K tokens permite pasar contratos, informes o bases de código completas en una sola petición y consultar detalles concretos en posiciones profundas del contexto.
- Procesamiento de capturas y documentos escaneados: admite hasta 4 imágenes por petición con reescalado a ~1 MP, adecuado para capturas de móvil, diagramas y formularios; útil en clasificación y extracción de datos, teniendo en cuenta que las peticiones con imagen hacen prefill de una en una.
- Evaluación reproducible y testing de pipelines: la determinación bit a bit con temperatura 0 o semilla fija, incluyendo respuestas desde caché de prefijo, permite usar el modelo como referencia en tests de regresión de sistemas LLM.
- Despliegue en infraestructura no-NVIDIA: organizaciones con placas Tenstorrent p300c pueden servir un modelo de 27B con contexto de 256K mediante `tt-model pull` y `tt-model serve`, con API compatible con OpenAI, sin depender de CUDA.
- Generación de código por lotes: con 4 usuarios y 128/1024 tokens de entrada/salida se obtienen 120,1 tok/s agregados, una cifra razonable para tareas de completado y generación de tests en pipelines internos.

## Benchmarks y rendimiento

Rendimiento medido con `vllm bench serve` sobre dos placas p300c (4 chips), endpoint de chat, temperatura 0 (carril DFlash), EOS ignorado, 4 prompts por usuario. "tok/s por usuario" se calcula como 1000 / tiempo medio por token de salida.

| Entrada / salida (tokens) | Usuarios | tok/s por usuario | tok/s totales |
|---|---|---|---|
| 128 / 128 | 1 | 78,4 | 71,2 |
| 1024 / 128 | 1 | 70,4 | 58,8 |
| 128 / 1024 | 1 | 53,9 | 53,5 |
| 128 / 128 | 4 | 52,1 | 162,9 |
| 1024 / 128 | 4 | 42,8 | 131,2 |
| 128 / 1024 | 4 | 34,5 | 120,1 |
| 128 / 1024 | 8 | 26,3 | 183,8 |

Frente a QB2-cp0, medido de la misma forma, cada fila es un 2-4% más rápida. El throughput de DFlash depende de cuántos tokens draft se aceptan, de modo que las filas individuales varían un 10-20% entre ejecuciones.

Tiempos de arranque: la primera puesta en marcha sobre una instalación nueva (conversión de pesos y compilación de kernels) tarda 15-20 minutos; con cachés calientes, unos 2 minutos (130 s en dos placas p300c, frente a los ~165 s de cp0).

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Acelerador: dos placas Tenstorrent p300c, 4 chips Blackhole en malla 1x4 con FABRIC_1D. No es un despliegue sobre GPU NVIDIA o AMD.
- Host: SFPI exactamente 7.78.0 (build 935), en `/opt/tenstorrent/sfpi` o descomprimido en `venv/lib/python3.12/site-packages/ttnn/runtime/sfpi` (preferido por `run.sh`). `install.sh` rechaza otra versión de SFPI porque una más nueva falla la compilación de kernels.
- Toolchain: `install.sh` usa uv 0.12.11 e instala esa versión dentro del bundle si el host tiene otra.
- Memoria: no se especifica VRAM ni HBM requerida para el modelo base de 27B; la caché KV declarada es de 2.127.111 tokens, suficiente para los 8 slots a contexto completo.
- Despliegue: `tt-model pull mando2222/qwen3.8-27b-QB2` y `tt-model serve mando2222/qwen3.8-27b-QB2`. El bundle instala código, plugin y kernels en un venv propio; los pesos se descargan en el primer uso.
- Otras pilas (vLLM genérico, llama.cpp, Ollama, TGI) no están documentadas para este bundle; el servidor expone API compatible con OpenAI.
- Latencia y throughput: ver tabla de la sección anterior. El carril no especulativo (para `n`>1, penalizaciones de frecuencia o repetición, `min_p`, `min_tokens`, log-probs, salida estructurada, `logit_bias` o `bad_words`) es más lento que el carril DFlash.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas. La comparación relevante es de plataforma de despliegue:

| Criterio | Qwen3.8-27B-QB2 (este bundle) | Despliegue vLLM convencional sobre GPU | Despliegue llama.cpp / GGUF |
|---|---|---|---|
| Hardware | 2x p300c Tenstorrent, 4 chips Blackhole | GPU NVIDIA/AMD | CPU, GPU consumer |
| Contexto | 262.144 tokens, 8 slots | Depende de la configuración | Limitado por memoria del host |
| Decodificación especulativa | DFlash integrado | Disponible según configuración | Limitada |
| Licencia | Apache 2.0 | Según modelo y pila | Según modelo y pila |
| Madurez del ecosistema | Nicho, requisitos de versión estrictos (SFPI 7.78.0) | Alta | Alta |

Comparación con modelos de 27B de otros fabricantes: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Contexto máximo de 262.144 tokens por petición y 8 slots; las peticiones que lo exceden reciben HTTP 400.
- Imágenes: máximo 4 por petición; las mayores se reescalan a ~1 MP (por ejemplo, una captura de móvil de 1290x2796 se procesa a ~672x1472). No hay soporte de vídeo. Las peticiones con imagen hacen prefill de una en una, lo que limita el throughput en cargas multimodales.
- El prefix caching exige al menos 4.096 tokens compartidos y reanuda desde el último bloque de 4.096, no desde el token exacto.
- Las peticiones que necesitan `n`>1, penalizaciones de frecuencia o repetición, `min_p`, `min_tokens`, log-probs, salida estructurada, `logit_bias` o `bad_words` se envían al carril no especulativo, más lento.
- En modo de razonamiento con esfuerzo medio, el modelo puede consumir 15-30K tokens antes de responder o llamar a una herramienta, lo que en agentes se percibe como un turno bloqueado; el límite `TT_THINK_BUDGET` está desactivado por defecto y solo afecta a turnos de chat en streaming.
- Dependencia estricta de SFPI 7.78.0 (build 935) y uv 0.12.11; versiones más nuevas rompen la compilación de kernels. La primera puesta en marcha tarda 15-20 minutos.
- El throughput de DFlash varía un 10-20% entre ejecuciones para una misma fila, lo que complica el dimensionamiento de capacidad.
- No se documentan sesgos, tasas de alucinación ni cobertura de idiomas del modelo base en la información disponible; deben consultarse en la model card de Qwen/Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener términos adicionales que conviene verificar en su repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las cifras declaradas.

## Enlaces

- Repositorio del bundle: https://huggingface.co/mando2222/qwen3.8-27b-QB2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Tenstorrent (referencia de plataforma): no disponible en la información proporcionada
- Paper o blog de DFlash: no disponible en la información proporcionada
- Repositorio de vLLM: no disponible en la información proporcionada
- Demos: no disponibles
