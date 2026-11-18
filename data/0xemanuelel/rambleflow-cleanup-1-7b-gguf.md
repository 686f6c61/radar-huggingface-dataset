# 0xemanuelel/rambleflow-cleanup-1.7b-gguf

## Resumen

RambleFlow cleanup 1.7B es un modelo de limpieza de transcripciones de dictado, derivado mediante fine-tuning de Qwen3-1.7B. Lo desarrolla 0xemanuelel como componente interno de RambleFlow, una aplicación de dictado por voz local para macOS. Su función es convertir una transcripción cruda de reconocimiento de voz en texto limpio: corrige puntuación, mayúsculas y arranques falsos, manteniendo las palabras y el significado originales.

El modelo no es un asistente conversacional ni sigue instrucciones contenidas en el texto dictado; está especializado en una tarea acotada de reescritura. Se distribuye únicamente en formato GGUF cuantizado a 4 bits (1.054.423.616 bytes) y está pensado para ejecutarse en el dispositivo del usuario mediante llama.cpp a través del SDK QVAC.

Con 1.720.574.976 parámetros y licencia Apache 2.0 heredada de Qwen3, es relevante para desarrolladores que necesiten un modelo pequeño, desplegable en local y con baja latencia (mediana de 308 ms en Apple silicon según el autor) para posprocesar salidas de ASR sin enviar datos a la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B; detalles internos no disponibles) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens (contexto de entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | Q4 (único archivo publicado: `literal192-q4.gguf`) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso, y se ha adaptado mediante dos rondas de fine-tuning con LoRA (rango 16, alpha 32, una época, learning rate pico 1e-5 con schedule coseno, contexto de 768 tokens). Ambas rondas se ejecutaron en local con el SDK QVAC sobre un Mac mini con Apple silicon. Los adaptadores se fusionaron en los pesos base y el resultado se cuantizó a 4 bits.

La primera ronda, Broad1291, usó 1.291 conversaciones: 336 ejemplos de control de ejecuciones anteriores, 803 situaciones sintéticas de dictado revisadas, 128 mensajes largos del dataset público Sotto transcript cleanup (MIT) y 24 ejemplos donde la entrada limpia debe permanecer inalterada. La segunda ronda, Literal192, añadió 192 conversaciones centradas en preservar detalles exactos (nombres, números, correcciones, negaciones). Parte de los ejemplos de control podrían derivar de phonon-synthetic-tts de Elliot Arledge (CC BY 4.0). Los datos de entrenamiento combinan texto sintético revisado, ejemplos públicos y dictado propio del autor en inglés con acento italiano.

## Capacidades

- Limpieza de transcripciones de dictado en inglés: puntuación, mayúsculas y eliminación de arranques falsos.
- Cuatro modos de escritura definidos por la aplicación: minimal, casual, formal y prompt.
- Preservación de detalles exactos: nombres, números, correcciones y negaciones del hablante.
- Mantenimiento del texto limpio sin alteraciones cuando la entrada ya es correcta.
- Ejecución en dispositivo mediante llama.cpp y el SDK QVAC.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un asistente conversacional: no responde preguntas ni sigue instrucciones embebidas en el texto.
- Sin capacidades de visión ni audio (opera sobre texto ya transcrito).

## Casos de uso

- Dictado por voz en macOS: integrado en RambleFlow, recibe la salida del ASR y devuelve texto con puntuación y mayúsculas correctas, ejecutándose íntegramente en el Mac del usuario.
- Posprocesado de pipelines ASR propios: puede insertarse como etapa de limpieza tras Whisper u otro motor de reconocimiento, con la ventaja de que el modelo es pequeño y no requiere GPU dedicada.
- Aplicaciones de notas por voz: convierte transcripciones de reuniones o ideas dictadas en texto legible, preservando nombres y cifras relevantes.
- Redacción asistida por voz en entornos con requisitos de privacidad: al no enviar datos a la nube, encaja en flujos donde las transcripciones no pueden salir del dispositivo.
- Corrección de mensajes largos dictados: el entrenamiento con ejemplos de mensajes largos del dataset Sotto lo orienta a limpiar textos extensos con múltiples detalles exactos.
- Selección de registro por modo: los modos minimal, casual, formal y prompt permiten adaptar la salida a distintos contextos de escritura (notas rápidas, correos, instrucciones).
- Prototipado de asistentes de voz locales: sirve como componente de limpieza en aplicaciones de voz sobre llama.cpp sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente evaluaciones internas de desarrollo:

| Métrica | Resultado |
|---|---|
| Coincidencia Q4 vs. no cuantizado (40 transcripciones fijas) | 37 de 40 idénticas; 3 difieren solo en una contracción o puntuación |
| Tiempo mediano de limpieza (Apple silicon) | 569 ms (precisión completa) → 308 ms (Q4) |
| Comparación ciega (648 casos de desarrollo) | Errores que cambian el significado similares a versiones anteriores y al modelo de referencia; más errores en mensajes largos con muchos detalles exactos |

## Requisitos de hardware

- VRAM estimada: no especificada por el autor; el archivo Q4 ocupa 1.054.423.616 bytes (aproximadamente 1 GB), por lo que la inferencia cabe holgadamente en GPUs consumer con 4 GB o más.
- GPU recomendadas: no disponibles en la información proporcionada. El desarrollo y la evaluación se realizaron en Apple silicon (Mac mini).
- Cabe en GPU consumer: sí, dado el tamaño del archivo Q4; cualquier GPU con al menos 2-4 GB de memoria libre debería poder cargarlo.
- Opciones de despliegue: llama.cpp (runtime oficial a través del SDK QVAC); otros runtimes compatibles con GGUF no se mencionan en la información disponible.
- Latencia y throughput: mediana de 308 ms por limpieza en Apple silicon con el archivo Q4. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| RambleFlow cleanup 1.7B | 1,72 B | 768 (entrenamiento) | GGUF Q4 | Apache 2.0 | Limpieza de dictado en inglés |
| Qwen3-1.7B (base) | 1,72 B | No disponible en la información proporcionada | Safetensors, GGUF | Apache 2.0 | Modelo generalista |
| Sotto transcript cleanup (dataset) | No aplica | No aplica | Dataset | MIT | Datos de limpieza de transcripciones |

No se dispone de datos de rendimiento comparativo con otros modelos de limpieza de transcripciones en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; otros idiomas no han sido probados.
- Puede ocasionalmente omitir o alterar un detalle: un número, una ubicación o una corrección del hablante. RambleFlow conserva la transcripción cruda como respaldo, pero no detecta todos los casos.
- Entradas muy largas o inusuales pueden provocar paradas tempranas; la aplicación inserta entonces la transcripción original.
- El archivo Q4 no ha pasado la misma evaluación de calidad completa que el modelo en precisión completa.
- No es un asistente: no debe usarse para responder preguntas ni para ejecutar instrucciones contenidas en el texto dictado.
- El contexto de entrenamiento es de 768 tokens; entradas más largas pueden degradar la calidad.
- Los datos de entrenamiento incluyen ejemplos sintéticos y dictado del autor con acento italiano, lo que puede introducir sesgos de estilo o de variedad de inglés.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones de Qwen3; conviene revisar el archivo LICENSE del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xemanuelel/rambleflow-cleanup-1.7b-gguf
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Conversión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/tree/d7f544eead698dbd1f15126ef60b45a1e1933222
- Repositorio RambleFlow: https://github.com/Emanuelel/RambleFlow
- SDK QVAC: https://github.com/tetherto/qvac
- Dataset Sotto transcript cleanup: https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup/tree/183cc8fd58532f13fa192980185214de1bcd5acc
- Dataset phonon-synthetic-tts: https://huggingface.co/datasets/Infatoshi/phonon-synthetic-tts/tree/6be46a8affae311b09d052157596b2db7a4488ec
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
