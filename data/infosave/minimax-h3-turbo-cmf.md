# infosave/MiniMax-H3-Turbo-cmf

## Resumen

MiniMax-H3-Turbo-cmf es una distribucion empaquetada del modelo MiniMax-H3, desarrollada por el usuario infosave, que combina la generacion de video y audio estereo sincronizado en un unico transformer de difusion. Sobre la base original de Comfy-Org/MiniMax-H3, se ha fusionado la LoRA Turbo de larryvrh, que reduce el numero de pasos de muestreo a solo cuatro, y el resultado se ha cuantizado a 4 bits. La principal innovacion es su empaquetado en formato CMF (Cortiq Model Format), un contenedor de un solo archivo con mapeo en memoria que se ejecuta mediante `cortiq`, un binario escrito en Rust que no requiere Python, PyTorch ni CUDA toolkit.

El modelo resuelve el problema del despliegue complejo y los elevados requisitos de almacenamiento de los generadores de video actuales. Mientras que la instalacion de referencia de MiniMax-H3 ocupa 124,4 GB repartidos en varios archivos y requiere ComfyUI, esta version ofrece archivos individuales de entre 13,2 GB y 23,9 GB, seleccionables segun la VRAM disponible. Con 47,83 mil millones de parametros, soporta text-to-video y, en sus variantes `fl2va`, tambien keyframe-to-video, manteniendo la licencia Apache-2.0 y un pipeline de generacion de video y audio en un solo paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video y audio, con encoder de prompts Qwen3-VL, VAE de video y vocoder de audio |
| Parametros totales | 47,83 mil millones (47.83 B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (generacion de video, no procesamiento de texto largo) |
| Tipos de cuantizacion | 4-bit (q4tp) y 2-bit (q2tp, desaconsejado por el autor) |
| Idiomas soportados | No disponible (el encoder Qwen3-VL base es multilingue, pero no se especifica para esta adaptacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (Cortiq Model Format, contenedor memory-mapped de un solo archivo) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo MiniMax-H3 original, que emplea un unico transformer de difusion para denoising conjunto de video y audio en una secuencia empaquetada, operando sobre dos esquemas de flujo (flow schedules). El encoder de prompts es Qwen3-VL, que en la version completa de 32B procesa las instrucciones de texto, mientras que las variantes compactas utilizan un encoder de 4B con una proyeccion ClipProj ajustada. El decodificador de video usa una VAE y el audio se sintetiza mediante un vocoder integrado.

El entrenamiento especifico de esta version no se detalla en la informacion disponible, pero se sabe que incorpora la LoRA Turbo de larryvrh fusionada directamente en los pesos, lo que permite generar video en solo cuatro pasos de muestreo sin necesidad de descargar archivos adicionales. La cuantizacion a 4 bits se aplica a todos los tensores, y el contenedor CMF incluye un hash por tensor para verificar la integridad. El autor publica tambien una variante de 2 bits como experimento fallido, documentando que no es adecuada para renderizado.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resolucion configurable, probada a 512x288 píxeles y 39 fotogramas.
- Generacion de audio estereo sincronizado con el video en el mismo paso de denoising, sin pipelines separados.
- Keyframe-to-video en las variantes `fl2va`: acepta una imagen inicial (`--first-frame`) y/o final (`--last-frame`) en formato P6 PPM para condicionar la geometria de la animacion.
- Inferencia en solo cuatro pasos de muestreo gracias a la LoRA Turbo fusionada, lo que reduce drasticamente la latencia frente a los 20-50 pasos habituales.
- Ejecucion sin dependencias de Python, PyTorch, CUDA toolkit ni ffmpeg, mediante el binario Rust `cortiq`.
- Verificacion de integridad de pesos con el comando `cortiq verify` y consulta de arquitectura con `cortiq info`.
- Salida en formato AVI (video MJPEG con audio PCM estereo), reproducible en VLC y mpv.

## Casos de uso

- Creacion de clips cortos para redes sociales: un creador de contenido puede generar un video de 39 fotogramas con audio sincronizado a partir de una sola frase, como "un corgi con gorro de chef dando la vuelta a una tortita", en menos de un minuto y con una GPU de 24 GB, listo para subir a TikTok o YouTube Shorts.
- Previsualizacion de storyboards animados: los estudios de animacion pueden convertir guiones graficos en animaciones aproximadas de 4 pasos para evaluar ritmo, encuadre y sonido antes de la produccion final, usando las variantes con soporte de keyframes para fijar el primer y ultimo fotograma.
- Generacion de assets para videojuegos: los desarrolladores independientes pueden producir efectos de particulas, fondos animados o cutscenes breves con audio, directamente en formato AVI, e integrarlos en el motor del juego sin necesidad de un pipeline de IA en Python.
- Animacion de keyframes para motion graphics: un disenador puede proporcionar una imagen inicial en PPM y el modelo genera la secuencia de video que parte de esa imagen, anclando la geometria y evitando derivas en la composicion.
- Despliegue en entornos con restricciones de software: al ser un binario Rust autocontenido, se puede instalar en servidores de inferencia donde no se permite instalar Python o frameworks de ML, facilitando la integracion en pipelines de CI/CD o en entornos contenerizados ligeros.
- Generacion local en estaciones de trabajo con GPU de 16 GB: la variante compacta de 13,16 GB permite ejecutar el modelo en tarjetas como la RTX 4080 o la RTX 4070 Ti Super, con un pico de VRAM de 15,1 GB, haciendo viable la generacion de video local sin recurrir a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo de generacion de video y audio, no de texto. Como indicadores de rendimiento, el autor proporciona los siguientes datos medidos:

- Pasos de muestreo: 4 (frente a los 20-50 de la mayoria de modelos de difusion).
- Pico de VRAM de la variante compacta (`mmh3-turbo-clipproj4b-q4tp.cmf`): 15,1 GB.
- Tamano de archivo: entre 13,16 GB y 23,94 GB segun la variante.
- Verificacion de integridad: `cortiq verify` limpio en los 2.361 tensores del modelo.

## Requisitos de hardware

- VRAM minima para la variante compacta (`mmh3-turbo-clipproj4b-q4tp.cmf`, 13,16 GB): 16-20 GB, con un pico medido de 15,1 GB.
- VRAM recomendada para las variantes completas (`mmh3-turbo-fl2va-q4tp.cmf` y `mmh3-turbo-q4tp.cmf`, 23,94 GB y 23,47 GB): 24 GB o superior.
- GPUs compatibles: RTX 4090, RTX 3090, A100, H100 y cualquier GPU consumer con 16 GB o mas de VRAM para la version compacta.
- Opciones de despliegue: exclusivamente mediante el binario `cortiq` (Rust). No es compatible con vLLM, Ollama, TGI ni llama.cpp al usar un formato de pesos propietario CMF.
- Latencia y throughput: no se proporcionan mediciones de tiempo exactas, pero el modelo opera en 4 pasos de muestreo, lo que sugiere una generacion significativamente mas rapida que los modelos de difusion convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pasos | Tamano archivo | Runtime | Licencia |
|---|---|---|---|---|---|---|
| MiniMax-H3-Turbo-cmf (compacto) | 47,83 B | 4-bit | 4 | 13,16 GB | cortiq (Rust) | Apache-2.0 |
| MiniMax-H3-Turbo-cmf (completo) | 47,83 B | 4-bit | 4 | 23,94 GB | cortiq (Rust) | Apache-2.0 |
| Comfy-Org/MiniMax-H3 (referencia) | No disponible | No disponible | No disponible | 124,4 GB (4 archivos + ComfyUI) | ComfyUI (Python) | Apache-2.0 |
| larryvrh/MiniMax-H3-Turbo-Lora | No disponible | No disponible | 4 | No disponible (LoRA) | ComfyUI (Python) | No disponible |

La comparativa directa con el modelo base muestra que esta version reduce el almacenamiento en un 80-90% y elimina la dependencia de Python, a cambio de una cuantizacion a 4 bits que puede afectar ligeramente a la calidad final. La variante compacta con ClipProj de 4B es la unica opcion viable para GPUs de 16 GB, aunque el autor advierte que la proyeccion se ajusto solo con activaciones de texto, por lo que la calidad del condicionamiento con imagenes en escenas complejas puede ser inferior a la del encoder completo.

## Limitaciones y advertencias

- El autor publica la variante de 2 bits (`mmh3-turbo-fl2va-q2tp.cmf`, 18,74 GB) como un callejon sin salida y desaconseja expresamente su uso para renderizado.
- La proyeccion ClipProj de las variantes compactas se ajusto unicamente con activaciones de texto, por lo que el condicionamiento con imagenes en escenas complejas puede producir resultados de calidad inferior; el autor solicita reportar estos casos en los foros de discusion.
- La salida se genera en formato AVI (MJPEG con PCM), que puede requerir conversion a MP4 u otros formatos para su uso en plataformas web o editores de video.
- No se especifican los idiomas soportados por el encoder de prompts, aunque Qwen3-VL base es multilingue; la calidad en idiomas distintos del ingles no esta garantizada.
- El runtime `cortiq` es un proyecto reciente y su ecosistema de herramientas, plugins y documentacion es limitado en comparacion con ComfyUI.
- No se han publicado benchmarks de calidad estandar (FVD, CLIP score, etc.) que permitan comparar objetivamente la fidelidad del video generado frente a otros modelos.
- La generacion de audio esta limitada a estereo PCM y puede no cubrir todos los matices sonoros de escenas complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/MiniMax-H3-Turbo-cmf
- Repositorio del formato CMF y runtime cortiq: https://github.com/infosave2007/cmf
- Releases de cortiq (binarios precompilados): https://github.com/infosave2007/cmf/releases/latest
- Modelo base MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Turbo de larryvrh: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
