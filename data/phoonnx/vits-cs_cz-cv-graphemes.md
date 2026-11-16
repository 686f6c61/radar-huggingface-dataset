# Phoonnx/vits-cs_cz-cv-graphemes

## Resumen

vits-cs_cz-cv-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en checo (cs-CZ) a audio, tomando caracteres como entrada directa (front end basado en grafemas) y generando formas de onda mediante un generador adversarial condicional.

El modelo resuelve la necesidad de síntesis de voz en checo dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia actual radica en que ofrece una alternativa ligera (0,1 GB de repositorio), con licencia permisiva BSD-3-Clause y ejecutable en formato ONNX, lo que facilita el despliegue en entornos con recursos limitados sin depender del framework original de Coqui TTS.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos y un discriminador adversarial. No se dispone de datos sobre el número de parámetros ni la longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | checo (cs-CZ) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que integra un codificador de texto, un prior variacional condicionado por el texto, un decodificador normalizador de flujos y un decodificador de forma de onda, todo entrenado de forma adversarial junto con un discriminador. Esta arquitectura permite generar audio de forma directa desde texto sin necesidad de un modelo acústico y un vocoder separados.

El modelo fue entrenado por Coqui utilizando el corpus Common Voice en checo, según se desprende de la nomenclatura `cv` en el identificador y de la nota de licencia que referencia "Common Voice". El front end de texto utiliza `GraphemePhonemizer` de la librería scriptconv, lo que implica que el modelo recibe caracteres (grafemas) directamente en lugar de fonemas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a TTS).

## Capacidades

- Síntesis de voz a partir de texto en checo (cs-CZ) con entrada basada en grafemas.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, lo que permite inferencia sin el framework original de Coqui TTS.
- Normalización de texto y conversión de script mediante la librería scriptconv.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en checo: el modelo puede integrarse en OVOS como motor TTS para responder oralmente a consultas de usuario, gracias a su plugin nativo y a su formato ONNX ligero.
- Lectura de textos en aplicaciones de accesibilidad: se puede usar para convertir artículos o notificaciones en audio para usuarios con discapacidad visual en entornos de habla checa.
- Sistemas de navegación o anuncios por voz: adecuado para generar indicaciones habladas en checo en dispositivos embebidos, dado su reducido tamaño (0,1 GB) y su capacidad de ejecución en ONNX Runtime.
- Automatización de atención al cliente por voz: puede sintetizar respuestas en checo en sistemas IVR, aunque limitado a frases y sin capacidades conversacionales propias.
- Generación de audiolibros o contenido narrado en checo: útil para producir locuciones de forma automatizada en pipelines de contenido, con la salvedad de que la calidad depende del corpus Common Voice.
- Pruebas y prototipado de interfaces de voz: permite validar flujos de TTS en checo sin depender de servicios en la nube, al ejecutarse localmente con phoonnx.
- Integración en dispositivos de bajo consumo: su formato ONNX y tamaño reducido lo hacen apto para Raspberry Pi u otros entornos embebidos donde no caben modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU de gama baja.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-cs_cz-cv-graphemes | VITS | cs-CZ | no disponible | BSD-3-Clause | ONNX |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | según modelo | ONNX |
| Coqui TTS cs-cv-vits (upstream) | VITS | cs-CZ | no disponible | BSD-3-Clause | checkpoint Coqui |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta checo (cs-CZ); no es multilingüe.
- La entrada se basa en grafemas, lo que puede producir errores de pronunciación en palabras con ortografía irregular o extranjerismos.
- Al estar entrenado sobre Common Voice, la calidad y cobertura pueden verse limitadas por la variabilidad y el tamaño de dicho corpus.
- Riesgo de alucinación acústica o artefactos en la síntesis ante entradas fuera de dominio o textos muy largos.
- No se dispone de información sobre sesgos de género, edad o acento en las voces generadas.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar las condiciones del corpus Common Voice subyacente.
- El modelo está empaquetado para phoonnx; su uso fuera de ese ecosistema requiere adaptar la carga de pesos ONNX.
- No dispone de control de prosodia, emoción ni estilo más allá de lo que permita la arquitectura VITS base.

## Enlaces

- [Hugging Face: Phoonnx/vits-cs_cz-cv-graphemes](https://huggingface.co/Phoonnx/vits-cs_cz-cv-graphemes)
- [Repositorio upstream Coqui TTS v0.8.0](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--cs--cv--vits.zip)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
