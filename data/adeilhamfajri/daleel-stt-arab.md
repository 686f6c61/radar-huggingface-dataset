# adeilhamfajri/daleel-stt-arab

## Resumen

daleel-stt-arab es un modelo de reconocimiento automatico del habla (ASR) para arabe, publicado por el desarrollador adeilhamfajri como parte de la infraestructura de Daleel.ID para sus ejercicios de pronunciacion "Belajar Bahasa Arab". No es un modelo entrenado desde cero: es una exportacion a ONNX con cuantizacion int8 del modelo NVIDIA stt_ar_fastconformer_hybrid_large_pcd_v1.0, del que hereda arquitectura y pesos. La modificacion aportada por el autor consiste en la conversion del export fp32 a int8 mediante cuantizacion dinamica de las operaciones MatMul y Gemm con onnxruntime.

El objetivo del modelo es la inferencia completamente local en el navegador mediante onnxruntime-web, de modo que el audio del usuario nunca abandona el dispositivo. Esta orientacion a despliegue en cliente explica las decisiones de empaquetado: un unico fichero ONNX de 174 MB con solo la cabeza CTC, tabla de tokens de 1025 entradas y una interfaz de entrada/salida minima (log-mel de 80 bins y longitudes). El repositorio completo ocupa 0,2 GB.

Es relevante ahora porque demuestra un patron de despliegue de ASR en el borde (edge) con cuantizacion agresiva y sin dependencia de servidores, algo util para aplicaciones educativas, herramientas de accesibilidad o entornos con requisitos de privacidad estrictos. La contrapartida es que se trata de un artefacto de inferencia no streaming, sin pipeline de entrenamiento propio ni benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrida (cabeza CTC exportada), encoder Conformer con atencion por chunks |
| Parametros totales | no disponible (el modelo base es "large"; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada log-mel [1, 80, T] con T variable, salida [1, T/8, 1025] |
| Tipos de cuantizacion | int8 dinamica (QUInt8 en MatMul/Gemm); el export de origen es fp32 |
| Idiomas soportados | arabe (ar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, 174 MB) + `tokens.txt` |
| Modelo base | nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 |
| Entrada | `audio_signal` float32 [1, 80, T], log-mel de 80 bins estilo NeMo, 16 kHz mono, normalizado por caracteristica; `length` int64 [1] |
| Salida | `logprobs` [1, T/8, 1025], decodificacion CTC voraz |
| Vocabulario | 1025 tokens, blank id = 1024, "▁" como marcador de frontera de palabra |
| Modo de inferencia | no streaming |
| Libreria | onnx (onnxruntime / onnxruntime-web) |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, la variante de Conformer con atencion por chunks que NVIDIA emplea en su familia NeMo. El modelo base es una variante hibrida (CTC + RNNT/transducer) entrenada por NVIDIA sobre corpus de habla arabe con el pipeline PCD (punctuation and capitalization) de NeMo. daleel-stt-arab no conserva la cabeza transducer ni el modulo de puntuacion: solo exporta la cabeza CTC, lo que reduce el tamano y simplifica el grafo de inferencia para ejecucion en navegador.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni si el modelo base empleo RLHF, DPO o ajuste supervisado adicional; esos datos corresponden a la model card de NVIDIA, no reproducida en la informacion proporcionada. La unica transformacion documentada por el autor es la cuantizacion dinamica int8 del export fp32 de mah92 (sherpa-onnx), aplicada exclusivamente a MatMul y Gemm con `quantize_dynamic` (QUInt8) de onnxruntime. El autor afirma que, sobre el audio de muestra del export, la salida int8 coincidio palabra por palabra con la fp32, aunque no se aporta una evaluacion sistematica de la degradacion por cuantizacion.

La innovacion practica del artefacto no esta en el entrenamiento sino en el empaquetado: un unico ONNX de 174 MB, sin dependencias de NeMo, ejecutable con onnxruntime-web y decodificacion CTC voraz en cliente. Al ser no streaming, requiere disponer del audio completo antes de decodificar.

## Capacidades

- Transcripcion de voz a texto en arabe a partir de audio de 16 kHz mono, con extraccion de caracteristicas log-mel de 80 bins estilo NeMo.
- Decodificacion CTC voraz con marcado de fronteras de palabra mediante el token "▁".
- Ejecucion local en navegador via onnxruntime-web, sin envio de audio a servidores.
- Inferencia sobre secuencias de longitud variable (eje T dinamico) en modo no streaming.
- Salida de log-probabilidades por fotograma (T/8 fotogramas), lo que permite posprocesado propio o decodificacion alternativa si se implementa.
- No soporta tool calling, function calling, agentes, vision, audio de entrada distinto de voz ni modo thinking; no es un modelo de lenguaje.
- Cobertura multilingue limitada al arabe; no se documentan variantes dialectales concretas.

## Casos de uso

- Ejercicios de pronunciacion en aplicaciones educativas: el modelo transcribe la locucion del estudiante en el navegador y permite comparar palabras y letras con la referencia, tal como hace Daleel.ID en "Belajar Bahasa Arab". La ejecucion local evita enviar voces de menores o estudiantes a un backend.
- Herramientas de privacidad estricta: dictado o transcripcion en entornos donde el audio no puede salir del dispositivo (sanidad, legal, administracion), usando onnxruntime-web o onnxruntime nativo con el mismo fichero.
- Subtitulado por lotes de grabaciones cortas en arabe: al ser no streaming, encaja en pipelines que procesan ficheros completos y generan transcripciones con marcas de palabra.
- Verificacion de lectura en aplicaciones de alfabetizacion: comprobar si el alumno ha pronunciado las letras y palabras esperadas, aceptando que el modelo no escribira harakat y por tanto no sirve para calificar vocales breves ni i'rab.
- Asistentes de voz embebidos en dispositivos de bajos recursos: el fichero int8 de 174 MB permite despliegue en movil o en Raspberry Pi con onnxruntime, sin GPU dedicada.
- Prototipado rapido de ASR arabe sin infraestructura: al no requerir NeMo ni un servidor, un equipo puede integrar el modelo en una demo web en horas y sustituirlo despues por una solucion en servidor si necesita streaming.
- Busqueda por voz sobre audio archivado en arabe: transcripcion offline de grabaciones para indexacion textual, aceptando la ausencia de diacriticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una comprobacion cualitativa: en el audio de muestra del export, la salida int8 coincidio palabra por palabra con la fp32. No hay cifras de WER, CER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El fichero int8 ocupa 174 MB; en la practica la huella en memoria es del orden de cientos de MB, pero el autor no publica mediciones.
- GPU recomendadas: no disponibles. El modelo esta pensado para CPU y para ejecucion en navegador; no requiere GPU.
- Cabe en GPU de consumo: si, en cualquier GPU con unos pocos cientos de MB libres, aunque el caso de uso previsto es CPU.
- Despliegue: onnxruntime-web en navegador (caso principal), onnxruntime nativo en Python/C++/movil, o sherpa-onnx a partir del export de origen. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo ASR ONNX.
- Latencia y throughput: no disponibles. Al ser no streaming, la latencia depende de la duracion del audio completo y del hardware del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| daleel-stt-arab | no disponible (base "large") | log-mel 80 bins, T variable, no streaming | ar | CC-BY-4.0 | ONNX int8 | Cabeza CTC, 174 MB, orientado a navegador |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | no disponible (large) | audio 16 kHz, no streaming | ar | CC-BY-4.0 | NeMo (.nemo) | Modelo base hibrido CTC+RNNT con puntuacion y mayusculas; requiere NeMo |
| mah92/sherpa-onnx-nemo-ctc-ar-fastconformer-hybrid-large-pcd-v1.0-non-streaming-2024-12-25 | no disponible | audio 16 kHz, no streaming | ar | no disponible en la informacion | ONNX fp32 | Export de origen del que deriva este modelo; sin cuantizar |
| Alternativas ASR arabe de otros proveedores | no disponible | no disponible | ar | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo escribe letras arabes de forma fiable pero casi nunca genera harakat (diacriticos), incluso en lectura totalmente vocalizada. No sirve para calificar harakat ni i'rab; solo para comprobar si se pronunciaron palabras y letras.
- Al ser no streaming, no puede transcribir en tiempo real sin trocear el audio y asumir perdidas en las fronteras.
- Solo cubre arabe; no se documenta el comportamiento con dialectos, code-switching ni acentos no representados en el corpus de NVIDIA.
- La cuantizacion int8 puede degradar la precision en audio distinto del de muestra; el autor solo aporta una comprobacion cualitativa, sin WER comparativo frente a fp32.
- No se han publicado sesgos conocidos ni evaluaciones de robustez por parte del autor; se heredan los del modelo base de NVIDIA, no documentados en la informacion disponible.
- Riesgo de alucinacion propio de CTC: sustituciones y omisiones de palabras en audio ruidoso o con solapamiento, sin mecanismo de confianza calibrado documentado.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a NVIDIA y al autor del export; es obligatorio conservar la atribucion de la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad, sin issues ni mantenimiento demostrado.
- Depende del contrato de entrada exacto (log-mel NeMo de 80 bins, normalizado por caracteristica); un preprocesado distinto produce salidas incorrectas sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adeilhamfajri/daleel-stt-arab
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Export ONNX de origen (mah92, sherpa-onnx): https://huggingface.co/mah92/sherpa-onnx-nemo-ctc-ar-fastconformer-hybrid-large-pcd-v1.0-non-streaming-2024-12-25
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos del autor.
