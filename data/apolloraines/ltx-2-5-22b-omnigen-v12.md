# ApolloRaines/LTX-2.5-22b-OmniGen-v12

## Resumen

ApolloRaines/LTX-2.5-22b-OmniGen-v12 es una fusión de pesos (weight merge) de la comunidad publicada por el usuario ApolloRaines sobre el modelo base Lightricks/LTX-2.5. Se trata de un modelo de generación de vídeo a partir de texto (pipeline `text-to-video`) construido sobre una arquitectura de difusión, según los tags del repositorio (`diffusion`, `ltx-video`, `video-generation`). El modelo cuenta con 21.004.025.600 parámetros (aproximadamente 21.000 millones), un tamaño inusualmente grande para la familia LTX, y se distribuye en formato GGUF con un repositorio de 18,6 GB.

La relevancia de esta ficha es doble: por un lado, documenta un merge comunitario de gran tamaño sobre un modelo de vídeo; por otro, sirve como advertencia metodológica, ya que se trata de una publicación con 0 descargas, 0 likes y acceso restringido (gated), sin información de idiomas, sin benchmarks y con fecha de creación registrada como 2026-10-06. No existe documentación técnica publicada por el autor sobre la composición del merge, los datos de entrenamiento adicionales ni las recetas de cuantización aplicadas.

Por todo ello, esta ficha recoge exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no puede confirmarse. Cualquier evaluación de calidad, coherencia temporal del vídeo o fidelidad al prompt queda pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (segun tags del repo: `diffusion`, `ltx-video`); variante concreta (DiT, UNet u otra) no disponible |
| Parametros totales | 21.004.025.600 (21,0 B) |
| Parametros activos | No aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible (no es una magnitud aplicable en el sentido de los LLM; la longitud se mide en fotogramas/segundos de video, no especificada) |
| Tipos de cuantizacion | GGUF (formato del repo); niveles concretos (Q4, Q5, Q8, etc.) no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tag del repo); los metadatos de parametros se reportan como safetensors |
| Modelo base | Lightricks/LTX-2.5 (con tag `base_model:quantized`) |
| Tamano del repositorio | 18,6 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

Los unicos indicios sobre la arquitectura proceden de los tags del repositorio: `diffusion` y `ltx-video`, ademas del pipeline declarado `text-to-video`. Esto situa al modelo dentro de la familia de modelos de difusion latente para video, en la linea de Lightricks LTX-Video, que emplea un transformer de difusion (DiT) con VAE latente y un codificador de texto como condicionamiento. El autor no ha publicado ninguna nota tecnica que confirme la variante exacta, el numero de bloques, la dimension oculta ni el scheduler utilizado.

Respecto al entrenamiento, no hay informacion disponible: se desconoce el numero de tokens o de horas de video utilizadas, la composicion del dataset, la resolucion y duracion de los clips de entrenamiento, ni si se aplicaron etapas de ajuste fino con preferencias humanas. El tag `weight-merge` indica que el modelo se ha construido combinando pesos de otros modelos (presumiblemente el base y ajustes derivados), pero se desconoce la receta de interpolacion, los coeficientes por capa y si se anadieron LoRAs o parametros adicionales. Tampoco se documenta si el resultado se re-entreno parcialmente o si es una combinacion puramente aritmetica de tensores.

## Capacidades

- Generacion de video a partir de texto (text-to-video): capacidad principal declarada por el pipeline del repositorio.
- Modelo de difusion: genera fotogramas mediante un proceso iterativo de eliminacion de ruido, no mediante decodificacion autorregresiva.
- Merge de pesos: el tag `weight-merge` sugiere que el autor ha combinado varios checkpoints, con la intencion probable de mejorar estetica, movimiento o adherencia al prompt, aunque el efecto real no esta documentado ni validado.
- Distribucion en GGUF: orientada a inferencia con memoria reducida y a integracion con herramientas de cuantizacion del ecosistema de difusion.
- Tool calling / function calling: no disponible; no es una capacidad esperada en un modelo de difusion de video.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multimodales adicionales (audio, imagen a video, control de movimiento): no disponibles; solo se declara `text-to-video`.
- Idiomas: no disponible; normalmente el idioma efectivo depende del codificador de texto asociado, que no se especifica.

## Casos de uso

- Generacion de clips cortos para prototipado creativo: el modelo puede producir video a partir de descripciones textuales, util para explorar ideas de storyboard antes de pasar a produccion con herramientas de pago. Requiere validar previamente la coherencia temporal y la resolucion de salida, no documentadas.
- Pruebas de concepto en pipelines de video generativo: dado que se distribuye en GGUF, puede integrarse en flujos locales de difusion para evaluar si un merge comunitario mejora resultados frente al modelo base, siempre con una comparacion controlada A/B.
- Aumento de material de archivo en postproduccion: generacion de planos de relleno o transiciones para montajes de bajo presupuesto, sujeto a la licencia Apache 2.0 y a la verificacion de que no existan restricciones adicionales derivadas del modelo base.
- Investigacion sobre merges de pesos: el modelo sirve como caso de estudio para analizar como la combinacion de checkpoints de difusion de video afecta a metricas como consistencia temporal, FVD o alineacion texto-video.
- Evaluacion de cuantizacion GGUF en difusion de video: permite estudiar el compromiso entre VRAM y calidad visual en un modelo de 21 B, un tamano poco habitual en esta categoria.
- Generacion de contenido para prototipos de aplicacion: maquetas de interfaces o demos interactivas que necesiten clips generados sin depender de APIs externas, ejecutando en hardware local si la cuantizacion lo permite.
- Docencia y formacion tecnica: ilustrar el ciclo completo de un merge comunitario, desde el modelo base hasta la publicacion en GGUF, incluyendo las precauciones necesarias ante repositorios sin documentacion.
- Benchmarking interno de hardware: al ser un modelo de 21 B en difusion, resulta util para medir latencias reales por fotograma en distintas GPU, aunque los tiempos concretos deberan medirse localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de FVD, CLIP score, VBench, MMLU ni ninguna otra metrica, y no hay descargas ni evaluaciones de la comunidad que permitan inferir un rendimiento comparativo fiable.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (21,0 B) y del peso teorico de cada precision, no datos medidos por el autor:

- VRAM para los pesos en BF16/FP16: aproximadamente 42 GB, mas el espacio de activaciones y latentes del proceso de difusion, lo que situa el total por encima de los 48-56 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 21 GB de pesos; con activaciones, del orden de 28-32 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 11-12 GB de pesos; con activaciones, del orden de 16-20 GB.
- El coste real depende de la resolucion, el numero de fotogramas y el numero de pasos de difusion, parametros que no estan documentados.
- GPU recomendadas para precision completa o media: A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB (esta ultima al limite).
- GPU consumer: con cuantizacion agresiva (4 bits) podria caber en RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que la resolucion y el numero de fotogramas sean moderados; no confirmado.
- Opciones de despliegue: GGUF implica herramientas del ecosistema de cuantizacion de difusion (por ejemplo ComfyUI con nodos GGUF). No aplican vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por fotograma ni de fotogramas por segundo en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ApolloRaines/LTX-2.5-22b-OmniGen-v12 | 21,0 B | No disponible | Apache 2.0 | Gated, 0 descargas | Merge comunitario sin documentacion |
| Lightricks/LTX-2.5 (modelo base) | No disponible | No disponible | No disponible en la informacion proporcionada | Referenciado como base | Fuente del merge; sus especificaciones no se detallan aqui |
| Alternativas de la misma categoria (Wan, HunyuanVideo, CogVideoX) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion rigurosa |

No es posible ofrecer una comparativa cuantitativa fiable: no hay benchmarks publicados de este merge ni especificaciones confirmadas del modelo base en la informacion disponible. Cualquier tabla que incluyera cifras de rendimiento seria inventada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, informe tecnico ni notas sobre la receta de merge, los datos de entrenamiento o la cuantizacion.
- Repositorio sin validacion social: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar el comportamiento real del modelo con experiencias de terceros.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos, lo que anade friccion a cualquier evaluacion.
- Fecha de creacion anomala (2026-10-06): conviene verificar la autenticidad y la vigencia del repositorio antes de integrarlo en cualquier flujo de trabajo.
- Riesgo de artefactos y alucinacion visual: en modelos de difusion de video, los fallos tipicos incluyen incoherencia temporal entre fotogramas, deformacion de anatomias, texto ilegible y deriva de identidad de personajes. No hay evaluaciones que cuantifiquen estos efectos en este merge.
- Licencia Apache 2.0 declarada, pero con reservas: al derivar de Lightricks/LTX-2.5, es imprescindible comprobar la licencia del modelo base, ya que puede imponer condiciones adicionales (uso comercial, atribucion o restricciones por territorio) que prevalezcan sobre la licencia declarada en el merge.
- Sin informacion sobre sesgos: se desconocen los sesgos demograficos, culturales y de representacion del dataset de entrenamiento, asi como su distribucion geografica.
- Sin soporte de idiomas declarado: no se puede garantizar el comportamiento del condicionamiento textual en castellano ni en otros idiomas.
- Idoneidad para produccion no demostrada: sin benchmarks, sin pruebas de estres y sin historial de uso, no se recomienda su despliegue en entornos productivos sin una evaluacion interna exhaustiva.
- Requisitos de memoria elevados: 21 B de parametros implican hardware de gama alta incluso en cuantizaciones agresivas, lo que limita su uso en equipos consumer.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/ApolloRaines/LTX-2.5-22b-OmniGen-v12
- Modelo base referenciado: https://huggingface.co/Lightricks/LTX-2.5
- Perfil del autor: https://huggingface.co/ApolloRaines
- Repositorio de Lightricks LTX-Video (familia a la que pertenece el modelo base): https://github.com/Lightricks/LTX-Video
- Otros enlaces (papers, blogs, demos, repos de cuantizacion): no disponibles en la informacion proporcionada.
