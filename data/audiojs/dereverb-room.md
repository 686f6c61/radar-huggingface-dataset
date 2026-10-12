# audiojs/dereverb-room

## Resumen

audiojs/dereverb-room es la conversion a ONNX (pesos en float16) del modelo de eliminacion de reverberacion de sala anvuew/dereverb_room. Se trata de un Band-Split RoFormer (BS-RoFormer) mono de 29,4 millones de parametros que recibe una voz grabada en una sala reverberante y devuelve esa misma voz "seca", separando la contribucion de la sala. El modelo original fue entrenado sobre voces mezcladas con respuestas de sala simuladas con pyroomacoustics, y su arquitectura procede del articulo "Music Source Separation with Band-Split RoPE Transformer" (Lu, Wang, Kong y Hung, ICASSP 2024, arXiv:2309.02612).

La relevancia de esta ficha concreta esta en el formato: el checkpoint original en PyTorch se ha reexportado a un unico grafo ONNX de 60,2 MB que se ejecuta con ONNX Runtime y esta etiquetado para WebGPU, lo que permite hacer dereverberacion en el navegador o en el edge sin enviar el audio a un servidor. El empaquetado lo firma audiojs, autor tambien de la libreria JavaScript @audio/neural-separate, que expone el modelo como `model: 'dereverb-room'`.

Es un modelo pequeno, especializado y no generativo: no es un LLM ni un modelo multimodal, sino un modulo de mejora de voz pensado para encadenarse delante de sistemas de reconocimiento automatico del habla, diarizacion o telefonia. Su licencia es GPL-3.0, heredada del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-Split RoFormer (BS-RoFormer): transformadores axiales sobre el tiempo y sobre 63 bandas contiguas del espectrograma complejo, dim 128, profundidad 16 |
| Parametros totales | 29,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de 8,7 s (384.000 muestras a 44,1 kHz, 751 frames) con salto de 4,35 s, fundido de 0,87 s y `num_overlap: 2` |
| Tipos de cuantizacion | pesos float16 con computo float32 (onnxruntime los convierte al cargar); el export float32 original ocupa 121,8 MB |
| Idiomas soportados | no disponible (procesa audio; la evaluacion publicada usa habla en ingles de VoiceBank) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (un unico archivo `dereverb-room.fp16.onnx`, 60.241.089 bytes, SHA-256 `99797e086a71d1cb57d50f3b5be93dcb7c89c49d1537c60487a488a24aaee9ee`) |
| Muestreo de entrada | STFT con n=2048, hop=512, ventana Hann de 2048, sin normalizar, centrada con relleno reflectante; salida identica en forma |
| Forma de los tensores | entrada `mix_spec` [1, 2, 1025, 751] (re, im); salida `stems_spec` [1, 2, 1025, 751] (re, im) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El grafo implementa exactamente lo que calcula `BSRoformer.forward` entre su STFT y su iSTFT. El modelo trabaja sobre el espectrograma complejo (parte real e imaginaria) de una unica senal mono, lo divide en 63 bandas contiguas de anchura variable y aplica atencion axial: transformadores sobre el eje temporal y sobre el eje de bandas, con embeddings rotatorios (RoPE) en lugar de posicionales aprendidos. La exportacion a ONNX se ha reorganizado para GPU: las bandas de anchura similar se agrupan en lotes, las normalizaciones se pliegan dentro de los pesos que alimentan, el embedding rotatorio se materializa como productos con tablas de coseno y seno, y ningun tensor supera los 100 MB. El proceso de verificacion compara el grafo float32 con el forward original sobre ruido y tonos puros, con una diferencia maxima de 2e-6 respecto al maximo de |y| en float32, y de 3,4e-3 en este archivo float16; el pipeline completo sobre 20 s alcanza 74 dB de SNR (123 dB en el export float32).

El entrenamiento original de anvuew se hizo con voces mezcladas con respuestas de sala simuladas con pyroomacoustics: `dereverb_room_anvuew_sdr_13.7432.ckpt` (SHA-256 `2edec521f09e26341c1923dc82c8c52dbc86478b42b9999f679535743c970cb3`) junto a su config `dereverb_room_anvuew.yaml`, en el commit `0b85f5b80b7f779b2dfe80f33a1b35b38af9376d` del repositorio anvuew/dereverb_room. El nombre del checkpoint sugiere un SDR de 13,7432, aunque no se especifica en la model card ni el conjunto de evaluacion ni las unidades. No hay datos publicados sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO; el codigo de entrenamiento e inferencia es el de ZFTurbo/Music-Source-Separation-Training (MIT, commit `84b1eac0887756b4f1a9d7a1ff49105939749ed2`, archivo `models/bs_roformer/bs_roformer.py`, derivado de BS-RoFormer de Phil Wang, MIT).

## Capacidades

- Eliminacion de reverberacion (de-reverb) de voz mono: convierte una grabacion con reverb de sala en una version seca, devolviendo dos pistas, `stems.dry` (la voz limpia) y `residual` (lo que el modelo atribuye a la sala).
- Eliminacion de reflexiones tempranas ademas de la cola reverberante tardia, no solo de la reverb final.
- Procesamiento por segmentos solapados: ventanas de 8,7 s con salto de 4,35 s, fundido de 0,87 s y relleno reflectante en los extremos, lo que permite tratar audios de cualquier duracion sin cortes audibles.
- Mejora de voz en presencia de ruido moderado: el rendimiento baja pero se mantiene con ruido DEMAND 10 dB por debajo de la voz.
- Inferencia en el navegador y en el edge mediante ONNX Runtime con soporte WebGPU, y en servidor o CPU con los mismos pesos.
- Integracion directa en JavaScript: `separate([voice], { sampleRate: 48000, model: 'dereverb-room' })` del paquete @audio/neural-separate, y `dereverb()` de la libreria `audio`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues en el sentido textual: es un modulo de procesamiento de senal, no un modelo de lenguaje.

## Casos de uso

- Preprocesado para reconocimiento automatico del habla (ASR): colocar el modelo delante de un motor ASR en grabaciones de sala mejora la relacion directa/reverberante de la entrada; en la evaluacion publicada eleva STOI de 0,774 a 0,940 y PESQ de 1,39 a 2,65 sobre las tomas de prueba.
- Reuniones y videollamadas: limpiar la senal de microfonos de sala antes de codificarla o de pasarla a un sistema de transcripcion, ya que la reverb es una de las causas habituales de error en habla lejana.
- Postproduccion de podcast y entrevistas: recuperar inteligibilidad en tomas grabadas en salas con T60 de 0,38 a 1,85 s, el rango cubierto por el conjunto de evaluacion (MIT IR Survey).
- Procesamiento local en el navegador con WebGPU: al pesar 60,2 MB y ejecutarse con ONNX Runtime, la dereverberacion puede hacerse en el cliente sin subir el audio a un servidor, lo que simplifica el cumplimiento de privacidad en herramientas de grabacion o dictado.
- Edicion de audio en dispositivos moviles o integrados: el tamano reducido del modelo permite empaquetarlo en aplicaciones nativas o en el edge para limpiar notas de voz antes de enviarlas.
- Diarizacion y reconocimiento de hablante: reducir la cola reverberante mejora las representaciones de corto plazo que usan estos sistemas, especialmente en salas grandes.
- Archivado y restauracion de audio: tratar grabaciones historicas o de campo con reverberacion antes de catalogarlas o de aplicarles reduccion de ruido.
- Etapa previa en pipelines de separacion de fuentes: como la guarda de la libreria `audio` desvia la musica, el modelo encaja mejor como pre-limpiador en cadenas centradas en voz.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card proceden de la medicion mediante `dereverb()` de la libreria `audio` (`bench/rx/dereverb.mjs`, split de test): 42 enunciados de test de VoiceBank y cuatro tomas de 41-60 s en 19 salas del MIT IR Survey (Traer y McDermott, PNAS 2016; T60 de 0,38 a 1,85 s), con cada respuesta dividida en directo + 50 ms. Se reportan PESQ y STOI contra la toma seca, DNSMOS P.835 OVRL, y "tail" (potencia de la salida donde la parte tardia esta 10 dB por encima de la temprana).

| Sistema | PESQ | STOI | OVRL | Cola (dB) |
|---|---|---|---|---|
| Tomas originales (sin procesar) | 1,39 | 0,774 | 2,19 | no disponible |
| Este modelo (ONNX fp16) | 2,65 | 0,940 | 2,98 | -15,6 |
| iZotope RX 12 De-reverb, ajustado | 1,45 | 0,779 | 2,32 | -2,3 |
| iZotope RX 12 Dialogue Isolate, reverb desactivado | 1,79 | 0,837 | 2,70 | -8,3 |

Datos adicionales del mismo informe: en las tomas largas la mejora es de 1,37 a 2,58 (cola de -17,5 dB); con ruido DEMAND 10 dB por debajo de la voz, de 1,26 a 1,70 (frente a 1,33 de RX Dialogue Isolate); y sobre voces ya secas, de 4,64 a 4,55, con la octava de 125 Hz 2,1 dB por debajo. No se han publicado resultados de benchmarks de otro tipo (SDR por conjunto de datos, WER tras ASR, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso del modelo: 60,2 MB en float16 y 121,8 MB el export float32 equivalente.
- VRAM estimada: muy por debajo de 1 GB. Los tensores de trabajo tienen forma [1, 2, 1025, 751] en float32 (unos 6 MB por tensor), por lo que el grafo completo, con la restriccion de "ningun tensor por encima de 100 MB" declarada por el autor, cabe en cualquier GPU moderna e incluso en memoria compartida.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime (CUDA, DirectML o WebGPU). No requiere A100 ni H100; una GPU integrada o una RTX de gama baja es suficiente, y la ejecucion en CPU es viable.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas graficas integradas; el cuello de botella es mas bien el ancho de banda de memoria que la capacidad.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, WebGPU), el paquete npm @audio/neural-separate con `model: 'dereverb-room'`, y `dereverb()` de la libreria `audio`. No aplica el ecosistema de servidores de LLM (vLLM, TGI, llama.cpp, Ollama), porque no es un modelo de lenguaje. Conversiones a otros runtimes (TensorRT, OpenVINO, Core ML) no estan documentadas.
- Latencia y throughput: no disponibles. El modelo procesa unidades de 8,7 s de audio (751 frames) con un salto de 4,35 s, pero no se publican tiempos de ejecucion ni factor de tiempo real por hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | PESQ | STOI | OVRL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| audiojs/dereverb-room | 29,4 M | ONNX fp16 | 2,65 | 0,940 | 2,98 | GPL-3.0 | HuggingFace, ejecutable en navegador |
| anvuew/dereverb_room | 29,4 M | checkpoint PyTorch (.ckpt + .yaml) | mismos pesos; no evaluado por separado en esta model card | mismos pesos | mismos pesos | GPL-3.0 | HuggingFace, requiere el codigo de ZFTurbo |
| iZotope RX 12 De-reverb | no disponible (propietario) | binario comercial | 1,45 | 0,779 | 2,32 | propietaria | producto comercial |
| iZotope RX 12 Dialogue Isolate (sin reverb) | no disponible (propietario) | binario comercial | 1,79 | 0,837 | 2,70 | propietaria | producto comercial |

Frente al modelo base, esta copia aporta el grafo ONNX y los pesos en float16 con una perdida de precision acotada (3,4e-3 de diferencia maxima frente a 2e-6 en float32). Frente a las herramientas comerciales de la comparativa, el modelo abierto obtiene mejores cifras de PESQ, STOI y OVRL en el mismo banco de pruebas, aunque la comparacion de iZotope se hizo con RX 12 en su configuracion ajustada.

## Limitaciones y advertencias

- Licencia GPL-3.0: es copyleft. Integrar estos pesos en un producto propietario obliga a revisar las condiciones de distribucion del conjunto; la model card indica que la copia convertida queda bajo los mismos terminos que el checkpoint original.
- No es un separador general de fuentes: elimina la reverberacion, pero tambien las reflexiones tempranas y todo lo que no sea voz. Segun el informe, la musica pierde 6 dB en su peor octava tal cual y 9 dB dentro de una sala, por lo que la libreria `audio` la desvia con una guarda.
- Monofonico y canal a canal: cada ejecucion procesa un unico canal; no hay datos publicados sobre coherencia entre canales en material estereo.
- Entrenado con salas simuladas con pyroomacoustics: existe una brecha de dominio potencial frente a grabaciones reales con ruido, microfonos y respuestas no simuladas.
- Robustez limitada al ruido: con ruido DEMAND 10 dB por debajo de la voz la mejora cae a 1,26 → 1,70 de PESQ, ligeramente por encima de RX Dialogue Isolate (1,33), es decir, el modelo no sustituye a un supresor de ruido.
- Colorea ligeramente la voz ya seca: PESQ baja de 4,64 a 4,55 y la octava de 125 Hz queda 2,1 dB por debajo, por lo que aplicarlo a material sin reverb no es neutro.
- Perdida de fidelidad numerica en float16: el export fp16 reduce la SNR del pipeline de 123 dB a 74 dB respecto al grafo float32; en usos de medida o masterizacion hay que tenerlo en cuenta.
- Idiomas y sesgos: no se documentan idiomas soportados; la evaluacion publicada usa VoiceBank, un corpus de habla en ingles, por lo que el comportamiento en otras lenguas y acentos no esta cuantificado. No hay informacion sobre sesgos demograficos.
- Riesgo de artefactos: como todo modelo generativo de mascaras espectrales, puede introducir artefactos musicales o "burbujeo" en senales muy degradadas; no se publican estudios de robustez fuera de los conjuntos citados.
- Adopcion nula por el momento: el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, y es una conversion de terceros, no el checkpoint de referencia.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados correspondian a guias del videojuego Resident Evil Requiem), por lo que no hay fuentes externas adicionales que citar mas alla de las del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audiojs/dereverb-room
- Modelo base (checkpoint original de anvuew): https://huggingface.co/anvuew/dereverb_room
- Articulo de la arquitectura: "Music Source Separation with Band-Split RoPE Transformer" (Lu, Wang, Kong, Hung, ICASSP 2024), https://arxiv.org/abs/2309.02612
- Codigo de entrenamiento e inferencia: https://github.com/ZFTurbo/Music-Source-Separation-Training (archivo `models/bs_roformer/bs_roformer.py`)
- Implementacion original de BS-RoFormer: https://github.com/lucidrains/BS-RoFormer
- Paquete JavaScript de inferencia: https://github.com/audiojs/neural/tree/main/packages/neural-separate
- Libreria de audio que expone `dereverb()`: https://github.com/audiojs/audio
- Referencias citadas en la model card sin URL publicada en la informacion disponible: pyroomacoustics (simulacion de salas para el entrenamiento), MIT IR Survey de Traer y McDermott (PNAS 2016) y el corpus VoiceBank usado en la evaluacion.
