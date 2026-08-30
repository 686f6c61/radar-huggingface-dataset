# romainkh14/brimkern-image-BRIK

## Resumen

Brimkern image pipelines (BRIK) es un conjunto de pesos de modelos de difusión texto a imagen convertidos al formato BRIK, un contenedor auto-descriptivo diseñado por el proyecto Brimkern para ejecutar modelos de IA directamente en el navegador mediante WebGPU. El autor, Romain Khanoyan, ha empaquetado dos pipelines completos: uno basado en SD-Turbo (stabilityai/sd-turbo) para escritorio y otro basado en SDXS-512 (IDKiro/sdxs-512-0.9) para dispositivos móviles, ambos compartiendo un codificador de texto CLIP y un decodificador TAESD. El objetivo es permitir la generación de imágenes sin servidor de inferencia, de modo que los datos nunca salen del equipo del usuario.

La relevancia actual de este modelo radica en su enfoque on-device: aprovecha la API WebGPU de los navegadores modernos para ejecutar la inferencia en la GPU local, con pesos ya cuantizados en int8, int4 o mixto. Esto reduce la latencia y el consumo de ancho de banda, y permite que aplicaciones web ofrezcan generación de imágenes privada y offline. El repositorio tiene un tamaño de 3,5 GB y contiene varios archivos .brik que se cargan de forma conjunta según las capacidades del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion (SD-Turbo y SDXS-512) + CLIP text encoder + TAESD decoder |
| Parametros totales | no disponible (pesos cuantizados; archivos .brik de 205 MB a 921 MB segun componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | int8, int4, mixto (int8+int4) |
| Idiomas soportados | no disponible (depende del CLIP subyacente; no se especifica) |
| Licencia | see-source-models (SD-Turbo: research / no comercial salvo licencia de Stability; SDXS-512: OpenRAIL++; TAESD: MIT) |
| Formato de pesos | BRIK (contenedor propio, basado en GGUF repaquetado con cuantizacion previa) |

## Arquitectura y entrenamiento

Los pesos son derivados de dos modelos base: SD-Turbo (un modelo de difusion destilado de Stable Diffusion 2.1, optimizado para generar imagenes en un solo paso) y SDXS-512 (un modelo de difusion ligero de un solo paso, disenado para dispositivos con recursos limitados). No se ha realizado entrenamiento adicional; el trabajo consiste en la conversion de los pesos originales al formato BRIK, que incluye cuantizacion a int8, int4 o mixto, y la reorganizacion de los datos para que cada capa ocupe un rango HTTP contiguo, facilitando la carga por rangos y el almacenamiento en cache.

La innovacion tecnica principal es el formato BRIK en si: un contenedor que incorpora la topologia del modelo, los niveles de cuantizacion y la configuracion dentro del propio archivo. Ademas, el motor Brimkern implementa kernels de convolucion 3x3 cuantizados con tiling, lo que mejora el rendimiento respecto a la ruta f32. Segun las mediciones del autor, la optimizacion de la convolucion int8 logro una ganancia de 1,84x en tiempos por operacion y una reduccion del tiempo total de generacion de 5,0 s a 3,0 s para una imagen de 256 px en un portatil Apple Silicon.

## Capacidades

- Generacion de texto a imagen en un solo paso (con SD-Turbo o SDXS-512), sin necesidad de multiples iteraciones de difusion.
- Ejecucion completamente local en el navegador mediante WebGPU, sin servidor de inferencia remoto.
- Soporte de cuantizacion int8, int4 y mixta para adaptarse a distintas capacidades de GPU.
- Carga incremental por rangos HTTP y funcionamiento offline una vez cacheados los archivos.
- Dos pipelines preconfigurados: SD-Turbo (por defecto en escritorio, resolucion 512 px) y SDXS-512 (por defecto en movil, resolucion 512 px, con un pipeline total de 446 MB).
- Compatibilidad con la API de Brimkern para integracion en aplicaciones web y demos interactivas.
- No incluye capacidades de vision, audio ni razonamiento multimodal; es exclusivamente texto a imagen.

## Casos de uso

- Generacion de imagenes privada en aplicaciones web: el usuario introduce un prompt y la imagen se genera en su propia GPU, sin enviar datos a servidores. Adecuado para herramientas de diseno o prototipado donde la confidencialidad es critica.
- Demos y prototipos interactivos en el navegador: al no requerir instalacion ni backend, permite crear experiencias de generacion de imagenes en tiempo real para presentaciones o talleres.
- Generacion offline en entornos sin conexion: una vez cacheados los archivos .brik, la aplicacion puede generar imagenes sin acceso a Internet, util en aviones, zonas remotas o entornos corporativos restringidos.
- Aplicaciones moviles basadas en WebGPU: el pipeline SDXS-512 con 446 MB cabe en telefonos de gama media y permite generar imagenes con un solo paso, ideal para apps de edicion o creatividad.
- Educacion sobre modelos de difusion: al ser un pipeline completo y cuantizado, sirve como ejemplo didactico de como desplegar un modelo de generacion de imagenes en el navegador con optimizaciones de rendimiento.
- Integracion en herramientas de diseno asistido por IA: por ejemplo, un plugin de navegador que genere variaciones de imagenes a partir de prompts, aprovechando la privacidad y la velocidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, etc.) para estos pesos convertidos. La model card incluye mediciones de rendimiento propias del autor, obtenidas con Chrome en un portatil Apple Silicon y produccion, usando SD-Turbo q8 a 256 px y 1 paso:

| Metrica | Antes | Despues | Ganancia |
|---|---|---|---|
| 3x3 int8 convolution (94 disparos) | 35 411 µs/disparo | 19 217 µs/disparo | x1,84 |
| GPU total para una generacion | 6 455 ms | 3 856 ms | x1,67 |
| Generacion end-to-end a 256 px | 5,0 s | 3,0 s | x1,67 |

Estas cifras reflejan la optimizacion del kernel de convolucion cuantizada con tiling. No hay datos comparativos con otros modelos de difusion en navegador.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero el pipeline completo de SD-Turbo pesa 1,29 GB en disco (UNet q8 + CLIP q8 + TAESD), por lo que se requiere una GPU con al menos 2 GB de VRAM para cargar y ejecutar; el pipeline SDXS-512 pesa 446 MB y puede caber en GPUs integradas de telefonos.
- GPU recomendadas: cualquier GPU compatible con WebGPU (Apple Silicon M1/M2/M3, GPUs NVIDIA con soporte WebGPU en Chrome/Edge, GPUs integradas de moviles modernos). No se requiere GPU de datacenter.
- Cabe en GPU de consumo: si, tanto en portatiles Apple Silicon como en GPUs integradas de moviles con WebGPU.
- Opciones de despliegue: motor Brimkern (disponible en https://brimkern.com/), integrable en aplicaciones web mediante la SDK de Brimkern; tambien se puede usar la demo en linea. No soporta vLLM, llama.cpp ni Ollama, ya que es un formato propietario para navegador.
- Latencia y throughput: segun la medicion del autor, 3,0 s para una generacion de 256 px en Apple Silicon con Chrome; 512 px tardara mas, aunque no se proporciona el dato exacto.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de difusion en navegador (por ejemplo, WebStableDiffusion o versiones en GGUF de SD). La siguiente tabla compara los pipelines BRIK con sus modelos base originales, en terminos de tamano y licencia:

| Caracteristica | Brimkern BRIK (SD-Turbo) | SD-Turbo original | Brimkern BRIK (SDXS-512) | SDXS-512 original |
|---|---|---|---|---|
| Formato | BRIK cuantizado (int8) | safetensors (fp16) | BRIK cuantizado (int4/mixto) | safetensors (fp16) |
| Tamano del pipeline | 1,29 GB | ~4 GB (UNet + CLIP) | 446 MB | ~1 GB (estimado) |
| Ejecucion en navegador | Si, WebGPU | No | Si, WebGPU | No |
| Licencia | Research / no comercial | Research / no comercial | OpenRAIL++ | OpenRAIL++ |
| Pasos de inferencia | 1 | 1 | 1 | 1 |

No hay informacion sobre rendimiento comparativo en calidad de imagen, por lo que no se puede afirmar que BRIK supere o iguale a los originales en ese aspecto.

## Limitaciones y advertencias

- Licencia restrictiva para SD-Turbo: los archivos `sd-turbo-*` se distribuyen como artefacto de investigacion y no pueden usarse comercialmente sin una licencia de Stability AI. Es imprescindible revisar el enlace https://stability.ai/license antes de cualquier uso en produccion.
- El formato BRIK es propietario del proyecto Brimkern y no es compatible con herramientas estandar de inferencia (diffusers, ComfyUI, etc.); solo se puede ejecutar con el motor Brimkern en navegadores con WebGPU.
- La generacion de imagenes esta limitada a resoluciones de 512 px o inferiores; a 256 px el modelo produce recortes o primeros planos, segun el autor.
- No se especifican sesgos ni riesgos de alucinacion especificos, pero al ser un modelo de difusion hereda los sesgos de los datos de entrenamiento de SD-Turbo y SDXS-512, que pueden incluir sesgos de genero, raza o contenido estereotipado.
- El rendimiento depende criticamente del soporte WebGPU del navegador y de la GPU del usuario; en dispositivos antiguos o sin WebGPU, el modelo no funcionara.
- No hay garantia de que los pesos convertidos mantengan exactamente la calidad de los originales, ya que la cuantizacion int8/int4 puede degradar la fidelidad de la imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/romainkh14/brimkern-image-BRIK
- Repositorio GitHub de Brimkern: https://github.com/RomainKH/Brimkern
- Sitio web del proyecto (demo y chat): https://brimkern.com/
- Documentacion de Brimkern (incluye especificacion BRIK): https://brimkern.com/docs
- Especificacion del formato BRIK: https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md
- Scripts de benchmarks: https://github.com/RomainKH/Brimkern/tree/main/scripts/e2e
- Modelo base SD-Turbo: https://huggingface.co/stabilityai/sd-turbo
- Modelo base SDXS-512: https://huggingface.co/IDKiro/sdxs-512-0.9
- Decodificador TAESD: https://huggingface.co/madebyollin/taesd
