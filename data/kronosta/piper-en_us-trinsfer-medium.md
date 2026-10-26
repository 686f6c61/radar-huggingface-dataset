# kronosta/piper.en_US-trinsfer-medium

## Resumen

`kronosta/piper.en_US-trinsfer-medium` es un checkpoint de síntesis de voz (TTS) para el motor Piper, distribuido en formato ONNX y entrenado para el inglés estadounidense. Lo publica el usuario kronosta como parte de su proyecto de worldbuilding «Trinsfer / The Dimensional Stack», en el que cada personaje tiene una «voz reclamada» construida a partir de voces de YouTubers concatenadas y reajustadas de tono antes de alimentar el entrenamiento. El resultado es un modelo multispeaker con 22 voces diferenciadas, no tanto por naturalidad como por fidelidad de timbre.

El modelo se obtiene por fine-tuning del checkpoint `ljspeech-medium`, lo que desde el punto de vista práctico es su rasgo más relevante: la mayoría de modelos Piper en inglés de calidad media derivan de `lessac`, cuya licencia restringe el uso a investigación. Al partir de LJSpeech, este checkpoint queda bajo licencia MIT y, según el autor, sería el primer modelo multispeaker en inglés de calidad media sin esa restricción legal (el alternativo, `libritts`, es de calidad *high* y más lento incluso en un portátil potente).

Técnicamente es un modelo modesto: el autor indica que solo se entrenó durante unas 35 épocas con 300 identificadores de fonema como máximo, tamaño de lote 16 y una RTX 4060 Ti, y que a partir de la época 20 la mejora se estancó. La propia model card advierte de que el habla «no es especialmente natural, pero es comprensible». No se publican métricas objetivas ni datos de arquitectura interna más allá del motor empleado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Piper (TTS neuronal extremo a extremo, pesos en ONNX); la arquitectura interna no se detalla en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en entrenamiento se usaron como máximo 300 identificadores de fonema por muestra |
| Tipos de cuantización | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | inglés (`en`, variante en_US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Voces | 22 speakers (índices 0-21), un solo modelo multispeaker |
| Calidad declarada | media (*medium*) |
| Modelo base | `rhasspy/piper-voices`, fine-tune desde el checkpoint `ljspeech-medium` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-06-30 / 2026-10-26 |

## Arquitectura y entrenamiento

El modelo se ejecuta sobre Piper, el motor de TTS de rhasspy que consume modelos neuronales en ONNX y está pensado para inferencia ligera, incluso en CPU. La model card no describe la topología interna de la red; sí detalla el proceso de fine-tuning: se partió de `ljspeech-medium`, un checkpoint originalmente monohablante, y se convirtió en multispeaker. Para ello el autor retrocedió a la implementación antigua de rhasspy piper, ya que la implementación de OHF-voice no expone esa opción; según sus notas, en rhasspy habilitar el modo multispeaker requiere apenas unas líneas de código.

El entrenamiento se prolongó unas 35 épocas con un máximo de 300 identificadores de fonema por muestra y tamaño de lote 16 sobre una RTX 4060 Ti, en lo que el autor describe como unas pocas horas. A partir de la época 20 la curva se aplanó: el autor señala que la ley de rendimientos decrecientes es muy acusada al hacer fine-tuning de Piper. Los datos de entrenamiento son voces sintéticas: timbres de YouTubers concatenados y reajustados en tono, mezclados mediante IA para generar voces nuevas. No se documenta el volumen del corpus, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline TTS de este tipo).

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto de entrada, con salida en audio.
- Multispeaker: 22 voces con timbres claramente diferenciados, seleccionables por índice (0-21).
- Variación de registro y carácter por voz: desde voces naturales (índices 4, 5, 21) hasta timbres muy marcados (graveloso, radiofónico, gritado, susurrante).
- Control de prosodia limitado al propio texto de entrada; no se documentan etiquetas de emoción ni de estilo.
- Inferencia ligera en ONNX, apta para ejecución en CPU y para integración en sistemas embebidos o asistentes locales.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo «thinking»: no es un modelo de lenguaje.
- No dispone de capacidades de visión, audio de entrada ni traducción; el texto debe estar en inglés.

## Casos de uso

- Doblaje de personajes en proyectos de worldbuilding o narrativa interactiva: las 22 voces permiten asignar un timbre estable a cada personaje y generar diálogos completos con un único modelo, sin cambiar de checkpoint entre líneas.
- Prototipado de videojuegos y novelas visuales: al ser un ONNX de 0,1 GB ejecutable en CPU, se puede empaquetar dentro del propio juego y sintetizar diálogo en tiempo de ejecución sin depender de servicios en la nube.
- Audiolibros y narración de contenido largo: las voces 17 y 18 (calmada y clara, y estilo audiolibro) están descritas por el autor como adecuadas para lectura sostenida, siempre que se acepte una naturalidad inferior a la de un TTS comercial.
- Asistentes de voz locales y domótica: Piper es el motor habitual en integraciones de asistente doméstico; este checkpoint aporta una alternativa MIT que evita las restricciones de licencia de los modelos derivados de Lessac.
- Generación de datos sintéticos para entrenar o evaluar sistemas ASR: la variedad de timbres (agudos, graves, con ruido de micrófono) permite construir corpus de audio etiquetado con diversidad acústica.
- Accesibilidad y lectura en voz alta de documentos en inglés: la licencia MIT permite incorporarlo a productos comerciales sin las limitaciones de «research purposes only» que afectan a la mayoría de voces Piper de calidad media.
- Pruebas de regresión en pipelines de audio: sirve como referencia reproducible de TTS multispeaker para validar cadenas de postprocesado, remuestreo o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MOS, métricas de inteligibilidad (WER de un ASR sobre el audio sintetizado), comparativas objetivas ni curvas de pérdida. La única valoración es cualitativa: el autor califica el habla como «no especialmente natural, pero comprensible», y describe la voz 7 (`m_alexander`) como la menos inteligible del conjunto, aunque mayoritariamente comprensible.

## Requisitos de hardware

- Inferencia en CPU: es el escenario previsto para Piper; el repositorio completo ocupa 0,1 GB, por lo que los pesos individuales son de decenas de megabytes y caben holgadamente en memoria RAM convencional.
- VRAM estimada para GPU: no disponible en la información proporcionada; por el tamaño del repositorio, cualquier GPU consumer con unos pocos GB libres es suficiente, aunque no se documentan cifras.
- GPU recomendadas: no se especifican. El autor solo menciona la GPU empleada para el entrenamiento (RTX 4060 Ti), no para la inferencia.
- Cabe en cualquier GPU consumer e, incluso, en dispositivos de placa única y sistemas empotrados, dado el formato ONNX y el tamaño del modelo.
- Opciones de despliegue: el motor Piper (implementación rhasspy/piper y su variante OHF-voice), con ejecución nativa sobre ONNX Runtime. No se documenta compatibilidad con vLLM, TGI ni llama.cpp, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. El autor solo indica que la calidad *high* (tipo `libritts`) es «un poco más lenta incluso en un portátil potente», lo que sitúa a este checkpoint *medium* en el rango rápido, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Calidad | Voces | Licencia | Notas |
|---|---|---|---|---|
| `kronosta/piper.en_US-trinsfer-medium` | media | 22 (multispeaker) | MIT | Fine-tune de `ljspeech-medium`; sin restricción de uso comercial |
| `rhasspy/piper-voices` (en_US-lessac-medium) | media | 1 (monohablante) | restringida a investigación (problema de licencia Lessac, según la model card) | Referencia habitual en inglés de calidad media |
| `rhasspy/piper-voices` (en_US-libritts-high) | alta | multispeaker | no disponible en la información proporcionada | Más lento según el autor; alternativa de mayor calidad |
| `rhasspy/piper-voices` (en_US-ljspeech-medium) | media | 1 (monohablante) | no disponible en la información proporcionada | Checkpoint de partida del modelo descrito |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo entre estas variantes; la comparación se limita a calidad declarada, número de voces y licencia.

## Limitaciones y advertencias

- Naturalidad baja: el propio autor advierte de que el habla no es natural, solo comprensible; no es adecuado para producción orientada a cliente final sin una evaluación previa.
- Entrenamiento corto y estancado: unas 35 épocas con mejora marginal a partir de la 20, lo que sugiere un margen de mejora no explotado y posibles artefactos de prosodia.
- Inteligibilidad desigual entre voces: la voz 7 se describe como la menos inteligible y varias voces tienen timbres extremos (gritos, pitch errático, micrófono deficiente) que pueden degradar la comprensión.
- Origen de los datos sensible: los timbres provienen de voces de YouTubers concatenadas, reajustadas y mezcladas con IA. Aunque la licencia del checkpoint es MIT, la cadena de procedencia de las voces no está documentada y puede plantear dudas legales o éticas sobre derechos de imagen y de voz en un uso comercial.
- Idioma único: solo inglés estadounidense; no hay soporte multilingüe ni de otros acentos.
- Sin métricas: no hay MOS, WER ni ninguna evaluación objetiva publicada, por lo que la calidad debe validarse empíricamente antes de adoptarlo.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican términos adicionales sobre atribución ni sobre el modelo base; conviene revisar también la licencia de `rhasspy/piper-voices` para los componentes derivados.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación por parte de la comunidad; es un artefacto de proyecto personal, no un modelo mantenido.
- Sin pipeline declarado en HuggingFace y sin documentación de la arquitectura interna, lo que complica la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kronosta/piper.en_US-trinsfer-medium
- Modelo base: https://huggingface.co/rhasspy/piper-voices
- Implementación de referencia de Piper citada por el autor: https://github.com/rhasspy/piper
- No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con síntesis de voz.
