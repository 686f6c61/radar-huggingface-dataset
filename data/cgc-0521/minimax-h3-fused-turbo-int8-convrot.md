# cgc-0521/minimax-h3-fused-turbo-int8-convrot

## Resumen

MiniMax-H3 Fused Turbo (INT8 ConvRot) es un fichero único de difusión de 21 GB para ComfyUI que ejecuta las tareas de texto/imagen a vídeo y de referencia a vídeo de MiniMax-H3 en 4 pasos. Lo publica el usuario cgc-0521 y no es un modelo entrenado desde cero, sino una receta de fusión y cuantización construida sobre MiniMax-H3: parte del transformer podado `fl2va` al que se le fusiona un SVD de rango 1024 del delta de pesos (`ref2va` - `fl2va`), de modo que una sola partición atiende tanto la condicionalidad de primer/último fotograma como la de referencia.

Sobre esa base se incorporan en los pesos dos adaptadores LoRA: el turbo destilado lightx2v FL2VA Turbo 8-step v1.0 a fuerza 1.0 (redimensionado a rango 24) y Mystic v2.0 a fuerza 0.7, este último orientado a suavizar el movimiento. Después se aplica una única pasada de cuantización: las cuatro capas Linear pesadas de cada uno de los 50 bloques (`qkv_proj`, `out_proj`, `fc1`, `fc2`) quedan en INT8 con ConvRot (grupo 256, por canal) en el layout nativo `comfy_quant`, y el resto permanece en BF16/F32. No requiere cargador personalizado: se carga con `UNETLoader` y `weight_dtype` en `default`.

Su relevancia práctica es doble. Por un lado, permite generar un clip de 1152x640 y 243 fotogramas (10 s) con audio sincronizado en 76 s a 4 pasos en una RTX PRO 6000 de 96 GB. Por otro, el hecho de hornear los LoRA en lugar de apilarlos en vivo ahorra unos 21 GB de VRAM, porque ComfyUI mantiene una copia sin parchear de cada peso modificado por LoRA; en la medición del autor, 47,8 GB de pico en la versión fusionada frente a 68,9 GB en la ruta live-LoRA, con el mismo tiempo de pared.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de MiniMax-H3, variante podada `fl2va`, con el delta (`ref2va` - `fl2va`) fusionado mediante SVD de rango 1024; 50 bloques |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica en el sentido de los LLM: la "ventana" viene dada por el clip. Los ejemplos del autor usan 243 fotogramas (10 s) a 1152x640; no se especifica un maximo |
| Tipos de cuantizacion | INT8 con ConvRot (grupo 256, por canal) en `qkv_proj`, `out_proj`, `fc1` y `fc2` de cada bloque, en el layout `comfy_quant` de ComfyUI; el resto de pesos en BF16/F32. Los LoRA se fusionan antes de cuantificar, en una sola pasada |
| Idiomas soportados | no disponible |
| Licencia | `minimax-h3-community-license-agreement` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors, fichero unico (`diffusion-single-file`) para ComfyUI |
| Tamano del repositorio | 21,0 GB |
| Pipeline declarado | image-text-to-video |
| Nombre del fichero | `minimax_h3_fused_refdelta_r1024_turbo8_mystic07_int8_convrot.safetensors` |
| Ruta de instalacion | `ComfyUI/models/diffusion_models/` |
| Fecha de publicacion (segun HuggingFace) | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no incorpora entrenamiento propio ni fases de RLHF o DPO. Se trata de una receta de fusión sobre MiniMax-H3 que combina cuatro piezas: el transformer podado `fl2va` como base, la fusion del delta de pesos `ref2va - fl2va` mediante SVD de rango 1024 (que permite que una sola partición sirva tanto para condicionalidad de primer/último fotograma como para referencia), y dos LoRA fusionados en los pesos: lightx2v FL2VA Turbo 8-step v1.0 a fuerza 1.0, redimensionado a rango 24 desde `Kijai/MiniMax-H3_comfy` (original de rango completo en `lightx2v/Minimax-h3-Turbo`), y Mystic v2.0 a 0.7 procedente de Civitai (modelo 2856467), incorporado para suavizar el movimiento. La cuantización se realiza en una única pasada posterior a la fusión.

En inferencia, el autor emplea atención dispersa SLA (con nodo especifico, tambien disponible en version ROCm) y una etapa de muestreo posterior al `shift node`. La receta avanzada de 4 + 4 pasos, denominada de-rope, encadena un primer pase de referencia, un oraculo de jerk que marca las regiones con movimiento brusco, un time smear, un V2V sembrado, un segundo pase limitado a los fotogramas marcados y una recuperacion exacta. Existe ademas una variante con DyRoPE (`physical_blocks` 30-49) y un adaptador `warm375` a 1.0 en el segundo pase, que segun el autor no anaden tiempo medible. Los dos LoRA originales suman unos 540 MB, de modo que el ahorro de VRAM no proviene de los adaptadores sino de evitar la copia de respaldo que ComfyUI genera para cada peso parcheado.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video), con etiqueta de pipeline `image-text-to-video`.
- Generacion de video a partir de una referencia (reference-to-video), servida por la misma particion gracias a la fusion del delta `ref2va` en rango 1024.
- Condicionalidad de primer y ultimo fotograma (`fl2va`), util para interpolar entre dos imagenes dadas.
- Audio sincronizado con el video: el repositorio lleva la etiqueta `synchronized-audio-video` y el autor menciona la pista de sonido en sus pruebas.
- Generacion en 4 pasos gracias al turbo destilado fusionado; el autor documenta tambien ejecuciones a 6, 8 y 25 pasos, con mayor definicion del dibujo a mas pasos y sin cambios en la banda sonora.
- Salida de 10 s (243 fotogramas) a 1152x640 en las pruebas publicadas.
- Recuperacion detallada de movimiento mediante el pipeline de-rope y el oraculo de jerk.
- Sin cargador personalizado: funciona con `UNETLoader` y `weight_dtype` en `default` en ComfyUI.
- Soporte de tool calling / function calling: no aplica (modelo de difusion, no un LLM).
- Comportamiento como agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.

## Casos de uso

- Previsualizacion rapida de storyboards: con 4 pasos y 76 s por clip de 10 s a 1152x640 en una RTX PRO 6000, permite iterar sobre un guion grafico conversando con el prompt antes de comprometer recursos en un render de 25 pasos (292 s).
- Generacion de video con audio sincronizado para piezas cortas de marketing o redes: el modelo produce imagen y banda sonora en la misma pasada, lo que evita montar el audio por separado en piezas de unos 10 s.
- Transferencia de referencia de personaje o estilo: al estar fusionado el delta `ref2va`, una unica carga del fichero permite condicionar por una imagen de referencia sin cambiar de particion ni de grafo.
- Interpolacion entre primer y ultimo fotograma en animacion: util para generar transiciones entre dos keyframes ya aprobados por direccion de arte, con la condicionalidad `fl2va` de la base.
- Estabilizacion de planos con movimiento brusco: el pipeline de 4 + 4 con oraculo de jerk concentra el segundo pase solo en los fotogramas problematicos, de modo que las zonas estaticas quedan mas limpias sin pagar el coste integro de un pase adicional (~374 s en frio).
- Despliegue en estaciones de trabajo de 48-96 GB: al hornear los LoRA, el pico medido baja a 47,8 GB frente a 68,9 GB de la ruta live-LoRA, lo que permite ejecutar el grafo completo con todo residente en tarjetas que con la ruta apilada no bastarian.
- Generacion de video en entornos ComfyUI ya existentes: al no necesitar cargador propio y usar el layout `comfy_quant`, se integra en grafos y workflows que ya invocan `UNETLoader`.
- Experimentacion en AMD/ROCm: el autor indica que la receta se desarrollo en una maquina AMD y remite al fork de ComfyUI para ROCm con el nodo SLA recompilado, lo que abre la experimentacion fuera del ecosistema CUDA.
- Base para nuevos merges comunitarios: al ser un fichero INT8 ya fusionado, sirve como punto de partida reproducible para comparar recetas de cuantizacion frente a la ruta BF16 con LoRA en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de video como VBench) en la informacion disponible. Los unicos datos de rendimiento son las mediciones de tiempo de pared del autor con un prompt fijo, semilla 42, resolucion 1152x640, 243 fotogramas (10 s), atencion dispersa SLA y una unica RTX PRO 6000 de 96 GB con todo residente:

| Receta | Pasos | Tiempo de pared | Notas |
|---|---|---|---|
| Pase unico (referencia) | 4 | 76 s | Configuracion base del fichero |
| 4 + 4 de-rope | 4 + 4 | ~374 s en frio | ~65 s pase 1; ~65 s de smear + codificacion VAE de 685 fotogramas dilatados; ~240 s de pase 2 + decodificacion + recuperacion |
| 4 + 4 de-rope + DyRoPE (`physical_blocks` 30-49) + adaptador `warm375` a 1.0 en el pase 2 | 4 + 4 | ~374 s en frio | DyRoPE y el adaptador no anaden tiempo medible |
| Pase unico | 6 | 80 s | — |
| Pase unico | 8 | 103 s | Mismo tiempo que la ruta live-LoRA equivalente |
| Pase unico | 25 | 292 s | Mas definicion en el dibujo, sin cambios en la banda sonora |

Mediciones de memoria en la misma configuracion a 8 pasos: 47,8 GB de pico y 42 GB residentes con este fichero fusionado, frente a 68,9 GB de pico y 64 GB residentes con la ruta live-LoRA, con el mismo tiempo de pared (103 s).

## Requisitos de hardware

- Tamano en disco: 21 GB para el fichero safetensors. El autor lo describe como la huella mas pequena de esta receta, porque evita la copia de respaldo de los pesos parcheados por LoRA.
- VRAM medida (todo residente, 8 pasos): 47,8 GB de pico / 42 GB residentes con el fichero fusionado; 68,9 GB de pico / 64 GB residentes con la ruta live-LoRA. El ahorro ronda los 21 GB.
- GPU de referencia de las pruebas: una RTX PRO 6000 de 96 GB. Es la unica tarjeta con cifras publicadas en la informacion disponible.
- GPUs de gama consumer: no hay mediciones publicadas. El autor indica que tarjetas mas pequenas funcionan porque la gestion de modelos de ComfyUI carga y descarga el transformer, el codificador de texto y los VAE segun se necesitan, con la misma grafica pero mas lenta. Dado que el transformer INT8 ocupa 21 GB por si solo, en tarjetas de 24 GB (RTX 4090, 3090) haria falta offload parcial, pero no se dispone de cifras de rendimiento en esos casos.
- Comportamiento del offload: fuera del modo `--gpu-only`, la copia de respaldo de los pesos parcheados recae en la RAM del sistema en lugar de la VRAM.
- AMD / ROCm: la receta se desarrollo en una maquina AMD. El autor recomienda el fork de ComfyUI para ROCm `patientx-cfz/comfyui-rocm`, que incluye una compilacion ROCm del nodo de atencion SLA.
- Opciones de despliegue: ComfyUI con `UNETLoader` (sin cargador personalizado), nodo de atencion SLA, nodo de shift y los samplers en el orden de los workflows publicados. No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion de video. El despliegue con LoRA en vivo exige ademas dos `LoraLoaderModelOnly`.
- Latencia y throughput: 76 s por clip de 10 s a 4 pasos y 1152x640; 292 s por el mismo clip a 25 pasos. No se publican medidas de throughput agregado ni de latencia en otras resoluciones.

## Comparativa con modelos similares

| Alternativa | Formato y tamano | Pasos | Tiempo (1152x640, 243 fotogramas, semilla 42) | VRAM pico medida | LoRA adicionales | Licencia |
|---|---|---|---|---|---|---|
| Este fichero (bake INT8 ConvRot) | safetensors unico, 21 GB | 4 | 76 s | 47,8 GB (a 8 pasos, todo residente) | No | `minimax-h3-community-license-agreement` |
| Ruta live-LoRA equivalente: `xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI` (int8-convrot) + turbo de Kijai a 1.0 + Mystic v2.0 a 0.7 | safetensors + ~540 MB de LoRA | 8 | 103 s | 68,9 GB (a 8 pasos, todo residente) | Si, dos | Segun cada componente |
| `MiniMaxAI/MiniMax-H3` | no disponible | no disponible | no disponible | no disponible | No | `minimax-h3-community-license-agreement` |
| `diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024` | no disponible | no disponible | no disponible | no disponible | No | no disponible |

El resultado del fichero fusionado y el de la ruta apilada son equivalentes segun el autor, mismo plano y medidores de audio identicos dentro del ruido, con el mismo tiempo de pared a 8 pasos. La diferencia practica es la VRAM y el numero de cargadores. Frente al MiniMax-H3 original no se dispone de datos comparativos de calidad ni de tiempos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: 0 descargas y 0 likes, y fecha de creacion y actualizacion identicas (2026-09-18). No hay evidencia de uso independiente.
- Discrepancia de procedencia: las URL de los videos de previsualizacion de la model card apuntan al repositorio `MATLOWAI/minimax-h3-fused-turbo-int8-convrot`, no al ID `cgc-0521/minimax-h3-fused-turbo-int8-convrot` de este repositorio. Conviene verificar la autoria antes de reutilizarlo.
- Licencia restrictiva o poco clara: la etiqueta de HuggingFace es `other` con nombre `minimax-h3-community-license-agreement`. El texto de la licencia no aparece en la informacion disponible, por lo que hay que revisar el fichero `LICENSE` del repositorio antes de cualquier uso comercial.
- La cuantizacion INT8 con ConvRot es una aproximacion: no se publica ninguna comparacion numerica de fidelidad frente a la version BF16, por lo que la perdida de calidad no esta cuantificada.
- La fusion de LoRA fija las fuerzas (1.0 y 0.7) en los pesos. Para cambiar la intensidad del turbo o del suavizado de movimiento hay que recurrir a la ruta live-LoRA, que consume unos 21 GB mas de VRAM.
- La ruta de 4 + 4 con de-rope multiplica el coste por cinco respecto al pase unico de 4 pasos (~374 s frente a 76 s en frio) a cambio de movimiento mas limpio; es un compromiso que hay que decidir por proyecto.
- La receta de 4 pasos y el turbo destilado estan pensados para pocos pasos: subir a 8 o 25 pasos solo afina el dibujo ligeramente y no modifica el audio, de modo que invertir en pasos extra no siempre es rentable.
- Consumo de memoria del grafo completo: sin modo `--gpu-only` la copia de respaldo de los pesos parcheados se va a RAM del sistema, lo que exige maquinas con bastante memoria de host ademas de VRAM.
- Requisitos de compatibilidad: el layout `comfy_quant` y el nodo de atencion SLA dependen de versiones concretas de ComfyUI y de sus nodos; no se especifica la version minima en la informacion disponible.
- En ROCm hace falta un fork especifico de ComfyUI y una compilacion ROCm del nodo SLA, lo que limita la portabilidad a entornos CUDA estandar.
- No se documentan sesgos, composicion del dataset de entrenamiento ni idiomas soportados del modelo original, por lo que no se puede evaluar el riesgo de sesgo ni el comportamiento multilingue.
- Como todo modelo de difusion de video, puede producir artefactos e incoherencias temporales (parpadeos, deformaciones de manos o caras, desincronia puntual entre audio y movimiento) y no garantiza el cumplimiento literal del prompt.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cgc-0521/minimax-h3-fused-turbo-int8-convrot
- Base podada con delta de referencia, conversion ComfyUI: https://huggingface.co/xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI
- Base podada con delta de referencia, formato diffusers: https://huggingface.co/diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024
- Conversion ComfyUI de MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA turbo de Kijai (rango 24): https://huggingface.co/Kijai/MiniMax-H3_comfy/tree/main/loras
- LoRA turbo original de rango completo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- LoRA Mystic v2.0: https://civitai.com/models/2856467
- Fork de ComfyUI para ROCm con el nodo SLA: https://github.com/patientx-cfz/comfyui-rocm
- Videos de previsualizacion citados en la model card: https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/01_reference_4step_sla.mp4, https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/02_derope_4plus4_sla.mp4, https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/03_derope_dyrope_pb3049_warm375.mp4, https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/04_reference_6step_sla.mp4, https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/05_reference_8step_sla.mp4, https://huggingface.co/MATLOWAI/minimax-h3-fused-turbo-int8-convrot/resolve/main/previews/06_reference_25step_sla.mp4
- Busqueda web: no se encontraron resultados relevantes sobre este modelo. Todas las coincidencias devueltas correspondian a entidades ajenas al proyecto (CFE-CGC, CGC Cards, CGC Constructions, CGR Cinemas), por lo que no se incluyen.
