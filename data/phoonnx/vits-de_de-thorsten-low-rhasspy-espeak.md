# Phoonnx/vits-de_de-thorsten-low-rhasspy-espeak

## Resumen

`vits-de_de-thorsten-low-rhasspy-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en alemán (`de-DE`) a audio, recibiendo como entrada fonemas en alfabeto IPA generados por espeak-ng en lugar de texto plano. Se trata de la variante "low" de la voz Thorsten, lo que implica un modelo de baja complejidad computacional orientado a entornos con recursos limitados.

El modelo resuelve el problema de la síntesis de voz local y ligera para alemán, sin dependencia de servicios en la nube. Su empaquetado en formato ONNX y su integración con la librería `phoonnx` (y el plugin `ovos-tts-plugin-phoonnx` para OVOS) lo hacen adecuado para asistentes de voz embebidos, sistemas domóticos y aplicaciones de accesibilidad que requieren inferencia en CPU o dispositivos de gama baja. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su orientación a despliegues ligeros.

La relevancia actual del modelo reside en su licencia MIT, su formato ONNX portable y su integración con el ecosistema de código abierto de asistentes de voz (OVOS/Mycroft). No obstante, se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, y su uso está restringido al idioma alemán y a una única voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante "low" del upstream) |
| Idiomas soportados | alemán (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Upstream | `rhasspy/piper-voices/de/de_DE/thorsten/low` |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador variacional (VAE), un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotónico para el ajuste texto-audio. VITS permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante "low" del upstream de Piper corresponde a una configuración de menor tamaño y complejidad, pensada para inferencia rápida en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos TTS). El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, y Phoonnx se limita a empaquetarlo en ONNX para su librería. La entrada no es texto plano, sino fonemas IPA generados por espeak-ng (o por el port espyak, con posibles discrepancias fonéticas), lo que constituye una innovación de diseño orientada a la portabilidad y a la consistencia fonética entre idiomas.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán (`de-DE`) a partir de fonemas IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- Normalización y conversión de texto a fonemas mediante la librería `scriptconv`.
- Inferencia local en ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Asistentes de voz domóticos: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente local responda en alemán sin enviar texto a servicios externos, gracias a su licencia MIT y su formato ONNX ligero.
- Sistemas de accesibilidad: aplicaciones de lectura de pantalla o lectores de textos para personas con discapacidad visual que necesiten una voz alemana local y de baja latencia en hardware modesto.
- Notificaciones por voz en dispositivos embebidos: su tamaño de 0,1 GB y su variante "low" permiten desplegarlo en Raspberry Pi u otros dispositivos de recursos limitados para anuncios y alertas en alemán.
- Síntesis de voz en el navegador: mediante `phoonnx.js`, se puede generar audio en alemán del lado del cliente sin backend, útil para aplicaciones web educativas o de aprendizaje de idiomas.
- Automatización de locuciones para contenidos pregrabados: generación de audios de avisos, tutoriales o menús telefónicos en alemán en pipelines batch, aprovechando la inferencia en CPU.
- Prototipado de interfaces conversacionales: investigadores que necesiten una voz alemana rápida y de código abierto para pruebas de usabilidad o experimentos de interacción voz-texto, sin costes de API.
- Sistemas de megafonía o señalización en entornos industriales: locuciones pregrabadas o dinámicas en alemán donde la latencia y el coste por inferencia son críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la variante "low", se estima un consumo de memoria muy reducido, apto para CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer, e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| `vits-de_de-thorsten-low-rhasspy-espeak` (este) | VITS | de-DE | MIT | ONNX | Fonemas IPA (espeak-ng) |
| Otras voces Piper `de_DE` (p. ej. `thorsten-medium`, `thorsten-high`) | VITS | de-DE | MIT | ONNX | Fonemas IPA (espeak-ng) |
| Modelos TTS multilingües tipo Coqui TTS / XTTS | VITS / autoregresivo | Multi | Varía (MPL, CPML) | PyTorch/ONNX | Texto o fonemas |
| Modelos TTS comerciales en la nube (Google, Azure) | Propietaria | Multi | Propietaria | API | Texto |

La comparación directa con otras variantes de Piper (`medium` y `high`) es la más relevante: comparten arquitectura y licencia, diferenciándose en calidad y coste computacional. No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con Coqui TTS u otros sistemas.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (alemán `de-DE`); no soporta otros idiomas ni cambio de hablante.
- Requiere espeak-ng instalado para generar los fonemas de entrada; sin él, el uso de espyak puede producir pronunciaciones incorrectas en algunas palabras.
- La variante "low" prioriza velocidad y ligereza sobre calidad de audio; puede presentar menor naturalidad que las variantes `medium` o `high`.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas o nombres propios no cubiertos por la fonemización de espeak-ng.
- No se dispone de información sobre sesgos acústicos o demográficos del dataset de entrenamiento original.
- Licencia MIT declarada por el upstream en la model card de `rhasspy/piper-voices`; se recomienda verificar los términos exactos del upstream antes de uso comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta; ecosistema y soporte comunitario muy limitados.
- No apto para tareas de razonamiento, generación de texto, código, visión ni agentes; es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-low-rhasspy-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
