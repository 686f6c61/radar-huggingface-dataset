# Phoonnx/vits-en_GB-alba-medium

## Resumen

vits-en_GB-alba-medium es un modelo de síntesis de voz (text-to-speech) en formato ONNX, distribuido por Phoonnx como una extracción del repositorio paraguas Phoonnx/phoonnx-vits. Se corresponde con la voz `en_GB-alba-medium` del proyecto Piper (basado en espeak), un sistema TTS ligero orientado a inferencia en tiempo real sobre CPU. El modelo emplea la arquitectura VITS, un modelo generativo end-to-end que combina un codificador de texto, un prior variacional y un decodificador basado en flujos y HiFi-GAN para producir audio de forma directa a partir de fonemas.

El modelo no introduce innovaciones propias: es un espejo de los pesos originales de `rhasspy/piper-voices`, reempaquetado para la librería `phoonnx` (un runtime ONNX para TTS desarrollado por TigreGotico). Su relevancia práctica radica en que ofrece una voz británica de calidad media en un paquete ONNX de aproximadamente 0,1 GB, lo que permite desplegarla en entornos con recursos limitados, sin GPU y con latencias bajas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es mínima: no documenta parámetros, contexto, idiomas ni benchmarks. La información disponible se limita a la licencia MIT heredada del repositorio fuente y a la identificación de la voz.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS: codificador de texto, prior variacional, flujos normalizadores y decodificador HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es texto o fonemas, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | inglés británico (en_GB), según el identificador de la voz |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, presentada en el artículo *Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech* (Kim et al., 2021). VITS combina un codificador de texto con un prior condicional, un conjunto de flujos normalizadores que modelan la variabilidad prosódica y un decodificador generativo de tipo HiFi-GAN que produce la forma de onda directamente, sin necesidad de un vocoder separado. El entrenamiento es adversario y de extremo a extremo, con una pérdida de reconstrucción sobre el espectrograma y discriminadores múltiples.

La variante `medium` de Piper corresponde a un compromiso entre calidad y tamaño: los modelos Piper se distribuyen en calidades `low`, `medium` y `high`, siendo `medium` la opción habitual para síntesis en CPU con latencia aceptable. El modelo se sirve de espeak-ng para la fonemización del texto de entrada, y el identificador `en_GB-alba` indica una voz femenina de inglés británico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o ajuste fino adicional; la model card no los documenta y el repositorio fuente tampoco los detalla en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico, con salida de audio en formato de onda.
- Fonemización mediante espeak-ng, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Inferencia en CPU gracias al formato ONNX y al tamaño reducido del modelo (repo de 0,1 GB), sin necesidad de GPU.
- Integración con el runtime `phoonnx`, que carga los pesos ONNX y gestiona el pipeline de texto a audio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente generativo de audio.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés británico; no se documentan otras lenguas en esta voz.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo convierte texto plano en audio con una voz británica natural, y su tamaño reducido permite ejecutarlo localmente en dispositivos de gama baja sin depender de servicios en la nube.
- Asistentes de voz embebidos: al ser un modelo ONNX ligero, puede integrarse en aplicaciones de escritorio o móviles para respuestas habladas en tiempo real, con latencias compatibles con interacción conversacional.
- Generación de audiolibros y pódcasts automatizados: la voz `en_GB-alba` ofrece una locución femenina consistente, adecuada para narración de larga duración por lotes.
- Sistemas de navegación y avisos por voz: la baja latencia de los modelos Piper medium permite sintetizar instrucciones cortas de forma inmediata en entornos con CPU limitada.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado para `phoonnx`, sirve como voz de referencia para validar integraciones antes de migrar a voces de mayor calidad.
- Educación y aprendizaje de idiomas: la pronunciación británica controlada mediante fonemas permite generar ejemplos de pronunciación para materiales didácticos.
- Automatización de atención al cliente con respuestas de voz: se puede encadenar con un LLM que genere el texto y usar este modelo para la síntesis final, siempre que el idioma de salida sea inglés británico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso típico; el modelo está pensado para CPU. En caso de ejecutarse en GPU, el consumo sería inferior a 1 GB por el tamaño del repositorio (0,1 GB).
- GPU recomendadas: no se requieren; cualquier GPU con soporte ONNX Runtime puede ejecutarlo, pero no aporta ventajas significativas frente a CPU para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque el despliegue habitual es en CPU.
- Opciones de despliegue: runtime `phoonnx` (ONNX), ONNX Runtime, y en general cualquier motor compatible con modelos ONNX. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; los modelos Piper medium se caracterizan por síntesis en tiempo real o por debajo en CPU moderna, pero no se aportan cifras concretas para esta voz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / tamaño |
|---|---|---|---|---|---|
| Phoonnx/vits-en_GB-alba-medium | VITS | en_GB | ONNX | MIT | repo 0,1 GB |
| rhasspy/piper-voices (en_GB-alba-medium) | VITS | en_GB | ONNX | MIT | mismo modelo fuente |
| Otras voces Piper medium (p. ej. en_US-lessac-medium) | VITS | en_US | ONNX | MIT | calidad y tamaño comparables |
| Coqui TTS (modelos VITS) | VITS | varios | PyTorch / ONNX | según modelo (a menudo MPL o CC-BY) | mayor tamaño y requisitos |

La comparación directa con modelos de lenguaje no procede: se trata de un modelo TTS y las alternativas naturales son otras voces Piper o modelos VITS de Coqui. No se dispone de datos de benchmarks para comparar calidad objetiva (MOS, WER de transcripción) entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima y no documenta parámetros, datos de entrenamiento ni evaluación; la trazabilidad técnica es limitada.
- El modelo está restringido al inglés británico; no se debe esperar soporte de otros idiomas o acentos.
- Al ser una voz Piper basada en espeak, la prosodia y naturalidad son inferiores a las de modelos TTS neuronales de mayor tamaño; puede presentar artefactos en textos complejos, siglas o nombres propios.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o con grafías ambiguas; la fonemización con espeak-ng puede requerir ajustes manuales.
- No se documentan sesgos de género, acento o estilo más allá de la identidad de la voz `alba` (femenina, británica).
- Licencia MIT heredada del repositorio fuente, lo que permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento originales de Piper, no detallados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-14; no hay evidencia de mantenimiento ni de comunidad que lo respalde.
- No apto para tareas de comprensión de audio, razonamiento o generación de texto: es exclusivamente un sintetizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_GB-alba-medium
- Repositorio paraguas: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Voces Piper originales: https://huggingface.co/rhasspy/piper-voices
- Artículo VITS: https://arxiv.org/abs/2106.06103
