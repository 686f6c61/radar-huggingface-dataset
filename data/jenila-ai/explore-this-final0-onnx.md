# jenila-ai/explore-this-final0-onnx

## Resumen

Explore This! final0 (ONNX) es la exportación a formato ONNX en precisión fp32 del checkpoint final0 de Explore This!, un modelo de seguimiento de pulso (beat tracking) y de parte fuerte de compás (downbeat tracking) publicado en ISMIR 2026 por Robert Kihlborg, André Holzapfel y Jan Schlüter. Se trata de un fork de Beat This!, desarrollado en el Institute of Computational Perception de la JKU Linz, y su función es estimar una rejilla rítmica (tatum grid) aprendida a partir de audio musical.

El modelo no es un modelo de lenguaje: es un modelo de audio especializado que recibe un espectrograma log-mel de 1 x 1500 x 128 (22,05 kHz, hop 441, 50 fotogramas por segundo, 30 segundos por fragmento) y devuelve máscaras de pulso y de parte fuerte, así como sus activaciones, con una salida de 1 x 1500 por cada una. La decodificación de rejilla y subrejilla por umbral está integrada dentro del grafo ONNX, lo que simplifica el despliegue.

Su relevancia es acotada pero clara: ofrece una alternativa portable y sin dependencia de PyTorch para integrar seguimiento rítmico en pipelines de producción basados en ONNX Runtime, con licencia MIT y verificación de que las máscaras coinciden con las de la implementación original en PyTorch sobre entradas de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio derivado de Beat This!, exportado con torch.onnx.export, opset 18) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 1 x 1500 x 128 (30 segundos de audio por fragmento) |
| Tipos de cuantizacion | fp32 (unica version publicada) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (explore_this_final0.onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su procedencia: es un fork de Beat This! (JKU Linz), presentado en ISMIR 2026, que aprende una rejilla de tatum y de ella deriva pulsos y partes fuertes. La exportación se realizó desde el commit upstream `408db038b41bdc18104e70c5a8ac8daabd9cd496` mediante `torch.onnx.export` con opset 18, en fp32, y el autor verifica que las máscaras producidas coinciden con las de PyTorch en entradas de prueba.

La entrada es un espectrograma log-mel de Beat This! (22,05 kHz, hop 441, 50 fotogramas por segundo) con forma fija 1 x 1500 x 128, correspondiente a fragmentos de 30 segundos. Las salidas son `beat_mask` y `downbeat_mask` (valores 0 o 1 por fotograma) y `beat_activation` y `downbeat_activation`, cada una de forma 1 x 1500. La decodificación de rejilla y subrejilla basada en umbral está incluida dentro del grafo. No se dispone de datos sobre volumen de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Seguimiento de pulso (beat tracking) sobre audio musical.
- Seguimiento de parte fuerte de compás (downbeat tracking).
- Estimación de una rejilla de tatum aprendida y decodificación de rejilla y subrejilla por umbral integrada en el grafo.
- Salida de máscaras binarias por fotograma y de activaciones continuas por fotograma.
- Procesamiento por fragmentos fijos de 30 segundos (1500 fotogramas a 50 fps).
- Ejecución portable mediante ONNX Runtime sin dependencia de PyTorch en inferencia.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio general (ASR) ni capacidades multilingües.

## Casos de uso

- Análisis rítmico en producción musical: extraer pulsos y partes fuertes de pistas de 30 segundos para alinear ediciones, loops o samples, aprovechando la salida de máscaras por fotograma.
- Sincronización de visuales o luces con la música: usar `beat_activation` y `downbeat_activation` como señal de temporización en tiempo casi real dentro de un pipeline ONNX Runtime.
- DJ tools y software de mezcla: detectar la rejilla rítmica para beatmatching y cuantización de cortes, con la ventaja de un grafo autocontenido que incluye la decodificación.
- Anotación automática de corpus musicales: generar etiquetas de beat y downbeat para datasets de investigación, dado que las máscaras coinciden con la implementación de referencia en PyTorch.
- Despliegue en entornos sin PyTorch: integrar el modelo en servicios C++, C# o Java mediante ONNX Runtime, algo inviable con el checkpoint original.
- Educación musical y análisis asistido: visualizar la estructura rítmica de una pieza por fragmentos de 30 segundos para estudiar compás y tempo.
- Preprocesado en pipelines MIR (music information retrieval): usar la rejilla de tatum como entrada para tareas posteriores de transcripción o segmentación estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que las máscaras del modelo ONNX coinciden con las de PyTorch en entradas de prueba, sin cifras de precisión, F1 ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el tamaño del grafo).
- GPU recomendadas: no disponible; al ser un modelo de audio de tamaño presumiblemente moderado y en fp32, es probable que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (principal), con posibles backends de ejecución compatibles con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Explore This! final0 (ONNX) | Beat/downbeat tracking | Espectrograma log-mel 1 x 1500 x 128 (30 s) | MIT | ONNX (fp32) | Decodificación integrada en el grafo |
| Beat This! (JKU Linz) | Beat/downbeat tracking | Espectrograma log-mel | no disponible en la informacion | PyTorch | Modelo original del que deriva este fork |
| Explore This! (checkpoint PyTorch) | Beat/downbeat tracking | Espectrograma log-mel | no disponible en la informacion | PyTorch | Checkpoint final0 original, del que se exportó esta versión |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ritmo: no genera texto, no razona, no procesa lenguaje ni imágenes.
- Entrada de forma fija: solo acepta fragmentos de 30 segundos con la configuración exacta de espectrograma (22,05 kHz, hop 441, 128 bandas mel); cualquier audio debe preprocesarse para ajustarse a ese formato.
- Solo se publica la versión fp32 en ONNX; no hay variantes cuantizadas ni GGUF.
- No se documentan sesgos, tasas de error ni comportamiento en géneros musicales concretos, lo que dificulta evaluar su robustez en dominios alejados del entrenamiento.
- Riesgo de errores en tempo muy variable, compases irregulares o música sin pulso claro: no cuantificado en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y citar el trabajo original de ISMIR 2026.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere una publicación muy reciente y sin validación comunitaria; conviene verificar el archivo y su SHA-256 antes de usarlo en producción.
- No hay información sobre idiomas porque el modelo no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jenila-ai/explore-this-final0-onnx
- Licencia: https://huggingface.co/jenila-ai/explore-this-final0-onnx/blob/main/LICENSE
- Repositorio Explore This!: https://github.com/CPJKU/explore_this
- Repositorio Beat This!: https://github.com/CPJKU/beat_this
- Sitio del usuario: https://www.jenila.com
