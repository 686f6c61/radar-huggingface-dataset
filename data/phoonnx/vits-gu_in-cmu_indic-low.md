# Phoonnx/vits-gu_in-cmu_indic-low

## Resumen

vits-gu_in-cmu_indic_low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic3 y empaquetado por Phoonnx en formato ONNX para su biblioteca de inferencia TTS homónima. El modelo genera audio a partir de texto en guyaratí (gu-IN), una de las lenguas oficiales de la India, y su función principal es convertir texto en habla natural para aplicaciones de asistencia por voz, lectores de pantalla y sistemas embebidos.

La relevancia de este modelo radica en su naturaleza ligera y su formato ONNX, que facilita el despliegue en entornos con recursos limitados, así como su integración con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El modelo se distribuye bajo licencia CC-BY-SA-4.0 y su repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia en CPU o GPU de gama baja.

El modelo forma parte de la colección de voces VITS empaquetadas por Phoonnx, un esfuerzo por estandarizar y facilitar el uso de voces de Mimic3 en aplicaciones modernas de Python y en el navegador mediante phoonnx.js. Su entrada de texto se basa en fonemas espeak-ng en alfabeto IPA, lo que requiere la instalación de dicha herramienta para un funcionamiento correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, probablemente float32 o float16) |
| Idiomas soportados | guyaratí (gu-IN) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. El modelo genera formas de onda de audio directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia y reduce la latencia. La variante "low" del nombre sugiere una configuración de menor calidad o menor tamaño computacional, orientada a entornos con recursos restringidos.

El entrenamiento original fue realizado por Mycroft AI para su conjunto de voces Mimic3, utilizando el corpus CMU Indic, que proporciona datos de habla en varias lenguas indias. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal de este empaquetado es la conversión a ONNX y la integración con la biblioteca phoonnx, que gestiona la fonemización mediante espeak-ng y la normalización de texto mediante scriptconv.

## Capacidades

- Síntesis de voz a partir de texto en guyaratí (gu-IN) con salida en formato WAV.
- Fonemización mediante espeak-ng en alfabeto IPA, con la opción de usar el port espyak si no se dispone de espeak-ng.
- Integración con la biblioteca phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en el navegador mediante phoonnx.js, con demo en vivo disponible.
- Normalización y conversión de texto mediante scriptconv.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).
- Capacidad multilingüe limitada exclusivamente al guyaratí.

## Casos de uso

- Asistentes de voz en guyaratí: el modelo puede integrarse en sistemas de asistencia por voz como OVOS para proporcionar respuestas habladas en guyaratí, aprovechando su formato ONNX ligero y su integración nativa con el plugin de OVOS.
- Lectores de pantalla y accesibilidad: aplicaciones que necesiten convertir texto digital en audio para usuarios con discapacidad visual en guyaratí, con latencia baja gracias a la inferencia ONNX.
- Sistemas embebidos y dispositivos IoT: su tamaño reducido (0,1 GB) y formato ONNX permiten desplegarlo en dispositivos con recursos limitados, como Raspberry Pi o routers, para anuncios verbales o interfaces por voz.
- Automatización de atención al cliente: generación de respuestas de voz pregrabadas o dinámicas en guyaratí para sistemas IVR (respuesta de voz interactiva) en centros de llamadas.
- Aplicaciones educativas: síntesis de voz para la lectura de materiales didácticos en guyaratí, facilitando el aprendizaje de la lengua o el acceso a contenidos para personas con dificultades de lectura.
- Pruebas de integración en pipelines de TTS: desarrollo y validación de sistemas que requieran una voz en guyaratí de bajo coste computacional, usando phoonnx como capa de abstracción para cambiar de voz sin modificar el código.
- Generación de audio para contenido multimedia: creación de narraciones en guyaratí para vídeos, audiolibros o pódcasts, con la posibilidad de ejecutarse en el navegador mediante phoonnx.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM sin necesidad de GPU dedicada.
- GPU recomendadas: no se especifican; por su tamaño, cualquier GPU consumer (GTX 1050, RTX 2060, etc.) o incluso CPU puede ejecutarlo.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos 1 GB de VRAM, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador), y potencialmente ONNX Runtime en otros entornos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-gu_in-cmu_indic_low | VITS | no disponible | no aplica | gu-IN | CC-BY-SA-4.0 | ONNX |
| VITS estándar (p. ej., LJSpeech) | VITS | no disponible | no aplica | en-US | varía | PyTorch/ONNX |
| Mimic3 voces originales | VITS | no disponible | no aplica | varias | varía | PyTorch |
| Coqui TTS (modelos VITS) | VITS | no disponible | no aplica | varias | MPL-2.0 (código) | PyTorch/ONNX |

No se dispone de datos de rendimiento comparativo (MOS, latencia) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo soporta guyaratí (gu-IN); no es multilingüe.
- La calidad de síntesis puede verse afectada si se usa espyak en lugar de espeak-ng, ya que algunos fonemas difieren y pueden provocar pronunciaciones incorrectas.
- No se han publicado métricas objetivas de calidad (MOS) ni benchmarks, por lo que se desconoce su rendimiento real frente a otras voces.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas; es importante revisar las implicaciones para productos propietarios.
- El modelo está empaquetado para phoonnx y depende de su ecosistema (scriptconv, espeak-ng); no es un modelo genérico de TTS que pueda usarse directamente con otras librerías sin conversión.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero puede producir pronunciaciones erróneas o artefactos de audio en palabras fuera del vocabulario o en fonemas no cubiertos.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente TTS.
- La fecha de creación del repositorio (2026-11-14) es futura respecto a la fecha actual, lo que podría indicar un error en los metadatos o una programación de publicación; conviene verificar la disponibilidad real.

## Enlaces

- [Hugging Face: Phoonnx/vits-gu_in-cmu_indic-low](https://huggingface.co/Phoonnx/vits-gu_in-cmu_indic-low)
- [Repositorio original en MycroftAI/mimic3-voices](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/gu_IN/cmu-indic_low)
- [Biblioteca phoonnx](https://github.com/TigreGotico/phoonnx)
- [Biblioteca scriptconv](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
