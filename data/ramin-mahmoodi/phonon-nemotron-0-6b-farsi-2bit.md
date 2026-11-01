# ramin-mahmoodi/phonon-nemotron-0.6b-farsi-2bit

## Resumen

Phonon 2.5 Nemotron FastConformer 0.6B Farsi 2-bit es un contenedor de reconocimiento automatico del habla (ASR) para persa (farsi) en streaming, publicado por el usuario ramin-mahmoodi en HuggingFace. Se trata de una cuantizacion extrema a 2 bits de un modelo Nemotron FastConformer de 0,6 mil millones de parametros, que reduce el peso del repositorio a 198,96 MB desde los aproximadamente 2.400 MB del modelo original, es decir, una reduccion superior a 12 veces. El modelo esta pensado para inferencia en tiempo real con latencia inferior a 30 ms y un factor de tiempo real superior a 15x.

La relevancia de esta ficha radica en que combina una arquitectura Conformer orientada a streaming con una tecnica de cuantizacion agresiva (modulos Conformer a 2 bits con Five-Value STE, convoluciones cuantizadas por filas a INT6 y una "Golden Shield" en FP16), lo que permite desplegar ASR persa en entornos con recursos muy limitados. La licencia Apache-2.0 facilita su uso comercial, aunque la informacion publica disponible es escasa y no incluye detalles sobre el dataset de entrenamiento ni resultados de benchmarks estandar.

El modelo se distribuye como un unico repositorio de 0,2 GB, con pipeline `automatic-speech-recognition`, idioma `fa` y etiquetas que indican soporte de streaming. No se han publicado descargas ni interacciones en el momento de la consulta, y la model card es fundamentalmente promocional, sin enlaces a paper, repositorio de codigo o evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Nemotron), 267 modulos Conformer cuantizados a 2 bits |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits (Five-Value STE) en modulos Conformer; INT6 row-quantized en convoluciones; FP16 en la "Golden Shield" (joint) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer de Nemotron, un transformer convolucional (Conformer) disenado para reconocimiento de voz, con 267 modulos Conformer cuantizados a 2 bits mediante una tecnica denominada Five-Value STE (straight-through estimator con cinco valores). Las convoluciones internas se cuantizan por filas a INT6, y el modulo de joint (probablemente en un esquema RNN-T o similar) se mantiene en FP16 bajo la denominacion "Golden Shield", que segun el autor garantiza un 0,00% de colapso del token blank. El modelo esta optimizado para streaming, con un factor de tiempo real superior a 15x y latencia inferior a 30 ms.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de destilacion o calibracion de la cuantizacion. La model card no enlaza a ningun paper, repositorio de codigo o informe tecnico que documente el procedimiento de cuantizacion ni la evaluacion. La afirmacion de "100% human-verified phonetic fidelity" no viene acompanada de metricas objetivas como WER o CER, por lo que no puede verificarse de forma independiente.

## Capacidades

- Reconocimiento automatico del habla (ASR) en persa (farsi), con salida de transcripcion.
- Procesamiento en streaming, adecuado para audio en tiempo real con latencia inferior a 30 ms.
- Inferencia de alta eficiencia: factor de tiempo real superior a 15x.
- Modelo unicamente de audio a texto; no se documentan capacidades de texto, vision, tool calling ni agentes.
- No se documenta soporte multilingue mas alla del persa.
- No se documentan modos especiales como thinking mode, audio generation o diarizacion.

## Casos de uso

- Transcripcion en tiempo real de reuniones y llamadas en persa: el modelo puede consumir audio por streaming y emitir texto con latencia inferior a 30 ms, lo que permite subtitulado en vivo o actas automaticas en entornos corporativos iranies.
- Subtitulado automatico para medios de comunicacion: gracias a su tamano de 198,96 MB y su alta velocidad (mas de 15x tiempo real), puede desplegarse en servidores modestos para generar subtitulos de videos o retransmisiones en persa.
- Asistentes de voz para atencion al cliente: integrado en un pipeline de ASR + NLU, el modelo transcribe consultas de usuarios en persa con bajo consumo de memoria, lo que reduce el coste por minuto de audio procesado.
- Transcripcion offline en dispositivos de borde: al ocupar menos de 200 MB, puede ejecutarse en mini-PC, Raspberry Pi o telefonos de gama alta para dictado o notas de voz sin conexion.
- Analisis de llamadas para cumplimiento normativo: la transcripcion en streaming permite indexar y buscar conversaciones telefonicas en persa para auditoria o deteccion de fraude.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para experimentos de cuantizacion extrema en lenguas menos representadas, comparando la degradacion de WER frente al modelo original de 2,4 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una "fidelidad fonetica verificada por humanos del 100%" y un "colapso del token blank del 0,00%", pero no proporciona valores de WER, CER ni comparaciones con otros sistemas. No se deben asumir cifras no documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para el modelo base de 0,6 B; el contenedor cuantizado de 198,96 MB puede ejecutarse con menos de 500 MB de memoria, aunque no se especifica el pico exacto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; se espera funcionamiento en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque no se documentan pruebas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: no se especifican; al ser un modelo de audio, requeriria un runtime compatible con la arquitectura FastConformer (por ejemplo, NeMo o un contenedor ONNX/TensorRT), pero no se confirma ninguno en la informacion disponible.
- Latencia y throughput: segun el autor, factor de tiempo real superior a 15x y latencia inferior a 30 ms en streaming; no se aportan mediciones de hardware ni de lote.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de ASR persa cuantizados a 2 bits ni datos de rendimiento que permitan una comparacion rigurosa con alternativas como Whisper o modelos Nemotron originales.

## Limitaciones y advertencias

- La model card es promocional y no incluye metricas objetivas (WER/CER) ni enlaces a evaluaciones independientes; las afirmaciones de "100% de fidelidad fonetica" no son verificables.
- Solo soporta persa (fa); no se documenta ningun otro idioma.
- No se especifica el formato de pesos ni el runtime necesario, lo que complica la integracion en produccion.
- La cuantizacion extrema a 2 bits puede degradar la precision en audio ruidoso, acentos o vocabulario tecnico, aunque no se aportan datos al respecto.
- Riesgo de alucinacion en transcripciones: como todo modelo ASR, puede generar texto plausible pero incorrecto en segmentos de silencio o ruido.
- No se documentan sesgos conocidos ni el origen de los datos de entrenamiento, lo que impide evaluar su representatividad.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio no tiene descargas ni validacion de la comunidad.
- El modelo fue creado y actualizado en octubre de 2026 segun los metadatos, pero no hay historial de versiones ni mantenimiento documentado.

## Enlaces

- HuggingFace: https://huggingface.co/ramin-mahmoodi/phonon-nemotron-0.6b-farsi-2bit
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
