# coolthor/MiniMax-H3-pruned-NVFP4

## Resumen

MiniMax-H3-pruned-NVFP4 es una version cuantizada y podada del modelo MiniMax-H3 de MiniMaxAI, publicada por el usuario coolthor en HuggingFace. Se distribuye como un unico fichero de difusion (formato "diffusion-single-file") pensado para cargarse directamente en ComfyUI, con pesos en NVFP4, el formato de coma flotante de 4 bits introducido por NVIDIA para su arquitectura Blackwell. El modelo base es multimodal en el sentido de que acepta texto e imagen como entrada y produce video; la etiqueta "text-to-audio-video" sugiere ademas generacion conjunta de audio, aunque la informacion disponible no lo confirma con detalle.

El repositorio tiene 50,5 GB de tamano, 2.349 descargas y 22 "likes" en el momento de la consulta, con acceso restringido: es necesario aceptar las condiciones de la licencia en HuggingFace para poder descargarlo. La licencia aplicable es la minimax-h3-community-license-agreement, una licencia de comunidad propia de MiniMax y no una licencia de codigo abierto estandar, lo que condiciona el uso comercial.

La relevancia de esta ficha es practica: no es un modelo nuevo de lenguaje ni un LLM con ventana de contexto, sino un artefacto de inferencia optimizado para hardware Blackwell que permite ejecutar generacion de video de MiniMax-H3 con un consumo de VRAM muy inferior al de los pesos originales. Para desarrolladores e investigadores, el interes esta en evaluar si la perdida de calidad por la cuantizacion a FP4 y el podado compensa la ganancia en requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (pipeline image-text-to-video). Detalles internos (tipo de backbone, VAE, codificador de texto): no disponibles |
| Parametros totales | no disponible (el repositorio pesa 50,5 GB en pesos NVFP4) |
| Parametros activos | no disponible (no se ha confirmado que el modelo base sea MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo autorregresivo de texto) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA); variante "pruned" (podada). No se documentan otros niveles de cuantizacion |
| Idiomas soportados | no disponible (dependera del codificador de texto del modelo base, no especificado) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other" en HuggingFace); acceso restringido con aceptacion previa |
| Formato de pesos | Fichero unico de difusion para ComfyUI, pesos NVFP4. Extension concreta del fichero: no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base MiniMax-H3 en los datos proporcionados: se desconoce si emplea un transformer de difusion (DiT), un UNet o una arquitectura hibrida, asi como el tipo de VAE de video, el codificador de texto o el mecanismo de condicionamiento de audio. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO, conceptos que en cualquier caso aplican de forma distinta en modelos generativos de video frente a LLM.

Lo que si se puede afirmar a partir de la informacion disponible es la naturaleza del artefacto publicado: se trata de una conversion de los pesos originales a NVFP4 combinada con un podado ("pruned"), empaquetada en un unico fichero compatible con ComfyUI. El NVFP4 es un formato de 4 bits con bloque de escala de grano fino disenado especificamente para los tensor cores de las GPU NVIDIA Blackwell, lo que explica la etiqueta "blackwell" del repositorio. La innovacion tecnica, por tanto, no esta en el modelo sino en la optimizacion del despliegue: reducir el peso de los pesos para que la generacion de video quepa en GPU de gama profesional y de consumo recientes. No se documentan en la informacion disponible detalles sobre el proceso de podado (criterio, porcentaje de canales o capas eliminadas) ni sobre la perdida de calidad resultante.

## Capacidades

- Generacion de video a partir de texto (text-to-video): el pipeline declarado en HuggingFace es image-text-to-video, con etiqueta explicita text-to-video.
- Generacion de video a partir de una imagen de referencia (image-to-video), util para animar fotos, ilustraciones o fotogramas clave.
- Generacion conjunta de video y audio (text-to-audio-video), segun la etiqueta del repositorio; el alcance exacto (audio sincronizado, voz, efectos) no esta documentado en la informacion disponible.
- Ejecucion local en ComfyUI mediante un unico fichero de pesos, sin necesidad de cargar un pipeline completo por componentes.
- Inferencia en precision FP4 sobre hardware NVIDIA Blackwell.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso o modo "thinking": no aplica y no disponible, al no ser un modelo de lenguaje.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Animacion de imagenes de producto para e-commerce: a partir de una fotografia fija, el modelo genera un plano de video corto con movimiento, lo que permite producir variantes de anuncio sin rodaje. El formato image-to-video es exactamente el modo de entrada para el que esta etiquetado el repositorio.
- Previsualizacion de storyboards en produccion audiovisual: equipos de direccion pueden convertir bocetos o fotogramas en clips animados para validar ritmo y encuadre antes de rodar, usando ComfyUI como interfaz de iteracion rapida.
- Prototipado publicitario con audio integrado: la etiqueta text-to-audio-video sugiere que el modelo puede generar simultaneamente imagen y sonido, lo que simplifica la creacion de maquetas de spots sin montaje posterior en otra herramienta.
- Generacion de material de archivo sintetico: creacion de clips de recurso (fondos, transiciones, planos de ambiente) para proyectos que no pueden costear banco de imagenes o rodaje propio.
- Aumentacion de datos para entrenamiento de modelos de vision: generar variaciones de video a partir de imagenes etiquetadas para ampliar datasets de deteccion, segmentacion o seguimiento, siempre que la licencia lo permita.
- VFX y concept art: animar fotogramas clave de un artista para explorar direcciones visuales, aprovechando que un solo fichero de pesos se carga en ComfyUI sin gestionar multiples componentes.
- Despliegue por lotes en infraestructura Blackwell: en un servidor con GPU Blackwell, la cuantizacion NVFP4 reduce el coste por clip y permite encolar generaciones en paralelo con mayor densidad de trabajos por GPU.
- Industria del fitness y gimnasios: el modelo puede generar videos promocionales de rutinas, instalaciones o testimonios a partir de fotografias de las salas y textos de campana, un caso relevante si se tiene en cuenta que buena parte de la busqueda web asociada a "academia" apunta al sector del fitness y no al termino academico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos tratan sobre el mercado de gimnasios y academias de fitness en Brasil y no guardan ninguna relacion con MiniMax-H3 ni con la cuantizacion NVFP4. Por tanto, no existen datos verificables de FVD, CLIP score, IS, evaluacion humana ni comparativas de calidad frente a los pesos originales, ni cifras de throughput o latencia.

## Requisitos de hardware

- El formato NVFP4 requiere GPU NVIDIA con soporte de FP4 de cuarta generacion, es decir, arquitectura Blackwell: gama RTX 50 (por ejemplo RTX 5090, RTX 5080), RTX PRO 6000 Blackwell y aceleradores de centro de datos B100/B200. La etiqueta "blackwell" del repositorio lo indica explicitamente.
- VRAM estimada: no publicada por el autor. Como referencia orientativa, el repositorio completo ocupa 50,5 GB, de modo que una carga integra de los pesos requeriria un ordenador con al menos esa cantidad de memoria de GPU, mas el espacio adicional para activaciones, VAE y latents de video. Esta cifra es una estimacion derivada del tamano del repositorio, no un requisito declarado.
- Compatibilidad con GPU de consumo: previsiblemente limitada. Incluso la RTX 5090 (32 GB) queda por debajo del tamano del repositorio, por lo que seria necesario el uso de offloading a memoria del sistema, tecnicas de descarga por capas o variantes mas agresivamente podadas. No se documenta en la informacion disponible que el modelo quepa en una GPU de consumo sin estas estrategias.
- Opciones de despliegue: ComfyUI es el destino declarado (etiqueta "comfyui" y formato de fichero unico de difusion). No se mencionan vLLM, TGI, llama.cpp ni Ollama, que ademas no son aplicables a un modelo de difusion de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables de modelos alternativos de generacion de video (parametros, contexto, rendimiento, licencia o disponibilidad) y la busqueda web no devolvio resultados pertinentes. No se pueden establecer comparaciones con la version sin cuantizar de MiniMax-H3 ni con otros modelos de video sin inventar cifras.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es "gated". Es obligatorio aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que impide la distribucion automatica en pipelines de CI o la descarga anonima.
- Licencia no estandar: la minimax-h3-community-license-agreement es una licencia de comunidad propia del fabricante, no una licencia de codigo abierto reconocida. Hay que revisar sus clausulas antes de cualquier uso comercial, y en HuggingFace aparece clasificada como "other".
- Cuantizacion a 4 bits y podado: ambas tecnicas degradan la fidelidad de los pesos. Es esperable una perdida de calidad frente al modelo original, aunque no se han publicado metricas que la cuantifiquen. No se documenta el criterio de podado aplicado.
- Dependencia de hardware: sin GPU Blackwell no se puede aprovechar el formato NVFP4. En generaciones anteriores, los pesos deberian convertirse o de-cuantizarse, con el coste de rendimiento correspondiente.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de video, puede producir incoherencias temporales, deformaciones anatomicas y objetos que aparecen o desaparecen entre fotogramas. No hay datos publicados sobre la incidencia en esta version cuantizada.
- Sesgos: no documentados en la informacion disponible. Los sesgos del modelo base en cuanto a representacion de personas, culturas y escenas se heredan y pueden verse alterados por la cuantizacion.
- Idioma: los idiomas soportados no estan declarados, por lo que no se puede garantizar un comportamiento correcto con prompts en castellano.
- Trazabilidad: el autor del repositorio es un tercero (coolthor) que cuantiza y publica, no el desarrollador original. Esto implica que la conversion no esta respaldada oficialmente por MiniMaxAI y que su mantenimiento futuro no esta garantizado.
- Uso de la version "pruned" frente a la completa: no se especifica que se ha eliminado, por lo que ciertas capacidades del modelo base podrian no estar presentes.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/coolthor/MiniMax-H3-pruned-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Resultados de la busqueda web: no se encontro ningun enlace relevante al modelo. Los resultados obtenidos trataban sobre el mercado de academias y fitness en Brasil (sebraepr.com.br, blog.sistemapacto.com.br, brainly.com.br, guiadasprofissoes.com.br, tuiuti.edu.br) y no se incluyen por no ser pertinentes.
