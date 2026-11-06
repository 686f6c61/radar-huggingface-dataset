# chaoliangUNSW/Jev-Style-2B-Decision-v4.2-MLX

## Resumen

Jev-Style-2B-Decision-v4.2-MLX es la version cuantizada para Apple Silicon del modelo de decision Jev-Style-2B-Decision-v4.2, desarrollado por Chaoliang Yan (usuario chaoliangUNSW). No es un modelo generativo al uso: se trata de un modelo de clasificacion de texto con un runtime propio que, dado un estado textual y una o varias preguntas tipadas, devuelve una probabilidad para cada opcion suministrada. El modelo base cuenta con 1.881.825.088 parametros antes de la cuantizacion y deriva de la arquitectura Qwen 3.5.

La relevancia de esta publicacion es doble. Por un lado, ofrece variantes de precision (BF16 con activaciones FP32 y 8 bits con cuantizacion afin de grupo 64) empaquetadas en formato MLX, lo que permite ejecutar el modelo en hardware de Apple. Por otro, documenta un protocolo de inferencia cerrado y especifico (tipos de pregunta `choice`, `noul` y `score`, temperatura global fija de 0,8813575635811984, presupuesto de entrada de 32.768 tokens y un maximo de 255 opciones) que sustituye la generacion de chat convencional por un calculo de probabilidades sobre opciones.

Es un modelo de nicho, orientado a evaluacion diagnostica y a la investigacion sobre decodificacion de decisiones, no a produccion generalista. El modelo original obtuvo 46,74 en la suite publica Decision Index 0.3, medido con la version PyTorch BF16 sobre CUDA y con 140.178 peticiones puntuadas correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.5 (familia indicada en los tags); runtime de decision propio |
| Parametros totales | 1.881.825.088 (antes de cuantizacion) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens de presupuesto de entrada; maximo 255 opciones por peticion |
| Tipos de cuantizacion | BF16 (activaciones FP32) y 8 bits afin con grupo 64 (activaciones BF16 nativas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (los pesos; no relicencia datos de terceros ni salidas del profesor) |
| Formato de pesos | safetensors (MLX); incluye `macjev_norms_fp32.safetensors`, `release_config.json`, `readout_config.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 1,88 mil millones de parametros, encuadrado en la familia Qwen 3.5 segun los tags del repositorio. Sobre esa base se anade una cabeza de lectura (readout) especifica: los estados ocultos del veredicto se combinan mediante producto escalar con la diferencia entre las filas de embedding de "si" y "no" (embeddings atados), y el resultado se normaliza con softmax para producir una probabilidad por opcion. El orden de las opciones se preserva en la salida.

El entrenamiento sigue el linaje v4, que incluye destilacion de etiquetas suaves desde la API TypeSafe Jev 1.14 y material de entrenamiento generado y de fuentes upstream. No se detalla en la informacion disponible el volumen total de tokens ni la composicion exacta del dataset. La atencion utiliza un protocolo de atencion por bloques entrenado, con calculo compartido del estado para multiples preguntas en una misma peticion, lo que reduce el coste cuando se evaluan varios interrogantes sobre el mismo estado.

La innovacion principal no esta en el transformer sino en el contrato de inferencia: tipos de pregunta cerrados (`choice`, `noul`, `score`), temperatura global fija, rechazo explicito de peticiones que exceden el presupuesto (32.768 tokens o 255 opciones) y un runtime que fija y verifica internals de mlx-lm 0.31.3. El autor advierte explicitamente de que debe usarse este runtime de decision y no la generacion de chat estandar.

## Capacidades

- Clasificacion de texto con salida probabilistica: devuelve una probabilidad para cada opcion suministrada, no texto libre.
- Tres tipos de pregunta: `choice` (eleccion entre opciones), `noul` y `score`.
- Evaluacion multi-pregunta sobre un mismo estado, con calculo compartido del estado oculto.
- Entrada en texto plano y en JSON.
- Presupuesto de contexto amplio: hasta 32.768 tokens y hasta 255 opciones por peticion.
- Modo texto unicamente: las imagenes deben procesarse con el modelo principal de HuggingFace, no con esta variante.
- No soporta tool calling, function calling ni razonamiento multi-paso de agente en el sentido convencional; su funcion es puntuar opciones.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion diagnostica de modelos: el runtime permite puntuar sistematicamente respuestas candidatas frente a un estado y un conjunto de opciones, util para construir suites de evaluacion reproducibles como Decision Index.
- Clasificacion con etiquetas ponderadas: en lugar de una etiqueta unica, se obtiene una distribucion de probabilidad sobre opciones, lo que sirve para umbrales ajustables en moderacion de contenido o triaje.
- Anotacion asistida de datasets: dado un texto y una pregunta de tipo `choice`, el modelo genera probabilidades por opcion que pueden usarse como etiquetas suaves para entrenar otros clasificadores.
- Investigacion sobre decodificacion de decisiones: la temperatura global fija y el readout por diferencia de embeddings permiten estudiar calibracion y sesgos de veredicto de forma controlada.
- Procesamiento por lotes de preguntas sobre documentos largos: con 32.768 tokens de entrada y calculo compartido de estado, se pueden lanzar varias preguntas sobre un mismo documento en una sola pasada.
- Prototipado local en Mac: al estar en formato MLX con variante de 8 bits, permite experimentar en Apple Silicon sin GPU dedicada, adecuado para pruebas de concepto y validacion de pipelines antes de escalar a CUDA.
- Filtrado previo en pipelines de datos: puntuar pares estado-pregunta para descartar o priorizar muestras antes de un procesamiento mas costoso.

## Benchmarks y rendimiento

| Suite | Resultado | Configuracion de medida |
|---|---|---|
| Decision Index public 0.3 (completa) | 46,74 | Modelo original PyTorch BF16 sobre CUDA; 140.178 peticiones puntuadas correctamente |

No se han publicado resultados de benchmarks para esta variante MLX en la informacion disponible. El dato de 46,74 corresponde al modelo original y no debe atribuirse a la version cuantizada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, un modelo de 1,88 mil millones de parametros ocupa aproximadamente 3,8 GB en BF16 y en torno a 2 GB en 8 bits, sin contar overhead del runtime.
- Hardware objetivo: Apple Silicon (el repositorio usa MLX y requiere Python 3.12).
- GPU dedicadas (CUDA): no soportadas por esta variante; el autor remite al modelo original para ese entorno.
- Cabe en equipos consumer de Apple con memoria unificada suficiente para los pesos mas el estado de atencion; no se especifica el minimo exacto.
- Despliegue: runtime propio `jev_style_decision_mlx.py` con mlx-lm 0.31.3 fijado; no se contempla vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Jev-Style-2B-Decision-v4.2-MLX | 1,88 B | 32.768 tokens | Clasificacion probabilistica con runtime propio | Apache-2.0 | safetensors MLX |
| Jev-Style-2B-Decision-v4.2 (original) | 1,88 B | 32.768 tokens | Igual, con soporte de imagenes | Apache-2.0 | PyTorch |
| Clasificadores transformer genericos de ~2 B | ~2 B | variable | Clasificacion con cabeza supervisada | variable | safetensors |

No se dispone de comparativas con modelos de la misma categoria en la informacion proporcionada; el modelo no tiene equivalentes publicos directos conocidos con este protocolo de decision.

## Limitaciones y advertencias

- No es un modelo de chat: usar generacion estandar produce resultados invalidos; el autor exige el runtime de decision propio.
- Dependencia estricta de mlx-lm 0.31.3: el runtime fija y verifica internals, por lo que actualizaciones de la libreria pueden romper la compatibilidad.
- Solo texto: no procesa imagenes, a diferencia del modelo principal.
- Presupuesto duro de 32.768 tokens y 255 opciones; las peticiones que lo exceden se rechazan, no se truncan.
- Idiomas soportados no documentados: riesgo de comportamiento degradado fuera del idioma o idiomas de entrenamiento.
- Riesgo de alucinacion y calibracion: al producir probabilidades sobre opciones, la fiabilidad depende de la calidad del readout y del entrenamiento por destilacion; no hay garantia de calibracion fuera de la suite evaluada.
- Licencia: Apache-2.0 cubre los pesos, pero no relicencia datos de terceros ni salidas del profesor (TypeSafe Jev 1.14); es necesario revisar `LICENSE`, `NOTICE` y la model card del modelo padre antes de uso comercial.
- Falta de afiliacion con TypeSafe: JevStyle se mantiene de forma independiente, sin aval de TypeSafe.
- Sin descargas ni likes en el momento de la consulta y sin benchmarks publicados para la variante MLX: madurez y soporte comunitario limitados.
- El rendimiento de 46,74 en Decision Index 0.3 corresponde al modelo original en CUDA BF16; no se ha verificado para las variantes MLX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2-MLX
- Modelo base: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2
- Bundle de resultados de evaluacion: https://huggingface.co/datasets/chaoliangUNSW/decision-index-results-v4.2
- Model card del modelo principal (linaje, entrenamiento y detalles de la release diagnostica): https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4.2
