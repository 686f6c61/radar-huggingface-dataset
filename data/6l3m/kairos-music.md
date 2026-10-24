# 6l3m/kairos-music

## Resumen

kairos-music es un repositorio de espejo (mirror) publicado por 6l3m (clement poulain) que contiene dos modelos de audio en formato ONNX listos para ejecutarse en el navegador a través de onnxruntime-web 1.30 con el backend WebGPU. No se trata de un modelo entrenado por el autor: los pesos son copias byte a byte de sus exportadores originales, congeladas para que el editor de vídeo [kaairos](https://kaairos.app) descargue ficheros cuyo hash no pueda cambiar entre versiones.

Los dos componentes cubren tareas distintas dentro del pipeline de edición: **Beat This!** (Foscarin, Schlüter y Widmer, ISMIR 2024) detecta pulsos y compases en fragmentos con música para que la línea de tiempo pueda ajustarse y cortar clips sobre ellos; **HT-Demucs** (Défossez et al., Meta AI) separa la música de la voz para poder atenuar la primera por debajo de la segunda. Ambos se ejecutan en segundo plano, en un worker, mientras no hay reproducción activa.

El interés del repositorio es de ingeniería de despliegue más que de investigación: demuestra que un beat tracker basado en transformer y un separador de fuentes de tipo hybrid transformer pueden correr en una GPU integrada (Intel Iris Xe) dentro del navegador, con un total de unos 317 MB de pesos y latencias del orden de 13,9 s para una canción de 3 minutos (beats) y 0,37× el tiempo real (stems). La licencia es MIT, igual que la de ambos proyectos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: Beat This! (transformer sobre log-mel, exportado como grafo estático de 1500 frames) y HT-Demucs (hybrid transformer para separación de fuentes) |
| Parametros totales | No disponible. Estimación para Beat This!: ~47,7 M a partir de los 190 649 026 bytes en fp32; HT-Demucs: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio). Beat This!: ventana estática de 1500 frames; HT-Demucs: 21 piezas encadenadas por un manifiesto |
| Tipos de cuantizacion | No hay cuantización de usuario. Pesos publicados en fp32 (Beat This!) y fp16 salvo capas `Conv`/`ConvTranspose` (HT-Demucs) |
| Idiomas soportados | No disponible / no aplica (audio musical y voz, sin componente de texto) |
| Licencia | MIT (hereda la de ambos upstream: CPJKU/beat_this y facebookresearch/demucs) |
| Formato de pesos | ONNX (`beat_this.onnx`, `htdemucs_p00.onnx` … `htdemucs_p20.onnx`) + `mel-filterbank.bin` + `htdemucs_split_manifest.json` |
| Tamano del repositorio | 0,3 GB (190,6 MB Beat This!; 126,2 MB los 21 trozos de HT-Demucs; 262 656 B filterbank; 5 318 B manifiesto) |
| Pipeline declarado | audio-to-audio |
| Runtime objetivo | onnxruntime-web 1.30, backend WebGPU |
| Fecha de publicación | 2026-10-23 |

## Arquitectura y entrenamiento

El autor no entrena ningún modelo: el repositorio es un espejo de exportaciones ajenas. **Beat This!** procede del checkpoint `final0` de CPJKU/beat_this, exportado por musetric como un grafo estático de 1500 frames en fp32. El host (JavaScript) calcula la representación de entrada: log-mel monofónico a 22050 Hz, `n_fft` 1024, hop 441, ventana Hann periódica y `log1p(1000·x)` aplicado sobre el filtro mel de `mel-filterbank.bin`. La salida pasa por un post-procesado etiquetado como `minimal`, sin el postprocesado DBN que da título al paper original.

**HT-Demucs** proviene de facebookresearch/demucs (Meta AI) y fue troceado por monteslu en 21 subgrafos ONNX, en fp16 excepto las capas convolucionales, de modo que cada pieza constituye una submisión corta a GPU que la página puede intercalar con el renderizado de sus propios frames. La normalización de la pieza 0 se ejecuta en CPU. El repositorio no documenta el número de tokens, la composición del dataset de entrenamiento ni si hubo RLHF/DPO (no aplica en este dominio); toda esa información queda en los papers y repos upstream.

La innovación relevante aquí es de empaquetado: grafo estático con ventana fija, troceado en piezas pequeñas para evitar bloqueos largos de la GPU y hashes sha256 de cada fichero registrados en el repositorio de kaairos (`training/music/export.sha256`), de forma que el editor puede verificar que los pesos no han cambiado.

## Capacidades

- Seguimiento de pulsos (beat tracking) sobre audio musical, con salida de tiempos de beat.
- Seguimiento de compases (downbeat tracking), lo que permite alinear cortes a compás y no solo a pulso.
- Puntuación de confianza por frame: el pico de confianza de la red permite discriminar música de voz y ruido (ver benchmarks).
- Separación de fuentes con HT-Demucs: la model card documenta el caso concreto de separar música de voz para poder atenuar la música.
- Procesamiento en streaming por trozos: beats en ventanas de 1500 frames y stems en 21 piezas intercalables.
- Ejecución en navegador con WebGPU dentro de un Web Worker, sin servidor ni subida de audio.
- Entrada de audio monofónico a 22050 Hz en el caso de Beat This!, con log-mel calculado en el host.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión ni modo thinking: es un pipeline puramente audio-a-audio.

## Casos de uso

- **Ajuste de línea de tiempo a los beats en un editor de vídeo**: el editor ejecuta Beat This! en segundo plano, obtiene los tiempos de pulso y compás de la pista musical y permite que el imán de la timeline caiga sobre ellos; el modelo es adecuado porque devuelve también downbeats, que estructuran el clip por compases en lugar de por pulsos sueltos.
- **Corte automático de clips sobre el ritmo**: con los tiempos de beat se pueden generar cortes en cada pulso o cada compás sin intervención manual, un flujo habitual en montajes musicales y vídeos cortos.
- **Ducking automático de la música bajo la voz**: HT-Demucs separa música y voz y el editor baja la música (en la medición del autor, 13,4 dB) manteniendo la voz a 18,6 dB SI-SDR, lo que sustituye el sidechain manual en piezas con música de fondo.
- **Limpieza de audio de entrevistas o pódcast grabados con música de fondo**: separar la música permite atenuarla o eliminarla y dejar la locución limpia sin volver a grabar.
- **Herramientas de karaoke o eliminación de voz**: al disponer de la pista separada, se puede silenciar o reducir la voz para generar una versión instrumental en el navegador, sin subir el audio a un servidor.
- **Clasificación y triaje de clips en la biblioteca del editor**: el pico de confianza de Beat This! separó 46 clips musicales de 7 de voz y ruido sin solapamiento (≥ 0,9997 frente a ≤ 0,538), lo que sirve para decidir automáticamente a qué clips aplicar análisis rítmico.
- **Herramientas DJ, remezcla y edición rítmica en web**: alinear bucles y samples a compás usando beats y downbeats, con procesamiento local y sin latencia de red percibida por el usuario en el caso de una canción de 3 minutos (13,9 s en un worker).
- **Procesado por lotes en el cliente**: al ejecutarse en WebGPU y no requerir backend, permite analizar una biblioteca de clips en la máquina del usuario, lo que evita costes de inferencia en servidor y problemas de privacidad del audio.

## Benchmarks y rendimiento

Mediciones del autor en navegador sobre Intel Iris Xe, fechadas el 2026-10-23:

| Tarea | Metrica | Resultado | Condiciones |
|---|---|---|---|
| Beat tracking | F-measure de beat | 0,986 | 40 extractos de Ballroom, presentes en los datos de entrenamiento del modelo |
| Beat tracking | F-measure de downbeat | 0,984 | Mismos 40 extractos de Ballroom |
| Beat tracking | Tiempo de proceso | 13,9 s para una canción de 3 min (~12,9× tiempo real) | Ejecución en un Web Worker |
| Clasificación música/voz | Separación por pico de confianza | 46 clips musicales ≥ 0,9997; 7 clips de voz y ruido ≤ 0,538; sin solapamiento | Mismo hardware |
| Separación de fuentes | Reducción de la música | −13,4 dB | Voz 6 dB por debajo de la música en la mezcla |
| Separación de fuentes | Calidad de la voz | 18,6 dB SI-SDR | Misma mezcla |
| Separación de fuentes | Tiempo de proceso | 0,37× el tiempo real (~2,7× más rápido; ~67 s para 3 min) | Ejecución consecutiva de las 21 piezas |

Advertencia del propio autor: los 40 extractos de Ballroom pertenecen al conjunto de entrenamiento, por lo que la cifra de F 0,986/0,984 valida el port a ONNX, no la generalización a música nueva. No se han publicado resultados de benchmarks en la información disponible para otros conjuntos ni comparaciones con la implementación PyTorch original.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el conjunto completo de pesos ONNX suma unos 317 MB (190,6 MB en fp32 + 126,2 MB mayoritariamente fp16 + filterbank y manifiesto). No se especifica el consumo real de memoria en ejecución.
- GPU validadas: Intel Iris Xe (GPU integrada) con WebGPU, según la medición del autor. Cualquier GPU con soporte WebGPU en el navegador debería poder ejecutarlo, pero no hay cifras publicadas para otras.
- Cabe holgadamente en GPU de consumo (RTX 3060/4060/4090, Apple Silicon, e incluso iGPU), ya que el cuello de botella es el reparto en piezas y no la memoria.
- Despliegue: onnxruntime-web 1.30 con backend WebGPU, ejecutado en un Web Worker. No se documentan otras vías; al ser ONNX estándar podría plantearse onnxruntime nativo, pero el grafo estático de 1500 frames de Beat This! exige gestionar el padding de audio fuera de la ventana.
- No aplican vLLM, TGI, llama.cpp ni Ollama: no es un modelo de lenguaje.
- Throughput y latencia conocidos: 13,9 s por cada 3 min de audio en beats; 0,37× el tiempo real en separación de fuentes (mismo hardware de referencia).

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kairos-music (este repo) | ONNX fp32 + fp16, 21 piezas para Demucs | No disponible (~47,7 M estimados para Beat This!) | 1500 frames (beats); 21 piezas (stems) | Beat F 0,986 / downbeat F 0,984 en Ballroom (train); 18,6 dB SI-SDR en voz | MIT | HuggingFace, 0 descargas, 0 likes |
| CPJKU/beat_this (original) | PyTorch (`final0`) | No disponible | Ventana deslizante con postprocesado DBN | Referencia del paper ISMIR 2024 | MIT | GitHub |
| musetric/beat-this-onnx | ONNX | No disponible | Grafo estático de 1500 frames | Mismo checkpoint que aquí | No disponible en la información | HuggingFace |
| monteslu/htdemucs-web-onnx | ONNX | No disponible | Troceado en 21 piezas | Igual que aquí (mismo export) | No disponible en la información | HuggingFace |
| facebookresearch/demucs (original) | PyTorch | No disponible | Procesado por segmentos en GPU | Referencia de HT-Demucs | MIT | GitHub |

En la práctica no hay comparación de rendimiento entre alternativas: este repositorio es el mismo peso que sus dos fuentes, solo cambia el empaquetado y el runtime de destino. Frente al original en PyTorch, la diferencia es que aquí no hay postprocesado DBN en beats (el autor indica post-procesado `minimal`), lo que abarata el coste pero puede afectar a la suavidad temporal en música con tempo ambiguo; ese extremo no está cuantificado en la información disponible.

## Limitaciones y advertencias

- **Evaluación no independiente**: las cifras de beat tracking se obtuvieron sobre extractos de Ballroom incluidos en el entrenamiento; no hay medición en música nueva ni en otros estilos.
- **Ventana fija**: Beat This! se exporta como grafo estático de 1500 frames, lo que obliga al host a trocear y rellenar el audio; fragmentos más cortos que la ventana deben gestionarse con padding y recorte posterior.
- **Sin postprocesado DBN**: el autor declara post-procesado `minimal`, no el del paper; no se documenta el impacto en tempo variable, cambios de métrica o silencios largos.
- **Pesos inmutables por diseño**: el espejo es byte a byte y los sha256 están fijados, de modo que no se pueden recuantizar ni modificar los ficheros sin romper la verificación del editor.
- **Precisión mixta en los stems**: HT-Demucs se publica en fp16 salvo convoluciones, con la normalización de la pieza 0 en CPU; no se han publicado métricas de degradación frente al modelo PyTorch original.
- **Alcance funcional estrecho**: no genera texto, no razona, no hace tool calling; solo produce beats/compases/confianza y pistas separadas de audio.
- **Idiomas**: sin datos; el modelo de voz no está evaluado por idioma y la separación música/voz se midió con una única mezcla a 6 dB.
- **Licencia**: MIT en este repo y en ambos upstream, sin reclamación de autoría sobre los pesos; conviene conservar los avisos de copyright de JKU Linz y Meta AI al redistribuir.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; el proyecto depende del ecosistema kaairos y no hay garantía de mantenimiento ni de compatibilidad futura con onnxruntime-web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/6l3m/kairos-music
- Aplicación kaairos: https://kaairos.app
- Beat This! (código y paper ISMIR 2024): https://github.com/CPJKU/beat_this
- Export ONNX de Beat This! por musetric: https://huggingface.co/musetric/beat-this-onnx
- HT-Demucs de Meta AI: https://github.com/facebookresearch/demucs
- Export web ONNX de HT-Demucs por monteslu: https://huggingface.co/monteslu/htdemucs-web-onnx
