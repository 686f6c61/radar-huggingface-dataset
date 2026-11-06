# peih/eden5b-matrix-sf1-gray-geom

## Resumen

Eden 5B matrix-shooter 1-step student es un modelo de vídeo-a-vídeo causal y de un solo paso, desarrollado por el usuario `peih`, que transforma renders de baja poligonización (graybox) de un juego de disparos tipo matrix en imágenes con el aspecto visual final del juego. Se construye como un estudiante destilado del modelo base Wan-AI/Wan2.2-TI2V-5B, una arquitectura DiT (Diffusion Transformer) de 5.000 millones de parámetros, y está diseñado para inferencia en tiempo real en flujo continuo.

El modelo resuelve un problema concreto de producción en pipelines de renderizado: convertir la geometría cruda del motor de juego en fotogramas estilizados sin pasar por un profesor bidireccional de 40 pasos, que sería demasiado lento para streaming. Para ello emplea destilación DMD con un término adversario al estilo DMD2/One-Forcing y una inyección densa de la geometría del graybox en cada bloque del transformer, lo que preserva la separación de personajes pequeños y solapados en la distancia.

Es relevante porque demuestra que un modelo de mundo condicionado por geometría puede ejecutarse a 24 fps con latencias de 108-151 ms por fotograma latente en una GPU Blackwell, manteniendo una calidad medible (PSNR 19,79 y LPIPS 0,330 en ventanas reservadas) y una licencia Apache 2.0 que permite uso comercial. El repositorio ocupa 10,3 GB y se distribuye en formato diffusers con safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) basada en Wan 2.2 TI2V-5B, con inyeccion `GeomInject` en cada bloque |
| Parametros totales | 5.000 millones (aproximado, segun el nombre del modelo y la base Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | K/V arena de 6 fotogramas sink + 12 fotogramas recientes; clips de longitud arbitraria en flujo causal |
| Tipos de cuantizacion | bf16 (pesos del transformer); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (condicionado por embeddings de texto UMT5 de 8 prompts fijos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformer en diffusers, `geom.safetensors`, `text_embeds.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de un transformer de difusion DiT con 30 bloques, anchura 3072 y atencion cruzada hacia embeddings de texto UMT5 de dimension [512, 4096]. La entrada al patch embedding tiene 1120 canales: 48 del latente ruidoso, 1024 de caracteristicas DINO (que en este estudiante se rellenan con ceros) y 48 del latente de graybox. El latente de graybox se inyecta dos veces: concatenado en el patch embedding y mediante el modulo `GeomInject`, que proyecta el parche 2x2 del latente (192 dimensiones) a 512 con Linear+SiLU y luego a 3072 por bloque, sumandose como residual de inicializacion cero tras cada uno de los 30 bloques. Esta inyeccion densa es la que mantiene separados a personajes lejanos y solapados.

El entrenamiento consiste en destilar un profesor bidireccional de 40 pasos sobre renders graybox, usando DMD mas un termino adversario al estilo DMD2/One-Forcing con peso 0,03 y EMA 0,99. El estudiante genera un fotograma latente (4 fotogramas de video) desde ruido puro en un solo paso (sigma 1, shift 5), y su K/V se recalcula a t=0 para alimentar la arena de atencion. El codificador de graybox es TAEHV `taew2_2` (causal, ~1,4 ms por 4 fotogramas) y el decodificador es el VAE de Wan 2.2 en modo streaming. No se documentan el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Restilizacion de video graybox a los aspectos `cartoon`, `war`, `punk` y `sakura` en los mapas `paris` y `tsinghua`.
- Generacion causal de video a 960x544 y 24 fps, con un fotograma latente por paso (4 fotogramas RGB).
- Inferencia de un solo paso desde ruido puro, apta para streaming en tiempo real.
- Condicionamiento por mapa y aspecto mediante busqueda en embeddings de texto precalculados (sin codificador de texto en inferencia).
- Anclaje de estilo mediante un primer fotograma estilizado obligatorio que fija colores y pieles de personajes.
- Procesamiento de clips de longitud arbitraria (redondeada a 4k+1 fotogramas) como un unico flujo causal.
- Inyeccion de geometria por bloque que preserva la identidad y separacion de personajes pequenos.
- No soporta tool calling, agentes, vision general, audio ni razonamiento multi-paso; es exclusivamente video-a-video.

## Casos de uso

- Streaming de gameplay estilizado en tiempo real: el modelo convierte el graybox del motor en fotogramas con el look final a 108-151 ms por latente, adecuado para previsualizacion en vivo o retransmision con estilo artistico.
- Prototipado rapido de direccion de arte: permite evaluar cuatro aspectos visuales (`cartoon`, `war`, `punk`, `sakura`) sobre los mismos mapas sin recompilar shaders ni rehacer assets.
- Generacion de trailers y material promocional: clips de hasta 2 minutos (2.877 fotogramas) procesados en 54 s de condiciones mas 151 ms por latente, utiles para videos de anuncio con estetica de juego.
- Captura de referencia para artistas: el primer fotograma estilizado sirve de ancla para generar secuencias coherentes que los artistas pueden usar como guia de color y textura.
- Investigacion en modelos de mundo condicionados por geometria: la inyeccion `GeomInject` por bloque es un componente reutilizable para estudiar como la geometria cruda mejora la coherencia temporal en difusion de video.
- Demostraciones interactivas en ferias o entornos de realidad virtual: la naturaleza causal y de un paso permite alimentar el modelo fotograma a fotograma desde un motor de juego sin almacenar el clip completo.
- Evaluacion comparativa de destilacion: sirve como referencia de estudiante 1-step frente a profesores de 40 pasos, con metricas publicadas (PSNR, LPIPS, nitidez de personajes) para reproducir experimentos.

## Benchmarks y rendimiento

| Metrica | Estudiante 1-step | Profesor bidireccional 40-step |
|---|---|---|
| PSNR (16 ventanas de 81 fotogramas, 2 mapas x 4 looks) | 19,79 | 22,51 |
| LPIPS | 0,330 | 0,188 |
| Ratio de nitidez de personajes | 0,81 | 0,81 |

PSNR por clip de 2 minutos (checkpoint de 250 actualizaciones): paris cartoon 18,2; war 22,2; punk 18,6; tsinghua cartoon 19,0; war 23,4; sakura 17,5.

Rendimiento medido en RTX PRO 6000 (Blackwell) con PyTorch bf16: 81 fotogramas (21 latentes) requieren 15 s de condiciones y 108 ms por latente; 2 minutos (2.877 fotogramas, 720 latentes) requieren 54 s de condiciones y 151 ms por latente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 10,3 GB en bf16, por lo que se requiere al menos esa cantidad mas el VAE de Wan 2.2 y el codificador TAEHV.
- GPU recomendadas: RTX PRO 6000 (Blackwell) es la unica con mediciones publicadas; por tamano, se espera que quepa en A100 40 GB, H100 y RTX 4090 24 GB en bf16, aunque no hay datos confirmados.
- Cabe en GPU de consumo: probablemente en RTX 4090 24 GB y RTX 3090 24 GB, sin confirmacion del autor.
- Opciones de despliegue: script `sftrain/infer_student.py` con diffusers 0.41.0, torch, safetensors, transformers, accelerate, opencv-python-headless, pillow, av, loguru y einops; requiere el paquete `flashdreams` de Eden y el VAE `EdenLive/vae-5b/Wan2.2_VAE.pth` fuera del repositorio.
- Latencia y throughput: 108 ms por latente en clips de 81 fotogramas y 151 ms por latente en clips de 2 minutos en RTX PRO 6000; el codificador TAEHV anade ~1,4 ms por 4 fotogramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eden 5B matrix-shooter 1-step student | ~5.000 M | Arena de 6 sink + 12 recientes | Video-a-video 1-step, graybox a estilo | Apache 2.0 | Hugging Face (peih/eden5b-matrix-sf1-gray-geom) |
| Wan-AI/Wan2.2-TI2V-5B (profesor base) | ~5.000 M | no disponible | Difusion bidireccional de 40 pasos | no disponible en la informacion | Hugging Face (Wan-AI/Wan2.2-TI2V-5B) |
| Profesor bidireccional 40-step graybox | no disponible | no disponible | Destilacion bidireccional | no disponible | No distribuido en este repositorio |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, salvo las metricas del profesor citadas en la tabla de rendimiento.

## Limitaciones y advertencias

- Personajes lejanos que entran a mitad de clip conservan forma y separacion, pero sus colores de ropa pueden ser incorrectos porque el graybox no aporta color para ellos.
- La textura fina es mas suave que la del profesor bidireccional de 40 pasos.
- Entrenado exclusivamente en los mapas `paris` y `tsinghua`; no generaliza a otros mapas o juegos.
- Requiere obligatoriamente un primer fotograma estilizado de la misma vista que el fotograma de inicio del graybox; sin el, el anclaje de estilo falla.
- Solo admite 8 combinaciones fijas de (mapa, aspecto) mediante embeddings precalculados; no hay codificador de texto en inferencia.
- Depende de componentes externos no incluidos en el repositorio (VAE de Wan 2.2 y paquete `flashdreams`), lo que complica la reproducibilidad.
- Riesgo de alucinacion visual en texturas y detalles no presentes en el graybox, especialmente en zonas de oclusion.
- No se documentan sesgos demograficos ni linguisticos porque el modelo no procesa texto libre ni personas reales.
- Licencia Apache 2.0 permite uso comercial, pero el uso de componentes externos (VAE, TAEHV con licencia MIT) debe verificarse por separado.

## Enlaces

- [Hugging Face: peih/eden5b-matrix-sf1-gray-geom](https://huggingface.co/peih/eden5b-matrix-sf1-gray-geom)
- [Modelo base: Wan-AI/Wan2.2-TI2V-5B](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B)
- [TAEHV (madebyollin/taehv)](https://huggingface.co/madebyollin/taehv)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
