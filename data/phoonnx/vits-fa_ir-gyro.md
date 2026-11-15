# Phoonnx/vits-fa_ir-gyro

## Resumen

`Phoonnx/vits-fa_ir-gyro` es un modelo de síntesis de voz (text-to-speech) en persa (fa-IR) basado en la arquitectura VITS. No lo entrena Phoennx desde cero: es un empaquetado del modelo original de gyroing (`gyroing/Persian-Piper-Model-gyro`), convertido a formato ONNX para que funcione con la librería de inferencia phoonnx, del ecosistema TigreGotico/OVOS.

El modelo resuelve un problema concreto: ofrecer una voz persa utilizable en pipelines de TTS ligeros, con pesos ONNX de pequeño tamaño (el repositorio ocupa aproximadamente 0,1 GB) y una interfaz de síntesis directa a WAV. Es relevante para desarrolladores que construyen asistentes de voz o sistemas de lectura en persa y necesitan un motor de TTS ejecutable en CPU sin dependencias pesadas de frameworks de deep learning.

La entrada de texto se procesa mediante fonemización con espeak-ng (alfabeto IPA) y normalización con la librería scriptconv. El modelo está pensado para integrarse tanto en Python como en entornos OVOS, con un plugin de TTS dedicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. Genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus persa utilizado, ni si se aplicaron técnicas de alineamiento o ajuste fino posteriores. El modelo original fue entrenado por gyroing y aquí se distribuye únicamente el empaquetado ONNX para phoonnx. La entrada de texto requiere fonemización previa con espeak-ng (alfabeto IPA); phoonnx delega la normalización en scriptconv.

## Capacidades

- Síntesis de voz en persa (fa-IR) a partir de texto, con salida en formato WAV.
- Fonemización mediante espeak-ng (IPA) y normalización de texto con scriptconv.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración en Python a través de `TTSModelManager` de phoonnx.
- Integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte en navegador a través de phoonnx.js (según la documentación del ecosistema).
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en persa: el modelo permite convertir respuestas de texto en audio dentro de un asistente doméstico basado en OVOS, usando el plugin `ovos-tts-plugin-phoonnx` y seleccionando la voz `piper_community/gyroing/fa-IR_gyro` en `mycroft.conf`.
- Lectura de contenido en aplicaciones móviles o web: al ser ONNX y ligero (aproximadamente 0,1 GB), puede empaquetarse en aplicaciones que necesiten leer artículos o notificaciones en persa sin conexión.
- Accesibilidad para personas con discapacidad visual: síntesis de texto a voz en persa para lectores de pantalla o sistemas de navegación por voz.
- Generación de audio para contenidos educativos: creación de locuciones en persa para cursos, audiolibros o materiales de e-learning, sintetizando frase a frase.
- Sistemas de atención telefónica automatizada: respuestas de voz pregrabadas dinámicamente en persa para IVR, aprovechando la baja latencia de un modelo VITS en CPU.
- Pruebas y prototipado de pipelines TTS: al ser un modelo pequeño y con licencia MIT, sirve como base para experimentar con fonemización persa, normalización de texto y conversión a audio antes de escalar a modelos mayores.
- Integración en navegador: mediante phoonnx.js, se puede ofrecer síntesis de voz persa en una aplicación web sin backend, usando la demo pública del ecosistema como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta soporte GPU específico.
- Compatibilidad con GPU de consumo: no disponible; el enfoque es CPU-first.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: repositorio de aproximadamente 0,1 GB, adecuado para entornos con recursos limitados.
- Dependencia externa: espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con espyak, con posibles diferencias fonéticas).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| Phoonnx/vits-fa_ir-gyro | VITS | fa-IR | ONNX | MIT | ~0,1 GB |
| gyroing/Persian-Piper-Model-gyro (upstream) | VITS/Piper | fa-IR | no disponible | MIT | no disponible |
| Otros modelos de la colección VITS de Phoonnx | VITS | varios | ONNX | según modelo | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de síntesis de voz en persa; no procesa otros idiomas ni tareas de texto.
- La calidad de la fonemización depende de espeak-ng; con espyak pueden producirse errores de pronunciación en algunas palabras, según advierte la propia model card.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus persa concreto, puede reflejar sesgos de pronunciación o prosodia de ese corpus.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`gyroing/Persian-Piper-Model-gyro`), que la model card declara también como MIT.
- No se dispone de información sobre parámetros, datos de entrenamiento ni métricas de calidad (MOS, WER), lo que dificulta evaluar su rendimiento frente a alternativas.
- El número de descargas (28) y likes (0) sugiere un modelo poco validado por la comunidad; conviene probarlo en el dominio de uso previsto antes de producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-fa_ir-gyro](https://huggingface.co/Phoonnx/vits-fa_ir-gyro)
- [Modelo upstream: gyroing/Persian-Piper-Model-gyro](https://huggingface.co/gyroing/Persian-Piper-Model-gyro)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
