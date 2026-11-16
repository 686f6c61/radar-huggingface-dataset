# audio-cpp/SoulX-Singer-GGUF

## Resumen

SoulX-Singer GGUF es una conversión al formato GGUF del modelo SoulX-Singer de Soul-AILab, empaquetada por el proyecto audio-cpp para su uso con la librería de inferencia de audio homónima. Se trata de un modelo de transcripción musical offline especializado en la extracción de notas de canto: recibe audio vocal aislado y produce eventos de nota en formato MIDI o JSON, incluyendo tono, tiempos de inicio y fin, e índices de palabra. El paquete integra además dos componentes auxiliares: RWBD para la predicción de fronteras de palabra y RMVPE para la extracción de tono.

El modelo resuelve un problema concreto dentro del pipeline de procesamiento musical: convertir una interpretación vocal en una representación simbólica de notas utilizables por herramientas de edición, análisis o síntesis. Con 114 millones de parámetros y un tamaño de repositorio de 0,5 GB, está diseñado para ejecutarse en entornos con recursos limitados, incluyendo CPU, CUDA y Vulkan, lo que lo hace accesible fuera de clústeres de GPU dedicados.

Es relevante ahora porque el ecosistema audio.cpp está consolidando una vía de inferencia ligera y portable para modelos de audio, análoga a lo que llama.cpp representa para los modelos de lenguaje. Esta conversión concreta, publicada en noviembre de 2026, permite desplegar transcripción de canto sin depender de frameworks de deep learning pesados. No obstante, la model card del autor la marca explícitamente como trabajo en curso (WIP) y limita su alcance: no soporta transcripción de letra ni procesamiento en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de transcripción musical; componentes ROSVOT, RWBD y RMVPE) |
| Parametros totales | 114.073.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (paquete único de precisión completa) |
| Idiomas soportados | no disponible (la salida son eventos de nota, no texto) |
| Licencia | Apache-2.0 (checkpoint); código de referencia ROSVOT bajo MIT |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,5 GB |
| Modelo base | Soul-AILab/SoulX-Singer (revision 40493ad90286056c7a9095035164434a79daa8c9) |
| Libreria de inferencia | audio.cpp |
| Backends validados | CPU, CUDA, Vulkan |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer subyacente ni los datos de entrenamiento del modelo base SoulX-Singer. Lo que sí se documenta es la composición del paquete GGUF: un único fichero F32 que agrupa tres componentes funcionales. ROSVOT se encarga de la transcripción de notas de canto; RWBD predice las fronteras de palabra; y RMVPE realiza la extracción de tono (pitch). Los checkpoints de preprocesamiento provienen del repositorio Soul-AILab/SoulX-Singer-Preprocess, en la revisión 83dc50289d22a81b1e9998f5b9e111aef7c1fdcd, dentro del subdirectorio rosvot.

La implementación de referencia es el repositorio ROSVOT de RickyL-2000, en el commit 3c8332bf43adae35f6e4d64971862f2f6139b310, publicado bajo licencia MIT. La model card indica que los avisos de licencia están embebidos en el propio fichero GGUF. No se especifican en la información proporcionada detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de transcripción simbólica más que de generación de lenguaje.

## Capacidades

- Transcripción de notas de canto offline: convierte audio vocal en eventos de nota con tono, tiempo de inicio y tiempo de fin.
- Salida en formato MIDI: genera ficheros `.mid` directamente utilizables por secuenciadores y DAWs.
- Salida en formato JSON: mediante la opción `output_format=json`, produce pitches, segundos de inicio y fin, e índices de palabra.
- Predicción de fronteras de palabra (RWBD): alinea las notas con palabras del texto cantado.
- Extracción de tono (RMVPE): componente dedicado al análisis de pitch.
- Entrada opcional de duraciones de palabra: un fichero JSON con un array de `word_durations_file` permite sustituir las fronteras predichas por RWBD por tiempos proporcionados externamente.
- Ejecución multiplataforma: validado en CPU, CUDA y Vulkan.
- No soporta transcripción de letra (lyric transcription).
- No soporta procesamiento en streaming.

## Casos de uso

- Digitalización de interpretaciones vocales para producción musical: el modelo convierte una toma de voz aislada en un fichero MIDI que puede importarse en un DAW para reasignar la melodía a un instrumento virtual o corregir la afinación nota a nota.
- Análisis musicológico de grabaciones: la salida JSON con pitches y tiempos permite estudiar intervalos, rangos vocales y patrones melódicos de forma programática, sin necesidad de transcripción manual.
- Generación de partituras simplificadas: a partir de los eventos de nota se puede construir una representación simbólica para herramientas de notación, útil en educación musical o archivo.
- Alineación de letra y melodía: con las fronteras de palabra de RWBD, o con duraciones externas vía `word_durations_file`, se puede sincronizar cada sílaba cantada con su nota correspondiente, lo que facilita tareas de subtitulado cantado o karaoke.
- Preprocesamiento para modelos de síntesis de canto: los eventos de nota y pitch extraídos sirven como entrada estructurada para pipelines de text-to-singing o voice conversion que requieran una partitura intermedia.
- Despliegue en entornos sin GPU dedicada: al estar validado en CPU y ocupar 0,5 GB en F32, puede ejecutarse en portátiles o servidores modestos para procesamiento por lotes de archivos vocales.
- Integración en herramientas de escritorio: la CLI `audiocpp_cli` permite incorporar la transcripción como paso de un script de preproducción musical, con backend seleccionable y control de hilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que la paridad del componente de CPU supera la comparación estricta en FP32, y que el redondeo en GPU puede alterar fronteras discretas de nota. No se proporcionan métricas objetivas como accuracy de transcripción, F1 de notas o latencia medida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 114 millones de parámetros en F32, el peso de los tensores ronda los 0,45 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos; la validación cubre CUDA y Vulkan, lo que incluye GPUs NVIDIA y AMD/Intel compatibles con Vulkan.
- Compatibilidad con GPU de consumo: por tamaño, es previsible que quepa en cualquier GPU de consumo con al menos 1-2 GB de memoria libre, aunque la información no confirma modelos concretos.
- Opciones de despliegue: `audiocpp_cli` con `--task midi --family rosvot`, selección de backend mediante `--backend cuda` y control de hilos con `--threads`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SoulX-Singer GGUF (audio-cpp) | 114.073.663 | no disponible | Transcripción de notas de canto | Apache-2.0 | GGUF |
| Soul-AILab/SoulX-Singer (original) | no disponible | no disponible | Transcripción de notas de canto | Apache-2.0 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no identifica otros modelos de transcripción de canto comparables con datos verificables de parámetros, contexto o rendimiento, por lo que la comparativa se limita al modelo original frente a su conversión GGUF.

## Limitaciones y advertencias

- Modelo marcado como trabajo en curso (WIP) por el propio autor; no debe considerarse una versión estable para producción crítica.
- No soporta transcripción de letra ni streaming, lo que limita su uso en aplicaciones en tiempo real o de reconocimiento de voz cantada.
- Requiere audio vocal aislado; el rendimiento con mezclas musicales completas no está garantizado.
- El redondeo en GPU puede modificar fronteras discretas de nota respecto al resultado en CPU, introduciendo variabilidad entre backends.
- La model card advierte explícitamente de que no garantiza una transcripción musical perfecta.
- No se documentan sesgos conocidos ni evaluación multilingüe, ya que la salida es simbólica y no textual.
- Riesgo de alucinación aplicable en el sentido de notas espurias o fronteras incorrectas en pasajes ambiguos, aunque no se cuantifica.
- Licencia Apache-2.0 para el checkpoint, con código de referencia ROSVOT bajo MIT; los avisos están embebidos en el GGUF, pero conviene verificar la compatibilidad en despliegues comerciales.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/audio-cpp/SoulX-Singer-GGUF
- Modelo base: https://huggingface.co/Soul-AILab/SoulX-Singer/tree/40493ad90286056c7a9095035164434a79daa8c9
- Checkpoints de preprocesamiento: https://huggingface.co/Soul-AILab/SoulX-Singer-Preprocess/tree/83dc50289d22a81b1e9998f5b9e111aef7c1fdcd/rosvot
- Implementación de referencia ROSVOT: https://github.com/RickyL-2000/ROSVOT (commit 3c8332bf43adae35f6e4d64971862f2f6139b310)
