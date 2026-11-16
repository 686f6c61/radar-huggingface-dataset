# Phoonnx/vits-ga_ie-cv-graphemes

## Resumen

vits-ga_ie-cv-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su uso con la librería ONNX homónima. El modelo está especializado en gaélico irlandés (ga-IE) y se entrenó sobre el corpus Common Voice, según se desprende de la nomenclatura `cv` del identificador.

La relevancia de este modelo radica en su carácter de recurso de código abierto para una lengua de bajos recursos como el irlandés, con licencia BSD-3-Clause que permite uso comercial. El empaquetado en formato ONNX a través de phoonnx facilita el despliegue en entornos sin dependencia de PyTorch, lo que reduce la huella de dependencias y simplifica la integración en sistemas de asistencia por voz como OVOS.

El modelo emplea una entrada basada en grafemas (caracteres del texto) en lugar de fonemas, lo que simplifica el front-end de texto al evitar la necesidad de un fonemizador específico del idioma. El repositorio ocupa 0,1 GB y el modelo se distribuye a través de la librería phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ga-IE (gaélico irlandés) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado phoonnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma end-to-end a partir del texto, sin necesidad de un vocoder separado en tiempo de inferencia.

El entrenamiento se realizó sobre el corpus Common Voice para irlandés, según la nomenclatura del modelo (`cv`). No se dispone de información sobre el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales. El front-end de texto utiliza grafemas directamente mediante el `GraphemePhonemizer` de la librería scriptconv, lo que implica que el modelo aprende la correspondencia entre caracteres y audio sin una capa intermedia de fonemas.

## Capacidades

- Síntesis de voz a partir de texto en gaélico irlandés (ga-IE).
- Entrada basada en grafemas: acepta caracteres del texto directamente, sin requerir transcripción fonémica previa.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es un modelo exclusivamente TTS.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento.

## Casos de uso

- Asistentes de voz en irlandés: el modelo puede integrarse en OVOS como motor TTS para responder a los usuarios en gaélico irlandés, aprovechando el plugin `ovos-tts-plugin-phoonnx` y la configuración mediante `mycroft.conf`.
- Lectura de contenido en irlandés: conversión de artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo de contenido en gaélico.
- Sistemas de navegación o anuncios por voz localizados: generación de indicaciones habladas en irlandés para aplicaciones de transporte o turismo.
- Preservación y fomento del idioma: herramientas educativas que permitan a estudiantes escuchar pronunciaciones sintetizadas de texto en irlandés.
- Integración en pipelines de datos: generación de audio sintético en irlandés para aumentar datasets de ASR u otros sistemas de voz de bajos recursos.
- Prototipado rápido de interfaces de voz: al ejecutarse en ONNX y con un repositorio de 0,1 GB, permite desplegar un TTS funcional en irlandés con requisitos de infraestructura mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto apto para CPU.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que funcione en CPU sin GPU dedicada, aunque no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada, pero el tamaño reducido del artefacto (0,1 GB) hace plausible su ejecución en hardware de consumo.
- Opciones de despliegue: phoonnx (Python y OVOS) con runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-ga_ie-cv-graphemes | VITS | ga-IE | BSD-3-Clause | ONNX | Grafemas |
| Otros modelos VITS de la colección Phoonnx | VITS | Según modelo | Según modelo | ONNX | Según modelo |
| Modelos TTS multilingües de Coqui | VITS / otros | Múltiples | Según modelo | PyTorch / ONNX | Fonemas o grafemas |

No se dispone de datos de rendimiento comparativo con alternativas específicas para irlandés en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en gaélico irlandés (ga-IE); no soporta otros idiomas.
- Al ser un modelo TTS, no realiza comprensión semántica ni razonamiento; su única función es convertir texto en audio.
- No se dispone de información sobre sesgos en la voz generada, calidad de pronunciación en palabras poco frecuentes ni robustez ante texto con ruido o caracteres especiales.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero puede producirse una pronunciación incorrecta ante grafemas ambiguos o secuencias no vistas en entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar los términos del corpus Common Voice subyacente, que puede tener condiciones adicionales.
- El modelo se distribuye empaquetado para phoonnx; su uso fuera de esa librería requiere extraer y adaptar los pesos ONNX.
- No se han publicado métricas objetivas (MOS, WER de ASR inverso) en la información disponible, lo que impide evaluar su calidad de forma cuantitativa.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ga_ie-cv-graphemes
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--ga--cv--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
