# GreenBitAI/Drama-3-8bit-paged

## Resumen

Drama-3-8bit-paged es una compilación comunitaria del modelo de síntesis de voz (text-to-speech) Fish Audio Drama 3, publicada por GreenBitAI. Se trata de un modelo expresivo multihablante con capacidad de clonación de voz, empaquetado específicamente para gbx-lm, un servidor compatible con la API `/v1/audio/speech` de OpenAI que funciona sobre Apple Silicon. La compilación convierte a 8 bits las capas que el modelo original mantenía en bfloat16, logrando una mejora de velocidad de aproximadamente un 25 % sin degradación medible de la calidad de la voz.

El modelo cuenta con 3.179.093.120 parámetros y una arquitectura de mezcla de expertos (MoE), donde los expertos enrutados se almacenan en un fichero `experts.bin` con un registro por experto, lo que permite la paginación selectiva desde disco. Esta característica es clave: posibilita ejecutar el modelo en Macs con 32-48 GB de memoria, donde los expertos se transmiten desde el SSD cuando no caben en RAM, a costa de una velocidad inferior al tiempo real.

Su relevancia actual radica en que ofrece síntesis de voz de alta calidad en 89 idiomas sobre hardware de consumo Apple, con una API compatible con OpenAI y capacidad de streaming de audio con latencia inicial inferior a 0,3 segundos en máquinas de 64 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados en 8 bits |
| Parametros totales | 3.179.093.120 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (expertos enrutados y capas bfloat16 convertidas a 8 bits) |
| Idiomas soportados | 89 idiomas, entre ellos es, en, zh, ja, ko, fr, de, pt, ar, ru, it, hi, etc. |
| Licencia | fish-audio-community-license |
| Formato de pesos | safetensors y `experts.bin` (registros por experto), compatible con MLX |

## Arquitectura y entrenamiento

El modelo base Fish Audio Drama 3 emplea una arquitectura de mezcla de expertos (MoE) orientada a la síntesis de voz expresiva multihablante. GreenBitAI ha empaquetado los pesos para MLX, partiendo de la conversión `mlx-community/fish-audio-drama-3-8bit`, y ha cuantizado a 8 bits las capas que esta mantenía en bfloat16. Los expertos enrutados se almacenan en `experts.bin` con un registro por experto, lo que permite cargar únicamente los expertos necesarios en cada paso de decodificación.

La generación se divide en dos etapas: gbx-lm produce los códigos de audio del modelo y un paquete complementario, gbx-codecs, los convierte en sonido en un proceso separado que requiere solo `mlx` y `numpy` (sin PyTorch ni ffmpeg) y unos 3 GB de memoria durante la decodificación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz expresiva con marcadores de emoción y sonidos no verbales, como `[sighs]` o `[laughs]`.
- Multihablante: permite alternar voces dentro de una misma petición mediante etiquetas `<|speaker:0|>` y `<|speaker:1|>`.
- Clonación de voz a partir de una grabación limpia de 5-30 segundos en WAV (flac y mp3 con el extra `gbx-codecs[formats]`) acompañada de su transcripción exacta.
- Soporte de 89 idiomas, incluidos castellano, catalán, euskera y gallego.
- Streaming de audio en formato PCM (24 kHz, 16 bits, mono) o WAV.
- Control de la voz por semilla (`seed`) cuando no se especifica un perfil de voz.
- API compatible con OpenAI (`/v1/audio/speech`), integrable con el SDK oficial de OpenAI.
- Ejecución en Apple Silicon (MLX) y en Linux con GPU NVIDIA mediante la compilación CUDA de MLX (DGX Spark).

## Casos de uso

- Audiolibros y narración: el modelo puede narrar textos largos con una voz clonada a partir de una muestra de 5-30 segundos, manteniendo consistencia entre capítulos gracias al perfil de voz fijo y al control por semilla.
- Doblaje y localización de contenidos: con soporte de 89 idiomas y clonación de voz, permite generar versiones dobladas de un mismo material conservando el timbre del hablante original.
- Asistentes de voz en local: el servidor compatible con OpenAI permite sustituir el endpoint de TTS de una aplicación existente sin cambiar el código cliente, manteniendo los datos en la máquina.
- Generación de voces para videojuegos y animación: las etiquetas multihablante y los marcadores de emoción permiten producir diálogos con varios personajes y expresividad en una sola petición.
- Accesibilidad: conversión de texto a voz de alta calidad para lectores de pantalla y aplicaciones de asistencia, con streaming que reduce la latencia percibida.
- Prototipado de interfaces conversacionales: en un Mac de 32-48 GB se puede generar audio offline para pruebas y demos sin depender de servicios en la nube.
- Producción de pódcast y contenido breve: la latencia inicial inferior a 0,3 segundos en equipos de 64 GB o más permite flujos casi interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son de velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Throughput en M3 Ultra (64 GB o mas) | 56-58 fotogramas por segundo (2,6x tiempo real) |
| Latencia del primer audio (streaming) | menos de 0,3 s |
| Throughput en Mac Studio de 48 GB (expertos desde SSD) | hasta 3/4 de tiempo real |
| Throughput en MacBook Pro de 48 GB (expertos desde SSD) | aproximadamente 1/2 de tiempo real |
| Throughput en DGX Spark (modelo en memoria) | aproximadamente 1,4x tiempo real |

## Requisitos de hardware

- Memoria: 64 GB o más para tiempo real en Apple Silicon; 32 GB como mínimo para uso offline con paginación de expertos desde SSD.
- Disco: 40 GB (37 GiB) para los pesos del modelo.
- GPU recomendadas: Apple Silicon (M3 Ultra y superiores para tiempo real); DGX Spark u otra máquina Linux con GPU NVIDIA mediante MLX con CUDA 13.
- Cabe en GPU de consumo: no se proporcionan datos para GPUs de consumo tipo RTX 4090; el soporte documentado se limita a Apple Silicon y DGX Spark.
- Despliegue: gbx-lm v0.8.5 o superior (binario precompilado para darwin-arm64 y compilación Linux), con gbx-codecs en un entorno virtual propio (Python 3.10 o superior) para la decodificación de audio.
- Memoria adicional: unos 3 GB durante la decodificación del códec de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| Drama-3-8bit-paged (esta ficha) | 3.179.093.120 | 89 | fish-audio-community-license | Apple Silicon, DGX Spark | Cuantizado a 8 bits, paginación de expertos |
| fishaudio/drama-3 (base) | no disponible | 89 | fish-audio-community-license | no disponible | Modelo original sin cuantizar |
| mlx-community/fish-audio-drama-3-8bit | no disponible | 89 | fish-audio-community-license | Apple Silicon | Expertos enrutados en 8 bits, capas bfloat16 sin convertir |

## Limitaciones y advertencias

- La licencia fish-audio-community-license impone restricciones; es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- Es una compilación comunitaria de GreenBitAI, no oficial de Fish Audio, que no la patrocina ni la respalda.
- Solo se deben utilizar voces sobre las que se tenga derecho de uso; la clonación de voz plantea riesgos de suplantación y requiere consentimiento.
- En equipos de 32-48 GB la generación es más lenta que el tiempo real, por lo que el flujo recomendado es generar el fichero y reproducirlo después.
- La paginación de expertos desde SSD introduce dependencia del rendimiento del almacenamiento y aumenta la latencia.
- No se dispone de información sobre sesgos, tasas de alucinación ni límites de contexto en la documentación proporcionada.
- La instalación requiere mantener una única versión de gbx-lm; cambiar de versión sin limpiar el directorio de caché provoca fallos de ejecución en macOS.
- No hay datos publicados de benchmarks de calidad de voz que permitan comparar objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenBitAI/Drama-3-8bit-paged
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Conversión MLX de referencia: https://huggingface.co/mlx-community/fish-audio-drama-3-8bit
- Repositorio gbx-lm: https://github.com/GreenBitAI/gbx-lm
- Paquete de códecs gbx-codecs: https://github.com/GreenBitAI/gbx-codecs
