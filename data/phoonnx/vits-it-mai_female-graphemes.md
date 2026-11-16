# Phoonnx/vits-it-mai_female-graphemes

## Resumen

`vits-it-mai_female-graphemes` es un modelo de sintesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo procede del catalogo oficial de Coqui TTS (version 0.6.1) y corresponde a la voz femenina `mai_female` entrenada sobre el corpus M-AILABS en italiano. Su relevancia actual reside en que permite ejecutar TTS neuronal de calidad en entornos locales y ligeros sin depender de servicios en la nube, gracias a su empaquetado en ONNX.

El modelo no es un LLM ni un transformer de gran escala: es un sistema TTS end-to-end que convierte texto en forma de grafemas directamente en audio, sin necesidad de un fonemizador externo. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, asistentes de voz embebidos y pipelines de sintesis por lotes.

La licencia Apache 2.0, heredada de la declaracion de Coqui para este modelo, facilita su uso comercial y su integracion en productos propietarios, siempre que se respeten las condiciones de atribucion de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por grafemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. El resultado es un modelo que genera waveforms directamente a partir del texto de entrada, sin necesidad de un vocoder separado ni de alineamientos explicitos, lo que simplifica el pipeline de sintesis y reduce la latencia.

En este caso, el modelo fue entrenado por Coqui sobre el corpus M-AILABS en italiano, segun se desprende de la denominacion `mai_female` y de la nota de licencia incluida en la model card. La entrada de texto se realiza a nivel de grafemas (caracteres), gestionada por el `GraphemePhonemizer` de la libreria `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se dispone de informacion sobre el numero exacto de horas de audio, tokens de entrenamiento, ni sobre el uso de tecnicas de RLHF o DPO, que no aplican a este tipo de arquitectura.

## Capacidades

- Sintesis de voz en italiano a partir de texto plano, con salida en formato WAV.
- Voz femenina unica (`mai_female`), sin soporte de multiples hablantes declarado.
- Entrada basada en grafemas: no requiere un fonemizador especifico para italiano, lo que simplifica el front-end de texto.
- Integracion con la libreria `phoonnx` en Python para sintesis local.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en ONNX, lo que permite inferencia en CPU y en entornos sin GPU.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (no es un LLM).

## Casos de uso

- Asistentes de voz embebidos en italiano: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite que un asistente local responda hablando en italiano sin enviar texto a servicios externos, lo que reduce la latencia y preserva la privacidad.
- Lectura de articulos y notificaciones en aplicaciones moviles o de escritorio: al ser un modelo ONNX de ~0,1 GB, puede empaquetarse dentro de la propia aplicacion y sintetizar texto en tiempo de ejecucion sin conexion a internet.
- Generacion de audiolibros y contenido narrado: la voz femenina estable permite sintetizar parrafos largos por lotes, encadenando fragmentos de audio para producir narraciones completas en italiano.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido web o documentos en italiano en tiempo real en dispositivos de bajo consumo, al no requerir GPU dedicada.
- Pruebas automatizadas de interfaces conversacionales: generacion de respuestas de voz sinteticas para validar flujos de dialogo en italiano dentro de pipelines de CI, con coste marginal nulo por inferencia.
- Prototipado de productos de voz en italiano: al tener licencia Apache 2.0, permite validar rapidamente una experiencia de voz antes de invertir en un modelo propietario o en un entrenamiento a medida.
- Sistemas de anuncios y megafonia en entornos locales: sintesis de mensajes pregrabados o dinamicos en italiano para dispositivos de aviso en comercios, transporte o edificios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo ONNX de ~0,1 GB, la huella de memoria es reducida y cabe holgadamente en GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU moderna con soporte ONNX Runtime (RTX 3060, RTX 4090, A100, H100); el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en GPUs integradas, dado el tamano del repositorio.
- Opciones de despliegue: `phoonnx` (Python) con ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `vits-it-mai_female-graphemes` (este) | VITS | it | no disponible | no aplica | Apache 2.0 | ONNX |
| `tts_models--it--mai_female--vits` (Coqui original) | VITS | it | no disponible | no aplica | Apache 2.0 | PyTorch (checkpoint Coqui) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no disponible | no aplica | segun modelo | ONNX |

La comparativa se limita a variantes del mismo modelo original de Coqui y a otros empaquetados VITS de Phoonnx; no se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sintetiza italiano con la voz `mai_female`; no admite cambio de voz ni otros idiomas.
- Entrada por grafemas: la calidad de la sintesis depende de la normalizacion de `scriptconv`; textos con abreviaturas, numeros o simbolos pueden requerir preprocesado adicional.
- No es un LLM: no soporta razonamiento, tool calling, agentes ni generacion de texto; su unica funcion es la sintesis de voz.
- Sesgos: al estar entrenado sobre el corpus M-AILABS, la voz puede reflejar las caracteristicas demograficas y de registro de dicho corpus; no se documentan analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones incorrectas en palabras fuera de dominio o extranjerismos.
- Licencia: Apache 2.0 permite uso comercial con atribucion; conviene conservar el aviso de licencia y la referencia al modelo original de Coqui.
- Para produccion: no se han publicado metricas objetivas (MOS, latencia, throughput) en la informacion disponible, por lo que se recomienda una evaluacion propia antes de desplegar.
- Fecha de creacion del repositorio: 2026-11-14, segun los metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it-mai_female-graphemes
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_female--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
