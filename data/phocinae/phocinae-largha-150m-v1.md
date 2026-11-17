# Phocinae/Phocinae-Largha-150M-v1

## Resumen

Phocinae-Largha-150M-v1 (Largha) es un modelo de decisión tipada de 144,3 millones de parámetros, desarrollado por Phocinae y publicado bajo licencia Apache-2.0. No es un modelo conversacional: recibe un texto de estado (`state`) junto con una o varias preguntas tipadas —`noul` (sí/no), `choice` (selección única entre opciones) y `score` (puntuación entera de 2 a 10)— y devuelve respuestas con confianza calibrada en un único pase hacia delante, sin generar tokens de salida. Está afinado a partir del modelo base jhu-clsp/mmBERT-small, un encoder multilingüe de la familia ModernBERT.

El modelo aborda un problema concreto en pipelines de agentes y sistemas de guardarraíles: sustituir llamadas a LLMs generativos por un clasificador pequeño y determinista cuando la tarea se reduce a tomar una decisión discreta (aprobar o denegar una acción, elegir una opción, puntuar un criterio). Al no emitir tokens y ser insensible al orden de las opciones, reduce coste y latencia, y puede ejecutarse en CPU sin GPU. Su ventana de decisión está limitada a 512 tokens en la configuración de fábrica, pese a que el encoder base soporta hasta 8192 posiciones.

La relevancia actual del modelo radica en su propuesta de "puerta de escalado": usar Largha para resolver decisiones de alta confianza y derivar al LLM externo solo los casos inciertos. El autor reporta una reducción del 55,0% en llamadas a LLM externo con umbral τ=0,6. No obstante, la model card incluye una corrección explícita: la cifra principal anterior de 0,906 se midió sobre una partición parcialmente vista y la puntuación limpia reestimada por los mantenedores del benchmark es 0,791.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-small / ModernBERT): hidden 384, 22 capas, 6 cabezas, vocabulario de 256k, RoPE, atención deslizante más atención global; cabeza de decisión con ventana de atención de 192 |
| Parámetros totales | 144.292.870 (144,3M), dtype F16 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Encoder base hasta 8192 posiciones; configuración de fábrica trunca a `max_len: 512` (estado + preguntas + opciones combinados) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (modelo base mmBERT-small: MIT) |
| Formato de pesos | safetensors (288,6 MB en fp16; sha256 `b6472511eea30729985374f43968cf7f4b16bbe0827de6c6ca07cf92afbb778a`) |

## Arquitectura y entrenamiento

Largha se construye sobre jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT con 22 capas, dimensión oculta de 384 y 6 cabezas de atención. El encoder combina atención deslizante con atención global y usa RoPE, lo que le permite en teoría procesar secuencias de hasta 8192 posiciones; sin embargo, la configuración de fábrica del modelo limita la entrada a 512 tokens. Sobre esta base se añade una cabeza de decisión específica con una ventana de atención de 192, que produce directamente etiquetas tipadas (`noul`, `choice`, `score`) con una puntuación de confianza asociada.

El modelo se ha afinado sobre el dataset LocalLLaMA/typed-decisions. La model card reconoce que la versión v1.1 del mezcla de entrenamiento incluyó un conjunto de 500 ejemplos de corrección extraídos a partir de predicciones sobre filas de test, lo que contamina parcialmente la evaluación. No se detalla el número total de tokens de entrenamiento ni la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no es arquitectónica sino de interfaz: salida de cero tokens, invariancia al orden de las opciones (tasas de volteo reportadas entre 0,0144 y 0,0283) y confianza calibrada, con una columna de calibración opcional en `calib/` que reduce el ECE de 0,2519 a 0,0168 en inglés a costa de empeorar el Brier de 0,0207 a 0,1218.

## Capacidades

- Clasificación de decisiones tipadas: responde preguntas de tipo `noul` (booleano sí/no), `choice` (selección única entre opciones, devuelve índice base 0) y `score` (entero de 2 a 10).
- Salida con confianza calibrada por respuesta, utilizable para umbrales de escalado.
- Invariancia al orden de las opciones: la respuesta no depende de la posición de las alternativas en la lista.
- Ejecución sin generación de tokens: una sola pasada hacia delante, sin decodificación autoregresiva.
- Capacidad bilingüe inglés-chino, aunque la evaluación en chino es sobre casos traducidos automáticamente y dentro de la mezcla de entrenamiento, no como transferencia zero-shot.
- Ejecución en CPU (single-thread p50 de 1,64 s por caso; 8 hilos en batch: 8-20 decisiones por segundo) y en GPU (fp16 p50 de 21,0 ms por decisión en RTX 5090, no reproducido de forma independiente).
- Uso como guardarraíl o puerta de seguridad en agentes: ejemplo de la model card con denegación de borrado de base de datos en producción.
- No soporta tool calling ni function calling en el sentido de los LLMs generativos; su función es clasificar, no invocar herramientas.
- No soporta razonamiento multi-paso ni modo de pensamiento.

## Casos de uso

- Guardarraíl de acciones en agentes: antes de ejecutar una acción destructiva (borrar una base de datos, purgar copias de seguridad), Largha evalúa el estado y la pregunta de permiso y devuelve un `noul` con confianza; si la confianza supera el umbral, se bloquea o permite sin consultar al LLM principal.
- Puerta de escalado para reducir coste de LLM: en un pipeline con un LLM externo, Largha resuelve primero las decisiones de alta confianza y solo deriva al LLM las inciertas; el autor reporta una reducción del 55,0% de llamadas externas con τ=0,6 y una mejora de 0,0876 en exactitud sobre el conjunto retenido.
- Enrutamiento de tickets o solicitudes: dado el estado de una petición y un conjunto de categorías, el modelo elige la opción adecuada (`choice`) con una confianza que permite derivar casos ambiguos a revisión humana.
- Puntuación de criterios en evaluación de candidatos o contenidos: con la pregunta `score` de 2 a 10, se puntúa un criterio concreto (por ejemplo, experiencia en ingeniería de backend) sobre el texto de estado, integrándose en un pipeline de cribado.
- Validación de lotes en procesos administrativos: el ejemplo de la model card muestra la decisión entre aprobar un lote de facturas, reintentar el procesamiento o marcarlo para revisión humana, con puntuaciones de 0,62, 0,24 y 0,14 respectivamente.
- Despliegue en entornos on-premise sin GPU: al requerir aproximadamente 1,6 GB de VRAM o 1,8 GB de RAM y poder ejecutarse en CPU, es adecuado para entornos con restricciones de hardware o de confidencialidad donde no se permite enviar datos a la nube.
- Filtrado previo en pipelines de moderación o cumplimiento: clasificación binaria de si un contenido o una acción cumple una política, con umbral de confianza para escalar los casos dudosos.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado | Notas |
|---|---|---|
| typed-decisions en (curated) | 0,791 | Reestimación limpia de los mantenedores del benchmark; la cifra anterior de 0,906 se midió sobre una partición parcialmente vista |
| typed-decisions en, subconjunto contaminado (500) | 0,198 | Lectura limpia sobre las 500 filas contaminadas |
| typed-decisions en, subconjunto no tocado (1.500) | 0,989 | Lectura limpia sobre filas no vistas en entrenamiento |
| typed-decisions zh | 0,848 | Evaluación in-mix sobre casos traducidos automáticamente, no zero-shot |
| Laya (mismo protocolo) | 0,766 | Clase de medición distinta; no directamente comparable |
| JEV-27B (mismo protocolo) | 0,727 | Clase de medición distinta; no directamente comparable |
| meraGPT (mismo protocolo) | 0,768 | Clase de medición distinta; no directamente comparable |
| JevBench public-231 | 0,5455 (126/231) | Por debajo de la mayoría de sistemas del ranking; el benchmark no tiene puerta de puntuación |
| Tasa de volteo por orden de opciones (CPU fp32) | flip150 0,0200; flip400 0,0217; random-mean 0,0144; any 0,0283 | Menor es mejor |
| ECE (calibración de fábrica) | 0,2519 (en) / 0,1941 (zh) | Columna opcional en `calib/`: 0,0168 / 0,0152 |
| Brier (calibración de fábrica) | 0,0207 | Con la columna opcional sube a 0,1218 |
| Latencia GPU fp16 p50 | 21,0 ms por decisión | RTX 5090, no reproducido de forma independiente |
| Latencia CPU single-thread p50 | 1,64 s por caso | — |
| Throughput CPU 8 hilos | 8-20 decisiones/s | — |

Advertencia del autor: la comparación con Laya, JEV-27B y meraGPT no es homogénea, porque la puntuación en inglés de Largha corresponde a un especialista ajustado sobre ese mismo protocolo, mientras que las otras filas no. Además, el gold del benchmark es la media de tres muestreos de un profesor de aproximadamente 4B, con un techo de autoconsistencia declarado de 0,735, por lo que estas cifras miden concordancia con el profesor, no corrección absoluta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB en inferencia; en RAM, aproximadamente 1,8 GB. Los pesos en fp16 ocupan 288,6 MB.
- GPU recomendadas: el autor reporta latencia en RTX 5090; por el tamaño del modelo, cualquier GPU con al menos 2 GB de VRAM es suficiente. No se han publicado mediciones en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM.
- Ejecución en CPU: sí, con p50 de 1,64 s por caso en un hilo y 8-20 decisiones por segundo con 8 hilos en batch.
- Opciones de despliegue: el runtime oficial es phocinae-server (PyTorch propio que lee directamente los safetensors del repositorio). No se debe cargar con `AutoModelForSequenceClassification` de transformers, ya que devuelve la cabeza de clasificación del modelo base y no la cabeza de decisión entrenada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; las cifras de GPU no han sido reproducidas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (typed-decisions en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phocinae-Largha-150M-v1 | 144,3M | 512 (config. de fábrica) | 0,791 curated; 0,989 en subconjunto no tocado | Apache-2.0 | Hugging Face, runtime phocinae-server |
| Laya | No disponible | No disponible | 0,766 (protocolo distinto) | No disponible | No disponible |
| JEV-27B | 27B (según nombre) | No disponible | 0,727 (protocolo distinto) | No disponible | No disponible |
| meraGPT | No disponible | No disponible | 0,768 (protocolo distinto) | No disponible | No disponible |

La comparación directa no es fiable: las puntuaciones de Laya, JEV-27B y meraGPT pertenecen a una clase de medición distinta y el propio autor advierte contra la comparación horizontal. No se dispone de datos de parámetros, contexto ni licencia de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional ni generativo: no produce texto libre y no debe usarse como chatbot.
- No se carga por la vía habitual de transformers; requiere el runtime phocinae-server. Usar `AutoModelForSequenceClassification` devuelve una cabeza incorrecta.
- Contaminación de evaluación reconocida: la mezcla de entrenamiento v1.1 incluyó 500 ejemplos de corrección derivados de predicciones sobre filas de test. La puntuación limpia en ese subconjunto es 0,198, frente a 0,989 en las 1.500 filas no tocadas.
- La puntuación en chino (0,848) es una evaluación in-mix sobre casos traducidos automáticamente, no una medida de transferencia zero-shot.
- La calibración de fábrica es deficiente (ECE 0,2519 en inglés); la columna opcional de calibración mejora el ECE pero degrada el Brier de 0,0207 a 0,1218, y no está activada por defecto.
- JevBench public-231: 0,5455, por debajo de la mayoría de sistemas del ranking; el benchmark no tiene puerta de puntuación y su admisión se basa en coste, latencia y contaminación.
- Contexto efectivo limitado a 512 tokens en la configuración de fábrica, pese a que el encoder base soporte 8192.
- La latencia en GPU (21,0 ms) no ha sido reproducida de forma independiente.
- Riesgo de sesgo y alucinación: no se documentan análisis de sesgo en la información disponible; al ser un clasificador, el riesgo de alucinación se manifiesta como clasificaciones erróneas con confianza alta, mitigable con umbrales.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base mmBERT-small es MIT; conviene verificar las condiciones de ambos.
- El modelo tiene 373 descargas y 28 likes en el momento de la consulta, lo que indica una adopción todavía limitada y poca validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Phocinae/Phocinae-Largha-150M-v1
- Runtime oficial phocinae-server: https://github.com/Phocinae/phocinae-server
- Modelo base jhu-clsp/mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Figura de comparación de exactitud tipada: figures/C1_typed_acc_comparison.png (en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponible
