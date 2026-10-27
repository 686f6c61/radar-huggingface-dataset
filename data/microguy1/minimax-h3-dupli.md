# Microguy1/MiniMax-H3-DUPLI

## Resumen

MiniMax H3 es un sistema generativo omnicanal desarrollado por MiniMax (Hailuo AI) que unifica la comprension de contextos multimodales —texto, imagen, video y audio— y genera video con audio estereo nativo sincronizado, en resoluciones de hasta 2K y duraciones de 4 a 15 segundos. La ficha que nos ocupa, `Microguy1/MiniMax-H3-DUPLI`, es un repositorio alojado en HuggingFace por el usuario Microguy1 que replica el modelo card y los pesos del repositorio oficial `MiniMaxAI/MiniMax-H3`; por el nombre ("DUPLI") y por los enlaces internos a la organizacion MiniMax, debe tratarse como una copia no oficial.

El interes tecnico del modelo esta en su diseno orientado a la generalizacion de tareas: en lugar de modelos separados para texto-a-video, imagen-a-video o video-a-audio, H3 afronta todas las combinaciones de entrada y salida con un unico sistema compuesto por tres modulos (H3-Context-IR, H3-Base y H3-Regenerate-2K). El resultado es video con pista de dialogo y audio estereo a 32 kHz generados de forma conjunta, algo que en el ecosistema abierto solo ofrecen unos pocos modelos.

El repositorio ocupa 353,9 GB en safetensors, lo que lo situa fuera del alcance de cualquier GPU de consumo en precision completa. La licencia es la "MiniMax H3 Community License Agreement", no una licencia OSI, por lo que el uso comercial requiere lectura y verificacion previa del texto legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer nativo con generacion por difusion en una sola pasada para video y audio (segun fuentes secundarias; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica como ventana de tokens; limites de entrada: hasta 12 ficheros combinados, video y audio de 2 a 15 s por clip |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | Soporte estable de dialogo en 11 idiomas: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol. Otros idiomas con cobertura variable |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community-license-agreement, license: other) |
| Formato de pesos | safetensors (repositorio de 353,9 GB); compatible con Diffusers |

Especificaciones de salida:

| Parametro | Valor |
|---|---|
| Duracion de salida | 4–15 segundos |
| Resolucion de salida | Lado corto a 768 px por defecto; 2K mediante H3-Regenerate-2K |
| Relaciones de aspecto | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 y otras |
| Frecuencia de fotogramas | 24 FPS |
| Audio de salida | Estereo a 32 kHz |
| Entrada de imagenes (FL2VA) | 0, 1 o 2 imagenes (texto-a-video, primer/ultimo fotograma, primer y ultimo fotograma) |
| Entrada de referencia (Ref2VA) | Hasta 9 imagenes, hasta 3 clips de video y hasta 3 clips de audio; maximo 12 ficheros en total |

## Arquitectura y entrenamiento

La model card describe el sistema completo como tres modulos encadenados. H3-Context-IR interpreta y refina la instruccion multimodal de entrada y la convierte en una Representacion Intermedia de Contexto que el generador entiende; el autor senala explicitamente que este modulo es critico para la calidad final y recomienda integrarlo en el pipeline o replicarlo siguiendo su guia de prompting. H3-Base genera audio y video a 768p a partir de esa representacion. H3-Regenerate-2K reinyecta el resultado de 768p junto con el contexto original para regenerar la salida a 2K, aprovechando la informacion del contexto para recuperar detalle.

Fuentes secundarias describen H3 como un transformer nativo que produce video y audio estereo 3D sincronizado en una unica pasada de difusion. La model card no publica el numero de parametros, la composicion del dataset, el volumen de tokens de entrenamiento ni si hubo etapas de RLHF o DPO; tampoco detalla mecanicas de atencion (lineal, especulativa u otras). Toda esa informacion debe considerarse no disponible a partir de la documentacion accesible.

Existen dos variantes de entrada: H3-Base-FL2VA, orientada a modos de primer y ultimo fotograma, y H3-Base-Ref2VA, orientada a referencias multimodales multiples. El repositorio incluye ademas "skills" oficiales para mejorar la redaccion de prompts, publicadas en GitHub.

## Capacidades

- Generacion de video a partir de texto, imagen, video o audio, en todas las combinaciones soportadas (texto-a-video, imagen-a-video, video-a-video, texto-a-audio-video, audio-a-audio-video, referencia-a-audio-video).
- Generacion conjunta de audio nativo: dialogo hablado y audio estereo a 32 kHz sincronizado con la imagen, no una pista anadida a posteriori.
- Comprension de instrucciones multimodales complejas: la arquitectura acepta contexto combinado de texto, hasta 9 imagenes, hasta 3 clips de video y hasta 3 clips de audio en una misma peticion.
- Control de la generacion mediante primer y ultimo fotograma, util para interpolar transiciones o continuar planos existentes.
- Salida en multiples relaciones de aspecto, incluidos formatos verticales (9:16) y panoramicos (21:9).
- Capacidad multilingue de dialogo en 11 idiomas estables, con espanol incluido.
- Escalado a 2K mediante un segundo pase de regeneracion con reinyeccion de contexto.
- Integracion con Diffusers y con la libreria propia `minimax-h3`; existen flujos de ComfyUI de terceros.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso agentico: no es un modelo de lenguaje, sino un generador multimodal.

## Casos de uso

- Produccion publicitaria de formato corto: generacion de spots de 4 a 15 segundos en 16:9 y 9:16 con voz en off y audio estereo en una sola pasada, lo que elimina la necesidad de sincronizar doblaje y video en postproduccion.
- Prototipado rapido de storyboards animados: a partir de dos fotogramas clave (inicio y fin) se obtiene la transicion completa con audio, util para presentar ideas a clientes antes de rodar.
- Localizacion de contenido audiovisual: con soporte estable de dialogo en espanol, ingles, frances, aleman y otros siete idiomas, un mismo plano puede regenerarse con dialogo en otro idioma manteniendo la coherencia visual.
- Creacion de avatares y presentadores sinteticos: el modo Ref2VA permite aportar varias imagenes de referencia de una persona o producto y hasta tres clips de audio para generar una pieza hablada coherente con la referencia.
- Contenido para redes sociales a partir de catalogo de producto: entrada de una o varias imagenes del articulo con un prompt descriptivo para producir clips verticales de 9:16 listos para publicacion.
- Generacion de material B-roll para edicion: clips de 4 a 15 segundos en 24 FPS que se insertan en una linea de tiempo existente, con audio ambiente generado de forma nativa.
- Restauracion o extension de metraje: el modo video-a-video permite reestilizar o completar planos existentes aportando el clip como referencia.
- Iteracion de alta resolucion bajo demanda: pipelines que generan primero a 768p para validar la toma y solo aplican H3-Regenerate-2K a las tomas aprobadas, optimizando coste de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye comparativas numericas con otros modelos de generacion de video (VBench, FVD, metricas de sincronizacion audio-video u otras). Cualquier cifra que circule fuera de esta documentacion no puede verificarse con los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamano del repositorio, los pesos en safetensors suman 353,9 GB, por lo que una carga en precision completa exige agregar memoria muy superior a la de cualquier GPU individual; el despliegue realista implica paralelismo multi-GPU o cuantizacion no documentada por el autor.
- GPU recomendadas: no disponible. Por volumen de pesos, el escenario plausible es un nodo con varias GPU de datacenter (A100 80 GB, H100 80 GB, H200) o servicios en la nube; no hay datos oficiales que confirmen el numero minimo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), RTX 4080 ni similares en su forma actual, dado el tamano del repositorio. No se documentan variantes cuantizadas que pudieran reducir el requisito.
- Opciones de despliegue: Diffusers (etiqueta declarada en el repositorio) y la libreria `minimax-h3`; existen flujos de ComfyUI mantenidos por terceros. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de generacion por clip, ni coste de la etapa H3-Regenerate-2K, ni comparativas de velocidad entre modos (FL2VA frente a Ref2VA).
- Almacenamiento: prever al menos 354 GB libres solo para los pesos, mas espacio para cache de modelos, salidas y el segundo pase a 2K.
- Alternativa sin infraestructura propia: la API oficial de MiniMax (platform.minimax.io / platform.minimaxi.com) y las aplicaciones Hailuo AI permiten usar H3 sin desplegarlo.

## Comparativa con modelos similares

| Modelo | Modalidad | Audio nativo sincronizado | Resolucion maxima | Licencia | Datos verificados en esta ficha |
|---|---|---|---|---|---|
| MiniMax H3 (este repositorio) | Texto/imagen/video/audio a video con audio | Si | 2K (via H3-Regenerate-2K); 768p en H3-Base | MiniMax H3 Community License (no OSI) | Si, segun model card |
| MiniMaxAI/MiniMax-H3 (repositorio oficial) | Identica | Si | Identica | Identica | Si, es el origen de esta copia |
| Otros modelos abiertos de video (familia Wan, HunyuanVideo, LTX-Video) | Texto/imagen a video | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |
| Modelos propietarios de video generativo (Veo, Sora, Kling) | Texto/imagen a video con audio variable | no disponible | no disponible | Propietaria, solo API | No se dispone de datos verificados en la informacion proporcionada |

No se han encontrado en la busqueda datos verificables de parametros, contexto o benchmarks de los competidores que permitan una comparacion cuantitativa rigurosa. La comparacion debe limitarse, por tanto, a rasgos cualitativos: H3 destaca por generar audio estereo sincronizado de forma nativa y por aceptar referencias multimodales multiples en una misma peticion.

## Limitaciones y advertencias

- Repositorio no oficial: `Microguy1/MiniMax-H3-DUPLI` es una copia subida por un tercero. La fuente canonica es `MiniMaxAI/MiniMax-H3`; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay evidencia de que el repositorio este completo o funcional.
- Licencia restrictiva: "other" con nombre `minimax-h3-community-license-agreement`. No es una licencia de codigo abierto aprobada por OSI; el uso comercial, la redistribucion y el uso de las salidas pueden estar sujetos a condiciones especificas que hay que leer en el fichero LICENSE antes de desplegar.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir artefactos anatomicos, texto ilegible en carteles, fisicas inconsistentes o desincronizacion entre labios y dialogo, especialmente en planos largos o con multiples sujetos.
- Limite de duracion: 15 segundos maximos por generacion, lo que obliga a encadenar tomas para piezas mayores y a gestionar la coherencia entre fragmentos.
- Limite de referencias en modo Ref2VA: 12 ficheros como maximo combinando imagenes, video y audio, y clips de 2 a 15 segundos cada uno.
- Cobertura linguistica desigual: solo 11 idiomas tienen soporte estable de dialogo; el resto presenta calidad variable. El audio generado no sustituye a una grabacion profesional en contextos donde la diccion es critica.
- Dependencia de H3-Context-IR: el propio autor advierte que omitir este modulo degrada notablemente la calidad del resultado; no es un modelo que rinda igual con prompts ingenuos.
- Coste de infraestructura: 353,9 GB de pesos y un segundo pase de regeneracion para 2K implican un coste de computo considerable y requisitos multi-GPU.
- Sin datos de sesgo: la model card no publica analisis de sesgos demograficos, culturales o de representacion en los datos de entrenamiento.
- Idiomas del repositorio marcados como "no disponibles" en los metadatos de HuggingFace, pese a que la model card detalla 11 idiomas de dialogo; la discrepancia sugiere metadatos incompletos.
- Huella ambiental y legal del contenido generado: la ausencia de trazabilidad sobre el dataset impide descartar similitudes con material protegido; conviene aplicar marcado de contenido sintetico.

## Enlaces

- Repositorio de esta ficha (copia no oficial): https://huggingface.co/Microguy1/MiniMax-H3-DUPLI
- Repositorio oficial del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GitHub oficial: https://github.com/MiniMax-AI/MiniMax-H3
- Skills oficiales para redaccion de prompts: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
- API global (generacion de video v2): https://platform.minimax.io/docs/api-reference/video-generation-v2-create
- API China: https://platform.minimaxi.com/docs/api-reference/video-generation-v2-create
- Documentacion de generacion de texto de la plataforma: https://platform.minimax.io/docs/guides/text-generation
- Aplicacion web global (Hailuo AI): https://hailuoai.video/tools/minimax-h3
- Aplicacion web China: https://hailuoai.com/
- Aplicacion de escritorio global: https://hub.minimax.io/
- Aplicacion de escritorio China: https://hub.minimaxi.com/
- Sitio corporativo: https://www.minimax.io
- Organizacion en ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Contacto (WeChat): https://platform.minimaxi.com/docs/faq/contact-us
- Hub de recursos de terceros con flujos ComfyUI: https://github.com/ai-models-lab/minimax-h3
- Documentacion tecnica de terceros sobre arquitectura y modos: https://deepwiki.com/ai-models-lab/minimax-h3/4.1-model-architecture-and-generation-modes
- Discusiones del repositorio: https://huggingface.co/Microguy1/MiniMax-H3-DUPLI/discussions
