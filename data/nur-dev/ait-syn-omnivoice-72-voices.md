# nur-dev/ait-syn-omnivoice-72-voices

## Resumen

nur-dev/ait-syn-omnivoice-72-voices es un modelo de síntesis de voz (text-to-speech) publicado por el usuario nur-dev en HuggingFace, obtenido mediante fine-tuning del modelo base k2-fsa/OmniVoice. Se distribuye como un sistema de voces fijas: el tag fixed-voices indica un conjunto cerrado de 72 voces predefinidas, sin que la información disponible documente clonación de voz a partir de muestras del usuario. Cubre tres idiomas: kazajo (kk), ruso (ru) e inglés (en), una combinación poco habitual en el ecosistema TTS abierto, donde el kazajo sigue siendo un idioma con recursos limitados.

El modelo tiene 612.577.288 parámetros (unos 612,6 millones) y se distribuye en formato safetensors, con un repositorio de 2,6 GB, un tamaño coherente con pesos en precisión completa. La relevancia principal reside en su especialización idiomática: la mayoría de los TTS abiertos de calidad se centran en inglés, chino o grandes lenguas europeas, mientras que este modelo apunta explícitamente a kazajo y ruso. El tag phrase-streaming sugiere una síntesis orientada a streaming por frases, útil para asistentes conversacionales con requisitos de baja latencia.

El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. La licencia declarada es una licencia compuesta, apache-2.0-and-boson-higgs-audio-2, etiquetada como "other" en la plataforma, lo que obliga a revisar los términos antes de cualquier uso comercial. Con 2 descargas y 0 "likes" en el momento de la consulta, se trata de un modelo sin validación pública por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado por fine-tuning de k2-fsa/OmniVoice; no se detalla la arquitectura interna) |
| Parametros totales | 612.577.288 (~612,6 M) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | kazajo (kk), ruso (ru), inglés (en) |
| Licencia | apache-2.0-and-boson-higgs-audio-2 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-to-speech |
| Numero de voces | 72 voces fijas (tag fixed-voices) |
| Modelo base | k2-fsa/OmniVoice (fine-tune) |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 2,6 GB |
| Fecha de publicacion | 2026-10-08 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la información disponible. Se sabe únicamente que deriva por fine-tuning del modelo k2-fsa/OmniVoice, desarrollado por el ecosistema k2-fsa, y que el resultado se comercializa como un sistema de voces fijas. Los tags no mencionan componentes de tipo transformer, MoE, SSM ni híbrido, ni tampoco mecanismos como atención lineal o decodificación especulativa, por lo que cualquier afirmación al respecto sería especulativa.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el número de horas de audio utilizadas, la composición del dataset, el idioma de los datos de ajuste y si se aplicaron técnicas de alineación como RLHF o DPO. El único indicio técnico explícito es el tag phrase-streaming, que apunta a una generación de audio organizada por frases, un diseño habitual para reducir la latencia percibida en aplicaciones conversacionales. Del modelo base k2-fsa/OmniVoice tampoco se detallan aquí arquitectura ni datos de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en kazajo, ruso e inglés.
- Selección entre 72 voces fijas predefinidas; no hay evidencia de clonación de voz, control de estilo por prompt ni transferencia de timbre desde una muestra de audio.
- Generación orientada a streaming por frases (phrase-streaming), lo que permite emitir audio antes de completar la totalidad del texto de entrada, siempre que el runtime lo aproveche.
- Capacidad multilingüe limitada a tres idiomas (kk, ru, en); no se documenta el comportamiento en mezcla de idiomas dentro de una misma frase ni en idiomas distintos de esos tres.
- No hay información que indique soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada (speech-to-speech) ni modo "thinking".
- No se documentan capacidades de control prosódico fino (velocidad, tono, emoción) más allá de lo que permita el propio modelo base.

## Casos de uso

- Narración de audiolibros y contenido editorial en kazajo: el modelo permite convertir texto en voz sin depender de voces comerciales propietarias, y las 72 voces fijas facilitan asignar timbres distintos a narrador y personajes.
- Asistentes de voz para atención al cliente en ruso y kazajo: la combinación de ambos idiomas en un mismo modelo simplifica despliegues destinados a mercados de Asia Central, donde normalmente se encadenan varios sistemas TTS.
- Sistemas IVR y locuciones telefónicas automatizadas: la síntesis por frases encaja con menús telefónicos que necesitan respuestas cortas y encadenadas con baja latencia percibida.
- Localización y doblaje de contenidos audiovisuales: al disponer de voces fijas en tres idiomas, es posible generar pistas de voz consistentes entre episodios o entregables manteniendo el mismo timbre.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos, interfaces y contenidos web en kazajo, ruso e inglés con un solo motor.
- Contenido educativo y e-learning: generación de material narrado para cursos, con voces diferenciadas por lección o por tipo de contenido.
- Aumento de datos para entrenamiento de ASR: síntesis de corpus de audio en kazajo para ampliar datasets de reconocimiento automático de voz en un idioma con recursos escasos, siempre que la licencia lo permita.
- Integración en agentes conversacionales por voz: el modo phrase-streaming permitiría empezar a reproducir la respuesta mientras el sistema sigue generando texto, reduciendo el tiempo hasta el primer audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No constan métricas objetivas como WER (word error rate) sobre ASR de referencia, MOS (mean opinion score), similitud de hablante, CER ni comparativas con otros sistemas TTS en kazajo, ruso o inglés. Tampoco se documentan medidas de latencia, RTF (real-time factor) ni throughput.

## Requisitos de hardware

- Estimación de pesos a partir del número de parámetros declarado (612.577.288), no publicada por el autor: unos 2,3 GiB en fp32, 1,1 GiB en fp16/bf16, 0,6 GiB en int8 y 0,3 GiB en int4. El repositorio de 2,6 GB es coherente con un almacenamiento en precisión completa.
- VRAM estimada para inferencia: con fp16/bf16, aproximadamente 1,5–3 GB sumando pesos y overhead del runtime; en fp32, en torno a 3–4 GB. Estas cifras son estimaciones de cálculo, no medidas publicadas.
- GPU recomendadas: el modelo cabe holgadamente en GPUs de consumo. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) son suficientes con amplio margen. Para servir muchas peticiones concurrentes o aplicar batching, tienen sentido A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB de VRAM o más en fp16, e incluso en GPUs de gama de entrada tipo GTX 1650 (4 GB) o RTX 3050 (6 GB). También es plausible la inferencia solo en CPU por el tamaño reducido, siempre que el runtime sea eficiente.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM (que además está orientado a modelos de lenguaje, no a TTS), llama.cpp, Ollama ni TGI. Habría que verificar si existe exportación a ONNX u otro formato, algo que la información disponible no confirma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información disponible no permite comparar el modelo con alternativas de forma rigurosa, porque no se han publicado benchmarks ni detalles de arquitectura. La tabla siguiente recoge únicamente los datos declarados de este modelo y referencias generales de la categoría; los campos no verificados se marcan como no disponible. Los datos de los modelos comparativos proceden de su documentación pública y pueden variar según la versión.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| nur-dev/ait-syn-omnivoice-72-voices | 612,6 M | kk, ru, en | apache-2.0-and-boson-higgs-audio-2 | HuggingFace, acceso restringido (gated) |
| k2-fsa/OmniVoice (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| Kokoro-82M | 82 M (según documentación pública) | inglés y varios idiomas según versión | Apache-2.0 (según documentación pública) | HuggingFace |
| XTTS-v2 (Coqui) | ~467 M (según documentación pública) | multilingüe amplio | Coqui Public Model License, con restricciones de uso comercial (según documentación pública) | HuggingFace, con aceptación de términos |

No se dispone de comparativas de calidad (MOS, WER) entre este modelo y las alternativas citadas.

## Limitaciones y advertencias

- Acceso restringido (gated): es obligatorio aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que añade fricción a la evaluación y limita la reproducibilidad inmediata.
- Licencia compuesta: apache-2.0-and-boson-higgs-audio-2, etiquetada como "other". La parte correspondiente a Boson Higgs Audio 2 puede imponer condiciones adicionales para uso comercial. Es imprescindible revisar los términos completos antes de desplegar en producción.
- Modelo con 2 descargas y 0 "likes": no hay validación pública, informes de errores, casos de uso verificados ni señales de mantenimiento continuado.
- Sin benchmarks publicados: no es posible estimar de antemano la calidad de la voz, la inteligibilidad ni la naturalidad en cada uno de los tres idiomas.
- Sin información sobre datos de entrenamiento: se desconocen la procedencia, el consentimiento y la composición del corpus, lo que impide evaluar sesgos de acento, género, edad o registro.
- Sesgos conocidos: no disponible, precisamente por la ausencia de documentación del dataset. Existe un riesgo razonable de sesgo demográfico en las 72 voces y de menor calidad fuera del dominio cubierto por los datos de ajuste.
- Riesgo de alucinación: en TTS se manifiesta como pronunciaciones incorrectas, omisiones, repeticiones, alargamientos anómalos o artefactos de audio en entradas fuera de dominio, con números, siglas y préstamos léxicos como casos típicos de fallo. No hay métricas publicadas que cuantifiquen este riesgo.
- Limitación idiomática: solo kk, ru y en. No se documenta el comportamiento con mezcla de idiomas en una misma frase, que es frecuente en kazajo, donde se alternan términos rusos y anglicismos.
- Voces fijas: no se anuncia clonación de voz ni control fino de estilo, lo que limita aplicaciones que requieran un timbre concreto no incluido entre las 72 voces.
- Cuantizaciones no documentadas: sin GGUF, INT8 ni INT4 publicados, el despliegue en hardware muy limitado depende de que el runtime soporte cuantización en el momento de la carga.
- Consideraciones éticas y legales: la síntesis de voz puede emplearse para suplantación o desinformación. No se documentan mecanismos de marca de agua ni de detección de audio sintético, por lo que la responsabilidad recae en quien despliega el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nur-dev/ait-syn-omnivoice-72-voices
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
