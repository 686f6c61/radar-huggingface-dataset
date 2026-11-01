# MarkL02/whisper-base-it-onnx-int8

## Resumen

whisper-base-it-onnx-int8 es una conversión a ONNX con cuantización int8 del modelo LocalAI-io/whisper-base-it-multi, un Whisper base de OpenAI afinado para reconocimiento de voz en italiano. Lo publica MarkL02 con el objetivo concreto de servir como fuente fija y verificable (checksums SHA-256 incluidos) para la aplicación PDL Voce, una app de voz offline italiano-inglés que se ejecuta en el navegador mediante transformers.js 4.x y ONNX Runtime Web. El modelo base fue entrenado por LocalAI-io sobre Common Voice 25, Multilingual LibriSpeech y VoxPopuli.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de despliegue ligero (0,1 GB de repositorio) para ASR italiano en el cliente, sin servidor ni conexión; por otro, ilustra un patrón de empaquetado reproducible con hashes por fichero y una optimización de decoder que reduce el tamaño de 80,1 MB a 53,6 MB sin alterar los logits. No es un modelo nuevo: es una redistribución cuantizada de un fine-tune existente.

Arquitectura transformer encoder-decoder de Whisper en su variante base, con licencia MIT y soporte exclusivo del idioma italiano. El modelo está pensado para inferencia en CPU de portátil con decodificación greedy, no para despliegues de alto throughput en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | no disponible (variante base de Whisper; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper base; el autor no la explicita) |
| Tipos de cuantizacion | uint8 dinámica en encoder y decoder fusionado |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx) más configs y tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es un Whisper base, es decir, un transformer encoder-decoder con atención completa para transcripción de audio a texto. El fine-tune lo realizó LocalAI-io sobre tres corpus: Common Voice 25, Multilingual LibriSpeech y VoxPopuli, lo que explica el sesgo hacia registro parlamentario que el propio autor documenta como fallo conocido. No se publican en la información disponible el número de tokens de entrenamiento, la composición exacta de la mezcla ni si hubo etapas de RLHF o DPO.

La aportación técnica de esta copia es puramente de despliegue. Se exportó con optimum 1.21.4 y transformers 4.42.4, una combinación deliberada porque versiones más recientes de transformers introducen una entrada `cache_position` que transformers.js no envía. Sobre el export se aplicó cuantización dinámica uint8 al encoder y al decoder fusionado. Además, se detectó que el decoder llevaba dos copias idénticas de la proyección de salida tras la cuantización; se eliminó una y los logits resultaron bit-idénticos (diferencia máxima 0,0), bajando el decoder de 80,1 MB a 53,6 MB.

## Capacidades

- Transcripción de voz a texto en italiano, con salida en italiano (el paso a inglés lo gestiona la app que lo consume, no el modelo).
- Ejecución completamente offline en el navegador mediante transformers.js 4.x y ONNX Runtime Web.
- Inferencia en CPU sin GPU, con decodificación greedy.
- Integración con Web Workers y multihilo (el autor mide con 4 hilos en Chromium).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión ni audio más allá de la transcripción ASR.
- No soporta otros idiomas distintos del italiano.
- No dispone de modo thinking ni de salidas estructuradas más allá del texto transcrito.

## Casos de uso

- Subtitulado offline en navegador para contenido en italiano: el modelo transcribe audio local sin enviar datos a ningún servidor, adecuado para aplicaciones de privacidad estricta gracias a su tamaño de 0,1 GB y su ejecución en CPU.
- Accesibilidad en tiempo real en páginas web: integrar el modelo en un Web Worker permite transcribir micrófono o ficheros de audio italianos y mostrarlos como subtítulos, con una latencia de aproximadamente 2,6 s por frase en portátil.
- Aplicaciones de notas de voz: un cliente web puede transcribir grabaciones cortas en italiano y almacenarlas como texto, sin coste de API y con checksums verificables para auditar la cadena de suministro.
- Transcripción de llamadas telefónicas italianas: el autor reporta WER 0,338 en MINDS-14 italiano, lo que lo hace utilizable para resúmenes posteriores en centros de atención telefónica, siempre con revisión humana.
- Prototipado de ASR en el cliente para investigación: sirve como baseline reproducible (hashes SHA-256 por fichero) para comparar conversiones ONNX o estrategias de cuantización en italiano.
- Educación y aprendizaje de italiano: transcripción de material audiovisual para generar ejercicios o búsquedas sobre el texto, ejecutándose en equipos sin GPU.
- Aplicaciones de campo sin conectividad: entornos con red intermitente donde un servidor de ASR no es viable y se necesita procesamiento local en el dispositivo.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Whisper base estándar (misma conversión) |
|---|---|---|
| FLEURS italiano, WER (100 clips reservados, greedy) | 0,130 | 0,192 |
| MINDS-14 italiano, llamadas telefónicas, WER (80 clips) | 0,338 | 0,354 |

Mediciones realizadas por el autor en la app de navegador, CPU de portátil, decodificación greedy, con 4 hilos en Chromium: aproximadamente 2,6 s por frase. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (CPU); en GPU el modelo cuantizado ocupa del orden de decenas de MB, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no se documentan; el diseño apunta a ejecución en CPU.
- Cabe en cualquier equipo consumer: el repositorio completo pesa 0,1 GB y el decoder cuantizado 53,6 MB, por lo que funciona en portátiles y navegadores sin GPU dedicada.
- Opciones de despliegue: transformers.js 4.x con ONNX Runtime Web es el camino soportado y probado; al ser ONNX estándar podría cargarse con otros runtimes ONNX, aunque no está validado por el autor.
- Latencia y throughput: aproximadamente 2,6 s por frase en Chromium con 4 hilos en CPU de portátil; no se publican cifras de throughput agregado ni de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idioma | Rendimiento ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarkL02/whisper-base-it-onnx-int8 | Whisper base (recuento no publicado) | Italiano | FLEURS it WER 0,130; MINDS-14 it WER 0,338 | MIT | HuggingFace, ONNX int8 |
| LocalAI-io/whisper-base-it-multi (modelo base) | Whisper base | Italiano (fine-tune multi-corpus) | No publicado en la información disponible | MIT | HuggingFace |
| Whisper base estándar de OpenAI | Whisper base | Multilingüe | FLEURS it WER 0,192 en la misma conversión | MIT | HuggingFace, múltiples formatos |

La comparación con modelos de la misma categoría distintos de Whisper base no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Fallo conocido documentado por el autor: en audio poco claro el modelo a veces abre con la frase "signor presidente, onorevoli colleghi", aprendida de VoxPopuli (discurso parlamentario). La app que lo consume la elimina; un uso directo del modelo la verá.
- Sesgo de dominio hacia registro parlamentario y corpus de lectura, con degradación notable en llamadas telefónicas (WER 0,338 frente a 0,130 en FLEURS).
- Riesgo de alucinación en segmentos sin voz o con ruido, típico de Whisper: puede generar texto plausible donde no hay habla.
- Solo italiano: no transcribe otros idiomas ni cambia de idioma automáticamente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los medidos.
- Dependencia de versión: el export está fijado a transformers 4.42.4 y optimum 1.21.4 por compatibilidad con transformers.js; actualizar esas dependencias puede romper la inferencia por la entrada `cache_position`.
- Los benchmarks proceden de una única evaluación del autor con 100 y 80 clips respectivamente; no hay validación independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/MarkL02/whisper-base-it-onnx-int8
- Modelo base: https://huggingface.co/LocalAI-io/whisper-base-it-multi
- Repositorio de Whisper de OpenAI: no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Repositorio de transformers.js: no disponible en la información proporcionada
- Documentación de optimum: no disponible en la información proporcionada
