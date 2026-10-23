# Graph-COM/KVEraser

## Resumen

KVEraser es un adaptador LoRA publicado por el grupo Graph-COM que se monta sobre el modelo Qwen3-8B para realizar *KV cache erasing*: la eliminación localizada y selectiva de información dentro de la caché de claves/valores durante la inferencia. El adaptador no sustituye al modelo base, sino que actúa sobre el transformer de Qwen3 en el momento del borrado, mientras que la generación se ejecuta con el backbone sin modificar. Su objetivo es que un modelo de contexto largo pueda "olvidar" fragmentos concretos de contexto (por ejemplo, datos personales o documentos caducados) sin recalcular la caché completa ni degradar la recuperación del resto de la ventana.

El artefacto publicado es únicamente el adaptador (43.646.976 parámetros, rango LoRA 16, alpha 32) junto con la configuración de entrenamiento y los resultados de evaluación; no es un modelo autónomo y requiere el repositorio de código de KVEraser para enrutar borrado y generación a través de un mismo backbone. La relevancia actual está en el cruce de tres líneas de trabajo: eficiencia de memoria en contextos largos, *unlearning*/borrado selectivo por requisitos de privacidad y *steering* de la caché KV como mecanismo de control en tiempo de inferencia.

Los resultados declarados por el autor cubren recuperación tipo needle-in-a-haystack hasta 32K tokens (100 % EM hasta 16K, 99 % a 32K), QA multi-salto sobre 2Wiki, MuSiQue e IIRC (EM entre 84,67 y 91,57) y function calling sobre BFCL (85 % EM), con una latencia media de 514,22 ms y un pico de 22,91 GiB en una RTX 6000 Ada de 48 GB para el caso de 32K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer decoder-only); actua sobre las proyecciones de atencion y MLP del backbone durante el borrado de KV. Detalle interno del backbone no disponible en la informacion proporcionada |
| Parametros totales | 43.646.976 parametros del adaptador; backbone Qwen3-8B (cifra exacta de parametros del backbone no disponible en la informacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Evaluado hasta 32K tokens (NIAH 32K); contexto nativo maximo del backbone no disponible en la informacion |
| Tipos de cuantizacion | No disponible. La evaluacion se realiza en BF16; el adaptador se distribuye en safetensors. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (modelo base Qwen3-8B tambien bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); inferencia en BF16 con SDPA |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`) con rango LoRA 16, alpha 32 y dropout 0. Las matrices de bajo rango cubren las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atencion completa y bloque MLP. El mecanismo descrito en el paper es un borrado de entradas de la cache KV guiado por el propio modelo, de forma que el backbone generador permanece intacto y el adaptador solo interviene en la fase de *steering* de la cache. La inferencia usa BF16 y atencion SDPA.

El entrenamiento consta de dos fases, preentrenamiento y ajuste fino conjunto especifico de tarea, ambas con semilla 42, una epoca, optimizador AdamW, learning rate 1e-5, weight decay 0.01 y gradient clipping 1.0. La acumulacion de gradiente es 8 en el preentrenamiento y 1 en el ajuste fino. La informacion disponible no detalla el volumen de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; el dataset asociado es `Graph-COM/KVEraser`. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Borrado localizado de contexto en la cache KV: eliminacion selectiva de entradas asociadas a fragmentos concretos del contexto, manteniendo la coherencia del resto de la ventana.
- Recuperacion en contexto largo: 100 % EM en NIAH de 1K a 16K y 99 % EM a 32K sobre 100 muestras por tamano.
- QA multi-salto y razonamiento sobre documentos: 90,70 EM / 91,63 F1 en 2Wiki, 84,67 EM / 86,67 F1 en MuSiQue y 91,57 EM / 92,46 F1 en IIRC.
- Function calling / tool calling: 85 % EM en BFCL con 100 muestras, lo que habilita su uso en pipelines de agentes.
- Generacion de texto a traves del backbone sin modificar, con el adaptador limitado a la fase de borrado.
- No se documentan capacidades de vision, audio, modo *thinking* explicito ni cobertura multilingue verificada.

## Casos de uso

- Cumplimiento del derecho al olvido en produccion: ante una solicitud de supresion de datos, el adaptador permite eliminar de la cache KV las entradas derivadas del documento o usuario afectado sin reiniciar la sesion ni reconstruir todo el contexto, manteniendo el resto de la conversacion operativa.
- Redaccion de informacion sensible en asistentes documentales: en un pipeline RAG con contratos o historiales clinicos, el sistema puede borrar selectivamente fragmentos marcados como confidenciales antes de que el modelo genere la respuesta final, reduciendo el riesgo de filtracion en la salida.
- Gestion de contexto largo en atencion al cliente: con ventanas de hasta 32K tokens y un EM del 99 % en recuperacion a esa distancia, el modelo puede mantener historiales multi-turno extensos y descartar tramos ya resueltos para liberar presupuesto de atencion.
- Agentes con tool calling sobre estado dinamico: el 85 % EM en BFCL y el borrado selectivo permiten que un agente descarte resultados de herramientas ya obsoletos (por ejemplo, precios o stocks antiguos) sin perder el resto del estado de la tarea.
- Investigacion en *unlearning* y privacidad de modelos: sirve como banco de pruebas reproducible (checkpoint, dataset y `evaluate.py` publicos) para medir hasta que punto un borrado en la cache elimina realmente la informacion o solo la enmascara.
- Optimizacion de memoria en servir推理 de contexto largo: al reducir entradas de cache se limita el crecimiento de memoria por sesion, lo que resulta util en despliegues con muchas conversaciones concurrentes sobre una sola GPU de 48 GB.
- Auditoria de sistemas de recuperacion: las tareas 2Wiki, MuSiQue e IIRC permiten evaluar la robustez del pipeline RAG frente al borrado parcial de evidencia y detectar dependencias excesivas de un unico pasaje.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 1.522 muestras de test, una RTX 6000 Ada de 48 GB, decodificacion greedy con hasta 32 tokens nuevos. EM y F1 en porcentaje.

| Tarea | Muestras | EM | F1 |
|---|---:|---:|---:|
| NIAH 1K | 100 | 100,00 | no disponible |
| NIAH 2K | 100 | 100,00 | no disponible |
| NIAH 4K | 100 | 100,00 | no disponible |
| NIAH 8K | 100 | 100,00 | no disponible |
| NIAH 16K | 100 | 100,00 | no disponible |
| NIAH 32K | 100 | 99,00 | no disponible |
| 2Wiki | 344 | 90,70 | 91,63 |
| MuSiQue | 300 | 84,67 | 86,67 |
| IIRC | 178 | 91,57 | 92,46 |
| BFCL | 100 | 85,00 | no disponible |

| Metrica de eficiencia (NIAH 32K) | Valor |
|---|---|
| Latencia media online | 514,22 ms |
| Memoria pico asignada | 22,91 GiB |
| GPU de medida | 1x RTX 6000 Ada 48 GB |
| Precision | BF16 |
| Alcance de la medida | Incluye borrado, replay de la query y generacion; excluye carga y prefill inicial; 3 muestras de warmup descartadas por dataset |

El paper reporta resultados sobre GPU A100; el autor no incluye en la model card una comparacion directa con metodos alternativos de compresion o eviccion de cache KV.

## Requisitos de hardware

- VRAM estimada: 22,91 GiB de pico medido en BF16 para el escenario NIAH 32K, incluyendo backbone y prefill inicial. Esa cifra es el minimo practico observado, no una estimacion teorica.
- GPU recomendadas: RTX 6000 Ada 48 GB (configuracion verificada por el autor) y A100 (usada en el paper). Cualquier GPU CUDA con 24 GB o mas queda teoricamente al limite, pero no hay verificacion publicada en consumer.
- Cabe en consumer GPU: RTX 4090 / 3090 de 24 GB quedan muy justas frente a los 22,91 GiB medidos, sin margen para picos de fragmentacion ni para lotes mayores; no confirmado por el autor.
- Despliegue: el unico camino documentado es el repositorio KVEraser (`evaluate.py` con `--checkpoint Graph-COM/KVEraser`), sobre PEFT y el backbone Qwen3. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y al requerir enrutado del borrado a traves del backbone no es un adaptador plug-and-play en servidores de inferencia estandar.
- Latencia y throughput: 514,22 ms de latencia media online en NIAH 32K con decodificacion greedy de hasta 32 tokens nuevos. No se publica throughput agregado ni latencia para otros tamanos de contexto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | EM NIAH 32K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KVEraser (Qwen3-8B) | Adaptador LoRA para borrado de cache KV | 43,6 M de adaptador + backbone 8B | Evaluado a 32K | 99,00 | Apache 2.0 | HuggingFace (Graph-COM/KVEraser) |
| Qwen3-8B sin adaptador | Modelo base generativo | 8B | No disponible en la informacion | No disponible | Apache 2.0 | HuggingFace (Qwen/Qwen3-8B) |
| Metodos de eviccion de cache KV (H2O, SnapKV, PyramidKV) | Politicas de poda de cache sin entrenamiento | No disponible | No disponible | No disponible | No disponible | Repositorios de investigacion |
| Adaptadores de *steering* / unlearning sobre LLM | Modulos PEFT de control | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye metricas de estos metodos alternativos sobre los mismos conjuntos, por lo que la comparacion cuantitativa directa no esta disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio contiene solo el adaptador LoRA. Sin el codigo de KVEraser no se puede ejecutar el borrado, y cargarlo como un adapter PEFT convencional no reproduce el comportamiento descrito.
- La generacion usa el backbone sin modificar; cualquier sesgo, alucinacion o limitacion linguistica de Qwen3-8B se hereda intacta. El adaptador no mejora la veracidad factual.
- El borrado en la cache KV no garantiza la eliminacion de la informacion del modelo ni de otras caches o estados; no debe presentarse por si solo como mecanismo de cumplimiento normativo sin auditoria adicional.
- Los conjuntos de evaluacion son pequenos (100 muestras en NIAH y BFCL, 178 en IIRC), con decodificacion greedy y un maximo de 32 tokens nuevos; los intervalos de confianza no se publican.
- El resultado de NIAH 32K es 99,00 % EM, no 100 %: existe una muestra de fallo a 32K que conviene caracterizar antes de desplegar.
- No se documentan idiomas soportados ni evaluacion fuera del ingles; el rendimiento en castellano es desconocido.
- No se publican opciones de cuantizacion; el requisito de 22,91 GiB en BF16 limita el despliegue a GPUs de 48 GB con margen o a 24 GB muy al limite.
- La licencia del adaptador es Apache 2.0 y la del backbone tambien, pero el uso comercial debe verificar igualmente los terminos del modelo base y de los datasets de evaluacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card esta fechada en octubre de 2026: se trata de un artefacto de investigacion reciente, sin Validacion independiente conocida.
- La comparacion con metodos de compresion de cache ampliamente usados no esta disponible en la informacion, lo que impide valorar la ganancia real frente a alternativas sin entrenamiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Graph-COM/KVEraser
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Paper (arXiv 2606.17034): https://arxiv.org/abs/2606.17034
- Repositorio de codigo y evaluacion: https://github.com/Graph-COM/KVEraser
- Dataset de evaluacion: https://huggingface.co/datasets/Graph-COM/KVEraser
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces anteriores proceden de la model card.
