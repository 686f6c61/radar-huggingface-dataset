# Rabe3/kemetone

## Resumen

KemeTone es un modelo de síntesis de voz (text-to-speech) especializado en árabe egipcio en su variante caireña, desarrollado por el usuario Rabe3 y publicado en HuggingFace con licencia Apache 2.0. Se trata de un fine-tune del modelo Nabra-82M, que a su vez está construido sobre Kokoro-82M, la arquitectura de síntesis de voz ligera de la familia Kokoro. Su objetivo principal es resolver un problema concreto: la mayoría de los sistemas de TTS en árabe se limitan al árabe estándar moderno (MSA), que suena artificial para los hablantes nativos de dialectos como el egipcio. KemeTone está diseñado para reproducir los rasgos fonéticos del dialecto caireño, incluyendo la pronunciación de consonantes como ج como /ɡ/ en lugar de /ʤ/, ق como /ʔ/ en contextos coloquiales, y las transformaciones de ث, ذ y ظ, manteniendo al mismo tiempo excepciones cultas para vocabulario aprendido o de origen coránico.

El modelo tiene aproximadamente 82 millones de parámetros, genera audio monofónico a 24 kHz y funciona en CPU o cualquier GPU CUDA, con un requisito de memoria de unos 300 MB de VRAM. La arquitectura es la de StyleTTS2 con decodificador ISTFTNet, y el modelo acepta texto árabe diacritizado como entrada. Su contexto de procesamiento está limitado a 510 tokens, lo que obliga a dividir entradas muy largas en frases. Está disponible en el repositorio de HuggingFace Rabe3/kemetone, con un peso de 327 MB en formato fp32 y un embedding de voz incluido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 / Kokoro (decodificador ISTFTNet) |
| Parámetros totales | 81.8 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 510 tokens |
| Tipos de cuantización | no disponible (solo se proporciona fp32) |
| Idiomas soportados | Árabe egipcio (dialecto caireño) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (327 MB, fp32) y voice embedding .pt |

## Arquitectura y entrenamiento

KemeTone se basa en la arquitectura StyleTTS2, que combina un codificador de texto con un decodificador ISTFTNet para generar audio de forma eficiente. El modelo es un fine-tune de Nabra-82M-v0.1, que a su vez parte de Kokoro-82M, una arquitectura de síntesis de voz de 82 millones de parámetros que funciona en CPU y GPU. La principal innovación de KemeTone reside en su front-end de conversión de grafemas a fonemas (G2P) específico para el árabe egipcio, que incluye léxicos de excepciones para vocabulario culto y coránico que no se transforma según las reglas coloquiales. El modelo fue entrenado sobre las cadenas de fonemas generadas por este G2P, por lo que su rendimiento depende de usar el front-end incluido en el paquete, no de un fonetizador árabe genérico.

Los detalles exactos de los datos de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO) no se han publicado en la información disponible. Sin embargo, la model card indica que el modelo genera voz a 24 kHz, con una sola voz femenina, y que el sistema está optimizado para producir habla continua de 15 a 20 segundos sin costuras de fragmentación. El entrenamiento se centró en el dialecto caireño, con atención especial a la pronunciación de las consonantes faríngeas ع y ح, que suelen omitirse en fonetizadores de propósito general.

## Capacidades

- Generación de voz femenina natural y conversacional en árabe egipcio (caireño), con una entonación cercana a la de un hablante nativo en lugar de un locutor de noticias.
- Síntesis de habla continua de 15 a 20 segundos en una sola pasada, sin costuras de corte.
- Pronunciación correcta del dialecto egipcio: ج como /ɡ/, ق como /ʔ/ en contextos coloquiales, ث como /t/, ذ como /z/, ظ como /zˤ/.
- Manejo de excepciones cultas y vocabulario coránico: palabras como القُرْآن (con /q/) o ثَقَافَة (con /s/) se pronuncian según la norma culta, no con la regla coloquial.
- Pronunciación explícita de las faríngeas ع y ح, que otros fonetizadores suelen omitir.
- Soporte de entrada con diacríticos árabes (tashkil) para mejorar la precisión de las vocales; la entrada sin diacríticos también funciona pero con peor calidad.
- Ejecución eficiente en CPU o GPU, con un bajo consumo de memoria (~300 MB de VRAM).
- No soporta multi-speaker, clonación de voz, ni estilos de habla; solo una voz femenina fija.

## Casos de uso

- **Narración de audiolibros en árabe egipcio**: KemeTone puede leer capítulos completos de libros en dialecto egipcio, manteniendo una entonación natural y una duración de 15-20 segundos por pasada, lo que facilita la generación de audiolibros sin pausas perceptibles entre fragmentos.
- **Asistentes de voz para aplicaciones locales**: se puede integrar en aplicaciones de asistente personal para usuarios egipcios, proporcionando respuestas habladas en su dialecto, mejorando la aceptación y la experiencia del usuario frente a voces MSA.
- **Contenido educativo para el aprendizaje del dialecto**: los estudiantes de árabe egipcio pueden escuchar pronunciaciones correctas de palabras y frases en el dialecto, incluyendo las excepciones cultas, lo que facilita el aprendizaje de la fonética real.
- **Generación de avisos y mensajes automáticos**: en sistemas de atención al cliente o notificaciones de voz para el mercado egipcio, KemeTone puede producir mensajes de forma natural y coloquial, evitando el tono formal de los TTS estándar.
- **Traducción y localización de contenido multimedia**: doblaje o subtitulado con voz para vídeos, podcasts o anuncios dirigidos a la audiencia egipcia, donde un acento estándar resultaría artificial.
- **Herramientas de accesibilidad para personas con discapacidad visual**: lectores de pantalla que lean contenido en árabe egipcio con una voz familiar y natural, mejorando la experiencia de usuario frente a voces MSA.
- **Investigación en dialectología y procesamiento del habla**: permite estudiar la pronunciación del dialecto caireño y compararla con el MSA, así como generar datos de audio para entrenar otros modelos de reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad de voz (MOS), comparativas con otros sistemas de TTS o pruebas de precisión fonética. La única indicación de rendimiento es la capacidad de generar habla continua de 15 a 20 segundos y el bajo consumo de recursos.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 300 MB para inferencia en GPU.
- **GPU recomendadas**: cualquier GPU CUDA con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). También funciona en CPU sin necesidad de GPU.
- **CPU**: el modelo puede ejecutarse en CPU, como se indica en la model card, con un rendimiento aceptable para inferencia en tiempo casi real.
- **Opciones de despliegue**: se puede usar directamente con la librería `kokoro` y el front-end `kemetone` en Python. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un modelo de TTS, no un LLM.
- **Latencia y throughput**: no se proporcionan datos concretos de latencia o throughput. Dado el tamaño de 82M parámetros, en CPU se espera una velocidad de generación de voz en tiempo real o ligeramente inferior; en GPU, mucho más rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Lengua | Licencia | Entrada | Observaciones |
|---|---|---|---|---|---|
| **KemeTone** | 81.8 M | Árabe egipcio (caireño) | Apache 2.0 | Texto diacritizado | Fine-tune de Nabra-82M, voz femenina, CPU/GPU |
| **Kokoro-82M** | 82 M | Inglés (y otros con fine-tunes) | Apache 2.0 | Texto en inglés | Modelo base, multi-voz, no soporta dialectos árabes |
| **Nabra-82M-v0.1** | 82 M | Árabe (MSA) | Apache 2.0 | Texto árabe estándar | Base para KemeTone, no maneja dialectos |

No se dispone de información sobre otros modelos TTS específicos para árabe egipcio que sean comparables directamente. La comparación se limita a los modelos base de la misma familia.

## Limitaciones y advertencias

- **Voz única**: no hay soporte multi-speaker, clonación de voz ni prompts de estilo. Solo una voz femenina fija.
- **Dialecto limitado**: está diseñado para el árabe egipcio de El Cairo (caireño), no para otros dialectos como el sa'idi, el alejandrino o el del Golfo.
- **Dependencia de los diacríticos**: si el texto no está diacritizado, el fonetizador adivina las vocales según el árabe estándar, lo que degrada la pronunciación. Se recomienda un diacritizador previo.
- **No soporta texto latino, dígitos ni inglés con cambio de código**: los números deben convertirse a palabras árabes antes de la síntesis.
- **Longitud máxima de entrada**: el contexto es de 510 tokens, por lo que los textos largos deben dividirse en frases.
- **Rango emocional limitado**: la voz es conversacional-neutra, sin gritos, susurros o canto.
- **Riesgo de mal uso**: la voz está modelada sobre una persona real; se prohíbe explícitamente el uso para suplantación, fraude, acoso, desinformación o autenticación de voz. Los usuarios deben etiquetar el contenido sintético cuando sea necesario.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe cumplir con las leyes de medios sintéticos y privacidad.

## Enlaces

- Modelo en HuggingFace: [Rabe3/kemetone](https://huggingface.co/Rabe3/kemetone)
- Modelo base: [oddadmix/Nabra-82M-v0.1](https://huggingface.co/oddadmix/Nabra-82M-v0.1)
- Modelo base original: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
