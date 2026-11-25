# MohammadBeigi/faster-whisper-large-v3-turbo-persian-int8

## Resumen

faster-whisper-large-v3-turbo-persian-int8 es una conversión a CTranslate2 con cuantización int8 del modelo givia/whisper-large-v3-turbo-persian, un ajuste fino de Whisper large-v3-turbo especializado en reconocimiento automático del habla en persa (farsi). Lo publica MohammadBeigi y su propósito es ofrecer una variante optimizada para inferencia con la librería faster-whisper, manteniendo los pesos del modelo base y reduciendo el espacio en disco de aproximadamente 1,6 GB en fp16 a unos 0,8 GB en int8.

El modelo resuelve el problema de desplegar ASR de calidad para persa en entornos con recursos limitados, especialmente en CPU, donde faster-whisper con cuantización int8 ofrece latencias razonables sin necesidad de GPU. Al derivar de Whisper large-v3-turbo, hereda la arquitectura encoder-decoder transformer del modelo original de OpenAI, con el ajuste fino persa del autor givia.

Es relevante para desarrolladores que necesiten transcripción de audio en persa dentro de pipelines de producción, ya que combina un formato de pesos directamente consumible por faster-whisper, licencia permisiva CC-BY-4.0 y un tamaño reducido que facilita el despliegue en contenedores y servicios de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CTranslate2 |
| Parametros totales | no disponible (deriva de Whisper large-v3-turbo; el dato no se especifica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se detalla en la informacion) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | persa (fa) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un reentrenamiento: toma los pesos de givia/whisper-large-v3-turbo-persian y los transforma a CTranslate2 con cuantización int8. La arquitectura subyacente es la de Whisper large-v3-turbo, un transformer encoder-decoder con atención estándar (no lineal) diseñado para transcripción de audio en ventanas de 30 segundos. El ajuste fino al persa proviene del modelo base de givia, sobre el que no se detallan en la información disponible el volumen de datos, la composición del corpus ni si hubo técnicas de alineación o RLHF.

La innovación técnica de esta variante es la conversión a CTranslate2, que permite ejecutar inferencia eficiente con faster-whisper, incluyendo decodificación con beam search (el autor reporta beam 5) y ejecución en CPU. La cuantización int8 reduce el peso del repositorio a 0,8 GB frente a 1,6 GB en fp16, sin cambios en los pesos más allá de la cuantización según indica el autor.

## Capacidades

- Reconocimiento automático del habla (ASR) en persa (farsi).
- Transcripción de audio con decodificación por beam search (beam 5 en la comprobación del autor).
- Ejecución en CPU mediante faster-whisper con compute_type int8.
- Manejo de puntuación y normalización de ZWNJ en la evaluación reportada (la métrica se calcula con puntuación eliminada y ZWNJ convertido a espacio).
- No se documentan capacidades de traducción, diarización, tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: no disponible; el modelo está orientado a persa.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo convierte audio en texto con WER reportado del 8,8% en FLEURS fa_ir, adecuado para actas y resúmenes posteriores en flujos internos.
- Subtitulado automático de vídeo en persa: la salida por segmentos de faster-whisper facilita generar ficheros de subtítulos con marcas temporales para plataformas de contenido.
- Atención al cliente en persa: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo y cumplimiento normativo, ejecutable en CPU para reducir costes de infraestructura.
- Indexación y búsqueda de archivos de audio: convertir grandes volúmenes de grabaciones persas a texto para alimentar motores de búsqueda o sistemas RAG, aprovechando el tamaño reducido (0,8 GB) para despliegues en contenedores.
- Investigación lingüística y corpus: generación de transcripciones para estudios de habla persa, con la ventaja de una licencia CC-BY-4.0 que permite su uso y adaptación con atribución.
- Prototipado y despliegue en dispositivos sin GPU: al ejecutarse en CPU con int8, sirve para demos, aplicaciones de escritorio o servicios edge donde no hay acelerador disponible.
- Accesibilidad: transcripción de contenido hablado en persa para personas con discapacidad auditiva, integrable en pipelines de publicación.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| WER | 8,8% | 60 clips de test FLEURS fa_ir, CPU, int8, beam 5, puntuación eliminada, ZWNJ→espacio |
| CER | 3,3% | Mismas condiciones que el WER |

No se han publicado otros resultados de benchmarks (por ejemplo, comparativas con Whisper large-v3 estándar u otros modelos ASR persas) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo pesa 0,8 GB en int8 y puede ejecutarse en CPU, por lo que la memoria necesaria es reducida (del orden de 1-2 GB en RAM para inferencia en CPU, estimación orientativa no confirmada por el autor).
- GPU recomendadas: no especificadas en la información disponible; al ser un modelo pequeño en int8, cualquier GPU con suficiente memoria podría ejecutarlo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: faster-whisper (librería principal, con compute_type="int8"); CTranslate2 como backend. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles; el autor solo reporta la configuración de la prueba (CPU, int8, beam 5) sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| faster-whisper-large-v3-turbo-persian-int8 (este) | no disponible | ventana Whisper (30 s) | persa | CC-BY-4.0 | CTranslate2 int8 | 0,8 GB, WER 8,8% en FLEURS fa_ir |
| givia/whisper-large-v3-turbo-persian | no disponible | ventana Whisper (30 s) | persa | no disponible en la informacion | safetensors/transformers (presumible) | Modelo base del que deriva este |
| openai/whisper-large-v3-turbo | no disponible | ventana Whisper (30 s) | multilingue | no disponible en la informacion | safetensors | Modelo original sin ajuste específico a persa |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que no se pueden establecer diferencias cuantitativas de WER/CER frente a alternativas.

## Limitaciones y advertencias

- El modelo está especializado únicamente en persa; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- No se documentan sesgos específicos, pero al derivar de Whisper puede heredar sesgos de los datos de entrenamiento originales y del ajuste fino.
- La ventana de audio es la propia de Whisper (30 s por segmento); no se detalla manejo de audio más largo más allá del troceado de faster-whisper.
- Licencia CC-BY-4.0: permite uso comercial y adaptación con atribución; es necesario citar al autor y mantener la licencia en obras derivadas.
- El rendimiento reportado (WER 8,8%) procede de solo 60 clips de FLEURS fa_ir con normalización agresiva (puntuación eliminada, ZWNJ→espacio); puede no reflejar el rendimiento en dominios reales con ruido o acentos diversos.
- No hay información sobre latencia ni throughput, por lo que la planificación de producción requiere pruebas propias.
- El repositorio tiene pocas descargas (33) y ningún like en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadBeigi/faster-whisper-large-v3-turbo-persian-int8
- Modelo base: https://huggingface.co/givia/whisper-large-v3-turbo-persian
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
