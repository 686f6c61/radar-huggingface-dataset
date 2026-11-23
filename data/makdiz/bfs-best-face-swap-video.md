# Makdiz/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA de tipo IC-LoRA (In-Context LoRA) para los modelos de generacion de video LTX-2.3 y LTX-2.5 de Lightricks. Lo publica el usuario Makdiz en Hugging Face y su funcion es realizar intercambio de rostro (face swap) y de cabeza (head swap) en video, tomando la identidad de un fotograma de referencia y propagandola a lo largo de una secuencia de video guia. Se integra en el ecosistema Diffusers con el pipeline image-to-video.

El modelo no es un modelo fundacional autonomo, sino un adaptador que se aplica sobre los pesos base de LTX-2.3 o LTX-2.5. Por tanto, sus capacidades de generacion de video, resolucion y longitud de clip dependen enteramente del modelo base sobre el que se monta. El repositorio ocupa 13,4 GB, lo que corresponde principalmente a los pesos del adaptador y a los ejemplos de video incluidos.

Su relevancia actual reside en el ambito de los flujos de trabajo VFX y de investigacion de identidad digital: permite transformar la identidad facial en video preservando el movimiento de la secuencia guia, mediante una tecnica de anclaje en el fotograma 0 (Frame 0 Anchoring) y un flujo de plantilla persistente introducido en la version V3. La licencia es la LTX-2 Community License Agreement, no una licencia de codigo abierto permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador IC-LoRA sobre modelo de difusion de video LTX-2.3 / LTX-2.5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base LTX-2.x) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (license: other) |
| Formato de pesos | safetensors (repositorio Diffusers, 13,4 GB) |

## Arquitectura y entrenamiento

El adaptador se construye como un IC-LoRA, es decir, un LoRA de contexto que condiciona la generacion del modelo base de difusion de video a partir de una imagen de referencia de identidad y de una secuencia de video guia. El modelo base, LTX-2.3 y LTX-2.5 de Lightricks, es un modelo de difusion para generacion de video; el repositorio declara ambos como base_model, de modo que el adaptador puede aplicarse sobre cualquiera de las dos versiones segun el flujo de trabajo.

La tecnica central documentada por el autor es el Frame 0 Anchoring: la identidad se extrae del primer fotograma y se mantiene a lo largo del clip mientras se sigue el movimiento del video guia. La version V3 introduce un flujo de trabajo de plantilla persistente que mejora la consistencia de la identidad entre fotogramas. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones de decodificacion especulativa o atencion lineal; esa informacion no esta disponible en la model card.

## Capacidades

- Intercambio de rostro (face swap) en video: sustituye la identidad facial de un sujeto por la de un fotograma de referencia.
- Intercambio de cabeza (head swap): extiende la transformacion a la cabeza completa, no solo al rostro.
- Video-to-video: usa una secuencia de video guia cuyo movimiento se preserva en la salida.
- Image-to-video: pipeline declarado en el repositorio, con anclaje de identidad en el fotograma 0.
- Preservacion del movimiento: la salida sigue la trayectoria y gestos del video guia.
- Flujo de plantilla persistente (V3): mantiene la consistencia de identidad a lo largo de la secuencia.
- Compatibilidad con Diffusers: integracion mediante la libreria diffusers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Postproduccion VFX: aplicar una identidad aprobada a un actor de doblaje o a un doble en una secuencia ya rodada, preservando el movimiento original gracias al video guia.
- Prototipado cinematografico: generar previsiones de escenas con una identidad concreta antes del rodaje, usando el flujo de plantilla persistente de V3 para mantener coherencia entre planos.
- Investigacion de identidad digital: estudiar la fidelidad y la estabilidad de la transferencia de identidad en video con fines academicos, comparando resultados entre LTX-2.3 y LTX-2.5.
- Sustitucion de cabeza en contenido de formato corto: reemplazar la cabeza de un presentador en un clip manteniendo el movimiento de la secuencia guia.
- Pruebas de vestuario y maquillaje: aplicar el rostro de un actor a un video de referencia para evaluar como queda un diseno antes de producirlo.
- Anonimizacion controlada en material audiovisual: sustituir la identidad de una persona por una identidad sintetica consentida en clips guia, siempre con los derechos y consentimientos exigidos por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al tratarse de un adaptador sobre un modelo de difusion de video LTX-2.x, el requisito dominante es el del modelo base, no el del LoRA.
- GPU recomendadas: no disponible de forma especifica; los modelos de difusion de video de esta categoria suelen requerir GPU de datacenter (A100, H100) o GPU de consumo de gama alta con suficiente VRAM.
- Cabe en consumer GPU: no disponible; depende del modelo base y de la resolucion y duracion del clip.
- Opciones de despliegue: Diffusers (libreria declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS-Best-Face-Swap-Video | IC-LoRA de face/head swap | LTX-2.3 / LTX-2.5 | no disponible | LTX-2 Community License | Hugging Face (0 descargas) |
| LTX-2.3 / LTX-2.5 (Lightricks) | Modelo de difusion de video | propio | no disponible | LTX-2 Community License | Hugging Face |
| Alternativas de face swap en video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- Requiere consentimiento explicito y derechos legales sobre la persona cuya imagen se procesa; el autor lo exige de forma expresa.
- Riesgo elevado de uso indebido (deepfakes, suplantacion de identidad); el autor declina toda responsabilidad por el uso.
- La licencia LTX-2 Community License Agreement no es una licencia de codigo abierto permisiva; deben revisarse sus restricciones antes de cualquier uso comercial.
- El rendimiento y las capacidades dependen del modelo base LTX-2.x; el adaptador no funciona de forma autonoma.
- No hay informacion publicada sobre sesgos, tasa de alucinacion visual, idiomas soportados ni limites de duracion de clip.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria del rendimiento.
- Posibles artefactos en la transferencia de identidad con movimientos rapidos, oclusiones o cambios de iluminacion; no documentado por el autor.
- El tamaño del repositorio (13,4 GB) implica requisitos de almacenamiento y de carga considerables.

## Enlaces

- Hugging Face: https://huggingface.co/Makdiz/BFS-Best-Face-Swap-Video
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Video de demostracion del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Ejemplos V1: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/1.mp4
- Ejemplos V3: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/6.mp4
- Ejemplos LTX-2.5: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/ltx-25-1.mp4
