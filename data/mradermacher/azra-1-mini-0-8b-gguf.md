# mradermacher/Azra-1-Mini-0.8b-GGUF

## Resumen

Azra-1-Mini-0.8b es un modelo de visión-lenguaje (VLM) desarrollado por OttomanNLP, especializado en reconocimiento óptico de caracteres (OCR) para textos en otomano, turco y árabe. Con aproximadamente 752 millones de parámetros, es un modelo compacto orientado a la digitalización y transcripción de documentos históricos escritos en escritura árabe otomana. La versión GGUF aquí descrita, cuantizada por mradermacher, permite ejecutar el modelo en entornos locales con recursos limitados, manteniendo la compatibilidad con herramientas como llama.cpp, Ollama y vLLM.

El modelo base se apoya en la arquitectura de la familia Qwen (según las etiquetas del repositorio) e incorpora un proyector multimodal (mmproj) para procesar imágenes junto con texto. Su licencia Apache 2.0 facilita su uso comercial y académico sin restricciones significativas. La relevancia actual radica en la necesidad de preservar y digitalizar patrimonio cultural otomano, donde los modelos OCR multilingües específicos son escasos.

Esta ficha se centra en la versión cuantizada GGUF, que incluye múltiples niveles de cuantización (desde Q2_K hasta f16) y archivos mmproj para el componente de visión. Al ser un modelo de solo 0.8B, es viable en hardware de consumo, lo que lo hace accesible para investigadores y desarrolladores sin infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basado en Qwen (variante no especificada) |
| Parametros totales | 752.393.024 (aprox. 0,75 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Otomano (ott), turco (tr), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base OttomanNLP/Azra-1-Mini-0.8b. Las etiquetas del repositorio indican que pertenece a la familia Qwen y que es un modelo de vision-lenguaje, lo que sugiere un encoder de vision (probablemente ViT) combinado con un decoder transformer. El componente multimodal se evidencia por la presencia de archivos mmproj (proyector de vision) en la version GGUF.

En cuanto a los datos de entrenamiento, no se han publicado especificaciones sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se conocen innovaciones tecnicas particulares mas alla de su especializacion en OCR para lenguas historicas. La cuantizacion realizada por mradermacher es de tipo estatica (sin imatrix), segun se indica en la model card, y no afecta a la arquitectura subyacente.

## Capacidades

- Reconocimiento optico de caracteres (OCR) para textos en otomano, turco y arabe, tanto impresos como manuscritos.
- Procesamiento de imagenes junto con texto gracias a su naturaleza multimodal (vision-lenguaje).
- Generacion de texto en los idiomas soportados, aunque su enfoque principal es la transcripcion y traduccion de documentos historicos.
- Compatibilidad con herramientas de inferencia local como llama.cpp, Ollama y vLLM (segun las etiquetas del repositorio).
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues limitadas a los tres idiomas mencionados, con especial enfasis en otomano.

## Casos de uso

- Digitalizacion de archivos historicos otomanos: el modelo puede transcribir automaticamente documentos manuscritos o impresos en otomano, facilitando su busqueda y analisis en bibliotecas digitales. Su tamano reducido permite procesamiento por lotes en servidores modestos.
- Transcripcion de correspondencia diplomatica: investigadores de historia pueden usar el modelo para convertir cartas y tratados otomanos en texto digital editable, acelerando la investigacion academica.
- Generacion de subtitulos o descripciones para imagenes de documentos: al ser multimodal, puede combinar la informacion visual con el texto, util para catalogar colecciones de archivos con metadatos automaticos.
- Traduccion asistida de textos otomanos a turco moderno o arabe: aunque no se especifica si el modelo realiza traduccion directa, su conocimiento de los tres idiomas permite tareas de transliteracion o normalizacion.
- Integracion en pipelines de preservacion cultural: organizaciones como archivos nacionales pueden desplegar el modelo en entornos locales (via GGUF) para procesar grandes volumenes de imagenes sin depender de servicios en la nube.
- Educacion y divulgacion: el modelo puede utilizarse en plataformas educativas para convertir facsimiles otomanos en texto legible, facilitando el estudio de la lengua y la historia a estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre metricas como MMLU, HumanEval, GSM8K o metricas especificas de OCR (por ejemplo, CER o WER) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (0,6 GB) o Q8_0 (0,9 GB), el modelo cabe en GPUs con 2-4 GB de VRAM. La version f16 (1,6 GB) requiere al menos 4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Tambien puede ejecutarse en CPU con 8 GB de RAM para cuantizaciones bajas.
- Si cabe en consumer GPU: si, en todas las cuantizaciones excepto quizas f16 en GPUs muy antiguas con menos de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (segun etiquetas), ademas de cualquier framework compatible con GGUF (llama-cpp-python, ctransformers, etc.).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 0.8B, se espera una generacion de decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria (OCR multilingue para lenguas historicas). Modelos como TrOCR (Microsoft) o PaddleOCR son alternativas generales, pero no cubren especificamente el otomano. El modelo mas cercano podria ser Qwen2-VL (por su base), pero no hay datos comparativos publicados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente en documentos historicos, puede presentar sesgos hacia el registro escrito formal y limitaciones con variantes dialectales o caligrafias poco comunes.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir transcripciones incorrectas o inventar caracteres, especialmente en imagenes de baja calidad o con ruido.
- Limitaciones de contexto: no se conoce la longitud de contexto, pero al ser un modelo de 0.8B es probable que tenga una ventana reducida (tipicamente 4K-8K tokens), lo que limita el procesamiento de documentos muy extensos.
- Limitaciones de idioma: solo cubre otomano, turco y arabe; no es util para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia.
- Caveat de produccion: la cuantizacion estatica (sin imatrix) puede degradar ligeramente la calidad en tareas de OCR comparada con el modelo original en float16. Se recomienda probar con cuantizaciones Q8_0 o Q6_K para resultados mas fieles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Azra-1-Mini-0.8b-GGUF
- Modelo base: https://huggingface.co/OttomanNLP/Azra-1-Mini-0.8b
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos (FAQ): https://huggingface.co/mradermacher/model_requests
