# AI-KSK/ksk-video-256-comfyui-workflows

## Resumen

AI-KSK/ksk-video-256-comfyui-workflows no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a edicion de video por referencia. Lo publica el usuario AI-KSK y empaqueta nueve grafos JSON construidos sobre la pila de modelos Wan2.2 (familia de generacion de video de Alibaba), con el conjunto de herramientas que el autor denomina Bernini-R. El objetivo es resolver tareas de sustitucion de sujeto, sustitucion de fondo, video-a-video (V2V) con referencia, referencia-a-video (R2V), texto-a-video (T2V) y texto-a-imagen (T2I) dentro de un unico entorno reproducible.

El repositorio no contiene pesos propios: el tamano declarado es de 0.0 GB y el contenido anunciado es un README y los nueve JSON de grafos (de 32 a 48 nodos cada uno). Todos los grafos comparten la misma pila de modelos: Bernini HIGH/LOW en fp8, el codificador de texto umt5-xxl en fp8 y el VAE de Wan2.1. La innovacion practica esta en la orquestacion: dos `KSamplerAdvanced` a 14 pasos con CFG 1 y sampler euler/simple, divididos en dos tramos (0-10 y 10-10000), mas una pila de LoRAs de Wan2.2 (UnifiedReward rank 64, lightx2v de 4 pasos para ruido alto y bajo, y un distill cfg-step de rank 128 con escalas 3.0/1.0).

Es relevante ahora porque la edicion de video por referencia con sustitucion de sujeto y de fondo es una de las tareas mas demandadas en produccion audiovisual, y este repositorio ofrece una configuracion concreta y afinada sobre Wan2.2 que evita tener que reconstruir el pipeline desde cero. La contrapartida es que la documentacion es minima, no hay benchmarks publicados y la licencia es "other", lo que exige revisar los terminos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (workflows para la pila Wan2.2; no se especifica la arquitectura interna del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (Bernini HIGH/LOW, umt5-xxl); pesos del VAE Wan2.1 sin cuantizacion indicada |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene grafos JSON de ComfyUI, no pesos) |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento alguno: es una coleccion de grafos de inferencia para ComfyUI sobre modelos preentrenados de la familia Wan2.2. La pila declarada combina Bernini HIGH/LOW en fp8 como modelo de difusion de video, umt5-xxl en fp8 como codificador de texto y el VAE de Wan2.1 para la decodificacion latente. Sobre esa base se aplica una pila de LoRAs: UnifiedReward con rank 64, lightx2v de 4 pasos para ruido alto y bajo, y un LoRA de destilacion cfg-step de rank 128 con escalas 3.0 y 1.0.

La parte tecnica destacable es el esquema de muestreo en dos etapas: dos nodos `KSamplerAdvanced` a 14 pasos, CFG 1, sampler euler/simple, con la division de pasos en los tramos 0-10 y 10-10000. Este patron, junto con los LoRA de destilacion, busca reducir el numero de pasos necesarios y estabilizar la generacion con CFG bajo. Los grafos admiten referencias multi-imagen mediante un nodo Batch Images conectado a la entrada de imagen de referencia, y el autor recomienda construir los prompts con un nodo LLM porque el codificador de texto estandar se comporta de forma inconsistente.

## Capacidades

- Edicion de video por referencia con sustitucion de sujeto (subject swap).
- Edicion de video por referencia con sustitucion de fondo (background swap).
- Video-a-video con referencia (VRC2V y RV2V).
- Video-a-video simple (V2V) sin referencia.
- Referencia-a-video (R2V) con una o varias imagenes de referencia.
- Texto-a-video (T2V).
- Texto-a-imagen (T2I).
- Edicion de imagen (segun los enlaces publicados por el autor).
- Entrada de multiples imagenes de referencia mediante nodo Batch Images.
- Construccion de prompts asistida por un nodo LLM integrado en el grafo.
- Interfaz grafica reproducible mediante grafos JSON de ComfyUI.

## Casos de uso

- Sustitucion de sujeto en postproduccion: se introduce un video fuente y una o varias imagenes del nuevo sujeto por el nodo Batch Images, y el grafo RV2V reemplaza al sujeto manteniendo el movimiento original. Es adecuado porque el flujo esta disenado especificamente para esa tarea con referencias multiples.
- Cambio de fondo en material de archivo: el grafo de background swap permite reemplazar el entorno de un clip sin rehacer la captura, util para publicidad y contenido corporativo donde el fondo original no es valido.
- Adaptacion de campanas a multiples mercados: partiendo de un mismo video, se generan variantes con distintos sujetos o entornos usando referencias por mercado, reduciendo el coste de rodaje por region.
- Estilizado y retocado de video (V2V simple): el grafo V2V permite aplicar transformaciones globales a un clip existente, util para correccion de color estilizada o conversion de aspecto.
- Generacion de video desde texto para prototipado: el grafo T2V sirve para previsualizar ideas de planos antes de producir, aunque el autor advierte que la ruta de imagen-a-video simple es mas debil que las rutas con referencia.
- Generacion de imagenes de referencia y keyframes: el grafo T2I y el de edicion de imagen permiten crear los assets que luego alimentan las rutas R2V y de sustitucion, cerrando el ciclo dentro del mismo entorno ComfyUI.
- Reproduccion de resultados y formacion: al ser grafos JSON versionables, un equipo puede compartir exactamente la misma configuracion de nodos, LoRAs y escalas, lo que facilita la auditoria y la formacion de nuevos miembros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La pila usa Bernini HIGH/LOW en fp8, umt5-xxl en fp8 y el VAE de Wan2.1, lo que en la practica exige una GPU con memoria suficiente para cargar simultaneamente el modelo de difusion de video en fp8, el codificador de texto y el VAE; el autor no publica cifras.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: ComfyUI (formato nativo de los grafos). El autor tambien publica demos alojadas en RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline de difusion de video.
- Latencia y throughput: no disponible. Solo se conocen los hiperparametros de muestreo (14 pasos, CFG 1, euler/simple, dos tramos 0-10 y 10-10000) y los LoRA de 4 pasos, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-256-comfyui-workflows | Workflows ComfyUI sobre Wan2.2 | no disponible | no disponible | other | Hugging Face (0 descargas, 0 likes) |
| Wan2.2 (modelo base) | Modelo de generacion de video | no disponible en la informacion | no disponible | no disponible en la informacion | Referenciado como dependencia |
| Alternativas de edicion de video por referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La ruta de imagen-a-video simple es mas debil que las rutas con referencia, segun el propio autor.
- El codificador de texto es el original de Wan y se comporta de forma inconsistente; el autor recomienda usar un nodo LLM para construir los prompts.
- Las imagenes multiples fuera de la entrada de referencia pueden no aplicarse.
- El repositorio no incluye pesos: depende de modelos externos (Bernini, umt5-xxl, VAE de Wan2.1 y los LoRAs) que deben obtenerse por separado y cuyos terminos pueden diferir.
- Licencia "other": no se detallan los permisos de uso comercial; es imprescindible revisar los terminos antes de desplegar en produccion.
- Idioma documentado unicamente en ingles; no se garantiza soporte multilingue en los prompts.
- Sin benchmarks publicados, sin descargas ni likes: no hay evidencia externa de calidad o estabilidad en produccion.
- Riesgo de alucinacion visual y artefactos propios de la difusion de video, especialmente en sustituciones de sujeto con oclusiones o movimiento rapido; no cuantificado por el autor.
- La fecha de creacion indicada (2026-11-09) es posterior a la de esta ficha y debe tratarse con cautela.
- Documentacion minima: no hay guia de instalacion de dependencias ni versiones de ComfyUI o de los nodos personalizados requeridos.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-256-comfyui-workflows
- RunningHub - sustitucion de sujeto: https://www.runninghub.ai/post/2062503702258348033/?inviteCode=rh-v1111
- RunningHub - sustitucion de fondo: https://www.runninghub.ai/post/2062503708742733826/?inviteCode=rh-v1111
- RunningHub - referencia de una imagen: https://www.runninghub.ai/post/2062503688601690114/?inviteCode=rh-v1111
- RunningHub - referencia de 3 imagenes: https://www.runninghub.ai/post/2062503680565403649/?inviteCode=rh-v1111
- RunningHub - V2V: https://www.runninghub.ai/post/2062503672382320641/?inviteCode=rh-v1111
- RunningHub - texto-a-video: https://www.runninghub.ai/post/2062533464225837057/?inviteCode=rh-v1111
- RunningHub - texto-a-imagen: https://www.runninghub.ai/post/2062533470706036738/?inviteCode=rh-v1111
- RunningHub - imagen-a-video: https://www.runninghub.ai/post/2062533786738446337/?inviteCode=rh-v1111
- RunningHub - edicion de imagen: https://www.runninghub.ai/post/2062541633941495810/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=mX1OIrjj6hk
- Bilibili: https://www.bilibili.com/video/BV1yLEc6dEJc
