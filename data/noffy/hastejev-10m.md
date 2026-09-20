# noffy/hastejev-10m

## Resumen

Haste Jev 10M es un modelo de pesos abiertos publicado por el usuario noffy en Hugging Face, descrito por su autor como un "System-1 Decision Engine" de sesgo cero. No se trata de un modelo generativo de lenguaje: su pipeline declarado es `feature-extraction` y su funcion es recibir un estado (por ejemplo, una descripcion textual de una situacion) junto con un conjunto de opciones discretas, y devolver una decision acompanada de una puntuacion de confianza. Con 10.002.275 parametros totales (6.856.675 entrenables y una tabla de buffer/proyeccion de 3.145.600), se situa en la gama "Large" de la familia Haste Jev, cuyo modelo mayor es hastejev-20m.

La arquitectura declarada es un transformer denso de 5 capas, dimension oculta de 320 y 4 cabezas de atencion, orientado a inferencia de muy baja latencia y a despliegue como kernel de percepcion y decision en agentes autonomos, automatizacion de navegador y espacios de accion de alta cardinalidad. El modelo se distribuye en safetensors con variantes FP32, FP16, INT8 e INT4, con una huella de memoria de aproximadamente 40 MB en FP32 y 10 MB en INT8, lo que permite ejecutarlo en CPU sin GPU dedicada. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual es acotada pero especifica: frente a los modelos generativos que se usan como planificadores de agentes, propone una pieza separada y mucho mas barata (System-1) que resuelve la seleccion rapida de acciones, dejando el razonamiento deliberativo a otro componente. Ahora bien, la model card no documenta el conjunto de entrenamiento, el numero de tokens, el proceso de alineamiento ni resultados de evaluacion, por lo que las afirmaciones de "zero-bias" y "calibration" no estan respaldadas por evidencia publicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), presentado como "System-1 Decision Engine" no generativo |
| Parametros totales | 10.002.275 (~10,0 M) |
| Parametros activos | No aplica (modelo denso). Entrenables: 6.856.675; tabla de buffer/proyeccion: 3.145.600 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16 (`model_fp16.safetensors`), INT8 (`model_int8.safetensors`), INT4 (`model_int4.safetensors`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32/FP16/INT8/INT4) y PyTorch; pipeline `feature-extraction` |
| Dimension oculta | 320 |
| Capas del transformer | 5 |
| Cabezas de atencion | 4 |
| Huella de RAM | ~40 MB en FP32, ~10 MB en INT8 (segun la model card) |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Fecha de creacion (metadato) | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un transformer de 5 capas con dimension oculta de 320 y 4 cabezas de atencion, de tipo denso. La particularidad declarada es que el modelo no genera texto: expone primitivas de decision mediante una API propia (`HasteJevEngine`), con un metodo `choice(state, options)` que devuelve un objeto con los campos `decision` y `confidence`. Esto lo aleja del paradigma de los LLM y lo acerca a un clasificador o cabecera de seleccion de acciones entrenada sobre representaciones de estado. Los parametros se reparten entre 6.856.675 pesos entrenables y una "buffer/projection table" de 3.145.600 elementos, aunque la model card no explica que contiene ni como se inicializa.

No hay informacion disponible sobre el volumen de datos de entrenamiento, la composicion del dataset, el tipo de objetivos de entrenamiento, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o calibracion supervisada. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, destilacion) mas alla del uso de cuantizacion INT8/INT4 y de la orientacion a baja latencia. Las etiquetas del repositorio mencionan `zero-bias` y `calibration`, pero no se aporta metodologia ni mediciones que las respalden. En consecuencia, cualquier afirmacion sobre calidad de entrenamiento debe considerarse no verificada.

## Capacidades

- Seleccion de decisiones discretas: dado un estado textual y una lista de opciones, devuelve una opcion y una puntuacion de confianza asociada.
- Extraccion de caracteristicas: el pipeline declarado es `feature-extraction`, por lo que puede emplearse como codificador de estados para otras etapas del sistema.
- Inferencia no generativa y de baja latencia: al no producir texto token a token, evita el coste de decodificacion autoregresiva.
- Cuantizacion integrada: variantes FP32, FP16, INT8 e INT4 listas para cargar, con seleccion mediante el parametro `quantization` del cargador.
- Orientacion a agentes: las etiquetas del repositorio incluyen `autonomous-agents`, `browser-control`, `web-automation` y `agentic-ai`, lo que sugiere su uso como modulo de decision dentro de bucles de agentes.
- Espacios de accion de alta cardinalidad: la model card lo presenta como adecuado para seleccionar entre muchas acciones posibles.
- Idiomas: unicamente ingles declarado.
- Tool calling / function calling: no disponible (no documentado).
- Capacidades multimodales: las etiquetas y la descripcion aluden a "multimodal agents" como destino de despliegue, pero el modelo en si no declara entradas de imagen o audio; no disponible.
- Modo de razonamiento explicito (thinking) o generacion de texto: no disponible (modelo no generativo).
- Multilingue: no disponible; solo ingles.

## Casos de uso

- Enrutamiento de decisiones financieras: dado un estado con saldo y transacciones pendientes, elegir entre "aprobar", "marcar para revision" o "rechazar". El ejemplo de la propia model card usa exactamente este escenario, y el tamano del modelo permite ejecutarlo en linea dentro del flujo de autorizacion.
- Triaje de KYC y antifraude: clasificar expedientes o alertas en categorias de riesgo antes de escalarlas a un analista humano, usando la puntuacion de confianza como criterio de escalado.
- Automatizacion de navegador y control web: seleccionar la siguiente accion (clic, relleno de formulario, navegacion) en un agente que opera sobre interfaces web, aprovechando la baja latencia para no bloquear el bucle del agente.
- Kernel de percepcion para agentes multimodales: actuar como cabecera de decision sobre representaciones producidas por otro modelo perceptivo, separando la parte "System-1" rapida del razonamiento deliberativo.
- Sidecar de clasificacion en APIs de alto rendimiento: dado su tamano (~10 MB en INT8), puede desplegarse junto a un servicio mayor como componente de enrutamiento o filtrado previo, sin consumir GPU.
- Navegacion autonoma y robotica sencilla: elegir entre acciones discretas de un espacio de accion amplio a partir de una descripcion del estado del entorno, en escenarios donde no se requiere generacion de lenguaje.
- Filtrado previo en pipelines de agentes: descartar opciones inviables antes de invocar un modelo generativo mucho mas caro, reduciendo coste por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, calibracion (ECE), latencia ni throughput, ni comparaciones cuantitativas con otros modelos. Las afirmaciones de "zero-bias", "low-latency" y "calibration" figuran unicamente como etiquetas, sin datos que las respalden.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 40 MB de pesos mas overhead del runtime; el modelo cabe holgadamente en cualquier GPU, incluida una GTX 1050 o integrada.
- VRAM en INT8: aproximadamente 10 MB de pesos.
- VRAM en INT4: inferior a 10 MB segun la progresion de cuantizacion declarada (no se indica cifra exacta).
- GPU recomendadas: no se especifica ninguna; el modelo esta pensado para ejecucion en CPU. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para 10 M de parametros.
- Cabe en GPU de consumo: si, en cualquiera; tambien en CPU de portatil, movil o incluso entornos embebidos de gama alta (para microcontroladores el autor apunta al modelo hastejev-100k).
- Opciones de despliegue: la via documentada es la libreria `transformers` junto con el paquete propio `hastejev` (`HasteJevEngine.from_pretrained`). vLLM, TGI, llama.cpp u Ollama no estan documentados para este modelo; en particular, llama.cpp y Ollama estan orientados a modelos generativos con pesos GGUF y no aplican aqui.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de milisegundos por decision.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas externas de la misma categoria (motores de decision no generativos de ~10 M de parametros) en la informacion proporcionada. La comparacion mas util disponible es interna a la propia familia Haste Jev:

| Modelo | Parametros | Dim. oculta | Capas | Cabezas | RAM FP32 | RAM INT8 | Uso objetivo declarado |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98 k | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-1m | ~1,1 M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-5m | ~5,0 M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutamiento financiero y KYC |
| hastejev-10m | ~10,0 M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4 M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

Todas las variantes comparten licencia Apache 2.0 y autor. No se dispone de comparaciones con modelos de terceros.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, GSM8K, HumanEval ni metricas de precision de decision, calibracion o robustez. Evaluar el modelo en el caso de uso propio antes de cualquier despliegue es imprescindible.
- Afirmaciones no verificadas: las etiquetas `zero-bias` y `calibration` no vienen acompanadas de metodologia ni de mediciones; no deben tomarse como garantia.
- Modelo no generativo: no produce texto ni razonamiento explicito. No puede sustituir a un LLM y no sirve para tareas de generacion, resumen o dialogo.
- Un solo idioma: unicamente ingles declarado. El rendimiento en castellano u otras lenguas es desconocido y probablemente degradado.
- Sesgos: no se documenta composicion del dataset ni analisis de sesgo, por lo que no es posible evaluar sesgos por idioma, dominio, genero o procedencia de los datos.
- Riesgo de alucinacion de decision: al devolver una eleccion con una puntuacion de confianza, un modelo no calibrado puede producir confianza alta en decisiones erroneas; conviene umbralizar y derivar a revision humana los casos de baja confianza.
- Transparencia limitada: no se publican datos de entrenamiento, numero de tokens, objetivos ni procedimiento de ajuste. La "buffer/projection table" de 3.145.600 elementos no se explica.
- Sin senal de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin ecosistema, issues ni casos de produccion conocidos.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (20 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia y procedencia del artefacto.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay clausulas de uso aceptable adicionales documentadas, pero tampoco garantia alguna por parte del autor.
- Madurez del ecosistema: depende de un paquete Python propio (`hastejev`) cuya documentacion, mantenimiento y compatibilidad con versiones de `transformers` no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-10m
- Repositorio GitHub del autor: https://github.com/racstan/hastejev
- Modelo hermano hastejev-100k: https://huggingface.co/noffy/hastejev-100k
- Modelo hermano hastejev-500k: https://huggingface.co/noffy/hastejev-500k
- Modelo hermano hastejev-1m: https://huggingface.co/noffy/hastejev-1m
- Modelo hermano hastejev-2m: https://huggingface.co/noffy/hastejev-2m
- Modelo hermano hastejev-5m: https://huggingface.co/noffy/hastejev-5m
- Modelo hermano hastejev-20m: https://huggingface.co/noffy/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los enlaces recuperados corresponden a paginas no relacionadas y se han descartado. No se han localizado papers, blogs tecnicos ni demos adicionales.
