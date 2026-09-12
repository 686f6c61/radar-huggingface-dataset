# shockz1/parakeet-tdt_ctc-110m-fp16-onnx

## Resumen

Parakeet TDT-CTC 110M ONNX (fp16) es una exportación en precisión media del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt_ctc-110m`, publicada por el usuario shockz1. El objetivo no es entrenar un modelo nuevo, sino empaquetar los pesos para que puedan ejecutarse íntegramente dentro de un navegador mediante `onnxruntime-web` sobre WebGPU: los archivos se descargan una sola vez, quedan en la caché del navegador y a partir de ahí la transcripción funciona sin conexión y sin enviar audio a ningún servidor.

Técnicamente es un modelo NeMo Conformer de 110 millones de parámetros con decodificador TDT (Token-and-Duration Transducer) y cabecera CTC híbrida, el mismo esquema que NVIDIA usa en la familia Parakeet. Está especializado en inglés y trabaja sobre audio mono a 16 kHz con 80 bins mel y un factor de subsampling de 8. El repositorio pesa 0,2 GB y contiene únicamente cuatro archivos: encoder fp16 (229 MB), decoder + joint network fp16 (10,7 MB), vocabulario SentencePiece de 1025 tokens y configuración.

Su relevancia es práctica: demuestra que un ASR de calidad razonable puede desplegarse en el cliente (navegador, portátiles sin GPU dedicada) con requisitos de ancho de banda y almacenamiento mínimos, lo que encaja con casos de uso donde la privacidad del audio es un requisito y no un extra. La contrapartida es que se trata de un repositorio derivado, con cero descargas y cero likes en el momento de redactar esta ficha, y con una única variante de cuantización publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) y cabecera CTC híbrida |
| Parámetros totales | 110 M (según el nombre del modelo heredado de NVIDIA) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio); ventana de inferencia no especificada en la información disponible |
| Tipos de cuantización | fp16 (ONNX). No se publican variantes INT8, INT4 ni GGUF |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX fp16 en archivos únicos, sin `.onnx_data` externo |
| Entrada de audio | PCM mono a 16 kHz, 80 bins mel, subsampling 8 |
| Vocabulario | SentencePiece, 1025 tokens (`vocab.txt`, 10 KB) |
| Archivos del repositorio | `encoder-model.fp16.onnx` (229 MB), `decoder_joint-model.fp16.onnx` (10,7 MB), `vocab.txt` (10 KB), `config.json` |
| Tamaño del repositorio | 0,2 GB |
| Librería declarada | onnx |
| Pipeline | automatic-speech-recognition |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |

## Arquitectura y entrenamiento

El modelo es un híbrido TDT + CTC sobre un encoder Conformer. El encoder procesa el audio en formato log-mel (80 bins, ventana de 16 kHz) y aplica un factor de subsampling de 8, reduciendo la secuencia temporal antes de entrar en el decodificador. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite avanzar varios fotogramas por paso de decodificación y reduce el coste de inferencia frente a un decodificador transductor clásico. La exportación divide el modelo en dos grafos ONNX: el encoder (229 MB, pensado para ejecutarse en WebGPU) y el decodificador con la red conjunta (10,7 MB).

No se proporciona información sobre el dataset de entrenamiento, el número de tokens de audio, el uso de RLHF/DPO ni el proceso de destilación o ajuste del modelo original de NVIDIA. Lo único documentado es la cadena de conversión: el fp16 publicado deriva del export fp32 de `OpenVoiceOS/nvidia-parakeet-tdt_ctc-110m-onnx`, que a su vez es un export del checkpoint original `nvidia/parakeet-tdt_ctc-110m`. La innovación técnica relevante aquí no está en el entrenamiento, sino en el empaquetado: cada grafo se exporta como archivo único para que el navegador pueda cargarlo con un solo `fetch`, y la red de predicción es de una sola capa (a diferencia de los modelos Parakeet de 0,6B, que usan dos), un detalle que obliga a leer la forma real de `input_states_1` desde `joinerSession.inputMetadata` y redimensionar el estado inicial del decodificador si se reutiliza una librería calibrada para los modelos grandes.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio PCM mono a 16 kHz.
- Salida con marcas de tiempo a nivel de palabra (`returnTimestamps: true` en el ejemplo de uso de la model card).
- Decodificación TDT con avance por duraciones, orientada a reducir el número de pasos por fotograma.
- Cabecera CTC híbrida, que permite en principio decodificación CTC además de TDT (el repositorio no documenta cómo activar la ruta CTC en el grafo ONNX exportado).
- Ejecución en navegador con `onnxruntime-web`, con backend `webgpu-hybrid` declarado en el ejemplo.
- Funcionamiento offline tras la primera descarga: los pesos quedan en la caché del navegador y no se sube audio a ningún servicio.
- Integración con la librería `parakeet.js` mediante `ParakeetModel.fromUrls`, pasando las URL del encoder, el decodificador y el tokenizador.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta visión, audio generation ni otros modos: es exclusivamente ASR.
- Multilingüismo: no. Solo inglés.
- Traducción de voz: no disponible.
- Puntuación y capitalización automáticas: no disponible en la información proporcionada.

## Casos de uso

- Subtitulado en el navegador: es el caso de uso para el que se publicó el modelo, integrado en la herramienta de subtítulos de noupload.xyz. El navegador descarga los 240 MB de pesos una vez, los cachea y genera subtítulos con marcas de tiempo por palabra sin subir el audio a ningún servidor.
- Transcripción con requisitos estrictos de privacidad: al ejecutarse íntegramente en el cliente, encaja en entornos donde el audio no puede salir del dispositivo (consultas médicas, entrevistas, notas de voz personales), siempre que el contenido sea en inglés.
- Notas de voz y actas de reunión en aplicaciones web: la ventana de inferencia no está documentada, pero al funcionar sobre PCM continuo puede alimentarse por fragmentos desde un `MediaStream` y reconstruir la transcripción con los timestamps por palabra.
- Accesibilidad en aplicaciones web: generación de subtítulos en directo para vídeo o audio reproducido en el propio navegador, sin depender de un servicio externo de ASR ni de conexión permanente.
- Preprocesado de audio en pipelines de datos: conversión de grandes volúmenes de audio en inglés a texto con timestamps para indexación posterior, ejecutando el ONNX en CPU con `onnxruntime` y evitando costes de API por minuto.
- Búsqueda por voz en el cliente: al devolver timestamps por palabra, permite localizar el instante exacto de un término dentro de un archivo de audio y saltar a esa posición en un reproductor web.
- Análisis de llamadas de atención al cliente en inglés: transcripción por lotes en infraestructura propia, con el texto resultante enviado después a un modelo de lenguaje para clasificación o extracción de motivos de contacto.
- Despliegue en dispositivos sin GPU: el formato ONNX permite usar el backend WASM de `onnxruntime-web` (o `onnxruntime` nativo) cuando WebGPU no está disponible, aceptando mayor latencia a cambio de funcionar en cualquier equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de error de palabra (WER), comparaciones con Whisper u otros modelos, ni mediciones de latencia o throughput en WebGPU o WASM. Cualquier cifra de precisión del modelo original de NVIDIA debería consultarse en la ficha de `nvidia/parakeet-tdt_ctc-110m`, y no se puede asumir que se mantenga tras la conversión a fp16.

## Requisitos de hardware

- Peso de los pesos en disco y en memoria: aproximadamente 240 MB (229 MB del encoder + 10,7 MB del decodificador), más el vocabulario y la configuración.
- VRAM estimada para inferencia: del orden de 0,3-0,6 GB contando pesos fp16, estados intermedios del Conformer y buffers de activaciones; no hay mediciones publicadas, por lo que es una estimación basada en el tamaño de los archivos, no un dato confirmado.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo reciente con soporte WebGPU o CUDA; no requiere A100 ni H100.
- GPU de centro de datos: no necesarias. Se puede servir en CPU para cargas por lotes con `onnxruntime`.
- Navegador: requiere un navegador con WebGPU para la ruta `webgpu-hybrid`; en su ausencia, el backend WASM es la alternativa.
- Opciones de despliegue: `onnxruntime-web` (WebGPU/WASM) en el navegador; `onnxruntime` nativo en servidor; la librería `parakeet.js` para el caso web. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama: llama.cpp y Ollama quedan descartados porque solo se publican pesos ONNX, no GGUF.
- Latencia y throughput: no disponible.
- Restricción práctica: la model card advierte que `parakeet.js` dimensiona la red de predicción para los modelos de 0,6B (2 capas) y que este modelo tiene 1 capa, por lo que es necesario leer la forma real de `input_states_1` y redimensionar el estado inicial del decodificador.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Bins mel / red de predicción | Licencia | Notas |
|---|---|---|---|---|---|
| shockz1/parakeet-tdt_ctc-110m-fp16-onnx | ONNX fp16, archivo único | 110 M | 80 bins, 1 capa de predicción | CC-BY-4.0 | Orientado a navegador (WebGPU); 0 descargas en el momento de redactar la ficha |
| OpenVoiceOS/nvidia-parakeet-tdt_ctc-110m-onnx | ONNX fp32 | 110 M | 80 bins | CC-BY-4.0 (heredada) | Origen directo de esta conversión; mayor precisión potencial a cambio de más tamaño |
| nvidia/parakeet-tdt_ctc-110m | Pesos PyTorch / NeMo | 110 M | 80 bins | CC-BY-4.0 | Modelo original; requiere el stack NeMo para inferencia |
| Familia Parakeet 0,6B (p. ej. `parakeet-tdt-0.6b-v2`) | Pesos NeMo | 0,6 B | 128 bins, 2 capas de predicción | no disponible en la información proporcionada | Mayor tamaño y, según la model card, distinta configuración de mel y de red de predicción |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en WER de estos modelos, ni de especificaciones detalladas de alternativas no pertenecientes a la familia Parakeet (Whisper, wav2vec 2.0, etc.) dentro de la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el campo `language` del repositorio es `en` y no se documenta soporte multilingüe. Cualquier audio en otro idioma dará resultados no fiables.
- Tamaño reducido: 110 M de parámetros es un modelo compacto. Es previsible una degradación mayor que en modelos grandes en audio ruidoso, solapamiento de hablantes, acentos poco representados o vocabulario técnico.
- Conversión a fp16 sin evaluación publicada: no hay WER comparativo entre esta exportación y el fp32 del que deriva, por lo que no se puede descartar una pérdida de precisión por la cuantización.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes. No hay evidencia de terceros sobre su funcionamiento en producción.
- Trampa de integración conocida: la red de predicción tiene 1 capa, mientras que las librerías existentes asumen 2 para los modelos de 0,6B. Ignorar este punto provoca fallos en el estado inicial del decodificador.
- Comportamiento de la ruta CTC no documentado: el nombre del modelo incluye CTC, pero la model card solo describe el uso del decodificador TDT exportado.
- Sin datos sobre puntuación, capitalización ni normalización de texto: hay que verificar la salida real antes de usarla para subtítulos destinados a publicación.
- Sesgos: no disponible. No se publica ninguna evaluación de sesgo por acento, género, edad o variedad dialectal del inglés.
- Riesgo de alucinación: los modelos ASR pueden generar texto plausible en segmentos con silencio, ruido o música. No hay información específica sobre este comportamiento en este modelo.
- Latencia en navegador no medida: el rendimiento en WebGPU frente a WASM no está cuantificado, y puede variar notablemente según el equipo del usuario.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. Al redistribuir el modelo o trabajar derivado de él hay que mantener la atribución a NVIDIA y al export original.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-12, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- Sin garantías de mantenimiento: al ser un repositorio derivado de un usuario individual, no hay compromiso de actualizaciones ni de corrección de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shockz1/parakeet-tdt_ctc-110m-fp16-onnx
- Export fp32 de origen: https://huggingface.co/OpenVoiceOS/nvidia-parakeet-tdt_ctc-110m-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Documentación de onnxruntime-web (WebGPU): https://onnxruntime.ai/docs/tutorials/web/
- Herramienta de subtítulos que lo utiliza: https://noupload.xyz
- Librería `parakeet.js`: mencionada en la model card, sin URL indicada (no disponible)
- Resultados de búsqueda web: no aportan enlaces relevantes; las entradas devueltas corresponden a Google Traduction y no guardan relación con el modelo.
