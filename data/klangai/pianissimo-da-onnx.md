# KlangAI/pianissimo-da-onnx

## Resumen

KlangAI/pianissimo-da-onnx es la versión exportada a ONNX del modelo de reconocimiento automático del habla (ASR) KlangAI/pianissimo-da, especializado exclusivamente en danés. Lo desarrolla Klang, y su propósito es permitir la transcripción de audio en CPU sin necesidad de PyTorch ni NeMo, usando únicamente onnxruntime. Se distribuye en cuatro precisiones (fp32, fp16, int8 e int4), con tamaños que van de 2,56 GB a 525 MB.

El modelo base emplea una arquitectura NeMo Conformer (FastConformer) con decodificación TDT (Token-and-Duration Transducer), una variante de transducer que predice conjuntamente tokens y duraciones, lo que acelera la inferencia frente a CTC o transducers clásicos. El vocabulario es de 8.192 tokens más el token blank, y el encoder mantiene atención local de 256 frames por lado. La versión int8 incorpora SmoothQuant y la int4 usa cuantización por grupos de 32 con HQQ, lo que permite ejecutar el encoder int4 incluso en WebGPU dentro del navegador.

Su relevancia actual radica en que ofrece un ASR de alta calidad para danés (WER de 7,43 % en FLEURS con fp32) en un paquete ligero y portable, apto para despliegue en servidores sin GPU, dispositivos ARM y aplicaciones web. La licencia CC BY 4.0 facilita el uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer (FastConformer) con decoder TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | atención local de 256 frames por lado en el encoder; no se especifica límite global de audio |
| Tipos de cuantizacion | fp32, fp16, int8 (SmoothQuant), int4 (HQQ, grupos de 32) |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.onnx, nemo128.onnx) |

## Arquitectura y entrenamiento

El modelo es un FastConformer, la variante de Conformer optimizada para ASR de NeMo, con encoder que procesa espectrogramas de 128 bandas generados por el modelo auxiliar nemo128.onnx. El decoder es un TDT (Token-and-Duration Transducer), que predice simultáneamente el token y su duración, lo que reduce el número de pasos de decodificación y mejora el rendimiento en CPU. El encoder conserva atención local con ventana de 256 frames a cada lado, lo que limita el coste computacional en audios largos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card no los detalla. Las innovaciones técnicas documentadas se centran en la exportación y cuantización: SmoothQuant para int8 (moviendo parte de la escala de la entrada a los pesos), HQQ con grupos de 32 para int4 (con corrección exacta de offsets para compatibilidad con WebGPU), y el decoder LSTM almacenado en fp16 en la versión int8. El repositorio incluye utilidades propias (`pianissimo_onnx`) para transcripción de grabaciones largas con cortes en momentos de silencio y para phrase boosting con vocabulario personalizado, compatible con el mecanismo de NeMo.

## Capacidades

- Reconocimiento automático del habla en danés con salida de texto plano.
- Generación de timestamps a nivel de token mediante `model.with_timestamps()`.
- Transcripción de grabaciones largas con el helper `transcribe_long`, que segmenta en pausas.
- Segmentación opcional por detección de actividad de voz (VAD) con Silero, útil en audio ruidoso de broadcast.
- Phrase boosting con vocabulario personalizado (nombres propios, instituciones, términos técnicos) mediante `pianissimo_onnx.boost`.
- Ejecución en CPU con onnxruntime, sin dependencia de PyTorch ni NeMo.
- Compatibilidad con WebGPU en navegador para la versión int4.
- Soporte de cuantizaciones intercambiables en tiempo de carga (`quantization="int8"`, `"int4"`, `"fp16"` o fp32 por defecto).
- No soporta tool calling, agentes, visión ni audio generation; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en danés: el modelo procesa audio de 16 kHz mono y devuelve texto con timestamps, lo que permite generar actas con marcas temporales y buscar fragmentos concretos.
- Subtitulado automático de vídeo: la salida con timestamps por token facilita la alineación de subtítulos; la versión int8 a 35× RTFx en Intel permite procesar horas de material en minutos.
- Atención al cliente y análisis de llamadas: la transcripción de conversaciones telefónicas en danés permite alimentar sistemas de análisis de sentimiento o QA sobre el texto resultante.
- Archivado y búsqueda de audio broadcast: `transcribe_long` con cortes en silencios y el VAD de Silero permiten indexar programas de radio o televisión daneses para búsqueda textual posterior.
- Despliegue en dispositivos sin GPU: la versión int4 (525 MB, 1,1 GB de memoria para un clip de 30 s) cabe en servidores modestos, Raspberry Pi o portátiles ARM, con 23-63× RTFx según plataforma.
- Aplicaciones web en el navegador: el encoder int4 es compatible con onnxruntime-web y WebGPU, lo que habilita transcripción local en el cliente sin enviar audio a un servidor.
- Transcripción con vocabulario especializado: en dominios como administración pública danesa (por ejemplo, "Folketinget") o investigación ("Aarhus Universitet"), el phrase boosting corrige la ortografía de términos que el modelo tendería a escribir mal.

## Benchmarks y rendimiento

Resultados de WER (%) en el conjunto de test FLEURS danés (930 clips), según la model card:

| Version | Tamano | WER FLEURS | RTFx Intel | RTFx ARM | RTFx Mac | Memoria (clip 30 s) |
|---|---:|---:|---:|---:|---:|---:|
| fp32 (original) | 2,51 GB | 7,43 | no disponible | no disponible | no disponible | no disponible |
| int8 | 684 MB | 7,60 | 35× | 63× | 74× | 1,5 GB |
| int4 | 525 MB | 7,98 | 12× | 23× | 37× | 1,1 GB |
| fp16 | 1,46 GB | 7,43 | 18× | 30× | 55× | 4,0 GB |
| fp32 (ONNX) | 2,56 GB | 7,43 | 18× | 30× | 55× | 3,0 GB |

Las velocidades y la memoria se midieron sobre el modelo sueco de la misma arquitectura. Las pruebas de CPU usaron 4 hilos en un Intel Xeon Platinum 8481C, 8 hilos en un Google Axion (ARM) y 6 hilos en un Apple M5 Pro. La memoria se midió en el Intel Xeon. En Mac, las versiones MLX del modelo base son aproximadamente el doble de rápidas al ejecutarse en GPU.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 1,1 GB (int4), 1,5 GB (int8), 3,0 GB (fp32 ONNX) y 4,0 GB (fp16) para un clip de 30 segundos en CPU Intel.
- GPU: no se requieren; el modelo está pensado para CPU. No se documentan requisitos de GPU dedicada.
- Cabe en GPU consumer y en hardware de gama baja: las versiones int4 e int8 funcionan en portátiles, Raspberry Pi y servidores ARM (Google Axion) con onnxruntime.
- Despliegue: onnxruntime con la librería `onnx-asr` (`pip install onnx-asr[cpu,hub]`); para Mac existen versiones MLX del modelo base; para navegador, onnxruntime-web con WebGPU (solo encoder int4).
- Latencia y throughput: RTFx de 12× a 74× según cuantización y plataforma (ver tabla). La versión int8 es la más rápida en Intel (35×), ARM (63×) y Mac (74×). El decoder int8 usa LSTM en fp16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos ASR para danés en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Idiomas | Arquitectura | Contexto/ventana | Licencia | Formato |
|---|---|---|---|---|---|
| KlangAI/pianissimo-da-onnx | da | FastConformer + TDT | atención local 256 frames | CC BY 4.0 | ONNX |
| KlangAI/pianissimo-da | da | FastConformer + TDT | atención local 256 frames | CC BY 4.0 | NeMo/PyTorch |
| KlangAI/pianissimo-da-mlx-8bit | da | FastConformer + TDT | atención local 256 frames | CC BY 4.0 | MLX |
| Otros ASR multilingües (p. ej. Whisper) | varios | transformer encoder-decoder | no disponible | variable | variable |

La comparación con modelos multilingües como Whisper no puede cuantificarse con los datos disponibles; la model card remite a la del modelo base para comparaciones con otros modelos.

## Limitaciones y advertencias

- Solo reconoce danés; no soporta otros idiomas ni cambio de código lingüístico.
- Riesgo de alucinación y errores en audio ruidoso, con acentos marcados o solapamiento de hablantes; el WER de 7,43 % en FLEURS corresponde a audio limpio de lectura.
- El VAD de Silero produce segmentos más cortos, lo que mejoró la precisión en audio de broadcast ruidoso pero la redujo en habla limpia según las pruebas de los autores.
- La cuantización int4 degrada el WER en aproximadamente 0,55 puntos frente a fp32 (7,98 vs 7,43), y el redondeo simple a 4 bits era alrededor de 1 punto peor en los tests daneses, por lo que se usó HQQ.
- Las mediciones de velocidad y memoria se realizaron sobre el modelo sueco de la misma arquitectura, no directamente sobre el danés.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar el modelo según el BibTeX de la model card.
- Dependencia de la librería `onnx-asr` y de `sentencepiece` para phrase boosting; el helper `transcribe_long` requiere `soundfile`.
- No se documentan sesgos específicos de género, edad o dialecto; al entrenarse presumiblemente con datos daneses, puede infrarepresentar variantes regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Modelo base: https://huggingface.co/KlangAI/pianissimo-da
- Versión MLX: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- onnxruntime: https://onnxruntime.ai
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sección de vocabulario del modelo base: https://huggingface.co/KlangAI/pianissimo-da#vocabulary
