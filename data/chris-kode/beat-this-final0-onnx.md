# Chris-Kode/beat-this-final0-onnx

## Resumen

Beat This! final0 ONNX es una exportación a formato ONNX del checkpoint `final0` del modelo Beat This!, desarrollado por el Institute of Computational Perception de la Johannes Kepler Universität Linz (JKU). Se trata de un modelo de clasificación de audio especializado en *beat tracking* y *downbeat tracking*: recibe una señal de audio mono y devuelve, fotograma a fotograma (cada 20 ms), logits de pulso musical (beat) y de primer pulso de compás (downbeat). No es un modelo de lenguaje: su pipeline en Hugging Face es `audio-classification`.

La relevancia de esta versión concreta reside en el empaquetado. El autor, Chris-Kode, ha exportado los pesos a ONNX (opset 18) e incorporado dentro del grafo tanto el remuestreo a 22,05 kHz mediante un resampler windowed-sinc como el front-end log-mel (`LogMelSpect`), de modo que el modelo acepta directamente audio a 32 kHz y elimina la dependencia de soxr y del código Python de preprocesado. El resultado es un único fichero de 84.973.959 bytes (unos 0,1 GB de repositorio) con pesos float32 sin modificar.

El modelo cuenta con 20.252.917 parámetros y está publicado bajo licencia MIT. Es una pieza de infraestructura para análisis musical automático (alineación rítmica, DJ tools, transcripción, análisis estructural) más que un modelo generativo, y su interés práctico está en la portabilidad del despliegue vía ONNX Runtime frente a la pila original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para beat/downbeat tracking (checkpoint `final0` de Beat This!), exportada a ONNX opset 18; incluye resampler windowed-sinc y front-end log-mel en el grafo |
| Parametros totales | 20.252.917 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 32 kHz de 1 s a 31 s por chunk, salida con resolución de 20 ms por fotograma |
| Tipos de cuantizacion | no disponible (pesos exportados en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `beat-this-final0.onnx`, 84.973.959 bytes, SHA-256 `af7b99f72844d464ac87a379ce4fa98e81b8f46735a743ce23b5972a21c78be3`) |

## Arquitectura y entrenamiento

La model card de esta exportación no describe la arquitectura interna del checkpoint `final0` de Beat This!; se limita a indicar que los pesos cargan estrictamente en la clase `BeatThis` de la librería `beat-this` 1.1.0 con los hiperparámetros de `final0`, y que suman 20.252.917 parámetros. Tampoco se detallan en la información disponible los datos de entrenamiento, el número de tokens o horas de audio, ni si hubo ajuste por refuerzo o preferencias; esos datos corresponderían a la documentación del proyecto original de JKU, no a esta ficha.

La innovación técnica de esta versión es el empaquetado del preprocesado dentro del grafo ONNX. El modelo original usa soxr para remuestrear; aquí se sustituye por un resampler windowed-sinc a 22,05 kHz implementado en el propio grafo, seguido del front-end `LogMelSpect`: ventanas Hann de 1024 puntos, hop de 441, 128 mels slaney de 30 Hz a 11 kHz, magnitud normalizada por la longitud de ventana y transformación log1p(1000 ×). La salida son dos tensores de logits por fotograma de 20 ms: `beat` y `downbeat`. El autor documenta que frente al modelo PyTorch la diferencia máxima es de 3,5e-5, y frente al pipeline original de Beat This! (cuyo soxr difiere del resampler del grafo) los logits difieren hasta 1,5; en una prueba con un patrón de 20 s a 124 BPM, los 42 fotogramas de beat coinciden y los downbeats quedan dentro de un fotograma.

## Capacidades

- Detección de pulsos musicales (beat tracking) con resolución temporal de 20 ms.
- Detección de primeros pulsos de compás (downbeat tracking) con la misma resolución.
- Preprocesado integrado: acepta audio mono a 32 kHz y realiza internamente el remuestreo a 22,05 kHz y el cálculo log-mel.
- Procesamiento por chunks de 1 s a 31 s, con solapamiento recomendado de 12 fotogramas entre fragmentos.
- Ejecución portable vía ONNX Runtime, sin dependencia de PyTorch, soxr ni del paquete `beat-this` en tiempo de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de audio, no un modelo generativo.

## Casos de uso

- Análisis rítmico en herramientas de DJ: extraer la rejilla de beats y downbeats de una pista para sincronización, looping y beatmatching; la resolución de 20 ms y la salida de downbeats permiten reconstruir la estructura de compases.
- Generación automática de metadatos musicales: calcular BPM y posición de compás para catálogos de streaming o bibliotecas musicales, procesando cada pista por chunks con el solapamiento de 12 fotogramas indicado.
- Alineación de partituras y letras con audio: usar los beats como anclas temporales para sincronizar transcripciones o letras con la reproducción.
- Segmentación estructural de temas: combinar los downbeats con análisis posteriores para delimitar compases y secciones en pipelines de music information retrieval.
- Despliegue en entornos sin PyTorch: integrar el modelo en servicios en C++, Rust o Node.js mediante ONNX Runtime, aprovechando que el preprocesado está dentro del grafo y no requiere soxr.
- Herramientas educativas de ritmo: detección de pulsos en grabaciones de estudiantes para evaluar estabilidad rítmica, con la ventaja de que el modelo funciona sobre audio a 32 kHz sin conversión previa.
- Procesamiento por lotes en servidores de análisis musical: al ser un fichero ONNX de ~85 MB con pesos float32, se puede ejecutar en CPU con latencia moderada para trabajos offline de catalogación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de equivalencia numérica frente al modelo original: diferencia máxima de 3,5e-5 frente a la implementación PyTorch y de hasta 1,5 en logits frente al pipeline de Beat This! con soxr, con coincidencia total de los 42 fotogramas de beat y downbeats dentro de un fotograma en un patrón de prueba de 20 s a 124 BPM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 20,25 M de parámetros en float32, los pesos ocupan aproximadamente 81 MB, por lo que la huella de memoria es muy reducida y el cuello de botella es el búfer de audio y las activaciones intermedias.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); el modelo es lo bastante pequeño para ejecutarse en GPU consumer, aunque no se documentan requisitos mínimos.
- GPU consumer: cabe con holgura en cualquier GPU consumer moderna; también es viable en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con integración en Python, C++, C#, Java o Node.js; no se documentan exportaciones a TensorRT, OpenVINO ni otros formatos.
- Latencia y throughput: no disponibles. La única referencia temporal es la resolución de salida de 20 ms por fotograma y el límite de 31 s por chunk de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Beat This! final0 ONNX (este) | 20.252.917 | Audio mono 32 kHz, 1-31 s | ONNX opset 18 | MIT | Preprocesado integrado en el grafo |
| Beat This! final0 (original, JKU) | 20.252.917 | Audio, pipeline con soxr | PyTorch (checkpoint) | MIT | Requiere el paquete `beat-this` y soxr |
| safe-models/beat-this-final0 | 20.252.917 | Audio | safetensors | no disponible en la información | Espejo del que se tomaron los pesos; sin comparar con el `final0.ckpt` de JKU |
| Otros modelos de beat tracking | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Los pesos se tomaron de un espejo (`safe-models/beat-this-final0`) porque el servidor de JKU no estaba accesible, y el autor indica que no se han comparado con el `final0.ckpt` original; existe un riesgo, no cuantificado, de divergencia respecto al checkpoint de referencia.
- Las predicciones en los 6 fotogramas exteriores de cada chunk no son fiables; es obligatorio solapar chunks en 12 fotogramas, lo que complica la integración y puede introducir errores en los bordes si no se respeta.
- La diferencia de hasta 1,5 en logits frente al pipeline original se debe al resampler windowed-sinc del grafo frente a soxr; en pasajes con contenido espectral complejo esto podría traducirse en discrepancias de detección no medidas.
- Entrada limitada a audio mono a 32 kHz y a chunks de 1 s a 31 s; no se documenta comportamiento con otras frecuencias de muestreo, audio estéreo o fragmentos más largos sin trocear.
- No hay información sobre sesgos del modelo ni sobre su comportamiento en géneros musicales con ritmo libre, compases irregulares o música no occidental; estos son riesgos habituales en beat tracking que la model card no aborda.
- No se documentan cuantizaciones ni optimizaciones; el fichero es float32 y no se ofrecen variantes int8 para reducir latencia en CPU.
- Licencia MIT permite uso comercial, pero la atribución al Institute of Computational Perception de JKU debe mantenerse según los términos indicados en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chris-Kode/beat-this-final0-onnx
- Repositorio original de Beat This! (JKU): https://github.com/CPJKU/beat_this
- Espejo de pesos de origen: https://huggingface.co/safe-models/beat-this-final0
