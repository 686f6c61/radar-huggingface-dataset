# mlx-community/Ming-3.0-tts-tiny-4bit

## Resumen

Ming-3.0-tts-tiny-4bit es una conversión al formato MLX del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por la comunidad mlx-community. Se trata de un sistema text-to-speech que genera audio a 44,1 kHz e incorpora voces predefinidas, clonación de voz y controles de estilo, todo ejecutable en local sobre Apple Silicon mediante la librería mlx-audio, sin dependencias de ONNX ni ejecución de código remoto en el tokenizador.

El repositorio contiene 8.981.004.468 parámetros en safetensors (unos 6,7 GB de pesos), pero solo el backbone de lenguaje está cuantizado a 4 bits: los módulos acústicos y los routers MoE del backbone conservan precisión en coma flotante. Esa decisión de diseño explica que el peso real en disco sea notablemente superior al que sugeriría un modelo de casi 9.000 millones de parámetros en 4 bits (aproximadamente 4,5 GB), y es un dato crítico a la hora de planificar memoria.

Su relevancia ahora es doble: por un lado, lleva un TTS de gran tamaño a inferencia totalmente offline en un Mac; por otro, demuestra un patrón de cuantización selectiva (backbone sí, decodificador acústico no) que evita la degradación típica de cuantizar módulos sensibles a la precisión. La licencia es MIT y el modelo se distribuye con arquitectura personalizada (`lingv3_tts`), lo que condiciona qué runtimes pueden cargarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lingv3_tts (arquitectura personalizada, `custom_code`), backbone de lenguaje con routers MoE más módulos acústicos y extractor de hablante CAMPPlus |
| Parametros totales | 8.981.004.468 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, aplicada únicamente al backbone de lenguaje; módulos acústicos y routers MoE en coma flotante |
| Idiomas soportados | no disponible (la model card solo cita una voz de ejemplo, `US_James`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), más `speaker_encoder/campplus.safetensors` |

Otros datos: frecuencia de muestreo de salida 44,1 kHz; tamaño del repositorio 6,7 GB; vector de embedding de hablante (`spk_emb`) de 192 valores admisible como alternativa a la extracción con CAMPPlus; región declarada `us`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. Lo que sí se describe es la topología: un backbone de lenguaje de tipo transformer con mezcla de expertos (los routers MoE se mencionan explícitamente y se mantienen en coma flotante) que actúa como núcleo generador, acoplado a módulos acústicos que producen la forma de onda a 44,1 kHz. La clonación de voz se resuelve con un codificador de hablante CAMPPlus empaquetado en el propio repositorio, ejecutado de forma nativa en MLX, y con la posibilidad de inyectar directamente un vector `spk_emb` de 192 dimensiones.

La innovación técnica destacable no está en el modelo original sino en el proceso de conversión: la cuantización a 4 bits se limita al backbone lingüístico, dejando intactos los módulos acústicos y los routers. Además, se ha eliminado la dependencia de paquetes ONNX (habituales en pipelines de speaker embedding) reimplementando la extracción de hablante en MLX, y el tokenizador se carga sin ejecutar código remoto, lo que reduce la superficie de riesgo en entornos de inferencia offline. No se han publicado detalles sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) a 44,1 kHz, con salida de audio directamente escribible a WAV mediante `mlx_audio.audio_io.write`.
- Voces integradas listas para usar (la model card ejemplifica con `US_James`); el catálogo completo no está documentado en la información disponible.
- Clonación de voz mediante extracción de hablante con CAMPPlus o mediante un vector `spk_emb` de 192 valores aportado por el usuario.
- Controles de estilo sobre la locución (el alcance concreto de esos controles no se detalla).
- Inferencia completamente offline sobre Apple Silicon con código MLX nativo.
- Carga del tokenizador sin ejecución de código remoto.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada, ni un modo "thinking"; se trata de un modelo especializado en TTS, no de un LLM conversacional.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Narración de audiolibros y contenido largo en local: el modelo genera voz a 44,1 kHz, una frecuencia propia de producción musical y de audio profesional, y puede ejecutarse sin conexión, lo que permite procesar manuscritos completos sin enviar texto a terceros.
- Doblaje y localización con clonación de voz: usando CAMPPlus sobre una muestra del hablante original o inyectando un `spk_emb` de 192 valores, se puede mantener la identidad vocal del actor en nuevas tomas o correcciones de guion.
- Asistentes de voz embebidos en aplicaciones macOS/iOS: al ejecutarse sobre MLX en Apple Silicon, la síntesis ocurre en el propio dispositivo, lo que encaja en productos con requisitos de privacidad o funcionamiento sin red.
- Accesibilidad y lectura de pantalla: integración en lectores que conviertan texto de documentos o interfaces en audio, con control de estilo para ajustar velocidad y expresividad según el contexto.
- Generación de locuciones para vídeo, podcast y publicidad: los controles de estilo permiten producir variantes de una misma frase (tono promocional, informativo, narrativo) sin regrabar al talento.
- Prototipado rápido de interfaces de voz (IVR, kioscos, chatbots telefónicos): permite iterar sobre guiones y flujos conversacionales antes de contratar una solución de TTS en la nube.
- Aumento de datos para entrenamiento de ASR: generación de corpus sintéticos con múltiples voces y estilos en un Mac, útil para cubrir dominios con pocas grabaciones reales.
- Pruebas de regresión de audio en CI sobre runners macOS: al no requerir GPU NVIDIA ni servicios externos, se pueden comparar muestras generadas entre versiones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, similitud de hablante, WER de transcripción inversa) ni comparaciones con otros sistemas TTS. Tampoco se proporcionan medidas de latencia ni de factor de tiempo real (RTF).

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos del backbone a 4 bits rondan los 4,5 GB, pero el repositorio completo ocupa 6,7 GB porque los módulos acústicos y los routers MoE se mantienen en coma flotante. Conviene reservar entre 10 y 12 GB de memoria unificada para inferencia con margen para activaciones.
- Plataforma: MLX solo se ejecuta en Apple Silicon, por lo que el despliegue está limitado a chips de la serie M. No hay soporte documentado para CUDA (A100, H100, RTX 4090) en este repositorio.
- ¿Cabe en hardware de consumo? Sí, en cualquier Mac con 16 GB de memoria unificada o más; 32 GB o más es recomendable para generaciones largas, procesamiento por lotes o para evitar swap al cargar los módulos en coma flotante.
- Opciones de despliegue: `mlx-audio` es la vía documentada (`from mlx_audio.tts import load`, `model.generate(...)`, escritura a WAV con `mlx_audio.audio_io.write`). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, algo esperable dada la arquitectura personalizada `lingv3_tts` y la dependencia de MLX.
- Nota operativa: el ejemplo de la model card carga el modelo desde una ruta local (`dev/ming3/converted/Ming-3.0-tts-tiny-4bit`), no desde el identificador del repositorio; en producción habrá que sustituirla por la ruta o el ID correctos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Ming-3.0-tts-tiny-4bit (este) | 8.981.004.468 (backbone 4 bits) | no disponible | safetensors MLX, mlx-audio | MIT | HuggingFace, 0 descargas |
| inclusionAI/Ming-3.0-tts-tiny (modelo base) | no disponible en la información proporcionada (misma arquitectura `lingv3_tts`) | no disponible | safetensors, pesos sin cuantizar | no disponible en la información proporcionada | HuggingFace |
| Otros TTS de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación significativa que permite la información disponible es frente al modelo base: misma arquitectura y mismo conjunto de módulos, pero con el backbone sin cuantizar, lo que implica mayor huella de memoria y, en principio, sin las posibles pérdidas de calidad asociadas a los 4 bits. No se dispone de datos de benchmarks ni de terceros comparables para establecer diferencias de calidad o velocidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas objetivas de calidad de síntesis ni de similitud de hablante, por lo que la evaluación debe hacerse con escucha propia antes de adoptarlo.
- La cuantización a 4 bits afecta solo al backbone, pero puede introducir degradaciones en prosodia o pronunciación que no están documentadas.
- Idiomas soportados no disponibles: la única voz citada (`US_James`) apunta a inglés; no hay confirmación de soporte de castellano ni de otras lenguas.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, ruidos, repeticiones o pronunciaciones inventadas ante texto atípico (siglas, números, nombres propios, puntuación ambigua).
- Clonación de voz: implica riesgos de suplantación y obligaciones legales (consentimiento, derechos de imagen y de voz) que la licencia MIT no resuelve por sí sola.
- Licencia MIT declarada en el repositorio, permisiva para uso comercial; sin embargo, esta licencia corresponde a la conversión y no se ha verificado en la información disponible la del modelo base, por lo que conviene confirmarla antes de un despliegue comercial.
- Dependencia de hardware Apple: al estar en formato MLX, no es portable a GPUs NVIDIA ni a servidores x86 convencionales, lo que limita el escalado horizontal en infraestructura cloud estándar.
- Arquitectura `custom_code` con `trust_remote_code` implícito en la librería: aunque el tokenizador se carga sin ejecutar código remoto, conviene auditar el código del paquete antes de desplegarlo en entornos sensibles.
- Madurez del artefacto: 0 descargas y 0 likes, publicada el 19 de octubre de 2026; es una conversión reciente y sin validación comunitaria.
- No se documentan límites de longitud de texto por petición ni de contexto, lo que impide planificar troceado de textos largos con criterio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Ming-3.0-tts-tiny-4bit
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Librería de inferencia: `mlx-audio` (identificador `mlx-audio`; no se ha encontrado URL en la información disponible)
- Papers, blogs, repositorios auxiliares y demos: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a un sitio de estadísticas de videojuegos y se han descartado por no ser pertinentes).
