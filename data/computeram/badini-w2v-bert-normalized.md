# computeram/badini-w2v-bert-normalized

## Resumen

Badini Kurdish ASR — Normalized (Wav2Vec2-BERT) es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario computeram y publicado en HuggingFace bajo licencia MIT. Se trata de un ajuste fino de facebook/w2v-bert-2.0, el codificador de voz basado en arquitectura wav2vec2-bert (conformer) de Meta, al que se le ha añadido una cabeza CTC para transcripción de voz a texto. El modelo resultante tiene 605.750.150 parámetros y ocupa 2,4 GB en el repositorio.

El modelo está especializado en badini, una variedad del kurdo kurmanji (código ISO kmr) escrita en alfabeto árabe, y se presenta explícitamente como un recurso para entornos de bajos recursos lingüísticos. A diferencia de otros ajustes finos de ASR, el repositorio incluye un módulo complementario de normalización de texto (`badini_normalize.py`) que aplica gestión de puntuación, expansión de números en badini y unificación de variantes de caracteres y palabras sobre la salida cruda del modelo.

Su relevancia actual es doble: por un lado, cubre una variedad lingüística con muy poca cobertura en sistemas ASR comerciales; por otro, su tamaño (unos 606 millones de parámetros) permite inferencia en GPU de consumo e incluso en CPU, lo que facilita el despliegue en contextos con recursos limitados. La información pública disponible sobre el modelo es escasa: no se han publicado resultados de benchmarks, detalles del conjunto de entrenamiento ni métricas de error.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (conformer) con cabeza CTC para ASR; ajuste fino de facebook/w2v-bert-2.0 |
| Parámetros totales | 605.750.150 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de audio; entrada a 16 kHz mono, sin límite de segmento documentado) |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas ni GGUF; el repositorio contiene pesos safetensors) |
| Idiomas soportados | kmr (kurdo kurmanji), orientado a la variedad badini con escritura árabe |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 2,4 GB); incluye el módulo Python `badini_normalize.py` |
| Pipeline | automatic-speech-recognition |
| Biblioteca | transformers |
| Modelo base | facebook/w2v-bert-2.0 |

## Arquitectura y entrenamiento

El modelo parte de facebook/w2v-bert-2.0, un codificador de voz autorregresivo de tipo wav2vec2-bert con arquitectura conformer, preentrenado por Meta sobre audio sin etiquetar y pensado para extracción de representaciones acústicas multilingües. Sobre ese backbone, el autor ha realizado un ajuste fino supervisado con una cabeza de clasificación CTC (Connectionist Temporal Classification), que es el esquema estándar en `Wav2Vec2BertForCTC` dentro de la biblioteca transformers. La entrada debe ser audio mono a 16 kHz, y cualquier otra frecuencia de muestreo debe remuestrearse antes de la inferencia.

No se dispone de información sobre el número de tokens de audio utilizados en el ajuste fino, la composición del conjunto de datos, el número de hablantes, la procedencia de las transcripciones ni si se aplicaron técnicas de aumento de datos o regularización. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, lo cual es esperable en un modelo CTC de ASR. La innovación diferencial respecto a otros ajustes finos de ASR es el módulo de normalización de texto incluido en el repositorio, que se ejecuta después de la decodificación CTC y aplica tres transformaciones: tratamiento de puntuación, expansión de números en badini y unificación de caracteres y variantes léxicas. Este módulo es un componente Python descargable con `hf_hub_download` y debe cargarse dinámicamente por el usuario, ya que no forma parte del grafo del modelo.

## Capacidades

- Transcripción de voz a texto en badini (kurdo kurmanji escrito en alfabeto árabe).
- Decodificación CTC sobre logits del modelo, con obtención de la transcripción cruda mediante `processor.batch_decode`.
- Postprocesado de la transcripción mediante el módulo `badini_normalize`: puntuación, expansión de números en badini y normalización de variantes de caracteres y palabras.
- Procesamiento de audio a 16 kHz mono (requisito estricto de entrada).
- Inferencia en CPU y GPU, dado el tamaño moderado del modelo.
- Compatibilidad con la API estándar de transformers (`Wav2Vec2BertForCTC`, `Wav2Vec2BertProcessor`) y con el ecosistema de HuggingFace Hub.
- No se documenta soporte de tool calling, function calling, comportamiento de agente, razonamiento multi-paso, visión, audio generativo, diarización de hablantes, marcas de tiempo a nivel de palabra ni detección de idioma.
- No se documenta capacidad multilingüe: el único idioma declarado en la ficha es kmr.

## Casos de uso

- Transcripción de entrevistas y testimonios orales: el modelo convierte grabaciones en badini a texto escrito en alfabeto árabe, con el pipeline de normalización aplicado para obtener puntuación y números legibles.
- Archivado y digitalización de patrimonio oral: instituciones culturales pueden transcribir colecciones de audio histórico en kurdo badini para hacerlas indexables y consultables por texto.
- Subtitulado de vídeo y medios: integración en un flujo donde se extrae el audio a 16 kHz mono, se transcribe con el modelo y se sincroniza el texto resultante como subtítulos para contenido en badini.
- Investigación lingüística y creación de corpus: generación de transcripciones anotadas para estudios fonéticos, léxicos o sociolingüísticos sobre la variedad badini, que cuenta con pocos recursos digitales.
- Dictado y accesibilidad: entrada de texto por voz en aplicaciones destinadas a hablantes de badini, incluyendo herramientas de accesibilidad para personas con dificultades motoras.
- Búsqueda sobre contenido hablado: transcripción previa de un archivo de audio para habilitar búsqueda por palabras clave en podcasts, radios comunitarias o archivos sonoros.
- Servicios públicos y atención ciudadana: transcripción de llamadas o mensajes de voz en regiones kurdo-parlantes, siempre que se cumplan los requisitos de privacidad y consentimiento aplicables.
- Generación de datos etiquetados para otros sistemas: las transcripciones producidas pueden servir como pseudoetiquetas para entrenar o evaluar modelos ASR adicionales en variedades relacionadas del kurdo.
- Preprocesado en pipelines de bajo recurso: al ser un modelo de 606 millones de parámetros, puede ejecutarse en el mismo entorno que otras etapas del pipeline sin requerir hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye valores de WER (word error rate), CER (character error rate), MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones cuantitativas con modelos alternativos. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 605.750.150 parámetros: aproximadamente 2,42 GB en fp32, 1,21 GB en fp16/bf16 y 0,61 GB en int8 (los tipos de cuantización no están publicados; son estimaciones derivadas del recuento de parámetros).
- VRAM total recomendada, incluyendo activaciones y buffers de audio: del orden de 4 a 6 GB en fp32 y de 2 a 3 GB en fp16 para audios de duración moderada. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp32, como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4090, A10, L4, A100 o H100. En fp16 el margen es mayor y cabría en GPUs de 4 GB.
- Cabe en GPU de consumo: sí. El modelo es apto para RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, e incluso para GPUs con 4 GB de VRAM si se usa precisión reducida.
- Inferencia en CPU: viable para clips cortos, dado el tamaño del modelo, aunque el rendimiento dependerá del número de hilos y de la longitud del audio.
- Opciones de despliegue: transformers con `Wav2Vec2BertForCTC` y `Wav2Vec2BertProcessor` es la única vía documentada en la model card. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje decoder-only y no a codificadores acústicos con cabeza CTC. La conversión a ONNX mediante optimum no está documentada para este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / contexto | Idiomas | Licencia | Rendimiento ASR en badini |
|---|---|---|---|---|---|
| computeram/badini-w2v-bert-normalized | 605.750.150 | Audio 16 kHz mono, segmento no especificado | kmr (badini) | MIT | No disponible |
| facebook/w2v-bert-2.0 (modelo base) | 580 M aproximadamente, según la documentación del modelo base; no verificado en esta ficha | Audio 16 kHz mono | Multilingüe (representaciones acústicas) | MIT (según la ficha del modelo base) | No disponible; el modelo base no está ajustado para transcripción directa |
| openai/whisper-large-v3 | 1.550 M | Ventanas de 30 segundos | 99 idiomas | MIT | No disponible; no cubre de forma específica la variedad badini |
| facebook/mms-1b-all | 1.000 M | Audio sin límite fijo documentado en esta ficha | Más de 1.100 idiomas, incluye kmr | CC-BY-NC-4.0 | No disponible |

Nota: los datos de los modelos comparados proceden de sus respectivas fichas públicas y no se han verificado experimentalmente en el contexto de esta ficha. La licencia CC-BY-NC-4.0 de MMS restringe el uso comercial, a diferencia de la licencia MIT de este modelo.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación (WER, CER) ni benchmarks, por lo que no es posible cuantificar su precisión real frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad.
- No se documenta la composición del conjunto de entrenamiento: se desconoce el número de hablantes, la distribución de acentos, la proporción de géneros, las condiciones de grabación y si hay dominios sobrerrepresentados. Esto impide evaluar sesgos de hablante, de registro o de dialecto dentro del propio badini.
- Riesgo de alucinación y de bucles de repetición, un comportamiento conocido en modelos CTC entrenados con pocos datos, especialmente con audio ruidoso, con música de fondo o con habla no correspondiente al dominio de entrenamiento.
- La salida cruda del modelo no incluye puntuación ni números normalizados; es necesario aplicar el módulo `badini_normalize.py` para obtener un texto utilizable, tal y como indica la model card.
- Restricción de formato de entrada estricta: el audio debe ser mono a 16 kHz. No remuestrear correctamente degradará la transcripción.
- Cobertura limitada a un único idioma declarado (kmr, variedad badini). No hay evidencia de funcionamiento en otras variedades del kurdo como el sorani, ni en kurmanji escrito en alfabeto latino.
- No se documentan marcas de tiempo, diarización de hablantes, detección de idioma ni puntuación de confianza, lo que limita su uso directo en pipelines que requieran alineación temporal.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base facebook/w2v-bert-2.0 y de los datos de audio utilizados en el ajuste fino, que no se documentan.
- El tamaño del repositorio (2,4 GB) y la necesidad de descargar y ejecutar dinámicamente un módulo Python externo añaden fricción al despliegue en entornos con políticas estrictas de ejecución de código.
- No hay información sobre el mantenimiento del repositorio ni sobre versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/computeram/badini-w2v-bert-normalized
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- La búsqueda web realizada no ha devuelto enlaces relevantes al modelo (papers, blogs, repositorios o demos): los resultados obtenidos corresponden a páginas genéricas del buscador y no contienen información sobre badini-w2v-bert-normalized. No se han encontrado, por tanto, enlaces adicionales que citar.
