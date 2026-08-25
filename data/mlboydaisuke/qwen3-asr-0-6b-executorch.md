# mlboydaisuke/Qwen3-ASR-0.6B-ExecuTorch

## Resumen

Qwen3-ASR-0.6B-ExecuTorch es una conversión del modelo de reconocimiento automático del habla (ASR) Qwen3-ASR-0.6B de Alibaba al formato ExecuTorch con el backend XNNPACK, diseñada para inferencia en dispositivos sin GPU. El modelo original combina un codificador de audio estilo Whisper de 18 capas con un decodificador Qwen3 de 28 capas, y el paquete cuantizado ocupa 697,5 MB en un único archivo `.pte` con trece métodos de codificación de audio para ventanas de 2 a 30 segundos. La cuantización aplicada es int8 en la torre de audio, int4 en el decodificador e int8 en la tabla de tokens, logrando una reducción de 3757,2 MB a 697,5 MB sin pérdidas catastróficas de precisión (CER 0,0667 ignorando mayúsculas y puntuación final).

La relevancia de este modelo radica en que permite ejecutar ASR multilingüe (30 idiomas auto-detectados) completamente en local, en CPU, con un único archivo portable. El autor documenta con detalle el proceso de conversión, incluyendo la cuantización manual de la tabla de tokens (151936 × 1024) y la sensibilidad de la ventana de padding: rellenar el audio a la ventana completa degrada la transcripción en aproximadamente 7 de 15 clips de prueba, por lo que se incluyen trece métodos de codificador para minimizar el sobre-relleno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper (18 capas) + decodificador Qwen3 (28 capas) |
| Parametros totales | 782,4 millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | Ventana de audio de 2 a 30 segundos (métodos separados por ventana); secuencia de texto dinámica |
| Tipos de cuantizacion | int8 (torre de audio), int4 (decodificador), int8 (tabla de tokens) |
| Idiomas soportados | 30 idiomas con auto-deteccion (el modelo base soporta 52) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch, backend XNNPACK) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B combina un extractor de características mel (16 kHz mono, 128 bins, `n_fft` 400, hop 160) que produce 100 frames por segundo de audio, una torre de audio de 18 capas que genera una embedding por cada 77 ms (13 filas por segundo) y un decodificador Qwen3 de 28 capas que genera el texto autoregresivamente. El decodificador usa la misma arquitectura que Qwen3-Embedding-0.6B. El modelo emite una etiqueta de idioma (p. ej. `language Japanese`) antes del texto transcrito.

El proceso de conversión a ExecuTorch es notable: la cuantización se aplica de forma heterogénea (int8 en la torre, int4 en el decodificador, int8 en la tabla de tokens) porque el autor midió que la torre en int8 no altera ninguna transcripción en una ventana de 30 segundos, mientras que el decodificador concentra el peso y es donde int4 aporta mayor reducción. La tabla de tokens (151936 × 1024, 622 MB) aparece dos veces en el bundle (como embedding y como proyección de salida) y no se puede cuantizar con `quantize_` estándar porque los filtros Linear-only omiten `nn.Embedding`, por lo que se cuantizó a mano. El bundle incluye trece métodos de codificación de audio (ventanas de 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25 y 30 segundos) que comparten constantes, añadiendo solo 3,8 MB sobre el coste de un único método.

## Capacidades

- Reconocimiento de voz a texto (ASR) en 30 idiomas con auto-detección de idioma.
- Inferencia en dispositivo (on-device) mediante ExecuTorch con backend XNNPACK, sin necesidad de GPU ni servidor.
- Generación de la etiqueta de idioma antes de la transcripción.
- El modelo base soporta inferencia unificada streaming/offline y transcripción de audio largo; esta conversión hereda las capacidades del modelo base aunque la ejecución es por ventanas fijas.
- Integración con el chat template de Qwen3 mediante tokens `<|audio_pad|>`.

## Casos de uso

- Transcripción de voz en dispositivos móviles: el archivo `.pte` de 697,5 MB se puede integrar en aplicaciones Android/iOS para dictado o transcripción de notas de voz sin conexión, aprovechando el backend XNNPACK para CPUs ARM.
- Asistentes de voz embebidos: permite construir asistentes locales que transcriban comandos de voz en 30 idiomas sin enviar audio a la nube, con auto-detección de idioma.
- Subtitulado automático de vídeo: se puede usar en pipelines de postproducción para generar subtítulos en lote, seleccionando la ventana de audio ajustada a cada clip (2-30 s) para minimizar errores por relleno.
- Traducción y accesibilidad: transcripción de reuniones o clases en tiempo real con un dispositivo de bajo coste, ya que el modelo funciona en CPU y no requiere aceleradores.
- Investigación y desarrollo de ASR: el bundle incluye verificación de conversión y permite comparar el comportamiento cuantizado frente al fp32, útil para estudiar el efecto de la cuantización heterogénea en ASR multilingüe.
- Sistemas de dictado médico o jurídico: el modelo emite el idioma detectado antes del texto, lo que facilita la integración en flujos que requieren metadatos de idioma en la transcripción.

## Benchmarks y rendimiento

El autor publica resultados de verificación propios en la model card, no benchmarks estandarizados externos. Los datos disponibles son:

| Métrica | fp32 (no publicado) | 8da4w (cuantizado, este archivo) |
|---|---|---|
| CER peor (9 clips, japonés/portugués/ruso, ventanas 2-4 s) | 0.0000 | 0.1333 |
| CER ignorando mayúsculas y puntuación final | 0.0000 | 0.0667 |

Además, se midió el efecto del relleno de ventana en 15 clips en tres idiomas:

| Relleno | Transcripciones idénticas al pipeline con máscara |
|---|---|
| Ajustado (siguiente segundo completo) | 14 de 15 |
| Relleno a 5 s | 8 de 15 |
| Relleno a 10 s | 11 de 15 |
| Relleno a 30 s | 8 de 15 |

El bundle fp32 es exacto (9 de 9 clips idénticos al modelo eager), lo que valida la cirugía de grafo. El cuantizado difiere en 4 clips solo por capitalización y punto final, y en un clip por sustitución de carácter (停→泊, mismo lectura, carácter incorrecto).

## Requisitos de hardware

- El archivo `.pte` ocupa 697,5 MB en disco; en RAM, al cargarse, se estima un uso similar (no se publica el consumo exacto en memoria).
- Inferencia en CPU mediante backend XNNPACK: funciona en dispositivos móviles con ARM y en CPUs x86-64 sin GPU.
- No requiere GPU dedicada; el modelo está diseñado para ejecutarse en dispositivos de baja capacidad.
- Opciones de despliegue: integración directa con ExecuTorch runtime en aplicaciones nativas (Android/iOS), o mediante el runtime de ExecuTorch en Python para prototipado.
- Latencia: no se publican datos de latencia o throughput específicos para esta conversión. El modelo base Qwen3-ASR-0.6B alcanza un throughput de 2000 veces en concurrency de 128 según el repositorio oficial, pero ese dato corresponde al modelo eager, no a esta versión cuantizada.
- El modelo base Qwen3-ASR-0.6B alcanza 2000× throughput en concurrency de 128 según el repositorio oficial de Qwen3-ASR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento (CER) |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-ExecuTorch (este) | 782,4 M | Audio hasta 30 s | 30 | Apache 2.0 | `.pte` cuantizado | 0.0667 (ignorando mayúsculas) |
| Qwen3-ASR-0.6B (base) | 782,4 M | Audio largo (streaming) | 50 | Apache 2.0 | safetensors | no disponible en la info |
| Qwen3-ASR-1.7B (base) | 1,7 B | Audio largo (streaming) | 50 | Apache 2.0 | safetensors | SOTA entre open-source según el repo |
| Whisper small | 244 M | 30 s | ~100 | MIT | safetensors/GGUF | no comparable directamente |

El modelo base de 0.6B es una versión optimizada para eficiencia (trade-off accuracy/eficiencia), mientras que la 1.7B es la versión de máximo rendimiento. La conversión ExecuTorch se centra en despliegue on-device, no en rendimiento máximo.

## Limitaciones y advertencias

- Sensibilidad a la ventana de relleno: rellenar el audio a una ventana mayor que la duración real del clip degrada la transcripción (en las pruebas, de 14/15 clips correctos con relleno ajustado a 8/15 con relleno a 30 s). Se debe usar la ventana más pequeña que admita el clip.
- Errores de cuantización: el modelo cuantizado introduce diferencias sistemáticas (añade mayúsculas y punto final) y puede producir errores de carácter en japonés (sustituciones de kanji con mismo reading), como se observa en el clip de prueba.
- El modelo solo emite 30 idiomas auto-detectados, frente a los 50 del modelo base; no se documenta la lista exacta.
- La tabla de tokens se cuantiza manualmente y el bundle incluye dos copias de la misma (embedding y proyección de salida), lo que duplica el coste de memoria de esa parte.
- El archivo `.pte` no es compatible con bibliotecas estándar como `transformers`; requiere el runtime de ExecuTorch y el backend XNNPACK.
- No se publican datos de sesgos o alucinaciones específicos; como todo modelo ASR, puede producir errores en entornos ruidosos o con acentos no representados en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia (Apache 2.0 también, según el repositorio oficial de Qwen3-ASR).

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/mlboydaisuke/Qwen3-ASR-0.6B-ExecuTorch)
- [Repositorio oficial de Qwen3-ASR en GitHub](https://github.com/QwenLM/Qwen3-ASR)
- [Documentación de Transformers para Qwen3-ASR](https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr)
- [Modelo base en HuggingFace](https://huggingface.co/Qwen/Qwen3-ASR-0.6B)
- [Modelo Qwen3-Embedding-0.6B-ExecuTorch (misma familia)](https://huggingface.co/mlboydaisuke/Qwen3-Embedding-0.6B-ExecuTorch)
