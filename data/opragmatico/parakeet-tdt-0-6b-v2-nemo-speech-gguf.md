# opragmatico/parakeet-tdt-0.6b-v2-nemo-speech-gguf

## Resumen

Parakeet TDT 0.6B v2 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, basado en la arquitectura FastConformer con cabecera TDT (Token-and-Duration Transducer). Esta ficha describe la conversión a formato GGUF realizada por el usuario opragmatico para su uso con el runtime NeMo-Speech.cpp, ya que NVIDIA solo publica el checkpoint original en formato `.nemo` para esta versión v2.

La relevancia de esta adaptación radica en que NeMo-Speech.cpp solo listaba oficialmente el modelo hermano multilingüe v3, de arquitectura idéntica, dejando sin soporte práctico la variante v2 en inglés. El autor generó estos GGUF para Goscriber, una aplicación de dictado offline push-to-talk, y los publica para que cualquier runtime NeMo-Speech.cpp pueda cargarlos.

El modelo cuenta con 628.146.950 parámetros y un tamaño de repositorio de 2,0 GB. Se ofrece en dos cuantizaciones: Q8_0 (700 MB) y F16 (1,28 GB). Está pensado exclusivamente para inglés, decodifica utterances completas (no soporta streaming) y mantiene una precisión muy alta en LibriSpeech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabecera TDT (Token-and-Duration Transducer) |
| Parametros totales | 628.146.950 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (decodifica utterances completas; NeMo-Speech.cpp divide audio de más de 6 min 40 s en pausas) |
| Tipos de cuantizacion | Q8_0 (pesos lineales y convoluciones pointwise a 8 bits, resto F16/F32) y F16 (lineales y convoluciones pointwise a 16 bits, resto F32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (exclusivo de NeMo-Speech.cpp) |

## Arquitectura y entrenamiento

El modelo original es un FastConformer-TDT de NVIDIA: un encoder Conformer con downsampling (FastConformer) acoplado a una cabecera Transducer TDT que predice conjuntamente tokens y duraciones. La cabecera TDT almacena en el GGUF el conjunto de duraciones `[0, 1, 2, 3, 4]`, detectado automáticamente por el conversor de NeMo-Speech.cpp v0.3.0.

Esta publicación no es un reentrenamiento ni un fine-tuning: es una conversión de formato del checkpoint `parakeet-tdt-0.6b-v2.nemo` (revisión `ae9ad07059c7c739ffaf932226a8fe64ae2620b0`) a GGUF mediante `convert_model.py` de NeMo-Speech.cpp v0.3.0 (commit `20999cc9`), ejecutado sobre Python 3.12 con PyTorch 2.15.0, NumPy 1.26.4, gguf 0.19.0 y librosa 0.11.0. En el archivo Q8_0 se cuantizaron a 8 bits los pesos lineales y de convolución pointwise; el resto se mantiene en F16/F32. En el archivo F16 esos mismos pesos se almacenan a 16 bits y el resto en F32. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el proceso de alineación o RLHF empleado por NVIDIA.

## Capacidades

- Reconocimiento automático del habla en inglés con transcripción que incluye puntuación y mayúsculas.
- Generación de marcas de tiempo a nivel de palabra (word timestamps).
- Decodificación de utterances completas en modo offline; el runtime rechaza solicitudes de streaming para este modelo.
- Manejo de audio largo mediante división automática en pausas cuando la entrada supera los 6 min 40 s (comportamiento del runtime, no del modelo).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Sin capacidades de visión, audio generativo ni modo thinking.
- Multilingüismo limitado: únicamente inglés.

## Casos de uso

- Dictado offline push-to-talk: integrado en aplicaciones de escritorio como Goscriber, el modelo transcribe voz a texto en local sin conexión, con puntuación y mayúsculas automáticas, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Subtitulado y transcripción de reuniones: gracias a las marcas de tiempo por palabra, se pueden generar subtítulos sincronizados; para grabaciones largas conviene trocear el audio en pausas antes de decodificar.
- Procesamiento por lotes de archivos de audio en inglés: el tamaño reducido del GGUF Q8_0 (700 MB) permite ejecutar la transcripción en máquinas con poca memoria, incluidas estaciones de trabajo sin GPU dedicada.
- Transcripción de notas de voz y entrevistas cortas: el modelo rinde de forma fiable en entradas de hasta 35 s, lo que cubre la mayoría de mensajes de voz y clips breves.
- Integración en pipelines de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones locales, sin depender de servicios en la nube.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de corpus de audio en inglés para construir datasets de texto alineado.
- Asistentes de voz locales en dispositivos Apple Silicon: el runtime NeMo-Speech.cpp con backend Metal permite ejecutar el modelo en Macs sin GPU dedicada de NVIDIA.

## Benchmarks y rendimiento

Word error rate (WER) en LibriSpeech, con normalización inglesa de Whisper del Hugging Face Open ASR Leaderboard, decodificado por NeMo-Speech.cpp v0.3.0 en Apple Silicon (Metal):

| Modelo / cuantizacion | test-clean | test-other |
|---|---|---|
| Este repositorio, Q8_0 | 1,63% | 3,17% |
| Este repositorio, F16 | 1,62% | 3,19% |
| Model card de NVIDIA (NeMo, PyTorch) | 1,69% | 3,19% |

La cuantización Q8_0 no degrada de forma apreciable la precisión respecto a F16 ni al original en PyTorch. No se han publicado en la información disponible otros benchmarks (p. ej. MLS, Common Voice) ni comparativas con modelos ASR alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con Q8_0 (archivo de 700 MB) y en torno a 1,3 GB con F16 (archivo de 1,28 GB), más overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; el autor reporta pruebas en Apple Silicon con backend Metal.
- Compatibilidad con GPU consumer: por tamaño, cabe holgadamente en cualquier GPU consumer moderna (p. ej. RTX 3060 en adelante), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: exclusivamente NeMo-Speech.cpp (v0.3.0 o superior). Los GGUF de transcribe.cpp (usados por Handy) son un formato distinto e incompatible; ningún runtime carga los del otro.
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación de Goscriber incluye mediciones de latencia y memoria, pero sus valores no se recogen en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v2 (esta ficha, GGUF) | 628 M | utterances completas; división a partir de 6 min 40 s | inglés | CC-BY-4.0 | GGUF / NeMo-Speech.cpp |
| Parakeet TDT 0.6B v3 (NVIDIA) | no disponible | misma arquitectura FastConformer-TDT | multilingüe | no disponible | `.nemo` / NeMo-Speech.cpp (soporte oficial) |
| Parakeet TDT 0.6B v2 original (NVIDIA) | 628 M | utterances completas | inglés | CC-BY-4.0 | `.nemo` / NeMo (PyTorch) |

La comparación con alternativas de otros fabricantes (Whisper, etc.) no está disponible en la información proporcionada, por lo que no se incluye.

## Limitaciones y advertencias

- Solo inglés: no admite otros idiomas.
- Solo offline: el runtime rechaza solicitudes de streaming para este modelo.
- Riesgo de pérdida de contenido en audio largo: en pruebas del autor, algunas entradas largas compuestas por varios hablantes devolvieron tramos completos ausentes, tanto en NeMo-Speech.cpp como en NeMo de NVIDIA; ninguna entrada de hasta 35 s mostró este problema. Para grabaciones largas, decodificar por trozos cortados en pausas.
- Incompatibilidad de formato: estos GGUF solo cargan en NeMo-Speech.cpp; no funcionan en transcribe.cpp ni en otras herramientas que esperen su formato propio.
- No es una publicación oficial de NVIDIA: el autor no cuenta con el respaldo de NVIDIA y la licencia es la misma CC-BY-4.0 del modelo original, que exige atribución.
- Sesgos y alucinaciones: no se documentan sesgos específicos en la información disponible; como todo modelo ASR, puede producir transcripciones erróneas en audio con ruido, acentos no estándar o solapamiento de hablantes.
- Uso comercial: permitido bajo CC-BY-4.0 siempre que se atribuya a NVIDIA y se indiquen los cambios (conversión a GGUF y cuantización).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/opragmatico/parakeet-tdt-0.6b-v2-nemo-speech-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Revisión del checkpoint fuente: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/tree/ae9ad07059c7c739ffaf932226a8fe64ae2620b0
- NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- NeMo-Speech.cpp v0.3.0: https://github.com/NVIDIA/NeMo-Speech.cpp/tree/v0.3.0
- Goscriber: https://github.com/opragmatico/goscriber
- Evaluación del modelo en Goscriber: https://github.com/opragmatico/goscriber/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Script de conversión: https://github.com/opragmatico/goscriber/blob/main/scripts/convert-models.sh
- Documentación de GGUF en Goscriber: https://github.com/opragmatico/goscriber/blob/main/docs/models/gguf.md
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
