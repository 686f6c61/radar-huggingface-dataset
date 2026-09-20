# flock-io/this-that-model-1.0

## Resumen

this-that-model-1.0 es un modelo de decision tipada desarrollado por flock-io. No genera texto: en una unica pasada forward lee el estado oculto en una posicion designada y lo puntua contra los tokens de las etiquetas que el usuario declara como opciones, devolviendo una opcion valida y una probabilidad calibrada. El problema que resuelve es concreto: cuando un programa llega a una bifurcacion que no puede expresar en codigo (si un reembolso esta dentro de politica, si un comando de shell es seguro), lo que necesita no es prosa sino una de n opciones declaradas y un numero con el que poder aplicar un umbral.

El modelo tiene 1.881.825.088 parametros (1,88 B) y una arquitectura hibrida de estilo Qwen3.5 con 24 capas, de las cuales 18 son DeltaNet de atencion lineal y 6 son atencion completa. Su interes practico esta en la latencia y en el coste: segun la model card, responde en unos 30,9 ms por pregunta en una GPU de consumo generando cero tokens de salida, lo que elimina el bucle de decodificacion, el parser y la logica de reintento.

Es relevante ahora porque ataca el problema de la salida estructurada desde el diseno y no desde el postprocesado: la respuesta malformada no es improbable, es irrepresentable, ya que el soporte de la distribucion es exactamente la lista de opciones declarada. La model card publica resultados medidos en calibracion y en un benchmark de terceros, aunque el modelo es muy reciente y no tiene descargas ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de estilo Qwen3.5: 24 capas, 18 con DeltaNet (atencion lineal) y 6 con atencion completa |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. La model card solo menciona carga en float16 en Apple Silicon; el repositorio publica safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline declarado | text-classification |
| Modelo base | decider-2b |
| Tamano del repositorio | 3,8 GB |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 24 capas en el que 18 capas utilizan DeltaNet (atencion lineal) y 6 mantienen atencion completa, siguiendo el estilo de Qwen3.5. El modelo deriva de un modelo base denominado decider-2b. El mecanismo de salida no es generativo: la respuesta se lee del estado oculto en una posicion designada y se puntua contra los tokens de etiqueta de las opciones declaradas, normalizando exactamente sobre ese conjunto, segun la formula p_k(j | x) = softmax_j(<w_l(k,j), h_k> / tau) indicada en la model card. El soporte de esa distribucion es la propia lista de opciones, de modo que una respuesta fuera de ella es irrepresentable. Se admiten hasta 255 opciones; con diez o menos se usa un renderizado (A) ... (J) y con conjuntos mayores se pasa a etiquetas de un solo token. Al no escribirse ninguna respuesta de vuelta en el prompt, varias preguntas sobre un mismo estado se responden en la misma pasada forward, ya que las decisiones son condicionalmente independientes dado el input.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. El unico dataset citado en la ficha es limberc/this-that-spatial-bench, que se usa como benchmark y no necesariamente como corpus de entrenamiento. La model card indica que el modelo fue entrenado con una formulacion distinta de la misma pregunta respecto al benchmark publicado, por lo que la comparacion mide transferencia y no recuperacion de memoria. El codigo de inferencia esta separado del repositorio de pesos, en github.com/FLock-io/this-that-model.

## Capacidades

- Decision tipada en una sola pasada forward: devuelve el indice de una opcion declarada y su probabilidad, sin generar tokens de salida.
- Distribucion de probabilidad calibrada sobre el conjunto exacto de opciones, utilizable para aplicar umbrales de escalado.
- Salida estructurada garantizada por construccion: no hay parser que pueda fallar ni respuesta fuera del espacio de opciones.
- Hasta 255 opciones por pregunta.
- Multiples preguntas sobre un mismo estado resueltas en la misma pasada, al ser condicionalmente independientes dado el input.
- Inferencia en CUDA, MPS y CPU; en Apple Silicon la carga selecciona MPS automaticamente y se realiza en float16.
- Latencia declarada de aproximadamente 30,9 ms por pregunta en GPU de consumo.
- No se documentan capacidades de generacion de texto, razonamiento abierto, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Verificacion de comandos de shell antes de ejecucion desatendida: el modelo recibe el comando y una lista de opciones del tipo "solo lee estado", "modifica o borra datos", "contacta con la red", y devuelve la categoria con probabilidad asociada. Es adecuado porque la decision es de una sola etiqueta sobre un conjunto cerrado y la latencia de decenas de milisegundos permite hacerlo en linea.
- Enrutado de tickets de soporte: dado el estado de un pedido o una incidencia, decidir entre cola estandar, prioritaria o revision manual, con varias preguntas resueltas en la misma pasada. La salida ya es la etiqueta de cola, sin postprocesado ni validacion adicional.
- Decisiones de politica en comercio electronico: comprobar si un reembolso cae dentro de la ventana permitida, junto con la banda de riesgo y la cola de tramitacion, a partir de un JSON de pedido.
- Control de trafico y limitacion de tasa: decidir si una peticion debe limitarse. La propia model card advierte de que este caso esta fuera de la distribucion de entrenamiento y que con 847 peticiones por minuto el modelo responde "no (71 %)", es decir, baja confianza y respuesta incorrecta, por lo que debe usarse solo con umbral de escalado.
- Guardrails en pipelines de agentes: insertar una comprobacion previa a la ejecucion de una accion (por ejemplo, si una llamada a una herramienta es segura) y escalar a un humano cuando la confianza quede por debajo del umbral configurado.
- Triaje en CI/CD: clasificar un cambio o un artefacto en categorias como "requiere revision manual", "despliegue automatico" o "bloqueado", aprovechando que la salida no puede salirse del conjunto declarado.
- Enrutado de consultas en sistemas de recuperacion: dado un estado de usuario y una pregunta corta, elegir que indice, cola o herramienta debe atender la peticion, con varias decisiones resueltas en un unico paso.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 68 preguntas y 17 estados registrados por un tercero, con formulaciones ajenas al entrenamiento del modelo. La columna de coste por pasada procede de la ficha del autor y no es directamente comparable entre un servicio alojado y una estimacion de electricidad.

| Sistema | Accuracy | Brier (menor mejor) | NLL (menor mejor) | ms/pregunta | Coste de una pasada |
|---|---:|---:|---:|---:|---:|
| baseline de clase mayoritaria | 0,647 | — | — | — | — |
| claude-fable-5-1 | 0,676 | — | — | 2395 | 0,471 $ |
| glm-5.3 | 0,721 | 0,204 | 0,601 | 819 | 0,008 $ |
| qwen3.8-max | 0,735 | 0,263 | 2,681 | 1014 | 0,021 $ |
| NanoJev-0.6B | 0,750 | 0,166 | 0,479 | — | — |
| Jev (servicio alojado System One) | 0,765 | 0,133 | 0,403 | — | — |
| kimi-k3 | 0,779 | 0,143 | 0,430 | 989 | 0,009 $ |
| deepseek-v4.1-flash | 0,794 | — | — | 808 | 0,002 $ |
| gpt-5.6 | 0,926 | — | — | 1180 | 0,018 $ |
| this-that-model-1.0 | 0,926 | 0,046 | 0,139 | 30,9 | 0,000014 $ |

Notas de la propia ficha: un guion bajo Brier y NLL significa que el endpoint no expone probabilidades de token, no que el resultado sea malo; cinco modelos frontera adicionales respondieron correctamente las 68 preguntas y se omiten por saturacion. El coste del modelo propio se calcula como electricidad a 80 W y 0,30 $/kWh, por lo que el autor pide leer la distancia con el servicio alojado como un orden de magnitud y no como cinco.

Calibracion con respuesta de probabilidad calculada (actuador ruidoso):

| Sistema | Accuracy | qL2 (menor mejor) |
|---|---:|---:|
| techo de accuracy (calculado) | 0,746 | — |
| predictor constante | — | 0,0962 |
| this-that-model-1.0 | 0,745 | 0,0248 |

Segun la model card, de nueve modelos frontera alojados medidos sobre las mismas preguntas, solo tres exponen probabilidades de token, y los tres puntuan peor que el predictor constante. La seccion de descomposicion de resultados aparece truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. A partir del recuento de parametros (1,88 B) y del tamano de repositorio de 3,8 GB, la carga en float16 ocupa aproximadamente 3,8 GB de pesos; con activaciones y overhead de runtime, una estimacion razonable es de 5 a 6 GB de VRAM en float16, en torno a 2,5 GB en int8 y 1,5 GB en int4. Estas cifras son estimaciones derivadas y no datos confirmados por el autor.
- GPU adecuadas: la model card afirma que responde en unos 30,9 ms en una GPU de consumo, sin especificar el modelo concreto. Cabe en GPU de consumo actuales; no se publican medidas por modelo (A100, H100, RTX 4090 u otras).
- Apple Silicon: soportado. La carga desde `from_pretrained` selecciona MPS automaticamente y se realiza en float16.
- CPU: soportada por la libreria de inferencia, sin datos de latencia publicados.
- Opciones de despliegue: libreria propia `thisthat` (clase TypedDecider) instalable con `pip install git+https://github.com/FLock-io/this-that-model`, y carga mediante transformers con pesos safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no generar tokens, los motores orientados a decodificacion no encajan de forma directa.
- Latencia: 30,9 ms por pregunta como mediana en el cliente, segun la tabla publicada. No se publican datos de throughput ni de latencia en lote.
- Consumo: la estimacion de coste del autor asume 80 W de potencia.

## Comparativa con modelos similares

La comparacion publicada mezcla modelos locales y servicios alojados, y no ofrece parametros, contexto ni licencia de los sistemas de terceros. Se reproduce lo disponible.

| Modelo | Parametros | Contexto | Licencia | Accuracy (benchmark del autor) | ms/pregunta |
|---|---|---|---|---|---|
| this-that-model-1.0 | 1,88 B | No disponible | MIT | 0,926 | 30,9 |
| gpt-5.6 | No disponible | No disponible | No disponible (servicio propietario) | 0,926 | 1180 |
| deepseek-v4.1-flash | No disponible | No disponible | No disponible (servicio propietario) | 0,794 | 808 |
| kimi-k3 | No disponible | No disponible | No disponible (servicio propietario) | 0,779 | 989 |
| glm-5.3 | No disponible | No disponible | No disponible (servicio propietario) | 0,721 | 819 |
| NanoJev-0.6B | 0,6 B (segun denominacion) | No disponible | No disponible | 0,750 | No disponible |
| Jev (System One, alojado) | No disponible | No disponible | No disponible | 0,765 | No disponible |

## Limitaciones y advertencias

- Fuera de distribucion la calibracion se degrada de forma visible: la propia model card admite que ante una peticion de limitacion de tasa con 847 peticiones por minuto el modelo responde "no (71 %)", una respuesta incorrecta con confianza baja. El escalado por umbral es obligatorio, no opcional.
- El modelo no genera texto. No sirve para resumen, redaccion, codigo ni dialogos; solo devuelve una etiqueta de un conjunto declarado y su probabilidad.
- Idioma unico: ingles. No se documenta soporte de otros idiomas.
- La calidad del resultado depende de la formulacion de las opciones y de la pregunta; el benchmark mide transferencia respecto a una formulacion distinta de la de entrenamiento, pero no se publican datos de sensibilidad al fraseo.
- Limite duro de 255 opciones por pregunta.
- La comparacion de coste de la model card enfrenta electricidad (80 W, 0,30 $/kWh) contra precios de servicio que incluyen servido y margen; el propio autor advierte de que no son numeros del mismo tipo.
- Los resultados publicados son del propio autor y sobre su benchmark; no hay evaluacion independiente ni validacion de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Algunos sistemas comparados en la tabla tienen nombres y cifras que no se pueden contrastar con fuentes externas en la informacion disponible.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base declarado (decider-2b) podria imponer condiciones adicionales que no se detallan en la informacion disponible.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en precision reducida queda por validar por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flock-io/this-that-model-1.0
- Codigo de inferencia: https://github.com/FLock-io/this-that-model
- Dataset de benchmark: https://huggingface.co/datasets/limberc/this-that-spatial-bench
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a documentacion de soporte de Windows y no guardan relacion con esta ficha.
