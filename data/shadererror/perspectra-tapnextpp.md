# ShaderError/perspectra-tapnextpp

## Resumen

TAPNext++ es un modelo de seguimiento de cualquier punto (Tracking Any Point, TAP) en vídeo desarrollado originalmente por Google DeepMind. El repositorio `ShaderError/perspectra-tapnextpp` es una redistribución de los pesos originales convertidos a ONNX y PyTorch para su uso en Perspectra, un complemento de Blender. No se ha reentrenado el modelo: se trata de una conversión de formato para facilitar su integración en un flujo de trabajo de posproducción y efectos visuales.

El modelo aborda la tarea de rastrear puntos arbitrarios a lo largo de secuencias de vídeo, formulándola como predicción del siguiente token (next token prediction), según el artículo TAPNext presentado en ICCV 2025 por Zholus et al. La conversión incluye un grafo ONNX único en fp32 que acepta imágenes RGB de 256 x 256 normalizadas en el rango [-1, 1], 256 consultas (queries) y cachés recurrentes como entradas y salidas, junto con un checkpoint PyTorch para ejecución en GPU.

Es relevante ahora porque permite a desarrolladores y artistas técnicos integrar un modelo de tracking de puntos de vanguardia en Blender mediante ONNX Runtime, sin depender del framework original de DeepMind ni de infraestructura de investigación. El repositorio tiene 1,0 GB y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tracking de puntos basado en predicción del siguiente token; detalles en el paper TAPNext, ICCV 2025) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo con cachés recurrentes; sin cifra publicada) |
| Tipos de cuantización | fp32 (grafo ONNX y checkpoint PyTorch) |
| Idiomas soportados | no aplica (modelo de visión/vídeo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`tapnextpp_single.onnx`, 979 MB) y PyTorch (`tapnextpp.pt`, 2.532 MB) |

## Arquitectura y entrenamiento

La información disponible indica que TAPNext++ formula el seguimiento de cualquier punto (TAP) como un problema de predicción del siguiente token, según el artículo «TAPNext: Tracking Any Point (TAP) as Next Token Prediction» de Zholus et al. (ICCV 2025). El repositorio redistribuye los pesos originales de Google DeepMind sin reentrenamiento, por lo que los datos de entrenamiento, el número de tokens y la composición del dataset no se detallan en la información proporcionada.

La conversión para Perspectra expone un grafo ONNX único en fp32 que recibe imágenes RGB de 256 x 256 en el rango [-1, 1], 256 consultas y cachés recurrentes como entradas, y devuelve las cachés actualizadas como salidas. Esta estructura recurrente sugiere un procesamiento secuencial fotograma a fotograma con estado persistente, aunque la arquitectura interna concreta (transformer, híbrida u otra) no está especificada en la información disponible. El checkpoint `tapnextpp.pt` se emplea para ejecución en GPU.

## Capacidades

- Seguimiento de puntos arbitrarios (TAP) a lo largo de secuencias de vídeo: dadas 256 consultas, el modelo predice su posición en fotogramas sucesivos.
- Procesamiento de vídeo con estado recurrente: las cachés se pasan como entradas y salidas entre invocaciones, lo que permite mantener el seguimiento entre fotogramas.
- Entrada de imagen RGB de 256 x 256 normalizada en [-1, 1].
- Ejecución mediante ONNX Runtime (grafo único) o PyTorch en GPU.
- Integración con Blender a través del complemento Perspectra.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al tratarse de un modelo de visión para tracking.

## Casos de uso

- Seguimiento de puntos en posproducción de vídeo dentro de Blender: el complemento Perspectra puede usar el grafo ONNX para rastrear puntos seleccionados por el artista a lo largo de una secuencia, facilitando tareas de estabilización o matchmoving.
- Rotoscopia asistida: las 256 consultas permiten seguir simultáneamente varios puntos de interés sobre un sujeto u objeto, reduciendo el trabajo manual fotograma a fotograma.
- Seguimiento de elementos para composición digital: los puntos rastreados pueden alimentar el posicionamiento de cámaras virtuales o elementos 3D sobre metraje real.
- Análisis de movimiento en investigación de visión por computador: el checkpoint PyTorch permite reproducir y evaluar el modelo TAPNext++ en entornos de experimentación con GPU.
- Integración en pipelines de efectos visuales basados en ONNX Runtime: al ser un grafo único, puede desplegarse en herramientas que no dispongan de PyTorch, simplificando la distribución.
- Prototipado de aplicaciones de tracking en tiempo casi real: la conversión a ONNX y el uso de cachés recurrentes permiten un bucle de inferencia fotograma a fotograma sobre GPU de consumo, sujeto a los requisitos de memoria del grafo fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El grafo ONNX en fp32 ocupa 979 MB y el checkpoint PyTorch 2.532 MB; a ello hay que sumar la memoria de activaciones y cachés recurrentes, que no se detalla.
- GPU recomendadas: no disponible. El autor indica que `tapnextpp.pt` se usa en GPU, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del checkpoint PyTorch (2,5 GB) sugiere que podría caber en GPU con 8 GB o más de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: ONNX Runtime (grafo `tapnextpp_single.onnx`) y PyTorch (`tapnextpp.pt`), integrados en el complemento Perspectra para Blender.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAPNext++ (esta conversión) | no disponible | no disponible | Tracking de puntos en vídeo | Apache 2.0 | ONNX + PyTorch |
| TAPNet original (Google DeepMind) | no disponible | no disponible | Tracking de puntos en vídeo | Apache 2.0 | Pesos originales en el repositorio de DeepMind |
| Otros modelos TAP (p. ej., CoTracker, OmniMotion) | no disponible | no disponible | Tracking de puntos en vídeo | no disponible en esta información | no disponible en esta información |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Se trata de una redistribución de pesos originales de Google DeepMind; la calidad y las limitaciones del modelo son las del TAPNext++ original, no las de una conversión entrenada específicamente.
- La resolución de entrada está fijada en 256 x 256 píxeles RGB en [-1, 1]; no se documenta soporte para otras resoluciones.
- El número de consultas está limitado a 256 por invocación según la descripción del grafo.
- No se especifican sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas (el modelo no procesa lenguaje).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a los autores originales y revisar los términos del repositorio original de DeepMind.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación de la conversión.
- No se documentan requisitos mínimos de hardware ni latencias, lo que dificulta planificar despliegues en producción.
- Al ser una conversión para un complemento concreto (Perspectra), puede requerir adaptaciones para otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderError/perspectra-tapnextpp
- Repositorio original de TAPNet (Google DeepMind): https://github.com/google-deepmind/tapnet
- Artículo: Zholus et al., «TAPNext: Tracking Any Point (TAP) as Next Token Prediction», ICCV 2025 (enlace no disponible en la información proporcionada)
