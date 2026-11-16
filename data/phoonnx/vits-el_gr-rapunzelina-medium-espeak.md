# Phoonnx/vits-el_gr-rapunzelina-medium-espeak

## Resumen

`vits-el_gr-rapunzelina-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en griego moderno (el-GR) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

El modelo no es un LLM ni un modelo de lenguaje: es un sistema TTS de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB), pensado para síntesis de voz local y de baja latencia. Su relevancia radica en que permite integrar voces griegas en asistentes de voz autoalojados (OVOS, Home Assistant, etc.) sin depender de servicios en la nube, con licencia MIT y pesos en formato ONNX.

La ficha se basa exclusivamente en la model card y los metadatos disponibles; no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | griego moderno (`el`, `el-GR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado conjuntamente. Genera audio directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El modelo procede del catálogo `rhasspy/piper-voices`, en la ruta `el/el_GR/rapunzelina/medium`, y ha sido reempaquetado por Phoonnx para su ejecución con la librería `phoonnx` (ONNX). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de origen (la etiqueta "rapunzelina" sugiere un hablante concreto, pero no se detalla) ni sobre el uso de técnicas de RLHF o ajuste fino. La entrada de texto se convierte a fonemas mediante `espeak-ng` (o el port `espyak`), y el front-end usa la librería `scriptconv` para normalización y fonemización.

## Capacidades

- Síntesis de voz a partir de texto en griego moderno (`el-GR`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python (librería `phoonnx`) y en navegador mediante `phoonnx.js`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No dispone de modo "thinking", visión ni audio de entrada.

## Casos de uso

- Asistentes de voz autoalojados en griego: integración en OVOS o Home Assistant mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper/el_GR-rapunzelina-medium` en `mycroft.conf` para respuestas habladas locales sin conexión a la nube.
- Lectura de notificaciones y alertas: convertir mensajes de texto en audio para sistemas de megafonía, domótica o aplicaciones de accesibilidad dirigidas a usuarios grecoparlantes.
- Audiolibros y contenido educativo: generación por lotes de narraciones en griego moderno a partir de textos normalizados, con la ventaja de que el modelo es pequeño (~0,1 GB) y puede ejecutarse en CPU.
- Sistemas de atención telefónica o IVR: síntesis de respuestas pregrabadas dinámicamente para menús telefónicos en griego, con baja latencia al ser un modelo VITS ligero.
- Aplicaciones web de accesibilidad: uso de `phoonnx.js` para sintetizar voz en el navegador (demo en tigregotico.pt/demo) sin enviar texto a servidores externos, útil para privacidad.
- Prototipado de interfaces de voz: al tener licencia MIT y pesos ONNX, se puede integrar en pipelines de investigación sobre TTS en griego, comparar con otras voces Piper o evaluar calidad de fonemización con espeak-ng frente a espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo VITS de ~0,1 GB en ONNX, es probable que quepa en CPU y en GPUs de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible su ejecución en CPU, pero no se especifica.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño (~0,1 GB) sugiere que sí, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]` con espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-el_gr-rapunzelina-medium-espeak (este) | VITS | el-GR | ~0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper `el_GR` (p. ej. variantes de rhasspy/piper-voices) | VITS | el-GR | similar | MIT (upstream) | ONNX | Hugging Face (rhasspy) |
| Voces VITS de otros idiomas del catálogo Phoonnx | VITS | varios | ~0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta griego moderno (`el-GR`); no es multilingüe.
- La calidad de pronunciación depende de la fonemización con espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras (advertencia explícita en la model card).
- Requiere instalar `espeak-ng` en el sistema; sin él, la síntesis falla o usa el port espyak con posibles errores.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede producir prosodia incorrecta o artefactos en textos con números, siglas o puntuación atípica si la normalización de `scriptconv` no los resuelve.
- No hay información sobre sesgos del hablante ni sobre la diversidad de acentos o géneros cubiertos.
- Licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices` (declarada MIT en la model card).
- El modelo fue creado/actualizado en 2026 según los metadatos; no hay historial de versiones ni mantenimiento documentado.
- No se han publicado métricas de calidad (MOS, WER) ni benchmarks, por lo que la evaluación en producción debe hacerse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-el_gr-rapunzelina-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/el/el_GR/rapunzelina/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
