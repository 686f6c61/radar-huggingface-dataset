# rangaraju963/waylingo-parser-qwen3-0.6b

## Resumen

waylingo-parser-qwen3-0.6b es un ajuste fino de Qwen3-0.6B especializado en una única tarea: convertir una petición de viaje en lenguaje natural al JSON estructurado que consume Waylingo, una biblioteca de código abierto para planificar rutas con paradas. Lo desarrolla el usuario rangaraju963 sobre el modelo base Qwen/Qwen3-0.6B, y su proposito no es navegar ni resolver geografia, sino extraer de forma fiable destino, paradas, categorias y anclas temporales o de ruta, copiando literalmente nombres de lugares, direcciones y marcas tal como aparecen en la peticion.

El modelo es relevante porque demuestra un patron muy util para produccion: un modelo pequeno (596 millones de parametros) ajustado con LoRA para una tarea de salida estructurada, que corre en un portatil o un servidor pequeno sin clave de API, sin coste por llamada y sin enviar el texto del usuario fuera de la maquina. Es un parser, no un navegador: el proveedor de mapas (TomTom o HERE, a traves de Waylingo) resuelve las ubicaciones reales.

Con 0,6B de parametros y un contexto heredado del base Qwen3, el modelo prioriza latencia baja y determinismo (decodificacion greedy, temperatura 0) sobre capacidad general. Su interes tecnico esta en el pipeline de datos sinteticos verificados por compilador, en el uso de LoRA en formato MLX y en la publicacion de pesos fusionados en bf16 junto con GGUF y el adaptador por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) con ajuste fino LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-0.6B; entrenamiento con secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | bf16 (pesos fusionados y GGUF bf16); adaptador LoRA en formato MLX |
| Idiomas soportados | en (ingles; locale en-GB en los ejemplos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se ajusta mediante LoRA de rango 8 y escala 20 aplicado a las 28 capas del modelo base, usando MLX. El entrenamiento usa enmascaramiento de los tokens de prompt en la perdida, learning rate de 1e-4, tamano de lote 2, secuencias de hasta 512 tokens y 1.000 pasos, lo que supone aproximadamente 2.000 de las 44.000 filas de entrenamiento. Los checkpoints de 2.000 y 3.000 pasos obtuvieron peor puntuacion, por lo que se selecciono el de 1.000 pasos.

Los datos de entrenamiento son 36.000 peticiones generadas por plantilla que mezclan nombres de lugares y marcas reales e inventados, mas 4.000 reescritas a lenguaje natural por Claude (incluidas dos veces). Cada etiqueta compila con el compilador real de planes de Waylingo, lo que garantiza consistencia estructural. El dataset publicado elimina todas las filas que contienen direcciones postales. La seleccion del checkpoint se hizo por exactitud en un conjunto de desarrollo con lenguaje natural, 300 peticiones con lugares no vistos, direcciones y peticiones solo de destino, no por perdida de validacion.

Una particularidad de inferencia: la plantilla de chat del modelo base inserta un bloque `` vacio en cada objetivo de entrenamiento, por lo que la respuesta comienza con ese bloque vacio y debe extraerse el objeto `{...}` mas externo.

## Capacidades

- Generacion de JSON estructurado a partir de una peticion de viaje en lenguaje natural, con un esquema fijo (destino, paradas, categorias, anclas).
- Extraccion literal de nombres de lugares, direcciones y marcas, sin normalizacion ni geocodificacion.
- Uso de categorias genericas para terminos como "a coffee" o "somewhere to charge".
- Manejo de anclas temporales y de ruta (por ejemplo, "coffee in 20 min" o "fuel on the way").
- Respuesta controlada de error: `{"error":"not_understood","stops":[]}` para entradas que no son peticiones de viaje.
- Soporte de lugares guardados mediante nombres del tipo `saved:home` en el prompt.
- Salida valida en JSON en mas del 99% del conjunto de lugares no vistos.
- Capacidades multilingues limitadas al ingles (locale en-GB en los ejemplos).
- No soporta tool calling general, agentes multi-paso, vision ni audio; su ambito es la conversion de una peticion en un plan.

## Casos de uso

- Planificacion de rutas en aplicaciones de viaje: el modelo convierte "drive me to Branmont, coffee in 20 min" en el JSON de plan que Waylingo compila y envia al proveedor de mapas; es adecuado por su salida estructurada y su bajo coste por llamada.
- Asistentes de navegacion embebidos en el vehiculo o en el movil: al correr en un portatil o servidor pequeno sin API key, el texto del usuario no sale del dispositivo, lo que encaja con requisitos de privacidad.
- Procesamiento por lotes de peticiones de viaje: con 1,1 a 1,4 s por peticion en un portatil Apple Silicon con MLX a temperatura 0, sirve para preprocesar lotes de peticiones historicas y generar planes de forma determinista.
- Backend de bajo coste para prototipos y demos: el despliegue con llama.cpp (`llama-server`) y el GGUF bf16 permiten montar un endpoint compatible con OpenAI sin infraestructura GPU dedicada.
- Extraccion de intencion en pipelines de routing: el JSON resultante se puede validar y reparar dentro de Waylingo, que ademas corrige pequenos errores de copia en nombres, lo que reduce fallos en produccion.
- Filtrado de entradas no validas: la respuesta `not_understood` permite descartar mensajes que no son peticiones de viaje antes de llamar al proveedor de mapas, ahorrando coste de API.
- Investigacion sobre salida estructurada con modelos pequenos: sirve como referencia reproducible de ajuste LoRA con datos verificados por compilador y evaluacion por equivalencia de plan.

## Benchmarks y rendimiento

Resultados publicados por el autor. "Same plan" significa que el JSON, tras la comprobacion de nombres de Waylingo, compila con el compilador real al mismo plan que la respuesta correcta; "Model alone" es la misma prueba sin la comprobacion de nombres.

| Conjunto de prueba | Filas | Same plan | Model alone |
|---|---:|---:|---:|
| Lenguaje natural, test reservado | 150 | 82,0% | 78,0% |
| Lugares y marcas no vistos | 1.000 | 89,9% | 86,5% |
| Peticiones con direccion postal (manual, no publicada) | 10 | 8/10 | 6/10 |
| Solo destino, sin paradas (manual) | 30 | 28/30 | 26/30 |

- JSON valido en mas del 99% del conjunto de lugares no vistos.
- El GGUF bf16 obtiene las mismas puntuaciones con llama.cpp a temperatura 0: 83,3% en lenguaje natural, 90,7% en 300 peticiones con lugares no vistos y 28/30 en solo destino.
- Los conjuntos de lenguaje natural son filas del conjunto no visto reescritas por un LLM; aproximadamente la mitad de las filas de test son reescrituras de peticiones usadas para elegir el checkpoint, por lo que la entrada real de usuario puede puntuar mas bajo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 596 millones de parametros en bf16, el peso ocupa aproximadamente 1,2 GB, por lo que cabe en GPU de consumo con holgura.
- GPU recomendadas: no se especifican en la informacion; por tamano, cualquier GPU consumer reciente (por ejemplo, RTX 4090 o inferiores) es suficiente, aunque no hay datos oficiales de rendimiento en GPU.
- Cabe en GPU consumer: si, segun el tamano del modelo; el autor reporta ejecucion en un portatil Apple Silicon con MLX.
- Opciones de despliegue: transformers, MLX, llama.cpp (`llama-server` con `--jinja --temp 0`), cualquier servidor compatible con OpenAI, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput: 1,1 a 1,4 s por peticion (mediana, segun conjunto de prueba) en un portatil Apple Silicon con MLX a temperatura 0. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| waylingo-parser-qwen3-0.6b | 596 M | no disponible | Parser de peticiones de viaje a JSON | apache-2.0 | Hugging Face (safetensors, GGUF, LoRA) |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible en la informacion | Modelo generalista | apache-2.0 | Hugging Face |
| Modelos de 0,5-1 B generalistas para salida estructurada | no disponible | no disponible | Generacion general y JSON | variable | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato de disponibilidad.

## Limitaciones y advertencias

- Es un parser, no un navegador: no conoce ubicaciones reales y no debe usarse para geocodificar ni validar direcciones.
- Riesgo de alucinacion en nombres: puede introducir errores de copia en nombres de lugares o calles; Waylingo corrige pequenos deslizamientos, pero sin esa capa hay que esperar las cifras de "Model alone".
- Rendimiento inferior en peticiones con direcciones postales (6/10 sin comprobacion de nombres en la prueba manual de 10 filas), lo que limita su uso directo en escenarios con direcciones complejas.
- Solo soporta ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Ambito muy restringido: fuera de peticiones de viaje responde con `not_understood`; no sirve como modelo conversacional general.
- Los conjuntos de evaluacion incluyen reescrituras de peticiones usadas para elegir el checkpoint, por lo que las cifras pueden sobreestimar el rendimiento con usuarios reales.
- Requiere decodificacion greedy y temperatura 0; el autor advierte que Waylingo no fija temperatura, por lo que el despliegue debe configurarla.
- La respuesta incluye un bloque `` vacio que hay que manejar al extraer el JSON.
- Licencia apache-2.0: permite uso comercial, pero no se ofrecen garantias ni soporte por parte del autor.
- El paquete Python de Waylingo no esta en PyPI; hay que compilarlo desde el codigo fuente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rangaraju963/waylingo-parser-qwen3-0.6b
- Dataset de entrenamiento: https://huggingface.co/datasets/rangaraju963/waylingo-parser-data
- Repositorio de Waylingo: https://github.com/Rohith295/waylingo
- Guia de bindings de Waylingo: https://github.com/Rohith295/waylingo/blob/main/crates/waylingo-ffi/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
