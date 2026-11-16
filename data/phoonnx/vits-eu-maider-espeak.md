# Phoonnx/vits-eu-maider-espeak

## Resumen

vits-eu-maider-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario itzune bajo el nombre maider-tts y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado exclusivamente en euskera (código de idioma `eu`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, lo que lo vincula a la cadena de herramientas de phonemización de scriptconv.

La relevancia de esta ficha es acotada pero específica: cubre un hueco poco poblado dentro del ecosistema open source, el de la síntesis de voz neuronal para lenguas minoritarias como el euskera, con una licencia permisiva (Apache 2.0) y un formato de despliegue ligero (ONNX, repositorio de 0,1 GB). No es un modelo de propósito general ni compite con sistemas TTS multilingües de gran escala, sino que está pensado para integrarse en asistentes de voz y aplicaciones de accesibilidad en euskera.

El modelo se distribuye a través de la librería phoonnx, que actúa como capa de ejecución sobre ONNX Runtime y expone la voz con el identificador `piper_community/itzune/eu-maider-medium`. La información pública disponible no incluye detalles sobre el corpus de entrenamiento, el número de parámetros ni métricas de calidad, por lo que buena parte de las especificaciones técnicas quedan marcadas como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | euskera (`eu`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de dominio temporal y espectral. Este diseño permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo, lo que explica el reducido tamaño del repositorio (0,1 GB) y su idoneidad para despliegues ligeros.

No se dispone de información sobre el corpus de entrenamiento: ni el número de horas de audio, ni la procedencia de las grabaciones, ni si se aplicaron técnicas de aumento de datos o ajuste fino. Tampoco se documenta si el modelo original de itzune empleó algún tipo de alineamiento forzado o entrenamiento multi-hablante. La model card únicamente indica que la entrada textual pasa por el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que normaliza el texto y lo convierte a fonemas IPA antes de alimentar la red.

## Capacidades

- Síntesis de voz monolingüe en euskera a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite un control relativamente preciso de la pronunciación.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python mediante ONNX Runtime y en navegador mediante phoonnx.js.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- No se documentan capacidades de clonación de voz, control de emoción ni ajuste de prosodia más allá de lo que permita la arquitectura VITS base.

## Casos de uso

- Asistentes de voz en euskera: el modelo puede integrarse en OVOS o en cualquier aplicación Python que use phoonnx para leer respuestas de un asistente conversacional, gracias a su licencia Apache 2.0 y a su reducido tamaño (0,1 GB) que permite ejecución en dispositivos de gama baja.
- Accesibilidad para personas con discapacidad visual: lectura de textos en euskera en aplicaciones de escritorio o móvil, con la ventaja de que el modelo puede ejecutarse localmente sin depender de servicios en la nube.
- Sistemas de navegación y avisos por voz: generación de instrucciones habladas en euskera en entornos embebidos, donde el formato ONNX y la ausencia de dependencias pesadas facilitan el despliegue en hardware limitado.
- Locución automatizada de contenidos: conversión de artículos, noticias o documentación técnica en euskera a audio para podcasts o boletines, usando la API de phoonnx para procesar lotes de texto.
- Preservación y promoción lingüística: generación de material audio para aprendizaje del euskera, con pronunciación controlada mediante fonemas IPA introducidos manualmente.
- Pruebas de integración en pipelines de CI/CD: validación de la cadena texto-fonema-audio en proyectos que desarrollen aplicaciones de voz en euskera, usando el modelo como referencia estable y de licencia permisiva.
- Prototipado de interfaces de voz en navegador: mediante phoonnx.js, se puede desplegar la voz en una demo web sin backend, como la disponible en tigregotico.pt/demo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, MCD, WER de transcripción) ni comparaciones objetivas con otros sistemas TTS en euskera.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB), el modelo es compatible con GPUs de gama baja e incluso con ejecución en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (GTX 1050, RTX 2060, RTX 4090, A100, H100); el modelo no requiere VRAM significativa.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y dispositivos ARM.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), ovos-tts-plugin-phoonnx (OVOS), ONNX Runtime directamente.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del texto de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| vits-eu-maider-espeak | VITS | eu | Apache 2.0 | ONNX | 0,1 GB |
| itzune/maider-tts (upstream) | VITS | eu | Apache 2.0 | no disponible | no disponible |
| Otras voces VITS de phoonnx (colección) | VITS | varios | según modelo | ONNX | variable |

No se dispone de información sobre modelos TTS comparables específicos para euskera con los que establecer una comparación cuantitativa de calidad, latencia o cobertura.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza euskera; no admite texto en castellano ni en otros idiomas sin fonemización manual.
- Dependencia de espeak-ng: la calidad de pronunciación depende de la versión de espeak-ng instalada; la model card advierte que el port espyak puede producir fonemas distintos y generar errores en algunas palabras.
- Sin datos de entrenamiento publicados: no es posible evaluar la cobertura dialectal, el sesgo de hablante ni la calidad en dominios específicos.
- Riesgo de pronunciación incorrecta en neologismos, nombres propios y siglas, al depender de reglas de fonemización y no de un lexicón específico.
- Sin métricas de calidad publicadas: no hay evidencia objetiva de MOS ni comparaciones con otros sistemas, lo que dificulta la validación en producción.
- Licencia Apache 2.0 permisiva para uso comercial, pero la model card remite a la licencia declarada por el autor upstream (itzune/maider-tts); conviene verificar la cadena de licencias antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento activo.
- No apto para tareas de razonamiento, generación de texto ni procesamiento multimodal.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-eu-maider-espeak)
- [Modelo upstream itzune/maider-tts](https://huggingface.co/itzune/maider-tts)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
