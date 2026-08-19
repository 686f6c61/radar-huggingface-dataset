# Sigmandndnns/TriStream-SVS-300M

## Resumen

TriStream-SVS-300M es un modelo de síntesis de voz (TTS) de código abierto desarrollado por Sigmandndnns, publicado bajo licencia Apache 2.0. Su principal innovación es una arquitectura de tres flujos paralelos (source, filter y residual) que incorpora el modelo fuente-filtro de la producción vocal como una restricción estructural dura, en lugar de dejar que la red descubra esa separación implícitamente. Esto permite un desentrelazado explícito entre el pitch (fuente glotal), el timbre (filtro del tracto vocal) y el ruido turbulento (respiración y fricativas), lo que facilita el control fino sobre cada componente de la voz.

El modelo integra además un codificador de hablante para clonación de voz zero-shot, un encoders de letras/fonemas, predictores de duración y pitch para generar actuaciones nuevas, y una cabeza adversarial con gradiente reverso que empuja la representación compartida a ser lo menos informativa posible sobre la identidad del cantante, como mecanismo anti-memorización. Con aproximadamente 300 millones de parámetros (inferido del nombre), el repositorio ocupa 706.2 GB, lo que sugiere la presencia de múltiples checkpoints o datos de entrenamiento, aunque no se especifica el formato de pesos.

Es relevante ahora porque aborda dos problemas críticos en TTS moderno: el control independiente de las características vocales (pitch, timbre, textura) y la mitigación de la memorización de identidades de los hablantes del conjunto de entrenamiento, un riesgo habitual en sistemas de clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tres flujos paralelos (source, filter, residual), fusion trunk de 8 capas, lyric encoder de 4 capas, speaker encoder convolucional y cabeza adversarial |
| Parametros totales | 300 millones (inferido del nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 706.2 GB) |

## Arquitectura y entrenamiento

La arquitectura de TriStream se divide en tres codificadores paralelos que procesan el mismo evento de audio sin intercambiar información hasta una etapa avanzada de la red. El Stream 1 (Source) consta de 3 capas transformer y recibe únicamente el contorno de pitch F0 en escala logarítmica y un flag binario de voz sonora/sorda, sin acceso al espectrograma ni a embeddings de timbre, lo que lo hace arquitectónicamente incapaz de representar la identidad del hablante. El Stream 2 (Filter) es el más profundo, con 5 capas transformer, y recibe el mel espectrograma junto con embeddings de identidad del cantante y de emoción/técnica, además de cross-attention contra el codificador de letras. El Stream 3 (Residual) tiene 2 capas transformer y procesa el ruido de respiración, las fricativas y la textura de articulación.

El codificador de letras es un transformer de 4 capas que convierte el texto en una representación que condiciona tanto al Stream 2 como al Fusion Trunk. El Fusion Trunk, de 8 capas, es el único punto donde los tres flujos se combinan, deliberadamente situado lo más tarde posible. La cabeza adversarial, un clasificador conectado a la salida del Fusion Trunk, intenta adivinar qué cantante produjo el audio; su gradiente se invierte mediante una capa de reversión de gradiente, empujando al trunk a degradar activamente su capacidad de ser identificado. El speaker encoder usa convoluciones dilatadas, bloques squeeze-excitation y attentive statistics pooling, entrenado con un objetivo contrastivo para crear un espacio de embeddings donde la cercanía corresponda a similitud de voz. Los predictores de duración y pitch operan en espacio logarítmico para manejar la distribución sesgada de las duraciones de fonemas.

## Capacidades

- Generación de voz sintética a partir de texto y condiciones de control (pitch, timbre, emoción).
- Clonación de voz zero-shot: extrae una "huella vocal" portable de un clip de referencia arbitrario, incluyendo voces no vistas durante el entrenamiento, mediante el speaker encoder con pooling estadístico atento.
- Desentrelazado estructural de componentes vocales: el pitch se controla independientemente del timbre, y el ruido de respiración se procesa por separado, permitiendo ajustes finos sin artefactos cruzados.
- Control de emoción y técnica vocal a través de embeddings específicos que condicionan el Stream 2 (filtro).
- Edición de audio existente: puede modificar pitch, timbre o textura de una grabación sin regenerar la actuación completa.
- Generación de actuaciones nuevas: los predictores de duración y pitch inventan timing y melodía cuando no hay ground-truth disponible.
- Mecanismo anti-memorización: la cabeza adversarial con gradiente reverso reduce la información de identidad en la representación compartida, disminuyendo el riesgo de que el modelo memorice a los hablantes del entrenamiento.

## Casos de uso

- Producción musical y doblaje: un ingeniero de sonido puede ajustar el pitch de una toma vocal sin alterar el timbre del cantante, o aplicar un timbre diferente manteniendo la melodía, gracias al desentrelazado estructural de los tres flujos.
- Narración de audiolibros personalizada: se clona la voz de un narrador con un clip de referencia corto (zero-shot) y se genera el audio del libro completo con control de emoción por capítulo, usando el speaker encoder y los embeddings de técnica.
- Asistentes virtuales con identidad propia: se entrena una voz sintética con timbre específico y se controla la expresividad en tiempo real mediante los embeddings de emoción, integrable en pipelines de TTS con latencia ajustable.
- Accesibilidad para personas con discapacidad del habla: se puede clonar la voz residual de un usuario a partir de una muestra breve y generar habla fluida con el mismo timbre, usando el speaker encoder con attentive statistics pooling.
- Videojuegos con diálogos dinámicos: los personajes generan líneas con pitch y emoción variables según el contexto del juego, sin necesidad de grabar múltiples tomas, gracias a los predictores de duración y pitch en espacio logarítmico.
- Investigación en desentrelazado de voz: el modelo sirve como banco de pruebas para estudiar la separación de fuente-filtro-ruido, ya que la arquitectura impone restricciones estructurales que facilitan el análisis de cada componente por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada.
- El tamaño del repositorio es de 706.2 GB, lo que sugiere que la distribución incluye múltiples checkpoints o datos de entrenamiento, aunque no se detalla el peso de cada archivo.
- Dado el tamaño estimado de 300 millones de parámetros, la inferencia podría caber en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, pero no hay datos confirmados.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de audio, es probable que requiera un framework específico de TTS, pero no se especifica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Desentrelazado | Clonacion zero-shot |
|---|---|---|---|---|---|
| TriStream-SVS-300M | 300M | no disponible | Apache 2.0 | Estructural (3 flujos) | Si |
| XTTS v2 (Coqui) | ~500M | no disponible | CPML (no comercial) | Parcial (embeddings separados) | Si |
| Tortoise-TTS | ~500M | no disponible | Apache 2.0 | No | Si (con fine-tuning) |
| VITS | ~100M | no disponible | MIT | No | No |

Nota: la comparativa se basa en características generales conocidas de estos modelos; no hay datos de benchmarks disponibles para TriStream que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Los idiomas soportados no están especificados; el modelo puede no funcionar correctamente con textos fuera del idioma de entrenamiento.
- No se han publicado benchmarks ni evaluaciones objetivas de calidad de audio, por lo que el rendimiento real en tareas como naturalidad o inteligibilidad es desconocido.
- El riesgo de alucinación en audio (artefactos, fonemas mal pronunciados) no está documentado.
- Aunque el mecanismo adversarial reduce la memorización de identidades, no la elimina por completo; el modelo podría aún generar voces que se asemejen a hablantes del entrenamiento en casos límite.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la seguridad del modelo para producción.
- El tamaño del repositorio (706.2 GB) puede dificultar la descarga y el despliegue en entornos con ancho de banda o almacenamiento limitados.
- No hay información sobre la composición del dataset de entrenamiento (número de hablantes, horas de audio, equilibrio de géneros), lo que impide evaluar sesgos potenciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sigmandndnns/TriStream-SVS-300M
- Imagen de arquitectura: https://file.garden/aKP04nPJ-0H0X3HE/tristream_architecture.png?v=1786473510718
