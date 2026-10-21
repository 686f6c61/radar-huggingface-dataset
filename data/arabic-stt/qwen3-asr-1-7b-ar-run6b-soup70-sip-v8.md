# Arabic-STT/qwen3-asr-1.7b-ar-run6b-soup70-sip-v8

## Resumen

`qwen3-asr-1.7b-ar-run6b-soup70-sip-v8` es un ajuste fino del modelo `Qwen/Qwen3-ASR-1.7B` publicado por el usuario Arabic-STT y orientado al reconocimiento automático de voz (ASR) en árabe e inglés. El repositorio declara el pipeline `automatic-speech-recognition` y lleva las etiquetas `arabic` y `call-center`, lo que apunta a un entrenamiento sobre audio de atención al cliente; el sufijo «soup70» del nombre sugiere una combinación de puntos de control (model soup), extremo que la información disponible no documenta.

Los tensores safetensors suman 2.038.052.480 parámetros (unos 2,04 millardos, por encima de los 1,7B que indica el nombre del modelo base) y el repositorio ocupa 4,2 GB, un tamaño coherente con pesos almacenados en bf16/fp16. El modelo no registra descargas ni «likes», el acceso está restringido (gated) y la licencia figura como «other», sin texto legal visible en los metadatos.

Su relevancia práctica es limitada por ahora: no se ha publicado model card con detalles de entrenamiento, datos, ventana de audio, benchmarks ni requisitos, y la búsqueda web no devolvió ninguna fuente relacionada con este modelo. Cualquier evaluación debe hacerse por prueba directa sobre el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; derivada de Qwen3-ASR (familia Qwen3), pipeline `automatic-speech-recognition` |
| Parametros totales | 2.038.052.480 (≈2,04 B) según safetensors |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible (ventana de audio no documentada) |
| Tipos de cuantizacion | No disponible; el repo contiene pesos en `safetensors`, presumiblemente bf16/fp16 (4,2 GB para 2,04 B parámetros) |
| Idiomas soportados | Árabe (`ar`) e inglés (`en`) |
| Licencia | `other` (texto no disponible); acceso restringido (gated) |
| Formato de pesos | `safetensors` |
| Modelo base | `Qwen/Qwen3-ASR-1.7B` (fine-tune) |
| Tarea declarada | Reconocimiento automático de voz |
| Tamano del repositorio | 4,2 GB |
| Acceso | Restringido: requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 2026-10-21 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. Al ser un fine-tune de `Qwen/Qwen3-ASR-1.7B`, hereda la topología de esa familia (modelo de reconocimiento de voz de la serie Qwen3), pero el repositorio no incluye model card, configuración ni paper que detallen el codificador de audio, el decodificador de texto, la política de atención ni la longitud máxima de audio procesable. Tampoco se documenta si el ajuste modificó el tokenizador, el vocabulario o el cabezal de salida.

Respecto al entrenamiento, se desconoce por completo el volumen de datos, la composición del corpus, el número de tokens o de horas de audio, el uso de RLHF/DPO y las técnicas de aumento de datos. Las únicas pistas son las etiquetas del repositorio (`arabic`, `call-center`, `ar`, `en`) y el propio nombre del checkpoint: «run6b» sugiere una ejecución de entrenamiento concreta, «soup70» apunta a un promedio de pesos con un 70 % de algún componente y «sip-v8» a una octava iteración de un procedimiento no descrito. Todo ello son inferencias a partir del identificador, no hechos confirmados.

## Capacidades

- Transcripción de voz a texto en árabe y en inglés, según los idiomas declarados en el repositorio.
- Procesamiento de audio orientado a conversaciones de atención al cliente, a tenor de la etiqueta `call-center`.
- Posible manejo de habla espontánea y ruido telefónico: no confirmado documentalmente.
- Cambio de código árabe/inglés dentro de una misma locución: plausible por la combinación de idiomas, pero no documentado.
- Marcas de tiempo, diarización de hablantes, puntuación o detección de idioma por segmento: no disponible.
- Tool calling, function calling, razonamiento multi-paso o modo «thinking»: no aplica a un modelo ASR y no se documenta ninguna capacidad de este tipo.
- Generación de texto libre, visión, audio generativo o matemáticas: no disponible; el modelo está especializado en transcripción.

## Casos de uso

- Transcripción de llamadas de atención al cliente en árabe: el modelo puede convertir grabaciones de contact center en texto para auditoría de calidad, análisis de motivos de llamada y cumplimiento normativo. Es el escenario que sugiere la etiqueta `call-center` y el ajuste específico del checkpoint.
- Subtitulado y post-producción de contenido audiovisual en árabe: generación de subtítulos para vídeo formativo, institucional o divulgativo, revisando manualmente la salida al no haber métricas publicadas de precisión.
- Enrutamiento automático de llamadas: transcripción en tiempo (o cuasi tiempo) real de los primeros segundos de una llamada para clasificar la intención del cliente y dirigirla al departamento adecuado, siempre que la latencia medida en pruebas propias sea aceptable.
- Búsqueda sobre archivos de audio: indexación de horas de grabaciones para permitir búsquedas por palabra clave o por frase, útil en departamentos legal y de recursos humanos que necesitan localizar menciones concretas.
- Análisis de sentimiento y extracción de entidades sobre conversaciones: la transcripción sirve como entrada a un pipeline posterior de NLP (por ejemplo, un LLM de texto) para detectar reclamaciones, productos mencionados o riesgo de cancelación.
- Atención al cliente bilingüe árabe/inglés: transcripción de conversaciones con mezcla de idiomas en mercados del Golfo o comunidades bilingües, con verificación previa de que el modelo realmente soporta el cambio de código.
- Generación de actas y resúmenes de reuniones en árabe: transcripción de reuniones internas que después se resumen con otro modelo; requiere comprobar la calidad en audio de sala, no telefónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de WER (word error rate) sobre conjuntos como Common Voice, MGB, FLEURS ni sobre corpus de call center, ni comparaciones con el modelo base `Qwen3-ASR-1.7B` o con Whisper. Tampoco hay métricas de latencia, RTF (real-time factor) ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 4,1 GB solo para pesos (2,04 B × 2 bytes), más overhead de activaciones y del codificador de audio; presupuesto realista de 6-8 GB para una ventana de audio moderada. Cálculo propio a partir del número de parámetros, no publicado por el autor.
- Cuantización INT8: pesos ≈2 GB, con un presupuesto total de 3-4 GB de VRAM (estimación).
- Cuantización INT4: pesos ≈1,1-1,3 GB, con un presupuesto total de 2-3 GB de VRAM (estimación). No hay ficheros GGUF publicados, por lo que habría que generarlos.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, L40S, A10G). Para despliegues con muchas peticiones concurrentes, A100 40/80 GB o H100 permiten batchear audio largo.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 8-12 GB y en cuantización INT8/INT4 en tarjetas de 4-6 GB, en ambos casos con pruebas previas porque no hay requisitos oficiales.
- Opciones de despliegue: `transformers` es la vía más segura dada la clase `qwen3_asr`; vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura y requerirían verificación. La conversión a GGUF para llama.cpp no está disponible de forma oficial.
- Latencia y throughput: no disponible. No se han publicado medidas de RTF ni de audio procesado por segundo.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de conocimiento general de la familia y no de la información proporcionada; verifíquelos antes de usarlos en una decisión de producción.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-asr-1.7b-ar-run6b-soup70-sip-v8` | 2,04 B | No disponible | ar, en | `other` (texto no disponible) | Gated, 0 descargas |
| `Qwen/Qwen3-ASR-1.7B` (base) | ≈1,7 B (según el nombre) | No disponible | Multilingüe (no verificado) | No disponible en la información dada | Público |
| Whisper large-v3 | 1,55 B | 30 s por ventana | ~99 idiomas | MIT | Público |
| Whisper medium | 769 M | 30 s por ventana | ~99 idiomas | MIT | Público |

Frente al modelo base, este checkpoint añade especialización declarada en árabe y call center, pero pierde trazabilidad: no hay métricas que demuestren mejora sobre el base, el acceso es restringido y la licencia no es clara. Frente a Whisper, la ventaja potencial es la especialización en árabe conversacional; la desventaja es la ausencia total de benchmarks, de licencia definida y de ecosistema de despliegue conocido.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, ficha técnica, paper ni informe de evaluación; no es posible justificar su uso en producción sin una evaluación propia.
- Licencia `other` sin texto visible y acceso gated: es imprescindible revisar las condiciones antes de cualquier uso comercial; el modelo base Qwen suele publicarse bajo licencias permisivas, pero la del fine-tune no se puede asumir.
- Riesgo de alucinación en la transcripción: como todo modelo ASR de tipo seq2seq, puede generar texto plausible que no corresponde al audio, especialmente con ruido, acentos no vistos o solapamiento de hablantes.
- Cobertura lingüística limitada a árabe e inglés: otras lenguas, incluidos dialectos no representados en el corpus de ajuste, quedan fuera de las capacidades declaradas.
- Sesgo probable hacia el dominio de call center: el ajuste puede degradar el rendimiento en audio de reuniones, podcasts, medios de comunicación o dictado, y no hay datos para cuantificarlo.
- Sin información sobre dialectos árabes cubiertos (egipcio, levantino, del Golfo, magrebí): la etiqueta `arabic` no distingue entre árabe estándar moderno y variedades dialectales.
- Nombre del checkpoint no trazable: «run6b», «soup70» y «sip-v8» aluden a un pipeline interno del autor sin documentar; no hay garantía de reproducibilidad.
- Cero descargas y cero interacciones: no existe comunidad, issues ni informes de terceros que permitan anticipar fallos.
- Sin garantías de soporte en frameworks de inferencia de alto rendimiento: la integración en vLLM o TGI no está confirmada, lo que puede limitar el throughput en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Arabic-STT/qwen3-asr-1.7b-ar-run6b-soup70-sip-v8 (acceso restringido, requiere aceptar condiciones)
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paper, blog, repositorio o demo del fine-tune: no disponible
- Resultados de la búsqueda web: no se encontró ninguna fuente relacionada con el modelo; los resultados devueltos correspondían a teclados y recursos genéricos de lengua árabe, sin relación con este checkpoint.
