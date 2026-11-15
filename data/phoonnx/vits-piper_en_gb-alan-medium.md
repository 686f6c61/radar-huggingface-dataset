# Phoonnx/vits-piper_en_GB-alan-medium

## Resumen

`vits-piper_en_GB-alan-medium` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado de una voz Piper originalmente publicada en el repositorio `rhasspy/piper-voices` y redistribuida por el usuario Phoonnx dentro del agregador `Phoonnx/phoonnx-vits`. El modelo implementa la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema neuronal end-to-end que transforma texto en forma de onda de audio sin necesidad de un vocoder separado. La variante concreta corresponde a una voz masculina de inglés británico (`en_GB-alan`), de calidad "medium" según la nomenclatura de Piper.

El modelo se distribuye como un único artefacto ONNX dentro de un repositorio de aproximadamente 0,1 GB, pensado para su uso con la librería `phoonnx`, un runtime de inferencia TTS ligero orientado a ejecución local y en dispositivos con recursos limitados. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un componente especializado de conversión texto-a-voz, con un alcance funcional acotado a la síntesis de una única voz en un único idioma.

Su relevancia radica en la posibilidad de ejecutar TTS de calidad razonable en CPU sin dependencias pesadas, lo que lo hace útil para asistentes locales, sistemas de accesibilidad y pipelines de generación de audio por lotes. La licencia declarada en el repositorio es MIT, aunque la model card advierte que las licencias de las voces originales siguen las de los subdirectorios de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal con generador adversario y flujo normalizador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; el runtime puede aplicar optimizaciones propias) |
| Idiomas soportados | ingles britanico (`en_GB`) |
| Licencia | MIT (segun el repositorio; la model card remite a las licencias de los subdirectorios de origen) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un flujo normalizador condicionado por un prior variacional, un decodificador generativo basado en HiFi-GAN y un discriminador multiperiodo entrenado de forma adversaria. La inferencia produce directamente la forma de onda, evitando el pipeline clásico de dos etapas (modelo acústico + vocoder). La variante "medium" de Piper corresponde a una configuración de tamaño intermedio, pensada para equilibrar calidad y velocidad en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de ajuste fino con RLHF o DPO; estos datos no están publicados en la información proporcionada. La voz `en_GB-alan` procede de las voces Piper originales, entrenadas por el proyecto Rhasspy, y este repositorio se limita a redistribuir el artefacto ONNX con los mismos nombres de fichero y rutas del repositorio fuente.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico, con una única voz masculina identificada como `alan`.
- Generación de audio de calidad "medium" según la taxonomía de Piper, adecuada para lectura de texto y asistentes.
- Inferencia sobre ONNX, lo que permite ejecución en CPU sin GPU dedicada.
- Integración directa con el runtime `phoonnx` mediante el identificador de voz `piper/en_GB-alan-medium`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo "thinking", visión, audio de entrada ni capacidades multimodales.
- Multilingüismo limitado a la variante `en_GB`; no se declaran otros idiomas.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo convierte texto plano en audio en tiempo real sobre CPU, lo que permite integrarlo en lectores de pantalla y herramientas de síntesis local sin depender de servicios en la nube.
- Asistentes de voz locales: al ejecutarse como ONNX con `phoonnx`, puede incrustarse en dispositivos domésticos o embebidos para respuestas habladas en inglés británico sin conexión a internet.
- Generación de audio por lotes para podcasts o audiolibros: la naturaleza determinista y ligera del modelo permite sintetizar grandes volúmenes de texto en pipelines automatizados.
- Pruebas de regresión en pipelines de TTS: sirve como voz de referencia estable para validar cambios en el front-end de normalización de texto o en el runtime de inferencia.
- Prototipado de interfaces conversacionales: al ser un artefacto pequeño (0,1 GB), se puede incluir en entornos de desarrollo y contenedores sin inflar la imagen.
- Sistemas de anuncios y notificaciones: la voz `en_GB-alan` resulta adecuada para mensajes cortos en aplicaciones de productividad, domótica o transporte, donde se requiere baja latencia y un timbre consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base, ya que el modelo está pensado para ejecución en CPU; en GPU el consumo sería mínimo (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una GPU dedicada. Para despliegues en GPU se puede usar CUDA con el runtime ONNX Runtime.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: `phoonnx` (runtime nativo del modelo), ONNX Runtime, y potencialmente otros runners compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vits-piper_en_GB-alan-medium` (este) | VITS | en_GB | ONNX | MIT (con reservas por subdirectorio) | Hugging Face, 0 descargas |
| Otras voces Piper `en_GB` (p. ej. `en_GB-alba-medium`, `en_GB-northern_english_male-medium`) | VITS | en_GB | ONNX | MIT / otras según origen | Hugging Face (rhasspy/piper-voices) |
| Coqui TTS (modelos VITS) | VITS | multiidioma | PyTorch / ONNX | MPL 2.0 / otras | GitHub, Hugging Face |
| Kokoro TTS | StyleTTS2 + ISTFTNet | en, y otros | ONNX / PyTorch | Apache 2.0 | Hugging Face |

La comparación con alternativas se limita a la categoría de TTS ligero; no se dispone de datos de rendimiento cuantitativos para este modelo concreto que permitan una comparación objetiva.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma: no permite cambiar de hablante ni de acento sin recurrir a otro artefacto.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o en siglas, dependiendo del front-end de normalización de texto que use `phoonnx`.
- No se han publicado métricas objetivas (MOS, WER, RTF) en la información disponible, por lo que la calidad real debe validarse empíricamente.
- La licencia MIT declarada en el repositorio puede no cubrir todos los componentes originales: la model card advierte que las licencias siguen las de los subdirectorios de origen, y algunas voces del agregador `phoonnx-vits` se marcan como `license: other`. Conviene revisar el README del directorio fuente antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere que es una redistribución reciente y poco validada por la comunidad; no hay garantías de mantenimiento.
- No apto para tareas de razonamiento, generación de texto, código o matemáticas: es exclusivamente un modelo TTS.
- Posibles sesgos acústicos derivados del corpus de entrenamiento original de Piper (registro, edad y estilo del hablante), no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_GB-alan-medium
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Voces Piper originales: https://huggingface.co/rhasspy/piper-voices
- Proyecto Piper (Rhasspy): https://github.com/rhasspy/piper
