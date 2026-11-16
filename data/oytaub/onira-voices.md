# oytaub/onira-voices

## Resumen

Onira narration voices es un modelo de síntesis de voz (text-to-speech) en francés desarrollado por el usuario oytaub para la aplicación de autohipnosis y relajación Onira. Se trata de un modelo VITS de calidad media con frecuencia de muestreo de 22,05 kHz, empaquetado en el formato que consume sherpa-onnx (Piper), lo que permite su ejecución completamente en el dispositivo sin conexión a servicios externos. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia CC BY 4.0.

El modelo no es una voz genérica: incorpora tres registros de locución diferenciados por identificador de hablante (calm, deep y emerge), pensados para estructurar una sesión de hipnosis (inducción, cuerpo de la sesión y vuelta a la vigilia). La voz es enteramente sintética, diseñada mediante Qwen3-TTS VoiceDesign y posteriormente clonada con Qwen3-TTS Base para generar el corpus de entrenamiento, sin corresponder a ninguna persona real.

Su relevancia radica en el nicho: un TTS ligero, offline y de licencia permisiva para aplicaciones de bienestar en francés, un segmento con poca oferta de voces especializadas y libres. El ajuste fino se realizó durante 2.000 épocas partiendo de la voz Piper francesa `siwis` (calidad media).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), calidad media, 22,05 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json`), empaquetado en `.tar.bz2` junto con `tokens.txt` y `espeak-ng-data/` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema TTS de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normalizadores y un vocoder integrado, lo que permite síntesis de audio de forma directa a partir del texto. En este caso se usa la implementación de Piper en calidad media con salida a 22,05 kHz, compatible con el runtime sherpa-onnx mediante `OfflineTtsVitsModelConfig`.

El corpus de entrenamiento consta de aproximadamente 600 frases (61 minutos de guiones de hipnosis) repartidas entre los tres registros de locución. Todas las frases fueron re-transcritas con Whisper antes del entrenamiento, con una tasa de error de caracteres mediana del 0 %. El ajuste fino se ejecutó durante 2.000 épocas a partir de la voz Piper francesa `siwis` (calidad media). La voz de referencia se diseñó a partir de una descripción textual con Qwen3-TTS VoiceDesign (Apache-2.0) y el corpus se generó clonando esa referencia con Qwen3-TTS Base, aplicando un ecualizado suave. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo TTS de este tipo.

## Capacidades

- Síntesis de voz en francés a partir de texto, con salida a 22,05 kHz.
- Tres registros de locución seleccionables por `sid`: `calm` (inducción, lenta y cálida), `deep` (cuerpo de la sesión, más lenta y grave, con finales de frase descendentes) y `emerge` (vuelta, más brillante y animada).
- Ejecución completamente offline y en el dispositivo mediante sherpa-onnx.
- Integración sencilla con el ecosistema Piper (formato de directorio con `.onnx`, `.onnx.json`, `tokens.txt` y `espeak-ng-data/`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.

## Casos de uso

- Aplicaciones de autohipnosis y relajación: el modelo está diseñado específicamente para narrar sesiones guiadas, con tres registros que permiten estructurar la inducción, el cuerpo y el cierre de cada sesión sin cambiar de voz.
- Apps móviles de bienestar sin conexión: al ejecutarse con sherpa-onnx en el dispositivo, permite generar narraciones sin enviar texto a servidores externos, lo que reduce latencia y preserva la privacidad del usuario.
- Meditación guiada y mindfulness en francés: la voz `calm` y el ritmo lento de `deep` encajan con contenidos de respiración y relajación progresiva.
- Audiolibros y contenido narrativo de nicho: el registro `emerge` puede emplearse para secciones introductorias o de cierre con un tono más animado.
- Prototipado de asistentes de voz en francés: su licencia CC BY 4.0 y su tamaño reducido (unos 80 MB comprimidos) facilitan integrarlo en demos y pruebas de concepto sin coste de licencia.
- Accesibilidad y lectura en voz alta: puede narrar textos largos en francés en dispositivos de bajos recursos, al no requerir GPU dedicada.
- Generación de contenido de audio para cursos y ejercicios de relajación: el formato ONNX y la integración con Piper permiten automatizar la producción de pistas de audio a partir de guiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (unos 80 MB comprimidos) se trata de una carga muy ligera, apta para CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante sherpa-onnx.
- Cabe en GPU de consumo: sí, con amplio margen, aunque no es necesario disponer de GPU.
- Opciones de despliegue: sherpa-onnx (runtime principal documentado), Piper y, por extensión, herramientas compatibles con modelos VITS de Piper.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Calidad / frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Onira narration voices | fr | VITS (Piper) | media, 22,05 kHz | CC BY 4.0 | Hugging Face, ONNX |
| Piper fr `siwis` (modelo base) | fr | VITS (Piper) | media | no disponible en la información | Hugging Face / Piper |
| Qwen3-TTS (VoiceDesign / Base) | multilingüe | no disponible en la información | no disponible | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (TTS ligero en francés) no puede completarse con datos verificados a partir de la información disponible; los modelos citados se incluyen únicamente por su relación directa con el entrenamiento de este modelo (base y generador del corpus).

## Limitaciones y advertencias

- Solo soporta francés; no hay capacidades multilingües documentadas.
- Voz enteramente sintética: no corresponde a ninguna persona real y no debe usarse para suplantar identidades, tal como indica el propio autor.
- Corpus de entrenamiento pequeño (unas 600 frases, 61 minutos), lo que puede limitar la cobertura prosódica y la naturalidad en textos fuera del dominio de hipnosis y relajación.
- Calidad media y 22,05 kHz: no apto para producciones que requieran alta fidelidad o voces expresivas fuera de los tres registros definidos.
- Riesgo de artefactos y errores de pronunciación en palabras técnicas, nombres propios o extranjerismos no presentes en el corpus.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y respetar la atribución de la base SIWIS y de Piper.
- No se documentan sesgos específicos, pero al derivar de una base entrenada con la base de datos SIWIS, puede heredar las características de ese corpus.
- No hay datos publicados de benchmarks ni de latencia, por lo que la evaluación en producción debe realizarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oytaub/onira-voices
- Aplicación Onira: https://onirahypno.com
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Base de datos SIWIS (University of Edinburgh): https://datashare.is.ed.ac.uk/handle/10283/2353
- Piper (Rhasspy / Open Home Foundation): no se incluye URL en la información disponible
- Qwen3-TTS: no se incluye URL en la información disponible
