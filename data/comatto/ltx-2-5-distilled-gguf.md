# comatto/LTX-2.5-Distilled-GGUF

## Resumen

LTX-2.5-Distilled-GGUF es un repositorio de pesos cuantizados en formato GGUF del transformer destilado de Lightricks/LTX-2.5, publicado por el usuario comatto. El modelo base es un sistema generativo de vídeo y audio de Lightricks que produce clips con audio sincronizado a partir de texto, imagen, vídeo o audio, y esta variante cuantizada reduce el peso del transformer destilado desde los ~21.000 millones de parametros del checkpoint original hasta ficheros de entre 12,6 GB y 23,6 GB, segun el nivel de cuantizacion. El objetivo declarado por el autor es permitir la ejecucion local de flujos de generacion de video de alta fidelidad en equipos con memoria limitada, manteniendo la fidelidad visual del modelo base.

La relevancia de esta publicacion es practica: el modelo original exige VRAM muy superior a la disponible en GPU de consumo, mientras que estas cuantizaciones (Q3_K_S a Q8_0) acercan el modelo a tarjetas de 24 GB e incluso a configuraciones con descarga parcial a RAM del sistema. El repositorio incluye ademas dos flujos de trabajo de ComfyUI preconfigurados (texto a video e imagen a video), lo que reduce la barrera de entrada para probar el modelo.

Se trata de una arquitectura de difusion con transformer (DiT) y componentes separados: el transformer cuantizado de este repositorio, un codificador de texto Gemma 4 12B con proyeccion, VAEs especificos de video y de audio, y upscalers latentes opcionales de etapa 2. La licencia es la LTX-2 Community License Agreement, no una licencia de codigo abierto estandar, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado, con arquitectura de componentes separados (transformer + text encoder + VAE de video + VAE de audio) |
| Parametros totales | 21.004.025.600 (~21.000 millones) en el transformer destilado; el autor describe el modelo completo como de 22B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion, no basado en contexto de tokens) |
| Tipos de cuantizacion | GGUF: Q3_K_S (12,6 GB), Q3_K_M (12,9 GB), Q4_K_S (15,3 GB), Q4_K_M (15,7 GB), Q5_K_M (18,1 GB), Q6_K (18,6 GB), Q8_0 (23,6 GB) |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, coreano, chino, italiano, portugues |
| Licencia | LTX-2 Community License Agreement (license: other) |
| Formato de pesos | GGUF (cuantizado); los pesos originales del modelo base estan en safetensors/bf16 |
| Tamano del repositorio | 116,9 GB |
| Modos de generacion | Texto a video, imagen a video, video a video, audio a video |
| Componentes adicionales requeridos | Codificador de texto Gemma 4 12B (bf16 26,3 GB o INT8 15,4 GB), VAE de video bf16 1,47 GB o convolucional 1,45 GB, VAE de audio 365 MB |
| Upscalers latentes opcionales | Espacial x2 (996 MB) y temporal x2 (262 MB) |
| Descargas / likes en HuggingFace | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de difusion (DiT) propio de la familia LTX, no un transformer autorregresivo de lenguaje. El sistema esta dividido en componentes: un transformer de difusion que genera los latentes, un codificador de texto Gemma 4 12B con proyeccion adaptada a LTX-2.5, un VAE de video (en variante estandar y convolucional) y un VAE de audio con vocoder para producir audio sincronizado. Esta variante GGUF contiene exclusivamente el transformer destilado en distintos niveles de cuantizacion; los codificadores de texto y los VAE deben descargarse del repositorio oficial Lightricks/LTX-2.5. El autor indica que estos checkpoints derivan del modelo destilado, de modo que conservan buena parte de las capacidades del modelo completo de 22B con un coste de computo menor.

Sobre el entrenamiento no hay informacion en la documentacion disponible: no se especifica el numero de tokens o de horas de video utilizadas, la composicion del dataset, ni si se emplearon tecnicas de ajuste como RLHF o DPO. Tampoco se detalla el procedimiento de destilacion aplicado respecto al modelo completo. Lo que si se documenta como innovaciones del modelo base son la generacion multiplano nativa (varias escenas conectadas en una sola pasada manteniendo identidad de personaje, entorno, iluminacion, voz y estilo visual entre cortes) y una asignacion dinamica de computo segun la complejidad de la escena, ademas de la generacion de audio sincronizado con el video.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con fidelidad visual alta y movimiento coherente.
- Generacion de video a partir de imagen (image-to-video): animacion de una imagen de entrada con control del movimiento y de la trayectoria de camara mediante prompt textual.
- Transformacion de video existente (video-to-video).
- Generacion condicionada por audio (audio-to-video).
- Generacion de audio sincronizado con el video mediante el VAE de audio y vocoder del modelo base.
- Generacion multiplano nativa: escenas conectadas en una sola pasada con consistencia de personaje, entorno, iluminacion, voz y estilo.
- Asignacion dinamica de computo segun la complejidad de la escena (rendimiento de detalle adaptativo).
- Soporte multilingue de prompts en nueve idiomas: ingles, aleman, espanol, frances, japones, coreano, chino, italiano y portugues.
- Soporte de tool calling / function calling: no aplica ni esta documentado (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Upscaling latente de etapa 2: reescalado espacial x2 (resolucion) y temporal x2 (interpolacion de fotogramas, por ejemplo de 24 a 48 fps) mediante modelos auxiliares.

## Casos de uso

- Previsualizacion de storyboards y animaticos en produccion audiovisual: el modelo permite convertir una secuencia de imagenes clave en clips animados con movimiento de camara descrito por prompt, reduciendo el tiempo de iteracion antes de rodar o animar en produccion final.
- Generacion de anuncios cortos para marketing: con texto a video y audio sincronizado se pueden producir piezas de varios planos en una sola pasada, manteniendo identidad de marca y estilo visual entre cortes gracias a la generacion multi-plano nativa.
- Animacion de imagenes de producto (image-to-video): a partir de una fotografia fija de catalogo se genera un clip con movimiento de camara, util para fichas de e-commerce sin sesion de video adicional.
- Localizacion y doblaje de contenido: el soporte de audio a video y de audio sincronizado, junto con prompts en nueve idiomas, permite regenerar piezas audiovisuales adaptadas a distintos mercados.
- Prototipado rapido de VFX y planos conceptuales: video-to-video permite reestilizar material rodado de baja calidad o previz para explorar direcciones visuales antes de comprometer presupuesto de postproduccion.
- Generacion de datasets sinteticos de video para entrenar o evaluar otros modelos: la capacidad de producir clips con audio sincronizado y multiples planos facilita crear corpus variados controlando la composicion via prompt.
- Contenido educativo y divulgativo multilingue: combinando texto a video con prompts en espanol, frances, aleman u otros idiomas soportados, se generan explicaciones visuales sin equipo de rodaje.
- Restauracion o mejora de material de archivo: el flujo video a video con el upscaler latente espacial x2 y temporal x2 sirve para aumentar resolucion y suavizar la cadencia de fotogramas de clips existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del repositorio no incluye metricas objetivas (FVD, CLIP-score, VBench, MMLU ni equivalentes) ni comparaciones cuantitativas con otros modelos de generacion de video.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas de los tamanos de fichero declarados en el repositorio, no datos medidos publicados por el autor.

- VRAM para el transformer unicamente: Q3_K_S y Q3_K_M requieren al menos 12,6-12,9 GB de pesos; Q4_K_S 15,3 GB; Q4_K_M 15,7 GB; Q5_K_M 18,1 GB; Q6_K 18,6 GB; Q8_0 23,6 GB. Hay que anadir overhead del runtime, por lo que en la practica se necesita un margen adicional.
- Componentes obligatorios: el codificador de texto Gemma 4 12B ocupa 26,3 GB en bf16 o 15,4 GB en la variante INT8 optimizada para ComfyUI; los VAE suman aproximadamente 1,8-3,3 GB; los upscalers latentes opcionales suman unos 1,3 GB.
- Estimacion de memoria total para un flujo completo: con transformer Q4_K_M (15,7 GB) y codificador INT8 (15,4 GB) mas VAE y upscalers, el conjunto se situa en el rango aproximado de 35-40 GB entre VRAM y RAM del sistema.
- Cabe en GPU de consumo: si, parcialmente. Una RTX 3090 o RTX 4090 de 24 GB puede alojar el transformer en Q4_K_M o Q5_K_M, pero el codificador de texto debe ejecutarse de forma secuencial, en INT8 o descargado a RAM, o usar descarga por capas (offloading).
- Configuraciones con VRAM grande: Q8_0 (23,6 GB) mas el codificador bf16 recomienda GPU de 40-80 GB, como A100 40/80 GB, H100 o RTX 6000 Ada 48 GB.
- Opciones de despliegue: ComfyUI con nodos de carga GGUF, segun los flujos T2V e I2V incluidos en el repositorio; pipelines Python locales. El autor indica que el motor de inferencia debe soportar la arquitectura DiT de LTX-2.5. vLLM, TGI y Ollama no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible. No se publican tiempos de generacion por clip, resolucion ni numero de pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Distilled-GGUF (comatto) | 21.004.025.600 en el transformer destilado | GGUF Q3_K_S a Q8_0 | Texto/imagen/video/audio a video con audio sincronizado | LTX-2 Community License Agreement | HuggingFace, 0 descargas |
| Lightricks/LTX-2.5 (modelo base) | ~22B en el modelo completo (transformer bf16) | safetensors/bf16 | Mismas modalidades, incluidos componentes de texto, VAE y upscalers | LTX-2 Community License Agreement | HuggingFace, repositorio oficial |
| Otros modelos de generacion de video de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion proporcionada es la del modelo base: esta variante GGUF reduce el peso a entre 12,6 GB y 23,6 GB frente a los pesos bf16 del original, a cambio de perdida de calidad que el autor describe como creciente en los niveles de cuantizacion mas bajos. No se dispone de datos sobre modelos alternativos de terceros (parametros, contexto, benchmarks o licencias) en la informacion disponible, por lo que no se incluyen.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el propio autor advierte que Q3_K_S y Q3_K_M implican la mayor perdida de calidad, y que Q4_K_M es la linea base recomendada. Q8_0 es practicamente indistinguible de bf16.
- Dependencia de componentes externos: el repositorio no es autosuficiente. Sin el codificador de texto Gemma 4 12B y los VAE del repositorio Lightricks/LTX-2.5, el modelo no puede ejecutarse. El usuario debe descargar varios GB adicionales.
- Requisito de motor compatible: es necesario que la herramienta de inferencia (ComfyUI con nodos GGUF, llama.cpp o pipeline propio) soporte la arquitectura DiT de LTX-2.5. Un cargador GGUF generico no es suficiente.
- Licencia restrictiva: se aplica la LTX-2 Community License Agreement, no una licencia de codigo abierto permisiva. Es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial o de redistribucion.
- Riesgo de alucinacion visual: como todo modelo generativo de difusion, puede producir artefactos, incoherencias anatomicas o fisicas, y texto ilegible en la imagen. No se documentan tasas de fallo.
- Idiomas: aunque se listan nueve idiomas, no hay datos publicados sobre calidad relativa por idioma ni sobre el comportamiento del codificador de texto con prompts en idiomas distintos del ingles.
- Consistencia en clips largos: no hay informacion publicada sobre la degradacion de la coherencia temporal mas alla de lo que permita la generacion multi-plano nativa.
- Discrepancia de identificadores: la model card enlaza recursos y flujos de ComfyUI bajo el espacio de nombres "Abiray", mientras que el identificador del repositorio es "comatto/LTX-2.5-Distilled-GGUF". Conviene verificar la procedencia de los ficheros antes de integrarlos en un flujo de produccion.
- Estado de adopcion: 0 descargas y 0 likes en la fecha consultada, y el repositorio figura creado y actualizado en la misma marca temporal (2026-09-16). No hay evidencia de validacion por parte de la comunidad.
- Sin benchmarks: la ausencia de metricas publicadas impide estimar de forma objetiva la perdida de calidad frente al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/comatto/LTX-2.5-Distilled-GGUF
- Modelo base Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Codificadores de texto del modelo base: https://huggingface.co/Lightricks/LTX-2.5/tree/main/text_encoders
- VAE de video y audio: https://huggingface.co/Lightricks/LTX-2.5/tree/main/vae
- Upscalers latentes oficiales: https://huggingface.co/Lightricks/LTX-2.5/tree/main/latent_upscale_models
- Upscaler espacial x2: https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors
- Upscaler temporal x2: https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-temporal-upscaler-x2-bf16-1.0.safetensors
- Flujo ComfyUI texto a video (T2V): https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/blob/main/video_ltx2_5_t2v_GGUF.json
- Flujo ComfyUI imagen a video (I2V): https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/blob/main/video_ltx2_5_i2v_GGUF.json
- Video de ejemplo texto a video: https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/resolve/main/video/LTX_2.5_t2v.mp4
- Texto de la licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Repositorio GitHub de Lightricks LTX-2: https://github.com/Lightricks/LTX-2
