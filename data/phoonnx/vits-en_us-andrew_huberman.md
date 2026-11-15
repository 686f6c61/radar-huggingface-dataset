# Phoonnx/vits-en_us-andrew_huberman

## Resumen

`vits-en_us-andrew_huberman` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, entrenado por el usuario samarthshrivas y empaquetado por Phoonnx para su librería de inferencia ONNX `phoonnx`. El modelo genera voz en inglés estadounidense (`en-US`) a partir de texto, concretamente a partir de fonemas en alfabeto IPA obtenidos mediante espeak-ng. Su nombre hace referencia a una voz clonada o ajustada a partir del estilo del divulgador Andrew Huberman, aunque la model card no documenta el proceso de recogida de datos ni el consentimiento asociado.

El interés práctico del modelo reside en su formato: al estar empaquetado como ONNX y distribuido a través de `phoonnx`, puede ejecutarse en Python y en el asistente de voz OVOS, así como en el navegador mediante `phoonnx.js`. Con un tamaño de repositorio de 0,1 GB, es un modelo ligero, adecuado para despliegues en dispositivos con recursos limitados y para integrarse en pipelines de TTS de baja latencia.

No se dispone de información sobre el número de parámetros, la longitud de contexto (concepto poco aplicable a TTS) ni el volumen de datos de entrenamiento. La información pública se limita a la model card del autor y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Autor del modelo original | samarthshrivas |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador entrenado de forma adversarial, junto con un alineamiento monotónico aprendido (MAS) que sustituye a los alineadores externos clásicos. El resultado es un modelo que transforma secuencias de fonemas en formas de onda directamente, sin necesidad de un vocoder separado en tiempo de inferencia.

En este caso concreto, el modelo es un ajuste fino (finetune) del pipeline de Piper, según se desprende de la ruta upstream `samarthshrivas/piper-finetune-Andrew-Huberman/lightning_logs/version_2/checkpoints`. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La entrada textual se procesa mediante `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak-ng en IPA antes de pasarlo al modelo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto plano.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciación si se proporcionan fonemas manualmente.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)` de `phoonnx`.
- Integración con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js`, con entrada espeak o Unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- **Lectura de artículos y documentos en voz alta**: el modelo convierte texto en audio WAV de forma local, sin dependencias de servicios en la nube, gracias a su tamaño reducido (0,1 GB) y a su formato ONNX.
- **Asistente de voz doméstico con OVOS**: se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper_community/samarthshrivas/en-US_Andrew-Huberman` en `mycroft.conf`, lo que permite dotar de voz a un asistente local en inglés.
- **Prototipado de interfaces conversacionales**: al ejecutarse en Python con `pip install --pre phoonnx`, permite iterar rápidamente en el diseño de flujos de voz sin infraestructura dedicada.
- **Aplicaciones web de accesibilidad**: mediante `phoonnx.js` puede sintetizar voz en el navegador, útil para lectores de pantalla o para convertir contenido dinámico en audio sin enviar texto a servidores externos.
- **Generación de audiolibros o pódcast de bajo coste**: la licencia MIT y el tamaño compacto permiten generar lotes de audio en máquinas modestas, siempre que el contenido sea en inglés estadounidense.
- **Pruebas de pronunciación y fonética**: al aceptar fonemas IPA de espeak-ng, se puede usar para experimentar con pronunciaciones controladas y evaluar el comportamiento del modelo ante distintas secuencias fonéticas.
- **Integración en pipelines de CI/CD para pruebas de regresión de audio**: el formato ONNX y la API de `phoonnx` permiten automatizar la generación de muestras de referencia y comparar versiones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS en ONNX, es esperable que quepa en GPUs de gama baja e incluso en CPU, aunque no se confirma en la documentación.
- **GPU recomendadas**: no disponible. No se documentan requisitos mínimos ni recomendados.
- **Compatibilidad con GPU de consumo**: probable por el tamaño del modelo, pero no confirmado por el autor.
- **Opciones de despliegue**: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles.
- **Dependencia externa**: requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; sin él, la fonemización puede fallar o producir pronunciaciones incorrectas con espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-andrew_huberman` | VITS | en-US | 0,1 GB (repo) | MIT | ONNX | Hugging Face, via phoonnx |
| Piper (voces `en_US-*`) | VITS | en-US | del orden de decenas de MB por voz | MIT (segun voces) | ONNX | Hugging Face, via piper |
| Coqui TTS (modelos VITS) | VITS | multiidioma | variable | MPL-2.0 / otras | PyTorch, ONNX | GitHub, Hugging Face |
| Bark | Transformer autoregresivo | multilingüe | varios GB | MIT | PyTorch | GitHub, Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para este modelo concreto en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo inglés estadounidense; no soporta otros idiomas ni variantes regionales.
- **Dependencia de espeak-ng**: la fonemización incorrecta o la ausencia de espeak-ng puede degradar la calidad y la pronunciación; el propio autor advierte que espyak puede diferir de espeak-ng y producir errores en algunas palabras.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de audio, puede producir artefactos, prosodia anómala o pronunciaciones incorrectas en textos fuera de distribución.
- **Sesgos de la voz**: al estar ajustado a una voz concreta (Andrew Huberman), puede reflejar características prosódicas y de estilo del hablante original; no se documenta el origen ni el consentimiento de los datos de voz.
- **Licencia MIT**: permite uso comercial, pero el autor remite a los términos del release upstream; conviene verificar la cadena de licencias del checkpoint original de samarthshrivas.
- **Documentación escasa**: no se publican parámetros, datos de entrenamiento, benchmarks ni métricas de calidad, lo que dificulta evaluar su idoneidad para producción.
- **Madurez**: 29 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso extendido ni de mantenimiento activo.
- **Formato ONNX**: aunque facilita el despliegue, limita el ajuste fino posterior sin herramientas adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-en_us-andrew_huberman)
- [Checkpoint upstream de samarthshrivas](https://huggingface.co/samarthshrivas/piper-finetune-Andrew-Huberman/tree/main/lightning_logs/version_2/checkpoints)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Colección de modelos VITS empaquetados para phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
