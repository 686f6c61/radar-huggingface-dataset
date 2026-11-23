# loom-ai-org/tiny-voca-loom

## Resumen

tiny-voca-loom es la exportación al formato GGUF del motor loom.cpp del modelo de síntesis de voz `n4ze3m/tiny-voca`, un TTS en inglés de muy pequeño tamaño (5.260.141 parámetros según los safetensors del repo, aunque la model card original lo describe como 4.5M) desarrollado por el autor n4ze3m y empaquetado por loom-ai-org. El modelo convierte texto en audio a 24 kHz con dos voces integradas (F2 y M2) y prescinde de vocoder neuronal: en su lugar usa una cabeza source-filter que modela directamente un tren de pulsos y ruido, lo que reduce drásticamente el coste computacional frente a arquitecturas TTS habituales basadas en difusión o autoregresivas con vocoder.

El interés de esta ficha no está en el modelo base, sino en su formato de distribución: un único fichero GGUF autodescriptivo que incluye las topologías del grafo, el tokenizador (si procede) y el driver de inferencia, generado con loom-exporter y ejecutable mediante la librería `loom-py-rt`. Esto permite desplegar TTS en entornos donde no se quiere arrastrar un stack de PyTorch, con ficheros de entre 6,9 MB (q8_0) y 21,2 MB (f32).

Es un modelo muy especializado: solo inglés, sin capacidades de razonamiento, código ni tool calling, y pensado para síntesis de frases cortas (una oración por utterance, máximo 512 fonemas). Su relevancia es la de un componente ligero y embebible para pipelines de voz, no la de un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS source-filter sin vocoder neuronal (tren de pulsos + ruido conformado por cabeza source-filter); exportada como grafo GGUF para loom.cpp |
| Parámetros totales | 5.260.141 (safetensors); la model card original indica 4,5M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite operativo de 512 fonemas por oración (una oración por utterance) |
| Tipos de cuantización | f32 (21,2 MB) y q8_0 per-channel (`q8_0_pc`, 6,9 MB; proyecciones y convoluciones en int8 por canal) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (autodescriptivo: grafo, tokenizador y driver embebidos) |
| Frecuencia de muestreo | 24 kHz |
| Voces | 2 (speaker=0 → F2, speaker=1 → M2) |
| Fonemizador | dizione (incluido en el repo bajo `phonemizer/`); fallback a orthography2ipa |
| Librería de inferencia | loom-py-rt (PyPI), motor loom.cpp |
| Modelo base | n4ze3m/tiny-voca |

## Arquitectura y entrenamiento

La arquitectura es un TTS source-filter: en lugar de generar la forma de onda con un vocoder neuronal (HiFi-GAN, diffusion, etc.), el modelo predice los parámetros de un modelo de producción de voz clásico que excita un tren de pulsos glotales y una componente de ruido, y los conforma mediante filtros. Esto explica el tamaño tan reducido (unos 5,26M de parámetros) y el coste de inferencia bajo. El front-end textual utiliza el fonemizador dizione (lexicón derivado de CMUdict, reglas para homógrafos y un modelo para palabras desconocidas), cuyos datos se distribuyen junto al modelo en el directorio `phonemizer/`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF/DPO o ajuste fino; la model card no los detalla. La exportación a GGUF la realiza loom-exporter y preserva los parámetros del modelo original en el fichero f32; las versiones cuantizadas empaquetan las convoluciones y proyecciones (el 93% de los pesos) en int8 por canal. Una innovación destacable del runtime es que el GGUF es autodescriptivo: incluye el driver de inferencia, de modo que `model.driver_source` documenta todos los argumentos aceptados, y el motor implementa las STFT como convoluciones sumadas en float32 en lugar de FFT.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz.
- Dos voces integradas: F2 (`speaker=0`) y M2 (`speaker=1`).
- Inferencia por streaming: el driver corta la salida en piezas por oración, cada una limitada en pico, y `stream.exact` reconstruye la forma de onda completa de `infer`.
- Segmentación automática por oraciones (una oración por utterance, máximo 512 fonemas).
- Fonemización mediante dizione con fallback a orthography2ipa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni generación de texto.
- Capacidad multilingüe: únicamente inglés.
- No dispone de modo thinking ni de otras capacidades especiales.

## Casos de uso

- **Lectura de notificaciones y alertas en aplicaciones**: con 6,9 MB en q8_0 y dos voces, el modelo se puede embeber en apps de escritorio o móvil para leer mensajes cortos sin dependencias de red ni de un runtime de deep learning completo.
- **Locución de interfaces de voz en dispositivos con recursos limitados**: el formato GGUF y el motor loom.cpp permiten ejecutar TTS en CPU sin GPU, adecuado para asistentes domésticos o terminales de punto de venta.
- **Generación de audiolibros o podcasts de frases cortas**: el modo streaming entrega una pieza por oración, de forma que se puede reproducir mientras se sintetiza el resto del texto.
- **Accesibilidad web**: conversión de texto a voz para lectores de pantalla o descripciones de imágenes generadas dinámicamente, con una latencia baja gracias al reducido número de parámetros.
- **Prototipado rápido de pipelines de voz**: al instalarse con `pip install -U "loom-py-rt[hub,phonemes]"` y cargarse con `loom.Model.from_pretrained`, sirve como componente TTS de referencia en pruebas de integración de sistemas de voz.
- **Generación de datasets de audio sintético en inglés**: útil para aumentar corpus de entrenamiento de ASR con dos timbres distintos, siempre que se acepte la limitación de una oración por utterance.
- **Sustitución de servicios TTS en la nube en entornos air-gapped**: al ser un fichero local con licencia Apache 2.0, se puede desplegar sin conexión externa en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de inteligibilidad (WER de Whisper small sobre 30 oraciones de LibriSpeech) y de fidelidad de la forma de onda:

| Métrica | tiny-voca f32 | tiny-voca q8_0_pc |
|---|---|---|
| WER (Whisper small, 30 oraciones LibriSpeech) | 4,4 % | 3,8 % |
| Diferencia de forma de onda respecto al original | 2,6e-3 | no disponible |
| Tamaño del fichero | 21,2 MB | 6,9 MB |

No se han publicado resultados de benchmarks estándar (MOS, RTF, throughput) en la información disponible. La model card indica además que, sin dizione y usando el fallback orthography2ipa, el WER sube al 20,0 % en el mismo conjunto, lo que cuantifica la importancia del fonemizador.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo pesa entre 6,9 MB y 21,2 MB, por lo que cabe en memoria de CPU y en cualquier GPU con unos pocos MB libres.
- GPU recomendadas: no se especifican; cualquier GPU consumer (por ejemplo, serie RTX 40) es sobrada. El motor loom.cpp está pensado para ejecución eficiente sin depender de CUDA.
- Cabe en GPU consumer: sí, con enorme margen; también en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: loom-py / loom-py-rt sobre el motor loom.cpp (formato GGUF nativo). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y el formato GGUF es específico de loom.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-voca-loom | ~5,26M | 512 fonemas por oración | en | Apache 2.0 | GGUF (loom.cpp) |
| n4ze3m/tiny-voca (base) | ~4,5M | 512 fonemas por oración | en | Apache 2.0 | pesos originales (no especificado) |
| Alternativas TTS neuronales de pequeño tamaño (p. ej. Piper, Coqui) | variable, típicamente decenas de millones | variable | varios | variable | ONNX, etc. |

No se dispone de datos de benchmarks comparativos con otras alternativas TTS en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- El front-end de texto depende de dizione: sin él, el WER sube del 4,4 % al 20,0 % en la prueba de referencia, por lo que en producción es obligatorio instalar y configurar `DIZIONE_DATA`.
- Síntesis oración a oración (máximo 512 fonemas por utterance); no está pensado para párrafos largos en una sola pasada.
- Solo dos voces (F2 y M2); no hay clonación de voz ni control de estilo o emoción documentado.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de pronunciaciones incorrectas en palabras fuera del lexicón o en homógrafos mal resueltos.
- Sesgos: no documentados en la información disponible; al derivar de CMUdict, la cobertura léxica está sesgada hacia el inglés estadounidense.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datos del fonemizador incluidas en `phonemizer/`.
- La cuantización q8_0_pc altera ligeramente los pesos (proyecciones y convoluciones en int8 por canal); la model card reporta incluso un WER menor que f32 en la prueba, pero no hay garantía de que se mantenga en otros conjuntos.
- El ecosistema es muy joven (repo con 0 descargas y 0 likes en el momento de la consulta) y depende de la librería loom-py-rt y del motor loom.cpp, lo que implica un riesgo de mantenimiento y de soporte limitado.

## Enlaces

- [Modelo en Hugging Face: loom-ai-org/tiny-voca-loom](https://huggingface.co/loom-ai-org/tiny-voca-loom)
- [Modelo base: n4ze3m/tiny-voca](https://huggingface.co/n4ze3m/tiny-voca)
- [Repositorio loom.cpp](https://github.com/loom-ai-org/loom.cpp)
- [Repositorio loom-py](https://github.com/loom-ai-org/loom-py)
- [Repositorio loom-exporter](https://github.com/loom-ai-org/loom-exporter)
- [Fonemizador dizione](https://github.com/n4ze3m/dizione)
