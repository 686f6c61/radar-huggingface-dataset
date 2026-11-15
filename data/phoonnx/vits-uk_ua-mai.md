# Phoonnx/vits-uk_ua-mai

## Resumen

vits-uk_ua-mai es un modelo de síntesis de voz (text-to-speech) en ucraniano, empaquetado en formato ONNX por Phoonnx a partir de un modelo VITS originalmente publicado por Coqui en la versión 0.8.0 de su librería TTS. El modelo resuelve la conversión de texto a audio en ucraniano (variante uk-UA) y se distribuye con una licencia permisiva BSD-3-Clause, lo que facilita su integración en productos comerciales.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, junto con un vocoder integrado. El modelo se entrenó sobre el corpus M-AILABS según la información de la model card.

Su relevancia actual radica en que ofrece TTS en ucraniano en un paquete ONNX ligero (0,1 GB) ejecutable mediante la librería phoonnx, con integración directa en el ecosistema OVOS/Mycroft. Es una opción práctica para asistentes de voz y aplicaciones de accesibilidad en ucraniano donde no se dispone de servicios TTS en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ucraniano (uk-UA) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Tamano del repositorio | 0,1 GB |
| Corpus de entrenamiento | M-AILABS (según la model card) |

## Arquitectura y entrenamiento

VITS es un modelo end-to-end de síntesis de voz que integra en una sola red el front-end de texto, el modelo acústico y el vocoder. Emplea inferencia variacional con aprendizaje adversarial: un codificador de texto transforma la secuencia de caracteres en una representación latente, un prior condicionado por alineamiento monotónico (MAS) modela la duración, y un decodificador basado en flujos normalizadores genera la forma de onda directamente. Esto elimina la necesidad de un vocoder separado y reduce el pipeline a una única pasada.

El modelo se entrenó sobre el corpus M-AILABS en ucraniano, según declara la model card. No se dispone de información sobre el número exacto de horas de audio, la composición detallada del dataset ni si se aplicaron etapas de fine-tuning adicionales. El front-end de texto de phoonnx utiliza `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de caracteres de entrada; no se emplea un fonemizador basado en fonemas IPA.

## Capacidades

- Síntesis de voz en ucraniano (uk-UA) a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Procesamiento a nivel de frase: el modelo recibe una oración y devuelve la forma de onda correspondiente.
- Normalización de texto mediante scriptconv (conversión de script y limpieza básica).
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en ONNX Runtime, lo que permite despliegue en CPU sin dependencias de GPU.
- No soporta tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en ucraniano: integración como motor TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, configurando la voz `coqui/uk-mai-vits` en `mycroft.conf` para respuestas habladas en tiempo real.
- Accesibilidad y lectores de pantalla: conversión de texto a audio para aplicaciones que asisten a personas con discapacidad visual en ucraniano, ejecutándose en local sin depender de servicios en la nube.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados o dinámicos en ucraniano para transporte público, aeropuertos o comercios, con bajo coste de inferencia en CPU.
- Contenido educativo y e-learning: producción de narraciones para cursos, audiolibros o material didáctico en ucraniano a partir de texto, con licencia BSD-3-Clause que permite uso comercial.
- Atención al cliente automatizada: síntesis de respuestas de un chatbot o IVR en ucraniano, combinada con un ASR para construir un pipeline de voz completo en local.
- Localización de aplicaciones: generación de pistas de audio en ucraniano para videojuegos, tutoriales o interfaces habladas, empaquetando el modelo ONNX de 0,1 GB dentro de la propia aplicación.
- Prototipado e investigación en TTS: base para experimentos de fine-tuning o comparación de arquitecturas VITS en lenguas eslavas, gracias a su licencia permisiva y su formato ONNX estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo ONNX de 0,1 GB requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100); no obstante, el modelo está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: phoonnx (Python y OVOS), ONNX Runtime; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no están orientados a modelos TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-uk_ua-mai | VITS | ucraniano (uk-UA) | no aplica | BSD-3-Clause | ONNX | Hugging Face, 0,1 GB |
| Coqui TTS uk-mai-vits (original) | VITS | ucraniano (uk-UA) | no aplica | BSD-3-Clause | PyTorch (checkpoint) | GitHub Coqui TTS v0.8.0 |
| Otros modelos VITS de la colección Phoonnx | VITS | varios idiomas | no aplica | según modelo | ONNX | Hugging Face (colección VITS) |

La comparativa se limita a la familia VITS de Coqui y a los empaquetados de Phoonnx, ya que no se dispone de información sobre modelos TTS alternativos en ucraniano con los que contrastar parámetros o rendimiento.

## Limitaciones y advertencias

- Idioma único: solo soporta ucraniano (uk-UA); el texto en otros idiomas o con caracteres no contemplados puede producir resultados incorrectos.
- Entrada basada en grafemas: al no emplear fonemas IPA, la pronunciación depende del mapeo grafema-a-sonido aprendido y puede fallar en palabras extranjeras, siglas o números no normalizados.
- Riesgo de artefactos acústicos: como todo modelo TTS generativo, puede producir prosodia antinatural, ruido o inestabilidad en frases largas o con puntuación atípica.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, WER) que permitan evaluar su rendimiento frente a alternativas.
- Licencia BSD-3-Clause: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la cláusula de no endorsement; conviene verificar la licencia del corpus M-AILABS subyacente para usos derivados.
- Sesgos: no se documentan sesgos de género, acento o registro; el modelo reproduce las características del hablante o hablantes del corpus M-AILABS.
- Sin soporte de control de prosodia, emoción ni velocidad más allá de lo que exponga la API de phoonnx.
- Empaquetado dependiente de phoonnx y scriptconv: requiere instalar la versión pre-release de phoonnx (`pip install --pre phoonnx`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-uk_ua-mai
- Modelo original Coqui TTS (v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--uk--mai--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
