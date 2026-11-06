# OxBee/MiniMax-H3-ORB360-CardSpin

## Resumen

MiniMax-H3-ORB360-CardSpin es una coleccion de adaptadores LoRA (rank 32) para el modelo de generacion de video MiniMax-H3 en su variante Ref2VA (referencia a video/animacion), desarrollada por el usuario OxBee. El objetivo es anadir control de camara explicito sobre una imagen de referencia: a partir de una fotografia, el modelo genera un video con una orbita de camara de 360 grados en sentido horario alrededor del sujeto congelado, o bien un efecto de giro tipo tarjeta fisica plana (CardSpin). Se trata, por tanto, de un adaptador de bajo rango, no de un modelo fundacional completo.

El repositorio incluye tres ficheros de pesos: el LoRA de orbita `minimax_h3_orb360_step1500.safetensors` (entrenado 1500 pasos sobre orbitas Blender de alta resolucion), y dos variantes CardSpin (`cardspin_v2_step50` y `cardspin_step50`), que anaden 50 pasos de entrenamiento especifico de giro de tarjeta sobre el LoRA de orbita. El tamano total del repositorio es de 1,8 GB, coherente con pesos LoRA de rank 32 sobre un modelo de video de gran tamano.

La relevancia de esta ficha es acotada: no es un modelo independiente sino un adaptador para el ecosistema MiniMax-H3, pensado para flujos de trabajo de generacion de video image-to-video con control de camara (Musubi Tuner, ComfyUI). No hay informacion publica sobre el modelo base en la informacion proporcionada, por lo que las especificaciones del modelo subyacente (parametros, contexto) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre MiniMax-H3 Ref2VA (arquitectura del modelo base no disponible) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto se usa en ingles en los ejemplos) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA de rank 32 sobre el modelo MiniMax-H3 Ref2VA. El entrenamiento se realizo con Musubi Tuner y se documenta en tres etapas: un LoRA de orbita inicial entrenado sobre orbitas renderizadas en Blender con fondo gris y resolucion 512x512 (750 pasos, no incluido en este repositorio), un LoRA de orbita de alta resolucion (`step1500`) entrenado 1500 pasos sobre orbitas Blender de alta resolucion con alturas de camara desde por debajo hasta por encima del sujeto y entre 1 y 4 imagenes de referencia etiquetadas, y dos variantes CardSpin que parten del LoRA de orbita y anaden 50 pasos sobre un unico clip de entrenamiento de giro de tarjeta.

El autor documenta de forma explicita el efecto del entrenamiento sobre la calidad: el paso de 750 a 1500 pasos casi duplica el detalle fino (varianza laplaciana de 30,2 a 56,1, 1,85x, superior en los 124 fotogramas), mientras que los 50 pasos de CardSpin reducen el detalle fino a aproximadamente un tercio del de `step1500` (20,7 frente a 56,1) y alejan el primer fotograma de la foto original (PSNR 22,5 dB frente a 28,5 dB). El autor atribuye esta perdida a que el unico clip de entrenamiento de CardSpin es un video generado y suave, que arrastra el aspecto global. No se documentan datos sobre el dataset del modelo base, el uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de video image-to-video a partir de una o varias imagenes de referencia (1 a 4 imagenes etiquetadas en el entrenamiento de orbita).
- Control de camara explicito: orbita de 360 grados en sentido horario (`ORB360_CW`) alrededor de un sujeto congelado.
- Efecto CardSpin: giro de la fotografia en el espacio como si fuera una tarjeta fisica plana (`ORB360_CARDSPIN`).
- Conservacion del entorno real de la fotografia de entrada: el autor documenta que el LoRA de orbita, entrenado solo con renders Blender sobre fondo gris, mantiene la escena nevada real alrededor del gato en el ejemplo publicado.
- Soporte de multiples resoluciones de generacion (ejemplos a 1024x768 y 512x512) y de clips de 124 fotogramas.
- Integracion con flujos de trabajo ComfyUI y Musubi Tuner.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos del usado en los prompts de ejemplo.

## Casos de uso

- Visualizacion de producto en 360 grados: a partir de una foto de un objeto, generar una orbita completa que muestre todos sus lados, util para fichas de e-commerce y catalogos interactivos; el LoRA de orbita `step1500` es el adecuado por su mayor detalle fino.
- Turismo y bienes raices: generar un recorrido orbital alrededor de un elemento destacado de una estancia o monumento a partir de una unica fotografia, manteniendo el entorno real segun documenta el autor.
- Creacion de contenido para redes sociales: producir clips de giro tipo tarjeta (CardSpin) de retratos o productos para publicaciones de formato corto, usando `cardspin_v2_step50` solo cuando el efecto de tarjeta sea el objetivo.
- Prototipado de previsualizaciones en estudios de fotografia y CGI: validar angulos de camara y composicion antes de un render costoso, aprovechando que el adaptador opera sobre una foto existente.
- Efectos visuales en postproduccion: integrar el LoRA en un pipeline de ComfyUI para generar tomas de orbita de elementos concretos de una escena y combinarlas con metraje real.
- Demostraciones y material didactico sobre control de camara en modelos de video: el repositorio incluye prompts, semillas y ajustes concretos (1024x768, 124 fotogramas, 20 pasos, semilla 20260926) que permiten reproducir los resultados y estudiar el efecto del entrenamiento.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, VBench u otros). La unica evaluacion cuantitativa disponible son estadisticas de imagen por fotograma sobre un mismo clip (misma foto, prompt, semilla, 1024x768, 124 fotogramas) comparando cuatro LoRAs:

| Metrica (gato blanco, orbita 360) | Orbita step 750 (antiguo) | CardSpin v1 (750 + 50) | ORB360 step 1500 | CardSpin v2 (1500 + 50) |
|---|---|---|---|---|
| Detalle fino (varianza laplaciana) | 30,2 | 19,8 | 56,1 | 20,7 |
| Detalle relativo a step 1500 | 0,54x | 0,34x | 1,00x | 0,35x |
| Energia de bordes (Tenengrad) | 1098 | 809 | 1343 | 841 |
| Proporcion de alta frecuencia | 0,0035 | 0,0028 | 0,0050 | 0,0029 |
| Primer fotograma frente a la foto, PSNR / SSIM | 28,0 dB / 0,87 | 24,5 dB / 0,85 | 28,5 dB / 0,87 | 22,5 dB / 0,77 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente del modelo base MiniMax-H3 Ref2VA, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Musubi Tuner y ComfyUI, segun las etiquetas y la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a este adaptador de video).
- Latencia y throughput: no disponibles. Los ejemplos usan 20 pasos de inferencia y clips de 124 fotogramas a 1024x768, pero no se publican tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de control de camara para generacion de video, ni especificaciones del modelo base que permitan una comparacion rigurosa. La unica comparacion posible es interna, entre los tres ficheros del propio repositorio:

| Fichero | Entrenamiento | Uso recomendado | Detalle fino relativo |
|---|---|---|---|
| `minimax_h3_orb360_step1500.safetensors` | 1500 pasos, orbitas Blender alta resolucion | Orbitas 360 limpias y uso multi-vista | 1,00x |
| `minimax_h3_orb360_cardspin_v2_step50.safetensors` | step 1500 + 50 pasos CardSpin | Efecto de giro de tarjeta | 0,35x |
| `minimax_h3_orb360_cardspin_step50.safetensors` | Orbita 512x512 + 50 pasos CardSpin | Efecto de giro de tarjeta (version original) | 0,34x |

## Limitaciones y advertencias

- Los ficheros CardSpin pierden aproximadamente dos tercios del detalle fino respecto a `step1500` y se alejan mas de la foto original en el primer fotograma; el autor recomienda usarlos solo para el efecto de tarjeta y `step1500` para orbitas.
- El LoRA de orbita se entreno exclusivamente con renders Blender sobre fondo gris; su comportamiento sobre fotografias reales puede variar y no esta cuantificado mas alla del ejemplo publicado.
- El entrenamiento CardSpin se basa en un unico clip generado y suave, lo que probablemente sesga el aspecto global hacia ese material.
- No hay informacion sobre sesgos del modelo base, riesgo de alucinacion visual, limitaciones de idioma ni rendimiento en dominios distintos de los ejemplos (retrato de gato, retrato historico).
- La licencia es la MiniMax-H3 Community License Agreement, etiquetada como "other"; no se detallan en la informacion disponible las restricciones para uso comercial, por lo que debe consultarse el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- El adaptador no es autonomo: requiere el modelo base MiniMax-H3 y una herramienta compatible (Musubi Tuner o ComfyUI); no se documentan requisitos de version ni pasos de instalacion.
- El repositorio tiene 150 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OxBee/MiniMax-H3-ORB360-CardSpin
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Clip de ejemplo CardSpin v2: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_v2_step50.mp4
- Clip de ejemplo orbita step 1500: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_step1500.mp4
- Clip de ejemplo CardSpin v1: https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_cardspin_step50.mp4
- Comparativa visual de detalle (cuatro LoRAs): https://huggingface.co/MATLOWAI/MiniMax-H3-ORB360-CardSpin/resolve/main/assets/whitecat_orbit_detail_4way.jpg
- Licencia: fichero LICENSE del repositorio (no se proporciona URL directa en la informacion disponible)
