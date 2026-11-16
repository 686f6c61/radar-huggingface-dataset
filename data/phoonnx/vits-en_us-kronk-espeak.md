# Phoonnx/vits-en_us-kronk-espeak

## Resumen

vits-en_us-kronk-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con su librería ONNX de TTS. El modelo original procede de russdill, concretamente de su colección kronk en la variante `en_US/kronk/medium`, y ha sido adaptado para funcionar dentro del ecosistema phoonnx, que lo ejecuta tanto en Python como en el asistente de voz OVOS.

El modelo resuelve la conversión de texto a audio en inglés estadounidense (en-US). Su entrada no es texto plano sin procesar, sino fonemas en alfabeto IPA generados por espeak-ng, lo que lo hace dependiente de ese fonemizador para una pronunciación correcta. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, lo que facilita su despliegue en entornos ligeros.

Es relevante para desarrolladores que necesitan un motor TTS local, de licencia permisiva (MIT) y de tamaño reducido, integrable en asistentes de voz, aplicaciones de accesibilidad o pipelines de generación de audio sin depender de servicios en la nube. Su encaje natural es el ecosistema OVOS/phoonnx, aunque al ser ONNX puede ejecutarse con otros runtimes compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un encoder de texto, un decoder generativo basado en flujo normalizador y un discriminador adversarial durante el entrenamiento, con alineamiento monotónico aprendido. Esta familia de modelos produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder externo separado. El modelo original fue desarrollado por russdill dentro de su colección kronk (variante medium para en_US); Phoonnx se limita a empaquetarlo para su librería.

No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus ni sobre si se aplicaron técnicas de RLHF o ajuste fino preferencial, ya que la model card no los detalla. La innovación práctica del empaquetado es la integración con el front-end de texto de phoonnx mediante scriptconv, que normaliza el texto y lo convierte a fonemas espeak-ng en alfabeto IPA antes de pasarlo al modelo. Cabe señalar que el uso del port espyak de espeak-ng puede provocar diferencias fonéticas y errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto.
- Entrada basada en fonemas IPA generados por espeak-ng (requiere espeak-ng o el port espyak).
- Normalización de texto previa mediante scriptconv.
- Generación de audio en formato WAV a través de la API de phoonnx (`synthesize_wav`).
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking, por tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS declarándolo en `mycroft.conf`, lo que permite dotar de voz a un asistente doméstico sin conexión a servicios externos.
- Aplicaciones de accesibilidad: lectura de texto en pantalla para personas con discapacidad visual, aprovechando la inferencia local y el reducido tamaño del modelo (0,1 GB).
- Generación de audio para contenidos educativos: síntesis de narraciones o material de aprendizaje de inglés en entornos donde no se desea enviar texto a la nube.
- Prototipado rápido de interfaces de voz: gracias a la instalación vía `pip install --pre phoonnx` y a la API de `TTSModelManager`, se puede integrar un motor TTS en pocas líneas de código Python.
- Síntesis en el navegador: phoonnx.js permite ejecutar el modelo en cliente, útil para demos interactivas o aplicaciones web que requieren privacidad del texto introducido.
- Pipelines de generación de audio por lotes: al ser ONNX y de pequeño tamaño, puede desplegarse en contenedores ligeros para producir clips de voz de forma programática.
- Sistemas embebidos o de bajos recursos: el formato ONNX y el tamaño reducido facilitan su ejecución en dispositivos con recursos limitados, siempre que se disponga de un runtime ONNX adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida y probablemente inferior a 1 GB en ejecución.
- GPU recomendadas: no se especifican; al ser un modelo pequeño en ONNX, puede ejecutarse en CPU y en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con unos pocos GB de VRAM, e incluso en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js (navegador); al ser ONNX, es compatible con runtimes ONNX Runtime, aunque la model card no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-en_us-kronk-espeak | VITS | en-US | MIT | ONNX | Fonemas IPA (espeak) |
| Otros modelos de la colección VITS de Phoonnx | VITS | Variable | Variable (según upstream) | ONNX | Fonemas o unicode |
| Modelos Piper | VITS (variantes) | Múltiples | MIT (habitual) | ONNX | Fonemas espeak |
| Modelos TTS comerciales en la nube | No disponible | Múltiples | Propietaria | API | Texto |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Requiere espeak-ng instalado o el port espyak; con espyak algunas palabras pueden pronunciarse incorrectamente por diferencias fonéticas.
- La calidad de síntesis depende del fonemizador y de la normalización de texto de scriptconv.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz, puede reflejar sesgos de pronunciación o prosodia del corpus original.
- Riesgo de alucinación en el sentido de pronunciaciones erróneas o prosodia incorrecta en textos no habituales (siglas, nombres propios, números).
- Licencia MIT, lo que permite uso comercial, pero la model card remite a los términos de la release upstream (russdill/kronk) para cuestiones de atribución.
- No se documentan parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- El número de descargas (20) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kronk-espeak
- Modelo upstream: https://huggingface.co/russdill/kronk/tree/main/en/en_US/kronk/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
