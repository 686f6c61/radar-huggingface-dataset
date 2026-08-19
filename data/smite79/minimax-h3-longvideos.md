# Smite79/MiniMax-H3-Longvideos

## Resumen

H3-LongVideos es un paquete de nodos personalizados para ComfyUI que permite generar vídeos continuos de aproximadamente dos minutos con el modelo de generación de vídeo MiniMax-H3 a partir de un único prompt de texto. El paquete, desarrollado por Smite79, resuelve un problema práctico: H3 limita cada generación individual a 362 frames (unos 15 segundos), por lo que para obtener vídeos largos es necesario encadenar múltiples tomas. Este proyecto automatiza ese proceso: divide el prompt en tomas, las encadena tomando como punto de partida el último frame de la toma anterior, y devuelve un par `images` + `audio` listo para el vídeo final.

La relevancia del paquete reside en que aborda los problemas típicos del encadenamiento manual: duplicación de personajes cuando el prompt los menciona más de una vez, cambios de vestuario entre tomas, movimiento de boca sin diálogo, reapariciones de personajes que ya salieron de cuadro y agotamiento de VRAM en cadenas largas. Todo se gestiona en la capa de ensamblado de prompts y de gestión de memoria, sin necesidad de dependencias externas ni instalaciones adicionales más allá de ComfyUI 0.30+ con soporte nativo para MiniMax-H3.

El repositorio en HuggingFace no contiene el modelo en sí, sino el código fuente del paquete de nodos (archivos Python, tests y documentación). El modelo base es MiniMaxAI/MiniMax-H3, cargado a través de los loaders estándar de ComfyUI. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de nodos ComfyUI (no es un modelo); modelo base: MiniMax-H3 (difusion de video) |
| Parametros totales | no disponible (depende del modelo base MiniMax-H3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete detecta precision del checkpoint: BF16/FP8/INT8/NVFP4/MXFP8) |
| Idiomas soportados | Ingles (prompts en ingles, segun la model card) |
| Licencia | MIT |
| Formato de pesos | Codigo fuente Python (nodos ComfyUI); los pesos del modelo base se cargan con los loaders de ComfyUI |

## Arquitectura y entrenamiento

H3-LongVideos no es un modelo entrenado, sino un conjunto de nodos personalizados para ComfyUI que orquesta el modelo MiniMax-H3. La arquitectura del paquete se compone de tres nodos principales: el nodo principal "H3 Long Videos V1", que recibe el prompt y la duracion, divide el texto en tomas, las encadena y devuelve el video con audio; el nodo "H3 Shot Length" que convierte una duracion en segundos a un numero valido de frames (17k+5); y el nodo "H3 Model Inspector" que informa sobre la precision del checkpoint cargado (BF16, FP8, INT8, NVFP4, MXFP8) y si la GPU lo ejecuta de forma nativa.

El paquete implementa logica de gestion de estado de personajes y vestuario: las prendas se almacenan en un canal mutable que permite cambios (por ejemplo, "She takes off her jacket" elimina la chaqueta y esta no reaparece), los personajes que salen de cuadro se eliminan de tomas posteriores, y se controla la duplicacion reescribiendo el prompt para que cada persona se describa una sola vez. Tambien gestiona el audio silenciando las tomas sin dialogo y anade un contador explicito de sujetos cuando la resolucion es baja o se aplica un LoRA.

No se dispone de informacion sobre los datos de entrenamiento del modelo base MiniMax-H3, ni sobre el proceso de entrenamiento (RLHF, DPO, etc.) en la documentacion proporcionada.

## Capacidades

- Generacion de videos largos (aproximadamente 2 minutos) a partir de un unico prompt de texto, dividiendo automaticamente el prompt en tomas y encadenandolas.
- Consistencia de personajes entre tomas: mantiene la apariencia fisica, vestuario y presencia/ausencia de cada personaje a lo largo de toda la secuencia.
- Gestion de vestuario mutable: permite que los personajes se quiten o pongan prendas mediante lenguaje natural, y el cambio persiste en tomas posteriores.
- Control de duplicacion de personajes: reescribe el prompt para evitar que un personaje se renderice dos veces cuando se le menciona mas de una vez.
- Gestion de audio: silencia automaticamente las tomas sin dialogo (sin movimiento de boca) y mantiene el audio sincronizado en las tomas con lineas habladas.
- Deteccion de precision del checkpoint (BF16, FP8, INT8, NVFP4, MXFP8) para informar si la GPU lo ejecuta de forma nativa.
- Modo "plan_only" para previsualizar la division de tomas, duracion de cada una y tiempo total sin renderizar.
- Integracion opcional con upscaling (RTX Video Super Resolution, modelos Real-ESRGAN/UltraSharp) y previsualizacion en vivo durante el muestreo, con fallback automatico si no estan instalados.

## Casos de uso

- Creacion de cortometrajes narrativos: un escritor puede introducir un guion completo y obtener un video de dos minutos con multiples escenas, personajes consistentes y audio sincronizado, sin necesidad de editar manualmente cada toma.
- Videos de demostracion de productos: una empresa puede generar un video largo mostrando un producto desde diferentes angulos y situaciones, manteniendo el mismo modelo de producto y el mismo entorno a lo largo de todas las tomas.
- Contenido educativo animado: un profesor puede crear explicaciones visuales de conceptos con varios pasos, donde cada paso es una toma y los personajes o elementos graficos se mantienen coherentes.
- Prototipado rapido de escenas cinematograficas: directores o storyboarders pueden generar una secuencia continua para evaluar el ritmo, la continuidad y la coherencia visual antes de la produccion real.
- Generacion de videos para redes sociales: creadores de contenido pueden producir videos largos de formato vertical u horizontal con una sola instruccion, ahorrando horas de edicion.
- Pruebas de consistencia de personajes en produccion: los equipos de VFX pueden usar el modo "plan_only" para verificar que la division de tomas y la logica de personajes funcionan antes de lanzar una renderizacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento (PSNR, SSIM, FVD, etc.) ni comparaciones con otros metodos de generacion de video largo.

## Requisitos de hardware

- Requiere ComfyUI 0.30+ con soporte nativo para MiniMax-H3.
- Se necesitan los archivos del modelo H3 estandar: checkpoint de difusion, text encoder Qwen3-VL, VAE de video (`minimax_h3_video_vae`) y VAE de audio (`minimax_h3_audio_vae`), cargados con los loaders de ComfyUI.
- No se especifica la VRAM minima necesaria en la documentacion. Dado que el modelo base es MiniMax-H3, se recomienda una GPU con al menos 16-24 GB de VRAM para inferencia a resolucion nativa, aunque no hay datos confirmados.
- El paquete incluye un nodo "H3 Model Inspector" que informa si la GPU ejecuta el checkpoint de forma nativa segun su precision (BF16, FP8, INT8, NVFP4, MXFP8).
- Opciones de despliegue: exclusivamente como nodos de ComfyUI; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- La latencia y el throughput dependen del hardware y del modelo base; no hay datos publicados en el repositorio.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre alternativas comparables al paquete H3-LongVideos (por ejemplo, otros sistemas de generacion de video largo con encadenamiento automatico en ComfyUI). El modelo base MiniMax-H3 es un modelo de generacion de video de MiniMax, pero no se dispone de datos de comparacion con otros modelos de video en la documentacion del repositorio.

## Limitaciones y advertencias

- El paquete depende de ComfyUI 0.30+ y de los archivos del modelo MiniMax-H3; sin ellos no funciona.
- La generacion de cada toma esta limitada a 362 frames (~15 segundos) por el modelo H3; el paquete encadena tomas, pero no puede generar una toma mas larga que ese limite.
- El prompt debe escribirse en ingles (la model card indica `language: en`); no se garantiza el funcionamiento con prompts en otros idiomas.
- La logica de gestion de personajes y vestuario se basa en el analisis de texto del prompt; puede fallar con descripciones ambiguas o complejas, y el autor recomienda revisar el modo "plan_only" antes de renderizar.
- El silenciado de tomas sin dialogo es heuristico: si una toma tiene una linea hablada que no se detecta correctamente, el audio puede quedar desincronizado.
- No se incluyen garantias de calidad del video generado: el resultado depende del modelo base MiniMax-H3, que puede producir artefactos visuales o inconsistencias no controladas por el paquete.
- La licencia MIT cubre el codigo del paquete, pero el modelo base MiniMax-H3 tiene su propia licencia (no especificada en el repositorio); es necesario verificar los terminos de uso del modelo base para uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Smite79/MiniMax-H3-Longvideos
- Modelo base (referenciado): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Integracion opcional RTX Nodes (referenciada): https://github.com/Comfy-Org/Nvidia_RTX_Nodes_ComfyUI
