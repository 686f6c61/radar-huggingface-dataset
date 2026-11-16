# Phoonnx/vits-sk_sk-lili-medium-espeak

## Resumen

vits-sk_sk-lili-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en eslovaco (sk-SK) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para ejecución en CPU.

La relevancia de este modelo es fundamentalmente práctica: forma parte del ecosistema de voces Piper, ampliamente utilizado en asistentes de voz autoalojados (OVOS, Home Assistant, Rhasspy) por su bajo coste computacional y su licencia permisiva. Esta ficha concreta corresponde a la voz "lili" en variante "medium" para eslovaco, reempaquetada para que pueda cargarse directamente con la librería phoonnx y su plugin de OVOS.

No se trata de un modelo de lenguaje ni de un sistema multimodal: es un sintetizador neuronal específico de una única lengua, sin capacidades de razonamiento, tool calling ni generación de texto. Su valor está en la latencia baja, el tamaño reducido y la integración sencilla en pipelines de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto/fonemas, no ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | eslovaco (sk-SK) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema TTS neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN junto a una pérdida de reconstrucción espectral. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

El modelo original proviene de Rhasspy/piper-voices, en la ruta sk/sk_SK/lili/medium. La variante "medium" corresponde al perfil de calidad intermedio de Piper, pensado para equilibrar fidelidad y velocidad en hardware modesto. La entrada no es texto crudo sino fonemas espeak-ng en IPA, de modo que la normalización y la fonemización se delegan a la librería scriptconv (a través de `scriptconv[espeak]`) o al binario espeak-ng instalado en el sistema. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o ajuste fino preferencial; estos datos no están publicados en la información disponible.

La innovación técnica relevante en este empaquetado es la exportación a ONNX y su integración con phoonnx, que permite ejecutar la voz tanto en Python como en el navegador mediante phoonnx.js, con entrada espeak o unicode.

## Capacidades

- Síntesis de voz a partir de texto en eslovaco (sk-SK), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng o el port espyak incluido en el extra `phoonnx[espeak]`.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada a eslovaco; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS o Rhasspy para dar respuestas habladas en eslovaco, aprovechando el plugin oficial y la configuración declarativa en `mycroft.conf`.
- Domótica por voz: anuncios y confirmaciones en eslovaco desde Home Assistant u otros sistemas que invoquen el pipeline TTS de Piper, con latencia baja al ejecutarse en CPU.
- Lectura de textos y accesibilidad: conversión de documentos o notificaciones a audio para usuarios eslovacos, empaquetando la salida WAV generada por `synthesize_wav`.
- Sistemas de megafonía o avisos automatizados: generación de mensajes pregrabados en eslovaco para transporte, comercio o industria, donde el coste por inferencia es mínimo.
- Prototipado de interfaces conversacionales: uso en entornos de desarrollo para validar flujos de voz en eslovaco antes de invertir en voces comerciales.
- Síntesis en el navegador: demos y aplicaciones web que necesiten TTS en eslovaco sin backend, mediante phoonnx.js.
- Generación de datasets de audio sintético: creación de corpus de voz en eslovaco para experimentos de ASR o evaluación de sistemas de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime.
- GPU recomendadas: no necesarias; cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no se documentan requisitos.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier equipo por su tamaño (~0,1 GB).
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sk_sk-lili-medium-espeak (este) | VITS | eslovaco (sk-SK) | ~0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices sk_SK lili medium (upstream) | VITS | eslovaco (sk-SK) | no disponible | MIT | ONNX (Piper) | Hugging Face (Rhasspy) |
| Otras voces Piper para eslovaco | VITS | eslovaco | variable | MIT | ONNX | Hugging Face (Rhasspy) |
| Voces TTS comerciales en eslovaco | propietaria | eslovaco | no disponible | comercial | API/servicio | Proveedores comerciales |

La comparación directa con modelos de lenguaje no procede: se trata de un sintetizador de voz de una sola lengua, y sus alternativas naturales son otras voces Piper o servicios TTS comerciales. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza eslovaco; no admite otros idiomas.
- Dependencia de espeak-ng: la calidad de la pronunciación depende de la fonemización; el uso del port espyak puede producir errores en algunas palabras, tal como advierte el autor.
- Sin datos de entrenamiento publicados: no es posible evaluar sesgos del corpus ni cobertura de acentos o registros.
- Riesgo de prosodia incorrecta en textos con números, abreviaturas o nombres propios, mitigable solo parcialmente mediante la normalización de scriptconv.
- Licencia MIT permisiva, apta para uso comercial, siempre que se respeten las atribuciones correspondientes al proyecto upstream.
- No apto para tareas de razonamiento, generación de texto ni procesamiento multimodal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy reducido, lo que limita el soporte comunitario y la validación independiente.
- Fecha de creación y actualización registradas en 2026, lo que puede indicar un empaquetado reciente y poca rodadura en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sk_sk-lili-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/sk/sk_SK/lili/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
