# lazarenkod/sortformer-ru-streaming-coreml

## Resumen

Sortformer-ru-streaming-coreml es una adaptación al ruso del modelo de diarización de hablantes en streaming de NVIDIA, `nvidia/diar_streaming_sortformer_4spk-v2.1`, publicada por el desarrollador Dmitry Lazarenko (usuario `lazarenkod` en Hugging Face). El modelo original resuelve la segmentación de hablantes ("quién habla cuándo") en tiempo real con cuatro ranuras de hablante y aproximadamente un segundo de latencia de salida; esta versión añade un ajuste fino sobre reuniones simuladas en ruso y una conversión a Core ML para su ejecución en Apple Silicon, concretamente para la aplicación Promises.

El interés de esta ficha es doble. Por un lado, demuestra un flujo de trabajo reproducible para adaptar un modelo de diarización en streaming a un idioma concreto usando datos sintéticos generados a partir de voces reales (Common Voice ruso), respuestas al impulso de sala de OpenSLR 28 y ruido de MUSAN. Por otro lado, ilustra el empaquetado de un pipeline completo de diarización (extracción de características mel, caché de hablantes, FIFO y salida de probabilidades por hablante) en un artefacto Core ML listo para integrarse en aplicaciones nativas de macOS e iOS.

La relevancia es acotada pero concreta: no es un modelo de propósito general ni un LLM, sino un componente especializado de un pipeline de audio. Su utilidad depende de que el despliegue objetivo sea Apple Silicon y de que el caso de uso tolere las limitaciones declaradas por el autor, en particular que la mejora en ruso se ha medido únicamente sobre reuniones simuladas y no sobre reuniones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (transformer de diarización en streaming con ranuras de hablante ordenadas), base `nvidia/diar_streaming_sortformer_4spk-v2.1` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventana de streaming con chunk 6, contexto izquierdo 1, contexto derecho 7, FIFO 188, caché de hablantes 188, periodo de actualización 144 (configuración "balanced v2.1") |
| Tipos de cuantizacion | no disponible (pesos convertidos a Core ML; precisión del artefacto no especificada) |
| Idiomas soportados | ruso (idioma de ajuste fino); el modelo base es multilingüe pero no se detallan los idiomas cubiertos |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | Core ML (`SortformerPipeline.mlmodelc` compilado) |

## Arquitectura y entrenamiento

El modelo es un Sortformer, una arquitectura de diarización basada en transformer que procesa audio en streaming y produce, para cada trama, probabilidades de actividad por hablante sobre un número fijo de ranuras (cuatro en este caso). El pipeline empaquetado en Core ML incluye la extracción de características mel, la gestión de la caché de hablantes y la cola FIFO, y devuelve directamente las probabilidades de hablante. La configuración utilizada es "balanced v2.1", con chunk 6, contexto izquierdo 1, contexto derecho 7, FIFO 188, caché de hablantes 188 y periodo de actualización 144. La conversión sigue el proyecto FluidInference/mobius (Apache-2.0) y está pensada para ejecutarse con el bucle de streaming de FluidAudio mediante `SortformerModels(config: .balancedV2_1, main: MLModel)`.

El ajuste fino consistió en 54 pasos con lotes de 12 segmentos de 90 segundos, tasa de aprendizaje 5e-5, precisión bf16 y un total de 75 minutos de cómputo, usando el propio pase de streaming y la función de pérdida del modelo en NeMo. Los datos de entrenamiento son reuniones simuladas generadas al vuelo a partir de 497 voces rusas de la partición de entrenamiento de Common Voice (16 horas), con 2 a 4 hablantes por segmento de 90 segundos, solapamiento del 10 al 35 %, respuestas al impulso de sala de OpenSLR 28, ruido de MUSAN y un 15 % de banda telefónica. Para mitigar el olvido catastrófico, el 25 % de los segmentos de entrenamiento son ventanas de reuniones reales: reuniones de entrenamiento de AMI (CC BY 4.0) y grabaciones de test de VoxConverse. Los conjuntos de evaluación no se usaron en entrenamiento y las voces simuladas de evaluación son disjuntas de las de entrenamiento.

## Capacidades

- Diarización de hablantes en streaming con cuatro ranuras de hablante fijas, tal como el modelo original.
- Salida de probabilidades de actividad por hablante y trama, apta para post-procesado posterior (segmentación, asignación de etiquetas, cálculo de tiempos de habla).
- Latencia de salida de aproximadamente un segundo, según la model card del modelo base.
- Procesamiento de audio con solapamiento de habla (el entrenamiento cubre solapamientos del 10 al 35 %).
- Robustez frente a ruido de fondo, reverberación de sala y banda telefónica, incorporada explícitamente en el entrenamiento sintético.
- Ejecución nativa en Apple Silicon mediante Core ML, sin dependencia de GPUs NVIDIA en inferencia.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, visión ni audio más allá de la diarización.

## Casos de uso

- Transcripción con etiquetas de hablante en aplicaciones de notas de reuniones para macOS e iOS: el pipeline Core ML produce probabilidades por hablante que se pueden alinear con la salida de un motor ASR para atribuir cada frase a su interlocutor, con la ventaja de ejecutarse en local y sin enviar audio a la nube.
- Diarización en directo durante videollamadas o grabaciones de voz en Apple Silicon: la latencia de salida de aproximadamente un segundo permite mostrar indicadores de "hablante activo" en tiempo casi real, siempre que se acepten las cuatro ranuras del modelo.
- Indexación y búsqueda de archivos de audio rusos: segmentar grabaciones por hablante antes de generar transcripciones permite buscar "qué dijo esta persona" en archivos de entrevistas, pódcast o reuniones internas.
- Análisis de reuniones simuladas y generación de datos sintéticos: el propio flujo de entrenamiento (Common Voice, OpenSLR 28, MUSAN) es reutilizable para construir corpus de evaluación de diarización en ruso con condiciones controladas de solapamiento y ruido.
- Prototipado de productos de accesibilidad: subtitulado en vivo con identificación de interlocutor en entornos con pocos participantes, aprovechando la ejecución local en dispositivos Apple.
- Investigación en adaptación de dominio e idioma: sirve como referencia reproducible de ajuste fino de un Sortformer con datos sintéticos y de conversión a Core ML, útil para equipos que quieran replicar el proceso con otros idiomas o dominios.
- Evaluación comparativa de motores de diarización: al estar empaquetado como artefacto Core ML independiente, se puede integrar en bancos de pruebas que comparen latencia y DER frente a alternativas basadas en servidor.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden DER (Diarization Error Rate) con collar de 0,25 y solapamiento puntuado, con una ejecución Core ML por conjunto:

| Conjunto | v2.1 original (mismo conversor) | Este modelo |
|---|---|---|
| Simulación rusa, 15 reuniones | 15,6 | 11,0 |
| Simulación rusa, 30 reuniones (voces de dev) | 17,9 | 13,7 |
| VoxConverse, 14 grabaciones | 9,1 | 9,7 |
| AMI EN2002b / ES2004a | 33,1 / 28,8 | 29,0 / 25,5 |

## Requisitos de hardware

- El artefacto está compilado para Core ML y se ejecuta en Apple Silicon (macOS e iOS); no se proporcionan requisitos de VRAM ni de GPU NVIDIA para inferencia.
- El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo compacto que cabe holgadamente en la memoria unificada de cualquier Mac con chip Apple Silicon.
- No se especifican modelos concretos de chip (M1, M2, M3, M4) ni cantidades mínimas de memoria unificada.
- El despliegue previsto es mediante el bucle de streaming de FluidAudio (`SortformerModels(config: .balancedV2_1, main: MLModel)`) sobre el `SortformerPipeline.mlmodelc` compilado.
- No se han publicado datos de latencia ni de throughput medidos en una llamada en vivo; el autor indica explícitamente que la latencia y el consumo energético en vivo no se han medido.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Ranuras de hablante | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lazarenkod/sortformer-ru-streaming-coreml` | Sortformer en streaming, ajustado a ruso | 4 | Ruso | Core ML | NVIDIA Open Model License | Hugging Face, 0 descargas |
| `nvidia/diar_streaming_sortformer_4spk-v2.1` | Sortformer en streaming (modelo base) | 4 | Multilingüe (no detallado) | no disponible en la información proporcionada | NVIDIA Open Model License | Hugging Face |
| `FluidInference/diar-streaming-sortformer-coreml` | Sortformer en streaming convertido a Core ML | no disponible | no disponible | Core ML | no disponible | Hugging Face, ~2,42 mil descargas |

## Limitaciones y advertencias

- La mejora en ruso se ha medido únicamente sobre reuniones simuladas construidas con voces del mismo tipo que las de entrenamiento (aunque disjuntas); el autor advierte que probablemente sobreestima el rendimiento en reuniones rusas reales y que no se ha evaluado ninguna reunión real en ruso.
- No se han medido reuniones con más de cuatro hablantes, reuniones de más de cinco minutos, ni la latencia y el consumo energético en una llamada en vivo.
- Cada cifra de la tabla de resultados corresponde a una sola ejecución; el autor señala que AMI ES2004b varía más de 10 puntos entre ejecuciones del mismo modelo, lo que indica una alta varianza en la evaluación.
- El modelo mantiene cuatro ranuras de hablante, igual que el original; no escala a reuniones con más participantes sin trabajo adicional.
- En VoxConverse el ajuste fino empeora ligeramente el DER (de 9,1 a 9,7), lo que sugiere un cierto coste en el dominio original en inglés.
- La licencia es la NVIDIA Open Model License, no una licencia de código abierto permisiva; el uso comercial está sujeto a los términos de dicho acuerdo, que el autor identifica como el archivo `LICENSE` del repositorio.
- Riesgo de alucinación no aplica en el sentido habitual de los modelos generativos, pero sí existe riesgo de asignaciones erróneas de hablante en tramas ambiguas, especialmente con solapamiento y ruido.
- El modelo está especializado en ruso y no se documentan otros idiomas soportados tras el ajuste fino.
- El repositorio no tiene descargas ni valoraciones, por lo que no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/sortformer-ru-streaming-coreml
- Modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Perfil del autor: https://huggingface.co/lazarenkod
- Conversión Core ML de referencia (FluidInference/mobius): https://github.com/FluidInference/mobius
- Bucle de streaming (FluidInference/FluidAudio): https://github.com/FluidInference/FluidAudio
- Modelo Core ML relacionado: https://huggingface.co/FluidInference/diar-streaming-sortformer-coreml
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- AMI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/
- Artículo de VoxConverse (arXiv:2007.01216): https://arxiv.org/abs/2007.01216
