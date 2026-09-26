# RunningHubAI/rh-krea2-asian-realistic-ultimate-edition-lora

## Resumen

rh-krea2-asian-realistic-ultimate-edition-lora es un adaptador LoRA de bajo rango publicado por RunningHubAI (RunningHub) para generacion y edicion de imagen a partir de texto, con pipeline declarado image-text-to-image. Segun la model card, los pesos se han afinado a partir de "krea2", aunque no se documenta la arquitectura ni el tamano del modelo base, ni el rango, el alpha o los hiperparametros del entrenamiento.

El repositorio contiene un unico archivo safetensors de 224 MiB (`YAZHOUXIESHIJIZHIBAN112301_V21.safetensors`), lo que lo situa como un adaptador ligero pensado para cargarse sobre el modelo base dentro de ComfyUI o en la plataforma en la nube RunningHub. El prompt de ejemplo de la model card describe un retrato fotorrealista de una mujer asiatica joven con vestido de lentejuelas morado, lo que orienta el adaptador hacia fotografia de retrato de personas de ascendencia asiatica.

Su relevancia practica es acotada y muy especializada: no es un modelo de lenguaje ni un sistema de razonamiento, sino un ajuste estetico de un modelo de difusion. En el momento de redactar esta ficha acumula 0 descargas y 0 "likes", no publica resultados de evaluacion y no declara licencia propia, lo que limita su adopcion en entornos de produccion sin una revision legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango sobre un modelo de difusion de la familia Krea 2 (arquitectura del modelo base no especificada) |
| Parametros totales | no disponible (peso LoRA de 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no procesa contexto textual largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o del modelo base) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion y generacion de imagen |
| Modelo base declarado | krea2 (sin version ni repositorio indicados) |
| Archivo de pesos | `YAZHOUXIESHIJIZHIBAN112301_V21.safetensors` (224 MiB) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas soportadas | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion | 2026-09-26 (segun metadatos de HuggingFace) |
| Fecha de ultima actualizacion | 2026-09-26 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El autor indica que el ajuste parte de "krea2", pero la model card no detalla el rango del adaptador, el alpha, la tasa de aprendizaje, el numero de pasos, el optimizador, el tipo de precision ni el volumen o composicion del dataset de entrenamiento.

El nombre del archivo de pesos, `YAZHOUXIESHIJIZHIBAN112301_V21`, corresponde a una transliteracion del pinyin chino que cabe interpretar como "version definitiva del realismo asiatico" (亚洲写实极致版), seguido de un identificador numerico y de un sufijo de version `V21`. Esta lectura es coherente con el unico ejemplo de prompt incluido en la model card, centrado en el retrato fotorrealista de una mujer asiatica joven. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion por pasos ni similares), ni se indica si el ajuste se realizo mediante fine-tuning supervisado, LoRA de difusion estandar o alguna variante de destilacion.

## Capacidades

- Generacion de imagenes a partir de instrucciones textuales dentro de un pipeline image-text-to-image.
- Edicion de imagen condicionada por texto, segun la etiqueta de tipo de modelo declarada por el autor ("LoRA (image edit)").
- Especializacion estetica en retrato fotorrealista de personas de ascendencia asiatica, a partir del ejemplo de prompt publicado.
- Integracion directa en flujos de trabajo de ComfyUI mediante carga de LoRA sobre el modelo base.
- Ejecucion en la plataforma en la nube RunningHub y exposicion mediante su API.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues de texto: no disponibles; el unico prompt documentado esta en ingles.
- Modo "thinking", vision o audio: no aplica a este tipo de adaptador.
- Generacion de video: no disponible segun la informacion proporcionada.

## Casos de uso

- Retratos sinteticos para avatares y perfiles: el adaptador permite generar rostros fotorrealistas de personas de ascendencia asiatica con control de vestuario, iluminacion y encuadre a partir de texto, util para equipos que necesitan avatares consistentes sin contratar sesiones fotograficas.
- Previsualizacion de moda y e-commerce: dada la descripcion de vestuario del prompt de ejemplo (vestido de lentejuelas, tirantes finos, corte bob), encaja en pruebas de concepto de catalogo donde se quiere previsualizar una prenda sobre una modelo antes de producir la sesion real.
- Contenido editorial y campañas localizadas para el mercado asiatico: permite adaptar una misma composicion visual a un publico objetivo concreto sin desplazar equipos de produccion.
- Generacion de material de storyboard y moodboards: ilustracion rapida de escenas con una estetica fotografica concreta antes de pasar a produccion con fotografia real.
- Creacion de datasets sinteticos de rostros: apoyo a la investigacion en vision por computador que necesite volumen de imagenes de retrato con atributos controlados, siempre que se respeten las obligaciones legales sobre datos biometricos y derechos de imagen.
- Prototipado en ComfyUI dentro de equipos de diseno: su peso de 224 MiB facilita iterar rapido en un grafo ya existente, cambiando solo la fuerza del LoRA y el prompt, sin reentrenar el modelo base.
- Publicacion de demos interactivas o servicios de generacion de imagen bajo demanda: el despliegue en RunningHub con API permite exponer el adaptador como endpoint sin gestionar infraestructura de GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad, tasas de exito humano) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- Tamano del adaptador: 224 MiB en disco en formato safetensors; el coste de VRAM del propio LoRA es marginal frente al del modelo base.
- VRAM total: no disponible. Depende por completo del modelo base "krea2", cuyo tamano, arquitectura y requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible por la misma razon; no es posible confirmar si el conjunto base mas LoRA cabe en una GPU de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: ComfyUI como entorno local declarado; RunningHub como plataforma en la nube con API; no se mencionan vLLM, TGI, llama.cpp ni Ollama (no aplican a un adaptador de difusion de imagen con este formato de pesos).
- Latencia y throughput: no disponibles.
- Nota de prudencia: cualquier estimacion de VRAM exigiria conocer primero las caracteristicas del modelo base, dato ausente en el repositorio.

## Comparativa con modelos similares

No se dispone de datos verificables de otras alternativas en la informacion proporcionada. A continuacion se recoge la comparacion con los unicos elementos de referencia citados por el autor, marcando como "no disponible" todo aquello que no se documenta.

| Modelo | Parametros | Contexto / resolucion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea2-asian-realistic-ultimate-edition-lora | no disponible (adaptador de 224 MiB) | no disponible | no disponible | no disponible | Hugging Face, RunningHub |
| krea2 (modelo base declarado) | no disponible | no disponible | no disponible | no disponible | no indicada en el repositorio |
| Otros LoRA de la plataforma RunningHub | no disponibles | no disponible | no disponibles | no disponibles | RunningHub |

## Limitaciones y advertencias

- Ausencia total de evaluacion: 0 descargas, 0 "likes" y ningun benchmark publicado; no hay evidencia independiente de calidad ni de fidelidad al prompt.
- Licencia no especificada: la model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original, sin nombrarla. El uso comercial queda en un limbo legal que exige contactar con el autor o con el titular del modelo base antes de cualquier despliegue en produccion.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma. La version concreta de "krea2" no se especifica, por lo que la reproducibilidad no esta garantizada si el modelo base cambia.
- Sesgo de especializacion: el ajuste esta orientado a un fenotipo y una estetica concretos (retrato fotorrealista de personas de ascendencia asiatica). Fuera de ese dominio es probable que degrade la diversidad de resultados o produzca salidas menos controladas.
- Riesgo de uso indebido: la generacion de rostros fotorrealistas facilita la creacion de deepfakes y de imagenes no consentidas. Es responsabilidad del usuario cumplir la normativa aplicable en materia de derechos de imagen y proteccion de datos.
- Artefactos tipicos de los modelos de difusion: caben esperar errores en manos, dedos, texto dentro de la imagen, simetria facial y coherencia de accesorios, aunque no se cuantifica su frecuencia.
- Idiomas: no se declaran idiomas soportados. El prompt de ejemplo esta en ingles, de modo que el comportamiento con prompts en castellano es desconocido y no esta verificado.
- Ausencia de datos de entrenamiento: sin informacion sobre el dataset, no es posible evaluar sesgos de representacion, posible contaminacion de datos ni cumplimiento de derechos de autor de las imagenes de entrenamiento.
- Sin garantia de mantenimiento: la unica actualizacion registrada es del mismo dia de creacion, y no se anuncia soporte, versionado ni plan de mejoras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-asian-realistic-ultimate-edition-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2092195177237913601
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1980864188878884866
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
