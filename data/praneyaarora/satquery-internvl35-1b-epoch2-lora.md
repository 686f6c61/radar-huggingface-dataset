# Praneyaarora/satquery-internvl35-1b-epoch2-lora

## Resumen

SatQuery InternVL3.5-1B Epoch-2 LoRA es un adaptador PEFT/LoRA publicado por el usuario Praneyaarora sobre el modelo base OpenGVLab/InternVL3_5-1B-Instruct. No se trata de un modelo completo, sino de un adaptador de bajo rango que especializa un VLM compacto de ~1.070 millones de parametros en teledeteccion: grounding espacial en lenguaje natural, localizacion de objetos pequenos en raster satelital, VQA sobre escenas de observacion de la Tierra y descripcion densa de escenas.

El adaptador forma parte de SatQuery, un sistema agentico de inteligencia de observacion de la Tierra que combina el VLM con herramientas geoespaciales deterministas (descarga optica/SAR, indices de vegetacion, reproyeccion, analisis de terreno y deteccion de cambios). La premisa arquitectonica es explicita: el VLM se encarga de la interpretacion semantica y del grounding aproximado en espacio de imagen, mientras que los calculos exactos (NDVI, CRS, matrices afines, areas de poligonos) se delegan a herramientas deterministas.

Es relevante por su tamano: con 1,07 mil millones de parametros totales, 10,09 millones entrenables (~0,94 %) y un pico de 2,63 GB de VRAM durante el entrenamiento, es un candidato para inferencia en GPU de consumo y para despliegue embebido en pipelines de teledeteccion. La model card reporta mejoras sustanciales de grounding frente al modelo base zero-shot, aunque el repositorio no tiene descargas ni likes y la licencia es "other", pendiente de verificar para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre InternVL3.5-1B-Instruct: LLM causal basado en Qwen + vision encoder InternVision (~300 M de parametros, congelado) + proyector cross-modal MLP (congelado) |
| Parametros totales | 1.070.990.336 (~1,06 mil millones) en el modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables del adaptador | 10.092.544 (~0,9424 % del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16; el adaptador se distribuye sin cuantizar) |
| Idiomas soportados | Ingles (en) |
| Licencia | other |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`) |
| Tamano del repositorio | 0,0 GB |
| Pipeline | image-text-to-text |
| Modelo base | OpenGVLab/InternVL3_5-1B-Instruct |
| Hiperparametros LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Modulos objetivo LoRA | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre las capas de proyeccion del modelo de lenguaje, manteniendo congelados el vision encoder InternVision (~300 M de parametros) y el proyector cross-modal MLP. La configuracion LoRA es r = 16, alpha = 32 y dropout = 0,05, con 10.092.544 parametros entrenables sobre un total de 1.070.990.336. El entrenamiento uso precision BF16 con gradient checkpointing activado, micro-batch de 1 y 8 pasos de acumulacion de gradiente, lo que da un batch efectivo de 8.

El corpus de SFT (SatQuery 15K) contiene 15.000 pares instruccion-multimodales deduplicados sobre 11.326 imagenes unicas de teledeteccion: 12.000 muestras (80 %) de grounding espacial con bounding boxes en lenguaje natural, 2.250 (15 %) de VQA multirruonda sobre cobertura del suelo, infraestructura y agua, y 750 (5 %) de captioning denso de escenas. La model card declara 0 registros duplicados, 0 sobremuestreo sintetico y 0 fuga de evaluacion. Todas las cajas se normalizan estrictamente como `[ymin, xmin, ymax, xmax]` con valores en [0, 1] y origen en la esquina superior izquierda.

El run (`internvl35_satquery_stage2_2epoch_20260927_191016`) completo 2 epocas, 30.000 exposiciones de muestra y 3.750 pasos de optimizador en ~5 h 42 min 23 s (la segunda epoca, 2 h 47 min 58 s), con un throughput de ~1,46-1,49 muestras/s y un pico de 2,63 GB de VRAM en PyTorch. No se registraron errores OOM, NaN/Inf ni fallos de muestra. La perdida media bajo de ~0,8655 (epoca 1) a ~0,5537 (epoca 2), con una perdida final de 0,4784 (media movil 0,5331). No se menciona RLHF ni DPO: el entrenamiento es SFT puro.

## Capacidades

- Grounding espacial en lenguaje natural: genera bounding boxes en coordenadas normalizadas `[ymin, xmin, ymax, xmax]` para objetos descritos textualmente en imagenes aereas y satelitales.
- Localizacion de objetos pequenos (tiny-object localization) en raster de teledeteccion.
- VQA con evidencia visual sobre escenas de observacion de la Tierra: cobertura del suelo, infraestructura y masas de agua, con razonamiento multirruonda.
- Captioning tecnico denso de escenas de teledeteccion.
- Descripcion de cambios visuales entre imagenes.
- Salida estructurada de coordenadas sin cabezas de grounding externas.
- Conversacion multimodal multirruonda (heredada de InternVL3.5-1B-Instruct).
- Interpretacion semantica de imagen; el calculo geoespacial determinista (NDVI, reproyeccion, areas) queda fuera del modelo y se delega a herramientas del sistema SatQuery.
- Idiomas: solo ingles.
- No se documenta soporte de tool calling, function calling, modo thinking, audio ni video en la informacion disponible.

## Casos de uso

- Localizacion de infraestructura critica en imagenes satelitales: el adaptador devuelve cajas normalizadas para consultas como "carretera" o "deposito de agua", lo que permite generar candidatos de ROI que despues se validan con herramientas geoespaciales deterministas.
- Deteccion asistida de cambios: comparar dos capturas de la misma zona y pedir al modelo una descripcion de los cambios observados, usando su capacidad de captioning y VQA sobre escenas.
- Analisis de cobertura del suelo a escala regional: VQA multirruonda para clasificar y describir tipos de superficie en mosaicos de imagenes, adecuado por su bajo coste de inferencia frente a VLMs de mayor tamano.
- Respuesta a desastres: consultas rapidas en lenguaje natural sobre imagenes de inundaciones o incendios para priorizar la revision humana, dado que el modelo localiza y describe, pero no calcula areas exactas.
- Monitorizacion agricola asistida: descripcion de escenas de cultivo y localizacion de parcelas; los indices de vegetacion se calculan fuera del modelo, en las herramientas deterministas de SatQuery.
- Indexado y etiquetado de archivos de imagenes de observacion de la Tierra: generar captions tecnicos y anotaciones de cajas para construir catalogos buscables sobre grandes volumenes de imagenes.
- Asistente de anotacion para equipos de teledeteccion: preanotar bounding boxes con IoU@0,50 del 54,4 % y dejar la correccion manual, reduciendo el coste de etiquetado en dominios especificos.
- Prototipado en GPU de consumo: al ser un adaptador de un modelo de ~1 B, permite experimentar con grounding satelital en hardware limitado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto congelado de 2.300 muestras por modelo (6.900 evaluaciones totales, 0 fallos) en los benchmarks de observacion de la Tierra VRSBench, RSVQA-HR y SECOND. La tabla publicada en la model card queda truncada en la ultima fila ("Grounding Format..."), por lo que no se pueden recuperar las metricas posteriores.

| Metrica | InternVL3.5-1B zero-shot | SatQuery Epoch-2 (este checkpoint) | SatQuery Epoch-3 |
|---|---|---|---|
| VRSBench Overall | 30,28 % | 43,55 % | 42,69 % |
| Grounding Mean IoU | 0,0434 | 0,4786 | 0,4799 |
| Grounding Median IoU | 0,0000 | 0,5262 | 0,5330 |
| Grounding IoU@0,25 | 8,00 % | 75,20 % | 75,60 % |
| Grounding IoU@0,50 | 0,80 % | 54,40 % | 54,80 % |
| Grounding IoU@0,75 | 0,00 % | 21,60 % | 20,80 % |
| Grounding Coord MAE | 0,3970 | 0,0599 | 0,0598 |
| Grounding Format | truncado en la fuente | truncado en la fuente | truncado en la fuente |

No se han publicado en la informacion disponible los resultados desglosados de RSVQA-HR ni de SECOND, ni metricas de captioning o VQA mas alla del agregado de VRSBench.

## Requisitos de hardware

- El adaptador LoRA es minimo: 10.092.544 parametros entrenables, por debajo de 50 MB en safetensors. Debe cargarse junto al modelo base; la model card indica que este repositorio no aloja los pesos base.
- El repositorio figura con 0,0 GB, coherente con un adaptador sin pesos del modelo base.
- VRAM de inferencia estimada a partir del recuento de parametros del modelo base (1,07 B), no publicada por el autor: ~2,1 GB en BF16, ~1,1 GB en INT8 y ~0,6 GB en INT4, mas el overhead de activaciones y del vision encoder (los ~300 M del encoder ya estan, segun la model card, dentro del computo de parametros base).
- Entrenamiento: pico medido de 2,63 GB de VRAM en PyTorch con BF16, gradient checkpointing y micro-batch 1, lo que indica que el ajuste fino cabe en GPU de gama media.
- Cabe en GPU de consumo: si cabe el InternVL3.5-1B base, el adaptador no anade requisito apreciable. Cualquier GPU con 6-8 GB o mas deberia ser suficiente en precision reducida; en BF16, 8 GB es un margen comodo.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060/4060 de 8-12 GB es suficiente para inferencia, y A100/H100 solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: Transformers + PEFT (ruta natural para cargar `adapter_model.safetensors`), vLLM y TGI para servir el modelo base fusionado con el adaptador. llama.cpp u Ollama requeririan convertir el modelo base a GGUF y aplicar el adaptador, algo que la model card no documenta.
- Latencia y throughput de inferencia: no disponibles. El unico dato de rendimiento publicado es de entrenamiento: ~1,46-1,49 muestras/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRSBench Overall | Grounding Mean IoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SatQuery InternVL3.5-1B Epoch-2 (este) | 1,07 B base + adaptador de 10,09 M | no disponible | 43,55 % | 0,4786 | other | HuggingFace, adaptador PEFT |
| InternVL3.5-1B-Instruct zero-shot | 1,07 B | no disponible | 30,28 % | 0,0434 | no disponible en esta informacion | HuggingFace (OpenGVLab) |
| SatQuery Epoch-3 (mismo autor) | 1,07 B base + adaptador | no disponible | 42,69 % | 0,4799 | other | HuggingFace |

No se dispone de datos comparativos con otros VLMs de teledeteccion (por ejemplo alternativas alojadas por otros autores en el ecosistema SatQuery) mas alla de lo listado en la busqueda web, donde no se publican parametros, contexto ni metricas. Cualquier comparacion con modelos de mayor tamano requeriria evaluacion propia.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos. El uso comercial debe verificarse contra la licencia del modelo base OpenGVLab/InternVL3_5-1B-Instruct antes de cualquier despliegue en produccion.
- El repositorio solo contiene el adaptador; sin los pesos del modelo base no es utilizable.
- Cobertura idiomatica limitada al ingles.
- Entrenado sobre un corpus especifico de 15.000 pares y 11.326 imagenes unicas: puede degradarse fuera de la distribucion de sensores, resoluciones y regiones geograficas de ese corpus (el ecosistema SatQuery menciona cobertura de India).
- Riesgo de alucinacion en coordenadas y en descripciones: el MAE de coordenadas reportado es 0,0599, es decir, hay error residual en las cajas, y las descripciones de escena pueden afirmar elementos no presentes.
- IoU@0,75 del 21,60 %: el grounding preciso de objetos muy pequenos sigue siendo limitado.
- Convencion de coordenadas estricta `[ymin, xmin, ymax, xmax]` normalizada; usarla mal produce cajas incorrectas silenciosamente.
- El modelo no debe usarse para matematicas geoespaciales deterministas (NDVI, reproyeccion, areas); la propia arquitectura SatQuery delega esas operaciones a herramientas externas.
- Sensibilidad a sesgos: no se documenta ningun analisis de sesgo, y el corpus es cerrado y de origen "custom", sin composicion geografica detallada.
- Repositorio sin descargas ni likes y con 0,0 GB de tamano, lo que sugiere validacion externa nula.
- La tabla de benchmarks de la model card esta truncada, por lo que no se pueden auditar todas las metricas declaradas.
- El campo "Creado" del repositorio (2026-09-28) es posterior a los modelos base conocidos; conviene verificar la vigencia y procedencia de los artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praneyaarora/satquery-internvl35-1b-epoch2-lora
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-1B-Instruct
- Adaptador relacionado del ecosistema: https://huggingface.co/raja0007/satquery-satellite-vlm
- Demo SatQuery AI: https://satquery-iota.vercel.app/
- Repositorio GitHub SatQueryAI: https://github.com/SatQueryAI/satQueryAI
- Repositorio GitHub SatQuery (ainaanraza): https://github.com/ainaanraza/SatQuery
- Ficha del problema SIH26167 (SatQuery AI): https://sih2026.vuce.in/ps/SIH26167
