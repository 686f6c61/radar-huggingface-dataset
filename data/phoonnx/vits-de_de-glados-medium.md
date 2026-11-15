# Phoonnx/vits-de_de-glados-medium

## Resumen

vits-de_de-glados-medium es un modelo de síntesis de voz (text-to-speech) en alemán estándar (de-DE) basado en la arquitectura VITS y empaquetado en formato ONNX para la librería phoonnx. El modelo original fue entrenado por systemofapwne como parte del proyecto piper-de-glados y posteriormente adaptado por Phoonnx para su integración en el ecosistema phoonnx, una librería Python de TTS basada en ONNX. La voz resultante reproduce el timbre característico de GLaDOS, la inteligencia artificial antagonista del videojuego Portal.

El modelo resuelve la necesidad de disponer de una voz sintética en alemán con una personalidad reconocible, en un formato ligero (0,1 GB de repositorio) y ejecutable localmente sin dependencias de servicios en la nube. Al estar empaquetado en ONNX, puede desplegarse tanto en Python como en el navegador mediante phoonnx.js, y se integra con el asistente de voz OVOS a través del plugin ovos-tts-plugin-phoonnx.

La relevancia actual del modelo radica en su licencia MIT, que permite uso comercial sin restricciones, y en su reducido tamaño, que lo hace adecuado para dispositivos con recursos limitados. No obstante, se trata de un modelo de nicho con solo 33 descargas y sin métricas de calidad publicadas, orientado a proyectos que prioricen la estética de la voz sobre la naturalidad absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, además de una alineación monotónica latente que sustituye a los sistemas tradicionales de attention. El modelo original fue entrenado por systemofapwne dentro del proyecto piper-de-glados, del que se distribuye la variante medium para alemán en la ruta de/de_DE/glados/medium. La entrada de texto se procesa mediante fonemas espeak en alfabeto IPA, lo que requiere la instalación de espeak-ng o del extra phoonnx[espeak] que incluye el port espyak.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La adaptación realizada por Phoonnx consiste en el empaquetado del modelo en ONNX y su integración con la librería scriptconv para la normalización de texto y la fonemización, sin que se documenten cambios en los pesos ni reentrenamiento.

## Capacidades

- Síntesis de voz en alemán estándar (de-DE) a partir de texto escrito.
- Generación de audio en formato WAV mediante el método synthesize_wav de la API de phoonnx.
- Fonemización de entrada mediante espeak-ng o espyak, con conversión a alfabeto IPA.
- Integración con el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en navegador a través de phoonnx.js con entrada por espeak o Unicode.
- Voz con timbre característico de GLaDOS (personaje de Portal), orientada a proyectos creativos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx y proporciona respuestas habladas en alemán sin conexión a internet, aprovechando su reducido tamaño de 0,1 GB.
- Proyectos de fan game o mods de Portal: la voz GLaDOS en alemán permite dotar de personalidad a NPCs o sistemas de diálogo en producciones derivadas, con licencia MIT que facilita su distribución.
- Síntesis de voz en aplicaciones de escritorio con Python: mediante la API TTSModelManager y la carga de la voz piper_community/systemofapwne/de-DE_glados_medium, se puede generar audio WAV en tiempo de ejecución sin dependencias de servicios externos.
- Demos web interactivas: phoonnx.js permite ejecutar el modelo en el navegador con entrada Unicode o espeak, útil para prototipos de interfaces conversacionales o experiencias de audio en páginas web.
- Generación de audiolibros o contenido narrado con tono característico: para proyectos creativos que busquen una voz sintética reconocible en alemán, aunque la calidad no está validada por benchmarks.
- Pruebas de integración en pipelines de TTS: desarrolladores que evalúen la librería phoonnx pueden usar esta voz como caso de prueba para validar la fonemización con espeak-ng frente a espyak y detectar diferencias de pronunciación.
- Sistemas embebidos o de bajo consumo: al ser un modelo ONNX de pequeño tamaño, puede desplegarse en dispositivos con recursos limitados para síntesis de voz en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida y probablemente inferior a 1 GB en FP32.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeño, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin ovos-tts-plugin-phoonnx para OVOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-glados-medium | VITS | de-DE | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| systemofapwne/piper-de-glados (upstream) | VITS | de-DE | no aplica | no disponible en la informacion | no disponible | Hugging Face (systemofapwne) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | no aplica | MIT (segun colección) | ONNX | Hugging Face (colección VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con solo 33 descargas y 0 likes; no hay validación comunitaria ni métricas de calidad publicadas.
- La voz reproduce el timbre de GLaDOS, un personaje con derechos de autor de Valve; aunque la licencia del modelo es MIT, el uso comercial de la identidad del personaje puede estar sujeto a restricciones legales no cubiertas por la licencia del modelo.
- La fonemización con espyak puede producir pronunciaciones incorrectas en algunas palabras, según advierte la propia model card; se recomienda espeak-ng para mayor fidelidad.
- Solo soporta alemán (de-DE); no es multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación, aunque al ser un modelo TTS el riesgo principal es la pronunciación errónea o la prosodia antinatural.
- No se especifican requisitos mínimos de hardware ni latencia, lo que dificulta la planificación de producción.
- La fecha de creación (2026-11-14) y actualización (2026-11-15) indican un modelo muy reciente y sin historial de mantenimiento.
- No apto para aplicaciones que requieran tool calling, agentes o razonamiento; es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-medium
- Upstream (systemofapwne/piper-de-glados): https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
