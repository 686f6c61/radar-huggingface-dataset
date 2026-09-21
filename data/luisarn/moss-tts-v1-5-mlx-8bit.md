# luisarn/MOSS-TTS-v1.5-MLX-8bit

## Resumen

MOSS-TTS-v1.5-MLX-8bit es una conversión comunitaria a formato MLX del modelo de síntesis de voz OpenMOSS-Team/MOSS-TTS-v1.5, publicada por el usuario luisarn. Se trata de un modelo de texto a voz (TTS) de aproximadamente 8.490 millones de parámetros, cuantizado a 8 bits en modo afín con tamaño de grupo 64, y pensado para ejecución local en Apple Silicon mediante la librería mlx-audio. El objetivo del repositorio es cubrir un hueco: en el momento de la conversión no existía ninguna publicación cuantizada en MLX del modelo delay de 8B de MOSS-TTS v1.5, solo variantes Local-Transformer.

El modelo conserva las capacidades del original, entre ellas la clonación de voz a partir de un audio de referencia y la generación multilingüe. La model card declara soporte para los mismos 31 idiomas del modelo upstream, con etiquetas explícitas para chino, cantonés (yue), inglés, portugués, francés, alemán, español, japonés y coreano. La cuantización a 8 bits reduce el peso en disco y permite una velocidad de generación superior a la del modelo en bf16 sobre el mismo hardware.

La relevancia de esta ficha es práctica: es un artefacto de despliegue (no un modelo nuevo), con licencia Apache 2.0 heredada del modelo base, que permite ejecutar TTS multilingüe con clonación de voz en un Mac sin GPU dedicada. El rendimiento medido en un Apple M4 Max con 128 GB de memoria unificada es de aproximadamente 1,5x tiempo real, frente a 0,8x del modelo en bf16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta de modelo moss_tts_delay (generación de tokens de audio con patrón de retardo) |
| Parametros totales | 8.489.841.664 (~8,49 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (única cuantización publicada en este repositorio) |
| Idiomas soportados | 31 idiomas según el modelo upstream; etiquetados en HuggingFace: zh, yue (cantonés), en, pt, fr, de, es, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repositorio de 9,2 GB) |
| Tarea | text-to-speech |
| Libreria de inferencia | mlx-audio (API Python y CLI) |
| Modelo base | OpenMOSS-Team/MOSS-TTS-v1.5 |
| Herramienta de conversion | mlx_audio.convert (--q-bits 8, modo affine, group size 64) con mlx-audio 0.5.5 y mlx 0.32.2 |
| Hardware objetivo | Apple Silicon (MLX) |
| Fecha de publicacion | 21 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la información proporcionada. La etiqueta de modelo moss_tts_delay apunta a un esquema de generación de tokens de audio basado en un patrón de retardo (delay pattern), habitual en modelos TTS que predicen múltiples flujos de tokens de códec de forma escalonada. El número de parámetros (8,49 mil millones) corresponde al modelo delay de 8B de la familia MOSS-TTS v1.5. No se especifican en la documentación disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Lo que sí está documentado es la transformación realizada por el autor de la conversión: cuantización afín de 8 bits con tamaño de grupo 64, aplicada sobre los pesos del modelo base y exportada al formato de MLX. La model card advierte de que los resultados de generación pueden diferir ligeramente de la referencia en PyTorch debido a los operadores de MLX y al muestreo. Los pesos del MOSS Audio Tokenizer se descargan automáticamente por mlx-audio en la primera ejecución, por lo que el repositorio de 9,2 GB no incluye necesariamente ese componente.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con salida de audio a la frecuencia de muestreo indicada por el modelo.
- Clonación de voz: acepta un audio de referencia (`ref_audio`) para reproducir la identidad vocal del hablante.
- Etiquetado opcional de idioma en la llamada de generación (por ejemplo, Cantonese, Portuguese, French).
- Generación multilingüe: mismo conjunto de 31 idiomas del modelo upstream, con etiquetas declaradas para chino, cantonés, inglés, portugués, francés, alemán, español, japonés y coreano.
- Inferencia local en Apple Silicon con memoria unificada, sin depender de GPUs NVIDIA ni de servicios en la nube.
- Integración mediante API Python (`mlx_audio.tts.load` y `model.generate`) y mediante interfaz de línea de comandos (`python -m mlx_audio.tts.generate`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de visión o audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Clonación de voz para locuciones corporativas: partiendo de una muestra de audio del locutor autorizado, el modelo puede generar narraciones completas en varios idiomas manteniendo el timbre, útil para doblaje de materiales formativos o vídeos internos.
- Audiolibros y contenido largo en varios idiomas: al soportar chino, inglés, español, francés, alemán, portugués, japonés y coreano, un mismo pipeline puede producir versiones localizadas de un mismo texto sin cambiar de modelo.
- Asistentes de voz embebidos en aplicaciones de escritorio para macOS: al ejecutarse con mlx-audio sobre Apple Silicon, el modelo puede integrarse en una app local que sintetice respuestas sin enviar texto a servidores externos.
- Accesibilidad: conversión de documentos y artículos a audio para personas con discapacidad visual, con la posibilidad de clonar la voz de un familiar o de un locutor de referencia autorizado.
- Prototipado rápido de productos de voz en un equipo de desarrollo: medir calidad y latencia con pesos de 8 bits antes de decidir si se despliega la versión bf16 en infraestructura de producción.
- Generación de voces para vídeo y podcasts: producción de pistas de narración en varios idiomas a partir de un único guion, con control de la voz mediante una muestra de referencia.
- Pruebas de regresión de pipelines TTS: comparar la salida de esta cuantización con la referencia en PyTorch o bf16 para cuantificar la degradación introducida por los 8 bits antes de fijar una versión.
- Evaluación de modelos TTS en investigación: al ser un artefacto Apache 2.0 ejecutable en portátil, sirve como punto de comparación frente a otros sistemas de síntesis en experimentos de calidad o de similitud de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento cuantitativo aportado por la model card es una medida de velocidad en un Apple M4 Max con 128 GB de memoria unificada y caché caliente, sobre una frase de 5-6 segundos de audio: aproximadamente 1,5x tiempo real con los pesos de 8 bits, frente a aproximadamente 0,8x tiempo real con los pesos en bf16. No se proporcionan métricas de calidad (MOS, similitud de hablante, WER) ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: los pesos de 8 bits ocupan aproximadamente 8,5 GB; hay que sumar el tokenizador de audio (descargado aparte) y las estructuras de inferencia, por lo que conviene reservar del orden de 10-12 GB de memoria unificada como mínimo práctico.
- Equipos recomendados: Apple Silicon con memoria unificada de 16 GB o superior. La medición publicada corresponde a un Apple M4 Max con 128 GB, con 1,5x tiempo real.
- Configuración cómoda: 32 GB o más de memoria unificada, que deja margen para procesos concurrentes y para el tokenizador de audio.
- ¿Cabe en hardware de consumo? Sí, en Macs con chip de la familia M (M1 y posteriores) siempre que la memoria unificada sea suficiente; no es ejecutable en GPU NVIDIA mediante CUDA porque el repositorio está en formato MLX.
- Opciones de despliegue: mlx-audio 0.5.5 o posterior (API Python y CLI `python -m mlx_audio.tts.generate`), con mlx 0.32.2 o posterior. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: aproximadamente 1,5x tiempo real en Apple M4 Max (128 GB), es decir, unos 5-6 segundos de audio en torno a 4 segundos de cómputo para una frase corta. No se publican cifras de throughput en lote ni de latencia en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luisarn/MOSS-TTS-v1.5-MLX-8bit (este) | ~8,49 mil millones | MLX safetensors, 8-bit affine group 64 | No disponible | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| OpenMOSS-Team/MOSS-TTS-v1.5 (modelo base) | No disponible en la informacion (familia 8B delay) | PyTorch (bf16) | No disponible | Apache 2.0 | HuggingFace, mantenido por OpenMOSS-Team |
| Variantes Local-Transformer v1.5 en mlx-community | No disponible | MLX | No disponible | No disponible | HuggingFace; son las únicas variantes v1.5 en MLX mencionadas en la model card |
| Otras alternativas TTS de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

La comparación significativa que documenta el autor es frente al propio modelo base en bf16: la versión de 8 bits es más rápida (1,5x frente a 0,8x tiempo real en M4 Max) y ocupa menos espacio, a cambio de posibles diferencias menores de calidad que el autor recomienda verificar con una comparación A/B.

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta una evaluación de sesgos. Al ser un modelo TTS multilingüe, la calidad y el acento pueden variar de forma desigual entre idiomas y variedades dialectales.
- Riesgo de alucinación: en TTS se manifiesta como pronunciación incorrecta, omisiones, repeticiones o artefactos acústicos, especialmente en textos largos, idiomas con pocos datos o entradas con números y siglas.
- Diferencias respecto a la referencia: los resultados de generación pueden diferir ligeramente de la implementación en PyTorch por el uso de operadores y muestreo de MLX. La cuantización a 8 bits puede introducir diferencias adicionales de calidad frente a bf16.
- Discrepancia de idiomas: la metadata de HuggingFace etiqueta 9 idiomas, mientras que la model card afirma soporte para los 31 idiomas del modelo upstream. Conviene verificar el comportamiento real idioma por idioma antes de asumir cobertura completa.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el usuario final debe cumplir la normativa aplicable en materia de voz, datos biométricos y derechos de imagen, especialmente al usar la clonación de voz.
- Riesgo de uso indebido de la clonación: la función `ref_audio` permite imitar voces; es imprescindible contar con consentimiento explícito del hablante y aplicar medidas de trazabilidad en producción.
- Dependencia de hardware: al estar en formato MLX, no se puede desplegar en GPU NVIDIA ni en la mayoría de infraestructuras cloud x86 con CUDA. Eso limita su uso en producción a entornos Apple Silicon o a una reconversión manual a otro formato.
- Madurez del artefacto: el repositorio no tiene descargas ni likes registrados, es una conversión comunitaria no oficial y el propio autor indica que el tokenizador de audio se descarga por separado en la primera ejecución, lo que añade una dependencia de red no versionada en el repositorio.
- Cifras de rendimiento limitadas a un único equipo: la medición de 1,5x tiempo real procede de un Apple M4 Max con 128 GB; en máquinas con menos memoria o chips anteriores la latencia será sensiblemente mayor o la ejecución inviable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luisarn/MOSS-TTS-v1.5-MLX-8bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Repositorio de mlx-audio: https://github.com/Blaizzy/mlx-audio
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente portales de noticias sin relación con el artefacto.
