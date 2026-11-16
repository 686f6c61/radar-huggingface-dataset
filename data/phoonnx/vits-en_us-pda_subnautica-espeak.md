# Phoonnx/vits-en_us-pda_subnautica-espeak

## Resumen

El modelo `vits-en_us-pda_subnautica-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original fue entrenado por Aquaaa123 y publicado como `Aquaaa123/piper-tts-pda-subnautica`, un voice de la comunidad Piper. Phoonnx se limita a reconvertir y empaquetar los pesos en formato ONNX para su ecosistema, manteniendo la licencia MIT del upstream.

Se trata de un modelo acústico de una única voz para inglés estadounidense (`en-US`), con una entrada de texto basada en fonemas IPA generados mediante espeak-ng. Su tamaño de repositorio es de 0,1 GB, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para inferencia en CPU o GPU de gama baja. La relevancia actual reside en su integración con el stack OVOS (Open Voice OS) y con la librería `phoonnx`, que permite desplegarlo tanto en Python como en navegador mediante `phoonnx.js`.

No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento ni métricas de calidad subjetiva (MOS) en la información proporcionada. El modelo está pensado para síntesis de voz offline y de baja latencia, no para clonación de voz ni para síntesis multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior y un decoder acústico basados en normalizing flows, un discriminador adversarial multiperiodo y un decoder HiFi-GAN para generar la forma de onda. La inferencia se realiza de forma directa desde fonemas a audio, sin necesidad de un vocoder separado. En este caso, la entrada de texto se convierte a fonemas IPA mediante `espeak-ng` (a través del fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`), y esos fonemas alimentan el modelo ONNX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el idioma de los datos más allá de `en-US`, ni sobre si se aplicaron técnicas de RLHF o fine-tuning adicional. El modelo es una conversión del checkpoint `Aquaaa123/piper-tts-pda-subnautica` al formato ONNX de phoonnx; no se documenta ninguna innovación técnica adicional más allá del propio pipeline de empaquetado.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (`en-US`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante `espeak-ng` como front-end.
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni visión.
- No soporta otros idiomas distintos de `en-US`.
- No dispone de modo thinking ni de capacidades de audio de entrada (no es un modelo ASR).

## Casos de uso

- Asistente de voz offline en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y se usa para leer respuestas del asistente en inglés estadounidense sin depender de servicios en la nube.
- Lectura de notificaciones y avisos en aplicaciones de escritorio: al ser un modelo ONNX de 0,1 GB, puede invocarse desde Python con `TTSModelManager` para convertir cadenas cortas en WAV de forma local.
- Síntesis en el navegador: mediante `phoonnx.js` y el demo de TigreGotico, se puede generar voz en cliente sin enviar texto a un servidor, útil para aplicaciones web con requisitos de privacidad.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en inglés antes de invertir en voces comerciales, gracias a su licencia MIT y a su bajo coste de despliegue.
- Generación de audiolibros o contenido narrado de dominio público: el modelo acepta texto plano en `en-US` y produce WAV, aunque sin control fino de prosodia documentado.
- Pruebas de integración en pipelines de CI/CD para TTS: al ser un artefacto ONNX pequeño, se puede incluir en tests automatizados de síntesis sin necesidad de GPU.
- Sustitución de voces Piper en proyectos existentes: al derivar de `piper-tts-pda-subnautica`, puede reutilizarse en configuraciones que ya usaban esa voz, cambiando únicamente el runtime a phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, RTX 3060, A100, H100); no requiere GPU de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con ONNX Runtime.
- Despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-en_us-pda_subnautica-espeak (este) | VITS | en-US | MIT | ONNX | 0,1 GB |
| Aquaaa123/piper-tts-pda-subnautica | VITS (Piper) | en-US | MIT (según upstream) | Piper/ONNX | no disponible |
| Otras voces VITS de la colección Phoonnx | VITS | variable | variable | ONNX | variable |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas. La comparación se limita a arquitectura, idioma, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (`en-US`); no soporta cambio de hablante ni multilingüismo.
- La calidad de pronunciación depende de `espeak-ng`; si se usa el port `espyak` en lugar de `espeak-ng`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No se han publicado métricas de calidad (MOS, WER de síntesis) ni benchmarks; la evaluación subjetiva queda a cargo del usuario.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir prosodia incorrecta o artefactos acústicos en textos fuera de dominio.
- Licencia MIT permite uso comercial, pero el autor original del checkpoint es Aquaaa123 y la model card remite a los términos del upstream; conviene verificar la licencia del repositorio `Aquaaa123/piper-tts-pda-subnautica` antes de un despliegue comercial.
- El modelo está empaquetado para la librería `phoonnx` (versión `--pre`), lo que implica dependencia de una librería en estado pre-release.
- No hay información sobre sesgos demográficos, acento o género de la voz más allá de la etiqueta `en-US`.
- El repositorio tiene 24 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-pda_subnautica-espeak
- Upstream: https://huggingface.co/Aquaaa123/piper-tts-pda-subnautica
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
