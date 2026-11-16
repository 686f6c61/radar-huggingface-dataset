# Phoonnx/vits-nl_nl-anna-espeak

## Resumen

vits-nl_nl-anna-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rikels dentro del proyecto piper-dutch y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en neerlandés (nl-NL) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz neerlandesa ligera (repo de 0,1 GB) ejecutable en ONNX, lo que facilita el despliegue en entornos con recursos limitados y su integración en asistentes de voz como OVOS.

El modelo no es un LLM ni un sistema generativo de texto: es un sintetizador acústico VITS de extremo a extremo que produce waveform directamente a partir de fonemas. Al estar empaquetado para phoonnx, se integra con un pipeline de normalización de texto (scriptconv) y con el ecosistema de plugins de OVOS, lo que lo hace útil para aplicaciones de voz en neerlandés dentro de asistentes domésticos y sistemas embebidos.

La licencia MIT y el formato ONNX lo posicionan como una opción práctica para producción con requisitos bajos de cómputo, aunque su alcance queda limitado a un único idioma y a una única voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | neerlandés (nl-NL) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder acústico y un vocoder en un único modelo entrenado de forma adversarial con pérdidas de reconstrucción y alineamiento monotónico. El modelo toma fonemas IPA generados por espeak-ng como entrada y produce audio directamente, sin necesidad de un vocoder separado.

Según la model card, el modelo procede de Rikels/piper-dutch y ha sido empaquetado para phoonnx. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o fine-tuning adicionales. Tampoco se especifican innovaciones técnicas más allá de las propias de VITS.

## Capacidades

- Síntesis de voz en neerlandés (nl-NL) a partir de texto.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalización de texto previa mediante scriptconv.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con el ecosistema OVOS a través del plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz domésticos en neerlandés: integrado en OVOS mediante el plugin ovos-tts-plugin-phoonnx, el modelo puede sintetizar respuestas habladas en un asistente local sin dependencia de servicios en la nube.
- Lectura de notificaciones y alertas: al ser un modelo ONNX ligero (0,1 GB), puede ejecutarse en dispositivos de bajos recursos para leer mensajes del sistema en neerlandés.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en neerlandés en aplicaciones de lectura de pantalla o lectores de documentos.
- Síntesis de voz en aplicaciones web: mediante phoonnx.js y el demo en tigregotico.pt, se puede integrar TTS neerlandés directamente en el navegador sin backend.
- Prototipado de interfaces conversacionales: al tener licencia MIT y formato ONNX, sirve para validar flujos de voz en neerlandés antes de invertir en soluciones comerciales.
- Generación de audiolibros o contenido educativo en neerlandés: síntesis por lotes de texto a WAV para materiales de aprendizaje con una única voz consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo (0,1 GB) sugiere un modelo muy ligero que puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, por el tamaño reducido del modelo (0,1 GB), aunque no se detallan requisitos exactos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin ovos-tts-plugin-phoonnx (OVOS). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| vits-nl_nl-anna-espeak | VITS | nl-NL | MIT | ONNX | 0,1 GB |
| Rikels/piper-dutch (upstream) | VITS | nl-NL | no disponible en la información | no disponible | no disponible |
| Otros modelos de la colección VITS de Phoonnx | VITS | varios | MIT (según colección) | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta neerlandés (nl-NL); no es multilingüe.
- Voz única: únicamente la voz "anna"; no hay variedad de hablantes.
- Dependencia de espeak-ng: los fonemas deben generarse con espeak-ng; la alternativa espyak puede producir errores de pronunciación en algunas palabras.
- Calidad dependiente del front-end: la normalización de texto la realiza scriptconv, y errores en esa etapa afectan a la síntesis.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, inteligibilidad) en la información disponible.
- Licencia MIT: permite uso comercial, pero la model card remite a los términos del release upstream, que no se detallan.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas ante texto no normalizado o fonemas mal generados.
- Sesgos: no se documentan sesgos conocidos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-anna-espeak
- Upstream: https://huggingface.co/Rikels/piper-dutch
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo: https://tigregotico.pt/demo
