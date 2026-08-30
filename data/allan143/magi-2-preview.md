# Allan143/MAGI-2-preview

## Resumen

MAGI-2 Preview es un modelo de generación unificada de audio y vídeo desarrollado por Sand.ai, presentado en agosto de 2026. Con 114 mil millones de parámetros totales y una arquitectura de mezcla de expertos (MoE) que activa únicamente 6 mil millones de parámetros por token, el modelo genera clips de 10 segundos con sonido sincronizado a partir de texto, imagen o ambas. Su diseño busca explorar una vía eficiente para escalar la generación de vídeo, combinando innovaciones en arquitectura, sistema de entrenamiento y pipeline de datos.

El modelo opera en dos etapas: un primer paso (`magi2_preview`) que denoisa el clip en baja resolución y un segundo (`magi2_refiner`) que lo eleva hasta 1080p. Está pensado para entornos de producción con hardware de alta gama, requiriendo ocho GPUs NVIDIA Hopper para su ejecución. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para equipos que buscan integración en flujos de trabajo existentes.

La relevancia de MAGI-2 Preview reside en su enfoque de eficiencia paramétrica: activar solo el 5% de los parámetros por token reduce drásticamente el coste computacional frente a modelos densos de tamaño comparable. Esto lo sitúa como un candidato interesante para aplicaciones de generación de vídeo a gran escala, aunque su disponibilidad actual es limitada por los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MagiMoE (mezcla de expertos) sobre transformer de difusion (DiT) de flujo unico |
| Parametros totales | 114 mil millones |
| Parametros activos | 6 mil millones por token |
| Longitud de contexto | No aplica (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MAGI-2 Preview emplea una arquitectura de mezcla de expertos denominada MagiMoE, construida sobre un transformer de difusion (DiT) de flujo unico. El modelo procesa tanto el vídeo como el audio en un espacio latente compartido, lo que permite generar ambas modalidades de forma sincronizada sin módulos separados. La activación de solo 6 mil millones de parámetros por token reduce la carga computacional en inferencia, aunque el coste de memoria sigue siendo elevado al mantener los 114 mil millones de parámetros en memoria.

El entrenamiento se diseñó de forma conjunta entre arquitectura, sistema y datos, según el informe técnico publicado por Sand.ai. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de ajuste con retroalimentación humana (RLHF/DPO). El modelo se distribuye en dos componentes: `magi2_preview` para la generación en baja resolución y `magi2_refiner` para el escalado a 1080p, ambos incluidos en el repositorio.

## Capacidades

- Generacion de video a partir de texto (T2V) con audio sincronizado integrado en el archivo de salida.
- Generacion de video a partir de una imagen estatica mas un prompt de texto (I2V), tambien con audio.
- Salida de clips de exactamente 10 segundos de duracion, unica duracion soportada actualmente.
- Resolucion de salida hasta 1080p gracias al refinador posterior al paso inicial de denoising.
- Mezcla de audio y video en un unico archivo mediante ffmpeg, sin necesidad de postprocesado adicional.
- Arquitectura MoE eficiente que activa 6 mil millones de parametros por token, reduciendo el coste de inferencia frente a modelos densos equivalentes.
- Capacidad multimodal unificada: el modelo procesa texto, imagen, video y audio en un mismo flujo latente.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 10 segundos con sonido para plataformas como TikTok, Reels o Shorts, partiendo de un prompt descriptivo o de una imagen de referencia. La sincronizacion automatica del audio ahorra tiempo de edicion manual.
- Prototipado rapido en produccion audiovisual: directores y disenadores pueden generar storyboards animados con audio a partir de guiones o imagenes conceptuales, evaluando ritmo, encuadre y banda sonora antes de la produccion final.
- Generacion de material educativo: crear animaciones breves con narracion o efectos sonoros para explicar conceptos cientificos, historicos o tecnicos, sin necesidad de equipos de animacion profesionales.
- Publicidad y marketing: producir variantes de anuncios en video con audio para pruebas A/B, usando prompts que describan diferentes enfoques creativos o estilos visuales.
- Videojuegos y entornos virtuales: generar cinemáticas cortas o secuencias de transicion con audio para juegos independientes, reduciendo costes de produccion.
- Accesibilidad y traduccion audiovisual: a partir de una imagen y un prompt en el idioma deseado, crear videos con audio en ese idioma, facilitando la localizacion de contenido existente.
- Investigacion en generacion multimodal: servir como base para experimentos academicos sobre eficiencia en modelos MoE aplicados a video y audio, gracias a su arquitectura abierta y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial no incluye comparativas cuantitativas con otros modelos de generacion de video, ni metricas como FVD, CLIP score o evaluaciones de calidad de audio.

## Requisitos de hardware

- Se requieren 8 GPUs NVIDIA Hopper (H100 o similares) para ejecutar la inferencia, segun la documentacion oficial.
- No se especifica la VRAM individual necesaria por GPU; el tamano del repositorio (306.7 GB) sugiere que se necesita almacenamiento de alta capacidad y memoria agregada considerable.
- No es viable en GPUs de consumo (RTX 4090, etc.) debido al numero minimo de GPUs y a la arquitectura Hopper requerida.
- Opciones de despliegue: imagen Docker publicada en Docker Hub (`sandai/magi-2-preview`), que incluye todas las dependencias compiladas. Tambien se puede construir desde el codigo fuente con `pip install -r requirements.txt`.
- Se necesita `ffmpeg` en el PATH para multiplexar la pista de audio; sin el, el video se genera igualmente pero sin sonido.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos publicados que permitan una comparativa directa con otros modelos de generacion de video con audio sincronizado. La informacion disponible no incluye referencias a alternativas como Veo, Sora u otros modelos abiertos (p.ej. CogVideoX, Mochi), ni metricas comparativas. Se recomienda consultar el informe tecnico de Sand.ai para posibles comparaciones cualitativas, aunque no se han publicado en los materiales revisados.

## Limitaciones y advertencias

- Duracion fija de 10 segundos: no se pueden generar clips mas largos ni duraciones personalizadas en la version actual.
- Requisitos de hardware muy elevados: necesita 8 GPUs Hopper, lo que limita su uso a organizaciones con infraestructura de calculo avanzada o acceso a servicios en la nube especializados.
- No se documentan sesgos especificos, pero al ser un modelo generativo multimodal existe riesgo de producir contenido estereotipado o inapropiado segun los datos de entrenamiento, cuya composicion no se ha detallado.
- Riesgo de alucinacion visual y auditiva: como todo modelo de generacion, puede producir escenas o sonidos que no se corresponden con la realidad o con el prompt solicitado.
- La informacion sobre idiomas soportados no esta disponible; se asume que el prompt debe estar en ingles, aunque no se confirma.
- No se especifican limitaciones de contexto ni de resolucion intermedia; la unica resolucion de salida confirmada es 1080p tras el refinador.
- Al ser una version preview, puede haber errores no documentados o cambios en futuras versiones. La etiqueta `preview` indica que no es una version estable para produccion critica.

## Enlaces

- Repositorio HuggingFace (original): [sand-ai/MAGI-2-preview](https://huggingface.co/sand-ai/MAGI-2-preview)
- Repositorio HuggingFace (espejo, segun la informacion proporcionada): [Allan143/MAGI-2-preview](https://huggingface.co/Allan143/MAGI-2-preview)
- Repositorio GitHub: [SandAI-org/MAGI-2-preview](https://github.com/SandAI-org/MAGI-2-preview)
- Blog tecnico: [MAGI-2 Preview: Scaling Video Generation Models Efficiently](https://sand.ai/blog/magi-2-preview)
- Pagina de Sand.ai: [https://sand.ai](https://sand.ai)
- Imagen Docker: [sandai/magi-2-preview](https://hub.docker.com/r/sandai/magi-2-preview)
