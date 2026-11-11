# Nimruz/Nava-ggml

## Resumen

Nava-ggml es la conversión al formato GGML del modelo de reconocimiento automático de voz (ASR) Nava, desarrollado por Nimruz y especializado en persa (farsi). Está pensado para su uso con whisper.cpp, la implementación en C/C++ de la arquitectura Whisper de OpenAI, lo que permite ejecutar el modelo en CPU y en hardware modesto sin necesidad de un framework de deep learning completo. El repositorio incluye tres variantes de pesos con distintos niveles de cuantización (16-bit float, 8-bit y 5-bit), lo que facilita el despliegue en entornos con memoria limitada.

El modelo base es Nimruz/Nava, un ajuste fino de Whisper para transcripción de persa. La conversión mantiene el comportamiento del modelo original: los archivos se construyeron y probaron con whisper.cpp v1.7.4 y produjeron el mismo texto que el modelo original en 9 de 10 clips de prueba de FLEURS, con una diferencia de una o dos palabras en el décimo. Es relevante para desarrolladores que necesitan transcripción de persa en local, sin dependencias de GPU ni servicios en la nube.

La licencia MIT y el tamaño compacto de las variantes cuantizadas (desde 0.53 GB) lo hacen adecuado para aplicaciones de escritorio, sistemas embebidos y pipelines de procesamiento por lotes. La información sobre arquitectura, parámetros y datos de entrenamiento no está detallada en esta ficha, ya que la model card remite a la página del modelo principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder), convertido a GGML |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (característica de Whisper) |
| Tipos de cuantización | float16, q8_0 (8-bit), q5_0 (5-bit) |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | GGML (.bin) para whisper.cpp |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper, un transformer encoder-decoder diseñado para ASR, convertido al formato GGML para su ejecución con whisper.cpp. La model card no proporciona detalles sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF o DPO. El modelo base Nimruz/Nava fue ajustado específicamente para persa, con un prompt de idioma persa y sin tokens de timestamp, según las indicaciones de uso del autor.

La conversión a GGML no introduce innovaciones arquitectónicas propias; su valor está en la portabilidad y en la disponibilidad de tres tamaños de pesos que permiten equilibrar calidad y consumo de memoria. Los archivos fueron construidos y validados contra el modelo original con whisper.cpp v1.7.4, con una coincidencia casi total en las pruebas de FLEURS.

## Capacidades

- Transcripción de voz a texto en persa (farsi).
- Ejecución local en CPU mediante whisper.cpp, sin GPU.
- Tres niveles de cuantización para adaptarse a distintos presupuestos de memoria.
- Salida sin puntuación y con números escritos con letras (el repositorio principal incluye un formateador para convertir números, fechas y horas habladas a dígitos).
- Procesamiento de audio en segmentos de hasta 30 segundos, con necesidad de dividir audio más largo en puntos silenciosos.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa en local: el modelo puede procesar audio dividido en segmentos de 30 segundos y generar texto sin depender de servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Aplicaciones de escritorio de dictado en persa: la variante q5_0 (0.53 GB) permite integrar transcripción en tiempo casi real en equipos sin GPU, usando whisper.cpp como backend.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la variante float16 (1.51 GB) ofrece la máxima calidad de la conversión y puede ejecutarse en CPU con paralelismo moderado.
- Generación de subtítulos para contenido audiovisual en persa: el modelo transcribe voz y el formateador del repositorio principal convierte números hablados a dígitos para facilitar la revisión.
- Sistemas embebidos y dispositivos de bajo consumo: la cuantización q5_0 reduce el modelo a poco más de 0.5 GB, lo que permite desplegarlo en Raspberry Pi o dispositivos similares con whisper.cpp.
- Investigación en ASR para persa: al estar bajo licencia MIT y en formato GGML, sirve como base reproducible para experimentos de transcripción y comparación con otros modelos Whisper ajustados.
- Integración en pipelines de transcripción con preprocesado ffmpeg: el flujo documentado (convertir a WAV 16 kHz mono PCM) facilita la automatización en scripts y servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, en pruebas con 10 clips de FLEURS, cada archivo produjo el mismo texto que el modelo original en 9 de 10 clips, con una diferencia de una o dos palabras en el décimo.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; para GPU, no disponible.
- Tamaño en disco/memoria: 1.51 GB (float16), 0.81 GB (q8_0), 0.53 GB (q5_0).
- GPU recomendadas: no disponible; el modelo está pensado para whisper.cpp, que prioriza CPU.
- Cabe en GPU de consumo: no hay datos oficiales; por tamaño, las variantes cuantizadas podrían caber en GPUs con 2 GB o más de memoria, pero no está confirmado.
- Opciones de despliegue: whisper.cpp (versión probada v1.7.4) mediante el binario `whisper-cli`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| Nava-ggml | persa | GGML | MIT | 0.53–1.51 GB | Conversión para whisper.cpp |
| Whisper original (OpenAI) | multilingüe | varios | MIT | según variante | Base de la arquitectura; no ajustado específicamente a persa |
| Otros ajustes Whisper para persa | persa | varios | variable | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- El modelo solo soporta persa (fa); no es multilingüe.
- Es obligatorio pasar `-l fa -nt` en whisper.cpp; de lo contrario, el comportamiento puede diferir del esperado.
- El audio de más de 30 segundos debe dividirse en puntos silenciosos en segmentos de hasta 30 segundos; no se realiza automáticamente.
- La salida no incluye puntuación y escribe los números con letras; se requiere un formateador posterior para convertirlos a dígitos.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o vocabulario especializado, como en cualquier modelo ASR; no se documentan sesgos específicos.
- No se han publicado métricas de calidad (WER, CER) en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Nimruz/Nava y de Whisper original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nimruz/Nava-ggml
- Modelo base: https://huggingface.co/Nimruz/Nava
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
