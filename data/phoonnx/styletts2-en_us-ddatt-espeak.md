# Phoonnx/styletts2-en_us-ddatt-espeak

## Resumen

StyleTTS2-en_us-ddatt-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por el autor ddatt en el repositorio DDATT/StyleTTS2-ONNX-Cpp y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está orientado exclusivamente al inglés estadounidense (en-US) y recibe como entrada fonemas en alfabeto IPA generados mediante espeak-ng, no texto plano directamente.

La relevancia de este paquete radica en su formato ONNX, que permite ejecución de inferencia sin dependencias de PyTorch y facilita el despliegue en entornos ligeros, incluidos asistentes de voz integrados en OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. El repositorio ocupa 0,3 GB, lo que sugiere un modelo compacto apto para hardware modesto.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en el mismo sentido que en LLM) ni detalles del dataset de entrenamiento en la información proporcionada. La licencia figura como "other" sin especificarse, y el autor advierte explícitamente que se consulte la release upstream antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,3 GB) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Libreria | phoonnx |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de síntesis de voz neuronal que combina un generador acústico con un decodificador de estilo y un vocoder, diseñado para producir habla con prosodia y estilo expresivos. En este caso concreto, el modelo se distribuye en formato ONNX, lo que permite su ejecución mediante la librería phoonnx sin requerir el framework PyTorch en tiempo de inferencia.

El front-end de texto no consume texto plano: phoonnx delega la normalización y conversión en la librería scriptconv, que utiliza el fonemizador EspeakPhonemizer (del extra scriptconv[espeak]) para transformar el texto en fonemas IPA que alimentan al modelo. El autor advierte que el uso del port espyak de espeak-ng puede producir diferencias fonéticas respecto a espeak-ng nativo y provocar errores de pronunciación en algunas palabras. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de fonemas IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Normalización de texto y conversión a fonemas mediante scriptconv y espeak-ng.
- Ejecución en formato ONNX, sin dependencia de PyTorch en inferencia.
- No se documentan capacidades de clonación de voz, control de estilo explícito, tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente doméstico seleccionando la voz `ddatt/en-styletts2` en la configuración, aprovechando su formato ONNX para ejecución ligera.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV a partir de frases en inglés en scripts o servicios, sin necesidad de infraestructura GPU pesada.
- Lectura de contenido en inglés: conversión de texto a voz para artículos, notificaciones o respuestas de sistemas en inglés estadounidense, con prosodia natural propia de StyleTTS2.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX y ocupar 0,3 GB, es adecuado para dispositivos de borde o contenedores donde instalar PyTorch resulta costoso.
- Integración en pipelines de accesibilidad: generación de audio para lectores de pantalla o interfaces de accesibilidad en inglés, con la salvedad de requerir espeak-ng o el port espyak.
- Prototipado de interfaces conversacionales: pruebas de concepto de asistentes de voz en inglés donde se necesite una cadena TTS funcional y de código abierto empaquetada, antes de migrar a soluciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB, lo que sugiere un modelo compacto ejecutable en CPU.
- GPU recomendadas: no disponible. Por el tamaño del paquete, es plausible su ejecución en CPU y en GPU consumer, pero no se confirma en la documentación.
- Cabe en GPU consumer: no confirmado; el formato ONNX y el tamaño de 0,3 GB apuntan a que sí, pero no hay dato oficial.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.
- Dependencias: espeak-ng instalado en el sistema, o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/styletts2-en_us-ddatt-espeak | StyleTTS2 | en-US | ONNX | other (sin registrar) | Fonemas IPA espeak | Hugging Face, 19 descargas |
| DDATT/StyleTTS2-ONNX-Cpp (upstream) | StyleTTS2 | en-US | ONNX/C++ | no disponible | Fonemas espeak | Hugging Face |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | variable | ONNX | variable | Fonemas espeak | Coleccion Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other" sin licencia registrada: el autor indica explícitamente que se consulte la release upstream antes de cualquier uso, incluido el comercial.
- Solo soporta inglés estadounidense (en-US); no se documentan otros idiomas.
- Requiere fonemas de espeak-ng: sin espeak-ng instalado, el port espyak puede pronunciar mal algunas palabras.
- No se documentan sesgos específicos, pero al ser un modelo de voz entrenado con datos no especificados, pueden existir sesgos de pronunciación o prosodia no declarados.
- Riesgo de alucinación no aplica en el sentido de LLM, pero pueden producirse artefactos acústicos o pronunciaciones incorrectas en texto no normalizado.
- No hay información sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura lingüística ni la calidad en dominios especializados.
- El modelo tiene muy poca tracción (19 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que su madurez y soporte comunitario son limitados.
- La integración depende de phoonnx y scriptconv, ambas librerías del mismo autor (TigreGotico), lo que introduce dependencia de su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-ddatt-espeak
- Upstream: https://huggingface.co/DDATT/StyleTTS2-ONNX-Cpp
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
