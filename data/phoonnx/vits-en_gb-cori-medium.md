# Phoonnx/vits-en_gb-cori-medium

## Resumen

vits-en_gb-cori-medium es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en inglés británico (en-GB) y se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la gama "medium" de las voces Piper en términos de calidad y coste computacional.

El modelo no es un modelo de lenguaje generativo ni un sistema multimodal: es un sintetizador acústico completo que integra codificador de texto, alineador de duración, flujo normalizador y decodificador de audio en una única red entrenada de extremo a extremo. Su entrada no es texto crudo, sino fonemas en alfabeto IPA generados mediante espeak-ng, lo que condiciona tanto la integración como la calidad de pronunciación.

Su relevancia actual radica en que ofrece TTS local, determinista y de baja latencia sin dependencia de servicios en la nube, con licencia MIT y un formato ONNX portable. Está pensado para integrarse en asistentes de voz (OVOS/Mycroft), aplicaciones de accesibilidad y pipelines de generación de audio donde el coste por inferencia y la privacidad importan más que la expresividad de los modelos neuronales de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS: encoder de texto, alineador de duración, normalizing flow y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; procesa una frase por inferencia) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | inglés británico (en-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python y OVOS) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional de extremo a extremo que combina un encoder de texto, un módulo de predicción de duraciones, un flujo normalizador y un decodificador generativo basado en HiFi-GAN, entrenados conjuntamente con una pérdida adversarial y una estimación variacional de la alineación. Este diseño permite generar waveforms directamente desde fonemas sin un vocoder externo, con inferencia determinista y sin necesidad de pasos de difusión.

El modelo deriva de la voz `en_GB/cori/medium` del repositorio `rhasspy/piper-voices`, entrenada por Rhasspy dentro del ecosistema Piper. La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de ajuste fino con RLHF o DPO (en TTS estos métodos no son habituales). El empaquetado de Phoonnx no modifica los pesos: reorganiza el artefacto para que sea consumible por su librería ONNX y documenta el front-end de texto requerido.

La innovación relevante aquí no está en el modelo en sí, sino en el pipeline de despliegue: la normalización y conversión a fonemas se delega a `scriptconv` con el fonemizador `EspeakPhonemizer`, y la inferencia se ejecuta sobre ONNX, lo que permite ejecución en CPU y en navegador (mediante phoonnx.js) con un único artefacto.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generación determinista de audio, adecuada para pipelines reproducibles.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Integración nativa con OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta visión, audio de entrada ni modo "thinking".
- Capacidad multilingüe limitada a en-GB; no se documentan otras variantes en este artefacto.

## Casos de uso

- Asistentes de voz domésticos con OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `piper/en_GB-cori-medium` en `mycroft.conf` y sintetizar respuestas del asistente en local, sin enviar texto a servicios externos.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse sobre ONNX en CPU, puede invocarse desde un proceso en segundo plano para convertir mensajes cortos en audio con latencia baja y sin ocupar GPU.
- Accesibilidad para usuarios con discapacidad visual: integración en lectores de pantalla o herramientas de lectura de documentos que necesiten una voz en inglés británico con licencia permisiva para distribución comercial.
- Generación de audio para pruebas automatizadas de sistemas de voz: su naturaleza determinista permite generar corpus de referencia reproducibles para evaluar pipelines ASR o de diálogo.
- Síntesis en el navegador con phoonnx.js: demos y aplicaciones web que requieran TTS sin backend, usando el artefacto ONNX y el front-end de fonemas en el cliente.
- Prototipado de interfaces conversacionales: al no requerir GPU ni infraestructura de servido, permite validar flujos de voz en fases tempranas de desarrollo con coste casi nulo.
- Generación de contenido de audio para entornos sin conectividad: despliegue en dispositivos embebidos o redes aisladas donde no se puede recurrir a APIs de TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no se documentan; cualquier GPU compatible con ONNX Runtime (por ejemplo, CUDA en A100, H100 o RTX 4090) podría acelerar la inferencia, pero el autor no publica requisitos ni cifras.
- Cabe en GPU de consumo: sí, en la práctica cualquier GPU moderna podría alojar un artefacto de 0,1 GB, aunque no se han publicado mediciones.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-cori-medium (este modelo) | VITS | en-GB | 0,1 GB | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices en_GB/cori/medium | VITS | en-GB | no disponible | MIT | ONNX (Piper) | Hugging Face (Rhasspy) |
| Otras voces Piper en_GB (por ejemplo, alan, northern_english_male) | VITS | en-GB | variable | MIT | ONNX (Piper) | Hugging Face (Rhasspy) |
| Modelos TTS neuronales de gran escala (por ejemplo, familia XTTS) | no disponible en esta ficha | multilingüe | varios GB | variable | safetensors / otros | Hugging Face |

La comparación directa más relevante es con el artefacto upstream de Rhasspy: este paquete de Phoonnx es funcionalmente equivalente en pesos, pero añade integración con la librería phoonnx y su front-end de fonemas. Frente a modelos TTS de gran escala, la diferencia principal es el coste computacional y la ausencia de clonación de voz o expresividad avanzada.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un corpus de voz concreto, la prosodia y el timbre reflejan las características de los hablantes originales.
- Alucinación: en TTS se manifiesta como pronunciaciones incorrectas o artefactos acústicos, especialmente con palabras fuera de vocabulario, siglas o nombres propios no cubiertos por el fonemizador.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, el autor advierte que algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Limitación de idioma: solo en-GB; no debe usarse con texto en otras lenguas sin esperar degradación severa.
- Longitud de entrada: al procesar una frase por inferencia, textos largos requieren segmentación previa por parte de la aplicación.
- Licencia: MIT, lo que permite uso comercial y redistribución; el autor indica que la licencia upstream declarada en rhasspy/piper-voices es también MIT.
- Caveat de producción: no se publican métricas de calidad (MOS), latencia ni throughput; conviene medir en el hardware objetivo antes de desplegar.
- Fecha de creación del repositorio: 2026-11-14, lo que indica un artefacto reciente con pocas descargas (29) y sin likes; la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-cori-medium
- Upstream (Piper voices, en_GB/cori/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/cori/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
