# akm9191/sherpa-onnx-online-punct-en-int8

## Resumen

`sherpa-onnx-online-punct-en-int8` es un modelo ligero de puntuación y capitalización (punctuation and truecasing) para texto en inglés, empaquetado en formato ONNX con cuantización int8 y distribuido a través de la librería sherpa-onnx. No se trata de un modelo generativo de lenguaje, sino de un componente especializado que añade signos de puntuación (`.`, `,`, `?`) y mayúsculas a transcripciones en minúsculas y sin puntuar, típicas de sistemas de reconocimiento automático del habla (ASR). El autor del repositorio es akm9191, que lo publica como espejo para la aplicación Android de notas Daily Whisper.

El modelo subyacente es `Edge-Punct-Casing` de frankyoujian (`sherpa-onnx-cnn-bilstm-unigram-bpe-en`), empaquetado originalmente por el equipo k2-fsa / Next-gen Kaldi como `sherpa-onnx-online-punct-en-2024-08-06`. La arquitectura es una CNN-BiLSTM sobre tokenización BPE unigram, lo que le permite operar en modo "online" (streaming) con latencia baja. El pack completo ocupa aproximadamente 7,6 MB, lo que lo hace apto para inferencia en dispositivo (móvil, edge) sin conexión a red.

Su relevancia radica en que resuelve un problema concreto de los pipelines ASR: la salida cruda de un reconocedor suele carecer de puntuación y mayúsculas, lo que degrada la legibilidad y complica tareas posteriores (segmentación de frases, traducción, resumen). Este modelo cubre esa etapa de post-procesado con un coste computacional mínimo y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-BiLSTM con tokenización BPE unigram |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo online/streaming) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) + vocabulario BPE (`bpe.vocab`) |

## Arquitectura y entrenamiento

El modelo emplea una red neuronal convolucional (CNN) seguida de una BiLSTM bidireccional que opera sobre tokens BPE de tipo unigram. Esta combinación captura tanto patrones locales (n-gramas de caracteres y palabras) como dependencias de contexto más amplias en ambas direcciones de la secuencia, lo que es adecuado para decidir dónde insertar puntuación y qué palabras capitalizar. El vocabulario BPE se distribuye como archivo separado (`bpe.vocab`, 149.430 bytes).

El diseño "online" implica que el modelo puede procesar fragmentos de texto de forma incremental, integrándose en el componente `OnlinePunctuation` de sherpa-onnx, pensado para acompañar a reconocedores de voz en streaming. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. El modelo original procede de frankyoujian/Edge-Punct-Casing y fue empaquetado sin modificaciones por k2-fsa (los archivos `model.int8.onnx` y `bpe.vocab` se copiaron sin cambios).

## Capacidades

- Inserción de puntuación básica en inglés: punto, coma e interrogación (`.`, `,`, `?`).
- Capitalización (truecasing) de palabras que deberían ir en mayúscula, incluidos nombres propios.
- Procesamiento en modo online/streaming, apto para integrarse en pipelines ASR en tiempo real.
- Funcionamiento completamente en dispositivo, sin envío de datos a servidores.
- Modelo compacto (~7,6 MB) adecuado para entornos con recursos limitados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Post-procesado de dictado en aplicaciones móviles: integrado en la app Android Daily Whisper como pack opcional de "English punctuation", el modelo añade puntuación y mayúsculas a las transcripciones de voz en el propio teléfono, sin conexión, con un tamaño de 7,6 MB que no penaliza la instalación.
- Mejora de subtítulos automáticos: tras la salida de un ASR en streaming, el modelo segmenta y puntúa las frases para producir subtítulos legibles en tiempo real, aprovechando su modo online y su baja latencia.
- Pre-procesado para traducción automática: un texto ASR sin puntuar degrada la calidad de la traducción; este modelo restaura límites de frase y mayúsculas antes de enviar el texto a un traductor, mejorando la segmentación.
- Generación de actas y notas de reuniones: en pipelines de transcripción de reuniones, el modelo convierte la salida cruda del ASR en texto puntuado y capitalizado, listo para lectura o para alimentar un resumidor.
- Indexación y búsqueda sobre transcripciones: la puntuación y las mayúsculas facilitan la segmentación en frases y la tokenización para motores de búsqueda o sistemas de recuperación sobre archivos de audio transcritos.
- Asistentes de voz embebidos: en dispositivos IoT o sistemas empotrados con ASR local, el modelo aporta legibilidad a las respuestas o registros de voz sin requerir GPU ni conexión, gracias a su formato ONNX int8.
- Accesibilidad: aplicaciones de transcripción para personas con discapacidad auditiva que necesitan texto puntuado y legible generado en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del modelo (7,5 MB en int8) es despreciable y cabe en CPU.
- GPU recomendadas: no requiere GPU; está diseñado para ejecución en CPU y en dispositivos móviles.
- Cabe en GPU consumer: sí, aunque no es necesario; el modelo está pensado para CPU/edge.
- Opciones de despliegue: sherpa-onnx (componente `OnlinePunctuation`), runtime ONNX; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `akm9191/sherpa-onnx-online-punct-en-int8` | CNN-BiLSTM + BPE unigram | ~7,6 MB (int8) | no disponible (online) | Apache-2.0 | ONNX | Espejo del pack k2-fsa para Daily Whisper |
| `frankyoujian/Edge-Punct-Casing` | CNN-BiLSTM + BPE unigram | no disponible | no disponible | Apache-2.0 | no disponible | Modelo original del que deriva este |
| `sherpa-onnx-online-punct-en-2024-08-06` (k2-fsa) | CNN-BiLSTM + BPE unigram | ~7,6 MB | no disponible (online) | Apache-2.0 | ONNX | Empaquetado oficial de k2-fsa; archivos idénticos |

No se dispone de datos de rendimiento comparativo (precisión, F1 de puntuación) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse con otros idiomas.
- La puntuación se limita a `.`, `,` y `?`; no inserta otros signos como `!`, `;`, `:` ni comillas.
- El ejemplo de la model card muestra un error de puntuación (`Look at that accuracy?` en lugar de un punto), lo que indica que la precisión no es perfecta y puede producir interrogaciones donde no corresponden.
- Riesgo de capitalización incorrecta en nombres propios poco frecuentes o ambigüedades léxicas.
- No es un modelo generativo: no produce texto nuevo ni razona; su función es estrictamente la anotación de puntuación y mayúsculas.
- Al ser un espejo de un pack de terceros, la responsabilidad de mantenimiento y actualizaciones recae en el proyecto original (k2-fsa / frankyoujian).
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución del modelo original.
- No se han publicado benchmarks ni métricas de calidad en la información disponible, por lo que la evaluación en producción debe hacerse empíricamente.
- El repositorio muestra 0 descargas y 0 likes, sin señales de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/akm9191/sherpa-onnx-online-punct-en-int8
- Modelo original: https://huggingface.co/frankyoujian/Edge-Punct-Casing
- Release de k2-fsa con los modelos de puntuación: https://github.com/k2-fsa/sherpa-onnx/releases/tag/punctuation-models
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
