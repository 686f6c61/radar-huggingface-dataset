# silentvalet/whisper-turbo-ro-en-sherpa-onnx

## Resumen

`silentvalet/whisper-turbo-ro-en-sherpa-onnx` es una conversión al formato ONNX del modelo `eek/whisper-turbo-ro-en`, un Whisper large-v3-turbo afinado por Radu-Sebastian Amarie para reconocimiento automático del habla en rumano e inglés. El trabajo de `silentvalet` no modifica los pesos ni el comportamiento del modelo: únicamente adapta el checkpoint de Hugging Face al layout que consume sherpa-onnx y aplica cuantización int8 dinámica sobre las operaciones MatMul, reduciendo el repositorio a 1,0 GB.

El interés de esta ficha es práctico: permite ejecutar un Whisper turbo bilingüe rumano-inglés en entornos de inferencia locales y ligeros (CPU, dispositivos embebidos, aplicaciones de escritorio o móviles) sin depender de PyTorch ni de los pesos en precisión completa. Whisper large-v3-turbo es una variante destilada del decoder de large-v3 que reduce el número de capas del decodificador y, con ello, el coste de inferencia, manteniendo la ventana de audio de 30 segundos por pasada.

La relevancia actual del modelo es doble: por un lado, cubre un par de idiomas poco atendido en modelos ASR de calidad (rumano junto a inglés); por otro, su empaquetado en sherpa-onnx lo hace desplegable con una única CLI o mediante las bindings de la librería, sin infraestructura GPU. La licencia MIT del modelo fuente y de la conversión facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX con grafo estático para sherpa-onnx |
| Parametros totales | no disponible (el modelo base es Whisper large-v3-turbo; el número exacto de parámetros no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de inferencia (característica de Whisper); contexto de texto no aplica |
| Tipos de cuantizacion | int8 dinámica sobre operaciones MatMul (única variante publicada en el repo) |
| Idiomas soportados | rumano (ro), inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx`) más fichero de tokens (`turbo-tokens.txt`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un encoder Transformer que procesa espectrogramas log-Mel de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atención cruzada entre ambos. La variante *turbo* reduce el número de capas del decoder respecto a large-v3, lo que disminuye la latencia de decodificación a costa de una pérdida moderada de precisión en tareas difíciles. El modelo fuente `eek/whisper-turbo-ro-en` es un ajuste fino del checkpoint turbo sobre datos de rumano e inglés, en su versión 4 (`ft-w12`), según indica la model card.

La conversión realizada por `silentvalet` parte del commit `dc8a7dccda4981b5b1db498c126f300ee1f8f8a6` del modelo fuente, mapea el checkpoint al layout de openai-whisper y ejecuta el script `scripts/whisper/export-onnx.py` de sherpa-onnx v1.13.8 con opset 17 y cuantización int8 dinámica de MatMul. No se documentan en la información disponible los detalles del dataset de ajuste fino (número de horas, composición, uso de RLHF o aumentación de datos), por lo que no es posible evaluar la calidad del entrenamiento original a partir de esta ficha.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en rumano e inglés.
- Transcripción de audio de 16 kHz mono en WAV, procesado en ventanas de 30 segundos.
- Detección y transcripción bilingüe dentro del mismo pipeline (el idioma se fija con `--whisper-language` o se deja a la detección automática de Whisper).
- Ejecución sin GPU mediante el runtime ONNX de sherpa-onnx.
- Integración en aplicaciones C++, Python, C#, Java, Kotlin, Swift y otras bindings de sherpa-onnx.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción; es un modelo ASR puro.

## Casos de uso

- Subtitulado automático de vídeo en rumano e inglés: el modelo transcribe pistas de audio de 16 kHz y genera segmentos con marcas temporales mediante las utilidades de sherpa-onnx, adecuado para canales bilingües o contenido educativo.
- Transcripción de reuniones y llamadas: al ejecutarse en CPU, puede desplegarse en servidores modestos o en el propio portátil del usuario, evitando enviar audio confidencial a servicios en la nube.
- Atención al cliente con grabaciones: transcripción por lotes de llamadas en centros de contacto rumanos o mixtos rumano-inglés para análisis de calidad y búsqueda posterior sobre el texto.
- Aplicaciones de escritorio y móviles offline: el tamaño de 1,0 GB en int8 y la ausencia de dependencia de PyTorch permiten empaquetar el modelo en apps de notas de voz o dictado sin conexión.
- Investigación lingüística y corpus: generación de transcripciones a escala para estudios de fonética, sociolingüística o construcción de datasets de habla rumana, con la ventaja de una licencia MIT.
- Accesibilidad: subtitulado en tiempo casi real de eventos o clases presenciales en entornos con recursos limitados, usando sherpa-onnx sobre CPU.
- Preprocesado de pipelines de NLP: conversión de archivos de audio a texto para alimentar sistemas de búsqueda, resumen o moderación en inglés y rumano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante int8, que está pensada para ejecución en CPU; en GPU, el modelo cabe holgadamente en tarjetas con 4-6 GB, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un modelo ONNX int8, el uso de GPU no es el escenario principal.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) puede ejecutarlo, aunque el diseño apunta a CPU.
- Opciones de despliegue: sherpa-onnx (CLI `sherpa-onnx-offline` y bindings), ONNX Runtime; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR.
- Latencia y throughput: no disponibles; dependen del hardware y de la duración del audio. La ventana fija de 30 segundos de Whisper marca el coste por pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| silentvalet/whisper-turbo-ro-en-sherpa-onnx | no disponible (base: Whisper large-v3-turbo) | 30 s por ventana | ro, en | MIT | ONNX int8 |
| eek/whisper-turbo-ro-en | no disponible (mismo base) | 30 s por ventana | ro, en | MIT | safetensors (Hugging Face) |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s por ventana | multilingüe (≈99 idiomas) | MIT | safetensors, ONNX |
| whisper-small (openai) | no disponible en la información | 30 s por ventana | multilingüe | MIT | safetensors, ONNX |

La comparación relevante es con el modelo fuente (mismos pesos, distinto formato) y con el Whisper turbo original de OpenAI (más idiomas, pero sin ajuste específico a rumano). No se dispone de métricas de WER comparativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre rumano e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- La cuantización int8 puede introducir una degradación menor de precisión frente al modelo en punto flotante; no se documenta su magnitud.
- Whisper procesa audio en ventanas de 30 segundos, lo que puede generar errores en los límites de segmentos largos y requiere lógica de solapamiento o segmentación.
- Riesgo de alucinación en audio con ruido, silencios prolongados o habla no inteligible, comportamiento conocido de la familia Whisper.
- No se documentan sesgos específicos del ajuste fino rumano-inglés; al ser un modelo entrenado sobre datos no descritos, no es posible evaluar sesgos de género, acento o registro.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso ni validación independiente.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales si el uso es comercial a gran escala.
- El modelo no incluye puntuación ni diarización propias más allá de lo que Whisper genera; para hablantes múltiples se necesitan componentes adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silentvalet/whisper-turbo-ro-en-sherpa-onnx
- Modelo base: https://huggingface.co/eek/whisper-turbo-ro-en
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportación a ONNX de sherpa-onnx: `scripts/whisper/export-onnx.py` (incluido en el repositorio anterior)
- Whisper de OpenAI (referencia de la arquitectura): https://github.com/openai/whisper
