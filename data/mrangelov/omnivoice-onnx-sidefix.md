# mrangelov/OmniVoice-onnx-sidefix

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por el equipo de k2-fsa, diseñado para ofrecer clonación de voz zero-shot y diseño de voz en más de 600 idiomas. Su arquitectura se basa en un modelo de lenguaje de difusión (diffusion language model), una combinación poco habitual que permite generar audio de alta calidad con una velocidad de inferencia superior a la de los modelos autoregresivos tradicionales. El repositorio `mrangelov/OmniVoice-onnx-sidefix` es una conversión a formato ONNX del modelo original, con una corrección lateral ("sidefix") que probablemente ajusta algún detalle de la exportación para mejorar la compatibilidad o el rendimiento en entornos de inferencia con ONNX Runtime.

La relevancia actual de este modelo radica en su cobertura lingüística sin precedentes (más de 600 idiomas) y en su capacidad para clonar voces a partir de una muestra corta sin necesidad de entrenamiento adicional, lo que lo convierte en una opción atractiva para aplicaciones multilingües de generación de voz. La versión ONNX facilita su despliegue en producción, ya que permite usar runtime optimizado en CPU y GPU sin depender del stack completo de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (modelo de lenguaje de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Más de 600 (según documentación del proyecto OmniVoice) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo original OmniVoice, descrito en el repositorio de k2-fsa, emplea una arquitectura de modelo de lenguaje de difusión. A diferencia de los TTS autoregresivos convencionales, este enfoque genera el audio mediante un proceso de difusión que refina iterativamente una señal de ruido hasta obtener la forma de onda final. Esta arquitectura permite una generación más rápida y estable, especialmente en tareas de clonación de voz zero-shot, donde el modelo debe adaptarse a una voz de referencia sin entrenamiento previo.

El entrenamiento se realizó sobre un corpus masivo multilingüe que cubre más de 600 idiomas, aunque los detalles exactos del dataset (número de tokens, composición, proporción de hablantes) no se han publicado en la información disponible. El modelo incluye un tokenizador de audio separado (`audio_tokenizer/`) que convierte las señales de audio en tokens discretos, y el proceso de generación combina la entrada de texto con una muestra de voz de referencia para producir la salida. La conversión a ONNX en este repositorio mantiene la misma arquitectura, pero adapta los pesos al formato ONNX para su uso con ONNX Runtime.

## Capacidades

- Síntesis de voz multilingüe: genera habla natural en más de 600 idiomas, incluyendo variedades regionales y lenguas de baja representación.
- Clonación de voz zero-shot: a partir de una muestra de audio corta (unos pocos segundos), el modelo replica la voz del hablante sin necesidad de fine-tuning.
- Diseño de voz: permite crear voces sintéticas a partir de una descripción textual de las características vocales (tono, timbre, estilo), sin necesidad de una muestra de audio.
- Generación de audio de alta calidad: la arquitectura de difusión produce formas de onda con buena fidelidad y menos artefactos que los modelos autoregresivos.
- Inferencia rápida: el proceso de difusión es más eficiente que la decodificación autoregresiva, lo que reduce la latencia en aplicaciones en tiempo real.
- Formato ONNX: la versión de este repositorio es compatible con ONNX Runtime, lo que permite desplegar el modelo en entornos de producción con optimizaciones específicas de hardware.

## Casos de uso

- Atención al cliente multilingüe: un sistema de IVR puede usar OmniVoice para generar respuestas de voz en el idioma del usuario, con una voz clonada de un agente humano para mantener consistencia de marca. La cobertura de 600+ idiomas elimina la necesidad de modelos separados por región.
- Audiolibros y narración automatizada: productoras de contenido pueden clonar la voz de un narrador profesional y generar audiolibros en múltiples idiomas a partir del mismo texto, reduciendo costes de grabación. La clonación zero-shot permite mantener la misma voz en todas las versiones.
- Asistentes virtuales personalizados: un asistente de voz puede adoptar la voz del propio usuario (a partir de una muestra de 5 segundos) para dar respuestas habladas, mejorando la experiencia de uso en aplicaciones de salud o productividad.
- Traducción audiovisual (doblaje): en la localización de vídeos, OmniVoice puede generar pistas de voz en el idioma de destino clonando la voz del actor original, preservando la interpretación y el tono emocional. La generación por difusión evita el efecto robótico típico de otros TTS.
- Generación de contenido educativo: plataformas de e-learning pueden crear lecciones de voz en decenas de idiomas a partir de un único texto, usando una voz sintética consistente o clonando la del profesor. El modelo soporta voz diseñada por descripción, lo que permite crear personajes pedagógicos.
- Accesibilidad y lectura asistida: herramientas para personas con discapacidad visual pueden leer en voz alta cualquier texto en el idioma nativo del usuario, con una voz natural y clonable para dar familiaridad. La versión ONNX facilita su integración en aplicaciones de escritorio y móviles con bajo consumo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de calidad de voz (MOS, SIM, etc.) ni comparativas con otros modelos TTS. La documentación del proyecto OmniVoice menciona "alta calidad" y "velocidad superior", pero no proporciona números concretos.

## Requisitos de hardware

- Los requisitos exactos de VRAM y GPU no están disponibles para esta conversión ONNX. El modelo original, al ser un modelo de difusión, requiere una GPU con al menos 8 GB de VRAM para inferencia en tiempo real, aunque la versión ONNX puede ejecutarse en CPU con mayor latencia.
- Para uso en producción, se recomienda una GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior) para aprovechar la aceleración de ONNX Runtime con TensorRT.
- En CPU, el modelo puede ejecutarse con ONNX Runtime, pero la generación de audio será significativamente más lenta (varios segundos por frase).
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), puede integrarse en servidores de inferencia como Triton Inference Server, o en aplicaciones embebidas mediante ONNX Runtime Mobile.
- No se dispone de datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación zero-shot | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice (original) | 600+ | Sí | Diffusion LM | Apache 2.0 | PyTorch / ONNX |
| XTTS v2 (Coqui) | 17 | Sí | Autoregresivo + vocoder | CPML (no comercial) | PyTorch |
| Bark (Suno) | 13 | No (solo voces predefinidas) | Autoregresivo + GAN | MIT | PyTorch |
| VITS (monolingüe) | 1-2 | No | VAE + Flow | MIT | PyTorch |

La comparativa se basa en las características generales de cada modelo, no en benchmarks medidos. OmniVoice destaca por su cobertura lingüística y su licencia permisiva, mientras que XTTS v2 ofrece clonación pero con restricciones de uso comercial. Bark no permite clonación de voz arbitraria.

## Limitaciones y advertencias

- La información de este repositorio concreto es mínima: no se especifican parámetros, contexto, ni detalles de la conversión ONNX. El "sidefix" no está documentado, por lo que se desconoce qué corrección aplica.
- El modelo original puede presentar alucinaciones o errores de pronunciación en idiomas de baja representación, especialmente en variedades dialectales poco comunes.
- La clonación de voz plantea riesgos de suplantación de identidad y uso malintencionado. Aunque la licencia Apache 2.0 permite uso comercial, el usuario es responsable de cumplir las leyes de protección de datos y consentimiento.
- No se han publicado evaluaciones de sesgo o robustez para este modelo. Es posible que el rendimiento varíe según el género, acento o calidad de la muestra de voz de referencia.
- La versión ONNX puede tener ligeras diferencias numéricas respecto al modelo PyTorch original, lo que podría afectar a la calidad del audio en casos extremos.
- Para producción, se recomienda validar la calidad de salida en los idiomas objetivo antes de desplegar, ya que no hay benchmarks públicos que respalden el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrangelov/OmniVoice-onnx-sidefix
- Repositorio original de OmniVoice (k2-fsa): https://github.com/k2-fsa/OmniVoice
- Conversión ONNX de referencia (Prince-1): https://huggingface.co/Prince-1/OmniVoice-Onnx
- Conversión ONNX alternativa (gluschenko): https://huggingface.co/gluschenko/omnivoice-onnx
- Guía de conversión ONNX (GitHub): https://github.com/AFun9/Omnivoice-onnx/blob/master/README_EN.md
- Sitio web del proyecto: https://omnivoice.app/
