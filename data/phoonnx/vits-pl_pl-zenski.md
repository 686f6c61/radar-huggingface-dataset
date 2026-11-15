# Phoonnx/vits-pl_pl-zenski

## Resumen

`Phoonnx/vits-pl_pl-zenski` es un modelo de síntesis de voz (text-to-speech) en polaco basado en la arquitectura VITS, desarrollado originalmente por WitoldG dentro del proyecto `WitoldG/polish_piper_models` y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en polaco (`pl-PL`) en audio, tomando como entrada fonemas espeak en alfabeto IPA.

Se trata de un modelo ligero (repositorio de 0,1 GB en formato ONNX) orientado a inferencia local y despliegue en entornos con recursos limitados, como asistentes de voz embebidos o sistemas domésticos. Su integración principal es a través de la librería `phoonnx` (Python) y del plugin `ovos-tts-plugin-phoonnx` para el ecosistema OVOS/Mycroft.

Su relevancia radica en que amplía la cobertura de voces polacas disponibles en formato ONNX para pipelines de TTS reproducibles, con licencia MIT y sin dependencia de servicios en la nube. No obstante, la información pública disponible es muy escasa: no se detallan datos de entrenamiento, número de parámetros ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | polaco (`pl-PL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de síntesis neuronal extremo a extremo que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS produce audio de forma directa desde fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

No se dispone de información sobre el corpus de entrenamiento, el número de horas de audio, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). El modelo procede del repositorio `WitoldG/polish_piper_models`, pero la model card no detalla el proceso de entrenamiento original. La entrada se realiza mediante fonemización con espeak-ng (o su port espyak), lo que implica que la calidad de la síntesis depende de la correcta fonemización previa del texto polaco.

## Capacidades

- Síntesis de voz (text-to-speech) en polaco (`pl-PL`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante espeak-ng o espyak antes de la inferencia.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en el ecosistema OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo de voz.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en polaco: el modelo puede integrarse en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico sin conexión a internet, gracias a su formato ONNX ligero (0,1 GB).
- Lectura de textos en aplicaciones de accesibilidad: conversión de documentos o notificaciones en polaco a audio para usuarios con discapacidad visual, ejecutándose en local con phoonnx.
- Síntesis de voz en dispositivos embebidos: su reducido tamaño permite desplegarlo en Raspberry Pi u otros dispositivos de bajos recursos con la librería phoonnx.
- Generación de audio para contenido educativo: creación de narraciones en polaco para cursos, audiolibros o materiales formativos, con procesamiento por lotes mediante la API de Python.
- Integración en pipelines de CI/CD para pruebas de audio: generación automatizada de muestras de voz en polaco para validar sistemas de reconocimiento de voz o de diálogo.
- Síntesis en el navegador: uso de `phoonnx.js` para generar voz polaca en aplicaciones web sin backend, con la demo disponible en `tigregotico.pt/demo`.
- Prototipado de interfaces conversacionales: pruebas rápidas de flujos de voz en polaco antes de invertir en modelos comerciales, dado que la licencia MIT permite uso comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB en ONNX), es previsible que quepa en GPUs con 2 GB o menos, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para despliegues de bajos recursos, CPU es viable.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU, dado el tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño |
|---|---|---|---|---|---|
| `Phoonnx/vits-pl_pl-zenski` | VITS | pl-PL | ONNX | MIT | 0,1 GB |
| `WitoldG/polish_piper_models` (upstream) | VITS (Piper) | pl-PL | Piper/ONNX | no disponible | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | ONNX | MIT (según colección) | variable |

La información disponible no permite comparar rendimiento (MOS, latencia, WER) con alternativas. El modelo upstream de WitoldG es la referencia directa, pero no se detallan sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta polaco (`pl-PL`); no es multilingüe.
- La calidad de la síntesis depende de la fonemización con espeak-ng; el uso de espyak puede producir errores de pronunciación en algunas palabras, según advierte la model card.
- No se han publicado métricas de calidad (MOS, inteligibilidad) ni datos de entrenamiento, lo que dificulta evaluar su robustez en producción.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber artefactos acústicos o pronunciaciones incorrectas en textos con nombres propios, siglas o números.
- Licencia MIT: permite uso comercial, pero la model card remite a los términos del release upstream; conviene verificar la licencia del modelo original de WitoldG.
- Dependencia de espeak-ng instalado en el sistema o del extra `phoonnx[espeak]`; sin él, el modelo no puede fonemizar la entrada.
- Ecosistema limitado: la integración principal es phoonnx/OVOS; no hay soporte documentado para frameworks de TTS más extendidos.
- Sin datos de sesgos: no se dispone de información sobre sesgos de género, edad o acento en la voz generada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-zenski
- Upstream (WitoldG): https://huggingface.co/WitoldG/polish_piper_models
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv (normalización y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
