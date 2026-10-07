# audiojs/scnet-large

## Resumen

SCNet-large es un modelo de separacion de fuentes musicales (music source separation) que divide una cancion en cuatro pistas o stems: bateria, bajo, otros y voz. Lo desarrollan Weinan Tong, Jiaxu Zhu, Jun Chen, Shiyin Kang, Tao Jiang, Yang Li, Zhiyong Wu y Helen Meng, y se presento en ICASSP 2024 con el articulo "SCNet: Sparse Compression Network for Music Source Separation" (arXiv:2401.13276). La version que nos ocupa es un export a ONNX con pesos cuantizados a int8, publicado por el usuario audiojs como parte de su herramienta @audio/neural-separate.

El modelo emplea convoluciones band-split en torno a LSTMs dual-path que operan directamente sobre el espectrograma complejo. Tiene 41,2 millones de parametros y se entreno sobre MUSDB18-HQ. Esta implementacion concreta pesa 45,1 MB (frente a 169,2 MB del export float32 y 86,5 MB de una hipotetica version float16), lo que lo hace apto para inferencia en CPU, navegador y GPU de gama baja.

Su relevancia practica esta en el empaquetado: no se distribuye como checkpoint de PyTorch, sino como grafo ONNX autocontenido entre la STFT y la iSTFT, ejecutable desde JavaScript mediante @audio/neural-separate. Se publica bajo licencia MIT, con confirmacion explicita del autor de los pesos originales sobre la redistribucion de exports ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCNet (Sparse Compression Network): convoluciones band-split alrededor de LSTMs dual-path sobre espectrograma complejo |
| Parametros totales | 41,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 11 s (485.100 muestras a 44,1 kHz, con padding a 476 tramas), con avance cada 2,75 s |
| Tipos de cuantizacion | int8 (83 de 88 tensores, 99,2 % de los valores; escala simetrica por canal de salida, y por fila de puerta y direccion en las LSTM) y float16 (5 capas finales del decoder). Computo en float32 en todos los backends. Existen export float32 (169,2 MB) y float16 (86,5 MB) |
| Idiomas soportados | no disponible (modelo de audio; no procesa texto) |
| Licencia | MIT (Copyright (c) 2024 starrytong) |
| Formato de pesos | ONNX (archivo scnet-large.int8.onnx de 45.082.486 bytes, SHA-256 b2dc586a1e0e6c0afe4915e9057ea29111397b7bbf589edc3d85de91de79cd72) |

## Arquitectura y entrenamiento

La red se situa entre la STFT y la iSTFT: recibe `mix_spec` con forma [1, 4, 2049, 476] (parte real e imaginaria de los canales izquierdo y derecho) y devuelve `stems_spec` con forma [1, 16, 2049, 476] (cuatro fuentes x dos canales x parte real e imaginaria). La STFT usa ventana de 4096, hop de 1024, sin ventana aplicada, escalada por 1/sqrt(4096) y centrada con padding reflectivo. El modelo original tiene 41,2 M de parametros y fue entrenado por su autor sobre MUSDB18-HQ.

La innovacion del articulo es la "sparse compression": convoluciones band-split que reparten el espectro en bandas y las procesan con LSTMs dual-path, lo que reduce el coste frente a alternativas de mayor tamano manteniendo calidad de separacion. En este export, el grafo sustituye la rFFT temporal por productos de coseno y seno y reduce las estadisticas de GroupNorm eje a eje. La compaction a int8 se calibro con dos previews de entrenamiento de MUSDB18 y se verifica contra `SCNet.forward`: la diferencia maxima es de 2,8e-6 respecto al maximo de |y| en el export, y la pipeline del paquete coincide con `SCNet.forward` en sus segmentos con 114-134 dB de SNR por stem. Frente al export float32, en los previews de calibracion la diferencia maxima es de 7,1e-3 del maximo de |y| con 43,7 dB de SNR. El troceado en segmentos, los fundidos (fades) y la normalizacion de entrada siguen la funcion `demix()` de Music-Source-Separation-Training.

## Capacidades

- Separacion de una mezcla musical estereo en cuatro stems: bateria, bajo, otros y voz.
- Procesamiento de audio a 44,1 kHz en segmentos de 11 s con solapamiento de 2,75 s y fundidos.
- Ejecucion autocontenida del grafo: incluye la logica de STFT/iSTFT, de modo que el consumidor solo aporta las muestras de audio.
- Salida en el dominio espectral complejo, reutilizable para reconstruccion o para remezclas.
- Inferencia en float32 sobre pesos int8/float16, con cuantizacion simetrica de escala por canal de salida.
- Integracion directa en JavaScript mediante @audio/neural-separate (`model: 'scnet-large'`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), vision ni audio de entrada distinto del descrito.

## Casos de uso

- Karaoke automatico: se ejecuta el modelo sobre una pista estereo y se conserva la salida del stem de voz para cancelarla o atenuarla, aprovechando que el propio grafo entrega las cuatro fuentes ya alineadas.
- Remezclado y edicion por stems en produccion musical: las cuatro pistas permiten reequilibrar niveles o sustituir instrumentos sin volver a grabar, con una degradacion de calidad de 0,01 dB como maximo en la mediana de SDR respecto al export float32.
- Remasterizacion de archivos historicos: al separar bajo y bateria es posible aplicar compresion o ecualizacion independiente a cada elemento sin afectar a la voz.
- Extraccion de instrumentales para bibliotecas de contenido: generacion de versiones sin voz para videos, podcasts o streaming, en un flujo totalmente local al pesar el modelo 45,1 MB.
- Preprocesado para transcripcion musical o analisis: separar la pista de bajo o bateria facilita tareas posteriores de deteccion de tempo, transcripcion o analisis armonico.
- Aplicaciones en navegador: al ser ONNX y estar disenado para onnxruntime-web, permite separar audio en el cliente sin enviar el material a un servidor, util en herramientas de edicion web.
- Procesamiento por lotes en servidor: su tamano reducido permite mantener varias sesiones en una sola GPU o incluso ejecutar en CPU para catalogos grandes de canciones.
- Kits de practica musical: silenciar la pista de un instrumento concreto para estudiar o ensayar sobre la mezcla restante.

## Benchmarks y rendimiento

Metrica: BSSEval v4 SDR (museval), mediana sobre canciones, en dB, calculada sobre los 50 previews de test de MUSDB18.

| Version | vocals | drums | bass | other |
|---|---|---|---|---|
| export (float32) | 11,00 | 10,27 | 8,21 | 6,87 |
| este archivo (int8 ONNX) | 10,96 | 10,26 | 8,20 | 6,92 |

Cambio por cancion (mediana y la cancion que mas pierde): vocals -0,00 / -0,43; drums -0,00 / -0,03; bass -0,00 / -0,04; other +0,00 / -0,07. La perdida de 0,43 dB corresponde a una cancion cuyo stem de voz esta practicamente en silencio (PR - Happy Daze, -1,9 dB SDR en el export).

| Prueba de remezcla | Antes | Despues |
|---|---|---|
| vocals +6 dB | 20,21 | 20,22 |
| vocals -6 dB | 22,11 | 22,09 |
| drums -6 dB | 21,88 | 21,89 |

Los pesos en float16 (86,5 MB) no alteran ninguna mediana en mas de 0,002 dB. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja. El archivo en disco es de 45,1 MB, pero la sesion de onnxruntime mantiene los pesos en float32 tras plegar las escalas en carga, por lo que conviene reservar del orden de 169-200 MB para pesos y activaciones del grafo.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime es suficiente; no requiere A100, H100 ni modelos de datacenter. Una RTX 4090 o una GPU integrada moderna pueden ejecutarlo sin problema.
- GPU de consumo: si, cabe con amplio margen. El modelo es apto para portatiles y equipos de gama baja.
- CPU: la inferencia en CPU es viable dado el reducido numero de parametros; es la via habitual para ejecucion en navegador mediante WebAssembly.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web (WebGPU y WASM) y el paquete JavaScript @audio/neural-separate. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de separacion de audio.
- Nota de despliegue: las matrices DFT del grafo se construyen en float64 a partir de un Range, algo que la sesion WebGPU de onnxruntime-web no puede ubicar; por eso se almacenan plegadas como constantes.
- Latencia y throughput: no disponible. El unico dato operativo es que se procesa un segmento de 11 s con avance de 2,75 s, lo que implica solapamiento y varias pasadas por cancion.

## Comparativa con modelos similares

| Modelo / version | Parametros | Contexto | SDR (mediana) | Licencia | Formato |
|---|---|---|---|---|---|
| SCNet-large int8 ONNX (este archivo) | 41,2 M | segmentos de 11 s | 10,96 / 10,26 / 8,20 / 6,92 | MIT | ONNX int8, 45,1 MB |
| SCNet-large export float32 | 41,2 M | segmentos de 11 s | 11,00 / 10,27 / 8,21 / 6,87 | MIT | ONNX float32, 169,2 MB |
| SCNet-large export float16 (no publicado) | 41,2 M | segmentos de 11 s | sin diferencias superiores a 0,002 dB | MIT | ONNX float16, 86,5 MB |

No hay datos en la informacion proporcionada para comparar con otras familias de separacion de fuentes como Demucs (htdemucs) o MDX-Net: no se dispone de sus parametros, contexto, SDR ni licencia en este material, por lo que la comparacion cuantitativa queda como no disponible. La unica comparacion directa posible es entre formatos del mismo SCNet-large.

## Limitaciones y advertencias

- Solo separa cuatro stems fijos (bateria, bajo, otros, voz); no aisla instrumentos concretos dentro de "otros".
- Entrenado sobre MUSDB18-HQ, cuyo licencia es de uso educativo; ningun proyecto ha zanjado si esa restriccion alcanza a los pesos derivados. Conviene revisarlo antes de un uso comercial.
- La cuantizacion a int8 introduce una perdida maxima medida de 0,43 dB en la cancion con el stem de voz casi silencioso; en el resto de casos la mediana no cambia.
- Riesgo de artefactos y de confusion entre fuentes en pasajes con instrumentacion densa o mezclas poco convencionales, inherente a todo modelo de separacion.
- El procesado por segmentos de 11 s con avance de 2,75 s y fundidos puede producir discontinuidades sutiles en las uniones si se altera la pipeline de `demix()`.
- No procesa texto ni idiomas: cualquier expectativa de generacion, razonamiento o tool calling queda fuera de su alcance.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad mas alla de las cifras del autor del export.
- El rendimiento declarado se limita a SDR sobre MUSDB18; no hay datos de otros conjuntos ni de robustez fuera de dominio.
- Uso responsable: la separacion de voz permite aislar voces de grabaciones; en determinadas jurisdicciones el tratamiento de voces de terceros puede tener implicaciones legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audiojs/scnet-large
- Repositorio del autor de los pesos: https://github.com/starrytong/SCNet (MIT)
- Confirmacion de licencia MIT de los pesos: https://github.com/starrytong/SCNet/issues/35#issuecomment-4999873539
- Articulo SCNet (ICASSP 2024): https://arxiv.org/abs/2401.13276
- Repositorio que distribuye el checkpoint: https://github.com/ZFTurbo/Music-Source-Separation-Training (MIT)
- Paquete JavaScript de inferencia: https://github.com/audiojs/neural/tree/main/packages/neural-separate
