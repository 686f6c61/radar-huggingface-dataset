# Compactbot/bananamind-3-2.5m-lft

## Resumen

BananaMind 3 2.5M (LFT) es un modelo de lenguaje de 2.520.704 parámetros entrenado desde cero por el usuario @Compactbot, a petición de @Banaxi-Tech dentro de la familia BananaMind 3. Se trata de un ejercicio de arquitectura más que de un generador de texto utilizable: implementa un transformer con pesos compartidos (looped transformer, estilo Universal Transformer) en el que solo existen 6 bloques reales que se ejecutan 14 veces, de modo que el modelo alcanza profundidad efectiva con un presupuesto de parámetros extremadamente reducido.

La relevancia del modelo es acotada y hay que enmarcarla correctamente. Con d_model 128, 2 cabezas de atención, FFN de 240 y una ventana de contexto de 512 tokens, el autor documenta explícitamente que la generación es «superficialmente gramatical» pero semánticamente incoherente, y que en las tres tareas evaluadas (ARC-Easy, HellaSwag y PIQA) los resultados quedan dentro de un error estándar de la línea base aleatoria o por debajo de ella. Su interés real es servir de referencia reproducible para estudiar el reparto de pesos y la profundidad efectiva a escala mínima, además de como baseline documentado de la familia BananaMind 3.

El checkpoint publicado corresponde al paso 8000 (final) del entrenamiento, con una pérdida de validación de 2,0139 (perplejidad 7,49) sobre un split retenido de 3 millones de tokens. No se han publicado variantes cuantizadas ni versiones ajustadas con RLHF o DPO, y la carga del modelo requiere una clase propia (`LFT`) en lugar de las clases estándar de `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (LFT), transformer con pesos compartidos tipo Universal Transformer |
| Parametros totales | 2.520.704 (56 tensores, verificado por cabecera de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en float32 y no se publican variantes cuantizadas |
| Idiomas soportados | Ingles (en), segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 56 tensores, float32) + `tokenizer.json` (BPE, vocabulario 12288) |
| d_model | 128 |
| Cabezas de atencion | 2 (dimension de cabeza 64) |
| Dimension de FFN | 240 |
| Bloques (compartidos) | 6, ejecutados 14 veces (indice `i % 6`) |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE (base 10000) |
| Embedding / LM head | Atados (vocabulario 12288 x 128, contado una vez) |
| Dtype | float32 |
| Desglose de parametros | Embedding 1.572.864 + 6 bloques x 157.952 = 947.712 + RMSNorm final 128 = 2.520.704 |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La innovacion central es el reparto de pesos: en lugar de apilar 14 capas independientes, el modelo define 6 bloques cuyos pesos se reutilizan a lo largo de 14 iteraciones de la misma pasada forward, con un desplazamiento de RoPE para que cada iteracion reciba informacion posicional distinta. Esto permite obtener una profundidad efectiva de 14 capas con el coste de parametros de 6, lo que a 2,5 millones de parametros es la unica forma practica de ganar profundidad sin disparar el recuento. El resto del diseño es convencional y compacto: atencion con 2 cabezas de dimension 64, FFN de 240, RMSNorm y embeddings atados con la cabeza de lenguaje, lo que reduce el coste del vocabulario (12288 x 128) al contarlo una sola vez.

El entrenamiento consumio aproximadamente 103 millones de tokens procedentes de FineWeb-Edu y DCLM (streaming, tokenizador BPE con vocabulario de 12288), con un split de validacion retenido de 3 millones de tokens. El autor senala que la peticion original era de 500 millones de tokens y que esta ejecucion consumio ~103M por limitaciones de la ventana de datos disponible en el momento del entrenamiento, por lo que se trata de un run con menos datos de los solicitados. Se realizaron 8000 pasos con batch de 64 y contexto de 512, optimizador AdamW (beta 0.9/0.95, weight decay 0.1) y una tasa de aprendizaje de 3e-4 con 200 pasos de warmup y decaimiento coseno. El entrenamiento se ejecuto en una RTX 5090 de 32 GB. No se menciona ningun ajuste posterior con RLHF, DPO u otra tecnica de alineacion.

## Capacidades

- Generacion de texto a nivel de superficie: el modelo produce texto con mayusculas iniciales, limites de frase y puntuacion correctos, pero el contenido es semanticamente incoherente segun la propia documentacion del autor.
- No hay evidencia de razonamiento, matemáticas o codigo: no se documenta ninguna evaluacion en estas areas y las tres tareas evaluadas no superan de forma estadisticamente significativa sus lineas base aleatorias.
- Soporte de tool calling / function calling: no disponible; no se documenta ningun formato de llamada a herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible; la ventana de 512 tokens y la ausencia de ajuste por instrucciones lo descartan en la practica.
- Capacidades multilingues: no; la model card declara unicamente ingles (en).
- Capacidad especial: modo «pensamiento» o vision/audio no disponibles. Lo distintivo es exclusivamente la arquitectura de pesos compartidos ejecutada 14 veces.
- Carga mediante clase propia: requiere la clase `LFT` definida en `train_bananamind3_lft.py`, que implementa la pasada forward exacta (6 bloques ejecutados 14 veces con desplazamiento de RoPE); no es un modelo estandar cargable con `AutoModelForCausalLM`.

## Casos de uso

- Estudio de reparto de pesos a escala minima: el modelo permite medir el efecto de ejecutar 6 bloques compartidos 14 veces frente a una pila de 6 u 8 capas independientes con el mismo presupuesto de parametros, aislando la variable profundidad efectiva.
- Baseline documentado de la familia BananaMind 3: sirve como punto de referencia inferior en la escalera de tamanos de la familia, con perdida de validacion (2,0139) y perplejidad (7,49) publicadas y comparables contra runs mayores.
- Pruebas de integracion de tooling de inferencia: al ser un checkpoint de 56 tensores y ~10 MB, es un caso de prueba barato para verificar cargadores de safetensors, tokenizadores BPE con vocabulario 12288 y utilidades de conversion en pipelines de CI.
- Demostracion didactica de transformers con pesos compartidos: su huella minima permite ejecutar la pasada forward completa en un portatil o en CPU y trazar como se reutilizan los mismos pesos en 14 iteraciones, algo inviable con modelos mayores.
- Medición de latencia y throughput en el extremo inferior: util para calibrar el coste fijo de un bucle de decodificacion autoregresiva (overhead de framework, tokenizacion, gestion de KV cache) con contexto de 512 tokens, independientemente de la calidad del texto.
- Despliegue en hardware restringido dentro del ecosistema BananaMindOS: el proyecto BananaMindOS documenta inferencia local en PCs de los anos 90 con modelos del ecosistema BananaMind, un escenario donde un modelo de 2,5 millones de parametros en float32 (~10 MB) es uno de los pocos que cabe en memoria y en presupuesto de computo. No se documenta que este checkpoint concreto este soportado por ese proyecto.
- Analisis de estadisticas superficiales del lenguaje: dado que captura gramatica de superficie pero no significado, resulta util para estudiar que regularidades linguisticas son aprendibles con 103M tokens y 2,5M de parametros.

## Benchmarks y rendimiento

Evaluacion zero-shot por verosimilitud (loglikelihood), 200 ejemplos por tarea, medida en el sandbox del autor contra los pesos publicados:

| Tarea | Precision | Linea base aleatoria | Diferencia |
|---|---|---|---|
| ARC-Easy | 27,5% (55/200) | 25% | +2,5 puntos (dentro de 1 error estandar) |
| HellaSwag | 28,5% (57/200) | 25% | +3,5 puntos (dentro de 1 error estandar) |
| PIQA | 45,0% (90/200) | 50% | -5,0 puntos (por debajo de la linea base) |
| Perdida de validacion | 2,0139 | No aplica | Perplejidad 7,49 sobre split retenido de 3M tokens |

Con n=200 el error estandar es de aproximadamente 3,1 puntos porcentuales, por lo que ARC-Easy y HellaSwag quedan dentro de un error estandar de sus lineas base aleatorias y no constituyen una senal fiable. El autor indica explicitamente que, con 2,5 millones de parametros, el modelo no supera ninguna de estas tareas de forma estadisticamente significativa y que las cifras se publican por transparencia, no como evidencia de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en float32 ocupan aproximadamente 10,1 MB (2.520.704 parametros x 4 bytes), a los que se suma el tokenizador y las activaciones de una ventana de contexto de 512 tokens.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria es suficiente. El autor entreno el modelo en una RTX 5090 de 32 GB, pero esa capacidad responde al entrenamiento, no a la inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de las ultimas dos decadas; tambien es viable en CPU, y es uno de los pocos modelos del ecosistema que podria ejecutarse en hardware de los anos 90 segun el planteamiento de BananaMindOS.
- Opciones de despliegue: no disponible en vLLM, llama.cpp, Ollama o TGI; al ser un transformer con pesos compartidos y no un modelo estandar de `transformers`, requiere la clase `LFT` del script de entrenamiento `train_bananamind3_lft.py` para replicar la pasada forward exacta.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de velocidad ni de tokens por segundo.
- Formato de pesos: float32 en `model.safetensors`; no se publican variantes GGUF, AWQ, GPTQ ni de otro tipo que facilitarian el despliegue en runtimes estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| BananaMind 3 2.5M (LFT) | 2,52M | 512 | Apache-2.0 | safetensors float32, 56 tensores | Requiere clase `LFT` propia |
| TinyStories-1M | ~1M (GPT-Neo) | No disponible | No disponible | safetensors | Carga estandar en `transformers` |
| TinyStories-3M | ~3M (GPT-Neo) | No disponible | No disponible | safetensors | Carga estandar en `transformers` |
| Pythia-14M | 14M | 2048 | Apache-2.0 | safetensors | Carga estandar en `transformers` |
| GPT-2 small | 124M | 1024 | MIT (segun ficha de HuggingFace) | safetensors / bin | Carga estandar en `transformers` |

La comparacion directa de rendimiento no es posible: no se dispone de resultados publicados de TinyStories-1M, TinyStories-3M, Pythia-14M o GPT-2 small bajo el mismo protocolo de evaluacion (zero-shot loglikelihood, 200 ejemplos) empleado en esta ficha. La diferencia estructural mas relevante frente a todos ellos es que BananaMind 3 2.5M no es un transformer apilado convencional, sino un modelo con pesos compartidos ejecutados varias veces, lo que lo situa en la misma familia conceptual que los Universal Transformers mas que en la de los GPT-Neo o GPT-2 reducidos. Los datos de TinyStories y Pythia proceden de sus fichas publicas; los campos marcados como no disponibles no se han podido confirmar en la informacion proporcionada.

## Limitaciones y advertencias

- Generacion semanticamente incoherente: el propio autor describe el texto como gramatical en la superficie pero no fiable en el contenido, con nombres propios distorsionados. No debe usarse como generador de texto util.
- Riesgo de alucinacion: maximo por construccion; al no modelar significado, cualquier afirmacion factual que produzca carece de base. No debe emplearse en ningun flujo que requiera exactitud.
- Rendimiento indistinguible del azar: ARC-Easy (27,5%) y HellaSwag (28,5%) quedan dentro de un error estandar de sus lineas base, y PIQA (45,0%) esta por debajo del 50% aleatorio. No hay evidencia de capacidad en comprension lectora o sentido comun.
- Limitacion idiomatica: solo ingles declarado; no hay soporte multilingue y el castellano no forma parte de los idiomas del modelo.
- Limitacion de contexto: 512 tokens, insuficiente para tareas multi-turno largas, resumen de documentos o agentes con historial extenso.
- Sin ajuste por instrucciones: no se documenta RLHF, DPO ni ninguna forma de alineacion, por lo que no sigue instrucciones ni mantiene formato de chat.
- Dependencia de codigo propio: no se puede cargar con las clases estandar de `transformers`; requiere la clase `LFT` y su pasada forward especifica, lo que anula la compatibilidad con servidores de inferencia convencionales.
- Sin cuantizaciones publicadas: solo float32, lo que impide aprovechar los formatos GGUF o GPTQ habituales en despliegues ligeros.
- Menos datos de los previstos: la model card indica que la peticion original era de 500M tokens y que la ejecucion consume ~103M, por lo que el modelo esta por debajo del objetivo declarado de la familia.
- Artefacto descartado: el `best.pt` del run de entrenamiento presentaba un fallo (congelado en el paso 400, validacion 6,44) y no es el modelo publicado; debe usarse el checkpoint del paso 8000.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero el propio autor desaconseja apoyarse en el contenido generado, por lo que la licencia permisiva no implica idoneidad para produccion.
- Estado del repositorio: 0 descargas y 0 likes, con un tamano de repo practicamente nulo; es un artefacto de investigacion sin validacion externa por parte de terceros.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Compactbot/bananamind-3-2.5m-lft
- Peticion original del modelo (model-requests#4): https://huggingface.co/spaces/Compactbot/model-requests/discussions/4
- Colecciones del ecosistema BananaMind en HuggingFace: https://huggingface.co/BananaMind/collections
- Repositorio BananaMindOS (inferencia local en PCs de los 90): https://github.com/BananaMind/BananaMindOS/tree/main
- Perfil del bot de discusion del ecosistema: https://huggingface.co/BananaMindBot/models
- Tabla de clasificacion BananaMindBench, citada en las colecciones del ecosistema: https://huggingface.co/collections (referencia indirecta; no se ha confirmado el identificador directo del leaderboard)
- Script de entrenamiento y definicion de la clase `LFT`: `train_bananamind3_lft.py`, referenciado en la model card; no se proporciona URL publica en la informacion disponible.
