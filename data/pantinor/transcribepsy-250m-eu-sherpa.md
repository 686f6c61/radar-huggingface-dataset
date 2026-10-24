# pantinor/transcribepsy-250m-eu-sherpa

## Resumen

TranscribePsy-250M-EU sherpa-onnx int8 es un export no oficial del modelo de reconocimiento automático del habla qvac/TranscribePsy-250M-EU, publicado por el usuario pantinor. El modelo base lo desarrolla Tether AI Research bajo licencia Apache-2.0: se trata de un FastConformer TDT de 254 millones de parámetros implementado en NeMo, destilado a partir de parakeet-tdt-0.6b-v3 y entrenado para 25 lenguas de la Unión Europea. Este repositorio no contiene pesos nuevos ni reentrena nada: convierte el modelo original al formato ONNX con cuantización int8 dinámica y fusiona los adaptadores de idioma CAFE dentro del grafo del encoder, de modo que las 24 lenguas no inglesas funcionan con un único paquete `nemo_transducer` de sherpa-onnx.

La relevancia práctica está en el empaquetado: encoder de 270 MB, decoder de 9 MB y joiner de 6 MB, con hashes SHA-256 fijados en `entry.json` y `SHA256SUMS`, importables directamente en la aplicación Anti-Vocale. Eso permite transcripción multilingüe en CPU sin GPU ni conexión, con un RTF medido de aproximadamente 0,016 en un portátil con chip de la serie M de Apple.

Las cifras de calidad publicadas por el autor son desiguales y conviene leerlas antes de adoptarlo: en FLEURS supera a whisper-small en italiano (7,1 frente a 8,0 WER) y empata en alemán (10,4 frente a 11,0), pero pierde claramente en francés (18,8 frente a 15,0) y en inglés (21,0 frente a 7,6). El propio autor lo etiqueta como export experimental y recomienda validarlo con audio propio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo FastConformer TDT (transducer token-and-duration); encoder + decoder + joiner exportados a ONNX |
| Parametros totales | 254 M (modelo base TranscribePsy-250M-EU) |
| Parametros activos | no disponible (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; la ventana de audio por segmento no se especifica en la información disponible) |
| Tipos de cuantizacion | int8 dinámica en este export; el modelo original se distribuye en fp32 |
| Idiomas soportados | 25 lenguas de la UE según la model card del modelo original; los 24 idiomas no ingleses se enrutan mediante adaptadores CAFE fusionados en el encoder. La lista completa de idiomas no se detalla en la información disponible |
| Licencia | no disponible en los metadatos del repositorio; el modelo original es Apache-2.0 (Tether AI Research) |
| Formato de pesos | ONNX (encoder 270 MB, decoder 9 MB, joiner 6 MB) más fichero de tokens |
| Runtime | sherpa-onnx, paquete `nemo_transducer` |
| Tamano del repositorio | 0,3 GB |
| Integridad | SHA-256 fijado en `entry.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un FastConformer TDT de NeMo: un encoder convolucional-aumentado con atención, un predictor/decoder y un joiner que predicen conjuntamente tokens y duraciones. Se destila a partir de parakeet-tdt-0.6b-v3, un modelo notablemente mayor (aproximadamente 600 M de parámetros), y añade adaptadores de idioma CAFE para cubrir 24 lenguas europeas además del inglés. Este repositorio no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste con RLHF o DPO; esos datos corresponden al modelo original y no se detallan en la información disponible.

La innovación de este export es de ingeniería de despliegue, no de modelado: los adaptadores CAFE se pliegan dentro del grafo del encoder ONNX para que un único paquete de sherpa-onnx atienda todos los idiomas, y los tres componentes se cuantizan a int8 dinámico (270 + 9 + 6 MB). El autor advierte de que el proceso de cuantización no es neutro: el encoder int8 cuesta al francés unos 5 puntos de WER frente a fp32 y puede emitir el token `unk` en apóstrofos.

## Capacidades

- Reconocimiento de voz (ASR) en 25 lenguas de la UE, con los 24 idiomas no ingleses gestionados por adaptadores CAFE dentro de un solo paquete.
- Transcripción en CPU sin GPU, con un RTF de aproximadamente 0,016 en portátiles con chip de la serie M de Apple.
- Decodificación transducer (TDT) con alineamiento token-duración, lo que permite modelar la duración de cada token; la exposición de timestamps en la salida no se detalla en la información disponible.
- Ejecución totalmente offline: el paquete es autónomo y no requiere servicios externos.
- Empaquetado verificable: hashes SHA-256 publicados para encoder, decoder, joiner y tokens.
- No soporta tool calling ni function calling: es un modelo acústico, no un LLM.
- No soporta razonamiento multi-paso, agentes, visión, audio de entrada más allá de la transcripción ni modo "thinking".
- Multilingüismo asimétrico: cobertura amplia en lenguas europeas, con degradación deliberada del inglés por el diseño de los adaptadores.

## Casos de uso

- Subtitulado y transcripción de escritorio offline: el paquete completo ocupa unos 285 MB int8 y se importa en Anti-Vocale desde `entry.json`, de modo que un usuario puede transcribir audio local sin enviar datos a la nube.
- Reuniones y notas de voz en italiano o alemán en portátiles sin GPU: con RTF cercano a 0,016 en CPU, una hora de audio se procesa en torno a un minuto en hardware de la serie M.
- Procesado por lotes en podcasts y archivos audiovisuales multilingües europeos: un único paquete cubre 24 idiomas, lo que simplifica el enrutado y evita mantener un modelo por lengua.
- Prototipado de asistentes de voz en el borde (edge): al ser ONNX y ejecutarse en CPU, encaja en aplicaciones de escritorio y dispositivos x86/ARM sin acelerador dedicado, aunque el rendimiento en teléfonos no está medido.
- Indexación y búsqueda de archivos de audio institucionales: transcripción previa de fondos documentales en lenguas de la UE para habilitar búsqueda por texto, con la ventaja de que el procesado puede hacerse íntegramente on-premise.
- Escenarios con requisitos de privacidad (sanidad, legal, administración): al no requerir conectividad, el audio no sale del equipo, lo que facilita el cumplimiento de políticas de tratamiento de datos.
- Investigación en adaptadores de idioma: sirve como banco de pruebas para medir el coste de la cuantización int8 sobre el rendimiento multilingüe frente al modelo fp32 original.

## Benchmarks y rendimiento

Resultados publicados por el autor en FLEURS con su propio arnés de 40 clips, comparados con whisper-small:

| Idioma | TranscribePsy-250M-EU int8 (WER) | whisper-small (WER) | Lectura |
|---|---|---|---|
| Italiano | 7,1 | 8,0 | Gana al baseline; parakeet TDT con 5,4 sigue siendo mejor |
| Aleman | 10,4 | 11,0 | Empate técnico |
| Frances | 18,8 | 15,0 | Pierde; el encoder int8 cuesta unos 5 puntos frente a fp32 y puede emitir `unk` en apóstrofos |
| Ingles | 21,0 | 7,6 | Pérdida deliberada por el diseño de los adaptadores CAFE; usar un modelo específico de inglés |

Medición de velocidad: RTF de aproximadamente 0,016 en CPU de un portátil con chip de la serie M. No hay datos publicados de WER agregado multilingüe, de otros idiomas distintos de los cuatro anteriores, ni de rendimiento en teléfonos.

## Requisitos de hardware

- VRAM: no requiere GPU; el paquete int8 completo pesa unos 285 MB (270 MB encoder + 9 MB decoder + 6 MB joiner) más el fichero de tokens.
- Memoria del sistema: no se publica una cifra oficial; por el tamaño del paquete, la inferencia es viable en equipos con 1-2 GB de RAM libre, aunque este dato no está confirmado en la información disponible.
- GPU recomendadas: no aplica; el export está pensado para CPU. No se han publicado cifras de aceleración con CUDA.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso, al estar diseñado para ejecución en CPU.
- Rendimiento medido: RTF de aproximadamente 0,016 en CPU de la serie M de Apple, es decir, del orden de 60 veces más rápido que el tiempo real.
- Rendimiento en móviles: no probado según el autor.
- Opciones de despliegue: sherpa-onnx con paquete `nemo_transducer`; importación en Anti-Vocale mediante Settings, Models, import entry URL apuntando a `entry.json`.
- vLLM, TGI, llama.cpp u Ollama no aplican: son runtimes de LLM y este es un modelo ASR en ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / cuantizacion | WER italiano (FLEURS) | WER frances (FLEURS) | Licencia |
|---|---|---|---|---|---|---|
| TranscribePsy-250M-EU sherpa int8 (este repo) | 254 M | 25 lenguas UE | ONNX int8 dinámica | 7,1 | 18,8 | no disponible en el repo; base Apache-2.0 |
| TranscribePsy-250M-EU original (qvac) | 254 M | 25 lenguas UE | fp32 (NeMo) | no disponible en la información proporcionada | no disponible (mejor que int8 según el autor) | Apache-2.0 |
| parakeet-tdt-0.6b-v3 | ~600 M | no disponible | NeMo | 5,4 | no disponible | no disponible |
| whisper-small | ~244 M | multilingüe amplio | varios | 8,0 | 15,0 | MIT (modelo original de OpenAI; verificar) |

El patrón es claro: frente a whisper-small, este export gana en italiano, empata en alemán y pierde en francés e inglés; frente a parakeet-tdt-0.6b-v3 pierde calidad pero ofrece un empaquetado mucho más ligero para CPU.

## Limitaciones y advertencias

- Inglés degradado por diseño: 21,0 WER en FLEURS frente a 7,6 de whisper-small. No usar este paquete para inglés; emplear un modelo específico.
- Francés por debajo del baseline (18,8 frente a 15,0) y propenso a emitir `unk` en apóstrofos; el autor atribuye unos 5 puntos de la pérdida a la cuantización int8 del encoder.
- Export experimental y no oficial: el propio autor pide validarlo con audio propio antes de confiar en él en producción.
- Sin datos de rendimiento en teléfonos; el RTF de 0,016 solo está medido en CPU de la serie M.
- No hay información sobre el dataset de entrenamiento del modelo base, la composición lingüística ni posibles sesgos acústicos (acentos, dialectos, ruido, edad o género de los hablantes).
- Riesgo de alucinación típico de ASR: inserción de texto en silencios o ruido, y errores en nombres propios, siglas y cifras.
- No se documenta soporte de puntuación, mayúsculas, diarización de hablantes ni timestamps en la salida.
- Licencia del export no declarada en los metadatos del repositorio (descargas 0, likes 0); la del modelo original es Apache-2.0, pero conviene confirmar los términos del empaquetado antes de un uso comercial.
- Dependencia de la aplicación Anti-Vocale para el flujo de importación descrito; otros consumidores de sherpa-onnx tendrían que construir el paquete manualmente.

## Enlaces

- Repositorio del export: https://huggingface.co/pantinor/transcribepsy-250m-eu-sherpa
- Modelo original: https://huggingface.co/qvac/TranscribePsy-250M-EU
- Ficheros de verificación citados en la model card: `entry.json` y `SHA256SUMS`, dentro del repositorio anterior.
- La búsqueda web realizada no devolvió enlaces técnicos relevantes (papers, blogs, repos o demos) sobre este modelo; no se dispone de más enlaces que los dos anteriores.
