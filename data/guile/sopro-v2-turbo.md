# Guile/sopro-v2-turbo

## Resumen

Sopro V2 Turbo es un modelo de texto a voz (TTS) ligero con clonación de voz, desarrollado por Samuel Vitorino y publicado bajo la organización Halo Research. Con 121 millones de parámetros, pertenece a la familia Sopro, cuyo nombre proviene de la palabra portuguesa para "soplo". El modelo está diseñado para ejecutarse en dispositivos locales, tanto en CPU como en navegador, y ofrece streaming con latencias de unos 300 ms hasta el primer audio. Soporta cuatro idiomas: inglés, portugués europeo, francés y alemán. Su relevancia radica en combinar un tamaño reducido con una inteligibilidad cercana a sistemas mucho más grandes, lo que lo convierte en una opción atractiva para aplicaciones de voz en tiempo real sin depender de infraestructura en la nube.

La arquitectura se aparta del transformer convencional y emplea convoluciones dilatadas (estilo WaveNet) junto con capas de atención cruzada ligera, según se indica en el repositorio. El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y soporte para exportación a ONNX, lo que facilita su integración en entornos de producción y en el navegador. Su diseño modular y su bajo coste computacional lo hacen adecuado para tareas de clonación de voz, síntesis multilingüe y generación de audio en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convoluciones dilatadas (estilo WaveNet) + capas de atención cruzada ligera (según repositorio; no se detalla la arquitectura completa) |
| Parametros totales | 121.574.193 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo TTS, no procesa texto de longitud arbitraria; segmenta texto largo) |
| Tipos de cuantizacion | int8 para pesos AR en CPU; cuantización adicional para el demo web/móvil |
| Idiomas soportados | Inglés, portugués europeo, francés, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; exportación a ONNX para navegador |

## Arquitectura y entrenamiento

La arquitectura de Sopro V2 Turbo se describe en el repositorio como una combinación de convoluciones dilatadas (inspiradas en WaveNet) y capas de atención cruzada ligera, en lugar de un transformer completo. Esta elección reduce el coste computacional y permite la inferencia en CPU con un factor de tiempo real (RTF) de 0.24 en modo offline y 0.21 en streaming sobre un chip M3 de Apple, y 0.07 en una GPU H100. El modelo emplea un vocoder causal para el streaming y atención por fragmentos, lo que posibilita la generación incremental de audio.

El entrenamiento se realizó sobre tres conjuntos de datos públicos: Emilia YODAS, LibriTTS-R y FalAR (este último para portugués europeo). No se menciona el uso de técnicas de RLHF ni DPO; el entrenamiento se centra en la síntesis supervisada. Tampoco se ha publicado el código de entrenamiento, que según el autor no será liberado en el corto plazo por su complejidad. El frontend de texto es deliberadamente minimalista, lo que afecta a la pronunciación de abreviaturas, números y símbolos, aunque el modelo maneja bien abreviaturas comunes como "CPU" o "TTS".

## Capacidades

- Síntesis de voz multilingüe: genera audio natural en inglés, portugués europeo, francés y alemán.
- Clonación de voz zero-shot: a partir de 5-20 segundos de audio de referencia, reproduce la voz del hablante sin entrenamiento adicional.
- Streaming en tiempo real: genera audio incrementalmente con una latencia de aproximadamente 300 ms hasta el primer fragmento en CPU de portátil.
- Ejecución en dispositivo: funciona en CPU de laptop (incluido macOS con MPS), GPU NVIDIA (CUDA) y navegador mediante ONNX Runtime.
- Control de parámetros de muestreo: expone temperatura, top-p y top-k para ajustar la variabilidad de la voz.
- Segmentación automática de texto largo: divide el texto en segmentos y los sintetiza de forma consecutiva, lo que permite generar audios de duración ilimitada.
- Preprocesado de referencia optimizable: permite precalcular la referencia de audio para reducir el tiempo hasta el primer audio en streaming.
- Soporte de lenguaje opcional: permite especificar el idioma (`--lang`) para mejorar la pronunciación en textos ambiguos.

## Casos de uso

- Asistentes de voz en aplicaciones móviles: gracias a su ejecución en dispositivo y a su baja latencia, Sopro V2 Turbo puede integrarse en asistentes personales que respondan por voz sin conexión, ofreciendo privacidad y respuesta inmediata.
- Audiobooks y narración de contenido: la clonación de voz permite generar audiolibros con una voz consistente a partir de una muestra corta, y la segmentación automática maneja textos extensos.
- Accesibilidad para personas con discapacidad visual: puede leer en voz alta el contenido de pantalla o documentos en los cuatro idiomas soportados, con calidad suficiente para uso cotidiano.
- Doblaje automático de vídeos: con la clonación de voz, se puede doblar contenido multilingüe manteniendo la voz original del hablante, reduciendo costes de producción.
- Chatbots con respuesta por voz: al combinarse con un LLM, el modelo puede convertir respuestas de texto en voz natural en tiempo real, mejorando la experiencia de atención al cliente.
- Prototipado rápido de productos de voz: su instalación simple (`pip install sopro`) y su interfaz CLI permiten a desarrolladores generar muestras de voz para demos o tests de concepto sin infraestructura compleja.
- Sistemas de navegación en vehículos: la baja latencia y el soporte multilingüe facilitan la integración en sistemas de infoentretenimiento que requieren respuestas de voz inmediatas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como MMLU, HumanEval o métricas de inteligibilidad tipo WER) en la información proporcionada. El autor menciona que el modelo alcanza "nivel SOTA en inteligibilidad" frente a sistemas más grandes, pero no se incluyen tablas comparativas ni valores numéricos. Tampoco se detallan métricas específicas como MOS (Mean Opinion Score) o CER. Por lo tanto, no se dispone de datos objetivos para comparar con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: funciona en portátiles modernos; el RTF es de 0.24 en modo offline y 0.21 en streaming sobre un chip M3 de Apple (8 núcleos). En CPU con int8, el rendimiento mejora.
- GPU NVIDIA: soporta CUDA; en una H100 el RTF baja a 0.07, lo que permite generación en tiempo real con margen.
- VRAM estimada: al ser un modelo de 121M parámetros, en FP32 ocuparía unos 486 MB; en int8 se reduce a unos 122 MB. No se proporciona el consumo exacto en VRAM, pero cabe en GPUs de consumo con 4 GB o más.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060); en H100 o A100 se obtiene el máximo rendimiento.
- Opciones de despliegue: librería Python (`sopro`), CLI (`soprotts`), servidor local con Gradio (puerto 7860), demo en navegador mediante ONNX Runtime, y soporte para exportación a ONNX.
- Latencia y throughput: tiempo hasta el primer audio de ~300 ms en CPU de portátil; RTF de 0.21-0.24 en CPU M3 y 0.07 en H100.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo se inspira en sistemas como CSM, F5-TTS, CosyVoice y Vocos, pero no se ofrecen tablas comparativas con métricas objetivas. Se puede destacar que Sopro V2 Turbo es significativamente más ligero que la mayoría de los TTS neuronales actuales (que suelen superar los 500M parámetros) y ofrece soporte nativo para portugués europeo, algo poco común. Sin embargo, sin benchmarks públicos no es posible realizar una comparación rigurosa.

## Limitaciones y advertencias

- No incluye watermarking: el autor declara explícitamente que no añade marcas de agua, ya que con un pipeline de inferencia abierto sería trivial eliminarlas. Esto implica un riesgo de uso malintencionado para suplantación de voz.
- Frontend de texto minimalista: abreviaturas, números y símbolos pueden pronunciarse incorrectamente. Se recomienda escribir "one plus two" en lugar de "1 + 2".
- Dificultad con texto mixto: palabras de un idioma dentro de una frase de otro (por ejemplo, un nombre de producto inglés en una frase portuguesa) pueden pronunciarse mal.
- Streaming no bit-exacto: la ruta de streaming (atención por fragmentos y vocoder causal) no produce exactamente el mismo audio que la ruta offline. Para máxima calidad se recomienda el modo offline.
- Código de entrenamiento no disponible: el autor no planea liberarlo, lo que limita la reproducibilidad y la personalización avanzada.
- Idiomas limitados: solo cuatro idiomas; no cubre español, italiano, japonés, etc.
- Riesgo de alucinación auditiva: como cualquier TTS, puede generar sonidos o entonaciones inesperadas en textos ambiguos, especialmente con el frontend minimalista.
- Compatibilidad del demo web: en dispositivos móviles el modelo se cuantiza, lo que puede degradar ligeramente la calidad, y dispositivos con poca memoria pueden fallar.

## Enlaces

- Repositorio HuggingFace (autor original): https://huggingface.co/samuel-vitorino/sopro-v2-turbo
- Repositorio HuggingFace (copia/alternativa): https://huggingface.co/Guile/sopro-v2-turbo
- Blog de investigación (Halo Research): https://research.haloneuro.ai/posts/sopro-v2
- Repositorio GitHub: https://github.com/samuel-vitorino/sopro
- Demo en navegador (ONNX): https://samuel-vitorino.github.io/sopro/
