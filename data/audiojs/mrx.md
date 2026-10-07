# audiojs/mrx

## Resumen

MRX es una red neuronal de separacion de fuentes de audio disenada especificamente para bandas sonoras de cine y television. Fue desarrollada por Darius Petermann, Gordon Wichern, Zhong-Qiu Wang y Jonathan Le Roux en Mitsubishi Electric Research Laboratories (MERL), y presentada en el articulo "The Cocktail Fork Problem: Three-Stem Audio Separation for Real-World Soundtracks" (ICASSP 2022, arXiv:2110.09958). Su tarea consiste en dividir una mezcla de audio en tres stems: dialogo, musica y efectos de sonido (sfx), en lugar de las separaciones musicales tradicionales de cuatro pistas.

El repositorio `audiojs/mrx` no es el modelo original en PyTorch, sino una exportacion a ONNX con pesos cuantizados a int8 realizada por el proyecto audiojs, pensada para ejecutarse en entornos ligeros (Node.js y navegador) a traves de `@audio/neural-separate`. La red tiene 30,5 millones de parametros y el archivo resultante ocupa 31,3 MB, frente a los 122,3 MB del export en float32 y los 61,5 MB que ocuparia en float16.

La relevancia de esta ficha esta en que permite ejecutar una separacion de audio de tres stems con calidad casi identica a la del modelo original (diferencias por debajo de 0,04 dB de mediana por clip) en hardware muy modesto, incluso en CPU o en el navegador, con licencia MIT y sin dependencia de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de separacion con mascaras: magnitudes STFT a tres resoluciones, una capa oculta, un BLSTM por fuente y una mascara real por fuente y resolucion |
| Parametros totales | 30,5 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; la entrada admite cualquier numero de frames T. En la practica se procesa en trozos de 20 s (upstream `separate.py`). Frecuencia de muestreo de 44,1 kHz |
| Tipos de cuantizacion | int8 simetrica (scale por canal de salida y, en el LSTM, por fila de puerta y direccion) en el archivo publicado; existen export float32 (122,3 MB) y float16 (61,5 MB) |
| Idiomas soportados | No disponible (el modelo es agnostico al idioma; fue evaluado con el conjunto de test en ingles de Divide and Remaster v3) |
| Licencia | MIT, Copyright (c) 2023 Mitsubishi Electric Research Laboratories (MERL) |
| Formato de pesos | ONNX (`mrx.int8.onnx`, 31.287.081 bytes, SHA-256 `d876c92d224f5d8cd2207d528b23369da895a6de71fb24132416fcb16f9f8424`) |

Detalle de la E/S del grafo ONNX:

| | nombre | forma |
|---|---|---|
| entrada | `mag_1024`, `mag_2048`, `mag_8192` | [B, 513, T], [B, 1025, T], [B, 4097, T] |
| salida | `mask_1024`, `mask_2048`, `mask_8192` | [B, 3, F, T] |

Las magnitudes se calculan con ventanas Hann de 1024, 2048 y 8192 muestras, hop 256, escalado 1/raiz(n) y relleno reflectante centrado, a 44,1 kHz.

## Arquitectura y entrenamiento

MRX toma las magnitudes STFT a tres resoluciones (1024, 2048 y 8192) como entrada, las proyecta en una unica capa oculta y aplica despues un BLSTM independiente por fuente. La salida es una mascara real por fuente y por resolucion (tres fuentes x tres resoluciones). La fuente reconstruida es la suma, sobre las tres resoluciones, de la iSTFT de su mascara multiplicada por el espectrograma de esa resolucion. Antes de la separacion, la entrada se normaliza a -27 LUFS y los stems se reescalan despues, segun el `separate.py` original.

El checkpoint original fue entrenado por MERL sobre Divide and Remaster (DnR) con la funcion de perdida SNR. Los fragmentos de musica y efectos del dataset provienen de FMA y FSD50K, cada uno bajo su propia licencia, algunos no comerciales. En esta exportacion concreta, los 39 tensores de pesos se almacenan en int8; el calculo se realiza en float32 en todos los backends, ya que cada peso lleva un `Cast` y una multiplicacion por su escala que onnxruntime pliega al cargar la sesion (la sesion mantiene los pesos en float32). Los nombres de nodos y valores estan acortados, y como la longitud de entrada es libre no se pliega ninguna dimension temporal.

La verificacion del export compara las fuentes reconstruidas desde el grafo con `MRX.forward` sobre ruido y tonos: diferencia maxima de 1,2e-6 respecto al maximo de |y|. El pipeline del paquete coincide con `separate_soundtrack` de upstream con 101-134 dB de SNR por stem. La compactacion a int8 se calibro con un clip de ajuste de Divide and Remaster v3: los pesos redondeados en conjunto desplazan los espectros enmascarados 40,4 dB por debajo de su potencia en el clip de calibracion, dentro del umbral de 40 dB que el script permite antes de mantener cualquier peso en float16.

## Capacidades

- Separacion de audio en tres stems: dialogo, musica y efectos de sonido (sfx), sobre bandas sonoras reales.
- Procesa audio de cualquier duracion, ya que el grafo admite longitudes T arbitrarias; en la practica se ejecuta por trozos de 20 s.
- Trabaja por canal de forma independiente (dimensión B), por lo que admite mono y multiples canales.
- Entrada a 44,1 kHz con triple resolucion STFT; salida como mascaras reales por fuente y resolucion.
- Integracion directa en JavaScript/Node.js mediante `@audio/neural-separate` (`model: 'mrx'`), que devuelve `stems.dialogue`, `stems.music` y `stems.effects`.
- Ejecutable sobre onnxruntime y onnxruntime-web, lo que habilita inferencia en navegador y en CPU.
- No realiza generacion de texto, razonamiento, codigo, vision, tool calling ni razonamiento multi-paso; es un modelo puramente de audio-audio.
- No dispone de modo "thinking" ni de capacidades multimodales mas alla del audio.
- Capacidad multilingue no aplicable: al operar sobre representaciones espectrales, no depende del idioma hablado, aunque el entrenamiento y la evaluacion se hicieron con material en ingles.

## Casos de uso

- Postproduccion de cine y television: separar una mezcla final en dialogo, musica y efectos permite reequilibrar niveles o sustituir la musica sin volver a la sesion multipista original, algo util cuando el proyecto original no esta disponible.
- Doblaje y localizacion: aislar el stem de dialogo para sustituirlo por la locucion en otro idioma y reutilizar musica y efectos intactos, reduciendo costes frente a una remezcla completa.
- Preprocesado para transcripcion automatica (ASR): alimentar al sistema de reconocimiento de voz unicamente el stem de dialogo elimina musica y efectos de fondo y mejora la precision en contenido audiovisual.
- Remasterizacion y restauracion de archivo: aplicar el modelo a grabaciones historicas o a copias con la mezcla ya "quemada" para recuperar pistas parciales y limpiar ruidos o musica no deseados.
- Generacion de versiones alternativas del mismo contenido: crear pistas music-and-effects (sin dialogo) para emisiones internacionales, versiones para audiodescripcion o pistas instrumentales.
- Indexacion y etiquetado de medios: detectar de forma automatica en que tramos de un catalogo hay musica, dialogo o efectos, para busqueda, recomendacion o generacion de subtitulos y metadatos.
- Edicion de audio en el navegador: al ejecutarse con onnxruntime-web y pesar solo 31,3 MB, permite separar stems en el cliente sin subir el audio a un servidor, lo que resuelve requisitos de privacidad y reduce costes de infraestructura.
- Generacion de datos de entrenamiento: producir pares (mezcla, stems) a partir de material ya mezclado para aumentar datasets de separacion de fuentes o de diarizacion.

## Benchmarks y rendimiento

La model card publica resultados de calidad sobre 30 clips del conjunto de test en ingles de Divide and Remaster v3 (uno de cada 40 de sus 1200 clips de 60 s; Watcharasupat, Wu, Orife, 2024, CC BY-SA 4.0), medidos por stem contra su referencia a lo largo de todo el clip. SNR, mediana sobre clips, en dB:

| Stem | Export float32 | Este archivo (int8) | Cambio por clip: mediana · peor clip |
|---|---|---|---|
| Dialogo | 10,92 | 10,92 | +0,00 · -0,01 |
| Musica | 5,17 | 5,17 | +0,00 · -0,04 |
| Efectos | 5,72 | 5,70 | +0,00 · -0,02 |

SI-SDR (media sobre clips): 9,819 · 2,804 · 3,275 para dialogo, musica y efectos, frente a 9,815 · 2,805 · 3,273 del export float32. En pruebas de remezcla (un stem 6 dB arriba o abajo contra la remezcla real), los valores quedan dentro de 0,03 dB de la mediana del export, sin ningun clip peor por mas de 0,04 dB. Los pesos en float16 (61,5 MB) no cambian ninguna mediana en mas de 0,001 dB.

Verificacion numerica del export: diferencia maxima de 1,2e-6 respecto a `MRX.forward` sobre ruido y tonos; 9,9e-3 respecto al export en el clip de calibracion (SNR 40,4 dB, la peor resolucion); y 101-134 dB de SNR por stem frente a `separate_soundtrack` de upstream.

No se han publicado resultados de benchmarks comparativos con otros modelos de separacion (como SDR en MUSDB18 o similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los casos; el archivo int8 ocupa 31,3 MB y la sesion de onnxruntime mantiene los pesos en float32 (equivalente a los 122,3 MB del export). El consumo dominante son los tensores intermedios de STFT de la resolucion de 8192, que crecen con la longitud del trozo.
- GPU recomendadas: no requiere GPU. Cualquier GPU con soporte de onnxruntime (RTX 3060, RTX 4090, A100, H100) acelera el proceso, pero la red es lo bastante pequena para que la CPU sea suficiente.
- Compatibilidad con GPU de consumo: si, en todas; tambien funciona sin GPU dedicada, en CPU, e incluso en el navegador via onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web (navegador), Node.js mediante `@audio/neural-separate` (`model: 'mrx'`). No se documentan pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Memoria en disco: 31,3 MB para el int8; 122,3 MB si se usa el export float32 y 61,5 MB en float16.
- Latencia y throughput: no disponibles en la informacion proporcionada. El pipeline procesa el audio en trozos de 20 s, lo que fija la granularidad de trabajo pero no el tiempo de computo.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MRX (esta ficha) | Separacion en 3 stems: dialogo, musica, efectos | 30,5 M | Audio a 44,1 kHz, cualquier duracion (trozos de 20 s) | SNR 10,92 / 5,17 / 5,70; SI-SDR 9,819 / 2,804 / 3,275 | MIT (MERL) | ONNX en HuggingFace, 31,3 MB int8 |
| Demucs (htdemucs, Meta) | Separacion musical en 4 stems: bateria, bajo, voces, otros | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | PyTorch, ampliamente desplegado |
| Open-Unmix (UMX) | Separacion musical por stems | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | PyTorch |
| Bandit (MERL) | Separacion de dialogo y musica en bandas sonoras | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Repositorio de MERL |

La diferencia funcional relevante es que MRX separa efectos de sonido ademas de dialogo y musica, una tarea distinta de la separacion musical clasica de cuatro stems, por lo que las comparaciones directas de metricas entre ambos grupos no son homogeneas. No se han encontrado en la busqueda web resultados comparativos verificables entre MRX y estas alternativas.

## Limitaciones y advertencias

- La calidad de separacion es desigual: el stem de dialogo alcanza 10,92 dB de SNR, pero musica y efectos se quedan en 5,17 y 5,70 dB respectivamente. La musica y los efectos separados pueden presentar artefactos y filtraciones del dialogo, por lo que no son adecuados como pistas finales sin revision.
- Las cifras de calidad proceden de un unico conjunto de evaluacion (30 clips del test en ingles de Divide and Remaster v3). El rendimiento fuera de ese dominio (otro tipo de mezclas, otros idiomas, musica en directo, grabaciones de baja calidad) no esta documentado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de contenido inventado, pero si existe riesgo de artefactos espectrales y de senales fantasma al reconstruir stems con mascaras, especialmente en pasajes densos.
- Normalizacion obligatoria: el pipeline exige normalizar la entrada a -27 LUFS y reescalar los stems a la salida. Omitir este paso cambia los niveles y puede degradar el resultado.
- Limitacion de licencia en los datos: aunque los pesos se distribuyen bajo MIT, el dataset de entrenamiento Divide and Remaster combina clips de FMA y FSD50K, cada uno bajo su propia licencia y algunos no comerciales. Conviene revisar este punto antes de un uso comercial, pese a que la licencia del checkpoint sea permisiva.
- El archivo publicado esta cuantizado a int8, lo que introduce una diferencia maxima de 9,9e-3 respecto al export float32 (SNR 40,4 dB). Para usos que requieran maxima fidelidad numerica, existe el export float32 de 122,3 MB.
- Procesa el audio en trozos de 20 s, lo que puede generar discontinuidades en las fronteras si no se aplica solapamiento o fundido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado del repo figura como 0.0 GB, por lo que se trata de una publicacion reciente y sin validacion de la comunidad.
- No hay soporte de idiomas declarado ni metadatos de idioma; al ser un modelo de audio no textual, la nocion de "idiomas soportados" no aplica directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audiojs/mrx
- Articulo original (ICASSP 2022): https://arxiv.org/abs/2110.09958
- Repositorio de MERL (modelo, codigo y checkpoint): https://github.com/merlresearch/cocktail-fork-separation
- Commit concreto referenciado: https://github.com/merlresearch/cocktail-fork-separation/tree/19b3de827ebc4bfb014570cf92dd32b4ee3b6921
- Fichero de metadatos de licencias del repositorio de MERL: https://github.com/merlresearch/cocktail-fork-separation/blob/19b3de827ebc4bfb014570cf92dd32b4ee3b6921/.reuse/dep5
- Paquete de inferencia `@audio/neural-separate`: https://github.com/audiojs/neural/tree/main/packages/neural-separate
- Licencia del modelo: https://huggingface.co/audiojs/mrx/blob/main/LICENSE
- Dataset Divide and Remaster v3 (Watcharasupat, Wu, Orife, 2024, CC BY-SA 4.0): enlace no disponible en la informacion proporcionada
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
