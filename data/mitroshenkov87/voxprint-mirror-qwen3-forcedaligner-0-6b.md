# Mitroshenkov87/voxprint-mirror-qwen3-forcedaligner-0.6b

## Resumen

voxprint-mirror-qwen3-forcedaligner-0.6b es una copia espejo sin modificar del modelo Qwen/Qwen3-ForcedAligner-0.6B, publicada por el usuario Mitroshenkov87 como fuente de descarga de respaldo para la aplicacion Voxprint (clonacion de voz y produccion de audiolibros). No se trata de un modelo entrenado por el autor del espejo: los pesos son identicos byte a byte a los del repositorio original en el commit c7cbfc2048c462b0d63a45797104fc9db3ad62b7, y el unico archivo que difiere es la model card.

El modelo subyacente pertenece a la familia Qwen3-ASR, desarrollada por el equipo Qwen de Alibaba. Qwen3-ForcedAligner-0.6B es un alineador forzado (forced aligner) que predice marcas de tiempo a nivel de unidad arbitraria sobre fragmentos de hasta 5 minutos de audio en 11 idiomas. Su proposito no es transcribir, sino anclar una transcripcion ya existente al eje temporal del audio con precision de palabra o de fonema, una tarea auxiliar critica en pipelines de doblaje, subtitulado y entrenamiento de sistemas TTS.

El repositorio espejo tiene 917.728.896 parametros reales segun los tensores en safetensors (aproximadamente 0,92 mil millones, pese a la denominacion comercial "0.6B"), ocupa 1,8 GB en disco y se distribuye bajo licencia Apache-2.0. En el momento de redactar esta ficha acumula 0 descargas y 0 "likes", y fue creado el 3 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-Omni (encoder de audio mas decodificador no autoregresivo, NAR); detalle de capas no disponible |
| Parametros totales | 917.728.896 (aproximadamente 0,92 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; la alineacion soporta hasta 5 minutos de habla por pasada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio solo publica safetensors) |
| Idiomas soportados | 11: chino, ingles, cantones, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de audio admitido | Voz (no admite canto ni musica con fondo, a diferencia de los modelos ASR de la familia) |
| Modo de inferencia | NAR (no autoregresivo) |
| Tamano del repositorio | 1,8 GB |
| Modelo base | Qwen/Qwen3-ForcedAligner-0.6B (commit c7cbfc2048c462b0d63a45797104fc9db3ad62b7) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que la familia Qwen3-ASR se apoya en la capacidad de comprension de audio del modelo fundacional Qwen3-Omni. El alineador opera en modo NAR (no autoregresivo), lo que implica que predice las marcas de tiempo en una unica pasada en lugar de generar secuencialmente token a token; ese diseno es coherente con la tarea de alineacion, donde las posiciones de salida estan condicionadas por una transcripcion de entrada ya conocida y no requieren decodificacion libre.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otros ajustes por preferencias. La model card original si menciona que la familia Qwen3-ASR se entreno con datos de habla a gran escala y que la evaluacion del alineador muestra una precision de marcas de tiempo superior a la de modelos de alineacion forzada basados en enfoques end-to-end (E2E), aunque sin cifras concretas. Tampoco se documentan innovaciones tecnicas adicionales especificas del alineador, mas alla de su integracion en un toolkit de inferencia que soporta inferencia por lotes con vLLM, servicio asincrono e inferencia en streaming.

## Capacidades

- Prediccion de marcas de tiempo (timestamps) sobre unidades arbitrarias del habla, es decir, alineacion a nivel de palabra, silaba o fonema segun la granularidad solicitada.
- Procesamiento de fragmentos de audio de hasta 5 minutos de duracion.
- Cobertura de 11 idiomas: chino, ingles, cantones, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol.
- Inferencia no autoregresiva (NAR), adecuada para procesamiento por lotes de alto volumen.
- Integracion con el paquete `qwen-asr`, que ofrece backend de transformers y backend de vLLM.
- Soporte declarado en el ecosistema de la familia para inferencia por lotes con vLLM, servicio asincrono e inferencia en streaming.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: la tarea del modelo es la alineacion forzada, no la generacion de texto conversacional.
- No se documentan capacidades de vision, audio generation ni modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Sincronizacion de audiolibros y clonacion de voz: es precisamente el escenario para el que se creo este espejo dentro de la aplicacion Voxprint. El alineador toma la transcripcion del narrador y devuelve las marcas temporales de cada palabra, lo que permite segmentar el audio, clonar la voz por fragmentos y reconstruir el audio final sin desincronizaciones.
- Generacion de subtitulos con timecodes a nivel de palabra: partiendo de una transcripcion ya validada, el modelo ancla cada palabra a su instante de inicio y fin, lo que habilita formatos de subtitulo enriquecidos y estilos tipo karaoke.
- Doblaje y traduccion audiovisual: en un pipeline de doblaje, disponer de las fronteras temporales exactas de cada palabra en el idioma origen permite ajustar la duracion de las locuciones traducidas y detectar que segmentos exceden la ventana original.
- Control de calidad de transcripciones ASR: comparar los timestamps devueltos por el alineador con los generados por un sistema ASR permite detectar omisiones, repeticiones y desajustes temporales antes de publicar una transcripcion.
- Creacion de datasets para entrenamiento de TTS: los corpus de sintesis de voz necesitan pares texto-audio alineados a nivel de fonema o palabra; el modelo produce esas etiquetas a partir de audio y transcripcion existentes.
- Edicion de podcast y audio basada en texto: con marcas de tiempo por palabra es posible editar el audio eliminando una frase concreta desde un editor de transcripcion, con corte preciso en la frontera de la palabra.
- Investigacion fonetica y linguistica: medir duraciones de fonemas, estudiar pausas y ritmo del habla en corpus de 11 idiomas sin necesidad de anotacion manual.
- Indexacion y busqueda dentro de archivos de audio: las marcas temporales permiten enlazar resultados de busqueda textual directamente al instante del audio correspondiente en archivos de hasta 5 minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos del modelo en la informacion disponible. La model card original afirma de forma cualitativa que la precision de marcas de tiempo del alineador "supera a los modelos de alineacion forzada basados en E2E", y que la variante Qwen3-ASR-0.6B de la misma familia alcanza un rendimiento 2.000 veces superior (2000x throughput) con una concurrencia de 128. Estas cifras corresponden a los modelos ASR de la familia, no al alineador, y no vienen acompanadas de tablas de resultados comparativas en el material proporcionado.

| Metrica | Resultado |
|---|---|
| Precision de marcas de tiempo | No disponible (solo afirmacion cualitativa de superioridad frente a modelos E2E) |
| Throughput del alineador | No disponible |
| Comparativa numerica con alternativas | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con los 917.728.896 parametros del modelo, se calculan aproximadamente 1,8 GB en bf16/fp16, 3,7 GB en fp32 y alrededor de 0,9 GB con cuantizacion de 8 bits y 0,5 GB con 4 bits. Son estimaciones derivadas del numero de parametros; el repo no publica pesos cuantizados.
- Cabria en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM, como una GTX 1650 de 4 GB, una RTX 3060 de 12 GB o una RTX 4090. Tambien es viable en CPU para lotes pequenos, dado el tamano reducido.
- GPU de datacenter (A100, H100) solo serian necesarias para escenarios de alto paralelismo, no por requisitos de memoria del modelo.
- Opciones de despliegue documentadas: el paquete `qwen-asr` con backend de transformers y backend de vLLM, ademas de una imagen Docker oficial mencionada en la model card. Se soportan inferencia por lotes con vLLM, servicio asincrono y streaming.
- Despliegue en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput concretos del alineador: no disponibles. Las cifras de 2000x de throughput con concurrencia 128 pertenecen a Qwen3-ASR-0.6B, no a este modelo.
- Nota de atribucion y soporte: al ser un espejo, el mantenimiento y las actualizaciones corresponden al repositorio original de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Modo de inferencia | Tipo de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B (este espejo y el original) | 917,7 M | 11 | NAR | Voz | apache-2.0 | HuggingFace y ModelScope |
| Qwen3-ASR-0.6B | No disponible | 30 idiomas y 22 dialectos chinos | Offline / streaming | Voz, canto, musica con BGM | No disponible en la informacion | HuggingFace y ModelScope |
| Qwen3-ASR-1.7B | No disponible | 30 idiomas y 22 dialectos chinos | Offline / streaming | Voz, canto, musica con BGM | No disponible en la informacion | HuggingFace y ModelScope |

Los dos modelos Qwen3-ASR son alternativas de la misma familia y resuelven una tarea distinta: transcribir frente a alinear. Para sustituir al alineador en tareas de alineacion forzada seria necesario recurrir a herramientas de terceros (tipo WhisperX o alineadores basados en wav2vec2), pero no se dispone en la informacion proporcionada de sus especificaciones ni de datos comparativos con Qwen3-ForcedAligner-0.6B, por lo que esa comparacion se marca como no disponible.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial. No pertenece a los autores del modelo, no recibe mantenimiento por su parte y no debe citarse como fuente primaria; el repositorio de referencia es Qwen/Qwen3-ForcedAligner-0.6B.
- El repositorio registra 0 descargas y 0 "likes" en el momento del analisis, y fue creado en octubre de 2026, por lo que su trazabilidad en produccion es escasa.
- El modelo alinea, no transcribe: requiere una transcripcion previa y correcta. Errores u omisiones en el texto de entrada degradan directamente la calidad de las marcas de tiempo.
- Limite de 5 minutos de audio por pasada de alineacion; para contenido mas largo hay que fragmentar, lo que introduce riesgos de discontinuidad en las fronteras de los segmentos.
- Solo admite voz. No esta disenado para canto ni para musica con fondo, a diferencia de los modelos ASR de la misma familia.
- Cobertura limitada a 11 idiomas. No se documenta soporte de dialectos, a diferencia de los modelos ASR de la familia, que cubren 22 dialectos chinos.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento diferencial por acento o variedad dialectal en el material proporcionado.
- Tampoco se documentan limitaciones de robustez frente a ruido, solapamiento de hablantes o audio de baja calidad; en un alineador estos factores son criticos y la ausencia de datos al respecto es un riesgo para su uso en produccion sin validacion previa.
- La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve la atribucion y el aviso de licencia. Es la misma licencia que la del modelo original, segun la model card del espejo.
- El nombre del modelo indica "0.6B", pero el recuento real de parametros en safetensors es de 917.728.896 (aproximadamente 0,92 B); conviene usar la cifra real para planificacion de recursos.
- El identificador `arxiv:2601.21337` aparece en las etiquetas del repositorio, pero no se ha podido verificar su contenido ni confirmar que corresponda a este modelo.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/Mitroshenkov87/voxprint-mirror-qwen3-forcedaligner-0.6b
- Modelo original: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio de la aplicacion Voxprint: https://github.com/Mitroshenkov87/voxprint
- Referencia arXiv incluida en las etiquetas: https://arxiv.org/abs/2601.21337
- Paquete de inferencia `qwen-asr` (PyPI): no disponible la URL exacta en la informacion proporcionada
- Imagen Docker oficial de la familia Qwen3-ASR: no disponible la URL exacta en la informacion proporcionada
- ModelScope (descarga alternativa): https://modelscope.cn/models/Qwen/Qwen3-ForcedAligner-0.6B (referencia inferida de la model card; no verificada)
