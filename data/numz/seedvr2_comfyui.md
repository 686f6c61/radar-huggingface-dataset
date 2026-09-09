# numz/SeedVR2_comfyUI

## Resumen

SeedVR2 es un modelo de restauracion generica de video e imagen desarrollado por ByteDance Seed, y este repositorio, mantenido por el usuario numz, ofrece una implementacion nativa para ComfyUI que permite realizar upscaling y restauracion de alta calidad. El problema que resuelve es la mejora de material visual de baja resolucion, con ruido, compresion o artefactos, tanto en video como en imagen fija. Es relevante porque aporta una integracion open source que democratiza el acceso a un modelo de difusion generativo de ultima generacion dentro del ecosistema ComfyUI, con optimizaciones de memoria y rendimiento para su uso en produccion.

La arquitectura se compone de un modelo de difusion del tipo diffusion transformer (DiT) junto con un VAE. Se apoya en los modelos base SeedVR2-3B y SeedVR2-7B de ByteDance, cuyos pesos ocupan aproximadamente 64.5 GB en el repositorio. No se especifica una longitud de contexto al tratarse de un modelo de vision/video, no de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con VAE para restauracion y upscaling de video e imagen |
| Parametros totales | SeedVR2-3B / SeedVR2-7B (segun el modelo base utilizado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision/video) |
| Tipos de cuantizacion | No disponible (se mantiene precision bfloat16 nativa) |
| Idiomas soportados | No aplica (modelo de vision/video) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |
| Tamano del repositorio | 64.5 GB |
| Libreria | diffusers |
| Pipeline | video-to-video |

## Arquitectura y entrenamiento

La arquitectura se basa en un modelo de difusion generativo que opera sobre el espacio latente del video, reconstruyendo los frames con alta fidelidad y coherencia temporal. El pipeline combina un modelo DiT con un VAE, y admite metodos de correccion de color como LAB, HSV y wavelet para transferir la informacion cromatica de la entrada. La integracion para ComfyUI divide el sistema en cuatro nodos modulares: modelo DiT, modelo VAE, configuracion de torch.compile y el upscaler principal, lo que permite un control granular del proceso.

Los datos de entrenamiento, el numero de tokens y el proceso de alineacion (RLHF/DPO) no se han publicado en la informacion disponible. La version 2.5 incluye mejoras tecnicas destacables: soporte de torch.compile para acelerar el DiT entre un 20 y un 40 por ciento y el VAE entre un 15 y un 25 por ciento, optimizaciones de memoria mediante BlockSwap con umbral adaptativo, VAE tiling con descarga de tensores, y un pipeline que elimina conversiones de tipo innecesarias manteniendo bfloat16 durante todo el proceso.

## Capacidades

- Upscaling de video e imagen de alta calidad, incluyendo restauracion generica de material degradado (ruido, compresion, desenfoque, baja resolucion).
- Soporte de canal alfa (RGBA) con upscaling guiado por bordes para transparencias limpias.
- Procesamiento por lotes de directorios completos de videos e imagenes mediante el modo CLI independiente.
- Ejecucion como CLI standalone con soporte multi-GPU y distribucion de carga con blending temporal.
- Integracion modular en ComfyUI con nodos para DiT, VAE, torch.compile y el upscaler principal.
- Generacion determinista basada en semilla, con estrategia de semilla especifica por fase.
- Metodos de correccion de color: LAB, HSV, wavelet adaptativo y hibrido.
- Capacidad para procesar videos largos sin picos de VRAM gracias a la arquitectura de streaming y BlockSwap.
- Soporte de resoluciones flexibles divisibles por 2, con padding sin perdidas en lugar de recorte restrictivo.

## Casos de uso

- Restauracion y preservacion de material de archivo: el modelo permite convertir grabaciones antiguas en VHS o DVD a resoluciones 1080p o 4K, recuperando detalles y reduciendo artefactos de compresion, lo que resulta adecuado para proyectos de digitalizacion de patrimonio.
- Post-procesado en produccion de video: tras generar clips con modelos de texto a video, el upscaler mejora la resolucion final y elimina imperfecciones, integrandose como nodo final en pipelines de ComfyUI para creadores.
- Restauracion de fotos antiguas: la entrada de imagen individual se escala directamente sin conversion intermedia, lo que permite devolver la calidad a fotografias danadas o de baja resolucion de forma automatica.
- Mejora de videos de camaras de baja calidad: videos grabados con moviles o camaras de vigilancia se procesan para aumentar el detalle y la nitidez, siendo util para aplicaciones forenses o de archivado.
- Trabajo profesional en ComfyUI: artistas y editores pueden insertar los nodos modulares en sus composiciones, ajustando el modelo DiT y VAE por separado y combinando la correccion de color LAB para obtener resultados predecibles.
- Procesamiento por lotes en servidores: el CLI independiente permite escalar carpetas enteras de videos e imagenes en entornos con multiples GPUs, con cache de modelos para evitar recargas innecesarias.
- Produccion de contenido para redes sociales: videos de baja calidad capturados en movil se mejoran rapidamente para publicacion, aprovechando la coherencia temporal para evitar parpadeos entre frames.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El changelog de la version 2.5 reporta mejoras de rendimiento internas (20-40 por ciento de aceleracion del DiT y 15-25 por ciento del VAE con torch.compile), asi como optimizaciones en las operaciones tensoriales (2-5 veces mas rapidas en transformaciones), pero no constituyen comparaciones estandar frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La arquitectura de streaming, BlockSwap y VAE tiling esta disenada para evitar picos de VRAM y permitir procesar videos de cualquier longitud, pero no se especifican requisitos minimos.
- GPU recomendadas: no disponible en los datos. Dado el tamano de los modelos base (3B y 7B), se recomienda una GPU de gama alta (por ejemplo, NVIDIA RTX 4090, A100 o H100) para un uso comodo.
- Compatibilidad: incluye soporte para AMD ROCm en Windows y Linux, con comprobacion de disponibilidad de cuDNN, y para Apple Silicon mediante el backend MPS.
- Requiere PyTorch 2.x para aprovechar torch.compile, que necesita Python 3.10 o superior.
- Opciones de despliegue: ComfyUI (como custom node), CLI standalone con soporte multi-GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos en la informacion disponible, por lo que no es posible realizar una comparacion cuantitativa directa. En la categoria de upscaling generico, el modelo se distingue por ser generativo (basado en difusion), frente a alternativas basadas en CNN como Real-ESRGAN, lo que permite una reconstruccion mas realista y coherente temporalmente, a costa de un mayor coste computacional. No hay datos de rendimiento disponibles para confirmar esta diferencia de forma objetiva.

## Limitaciones y advertencias

- La version 2.5.0 introduce cambios disruptivos: los flujos de trabajo creados con versiones anteriores deben recrearse desde cero. Es recomendable revisar el changelog antes de actualizar.
- El modelo es generativo, por lo que puede inventar detalles en zonas de la imagen muy degradadas o con informacion insuficiente, lo que implica un riesgo de alucinacion visual.
- No se han publicado evaluaciones de sesgos ni auditorias de seguridad especificas para este modelo, por lo que debe validarse su uso en aplicaciones criticas.
- El rendimiento final depende de la calidad del video de entrada y de la configuracion de los nodos (batch size, overlap temporal, resolucion maxima).
- No hay informacion sobre limitaciones de idioma, al tratarse de un modelo de vision/video.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las condiciones de la licencia en su distribucion final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/numz/SeedVR2_comfyUI
- Repositorio GitHub: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- Repositorio original de SeedVR2: https://github.com/ByteDance-Seed/SeedVR
- Tutorial en video: https://youtu.be/MBtWYXq_r60
- Pagina de issues: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/issues
- Discusiones: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler/discussions
