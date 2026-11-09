# JinchuanTian/LongCap-35B-A3B

## Resumen

LongCap-35B-A3B es un modelo multimodal de audio a texto desarrollado por JinchuanTian (autor individual, según el repositorio de Hugging Face) que convierte grabaciones de audio de entre unos segundos y aproximadamente dos horas en una línea temporal estructurada de eventos de habla, música y efectos sonoros. Cada evento incluye marcas de inicio y fin, un conjunto estructurado de atributos (hasta 62 claves diseñadas por expertos) y un pie de foto breve. El mismo checkpoint realiza también transcripción de voz con diarización de hablantes.

El modelo es un fine-tuning del modelo base Qwen/Qwen3.5-35B-A3B-Base, con 35.313.784.832 parámetros totales y arquitectura MoE (mezcla de expertos), según los metadatos del repositorio. Su innovación principal es el procesamiento de audio de larga duración en una sola pasada: lee la grabación por fragmentos cortos y va escribiendo los eventos de cada fragmento manteniendo el audio y el texto previos en contexto, con una ventana de hasta 1M de tokens.

Es relevante porque aborda un problema práctico poco cubierto: la generación de descripciones densas y con marcas temporales de audio de hora escala (películas, podcasts, reuniones largas), donde otros sistemas degradan su calidad en pocos minutos. Se distribuye con licencia Apache 2.0 en dos variantes de precisión (BF16 y FP8), lo que facilita su despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre base Qwen3.5; pipeline audio-text-to-text |
| Parámetros totales | 35.313.784.832 (35,3B) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (según la model card) |
| Tipos de cuantización | BF16 (pesos completos) y FP8 (solo expertos MoE cuantizados, resto en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-35B-A3B-Base |
| Tamaño del repositorio | 70,6 GB (BF16); 38,4 GB (FP8) |
| Librería | longcap |
| Tarea (pipeline) | audio-text-to-text |

## Arquitectura y entrenamiento

LongCap-35B-A3B parte de Qwen3.5-35B-A3B-Base, un transformer con arquitectura de mezcla de expertos (MoE) de 35,3B parámetros totales. El modelo se ha afinado (fine-tune) para dos tareas de audio: captioning de audio con marcas temporales y reconocimiento automático de voz con diarización de hablantes. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacada es el procesamiento de audio de larga duración en una sola pasada: el modelo consume la grabación en fragmentos cortos y genera los eventos de cada fragmento de forma incremental, manteniendo en contexto tanto el audio como el texto ya generado, con una ventana de hasta 1M de tokens. Esto permite cubrir grabaciones de hasta unas dos horas sin la degradación que sufren los sistemas que procesan segmentos independientes de 10 minutos. La salida es JSON estructurado con `start`, `end`, atributos por tipo de evento (`speech`, `music`, `sound_event`) y un `caption` breve; los nombres de atributos y valores se escriben en chino, mientras que las transcripciones y letras conservan el idioma hablado.

## Capacidades

- Generación de descripciones densas de audio con marcas temporales de inicio y fin por evento.
- Captioning estructurado con hasta 62 claves de atributos diseñadas por expertos para habla, música y efectos sonoros.
- Reconocimiento automático de voz (ASR) con etiquetas de hablante (diarización).
- Detección de eventos sonoros (sound event detection) con atributos como fuente, distancia, reverberación o función narrativa.
- Descripción de música: instrumentos, función instrumental, tipo de voz, timbre, tempo/BPM.
- Atributos de habla: transcripción, identidad del hablante, edad, género, dialecto, acento, emoción, intención, acto de habla, subtexto, calidad vocal, entre otros.
- Procesamiento de audio de larga duración (hasta ~2 horas) en una sola pasada.
- Soporte de despliegue con vLLM (etiqueta `vllm` en el repositorio).
- Capacidades multilingües limitadas a inglés y chino según los metadatos; las transcripciones conservan el idioma hablado.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes o multi-step reasoning.

## Casos de uso

- Indexación y búsqueda de archivos audiovisuales: el modelo genera una línea temporal con marcas de tiempo y atributos por evento, lo que permite construir índices buscables sobre películas, documentales o archivos de broadcast y localizar escenas por hablante, música o efecto sonoro.
- Subtitulado y transcripción de reuniones largas: la diarización integrada y la ventana de hasta 1M tokens permiten transcribir sesiones de una o dos horas etiquetando quién habla en cada intervención, sin segmentar manualmente el audio.
- Análisis de podcasts y programas de radio: la salida estructurada (habla, música, eventos sonoros con atributos) facilita la generación automática de capítulos, resúmenes y metadatos para plataformas de distribución.
- Accesibilidad audiovisual: descripciones densas de audio con marcas temporales sirven para producir audiodescripciones y subtítulos enriquecidos para personas con discapacidad auditiva o visual.
- Monitorización de contenido y moderación: la detección de eventos sonoros y los atributos de habla (emoción, intención, acto de habla) permiten clasificar y revisar grandes volúmenes de audio de forma automática.
- Producción musical y postproducción de cine: la descripción de instrumentos, tempo y función narrativa de la música, junto con los eventos sonoros y su distancia o reverberación, resulta útil para catalogar bandas sonoras y efectos en archivos de producción.
- Investigación en audio y lingüística computacional: el modelo sirve como anotador automático para generar datasets etiquetados de habla, música y sonido con atributos ricos a partir de grabaciones largas.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a LongCapBench-TAC-Short y LongCapBench-TAC-Long (benchmarks del paper, aún no disponible en arXiv según la información proporcionada). Las puntuaciones reportadas corresponden a la versión FP8.

| Benchmark / métrica | LongCap-35B-A3B | Qwen3.5-Omni-Plus |
|---|---|---|
| tcpCapSim en LongCapBench-TAC-Short (mayor es mejor) | 64,6% | 52,7% |
| TER en LongCapBench-TAC-Short (menor es mejor) | 13,0% | 13,2% |

En LongCapBench-TAC-Long, la model card indica que otros sistemas se degradan en pocos minutos cuando se evalúan segmentos independientes de 10 minutos, mientras que LongCap mantiene la calidad en una sola pasada sobre grabaciones de hasta dos horas. No se proporcionan cifras numéricas adicionales de benchmarks como MMLU, HumanEval o GSM8K, que no aplican directamente a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante BF16 ocupa 70,6 GB de pesos y requiere 2 GPU H100 de 80 GB según la model card; la variante FP8 ocupa 38,4 GB y cabe en 1 GPU H100 de 80 GB.
- GPU recomendadas: H100 80 GB (2 unidades para BF16, 1 para FP8). No se documentan requisitos para A100 u otras GPU en la información disponible.
- GPU de consumo: no se indica compatibilidad con GPU de consumo (RTX 4090, etc.); el tamaño de pesos (38,4 GB en FP8) supera la VRAM de las GPU consumer habituales de 24 GB, por lo que no cabe en ellas sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: vLLM (etiqueta oficial del repositorio) y la librería `longcap` con el código del proyecto. No se documenta soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (tcpCapSim / TER en TAC-Short) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCap-35B-A3B | 35,3B (MoE) | hasta 1M tokens | 64,6% / 13,0% | Apache 2.0 | Pesos BF16 y FP8 en Hugging Face |
| Qwen3.5-Omni-Plus | no disponible | no disponible | 52,7% / 13,2% | no disponible | no disponible en la información |
| LongCap-122B-A10B | 122B (MoE, según nombre) | no disponible | no disponible (referenciado en el paper) | no disponible | No publicado |

La model card menciona además un modelo mayor, LongCap-122B-A10B, descrito como parte del paper y no liberado. No se dispone de datos de otros modelos comparables de captioning de audio de larga duración en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: los metadatos declaran solo inglés y chino; no se documenta soporte de castellano ni de otros idiomas, aunque las transcripciones conservan el idioma hablado detectado.
- Salida en chino: los nombres y valores de los atributos se escriben en chino, lo que exige postprocesado o traducción para aplicaciones en otros idiomas (el repositorio incluye `attribute_keys.json` con la correspondencia al inglés).
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo generativo de descripciones de audio, los atributos inferidos (emoción, intención, subtexto) pueden no corresponder fielmente al contenido real.
- Sesgos: no se documentan sesgos conocidos; los atributos de hablante (edad, género, dialecto, acento) pueden introducir sesgos en la clasificación de personas.
- Longitud de audio: el rendimiento está validado hasta aproximadamente dos horas; no se documenta comportamiento más allá de ese límite.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B-Base y las dependencias del código `longcap`.
- Producción: los requisitos de hardware son elevados (2× H100 en BF16) y no se documentan latencias ni throughput; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su madurez y soporte comunitario son limitados.
- Paper pendiente: el paper en arXiv figura como "coming soon", por lo que no hay documentación metodológica completa sobre datos de entrenamiento ni evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JinchuanTian/LongCap-35B-A3B
- Versión FP8: https://huggingface.co/JinchuanTian/LongCap-35B-A3B-FP8
- Código: https://github.com/jctian98/longcap-code
- Guía de inicio rápido: https://github.com/jctian98/longcap-code/blob/main/docs/quickstart.md
- Página del proyecto: https://jctian98.github.io/longcap/
- Benchmark LongCapBench-TAC-Long: https://huggingface.co/datasets/JinchuanTian/LongCapBench-TAC-Long
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Paper (arXiv, pendiente de publicación según la model card): no disponible
