# Phoonnx/vits-en_us-arctic-medium

## Resumen

vits-en_us-arctic-medium es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en inglés estadounidense en audio inteligible mediante un front-end fonémico basado en espeak-ng, y se distribuye como un artefacto ONNX listo para ejecutarse en Python, en OVOS o en el navegador a través de phoonnx.js.

Su relevancia práctica radica en que ocupa el segmento de TTS ligero y autoalojado: el repositorio completo pesa aproximadamente 0,1 GB, lo que permite desplegarlo en dispositivos de bajos recursos, entornos embebidos o asistentes de voz domésticos sin depender de servicios en la nube. La licencia MIT del upstream facilita su integración comercial sin las restricciones habituales de otros motores de voz.

No se trata de un modelo generativo de propósito general ni de un LLM: es un sintetizador acústico especializado, de tamaño "medium" dentro de la familia Piper, con un único idioma (en-US) y una única voz. Cualquier evaluación debe hacerse en términos de naturalidad, latencia y robustez fonémica, no de razonamiento o contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es texto fonemizado, no una secuencia con ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Pipeline | text-to-speech |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es un modelo end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, además de una alineación monotónica latente que sustituye a los tradicionales modelos acústicos y vocoders separados. El resultado es un sistema que genera波形 de audio directamente a partir de fonemas, con un vocoder implícito en el decoder.

En este caso concreto, el modelo procede de `rhasspy/piper-voices/en/en_US/arctic/medium`, la colección de voces Piper de Rhasspy. La model card no proporciona detalles sobre el corpus de entrenamiento (número de horas, composición del dataset, hablantes), ni sobre si se aplicaron técnicas de RLHF, DPO o fine-tuning adicional. Tampoco se documentan innovaciones específicas más allá de las propias de VITS. El empaquetado de Phoonnx añade una capa de integración con `scriptconv` para normalización de texto y fonemización vía espeak-ng, pero no modifica el modelo subyacente.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con entrada en alfabeto IPA.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable desde `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js, con entrada por espeak o Unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.
- No soporta otros idiomas distintos del en-US, ni cambio de voz o hablante.
- No dispone de modo "thinking", visión, audio de entrada ni capacidades multimodales.

## Casos de uso

- Asistentes de voz domésticos autoalojados: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz a un asistente local sin enviar texto a servicios externos, con un peso de repositorio de ~0,1 GB que cabe en dispositivos tipo Raspberry Pi.
- Lectura de notificaciones y alertas en sistemas embebidos: su formato ONNX y su reducido tamaño permiten invocarlo desde un daemon ligero para convertir mensajes cortos en audio en tiempo real.
- Síntesis en el navegador: phoonnx.js ejecuta la voz directamente en el cliente, lo que habilita interfaces web accesibles con lectura de contenido sin coste de servidor ni latencia de red.
- Generación de audiolibros o podcasts de bajo coste: para contenidos en inglés estadounidense, el modelo puede procesar lotes de texto y producir WAV por lotes, aunque la naturalidad es la propia de una voz "medium" de Piper.
- Pruebas de accesibilidad y prototipado de interfaces de voz: al ser MIT y ejecutable en local, es adecuado para experimentar con TTS en pipelines de CI o en entornos de desarrollo sin dependencias cloud.
- Sustitución de voces comerciales en productos con requisitos de privacidad: al no requerir conexión externa, el texto del usuario nunca sale del dispositivo, lo que simplifica el cumplimiento de RGPD en aplicaciones de lectura de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) se espera un consumo de memoria muy reducido, apto para CPU.
- GPU recomendadas: no se documentan; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU consumer, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-arctic-medium (este) | VITS | en-US | MIT | ONNX | ~0,1 GB | Empaquetado por Phoonnx, voz Piper "arctic medium" |
| Otras voces Piper en_US (p. ej. lessac, ryan) | VITS | en-US | MIT (según upstream) | ONNX | variable | Misma familia y pipeline; calidad y hablante distintos |
| Coqui TTS (modelos VITS) | VITS | varios | MPL-2.0 / según modelo | PyTorch | variable | Ecosistema más amplio, mayor peso de dependencias |
| Kokoro TTS | no disponible | varios | Apache 2.0 (según proyecto) | ONNX/PyTorch | variable | Alternativa ligera moderna; no comparable directamente sin datos |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de naturalidad o latencia con estas alternativas.

## Limitaciones y advertencias

- Modelo de un solo idioma (en-US) y una sola voz: no admite cambio de hablante ni otros idiomas.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente, según advierte la propia model card.
- Riesgo de pronunciación errónea en nombres propios, siglas, números y texto no normalizado; la calidad depende del front-end `scriptconv`.
- No se documentan sesgos específicos, pero al ser una voz entrenada sobre un corpus concreto (arctic) puede reflejar las características del hablante original.
- No es un modelo generativo de texto: no alucina contenido semántico, pero puede producir audio ininteligible ante entradas fuera de distribución.
- Licencia MIT declarada por el upstream; conviene verificar la procedencia exacta del corpus de entrenamiento antes de un uso comercial a gran escala.
- No se documentan cuantizaciones ni optimizaciones específicas; el rendimiento real en producción debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-arctic-medium
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/arctic/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
