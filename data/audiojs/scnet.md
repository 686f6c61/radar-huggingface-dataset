# audiojs/scnet

## Resumen

SCNet (Sparse Compression Network) es una red neuronal para separacion de fuentes musicales publicada en ICASSP 2024 por Tong, Zhu, Chen, Kang, Jiang, Li, Wu y Meng (arXiv:2401.13276). El modelo toma la mezcla estereo de una cancion y devuelve cuatro pistas independientes (stems): bateria, bajo, otros y voz. Esta ficha concreta corresponde a la exportacion a ONNX realizada por el proyecto audiojs a partir de los pesos oficiales, con cuantizacion mixta int8/float16 que reduce el archivo a 12,9 MB frente a los 42,8 MB del export en float32.

La arquitectura combina convoluciones band-split con LSTM de doble camino (dual-path) que operan directamente sobre el espectrograma complejo, con 10,1 M de parametros. El modelo fue entrenado por sus autores sobre MUSDB18-HQ y aqui se distribuye como un grafo ONNX autocontenido que incluye la STFT y la iSTFT, de modo que la entrada y la salida son tensores de espectrograma. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional, sino que trabaja por segmentos de audio de 11 segundos.

Su relevancia practica es doble. Por un lado, ofrece calidad de separacion cercana al estado del arte (SDR mediana de 9,88 dB en voz y 9,43 dB en bateria sobre las 50 previsualizaciones de test de MUSDB18) con un peso minimo. Por otro, al ser un unico archivo ONNX con licencia MIT, puede ejecutarse en CPU, en servidor con onnxruntime e incluso en el navegador via onnxruntime-web, sin dependencias de frameworks de deep learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convoluciones band-split sobre espectrograma complejo con LSTM de doble camino (dual-path); incluye STFT/iSTFT en el grafo |
| Parametros totales | 10,1 M (corresponde a SCNet-large a la mitad de ancho) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto linguistico; procesa un segmento de 11 s por pasada (485.100 muestras a 44,1 kHz, 476 frames tras padding), con segmentos solapados cada 2,75 s |
| Tipos de cuantizacion | int8 simetrico (77 de 82 tensores, 99,2 % de los valores) + float16 (5 tensores del decodificador); exportaciones en float32 (42,8 MB) y float16 (23,2 MB) disponibles |
| Idiomas soportados | no aplica (modelo de audio, no linguistico) |
| Licencia | MIT, Copyright (c) 2024 starrytong |
| Formato de pesos | ONNX (`scnet.int8.onnx`, 12.900.277 bytes) |

## Arquitectura y entrenamiento

SCNet opera sobre el espectrograma complejo de la mezcla estereo. La red aplica convoluciones band-split, que dividen el eje de frecuencias en bandas y procesan cada una por separado, intercaladas con LSTM de doble camino que modelan dependencias temporales y frecuenciales. Esta version concreta de 10,1 M de parametros corresponde a SCNet-large reducido a la mitad de ancho. El grafo exportado integra la STFT de entrada (n = 4096, hop = 1024, sin ventana, escalada por 1/√4096 y con padding reflectante) y la iSTFT de salida: la entrada es un tensor `mix_spec` de forma [1, 4, 2049, 476] (canal L real, L imaginario, R real, R imaginario) y la salida `stems_spec` de forma [1, 16, 2049, 476] (cuatro fuentes × dos canales × parte real e imaginaria).

El entrenamiento lo realizaron los autores originales sobre MUSDB18-HQ; la informacion disponible no detalla el numero de tokens ni la composicion exacta del dataset mas alla de esa fuente, ni si se aplicaron etapas de RLHF o DPO (no aplicables a un modelo de separacion de audio). La aportacion tecnica de esta publicacion es el propio proceso de exportacion y compactacion: 77 de los 82 tensores se almacenan en int8 con una escala simetrica por canal de salida (y por fila de puerta y direccion en las LSTM), mientras que los cinco tensores que cierran el decodificador se mantienen en float16 porque, redondeados a int8 por separado, desplazaban la salida entre 27 y 39 dB por debajo de su potencia y 23,4 dB en conjunto. Cada peso se multiplica por su escala dentro del grafo y onnxruntime pliega esa operacion al cargar, de modo que el calculo se realiza siempre en float32. La verificacion frente a `SCNet.forward` da un error maximo de 2,2e-6 respecto al maximo de la salida, y el pipeline completo coincide con 123-133 dB de SNR por stem. Sobre las previsualizaciones de calibracion, la compactacion introduce un error maximo de 1,1e-2 del maximo y una SNR de 42,4 dB.

## Capacidades

- Separacion de una mezcla musical estereo en cuatro stems: bateria, bajo, otros y voz.
- Procesamiento de audio a 44,1 kHz con ventanas de 11 segundos y solapamiento de segmentos con fundidos, segun el procedimiento `demix()` de Music-Source-Separation-Training.
- Salida en el dominio espectral complejo, lo que permite reconstruir las pistas mediante iSTFT integrada en el mismo grafo.
- Inferencia en CPU y en multiples backends de onnxruntime, incluido WebGPU en navegador.
- Comportamiento consistente en escenarios de remezcla: en las pruebas con voz a +6 dB y -6 dB y bateria a -6 dB, las metricas se mantienen practicamente identicas (18,23 → 18,23; 21,05 → 21,05; 20,91 → 20,92).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio-texto ni ninguna otra funcion propia de un modelo generativo de proposito general.
- No soporta multiples idiomas porque no procesa lenguaje: su unica entrada es audio.

## Casos de uso

- Produccion musical y remezclas: obtener los stems de una mezcla para reequilibrar niveles, sustituir una pista de bateria o construir una version alternativa de un tema sin acceso a las pistas originales.
- Karaoke y eliminacion de voz: la pista de voz alcanza 9,88 dB de SDR mediana, suficiente para atenuar la voz dejando la instrumentacion intacta en la mayoria de repertorio popular occidental presente en MUSDB18.
- Preprocesado de ASR y transcripcion de letras: separar primero la voz y alimentar despues un sistema de reconocimiento de habla o de letras reduce la interferencia instrumental, y el modelo puede ejecutarse en la misma maquina por su tamano de 12,9 MB.
- Analisis musical y music information retrieval: la separacion previa de bajo y bateria facilita la transcripcion automatica de lineas de bajo, la deteccion de tempo o la estimacion de estructura, tareas que mejoran cuando se trabaja sobre stems en lugar de sobre la mezcla.
- Aplicaciones web con privacidad local: al ser un archivo ONNX unico, se puede cargar con onnxruntime-web y procesar el audio en el navegador del usuario, sin enviar la cancion a un servidor. El grafo incluye sus propias matrices DFT para no depender de operadores que la sesion WebGPU no puede ubicar.
- DJ y mashups en directo: la separacion en cuatro stems permite construir transiciones, loops y combinaciones por pista con una latencia dominada por la ventana de 11 segundos, adecuada para preparacion offline o semiautomatica.
- Archivado y restauracion de grabaciones: recuperar stems utilizables de material cuya mezcla original se ha perdido y aplicar despues procesos de masterizacion diferenciados por fuente.
- Generacion de datos de entrenamiento: producir pares mezcla/stems a partir de un catalogo para entrenar otros modelos de separacion o de aumentacion de datos, con la ventaja de una licencia MIT que permite redistribuir el modelo dentro de herramientas derivadas con la atribucion correspondiente.

## Benchmarks y rendimiento

Metrica BSSEval v4 SDR (museval), mediana sobre canciones en dB, evaluada sobre las 50 previsualizaciones de test de MUSDB18:

| Version | vocals | drums | bass | other |
|---|---|---|---|---|
| Export float32 | 9,88 | 9,43 | 8,35 | 6,15 |
| Este archivo (int8 + float16) | 9,88 | 9,44 | 8,35 | 6,14 |

Variacion por cancion (mediana y cancion con mayor perdida):

| Stem | Mediana | Perdida maxima |
|---|---|---|
| vocals | +0,00 | -0,29 |
| drums | -0,00 | -0,04 |
| bass | -0,00 | -0,10 |
| other | -0,01 | -0,07 |

Notas de rendimiento aportadas en la model card: la perdida de 0,29 dB en voz corresponde a una cancion cuyo stem vocal esta practicamente en silencio (PR - Happy Daze, con -2,2 dB de SDR ya en el export float32). Si los 82 tensores se cuantizaran a int8 (12,8 MB), esa misma cancion perderia 2,6 dB, motivo por el que cinco tensores se conservan en float16. Una version con todos los pesos en float16 (23,2 MB) no altera ninguna mediana en mas de 0,001 dB. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: muy baja. El archivo ocupa 12,9 MB y la sesion de onnxruntime mantiene los pesos en float32, por lo que el consumo agregado de pesos y activaciones se mantiene en el orden de decenas o pocos cientos de megabytes durante el procesado de un segmento de 11 segundos.
- GPU recomendadas: no requiere GPU. Funciona en CPU de forma practicamente instantanea en terminos de memoria; cualquier GPU moderna (RTX 3060 o superior, T4, A100, H100) acelera el calculo, pero el modelo no esta dimensionado para necesitarlas.
- Cabe en cualquier GPU de consumo e integrada, asi que este criterio no es limitante. El caso de uso mas restrictivo es el navegador, donde el grafo puede ejecutarse con onnxruntime-web en WebGPU o WASM.
- Opciones de despliegue: onnxruntime en Python, C++, Java o .NET; onnxruntime-web en navegador; integracion en Node.js a traves del paquete `@audio/neural-separate` (`model: 'scnet'`). En la informacion disponible no se mencionan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que corresponden a modelos de lenguaje y no aplican aqui.
- Latencia y throughput: la model card describe el coste en terminos de una pasada de red por segmento de 11 segundos, con segmentos tomados cada 2,75 segundos. No se proporcionan cifras de latencia en milisegundos ni de throughput por segundo de audio en ninguna plataforma concreta; esos datos figuran como no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye parametros ni metricas de otros separadores de fuentes musicales, por lo que los datos de comparacion figuran como no disponibles. Las alternativas de la misma categoria que cabria considerar son:

| Modelo | Parametros | Contexto/ventana | SDR publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audiojs/scnet (esta ficha) | 10,1 M | 11 s por pasada | 9,88 vocals / 9,43 drums / 8,35 bass / 6,15 other | MIT | ONNX en HuggingFace |
| Demucs / HTDemucs | no disponible | no disponible | no disponible | no disponible | no disponible |
| Open-Unmix (UMX) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Spleeter | no disponible | no disponible | no disponible | no disponible | no disponible |

Se recomienda contrastar cualquier comparacion con las tablas publicadas por MUSDB18 y por las propias publicaciones de cada modelo, dado que las cifras de SDR solo son comparables si coinciden el conjunto de test, la metrica y el procedimiento de evaluacion (aqui, BSSEval v4 SDR con museval y mediana por cancion).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno sobre MUSDB18-HQ, un corpus limitado de musica comercial occidental con stems profesionales. Es previsible un rendimiento inferior en generos poco representados, grabaciones de baja calidad, mezclas monofonicas o material no occidental. No se han publicado analisis formales de sesgo en la informacion disponible.
- Riesgo de artefactos y alucinacion espectral: como todo separador generativo, puede introducir sonidos que no existen en la mezcla original o eliminar contenido real, especialmente en pasajes con instrumentacion densa o con stems de baja energia. El caso documentado de la cancion con voz casi silenciosa, con solo -2,2 dB de SDR, ilustra este limite.
- Limitaciones de la cuantizacion: la compactacion a int8 introduce un error maximo de 1,1e-2 respecto al maximo de la salida y una SNR de 42,4 dB frente al export float32. Es un deterioro bajo, pero conviene tenerlo en cuenta si se encadenan varias etapas de procesado o si se evalua con metricas muy sensibles.
- Restricciones de licencia: el modelo y el codigo se distribuyen bajo MIT, Copyright (c) 2024 starrytong, y el autor confirma por escrito que los pesos preentrenados de SCNet y SCNet-large pueden redistribuirse y convertirse de formato, incluidos los exports ONNX, con la atribucion correspondiente dentro de herramientas con licencia MIT. Sin embargo, MUSDB18-HQ esta licenciado para uso educativo y ningun proyecto ha zanjado si esa restriccion alcanza a los pesos derivados: conviene revisar ese punto antes de un uso comercial.
- Dependencia del procedimiento de segmentacion: la calidad depende de respetar el esquema de segmentos de 2,75 segundos, los fundidos y la normalizacion de `demix()`. Omitir ese preprocesado degrada la salida aunque el grafo sea correcto.
- Ambito de aplicacion: no es un modelo de texto ni de razonamiento. Cualquier expectativa de generacion de lenguaje, tool calling o agentes es ajena a su diseno.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de redactar esta ficha, y se publico el 7 de octubre de 2026, por lo que existe poca validacion externa independiente de la ofrecida por su autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audiojs/scnet
- Paper SCNet (ICASSP 2024): https://arxiv.org/abs/2401.13276
- Repositorio original y pesos: https://github.com/starrytong/SCNet (commit 5d95bf96b19c3eede63248d171efeca8e3abb948)
- Confirmacion de licencia MIT sobre los pesos: https://github.com/starrytong/SCNet/issues/35#issuecomment-4999873539
- Repositorio que distribuye el checkpoint: https://github.com/ZFTurbo/Music-Source-Separation-Training (release v1.0.6, config `config_musdb18_scnet.yaml`, codigo `models/scnet` en 84b1eac0887756b4f1a9d7a1ff49105939749ed2)
- Paquete de inferencia `@audio/neural-separate`: https://github.com/audiojs/neural/tree/main/packages/neural-separate
- Dataset MUSDB18-HQ (Rafii et al., 2019): no disponible como enlace directo en la informacion proporcionada.
