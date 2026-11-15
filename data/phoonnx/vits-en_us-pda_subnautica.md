# Phoonnx/vits-en_us-pda_subnautica

## Resumen

vits-en_us-pda_subnautica es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original fue entrenado por el usuario Aquaaa123 y publicado como `Aquaaa123/piper-tts-pda-subnautica`; Phoonnx lo redistribuye en formato ONNX listo para consumir desde Python y desde el ecosistema OVOS (Open Voice OS). El modelo genera voz en inglés estadounidense (`en-US`) a partir de fonemas espeak en alfabeto IPA.

Se trata de un modelo compacto: el repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en la categoría de voces ligeras aptas para ejecución en CPU y dispositivos de bajos recursos. No se dispone de información sobre el número de parámetros ni sobre el volumen de datos de entrenamiento en la documentación proporcionada.

Su relevancia radica en el empaquetado: Phoonnx estandariza la carga, la fonemización (mediante espeak-ng o el port espyak) y la integración con asistentes de voz, lo que reduce la fricción para desplegar una voz TTS concreta en un pipeline existente. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Aquaaa123 |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en flujos normales y un discriminador adversarial entrenado de forma conjunta. El resultado es un modelo que transforma fonemas directamente en forma de onda, sin necesidad de un vocoder externo separado. La entrada se especifica en fonemas espeak representados en IPA, lo que implica que la normalización de texto y la conversión grafema-fonema se delegan en el front-end (espeak-ng o espyak, a través de la librería `scriptconv`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS. El modelo deriva del release `Aquaaa123/piper-tts-pda-subnautica`, pero la model card no detalla el proceso de entrenamiento original.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de texto de entrada.
- Conversión de texto a fonemas espeak (IPA) mediante el front-end `scriptconv` y el fonemizador `EspeakPhonemizer`.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar a un asistente de una voz concreta en inglés estadounidense sin infraestructura adicional, gracias a su tamaño reducido (~0,1 GB).
- Síntesis de voz en aplicaciones de escritorio o servidor en Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV para respuestas de un chatbot o lectura de notificaciones.
- Lectura de contenido en aplicaciones web: `phoonnx.js` permite ejecutar la voz en el navegador, útil para lectores de artículos o accesibilidad web sin coste de servidor.
- Prototipado rápido de interfaces de voz: al ser un modelo ligero con licencia MIT, es adecuado para validar flujos de interacción voz-texto antes de invertir en voces comerciales.
- Generación de audiolibros o pódcasts automatizados de contenido en inglés: la inferencia local en CPU permite procesar lotes de texto sin depender de APIs externas.
- Sistemas de accesibilidad para personas con discapacidad visual: lectura de texto en pantalla con una voz local y de baja latencia, ejecutable en hardware modesto.
- Pruebas de integración continua de pipelines TTS: el modelo sirve como voz de referencia en tests automatizados de sistemas de voz, al ser determinista en su interfaz de fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) se estima un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no se especifican; el modelo está empaquetado en ONNX y pensado para ejecución ligera, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna e incluso en CPU, dado el tamaño del modelo, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-pda_subnautica (este) | VITS | en-US | MIT | ONNX | ~0,1 GB, entrada IPA espeak |
| Otras voces VITS del catálogo Phoonnx | VITS | variable | variable segun autor | ONNX | Mismo pipeline de empaquetado |
| Piper TTS (voces piper) | VITS | múltiples | MIT (mayoría) | ONNX | Ecosistema más amplio, integración con Home Assistant |
| Coqui TTS (voces VITS) | VITS / otros | múltiples | MPL-2.0 / otras | varios | Framework más pesado, mayor variedad de arquitecturas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento objetivo (MOS, RTF) de este modelo con las alternativas citadas.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés estadounidense; no soporta otros idiomas.
- La calidad de pronunciación depende de la corrección de los fonemas espeak; el uso del port espyak en lugar de espeak-ng puede producir errores en algunas palabras, según advierte la model card.
- No se documentan sesgos específicos, pero al ser una voz entrenada sobre un dataset concreto (no publicado) puede presentar sesgos de prosodia o timbre no evaluados.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir artefactos acústicos en entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero la model card indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del modelo original `Aquaaa123/piper-tts-pda-subnautica`.
- No hay información sobre latencia, throughput ni calidad objetiva (MOS), lo que dificulta evaluar su idoneidad para producción a gran escala.
- Dependencia de espeak-ng o espyak como dependencia externa del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-pda_subnautica
- Modelo original (upstream): https://huggingface.co/Aquaaa123/piper-tts-pda-subnautica
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
