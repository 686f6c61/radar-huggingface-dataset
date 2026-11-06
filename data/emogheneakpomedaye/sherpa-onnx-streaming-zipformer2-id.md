# EmogheneAkpomedaye/sherpa-onnx-streaming-zipformer2-id

## Resumen

Sherpa-ONNX Streaming Zipformer2 ID es un modelo de reconocimiento automatico del habla (ASR) en streaming para indonesio, empaquetado en formato ONNX y pensado para su uso con el runtime sherpa-onnx del proyecto k2-fsa. Lo publica el usuario EmogheneAkpomedaye en Hugging Face y esta entrenado sobre una mezcla de cuatro corpus: YODAS2, Common Voice 17.0, FLEURS y LibriVox Indonesia. Su rasgo diferencial es que opera en modo streaming, es decir, transcribe audio a medida que llega, sin necesidad de disponer de la grabacion completa.

La arquitectura es Zipformer2, un encoder de tipo transformer con atencion por chunks y mecanismos de downsampling jerarquico, disenado para inferencia de baja latencia. El repositorio ocupa 0,5 GB, lo que sugiere un modelo compacto orientado a despliegue en dispositivos con recursos limitados. La licencia MIT facilita su integracion en productos comerciales sin restricciones adicionales.

Es relevante para desarrolladores que necesitan transcripcion en tiempo real de indonesio en entornos embebidos, aplicaciones moviles o servidores modestos, donde un modelo grande tipo Whisper no es viable por latencia o memoria. La model card reporta un WER medio de 9,81 con decodificacion greedy sobre los cuatro conjuntos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 (transformer con atencion por chunks, streaming) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, sin ventana de texto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; sherpa-onnx suele ofrecer variantes int8, pero no se detalla en la informacion) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea Zipformer2, la segunda generacion de la familia Zipformer desarrollada en el ecosistema k2-fsa/icefall. Se trata de un encoder transformer con atencion restringida a bloques de frames (chunk-wise attention), lo que permite procesar audio de forma incremental manteniendo un estado recurrente entre chunks. Esta diseno reduce el coste computacional frente a atencion completa y habilita la transcripcion en streaming con latencia acotada.

El entrenamiento combina cuatro corpus de distinta naturaleza: YODAS2 (audio web a gran escala), Common Voice 17.0 (lectura voluntaria), FLEURS (multilingue de alta calidad) y LibriVox Indonesia (audiolibros). No se especifica en la informacion disponible el numero total de horas ni si se aplicaron tecnicas de aumento de datos, especulacion o ajuste con RLHF. La decodificacion reportada es greedy search, sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento automatico del habla en indonesio en modo streaming, con salida incremental de transcripciones.
- Procesamiento de audio en tiempo real con latencia baja, adecuado para dictado y subtitulado en vivo.
- Integracion nativa con el runtime sherpa-onnx, que cubre C++, C, Python, Java, Kotlin, Go, Rust, C# y JavaScript.
- Ejecucion en CPU sin GPU, gracias al formato ONNX y al tamano compacto del repositorio (0,5 GB).
- No se documenta soporte de tool calling, agentes, vision, audio generation ni modo thinking.
- Capacidad multilingue limitada al indonesio; no se reportan otros idiomas.

## Casos de uso

- Subtitulado en directo de reuniones y eventos en indonesio: el modo streaming permite emitir texto parcial mientras el audio se captura, con latencia de pocos cientos de milisegundos, adecuado para pantallas de subtitulos.
- Transcripcion de llamadas de atencion al cliente: el modelo puede procesar el audio en tiempo real y alimentar sistemas de analitica o deteccion de intenciones sin esperar al final de la llamada.
- Asistentes de voz embebidos: al ejecutarse en CPU via sherpa-onnx y ocupar 0,5 GB, cabe en dispositivos tipo Raspberry Pi o moviles para comandos de voz en indonesio.
- Generacion de actas y notas de reuniones: transcripcion continua de audio corporativo con posterior postprocesado, usando el modelo como primer eslabon del pipeline ASR.
- Accesibilidad para personas con discapacidad auditiva: subtitulado en tiempo real de contenidos audiovisuales en indonesio en navegador o aplicacion de escritorio.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de podcasts o audiolibros en indonesio para construir indices de texto searchable, aprovechando el bajo coste de inferencia en CPU.
- Sistemas de dictado para desarrollo de software: integracion en editores o IDE mediante el binding de sherpa-onnx para convertir voz en texto en indonesio.

## Benchmarks y rendimiento

Resultados reportados en la model card con decodificacion greedy search:

| Dataset | WER |
|---|---|
| YODAS2 | 11,90 |
| Common Voice 17.0 | 11,58 |
| FLEURS | 8,96 |
| LibriVox Indonesia | 6,79 |
| Media | 9,81 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; en GPU, el modelo ONNX de 0,5 GB requiere menos de 1 GB de VRAM, aunque no se especifica el consumo exacto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100 ni H100. Una RTX 4090 o similar esta sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: sherpa-onnx (runtime oficial), con bindings para C++, Python, Java, Kotlin, Go, Rust, C# y JavaScript. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno streaming sugiere latencia acotada por chunk, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (indonesio) | Licencia | Formato |
|---|---|---|---|---|---|
| Sherpa-ONNX Streaming Zipformer2 ID | no disponible | no aplica (streaming) | 9,81 (media) | MIT | ONNX |
| Whisper large-v3 | 1,55 B | 30 s de audio | no disponible en esta ficha | MIT | PyTorch, ONNX, GGML |
| Whisper small | 244 M | 30 s de audio | no disponible en esta ficha | MIT | PyTorch, ONNX, GGML |
| Wav2Vec2 XLS-R indonesio | no disponible | no disponible | no disponible en esta ficha | MIT/Apache segun variante | PyTorch |

La comparativa con Whisper es cualitativa: Whisper no es un modelo streaming nativo y requiere procesar ventanas de 30 segundos, mientras que Zipformer2 esta disenado para inferencia incremental. No se dispone de datos de WER comparables de Whisper sobre los mismos conjuntos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta indonesio; no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en codigo mezclado (code-switching) puede degradarse.
- El WER medio de 9,81 implica que aproximadamente una de cada diez palabras se transcribe incorrectamente en los conjuntos de evaluacion; en dominios especializados (medico, legal, tecnico) el error puede ser mayor.
- Los conjuntos de evaluacion incluyen datos probablemente vistos durante el entrenamiento (YODAS2, Common Voice, FLEURS, LibriVox), por lo que las cifras de WER pueden estar optimistas respecto a datos reales no vistos.
- No se documentan sesgos especificos, pero al entrenarse con audio web y lectura voluntaria puede tener peor rendimiento con acentos regionales, ruido de fondo o habla espontanea.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se especifican los parametros totales ni la configuracion exacta del encoder, lo que dificulta estimar con precision los requisitos de computo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EmogheneAkpomedaye/sherpa-onnx-streaming-zipformer2-id
- Documentacion de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriVox Indonesia: https://huggingface.co/datasets/indonesian-nlp/librivox-indonesia
