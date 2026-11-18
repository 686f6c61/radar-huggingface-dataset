# fbmacagba/bytestts-en-ljspeech

## Resumen

BytesTTS voice: en-ljspeech es una voz de síntesis de voz (text-to-speech) para el motor BytesTTS, publicada por el usuario fbmacagba. Se trata de un modelo VITS de un solo hablante en inglés estadounidense, distribuido en formato ONNX, que corresponde a la conversión del checkpoint `tts_models/en/ljspeech/vits` de Coqui TTS. Los pesos han sido convertidos, no reentrenados, por lo que el modelo hereda las características y el comportamiento del original de Coqui.

El modelo resuelve la necesidad de disponer de una voz TTS ligera, verificable y fácilmente integrable en pipelines ONNX sin depender del stack completo de Coqui TTS. Con un único fichero `model.onnx` de aproximadamente 114 MB y una frecuencia de muestreo de 22.050 Hz en mono, está pensado para síntesis local de baja latencia en inglés. La relevancia actual radica en su empaquetado reproducible: cada fichero se verifica mediante SHA-256 contra un manifiesto `voice.json`, lo que facilita su uso en entornos de producción con requisitos de integridad.

La licencia Apache-2.0 y el uso de un corpus de dominio público (LJ Speech) eliminan buena parte de las fricciones legales habituales en TTS comercial. No obstante, el modelo es monoidioma (inglés), monohablante y depende de espeak-ng para la fonemización, lo que condiciona su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible (pesos ONNX de 114.265.684 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto/fonemas) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` sin variantes cuantizadas) |
| Idiomas soportados | ingles (en, variante estadounidense) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `config.json` y `voice.json` |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento, según el paper arXiv:2106.06103. En este caso no hay entrenamiento propio: los pesos proceden del checkpoint `tts_models--en--ljspeech--vits.zip` de la release `v0.6.1_models` de Coqui TTS, con SHA-256 `061ed8902f57c2dc8821b675bd15b7134cec2fb5d576dafcb928b6f5bf1a3489`.

El proceso de conversión se realizó en un sandbox aislado sin red, tras un escaneo de pickle y con `torch.load(weights_only=True)`. Cada peso se validó contra el port en PyTorch de VITS de BytesTTS y después se exportó a ONNX desde safetensors. La verificación reportada indica que el port coincide con la salida de Coqui TTS con duraciones idénticas y una relación señal-error de al menos 60 dB, y que el modelo ONNX coincide con el port con duraciones idénticas y al menos 50 dB. El corpus de entrenamiento original es LJ Speech, de dominio público, grabado por Linda Johnson y publicado por Keith Ito en 2017.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con salida mono a 22.050 Hz.
- Fonemización mediante espeak-ng 1.52.0, requisito explícito del motor BytesTTS.
- Voz de un solo hablante, fijada por el corpus LJ Speech; no permite cambio de hablante ni clonación.
- Carga verificada por SHA-256 de cada fichero contra el manifiesto `voice.json`.
- Uso mediante CLI (`bytestts say`) y API Python (`BytesTTS.load`, `BytesTTS.load_path`, `synthesize`).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No dispone de modo de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Lectura de artículos y documentación: el modelo convierte texto plano en audio para sistemas de accesibilidad o lectura por voz, aprovechando su naturaleza ligera y su licencia permisiva.
- Generación de avisos y notificaciones por voz: integrable en aplicaciones de escritorio o servidores para producir mensajes cortos en inglés con latencia baja, dado el tamano reducido del fichero ONNX.
- Doblaje de contenido formativo en inglés: útil para prototipos de e-learning donde se requiere una voz consistente y de dominio público en cuanto a datos de entrenamiento.
- Pruebas automatizadas de pipelines de audio: al estar empaquetado como ONNX con verificación SHA-256, sirve como fixture reproducible en tests de integración de sistemas TTS.
- Asistentes de voz locales sin conexión: el modelo puede ejecutarse en local mediante ONNX Runtime, lo que encaja en escenarios de privacidad donde no se desea enviar texto a servicios externos.
- Generación de audiolibros o pódcasts sintéticos en inglés: adecuado para contenido largo siempre que se acepte una única voz y se gestione la fonemización con espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la conversión: relación señal-error de al menos 60 dB entre el port de BytesTTS y Coqui TTS, y de al menos 50 dB entre el modelo ONNX y dicho port, con duraciones idénticas en ambos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero ONNX ocupa unos 114 MB, por lo que la huella en memoria es moderada.
- GPU recomendadas: no disponible; el modelo puede ejecutarse en CPU mediante ONNX Runtime, que es el escenario habitual para un VITS de este tamano.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con unos pocos cientos de MB de memoria libre, aunque no se especifican modelos concretos.
- Opciones de despliegue: BytesTTS (CLI y API Python) sobre ONNX Runtime; requiere espeak-ng 1.52.0 para la fonemización.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BytesTTS en-ljspeech (este modelo) | no disponible (ONNX de 114 MB) | no aplica | sin benchmarks publicados; fidelidad de conversion verificada | Apache-2.0 | Hugging Face, ONNX |
| Coqui TTS `tts_models/en/ljspeech/vits` | no disponible | no aplica | referencia original del que deriva este modelo | Apache-2.0 | Coqui TTS release v0.6.1_models |
| Alternativas VITS de un solo hablante en ingles | no disponible | no aplica | no disponible | variable | no disponible |

La comparativa se limita al modelo de origen, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monohablante y monoidioma: solo inglés estadounidense y una única voz; no admite cambio de hablante ni otros idiomas.
- Dependencia externa de espeak-ng 1.52.0 para la fonemización; sin esta dependencia el motor no puede sintetizar.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del dominio de LJ Speech, siglas o términos técnicos.
- Sesgos heredados del corpus LJ Speech: una única hablante, registro de lectura y vocabulario limitado al dominio del dataset.
- Uso dual: la model card advierte explícitamente de no emplear la voz para engañar a personas; no se incluyen mecanismos de marca de agua ni detección de voz sintética.
- Licencia Apache-2.0 permite uso comercial, pero se exige mantener la atribución a Coqui TTS, a Eren Gölge y a LJ Speech (Keith Ito y Linda Johnson, 2017).
- No se ofrece información sobre cuantizaciones alternativas ni sobre rendimiento en producción; conviene validar la latencia en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbmacagba/bytestts-en-ljspeech
- Repositorio de BytesTTS: https://github.com/jared0565/bytesTTS
- Documentación de instalación de espeak-ng: https://github.com/jared0565/bytesTTS/blob/main/docs/knowledge-base/espeak-ng.md
- Paper de VITS: https://arxiv.org/abs/2106.06103
- Dataset LJ Speech: https://keithito.com/LJ-Speech-Dataset/
- Proyecto espeak-ng: https://github.com/espeak-ng/espeak-ng
- Coqui TTS: https://github.com/coqui-ai/TTS
