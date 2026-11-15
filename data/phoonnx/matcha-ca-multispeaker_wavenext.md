# Phoonnx/matcha-ca-multispeaker_wavenext

## Resumen

`matcha-ca-multispeaker_wavenext` es un modelo de síntesis de voz (text-to-speech) en catalán, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original, `projecte-aina/matxa-tts-cat-multispeaker`, fue desarrollado por Projecte AINA y aquí se distribuye como un artefacto listo para inferencia, con pesos fusionados y un vocoder Wavenext integrado. Su propósito es ofrecer una voz catalana multispeaker ejecutable en entornos Python y en el asistente de voz OpenVoiceOS (OVOS).

La relevancia de este paquete radica en su formato: al estar exportado a ONNX y empaquetado dentro de phoonnx, elimina la dependencia de frameworks de entrenamiento pesados y facilita el despliegue en producción, incluidos dispositivos con recursos limitados. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia eficiente más que a un gran modelo generativo.

Se trata de un modelo especializado exclusivamente en catalán (`ca`), con entrada de texto en forma de fonemas espeak en alfabeto IPA. No es un modelo de lenguaje general, sino un componente de un pipeline TTS: recibe fonemas y produce audio. La información pública disponible es escasa y se limita a la model card del autor del empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acústico) con vocoder Wavenext fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase en fonemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes) |
| Idiomas soportados | catalán (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de síntesis de voz basada en modelos de difusión condicionados por texto (flow matching), que genera espectrogramas mel de forma no autorregresiva. En este paquete, el modelo acústico se combina con un vocoder Wavenext fusionado que convierte la representación mel en forma de onda. La entrada no es texto directo, sino fonemas generados por espeak-ng en alfabeto IPA, lo que implica que el front-end fonemizador forma parte crítica del pipeline.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El modelo original es multispeaker, es decir, soporta varias voces, pero la model card no detalla cuántas ni sus identificadores. El empaquetado para phoonnx incluye la fusión del vocoder y la exportación a ONNX, lo que constituye la principal aportación técnica de este artefacto frente al modelo upstream.

## Capacidades

- Síntesis de voz en catalán a partir de texto, mediante fonemización previa con espeak-ng.
- Soporte multispeaker (varias voces) heredado del modelo original `matxa-tts-cat-multispeaker`.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración con el asistente de voz OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python puro con dependencia de ONNX Runtime (implícita en phoonnx).
- No soporta tool calling, agentes, razonamiento multi-step ni visión: es un modelo estrictamente TTS.
- Capacidad multilingüe limitada al catalán; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz en catalán: integración en OpenVoiceOS mediante el plugin de phoonnx, configurando la voz `OpenVoiceOS/matxa-cat-multispeaker-wavenext` en `mycroft.conf` para respuestas habladas en catalán.
- Lectura de contenido web o documentos: conversión de artículos, noticias o textos administrativos en catalán a audio para accesibilidad o consumo pasivo.
- Audiolibros y narración automatizada: generación de narraciones en catalán con posibilidad de alternar entre las distintas voces del modelo multispeaker según el personaje o sección.
- Sistemas de anuncios y megafonía: síntesis dinámica de avisos en catalán en transporte público, aeropuertos o comercios, con despliegue en dispositivos de bajos recursos gracias al formato ONNX.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces, menús o contenido digital en catalán dentro de aplicaciones de escritorio o móviles.
- Prototipado de productos de voz: evaluación rápida de calidad TTS en catalán sin necesidad de entrenar ni convertir modelos, usando la API de phoonnx en un script de Python.
- Generación de material educativo: creación de audios en catalán para cursos de idiomas, cuentos infantiles o materiales didácticos con múltiples voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime (CUDA o CPU). No se documentan modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en CPU, dado el reducido tamaño del artefacto.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/matcha-ca-multispeaker_wavenext` | Matcha-TTS + Wavenext | Catalán | GPL-3.0 | ONNX | Hugging Face (28 descargas) |
| `projecte-aina/matxa-tts-cat-multispeaker` | Matcha-TTS | Catalán | GPL-3.0 | no disponible en la información | Hugging Face (upstream) |
| Otros modelos Matcha-TTS empaquetados en phoonnx | Matcha-TTS | Diversos | variable | ONNX | Colección Matcha-TTS de Phoonnx |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada. La comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial está permitido, pero cualquier distribución de obras derivadas o integraciones debe cumplir con las obligaciones copyleft de la GPL, lo que puede ser restrictivo para productos propietarios.
- Dependencia de espeak-ng para la fonemización: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Modelo exclusivamente en catalán: no soporta otros idiomas y no se documenta el comportamiento con texto mezclado o extranjerismos.
- Riesgo de errores de pronunciación en nombres propios, siglas, números o palabras fuera del vocabulario cubierto por el fonemizador.
- No se documentan sesgos de género, edad o acento en las voces del modelo multispeaker.
- Información pública muy limitada: no hay datos sobre el dataset de entrenamiento, número de hablantes, calidad objetiva (MOS) ni benchmarks.
- El modelo está empaquetado para una versión preliminar de phoonnx (`pip install --pre phoonnx`), lo que implica posible inestabilidad de la API.
- No apto para clonación de voz ni para síntesis zero-shot de hablantes no incluidos en el modelo.

## Enlaces

- [Hugging Face: Phoonnx/matcha-ca-multispeaker_wavenext](https://huggingface.co/Phoonnx/matcha-ca-multispeaker_wavenext)
- [Modelo upstream: projecte-aina/matxa-tts-cat-multispeaker](https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección Matcha-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad)
