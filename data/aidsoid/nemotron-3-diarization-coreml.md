# aidsoid/nemotron-3-diarization-coreml

## Resumen

Nemotron 3 Diarization — CoreML es una conversión del modelo NVIDIA Nemotron 3 Diarization (un sistema de diarización de hablantes en streaming para hasta 8 voces) al formato CoreML, publicada por el usuario aidsoid y pensada para ejecución íntegramente en dispositivo sobre plataformas Apple. El modelo original es un Sortformer de 100 millones de parámetros con un transformer de 31 capas basado en RoPE, resolución de salida de 10 ms y soporte de streaming. La conversión busca reproducir la precisión del modelo de NVIDIA aprovechando el Neural Engine (ANE) o la GPU de los chips de la serie M en macOS 14+ e iOS 17+.

El problema que resuelve es la diarización de hablantes ("quién habla cuándo") sin enviar audio a la nube, un requisito habitual en aplicaciones de transcripción de reuniones, atención al cliente o análisis de llamadas donde la privacidad y la latencia importan. El repositorio incluye varios presets que intercambian latencia, precisión (DER) y tamaño de pesos: desde configuraciones casi en tiempo real (1,04 s de latencia) hasta modos de altísima precisión con más de 500 veces tiempo real de procesamiento.

Es relevante ahora porque demuestra que un modelo de diarización de NVIDIA puede ejecutarse de forma local y eficiente en hardware de consumo Apple, con variantes cuantizadas a 8 bits (W8A8) que ocupan 95 MB y mantienen un recuento de hablantes correcto en todos los casos de prueba de AMI. La integración se realiza a través de la librería FluidAudio, en Swift.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer streaming, transformer de 31 capas con RoPE (conversión a CoreML) |
| Parametros totales | 100 M |
| Longitud de contexto | Ventana de streaming configurable por preset (de 0,72 s a 27,2 s de audio por llamada); secuencia empaquetada ("Packed T") de 317 a 684 tokens |
| Tipos de cuantizacion | fp16 (presets monolíticos de 190 MB) y W8A8 (int8 pesos y activaciones, presets split de 95 MB); weight-only int8 construido pero no publicado |
| Idiomas soportados | no disponible (modelo de diarización de hablantes; la tarea es independiente del idioma, pero el autor no declara idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage) |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA Nemotron 3 Diarization, un sistema de diarización de hablantes en streaming de tipo Sortformer. Se trata de un transformer de 31 capas con codificación posicional rotatoria (RoPE) que produce salida con resolución temporal de 10 ms y soporta hasta 8 hablantes simultáneos. La arquitectura está diseñada para operar en modo streaming, manteniendo un estado interno (caché de hablantes y una cola FIFO de contexto) que se empaqueta junto con la ventana de audio actual para formar la secuencia de entrada del transformer ("Packed T").

La información proporcionada no detalla el dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO, por lo que esos datos se consideran no disponibles. La conversión CoreML se limita a exportar el checkpoint original a diferentes "shapes" de streaming (chunk, right-context y FIFO), compartiendo todos los presets un único checkpoint. En la variante split-graph, el apilado de características, la proyección de 1024 a 512 (`pre_encode_proj_t.bin`), el empaquetado de estado y las máscaras se ejecutan en el host, mientras que el subgrafo CoreML contiene únicamente el transformer y la cabeza, lo que permite una residencia del 100 % en el Neural Engine. El autor indica que otras configuraciones (tiers sub-segundo, tamaños de chunk intermedios, int8 solo de pesos) se construyeron y midieron pero no se publicaron por estar dominadas por los presets existentes.

## Capacidades

- Diarización de hablantes en streaming para hasta 8 voces simultáneas.
- Detección de actividad de voz (el pipeline declarado es voice-activity-detection).
- Salida con resolución temporal de 10 ms, adecuada para alineación fina de segmentos.
- Recuento de hablantes (speaker counting) con exactitud variable según la ventana: hasta 100 % de acierto en los 16 meetings de prueba indicados con ventanas largas.
- Ejecución íntegramente on-device sobre Neural Engine o GPU de Apple Silicon, sin dependencia de red.
- Modos de operación con distinta latencia (de 1,04 s a 30,4 s) y tamaño de pesos (190 MB fp16 o 95 MB W8A8).
- Integración con la librería FluidAudio en Swift; entrada de audio de 16 kHz mono.
- No se declaran capacidades de tool calling, agentes, visión ni audio generativo; el modelo es específico de diarización.

## Casos de uso

- Actas y transcripción de reuniones: el modelo separa las intervenciones de cada participante en grabaciones multipersona (por ejemplo, el corpus AMI) y permite etiquetar cada segmento de texto con el hablante correspondiente antes de pasarlo a un motor ASR.
- Atención al cliente y contact centers: distingue automáticamente la voz del agente de la del cliente en llamadas grabadas, lo que facilita métricas por rol (tiempo de habla, intervenciones) y el análisis de calidad sin enviar audio a un servicio externo.
- Aplicaciones iOS y macOS con privacidad estricta: gracias a los presets split W8A8 de 95 MB totalmente residentes en el Neural Engine, se puede diarizar en el propio dispositivo, algo relevante para apps de salud, legal o finanzas que no pueden subir audio a la nube.
- Análisis de podcasts y entrevistas: con `fast128` (9,36 DER y 100 % de recuento correcto en las pruebas citadas) se obtienen etiquetas de hablante fiables para editar o indexar contenido largo por voz.
- Cumplimiento y auditoría de grabaciones: permite verificar de forma local qué persona dijo qué en una conversación grabada, con ventanas largas que maximizan la exactitud del recuento de hablantes.
- Subtitulado y post-producción de vídeo: la resolución de 10 ms y el etiquetado por hablante facilitan la generación de subtítulos con colores o etiquetas diferenciadas por voz.
- Investigación en diarización: los distintos presets (latencia, DER, SCA, tamaño) permiten estudiar el compromiso entre ventana de contexto, cuantización y precisión, usando referencias de alineación forzada como las del repositorio nttcslab-sp.
- Monitorización casi en vivo en local: el preset `low` (1,04 s de latencia) sirve para diarización en directo con retardo mínimo, aunque el autor advierte que su recuento de hablantes es más débil (75,0 SCA).

## Benchmarks y rendimiento

Resultados sobre AMI MHM test, 16 meetings, referencias de alineación forzada (nttcslab-sp/diar-forced-alignment), collar 0, solapamiento incluido (mismo protocolo que la model card de NVIDIA). SCA = exactitud de recuento de hablantes (fracción de meetings con el número de hablantes exacto). Wall RTFx medido en un MacBook con M5 Pro, ruta ANE para los presets split.

| Preset | Tamano | Audio por llamada | Latencia | DER | SCA | Wall RTFx |
|---|---|---|---|---|---|---|
| `offline` | 190 MB | 27,2 s | 30,40 s | 9,47 | 87,5 | 904x |
| `fast128` | 190 MB | 10,24 s | 10,56 s | 9,36 | 100,0 | 546x |
| `fast32` | 190 MB | 2,56 s | 2,88 s | 9,53 | 93,8 | 179x |
| `c128-split-w8a8` | 95 MB | 10,24 s | 10,56 s | 9,63 | 100,0 | 364x |
| `low` | 190 MB | 0,72 s | 1,04 s | 9,75 | 75,0 | 31x |
| `fast32-split-w8a8` | 95 MB | 2,56 s | 2,88 s | 9,76 | 75,0 | 185x |
| `fast` | 190 MB | 0,72 s | 1,04 s | 10,07 | 68,8 | 44x |

Como referencia, el autor cita los números publicados por NVIDIA bajo el mismo protocolo: 9,25 DER / 87,5 SCA en configuración offline y 9,48 / 81,25 con 1,04 s de latencia. La diferencia de aproximadamente 0,25 puntos de DER se atribuye al runtime fp16 de CoreML frente a los valores bf16 en GPU de NVIDIA. El autor también señala que el tamaño de ventana determina el recuento de hablantes: en ventana de 10,24 s la variante W8A8 iguala a fp16 (16/16 meetings) con 0,27 de DER de penalización, mientras que en ventana de 2,56 s pierde 18,8 puntos de exactitud de recuento.

## Requisitos de hardware

- Repositorio completo: 1,2 GB; cada preset monolítico ocupa 190 MB y cada preset split W8A8 ocupa 95 MB.
- Plataformas soportadas: macOS 14 o superior e iOS 17 o superior, sobre Apple Silicon.
- Ruta de ejecución: Neural Engine (ANE) o GPU del chip; los presets split W8A8 están diseñados para residir al 100 % en el ANE.
- Consumer hardware: sí, cualquier Mac o dispositivo iOS con Apple Silicon de generación compatible; los datos de rendimiento se han medido en un MacBook con M5 Pro.
- No requiere GPU de datacenter (A100, H100) ni tampoco cabe esperar uso en tarjetas NVIDIA: es un formato CoreML específico de Apple.
- Despliegue: librería FluidAudio (Swift) con `Nemotron3Config` y `Nemotron3Models.load`; el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput por preset (medidos en M5 Pro): desde 1,04 s de latencia con 31x–44x RTFx (`low`, `fast`) hasta 30,4 s de latencia con 904x RTFx (`offline`); `fast32` es el valor recomendado por el autor como predeterminado por su equilibrio (2,88 s de latencia, 179x RTFx).

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos de diarización distintos del propio Nemotron 3 Diarization de NVIDIA. Como referencia directa, se compara la conversión CoreML con el modelo original:

| Modelo | Parametros | Formato | DER (offline) | SCA (offline) | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| aidsoid/nemotron-3-diarization-coreml `offline` | 100 M | CoreML fp16 | 9,47 | 87,5 | openmdw-1.1 | On-device Apple (GPU; sin ANE por límite del compilador) |
| nvidia/Nemotron-3-Diarization (original) | 100 M | no disponible | 9,25 | 87,5 | no disponible | GPU (bf16) |

No se dispone de datos de otros sistemas de diarización (por ejemplo pyannote u otros Sortformer) en la información proporcionada.

## Limitaciones y advertencias

- El recuento de hablantes depende fuertemente del tamaño de ventana: `fast` y `low` (ventana de 0,72 s) bajan a 68,8 y 75,0 de SCA, y `fast32-split-w8a8` pierde 18,8 puntos frente a su equivalente fp16.
- La variante `offline` no puede ejecutarse en el Neural Engine por una limitación del compilador, según el autor.
- El preset split W8A8 requiere pre-codificación en el host (FluidAudio lo gestiona, pero es un detalle de integración a tener en cuenta).
- Existe una brecha de aproximadamente 0,25 puntos de DER atribuida al runtime fp16 de CoreML frente al bf16 de NVIDIA; no es un error puntual, sino consistente entre presets.
- Los presets de latencia baja son los más costosos por segundo de audio y los de peor exactitud, por lo que no son adecuados para subtitulado en directo si se necesita precisión de recuento.
- No hay información sobre sesgos, riesgo de alucinación, composición del dataset de entrenamiento ni cobertura de idiomas; la tarea de diarización no genera texto, pero la salida puede ser errónea en audio solapado o con ruido.
- Licencia openmdw-1.1: conviene revisar los términos exactos para uso comercial, ya que la ficha no los detalla.
- Es una conversión de un modelo de terceros (NVIDIA); la responsabilidad de la precisión del checkpoint original recae en NVIDIA, no en el autor de la conversión.
- No se declaran garantías de soporte ni mantenimiento más allá de lo indicado por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/aidsoid/nemotron-3-diarization-coreml
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Librería FluidAudio: https://github.com/FluidInference/FluidAudio
- Referencias de alineación forzada usadas en la evaluación: https://github.com/nttcslab-sp/diar-forced-alignment
- Paper asociado (tag arxiv:2507.18446): https://arxiv.org/abs/2507.18446
