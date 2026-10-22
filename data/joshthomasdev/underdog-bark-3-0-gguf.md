# joshthomasdev/underdog-bark-3.0-gguf

## Resumen

Underdog Bark 3.0 GGUF es una cuantización no oficial en formato GGUF Q8_0 de ConwayResearch/Underdog-Bark-3.0, un modelo de reconocimiento automático del habla (ASR) en inglés de aproximadamente 627 millones de parámetros y perteneciente a la familia Parakeet, según las etiquetas del repositorio. La conversión la firma el usuario joshthomasdev y está empaquetada específicamente para transcribe.cpp, el runtime en C++ de handy-computer.

El problema que resuelve es práctico: permitir la transcripción offline de audio en inglés con un peso de unos 0,7 GB, ejecutable en CPU o en GPU de gama baja sin depender de frameworks de Python. Frente a alternativas como Whisper, el interés está en el tamaño reducido y en un runtime nativo ligero, aunque el precio es un alcance funcional más estrecho: solo transcripción, solo inglés y sin utilidades adicionales documentadas.

La relevancia es limitada pero concreta: es una de las pocas distribuciones GGUF de este modelo base y está publicada con un pipeline de conversión reproducible (scripts bark_to_hf.py, convert-parakeet.py y transcribe-quantize) fijado a revisiones concretas. Ahora bien, en el momento de redactar esta ficha el repositorio no tiene descargas ni interacciones, y no se han publicado benchmarks, por lo que debe considerarse una conversión experimental pendiente de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR de la familia Parakeet (según etiquetas del repositorio); detalles internos de capas y atención no disponibles |
| Parametros totales | 627.052.166 (unos 627 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; al ser ASR, la ventana de audio la define el runtime transcribe.cpp |
| Tipos de cuantizacion | Q8_0 (8 bits); el repositorio solo distribuye esta cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (Q8_0); el pipeline genera safetensors F32 como paso intermedio |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | automatic-speech-recognition |
| Runtime documentado | transcribe.cpp (handy-computer) |
| Revision del modelo base | 85db2ad18ab41e534a222ee253c29191d77ed919 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: no se especifican el número de capas, el tipo de cabecera de decodificación (CTC, transducer u otra), ni la estrategia de atención. Las etiquetas del repositorio lo sitúan en la familia Parakeet, y el Conversor utiliza un script denominado convert-parakeet.py, lo que es coherente con esa familia, pero no se confirma ningún detalle estructural en la model card. Tampoco se documentan datos de entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo ajuste por RLHF o DPO.

Lo que sí está documentado es el proceso de conversión y cuantización. Se descarga el modelo base en la revisión indicada, se descomprime el archivo model.bark con bark_loader.py a safetensors F32, se reutilizan config.json y tokenizer.json del repositorio ConwayResearch/Underdog-Bark-3.0-Pro, se aplica un parche sobre transcribe.cpp (commit db678a0) para ejecutar convert-parakeet.py y, finalmente, se cuantiza a Q8_0 con transcribe-quantize. No se describe ninguna innovación técnica propia del modelo ni del proceso de cuantización más allá del formato estándar GGUF.

## Capacidades

- Transcripción de audio en inglés a texto, que es la única tarea declarada en el pipeline del repositorio.
- Ejecución offline mediante un runtime en C++ (transcribe.cpp), sin dependencias de Python en inferencia.
- Procesamiento por lotes de archivos de audio según lo permita la herramienta de línea de comandos del runtime.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documenta traducción, detección de idioma, diarización de hablantes ni marcas de tiempo.
- No es un modelo generativo de texto: no produce respuestas, resúmenes ni código.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo convierte audio a texto en local con un peso de 0,7 GB, lo que permite integrarlo en herramientas de escritorio sin enviar el audio a un servicio externo.
- Subtitulado de vídeos en inglés: se puede encadenar la salida del runtime con un segmentador propio para generar subtítulos, asumiendo que las marcas de tiempo, si existen, deben gestionarse en el pipeline y no están documentadas aquí.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones en inglés para alimentar posteriormente un motor de búsqueda o un clasificador de intenciones.
- Dictado y accesibilidad: integración en aplicaciones de escritorio que necesitan entrada por voz en inglés con latencia baja y sin conexión.
- Pipelines de datos para investigación en habla: generación de transcripciones a gran escala sobre corpus en inglés con un coste de cómputo reducido.
- Despliegue en dispositivos con recursos limitados: al caber en menos de 1 GB de pesos, es viable en mini-PC, portátiles sin GPU dedicada y entornos embebidos compatibles con el runtime.
- Transcripción de pódcasts y archivos multimedia: procesamiento batch de ficheros largos divididos en segmentos por la herramienta de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, comparaciones con Whisper ni evaluaciones sobre LibriSpeech, Common Voice u otros conjuntos, y el repositorio no adjunta informes de evaluación de la cuantización Q8_0 frente al modelo base en F32.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB o algo menos para los pesos Q8_0 (0,7 GB de fichero); con buffers del runtime, se puede estimar un uso de 1-1,5 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente a priori; no se documentan modelos concretos ni requisitos mínimos por parte del autor.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, así como en Apple Silicon mediante el runtime correspondiente.
- Inferencia en CPU: viable por el tamaño del modelo y por el enfoque nativo de transcribe.cpp; no se publican cifras de velocidad.
- Opciones de despliegue: transcribe.cpp es el único runtime documentado. No hay indicios de soporte en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje y su arquitectura ASR no forma parte de esos ecosistemas.
- Latencia y throughput: no disponibles; dependerán del hardware, de la duración del audio y de la implementación de decodificación del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato distribuido | Benchmarks publicados en la fuente |
|---|---|---|---|---|---|
| Underdog Bark 3.0 GGUF (esta ficha) | 627 M | Inglés | CC-BY-4.0 | GGUF Q8_0 | No disponibles |
| ConwayResearch/Underdog-Bark-3.0 (base) | 627 M | Inglés | CC-BY-4.0 | Formato original .bark | No disponibles en esta ficha |
| OpenAI Whisper large-v3 | 1.550 M (dato público del modelo original) | Multilingüe | MIT | Safetensors, GGUF y otras conversiones de terceros | No comparados aquí |
| NVIDIA Parakeet TDT 0.6B v2 | Unos 600 M (dato público del modelo original) | Inglés | CC-BY-4.0 | NeMo .nemo | No comparados aquí |

No se dispone de una comparación de calidad (WER) entre estos modelos en la información proporcionada; la tabla solo contrasta tamaño, licencia y formato de distribución. Cualquier elección entre ellos debería validarse con un conjunto de audio propio.

## Limitaciones y advertencias

- Solo admite inglés; no se ha documentado soporte de otros idiomas ni detección automática de idioma.
- Es una conversión no oficial: el autor del repositorio no es ConwayResearch, y la fidelidad de la cuantización Q8_0 respecto al modelo original no está evaluada.
- No hay benchmarks ni métricas de calidad publicadas; se desconoce el WER real en dominios con ruido, acentos o audio telefónico.
- El repositorio registra cero descargas y cero interacciones en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Riesgo de alucinación típico de los sistemas ASR: ante silencios, música o ruido puede generar texto inexistente, y no se documenta ningún mecanismo de mitigación.
- No se documentan puntuación, mayúsculas, marcas de tiempo ni diarización; si el pipeline los necesita, deben resolverse con herramientas adicionales.
- La licencia CC-BY-4.0 exige atribución; es compatible con uso comercial siempre que se cumplan las condiciones de la licencia y se conserve el aviso NOTICE del repositorio.
- La reproducibilidad depende de revisiones concretas del modelo base y de un parche sobre un commit específico de transcribe.cpp, lo que puede dificultar la reconstrucción si esos artefactos cambian.
- Solo se distribuye Q8_0; no hay variantes Q4 o Q5 para reducir aún más el consumo de memoria.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/joshthomasdev/underdog-bark-3.0-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0
- Repositorio de configuración y tokenizer utilizados: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Revisión del modelo base empleada: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0/tree/85db2ad18ab41e534a222ee253c29191d77ed919
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit del runtime empleado en la conversión: https://github.com/handy-computer/transcribe.cpp/commit/db678a0
