# carlesonielfa/isOCR-0.8B-alpha2-GGUF

## Resumen

isOCR 0.8B alpha2 es un modelo de lenguaje afinado (fine-tune) a partir de Qwen3.5-0.8B, desarrollado por Carles Onielfa Pérez para realizar OCR enriquecido ("rich clipboard OCR") dentro de la aplicación isoboard. El modelo está empaquetado en formato GGUF y se distribuye como un ajuste especializado del modelo base de Qwen, con 752.393.024 parámetros reales según los pesos en safetensors y un repositorio de 0,9 GB.

La propuesta del modelo no es competir en capacidades generales, sino resolver una tarea concreta: extraer y estructurar texto de capturas de pantalla o portapapeles con contexto enriquecido. Al partir de una base de 0,8B, el coste de inferencia es bajo y puede ejecutarse en hardware modesto, lo que encaja con un uso de escritorio o integrado en una aplicación.

Es relevante ahora por su licencia restrictiva y su enfoque vertical: no es un modelo de propósito general, sino un componente de producto con condiciones de uso muy acotadas (uso personal e interno gratuito, redistribución sujeta a acuerdo). La información pública disponible es escasa: no hay benchmarks, idiomas declarados ni pipeline especificado, y el modelo se encuentra en fase alpha2 con solo 44 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla la variante exacta |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio distribuye pesos cuantizados en GGUF; no se detallan los niveles concretos) |
| Idiomas soportados | no disponible |
| Licencia | isocr-internal-use-with-personal-permission (PolyForm Internal Use 1.0.0 con permiso adicional de uso personal y de salida) |
| Formato de pesos | GGUF (modelo base Qwen3.5-0.8B; pesos originales en safetensors según metadatos) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-0.8B, por lo que hereda la arquitectura transformer del modelo base de Qwen. No se especifica en la información disponible si se trata de un transformer denso estándar o de una variante con atención lineal u otras innovaciones del linaje Qwen3.5. El número de parámetros reales (752 millones) es coherente con un modelo de aproximadamente 0,8B.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente indica que el ajuste está orientado a "rich clipboard OCR" para isoboard, lo que sugiere un entrenamiento sobre pares de imágenes/texto o capturas de pantalla y sus transcripciones estructuradas, aunque esto no se confirma explícitamente. Tampoco se documentan innovaciones técnicas como decodificación especulativa o modos de razonamiento.

## Capacidades

- Generación de texto y extracción de contenido a partir de entradas de OCR enriquecido, orientada al portapapeles de isoboard.
- Conversación multi-turno (el repositorio incluye la etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito, aunque el uso previsto (OCR) implica procesamiento de imágenes a través de un proyector visual mencionado en la licencia ("matching vision projector").

## Casos de uso

- Extracción de texto de capturas de pantalla en isoboard: el modelo se integra en la aplicación para convertir imágenes del portapapeles en texto estructurado, aprovechando su ajuste específico para esta tarea.
- Digitalización de notas y documentos escaneados en flujos de trabajo personales: al ser un modelo de 0,8B, puede ejecutarse localmente en un portátil y procesar imágenes sin enviar datos a la nube.
- Procesamiento interno de documentos en empresas: la licencia permite uso interno gratuito, por lo que equipos pueden desplegarlo en sus propios servidores para tareas de OCR sin coste de licencia.
- Automatización de extracción de datos de facturas o recibos en un pipeline interno: el modelo puede transcribir el contenido y el equipo puede post-procesar la salida con reglas propias.
- Asistencia a personas con discapacidad visual: integrado en herramientas de escritorio, puede leer en voz alta el contenido de capturas de pantalla, siempre que se respete la licencia de uso personal.
- Prototipado de aplicaciones de OCR para desarrolladores: el formato GGUF permite cargarlo con llama.cpp u Ollama para experimentar con la calidad de transcripción antes de comprometerse con un proveedor comercial.
- Generación de texto conversacional de bajo coste: aunque no es su especialidad, su base Qwen3.5-0.8B permite mantener diálogos simples en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 752 millones de parámetros en GGUF, las cuantizaciones de 4 bits ocupan aproximadamente 0,4-0,5 GB, y las de 8 bits alrededor de 0,8 GB; los pesos en safetensors requieren unos 1,5 GB en FP16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para despliegue en servidor, una A100 o H100 no es necesaria y estaría infrautilizada.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera una latencia baja en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| isOCR 0.8B alpha2 | 752 M | no disponible | PolyForm Internal Use 1.0.0 + permiso personal | GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros fine-tunes de OCR de ~1B | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos de OCR en el rango de 0,8B en la información proporcionada. La comparación más directa es con su modelo base Qwen3.5-0.8B, que conserva licencia Apache 2.0 y capacidades generales, mientras que isOCR restringe el uso y especializa el comportamiento.

## Limitaciones y advertencias

- Licencia restrictiva: la redistribución de los archivos del modelo, incluido su empaquetado en productos, requiere un acuerdo separado con legal@isoboard.app; la compra de la app isoboard no incluye derechos de redistribución.
- El uso comercial de las salidas de OCR está permitido, pero sujeto a los derechos sobre el contenido de entrada.
- Modelo en fase alpha2: solo 44 descargas y 0 likes, sin validación comunitaria ni benchmarks publicados.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se documenta la longitud de contexto, lo que limita la planificación de cargas de documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje de pequeño tamaño, especialmente en transcripciones de texto denso o con fuentes poco legibles.
- Posibles sesgos derivados del dataset de entrenamiento, no documentados.
- La licencia "other" con nombre personalizado puede generar fricción en auditorías de compliance; conviene revisar LICENSE.md y ADDITIONAL-PERMISSION.md antes de integrarlo.
- El material upstream de Qwen conserva Apache 2.0, pero el fine-tune añade restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carlesonielfa/isOCR-0.8B-alpha2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia completa: LICENSE.md (referenciado en el repositorio)
- Permiso adicional: ADDITIONAL-PERMISSION.md (referenciado en el repositorio)
- Atribución y modificaciones: NOTICE.txt (referenciado en el repositorio)
- Términos Apache 2.0 de Qwen: APACHE-2.0-QWEN.txt (referenciado en el repositorio)
