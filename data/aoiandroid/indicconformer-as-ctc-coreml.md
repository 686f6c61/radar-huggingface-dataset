# aoiandroid/indicconformer-as-ctc-coreml

## Resumen

IndicConformer_as_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) IndicConformer de AI4Bharat, en su variante híbrida CTC+RNNT de tamaño *large* entrenada para asamés. El autor de la conversión es aoiandroid, que publica el artefacto en formato Core ML (`.mlpackage`) para su uso en dispositivos Apple a través del framework Core ML. El modelo original está desarrollado por AI4Bharat (IIT Madras) y forma parte de la familia IndicConformer, orientada a lenguas de la India.

El problema que resuelve es la transcripción de audio en asamés en local, sin depender de servicios en la nube, gracias a un *frontend* log-mel fusionado dentro del grafo Core ML y una ventana de 10 segundos. La conversión corta la cabeza CTC para dejar únicamente los tokens del asamés, lo que reduce el tamaño del vocabulario de salida y el coste de inferencia en el dispositivo.

La relevancia es acotada: se trata de un artefacto derivado, sin descargas ni *likes* en el momento de la consulta, con un repositorio de 0,2 GB y sin model card detallada sobre rendimiento o entrenamiento. Es útil para desarrolladores que quieran ejecutar ASR en asamés dentro del ecosistema Apple (iOS, iPadOS, macOS) mediante Core ML, pero no aporta información nueva sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (híbrido CTC + RNNT en el modelo original; solo cabeza CTC en esta conversión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s (no es contexto textual) |
| Tipos de cuantizacion | no disponible (formato Core ML; precisión no especificada) |
| Idiomas soportados | asamés (`as`) |
| Licencia | MIT (AI4Bharat), según la model card |
| Formato de pesos | Core ML (`.mlpackage`), conversión desde NeMo |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo base IndicConformer es un Conformer, es decir, un transformer con convoluciones integradas en cada bloque, diseñado para ASR. La variante original `indicconformer_stt_as_hybrid_ctc_rnnt_large` combina dos cabezas de decodificación: CTC (Connectionist Temporal Classification) y RNNT (Recurrent Neural Network Transducer). Esta conversión conserva únicamente la cabeza CTC, recortada al vocabulario de tokens del asamés, y fusiona el *frontend* de extracción de características log-mel dentro del grafo Core ML. El resultado es un modelo autocontenido que acepta audio y devuelve la secuencia de tokens CTC.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus ni si hubo ajuste fino con RLHF o DPO. La conversión se realizó el 23 de noviembre de 2026 con el script `ic_coreml_convert.py`, usando NeMo 1.23.0 y coremltools 8.1, según la model card. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla en asamés a partir de audio de hasta 10 segundos por ventana.
- Extracción de características log-mel integrada en el propio modelo Core ML (no requiere preprocesado externo).
- Decodificación CTC, adecuada para transcripción en *streaming* por segmentos o por lotes.
- Ejecución en dispositivo mediante Core ML, sin llamadas a red.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: el vocabulario está recortado al asamés.
- No incluye *thinking mode*, visión ni audio generativo.

## Casos de uso

- Transcripción de notas de voz en asamés en apps de iOS y macOS: el modelo Core ML se integra en una app nativa y procesa segmentos de 10 s en local, sin enviar audio a servidores.
- Subtitulado offline de reuniones o entrevistas en asamés: se trocea el audio en ventanas de 10 s, se ejecuta el modelo por lotes y se concatenan las salidas CTC.
- Dictado por voz en aplicaciones de productividad para hablantes de asamés: la ventana corta y el *frontend* fusionado reducen la latencia percibida en la interfaz.
- Indexación y búsqueda de archivos de audio en asamés: se transcriben archivos con el modelo y se indexa el texto resultante con un motor de búsqueda local.
- Prototipado de asistentes de voz en dispositivos Apple: el artefacto sirve como componente ASR dentro de un pipeline mayor que incluya un LLM local para la respuesta.
- Evaluación comparativa de ASR en asamés: permite medir la calidad de la cabeza CTC frente a la variante híbrida completa en el mismo corpus.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva que consuman contenido en asamés, generando subtítulos en tiempo casi real en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; Core ML ejecuta en CPU, GPU o Neural Engine del dispositivo Apple.
- GPU recomendadas: no disponible; el modelo está pensado para hardware Apple (Neural Engine y GPU integrada), no para GPU de servidor.
- Cabe en hardware de consumo Apple: el repositorio ocupa 0,2 GB, por lo que es viable en iPhone, iPad y Mac recientes, aunque no se especifica la memoria en tiempo de ejecución.
- Opciones de despliegue: Core ML (Xcode, `coremltools`, Vision/Core ML APIs). No se distribuye en GGUF, safetensors ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto/ventana | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_as_CTC (esta conversión) | Conformer CTC | asamés | 10 s | MIT (modelo base) | Core ML |
| `ai4bharat/indicconformer_stt_as_hybrid_ctc_rnnt_large` | Conformer híbrido CTC+RNNT | asamés | no disponible | MIT | NeMo |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | 30 s | MIT | safetensors, GGUF, Core ML |
| Modelos ASR de AI4Bharat para otras lenguas indias | Conformer | lengua específica | no disponible | MIT | NeMo |

La comparación con Whisper es la más directa en cuanto a despliegue en Apple, pero Whisper cubre muchas más lenguas y tiene ecosistema de conversión a Core ML más maduro. La ventaja de esta conversión es el vocabulario recortado al asamés y el *frontend* fusionado, que simplifican la integración. No hay datos de precisión comparada.

## Limitaciones y advertencias

- Solo transcribe asamés; cualquier otro idioma producirá salidas incorrectas o vacías.
- Ventana fija de 10 s: audios más largos requieren troceado y concatenación, con riesgo de errores en las fronteras.
- Artefacto derivado sin model card completa: no hay información sobre parámetros, datos de entrenamiento ni evaluación.
- Sin descargas ni validación comunitaria en el momento de la consulta; la calidad de la conversión Core ML no está verificada de forma independiente.
- Riesgo de alucinación típico de ASR: el decodificador CTC puede generar tokens plausibles en segmentos con ruido o silencio.
- Sesgos: no documentados; dependerán del corpus de entrenamiento del modelo base, no descrito en esta ficha.
- Licencia: la model card indica MIT para el modelo base, pero conviene verificar los términos de AI4Bharat y de NeMo antes de uso comercial.
- No apta para producción crítica sin una evaluación propia sobre el dominio objetivo y sin pruebas de latencia en el dispositivo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoiandroid/indicconformer-as-ctc-coreml
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_as_hybrid_ctc_rnnt_large
- AI4Bharat: https://ai4bharat.iitm.ac.in/
- coremltools: https://github.com/apple/coremltools
- NeMo: https://github.com/NVIDIA/NeMo
