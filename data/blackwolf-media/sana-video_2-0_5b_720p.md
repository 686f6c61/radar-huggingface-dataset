# BlackWolf-Media/SANA-Video_2.0_5B_720p

## Resumen

SANA-Video 2.0 5B 720p es un modelo de difusion para generacion de video de alta resolucion, publicado en HuggingFace bajo la cuenta BlackWolf-Media. La model card lo describe como un diffusion transformer eficiente, con un checkpoint de clase 5B post-entrenado de forma conjunta para text-to-video (T2V) y text-image-to-video (TI2V), con salida de 736 x 1280 a 24 FPS durante 193 fotogramas (unos 8 segundos). La arquitectura declarada es `SanaVideo2_5B`, con 4.466.980.960 parametros entrenables (4,47B), 32 capas y un tamano oculto de 2.560.

Su propuesta tecnica se centra en abaratar el coste de atencion sobre secuencias de video largas: combina capas de atencion lineal bidireccional con compuertas (75%) con anclas periodicas de atencion densa softmax (25%), mas una agregacion compartida de residuales de atencion cada 8 capas. El condicionamiento de texto se delega en `google/gemma-2-2b-it` y la parte latente usa el contrato VAE de LTX 2.3, con 128 canales latentes y compresion (8, 32, 32). La licencia del checkpoint es Apache 2.0.

Es relevante ahora porque ofrece generacion de video a 720p en un rango de parametros moderado (4,47B) y bajo una licencia permisiva, lo que lo hace atractivo como base para ajuste fino especifico de dominio. Conviene senalar que el repositorio es una redistribucion: la propia model card remite al repositorio NVlabs/Sana para la inferencia y al checkpoint de Efficient-Large-Model, por lo que la procedencia debe verificarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `SanaVideo2_5B`, diffusion transformer con atencion lineal con compuertas (75%) y anclas densas softmax (25%) |
| Parametros totales | 4.466.980.960 parametros entrenables (4,47B); 32 capas, hidden size 2.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no es un LLM; ventana de generacion de 193 fotogramas a 24 FPS (unos 8,04 s) a 736 x 1280; el numero de fotogramas debe cumplir `(num_frames - 1) % 8 == 0` |
| Tipos de cuantizacion | no disponible; la entrada oficial de inferencia convierte el transformer a BF16. Los tensores almacenados conservan los dtypes fusionados de origen |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (checkpoint); el codificador de texto `google/gemma-2-2b-it` se distribuye bajo sus propios terminos |
| Formato de pesos | PyTorch `.pth` (`checkpoints/SANA_Video_2.0_5B_720p.pth`) mas `config.yaml`; no se publican safetensors ni GGUF |
| Tamano del repositorio | 17,9 GB |
| Encoder de texto | `google/gemma-2-2b-it` |
| VAE | LTX 2.3, 128 canales latentes, stride (8, 32, 32) |
| Configuracion de inferencia recomendada | BF16, CFG 8, flow shift 12, 50 pasos, motion score 20 |
| Tareas | text-to-video (T2V) y text-image-to-video (TI2V) |
| Libreria declarada | `sana` |
| Fecha de publicacion en el repositorio | 2026-10-08 |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (`SanaVideo2_5B`) de 32 capas con hidden size 2.560. La innovacion principal declarada es el esquema de atencion: un 75% de las capas usa atencion lineal bidireccional con compuertas y un 25% usa atencion densa softmax actuando como anclas periodicas, lo que persigue reducir el coste computacional sobre secuencias de video largas sin perder capacidad de modelado global. A esto se anade una agregacion compartida de residuales de atencion, independiente del timestep, aplicada cada 8 capas. El pipeline latente sigue el contrato del VAE de LTX 2.3 (128 canales latentes, compresion temporal y espacial de (8, 32, 32)) y el condicionamiento textual se realiza con Gemma 2 2B IT.

El checkpoint distribuido es un artefacto de inferencia: contiene unicamente el `state_dict` fusionado del modelo. No incluye optimizador, scheduler, estado de entrenamiento ni tensores LoRA independientes. Antes de la publicacion se fusionaron los pesos base de la EMA y el adaptador de post-entrenamiento ReFL. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO mas alla de la mencion al post-entrenamiento con ReFL.

## Capacidades

- Generacion de video a partir de texto (T2V) con salida de 736 x 1280, 193 fotogramas, 24 FPS y unos 8 segundos de duracion.
- Generacion de video condicionada por texto e imagen (TI2V), usando una imagen de entrada como primer fotograma, con la sintaxis `<image>` en los ficheros de prompts.
- Control fino del proceso de muestreo: escala CFG (recomendada 8), flow shift (12), numero de pasos (50), FPS de salida y `motion_score` (20) para modular la cantidad de movimiento.
- Condicionamiento textual multilingue limitado a ingles y chino segun los metadatos del modelo.
- Generacion de escenas con personajes, camara y movimiento descritos en el prompt, segun el ejemplo verificado publicado (semilla 4).
- Base para ajuste fino especifico de dominio, ya que el checkpoint es un modelo fusionado sin tensores LoRA ni estado de entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking"; se trata de un modelo generativo de video, no de un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce 8 segundos a 720p en una sola pasada, suficiente para anuncios de redes sociales o banners animados, con la ventaja de que la licencia Apache 2.0 permite uso comercial del checkpoint.
- Previsualizacion de storyboards en produccion audiovisual: a partir de una imagen de referencia se puede usar el modo TI2V para animar el primer fotograma de cada plano y validar ritmo y composicion antes del rodaje.
- Prototipado de assets para videojuegos: generacion de clips de ambientacion o animaticos de personajes mediante T2V, controlables con `motion_score` para ajustar la intensidad de movimiento segun el estilo del juego.
- Demostraciones creativas para instalaciones o eventos: la salida en bucle de 193 fotogramas a 24 FPS encaja en pantallas de formato vertical u horizontal sin reescalado adicional si se respeta el bucket 736 x 1280.
- Ajuste fino sectorial: al ser un checkpoint fusionado sobre una licencia permisiva, sirve como punto de partida para entrenar dominios concretos (producto, inmobiliaria, educacion) con LoRA o ajuste completo.
- Generacion de contenido en ingles y chino para mercados hispanohablantes y asiaticos: permite producir variantes de un mismo concepto con prompts en ambos idiomas sin cambiar de modelo.
- Investigacion en difusion de video: la combinacion de atencion lineal con compuertas y anclas densas softmax es un objeto de estudio util para medir el compromiso entre coste de atencion y calidad temporal en secuencias de ~2,9 millones de valores latentes por clip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un ejemplo verificado de release (semilla 4, 1280 x 736, 193 fotogramas, 24 FPS, 8,04 s) sin metricas cuantitativas de calidad, coherencia temporal ni comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia calculada a partir de los datos disponibles, el transformer en BF16 ocupa unos 8,9 GB de pesos (4,47B parametros x 2 bytes) y el codificador de texto Gemma 2 2B en BF16 otros 4-5 GB, a lo que hay que sumar el VAE LTX 2.3 y la memoria de activaciones.
- Memoria de activaciones: con la compresion declarada, un clip de 8 segundos a 736 x 1280 produce 25 fotogramas latentes (23 x 40 en el plano espacial) con 128 canales, es decir, del orden de 2,94 millones de valores latentes por muestra. Este factor, y no los pesos, es el que domina el consumo de memoria.
- GPU recomendadas: no especificadas. Por el volumen de activaciones calculado, es previsible que se requieran GPU de clase 80 GB (A100, H100) o configuraciones multi-GPU con paralelismo de secuencia; no hay datos oficiales que lo confirmen.
- GPU de consumo: no hay informacion oficial. Los calculos anteriores hacen prever que un modelo de 24 GB no sea suficiente sin tecnicas de offloading, pero se trata de una estimacion, no de un dato publicado.
- Opciones de despliegue: la via documentada es el repositorio NVlabs/Sana (rama `main`) con el script `inference_video_scripts/inference_sana_video.sh`. Requiere colocar el VAE de LTX 2.3 en formato Diffusers en `output/pretrained_models/LTX-2.3-Diffusers/` o ajustar `vae.vae_pretrained` en `config.yaml`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otras herramientas de servido, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible. La configuracion verificada usa 50 pasos de muestreo, CFG 8, flow shift 12, FPS 24 y semilla 4, pero no se publican tiempos de generacion ni rendimiento por GPU.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos. La comparativa se limita, por tanto, a situar el modelo en su categoria. Los unicos puntos de referencia citados en la propia model card son los componentes reutilizados: el VAE de LTX 2.3 y el encoder `google/gemma-2-2b-it`.

| Modelo | Parametros | Duracion y resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| SANA-Video 2.0 5B 720p (este modelo) | 4,47B | 193 fotogramas, 24 FPS, 736 x 1280 | Apache 2.0 | HuggingFace (redistribucion de BlackWolf-Media; el original se referencia como Efficient-Large-Model) |
| LTX-Video / LTX 2.3 | no disponible | no disponible | no disponible | El contrato VAE se reutiliza en este modelo; el resto de datos no estan en la informacion |
| CogVideoX-5B | no disponible | no disponible | no disponible | no disponible |
| Wan 2.x | no disponible | no disponible | no disponible | no disponible |

Los modelos de la misma categoria (generacion de video texto-a-video de pesos abiertos) no aparecen descritos en la informacion suministrada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Movimiento, anatomia, renderizado de texto, permanencia de objetos e interacciones fisicas pueden ser inconsistentes, sobre todo en escenas con mucha gente o muy dinamicas.
- El seguimiento del prompt se degrada con instrucciones largas, ambiguas o de composicion compleja.
- En generacion condicionada por imagen, la salida puede desviarse de los detalles finos de la imagen de origen.
- Los resultados pueden reflejar sesgos sociales y culturales presentes en los datos de entrenamiento y en el codificador de texto, que se carga por separado.
- Riesgo de alucinacion visual: el modelo no esta destinado a producir evidencia factual, identificar personas ni tomar decisiones automatizadas de alto impacto.
- Uso no permitido segun el autor: contenido que vulnere privacidad, derechos de autor, legislacion aplicable o politicas de plataforma.
- Licencia: el checkpoint es Apache 2.0, lo que permite uso comercial, pero el codificador de texto `google/gemma-2-2b-it` y el VAE de LTX 2.3 son componentes de terceros con sus propias condiciones, que conviene revisar antes de desplegar en produccion.
- Restricciones tecnicas de forma: ambas dimensiones espaciales deben ser divisibles por 32 (de ahi el bucket 736 x 1280) y el numero de fotogramas debe cumplir `(num_frames - 1) % 8 == 0`, lo que limita las duraciones posibles.
- Solo se documentan prompts en ingles y chino; no hay garantia de calidad para otros idiomas.
- Procedencia: el repositorio tiene 0 descargas y 0 likes y esta publicado por una cuenta de terceros (BlackWolf-Media), mientras que la model card remite a NVlabs/Sana y a un checkpoint de Efficient-Large-Model. Conviene verificar la integridad y el origen de los pesos antes de usarlos.
- No se documenta cuantizacion, por lo que opciones como GGUF, FP8 o INT8 no estan soportadas oficialmente segun la informacion disponible.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/BlackWolf-Media/SANA-Video_2.0_5B_720p
- Repositorio de inferencia referenciado en la model card: https://github.com/NVlabs/Sana
- Checkpoint referenciado en los comandos de inferencia: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p
- Codificador de texto: https://huggingface.co/google/gemma-2-2b-it
- Assets del ejemplo verificado (dataset de demos): https://huggingface.co/datasets/Efficient-Large-Model/Sana-assets
- Video del ejemplo verificado: https://huggingface.co/datasets/Efficient-Large-Model/Sana-assets/resolve/main/Video2/assets/release-demo/sana_video2_5b_720p_rooster.mp4
- Poster del ejemplo verificado: https://huggingface.co/datasets/Efficient-Large-Model/Sana-assets/resolve/main/Video2/assets/release-demo/sana_video2_5b_720p_rooster_poster.png
- Paper de SANA-Video 2.0: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a vehiculos blindados y empresas de seguridad con nombre similar), por lo que no se incluyen como enlaces relevantes.
