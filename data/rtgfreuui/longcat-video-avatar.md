# rtgfreuui/LongCat-Video-Avatar

## Resumen

LongCat-Video-Avatar es un modelo unificado de generación de vídeo impulsado por audio, desarrollado por el equipo LongCat de Meituan. Su objetivo es producir animaciones de personajes expresivas y altamente dinámicas, con sincronización labial realista y preservación de la identidad del hablante. El modelo soporta de forma nativa tres tareas: generación de vídeo a partir de audio y texto (AT2V), generación a partir de audio, texto e imagen (ATI2V) y continuación de vídeo, con compatibilidad tanto para audio de un solo flujo como para audio multi-flujo.

El modelo se presenta como una solución integral para la creación de avatares hablantes, abordando problemas habituales como la acumulación de errores del VAE en secuencias largas, la fuga de información de la imagen condicionante y la falta de naturalidad en los movimientos. Para ello incorpora innovaciones técnicas como el *disentangled unconditional guidance*, la *reference skip attention* y el *cross-chunk latent stitching*. El repositorio de pesos ocupa 128.6 GB, lo que sugiere un modelo de gran tamaño, aunque no se especifican los parámetros totales ni la arquitectura detallada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información disponible, pero por las dependencias y la librería utilizada (diffusers, transformers) se trata de un modelo de difusión para generación de vídeo. Emplea un VAE para la compresión latente y atención con FlashAttention-2 por defecto, con soporte para FlashAttention-3 o xformers una vez instalados. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni la composición del dataset, ni se menciona el uso de RLHF o DPO.

El modelo incorpora tres innovaciones técnicas destacadas. El *disentangled unconditional guidance* desacopla las señales de habla de las dinámicas de movimiento para conseguir un comportamiento humano más natural. La *reference skip attention* introduce señales de referencia de forma estratégica para preservar la identidad del personaje y evitar la fuga excesiva de la imagen condicionante. Por último, el *cross-chunk latent stitching* elimina ciclos redundantes de decodificación-codificación del VAE, reduciendo la degradación de píxeles en secuencias largas.

## Capacidades

- Generación de vídeo a partir de audio y texto (AT2V).
- Generación de vídeo a partir de audio, texto e imagen (ATI2V).
- Continuación de vídeo a partir de audio, permitiendo extender secuencias existentes.
- Compatibilidad con audio de un solo flujo y audio multi-flujo.
- Sincronización labial realista y dinámicas humanas naturales.
- Preservación de la identidad del personaje a lo largo de la secuencia.
- Generación de vídeos largos con reducción de artefactos gracias al *cross-chunk latent stitching*.
- Idiomas soportados: inglés y chino.

## Casos de uso

- Creación de avatares para vídeos corporativos: se puede generar un presentador virtual a partir de un guion de texto y un audio, obteniendo un vídeo con sincronización labial y movimientos naturales, ideal para comunicaciones internas o externas.
- Doblaje y localización de contenido audiovisual: dado un vídeo existente con un hablante y un audio en otro idioma, el modelo puede continuar el vídeo con el nuevo audio manteniendo la identidad facial y ajustando los labios, lo que facilita la localización de series, documentales o cursos.
- Contenido para redes sociales: generar vídeos de personas hablando para plataformas como TikTok o YouTube, con un avatar personalizado que sigue el audio y las indicaciones textuales, reduciendo el coste de producción.
- Educación en línea: crear lecciones en vídeo con un avatar que explica conceptos a partir de un guion y una imagen de referencia, ofreciendo una experiencia de aprendizaje más atractiva y escalable.
- Asistentes virtuales con presencia visual: integrar el modelo en sistemas de atención al cliente para generar respuestas habladas con un avatar, combinando la generación de audio y vídeo en tiempo real o por lotes.
- Entretenimiento y juegos: generar personajes animados que hablan con sincronización labial, pudiendo utilizarse en cinemáticas de juegos, animaciones cortas o contenidos interactivos.
- Publicidad y marketing: producir anuncios con presentadores virtuales personalizados, adaptando el mensaje y el tono mediante el audio y las instrucciones textuales, sin necesidad de grabar a actores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo fue evaluado mediante evaluación humana en el benchmark EvalTalker, que contiene más de 400 muestras de prueba para evaluar la generación de vídeo de humanos individuales y múltiples, pero no se proporcionan puntuaciones numéricas en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El repositorio de pesos ocupa 128.6 GB, lo que implica un almacenamiento considerable y probablemente la necesidad de varias GPU de alto rendimiento, aunque no se especifica el modelo exacto.
- Opciones de despliegue: el modelo se distribuye como librería diffusers y transformers, con soporte para ONNX. Se recomienda FlashAttention-2 (activado por defecto), FlashAttention-3 o xformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- Solo se declara soporte para inglés y chino (en, zh); no se especifica compatibilidad con otros idiomas.
- No se proporcionan datos sobre sesgos conocidos ni sobre el riesgo de alucinación, aunque al tratarse de generación de vídeo pueden aparecer artefactos visuales o desincronizaciones labiales en ciertas condiciones.
- El repositorio de HuggingFace indicado (rtgfreuui/LongCat-Video-Avatar) tiene 0 descargas y 0 likes, y su fecha de creación es futura; el repositorio oficial es meituan-longcat/LongCat-Video-Avatar.
- La licencia MIT permite el uso comercial, pero es necesario revisar las licencias de las dependencias y de los pesos del modelo antes de su uso en producción.
- No se dispone de información sobre requisitos de hardware, latencia ni throughput, lo que dificulta la planificación de despliegues en entornos de producción.

## Enlaces

- HuggingFace oficial: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar
- HuggingFace del repositorio indicado: https://huggingface.co/rtgfreuui/LongCat-Video-Avatar
- Página del proyecto: https://meigen-ai.github.io/LongCat-Video-Avatar/
- Repositorio de GitHub: https://github.com/meituan-longcat/LongCat-Video
- Informe técnico: https://github.com/meituan-longcat/LongCat-Video/blob/main/assets/LongCat-Video-Avatar-Tech-Report.pdf
- Referencia de EvalTalker: https://arxiv.org/abs/2512.01340
