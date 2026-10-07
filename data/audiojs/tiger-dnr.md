# audiojs/tiger-dnr

## Resumen

TIGER-DnR es un modelo de separacion de fuentes de audio (source separation) orientado a bandas sonoras cinematograficas. Divide una pista de audio en tres stems: dialogo, musica y efectos. Lo desarrollaron Mohan Xu, Kai Li, Guo Chen y Xiaolin Hu (Universidad de Tsinghua) y se presento en ICLR 2025 bajo el nombre TIGER (Time-frequency Interleaved Gain Extraction and Reconstruction). Esta ficha concreta, publicada por el usuario audiojs, es una conversion a ONNX y cuantizacion a int8 del modelo original JusperLee/TIGER-DnR.

El modelo base son tres redes band-split de 1,4 M de parametros cada una (unos 4,2 M en total), con 57 bandas, convoluciones multi-escala y atencion de trama y frecuencia. Cada red separa las tres fuentes y conserva una, de modo que el conjunto produce los tres stems. La version aqui descrita integra las tres redes en un unico grafo ONNX que consume un espectrograma STFT y devuelve el espectrograma de los tres stems.

Es relevante porque reduce un modelo de separacion de audio a un fichero de 7,3 MB que puede ejecutarse en el navegador o en CPU, manteniendo practicamente intacta la calidad del export float32 (diferencias de decimas de dB de SNR). Esto facilita integrarlo en herramientas de edicion de audio, post-produccion y pipelines ligeros sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TIGER (Time-frequency Interleaved Gain Extraction and Reconstruction); tres redes band-split con convoluciones multi-escala y atencion de trama y frecuencia; export a ONNX |
| Parametros totales | Aproximadamente 4,2 M (tres modelos de 1,4 M cada uno) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio); procesa segmentos mono de 12 s (529.200 muestras a 44,1 kHz, 1034 tramas) |
| Tipos de cuantizacion | int8 (pesos de convolucion simetricos, escala por canal de salida); export float32 de origen de 28,6 MB; float16 previsto de 10,9 MB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`tiger.int8.onnx`); modelo original en safetensors |

## Arquitectura y entrenamiento

TIGER usa un diseno band-split: la senal se divide en 57 bandas de frecuencia y cada banda se procesa con convoluciones multi-escala mas modulos de atencion sobre la trama temporal y sobre la frecuencia. En la variante DnR (Divide and Remaster) hay tres redes de 1,4 M de parametros; cada una extrae las tres fuentes (dialogo, musica, efectos) y retiene una, de forma que el conjunto descompone la banda sonora completa. Esta publicacion empaqueta las tres redes entre su STFT y su iSTFT en un solo grafo ONNX. La STFT usa ventana de 2048, hop de 512 y ventana Hann sin normalizar, con relleno reflectante centrado; la entrada es `mix_spec` de forma [1, 2, 1025, 1034] (parte real e imaginaria) y la salida `stems_spec` de forma [1, 6, 1025, 1034] (real e imaginaria de los tres stems).

El modelo se entreno sobre el dataset Divide and Remaster v1, cuyos fragmentos provienen de FMA y FSD50K (cada uno bajo su propia licencia). El prompt no indica el numero de tokens ni si hubo RLHF o DPO, ya que no es un modelo de lenguaje. La version int8 se genero con calibracion sobre un clip de ajuste de Divide and Remaster v3: los 444 pesos de convolucion de mas de 1024 valores se almacenaron en int8 simetrico con una escala por canal de salida, desplazando la salida 41,4 dB por debajo de su potencia en el clip de calibracion (dentro del margen de 40 dB que el script admite antes de mantener un peso en float16). El grafo se calcula en float32 en todos los backends y se compacto de 56.652 a 38.817 nodos, acortando nombres; el fichero sin pesos pasa de 11,7 MB a 1,9 MB.

## Capacidades

- Separacion de fuentes de audio en tres stems: dialogo, musica y efectos.
- Procesamiento de audio mono a 44,1 kHz por segmentos de 12 s con ventana deslizante cada 4 s; los segmentos se suman sin ponderar, se rellenan con ceros en los extremos y el resultado se divide entre tres.
- Inferencia determinista sobre espectrogramas STFT, integrable como paso previo o posterior a otras etapas de audio.
- Ejecucion en distintos backends ONNX; el paquete asociado (`@audio/neural-separate`) lo invoca como `model: 'tiger'` y devuelve `stems.dialogue`, `stems.music` y `stems.effects`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente de audio (tarea audio-to-audio).
- No hay informacion sobre soporte multilingue (la evaluacion reportada usa el conjunto de test en ingles de Divide and Remaster v3).

## Casos de uso

- Post-produccion de cine y television: separar una mezcla final en dialogo, musica y efectos para reequilibrar niveles, sustituir la musica por una version con licencia distinta o exportar los stems a la mesa de mezclas.
- Remasterizacion de archivos: extraer el dialogo de grabaciones antiguas o de baja calidad para limpiarlo, ecualizarlo y recomponer la pista con los otros stems intactos.
- Doblaje y localizacion: aislar el dialogo original para emplearlo como referencia de doblaje o para sustituir unicamente la pista hablada manteniendo musica y efectos.
- Preprocesado para ASR: alimentar un sistema de reconocimiento de voz con el stem de dialogo en lugar de la mezcla completa, reduciendo la interferencia de musica y efectos.
- Edicion y creacion musical o de contenido en el navegador: al ser un ONNX de 7,3 MB, permite separar stems en el propio cliente web sin enviar el audio a un servidor.
- Realce de dialogo en podcasts, videojuegos o streaming: subir la claridad de la voz sin tocar la banda sonora, procesando en CPU o en GPU consumer.
- Archivado y catalogacion de audio: generar automaticamente stems etiquetados para bibliotecas de medios y buscadores internos.
- Herramientas ligeras en dispositivos: al ocupar pocos megabytes, puede desplegarse en entornos con recursos limitados donde un modelo grande de separacion no cabria.

## Benchmarks y rendimiento

Calidad medida como SNR en dB, mediana sobre clips, en el conjunto de test en ingles de Divide and Remaster v3. Comparacion del fichero int8 con el export float32 del que procede:

| Version | Dialogo | Musica | Efectos |
|---|---|---|---|
| Export (float32) | 15,74 | 5,85 | 9,06 |
| Este fichero (int8) | 15,74 | 5,84 | 9,05 |
| Cambio por clip (mediana / peor clip) | +0,00 / +0,00 | −0,02 / −0,02 | −0,00 / −0,00 |

Comparacion del export sobre 30 clips (uno de cada 40) frente a MRX:

| Modelo | Dialogo | Musica | Efectos |
|---|---|---|---|
| Export TIGER (float32) | 12,68 | 10,24 | 8,06 |
| MRX | 10,92 | 5,17 | 5,72 |

Verificacion del export frente a las tres pasadas `TIGER.forward` en un segmento de tonos y ruido: la diferencia maxima es <= 4,2e-7 del maximo de |y|, y el pipeline del paquete coincide con `TIGERDNR.wav_chunk_inference` con 95-140 dB de SNR por stem. La cuantizacion int8 tiene una diferencia maxima de 1,7e-2 respecto al export en el clip de calibracion, con SNR de 41,4 dB.

## Requisitos de hardware

- VRAM estimada: muy baja. El fichero int8 ocupa 7,3 MB; el export float32 del que procede, 28,6 MB. La inferencia cabe holgadamente en menos de 100 MB de memoria en ejecucion, dominada por los buffers de STFT.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 4090 u otra tarjeta moderna) lo ejecuta sin dificultad; tambien tarjetas de gama baja e integradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: ONNX Runtime en servidor y escritorio; onnxruntime-web en navegador; Node.js a traves del paquete `@audio/neural-separate`; el modelo original en safetensors puede desplegarse con PyTorch y el codigo de JusperLee/TIGER.
- Latencia y throughput: no disponible. Como referencia de diseno, cada ejecucion procesa un segmento de 12 s y la ventana avanza cada 4 s.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Rendimiento (dialogo / musica / efectos, SNR dB) |
|---|---|---|---|---|
| audiojs/tiger-dnr (esta ficha) | ~4,2 M (tres redes de 1,4 M) | ONNX int8, 7,3 MB | Apache 2.0 | 15,74 / 5,84 / 9,05 (mediana sobre clips) |
| JusperLee/TIGER-DnR (original) | ~4,2 M | safetensors (float32) | Apache 2.0 | 15,74 / 5,85 / 9,06 (mediana sobre clips) |
| MRX | No disponible | No disponible | No disponible | 10,92 / 5,17 / 5,72 (sobre 30 clips) |

La informacion proporcionada no incluye especificaciones de MRX mas alla de sus cifras de SNR, por lo que no es posible comparar parametros, contexto ni licencia con ese modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; el entrenamiento con Divide and Remaster (FMA y FSD50K) puede condicionar el rendimiento segun el tipo de contenido musical y de efectos presente en esos conjuntos.
- Riesgo de artefactos y no de alucinacion: al ser un modelo de audio no genera texto, pero la separacion imperfecta puede introducir artefactos o sangrado entre stems (por ejemplo, restos de musica en el stem de dialogo).
- Rendimiento desigual por stem: en las mediciones reportadas el stem de musica obtiene SNR notablemente mas bajo (en torno a 5-10 dB) que el de dialogo (12-16 dB), lo que conviene tener en cuenta si la musica es el foco de la aplicacion.
- Limitaciones de formato: entrada mono, segmentos de 12 s y una tasa de muestreo de 44,1 kHz en la STFT; otros formatos o tasas requieren remuestreo previo.
- Limitaciones de contexto o idioma: no hay informacion sobre cobertura multilingue; la evaluacion disponible se realizo sobre el conjunto de test en ingles de Divide and Remaster v3.
- Restricciones de licencia: los pesos y esta conversion se publican bajo Apache 2.0; el repositorio de codigo original usa licencia MIT mientras que su README muestra una insignia Apache 2.0, por lo que conviene revisar ambas antes de un uso comercial. Los fragmentos de FMA y FSD50K usados en el entrenamiento tienen cada uno su propia licencia.
- Caveat de produccion: la cuantizacion int8 se calibro sobre un unico clip de Divide and Remaster v3; aunque la perdida medida es minima, el comportamiento puede variar con material muy distinto al de calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audiojs/tiger-dnr
- Modelo base (pesos originales): https://huggingface.co/JusperLee/TIGER-DnR
- Codigo del modelo: https://github.com/JusperLee/TIGER
- Paper (ICLR 2025): https://arxiv.org/abs/2410.01469
- Paquete de inferencia en JavaScript: https://github.com/audiojs/neural/tree/main/packages/neural-separate
