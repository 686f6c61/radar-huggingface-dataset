# Phoonnx/vits-en_us-ljs-wasmdashai-graphemes

## Resumen

`vits-en_us-ljs-wasmdashai-graphemes` es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por wasmdashai y empaquetado por Phoonnx para su uso en la librería ONNX `phoonnx`. El modelo convierte texto en inglés estadounidense (`en-US`) en audio, tomando como entrada directamente los caracteres del texto (front-end basado en grafemas, sin fonemización explícita). Está pensado para integrarse en asistentes de voz y sistemas OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La relevancia de este modelo radica en su formato de despliegue: al estar empaquetado en ONNX, puede ejecutarse en entornos sin dependencias pesadas de frameworks de deep learning, lo que facilita su integración en sistemas embebidos, asistentes locales y aplicaciones de voz de baja latencia. El repositorio ocupa aproximadamente 0,1 GB, un tamaño manejable para despliegues en hardware modesto.

Se trata de un modelo especializado y de nicho (21 descargas en el momento de la consulta), orientado a un único idioma y a una única tarea. No es un modelo de lenguaje generalista ni soporta razonamiento, código o visión; su alcance se limita estrictamente a la síntesis de voz en inglés estadounidense.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos en formato ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (grafemas) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Librería | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. VITS se caracteriza por generar audio de forma directa desde el texto sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el pipeline de inferencia.

El modelo deriva del release original `wasmdashai/vits-eng-us-ljs`, entrenado presumiblemente sobre el corpus LJSpeech (inglés estadounidense), aunque la información proporcionada no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a modelos TTS). El front-end de texto utiliza `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte directamente en grafemas, sin pasar por una fonemización basada en diccionario o reglas fonéticas. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Entrada basada en grafemas: acepta caracteres del texto directamente, sin requerir transcripción fonética previa.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución sobre runtime ONNX, lo que permite despliegue sin frameworks de deep learning completos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada a `en-US`; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales (OVOS/Mycroft): el modelo se integra mediante `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en inglés estadounidense en asistentes autoalojados sin dependencia de servicios en la nube.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse sobre ONNX y ocupar 0,1 GB, puede desplegarse en dispositivos con recursos limitados para convertir mensajes de texto en audio.
- Accesibilidad para personas con discapacidad visual: síntesis de contenido textual (documentos, correos, interfaces) en inglés estadounidense dentro de aplicaciones de lectura por voz.
- Generación de avisos pregrabados dinámicos: creación de locuciones bajo demanda para sistemas de megafonía, domótica o terminales de atención automatizada en inglés.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado en ONNX y con licencia MIT, sirve como base para validar arquitecturas VITS en entornos de investigación o desarrollo antes de escalar a modelos mayores.
- Integración en aplicaciones Python de escritorio: la API `TTSModelManager` permite cargar la voz y escribir directamente en un fichero WAV, facilitando su uso en scripts y herramientas de automatización.
- Sistemas de respuesta interactiva de voz (IVR) en inglés: generación de mensajes hablados en flujos telefónicos automatizados donde se requiere baja latencia y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,1 GB) sugiere un modelo ligero que podría ejecutarse en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es plausible su ejecución en GPUs consumer, aunque no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado, pero el tamaño reducido del repositorio lo hace probable.
- Opciones de despliegue: runtime ONNX a través de la librería `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-ljs-wasmdashai-graphemes` | VITS | en-US | ONNX | MIT | grafemas | Hugging Face |
| `wasmdashai/vits-eng-us-ljs` (upstream) | VITS | en-US | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos de la colección VITS de Phoonnx | VITS | variable | ONNX | variable (según upstream) | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) para establecer una comparación cuantitativa con alternativas. La comparación se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza inglés estadounidense (`en-US`); no soporta otros idiomas ni acentos documentados.
- Front-end basado en grafemas: al no emplear fonemización explícita, la pronunciación de palabras irregulares, siglas o nombres propios puede ser menos precisa que en sistemas con diccionario fonético.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS generativo, puede producir pronunciaciones erróneas o ruido en entradas fuera de distribución (texto con símbolos, números o formatos inusuales).
- Sesgos: no se documentan sesgos específicos, pero al derivar de un corpus de un único hablante (presumiblemente LJSpeech), la voz generada estará limitada a las características de ese hablante.
- Licencia MIT: permite uso comercial y modificación, pero el autor indica que "the upstream release states its terms", por lo que conviene verificar las condiciones del modelo original `wasmdashai/vits-eng-us-ljs` antes de un despliegue comercial.
- Modelo de nicho con pocas descargas (21) y sin likes: la comunidad de validación es reducida, lo que limita la evidencia empírica sobre su robustez en producción.
- No apto para tareas de lenguaje general: no genera texto, no razona, no ejecuta código ni procesa imágenes.
- Dependencia de librerías específicas: requiere `phoonnx` (versión preliminar, `pip install --pre phoonnx`) y `scriptconv`, lo que puede limitar la portabilidad frente a soluciones TTS estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljs-wasmdashai-graphemes
- Modelo upstream: https://huggingface.co/wasmdashai/vits-eng-us-ljs
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
