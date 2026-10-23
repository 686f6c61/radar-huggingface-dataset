# jenila-ai/beat-this-small0-onnx

## Resumen

Beat This! small0 (ONNX) es la conversión al formato ONNX, en precisión fp32, del checkpoint small0 de Beat This!, un sistema de seguimiento de pulso (beat tracking) y de tiempos fuertes de compás (downbeat tracking) desarrollado por el Institute of Computational Perception de la Universidad Johannes Kepler de Linz (JKU). El modelo original se mantiene en el repositorio CPJKU/beat_this y su función es anotar, muestra a muestra de audio, la posición de cada pulso musical y de cada primer tiempo de compás.

La versión que nos ocupa la publica el usuario jenila-ai como un único fichero `beat_this_small0.onnx` bajo licencia MIT, con el SHA-256 documentado en la model card. El interés práctico es que elimina la dependencia de PyTorch: el modelo se puede ejecutar con ONNX Runtime en CPU, en servidores sin GPU o incluso en el navegador mediante onnxruntime-web, lo que lo hace adecuado para aplicaciones interactivas de análisis rítmico en tiempo real.

No obstante, la información publicada es muy escasa: no se detallan el número de parámetros, la arquitectura interna, el dataset de entrenamiento ni resultados de benchmarks. Además, el repositorio no registra descargas en el momento de la consulta, por lo que se trata de una conversión reciente y sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo neuronal para audio; el autor no detalla la topología) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; procesa ventanas de hasta 1.500 frames (≈30 s a 50 frames/s) según la conversión ONNX de referencia |
| Tipos de cuantizacion | Solo fp32 (el autor publica la variante fp32) |
| Idiomas soportados | No aplica (audio; independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `beat_this_small0.onnx`) |
| Frecuencia de muestreo de entrada | 22,05 kHz mono (según la conversión ONNX de referencia) |
| Representación de entrada | Espectrograma log-mel de 128 bandas a 50 frames/s |
| Salidas | Logits de beat y de downbeat por frame |
| Tamano del repositorio | 0,0 GB (redondeado en HuggingFace) |
| SHA-256 del fichero | `1dbbac9e2410debf083d4002f2c2b12b61a42b3cde9b0f6fb27cc9e1b61e7517` |

## Arquitectura y entrenamiento

La model card no describe la topología de la red, el número de parámetros ni el proceso de entrenamiento (volumen de datos, composición del corpus, uso de RLHF/DPO u otras técnicas). Lo único documentado es la procedencia: es una conversión directa del checkpoint small0 del proyecto Beat This! del JKU Linz, un modelo especializado en detección de beats y downbeats sobre audio musical. El sufijo «small0» indica que se trata de la variante de menor tamaño de la familia, aunque no se publica su cómputo exacto.

A partir de la conversión ONNX de referencia del mismo modelo se conoce el preprocesado esperado: audio mono a 22,05 kHz convertido a un espectrograma log-mel de 128 bandas con 50 frames por segundo, calculado con convoluciones en lugar de la operación STFT para facilitar la exportación. El modelo consume ese espectrograma en fragmentos de como máximo 1.500 frames (unos 30 segundos de audio) con tamaño de lote fijo de 1 y devuelve logits de beat y downbeat por frame. No se han documentado innovaciones adicionales de decodificación o atención en la información disponible.

## Capacidades

- Detección de pulsos musicales (beats) sobre audio, con resolución de frame (50 fps).
- Detección de tiempos fuertes de compás (downbeats), lo que permite inferir el compás y la posición dentro del mismo.
- Funciona sobre mezcla completa, sin necesidad de separación de fuentes ni de partitura o MIDI.
- Independiente del género y del idioma, al operar sobre señal de audio.
- Ejecutable con ONNX Runtime en CPU, GPU o navegador (onnxruntime-web), sin depender de PyTorch.
- Procesamiento por fragmentos de hasta 30 segundos, lo que permite análisis en streaming por bloques.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente predictivo de señal.
- No tiene capacidades de texto, visión, voz o generación; su salida son logits por frame.

## Casos de uso

- Sincronización de vídeo y música en editores: el modelo proporciona la rejilla de beats y downbeats para alinear cortes de plano o transiciones con los tiempos fuertes del tema, con precisión de frame (20 ms).
- Generación automática de mapas rítmicos para videojuegos musicales: proyectos como open-beatmap-studio distribuyen un fichero `beat-this-small0.onnx` para analizar audio localmente en el navegador y generar mapas de Beat Saber; la licencia MIT y el formato ONNX permiten ese despliegue sin backend.
- Herramientas DAW y plugins: detección de tempo y colocación de marcadores de compás en una pista importada, ejecutando el modelo en CPU dentro del propio plugin mediante ONNX Runtime.
- Análisis musicológico a escala: procesar un corpus de grabaciones para extraer series de beats y downbeats y estudiar tempo, métrica y estabilidad rítmica por género o época.
- DJ y reproducción automática: cálculo de la rejilla rítmica en tiempo casi real para beatmatching, loops cuantizados y cues automáticos en software de mezcla.
- Danza y deporte: alineación de movimientos o ejercicios con la pulsación musical para aplicaciones de entrenamiento o coreografía asistida.
- Indexación y búsqueda musical: generar metadatos rítmicos (BPM, compás, posición de downbeats) para catálogos y sistemas de recomendación.
- Investigación en MIR: uso como línea base ligera y reproducible en formato ONNX para experimentos de beat tracking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas estándar de la tarea (F-measure de beat, F-measure de downbeat, CMLt, AMLt, Continuity) ni comparaciones con otros sistemas, y tampoco se han encontrado en la búsqueda web datos de evaluación de esta conversión concreta.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no publicarse el número de parámetros. Por la variante «small0» y un repositorio que HuggingFace redondea a 0,0 GB, se trata de un modelo pequeño (estimación orientativa: por debajo de 1 GB en fp32), apto para GPUs de gama baja.
- GPU recomendadas: no se especifican. Cualquier GPU consumer con unos pocos GB de memoria es suficiente en la práctica; no se requiere A100 ni H100.
- CPU: el caso de uso natural. ONNX Runtime en CPU permite procesar audio a 22,05 kHz en ventanas de hasta 30 segundos; el coste por ventana no está documentado.
- Despliegue: ONNX Runtime (Python, C++, C#, Java), onnxruntime-web (WASM/WebGPU) en navegador, ONNX Runtime Mobile en dispositivos. También es posible servir el modelo con Triton Inference Server o con el backend ONNX de otros frameworks.
- Cuantización: al publicarse solo fp32, una cuantización dinámica a int8 con las herramientas de onnxruntime requeriría validar la degradación de precisión en los logits, algo que el autor no documenta.
- Latencia y throughput: no disponibles. Como referencia de diseño, el pipeline está pensado para fragmentos de 30 segundos con lote 1, lo que sugiere uso por bloques más que inferencia masiva en paralelo.
- Limitación relevante: el tamaño de lote fijo en 1 de la conversión de referencia impide el batcheo, lo que reduce el throughput en procesamiento de corpus grandes.

## Comparativa con modelos similares

| Modelo | Formato | Entrada | Ventana | Lote | Licencia | Notas |
|---|---|---|---|---|---|---|
| jenila-ai/beat-this-small0-onnx | ONNX (fp32) | Espectrograma log-mel 128 bandas, 50 fps | Hasta 1.500 frames (≈30 s) | No documentado | MIT | Conversión del checkpoint small0; sin descargas ni benchmarks publicados |
| tuneperfect/beat-this-onnx | ONNX | Audio 22,05 kHz mono → log-mel (dos grafos: `logmel.onnx` y `beat_this.onnx`) | Hasta 1.500 frames | Fijo a 1 | No disponible en la información | Incluye el preprocesado en ONNX |
| Beat This! original (CPJKU) | PyTorch | Audio | No disponible | No disponible | No disponible en la información | Implementación de referencia del JKU Linz |
| madmom / librosa (trackers clásicos) | Python | Audio / onset envelope | Variable | No aplica | No disponible en la información | Alternativas no neuronales o basadas en DBN; sin datos comparativos en esta ficha |

No se dispone de métricas de precisión comparadas entre estas opciones en la información proporcionada, por lo que la elección entre ellas debe basarse en el formato de despliegue y en una evaluación propia sobre el corpus de interés.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: 0 descargas y 1 like en el momento de la consulta; no hay informes de terceros sobre su fidelidad respecto al checkpoint original en PyTorch.
- Ausencia total de datos de evaluación: no se publican F-measure de beat o downbeat, ni comparación con el modelo original, por lo que no se puede garantizar la equivalencia numérica de la conversión.
- Solo fp32: no hay variantes cuantizadas oficiales, lo que limita el despliegue en dispositivos con poca memoria si el modelo resultase más grande de lo esperado.
- Lote fijo de 1 en la conversión de referencia: no apta para inferencia por lotes de alto rendimiento.
- Ventana máxima de 1.500 frames (≈30 s): las piezas largas requieren troceado y fusión de resultados, con posible inconsistencia en las fronteras entre bloques.
- Entrada restringida a mono a 22,05 kHz y espectrograma log-mel de 128 bandas: cualquier desviación en el preprocesado degrada la salida, y el fichero publicado no incluye el grafo de preprocesado.
- Errores de octava: como en cualquier sistema de beat tracking, es esperable confundir el tempo con su doble o su mitad en pasajes ambiguos; no hay datos publicados sobre la tasa de error de este checkpoint.
- Sesgos: no documentados. Al depender del corpus de entrenamiento original (no publicado), puede rendir peor en géneros con métricas irregulares, rubato, música no occidental o grabaciones con mucho ruido.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la procedencia y las condiciones del checkpoint original de JKU Linz antes de redistribuir el modelo en un producto.
- No es un modelo generativo ni un asistente: no admite instrucciones en lenguaje natural ni devuelve texto; la integración requiere interpretar logits y aplicar un decodificador propio.
- Idiomas: irrelevante para la tarea, pero la model card no documenta el ámbito musical cubierto (géneros, tradiciones, periodos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jenila-ai/beat-this-small0-onnx
- Licencia del modelo: https://huggingface.co/jenila-ai/beat-this-small0-onnx/blob/main/LICENSE
- Repositorio original Beat This! (JKU Linz): https://github.com/CPJKU/beat_this
- Conversión ONNX de referencia con preprocesado incluido: https://huggingface.co/tuneperfect/beat-this-onnx
- Uso del modelo en open-beatmap-studio: https://github.com/Reza2kn/open-beatmap-studio/blob/main/public/models/beat-this-small0.onnx
- ONNX Model Zoo: https://github.com/onnx/models
- Catálogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
