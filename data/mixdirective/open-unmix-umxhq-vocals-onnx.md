# MixDirective/open-unmix-umxhq-vocals-onnx

## Resumen

open-unmix-umxhq-vocals-onnx es la exportación a formato ONNX de la red de separación de voces del modelo Open-Unmix UMX-HQ, publicada por el usuario MixDirective. Se trata de un modelo de separación de fuentes musicales que, a partir de la magnitud del STFT de una mezcla estéreo a 44,1 kHz, estima la magnitud correspondiente al stem de voz. No genera audio ni texto de forma directa: su salida es una magnitud estimada que el consumidor debe convertir en máscara, aplicarla sobre el STFT complejo original e invertir la transformada.

El modelo deriva de Open-Unmix, la implementación de referencia publicada por Inria (Stöter, Uhlich, Liutkus y Mitsufuji, 2019) y entrenada sobre MUSDB18-HQ. Los pesos originales (`vocals-b62c91ce.pth`) se mantienen sin cambios en float32; la única modificación es la conversión de la red de voces a ONNX opset 17, con eje de frames dinámico y lote fijo de 1.

Su interés es fundamentalmente de despliegue: elimina la dependencia de PyTorch y permite ejecutar la separación en CPU con ONNX Runtime. El autor lo utiliza dentro de una aplicación de escritorio para aislar la voz antes de alinear letras, y reporta que las palabras alineadas con error inferior a 0,5 s pasan del 77,6 % sobre la mezcla completa al 85,5 % tras la separación, frente al 87,4 % que se obtiene con los stems vocales originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente bidireccional (biLSTM) sobre la magnitud del STFT, exportada desde Open-Unmix |
| Parámetros totales | Aproximadamente 8,9 M (estimación a partir de los 35.623.512 bytes del fichero ONNX en float32; no declarado por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El eje de frames es dinámico; el autor recomienda dar al modelo varios segundos de contexto a cada lado al procesar por fragmentos |
| Tipos de cuantización | No disponible. Solo se distribuyen pesos float32 |
| Idiomas soportados | No disponible (modelo de audio; no procesa texto) |
| Licencia | MIT (© 2019 Inria para los pesos originales) |
| Formato de pesos | ONNX, opset 17 (`model.onnx`, 35.623.512 bytes, SHA-256 `f27742bb52b24cb039614dc76d0764e279df3eb2a9d6daa82c6daee3369ec747`) |

## Arquitectura y entrenamiento

La red es un modelo de separación en el dominio espectral: recibe la magnitud de un STFT de una señal estéreo a 44,1 kHz (n_fft 4096, hop 1024, ventana Hann periódica, centrado con relleno por reflexión, equivalente a `torch.stft`) con forma `[1, 2, 2049, frames]` y devuelve una magnitud estimada de la voz de la misma forma. El núcleo es una LSTM bidireccional, tal como describe la model card. En esta exportación, el grafo se ha trazado a través de un envoltorio que repite `OpenUnmix.forward` con eje de frames dinámico, porque la implementación original lee el número de frames como un entero de Python y el trazado lo habría congelado. El lote está fijado a 1 y la entrada estéreo es fija.

Un aspecto relevante es qué queda fuera del grafo: el STFT, el iSTFT y el filtrado de Wiener no forman parte de la exportación. El consumidor debe calcular la magnitud de entrada, dividir la salida por esa magnitud, recortar el resultado a [0, 1] para obtener una máscara de ratio, multiplicar el STFT complejo de la mezcla por dicha máscara e invertir. Los pesos no se han modificado (float32) y la salida de ONNX coincide con la de PyTorch con un margen de 5e-6. El entrenamiento es el del modelo original: UMX-HQ, entrenado por los autores de Open-Unmix sobre MUSDB18-HQ, con pesos publicados bajo licencia MIT en Zenodo. La model card no detalla composición del dataset, número de tokens ni uso de RLHF o DPO.

## Capacidades

- Separación de la fuente vocal a partir de una mezcla musical estéreo, estimando la magnitud del stem de voz en el dominio del STFT.
- Funcionamiento como estimador de máscara: la salida permite construir una máscara de ratio para filtrar la señal compleja.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de PyTorch ni de GPU.
- Integración en aplicaciones de escritorio, móviles o servicios, dado el reducido tamaño del grafo (35,6 MB).
- Preprocesado para tareas posteriores: el autor la emplea para aislar la voz antes de la alineación de letras.
- Procesado por fragmentos con solapamiento temporal, aprovechando el carácter bidireccional de la LSTM.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de visión, audio generativo o modo de razonamiento.
- Solo cubre el stem de voces; no separa batería, bajo u otros instrumentos.

## Casos de uso

- Alineación automática de letras: el modelo aísla la voz de la mezcla y mejora la precisión temporal de la alineación. En la evaluación del autor, la proporción de palabras con error inferior a 0,5 s sube del 77,6 % al 85,5 %.
- Karaoke y pistas de acompañamiento: aplicar la máscara estimada permite atenuar la voz y conservar el resto de la mezcla, útil en aplicaciones de reproducción con cancelación vocal.
- Transcripción de letras (speech-to-text sobre música): reducir la interferencia instrumental antes de pasar el audio a un sistema de reconocimiento mejora la inteligibilidad de la voz.
- Extracción de stems para producción musical y remezclas: obtener una pista vocal limpia para reutilizarla en remixes o ediciones, ejecutable en local sin subir el audio a un servicio externo.
- Análisis musicológico y académico: calcular métricas sobre la línea vocal (tono, dinámica, densidad de eventos) con la voz aislada.
- Aplicaciones de escritorio con procesado local: el tamaño de 35,6 MB y la independencia de PyTorch permiten distribuir el modelo dentro de un instalador y ejecutarlo en CPU, con tiempos de 1 a 2 s por canción en un portátil según el autor.
- Preprocesado en lote sobre catálogos musicales: al no requerir GPU, se puede paralelizar por procesos en servidores modestos para separar voces de bibliotecas completas.
- Prototipado en entornos sin PyTorch: integrar la separación vocal en aplicaciones C++, JavaScript u otras mediante el runtime de ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (SDR, SIR, SAR u otros) en la información disponible. El único dato de evaluación es informal, sobre cinco canciones con tiempos de palabra corregidos manualmente:

| Métrica | Mezcla completa sin separar | Tras la separación con este modelo | Stems vocales originales |
|---|---|---|---|
| Palabras alineadas con error < 0,5 s | 77,6 % | 85,5 % | 87,4 % |

| Métrica de rendimiento | Valor |
|---|---|
| Tiempo de separación | 1-2 s por canción en CPU de portátil (ONNX Runtime) |
| Fidelidad frente a PyTorch | Diferencia máxima de 5e-6 en la salida |
| Datos de throughput en GPU | No disponible |

## Requisitos de hardware

- VRAM: no requiere GPU. El fichero de pesos ocupa 35,6 MB en float32 y los tensores intermedios son pequeños: una magnitud de 30 s a 44,1 kHz con hop 1024 ocupa aproximadamente 21 MB (`[1, 2, 2049, ~1292]` en float32).
- CPU: suficiente para inferencia en producción. El autor reporta 1-2 s por canción en la CPU de un portátil.
- GPU recomendadas: no son necesarias. Cualquier GPU compatible con ONNX Runtime (CUDA, TensorRT o DirectML) puede acelerar el proceso, pero no hay cifras publicadas.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada (Raspberry Pi, portátiles, móviles con suficiente memoria).
- Despliegue: ONNX Runtime en CPU o GPU, con integración vía API de Python, C++, C#, Java o JavaScript. También se puede consumir desde OpenVINO o TensorRT.
- No aplica a vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia para modelos de lenguaje.
- Latencia: 1-2 s por canción en CPU según el autor. El coste depende de la duración del audio y del solapamiento usado al procesar por fragmentos.
- Nota: al ser una LSTM bidireccional, procesar el audio en fragmentos sin solapamiento puede degradar los bordes de cada bloque; conviene usar varios segundos de contexto a cada lado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-unmix-umxhq-vocals-onnx | biLSTM sobre STFT de magnitud | Solo voces | ONNX Runtime | MIT | HuggingFace |
| Open-Unmix UMX-HQ (original) | biLSTM sobre STFT de magnitud | Voces, batería, bajo y otros (redes independientes) | PyTorch | MIT | GitHub de sigsep y Zenodo |
| Demucs v4 (htdemucs) | Modelo híbrido de convoluciones y transformer | Voces, batería, bajo y otros | PyTorch | MIT | GitHub de Facebook Research |
| Spleeter | Red de tipo U-Net sobre espectrograma | Configuraciones de 2, 4 y 5 stems | TensorFlow | MIT | GitHub de Deezer |

Frente al Open-Unmix original, esta exportación solo incluye la red de voces, pero elimina la dependencia de PyTorch y reduce la huella de despliegue. Demucs v4 y Spleeter cubren más stems y suelen obtener mejor calidad de separación en métricas SDR, a cambio de modelos de mayor tamaño y de dependencias más pesadas (PyTorch o TensorFlow). La información disponible no incluye comparativas cuantitativas de SDR, SIR o SAR entre estos modelos, por lo que no es posible establecer una jerarquía numérica con los datos proporcionados.

## Limitaciones y advertencias

- El grafo no incluye el STFT, el iSTFT ni el filtrado de Wiener: el consumidor debe implementar todo el preprocesado y el postprocesado. La salida es una magnitud, no una señal de audio.
- Solo separa el stem de voces; no produce batería, bajo ni otros instrumentos.
- El lote está fijado a 1 y la entrada estéreo es fija: no admite procesado por lotes ni audio mono sin adaptación previa.
- Al ser una LSTM bidireccional, el procesado por fragmentos sin contexto suficiente puede introducir artefactos en los bordes.
- No se distribuyen versiones cuantizadas (int8 u otras), lo que limita optimizaciones adicionales de latencia.
- La evaluación publicada es informal y se realizó sobre cinco canciones, con una única tarea downstream (alineación de letras). No hay métricas formales de calidad de separación ni validación en un conjunto de test amplio.
- El repositorio registra 0 descargas y 0 me gusta, por lo que no existe validación por parte de la comunidad.
- Las fechas de creación y actualización del repositorio en HuggingFace aparecen como septiembre de 2026, un valor anómalo respecto a la fecha de publicación del modelo original.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright original (© 2019 Inria) y citar el trabajo de Open-Unmix.
- Riesgo de sesgo de dominio: el modelo se entrenó sobre MUSDB18-HQ, un conjunto limitado de géneros y condiciones de grabación; el rendimiento puede degradarse en mezclas con características muy distintas.
- No hay información sobre el tratamiento de voces cantadas en otros idiomas, coros densos, voces procesadas con efectos o mezclas monofónicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MixDirective/open-unmix-umxhq-vocals-onnx
- Repositorio de Open-Unmix: https://github.com/sigsep/open-unmix-pytorch
- Pesos originales UMX-HQ en Zenodo: https://doi.org/10.5281/zenodo.3370489
- Artículo de Open-Unmix (JOSS, 2019): https://doi.org/10.21105/joss.01667
- Conjunto de datos MUSDB18-HQ: https://sigsep.github.io/datasets/musdb.html
- ONNX Runtime: https://onnxruntime.ai
