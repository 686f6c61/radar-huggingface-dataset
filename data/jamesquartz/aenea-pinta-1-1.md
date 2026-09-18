# JamesQuartz/aenea-pinta-1.1

## Resumen

Pinta-1.1 es un modelo de lenguaje de 226 millones de parametros desarrollado por JamesQuartz y publicado bajo el identificador `JamesQuartz/aenea-pinta-1.1`. No es un modelo conversacional: es un clasificador y pasarela de enrutamiento semantico (semantic routing gateway) que asigna cada prompt entrante a uno de nueve tokens de dominio reservados (`<|reserved_23|>` a `<|reserved_31|>`) en una unica pasada forward, para despues despachar la peticion al backend correspondiente (un experto de un sistema MoE, un SLM local, un servidor compatible con OpenAI o un endpoint de API especializado). Esta construido sobre la arquitectura propietaria Merlin v2 (`merlin_2`) y parte del checkpoint base AENEA Prelude-6.

Su relevancia practica reside en el coste y la latencia: con 226M de parametros y pesos en bfloat16 de aproximadamente 656 MB, el autor reporta un TTFT medio de 192,66 ms sobre una evaluacion completa de 1.020 prompts, lo que permite anteponer una capa de decision ligera a arquitecturas multi-modelo sin penalizar de forma apreciable el tiempo total de respuesta. El repositorio incluye un motor de enrutamiento propio (`pinta_engine.py`) con middleware FastAPI y un mapa de despacho (`routing_map.json`) que vincula cada token reservado con su backend de destino.

El modelo se publica como Beta. El autor solicita explicitamente pruebas de la comunidad sobre casos limite de enrutamiento y entornos de despliegue, y las metricas de la model card figuran como no verificadas. El soporte de idiomas declarado se limita al ingles y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Merlin v2 (`merlin_2`), transformer propietario con residuales paralelos; no registrado en el mapeo estandar de Hugging Face `AutoModel` |
| Parametros totales | 226 millones |
| Parametros activos | No aplica: el modelo es denso. La etiqueta "moe" se refiere a que enruta hacia backends de tipo Mixture-of-Experts, no a que sea un MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; los pesos se publican unicamente en bfloat16 (`pinta_1.1_bf16.pt`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (bfloat16, ~656 MB). No se distribuyen safetensors ni GGUF |
| Capas | 16 bloques transformer |
| Atencion | Grouped-Query Attention con 16 cabezas Q y 4 cabezas KV (16Q/4KV) |
| FFN | SwiGLU |
| Posicional | RoPE |
| Vocabulario | 49.152 tokens (tokenizer QT VI.6.4 UltraLingo) |
| Tarea (pipeline) | text-classification (Domain Routing & Intent Classification) |
| Libreria | `pinta-engine` |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-18 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

Pinta-1.1 implementa la arquitectura Merlin v2, compuesta por 16 bloques transformer con residuales paralelos, atencion Grouped-Query con 16 cabezas de consulta y 4 de clave/valor, red feed-forward SwiGLU y embeddings posicionales rotatorios (RoPE), sobre un vocabulario de 49.152 tokens servido por el tokenizer QT VI.6.4 UltraLingo. Al no emplear una clase de arquitectura estandar de Hugging Face, el checkpoint no se puede cargar con `AutoModelForCausalLM.from_pretrained(...)`: es obligatorio descargar el paquete `merlin_2/` junto con `pinta_engine.py` y mantener ambos en el mismo directorio de trabajo o en el `PYTHONPATH`. El repositorio esperado incluye `config.yaml`, `routing_map.json` y el fichero de pesos `pinta_1.1_bf16.pt`.

El modelo parte del checkpoint base AENEA Prelude-6 y se ha especializado como enrutador: emite un unico token de dominio por prompt en una sola pasada forward, con un umbral de confianza de 0,350 y el token `<|reserved_29|>` configurado como fallback. El motor `pinta_engine.py` extrae los logits, resuelve la clase y despacha de forma asincrona hacia backends Ollama, vLLM (o cualquier servidor compatible con la API de OpenAI), la API de OpenAI o un pipeline local de Hugging Face. El mapa por defecto ejemplifica este comportamiento: `<|reserved_24|>` corresponde a la etiqueta "Code" y despacha a `qwen2.5-coder:32b`, mientras que `<|reserved_26|>` corresponde a "RAG / Doc QA" y despacha a un servidor vLLM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Clasificacion de prompts en dominios de alto nivel: el modelo asigna cada entrada a uno de los tokens reservados `<|reserved_23|>` a `<|reserved_31|>` (nueve clases).
- Enrutamiento semantico de baja latencia: una sola pasada forward por prompt, sin generacion autoregresiva de texto.
- Calculo de confianza por decision: la salida incluye token, etiqueta, puntuacion de confianza y modelo de destino.
- Fallback controlado: si la confianza cae por debajo del umbral de 0,350, el sistema recurre al token `<|reserved_29|>`.
- Despacho a backends heterogeneos: Ollama, vLLM u otros servidores compatibles con OpenAI, la API de OpenAI y pipelines locales de Hugging Face.
- Integracion como middleware HTTP: el repositorio incluye soporte FastAPI/uvicorn para exponer el enrutador como servicio.
- Ejecucion en CPU, CUDA y MPS: el autor indica soporte de CPU y Apple MPS con un TTFT mas alto.
- No soporta generacion de texto abierto, razonamiento multi-paso, tool calling ni function calling: es explicitamente un clasificador/pasarela, no un modelo conversacional.
- Capacidades multilingues: no disponibles; la model card declara unicamente ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Pasarela de enrutamiento en arquitecturas multi-modelo: colocar Pinta-1.1 delante de un conjunto de modelos especializados para decidir, en 192,66 ms de TTFT medio, que backend atiende cada peticion y evitar enviar todo el trafico al modelo mas grande y caro.
- Optimizacion de costes en produccion: al derivar cada prompt al endpoint adecuado, se puede reservar el modelo de mayor tamano unicamente para los dominios que realmente lo requieren, manteniendo el resto en SLM locales o APIs mas economicas.
- Seleccion de modelo de codigo: con la etiqueta "Code" mapeada a `qwen2.5-coder:32b` en la configuracion de ejemplo, el enrutador permite que las consultas de programacion lleguen a un modelo especializado sin intervencion manual.
- Enrutamiento en pipelines de RAG y QA documental: el token `<|reserved_26|>` apunta a un backend vLLM, de modo que las consultas sobre documentacion se dirigen a la instancia preparada para ese flujo en lugar de mezclarse con trafico generalista.
- Clasificacion de intenciones en asistentes y chatbots: como clasificador de texto puro, permite etiquetar la intencion de cada turno antes de decidir la respuesta o el flujo conversacional correspondiente.
- Triaje de tickets en atencion al cliente: el modelo puede preclasificar el dominio de cada solicitud entrante para encolarla en el equipo o el sistema automatizado correcto, con la ventaja de que el coste por clasificacion es minimo.
- Despliegue on-premise o en el borde: con 226M de parametros y 656 MB de pesos en bfloat16, es viable ejecutarlo en CPU o en Apple MPS alli donde no haya GPU disponible, aceptando un TTFT mayor.
- Observabilidad y analitica de trafico: al etiquetar sistematicamente cada prompt, se obtiene una distribucion de dominios por periodo que sirve para dimensionar la capacidad de cada backend o detectar cambios en los patrones de uso.
- Estrategia de degradacion controlada: el umbral de confianza de 0,350 y el fallback a `<|reserved_29|>` permiten definir que ocurre con las peticiones ambiguas sin bloquear el servicio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto "Pinta Gold Benchmark" (split de test, dataset personalizado). Todas las metricas figuran como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| Strict Accuracy | 84,61 |
| Flexible Accuracy | 87,65 |
| Weighted Precision | 0,83 |
| Weighted Recall | 0,85 |
| Weighted F1-Score | 0,83 |

| Metrica de latencia | Valor |
|---|---|
| TTFT medio (referencia) | 192,66 ms |
| Base de medicion | Evaluacion completa de 1.020 prompts sobre hardware de referencia |
| Pasada en frio (cold, con warm-up de kernels CUDA) | 333 ms |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos oficiales: `pinta_1.1_bf16.pt`, aproximadamente 656 MB en disco en bfloat16.
- VRAM estimada para inferencia en bfloat16: en torno a 0,7-1 GB contando pesos y overhead del runtime. No hay cifra oficial publicada.
- VRAM estimada para otras precisiones (no distribuidas oficialmente, calculo derivado de los 226M de parametros): unos 230 MB en int8 y unos 120 MB en int4, mas overhead de activaciones y contexto.
- GPU recomendadas: no se especifican modelos concretos. El autor recomienda una GPU compatible con CUDA y confirma soporte de CPU y Apple MPS con TTFT superior.
- Consumer GPU: por tamano (226M de parametros) el modelo cabe holgadamente en cualquier GPU de consumo con al menos 1 GB de VRAM libre en bfloat16, incluidas soluciones integradas y portatiles.
- Despliegue: carga mediante PyTorch y el paquete `merlin_2` del propio repositorio; servicio HTTP mediante FastAPI y uvicorn a traves de `pinta_engine.py`. Ollama y vLLM se emplean como backends de destino, no como motores que alojen Pinta-1.1.
- Requisitos de software: Python 3.9 o superior y las dependencias `torch`, `transformers`, `fastapi`, `uvicorn`, `httpx` y `pyyaml`.
- Latencia: TTFT medio de 192,66 ms y pasada en frio de 333 ms, medidos por el autor sobre el conjunto de 1.020 prompts. En CPU y MPS el TTFT es mayor (sin cifra publicada).
- Throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria (enrutadores semanticos con arquitectura propietaria). No es posible ofrecer una comparativa de parametros, contexto, rendimiento y licencia frente a alternativas, dado que no hay datos publicados sobre competidores directos en la documentacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pinta-1.1 | 226M | no disponible | Apache 2.0 | Hugging Face (`JamesQuartz/aenea-pinta-1.1`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

Cabe senalar que los modelos citados en la configuracion de ejemplo (`qwen2.5-coder:32b` como backend de codigo) son destinos del enrutamiento, no alternativas equivalentes al propio Pinta-1.1.

## Limitaciones y advertencias

- Version Beta: el propio autor la etiqueta como tal y solicita pruebas de la comunidad sobre casos limite de enrutamiento y entornos de despliegue.
- Metricas no verificadas: las cinco metricas del `model-index` figuran con `verified: false`, por lo que proceden unicamente del autor y no han sido contrastadas de forma independiente.
- No es un modelo conversacional: no genera texto libre ni mantiene dialogos. Usarlo para generacion abierta daria resultados invalidos.
- Integracion no estandar: no funciona con `AutoModelForCausalLM.from_pretrained(...)`. Requiere descargar el repositorio completo, incluido el paquete `merlin_2/` y `pinta_engine.py`, e importarlos en tiempo de ejecucion. Esto complica el despliegue en plataformas que asumen arquitecturas registradas en Hugging Face.
- Cobertura de idiomas limitada al ingles: no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Espacio de etiquetas reducido: solo nueve tokens de dominio (`<|reserved_23|>` a `<|reserved_31|>`), lo que limita la granularidad de la clasificacion.
- Umbral y fallback fijos por defecto: la confianza minima es 0,350 y el fallback apunta a `<|reserved_29|>`. Un umbral mal calibrado degrada la calidad del enrutamiento en produccion.
- Sin cuantizaciones oficiales: solo se publican pesos en bfloat16, lo que descarta formatos GGUF o cuantizaciones listas para llama.cpp u Ollama en el lado del enrutador.
- Sin datos sobre sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea cuando el prompt es ambiguo o pertenece a un dominio fuera de las nueve clases previstas.
- Ausencia de datos de entrenamiento: no se especifican tokens de entrenamiento, composicion del dataset ni fases de alineamiento, lo que dificulta auditar el comportamiento del modelo.
- Fechas de publicacion atipicas: los metadatos indican creacion y actualizacion el 2026-09-18.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y copyright correspondientes.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamesQuartz/aenea-pinta-1.1
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
