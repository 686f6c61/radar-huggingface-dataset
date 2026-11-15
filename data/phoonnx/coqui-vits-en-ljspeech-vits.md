# Phoonnx/coqui-vits-en-ljspeech-vits

## Resumen

coqui-vits-en-ljspeech-vits es un modelo de síntesis de voz (text-to-speech) derivado del catálogo Coqui TTS y empaquetado por el usuario Phoonnx para su uso con la librería phoonnx, un runtime de inferencia ONNX orientado a TTS. El modelo se publica como un artefacto autónomo extraído del repositorio agregador Phoonnx/phoonnx-coqui-vits, conservando la ruta interna `en-ljspeech-vits` y el identificador de voz `coqui/en-ljspeech-vits`.

Técnicamente se trata de una implementación VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un codificador de texto, un prior normalizing flow, un decodificador generativo y un discriminador adversarial durante el entrenamiento. Está entrenado sobre el corpus LJSpeech, un conjunto de lectura de una única hablante en inglés estadounidense, por lo que el modelo genera voz monolocutor en en-US.

Su relevancia es acotada pero práctica: ofrece un modelo TTS ligero (el repositorio completo ocupa 0,1 GB) con licencia Apache-2.0, exportado a ONNX, lo que permite inferencia en CPU y despliegue sin dependencias de frameworks de deep learning pesados. No hay información pública sobre número de parámetros, longitud de contexto de texto ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decodificador generativo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto a nivel de fonema/carácter) |
| Tipos de cuantización | no disponible (pesos exportados a ONNX; el repo no detalla variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (en-US), según el dataset LJSpeech |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que integra en un único modelo un codificador de texto, un prior sobre variables latentes implementado mediante normalizing flows, un decodificador basado en redes generativas (típicamente HiFi-GAN como vocoder integrado) y un discriminador multiperiodo durante el entrenamiento. El entrenamiento combina una pérdida adversarial con una pérdida de reconstrucción en el dominio espectral y una estimación variacional del alineamiento entre texto y audio, lo que evita depender de alineamientos externos o de un vocoder separado en inferencia.

El modelo se ha entrenado sobre LJSpeech, un corpus de aproximadamente 24 horas de audio de una única hablante femenina leyendo fragmentos de textos no ficticios en inglés estadounidense, con transcripciones a nivel de carácter. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de ajuste fino o RLHF (no aplicable en TTS). La innovación práctica del artefacto es su exportación a ONNX y su integración en el runtime phoonnx, que permite ejecutar el modelo sin la pila original de Coqui TTS.

## Capacidades

- Síntesis de voz monolocutor en inglés estadounidense a partir de texto plano.
- Generación de audio de habla natural con prosodia aprendida del corpus LJSpeech.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Identificación de voz estable mediante el id `coqui/en-ljspeech-vits`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de clonación de voz, control de emoción ni cambio de hablante.
- No soporta otros idiomas distintos del inglés estadounidense.
- No incluye modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o consumo de contenido, aprovechando su naturaleza end-to-end y su bajo peso (0,1 GB).
- Generación de avisos y notificaciones por voz: útil en sistemas embebidos o aplicaciones de escritorio que necesitan sintetizar mensajes cortos en inglés sin depender de servicios en la nube.
- Audiolibros y pódcasts automatizados: para narración de textos largos en inglés estadounidense con una voz consistente, dado que el modelo mantiene una única identidad de hablante.
- Pruebas de integración en pipelines TTS: al estar exportado a ONNX y soportado por phoonnx, sirve como componente de referencia para validar flujos de síntesis en producción sin GPU.
- Asistentes de voz offline: despliegue en dispositivos con recursos limitados donde no es viable cargar un stack completo de Coqui TTS ni enviar texto a APIs externas.
- Prototipado de interfaces conversacionales: generación rápida de respuestas habladas en demos y pruebas de usabilidad en inglés, con licencia Apache-2.0 que facilita su incorporación a productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y el formato ONNX, es esperable que quepa en memoria de CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución vía ONNX Runtime, que soporta CPU y GPU.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con soporte ONNX Runtime, pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| coqui-vits-en-ljspeech-vits | VITS | en-US | Apache-2.0 | ONNX | 0,1 GB |
| Coqui TTS en-ljspeech-vits (original) | VITS | en-US | Apache-2.0 | PyTorch | no disponible |
| Modelos VITS de LJSpeech en la comunidad Coqui | VITS | en-US | variable | PyTorch | no disponible |

La comparativa se limita al modelo original del que deriva, ya que no se dispone de datos de rendimiento ni de parámetros de alternativas concretas en la información proporcionada. La diferencia principal frente al original es el empaquetado en ONNX y la integración con phoonnx, que elimina la dependencia de la pila Coqui TTS en inferencia.

## Limitaciones y advertencias

- Modelo monolocutor: solo reproduce la voz de la hablante de LJSpeech; no permite seleccionar ni clonar voces.
- Idioma restringido al inglés estadounidense; no se garantiza un comportamiento correcto con texto en otros idiomas.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio del corpus (nombres propios, siglas, términos técnicos), dado el entrenamiento sobre textos de lectura de dominio general.
- No se han publicado métricas de calidad (MOS, WER, etc.), por lo que no es posible evaluar su fidelidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado sin validación comunitaria.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia y los términos del modelo original de Coqui antes de redistribuirlo en productos.
- No se documentan limitaciones de longitud de texto de entrada ni comportamiento en textos muy largos.
- Al ser un artefacto derivado, la responsabilidad de mantenimiento y soporte recae en el publicador, no en el proyecto Coqui original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-en-ljspeech-vits
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
