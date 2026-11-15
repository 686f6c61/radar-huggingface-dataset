# Phoonnx/vits-sl_si-cv

## Resumen

vits-sl_si-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del sistema Coqui TTS (version 0.8.0) y empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo convierte texto en esloveno de Eslovenia (`sl-SI`) en audio, tomando como entrada caracteres del texto y empleando un fonemizador basado en grafemas (`GraphemePhonemizer` de la libreria scriptconv) como front-end de texto.

Se trata de un modelo especializado y de proposito unico: no es un modelo de lenguaje general, sino un sintetizador neuronal de voz entrenado sobre el corpus Common Voice en esloveno, segun indica la propia model card en sus notas de licencia. Su relevancia actual es limitada pero concreta: cubre un idioma de bajos recursos (esloveno) dentro de un ecosistema de codigo abierto (OVOS/phoonnx) orientado a asistentes de voz autoalojados.

El repositorio ocupa aproximadamente 0.1 GB, lo que refleja un modelo compacto y ligero, adecuado para despliegue en entornos con recursos limitados. La licencia BSD-3-Clause permite uso comercial con atribucion. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento mas alla de la referencia a Common Voice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS v0.8.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | esloveno de Eslovenia (`sl-SI`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0.1 GB |
| Entrada de texto | caracteres del texto (GraphemePhonemizer) |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial multiperiodo, junto con un alineamiento monotono aprendido (MAS) que sustituye a los modelos acusticos y vocoders separados de generaciones anteriores. Esta integracion permite generar formas de onda directamente a partir de texto en un unico paso de inferencia, lo que reduce la latencia frente a pipelines en cascada.

El modelo deriva del checkpoint `tts_models--sl--cv--vits` publicado en la release v0.8.0 de Coqui TTS y entrenado sobre el corpus Common Voice en esloveno, segun las notas de licencia incluidas en la model card. Phoonnx lo ha convertido a ONNX y lo ha integrado en su gestor de voces (`TTSModelManager`), con un front-end de texto basado en grafemas gestionado por la libreria scriptconv. No se proporcionan datos sobre numero de tokens, composicion exacta del dataset, horas de audio, ni sobre el uso de RLHF o DPO (tecnicas no aplicables de forma estandar a modelos TTS).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en esloveno (`sl-SI`).
- Generacion directa de forma de onda mediante arquitectura VITS end-to-end.
- Normalizacion y conversion de texto mediante scriptconv (`GraphemePhonemizer`).
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python mediante `phoonnx.model_manager.TTSModelManager`.
- Salida en formato WAV mediante `synthesize_wav`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada al esloveno exclusivamente.

## Casos de uso

- **Asistentes de voz autoalojados en esloveno**: integracion como motor TTS en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `coqui/sl-cv-vits` en `mycroft.conf`; adecuado por su licencia permisiva y su tamano reducido (~0.1 GB).
- **Lectura de contenido en esloveno**: conversion de articulos, notificaciones o mensajes a audio en aplicaciones de accesibilidad para hablantes de `sl-SI`, aprovechando la inferencia ONNX ligera.
- **Sistemas de anuncios automatizados**: generacion de avisos hablados en transporte publico, comercios o edificios inteligentes en Eslovenia, donde se requiere baja latencia y despliegue en hardware modesto.
- **Prototipado de interfaces conversacionales**: uso en fases de desarrollo de asistentes de voz para validar flujos de dialogo en esloveno sin depender de servicios TTS en la nube.
- **Generacion de audio para contenidos educativos**: sintesis de material de aprendizaje de esloveno o de lectura de textos para estudiantes, con salida WAV integrable en plataformas de e-learning.
- **Investigacion en TTS de bajos recursos**: uso como linea base para comparar tecnicas de sintesis en idiomas con pocos datos, dado que Common Voice es un corpus abierto y el modelo es reproducible desde Coqui TTS.
- **Integracion en pipelines de automatizacion**: generacion por lotes de audio a partir de texto mediante scripts Python con `TTSModelManager`, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0.1 GB), el modelo es muy ligero y probablemente ejecutable en CPU.
- GPU recomendadas: no disponible; no se requiere GPU dedicada segun la informacion disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python y OVOS mediante `ovos-tts-plugin-phoonnx`); pesos en formato ONNX, lo que permite usar ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-sl_si-cv (este) | VITS (Coqui) | esloveno (`sl-SI`) | ~0.1 GB | BSD-3-Clause | ONNX |
| Otros modelos VITS de la coleccion Phoonnx | VITS (Coqui) | varios | no disponible | segun modelo | ONNX |
| Modelos TTS de Coqui TTS v0.8.0 | VITS / otros | varios | no disponible | segun modelo | PyTorch / ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La coleccion VITS de Phoonnx agrupa empaquetados equivalentes para distintos idiomas, lo que facilita la sustitucion por otro idioma manteniendo la misma libreria de inferencia.

## Limitaciones y advertencias

- Modelo restringido al esloveno (`sl-SI`); no admite otros idiomas ni cambio de voz mas alla de la incluida (`coqui/sl-cv-vits`).
- Entrada basada en caracteres y fonemizador de grafemas: puede producir pronunciaciones incorrectas en palabras extranjeras, siglas o numeros no normalizados correctamente por scriptconv.
- Posible presencia de sesgos derivados del corpus Common Voice (variedad de acentos, genero y calidad de grabacion de los hablantes contribuyentes).
- Riesgo de artefactos acusticos o prosodia poco natural en textos largos o con puntuacion atipica, propio de modelos VITS entrenados con datos limitados.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones; solo sintetiza audio.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero se recomienda verificar los terminos del corpus Common Voice subyacente para usos concretos.
- Dependencia del ecosistema phoonnx y scriptconv; la version `--pre` de phoonnx indica que la libreria puede estar en fase de desarrollo.
- No se documentan limites de longitud de texto de entrada ni comportamiento en streaming.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-cv
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Checkpoint upstream Coqui TTS v0.8.0: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sl--cv--vits.zip
- Proyecto Coqui TTS: https://github.com/coqui-ai/TTS
