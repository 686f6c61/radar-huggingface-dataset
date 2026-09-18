# AInVFX/ainvfx-fluid

## Resumen

ainvfx-fluid es un IC-LoRA (in-context LoRA) para el transformer de difusion de video LTX 2.5, desarrollado por AInVFX. Su funcion es convertir keyframes pintados a mano con manchas de color plano en simulaciones de fluidos animadas: humo, vapor y fuego. El flujo de trabajo consiste en pintar el primer y el ultimo fotograma (y opcionalmente algunos intermedios) con colores planos sobre fondo negro, y el LoRA sustituye esas manchas por el fluido correspondiente, interpolando la animacion entre keyframes. La palabra de activacion es `ainvfxfluid`.

El modelo esta pensado para compositing y previz, es decir, como generador de stock footage dirigible artisticamente en lugar de como sustituto de una simulacion CFD. Se distribuye como un unico archivo safetensors de 654 MB en formato ComfyUI, con rango 32, que se aplica sobre el modelo base Lightricks/LTX-2.5 (transformer de 22 000 millones de parametros, en variante dev o destilada). El repositorio es pequeno (0,7 GB) y la publicacion es muy reciente: creado el 11 de septiembre de 2026 y actualizado el 17 del mismo mes, con 185 descargas y 7 likes en el momento de redactar esta ficha.

Su relevancia actual reside en que resuelve un cuello de botella clasico del pipeline de VFX: obtener humo o fuego con una direccion artistica concreta sin recurrir a simulacion fisica ni a rodaje de elementos practicos. Al ser un IC-LoRA de video-a-video con control por keyframes, el artista mantiene el control de la composicion y del movimiento sin necesidad de escribir prompts largos ni de invertir horas de simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA de rango 32 sobre el transformer de difusion de video LTX 2.5 (Lightricks) |
| Parametros totales | 654 MB de pesos LoRA; el modelo base LTX 2.5 tiene 22 000 millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; depende del modelo base LTX 2.5 y el video de control debe tener la misma longitud que la salida (los ejemplos usan clips a 24, 25 o 50 fps) |
| Tipos de cuantizacion | no publicados para el LoRA; los ejemplos de la model card usan el transformer destilado de LTX 2.5 en int8 |
| Idiomas soportados | en (ingles) |
| Licencia | LTX-2.x Community License (etiquetada como `other`) |
| Formato de pesos | safetensors (archivo unico, formato ComfyUI) |
| Modelo base | Lightricks/LTX-2.5 (relacion: adapter) |
| Pipeline | video-to-video |
| Palabra de activacion | `ainvfxfluid` |
| Entrada de control | Video de control con la misma resolucion y longitud que la salida: keyframes pintados en colores planos y fotogramas negros entre ellos |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un LoRA de tipo IC (in-context) de rango 32 aplicado sobre LTX 2.5, un transformer de difusion para generacion de video de 22 000 millones de parametros. El LoRA no modifica la arquitectura del transformer: se carga como adaptador y condiciona la generacion a partir de un video de control que contiene los keyframes pintados. En la practica, el mecanismo es de video-a-video con guia por keyframes: el video de control aporta la estructura temporal (primer fotograma, ultimo fotograma y, si se desea, fotogramas intermedios) mediante manchas de color plano, y el adaptador aprende a reinterpretar esas manchas como volumenes de humo, vapor o fuego coherentes en el tiempo.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados. El autor remite a un articulo propio y a un tutorial en video de 45 minutos para conocer el proceso de entrenamiento. Si se publican los parametros de inferencia recomendados por el autor a partir de los ejemplos: transformer destilado de LTX 2.5 en int8, 8 pasos de muestreo, CFG 1, sampler `euler_ancestral`, semilla 42, fuerza de LoRA 1.0 y prompt negativo `blurry, low quality, distorted, watermark`. El framerate de salida sigue el del video de control.

## Capacidades

- Generacion de video de fluidos: humo, vapor y fuego animados a partir de keyframes pintados con colores planos.
- Control por keyframes: primer y ultimo fotograma obligatorios, con posibilidad de anadir fotogramas intermedios adicionales.
- Video-a-video de la misma resolucion y longitud que el video de control.
- Interpolacion temporal entre keyframes manteniendo la coherencia del movimiento del fluido.
- Direccion artistica mediante prompt de texto (por ejemplo, `ainvfxfluid, wild fire` o `ainvfxfluid, smoke plume rising over a city, blue sky, aerial view`).
- Soporte de prompt negativo, empleado en los ejemplos con `blurry, low quality, distorted, watermark`.
- Integracion en ComfyUI mediante el node pack oficial ComfyUI-LTXVideo, que aporta el cargador de IC-LoRA y los nodos de guia.
- Flujo de pintado integrado: el workflow incluido permite pintar los dos keyframes dentro de ComfyUI.
- No soporta tool calling, function calling, agentes, matematicas, codigo, vision ni audio: es un modelo generativo de video, no un modelo de lenguaje.

## Casos de uso

- Previsualizacion de VFX en produccion audiovisual: el equipo de previz puede pintar manchas de color sobre dos keyframes y obtener una animacion de humo o fuego lo bastante creible para validar timing y encuadre antes de comprometer presupuesto en simulacion o rodaje de elementos practicos.
- Generacion de stock footage art-directable: estudios y freelances pueden producir clips de humo, vapor o llamas con composicion y movimiento controlados, evitando la dependencia de bibliotecas de stock con planos predefinidos y coste por licencia.
- Compositing sobre placas fotograficas o de video existentes: en el ejemplo 05 el autor pinta humo sobre una fotografia real y el resultado conserva la composicion y los colores, lo que permite integrar el efecto sobre material ya rodado sin volver a simular la escena completa.
- Iteracion rapida de look-dev de efectos: al no requerir simulacion fisica, cada iteracion de direccion artistica (densidad, direccion del viento, color de la llama) se resuelve con un nuevo pintado y una nueva generacion, en lugar de reconfigurar y reejecutar un solver.
- Planos de transicion entre dos estados: el control por primer y ultimo keyframe permite generar la evolucion de una columna de humo o una explosion entre dos momentos definidos, util para inserts y transiciones de montaje.
- Contenido para videojuegos, motion graphics y publicidad: generacion de elementos de humo o fuego para pantallas de carga, trailers, banners animados y loops a 24, 25 o 50 fps segun el material de control.
- Produccion de material de referencia para artistas de efectos: clips generados que sirven como referencia visual para animadores y TD encargados de reproducir el efecto en un motor de tiempo real o en un software de simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, PSNR, SSIM ni comparaciones cuantitativas con otros modelos), y los resultados de busqueda web consultados no aportan datos tecnicos sobre este modelo.

Como referencia reproducible, la model card documenta los parametros de inferencia utilizados en las seis muestras publicadas:

| Parametro de generacion | Valor |
|---|---|
| Modelo base | LTX 2.5 22B destilado, int8 |
| Pasos de muestreo | 8 |
| CFG | 1 |
| Sampler | `euler_ancestral` |
| Semilla | 42 |
| Fuerza de LoRA | 1.0 |
| Prompt negativo | `blurry, low quality, distorted, watermark` |
| Resoluciones de ejemplo | 960 x 512, 512 x 960, 512 x 512 |
| Framerate | el del video de control (24, 25 o 50 fps) |

Las muestras son seis pares control/resultado; el autor indica que ninguno de los clips de origen formaba parte del conjunto de entrenamiento.

## Requisitos de hardware

- El archivo del LoRA ocupa 654 MB, pero el consumo de VRAM lo domina el modelo base: LTX 2.5 es un transformer de 22 000 millones de parametros.
- VRAM estimada para inferencia: no publicada por el autor. Como referencia deducida del tamano del modelo base, el transformer en int8 ocupa del orden de 22 GB de pesos, a lo que hay que sumar el VAE, los latentes de video y el resto del pipeline; se trata de una estimacion, no de un dato oficial.
- GPU recomendadas: no disponible. Por el tamano del modelo base, el rango habitual para este tipo de transformer de 22B en int8 esta en GPUs de 24 GB o mas; una RTX 4090 (24 GB) queda en el limite y podria requerir offloading.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Las muestras se generaron con el transformer destilado en int8, lo que reduce el coste respecto a la variante dev completa.
- Opciones de despliegue: ComfyUI con el node pack ComfyUI-LTXVideo (cargador de IC-LoRA y nodos de guia). Los frameworks de servido de LLM como vLLM, llama.cpp, Ollama o TGI no son aplicables a este tipo de modelo de difusion de video.
- Latencia y throughput: no disponibles. Con 8 pasos y CFG 1 en el transformer destilado, el coste por clip es bajo en numero de evaluaciones, pero el autor no publica tiempos de generacion ni resolucion maxima soportada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. Los resultados de busqueda web consultados no devolvieron informacion tecnica relevante sobre este modelo ni sobre alternativas.

A modo de contexto, se puede comparar el LoRA con su propio modelo base:

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AInVFX/ainvfx-fluid | IC-LoRA (rank 32) sobre LTX 2.5 | 654 MB de adaptador sobre base de 22B | Keyframes pintados + prompt | LTX-2.x Community License | HuggingFace, 185 descargas, 7 likes |
| Lightricks/LTX-2.5 | Transformer de difusion de video | 22B (variantes dev y destilada) | Texto (y control segun variante) | LTX-2.x Community License | HuggingFace (modelo base) |

Las diferencias de rendimiento frente a otros IC-LoRA de humo y fuego para modelos de video alternativos no pueden establecerse con los datos disponibles.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo LTX-2.x Community License, etiquetada como `other`. Es imprescindible revisar los terminos en el enlace de licencia antes de cualquier uso comercial, ya que las condiciones de atribucion, redistribucion y uso comercial no se detallan en la model card.
- La licencia del LoRA es heredada del modelo base LTX 2.5, por lo que las restricciones del transformer de Lightricks condicionan tambien el uso del adaptador.
- Idioma: los prompts solo estan soportados en ingles.
- Riesgo de desviacion respecto al control: los keyframes son una guia, no una restriccion dura. En el ejemplo 05 el resultado conserva la composicion y los colores de la fotografia de entrada, pero no reproduce la foto exacta; el LoRA puede reinterpretar las manchas pintadas de forma no prevista.
- No es una simulacion fisica: genera apariencia de fluidos, no resultados con validez ingenieril. No debe usarse para analisis de comportamiento de humos, incendios o ventilacion.
- Divulgacion obligatoria: el autor senala que los archivos de muestra no llevan manifiesto C2PA y que la disclosure se realiza mediante el nombre de archivo y una nota en la model card. En produccion conviene anadir marcado de contenido generado por IA.
- Dependencia de terceros: requiere ComfyUI y el node pack ComfyUI-LTXVideo, ademas de los modelos LTX 2.5 de los workflows de ejemplo (transformer, VAE y resto de componentes). La seccion de uso de la model card esta truncada en la informacion disponible, por lo que los pasos completos deben consultarse en el origen.
- Resolucion y longitud limitadas por el material de control: el video de control debe tener la misma resolucion y longitud que la salida, lo que acota el rango de formatos utilizables.
- Validacion comunitaria escasa: 185 descargas y 7 likes, con una unica muestra de la comunidad documentada. No hay benchmarks publicados que respalden el rendimiento fuera de los ejemplos del autor.
- Rendimiento dependiente del prompt negativo y de los parametros de muestreo documentados; no se ha publicado una evaluacion de sensibilidad a estos valores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AInVFX/ainvfx-fluid
- Pesos del LoRA: https://huggingface.co/AInVFX/ainvfx-fluid/blob/main/ltx-2.5/ainvfx-fluid.safetensors
- Workflow de ComfyUI: https://huggingface.co/AInVFX/ainvfx-fluid/blob/main/workflow/ainvfx-fluid_painted_smoke_plume.json
- Muestras (pares control/resultado): https://huggingface.co/AInVFX/ainvfx-fluid/tree/main/samples
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Node pack ComfyUI-LTXVideo: https://github.com/Lightricks/ComfyUI-LTXVideo
- Tutorial en video (45 minutos): https://www.youtube.com/watch?v=Ho4tmJzEkIs
- Articulo del autor sobre el entrenamiento y el uso: https://www.ainvfx.com/blog/paint-your-fluid-simulations-a-free-ltx-2-5-ic-lora-for-smoke-and-fire-in-comfyui/
- Sitio del autor: https://www.ainvfx.com
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas de un servicio de video bajo demanda sin relacion con la ficha.
