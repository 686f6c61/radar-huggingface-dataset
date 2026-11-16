# Phoonnx/vits-ha-openbible-graphemes

## Resumen

`vits-ha-openbible-graphemes` es un modelo de síntesis de voz (text-to-speech) en hausa (`ha`) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo toma como entrada texto a nivel de grafemas (caracteres) y genera audio sintetizado, sin necesidad de un fonemizador específico del idioma: el front-end utiliza `GraphemePhonemizer` de `scriptconv`, que normaliza el texto y lo convierte directamente en la secuencia de entrada del modelo.

El modelo procede del checkpoint `tts_models--hau--openbible--vits` publicado en la release v0.6.2 de Coqui TTS, entrenado presumiblemente sobre el corpus OpenBible en hausa. Phoonnx lo redistribuye como un paquete ONNX autocontenido (tamaño del repositorio: 0,1 GB) que puede cargarse mediante `TTSModelManager` o integrarse en asistentes de voz basados en OVOS a través del plugin `ovos-tts-plugin-phoonnx`.

Su relevancia es acotada pero concreta: cubre la síntesis de voz en hausa, un idioma con recursos TTS limitados, y lo hace con un modelo ligero, de licencia CC-BY-SA 4.0 y ejecutable en CPU mediante ONNX Runtime. No es un modelo de propósito general ni compite con sistemas TTS multilingües grandes; es una pieza de infraestructura para pipelines de voz en hausa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |
| Entrada de texto | grafemas (caracteres) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un decoder de audio (HiFi-GAN) entrenado con pérdidas adversarias y de reconstrucción. El resultado es un modelo que genera waveform directamente a partir del texto, sin vocoder externo separado, lo que explica su tamaño reducido y su idoneidad para inferencia en CPU vía ONNX.

El modelo original fue entrenado por Coqui sobre el corpus OpenBible en hausa, según indica el nombre del checkpoint upstream (`tts_models--hau--openbible--vits`). No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición exacta del dataset, ni si se aplicaron etapas de RLHF/DPO (poco habituales en TTS de esta generación). La innovación destacable del empaquetado es el uso de un front-end de grafemas puro: en lugar de requerir un fonemizador específico para hausa, `scriptconv` normaliza el texto y lo pasa carácter a carácter, lo que simplifica el despliegue pero puede limitar la calidad en palabras con ortografía ambigua.

## Capacidades

- Síntesis de voz (text-to-speech) en hausa a partir de texto escrito.
- Entrada a nivel de grafemas: no requiere fonemización manual ni diccionario de pronunciación.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`), seleccionable por configuración.
- Ejecución sobre ONNX Runtime, lo que permite inferencia en CPU sin GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.
- Monolingüe: únicamente hausa.

## Casos de uso

- **Lectura de contenido en hausa para accesibilidad**: convertir artículos, documentos o textos religiosos (el modelo procede del corpus OpenBible) en audio para usuarios con discapacidad visual o baja alfabetización, aprovechando que el front-end de grafemas acepta texto plano sin preparación lingüística.
- **Asistentes de voz locales en OVOS**: integrar el modelo como módulo TTS en un asistente doméstico mediante `ovos-tts-plugin-phoonnx`, configurando la voz `coqui/hau-openbible-vits` en `mycroft.conf`; el tamaño de 0,1 GB y la ejecución en CPU lo hacen viable en dispositivos de bajos recursos.
- **Sistemas de megafonía y avisos automatizados en hausa**: generar anuncios pregrabados (transporte, salud pública, agricultura) a partir de plantillas de texto, reduciendo la dependencia de locutores humanos para contenidos recurrentes.
- **Preproducción de audiolibros y pódcasts en hausa**: sintetizar borradores de narración para revisión editorial antes de grabar con voz humana, usando la salida WAV del modelo como referencia de ritmo y pronunciación.
- **Investigación en TTS de bajos recursos**: servir como línea base reproducible para experimentos con hausa, comparando el enfoque de grafemas frente a fonemizadores específicos o modelos multilingües más grandes.
- **Aplicaciones educativas de aprendizaje de hausa**: generar ejercicios de escucha y pronunciación con vocabulario y frases controladas, dado que el modelo acepta texto arbitrario a nivel de carácter.
- **Pipelines de datos sintéticos de voz**: producir muestras de audio en hausa para aumentar datasets de ASR u otros sistemas de voz, siempre respetando las obligaciones de la licencia CC-BY-SA 4.0 sobre las obras derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, la huella de memoria es del orden de cientos de MB, apta para CPU.
- GPU recomendadas: no se documentan; el modelo está empaquetado para ONNX y pensado para ejecución en CPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del paquete; no se especifican modelos concretos.
- Opciones de despliegue: `phoonnx` (Python) sobre ONNX Runtime; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-ha-openbible-graphemes` | VITS | hausa | 0,1 GB (repo) | CC-BY-SA 4.0 | ONNX | Hugging Face, `phoonnx`, OVOS |
| `tts_models--hau--openbible--vits` (Coqui upstream) | VITS | hausa | no disponible | CC-BY-SA 4.0 | checkpoint Coqui TTS | Release GitHub de Coqui TTS v0.6.2 |
| Otros modelos VITS de la colección Phoonnx | VITS | varios idiomas | variable | según modelo | ONNX | Hugging Face (colección `Phoonnx/vits`) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Monolingüe**: solo hausa; no procesa otros idiomas ni code-switching.
- **Front-end de grafemas**: al no usar fonemización específica, la pronunciación de palabras con ortografía irregular o préstamos puede ser imprecisa.
- **Riesgo de alucinación acústica**: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o audio ininteligible en entradas fuera de distribución (texto muy largo, símbolos, números).
- **Sin datos de evaluación**: no hay benchmarks publicados de calidad (MOS) ni de robustez, lo que dificulta estimar su fiabilidad en producción.
- **Licencia CC-BY-SA 4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones si el audio sintetizado se incorpora a productos propietarios.
- **Procedencia del corpus**: entrenado sobre OpenBible, lo que puede sesgar el dominio (registro y vocabulario religiosos) y afectar a la naturalidad en otros contextos.
- **Mantenimiento**: el modelo upstream pertenece a una release antigua de Coqui TTS (v0.6.2) y el proyecto Coqui cesó su actividad; el soporte depende de la comunidad (Phoonnx, OVOS).
- **Sin cuantizaciones documentadas**: no se ofrecen variantes optimizadas más allá del paquete ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ha-openbible-graphemes
- Checkpoint upstream (Coqui TTS v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--hau--openbible--vits.zip
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
