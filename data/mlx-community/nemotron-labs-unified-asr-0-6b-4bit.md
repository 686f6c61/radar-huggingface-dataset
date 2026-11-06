# mlx-community/nemotron-labs-unified-asr-0.6b-4bit

## Resumen

Nemotron-labs-unified-asr-0.6b es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, distribuido en esta ficha como una conversión a formato MLX en cuantización de 4 bits realizada por la comunidad mlx-community. El modelo resuelve el problema de la transcripción de voz en dos modalidades con un único checkpoint: transcripción offline de audio completo y transcripción en streaming con latencias controladas. Su relevancia actual radica en que unifica ambos modos en un solo modelo compacto de 626,7 millones de parámetros, lo que lo hace desplegable en hardware de consumo Apple Silicon.

La arquitectura es de tipo RNNT (Recurrent Neural Network Transducer), según las etiquetas del repositorio, con soporte para 25 idiomas europeos y salida con puntuación y capitalización. El contexto de audio se gestiona mediante un esquema de streaming con búfer: cada paso re-codifica 5,6 segundos de contexto izquierdo junto con el nuevo fragmento y su contexto derecho, lo que permite latencias de entre 160 ms y 2,08 segundos según la configuración.

Esta conversión concreta está pensada para el ecosistema MLX (Apple Silicon), con pesos en 4 bits para capas Linear y Embedding (grupo 64) y el resto en bfloat16, ocupando 472 MB en disco. Se distribuye bajo licencia OpenMDW 1.1, la misma que el modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), segun tags del repositorio |
| Parametros totales | 626.702.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; audio de entrada de al menos 80 ms, con contexto izquierdo recomendado de 2 s o mas |
| Tipos de cuantizacion | 4-bit (esta version), 8-bit y bfloat16 (versiones alternativas del mismo autor de conversion) |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transductor RNNT, una arquitectura clásica de ASR que combina un encoder acústico, un predictor y una red conjunta para alinear secuencias de audio con tokens de texto. Según la información disponible, NVIDIA lo ha entrenado para operar tanto en modo offline como en streaming con un único conjunto de pesos, algo que tradicionalmente requería checkpoints separados. La conversión a MLX realizada por mlx-community aplica cuantización de 4 bits (grupo 64) a las capas Linear y Embedding, manteniendo el resto de pesos en bfloat16, lo que reduce el tamaño del repositorio a 0,5 GB.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste por preferencias. El mecanismo de streaming es destacable: cada paso re-codifica 5,6 segundos de contexto izquierdo junto con el fragmento nuevo y su contexto derecho, lo que permite latencias configurables entre 160 ms y 2,08 s. La model card advierte que mantener el contexto izquierdo en 2 segundos o más es importante, ya que por debajo de ese umbral NVIDIA reporta degradación de la precisión.

## Capacidades

- Transcripción de voz a texto en modo offline para audio completo.
- Transcripción en streaming con latencias configurables entre 160 ms y 2,08 s.
- Salida con puntuación y capitalización automáticas.
- Soporte de 25 idiomas europeos: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano.
- Entrada de audio a 16 kHz mono, con duración mínima de 80 ms.
- Sesiones de streaming programáticas mediante `create_streaming_session` en Python (mlx-audio) y `makeStreamSession` en Swift (mlx-audio-swift).
- No se menciona soporte de tool calling, agentes, visión, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede procesar audio completo en modo offline en un Mac con Apple Silicon, sin enviar datos a la nube, gracias a su tamaño de 472 MB en 4 bits y su soporte de 25 idiomas europeos.
- Subtitulado en directo de baja latencia: con sesiones de streaming a 320 ms de latencia y contexto izquierdo de 2 s o más, es adecuado para generar subtítulos en tiempo real en aplicaciones de videoconferencia o retransmisión.
- Dictado por voz en aplicaciones de escritorio: la integración mediante mlx-audio-swift permite incorporar dictado en apps nativas de macOS o iOS, con la ventaja de que el modelo cabe en memoria de un portátil con chip M1 Pro o superior.
- Asistentes de voz para atención al cliente: la transcripción en streaming con puntuación y capitalización facilita alimentar pipelines de comprensión del lenguaje natural en centros de contacto multilingües europeos.
- Indexación y búsqueda de archivos de audio: la transcripción offline de grandes volúmenes de grabaciones permite generar transcripciones buscables en archivos de podcasts, entrevistas o archivos periodísticos en cualquiera de los 25 idiomas soportados.
- Accesibilidad para personas con discapacidad auditiva: la generación de subtítulos en tiempo real con latencias de 160 ms a 2 s permite ofrecer transcripción en vivo en eventos, clases o reuniones, con la ventaja de ejecutarse localmente sin depender de servicios externos.
- Procesamiento por lotes en pipelines de datos: la versión 4-bit reduce el uso de memoria, lo que permite ejecutar varias instancias en paralelo en un solo equipo para transcribir lotes de audio de forma eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER) para esta conversión MLX en la información disponible. La model card indica explícitamente que las tablas de WER de NVIDIA (offline y streaming, FLEURS, MCV, MLS y conjuntos Open ASR en inglés) corresponden al modelo bf16 de NeMo, no a esta conversión.

Los datos de rendimiento disponibles son los siguientes:

| Metrica | Valor |
|---|---|
| Paridad con NeMo 3.1 (port mlx-audio, float32) | frames del encoder dentro de 8,2e-6 de NeMo; mismos tokens en configuraciones 5,6 s / 80 ms / 240 ms, 0,8 s / 80 ms / 240 ms y 0,8 s / 160 ms / 400 ms |
| Paridad con NeMo (port Swift, bfloat16) | texto de NeMo en 10 de 12 clips (3 ediciones de palabra en 355 palabras) |
| WER en streaming a 320 ms (conjunto de dictado en inglés y francés, 260 clips, 8-bit) | 6,5 % de WER en palabras no terminológicas; recall de términos del 60,7 % |
| Comparativa con `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit` (mismo conjunto) | 55,5 % de recall de términos y 11,7 % de WER |
| Tiempo medio por paso de 80 ms en M1 Pro (Swift, latencia 320 ms, layout 5,6 s / 80 ms / 240 ms) | 8-bit: 68,6 ms; 4-bit: 68,7 ms; bf16: 64,8 ms |
| Con activaciones float16 | 57,4 ms por paso (16 % de ahorro), misma precisión |
| Chunk de 160 ms con 160 ms de contexto derecho (misma latencia) | 34,7 ms por paso en GPU; +0,6 puntos de WER en FLEURS |
| Con activaciones float16 y chunk de 160 ms | 26,9 ms por paso y 896 MB de memoria pico, estable durante 30 minutos |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 472 MB para los pesos en 4 bits; la model card reporta 896 MB de memoria pico en el escenario de streaming con chunk de 160 ms y activaciones float16.
- GPU recomendadas: Apple Silicon (M1 Pro o superior según las pruebas reportadas). No se dispone de datos para GPU NVIDIA, AMD u otras.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; el modelo está diseñado para MLX, por lo que no se ha validado en GPU de consumo NVIDIA en la información disponible.
- Opciones de despliegue: mlx-audio (Python) y mlx-audio-swift (Swift). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en un M1 Pro con Swift, entre 26,9 ms y 68,7 ms por paso de 80 ms según configuración; latencia de streaming configurable entre 160 ms y 2,08 s. La cuantización ahorra memoria, no tiempo, ya que el paso está limitado por cómputo a 75 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Latencia streaming | Licencia | Formato |
|---|---|---|---|---|---|
| nemotron-labs-unified-asr-0.6b-4bit (esta ficha) | 626,7 M | 25 europeos | 160 ms - 2,08 s | OpenMDW 1.1 | safetensors (MLX) |
| nemotron-labs-unified-asr-0.6b (bf16, NVIDIA) | 626,7 M | 25 europeos | 160 ms - 2,08 s | OpenMDW 1.1 | NeMo |
| nemotron-3.5-asr-streaming-0.6b-8bit (mlx-community) | no disponible | no disponible | no disponible | no disponible | safetensors (MLX) |
| nemotron-labs-unified-asr-0.6b-8bit (T0mSIlver) | 626,7 M | 25 europeos | 160 ms - 2,08 s | OpenMDW 1.1 | safetensors (MLX) |

En el conjunto de dictado en inglés y francés de 260 clips, esta conversión obtiene un 60,7 % de recall de términos y un 6,5 % de WER en el resto de palabras, frente al 55,5 % y 11,7 % respectivamente de `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit`. No se dispone de datos comparativos con otros modelos ASR de la competencia en la información proporcionada.

## Limitaciones y advertencias

- El idioma debe pasarse explícitamente: en modo `auto` y con baja latencia, el modelo puede emitir los primeros tokens en un idioma incorrecto, según advierte la model card de NVIDIA.
- El contexto izquierdo debe mantenerse en 2 segundos o más; por debajo de ese umbral NVIDIA reporta degradación de la precisión.
- Las tablas de WER publicadas por NVIDIA corresponden al modelo bf16 de NeMo, no a esta conversión MLX, por lo que no deben tomarse como referencia directa para esta versión.
- La cuantización a 4 bits reduce memoria pero no mejora la velocidad, ya que el paso de streaming está limitado por cómputo.
- No se dispone de información sobre sesgos lingüísticos específicos, riesgo de alucinación en transcripción ni comportamiento en acentos no nativos o audio con ruido.
- La licencia OpenMDW 1.1 es la del modelo original; los pesos convertidos son una obra derivada de NVIDIA y su uso se rige por el acuerdo OpenMDW 1.1. Se recomienda revisar los términos para uso comercial.
- El modelo está orientado exclusivamente a ASR; no soporta otras tareas multimodales ni generación de texto general.
- La entrada debe ser audio mono a 16 kHz con duración mínima de 80 ms; no se especifican requisitos para otros formatos o frecuencias de muestreo.
- No hay datos de despliegue en GPU NVIDIA u otras plataformas distintas de Apple Silicon para esta conversión MLX.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/mlx-community/nemotron-labs-unified-asr-0.6b-4bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Conversión bf16 alternativa: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16
- Conversión 8-bit alternativa: https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit
- Modelo comparable en streaming de mlx-community: https://huggingface.co/mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
