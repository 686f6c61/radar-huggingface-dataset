# seanll95/sidon-coreml

## Resumen

`seanll95/sidon-coreml` es una conversion a Core ML del modelo de restauracion de voz `sarulab-speech/sidon-v0.1`, preparada por el usuario seanll95 para ejecutarse en el Neural Engine de un iPhone. No es un modelo nuevo ni un ajuste fino: los pesos son los del modelo original, sin modificar, y lo que cambia es el grafo que los rodea para que compile y se ejecute en hardware Apple. Se distribuye bajo licencia MIT heredada del modelo base.

Sidon no repara la forma de onda, sino que re-sintetiza la voz a partir de caracteristicas semanticas de w2v-BERT. La conversion mantiene esa premisa: entrada a 16 kHz, salida a 48 kHz y duracion preservada. El repositorio incluye dos paquetes Core ML en fp16 (codificador de 468 MB y decodificador de 101 MB) mas un binario de 84 KB con las constantes del extractor de caracteristicas (ventana Povey de 400 tomas y banco de filtros mel de 257 x 80).

Su relevancia es practica: demuestra que un modelo de restauracion de voz de este tamano puede correr en el Neural Engine a 11,2 veces tiempo real en un iPhone, con una degradacion medida de 1,7 dB respecto a GPU que se concentra por encima de 16 kHz. Lo usa la aplicacion Excerpt, un reproductor de audiolibros para iOS, para limpiar narraciones con ruido o apagadas directamente en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador conformer (salida oculta de 1024 dimensiones) mas decodificador DAC reconstruido; grafo convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; ventana de audio fija de 300 tramas (aproximadamente 6 s) en el codificador y 68 tramas por llamada en el decodificador, con halo de 12 tramas por lado |
| Tipos de cuantizacion | fp16 en ambos `.mlpackage`; constantes del front-end en float32; no se publican variantes int8, GGUF ni otras |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; opera sobre caracteristicas semanticas de w2v-BERT) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | `.mlpackage` sin compilar (Core ML), mas `sidon_fbank.bin` con las constantes del extractor |
| Tamano del repositorio | 0,6 GB |
| Ficheros incluidos | `sidon_encoder_ane.mlpackage` (fp16, 468 MB), `sidon_decoder_ane.mlpackage` (fp16, 101 MB), `sidon_fbank.bin` (float32, 84 KB) |
| Entradas y salidas fijas | Codificador: `feats` `[1, 300, 160]` a `hidden` `[1, 300, 1024]`. Decodificador: `feat` `[1, 1024, 68]` a `[1, 1, 65280]` |
| Frecuencias de muestreo | 16 kHz de entrada, 48 kHz de salida, duracion preservada |
| Modelo base | `sarulab-speech/sidon-v0.1` |
| Libreria | coreml |
| Pipeline | audio-to-audio |
| Etiquetas | speech-enhancement, coreml, ios, neural-engine |
| Descargas y likes | 0 descargas, 0 likes |
| Fecha declarada de creacion | 2026-09-16 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La conversion envuelve la arquitectura original de Sidon: un codificador de tipo conformer que consume caracteristicas de w2v-BERT y un decodificador DAC (Descript Audio Codec) que re-sintetiza la onda. El autor no ha entrenado ni ajustado nada; el trabajo se concentra en cuatro intervenciones sobre el grafo. Primera, el extractor de caracteristicas sale del modelo: el codificador recibe directamente las caracteristicas fbank apiladas de 160 dimensiones y `sidon_fbank.bin` transporta la ventana Povey de 400 tomas y los filtros mel de 257 x 80 del `SeamlessM4TFeatureExtractor` de `facebook/w2v-bert-2.0`, de modo que se reproduzcan exactamente en el dispositivo. Segunda, la longitud se fija a 300 tramas (6 s) por llamada porque el compilador del Neural Engine agota memoria al expandir las tablas de posicion relativa con 600 tramas; con 300 el modelo compila y ejecuta el 99,3 % de la computacion en el Neural Engine.

Tercera, el decodificador DAC original es un modulo TorchScript congelado cuyas activaciones Snake no se pueden convertir, asi que se reconstruyo en Python a partir de la configuracion del repositorio con los pesos transplantados y se verifico bit a bit. Sus capas `ConvTranspose1d`, que el Neural Engine calcula mal (perdida de 53 dB de SNR en una sola capa), se sustituyen por una forma sub-pixel equivalente de dos convoluciones cuyas salidas se intercalan; como todas las capas cumplen `kernel == 2 * stride`, la sustitucion es exacta (`max|d| 0.0` en PyTorch) y ademas resulta 1,65 veces mas rapida en la GPU del iPhone. Cuarta, la salida en diccionario del codificador se reescribe como tensor plano porque Core ML no tiene operacion de diccionario, con una verificacion de la cirugia frente al original con tolerancia de 1e-5.

No se detallan en la informacion disponible los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). Esa informacion corresponderia a la model card de `sarulab-speech/sidon-v0.1`, no a este repositorio, que es unicamente una conversion.

## Capacidades

- Restauracion y mejora de voz: re-sintetiza la voz a partir de caracteristicas semanticas de w2v-BERT en lugar de reparar la forma de onda.
- Re-muestreo integrado: acepta audio a 16 kHz y produce audio a 48 kHz manteniendo la duracion original.
- Inferencia en dispositivo: ejecucion en el Neural Engine de iPhone con `MLComputeUnits.cpuAndNeuralEngine`, sin conexion a red ni envio de audio a servidores.
- Procesado de audio largo mediante ventanas solapadas: el codificador trabaja en bloques de 300 tramas y el decodificador en bloques de 68 tramas con halo de 12 tramas por lado, lo que permite reconstruir una llamada larga con una fidelidad de 120 dB.
- Ejecucion a 11,2 veces tiempo real en caliente en un iPhone, frente a 4,8 veces usando solo CPU, una diferencia relevante porque una aplicacion iOS en segundo plano no puede usar la GPU.
- Extraccion de caracteristicas nativa: calculo de fbank con las constantes exactas del extractor original, evitando el desplazamiento de tramas que produciria recalcularlas con una formula.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No se declaran capacidades multilingues especificas ni vision, audio de entrada distinto de voz o modo de pensamiento.

## Casos de uso

- Limpieza de audiolibros en iOS: es el caso real declarado por el autor, usado por la aplicacion Excerpt, que aplica el modelo sobre la narracion para eliminar ruido y apagamiento sin salir del dispositivo.
- Restauracion de podcasts grabados con movil: una grabacion capturada a 16 kHz se procesa ventana a ventana en el propio terminal antes de publicarse, evitando subir material sin editar a un servicio externo.
- Preprocesado de corpus para entrenamiento de TTS: se limpia y homogeneiza la narracion de un corpus a 48 kHz manteniendo la duracion, lo que simplifica el alineado posterior con transcripciones existentes.
- Mejora previa a transcripcion automatica: al aplicarse antes de un sistema ASR, reduce el ruido y el apagamiento de entrevistas o notas de voz grabadas en condiciones pobres.
- Notas de voz y asistentes en el dispositivo: aprovecha la ventana de 6 segundos del codificador para limpiar fragmentos cortos en tiempo real sin coste de red, con 11,2 veces tiempo real en un iPhone.
- Aplicaciones de accesibilidad: mejora de inteligibilidad de grabaciones antiguas o de baja calidad para personas con dificultades auditivas, ejecutandose localmente en el telefono.
- Archivado y digitalizacion de entrevistas historicas ya muestreadas a 16 kHz: reconstruccion a 48 kHz con duracion preservada para su publicacion en linea.
- Edicion de audio en movilidad: integracion en flujos de postproduccion ligera donde no se dispone de GPU ni de estacion de trabajo, gracias a la ejecucion en Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, que no aplican a un modelo de audio. Lo que si se publican son mediciones de fidelidad y velocidad de la conversion:

| Metrica | Valor reportado |
|---|---|
| Ejecucion en Neural Engine | 99,3 % de la computacion |
| Perdida de SNR con ventanas de 300 tramas frente a ventanas de 12 s | aproximadamente 2 dB |
| Diferencia Neural Engine frente a GPU | 1,7 dB peor; diferencia concentrada por encima de 16 kHz, 52 dB por debajo; dentro de 0,4 dB en la banda de voz |
| Perdida de SNR por `ConvTranspose1d` mal calculada en Neural Engine | 53 dB en una sola capa (corregida con la forma sub-pixel) |
| Equivalencia de la forma sub-pixel en PyTorch | `max\|d\| 0,0` |
| Reconstruccion de audio largo mediante solape | 120 dB |
| Verificacion de la conversion de la salida de diccionario | 1e-5 frente al original |
| Velocidad en iPhone en caliente | 11,2 veces tiempo real |
| Velocidad en iPhone usando solo CPU | 4,8 veces tiempo real |
| Aceleracion de la forma sub-pixel en la GPU del iPhone | 1,65 veces |
| Prueba de escucha ciega y aleatorizada | PyTorch, todo GPU, GPU mas Neural Engine y todo Neural Engine no se distinguen entre si |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; los pesos ocupan 468 MB (codificador fp16) mas 101 MB (decodificador fp16), unos 569 MB, a los que se suma el binario de 84 KB y el espacio de trabajo de compilacion e inferencia.
- GPU recomendadas: no aplica; el objetivo es el Neural Engine de Apple (iPhone y, por extension, silicio Apple con ANE). No hay soporte declarado para A100, H100 o RTX 4090.
- Cabe en hardware de consumo: si, es su proposito. Se ejecuta en un iPhone con Neural Engine, con `MLComputeUnits.cpuAndNeuralEngine`.
- Opciones de despliegue: Core ML en iOS o macOS. Los `.mlpackage` estan sin compilar y deben compilarse en el dispositivo con `MLModel.compileModel(at:)`, cacheando el resultado; la primera compilacion puede tardar un minuto o mas. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 11,2 veces tiempo real en caliente en un iPhone; 4,8 veces tiempo real usando solo la CPU, que es la comparacion relevante para audio largo en segundo plano.
- Estrategia de memoria del decodificador: el Neural Engine limita cada dimension de tensor a 65536 y la salida es de 960 muestras por trama, de ahi el limite de 68 tramas por llamada; se debe ejecutar en ventanas solapadas con halo de 12 tramas por lado y conservar solo la parte central.

## Comparativa con modelos similares

La informacion disponible solo permite comparar la conversion con su modelo de origen. No hay datos de rendimiento de alternativas en el material proporcionado.

| Modelo | Formato y plataforma | Longitud de procesamiento | Licencia | Disponibilidad de datos |
|---|---|---|---|---|
| `seanll95/sidon-coreml` | Core ML, Neural Engine de Apple | 300 tramas de codificador, 68 de decodificador | MIT | Ficha tecnica con mediciones de SNR y velocidad |
| `sarulab-speech/sidon-v0.1` | Pesos originales, ejecucion en Python y GPU | Sin longitud fija | MIT | Model card del autor original; no consultada en esta busqueda |
| Otras alternativas de restauracion de voz (DeepFilterNet, Resemble Enhance, VoiceFixer, FRCRN) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Diferencias concretas frente al original: la conversion impone ventanas fijas por limitaciones del compilador, externaliza el extractor de caracteristicas, sustituye las convoluciones traspuestas por una forma sub-pixel y reescribe la salida de diccionario del codificador. A cambio de esas restricciones, pasa de requerir una GPU o CPU de escritorio a ejecutarse integramente en el Neural Engine de un telefono.

## Limitaciones y advertencias

- Sidon re-sintetiza la voz en lugar de restaurarla de forma fiel: sobre audio limpio el resultado cambia tanto como sobre audio danado. No es una restauracion exacta de la grabacion original.
- La ventana fija de 300 tramas (6 s) en el codificador reduce la precision: el conformer usa contexto de largo alcance y se miden unos 2 dB menos de SNR frente a ventanas de 12 s, aunque el autor indica que resulto inaudible en pruebas ciegas.
- La salida en Neural Engine es 1,7 dB peor que en GPU por el uso de fp16 y la ventana corta; la diferencia se situa por encima de 16 kHz, 52 dB por debajo, y se mantiene dentro de 0,4 dB en la banda de voz.
- La entrada debe estar a 16 kHz. Cualquier otra frecuencia requiere un remuestreo previo no incluido en el paquete.
- Las caracteristicas fbank se normalizan por locucion: hay que calcularlas una sola vez sobre un tramo largo y trocear las caracteristicas, nunca el audio.
- El decodificador esta limitado a 68 tramas por llamada; hay que usar ventanas solapadas con halo de 12 tramas y deslizar la ultima ventana, sin rellenarla con ceros, porque cada ventana debe contener tramas reales.
- La primera compilacion en el dispositivo puede tardar un minuto o mas y debe cachearse; conviene tenerlo en cuenta en la experiencia de arranque de una aplicacion.
- Dependencia total de la plataforma Apple: no hay ruta de ejecucion en CUDA, ROCm ni aceleradores de otros fabricantes.
- No se declaran idiomas soportados ni evaluaciones por idioma; el comportamiento en lenguas distintas de las usadas en el entrenamiento original no esta documentado.
- El repositorio no declara sesgos conocidos, riesgos de alucinacion ni limitaciones especificas adicionales.
- Licencia MIT heredada del modelo original, sin restricciones de uso comercial declaradas en esta ficha. La atribucion corresponde a los autores de Sidon.
- El repositorio presenta 0 descargas y 0 likes, sin validacion independiente publica, y la fecha declarada de creacion (2026-09-16) resulta anomala segun los metadatos disponibles.
- No se proporcionan datos de entrenamiento, numero de parametros ni evaluaciones objetivas de calidad de voz (PESQ, STOI u otras) en la informacion disponible.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/seanll95/sidon-coreml
- Modelo base: https://huggingface.co/sarulab-speech/sidon-v0.1
- Extractor de caracteristicas referenciado (`SeamlessM4TFeatureExtractor` de w2v-BERT 2.0): https://huggingface.co/facebook/w2v-bert-2.0
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados correspondian a guias de inicio de sesion sin contrasena en Windows y cuentas de Microsoft, sin relacion con el repositorio.
