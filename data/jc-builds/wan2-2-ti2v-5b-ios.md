# jc-builds/Wan2.2-TI2V-5B-iOS

## Resumen

Wan 2.2 TI2V 5B es un modelo de generación de vídeo desarrollado por Alibaba (Wan-AI) que combina texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) en un único transformer de difusión denso de 5 mil millones de parámetros. El bundle presentado por jc-builds lo adapta para ejecución local en dispositivos Apple (iOS, macOS, visionOS) mediante cuantización GGUF Q4_K_M, acompañado del text encoder UMT5-XXL y el VAE de alta compresión 16×16×4 de Wan 2.2. El resultado es un paquete de ~8,5 GB que permite generar vídeo sin servidor, directamente en el dispositivo, a través del motor de difusión on-device Mirage.

La relevancia de este modelo radica en que democratiza la generación de vídeo de calidad razonable en hardware de consumo, algo que hasta ahora requería GPUs de gama alta o servicios en la nube. Aunque el rendimiento es modesto (un clip de ~0,8 segundos tarda entre 10 y 15 minutos en un Apple M2), demuestra que es viable ejecutar modelos de vídeo de 5B en dispositivos móviles con 12 GB de RAM o más. El modelo soporta tanto texto-a-vídeo como animación de imágenes fijas, y funciona en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion denso (DiT) con VAE de alta compresion 16×16×4 y text encoder UMT5-XXL |
| Parametros totales | 5.680.910.336 (5,68 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no LLM) |
| Tipos de cuantizacion | Q4_K_M (GGUF) para transformer y text encoder; VAE en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transformer y text encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

El modelo base Wan 2.2 TI2V 5B es un transformer de difusion denso de 5B parametros que opera sobre un espacio latente comprimido por un VAE con factor de compresion espacial 16×16 y temporal 4×. Esta compresion temporal es la clave que hace viable la generacion de video en dispositivos con memoria limitada, ya que reduce drasticamente el coste de denoising y decodificacion. El text encoder es UMT5-XXL, un T5-XXL multilingue entrenado con instrucciones, que condiciona el modelo mediante prompts completos en ingles o chino.

El entrenamiento del modelo base se realizo con datos bilingues (ingles y chino) y no se han publicado detalles especificos sobre el numero de tokens o la composicion del dataset en la informacion disponible. No se menciona el uso de RLHF o DPO; el modelo se entrena mediante diffusion clasica. La innovacion principal del bundle de jc-builds es la cuantizacion Q4_K_M del transformer y del text encoder, junto con la integracion del VAE de alta compresion, lo que permite ejecutar el conjunto completo en hardware Apple con 12 GB de RAM fisica o mas.

## Capacidades

- Generacion de video texto-a-video (T2V) a partir de prompts descriptivos en ingles o chino.
- Generacion de video imagen-a-video (I2V): anima una imagen fija pasada como condicion inicial.
- Generacion de imagen estatica (texto-a-imagen) usando `frames: 1`, ya que el modelo tambien soporta ese modo.
- Soporte multilingue (ingles y chino) gracias al text encoder UMT5-XXL.
- Ejecucion completamente on-device sin conexion a servidores, mediante el motor Mirage para iOS/macOS/visionOS.
- Cuantizacion Q4_K_M que reduce el peso del transformer a 3,4 GB y el del text encoder a 3,7 GB, permitiendo su carga en dispositivos con 12 GB de RAM.
- Compatible con resoluciones practicas de 480×320 a 704×480 y 13-33 frames (regla 4n+1 por compresion temporal 4×).

## Casos de uso

- Creacion de contenido para redes sociales: un creador puede generar clips cortos de 2-5 segundos con prompts cinematograficos ("un perro corriendo por la playa al atardecer, camara lenta") directamente en su iPhone o Mac, sin depender de servicios en la nube ni de conexion a internet.
- Animacion de fotografias personales: el modo I2V permite convertir una foto estatica en un video corto con movimiento sutil (pelo al viento, ondas, nubes), ideal para recuerdos familiares o portfolios de fotografia.
- Prototipado rapido de storyboards: directores o disenadores pueden generar bocetos animados de escenas a partir de descripciones textuales para visualizar encuadres y movimientos de camara antes de la produccion real.
- Educacion y demostraciones: profesores o divulgadores pueden crear animaciones explicativas de fenomenos (por ejemplo, "una celula dividiendose, vista microscopica") sin necesidad de equipos de animacion profesionales.
- Pruebas de concepto para clientes: agencias de publicidad pueden generar videos de muestra de baja resolucion para validar ideas con clientes antes de invertir en produccion completa.
- Generacion de video offline en entornos con privacidad estricta: organizaciones que manejan datos sensibles pueden generar video localmente sin enviar prompts a servicios externos, cumpliendo requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion de rendimiento incluida en la model card es una tabla de tiempos de fase para un clip de 480×320, 13 frames, en un Apple M2 con 24 GB de RAM:

| Fase | Tiempo medido | Notas |
|---|---|---|
| Carga de pesos (frio) | ~20 s | Con mmap; recargas en caliente casi instantaneas |
| Text encode (umt5-xxl Q4, CPU) | ~45-115 s | Una vez por prompt; la primera ejecucion es la mas lenta |
| Sampling, 12-20 pasos (Metal) | ~12 s / paso | El primer paso incluye compilacion JIT de shaders |
| Decodificacion VAE, 13 frames (CPU) | ~7,5 min | Coste dominante; se recomienda tiled decode en dispositivos con poca memoria |

El tiempo total de extremo a extremo es de aproximadamente 10-15 minutos por clip de ~0,8 segundos en un M2. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el bundle completo pesa ~8,5 GB en disco, pero la memoria pico en generacion depende de la resolucion y el numero de frames. La model card recomienda al menos 12 GB de RAM fisica (comprobable con `ProcessInfo.processInfo.physicalMemory >= 12 * 1024 * 1024 * 1024`).
- GPU recomendadas: cualquier Apple Silicon (M1 o superior) con 12 GB o mas de RAM unificada. El modelo se ejecuta en Metal para el sampling y en CPU para text encoder y VAE.
- No cabe en GPUs de consumo tradicionales (NVIDIA) sin adaptacion, ya que el bundle esta orientado a Apple Silicon y al motor Mirage.
- Opciones de despliegue: motor Mirage (iOS/macOS/visionOS) y stable-diffusion.cpp (usado para las mediciones de rendimiento). No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: ~12 s por paso de sampling en Metal, con decodificacion VAE de ~7,5 min para 13 frames. El rendimiento es bajo y no apto para generacion en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion maxima | FPS | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B (base) | 5,68 B | 720P | 24 | FP16/BF16 | Apache-2.0 | HuggingFace |
| Wan2.2-TI2V-5B-iOS (este bundle) | 5,68 B | 704×480 (practico) | 16 (nativo) | Q4_K_M | Apache-2.0 | HuggingFace |
| Wan2.2-TI2V-5B-Turbo | 5,68 B | 1280×704 | 24 | FP16 | Apache-2.0 | GitHub (repo no oficial) |

El bundle iOS se diferencia del modelo base por la cuantizacion Q4_K_M y la integracion con Mirage, lo que permite ejecucion on-device a costa de una resolucion practica menor (704×480 frente a 720P) y un rendimiento mucho mas lento. El Turbo es una version destilada que genera 121 frames en 4 pasos, pero no esta cuantizada para dispositivos moviles y requiere GPU de gama alta.

## Limitaciones y advertencias

- Rendimiento muy lento: entre 10 y 15 minutos por clip de ~0,8 segundos en un M2. No apto para flujos de trabajo interactivos o produccion en volumen.
- Resolucion y duracion limitadas: el rango practico es 480×320 a 704×480 con 13-33 frames (2-5 segundos a 16 fps). No se pueden generar clips de 720P o 121 frames en este bundle.
- La cuantizacion Q4_K_M puede degradar la calidad visual en comparacion con el modelo en FP16, especialmente en detalles finos y texturas.
- Solo soporta ingles y chino; los prompts en otros idiomas pueden producir resultados suboptimos.
- Requiere al menos 12 GB de RAM fisica; dispositivos con menos memoria pueden fallar o necesitar tiled decode con degradacion adicional.
- El VAE decode en CPU es el cuello de botella principal; no se ha implementado un decodificador TAE mas rapido (aunque se menciona como mejora planificada).
- No se han publicado benchmarks formales (MMLU, etc.) porque no es un modelo de lenguaje; la evaluacion se limita a tiempos de ejecucion.
- La licencia Apache-2.0 permite uso comercial, pero el bundle depende de Mirage, cuyo repositorio (haplollc/Mirage) debe revisarse para confirmar su licencia y restricciones.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/jc-builds/Wan2.2-TI2V-5B-iOS
- Modelo base en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio de Mirage (motor on-device): https://github.com/haplollc/Mirage
- Repositorio del modelo base (GitHub): https://github.com/3Dsamples/Wan2.2-ai
- Repositorio de la version Turbo (no oficial): https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
