# meituan-longcat/LongCat-Video

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo desarrollado por Meituan LongCat, con 13.600 millones de parámetros. Unifica en un único marco las tareas de texto a vídeo, imagen a vídeo y continuación de vídeo, destacando especialmente en la generación de vídeos largos de alta calidad sin degradación de color ni pérdida de nitidez. El modelo representa el primer paso del equipo hacia los world models.

Su arquitectura se basa en un Diffusion Transformer (DiT) con Block Sparse Attention, que mejora la eficiencia especialmente a altas resoluciones. Genera vídeo a 720p y 30 fps en cuestión de minutos mediante una estrategia de generación de grueso a fino en los ejes temporal y espacial. El entrenamiento incorpora optimización por política relativa de grupo (GRPO) con recompensas múltiples, lo que le permite alcanzar un rendimiento comparable a los principales modelos de código abierto y a soluciones comerciales recientes.

El modelo se distribuye con licencia MIT, pesa aproximadamente 83 GB en formato safetensors y está disponible para su descarga en Hugging Face. Es relevante ahora porque aborda el problema de la generación de vídeos largos coherentes, un desafío pendiente en la mayoría de los sistemas de generación de vídeo actuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con Block Sparse Attention |
| Parámetros totales | 13.600 millones (13.6B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (generación de vídeo; soporta vídeos de minutos de duración) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LongCat-Video emplea una arquitectura de Diffusion Transformer (DiT) que unifica las tareas de texto a vídeo, imagen a vídeo y continuación de vídeo en un único marco de generación. La atención es de tipo Block Sparse Attention, lo que reduce el coste computacional en resoluciones altas y en secuencias temporales largas. El modelo está preentrenado de forma nativa en tareas de continuación de vídeo, lo que le permite generar secuencias de minutos de duración sin degradación de calidad ni deriva de color.

El entrenamiento incorpora una fase de optimización por política relativa de grupo (GRPO) con recompensas múltiples, que evalúa simultáneamente distintos aspectos de la calidad del vídeo generado. El sistema de inferencia utiliza una estrategia de generación de grueso a fino tanto en el eje temporal como en el espacial, lo que permite producir vídeo a 720p y 30 fps en cuestión de minutos. La implementación soporta FlashAttention-2 por defecto, con opciones para FlashAttention-3 y xformers, así como paralelismo de contexto para inferencia multi-GPU.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video): el modelo produce vídeos completos a partir de descripciones textuales.
- Generación de vídeo a partir de imagen (image-to-video): acepta una imagen inicial y genera una secuencia de vídeo coherente con ella.
- Continuación de vídeo (video-continuation): extiende vídeos existentes de forma coherente, sin degradación de calidad ni deriva de color.
- Generación de vídeo largo: produce secuencias de minutos de duración a 720p y 30 fps.
- Generación de vídeo interactiva: soporta un modo interactivo para iterar sobre la generación en tiempo real.
- Generación de vídeo con estrategia de grueso a fino: mejora la eficiencia computacional y la calidad del resultado final.
- Soporte multilingüe: entiende instrucciones en inglés y chino.

## Casos de uso

- Preproducción cinematográfica: los equipos de dirección pueden generar storyboards animados y secuencias de prueba a partir de guiones, lo que permite visualizar escenas antes del rodaje real. El modelo es adecuado porque soporta continuación de vídeo, lo que facilita iterar sobre una toma inicial.
- Creación de contenido para redes sociales: creadores de vídeos cortos pueden producir clips de calidad 720p a 30 fps sin necesidad de equipos de grabación, usando solo prompts de texto o imágenes de referencia.
- Publicidad y marketing: las agencias pueden generar vídeos promocionales de productos a partir de fotografías del producto, utilizando la capacidad image-to-video para animar imágenes estáticas.
- Educación y formación: generación de vídeos didácticos explicativos a partir de guiones de texto, con la posibilidad de continuar y extender vídeos existentes para mantener la coherencia de la serie de lecciones.
- Videojuegos y entretenimiento interactivo: creación de cinemáticas y vídeos de contexto para juegos, aprovechando el modo interactivo de generación para iterar sobre el contenido en tiempo real.
- Prototipado de efectos visuales: los equipos de VFX pueden generar vídeos de referencia para planificar efectos especiales complejos, usando la continuación de vídeo para extender tomas existentes.
- Automatización de vídeo corporativo: generación de vídeos de formación, informes visuales o comunicaciones internas a partir de guiones de texto, con capacidad de generar vídeos largos de varios minutos sin cortes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación del modelo indica que se realizaron evaluaciones exhaustivas en benchmarks internos y públicos, y que el rendimiento es comparable a los principales modelos de generación de vídeo de código abierto y a soluciones comerciales recientes, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- El tamaño del repositorio es de aproximadamente 83,3 GB, lo que indica que el modelo completo requiere un espacio de almacenamiento considerable.
- Inferencia en una sola GPU: el repositorio incluye scripts de ejecución para inferencia con una sola GPU, aunque no se especifican los requisitos mínimos de VRAM.
- Inferencia multi-GPU: soporta paralelismo de contexto con `--nproc_per_node=2` y `--context_parallel_size=2`, lo que permite distribuir la carga entre dos o más GPU.
- Se recomienda el uso de GPU con soporte para FlashAttention-2 o FlashAttention-3, así como CUDA 12.4 o superior (se instala torch 2.6.0+cu124).
- Opciones de despliegue: el modelo se distribuye con scripts de demo para texto a vídeo, imagen a vídeo, continuación de vídeo, vídeo largo, vídeo interactivo y una interfaz Streamlit.
- El uso de `torch.compile` (`--enable_compile`) está disponible para optimizar la inferencia.

## Comparativa con modelos similares

No se dispone de datos concretos de comparación con modelos alternativos de generación de vídeo en la información proporcionada. El modelo se presenta como comparable a los principales modelos de código abierto y a soluciones comerciales recientes, pero no se enumeran modelos específicos ni se aportan cifras de comparación. Los parámetros comparables podrían incluir modelos como Open-Sora, CogVideo o Wan, pero no se dispone de datos verificados para una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo está preentrenado principalmente en inglés y chino; el rendimiento en otros idiomas no está documentado.
- No se proporciona información sobre sesgos conocidos ni sobre los riesgos de alucinación visual o de contenido en los vídeos generados.
- La licencia MIT permite el uso comercial sin restricciones, pero es recomendable revisar los términos de uso de las plataformas de despliegue.
- El tamaño del modelo (83 GB) y la resolución de salida (720p) implican requisitos de hardware elevados que pueden no ser accesibles para todos los usuarios.
- No se documentan los tiempos de generación exactos para distintos tipos de hardware, por lo que la latencia puede variar significativamente según la GPU utilizada.
- La información sobre cuantización no está disponible, lo que limita las opciones de despliegue en hardware con poca VRAM.

## Enlaces

- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Repositorio de Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Video
- Paper en Hugging Face: https://huggingface.co/papers/2510.22200
- Repositorio de GitHub: https://github.com/meituan-longcat/LongCat-Video
- Sitio web del producto: https://longcat.run/
- Página de documentación del modelo: https://www.longcatai.org/models/video
