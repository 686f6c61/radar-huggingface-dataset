# kurtzford/HTDemucs-CoreML-FP16

## Resumen

HTDemucs-CoreML-FP16 es una conversión al formato Core ML de Apple del checkpoint preentrenado HTDemucs de seis pistas (`htdemucs_6s`), un modelo de separación de fuentes musicales desarrollado originalmente por Meta AI (Facebook Research, autor del repositorio Demucs). El paquete lo publica el usuario kurtzford en Hugging Face y su función es permitir la inferencia nativa en macOS 13 o posterior sin depender de PyTorch, aprovechando el runtime Core ML y la cuantización FP16 para reducir el coste de cómputo y memoria.

El modelo no es un modelo de lenguaje ni un transformer generativo de texto: es una red de separación de audio que, dada una mezcla musical estéreo de 44,1 kHz en segmentos de 10 segundos, devuelve seis pistas independientes (batería, bajo, voces, guitarra, piano y otros). La arquitectura subyacente es HTDemucs, un modelo híbrido que combina un dominio temporal y un dominio espectral (waveform e spectrogram) con atención, orientado a la separación de fuentes.

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión de formato, no de un modelo nuevo, con licencia restringida a investigación académica no comercial. La información publicada por el autor es mínima y no incluye benchmarks, datos de entrenamiento ni especificaciones detalladas más allá de las formas de entrada y salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (modelo híbrido tiempo-frecuencia con atención para separación de fuentes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 441.000 muestras (10 s a 44,1 kHz) |
| Tipos de cuantizacion | FP16 (pesos y salida en Float16; entrada en Float32) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | other (MIT del código Demucs no cubre los pesos; solo investigación académica no comercial) |
| Formato de pesos | Core ML `.mlpackage` (comprimido en `HTDemucs_CoreML_FP16.mlpackage.zip`) |

## Arquitectura y entrenamiento

La arquitectura es HTDemucs, la variante híbrida de Demucs que procesa la señal en dos ramas complementarias: una rama en el dominio de la forma de onda y otra en el dominio espectral (espectrograma), fusionadas mediante mecanismos de atención. El checkpoint de origen es `htdemucs_6s` (identificador `5c90dfd2-34c22ccb.th`), entrenado por el equipo de Demucs de Meta AI para separar seis pistas en lugar de las cuatro habituales.

No se dispone de información publicada sobre el número de tokens o horas de audio de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de refinamiento posteriores. La conversión a Core ML mantiene las formas de entrada y salida documentadas por el autor: entrada `audio` Float32 de forma `[1, 2, 441000]` (estéreo, 44,1 kHz, 10 s) y salida `sources` Float16 de forma `[1, 6, 2, 441000]`, con el orden de pistas batería, bajo, voces, guitarra, piano y otros.

La innovación técnica relevante de este artefacto no está en el modelo, sino en el empaquetado: la conversión a Core ML con cuantización FP16 permite ejecutar el modelo en el stack de Apple (Core ML, posiblemente con aceleración por GPU o Neural Engine) sin necesidad de PyTorch ni de dependencias de Python en tiempo de inferencia.

## Capacidades

- Separación de fuentes musicales en seis pistas: batería, bajo, voces, guitarra, piano y «otros».
- Procesamiento de audio estéreo a 44,1 kHz en segmentos fijos de 10 segundos (441.000 muestras).
- Inferencia nativa en macOS 13 o posterior mediante Core ML.
- Ejecución con pesos en FP16, lo que reduce el uso de memoria y acelera la inferencia en hardware Apple compatible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No se documentan capacidades adicionales (por ejemplo, separación en tiempo real, streaming o procesamiento de lotes).

## Casos de uso

- Investigación académica en separación de fuentes: uso del paquete Core ML para reproducir experimentos de separación de seis pistas en entornos macOS sin instalar PyTorch, comparando resultados con el checkpoint original.
- Prototipado de aplicaciones de audio en macOS: integración del `.mlpackage` en una app Swift o Objective-C para extraer pistas de una mezcla y evaluar la calidad de la separación antes de invertir en infraestructura.
- Creación de herramientas de práctica musical: aislamiento de la pista de batería, bajo o piano para generar pistas de acompañamiento o material de estudio para músicos.
- Edición y remezcla de audio: obtención de stems separados para aplicar procesado independiente (ecualización, compresión, efectos) a cada pista antes de volver a mezclar.
- Análisis musicológico: extracción de pistas vocales o instrumentales para tareas de transcripción, análisis de armonía o estudio de interpretación.
- Evaluación comparativa de runtimes: medición del rendimiento de Core ML frente a PyTorch/MPS en el mismo hardware Apple para decidir la ruta de despliegue de un pipeline de separación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: no disponible de forma explícita; el repositorio ocupa 0,1 GB, lo que sugiere un paquete compacto compatible con equipos de gama consumer Apple.
- GPU recomendadas: no se especifican. El paquete está pensado para el stack Core ML de Apple (GPU integrada o Neural Engine de chips Apple Silicon y, presumiblemente, GPU AMD en Mac Intel compatibles con macOS 13).
- Cabe en GPU consumer: sí, en principio, en cualquier Mac con macOS 13 o posterior; no se documentan requisitos mínimos de memoria.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Pistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HTDemucs-CoreML-FP16 (este) | no disponible | 10 s estéreo 44,1 kHz | 6 | other (solo investigación no comercial) | Core ML, macOS 13+ |
| HTDemucs-6s original (adefossez) | no disponible | 10 s estéreo 44,1 kHz | 6 | pesos para investigación científica (MIT del código no los cubre) | PyTorch, `.th` |
| Demucs v4 (htdemucs, 4 pistas) | no disponible | 10 s estéreo 44,1 kHz | 4 | MIT (código); pesos con la misma restricción | PyTorch |
| Spleeter (Deezer) | no disponible | segmentos variables | 2 o 4 | MIT | TensorFlow |

La comparación se limita a la familia Demucs y a Spleeter porque no se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer comparaciones cuantitativas con otras alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: el autor indica explícitamente que el paquete es solo para investigación académica no comercial y que no se concede licencia adicional sobre los pesos convertidos; el uso comercial requiere verificar la situación legal con el titular original.
- Los pesos originales de Demucs se distribuyeron para fines científicos, según la propia documentación del proyecto; la conversión no cambia esa restricción.
- Modelo de audio, no de texto: no sirve para generación de lenguaje, razonamiento, código ni tareas de agentes.
- Entrada de longitud fija (10 segundos): no se documenta el manejo de audio más largo, por lo que el usuario debe segmentar y recomponer manualmente.
- Sin benchmarks publicados: no hay evidencia en la información disponible sobre la fidelidad de la conversión FP16 respecto al checkpoint original ni sobre posibles degradaciones de calidad.
- Riesgo de artefactos en la separación: inherente a los modelos de separación de fuentes, especialmente en mezclas densas o con instrumentos poco representados en el entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de uso.
- Compatibilidad limitada a macOS 13 o posterior; no es portable a Linux, Windows ni Android sin reconversión.
- No se documentan sesgos, idiomas ni limitaciones de contexto adicionales porque no aplican al dominio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurtzford/HTDemucs-CoreML-FP16
- Checkpoint original HTDemucs-6s: https://huggingface.co/adefossez/HTDemucs-6s
- Repositorio Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Discusión sobre licencia de los pesos (issue #327): https://github.com/facebookresearch/demucs/issues/327
