# Prahaladha/hima-tts-nano-hi-ONNX

## Resumen

hima-tts-nano-hi-ONNX es la conversión a formato ONNX de hima-tts-nano-hi, un modelo de síntesis de voz (text-to-speech) en hindi de tan solo 62 millones de parámetros, desarrollado por el usuario Prahaladha. El objetivo del modelo es ofrecer síntesis de voz inteligible y rápida en CPU convencional, sin necesidad de GPU ni de PyTorch en tiempo de inferencia, lo que lo hace adecuado para despliegues ligeros en Windows, Linux y macOS.

La versión ONNX mantiene las mismas voces y calidad sonora que el modelo original en PyTorch, pero incluye grafos optimizados en precisión fp32 e int8. Según el autor, la variante int8 es más pequeña y rápida, con una tasa de error de lectura de letras equivalente a la de fp32 en sus pruebas (1,2 % en 12 frases de test). El modelo genera audio float32 a 24 kHz y permite elegir entre seis voces integradas (tres femeninas y tres masculinas) o generar una voz aleatoria.

El modelo es relevante para desarrolladores que necesitan integrar TTS en hindi en aplicaciones locales o de borde con recursos limitados, donde el coste de una GPU o de un runtime de PyTorch no es viable. Su tamaño de repositorio (0,6 GB) y su licencia "other" (no estándar) son factores a considerar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; detalles de arquitectura no publicados en la información disponible) |
| Parámetros totales | 62 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 e int8 (grafos ONNX separados) |
| Idiomas soportados | hindi (hi), inglés (en) |
| Licencia | other (licencia no estándar; consultar términos del autor) |
| Formato de pesos | ONNX (grafos), safetensors (prefix.safetensors, voices.safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo TTS neuronal de 62 millones de parámetros, cuyo funcionamiento se articula en varios grafos ONNX: `onnx/base/` y `onnx/voices/` contienen el modelo en fp32 e int8, `onnx/decoder.onnx` convierte la salida del modelo en audio, y `prefix.safetensors` almacena los pesos previos a los grafos. El tokenizador de texto se distribuye como `tokenizer.model` y la configuración de muestreo en `config.yaml`.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base (hima-tts-nano-hi) está disponible en PyTorch y cuenta con versiones ONNX y MLX; la conversión a ONNX es la innovación principal de esta ficha, orientada a eliminar la dependencia de PyTorch y acelerar la inferencia en CPU. El repositorio incluye un módulo `text/` que convierte números, fechas y cantidades a palabras, lo que mejora la naturalidad en la lectura de textos con cifras.

## Capacidades

- Síntesis de voz (text-to-speech) en hindi, con salida de audio float32 a 24 kHz.
- Seis voces integradas: Meera, Sneha y Nandini (femeninas); Siddharth, Ishaan y Nikhil (masculinos).
- Generación de voz aleatoria si no se especifica ninguna voz; posibilidad de fijar semilla (`seed=`) para obtener tomas reproducibles.
- Clonación de voz a partir de una grabación: requiere ejecutar una vez el repositorio principal en PyTorch (`python -m hima_tts --save-voice me.safetensors --from me.wav`) y luego usar el fichero resultante con `voice_file=`.
- Normalización de texto: conversión de números, fechas y cantidades a palabras mediante el módulo `text/`.
- Inferencia en CPU sin PyTorch, en Windows, Linux y macOS.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente TTS.

## Casos de uso

- Lectura de noticias y artículos en hindi: el modelo convierte texto plano en audio a 24 kHz con velocidad superior al tiempo real (12x en fp32, 17x en int8 sobre un Apple M4 Pro con 4 hilos), lo que permite generar boletines completos en segundos en un portátil.
- Asistentes de voz locales para aplicaciones de escritorio: al no requerir PyTorch ni GPU, puede integrarse en aplicaciones Windows, Linux o macOS que necesiten respuestas habladas en hindi sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura de documentos y contenidos digitales en hindi con las seis voces disponibles, permitiendo seleccionar una voz concreta según preferencia del usuario.
- Generación de audiolibros y pódcast: la posibilidad de fijar una semilla (`seed=`) garantiza tomas reproducibles y consistentes entre sesiones, útil para narrar capítulos largos con la misma voz.
- Sistemas de anuncios y avisos automatizados: integración en paneles de información pública o transporte que necesiten mensajes hablados en hindi con bajo coste computacional y despliegue en hardware modesto.
- Prototipado de interfaces conversacionales: el modelo permite generar respuestas de voz en hindi durante el desarrollo de asistentes, con la opción de clonar una voz propia a partir de una grabación para pruebas de concepto.
- Localización de contenidos educativos: conversión de material didáctico en hindi a formato audio para su distribución en dispositivos de bajo consumo.

## Benchmarks y rendimiento

| Métrica | fp32 | int8 | Referencia (PyTorch, misma CPU) |
|---|---|---|---|
| Velocidad en Apple M4 Pro (4 hilos) | 12x tiempo real | 17x tiempo real | 6x tiempo real |
| Tasa de error de lectura de letras (12 frases de test) | 1,2 % | 1,2 % | no disponible |

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU, etc.) en la información disponible. Los únicos datos de rendimiento son los proporcionados por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. El repositorio ocupa 0,6 GB, por lo que la RAM necesaria es del orden de unos pocos cientos de MB según la precisión.
- GPU recomendadas: no son necesarias; el modelo no está pensado para GPU. No se han publicado requisitos de VRAM para una hipotética ejecución en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal; el modelo funciona en CPU de portátil y escritorio.
- Opciones de despliegue: el paquete incluye el módulo Python `hima_onnx` con la clase `OnnxTTS`; se instala con `pip install -U huggingface_hub` y `pip install -r requirements.txt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: 12x tiempo real en fp32 y 17x en int8 sobre un Apple M4 Pro con 4 hilos; el modelo base en PyTorch alcanza 6x en la misma CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos TTS ligeros para hindi con despliegue en CPU y formato ONNX no están documentados en la información disponible, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| hima-tts-nano-hi-ONNX | 62 M | no disponible | other | ONNX, safetensors | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es "other" (no estándar); es imprescindible revisar los términos del autor antes de cualquier uso comercial, ya que no se especifican restricciones ni permisos concretos.
- El modelo está orientado principalmente al hindi; aunque la etiqueta de idiomas incluye inglés, no se detalla el nivel de calidad en inglés ni si el modelo está entrenado para ello.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en dominios específicos; al ser un modelo TTS, el riesgo principal es la mala pronunciación o entonación en textos complejos, no la generación de contenido falso.
- La clonación de voz requiere ejecutar el repositorio principal en PyTorch al menos una vez, lo que rompe la promesa de "sin PyTorch" para ese flujo concreto.
- La tasa de error de lectura de letras es del 1,2 % en las pruebas del autor (12 frases), una muestra pequeña que no permite extrapolar la calidad a otros dominios.
- No se documentan limitaciones de longitud de texto de entrada ni de contexto; se desconoce el comportamiento con textos muy largos.
- El modelo tiene solo 19 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- No hay información sobre el proceso de entrenamiento ni sobre la procedencia de los datos, lo que dificulta evaluar riesgos de sesgo o de derechos sobre las voces clonadas.

## Enlaces

- Hugging Face (ONNX): https://huggingface.co/Prahaladha/hima-tts-nano-hi-ONNX
- Hugging Face (modelo base en PyTorch): https://huggingface.co/Prahaladha/hima-tts-nano-hi
