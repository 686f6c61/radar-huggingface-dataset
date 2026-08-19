# pymaster/VocalRender

## Resumen

VocalRender es un modelo de síntesis de voz cantada (SVS, singing voice synthesis) desarrollado por pymaster, diseñado para composición musical en entornos reales. A diferencia de los sistemas SVS tradicionales que requieren duraciones a nivel de fonema o referencias acústicas alineadas temporalmente, VocalRender genera audio de canto a 48 kHz directamente a partir de partituras simbólicas: letras, alturas MIDI, valores de nota y tempo. Combina una representación intercalada letra-nota, un Audio VAE que codifica el canto como latentes acústicos continuos y un modelo de difusión autorregresivo que genera la secuencia de latentes por parches.

El modelo está basado en openbmb/VoxCPM2 y se publica bajo licencia Apache 2.0. El repositorio incluye dos variantes con la misma arquitectura y número de parámetros: VocalRender, entrenada sobre el dataset abierto CrawlSinger-OS (más de 2.300 horas), y VocalRender-Pro, entrenada sobre CrawlSinger (más de 5.600 horas de canto real). Cada checkpoint ocupa aproximadamente 9,5 GB. Su relevancia actual radica en su enfoque "score-native": los compositores pueden trabajar con formatos familiares como ABC notation o MusicXML sin necesidad de conocimientos de aprendizaje automático, y el modelo renderiza la interpretación vocal. El checkpoint liberado funciona mejor con chino mandarín y una única melodía vocal monofónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion autorregresivo con Audio VAE y representacion intercalada letra-nota |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino mandarin) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VocalRender combina tres componentes. Primero, una representación intercalada letra-nota que serializa el tempo (BPM) seguido de cada sílaba lírica con sus pares asociados de (altura, valor de nota), preservando la alineación letra-nota y soportando melismas. Segundo, un Audio VAE que codifica el canto como latentes acústicos continuos compactos. Tercero, un modelo de difusión autorregresivo que genera la secuencia de latentes por parches y decide cuándo detenerse; el decodificador del VAE convierte el resultado en forma de onda.

El entrenamiento de la variante estándar utiliza CrawlSinger-OS (más de 2.300 horas) con un preentrenamiento sintético de 40.000 pasos seguido de un ajuste fino con datos reales de 20.000 pasos. VocalRender-Pro se entrena sobre CrawlSinger (más de 5.600 horas de canto real) durante 160.000 pasos. Ambas variantes comparten la misma arquitectura, número de parámetros e inicialización del modelo base VoxCPM2; solo difieren en el corpus y el calendario de entrenamiento. El modelo no requiere duraciones a nivel de fonema, predictor de duración explícito ni referencia acústica alineada temporalmente.

## Capacidades

- Síntesis de voz cantada a 48 kHz a partir de partituras simbólicas (letras, alturas MIDI, valores de nota y tempo).
- Importación de formatos de partitura estándar: ABC notation y MusicXML (desde MuseScore u otro software de notación).
- Soporte de melismas: una sílaba puede continuar a través de múltiples notas.
- Clonación de timbre vocal a partir de una referencia de 2-8 segundos de canto limpio sin acompañamiento; el clip no necesita ser de la misma canción.
- Representación de silencios y respiraciones mediante el token SP.
- Entrada manual de notas con pitch MIDI (60 = C4, 0 = silencio).
- Generación de canto en chino mandarín con melodía vocal monofónica.
- No requiere duraciones fonémicas ni referencia acústica alineada temporalmente.

## Casos de uso

- Prototipado rápido de maquetas vocales: un compositor escribe una melodía en ABC notation o MusicXML, añade letras en chino y obtiene una interpretación cantada sin necesidad de un cantante real, lo que acelera la iteración creativa.
- Demo de voces para producción musical: productores evalúan cómo suena una melodía con diferentes timbres vocales seleccionando distintas voces de referencia de 2-8 segundos, útil para decidir el registro vocal antes de una grabación profesional.
- Creación de jingles e intros para contenido audiovisual: creadores de vídeos cortos o podcasts generan voces cantadas para segmentos musicales sin contratar cantantes, reduciendo costes de producción.
- Herramienta educativa de teoría musical: estudiantes de composición escuchan cómo se interpretan sus partituras con letras, comprendiendo la relación entre notación simbólica y resultado sonoro.
- Prototipado de bandas sonoras para videojuegos: desarrolladores indie generan versiones preliminares de canciones y prueban diferentes líneas melódicas antes de grabar con vocalistas profesionales.
- Investigación en síntesis de voz cantada: investigadores usan VocalRender como punto de partida para experimentos de SVS, aprovechando el dataset abierto CrawlSinger-OS, el código fuente publicado y la demo online para reproducir resultados.

## Benchmarks y rendimiento

Los resultados publicados en el paper comparan las dos variantes del modelo:

| Metrica | VocalRender | VocalRender-Pro |
|---|---|---|
| WER (Opencpop) | 4,44 | 3,88 |
| Similitud de locutor (Opencpop) | 0,922 | 0,929 |
| WER (CrawlSinger-Eval) | 4,52 | 4,45 |
| Similitud de locutor (CrawlSinger-Eval) | 0,919 | 0,926 |
| MS-MOS (seguimiento de partitura) | 2,96 | 2,71 |

VocalRender-Pro mejora la inteligibilidad, la similitud de locutor, la naturalidad y la robustez ante datos fuera de distribución, mientras que VocalRender obtiene una puntuación MS-MOS más alta en seguimiento de partitura, posiblemente por anotaciones más fiables en su subconjunto de ajuste fino. No se han publicado comparaciones cuantitativas con otros modelos SVS en la información disponible.

## Requisitos de hardware

- Cada checkpoint (VocalRender o VocalRender-Pro) ocupa aproximadamente 9,5 GB en disco, lo que sugiere una VRAM mínima de 16-24 GB para inferencia en precisión fp16 (estimación basada en el tamaño del checkpoint; no se han publicado requisitos oficiales).
- El repositorio completo pesa 18,7 GB e incluye ambas variantes, el AudioVAE, la configuración del modelo y el tokenizador SVS extendido.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40-80 GB) o superiores; no se ha confirmado el funcionamiento en GPUs de menor VRAM.
- No se han publicado benchmarks de latencia ni throughput en la información disponible.
- Para despliegue, el repositorio de GitHub incluye instrucciones de instalación con `uv sync` y scripts de inferencia; no se mencionan integraciones con vLLM, llama.cpp u Ollama, al tratarse de un modelo de audio y no de texto.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos con otros modelos SVS en la información proporcionada. El modelo base es openbmb/VoxCPM2, del que hereda la inicialización y la arquitectura de partida. Existen otros sistemas SVS en el espacio, como DiffSinger (basado en difusión, código abierto) o ACE-Step (comercial), pero no se publican comparaciones directas con VocalRender en la documentación disponible. La principal diferenciación de VocalRender frente a estos sistemas es su naturaleza "score-native": no requiere duraciones fonémicas ni referencias acústicas alineadas, y acepta formatos de partitura estándar directamente.

## Limitaciones y advertencias

- El checkpoint liberado funciona mejor con chino mandarín y una única melodía vocal monofónica; no soporta acordes simultáneos ni partituras polifónicas completas.
- Los nombres de acordes en ABC (como "C" o "G7") se tratan como etiquetas de acompañamiento y se ignoran.
- Para partituras de piano o conjuntos, es necesario seleccionar una parte vocal o melódica monofónica; el modelo informa de pasajes no soportados en lugar de adivinar qué nota debe cantarse.
- La referencia de voz debe ser un clip de 2-8 segundos de canto limpio sin acompañamiento, y el usuario debe tener permiso para utilizarlo.
- El modelo no compone melodías ni arregla acompañamientos: es un renderizador de partituras, no un compositor automático.
- No se han documentado sesgos específicos, pero al entrenarse principalmente con datos en chino mandarín, el rendimiento en otros idiomas no está garantizado.
- El número exacto de parámetros no se ha publicado, lo que dificulta estimar con precisión los requisitos de memoria y cómputo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pymaster/VocalRender)
- [Paper (arXiv:2607.27768)](https://arxiv.org/abs/2607.27768)
- [Codigo y documentacion (GitHub)](https://github.com/pymaster17/VocalRender)
- [Demo de inferencia online](https://huggingface.co/spaces/pymaster/VocalRender-demo)
- [Dataset de entrenamiento CrawlSinger-OS](https://huggingface.co/datasets/pymaster/CrawlSinger-OS)
- [Pagina de demos de audio](https://pymaster17.github.io/VocalRender/)
