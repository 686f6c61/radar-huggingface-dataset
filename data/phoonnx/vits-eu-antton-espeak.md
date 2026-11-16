# Phoonnx/vits-eu-antton-espeak

## Resumen

`vits-eu-antton-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el autor itzune bajo el identificador `itzune/antton-tts` y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en euskera (`eu`) y convierte fonemas del alfabeto IPA generados por espeak-ng en audio inteligible.

La relevancia de este modelo radica en su carácter especializado: no es un TTS multilingüe de propósito general, sino una voz concreta para una lengua minoritaria, empaquetada en un formato (ONNX) que permite ejecución ligera y despliegue en entornos con recursos limitados, incluidos asistentes de voz domésticos del ecosistema OVOS. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo compacto orientado a inferencia en CPU.

El modelo no incluye parámetros de lenguaje natural ni razonamiento: es exclusivamente un sintetizador acústico. Su entrada es texto en euskera que se normaliza y convierte a fonemas mediante `scriptconv`, y su salida es una forma de onda de audio. La licencia declarada por el autor original es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | euskera (`eu`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en flujos normales y un discriminador adversarial multiperiodo. El entrenamiento se realiza de forma conjunta con pérdidas adversariales, de reconstrucción espectral y de alineamiento monotónico, lo que permite generar audio de forma directa sin un modelo acústico separado y un vocoder en cascada.

En este caso concreto, el modelo es un empaquetado para ONNX del checkpoint `itzune/antton-tts`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus en euskera, ni si se aplicaron técnicas de ajuste fino adicionales. El front-end textual no forma parte del modelo: la conversión de texto a fonemas se delega en `scriptconv` mediante el fonemizador `EspeakPhonemizer`, que requiere espeak-ng instalado en el sistema (o el puerto espyak incluido en el extra `phoonnx[espeak]`).

## Capacidades

- Síntesis de voz a partir de texto en euskera, con salida en formato WAV.
- Conversión texto-a-fonema mediante espeak-ng en alfabeto IPA antes de la síntesis.
- Ejecución en CPU mediante ONNX Runtime a través de la librería phoonnx.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (según la documentación del proyecto).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada ni modo thinking.
- Monolingüe: únicamente euskera.

## Casos de uso

- Asistentes de voz domésticos en euskera: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de respuesta hablada a un asistente local en esta lengua, aprovechando que el modelo es ligero y se ejecuta en CPU.
- Lectura de contenidos en euskera: conversión de artículos, noticias o documentación a audio para consumo pasivo, dado el soporte nativo de la lengua y la baja huella de recursos del modelo ONNX.
- Accesibilidad para personas con discapacidad visual: síntesis de textos en euskera en aplicaciones de lectura de pantalla o dispositivos de bajo consumo, donde un modelo de ~0,1 GB es viable frente a alternativas de mayor tamaño.
- Señalización y anuncios automatizados: generación de avisos pregrabados o dinámicos en euskera para transporte público, comercios o espacios públicos, con la ventaja de que la síntesis puede ejecutarse localmente sin depender de servicios en la nube.
- Prototipado de aplicaciones de voz en euskera: uso del modelo como base para experimentar con pipelines TTS en esta lengua dentro de proyectos de investigación o desarrollo, gracias a la licencia Apache 2.0 y a la disponibilidad del código de inferencia.
- Sistemas embebidos y edge computing: despliegue en dispositivos con recursos limitados (Raspberry Pi, mini-PC) al tratarse de un modelo ONNX compacto que no requiere GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; para GPU, al tratarse de un modelo de ~0,1 GB, la huella de memoria es mínima (inferior a 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 3060 o superior) podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño reducido del repositorio.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que la colección VITS de Phoonnx agrupa otras voces empaquetadas con la misma arquitectura y librería, pero no se detallan sus especificaciones ni resultados.

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| vits-eu-antton-espeak | VITS | eu | Apache 2.0 | ONNX | no aplica |
| Otros modelos de la colección VITS de Phoonnx | VITS | no disponible | no disponible | ONNX | no aplica |

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza euskera; no admite otros idiomas.
- Dependencia de espeak-ng: la calidad de la fonemización depende de la instalación de espeak-ng; el uso del puerto espyak puede producir errores de pronunciación en algunas palabras, según advierte el autor.
- Sin datos de entrenamiento publicados: no se puede evaluar la cobertura del corpus, los sesgos de pronunciación ni la calidad en registros específicos (formal, técnico, nombres propios).
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías atípicas, inherente a los sistemas TTS basados en fonemas.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta interacción conversacional.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del checkpoint original `itzune/antton-tts` y los términos de espeak-ng, que se distribuye bajo GPL.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (MOS, inteligibilidad) disponibles en la información proporcionada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-eu-antton-espeak)
- [Checkpoint original itzune/antton-tts](https://huggingface.co/itzune/antton-tts)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
