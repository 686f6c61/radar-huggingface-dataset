# mradermacher/Uni-MuMER-Qwen3.5-2B-GGUF

## Resumen

Uni-MuMER-Qwen3.5-2B-GGUF es la versión cuantizada en formato GGUF del modelo Uni-MuMER-Qwen3.5-2B, un modelo visión-lenguaje de aproximadamente 1.880 millones de parámetros (1.881.825.088 según los pesos en safetensors) especializado en reconocimiento óptico de matemáticas manuscritas (handwritten math OCR) y conversión a LaTeX. El modelo original lo desarrolla el usuario phxember, mientras que esta reedición en GGUF la produce mradermacher, un conocido cuantizador de la comunidad de Hugging Face. La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal especializado en hardware modesto, algo poco habitual en el nicho de OCR matemático.

El modelo se construye sobre una base Qwen3.5-2B, lo que le aporta la arquitectura transformer multimodal del linaje Qwen, con un proyector multimodal (mmproj) separado que se distribuye como fichero adicional en los repositorios GGUF. El propósito concreto es transcribir expresiones matemáticas escritas a mano a código LaTeX, una tarea con aplicaciones directas en digitalización de apuntes, investigación y educación.

La licencia Apache 2.0 y la disponibilidad de cuantizaciones desde Q2_K hasta f16 (con versiones imatrix en un repositorio aparte) lo convierten en una opción práctica para integrar OCR matemático en pipelines locales sin depender de servicios en la nube. El idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje basada en Qwen3.5-2B (proyector multimodal mmproj) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16; versiones imatrix (i1) en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors vía transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Qwen3.5 en su variante de 2B parámetros, adaptada como modelo visión-lenguaje mediante un proyector multimodal que traduce representaciones visuales al espacio del modelo de lenguaje. En el ecosistema GGUF, este proyector se distribuye como fichero `mmproj` independiente (en Q8_0 o f16), que debe cargarse junto con los pesos del modelo para habilitar la entrada de imágenes. El repositorio GGUF no incluye los pesos del proyector dentro de los ficheros de cuantización principales, sino como artefacto separado.

Los datos de entrenamiento provienen del dataset `phxember/Uni-MuMER-Data`, orientado a la tarea de reconocimiento de matemáticas manuscritas y su conversión a LaTeX. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia adaptación multimodal sobre Qwen3.5.

## Capacidades

- Reconocimiento óptico de matemáticas manuscritas (handwritten math OCR) y conversión a código LaTeX.
- Procesamiento de entrada visual (imágenes de expresiones matemáticas) combinado con generación de texto.
- Generación de texto conversacional, heredada de la base Qwen3.5-2B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: enfoque específico en la tarea HMER (Handwritten Mathematical Expression Recognition); no se documentan modos de pensamiento, audio ni otras modalidades.

## Casos de uso

- Digitalización de apuntes manuscritos: el modelo recibe una fotografía o escaneo de una expresión matemática escrita a mano y devuelve el código LaTeX correspondiente, lo que permite convertir cuadernos físicos en documentos editables.
- Investigación y publicación científica: transcripción de borradores con fórmulas manuscritas a LaTeX listo para insertar en artículos o preprints, reduciendo el trabajo manual de reescritura.
- Herramientas educativas: corrección automática de ejercicios matemáticos manuscritos, comparando la transcripción LaTeX del alumno con la solución esperada.
- Accesibilidad: conversión de material matemático manuscrito a texto estructurado que pueda ser leído por lectores de pantalla o procesado por herramientas de síntesis.
- Pipelines de datos para entrenamiento: extracción masiva de expresiones matemáticas de documentos escaneados para construir corpus de investigación, aprovechando las cuantizaciones ligeras (Q4_K_S, ~1,3 GB) para procesamiento por lotes en CPU.
- Integración en aplicaciones de toma de notas: un editor que, al capturar una imagen de una fórmula, la sustituye automáticamente por su representación LaTeX, ejecutando el modelo localmente gracias a su reducido tamaño.
- Despliegue en dispositivos con recursos limitados: al caber en cuantizaciones de 1,1-2,1 GB, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, habilitando asistentes matemáticos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K) hasta 2,1 GB (Q8_0) para los pesos del modelo, más 0,5-0,8 GB adicionales para el fichero mmproj necesario en tareas de visión. En total, alrededor de 1,6-2,9 GB según la combinación elegida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para despliegues de mayor volumen, A100 o H100 no son necesarias por el reducido tamaño, aunque permitirían alta concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF que soporte modelos multimodales con mmproj. Para la versión original en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Uni-MuMER-Qwen3.5-2B-GGUF | ~1,88 B | no disponible | HMER / math OCR a LaTeX | Apache 2.0 | GGUF |
| Uni-MuMER-Qwen3.5-2B (original) | ~1,88 B | no disponible | HMER / math OCR a LaTeX | Apache 2.0 | safetensors |
| Uni-MuMER-Qwen3.5-2B-i1-GGUF | ~1,88 B | no disponible | HMER / math OCR a LaTeX | Apache 2.0 | GGUF (imatrix) |

No se dispone en la información proporcionada de modelos alternativos de la misma categoría (OCR matemático manuscrito) con los que establecer una comparación cuantitativa de rendimiento. Las tres variantes listadas corresponden al mismo modelo base en distintos formatos de cuantización.

## Limitaciones y advertencias

- El modelo está declarado únicamente para inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un modelo especializado en una tarea concreta (OCR matemático manuscrito), su rendimiento en tareas generales de texto o visión será inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación en la transcripción: puede generar LaTeX sintácticamente válido pero incorrecto respecto a la imagen de entrada, especialmente con escritura ambigua o imágenes de baja calidad.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-2B hereda los sesgos potenciales de su base y de los datos de entrenamiento, no detallados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B del que deriva.
- El fichero mmproj es imprescindible para tareas de visión; cargar solo los pesos principales sin él deshabilitará la capacidad multimodal.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en conversaciones o documentos largos.
- El modelo tiene pocas descargas (474) y ningún "like" en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3.5-2B-GGUF
- Modelo base original: https://huggingface.co/phxember/Uni-MuMER-Qwen3.5-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3.5-2B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/phxember/Uni-MuMER-Data
- Página de resumen del cuantizador: https://hf.tst.eu/model#Uni-MuMER-Qwen3.5-2B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
