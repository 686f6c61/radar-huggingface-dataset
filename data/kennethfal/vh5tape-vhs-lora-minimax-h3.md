# KennethFal/vh5tape-vhs-lora-minimax-h3

## Resumen

vh5tape es un LoRA de estilo para el modelo de generación de vídeo MiniMax H3, desarrollado por KennethFal. Su objetivo es transformar el metraje generado por H3 para que parezca grabado de una emisión de televisión de los años 80 en una cinta VHS desgastada, con desenfoque, sangrado de croma, ruido de tracking y bandas de conmutación de cabezales en el borde del fotograma. Al ser H3 un modelo que entrena audio de forma conjunta, el LoRA también afecta al sonido, produciendo un audio mono apagado, silbido de cinta y fluctuación. El daño se controla mediante un "dial" de tres niveles entrenados, desde un brillo analógico suave hasta una cinta apenas reproducible. El modelo se distribuye como un único archivo safetensors de 0,2 GB y se integra en los endpoints de LoRA de H3 y H3-Max a través de servicios como fal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax-H3 |
| Parametros totales | no disponible (rank 32, 5.000 pasos de entrenamiento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (pesos en safetensors, sin cuantizacion) |
| Idiomas soportados | no disponible (el prompt se escribe en ingles, pero el modelo base H3 soporta multiples idiomas) |
| Licencia | minimax-h3-community-license (ver enlace al LICENSE en la seccion de enlaces) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo MiniMax-H3, un modelo nativo multimodal de generacion de video 2K con audio estereo 3D sincronizado. El adaptador utiliza un rango de 32 y se entrena con el trainer de LoRA de fal para H3, con un objetivo conjunto de video y audio. El conjunto de datos consiste en clips de cuatro segundos de material de emision de los años 80 (sitcoms, telenovelas, anuncios, noticiarios y cierres de emision), cada uno anotado con su contenido y una de las tres frases de nivel de daño. Se evaluaron checkpoints de 2.000 a 6.000 pasos mediante pruebas A/B ciegas; el de 5.000 pasos fue el ganador, y mas pasos reducian el efecto de daño en lugar de aumentarlo. El entrenamiento se realizo en 4:3 y la recomendacion del autor es usar resolucion 480P y relacion de aspecto 4:3 para obtener el aspecto period-correct.

## Capacidades

- Generacion de video con estetica VHS desgastada, incluyendo desenfoque, sangrado de croma, ruido de tracking y bandas de conmutacion.
- Tres niveles de daño controlables por prompt: ligero, medio y pesado, mediante frases especificas ("lightly worn VHS tape...", "worn VHS tape recording...", "badly damaged VHS tape...").
- Afecta tambien al audio generado: produce sonido mono apagado, silbido de cinta y fluctuacion, describible en el prompt (por ejemplo, "muffled mono audio").
- Soporta expansion de prompt en modo "balanced" sin perder el trigger ni las frases de daño.
- Permite ajustar la intensidad del efecto mediante el parametro scale (0.7-1.5).
- Compatible con los endpoints de LoRA de H3 y H3-Max, tanto text-to-video como image-to-video.
- Genera dialogos con citas explicitas que se reproducen casi literalmente si se indican entre comillas en el prompt.

## Casos de uso

- Creacion de cortometrajes de terror retro: el nivel de daño pesado (scale ~1.5) produce una imagen apenas estable, ideal para atmosferas perturbadoras. Se puede combinar con prompt de escena y audio desfasado para un efecto analogico autentico.
- Produccion de anuncios de epoca: el LoRA permite generar anuncios de coches usados, juguetes o productos de los 80 con estetica de cinta VHS, incluyendo jingles sintetizados y locuciones con eco, perfectos para proyectos de publicidad nostalgica.
- Videos musicales de estilo vintage: con la descripcion de audio adecuada ("cheesy synthesizer jingle", "canned laughter"), se pueden crear videoclips con aspecto de grabacion de concierto o programa musical de la decada.
- Simulacion de noticiarios locales de los 80: el modelo puede generar presentadores, platós con paneles de madera y graficos de la epoca, con el ruido de tracking y las bandas de cabezal caracteristicas.
- Contenido para redes sociales con estetica "found footage": el aspecto de cinta desgastada es muy demandado en plataformas como TikTok o Instagram para videos de misterio, nostalgia o humor.
- Integracion en flujos de postproduccion: el LoRA puede aplicarse a videos generados por H3 para darles un acabado analogico sin necesidad de plugins externos, agilizando el proceso creativo en estudios que trabajan con IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como FVD, CLIP score u otros) para este LoRA en la informacion disponible. El autor menciona una evaluacion interna mediante pruebas A/B ciegas entre checkpoints de distintos pasos, donde el de 5.000 pasos resulto ganador, pero no se proporcionan metricas cuantitativas.

## Requisitos de hardware

- El LoRA en si ocupa 0.2 GB, pero requiere el modelo base MiniMax-H3 para funcionar. H3 es un modelo de generacion de video 2K con audio, que tipicamente necesita GPUs de alta gama o acceso a servicios cloud especializados.
- No se especifican requisitos de VRAM para el LoRA, pero el modelo base H3 se ejecuta en infraestructuras como las de fal (endpoints dedicados) o en GPUs profesionales (A100, H100). No se recomienda su uso en GPUs de consumo (RTX 4090) para inferencia completa, aunque el LoRA podria probarse en entornos con cuantizacion si se adaptara.
- Opciones de despliegue: el LoRA esta disenado para usarse con la API de fal (endpoints minimax/h3/text-to-video/lora y similares). Tambien puede integrarse en flujos locales si se dispone del modelo base y la infraestructura necesaria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay una comparativa directa publicada con otros LoRAs de estilo para H3. Existen alternativas como el LoRA de realismo de personas (fal/MiniMax-H3-Realism-People-LoRA) o el LoRA Turbo (larryvrh/MiniMax-H3-Turbo-Lora), pero sus objetivos son diferentes (realismo y aceleracion, respectivamente). Este LoRA se centra exclusivamente en el estilo VHS, por lo que no es directamente comparable en rendimiento.

| Modelo | Objetivo principal | Rango / pasos | Licencia |
|---|---|---|---|
| vh5tape | Estilo VHS desgastado | rank 32, 5000 pasos | minimax-h3-community-license |
| MiniMax-H3-Realism-People-LoRA | Realismo de personas | no disponible | no disponible |
| MiniMax-H3-Turbo-Lora | Aceleracion (8 pasos) | no disponible | no disponible |

## Limitaciones y advertencias

- El LoRA esta entrenado exclusivamente con material de emision de los años 80, por lo que puede reproducir estereotipos o sesgos de esa epoca (roles de genero, representaciones raciales, etc.) en el contenido generado.
- La calidad del audio generado depende de la descripcion del prompt; si no se indica, puede haber incoherencias entre el sonido y la imagen.
- El efecto de daño puede ser demasiado intenso en niveles altos, haciendo el video dificil de ver; se recomienda ajustar el scale con cuidado.
- No se garantiza la fidelidad de los dialogos generados; aunque se sugiere que las citas explicitas se reproducen bien, puede haber errores de sincronizacion o pronunciacion.
- La licencia minimax-h3-community-license puede imponer restricciones de uso comercial; es necesario revisar el texto completo en el enlace proporcionado.
- El LoRA solo es compatible con el modelo MiniMax-H3 y sus variantes (H3-Max); no funciona con otros modelos de video.
- No se proporcionan datos de rendimiento ni benchmarks publicos, por lo que la evaluacion de calidad es subjetiva.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/KennethFal/vh5tape-vhs-lora-minimax-h3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio de MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Hub comunitario de MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
- Ejemplo de LoRA similar (realismo): https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- Ejemplo de LoRA Turbo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
