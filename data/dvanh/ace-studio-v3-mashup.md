# dvanh/ace-studio-v3-mashup

## Resumen

dvanh/ace-studio-v3-mashup es un repositorio de pesos alojado en Hugging Face por el usuario dvanh, con un tamano de 0,4 GB y fechas de creacion y ultima actualizacion del 25 de septiembre de 2026. En el momento de la consulta no declara pipeline, licencia ni idiomas, y acumula 0 descargas y 0 likes. La unica documentacion disponible es una model card que reproduce integramente el README de ACE-Step 1.5, un modelo fundacional de generacion musical de codigo abierto desarrollado en torno al ecosistema ACE-Step/ACEMusic y a StepFun, por lo que la ficha debe interpretarse como una descripcion de la familia referenciada mas una advertencia explicita sobre la falta de documentacion del repositorio concreto.

ACE-Step 1.5 se presenta como un modelo de generacion musical con una arquitectura hibrida en la que un modelo de lenguaje actua como planificador (genera estructura de cancion, metadatos, letra y caption mediante cadena de pensamiento) y un Diffusion Transformer (DiT) se encarga de la sintesis de audio. La model card afirma una calidad situada entre Suno v4.5 y Suno v5, generacion de una cancion completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, ejecucion local con menos de 4 GB de VRAM en la variante base y soporte de mas de 50 idiomas para las letras. La variante XL introduce un decodificador DiT de 4000 millones de parametros.

La relevancia del repositorio es limitada por si misma: con 0,4 GB de pesos y sin ficha tecnica propia, parece un mashup o fusion parcial de pesos derivado de ACE Studio/ACE-Step, no un modelo completo. Cualquier evaluacion de produccion deberia partir del modelo original de ACE-Step y tratar este repositorio como un experimento no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para este repositorio; la model card adjunta describe una arquitectura hibrida LM (planificador) + Diffusion Transformer (DiT) para ACE-Step 1.5 |
| Parametros totales | no disponible para el repositorio; la variante ACE-Step 1.5 XL descrita emplea un decodificador DiT de 4B parametros |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; la model card indica generacion de audio de 10 s a 600 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 50+ idiomas segun la model card de ACE-Step 1.5 (letras); no declarado para el repositorio |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Etiquetas declaradas | tensorboard, safetensors, arxiv:2602.00744, region:us |

## Arquitectura y entrenamiento

La model card describe un sistema de dos etapas. En la primera, un modelo de lenguaje actua como planificador omnicapaz: transforma una consulta breve del usuario en un plano completo de cancion, escalando desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letra y caption mediante cadena de pensamiento. En la segunda, esa salida guia a un Diffusion Transformer encargado de la sintesis de audio. El alineamiento entre ambas etapas se logra, segun el autor, mediante aprendizaje por refuerzo intrinseco basado unicamente en mecanismos internos del modelo, sin modelos de recompensa externos ni preferencias humanas etiquetadas, lo que elimina el sesgo introducido por reward models.

No se proporcionan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset de audio o musica, ni detalles de fases de RLHF o DPO. Si se menciona entrenamiento de LoRA para personalizacion: la model card indica anotacion y entrenamiento en un clic desde Gradio, con 8 canciones y aproximadamente 1 hora de entrenamiento en una RTX 3090 con 12 GB de VRAM. Para el repositorio dvanh/ace-studio-v3-mashup no hay ninguna descripcion del proceso de mezcla o fusion de pesos, ni del modelo base del que procede.

## Capacidades

- Generacion de musica completa a partir de texto, con control de duracion entre 10 segundos y 600 segundos.
- Generacion por lotes de hasta 8 canciones simultaneas.
- Soporte declarado de mas de 1000 instrumentos y estilos con descripcion de timbre de grano fino.
- Letras multilingues en mas de 50 idiomas, con prompt de letra para control de estructura y estilo.
- Control de metadatos musicales: duracion, BPM, tonalidad y escala, y compas.
- Entrada de audio de referencia para guiar el estilo de generacion.
- Generacion de covers a partir de audio existente.
- Repaint y edicion: regeneracion local selectiva de fragmentos de audio.
- Separacion de pistas en stems individuales.
- Generacion multipista, equivalente a anadir capas sobre una mezcla existente.
- Vocal2BGM: generacion automatica de acompanamiento para pistas vocales.
- Comprension de audio: extraccion de BPM, tonalidad/escala, compas y caption a partir de un audio.
- Generacion automatica de LRC con marcas de tiempo de letra para la musica generada.
- Reescribimiento de consultas: el LM expande automaticamente etiquetas y letras.
- Evaluacion automatica de calidad del audio generado.
- Entrenamiento de LoRA para personalizacion de estilo con pocas canciones.
- No se documenta soporte de tool calling, function calling ni uso agentico multi-paso; tampoco vision ni audio de entrada mas alla del audio de referencia.

## Casos de uso

- Produccion musical asistida y generacion de demos: el modelo puede producir una cancion completa a partir de una descripcion breve en menos de 2 segundos sobre A100 y menos de 10 segundos sobre RTX 3090, lo que permite iterar sobre decenas de variantes en una sesion de estudio sin cambiar de herramienta.
- Personalizacion de estilo con LoRA: con 8 canciones propias y aproximadamente 1 hora de entrenamiento en una RTX 3090 de 12 GB, un artista puede capturar su estilo y generar material nuevo coherente con su catalogo sin reentrenar el modelo completo.
- Musica de libreria y stock para produccion audiovisual: la generacion por lotes de hasta 8 pistas simultaneas, combinada con control explicito de BPM, tonalidad, compas y duracion, permite cubrir catalogos de cues cortos y loops de forma automatizada.
- Banda sonora para videojuegos: la duracion configurable de 10 s a 600 s y el control de metadatos facilitan generar bucles musicales y transiciones ajustadas a eventos de juego, con posibilidad de regenerar secciones concretas mediante repaint.
- Karaoke y plataformas de letras: la generacion de LRC con marcas de tiempo a partir del audio generado automatiza la sincronizacion de letras, evitando el alineado manual en catalogos grandes.
- Post-produccion y remezcla: la separacion en stems y el repaint selectivo permiten aislar voces o instrumentos, corregir un fragmento defectuoso o reconstruir una seccion sin volver a generar la cancion entera.
- Acompanamiento para vocalistas: la funcion Vocal2BGM genera la base instrumental a partir de una pista de voz ya grabada, util para maquetas y para productores que parten de una interpretacion vocal.
- Catalogacion y analisis de audio: la comprension de audio permite extraer BPM, tonalidad, escala, compas y un caption descriptivo de un fichero existente, lo que sirve para poblar bases de datos musicales con metadatos estructurados.
- Localizacion de repertorio: el soporte declarado de mas de 50 idiomas en las letras permite producir versiones de una misma cancion en varios mercados manteniendo estructura y estilo.
- Generacion de covers autorizadas: la generacion de covers a partir de audio de referencia facilita adaptaciones de estilo sobre material propio o licenciado, con control de timbre y produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de benchmark, pero no se ha proporcionado su contenido numerico. Las unicas referencias de rendimiento disponibles son cualitativas o de latencia:

| Metrica | Valor declarado |
|---|---|
| Calidad subjetiva | entre Suno v4.5 y Suno v5 (afirmacion del autor, sin metodologia detallada) |
| Tiempo por cancion completa en A100 | menos de 2 s (rango declarado de 0,5 s a 10 s segun modo de pensamiento y pasos de difusion) |
| Tiempo por cancion completa en RTX 3090 | menos de 10 s |
| VRAM minima en variante base | menos de 4 GB |
| Entrenamiento de LoRA | 8 canciones, 1 hora en RTX 3090 con 12 GB de VRAM |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas objetivas de audio (FAD, CLAP, similitud de prompt) en la informacion proporcionada.

## Requisitos de hardware

- Inferencia de la variante base: menos de 4 GB de VRAM segun la model card, lo que la situa al alcance de practicamente cualquier GPU consumer moderna.
- Variante XL (DiT de 4B): requiere al menos 12 GB de VRAM con offload y se recomienda 20 GB o mas.
- GPU recomendadas por el autor: A100 para el mejor rendimiento de latencia (menos de 2 s por cancion) y RTX 3090 para uso de escritorio (menos de 10 s por cancion).
- Cabe en GPU consumer: si, la variante base en tarjetas de gama media con mas de 4 GB de VRAM; la variante XL en RTX 3090/4090 con la configuracion adecuada.
- Entrenamiento de LoRA: viable en una RTX 3090 de 12 GB con 8 canciones y aproximadamente 1 hora de entrenamiento.
- Opciones de despliegue: no se detallan en la informacion disponible (no se confirma soporte de vLLM, llama.cpp, Ollama o TGI). Si se mencionan scripts de lanzamiento, una demo en Hugging Face Spaces y una integracion con ComfyUI anunciada entre los partners.
- Throughput y latencia: sin datos de tokens por segundo ni de pistas por hora; solo las cifras de latencia por cancion indicadas arriba y la capacidad de generar hasta 8 canciones en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dvanh/ace-studio-v3-mashup | no disponible (repo de 0,4 GB) | no disponible | sin datos propios | no disponible | Hugging Face, 0 descargas |
| ACE-Step 1.5 (referencia de la model card) | no disponible; variante XL con DiT de 4B | 10 s a 600 s de audio; 50+ idiomas | latencia declarada <2 s en A100; calidad declarada entre Suno v4.5 y Suno v5 | no disponible en la informacion | Hugging Face, ModelScope, Space demo |
| Suno v4.5 | no disponible | no disponible | referencia cualitativa inferior segun el autor | propietaria | servicio comercial |
| Suno v5 | no disponible | no disponible | referencia cualitativa superior segun el autor | propietaria | servicio comercial |
| Otros modelos abiertos de generacion musical | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La unica comparacion aportada por la fuente es cualitativa, situando la calidad de ACE-Step 1.5 entre Suno v4.5 y Suno v5, sin metodologia, conjunto de evaluacion ni cifras reproducibles. No hay datos verificables para comparar el repositorio dvanh/ace-studio-v3-mashup con ninguna alternativa.

## Limitaciones y advertencias

- La ficha tecnica del repositorio esta ausente: no se declara licencia, pipeline, idiomas ni arquitectura propios. La documentacion disponible pertenece al modelo referenciado ACE-Step 1.5, no al mashup.
- Sin licencia declarada, no puede asumirse permiso de uso comercial; cualquier despliegue en produccion exige aclarar primero los terminos legales con el autor.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, sin historial de uso ni validacion por parte de la comunidad.
- Un tamano de 0,4 GB es muy inferior al esperado para un modelo fundacional completo, lo que sugiere pesos parciales, un adaptador o una fusion de componentes; no hay documentacion del proceso de mezcla.
- Los artefactos de tipo mashup pueden degradar la calidad respecto al modelo original, introducir artefactos de audio o romper la coherencia entre las etapas de planificacion y sintesis. No hay evaluaciones publicadas que lo confirmen o lo descarten.
- La afirmacion de calidad entre Suno v4.5 y Suno v5 es una declaracion del autor sin metodologia, conjunto de test ni metricas objetivas; debe tratarse como marketing hasta su verificacion independiente.
- La cobertura de mas de 50 idiomas corresponde a las letras, no necesariamente a la calidad de pronunciacion ni a la adecuacion cultural en todos ellos; no se aportan evaluaciones por idioma.
- En modelos generativos de audio no aplica la alucinacion textual en el sentido habitual, pero si el incumplimiento del prompt: estilo, instrumentacion o metadatos pueden desviarse de lo solicitado, y el control fino depende de la calidad del plano generado por el LM.
- Los derechos de autor del audio generado y del material de referencia empleado en covers, repaint o Vocal2BGM son responsabilidad del usuario; el modelo no incorpora filtros de similitud documentados.
- Los requisitos de VRAM de la variante XL (12 GB con offload, 20 GB recomendados) pueden superar el hardware de muchos equipos de desarrollo.
- Las fechas del repositorio (2026) y la numeracion arXiv asociada deben verificarse directamente en las fuentes antes de citarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dvanh/ace-studio-v3-mashup
- Modelo de referencia ACE-Step 1.5 en Hugging Face: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo en ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Sitio de ACEMusic: https://acemusic.ai
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio Awesome ACE-Step: https://github.com/ace-step/awesome-ace-step
- Variante XL base: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Variante XL SFT: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Variante XL turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Servidor de Discord: https://discord.gg/PeWDxrkdj7
- ComfyUI (partner): https://www.comfy.org/
- Documentacion de ACE Studio sobre modelos de sintesis vocal: https://docs.acestudio.ai/ai-vocal-synth/voice-library/vocal-synth-models
