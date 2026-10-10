# Jinstudio/HiDream-O1-Image-Dev

## Resumen

HiDream-O1-Image-Dev es un modelo generativo de imagen de la familia HiDream-O1-Image, publicado en HuggingFace bajo el repositorio `Jinstudio/HiDream-O1-Image-Dev`. La model card asocia el desarrollo al proyecto HiDream-ai. Se trata de la variante destilada (Dev) del modelo base de 8B, reduciendo los pasos de inferencia de 50 a 28, lo que rebaja el coste computacional manteniendo la calidad de generación.

El modelo se construye sobre un Pixel-level Unified Transformer (UiT) que prescinde de VAEs externos y de codificadores de texto separados: codifica píxeles crudos, texto y condiciones específicas de tarea en un único espacio de tokens compartido. Con aproximadamente 8.800 millones de parámetros (8.804.887.792 según los pesos en safetensors), cubre en una sola arquitectura generación texto-a-imagen, edición por instrucciones, renderizado de texto largo, personalización guiada por sujeto y generación de storyboards, con resolución nativa de hasta 2.048 × 2.048.

Es relevante porque propone un enfoque unificado end-to-end frente a los pipelines clásicos de difusión con VAE y text encoder disjuntos, y porque su variante Dev-2604 alcanzó el puesto 8 en el Text to Image Arena de Artificial Analysis según la propia model card. El repositorio es de tipo `image-text-to-image` y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT) sin VAE externo; tag de arquitectura `qwen3_vl` |
| Parametros totales | 8.804.887.792 (~8,8B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona renderizado de texto multilinguie sin detallar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como un Pixel-level Unified Transformer (UiT): un transformer unico que opera directamente sobre pixeles crudos, texto y condiciones de tarea en un mismo espacio de tokens, eliminando el VAE y los codificadores de texto disjuntos que caracterizan a los pipelines de difusion convencionales. El tag `qwen3_vl` en el repositorio indica que el componente de comprension multimodal se apoya en la familia Qwen3-VL, lo que resulta coherente con un modelo etiquetado simultaneamente como `image-text-to-text` e `image-text-to-image`.

El modelo se publico junto a un informe tecnico (arXiv 2605.11061) y en dos variantes: la version completa sin destilar (50 pasos de inferencia) y la variante Dev destilada (28 pasos), a la que corresponde este repositorio. La model card menciona tambien un Prompt Agent basado en razonamiento que resuelve conocimiento implicito, disposicion y renderizado de texto antes de la generacion, y actualizaciones posteriores (Dev-2604) con un refinador de prompts especifico. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion texto-a-imagen nativa a resoluciones de hasta 2.048 × 2.048.
- Edicion de imagen por instrucciones en lenguaje natural.
- Renderizado de texto largo y control de disposicion (layout) multirregion y multilinguie con texto preciso.
- Personalizacion guiada por sujeto (subject-driven personalization), preservando identidad o IP a traves de nuevas escenas.
- Generacion de storyboards en la misma arquitectura.
- Condicionamiento por layout y esqueleto (skeleton) en el pipeline IP, segun las actualizaciones de mayo de 2026.
- Prompt Agent integrado orientado a razonamiento que resuelve conocimiento implicito y planificacion de composicion antes de generar.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) e integracion con la libreria `transformers`.

## Casos de uso

- Generacion de imagenes para marketing y publicidad: produccion de creatividades a 2.048 × 2.048 con control de disposicion, adecuado cuando se requiere incluir textos largos y precisos en la propia imagen.
- Edicion de imagenes en produccion editorial: retoque por instrucciones en lenguaje natural sin reentrenamiento, util para iterar sobre material ya existente.
- Personalizacion de marca: subject-driven personalization para mantener la identidad visual de un producto o personaje a lo largo de multiples escenas y campanas.
- Storyboarding para audiovisual: generacion de secuencias de viñetas coherentes en una sola arquitectura, agilizando la preproduccion.
- Generacion de carteles y material grafico con texto multilinguie: el renderizado de texto largo permite producir piezas con tipografia integrada sin postproceso.
- Asistentes creativos integrados en producto: al ser compatible con endpoints y la libreria `transformers`, puede desplegarse como servicio de generacion de imagen detras de una aplicacion.
- Creacion de prototipos y diseno de producto: variaciones controladas por layout o esqueleto para explorar composiciones antes de la produccion final.

## Benchmarks y rendimiento

La model card incluye resultados en cinco suites de evaluacion. De la informacion recuperada solo se ha podido extraer de forma completa la tabla de GenEval (generacion composicional); el resto de suites aparecen truncadas y no se reproducen.

| Modelo | #Params | Single-Obj | Two-Obj | Count | Color | Position | Attr | Overall |
|---|---|---|---|---|---|---|---|---|
| Nano Banana 2.0 | – | 1,00 | 0,96 | 0,71 | 0,84 | 0,86 | 0,65 | 0,83 |
| Seedream-4.0 | – | 1,00 | 0,92 | 0,71 | 0,93 | 0,78 | 0,68 | 0,84 |
| GPT Image 1 [High] | – | 0,99 | 0,92 | 0,85 | 0,92 | 0,75 | 0,61 | 0,84 |
| GPT Image 2 | – | 0,99 | 0,98 | 0,85 | 0,93 | 0,85 | 0,77 | 0,89 |
| PixArt | 4,3B + 0,6B | 0,98 | 0,50 | 0,44 | 0,80 | 0,08 | 0,07 | 0,48 |
| Show-o | 1,3B | 0,95 | 0,52 | 0,49 | 0,82 | 0,11 | 0,20 (truncado) | — |

La model card afirma que HiDream-O1-Image-Dev-2604 alcanzo el puesto 8 en el Text to Image Arena de Artificial Analysis, sin que se disponga de la puntuacion numerica asociada. No se han podido recuperar en la informacion disponible los resultados del propio HiDream-O1-Image en GenEval ni en el resto de suites.

## Requisitos de hardware

- Tamano del repositorio: 35,2 GB, coherente con pesos almacenados en mas de una precision o en formato sin comprimir (en FP32, 8,8B parametros ocupan aproximadamente 35,2 GB).
- VRAM estimada en BF16/FP16: en torno a 17,6 GB solo para pesos, mas activaciones asociadas a la generacion a alta resolucion.
- VRAM estimada en FP32: aproximadamente 35,2 GB.
- GPUs recomendadas: A100 40/80 GB y H100 para produccion y resolucion maxima; RTX 4090 o RTX 3090 (24 GB) para BF16 en entorno de consumidor con margen ajustado; RTX 4080 (16 GB) requiere cuantizacion no documentada.
- Cabe en GPU de consumidor: previsiblemente en RTX 4090 y RTX 3090 en BF16, siempre que la memoria de activaciones a 2.048 × 2.048 lo permita; no confirmado por el autor.
- Opciones de despliegue: libreria `transformers`, scripts `inference.py` y `app.py` del repositorio oficial, y despliegue como endpoint de inferencia (`endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La unica referencia es el numero de pasos de inferencia (28 en la variante Dev frente a 50 en la version completa).
- Nota del autor: se desaconseja PyTorch 2.9.x por un problema conocido en el repositorio de Qwen3-VL.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiDream-O1-Image-Dev | ~8,8B | UiT unificado (texto-a-imagen y edicion) | no disponible | MIT | HuggingFace |
| PixArt | 4,3B + 0,6B | Difusion con VAE y text encoder (GenEval overall 0,48) | no disponible | no disponible | HuggingFace |
| Show-o | 1,3B | Modelo unificado multimodal (GenEval overall parcial) | no disponible | no disponible | HuggingFace |
| GPT Image 2 | no disponible | Propietario, cerrado (GenEval overall 0,89) | no disponible | propietaria | API |
| Seedream-4.0 | no disponible | Propietario (GenEval overall 0,84) | no disponible | propietaria | API |

La comparativa con alternativas de pesos abiertos del mismo orden de tamano no puede completarse con los datos disponibles; no se han facilitado cifras de HiDream-O1-Image en GenEval que permitan una confrontacion directa con PixArt o Show-o.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion visual y de fidelidad limitada en prompts muy densos o composiciones con muchos objetos; las propias tablas de GenEval muestran caidas acusadas en categorias como conteo o atributos en modelos comparables.
- No se especifica la longitud de contexto soportada ni los idiomas cubiertos, pese a que se menciona renderizado de texto multilinguie.
- La variante Dev esta destilada a 28 pasos, lo que puede implicar una ligera perdida de calidad frente a la version completa de 50 pasos; la model card recomienda usar el modelo completo para tareas de edicion.
- Licencia MIT declarada, que en principio permite uso comercial, aunque conviene verificar las condiciones de los componentes subyacentes de Qwen3-VL y del Prompt Agent, que apunta a un modelo de terceros.
- Posible ambiguedad de autoria: el repositorio esta publicado bajo la cuenta `Jinstudio`, mientras que la model card y los enlaces apuntan al proyecto HiDream-ai.
- Incompatibilidad conocida con PyTorch 2.9.x segun las notas del autor.
- El repositorio no registra descargas ni likes, por lo que no existe validacion de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jinstudio/HiDream-O1-Image-Dev
- Informe tecnico (arXiv 2605.11061): https://arxiv.org/pdf/2605.11061v1
- Repositorio oficial del proyecto: https://github.com/HiDream-ai/HiDream-O1-Image
- Modelo HiDream-O1-Image (version completa): https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Modelo HiDream-O1-Image-Dev: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Variante HiDream-O1-Image-Dev-2604: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev-2604
- Refinador de prompts: https://huggingface.co/HiDream-ai/Prompt-Refine
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
- Demo Dev en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image-Dev
- Comunidad en Discord: https://discord.gg/7ZEnPxdTQ
