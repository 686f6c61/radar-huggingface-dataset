# Salahuddin1234/omnidoctor-chatterbox

## Resumen

`Salahuddin1234/omnidoctor-chatterbox` es una republicación comunitaria en HuggingFace del modelo Chatterbox de Resemble AI, una familia de modelos de síntesis de voz (text-to-speech) de código abierto con clonación de voz zero-shot. El repositorio conserva la model card original de Chatterbox Multilingual V3 y la etiqueta de librería `chatterbox`, por lo que el contenido real corresponde al TTS multilingüe de Resemble AI, no a un modelo propio del autor de la cuenta. El nombre "omnidoctor" no guarda relación aparente con el paper OmniDoctor sobre aprendizaje continuo clínico localizado en la búsqueda web.

El modelo base es un TTS multilingüe de 0,5B parámetros construido sobre un backbone Llama, capaz de generar voz en 23 idiomas y de clonar una voz a partir de una muestra corta de referencia. Incorpora control de exageración emocional, inferencia guiada por alineamiento para mayor estabilidad y marcado de agua en las salidas. Está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones de la licencia original.

Su relevancia radica en que es uno de los pocos sistemas TTS abiertos que compite en evaluaciones ciegas con servicios cerrados como ElevenLabs, con un tamaño lo suficientemente pequeño como para ejecutarse en GPU de consumo. No obstante, este repositorio concreto tiene cero descargas y cero likes, no incluye documentación específica sobre los pesos alojados y su fecha de creación aparece como 30 de septiembre de 2026, lo que obliga a tratar la ficha como descriptiva del modelo subyacente y no del artefacto publicado por esta cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con backbone Llama de 0,5B (según model card); componentes de decodificación acústica no detallados |
| Parametros totales | 500M (0,5B) según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh (23 idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible (no especificado en la informacion proporcionada) |

Nota: el tamaño del repositorio es de 13,9 GB, muy superior a lo esperable para un único checkpoint de 0,5B en fp32 (~2 GB), lo que sugiere la presencia de varios ficheros de pesos, checkpoints adicionales o assets auxiliares. La información disponible no permite confirmar su composición.

## Arquitectura y entrenamiento

La model card describe Chatterbox Multilingual V3 como un modelo TTS de propósito general de 0,5B parámetros con backbone Llama, entrenado sobre 0,5 millones de horas de datos limpiados. La generación se realiza en modo zero-shot: basta una muestra de voz de referencia para clonar el timbre y el acento del hablante, con especial énfasis en la similitud del hablante y la preservación del acento a través de distintos idiomas. La versión V3 se orienta a reducir alucinaciones (continuaciones no solicitadas, repeticiones y habla fuera del prompt) y a producir un habla más natural y conversacional.

Entre las innovaciones destacadas por el autor están la inferencia "alignment-informed" para mejorar la estabilidad, un control único de exageración e intensidad emocional y el uso de decodificación guiada por CFG (classifier-free guidance) con parámetros ajustables (`exaggeration`, `cfg`). La model card no detalla la composición exacta del dataset, la proporción por idioma, ni si hubo fases de RLHF o DPO; tampoco especifica el mecanismo vocacional ni el codec acústico empleado. Las salidas se publican con marca de agua. La información disponible no permite confirmar el proceso de entrenamiento específico de este repositorio frente al modelo original.

## Capacidades

- Generación de voz (text-to-speech) a partir de texto en 23 idiomas.
- Clonación de voz zero-shot a partir de una muestra corta del hablante de referencia.
- Preservación de identidad y acento del hablante entre idiomas (cross-language voice cloning).
- Control de exageración e intensidad emocional mediante el parámetro `exaggeration`.
- Ajuste de ritmo y prosodia mediante el parámetro `cfg` (valores bajos ~0,3 para hablantes rápidos).
- Generación estable con inferencia guiada por alineamiento, orientada a reducir repeticiones y continuaciones no deseadas.
- Script de conversión de voz incluido según la model card.
- Marcado de agua en todas las salidas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso: se trata de un modelo puramente generativo de voz.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite clonar la voz de un actor y generar su equivalente en otro de los 23 idiomas soportados, preservando el timbre y el acento, lo que reduce el coste frente a doblaje tradicional.
- Producción de audiolibros: con una única muestra de voz se puede generar un audiolibro completo con voz consistente, y el control de `cfg` permite ajustar el ritmo de lectura a la densidad del texto.
- Agentes de voz en atención al cliente: el modelo puede generar respuestas habladas en tiempo casi real en varios idiomas, integrándose en flujos IVR o asistentes telefónicos, con licencia MIT que permite uso comercial.
- Accesibilidad: lectura en voz alta de documentos, interfaces o contenido web para personas con discapacidad visual, con capacidad de ofrecer voces en el idioma nativo del usuario.
- Contenido para videojuegos: generación de voces de personajes en múltiples idiomas sin necesidad de contratar a un actor por localización, con control de exageración para estilos dramáticos o caricaturescos.
- Investigación en síntesis de voz y detección de deepfakes: el marcado de agua incorporado y el tamaño reducido (0,5B) lo hacen útil para estudiar marcas de agua, detección de voz sintética y evaluaciones comparativas.
- Prototipado de podcasts y contenido editorial: generación rápida de narraciones con una voz de marca consistente y expresividad ajustable.
- Conversión de voz: el script incluido permite transformar una grabación existente a la timbre de otro hablante, útil para postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible para este repositorio. La model card afirma que el modelo "supera a ElevenLabs" y enlaza a una evaluación comparativa alojada en Podonos, y menciona que fue evaluado frente a sistemas cerrados en pruebas lado a lado, pero no se aportan cifras concretas (MOS, similitud de hablante, WER, latencia) en los datos proporcionados.

| Benchmark | Resultado | Fuente |
|---|---|---|
| MOS / similitud de hablante | no disponible | no disponible |
| WER en ASR de ida y vuelta | no disponible | no disponible |
| Latencia | no disponible (se cita "sub-200ms" únicamente para el servicio comercial de Resemble AI) | model card |
| Comparativa frente a ElevenLabs | reclamada como favorable, sin cifras | enlace a Podonos en la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con un backbone de 0,5B, la estimación orientativa en fp16 ronda 1-2 GB solo para el componente de lenguaje, más el coste del decodificador acústico y del vocoder, que la model card no detalla; un presupuesto práctico de 4-8 GB de VRAM es razonable, pero no está confirmado por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) debería poder ejecutarlo; GPU de datacenter (A100, H100) solo serían necesarias para servir muchas peticiones concurrentes.
- ¿Cabe en GPU de consumo? Sí, previsiblemente, dado el tamaño de 0,5B, aunque la información disponible no incluye requisitos oficiales ni pruebas de VRAM publicadas.
- Opciones de despliegue: la librería declarada es `chatterbox`, y el proyecto original de Resemble AI publica un repositorio en GitHub con scripts de inferencia. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son los runners habituales para modelos TTS.
- Latencia y throughput: no disponibles. La model card solo menciona latencia "sub-200ms" para el servicio comercial de Resemble AI, no para el modelo abierto. El tamaño del repositorio (13,9 GB) implica tiempos de descarga y carga en memoria significativos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 (este repo) | 0,5B | 23 | MIT | HuggingFace (repo comunitario, 0 descargas) | Clonación zero-shot, control de exageración, marca de agua |
| XTTS-v2 (Coqui) | ~0,47B | 17 | Coqui Public Model License (no comercial) | HuggingFace | Clonación zero-shot, sin control emocional explícito |
| Bark (Suno) | no disponible | multilingüe | MIT | HuggingFace | Generación de audio y efectos, calidad de voz variable |
| ElevenLabs | propietario | multilingüe | propietaria | API comercial | Referencia cerrada citada en la model card como superada |

No se dispone de cifras de rendimiento comparativas verificables para la mayoría de estos modelos dentro de la información proporcionada, por lo que la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- El repositorio es una republicación comunitaria: no está mantenido por Resemble AI, tiene 0 descargas y 0 likes, y la fecha de creación indicada (30/09/2026) es inconsistente con la fecha de publicación de Chatterbox Multilingual V3, lo que exige verificar la integridad de los pesos antes de usarlos en producción.
- El nombre "omnidoctor" no corresponde a ninguna capacidad médica ni al paper OmniDoctor localizado en la búsqueda; no debe interpretarse como un modelo clínico.
- Riesgo de alucinación de voz: la model card indica que V3 reduce continuaciones no deseadas, repeticiones y habla fuera del prompt, lo que implica que versiones anteriores o configuraciones inadecuadas sí presentaban estos fallos.
- La información no detalla sesgos de género, acento, etnia o idioma. La cobertura de 23 idiomas es desigual en calidad, y el propio autor publica "Single Language Pack" para idiomas prioritarios, lo que sugiere que el rendimiento multilingüe general no es homogéneo.
- Clonación de voz: el uso para suplantar la identidad de una persona sin consentimiento puede ser ilegal en jurisdicciones como la UE y varios estados de EE. UU., con independencia de que la licencia sea MIT.
- La licencia MIT permite uso comercial del modelo, pero no exime del cumplimiento de normativa sobre voz sintética, etiquetado de contenido generado y protección de datos.
- No se documentan longitudes máximas de texto de entrada, límites de duración de audio generado ni requisitos de idioma para la muestra de referencia.
- La información disponible no confirma si el repositorio contiene el modelo completo o artefactos parciales, pese a sus 13,9 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-chatterbox
- Modelo original de Resemble AI: https://huggingface.co/ResembleAI/chatterbox
- Repositorio GitHub de Chatterbox: https://github.com/resemble-ai/chatterbox
- Demo de muestras de audio: https://resemble-ai.github.io/chatterbox_demopage/
- Space oficial de Chatterbox: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Space de Chatterbox Multilingual TTS V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Evaluación comparativa en Podonos: https://podonos.com/resembleai/chatterbox
- Servicio comercial de Resemble AI: https://resemble.ai
- Paper OmniDoctor (referencia no relacionada con este modelo): https://dl.acm.org/doi/10.1145/3746027.3755745
