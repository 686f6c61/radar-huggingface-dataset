# Serkali-sudo/Pocket-TTS-LiteRT-FP16

## Resumen

Pocket TTS LiteRT FP16 es una exportación del modelo de síntesis de voz con clonación de voz Pocket TTS, desarrollado originalmente por Kyutai, al formato LiteRT (antes TensorFlow Lite) para inferencia en dispositivo. El repositorio, publicado por el usuario Serkali-sudo, agrupa 22 packs de modelos que cubren 26 idiomas y permite sintetizar voz condicionada a un WAV de referencia corto, con salida de audio mono a 24 kHz.

El problema que resuelve es el despliegue de un sistema TTS con clonación de voz en entornos sin GPU dedicada o en dispositivos móviles y embebidos, gracias a la conversión a grafos `.tflite` con pesos en FP16 e entradas y salidas en FP32. La exportación se basa en el exportador de john-rocky y se valida sobre LiteRT CPU.

La relevancia actual radica en la combinación de cobertura multilingüe amplia (incluyendo lenguas con pocos recursos como wolof, galés o gujarati), clonación de voz zero-shot a partir de una referencia y un formato de despliegue ligero. El repositorio ocupa 5,9 GB e incluye cuatro grafos por pack (codificación de audio de referencia, generación autorregresiva y dos etapas de decodificación Mimi), además del tokenizador y los pesos auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) exportado a LiteRT; codec Mimi con dos etapas de decodificación; generación autorregresiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en FP16, entradas y salidas en FP32 |
| Idiomas soportados | 26: en, fr, de, it, pt, es, nl, cs, et, el, gu, id, ja, ko, zh, fa, pl, tr, cy, wo, hi, mr, kn, ta, ml, te |
| Licencia | no disponible (cada pack remite a la licencia de su checkpoint original) |
| Formato de pesos | `.tflite` (LiteRT), con tokenizador y pesos auxiliares para el código host |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Numero de packs | 22 packs que cubren 26 idiomas |
| Tamano del repositorio | 5,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Pocket TTS de Kyutai, un sistema de síntesis de voz con clonación condicionada a una referencia de audio. El pipeline se divide en cuatro grafos LiteRT por pack: un codificador del audio de referencia, un generador autorregresivo y dos etapas de decodificación del codec Mimi. El código host se encarga de tokenizar el texto, mantener la caché de generación y ensamblar el audio final. Los pesos se almacenan en FP16 mientras que las entradas y salidas de los grafos son FP32.

Los packs se organizan en tres grupos: los checkpoints oficiales de Kyutai (inglés, neerlandés, francés, alemán, italiano, portugués y español), packs comunitarios para checo, estonio, griego, gujarati, indonesio, japonés, coreano, mandarín, persa, polaco, turco, galés y wolof, y un pack multilingüe índico compartido que cubre inglés, hindi, kannada, malayo, marathi, tamil y telugu. Existen dos packs separados para inglés (checkpoint de enero y checkpoint más reciente), y los packs de coreano y galés emplean modelos más grandes de 24 capas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) con salida mono a 24 kHz.
- Clonación de voz zero-shot condicionada a un WAV de referencia corto.
- Cobertura de 26 idiomas, incluyendo lenguas de bajos recursos (wolof, galés, gujarati, estonio).
- Ejecución en dispositivo mediante LiteRT, sin dependencia de GPU.
- Preprocesamiento de texto específico por pack, definido en el manifiesto `pocket-tts.json`.
- Gestión de caché de generación autorregresiva en el código host.
- Verificación de integridad mediante checksums SHA-256 en el manifiesto.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el modelo se integra como grafos `.tflite` en apps Android o iOS y sintetiza texto localmente sin enviar datos a servidores, usando el pack del idioma del usuario.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y asistentes de navegación que requieren síntesis de baja latencia en el propio dispositivo.
- Asistentes de voz embebidos en dispositivos IoT: el formato LiteRT y los pesos FP16 permiten ejecutar la síntesis en hardware con recursos limitados, manteniendo el audio en 24 kHz.
- Localización de contenido multilingüe: generación de audiolibros, avisos o cursos en cualquiera de los 26 idiomas soportados, eligiendo el pack correspondiente desde el índice.
- Clonación de voz para personalización: creación de una voz sintética a partir de una grabación de referencia del propio usuario, útil en herramientas de accesibilidad o avatares.
- Prototipado de pipelines TTS en investigación: el notebook de Colab incluido permite validar el flujo completo con un WAV de referencia antes de desplegar en producción.
- Sistemas de respuesta por voz en kioscos o terminales: síntesis local con latencia controlada y sin coste de API por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el notebook de exportación verifica cada grafo sobre LiteRT CPU y que el rendimiento depende del dispositivo y del checkpoint.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa, ya que el objetivo es la inferencia en CPU mediante LiteRT; no se especifican requisitos de memoria.
- GPU recomendadas: no disponible; el flujo documentado se valida sobre LiteRT CPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LiteRT (intérprete `.tflite`) con código host para tokenización, caché de generación y ensamblado de audio; notebook de Colab para pruebas.
- Latencia y throughput: no disponibles; dependen del dispositivo y del checkpoint según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Pocket TTS LiteRT FP16 | no disponible | no disponible | 26 | no disponible | LiteRT on-device |
| Pocket TTS original (Kyutai) | no disponible | no disponible | 7 oficiales | según repositorio de Kyutai | PyTorch |
| Otros TTS on-device | no disponible | no disponible | variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio; cada pack remite a la licencia de su checkpoint original, por lo que es imprescindible revisarla antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación comunitaria.
- El rendimiento depende del dispositivo y del checkpoint; no se publican métricas de latencia ni de calidad (MOS, similitud de hablante).
- La clonación de voz exige permiso explícito del hablante de la grabación de referencia; su uso indebido plantea riesgos de suplantación.
- Los packs de coreano y galés usan modelos de 24 capas, con mayor coste computacional que el resto.
- No se detallan sesgos por idioma, riesgo de alucinación fonética ni limitaciones de longitud de texto.
- El código host debe gestionar la tokenización y la caché de generación; el usuario es responsable de la integración correcta del pipeline.
- La cobertura de 26 idiomas no implica calidad homogénea; los packs comunitarios pueden tener un rendimiento inferior a los oficiales de Kyutai.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Serkali-sudo/Pocket-TTS-LiteRT-FP16
- Pocket TTS original (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Exportador LiteRT de john-rocky: https://github.com/john-rocky/LiteRT-Models/tree/main/pockettts
