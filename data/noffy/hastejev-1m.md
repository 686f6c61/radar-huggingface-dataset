# noffy/hastejev-1m

## Resumen

Haste Jev 1M (Mini) es un modelo de ponderaciones abiertas publicado por el usuario noffy en Hugging Face, presentado por su autor como un "motor de decisión System-1" de sesgo cero y arquitectura no generativa. Con 1.106.723 parámetros totales (910.115 entrenables y 196.608 en tablas de proyección o buffer), 4 capas de transformer, dimensión oculta de 128 y 4 cabezas de atención, no está pensado para generar texto libre, sino para elegir entre un conjunto finito de opciones a partir de un estado descrito en lenguaje natural. Su pipeline declarado es `feature-extraction` y su librería de referencia es `transformers` con pesos en `safetensors`.

El modelo forma parte de una familia escalonada (de 98k a 20,4M de parámetros) en la que cada variante se orienta a un entorno distinto: microcontroladores, CPU móvil, sidecars de API, automatización de navegador o enrutado financiero. En la variante de 1M, el caso objetivo declarado es el de sidecar de API de alto rendimiento y microservicios de decisión en tiempo real, con una huella de memoria de aproximadamente 4,4 MB en FP32 y 1,1 MB en INT8.

Su relevancia actual es acotada pero concreta: frente a los modelos generativos de miles de millones de parámetros usados para tareas de clasificación o enrutado, este tipo de motor diminuto propone resolver la decisión con latencia mínima y sin coste de GPU. No obstante, la ficha pública no incluye resultados de benchmarks, ni documentación del dataset de entrenamiento, ni detalles sobre la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no generativo orientado a decision (4 capas, d_model 128, 4 cabezas de atencion) |
| Parametros totales | 1.106.723 (~1,1M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16, INT8, INT4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model_fp16.safetensors, model_int8.safetensors, model_int4.safetensors) y PyTorch |
| Parametros entrenables | 910.115 |
| Buffer / tabla de proyeccion | 196.608 |
| Dimension oculta (d_model) | 128 |
| Capas | 4 |
| Cabezas de atencion | 4 |
| Huella de memoria (FP32) | ~4,4 MB |
| Huella de memoria (INT8) | ~1,1 MB |
| Huella de memoria (INT4) | No especificada por el autor |
| Pipeline declarado | feature-extraction |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion publicada describe una arquitectura transformer de 4 capas con dimension oculta de 128 y 4 cabezas de atencion, con un total de 1.106.723 parametros, de los cuales 910.115 serian entrenables y 196.608 corresponderian a una tabla de proyeccion o buffer. El autor la etiqueta como "System-1 decision engine", "non-generative" y "zero-bias", y el pipeline declarado en Hugging Face es `feature-extraction`, lo que encaja con un uso como extractor de representaciones o puntuador de opciones en lugar de un modelo de lenguaje autoregresivo.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Las etiquetas incluyen `calibration` y `zero-bias`, pero la model card no aporta metodologia, metricas de calibracion ni procedimiento de medida que permitan verificar esas afirmaciones. Tampoco se documenta la longitud de contexto soportada ni el esquema exacto de tokenizacion.

## Capacidades

- Decision entre opciones discretas: la interfaz `engine.choice(state, options)` recibe un estado en texto y una lista de opciones, y devuelve una decision junto a una puntuacion de confianza.
- Extraccion de caracteristicas: el pipeline declarado es `feature-extraction`, orientado a representaciones internas mas que a generacion de texto.
- Puntuacion de confianza y calibracion: la salida incluye un valor numerico de confianza, lo que permite umbrales y escalado en produccion.
- Inferencia no generativa de baja latencia: al no decodificar secuencias token a token, la latencia es propia de un clasificador de tamano diminuto.
- Uso como componente en agentes: las etiquetas `autonomous-agents`, `browser-control` y `web-automation` apuntan a su uso como modulo de decision dentro de bucles de agente.
- Cuantizacion integrada: variantes FP16, INT8 e INT4 cargables mediante el parametro `quantization` de `HasteJevEngine`.
- Idiomas: unicamente ingles segun el campo `language` de la model card.

No se documentan capacidades de generacion de texto libre, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling en formato estandar (JSON schema) ni un modo "thinking" explicito. En la informacion disponible no se confirma soporte de function calling al estilo de las APIs de modelos generativos.

## Casos de uso

- Sidecar de decision en microservicios: el modelo se despliega junto a un servicio principal para resolver reglas de enrutado o aprobacion con una huella de 1,1 MB en INT8, sin ocupar GPU ni competir por memoria con el servicio principal.
- Enrutado de transacciones financieras: dado un estado con saldo y operaciones pendientes, el ejemplo de la propia model card muestra una decision entre "Approve Transaction", "Flag for Review" y "Decline", util para pre-filtrado antes de una revision humana.
- Automatizacion de navegador: las etiquetas `browser-control` y `web-automation` sugieren su uso como selector de la siguiente accion en un agente que opera sobre paginas web, eligiendo entre un conjunto acotado de acciones candidatas.
- Triaje de KYC y verificacion de identidad: la variante superior de la familia (5M) se orienta explicitamente a enrutado financiero y KYC; el modelo de 1M puede emplearse como primera etapa de clasificacion en flujos de alta frecuencia.
- Despacho de alta frecuencia (high-frequency dispatch): enrutado de eventos o peticiones a colas o workers distintos segun el estado recibido, aprovechando la latencia reducida de un modelo no generativo.
- Moderacion o clasificacion binaria a gran escala: eleccion entre categorias predefinidas sobre texto corto en ingles, con umbral de confianza para derivar casos dudosos a un modelo mayor.
- Despliegue en el borde: al no requerir GPU y caber en unos pocos megabytes, es candidato para ejecucion en CPU de contenedores ligeros o entornos embebidos, aunque no se publican mediciones de latencia reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, calibracion (ECE) ni comparaciones cuantitativas con otros modelos. Tampoco se aportan mediciones de latencia o throughput en ninguna configuracion de hardware.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU. La huella de pesos es de aproximadamente 4,4 MB en FP32 y 1,1 MB en INT8, segun los datos del autor.
- Memoria en INT4: no especificada por el autor en la informacion disponible.
- GPU recomendadas: no aplica; por tamano, el modelo esta disenado para ejecucion en CPU.
- GPU de consumo: cabe en cualquier GPU de consumo y en la mayoria de CPU modernas; el cuello de botella previsible es el coste del tokenizador y del pipeline de entrada, no el modelo.
- Opciones de despliegue: la via documentada es la libreria propia `hastejev` (`HasteJevEngine.from_pretrained`), con soporte de cuantizacion INT8 e INT4. El repositorio declara compatibilidad con `transformers` y pesos en `safetensors` y PyTorch.
- vLLM, TGI, llama.cpp u Ollama: no se documenta soporte para ninguna de estas herramientas en la informacion disponible; no se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada. Como referencia interna, la propia familia Haste Jev ofrece variantes con el mismo proposito y distintos presupuestos de recursos:

| Modelo | Parametros | Dim. oculta | Capas | Cabezas | RAM (FP32) | RAM (INT8) | Uso objetivo declarado |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98k | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-500k | ~500k | 96 | 3 | 4 | ~2,0 MB | ~0,5 MB | CPU movil, workers en navegador |
| hastejev-1m | ~1,1M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-2m | ~1,8M | 160 | 4 | 4 | ~7,3 MB | ~1,8 MB | Automatizacion de navegador y bots |
| hastejev-5m | ~5,0M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutado financiero y KYC |
| hastejev-10m | ~10,0M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

No se dispone de datos de rendimiento que permitan comparar estas variantes entre si ni con alternativas de terceros.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre ni razonamiento en lenguaje natural; su salida se limita a elegir entre opciones proporcionadas por el llamante.
- Idioma unico: la model card declara unicamente ingles, por lo que el comportamiento en castellano u otros idiomas no esta documentado ni garantizado.
- Contexto desconocido: no se publica la longitud maxima de contexto, lo que impide dimensionar entradas largas en produccion.
- Sin benchmarks: no hay metricas de exactitud, calibracion ni latencia que respalden las afirmaciones de "zero-bias" o "low-latency". La calibracion de la confianza no es verificable con la informacion disponible.
- Sesgos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos sistematicos; la etiqueta "zero-bias" es una afirmacion del autor sin evidencia publicada.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero existe riesgo de decisiones erroneas con confianza alta si la distribucion de entrada difiere de la de entrenamiento.
- Estado del repositorio: el tamano del repositorio figura como 0.0 GB y el modelo registra 0 descargas y 0 likes, por lo que no se puede confirmar que los pesos esten efectivamente publicados y accesibles.
- Fechas anomalas: las marcas de creacion y actualizacion (20 de septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de integrar el modelo.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se documenten los cambios realizados.
- Dependencia de libreria propia: el uso documentado pasa por el paquete `hastejev`; la integracion con `transformers` estandar no se detalla, lo que anade un riesgo de mantenimiento.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-1m
- Repositorio en GitHub: https://github.com/racstan/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Variante hastejev-100k: https://huggingface.co/noffy/hastejev-100k
- Variante hastejev-500k: https://huggingface.co/noffy/hastejev-500k
- Variante hastejev-2m: https://huggingface.co/noffy/hastejev-2m
- Variante hastejev-5m: https://huggingface.co/noffy/hastejev-5m
- Variante hastejev-10m: https://huggingface.co/noffy/hastejev-10m
- Variante hastejev-20m: https://huggingface.co/noffy/hastejev
- Papers, blogs o demos adicionales: no disponibles. La busqueda web no devolvio resultados relacionados con el modelo.
