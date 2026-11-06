# mradermacher/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon-OCR2 0.8B es un modelo especializado en reconocimiento óptico de caracteres (OCR) y análisis de documentos, desarrollado originalmente por Typhoon AI (equipo vinculado a SCB 10X) y publicado en Hugging Face como `typhoon-ai/typhoon-ocr2-0.8b`. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está diseñado específicamente para tareas de extracción de texto, análisis de maquetación (layout analysis) y reconocimiento de tablas, con especial atención al tailandés y el inglés.

Con aproximadamente 752 millones de parámetros totales (0,75B) y una licencia Apache 2.0, se posiciona como una alternativa ligera y de código abierto para pipelines de digitalización documental. Su tamaño reducido permite desplegarlo en entornos con recursos limitados, algo relevante para empresas que necesitan procesar grandes volúmenes de documentos sin depender de APIs externas.

La relevancia actual del modelo radica en la combinación de especialización (OCR y parsing documental), soporte bilingüe tailandés-inglés y un formato GGUF que facilita la inferencia local. Es una opción interesante para equipos que trabajan con documentación en tailandés y necesitan una solución autoalojada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector mmproj, basado en transformer) |
| Parámetros totales | 752.393.024 (≈0,75B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj en f16 y Q8_0 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por las etiquetas y el nombre del repositorio, se trata de un modelo multimodal (incluye un fichero `mmproj`, proyector multimodal) orientado a entrada de imagen y salida de texto, típico de los sistemas OCR basados en modelos visión-lenguaje. El tamaño de 752 millones de parámetros sugiere una arquitectura compacta, probablemente un transformer con un codificador visual ligero y un decodificador de lenguaje.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas indican especialización en OCR, document parsing, layout analysis y table recognition, lo que sugiere un entrenamiento orientado a tareas documentales con datos en tailandés e inglés.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Análisis de maquetación (layout analysis): identificación de bloques de texto, secciones y estructuras.
- Reconocimiento de tablas (table recognition) y extracción de su contenido.
- Parsing de documentos estructurados (document parsing).
- Procesamiento bilingüe tailandés-inglés.
- Entrada multimodal (imagen + texto) mediante el proyector `mmproj`.
- Formato conversacional (etiqueta `conversational`), apto para interacción por turnos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).

No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Digitalización de facturas y recibos en tailandés: el modelo puede extraer texto y estructura de tablas de documentos comerciales, lo que facilita la contabilidad automatizada en empresas que operan en Tailandia.
- Procesamiento de formularios administrativos: gracias al análisis de maquetación, puede identificar campos y valores en documentos escaneados, agilizando la entrada de datos en sistemas de gestión.
- Extracción de tablas de informes financieros: la capacidad de table recognition permite convertir tablas impresas en datos estructurados para su análisis posterior.
- Archivo y búsqueda documental: integrado en un pipeline de OCR, permite indexar grandes volúmenes de documentos escaneados en tailandés e inglés para búsqueda full-text.
- Atención al cliente con documentación adjunta: el modelo puede procesar imágenes de documentos enviadas por usuarios y extraer la información relevante para resolver consultas.
- Despliegue en el borde (edge) o en local: con cuantizaciones Q4_K_M de ~0,6 GB, puede ejecutarse en portátiles o servidores modestos sin GPU dedicada, útil para oficinas con requisitos de privacidad de datos.
- Preprocesamiento para pipelines de RAG: extracción de texto de PDFs e imágenes antes de la indexación en sistemas de recuperación aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB para cuantizaciones Q2_K a Q8_0; ~1,6 GB para f16. El proyector multimodal añade 0,2-0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060 o superiores ofrecen margen amplio. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, y servidores compatibles con GGUF. Para el modelo original, transformers con soporte multimodal.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de 0,75B, se espera baja latencia en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon-OCR2 0.8B (esta ficha) | ~0,75B | no disponible | th, en | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2-VL-2B | ~2B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF (comunitario) |
| Donut (base) | ~0,2B | no disponible | en (principalmente) | MIT | safetensors |
| TrOCR (base) | ~0,3B | no disponible | en | MIT | safetensors |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a características estructurales; para una evaluación rigurosa sería necesario consultar benchmarks específicos de OCR y parsing documental.

## Limitaciones y advertencias

- El modelo está especializado en OCR y parsing documental; no es un modelo de propósito general y su rendimiento en otras tareas será limitado.
- Idiomas soportados oficialmente: tailandés e inglés. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación en la extracción de texto: como todo modelo generativo, puede inventar contenido no presente en la imagen, especialmente en documentos de baja calidad o con tablas complejas.
- No se han publicado datos sobre sesgos; cabe esperar sesgos derivados de los datos de entrenamiento, posiblemente centrados en documentos tailandeses.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del OCR; se recomienda Q4_K_M o superior para producción.
- No hay información sobre la longitud de contexto, lo que limita la planificación de documentos largos.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria extensa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Página de descargas del cuantizador: https://hf.tst.eu/model#typhoon-ocr2-0.8b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
