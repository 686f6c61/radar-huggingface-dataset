# Phocinae/Phocinae-Largha-150M-v1

## Resumen

Phocinae-Largha-150M-v1 (nombre en chino: 斑海豹, "foca moteada") es un modelo bilingüe de 144,3 millones de parámetros especializado en decisiones estructuradas, desarrollado por Phocinae. No es un modelo conversacional: recibe un `state` y una lista de preguntas tipadas (`noul` de sí/no, `choice` de elección única y `score` de 2 a 10) y devuelve respuestas calibradas con un valor de confianza en un único forward pass, ejecutándose en hardware propio. Su propuesta central es sustituir llamadas repetitivas a APIs de LLM grandes (selección de herramientas, aprobación de comandos, comprobación de pasos, filtrado de salidas) por un motor local determinista.

La arquitectura se apoya en una base mmBERT-small (arquitectura tipo ModernBERT): 384 de dimensión oculta, 22 capas, 6 cabezas de atención, tokenizador de 256k de vocabulario, RoPE combinado con atención de ventana deslizante y atención completa. El contexto base es de 8192 tokens y la cabeza por defecto procesa 512 tokens. Los pesos ocupan 288,6 MB y el pico de memoria en inferencia es de 1,6 GB, lo que permite ejecutarlo en una GPU de consumo corriente.

Su relevancia práctica se debe a dos cifras: 18,6 ms de latencia p50 en GPU en fp16 por decisión (frente a más de 1,5 s de ida y vuelta contra una API) y una puerta de confianza con umbral τ=0,6 que reduce un 54,4 % el tráfico hacia un LLM mayor, subiendo la precisión del subconjunto retenido de 0,797 a 0,886. El modelo se licencia bajo Apache 2.0 según la propia model card, aunque el metadato de HuggingFace no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ModernBERT (base mmBERT-small), con RoPE, atención de ventana deslizante y atención completa |
| Parametros totales | 144.292.870 (144,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens de base; cabeza por defecto de 512 tokens |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés y chino (bilingüe; el modelo declara precisión en zh sin filas de entrenamiento en zh) |
| Licencia | Apache 2.0 según la model card; el metadato de HuggingFace no declara licencia |
| Formato de pesos | safetensors (288,6 MB) |
| Dimension oculta | 384 |
| Capas | 22 |
| Cabezas de atencion | 6 |
| Vocabulario | 256k tokens |
| Pico de VRAM en inferencia | 1,6 GB |
| Latencia (GPU fp16, p50) | 18,6 ms por decisión |
| Contexto de entrenamiento declarado | No disponible |

## Arquitectura y entrenamiento

El modelo parte de la familia mmBERT-small y adopta el diseño de ModernBERT: un transformer encoder con RoPE en lugar de embeddings posicionales absolutos, atención de ventana deslizante combinada con capas de atención completa, y un tokenizador de 256k de vocabulario. El tamaño es contenido (384 de dimensión oculta, 22 capas, 6 cabezas) y la salida no es texto libre, sino un conjunto de respuestas tipadas con tres modalidades: decisión binaria (`noul`), elección entre opciones (`choice`) y puntuación en escala de 2 a 10 (`score`).

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon fases de RLHF o DPO; esa información figura como no disponible. Sí se documentan dos mecanismos de calibración aplicados en inferencia: temperaturas de calibración de 0,7698, 0,7879 y 0,7560, y un ECE de la columna enviada de 0,1313. El modelo también se presenta como robusto al reordenamiento de opciones, con métricas específicas de flip (flip150 y flip400 de 0,0300, random-mean de 0,0233 y "any" de 0,0433 en CPU fp32). La inferencia es determinista, lo que permite auditar y reproducir cada decisión.

## Capacidades

- Toma de decisiones estructuradas con salidas tipadas: respuestas sí/no (`noul`), elección única entre opciones (`choice`) y puntuación de 2 a 10 (`score`).
- Devolución de confianza calibrada junto a cada respuesta, apta para construir puertas de enrutado por umbral.
- Enrutado hacia un LLM mayor mediante puerta de escalado (τ=0,6), con ganancia de precisión en el subconjunto retenido y reducción de coste.
- Selección de herramientas (tool selection): 12/12 en la tarea tool_selection de JevBench con k≤10.
- Robustez al reordenamiento de opciones, lo que reduce el sesgo posicional en decisiones de elección.
- Capacidad bilingüe inglés-chino, con precisión declarada en zh (0,789) sobre casos traducidos y sin filas de entrenamiento en zh.
- Adecuado para decisiones de un solo forward pass, no para generación de texto libre ni conversación multi-turno.
- Ejecución local con inferencia determinista, sin salida de datos a servicios externos.

## Casos de uso

- Aprobación de comandos en agentes: interceptar operaciones peligrosas (por ejemplo `rm -rf`) en 18,6 ms y decidir con `noul`; la model card documenta p(deny)=0,96 para ese caso concreto.
- Selección de herramientas en agentes: elegir qué herramienta invocar entre un conjunto (k≤10) antes de llamar al LLM mayor, aprovechando el 12/12 en tool_selection de JevBench.
- Enrutado con ahorro de coste: usar la confianza calibrada con τ=0,6 para enviar solo el 45,7 % de las decisiones al LLM grande, reduciendo un 54,4 % las llamadas (82,8 % con τ=0,5).
- Filtrado y cribado de salidas: puntuar respuestas o resultados en escala 2-10 para descartar los de baja calidad antes de mostrarlos al usuario.
- Comprobación de pasos en pipelines multi-step: validar si un paso intermedio cumple las condiciones esperadas antes de continuar el flujo.
- Clasificación y triaje en tiempo real: dado que cada decisión cuesta 18,6 ms en GPU, encaja en rutas síncronas de baja latencia donde una API externa añadiría más de un segundo de ida y vuelta.
- Procesamiento por lotes en CPU: con 8 hilos se obtienen de 8 a 21 decisiones/s, suficiente para tareas por lotes sin GPU.
- Despliegue con soberanía de datos: al ejecutarse en hardware propio y no enviar nada fuera, sirve para entornos con requisitos de privacidad o auditoría.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| typed-decisions en (400 casos / 2000 decisiones) | 0,797 |
| typed-decisions zh (casos traducidos, sin filas de entrenamiento zh) | 0,789 |
| JevBench public-231 | 0,5108 (118/231), por debajo del umbral del 58,4 % |
| JevBench tool_selection | 12/12 |
| ECE de la columna enviada | 0,1313 |
| Temperaturas de calibración | 0,7698 / 0,7879 / 0,7560 |
| Enrutado escalado (τ=0,6) | +0,089 de precisión en subconjunto retenido (0,797→0,886); −54,4 % de coste LLM (82,8 % con τ=0,5; 45,7 % de decisiones escaladas) |

Robustez al reordenamiento de opciones (menor es mejor), CPU fp32:

| Metrica | Valor |
|---|---|
| flip150 | 0,0300 |
| flip400 | 0,0300 |
| random-mean | 0,0233 |
| any | 0,0433 |
| GPU fp16 (nota) | 0,027 / 0,028 |

Latencia:

| Escenario | Valor |
|---|---|
| GPU fp16 p50 | 18,6 ms por decisión |
| CPU monohilo p50 | 1,51 s por caso (1 estado + 5 preguntas, un forward pass); ≈0,28 s por decisión |
| CPU 8 hilos (lote) | 8-21 decisiones/s |
| CPU en caliente, 20 hilos (1 estado + 3 preguntas) | ≈51 ms por llamada, ≈17 ms por decisión |

## Requisitos de hardware

- Weights: 288,6 MB; pico de VRAM en inferencia: 1,6 GB, según la model card.
- GPU fp16: latencia p50 de 18,6 ms por decisión. Cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutarlo.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), dado el pico de 1,6 GB.
- CPU: monohilo con 1,51 s por caso (≈0,28 s por decisión); con 8 hilos en lote, 8-21 decisiones/s; con 20 hilos en caliente, ≈51 ms por llamada (≈17 ms por decisión).
- Opciones de despliegue: el runtime oficial es phocinae-server (servicio FastAPI local). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- No se publican datos de throughput en GPU más allá de la latencia p50 por decisión.

## Comparativa con modelos similares

Comparativa sobre el mismo protocolo de typed-decisions (400 casos / 2000 decisiones), según los datos de la model card:

| Modelo | typed-decisions (mismo protocolo) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phocinae-Largha-150M-v1 | 0,797 (en) / 0,789 (zh) | 144,3 M | 8192 base / 512 cabeza | Apache 2.0 (segun model card) | HuggingFace, GitHub, ModelScope |
| Laya | 0,766 | No disponible | No disponible | No disponible | No disponible |
| JEV | 0,727 | No disponible | No disponible | No disponible | No disponible |
| meraGPT | 0,768 | No disponible | No disponible | No disponible | No disponible |

No se dispone de especificaciones técnicas, licencias ni datos de contexto de Laya, JEV ni meraGPT más allá de su precisión en este protocolo concreto.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogo multi-turno; está diseñado para decisiones de un solo forward pass.
- JevBench public-231 se sitúa en 0,5108 (118/231), por debajo del umbral del 58,4 %, algo que la propia model card declara abiertamente; el rendimiento en esa tarea es limitado.
- Riesgo de alucinación y de decisiones erróneas: aunque la salida esté calibrada (ECE 0,1313), un ECE de esa magnitud implica desviación entre confianza y acierto; conviene usar la puerta de escalado antes de confiar decisiones críticas.
- Sesgo posicional: aunque se documenta robustez al reordenamiento (flip150/flip400 de 0,0300; "any" de 0,0433), no es cero, por lo que el orden de opciones puede seguir influyendo en algunos casos.
- Contexto limitado: 8192 tokens de base y 512 en la cabeza por defecto, insuficiente para documentos o historiales muy largos.
- Cobertura de idiomas limitada a inglés y chino; no se documentan otros idiomas.
- Licencia: la model card muestra una insignia Apache 2.0, pero el metadato de HuggingFace no declara licencia; conviene confirmar los términos antes de un uso comercial.
- Trazabilidad de datos de entrenamiento: no se publican tokens, composición del dataset ni fases de alineación (RLHF/DPO), lo que dificulta evaluar sesgos de origen.
- El repositorio de pesos no incluye el runtime: phocinae-server distribuye la ejecución, no los pesos, que deben descargarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/Phocinae/Phocinae-Largha-150M-v1
- GitHub: https://github.com/Phocinae/Phocinae-Largha-150M-v1
- Runtime oficial (phocinae-server): https://github.com/Phocinae/phocinae-server
- ModelScope: https://modelscope.cn/models/PerryLink/Phocinae-Largha-150M-v1
- Landing page: https://phocinae.github.io/Phocinae-Largha-150M-v1/
- BENCHMARKS.md: https://github.com/Phocinae/Phocinae-Largha-150M-v1/blob/main/BENCHMARKS.md
- Documentación de costes: https://github.com/Phocinae/Phocinae-Largha-150M-v1/blob/main/docs/cost-savings.md
- Galería de escenarios: https://github.com/Phocinae/Phocinae-Largha-150M-v1/blob/main/docs/gallery/README.md
- Galería en chino: https://github.com/Phocinae/Phocinae-Largha-150M-v1/blob/main/docs/gallery/README_cn.md
- FAQ en chino: https://github.com/Phocinae/Phocinae-Largha-150M-v1/blob/main/docs/faq.zh.md
