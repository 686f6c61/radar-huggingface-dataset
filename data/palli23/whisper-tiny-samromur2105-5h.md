# palli23/whisper-tiny-samromur2105-5h

## Resumen

whisper-tiny-samromur2105-5h es un ajuste fino del modelo Whisper-Tiny de OpenAI (unos 39 M de parámetros) sobre un subconjunto anidado de 5 horas del corpus islandés samrómur-21.05, un conjunto de voz leída en islandés. Lo publica el usuario palli23 en HuggingFace con licencia cc-by-sa-4.0 y un único idioma declarado: islandés (is). Forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), cuyo objetivo es medir hasta qué punto un modelo ASR muy pequeño y entrenado con pocos datos puede competir con modelos multilingües mucho mayores en una lengua concreta.

El modelo resuelve un problema muy concreto: reconocimiento automático del habla en islandés con un coste computacional mínimo. Con 37.760.640 parámetros y un repositorio de 0,2 GB, es desplegable en CPU, en GPUs de gama baja e incluso en dispositivos con recursos limitados, algo relevante para una lengua de bajos recursos donde los modelos grandes multilingües suelen rendir peor de lo esperado por la escasez de datos de entrenamiento.

La relevancia actual del checkpoint es doble. Por un lado, es un artefacto de investigación reproducible dentro de un estudio de escalado (comparación de tamaños de modelo frente a horas de audio). Por otro, es un punto de partida práctico y barato para pipelines de transcripción en islandés. Hay que tener en cuenta que se ha publicado con cero descargas y cero "likes" en el momento de la consulta, y que la model card es mínima: no incluye resultados de WER/CER, datos de entrenamiento detallados ni instrucciones de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (familia Whisper-Tiny; detalles de configuración no disponibles en la model card) |
| Parametros totales | 37.760.640 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo ASR; Whisper procesa ventanas de audio, no texto de contexto largo) |
| Tipos de cuantizacion | no disponible en la información proporcionada; el repositorio solo contiene safetensors (repo de 0,2 GB) |
| Idiomas soportados | islandés (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-08-29 / 2026-09-15 |

## Arquitectura y entrenamiento

Whisper-Tiny es un transformer encoder-decoder con aproximadamente 39 M de parámetros que consume espectrogramas mel de 80 canales y genera tokens de texto de forma autorregresiva. Este checkpoint concreto no documenta cambios estructurales: se trata de un ajuste fino del modelo base, no de una arquitectura nueva. La model card no especifica hiperparámetros de ajuste (learning rate, número de épocas, tamaño de batch, precisión de entrenamiento) ni si se congeló alguna parte de la red.

En cuanto a los datos, el autor indica que el ajuste se hizo sobre un "subconjunto anidado de 5 horas" del pool de escalado samrómur-21.05, un corpus islandés entrenado de forma independiente. Es decir, se trata de un régimen de datos muy reducido, diseñado precisamente para estudiar la curva de escalado de las horas de audio. No se detalla en la información disponible la composición exacta de esas 5 horas (horas de habla, número de locutores, condiciones de grabación, proporción de train/validación/test), ni si hubo técnicas de regularización o aumento de datos. Tampoco hay información sobre fases de alineación o ajuste con preferencias; en ASR ese tipo de etapas no aplica de la forma habitual en modelos de lenguaje.

## Capacidades

- Transcripción de voz a texto en islandés: es la función principal del modelo, heredada de la familia Whisper.
- Reconocimiento de habla sobre ventanas de audio cortas, con la segmentación típica de los pipelines Whisper.
- Generación de texto con puntuación y mayúsculas según el comportamiento estándar de Whisper (no verificado específicamente para este checkpoint en la información disponible).
- Posible capacidad de traducción de audio a texto, puesto que el modelo base es multilingüe, aunque el ajuste fino se ha realizado solo en islandés y no hay evidencia publicada de que conserve esa habilidad.
- Tool calling / function calling: no disponible; no es una capacidad de un modelo ASR.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, el modelo declara únicamente islandés (is).
- Capacidades especiales (modo "thinking", visión, audio-vision, etc.): no disponibles; solo entrada de audio, salida de texto.
- Marcas de tiempo a nivel de palabra o de segmento: no documentadas para este checkpoint.

## Casos de uso

- Transcripción de reuniones y notas de voz en islandés: el modelo convierte grabaciones cortas en texto con un coste de cómputo mínimo, lo que permite procesar lotes grandes de audio en CPU o en una GPU modesta sin planificar capacidad adicional.
- Generación de subtítulos para vídeo en islandés: al ser un modelo de 37,7 M de parámetros, se puede ejecutar por lotes sobre una biblioteca de vídeos y generar pistas de subtítulos en formato SRT a partir de la salida segmentada, como paso previo a una revisión humana.
- Bases de un sistema de dictado local y privado: al caber en un portátil, permite transcribir sin enviar audio a servicios en la nube, algo relevante en contextos sanitarios, legales o administrativos con requisitos de confidencialidad.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo histórico de radio, pódcast o entrevistas en islandés para permitir búsqueda por texto completo, aprovechando el bajo coste por hora de audio del modelo.
- Análisis de conversaciones en centros de contacto: transcripción de llamadas en islandés para extraer métricas, palabras clave y motivos de contacto; el tamaño reducido permite desplegarlo junto al sistema de telefonía sin GPUs dedicadas.
- Prototipado rápido en investigación sobre lenguas de bajos recursos: sirve como referencia de "modelo pequeño" en experimentos de escalado, comparación de estrategias de aumento de datos o evaluación de corpus islandeses.
- Componente de voz en asistentes o interfaces de accesibilidad: transcripción de comandos o dictado en islandés en aplicaciones de escritorio y móviles, donde el presupuesto de memoria y batería es la restricción principal.
- Preetiquetado de datos para anotación humana: generar transcripciones iniciales de un corpus islandés para que los anotadores las corrijan, con la advertencia de que la calidad del preetiquetado debe validarse con una muestra antes de confiar en él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite explícitamente al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026) para la metodología y los resultados de WER/CER, pero esos números no se han facilitado en la información consultada. No se debe asumir ningún valor de WER, CER, MMLU ni de benchmarks equivalentes para este checkpoint.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,15 GB en float32 (37,76 M de parámetros) y unos 0,08 GB en float16. Sumando buffers de audio (espectrograma mel), caché de atención y overhead del runtime, el consumo total típico se mantiene por debajo de 1 GB, aunque no hay cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funcionan sin problema GTX 1650, RTX 3050, RTX 4090, T4, A100 o H100. En estas últimas, el cuello de botella será el preprocesado de audio y no el modelo.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, e incluso puede ejecutarse en iGPU con memoria compartida.
- CPU: la inferencia en CPU es viable y probablemente el modo de despliegue más habitual para este tamaño.
- Opciones de despliegue: transformers (PyTorch) con los pesos safetensors; conversión a CTranslate2 para faster-whisper; conversión a GGUF para whisper.cpp; integración vía servidores compatibles con la API de OpenAI. No hay evidencias publicadas de uso con vLLM o TGI, que no están orientados a modelos ASR encoder-decoder de este tipo.
- Latencia y throughput: no disponible. No se han publicado medidas de tiempo real ni de audio procesado por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana/contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-samromur2105-5h (este) | 37,76 M | Ventana de audio tipo Whisper-Tiny; valor exacto no documentado | Islandés (is) | cc-by-sa-4.0 | HuggingFace, repo de 0,2 GB, 0 descargas |
| Whisper-Tiny original (OpenAI) | ~39 M | Ventanas de audio de 30 s (configuración estándar) | Multilingüe (~99 idiomas) | Apache-2.0 (según la publicación original) | Ampliamente distribuido |
| Whisper-Base (OpenAI) | ~74 M | Ventanas de audio de 30 s | Multilingüe | Apache-2.0 | Ampliamente distribuido |
| Otros checkpoints del pool samrómur-21.05 | no disponible | no disponible | Islandés | no disponible | no disponible en la información proporcionada |

No se dispone de valores de WER para ninguno de los modelos islandeses comparables, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Cualquier afirmación sobre la precisión relativa de este checkpoint frente a Whisper-Tiny original o frente a modelos islandeses mayores requeriría consultar el artículo de ICASSP 2026.

## Limitaciones y advertencias

- Entrenamiento con solo 5 horas de audio: es un régimen de datos muy reducido, por lo que cabe esperar un WER notablemente superior al de modelos ajustados con decenas o cientos de horas. No hay cifras publicadas que lo confirmen o desmientan.
- Dominio restringido: el corpus samrómur-21.05 es voz leída; el rendimiento puede degradarse en habla espontánea, conversaciones solapadas, acentos no representados, habla infantil o audio con ruido y reverberación.
- Sesgos de representación: no se documenta la distribución de edad, género, procedencia geográfica ni condición de los locutores del subconjunto de 5 horas, por lo que no se puede evaluar la equidad del modelo entre grupos de hablantes.
- Riesgo de alucinación en ASR: los modelos Whisper pueden generar texto plausible en tramos de silencio, ruido o música, y entrar en bucles de repetición. Es imprescindible filtrar y validar las transcripciones antes de usarlas en producción.
- Un solo idioma: cualquier audio que no sea islandés queda fuera del ámbito declarado del modelo; no se ha verificado que conserve capacidades multilingües del modelo base.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone atribución y obligación de compartir las obras derivadas bajo la misma licencia. Esto puede ser un obstáculo para productos propietarios que no quieran liberar sus derivados; conviene revisarlo con asesoría legal. Además, la licencia del corpus samrómur subyacente puede añadir condiciones propias que no se detallan aquí.
- Ausencia de validación comunitaria: cero descargas y cero likes, sin métricas de evaluación publicadas en la model card, lo que dificulta estimar su calidad antes de desplegarlo.
- Model card mínima: no se documentan hiperparámetros, composición exacta del dataset, particiones de evaluación ni procedimiento de normalización de texto, lo que complica la reproducibilidad.
- Sin garantías de marcas de tiempo: no se documenta soporte de timestamps a nivel de palabra, algo crítico si se van a generar subtítulos sincronizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur2105-5h
- Artículo de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). Enlace no disponible en la información proporcionada.
- Corpus samrómur-21.05: enlace no disponible en la información proporcionada.
- Repositorio de código, demo o espacio de inferencia: no disponible en la información proporcionada.
