# Gluttony10/MiniMax-H3-INT8-CONVROT

## Resumen

MiniMax-H3-INT8-CONVROT es un paquete de pesos convertidos y cuantizados del modelo MiniMax-H3, desarrollado por el usuario de la comunidad Gluttony10 para su uso directo en ComfyUI. El modelo original, creado por MiniMax, es un sistema multimodal nativo de generación de vídeo y audio que produce vídeos en resolución 2K con audio estéreo 3D sincronizado. Esta conversión resuelve el problema de la alta demanda de memoria del modelo original al aplicar cuantización INT8 con la técnica ConvRot (rotación de pesos para reducir outliers), lo que permite ejecutar el modelo en hardware más asequible manteniendo una calidad aceptable.

El paquete incluye los dos difusores DiT (FL2VA y Ref2VA) en INT8, el text encoder Qwen3-VL de 32B también cuantizado, los VAEs de vídeo y audio, y LoRAs turbo opcionales para reducir el número de pasos de muestreo. Es una solución integral para quienes quieran desplegar generación de vídeo con audio en local, sin depender de APIs externas. Su relevancia actual radica en que democratiza el acceso a un modelo de vídeo de última generación, que de otro modo requeriría infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) multimodal para video+audio, con text encoder Qwen3-VL 32B |
| Parametros totales | No disponible (el text encoder tiene 32B; el DiT no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (orientado a secuencias de video) |
| Tipos de cuantizacion | INT8 con ConvRot (rotacion de pesos) |
| Idiomas soportados | No disponible (el text encoder Qwen3-VL soporta multiples idiomas, pero no se detalla) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (archivos .safetensors) |

## Arquitectura y entrenamiento

Esta conversion no introduce un entrenamiento nuevo, sino que parte de los pesos oficiales de MiniMax-H3 y los transforma para su ejecucion en ComfyUI. El modelo original es un DiT (Diffusion Transformer) multimodal que procesa simultaneamente texto, imagenes y audio para generar video con pista de audio sincronizada. El text encoder es Qwen3-VL de 32B, que proporciona una comprension semantica avanzada de las instrucciones en lenguaje natural.

La innovacion principal de esta conversion es el uso de ConvRot, una tecnica que rota los pesos de las capas convolucionales y lineales para reducir la magnitud de los outliers, mejorando asi la precision de la cuantizacion INT8. Ademas, los pesos se han fusionado y empaquetado en un formato optimizado para el plugin ComfyUI-RH-MiniMax-H3, que gestiona la carga de los distintos componentes (DiT, text encoder, VAEs) de forma automatica. Los LoRAs turbo incluidos permiten reducir el numero de pasos de muestreo de decenas a 4 u 8, acelerando significativamente la generacion sin perdida notable de calidad.

## Capacidades

- Generacion de video a partir de texto con audio sincronizado (T2VA).
- Generacion de video a partir de una imagen de referencia (FL2VA).
- Generacion de audio a partir de un video existente (V2A).
- Generacion con referencias ordenadas de imagen, video y audio (Ref2VA).
- Resolucion de salida hasta 2K (2048x2048 o similar) con audio estereo 3D.
- Comprension multimodal del prompt gracias al text encoder Qwen3-VL de 32B.
- Soporte de LoRAs turbo para inferencia acelerada (4 o 8 pasos).
- Integracion nativa con ComfyUI mediante nodos dedicados.

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: el modelo genera videos cortos con musica o efectos de sonido directamente desde una descripcion textual, ideal para campañas de marketing o contenido viral.
- Prototipado rapido de videos para presentaciones: permite generar un video conceptual con audio en minutos, sin necesidad de equipos de produccion, para validar ideas antes de una produccion completa.
- Generacion de efectos de sonido sincronizados: a partir de un video mudo, la capacidad V2A produce una pista de audio coherente con las acciones de la escena, util en postproduccion.
- Doblaje automatico de videos: combinando V2A con edicion posterior, se pueden generar locuciones o efectos sonoros para videos existentes en multiples idiomas.
- Creacion de videos educativos: se pueden generar explicaciones visuales animadas con narracion y musica de fondo a partir de guiones de texto.
- Generacion de videos de referencia para animadores: los artistas pueden usar el modo FL2VA con una imagen de referencia para obtener un video base sobre el que trabajar.
- Automatizacion de contenido para e-commerce: generar videos de producto con descripciones habladas y musica ambiental a partir de fichas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no especificada oficialmente, pero por el tamano de los archivos (DiT de 31.65 GiB, text encoder de 25.28 GiB en INT8) se estima que se necesitan al menos 64 GB de VRAM para cargar todos los componentes de forma simultanea.
- GPU recomendadas: NVIDIA A100 80GB, H100, o configuraciones con multiples GPUs (por ejemplo, dos RTX 4090 con offloading). No cabe en una GPU consumer de 24 GB de forma completa.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-RH-MiniMax-H3. No se menciona soporte para vLLM, llama.cpp u otros motores.
- Latencia y throughput: no disponibles. El uso de LoRAs turbo (4 o 8 pasos) reduce significativamente el tiempo de generacion respecto a los pasos estandar (tipicamente 30-50).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Resolucion | Audio | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3 (original) | No disponible | BF16 | 2K | Si | MiniMax H3 Community |
| MiniMax-H3-INT8-CONVROT (este) | No disponible | INT8 + ConvRot | 2K | Si | MiniMax H3 Community |
| MiniMax-H3-nvfp4-INT4-INT8-Convrot (ABIRAY) | No disponible | NVFP4/INT4/INT8 | 2K | Si | MiniMax H3 Community |

La diferencia principal entre las versiones cuantizadas es el grado de compresion: esta version usa INT8, mientras que la de ABIRAY ofrece opciones mas agresivas (INT4) para hardware con menos VRAM. No hay datos de rendimiento comparativo publicados. Frente a otros modelos de generacion de video como CogVideoX o Mochi, MiniMax-H3 destaca por su salida nativa con audio sincronizado, una capacidad poco comun en modelos open source.

## Limitaciones y advertencias

- La licencia es la Community License de MiniMax H3, que puede imponer restricciones al uso comercial. Es imprescindible revisar el texto completo de la licencia antes de desplegar en produccion.
- La cuantizacion INT8 puede degradar ligeramente la calidad del video o audio generado respecto a los pesos BF16 originales, especialmente en escenas con alto detalle o movimiento rapido.
- No se han publicado benchmarks independientes que validen el rendimiento de esta conversion frente al modelo original.
- El modelo requiere una cantidad considerable de VRAM y RAM (se recomiendan al menos 64 GiB de RAM para la descarga y carga de pesos).
- No se ha verificado el comportamiento del modelo con prompts en espanol; la calidad puede variar segun el idioma.
- El paquete es una conversion de la comunidad, no una publicacion oficial de MiniMax, por lo que el soporte y las actualizaciones dependen del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gluttony10/MiniMax-H3-INT8-CONVROT
- Plugin ComfyUI-RH-MiniMax-H3: https://github.com/RH-RunningHub/ComfyUI-RH-MiniMax-H3
- Modelo oficial MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio oficial MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Espejo en ModelScope: https://modelscope.cn/models/Gluttony10/MiniMax-H3-INT8-CONVROT
- Hub comunitario de MiniMax H3: https://github.com/ai-models-lab/minimax-h3
- Pagina de recursos de MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
