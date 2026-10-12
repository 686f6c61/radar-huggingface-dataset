# mxv456/qwen3-vl-2b-lora-map-routes

## Resumen

mxv456/qwen3-vl-2b-lora-map-routes es un adaptador LoRA publicado por mxv456 (Marvin Uhlmann) que se monta sobre el modelo base multimodal Qwen/Qwen3-VL-2B-Instruct. Resuelve una tarea muy concreta: dada una imagen de mapa cenital en la que aparecen un disco verde (origen) y un disco rojo (destino), el modelo debe devolver la ruta a pie entre ambos como una lista JSON de puntos expresados en la rejilla de grounding 0-1000 propia de Qwen. Es la linea base vision-lenguaje del proyecto spatial-reasoning-from-scratch.

El interes practico del adaptador no esta en su tamano, sino en que demuestra que un VLM denso de 2.000 millones de parametros, ajustado con LoRA sobre apenas el 0,3 % de sus pesos, puede aprender razonamiento espacial de tipo path-finding sobre mapas renderizados. Con 19.309 rutas de entrenamiento alcanza un 49,6 % de rutas resueltas bajo una regla estricta (extremos a menos de 6 m de los marcadores, ningun segmento cruzando un edificio y longitud como maximo 1,10 veces la ruta peatonal de referencia). Para comparar, el mismo modelo base sin ajustar resuelve el 2,5 % con 200 rutas y Qwen3-VL-4B zero-shot se queda en el 24,5 %.

Se trata de un artefacto de investigacion especializado, no de un asistente generalista: su licencia Apache-2.0 facilita la reutilizacion, pero esta entrenado y evaluado sobre un unico distrito (De Pijp, Amsterdam) con un unico estilo de renderizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer vision-lenguaje denso (Qwen3-VL-2B-Instruct) |
| Parametros totales | Modelo base de ~2.000 millones de parametros; el adaptador entrena ~0,3 % de los pesos (LoRA r=16, α=32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en precision completa y depende de las opciones admitidas por el modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16, α 32 y dropout 0,05 exclusivamente a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` del modelo de lenguaje; la torre de vision permanece congelada. Entrenar solo esas matrices supone aproximadamente el 0,3 % de los parametros totales. El ajuste se hizo con AdamW a learning rate 2e-4, scheduler coseno con 5 % de warmup, batch efectivo de 4, 3 epocas, bf16 y gradient checkpointing, en una unica RTX 3060 durante unas 8 horas. No se empleo aprendizaje por refuerzo ni alineacion adicional posterior.

Los datos de entrenamiento son 19.309 rutas del conjunto de entrenamiento de De Pijp (Amsterdam), renderizadas a 2 px por metro sobre imagenes de 512 px con edificios en oscuro, origen en verde y destino en rojo. El objetivo de supervision es la ruta peatonal mas corta exacta, simplificada a una polilínea y expresada en la rejilla 0-1000 del modelo base. Se excluyeron las rutas cuyo camino salia de la ventana renderizada. El prompt utilizado es `route_v1`, definido en el directorio `qwen_reference/` del repositorio del proyecto.

## Capacidades

- Generacion de imagenes a texto: recibe una imagen de mapa y una instruccion en lenguaje natural y produce una respuesta textual.
- Grounding 2D mediante la rejilla de coordenadas 0-1000 de Qwen, lo que permite devolver puntos absolutos referidos a la imagen.
- Salida estructurada: la respuesta es una lista JSON de puntos `[x, y]` que describe una polilínea, apta para consumo por programas.
- Razonamiento espacial y path-finding: resuelve la ruta a pie entre dos marcadores esquivando las huellas de edificios representadas en el mapa.
- Interpretacion de convenciones visuales aprendidas: disco verde como origen, disco rojo como destino, edificios en tono oscuro.
- Capacidad de generalizacion limitada a rutas de distinta longitud (evaluada en tramos de 40 a mas de 200 metros).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo produce la ruta en una sola pasada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no documentadas. El modelo base es multimodal de imagen y texto.

## Casos de uso

- Asistencia a la navegacion peatonal sobre planos renderizados: el adaptador convierte una imagen de mapa y dos marcadores en una polilínea JSON que una aplicacion puede superponer sobre el propio mapa o convertir a GeoJSON. Es adecuado porque su salida ya esta en un sistema de coordenadas normalizado y lista para pintar.
- Prototipado de planificadores de ruta en videojuegos y simuladores: permite generar caminos peatonales sobre mapas cenitales sin implementar un A* especifico, siempre que el estilo de renderizado se parezca al de entrenamiento.
- Banco de pruebas para investigacion en razonamiento espacial de VLMs: sirve como linea base reproducible frente a metodos iterativos o redes especializadas, con una regla de evaluacion objetiva (extremos a 6 m, sin cruzar edificios, longitud acotada a 1,10 veces la referencia).
- Destilacion y generacion de datos sinteticos: las rutas producidas pueden filtrarse con la regla de la polilínea y usarse como pseudoetiquetas para entrenar modelos mas pequenos o alimentar busquedas tipo wave search.
- Previsualizacion en herramientas GIS y de cartografia: a partir de un tile de mapa ya renderizado, el modelo propone un trazado peatonal aproximado para revision humana antes de calcular la ruta definitiva con un motor de rutas.
- Robotica de interior con plano cenital: en escenarios donde el robot dispone de un plano de planta renderizado en lugar de un mapa metrico completo, el adaptador puede traducir dos puntos de interes en una trayectoria aproximada que despues se refina con control local.
- Accesibilidad para personas con discapacidad visual: dado un mapa en relieve o renderizado a alto contraste, el sistema puede verbalizar la ruta resultante, aunque el adaptador en si no esta entrenado para mapas tatiles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de validacion de De Pijp, 500 rutas retenidas, renderizados de mapa de 512 px). La regla de exito exige que inicio y fin queden a menos de 6 m de los marcadores, que ningun segmento cruce un pixel de edificio y que la longitud no supere 1,10 veces la ruta peatonal de referencia:

| Modelo | Resueltas | 2-3 tramos | 4-5 tramos | 6+ tramos | Fallo mas frecuente |
|---|---|---|---|---|---|
| Qwen3-VL-2B zero-shot (200 rutas) | 2,5 % | 6 % | 2 % | 0 % | Extremos incorrectos, 92 % |
| Qwen3-VL-4B zero-shot (200 rutas) | 24,5 % | 35 % | 35 % | 2 % | Cruza un edificio, 52 % |
| Este adaptador, 1k rutas de entrenamiento | 21,4 % | 58 % | 28 % | 1 % | Extremos 39 %, cruces 36 % |
| Este adaptador, 5k rutas de entrenamiento | 31,0 % | 74 % | 38 % | 8 % | Cruces 47 % |
| Este adaptador, 19,3k rutas de entrenamiento | 49,6 % | 81 % | 62 % | 28 % | Cruza un edificio, 36 % |
| Linea recta entre marcadores (suelo) | 27,6 % | 73 % | 36 % | 2 % | Cruza un edificio |
| Wave search iterativo, red de 9 M de parametros, misma regla | 76,4 % | 93 % | 87 % | 63 % | Hueco en el trazado |

Metrica registrada en el model-index del repositorio: `solved-share` = 0,496 sobre 500 rutas de validacion (marcada como no verificada, `verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de ~2.000 millones de parametros ocupa en torno a 4-5 GB en bf16 y aproximadamente 5-7 GB contando el procesador de vision, el cache KV y el overhead del runtime. En cuantizacion de 4 bits el peso baja a cerca de 1,5-2 GB, con un consumo total tipico de 3-4 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bf16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 funcionan sin problema. El propio autor entreno en una RTX 3060, lo que confirma que el ajuste tambien cabe en hardware de consumo.
- Cabe en GPU de consumo: si. Con 8 GB de VRAM es suficiente para inferencia en bf16 y con 4-6 GB basta en cuantizacion de 4 bits.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `PeftModel.from_pretrained` (ruta documentada por el autor), vLLM o TGI fusionando el adaptador en los pesos base, y llama.cpp/Ollama previa conversion a GGUF del modelo fusionado. El adaptador por si solo no es ejecutable: requiere descargar el modelo base Qwen/Qwen3-VL-2B-Instruct.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento completo del adaptador requirio unas 8 horas en una RTX 3060.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mxv456/qwen3-vl-2b-lora-map-routes | Base ~2B, adaptador ~0,3 % de pesos | Rutas peatonales sobre mapa a polilínea JSON | No disponible | Apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3-VL-2B-Instruct zero-shot | ~2B | Vision-lenguaje generalista | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct zero-shot | ~4B | Vision-lenguaje generalista | No disponible | Apache-2.0 | HuggingFace |
| Wave search iterativo (red propia de 9 M) | ~9 M | Rutas peatonales sobre mapa | No aplica | No disponible | Repositorio del proyecto |
| Linea recta entre marcadores | 0 | Baseline trivial | No aplica | No aplica | No aplica |
| graahand/qwen-vl-2b-lora | ~2B | Extraccion OCR de clave-valor en documentos | No disponible | No disponible | HuggingFace |
| jeffelin/QwenNav | ~2B | Navegacion de robot cuadrupedo desde imagen de camara | No disponible | No disponible | GitHub |

La comparacion relevante es interna: el adaptador supera claramente a su propio modelo base zero-shot (49,6 % frente a 2,5 % en 2B y 24,5 % en 4B) y a la linea recta, pero queda por debajo de la red especializada de 9 millones de parametros del mismo proyecto (76,4 %), que sigue siendo el mejor resultado publicado con esta regla de evaluacion.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado y evaluado sobre un unico distrito de una unica ciudad (De Pijp, Amsterdam) y con un unico estilo de renderizado (2 px por metro, 512 px, edificios oscuros). No hay pruebas con mapas ilustrados, satelitales o reales.
- Error dominante: el fallo mas frecuente sigue siendo trazar un segmento que cruza un edificio (36 % de los fallos con 19,3k rutas), es decir, produce "cuerdas" a traves de manzanas.
- Alucinacion de coordenadas: al no haber verificado la metrica (`verified: false`), los numeros proceden unicamente del autor. Ademas, el modelo puede devolver puntos fuera del area visible o extremos alejados de los marcadores si la imagen se sale de la distribucion de entrenamiento.
- Sensibilidad al prompt: la evaluacion depende del prompt `route_v1` y de la conversion de coordenadas del repositorio; desviarse de ese formato puede degradar la calidad de la salida.
- Sin refuerzo ni alineacion adicional: no se aplico RLHF ni DPO despues del ajuste supervisado.
- Licencia: el adaptador es Apache-2.0, coherente con el modelo base, lo que permite uso comercial. Sin embargo, las licencias de los datos de mapa utilizados en el entrenamiento se documentan aparte en `DATA_LICENSES.md` del repositorio, por lo que conviene revisarlas antes de un despliegue en produccion.
- Cero traccion publica: en la fecha de los datos, el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion independiente de los resultados ni reportes de uso en produccion.
- Rendimiento: no apto como sustituto de un motor de rutas real en un producto de navegacion; el propio wave search del proyecto lo supera en 26,8 puntos porcentuales con 200 veces menos parametros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mxv456/qwen3-vl-2b-lora-map-routes
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Repositorio del proyecto spatial-reasoning-from-scratch: https://github.com/Marvel4U/spatial-reasoning-from-scratch
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Adaptador OCR de referencia sobre Qwen-VL-2B: https://huggingface.co/graahand/qwen-vl-2b-lora
- VLM2Vec-Qwen2VL-2B, modelo de embeddings multimodales con base Qwen-VL-2B: https://huggingface.co/TIGER-Lab/VLM2Vec-Qwen2VL-2B
- QwenNav, pipeline de ajuste LoRA de Qwen3-VL-2B para navegacion de robot: https://github.com/jeffelin/QwenNav
- Documentacion de ajuste LoRA en el ecosistema Qwen-VL: https://deepwiki.com/QwenLM/Qwen-VL/5.3-lora-fine-tuning
